import React from 'react';
import { 
  Star, X, Award, Gift, Sparkles, TrendingUp, 
  Users, ChevronRight 
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

interface FidelidadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullCrm: () => void;
}

export const FidelidadeModal: React.FC<FidelidadeModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenFullCrm
}) => {
  const { customers } = useAdega();

  if (!isOpen) return null;

  // Mock fidelity ranking based on customers
  const rankedCustomers = [...(customers || [])]
    .map((c, i) => ({
      ...c,
      pontos: 1500 - (i * 220),
      nivel: i === 0 ? 'Black Diamond' : i === 1 ? 'Ouro Imperial' : 'Prata',
      cashback: (1500 - (i * 220)) * 0.05,
    }))
    .slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100 font-serif">Programa de Fidelidade & Cashback</h3>
              <p className="text-xs text-zinc-400">Pontuação de clientes, níveis VIP e resgate de produtos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Rules Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
              <div className="text-amber-400 font-bold text-lg">R$ 1 = 1 Ponto</div>
              <div className="text-zinc-400 text-[11px]">Acúmulo automático em vendas balcão e mesas</div>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
              <div className="text-emerald-400 font-bold text-lg">5% a 10%</div>
              <div className="text-zinc-400 text-[11px]">Cashback creditado em saldo digital</div>
            </div>
            <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800 text-center space-y-1">
              <div className="text-purple-400 font-bold text-lg">Vinhos & Doses</div>
              <div className="text-zinc-400 text-[11px]">Resgates exclusivos por pontuação</div>
            </div>
          </div>

          {/* Ranking Top Clientes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Clientes Mais Fiéis (Ranking)
              </span>
              <span className="text-[11px] text-zinc-500">Saldo Atualizado</span>
            </div>

            <div className="space-y-2">
              {rankedCustomers.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-500 bg-zinc-950/40 rounded-xl border border-zinc-800/60">
                  Nenhum cliente cadastrado no momento.
                </div>
              ) : (
                rankedCustomers.map((cust, idx) => (
                  <div
                    key={cust.id}
                    className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-700 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-500 text-zinc-950' : idx === 1 ? 'bg-zinc-300 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-zinc-100">{cust.name}</div>
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 mt-0.5">
                          <span className="text-amber-400 font-medium">{cust.nivel}</span>
                          <span>•</span>
                          <span>Cashback: R$ {cust.cashback.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-amber-400 font-mono text-sm">
                        {cust.pontos} pts
                      </div>
                      <div className="text-[10px] text-zinc-500">Acumulados</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Banner Resgates Rápidos */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/20 to-purple-950/20 border border-amber-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm">Catálogo de Resgates de Prêmios</div>
                <div className="text-[11px] text-zinc-400">Garrafas de vinho, combos e kits para resgate imediato</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullCrm();
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1 shrink-0"
            >
              <span>Ver CRM</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/40 flex justify-between items-center text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullCrm();
            }}
            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Gerenciar Clientes & Fidelidade no CRM Completo</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-medium transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
