import React, { useState } from 'react';
import { 
  Wine, RotateCcw, Plus, Minus, DollarSign, 
  ShieldAlert, CheckCircle2, ArrowDownCircle, ArrowUpCircle, Package
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { VasilhameSaldo } from '../../types';

export const VasilhamesCascosTab: React.FC = () => {
  const { vasilhames, atualizarSaldoVasilhame } = useAdega();

  const [modalAction, setModalAction] = useState<{
    open: boolean;
    produtoId: string;
    produtoNome: string;
    tipo: 'ENTRADA_CLIENTE' | 'SAIDA_DISTRIBUIDORA';
  } | null>(null);
  const [quantidadeCascos, setQuantidadeCascos] = useState<number>(12);

  const totalCascosVazios = (vasilhames || []).reduce((acc, v) => acc + (v.cascosVaziosEmEstoque ?? 0), 0);
  const totalCheiasComCasco = (vasilhames || []).reduce((acc, v) => acc + (v.garrafasCheiasComCasco ?? 0), 0);
  const totalValorCaucaoImobilizado = (vasilhames || []).reduce(
    (acc, v) => acc + ((v.cascosVaziosEmEstoque ?? 0) + (v.garrafasCheiasComCasco ?? 0)) * (v.precoCaucaoUnitario ?? 0), 
    0
  );

  const handleConfirmAction = () => {
    if (!modalAction) return;
    const delta = modalAction.tipo === 'ENTRADA_CLIENTE' ? quantidadeCascos : -quantidadeCascos;
    atualizarSaldoVasilhame(modalAction.produtoId, delta);
    setModalAction(null);
    setQuantidadeCascos(12);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Cascos Vazios no Pátio</p>
            <p className="text-2xl font-bold text-white tracking-tight font-mono">
              {totalCascosVazios} <span className="text-xs font-normal text-zinc-400">garrafas vazias</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Cheias Prontas com Casco</p>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
              {totalCheiasComCasco} <span className="text-xs font-normal text-zinc-400">garrafas cheias</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Valor em Caução Imobilizado</p>
            <p className="text-2xl font-bold text-amber-400 tracking-tight font-mono">
              R$ {(totalValorCaucaoImobilizado ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Regra de Negócio */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-3 text-xs text-zinc-400">
        <RotateCcw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-200">Regra de Troca de Vasilhames & Caução no PDV:</span>
          <p className="mt-0.5">
            Ao vender cerveja retornável (600ml ou 1L), se o cliente traz o vasilhame vazio correspondente, paga apenas o líquido.
            Se o cliente não possui o casco, o PDV inclui automaticamente a cobrança da taxa de caução da garrafa.
          </p>
        </div>
      </div>

      {/* Tabela de Vasilhames */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Wine className="w-5 h-5 text-amber-500" />
            Controle de Saldo de Garrafas Retornáveis
          </h4>
          <span className="text-xs text-zinc-400">
            {vasilhames.length} tipos de embalagens rastreadas
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 uppercase text-[11px] text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="p-3.5">Cerveja / Embalagem</th>
                <th className="p-3.5 text-center">Cheias Prontas</th>
                <th className="p-3.5 text-center">Cascos Vazios</th>
                <th className="p-3.5 text-center">Saldo Total</th>
                <th className="p-3.5 text-right">Valor Caução Un.</th>
                <th className="p-3.5 text-right">Patrimônio</th>
                <th className="p-3.5 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(vasilhames || []).map((v, idx) => {
                const precoCaucao = v.precoCaucaoUnitario ?? (v as any).valorCaucaoUnitario ?? 0;
                const totalEmbalagens = (v.cascosVaziosEmEstoque ?? 0) + (v.garrafasCheiasComCasco ?? 0);
                const valorPatrimonio = totalEmbalagens * precoCaucao;

                return (
                  <tr key={v.produtoId || (v as any).id || `vasilhame-${idx}`} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-white text-sm">{v.produtoNome}</p>
                      <p className="text-[11px] text-zinc-400">Código: {v.produtoId}</p>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {v.garrafasCheiasComCasco} un
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {v.cascosVaziosEmEstoque} un
                      </span>
                    </td>

                    <td className="p-3.5 text-center font-mono font-semibold text-zinc-200">
                      {totalEmbalagens} un
                    </td>

                    <td className="p-3.5 text-right font-mono font-semibold text-zinc-300">
                      R$ {precoCaucao.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-amber-400">
                      R$ {valorPatrimonio.toFixed(2)}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setModalAction({
                            open: true,
                            produtoId: v.produtoId,
                            produtoNome: v.produtoNome,
                            tipo: 'ENTRADA_CLIENTE',
                          })}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-emerald-900/40 hover:text-emerald-400 text-zinc-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Receber Cascos Vazios"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" />
                          Receber Casco
                        </button>
                        <button
                          onClick={() => setModalAction({
                            open: true,
                            produtoId: v.produtoId,
                            produtoNome: v.produtoNome,
                            tipo: 'SAIDA_DISTRIBUIDORA',
                          })}
                          className="px-2.5 py-1.5 bg-zinc-800 hover:bg-rose-900/40 hover:text-rose-400 text-zinc-300 rounded text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Enviar para troca com caminhão da Cervejaria"
                        >
                          <Minus className="w-3.5 h-3.5 text-rose-400" />
                          Troca Cervejaria
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Movimentação de Casco */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-amber-500" />
              {modalAction.tipo === 'ENTRADA_CLIENTE' ? 'Recebimento de Cascos Vazios' : 'Saída de Cascos para Cervejaria'}
            </h3>
            <p className="text-xs text-zinc-400">{modalAction.produtoNome}</p>

            <div>
              <label className="text-xs text-zinc-300 block mb-1">Quantidade de Cascos:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantidadeCascos(Math.max(1, quantidadeCascos - 6))}
                  className="w-10 h-10 bg-zinc-800 rounded-lg text-white font-bold"
                >
                  -6
                </button>
                <input
                  type="number"
                  value={quantidadeCascos}
                  onChange={(e) => setQuantidadeCascos(Number(e.target.value))}
                  min={1}
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg py-2 text-center text-white font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setQuantidadeCascos(quantidadeCascos + 6)}
                  className="w-10 h-10 bg-zinc-800 rounded-lg text-white font-bold"
                >
                  +6
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              {modalAction.tipo === 'ENTRADA_CLIENTE' 
                ? 'Cascos devolvidos por clientes que ficam guardados no depósito prontos para retorno.'
                : 'Cascos enviados na troca com o caminhão da distribuidora (Ambev/Heineken) por engradados cheios.'}
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAction}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
