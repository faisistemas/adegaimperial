import { 
  RecipienteAberto, 
  FichaTecnicaCombo, 
  PerdaEstoqueRecord, 
  ProdutoLote, 
  TorneiraChopp, 
  TransferenciaLojas, 
  InventarioCego, 
  VasilhameSaldo, 
  CategoryItem, 
  MovimentacaoEstoque 
} from '../types';

export const INITIAL_RECIPIENTES_ABERTOS: RecipienteAberto[] = [];

export const INITIAL_FICHAS_TECNICAS: FichaTecnicaCombo[] = [];

export const INITIAL_TORNEIRAS_CHOPP: TorneiraChopp[] = [];

export const INITIAL_VASILHAMES: VasilhameSaldo[] = [];

export const INITIAL_PRODUTO_LOTES: ProdutoLote[] = [];

export const INITIAL_PERDAS_ESTOQUE: PerdaEstoqueRecord[] = [];

export const INITIAL_TRANSFERENCIAS_LOJAS: TransferenciaLojas[] = [];

export const INITIAL_INVENTARIOS_CEGOS: InventarioCego[] = [];

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-destilados',
    name: 'Destilados & Doses',
    slug: 'destilados',
    description: 'Whiskies, gins, vodkas, tequilas e cachaças premium fracionáveis ou fechadas',
    color: 'amber',
    defaultMarkupPercent: 65,
    iconName: 'Wine',
  },
  {
    id: 'cat-cervejas',
    name: 'Cervejas & Chopes',
    slug: 'cervejas',
    description: 'Long necks, latas, fardos, garrafas 600ml e barris de chopp',
    color: 'yellow',
    defaultMarkupPercent: 55,
    iconName: 'Beer',
  },
  {
    id: 'cat-vinhos',
    name: 'Vinhos & Espumantes',
    slug: 'vinhos',
    description: 'Rótulos nacionais e importados, frisantes, champagnes e espumantes',
    color: 'rose',
    defaultMarkupPercent: 60,
    iconName: 'Wine',
  },
  {
    id: 'cat-combos',
    name: 'Combos & Copões',
    slug: 'combos',
    description: 'Kits promocionais de destilados com gelo de sabor e energéticos',
    color: 'purple',
    defaultMarkupPercent: 80,
    iconName: 'Layers',
  },
  {
    id: 'cat-gelo-petiscos',
    name: 'Gelo, Não-Alcoólicos & Petiscos',
    slug: 'gelo_petiscos',
    description: 'Sacos de gelo filtrado e coco, energéticos, refrigerantes e snacks',
    color: 'cyan',
    defaultMarkupPercent: 70,
    iconName: 'Package',
  },
];

export const INITIAL_MOVIMENTACOES_ESTOQUE: MovimentacaoEstoque[] = [];
