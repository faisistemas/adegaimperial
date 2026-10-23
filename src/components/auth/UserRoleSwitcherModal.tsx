import React, { useState } from 'react';
import { 
  ShieldCheck, X, CheckCircle2, KeyRound, 
  Crown, UserCheck, ShoppingBag, UtensilsCrossed, Bike
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { User } from '../../types';

interface UserRoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserRoleSwitcherModal: React.FC<UserRoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUserRole } = useAdega();
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return Crown;
      case 'STORE_MANAGER': return UserCheck;
      case 'CASHIER': return ShoppingBag;
      case 'WAITER': return UtensilsCrossed;
      case 'DELIVERY_COURIER': return Bike;
      default: return ShieldCheck;
    }
  };

  const getRoleDetails = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return {
          title: 'Super Admin / Proprietário',
          badge: 'Acesso Total',
          desc: 'Retaguarda completa, relatórios de margem bruta/líquida, exportação Sped/Sintegra, gestão de multilojas e usuários.',
        };
      case 'STORE_MANAGER':
        return {
          title: 'Gerente de Loja',
          badge: 'Retaguarda & Salão',
          desc: 'Abertura/fechamento e sangrias de caixa, cancelamento com justificativa, gestão de estoque e auditoria de doses.',
        };
      case 'CASHIER':
        return {
          title: 'Operador de Caixa (PDV)',
          badge: 'Frente de Caixa',
          desc: 'PDV Touch de alta velocidade, recebimentos (PIX, TEF, Dinheiro), balança serial, fechamento de comandas e emissão de NFC-e.',
        };
      case 'WAITER':
        return {
          title: 'Atendente / Garçom',
          badge: 'Mobile & Mesas',
          desc: 'Abertura de comandas/mesas, lançamento de pedidos (doses/garrafas). Bloqueado para receber pagamentos e fechar caixa.',
        };
      case 'DELIVERY_COURIER':
        return {
          title: 'Motoboy / Delivery',
          badge: 'Despacho & Rota',
          desc: 'Painel simplificado para visualização de rotas, cálculo de taxa de entrega e confirmação de pedidos entregues.',
        };
      default:
        return { title: role, badge: '', desc: '' };
    }
  };

  const handleConfirmSwitch = () => {
    // Se o usuário digitou PIN diferente do configurado
    if (pinInput && pinInput !== selectedUser.pin) {
      setPinError(true);
      return;
    }
    switchUserRole(selectedUser);
    onClose();
  };

  const handleQuickSwitch = (u: User) => {
    setSelectedUser(u);
    setPinInput(u.pin);
    switchUserRole(u);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 font-serif">Controle de Acessos & Perfis (RBAC)</h3>
              <p className="text-xs text-zinc-400">
                {users.length === 1 
                  ? 'Operador único com Acesso Total irrestrito ao sistema'
                  : 'Alterne entre os operadores para testar as permissões do sistema'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          <div className={`grid grid-cols-1 ${users.length > 1 ? 'md:grid-cols-2' : ''} gap-3`}>
            {(users || []).map((u) => {
              const Icon = getRoleIcon(u.role);
              const info = getRoleDetails(u.role);
              const isSelected = selectedUser?.id === u.id;
              const isCurrent = currentUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUser(u);
                    setPinInput(u.pin);
                    setPinError(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-800/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 ring-1 ring-amber-500/25 shadow-md shadow-amber-950/50 bg-zinc-950 shrink-0">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-zinc-100 truncate">{u.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                            Atual
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon className="w-3 h-3 text-amber-400 shrink-0" />
                        <span className="text-[11px] font-medium text-amber-300 truncate">{info.title}</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                        {info.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                      <KeyRound className="w-3 h-3 text-zinc-400" />
                      <span>PIN: <strong className="text-zinc-300">{u.pin}</strong></span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickSwitch(u);
                      }}
                      className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline"
                    >
                      Acessar Agora &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PIN Lock Simulation Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">Terminal Touch - Desbloqueio com PIN</p>
                <p className="text-[11px] text-zinc-400">Operador selecionado: <strong className="text-amber-300">{selectedUser.name}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="PIN"
                className="w-24 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-center font-mono font-bold tracking-widest text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
              <button
                id="btn-confirm-switch-user"
                onClick={handleConfirmSwitch}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Entrar no Perfil</span>
              </button>
            </div>
          </div>
          {pinError && (
            <p className="text-xs text-rose-400 text-right -mt-3">PIN incorreto! Use o PIN exibido no card do usuário.</p>
          )}
        </div>
      </div>
    </div>
  );
};
