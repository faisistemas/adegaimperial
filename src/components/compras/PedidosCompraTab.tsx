import React, { useState } from 'react';
import { 
  ShoppingBag, Plus, Search, Filter, Clock, Calendar, 
  ChevronRight, CheckCircle2, AlertTriangle, Truck, 
  FileText, ArrowRight, XCircle, Send, PackageCheck, Eye
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { PedidoCompra, StatusPedidoCompra } from '../../types';
import { NovoPedidoCompraModal } from './NovoPedidoCompraModal';
import { NovoRecebimentoModal } from './NovoRecebimentoModal';

export const PedidosCompraTab: React.FC = () => {
  const { 
    pedidosCompra, 
    atualizarStatusPedidoCompra, 
    cancelarPedidoCompra 
  } = useAdega();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusPedidoCompra | 'TODOS'>('TODOS');
  const [modalNovoPedidoAberto, setModalNovoPedidoAberto] = useState(false);

  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoCompra | null>(null);
  const [modalRecebimentoAberto, setModalRecebimentoAberto] = useState(false);
  const [pedidoParaReceberId, setPedidoParaReceberId] = useState<string | undefined>(undefined);

  const pedidosFiltrados = pedidosCompra.filter((p) => {
    const matchBusca =
      p.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      p.fornecedorNome.toLowerCase().includes(busca.toLowerCase()) ||
      p.fornecedorCnpj.includes(busca);

    const matchStatus = filtroStatus === 'TODOS' || p.status === filtroStatus;

    return matchBusca && matchStatus;
  });

  // Métricas
  const totalPedidos = pedidosCompra.length;
  const emAndamento = pedidosCompra.filter((p) => 
    ['APROVADO', 'ENVIADO_FORNECEDOR', 'RECEBIDO_PARCIAL'].includes(p.status)
  ).length;
  const valorTotalComprometido = pedidosCompra
    .filter((p) => !['RECEBIDO_TOTAL', 'CANCELADO'].includes(p.status))
    .reduce((acc, p) => acc + p.valorTotal, 0);

  const getStatusBadge = (status: StatusPedidoCompra) => {
    switch (status) {
      case 'RASCUNHO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Rascunho
          </span>
        );
      case 'EM_APROVACAO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Em Aprovação
          </span>
        );
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Aprovado
          </span>
        );
      case 'ENVIADO_FORNECEDOR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Em Trânsito / Enviado
          </span>
        );
      case 'RECEBIDO_PARCIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
            Recebido Parcial
          </span>
        );
      case 'RECEBIDO_TOTAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Entregue no Estoque
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Cancelado
          </span>
        );
    }
  };

  const handleAbrirRecebimento = (pedidoId: string) => {
    setPedidoParaReceberId(pedidoId);
    setModalRecebimentoAberto(true);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Total de Pedidos</span>
            <span className="text-2xl font-bold font-mono text-zinc-100">{totalPedidos}</span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">Histórico emitido</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Pedidos em Trânsito</span>
            <span className="text-2xl font-bold font-mono text-blue-400">{emAndamento}</span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">Aguardando entrega</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Valor Comprometido</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              R$ {valorTotalComprometido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Previsão financeira</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Pontualidade Entregas</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">98.4%</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">SLA de distribuidores</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por código (PC-2026...), fornecedor ou CNPJ..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="RASCUNHO">Rascunhos</option>
            <option value="EM_APROVACAO">Em Aprovação</option>
            <option value="APROVADO">Aprovados</option>
            <option value="ENVIADO_FORNECEDOR">Enviados ao Fornecedor</option>
            <option value="RECEBIDO_PARCIAL">Recebidos Parcialmente</option>
            <option value="RECEBIDO_TOTAL">Recebidos no Estoque</option>
            <option value="CANCELADO">Cancelados</option>
          </select>
        </div>

        <button
          onClick={() => setModalNovoPedidoAberto(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Emitir Novo Pedido de Compra</span>
        </button>
      </div>

      {/* Tabela de Pedidos de Compra */}
      {pedidosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
          <ShoppingBag className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">Nenhum pedido de compra localizado com os filtros atuais.</p>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-950/90 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Código / Emissão</th>
                  <th className="p-3.5">Fornecedor</th>
                  <th className="p-3.5">Itens Pedidos</th>
                  <th className="p-3.5 text-center">Previsão Entrega</th>
                  <th className="p-3.5 text-right">Valor Total</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {pedidosFiltrados.map((pedido) => {
                  const qtdTotalItens = pedido.itens.reduce((acc, i) => acc + i.quantidadePedida, 0);
                  const qtdRecebida = pedido.itens.reduce((acc, i) => acc + (i.quantidadeRecebida || 0), 0);

                  return (
                    <tr key={pedido.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold font-mono text-zinc-100">{pedido.codigo}</div>
                        <div className="text-[10px] text-zinc-500">{pedido.dataEmissao}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-semibold text-zinc-200">{pedido.fornecedorNome}</div>
                        <div className="text-[10px] font-mono text-zinc-500">{pedido.fornecedorCnpj}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-zinc-300">
                          {pedido.itens.length} produto{pedido.itens.length > 1 ? 's' : ''} ({qtdTotalItens} un)
                        </div>
                        {qtdRecebida > 0 && (
                          <div className="text-[10px] text-emerald-400 font-mono">
                            {qtdRecebida} de {qtdTotalItens} un recebidas
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center font-mono text-zinc-300">
                        {pedido.dataPrevisaoEntrega}
                      </td>

                      <td className="p-3.5 text-right font-mono font-bold text-amber-400 text-sm">
                        R$ {pedido.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="p-3.5 text-center">
                        {getStatusBadge(pedido.status)}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setPedidoSelecionado(pedido)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            title="Ver Detalhes do Pedido"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {pedido.status === 'APROVADO' && (
                            <button
                              onClick={() => atualizarStatusPedidoCompra(pedido.id, 'ENVIADO_FORNECEDOR', 'Transmitido ao distribuidor')}
                              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-zinc-950 border border-blue-500/20 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="Marcar como enviado"
                            >
                              <Send className="w-3 h-3" />
                              <span>Enviar</span>
                            </button>
                          )}

                          {['APROVADO', 'ENVIADO_FORNECEDOR', 'RECEBIDO_PARCIAL'].includes(pedido.status) && (
                            <button
                              onClick={() => handleAbrirRecebimento(pedido.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/20 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="Receber mercadorias fisicamente"
                            >
                              <PackageCheck className="w-3 h-3" />
                              <span>Receber</span>
                            </button>
                          )}

                          {pedido.status === 'RASCUNHO' && (
                            <button
                              onClick={() => atualizarStatusPedidoCompra(pedido.id, 'APROVADO', 'Aprovado pelo gestor')}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/20 text-[11px] font-bold transition-all"
                            >
                              Aprovar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Ordem de Compra */}
      {pedidoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    Pedido {pedidoSelecionado.codigo}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Emitido em {pedidoSelecionado.dataEmissao} • Fornecedor: {pedidoSelecionado.fornecedorNome}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPedidoSelecionado(null)}
                className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center justify-between p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Status Atual</span>
                  <div className="mt-1">{getStatusBadge(pedidoSelecionado.status)}</div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Valor Total</span>
                  <span className="text-lg font-bold font-mono text-amber-400">
                    R$ {pedidoSelecionado.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 mb-2">Itens da Ordem de Compra</h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5">Produto</th>
                        <th className="p-2.5 text-center">Qtd. Pedida</th>
                        <th className="p-2.5 text-center">Qtd. Recebida</th>
                        <th className="p-2.5 text-right">Custo Un.</th>
                        <th className="p-2.5 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {pedidoSelecionado.itens.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30">
                          <td className="p-2.5 font-medium text-zinc-200">{item.produtoNome}</td>
                          <td className="p-2.5 text-center font-mono">{item.quantidadePedida} un</td>
                          <td className="p-2.5 text-center font-mono text-emerald-400">
                            {item.quantidadeRecebida || 0} un
                          </td>
                          <td className="p-2.5 text-right font-mono">R$ {item.precoCustoUnitario.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-mono font-bold text-zinc-200">
                            R$ {item.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Linha do Tempo / Histórico de Auditoria */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 mb-2">Trilha de Auditoria & Status</h4>
                <div className="space-y-2">
                  {pedidoSelecionado.historicoStatus.map((h, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2.5 bg-zinc-950/60 border border-zinc-800/80 rounded-xl text-xs"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-zinc-200">{h.status}</span>
                          <span className="text-[10px] font-mono text-zinc-500">{h.dataHora}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Por: <span className="text-zinc-300">{h.usuario}</span>
                          {h.observacao && <span> — {h.observacao}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {pedidoSelecionado.observacoes && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300 block mb-0.5">Observações:</span>
                  {pedidoSelecionado.observacoes}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 border-t border-zinc-800 bg-zinc-950">
              {pedidoSelecionado.status !== 'CANCELADO' && pedidoSelecionado.status !== 'RECEBIDO_TOTAL' ? (
                <button
                  type="button"
                  onClick={() => {
                    const motivo = prompt('Informe o motivo do cancelamento do pedido:');
                    if (motivo) {
                      cancelarPedidoCompra(pedidoSelecionado.id, motivo);
                      setPedidoSelecionado(null);
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Cancelar Pedido
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {['APROVADO', 'ENVIADO_FORNECEDOR', 'RECEBIDO_PARCIAL'].includes(pedidoSelecionado.status) && (
                  <button
                    onClick={() => {
                      const id = pedidoSelecionado.id;
                      setPedidoSelecionado(null);
                      handleAbrirRecebimento(id);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/30"
                  >
                    <PackageCheck className="w-4 h-4" />
                    <span>Conferir Recebimento Físico</span>
                  </button>
                )}
                <button
                  onClick={() => setPedidoSelecionado(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Pedido */}
      <NovoPedidoCompraModal
        isOpen={modalNovoPedidoAberto}
        onClose={() => setModalNovoPedidoAberto(false)}
      />

      {/* Modal de Recebimento */}
      <NovoRecebimentoModal
        isOpen={modalRecebimentoAberto}
        onClose={() => {
          setModalRecebimentoAberto(false);
          setPedidoParaReceberId(undefined);
        }}
        pedidoPreSelecionadoId={pedidoParaReceberId}
      />
    </div>
  );
};
