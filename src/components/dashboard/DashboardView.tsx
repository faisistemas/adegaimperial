import React, { useState } from 'react';
import { 
  TrendingUp, DollarSign, Clock, Users, Award, 
  Droplets, Wine, Sparkles, BarChart3, ArrowUpRight, 
  Calendar, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

export const DashboardView: React.FC = () => {
  const { orders, activeStore, products } = useAdega();
  const [period, setPeriod] = useState<'HOJE' | 'SEMANA' | 'MES'>('MES');

  // Realistic mock data scaled according to period
  const totalRevenue = period === 'HOJE' ? 4850.00 : period === 'SEMANA' ? 32400.00 : 148520.00;
  const cpvCost = totalRevenue * 0.42; // Custo dos Produtos Vendidos
  const taxesSimples = totalRevenue * 0.04; // 4% Simples Nacional
  const operationalExpenses = period === 'HOJE' ? 450.00 : period === 'SEMANA' ? 3800.00 : 18200.00;
  const netProfit = totalRevenue - cpvCost - taxesSimples - operationalExpenses;
  const netMarginPercent = ((netProfit / totalRevenue) * 100).toFixed(1);

  const averageTicket = period === 'HOJE' ? 68.30 : 84.50;
  const totalClients = Math.round(totalRevenue / averageTicket);
  const doseExtraProfit = period === 'HOJE' ? 920.00 : period === 'SEMANA' ? 6400.00 : 28400.00;

  // Peak Hours Data (00h to 24h, typical Adega rush)
  const peakHours = [
    { hour: '14h', label: '14:00', sales: 12, revenue: 'R$ 840' },
    { hour: '16h', label: '16:00', sales: 24, revenue: 'R$ 1.950' },
    { hour: '18h', label: '18:00', sales: 48, revenue: 'R$ 3.800' },
    { hour: '20h', label: '20:00', sales: 95, revenue: 'R$ 7.900' },
    { hour: '22h', label: '22:00', sales: 145, revenue: 'R$ 13.600', isPeak: true },
    { hour: '00h', label: '00:00', sales: 168, revenue: 'R$ 16.400', isPeak: true },
    { hour: '02h', label: '02:00', sales: 110, revenue: 'R$ 9.800' },
    { hour: '04h', label: '04:00', sales: 30, revenue: 'R$ 2.400' },
  ];

  // ABC Curve Data
  const abcProducts = [
    { name: 'Whisky Black Label (Doses 50ml)', class: 'A', share: '32%', revenue: 'R$ 47.500', profit: '+R$ 31.800', isDose: true },
    { name: 'Gin Tanqueray London Dry', class: 'A', share: '24%', revenue: 'R$ 35.600', profit: '+R$ 22.100', isDose: true },
    { name: 'Cerveja Heineken Long Neck 330ml', class: 'A', share: '18%', revenue: 'R$ 26.700', profit: '+R$ 11.200', isDose: false },
    { name: 'Vodka Absolut Regular 1L', class: 'B', share: '12%', revenue: 'R$ 17.800', profit: '+R$ 9.400', isDose: true },
    { name: 'Vinho Tinto Angelica Zapata Malbec', class: 'B', share: '8%', revenue: 'R$ 11.800', profit: '+R$ 6.300', isDose: false },
    { name: 'Gelo de Coco & Petiscos (Balança)', class: 'C', share: '6%', revenue: 'R$ 8.900', profit: '+R$ 4.900', isDose: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20">
      {/* Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-serif">Rentabilidade & Doses vs Garrafas</h2>
          <p className="text-xs text-zinc-400">Análise de margem por dose, curva ABC e horários de pico</p>
        </div>

        {/* Period filter buttons */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          {(['HOJE', 'SEMANA', 'MES'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === p
                  ? 'bg-amber-500 text-zinc-950 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p === 'HOJE' ? 'Hoje' : p === 'SEMANA' ? 'Últimos 7 Dias' : 'Mês Atual'}
            </button>
          ))}
        </div>
      </div>

      {/* Main KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Faturamento Bruto</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% vs período anterior</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Lucro Líquido Real</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-400/90 font-semibold">
            Margem Líquida de {netMarginPercent}%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Ticket Médio</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            R$ {(averageTicket ?? 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400">{totalClients} atendimentos concluídos</p>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-zinc-900 border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-amber-300 text-xs">
            <span className="font-bold flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>Superlucro das Doses</span>
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            +R$ {doseExtraProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[10px] text-amber-200/80">Lucro extra gerado por dosador fracionado</p>
        </div>
      </div>

      {/* DRE Simplificado + Peak Hours Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DRE Simplificado Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">DRE Gerencial Simplificado</h3>
              <p className="text-[11px] text-zinc-400">Demonstrativo do Resultado do Exercício</p>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded font-mono">
              Saudável
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-950 font-semibold">
              <span className="text-zinc-200">(+) Faturamento Bruto de Bebidas:</span>
              <span className="font-mono text-zinc-100">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg text-rose-400">
              <span>(-) Impostos sobre Venda (Simples Nacional 4%):</span>
              <span className="font-mono">- R$ {taxesSimples.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-950/60 font-medium text-zinc-300">
              <span>(=) Receita Líquida Operacional:</span>
              <span className="font-mono">R$ {(totalRevenue - taxesSimples).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg text-rose-400">
              <span>(-) Custo dos Produtos Vendidos (CPV Distribuidoras):</span>
              <span className="font-mono">- R$ {cpvCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg bg-zinc-950 font-bold text-amber-300">
              <span>(=) Lucro Bruto Operacional (Margem 54%):</span>
              <span className="font-mono">R$ {(totalRevenue - taxesSimples - cpvCost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center p-2 rounded-lg text-rose-400">
              <span>(-) Despesas Operacionais (Aluguel, Folha, Câmaras Frias):</span>
              <span className="font-mono">- R$ {operationalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/60 font-bold text-sm text-emerald-300">
              <span>(=) Lucro Líquido Real em Caixa:</span>
              <span className="font-mono text-base font-black">
                R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Peak Hours Night Chart */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Horários de Pico (Rush Noturno)</h3>
              <p className="text-[11px] text-zinc-400">Pico de vendas concentrado entre 20:00 e 02:00</p>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold">Sexta & Sábado</span>
          </div>

          {/* Custom SVG Bar Chart */}
          <div className="space-y-2.5 pt-2">
            {peakHours.map((slot) => {
              const maxSales = 180;
              const widthPct = Math.round((slot.sales / maxSales) * 100);

              return (
                <div key={slot.hour} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-zinc-300 font-semibold">{slot.label}</span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {slot.sales} pedidos ({slot.revenue})
                    </span>
                  </div>
                  <div className="h-4 w-full bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        slot.isPeak
                          ? 'bg-gradient-to-r from-amber-500 to-rose-500 shadow-md shadow-amber-500/20'
                          : 'bg-zinc-700'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Dica do Sistema:</span>
            <span className="text-amber-400 font-semibold">Reforçar 2 operadores de caixa às 21:30</span>
          </div>
        </div>
      </div>

      {/* Curva ABC de Bebidas */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Curva ABC de Produtos & Bebidas</h3>
            <p className="text-[11px] text-zinc-400">Classificação por contribuição de margem e faturamento líquido</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono font-bold">80/20 Pareto</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 text-[11px] uppercase tracking-wider border-b border-zinc-800">
              <tr>
                <th className="p-3">Classe</th>
                <th className="p-3">Bebida / Produto</th>
                <th className="p-3">Participação Faturamento</th>
                <th className="p-3">Receita Bruta</th>
                <th className="p-3">Margem / Lucro Gerado</th>
                <th className="p-3">Estratégia Recomendada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {abcProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-zinc-800/40">
                  <td className="p-3">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                      p.class === 'A'
                        ? 'bg-amber-500 text-zinc-950'
                        : p.class === 'B'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {p.class}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-zinc-100 flex items-center gap-1.5">
                    {p.isDose && <Droplets className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{p.name}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-zinc-300">{p.share}</td>
                  <td className="p-3 font-mono text-zinc-200">{p.revenue}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{p.profit}</td>
                  <td className="p-3 text-[11px] text-zinc-400">
                    {p.class === 'A' ? 'Estoque nunca pode zerar (Prioridade Alta)' : p.class === 'B' ? 'Manter giro médio semanal' : 'Estoque mínimo de segurança'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
