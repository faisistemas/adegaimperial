import React, { useState } from 'react';
import { 
  X, Lock, Mail, LogIn, UserPlus, Eye, EyeOff, 
  Crown, AlertCircle, CheckCircle2, ShieldCheck, ArrowRight,
  Sparkles, Wine, KeyRound, Send
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { User, UserRole } from '../../types';

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoginPortalModal: React.FC<LoginPortalModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { users, switchUserRole, setUsers, currentUser } = useAdega();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modais de Apoio: Criar Conta e Esqueceu Senha
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Estados para o modal Recuperação de Senha por E-mail
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'success' | 'new_password'>('input');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setRecoveryCode(code);
      setForgotLoading(false);
      setForgotStep('success');
    }, 500);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPassword.trim();
    if (!trimmed) {
      setForgotError('Por favor, digite a nova senha.');
      return;
    }

    const trimmedEmail = forgotEmail.trim().toLowerCase();
    const matchedUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (matchedUser) {
      const updatedUser = { ...matchedUser, pin: trimmed };
      setUsers((prev) => prev.map((u) => (u.id === matchedUser.id ? updatedUser : u)));
      switchUserRole(updatedUser);
    }

    setShowForgotModal(false);
    setPassword(trimmed);
    setErrorMsg(null);
  };

  // Estado Cadastro Rápido (Criar conta)
  const [regName, setRegName] = useState('');
  const [regCpfCnpj, setRegCpfCnpj] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('STORE_MANAGER');
  const [regSuccess, setRegSuccess] = useState('');
  const [regError, setRegError] = useState('');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      const trimmed = email.trim().toLowerCase();
      // Encontra usuário correspondente por e-mail, nome ou cargo
      const matched = users.find(
        (u) =>
          u.email.toLowerCase() === trimmed ||
          u.name.toLowerCase().includes(trimmed) ||
          u.role.toLowerCase() === trimmed
      );

      if (matched) {
        switchUserRole(matched);
        setIsLoading(false);
        onLoginSuccess();
      } else if (email.length >= 2) {
        // Fallback demo: conecta como Administrador padrão se preencheu
        const adminUser = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
        switchUserRole(adminUser);
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setErrorMsg('Por favor, informe seu e-mail e senha de acesso.');
        setIsLoading(false);
      }
    }, 500);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      // Login direto simulado Google OAuth com Administrador
      const adminUser = users.find((u) => u.role === 'SUPER_ADMIN') || users[0];
      switchUserRole(adminUser);
      setIsLoading(false);
      onLoginSuccess();
    }, 600);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim()) {
      setRegError('Informe seu nome completo.');
      return;
    }
    if (!regPin.trim()) {
      setRegError('Informe a senha.');
      return;
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: regName.trim(),
      email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '.')}@adegaswg.com.br`,
      cpfCnpj: regCpfCnpj.trim(),
      phone: regPhone.trim(),
      whatsapp: regWhatsapp.trim(),
      role: regRole,
      pin: regPin.trim(),
      avatar: '/logo.jpg',
      storeId: currentUser.storeId || 'store-1',
    };

    setUsers((prev) => [...prev, newUser]);
    switchUserRole(newUser);
    setRegSuccess('Conta criada com sucesso! Conectando...');

    setTimeout(() => {
      setShowRegisterModal(false);
      onLoginSuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row min-h-[580px] max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar no canto superior direito */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 rounded-full text-zinc-400 hover:text-white bg-black/60 hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-800"
          title="Fechar janela"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LADO ESQUERDO: Card do Formulário de Acesso */}
        <div className="w-full lg:w-[48%] p-6 sm:p-8 md:p-10 flex flex-col justify-between bg-[#0e1015] border-r border-zinc-800/80 overflow-y-auto">
          
          <div className="space-y-6">
            {/* 1. Header com Logo AdeGaswg (Centralizado) */}
            <div className="flex items-center justify-center gap-3.5 mx-auto py-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-xl shadow-amber-950/50 bg-zinc-950 ring-1 ring-amber-500/30 p-1 shrink-0 flex items-center justify-center">
                <img
                  src="/logo.jpg"
                  alt="AdeGaswg"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="w-[1.5px] h-12 bg-amber-500/40 shrink-0"></div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-wider text-zinc-100 font-serif leading-tight">
                  ADE<span className="text-amber-400">GASWG</span>
                </h2>
                <span className="text-xs sm:text-sm text-zinc-400 font-medium block text-left">
                  Gestão & PDV
                </span>
              </div>
            </div>

            {/* 2. Subtítulo Bem-vindo */}
            <div className="space-y-1 pt-1 text-center">
              <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bem-vindo de volta!</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Faça login para acessar o sistema.
              </p>
            </div>

            {/* Mensagem de Erro */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 3. Formulário de Credenciais */}
            <form onSubmit={handleCustomLogin} className="space-y-4">
              
              {/* Campo E-mail */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>E-mail</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    required
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Senha</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    className="text-[11px] text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              </div>

              {/* Botão Entrar no sistema */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Acessando...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-zinc-950" />
                    <span>Entrar no sistema</span>
                  </>
                )}
              </button>
            </form>

            {/* Divisor OU */}
            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-zinc-800 w-full"></div>
              <span className="bg-[#0e1015] px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-widest absolute">
                OU
              </span>
            </div>

            {/* Botão Entrar com Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#08090c] hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2.5 transition-all cursor-pointer"
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
              <span>Entrar com Google</span>
            </button>
          </div>

          {/* 4. Footer: Ainda não tem uma conta? Criar conta */}
          <div className="pt-5 mt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
            <span>Ainda não tem uma conta?</span>
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setShowRegisterModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/70 hover:border-amber-400 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-all hover:bg-amber-500/10 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Criar conta</span>
            </button>
          </div>

        </div>

        {/* LADO DIREITO: Foto da Loja AdeGaswg + Citação */}
        <div 
          className="hidden lg:flex lg:w-[52%] relative bg-cover bg-center overflow-hidden flex-col justify-end p-8 sm:p-12 select-none"
          style={{
            backgroundImage: `url('/adega-store-login-bg.jpg')`,
            backgroundPosition: 'center right',
          }}
        >
          {/* Sombra e Vinheta Gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30 pointer-events-none" />

          {/* Citação no Canto Inferior */}
          <div className="relative z-10 text-center max-w-sm mx-auto space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-amber-400">
              <Wine className="w-5 h-5 text-amber-400" />
            </div>
            <div className="w-52 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto"></div>
            <p className="text-zinc-100 font-serif text-xs sm:text-sm font-bold tracking-widest uppercase">
              GRANDES MOMENTOS
            </p>
            <p className="text-zinc-200 font-serif text-[11px] sm:text-xs font-semibold tracking-widest uppercase">
              COMEÇAM COM BOAS ESCOLHAS
            </p>
            <div className="w-24 h-[1.5px] bg-amber-400 mx-auto mt-2"></div>
          </div>
        </div>

      </div>

      {/* Modal Criar Conta (Cadastro Rápido) */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-sm text-zinc-100">Criar Nova Conta</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {regSuccess && (
              <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{regSuccess}</span>
              </div>
            )}

            {regError && (
              <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: Carlos Oliveira"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    value={regCpfCnpj}
                    onChange={(e) => setRegCpfCnpj(e.target.value)}
                    placeholder="000.000.000-00 ou CNPJ"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Ex: carlos@adegaswg.com.br"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(11) 3333-3333"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Cargo / Função</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none cursor-pointer"
                  >
                    <option value="STORE_MANAGER">Gerente de Loja</option>
                    <option value="CASHIER">Operador de Caixa</option>
                    <option value="WAITER">Atendente / Garçom</option>
                    <option value="SUPER_ADMIN">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Senha</label>
                  <input
                    type="password"
                    required
                    maxLength={30}
                    value={regPin}
                    onChange={(e) => {
                      setRegPin(e.target.value);
                      if (regError) setRegError('');
                    }}
                    placeholder=""
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                  />
                </div>
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
                  Confirmar Cadastro
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
