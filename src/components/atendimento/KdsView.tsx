import React, { useState } from 'react';
import { 
  Tv, Clock, CheckCircle2, AlertTriangle, Flame, 
  Wine, Droplets, Bike, LayoutGrid, FileText, Bell, 
  Volume2, VolumeX, Search, Filter, Play, Check, ChevronRight, Plus, Printer
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { KdsPedido, KdsStatus } from '../../types';
import { printThermalViaBrowser } from '../../utils/thermalPrinter';
import { playSuccessBeep } from '../../utils/peripheralUtils';

export const KdsView: React.FC = () => {
  const { kdsPedidos, atualizarStatusKds, adicionarPedidoAoKds, currentUser, activeStore } = useAdega();
  const [selectedSetor, setSelectedSetor] = useState<'TODOS' | 'BAR' | 'COZINHA'>('TODOS');
  const [selectedCanal, setSelectedCanal] = useState<'TODOS' | 'MESA' | 'COMANDA' | 'DELIVERY'>('TODOS');
  const [selectedStatus, setSelectedStatus] = useState<'TODOS' | 'RECEBIDO' | 'PREPARANDO' | 'PRONTO' | 'ENTREGUE'>('TODOS');
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickOrderModal, setQuickOrderModal] = useState(false);
  const [quickDrinkName, setQuickDrinkName] = useState('Copão de Whisky Red Label + Energético');
  const [quickDestination, setQuickDestination] = useState('Mesa 05');

  // Filtered orders
  const filtered = (kdsPedidos || []).filter((ped) => {
    if (selectedSetor !== 'TODOS' && ped.setor !== selectedSetor) return false;
    if (selectedCanal !== 'TODOS' && ped.canal !== selectedCanal) return false;
    if (selectedStatus !== 'TODOS' && ped.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCode = (ped.orderCode || '').toLowerCase().includes(term);
      const matchClient = (ped.clienteNome || '').toLowerCase().includes(term);
      const matchItem = (ped.itens || []).some((it) => (it.nome || '').toLowerCase().includes(term));
      if (!matchCode && !matchClient && !matchItem) return false;
    }
    return true;
  });

  const totalRecebidos = (kdsPedidos || []).filter((p) => p.status === 'RECEBIDO').length;
  const totalPreparando = (kdsPedidos || []).filter((p) => p.status === 'PREPARANDO').length;
  const totalProntos = (kdsPedidos || []).filter((p) => p.status === 'PRONTO').length;

  const handleAdvanceStatus = (pedido: KdsPedido) => {
    if (pedido.status === 'RECEBIDO') {
      atualizarStatusKds(pedido.id, 'PREPARANDO');
    } else if (pedido.status === 'PREPARANDO') {
      atualizarStatusKds(pedido.id, 'PRONTO');
    } else if (pedido.status === 'PRONTO') {
      atualizarStatusKds(pedido.id, 'ENTREGUE');
    }
  };

  const handlePrintKdsTicket = async (pedido: KdsPedido) => {
    playSuccessBeep();
    const isKitchen = pedido.setor === 'COZINHA';
    const sectorHeader = isKitchen ? 'COZINHA & PETISCOS' : 'BAR & DOSES';
    const canalDest = pedido.canal === 'MESA' 
      ? `MESA 0${pedido.mesaNumero || '?'}`
      : pedido.canal === 'COMANDA'
      ? `COMANDA #${pedido.comandaNumero || '?'}`
      : 'DELIVERY / VIAGEM';

    const itemsHtml = (pedido.itens || []).map((it) => `
      <div style="margin: 6px 0; border-bottom: 1px dashed #bbb; padding-bottom: 4px;">
        <div style="font-weight: 900; font-size: 13px;">[ ${it.quantidade}x ] ${it.nome}</div>
        ${it.isDose ? '<div style="font-size: 10px; font-weight: bold;">(DOSE FRACIONADA)</div>' : ''}
        ${it.detalhes ? `<div style="font-size: 10px; font-style: italic; color: #333;">Obs: ${it.detalhes}</div>` : ''}
      </div>
    `).join('');

    const ticketHtml = `
      <div class="center bold large" style="margin-bottom: 2px;">*** TICKET DE PREPARO ***</div>
      <div class="center bold" style="font-size: 12px; margin-bottom: 4px;">${sectorHeader}</div>
      <div class="divider"></div>
      <div class="center bold large" style="background: #eee; padding: 4px; margin: 4px 0;">
        ${canalDest}
      </div>
      <div class="row">
        <span>PEDIDO: ${pedido.orderCode}</span>
        <span>HORA: ${pedido.horaEntrada}</span>
      </div>
      <div class="row">
        <span>CLIENTE: ${pedido.clienteNome}</span>
        <span>ATEND: ${pedido.garcomNome || 'Salão'}</span>
      </div>
      <div class="divider"></div>
      <div class="bold" style="margin-bottom: 4px;">ITENS A PREPARAR:</div>
      ${itemsHtml}
      <div class="divider"></div>
      <div class="center" style="font-size: 9px; margin-top: 6px;">
        ${activeStore.name} • ${new Date().toLocaleTimeString('pt-BR')}
      </div>
    `;

    await printThermalViaBrowser(ticketHtml, 80);
  };

  const handleCreateQuickOrder = (e: React.FormEvent) => {
    e.preventDefault();
    adicionarPedidoAoKds({
      orderCode: `#KDS-${Math.floor(100 + Math.random() * 900)}`,
      canal: quickDestination.startsWith('Mesa') ? 'MESA' : 'COMANDA',
      clienteNome: quickDestination,
      garcomNome: currentUser.name,
      itens: [
        {
          id: `ki-${Date.now()}`,
          nome: quickDrinkName,
          quantidade: 1,
          isDose: true,
          detalhes: 'Gelo de coco filtrado, copo descartável 700ml',
        },
      ],
      horaEntrada: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timestampEntrada: Date.now(),
      status: 'RECEBIDO',
      setor: 'BAR',
      prioridade: true,
    });
    setQuickOrderModal(false);
  };

  // Helper for timer styling
  const getTimerClass = (minutos: number, status: KdsStatus) => {
    if (status === 'PRONTO') {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    if (status === 'FINALIZADO') {
      return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
    if (minutos >= 10) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/60 animate-pulse font-bold';
    }
    if (minutos >= 5) {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-semibold';
    }
    return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60';
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-serif">KDS Bar & Cozinha</h2>
          <p className="text-xs text-zinc-400">Preparo em tempo real, tempos de espera e alertas sonoros</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Sound alert switch */}
          <button
            onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
              soundAlertEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
          >
            {soundAlertEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            <span>{soundAlertEnabled ? 'Sons Ativados' : 'Silenciado'}</span>
          </button>

          {/* Quick test order */}
          <button
            onClick={() => setQuickOrderModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Simular Ticket</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Na Fila (Recebidos)</p>
            <h3 className="text-xl font-mono font-bold text-amber-400 mt-0.5">{totalRecebidos}</h3>
          </div>
          <Clock className="w-6 h-6 text-amber-500/50" />
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Em Preparo no Balcão</p>
            <h3 className="text-xl font-mono font-bold text-blue-400 mt-0.5">{totalPreparando}</h3>
          </div>
          <Flame className="w-6 h-6 text-blue-500/50" />
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Prontos / Chamar Salão</p>
            <h3 className="text-xl font-mono font-bold text-emerald-400 mt-0.5">{totalProntos}</h3>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-500/50" />
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Meta Tempo de Atendimento</p>
            <h3 className="text-xl font-mono font-bold text-zinc-200 mt-0.5">&lt; 8 min</h3>
          </div>
          <Bell className="w-6 h-6 text-zinc-600" />
        </div>
      </div>

      {/* Control Toolbar: Filter by Sector, Channel and Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-zinc-900/90 rounded-2xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Setor */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['TODOS', 'BAR', 'COZINHA'] as const).map((setor) => (
              <button
                key={setor}
                onClick={() => setSelectedSetor(setor)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedSetor === setor
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {setor === 'TODOS' ? 'Todos Setores' : setor === 'BAR' ? 'Bar & Chopp' : 'Cozinha'}
              </button>
            ))}
          </div>

          {/* Canal */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['TODOS', 'MESA', 'COMANDA', 'DELIVERY'] as const).map((canal) => (
              <button
                key={canal}
                onClick={() => setSelectedCanal(canal)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  selectedCanal === canal
                    ? 'bg-zinc-800 text-amber-300 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {canal === 'TODOS' ? 'Todos Canais' : canal === 'MESA' ? 'Mesas' : canal === 'COMANDA' ? 'Comandas' : 'Delivery'}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['TODOS', 'RECEBIDO', 'PREPARANDO', 'PRONTO'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  selectedStatus === st
                    ? 'bg-zinc-700 text-zinc-100 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {st === 'TODOS' ? 'Status: Todos' : st === 'RECEBIDO' ? 'Na Fila' : st === 'PREPARANDO' ? 'Preparo' : 'Prontos'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ticket, item ou mesa..."
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto" />
          <h3 className="font-semibold text-sm text-zinc-200">Nenhum pedido pendente nesta visualização</h3>
          <p className="text-xs text-zinc-500">O balcão de preparo e o bar estão com todas as entregas em dia!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {(filtered || []).map((ped) => {
            const timerStyle = getTimerClass(ped.tempoDecorridoMinutos, ped.status);
            const isLate = ped.tempoDecorridoMinutos >= 10 && ped.status !== 'PRONTO' && ped.status !== 'ENTREGUE';

            return (
              <div
                key={ped.id}
                className={`rounded-2xl bg-zinc-900 border flex flex-col justify-between overflow-hidden shadow-lg transition-all ${
                  isLate
                    ? 'border-rose-500/80 shadow-rose-950/20'
                    : ped.status === 'PRONTO'
                    ? 'border-emerald-500/60 shadow-emerald-950/20'
                    : ped.status === 'PREPARANDO'
                    ? 'border-blue-500/50'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Card Top */}
                <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-zinc-100">{ped.orderCode}</span>
                      {ped.canal === 'MESA' && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                          MESA 0{ped.mesaNumero}
                        </span>
                      )}
                      {ped.canal === 'COMANDA' && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                          FICHA #{ped.comandaNumero}
                        </span>
                      )}
                      {ped.canal === 'DELIVERY' && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded font-bold">
                          DELIVERY
                        </span>
                      )}
                    </div>

                    {/* Timer Tag */}
                    <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${timerStyle}`}>
                      <Clock className="w-3 h-3" />
                      <span>{ped.tempoDecorridoMinutos} min</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
                    <span className="truncate">{ped.clienteNome}</span>
                    <span className="font-mono text-zinc-500">Entrada: {ped.horaEntrada}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 space-y-2.5 flex-1 overflow-y-auto max-h-56">
                  {(ped.itens || []).map((it) => (
                    <div key={it.id} className="p-2 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-zinc-100">
                          {it.quantidade}x {it.nome}
                        </span>
                        {it.isDose ? (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Droplets className="w-2.5 h-2.5" /> Dose
                          </span>
                        ) : (
                          <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Wine className="w-2.5 h-2.5" /> Garrafa
                          </span>
                        )}
                      </div>
                      {it.detalhes && (
                        <p className="text-[10px] text-amber-300/80 italic font-mono bg-zinc-900/60 p-1 rounded border border-zinc-800">
                          OBS: {it.detalhes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePrintKdsTicket(ped)}
                      className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-750 text-zinc-400 hover:text-amber-400 border border-zinc-750 transition-colors"
                      title="Imprimir comanda física na impressora térmica (80mm)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      <strong className="text-zinc-300 uppercase">{ped.status}</strong>
                    </span>
                  </div>

                  {ped.status === 'RECEBIDO' && (
                    <button
                      onClick={() => handleAdvanceStatus(ped)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Iniciar Preparo</span>
                    </button>
                  )}

                  {ped.status === 'PREPARANDO' && (
                    <button
                      onClick={() => handleAdvanceStatus(ped)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm animate-pulse"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Marcar Pronto</span>
                    </button>
                  )}

                  {ped.status === 'PRONTO' && (
                    <button
                      onClick={() => handleAdvanceStatus(ped)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all border border-emerald-500/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Liberar / Entregue</span>
                    </button>
                  )}

                  {ped.status === 'ENTREGUE' && (
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Finalizado</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Test Modal */}
      {quickOrderModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Simular Ticket no KDS do Bar</h3>
            <p className="text-xs text-zinc-400">
              Crie rapidamente um pedido fictício para verificar o fluxo de preparo, contagem regressiva e aviso ao salão.
            </p>

            <form onSubmit={handleCreateQuickOrder} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium">Bebida / Drink</label>
                <input
                  type="text"
                  value={quickDrinkName}
                  onChange={(e) => setQuickDrinkName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Destino / Localizador</label>
                <input
                  type="text"
                  value={quickDestination}
                  onChange={(e) => setQuickDestination(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickOrderModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
                >
                  Enviar ao Monitor do Bar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
