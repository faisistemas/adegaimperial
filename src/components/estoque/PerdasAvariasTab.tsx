import React, { useState } from 'react';
import { 
  ShieldAlert, AlertTriangle, Sparkles, Plus, Trash2, 
  DollarSign, FileText, UserCheck, Calendar, CheckCircle2
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { PerdaEstoqueTipo } from '../../types';

export const PerdasAvariasTab: React.FC = () => {
  const { perdasEstoque, registrarPerdaEstoque, products, currentUser } = useAdega();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProdId, setSelectedProdId] = useState('');
  const [tipoOcorrencia, setTipoOcorrencia] = useState<PerdaEstoqueTipo>('QUEBRA_GARRAFA');
  const [quantidade, setQuantidade] = useState<number>(1);
  const [unidade, setUnidade] = useState<'UN' | 'ML'>('UN');
  const [justificativa, setJustificativa] = useState('');

  const totalPrejuizo = (perdasEstoque || []).reduce((acc, p) => acc + (p.valorPrejuizoEstimado ?? 0), 0);
  const totalQuebras = (perdasEstoque || []).filter(p => p.tipoOcorrencia === 'QUEBRA_GARRAFA').length;
  const totalDegustacoes = (perdasEstoque || []).filter(p => p.tipoOcorrencia === 'DEGUSTACAO_CORTESIA').length;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdId || !justificativa) return;

    registrarPerdaEstoque(selectedProdId, quantidade, unidade, tipoOcorrencia, justificativa);
    setModalOpen(false);
    setSelectedProdId('');
    setJustificativa('');
    setQuantidade(1);
  };

  const formatTipo = (tipo: PerdaEstoqueTipo) => {
    switch (tipo) {
      case 'QUEBRA':
      case 'QUEBRA_GARRAFA':
        return { label: 'Quebra de Garrafa', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
      case 'DEGUSTACAO_CORTESIA':
        return { label: 'Degustação Cortesia', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'EVAPORACAO':
      case 'EVAPORACAO_CHOPP':
        return { label: 'Evaporação / Purga', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
      case 'VENCIMENTO':
        return { label: 'Vencimento / Descarte', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
      case 'FURTO_DESVIO':
        return { label: 'Desvio / Furto', color: 'bg-red-500/20 text-red-300 border-red-500/40' };
      default:
        return { label: 'Avaria / Perda', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Prejuízo Total Estimado</p>
            <p className="text-2xl font-bold text-rose-400 tracking-tight font-mono">
              R$ {(totalPrejuizo ?? 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Quebras de Garrafas</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {totalQuebras} <span className="text-xs font-normal text-zinc-400">ocorrências</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Degustações & Cortesias</p>
            <p className="text-2xl font-bold text-purple-300 tracking-tight">
              {totalDegustacoes} <span className="text-xs font-normal text-zinc-400">cortesias</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Auditoria Rastreável</p>
            <p className="text-sm font-bold text-white">100% dos registros</p>
            <p className="text-[11px] text-zinc-400">Com operador e justificativa</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-end">
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Registrar Nova Ocorrência
        </button>
      </div>

      {/* Table of Losses */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 uppercase text-[11px] text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Data & Hora</th>
                <th className="p-3.5">Produto Baixado</th>
                <th className="p-3.5">Tipo de Perda</th>
                <th className="p-3.5 text-center">Quantidade</th>
                <th className="p-3.5">Justificativa Registrada</th>
                <th className="p-3.5 text-right">Prejuízo (R$)</th>
                <th className="p-3.5 text-right">Operador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(perdasEstoque || []).map((p) => {
                const tipoBadge = formatTipo(p.tipoOcorrencia);

                return (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5 text-zinc-400 font-mono">
                      {p.dataRegistro}
                    </td>

                    <td className="p-3.5 font-bold text-white">
                      {p.produtoNome}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${tipoBadge.color}`}>
                        {tipoBadge.label}
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-zinc-200">
                      {p.quantidade} {p.unidade}
                    </td>

                    <td className="p-3.5 text-zinc-300 max-w-xs truncate" title={p.justificativa}>
                      {p.justificativa}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-rose-400">
                      R$ {(p.valorPrejuizoEstimado ?? 0).toFixed(2)}
                    </td>

                    <td className="p-3.5 text-right text-zinc-400 text-[11px]">
                      {p.usuarioNome}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Ocorrência */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                Registrar Ocorrência de Perda
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                  Produto Avariado / Baixado:
                </label>
                <select
                  value={selectedProdId}
                  onChange={(e) => {
                    setSelectedProdId(e.target.value);
                    const prod = (products || []).find(p => p.id === e.target.value);
                    if (prod?.isFractionable && tipoOcorrencia === 'DEGUSTACAO_CORTESIA') {
                      setUnidade('ML');
                      setQuantidade(50);
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">Selecione o produto...</option>
                  {(products || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Estoque: {p.stockUnits} un)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                  Tipo de Ocorrência:
                </label>
                <select
                  value={tipoOcorrencia}
                  onChange={(e) => setTipoOcorrencia(e.target.value as PerdaEstoqueTipo)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="QUEBRA_GARRAFA">Quebra de Garrafa no Salão / Estoque</option>
                  <option value="DEGUSTACAO_CORTESIA">Degustação Cortesia / Atendimento VIP</option>
                  <option value="EVAPORACAO_CHOPP">Evaporação / Perda de Chopp na Serpentina</option>
                  <option value="VENCIMENTO">Vencimento de Validade</option>
                  <option value="FURTO_DESVIO">Furto ou Desvio de Inventário</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                    Quantidade:
                  </label>
                  <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    min={1}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                    Unidade:
                  </label>
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value as 'UN' | 'ML')}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="UN">Unidades (Garrafas)</option>
                    <option value="ML">Mililitros (ML)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                  Justificativa Obrigatória:
                </label>
                <textarea
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  placeholder="Descreva detalhadamente o ocorrido (ex: Garrafa escorregou da caixa ao descarregar caminhão)..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white h-20 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs"
                >
                  Confirmar Baixa de Perda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
