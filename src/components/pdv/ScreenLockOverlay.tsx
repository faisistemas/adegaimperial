import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, ShieldCheck, UserPlus, X, CheckCircle2 } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';
import { User, UserRole } from '../../types';

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

  if (!isScreenLocked) return null;

  const handleLogin = (e: React.FormEvent) => {
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

    setTimeout(() => {
      // 1. Se informou e-mail ou nome de usuário
      if (trimmedEmail) {
        const matched = users.find(
          (u) =>
            u.email.toLowerCase() === trimmedEmail ||
            u.name.toLowerCase() === trimmedEmail ||
            u.role.toLowerCase() === trimmedEmail ||
            (u.id && u.id.toLowerCase() === trimmedEmail)
        );

        if (matched) {
          if (matched.pin === trimmedPass || verifyManagerPin(trimmedPass).valid) {
            switchUserRole(matched);
            setScreenLocked(false);
            playSuccessBeep();
            setEmail('');
            setPassword('');
            setIsLoading(false);
            return;
          } else {
            setErrorMsg('Senha incorreta para este usuário.');
            playErrorBuzz();
            setIsLoading(false);
            return;
          }
        }
      }

      // 2. Busca se a senha digitada pertence diretamente a algum usuário cadastrado
      const userByPass = users.find((u) => u.pin === trimmedPass);
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
        const adminUser = managerAuth.manager || users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
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
    }, 350);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setErrorMsg(null);
    setTimeout(() => {
      const adminUser = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
      switchUserRole(adminUser);
      setScreenLocked(false);
      playSuccessBeep();
      setIsLoading(false);
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
                onClick={() => setShowForgotModal(true)}
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

        {/* Divisor: ou continue pelo Google */}
        <div className="relative flex items-center justify-center my-3.5">
          <div className="border-t border-zinc-800 w-full"></div>
          <span className="bg-[#111317] px-2.5 text-[11px] font-medium text-zinc-500 uppercase tracking-wider absolute">
            ou continue pelo Google
          </span>
        </div>

        {/* Botão Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#08090c] hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
          <span>Continuar pelo Google</span>
        </button>

        {/* Rodapé: Cadastrar-se */}
        <div className="pt-3 mt-3 border-t border-zinc-800/60 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <span>Não tem uma conta?</span>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              setShowRegisterModal(true);
            }}
            className="text-amber-500 hover:text-amber-400 font-bold hover:underline cursor-pointer transition-colors"
          >
            Cadastrar-se
          </button>
        </div>
      </div>

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
                <label className="text-xs text-zinc-400 block mb-1">Função / Cargo</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-[#08090c] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none cursor-pointer"
                >
                  <option value="STORE_MANAGER">Gerente de Loja</option>
                  <option value="CASHIER">Operador de Caixa</option>
                  <option value="WAITER">Garçom</option>
                  <option value="SUPER_ADMIN">Administrador</option>
                </select>
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

      {/* Modal Esqueceu a Senha */}
      {showForgotModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#111317] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-zinc-100">Recuperação de Acesso</h4>
              <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                Para redefinir sua senha, solicite ao <strong>Administrador da Loja</strong> na janela de <em>Gestão de Usuários</em> ou utilize a senha mestre de Administrador (PIN: <strong>1234</strong>).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
