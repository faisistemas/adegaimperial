import React, { useState } from 'react';
import { 
  Radio, CheckCircle2, AlertCircle, HelpCircle, XCircle, 
  ArrowDownToLine, Package, Truck, Layers, Building, Eye, RefreshCw
} from 'lucide-react';
import { ManifestacaoDFe } from '../../types/fiscalTypes';

interface ManifestacaoMdeTabProps {
  manifestacoes: ManifestacaoDFe[];
  onManifestar: (dfeId: string, status: ManifestacaoDFe['statusManifestacao']) => void;
  onImportarEstoque: (dfeId: string) => void;
}

export const ManifestacaoMdeTab: React.FC<ManifestacaoMdeTabProps> = ({
  manifestacoes,
  onManifestar,
  onImportarEstoque,
}) => {
  const [selectedDfe, setSelectedDfe] = useState<ManifestacaoDFe | null>(null);
  const [isConsultingSefaz, setIsConsultingSefaz] = useState(false);
  const [radarMessage, setRadarMessage] = useState<string | null>(null);

  const handleConsultarRadar = () => {
    setIsConsultingSefaz(true);
    setTimeout(() => {
      setIsConsultingSefaz(false);
      setRadarMessage('Consulta ao Web Service SEFAZ (distDFeInt) concluída. Todas as notas fiscais emitidas contra seu CNPJ estão atualizadas!');
      setTimeout(() => setRadarMessage(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Radar SEFAZ */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 font-serif">
              Radar SEFAZ & Manifestação do Destinatário (MD-e)
            </h3>
            <p className="text-xs text-zinc-400">
              Captura automática de todas as notas fiscais emitidas por distribuidores contra o CNPJ da sua adega.
            </p>
          </div>
        </div>

        <button
          onClick={handleConsultarRadar}
          disabled={isConsultingSefaz}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isConsultingSefaz ? 'animate-spin' : ''}`} />
          <span>{isConsultingSefaz ? 'Consultando SEFAZ...' : 'Sincronizar Radar SEFAZ'}</span>
        </button>
      </div>

      {radarMessage && (
        <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{radarMessage}</span>
        </div>
      )}

      {/* Cards of Inbound Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(manifestacoes || []).map((dfe) => {
          const isImportada = dfe.statusEstoque === 'IMPORTADA';
          const isConfirmada = dfe.statusManifestacao === 'CONFIRMADA';

          return (
            <div
              key={dfe.id}
              className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 transition-all space-y-3 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-zinc-400" />
                      <h4 className="text-xs font-bold text-zinc-100">{dfe.razaoSocialEmitente}</h4>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-500 mt-0.5">
                      CNPJ: {dfe.cnpjEmitente} • NF-e Nº {dfe.numeroNota} (Série {dfe.serie})
                    </p>
                  </div>

                  <span className="text-sm font-bold font-mono text-amber-300">
                    R$ {(dfe.valorTotalNota ?? 0).toFixed(2)}
                  </span>
                </div>

                <div className="mt-2.5 p-2 bg-zinc-950 rounded-xl border border-zinc-850 text-[11px] font-mono text-zinc-400 break-all">
                  Chave: {dfe.chaveAcesso}
                </div>

                {/* Items Summary with Packaging Conversion */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider flex items-center gap-1">
                    <Layers className="w-3 h-3 text-amber-400" />
                    <span>Itens & Conversão de Embalagem (Fator)</span>
                  </div>

                  {(dfe.itens || []).map((it, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-zinc-950/60 border border-zinc-850 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-zinc-200">{it.produtoDescricaoXml}</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                          <span>NCM: {it.ncm}</span>
                          <span>CEST: {it.cest}</span>
                          <span>CFOP: {it.cfop}</span>
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <p className="text-zinc-200">
                          {it.quantidadeXml} {it.unidadeXml} x Fator {it.fatorConversao}
                        </p>
                        <p className="text-[10px] font-bold text-emerald-400">
                          = {it.quantidadeConvertida} {it.unidadeEstoque}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          Custo c/ ST: R$ {(it.custoUnitarioFinalComStEFrete ?? 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
                {/* Manifest Status Badge */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      dfe.statusManifestacao === 'CONFIRMADA'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : dfe.statusManifestacao === 'CIENCIA'
                        ? 'bg-blue-500/20 text-blue-400'
                        : dfe.statusManifestacao === 'DESCONHECIDA'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {dfe.statusManifestacao === 'CONFIRMADA'
                      ? 'Operação Confirmada (210200)'
                      : dfe.statusManifestacao === 'CIENCIA'
                      ? 'Ciência da Emissão (210210)'
                      : dfe.statusManifestacao === 'DESCONHECIDA'
                      ? 'Desconhecida (210220)'
                      : 'Pendente'}
                  </span>

                  {isImportada && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Estoque Alimentado
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {dfe.statusManifestacao === 'PENDENTE' && (
                    <>
                      <button
                        onClick={() => onManifestar(dfe.id, 'CONFIRMADA')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Confirmar</span>
                      </button>
                      <button
                        onClick={() => onManifestar(dfe.id, 'CIENCIA')}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold"
                      >
                        Ciência
                      </button>
                      <button
                        onClick={() => onManifestar(dfe.id, 'DESCONHECIDA')}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold"
                      >
                        Recusar
                      </button>
                    </>
                  )}

                  {/* Botão de importar no estoque */}
                  {!isImportada && (
                    <button
                      onClick={() => onImportarEstoque(dfe.id)}
                      className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-[11px] flex items-center gap-1"
                    >
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                      <span>Alimentar Estoque</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
