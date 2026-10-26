import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, RotateCcw, Receipt, CheckCircle2, AlertTriangle, 
  XCircle, ArrowLeftRight, Clock, User, DollarSign, Calendar,
  Printer, Eye, ChevronRight, Check, X, ShieldAlert, FileText,
  BadgeAlert, ShoppingBag, Sparkles
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Order, DevolucaoVenda, MotivoDevolucao, DestinoItemDevolvido, FormaReembolsoDevolucao } from '../../types';

export const ConsultaVendasDevolucoesTab: React.FC = () => {
  const { orders, devolucoesVendas, realizarDevolucaoVenda, currentUser } = useAdega();

  // Sub-abas locais: 'vendas' | 'historico_devolucoes'
  const [subView, setSubView] = useState<'vendas' | 'historico_devolucoes'>('vendas');

  // Filtros de busca
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [channelFilter, setChannelFilter] = useState<string>('TODOS');
  const [periodoFilter, setPeriodoFilter] = useState<string>('TODOS');

  // Modais
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [devolucaoOrderModal, setDevolucaoOrderModal] = useState<Order | null>(null);
  const [viewDevolucaoDetails, setViewDevolucaoDetails] = useState<DevolucaoVenda | null>(null);

  // Estado do formulário de devolução
  const [itensDevolucao, setItensDevolucao] = useState<{
    [produtoId: string]: {
      selecionado: boolean;
      quantidade: number;
      motivo: MotivoDevolucao;
      destino: DestinoItemDevolvido;
      detalhes: string;
    };
  }>({});
  const [motivoGeralDevolucao, setMotivoGeralDevolucao] = useState('');
  const [formaReembolso, setFormaReembolso] = useState<FormaReembolsoDevolucao>('DINHEIRO');
  const [devolucaoFeedback, setDevolucaoFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Filtragem de vendas
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Busca texto
      const matchesSearch = 
        order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerCpf && order.customerCpf.includes(searchTerm)) ||
        (order.nfceKey && order.nfceKey.includes(searchTerm)) ||
        order.operatorName.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro Status
      let matchesStatus = true;
      if (statusFilter !== 'TODOS') {
        matchesStatus = order.status === statusFilter;
      }

      // Filtro Canal
      let matchesChannel = true;
      if (channelFilter !== 'TODOS') {
        matchesChannel = order.orderType === channelFilter;
      }

      return matchesSearch && matchesStatus && matchesChannel;
    });
  }, [orders, searchTerm, statusFilter, channelFilter]);

  // Cálculos de resumo
  const totalFaturado = useMemo(() => {
    return orders.reduce((sum, o) => (o.status !== 'CANCELLED' ? sum + o.total : sum), 0);
  }, [orders]);

  const totalDevolvido = useMemo(() => {
    return devolucoesVendas.reduce((sum, d) => sum + d.valorTotalDevolvido, 0);
  }, [devolucoesVendas]);

  // Iniciar devolução para um pedido
  const handleOpenDevolucaoModal = (order: Order) => {
    setDevolucaoOrderModal(order);
    setDevolucaoFeedback(null);
    setMotivoGeralDevolucao('');
    setFormaReembolso('DINHEIRO');

    // Inicializa os itens para seleção
    const initialItemsState: typeof itensDevolucao = {};
    order.items.forEach(it => {
      initialItemsState[it.product.id] = {
        selecionado: true,
        quantidade: it.quantity,
        motivo: 'DESISTENCIA_ARREPENDIMENTO',
        destino: 'RETORNO_ESTOQUE',
        detalhes: '',
      };
    });
    setItensDevolucao(initialItemsState);
  };

  // Submeter Devolução
  const handleConfirmarDevolucao = () => {
    if (!devolucaoOrderModal) return;

    const itensParaDevolver = devolucaoOrderModal.items
      .filter(it => itensDevolucao[it.product.id]?.selecionado && itensDevolucao[it.product.id]?.quantidade > 0)
      .map(it => {
        const itemConfig = itensDevolucao[it.product.id];
        return {
          produtoId: it.product.id,
          quantidade: itemConfig.quantidade,
          destino: itemConfig.destino,
          motivo: itemConfig.motivo,
          detalhes: itemConfig.detalhes,
        };
      });

    if (itensParaDevolver.length === 0) {
      setDevolucaoFeedback({ success: false, message: 'Selecione ao menos 1 item para devolver.' });
      return;
    }

    if (!motivoGeralDevolucao.trim()) {
      setDevolucaoFeedback({ success: false, message: 'Informe a justificativa/motivo da devolução.' });
      return;
    }

    const resultado = realizarDevolucaoVenda({
      orderId: devolucaoOrderModal.id,
      itens: itensParaDevolver,
      formaReembolso,
      motivoGeral: motivoGeralDevolucao,
    });

    if (resultado.success) {
      setDevolucaoFeedback({ success: true, message: resultado.message });
      setTimeout(() => {
        setDevolucaoOrderModal(null);
      }, 1500);
    } else {
      setDevolucaoFeedback({ success: false, message: resultado.message });
    }
  };

  return (
    <div id="consulta-vendas-devolucoes-container" className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Header & Métricas */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-3 sm:px-6 py-3 sm:py-3.5 flex-shrink-0 space-y-3">
        {/* Sub-abas de alternância */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1 sm:gap-2 bg-zinc-950/80 p-1 sm:p-1.5 rounded-lg border border-zinc-800 overflow-x-auto">
            <button
              id="tab-btn-vendas-ativas"
              onClick={() => setSubView('vendas')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                subView === 'vendas'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Vendas ({orders.length})</span>
            </button>
            <button
              id="tab-btn-devolucoes-historico"
              onClick={() => setSubView('historico_devolucoes')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 sm:gap-2 whitespace-nowrap ${
                subView === 'historico_devolucoes'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Devoluções ({devolucoesVendas.length})</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total de Vendas</span>
            <div className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">
              R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">Pedidos concluídos</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Total Estornado</span>
            <div className="text-base sm:text-lg font-bold text-red-400 mt-0.5">
              R$ {totalDevolvido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">{devolucoesVendas.length} ocorrências</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Ticket Médio</span>
            <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">
              R$ {orders.length > 0 ? (totalFaturado / orders.length).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
            </div>
            <span className="text-[10px] text-zinc-500">Por pedido emitido</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3">
            <span className="text-[10px] sm:text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Taxa Devolução</span>
            <div className="text-base sm:text-lg font-bold text-zinc-200 mt-0.5">
              {orders.length > 0 ? ((devolucoesVendas.length / orders.length) * 100).toFixed(1) : 0}%
            </div>
            <span className="text-[10px] text-zinc-500">Dentro do padrão</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: VENDAS REALIZADAS */}
      {subView === 'vendas' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-6 pb-24 lg:pb-6">
          {/* Filtros de pesquisa */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 sm:p-3.5 mb-3 sm:mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-busca-vendas"
                type="text"
                placeholder="Buscar por código (#101), cliente, CPF, operador ou chave NFC-e..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
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

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Canal:</span>
                <select
                  id="select-filtro-canal"
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODOS">Todos os canais</option>
                  <option value="PDV_BALCAO">PDV Balcão</option>
                  <option value="MESA">Mesa / Salão</option>
                  <option value="COMANDA">Comanda</option>
                  <option value="DELIVERY">Delivery</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">Status:</span>
                <select
                  id="select-filtro-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODOS">Todos os status</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="DEVOLVIDO_PARCIAL">Devolvido Parcial</option>
                  <option value="DEVOLVIDO_TOTAL">Devolvido Total</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="PREPARING">Em Preparo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Vendas */}
          <div className="flex-1 overflow-auto rounded-xl border border-zinc-800/80 bg-zinc-900/40">
            {filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <Receipt className="w-12 h-12 stroke-[1.2] mb-2 text-zinc-600" />
                <p className="text-sm font-medium">Nenhuma venda encontrada para os filtros selecionados.</p>
                <p className="text-xs text-zinc-600 mt-1">Tente remover os termos de busca ou mudar os filtros.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-zinc-300 border-collapse min-w-[700px]">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 sticky top-0 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Pedido</th>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Cliente / CPF</th>
                    <th className="py-3 px-4">Itens</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Pagamento</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {filteredOrders.map((order) => {
                    const isDevolvido = order.status === 'DEVOLVIDO_TOTAL' || order.status === 'DEVOLVIDO_PARCIAL';
                    return (
                      <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {order.code}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                          {order.createdAt}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {order.orderType === 'PDV_BALCAO' && 'Balcão PDV'}
                            {order.orderType === 'MESA' && `Mesa ${order.tableNumber || ''}`}
                            {order.orderType === 'COMANDA' && `Comanda ${order.comandaNumber || ''}`}
                            {order.orderType === 'DELIVERY' && 'Delivery'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">
                            {order.customerName || 'Consumidor Presencial'}
                          </div>
                          {order.customerCpf && (
                            <div className="text-[10px] text-zinc-500 font-mono">
                              CPF: {order.customerCpf}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="max-w-[200px] truncate text-zinc-300" title={order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}>
                            {order.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            ({order.items.length} {order.items.length === 1 ? 'item' : 'itens'})
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white whitespace-nowrap">
                          R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-zinc-300 font-mono text-[11px]">
                            {order.payment?.method || 'OUTRO'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                              order.status === 'COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : order.status === 'DEVOLVIDO_PARCIAL'
                                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                : order.status === 'DEVOLVIDO_TOTAL'
                                ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                : order.status === 'CANCELLED'
                                ? 'bg-zinc-700 text-zinc-400'
                                : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {order.status === 'COMPLETED' && 'Concluído'}
                            {order.status === 'DEVOLVIDO_PARCIAL' && 'Devolução Parcial'}
                            {order.status === 'DEVOLVIDO_TOTAL' && 'Devolvido Total'}
                            {order.status === 'CANCELLED' && 'Cancelado'}
                            {order.status === 'PREPARING' && 'Em Preparo'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              id={`btn-detalhes-${order.id}`}
                              onClick={() => setSelectedOrderDetails(order)}
                              title="Visualizar Cupom / Detalhes da Venda"
                              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {order.status !== 'DEVOLVIDO_TOTAL' && order.status !== 'CANCELLED' && (
                              <button
                                id={`btn-devolver-${order.id}`}
                                onClick={() => handleOpenDevolucaoModal(order)}
                                title="Realizar Devolução / Troca de Item"
                                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                Devolver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: HISTÓRICO DE DEVOLUÇÕES */}
      {subView === 'historico_devolucoes' && (
        <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-6 pb-24 lg:pb-6">
          <div className="flex-1 overflow-auto rounded-xl border border-zinc-800/80 bg-zinc-900/40">
            {devolucoesVendas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <RotateCcw className="w-12 h-12 stroke-[1.2] mb-2 text-zinc-600" />
                <p className="text-sm font-medium">Nenhuma devolução realizada até o momento.</p>
                <p className="text-xs text-zinc-600 mt-1">Quando itens forem devolvidos pelo PDV ou salão, o histórico detalhado aparecerá aqui.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-zinc-300 border-collapse min-w-[700px]">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 sticky top-0 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Registro</th>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Venda Ref.</th>
                    <th className="py-3 px-4">Operador</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Itens Devolvidos</th>
                    <th className="py-3 px-4">Destino no Estoque</th>
                    <th className="py-3 px-4">Reembolso</th>
                    <th className="py-3 px-4">Valor Devolvido</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {devolucoesVendas.map((dev) => (
                    <tr key={dev.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-red-400">
                        {dev.id}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                        {dev.dataHora}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">
                        {dev.orderCode}
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        {dev.operadorNome}
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300">
                        {dev.clienteNome || 'Consumidor Final'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {dev.itens.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              <span className="font-bold text-white">{it.quantidade}x</span> {it.produtoNome}
                              <span className="text-[10px] text-zinc-400 block">{it.motivo}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {dev.itens.map((it, idx) => (
                            <span 
                              key={idx}
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                it.destino === 'RETORNO_ESTOQUE'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/20'
                              }`}
                            >
                              {it.destino === 'RETORNO_ESTOQUE' ? '✓ Voltou ao Estoque' : '✗ Descarte / Avaria'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-200 border border-zinc-700">
                          {dev.formaReembolso === 'DINHEIRO' && 'Dinheiro (Espécie)'}
                          {dev.formaReembolso === 'ESTORNO_PIX_CARTAO' && 'Estorno PIX/Cartão'}
                          {dev.formaReembolso === 'VALE_CREDITO_CLIENTE' && 'Vale-Crédito Cliente'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-red-400 whitespace-nowrap">
                        R$ {dev.valorTotalDevolvido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setViewDevolucaoDetails(dev)}
                          className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                          title="Ver Comprovante de Devolução"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REALIZAR DEVOLUÇÃO */}
      {devolucaoOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    Devolução da Venda <span className="text-amber-400">{devolucaoOrderModal.code}</span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Selecione os itens a devolver, destino do estoque e forma de estorno.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDevolucaoOrderModal(null)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {devolucaoFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                    devolucaoFeedback.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                >
                  {devolucaoFeedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  {devolucaoFeedback.message}
                </div>
              )}

              {/* Informações da Venda Original */}
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Data da Venda</span>
                  <span className="text-white font-medium">{devolucaoOrderModal.createdAt}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Cliente</span>
                  <span className="text-white font-medium">{devolucaoOrderModal.customerName || 'Consumidor'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Forma Original</span>
                  <span className="text-white font-medium">{devolucaoOrderModal.payment?.method || 'OUTRO'}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px] uppercase">Total da Venda</span>
                  <span className="text-emerald-400 font-bold">R$ {devolucaoOrderModal.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Tabela de Itens para Devolução */}
              <div>
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                  Itens da Venda para Devolver:
                </label>
                <div className="space-y-3">
                  {devolucaoOrderModal.items.map((item) => {
                    const itemState = itensDevolucao[item.product.id] || {
                      selecionado: false,
                      quantidade: item.quantity,
                      motivo: 'DESISTENCIA_ARREPENDIMENTO',
                      destino: 'RETORNO_ESTOQUE',
                      detalhes: '',
                    };

                    const unitPrice = item.unitPrice || (item.totalPrice / (item.quantity || 1));

                    return (
                      <div
                        key={item.product.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          itemState.selecionado
                            ? 'bg-zinc-950 border-amber-500/40 ring-1 ring-amber-500/20'
                            : 'bg-zinc-950/40 border-zinc-800/80 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={itemState.selecionado}
                              onChange={(e) => {
                                setItensDevolucao(prev => ({
                                  ...prev,
                                  [item.product.id]: {
                                    ...prev[item.product.id],
                                    selecionado: e.target.checked,
                                  },
                                }));
                              }}
                              className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-amber-500"
                            />
                            <div>
                              <div className="text-xs font-bold text-white">{item.product.name}</div>
                              <div className="text-[10px] text-zinc-400">
                                Preço Un: R$ {unitPrice.toFixed(2)} | Qtd Comprada: {item.quantity}
                              </div>
                            </div>
                          </label>

                          {/* Quantidade a devolver */}
                          {itemState.selecionado && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-zinc-400">Devolver:</span>
                              <input
                                type="number"
                                min={1}
                                max={item.quantity}
                                value={itemState.quantidade}
                                onChange={(e) => {
                                  const val = Math.min(item.quantity, Math.max(1, parseInt(e.target.value) || 1));
                                  setItensDevolucao(prev => ({
                                    ...prev,
                                    [item.product.id]: {
                                      ...prev[item.product.id],
                                      quantidade: val,
                                    },
                                  }));
                                }}
                                className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-center text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                              />
                              <span className="text-xs font-bold text-red-400 whitespace-nowrap">
                                = R$ {(unitPrice * itemState.quantidade).toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Parâmetros adicionais do item caso selecionado */}
                        {itemState.selecionado && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-zinc-800/80 text-xs">
                            <div>
                              <span className="text-[10px] text-zinc-400 block mb-1">Motivo do Item:</span>
                              <select
                                value={itemState.motivo}
                                onChange={(e) => {
                                  setItensDevolucao(prev => ({
                                    ...prev,
                                    [item.product.id]: {
                                      ...prev[item.product.id],
                                      motivo: e.target.value as MotivoDevolucao,
                                    },
                                  }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                              >
                                <option value="DESISTENCIA_ARREPENDIMENTO">Desistência / Arrependimento</option>
                                <option value="PRODUTO_AVARIADO_OXIDADO">Avaria / Oxidação (Vinho bouchonné/defeito)</option>
                                <option value="ITEM_ERRADO">Item entregue errado</option>
                                <option value="ERRO_OPERADOR_DUPLICADO">Erro de bipagem / duplicidade</option>
                                <option value="VALIDADE_PROXIMA_VENCIDA">Validade vencida</option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[10px] text-zinc-400 block mb-1">Destino Físico do Estoque:</span>
                              <select
                                value={itemState.destino}
                                onChange={(e) => {
                                  setItensDevolucao(prev => ({
                                    ...prev,
                                    [item.product.id]: {
                                      ...prev[item.product.id],
                                      destino: e.target.value as DestinoItemDevolvido,
                                    },
                                  }));
                                }}
                                className="w-full bg-zinc-900 border border-zinc-700 text-xs text-zinc-200 rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                              >
                                <option value="RETORNO_ESTOQUE">✓ Retornar ao Estoque (Lacre intacto)</option>
                                <option value="PERDA_DESCARTE">✗ Descarte / Quebra / Avaria (Não volta ao estoque)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Forma de Reembolso e Justificativa Geral */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Forma de Reembolso:
                  </label>
                  <select
                    id="select-forma-reembolso"
                    value={formaReembolso}
                    onChange={(e) => setFormaReembolso(e.target.value as FormaReembolsoDevolucao)}
                    className="w-full bg-zinc-950 border border-zinc-700 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    <option value="DINHEIRO">Dinheiro (Sangria no Caixa do Turno)</option>
                    <option value="ESTORNO_PIX_CARTAO">Estorno na Chave PIX ou Maquininha TEF</option>
                    <option value="VALE_CREDITO_CLIENTE">Vale-Crédito na Conta do Cliente</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-300 block mb-1">
                    Operador Autorizador:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 rounded-lg px-3 py-2 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">
                  Justificativa / Motivo Geral da Devolução:
                </label>
                <textarea
                  id="textarea-motivo-geral"
                  rows={2}
                  placeholder="Explique detalhadamente o motivo da devolução ou troca..."
                  value={motivoGeralDevolucao}
                  onChange={(e) => setMotivoGeralDevolucao(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="text-xs text-zinc-400">
                Operação auditada e registrada no Kardex.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDevolucaoOrderModal(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-devolucao"
                  type="button"
                  onClick={handleConfirmarDevolucao}
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Confirmar Devolução
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DO PEDIDO / CUPOM FISCAL */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-white text-sm">
                  Detalhes do Pedido {selectedOrderDetails.code}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 font-mono text-xs bg-zinc-950/60 text-zinc-300">
              <div className="text-center border-b border-zinc-800 pb-3">
                <div className="font-bold text-white text-sm">ADEGASWG LTDA</div>
                <div className="text-[11px] text-zinc-400">DANFE NFC-e - Documento Auxiliar da Nota Fiscal</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Emissão: {selectedOrderDetails.createdAt}</div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-zinc-400 border-b border-zinc-800 pb-1 text-[11px]">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>TOTAL</span>
                </div>
                <div className="divide-y divide-zinc-900 pt-1">
                  {selectedOrderDetails.items.map((it, idx) => (
                    <div key={idx} className="py-1.5 flex justify-between">
                      <div>
                        <div className="font-bold text-white">{it.quantity}x {it.product.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          {it.isDose ? 'Dose Fracionada' : 'Garrafa Fechada'} @ R$ {(it.unitPrice || (it.totalPrice / it.quantity)).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-bold text-white">
                        R$ {it.totalPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {selectedOrderDetails.subtotal.toFixed(2)}</span>
                </div>
                {selectedOrderDetails.serviceFee > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de Serviço (10%):</span>
                    <span>R$ {selectedOrderDetails.serviceFee.toFixed(2)}</span>
                  </div>
                )}
                {selectedOrderDetails.deliveryFee > 0 && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Taxa de Entrega:</span>
                    <span>R$ {selectedOrderDetails.deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-white pt-1 border-t border-zinc-800">
                  <span>TOTAL PAGO:</span>
                  <span className="text-emerald-400">R$ {selectedOrderDetails.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Forma:</span>
                  <span className="font-bold text-amber-400">{selectedOrderDetails.payment?.method}</span>
                </div>
              </div>

              {selectedOrderDetails.nfceKey && (
                <div className="bg-zinc-900 p-2.5 rounded-lg border border-zinc-800 text-[10px] break-all">
                  <span className="text-zinc-500 block">Chave de Acesso NFC-e:</span>
                  <span className="text-amber-400 font-mono">{selectedOrderDetails.nfceKey}</span>
                  {selectedOrderDetails.nfceProtocol && (
                    <span className="text-zinc-400 block mt-1">Protocolo SEFAZ: {selectedOrderDetails.nfceProtocol}</span>
                  )}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-950">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: COMPROVANTE DE DEVOLUÇÃO */}
      {viewDevolucaoDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2 text-red-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Comprovante de Devolução</h3>
              </div>
              <button
                onClick={() => setViewDevolucaoDetails(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs bg-zinc-950/60 font-mono">
              <div className="text-center pb-2 border-zinc-800 border-b">
                <div className="font-bold text-white">ADEGASWG - ESTORNO</div>
                <div className="text-[10px] text-zinc-400">Registro: {viewDevolucaoDetails.id}</div>
                <div className="text-[10px] text-zinc-500">{viewDevolucaoDetails.dataHora}</div>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Venda Original:</span>
                <span className="font-bold text-amber-400">{viewDevolucaoDetails.orderCode}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Operador Responsável:</span>
                <span className="text-white">{viewDevolucaoDetails.operadorNome}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Itens Estornados:</span>
                {viewDevolucaoDetails.itens.map((it, idx) => (
                  <div key={idx} className="py-1 border-b border-zinc-900 flex justify-between">
                    <span>{it.quantidade}x {it.produtoNome}</span>
                    <span className="font-bold text-red-400">R$ {it.valorTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-between font-bold text-sm text-white">
                <span>TOTAL ESTORNADO:</span>
                <span className="text-red-400">R$ {viewDevolucaoDetails.valorTotalDevolvido.toFixed(2)}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Forma de Reembolso:</span>
                <span className="font-semibold text-zinc-200">{viewDevolucaoDetails.formaReembolso}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[10px]">Motivo Informado:</span>
                <span className="text-zinc-300 italic">{viewDevolucaoDetails.motivoGeral}</span>
              </div>
            </div>

            <div className="p-3 border-t border-zinc-800 flex justify-end bg-zinc-950">
              <button
                onClick={() => setViewDevolucaoDetails(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
