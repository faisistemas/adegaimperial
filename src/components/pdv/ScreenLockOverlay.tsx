import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';

export const ScreenLockOverlay: React.FC = () => {
  const { isScreenLocked, setScreenLocked, users, switchUserRole, verifyManagerPin } = useAdega();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);

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
        <form onSubmit={handleLogin} className="space-y-3.5 mt-2">
          
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
      </div>

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
