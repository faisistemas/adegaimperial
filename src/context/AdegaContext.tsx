import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  loadFromStorage, 
  saveToStorage, 
  STORAGE_KEYS, 
  clearAllAdegaStorage 
} from '../utils/storage';
import { 
  User, Store, Product, Table, Comanda, Order, DoseAuditLog, 
  CashRegisterSession, FiscalDocument, Customer, CartItem, PaymentDetails, OrderStatus, PaymentMethod,
  PeripheralSettings, ScaleConfig, ThermalPrinterConfig, BarcodeScannerConfig,
  CashMovement, CashBlindCloseRecord, AccessLog, MultiPaymentSplit,
  RecipienteAberto, FichaTecnicaCombo, PerdaEstoqueRecord, PerdaEstoqueTipo,
  ProdutoLote, TorneiraChopp, TransferenciaLojas, InventarioCego, VasilhameSaldo,
  CategoryItem, MovimentacaoEstoque, TipoMovimentacaoEstoque,
  Motoboy, DeliveryPedido, CartaoConsumo, CartaoMovimentacao, KdsPedido, KdsStatus,
  RotaEntrega, WhatsappNotificacao, ClienteFidelidade, FidelidadeMovimento, FilaEsperaItem,
  DevolucaoVenda, DevolucaoItem, ReservaMesaAmbiente, NotificacaoReserva,
  Fornecedor, PedidoCompra, ItemPedidoCompra, StatusPedidoCompra, 
  RecebimentoMercadoria, ItemConferenciaRecebimento, StatusRecebimento
} from '../types';
import { 
  INITIAL_STORES, INITIAL_USERS, INITIAL_PRODUCTS, INITIAL_TABLES, INITIAL_CUSTOMERS,
  INITIAL_DEVOLUCOES, INITIAL_RESERVAS,
  INITIAL_FORNECEDORES, INITIAL_PEDIDOS_COMPRA, INITIAL_RECEBIMENTOS_MERCADORIA
} from '../data/mockData';
import { 
  INITIAL_RECIPIENTES_ABERTOS, 
  INITIAL_FICHAS_TECNICAS, 
  INITIAL_TORNEIRAS_CHOPP, 
  INITIAL_VASILHAMES, 
  INITIAL_PRODUTO_LOTES, 
  INITIAL_PERDAS_ESTOQUE, 
  INITIAL_TRANSFERENCIAS_LOJAS, 
  INITIAL_INVENTARIOS_CEGOS,
  INITIAL_CATEGORIES,
  INITIAL_MOVIMENTACOES_ESTOQUE
} from '../data/inventoryModule3Data';
import {
  INITIAL_MOTOBOYS,
  INITIAL_DELIVERY_PEDIDOS,
  INITIAL_KDS_PEDIDOS,
  INITIAL_CARTOES_CONSUMO,
  INITIAL_CARTOES_MOVIMENTACOES,
  INITIAL_ROTAS_ENTREGA,
  INITIAL_WHATSAPP_NOTIFICACOES,
  INITIAL_CLIENTES_FIDELIDADE,
  INITIAL_FIDELIDADE_EXTRATO,
  INITIAL_FILA_ESPERA
} from '../data/atendimentoModule4Data';
import {
  PerfilFiscal, CertificadoDigitalA1, DocumentoFiscalCompleto,
  ManifestacaoDFe, CartaCorrecaoEvento, InutilizacaoFaixa,
  RegraValidacaoAntiRejeicao, ConciliacaoFiscalPagamento,
  RessarcimentoIcmsSt, ReformaTributariaConfigItem,
  AuditoriaRiscoFiscal, ExportacaoContabilidade
} from '../types/fiscalTypes';
import {
  INITIAL_PERFIS_FISCAIS,
  INITIAL_CERTIFICADO_A1,
  INITIAL_DOCUMENTOS_FISCAIS,
  INITIAL_MANIFESTACOES_DFE,
  INITIAL_CARTAS_CORRECAO,
  INITIAL_INUTILIZACOES_FAIXA,
  INITIAL_REGRAS_VALIDACAO,
  INITIAL_CONCILIACOES_TEF,
  INITIAL_RESSARCIMENTOS_ICMS_ST,
  INITIAL_REFORMA_TRIBUTARIA,
  INITIAL_ALERTAS_RISCO_FISCAL,
  INITIAL_EXPORTACOES_CONTABILIDADE
} from '../data/fiscalModule5Data';
import { generateNfceKey } from '../utils/fiscalUtils';
import {
  ContaPagar, ContaReceber, OrdemCompra, ContaBancaria,
  ExtratoOfxTransacao, MetaColaborador, FranquiaUnidadeConfig,
  ItemMarkupPreco, CurvaAbcProduto, OrigemPagamento
} from '../types/backofficeTypes';
import {
  INITIAL_DRE_DATA,
  INITIAL_CURVA_ABC,
  INITIAL_CONTAS_PAGAR,
  INITIAL_CONTAS_RECEBER,
  INITIAL_FLUXO_CAIXA,
  INITIAL_ORDENS_COMPRA,
  INITIAL_CONTAS_BANCARIAS,
  INITIAL_OFX_TRANSACOES,
  INITIAL_METAS_COLABORADORES,
  INITIAL_FRANQUIA_CONFIGS,
  INITIAL_TABELA_MARKUP,
  INITIAL_COMPARATIVO_LOJAS
} from '../data/backofficeModule6Data';
import { AppSettings, INITIAL_APP_SETTINGS, AuditRecord } from '../types/financeiroGestaoTypes';
import { INITIAL_AUDIT_RECORDS } from '../data/financeiroGestaoData';

interface AdegaContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  stores: Store[];
  activeStore: Store;
  setActiveStore: (store: Store) => void;
  products: Product[];
  tables: Table[];
  comandas: Comanda[];
  orders: Order[];
  doseAuditLogs: DoseAuditLog[];
  cashSession: CashRegisterSession;
  cashMovements: CashMovement[];
  blindCloseRecords: CashBlindCloseRecord[];
  accessLogs: AccessLog[];
  fiscalDocuments: FiscalDocument[];
  customers: Customer[];
  
  // Periféricos & Hardware (Módulo 2)
  peripheralSettings: PeripheralSettings;
  updateScaleConfig: (partial: Partial<ScaleConfig>) => void;
  updatePrinterConfig: (partial: Partial<ThermalPrinterConfig>) => void;
  updateScannerConfig: (partial: Partial<BarcodeScannerConfig>) => void;

  // Segurança & Bloqueio de Tela Touch
  isScreenLocked: boolean;
  setScreenLocked: (locked: boolean) => void;
  unlockScreen: (pin: string) => { success: boolean; message?: string };
  verifyManagerPin: (pin: string) => { valid: boolean; manager?: User };

  // Actions
  switchUserRole: (roleUser: User) => void;
  switchStore: (storeId: string) => void;
  completeSale: (
    items: CartItem[], 
    payment: PaymentDetails, 
    orderType?: Order['orderType'],
    tableNumber?: number,
    comandaNumber?: number,
    customerCpf?: string,
    customerName?: string,
    deliveryInfo?: Order['deliveryInfo'],
    splitPayments?: MultiPaymentSplit[],
    customerId?: string
  ) => Order;

  // Consulta de Vendas e Devoluções
  devolucoesVendas: DevolucaoVenda[];
  realizarDevolucaoVenda: (dados: { 
    orderId: string; 
    itens: { produtoId: string; quantidade: number; destino: 'RETORNO_ESTOQUE' | 'PERDA_DESCARTE'; motivo: any; detalhes?: string }[]; 
    formaReembolso: 'DINHEIRO' | 'ESTORNO_PIX_CARTAO' | 'VALE_CREDITO_CLIENTE'; 
    motivoGeral: string;
    observacoes?: string;
  }) => { success: boolean; devolucao?: DevolucaoVenda; message: string };

  // Cadastro e Gestão de Clientes
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'loyaltyPoints' | 'lastPurchaseDate'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => { success: boolean; message?: string };
  ajustarSaldoCreditoCliente: (customerId: string, deltaValor: number, motivo: string) => void;

  // Reservas e Notificações Relacionadas
  reservas: ReservaMesaAmbiente[];
  criarReserva: (reserva: Omit<ReservaMesaAmbiente, 'id' | 'codigo' | 'criadoEm' | 'notificacoes'>) => ReservaMesaAmbiente;
  atualizarStatusReserva: (reservaId: string, novoStatus: ReservaMesaAmbiente['status']) => void;
  fazerCheckinReserva: (reservaId: string) => { success: boolean; message: string };
  cancelarReserva: (reservaId: string, motivo?: string) => void;
  enviarNotificacaoReserva: (reservaId: string, tipo: 'CONFIRMACAO' | 'LEMBRETE_2H' | 'ALTERACAO' | 'CANCELAMENTO', mensagemCustom?: string) => { success: boolean; mensagem: string };
  
  // Dose & Estoque
  debitDoseStock: (productId: string, dosesCount: number, orderId?: string, operatorName?: string) => void;
  recordDoseLoss: (productId: string, ml: number, reason: 'WASTE' | 'TASTING', notes: string) => void;
  restockProduct: (productId: string, additionalUnits: number, motivo?: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  transferStockBetweenStores: (productId: string, targetStoreName: string, quantity: number) => void;

  // Categorias
  categories: CategoryItem[];
  addCategory: (category: CategoryItem) => void;
  updateCategory: (category: CategoryItem) => void;
  deleteCategory: (categoryId: string) => { success: boolean; message?: string };

  // Movimentações & Kardex
  movimentacoesEstoque: MovimentacaoEstoque[];
  registrarMovimentacaoEstoque: (mov: Omit<MovimentacaoEstoque, 'id' | 'dataHora'>) => void;

  // Lotes
  addProdutoLote: (lote: Omit<ProdutoLote, 'id'>) => void;
  darBaixaLote: (loteId: string, quantidade: number, motivo: string) => void;

  // Mesas e Comandas
  updateTable: (tableId: number, partial: Partial<Table>) => void;
  addOrderToTable: (tableId: number, items: CartItem[]) => void;
  closeTableAccount: (tableId: number, payment: PaymentDetails) => Order | null;
  createComanda: (number: number, customerName: string, customerCpf?: string) => void;
  addOrderToComanda: (comandaId: string, items: CartItem[]) => void;
  closeComanda: (comandaId: string, payment: PaymentDetails) => Order | null;

  // Delivery
  updateDeliveryStatus: (orderId: string, status: OrderStatus, courierId?: string, courierName?: string) => void;

  // Caixa & Turnos (Módulo 2)
  openCashSession: (initialAmount: number, terminalNumber?: string) => void;
  closeCashSession: () => void;
  performCashMovement: (type: 'BLEED' | 'SUPPLY', amount: number, reason: string) => void;
  performSangria: (amount: number, reason: string, managerPin: string) => { success: boolean; movement?: CashMovement; error?: string };
  performSuprimento: (amount: number, reason: string) => CashMovement;
  performBlindClose: (declared: { cash: number; credit: number; debit: number; pix: number; notes?: string }) => CashBlindCloseRecord;

  // Módulo 3: Gestão de Estoque Avançada, Combos, Chopeiras, Lotes e Vasilhames
  recipientesAbertos: RecipienteAberto[];
  fichasTecnicas: FichaTecnicaCombo[];
  torneirasChopp: TorneiraChopp[];
  vasilhames: VasilhameSaldo[];
  produtoLotes: ProdutoLote[];
  perdasEstoque: PerdaEstoqueRecord[];
  transferenciasLojas: TransferenciaLojas[];
  inventarios: InventarioCego[];

  abrirNovaGarrafa: (produtoId: string) => { success: boolean; message: string };
  finalizarGarrafaAberta: (recipienteId: string) => void;
  salvarFichaTecnica: (ficha: FichaTecnicaCombo) => void;
  venderChoppTorneira: (torneiraId: string, volumeLitros: number) => { success: boolean; message: string };
  ajustarFatorPerdaEspuma: (torneiraId: string, novoFatorPercent: number) => void;
  registrarPerdaEstoque: (
    produtoId: string,
    quantidade: number,
    unidade: string,
    tipo: PerdaEstoqueTipo,
    justificativa: string
  ) => PerdaEstoqueRecord;
  atualizarSaldoVasilhame: (produtoId: string, deltaVazios: number) => void;
  criarTransferenciaLoja: (transferencia: Omit<TransferenciaLojas, 'id' | 'dataEnvio'>) => TransferenciaLojas;
  concluirTransferenciaLoja: (transferenciaId: string) => void;
  iniciarInventarioCego: () => InventarioCego;
  finalizarInventarioCego: (inventarioId: string, contagens: { produtoId: string; quantidadeContada: number }[]) => InventarioCego;
  calcularCustoMedioPonderado: (produtoId: string, qtdEntrada: number, custoEntrada: number) => number;

  // Módulo 4: Atendimento, Salão, Delivery, KDS, RFID, Roteirização & Fidelidade
  motoboys: Motoboy[];
  deliveryPedidos: DeliveryPedido[];
  kdsPedidos: KdsPedido[];
  cartoesConsumo: CartaoConsumo[];
  cartoesMovimentacoes: CartaoMovimentacao[];
  rotasEntrega: RotaEntrega[];
  whatsappNotificacoes: WhatsappNotificacao[];
  clientesFidelidade: ClienteFidelidade[];
  fidelidadeExtrato: FidelidadeMovimento[];
  filaEspera: FilaEsperaItem[];

  // Salão & Mesas Avançado
  juntarMesas: (mesaOrigemId: number, mesaDestinoId: number) => { success: boolean; message: string };
  transferirItensMesa: (origemMesaId: number, destinoMesaId: number, itemIndex: number, quantidade: number) => void;
  transferirComandaCompletaMesa: (origemMesaId: number, destinoMesaId: number) => { success: boolean; message: string };
  removerCouvertMesa: (mesaId: number, gerentePin: string) => { success: boolean; message: string };
  definirConsumacaoMinimaMesa: (mesaId: number, valorMinimo: number) => void;

  // Cartões Pré-pagos / RFID
  recargaCartaoRfid: (codigoRfid: string, valor: number, metodo: PaymentMethod) => { success: boolean; message: string };
  debitarCartaoRfid: (codigoRfid: string, valor: number, descricao: string) => { success: boolean; message: string };
  encerrarEstornarCartaoRfid: (codigoRfid: string) => { success: boolean; valorEstornado: number; message: string };
  vincularRfidComanda: (comandaId: string, codigoRfid: string) => void;

  // KDS - Kitchen & Bar Display System
  atualizarStatusKds: (kdsId: string, novoStatus: KdsStatus) => void;
  adicionarPedidoAoKds: (pedido: Omit<KdsPedido, 'id' | 'tempoDecorridoMinutos'>) => void;

  // Delivery & Motoboys
  criarDeliveryPedido: (pedido: Omit<DeliveryPedido, 'id' | 'orderId' | 'orderCode' | 'horaPedido'>) => DeliveryPedido;
  despacharPedidoDelivery: (pedidoId: string, motoboyId: string) => void;
  concluirEntregaDelivery: (pedidoId: string) => void;
  criarRotaLote: (motoboyId: string, pedidosIds: string[], bairro: string) => RotaEntrega;
  cadastrarMotoboy: (motoboy: Omit<Motoboy, 'id' | 'entregasRealizadasHoje' | 'totalTaxasAcumuladasHoje' | 'totalDinheiroRecebidoHoje' | 'totalCartaoRecebidoHoje' | 'statusAcerto'>) => void;
  liquidarAcertoMotoboy: (motoboyId: string) => { success: boolean; recibo: string };

  // Notificações WhatsApp
  enviarNotificacaoWhatsapp: (telefone: string, nome: string, tipo: WhatsappNotificacao['tipoMensagem'], textoCustom?: string) => WhatsappNotificacao;

  // Fidelidade & Cashback
  acumularCashbackCompra: (cpfOuTelefone: string, valorGasto: number, pedidoCodigo: string) => { cashbackGanho: number; novoSaldo: number };
  resgatarCashback: (clienteId: string, valorResgate: number) => { success: boolean; message: string };

  // Fila de Espera Digital
  adicionarFilaEspera: (nome: string, telefone: string, pessoas: number, observacao?: string) => FilaEsperaItem;
  chamarClienteFila: (filaId: string, mesaNumero?: number) => void;
  alocarClienteFilaMesa: (filaId: string, mesaId: number) => void;
  removerClienteFila: (filaId: string, motivo?: 'DESISTIU' | 'ALOCADO') => void;

  // ============================================================
  // MÓDULO 5: Fiscal e Conformidade Tributária Brasileira
  // ============================================================
  documentosFiscais: DocumentoFiscalCompleto[];
  perfisFiscais: PerfilFiscal[];
  certificadoDigital: CertificadoDigitalA1;
  offlineContingencyMode: boolean;
  setOfflineContingencyMode: (active: boolean) => void;
  manifestacoesDfe: ManifestacaoDFe[];
  cartasCorrecao: CartaCorrecaoEvento[];
  inutilizacoesFaixa: InutilizacaoFaixa[];
  regrasValidacaoFiscal: RegraValidacaoAntiRejeicao[];
  conciliacoesTef: ConciliacaoFiscalPagamento[];
  ressarcimentosIcmsSt: RessarcimentoIcmsSt[];
  reformaTributariaItens: ReformaTributariaConfigItem[];
  auditoriaRiscos: AuditoriaRiscoFiscal[];
  exportacaoContabil: ExportacaoContabilidade;
  
  // Ações Módulo 5
  emitirDocumentoFiscal: (doc: DocumentoFiscalCompleto) => void;
  cancelarDocumentoFiscal: (docId: string, justificativa: string) => { success: boolean; message: string };
  sincronizarContingencias: () => { sincronizadas: number; message: string };
  manifestarDFe: (dfeId: string, status: ManifestacaoDFe['statusManifestacao']) => { success: boolean; message: string };
  importarDFeParaEstoque: (dfeId: string) => { success: boolean; itensImportados: number; message: string };
  emitirCartaCorrecao: (cce: CartaCorrecaoEvento) => void;
  inutilizarFaixaNumeracao: (inut: InutilizacaoFaixa) => void;
  resolverAlertaRisco: (alertaId: string) => void;
  atualizarCertificado: (partial: Partial<CertificadoDigitalA1>) => void;
  agendarEnvioContador: (email: string, mesCompetencia: string) => void;

  // ============================================================
  // MÓDULO 6: Retaguarda Administrativa, Backoffice Financeiro & Multilojas
  // ============================================================
  contasPagar: ContaPagar[];
  contasReceber: ContaReceber[];
  ordensCompra: OrdemCompra[];
  contasBancarias: ContaBancaria[];
  ofxTransacoes: ExtratoOfxTransacao[];
  metasColaboradores: MetaColaborador[];
  franquiaConfigs: FranquiaUnidadeConfig[];
  tabelaMarkup: ItemMarkupPreco[];
  curvaAbcItens: CurvaAbcProduto[];

  // Ações Módulo 6
  adicionarContaPagar: (conta: Omit<ContaPagar, 'id' | 'valorPago' | 'status'>) => void;
  baixarContaPagar: (id: string, valorPago: number, origem: OrigemPagamento) => { success: boolean; message: string };
  cancelarContaPagar: (id: string) => void;
  conciliarContaReceber: (id: string) => void;
  reportarDivergenciaReceber: (id: string, motivo: string) => void;
  adicionarOrdemCompra: (ordem: Omit<OrdemCompra, 'id' | 'codigo'>) => void;
  aprovarOrdemCompra: (id: string) => void;
  receberOrdemCompraEstoque: (id: string) => { success: boolean; itensRecebidos: number; message: string };
  importarTransacoesOfx: (transacoes: ExtratoOfxTransacao[]) => { importadas: number };
  conciliarTransacaoOfx: (id: string, documentoVinculado?: string) => void;
  atualizarMarkupProduto: (produtoId: string, novoMarkup: number, novoPreco: number) => void;
  replicarPrecosParaRede: () => { produtosAtualizados: number; message: string };
  atualizarStatusFranquia: (lojaId: string, novoStatus: FranquiaUnidadeConfig['statusPagamento']) => void;

  // ============================================================
  // MÓDULO DE COMPRAS E FORNECEDORES
  // ============================================================
  fornecedores: Fornecedor[];
  pedidosCompra: PedidoCompra[];
  recebimentosMercadoria: RecebimentoMercadoria[];
  adicionarFornecedor: (fornecedor: Omit<Fornecedor, 'id' | 'totalPedidosRealizados' | 'valorTotalComprado'>) => Fornecedor;
  atualizarFornecedor: (fornecedor: Fornecedor) => void;
  excluirFornecedor: (id: string) => { success: boolean; message: string };
  adicionarPedidoCompra: (pedido: Omit<PedidoCompra, 'id' | 'codigo' | 'dataEmissao' | 'historicoStatus'>) => PedidoCompra;
  atualizarPedidoCompra: (pedido: PedidoCompra) => void;
  atualizarStatusPedidoCompra: (id: string, status: StatusPedidoCompra, observacao?: string) => void;
  cancelarPedidoCompra: (id: string, motivo: string) => void;
  realizarRecebimentoMercadoria: (dados: {
    pedidoCompraId?: string;
    fornecedorId: string;
    notaFiscalNumero?: string;
    notaFiscalChave?: string;
    itens: Array<{
      produtoId: string;
      quantidadeRecebida: number;
      precoCustoUnitario: number;
      fatorConversao?: number;
      loteNumero?: string;
      dataValidade?: string;
      localArmazenamento?: string;
      avariasOuQuebras?: number;
      observacao?: string;
    }>;
    gerarContaPagar?: boolean;
    condicaoPagamento?: string;
    dataVencimentoBoleto?: string;
    observacoesGerais?: string;
  }) => { success: boolean; recebimento: RecebimentoMercadoria; message: string };

  // Notificações / Alertas
  notifications: string[];
  dismissNotification: (index: number) => void;

  // Persistência e Backup
  resetarDadosParaPadrao: () => void;

  // Módulo Financeiro e Gestão
  appSettings: AppSettings;
  updateAppSettings: (partialOrFn: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)) => void;
  auditRecords: AuditRecord[];
  recordAudit: (audit: Omit<AuditRecord, 'id' | 'dataHora' | 'timestamp'>) => void;
}

const AdegaContext = createContext<AdegaContextType | undefined>(undefined);

const DEFAULT_INITIAL_COMANDAS: Comanda[] = [];

const DEFAULT_INITIAL_ORDERS: Order[] = [];

export const AdegaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Começa com Super Admin
  const [stores] = useState<Store[]>(INITIAL_STORES);
  const [activeStore, setActiveStore] = useState<Store>(INITIAL_STORES[0]);
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [tables, setTables] = useState<Table[]>(() => loadFromStorage(STORAGE_KEYS.TABLES, INITIAL_TABLES));
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
    return (loaded || []).filter(c => !['cust-1', 'cust-2', 'cust-3', 'cust-4'].includes(c.id));
  });
  const [devolucoesVendas, setDevolucoesVendas] = useState<DevolucaoVenda[]>(() => loadFromStorage(STORAGE_KEYS.DEVOLUCOES, INITIAL_DEVOLUCOES));
  const [reservas, setReservas] = useState<ReservaMesaAmbiente[]>(() => loadFromStorage(STORAGE_KEYS.RESERVAS, INITIAL_RESERVAS));

  // Módulo de Compras e Fornecedores
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => loadFromStorage(STORAGE_KEYS.FORNECEDORES, INITIAL_FORNECEDORES));
  const [pedidosCompra, setPedidosCompra] = useState<PedidoCompra[]>(() => loadFromStorage(STORAGE_KEYS.PEDIDOS_COMPRA, INITIAL_PEDIDOS_COMPRA));
  const [recebimentosMercadoria, setRecebimentosMercadoria] = useState<RecebimentoMercadoria[]>(() => loadFromStorage(STORAGE_KEYS.RECEBIMENTOS, INITIAL_RECEBIMENTOS_MERCADORIA));

  // Módulo 6: Backoffice Financeiro & Retaguarda Multilojas
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(() => loadFromStorage(STORAGE_KEYS.CONTAS_PAGAR, INITIAL_CONTAS_PAGAR));
  const [contasReceber, setContasReceber] = useState<ContaReceber[]>(() => loadFromStorage(STORAGE_KEYS.CONTAS_RECEBER, INITIAL_CONTAS_RECEBER));
  const [ordensCompra, setOrdensCompra] = useState<OrdemCompra[]>(INITIAL_ORDENS_COMPRA);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>(INITIAL_CONTAS_BANCARIAS);
  const [ofxTransacoes, setOfxTransacoes] = useState<ExtratoOfxTransacao[]>(INITIAL_OFX_TRANSACOES);
  const [metasColaboradores, setMetasColaboradores] = useState<MetaColaborador[]>(INITIAL_METAS_COLABORADORES);
  const [franquiaConfigs, setFranquiaConfigs] = useState<FranquiaUnidadeConfig[]>(INITIAL_FRANQUIA_CONFIGS);
  const [tabelaMarkup, setTabelaMarkup] = useState<ItemMarkupPreco[]>(INITIAL_TABELA_MARKUP);
  const [curvaAbcItens, setCurvaAbcItens] = useState<CurvaAbcProduto[]>(INITIAL_CURVA_ABC);

  // Módulo 3: Estoque Avançado, Fichas Técnicas, Lotes, Chopeiras e Cascos
  const [recipientesAbertos, setRecipientesAbertos] = useState<RecipienteAberto[]>(() => loadFromStorage(STORAGE_KEYS.RECIPIENTES_ABERTOS, INITIAL_RECIPIENTES_ABERTOS));
  const [fichasTecnicas, setFichasTecnicas] = useState<FichaTecnicaCombo[]>(INITIAL_FICHAS_TECNICAS);
  const [torneirasChopp, setTorneirasChopp] = useState<TorneiraChopp[]>(() => loadFromStorage(STORAGE_KEYS.TORNEIRAS_CHOPP, INITIAL_TORNEIRAS_CHOPP));
  const [vasilhames, setVasilhames] = useState<VasilhameSaldo[]>(() => loadFromStorage(STORAGE_KEYS.VASILHAMES, INITIAL_VASILHAMES));
  const [produtoLotes, setProdutoLotes] = useState<ProdutoLote[]>(() => loadFromStorage(STORAGE_KEYS.PRODUTO_LOTES, INITIAL_PRODUTO_LOTES));
  const [perdasEstoque, setPerdasEstoque] = useState<PerdaEstoqueRecord[]>(() => loadFromStorage(STORAGE_KEYS.PERDAS_ESTOQUE, INITIAL_PERDAS_ESTOQUE));
  const [transferenciasLojas, setTransferenciasLojas] = useState<TransferenciaLojas[]>(INITIAL_TRANSFERENCIAS_LOJAS);
  const [inventarios, setInventarios] = useState<InventarioCego[]>(INITIAL_INVENTARIOS_CEGOS);
  const [categories, setCategories] = useState<CategoryItem[]>(() => loadFromStorage(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES));
  const [movimentacoesEstoque, setMovimentacoesEstoque] = useState<MovimentacaoEstoque[]>(() => loadFromStorage(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE, INITIAL_MOVIMENTACOES_ESTOQUE));

  // Módulo 4: Atendimento, Salão, Delivery, KDS, RFID, Roteirização & Fidelidade
  const [motoboys, setMotoboys] = useState<Motoboy[]>(INITIAL_MOTOBOYS);
  const [deliveryPedidos, setDeliveryPedidos] = useState<DeliveryPedido[]>(INITIAL_DELIVERY_PEDIDOS);
  const [kdsPedidos, setKdsPedidos] = useState<KdsPedido[]>(INITIAL_KDS_PEDIDOS);
  const [cartoesConsumo, setCartoesConsumo] = useState<CartaoConsumo[]>(INITIAL_CARTOES_CONSUMO);
  const [cartoesMovimentacoes, setCartoesMovimentacoes] = useState<CartaoMovimentacao[]>(INITIAL_CARTOES_MOVIMENTACOES);
  const [rotasEntrega, setRotasEntrega] = useState<RotaEntrega[]>(INITIAL_ROTAS_ENTREGA);
  const [whatsappNotificacoes, setWhatsappNotificacoes] = useState<WhatsappNotificacao[]>(INITIAL_WHATSAPP_NOTIFICACOES);
  const [clientesFidelidade, setClientesFidelidade] = useState<ClienteFidelidade[]>(INITIAL_CLIENTES_FIDELIDADE);
  const [fidelidadeExtrato, setFidelidadeExtrato] = useState<FidelidadeMovimento[]>(INITIAL_FIDELIDADE_EXTRATO);
  const [filaEspera, setFilaEspera] = useState<FilaEsperaItem[]>(INITIAL_FILA_ESPERA);

  // Atualização em tempo real dos minutos decorridos no KDS e na Fila de Espera
  useEffect(() => {
    const timer = setInterval(() => {
      setKdsPedidos(prev => prev.map(k => ({
        ...k,
        tempoDecorridoMinutos: Math.max(0, Math.floor((Date.now() - k.timestampEntrada) / 60000))
      })));
      setFilaEspera(prev => prev.map(f => ({
        ...f,
        tempoAguardandoMinutos: f.tempoAguardandoMinutos + 1
      })));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const [comandas, setComandas] = useState<Comanda[]>(() => loadFromStorage(STORAGE_KEYS.COMANDAS, DEFAULT_INITIAL_COMANDAS));
  const [orders, setOrders] = useState<Order[]>(() => loadFromStorage(STORAGE_KEYS.ORDERS, DEFAULT_INITIAL_ORDERS));

  const [doseAuditLogs, setDoseAuditLogs] = useState<DoseAuditLog[]>([]);

  const [cashSession, setCashSession] = useState<CashRegisterSession>({
    id: `cx-${new Date().toISOString().split('T')[0]}`,
    storeId: 'store-1',
    operatorId: 'u-1',
    operatorName: 'Administrador',
    openedAt: '',
    initialCash: 0,
    currentCash: 0,
    totalSalesPix: 0,
    totalSalesCard: 0,
    totalSalesCash: 0,
    bleedAmount: 0,
    supplyAmount: 0,
    isOpen: false,
  });

  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);

  const [blindCloseRecords, setBlindCloseRecords] = useState<CashBlindCloseRecord[]>([]);

  // ============================================================
  // SINCRONIZAÇÃO AUTOMÁTICA EM TEMPO REAL NO LOCALSTORAGE
  // Garante que nenhum produto, venda, fornecedor ou cliente se perca no F5
  // ============================================================
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.FORNECEDORES, fornecedores);
  }, [fornecedores]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PEDIDOS_COMPRA, pedidosCompra);
  }, [pedidosCompra]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECEBIMENTOS, recebimentosMercadoria);
  }, [recebimentosMercadoria]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PRODUTO_LOTES, produtoLotes);
  }, [produtoLotes]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.MOVIMENTACOES_ESTOQUE, movimentacoesEstoque);
  }, [movimentacoesEstoque]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.DEVOLUCOES, devolucoesVendas);
  }, [devolucoesVendas]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RESERVAS, reservas);
  }, [reservas]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONTAS_PAGAR, contasPagar);
  }, [contasPagar]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CONTAS_RECEBER, contasReceber);
  }, [contasReceber]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.COMANDAS, comandas);
  }, [comandas]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TABLES, tables);
  }, [tables]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.RECIPIENTES_ABERTOS, recipientesAbertos);
  }, [recipientesAbertos]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.PERDAS_ESTOQUE, perdasEstoque);
  }, [perdasEstoque]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.TORNEIRAS_CHOPP, torneirasChopp);
  }, [torneirasChopp]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.VASILHAMES, vasilhames);
  }, [vasilhames]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }, [users]);

  const resetarDadosParaPadrao = () => {
    clearAllAdegaStorage();
    setProducts(INITIAL_PRODUCTS);
    setCustomers(INITIAL_CUSTOMERS);
    setOrders(DEFAULT_INITIAL_ORDERS);
    setFornecedores(INITIAL_FORNECEDORES);
    setPedidosCompra(INITIAL_PEDIDOS_COMPRA);
    setRecebimentosMercadoria(INITIAL_RECEBIMENTOS_MERCADORIA);
    setProdutoLotes(INITIAL_PRODUTO_LOTES);
    setMovimentacoesEstoque(INITIAL_MOVIMENTACOES_ESTOQUE);
    setDevolucoesVendas(INITIAL_DEVOLUCOES);
    setReservas(INITIAL_RESERVAS);
    setUsers(INITIAL_USERS);
    setContasPagar(INITIAL_CONTAS_PAGAR);
    setContasReceber(INITIAL_CONTAS_RECEBER);
    setComandas(DEFAULT_INITIAL_COMANDAS);
    setTables(INITIAL_TABLES);
    setCategories(INITIAL_CATEGORIES);
    setRecipientesAbertos(INITIAL_RECIPIENTES_ABERTOS);
    setPerdasEstoque(INITIAL_PERDAS_ESTOQUE);
    setTorneirasChopp(INITIAL_TORNEIRAS_CHOPP);
    setVasilhames(INITIAL_VASILHAMES);
    setNotifications((prev) => ['Catálogo e dados do sistema restaurados para os dados padrão.', ...prev]);
  };

  // Periféricos & Hardware Settings
  const [peripheralSettings, setPeripheralSettings] = useState<PeripheralSettings>({
    scale: {
      protocol: 'TOLEDO_PRIX3',
      connectionType: 'WEB_SERIAL',
      port: 'COM1',
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
      readingMode: 'CONTINUOUS',
      autoPriceWeighedProducts: true,
      timeoutMs: 1500,
      lastWeightSample: 1.250,
      isConnected: true,
      rawFrameFormat: 'STX + Peso (5 bytes) + ETX',
    },
    printer: {
      model: 'ESC_POS_80MM',
      connectionType: 'USB_DIRECT',
      ipAddress: '192.168.1.200',
      tcpPort: 9100,
      autoCut: true,
      openDrawer: true,
      copies: 1,
      paperWidthMm: 80,
      printDensity: 'NORMAL',
      isConnected: true,
    },
    scanner: {
      mode: 'KEYBOARD_HID',
      prefix: '',
      suffix: 'ENTER',
      minCharLength: 8,
      playBeepOnScan: true,
      active: true,
    },
  });

  // Tela de Bloqueio Touch
  const [isScreenLocked, setScreenLocked] = useState<boolean>(false);

  // Configurações Globais da Aplicação
  const [appSettings, setAppSettings] = useState<AppSettings>(() => 
    loadFromStorage<AppSettings>(STORAGE_KEYS.APP_SETTINGS, INITIAL_APP_SETTINGS)
  );

  // Auditoria Geral de Operações Críticas
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>(() =>
    loadFromStorage<AuditRecord[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_RECORDS)
  );

  const recordAudit = (audit: Omit<AuditRecord, 'id' | 'dataHora' | 'timestamp'>) => {
    const dataHoraStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newRecord: AuditRecord = {
      ...audit,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataHora: dataHoraStr,
      timestamp: Date.now(),
    };
    setAuditRecords((prev) => {
      const updated = [newRecord, ...prev];
      saveToStorage(STORAGE_KEYS.AUDIT_LOGS, updated);
      return updated;
    });
  };

  const updateAppSettings = (
    partialOrFn: Partial<AppSettings> | ((prev: AppSettings) => AppSettings)
  ) => {
    setAppSettings((prev) => {
      const next = typeof partialOrFn === 'function' ? partialOrFn(prev) : { ...prev, ...partialOrFn };
      saveToStorage(STORAGE_KEYS.APP_SETTINGS, next);
      return next;
    });
    setNotifications((prev) => ['Configurações da aplicação salvas com sucesso!', ...prev]);
    recordAudit({
      categoria: 'CONFIGURACAO_SISTEMA',
      severidade: 'MEDIUM',
      usuarioId: currentUser.id,
      usuarioNome: currentUser.name,
      usuarioRole: currentUser.role,
      terminal: 'Painel Geral de Configurações',
      descricao: 'Parâmetros e configurações da aplicação foram atualizados',
    });
  };

  // Logs de Acesso e Auditoria (PostgreSQL logs_acesso)
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: 'log-1',
      usuarioId: 'u-3',
      usuarioNome: 'Lucas Ferreira',
      lojaId: 'store-1',
      ipOrigem: '192.168.1.50 (PDV 01)',
      acao: 'LOGIN_SUCESSO',
      dataHora: '15/09/2026 15:58',
      detalhes: 'Operador autenticado via PIN rápido no terminal PDV Touch',
    },
    {
      id: 'log-2',
      usuarioId: 'u-3',
      usuarioNome: 'Lucas Ferreira',
      lojaId: 'store-1',
      ipOrigem: '192.168.1.50 (PDV 01)',
      acao: 'ABERTURA_CAIXA',
      dataHora: '15/09/2026 16:00',
      detalhes: 'Abertura do Caixa 01 com Fundo de Troco inicial de R$ 200,00',
    },
  ]);

  const addAccessLog = (acao: AccessLog['acao'], detalhes?: string) => {
    const newLog: AccessLog = {
      id: `log-${Date.now()}`,
      usuarioId: currentUser.id,
      usuarioNome: currentUser.name,
      lojaId: activeStore.id,
      ipOrigem: '192.168.1.50 (PDV 01)',
      acao,
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      detalhes,
    };
    setAccessLogs((prev) => [newLog, ...prev]);
  };

  const updateScaleConfig = (partial: Partial<ScaleConfig>) => {
    setPeripheralSettings((prev) => ({
      ...prev,
      scale: { ...prev.scale, ...partial },
    }));
    setNotifications((prev) => [
      `Configuração da Balança atualizada: ${partial.protocol || prev.scale.protocol} (${partial.port || prev.scale.port}).`,
      ...prev,
    ]);
  };

  const updatePrinterConfig = (partial: Partial<ThermalPrinterConfig>) => {
    setPeripheralSettings((prev) => ({
      ...prev,
      printer: { ...prev.printer, ...partial },
    }));
    setNotifications((prev) => [
      `Configuração da Impressora Térmica atualizada: ${partial.model || prev.printer.model}.`,
      ...prev,
    ]);
  };

  const updateScannerConfig = (partial: Partial<BarcodeScannerConfig>) => {
    setPeripheralSettings((prev) => ({
      ...prev,
      scanner: { ...prev.scanner, ...partial },
    }));
  };

  const verifyManagerPin = (pin: string): { valid: boolean; manager?: User } => {
    const manager = users.find(
      (u) => (u.role === 'STORE_MANAGER' || u.role === 'SUPER_ADMIN') && u.pin === pin
    );
    if (manager) {
      return { valid: true, manager };
    }
    return { valid: false };
  };

  const unlockScreen = (pin: string): { success: boolean; message?: string } => {
    // Permite desbloquear com o PIN do operador atual ou com PIN de Gerente/Admin
    const isOwner = currentUser.pin === pin;
    const managerAuth = verifyManagerPin(pin);

    if (isOwner || managerAuth.valid) {
      setScreenLocked(false);
      addAccessLog('DESBLOQUEIO_TELA', `Terminal desbloqueado por ${isOwner ? currentUser.name : managerAuth.manager?.name}`);
      return { success: true };
    }
    return { success: false, message: 'PIN inválido! Digite o PIN do operador ou de um gerente.' };
  };

  const [fiscalDocuments, setFiscalDocuments] = useState<FiscalDocument[]>([
    {
      id: 'fisc-1',
      orderId: 'ord-101',
      number: 101,
      series: 1,
      type: 'NFCe',
      accessKey: '35260912345678000190650010000001011128392109',
      authorizationProtocol: '135269988112233',
      issuedAt: '15/09/2026 21:30',
      status: 'AUTORIZADA',
      totalValue: 81.60,
      xmlMock: '<nfeProc versao="4.00"><NFe><infNFe Id="NFe35260912345678000190650010000001011128392109">...</infNFe></NFe></nfeProc>',
    }
  ]);

  // ============================================================
  // MÓDULO 5: Fiscal e Conformidade Tributária Brasileira (State)
  // ============================================================
  const [documentosFiscais, setDocumentosFiscais] = useState<DocumentoFiscalCompleto[]>(INITIAL_DOCUMENTOS_FISCAIS);
  const [perfisFiscais] = useState<PerfilFiscal[]>(INITIAL_PERFIS_FISCAIS);
  const [certificadoDigital, setCertificadoDigital] = useState<CertificadoDigitalA1>(INITIAL_CERTIFICADO_A1);
  const [offlineContingencyMode, setOfflineContingencyMode] = useState<boolean>(false);
  const [manifestacoesDfe, setManifestacoesDfe] = useState<ManifestacaoDFe[]>(INITIAL_MANIFESTACOES_DFE);
  const [cartasCorrecao, setCartasCorrecao] = useState<CartaCorrecaoEvento[]>(INITIAL_CARTAS_CORRECAO);
  const [inutilizacoesFaixa, setInutilizacoesFaixa] = useState<InutilizacaoFaixa[]>(INITIAL_INUTILIZACOES_FAIXA);
  const [regrasValidacaoFiscal] = useState<RegraValidacaoAntiRejeicao[]>(INITIAL_REGRAS_VALIDACAO);
  const [conciliacoesTef, setConciliacoesTef] = useState<ConciliacaoFiscalPagamento[]>(INITIAL_CONCILIACOES_TEF);
  const [ressarcimentosIcmsSt, setRessarcimentosIcmsSt] = useState<RessarcimentoIcmsSt[]>(INITIAL_RESSARCIMENTOS_ICMS_ST);
  const [reformaTributariaItens] = useState<ReformaTributariaConfigItem[]>(INITIAL_REFORMA_TRIBUTARIA);
  const [auditoriaRiscos, setAuditoriaRiscos] = useState<AuditoriaRiscoFiscal[]>(INITIAL_ALERTAS_RISCO_FISCAL);
  const [exportacaoContabil, setExportacaoContabil] = useState<ExportacaoContabilidade>(INITIAL_EXPORTACOES_CONTABILIDADE);


  const [notifications, setNotifications] = useState<string[]>([
    'AdeGaswg: Caixa do turno da noite aberto com sucesso (Fundo: R$ 200,00).',
    'Estoque: Gin Tanqueray atingiu nível de atenção na garrafa aberta (550ml restantes).',
    'Novo pedido de delivery despachado para Motoboy Thiago.',
  ]);

  const dismissNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const switchUserRole = (user: User) => {
    setCurrentUser(user);
    setNotifications((prev) => [
      `Sessão alterada: Operador ${user.name} (${user.role}) conectado.`,
      ...prev,
    ]);
  };

  const switchStore = (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    if (store) {
      setActiveStore(store);
      setNotifications((prev) => [
        `Unidade alternada para: ${store.name}.`,
        ...prev,
      ]);
    }
  };

  // Fracionamento de Doses
  const debitDoseStock = (productId: string, dosesCount: number, orderId?: string, operatorName?: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId || !prod.isFractionable) return prod;

        const doseMl = prod.doseVolumeMl || 50;
        const totalMlNeeded = dosesCount * doseMl;
        let currentOpenMl = prod.openBottleVolumeMl ?? (prod.bottleVolumeMl || 1000);
        let sealedUnits = prod.stockUnits;
        const bottleCapacity = prod.bottleVolumeMl || 1000;

        if (currentOpenMl >= totalMlNeeded) {
          currentOpenMl -= totalMlNeeded;
        } else {
          // A garrafa atual não é suficiente: zera ela e abre uma nova garrafa lacrada do estoque
          const deficit = totalMlNeeded - currentOpenMl;
          if (sealedUnits > 0) {
            sealedUnits -= 1;
            currentOpenMl = bottleCapacity - deficit;
          } else {
            currentOpenMl = 0;
          }
        }

        // Registrar auditoria
        const newAudit: DoseAuditLog = {
          id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          productId: prod.id,
          productName: prod.name,
          volumeDoseMl: totalMlNeeded,
          remainingBottleMl: currentOpenMl,
          bottleTotalMl: bottleCapacity,
          timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          operatorName: operatorName || currentUser.name,
          orderId,
          type: 'SALE',
          notes: `${dosesCount} dose(s) de ${doseMl}ml debitada(s) com sucesso.`,
        };
        setDoseAuditLogs((audits) => [newAudit, ...audits]);

        return {
          ...prod,
          stockUnits: sealedUnits,
          openBottleVolumeMl: currentOpenMl,
        };
      })
    );
  };

  const recordDoseLoss = (productId: string, ml: number, reason: 'WASTE' | 'TASTING', notes: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        const currentOpenMl = Math.max(0, (prod.openBottleVolumeMl || 0) - ml);
        
        const newAudit: DoseAuditLog = {
          id: `aud-loss-${Date.now()}`,
          productId: prod.id,
          productName: prod.name,
          volumeDoseMl: ml,
          remainingBottleMl: currentOpenMl,
          bottleTotalMl: prod.bottleVolumeMl || 1000,
          timestamp: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          operatorName: currentUser.name,
          type: reason,
          notes,
        };
        setDoseAuditLogs((audits) => [newAudit, ...audits]);

        return { ...prod, openBottleVolumeMl: currentOpenMl };
      })
    );
  };

  const registrarMovimentacaoEstoque = (mov: Omit<MovimentacaoEstoque, 'id' | 'dataHora'>) => {
    const dataHoraStr = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const novaMov: MovimentacaoEstoque = {
      ...mov,
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataHora: dataHoraStr,
    };
    setMovimentacoesEstoque((prev) => [novaMov, ...prev]);
  };

  const restockProduct = (productId: string, additionalUnits: number, motivo: string = 'Entrada manual de reposição') => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const saldoAnterior = prod.stockUnits;
    const saldoPosterior = saldoAnterior + additionalUnits;

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, stockUnits: saldoPosterior } : p));
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });

    registrarMovimentacaoEstoque({
      lojaId: activeStore.id,
      produtoId: prod.id,
      produtoNome: prod.name,
      tipo: 'ENTRADA_COMPRA',
      quantidade: additionalUnits,
      saldoAnterior,
      saldoPosterior,
      usuarioNome: currentUser.name,
      documentoRef: 'Reposição Manual',
      motivo,
      custoUnitario: prod.costPrice,
    });

    setNotifications((prev) => [`Entrada de estoque: +${additionalUnits} unidades em ${prod.name}.`, ...prev]);
  };

  const addProduct = (product: Product) => {
    setProducts((prev) => {
      const updated = [product, ...prev];
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    if (product.stockUnits > 0) {
      registrarMovimentacaoEstoque({
        lojaId: activeStore.id,
        produtoId: product.id,
        produtoNome: product.name,
        tipo: 'ENTRADA_COMPRA',
        quantidade: product.stockUnits,
        saldoAnterior: 0,
        saldoPosterior: product.stockUnits,
        usuarioNome: currentUser.name,
        documentoRef: 'Cadastro Inicial',
        motivo: 'Estoque inicial de abertura de cadastro',
        custoUnitario: product.costPrice,
      });
    }
    setNotifications((prev) => [`Produto "${product.name}" cadastrado com sucesso!`, ...prev]);
  };

  const updateProduct = (product: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === product.id ? product : p));
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    setNotifications((prev) => [`Produto "${product.name}" atualizado com sucesso.`, ...prev]);
  };

  const deleteProduct = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      saveToStorage(STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    if (prod) {
      setNotifications((prev) => [`Produto "${prod.name}" removido do catálogo.`, ...prev]);
    }
  };

  // Categorias
  const addCategory = (category: CategoryItem) => {
    setCategories((prev) => [...prev, category]);
    setNotifications((prev) => [`Categoria "${category.name}" cadastrada com sucesso.`, ...prev]);
  };

  const updateCategory = (category: CategoryItem) => {
    setCategories((prev) => prev.map((c) => (c.id === category.id ? category : c)));
    setNotifications((prev) => [`Categoria "${category.name}" atualizada com sucesso.`, ...prev]);
  };

  const deleteCategory = (categoryId: string): { success: boolean; message?: string } => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat) return { success: false, message: 'Categoria não encontrada.' };
    const hasProducts = products.some(
      (p) => p.category === cat.slug || p.category === cat.id || p.category.toLowerCase() === cat.name.toLowerCase()
    );
    if (hasProducts) {
      return {
        success: false,
        message: `Não é possível excluir a categoria "${cat.name}" pois existem produtos associados a ela no estoque.`,
      };
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setNotifications((prev) => [`Categoria "${cat.name}" excluída com sucesso.`, ...prev]);
    return { success: true };
  };

  // Lotes & PEPS
  const addProdutoLote = (lote: Omit<ProdutoLote, 'id'>) => {
    const id = `lote-${Date.now()}`;
    const novoLote: ProdutoLote = {
      ...lote,
      id,
      diasAteVencer: lote.diasParaVencer,
      custoUnitarioLote: lote.precoCustoUnitario,
      status: lote.statusValidade === 'ALERTA_PROXIMO' ? 'ALERTA_VENCIMENTO' : 'NORMAL',
    };
    setProdutoLotes((prev) => [novoLote, ...prev]);

    // Atualiza estoque do produto
    const prod = products.find((p) => p.id === lote.produtoId);
    if (prod) {
      const saldoAnterior = prod.stockUnits;
      const saldoPosterior = saldoAnterior + lote.quantidadeDisponivel;
      setProducts((prev) =>
        prev.map((p) => (p.id === lote.produtoId ? { ...p, stockUnits: saldoPosterior } : p))
      );
      registrarMovimentacaoEstoque({
        lojaId: activeStore.id,
        produtoId: prod.id,
        produtoNome: prod.name,
        tipo: 'ENTRADA_COMPRA',
        quantidade: lote.quantidadeDisponivel,
        saldoAnterior,
        saldoPosterior,
        usuarioNome: currentUser.name,
        documentoRef: lote.numeroLote,
        motivo: `Entrada de novo Lote ${lote.numeroLote} (Validade: ${lote.dataValidade})`,
        custoUnitario: lote.precoCustoUnitario,
      });
    }
    setNotifications((prev) => [`Lote ${lote.numeroLote} cadastrado (+${lote.quantidadeDisponivel} un).`, ...prev]);
  };

  const darBaixaLote = (loteId: string, quantidade: number, motivo: string) => {
    const targetLote = produtoLotes.find((l) => l.id === loteId);
    if (!targetLote) return;
    const qtdBaixa = Math.min(quantidade, targetLote.quantidadeDisponivel);
    const novaQtdLote = targetLote.quantidadeDisponivel - qtdBaixa;

    setProdutoLotes((prev) =>
      prev.map((l) => (l.id === loteId ? { ...l, quantidadeDisponivel: novaQtdLote } : l))
    );

    const prod = products.find((p) => p.id === targetLote.produtoId);
    if (prod) {
      const saldoAnterior = prod.stockUnits;
      const saldoPosterior = Math.max(0, saldoAnterior - qtdBaixa);
      setProducts((prev) =>
        prev.map((p) => (p.id === prod.id ? { ...p, stockUnits: saldoPosterior } : p))
      );
      registrarMovimentacaoEstoque({
        lojaId: activeStore.id,
        produtoId: prod.id,
        produtoNome: prod.name,
        tipo: 'PERDA_AVARIA',
        quantidade: -qtdBaixa,
        saldoAnterior,
        saldoPosterior,
        usuarioNome: currentUser.name,
        documentoRef: targetLote.numeroLote,
        motivo: `Baixa de Lote ${targetLote.numeroLote}: ${motivo}`,
        custoUnitario: targetLote.precoCustoUnitario,
      });
    }
    setNotifications((prev) => [`Baixa de ${qtdBaixa} un realizada no lote ${targetLote.numeroLote}.`, ...prev]);
  };

  const transferStockBetweenStores = (productId: string, targetStoreName: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          return { ...p, stockUnits: Math.max(0, p.stockUnits - quantity) };
        }
        return p;
      })
    );
    setNotifications((prev) => [
      `Transferência de ${quantity} un enviadas para ${targetStoreName}.`,
      ...prev,
    ]);
  };

  // ==========================================
  // MÓDULO 3: GESTÃO DE ESTOQUE AVANÇADA
  // ==========================================

  const abrirNovaGarrafa = (produtoId: string): { success: boolean; message: string } => {
    const product = products.find(p => p.id === produtoId);
    if (!product) return { success: false, message: 'Produto não encontrado.' };
    if (product.stockUnits <= 0) return { success: false, message: 'Não há garrafas lacradas em estoque!' };

    const bottleVol = product.bottleVolumeMl || 1000;
    
    // Decrementa 1 unidade do estoque fechado e define garrafa aberta
    setProducts(prev => prev.map(p => p.id === produtoId ? {
      ...p,
      stockUnits: p.stockUnits - 1,
      openBottleVolumeMl: bottleVol
    } : p));

    const countGarrafas = recipientesAbertos.filter(r => r.produtoPaiId === produtoId).length + 1;

    const novoRecipiente: RecipienteAberto = {
      id: `rec-${Date.now()}`,
      lojaId: activeStore.id,
      produtoPaiId: product.id,
      produtoPaiNome: product.name,
      volumeOriginalMl: bottleVol,
      volumeRestanteMl: bottleVol,
      dataAbertura: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'EM_USO',
      garrafaNumero: countGarrafas,
    };

    setRecipientesAbertos(prev => [novoRecipiente, ...prev]);

    // Auditoria de doses
    const audit: DoseAuditLog = {
      id: `aud-open-${Date.now()}`,
      productId: product.id,
      productName: product.name,
      volumeDoseMl: 0,
      remainingBottleMl: bottleVol,
      bottleTotalMl: bottleVol,
      timestamp: novoRecipiente.dataAbertura,
      operatorName: currentUser.name,
      type: 'BOTTLE_OPENED',
      notes: `Abertura de nova garrafa nº ${countGarrafas} do estoque fechado (${product.stockUnits - 1} un restantes).`,
    };
    setDoseAuditLogs(prev => [audit, ...prev]);

    setNotifications(prev => [`Garrafa nº ${countGarrafas} de ${product.name} aberta com sucesso! Estoque lacrado: ${product.stockUnits - 1} un.`, ...prev]);
    return { success: true, message: `Garrafa nº ${countGarrafas} aberta com sucesso!` };
  };

  const finalizarGarrafaAberta = (recipienteId: string) => {
    setRecipientesAbertos(prev => prev.map(r => r.id === recipienteId ? {
      ...r,
      status: 'FINALIZADO',
      volumeRestanteMl: 0,
      dataFinalizacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } : r));
    setNotifications(prev => [`Recipiente finalizado e retirado da bancada de preparo.`, ...prev]);
  };

  const salvarFichaTecnica = (ficha: FichaTecnicaCombo) => {
    setFichasTecnicas(prev => {
      const exists = prev.some(f => f.produtoCompostoId === ficha.produtoCompostoId);
      if (exists) {
        return prev.map(f => f.produtoCompostoId === ficha.produtoCompostoId ? ficha : f);
      }
      return [ficha, ...prev];
    });
    setNotifications(prev => [`Ficha Técnica do produto "${ficha.produtoCompostoNome}" salva com sucesso!`, ...prev]);
  };

  const venderChoppTorneira = (torneiraId: string, volumeLitros: number): { success: boolean; message: string } => {
    const tap = torneirasChopp.find(t => t.id === torneiraId);
    if (!tap) return { success: false, message: 'Torneira não encontrada.' };

    const fatorPerda = 1 + (tap.fatorPerdaEspumaPercentual / 100);
    const volumeRealDescontado = volumeLitros * fatorPerda;
    const perdaEspumaLitros = volumeLitros * (tap.fatorPerdaEspumaPercentual / 100);

    if (tap.volumeRestanteLitros < volumeRealDescontado) {
      return { success: false, message: `Volume insuficiente no barril! Restam apenas ${(tap.volumeRestanteLitros ?? 0).toFixed(2)}L.` };
    }

    setTorneirasChopp(prev => prev.map(t => t.id === torneiraId ? {
      ...t,
      volumeRestanteLitros: Math.max(0, t.volumeRestanteLitros - volumeRealDescontado),
      litrosVendidos: Number(((t.litrosVendidos ?? 0) + volumeLitros).toFixed(2)),
      perdaEspumaAcumuladaLitros: Number(((t.perdaEspumaAcumuladaLitros ?? 0) + perdaEspumaLitros).toFixed(2)),
    } : t));

    setNotifications(prev => [`Chopp servido: ${volumeLitros}L da ${tap.identificadorTorneira} (Desconto total com espuma: ${(volumeRealDescontado ?? 0).toFixed(2)}L).`, ...prev]);
    return { success: true, message: 'Chopp retirado com sucesso!' };
  };

  const ajustarFatorPerdaEspuma = (torneiraId: string, novoFatorPercent: number) => {
    setTorneirasChopp(prev => prev.map(t => t.id === torneiraId ? {
      ...t,
      fatorPerdaEspumaPercentual: novoFatorPercent
    } : t));
    setNotifications(prev => [`Fator de perda de espuma atualizado para ${novoFatorPercent}% na torneira selecionada.`, ...prev]);
  };

  const registrarPerdaEstoque = (
    produtoId: string,
    quantidade: number,
    unidade: string,
    tipo: PerdaEstoqueTipo,
    justificativa: string
  ): PerdaEstoqueRecord => {
    const prod = products.find(p => p.id === produtoId);
    const custoUnit = prod?.costPrice || 20.00;
    const valorPrejuizo = unidade === 'ML' ? (custoUnit / (prod?.bottleVolumeMl || 1000)) * quantidade : custoUnit * quantidade;

    const novaPerda: PerdaEstoqueRecord = {
      id: `loss-${Date.now()}`,
      lojaId: activeStore.id,
      produtoId,
      produtoNome: prod?.name || 'Produto Baixado',
      usuarioId: currentUser.id,
      usuarioNome: `${currentUser.name} (${currentUser.role})`,
      quantidade,
      unidade,
      tipoOcorrencia: tipo,
      justificativa,
      dataRegistro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      valorPrejuizoEstimado: Number((valorPrejuizo ?? 0).toFixed(2)),
    };

    setPerdasEstoque(prev => [novaPerda, ...prev]);

    if (unidade === 'UN') {
      setProducts(prev => prev.map(p => p.id === produtoId ? { ...p, stockUnits: Math.max(0, p.stockUnits - quantidade) } : p));
    } else if (unidade === 'ML') {
      recordDoseLoss(produtoId, quantidade, tipo === 'DEGUSTACAO_CORTESIA' ? 'TASTING' : 'WASTE', justificativa);
    }

    setNotifications(prev => [`Ocorrência de perda registrada: ${quantidade} ${unidade} de ${prod?.name}.`, ...prev]);
    return novaPerda;
  };

  const atualizarSaldoVasilhame = (produtoId: string, deltaVazios: number) => {
    setVasilhames(prev => prev.map(v => v.produtoId === produtoId ? {
      ...v,
      cascosVaziosEmEstoque: Math.max(0, v.cascosVaziosEmEstoque + deltaVazios)
    } : v));
  };

  const criarTransferenciaLoja = (transferencia: Omit<TransferenciaLojas, 'id' | 'dataEnvio'>): TransferenciaLojas => {
    const novaTransferencia: TransferenciaLojas = {
      ...transferencia,
      id: `transf-${Date.now()}`,
      dataEnvio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    // Desconta o estoque na loja de origem
    transferencia.itens.forEach(item => {
      setProducts(prev => prev.map(p => {
        if (p.id === item.produtoId) {
          const saldoAnterior = p.stockUnits;
          const saldoPosterior = Math.max(0, p.stockUnits - item.quantidadeEnviada);
          registrarMovimentacaoEstoque({
            lojaId: transferencia.lojaOrigemId,
            produtoId: item.produtoId,
            produtoNome: item.produtoNome,
            tipo: 'TRANSFERENCIA_ENVIO',
            quantidade: -item.quantidadeEnviada,
            saldoAnterior,
            saldoPosterior,
            usuarioNome: currentUser.name,
            documentoRef: novaTransferencia.id,
            motivo: `Remessa para ${transferencia.lojaDestinoNome}`,
            custoUnitario: p.costPrice,
          });
          return { ...p, stockUnits: saldoPosterior };
        }
        return p;
      }));
    });

    setTransferenciasLojas(prev => [novaTransferencia, ...prev]);
    setNotifications(prev => [`Transferência ${novaTransferencia.id} despachada para ${novaTransferencia.lojaDestinoNome}.`, ...prev]);
    return novaTransferencia;
  };

  const concluirTransferenciaLoja = (transferenciaId: string) => {
    setTransferenciasLojas(prev => prev.map(t => {
      if (t.id === transferenciaId) {
        t.itens.forEach(item => {
          setProducts(prods => prods.map(p => {
            if (p.id === item.produtoId) {
              const qtdRecebida = item.quantidadeRecebida ?? item.quantidadeEnviada;
              const saldoAnterior = p.stockUnits;
              const saldoPosterior = p.stockUnits + qtdRecebida;
              registrarMovimentacaoEstoque({
                lojaId: t.lojaDestinoId,
                produtoId: item.produtoId,
                produtoNome: item.produtoNome,
                tipo: 'TRANSFERENCIA_RECEBIMENTO',
                quantidade: qtdRecebida,
                saldoAnterior,
                saldoPosterior,
                usuarioNome: currentUser.name,
                documentoRef: t.id,
                motivo: `Recebimento da loja ${t.lojaOrigemNome}`,
                custoUnitario: p.costPrice,
              });
              return { ...p, stockUnits: saldoPosterior };
            }
            return p;
          }));
        });
        return {
          ...t,
          status: 'CONCLUIDO',
          dataRecebimento: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return t;
    }));
    setNotifications(prev => [`Transferência ${transferenciaId} recebida e estoque incorporado!`, ...prev]);
  };

  const iniciarInventarioCego = (): InventarioCego => {
    const itensIniciais = products.slice(0, 8).map(p => ({
      produtoId: p.id,
      produtoNome: p.name,
      quantidadeSistema: p.stockUnits,
      quantidadeContada: 0,
      divergencia: 0,
      custoUnitario: p.costPrice,
    }));

    const novoInventario: InventarioCego = {
      id: `inv-${Date.now()}`,
      lojaId: activeStore.id,
      usuarioResponsavelId: currentUser.id,
      usuarioResponsavelNome: `${currentUser.name} (${currentUser.role})`,
      dataInicio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'EM_ANDAMENTO',
      totalDivergenciaItens: 0,
      impactoFinanceiroEstimado: 0,
      itens: itensIniciais,
    };

    setInventarios(prev => [novoInventario, ...prev]);
    return novoInventario;
  };

  const finalizarInventarioCego = (inventarioId: string, contagens: { produtoId: string; quantidadeContada: number }[]): InventarioCego => {
    let divergenciasCount = 0;
    let impactoTotal = 0;
    let inventarioAtualizado: InventarioCego | null = null;

    setInventarios(prev => prev.map(inv => {
      if (inv.id === inventarioId) {
        const itensAtualizados = inv.itens.map(item => {
          const contagem = contagens.find(c => c.produtoId === item.produtoId);
          const qtdContada = contagem !== undefined ? contagem.quantidadeContada : item.quantidadeSistema;
          const diff = qtdContada - item.quantidadeSistema;
          if (diff !== 0) {
            divergenciasCount++;
            registrarMovimentacaoEstoque({
              lojaId: activeStore.id,
              produtoId: item.produtoId,
              produtoNome: item.produtoNome,
              tipo: diff > 0 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO',
              quantidade: diff,
              saldoAnterior: item.quantidadeSistema,
              saldoPosterior: qtdContada,
              usuarioNome: currentUser.name,
              documentoRef: `Inventário #${inventarioId}`,
              motivo: `Ajuste de inventário cego (${diff > 0 ? 'Sobra' : 'Falta'} de ${Math.abs(diff)} un)`,
              custoUnitario: item.custoUnitario,
            });
          }
          impactoTotal += diff * item.custoUnitario;

          // Ajusta o estoque
          setProducts(prods => prods.map(p => p.id === item.produtoId ? { ...p, stockUnits: qtdContada } : p));

          return {
            ...item,
            quantidadeContada: qtdContada,
            divergencia: diff,
          };
        });

        const fechado: InventarioCego = {
          ...inv,
          status: 'FINALIZADO',
          dataFechamento: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          totalDivergenciaItens: divergenciasCount,
          impactoFinanceiroEstimado: Number((impactoTotal ?? 0).toFixed(2)),
          itens: itensAtualizados,
        };
        inventarioAtualizado = fechado;
        return fechado;
      }
      return inv;
    }));

    setNotifications(prev => [`Inventário Cego ${inventarioId} finalizado. Divergências: ${divergenciasCount} item(s) (Impacto: R$ ${(impactoTotal ?? 0).toFixed(2)}).`, ...prev]);
    return inventarioAtualizado || {
      id: inventarioId,
      lojaId: activeStore.id,
      usuarioResponsavelId: currentUser.id,
      usuarioResponsavelNome: currentUser.name,
      dataInicio: '',
      status: 'FINALIZADO',
      totalDivergenciaItens: divergenciasCount,
      impactoFinanceiroEstimado: impactoTotal,
      itens: [],
    };
  };

  const calcularCustoMedioPonderado = (produtoId: string, qtdEntrada: number, custoEntrada: number): number => {
    const p = products.find(prod => prod.id === produtoId);
    if (!p) return custoEntrada;
    const totalQtd = p.stockUnits + qtdEntrada;
    if (totalQtd <= 0) return custoEntrada;
    const custoMedio = ((p.stockUnits * p.costPrice) + (qtdEntrada * custoEntrada)) / totalQtd;
    return Number((custoMedio ?? 0).toFixed(2));
  };

  // Venda & Emissão NFC-e
  const completeSale = (
    items: CartItem[], 
    payment: PaymentDetails, 
    orderType: Order['orderType'] = 'PDV_BALCAO',
    tableNumber?: number,
    comandaNumber?: number,
    customerCpf?: string,
    customerName?: string,
    deliveryInfo?: Order['deliveryInfo'],
    splitPayments?: MultiPaymentSplit[]
  ): Order => {
    const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
    const serviceFee = orderType === 'MESA' ? subtotal * 0.1 : 0; // 10% opcional de garçom
    const deliveryFee = deliveryInfo ? 15.00 : 0;
    const total = subtotal + serviceFee + deliveryFee;

    const orderNumber = orders.length + 101;
    const { key, protocol } = generateNfceKey(activeStore.cnpj, orderNumber);

    const newOrder: Order = {
      id: `ord-${orderNumber}`,
      code: `#${orderNumber}`,
      storeId: activeStore.id,
      createdAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      items,
      subtotal,
      discount: 0,
      serviceFee,
      deliveryFee,
      total,
      payment,
      status: deliveryInfo ? 'PREPARING' : 'COMPLETED',
      orderType,
      tableNumber,
      comandaNumber,
      customerCpf,
      customerName,
      deliveryInfo,
      operatorName: currentUser.name,
      nfceKey: key,
      nfceProtocol: protocol,
    };

    // Debitar estoque de garrafas, doses, combos e chopp
    items.forEach((item) => {
      // 1. Verifica se o produto vendido é um combo com Ficha Técnica
      const ficha = fichasTecnicas.find(
        f => f.produtoCompostoId === item.product.id || f.produtoCompostoNome.toLowerCase() === item.product.name.toLowerCase()
      );

      if (ficha) {
        // Baixa automática de múltiplos insumos (Engenharia do Combo/Copão)
        ficha.itens.forEach(insumo => {
          const qtdNecessaria = insumo.quantidadeConsumida * item.quantity;
          if (insumo.unidadeDesconto === 'ML') {
            debitDoseStock(insumo.insumoProdutoId, qtdNecessaria / 50, newOrder.id, currentUser.name);
          } else {
            setProducts(prev => prev.map(p => p.id === insumo.insumoProdutoId ? { ...p, stockUnits: Math.max(0, p.stockUnits - qtdNecessaria) } : p));
          }
        });
      } else if (item.isDose && item.product.isFractionable) {
        // 2. Venda fracionada de dose avulsa
        debitDoseStock(item.product.id, item.quantity, newOrder.id, currentUser.name);
      } else if (item.product.id === 'prod-chopp-ipa' || item.product.name.toLowerCase().includes('chopp')) {
        // 3. Venda de Chopp (com dedução de perda de espuma)
        const tap = torneirasChopp[0];
        if (tap) {
          venderChoppTorneira(tap.id, 0.5 * item.quantity);
        }
      } else if (!item.weightKg) {
        // 4. Venda de produto unitário padrão
        setProducts((prev) =>
          prev.map((p) => (p.id === item.product.id ? { ...p, stockUnits: Math.max(0, p.stockUnits - item.quantity) } : p))
        );
      }

      // 5. Gestão de Vasilhames Retornáveis
      if (item.product.exigeVasilhame) {
        setVasilhames(vas => vas.map(v => v.produtoId === item.product.id ? {
          ...v,
          garrafasCheiasComCasco: Math.max(0, v.garrafasCheiasComCasco - item.quantity)
        } : v));
      }
    });

    // Atualizar sessão do caixa (suporte a pagamento único ou múltiplos pagamentos)
    if (cashSession.isOpen) {
      setCashSession((prev) => {
        let cash = prev.currentCash;
        let pix = prev.totalSalesPix;
        let card = prev.totalSalesCard;
        let totalCash = prev.totalSalesCash;

        if (splitPayments && splitPayments.length > 0) {
          splitPayments.forEach((sp) => {
            if (sp.method === 'DINHEIRO') {
              cash += sp.amount;
              totalCash += sp.amount;
            } else if (sp.method === 'PIX') {
              pix += sp.amount;
            } else if (sp.method.startsWith('TEF')) {
              card += sp.amount;
            }
          });
        } else {
          if (payment.method === 'DINHEIRO') {
            cash += payment.amount;
            totalCash += payment.amount;
          } else if (payment.method === 'PIX') {
            pix += payment.amount;
          } else if (payment.method.startsWith('TEF')) {
            card += payment.amount;
          }
        }

        return {
          ...prev,
          currentCash: cash,
          totalSalesCash: totalCash,
          totalSalesPix: pix,
          totalSalesCard: card,
        };
      });
    }

    // Criar documento fiscal
    const isContingencia = offlineContingencyMode;
    const docStatus = isContingencia ? 'CONTINGENCIA' : 'AUTORIZADO';
    const cStat = isContingencia ? '150' : '100';

    const fiscalDoc: FiscalDocument = {
      id: `fisc-${orderNumber}`,
      orderId: newOrder.id,
      number: orderNumber,
      series: 1,
      type: 'NFCe',
      accessKey: key,
      authorizationProtocol: isContingencia ? undefined : protocol,
      issuedAt: newOrder.createdAt,
      status: isContingencia ? 'CONTINGENCIA' : 'AUTORIZADA',
      totalValue: total,
      recipientCpfCnpj: customerCpf,
      xmlMock: `<nfeProc versao="4.00"><NFe><infNFe Id="NFe${key}"><ide><tpEmis>${isContingencia ? '9' : '1'}</tpEmis></ide></infNFe></NFe></nfeProc>`,
    };

    const docCompleto: DocumentoFiscalCompleto = {
      id: `fisc-doc-${orderNumber}`,
      lojaId: activeStore.id,
      vendaId: newOrder.id,
      modelo: '65',
      serie: 1,
      numeroNota: orderNumber,
      chaveAcesso: key,
      statusSefaz: docStatus,
      codigoStatusResposta: cStat,
      protocoloAutorizacao: isContingencia ? undefined : protocol,
      dataEmissao: newOrder.createdAt,
      dataAutorizacao: isContingencia ? undefined : newOrder.createdAt,
      valorTotal: total,
      valorTributosAprox: subtotal * 0.23,
      destinatarioNome: customerName || 'Consumidor Presencial',
      destinatarioCpfCnpj: customerCpf,
      naturezaOperacao: isContingencia ? 'VENDA A CONSUMIDOR FINAL (CONTINGENCIA)' : 'VENDA A CONSUMIDOR FINAL',
      tipoEmissao: isContingencia ? 'CONTINGENCIA_OFFLINE' : 'NORMAL',
      contingenciaMotivo: isContingencia ? 'SEFAZ Indisponível - Contingência Offline Ativada' : undefined,
      xmlEnviado: `<nfeProc versao="4.00"><NFe><infNFe Id="NFe${key}"><ide><tpEmis>${isContingencia ? '9' : '1'}</tpEmis></ide></infNFe></NFe></nfeProc>`,
      itens: items.map((it, idx) => ({
        itemNumero: idx + 1,
        produtoId: it.product.id,
        produtoNome: it.product.name,
        ncm: it.product.ncm || '22030000',
        cest: it.product.cest || '03.001.00',
        cfop: it.product.cfop || '5405',
        cstOuCsosn: it.product.cstIcms || '500',
        quantidade: it.quantity,
        unidade: it.isDose ? 'ML' : 'UN',
        valorUnitario: it.unitPrice,
        valorTotal: it.totalPrice,
        vBcIcms: 0,
        vIcms: 0,
        vIcmsSt: 0,
        vPis: 0,
        vCofins: 0,
        vTributosAprox: it.totalPrice * 0.23,
      })),
      qrcodeUrl: `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${key}|2|1|${isContingencia ? '9' : '1'}|8B92942F-8461-41AA-B73C-E68241A0B2C9`,
    };

    // Auto conciliação TEF
    if (payment.method.startsWith('TEF') || (splitPayments && splitPayments.some(s => s.method.startsWith('TEF')))) {
      const concItem: ConciliacaoFiscalPagamento = {
        id: `conc-${Date.now()}`,
        lojaId: activeStore.id,
        documentoFiscalId: docCompleto.id,
        chaveAcesso: key,
        vendaId: newOrder.id,
        codigoPedido: newOrder.code,
        nsuTef: `${Math.floor(Math.random() * 89999999) + 10000000}`,
        autorizacaoCartao: `AUTH-${Math.floor(Math.random() * 89999) + 10000}`,
        credenciadora: 'Stone Pagamentos',
        cnpjCredenciadora: '16.501.555/0001-57',
        bandeiraCartao: payment.method.includes('CREDITO') ? 'Mastercard' : 'Visa Débito',
        formaPagamento: payment.method.includes('CREDITO') ? 'CREDITO' : 'DEBITO',
        valor: total,
        statusConciliacao: 'CONCILIADO',
        dataRegistro: newOrder.createdAt,
      };
      setConciliacoesTef(prev => [concItem, ...prev]);
    }

    setOrders((prev) => [newOrder, ...prev]);
    setFiscalDocuments((prev) => [fiscalDoc, ...prev]);
    setDocumentosFiscais((prev) => [docCompleto, ...prev]);

    // Sincronização em segundo plano com o backend Supabase
    try {
      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder),
      }).catch(() => {
        // Modo offline / local seguro
      });
    } catch {
      // Falha silenciosa
    }

    return newOrder;
  };

  // Mesas
  const updateTable = (tableId: number, partial: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === tableId ? { ...t, ...partial } : t)));
  };

  // -------------------------------------------------------------
  // MÓDULO: CONSULTA DE VENDAS & DEVOLUÇÕES
  // -------------------------------------------------------------
  const realizarDevolucaoVenda = (dados: { 
    orderId: string; 
    itens: { produtoId: string; quantidade: number; destino: 'RETORNO_ESTOQUE' | 'PERDA_DESCARTE'; motivo: any; detalhes?: string }[]; 
    formaReembolso: 'DINHEIRO' | 'ESTORNO_PIX_CARTAO' | 'VALE_CREDITO_CLIENTE'; 
    motivoGeral: string;
    observacoes?: string;
  }): { success: boolean; devolucao?: DevolucaoVenda; message: string } => {
    const order = orders.find(o => o.id === dados.orderId);
    if (!order) {
      return { success: false, message: 'Venda original não encontrada.' };
    }

    const devolucaoItens: DevolucaoItem[] = [];
    let valorTotalDevolvido = 0;

    for (const itemDev of dados.itens) {
      const orderItem = order.items.find(it => it.product.id === itemDev.produtoId);
      if (!orderItem) continue;

      const unitPrice = orderItem.unitPrice || (orderItem.totalPrice / (orderItem.quantity || 1));
      const valorItem = unitPrice * itemDev.quantidade;
      valorTotalDevolvido += valorItem;

      devolucaoItens.push({
        produtoId: itemDev.produtoId,
        produtoNome: orderItem.product.name,
        quantidade: itemDev.quantidade,
        valorUnitario: unitPrice,
        valorTotal: valorItem,
        destino: itemDev.destino,
        motivo: itemDev.motivo,
        detalhes: itemDev.detalhes
      });

      // Se o destino for RETORNO_ESTOQUE, devolve as unidades físicas ao estoque
      if (itemDev.destino === 'RETORNO_ESTOQUE') {
        setProducts(prev => prev.map(p => {
          if (p.id === itemDev.produtoId) {
            return { ...p, stockUnits: p.stockUnits + itemDev.quantidade };
          }
          return p;
        }));

        // Registrar no Kardex de movimentações de estoque
        registrarMovimentacaoEstoque({
          lojaId: activeStore.id,
          produtoId: itemDev.produtoId,
          produtoNome: orderItem.product.name,
          tipo: 'AJUSTE_POSITIVO',
          quantidade: itemDev.quantidade,
          saldoAnterior: orderItem.product.stockUnits,
          saldoPosterior: orderItem.product.stockUnits + itemDev.quantidade,
          motivo: `Devolução de Venda ${order.code} - ${itemDev.motivo}`,
          usuarioNome: currentUser.name,
          documentoRef: `DEV-${order.code}`
        });
      } else {
        // PERDA_DESCARTE: Registra em perdas de estoque
        const novaPerda: PerdaEstoqueRecord = {
          id: `perd-${Date.now()}-${itemDev.produtoId}`,
          lojaId: activeStore.id,
          produtoId: itemDev.produtoId,
          produtoNome: orderItem.product.name,
          usuarioId: currentUser.id,
          usuarioNome: currentUser.name,
          quantidade: itemDev.quantidade,
          unidade: orderItem.product.unit || 'UN',
          tipoOcorrencia: 'AVARIA_CLIENTE',
          justificativa: `Item devolvido pelo cliente com avaria/oxidação na venda ${order.code}. Motivo: ${itemDev.motivo}. Obs: ${itemDev.detalhes || ''}`,
          dataRegistro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          valorPrejuizoEstimado: (orderItem.product.costPrice || 0) * itemDev.quantidade
        };
        setPerdasEstoque(prev => [novaPerda, ...prev]);
      }
    }

    const devolucaoId = `dev-${Date.now().toString().slice(-6)}`;
    const novaDevolucao: DevolucaoVenda = {
      id: devolucaoId,
      orderId: order.id,
      orderCode: order.code,
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      operadorNome: currentUser.name,
      motivoGeral: dados.motivoGeral,
      itens: devolucaoItens,
      valorTotalDevolvido: Number(valorTotalDevolvido.toFixed(2)),
      formaReembolso: dados.formaReembolso,
      clienteId: order.customerId,
      clienteNome: order.customerName,
      observacoes: dados.observacoes
    };

    // Processamento do reembolso
    if (dados.formaReembolso === 'DINHEIRO' && cashSession.isOpen) {
      setCashSession(prev => ({
        ...prev,
        currentCash: Math.max(0, prev.currentCash - valorTotalDevolvido),
        totalSangrias: prev.totalSangrias + valorTotalDevolvido
      }));
    } else if (dados.formaReembolso === 'VALE_CREDITO_CLIENTE') {
      if (order.customerId || order.customerCpf) {
        setCustomers(prev => prev.map(c => {
          if (c.id === order.customerId || (c.cpf && c.cpf === order.customerCpf)) {
            return {
              ...c,
              saldoCreditoAtual: Number(((c.saldoCreditoAtual || 0) + valorTotalDevolvido).toFixed(2))
            };
          }
          return c;
        }));
      }
    }

    // Atualiza status do pedido original
    const totalItensOriginais = order.items.reduce((sum, it) => sum + it.quantity, 0);
    const totalItensDevolvidos = devolucaoItens.reduce((sum, it) => sum + it.quantidade, 0);
    const novoStatus: OrderStatus = totalItensDevolvidos >= totalItensOriginais ? 'DEVOLVIDO_TOTAL' : 'DEVOLVIDO_PARCIAL';

    setOrders(prev => prev.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: novoStatus,
          devolucoes: [...(o.devolucoes || []), novaDevolucao]
        };
      }
      return o;
    }));

    setDevolucoesVendas(prev => [novaDevolucao, ...prev]);

    return {
      success: true,
      devolucao: novaDevolucao,
      message: `Devolução registrada com sucesso! Reembolso de R$ ${valorTotalDevolvido.toFixed(2)} processado via ${dados.formaReembolso}.`
    };
  };

  // -------------------------------------------------------------
  // MÓDULO: CADASTRO E GESTÃO DE CLIENTES
  // -------------------------------------------------------------
  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'loyaltyPoints' | 'lastPurchaseDate'>): Customer => {
    const newId = `cust-${Date.now().toString().slice(-6)}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      totalSpent: 0,
      ordersCount: 0,
      loyaltyPoints: 0,
      saldoCashback: customerData.saldoCashback || 0,
      limiteCredito: customerData.limiteCredito || 500,
      saldoCreditoAtual: customerData.saldoCreditoAtual ?? (customerData.limiteCredito || 500),
      status: customerData.status || 'ATIVO',
      dataCadastro: customerData.dataCadastro || new Date().toISOString().split('T')[0],
      lastPurchaseDate: '-',
      nivelFidelidade: customerData.nivelFidelidade || 'BRONZE',
      tags: customerData.tags || ['Novo Cliente'],
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteCustomer = (customerId: string): { success: boolean; message?: string } => {
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return { success: false, message: 'Cliente não encontrado.' };
    if (cust.ordersCount > 0) {
      return { 
        success: false, 
        message: `Não é possível excluir o cliente ${cust.name} pois possui histórico de ${cust.ordersCount} compras registradas. Recomendamos alterar o status para BLOQUEADO.` 
      };
    }
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    return { success: true, message: 'Cliente excluído com sucesso!' };
  };

  const ajustarSaldoCreditoCliente = (customerId: string, deltaValor: number, motivo: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const novoSaldo = Number(((c.saldoCreditoAtual || 0) + deltaValor).toFixed(2));
        return {
          ...c,
          saldoCreditoAtual: novoSaldo,
          observacoes: `${c.observacoes || ''}\n[${new Date().toLocaleDateString('pt-BR')}] Ajuste de crédito de R$ ${deltaValor.toFixed(2)} (${motivo}). Saldo: R$ ${novoSaldo.toFixed(2)}`
        };
      }
      return c;
    }));
  };

  // -------------------------------------------------------------
  // MÓDULO: RESERVAS E NOTIFICAÇÕES RELACIONADAS
  // -------------------------------------------------------------
  const criarReserva = (reservaData: Omit<ReservaMesaAmbiente, 'id' | 'codigo' | 'criadoEm' | 'notificacoes'>): ReservaMesaAmbiente => {
    const anoAtual = new Date().getFullYear();
    const numeroSeq = String(reservas.length + 1).padStart(3, '0');
    const codigo = `RES-${anoAtual}-${numeroSeq}`;
    const id = `res-${Date.now().toString().slice(-6)}`;
    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Notificação inicial automática de confirmação
    const notificacaoInicial: NotificacaoReserva = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      reservaId: id,
      tipo: 'CONFIRMACAO',
      canal: 'WHATSAPP',
      destinatarioNome: reservaData.clienteNome,
      destinatarioTelefone: reservaData.clienteTelefone,
      mensagem: `🍷 AdeGaswg: Olá ${reservaData.clienteNome}! Sua reserva [${codigo}] para ${reservaData.quantidadePessoas} pessoas no dia ${reservaData.dataReserva} às ${reservaData.horario} foi registrada com sucesso!`,
      dataHora: agora,
      status: 'ENVIADA'
    };

    const novaReserva: ReservaMesaAmbiente = {
      ...reservaData,
      id,
      codigo,
      criadoEm: agora,
      notificacoes: [notificacaoInicial]
    };

    // Se vinculou mesa, atualizar a mesa para RESERVED
    if (reservaData.mesaId) {
      updateTable(reservaData.mesaId, {
        status: 'RESERVED',
        customerName: `${reservaData.clienteNome} (${codigo})`
      });
    }

    setReservas(prev => [novaReserva, ...prev]);
    return novaReserva;
  };

  const atualizarStatusReserva = (reservaId: string, novoStatus: ReservaMesaAmbiente['status']) => {
    setReservas(prev => prev.map(r => {
      if (r.id === reservaId) {
        return {
          ...r,
          status: novoStatus,
          atualizadoEm: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
      }
      return r;
    }));
  };

  const fazerCheckinReserva = (reservaId: string): { success: boolean; message: string } => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return { success: false, message: 'Reserva não encontrada.' };

    atualizarStatusReserva(reservaId, 'CLIENTE_PRESENTE');

    if (reserva.mesaId) {
      updateTable(reserva.mesaId, {
        status: 'OCCUPIED',
        customerName: reserva.clienteNome
      });
    }

    return {
      success: true,
      message: `Check-in realizado com sucesso! Cliente ${reserva.clienteNome} acomodado na Mesa ${reserva.mesaNumero || ''}.`
    };
  };

  const cancelarReserva = (reservaId: string, motivo?: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;

    if (reserva.mesaId) {
      updateTable(reserva.mesaId, {
        status: 'FREE',
        customerName: undefined
      });
    }

    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const notifCancel: NotificacaoReserva = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      reservaId: reserva.id,
      tipo: 'CANCELAMENTO',
      canal: 'WHATSAPP',
      destinatarioNome: reserva.clienteNome,
      destinatarioTelefone: reserva.clienteTelefone,
      mensagem: `🍷 AdeGaswg: Sua reserva [${reserva.codigo}] foi cancelada. ${motivo ? 'Motivo: ' + motivo : ''}`,
      dataHora: agora,
      status: 'ENVIADA'
    };

    setReservas(prev => prev.map(r => {
      if (r.id === reservaId) {
        return {
          ...r,
          status: 'CANCELADA',
          observacoes: `${r.observacoes || ''} [Cancelada em ${agora}: ${motivo || 'Sem motivo informado'}]`,
          atualizadoEm: agora,
          notificacoes: [notifCancel, ...r.notificacoes]
        };
      }
      return r;
    }));
  };

  const enviarNotificacaoReserva = (
    reservaId: string, 
    tipo: 'CONFIRMACAO' | 'LEMBRETE_2H' | 'ALTERACAO' | 'CANCELAMENTO', 
    mensagemCustom?: string
  ): { success: boolean; mensagem: string } => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return { success: false, mensagem: 'Reserva não encontrada.' };

    const agora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    let texto = mensagemCustom;
    if (!texto) {
      if (tipo === 'CONFIRMACAO') {
        texto = `🍷 AdeGaswg: Olá ${reserva.clienteNome}! Confirmamos sua reserva [${reserva.codigo}] para o dia ${reserva.dataReserva} às ${reserva.horario}. Mesa: ${reserva.mesaNumero || 'A definir'}.`;
      } else if (tipo === 'LEMBRETE_2H') {
        texto = `🍷 AdeGaswg: Olá ${reserva.clienteNome}! Lembramos da sua reserva hoje às ${reserva.horario} para ${reserva.quantidadePessoas} pessoas. Esperamos por você!`;
      } else if (tipo === 'ALTERACAO') {
        texto = `🍷 AdeGaswg: Olá ${reserva.clienteNome}! Sua reserva [${reserva.codigo}] teve seus detalhes atualizados com sucesso.`;
      } else {
        texto = `🍷 AdeGaswg: Comunicamos o cancelamento da reserva [${reserva.codigo}].`;
      }
    }

    const novaNotif: NotificacaoReserva = {
      id: `notif-${Date.now().toString().slice(-6)}`,
      reservaId: reserva.id,
      tipo,
      canal: 'WHATSAPP',
      destinatarioNome: reserva.clienteNome,
      destinatarioTelefone: reserva.clienteTelefone,
      mensagem: texto,
      dataHora: agora,
      status: 'ENVIADA'
    };

    setReservas(prev => prev.map(r => r.id === reservaId ? { ...r, notificacoes: [novaNotif, ...r.notificacoes] } : r));

    return {
      success: true,
      mensagem: `Notificação enviada com sucesso via WhatsApp para ${reserva.clienteTelefone}!`
    };
  };

  const addOrderToTable = (tableId: number, items: CartItem[]) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return;

    const addedTotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
    const newTotal = table.totalAmount + addedTotal;

    // Débito das doses
    items.forEach((item) => {
      if (item.isDose && item.product.isFractionable) {
        debitDoseStock(item.product.id, item.quantity, undefined, currentUser.name);
      }
    });

    updateTable(tableId, {
      status: 'OCCUPIED',
      totalAmount: newTotal,
      items: [...(table.items || []), ...items],
      waiterName: currentUser.name,
      openedAt: table.openedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    // Envia automaticamente para o KDS (Kitchen/Bar Display System)
    const novoKds: KdsPedido = {
      id: `kds-${Date.now()}`,
      orderCode: `#M0${table.number}`,
      canal: 'MESA',
      mesaNumero: table.number,
      clienteNome: table.customerName || `Mesa 0${table.number}`,
      garcomNome: currentUser.name,
      itens: items.map((it, idx) => ({
        id: `kds-item-${Date.now()}-${idx}`,
        nome: it.product.name,
        quantidade: it.quantity,
        isDose: it.isDose,
        detalhes: it.notes || (it.isDose ? 'Dose fracionada no balcão' : 'Garrafa lacrada/gelada'),
      })),
      horaEntrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestampEntrada: Date.now(),
      status: 'RECEBIDO',
      tempoDecorridoMinutos: 0,
      setor: 'BAR',
    };
    setKdsPedidos((prev) => [novoKds, ...prev]);

    setNotifications((prev) => [
      `Mesa ${table.number}: Lançamento de ${items.length} item(ns) enviado ao KDS do Bar.`,
      ...prev,
    ]);
  };

  const closeTableAccount = (tableId: number, payment: PaymentDetails): Order | null => {
    const table = tables.find((t) => t.id === tableId);
    if (!table || table.totalAmount <= 0) return null;

    const dummyItem: CartItem = {
      product: products[0],
      quantity: 1,
      isDose: false,
      unitPrice: table.totalAmount,
      discount: 0,
      totalPrice: table.totalAmount,
      notes: `Fechamento da Mesa 0${table.number}`,
    };

    const order = completeSale([dummyItem], payment, 'MESA', table.number, undefined, undefined, table.customerName);

    // Se houver cashback acumulado ou cliente fidelidade
    if (table.customerCpf) {
      acumularCashbackCompra(table.customerCpf, table.totalAmount, order.code);
    }

    updateTable(tableId, {
      status: 'FREE',
      guestsCount: 0,
      totalAmount: 0,
      items: [],
      customerName: undefined,
      openedAt: undefined,
      waiterName: undefined,
      couvertIsento: false,
    });

    return order;
  };

  // Comandas
  const createComanda = (number: number, customerName: string, customerCpf?: string) => {
    const newComanda: Comanda = {
      id: `com-${Date.now()}`,
      number,
      customerName,
      customerCpf,
      status: 'OPEN',
      totalAmount: 0,
      items: [],
      openedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
    setComandas((prev) => [newComanda, ...prev]);
  };

  const addOrderToComanda = (comandaId: string, items: CartItem[]) => {
    const com = comandas.find((c) => c.id === comandaId);
    if (!com) return;
    const addedTotal = items.reduce((acc, it) => acc + it.totalPrice, 0);

    items.forEach((item) => {
      if (item.isDose && item.product.isFractionable) {
        debitDoseStock(item.product.id, item.quantity, undefined, currentUser.name);
      }
    });

    setComandas((prev) =>
      prev.map((c) => (c.id === comandaId ? { 
        ...c, 
        totalAmount: c.totalAmount + addedTotal,
        items: [...(c.items || []), ...items]
      } : c))
    );

    // Envia ao KDS
    const novoKds: KdsPedido = {
      id: `kds-${Date.now()}`,
      orderCode: `#C${com.number}`,
      canal: 'COMANDA',
      comandaNumero: com.number,
      clienteNome: com.customerName,
      garcomNome: currentUser.name,
      itens: items.map((it, idx) => ({
        id: `kds-item-${Date.now()}-${idx}`,
        nome: it.product.name,
        quantidade: it.quantity,
        isDose: it.isDose,
        detalhes: it.notes || (it.isDose ? 'Dose fracionada' : 'Garrafa'),
      })),
      horaEntrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestampEntrada: Date.now(),
      status: 'RECEBIDO',
      tempoDecorridoMinutos: 0,
      setor: 'BAR',
    };
    setKdsPedidos((prev) => [novoKds, ...prev]);
  };

  const closeComanda = (comandaId: string, payment: PaymentDetails): Order | null => {
    const com = comandas.find((c) => c.id === comandaId);
    if (!com || com.totalAmount <= 0) return null;

    const dummyItem: CartItem = {
      product: products[0],
      quantity: 1,
      isDose: false,
      unitPrice: com.totalAmount,
      discount: 0,
      totalPrice: com.totalAmount,
      notes: `Fechamento da Comanda #${com.number}`,
    };

    const order = completeSale([dummyItem], payment, 'COMANDA', undefined, com.number, com.customerCpf, com.customerName);
    
    if (com.customerCpf) {
      acumularCashbackCompra(com.customerCpf, com.totalAmount, order.code);
    }

    setComandas((prev) => prev.filter((c) => c.id !== comandaId));
    return order;
  };

  // ============================================================================
  // MÓDULO 4: SALÃO, DELIVERY, KDS, RFID, ROTEIRIZAÇÃO & FIDELIDADE METHODS
  // ============================================================================

  // Junção de Mesas
  const juntarMesas = (mesaOrigemId: number, mesaDestinoId: number): { success: boolean; message: string } => {
    const origem = tables.find((t) => t.id === mesaOrigemId);
    const destino = tables.find((t) => t.id === mesaDestinoId);
    if (!origem || !destino) return { success: false, message: 'Mesa não encontrada.' };
    if (origem.id === destino.id) return { success: false, message: 'Selecione mesas diferentes para unificação.' };

    const itensTransferidos = [...(destino.items || []), ...(origem.items || [])];
    const novoTotal = destino.totalAmount + origem.totalAmount;
    const novosHospedes = (destino.guestsCount || 0) + (origem.guestsCount || 0);

    updateTable(mesaDestinoId, {
      totalAmount: novoTotal,
      guestsCount: novosHospedes,
      items: itensTransferidos,
      status: 'OCCUPIED',
      waiterName: destino.waiterName || origem.waiterName || currentUser.name,
    });

    updateTable(mesaOrigemId, {
      status: 'FREE',
      totalAmount: 0,
      guestsCount: 0,
      items: [],
      customerName: undefined,
      openedAt: undefined,
      joinedWithTableNumber: destino.number,
    });

    setNotifications((prev) => [
      `Mesa 0${origem.number} unificada à Mesa 0${destino.number} (Total R$ ${(novoTotal ?? 0).toFixed(2)}).`,
      ...prev,
    ]);
    return { success: true, message: `Mesa 0${origem.number} unificada com sucesso na Mesa 0${destino.number}!` };
  };

  // Transferência Completa de Comanda entre Mesas (Drag & Drop)
  const transferirComandaCompletaMesa = (origemMesaId: number, destinoMesaId: number): { success: boolean; message: string } => {
    const origem = tables.find((t) => t.id === origemMesaId);
    const destino = tables.find((t) => t.id === destinoMesaId);
    if (!origem || !destino) return { success: false, message: 'Mesa não encontrada.' };
    if (origem.id === destino.id) return { success: false, message: 'A mesa de destino deve ser diferente da origem.' };
    if (origem.status === 'FREE' && (!origem.items || origem.items.length === 0)) {
      return { success: false, message: `Mesa 0${origem.number} está livre, nenhuma comanda a transferir.` };
    }

    const itensTransferidos = [...(origem.items || [])];
    const valorTransferido = origem.totalAmount || 0;
    const clienteTransferido = origem.customerName;
    const atendenteTransferido = origem.waiterName || currentUser.name;
    const hospedes = origem.guestsCount || 2;
    const horaAbertura = origem.openedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (destino.status === 'FREE') {
      // Transferência para mesa livre
      updateTable(destinoMesaId, {
        status: 'OCCUPIED',
        totalAmount: valorTransferido,
        items: itensTransferidos,
        customerName: clienteTransferido,
        waiterName: atendenteTransferido,
        guestsCount: hospedes,
        openedAt: horaAbertura,
        couvertPorPessoa: origem.couvertPorPessoa,
        consumacaoMinima: origem.consumacaoMinima,
      });
      updateTable(origemMesaId, {
        status: 'FREE',
        totalAmount: 0,
        items: [],
        customerName: undefined,
        guestsCount: 0,
        openedAt: undefined,
      });
    } else {
      // Destino já ocupada: mescla comanda
      updateTable(destinoMesaId, {
        status: 'OCCUPIED',
        totalAmount: (destino.totalAmount || 0) + valorTransferido,
        items: [...(destino.items || []), ...itensTransferidos],
        guestsCount: (destino.guestsCount || 1) + hospedes,
      });
      updateTable(origemMesaId, {
        status: 'FREE',
        totalAmount: 0,
        items: [],
        customerName: undefined,
        guestsCount: 0,
        openedAt: undefined,
      });
    }

    const msg = `Comanda da Mesa 0${origem.number} transferida com sucesso para a Mesa 0${destino.number} (Total R$ ${(valorTransferido ?? 0).toFixed(2)})!`;
    setNotifications((prev) => [msg, ...prev]);
    return { success: true, message: msg };
  };

  // Transferência de Itens entre Mesas
  const transferirItensMesa = (origemMesaId: number, destinoMesaId: number, itemIndex: number, quantidade: number) => {
    const origem = tables.find((t) => t.id === origemMesaId);
    const destino = tables.find((t) => t.id === destinoMesaId);
    if (!origem || !destino || !origem.items || !origem.items[itemIndex]) return;

    const itemOrig = origem.items[itemIndex];
    const qtdReal = Math.min(quantidade, itemOrig.quantity);
    const valorTransferido = itemOrig.unitPrice * qtdReal;

    const novosItensOrigem = [...origem.items];
    if (itemOrig.quantity === qtdReal) {
      novosItensOrigem.splice(itemIndex, 1);
    } else {
      novosItensOrigem[itemIndex] = {
        ...itemOrig,
        quantity: itemOrig.quantity - qtdReal,
        totalPrice: (itemOrig.quantity - qtdReal) * itemOrig.unitPrice,
      };
    }

    const itemDest: CartItem = {
      ...itemOrig,
      quantity: qtdReal,
      totalPrice: valorTransferido,
    };

    updateTable(origemMesaId, {
      items: novosItensOrigem,
      totalAmount: Math.max(0, origem.totalAmount - valorTransferido),
    });

    updateTable(destinoMesaId, {
      status: 'OCCUPIED',
      items: [...(destino.items || []), itemDest],
      totalAmount: destino.totalAmount + valorTransferido,
      openedAt: destino.openedAt || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    });

    setNotifications((prev) => [
      `Transferido ${qtdReal}x ${itemOrig.product.name} da Mesa 0${origem.number} para a Mesa 0${destino.number}.`,
      ...prev,
    ]);
  };

  // Isenção / Remoção de Couvert Artístico (com PIN Gerencial)
  const removerCouvertMesa = (mesaId: number, gerentePin: string): { success: boolean; message: string } => {
    const managerAuth = verifyManagerPin(gerentePin);
    if (!managerAuth.valid) {
      return { success: false, message: 'PIN gerencial incorreto para isenção de couvert.' };
    }

    const table = tables.find((t) => t.id === mesaId);
    if (!table) return { success: false, message: 'Mesa não encontrada.' };

    const valorCouvert = (table.couvertPorPessoa || 0) * (table.guestsCount || 1);
    updateTable(mesaId, {
      couvertIsento: true,
      totalAmount: Math.max(0, table.totalAmount - valorCouvert),
    });

    addAccessLog('ISENCAO_COUVERT', `Couvert artístico isento na Mesa 0${table.number} autorizado por ${managerAuth.manager?.name}`);
    setNotifications((prev) => [`Couvert isento na Mesa 0${table.number} com autorização gerencial.`, ...prev]);
    return { success: true, message: `Couvert artístico removido da Mesa 0${table.number}!` };
  };

  // Definir Consumação Mínima
  const definirConsumacaoMinimaMesa = (mesaId: number, valorMinimo: number) => {
    updateTable(mesaId, { consumacaoMinima: valorMinimo });
    setNotifications((prev) => [`Consumação mínima de R$ ${(valorMinimo ?? 0).toFixed(2)} parametrizada para a Mesa.`, ...prev]);
  };

  // Cartões Pré-pagos / RFID
  const recargaCartaoRfid = (codigoRfid: string, valor: number, metodo: PaymentMethod): { success: boolean; message: string } => {
    const card = cartoesConsumo.find((c) => c.codigoRfid === codigoRfid);
    if (!card) {
      return { success: false, message: 'Cartão/Pulseira RFID não encontrada.' };
    }

    const saldoAnterior = card.saldoAtual;
    const saldoPosterior = saldoAnterior + valor;

    setCartoesConsumo((prev) =>
      prev.map((c) =>
        c.id === card.id
          ? {
              ...c,
              saldoAtual: saldoPosterior,
              status: 'ATIVO',
              atualizadoEm:
                new Date().toLocaleDateString('pt-BR') +
                ' ' +
                new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );

    const mov: CartaoMovimentacao = {
      id: `cmov-${Date.now()}`,
      cartaoId: card.id,
      codigoRfid,
      tipo: 'RECARGA',
      valor,
      saldoAnterior,
      saldoPosterior,
      metodoPagamento: metodo,
      dataRegistro:
        new Date().toLocaleDateString('pt-BR') +
        ' ' +
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      operadorNome: currentUser.name,
      descricao: `Recarga de crédito via ${metodo} realizada no balcão/totem`,
    };
    setCartoesMovimentacoes((prev) => [mov, ...prev]);

    setNotifications((prev) => [
      `Cartão #${card.numeroCartao} (${card.clienteNome}) recarregado com +R$ ${(valor ?? 0).toFixed(2)} via ${metodo}.`,
      ...prev,
    ]);
    return { success: true, message: `Recarga de R$ ${(valor ?? 0).toFixed(2)} confirmada! Novo saldo: R$ ${(saldoPosterior ?? 0).toFixed(2)}.` };
  };

  const debitarCartaoRfid = (codigoRfid: string, valor: number, descricao: string): { success: boolean; message: string } => {
    const card = cartoesConsumo.find((c) => c.codigoRfid === codigoRfid);
    if (!card) return { success: false, message: 'Cartão RFID não cadastrado.' };
    if (card.status !== 'ATIVO') return { success: false, message: 'Cartão/Pulseira bloqueada ou inativa.' };

    const saldoDisponivel = card.saldoAtual + card.limiteCredito;
    if (saldoDisponivel < valor) {
      return { success: false, message: `Saldo insuficiente. Disponível: R$ ${(saldoDisponivel ?? 0).toFixed(2)}, Requerido: R$ ${(valor ?? 0).toFixed(2)}.` };
    }

    const saldoAnterior = card.saldoAtual;
    const saldoPosterior = saldoAnterior - valor;

    setCartoesConsumo((prev) =>
      prev.map((c) =>
        c.id === card.id
          ? {
              ...c,
              saldoAtual: saldoPosterior,
              atualizadoEm:
                new Date().toLocaleDateString('pt-BR') +
                ' ' +
                new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );

    const mov: CartaoMovimentacao = {
      id: `cmov-${Date.now()}`,
      cartaoId: card.id,
      codigoRfid,
      tipo: 'DEBITO',
      valor,
      saldoAnterior,
      saldoPosterior,
      dataRegistro:
        new Date().toLocaleDateString('pt-BR') +
        ' ' +
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      operadorNome: currentUser.name,
      descricao,
    };
    setCartoesMovimentacoes((prev) => [mov, ...prev]);

    setNotifications((prev) => [
      `Débito de R$ ${(valor ?? 0).toFixed(2)} no Cartão #${card.numeroCartao}. Saldo: R$ ${(saldoPosterior ?? 0).toFixed(2)}.`,
      ...prev,
    ]);
    return { success: true, message: `Consumo debitado com sucesso! Saldo restante: R$ ${(saldoPosterior ?? 0).toFixed(2)}.` };
  };

  const encerrarEstornarCartaoRfid = (codigoRfid: string): { success: boolean; valorEstornado: number; message: string } => {
    const card = cartoesConsumo.find((c) => c.codigoRfid === codigoRfid);
    if (!card) return { success: false, valorEstornado: 0, message: 'Cartão não encontrado.' };

    const valorEstorno = Math.max(0, card.saldoAtual);

    setCartoesConsumo((prev) =>
      prev.map((c) =>
        c.id === card.id
          ? {
              ...c,
              saldoAtual: 0,
              status: 'ENCERRADO',
              atualizadoEm:
                new Date().toLocaleDateString('pt-BR') +
                ' ' +
                new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            }
          : c
      )
    );

    if (valorEstorno > 0) {
      const mov: CartaoMovimentacao = {
        id: `cmov-${Date.now()}`,
        cartaoId: card.id,
        codigoRfid,
        tipo: 'ESTORNO',
        valor: valorEstorno,
        saldoAnterior: valorEstorno,
        saldoPosterior: 0,
        metodoPagamento: 'PIX',
        dataRegistro:
          new Date().toLocaleDateString('pt-BR') +
          ' ' +
          new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        operadorNome: currentUser.name,
        descricao: `Devolução / Estorno de saldo remanescente no encerramento`,
      };
      setCartoesMovimentacoes((prev) => [mov, ...prev]);
    }

    setNotifications((prev) => [
      `Cartão #${card.numeroCartao} encerrado. Valor devolvido: R$ ${(valorEstorno ?? 0).toFixed(2)}.`,
      ...prev,
    ]);
    return { success: true, valorEstornado: valorEstorno, message: `Cartão encerrado! Saldo de R$ ${(valorEstorno ?? 0).toFixed(2)} devolvido ao cliente.` };
  };

  const vincularRfidComanda = (comandaId: string, codigoRfid: string) => {
    setComandas((prev) => prev.map((c) => (c.id === comandaId ? { ...c, rfidCode: codigoRfid } : c)));
    setCartoesConsumo((prev) =>
      prev.map((card) => (card.codigoRfid === codigoRfid ? { ...card, comandaVinculadaId: comandaId } : card))
    );
    setNotifications((prev) => [`RFID ${codigoRfid} vinculado à Comanda com sucesso!`, ...prev]);
  };

  // KDS - Display do Bar/Cozinha
  const atualizarStatusKds = (kdsId: string, novoStatus: KdsStatus) => {
    setKdsPedidos((prev) =>
      prev.map((item) => {
        if (item.id === kdsId) {
          if (novoStatus === 'PRONTO') {
            setNotifications((n) => [
              `🔔 Bebida PRONTA para retirada! Ticket ${item.orderCode} (${item.clienteNome || 'Salão'}).`,
              ...n,
            ]);
          }
          return { ...item, status: novoStatus };
        }
        return item;
      })
    );
  };

  const adicionarPedidoAoKds = (pedido: Omit<KdsPedido, 'id' | 'tempoDecorridoMinutos'>) => {
    const novo: KdsPedido = {
      ...pedido,
      id: `kds-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      tempoDecorridoMinutos: 0,
    };
    setKdsPedidos((prev) => [novo, ...prev]);
  };

  // Delivery & Motoboys
  const criarDeliveryPedido = (
    pedido: Omit<DeliveryPedido, 'id' | 'orderId' | 'orderCode' | 'horaPedido'>
  ): DeliveryPedido => {
    const num = deliveryPedidos.length + 205;
    const novoPedido: DeliveryPedido = {
      ...pedido,
      id: `deliv-${num}`,
      orderId: `ord-${num}`,
      orderCode: `#${num}`,
      horaPedido: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setDeliveryPedidos((prev) => [novoPedido, ...prev]);

    // Envia ao KDS
    adicionarPedidoAoKds({
      orderCode: novoPedido.orderCode,
      canal: 'DELIVERY',
      clienteNome: `${novoPedido.clienteNome} (${novoPedido.bairro})`,
      itens: novoPedido.itens.map((it, idx) => ({
        id: `kdi-${Date.now()}-${idx}`,
        nome: it.product.name,
        quantidade: it.quantity,
        isDose: it.isDose,
        detalhes: it.notes || 'Separar e acondicionar para entrega externa',
      })),
      horaEntrada: novoPedido.horaPedido,
      timestampEntrada: Date.now(),
      status: 'RECEBIDO',
      setor: 'BAR',
      prioridade: true,
    });

    // Notificação WhatsApp automática de Pedido Recebido
    enviarNotificacaoWhatsapp(
      novoPedido.telefone,
      novoPedido.clienteNome,
      'PEDIDO_RECEBIDO',
      `🍷 Olá ${novoPedido.clienteNome}! Recebemos seu pedido ${novoPedido.orderCode} com ${novoPedido.itens.length} item(ns). Já estamos preparando e gelando suas bebidas!`
    );

    setNotifications((prev) => [
      `Novo pedido de delivery ${novoPedido.orderCode} registrado para ${novoPedido.bairro}.`,
      ...prev,
    ]);
    return novoPedido;
  };

  const despacharPedidoDelivery = (pedidoId: string, motoboyId: string) => {
    const motoboy = motoboys.find((m) => m.id === motoboyId);
    if (!motoboy) return;

    setDeliveryPedidos((prev) =>
      prev.map((p) => {
        if (p.id === pedidoId) {
          const despachado: DeliveryPedido = {
            ...p,
            status: 'DESPACHADO',
            motoboyId: motoboy.id,
            motoboyNome: motoboy.nome,
            horaDespacho: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };

          // Dispara WhatsApp de Rota
          enviarNotificacaoWhatsapp(
            p.telefone,
            p.clienteNome,
            'ROTA_DESPACHADA',
            `🛵 Suas bebidas estão a caminho! O motoboy ${motoboy.nome} (${motoboy.placaMoto}) acabou de sair da adega. Tempo estimado: ${p.tempoEstimadoMinutos} min.`
          );

          return despachado;
        }
        return p;
      })
    );

    setNotifications((prev) => [`Pedido ${pedidoId} despachado em rota com ${motoboy.nome}.`, ...prev]);
  };

  const concluirEntregaDelivery = (pedidoId: string) => {
    setDeliveryPedidos((prev) =>
      prev.map((p) => {
        if (p.id === pedidoId) {
          const entregue: DeliveryPedido = {
            ...p,
            status: 'ENTREGUE',
            horaEntrega: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };

          // Atualiza estatísticas do motoboy
          if (p.motoboyId) {
            setMotoboys((mots) =>
              mots.map((m) => {
                if (m.id === p.motoboyId) {
                  const taxa = m.tipoRemuneracao === 'POR_ENTREGA' ? m.valorPadrao : 0;
                  const emDinheiro = p.formaPagamento === 'DINHEIRO' ? p.total : 0;
                  const emCartao = p.formaPagamento.startsWith('TEF') ? p.total : 0;
                  return {
                    ...m,
                    entregasRealizadasHoje: m.entregasRealizadasHoje + 1,
                    totalTaxasAcumuladasHoje: m.totalTaxasAcumuladasHoje + taxa,
                    totalDinheiroRecebidoHoje: m.totalDinheiroRecebidoHoje + emDinheiro,
                    totalCartaoRecebidoHoje: m.totalCartaoRecebidoHoje + emCartao,
                  };
                }
                return m;
              })
            );
          }

          // WhatsApp de Entrega
          enviarNotificacaoWhatsapp(
            p.telefone,
            p.clienteNome,
            'PEDIDO_ENTREGUE',
            `✨ Olá ${p.clienteNome}, seu pedido foi entregue com sucesso! Esperamos que aproveite. Avalie nossa agilidade de 1 a 5 respondendo a esta mensagem!`
          );

          return entregue;
        }
        return p;
      })
    );

    setNotifications((prev) => [`Entrega ${pedidoId} concluída com sucesso!`, ...prev]);
  };

  const criarRotaLote = (motoboyId: string, pedidosIds: string[], bairro: string): RotaEntrega => {
    const motoboy = motoboys.find((m) => m.id === motoboyId);
    const pedidosFiltrados = deliveryPedidos.filter((p) => pedidosIds.includes(p.id));

    const totalTaxas = pedidosFiltrados.reduce((acc, p) => acc + p.taxaEntrega, 0);
    const totalDinheiro = pedidosFiltrados
      .filter((p) => p.formaPagamento === 'DINHEIRO')
      .reduce((acc, p) => acc + p.total, 0);

    const novaRota: RotaEntrega = {
      id: `rota-${Date.now()}`,
      lojaId: activeStore.id,
      motoboyId,
      motoboyNome: motoboy?.nome || 'Entregador',
      bairroRegiao: bairro,
      dataSaida:
        new Date().toLocaleDateString('pt-BR') +
        ' ' +
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'EM_ROTA',
      pedidos: pedidosFiltrados,
      totalPedidos: pedidosFiltrados.length,
      valorTotalTaxas: totalTaxas,
      valorTotalReceberDinheiro: totalDinheiro,
    };

    setRotasEntrega((prev) => [novaRota, ...prev]);

    // Despacha todos os pedidos da rota
    pedidosIds.forEach((id) => {
      despacharPedidoDelivery(id, motoboyId);
    });

    setNotifications((prev) => [
      `Rota em lote criada com ${pedidosFiltrados.length} pedidos atribuída a ${motoboy?.nome}.`,
      ...prev,
    ]);
    return novaRota;
  };

  const cadastrarMotoboy = (
    novo: Omit<
      Motoboy,
      | 'id'
      | 'entregasRealizadasHoje'
      | 'totalTaxasAcumuladasHoje'
      | 'totalDinheiroRecebidoHoje'
      | 'totalCartaoRecebidoHoje'
      | 'statusAcerto'
    >
  ) => {
    const moto: Motoboy = {
      ...novo,
      id: `moto-${Date.now()}`,
      entregasRealizadasHoje: 0,
      totalTaxasAcumuladasHoje: 0,
      totalDinheiroRecebidoHoje: 0,
      totalCartaoRecebidoHoje: 0,
      statusAcerto: 'ABERTO',
    };
    setMotoboys((prev) => [...prev, moto]);
    setNotifications((prev) => [`Entregador ${moto.nome} cadastrado com sucesso!`, ...prev]);
  };

  const liquidarAcertoMotoboy = (motoboyId: string): { success: boolean; recibo: string } => {
    const motoboy = motoboys.find((m) => m.id === motoboyId);
    if (!motoboy) return { success: false, recibo: '' };

    const taxaTotal = motoboy.totalTaxasAcumuladasHoje ?? (motoboy as any).saldoTaxasAcumuladas ?? 0;
    const dinheiroTotal = motoboy.totalDinheiroRecebidoHoje ?? (motoboy as any).totalDinheiroRecebidoEmMaos ?? 0;
    const cartaoTotal = motoboy.totalCartaoRecebidoHoje ?? 0;
    const saldoFinal = dinheiroTotal - taxaTotal; // Se positivo, motoboy devolve dinheiro à adega. Se negativo, adega paga ao motoboy.

    const recibo = `
========================================
       ADEGA MASTER - RECIBO DE ACERTO
========================================
Entregador: ${motoboy.nome}
Moto / Placa: ${motoboy.placaMoto}
Chave PIX: ${motoboy.chavePix}
Data: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
----------------------------------------
Entregas Realizadas: ${motoboy.entregasRealizadasHoje ?? (motoboy as any).totalEntregasTurno ?? 0}
Taxas a Pagar ao Motoboy: R$ {(taxaTotal ?? 0).toFixed(2)}
Dinheiro Coletado pelo Motoboy: R$ {(dinheiroTotal ?? 0).toFixed(2)}
Comprovantes Máquina Cartão: R$ {(cartaoTotal ?? 0).toFixed(2)}
----------------------------------------
${saldoFinal >= 0
  ? `SALDO A DEVOLVER NO CAIXA: R$ {(saldoFinal ?? 0).toFixed(2)} (Motoboy entrega dinheiro físico restante)`
  : `SALDO A PAGAR AO MOTOBOY: R$ {Math.abs(saldoFinal ?? 0).toFixed(2)} (Via PIX ${motoboy.chavePix})`
}
----------------------------------------
Acerto Liquidado por: ${currentUser.name}
========================================`.trim();

    setMotoboys((prev) =>
      prev.map((m) =>
        m.id === motoboyId
          ? {
              ...m,
              entregasRealizadasHoje: 0,
              totalTaxasAcumuladasHoje: 0,
              totalDinheiroRecebidoHoje: 0,
              totalCartaoRecebidoHoje: 0,
              statusAcerto: 'LIQUIDADO',
            }
          : m
      )
    );

    addAccessLog('ACERTO_MOTOBOY', `Acerto liquidado com ${motoboy.nome}: R$ ${taxaTotal.toFixed(2)} em taxas.`);
    setNotifications((prev) => [`Turno do motoboy ${motoboy.nome} liquidado com sucesso!`, ...prev]);
    return { success: true, recibo };
  };

  // Notificações WhatsApp
  const enviarNotificacaoWhatsapp = (
    telefone: string,
    nome: string,
    tipo: WhatsappNotificacao['tipoMensagem'],
    textoCustom?: string
  ): WhatsappNotificacao => {
    let texto = textoCustom || '';
    if (!texto) {
      if (tipo === 'PEDIDO_RECEBIDO') {
        texto = `Olá ${nome}! Seu pedido na Adega foi recebido e já está em preparo.`;
      } else if (tipo === 'ROTA_DESPACHADA') {
        texto = `Olá ${nome}! Seu pedido acabou de sair para entrega com o motoboy.`;
      } else if (tipo === 'PEDIDO_ENTREGUE') {
        texto = `Seu pedido foi entregue! Esperamos que aproveite.`;
      } else if (tipo === 'FILA_CHAMADA') {
        texto = `Olá ${nome}, sua mesa na Adega está pronta! Por favor, dirija-se à nossa recepção.`;
      }
    }

    const novaNotificacao: WhatsappNotificacao = {
      id: `wpp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      telefone,
      destinatarioNome: nome,
      tipoMensagem: tipo,
      texto,
      statusEnvio: 'ENVIADO',
      dataDisparo: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setWhatsappNotificacoes((prev) => [novaNotificacao, ...prev]);
    return novaNotificacao;
  };

  // Fidelidade & Cashback
  const acumularCashbackCompra = (
    cpfOuTelefone: string,
    valorGasto: number,
    pedidoCodigo: string
  ): { cashbackGanho: number; novoSaldo: number } => {
    const cliente = clientesFidelidade.find((c) => c.cpf === cpfOuTelefone || c.telefone === cpfOuTelefone);
    if (!cliente) return { cashbackGanho: 0, novoSaldo: 0 };

    const cashbackGanho = Number(((valorGasto * cliente.percentualCashbackAtual) / 100).toFixed(2));
    const pontosGanhos = Math.floor(valorGasto * 1);
    const novoSaldo = Number((cliente.saldoCashback + cashbackGanho).toFixed(2));

    setClientesFidelidade((prev) =>
      prev.map((c) =>
        c.id === cliente.id
          ? {
              ...c,
              saldoCashback: novoSaldo,
              pontos: c.pontos + pontosGanhos,
              totalGastoHistorico: c.totalGastoHistorico + valorGasto,
            }
          : c
      )
    );

    const mov: FidelidadeMovimento = {
      id: `fext-${Date.now()}`,
      clienteId: cliente.id,
      tipo: 'CREDITO_COMPRA',
      valorCashback: cashbackGanho,
      pontos: pontosGanhos,
      dataMovimento:
        new Date().toLocaleDateString('pt-BR') +
        ' ' +
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      pedidoCodigo,
      saldoFinalCashback: novoSaldo,
    };
    setFidelidadeExtrato((prev) => [mov, ...prev]);

    setNotifications((prev) => [
      `Cashback de +R$ ${(cashbackGanho ?? 0).toFixed(2)} creditado para ${cliente.nome}! Saldo: R$ ${(novoSaldo ?? 0).toFixed(2)}.`,
      ...prev,
    ]);
    return { cashbackGanho, novoSaldo };
  };

  const resgatarCashback = (clienteId: string, valorResgate: number): { success: boolean; message: string } => {
    const cliente = clientesFidelidade.find((c) => c.id === clienteId);
    if (!cliente) return { success: false, message: 'Cliente não cadastrado no programa.' };
    if ((cliente.saldoCashback ?? 0) < valorResgate) {
      return { success: false, message: `Saldo insuficiente para resgate. Disponível: R$ ${(cliente.saldoCashback ?? 0).toFixed(2)}.` };
    }

    const novoSaldo = Number(((cliente.saldoCashback ?? 0) - valorResgate).toFixed(2));
    setClientesFidelidade((prev) =>
      prev.map((c) =>
        c.id === clienteId
          ? {
              ...c,
              saldoCashback: novoSaldo,
            }
          : c
      )
    );

    const mov: FidelidadeMovimento = {
      id: `fext-${Date.now()}`,
      clienteId: cliente.id,
      tipo: 'RESGATE_USO',
      valorCashback: -valorResgate,
      pontos: -Math.floor(valorResgate * 10),
      dataMovimento:
        new Date().toLocaleDateString('pt-BR') +
        ' ' +
        new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      pedidoCodigo: 'RESGATE-AVULSO',
      saldoFinalCashback: novoSaldo,
    };
    setFidelidadeExtrato((prev) => [mov, ...prev]);

    setNotifications((prev) => [
      `Resgate de R$ ${(valorResgate ?? 0).toFixed(2)} em Cashback aplicado para ${cliente.nome}!`,
      ...prev,
    ]);
    return { success: true, message: `Resgate de R$ ${(valorResgate ?? 0).toFixed(2)} aplicado com sucesso!` };
  };

  // Fila de Espera Digital
  const adicionarFilaEspera = (
    nome: string,
    telefone: string,
    pessoas: number,
    observacao?: string
  ): FilaEsperaItem => {
    const mesaComp = tables.find((t) => t.status === 'FREE' && (t.capacity || 4) >= pessoas);

    const novo: FilaEsperaItem = {
      id: `fila-${Date.now()}`,
      lojaId: activeStore.id,
      clienteNome: nome,
      telefone,
      quantidadePessoas: pessoas,
      status: 'AGUARDANDO',
      horaChegada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      tempoAguardandoMinutos: 0,
      observacao,
      mesaSugeridaNumero: mesaComp ? mesaComp.number : undefined,
    };

    setFilaEspera((prev) => [...prev, novo]);
    setNotifications((prev) => [`${nome} (${pessoas} pessoas) inserido na Fila de Espera.`, ...prev]);
    return novo;
  };

  const chamarClienteFila = (filaId: string, mesaNumero?: number) => {
    const item = filaEspera.find((f) => f.id === filaId);
    if (!item) return;

    setFilaEspera((prev) => prev.map((f) => (f.id === filaId ? { ...f, status: 'NOTIFICADO' } : f)));

    enviarNotificacaoWhatsapp(
      item.telefone,
      item.clienteNome,
      'FILA_CHAMADA',
      `🔔 Olá ${item.clienteNome}! Sua mesa ${mesaNumero ? `0${mesaNumero}` : ''} na Adega está disponível e pronta para receber seu grupo (${item.quantidadePessoas} pessoas). Por favor, apresente-se na recepção!`
    );

    setNotifications((prev) => [`Notificação enviada para ${item.clienteNome} no WhatsApp com chamada para mesa!`, ...prev]);
  };

  const alocarClienteFilaMesa = (filaId: string, mesaId: number) => {
    const item = filaEspera.find((f) => f.id === filaId);
    const mesa = tables.find((t) => t.id === mesaId);
    if (!item || !mesa) return;

    updateTable(mesaId, {
      status: 'OCCUPIED',
      guestsCount: item.quantidadePessoas,
      customerName: item.clienteNome,
      openedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      waiterName: currentUser.name,
      totalAmount: 0,
      items: [],
    });

    setFilaEspera((prev) => prev.map((f) => (f.id === filaId ? { ...f, status: 'ALOCADO' } : f)));
    setNotifications((prev) => [`${item.clienteNome} alocado na Mesa 0${mesa.number}!`, ...prev]);
  };

  const removerClienteFila = (filaId: string, motivo: 'DESISTIU' | 'ALOCADO' = 'DESISTIU') => {
    setFilaEspera((prev) => prev.filter((f) => f.id !== filaId));
    setNotifications((prev) => [`Cliente removido da fila de espera (${motivo}).`, ...prev]);
  };

  // Delivery
  const updateDeliveryStatus = (orderId: string, status: OrderStatus, courierId?: string, courierName?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedInfo = ord.deliveryInfo ? {
            ...ord.deliveryInfo,
            courierId: courierId || ord.deliveryInfo.courierId,
            courierName: courierName || ord.deliveryInfo.courierName,
          } : undefined;
          return { ...ord, status, deliveryInfo: updatedInfo };
        }
        return ord;
      })
    );
  };

  // Caixa & Turnos (Módulo 2)
  const openCashSession = (initialAmount: number, terminalNumber: string = 'Caixa 01') => {
    setCashSession({
      id: `cx-${Date.now()}`,
      storeId: activeStore.id,
      operatorId: currentUser.id,
      operatorName: currentUser.name,
      openedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      initialCash: initialAmount,
      currentCash: initialAmount,
      totalSalesPix: 0,
      totalSalesCard: 0,
      totalSalesCash: 0,
      bleedAmount: 0,
      supplyAmount: 0,
      isOpen: true,
    });

    addAccessLog('ABERTURA_CAIXA', `Abertura do ${terminalNumber} com Fundo de Troco inicial de R$ ${initialAmount.toFixed(2)}`);
    recordAudit({
      categoria: 'CAIXA_SESSAO',
      severidade: 'LOW',
      usuarioId: currentUser.id,
      usuarioNome: currentUser.name,
      usuarioRole: currentUser.role,
      terminal: terminalNumber,
      descricao: `Abertura de Caixa com fundo inicial de R$ ${initialAmount.toFixed(2)}`,
      detalhesTecnicos: {
        impactoFinanceiro: initialAmount,
      }
    });
    setNotifications((prev) => [`Caixa Aberto: Fundo inicial de R$ ${initialAmount.toFixed(2)} registrado.`, ...prev]);
  };

  const closeCashSession = () => {
    setCashSession((prev) => ({
      ...prev,
      closedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isOpen: false,
    }));
    addAccessLog('FECHAMENTO_CAIXA', `Turno do ${currentUser.name} encerrado.`);
    recordAudit({
      categoria: 'CAIXA_SESSAO',
      severidade: 'HIGH',
      usuarioId: currentUser.id,
      usuarioNome: currentUser.name,
      usuarioRole: currentUser.role,
      terminal: 'PDV 01',
      descricao: `Turno de caixa encerrado pelo operador ${currentUser.name}`,
    });
    setNotifications((prev) => ['Turno de caixa encerrado com sucesso. Relatório emitido.', ...prev]);
  };

  const performCashMovement = (type: 'BLEED' | 'SUPPLY', amount: number, reason: string) => {
    setCashSession((prev) => {
      const isBleed = type === 'BLEED';
      const newCash = isBleed ? prev.currentCash - amount : prev.currentCash + amount;
      return {
        ...prev,
        currentCash: Math.max(0, newCash),
        bleedAmount: isBleed ? prev.bleedAmount + amount : prev.bleedAmount,
        supplyAmount: !isBleed ? prev.supplyAmount + amount : prev.supplyAmount,
      };
    });
    setNotifications((prev) => [
      `${type === 'BLEED' ? 'Sangria de Caixa' : 'Suprimento de Caixa'}: R$ ${amount.toFixed(2)} (${reason})`,
      ...prev,
    ]);
  };

  const performSangria = (
    amount: number, 
    reason: string, 
    managerPin: string
  ): { success: boolean; movement?: CashMovement; error?: string } => {
    const auth = verifyManagerPin(managerPin);
    if (!auth.valid || !auth.manager) {
      return { success: false, error: 'Autorização Negada: PIN de Gerente ou Super Admin incorreto!' };
    }

    if (amount <= 0) {
      return { success: false, error: 'O valor da sangria deve ser maior que zero.' };
    }

    if (amount > cashSession.currentCash) {
      return { 
        success: false, 
        error: `Saldo em dinheiro insuficiente no gaveteiro (Saldo atual: R$ ${(cashSession.currentCash ?? 0).toFixed(2)}).` 
      };
    }

    const movement: CashMovement = {
      id: `mov-${Date.now()}`,
      sessionId: cashSession.id,
      userId: currentUser.id,
      userName: currentUser.name,
      managerAuthorizedId: auth.manager.id,
      managerAuthorizedName: `${auth.manager.name} (${auth.manager.role === 'SUPER_ADMIN' ? 'Admin' : 'Gerente'})`,
      tipo: 'SANGRIA',
      valor: amount,
      motivo: reason,
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setCashSession((prev) => ({
      ...prev,
      currentCash: Math.max(0, prev.currentCash - amount),
      bleedAmount: prev.bleedAmount + amount,
    }));

    setCashMovements((prev) => [movement, ...prev]);
    addAccessLog('SANGRIA', `Sangria de R$ ${(amount ?? 0).toFixed(2)} autorizada por ${auth.manager.name} (${reason})`);
    recordAudit({
      categoria: 'SANGRIA_SUPRIMENTO',
      severidade: 'HIGH',
      usuarioId: currentUser.id,
      usuarioNome: currentUser.name,
      usuarioRole: currentUser.role,
      autorizadorNome: auth.manager.name,
      terminal: 'PDV 01 - Balcão Principal',
      descricao: `Sangria de Caixa de R$ ${amount.toFixed(2)} autorizada por ${auth.manager.name}`,
      detalhesTecnicos: {
        documentoRef: movement.id,
        motivo: reason,
        impactoFinanceiro: -amount,
      }
    });
    setNotifications((prev) => [`Sangria de R$ ${(amount ?? 0).toFixed(2)} realizada com sucesso. Comprovante gerado.`, ...prev]);

    return { success: true, movement };
  };

  const performSuprimento = (amount: number, reason: string): CashMovement => {
    const movement: CashMovement = {
      id: `mov-${Date.now()}`,
      sessionId: cashSession.id,
      userId: currentUser.id,
      userName: currentUser.name,
      tipo: 'SUPRIMENTO',
      valor: amount,
      motivo: reason,
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setCashSession((prev) => ({
      ...prev,
      currentCash: prev.currentCash + amount,
      supplyAmount: prev.supplyAmount + amount,
    }));

    setCashMovements((prev) => [movement, ...prev]);
    addAccessLog('SUPRIMENTO', `Suprimento de R$ ${(amount ?? 0).toFixed(2)} inserido no caixa (${reason})`);
    recordAudit({
      categoria: 'SANGRIA_SUPRIMENTO',
      severidade: 'MEDIUM',
      usuarioId: currentUser.id,
      usuarioNome: currentUser.name,
      usuarioRole: currentUser.role,
      terminal: 'PDV 01 - Balcão Principal',
      descricao: `Suprimento de Caixa de R$ ${amount.toFixed(2)} adicionado`,
      detalhesTecnicos: {
        documentoRef: movement.id,
        motivo: reason,
        impactoFinanceiro: amount,
      }
    });
    setNotifications((prev) => [`Suprimento de R$ ${(amount ?? 0).toFixed(2)} adicionado ao caixa.`, ...prev]);

    return movement;
  };

  const performBlindClose = (declared: { 
    cash: number; 
    credit: number; 
    debit: number; 
    pix: number; 
    notes?: string 
  }): CashBlindCloseRecord => {
    // Valores apurados pelo sistema na sessão
    const sistemaDinheiro = cashSession.currentCash;
    const sistemaCartaoCredito = cashSession.totalSalesCard * 0.6; // 60% crédito
    const sistemaCartaoDebito = cashSession.totalSalesCard * 0.4; // 40% débito
    const sistemaPix = cashSession.totalSalesPix;
    const totalSistema = sistemaDinheiro + cashSession.totalSalesCard + sistemaPix;

    const totalDeclarado = declared.cash + declared.credit + declared.debit + declared.pix;
    const diferencaDinheiro = declared.cash - sistemaDinheiro;
    const diferencaTotal = totalDeclarado - totalSistema;

    let statusConfronto: 'EXATO' | 'SOBRA' | 'QUEBRA' = 'EXATO';
    if (Math.abs(diferencaTotal) > 0.05) {
      statusConfronto = diferencaTotal > 0 ? 'SOBRA' : 'QUEBRA';
    }

    const record: CashBlindCloseRecord = {
      sessionId: cashSession.id,
      dataFechamento: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      operadorId: currentUser.id,
      operadorNome: currentUser.name,
      declaradoDinheiro: declared.cash,
      declaradoCartaoCredito: declared.credit,
      declaradoCartaoDebito: declared.debit,
      declaradoPix: declared.pix,
      totalDeclarado,
      sistemaDinheiro,
      sistemaCartaoCredito,
      sistemaCartaoDebito,
      sistemaPix,
      totalSistema,
      diferencaDinheiro,
      diferencaTotal,
      statusConfronto,
      observacoes: declared.notes,
    };

    setBlindCloseRecords((prev) => [record, ...prev]);
    closeCashSession();
    return record;
  };

  // ============================================================
  // MÓDULO 5: Fiscal e Conformidade Tributária Brasileira (Actions)
  // ============================================================
  const emitirDocumentoFiscal = (doc: DocumentoFiscalCompleto) => {
    setDocumentosFiscais((prev) => [doc, ...prev]);
    setFiscalDocuments((prev) => [
      {
        id: doc.id,
        orderId: doc.vendaId || 'ord-manual',
        number: doc.numeroNota,
        series: doc.serie,
        type: doc.modelo === '55' ? 'NFe' : 'NFCe',
        accessKey: doc.chaveAcesso,
        authorizationProtocol: doc.protocoloAutorizacao,
        issuedAt: doc.dataEmissao,
        status: doc.statusSefaz === 'AUTORIZADO' ? 'AUTORIZADA' : 'CONTINGENCIA',
        totalValue: doc.valorTotal,
        recipientCpfCnpj: doc.destinatarioCpfCnpj,
        xmlMock: doc.xmlEnviado,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      `SEFAZ: ${doc.modelo === '55' ? 'NF-e 55' : 'NFC-e 65'} nº ${doc.numeroNota} emitida com sucesso! (Chave: ${doc.chaveAcesso.slice(0, 8)}...)`,
      ...prev,
    ]);
  };

  const cancelarDocumentoFiscal = (docId: string, justificativa: string): { success: boolean; message: string } => {
    const doc = documentosFiscais.find((d) => d.id === docId);
    if (!doc) return { success: false, message: 'Documento não localizado.' };
    if (doc.statusSefaz === 'CANCELADO') return { success: false, message: 'Documento já se encontra cancelado.' };

    const cancelProtocol = `135269988${Math.floor(Math.random() * 900000) + 100000}`;
    const dataHora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setDocumentosFiscais((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              statusSefaz: 'CANCELADO',
              codigoStatusResposta: '101',
              protocoloCancelamento: cancelProtocol,
              dataCancelamento: dataHora,
              motivoCancelamento: justificativa,
            }
          : d
      )
    );

    setFiscalDocuments((prev) =>
      prev.map((d) => (d.id === docId || d.number === doc.numeroNota ? { ...d, status: 'CANCELADA' } : d))
    );

    setNotifications((prev) => [
      `Cancelamento Homologado: ${doc.modelo === '55' ? 'NF-e' : 'NFC-e'} nº ${doc.numeroNota} cancelada na SEFAZ (Prot: ${cancelProtocol}).`,
      ...prev,
    ]);

    return { success: true, message: `Cancelamento homologado sob protocolo ${cancelProtocol}` };
  };

  const sincronizarContingencias = (): { sincronizadas: number; message: string } => {
    let count = 0;
    setDocumentosFiscais((prev) =>
      prev.map((doc) => {
        if (doc.statusSefaz === 'CONTINGENCIA') {
          count++;
          return {
            ...doc,
            statusSefaz: 'AUTORIZADO',
            codigoStatusResposta: '100',
            protocoloAutorizacao: `135269988${Math.floor(Math.random() * 900000) + 100000}`,
            dataAutorizacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            naturezaOperacao: 'VENDA A CONSUMIDOR FINAL (TRANSMITIDA POS-CONTINGENCIA)',
          };
        }
        return doc;
      })
    );

    if (count > 0) {
      setNotifications((prev) => [
        `Sincronização SEFAZ: ${count} notas emitidas em contingência offline foram transmitidas e autorizadas com sucesso (cStat 100)!`,
        ...prev,
      ]);
      return { sincronizadas: count, message: `${count} notas fiscais transmitidas e homologadas pela SEFAZ!` };
    }
    return { sincronizadas: 0, message: 'Nenhuma nota pendente de transmissão.' };
  };

  const manifestarDFe = (dfeId: string, status: ManifestacaoDFe['statusManifestacao']): { success: boolean; message: string } => {
    const protocol = `135269988${Math.floor(Math.random() * 900000) + 100000}`;
    const dataHora = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setManifestacoesDfe((prev) =>
      prev.map((m) =>
        m.id === dfeId
          ? {
              ...m,
              statusManifestacao: status,
              protocoloManifestacao: protocol,
              dataManifestacao: dataHora,
            }
          : m
      )
    );

    const tipoNome =
      status === 'CONFIRMADA'
        ? 'Confirmação da Operação (210200)'
        : status === 'CIENCIA'
        ? 'Ciência da Emissão (210210)'
        : status === 'DESCONHECIDA'
        ? 'Desconhecimento da Operação (210220)'
        : 'Operação Não Realizada (210240)';

    setNotifications((prev) => [
      `MD-e SEFAZ: Evento "${tipoNome}" homologado com sucesso sob protocolo ${protocol}.`,
      ...prev,
    ]);

    return { success: true, message: `Evento "${tipoNome}" homologado na SEFAZ com sucesso!` };
  };

  const importarDFeParaEstoque = (dfeId: string): { success: boolean; itensImportados: number; message: string } => {
    const dfe = manifestacoesDfe.find((m) => m.id === dfeId);
    if (!dfe) return { success: false, itensImportados: 0, message: 'Nota fiscal de entrada não encontrada.' };
    if (dfe.statusEstoque === 'IMPORTADA')
      return { success: false, itensImportados: 0, message: 'Esta nota fiscal já foi importada anteriormente no estoque.' };

    let totalImportado = 0;
    dfe.itens.forEach((item) => {
      totalImportado += item.quantidadeConvertida;
      if (item.produtoSistemaId) {
        setProducts((prev) =>
          prev.map((p) => {
            if (p.id === item.produtoSistemaId) {
              const estoqueAntigo = p.stockUnits;
              const custoAntigo = p.costPrice;
              const qtdNova = item.quantidadeConvertida;
              const custoNovo = item.custoUnitarioFinalComStEFrete;
              const novoCustoMedio =
                estoqueAntigo + qtdNova > 0
                  ? (estoqueAntigo * custoAntigo + qtdNova * custoNovo) / (estoqueAntigo + qtdNova)
                  : custoNovo;

              return {
                ...p,
                stockUnits: p.stockUnits + qtdNova,
                costPrice: parseFloat(novoCustoMedio.toFixed(2)),
              };
            }
            return p;
          })
        );
      }
    });

    setManifestacoesDfe((prev) => prev.map((m) => (m.id === dfeId ? { ...m, statusEstoque: 'IMPORTADA' } : m)));

    setNotifications((prev) => [
      `Entrada de Mercadorias: NF-e nº ${dfe.numeroNota} (${dfe.razaoSocialEmitente}) importada com sucesso (+${totalImportado} itens convertidos e custo médio atualizado).`,
      ...prev,
    ]);

    return {
      success: true,
      itensImportados: totalImportado,
      message: `NF-e nº ${dfe.numeroNota} importada com sucesso! +${totalImportado} unidades adicionadas ao estoque com custo médio recalculado.`,
    };
  };

  const emitirCartaCorrecao = (cce: CartaCorrecaoEvento) => {
    setCartasCorrecao((prev) => [cce, ...prev]);
    setNotifications((prev) => [
      `CC-e Homologada: Carta de correção para ${cce.modelo === '55' ? 'NF-e' : 'NFC-e'} nº ${cce.numeroNota} registrada na SEFAZ (Prot: ${cce.protocoloSefaz}).`,
      ...prev,
    ]);
  };

  const inutilizarFaixaNumeracao = (inut: InutilizacaoFaixa) => {
    setInutilizacoesFaixa((prev) => [inut, ...prev]);
    setNotifications((prev) => [
      `Inutilização SEFAZ: Faixa ${inut.numeroInicial} a ${inut.numeroFinal} (Série ${inut.serie}, Mod ${inut.modelo}) homologada sob protocolo ${inut.protocoloInutilizacao}.`,
      ...prev,
    ]);
  };

  const resolverAlertaRisco = (alertaId: string) => {
    setAuditoriaRiscos((prev) =>
      prev.map((a) => (a.id === alertaId ? { ...a, statusResolucao: 'RESOLVIDO' } : a))
    );
  };

  const atualizarCertificado = (partial: Partial<CertificadoDigitalA1>) => {
    setCertificadoDigital((prev) => ({ ...prev, ...partial }));
    setNotifications((prev) => ['Certificado Digital A1 atualizado com sucesso no repositório seguro.', ...prev]);
  };

  const agendarEnvioContador = (email: string, mesCompetencia: string) => {
    setExportacaoContabil((prev) => ({
      ...prev,
      emailContador: email,
      mesCompetencia,
      dataUltimoEnvio: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      statusEnvioEmail: 'ENVIADO',
      protocoloContabilidade: `CONTAB-${Date.now().toString().slice(-6)}`,
    }));
    setNotifications((prev) => [
      `Contabilidade: Pacote mensal com SPED Bloco H, Sintegra e XMLs transmitido com sucesso para ${email}!`,
      ...prev,
    ]);
  };

  // ============================================================
  // MÓDULO 6: Ações de Backoffice Financeiro, Compras IA & Multilojas
  // ============================================================
  const adicionarContaPagar = (conta: Omit<ContaPagar, 'id' | 'valorPago' | 'status'>) => {
    const nova: ContaPagar = {
      ...conta,
      id: `pag-${Date.now()}`,
      valorPago: 0,
      status: 'PENDENTE',
    };
    setContasPagar((prev) => [nova, ...prev]);
    setNotifications((prev) => [
      `Conta a Pagar cadastrada: ${nova.fornecedorNome} - R$ ${(nova.valorNominal ?? 0).toFixed(2)} (Venc: ${nova.dataVencimento}).`,
      ...prev,
    ]);
  };

  const baixarContaPagar = (id: string, valorPago: number, origem: OrigemPagamento): { success: boolean; message: string } => {
    const cp = contasPagar.find((c) => c.id === id);
    if (!cp) return { success: false, message: 'Conta a pagar não encontrada.' };

    const dataHoje = new Date().toISOString().split('T')[0];
    setContasPagar((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'PAGO',
              valorPago,
              dataPagamento: dataHoje,
              origemPagamento: origem,
            }
          : c
      )
    );

    if (origem === 'SANGRIA_PDV' && cashSession?.status === 'OPEN') {
      performCashMovement('BLEED', valorPago, `Pagamento fornecedor: ${cp.fornecedorNome} (${cp.numeroDocumento})`);
    }

    const msg = `Baixa de conta realizada: ${cp.fornecedorNome} - R$ ${(valorPago ?? 0).toFixed(2)} liquidado via ${origem === 'SANGRIA_PDV' ? 'Sangria do PDV' : 'Conta Bancária'}!`;
    setNotifications((prev) => [msg, ...prev]);
    return { success: true, message: msg };
  };

  const cancelarContaPagar = (id: string) => {
    setContasPagar((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'CANCELADO' } : c))
    );
    setNotifications((prev) => ['Conta a pagar cancelada.', ...prev]);
  };

  const conciliarContaReceber = (id: string) => {
    const dataHoje = new Date().toISOString().split('T')[0];
    setContasReceber((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'LIQUIDADO', dataRepasseEfetivo: dataHoje } : c))
    );
    setNotifications((prev) => ['Conta a receber liquidada e confirmada no extrato!', ...prev]);
  };

  const reportarDivergenciaReceber = (id: string, motivo: string) => {
    setContasReceber((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'DIVERGENTE', divergenciaNota: motivo } : c))
    );
    setNotifications((prev) => [`Divergência financeira apontada no borderô da adquirente: ${motivo}`, ...prev]);
  };

  const adicionarOrdemCompra = (ordem: Omit<OrdemCompra, 'id' | 'codigo'>) => {
    const nova: OrdemCompra = {
      ...ordem,
      id: `oc-${Date.now()}`,
      codigo: `OC-2025-${Math.floor(Math.random() * 900) + 100}`,
    };
    setOrdensCompra((prev) => [nova, ...prev]);
    setNotifications((prev) => [
      `Ordem de Compra gerada: ${nova.codigo} (${nova.fornecedorNome}) - Total est. R$ ${(nova.valorTotalEstimado ?? 0).toFixed(2)}.`,
      ...prev,
    ]);
  };

  const aprovarOrdemCompra = (id: string) => {
    setOrdensCompra((prev) =>
      prev.map((oc) => (oc.id === id ? { ...oc, status: 'ENVIADO' } : oc))
    );
    setNotifications((prev) => ['Ordem de compra aprovada e transmitida ao distribuidor!', ...prev]);
  };

  const receberOrdemCompraEstoque = (id: string): { success: boolean; itensRecebidos: number; message: string } => {
    const oc = ordensCompra.find((o) => o.id === id);
    if (!oc) return { success: false, itensRecebidos: 0, message: 'Ordem de compra não encontrada.' };

    let totalItens = 0;
    oc.itens.forEach((item) => {
      restockProduct(item.produtoId, item.quantidadeAprovada || item.quantidadeSugerida);
      totalItens += item.quantidadeAprovada || item.quantidadeSugerida;
    });

    setOrdensCompra((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'RECEBIDO_TOTAL' } : o))
    );

    const msg = `Ordem de Compra ${oc.codigo} recebida: +${totalItens} unidades integradas diretamente ao estoque da adega!`;
    setNotifications((prev) => [msg, ...prev]);
    return { success: true, itensRecebidos: totalItens, message: msg };
  };

  // ============================================================
  // MÓDULO DE COMPRAS E FORNECEDORES - IMPLEMENTAÇÃO
  // ============================================================
  const adicionarFornecedor = (
    fornecedorData: Omit<Fornecedor, 'id' | 'totalPedidosRealizados' | 'valorTotalComprado'>
  ): Fornecedor => {
    const novo: Fornecedor = {
      ...fornecedorData,
      id: `forn-${Date.now()}`,
      totalPedidosRealizados: 0,
      valorTotalComprado: 0,
      ultimoPedidoData: undefined,
    };
    setFornecedores((prev) => [novo, ...prev]);
    setNotifications((prev) => [
      `Fornecedor cadastrado: ${novo.nomeFantasia} (${novo.cnpj}).`,
      ...prev,
    ]);
    return novo;
  };

  const atualizarFornecedor = (fornecedor: Fornecedor) => {
    setFornecedores((prev) => prev.map((f) => (f.id === fornecedor.id ? fornecedor : f)));
    setNotifications((prev) => [`Cadastro do fornecedor ${fornecedor.nomeFantasia} atualizado.`, ...prev]);
  };

  const excluirFornecedor = (id: string): { success: boolean; message: string } => {
    const fornecedor = fornecedores.find((f) => f.id === id);
    if (!fornecedor) return { success: false, message: 'Fornecedor não encontrado.' };
    
    // Se possui pedidos de compra, bloqueia em vez de excluir
    const temPedidos = pedidosCompra.some((p) => p.fornecedorId === id);
    if (temPedidos) {
      setFornecedores((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'BLOQUEADO' } : f))
      );
      const msg = `Fornecedor ${fornecedor.nomeFantasia} possui pedidos vinculados e foi alterado para status BLOQUEADO.`;
      setNotifications((prev) => [msg, ...prev]);
      return { success: true, message: msg };
    }

    setFornecedores((prev) => prev.filter((f) => f.id !== id));
    const msg = `Fornecedor ${fornecedor.nomeFantasia} removido com sucesso.`;
    setNotifications((prev) => [msg, ...prev]);
    return { success: true, message: msg };
  };

  const adicionarPedidoCompra = (
    pedidoData: Omit<PedidoCompra, 'id' | 'codigo' | 'dataEmissao' | 'historicoStatus'>
  ): PedidoCompra => {
    const agora = new Date();
    const dataEmissao = agora.toISOString().split('T')[0];
    const dataHoraFormatada = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    const novo: PedidoCompra = {
      ...pedidoData,
      id: `ped-${Date.now()}`,
      codigo: `PC-2026-${Math.floor(100 + Math.random() * 900)}`,
      dataEmissao,
      historicoStatus: [
        {
          status: pedidoData.status || 'RASCUNHO',
          dataHora: dataHoraFormatada,
          usuario: `${currentUser.name} (${currentUser.role})`,
          observacao: pedidoData.geradoPorIa ? 'Sugerido automaticamente pelo motor preditivo ROP' : 'Emissão manual',
        },
      ],
    };

    setPedidosCompra((prev) => [novo, ...prev]);
    setNotifications((prev) => [
      `Pedido de Compra gerado: ${novo.codigo} (${novo.fornecedorNome}) - Total R$ ${novo.valorTotal.toFixed(2)}.`,
      ...prev,
    ]);
    return novo;
  };

  const atualizarPedidoCompra = (pedido: PedidoCompra) => {
    setPedidosCompra((prev) => prev.map((p) => (p.id === pedido.id ? pedido : p)));
  };

  const atualizarStatusPedidoCompra = (id: string, novoStatus: StatusPedidoCompra, observacao?: string) => {
    const agora = new Date();
    const dataHoraFormatada = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    setPedidosCompra((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          status: novoStatus,
          historicoStatus: [
            ...p.historicoStatus,
            {
              status: novoStatus,
              dataHora: dataHoraFormatada,
              usuario: `${currentUser.name} (${currentUser.role})`,
              observacao,
            },
          ],
        };
      })
    );
    setNotifications((prev) => [`Pedido ${id} atualizado para status: ${novoStatus}.`, ...prev]);
  };

  const cancelarPedidoCompra = (id: string, motivo: string) => {
    atualizarStatusPedidoCompra(id, 'CANCELADO', `Cancelado: ${motivo}`);
  };

  const realizarRecebimentoMercadoria = (dados: {
    pedidoCompraId?: string;
    fornecedorId: string;
    notaFiscalNumero?: string;
    notaFiscalChave?: string;
    itens: Array<{
      produtoId: string;
      quantidadeRecebida: number;
      precoCustoUnitario: number;
      fatorConversao?: number;
      loteNumero?: string;
      dataValidade?: string;
      localArmazenamento?: string;
      avariasOuQuebras?: number;
      observacao?: string;
    }>;
    gerarContaPagar?: boolean;
    condicaoPagamento?: string;
    dataVencimentoBoleto?: string;
    observacoesGerais?: string;
  }): { success: boolean; recebimento: RecebimentoMercadoria; message: string } => {
    const fornecedor = fornecedores.find((f) => f.id === dados.fornecedorId);
    const pedido = pedidosCompra.find((p) => p.id === dados.pedidoCompraId);

    const agora = new Date();
    const dataHoraFormatada = `${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    let totalItensEstoque = 0;
    let valorTotal = 0;

    const itensConferidos: ItemConferenciaRecebimento[] = dados.itens.map((item) => {
      const prod = products.find((p) => p.id === item.produtoId);
      const fator = item.fatorConversao || 1;
      const qtdTotalEstoque = item.quantidadeRecebida * fator;
      const subtotalItem = item.quantidadeRecebida * item.precoCustoUnitario;
      
      totalItensEstoque += qtdTotalEstoque;
      valorTotal += subtotalItem;

      // 1. Atualizar estoque imediatamente
      if (qtdTotalEstoque > 0 && prod) {
        restockProduct(
          item.produtoId, 
          qtdTotalEstoque, 
          `Recebimento de Mercadoria - NF-e ${dados.notaFiscalNumero || 'S/N'} (${fornecedor?.nomeFantasia || 'Distribuidor'})`
        );
      }

      // 2. Criar Lote rastreável se informado
      if (item.loteNumero && item.dataValidade && prod) {
        const diasParaVenc = Math.max(0, Math.ceil((new Date(item.dataValidade).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
        addProdutoLote({
          lojaId: activeStore.id,
          produtoId: prod.id,
          produtoNome: prod.name,
          numeroLote: item.loteNumero,
          dataFabricacao: agora.toISOString().split('T')[0],
          dataValidade: item.dataValidade,
          quantidadeInicial: qtdTotalEstoque,
          quantidadeDisponivel: qtdTotalEstoque,
          precoCustoUnitario: item.precoCustoUnitario / fator,
          diasParaVencer: diasParaVenc,
          statusValidade: diasParaVenc <= 30 ? 'ALERTA_PROXIMO' : 'NORMAL',
          fornecedorNome: fornecedor?.nomeFantasia || 'Fornecedor Cadastrado',
          notaFiscal: dados.notaFiscalNumero,
        });
      }

      // 3. Registrar avaria se houver
      if (item.avariasOuQuebras && item.avariasOuQuebras > 0 && prod) {
        registrarPerdaEstoque(
          prod.id,
          item.avariasOuQuebras,
          'UN',
          'QUEBRA_GARRAFA',
          `Quebra ou avaria de transporte no recebimento da NF-e ${dados.notaFiscalNumero || ''}`
        );
      }

      const itemPed = pedido?.itens.find((pi) => pi.produtoId === item.produtoId);

      return {
        produtoId: item.produtoId,
        produtoNome: prod?.name || 'Produto',
        quantidadePedida: itemPed?.quantidadePedida || item.quantidadeRecebida,
        quantidadeRecebida: item.quantidadeRecebida,
        fatorConversao: fator,
        quantidadeTotalEstoque: qtdTotalEstoque,
        precoCustoUnitario: item.precoCustoUnitario,
        loteNumero: item.loteNumero,
        dataValidade: item.dataValidade,
        localArmazenamento: item.localArmazenamento || 'Adega Climatizada Principal',
        avariasOuQuebras: item.avariasOuQuebras || 0,
        observacao: item.observacao,
      };
    });

    // 4. Atualizar pedido vinculado
    if (pedido) {
      const todosRecebidos = pedido.itens.every((pi) => {
        const itemRec = dados.itens.find((di) => di.produtoId === pi.produtoId);
        const qtdJaRecebida = (pi.quantidadeRecebida || 0) + (itemRec?.quantidadeRecebida || 0);
        return qtdJaRecebida >= pi.quantidadePedida;
      });

      const novoStatus: StatusPedidoCompra = todosRecebidos ? 'RECEBIDO_TOTAL' : 'RECEBIDO_PARCIAL';

      setPedidosCompra((prev) =>
        prev.map((p) => {
          if (p.id !== pedido.id) return p;
          return {
            ...p,
            status: novoStatus,
            dataRecebimento: agora.toISOString().split('T')[0],
            notaFiscalNumero: dados.notaFiscalNumero || p.notaFiscalNumero,
            notaFiscalChave: dados.notaFiscalChave || p.notaFiscalChave,
            itens: p.itens.map((pi) => {
              const itemRec = dados.itens.find((di) => di.produtoId === pi.produtoId);
              if (!itemRec) return pi;
              return {
                ...pi,
                quantidadeRecebida: (pi.quantidadeRecebida || 0) + itemRec.quantidadeRecebida,
              };
            }),
            historicoStatus: [
              ...p.historicoStatus,
              {
                status: novoStatus,
                dataHora: dataHoraFormatada,
                usuario: `${currentUser.name} (${currentUser.role})`,
                observacao: `Recebimento físico: NF-e ${dados.notaFiscalNumero || 'S/N'} (${totalItensEstoque} un recebidas)`,
              },
            ],
          };
        })
      );
    }

    // 5. Gerar Conta a Pagar se solicitado
    let novaContaPagarId: string | undefined = undefined;
    if (dados.gerarContaPagar && fornecedor && valorTotal > 0) {
      const dataVenc = dados.dataVencimentoBoleto || new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const novaConta: Omit<ContaPagar, 'id' | 'valorPago' | 'status'> = {
        lojaId: activeStore.id,
        categoria: 'FORNECEDOR_BEBIDAS',
        fornecedorNome: fornecedor.nomeFantasia,
        fornecedorCnpj: fornecedor.cnpj,
        numeroDocumento: `NF-${dados.notaFiscalNumero || Date.now().toString().slice(-6)}`,
        dataVencimento: dataVenc,
        valorNominal: valorTotal,
        jurosMulta: 0,
        desconto: 0,
        origemPagamento: 'CONTA_BANCARIA',
        observacoes: `NF-e ${dados.notaFiscalNumero || 'S/N'} - Reposição de Mercadorias (${fornecedor.nomeFantasia})`,
      };
      adicionarContaPagar(novaConta);
      novaContaPagarId = `cp-${Date.now()}`;
    }

    // 6. Atualizar histórico do fornecedor
    if (fornecedor) {
      setFornecedores((prev) =>
        prev.map((f) => {
          if (f.id !== fornecedor.id) return f;
          return {
            ...f,
            totalPedidosRealizados: f.totalPedidosRealizados + 1,
            valorTotalComprado: f.valorTotalComprado + valorTotal,
            ultimoPedidoData: agora.toLocaleDateString('pt-BR'),
          };
        })
      );
    }

    // 7. Salvar recebimento
    const novoRecebimento: RecebimentoMercadoria = {
      id: `rec-${Date.now()}`,
      codigo: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      pedidoCompraId: pedido?.id,
      pedidoCompraCodigo: pedido?.codigo,
      fornecedorId: dados.fornecedorId,
      fornecedorNome: fornecedor?.nomeFantasia || 'Fornecedor',
      fornecedorCnpj: fornecedor?.cnpj || '',
      dataHoraRecebimento: dataHoraFormatada,
      responsavelRecebimento: `${currentUser.name} (${currentUser.role})`,
      notaFiscalNumero: dados.notaFiscalNumero,
      notaFiscalChave: dados.notaFiscalChave,
      status: 'CONCLUIDO_TOTAL',
      itensConferidos,
      totalItensRecebidosEstoque: totalItensEstoque,
      valorTotalRecebido: valorTotal,
      contaPagarGeradaId: novaContaPagarId,
      observacoesGerais: dados.observacoesGerais,
    };

    setRecebimentosMercadoria((prev) => [novoRecebimento, ...prev]);

    const msgSucesso = `Recebimento ${novoRecebimento.codigo} finalizado: +${totalItensEstoque} itens atualizados diretamente no estoque!`;
    setNotifications((prev) => [msgSucesso, ...prev]);

    return {
      success: true,
      recebimento: novoRecebimento,
      message: msgSucesso,
    };
  };

  const importarTransacoesOfx = (transacoes: ExtratoOfxTransacao[]): { importadas: number } => {
    setOfxTransacoes((prev) => [...transacoes, ...prev]);
    setNotifications((prev) => [
      `Arquivo OFX processado: ${transacoes.length} lançamentos bancários importados para conciliação em tempo real!`,
      ...prev,
    ]);
    return { importadas: transacoes.length };
  };

  const conciliarTransacaoOfx = (id: string, documentoVinculado?: string) => {
    setOfxTransacoes((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              conciliado: true,
              statusAuditoria: 'CONCILIADO',
              documentoVinculado: documentoVinculado || t.documentoVinculado || 'Conciliado manualmente',
            }
          : t
      )
    );
    setNotifications((prev) => ['Lançamento bancário conciliado com sucesso!', ...prev]);
  };

  const atualizarMarkupProduto = (produtoId: string, novoMarkup: number, novoPreco: number) => {
    setTabelaMarkup((prev) =>
      prev.map((item) =>
        item.produtoId === produtoId
          ? {
              ...item,
              markupAtual: novoMarkup,
              precoVendaAtual: novoPreco,
              margemEstimadaPercentual: parseFloat((((novoPreco - item.custoUltimaNfe) / novoPreco) * 100).toFixed(1)),
            }
          : item
      )
    );

    setProducts((prev) =>
      prev.map((p) => (p.id === produtoId ? { ...p, price: novoPreco } : p))
    );
  };

  const replicarPrecosParaRede = (): { produtosAtualizados: number; message: string } => {
    let count = 0;
    tabelaMarkup.forEach((item) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === item.produtoId) {
            count++;
            return { ...p, price: item.precoVendaSugerido };
          }
          return p;
        })
      );
    });

    const msg = `Markup centralizado replicado com sucesso em todas as unidades da rede (${tabelaMarkup.length} produtos sincronizados)!`;
    setNotifications((prev) => [msg, ...prev]);
    return { produtosAtualizados: count, message: msg };
  };

  const atualizarStatusFranquia = (lojaId: string, novoStatus: FranquiaUnidadeConfig['statusPagamento']) => {
    setFranquiaConfigs((prev) =>
      prev.map((f) => (f.lojaId === lojaId ? { ...f, statusPagamento: novoStatus } : f))
    );
    setNotifications((prev) => [`Status de repasse da unidade atualizado para ${novoStatus}.`, ...prev]);
  };

  return (
    <AdegaContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        setUsers,
        stores,
        activeStore,
        setActiveStore,
        products,
        tables,
        comandas,
        orders,
        doseAuditLogs,
        cashSession,
        cashMovements,
        blindCloseRecords,
        accessLogs,
        fiscalDocuments,
        customers,
        // Vendas, Devoluções & Clientes
        devolucoesVendas,
        realizarDevolucaoVenda,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        ajustarSaldoCreditoCliente,
        // Reservas & Notificações
        reservas,
        criarReserva,
        atualizarStatusReserva,
        fazerCheckinReserva,
        cancelarReserva,
        enviarNotificacaoReserva,
        peripheralSettings,
        updateScaleConfig,
        updatePrinterConfig,
        updateScannerConfig,
        isScreenLocked,
        setScreenLocked,
        unlockScreen,
        verifyManagerPin,
        switchUserRole,
        switchStore,
        completeSale,
        debitDoseStock,
        recordDoseLoss,
        restockProduct,
        addProduct,
        updateProduct,
        deleteProduct,
        transferStockBetweenStores,
        // Categorias
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        // Movimentações & Kardex
        movimentacoesEstoque,
        registrarMovimentacaoEstoque,
        // Lotes
        addProdutoLote,
        darBaixaLote,
        updateTable,
        addOrderToTable,
        closeTableAccount,
        createComanda,
        addOrderToComanda,
        closeComanda,
        updateDeliveryStatus,
        openCashSession,
        closeCashSession,
        performCashMovement,
        performSangria,
        performSuprimento,
        performBlindClose,
        // Módulo 3: Estoque Avançado
        recipientesAbertos,
        fichasTecnicas,
        torneirasChopp,
        vasilhames,
        produtoLotes,
        perdasEstoque,
        transferenciasLojas,
        inventarios,
        abrirNovaGarrafa,
        finalizarGarrafaAberta,
        salvarFichaTecnica,
        venderChoppTorneira,
        ajustarFatorPerdaEspuma,
        registrarPerdaEstoque,
        atualizarSaldoVasilhame,
        criarTransferenciaLoja,
        concluirTransferenciaLoja,
        iniciarInventarioCego,
        finalizarInventarioCego,
        calcularCustoMedioPonderado,
        // Módulo 4: Atendimento, Salão, Delivery, KDS, RFID & Fidelidade
        motoboys,
        deliveryPedidos,
        kdsPedidos,
        cartoesConsumo,
        cartoesMovimentacoes,
        rotasEntrega,
        whatsappNotificacoes,
        clientesFidelidade,
        fidelidadeExtrato,
        filaEspera,
        juntarMesas,
        transferirItensMesa,
        transferirComandaCompletaMesa,
        removerCouvertMesa,
        definirConsumacaoMinimaMesa,
        recargaCartaoRfid,
        debitarCartaoRfid,
        encerrarEstornarCartaoRfid,
        vincularRfidComanda,
        atualizarStatusKds,
        adicionarPedidoAoKds,
        criarDeliveryPedido,
        despacharPedidoDelivery,
        concluirEntregaDelivery,
        criarRotaLote,
        cadastrarMotoboy,
        liquidarAcertoMotoboy,
        enviarNotificacaoWhatsapp,
        acumularCashbackCompra,
        resgatarCashback,
        adicionarFilaEspera,
        chamarClienteFila,
        alocarClienteFilaMesa,
        removerClienteFila,
        // Módulo 5: Fiscal e Conformidade Tributária Brasileira
        documentosFiscais,
        perfisFiscais,
        certificadoDigital,
        offlineContingencyMode,
        setOfflineContingencyMode,
        manifestacoesDfe,
        cartasCorrecao,
        inutilizacoesFaixa,
        regrasValidacaoFiscal,
        conciliacoesTef,
        ressarcimentosIcmsSt,
        reformaTributariaItens,
        auditoriaRiscos,
        exportacaoContabil,
        emitirDocumentoFiscal,
        cancelarDocumentoFiscal,
        sincronizarContingencias,
        manifestarDFe,
        importarDFeParaEstoque,
        emitirCartaCorrecao,
        inutilizarFaixaNumeracao,
        resolverAlertaRisco,
        atualizarCertificado,
        agendarEnvioContador,
        // Módulo de Compras e Fornecedores
        fornecedores,
        pedidosCompra,
        recebimentosMercadoria,
        adicionarFornecedor,
        atualizarFornecedor,
        excluirFornecedor,
        adicionarPedidoCompra,
        atualizarPedidoCompra,
        atualizarStatusPedidoCompra,
        cancelarPedidoCompra,
        realizarRecebimentoMercadoria,
        // Módulo 6: Retaguarda Administrativa, Backoffice Financeiro & Multilojas
        contasPagar,
        contasReceber,
        ordensCompra,
        contasBancarias,
        ofxTransacoes,
        metasColaboradores,
        franquiaConfigs,
        tabelaMarkup,
        curvaAbcItens,
        adicionarContaPagar,
        baixarContaPagar,
        cancelarContaPagar,
        conciliarContaReceber,
        reportarDivergenciaReceber,
        adicionarOrdemCompra,
        aprovarOrdemCompra,
        receberOrdemCompraEstoque,
        importarTransacoesOfx,
        conciliarTransacaoOfx,
        atualizarMarkupProduto,
        replicarPrecosParaRede,
        atualizarStatusFranquia,
        // Persistência e Backup
        resetarDadosParaPadrao,
        notifications,
        dismissNotification,
        // Módulo Financeiro e Gestão
        appSettings,
        updateAppSettings,
        auditRecords,
        recordAudit,
      }}
    >
      {children}
    </AdegaContext.Provider>
  );
};

export const useAdega = () => {
  const context = useContext(AdegaContext);
  if (!context) {
    throw new Error('useAdega must be used within an AdegaProvider');
  }
  return context;
};
