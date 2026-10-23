import React from 'react';
import { FileText, Hash, ShieldCheck, AlertTriangle, Plus, CheckCircle2 } from 'lucide-react';
import { CartaCorrecaoEvento, InutilizacaoFaixa } from '../../types/fiscalTypes';

interface EventosFiscalTabProps {
  cartasCorrecao: CartaCorrecaoEvento[];
  inutilizacoes: InutilizacaoFaixa[];
  onOpenInutilizarModal: () => void;
}

export const EventosFiscalTab: React.FC<EventosFiscalTabProps> = ({
  cartasCorrecao,
  inutilizacoes,
  onOpenInutilizarModal,
}) => {
  return (
    <div className="space-y-6">
      {/* Seção 1: Cartas de Correção Eletrônica (CC-e) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-serif">
                Cartas de Correção Eletrônica Homologadas (CC-e)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Evento 110110 vinculado à chave de acesso na SEFAZ (sem alteração de impostos ou valores)
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">Total: {cartasCorrecao.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Doc Vinculado</th>
                <th className="p-3">Data / Hora Evento</th>
                <th className="p-3">Protocolo SEFAZ</th>
                <th className="p-3">Seq</th>
                <th className="p-3">Correção Declarada</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(cartasCorrecao || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500 text-xs">
                    Nenhuma Carta de Correção Eletrônica emitida.
                  </td>
                </tr>
              ) : (
                (cartasCorrecao || []).map((cce) => (
                  <tr key={cce.id} className="hover:bg-zinc-850/40">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-zinc-100">
                        {cce.modelo === '55' ? 'NF-e 55' : 'NFC-e 65'} Nº {cce.numeroNota}
                      </div>
                      <div className="text-[10px] text-zinc-500">Série {cce.serie}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-400">{cce.dataEvento}</td>
                    <td className="p-3 font-mono text-[11px] text-amber-300">
                      {cce.protocoloSefaz || 'Em processamento'}
                    </td>
                    <td className="p-3 font-mono text-zinc-400">#{cce.sequencialEvento}</td>
                    <td className="p-3 text-zinc-200 max-w-xs">{cce.textoCorrecao}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {cce.statusEnvio}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 2: Inutilização de Faixa de Numeração */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100 font-serif">
                Inutilização de Numeração Fiscal Faltante
              </h3>
              <p className="text-[11px] text-zinc-400">
                Evita glosas e multas por quebra de sequência numérica nos livros fiscais da SEFAZ
              </p>
            </div>
          </div>

          <button
            onClick={onOpenInutilizarModal}
            className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>Inutilizar Nova Faixa</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Modelo / Série</th>
                <th className="p-3">Faixa Numérica</th>
                <th className="p-3">Qtd Inutilizada</th>
                <th className="p-3">Data Homologação</th>
                <th className="p-3">Protocolo SEFAZ</th>
                <th className="p-3">Justificativa Legal</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(inutilizacoes || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-zinc-500 text-xs">
                    Nenhuma faixa de numeração inutilizada.
                  </td>
                </tr>
              ) : (
                (inutilizacoes || []).map((inut) => {
                  const qtd = inut.numeroFinal - inut.numeroInicial + 1;
                  return (
                    <tr key={inut.id} className="hover:bg-zinc-850/40">
                      <td className="p-3 font-mono font-bold text-zinc-100">
                        Mod {inut.modelo} / S{inut.serie}
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-300">
                        {inut.numeroInicial} até {inut.numeroFinal}
                      </td>
                      <td className="p-3 font-mono text-zinc-300">{qtd} {qtd > 1 ? 'números' : 'número'}</td>
                      <td className="p-3 font-mono text-[11px] text-zinc-400">{inut.dataRegistro}</td>
                      <td className="p-3 font-mono text-[11px] text-zinc-300">{inut.protocoloInutilizacao}</td>
                      <td className="p-3 text-zinc-400 max-w-xs truncate">{inut.justificativa}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {inut.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
