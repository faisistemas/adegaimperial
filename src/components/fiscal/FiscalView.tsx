import React, { useState } from 'react';
import { 
  FileCheck, Download, WifiOff, Wifi, ShieldAlert, 
  Eye, RefreshCw, FileText, CheckCircle2, Send,
  AlertTriangle, Copy, Check, Plus, Radio, DollarSign,
  Sparkles, CreditCard, Layers, X, Key, ShieldCheck, Mail
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { generateSpedFiscalText, generateSintegraText } from '../../utils/fiscalUtils';
import { DocumentoFiscalCompleto, CartaCorrecaoEvento, InutilizacaoFaixa } from '../../types/fiscalTypes';
import { FiscalDocumentosTab } from './FiscalDocumentosTab';
import { ManifestacaoMdeTab } from './ManifestacaoMdeTab';
import { EventosFiscalTab } from './EventosFiscalTab';
import { ConciliacaoTefTab } from './ConciliacaoTefTab';
import { RessarcimentoStTab } from './RessarcimentoStTab';
import { ReformaTributariaTab } from './ReformaTributariaTab';
import { AuditoriaRiscosTab } from './AuditoriaRiscosTab';
import { NovaNfeModal } from './NovaNfeModal';
import { DanfeNfceModal } from './DanfeNfceModal';
import { CartaCorrecaoModal } from './CartaCorrecaoModal';
import { InutilizacaoModal } from './InutilizacaoModal';

type FiscalTabType = 
  | 'documentos' 
  | 'mde' 
  | 'eventos' 
  | 'tef' 
  | 'ressarcimento' 
  | 'reforma' 
  | 'auditoria';

export const FiscalView: React.FC = () => {
  const { 
    activeStore, 
    orders,
    products,
    documentosFiscais,
    perfisFiscais,
    certificadoDigital,
    offlineContingencyMode, 
    setOfflineContingencyMode,
    manifestacoesDfe,
    cartasCorrecao,
    inutilizacoesFaixa,
    regrasValidacaoFiscal,
    conciliacoesTef,
    ressarcimentosIcmsSt,
    reformaTributariaItens,
    auditoriaRiscos,
    exportacaoContabil,
    emitirDocumentoFiscal,
    cancelarDocumentoFiscal,
    sincronizarContingencias,
    manifestarDFe,
    importarDFeParaEstoque,
    emitirCartaCorrecao,
    inutilizarFaixaNumeracao,
    resolverAlertaRisco,
    agendarEnvioContador,
  } = useAdega();

  const [activeTab, setActiveTab] = useState<FiscalTabType>('documentos');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [emailContadorInput, setEmailContadorInput] = useState('contabilidade@adegaswg.com.br');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals state
  const [isNovaNfeOpen, setIsNovaNfeOpen] = useState(false);
  const [selectedDocForDanfe, setSelectedDocForDanfe] = useState<DocumentoFiscalCompleto | null>(null);
  const [selectedDocForCce, setSelectedDocForCce] = useState<DocumentoFiscalCompleto | null>(null);
  const [selectedDocForCancel, setSelectedDocForCancel] = useState<DocumentoFiscalCompleto | null>(null);
  const [cancelJustificativa, setCancelJustificativa] = useState('Erro no preenchimento de dados pelo operador de caixa');
  const [selectedDocForXml, setSelectedDocForXml] = useState<DocumentoFiscalCompleto | null>(null);
  const [isInutilizarOpen, setIsInutilizarOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Contagem de contingências pendentes
  const notasEmContingencia = documentosFiscais.filter((d) => d.statusSefaz === 'CONTINGENCIA');

  const handleDownloadSped = () => {
    const textContent = generateSpedFiscalText(activeStore, orders, products);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPED_EFD_${activeStore.cnpj.replace(/\D/g, '')}_${selectedMonth.replace('-', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Arquivo SPED Fiscal EFD gerado com sucesso (Blocos 0, C, D, H de Inventário e 9)!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDownloadSintegra = () => {
    const textContent = generateSintegraText(activeStore, orders);
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SINTEGRA_${activeStore.cnpj.replace(/\D/g, '')}_${selectedMonth.replace('-', '')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Arquivo Sintegra exportado com sucesso!');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDownloadBatchXml = () => {
    const combinedXml = (documentosFiscais || []).map((doc) => doc.xmlEnviado).join('\n\n');
    const blob = new Blob([combinedXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `XMLS_FISCAIS_${activeStore.cnpj.replace(/\D/g, '')}_${selectedMonth.replace('-', '')}.xml`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage(`Pacote consolidado com ${(documentosFiscais || []).length} XMLs fiscais baixado com sucesso!`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleEnviarContador = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailContadorInput) return;
    agendarEnvioContador(emailContadorInput, selectedMonth);
    setSuccessMessage(`Pacote mensal (SPED Bloco H, Sintegra e XMLs) transmitido ao escritório de contabilidade (${emailContadorInput})!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleSincronizarContingencias = () => {
    const result = sincronizarContingencias();
    setSuccessMessage(result.message);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocForCancel) return;
    const res = cancelarDocumentoFiscal(selectedDocForCancel.id, cancelJustificativa);
    setSelectedDocForCancel(null);
    setSuccessMessage(res.message);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-6 space-y-6">
      
      {/* Top Header & SEFAZ Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-bold">
            SEFAZ Brasil Homologado
          </span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Key className="w-3 h-3 text-emerald-400" />
            Certificado A1 Válido ({certificadoDigital.diasRestantes}d)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Sincronizar Contingência se houver pendências */}
          {notasEmContingencia.length > 0 && (
            <button
              onClick={handleSincronizarContingencias}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 animate-pulse transition-transform active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizar {notasEmContingencia.length} em Contingência</span>
            </button>
          )}

          {/* Botão Nova NF-e / NFC-e Manual */}
          <button
            onClick={() => setIsNovaNfeOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-zinc-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Emitir NF-e / NFC-e</span>
          </button>

          {/* Toggle de Contingência Offline */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            {offlineContingencyMode ? (
              <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-400" />
            )}
            <div className="text-left">
              <span className="text-[11px] font-bold text-zinc-200 block">
                {offlineContingencyMode ? 'Contingência Offline' : 'SEFAZ Online'}
              </span>
              <span className="text-[9px] text-zinc-500 block">
                {offlineContingencyMode ? 'tpEmis 9 ativado' : 'Transmissão síncrona'}
              </span>
            </div>
            <button
              onClick={() => setOfflineContingencyMode(!offlineContingencyMode)}
              className={`ml-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                offlineContingencyMode
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {offlineContingencyMode ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/50 border border-emerald-700/60 rounded-2xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Beverage Tax Compliance Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200 font-serif">ICMS Substituição Tributária (ST)</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
              CFOP 5.405 / CST 500
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Bebidas com ICMS recolhido anteriormente pelo fabricante ou distribuidor. Na adega, a venda ao consumidor final tem alíquota zero para não gerar bi-tributação.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200 font-serif">PIS / COFINS Monofásico</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">
              CST 04 / Alíquota 0%
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Lei Federal nº 10.147/2000: Cervejas, refrigerantes, águas e energéticos são monofásicos. Tributação concentrada na indústria, com tributação zerada no varejo.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-zinc-200 font-serif">FCP (Fundo Combate à Pobreza)</span>
            <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded font-mono font-bold">
              2% a 4% Estadual
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Adicional de alíquota estadual aplicado sobre destilados (whisky, gin, vodka, cachaça). Parametrizado de acordo com a SEFAZ do estado da filial.
          </p>
        </div>
      </div>

      {/* Export to Accountant & Monthly Closing Section */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 space-y-4 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-zinc-100 font-serif">
              Fechamento Mensal & Obrigações Acessórias para a Contabilidade
            </h3>
            <p className="text-xs text-zinc-400">
              Gere os arquivos fiscais oficiais com 1 clique ou envie o pacote completo diretamente para o contador.
            </p>
          </div>

          <form onSubmit={handleEnviarContador} className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Mês:</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <input
                type="email"
                placeholder="email@contabilidade.com.br"
                value={emailContadorInput}
                onChange={(e) => setEmailContadorInput(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 w-52"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1 transition-transform active:scale-95"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Despachar ao Contador</span>
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            onClick={handleDownloadSped}
            className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 flex items-center justify-between text-xs font-semibold text-zinc-200 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-zinc-100">SPED Fiscal EFD (c/ Bloco H)</p>
                <p className="text-[10px] text-zinc-400">Inventário Apurado, Bloco C, D e 9 (.txt)</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            onClick={handleDownloadSintegra}
            className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 flex items-center justify-between text-xs font-semibold text-zinc-200 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-zinc-100">Arquivo Sintegra Estadual</p>
                <p className="text-[10px] text-zinc-400">Registros 10, 11, 60M, 90 (.txt)</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>

          <button
            onClick={handleDownloadBatchXml}
            className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 flex items-center justify-between text-xs font-semibold text-zinc-200 transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-bold text-zinc-100">Pacote de XMLs Fiscais</p>
                <p className="text-[10px] text-zinc-400">{documentosFiscais.length} Documentos Emitidos</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-zinc-800 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('documentos')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'documentos'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Documentos Emitidos ({documentosFiscais.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mde')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'mde'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Radar SEFAZ & MD-e ({manifestacoesDfe.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('eventos')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'eventos'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Eventos (CC-e & Inutilização)</span>
        </button>

        <button
          onClick={() => setActiveTab('tef')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'tef'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Conciliação TEF / POS</span>
        </button>

        <button
          onClick={() => setActiveTab('ressarcimento')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'ressarcimento'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Ressarcimento ST (CAT 42)</span>
        </button>

        <button
          onClick={() => setActiveTab('reforma')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'reforma'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Reforma Tributária (IBS/CBS)</span>
        </button>

        <button
          onClick={() => setActiveTab('auditoria')}
          className={`px-3.5 py-2 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'auditoria'
              ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Motor Anti-Rejeição & Riscos</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div>
        {activeTab === 'documentos' && (
          <FiscalDocumentosTab
            documentos={documentosFiscais}
            onOpenDanfe={(doc) => setSelectedDocForDanfe(doc)}
            onOpenCce={(doc) => setSelectedDocForCce(doc)}
            onOpenCancel={(doc) => setSelectedDocForCancel(doc)}
            onOpenXml={(doc) => setSelectedDocForXml(doc)}
          />
        )}

        {activeTab === 'mde' && (
          <ManifestacaoMdeTab
            manifestacoes={manifestacoesDfe}
            onManifestar={manifestarDFe}
            onImportarEstoque={importarDFeParaEstoque}
          />
        )}

        {activeTab === 'eventos' && (
          <EventosFiscalTab
            cartasCorrecao={cartasCorrecao}
            inutilizacoes={inutilizacoesFaixa}
            onOpenInutilizarModal={() => setIsInutilizarOpen(true)}
          />
        )}

        {activeTab === 'tef' && (
          <ConciliacaoTefTab conciliacoes={conciliacoesTef} />
        )}

        {activeTab === 'ressarcimento' && (
          <RessarcimentoStTab ressarcimentos={ressarcimentosIcmsSt} />
        )}

        {activeTab === 'reforma' && (
          <ReformaTributariaTab itensReforma={reformaTributariaItens} />
        )}

        {activeTab === 'auditoria' && (
          <AuditoriaRiscosTab
            auditorias={auditoriaRiscos}
            certificado={certificadoDigital}
            regras={regrasValidacaoFiscal}
            onResolverRisco={resolverAlertaRisco}
          />
        )}
      </div>

      {/* MODAL 1: Nova NF-e / NFC-e Manual */}
      {isNovaNfeOpen && (
        <NovaNfeModal
          onClose={() => setIsNovaNfeOpen(false)}
          onEmitir={(doc) => emitirDocumentoFiscal(doc)}
        />
      )}

      {/* MODAL 2: DANFE Térmico com QR Code */}
      {selectedDocForDanfe && (
        <DanfeNfceModal
          doc={selectedDocForDanfe}
          store={activeStore}
          onClose={() => setSelectedDocForDanfe(null)}
        />
      )}

      {/* MODAL 3: Carta de Correção (CC-e) */}
      {selectedDocForCce && (
        <CartaCorrecaoModal
          doc={selectedDocForCce}
          onClose={() => setSelectedDocForCce(null)}
          onEmitirCce={emitirCartaCorrecao}
        />
      )}

      {/* MODAL 4: Inutilização de Faixa de Numeração */}
      {isInutilizarOpen && (
        <InutilizacaoModal
          onClose={() => setIsInutilizarOpen(false)}
          onInutilizar={inutilizarFaixaNumeracao}
        />
      )}

      {/* MODAL 5: Cancelamento de Documento Fiscal com Justificativa */}
      {selectedDocForCancel && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100 font-serif">
                    Cancelar Documento na SEFAZ
                  </h3>
                  <p className="text-[10px] text-zinc-400">
                    Evento 110111 - Cancelamento homologado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocForCancel(null)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 text-xs space-y-1 font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Nota:</span>
                <span className="text-zinc-200 font-bold">
                  {selectedDocForCancel.modelo === '55' ? 'NF-e 55' : 'NFC-e 65'} Nº {selectedDocForCancel.numeroNota}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Valor:</span>
                <span className="text-amber-300 font-bold">
                  R$ {(selectedDocForCancel.valorTotal ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Justificativa Legal do Cancelamento (Mínimo 15 caracteres) *
                </label>
                <textarea
                  rows={3}
                  value={cancelJustificativa}
                  onChange={(e) => setCancelJustificativa(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedDocForCancel(null)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={cancelJustificativa.trim().length < 15}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs"
                >
                  Homologar Cancelamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: XML Viewer Completo */}
      {selectedDocForXml && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-3xl w-full p-5 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-zinc-100 font-mono">
                  XML Fiscal Assinado: {selectedDocForXml.modelo === '55' ? 'NF-e 55' : 'NFC-e 65'} Nº {selectedDocForXml.numeroNota}
                </h3>
                <p className="text-[10px] font-mono text-zinc-400 break-all">{selectedDocForXml.chaveAcesso}</p>
              </div>
              <button
                onClick={() => setSelectedDocForXml(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 rounded-2xl border border-zinc-850 font-mono text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {selectedDocForXml.xmlEnviado}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => handleCopyText(selectedDocForXml.xmlEnviado)}
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-semibold hover:bg-zinc-700 flex items-center gap-1.5"
              >
                {copiedKey === selectedDocForXml.xmlEnviado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar XML</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedDocForXml(null)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
