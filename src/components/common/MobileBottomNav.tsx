import React from 'react';
import { ShoppingCart, LayoutGrid, FileText, Droplets, Menu, DollarSign } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAdega } from '../../context/AdegaContext';

interface MobileBottomNavProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMobileMenu,
}) => {
  const { currentUser } = useAdega();

  const isTabActive = (tab: NavTab) => {
    if (tab === 'vendas' && (activeTab === 'vendas' || activeTab === 'pdv')) return true;
    return activeTab === tab;
  };

  return (
    <nav 
      aria-label="Navegação Rápida Mobile & Tablet"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/90 px-1 py-1.5 flex items-center justify-around select-none safe-area-bottom shadow-2xl"
    >
      {/* 1. PDV / Vendas */}
      <button
        type="button"
        onClick={() => setActiveTab('vendas')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
          isTabActive('vendas')
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <ShoppingCart className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">PDV</span>
      </button>

      {/* 2. Mesas / Salão */}
      <button
        type="button"
        onClick={() => setActiveTab('mesas')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
          isTabActive('mesas')
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <LayoutGrid className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Mesas</span>
      </button>

      {/* 3. Comandas */}
      <button
        type="button"
        onClick={() => setActiveTab('comandas')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
          isTabActive('comandas')
            ? 'text-amber-400 font-bold bg-amber-500/10'
            : 'text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Comandas</span>
      </button>

      {/* 4. Estoque ou Financeiro baseado na role */}
      {currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'STORE_MANAGER' ? (
        <button
          type="button"
          onClick={() => setActiveTab('estoque')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
            isTabActive('estoque')
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Droplets className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Estoque</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setActiveTab('financeiro')}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all min-h-[48px] ${
            isTabActive('financeiro')
              ? 'text-amber-400 font-bold bg-amber-500/10'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <DollarSign className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Caixa</span>
        </button>
      )}

      {/* 5. Menu Completo Drawer */}
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-zinc-400 hover:text-zinc-200 min-h-[48px]"
        title="Abrir Todos os Módulos"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Mais</span>
      </button>
    </nav>
  );
};
