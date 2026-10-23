import React, { useState } from 'react';
import { 
  Layers, Plus, Trash2, DollarSign, Percent, 
  TrendingUp, Sparkles, CheckCircle2, Package, Wine, 
  Coffee, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { FichaTecnicaCombo, FichaTecnicaItem } from '../../types';

export const FichasTecnicasCombosTab: React.FC = () => {
  const { fichasTecnicas, salvarFichaTecnica, products, completeSale } = useAdega();

  const [modalOpen, setModalOpen] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoPrecoVenda, setNovoPrecoVenda] = useState<number>(35.00);
  const [copoIncluso, setCopoIncluso] = useState(true);
  const [geloIncluso, setGeloIncluso] = useState(true);

  const [itensForm, setItensForm] = useState<Array<{
    insumoProdutoId: string;
    insumoNome: string;
    quantidadeConsumida: number;
    unidadeDesconto: 'ML' | 'UN';
    custoUnitarioEstimado: number;
  }>>([
    {
      insumoProdutoId: 'prod-1',
      insumoNome: 'Whisky Johnnie Walker Black/Red Label',
      quantidadeConsumida: 100,
      unidadeDesconto: 'ML',
      custoUnitarioEstimado: 11.50,
    },
    {
      insumoProdutoId: 'prod-7',
      insumoNome: 'Energético Red Bull Energy Drink 250ml',
      quantidadeConsumida: 1,
      unidadeDesconto: 'UN',
      custoUnitarioEstimado: 5.80,
    },
  ]);

  const handleAddItem = () => {
    setItensForm([
      ...itensForm,
      {
        insumoProdutoId: products[0]?.id || 'prod-1',
        insumoNome: products[0]?.name || 'Produto',
        quantidadeConsumida: 1,
        unidadeDesconto: 'UN',
        custoUnitarioEstimado: 5.00,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItensForm(itensForm.filter((_, i) => i !== index));
  };

  const custoTotalInsumosCalc = itensForm.reduce((acc, it) => acc + it.custoUnitarioEstimado, 0) 
    + (copoIncluso ? 0.80 : 0) 
    + (geloIncluso ? 1.20 : 0);
  const lucroEstimadoCalc = novoPrecoVenda - custoTotalInsumosCalc;
  const margemPercentCalc = novoPrecoVenda > 0 ? (lucroEstimadoCalc / novoPrecoVenda) * 100 : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || itensForm.length === 0) return;

    const comboId = `combo-${Date.now()}`;
    const novaFicha: FichaTecnicaCombo = {
      produtoCompostoId: comboId,
      produtoCompostoNome: novoNome,
      categoria: 'combos',
      precoVenda: novoPrecoVenda,
      custoTotalInsumos: Number(custoTotalInsumosCalc.toFixed(2)),
      margemBrutaPercent: Number(margemPercentCalc.toFixed(1)),
      lucroEstimado: Number(lucroEstimadoCalc.toFixed(2)),
      copoDescartavelIncluso: copoIncluso,
      geloIncluso,
      itens: itensForm.map((it, idx) => ({
        id: `fi-${Date.now()}-${idx}`,
        produtoCompostoId: comboId,
        insumoProdutoId: it.insumoProdutoId,
        insumoNome: it.insumoNome,
        quantidadeConsumida: it.quantidadeConsumida,
        unidadeDesconto: it.unidadeDesconto,
        custoUnitarioEstimado: it.custoUnitarioEstimado,
      })),
    };

    salvarFichaTecnica(novaFicha);
    setModalOpen(false);
    setNovoNome('');
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/20 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
            Engenharia de Bebidas & Combos
          </span>
          <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            Fichas Técnicas & Copões Fracionados
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl mt-1">
            Cada venda de Combo ou Copão dá baixa automática multi-item no PDV: 
            desconta as doses em ML da garrafa aberta e as unidades de energético, copo e gelo de sabor.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha Técnica / Combo
        </button>
      </div>

      {/* Grid of Combos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {(fichasTecnicas || []).map((ficha) => (
          <div
            key={ficha.produtoCompostoId}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Wine className="w-4 h-4 text-amber-400" />
                    {ficha.produtoCompostoNome}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {(ficha.itens || []).length} insumos vinculados para baixa automática
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  R$ {(ficha.precoVenda ?? 0).toFixed(2)}
                </span>
              </div>

              {/* Financial Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800/80 mb-4">
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Custo Insumos (CMV)</p>
                  <p className="text-sm font-bold text-zinc-200 font-mono">R$ {(ficha.custoTotalInsumos ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Lucro Estimado</p>
                  <p className="text-sm font-bold text-emerald-400 font-mono">+R$ {(ficha.lucroEstimado ?? 0).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Margem Bruta</p>
                  <p className="text-sm font-bold text-amber-400 font-mono">{ficha.margemBrutaPercent}%</p>
                </div>
              </div>

              {/* Ingredients Breakdown Table */}
              <div className="space-y-1.5 mb-4">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Composição da Baixa no PDV:
                </p>
                <div className="bg-zinc-950/60 rounded-lg border border-zinc-800/60 divide-y divide-zinc-800/60 overflow-hidden">
                  {(ficha.itens || []).map((insumo) => (
                    <div key={insumo.id} className="p-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          insumo.unidadeDesconto === 'ML' 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {insumo.quantidadeConsumida} {insumo.unidadeDesconto}
                        </span>
                        <span className="text-zinc-300 font-medium">{insumo.insumoNome}</span>
                      </div>
                      <span className="text-zinc-400 font-mono">
                        Custo: R$ {(insumo.custoUnitarioEstimado ?? 0).toFixed(2)}
                      </span>
                    </div>
                  ))}

                  {ficha.copoDescartavelIncluso && (
                    <div className="p-2.5 flex items-center justify-between text-xs bg-zinc-900/30">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Package className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Embalagem: Copo 700ml Acrílico + Tampa</span>
                      </div>
                      <span className="text-zinc-500 font-mono">Incluso</span>
                    </div>
                  )}

                  {ficha.geloIncluso && (
                    <div className="p-2.5 flex items-center justify-between text-xs bg-zinc-900/30">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Coffee className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Gelo de Água de Coco Saborizado</span>
                      </div>
                      <span className="text-zinc-500 font-mono">Incluso</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Tag */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Integrado ao Caixa PDV Touch
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                ID: {ficha.produtoCompostoId}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Nova Ficha Técnica */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-xl w-full my-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500" />
                Criar Ficha Técnica de Combo / Copão
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                    Nome Comercial do Copão / Combo:
                  </label>
                  <input
                    type="text"
                    value={novoNome}
                    onChange={(e) => setNovoNome(e.target.value)}
                    placeholder="Ex: Copão 700ml Whisky Black + Red Bull"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                    Preço de Venda no PDV (R$):
                  </label>
                  <input
                    type="number"
                    value={novoPrecoVenda}
                    onChange={(e) => setNovoPrecoVenda(Number(e.target.value))}
                    step={0.50}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                </div>
              </div>

              {/* Insumos List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-zinc-300 font-semibold">
                    Insumos Consumidos (Baixa Automática):
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Insumo
                  </button>
                </div>

                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {(itensForm || []).map((item, idx) => (
                    <div key={idx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex items-center gap-2">
                      <select
                        value={item.insumoProdutoId}
                        onChange={(e) => {
                          const p = (products || []).find(prod => prod.id === e.target.value);
                          const updated = [...itensForm];
                          updated[idx].insumoProdutoId = e.target.value;
                          updated[idx].insumoNome = p?.name || 'Insumo';
                          updated[idx].custoUnitarioEstimado = p ? (updated[idx].unidadeDesconto === 'ML' ? (p.costPrice / 1000) * updated[idx].quantidadeConsumida : p.costPrice) : 5.00;
                          setItensForm(updated);
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-xs text-white rounded p-1.5"
                      >
                        {(products || []).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={item.quantidadeConsumida}
                        onChange={(e) => {
                          const updated = [...itensForm];
                          updated[idx].quantidadeConsumida = Number(e.target.value);
                          setItensForm(updated);
                        }}
                        className="w-16 bg-zinc-900 border border-zinc-700 text-xs text-white rounded p-1.5 text-center font-mono"
                        placeholder="Qtd"
                      />

                      <select
                        value={item.unidadeDesconto}
                        onChange={(e) => {
                          const updated = [...itensForm];
                          updated[idx].unidadeDesconto = e.target.value as 'ML' | 'UN';
                          setItensForm(updated);
                        }}
                        className="w-16 bg-zinc-900 border border-zinc-700 text-xs text-white rounded p-1.5"
                      >
                        <option value="ML">ML</option>
                        <option value="UN">UN</option>
                      </select>

                      <input
                        type="number"
                        value={item.custoUnitarioEstimado}
                        onChange={(e) => {
                          const updated = [...itensForm];
                          updated[idx].custoUnitarioEstimado = Number(e.target.value);
                          setItensForm(updated);
                        }}
                        step={0.5}
                        className="w-20 bg-zinc-900 border border-zinc-700 text-xs text-white rounded p-1.5 text-right font-mono"
                        placeholder="R$ Custo"
                      />

                      {itensForm.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Embalagens adicionais */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={copoIncluso}
                    onChange={(e) => setCopoIncluso(e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                  />
                  Incluir Copo 700ml (+R$ 0,80)
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer bg-zinc-950 p-2.5 rounded-lg border border-zinc-800">
                  <input
                    type="checkbox"
                    checked={geloIncluso}
                    onChange={(e) => setGeloIncluso(e.target.checked)}
                    className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500"
                  />
                  Incluir Gelo de Coco (+R$ 1,20)
                </label>
              </div>

              {/* Real-time Summary Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex justify-between items-center text-xs">
                <div>
                  <span className="text-zinc-400">Custo Total:</span>
                  <span className="text-white font-bold font-mono ml-1">R$ {custoTotalInsumosCalc.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Lucro:</span>
                  <span className="text-emerald-400 font-bold font-mono ml-1">+R$ {lucroEstimadoCalc.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Margem:</span>
                  <span className="text-amber-400 font-bold font-mono ml-1">{margemPercentCalc.toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-sm"
                >
                  Salvar Ficha Técnica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
