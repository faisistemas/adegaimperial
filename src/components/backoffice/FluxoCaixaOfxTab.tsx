import React, { useState } from 'react';
import { 
  DollarSign, Landmark, ArrowUpRight, ArrowDownLeft, 
  Upload, CheckCircle, AlertTriangle, RefreshCw, FileText, 
  Calendar, Check, ShieldCheck, HelpCircle
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { INITIAL_FLUXO_CAIXA } from '../../data/backofficeModule6Data';

export const FluxoCaixaOfxTab: React.FC = () => {
  const { 
    contasBancarias, 
    ofxTransacoes, 
    conciliarTransacaoOfx, 
    importarTransacoesOfx 
  } = useAdega();

  const [selectedContaId, setSelectedContaId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONCILIADO' | 'PENDENTE'>('ALL');
  const [isImporting, setIsImporting] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  const saldoTotalBancos = contasBancarias.reduce((acc, curr) => acc + curr.saldoAtual, 0);

  const filteredTransacoes = ofxTransacoes.filter((t) => {
    if (selectedContaId !== 'ALL' && t.contaBancariaId !== selectedContaId) return false;
    if (filterStatus === 'CONCILIADO' && !t.conciliado) return false;
    if (filterStatus === 'PENDENTE' && t.conciliado) return false;
    return true;
  });

  const handleSimularUploadOfx = () => {
    setIsImporting(true);
    setTimeout(() => {
      // Simula uma nova transação importada
      const novaTransacao = {
        id: `ofx-import-${Date.now()}`,
        contaBancariaId: 'banco-itau',
        fitid: `FIT-${Date.now()}`,
        data: '2026-09-16',
        valor: 1450.00,
        tipo: 'CREDITO' as const,
        descricao: 'LIQUIDACAO TEF REDE VISA CR',
        conciliado: true,
        statusAuditoria: 'CONCILIADO' as const,
        documentoVinculado: 'BORDERO-TEF-REDE-8821',
      };
      importarTransacoesOfx([novaTransacao]);
      setIsImporting(false);
      setImportFeedback('Arquivo OFX processado! 1 lançamento bancário reconciliado automaticamente contra TEF.');
      setTimeout(() => setImportFeedback(null), 4000);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Top Bank Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {contasBancarias.map((banco) => (
          <div 
            key={banco.id} 
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-400" />
                <div>
                  <h4 className="font-bold text-sm text-zinc-100">{banco.bancoNome}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">Ag {banco.agencia} • C/C {banco.conta}</span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-semibold">
                OFX Ativo
              </span>
            </div>

            <div>
              <span className="text-xs text-zinc-400">Saldo Disponível em Conta:</span>
              <p className="text-2xl font-black font-mono text-zinc-100 mt-0.5">
                R$ {banco.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Última reconciliação:</span>
              <span className="font-mono text-zinc-300">{banco.dataUltimaConciliacao}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Projeção de Fluxo de Caixa (7 Dias) */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h3 className="font-bold text-base text-zinc-100 font-serif">Fluxo de Caixa Diário & Projetado (D+7)</h3>
            <p className="text-xs text-zinc-400">
              Projeção calculada cruzando contas a pagar, recebíveis de cartão e média histórica do PDV
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Saldo Consolidado Total:</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              R$ {saldoTotalBancos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* 7-Day Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {INITIAL_FLUXO_CAIXA.map((dia) => (
            <div
              key={dia.data}
              className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 ${
                dia.alertaLiquidez
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : 'bg-zinc-950/60 border-zinc-800'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">{dia.diaSemana}</span>
                <span className="text-xs font-mono font-bold text-zinc-200">{dia.data.slice(5)}</span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="text-[9px] text-zinc-500">Entr:</span>
                  <span>+R$ {(dia.entradasPrevistas ?? 0).toFixed(0)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-400">
                  <span className="text-[9px] text-zinc-500">Saíd:</span>
                  <span>-R$ {(dia.saidasPrevistas ?? 0).toFixed(0)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-[9px] text-zinc-500 block">Saldo Final:</span>
                <span className="font-mono font-bold text-xs text-zinc-100">
                  R$ {(dia.saldoFinal ?? 0).toFixed(0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conciliação Bancária OFX */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-zinc-100 font-serif">Extrato & Auditoria de OFX Bancário</h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                98.4% Conciliado
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Identificação automática de lançamentos de cartão Stone/Cielo, sangrias de caixa e pagamentos a fornecedores
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimularUploadOfx}
              disabled={isImporting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-950/40 transition-colors disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Lendo OFX...' : 'Importar Extrato OFX'}</span>
            </button>
          </div>
        </div>

        {importFeedback && (
          <div className="p-3 bg-emerald-950/50 border-b border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importFeedback}</span>
          </div>
        )}

        {/* Filters bar */}
        <div className="p-3 bg-zinc-950/60 border-b border-zinc-800/60 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500">Filtrar status:</span>
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-2.5 py-1 rounded-lg ${filterStatus === 'ALL' ? 'bg-zinc-800 text-zinc-100 font-bold' : 'text-zinc-400'}`}
            >
              Todos ({ofxTransacoes.length})
            </button>
            <button
              onClick={() => setFilterStatus('PENDENTE')}
              className={`px-2.5 py-1 rounded-lg ${filterStatus === 'PENDENTE' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-zinc-400'}`}
            >
              Pendentes ({ofxTransacoes.filter((t) => !t.conciliado).length})
            </button>
            <button
              onClick={() => setFilterStatus('CONCILIADO')}
              className={`px-2.5 py-1 rounded-lg ${filterStatus === 'CONCILIADO' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-zinc-400'}`}
            >
              Conciliados ({ofxTransacoes.filter((t) => t.conciliado).length})
            </button>
          </div>

          <span className="text-zinc-500 text-[11px] font-mono">
            {filteredTransacoes.length} transações
          </span>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3 pl-4">Data</th>
                <th className="p-3">Descrição OFX</th>
                <th className="p-3">FITID (Identificador)</th>
                <th className="p-3 text-right">Valor</th>
                <th className="p-3">Auditoria / Vínculo</th>
                <th className="p-3 pr-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredTransacoes.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 pl-4 font-mono text-zinc-300 whitespace-nowrap">
                    {item.data}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {item.tipo === 'CREDITO' ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold text-zinc-100">{item.descricao}</p>
                        {item.documentoVinculado && (
                          <span className="text-[10px] text-zinc-500 font-mono">Doc: {item.documentoVinculado}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-3 font-mono text-[11px] text-zinc-400">
                    {item.fitid}
                  </td>

                  <td className="p-3 text-right font-mono font-bold text-sm whitespace-nowrap">
                    <span className={item.tipo === 'CREDITO' ? 'text-emerald-400' : 'text-rose-400'}>
                      {item.tipo === 'CREDITO' ? '+' : '-'} R$ {(item.valor ?? 0).toFixed(2)}
                    </span>
                  </td>

                  <td className="p-3">
                    {item.conciliado ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                        <Check className="w-3 h-3" />
                        <span>Conciliado 100%</span>
                      </span>
                    ) : item.statusAuditoria === 'DIVERGENCIA_BORDERÔ' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-800/60 font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{item.divergenciaMotivo || 'Divergência'}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-800/60 font-semibold">
                        <span>Pendente de Vínculo</span>
                      </span>
                    )}
                  </td>

                  <td className="p-3 pr-4 text-right">
                    {!item.conciliado ? (
                      <button
                        onClick={() => conciliarTransacaoOfx(item.fitid)}
                        className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
                      >
                        Conciliar
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500">Auditoria OK</span>
                    )}
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
