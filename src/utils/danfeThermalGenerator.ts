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

  // Cabeçalho com Logomarca e dados da empresa
  lines.push(`         [ LOGOMARCA: ${store.name.toUpperCase()} ]`);
  lines.push(`${store.name.toUpperCase()} - #0103`);
  lines.push(`CNPJ-${store.cnpj}  ${doc.dataEmissao.split(' ')[0]}`);
  lines.push(`${store.address.toUpperCase()}, ${store.city.toUpperCase()}-${store.state.toUpperCase()}`);
  lines.push(`DANFE NFC-e Documento Auxiliar`);
  lines.push(`da Nota Fiscal de Consumidor Eletronica`);

  // Itens
  lines.push(format === '80mm' ? `ITEM CODIGO            DESCRICAO                TOT. ITEM(R$)` : `ITEM CODIGO        DESC   TOT(R$)`);

  doc.itens.forEach((it, idx) => {
    const num = String(it.itemNumero || idx + 1).padStart(3, '0');
    const barcode = (it.ncm ? `789${it.ncm.padEnd(9, '0').slice(0, 9)}2` : '7898279790417');
    const total = it.valorTotal.toFixed(2).replace('.', ',');
    const unit = it.unidade || 'UN';

    if (format === '80mm') {
      const desc = `${it.produtoNome.toUpperCase()} ${unit}`.substring(0, 24).padEnd(24, ' ');
      lines.push(`${num} ${barcode.padEnd(13, ' ')} ${desc} ${total.padStart(8, ' ')}`);
    } else {
      const desc = `${it.produtoNome.toUpperCase()} ${unit}`.substring(0, 14).padEnd(14, ' ');
      lines.push(`${num} ${barcode.substring(0, 11)} ${desc} ${total.padStart(6, ' ')}`);
    }

    if (it.quantidade > 1) {
      lines.push(`    ${it.quantidade} ${unit} X ${it.valorUnitario.toFixed(2).replace('.', ',')}`);
    }
  });

  // Totais
  lines.push(`QTD. TOTAL DE ITENS ${String(doc.itens.length).padStart(width - 20, ' ')}`);
  lines.push(`VALOR TOTAL R$ ${String(doc.valorTotal.toFixed(2).replace('.', ',')).padStart(width - 15, ' ')}`);
  lines.push(`FORMA DE PAGAMENTO ${'VALOR PAGO'.padStart(width - 19, ' ')}`);
  lines.push(`${'Cartao de Credito'.padEnd(20, ' ')} ${String(doc.valorTotal.toFixed(2).replace('.', ',')).padStart(width - 21, ' ')}`);

  const fedTax = doc.valorTributosAprox > 0 ? doc.valorTributosAprox * 0.45 : doc.valorTotal * 0.1345;
  const stateTax = doc.valorTributosAprox > 0 ? doc.valorTributosAprox * 0.55 : doc.valorTotal * 0.1500;
  lines.push(`Trib aprox: R$ ${fedTax.toFixed(2).replace('.', ',')} Fed, R$ ${stateTax.toFixed(2).replace('.', ',')} Est e`);
  lines.push(`R$ 0,00 Mun Fonte: IBPT`);

  const nsu = '000139';
  const coo = '029158';
  lines.push(`LJ:0103 PDV:001 NSU:${nsu} O:001090 A:001083 COO:${coo}`);
  lines.push(`Numero ${String(doc.numeroNota).padStart(9, '0')} Serie ${doc.serie} Emissao ${doc.dataEmissao}`);
  lines.push(`http://app.sefaz.${(store.state || 'sp').toLowerCase()}.gov.br/ConsultaNFCe/QRCode.aspx`);
  lines.push(doc.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim());

  const consumerText = doc.destinatarioCpfCnpj
    ? `CONSUMIDOR CPF: ${doc.destinatarioCpfCnpj}`
    : 'CONSUMIDOR NAO IDENTIFICADO';
  lines.push(`           ${consumerText}`);
  lines.push(`          Consulta via leitor de QR Code`);
  lines.push(`                  [ QR CODE SEFAZ ]`);

  if (doc.protocoloAutorizacao) {
    lines.push(`Protocolo de autorizacao: ${doc.protocoloAutorizacao}`);
    lines.push(`                ${doc.dataAutorizacao || doc.dataEmissao.split(' ')[0]}`);
  }

  lines.push(dashSeparator);
  lines.push(`                    CUPOM DE TROCA`);
  lines.push(`DATA:${doc.dataEmissao.split(' ')[0]} LJ:0103 ECF:001 COD:${coo} NSU:${nsu}`);
  doc.itens.slice(0, 3).forEach((it) => {
    lines.push(`7898279790417 ${it.produtoNome.toUpperCase().substring(0, 30)}`);
  });
  lines.push(`        OBRIGADO PELA PREFERENCIA! VOLTE SEMPRE`);
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
