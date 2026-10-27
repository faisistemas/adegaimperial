import React, { useState } from 'react';
import { 
  QrCode, Smartphone, X, ShoppingBag, Droplets, 
  CheckCircle2, Wine, Beer, Sparkles, ArrowRight,
  Search, Plus, Minus, Trash2, Printer, Copy, Check,
  ExternalLink, Layers, UtensilsCrossed, AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
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
  const [activeMode, setActiveMode] = useState<'SIMULATOR' | 'PRINT_QR'>('PRINT_QR');

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

  // Generate robust URL using the current origin (handles both http://localhost and https:// in production)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const tableQrUrl = `${origin}/?cardapio=true&mesa=${currentTable.number}&loja=${activeStore?.id || 'matriz'}`;


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
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tableQrUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = tableQrUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.warn('Erro ao copiar link:', err);
    }
  };

  const handlePrintDisplay = () => {
    const qrSvgElement = document.getElementById('totem-mesa-qr-svg');
    const qrSvgMarkup = qrSvgElement 
      ? qrSvgElement.outerHTML 
      : `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(tableQrUrl)}" alt="QR Code" style="width: 155px; height: 155px; display: block; margin: 0 auto;" />`;

    const storeName = activeStore?.name || 'ADEGASWG';
    const tableNum = String(currentTable.number).padStart(2, '0');

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Display de Mesa - MESA ${tableNum}</title>
          <style>
            @page {
              size: auto;
              margin: 15mm auto;
            }
            body {
              margin: 0;
              padding: 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 90vh;
              background: #ffffff;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .display-card {
              width: 300px;
              background: #ffffff;
              border: 2.5px solid #f59e0b;
              border-radius: 30px;
              padding: 34px 22px 28px 22px;
              text-align: center;
              box-sizing: border-box;
              margin: auto;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            }
            .logo-box {
              width: 58px;
              height: 58px;
              background: #000000;
              border-radius: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 10px auto;
              padding: 6px;
              box-sizing: border-box;
              border: 1px solid #e5e7eb;
            }
            .logo-box img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .store-name {
              font-size: 15px;
              font-weight: 800;
              color: #1f2937;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              margin: 0 0 2px 0;
            }
            .subtitle {
              font-size: 11px;
              color: #6b7280;
              margin: 0 0 14px 0;
              font-weight: 500;
            }
            .qr-box {
              background: #ffffff;
              border: 1px solid #e5e7eb;
              border-radius: 20px;
              padding: 12px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 14px auto;
              box-shadow: 0 1px 6px rgba(0,0,0,0.03);
            }
            .qr-box svg, .qr-box img {
              display: block;
              width: 155px;
              height: 155px;
              margin: 0 auto;
            }
            .mesa-pill {
              display: inline-block;
              border: 1.5px solid #d1d5db;
              background: #ffffff;
              border-radius: 9999px;
              padding: 4px 24px;
              font-size: 13px;
              font-weight: 900;
              color: #111827;
              letter-spacing: 1px;
              margin: 0 auto 12px auto;
            }
            .instruction {
              font-size: 10.5px;
              color: #6b7280;
              line-height: 1.35;
              max-width: 215px;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div class="display-card">
            <div class="logo-box">
              <img src="/logo.jpg" alt="Logo" />
            </div>
            <div class="store-name">${storeName}</div>
            <div class="subtitle">Cardápio & Pedidos Digitais</div>
            <div class="qr-box">
              ${qrSvgMarkup}
            </div>
            <div class="mesa-pill">MESA ${tableNum}</div>
            <div class="instruction">
              Aponte a câmera do seu smartphone para fazer pedidos sem esperar o garçom.
            </div>
          </div>
        </body>
      </html>
    `;

    const existing = document.getElementById('table-display-print-iframe');
    if (existing) {
      existing.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'table-display-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    doc.write(printHtml);
    doc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch {
        window.print();
      } finally {
        setTimeout(() => {
          iframe.remove();
        }, 3000);
      }
    };

    const images = doc.images;
    if (images && images.length > 0) {
      let loaded = 0;
      const total = images.length;
      const onReady = () => {
        loaded++;
        if (loaded >= total) {
          setTimeout(triggerPrint, 100);
        }
      };
      for (let i = 0; i < total; i++) {
        if (images[i].complete) {
          loaded++;
        } else {
          images[i].onload = onReady;
          images[i].onerror = onReady;
        }
      }
      if (loaded >= total) {
        setTimeout(triggerPrint, 150);
      } else {
        setTimeout(triggerPrint, 600);
      }
    } else {
      setTimeout(triggerPrint, 250);
    }
  };

  const cartTotal = customerCart.reduce((acc, item) => acc + (item.totalPrice ?? 0), 0);
  const cartItemCount = customerCart.reduce((acc, item) => acc + (item.quantity ?? 1), 0);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-0 sm:p-3 md:p-6 overflow-y-auto">
      {/* Estilos dedicados para impressão do Display de Mesa */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #totem-display-card, #totem-display-card * {
            visibility: visible !important;
          }
          #totem-display-card {
            position: fixed !important;
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
            margin: 0 !important;
            border: 2.5px solid #f59e0b !important;
            background: #ffffff !important;
            box-shadow: none !important;
            display: flex !important;
            z-index: 999999 !important;
          }
        }
      `}</style>

      <div className={`bg-zinc-900 border border-zinc-800 sm:rounded-3xl rounded-none w-full shadow-2xl overflow-hidden my-auto flex flex-col transition-all duration-300 ${
        activeMode === 'PRINT_QR'
          ? 'max-w-md max-h-[96vh] sm:max-h-[92vh] h-full sm:h-auto'
          : 'max-w-4xl lg:max-w-5xl xl:max-w-6xl h-full sm:h-[92vh] max-h-[960px]'
      }`}>
        
        {/* Top Header Bar */}
        <div className="px-3.5 py-3 sm:px-5 sm:py-3.5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between text-zinc-400 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold text-zinc-100 block text-xs sm:text-sm truncate">Cardápio QR Code na Mesa</span>
              <span className="text-[10px] sm:text-xs text-zinc-400 truncate block">Autoatendimento do cliente pelo smartphone</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector & Table Dropdown */}
        <div className="p-2.5 sm:p-3.5 bg-zinc-950/80 border-b border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 shrink-0">
          {/* Table Selector */}
          <div className="flex items-center gap-2 text-xs w-full sm:w-auto">
            <span className="text-zinc-400 text-xs font-medium shrink-0">Mesa:</span>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-750 text-zinc-100 text-xs sm:text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500 font-semibold w-full sm:w-auto truncate"
            >
              {(tables || []).map((tbl) => (
                <option key={tbl.id} value={tbl.id}>
                  Mesa 0{tbl.number} - {tbl.name} ({tbl.status === 'OCCUPIED' ? 'Ocupada' : 'Livre'})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs shrink-0 self-stretch sm:self-auto justify-center">
            <button
              type="button"
              onClick={() => setActiveMode('SIMULATOR')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
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
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
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
          <div className="p-3 sm:p-5 overflow-y-auto flex-1 flex flex-col items-center justify-start sm:justify-center w-full min-h-0 space-y-3">
            {/* Totem Card idêntico à imagem enviada pelo usuário, com tamanho e proporção perfeitos */}
            <div 
              id="totem-display-card"
              className="w-full max-w-[245px] sm:max-w-[255px] mx-auto p-4 sm:p-5 rounded-[26px] bg-white border-2 border-amber-400 shadow-2xl flex flex-col items-center justify-center text-center select-none shrink-0"
            >
              
              {/* Logomarca da Adega com fundo preto e bordas arredondadas */}
              <div className="w-11 h-11 rounded-xl overflow-hidden shadow-sm mx-auto mb-1.5 bg-black flex items-center justify-center p-1 border border-zinc-200/80 shrink-0">
                <img
                  src="/logo.jpg"
                  alt="AdeGaswg"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Nome da Adega e Subtítulo */}
              <h3 className="font-extrabold text-xs sm:text-[13px] text-zinc-800 uppercase tracking-wider leading-tight mt-0.5">
                {activeStore?.name || 'ADEGASWG'}
              </h3>
              <p className="text-[9.5px] text-zinc-500 font-medium mt-0.5 leading-none">
                Cardápio & Pedidos Digitais
              </p>

              {/* QR Code Nítido e Proporcional com moldura suave */}
              <div className="my-2.5 p-2.5 bg-white border border-zinc-200/80 rounded-2xl shadow-xs inline-flex items-center justify-center mx-auto">
                <QRCodeSVG
                  id="totem-mesa-qr-svg"
                  value={tableQrUrl}
                  size={135}
                  level="M"
                  className="w-32 h-32 sm:w-34 sm:h-34 max-w-full object-contain"
                />
              </div>

              {/* Tag com contorno da Mesa */}
              <div className="mx-auto">
                <div className="inline-flex items-center justify-center px-4 py-0.5 rounded-full border border-zinc-300 bg-white shadow-xs">
                  <span className="font-black text-[11px] text-zinc-900 tracking-wider">
                    MESA {String(currentTable.number).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Instruções do Autoatendimento */}
              <p className="text-[9px] text-zinc-500 mt-2 leading-tight max-w-[195px] mx-auto text-center font-normal">
                Aponte a câmera do seu smartphone para fazer pedidos sem esperar o garçom.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1 shrink-0">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>
              <button
                type="button"
                id="btn-print-table-display"
                onClick={handlePrintDisplay}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Display de Mesa</span>
              </button>
            </div>
          </div>
        ) : (
          /* Mobile Customer Simulator */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Store Brand Banner */}
            <div className="p-3 sm:p-4 md:p-5 bg-gradient-to-br from-amber-950/70 via-zinc-950 to-zinc-950 border-b border-zinc-800 text-center relative shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden border border-amber-500/40 shadow-md shadow-amber-950/60 mx-auto mb-1.5 sm:mb-2 bg-zinc-950 ring-1 ring-amber-500/25">
                <img
                  src="/logo.jpg"
                  alt="AdeGaswg"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-amber-500/20 text-amber-300 text-[11px] sm:text-xs font-bold border border-amber-500/30 mb-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>Mesa 0{currentTable.number} Conectada</span>
              </div>
              <h2 className="font-bold text-sm sm:text-base md:text-lg text-amber-200 font-serif tracking-wide">{activeStore?.name || 'AdeGaswg'}</h2>
              <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Cardápio interativo: peça garrafas, doses e petiscos</p>
            </div>

            {/* Categories & Search Filter */}
            <div className="p-2.5 sm:p-3.5 md:p-4 bg-zinc-950 border-b border-zinc-800/80 space-y-2.5 sm:space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar no cardápio (ex: Black Label, Heineken, Vinho, Porções)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 sm:py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 text-xs scrollbar-none touch-pan-x">
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
                    className={`px-3 py-1.5 sm:px-3.5 rounded-xl shrink-0 transition-all font-semibold text-xs whitespace-nowrap ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 p-3 sm:p-4 md:p-5 overflow-y-auto min-h-0">
              {orderSent ? (
                <div className="py-16 text-center space-y-3 bg-zinc-950/60 rounded-3xl border border-emerald-500/30 p-8 my-4 max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-zinc-100">Pedido Enviado com Sucesso!</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Os itens foram adicionados à comanda da <span className="text-amber-400 font-bold">Mesa 0{currentTable.number}</span> e impressos no KDS do Bar.
                  </p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center text-zinc-500 text-sm">
                  Nenhum item encontrado no cardápio.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex flex-col justify-between gap-2.5 hover:border-zinc-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover shrink-0 bg-zinc-900 border border-zinc-800" 
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs sm:text-sm text-zinc-100 truncate">{product.name}</h4>
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                            {product.isFractionable ? (
                              <>
                                <span className="text-[11px] sm:text-xs font-bold text-amber-400 font-mono">
                                  Dose: R$ {(product.pricePerDose ?? 20).toFixed(2)}
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
                                  Garrafa: R$ {(product.price ?? 0).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-amber-400 font-mono">
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
                                className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 text-xs font-bold transition-colors border border-amber-500/40"
                                title="Adicionar 1 Dose fracionada (50ml)"
                              >
                                + Dose
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAddItem(product, false)}
                                className="px-2 sm:px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold transition-colors"
                                title="Adicionar Garrafa Completa"
                              >
                                + Garrafa
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddItem(product, false)}
                              className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
                            >
                              + Pedir
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Optional Note Field */}
                      <div className="flex items-center gap-1.5 pt-1.5 border-t border-zinc-900">
                        <input
                          type="text"
                          placeholder="Observação (ex: com gelo e limão, bem gelada)..."
                          value={itemNoteInput[product.id] || ''}
                          onChange={(e) => setItemNoteInput({ ...itemNoteInput, [product.id]: e.target.value })}
                          className="w-full px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Cart Footer Drawer */}
            {!orderSent && customerCart.length > 0 && (
              <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 space-y-3 shrink-0">
                <div className="flex items-center justify-between text-xs sm:text-sm pb-1">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span className="text-zinc-200 font-semibold">{cartItemCount} item(ns) no seu pedido:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-base">
                    R$ {cartTotal.toFixed(2)}
                  </span>
                </div>

                {/* Cart Items Preview List */}
                <div className="max-h-32 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2 pr-1 py-1">
                  {customerCart.map((item, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
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
                          <span className="text-[10px] text-amber-300/80 truncate block">Obs: {item.notes}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-zinc-300 text-xs font-semibold">
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
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Send Order Button */}
                <button
                  type="button"
                  onClick={handleSendOrderFromPhone}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/50 transition-colors cursor-pointer"
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
