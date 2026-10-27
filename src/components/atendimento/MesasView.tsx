import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, Users, Clock, Plus, CheckCircle2, 
  X, CircleDollarSign, Wine, Droplets, AlertCircle,
  Receipt, ArrowRight, ShieldAlert, GitMerge, ArrowLeftRight,
  ShieldCheck, Calculator, Divide, Check, AlertTriangle, KeyRound,
  Move, MapPin, Sparkles, Navigation, Layers, Printer, Utensils, FileText
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Table, Product, CartItem, PaymentDetails, PaymentMethod, TableSector } from '../../types';
import { generatePreContaTicket, generateKitchenTicket, generateBarTicket, printThermalViaBrowser } from '../../utils/thermalPrinter';
import { playSuccessBeep } from '../../utils/peripheralUtils';

export const MesasView: React.FC = () => {
  const { 
    tables, 
    updateTable, 
    addOrderToTable, 
    closeTableAccount, 
    products, 
    currentUser,
    activeStore,
    juntarMesas,
    transferirItensMesa,
    transferirComandaCompletaMesa,
    removerCouvertMesa,
    definirConsumacaoMinimaMesa
  } = useAdega();

  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<Product | undefined>(products[0]);
  const [isDoseOrder, setIsDoseOrder] = useState<boolean>(true);
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [itemNotes, setItemNotes] = useState<string>('');
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState<boolean>(true);

  // Modos de visualização & Setores
  const [viewMode, setViewMode] = useState<'GRID' | 'FLOOR_PLAN'>('GRID');
  const [selectedSector, setSelectedSector] = useState<'ALL' | TableSector>('ALL');

  // Drag & Drop e Proximidade Física
  const [draggedTableId, setDraggedTableId] = useState<number | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<number | null>(null);
  const [transferAnimation, setTransferAnimation] = useState<{
    sourceTable: Table;
    targetTable: Table;
    progress: number;
    completed: boolean;
  } | null>(null);

  // Modals
  const [closePaymentOpen, setClosePaymentOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [splitPeopleCount, setSplitPeopleCount] = useState<number>(2);

  // Junção de Mesas Modal
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [targetMergeTableId, setTargetMergeTableId] = useState<number | null>(null);

  // Transferência de Itens Modal
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [transferQuantity, setTransferQuantity] = useState<number>(1);
  const [targetTransferTableId, setTargetTransferTableId] = useState<number | null>(null);

  // Transferência de Comanda Completa Modal (Acesso direto sem drag & drop)
  const [fullComandaModalOpen, setFullComandaModalOpen] = useState(false);
  const [fullComandaTargetId, setFullComandaTargetId] = useState<number | null>(null);

  // Isenção de Couvert Modal (PIN Gerente)
  const [couvertPinModal, setCouvertPinModal] = useState(false);
  const [managerPin, setManagerPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Cancela arraste se a tecla ESC for pressionada
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && draggedTableId !== null) {
        setDraggedTableId(null);
        setDragOverTableId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [draggedTableId]);

  const handleSelectTable = (table: Table) => {
    // Keep reference updated from state
    const currentT = tables.find((t) => t.id === table.id) || table;
    setSelectedTable(currentT);
    setIsDetailOpen(true);
    setSplitPeopleCount(currentT.guestsCount || 2);
  };

  const handleOpenNewTable = () => {
    if (!selectedTable) return;
    updateTable(selectedTable.id, {
      status: 'OCCUPIED',
      guestsCount: 2,
      openedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      waiterName: currentUser.name,
      totalAmount: 0,
      items: [],
      couvertPorPessoa: 15.00,
      consumacaoMinima: 50.00,
    });
    setSelectedTable({
      ...selectedTable,
      status: 'OCCUPIED',
      guestsCount: 2,
      openedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      waiterName: currentUser.name,
      totalAmount: 0,
      items: [],
      couvertPorPessoa: 15.00,
      consumacaoMinima: 50.00,
    });
  };

  const handleAddItemsToSelectedTable = () => {
    if (!selectedTable || !selectedProductToAdd) return;
    const unitPrice = isDoseOrder ? (selectedProductToAdd.pricePerDose || 20) : selectedProductToAdd.price;
    const item: CartItem = {
      product: selectedProductToAdd,
      quantity: orderQuantity,
      isDose: isDoseOrder,
      unitPrice,
      discount: 0,
      totalPrice: unitPrice * orderQuantity,
      notes: itemNotes || undefined,
    };

    addOrderToTable(selectedTable.id, [item]);

    // Update local drawer state
    setSelectedTable((prev) => prev ? {
      ...prev,
      totalAmount: prev.totalAmount + item.totalPrice,
      status: 'OCCUPIED',
      items: [...(prev.items || []), item],
    } : null);

    setItemNotes('');
    setOrderQuantity(1);
  };

  const handleRequestBill = () => {
    if (!selectedTable) return;
    updateTable(selectedTable.id, { status: 'BILL_REQUESTED' });
    setSelectedTable({ ...selectedTable, status: 'BILL_REQUESTED' });
  };

  // Cálculos da conta
  const calculateFinalTotal = (table?: Table | null) => {
    const subtotal = table?.totalAmount ?? 0;
    
    // Couvert
    const couvertTotal = table?.couvertIsento ? 0 : (table?.couvertPorPessoa || 0) * (table?.guestsCount || 1);
    
    // Consumação Mínima
    const minimo = table?.consumacaoMinima || 0;
    const diferencaMinimo = subtotal < minimo ? minimo - subtotal : 0;

    const baseComMinimo = subtotal + diferencaMinimo + couvertTotal;
    const taxaServico = serviceFeeEnabled ? baseComMinimo * 0.10 : 0;
    
    return {
      subtotal: subtotal || 0,
      couvertTotal: couvertTotal || 0,
      diferencaMinimo: diferencaMinimo || 0,
      taxaServico: taxaServico || 0,
      totalGeral: (baseComMinimo + taxaServico) || 0,
    };
  };

  const handleFinishTableClosing = () => {
    if (!selectedTable) return;
    const calc = calculateFinalTotal(selectedTable);
    const payment: PaymentDetails = {
      method: paymentMethod,
      amount: calc.totalGeral,
    };
    closeTableAccount(selectedTable.id, payment);
    setClosePaymentOpen(false);
    setIsDetailOpen(false);
    setSelectedTable(null);
  };

  // Junção de Mesas
  const handleConfirmMerge = () => {
    if (!selectedTable || !targetMergeTableId) return;
    const res = juntarMesas(selectedTable.id, targetMergeTableId);
    if (res.success) {
      setMergeModalOpen(false);
      setIsDetailOpen(false);
      setSelectedTable(null);
    }
  };

  // Transferência de Itens
  const handleConfirmTransfer = () => {
    if (!selectedTable || !targetTransferTableId) return;
    transferirItensMesa(selectedTable.id, targetTransferTableId, selectedItemIndex, transferQuantity);
    setTransferModalOpen(false);
    const updated = tables.find((t) => t.id === selectedTable.id);
    if (updated) setSelectedTable(updated);
  };

  // Isenção Couvert
  const handleConfirmIsencaoCouvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    const res = removerCouvertMesa(selectedTable.id, managerPin);
    if (res.success) {
      setCouvertPinModal(false);
      setManagerPin('');
      setPinError(null);
      const updated = tables.find((t) => t.id === selectedTable.id);
      if (updated) setSelectedTable(updated);
    } else {
      setPinError(res.message);
    }
  };

  // Impressão Térmica de Mesa
  const handlePrintPreConta = async () => {
    if (!selectedTable) return;
    playSuccessBeep();
    const calc = calculateFinalTotal(selectedTable);
    const ticket = generatePreContaTicket(
      {
        tableOrComandaName: `Mesa 0${selectedTable.number}`,
        number: selectedTable.number,
        waiterName: selectedTable.waiterName || currentUser.name,
        items: selectedTable.items || [],
        subtotal: calc.subtotal,
        serviceFee: calc.taxaServico,
        couvertTotal: calc.couvertTotal,
        total: calc.totalGeral,
      },
      activeStore,
      80
    );
    await printThermalViaBrowser(ticket.html, 80);
  };

  const handlePrintKitchen = async () => {
    if (!selectedTable || !selectedTable.items || selectedTable.items.length === 0) return;
    playSuccessBeep();
    const ticket = generateKitchenTicket(
      {
        code: `#M0${selectedTable.number}`,
        origin: 'MESA',
        originNumber: selectedTable.number,
        waiterName: selectedTable.waiterName || currentUser.name,
        customerName: selectedTable.customerName || `Mesa 0${selectedTable.number}`,
        items: selectedTable.items,
        generalNotes: 'Comanda reemitida pelo Salão',
      },
      activeStore,
      80
    );
    await printThermalViaBrowser(ticket.html, 80);
  };

  const handlePrintBar = async () => {
    if (!selectedTable || !selectedTable.items || selectedTable.items.length === 0) return;
    playSuccessBeep();
    const ticket = generateBarTicket(
      {
        code: `#M0${selectedTable.number}`,
        origin: 'MESA',
        originNumber: selectedTable.number,
        waiterName: selectedTable.waiterName || currentUser.name,
        customerName: selectedTable.customerName || `Mesa 0${selectedTable.number}`,
        items: selectedTable.items,
      },
      activeStore,
      80
    );
    await printThermalViaBrowser(ticket.html, 80);
  };

  const getStatusBadge = (status: Table['status']) => {
    switch (status) {
      case 'FREE':
        return { label: 'Livre', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' };
      case 'OCCUPIED':
        return { label: 'Ocupada', color: 'bg-amber-950/40 text-amber-400 border-amber-800/60' };
      case 'BILL_REQUESTED':
        return { label: 'Pedindo Conta', color: 'bg-blue-950/40 text-blue-400 border-blue-800/60' };
      case 'RESERVED':
        return { label: 'Reservada', color: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    }
  };

  const canCloseTable = currentUser.role !== 'WAITER';

  // Verificação de proximidade física entre mesas
  const isPhysicallyClose = (t1: Table, t2: Table): boolean => {
    if (t1.id === t2.id) return false;
    // Mesmo setor é considerado fisicamente próximo
    if (t1.sector && t2.sector && t1.sector === t2.sector) return true;
    // Se possuem coordenadas no mapa do salão
    if (t1.posX !== undefined && t1.posY !== undefined && t2.posX !== undefined && t2.posY !== undefined) {
      const dx = t1.posX - t2.posX;
      const dy = t1.posY - t2.posY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= 380;
    }
    return Math.abs(t1.number - t2.number) <= 2;
  };

  const getSectorLabel = (sector?: TableSector): string => {
    switch (sector) {
      case 'SALAO_PRINCIPAL': return 'Salão Principal';
      case 'DECK_EXTERNO': return 'Deck Externo';
      case 'BALCAO_VIP': return 'Balcão VIP';
      case 'MEZANINO': return 'Mezanino';
      default: return 'Salão Geral';
    }
  };

  // Disparo da transferência com animação suave e transição
  const triggerSmoothTransfer = (sourceId: number, targetId: number) => {
    const src = tables.find((t) => t.id === sourceId);
    const tgt = tables.find((t) => t.id === targetId);
    if (!src || !tgt || src.id === tgt.id) return;

    setTransferAnimation({
      sourceTable: src,
      targetTable: tgt,
      progress: 15,
      completed: false,
    });

    // Animação em etapas suaves
    setTimeout(() => {
      setTransferAnimation((prev) => prev ? { ...prev, progress: 65 } : null);
    }, 180);

    setTimeout(() => {
      transferirComandaCompletaMesa(sourceId, targetId);
      setTransferAnimation((prev) => prev ? { ...prev, progress: 100, completed: true } : null);
      
      // Fecha a sobreposição animada após celebração
      setTimeout(() => {
        setTransferAnimation(null);
        setDraggedTableId(null);
        setDragOverTableId(null);
        // Atualiza mesa selecionada se for uma das envolvidas
        const updatedTarget = tables.find((t) => t.id === targetId);
        if (selectedTable?.id === sourceId) {
          setSelectedTable(updatedTarget || null);
        }
      }, 700);
    }, 500);
  };

  const handleDrop = (targetTableId: number) => {
    if (!draggedTableId || draggedTableId === targetTableId) {
      setDraggedTableId(null);
      setDragOverTableId(null);
      return;
    }
    triggerSmoothTransfer(draggedTableId, targetTableId);
  };

  const filteredTables = (selectedSector === 'ALL'
    ? (tables || [])
    : (tables || []).filter((t) => t.sector === selectedSector)) || [];

  const draggedTableObj = draggedTableId ? ((tables || []).find((t) => t.id === draggedTableId) || null) : null;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 space-y-4 sm:space-y-6">
      {/* Header com controles de visualização */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        {/* Alternador de Modo */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'GRID'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Grade</span>
          </button>
          <button
            onClick={() => setViewMode('FLOOR_PLAN')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'FLOOR_PLAN'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Mapa Setores</span>
          </button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-xs bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-zinc-400">Livre</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-zinc-400">Ocupada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
            <span className="text-zinc-400">Pedindo Conta</span>
          </div>
        </div>
      </div>

      {/* Setores Filter Chips & Dica de Drag-and-Drop */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-xs text-zinc-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-zinc-500" />
            <span>Setor:</span>
          </span>
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'SALAO_PRINCIPAL', label: 'Salão Principal' },
            { id: 'DECK_EXTERNO', label: 'Deck Externo' },
            { id: 'BALCAO_VIP', label: 'Balcão VIP' },
            { id: 'MEZANINO', label: 'Mezanino' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSector(sec.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-colors shrink-0 ${
                selectedSector === sec.id
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-300/90 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Arraste uma mesa ocupada sobre outra para transferir a comanda</span>
        </div>
      </div>

      {/* Banner Ativo de Arraste em Andamento */}
      {draggedTableObj && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-zinc-900 border-2 border-amber-500/60 text-zinc-100 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 backdrop-blur-md"
        >
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40 animate-pulse shrink-0">
              <Move className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                  Transferência Ativa
                </span>
                <span className="text-sm font-bold text-zinc-100">
                  Comanda da Mesa 0{draggedTableObj.number}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  R$ {(draggedTableObj?.totalAmount ?? 0).toFixed(2)} • {draggedTableObj.items?.length || 0} item(ns)
                </span>
              </div>
              <div className="text-xs text-zinc-400 mt-1 flex items-center gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400" />
                  <strong>Mesas Livres:</strong> Transfere integralmente
                </span>
                <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400" />
                  <strong>Mesas Ocupadas:</strong> Unifica e soma consumos
                </span>
                <span className="text-zinc-500 hidden sm:inline">• Solte o cursor sobre a mesa desejada</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => {
                setDraggedTableId(null);
                setDragOverTableId(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5 transition-colors border border-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancelar (Esc)</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* RENDER VIEW: Grade de Mesas ou Planta Baixa Setorizada */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {(filteredTables || []).map((table) => {
            const badge = getStatusBadge(table.status);
            const isSelected = selectedTable?.id === table.id;
            const isDraggable = table.status !== 'FREE' && (table.items?.length || 0) > 0;
            const isSource = draggedTableId === table.id;
            const isValidDropTarget = Boolean(draggedTableId && draggedTableId !== table.id);
            const isTarget = dragOverTableId === table.id;
            const isClose = draggedTableObj ? isPhysicallyClose(draggedTableObj, table) : false;
            const isFreeTarget = table.status === 'FREE';
            const isOccupiedTarget = table.status === 'OCCUPIED' || table.status === 'BILL_REQUESTED';
            const isReservedTarget = table.status === 'RESERVED';

            // Classe dinâmica do card baseada no estado de Drag & Drop
            let cardBgAndBorder = 'bg-zinc-900 border-zinc-800 hover:border-zinc-700';
            if (isSource) {
              cardBgAndBorder = 'opacity-35 scale-95 border-dashed border-amber-500/50 bg-zinc-950/90 cursor-grabbing shadow-none ring-0';
            } else if (isTarget) {
              if (isFreeTarget) {
                cardBgAndBorder = 'bg-emerald-950/40 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl shadow-emerald-950 scale-[1.04] z-20';
              } else if (isOccupiedTarget) {
                cardBgAndBorder = 'bg-amber-950/40 border-2 border-amber-400 ring-4 ring-amber-400/50 shadow-2xl shadow-amber-950 scale-[1.04] z-20';
              } else {
                cardBgAndBorder = 'bg-blue-950/40 border-2 border-blue-400 ring-4 ring-blue-400/50 scale-[1.04] z-20';
              }
            } else if (isValidDropTarget) {
              if (isFreeTarget) {
                cardBgAndBorder = 'bg-emerald-950/15 border-2 border-dashed border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-950/30 transition-all';
              } else if (isOccupiedTarget) {
                cardBgAndBorder = 'bg-amber-950/15 border-2 border-dashed border-amber-500/60 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/20 hover:border-amber-400 hover:bg-amber-950/30 transition-all';
              } else {
                cardBgAndBorder = 'bg-blue-950/15 border-2 border-dashed border-blue-500/40 ring-1 ring-blue-500/20';
              }
            } else if (isSelected) {
              cardBgAndBorder = 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50 shadow-md';
            }

            return (
              <motion.div
                key={table.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: isTarget ? 1.04 : isSource ? 0.95 : 1 }}
                transition={{ duration: 0.18 }}
                draggable={isDraggable}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', String(table.id));
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggedTableId(table.id);
                }}
                onDragEnd={() => {
                  setDraggedTableId(null);
                  setDragOverTableId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (draggedTableId && draggedTableId !== table.id && dragOverTableId !== table.id) {
                    setDragOverTableId(table.id);
                  }
                }}
                onDragLeave={() => {
                  if (dragOverTableId === table.id) {
                    setDragOverTableId(null);
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDrop(table.id);
                }}
                onClick={() => handleSelectTable(table)}
                className={`relative p-4 sm:p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-4 hover:shadow-xl ${cardBgAndBorder}`}
              >
                {/* Visual Badges de Drop Válido e Alvo Hover */}
                {isTarget && draggedTableObj && (
                  <div className={`absolute inset-x-2 -top-3.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase text-center shadow-2xl z-30 flex items-center justify-center gap-1.5 animate-bounce ${
                    isFreeTarget 
                      ? 'bg-emerald-400 text-zinc-950 ring-2 ring-emerald-300' 
                      : isOccupiedTarget
                      ? 'bg-amber-400 text-zinc-950 ring-2 ring-amber-300'
                      : 'bg-blue-400 text-zinc-950'
                  }`}>
                    {isFreeTarget ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
                        <span>SOLTE AQUI ➔ Abrir Mesa 0{table.number} (Livre)</span>
                      </>
                    ) : isOccupiedTarget ? (
                      <>
                        <GitMerge className="w-3.5 h-3.5 text-zinc-950" />
                        <span>SOLTE AQUI ➔ Unificar com Mesa 0{table.number} (Total R$ {((table?.totalAmount ?? 0) + (draggedTableObj?.totalAmount ?? 0)).toFixed(2)})</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
                        <span>SOLTE AQUI ➔ Ocupar Mesa Reservada 0{table.number}</span>
                      </>
                    )}
                  </div>
                )}

                {/* Badge de área de drop válida quando não está sob hover direto */}
                {!isTarget && isValidDropTarget && draggedTableObj && (
                  <div className={`absolute -top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 z-10 shadow-md border ${
                    isFreeTarget
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70'
                      : isOccupiedTarget
                      ? 'bg-amber-950 text-amber-300 border-amber-500/70'
                      : 'bg-blue-950 text-blue-300 border-blue-500/70'
                  }`}>
                    {isFreeTarget ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>Área Drop: Mesa Livre</span>
                      </>
                    ) : isOccupiedTarget ? (
                      <>
                        <GitMerge className="w-2.5 h-2.5 text-amber-400" />
                        <span>Área Drop: Unificar Mesas</span>
                      </>
                    ) : (
                      <span>Área Drop: Reservada</span>
                    )}
                    {isClose && (
                      <span className="text-[8px] bg-zinc-800/90 text-cyan-300 px-1 py-0.2 rounded font-mono border border-cyan-500/30">
                        📍 Próxima
                      </span>
                    )}
                  </div>
                )}

                {/* Badge no card de Origem */}
                {isSource && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500/90 text-zinc-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md z-10 animate-pulse">
                    <span>Origem (Arrastando...)</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isDraggable && (
                        <span title="Segure e arraste para transferir comanda" className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-amber-400">
                          <Move className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <span className="text-lg font-black font-mono text-zinc-100">
                        Mesa 0{table.number}
                      </span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-400">
                    <span className="truncate">{table.name}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">Cap: {table.capacity || 4}p</span>
                  </div>

                  {table.sector && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-zinc-500">
                      <MapPin className="w-2.5 h-2.5 text-zinc-600" />
                      <span>{getSectorLabel(table.sector)}</span>
                    </div>
                  )}
                </div>

                {/* Bloco de Conteúdo / Feedback de Drop */}
                {draggedTableObj && isValidDropTarget ? (
                  /* MODO DE ARRASTE: Preview explícito do que acontecerá ao soltar */
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    {isFreeTarget ? (
                      <div className={`p-2.5 rounded-xl border text-center transition-all ${
                        isTarget
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-100 ring-1 ring-emerald-400/40'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      }`}>
                        <div className="flex items-center justify-center gap-1.5 text-xs font-bold">
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Abrir Mesa 0{table.number} com esta comanda</span>
                        </div>
                        <div className="text-[10px] text-emerald-400/90 mt-1 flex items-center justify-between font-mono px-1">
                          <span>Transferir integral:</span>
                          <span className="font-bold text-emerald-300">R$ {(draggedTableObj?.totalAmount ?? 0).toFixed(2)}</span>
                        </div>
                      </div>
                    ) : isOccupiedTarget ? (
                      <div className={`p-2 rounded-xl border text-xs transition-all space-y-1 ${
                        isTarget
                          ? 'bg-amber-500/20 border-amber-400 text-amber-100 ring-1 ring-amber-400/40'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      }`}>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="flex items-center gap-1 font-bold text-zinc-300">
                            <GitMerge className="w-3 h-3 text-amber-400" />
                            Unificar Contas:
                          </span>
                          <span className="font-mono font-bold text-amber-300">
                            ➔ R$ {((table?.totalAmount ?? 0) + (draggedTableObj?.totalAmount ?? 0)).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-zinc-400">
                          <span>Atual: R$ {(table?.totalAmount ?? 0).toFixed(2)}</span>
                          <span>+ R$ {(draggedTableObj?.totalAmount ?? 0).toFixed(2)} (Mesa 0{draggedTableObj.number})</span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-2.5 text-center text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        Solte para ocupar mesa reservada
                      </div>
                    )}
                  </div>
                ) : table.status !== 'FREE' && table.status !== 'RESERVED' ? (
                  /* MODO NORMAL: Mesa Ocupada */
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{table.openedAt}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{table.guestsCount} pagantes</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-zinc-400">Total Acumulado:</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        R$ {(table?.totalAmount ?? 0).toFixed(2)}
                      </span>
                    </div>

                    {table.items && table.items.length > 0 && (
                      <p className="text-[10px] text-emerald-400/90 font-mono flex items-center justify-between">
                        <span>{table.items.length} item(ns) lançados</span>
                        <span className="text-zinc-500 text-[9px]">Arraste p/ transferir ➔</span>
                      </p>
                    )}

                    {table.waiterName && (
                      <p className="text-[10px] text-zinc-500 truncate">Atendente: {table.waiterName}</p>
                    )}
                  </div>
                ) : (
                  /* MODO NORMAL: Mesa Livre */
                  <div className="py-4 text-center text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl hover:text-zinc-300 hover:border-zinc-700 transition-colors">
                    Toque para abrir comanda
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* VISTA: MAPA ARQUITETÔNICO DO SALÃO POR SETORES */
        <div className="space-y-6">
          {(['SALAO_PRINCIPAL', 'DECK_EXTERNO', 'BALCAO_VIP', 'MEZANINO'] as TableSector[]).map((setorKey) => {
            const setorTables = (tables || []).filter((t) => t.sector === setorKey);
            if (setorTables.length === 0) return null;

            return (
              <div key={setorKey} className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <h3 className="font-bold text-sm text-zinc-100 font-serif">{getSectorLabel(setorKey)}</h3>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                      {setorTables.length} mesas físicas
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    Ocupação: {setorTables.filter((t) => t.status === 'OCCUPIED' || t.status === 'BILL_REQUESTED').length} / {setorTables.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(setorTables || []).map((table) => {
                    const badge = getStatusBadge(table.status);
                    const isSelected = selectedTable?.id === table.id;
                    const isDraggable = table.status !== 'FREE' && (table.items?.length || 0) > 0;
                    const isSource = draggedTableId === table.id;
                    const isValidDropTarget = Boolean(draggedTableId && draggedTableId !== table.id);
                    const isTarget = dragOverTableId === table.id;
                    const isClose = draggedTableObj ? isPhysicallyClose(draggedTableObj, table) : false;
                    const isFreeTarget = table.status === 'FREE';
                    const isOccupiedTarget = table.status === 'OCCUPIED' || table.status === 'BILL_REQUESTED';

                    // Classe dinâmica do card baseada no estado de Drag & Drop
                    let cardBgAndBorder = 'bg-zinc-950 border-zinc-800/90 hover:border-zinc-700';
                    if (isSource) {
                      cardBgAndBorder = 'opacity-35 scale-95 border-dashed border-amber-500/50 bg-zinc-950/90 cursor-grabbing shadow-none ring-0';
                    } else if (isTarget) {
                      if (isFreeTarget) {
                        cardBgAndBorder = 'bg-emerald-950/40 border-2 border-emerald-400 ring-4 ring-emerald-400/50 shadow-2xl shadow-emerald-950 scale-[1.03] z-20';
                      } else if (isOccupiedTarget) {
                        cardBgAndBorder = 'bg-amber-500/25 border-2 border-amber-400 ring-4 ring-amber-400/40 shadow-2xl shadow-amber-950 scale-[1.03] z-20';
                      } else {
                        cardBgAndBorder = 'bg-blue-950/40 border-2 border-blue-400 ring-4 ring-blue-400/50 scale-[1.03] z-20';
                      }
                    } else if (isValidDropTarget) {
                      if (isFreeTarget) {
                        cardBgAndBorder = 'bg-emerald-950/15 border-2 border-dashed border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-md shadow-emerald-950/20 hover:border-emerald-400 transition-all';
                      } else if (isOccupiedTarget) {
                        cardBgAndBorder = 'bg-amber-950/15 border-2 border-dashed border-amber-500/60 ring-1 ring-amber-500/30 shadow-md shadow-amber-950/20 hover:border-amber-400 transition-all';
                      } else {
                        cardBgAndBorder = 'bg-blue-950/15 border-2 border-dashed border-blue-500/40 ring-1 ring-blue-500/20';
                      }
                    } else if (isSelected) {
                      cardBgAndBorder = 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/50';
                    }

                    return (
                      <motion.div
                        key={table.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, scale: isTarget ? 1.03 : isSource ? 0.95 : 1 }}
                        draggable={isDraggable}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', String(table.id));
                          e.dataTransfer.effectAllowed = 'move';
                          setDraggedTableId(table.id);
                        }}
                        onDragEnd={() => {
                          setDraggedTableId(null);
                          setDragOverTableId(null);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          if (draggedTableId && draggedTableId !== table.id && dragOverTableId !== table.id) {
                            setDragOverTableId(table.id);
                          }
                        }}
                        onDragLeave={() => {
                          if (dragOverTableId === table.id) setDragOverTableId(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDrop(table.id);
                        }}
                        onClick={() => handleSelectTable(table)}
                        className={`relative p-4 rounded-2xl border text-left cursor-pointer transition-all space-y-3 ${cardBgAndBorder}`}
                      >
                        {/* Target Hover Banner */}
                        {isTarget && draggedTableObj && (
                          <div className={`absolute inset-x-2 -top-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase text-center shadow-xl z-30 flex items-center justify-center gap-1 animate-bounce ${
                            isFreeTarget ? 'bg-emerald-400 text-zinc-950' : 'bg-amber-400 text-zinc-950'
                          }`}>
                            {isFreeTarget ? (
                              <span>SOLTE ➔ Abrir Mesa 0{table.number}</span>
                            ) : (
                              <span>SOLTE ➔ Unificar (R$ {((table?.totalAmount ?? 0) + (draggedTableObj?.totalAmount ?? 0)).toFixed(2)})</span>
                            )}
                          </div>
                        )}

                        {/* Drop Target Badge */}
                        {!isTarget && isValidDropTarget && (
                          <div className={`absolute -top-2.5 left-2 px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider flex items-center gap-1 z-10 border ${
                            isFreeTarget
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/70'
                              : 'bg-amber-950 text-amber-300 border-amber-500/70'
                          }`}>
                            {isFreeTarget ? <span>Drop Livre</span> : <span>Unificar</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            {isDraggable && <Move className="w-3.5 h-3.5 text-zinc-500 hover:text-amber-400 cursor-grab" />}
                            <span className="font-mono font-black text-sm text-zinc-100">Mesa 0{table.number}</span>
                          </div>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>

                        {draggedTableObj && isValidDropTarget ? (
                          <div className="text-xs pt-1 border-t border-zinc-800">
                            {isFreeTarget ? (
                              <p className="text-[10px] text-emerald-400 font-medium">
                                ➔ Migrar R$ {(draggedTableObj?.totalAmount ?? 0).toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-[10px] text-amber-300 font-medium">
                                ➔ Unificar p/ R$ {((table?.totalAmount ?? 0) + (draggedTableObj?.totalAmount ?? 0)).toFixed(2)}
                              </p>
                            )}
                          </div>
                        ) : table.status !== 'FREE' ? (
                          <div className="space-y-1.5 pt-2 border-t border-zinc-800 text-xs">
                            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                              <span>{table.guestsCount} pagantes</span>
                              <span className="font-mono text-amber-400 font-bold">R$ {(table?.totalAmount ?? 0).toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate">
                              {(table.items || []).length} itens • {table.waiterName || 'Atendente'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-zinc-600 text-center py-2 italic">Mesa disponível no {getSectorLabel(table.sector)}</p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ANIMAÇÃO DE TRANSIÇÃO SUAVE DE COMANDA ENTRE MESAS */}
      <AnimatePresence>
        {transferAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <h3 className="text-base font-bold text-zinc-100 font-serif">
                  {transferAnimation.completed
                    ? 'Transferência de Comanda Concluída!'
                    : 'Transferindo Comanda entre Mesas...'}
                </h3>
              </div>

              {/* Visual Flow Animation */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                {/* Mesa Origem */}
                <div className="flex-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Origem</span>
                  <p className="font-mono font-black text-amber-400 text-lg">Mesa 0{transferAnimation.sourceTable.number}</p>
                  <p className="text-xs text-zinc-300 font-mono font-bold">R$ {(transferAnimation?.sourceTable?.totalAmount ?? 0).toFixed(2)}</p>
                  <span className="text-[10px] text-zinc-500 block">{(transferAnimation.sourceTable.items || []).length} itens</span>
                </div>

                {/* Flying Arrow / Progress */}
                <div className="flex flex-col items-center justify-center px-2">
                  <motion.div
                    animate={{ x: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <ArrowRight className="w-6 h-6 text-amber-400" />
                  </motion.div>
                  <span className="text-[10px] text-amber-300/80 font-mono mt-1">
                    {transferAnimation.progress}%
                  </span>
                </div>

                {/* Mesa Destino */}
                <div className="flex-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Destino</span>
                  <p className="font-mono font-black text-emerald-400 text-lg">Mesa 0{transferAnimation.targetTable.number}</p>
                  <p className="text-xs text-zinc-300 font-mono font-bold">
                    {transferAnimation.targetTable.status === 'FREE' ? 'Mesa Livre' : `Total R$ ${(transferAnimation?.targetTable?.totalAmount ?? 0).toFixed(2)}`}
                  </p>
                  <span className="text-[10px] text-zinc-500 block">{getSectorLabel(transferAnimation.targetTable.sector)}</span>
                </div>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${transferAnimation.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-zinc-400 italic">
                  {transferAnimation.completed
                    ? 'Comanda transferida com sucesso no salão! Atualizando status...'
                    : 'Migrando itens consumidos, taxas e transferindo responsabilidade de comanda...'}
                </p>
              </div>

              {transferAnimation.completed && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-800/60"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Mesa 0{transferAnimation.targetTable.number} agora possui o consumo total atualizado!</span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table Detail Drawer */}
      {isDetailOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-zinc-900 border-l border-zinc-800 w-full max-w-lg h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-zinc-100 font-serif">Mesa 0{selectedTable.number} - {selectedTable.name}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getStatusBadge(selectedTable.status).color}`}>
                    {getStatusBadge(selectedTable.status).label}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Capacidade: {selectedTable.capacity || 4} pessoas • {selectedTable.guestsCount || 0} ocupantes
                </p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="text-zinc-400 hover:text-zinc-200 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {selectedTable.status === 'FREE' ? (
                <div className="text-center py-10 space-y-4">
                  <LayoutGrid className="w-12 h-12 text-zinc-700 mx-auto" />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-200">Esta mesa está livre</h4>
                    <p className="text-xs text-zinc-400 mt-1">Deseja abrir a mesa para receber novos clientes no salão?</p>
                  </div>
                  <button
                    onClick={handleOpenNewTable}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg transition-colors"
                  >
                    Abrir Mesa 0{selectedTable.number}
                  </button>
                </div>
              ) : (
                <>
                  {/* Action Buttons: Junção de Mesas, Transferência de Itens & Transferência de Comanda */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setMergeModalOpen(true)}
                      className="py-2 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors border border-zinc-700"
                    >
                      <GitMerge className="w-4 h-4 text-amber-400" />
                      <span>Juntar Mesas</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!selectedTable.items || selectedTable.items.length === 0) {
                          alert('Esta mesa não possui itens para transferir.');
                          return;
                        }
                        setTransferModalOpen(true);
                      }}
                      className="py-2 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors border border-zinc-700"
                    >
                      <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                      <span>Transferir Itens</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!selectedTable.items || selectedTable.items.length === 0) {
                          alert('Esta mesa não possui consumo para transferir.');
                          return;
                        }
                        setFullComandaModalOpen(true);
                      }}
                      className="py-2 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-colors border border-amber-500/30"
                    >
                      <Move className="w-4 h-4 text-amber-400" />
                      <span>Transferir Comanda</span>
                    </button>
                  </div>

                  {/* Consumo, Couvert, Consumação Mínima & Taxa de Serviço */}
                  {(() => {
                    const calc = calculateFinalTotal(selectedTable);
                    return (
                      <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                        <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                          <span>Consumo de Bebidas / Itens:</span>
                          <span className="font-mono font-bold text-zinc-200">
                            R$ {(calc?.subtotal ?? 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Couvert Artístico */}
                        <div className="flex items-center justify-between text-xs text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span>Couvert Artístico (R$ 15,00/pessoa):</span>
                            {selectedTable.couvertIsento ? (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold">
                                ISENTO
                              </span>
                            ) : (
                              <button
                                onClick={() => setCouvertPinModal(true)}
                                className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                                title="Isentar com autorização do gerente"
                              >
                                <KeyRound className="w-2.5 h-2.5" /> Isentar
                              </button>
                            )}
                          </div>
                          <span className="font-mono text-zinc-300">
                            {selectedTable.couvertIsento ? 'R$ 0,00' : `R$ ${(calc?.couvertTotal ?? 0).toFixed(2)}`}
                          </span>
                        </div>

                        {/* Consumação Mínima Alerta */}
                        {calc.diferencaMinimo > 0 && (
                          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              Complemento Consumação Mínima:
                            </span>
                            <span className="font-mono font-bold">+R$ {(calc?.diferencaMinimo ?? 0).toFixed(2)}</span>
                          </div>
                        )}

                        {/* Taxa de Serviço 10% */}
                        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={serviceFeeEnabled}
                              onChange={(e) => setServiceFeeEnabled(e.target.checked)}
                              className="rounded text-amber-500 focus:ring-0"
                            />
                            <span>Taxa de Serviço Garçom (10%)</span>
                          </label>
                          <span className="font-mono text-zinc-300">
                            R$ {(calc?.taxaServico ?? 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Total Final */}
                        <div className="flex items-center justify-between text-sm font-bold text-zinc-100 pt-2 border-t border-zinc-800">
                          <span>Total a Pagar:</span>
                          <span className="font-mono text-emerald-400 text-lg">
                            R$ {(calc?.totalGeral ?? 0).toFixed(2)}
                          </span>
                        </div>

                        {/* Divisão de Conta por Pessoa */}
                        <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <Calculator className="w-4 h-4 text-amber-400" />
                            <span className="text-zinc-400">Dividir conta por:</span>
                            <select
                              value={splitPeopleCount}
                              onChange={(e) => setSplitPeopleCount(Math.max(1, Number(e.target.value)))}
                              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-0.5 text-xs text-zinc-100 font-bold"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <option key={n} value={n}>{n} pessoas</option>
                              ))}
                            </select>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 block">Valor por pagante</span>
                            <span className="font-mono font-bold text-amber-300 text-xs">
                              R$ {((calc?.totalGeral ?? 0) / (splitPeopleCount || 1)).toFixed(2)} /pessoa
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Itens Lançados na Mesa */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-zinc-200">Itens Consumidos na Mesa</h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {(selectedTable.items || []).length} registro(s)
                      </span>
                    </div>

                    {(!selectedTable.items || selectedTable.items.length === 0) ? (
                      <p className="text-xs text-zinc-500 italic py-2">Nenhum item lançado ainda.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-zinc-900">
                        {(selectedTable.items || []).map((it, idx) => (
                          <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-zinc-100">{it.quantity}x {it.product.name}</span>
                                {it.isDose ? (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 py-0.2 rounded font-semibold">Dose</span>
                                ) : (
                                  <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded font-semibold">Garrafa</span>
                                )}
                              </div>
                              {it.notes && <p className="text-[10px] text-zinc-500 italic">{it.notes}</p>}
                            </div>
                            <span className="font-mono font-bold text-zinc-300">
                              R$ {(it?.totalPrice ?? 0).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lançar Novo Pedido no Salão */}
                  <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
                    <h4 className="font-bold text-xs text-zinc-200 flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-amber-400" />
                      <span>Lançar Pedido (Garçom / Balcão)</span>
                    </h4>

                    <div className="space-y-2">
                      {products.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-2">Nenhum produto cadastrado no catálogo.</p>
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-1">Selecionar Bebida</label>
                            <select
                              value={selectedProductToAdd?.id || ''}
                              onChange={(e) => {
                                const found = products.find((p) => p.id === e.target.value);
                                if (found) setSelectedProductToAdd(found);
                              }}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                            >
                              {(products || []).map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} {p.isFractionable ? `(Dose R$ ${(p.pricePerDose ?? 0).toFixed(2)} / Garrafa R$ ${(p.price ?? 0).toFixed(2)})` : `- R$ ${(p.price ?? 0).toFixed(2)}`}
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedProductToAdd?.isFractionable && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsDoseOrder(true)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                                  isDoseOrder
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                }`}
                              >
                                <Droplets className="w-3 h-3" />
                                <span>Dose ({selectedProductToAdd.doseVolumeMl}ml)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsDoseOrder(false)}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                                  !isDoseOrder
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                                    : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                }`}
                              >
                                <span>Garrafa Fechada</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[10px] text-zinc-400 block mb-1">Qtd</label>
                          <input
                            type="number"
                            min="1"
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 font-mono text-center"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="text-[10px] text-zinc-400 block mb-1">Obs (Gelo / Limão / Copo)</label>
                          <input
                            type="text"
                            placeholder="Ex: Copo com gelo de coco"
                            value={itemNotes}
                            onChange={(e) => setItemNotes(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 placeholder-zinc-500"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddItemsToSelectedTable}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-950/40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Lançar na Mesa e Enviar ao KDS</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer Actions */}
            {selectedTable.status !== 'FREE' && (
              <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-2">
                {/* Thermal Print Actions Bar */}
                <div className="grid grid-cols-3 gap-1.5 pb-1">
                  <button
                    type="button"
                    onClick={handlePrintPreConta}
                    className="py-2 px-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    title="Imprimir pré-conta para conferência na mesa (80mm)"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Pré-Conta</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintKitchen}
                    disabled={!selectedTable.items || selectedTable.items.length === 0}
                    className="py-2 px-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                    title="Imprimir comanda de petiscos e pratos para a cozinha"
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Cozinha</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintBar}
                    disabled={!selectedTable.items || selectedTable.items.length === 0}
                    className="py-2 px-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 text-[11px] font-bold flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
                    title="Imprimir comanda de bebidas e doses para o bar"
                  >
                    <Wine className="w-3.5 h-3.5" />
                    <span>Bar</span>
                  </button>
                </div>

                {selectedTable.status !== 'BILL_REQUESTED' && (
                  <button
                    onClick={handleRequestBill}
                    className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors"
                  >
                    Pedir a Conta (Cliente Solicitou no Salão)
                  </button>
                )}

                {canCloseTable ? (
                  <button
                    onClick={() => setClosePaymentOpen(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40"
                  >
                    <CircleDollarSign className="w-4 h-4" />
                    <span>Fechar Mesa e Receber no Caixa</span>
                  </button>
                ) : (
                  <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Garçom não possui permissão para receber pagamentos e fechar conta. Chame o caixa.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Junção de Mesas */}
      {mergeModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-zinc-100 font-serif">Unificar Mesa 0{selectedTable.number}</h3>
              </div>
              <button onClick={() => setMergeModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Todos os itens e o saldo acumulado da <strong>Mesa 0{selectedTable.number} (R$ {(selectedTable?.totalAmount ?? 0).toFixed(2)})</strong> serão somados à mesa de destino selecionada, liberando a mesa de origem.
            </p>

            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">Mesa de Destino</label>
              <select
                onChange={(e) => setTargetMergeTableId(Number(e.target.value))}
                defaultValue=""
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
              >
                <option value="" disabled>Selecione a outra mesa...</option>
                {(tables || [])
                  .filter((t) => t.id !== selectedTable.id && t.status === 'OCCUPIED')
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      Mesa 0{t.number} - {t.name} (Saldo atual: R$ {(t?.totalAmount ?? 0).toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setMergeModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                disabled={!targetMergeTableId}
                onClick={handleConfirmMerge}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs disabled:opacity-40"
              >
                Confirmar Junção
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transferência de Itens */}
      {transferModalOpen && selectedTable && selectedTable.items && selectedTable.items.length > 0 && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm text-zinc-100 font-serif">Transferir Itens da Mesa 0{selectedTable.number}</h3>
              </div>
              <button onClick={() => setTransferModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">Item a Transferir</label>
              <select
                value={selectedItemIndex}
                onChange={(e) => setSelectedItemIndex(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
              >
                {(selectedTable.items || []).map((it, idx) => (
                  <option key={idx} value={idx}>
                    {it.quantity}x {it.product.name} ({it.isDose ? 'Dose' : 'Garrafa'}) - R$ {(it?.totalPrice ?? 0).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  max={selectedTable.items?.[selectedItemIndex]?.quantity || 1}
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-100 font-mono text-center"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Mesa Destino</label>
                <select
                  onChange={(e) => setTargetTransferTableId(Number(e.target.value))}
                  defaultValue=""
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-200"
                >
                  <option value="" disabled>Escolher Mesa...</option>
                  {(tables || [])
                    .filter((t) => t.id !== selectedTable.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        Mesa 0{t.number} ({t.status === 'FREE' ? 'Livre' : 'Ocupada'})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                disabled={!targetTransferTableId}
                onClick={handleConfirmTransfer}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40"
              >
                Confirmar Transferência
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Isenção de Couvert (PIN Gerente) */}
      {couvertPinModal && selectedTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <KeyRound className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Autorização Gerencial de Couvert</h3>
            </div>

            <p className="text-xs text-zinc-400">
              A isenção do couvert artístico requer validação com PIN de Gerente ou Super Admin. O evento será registrado no log de auditoria fiscal.
            </p>

            <form onSubmit={handleConfirmIsencaoCouvert} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Senha do Gerente / Admin (Padrão: #Adegaswg2027*)</label>
                <input
                  type="password"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-center text-lg font-mono text-amber-400 tracking-widest"
                  required
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-xl border border-rose-800">
                  {pinError}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCouvertPinModal(false);
                    setManagerPin('');
                    setPinError(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  Autorizar Isenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Fechamento de Mesa e Pagamento */}
      {closePaymentOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Fechamento Mesa 0{selectedTable.number}</h3>
              <button onClick={() => setClosePaymentOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const calc = calculateFinalTotal(selectedTable);
              return (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Consumo Bruto:</span>
                    <span className="font-mono text-zinc-200">R$ {(calc?.subtotal ?? 0).toFixed(2)}</span>
                  </div>
                  {calc.couvertTotal > 0 && (
                    <div className="flex justify-between text-zinc-400">
                      <span>Couvert Artístico:</span>
                      <span className="font-mono text-zinc-200">R$ {(calc?.couvertTotal ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  {calc.diferencaMinimo > 0 && (
                    <div className="flex justify-between text-amber-300">
                      <span>Ajuste Consumação Mínima:</span>
                      <span className="font-mono">R$ {(calc?.diferencaMinimo ?? 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de Serviço ({serviceFeeEnabled ? '10%' : 'Recusada'}):</span>
                    <span className="font-mono text-zinc-200">R$ {(calc?.taxaServico ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-emerald-400 pt-2 border-t border-zinc-800">
                    <span>Total Final com Taxa:</span>
                    <span className="font-mono text-base">R$ {(calc?.totalGeral ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
              >
                <option value="PIX">PIX Dinâmico com QR Code</option>
                <option value="TEF_CREDITO">Cartão de Crédito TEF / Stone / Cielo</option>
                <option value="TEF_DEBITO">Cartão de Débito TEF</option>
                <option value="DINHEIRO">Dinheiro Físico no Caixa</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setClosePaymentOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Voltar
              </button>
              <button
                onClick={handleFinishTableClosing}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40"
              >
                Confirmar e Liberar Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Transferência de Comanda Completa (Alternativa ao Drag & Drop) */}
      {fullComandaModalOpen && selectedTable && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Move className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-zinc-100 font-serif">Transferir Comanda Completa</h3>
              </div>
              <button
                onClick={() => setFullComandaModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Mesa de Origem:</span>
                <strong className="text-zinc-100 font-mono">Mesa 0{selectedTable.number}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total a Transferir:</span>
                <strong className="text-amber-400 font-mono">R$ {(selectedTable?.totalAmount ?? 0).toFixed(2)}</strong>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Quantidade de Itens:</span>
                <strong className="text-zinc-200">{(selectedTable.items || []).length} itens</strong>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">
                Selecione a Mesa de Destino
              </label>
              <select
                value={fullComandaTargetId || ''}
                onChange={(e) => setFullComandaTargetId(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
              >
                <option value="">Selecione uma mesa...</option>
                {(tables || [])
                  .filter((t) => t.id !== selectedTable.id)
                  .map((t) => {
                    const close = isPhysicallyClose(selectedTable, t);
                    return (
                      <option key={t.id} value={t.id}>
                        Mesa 0{t.number} ({t.status === 'FREE' ? 'Livre' : `Ocupada - R$ ${(t?.totalAmount ?? 0).toFixed(2)}`}) - {getSectorLabel(t.sector)} {close ? '★ Próxima' : ''}
                      </option>
                    );
                  })}
              </select>
              <p className="text-[11px] text-zinc-500 mt-1">
                Você também pode arrastar o card da Mesa 0{selectedTable.number} diretamente sobre a mesa destino no mapa do salão.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setFullComandaModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                disabled={!fullComandaTargetId}
                onClick={() => {
                  if (!fullComandaTargetId) return;
                  setFullComandaModalOpen(false);
                  setIsDetailOpen(false);
                  triggerSmoothTransfer(selectedTable.id, fullComandaTargetId);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950/40"
              >
                Confirmar Transferência com Animação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
