import React, { useState } from 'react';
import { 
  Wine, Droplets, Plus, AlertTriangle, CheckCircle2, 
  Trash2, Sparkles, GlassWater, ArrowDownCircle, ShieldCheck
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Product } from '../../types';

export const BancadaDosesTab: React.FC = () => {
  const { 
    products, 
    recipientesAbertos, 
    abrirNovaGarrafa, 
    finalizarGarrafaAberta, 
    debitDoseStock, 
    recordDoseLoss,
    currentUser 
  } = useAdega();

  const [openModal, setOpenModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [servingDoseModal, setServingDoseModal] = useState<{ open: boolean; produtoId: string; nome: string } | null>(null);
  const [doseQtd, setDoseQtd] = useState<number>(1);
  const [lossModal, setLossModal] = useState<{ open: boolean; produtoId: string; nome: string } | null>(null);
  const [lossMl, setLossMl] = useState<number>(50);
  const [lossReason, setLossReason] = useState<'WASTE' | 'TASTING'>('TASTING');
  const [lossNotes, setLossNotes] = useState('');

  // Produtos que são fracionáveis (destilados, licores, cachaças)
  const fractionableProducts = products.filter(p => p.isFractionable);
  const activeRecipients = recipientesAbertos.filter(r => r.status === 'EM_USO');

  const totalDosesDisponiveis = activeRecipients.reduce((acc, r) => acc + Math.floor(r.volumeRestanteMl / 50), 0);
  const garrafasBaixas = activeRecipients.filter(r => r.volumeRestanteMl <= 200).length;

  const handleOpenBottleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    abrirNovaGarrafa(selectedProductId);
    setOpenModal(false);
    setSelectedProductId('');
  };

  const handleServeDose = () => {
    if (!servingDoseModal) return;
    debitDoseStock(servingDoseModal.produtoId, doseQtd, undefined, currentUser.name);
    setServingDoseModal(null);
    setDoseQtd(1);
  };

  const handleRecordLoss = () => {
    if (!lossModal) return;
    recordDoseLoss(
      lossModal.produtoId, 
      lossMl, 
      lossReason, 
      lossNotes || (lossReason === 'TASTING' ? 'Degustação para cliente' : 'Perda de dosador/quebra de bico')
    );
    setLossModal(null);
    setLossNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wine className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Garrafas Abertas (Bancada)</p>
            <p className="text-2xl font-bold text-white tracking-tight">{activeRecipients.length} <span className="text-xs font-normal text-zinc-400">em uso</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Doses Disponíveis</p>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight">~{totalDosesDisponiveis} <span className="text-xs font-normal text-zinc-400">(de 50ml)</span></p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Estoque Fechado Depósito</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {fractionableProducts.reduce((acc, p) => acc + p.stockUnits, 0)} <span className="text-xs font-normal text-zinc-400">garrafas</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${garrafasBaixas > 0 ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400' : 'bg-zinc-800 text-zinc-400'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Nível Crítico (≤200ml)</p>
            <p className={`text-2xl font-bold tracking-tight ${garrafasBaixas > 0 ? 'text-rose-400' : 'text-zinc-300'}`}>
              {garrafasBaixas} <span className="text-xs font-normal text-zinc-400">garrafa(s)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-900/40 p-4 border border-zinc-800/80 rounded-xl">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Wine className="w-5 h-5 text-amber-500" />
            Recipientes em Uso no Balcão de Preparo
          </h3>
          <p className="text-xs text-zinc-400">
            Separação contábil entre garrafas lacradas no depósito e garrafas em consumo fracionado.
          </p>
        </div>
        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Abrir Nova Garrafa do Depósito
        </button>
      </div>

      {/* Grid of Open Bottles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(activeRecipients || []).map((rec) => {
          const totalVol = rec.volumeOriginalMl || 1000;
          const percent = Math.min(100, Math.round(((rec.volumeRestanteMl ?? 0) / totalVol) * 100));
          const dosesRestantes = Math.floor((rec.volumeRestanteMl ?? 0) / 50);
          const isCritical = (rec.volumeRestanteMl ?? 0) <= 200;
          const product = (products || []).find(p => p.id === rec.produtoPaiId);

          return (
            <div 
              key={rec.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {/* Critical Alert Bar */}
              {isCritical && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
              )}

              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                      Garrafa #{rec.garrafaNumero} Aberta
                    </span>
                    <h4 className="text-base font-bold text-white mt-1 leading-snug">
                      {rec.produtoPaiNome}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Aberta em {rec.dataAbertura}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                    <Wine className="w-5 h-5 text-amber-400" />
                  </div>
                </div>

                {/* Liquid Level Visualizer */}
                <div className="bg-zinc-950 p-3.5 rounded-lg border border-zinc-800/80 mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-zinc-400 font-medium">Nível Restante</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {rec.volumeRestanteMl}ml / {rec.volumeOriginalMl}ml ({percent}%)
                    </span>
                  </div>

                  {/* Visual Bar */}
                  <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        percent <= 20 
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50' 
                          : percent <= 45 
                          ? 'bg-amber-500 shadow-sm shadow-amber-500/50' 
                          : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-900 text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <GlassWater className="w-3.5 h-3.5 text-zinc-500" />
                      Doses restantes (50ml):
                    </span>
                    <span className="font-bold text-amber-400 font-mono">
                      {dosesRestantes} doses
                    </span>
                  </div>
                </div>

                {/* Stock info of sealed units */}
                {product && (
                  <div className="bg-zinc-800/40 px-3 py-2 rounded-lg mb-4 flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Depósito Fechado:</span>
                    <span className="font-semibold text-zinc-200">
                      {product.stockUnits} garrafa(s) lacradas
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setServingDoseModal({ open: true, produtoId: rec.produtoPaiId, nome: rec.produtoPaiNome })}
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <GlassWater className="w-3.5 h-3.5 text-amber-400" />
                    Servir Dose
                  </button>
                  <button
                    onClick={() => setLossModal({ open: true, produtoId: rec.produtoPaiId, nome: rec.produtoPaiNome })}
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    Degustação/Perda
                  </button>
                </div>

                <button
                  onClick={() => finalizarGarrafaAberta(rec.id)}
                  className="w-full py-1.5 px-3 bg-zinc-950 hover:bg-rose-950/30 hover:border-rose-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Esvaziar e Finalizar Garrafa
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeRecipients.length === 0 && (
        <div className="text-center py-12 bg-zinc-900/50 border border-zinc-800 rounded-xl">
          <Wine className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-base font-semibold text-white">Nenhuma garrafa aberta no balcão</h4>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1 mb-4">
            Abra uma garrafa lacrada do depósito para iniciar o controle e fracionamento de doses neste terminal.
          </p>
          <button
            onClick={() => setOpenModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-sm"
          >
            Abrir Primeira Garrafa
          </button>
        </div>
      )}

      {/* Modal: Abrir Nova Garrafa do Depósito */}
      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wine className="w-5 h-5 text-amber-500" />
                Abrir Garrafa do Depósito
              </h3>
              <button 
                onClick={() => setOpenModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Ao confirmar a abertura, 1 garrafa lacrada será deduzida do estoque fechado no depósito e um novo recipiente ativo será registrado na bancada de preparo.
            </p>

            <form onSubmit={handleOpenBottleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1.5 block">
                  Selecione a Bebida / Destilado:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  required
                >
                  <option value="">Selecione um produto...</option>
                  {(fractionableProducts || []).map((prod) => (
                    <option key={prod.id} value={prod.id} disabled={prod.stockUnits <= 0}>
                      {prod.name} ({prod.stockUnits} un lacradas em estoque - {prod.bottleVolumeMl || 1000}ml)
                    </option>
                  ))}
                </select>
              </div>

              {selectedProductId && (
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs text-amber-300 space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <ArrowDownCircle className="w-4 h-4" />
                    Fluxo Automático de Baixa:
                  </p>
                  <p>• Dedução: -1 unidade do estoque lacrado</p>
                  <p>• Novo Recipiente: {(products || []).find(p => p.id === selectedProductId)?.bottleVolumeMl || 1000}ml liberados no balcão</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedProductId}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-sm"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Servir Dose Manual */}
      {servingDoseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <GlassWater className="w-5 h-5 text-amber-400" />
              Servir Doses de Balcão
            </h3>
            <p className="text-xs text-zinc-400">{servingDoseModal.nome}</p>

            <div>
              <label className="text-xs text-zinc-300 block mb-1">Quantidade de Doses (50ml cada):</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDoseQtd(Math.max(1, doseQtd - 1))}
                  className="w-10 h-10 bg-zinc-800 rounded-lg text-white font-bold"
                >
                  -
                </button>
                <span className="flex-1 text-center font-mono font-bold text-lg text-amber-400">
                  {doseQtd} dose(s) ({doseQtd * 50}ml)
                </span>
                <button
                  type="button"
                  onClick={() => setDoseQtd(doseQtd + 1)}
                  className="w-10 h-10 bg-zinc-800 rounded-lg text-white font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setServingDoseModal(null)}
                className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleServeDose}
                className="px-4 py-1.5 bg-amber-500 text-zinc-950 font-bold rounded-lg text-xs"
              >
                Debitar Doses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Registrar Degustação ou Perda de Dose */}
      {lossModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Registrar Perda ou Degustação
            </h3>
            <p className="text-xs text-zinc-400">{lossModal.nome}</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Tipo de Ocorrência:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLossReason('TASTING')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border ${
                      lossReason === 'TASTING' 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    Degustação Cortesia
                  </button>
                  <button
                    type="button"
                    onClick={() => setLossReason('WASTE')}
                    className={`p-2.5 rounded-lg text-xs font-semibold border ${
                      lossReason === 'WASTE' 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300' 
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    Perda / Quebra de Dosador
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Volume em ML:</label>
                <input
                  type="number"
                  value={lossMl}
                  onChange={(e) => setLossMl(Number(e.target.value))}
                  step={25}
                  min={10}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Justificativa / Observação:</label>
                <textarea
                  value={lossNotes}
                  onChange={(e) => setLossNotes(e.target.value)}
                  placeholder="Ex: Degustação oferecida ao cliente corporativo na mesa 04..."
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLossModal(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleRecordLoss}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg text-xs"
              >
                Salvar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
