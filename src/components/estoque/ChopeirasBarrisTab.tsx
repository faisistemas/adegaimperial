import React, { useState } from 'react';
import { 
  Beer, Droplets, AlertTriangle, Settings, RefreshCw, 
  CheckCircle2, TrendingUp, Sparkles, Sliders, ArrowDownRight
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { TorneiraChopp } from '../../types';

export const ChopeirasBarrisTab: React.FC = () => {
  const { torneirasChopp, venderChoppTorneira, ajustarFatorPerdaEspuma } = useAdega();

  const [selectedTapForConfig, setSelectedTapForConfig] = useState<TorneiraChopp | null>(null);
  const [novoFator, setNovoFator] = useState<number>(6.5);
  const [serveModal, setServeModal] = useState<{ open: boolean; tap: TorneiraChopp } | null>(null);
  const [volumeDesejadoLitros, setVolumeDesejadoLitros] = useState<number>(0.5);

  const totalLitrosDisponiveis = torneirasChopp.reduce((acc, t) => acc + t.volumeRestanteLitros, 0);
  const totalLitrosVendidos = torneirasChopp.reduce((acc, t) => acc + t.litrosVendidos, 0);
  const totalPerdaEspuma = torneirasChopp.reduce((acc, t) => acc + t.perdaEspumaAcumuladaLitros, 0);

  const handleConfigSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTapForConfig) return;
    ajustarFatorPerdaEspuma(selectedTapForConfig.id, novoFator);
    setSelectedTapForConfig(null);
  };

  const handleServe = () => {
    if (!serveModal) return;
    venderChoppTorneira(serveModal.tap.id, volumeDesejadoLitros);
    setServeModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Beer className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Volume em Barril</p>
            <p className="text-2xl font-bold text-white tracking-tight font-mono">
              {(totalLitrosDisponiveis ?? 0).toFixed(1)} <span className="text-xs font-normal text-zinc-400">Litros</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Chopp Vendido</p>
            <p className="text-2xl font-bold text-emerald-400 tracking-tight font-mono">
              {(totalLitrosVendidos ?? 0).toFixed(1)} <span className="text-xs font-normal text-zinc-400">Litros</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ArrowDownRight className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Perda por Espuma / Purga</p>
            <p className="text-2xl font-bold text-rose-400 tracking-tight font-mono">
              {(totalPerdaEspuma ?? 0).toFixed(2)} <span className="text-xs font-normal text-zinc-400">Litros</span>
            </p>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400 uppercase font-semibold">Torneiras Ativas</p>
            <p className="text-2xl font-bold text-white tracking-tight">
              {(torneirasChopp || []).length} <span className="text-xs font-normal text-zinc-400">engatadas</span>
            </p>
          </div>
        </div>
      </div>

      {/* Torneiras List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(torneirasChopp || []).map((tap) => {
          const totalBarril = tap.volumeTotalBarrilLitros || 50;
          const volRestante = tap.volumeRestanteLitros ?? 0;
          const percentRestante = Math.round((volRestante / totalBarril) * 100);
          const isLow = percentRestante <= 25;

          return (
            <div
              key={tap.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between relative overflow-hidden"
            >
              {isLow && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              )}

              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-bold">
                      {tap.status}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1.5 leading-tight">
                      {tap.identificadorTorneira}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {tap.estiloChopp}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedTapForConfig(tap);
                      setNovoFator(tap.fatorPerdaEspumaPercentual);
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                    title="Configurar Perda de Espuma"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Barril & Liquid Visualizer */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 mb-4 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-medium">Volume Restante:</span>
                    <span className="text-white font-bold font-mono">
                      {(volRestante ?? 0).toFixed(1)}L / {(totalBarril ?? 0).toFixed(1)}L ({percentRestante}%)
                    </span>
                  </div>

                  <div className="w-full h-4 bg-zinc-800 rounded-full overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentRestante <= 20
                          ? 'bg-rose-500'
                          : percentRestante <= 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentRestante}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-900 text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Compensação Espuma:</span>
                      <span className="text-amber-400 font-bold font-mono">+{tap.fatorPerdaEspumaPercentual}%</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-500 block">Preço Sugerido:</span>
                      <span className="text-zinc-200 font-bold font-mono">R$ {(tap.precoPorLitro ?? 0).toFixed(2)}/L</span>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Sangria & Perda */}
                <div className="bg-zinc-800/30 p-3 rounded-lg border border-zinc-800/50 mb-4 text-xs space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>Litros Vendidos no Turno:</span>
                    <span className="text-zinc-200 font-mono font-semibold">{(tap.litrosVendidos ?? 0).toFixed(2)} L</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Espuma/Purga Descontada:</span>
                    <span className="text-rose-400 font-mono font-semibold">-{(tap.perdaEspumaAcumuladaLitros ?? 0).toFixed(2)} L</span>
                  </div>
                </div>
              </div>

              {/* Botão de Retirada / Venda Rápida */}
              <button
                onClick={() => setServeModal({ open: true, tap })}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
              >
                <Beer className="w-4 h-4" />
                Extrair Chopp da Torneira
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal: Extrair Chopp */}
      {serveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Beer className="w-5 h-5 text-amber-500" />
              Tiragem de Chopp
            </h3>
            <p className="text-xs text-zinc-400">{serveModal.tap.identificadorTorneira}</p>

            <div className="space-y-3">
              <label className="text-xs text-zinc-300 font-semibold block">Selecione o Volume:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Caneco 300ml', vol: 0.3 },
                  { label: 'Caneco 500ml', vol: 0.5 },
                  { label: 'Jarra 1.0 Litro', vol: 1.0 },
                  { label: 'Growler 2.0 Litros', vol: 2.0 },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setVolumeDesejadoLitros(preset.vol)}
                    className={`p-2.5 rounded-lg text-xs font-semibold border text-center ${
                      volumeDesejadoLitros === preset.vol
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Cálculo do desconto com perda de espuma */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-zinc-300">
                  <span>Volume no Copo:</span>
                  <span className="font-mono font-bold">{(volumeDesejadoLitros ?? 0).toFixed(2)} L</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Perda Espuma ({serveModal?.tap?.fatorPerdaEspumaPercentual ?? 0}%):</span>
                  <span className="font-mono font-bold">+{(((volumeDesejadoLitros ?? 0) * ((serveModal?.tap?.fatorPerdaEspumaPercentual ?? 0) / 100))).toFixed(3)} L</span>
                </div>
                <div className="flex justify-between text-amber-400 font-bold border-t border-amber-500/30 pt-1">
                  <span>Baixa Total no Barril:</span>
                  <span className="font-mono">{(((volumeDesejadoLitros ?? 0) * (1 + (serveModal?.tap?.fatorPerdaEspumaPercentual ?? 0) / 100))).toFixed(3)} L</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setServeModal(null)}
                className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={handleServe}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs"
              >
                Confirmar Saída
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configurar Fator de Perda */}
      {selectedTapForConfig && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              Fator de Perda de Espuma
            </h3>
            <p className="text-xs text-zinc-400">{selectedTapForConfig.identificadorTorneira}</p>

            <form onSubmit={handleConfigSave} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-300 block mb-1">
                  Percentual de Perda na Serpentina / Tiragem (%):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={0.5}
                    min={0}
                    max={20}
                    value={novoFator}
                    onChange={(e) => setNovoFator(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                    required
                  />
                  <span className="text-zinc-400 text-sm font-bold">%</span>
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Padrão para torneiras italianas e belgas: entre 4% e 8%.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTapForConfig(null)}
                  className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs"
                >
                  Salvar Fator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
