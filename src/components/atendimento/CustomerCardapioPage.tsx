import React, { useState, useEffect } from 'react';
import { 
  QrCode, ShoppingBag, Droplets, CheckCircle2, 
  Wine, Beer, Sparkles, ArrowRight, Search, 
  Plus, Minus, Trash2, UtensilsCrossed, ArrowLeft,
  Clock, ShieldCheck
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Product, CartItem } from '../../types';

interface CustomerCardapioPageProps {
  onBackToSystem?: () => void;
}

export const CustomerCardapioPage: React.FC<CustomerCardapioPageProps> = ({ onBackToSystem }) => {
  const { products, tables, activeStore, addOrderToTable } = useAdega();

  // Read table number from URL query params (e.g. ?mesa=1 or ?mesa=02)
  const [tableNumber, setTableNumber] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const m = params.get('mesa');
      if (m) {
        const num = parseInt(m, 10);
        if (!isNaN(num) && num > 0) return num;
      }
    }
    return 1;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customerCart, setCustomerCart] = useState<CartItem[]>([]);
  const [orderSent, setOrderSent] = useState(false);
  const [itemNoteInput, setItemNoteInput] = useState<{ [productId: string]: string }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const currentTable = tables?.find((t) => t.number === tableNumber) || {
    id: tableNumber,
    number: tableNumber,
    name: `Mesa 0${tableNumber}`,
    status: 'FREE',
    capacity: 4,
    totalAmount: 0,
    items: [],
  };

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
      setIsCartOpen(false);
    }, 3000);
  };

  const cartTotal = customerCart.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0);
  const cartItemCount = customerCart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans select-none antialiased">
      
      {/* Top Mobile Bar */}
      <div className="bg-zinc-950 border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-amber-500/40 bg-zinc-900 shrink-0">
            <img src="/logo.jpg" alt="AdeGaswg" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="font-bold text-xs sm:text-sm text-zinc-100 font-serif leading-tight">
              {activeStore?.name || 'AdeGaswg'}
            </div>
            <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Mesa 0{tableNumber} Conectada</span>
            </div>
          </div>
        </div>

        {onBackToSystem && (
          <button
            type="button"
            onClick={onBackToSystem}
            className="text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Sistema</span>
          </button>
        )}
      </div>

      {/* Hero Welcome Banner */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-amber-950/40 via-zinc-950 to-zinc-950 border-b border-zinc-800/60 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 text-xs font-bold border border-amber-500/30 mb-2">
          <QrCode className="w-3.5 h-3.5" />
          <span>Cardápio Digital na Mesa</span>
        </span>
        <h1 className="font-serif font-bold text-lg sm:text-2xl text-amber-200">
          Faça seus pedidos pelo celular
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
          Escolha bebidas, doses e petiscos. Seu pedido é enviado direto para a cozinha e bar!
        </p>
      </div>

      {/* Search & Categories Bar */}
      <div className="p-3 sm:p-4 bg-zinc-950/90 backdrop-blur sticky top-14 z-30 border-b border-zinc-800/80 space-y-2.5">
        <div className="relative max-w-lg mx-auto">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cerveja, whisky, vinho, porção..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs max-w-lg mx-auto scrollbar-none">
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
              className={`px-3 py-1.5 rounded-xl shrink-0 font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-5 max-w-4xl w-full mx-auto pb-28">
        {orderSent ? (
          <div className="py-16 text-center space-y-3 bg-zinc-900/80 rounded-3xl border border-emerald-500/40 p-8 my-6 max-w-md mx-auto shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white font-serif">Pedido Enviado com Sucesso!</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              O Bar e a Cozinha já receberam seu pedido para a <strong>Mesa 0{tableNumber}</strong>. Em breve será levado à sua mesa!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const hasDose = Boolean(product.isFractionable && product.pricePerDose);

              return (
                <div
                  key={product.id}
                  className="p-3 sm:p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 transition-all flex flex-col justify-between gap-2.5 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0">
                      <img
                        src={product.image || '/logo.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider block">
                        {product.category}
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-zinc-100 line-clamp-2 leading-snug mt-0.5">
                        {product.name}
                      </h4>
                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-xs text-zinc-400">Garrafa:</span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          R$ {product.price.toFixed(2)}
                        </span>
                      </div>
                      {hasDose && (
                        <div className="flex items-baseline gap-1 text-[11px] text-amber-300">
                          <span>Dose (50ml):</span>
                          <span className="font-bold font-mono">
                            R$ {(product.pricePerDose || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Obs Input */}
                  <input
                    type="text"
                    placeholder="Alguma observação? (ex: gelo, limão)"
                    value={itemNoteInput[product.id] || ''}
                    onChange={(e) => setItemNoteInput({ ...itemNoteInput, [product.id]: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                  />

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    {hasDose && (
                      <button
                        type="button"
                        onClick={() => handleAddItem(product, true)}
                        className="flex-1 py-2 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Pedir Dose</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleAddItem(product, false)}
                      className="flex-1 py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1 shadow-sm transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{hasDose ? 'Pedir Garrafa' : 'Adicionar'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {customerCart.length > 0 && !orderSent && (
        <div className="fixed bottom-0 inset-x-0 p-3 sm:p-4 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 z-50">
          <div className="max-w-md mx-auto space-y-2.5">
            {/* Expanded items preview if cart open */}
            {isCartOpen && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl max-h-56 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-300 pb-1 border-b border-zinc-800">
                  <span>Itens Selecionados</span>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    Fechar
                  </button>
                </div>
                {customerCart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1 border-b border-zinc-800/40">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-zinc-200 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-amber-400">
                        {item.isDose ? 'Dose (50ml)' : 'Garrafa'} • R$ {(item.totalPrice ?? 0).toFixed(2)}
                      </div>
                      {item.notes && <div className="text-[10px] text-zinc-400">Obs: {item.notes}</div>}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleUpdateCartQty(idx, -1)}
                        className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateCartQty(idx, 1)}
                        className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveCartItem(idx)}
                        className="p-1 text-zinc-500 hover:text-rose-400 ml-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="px-3.5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>{cartItemCount} item(ns)</span>
              </button>

              <button
                type="button"
                onClick={handleSendOrderFromPhone}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-amber-950/40 transition-colors"
              >
                <span>Confirmar Pedido (Mesa 0{tableNumber})</span>
                <span className="font-mono font-black text-sm">R$ {cartTotal.toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
