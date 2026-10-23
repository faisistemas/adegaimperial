import React, { useState } from 'react';
import { 
  FileText, Eye, Printer, Copy, Check, AlertTriangle, 
  Search, ShieldAlert, Sparkles, XCircle, RefreshCw
} from 'lucide-react';
import { DocumentoFiscalCompleto } from '../../types/fiscalTypes';

interface FiscalDocumentosTabProps {
  documentos: DocumentoFiscalCompleto[];
  onOpenDanfe: (doc: DocumentoFiscalCompleto) => void;
  onOpenCce: (doc: DocumentoFiscalCompleto) => void;
  onOpenCancel: (doc: DocumentoFiscalCompleto) => void;
  onOpenXml: (doc: DocumentoFiscalCompleto) => void;
}

export const FiscalDocumentosTab: React.FC<FiscalDocumentosTabProps> = ({
  documentos,
  onOpenDanfe,
  onOpenCce,
  onOpenCancel,
  onOpenXml,
}) => {
  const [filterModel, setFilterModel] = useState<'ALL' | '65' | '55'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredDocs = (documentos || []).filter((doc) => {
    if (filterModel !== 'ALL' && doc.modelo !== filterModel) return false;
    if (filterStatus !== 'ALL' && doc.statusSefaz !== filterStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchNumber = (doc.numeroNota ?? '').toString().includes(term);
      const matchKey = (doc.chaveAcesso || '').toLowerCase().includes(term);
      const matchCustomer = (doc.destinatarioNome || '').toLowerCase().includes(term);
      const matchCpf = (doc.destinatarioCpfCnpj || '').includes(term);
      if (!matchNumber && !matchKey && !matchCustomer && !matchCpf) return false;
    }
    return true;
  });

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nº da nota, chave de acesso, cliente ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterModel}
            onChange={(e) => setFilterModel(e.target.value as any)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos os Modelos (55 / 65)</option>
            <option value="65">NFC-e (Modelo 65 - Balcão/Delivery)</option>
            <option value="55">NF-e (Modelo 55 - B2B/Atacado)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 font-semibold focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="AUTORIZADO">Autorizada (100)</option>
            <option value="CONTINGENCIA">Contingência Offline (tpEmis 9)</option>
            <option value="CANCELADO">Cancelada (101)</option>
            <option value="REJEITADO">Rejeitada</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Doc / Série</th>
                <th className="p-3">Emissão</th>
                <th className="p-3">Chave de Acesso</th>
                <th className="p-3">Destinatário</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3">Status SEFAZ</th>
                <th className="p-3 text-right">Ações Fiscais</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {(filteredDocs || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-500 text-xs">
                    Nenhum documento fiscal encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                (filteredDocs || []).map((doc) => {
                  const isNfce = doc.modelo === '65';
                  return (
                    <tr key={doc.id} className="hover:bg-zinc-850/50 transition-colors">
                      <td className="p-3 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isNfce ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                            }`}
                          >
                            {isNfce ? 'NFC-e 65' : 'NF-e 55'}
                          </span>
                          <span className="font-bold text-zinc-100">Nº {doc.numeroNota}</span>
                        </div>
                        <span className="text-[10px] text-zinc-500">Série {doc.serie}</span>
                      </td>

                      <td className="p-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                        {doc.dataEmissao}
                        {doc.tipoEmissao === 'CONTINGENCIA_OFFLINE' && (
                          <div className="text-[10px] text-amber-400 font-sans">tpEmis 9 (Offline)</div>
                        )}
                      </td>

                      <td className="p-3 font-mono text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5">
                          <span>
                            {doc.chaveAcesso.slice(0, 6)}...{doc.chaveAcesso.slice(-6)}
                          </span>
                          <button
                            onClick={() => handleCopyKey(doc.chaveAcesso)}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                            title="Copiar chave de acesso"
                          >
                            {copiedKey === doc.chaveAcesso ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {doc.protocoloAutorizacao && (
                          <div className="text-[10px] text-zinc-500">Prot: {doc.protocoloAutorizacao}</div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-zinc-200">{doc.destinatarioNome}</div>
                        {doc.destinatarioCpfCnpj && (
                          <div className="text-[10px] text-zinc-500 font-mono">
                            {doc.destinatarioCpfCnpj}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-right font-mono font-bold text-amber-300 whitespace-nowrap">
                        R$ {(doc.valorTotal ?? 0).toFixed(2)}
                      </td>

                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            doc.statusSefaz === 'AUTORIZADO'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : doc.statusSefaz === 'CONTINGENCIA'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : doc.statusSefaz === 'CANCELADO'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {doc.statusSefaz === 'AUTORIZADO'
                            ? 'Autorizada'
                            : doc.statusSefaz === 'CONTINGENCIA'
                            ? 'Contingência'
                            : doc.statusSefaz === 'CANCELADO'
                            ? 'Cancelada'
                            : doc.statusSefaz}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Imprimir DANFE */}
                          <button
                            onClick={() => onOpenDanfe(doc)}
                            title="Visualizar e Imprimir DANFE Térmico"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Ver XML */}
                          <button
                            onClick={() => onOpenXml(doc)}
                            title="Visualizar XML assinado"
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Carta de Correção (CC-e) */}
                          {doc.statusSefaz === 'AUTORIZADO' && (
                            <button
                              onClick={() => onOpenCce(doc)}
                              title="Emitir Carta de Correção Eletrônica (CC-e)"
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Cancelar Nota */}
                          {doc.statusSefaz !== 'CANCELADO' && (
                            <button
                              onClick={() => onOpenCancel(doc)}
                              title="Cancelar Nota Fiscal na SEFAZ"
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
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
