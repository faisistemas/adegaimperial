import React from 'react';
import { 
  ShieldAlert, CheckCircle2, AlertTriangle, Key, Calendar, 
  Check, X, FileCheck, RefreshCw, Cpu
} from 'lucide-react';
import { AuditoriaRiscoFiscal, CertificadoDigitalA1, RegraValidacaoAntiRejeicao } from '../../types/fiscalTypes';

interface AuditoriaRiscosTabProps {
  auditorias: AuditoriaRiscoFiscal[];
  certificado: CertificadoDigitalA1;
  regras: RegraValidacaoAntiRejeicao[];
  onResolverRisco: (alertaId: string) => void;
}

export const AuditoriaRiscosTab: React.FC<AuditoriaRiscosTabProps> = ({
  auditorias,
  certificado,
  regras,
  onResolverRisco,
}) => {
  return (
    <div className="space-y-6">
      {/* Certificado Digital A1 Status */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-zinc-100 font-serif">
                Certificado Digital A1 ({certificado.modelo})
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {certificado.status}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              CNPJ: {certificado.cnpj} • Emissor: {certificado.autoridadeCertificadora}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-850">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">Validade do Certificado</p>
              <p className="font-mono font-bold text-zinc-200">
                {certificado.dataValidade} ({certificado.diasRestantes} dias restantes)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Ativos de Risco & Inconsistência */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
              Diagnóstico de Riscos Fiscais & Anti-Autuação
            </h4>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {(auditorias || []).filter((a) => a.statusResolucao === 'PENDENTE').length} Pendências
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {(auditorias || []).map((a) => {
            const isPendente = a.statusResolucao === 'PENDENTE';
            return (
              <div key={a.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-zinc-850/30 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.gravidade === 'ALTA'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : a.gravidade === 'MEDIA'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      Gravidade {a.gravidade}
                    </span>
                    <span className="text-xs font-bold text-zinc-100">{a.produtoNome || 'Configuração Geral'}</span>
                  </div>
                  <p className="text-xs text-zinc-300">{a.descricaoInconsistencia}</p>
                  <p className="text-[11px] text-amber-400/90 font-medium">
                    Ação sugerida: {a.acaoRecomendada}
                  </p>
                </div>

                <div>
                  {isPendente ? (
                    <button
                      onClick={() => onResolverRisco(a.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors whitespace-nowrap"
                    >
                      Corrigir / Resolver
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Resolvido</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Regras Anti-Rejeição Ativas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs text-zinc-100 uppercase tracking-wider">
              Regras do Motor Anti-Rejeição SEFAZ (Validador Pré-Emissão)
            </h4>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
            6 Regras Ativas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
          {(regras || []).map((r) => (
            <div
              key={r.id}
              className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-xl space-y-1 text-xs"
            >
              <div className="flex items-center justify-between font-mono">
                <span className="font-bold text-zinc-200">{r.codigoSefaz}</span>
                <span className="text-[10px] text-emerald-400 font-semibold">{r.severidade}</span>
              </div>
              <p className="text-zinc-300 font-medium">{r.descricaoRegra}</p>
              <p className="text-[11px] text-zinc-500">
                Bloqueio preventivo: {r.mensagemBloqueio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
