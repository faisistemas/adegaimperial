import React from 'react';
import { 
  TrendingUp, Users, DollarSign, Clock, AlertTriangle, 
  ShoppingBag, Bike, UtensilsCrossed, Wine, ChevronRight,
  Flame, CheckCircle2, PackageX, BellRing, ArrowUpRight,
  RefreshCw, BarChart3, Activity
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

interface DashboardOperacionalProps {
  onNavigateToTab?: (tab: string) => void;
}

export const DashboardOperacionalTab: React.FC<DashboardOperacionalProps> = ({ onNavigateToTab }) => {
  const { 
    orders, 
    comandas, 
    tables, 
    deliveryPedidos, 
    products, 
    torneirasChopp,
    cashSession,
    contasPagar,
    activeStore
  } = useAdega();

  // Métricas do Dia
  const totalVendasDia = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const metaDiaria = 5000.00;
  const percentualMeta = Math.min(100, Math.round((totalVendasDia / metaDiaria) * 100));

  // Mesas e Salão
  const mesasOcupadas = tables.filter((t) => t.status === 'OCCUPIED').length;
  const totalMesas = tables.length || 1;
  const taxaOcupacao = Math.round((mesasOcupadas / totalMesas) * 100);

  // Comandas Ativas
  const comandasAbertas = comandas.filter((c) => c.status === 'OPEN');
  const valorTotalComandas = comandasAbertas.reduce((acc, c) => acc + c.totalAmount, 0);
  const ticketMedioComandas = comandasAbertas.length > 0 ? valorTotalComandas / comandasAbertas.length : 0;

  // Delivery
  const deliveryEmAndamento = deliveryPedidos.filter(
    (d) => d.status === 'CONFIRMADO' || d.status === 'EM_PREPARO' || d.status === 'DESPACHADO'
  ).length;

  // Produtos Zerados e em Alerta
  const produtosZerados = products.filter((p) => p.stock <= 0);
  const produtosCriticos = products.filter((p) => p.stock > 0 && p.stock <= (p.minStock || 5));

  // Contas vencendo hoje ou atrasadas
  const contasUrgentes = contasPagar.filter((c) => c.status === 'ATRASADO' || c.status === 'PENDENTE');

  // Chopps abaixo de 20%
  const choppsBaixos = torneirasChopp.filter((t) => (t.volumeRestanteLitros / t.capacidadeTotalLitros) <= 0.2);

  // Curva de vendas por faixa de horário (12h às 23h)
  const faixasHorarias = [
    { hora: '12h-14h', valor: 680, tickets: 8 },
    { hora: '14h-16h', valor: 340, tickets: 4 },
    { hora: '16h-18h', valor: 920, tickets: 11 },
    { hora: '18h-20h', valor: 2150, tickets: 26 },
    { hora: '20h-22h', valor: 2840, tickets: 34 },
    { hora: '22h-00h', valor: 1420, tickets: 18 },
  ];

  const maxFaixa = Math.max(...faixasHorarias.map((f) => f.valor), 1);

  return (
    <div className="space-y-6">
      {/* Top Banner Operacional */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Painel Operacional em Tempo Real
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
              {activeStore.name}
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Monitoramento de giro de salão, comandas ativas, expedição de delivery e alertas de estoque.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-xl text-right font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block">Faturamento do Dia</span>
            <span className="text-base font-black text-amber-400">
              R$ {totalVendasDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 px-3.5 py-2 rounded-xl text-right font-mono">
            <span className="text-[10px] text-zinc-500 uppercase block">Meta Diária ({percentualMeta}%)</span>
            <span className="text-base font-bold text-emerald-400">
              R$ {metaDiaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Operacionais Centrais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card Salão e Mesas */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Ocupação de Salão</span>
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-zinc-100">{taxaOcupacao}%</span>
            <span className="text-xs font-mono text-zinc-400">{mesasOcupadas} de {totalMesas} mesas</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${taxaOcupacao}%` }}
            />
          </div>
        </div>

        {/* Card Comandas Ativas */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Comandas em Aberto</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-cyan-400">{comandasAbertas.length}</span>
            <span className="text-xs font-mono text-zinc-400">
              R$ {valorTotalComandas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Ticket médio: <strong className="text-zinc-300">R$ {ticketMedioComandas.toFixed(2)}</strong>
          </p>
        </div>

        {/* Card Delivery */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Delivery em Rota</span>
            <Bike className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-emerald-400">{deliveryEmAndamento}</span>
            <span className="text-xs font-mono text-zinc-400">{deliveryPedidos.length} total hoje</span>
          </div>
          <p className="text-[11px] text-zinc-500">Tempo médio de entrega: 34 min</p>
        </div>

        {/* Card Produtos sem Estoque */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Ruptura de Estoque</span>
            <PackageX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono text-rose-400">{produtosZerados.length}</span>
            <span className="text-xs font-mono text-amber-400">{produtosCriticos.length} em nível crítico</span>
          </div>
          <p className="text-[11px] text-zinc-500">Exigem reposição imediata na adega</p>
        </div>
      </div>

      {/* Gráfico de Vendas por Hora & Alertas da Operação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curva de Fluxo de Vendas */}
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">Fluxo de Vendas por Faixa de Horário</h3>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Pico às 20h-22h</span>
          </div>

          <div className="grid grid-cols-6 gap-3 items-end h-48 pt-4">
            {faixasHorarias.map((faixa, idx) => {
              const alturaPct = Math.round((faixa.valor / maxFaixa) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono font-bold text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    R$ {faixa.valor}
                  </span>
                  <div className="w-full bg-zinc-800/80 rounded-xl overflow-hidden flex flex-col justify-end p-1 h-36">
                    <div 
                      className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-lg transition-all duration-500 group-hover:brightness-110"
                      style={{ height: `${alturaPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 text-center">{faixa.hora}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alertas Imediatos de Intervenção */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-zinc-100">Alertas de Intervenção</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800 font-mono">
              Prioridade
            </span>
          </div>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 text-xs">
            {produtosZerados.slice(0, 3).map((prod) => (
              <div key={prod.id} className="bg-rose-950/30 border border-rose-900/50 p-2.5 rounded-xl flex items-start gap-2.5">
                <PackageX className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-200 block">{prod.name}</span>
                  <span className="text-[10px] text-rose-300/80">Estoque Esgotado no Salão</span>
                </div>
              </div>
            ))}

            {choppsBaixos.map((chopp) => (
              <div key={chopp.id} className="bg-amber-950/30 border border-amber-900/50 p-2.5 rounded-xl flex items-start gap-2.5">
                <Wine className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-200 block">Torneira #{chopp.numeroTorneira}: {chopp.estiloChopp}</span>
                  <span className="text-[10px] text-amber-300/80">Restam apenas {chopp.volumeRestanteLitros}L ({Math.round((chopp.volumeRestanteLitros / chopp.capacidadeTotalLitros) * 100)}%)</span>
                </div>
              </div>
            ))}

            {contasUrgentes.slice(0, 2).map((conta) => (
              <div key={conta.id} className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-xl flex items-start gap-2.5">
                <DollarSign className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-zinc-200 block">Conta a Pagar: {conta.fornecedorNome}</span>
                  <span className="text-[10px] text-zinc-400">Vencimento em {conta.dataVencimento} • R$ {conta.valorNominal.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
