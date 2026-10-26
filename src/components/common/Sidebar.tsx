import React from 'react';
import { 
  ShoppingCart, Droplets, LayoutGrid, FileText, 
  Bike, ReceiptText, BarChart3, Users, Building2,
  Lock, Cpu, UtensilsCrossed, TrendingUp, QrCode, X, Printer, Truck, DollarSign, Settings
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { UserRole } from '../../types';

export type NavTab = 
  | 'vendas'
  | 'pdv' 
  | 'compras'
  | 'estoque' 
  | 'mesas' 
  | 'comandas' 
  | 'kds'
  | 'delivery' 
  | 'fiscal' 
  | 'financeiro'
  | 'backoffice'
  | 'dashboard' 
  | 'crm' 
  | 'multiloja'
  | 'impressoras'
  | 'perifericos'
  | 'configuracoes';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onRestrictedClick?: (requiredRoles: string[]) => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenCardapioQr?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onRestrictedClick,
  mobileOpen,
  onCloseMobile,
  onOpenCardapioQr
}) => {
  const { currentUser } = useAdega();

  const isRoleAllowed = (allowedRoles: UserRole[]): boolean => {
    return allowedRoles.includes(currentUser.role);
  };

  const navItems: {
    id: NavTab;
    label: string;
    description: string;
    icon: React.ElementType;
    allowedRoles: UserRole[];
    badge?: string;
  }[] = [
    {
      id: 'vendas',
      label: 'Vendas e Clientes',
      description: 'PDV, Devoluções, CRM e Reservas',
      icon: ShoppingCart,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER'],
      badge: 'Principal',
    },
    {
      id: 'compras',
      label: 'Compras & Fornecedores',
      description: 'Fornecedores, Pedidos e Recebimento',
      icon: Truck,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
      badge: 'Novo',
    },
    {
      id: 'estoque',
      label: 'Produtos & Estoque',
      description: 'Lotes, Kardex e transferências',
      icon: Droplets,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
      badge: 'Core',
    },
    {
      id: 'mesas',
      label: 'Salão & Mesas',
      description: 'Mapa virtual de mesas e consumo',
      icon: LayoutGrid,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER', 'WAITER'],
    },
    {
      id: 'comandas',
      label: 'Comandas',
      description: 'Fichas individuais por CPF',
      icon: FileText,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER', 'WAITER'],
    },
    {
      id: 'kds',
      label: 'KDS Bar & Cozinha',
      description: 'Preparo com tempos e alertas',
      icon: UtensilsCrossed,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER', 'WAITER'],
      badge: 'Módulo 4',
    },
    {
      id: 'delivery',
      label: 'Delivery & Motoboy',
      description: 'Despacho, rotas e taxa de entrega',
      icon: Bike,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER', 'DELIVERY_COURIER'],
    },
    {
      id: 'fiscal',
      label: 'Fiscal & Sped',
      description: 'NFC-e, Sped .txt e Sintegra',
      icon: ReceiptText,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
      badge: 'Brasil',
    },
    {
      id: 'financeiro',
      label: 'Financeiro & Gestão',
      description: 'Caixa, Contas, Dashboard, Relatórios e Configurações',
      icon: DollarSign,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER'],
      badge: 'Gestão',
    },
    {
      id: 'backoffice',
      label: 'Backoffice & DRE',
      description: 'DRE, Curva ABC, OFX e Compras',
      icon: TrendingUp,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
      badge: 'Módulo 6',
    },
    {
      id: 'dashboard',
      label: 'Rentabilidade',
      description: 'Doses vs Garrafas e Margens',
      icon: BarChart3,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
    },
    {
      id: 'impressoras',
      label: 'Impressoras Térmicas',
      description: 'PDV, Cozinha e Bar via Browser',
      icon: Printer,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER', 'CASHIER'],
      badge: 'ESC/POS',
    },
    {
      id: 'perifericos',
      label: 'Periféricos & Balança',
      description: 'Toledo, ESC/POS e Leitor Barcode',
      icon: Cpu,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
      badge: 'Módulo 2',
    },
    {
      id: 'configuracoes',
      label: 'Configuracoes',
      description: 'Dados da AdeGaswg, horários e notificações',
      icon: Settings,
      allowedRoles: ['SUPER_ADMIN', 'STORE_MANAGER'],
      badge: 'Geral',
    },
  ];

  const handleItemClick = (item: typeof navItems[0]) => {
    if (isRoleAllowed(item.allowedRoles)) {
      setActiveTab(item.id);
    } else if (onRestrictedClick) {
      onRestrictedClick(item.allowedRoles);
    }
  };

  return (
    <>
      {/* Mobile & Tablet Portrait Drawer Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/75 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside className={`
        fixed lg:relative top-0 lg:top-auto left-0 h-full
        w-72 sm:w-80 lg:w-64 bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between shrink-0 
        select-none z-50 lg:z-30 transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Brand Header */}
        <div className="p-3.5 sm:p-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl overflow-hidden border border-amber-500/40 shadow-md shadow-amber-950/50 bg-zinc-950 shrink-0 ring-1 ring-amber-500/25">
              <img
                src="/logo.jpg"
                alt="AdeGaswg"
                className="h-full w-full object-cover object-center"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs uppercase tracking-wider text-amber-200 font-serif">AdeGaswg</span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">Gestão & PDV</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onCloseMobile} 
            className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          {navItems.map((item) => {
            const allowed = isRoleAllowed(item.allowedRoles);
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            const isConfig = item.id === 'configuracoes';

            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all relative group ${
                  isActive
                    ? isConfig
                      ? 'bg-emerald-950/50 text-emerald-400 font-semibold border border-emerald-500/40 shadow-sm'
                      : 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30 shadow-sm'
                    : allowed
                    ? isConfig
                      ? 'text-zinc-300 hover:bg-zinc-900/80 hover:text-emerald-400'
                      : 'text-zinc-300 hover:bg-zinc-900/80 hover:text-zinc-100'
                    : 'text-zinc-400 hover:bg-zinc-900/40 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isActive
                        ? isConfig
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                        : allowed
                        ? isConfig
                          ? 'bg-zinc-900 text-emerald-400/80 group-hover:text-emerald-300'
                          : 'bg-zinc-900 text-zinc-400 group-hover:text-zinc-200'
                        : 'bg-zinc-900/50 text-zinc-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                          isActive
                            ? isConfig
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-amber-500/20 text-amber-300'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 truncate mt-0.5">{item.description}</p>
                  </div>
                </div>

                {!allowed && (
                  <div title="Restrito ao seu perfil de acesso">
                    <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0 ml-1" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Role & Access Legend Footer */}
        <div className="p-3 border-t border-zinc-800/70 bg-zinc-950/60">
          <div className="rounded-xl p-3 bg-zinc-900/60 border border-zinc-800/80 text-[11px]">
            <div className="flex items-center justify-between text-zinc-300 font-medium mb-1">
              <span>Operador:</span>
              <span className="font-semibold text-amber-400">Administrador (admin)</span>
            </div>
            <p className="text-zinc-400 text-[10px] leading-relaxed">
              Acesso total irrestrito (Retaguarda, Fiscal & Multiloja).
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
