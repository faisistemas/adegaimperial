export interface AppSettings {
  // 1. Dados Cadastrais da Empresa
  empresa: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpj: string;
    inscricaoEstadual: string;
    regimeTributario: 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL' | 'MEI';
    telefone: string;
    email: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  
  // 2. Parâmetros Financeiros & Frente de Caixa (PDV)
  pdv: {
    fundoTrocoPadrao: number;
    limiteDescontoSemGerentePercent: number; // Ex: até 5% operador pode dar
    exigirSenhaGerenteSangria: boolean;
    exigirSenhaGerenteCancelamento: boolean;
    exigirConferenciaCegaFechamento: boolean;
    alertaSangriaValor: number; // Sugere sangria quando dinheiro no caixa atingir este valor
    taxaServicoPadraoPercent: number; // Ex: 10%
    couvertArtisticoPadrao: number; // Ex: R$ 15,00
    tempoInatividadeBloqueioMinutos: number;
    biparComSom: boolean;
    impressaoAutomaticaComprovante: boolean;
  };

  // 3. Parâmetros de Estoque & Doses
  estoque: {
    estoqueMinimoPadraoGeral: number;
    bloquearVendaSemEstoque: boolean;
    exigirAberturaGarrafaFracionada: boolean;
    toleranciaPerdaChoppPercent: number;
    notificarValidadeProximaDias: number; // Ex: avisar 30 dias antes do vencimento
  };

  // 4. Parâmetros de Delivery & Atendimento
  delivery: {
    taxaEntregaBase: number;
    raioMaximoEntregaKm: number;
    tempoMedioEntregaMinutos: number;
    aplicarTaxaServicoDelivery: boolean;
    exigirMotoboyCadastradoDespacho: boolean;
  };

  // 5. Segurança & Auditoria
  seguranca: {
    auditarTodasOperacoesCriticas: boolean;
    permitirVendaSemCpf: boolean;
    salvarBackupLocalAutomatico: boolean;
    frequenciaBackupHoras: number;
  };
}

export const INITIAL_APP_SETTINGS: AppSettings = {
  empresa: {
    razaoSocial: 'Adega & Empório Don Corleone Distribuidora Ltda',
    nomeFantasia: 'Adega Don Corleone - Matriz Vila Madalena',
    cnpj: '12.345.678/0001-90',
    inscricaoEstadual: '112.456.789.110',
    regimeTributario: 'SIMPLES_NACIONAL',
    telefone: '(11) 98765-4321',
    email: 'contato@adegadoncorleone.com.br',
    cep: '05432-000',
    logradouro: 'Rua Fradique Coutinho',
    numero: '1240',
    bairro: 'Vila Madalena',
    cidade: 'São Paulo',
    uf: 'SP',
  },
  pdv: {
    fundoTrocoPadrao: 200.00,
    limiteDescontoSemGerentePercent: 5.0,
    exigirSenhaGerenteSangria: true,
    exigirSenhaGerenteCancelamento: true,
    exigirConferenciaCegaFechamento: true,
    alertaSangriaValor: 1500.00,
    taxaServicoPadraoPercent: 10.0,
    couvertArtisticoPadrao: 12.00,
    tempoInatividadeBloqueioMinutos: 15,
    biparComSom: true,
    impressaoAutomaticaComprovante: true,
  },
  estoque: {
    estoqueMinimoPadraoGeral: 6,
    bloquearVendaSemEstoque: false,
    exigirAberturaGarrafaFracionada: true,
    toleranciaPerdaChoppPercent: 7.0,
    notificarValidadeProximaDias: 30,
  },
  delivery: {
    taxaEntregaBase: 9.90,
    raioMaximoEntregaKm: 12.0,
    tempoMedioEntregaMinutos: 45,
    aplicarTaxaServicoDelivery: false,
    exigirMotoboyCadastradoDespacho: true,
  },
  seguranca: {
    auditarTodasOperacoesCriticas: true,
    permitirVendaSemCpf: true,
    salvarBackupLocalAutomatico: true,
    frequenciaBackupHoras: 24,
  },
};

export type AuditCategory = 
  | 'CAIXA_SESSAO' 
  | 'SANGRIA_SUPRIMENTO' 
  | 'CANCELAMENTO_ITEM' 
  | 'CANCELAMENTO_VENDA' 
  | 'DESCONTO_CONCEDIDO' 
  | 'AJUSTE_ESTOQUE' 
  | 'ALTERACAO_PRECO' 
  | 'ACESSO_AUTENTICACAO' 
  | 'CONFIGURACAO_SISTEMA';

export type AuditSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AuditRecord {
  id: string;
  dataHora: string;
  timestamp: number;
  categoria: AuditCategory;
  severidade: AuditSeverity;
  usuarioId: string;
  usuarioNome: string;
  usuarioRole: string;
  autorizadorNome?: string;
  terminal: string;
  descricao: string;
  detalhesTecnicos?: {
    valorAnterior?: string | number;
    valorNovo?: string | number;
    documentoRef?: string;
    motivo?: string;
    impactoFinanceiro?: number;
  };
}
