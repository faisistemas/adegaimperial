export type ModeloDocumentoFiscal = '55' | '65' | 'NFSe';

export type StatusSefaz = 'AUTORIZADO' | 'CANCELADO' | 'CONTINGENCIA' | 'REJEITADO' | 'GERADO';

export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';

export interface PerfilFiscal {
  id: number;
  nomePerfil: string;
  cfopPadrao: string;
  csosnPadrao?: string; // Para Simples Nacional (ex: 500 para ICMS-ST retido)
  cstIcms?: string;     // Para Regime Normal (ex: 60 para ICMS-ST retido)
  aliquotaIcms: number;
  cstPis: string;       // ex: 04 ou 06 (monofásico alíquota zero)
  aliquotaPis: number;
  cstCofins: string;
  aliquotaCofins: number;
  fcpAliquota: number;  // Fundo de Combate à Pobreza (2% a 4% destilados)
}

export interface CertificadoDigitalA1 {
  id: string;
  lojaId: string;
  arquivoPfxNome: string;
  titular: string;
  cnpj: string;
  dataValidade: string;
  diasParaVencer: number;
  ambiente: 'HOMOLOGACAO' | 'PRODUCAO';
  numeroSerie: string;
  cscToken: string; // Token CSC alfanumérico para QR-Code NFC-e
  cscId: string;    // Identificador CSC (ex: 000001)
  status: 'VALIDO' | 'ATENCAO' | 'EXPIRADO';
}

export interface DocumentoFiscalItem {
  itemNumero: number;
  produtoId: string;
  produtoNome: string;
  ncm: string;
  cest?: string;
  cfop: string;
  cstOuCsosn: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  vBcIcms: number;
  vIcms: number;
  vIcmsSt: number;
  vPis: number;
  vCofins: number;
  vTributosAprox: number; // Lei 12.741/2012 (IBPT)
}

export interface DocumentoFiscalCompleto {
  id: string;
  lojaId: string;
  vendaId?: string;
  modelo: ModeloDocumentoFiscal;
  serie: number;
  numeroNota: number;
  chaveAcesso: string;
  statusSefaz: StatusSefaz;
  codigoStatusResposta: string; // ex: 100 (Autorizado), 135 (Cancelamento), 150 (Contingência)
  motivoRejeicao?: string;
  protocoloAutorizacao?: string;
  dataEmissao: string;
  dataAutorizacao?: string;
  valorTotal: number;
  valorTributosAprox: number;
  destinatarioNome?: string;
  destinatarioCpfCnpj?: string;
  destinatarioEmail?: string;
  destinatarioEndereco?: string;
  naturezaOperacao: string; // ex: 'VENDA CONSUMIDOR FINAL', 'REMESSA DE TRANSFERENCIA', 'PERDA / AVARIA DE GARRAFA'
  tipoEmissao: 'NORMAL' | 'CONTINGENCIA_OFFLINE';
  contingenciaMotivo?: string;
  xmlEnviado: string;
  xmlProtocolado?: string;
  itens: DocumentoFiscalItem[];
  qrcodeUrl: string;
}

export interface ManifestacaoDFeItem {
  codigoFornecedor: string;
  descricaoFornecedor: string;
  ncm: string;
  cest?: string;
  cfop: string;
  unidadeFornecedor: string; // ex: 'CX', 'FD', 'UN'
  quantidadeFornecedor: number;
  valorUnitarioFornecedor: number;
  valorTotal: number;
  valorIcmsSt: number;
  fatorConversao: number; // ex: 1 CX com 24 vira 24 UN
  produtoSistemaId?: string;
  produtoSistemaNome?: string;
  unidadeSistema: string; // ex: 'UN'
  quantidadeConvertida: number;
  custoUnitarioFinalComStEFrete: number;
}

export interface ManifestacaoDFe {
  id: string;
  lojaId: string;
  chaveAcesso: string;
  cnpjEmitente: string;
  razaoSocialEmitente: string;
  numeroNota: number;
  serie: number;
  valorTotal: number;
  dataEmissao: string;
  statusManifestacao: 'CIENCIA' | 'CONFIRMADA' | 'DESCONHECIDA' | 'NAO_REALIZADA';
  statusEstoque: 'PENDENTE_IMPORTACAO' | 'IMPORTADA';
  protocoloManifestacao?: string;
  dataManifestacao?: string;
  itens: ManifestacaoDFeItem[];
  valorFreteRateado: number;
  valorTotalIcmsSt: number;
  xmlCompleto: string;
}

export interface CartaCorrecaoEvento {
  id: string;
  documentoFiscalId: string;
  numeroNota: number;
  serie: number;
  modelo: ModeloDocumentoFiscal;
  chaveAcesso: string;
  sequencialEvento: number;
  textoCorrecao: string;
  statusEnvio: 'PENDENTE' | 'HOMOLOGADA' | 'REJEITADA';
  protocoloSefaz?: string;
  dataEvento: string;
  justificativaLegal: string;
}

export interface InutilizacaoFaixa {
  id: string;
  lojaId: string;
  modelo: '55' | '65';
  serie: number;
  numeroInicial: number;
  numeroFinal: number;
  justificativa: string;
  protocoloInutilizacao: string;
  dataRegistro: string;
  status: 'HOMOLOGADA' | 'REJEITADA';
}

export interface RegraValidacaoAntiRejeicao {
  id: number;
  ncmPrefixo: string;
  descricao: string;
  exigeCest: boolean;
  cfopPermitidos: string[];
  cstIcmsPermitidos: string[];
  regraTexto: string;
}

export interface ConciliacaoFiscalPagamento {
  id: string;
  lojaId: string;
  documentoFiscalId?: string;
  chaveAcesso?: string;
  vendaId: string;
  codigoPedido: string;
  nsuTef: string;
  autorizacaoCartao: string;
  credenciadora: string; // ex: 'Stone', 'Cielo', 'Rede', 'PagBank'
  cnpjCredenciadora: string;
  bandeiraCartao: string; // ex: 'Mastercard', 'Visa', 'Elo', 'PIX Dinâmico'
  formaPagamento: 'CREDITO' | 'DEBITO' | 'PIX_TEF' | 'DINHEIRO';
  valor: number;
  statusConciliacao: 'CONCILIADO' | 'DIVERGENTE' | 'SEM_NOTA';
  dataRegistro: string;
  observacao?: string;
}

export interface RessarcimentoIcmsSt {
  id: string;
  lojaId: string;
  produtoId: string;
  produtoNome: string;
  ncm: string;
  cest: string;
  documentoFiscalSaidaId?: string;
  motivoRessarcimento: 'PERDA_AVARIA' | 'SAIDA_INTERESTADUAL' | 'PRECO_EFETIVO_MENOR';
  baseCalculoStRetido: number;
  aliquotaStRetido: number;
  valorIcmsStRecuperavel: number;
  statusApuracao: 'PENDENTE' | 'ENVIADO_SPED' | 'CREDITADO';
  dataRegistro: string;
  referenciaNormativa: string; // ex: 'Art. 269 do RICMS / CAT 42'
  observacao?: string;
}

export interface ReformaTributariaConfigItem {
  produtoId: string;
  produtoNome: string;
  ncm: string;
  teorAlcoolicoAbv: number; // ex: 40.0 para Vodka, 4.8 para Cerveja
  precoVendaAtual: number;
  cstIbsCbs: string;
  aliquotaIbs: number;          // Alíquota estadual/municipal estimada (ex: 17.5%)
  aliquotaCbs: number;          // Alíquota federal estimada (ex: 8.8%)
  aplicaImpostoSeletivo: boolean; // "Imposto do Pecado" sobre álcool
  aliquotaImpostoSeletivo: number; // Calculada proporcionalmente ao ABV
  // Comparativo
  impostoAtualTotal: number;
  impostoReformaTotal: number;
  diferencaValor: number;
  variacaoPercentual: number;
}

export interface AuditoriaRiscoFiscal {
  id: string;
  lojaId: string;
  tipoAlerta: 'CANCELAMENTO_EXCESSIVO' | 'PROPORCAO_DINHEIRO_ANORMAL' | 'DISCREPANCIA_CARTAO' | 'NCM_GENERICO_SEM_CEST';
  nivelSeveridade: 'BAIXO' | 'MEDIO' | 'CRITICO';
  titulo: string;
  descricaoDetalhada: string;
  gatilhoDisparo: string;
  impactoRisco: string;
  acaoRecomendada: string;
  valorMetricaAtual: string;
  limiteSeguranca: string;
  dataIdentificacao: string;
  resolvido: boolean;
}

export interface ExportacaoContabilidade {
  id: string;
  lojaId: string;
  mesCompetencia: string;
  anoCompetencia: number;
  emailContador: string;
  dataEnvioAgendada: string;
  dataEnvioRealizada?: string;
  statusEnvio: 'PENDENTE' | 'ENVIADO' | 'FALHA';
  totalNotasAutorizadas: number;
  totalNotasCanceladas: number;
  totalCartasCorrecao: number;
  totalInutilizacoes: number;
  valorTotalFaturado: number;
  arquivosGerados: string[];
}
