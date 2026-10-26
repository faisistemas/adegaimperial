export type UserRole = 
  | 'SUPER_ADMIN'     // Proprietário / Super Admin (Acesso Total)
  | 'STORE_MANAGER'   // Gerente de Loja (Retaguarda + PDV, Sangrias, Auditoria Doses)
  | 'CASHIER'         // Operador de Caixa (PDV Touch, NFC-e, Abertura/Fechamento)
  | 'WAITER'          // Atendente / Garçom (Lançamento Mesas/Comandas, Mobile)
  | 'DELIVERY_COURIER'; // Motoboy / Entregador (Despacho e Entrega)

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  pin: string; // PIN para login rápido no terminal PDV
  storeId: string;
  phone?: string;
  whatsapp?: string;
  cpfCnpj?: string;
}

export interface Store {
  id: string;
  name: string;
  cnpj: string;
  ie: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  isHeadquarter: boolean;
}

export type ProductCategory = 
  | 'destilados'
  | 'doses'
  | 'cervejas'
  | 'vinhos'
  | 'combos'
  | 'gelo_petiscos'
  | (string & {});

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  defaultMarkupPercent?: number;
  iconName?: string;
}

export type ProductType = 'SIMPLES' | 'DOSE' | 'COMBO' | 'VASILHAME';
export type UnitOfMeasure = 'UN' | 'ML' | 'L' | 'KG' | 'LT' | 'GF' | 'FD' | 'CX' | 'PK';

export interface Product {
  id: string;
  name: string;
  barcode: string;
  packagingBarcode?: string; // DUN-14 / Código de barras da caixa ou fardo
  category: ProductCategory;
  subcategory?: string; // Subcategoria (ex: Whisky, Gin, Vodka, IPA, Pilsen, Vinho Tinto, etc.)
  price: number; // Preço de venda varejo / un
  costPrice: number; // Preço de custo unitário
  wholesalePrice?: number; // Preço de venda atacado / embalagem fechada
  targetMarkupPercent?: number; // Markup planejado (%)
  marginPercent?: number; // Margem bruta (%)
  image: string;
  tipoProduto?: ProductType; // 'SIMPLES', 'DOSE', 'COMBO', 'VASILHAME'
  unidadeMedida?: UnitOfMeasure; // 'UN', 'ML', 'L', 'KG', etc.
  tipoEmbalagem?: string; // 'UN', 'GARRAFA', 'LATA', 'FARDO', 'CAIXA', 'PACK', 'BAR خانه'
  fatorConversaoEmbalagem?: number; // Ex: 12 latas por fardo, 24 garrafas por caixa
  isFractionable: boolean; // Se é uma garrafa fracionável em doses
  bottleVolumeMl?: number; // Ex: 1000ml (1 Litro) ou 750ml
  doseVolumeMl?: number;   // Ex: 50ml
  pricePerDose?: number;   // Preço de venda da dose avulsa (ex: R$ 25,00)
  stockUnits: number;      // Garrafas/unidades fechadas em estoque
  openBottleVolumeMl?: number; // Volume restante na garrafa atualmente em uso no balcão (0 a bottleVolumeMl)
  minStockAlert: number;   // Estoque mínimo de segurança
  maxStock?: number;       // Estoque máximo sugerido
  isWeighed?: boolean;     // Se é vendido por peso (balança, ex: kg de gelo/petiscos)
  pricePerKg?: number;
  exigeVasilhame?: boolean; // Se é cerveja/bebida retornável
  precoCaucaoVasilhame?: number; // Valor do caução cobrado se o cliente não trouxer o casco (ex: R$ 4,00)
  fornecedorPadrao?: string;
  ncm: string;             // Código fiscal NCM
  cest?: string;           // Código Especificador da Substituição Tributária (bebidas)
  cfop: string;            // Código Fiscal de Operações e Prestações
  cstIcms: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  isDose: boolean;
  weightKg?: number; // Se vendido por peso
  unitPrice: number;
  discount: number;
  totalPrice: number;
  notes?: string;
}

export type SinglePaymentMethod = 'PIX' | 'TEF_CREDITO' | 'TEF_DEBITO' | 'DINHEIRO' | 'VOUCHER' | 'COMANDA';
export type PaymentMethod = SinglePaymentMethod | 'MULTIPLO';

export interface PaymentDetails {
  method: PaymentMethod;
  amount: number;
  receivedAmount?: number;
  change?: number;
  pixTxId?: string;
  tefAuthorizationCode?: string;
  tefCardBrand?: string;
  installments?: number;
  voucherType?: string; // 'ALELO' | 'SODEXO' | 'TICKET' | 'VR' | 'VALE_PRESENTE' | 'OUTROS'
  voucherCode?: string;
  splitPayments?: MultiPaymentSplit[];
}

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DEVOLVIDO_PARCIAL' | 'DEVOLVIDO_TOTAL';

export interface Order {
  id: string;
  code: string;
  storeId: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  serviceFee: number;
  deliveryFee: number;
  total: number;
  payment?: PaymentDetails;
  status: OrderStatus;
  orderType: 'PDV_BALCAO' | 'MESA' | 'COMANDA' | 'DELIVERY';
  tableNumber?: number;
  comandaNumber?: number;
  customerName?: string;
  customerCpf?: string;
  customerId?: string;
  deliveryInfo?: {
    recipientName: string;
    address: string;
    neighborhood: string;
    phone: string;
    courierId?: string;
    courierName?: string;
    estimatedMinutes: number;
  };
  nfceKey?: string;
  nfceProtocol?: string;
  operatorName: string;
  devolucoes?: DevolucaoVenda[];
}

export type TableSector = 'SALAO_PRINCIPAL' | 'DECK_EXTERNO' | 'BALCAO_VIP' | 'MEZANINO' | 'LOUNGE_VIP' | 'ADEGA_SUBTERRANEA' | 'BALCAO_DEGUSTACAO';

export interface Table {
  id: number;
  number: number;
  name: string;
  status: 'FREE' | 'OCCUPIED' | 'BILL_REQUESTED' | 'RESERVED';
  currentOrderId?: string;
  customerName?: string;
  guestsCount: number;
  openedAt?: string;
  totalAmount: number;
  waiterName?: string;
  capacity?: number;
  couvertPorPessoa?: number;
  couvertIsento?: boolean;
  consumacaoMinima?: number;
  items?: CartItem[];
  joinedWithTableNumber?: number;
  sector?: TableSector;
  posX?: number;
  posY?: number;
}

export interface Comanda {
  id: string;
  number: number;
  customerName: string;
  customerCpf?: string;
  status: 'OPEN' | 'CLOSED';
  currentOrderId?: string;
  totalAmount: number;
  openedAt: string;
  rfidCode?: string;
  tableNumber?: number;
  limiteCredito?: number;
  consumacaoMinima?: number;
  items?: CartItem[];
  isPrePaid?: boolean;
  prePaidBalance?: number;
}

export interface DoseAuditLog {
  id: string;
  productId: string;
  productName: string;
  volumeDoseMl: number;
  remainingBottleMl: number;
  bottleTotalMl: number;
  timestamp: string;
  operatorName: string;
  orderId?: string;
  type: 'SALE' | 'WASTE' | 'TASTING' | 'BOTTLE_OPENED';
  notes?: string;
}

export interface CashRegisterSession {
  id: string;
  storeId: string;
  operatorId: string;
  operatorName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number; // Fundo de troco
  currentCash: number;
  totalSalesPix: number;
  totalSalesCard: number;
  totalSalesCash: number;
  bleedAmount: number; // Sangrias
  supplyAmount: number; // Suprimentos
  isOpen: boolean;
}

export interface FiscalDocument {
  id: string;
  orderId: string;
  number: number;
  series: number;
  type: 'NFCe' | 'NFe' | 'NFSe';
  accessKey: string;
  authorizationProtocol?: string;
  issuedAt: string;
  status: 'AUTORIZADA' | 'CANCELADA' | 'CONTINGENCIA';
  recipientCpfCnpj?: string;
  totalValue: number;
  xmlMock: string;
}

export type CustomerStatus = 'ATIVO' | 'BLOQUEADO' | 'INADIMPLENTE';

export interface CustomerEndereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface Customer {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  totalSpent: number;
  ordersCount: number;
  loyaltyPoints: number;
  favoriteDrink?: string;
  lastPurchaseDate: string;
  // Campos avançados de Gestão e Cadastro
  tipoPessoa?: 'PF' | 'PJ';
  cnpj?: string;
  rgIe?: string;
  dataNascimento?: string;
  birthDate?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  endereco?: CustomerEndereco;
  limiteCredito?: number;
  saldoCreditoAtual?: number;
  saldoCashback?: number;
  nivelFidelidade?: 'BRONZE' | 'PRATA' | 'OURO' | 'BLACK';
  status?: CustomerStatus;
  motivoBloqueio?: string;
  preferenciaBebida?: string;
  tags?: string[];
  observacoes?: string;
  dataCadastro?: string;
}

// ----------------------------------------------------
// MÓDULO DE VENDAS & DEVOLUÇÕES
// ----------------------------------------------------
export type MotivoDevolucao = 
  | 'PRODUTO_AVARIADO_OXIDADO' 
  | 'DESISTENCIA_ARREPENDIMENTO' 
  | 'ITEM_ERRADO' 
  | 'ERRO_OPERADOR_DUPLICADO' 
  | 'VALIDADE_PROXIMA_VENCIDA';

export type DestinoItemDevolvido = 'RETORNO_ESTOQUE' | 'PERDA_DESCARTE';
export type FormaReembolsoDevolucao = 'DINHEIRO' | 'ESTORNO_PIX_CARTAO' | 'VALE_CREDITO_CLIENTE';

export interface DevolucaoItem {
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  destino: DestinoItemDevolvido;
  motivo: MotivoDevolucao;
  detalhes?: string;
}

export interface DevolucaoVenda {
  id: string;
  orderId: string;
  orderCode: string;
  dataHora: string;
  operadorNome: string;
  motivoGeral: string;
  itens: DevolucaoItem[];
  valorTotalDevolvido: number;
  formaReembolso: FormaReembolsoDevolucao;
  clienteId?: string;
  clienteNome?: string;
  observacoes?: string;
}

// ----------------------------------------------------
// MÓDULO DE RESERVAS & NOTIFICAÇÕES RELACIONADAS
// ----------------------------------------------------
export type StatusReserva = 
  | 'PENDENTE' 
  | 'CONFIRMADA' 
  | 'CLIENTE_PRESENTE' 
  | 'CONCLUIDA' 
  | 'CANCELADA' 
  | 'NO_SHOW';

export type TipoReserva = 
  | 'MESA_COMUM' 
  | 'DEGUSTACAO_VINHOS' 
  | 'ANIVERSARIO_EVENTO' 
  | 'AREA_VIP_LOUNGE' 
  | 'CLUBE_WHISKY_LOCKER';

export interface NotificacaoReserva {
  id: string;
  reservaId: string;
  tipo: 'CONFIRMACAO' | 'LEMBRETE_2H' | 'ALTERACAO' | 'CANCELAMENTO';
  canal: 'WHATSAPP' | 'SMS' | 'EMAIL';
  destinatarioNome: string;
  destinatarioTelefone: string;
  mensagem: string;
  dataHora: string;
  status: 'ENVIADA' | 'FALHA' | 'SIMULADA';
}

export interface ReservaMesaAmbiente {
  id: string;
  codigo: string;
  clienteId?: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail?: string;
  dataReserva: string; // YYYY-MM-DD
  horario: string; // HH:mm
  quantidadePessoas: number;
  mesaId?: number;
  mesaNumero?: number | string;
  setor?: TableSector;
  ambiente?: string;
  tipoReserva: TipoReserva | string;
  status: StatusReserva;
  valorCaucaoConsumacao?: number;
  caucaoValor?: number;
  caucaoPago?: boolean;
  garrafaReservada?: string;
  garrafaPreReservada?: string;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm?: string;
  notificacoes: NotificacaoReserva[];
}

// ----------------------------------------------------
// MÓDULO DE COMPRAS E FORNECEDORES
// ----------------------------------------------------
export type StatusFornecedor = 'ATIVO' | 'INATIVO' | 'BLOQUEADO' | 'EM_ANALISE';
export type FornecedorStatus = StatusFornecedor;

export type CategoriaFornecedor = 
  | 'TODAS'
  | 'DISTRIBUIDOR_BEBIDAS'
  | 'IMPORTADORA_VINHOS'
  | 'CERVEJARIA_ARTESANAL'
  | 'DESTILARIA'
  | 'EMBALAGENS_DESCARTAVEIS'
  | 'ALIMENTOS_TABUAS'
  | 'GERAL';

export type CondicaoPagamentoFornecedor = 
  | 'A_VISTA' 
  | 'BOLETO_14D' 
  | 'BOLETO_28D' 
  | 'BOLETO_28_56D' 
  | 'BOLETO_30_60_90D'
  | 'PIX_FATURADO' 
  | 'CARTAO_CORPORATIVO';

export interface FornecedorEndereco {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

export interface FornecedorItemTabela {
  produtoId: string;
  codigoFornecedor?: string;
  precoCustoUnitario: number;
  unidadeFornecedor: string; // UN, CX, FD, L
  fatorConversao: number; // ex: 1 CX = 24 UN
}

export interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  contatoNome?: string;
  contatoRepresentante?: string;
  telefoneRepresentante?: string;
  categoria?: CategoriaFornecedor;
  categoriasFornecidas: string[];
  endereco: FornecedorEndereco;
  cidade?: string;
  estado?: string;
  condicaoPagamentoPadrao: CondicaoPagamentoFornecedor | string;
  prazoPagamentoPadrao?: string;
  chavePix?: string;
  bancoNome?: string;
  agencia?: string;
  contaCorrente?: string;
  leadTimeDias: number;
  pedidoMinimoValor: number;
  avaliacaoRating: number; // 1 a 5
  status: FornecedorStatus;
  tabelaItens?: FornecedorItemTabela[];
  observacoes?: string;
  totalPedidosRealizados: number;
  valorTotalComprado: number;
  ultimoPedidoData?: string;
}

export type StatusPedidoCompra = 
  | 'RASCUNHO' 
  | 'COTACAO' 
  | 'EM_APROVACAO'
  | 'APROVADO'
  | 'APROVADO_ENVIADO' 
  | 'ENVIADO_FORNECEDOR'
  | 'EM_TRANSITO' 
  | 'RECEBIDO_PARCIAL' 
  | 'RECEBIDO_TOTAL' 
  | 'CANCELADO';

export interface ItemPedidoCompra {
  id: string;
  produtoId: string;
  produtoNome: string;
  codigoBarras?: string;
  unidadeMedida: string; // UN, CX, FD, L, KG
  fatorConversao: number; // Quantidade de unidades no estoque por pacote
  quantidadePedida: number; // Quantidade de pacotes/unidades pedidas
  quantidadeRecebida: number; // Quantidade física já recebida
  precoUnitario: number; // Preço unitário da embalagem
  subtotal: number;
  motivoIa?: string;
}

export interface PedidoCompraHistorico {
  status: StatusPedidoCompra;
  dataHora: string;
  usuario: string;
  observacao?: string;
}

export interface PedidoCompra {
  id: string;
  codigo: string;
  lojaId: string;
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorCnpj: string;
  fornecedorContato?: string;
  fornecedorTelefone?: string;
  status: StatusPedidoCompra;
  dataEmissao: string;
  dataPrevisaoEntrega: string;
  dataRecebimento?: string;
  condicaoPagamento: CondicaoPagamentoFornecedor | string;
  formaPagamento: 'BOLETO' | 'PIX' | 'TRANSFERENCIA' | 'CARTAO_CREDITO';
  itens: ItemPedidoCompra[];
  valorSubtotal: number;
  valorFrete: number;
  valorDesconto: number;
  valorTotal: number;
  observacoes?: string;
  geradoPorIa?: boolean;
  motivoIa?: string;
  notaFiscalChave?: string;
  notaFiscalNumero?: string;
  historicoStatus: PedidoCompraHistorico[];
}

export type StatusRecebimento = 'CONCLUIDO_TOTAL' | 'CONCLUIDO_PARCIAL' | 'DIVERGENCIA_APONTADA';

export interface ItemConferenciaRecebimento {
  produtoId: string;
  produtoNome: string;
  quantidadePedida: number;
  quantidadeRecebida: number;
  fatorConversao: number;
  quantidadeTotalEstoque: number; // quantidadeRecebida * fatorConversao
  precoCustoUnitario: number;
  loteNumero?: string;
  dataValidade?: string;
  localArmazenamento?: string; // Adega Climatizada, Depósito, Salão, Câmara Fria
  avariasOuQuebras?: number;
  observacao?: string;
}

export interface RecebimentoMercadoria {
  id: string;
  codigo: string; // REC-2026-001
  pedidoCompraId?: string;
  pedidoCompraCodigo?: string;
  fornecedorId: string;
  fornecedorNome: string;
  fornecedorCnpj: string;
  dataHoraRecebimento: string;
  responsavelRecebimento: string;
  notaFiscalNumero?: string;
  notaFiscalChave?: string;
  status: StatusRecebimento;
  itensConferidos: ItemConferenciaRecebimento[];
  totalItensRecebidosEstoque: number;
  valorTotalRecebido: number;
  contaPagarGeradaId?: string;
  observacoesGerais?: string;
}

// ----------------------------------------------------
// MÓDULO 2: Periféricos & Comunicação de Hardware
// ----------------------------------------------------
export type ScaleProtocol = 'TOLEDO_PRIX3' | 'TOLEDO_9094' | 'FILIZOLA' | 'URANO_POP' | 'CUSTOM';
export type ScaleConnectionType = 'WEB_SERIAL' | 'SERIAL_COM' | 'VIRTUAL_EMULATOR';

export interface ScaleConfig {
  protocol: ScaleProtocol;
  connectionType: ScaleConnectionType;
  port: string; // Ex: 'COM1', 'COM2', 'COM3', '/dev/ttyUSB0'
  baudRate: number; // 2400, 4800, 9600, 19200
  dataBits: number; // 7, 8
  parity: 'none' | 'even' | 'odd';
  stopBits: number; // 1, 2
  readingMode: 'CONTINUOUS' | 'ON_DEMAND';
  autoPriceWeighedProducts: boolean;
  timeoutMs: number;
  lastWeightSample: number;
  isConnected: boolean;
  rawFrameFormat: string; // 'STX + Peso (5/6 bytes) + ETX'
}

export type ThermalConnectionType = 'USB_DIRECT' | 'NETWORK_TCP' | 'WEB_SERIAL' | 'BROWSER_PRINT';

export interface ThermalPrinterConfig {
  model: 'ESC_POS_80MM' | 'ESC_POS_58MM';
  connectionType: ThermalConnectionType;
  ipAddress?: string;
  tcpPort?: number;
  serialPort?: string;
  baudRate?: number;
  autoCut: boolean;
  openDrawer: boolean;
  copies: number;
  paperWidthMm: 80 | 58;
  printDensity: 'NORMAL' | 'HIGH' | 'DARK';
  isConnected: boolean;
}

export type PrintSector = 'PDV' | 'COZINHA' | 'BAR' | 'GERAL';
export type PrinterAvailabilityStatus = 'ONLINE' | 'OFFLINE' | 'CHECKING' | 'WARNING';

export interface SectorPrinterConfig extends ThermalPrinterConfig {
  sector: PrintSector;
  name: string;
  enabled: boolean;
  autoPrint: boolean;
  headerTitle?: string;
  availabilityStatus?: PrinterAvailabilityStatus;
  statusMessage?: string;
  latencyMs?: number;
  lastCheckedAt?: string;
}

export interface PrinterRoutingConfig {
  pdvPrinter: SectorPrinterConfig;
  kitchenPrinter: SectorPrinterConfig;
  barPrinter: SectorPrinterConfig;
  autoOpenDrawerOnCash: boolean;
  beepOnPrint: boolean;
}

export interface ThermalPrintJob {
  id: string;
  timestamp: string;
  title: string;
  sector: PrintSector;
  contentRaw: string;
  contentHtml?: string;
  paperWidthMm: 80 | 58;
  orderCode?: string;
  tableOrComanda?: string;
  status: 'IMPRESSO' | 'PENDENTE' | 'ERRO';
  printerName: string;
  reprintCount: number;
}

export interface BarcodeScannerConfig {
  mode: 'KEYBOARD_HID' | 'WEBCAM_CAMERA';
  prefix: string;
  suffix: 'ENTER' | 'TAB' | 'NONE';
  minCharLength: number;
  playBeepOnScan: boolean;
  active: boolean;
}

export interface PeripheralSettings {
  scale: ScaleConfig;
  printer: ThermalPrinterConfig;
  scanner: BarcodeScannerConfig;
}

// ----------------------------------------------------
// MÓDULO 2: Sessões de Caixa, Turnos & Auditoria (PostgreSQL Schema)
// ----------------------------------------------------
export type CashMovementType = 'SANGRIA' | 'SUPRIMENTO';

export interface CashMovement {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  managerAuthorizedId?: string;
  managerAuthorizedName?: string;
  tipo: CashMovementType;
  valor: number;
  motivo: string;
  dataHora: string;
}

export interface CashBlindCloseRecord {
  sessionId: string;
  dataFechamento: string;
  operadorId: string;
  operadorNome: string;
  // Valores declarados pelo operador (contagem física cega)
  declaradoDinheiro: number;
  declaradoCartaoCredito: number;
  declaradoCartaoDebito: number;
  declaradoPix: number;
  totalDeclarado: number;
  // Valores apurados pelo sistema
  sistemaDinheiro: number;
  sistemaCartaoCredito: number;
  sistemaCartaoDebito: number;
  sistemaPix: number;
  totalSistema: number;
  // Confronto de Quebra / Sobra
  diferencaDinheiro: number;
  diferencaTotal: number;
  statusConfronto: 'EXATO' | 'SOBRA' | 'QUEBRA';
  observacoes?: string;
}

export interface AccessLog {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  lojaId: string;
  ipOrigem: string;
  acao: 'LOGIN_SUCESSO' | 'LOGIN_FALHA' | 'ABERTURA_CAIXA' | 'FECHAMENTO_CAIXA' | 'SANGRIA' | 'SUPRIMENTO' | 'CANCELAMENTO_ITEM' | 'BLOQUEIO_TELA' | 'DESBLOQUEIO_TELA' | 'ISENCAO_COUVERT' | 'ACERTO_MOTOBOY' | 'DESPACHO_DELIVERY';
  dataHora: string;
  detalhes?: string;
}

export interface MultiPaymentSplit {
  id: string;
  method: PaymentMethod;
  amount: number;
  receivedAmount?: number;
  change?: number;
  transacaoId?: string;
  brand?: string;
}

// ----------------------------------------------------
// MÓDULO 3 & MÓDULO 3 EXPANDIDO: Gestão de Estoque Avançada
// Fracionamento, Ficha Técnica de Combos, Vasilhames,
// Perdas, PEPS/Lotes, Chopeiras e Inventário Cego
// ----------------------------------------------------

export interface RecipienteAberto {
  id: string;
  lojaId: string;
  produtoPaiId: string;
  produtoPaiNome: string;
  volumeOriginalMl: number;
  volumeRestanteMl: number;
  dataAbertura: string;
  status: 'EM_USO' | 'FINALIZADO' | 'PERDA';
  garrafaNumero: number;
}

export interface FichaTecnicaItem {
  id: string;
  produtoCompostoId: string;
  insumoProdutoId: string;
  insumoNome: string;
  quantidadeConsumida: number; // Ex: 100 para 100ml de whisky, ou 1 para 1 lata de energético
  unidadeDesconto: 'ML' | 'UN';
  custoUnitarioEstimado: number;
}

export interface FichaTecnicaCombo {
  produtoCompostoId: string;
  produtoCompostoNome: string;
  categoria: string;
  precoVenda: number;
  custoTotalInsumos: number;
  margemBrutaPercent: number;
  lucroEstimado: number;
  copoDescartavelIncluso: boolean;
  geloIncluso: boolean;
  itens: FichaTecnicaItem[];
}

export type PerdaEstoqueTipo = 
  | 'QUEBRA' 
  | 'QUEBRA_GARRAFA' 
  | 'DEGUSTACAO_CORTESIA' 
  | 'VENCIMENTO' 
  | 'EVAPORACAO' 
  | 'EVAPORACAO_CHOPP' 
  | 'FURTO_DESVIO'
  | 'AVARIA_CLIENTE'
  | 'DEVOLUCAO_DESCARTE';

export interface PerdaEstoqueRecord {
  id: string;
  lojaId: string;
  produtoId: string;
  produtoNome: string;
  usuarioId: string;
  usuarioNome: string;
  quantidade: number;
  unidade: string;
  tipoOcorrencia: PerdaEstoqueTipo;
  justificativa: string;
  dataRegistro: string;
  valorPrejuizoEstimado: number;
}

export interface ProdutoLote {
  id: string;
  lojaId: string;
  produtoId: string;
  produtoNome: string;
  numeroLote: string;
  dataFabricacao: string;
  dataValidade: string;
  quantidadeInicial: number;
  quantidadeDisponivel: number;
  precoCustoUnitario: number;
  diasParaVencer: number;
  diasAteVencer?: number; // Alias de compatibilidade
  statusValidade: 'NORMAL' | 'ALERTA_PROXIMO' | 'VENCIDO';
  status?: string; // Alias de compatibilidade
  custoUnitarioLote?: number; // Alias de compatibilidade
  fornecedorNome?: string;
  notaFiscal?: string;
}

export type TipoMovimentacaoEstoque = 
  | 'ENTRADA'
  | 'SAIDA'
  | 'AJUSTE'
  | 'ENTRADA_COMPRA' 
  | 'SAIDA_VENDA' 
  | 'AJUSTE_POSITIVO' 
  | 'AJUSTE_NEGATIVO' 
  | 'PERDA_AVARIA' 
  | 'TRANSFERENCIA_ENVIO' 
  | 'TRANSFERENCIA_RECEBIMENTO'
  | 'ABERTURA_GARRAFA';

export interface MovimentacaoEstoque {
  id: string;
  lojaId: string;
  produtoId: string;
  produtoNome: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number; // quantidade movimentada (+ ou -)
  saldoAnterior: number;
  saldoPosterior: number;
  dataHora: string;
  usuarioNome: string;
  documentoRef?: string; // Ex: "NF-e 1092", "Venda PDV #1024", "Inventário #INV-01"
  motivo?: string;
  custoUnitario?: number;
}

export interface TorneiraChopp {
  id: string;
  lojaId: string;
  identificadorTorneira: string; // Ex: 'Torneira 01 - IPA Artesanal 50L'
  barrilProdutoId: string;
  barrilNome: string;
  estiloChopp: string;
  volumeTotalBarrilLitros: number;
  volumeRestanteLitros: number;
  fatorPerdaEspumaPercentual: number; // Ex: 5% a 8%
  status: 'ENGATADO' | 'VAZIO' | 'LIMPEZA';
  litrosVendidos: number;
  perdaEspumaAcumuladaLitros: number;
  precoPorLitro: number;
}

export interface TransferenciaItem {
  produtoId: string;
  produtoNome: string;
  quantidadeEnviada: number;
  quantidadeRecebida?: number;
}

export interface TransferenciaLojas {
  id: string;
  lojaOrigemId: string;
  lojaOrigemNome: string;
  lojaDestinoId: string;
  lojaDestinoNome: string;
  usuarioEnvioId: string;
  usuarioEnvioNome: string;
  usuarioRecebimentoId?: string;
  usuarioRecebimentoNome?: string;
  status: 'SOLICITADO' | 'EM_TRANSITO' | 'CONCLUIDO' | 'DIVERGENCIA';
  dataEnvio: string;
  dataRecebimento?: string;
  itens: TransferenciaItem[];
  observacoes?: string;
}

export interface InventarioItem {
  produtoId: string;
  produtoNome: string;
  quantidadeSistema: number;
  quantidadeContada: number;
  divergencia: number; // quantidadeContada - quantidadeSistema
  custoUnitario: number;
}

export interface InventarioCego {
  id: string;
  lojaId: string;
  usuarioResponsavelId: string;
  usuarioResponsavelNome: string;
  dataInicio: string;
  dataFechamento?: string;
  status: 'EM_ANDAMENTO' | 'FINALIZADO' | 'CANCELADO';
  itens: InventarioItem[];
  totalDivergenciaItens: number;
  impactoFinanceiroEstimado: number;
}

export interface VasilhameSaldo {
  produtoId: string;
  produtoNome: string;
  cascosVaziosEmEstoque: number;
  garrafasCheiasComCasco: number;
  precoCaucaoUnitario: number;
  saldoCredorDistribuidor: number;
}

// ==========================================
// MÓDULO 4: ATENDIMENTO, DELIVERY, KDS & FIDELIDADE
// ==========================================

export type TipoRemuneracaoMotoboy = 'DIARIA' | 'POR_ENTREGA' | 'PERCENTUAL';

export interface Motoboy {
  id: string;
  lojaId: string;
  nome: string;
  telefone: string;
  placaMoto: string;
  chavePix: string;
  tipoRemuneracao: TipoRemuneracaoMotoboy;
  valorPadrao: number; // Ex: R$ 8,00 por entrega ou R$ 80,00 diária
  ativo: boolean;
  entregasRealizadasHoje: number;
  totalTaxasAcumuladasHoje: number;
  totalDinheiroRecebidoHoje: number;
  totalCartaoRecebidoHoje: number;
  statusAcerto: 'ABERTO' | 'LIQUIDADO';
}

export type StatusDeliveryPedido = 'PENDENTE' | 'PREPARANDO' | 'DESPACHADO' | 'ENTREGUE' | 'CANCELADO';

export interface DeliveryPedido {
  id: string;
  orderId: string;
  orderCode: string;
  motoboyId?: string;
  motoboyNome?: string;
  clienteNome: string;
  telefone: string;
  endereco: string;
  bairro: string;
  cidade?: string;
  complemento?: string;
  taxaEntrega: number;
  formaPagamento: PaymentMethod;
  trocoPara?: number;
  status: StatusDeliveryPedido;
  itens: CartItem[];
  subtotal: number;
  total: number;
  horaPedido: string;
  horaDespacho?: string;
  horaEntrega?: string;
  tempoEstimadoMinutos: number;
  rotaId?: string;
  observacoes?: string;
}

export interface CartaoConsumo {
  id: string;
  lojaId: string;
  codigoRfid: string; // UID da pulseira/cartão físico
  numeroCartao: number;
  clienteNome: string;
  clienteCpf?: string;
  clienteTelefone?: string;
  saldoAtual: number;
  limiteCredito: number;
  status: 'ATIVO' | 'BLOQUEADO' | 'ENCERRADO';
  criadoEm: string;
  atualizadoEm: string;
  comandaVinculadaId?: string;
}

export interface CartaoMovimentacao {
  id: string;
  cartaoId: string;
  codigoRfid: string;
  tipo: 'RECARGA' | 'DEBITO' | 'ESTORNO';
  valor: number;
  saldoAnterior: number;
  saldoPosterior: number;
  metodoPagamento?: PaymentMethod;
  dataRegistro: string;
  operadorNome: string;
  descricao: string;
}

export type KdsStatus = 'RECEBIDO' | 'PREPARANDO' | 'PRONTO' | 'FINALIZADO';

export interface KdsPedidoItem {
  id: string;
  nome: string;
  quantidade: number;
  isDose: boolean;
  detalhes?: string;
}

export interface KdsPedido {
  id: string;
  orderCode: string;
  canal: 'MESA' | 'COMANDA' | 'DELIVERY' | 'QR_CODE' | 'BALCAO';
  mesaNumero?: number;
  comandaNumero?: number;
  clienteNome?: string;
  garcomNome?: string;
  itens: KdsPedidoItem[];
  horaEntrada: string;
  timestampEntrada: number; // para cálculo dinâmico de minutos decorridos
  status: KdsStatus;
  tempoDecorridoMinutos: number;
  setor: 'BAR' | 'COZINHA';
  prioridade?: boolean;
}

export interface RotaEntrega {
  id: string;
  lojaId: string;
  motoboyId: string;
  motoboyNome: string;
  bairroRegiao: string;
  dataSaida: string;
  status: 'EM_ROTA' | 'CONCLUIDO';
  pedidos: DeliveryPedido[];
  totalPedidos: number;
  valorTotalTaxas: number;
  valorTotalReceberDinheiro: number;
}

export interface WhatsappNotificacao {
  id: string;
  telefone: string;
  destinatarioNome: string;
  tipoMensagem: 'PEDIDO_RECEBIDO' | 'ROTA_DESPACHADA' | 'PEDIDO_ENTREGUE' | 'FILA_CHAMADA';
  texto: string;
  statusEnvio: 'ENVIADO' | 'PENDENTE' | 'FALHA';
  dataDisparo: string;
  pedidoCodigo?: string;
}

export type NivelFidelidade = 'BRONZE' | 'PRATA' | 'OURO' | 'BLACK';

export interface ClienteFidelidade {
  id: string;
  clienteId: string;
  nome: string;
  cpf: string;
  telefone: string;
  nivel: NivelFidelidade;
  saldoCashback: number;
  pontos: number;
  totalGastoHistorico: number;
  percentualCashbackAtual: number; // ex: Bronze = 2%, Prata = 3%, Ouro = 5%, Black = 8%
  dataCadastro: string;
}

export interface FidelidadeMovimento {
  id: string;
  clienteId: string;
  tipo: 'CREDITO_COMPRA' | 'RESGATE_USO' | 'BONUS_NIVEL';
  valorCashback: number;
  pontos: number;
  dataMovimento: string;
  pedidoCodigo: string;
  saldoFinalCashback: number;
}

export interface FilaEsperaItem {
  id: string;
  lojaId: string;
  clienteNome: string;
  telefone: string;
  quantidadePessoas: number;
  status: 'AGUARDANDO' | 'NOTIFICADO' | 'ALOCADO' | 'DESISTIU';
  horaChegada: string;
  tempoAguardandoMinutos: number;
  observacao?: string;
  mesaSugeridaNumero?: number;
}

// ----------------------------------------------------
// MÓDULO 5: Fiscal e Conformidade Tributária Brasileira
// ----------------------------------------------------
export * from './fiscalTypes';



