import React, { useState } from 'react';
import { 
  Users, X, Plus, KeyRound, ShieldCheck, 
  Trash2, Edit3, UserCheck, AlertCircle,
  Eye, EyeOff, Shield, CheckCircle2, Mail, Lock
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { User, UserRole } from '../../types';

interface UsuariosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsuariosModal: React.FC<UsuariosModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUserRole, setUsers } = useAdega();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STORE_MANAGER');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Viewer State (Visualizar Usuário)
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [showPinInViewer, setShowPinInViewer] = useState(false);

  if (!isOpen) return null;

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'SUPER_ADMIN':
        return { 
          label: 'Administrador (admin)', 
          color: 'bg-zinc-800 text-zinc-200 border-zinc-700',
          permissions: 'Acesso irrestrito a todos os módulos, configurações fiscais, financeiro, estoque e controle de operadores.'
        };
      case 'STORE_MANAGER':
        return { 
          label: 'Gerente de Loja', 
          color: 'bg-blue-900/30 text-blue-300 border-blue-700/50',
          permissions: 'Fechamento cego de caixa, autorização de descontos, conciliação e relatórios gerenciais.'
        };
      case 'CASHIER':
        return { 
          label: 'Operador de Caixa (PDV)', 
          color: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
          permissions: 'Frente de caixa, registro de vendas, recebimentos PIX/Cartão/Dinheiro e sangria/suprimento.'
        };
      case 'WAITER':
        return { 
          label: 'Atendente / Garçom', 
          color: 'bg-amber-900/30 text-amber-300 border-amber-700/50',
          permissions: 'Lançamento de pedidos em mesas/comandas e consulta de cardápio digital.'
        };
      case 'DELIVERY_COURIER':
        return { 
          label: 'Motoboy / Delivery', 
          color: 'bg-orange-900/30 text-orange-300 border-orange-700/50',
          permissions: 'Despacho de pedidos de delivery e confirmação de entrega.'
        };
      default:
        return { 
          label: userRole, 
          color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          permissions: 'Acesso padrão conforme permissões atribuídas.'
        };
    }
  };

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Lê os valores tanto do estado quanto do formulário nativo (garante compatibilidade com auto-completar do navegador)
    const form = e.currentTarget;
    const formData = new FormData(form);
    const finalName = (name || (formData.get('userName') as string) || '').trim();
    const finalEmail = (email || (formData.get('userEmail') as string) || '').trim();
    const finalRole = (role || (formData.get('userRole') as UserRole) || 'STORE_MANAGER');
    const rawPin = (pin || (formData.get('userPin') as string) || '');
    const finalPin = rawPin.replace(/\D/g, '').trim();

    if (!finalName) {
      setError('Por favor, informe o nome do usuário.');
      return;
    }
    if (!finalPin || finalPin.length < 4) {
      setError('O PIN numérico deve ter no mínimo 4 dígitos.');
      return;
    }

    if (editingUserId) {
      // Editar usuário existente
      setUsers((prevUsers) =>
        prevUsers.map((u) => {
          if (u.id === editingUserId) {
            return {
              ...u,
              name: finalName,
              email: finalEmail || u.email,
              role: finalRole,
              pin: finalPin,
            };
          }
          return u;
        })
      );

      if (currentUser.id === editingUserId) {
        switchUserRole({ ...currentUser, name: finalName, role: finalRole, pin: finalPin });
      }

      setSuccessMsg(`Usuário "${finalName}" atualizado com sucesso!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingUserId(null);
    } else {
      // Cadastrar novo usuário
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: finalName,
        email: finalEmail || `${finalName.toLowerCase().replace(/\s+/g, '.')}@adegaimperial.com.br`,
        role: finalRole,
        pin: finalPin,
        avatar: '/logo.jpg',
        storeId: currentUser.storeId || 'store-1',
      };

      setUsers((prevUsers) => [...prevUsers, newUser]);
      setSuccessMsg(`Usuário "${finalName}" cadastrado com sucesso!`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }

    // Limpar formulário
    setName('');
    setEmail('');
    setPin('');
    setRole('STORE_MANAGER');
    setShowAddForm(false);
    setError('');
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setPin(user.pin);
    setShowAddForm(true);
    setError('');
    if (viewingUser) setViewingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (users.length <= 1) {
      alert('Não é possível excluir o único usuário do sistema.');
      return;
    }

    const confirmMsg = targetUser.id === currentUser.id
      ? `Atenção: "${targetUser.name}" é o operador ativo no momento.\nSe excluir, o sistema alternará automaticamente para outro operador.\n\nDeseja confirmar a exclusão?`
      : `Tem certeza que deseja excluir o operador "${targetUser.name}"?`;

    if (window.confirm(confirmMsg)) {
      const remainingUsers = users.filter((u) => u.id !== userId);
      setUsers(remainingUsers);

      // Se o usuário excluído era o conectado, alterna para o primeiro restante
      if (userId === currentUser.id && remainingUsers.length > 0) {
        switchUserRole(remainingUsers[0]);
      }

      if (editingUserId === userId) {
        setShowAddForm(false);
        setEditingUserId(null);
      }
      if (viewingUser?.id === userId) {
        setViewingUser(null);
      }

      setSuccessMsg(`Usuário "${targetUser.name}" removido com sucesso.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700">
                <Users className="w-5 h-5 text-zinc-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-zinc-100 font-serif">Gestão de Usuários & Operadores</h3>
                <p className="text-xs text-zinc-400">Controle de acessos, senhas PIN e operadores da Adega Imperial</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1">
            {/* Success Message Banner */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Top Bar with Add Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">
                Usuários Cadastrados ({users.length})
              </span>
              {!showAddForm && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUserId(null);
                    setName('');
                    setEmail('');
                    setPin('');
                    setRole('STORE_MANAGER');
                    setShowAddForm(true);
                    setError('');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo Usuário</span>
                </button>
              )}
            </div>

            {/* Form Create / Edit */}
            {showAddForm && (
              <form onSubmit={handleSaveUser} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    {editingUserId ? 'Editar Usuário' : 'Cadastrar Novo Usuário'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setError('');
                    }}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    Cancelar
                  </button>
                </div>

                {error && (
                  <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      name="userName"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Ex: João da Silva"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">E-mail</label>
                    <input
                      type="email"
                      name="userEmail"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Ex: joao@adegaimperial.com.br"
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Cargo / Função</label>
                    <select
                      name="userRole"
                      value={role}
                      onChange={(e) => {
                        setRole(e.target.value as UserRole);
                        if (error) setError('');
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs focus:outline-none focus:border-amber-500/60"
                    >
                      <option value="SUPER_ADMIN">Administrador (admin)</option>
                      <option value="STORE_MANAGER">Gerente de Loja</option>
                      <option value="CASHIER">Operador de Caixa (PDV)</option>
                      <option value="WAITER">Atendente / Garçom</option>
                      <option value="DELIVERY_COURIER">Motoboy / Delivery</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">PIN de Acesso (4 dígitos)</label>
                    <input
                      type="password"
                      name="userPin"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value.replace(/\D/g, ''));
                        if (error) setError('');
                      }}
                      placeholder="Ex: 1234"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono tracking-widest focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    {editingUserId ? 'Salvar Alterações' : 'Criar Usuário'}
                  </button>
                </div>
              </form>
            )}

            {/* Users List */}
            <div className="space-y-2.5">
              {users.map((u) => {
                const badge = getRoleBadge(u.role);
                const isCurrent = u.id === currentUser.id;

                return (
                  <div
                    key={u.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                      isCurrent
                        ? 'bg-zinc-800/70 border-zinc-600 text-white'
                        : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-zinc-200 shrink-0">
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">{u.name}</span>
                          {isCurrent && (
                            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-semibold">
                              Ativo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                            <KeyRound className="w-3 h-3 text-zinc-500" />
                            PIN: {u.pin ? '••••' : 'Sem PIN'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Conectar, Visualizar, Editar, Excluir */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!isCurrent && (
                        <button
                          type="button"
                          onClick={() => switchUserRole(u)}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs rounded-lg transition-colors flex items-center gap-1"
                          title="Alternar para este operador"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="hidden sm:inline">Conectar</span>
                        </button>
                      )}

                      {/* Visualizar */}
                      <button
                        type="button"
                        onClick={() => {
                          setViewingUser(u);
                          setShowPinInViewer(false);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-sky-300 transition-colors"
                        title="Visualizar detalhes do operador"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(u)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-amber-300 transition-colors"
                        title="Editar operador e PIN"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Excluir */}
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg bg-zinc-800/60 hover:bg-rose-950 hover:text-rose-400 text-zinc-400 transition-colors"
                        title="Excluir operador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-xs text-zinc-400">
            <span>Operador conectado: <strong className="text-zinc-200">{currentUser.name}</strong></span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
            >
              Fechar
            </button>
          </div>

        </div>
      </div>

      {/* Modal Visualizar Usuário */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Viewer Header */}
            <div className="px-5 py-3.5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Eye className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-100">Ficha do Operador</h4>
                  <p className="text-[11px] text-zinc-400">Visualização de perfil e credenciais</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Viewer Content */}
            <div className="p-5 space-y-4">
              {/* User Identity Card */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-base text-zinc-200 shrink-0">
                  {viewingUser.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-sm text-zinc-100 truncate">{viewingUser.name}</h5>
                    {viewingUser.id === currentUser.id && (
                      <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded font-semibold shrink-0">
                        Ativo agora
                      </span>
                    )}
                  </div>
                  <div className="mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium inline-block ${getRoleBadge(viewingUser.role).color}`}>
                      {getRoleBadge(viewingUser.role).label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details List */}
              <div className="space-y-2.5 text-xs">
                {/* Email */}
                <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    E-mail
                  </span>
                  <span className="text-zinc-200 font-mono truncate max-w-[200px]">
                    {viewingUser.email || 'Não informado'}
                  </span>
                </div>

                {/* PIN */}
                <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800 flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    PIN de Acesso
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-amber-400 font-semibold tracking-wider">
                      {showPinInViewer ? viewingUser.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPinInViewer(!showPinInViewer)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                      title={showPinInViewer ? 'Ocultar PIN' : 'Mostrar PIN'}
                    >
                      {showPinInViewer ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>

                {/* Permissions Description */}
                <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Nível de Permissão
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    {getRoleBadge(viewingUser.role).permissions}
                  </p>
                </div>
              </div>
            </div>

            {/* Viewer Footer */}
            <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleStartEdit(viewingUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-xl text-xs font-semibold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
