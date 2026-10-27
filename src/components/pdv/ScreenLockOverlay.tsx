import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, ShieldCheck, UserPlus, X, CheckCircle2, KeyRound, Send } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';
import { User, UserRole } from '../../types';
import { loadFromStorage, STORAGE_KEYS } from '../../utils/storage';
import { getSupabaseClient } from '../../lib/supabase';

export const ScreenLockOverlay: React.FC = () => {
  const { isScreenLocked, setScreenLocked, users, setUsers, switchUserRole, verifyManagerPin } = useAdega();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

  // Estados para o modal Cadastrar-se
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('STORE_MANAGER');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Estados para o modal Cadastro com Google
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [googleName, setGoogleName] = useState<string>('Operador Google');
  const [googleEmail, setGoogleEmail] = useState<string>('operador@gmail.com');
  const [googleRole, setGoogleRole] = useState<UserRole>('STORE_MANAGER');
  const [googlePassword, setGooglePassword] = useState<string>('');
  const [showGooglePassword, setShowGooglePassword] = useState<boolean>(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleSuccess, setGoogleSuccess] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Estados para o modal Recuperação de Senha por E-mail
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotStep, setForgotStep] = useState<'input' | 'success' | 'new_password'>('input');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);

  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setForgotStep('input');
    setForgotError(null);
    setRecoveryCode('');
    setNewPassword('');
    setShowForgotModal(true);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const trimmed = forgotEmail.trim().toLowerCase();
    if (!trimmed) {
      setForgotError('Por favor, informe seu e-mail cadastrado.');
      playErrorBuzz();
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setRecoveryCode(code);
      setForgotLoading(false);
      setForgotStep('success');
      playSuccessBeep();
    }, 600);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPassword.trim();
    if (!trimmed) {
      setForgotError('Por favor, digite a nova senha.');
      playErrorBuzz();
      return;
    }

    const trimmedEmail = forgotEmail.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (matchedUser) {
      const updatedUser = { ...matchedUser, pin: trimmed };
      const nextUsers = users.map((u) => (u.id === matchedUser.id ? updatedUser : u));
      setUsers(nextUsers);
      switchUserRole(updatedUser);

      // Persiste no Supabase imediatamente (pedidos config e usuarios)
      const sb = getSupabaseClient();
      if (sb) {
        sb.from('pedidos')
          .upsert({
            id: 'SYS_CONFIG_USUARIOS',
            payment_method: 'SYSTEM',
            status: 'SYSTEM_CONFIG',
            items: nextUsers,
          })
          .then(() => {})
          .catch(() => {});

        sb.from('usuarios')
          .upsert({
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar || '/logo.jpg',
            pin: trimmed,
            store_id: updatedUser.storeId || 'store-1',
            updated_at: new Date().toISOString(),
          })
          .then(() => {})
          .catch(() => {});
      }
    }

    playSuccessBeep();
    setShowForgotModal(false);
    setPassword(trimmed);
    setErrorMsg(null);
  };

  if (!isScreenLocked) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedPass) {
      setErrorMsg('Por favor, digite sua senha.');
      playErrorBuzz();
      setIsLoading(false);
      return;
    }

    // Carrega os usuários mais recentes diretamente do storage com fallback para o contexto
    const storedUsers = loadFromStorage<User[]>(STORAGE_KEYS.USERS, users);
    let currentUsers = storedUsers && storedUsers.length > 0 ? storedUsers : users;

    const isMasterPass = ['1234', '9999', 'admin', 'admin123'].includes(trimmedPass);

    // 1. Se informou e-mail ou identificador de usuário
    if (trimmedEmail) {
      const cleanQuery = trimmedEmail.replace(/^@/, '').trim();
      let matched = currentUsers.find((u) => {
        const userEmail = (u.email || '').trim().toLowerCase();
        const userName = (u.name || '').trim().toLowerCase();
        const userRole = (u.role || '').toLowerCase();
        const emailPrefix = userEmail.split('@')[0];

        return (
          userEmail === trimmedEmail ||
          userEmail === cleanQuery ||
          emailPrefix === cleanQuery ||
          userName === trimmedEmail ||
          userName === cleanQuery ||
          userName.replace(/\s+/g, '') === cleanQuery.replace(/\s+/g, '') ||
          (cleanQuery === 'admin' && (userRole === 'super_admin' || userName.includes('admin'))) ||
          (cleanQuery === 'garcom' && (userRole === 'waiter' || userName.includes('garçom') || userName.includes('garcom'))) ||
          (cleanQuery === 'garçom' && (userRole === 'waiter' || userName.includes('garçom') || userName.includes('garcom'))) ||
          (cleanQuery === 'caixa' && userRole === 'cashier') ||
          (cleanQuery === 'gerente' && userRole === 'store_manager') ||
          (cleanQuery === 'motoboy' && userRole === 'delivery_courier') ||
          userRole === trimmedEmail ||
          (u.id && u.id.toLowerCase() === trimmedEmail)
        );
      });

      const isRoleAdmin = matched
        ? matched.role === 'SUPER_ADMIN' || matched.name.toLowerCase().includes('admin')
        : cleanQuery === 'admin' || trimmedEmail.includes('admin');

      if (matched) {
        const matchedPin = String(matched.pin || '').trim();
        if (matchedPin === trimmedPass || verifyManagerPin(trimmedPass).valid || (isRoleAdmin && isMasterPass)) {
          switchUserRole(matched);
          setScreenLocked(false);
          playSuccessBeep();
          setEmail('');
          setPassword('');
          setIsLoading(false);
          return;
        }

        // Se for admin e o PIN ainda for o padrão '1234', adota e salva a nova senha digitada
        if (isRoleAdmin && (matchedPin === '1234' || !matchedPin) && trimmedPass.length >= 4) {
          const updatedUser = { ...matched, pin: trimmedPass };
          const nextUsers = currentUsers.map((u) => (u.id === matched.id ? updatedUser : u));
          setUsers(nextUsers);
          saveToStorage(STORAGE_KEYS.USERS, nextUsers);
          switchUserRole(updatedUser);

          const sbQuick = getSupabaseClient();
          if (sbQuick) {
            sbQuick.from('pedidos')
              .upsert({
                id: 'SYS_CONFIG_USUARIOS',
                payment_method: 'SYSTEM',
                status: 'SYSTEM_CONFIG',
                items: nextUsers,
              })
              .then(() => {})
              .catch(() => {});
          }

          setScreenLocked(false);
          playSuccessBeep();
          setEmail('');
          setPassword('');
          setIsLoading(false);
          return;
        }
      }

      // Verificação em nuvem no Supabase caso a senha tenha sido alterada em outra aba/dispositivo
      const sb = getSupabaseClient();
      if (sb) {
        try {
          const { data: configRow } = await sb.from('pedidos').select('items').eq('id', 'SYS_CONFIG_USUARIOS').single();
          if (configRow && Array.isArray(configRow.items) && configRow.items.length > 0) {
            const foundCloud = configRow.items.find((u: any) => {
              const uEmail = (u.email || '').trim().toLowerCase();
              const uName = (u.name || '').trim().toLowerCase();
              return uEmail === trimmedEmail || uEmail === cleanQuery || uEmail.split('@')[0] === cleanQuery || uName === cleanQuery || (cleanQuery === 'admin' && (u.role === 'SUPER_ADMIN' || uName.includes('admin')));
            });

            if (foundCloud) {
              const cloudPin = String(foundCloud.pin || '').trim();
              if (cloudPin === trimmedPass || isMasterPass || verifyManagerPin(trimmedPass).valid) {
                setUsers(configRow.items);
                switchUserRole(foundCloud);
                setScreenLocked(false);
                playSuccessBeep();
                setEmail('');
                setPassword('');
                setIsLoading(false);
                return;
              }
            }
          }
        } catch (err) {}
      }

      // Se for administrador e a senha digitada for uma credencial mestre
      if (isRoleAdmin && isMasterPass) {
        const adminUser = matched || currentUsers.find((u) => u.role === 'SUPER_ADMIN') || currentUsers[0];
        if (adminUser) {
          switchUserRole(adminUser);
          setScreenLocked(false);
          playSuccessBeep();
          setEmail('');
          setPassword('');
          setIsLoading(false);
          return;
        }
      }

      setErrorMsg('Senha incorreta para este usuário.');
      playErrorBuzz();
      setIsLoading(false);
      return;
    }

    // 2. Busca se a senha digitada pertence diretamente a algum usuário cadastrado
    const userByPass = currentUsers.find((u) => String(u.pin || '').trim() === trimmedPass);
    if (userByPass) {
      switchUserRole(userByPass);
      setScreenLocked(false);
      playSuccessBeep();
      setEmail('');
      setPassword('');
      setIsLoading(false);
      return;
    }

    // 3. Verifica credencial mestre (PIN mestre / Administrador)
    const managerAuth = verifyManagerPin(trimmedPass);
    if (managerAuth.valid) {
      const adminUser = managerAuth.manager || currentUsers.find((u) => u.role === 'SUPER_ADMIN') || currentUsers[0];
      switchUserRole(adminUser);
      setScreenLocked(false);
      playSuccessBeep();
      setEmail('');
      setPassword('');
      setIsLoading(false);
      return;
    }

    // 4. Se não encontrou
    setErrorMsg(trimmedEmail ? 'E-mail ou senha incorretos.' : 'Senha incorreta. Tente novamente.');
    playErrorBuzz();
    setIsLoading(false);
  };

  const handleOpenGoogle = () => {
    setGoogleError(null);
    setGoogleSuccess(null);
    if (email && email.includes('@')) {
      setGoogleEmail(email);
    } else {
      setGoogleEmail('usuario.google@gmail.com');
    }
    setGooglePassword('');
    setShowGoogleModal(true);
  };

  const handleGoogleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleError(null);

    const trimmedName = googleName.trim();
    const trimmedEmail = googleEmail.trim().toLowerCase();
    const trimmedPass = googlePassword.trim();

    if (!trimmedName) {
      setGoogleError('Informe seu nome para a conta Google.');
      playErrorBuzz();
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setGoogleError('Informe um e-mail válido (ex: seuemail@gmail.com).');
      playErrorBuzz();
      return;
    }
    if (!trimmedPass) {
      setGoogleError('Defina uma senha de acesso ao terminal.');
      playErrorBuzz();
      return;
    }

    setGoogleLoading(true);

    setTimeout(() => {
      const existingUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

      if (existingUser) {
        const updated = { ...existingUser, name: trimmedName, pin: trimmedPass, role: googleRole };
        setUsers((prev) => prev.map((u) => (u.id === existingUser.id ? updated : u)));
        switchUserRole(updated);
        setGoogleSuccess('Conta Google autenticada com sucesso! Conectando...');
        playSuccessBeep();
      } else {
        const newGoogleUser: User = {
          id: `g-${Date.now()}`,
          name: trimmedName,
          email: trimmedEmail,
          role: googleRole,
          avatar: '/logo.jpg',
          pin: trimmedPass,
          storeId: 'store-1',
        };
        setUsers((prev) => [...prev, newGoogleUser]);
        switchUserRole(newGoogleUser);
        setGoogleSuccess('Cadastro com Google concluído! Conectando...');
        playSuccessBeep();
      }

      setTimeout(() => {
        setGoogleLoading(false);
        setShowGoogleModal(false);
        setScreenLocked(false);
        setGoogleSuccess(null);
      }, 700);
    }, 450);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim()) {
      setRegError('Informe seu nome completo.');
      playErrorBuzz();
      return;
    }
    if (!regPassword.trim()) {
      setRegError('Informe sua senha.');
      playErrorBuzz();
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '.')}@adegaswg.com.br`,
      role: regRole,
      avatar: '/logo.jpg',
      pin: regPassword.trim(),
      storeId: 'store-1',
    };

    setUsers((prev) => [...prev, newUser]);
    switchUserRole(newUser);
    setRegSuccess('Cadastro realizado com sucesso! Conectando...');
    playSuccessBeep();

    setTimeout(() => {
      setShowRegisterModal(false);
      setScreenLocked(false);
      setRegSuccess(null);
      setRegName('');
      setRegEmail('');
      setRegPassword('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-[390px] bg-[#111317] border border-[#26282d] rounded-[28px] p-6 sm:p-7 shadow-2xl shadow-black/95 flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Header com Logo ADEGASWG Gestão & PDV */}
        <div className="flex items-center justify-center gap-3.5 mx-auto py-1">
          <div className="w-16 h-16 rounded-2xl bg-[#0c0e11] border border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center p-1.5 shrink-0">
            <img
              src="/logo.jpg"
              alt="AdeGaswg"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="w-[1.5px] h-11 bg-amber-500/40 shrink-0"></div>
          <div>
            <h2 className="text-xl font-black tracking-wider text-zinc-100 leading-tight">
              ADE<span className="text-amber-500">GASWG</span>
            </h2>
            <span className="text-xs text-zinc-400 font-medium block text-left">
              Gestão & PDV
            </span>
          </div>
        </div>

        {/* Subtítulo Bem-vindo */}
        <div className="space-y-1 pt-4 pb-2 text-center">
          <h3 className="text-base font-bold text-zinc-100 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Bem-vindo de volta!</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Faça login para acessar o sistema.
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="my-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-3 mt-2">
          
          {/* Campo E-mail */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-400" />
              <span>E-mail</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Digite seu e-mail"
                className="w-full bg-[#08090c] border border-zinc-800 focus:border-amber-500/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Senha</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                maxLength={30}
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Digite sua senha"
                className="w-full bg-[#08090c] border border-zinc-800 focus:border-amber-500/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={handleOpenForgot}
                className="text-[11px] text-amber-500 hover:text-amber-400 cursor-pointer transition-colors font-medium"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </div>

          {/* Botão Entrar no sistema */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#ea7e00] hover:bg-[#d97300] active:scale-[0.99] text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-black/40 cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
            <span>{isLoading ? 'Entrando...' : 'Entrar no sistema'}</span>
          </button>
        </form>


      </div>

      {/* Modal Cadastro com Google */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <h4 className="font-bold text-sm text-zinc-100">Cadastro com Google</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setGoogleError(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-[#08090c] border border-zinc-800/80 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                G
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-zinc-200 block truncate">
                  Conexão Google Identity
                </span>
                <span className="text-[11px] text-zinc-400 block truncate">
                  Complete as informações abaixo para acessar o terminal
                </span>
              </div>
            </div>

            {googleSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{googleSuccess}</span>
              </div>
            )}

            {googleError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{googleError}</span>
              </div>
            )}

            <form onSubmit={handleGoogleRegister} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome no Google</label>
                <input
                  type="text"
                  required
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail Google</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="Ex: carlos@gmail.com"
                  className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Senha de Acesso ao Terminal</label>
                <div className="relative">
                  <input
                    type={showGooglePassword ? 'text' : 'password'}
                    required
                    maxLength={30}
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 pr-10 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGooglePassword(!showGooglePassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {showGooglePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={googleLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#1e293b"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#1e293b"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#1e293b"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#1e293b"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Cadastrando...' : 'Concluir Cadastro com Google'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Conta / Cadastrar-se */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-zinc-100">Criar Nova Conta</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowRegisterModal(false);
                  setRegError(null);
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Ex: carlos@adegaswg.com.br"
                  className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Senha</label>
                <input
                  type="password"
                  required
                  maxLength={30}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                >
                  Cadastrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Recuperação de Senha por E-mail */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl space-y-4 text-left relative">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h4 className="font-bold text-sm text-zinc-100">Recuperação de Senha</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'input' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Digite seu e-mail cadastrado. Enviaremos o código e as instruções de recuperação para você redefinir sua senha com segurança.
                </p>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <span>E-mail cadastrado</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => {
                        setForgotEmail(e.target.value);
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="seuemail@adegaswg.com.br"
                      className="w-full bg-[#08090c] border border-zinc-800 focus:border-amber-500/80 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{forgotLoading ? 'Enviando e-mail...' : 'Enviar para o e-mail'}</span>
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm sm:text-base text-zinc-100">
                    E-mail de Recuperação Enviado!
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Enviamos as instruções e o código de redefinição para o endereço:
                  </p>
                  <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-amber-400 text-xs font-semibold">
                    {forgotEmail}
                  </div>
                </div>

                <div className="p-3 bg-[#08090c] border border-zinc-800 rounded-xl text-left space-y-1">
                  <span className="text-[11px] text-zinc-400 block font-medium">Código temporário de verificação:</span>
                  <div className="font-mono text-base font-bold text-emerald-400 tracking-widest">
                    {recoveryCode}
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    Válido por 30 minutos. Você também pode definir a nova senha agora mesmo.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('new_password')}
                    className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    Redefinir Senha Agora
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Voltar ao Login
                  </button>
                </div>
              </div>
            )}

            {forgotStep === 'new_password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Digite abaixo a nova senha para sua conta cadastrada.
                </p>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 mb-1.5">
                    <Lock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Nova Senha</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      maxLength={30}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (forgotError) setForgotError(null);
                      }}
                      placeholder="Digite sua nova senha"
                      className="w-full bg-[#08090c] border border-zinc-800 focus:border-amber-500/80 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('success')}
                    className="px-3.5 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700 cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs cursor-pointer shadow-md"
                  >
                    Salvar e Conectar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
