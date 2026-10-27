import { 
  Customer, 
  Product, 
  Store, 
  Table, 
  User, 
  DevolucaoVenda, 
  ReservaMesaAmbiente,
  Fornecedor,
  PedidoCompra,
  RecebimentoMercadoria
} from '../types';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'AdeGaswg',
    cnpj: '12.345.678/0001-90',
    ie: '109.876.543.210',
    address: 'Alameda Lorena, 1420 - Jardins',
    city: 'São Paulo',
    state: 'SP',
    phone: '(11) 3088-9900',
    isHeadquarter: true,
  },
];

export const INITIAL_USERS: User[] = [
  {
    id: 'u-1',
    name: 'Administrador',
    email: 'admin@adegaswg.com.br',
    role: 'SUPER_ADMIN',
    avatar: '/logo.jpg',
    pin: '#Adegaswg2027*',
    storeId: 'store-1',
  },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_TABLES: Table[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  number: i + 1,
  name: `Mesa ${String(i + 1).padStart(2, '0')} - ${i < 4 ? 'Salão' : i < 8 ? 'Deck Externo' : 'VIP Mezanino'}`,
  status: 'FREE',
  guestsCount: 0,
  capacity: i < 4 ? 4 : i < 8 ? 6 : 8,
  totalAmount: 0,
  sector: i < 4 ? 'SALAO_PRINCIPAL' : i < 8 ? 'DECK_EXTERNO' : 'MEZANINO',
  posX: 120 + (i % 4) * 160,
  posY: 100 + Math.floor(i / 4) * 140,
  items: []
}));

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_DEVOLUCOES: DevolucaoVenda[] = [];

export const INITIAL_RESERVAS: ReservaMesaAmbiente[] = [];

export const INITIAL_FORNECEDORES: Fornecedor[] = [];

export const INITIAL_PEDIDOS_COMPRA: PedidoCompra[] = [];

export const INITIAL_RECEBIMENTOS_MERCADORIA: RecebimentoMercadoria[] = [];
