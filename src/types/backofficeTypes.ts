export type DrePeriodo = 'HOJE' | 'SEMANA' | 'MES' | 'TRIMESTRE' | 'ANO' | 'CUSTOM';

export type DreTipoLinha = 
  | 'RECEITA_BRUTA' 
  | 'DEDUCAO' 
  | 'RECEITA_LIQUIDA' 
  | 'CMV' 
  | 'LUCRO_BRUTO' 
  | 'DESPESA_OPERACIONAL' 
  | 'EBITDA';

export interface DreItemDetalhe {
  nome: string;
  valor: number;
  percentual: number;
  observacao?: string;
}

export interface DreEstruturaLinha {
  id: string;
  codigoContabil: string;
  descricao: string;
  tipo: DreTipoLinha;
  valor: number;
  percentualSobreReceita: number;
  isTotalizador?: boolean;
  destaque?: boolean;
  detalhes?: DreItemDetalhe[];
}

export interface CurvaAbcProduto {
  produtoId: string;
  nome: string;
  categoria: string;
  classeAbc: 'A' | 'B' | 'C';
  faturamento: number;
  percentualFaturamento: number;
  percentualAcumulado: number;
  volumeVendido: number;
  custoTotal: number;
  margemContribuicaoValor: number;
  margemContribuicaoPercentual: number;
  quadrante: 'ALTA_RENTABILIDADE' | 'CHAMARIZ' | 'NICHO_PREMIUM' | 'RISCO_OCIOSO';
  diasSemGiro: number;
  acaoSugerida: string;
  isDose: boolean;
}

export type CategoriaContaPagar = 
  | 'FORNECEDOR_BEBIDAS' 
  | 'ENERGIA_FREEZERS' 
  | 'ALUGUEL' 
  | 'FOLHA_PAGAMENTO' 
  | 'SISTEMAS' 
  | 'TRIBUTOS' 
  | 'MANUTENCAO';

export type StatusContaPagar = 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
export type OrigemPagamento = 'CONTA_BANCARIA' | 'SANGRIA_PDV';

export interface ContaPagar {
  id: string;
  lojaId: string;
  categoria: CategoriaContaPagar;
  fornecedorNome: string;
  fornecedorCnpj: string;
  numeroDocumento: string;
  valorNominal: number;
  jurosMulta: number;
  desconto: number;
  valorPago: number;
  dataVencimento: string;
  dataPagamento?: string;
  status: StatusContaPagar;
  origemPagamento: OrigemPagamento;
  codigoBarras?: string;
  observacoes?: string;
}

export type AdquirenteCartao = 'STONE' | 'CIELO' | 'REDE' | 'PAGSEGURO' | 'BANCO_PIX';
export type StatusContaReceber = 'A_RECEBER' | 'LIQUIDADO' | 'DIVERGENTE' | 'CHARGEBACK';

export interface ContaReceber {
  id: string;
  lojaId: string;
  adquirente: AdquirenteCartao;
  bandeira: string;
  valorBruto: number;
  taxaMdrPercentual: number;
  taxaMdrValor: number;
  valorLiquido: number;
  dataVenda: string;
  dataPrevistaRepasse: string;
  dataRepasseEfetivo?: string;
  status: StatusContaReceber;
  comprovanteTefId?: string;
  divergenciaNota?: string;
}

export interface FluxoCaixaProjetadoDia {
  data: string;
  diaSemana: string;
  saldoInicial: number;
  entradasPrevistas: number;
  saidasPrevistas: number;
  saldoFinal: number;
  alertaLiquidez?: boolean;
}

export type StatusOrdemCompra = 'RASCUNHO' | 'COTACAO' | 'ENVIADO' | 'RECEBIDO_TOTAL';

export interface ItemOrdemCompra {
  produtoId: string;
  produtoNome: string;
  estoqueAtual: number;
  consumoMedioDiario: number;
  leadTimeDias: number;
  estoqueSeguranca: number;
  pontoReposicao: number;
  quantidadeSugerida: number;
  quantidadeAprovada: number;
  custoUnitarioEstimado: number;
  subtotalEstimado: number;
  motivoIa: string;
}

export interface OrdemCompra {
  id: string;
  codigo: string;
  lojaId: string;
  fornecedorNome: string;
  fornecedorCnpj: string;
  status: StatusOrdemCompra;
  valorTotalEstimado: number;
  dataEmissao: string;
  dataPrevisaoEntrega: string;
  geradoPorIa: boolean;
  motivoIa?: string;
  itens: ItemOrdemCompra[];
}

export interface ContaBancaria {
  id: string;
  lojaId: string;
  bancoCodigo: string;
  bancoNome: string;
  agencia: string;
  conta: string;
  saldoAtual: number;
  saldoConciliado: number;
  dataUltimaConciliacao: string;
}

export type StatusAuditoriaOfx = 'CONCILIADO' | 'PENDENTE_CONCILIACAO' | 'DIVERGENCIA_BORDERÔ';

export interface ExtratoOfxTransacao {
  id: string;
  contaBancariaId: string;
  fitid: string;
  data: string;
  valor: number;
  tipo: 'CREDITO' | 'DEBITO';
  descricao: string;
  conciliado: boolean;
  statusAuditoria: StatusAuditoriaOfx;
  divergenciaMotivo?: string;
  documentoVinculado?: string;
}

export interface MetaColaborador {
  id: string;
  lojaId: string;
  colaboradorNome: string;
  cargo: 'GARCOM' | 'BARTENDER' | 'CAIXA' | 'GERENTE';
  mes: string;
  metaFaturamento: number;
  atingidoFaturamento: number;
  metaAltaMargem: number;
  atingidoAltaMargem: number;
  comissaoPadraoTaxa: number; // 1.0% para cerveja comercial
  comissaoAltaMargemTaxa: number; // 5.0% a 8.0% para doses e coquetéis
  comissaoTotal: number;
  turboAtivado: boolean;
  rankingPosicao: number;
}

export interface FranquiaUnidadeConfig {
  lojaId: string;
  lojaNome: string;
  cnpj: string;
  cidade: string;
  tipo: 'MATRIZ' | 'FRANQUIA_PROPRIA' | 'FRANQUIA_PARCEIRA';
  percentualRoyalties: number; // 5.0%
  percentualFundoPropaganda: number; // 2.0%
  markupPadrao: number; // 1.60x
  faturamentoBrutoMes: number;
  royaltiesMes: number;
  fundoPropagandaMes: number;
  statusPagamento: 'PAGO' | 'PENDENTE' | 'ATRASADO';
}

export interface ItemMarkupPreco {
  produtoId: string;
  nome: string;
  categoria: string;
  custoUltimaNfe: number;
  markupAtual: number;
  precoVendaAtual: number;
  markupSugerido: number;
  precoVendaSugerido: number;
  margemEstimadaPercentual: number;
}

export interface ComparativoLojaDesempenho {
  lojaId: string;
  lojaNome: string;
  faturamento: number;
  giroEstoque: number; // Vendas no período / Estoque Médio
  estoqueValorTotal: number;
  ticketMedioPdv: number;
  ticketMedioSalao: number;
  ticketMedioDelivery: number;
  indicePerdasPercentual: number; // (Perdas e Quebras / Faturamento) * 100
  limitePerdaSegura: number; // 1.5%
  sugestaoTransferencia?: string;
}
