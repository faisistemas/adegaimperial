import React, { useState } from 'react';
import { ArrowUpCircle, X, CheckCircle2, Printer, Plus } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { generateCashMovementThermalReceipt, playSuccessBeep } from '../../utils/peripheralUtils';
import { CashMovement } from '../../types';

interface SuprimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuprimentoModal: React.FC<SuprimentoModalProps> = ({ isOpen, onClose }) => {
  const { performSuprimento, activeStore, cashSession } = useAdega();

  const [amount, setAmount] = useState<string>('50.00');
  const [reason, setReason] = useState<string>('Reforço de moedas e notas miúdas para troco');
  const [completedMovement, setCompletedMovement] = useState<CashMovement | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    const movement = performSuprimento(val, reason);
    playSuccessBeep();
    setCompletedMovement(movement);
  };

  const handleClose = () => {
    setCompletedMovement(null);
    setAmount('50.00');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Suprimento de Caixa [F3]</h3>
              <p className="text-[11px] text-zinc-400">Entrada de Troco / Reforço de Numerário</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedMovement ? (
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-emerald-300">Suprimento Registrado!</h4>
              <p className="text-xs text-zinc-300 mt-1 font-mono">
                Valor Inserido: <strong className="text-emerald-300">R$ {completedMovement.valor.toFixed(2)}</strong>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Saldo Atual em Dinheiro: R$ {cashSession.currentCash.toFixed(2)}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 text-zinc-900 font-mono text-[10px] leading-relaxed max-h-48 overflow-y-auto border-t-2 border-dashed border-zinc-400">
              <pre className="whitespace-pre-wrap font-mono">
                {generateCashMovementThermalReceipt(completedMovement, activeStore, 'Caixa 01')}
              </pre>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSuccessBeep();
                  alert('Comprovante de Suprimento impresso na impressora térmica.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir Recibo</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Valor do Suprimento (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[20, 50, 100, 200].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v.toFixed(2))}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 border border-zinc-700"
                  >
                    +R$ {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Motivo / Origem do Recurso
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Reforço de moedas e notas miúdas para troco">
                  Reforço de moedas e troco miúdo
                </option>
                <option value="Aporte complementar de início de expediente">
                  Aporte complementar de início de expediente
                </option>
                <option value="Reembolso de despesa miúda não utilizada">
                  Reembolso de despesa miúda
                </option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-confirm-suprimento"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-zinc-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span>Confirmar Entrada</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
