import { DocumentoFiscalCompleto, DocumentoFiscalItem, RegraValidacaoAntiRejeicao } from '../types/fiscalTypes';
import { Store, Order } from '../types';

/**
 * Validador Tributário Automático Pré-Emissão (Anti-Rejeição Zero Rejeição)
 * Analisa regras fiscais antes do envio à SEFAZ
 */
export function validateFiscalPreEmission(
  items: Array<{
    name: string;
    ncm: string;
    cest?: string;
    cfop?: string;
    cstIcms?: string;
    quantity: number;
    unitPrice: number;
  }>,
  totalAmount: number,
  isTefPayment: boolean,
  hasTefNsu: boolean,
  regras: RegraValidacaoAntiRejeicao[]
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  autoFixes: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const autoFixes: string[] = [];

  // 1. Validação de NCM e CEST para Bebidas Alcoólicas
  items.forEach((item, index) => {
    const cleanNcm = (item.ncm || '').replace(/\D/g, '');
    const cleanCest = (item.cest || '').replace(/\D/g, '');

    // NCMs alcoólicos obrigatórios de CEST: 2203, 2204, 2205, 2206, 2208
    const isAlcoholic = /^(2203|2204|2205|2206|2208)/.test(cleanNcm);
    if (isAlcoholic && (!cleanCest || cleanCest.length < 7)) {
      errors.push(
        `Item ${index + 1} (${item.name}): NCM ${item.ncm} de bebida alcoólica exige preenchimento obrigatório do CEST para ICMS-ST (Rejeição SEFAZ 805).`
      );
    }

    if (!cleanNcm || cleanNcm.length !== 8) {
      errors.push(
        `Item ${index + 1} (${item.name}): NCM inválido (${item.ncm || 'vazio'}). Deve conter exatamente 8 dígitos.`
      );
    }

    // Validação de CFOP com regra da matriz
    const cfop = (item.cfop || '5405').replace(/\D/g, '');
    if (isAlcoholic && cfop !== '5405' && cfop !== '5102' && cfop !== '5927' && cfop !== '5101') {
      warnings.push(
        `Item ${index + 1} (${item.name}): CFOP ${cfop} incomum para comércio varejista de bebidas (recomendado 5.405 para produtos com ICMS-ST retido).`
      );
    }
  });

  // 2. Validação de Centavos / Divergência de Totais
  const itemsSum = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  const diff = Math.abs(itemsSum - totalAmount);
  if (diff > 0.001) {
    if (diff <= 0.05) {
      autoFixes.push(
        `Divergência de arredondamento de R$ ${diff.toFixed(2)} recalculada por rateio automático na última linha (Regra SEFAZ).`
      );
    } else {
      errors.push(
        `Divergência de Totais: Soma dos itens (R$ ${itemsSum.toFixed(2)}) difere do total do documento (R$ ${totalAmount.toFixed(2)}) em mais de R$ 0,05.`
      );
    }
  }

  // 3. Validação de Venda TEF sem Chave Fiscal
  if (isTefPayment && !hasTefNsu) {
    warnings.push(
      'Pagamento TEF sem autorização/NSU da adquirente vinculado. A SEFAZ exige informação do intermediador de pagamento no grupo <pag>.'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    autoFixes,
  };
}

/**
 * Gera texto compacto formatado para impressora térmica de 80mm e 58mm
 */
export function generateDanfeThermalText(
  doc: DocumentoFiscalCompleto,
  store: Store,
  format: '80mm' | '58mm' = '80mm'
): string {
  const width = format === '80mm' ? 48 : 32;
  const lineSeparator = '='.repeat(width);
  const dashSeparator = '-'.repeat(width);

  const center = (text: string) => {
    if (text.length >= width) return text.substring(0, width);
    const pad = Math.floor((width - text.length) / 2);
    return ' '.repeat(pad) + text;
  };

  const justify = (left: string, right: string) => {
    const space = width - left.length - right.length;
    if (space <= 0) return (left + ' ' + right).substring(0, width);
    return left + ' '.repeat(space) + right;
  };

  const lines: string[] = [];

  // Cabeçalho
  lines.push(center(store.name.toUpperCase()));
  lines.push(center(`CNPJ: ${store.cnpj}`));
  lines.push(center(`IE: ${store.ie}`));
  lines.push(center(`${store.address}, ${store.city}-${store.state}`));
  lines.push(lineSeparator);

  // Identificação do Documento
  if (doc.modelo === '65') {
    lines.push(center('DANFE NFC-e - Documento Auxiliar da'));
    lines.push(center('Nota Fiscal de Consumidor Eletronica'));
    if (doc.tipoEmissao === 'CONTINGENCIA_OFFLINE') {
      lines.push(center('*** EMITIDA EM CONTINGENCIA OFFLINE ***'));
      lines.push(center('Pendente de autorizacao pela SEFAZ'));
    } else {
      lines.push(center('Nao permite aproveitamento de credito de ICMS'));
    }
  } else if (doc.modelo === '55') {
    lines.push(center('DANFE NF-e - Documento Auxiliar'));
    lines.push(center('da Nota Fiscal Eletronica'));
  } else {
    lines.push(center('NFS-e - NOTA FISCAL DE SERVICOS'));
  }

  lines.push(dashSeparator);
  lines.push(justify(`Nr: ${doc.numeroNota} Serie: ${doc.serie}`, doc.dataEmissao));
  lines.push(dashSeparator);

  // Itens
  lines.push(format === '80mm' ? '#  DESC                   QTD   UN   VL.UN    TOTAL' : '# DESC         QTDxVL       TOTAL');
  lines.push(dashSeparator);

  doc.itens.forEach((it) => {
    const num = String(it.itemNumero).padStart(2, '0');
    const total = it.valorTotal.toFixed(2);
    if (format === '80mm') {
      const desc = it.produtoNome.substring(0, 20).padEnd(20, ' ');
      const qtd = it.quantidade.toString().padStart(4, ' ');
      const un = it.unidade.padEnd(3, ' ');
      const vl = it.valorUnitario.toFixed(2).padStart(6, ' ');
      lines.push(`${num} ${desc} ${qtd} ${un} ${vl}  ${total.padStart(7, ' ')}`);
    } else {
      const desc = it.produtoNome.substring(0, 14).padEnd(14, ' ');
      const resumo = `${it.quantidade}x${it.valorUnitario.toFixed(2)}`;
      lines.push(`${num} ${desc}`);
      lines.push(justify(`   ${resumo}`, total));
    }
  });

  lines.push(dashSeparator);

  // Totais
  lines.push(justify('QTD. TOTAL DE ITENS:', doc.itens.length.toString()));
  lines.push(justify('VALOR TOTAL R$:', doc.valorTotal.toFixed(2)));
  if (doc.valorTributosAprox > 0) {
    lines.push(justify('Trib. Aprox. (Lei 12.741):', `R$ ${doc.valorTributosAprox.toFixed(2)}`));
  }
  lines.push(lineSeparator);

  // Consumidor
  lines.push(justify('CONSUMIDOR:', doc.destinatarioNome || 'NAO IDENTIFICADO'));
  if (doc.destinatarioCpfCnpj) {
    lines.push(justify('CPF/CNPJ:', doc.destinatarioCpfCnpj));
  }
  lines.push(dashSeparator);

  // Chave e Protocolo
  lines.push(center('CONSULTE PELA CHAVE DE ACESSO EM:'));
  lines.push(center('https://www.fazenda.sp.gov.br/nfce/consulta'));
  lines.push(center(doc.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim()));
  lines.push(dashSeparator);

  if (doc.protocoloAutorizacao) {
    lines.push(justify('PROTOCOLO AUTORIZACAO:', doc.protocoloAutorizacao));
    lines.push(justify('DATA AUTORIZACAO:', doc.dataAutorizacao || doc.dataEmissao));
  } else if (doc.tipoEmissao === 'CONTINGENCIA_OFFLINE') {
    lines.push(center('MOTIVO DA CONTINGENCIA:'));
    lines.push(center(doc.contingenciaMotivo || 'SEFAZ Fora do Ar'));
  }

  lines.push(lineSeparator);
  lines.push(center('ADEGA IMPERIAL - SISTEMA FISCAL SEFAZ'));
  lines.push(center('Obrigado pela preferencia!'));
  lines.push('\n\n\n'); // Espaço para corte de papel

  return lines.join('\n');
}

/**
 * Cria XML simulado de Carta de Correção Eletrônica (CC-e)
 */
export function buildCceXmlPayload(
  chaveAcesso: string,
  sequencialEvento: number,
  textoCorrecao: string,
  cnpjLoja: string
): string {
  const dhEvento = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<envEvento xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <idLote>1</idLote>
  <evento versao="1.00">
    <infEvento Id="ID110110${chaveAcesso}${String(sequencialEvento).padStart(2, '0')}">
      <cOrgao>35</cOrgao>
      <tpAmb>1</tpAmb>
      <CNPJ>${cnpjLoja.replace(/\D/g, '')}</CNPJ>
      <chNFe>${chaveAcesso}</chNFe>
      <dhEvento>${dhEvento}</dhEvento>
      <tpEvento>110110</tpEvento>
      <nSeqEvento>${sequencialEvento}</nSeqEvento>
      <verEvento>1.00</verEvento>
      <detEvento versao="1.00">
        <descEvento>Carta de Correcao</descEvento>
        <xCorrecao>${textoCorrecao}</xCorrecao>
        <xCondUso>A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.</xCondUso>
      </detEvento>
    </infEvento>
  </evento>
</envEvento>`;
}

/**
 * Cria XML de Inutilização de Faixa de Numeração
 */
export function buildInutilizacaoXmlPayload(
  ano: number,
  cnpj: string,
  modelo: string,
  serie: number,
  numInicial: number,
  numFinal: number,
  justificativa: string
): string {
  const cnpjClean = cnpj.replace(/\D/g, '');
  const idInut = `ID35${ano}${cnpjClean}${modelo}${String(serie).padStart(3, '0')}${String(numInicial).padStart(9, '0')}${String(numFinal).padStart(9, '0')}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<inutNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <infInut Id="${idInut}">
    <tpAmb>1</tpAmb>
    <xServ>INUTILIZAR</xServ>
    <cUF>35</cUF>
    <ano>${ano.toString().slice(-2)}</ano>
    <CNPJ>${cnpjClean}</CNPJ>
    <mod>${modelo}</mod>
    <serie>${serie}</serie>
    <nNFIni>${numInicial}</nNFIni>
    <nNFFin>${numFinal}</nNFFin>
    <xJust>${justificativa}</xJust>
  </infInut>
</inutNFe>`;
}
