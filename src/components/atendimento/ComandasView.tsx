import React, { useState } from 'react';
import { 
  FileText, Plus, Search, User, CreditCard, 
  CircleDollarSign, X, Check, Droplets, Wine, Radio, 
  ArrowUpRight, ArrowDownLeft, ShieldAlert, Sparkles, RefreshCw, AlertCircle, Printer
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Comanda, CartItem, Product, PaymentDetails, PaymentMethod } from '../../types';
import { generatePreContaTicket, generateBarTicket, printThermalViaBrowser } from '../../utils/thermalPrinter';
import { playSuccessBeep } from '../../utils/peripheralUtils';

export const ComandasView: React.FC = () => {
  const { 
    comandas, 
    createComanda, 
    addOrderToComanda, 
    closeComanda, 
    products, 
    currentUser,
    activeStore,
    cartoesConsumo,
    recargaCartaoRfid,
    debitarCartaoRfid,
    encerrarEstornarCartaoRfid,
    vincularRfidComanda
  } = useAdega();

  const [activeTab, setActiveTab] = useState<'COMANDAS' | 'RFID_CASHLESS'>('COMANDAS');
  const [searchTerm, setSearchTerm] = useState('');

  // New comanda modal
  const [newComandaModal, setNewComandaModal] = useState(false);
  const [comandaNum, setComandaNum] = useState<number>(31);
  const [customerName, setCustomerName] = useState('');
  const [customerCpf, setCustomerCpf] = useState('');
  const [rfidCodeInput, setRfidCodeInput] = useState('');

  // Selected comanda for adding items
  const [selectedComanda, setSelectedComanda] = useState<Comanda | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products[0]);
  const [isDose, setIsDose] = useState(true);
  const [qty, setQty] = useState(1);
  const [itemObs, setItemObs] = useState('');

  // Close comanda modal
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');

  // RFID Recarga Modal
  const [recargaModalOpen, setRecargaModalOpen] = useState(false);
  const [selectedRfidCard, setSelectedRfidCard] = useState<string>('');
  const [recargaValor, setRecargaValor] = useState<number>(50);
  const [recargaMetodo, setRecargaMetodo] = useState<PaymentMethod>('PIX');
  const [rfidFeedback, setRfidFeedback] = useState<string | null>(null);

  const filteredComandas = (comandas || []).filter(
    (c) =>
      c.number.toString().includes(searchTerm) ||
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.customerCpf && c.customerCpf.includes(searchTerm)) ||
      (c.rfidCode && c.rfidCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createComanda(comandaNum, customerName || `Cliente Ficha #${comandaNum}`, customerCpf || undefined);
    if (rfidCodeInput) {
      vincularRfidComanda(`com-${Date.now()}`, rfidCodeInput);
    }
    setNewComandaModal(false);
    setCustomerName('');
    setCustomerCpf('');
    setRfidCodeInput('');
    setComandaNum(comandaNum + 1);
  };

  const handleAddItemToComanda = () => {
    if (!selectedComanda) return;
    const unitPrice = isDose ? (selectedProduct.pricePerDose || 20) : selectedProduct.price;
    const item: CartItem = {
      product: selectedProduct,
      quantity: qty,
      isDose,
      unitPrice,
      discount: 0,
      totalPrice: unitPrice * qty,
      notes: itemObs || undefined,
    };
    addOrderToComanda(selectedComanda.id, [item]);
    setSelectedComanda(null);
    setItemObs('');
  };

  const handleCloseComandaConfirm = () => {
    if (!selectedComanda) return;
    const payment: PaymentDetails = {
      method: paymentMethod,
      amount: selectedComanda.totalAmount,
    };
    closeComanda(selectedComanda.id, payment);
    setCloseModalOpen(false);
    setSelectedComanda(null);
  };

  const handleConfirmRecarga = (e: React.FormEvent) => {
    e.preventDefault();
    const res = recargaCartaoRfid(selectedRfidCard, recargaValor, recargaMetodo);
    if (res.success) {
      setRfidFeedback(res.message);
      setTimeout(() => {
        setRfidFeedback(null);
        setRecargaModalOpen(false);
      }, 1500);
    } else {
      setRfidFeedback(res.message);
    }
  };

  const handleEncerrarEstorno = (codigoRfid: string) => {
    const res = encerrarEstornarCartaoRfid(codigoRfid);
    alert(res.message);
  };

  const handlePrintComanda = async (comanda: Comanda) => {
    if (!comanda.items || comanda.items.length === 0) return;
    playSuccessBeep();
    const ticket = generatePreContaTicket(
      {
        tableOrComandaName: `Comanda #${comanda.number}`,
        number: comanda.number,
        waiterName: currentUser.name,
        customerName: comanda.customerName,
        items: comanda.items,
        subtotal: comanda.totalAmount,
        serviceFee: 0,
        couvertTotal: 0,
        total: comanda.totalAmount,
      },
      activeStore,
      80
    );
    await printThermalViaBrowser(ticket.html, 80);
  };

  const canClose = currentUser.role !== 'WAITER';

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-24 lg:pb-6">
      {/* Barra de Ações & Alternador de Abas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        {/* Search Bar */}
        <div className="relative max-w-md w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por número da ficha (#12), nome, CPF ou RFID..."
            className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Abas e Botão de Ação lado a lado */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Tab switcher */}
          <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800 shrink-0">
            <button
              onClick={() => setActiveTab('COMANDAS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'COMANDAS'
                  ? 'bg-amber-500 text-zinc-950 shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Comandas ({comandas.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('RFID_CASHLESS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'RFID_CASHLESS'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>RFID Cashless ({cartoesConsumo.length})</span>
            </button>
          </div>

          {/* Botão de Ação */}
          {activeTab === 'COMANDAS' ? (
            <button
              onClick={() => setNewComandaModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Nova Comanda</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (cartoesConsumo.length > 0) {
                  setSelectedRfidCard(cartoesConsumo[0].codigoRfid);
                  setRecargaModalOpen(true);
                }
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-purple-950/40 shrink-0 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Efetuar Recarga</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: COMANDAS INDIVIDUAIS */}
      {/* ========================================================================= */}
      {activeTab === 'COMANDAS' && (
        <div className="space-y-6">

          {/* Comandas Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(filteredComandas || []).map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xl text-amber-300">
                      Ficha #{c.number}
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase">
                      Aberta
                    </span>
                  </div>

                  <div className="mt-2">
                    <h3 className="font-bold text-xs text-zinc-100">{c.customerName}</h3>
                    {c.customerCpf && (
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">CPF: {c.customerCpf}</p>
                    )}
                    {c.rfidCode && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono inline-flex items-center gap-1 mt-1 font-semibold">
                        <Radio className="w-2.5 h-2.5" /> {c.rfidCode}
                      </span>
                    )}
                    <p className="text-[10px] text-zinc-500 mt-1">Aberta às {c.openedAt}</p>
                  </div>

                  {/* Consumo Acumulado */}
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Total Consumido:</span>
                    <span className="font-mono font-black text-base text-amber-400">
                      R$ {(c.totalAmount ?? 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Itens List */}
                  {c.items && c.items.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                      {(c.items || []).map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-zinc-400">
                          <span className="truncate">{it.quantity}x {it.product.name}</span>
                          <span className="font-mono">R$ {(it.totalPrice ?? 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/80">
                  <button
                    onClick={() => setSelectedComanda(c)}
                    className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lançar Bebida</span>
                  </button>

                  {c.items && c.items.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handlePrintComanda(c)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400 transition-colors border border-zinc-750"
                      title="Imprimir comanda térmica (80mm)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {canClose ? (
                    <button
                      onClick={() => {
                        setSelectedComanda(c);
                        setCloseModalOpen(true);
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      <span>Fechar</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: PULSEIRAS & CARTÕES RFID CASHLESS */}
      {/* ========================================================================= */}
      {activeTab === 'RFID_CASHLESS' && (
        <div className="space-y-6">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cartoesConsumo || []).map((card) => (
              <div
                key={card.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-purple-300 flex items-center gap-1.5 text-sm">
                      <Radio className="w-4 h-4 text-purple-400" />
                      <span>{card.codigoRfid}</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                        card.status === 'ATIVO'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : card.status === 'BLOQUEADO'
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                      }`}
                    >
                      {card.status}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h4 className="font-bold text-sm text-zinc-100">{card.clienteNome}</h4>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">CPF: {card.clienteCpf}</p>
                    <p className="text-[11px] text-zinc-500 font-mono mt-1">Cartão #{card.numeroCartao}</p>
                  </div>

                  {/* Saldo Atual */}
                  <div className="mt-4 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Saldo Disponível:</span>
                      <p className="font-mono font-black text-xl text-emerald-400">
                        R$ {(card.saldoAtual ?? 0).toFixed(2)}
                      </p>
                    </div>
                    {card.limiteCredito > 0 && (
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-500">Limite Pós:</span>
                        <p className="font-mono text-xs text-zinc-300">R$ {(card.limiteCredito ?? 0).toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedRfidCard(card.codigoRfid);
                        setRecargaModalOpen(true);
                      }}
                      className="flex-1 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 border border-amber-500/40 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Recarregar</span>
                    </button>

                    <button
                      onClick={() => handleEncerrarEstorno(card.codigoRfid)}
                      disabled={card.saldoAtual <= 0}
                      className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-rose-950/60 text-zinc-300 hover:text-rose-400 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed border border-zinc-700"
                      title="Encerrar pulseira e estornar saldo residual em dinheiro ou PIX"
                    >
                      <span>Devolver Saldo</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Abrir Nova Comanda */}
      {newComandaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Abrir Nova Ficha de Comanda</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Número da Ficha</label>
                <input
                  type="number"
                  value={comandaNum}
                  onChange={(e) => setComandaNum(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  placeholder="Ex: Matheus Guimarães"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">CPF do Cliente (Opcional)</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={customerCpf}
                  onChange={(e) => setCustomerCpf(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Código Pulseira RFID (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: RFID-9941"
                  value={rfidCodeInput}
                  onChange={(e) => setRfidCodeInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewComandaModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  Abrir Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Lançar Bebida na Comanda */}
      {selectedComanda && !closeModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">
                Lançar na Ficha #{selectedComanda.number} ({selectedComanda.customerName})
              </h3>
              <button onClick={() => setSelectedComanda(null)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Produto / Bebida</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value);
                    if (found) setSelectedProduct(found);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
                >
                  {(products || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isFractionable ? `(Dose R$ ${(p.pricePerDose ?? 0).toFixed(2)} / Garrafa R$ ${(p.price ?? 0).toFixed(2)})` : `- R$ ${(p.price ?? 0).toFixed(2)}`}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct.isFractionable && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsDose(true)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                      isDose
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <Droplets className="w-3 h-3" />
                    <span>Dose ({selectedProduct.doseVolumeMl}ml)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDose(false)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                      !isDose
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    <Wine className="w-3 h-3" />
                    <span>Garrafa</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-xs text-zinc-300 font-medium block mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-100 font-mono text-center"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-zinc-300 font-medium block mb-1">Observações</label>
                  <input
                    type="text"
                    placeholder="Ex: Dose dupla / Sem gelo"
                    value={itemObs}
                    onChange={(e) => setItemObs(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedComanda(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddItemToComanda}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow"
                >
                  Confirmar e Enviar ao KDS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Fechar Comanda */}
      {closeModalOpen && selectedComanda && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Fechar Ficha #{selectedComanda.number}</h3>
              <button onClick={() => setCloseModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-400">Total a Pagar:</span>
              <span className="font-mono font-black text-xl text-emerald-400">
                R$ {(selectedComanda?.totalAmount ?? 0).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
              >
                <option value="PIX">PIX Dinâmico</option>
                <option value="TEF_CREDITO">Cartão de Crédito TEF</option>
                <option value="TEF_DEBITO">Cartão de Débito TEF</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setCloseModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={handleCloseComandaConfirm}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Recarga de Cartão RFID */}
      {recargaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Radio className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Recarga de Cartão RFID Cashless</h3>
            </div>

            <form onSubmit={handleConfirmRecarga} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Pulseira / Cartão RFID</label>
                <select
                  value={selectedRfidCard}
                  onChange={(e) => setSelectedRfidCard(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200 font-mono"
                  required
                >
                  {(cartoesConsumo || []).map((c) => (
                    <option key={c.id} value={c.codigoRfid}>
                      {c.codigoRfid} - {c.clienteNome} (Saldo: R$ {(c.saldoAtual ?? 0).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Valor da Recarga (R$)</label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {[20, 50, 100].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRecargaValor(v)}
                      className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                        recargaValor === v
                          ? 'bg-purple-600 text-white border-purple-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      +R$ {v}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={recargaValor}
                  onChange={(e) => setRecargaValor(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-sm text-zinc-100 font-mono text-center font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Forma de Pagamento da Recarga</label>
                <select
                  value={recargaMetodo}
                  onChange={(e) => setRecargaMetodo(e.target.value as PaymentMethod)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
                >
                  <option value="PIX">PIX Dinâmico</option>
                  <option value="TEF_DEBITO">Cartão de Débito</option>
                  <option value="TEF_CREDITO">Cartão de Crédito</option>
                  <option value="DINHEIRO">Dinheiro em Espécie</option>
                </select>
              </div>

              {rfidFeedback && (
                <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-800 font-medium">
                  {rfidFeedback}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRecargaModalOpen(false);
                    setRfidFeedback(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-950/50"
                >
                  Confirmar Recarga
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
