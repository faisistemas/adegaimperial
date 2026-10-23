import React, { useState } from 'react';
import { 
  CreditCard, X, Search, PlusCircle, ArrowUpRight, 
  ArrowDownLeft, CheckCircle2, QrCode, DollarSign, Wallet
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

interface CreditoDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditoDigitalModal: React.FC<CreditoDigitalModalProps> = ({ isOpen, onClose }) => {
  const { customers } = useAdega();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [rechargeAmount, setRechargeAmount] = useState<number>(50);
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASH'>('PIX');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  // Digital credits state in memory/localStorage demo
  const [balances, setBalances] = useState<Record<string, number>>({
    'cust-1': 150.00,
    'cust-2': 45.50,
    'cust-3': 320.00,
    'cust-4': 0.00,
  });

  const [history, setHistory] = useState<Array<{
    id: string;
    customerId: string;
    type: 'RECHARGE' | 'CONSUMPTION';
    amount: number;
    method?: string;
    date: string;
  }>>([
    { id: 'cd-1', customerId: 'cust-1', type: 'RECHARGE', amount: 100.00, method: 'PIX', date: 'Hoje às 14:10' },
    { id: 'cd-2', customerId: 'cust-1', type: 'CONSUMPTION', amount: 35.00, method: 'Dose Whisky Black', date: 'Hoje às 14:25' },
    { id: 'cd-3', customerId: 'cust-3', type: 'RECHARGE', amount: 300.00, method: 'Cartão de Crédito', date: 'Ontem às 21:00' },
  ]);

  if (!isOpen) return null;

  const filteredCustomers = (customers || []).filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf?.includes(searchTerm) ||
    c.phone?.includes(searchTerm)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const currentBalance = selectedCustomer ? (balances[selectedCustomer.id] ?? 85.00) : 0;

  const handlePerformRecharge = () => {
    if (!selectedCustomer || rechargeAmount <= 0) return;

    setBalances((prev) => ({
      ...prev,
      [selectedCustomer.id]: (prev[selectedCustomer.id] ?? 85.00) + rechargeAmount,
    }));

    setHistory((prev) => [
      {
        id: `cd-${Date.now()}`,
        customerId: selectedCustomer.id,
        type: 'RECHARGE',
        amount: rechargeAmount,
        method: paymentMethod,
        date: 'Agora mesmo',
      },
      ...prev,
    ]);

    setRechargeSuccess(true);
    setTimeout(() => setRechargeSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 font-serif">Crédito Digital & Carteira Pré-Paga</h3>
              <p className="text-xs text-zinc-400">Recargas instantâneas e consumo ágil no balcão e mesas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Customer Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">Selecionar Cliente</label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, CPF ou celular..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Quick List */}
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none">
              {filteredCustomers.slice(0, 5).map((cust) => (
                <button
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left shrink-0 transition-all ${
                    selectedCustomerId === cust.id
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  <div className="font-semibold">{cust.name}</div>
                  <div className="text-[10px] opacity-75">{cust.cpf || 'Sem CPF'}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedCustomer && (
            <>
              {/* Balance Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/30 to-zinc-950 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Saldo Disponível em Crédito Digital</span>
                  </div>
                  <div className="text-2xl font-bold text-white mt-1">
                    R$ {currentBalance.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-400/90 mt-0.5 font-medium">
                    Cliente: {selectedCustomer.name}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <CreditCard className="w-8 h-8" />
                </div>
              </div>

              {/* Recharge Form */}
              <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-3">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Realizar Recarga de Saldo
                </span>

                {rechargeSuccess && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Recarga de R$ {rechargeAmount.toFixed(2)} confirmada com sucesso!</span>
                  </div>
                )}

                {/* Quick values */}
                <div className="grid grid-cols-4 gap-2">
                  {[20, 50, 100, 200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRechargeAmount(val)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        rechargeAmount === val
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      R$ {val}
                    </button>
                  ))}
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Forma de Pagamento da Recarga</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('PIX')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border ${
                        paymentMethod === 'PIX'
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      PIX Instantâneo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CREDIT_CARD')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border ${
                        paymentMethod === 'CREDIT_CARD'
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Cartão Crédito/Débito
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('CASH')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-medium border ${
                        paymentMethod === 'CASH'
                          ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Dinheiro no Caixa
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePerformRecharge}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirmar Recarga de R$ {rechargeAmount.toFixed(2)}
                </button>
              </div>

              {/* History */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 block">Extrato Recente do Cliente</span>
                <div className="space-y-1.5">
                  {history
                    .filter((h) => h.customerId === selectedCustomer.id)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {item.type === 'RECHARGE' ? (
                            <div className="p-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="p-1 rounded-lg bg-rose-950 text-rose-400 border border-rose-800/40">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-zinc-200">
                              {item.type === 'RECHARGE' ? `Recarga via ${item.method}` : item.method}
                            </div>
                            <div className="text-[10px] text-zinc-500">{item.date}</div>
                          </div>
                        </div>
                        <div
                          className={`font-bold font-mono ${
                            item.type === 'RECHARGE' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.type === 'RECHARGE' ? '+' : '-'} R$ {item.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
