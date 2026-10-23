import React, { useState } from 'react';
import { X, FileText, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { DocumentoFiscalCompleto, CartaCorrecaoEvento } from '../../types/fiscalTypes';

interface CartaCorrecaoModalProps {
  doc: DocumentoFiscalCompleto;
  onClose: () => void;
  onEmitirCce: (cce: CartaCorrecaoEvento) => void;
}

export const CartaCorrecaoModal: React.FC<CartaCorrecaoModalProps> = ({
  doc,
  onClose,
  onEmitirCce,
}) => {
  const [textoCorrecao, setTextoCorrecao] = useState('');
  const [justificativaLegal, setJustificativaLegal] = useState(
    'Art. 58-B do Convênio SINIEF s/nº de 1970 (Dados que não alteram valor ou impostos)'
  );

  const charCount = textoCorrecao.trim().length;
  const isValid = charCount >= 15 && charCount <= 1000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const protocol = `135269988${Math.floor(Math.random() * 900000) + 100000}`;

    const newCce: CartaCorrecaoEvento = {
      id: `cce-${Date.now()}`,
      documentoFiscalId: doc.id,
      numeroNota: doc.numeroNota,
      serie: doc.serie,
      modelo: doc.modelo,
      chaveAcesso: doc.chaveAcesso,
      sequencialEvento: 1,
      textoCorrecao,
      statusEnvio: 'HOMOLOGADA',
      protocoloSefaz: protocol,
      dataEvento: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      justificativaLegal,
    };

    onEmitirCce(newCce);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-xl w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-serif">
                Carta de Correção Eletrônica (CC-e)
              </h2>
              <p className="text-xs text-zinc-400">
                Evento 110110 - Regularização de dados sem impacto tributário
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          
          {/* Dados do Documento Vinculado */}
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs space-y-1 font-mono">
            <div className="flex justify-between text-zinc-400">
              <span>Documento:</span>
              <span className="text-zinc-200 font-bold">
                {doc.modelo === '55' ? 'NF-e 55' : 'NFC-e 65'} Nº {doc.numeroNota} (Série {doc.serie})
              </span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Destinatário:</span>
              <span className="text-zinc-200">{doc.destinatarioNome}</span>
            </div>
            <div className="text-[10px] text-zinc-500 break-all pt-1 border-t border-zinc-850">
              Chave: {doc.chaveAcesso}
            </div>
          </div>

          {/* Advertência Jurídica Obrigatória */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Restrições Legais da CC-e (Art. 7º Convênio S/N 1970):</p>
              <p className="text-[10px] text-amber-400/90 leading-tight">
                É proibido por lei alterar valores, alíquotas, base de cálculo, data de emissão ou mudar completamente o emitente ou destinatário. A CC-e destina-se a correções de endereço, transportadora, observações ou código de produto sem reflexo de imposto.
              </p>
            </div>
          </div>

          {/* Campo de Texto da Correção */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Texto Descritivo da Retificação *
              </label>
              <span className={`text-[10px] font-mono ${charCount < 15 ? 'text-red-400' : 'text-zinc-400'}`}>
                {charCount} / 1000 caracteres (mínimo 15)
              </span>
            </div>
            <textarea
              rows={4}
              value={textoCorrecao}
              onChange={(e) => setTextoCorrecao(e.target.value)}
              placeholder="Ex: Correção nos dados adicionais da transportadora e complemento de endereço do destinatário..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 leading-relaxed font-sans"
            />
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Homologar CC-e na SEFAZ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
