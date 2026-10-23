import React, { useState } from 'react';
import { 
  ClipboardList, CheckCircle2, AlertTriangle, Play, 
  Search, ShieldAlert, ArrowUpDown, DollarSign, UserCheck
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { InventarioCego } from '../../types';

export const InventarioCegoTab: React.FC = () => {
  const { 
    inventarios, 
    iniciarInventarioCego, 
    finalizarInventarioCego, 
    products, 
    currentUser 
  } = useAdega();

  const [activeSession, setActiveSession] = useState<InventarioCego | null>(
    inventarios.find(i => i.status === 'EM_ANDAMENTO') || null
  );

  const [contagens, setContagens] = useState<Record<string, number>>({});

  const handleStart = () => {
    const novo = iniciarInventarioCego();
    setActiveSession(novo);
    // Pre-populate contagens with empty/zero
    const initCounts: Record<string, number> = {};
    novo.itens.forEach(it => {
      initCounts[it.produtoId] = it.quantidadeSistema; // Preenche default para facilidade de teste
    });
    setContagens(initCounts);
  };

  const handleFinish = () => {
    if (!activeSession) return;
    const formatContagens = Object.entries(contagens).map(([produtoId, quantidadeContada]) => ({
      produtoId,
      quantidadeContada: Number(quantidadeContada),
    }));

    finalizarInventarioCego(activeSession.id, formatContagens);
    setActiveSession(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Action */}
      <div className="flex items-center justify-end">
        {!activeSession ? (
          <button
            onClick={handleStart}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            Iniciar Nova Rodada de Inventário
          </button>
        ) : (
          <button
            onClick={handleFinish}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar e Ajustar Estoque
          </button>
        )}
      </div>

      {/* Sessão Ativa de Contagem */}
      {activeSession && (
        <div className="bg-zinc-900 border-2 border-emerald-500/40 rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-3">
            <div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                SESSÃO EM ANDAMENTO
              </span>
              <h4 className="text-base font-bold text-white mt-1">
                Contagem Física: {activeSession.id}
              </h4>
              <p className="text-xs text-zinc-400">
                Iniciado por {activeSession.usuarioResponsavelNome} às {activeSession.dataInicio}
              </p>
            </div>
            <p className="text-xs text-amber-400 font-medium bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              Digite os valores contados fisicamente nas gôndolas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(activeSession.itens || []).map((item) => (
              <div
                key={item.produtoId}
                className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h5 className="font-bold text-white text-sm">{item.produtoNome}</h5>
                  <p className="text-xs text-zinc-500">Custo Unit: R$ {(item.custoUnitario ?? 0).toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-400">Contagem Física:</label>
                  <input
                    type="number"
                    value={contagens[item.produtoId] ?? item.quantidadeSistema}
                    onChange={(e) => setContagens({
                      ...contagens,
                      [item.produtoId]: Number(e.target.value)
                    })}
                    className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-center text-sm font-bold text-amber-400 font-mono"
                    min={0}
                  />
                  <span className="text-xs text-zinc-500">un</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Histórico de Inventários Concluídos */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Histórico de Auditorias de Inventário
          </h4>
          <span className="text-xs text-zinc-400">
            {(inventarios || []).length} registros
          </span>
        </div>

        <div className="divide-y divide-zinc-800">
          {(inventarios || []).map((inv) => {
            const isCompleted = inv.status === 'FINALIZADO';

            return (
              <div key={inv.id} className="p-4 hover:bg-zinc-800/30 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-sm">{inv.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCompleted ? 'bg-zinc-800 text-zinc-300' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Responsável: {inv.usuarioResponsavelNome} | Início: {inv.dataInicio}
                      {inv.dataFechamento && ` | Concluído: ${inv.dataFechamento}`}
                    </p>
                  </div>

                  {isCompleted && (
                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-zinc-500 block">Divergências:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {inv.totalDivergenciaItens} produto(s)
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Impacto Financeiro:</span>
                        <span className={`font-mono font-bold ${
                          (inv.impactoFinanceiroEstimado ?? 0) < 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}>
                          {(inv.impactoFinanceiroEstimado ?? 0) < 0 ? '-' : '+'}R$ {(Math.abs(inv.impactoFinanceiroEstimado ?? 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabela de Confronto */}
                {inv.itens && (inv.itens || []).length > 0 && (
                  <div className="bg-zinc-950/80 rounded-lg p-3 border border-zinc-800/60 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[10px] text-zinc-500 uppercase border-b border-zinc-800 pb-1">
                        <tr>
                          <th className="pb-1.5">Produto</th>
                          <th className="pb-1.5 text-center">Qtd Sistema</th>
                          <th className="pb-1.5 text-center">Qtd Contada</th>
                          <th className="pb-1.5 text-center">Divergência</th>
                          <th className="pb-1.5 text-right">Impacto (R$)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {(inv.itens || []).slice(0, 4).map((it) => {
                          const diff = it.divergencia ?? (it.quantidadeContada - it.quantidadeSistema);
                          const impacto = diff * (it.custoUnitario ?? 0);

                          return (
                            <tr key={it.produtoId} className="text-zinc-300">
                              <td className="py-1.5 font-medium">{it.produtoNome}</td>
                              <td className="py-1.5 text-center font-mono">{it.quantidadeSistema} un</td>
                              <td className="py-1.5 text-center font-mono font-bold text-white">{it.quantidadeContada} un</td>
                              <td className="py-1.5 text-center font-mono">
                                <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                                  diff === 0 ? 'text-zinc-500' : diff > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                                }`}>
                                  {diff > 0 ? `+${diff}` : diff} un
                                </span>
                              </td>
                              <td className="py-1.5 text-right font-mono">
                                <span className={impacto < 0 ? 'text-rose-400' : impacto > 0 ? 'text-emerald-400' : 'text-zinc-500'}>
                                  R$ {(impacto ?? 0).toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
