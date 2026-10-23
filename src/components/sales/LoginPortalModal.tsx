import React, { useState } from 'react';
import { 
  X, Lock, User, KeyRound, ArrowRight, ShieldCheck, 
  Wine, CheckCircle2, AlertCircle, Sparkles, LogIn
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { User as UserType } from '../../types';

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
  const { users, switchUserRole, currentUser } = useAdega();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      // Find matching user or allow demo credential
      const trimmedUser = username.trim().toLowerCase();
      const matched = users.find(
        (u) => u.name.toLowerCase().includes(trimmedUser) || u.role.toLowerCase() === trimmedUser
      );

      if (matched) {
        switchUserRole(matched);
        setIsLoading(false);
        onLoginSuccess();
      } else if (username.length >= 3 && password.length >= 4) {
        // Fallback demo login as Admin
        switchUserRole(users[0]);
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setErrorMsg('Usuário ou senha inválidos. Utilize os acessos rápidos abaixo ou digite ao menos 3 letras.');
        setIsLoading(false);
      }
    }, 600);
  };

  const handleQuickLogin = (user: UserType) => {
    switchUserRole(user);
    onLoginSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-zinc-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl shadow-amber-950/50 bg-zinc-950 ring-1 ring-amber-500/30 p-0.5">
            <img
              src="/logo.jpg"
              alt="Adega Imperial"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <h3 className="text-xl font-bold font-serif text-zinc-100 tracking-tight">
            Acesso ao Sistema Adega Imperial
          </h3>
          <p className="text-xs text-zinc-400">
            Entre com suas credenciais ou escolha um perfil de demonstração
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 block">
              Usuário ou E-mail
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin@adegaimperial.com.br"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Senha de Acesso
              </label>
              <span className="text-[11px] text-amber-400/80 hover:text-amber-300 cursor-pointer">
                Esqueceu a senha?
              </span>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Conectando...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Access Profiles */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Acesso Rápido de Demonstração
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono">
              1-Clique
            </span>
          </div>

          <div className={`grid ${users.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
            {users.slice(0, 4).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="p-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-left transition-all flex items-center gap-2 group"
              >
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-7 h-7 rounded-lg object-cover border border-zinc-700 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-amber-400 truncate">
                    {u.name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-zinc-500 truncate">
                    {u.role}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Conexão Segura SSL • Sessão Criptografada</span>
        </div>
      </div>
    </div>
  );
};
