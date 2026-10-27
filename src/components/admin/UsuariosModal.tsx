import React, { useState, useEffect } from 'react';
import { 
  KeyRound, X, Plus, Check, AlertCircle, 
  Eye, EyeOff, Edit3, Trash2, Shield, Mail, Lock, Phone, LogIn 
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { User, UserRole } from '../../types';
import { getSupabaseClient } from '../../lib/supabase';

interface UsuariosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsuariosModal: React.FC<UsuariosModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUserRole, setUsers } = useAdega();
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado para cadastro / edição de usuário
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('WAITER');
  const [formPin, setFormPin] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formWhatsapp, setFormWhatsapp] = useState('');

  // Estado para visualização (Ficha do Operador - ícone de olho)
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [showPinInViewer, setShowPinInViewer] = useState(false);


  // Fechar com tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (viewingUser) {
          setViewingUser(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, viewingUser]);

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.name.toLowerCase().includes('admin');
  if (!isAdmin) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div 
          className="w-full max-w-md bg-[#141517] border border-zinc-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Acesso Restrito ao Administrador</h3>
            <p className="text-xs text-zinc-400">
              Apenas usuários com perfil de <strong>Administrador</strong> têm permissão para acessar e visualizar quem está cadastrado no sistema.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  const showNotification = (type: 'success' | 'error', text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleUpdatePassword = (user: User) => {
    const newPassword = (passwords[user.id] || '').trim();
    if (!newPassword) {
      showNotification('error', `Digite a nova senha para ${user.name}.`);
      return;
    }

    const updatedUser = { ...user, pin: newPassword };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === user.id) {
          return updatedUser;
        }
        return u;
      })
    );

    if (currentUser.id === user.id) {
      switchUserRole({ ...currentUser, pin: newPassword });
    }

    // Persiste no Supabase em segundo plano (API e Cliente direto)
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser),
    }).catch(() => {});

    const sb = getSupabaseClient();
    if (sb) {
      sb.from('usuarios')
        .upsert({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          avatar: updatedUser.avatar || '/logo.jpg',
          pin: updatedUser.pin,
          store_id: updatedUser.storeId || 'store-1',
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.error('[Supabase Password Error]:', error);
        });
    }

    setPasswords((prev) => ({ ...prev, [user.id]: '' }));
    showNotification('success', `Senha de ${user.name} atualizada com sucesso!`);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return;

    if (users.length <= 1) {
      showNotification('error', 'Não é possível excluir o único usuário do sistema.');
      return;
    }

    if (window.confirm(`Deseja realmente excluir o usuário "${targetUser.name}"?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));

      // Remove no Supabase em segundo plano (API e Cliente direto)
      fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      }).catch(() => {});

      const sbDelete = getSupabaseClient();
      if (sbDelete) {
        sbDelete.from('usuarios').delete().eq('id', userId).then(() => {}, () => {});
      }

      const remainingUsers = users.filter((u) => u.id !== userId);
      if (userId === currentUser.id && remainingUsers.length > 0) {
        switchUserRole(remainingUsers[0]);
      }

      if (editingUserId === userId) {
        handleCancelForm();
      }
      if (viewingUser?.id === userId) {
        setViewingUser(null);
      }

      showNotification('success', `Usuário "${targetUser.name}" excluído.`);
    }
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormRole(user.role);
    setFormPin(user.pin);
    setFormEmail(user.email || '');
    setFormWhatsapp(user.whatsapp || user.phone || '');
    setShowAddForm(true);
    setViewingUser(null);
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingUserId(null);
    setFormName('');
    setFormPin('');
    setFormEmail('');
    setFormWhatsapp('');
    setFormRole('WAITER');
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('error', 'Informe o nome do usuário.');
      return;
    }
    if (!formPin.trim()) {
      showNotification('error', 'Informe a senha do usuário.');
      return;
    }

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPin = formPin.trim();

    if (editingUserId) {
      // Atualizar usuário existente
      const updatedUser: User = {
        id: editingUserId,
        name: formName.trim(),
        role: formRole,
        pin: cleanPin,
        email: cleanEmail || `${formName.trim().toLowerCase().replace(/\s+/g, '.')}@adegaswg.com.br`,
        whatsapp: formWhatsapp.trim(),
        avatar: '/logo.jpg',
        storeId: currentUser.storeId || 'store-1',
      };

      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === editingUserId) {
            return {
              ...u,
              ...updatedUser,
            };
          }
          return u;
        })
      );

      if (currentUser.id === editingUserId) {
        switchUserRole({
          ...currentUser,
          ...updatedUser,
        });
      }

      // Persiste no Supabase (API e Cliente direto)
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      }).catch(() => {});

      const sb = getSupabaseClient();
      if (sb) {
        sb.from('usuarios')
          .upsert({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar || '/logo.jpg',
            pin: updatedUser.pin,
            store_id: updatedUser.storeId || 'store-1',
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) console.error('[Supabase Update User Error]:', error);
          });
      }

      showNotification('success', `Usuário "${formName}" atualizado com sucesso!`);
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: formName.trim(),
        email: cleanEmail || `${formName.trim().toLowerCase().replace(/\s+/g, '.')}@adegaswg.com.br`,
        whatsapp: formWhatsapp.trim(),
        role: formRole,
        avatar: '/logo.jpg',
        pin: cleanPin,
        storeId: currentUser.storeId || 'store-1',
      };

      setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser]);

      // Persiste no Supabase (API e Cliente direto)
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).catch(() => {});

      const sb = getSupabaseClient();
      if (sb) {
        sb.from('usuarios')
          .upsert({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            avatar: newUser.avatar || '/logo.jpg',
            pin: newUser.pin,
            store_id: newUser.storeId || 'store-1',
            updated_at: new Date().toISOString(),
          })
          .then(({ error }) => {
            if (error) {
              console.error('[Supabase Create User Error]:', error);
            } else {
              console.log('[Supabase User Created Successfully]:', newUser.name);
            }
          });
      }

      showNotification('success', `Usuário "${newUser.name}" cadastrado com sucesso no banco de dados!`);
    }

    handleCancelForm();
  };

  const getUserHandle = (user: User) => {
    if (user.role === 'SUPER_ADMIN' || user.name.toLowerCase().includes('admin')) return 'admin';
    if (user.role === 'WAITER' || user.name.toLowerCase().includes('garçom') || user.name.toLowerCase().includes('garcom')) return 'garcom';
    if (user.role === 'CASHIER' || user.name.toLowerCase().includes('caixa')) return 'caixa';
    if (user.role === 'STORE_MANAGER' || user.name.toLowerCase().includes('gerente')) return 'gerente';
    if (user.role === 'DELIVERY_COURIER' || user.name.toLowerCase().includes('motoboy')) return 'motoboy';
    return user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const getRoleBadge = (user: User) => {
    const handle = getUserHandle(user);
    const isAdmin = handle === 'admin' || user.role === 'SUPER_ADMIN';

    return {
      label: handle,
      className: isAdmin 
        ? 'bg-[#22c55e] text-zinc-950 font-bold' 
        : 'bg-[#27272a] text-zinc-300 font-medium',
    };
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Acesso irrestrito a todos os módulos, fiscal, estoque e configurações.';
      case 'STORE_MANAGER':
        return 'Fechamento de caixa, sangrias, relatórios e autorizações de descontos.';
      case 'CASHIER':
        return 'Frente de caixa (PDV Touch), emissão fiscal NFC-e e recebimentos.';
      case 'WAITER':
        return 'Atendimento a mesas, comandas e consulta rápida de itens.';
      case 'DELIVERY_COURIER':
        return 'Despacho de pedidos de delivery e confirmação de entrega.';
      default:
        return 'Acesso operacional padrão.';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#141517] border border-zinc-800/90 rounded-2xl p-4 sm:p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs sm:text-sm font-bold tracking-wider text-[#22c55e] uppercase">
            USUÁRIOS CADASTRADOS
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificação / Feedback */}
        {feedback && (
          <div 
            className={`mb-4 px-3 py-2 rounded-xl text-xs flex items-center gap-2 border animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                : 'bg-rose-950/60 border-rose-800 text-rose-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Formulário Novo Usuário / Editar Usuário (No topo) */}
        <form onSubmit={handleSaveForm} className="space-y-3 p-3.5 rounded-xl bg-[#0c0d0f] border border-zinc-800/80 mb-5">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-xs font-semibold text-zinc-200">
            <span>{editingUserId ? `Editar Usuário: ${formName}` : 'Novo Usuário'}</span>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer text-xs"
            >
              Cancelar
            </button>
          </div>

          {/* Linha 1: Nome (2 colunas) e Função (1 coluna) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="text"
              placeholder="Nome (ex: Garçom)"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              required
            />
            <select
              value={formRole}
              onChange={(e) => setFormRole(e.target.value as UserRole)}
              className="sm:col-span-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 cursor-pointer"
            >
              <option value="SUPER_ADMIN">Administrador (admin)</option>
              <option value="WAITER">Garçom (garcom)</option>
              <option value="CASHIER">Caixa (caixa)</option>
              <option value="STORE_MANAGER">Gerente (gerente)</option>
              <option value="DELIVERY_COURIER">Motoboy (motoboy)</option>
            </select>
          </div>

          {/* Linha 2: Whatsapp, Email e Senha (3 colunas perfeitamente alinhadas) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input
              type="tel"
              placeholder="Whatsapp"
              value={formWhatsapp}
              onChange={(e) => setFormWhatsapp(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
            />
            <input
              type="email"
              placeholder="Email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
            <input
              type="password"
              placeholder="Senha"
              maxLength={30}
              value={formPin}
              onChange={(e) => setFormPin(e.target.value)}
              className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 font-mono"
              required
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              {editingUserId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
            </button>
          </div>
        </form>

        {/* Lista de Usuários Cadastrados ABAIXO de Cadastrar Usuário */}
        <div className="divide-y divide-zinc-800/80">
          {users
            .filter((u) => u && u.id !== 'u-2' && u.id !== 'u-1793120258445' && u.name.toLowerCase() !== 'teste')
            .map((user) => {
            const handle = getUserHandle(user);
            const badge = getRoleBadge(user);

            return (
              <div 
                key={user.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 sm:py-4 first:pt-1 last:pb-1 gap-2.5 sm:gap-3"
              >
                {/* Lado Esquerdo / Superior: Nome + @handle + badge + Botão Entrar */}
                <div className="flex items-center justify-between sm:justify-start gap-2 min-w-0 flex-1">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-sm sm:text-base leading-tight truncate">
                      {user.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-400 font-medium">
                      <span>@{handle}</span>
                      <span className="text-zinc-600">·</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] leading-tight ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {/* Botão Entrar / Status Conectado */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {currentUser.id === user.id ? (
                      <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Conectado</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          switchUserRole(user);
                          showNotification('success', `Conectado como ${user.name}!`);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                        title={`Entrar no sistema como ${user.name}`}
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Entrar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Lado Direito / Inferior: Input Nova Senha + Chave + Opções (Olho, Lápis, Lixeira) */}
                <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
                    <input
                      type="password"
                      placeholder="Nova senha"
                      maxLength={30}
                      value={passwords[user.id] || ''}
                      onChange={(e) =>
                        setPasswords((prev) => ({ ...prev, [user.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleUpdatePassword(user);
                        }
                      }}
                      className="w-full sm:w-28 md:w-32 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#0c0d0f] border border-zinc-800/90 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 font-mono tracking-wider"
                    />

                    {/* Botão Chave (Salvar Nova Senha) */}
                    <button
                      type="button"
                      onClick={() => handleUpdatePassword(user)}
                      className="p-2 sm:p-2.5 rounded-xl bg-[#26282e] hover:bg-[#32363e] text-zinc-300 hover:text-white border border-zinc-700/40 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      title="Salvar nova senha"
                    >
                      <KeyRound className="w-4 h-4 text-zinc-300" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">

                  {/* Opção da 1ª Imagem: Botão Olho (Visualizar Ficha) */}
                  <button
                    type="button"
                    onClick={() => {
                      setViewingUser(user);
                      setShowPinInViewer(false);
                    }}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#202226] hover:bg-[#2c2f35] text-zinc-300 hover:text-white border border-zinc-700/40 transition-colors cursor-pointer flex items-center justify-center"
                    title="Visualizar detalhes do operador"
                  >
                    <Eye className="w-4 h-4 text-zinc-300" />
                  </button>

                  {/* Opção da 1ª Imagem: Botão Lápis (Editar Usuário) */}
                  <button
                    type="button"
                    onClick={() => handleStartEdit(user)}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#202226] hover:bg-[#2c2f35] text-zinc-300 hover:text-amber-300 border border-zinc-700/40 transition-colors cursor-pointer flex items-center justify-center"
                    title="Editar dados do usuário"
                  >
                    <Edit3 className="w-4 h-4 text-zinc-300" />
                  </button>

                  {/* Opção da 1ª Imagem: Botão Lixeira (Excluir Usuário) */}
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user.id)}
                    className="p-2 sm:p-2.5 rounded-xl bg-[#202226] hover:bg-rose-950/50 text-zinc-300 hover:text-rose-400 border border-zinc-700/40 transition-colors cursor-pointer flex items-center justify-center"
                    title="Excluir usuário"
                  >
                    <Trash2 className="w-4 h-4 text-zinc-300 hover:text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>

        {/* Modal de Detalhes do Usuário (Disparado pelo ícone de Olho) */}
        {viewingUser && (
          <div 
            className="absolute inset-0 bg-[#141517]/95 backdrop-blur-md rounded-2xl p-5 z-20 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-zinc-800 text-emerald-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-100">Ficha do Operador</h4>
                    <p className="text-[11px] text-zinc-400">Credenciais e nível de acesso</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingUser(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-zinc-400">Nome</div>
                    <div className="font-bold text-sm text-white">{viewingUser.name}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[11px] ${getRoleBadge(viewingUser).className}`}>
                    {getRoleBadge(viewingUser).label}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    E-mail
                  </span>
                  <span className="text-zinc-200 font-mono truncate max-w-[200px]">
                    {viewingUser.email || 'Não informado'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-500" />
                    WhatsApp
                  </span>
                  <span className="text-zinc-200 font-mono truncate max-w-[200px]">
                    {viewingUser.whatsapp || viewingUser.phone || 'Não informado'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-500" />
                    Senha
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-semibold tracking-wider">
                      {showPinInViewer ? viewingUser.pin : '••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPinInViewer(!showPinInViewer)}
                      className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      title={showPinInViewer ? 'Ocultar' : 'Exibir'}
                    >
                      {showPinInViewer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs space-y-1">
                  <span className="font-semibold text-zinc-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    Permissões
                  </span>
                  <p className="text-[11px] text-zinc-300">
                    {getRoleDescription(viewingUser.role)}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStartEdit(viewingUser)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Dados</span>
                </button>

                {currentUser.id !== viewingUser.id && (
                  <button
                    type="button"
                    onClick={() => {
                      switchUserRole(viewingUser);
                      showNotification('success', `Conectado como ${viewingUser.name}!`);
                      setViewingUser(null);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setViewingUser(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
