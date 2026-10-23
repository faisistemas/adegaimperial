import React, { useState, useMemo } from 'react';
import { 
  X, History, ArrowDownLeft, ArrowUpRight, RefreshCcw, 
  Search, Filter, Calendar, User, FileText, DollarSign,
  AlertTriangle, CheckCircle2, Sliders, ArrowRight
} from 'lucide-react';
import { Product, MovimentacaoEstoque, TipoMovimentacaoEstoque } from '../../types';
import { useAdega } from '../../context/AdegaContext';

interface ModalHistoricoMovimentacoesProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onOpenNovaMovimentacao?: (p: Product) => void;
}

export const ModalHistoricoMovimentacoes: React.FC<ModalHistoricoMovimentacoesProps> = ({
  isOpen,
  onClose,
  product,
  onOpenNovaMovimentacao,
}) => {
  const { movimentacoesEstoque } = useAdega();

  const [tipoFiltro, setTipoFiltro] = useState<string>('TODOS');
  const [termoBusca, setTermoBusca] = useState<string>('');

  // Movimentações do produto selecionado
  const movimentacoes = useMemo(() => {
    if (!product) return [];
    return movimentacoesEstoque
      .filter((m) => m.produtoId === product.id)
      .filter((m) => {
        if (tipoFiltro !== 'TODOS') {
          if (tipoFiltro === 'ENTRADAS' && m.quantidade <= 0) return false;
          if (tipoFiltro === 'SAIDAS' && m.quantidade >= 0) return false;
          if (tipoFiltro === 'AJUSTES' && !m.tipo.includes('AJUSTE')) return false;
        }
        if (termoBusca.trim()) {
          const termo = termoBusca.toLowerCase();
          const matchDoc = m.documentoRef?.toLowerCase().includes(termo);
          const matchMotivo = m.motivo?.toLowerCase().includes(termo);
          const matchUser = m.usuarioNome?.toLowerCase().includes(termo);
          return matchDoc || matchMotivo || matchUser;
        }
        return true;
      });
  }, [movimentacoesEstoque, product, tipoFiltro, termoBusca]);

  // Estatísticas do histórico deste produto
  const stats = useMemo(() => {
    if (!product) return { totalEntradas: 0, totalSaidas: 0, saldoAtual: 0 };
    const movsDoProduto = movimentacoesEstoque.filter(m => m.produtoId === product.id);
    const entradas = movsDoProduto.filter(m => m.quantidade > 0).reduce((acc, m) => acc + m.quantidade, 0);
    const saidas = movsDoProduto.filter(m => m.quantidade < 0).reduce((acc, m) => acc + Math.abs(m.quantidade), 0);
    return {
      totalEntradas: entradas,
      totalSaidas: saidas,
      saldoAtual: product.stockUnits
    };
  }, [movimentacoesEstoque, product]);

  if (!isOpen || !product) return null;

  const getTipoBadge = (tipo: TipoMovimentacaoEstoque, qtd: number) => {
    if (tipo === 'ENTRADA_COMPRA' || tipo === 'ENTRADA' || (tipo === 'AJUSTE_POSITIVO' && qtd > 0)) {
      return {
        label: 'Entrada / Reposição',
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: <ArrowDownLeft className="w-3.5 h-3.5" />
      };
    }
    if (tipo === 'SAIDA_VENDA' || tipo === 'SAIDA') {
      return {
        label: 'Saída / Venda',
        color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        icon: <ArrowUpRight className="w-3.5 h-3.5" />
      };
    }
    if (tipo === 'PERDA_AVARIA') {
      return {
        label: 'Perda / Avaria',
        color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: <AlertTriangle className="w-3.5 h-3.5" />
      };
    }
    if (tipo.includes('AJUSTE') || tipo === 'AJUSTE') {
      return {
        label: qtd >= 0 ? 'Ajuste Positivo' : 'Ajuste Negativo',
        color: qtd >= 0 ? 'bg-teal-500/15 text-teal-400 border-teal-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: <RefreshCcw className="w-3.5 h-3.5" />
      };
    }
    return {
      label: tipo,
      color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      icon: <Sliders className="w-3.5 h-3.5" />
    };
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Histórico Completo de Movimentações</span>
              </h3>
              <p className="text-xs text-zinc-400">
                Extrato de auditoria e movimentações registradas para este produto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informações do Produto & Estatísticas Rápidas */}
        <div className="p-4 bg-zinc-950/60 border-b border-zinc-800/80 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-11 h-11 rounded-lg object-cover bg-zinc-800 border border-zinc-700/60 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold text-white text-xs sm:text-sm">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-amber-400 uppercase">
                    {product.category}
                  </span>
                  {product.subcategory && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300">
                      {product.subcategory}
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-400 font-mono">
                    EAN: {product.barcode}
                  </span>
                </div>
              </div>
            </div>

            {onOpenNovaMovimentacao && (
              <button
                onClick={() => {
                  onClose();
                  onOpenNovaMovimentacao(product);
                }}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>Nova Movimentação</span>
              </button>
            )}
          </div>

          {/* Mini Cards de Estatísticas */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Total Entradas</span>
              <span className="text-base font-black font-mono text-emerald-400">+{stats.totalEntradas} un</span>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 font-semibold block uppercase">Total Saídas</span>
              <span className="text-base font-black font-mono text-rose-400">-{stats.totalSaidas} un</span>
            </div>
            <div className={`p-2.5 rounded-xl border text-center ${
              product.stockUnits === 0 ? 'bg-rose-950/30 border-rose-500/50 text-rose-400' :
              product.stockUnits <= product.minStockAlert ? 'bg-amber-950/30 border-amber-500/50 text-amber-400' :
              'bg-zinc-900 border-zinc-800 text-white'
            }`}>
              <span className="text-[10px] font-semibold block uppercase">Estoque Atual</span>
              <span className="text-base font-black font-mono">{product.stockUnits} un</span>
            </div>
          </div>
        </div>

        {/* Filtros da Lista de Histórico */}
        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por motivo, doc ou operador..."
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setTipoFiltro('TODOS')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                tipoFiltro === 'TODOS' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({movimentacoesEstoque.filter(m => m.produtoId === product.id).length})
            </button>
            <button
              onClick={() => setTipoFiltro('ENTRADAS')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                tipoFiltro === 'ENTRADAS' ? 'bg-emerald-500 text-zinc-950' : 'text-emerald-400 hover:bg-zinc-900'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => setTipoFiltro('SAIDAS')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                tipoFiltro === 'SAIDAS' ? 'bg-rose-500 text-white' : 'text-rose-400 hover:bg-zinc-900'
              }`}
            >
              Saídas
            </button>
            <button
              onClick={() => setTipoFiltro('AJUSTES')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                tipoFiltro === 'AJUSTES' ? 'bg-blue-500 text-white' : 'text-blue-400 hover:bg-zinc-900'
              }`}
            >
              Ajustes
            </button>
          </div>
        </div>

        {/* Tabela de Movimentações */}
        <div className="flex-1 overflow-y-auto">
          {movimentacoes.length === 0 ? (
            <div className="p-10 text-center text-zinc-500 text-xs space-y-2">
              <History className="w-8 h-8 mx-auto text-zinc-600 opacity-60" />
              <p className="font-semibold text-zinc-400">Nenhuma movimentação encontrada para este filtro.</p>
              <p className="text-[11px]">As movimentações são registradas a cada entrada, saída, venda ou ajuste de estoque.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950 uppercase text-[10px] text-zinc-400 font-semibold border-b border-zinc-800 sticky top-0 z-10">
                <tr>
                  <th className="p-3">Data & Hora</th>
                  <th className="p-3 text-center">Operação</th>
                  <th className="p-3 text-center">Qtd</th>
                  <th className="p-3 text-center">Transição Saldo</th>
                  <th className="p-3">Doc / Motivo</th>
                  <th className="p-3">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {movimentacoes.map((m) => {
                  const badge = getTipoBadge(m.tipo, m.quantidade);
                  const isPositive = m.quantidade > 0;

                  return (
                    <tr key={m.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {m.dataHora}
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-flex items-center gap-1 ${badge.color}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono font-bold text-xs">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? `+${m.quantidade}` : m.quantidade} un
                        </span>
                      </td>

                      <td className="p-3 text-center font-mono text-[11px]">
                        <span className="text-zinc-400">{m.saldoAnterior} un</span>
                        <span className="text-zinc-600 mx-1.5">→</span>
                        <span className="font-bold text-white">{m.saldoPosterior} un</span>
                      </td>

                      <td className="p-3 text-xs">
                        {m.documentoRef && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] mr-1.5 border border-zinc-700">
                            {m.documentoRef}
                          </span>
                        )}
                        <span className="text-zinc-300 text-[11px]">
                          {m.motivo || 'Movimentação registrada'}
                        </span>
                      </td>

                      <td className="p-3 text-zinc-400 text-[11px] whitespace-nowrap">
                        {m.usuarioNome}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-zinc-400">
            Total de {movimentacoes.length} registro(s) exibido(s)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
