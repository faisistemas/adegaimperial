import React, { useState } from 'react';
import { Lock, X, CheckCircle2, AlertTriangle, Printer, DollarSign, CreditCard, QrCode } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { generateBlindCloseThermalReport, playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';
import { CashBlindCloseRecord } from '../../types';

interface BlindCashCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionClosed?: () => void;
}

export const BlindCashCloseModal: React.FC<BlindCashCloseModalProps> = ({ 
  isOpen, 
  onClose,
  onSessionClosed 
}) => {
  const { cashSession, performBlindClose, activeStore, currentUser } = useAdega();

  const [declaredCash, setDeclaredCash] = useState<string>('');
  const [declaredCredit, setDeclaredCredit] = useState<string>('');
  const [declaredDebit, setDeclaredDebit] = useState<string>('');
  const [declaredPix, setDeclaredPix] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [closeRecord, setCloseRecord] = useState<CashBlindCloseRecord | null>(null);

  if (!isOpen) return null;

  const handleAuditAndClose = (e: React.FormEvent) => {
    e.preventDefault();

    const cash = parseFloat(declaredCash) || 0;
    const credit = parseFloat(declaredCredit) || 0;
    const debit = parseFloat(declaredDebit) || 0;
    const pix = parseFloat(declaredPix) || 0;

    const record = performBlindClose({
      cash,
      credit,
      debit,
      pix,
      notes: notes.trim() || undefined,
    });

    if (record.statusConfronto === 'EXATO' || record.statusConfronto === 'SOBRA') {
      playSuccessBeep();
    } else {
      playErrorBuzz();
    }

    setCloseRecord(record);
    if (onSessionClosed) onSessionClosed();
  };

  const handleFinish = () => {
    setCloseRecord(null);
    setDeclaredCash('');
    setDeclaredCredit('');
    setDeclaredDebit('');
    setDeclaredPix('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Fechamento Cego de Caixa</h3>
              <p className="text-[11px] text-zinc-400">
                Auditoria de Turno | Operador: <strong className="text-zinc-200">{currentUser.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {closeRecord ? (
          /* Confrontation & Audit Report Screen */
          <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className={`p-4 rounded-xl border text-center ${
              closeRecord.statusConfronto === 'EXATO'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : closeRecord.statusConfronto === 'SOBRA'
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              {closeRecord.statusConfronto === 'EXATO' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              ) : (
                <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-2" />
              )}
              <h4 className="font-bold text-sm uppercase tracking-wide">
                {closeRecord.statusConfronto === 'EXATO'
                  ? 'Fechamento Exato (Sem Divergências)'
                  : closeRecord.statusConfronto === 'SOBRA'
                  ? `Sobra de Caixa (+ R$ ${Math.abs(closeRecord.diferencaTotal).toFixed(2)})`
                  : `Quebra de Caixa (- R$ ${Math.abs(closeRecord.diferencaTotal).toFixed(2)})`}
              </h4>
              <p className="text-xs text-zinc-300 mt-1">
                Turno encerrado. Os valores foram confrontados com o sistema.
              </p>
            </div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Contagem Declarada
                </span>
                <div className="space-y-1 font-mono text-zinc-300">
                  <div className="flex justify-between">
                    <span>Dinheiro:</span>
                    <span>R$ {closeRecord.declaradoDinheiro.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crédito:</span>
                    <span>R$ {closeRecord.declaradoCartaoCredito.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Débito:</span>
                    <span>R$ {closeRecord.declaradoCartaoDebito.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PIX:</span>
                    <span>R$ {closeRecord.declaradoPix.toFixed(2)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-800 font-bold text-amber-300 flex justify-between">
                    <span>Total:</span>
                    <span>R$ {closeRecord.totalDeclarado.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Apurado no Sistema
                </span>
                <div className="space-y-1 font-mono text-zinc-300">
                  <div className="flex justify-between">
                    <span>Dinheiro:</span>
                    <span>R$ {closeRecord.sistemaDinheiro.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Crédito:</span>
                    <span>R$ {closeRecord.sistemaCartaoCredito.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Débito:</span>
                    <span>R$ {closeRecord.sistemaCartaoDebito.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PIX:</span>
                    <span>R$ {closeRecord.sistemaPix.toFixed(2)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-zinc-800 font-bold text-emerald-300 flex justify-between">
                    <span>Total:</span>
                    <span>R$ {closeRecord.totalSistema.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Thermal Audit Voucher Preview */}
            <div className="p-3 rounded-xl bg-amber-50 text-zinc-900 font-mono text-[10px] leading-relaxed max-h-40 overflow-y-auto border-t-2 border-dashed border-zinc-400">
              <pre className="whitespace-pre-wrap font-mono">
                {generateBlindCloseThermalReport(closeRecord, activeStore, 'Caixa 01')}
              </pre>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playSuccessBeep();
                  alert('Relatório de Fechamento Cego enviado para a impressora térmica 80mm.');
                }}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Imprimir Extrato</span>
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
              >
                Finalizar e Sair
              </button>
            </div>
          </div>
        ) : (
          /* Blind Count Form */
          <form onSubmit={handleAuditAndClose} className="p-5 space-y-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                <strong>Procedimento Cego:</strong> Conte o dinheiro físico da gaveta e os comprovantes de maquininha e digite os totais abaixo. Os valores apurados pelo sistema só serão revelados no relatório de confronto final.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Total em Dinheiro Físico (Contado na Gaveta)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-zinc-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={declaredCash}
                    onChange={(e) => setDeclaredCash(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                    <span>Cartão Crédito (TEF/POS)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-zinc-500 font-mono">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={declaredCredit}
                      onChange={(e) => setDeclaredCredit(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cartão Débito (TEF/POS)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-zinc-500 font-mono">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={declaredDebit}
                      onChange={(e) => setDeclaredDebit(e.target.value)}
                      placeholder="0,00"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PIX Conferido no Extrato</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-zinc-500 font-mono">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={declaredPix}
                    onChange={(e) => setDeclaredPix(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-100 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Observações do Operador (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Justificativa de divergências, ocorrências do turno..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700"
              >
                Voltar
              </button>
              <button
                type="submit"
                id="btn-confirm-blind-close"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-amber-500/20"
              >
                <Lock className="w-4 h-4" />
                <span>Auditar & Fechar Caixa</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
