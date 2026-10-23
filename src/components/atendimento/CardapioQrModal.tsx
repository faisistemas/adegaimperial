import React, { useState } from 'react';
import { 
  QrCode, Smartphone, X, ShoppingBag, Droplets, 
  CheckCircle2, Wine, Beer, Sparkles, ArrowRight,
  Search, Plus, Minus, Trash2, Printer, Copy, Check,
  ExternalLink, Layers, UtensilsCrossed, AlertCircle
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Product, CartItem, Table } from '../../types';

interface CardapioQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CardapioQrModal: React.FC<CardapioQrModalProps> = ({ isOpen, onClose }) => {
  const { products, tables, activeStore, addOrderToTable } = useAdega();

  // Selected table state
  const [selectedTableId, setSelectedTableId] = useState<number>(() => {
    return tables && tables.length > 0 ? tables[0].id : 1;
  });

  // Modal mode: "SIMULATOR" (Cliente no Celular) or "PRINT_QR" (QR Code para Imprimir)
  const [activeMode, setActiveMode] = useState<'SIMULATOR' | 'PRINT_QR'>('SIMULATOR');

  // Simulator state
  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);
  const [orderSent, setOrderSent] = useState(false);
  const [itemNoteInput, setItemNoteInput] = useState<{ [productId: string]: string }>({});
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentTable = tables?.find((t) => t.id === selectedTableId) || tables?.[0] || {
    id: 1,
    number: 1,
    name: 'Mesa 01',
    status: 'FREE',
    capacity: 4,
    totalAmount: 0,
    items: [],
  };

  const tableQrUrl = `https://${window.location.host || 'adegaimperial.app'}/cardapio?mesa=${currentTable.number}&loja=${activeStore?.id || 'matriz'}`;

  // Filter products
  const filteredProducts = (products || []).filter((p) => {
    const matchesSearch = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'TODOS') return true;
    if (selectedCategory === 'DESTILADOS') return p.category === 'destilados' || p.isFractionable;
    if (selectedCategory === 'CERVEJAS') return p.category === 'cervejas';
    if (selectedCategory === 'VINHOS') return p.category === 'vinhos';
    if (selectedCategory === 'NAO_ALCOOLICOS') return p.category === 'nao-alcoolicos';
    if (selectedCategory === 'PETISCOS') return p.category === 'petiscos';
    return true;
  });

  const handleAddItem = (product: Product, isDose: boolean) => {
    const unitPrice = isDose ? (product.pricePerDose || 20) : product.price;
    const note = itemNoteInput[product.id] || '';

    setCustomerCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.isDose === isDose && item.notes === note
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const current = updated[existingIndex];
        const newQty = current.quantity + 1;
        updated[existingIndex] = {
          ...current,
          quantity: newQty,
          totalPrice: newQty * unitPrice,
        };
        return updated;
      }

      return [
        ...prev,
        {
          product,
          quantity: 1,
          isDose,
          unitPrice,
          discount: 0,
          totalPrice: unitPrice,
          notes: note || undefined,
        },
      ];
    });

    // Clear note input after adding
    if (note) {
      setItemNoteInput((prev) => ({ ...prev, [product.id]: '' }));
    }
  };

  const handleUpdateCartQty = (index: number, delta: number) => {
    setCustomerCart((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index] = {
        ...item,
        quantity: newQty,
        totalPrice: newQty * item.unitPrice,
      };
      return updated;
    });
  };

  const handleRemoveCartItem = (index: number) => {
    setCustomerCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendOrderFromPhone = () => {
    if (customerCart.length === 0) return;
    addOrderToTable(currentTable.id, customerCart);
    setOrderSent(true);
    setTimeout(() => {
      setCustomerCart([]);
      setOrderSent(false);
    }, 2800);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tableQrUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const cartTotal = customerCart.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0);
  const cartItemCount = customerCart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-amber-500/15 text-amber-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-zinc-100 block text-xs">Cardápio QR Code na Mesa</span>
              <span className="text-[10px] text-zinc-400">Autoatendimento do cliente pelo smartphone</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Table Dropdown */}
        <div className="p-3 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
          {/* Table Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 text-[11px] font-medium">Mesa:</span>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 font-semibold"
            >
              {(tables || []).map((tbl) => (
                <option key={tbl.id} value={tbl.id}>
                  Mesa 0{tbl.number} - {tbl.name} ({tbl.status === 'OCCUPIED' ? 'Ocupada' : 'Livre'})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveMode('SIMULATOR')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeMode === 'SIMULATOR'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Simular Celular</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('PRINT_QR')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                activeMode === 'PRINT_QR'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Totem QR Mesa</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeMode === 'PRINT_QR' ? (
          /* Printable QR Code Totem View */
          <div className="p-6 overflow-y-auto space-y-4 text-center">
            <div className="max-w-xs mx-auto p-6 rounded-2xl bg-zinc-950 border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />
              
              <div className="w-14 h-14 rounded-2xl overflow-hidden border border-amber-500/40 shadow-lg mx-auto mb-2 bg-zinc-900 ring-1 ring-amber-500/20">
                <img
                  src="/logo.jpg"
                  alt="Adega Imperial"
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="font-serif font-bold text-base text-zinc-100 uppercase tracking-wide mt-1">
                {activeStore?.name || 'ADEGA IMPERIAL'}
              </h3>
              <p className="text-[11px] text-zinc-400">Cardápio & Pedidos Digitais</p>

              {/* Graphic QR Code display */}
              <div className="my-4 p-3 bg-white rounded-xl inline-block shadow-inner">
                <div className="w-44 h-44 flex flex-col items-center justify-center bg-zinc-50 border border-zinc-300 rounded-lg p-2">
                  <QrCode className="w-36 h-36 text-zinc-900" />
                </div>
              </div>

              <div className="bg-amber-500 text-zinc-950 font-black text-sm uppercase px-4 py-1.5 rounded-lg tracking-widest inline-block shadow-sm">
                MESA 0{currentTable.number}
              </div>

              <p className="text-[11px] text-zinc-400 mt-2">
                Aponte a câmera do seu smartphone para fazer pedidos sem esperar o garçom.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Display de Mesa</span>
              </button>
            </div>
          </div>
        ) : (
          /* Mobile Customer Simulator */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Store Brand Banner */}
            <div className="p-3.5 bg-gradient-to-br from-amber-950/70 via-zinc-950 to-zinc-950 border-b border-zinc-800 text-center relative shrink-0">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-500/40 shadow-md shadow-amber-950/60 mx-auto mb-2 bg-zinc-950 ring-1 ring-amber-500/25">
                <img
                  src="/logo.jpg"
                  alt="Adega Imperial"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30 mb-1">
                <QrCode className="w-3 h-3" />
                <span>Mesa 0{currentTable.number} Conectada</span>
              </div>
              <h2 className="font-bold text-sm text-amber-200 font-serif tracking-wide">{activeStore?.name || 'Adega Imperial'}</h2>
              <p className="text-[11px] text-zinc-400">Cardápio interativo: peça garrafas, doses e petiscos</p>
            </div>

            {/* Categories & Search Filter */}
            <div className="p-2.5 bg-zinc-950 border-b border-zinc-800/80 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar no cardápio (ex: Black Label, Heineken)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                {[
                  { id: 'TODOS', label: 'Todos' },
                  { id: 'DESTILADOS', label: 'Doses & Whiskies' },
                  { id: 'CERVEJAS', label: 'Cervejas' },
                  { id: 'VINHOS', label: 'Vinhos' },
                  { id: 'NAO_ALCOOLICOS', label: 'Bebidas & Gelo' },
                  { id: 'PETISCOS', label: 'Petiscos' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition-all font-medium ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-zinc-950 font-bold'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5 min-h-0">
              {orderSent ? (
                <div className="py-12 text-center space-y-3 bg-zinc-950/60 rounded-2xl border border-emerald-500/30 p-6 my-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-sm text-zinc-100">Pedido Enviado com Sucesso!</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Os itens foram adicionados à comanda da <span className="text-amber-400 font-bold">Mesa 0{currentTable.number}</span> e impressos no KDS do Bar.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Nenhum item encontrado no cardápio.
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col gap-2 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-zinc-900 border border-zinc-800" 
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs text-zinc-100 truncate">{product.name}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {product.isFractionable ? (
                            <>
                              <span className="text-[11px] font-bold text-amber-400 font-mono">
                                Dose: R$ {(product.pricePerDose ?? 20).toFixed(2)}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">
                                Garrafa: R$ {(product.price ?? 0).toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-400 font-mono">
                              R$ {(product.price ?? 0).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {product.isFractionable ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleAddItem(product, true)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold transition-colors border border-amber-500/40"
                              title="Adicionar 1 Dose fracionada (50ml)"
                            >
                              + Dose
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddItem(product, false)}
                              className="px-2 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-colors"
                              title="Adicionar Garrafa Completa"
                            >
                              + Garrafa
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddItem(product, false)}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
                          >
                            + Pedir
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Optional Note Field */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-zinc-900">
                      <input
                        type="text"
                        placeholder="Observação (ex: com gelo e limão, bem gelada)..."
                        value={itemNoteInput[product.id] || ''}
                        onChange={(e) => setItemNoteInput({ ...itemNoteInput, [product.id]: e.target.value })}
                        className="flex-1 px-2 py-1 bg-zinc-900/80 border border-zinc-850 rounded-lg text-[10px] text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer Cart Footer Drawer */}
            {!orderSent && customerCart.length > 0 && (
              <div className="p-3 sm:p-4 bg-zinc-950 border-t border-zinc-800 space-y-2 shrink-0">
                <div className="flex items-center justify-between text-xs pb-1">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-zinc-300 font-semibold">{cartItemCount} item(ns) no seu pedido:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Cart Items Preview List */}
                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 py-1">
                  {customerCart.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-zinc-200 truncate">
                          <span className="font-semibold truncate">{item.product.name}</span>
                          {item.isDose && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              Dose
                            </span>
                          )}
                        </div>
                        {item.notes && (
                          <span className="text-[9px] text-amber-300/80 truncate block">Obs: {item.notes}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-zinc-400 text-[11px]">
                          R$ {(item.totalPrice ?? 0).toFixed(2)}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-0.5 bg-zinc-800 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(idx, -1)}
                            className="p-1 hover:text-white text-zinc-400 rounded"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-1.5 text-zinc-100">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateCartQty(idx, 1)}
                            className="p-1 hover:text-white text-zinc-400 rounded"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveCartItem(idx)}
                          className="p-1 text-zinc-500 hover:text-rose-400 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Order Button */}
                <button
                  type="button"
                  onClick={handleSendOrderFromPhone}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Confirmar & Enviar Pedido para a Mesa 0{currentTable.number}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
