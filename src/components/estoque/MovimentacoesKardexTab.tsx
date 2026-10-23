import React, { useState, useMemo } from 'react';
import { 
  ArrowDownLeft, ArrowUpRight, History, Search, Filter, 
  Plus, Calendar, User, FileText, CheckCircle2, AlertTriangle, 
  RefreshCcw, Layers, X, DollarSign, ArrowRightLeft
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { MovimentacaoEstoque, TipoMovimentacaoEstoque } from '../../types';
import { ModalMovimentacaoEstoque } from './ModalMovimentacaoEstoque';

export const MovimentacoesKardexTab: React.FC = () => {
  const { 
    movimentacoesEstoque, 
    products, 
  } = useAdega();

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredMovements = useMemo(() => {
    return movimentacoesEstoque.filter((m) => {
      const matchSearch = 
        m.produtoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.documentoRef && m.documentoRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.motivo && m.motivo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchTipo = tipoFilter === 'TODOS' || m.tipo === tipoFilter;

      return matchSearch && matchTipo;
    });
  }, [movimentacoesEstoque, searchTerm, tipoFilter]);

  // Statistics
  const totalEntradas = movimentacoesEstoque
    .filter(m => m.quantidade > 0)
    .reduce((acc, m) => acc + m.quantidade, 0);

  const totalSaidas = movimentacoesEstoque
    .filter(m => m.quantidade < 0)
    .reduce((acc, m) => acc + Math.abs(m.quantidade), 0);

  const totalAjustes = movimentacoesEstoque
    .filter(m => m.tipo === 'AJUSTE' || m.tipo === 'AJUSTE_POSITIVO' || m.tipo === 'AJUSTE_NEGATIVO')
    .length;

  const getTipoBadge = (tipo: TipoMovimentacaoEstoque) => {
    switch (tipo) {
      case 'ENTRADA':
      case 'ENTRADA_COMPRA':
        return {
          label: 'Entrada / Compra',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: <ArrowDownLeft className="w-3 h-3" />
        };
      case 'SAIDA':
      case 'SAIDA_VENDA':
        return {
          label: 'Saída / Venda',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: <ArrowUpRight className="w-3 h-3" />
        };
      case 'AJUSTE':
        return {
          label: 'Ajuste de Estoque',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <RefreshCcw className="w-3 h-3" />
        };
      case 'AJUSTE_POSITIVO':
        return {
          label: 'Ajuste Positivo',
          color: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
          icon: <RefreshCcw className="w-3 h-3" />
        };
      case 'AJUSTE_NEGATIVO':
        return {
          label: 'Ajuste Negativo',
          color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: <RefreshCcw className="w-3 h-3" />
        };
      case 'PERDA_AVARIA':
        return {
          label: 'Perda / Avaria',
          color: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          icon: <AlertTriangle className="w-3 h-3" />
        };
      case 'TRANSFERENCIA_ENVIO':
        return {
          label: 'Transf. Envio',
          color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: <ArrowRightLeft className="w-3 h-3" />
        };
      case 'TRANSFERENCIA_RECEBIMENTO':
        return {
          label: 'Transf. Recebida',
          color: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
          icon: <ArrowRightLeft className="w-3 h-3" />
        };
      case 'ABERTURA_GARRAFA':
        return {
          label: 'Abertura Bancada',
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          icon: <Layers className="w-3 h-3" />
        };
      default:
        return {
          label: tipo,
          color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
          icon: <History className="w-3 h-3" />
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Entradas</p>
            <p className="text-xl font-black text-emerald-400 font-mono">+{totalEntradas} <span className="text-xs text-zinc-500 font-normal">un</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Total Saídas (Vendas)</p>
            <p className="text-xl font-black text-blue-400 font-mono">-{totalSaidas} <span className="text-xs text-zinc-500 font-normal">un</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <RefreshCcw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ajustes de Balanço</p>
            <p className="text-xl font-black text-amber-400 font-mono">{totalAjustes} <span className="text-xs text-zinc-500 font-normal">ocorrências</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Registros Kardex</p>
            <p className="text-xl font-black text-white font-mono">{movimentacoesEstoque.length} <span className="text-xs text-zinc-500 font-normal">logs</span></p>
          </div>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por produto, doc ou motivo..."
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="w-full sm:w-48 bg-zinc-950 border border-zinc-700/80 rounded-lg px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos os Tipos</option>
            <option value="ENTRADA_COMPRA">Entradas / Compras</option>
            <option value="SAIDA_VENDA">Saídas / Vendas PDV</option>
            <option value="AJUSTE_POSITIVO">Ajustes Positivos</option>
            <option value="AJUSTE_NEGATIVO">Ajustes Negativos</option>
            <option value="PERDA_AVARIA">Perdas & Avarias</option>
            <option value="TRANSFERENCIA_ENVIO">Transferência - Envio</option>
            <option value="TRANSFERENCIA_RECEBIMENTO">Transferência - Recebida</option>
            <option value="ABERTURA_GARRAFA">Abertura de Garrafa</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lançar Movimentação Manual</span>
        </button>
      </div>

      {/* Movements Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 uppercase text-[11px] text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Data & Hora</th>
                <th className="p-3.5">Produto</th>
                <th className="p-3.5 text-center">Tipo de Movimento</th>
                <th className="p-3.5 text-center">Quantidade</th>
                <th className="p-3.5 text-center">Saldo Anterior / Novo</th>
                <th className="p-3.5">Documento / Referência</th>
                <th className="p-3.5">Motivo / Justificativa</th>
                <th className="p-3.5">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-zinc-500">
                    Nenhuma movimentação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredMovements.map((mov) => {
                  const badge = getTipoBadge(mov.tipo);
                  const isPositive = mov.quantidade > 0;

                  return (
                    <tr key={mov.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {mov.dataHora}
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-white text-sm line-clamp-1">{mov.produtoNome}</p>
                        {mov.custoUnitario && (
                          <p className="text-[10px] text-zinc-500 font-mono">
                            Custo Un: R$ {mov.custoUnitario.toFixed(2)}
                          </p>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border inline-flex items-center gap-1.5 ${badge.color}`}>
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-sm">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? `+${mov.quantidade}` : mov.quantidade} un
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono text-xs text-zinc-400">
                        <span>{mov.saldoAnterior} un</span>
                        <span className="text-zinc-600 mx-1.5">→</span>
                        <span className="font-bold text-white">{mov.saldoPosterior} un</span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-[11px]">
                          {mov.documentoRef || 'S/ Ref'}
                        </span>
                      </td>

                      <td className="p-3.5 text-zinc-300 max-w-xs truncate text-[11px]">
                        {mov.motivo || 'Sem observações adicionais.'}
                      </td>

                      <td className="p-3.5 text-zinc-400 text-[11px] whitespace-nowrap">
                        {mov.usuarioNome}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl shadow-emerald-900/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODAL: MOVIMENTAÇÃO DE ESTOQUE (ENTRADA / SAÍDA / AJUSTE) COM PREVIEW EM TEMPO REAL */}
      <ModalMovimentacaoEstoque
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccessMessage={(msg) => showToast(msg)}
      />
    </div>
  );
};
