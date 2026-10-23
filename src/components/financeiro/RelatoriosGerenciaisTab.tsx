import React, { useState, useMemo } from 'react';
import { 
  FileText, TrendingUp, BarChart2, PieChart, Users, 
  Download, Printer, Calendar, DollarSign, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, ChevronRight, Layers,
  ShoppingBag, Search, Filter, CreditCard
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

export const RelatoriosGerenciaisTab: React.FC = () => {
  const { 
    orders, 
    products, 
    contasPagar, 
    curvaAbcItens, 
    metasColaboradores 
  } = useAdega();

  const [periodo, setPeriodo] = useState<'HOJE' | 'SEMANA' | 'MES' | 'ANO'>('MES');
  const [tipoRelatorio, setTipoRelatorio] = useState<'VENDAS_PERIODO' | 'DRE' | 'CURVA_ABC' | 'COLABORADORES'>('VENDAS_PERIODO');

  // Filtros de Data para Relatório de Vendas por Período
  const [dataInicio, setDataInicio] = useState<string>('2026-09-01');
  const [dataFim, setDataFim] = useState<string>('2026-09-30');
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState<string>('TODAS');

  // Cálculo da DRE Consolidada
  const receitaBruta = 84520.00;
  const deducoesImpostos = receitaBruta * 0.065; // ~6.5% Simples Nacional
  const receitaLiquida = receitaBruta - deducoesImpostos;
  const cmv = receitaBruta * 0.48; // 48% CMV médio de adega
  const lucroBruto = receitaLiquida - cmv;
  const despesasOperacionais = contasPagar
    .filter((c) => c.status === 'PAGO' || c.status === 'PENDENTE')
    .reduce((acc, c) => acc + c.valorNominal, 0) || 16400.00;
  const lucroLiquido = lucroBruto - despesasOperacionais;
  const margemLiquidaPct = ((lucroLiquido / receitaBruta) * 100).toFixed(1);

  // Filtragem de vendas por período e forma de pagamento
  const vendasFiltradas = useMemo(() => {
    return (orders || []).filter((ord) => {
      // Data do pedido (createdAt costuma estar em "YYYY-MM-DD" ou formato parseável)
      const dataStr = ord.createdAt?.split(' ')[0] || '';
      if (dataInicio && dataStr && dataStr < dataInicio) return false;
      if (dataFim && dataStr && dataStr > dataFim) return false;
      if (formaPagamentoFiltro !== 'TODAS' && ord.paymentMethod !== formaPagamentoFiltro) return false;
      return true;
    });
  }, [orders, dataInicio, dataFim, formaPagamentoFiltro]);

  // Contadores e Totais do Relatório de Vendas
  const totalVendasContador = vendasFiltradas.length;
  const totalGeralFaturado = vendasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);
  const totalItensVendidos = vendasFiltradas.reduce((acc, v) => {
    return acc + (v.items?.reduce((iAcc, item) => iAcc + (item.quantity || 1), 0) || 0);
  }, 0);

  const handleExportarRelatorio = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Header com Seletor de Relatório e Exportação */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 p-3 sm:p-4 rounded-2xl shadow-lg">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setTipoRelatorio('VENDAS_PERIODO')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
              tipoRelatorio === 'VENDAS_PERIODO'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Vendas por Período</span>
          </button>

          <button
            onClick={() => setTipoRelatorio('DRE')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
              tipoRelatorio === 'DRE'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>DRE Gerencial</span>
          </button>

          <button
            onClick={() => setTipoRelatorio('CURVA_ABC')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
              tipoRelatorio === 'CURVA_ABC'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Curva ABC</span>
          </button>

          <button
            onClick={() => setTipoRelatorio('COLABORADORES')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 ${
              tipoRelatorio === 'COLABORADORES'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Produtividade</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 justify-end shrink-0">
          <button
            onClick={handleExportarRelatorio}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4 text-zinc-400" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 0. RELATÓRIO DE VENDAS POR PERÍODO (SOLICITADO)           */}
      {/* ======================================================== */}
      {tipoRelatorio === 'VENDAS_PERIODO' && (
        <div className="space-y-4">
          {/* Barra de Filtros de Período (Data Início / Data Fim / Pagamento) */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Filtro de Vendas por Período</span>
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Consulte vendas detalhadas com quantidade, preço unitário e valor total
                </p>
              </div>

              {/* Botões Rápidos de Período */}
              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 text-xs overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    const hoje = new Date().toISOString().split('T')[0];
                    setDataInicio(hoje);
                    setDataFim(hoje);
                  }}
                  className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fim = new Date().toISOString().split('T')[0];
                    const d = new Date();
                    d.setDate(d.getDate() - 7);
                    const ini = d.toISOString().split('T')[0];
                    setDataInicio(ini);
                    setDataFim(fim);
                  }}
                  className="px-2.5 py-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  Últimos 7 dias
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const agora = new Date();
                    const ini = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString().split('T')[0];
                    const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).toISOString().split('T')[0];
                    setDataInicio(ini);
                    setDataFim(fim);
                  }}
                  className="px-2.5 py-1 rounded-lg text-amber-400 font-semibold bg-zinc-800 transition-colors"
                >
                  Mês Atual
                </button>
              </div>
            </div>

            {/* Inputs de Data Início / Data Fim / Forma de Pagamento */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-800/80">
              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Data Início</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Data Fim</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 font-medium block mb-1">Forma de Pagamento</label>
                <select
                  value={formaPagamentoFiltro}
                  onChange={(e) => setFormaPagamentoFiltro(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODAS">Todas as formas de pagamento</option>
                  <option value="PIX">Pix</option>
                  <option value="CREDIT_CARD">Cartão de Crédito</option>
                  <option value="DEBIT_CARD">Cartão de Débito</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="VOUCHER">Voucher / Vale</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Métricas Resumo do Período */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Total de Vendas (Contador)</span>
              <span className="text-2xl font-bold font-mono text-zinc-100 block mt-1">
                {totalVendasContador}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">pedidos realizados no período</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Itens Comercializados</span>
              <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">
                {totalItensVendidos} un
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">garrafas, doses e produtos</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">Total Geral Faturado</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                R$ {totalGeralFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-500 block mt-0.5">receita líquida confirmada</span>
            </div>
          </div>

          {/* Tabela de Vendas com Quantidade, Preço Unitário e Valor Total */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Extrato de Vendas ({dataInicio} até {dataFim})
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">Exibição analítica de itens, preços unitários e totais</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                {vendasFiltradas.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300 border-collapse min-w-[700px]">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Pedido</th>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Cliente / Canal</th>
                    <th className="py-3 px-4">Itens (Qtd x Preço Unitário = Valor Total)</th>
                    <th className="py-3 px-4">Forma Pagto</th>
                    <th className="py-3 px-4 text-right">Total da Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {vendasFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-zinc-500 italic">
                        Nenhuma venda encontrada para o período selecionado ({dataInicio} a {dataFim}).
                      </td>
                    </tr>
                  ) : (
                    vendasFiltradas.map((ord) => (
                      <tr key={ord.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {ord.code}
                        </td>
                        <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap text-[11px]">
                          {ord.createdAt}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-zinc-200">
                            {ord.customerName || 'Consumidor Final'}
                          </div>
                          <div className="text-[10px] text-zinc-500 uppercase">{ord.channel || 'PDV'}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-md">
                            {(ord.items || []).map((it, idx) => {
                              const unitP = it.unitPrice || (it.product?.price ?? 0);
                              const totalP = it.totalPrice || (unitP * (it.quantity || 1));
                              return (
                                <div key={idx} className="flex items-center justify-between text-[11px] gap-2 bg-zinc-950/60 px-2 py-1 rounded border border-zinc-800/60">
                                  <span className="text-zinc-200 font-medium truncate">
                                    <span className="text-amber-400 font-mono font-bold mr-1">{it.quantity}x</span>
                                    {it.product?.name || 'Item'}
                                  </span>
                                  <span className="font-mono text-zinc-400 whitespace-nowrap">
                                    R$ {unitP.toFixed(2)} = <strong className="text-zinc-200">R$ {totalP.toFixed(2)}</strong>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {ord.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap">
                          R$ {(ord.total || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Rodapé com Contador de Vendas e Total Geral */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-zinc-400">
                <span>
                  Contador: <strong className="text-zinc-100 font-mono">{totalVendasContador}</strong> vendas filtradas
                </span>
                <span>•</span>
                <span>
                  Volume: <strong className="text-amber-300 font-mono">{totalItensVendidos}</strong> itens
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[11px]">Total Geral do Período:</span>
                <span className="text-lg font-black font-mono text-emerald-400 bg-emerald-950/40 px-3.5 py-1 rounded-xl border border-emerald-800/80">
                  R$ {totalGeralFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. DRE GERENCIAL CONSOLIDADA                             */}
      {/* ======================================================== */}
      {tipoRelatorio === 'DRE' && (
        <div className="space-y-6">
          {/* Resumo dos Indicadores de Lucratividade */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Receita Bruta Total</span>
              <span className="text-2xl font-black font-mono text-zinc-100 block mt-1">
                R$ {receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <ArrowUpRight className="w-3 h-3" /> +14.2% vs mês anterior
              </span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-amber-400 block">CMV (Custo Mercadorias)</span>
              <span className="text-2xl font-black font-mono text-amber-400 block mt-1">
                R$ {cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">48% de absorção de custo</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-rose-400 block">Despesas Operacionais</span>
              <span className="text-2xl font-black font-mono text-rose-400 block mt-1">
                R$ {despesasOperacionais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Aluguel, energia e equipe</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block">Lucro Líquido Real</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block mt-1">
                R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Margem líquida de {margemLiquidaPct}%</span>
            </div>
          </div>

          {/* Estrutura DRE Passo a Passo */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3">
              Demonstrativo de Resultado do Exercício (DRE) - Regime de Competência
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800">
                <span className="font-bold text-zinc-200">(+) RECEITA OPERACIONAL BRUTA</span>
                <span className="font-bold text-zinc-100">R$ {receitaBruta.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-zinc-950/60 rounded-xl text-rose-400/90 pl-6">
                <span>(-) Impostos e Deduções sobre Vendas (Simples Nacional 6.5%)</span>
                <span>- R$ {deducoesImpostos.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80">
                <span className="font-bold text-zinc-200">(=) RECEITA OPERACIONAL LÍQUIDA</span>
                <span className="font-bold text-zinc-200">R$ {receitaLiquida.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-zinc-950/60 rounded-xl text-amber-400/90 pl-6">
                <span>(-) Custo das Mercadorias Vendidas (CMV)</span>
                <span>- R$ {cmv.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-300">
                <span className="font-bold">(=) LUCRO BRUTO OPERACIONAL (Margem de Contribuição)</span>
                <span className="font-bold">R$ {lucroBruto.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-2.5 bg-zinc-950/60 rounded-xl text-rose-400/90 pl-6">
                <span>(-) Despesas Administrativas e Operacionais</span>
                <span>- R$ {despesasOperacionais.toFixed(2)}</span>
              </div>

              <div className="flex justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-emerald-300 text-sm">
                <span className="font-black">(=) RESULTADO LÍQUIDO DO PERÍODO</span>
                <span className="font-black">R$ {lucroLiquido.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. CURVA ABC (PARETO)                                     */}
      {/* ======================================================== */}
      {tipoRelatorio === 'CURVA_ABC' && (
        <div className="space-y-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Classificação Curva ABC de Produtos (Pareto 80/20)</h3>
              <p className="text-xs text-zinc-400">Identificação dos itens que concentram a maior parte do faturamento e margem</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Classe A: 80%</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">Classe B: 15%</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">Classe C: 5%</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Ranking</th>
                  <th className="py-2.5 px-3">Produto</th>
                  <th className="py-2.5 px-3">Classe</th>
                  <th className="py-2.5 px-3">Qtd Vendida</th>
                  <th className="py-2.5 px-3">Receita Total</th>
                  <th className="py-2.5 px-3">% Acumulado</th>
                  <th className="py-2.5 px-3">Margem Bruta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono">
                {curvaAbcItens.map((item, index) => (
                  <tr key={item.produtoId} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-3 text-zinc-500 font-bold">#{index + 1}</td>
                    <td className="py-3 px-3 font-sans font-bold text-zinc-200">{item.nomeProduto}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.classeAbc === 'A'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : item.classeAbc === 'B'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        Classe {item.classeAbc}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-300">{item.quantidadeVendida} un</td>
                    <td className="py-3 px-3 font-bold text-zinc-100">
                      R$ {item.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-amber-400">{item.percentualAcumulado}%</td>
                    <td className="py-3 px-3 text-emerald-400">{item.margemLucroPercentual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DESEMPENHO E METAS DE COLABORADORES                    */}
      {/* ======================================================== */}
      {tipoRelatorio === 'COLABORADORES' && (
        <div className="space-y-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-100">Produtividade, Vendas e Atingimento de Metas</h3>
              <p className="text-xs text-zinc-400">Desempenho por operador, garçom e sommelier da adega</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metasColaboradores.map((colab) => (
              <div key={colab.colaboradorId} className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-200">{colab.colaboradorNome}</h4>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">{colab.cargo}</span>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    colab.percentualAtingido >= 100 
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}>
                    {colab.percentualAtingido}%
                  </span>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-zinc-400">
                    <span>Vendas Realizadas:</span>
                    <span className="font-bold text-zinc-100">R$ {colab.vendasRealizadas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Meta do Mês:</span>
                    <span>R$ {colab.metaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 border-t border-zinc-800/80 pt-1">
                    <span>Comissão Gerada:</span>
                    <span className="text-emerald-400 font-bold">R$ {colab.comissaoGerada.toFixed(2)}</span>
                  </div>
                </div>

                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${colab.percentualAtingido >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, colab.percentualAtingido)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
