import React, { useState } from 'react';
import { 
  DollarSign, Percent, Award, Users, Building2, Flame, 
  Sparkles, CheckCircle, ArrowUpRight, TrendingUp, Edit2, 
  Check, RefreshCw, Layers, ShieldCheck
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ItemMarkupPreco, MetaColaborador, FranquiaUnidadeConfig } from '../../types/backofficeTypes';

export const PrecificacaoFranquiasTab: React.FC = () => {
  const { 
    tabelaMarkup, 
    atualizarMarkupProduto, 
    replicarPrecosParaRede, 
    metasColaboradores, 
    franquiaConfigs, 
    atualizarStatusFranquia 
  } = useAdega();

  const [activeSection, setActiveSection] = useState<'MARKUP' | 'METAS' | 'FRANQUIAS'>('MARKUP');
  const [editingMarkupId, setEditingMarkupId] = useState<string | null>(null);
  const [tempMarkup, setTempMarkup] = useState<string>('');
  const [replicateFeedback, setReplicateFeedback] = useState(false);

  const handleStartEdit = (item: ItemMarkupPreco) => {
    setEditingMarkupId(item.produtoId);
    setTempMarkup(item.markupAtual.toString());
  };

  const handleSaveMarkup = (produtoId: string) => {
    const val = parseFloat(tempMarkup);
    if (!isNaN(val) && val > 1) {
      atualizarMarkupProduto(produtoId, val);
    }
    setEditingMarkupId(null);
  };

  const handleReplicar = () => {
    replicarPrecosParaRede();
    setReplicateFeedback(true);
    setTimeout(() => setReplicateFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Switcher de Subseções */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveSection('MARKUP')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeSection === 'MARKUP'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Precificação & Markup</span>
          </button>
          <button
            onClick={() => setActiveSection('METAS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeSection === 'METAS'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Metas & Comissões Turbo</span>
          </button>
          <button
            onClick={() => setActiveSection('FRANQUIAS')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 ${
              activeSection === 'FRANQUIAS'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Franquias & Royalties</span>
          </button>
        </div>

        {activeSection === 'MARKUP' && (
          <button
            onClick={handleReplicar}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-bold text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Replicar Preços para Todas as Filiais</span>
          </button>
        )}
      </div>

      {replicateFeedback && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Tabela de preços sincronizada com sucesso nas 3 unidades da rede!</span>
        </div>
      )}

      {/* SEÇÃO 1: MARKUP E PRECIFICAÇÃO */}
      {activeSection === 'MARKUP' && (
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Simulador de Markup, Custo da NF-e e Margem Bruta</h3>
              <p className="text-xs text-zinc-400">
                Altere o multiplicador de markup para recalcular instantaneamente os preços sugeridos no PDV
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Fórmula: Preço = Custo NF-e × Markup</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Produto & Categoria</th>
                  <th className="p-3 text-right">Custo Última NF-e</th>
                  <th className="p-3 text-center">Markup Atual</th>
                  <th className="p-3 text-right">Preço Atual</th>
                  <th className="p-3 text-right">Margem Estimada</th>
                  <th className="p-3 pr-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {tabelaMarkup.map((item) => (
                  <tr key={item.produtoId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-4">
                      <div>
                        <p className="font-bold text-zinc-100">{item.nome}</p>
                        <span className="text-[10px] text-zinc-500">{item.categoria}</span>
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono text-zinc-300">
                      R$ {(item.custoUltimaNfe ?? 0).toFixed(2)}
                    </td>

                    <td className="p-3 text-center font-mono">
                      {editingMarkupId === item.produtoId ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.05"
                            value={tempMarkup}
                            onChange={(e) => setTempMarkup(e.target.value)}
                            className="w-16 bg-zinc-950 border border-amber-500 rounded px-1.5 py-0.5 text-xs text-amber-300 font-mono text-center"
                          />
                          <button
                            onClick={() => handleSaveMarkup(item.produtoId)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-800/50">
                          {(item.markupAtual ?? 0).toFixed(2)}x
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-sm text-zinc-100">
                      R$ {(item.precoVendaAtual ?? 0).toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-mono">
                      <span className={`font-bold ${
                        (item.margemEstimadaPercentual ?? 0) >= 60 ? 'text-emerald-400' : 'text-zinc-300'
                      }`}>
                        {(item.margemEstimadaPercentual ?? 0).toFixed(1)}%
                      </span>
                    </td>

                    <td className="p-3 pr-4 text-right">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 ml-auto"
                      >
                        <Edit2 className="w-3 h-3 text-amber-400" />
                        <span>Ajustar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEÇÃO 2: METAS E COMISSÕES DA EQUIPE */}
      {activeSection === 'METAS' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Engenharia de Comissões por Margem de Lucro</h3>
              <p className="text-xs text-zinc-400">
                Incentivo financeiro: <strong className="text-zinc-200">1.0% para cerveja comercial</strong> vs <strong className="text-amber-400">5.0% a 8.0% para doses e coquetéis de alta margem</strong>.
              </p>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 border border-amber-500/40">
              <Flame className="w-3.5 h-3.5" />
              <span>Modo Turbo Ativo</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metasColaboradores.map((colab) => {
              const percFaturamento = Math.min(100, (colab.atingidoFaturamento / colab.metaFaturamento) * 100);
              const percAltaMargem = Math.min(100, (colab.atingidoAltaMargem / colab.metaAltaMargem) * 100);

              return (
                <div 
                  key={colab.id} 
                  className={`p-5 rounded-3xl border space-y-4 ${
                    colab.turboAtivado 
                      ? 'bg-gradient-to-b from-amber-950/20 to-zinc-900 border-amber-500/40' 
                      : 'bg-zinc-900 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs">
                          #{colab.rankingPosicao}
                        </span>
                        <h4 className="font-bold text-base text-zinc-100 font-serif">{colab.colaboradorNome}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{colab.cargo}</span>
                    </div>

                    {colab.turboAtivado && (
                      <span className="text-xs bg-amber-500 text-zinc-950 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        <span>TURBO +2%</span>
                      </span>
                    )}
                  </div>

                  {/* Metas Bars */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>Meta Faturamento Geral</span>
                        <span className="font-mono text-zinc-200">
                          R$ {(colab.atingidoFaturamento ?? 0).toLocaleString('pt-BR')} / R$ {(colab.metaFaturamento ?? 0).toLocaleString('pt-BR')} ({(percFaturamento ?? 0).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-400 h-full rounded-full transition-all" 
                          style={{ width: `${percFaturamento}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span className="text-amber-300 font-bold">Meta Doses / Alta Margem</span>
                        <span className="font-mono text-amber-300 font-bold">
                          R$ {(colab.atingidoAltaMargem ?? 0).toLocaleString('pt-BR')} / R$ {(colab.metaAltaMargem ?? 0).toLocaleString('pt-BR')} ({(percAltaMargem ?? 0).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all" 
                          style={{ width: `${percAltaMargem}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Total Comissão Calculada */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-zinc-400 block">Comissão Acumulada no Mês</span>
                      <p className="text-xl font-black font-mono text-emerald-400">
                        R$ {(colab.comissaoTotal ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Taxas: {colab.comissaoPadraoTaxa}% padrão | {colab.comissaoAltaMargemTaxa}% alta margem
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SEÇÃO 3: GESTÃO DE FRANQUIAS E ROYALTIES */}
      {activeSection === 'FRANQUIAS' && (
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Rede de Lojas & Repasse de Royalties</h3>
              <p className="text-xs text-zinc-400">
                Gestão centralizada de faturamento, cálculo de Royalties (4%) e Fundo de Promoção e Propaganda (FPP 1.5%)
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-800/60">
              Total Franquias: 3 Unidades
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Unidade & CNPJ</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3 text-right">Faturamento Bruto</th>
                  <th className="p-3 text-right">Royalties (4%)</th>
                  <th className="p-3 text-right">Fundo Prop. (1.5%)</th>
                  <th className="p-3">Status Repasse</th>
                  <th className="p-3 pr-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {franquiaConfigs.map((fran) => (
                  <tr key={fran.lojaId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-4">
                      <div>
                        <p className="font-bold text-zinc-100">{fran.lojaNome}</p>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {fran.cidade} • CNPJ: {fran.cnpj}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        fran.tipo === 'MATRIZ'
                          ? 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                          : 'bg-blue-950/40 text-blue-400 border-blue-800/60'
                      }`}>
                        {fran.tipo.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-zinc-100">
                      R$ {fran.faturamentoBrutoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3 text-right font-mono text-amber-400 font-bold">
                      R$ {fran.royaltiesMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3 text-right font-mono text-purple-400 font-bold">
                      R$ {fran.fundoPropagandaMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        fran.statusPagamento === 'PAGO'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                      }`}>
                        {fran.statusPagamento}
                      </span>
                    </td>

                    <td className="p-3 pr-4 text-right">
                      {fran.tipo !== 'MATRIZ' && fran.statusPagamento !== 'PAGO' ? (
                        <button
                          onClick={() => atualizarStatusFranquia(fran.lojaId, 'PAGO')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                        >
                          Liquidar Repasse
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono">Em dia</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
