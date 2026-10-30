import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Plus, Edit2, Trash2, ArrowUpRight, 
  AlertTriangle, AlertOctagon, CheckCircle2, DollarSign, Barcode, Layers, 
  Percent, ShieldAlert, X, Filter, Sparkles, RefreshCw, Eye, History,
  ArrowRightLeft, Sliders, TrendingUp, TrendingDown, Upload
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Product, ProductCategory, ProductType, UnitOfMeasure } from '../../types';
import { ModalMovimentacaoEstoque } from './ModalMovimentacaoEstoque';
import { ModalHistoricoMovimentacoes } from './ModalHistoricoMovimentacoes';

export const SUBCATEGORIAS_SUGERIDAS: Record<string, string[]> = {
  destilados: [
    'Whisky Blended', 'Whisky Single Malt', 'Whisky Bourbon', 
    'Gin London Dry', 'Vodka Importada', 'Vodka Nacional', 
    'Tequila', 'Cachaça Artesanal', 'Rum', 'Licor', 'Aperitivo / Bitter'
  ],
  cervejas: [
    'Pilsen / Lager', 'Puro Malte / Lata', 'Long Neck Premium', 
    'Cerveja Artesanal / IPA', 'Chopp Barril 30L/50L', 'Sem Álcool', 'Trigo / Weiss'
  ],
  vinhos: [
    'Vinho Tinto', 'Vinho Branco', 'Vinho Rosé', 
    'Espumante & Champagne', 'Frisante', 'Licoroso / Vinho do Porto'
  ],
  combos: [
    'Combo Whisky + Energético', 'Combo Gin + Tônica', 
    'Combo Vodka + Suco', 'Copão 700ml', 'Kit Degustação'
  ],
  gelo_petiscos: [
    'Gelo Filtrado / Sacos', 'Gelo Saborizado', 
    'Energéticos', 'Refrigerantes & Sucos', 
    'Águas & Tônicas', 'Petiscos & Salgadinhos'
  ]
};

export const ProdutosCatalogoTab: React.FC = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    restockProduct 
  } = useAdega();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('TODAS');
  const [stockFilter, setStockFilter] = useState<'TODOS' | 'ZERADO' | 'CRITICO' | 'REGULAR'>('TODOS');

  // Modal State para Cadastro e Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Modal de Movimentação de Estoque (Entrada, Saída, Ajuste com Preview em Tempo Real)
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [productForMovement, setProductForMovement] = useState<Product | null>(null);

  // Modal de Histórico Completo de Movimentações
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [productForHistory, setProductForHistory] = useState<Product | null>(null);

  // Quick Restock Modal
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [restockUnits, setRestockUnits] = useState(12);
  const [restockMotivo, setRestockMotivo] = useState('Compra de Reposição');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Toast Feedback Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Form State for Product Add/Edit
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    barcode: '',
    packagingBarcode: '',
    category: 'destilados',
    subcategory: '',
    price: 99.90,
    costPrice: 50.00,
    wholesalePrice: 89.90,
    targetMarkupPercent: 65,
    marginPercent: 49.9,
    stockUnits: 12,
    minStockAlert: 4,
    maxStock: 48,
    tipoEmbalagem: 'UN',
    fatorConversaoEmbalagem: 1,
    isFractionable: false,
    bottleVolumeMl: 1000,
    doseVolumeMl: 50,
    pricePerDose: 20.00,
    exigeVasilhame: false,
    precoCaucaoVasilhame: 4.00,
    ncm: '2208.30.20',
    cfop: '5.405',
    cstIcms: '060',
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=80',
  });

  // Calculate pricing dynamics
  const handleCostChange = (cost: number) => {
    const markup = formData.targetMarkupPercent || 60;
    const suggestedPrice = cost * (1 + markup / 100);
    const margin = suggestedPrice > 0 ? ((suggestedPrice - cost) / suggestedPrice) * 100 : 0;
    setFormData(prev => ({
      ...prev,
      costPrice: cost,
      price: Number(suggestedPrice.toFixed(2)),
      marginPercent: Number(margin.toFixed(1))
    }));
  };

  const handlePriceChange = (price: number) => {
    const cost = formData.costPrice || 0;
    const markup = cost > 0 ? ((price - cost) / cost) * 100 : 0;
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    setFormData(prev => ({
      ...prev,
      price,
      targetMarkupPercent: Number(markup.toFixed(1)),
      marginPercent: Number(margin.toFixed(1))
    }));
  };

  const handleMarkupChange = (markup: number) => {
    const cost = formData.costPrice || 0;
    const price = cost * (1 + markup / 100);
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;
    setFormData(prev => ({
      ...prev,
      targetMarkupPercent: markup,
      price: Number(price.toFixed(2)),
      marginPercent: Number(margin.toFixed(1))
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      barcode: Math.floor(7890000000000 + Math.random() * 99999999999).toString(),
      packagingBarcode: '',
      category: (categories[0]?.slug as ProductCategory) || 'destilados',
      subcategory: '',
      price: 89.90,
      costPrice: 45.00,
      wholesalePrice: 79.90,
      targetMarkupPercent: 65,
      marginPercent: 49.9,
      stockUnits: 12,
      minStockAlert: 4,
      maxStock: 48,
      tipoEmbalagem: 'UN',
      fatorConversaoEmbalagem: 1,
      isFractionable: false,
      bottleVolumeMl: 1000,
      doseVolumeMl: 50,
      pricePerDose: 20.00,
      exigeVasilhame: false,
      precoCaucaoVasilhame: 4.00,
      ncm: '2208.30.20',
      cfop: '5.405',
      cstIcms: '060',
      image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=80',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    const cost = p.costPrice || 0;
    const price = p.price || 0;
    const markup = cost > 0 ? ((price - cost) / cost) * 100 : (p.targetMarkupPercent || 50);
    const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

    setFormData({
      ...p,
      subcategory: p.subcategory || '',
      packagingBarcode: p.packagingBarcode || '',
      wholesalePrice: p.wholesalePrice || Number((price * 0.9).toFixed(2)),
      targetMarkupPercent: Number(markup.toFixed(1)),
      marginPercent: Number(margin.toFixed(1)),
      tipoEmbalagem: p.tipoEmbalagem || 'UN',
      fatorConversaoEmbalagem: p.fatorConversaoEmbalagem || 1,
      maxStock: p.maxStock || (p.minStockAlert * 4),
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        name: formData.name.trim(),
        barcode: formData.barcode || editingProduct.barcode,
        packagingBarcode: formData.packagingBarcode?.trim() || undefined,
        category: (formData.category as ProductCategory) || editingProduct.category,
        subcategory: formData.subcategory?.trim() || undefined,
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
        wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : undefined,
        targetMarkupPercent: formData.targetMarkupPercent ? Number(formData.targetMarkupPercent) : undefined,
        marginPercent: formData.marginPercent ? Number(formData.marginPercent) : undefined,
        image: formData.image || editingProduct.image,
        tipoEmbalagem: formData.tipoEmbalagem || 'UN',
        fatorConversaoEmbalagem: Number(formData.fatorConversaoEmbalagem) || 1,
        stockUnits: Number(formData.stockUnits) ?? editingProduct.stockUnits,
        minStockAlert: Number(formData.minStockAlert) || 3,
        maxStock: formData.maxStock ? Number(formData.maxStock) : undefined,
        isFractionable: Boolean(formData.isFractionable),
        bottleVolumeMl: formData.isFractionable ? Number(formData.bottleVolumeMl) || 1000 : undefined,
        doseVolumeMl: formData.isFractionable ? Number(formData.doseVolumeMl) || 50 : undefined,
        pricePerDose: formData.isFractionable ? Number(formData.pricePerDose) || 15 : undefined,
        openBottleVolumeMl: formData.isFractionable ? (editingProduct.openBottleVolumeMl ?? Number(formData.bottleVolumeMl) ?? 1000) : undefined,
        exigeVasilhame: Boolean(formData.exigeVasilhame),
        precoCaucaoVasilhame: formData.exigeVasilhame ? Number(formData.precoCaucaoVasilhame) || 4 : undefined,
        ncm: formData.ncm || '2208.30.20',
        cfop: formData.cfop || '5.405',
        cstIcms: formData.cstIcms || '060',
      };
      updateProduct(updated);
      showToast(`Produto "${updated.name}" atualizado com sucesso!`);
    } else {
      // Create
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name.trim(),
        barcode: formData.barcode?.trim() || Math.floor(7890000000000 + Math.random() * 99999999999).toString(),
        packagingBarcode: formData.packagingBarcode?.trim() || undefined,
        category: (formData.category as ProductCategory) || 'destilados',
        subcategory: formData.subcategory?.trim() || undefined,
        price: Number(formData.price) || 0,
        costPrice: Number(formData.costPrice) || 0,
        wholesalePrice: formData.wholesalePrice ? Number(formData.wholesalePrice) : undefined,
        targetMarkupPercent: formData.targetMarkupPercent ? Number(formData.targetMarkupPercent) : undefined,
        marginPercent: formData.marginPercent ? Number(formData.marginPercent) : undefined,
        image: formData.image || 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=500&auto=format&fit=crop&q=80',
        tipoEmbalagem: formData.tipoEmbalagem || 'UN',
        fatorConversaoEmbalagem: Number(formData.fatorConversaoEmbalagem) || 1,
        stockUnits: Number(formData.stockUnits) || 0,
        minStockAlert: Number(formData.minStockAlert) || 3,
        maxStock: formData.maxStock ? Number(formData.maxStock) : undefined,
        isFractionable: Boolean(formData.isFractionable),
        bottleVolumeMl: formData.isFractionable ? Number(formData.bottleVolumeMl) || 1000 : undefined,
        doseVolumeMl: formData.isFractionable ? Number(formData.doseVolumeMl) || 50 : undefined,
        pricePerDose: formData.isFractionable ? Number(formData.pricePerDose) || 15 : undefined,
        openBottleVolumeMl: formData.isFractionable ? Number(formData.bottleVolumeMl) || 1000 : undefined,
        exigeVasilhame: Boolean(formData.exigeVasilhame),
        precoCaucaoVasilhame: formData.exigeVasilhame ? Number(formData.precoCaucaoVasilhame) || 4 : undefined,
        ncm: formData.ncm || '2208.30.20',
        cfop: formData.cfop || '5.405',
        cstIcms: formData.cstIcms || '060',
      };
      addProduct(newProd);
      showToast(`Produto "${newProd.name}" cadastrado com sucesso!`);
    }

    setIsModalOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      const img = new Image();
      img.onload = () => {
        // Redimensionar no canvas para manter peso leve e evitar estouro de armazenamento
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, image: dataUrl }));
        } else {
          setFormData(prev => ({ ...prev, image: result }));
        }
      };
      img.onerror = () => {
        setFormData(prev => ({ ...prev, image: result }));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmRestock = () => {
    if (!selectedProductForRestock) return;
    restockProduct(selectedProductForRestock.id, restockUnits, restockMotivo);
    setRestockModalOpen(false);
    setSelectedProductForRestock(null);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  // Dynamic list of subcategories based on products or suggestions
  const availableSubcategories = useMemo(() => {
    const setSubs = new Set<string>();
    
    // Add subcategories already in products
    products.forEach(p => {
      if (p.subcategory && p.subcategory.trim()) {
        if (selectedCategory === 'TODAS' || p.category === selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase()) {
          setSubs.add(p.subcategory.trim());
        }
      }
    });

    // Add suggestions for currently selected category
    if (selectedCategory !== 'TODAS' && SUBCATEGORIAS_SUGERIDAS[selectedCategory]) {
      SUBCATEGORIAS_SUGERIDAS[selectedCategory].forEach(s => setSubs.add(s));
    }

    return Array.from(setSubs).sort();
  }, [products, selectedCategory]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        p.barcode.includes(term) ||
        (p.packagingBarcode && p.packagingBarcode.includes(term)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(term));

      const matchCategory = 
        selectedCategory === 'TODAS' || 
        p.category === selectedCategory || 
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSubcategory = 
        selectedSubcategory === 'TODAS' || 
        (p.subcategory && p.subcategory.toLowerCase() === selectedSubcategory.toLowerCase());

      const isZero = p.stockUnits === 0 || p.stockUnits <= 0;
      const isCritical = !isZero && p.stockUnits <= p.minStockAlert;
      const isRegular = p.stockUnits > p.minStockAlert;

      const matchStock = 
        stockFilter === 'TODOS' ? true :
        stockFilter === 'ZERADO' ? isZero :
        stockFilter === 'CRITICO' ? isCritical :
        isRegular;

      return matchSearch && matchCategory && matchSubcategory && matchStock;
    });
  }, [products, searchTerm, selectedCategory, selectedSubcategory, stockFilter]);

  // Statistics
  const totalProdutos = products.length;
  const produtosZerados = products.filter(p => p.stockUnits === 0 || p.stockUnits <= 0).length;
  const produtosCriticos = products.filter(p => p.stockUnits > 0 && p.stockUnits <= p.minStockAlert).length;
  const produtosNormais = products.filter(p => p.stockUnits > p.minStockAlert).length;
  const valorEstoqueCusto = products.reduce((acc, p) => acc + (p.stockUnits * p.costPrice), 0);
  const margemMediaPercent = products.length > 0 
    ? products.reduce((acc, p) => acc + (p.price > 0 ? ((p.price - p.costPrice) / p.price) * 100 : 0), 0) / products.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast de Notificação */}
      {toastMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between shadow-lg backdrop-blur-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Statistics Cards com Destaque para Estoque Zerado */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total de Produtos */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider truncate">Cadastrados</p>
            <p className="text-lg font-black text-white">{totalProdutos} <span className="text-[10px] text-zinc-500 font-normal">itens</span></p>
          </div>
        </div>

        {/* Destaque Estoque Zerado */}
        <div 
          onClick={() => setStockFilter(stockFilter === 'ZERADO' ? 'TODOS' : 'ZERADO')}
          className={`cursor-pointer transition-all rounded-xl p-3.5 flex items-center gap-3 border ${
            produtosZerados > 0 
              ? 'bg-rose-950/40 border-rose-500/50 shadow-md shadow-rose-950/30 hover:border-rose-400' 
              : 'bg-zinc-900/80 border-zinc-800'
          }`}
          title="Clique para filtrar apenas produtos zerados"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            produtosZerados > 0 ? 'bg-rose-500 text-white animate-pulse' : 'bg-zinc-800 text-zinc-500'
          }`}>
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider truncate">Estoque Zerado</p>
            <p className={`text-lg font-black ${produtosZerados > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {produtosZerados} <span className="text-[10px] font-normal">esgotados</span>
            </p>
          </div>
        </div>

        {/* Estoque Crítico */}
        <div 
          onClick={() => setStockFilter(stockFilter === 'CRITICO' ? 'TODOS' : 'CRITICO')}
          className={`cursor-pointer transition-all rounded-xl p-3.5 flex items-center gap-3 border ${
            produtosCriticos > 0 ? 'bg-amber-500/10 border-amber-500/30 hover:border-amber-400' : 'bg-zinc-900/80 border-zinc-800'
          }`}
          title="Clique para filtrar produtos abaixo do estoque mínimo"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            produtosCriticos > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-zinc-800 text-zinc-500'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider truncate">Estoque Crítico</p>
            <p className={`text-lg font-black ${produtosCriticos > 0 ? 'text-amber-400' : 'text-zinc-300'}`}>
              {produtosCriticos} <span className="text-[10px] text-zinc-500 font-normal">abaixo mín.</span>
            </p>
          </div>
        </div>

        {/* Custo em Estoque */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider truncate">Custo Estoque</p>
            <p className="text-lg font-black text-blue-400 font-mono truncate">
              R$ {valorEstoqueCusto.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Margem Média */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider truncate">Margem Média</p>
            <p className="text-lg font-black text-emerald-400 font-mono">
              {margemMediaPercent.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Action Header & Search Controls */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3">
        {/* Linha 1: Campo de Busca, Categorias e Botões de Ação */}
        <div className="flex flex-col xl:flex-row gap-3 items-stretch xl:items-center justify-between">
          {/* Lado Esquerdo: Busca + Categoria + Subcategoria */}
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] sm:min-w-[260px] max-w-md">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar produto, código ou subcategoria..."
                className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-8 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('TODAS');
              }}
              className="w-full sm:w-44 bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="TODAS">Todas Categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>

            {/* Subcategory Filter */}
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="w-full sm:w-44 bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="TODAS">Todas Subcategorias</option>
              {availableSubcategories.map((sub, idx) => (
                <option key={idx} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Lado Direito: Botões de Ação */}
          <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                setProductForMovement(null);
                setMovementModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
              title="Registrar Entrada, Saída ou Ajuste de Estoque com preview em tempo real"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Movimentar Estoque</span>
            </button>

            <button
              onClick={() => {
                setProductForHistory(null);
                setHistoryModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
              title="Ver histórico geral de todas as movimentações"
            >
              <History className="w-3.5 h-3.5 text-blue-400" />
              <span>Histórico</span>
            </button>

            <button
              id="btn-adicionar-novo-produto-catalogo"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Produto</span>
            </button>
          </div>
        </div>

        {/* Linha 2: Segmentadores de Estoque e Filtros Ativos */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-zinc-800/60">
          {/* Segmentadores de Estoque */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setStockFilter('TODOS')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                stockFilter === 'TODOS' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({totalProdutos})
            </button>
            <button
              onClick={() => setStockFilter('ZERADO')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stockFilter === 'ZERADO' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-400 hover:bg-zinc-900'
              }`}
            >
              <AlertOctagon className="w-3 h-3" />
              Zerados ({produtosZerados})
            </button>
            <button
              onClick={() => setStockFilter('CRITICO')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                stockFilter === 'CRITICO' ? 'bg-amber-500 text-zinc-950' : 'text-amber-400 hover:bg-zinc-900'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Crítico ({produtosCriticos})
            </button>
            <button
              onClick={() => setStockFilter('REGULAR')}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                stockFilter === 'REGULAR' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Normal ({produtosNormais})
            </button>
          </div>

          {/* Filtros ativos com tag de remoção */}
          {(selectedCategory !== 'TODAS' || selectedSubcategory !== 'TODAS' || stockFilter !== 'TODOS' || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
              <span className="text-zinc-500">Filtros ativos:</span>
              {selectedCategory !== 'TODAS' && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 flex items-center gap-1">
                  Cat: {selectedCategory}
                  <button onClick={() => setSelectedCategory('TODAS')} className="hover:text-white cursor-pointer">×</button>
                </span>
              )}
              {selectedSubcategory !== 'TODAS' && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 flex items-center gap-1">
                  Subcat: {selectedSubcategory}
                  <button onClick={() => setSelectedSubcategory('TODAS')} className="hover:text-white cursor-pointer">×</button>
                </span>
              )}
              {stockFilter !== 'TODOS' && (
                <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                  stockFilter === 'ZERADO' ? 'bg-rose-500/20 text-rose-300 font-bold' : 'bg-zinc-800 text-white'
                }`}>
                  Estoque: {stockFilter}
                  <button onClick={() => setStockFilter('TODOS')} className="hover:text-white cursor-pointer">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 flex items-center gap-1">
                  Busca: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="hover:text-white cursor-pointer">×</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('TODAS');
                  setSelectedSubcategory('TODAS');
                  setStockFilter('TODOS');
                }}
                className="text-amber-400 hover:underline ml-auto cursor-pointer"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 uppercase text-[11px] text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Produto & Categorização</th>
                <th className="p-3.5">Código / DUN</th>
                <th className="p-3.5 text-center">Embalagem</th>
                <th className="p-3.5 text-right">Custo</th>
                <th className="p-3.5 text-right">Venda</th>
                <th className="p-3.5 text-center">Markup / Margem</th>
                <th className="p-3.5 text-center">Estoque Atual vs Mín</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    Nenhum produto encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const isZeroStock = prod.stockUnits === 0 || prod.stockUnits <= 0;
                  const isCritical = !isZeroStock && prod.stockUnits <= prod.minStockAlert;
                  const markup = prod.costPrice > 0 ? ((prod.price - prod.costPrice) / prod.costPrice) * 100 : 0;
                  const margem = prod.price > 0 ? ((prod.price - prod.costPrice) / prod.price) * 100 : 0;

                  return (
                    <tr 
                      key={prod.id} 
                      className={`transition-colors ${
                        isZeroStock 
                          ? 'bg-rose-950/25 hover:bg-rose-950/40 border-l-4 border-l-rose-500' 
                          : isCritical 
                            ? 'bg-amber-950/15 hover:bg-amber-950/25 border-l-2 border-l-amber-500/50' 
                            : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      {/* Product Name, Category & Subcategory */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className={`w-11 h-11 rounded-lg object-cover bg-zinc-800 border shrink-0 ${
                                isZeroStock ? 'border-rose-500/60 opacity-85' : 'border-zinc-700/60'
                              }`}
                              referrerPolicy="no-referrer"
                            />
                            {isZeroStock && (
                              <div className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white rounded-full p-0.5 shadow-sm" title="Estoque Zerado">
                                <AlertOctagon className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className={`font-bold text-sm line-clamp-1 ${isZeroStock ? 'text-rose-200' : 'text-white'}`}>
                                {prod.name}
                              </p>
                              {isZeroStock && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white uppercase tracking-wider shrink-0">
                                  ZERADO
                                </span>
                              )}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-1.5 mt-1">
                              {/* Categoria */}
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-amber-400 uppercase">
                                {prod.category}
                              </span>

                              {/* Subcategoria */}
                              {prod.subcategory && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800/90 text-zinc-300 border border-zinc-700/60">
                                  {prod.subcategory}
                                </span>
                              )}

                              {prod.isFractionable && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                  Dose R$ {prod.pricePerDose?.toFixed(2)}
                                </span>
                              )}
                              {prod.exigeVasilhame && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Casco R$ {prod.precoCaucaoVasilhame?.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Barcode & Packaging Barcode */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-300">
                            <Barcode className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{prod.barcode || 'S/ Código'}</span>
                          </div>
                          {prod.packagingBarcode && (
                            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-500">
                              <span className="text-amber-500/80 font-bold">DUN:</span> {prod.packagingBarcode}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Packaging Type */}
                      <td className="p-3.5 text-center">
                        <span className="px-2 py-1 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/60 font-mono text-[11px]">
                          {prod.tipoEmbalagem || 'UN'}
                          {prod.fatorConversaoEmbalagem && prod.fatorConversaoEmbalagem > 1 && (
                            <span className="text-amber-400 font-bold ml-1">({prod.fatorConversaoEmbalagem} un)</span>
                          )}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="p-3.5 text-right font-mono font-semibold text-zinc-400">
                        R$ {prod.costPrice.toFixed(2)}
                      </td>

                      {/* Retail Price */}
                      <td className="p-3.5 text-right">
                        <div className="font-mono font-bold text-white text-sm">
                          R$ {prod.price.toFixed(2)}
                        </div>
                        {prod.wholesalePrice && (
                          <div className="text-[10px] font-mono text-zinc-500">
                            Atacado: R$ {prod.wholesalePrice.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Markup & Margin */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
                          <span className="text-amber-400 font-bold">+{markup.toFixed(0)}%</span>
                          <span className="text-zinc-600">|</span>
                          <span className="text-emerald-400 font-semibold">{margem.toFixed(0)}% margem</span>
                        </div>
                      </td>

                      {/* Stock Units vs Min com DESTAQUE VISUAL VERMELHO PARA ZERADOS */}
                      <td className="p-3.5 text-center">
                        {isZeroStock ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className="px-3 py-1.5 rounded-lg font-mono font-black text-xs bg-rose-600 text-white border border-rose-400 shadow-md shadow-rose-950 flex items-center gap-1 animate-pulse">
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>0 un (ZERADO)</span>
                            </span>
                            <span className="text-[10px] text-rose-400 font-medium">
                              Mínimo: {prod.minStockAlert} un
                            </span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                              isCritical 
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                : 'bg-zinc-800 text-white border border-zinc-700'
                            }`}>
                              {prod.stockUnits} un
                            </span>
                            <span className="text-[11px] text-zinc-500 font-mono">
                              / mín {prod.minStockAlert}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Botão de Movimentação Completa (Entrada/Saída/Ajuste) com Preview */}
                          <button
                            title="Registrar Movimentação (Entrada, Saída, Ajuste)"
                            onClick={() => {
                              setProductForMovement(prod);
                              setMovementModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-400 text-zinc-400 transition-colors cursor-pointer"
                          >
                            <ArrowRightLeft className="w-4 h-4" />
                          </button>

                          {/* Botão de Histórico de Movimentações */}
                          <button
                            title="Ver Histórico de Movimentações deste Produto"
                            onClick={() => {
                              setProductForHistory(prod);
                              setHistoryModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-blue-500/20 hover:text-blue-400 text-zinc-400 transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Reposição Rápida */}
                          <button
                            title="Entrada Rápida de Estoque"
                            onClick={() => {
                              setSelectedProductForRestock(prod);
                              setRestockUnits(12);
                              setRestockModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-400 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* Editar Produto */}
                          <button
                            title="Editar Produto"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500/20 hover:text-amber-400 text-zinc-400 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Excluir Produto */}
                          <button
                            title="Excluir Produto"
                            onClick={() => {
                              setProductToDelete(prod);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CADASTRO / EDIÇÃO DE PRODUTO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-8">
            <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {editingProduct ? 'Editar Produto & Embalagem' : 'Cadastrar Novo Produto & Estoque'}
                  </h3>
                  <p className="text-[11px] text-zinc-400">Preencha os dados cadastrais, códigos de barra, precificação e estoque mínimo</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Seção 1: Identificação Básica */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <span>1. Dados Principais & Categorização</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Nome Completo do Produto *</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Whisky Johnnie Walker Black Label 1L"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Categoria Principal *</label>
                    <select
                      value={formData.category || 'destilados'}
                      onChange={(e) => {
                        const newCat = e.target.value as ProductCategory;
                        setFormData({ 
                          ...formData, 
                          category: newCat,
                          // If current subcategory doesn't belong, keep it or allow picking
                        });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-zinc-300">Subcategoria</label>
                      <span className="text-[10px] text-zinc-500">Ex: Whisky, Gin, IPA...</span>
                    </div>
                    <input
                      type="text"
                      list="sugestoes-subcategorias-form"
                      value={formData.subcategory || ''}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      placeholder="Digite ou selecione uma subcategoria"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                    <datalist id="sugestoes-subcategorias-form">
                      {(SUBCATEGORIAS_SUGERIDAS[formData.category || 'destilados'] || []).map((sub, idx) => (
                        <option key={idx} value={sub} />
                      ))}
                    </datalist>

                    {/* Sugestões rápidas em pills clicáveis */}
                    <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-y-auto">
                      {(SUBCATEGORIAS_SUGERIDAS[formData.category || 'destilados'] || []).slice(0, 4).map((sub, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, subcategory: sub })}
                          className={`text-[9px] px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                            formData.subcategory === sub 
                              ? 'bg-amber-500 text-zinc-950 font-bold' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          + {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">URL da Foto / Imagem</label>
                    <input
                      type="text"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />

                    {/* Opção de subir a imagem embaixo da URL */}
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 border border-zinc-700 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-zinc-400 flex-1 truncate">
                        {formData.image?.startsWith('data:image') 
                          ? '✓ Imagem carregada do dispositivo' 
                          : 'Ou selecione um arquivo do computador (PNG, JPG, WEBP)'}
                      </span>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, image: '' })}
                          className="text-[10px] text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Seção 2: Códigos de Barras e Embalagens */}
              <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Barcode className="w-3.5 h-3.5" />
                  <span>2. Códigos de Barras & Embalagem</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Código de Barras Unitário (EAN-13)</label>
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      placeholder="Ex: 7891991000826"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Código da Embalagem / Caixa (DUN-14)</label>
                    <input
                      type="text"
                      value={formData.packagingBarcode || ''}
                      onChange={(e) => setFormData({ ...formData, packagingBarcode: e.target.value })}
                      placeholder="Ex: 17891991000823 (Opcional)"
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Tipo de Embalagem</label>
                    <select
                      value={formData.tipoEmbalagem || 'UN'}
                      onChange={(e) => setFormData({ ...formData, tipoEmbalagem: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="UN">UN - Unidade Avulsa</option>
                      <option value="GARRAFA">GF - Garrafa</option>
                      <option value="LATA">LT - Lata</option>
                      <option value="FARDO">FD - Fardo</option>
                      <option value="CAIXA">CX - Caixa Fechada</option>
                      <option value="PACK">PK - Pack</option>
                      <option value="BARRIL">KEG - Barril de Chopp</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Fator de Conversão (un por embalagem)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.fatorConversaoEmbalagem || 1}
                      onChange={(e) => setFormData({ ...formData, fatorConversaoEmbalagem: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Precificação, Custo e Margens */}
              <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>3. Controle de Custos, Markup & Preço de Venda</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Preço de Custo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.costPrice ?? 0}
                      onChange={(e) => handleCostChange(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-amber-400 block mb-1">Markup Alvo (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.targetMarkupPercent ?? 60}
                      onChange={(e) => handleMarkupChange(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-amber-500/50 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Preço Venda Varejo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.price ?? 0}
                      onChange={(e) => handlePriceChange(Number(e.target.value))}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Preço Atacado / Caixa (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={formData.wholesalePrice ?? 0}
                      onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center justify-between text-xs">
                  <span className="text-zinc-400">Margem Bruta Estimada:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {formData.marginPercent ?? 0}%
                  </span>
                </div>
              </div>

              {/* Seção 4: Estoque Mínimo e Quantidades */}
              <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>4. Controle de Estoque & Alerta de Mínimo</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Estoque Atual (Unidades)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stockUnits ?? 0}
                      onChange={(e) => setFormData({ ...formData, stockUnits: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-rose-400 block mb-1">Estoque Mínimo (Ponto de Pedido)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.minStockAlert ?? 3}
                      onChange={(e) => setFormData({ ...formData, minStockAlert: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-rose-500/40 rounded-lg px-3 py-2 text-xs text-rose-400 font-mono font-bold focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-300 block mb-1">Estoque Máximo Recomendado</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.maxStock ?? 30}
                      onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Seção 5: Parâmetros de Adega (Doses & Vasilhames) */}
              <div className="space-y-3 border-t border-zinc-800/80 pt-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  5. Especialidades da Adega (Doses & Cascos)
                </h4>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.isFractionable)}
                      onChange={(e) => setFormData({ ...formData, isFractionable: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>Produto Fracionável em Doses (Balcão / Copo)</span>
                  </label>

                  {formData.isFractionable && (
                    <div className="grid grid-cols-3 gap-3 p-3 bg-zinc-950 rounded-lg border border-purple-500/30">
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Volume Garrafa (ml)</label>
                        <input
                          type="number"
                          value={formData.bottleVolumeMl || 1000}
                          onChange={(e) => setFormData({ ...formData, bottleVolumeMl: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 block mb-1">Volume Dose (ml)</label>
                        <input
                          type="number"
                          value={formData.doseVolumeMl || 50}
                          onChange={(e) => setFormData({ ...formData, doseVolumeMl: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-purple-400 block mb-1">Preço da Dose (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.pricePerDose || 20}
                          onChange={(e) => setFormData({ ...formData, pricePerDose: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-purple-500/50 rounded px-2 py-1 text-xs text-purple-400 font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300 pt-1">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.exigeVasilhame)}
                      onChange={(e) => setFormData({ ...formData, exigeVasilhame: e.target.checked })}
                      className="rounded text-amber-500 focus:ring-0"
                    />
                    <span>Exige Casco / Vasilhame Retornável</span>
                  </label>

                  {formData.exigeVasilhame && (
                    <div className="p-3 bg-zinc-950 rounded-lg border border-emerald-500/30">
                      <label className="text-[10px] text-emerald-400 block mb-1">Valor do Caução do Casco se não trouxer (R$)</label>
                      <input
                        type="number"
                        step="0.50"
                        value={formData.precoCaucaoVasilhame || 4.00}
                        onChange={(e) => setFormData({ ...formData, precoCaucaoVasilhame: Number(e.target.value) })}
                        className="w-44 bg-zinc-900 border border-emerald-500/50 rounded px-2 py-1 text-xs text-emerald-400 font-mono font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="pt-4 border-t border-zinc-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPOSIÇÃO RÁPIDA DE ESTOQUE */}
      {restockModalOpen && selectedProductForRestock && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>Reposição Rápida de Estoque</span>
              </h3>
              <button
                onClick={() => setRestockModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <p className="font-bold text-white text-sm">{selectedProductForRestock.name}</p>
                <p className="text-zinc-400 mt-1">
                  Estoque Atual: <span className="text-white font-mono font-bold">{selectedProductForRestock.stockUnits} un</span>
                  {' '} | Custo Unitário: <span className="text-zinc-300 font-mono">R$ {selectedProductForRestock.costPrice.toFixed(2)}</span>
                </p>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Quantidade a Adicionar (unidades):</label>
                <input
                  type="number"
                  min={1}
                  value={restockUnits}
                  onChange={(e) => setRestockUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Motivo / Documento:</label>
                <input
                  type="text"
                  value={restockMotivo}
                  onChange={(e) => setRestockMotivo(e.target.value)}
                  placeholder="Ex: Compra de Reposição NF 1042"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-lg text-emerald-400 font-mono text-center">
                Novo saldo previsto: {selectedProductForRestock.stockUnits + restockUnits} unidades
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRestock}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Confirmar Entrada (+{restockUnits} un)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR EXCLUSÃO DE PRODUTO */}
      {deleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Excluir Produto?</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tem certeza que deseja remover <strong className="text-white">{productToDelete.name}</strong> do catálogo de produtos?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: MOVIMENTAÇÃO DE ESTOQUE (ENTRADA / SAÍDA / AJUSTE) COM PREVIEW EM TEMPO REAL */}
      <ModalMovimentacaoEstoque
        isOpen={movementModalOpen}
        onClose={() => {
          setMovementModalOpen(false);
          setProductForMovement(null);
        }}
        preSelectedProduct={productForMovement || undefined}
        onSuccessMessage={(msg) => showToast(msg)}
      />

      {/* MODAL: HISTÓRICO COMPLETO DE MOVIMENTAÇÕES */}
      <ModalHistoricoMovimentacoes
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setProductForHistory(null);
        }}
        initialProductId={productForHistory?.id}
      />
    </div>
  );
};
