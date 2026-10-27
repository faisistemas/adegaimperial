import { 
  PerfilFiscal, CertificadoDigitalA1, DocumentoFiscalCompleto,
  ManifestacaoDFe, CartaCorrecaoEvento, InutilizacaoFaixa,
  RegraValidacaoAntiRejeicao, ConciliacaoFiscalPagamento,
  RessarcimentoIcmsSt, ReformaTributariaConfigItem,
  AuditoriaRiscoFiscal, ExportacaoContabilidade
} from '../types/fiscalTypes';

export const INITIAL_PERFIS_FISCAIS: PerfilFiscal[] = [
  {
    id: 1,
    nomePerfil: 'Cervejas e Chopes (ICMS-ST + Monofásico)',
    cfopPadrao: '5.405',
    csosnPadrao: '500',
    cstIcms: '60',
    aliquotaIcms: 0,
    cstPis: '04',
    aliquotaPis: 0,
    cstCofins: '04',
    aliquotaCofins: 0,
    fcpAliquota: 0,
  },
  {
    id: 2,
    nomePerfil: 'Destilados e Bebidas Quentes (ICMS-ST + FCP 2%)',
    cfopPadrao: '5.405',
    csosnPadrao: '500',
    cstIcms: '60',
    aliquotaIcms: 0,
    cstPis: '04',
    aliquotaPis: 0,
    cstCofins: '04',
    aliquotaCofins: 0,
    fcpAliquota: 2.0,
  },
  {
    id: 3,
    nomePerfil: 'Refrigerantes, Águas e Sucos (Monofásico ST)',
    cfopPadrao: '5.405',
    csosnPadrao: '500',
    cstIcms: '60',
    aliquotaIcms: 0,
    cstPis: '04',
    aliquotaPis: 0,
    cstCofins: '04',
    aliquotaCofins: 0,
    fcpAliquota: 0,
  },
  {
    id: 4,
    nomePerfil: 'Drinks e Coquetéis Preparados (Produção Própria Balcão)',
    cfopPadrao: '5.101',
    csosnPadrao: '102',
    cstIcms: '00',
    aliquotaIcms: 18.0,
    cstPis: '01',
    aliquotaPis: 1.65,
    cstCofins: '01',
    aliquotaCofins: 7.60,
    fcpAliquota: 0,
  },
  {
    id: 5,
    nomePerfil: 'Gelo Filtrado e Insumos Básicos (Tributação Integral)',
    cfopPadrao: '5.102',
    csosnPadrao: '102',
    cstIcms: '00',
    aliquotaIcms: 18.0,
    cstPis: '01',
    aliquotaPis: 0.65,
    cstCofins: '01',
    aliquotaCofins: 3.00,
    fcpAliquota: 0,
  },
  {
    id: 6,
    nomePerfil: 'Vinhos Finos e Espumantes (ST Estadual + IPI Suspenso)',
    cfopPadrao: '5.405',
    csosnPadrao: '500',
    cstIcms: '60',
    aliquotaIcms: 0,
    cstPis: '08',
    aliquotaPis: 0,
    cstCofins: '08',
    aliquotaCofins: 0,
    fcpAliquota: 0,
  },
];

export const INITIAL_CERTIFICADO_A1: CertificadoDigitalA1 = {
  id: 'cert-1',
  lojaId: 'store-1',
  arquivoPfxNome: '',
  titular: 'AdeGaswg',
  cnpj: '12.345.678/0001-90',
  dataValidade: '',
  diasParaVencer: 0,
  ambiente: 'PRODUCAO',
  numeroSerie: '',
  cscToken: '',
  cscId: '',
  status: 'NAO_CONFIGURADO' as any,
};

export const INITIAL_DOCUMENTOS_FISCAIS: DocumentoFiscalCompleto[] = [];

export const INITIAL_MANIFESTACOES_DFE: ManifestacaoDFe[] = [];

export const INITIAL_CARTAS_CORRECAO: CartaCorrecaoEvento[] = [];

export const INITIAL_INUTILIZACOES_FAIXA: InutilizacaoFaixa[] = [];

export const INITIAL_REGRAS_VALIDACAO: RegraValidacaoAntiRejeicao[] = [
  {
    id: 1,
    ncmPrefixo: '2203',
    descricao: 'Cervejas de malte e chopes',
    exigeCest: true,
    cfopPermitidos: ['5405', '5102', '5927', '5409'],
    cstIcmsPermitidos: ['60', '500', '00', '41'],
    regraTexto: 'Obrigatório preenchimento do CEST (03.001.00 a 03.007.00). Caso regime seja Simples Nacional, exigir CSOSN 500 para revenda com ICMS-ST.',
  },
  {
    id: 2,
    ncmPrefixo: '2204',
    descricao: 'Vinhos de uvas frescas e espumantes',
    exigeCest: true,
    cfopPermitidos: ['5405', '5102', '5927'],
    cstIcmsPermitidos: ['60', '500', '00', '40'],
    regraTexto: 'Vinhos finos exigem NCM detalhado 2204.21.00. Em SP, bebidas fermentadas recolhem FCP adicional de 2% caso destinadas a consumidor.',
  },
  {
    id: 3,
    ncmPrefixo: '2208',
    descricao: 'Destilados (Whisky, Gin, Vodka, Cachaça, Tequila)',
    exigeCest: true,
    cfopPermitidos: ['5405', '5102'],
    cstIcmsPermitidos: ['60', '500', '00'],
    regraTexto: 'Destilados possuem carga concentrada de ST. Bloquear emissão caso o valor unitário da dose seja menor que o preço de custo proporcional da garrafa.',
  },
  {
    id: 4,
    ncmPrefixo: '2201',
    descricao: 'Águas minerais e gelo',
    exigeCest: false,
    cfopPermitidos: ['5102', '5405'],
    cstIcmsPermitidos: ['00', '102', '500', '60'],
    regraTexto: 'Gelo cubo filtrado comercializado por peso (Kg) exige unidade de medida KG no XML fiscal.',
  },
];

export const INITIAL_CONCILIACOES_TEF: ConciliacaoFiscalPagamento[] = [];

export const INITIAL_RESSARCIMENTOS_ICMS_ST: RessarcimentoIcmsSt[] = [];

export const INITIAL_REFORMA_TRIBUTARIA: ReformaTributariaConfigItem[] = [];

export const INITIAL_ALERTAS_RISCO_FISCAL: AuditoriaRiscoFiscal[] = [];

export const INITIAL_EXPORTACOES_CONTABILIDADE: ExportacaoContabilidade = {
  id: `exp-${new Date().getFullYear()}`,
  lojaId: 'store-1',
  mesCompetencia: String(new Date().getMonth() + 1).padStart(2, '0'),
  anoCompetencia: new Date().getFullYear(),
  emailContador: '',
  dataEnvioAgendada: '',
  statusEnvio: 'PENDENTE',
  totalNotasAutorizadas: 0,
  totalNotasCanceladas: 0,
  totalCartasCorrecao: 0,
  totalInutilizacoes: 0,
  valorTotalFaturado: 0,
  arquivosGerados: [],
};
