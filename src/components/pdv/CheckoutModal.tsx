import React, { useState, useEffect } from 'react';
import { 
  X, QrCode, CreditCard, Banknote, FileSpreadsheet, 
  Check, Copy, CheckCircle2, ShieldCheck, ArrowRight,
  Wifi, Smartphone, AlertCircle, Tag, Gift
} from 'lucide-react';
import { CartItem, PaymentDetails, PaymentMethod } from '../../types';
import { generatePixPayload } from '../../utils/fiscalUtils';
import { useAdega } from '../../context/AdegaContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  onConfirmSale: (payment: PaymentDetails, customerCpf?: string, customerName?: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discount,
  total,
  onConfirmSale,
}) => {
  const { activeStore, customers } = useAdega();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('PIX');
  const [customerCpf, setCustomerCpf] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Dinheiro states
  const [receivedCash, setReceivedCash] = useState<number>(total);
  const changeAmount = Math.max(0, receivedCash - total);

  // TEF states
  const [tefCardBrand, setTefCardBrand] = useState('Mastercard');
  const [tefStep, setTefStep] = useState<'READY' | 'PROCESSING' | 'APPROVED'>('READY');
  const [installments, setInstallments] = useState(1);

  // PIX states
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(300); // 5 min countdown

  useEffect(() => {
    if (isOpen) {
      setReceivedCash(total);
      setTefStep('READY');
      setPixTimeLeft(300);
      setPixCopied(false);
    }
  }, [isOpen, total]);

  useEffect(() => {
    if (!isOpen || selectedMethod !== 'PIX') return;
    const interval = setInterval(() => {
      setPixTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, selectedMethod]);

  if (!isOpen) return null;

  const pixPayload = generatePixPayload(
    activeStore.cnpj.replace(/\D/g, ''),
    activeStore.name,
    activeStore.city,
    total,
    `ADEGA${Date.now().toString().slice(-6)}`
  );

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleProcessTef = () => {
    setTefStep('PROCESSING');
    setTimeout(() => {
      setTefStep('APPROVED');
    }, 1200);
  };

  const handleFinish = () => {
    const paymentDetails: PaymentDetails = {
      method: selectedMethod,
      amount: total,
      receivedAmount: selectedMethod === 'DINHEIRO' ? receivedCash : total,
      change: selectedMethod === 'DINHEIRO' ? changeAmount : 0,
      pixTxId: selectedMethod === 'PIX' ? `TX-${Date.now().toString().slice(-8)}` : undefined,
      tefAuthorizationCode: selectedMethod.startsWith('TEF') ? `AUT-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      tefCardBrand: selectedMethod.startsWith('TEF') ? tefCardBrand : undefined,
      installments: selectedMethod === 'TEF_CREDITO' ? installments : 1,
    };

    onConfirmSale(paymentDetails, customerCpf || undefined, customerName || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-zinc-100 font-serif">Checkout & Pagamento Frente de Caixa</h3>
              <p className="text-xs text-zinc-400">Total a Pagar: <strong className="text-emerald-400 text-sm">R$ {total.toFixed(2)}</strong></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* Method Selection Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode, color: 'text-emerald-400' },
              { id: 'TEF_CREDITO', label: 'Cartão Crédito', icon: CreditCard, color: 'text-blue-400' },
              { id: 'TEF_DEBITO', label: 'Cartão Débito', icon: CreditCard, color: 'text-cyan-400' },
              { id: 'DINHEIRO', label: 'Dinheiro', icon: Banknote, color: 'text-amber-400' },
              { id: 'VOUCHER', label: 'Voucher / Vale', icon: Tag, color: 'text-purple-400' },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = selectedMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMethod(m.id as PaymentMethod)}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/60 text-amber-300 shadow-md ring-1 ring-amber-500/40'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${m.color}`} />
                  <span className="text-[11px] font-bold text-center leading-tight">{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Per Method */}
          {selectedMethod === 'PIX' && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* QR Code Container */}
              <div className="w-36 h-36 sm:w-40 sm:h-40 bg-white p-2 rounded-xl shrink-0 flex flex-col items-center justify-center relative shadow-lg">
                <QrCode className="w-full h-full text-zinc-950" />
                <div className="absolute inset-x-0 bottom-1 text-center font-bold text-[8px] text-zinc-800 bg-white/90">
                  PIX BANCO CENTRAL
                </div>
              </div>

              <div className="flex-1 space-y-3 text-center sm:text-left w-full">
                <div>
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <span className="text-xs font-semibold text-zinc-200">QR Code Dinâmico Gerado</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Instantâneo
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Expira em {Math.floor(pixTimeLeft / 60)}:{(pixTimeLeft % 60).toString().padStart(2, '0')}
                  </p>
                </div>

                <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <p className="text-[10px] text-zinc-400 font-mono truncate">{pixPayload}</p>
                </div>

                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <button
                    onClick={handleCopyPix}
                    className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
                  >
                    {pixCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{pixCopied ? 'Chave Copiada!' : 'Copiar Chave Copia e Cola'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'VOUCHER' && (
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-2 text-purple-400">
                <Gift className="w-4 h-4" />
                <span className="text-xs font-bold text-zinc-200">Pagamento por Voucher / Vale-Presente / Cortesia</span>
              </div>
              <p className="text-xs text-zinc-400">
                O valor total de <strong className="text-purple-300">R$ {total.toFixed(2)}</strong> será quitado com crédito de voucher/fidelidade.
              </p>
              <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-xs text-purple-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Voucher validado com sucesso e saldo suficiente.</span>
              </div>
            </div>
          )}

          {(selectedMethod === 'TEF_CREDITO' || selectedMethod === 'TEF_DEBITO') && (
            <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-zinc-200">Simulador TEF (Pinpad Integrado)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Conectado à Operadora</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Bandeira do Cartão</label>
                  <select
                    value={tefCardBrand}
                    onChange={(e) => setTefCardBrand(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                  >
                    <option value="Mastercard">Mastercard</option>
                    <option value="Visa">Visa</option>
                    <option value="Elo">Elo</option>
                    <option value="American Express">American Express</option>
                    <option value="Alelo / Sodexo">Alelo / Sodexo</option>
                  </select>
                </div>

                {selectedMethod === 'TEF_CREDITO' && (
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">Parcelamento</label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200"
                    >
                      <option value={1}>1x de R$ {total.toFixed(2)} (À vista)</option>
                      <option value={2}>2x de R$ {(total / 2).toFixed(2)}</option>
                      <option value={3}>3x de R$ {(total / 3).toFixed(2)}</option>
                    </select>
                  </div>
                )}

                <div className="flex flex-col justify-end">
                  {tefStep === 'READY' && (
                    <button
                      type="button"
                      onClick={handleProcessTef}
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>Aproximar / Inserir</span>
                    </button>
                  )}
                  {tefStep === 'PROCESSING' && (
                    <div className="text-center py-2 text-xs text-amber-400 animate-pulse font-medium">
                      Processando TEF...
                    </div>
                  )}
                  {tefStep === 'APPROVED' && (
                    <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 font-bold py-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>TEF Aprovado!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'DINHEIRO' && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Valor Recebido do Cliente:</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-zinc-400 font-mono">R$</span>
                  <input
                    type="number"
                    step="1"
                    value={receivedCash}
                    onChange={(e) => setReceivedCash(parseFloat(e.target.value) || 0)}
                    className="w-28 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-amber-400 text-sm"
                  />
                </div>
              </div>

              {/* Quick Banknote Buttons */}
              <div className="flex flex-wrap gap-2">
                {[10, 20, 50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setReceivedCash((prev) => prev + val)}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono font-semibold text-zinc-200"
                  >
                    +{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setReceivedCash(Math.ceil(total / 10) * 10)}
                  className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold"
                >
                  Arredondar
                </button>
              </div>

              {/* Change Indicator */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">Troco a Devolver:</span>
                <span className={`font-mono font-black text-lg ${changeAmount > 0 ? 'text-amber-300' : 'text-zinc-400'}`}>
                  R$ {changeAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Consumer Identification (CPF na Nota - Fiscal Brasil & CRM) */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-zinc-300 flex items-center gap-1.5">
                <span>Vincular Cliente / CPF na Nota Fiscal</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded border border-amber-500/30">CRM Adega</span>
              </label>
              {selectedCustomerId && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCustomerId('');
                    setCustomerName('');
                    setCustomerCpf('');
                  }}
                  className="text-[10px] text-zinc-400 hover:text-white"
                >
                  Desvincular
                </button>
              )}
            </div>

            {/* Seletor rápido de clientes cadastrados */}
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const custId = e.target.value;
                setSelectedCustomerId(custId);
                const found = customers.find(c => c.id === custId);
                if (found) {
                  setCustomerName(found.name);
                  setCustomerCpf(found.cpf || '');
                } else {
                  setCustomerName('');
                  setCustomerCpf('');
                }
              }}
              className="w-full bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Buscar Cliente Cadastrado (Opcional) --</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.cpf ? `(${c.cpf})` : ''} - Nível {c.nivelFidelidade} (Crédito: R$ {(c.saldoCreditoAtual ?? c.limiteCredito ?? 0).toFixed(2)})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={customerCpf}
                onChange={(e) => setCustomerCpf(e.target.value)}
                placeholder="CPF: 123.456.789-00"
                className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 font-mono"
              />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nome do Cliente (opcional)"
                className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 border border-zinc-800 text-center"
          >
            Cancelar
          </button>
          <button
            type="button"
            id="btn-confirm-final-checkout"
            onClick={handleFinish}
            disabled={selectedMethod.startsWith('TEF') && tefStep !== 'APPROVED'}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              selectedMethod.startsWith('TEF') && tefStep !== 'APPROVED'
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-950/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar e Emitir NFC-e (R$ {total.toFixed(2)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
