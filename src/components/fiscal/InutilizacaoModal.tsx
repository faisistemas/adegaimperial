import React, { useState } from 'react';
import { X, Hash, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { InutilizacaoFaixa } from '../../types/fiscalTypes';

interface InutilizacaoModalProps {
  onClose: () => void;
  onInutilizar: (inut: InutilizacaoFaixa) => void;
}

export const InutilizacaoModal: React.FC<InutilizacaoModalProps> = ({
  onClose,
  onInutilizar,
}) => {
  const [modelo, setModelo] = useState<'55' | '65'>('65');
  const [serie, setSerie] = useState(1);
  const [numeroInicial, setNumeroInicial] = useState(105);
  const [numeroFinal, setNumeroFinal] = useState(105);
  const [justificativa, setJustificativa] = useState(
    'Salto acidental de numeração em terminal de caixa PDV durante fechamento de lote'
  );

  const charCount = justificativa.trim().length;
  const isValid = charCount >= 15 && numeroFinal >= numeroInicial && numeroInicial > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const protocol = `1352600199${Math.floor(Math.random() * 90000) + 10000}`;

    const newInut: InutilizacaoFaixa = {
      id: `inut-${Date.now()}`,
      lojaId: 'store-1',
      modelo,
      serie,
      numeroInicial,
      numeroFinal,
      justificativa,
      protocoloInutilizacao: protocol,
      dataRegistro: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'HOMOLOGADA',
    };

    onInutilizar(newInut);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-lg w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Hash className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-serif">
                Inutilização de Faixa de Numeração
              </h2>
              <p className="text-xs text-zinc-400">
                Regularização de quebra involuntária de sequência fiscal na SEFAZ
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
          
          <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              A inutilização tem papel fiscal decisivo: impede que a Receita Estadual autue o contribuinte por omissão de receita referente a números faltantes na sequência cronológica do livro fiscal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Modelo Fiscal</label>
              <select
                value={modelo}
                onChange={(e) => setModelo(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="65">65 (NFC-e Balcão/Varejo)</option>
                <option value="55">55 (NF-e Mercantil/Atacado)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Série Fiscal</label>
              <input
                type="number"
                min="1"
                value={serie}
                onChange={(e) => setSerie(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Número Inicial *</label>
              <input
                type="number"
                min="1"
                value={numeroInicial}
                onChange={(e) => setNumeroInicial(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Número Final *</label>
              <input
                type="number"
                min={numeroInicial}
                value={numeroFinal}
                onChange={(e) => setNumeroFinal(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          {/* Justificativa */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-zinc-300">
                Justificativa SEFAZ (Mínimo 15 caracteres) *
              </label>
              <span className={`text-[10px] font-mono ${charCount < 15 ? 'text-red-400' : 'text-zinc-400'}`}>
                {charCount} / 255
              </span>
            </div>
            <textarea
              rows={3}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-sans"
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
              <CheckCircle2 className="w-4 h-4" />
              <span>Inutilizar na SEFAZ</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
