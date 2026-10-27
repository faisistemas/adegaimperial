import React, { useState, useEffect } from 'react';
import { Delete, ShieldCheck, Clock } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';

export const ScreenLockOverlay: React.FC = () => {
  const { isScreenLocked, unlockScreen, currentUser } = useAdega();
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  const handleUnlock = () => {
    if (pin.length !== 4) {
      setError('O PIN deve conter 4 dígitos.');
      playErrorBuzz();
      return;
    }

    const result = unlockScreen(pin);
    if (result.success) {
      playSuccessBeep();
      setPin('');
      setError(null);
    } else {
      playErrorBuzz();
      setError(result.message || 'PIN incorreto.');
      setPin('');
    }
  };

  // Keyboard navigation for PIN entry
  useEffect(() => {
    if (!isScreenLocked) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleUnlock();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScreenLocked, pin]);

  if (!isScreenLocked) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-[360px] bg-[#16181b] border border-[#26282d] rounded-[32px] p-6 sm:p-7 shadow-2xl shadow-black/90 text-center flex flex-col">
        {/* Glowing Top Logo */}
        <div className="w-16 h-16 rounded-2xl bg-[#0c0e11] border border-amber-500/70 shadow-[0_0_22px_rgba(245,158,11,0.25)] flex items-center justify-center p-1.5 mx-auto">
          <img
            src="/logo.jpg"
            alt="AdeGaswg"
            className="w-full h-full object-contain rounded-xl"
          />
        </div>

        {/* Digital Time & Status Subtitle */}
        <div className="mt-3.5 space-y-1">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-white tracking-wide">
            <Clock className="w-5 h-5 text-amber-400 stroke-[2.5]" />
            <span>{currentTime}</span>
          </div>
          <p className="text-xs text-zinc-400 font-normal">Terminal Bloqueado por Segurança</p>
        </div>

        {/* User Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-[#0e1013] border border-zinc-800/80 flex items-center gap-3.5 text-left">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-500/60 bg-zinc-950 shrink-0 p-0.5">
            <img
              src={currentUser?.avatar || '/logo.jpg'}
              alt={currentUser?.name || 'Administrador'}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate leading-snug">
              {currentUser?.name || 'Administrador'}
            </div>
            <div className="text-xs font-semibold text-amber-500 tracking-wider">
              {currentUser?.role || 'SUPER_ADMIN'}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">Terminal: Caixa 01 • Sessão Ativa</div>
          </div>
        </div>

        {/* Masked PIN Display */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-center gap-3.5 py-1">
            {[0, 1, 2, 3].map((idx) => {
              const filled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all duration-150 ${
                    filled
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                      : 'border-zinc-700 bg-zinc-800/60'
                  }`}
                />
              );
            })}
          </div>
          {error ? (
            <p className="text-xs text-rose-400 font-medium">{error}</p>
          ) : (
            <p className="text-xs text-zinc-400">Digite o PIN do operador ou gerente</p>
          )}
        </div>

        {/* Touch Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="h-12 sm:h-13 py-3 rounded-2xl bg-[#0e1013] hover:bg-zinc-800/90 border border-zinc-800/90 active:scale-95 text-lg font-bold text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 sm:h-13 py-3 rounded-2xl bg-[#0e1013] hover:bg-zinc-800/90 border border-zinc-800/90 active:scale-95 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center cursor-pointer"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-12 sm:h-13 py-3 rounded-2xl bg-[#0e1013] hover:bg-zinc-800/90 border border-zinc-800/90 active:scale-95 text-lg font-bold text-white transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 sm:h-13 py-3 rounded-2xl bg-[#0e1013] hover:bg-zinc-800/90 border border-zinc-800/90 active:scale-95 text-zinc-400 hover:text-zinc-200 transition-all flex items-center justify-center cursor-pointer"
            title="Apagar dígito"
            aria-label="Apagar dígito"
          >
            <Delete className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Desbloquear Terminal Button */}
        <button
          type="button"
          id="btn-unlock-screen"
          onClick={handleUnlock}
          className="w-full mt-4 py-3 sm:py-3.5 rounded-2xl bg-[#85581b] hover:bg-[#976420] active:scale-[0.99] border border-amber-500/30 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-black/40 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-zinc-950 stroke-[2.5]" />
          <span>Desbloquear Terminal</span>
        </button>
      </div>
    </div>
  );
};
