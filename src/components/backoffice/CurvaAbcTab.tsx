import React, { useState } from 'react';
import { 
  Sparkles, AlertTriangle, ArrowUpRight, TrendingUp, 
  Wine, Droplets, Filter, ShieldAlert, CheckCircle, 
  Search, Flame, Layers, Tag
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { CurvaAbcProduto } from '../../types/backofficeTypes';

export const CurvaAbcTab: React.FC = () => {
  const { curvaAbcItens } = useAdega();
  const [selectedClasse, setSelectedClasse] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuadrante, setSelectedQuadrante] = useState<string>('ALL');
  const [desovaModalProduct, setDesovaModalProduct] = useState<CurvaAbcProduto | null>(null);
  const [descontoDesova, setDescontoDesova] = useState<number>(20);
  const [desovaSuccess, setDesovaSuccess] = useState(false);

  const filteredItems = (curvaAbcItens || []).filter((p) => {
    if (selectedClasse !== 'ALL' && p.classeAbc !== selectedClasse) return false;
    if (selectedQuadrante !== 'ALL' && p.quadrante !== selectedQuadrante) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (p.nome || '').toLowerCase().includes(term) || (p.categoria || '').toLowerCase().includes(term);
    }
    return true;
  });

  // Cálculos de Totais
  const faturamentoTotal = (curvaAbcItens || []).reduce((acc, curr) => acc + (curr.faturamento ?? 0), 0);
  const itensCurvaA = (curvaAbcItens || []).filter((i) => i.classeAbc === 'A');
  const itensCurvaC = (curvaAbcItens || []).filter((i) => i.classeAbc === 'C');
  const capitalImobilizadoCurvaC = itensCurvaC.reduce((acc, curr) => acc + (curr.custoTotal ?? 0), 0);

  const handleConfirmDesova = () => {
    setDesovaSuccess(true);
    setTimeout(() => {
      setDesovaSuccess(false);
      setDesovaModalProduct(null);
    }, 1200);
  };

  const getQuadranteBadge = (quadrante: CurvaAbcProduto['quadrante']) => {
    switch (quadrante) {
      case 'ALTA_RENTABILIDADE':
        return { label: 'Alta Margem & Giro', color: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' };
      case 'CHAMARIZ':
        return { label: 'Chamariz de Fluxo', color: 'bg-blue-950/40 text-blue-400 border-blue-800/60' };
      case 'NICHO_PREMIUM':
        return { label: 'Nicho Premium', color: 'bg-purple-950/40 text-purple-400 border-purple-800/60' };
      case 'RISCO_OCIOSO':
        return { label: 'Risco / Sem Giro', color: 'bg-rose-950/40 text-rose-400 border-rose-800/60' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Resumo ABC & Alerta de Capital Imobilizado */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Curva A Card */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">Classe A (80% Faturamento)</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              {itensCurvaA.length} rótulos nobres
            </span>
          </div>
          <p className="text-xl font-black font-mono text-zinc-100">
            R$ {itensCurvaA.reduce((a, c) => a + c.faturamento, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400">
            Itens que sustentam a adega. Devem ter estoque de segurança monitorado 24/7.
          </p>
        </div>

        {/* Curva B Card */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-zinc-300 tracking-wider">Classe B (15% Faturamento)</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-bold">
              {(curvaAbcItens || []).filter((i) => i.classeAbc === 'B').length} produtos
            </span>
          </div>
          <p className="text-xl font-black font-mono text-zinc-200">
            R$ {((curvaAbcItens || []).filter((i) => i.classeAbc === 'B').reduce((a, c) => a + (c.faturamento ?? 0), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400">
            Itens complementares e cervejas artesanais sazonais.
          </p>
        </div>

        {/* Curva C Card / Capital Parado */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Capital Imobilizado (Curva C)</span>
            </span>
            <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
              {itensCurvaC.length} encalhados
            </span>
          </div>
          <p className="text-xl font-black font-mono text-rose-300">
            R$ {capitalImobilizadoCurvaC.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] text-zinc-400">
            Valor de custo parado em garrafas com mais de 30 dias sem giro.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por rótulo ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Classe Pill buttons */}
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            {(['ALL', 'A', 'B', 'C'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedClasse(c)}
                className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                  selectedClasse === c
                    ? c === 'A' 
                      ? 'bg-amber-500 text-zinc-950 shadow-sm'
                      : c === 'B'
                      ? 'bg-blue-500 text-zinc-950 shadow-sm'
                      : c === 'C'
                      ? 'bg-rose-500 text-zinc-950 shadow-sm'
                      : 'bg-zinc-200 text-zinc-950'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {c === 'ALL' ? 'Todas as Classes' : `Curva ${c}`}
              </button>
            ))}
          </div>

          <select
            value={selectedQuadrante}
            onChange={(e) => setSelectedQuadrante(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300"
          >
            <option value="ALL">Todos os Quadrantes</option>
            <option value="ALTA_RENTABILIDADE">Alta Margem & Giro</option>
            <option value="CHAMARIZ">Chamariz de Volume</option>
            <option value="NICHO_PREMIUM">Nicho Premium</option>
            <option value="RISCO_OCIOSO">Risco Ocioso</option>
          </select>
        </div>
      </div>

      {/* Curva ABC Table */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Ranqueamento de Produtos por Faturamento Acumulado</h3>
            <p className="text-xs text-zinc-400">Classificação com margem de contribuição líquida e sugestões de desova</p>
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            {filteredItems.length} produtos listados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3 pl-4">Produto</th>
                <th className="p-3">Classe</th>
                <th className="p-3 text-right">Faturamento</th>
                <th className="p-3 text-right">% Acumulado</th>
                <th className="p-3 text-right">Margem Contrib.</th>
                <th className="p-3">Dias sem Giro</th>
                <th className="p-3">Quadrante Estratégico</th>
                <th className="p-3 pr-4 text-right">Ação Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(filteredItems || []).map((prod) => {
                const quad = getQuadranteBadge(prod.quadrante);
                return (
                  <tr key={prod.produtoId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2">
                        {prod.isDose ? (
                          <Droplets className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        ) : (
                          <Wine className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        )}
                        <div>
                          <p className="font-bold text-zinc-100">{prod.nome}</p>
                          <span className="text-[10px] text-zinc-500">{prod.categoria}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full font-black text-xs font-mono border ${
                        prod.classeAbc === 'A'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : prod.classeAbc === 'B'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      }`}>
                        Curva {prod.classeAbc}
                      </span>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-zinc-200">
                      R$ {(prod.faturamento ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3 text-right font-mono">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-12 bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              prod.classeAbc === 'A' ? 'bg-amber-400' : prod.classeAbc === 'B' ? 'bg-blue-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${Math.min(100, prod.percentualAcumulado || 0)}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 text-[11px]">{(prod.percentualAcumulado ?? 0).toFixed(1)}%</span>
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono">
                      <span className="text-emerald-400 font-bold block">{(prod.margemContribuicaoPercentual ?? 0).toFixed(1)}%</span>
                      <span className="text-[10px] text-zinc-500">R$ {(prod.margemContribuicaoValor ?? 0).toFixed(2)}/un</span>
                    </td>

                    <td className="p-3 font-mono">
                      <span className={prod.diasSemGiro > 30 ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                        {prod.diasSemGiro} dias
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${quad.color}`}>
                        {quad.label}
                      </span>
                    </td>

                    <td className="p-3 pr-4 text-right">
                      {prod.classeAbc === 'C' ? (
                        <button
                          onClick={() => setDesovaModalProduct(prod)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1 ml-auto shadow-sm"
                        >
                          <Flame className="w-3 h-3 text-rose-400" />
                          <span>Desovar (-20%)</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">
                          {prod.acaoSugerida}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Desova de Estoque Ocioso */}
      {desovaModalProduct && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-base text-zinc-100 font-serif">Campanha de Desova Rápida</h3>
              </div>
              <button onClick={() => setDesovaModalProduct(null)} className="text-zinc-400 hover:text-zinc-200">
                ✕
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs space-y-1">
              <p className="font-bold text-zinc-100 text-sm">{desovaModalProduct.nome}</p>
              <p className="text-zinc-400">Dias sem Giro no Balcão: <strong className="text-rose-400">{desovaModalProduct.diasSemGiro} dias</strong></p>
              <p className="text-zinc-400">Capital Imobilizado em Custo: <strong className="text-zinc-200">R$ {(desovaModalProduct.custoTotal ?? 0).toFixed(2)}</strong></p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-medium block">
                Selecione o percentual de desconto no PDV:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[15, 20, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDescontoDesova(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors ${
                      descontoDesova === d
                        ? 'bg-rose-500 text-zinc-950 border-rose-400'
                        : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    }`}
                  >
                    -{d}% OFF
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-zinc-500">
                O desconto será aplicado automaticamente na tela do PDV e na sugestão do sommelier/garçom.
              </p>
            </div>

            {desovaSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Promoção ativada no PDV com sucesso!</span>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  onClick={() => setDesovaModalProduct(null)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDesova}
                  className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs shadow-lg shadow-rose-950/40"
                >
                  Ativar Promoção no PDV
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
