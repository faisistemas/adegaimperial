import React from 'react';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { ConciliacaoFiscalPagamento } from '../../types/fiscalTypes';

interface ConciliacaoTefTabProps {
  conciliacoes: ConciliacaoFiscalPagamento[];
}

export const ConciliacaoTefTab: React.FC<ConciliacaoTefTabProps> = ({ conciliacoes }) => {
  const totalConciliado = (conciliacoes || [])
    .filter((c) => c.statusConciliacao === 'CONCILIADO')
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  const totalDivergente = (conciliacoes || [])
    .filter((c) => c.statusConciliacao === 'DIVERGENTE')
    .reduce((acc, c) => acc + (c.valor || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner Anti-Glosa Cartões */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-serif">
              Conciliação Fiscal vs TEF (Proteção Cruzamento SEFAZ / DECRED)
            </h3>
            <p className="text-xs text-zinc-400">
              Vínculo automático do NSU e código de autorização da adquirente à respectiva NFC-e para evitar autuações por omissão de receita.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Conciliado</p>
            <p className="text-sm font-bold font-mono text-emerald-400">R$ {(totalConciliado ?? 0).toFixed(2)}</p>
          </div>
          {totalDivergente > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-red-400 uppercase font-bold">Divergências</p>
              <p className="text-sm font-bold font-mono text-red-400">R$ {(totalDivergente ?? 0).toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Table of Reconciliations */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Data / Pedido</th>
                <th className="p-3">Adquirente / Bandeira</th>
                <th className="p-3">NSU / Autorização</th>
                <th className="p-3">Chave NFC-e Vinculada</th>
                <th className="p-3 text-right">Valor TEF</th>
                <th className="p-3">Auditoria Fiscal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(conciliacoes || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-zinc-500 text-xs">
                    Nenhuma transação TEF registrada para conciliação.
                  </td>
                </tr>
              ) : (
                (conciliacoes || []).map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-850/40">
                    <td className="p-3 font-mono">
                      <div className="font-bold text-zinc-100">{c.codigoPedido}</div>
                      <div className="text-[10px] text-zinc-500">{c.dataRegistro}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-zinc-200">{c.credenciadora}</div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-zinc-500" />
                        <span>{c.bandeiraCartao} ({c.formaPagamento})</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">
                      <div className="text-zinc-200">NSU: {c.nsuTef}</div>
                      <div className="text-[10px] text-zinc-400">{c.autorizacaoCartao}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-zinc-400">
                      {c.chaveAcesso ? (
                        <span>{c.chaveAcesso.slice(0, 8)}...{c.chaveAcesso.slice(-8)}</span>
                      ) : (
                        <span className="text-amber-400">Pendente de emissão</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-amber-300">
                      R$ {(c.valor ?? 0).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.statusConciliacao === 'CONCILIADO'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {c.statusConciliacao === 'CONCILIADO' ? '100% Conciliado' : 'Divergência'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
