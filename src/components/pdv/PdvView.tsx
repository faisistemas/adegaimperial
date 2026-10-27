import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Barcode, ShoppingCart, Trash2, Plus, Minus, 
  Scale, Printer, ArrowRight, ArrowLeft, Droplets, CheckCircle2,
  Sparkles, Tag, DollarSign, Wine, Beer, GlassWater,
  ArrowDownCircle, ArrowUpCircle, Lock, ShieldAlert, Cpu,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { CartItem, Product, Order, PaymentDetails } from '../../types';
import { ScaleModal } from './ScaleModal';
import { CheckoutModal } from './CheckoutModal';
import { ThermalReceiptModal } from './ThermalReceiptModal';
import { SangriaModal } from './SangriaModal';
import { SuprimentoModal } from './SuprimentoModal';
import { BlindCashCloseModal } from './BlindCashCloseModal';
import { ManagerAuthModal } from './ManagerAuthModal';
import { playScannerBeep, playSuccessBeep, playErrorBuzz } from '../../utils/peripheralUtils';

export const PdvView: React.FC = () => {
  const { 
    products, 
    completeSale, 
    activeStore, 
    orders, 
    cashSession, 
    lockScreen,
    currentUser,
    peripheralSettings
  } = useAdega();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [mobileTab, setMobileTab] = useState<'CATALOG' | 'CART'>('CATALOG');

  // Modals state
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [scaleProduct, setScaleProduct] = useState<Product | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(orders[0] || null);

  // Cash & Security Modals
  const [sangriaModalOpen, setSangriaModalOpen] = useState(false);
  const [suprimentoModalOpen, setSuprimentoModalOpen] = useState(false);
  const [blindCloseModalOpen, setBlindCloseModalOpen] = useState(false);
  const [managerAuthOpen, setManagerAuthOpen] = useState(false);
  const [pendingCancelItemIndex, setPendingCancelItemIndex] = useState<number | null>(null);

  // Barcode HID scanner buffer tracking
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (categoriesRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      categoriesRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Global Keydown Handler (F-Keys and HID Barcode Scanners)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Functional Hotkeys
      if (e.key === 'F2') {
        e.preventDefault();
        setSangriaModalOpen(true);
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        setSuprimentoModalOpen(true);
        return;
      }
      if (e.key === 'F4') {
        e.preventDefault();
        setBlindCloseModalOpen(true);
        return;
      }
      if (e.key === 'F8') {
        e.preventDefault();
        lockScreen();
        return;
      }
      if (e.key === 'F9') {
        e.preventDefault();
        const weighed = products.find((p) => p.isWeighed);
        if (weighed) handleOpenScale(weighed);
        return;
      }

      // Barcode Scanner detection (Rapid keystrokes or Enter termination)
      const now = Date.now();
      const timeDiff = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If active target is an input or textarea, let normal typing happen
      const activeTagName = (document.activeElement?.tagName || '').toLowerCase();
      const isInputFocused = activeTagName === 'input' || activeTagName === 'textarea';

      if (e.key === 'Enter') {
        const potentialBarcode = barcodeBufferRef.current.trim();
        barcodeBufferRef.current = '';

        if (potentialBarcode.length >= 6) {
          const matchedProduct = products.find(
            (p) => p.barcode === potentialBarcode || p.name.toLowerCase().includes(potentialBarcode.toLowerCase())
          );

          if (matchedProduct) {
            playScannerBeep();
            if (matchedProduct.isWeighed && peripheralSettings?.scale?.autoPriceWeighedProducts) {
              handleOpenScale(matchedProduct);
            } else {
              handleAddToCart(matchedProduct);
            }
          }
        }
        return;
      }

      // Append printable alphanumeric characters into buffer
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (timeDiff > 200) {
          // If slow typing, restart buffer
          barcodeBufferRef.current = e.key;
        } else {
          barcodeBufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [products, peripheralSettings?.scale?.autoPriceWeighedProducts]);

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.barcode.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const handleAddToCart = (product: Product, isDose: boolean = false, weightKg?: number) => {
    // If product is weighed and no weight specified yet, open the Toledo Scale modal automatically
    if (product.isWeighed && !weightKg && peripheralSettings?.scale?.autoPriceWeighedProducts) {
      handleOpenScale(product);
      return;
    }

    playSuccessBeep();
    const unitPrice = isDose ? (product.pricePerDose || 20.00) : (weightKg ? (product.pricePerKg || product.price) * weightKg : product.price);
    const existingIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.isDose === isDose && item.weightKg === weightKg
    );

    if (existingIndex > -1 && !weightKg) {
      setCartItems((prev) =>
        prev.map((item, idx) => {
          if (idx === existingIndex) {
            const newQty = item.quantity + 1;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
      );
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        isDose,
        weightKg,
        unitPrice,
        discount: 0,
        totalPrice: unitPrice,
      };
      setCartItems((prev) => [...prev, newItem]);
    }
  };

  const handleUpdateQuantity = (index: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item, i) => {
          if (i === index) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: newQty * item.unitPrice,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const requestRemoveItem = (index: number) => {
    // If cashier, require manager authorization to cancel an item
    if (currentUser.role === 'CASHIER') {
      setPendingCancelItemIndex(index);
      setManagerAuthOpen(true);
    } else {
      handleRemoveItem(index);
    }
  };

  const handleRemoveItem = (index: number) => {
    playErrorBuzz();
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    setPendingCancelItemIndex(null);
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (currentUser.role === 'CASHIER') {
      setPendingCancelItemIndex(-1); // -1 signifies clearing all cart
      setManagerAuthOpen(true);
    } else {
      setCartItems([]);
      setDiscountPercent(0);
    }
  };

  // Calculations
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  const discountValue = (rawSubtotal * discountPercent) / 100;
  const grandTotal = Math.max(0, rawSubtotal - discountValue);

  const handleOpenScale = (product: Product) => {
    setScaleProduct(product);
    setScaleModalOpen(true);
  };

  const handleConfirmWeight = (product: Product, weightKg: number) => {
    handleAddToCart(product, false, weightKg);
  };

  const handleFinishCheckout = (payment: PaymentDetails, customerCpf?: string, customerName?: string) => {
    const newOrder = completeSale(
      cartItems,
      payment,
      'PDV_BALCAO',
      undefined,
      undefined,
      customerCpf,
      customerName
    );

    setLastCompletedOrder(newOrder);
    setCheckoutModalOpen(false);
    setReceiptModalOpen(true);
    setCartItems([]);
    setDiscountPercent(0);
  };

  const categories = [
    { id: 'all', label: 'Todas Bebidas' },
    { id: 'destilados', label: 'Destilados & Doses', icon: Droplets },
    { id: 'cervejas', label: 'Cervejas', icon: Beer },
    { id: 'vinhos', label: 'Vinhos & Espumantes', icon: Wine },
    { id: 'combos', label: 'Combos & Kits', icon: Sparkles },
    { id: 'gelo_petiscos', label: 'Gelo & Petiscos (Balança)', icon: Scale },
  ];

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full min-h-0 overflow-hidden bg-zinc-950">
      {/* Products Selection Section (Left / Center) */}
      <div className={`${mobileTab === 'CATALOG' ? 'flex' : 'hidden lg:flex'} flex-1 flex-col min-w-0 min-h-0 h-full overflow-hidden border-r border-zinc-800/80`}>
        {/* Cash Status & Peripheral Quick Actions Bar */}
        <div className="px-3 sm:px-4 py-2 border-b border-zinc-800/80 bg-zinc-950 flex items-center justify-end gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSangriaModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-mono text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Retirada de Dinheiro da Gaveta [F2]"
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Sangria [F2]</span>
            </button>

            <button
              onClick={() => setSuprimentoModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Entrada de Troco na Gaveta [F3]"
            >
              <ArrowUpCircle className="w-3.5 h-3.5" />
              <span>Suprimento [F3]</span>
            </button>

            <button
              onClick={() => setBlindCloseModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 flex items-center gap-1 font-mono text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0"
              title="Fechamento Cego de Caixa [F4]"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Fechar [F4]</span>
            </button>

            <button
              onClick={lockScreen}
              className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 border border-zinc-700 flex items-center gap-1 font-mono text-[11px] transition-colors whitespace-nowrap shrink-0"
              title="Bloquear Terminal [F8]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>[F8]</span>
            </button>
          </div>
        </div>

        {/* Mobile & Tablet Segmented Tab Switcher */}
        <div className="lg:hidden px-3 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 w-full">
            <button
              type="button"
              onClick={() => setMobileTab('CATALOG')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'CATALOG'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Wine className="w-3.5 h-3.5" />
              <span>Catálogo ({filteredProducts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileTab('CART')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'CART'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Carrinho ({cartItems.reduce((acc, it) => acc + (it.weightKg ? 1 : it.quantity), 0)})</span>
              {cartItems.length > 0 && (
                <span className="text-[10px] font-mono font-bold bg-zinc-900 text-amber-400 px-1.5 py-0.5 rounded ml-0.5">
                  R$ {grandTotal.toFixed(2)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Top Search & Filter Bar */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="input-search-product"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Escanear código de barras (EAN) ou buscar pelo nome..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const weighed = products.find((p) => p.isWeighed);
                if (weighed) handleOpenScale(weighed);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
              title="Abrir Balança Digital Toledo/Filizola [F9]"
            >
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Balança [F9]</span>
            </button>

            {lastCompletedOrder && (
              <button
                onClick={() => setReceiptModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors whitespace-nowrap"
                title="Reimprimir último cupom emitido"
              >
                <Printer className="w-3.5 h-3.5 text-zinc-300" />
                <span>Último Cupom</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar with Navigation Arrows */}
        <div className="border-b border-zinc-800/80 bg-zinc-950 flex items-center shrink-0 px-2 sm:px-3 relative">
          <button
            type="button"
            onClick={() => handleScrollCategories('left')}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 active:scale-95 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-all shrink-0 shadow-sm z-10 mr-1.5"
            title="Voltar categorias"
            aria-label="Voltar categorias"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={categoriesRef}
            className="flex-1 py-2.5 overflow-x-auto flex items-center gap-2 scrollbar-none scroll-smooth"
          >
            {(categories || []).map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleScrollCategories('right')}
            className="p-1.5 sm:p-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 active:scale-95 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-all shrink-0 shadow-sm z-10 ml-1.5"
            title="Avançar categorias"
            aria-label="Avançar categorias"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Touch Grid */}
        <div className="flex-1 min-h-0 p-2.5 sm:p-4 pb-28 sm:pb-32 lg:pb-4 overflow-y-auto overscroll-contain grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3 content-start">
          {(filteredProducts || []).map((product) => {
            const hasOpenBottle = product.isFractionable && (product.openBottleVolumeMl ?? 0) > 0;
            const openBottlePercent = product.isFractionable && product.bottleVolumeMl 
              ? Math.round(((product.openBottleVolumeMl || 0) / product.bottleVolumeMl) * 100)
              : 0;

            return (
              <div
                key={product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between hover:border-zinc-700 transition-all group shadow-sm hover:shadow-lg"
              >
                <div>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden mb-2.5 bg-zinc-950">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-zinc-950/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-300 border border-zinc-800">
                      {product.stockUnits} un em estoque
                    </div>

                    {product.isWeighed && (
                      <div className="absolute top-2 left-2 bg-amber-500/90 text-zinc-950 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono shadow">
                        Balança Kg
                      </div>
                    )}

                    {product.isFractionable && (
                      <div className="absolute bottom-2 left-2 right-2 bg-zinc-950/90 backdrop-blur-md px-2 py-1 rounded-lg border border-amber-500/40 text-[10px]">
                        <div className="flex items-center justify-between text-amber-300 font-semibold mb-0.5">
                          <span className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-amber-400" />
                            <span>Garrafa Aberta:</span>
                          </span>
                          <span>{product.openBottleVolumeMl}ml ({openBottlePercent}%)</span>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${openBottlePercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <h3 className="font-semibold text-xs text-zinc-100 line-clamp-2 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5">EAN: {product.barcode}</p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 mt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block">
                        {product.isWeighed ? 'Preço por Kg:' : 'Garrafa Inteira:'}
                      </span>
                      <span className="text-sm font-bold font-mono text-zinc-100">
                        R$ {((product.pricePerKg || product.price) ?? 0).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (product.isWeighed) {
                          handleOpenScale(product);
                        } else {
                          handleAddToCart(product, false);
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-colors shadow-md shadow-amber-500/10"
                    >
                      {product.isWeighed ? <Scale className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      <span>{product.isWeighed ? 'Pesar' : 'Adicionar'}</span>
                    </button>
                  </div>

                  {/* Dose Button if fractionable */}
                  {product.isFractionable && product.pricePerDose && (
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                      <div>
                        <span className="text-[10px] text-amber-400/90 block">
                          Dose ({product.doseVolumeMl}ml):
                        </span>
                        <span className="text-xs font-bold font-mono text-amber-300">
                          R$ {(product.pricePerDose ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product, true)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Droplets className="w-3 h-3" />
                        <span>+ Dose</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Floating Mobile Cart Bar when in Catalog mode */}
        {cartItems.length > 0 && (
          <div className="lg:hidden p-3 mb-14 sm:mb-16 bg-zinc-950/95 border-t border-zinc-800 flex items-center justify-between gap-3 shadow-2xl shrink-0 backdrop-blur-md">
            <div>
              <div className="text-[11px] text-zinc-400 font-medium">
                {cartItems.reduce((acc, it) => acc + (it.weightKg ? 1 : it.quantity), 0)} itens no carrinho
              </div>
              <div className="text-base font-bold font-mono text-emerald-400">
                R$ {grandTotal.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => setMobileTab('CART')}
              className="py-2 px-3.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-lg transition-transform cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Ver Carrinho</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Cart Panel (Right) */}
      <div className={`${mobileTab === 'CART' ? 'flex flex-1' : 'hidden lg:flex'} w-full lg:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex-col justify-between shrink-0 shadow-2xl h-full min-h-0 overflow-hidden`}>
        {/* Cart Header */}
        <div className="p-3 sm:p-4 border-b border-zinc-800 bg-zinc-950 shrink-0">
          <div className="flex items-center justify-between mb-2.5 lg:hidden">
            <button
              onClick={() => setMobileTab('CATALOG')}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Catálogo</span>
            </button>
            <span className="text-xs font-mono text-zinc-400">
              Total: <strong className="text-emerald-400">R$ {grandTotal.toFixed(2)}</strong>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-amber-400" />
              <h2 className="font-bold text-sm text-zinc-100 font-serif">Comanda Frente de Caixa</h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.2 rounded font-bold">
                {cartItems.length}
              </span>
            </div>

            {cartItems.length > 0 && (
              <button
                onClick={handleClearCart}
                className="text-zinc-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 min-h-0 p-2.5 sm:p-3 overflow-y-auto overscroll-contain space-y-2">
          {cartItems.length === 0 ? (
            <div className="h-full min-h-[100px] flex flex-col items-center justify-center text-center p-3 sm:p-4 text-zinc-500 space-y-1.5">
              <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-700 stroke-[1.5]" />
              <p className="text-xs font-medium">O carrinho do caixa está vazio.</p>
              <p className="text-[11px] text-zinc-600 max-w-[240px]">
                Toque nos produtos, aponte o leitor de código de barras ou use a balança.
              </p>
            </div>
          ) : (
            (cartItems || []).map((item, index) => (
              <div
                key={index}
                className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-zinc-100 truncate">
                      {item.product.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] mt-0.5">
                    {item.isDose ? (
                      <span className="text-amber-400 font-medium flex items-center gap-0.5">
                        <Droplets className="w-3 h-3" />
                        Dose {item.product.doseVolumeMl}ml
                      </span>
                    ) : item.weightKg ? (
                      <span className="text-cyan-400 font-medium font-mono">
                        {(item.weightKg ?? 0).toFixed(3)}kg (Balança)
                      </span>
                    ) : (
                      <span className="text-zinc-400">Garrafa / Unidade</span>
                    )}
                    <span className="text-zinc-500 font-mono">
                      x R$ {(item.unitPrice ?? 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Quantity Controls */}
                {!item.weightKg ? (
                  <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-700 rounded-lg p-0.5">
                    <button
                      onClick={() => handleUpdateQuantity(index, -1)}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-mono font-bold text-zinc-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(index, 1)}
                      className="p-1 text-zinc-400 hover:text-zinc-200"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => requestRemoveItem(index)}
                    className="text-zinc-500 hover:text-rose-400 p-1"
                    title="Cancelar item pesado"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <div className="text-right font-mono font-bold text-xs text-zinc-100 min-w-[65px]">
                  R$ {(item.totalPrice ?? 0).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Action */}
        <div className="p-3 sm:p-4 pb-24 lg:pb-4 border-t border-zinc-800 bg-zinc-950 space-y-2 sm:space-y-3 shrink-0">
          {/* Quick Discounts */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-zinc-500" />
              <span>Desconto:</span>
            </span>
            <div className="flex items-center gap-1">
              {[0, 5, 10].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    discountPercent === pct
                      ? 'bg-amber-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {pct === 0 ? '0%' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal:</span>
              <span className="font-mono">R$ {(rawSubtotal ?? 0).toFixed(2)}</span>
            </div>
            {discountValue > 0 && (
              <div className="flex justify-between text-emerald-400 font-medium">
                <span>Desconto Aplicado ({discountPercent}%):</span>
                <span className="font-mono">- R$ {(discountValue ?? 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-zinc-100 pt-1.5 border-t border-zinc-800">
              <span>Total a Receber:</span>
              <span className="text-amber-400 font-mono text-base sm:text-lg">
                R$ {(grandTotal ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            id="btn-open-checkout"
            onClick={() => setCheckoutModalOpen(true)}
            disabled={cartItems.length === 0}
            className={`w-full py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
              cartItems.length === 0
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-950/50 cursor-pointer active:scale-[0.99]'
            }`}
          >
            <span>Cobrar & Emitir NFC-e</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Peripherals & Checkout Modals */}
      <ScaleModal
        isOpen={scaleModalOpen}
        onClose={() => setScaleModalOpen(false)}
        product={scaleProduct}
        onConfirmWeight={handleConfirmWeight}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        cartItems={cartItems}
        subtotal={rawSubtotal}
        discount={discountValue}
        total={grandTotal}
        onConfirmSale={handleFinishCheckout}
      />

      <ThermalReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        order={lastCompletedOrder}
        store={activeStore}
      />

      {/* Cash Movement Modals */}
      <SangriaModal
        isOpen={sangriaModalOpen}
        onClose={() => setSangriaModalOpen(false)}
      />

      <SuprimentoModal
        isOpen={suprimentoModalOpen}
        onClose={() => setSuprimentoModalOpen(false)}
      />

      <BlindCashCloseModal
        isOpen={blindCloseModalOpen}
        onClose={() => setBlindCloseModalOpen(false)}
      />

      <ManagerAuthModal
        isOpen={managerAuthOpen}
        title="Autorização para Cancelamento"
        description="O cancelamento de itens na comanda requer autorização e PIN do Gerente de Turno ou Super Admin."
        onAuthorized={() => {
          if (pendingCancelItemIndex === -1) {
            setCartItems([]);
            setDiscountPercent(0);
          } else if (pendingCancelItemIndex !== null) {
            handleRemoveItem(pendingCancelItemIndex);
          }
        }}
        onClose={() => {
          setManagerAuthOpen(false);
          setPendingCancelItemIndex(null);
        }}
      />
    </div>
  );
};
