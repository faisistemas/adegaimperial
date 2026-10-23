import React, { useState } from 'react';
import { 
  Calendar, AlertTriangle, CheckCircle2, ShieldAlert, 
  Search, Filter, Clock, Tag, ArrowUpDown, DollarSign,
  Plus, X, Trash2, Layers
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ProdutoLote } from '../../types';

export const LotesValidadeTab: React.FC = () => {
  const { produtoLotes, products, activeStore, addProdutoLote, darBaixaLote } = useAdega();

  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ALERTA' | 'NORMAL'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal Novo Lote
  const [novoLoteModalOpen, setNovoLoteModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [numeroLote, setNumeroLote] = useState('');
  const [dataFabricacao, setDataFabricacao] = useState(new Date().toISOString().split('T')[0]);
  const [dataValidade, setDataValidade] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [quantidadeInicial, setQuantidadeInicial] = useState(24);
  const [custoUnitario, setCustoUnitario] = useState(30.00);

  // Modal Baixa de Lote
  const [baixaModalOpen, setBaixaModalOpen] = useState(false);
  const [selectedLoteForBaixa, setSelectedLoteForBaixa] = useState<ProdutoLote | null>(null);
  const [baixaQtd, setBaixaQtd] = useState(1);
  const [baixaMotivo, setBaixaMotivo] = useState('Validade Vencida');

  const lotesFiltrados = (produtoLotes || []).filter(lote => {
    const matchBusca = (lote.produtoNome || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (lote.numeroLote || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const isAlert = lote.status === 'ALERTA_VENCIMENTO' || (lote.diasAteVencer !== undefined && lote.diasAteVencer <= 30);

    if (filtroStatus === 'ALERTA') {
      return matchBusca && isAlert;
    }
    if (filtroStatus === 'NORMAL') {
      return matchBusca && !isAlert;
    }
    return matchBusca;
  });

  const totalEmAlerta = (produtoLotes || []).filter(
    l => l.status === 'ALERTA_VENCIMENTO' || (l.diasAteVencer !== undefined && loteIsAlert(l))
  ).length;

  function loteIsAlert(l: ProdutoLote) {
    const dias = l.diasAteVencer ?? l.diasParaVencer ?? 90;
    return dias <= 30;
  }

  const valorTotalLotes = (produtoLotes || []).reduce(
    (acc, l) => acc + ((l.quantidadeDisponivel ?? 0) * (l.custoUnitarioLote ?? l.precoCustoUnitario ?? 0)), 
    0
  );

  const handleOpenNovoLote = () => {
    const prod = products[0];
    if (prod) {
      setSelectedProductId(prod.id);
      setCustoUnitario(prod.costPrice || 25);
    }
    setNumeroLote(`LT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setQuantidadeInicial(24);
    setNovoLoteModalOpen(true);
  };

  const handleCreateLote = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    // Calcula dias até vencer
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diffTime = validade.getTime() - hoje.getTime();
    const diasAteVencer = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const isAlert = diasAteVencer <= 30;

    const [anoF, mesF, diaF] = dataFabricacao.split('-');
    const dataFabricacaoBR = `${diaF}/${mesF}/${anoF}`;

    const [anoV, mesV, diaV] = dataValidade.split('-');
    const dataValidadeBR = `${diaV}/${mesV}/${anoV}`;

    const novoLote: ProdutoLote = {
      id: `lote-${Date.now()}`,
      lojaId: activeStore?.id || 'loja-matriz',
      produtoId: prod.id,
      produtoNome: prod.name,
      numeroLote: numeroLote.trim() || `LT-${Date.now().toString().slice(-4)}`,
      dataFabricacao: dataFabricacaoBR,
      dataValidade: dataValidadeBR,
      quantidadeInicial,
      quantidadeDisponivel: quantidadeInicial,
      status: isAlert ? 'ALERTA_VENCIMENTO' : 'NORMAL',
      statusValidade: isAlert ? 'ALERTA_PROXIMO' : 'NORMAL',
      diasAteVencer,
      diasParaVencer: diasAteVencer,
      custoUnitarioLote: custoUnitario,
      precoCustoUnitario: custoUnitario,
    };

    addProdutoLote(novoLote);
    setNovoLoteModalOpen(false);
  };

  const handleConfirmBaixa = () => {
    if (!selectedLoteForBaixa) return;
    darBaixaLote(selectedLoteForBaixa.id, baixaQtd, baixaMotivo);
    setBaixaModalOpen(false);
    setSelectedLoteForBaixa(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Regra FIFO / PEPS</p>
            <p className="text-base font-bold text-white tracking-tight">Primeiro que Entra</p>
            <p className="text-[11px] text-zinc-400">Garante prioridade aos lotes mais antigos</p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            totalEmAlerta > 0 ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-zinc-800 text-zinc-400'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Lotes com Alerta (&lt;30 dias)</p>
            <p className={`text-2xl font-bold tracking-tight font-mono ${totalEmAlerta > 0 ? 'text-amber-400' : 'text-zinc-300'}`}>
              {totalEmAlerta} <span className="text-xs font-normal text-zinc-400">lote(s)</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Valor em Lotes Ativos</p>
            <p className="text-2xl font-bold text-blue-400 tracking-tight font-mono">
              R$ {(valorTotalLotes ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900 p-4 border border-zinc-800 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por lote ou produto..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setFiltroStatus('TODOS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroStatus === 'TODOS' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({produtoLotes.length})
            </button>
            <button
              onClick={() => setFiltroStatus('ALERTA')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                filtroStatus === 'ALERTA' ? 'bg-amber-500 text-zinc-950' : 'text-amber-400 hover:bg-zinc-900'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Alerta ({totalEmAlerta})
            </button>
            <button
              onClick={() => setFiltroStatus('NORMAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroStatus === 'NORMAL' ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Regulares
            </button>
          </div>

          <button
            onClick={handleOpenNovoLote}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Lote FIFO</span>
          </button>
        </div>
      </div>

      {/* Lotes Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 uppercase text-[11px] text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Bebida / Produto</th>
                <th className="p-3.5">Lote / Registro</th>
                <th className="p-3.5 text-center">Data Fabricação</th>
                <th className="p-3.5 text-center">Data Validade</th>
                <th className="p-3.5 text-center">Dias Restantes</th>
                <th className="p-3.5 text-center">Saldo Disponível</th>
                <th className="p-3.5 text-right">Custo Unitário</th>
                <th className="p-3.5 text-center">Status PEPS</th>
                <th className="p-3.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(lotesFiltrados || []).map((lote) => {
                const dias = lote.diasAteVencer ?? lote.diasParaVencer ?? 60;
                const isAlert = lote.status === 'ALERTA_VENCIMENTO' || dias <= 30;
                const custo = lote.custoUnitarioLote ?? lote.precoCustoUnitario ?? 0;

                return (
                  <tr key={lote.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white text-sm">{lote.produtoNome}</p>
                      <p className="text-[11px] text-zinc-500 font-mono">ID: {lote.produtoId}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 font-semibold text-[11px]">
                        {lote.numeroLote}
                      </span>
                    </td>

                    <td className="p-3.5 text-center text-zinc-400 font-mono text-[11px]">
                      {lote.dataFabricacao}
                    </td>

                    <td className="p-3.5 text-center font-semibold text-zinc-200 font-mono text-[11px]">
                      {lote.dataValidade}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        dias <= 15
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse'
                          : dias <= 30
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'text-zinc-300'
                      }`}>
                        {dias} dias
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold text-white bg-zinc-800 px-2.5 py-1 rounded">
                        {lote.quantidadeDisponivel} un
                      </span>
                    </td>

                    <td className="p-3.5 text-right font-mono text-zinc-300">
                      R$ {custo.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-center">
                      {isAlert ? (
                        <span className="px-2 py-1 rounded text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Venda Prioritária
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Regular
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        title="Dar Baixa / Descarte deste Lote"
                        onClick={() => {
                          setSelectedLoteForBaixa(lote);
                          setBaixaQtd(1);
                          setBaixaModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO LOTE FIFO */}
      {novoLoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Cadastrar Novo Lote (Controle FIFO / PEPS)</span>
              </h3>
              <button
                onClick={() => setNovoLoteModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLote} className="p-5 space-y-4 text-xs">
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Produto *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find(prod => prod.id === e.target.value);
                    if (p) setCustoUnitario(p.costPrice || 25);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Identificador / Número do Lote *</label>
                <input
                  type="text"
                  required
                  value={numeroLote}
                  onChange={(e) => setNumeroLote(e.target.value)}
                  placeholder="Ex: LT-2026-0841"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Data de Fabricação</label>
                  <input
                    type="date"
                    required
                    value={dataFabricacao}
                    onChange={(e) => setDataFabricacao(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-amber-400 font-semibold block mb-1">Data de Validade *</label>
                  <input
                    type="date"
                    required
                    value={dataValidade}
                    onChange={(e) => setDataValidade(e.target.value)}
                    className="w-full bg-zinc-950 border border-amber-500/50 rounded-lg px-3 py-2 text-amber-400 font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Quantidade do Lote (un)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantidadeInicial}
                    onChange={(e) => setQuantidadeInicial(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={custoUnitario}
                    onChange={(e) => setCustoUnitario(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNovoLoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Cadastrar Lote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BAIXA / DESCARTE DE LOTE */}
      {baixaModalOpen && selectedLoteForBaixa && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Dar Baixa em Lote ({selectedLoteForBaixa.numeroLote})</span>
              </h3>
              <button
                onClick={() => setBaixaModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <p className="font-bold text-white text-sm">{selectedLoteForBaixa.produtoNome}</p>
                <p className="text-zinc-400 mt-1">
                  Disponível no Lote: <span className="text-white font-mono font-bold">{selectedLoteForBaixa.quantidadeDisponivel} un</span>
                  {' '} | Validade: <span className="text-zinc-300 font-mono">{selectedLoteForBaixa.dataValidade}</span>
                </p>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Quantidade a Baixar / Descartar:</label>
                <input
                  type="number"
                  min={1}
                  max={selectedLoteForBaixa.quantidadeDisponivel}
                  value={baixaQtd}
                  onChange={(e) => setBaixaQtd(Math.min(selectedLoteForBaixa.quantidadeDisponivel, Math.max(1, Number(e.target.value))))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono font-bold text-base focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Motivo do Descarte / Baixa:</label>
                <select
                  value={baixaMotivo}
                  onChange={(e) => setBaixaMotivo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Validade Vencida">Validade Vencida / Impróprio para consumo</option>
                  <option value="Avaria / Quebra de Frasco">Avaria / Quebra de Frasco ou Lacre</option>
                  <option value="Devolução ao Fornecedor">Devolução ao Fornecedor</option>
                  <option value="Ajuste de Balanço">Ajuste de Balanço / Divergência</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setBaixaModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBaixa}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer shadow-lg shadow-rose-600/20"
                >
                  Confirmar Baixa (-{baixaQtd} un)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
