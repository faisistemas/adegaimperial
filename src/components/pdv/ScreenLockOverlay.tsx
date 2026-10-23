import React, { useState, useEffect } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
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

  if (!isScreenLocked) return null;

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

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        {/* Logo & Time */}
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-amber-500/40 shadow-xl shadow-amber-950/60 mx-auto bg-zinc-950 ring-1 ring-amber-500/25">
            <img
              src="/logo.jpg"
              alt="Adega Imperial"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-2xl font-mono font-bold text-zinc-100 flex items-center justify-center gap-1.5 pt-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{currentTime}</span>
          </div>
          <p className="text-xs text-zinc-400">Terminal Bloqueado por Segurança</p>
        </div>

        {/* Current Operator Card */}
        <div className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-amber-500/50"
          />
          <div className="text-left min-w-0 flex-1">
            <div className="text-xs font-bold text-zinc-100 truncate">{currentUser.name}</div>
            <div className="text-[11px] text-amber-400 font-medium truncate">{currentUser.role}</div>
            <div className="text-[10px] text-zinc-500">Terminal: Caixa 01 • Sessão Ativa</div>
          </div>
        </div>

        {/* Masked PIN Display */}
        <div className="space-y-1.5">
          <div className="flex justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const filled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    filled
                      ? 'bg-amber-400 border-amber-400 scale-110 shadow-sm shadow-amber-400/50'
                      : 'border-zinc-700 bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>
          {error ? (
            <p className="text-[11px] text-rose-400 font-medium">{error}</p>
          ) : (
            <p className="text-[11px] text-zinc-500">Digite o PIN do operador ou gerente</p>
          )}
        </div>

        {/* Touch Keypad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 active:scale-95 text-base font-mono font-bold text-zinc-200 transition-all shadow-sm"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 active:scale-95 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 active:scale-95 text-base font-mono font-bold text-zinc-200 transition-all shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 active:scale-95 text-xs font-semibold text-zinc-400 hover:text-zinc-200 flex items-center justify-center transition-all"
          >
            <Delete className="w-4 h-4" />
          </button>
        </div>

        {/* Unlock Button */}
        <button
          type="button"
          id="btn-unlock-screen"
          onClick={handleUnlock}
          disabled={pin.length < 4}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Desbloquear Terminal</span>
        </button>
      </div>
    </div>
  );
};
