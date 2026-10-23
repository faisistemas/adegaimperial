import React from 'react';
import { Sparkles, HelpCircle, ShieldAlert, TrendingUp, Info } from 'lucide-react';
import { ReformaTributariaConfigItem } from '../../types/fiscalTypes';

interface ReformaTributariaTabProps {
  itensReforma: ReformaTributariaConfigItem[];
}

export const ReformaTributariaTab: React.FC<ReformaTributariaTabProps> = ({ itensReforma }) => {
  return (
    <div className="space-y-4">
      {/* Banner da Reforma */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-serif">
              Motor Dual: Reforma Tributária (EC 132/2023 - CBS, IBS & Imposto Seletivo)
            </h3>
            <p className="text-xs text-zinc-400">
              Sua adega preparada com anos de antecedência: simulação da substituição do ICMS, PIS e COFINS pelo IVA Dual e incidência do Imposto Seletivo ("Sin Tax") sobre bebidas alcoólicas.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
          Transição 2026 - 2033 Ativa
        </div>
      </div>

      {/* Cards Explicativos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200">CBS (Federal)</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">0.9% teste</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Contribuição sobre Bens e Serviços. Substitui integralmente o PIS e a COFINS, com crédito financeiro amplo e imediato.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200">IBS (Estados e Municípios)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">0.1% teste</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Imposto sobre Bens e Serviços. Substitui o ICMS e o ISS, tributando no destino do consumo com cálculo por fora.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200">Imposto Seletivo ("Sin Tax")</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono">Art. 153, VIII CF</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Sobretaxa extra incidente especificamente sobre bebidas alcoólicas e produtos prejudiciais à saúde.
          </p>
        </div>
      </div>

      {/* Tabela de Simulação por Categoria de Bebida */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
              Simulação de Carga Tributária por Item
            </h4>
            <p className="text-[11px] text-zinc-400">
              Parametrização comparativa do regime atual vs modelo de transição do IVA Dual
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Produto / NCM</th>
                <th className="p-3">Regime Atual</th>
                <th className="p-3 text-right">Alíquota CBS</th>
                <th className="p-3 text-right">Alíquota IBS</th>
                <th className="p-3 text-right">Imposto Seletivo</th>
                <th className="p-3 text-right">Carga Total Simulada</th>
                <th className="p-3">Status de Adequação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(itensReforma || []).map((it) => {
                const totalAliq = (it.aliquotaCbs ?? 0) + (it.aliquotaIbs ?? 0) + (it.aliquotaImpostoSeletivo ?? 0);
                return (
                  <tr key={it.id} className="hover:bg-zinc-850/40">
                    <td className="p-3">
                      <div className="font-semibold text-zinc-100">{it.produtoNome}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">NCM: {it.ncm}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                        {it.regimeAtualDescricao}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-blue-300">{it.aliquotaCbs}%</td>
                    <td className="p-3 text-right font-mono text-emerald-300">{it.aliquotaIbs}%</td>
                    <td className="p-3 text-right font-mono text-purple-300">
                      {it.aliquotaImpostoSeletivo ? `${it.aliquotaImpostoSeletivo}%` : 'Isento'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-300">
                      {(totalAliq ?? 0).toFixed(1)}%
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {it.adequado ? 'Mapeamento Homologado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
