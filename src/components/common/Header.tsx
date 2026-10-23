import React, { useState } from 'react';
import { 
  Wine, Store, UserCircle, Bell, ChevronDown, 
  CircleDollarSign, ShieldCheck, QrCode, CheckCircle2,
  X, AlertTriangle, Menu, Sparkles
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

interface HeaderProps {
  onOpenRoleModal: () => void;
  onOpenCardapioModal?: () => void;
  onOpenQrCardapio?: () => void;
  onToggleMobileMenu?: () => void;
  onOpenSalesPage?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenRoleModal, 
  onOpenCardapioModal,
  onOpenQrCardapio,
  onToggleMobileMenu,
  onOpenSalesPage
}) => {
  const handleOpenCardapio = onOpenCardapioModal || onOpenQrCardapio;
  const { 
    currentUser, 
    activeStore, 
    cashSession, 
    notifications, 
    dismissNotification 
  } = useAdega();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Proprietário / Admin', color: 'bg-purple-900/40 text-purple-300 border-purple-700/50' };
      case 'STORE_MANAGER':
        return { label: 'Gerente de Loja', color: 'bg-blue-900/40 text-blue-300 border-blue-700/50' };
      case 'CASHIER':
        return { label: 'Operador de Caixa', color: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50' };
      case 'WAITER':
        return { label: 'Atendente / Garçom', color: 'bg-amber-900/40 text-amber-300 border-amber-700/50' };
      case 'DELIVERY_COURIER':
        return { label: 'Motoboy / Delivery', color: 'bg-orange-900/40 text-orange-300 border-orange-700/50' };
      default:
        return { label: role, color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const roleInfo = getRoleLabel(currentUser.role);

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800/80 px-3 sm:px-4 md:px-6 flex items-center justify-between text-zinc-100 z-30 sticky top-0">
      {/* Left Area (Mobile Menu Trigger) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Abrir Menu de Módulos"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Center & Right Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Cardápio Online QR Simulator */}
        <button
          id="btn-open-cardapio-qr"
          type="button"
          onClick={handleOpenCardapio}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-750 text-zinc-200 hover:text-white border border-zinc-800 hover:border-amber-500/40 text-xs transition-all cursor-pointer shadow-sm group select-none"
          title="Ver como o cliente enxerga no celular ao escanear o QR Code da mesa"
        >
          <div className="p-1 rounded-md bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 shrink-0">
            <QrCode className="w-4 h-4 text-amber-400" />
          </div>
          <div className="hidden sm:flex flex-col text-left leading-none justify-center">
            <span className="font-semibold text-zinc-100 text-xs tracking-tight">Cardápio QR</span>
            <span className="text-[10px] text-zinc-400 font-medium mt-0.5">(Cliente)</span>
          </div>
        </button>

        {/* Caixa Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <CircleDollarSign className={`w-3.5 h-3.5 ${cashSession?.isOpen ? 'text-emerald-400' : 'text-rose-400'}`} />
          <span className="text-zinc-400">Caixa:</span>
          <span className={`font-semibold ${cashSession?.isOpen ? 'text-emerald-300' : 'text-rose-300'}`}>
            {cashSession?.isOpen ? `Aberto (R$ ${(cashSession.currentCash ?? 0).toFixed(2)})` : 'Fechado'}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {(notifications || []).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-zinc-950 font-bold text-[10px] flex items-center justify-center">
                {(notifications || []).length}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 p-2 overflow-hidden">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-zinc-800 text-xs font-semibold text-zinc-300">
                <span>Alertas da Adega ({(notifications || []).length})</span>
                <span className="text-[11px] text-zinc-400">Sincronizado</span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-zinc-800/60 mt-1">
                {(notifications || []).length === 0 ? (
                  <p className="text-center py-4 text-xs text-zinc-400">Nenhum alerta pendente</p>
                ) : (
                  (notifications || []).map((notif, idx) => (
                    <div key={idx} className="p-2.5 text-xs text-zinc-300 flex items-start justify-between gap-2 hover:bg-zinc-800/50 rounded-lg">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>{notif}</span>
                      </div>
                      <button 
                        onClick={() => dismissNotification(idx)} 
                        className="text-zinc-400 hover:text-zinc-300 p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Página de Vendas (Landing Page) Link */}
        {onOpenSalesPage && (
          <button
            onClick={onOpenSalesPage}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 to-amber-600/10 hover:from-amber-500/25 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title="Ver Página de Vendas e Portal de Conversão"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Página de Vendas</span>
          </button>
        )}

        {/* User Role Switcher Trigger (RBAC) */}
        <button
          id="btn-user-role-switcher"
          onClick={onOpenRoleModal}
          className="flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 transition-all hover:border-zinc-700"
          title="Clique para alternar operador ou perfil de acesso (RBAC)"
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-700"
          />
          <div className="text-left hidden md:block">
            <div className="text-xs font-semibold text-zinc-200 leading-tight flex items-center gap-1.5">
              <span>{currentUser.name.split(' ')[0]}</span>
              <ShieldCheck className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-medium uppercase tracking-wider ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block ml-1" />
        </button>
      </div>
    </header>
  );
};
