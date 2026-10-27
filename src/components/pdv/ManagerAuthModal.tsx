import React, { useState } from 'react';
import { ShieldAlert, X, Check, Lock } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';

interface ManagerAuthModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onAuthorized: () => void;
  onClose: () => void;
}

export const ManagerAuthModal: React.FC<ManagerAuthModalProps> = ({
  isOpen,
  title,
  description,
  onAuthorized,
  onClose,
}) => {
  const { verifyManagerPin } = useAdega();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const auth = verifyManagerPin(pin);
    if (auth.valid && auth.manager) {
      playSuccessBeep();
      setPin('');
      setError(null);
      onAuthorized();
      onClose();
    } else {
      playErrorBuzz();
      setError('Senha de Gerente ou Super Admin incorreta!');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">{title}</h3>
              <p className="text-[11px] text-zinc-400">Autorização de Nível Superior</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-zinc-300 leading-relaxed">
            {description}
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-400">
              Digite a senha do Gerente / Admin:
            </label>
            <input
              type="password"
              value={pin}
              autoFocus
              onChange={(e) => {
                setPin(e.target.value);
                setError(null);
              }}
              placeholder="••••••••••••"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-center font-mono font-bold tracking-widest text-base text-zinc-100 focus:outline-none focus:border-amber-500"
              required
            />
            {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-confirm-manager-auth"
              className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Autorizar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
