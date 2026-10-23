import React from 'react';
import { DollarSign, FileSpreadsheet, ArrowUpRight, HelpCircle, CheckCircle } from 'lucide-react';
import { RessarcimentoIcmsSt } from '../../types/fiscalTypes';

interface RessarcimentoStTabProps {
  ressarcimentos: RessarcimentoIcmsSt[];
}

export const RessarcimentoStTab: React.FC<RessarcimentoStTabProps> = ({ ressarcimentos }) => {
  const totalRecuperavel = (ressarcimentos || []).reduce((acc, r) => acc + (r.valorIcmsStRecuperavel ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Banner Informativo CAT 42 */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-serif">
              Ressarcimento & Restituição de ICMS-ST (Portaria CAT 42)
            </h3>
            <p className="text-xs text-zinc-400">
              Recupere o ICMS retido por substituição tributária em vendas interestaduais, quebras comprovadas ou fatos geradores não concretizados.
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Crédito Estimado a Ressarcir</p>
          <p className="text-lg font-bold font-mono text-emerald-400">R$ {(totalRecuperavel ?? 0).toFixed(2)}</p>
        </div>
      </div>

      {/* Tabela de Lançamentos de Ressarcimento */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Item / NCM</th>
                <th className="p-3">Motivo Legal</th>
                <th className="p-3">Qtd</th>
                <th className="p-3">Doc Saída / UF</th>
                <th className="p-3 text-right">ICMS-ST Retido Entrada</th>
                <th className="p-3 text-right">Crédito Recuperável</th>
                <th className="p-3">Status Auditoria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(ressarcimentos || []).map((r) => (
                <tr key={r.id} className="hover:bg-zinc-850/40">
                  <td className="p-3">
                    <div className="font-semibold text-zinc-100">{r.produtoNome}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">NCM: {r.ncm}</div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                      {r.motivoLegal === 'VENDA_INTERESTADUAL'
                        ? 'Venda Interestadual'
                        : r.motivoLegal === 'PERDA_AVARIA_COMPROVADA'
                        ? 'Perda / Avaria'
                        : r.motivoLegal}
                    </span>
                  </td>
                  <td className="p-3 font-mono">{r.quantidade} un</td>
                  <td className="p-3 font-mono text-[11px]">
                    <div className="text-zinc-200">NF-e Nº {r.numeroNotaSaida}</div>
                    <div className="text-[10px] text-zinc-500">Destino: {r.ufDestino}</div>
                  </td>
                  <td className="p-3 text-right font-mono text-zinc-400">
                    R$ {(r.valorIcmsStEntradaRetido ?? 0).toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-400">
                    R$ {(r.valorIcmsStRecuperavel ?? 0).toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.statusProcesso === 'APURADO'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {r.statusProcesso === 'APURADO' ? 'Pronto p/ CAT 42' : 'Homologado'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
