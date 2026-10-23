import React, { useState } from 'react';
import { 
  X, Printer, Download, Copy, Check, QrCode, 
  ShieldCheck, AlertTriangle, FileText, CheckCircle2,
  Maximize2, Minimize2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DocumentoFiscalCompleto } from '../../types/fiscalTypes';
import { Store } from '../../types';
import { generateDanfeThermalText } from '../../utils/danfeThermalGenerator';

interface DanfeNfceModalProps {
  doc: DocumentoFiscalCompleto;
  store: Store;
  onClose: () => void;
}

export const DanfeNfceModal: React.FC<DanfeNfceModalProps> = ({ doc, store, onClose }) => {
  const [thermalWidth, setThermalWidth] = useState<'80mm' | '58mm'>('80mm');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  const formattedThermalText = generateDanfeThermalText(doc, store, thermalWidth);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(doc.chaveAcesso);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(formattedThermalText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handlePrint = () => {
    setPrintSuccess(true);
    // Simula disparo para o spooler térmico do PDV
    setTimeout(() => {
      window.print();
      setPrintSuccess(false);
    }, 600);
  };

  const handleDownloadXml = () => {
    const blob = new Blob([doc.xmlEnviado], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NFCe_${doc.chaveAcesso}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const isContingencia = doc.tipoEmissao === 'CONTINGENCIA_OFFLINE';

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isContingencia ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-100 font-serif">
                  {doc.modelo === '65' ? 'DANFE NFC-e Térmico' : doc.modelo === '55' ? 'DANFE NF-e (Modelo 55)' : 'NFS-e de Serviços'}
                </h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  doc.statusSefaz === 'AUTORIZADO' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : isContingencia 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {doc.statusSefaz === 'AUTORIZADO' ? 'SEFAZ Autorizada (100)' : isContingencia ? 'Contingência Offline (tpEmis 9)' : doc.statusSefaz}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                Nº {doc.numeroNota} | Série {doc.serie} | Emissão: {doc.dataEmissao}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Seletor de Largura da Bobina Térmica */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setThermalWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${thermalWidth === '80mm' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                80mm
              </button>
              <button
                onClick={() => setThermalWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${thermalWidth === '58mm' ? 'bg-amber-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                58mm
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Visual Preview, Right Quick Actions */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-zinc-950/70">
          
          {/* Thermal Paper Visualizer Container */}
          <div className="lg:col-span-7 flex justify-center">
            <div 
              className={`bg-zinc-100 text-zinc-900 font-mono text-[11px] leading-relaxed p-5 shadow-2xl rounded-sm border border-zinc-300 relative select-text transition-all ${
                thermalWidth === '80mm' ? 'w-full max-w-[380px]' : 'w-full max-w-[300px]'
              }`}
            >
              {/* Paper Top Cut Graphic */}
              <div className="border-b-2 border-dashed border-zinc-400 pb-3 mb-3 text-center space-y-1">
                <p className="font-extrabold text-xs tracking-wider">{store.name.toUpperCase()}</p>
                <p className="text-[10px] text-zinc-700">CNPJ: {store.cnpj} - IE: {store.ie}</p>
                <p className="text-[10px] text-zinc-600">{store.address}, {store.city}-{store.state}</p>
              </div>

              {/* Contingency Banner if applicable */}
              {isContingencia && (
                <div className="border border-zinc-900 p-2 my-2 text-center bg-zinc-200 font-bold text-[10px]">
                  *** EMITIDA EM CONTINGÊNCIA OFFLINE ***<br/>
                  Pendente de autorização síncrona pela SEFAZ
                </div>
              )}

              {/* Document Subtitle */}
              <div className="text-center my-2 border-b border-zinc-300 pb-2">
                <p className="font-bold text-[11px]">
                  {doc.modelo === '65' ? 'DANFE NFC-e' : 'DANFE NF-e'}
                </p>
                <p className="text-[9px] text-zinc-600">Documento Auxiliar da Nota Fiscal de Consumidor Eletrônica</p>
                <p className="text-[10px] font-bold mt-1">
                  NFC-e Nº {doc.numeroNota} - Série {doc.serie} - {doc.dataEmissao}
                </p>
              </div>

              {/* Items Table */}
              <div className="my-3 space-y-1.5 border-b border-zinc-300 pb-3">
                <div className="flex justify-between font-bold text-[10px] border-b border-zinc-400 pb-0.5">
                  <span>ITEM / DESCRIÇÃO</span>
                  <span>TOTAL (R$)</span>
                </div>
                {(doc.itens || []).map((it) => (
                  <div key={it.itemNumero} className="flex justify-between items-start text-[10px]">
                    <div className="pr-2">
                      <p className="font-semibold">{String(it.itemNumero).padStart(2, '0')} {it.produtoNome}</p>
                      <p className="text-[9px] text-zinc-600">
                        {it.quantidade} {it.unidade} x R$ {(it.valorUnitario ?? 0).toFixed(2)} | NCM {it.ncm} | CFOP {it.cfop}
                      </p>
                    </div>
                    <span className="font-bold whitespace-nowrap">R$ {(it.valorTotal ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="space-y-1 text-[10px] border-b border-zinc-400 pb-2">
                <div className="flex justify-between">
                  <span>Qtd. Total de Itens:</span>
                  <span className="font-bold">{(doc.itens || []).length}</span>
                </div>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-zinc-300">
                  <span>VALOR TOTAL:</span>
                  <span>R$ {(doc.valorTotal ?? 0).toFixed(2)}</span>
                </div>
                {doc.valorTributosAprox > 0 && (
                  <div className="flex justify-between text-[9px] text-zinc-700 italic pt-1">
                    <span>Tributos Aprox. (Lei 12.741):</span>
                    <span>R$ {(doc.valorTributosAprox ?? 0).toFixed(2)} ({((((doc.valorTributosAprox ?? 0) / (doc.valorTotal || 1))) * 100).toFixed(1)}%)</span>
                  </div>
                )}
              </div>

              {/* Consumer Info */}
              <div className="my-2 text-[9px] border-b border-zinc-300 pb-2">
                <p><span className="font-bold">CONSUMIDOR:</span> {doc.destinatarioNome || 'NÃO IDENTIFICADO'}</p>
                {doc.destinatarioCpfCnpj && (
                  <p><span className="font-bold">CPF/CNPJ:</span> {doc.destinatarioCpfCnpj}</p>
                )}
              </div>

              {/* QR Code Regulamentar SEFAZ */}
              <div className="my-3 flex flex-col items-center justify-center p-2 bg-white rounded border border-zinc-300 text-center">
                <p className="text-[9px] font-bold mb-1 text-zinc-800 uppercase tracking-tighter">Consulta via Leitor QR Code</p>
                <div className="p-1.5 bg-white border border-zinc-200 rounded">
                  <QRCodeSVG 
                    value={doc.qrcodeUrl || `https://www.nfce.fazenda.sp.gov.br/qrcode?p=${doc.chaveAcesso}|2|1|1|8B92942F-8461-41AA-B73C-E68241A0B2C9`}
                    size={thermalWidth === '80mm' ? 120 : 96}
                    level="M"
                  />
                </div>
                <p className="text-[8px] text-zinc-500 mt-1 max-w-[200px] break-all leading-tight">
                  Protocolo: {doc.protocoloAutorizacao || 'Contingência Offline (Sem Protocolo)'}
                </p>
              </div>

              {/* Chave de Acesso */}
              <div className="text-center text-[9px] border-t border-zinc-300 pt-2 text-zinc-700">
                <p className="font-bold text-[8px] uppercase">Chave de Acesso:</p>
                <p className="font-mono text-[8px] break-all font-semibold mt-0.5">
                  {doc.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim()}
                </p>
              </div>

              {/* Paper Bottom Cut Graphic */}
              <div className="border-t-2 border-dashed border-zinc-400 mt-4 pt-2 text-center text-[8px] text-zinc-600">
                ADEGA IMPERIAL - SISTEMA EMISSOR NFC-e 4.00
              </div>
            </div>
          </div>

          {/* Right Actions & Fiscal Metadata */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Quick Action Buttons */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Ações de Impressão e Envio</h3>
              
              <button
                onClick={handlePrint}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir DANFE na Impressora Térmica</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopyKey}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/80"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Chave Copiada!' : 'Copiar Chave'}</span>
                </button>

                <button
                  onClick={handleDownloadXml}
                  className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-700/80"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Baixar XML</span>
                </button>
              </div>

              <button
                onClick={handleCopyText}
                className="w-full py-2 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono flex items-center justify-center gap-1.5 border border-zinc-800 transition-colors"
              >
                {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <FileText className="w-3 h-3" />}
                <span>{copiedText ? 'Texto ESC/POS copiado!' : 'Copiar Comandos Texto ESC/POS'}</span>
              </button>
            </div>

            {/* Fiscal Specifications Card */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Auditoria & Parâmetros Fiscais</span>
              </h3>

              <div className="space-y-2 text-xs divide-y divide-zinc-800">
                <div className="flex justify-between pt-1">
                  <span className="text-zinc-400">Modelo Fiscal:</span>
                  <span className="text-zinc-200 font-mono font-bold">
                    {doc.modelo === '65' ? '65 (NFC-e Varejo)' : doc.modelo === '55' ? '55 (NF-e Mercantil)' : 'NFS-e'}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-zinc-400">Tipo de Emissão:</span>
                  <span className={`font-bold font-mono ${isContingencia ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {doc.tipoEmissao === 'CONTINGENCIA_OFFLINE' ? '9 - Contingência Offline' : '1 - Normal Síncrona'}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-zinc-400">Natureza da Operação:</span>
                  <span className="text-zinc-300 font-semibold">{doc.naturezaOperacao}</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-zinc-400">Ambiente SEFAZ:</span>
                  <span className="text-zinc-200 font-mono">1 - Produção Nacional</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-zinc-400">DigestValue (Assinatura):</span>
                  <span className="text-zinc-400 font-mono text-[10px]">4fK89vLz10Q=</span>
                </div>
              </div>

              {isContingencia && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-bold">Contingência Offline Regulamentar</p>
                    <p className="text-[10px] text-amber-400/90 mt-0.5">
                      Conforme cláusula décima primeira do Ajuste SINIEF 19/2016, a NFC-e emitida em contingência deverá ser transmitida à SEFAZ em até 24 horas após a cessação dos problemas técnicos.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* XML Inspector Preview */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 uppercase">Payload XML Assinado</span>
                <span className="text-[10px] text-zinc-500 font-mono">v4.00</span>
              </div>
              <div className="max-h-36 overflow-y-auto bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 font-mono text-[10px] text-zinc-400 whitespace-pre-wrap leading-relaxed">
                {doc.xmlEnviado}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
