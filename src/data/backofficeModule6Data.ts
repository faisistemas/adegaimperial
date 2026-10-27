import { 
  DreEstruturaLinha, CurvaAbcProduto, ContaPagar, 
  ContaReceber, FluxoCaixaProjetadoDia, OrdemCompra, 
  ContaBancaria, ExtratoOfxTransacao, MetaColaborador, 
  FranquiaUnidadeConfig, ItemMarkupPreco, ComparativoLojaDesempenho 
} from '../types/backofficeTypes';

export const INITIAL_DRE_DATA: DreEstruturaLinha[] = [
  {
    id: 'dre-1',
    codigoContabil: '1.0',
    descricao: 'RECEITA OPERACIONAL BRUTA',
    tipo: 'RECEITA_BRUTA',
    valor: 0,
    percentualSobreReceita: 100.0,
    isTotalizador: true,
    destaque: true,
    detalhes: [],
  },
  {
    id: 'dre-2',
    codigoContabil: '1.1',
    descricao: '(-) DEDUÇÕES DA RECEITA BRUTA',
    tipo: 'DEDUCAO',
    valor: 0,
    percentualSobreReceita: 0,
    isTotalizador: true,
    detalhes: [],
  },
  {
    id: 'dre-3',
    codigoContabil: '2.0',
    descricao: '(=) RECEITA OPERACIONAL LÍQUIDA',
    tipo: 'RECEITA_LIQUIDA',
    valor: 0,
    percentualSobreReceita: 0,
    isTotalizador: true,
    destaque: true,
  },
  {
    id: 'dre-4',
    codigoContabil: '2.1',
    descricao: '(-) CUSTO DAS MERCADORIAS VENDIDAS (CMV)',
    tipo: 'CMV',
    valor: 0,
    percentualSobreReceita: 0,
    isTotalizador: true,
    detalhes: [],
  },
  {
    id: 'dre-5',
    codigoContabil: '3.0',
    descricao: '(=) LUCRO BRUTO',
    tipo: 'LUCRO_BRUTO',
    valor: 0,
    percentualSobreReceita: 0,
    isTotalizador: true,
    destaque: true,
  },
  {
    id: 'dre-6',
    codigoContabil: '3.1',
    descricao: '(-) DESPESAS OPERACIONAIS FIXAS & VARIÁVEIS',
    tipo: 'DESPESA_OPERACIONAL',
    valor: 0,
    percentualSobreReceita: 0,
    isTotalizador: true,
    detalhes: [],
  },
  {
    id: 'dre-7',
    codigoContabil: '4.0',
    descricao: '(=) RESULTADO OPERACIONAL LÍQUIDO (EBITDA)',
    tipo: 'EBITDA',
    valor: 0,
    percentualSobreReceita: 0,
    isTotalizador: true,
    destaque: true,
  },
];

export const INITIAL_CURVA_ABC: CurvaAbcProduto[] = [];

export const INITIAL_CONTAS_PAGAR: ContaPagar[] = [];

export const INITIAL_CONTAS_RECEBER: ContaReceber[] = [];

export const INITIAL_FLUXO_CAIXA: FluxoCaixaProjetadoDia[] = [];

export const INITIAL_ORDENS_COMPRA: OrdemCompra[] = [];

export const INITIAL_CONTAS_BANCARIAS: ContaBancaria[] = [];

export const INITIAL_OFX_TRANSACOES: ExtratoOfxTransacao[] = [];

export const INITIAL_METAS_COLABORADORES: MetaColaborador[] = [];

export const INITIAL_FRANQUIA_CONFIGS: FranquiaUnidadeConfig[] = [];

export const INITIAL_TABELA_MARKUP: ItemMarkupPreco[] = [];

export const INITIAL_COMPARATIVO_LOJAS: ComparativoLojaDesempenho[] = [];
