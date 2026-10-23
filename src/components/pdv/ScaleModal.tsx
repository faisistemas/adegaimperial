import React from 'react';
import { Scale, X, Check, RefreshCw, Cpu, Usb, Zap } from 'lucide-react';
import { Product } from '../../types';
import { useSerialScale } from '../../hooks/useSerialScale';
import { useAdega } from '../../context/AdegaContext';
import { playSuccessBeep } from '../../utils/peripheralUtils';

interface ScaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onConfirmWeight: (product: Product, weightKg: number) => void;
}

export const ScaleModal: React.FC<ScaleModalProps> = ({ isOpen, onClose, product, onConfirmWeight }) => {
  const { peripheralSettings } = useAdega();
  const scaleHook = useSerialScale();

  if (!isOpen || !product) return null;

  const pricePerKg = product.pricePerKg || product.price;
  const effectiveWeight = scaleHook.netWeight > 0 ? scaleHook.netWeight : scaleHook.currentWeight;
  const totalPrice = effectiveWeight * pricePerKg;

  const handleConfirm = () => {
    if (effectiveWeight <= 0) return;
    playSuccessBeep();
    onConfirmWeight(product, effectiveWeight);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-zinc-100 font-serif">Balança Checkout Integrada</h3>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {peripheralSettings?.scale?.protocol || 'TOLEDO_PRIX3'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                <Usb className="w-3 h-3 text-zinc-500" />
                <span>Porta: <strong className="text-zinc-300">{peripheralSettings?.scale?.port || 'COM1'}</strong> (9600 bps, 8N1)</span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          {/* Selected Product Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
            <div className="flex items-center gap-3">
              <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover ring-1 ring-zinc-800" />
              <div>
                <h4 className="font-bold text-sm text-zinc-100">{product.name}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Preço por Kg: <strong className="text-amber-400 font-mono">R$ {pricePerKg.toFixed(2)}</strong>
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-1 rounded font-semibold uppercase">
              Item Pesável
            </span>
          </div>

          {/* Digital VFD Display */}
          <div className="bg-emerald-950/70 border-2 border-emerald-600/60 rounded-xl p-4 text-center relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono mb-1">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${scaleHook.isStable ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {scaleHook.isStable ? 'PESO ESTÁVEL (STX/ETX OK)' : 'AGUARDANDO ESTABILIZAÇÃO...'}
              </span>
              <span>
                {scaleHook.tareWeight > 0 ? `TARA: ${scaleHook.tareWeight.toFixed(3)} kg` : 'BRUTO: LÍQUIDO'}
              </span>
            </div>

            <div className="font-mono font-black text-5xl sm:text-6xl text-emerald-300 tracking-wider my-2 drop-shadow-sm">
              {effectiveWeight.toFixed(3)} <span className="text-2xl font-semibold text-emerald-400">kg</span>
            </div>

            <div className="flex items-center justify-between text-xs text-emerald-300 font-mono pt-2 border-t border-emerald-800/60">
              <span>Fórmula: {effectiveWeight.toFixed(3)} kg × R$ {pricePerKg.toFixed(2)}</span>
              <span className="text-sm font-bold text-emerald-200">
                Total: R$ {totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Diagnostic Raw Frame Display */}
          <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5 truncate">
              <Cpu className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-zinc-500">Frame Serial:</span>
              <span className="text-amber-300 truncate">{scaleHook.rawHex}</span>
            </div>
            <span className="text-[10px] text-zinc-400 shrink-0 ml-2">RS-232 / USB</span>
          </div>

          {/* Quick Simulation & Tare Controls */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-300">Simulação / Pesos Padrão:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={scaleHook.applyTare}
                  className="px-2 py-0.5 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono border border-zinc-700"
                >
                  Tara
                </button>
                <button
                  type="button"
                  onClick={scaleHook.resetZero}
                  className="px-2 py-0.5 text-[11px] rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono border border-zinc-700"
                >
                  Zerar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[0.25, 0.5, 1.0, 2.5, 5.0].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => scaleHook.simulateWeightChange(w)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                    Math.abs(effectiveWeight - w) < 0.01
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                  }`}
                >
                  {w.toFixed(2)} kg
                </button>
              ))}
            </div>
          </div>

          {/* Web Serial Direct Connect Option */}
          {scaleHook.isWebSerialSupported && (
            <div className="pt-1 flex items-center justify-between text-xs text-zinc-400">
              <button
                type="button"
                onClick={scaleHook.connectRealPort}
                className="text-[11px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Conectar Balança Física Real (Web Serial API)</span>
              </button>
              <span className="text-[10px] text-zinc-400">Status: {scaleHook.statusMessage}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              id="btn-confirm-scale-weight"
              disabled={effectiveWeight <= 0}
              onClick={handleConfirm}
              className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Confirmar Peso & Adicionar (R$ {totalPrice.toFixed(2)})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
