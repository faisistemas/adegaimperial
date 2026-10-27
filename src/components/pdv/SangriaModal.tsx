import React, { useState } from 'react';
import { ArrowDownCircle, X, ShieldAlert, CheckCircle2, Printer, AlertTriangle } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { generateCashMovementThermalReceipt, playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';
import { CashMovement } from '../../types';

interface SangriaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SangriaModal: React.FC<SangriaModalProps> = ({ isOpen, onClose }) => {
  const { cashSession, performSangria, activeStore, users } = useAdega();

  const [amount, setAmount] = useState<string>('100.00');
  const [reason, setReason] = useState<string>('Recolhimento para cofre central (Sangria preventiva)');
  const [managerPin, setManagerPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [completedMovement, setCompletedMovement] = useState<CashMovement | null>(null);

  if (!isOpen) return null;

  const currentCash = cashSession.currentCash;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Informe um valor válido para a sangria.');
      playErrorBuzz();
      return;
    }

    if (val > currentCash) {
      setError(`Valor superior ao saldo em dinheiro disponível (Saldo: R$ ${currentCash.toFixed(2)}).`);
      playErrorBuzz();
      return;
    }

    if (!managerPin) {
      setError('O PIN de Gerente ou Super Admin é obrigatório para autorizar a sangria!');
      playErrorBuzz();
      return;
    }

    const result = performSangria(val, reason, managerPin);
    if (!result.success) {
      setError(result.error || 'Erro ao realizar sangria.');
      playErrorBuzz();
      return;
    }

    playSuccessBeep();
    if (result.movement) {
      setCompletedMovement(result.movement);
    }
  };

  const handleClose = () => {
    setCompletedMovement(null);
    setAmount('100.00');
    setManagerPin('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Sangria de Caixa [F2]</h3>
              <p className="text-[11px] text-zinc-400">Retirada de Dinheiro com Autorização de Gerência</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-zinc-400 hover:text-zinc-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {completedMovement ? (
          /* Receipt / Confirmation Screen */
          <div className="p-5 space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/40 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-emerald-300">Sangria Realizada com Sucesso!</h4>
              <p className="text-xs text-zinc-300 mt-1 font-mono">
                Valor Retirado: <strong className="text-emerald-300">R$ {completedMovement.valor.toFixed(2)}</strong>
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Autorizado por: {completedMovement.managerAuthorizedName}
              </p>
            </div>

            {/* Thermal Voucher Preview */}
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
                  alert('Comprovante de Sangria enviado para a impressora térmica 80mm.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Reimprimir Comprovante</span>
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
          /* Input Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Drawer Cash Info */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-zinc-400">Saldo em Dinheiro na Gaveta:</span>
                <p className="font-mono font-bold text-lg text-emerald-400">R$ {currentCash.toFixed(2)}</p>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono">
                Gaveteiro Físico
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Valor da Sangria (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-zinc-500 font-mono">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentCash}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="flex gap-1.5 mt-1.5">
                {[50, 100, 200, 500].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(v.toFixed(2))}
                    className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-[11px] font-mono text-zinc-300 border border-zinc-700"
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Motivo / Justificativa
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="Recolhimento para cofre central (Sangria preventiva)">
                  Recolhimento para cofre central (Preventiva)
                </option>
                <option value="Pagamento de fornecedor de gelo / emergencial">
                  Pagamento de fornecedor de gelo / emergência
                </option>
                <option value="Pagamento adiantado de diária de motoboy">
                  Adiantamento de diária de motoboy
                </option>
                <option value="Excesso de numerário no gaveteiro de atendimento">
                  Excesso de numerário no gaveteiro
                </option>
              </select>
            </div>

            {/* Manager PIN Authentication */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">Autorização Obrigatória da Gerência</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Digite a senha de um Gerente ou Super Admin para autorizar a sangria.
              </p>
              <input
                type="password"
                value={managerPin}
                onChange={(e) => setManagerPin(e.target.value)}
                placeholder="Senha de Autorização"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-center font-mono font-bold tracking-widest text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-confirm-sangria"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-zinc-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-rose-600/20"
              >
                <ArrowDownCircle className="w-4 h-4" />
                <span>Confirmar Sangria</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
