import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, ChevronDown, ChevronRight, 
  Download, FileSpreadsheet, Percent, Store, Calendar, 
  Sparkles, CheckCircle, Info, PieChart, ShieldCheck
} from 'lucide-react';
import { INITIAL_DRE_DATA } from '../../data/backofficeModule6Data';
import { DreEstruturaLinha, DrePeriodo } from '../../types/backofficeTypes';

export const DreGerencialTab: React.FC = () => {
  const [periodo, setPeriodo] = useState<DrePeriodo>('MES');
  const [filial, setFilial] = useState<string>('CONSOLIDADO');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    'dre-1': true,
    'dre-2': true,
    'dre-4': true,
    'dre-6': true,
  });

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fator multiplicador para simular períodos
  const getFatorPeriodo = (): number => {
    switch (periodo) {
      case 'HOJE': return 1 / 30;
      case 'SEMANA': return 7 / 30;
      case 'TRIMESTRE': return 3.0;
      case 'ANO': return 12.0;
      default: return 1.0;
    }
  };

  const getFatorFilial = (): number => {
    switch (filial) {
      case 'MATRIZ': return 0.58;
      case 'MOEMA': return 0.28;
      case 'ALPHAVILLE': return 0.14;
      default: return 1.0;
    }
  };

  const fator = getFatorPeriodo() * getFatorFilial();

  const dreCalculada: DreEstruturaLinha[] = INITIAL_DRE_DATA.map((row) => ({
    ...row,
    valor: row.valor * fator,
    detalhes: row.detalhes?.map((d) => ({
      ...d,
      valor: d.valor * fator,
    })),
  }));

  const receitaBruta = dreCalculada.find((r) => r.tipo === 'RECEITA_BRUTA')?.valor || 1;
  const cmv = Math.abs(dreCalculada.find((r) => r.tipo === 'CMV')?.valor || 0);
  const despesas = Math.abs(dreCalculada.find((r) => r.tipo === 'DESPESA_OPERACIONAL')?.valor || 0);
  const lucroLiquido = dreCalculada.find((r) => r.tipo === 'EBITDA')?.valor || 0;
  const margemLiquidaPercent = ((lucroLiquido / receitaBruta) * 100).toFixed(1);
  const cmvPercent = ((cmv / receitaBruta) * 100).toFixed(1);

  const handleExportCsv = () => {
    const header = 'Codigo Contabil;Descricao;Valor (R$);% Sobre Receita\n';
    const rows = dreCalculada
      .map((r) => `${r.codigoContabil};${r.descricao};${(r.valor ?? 0).toFixed(2)};${(r.percentualSobreReceita ?? 0).toFixed(2)}%`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `DRE_Gerencial_${periodo}_${filial}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Período de Competência</label>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {(['HOJE', 'SEMANA', 'MES', 'TRIMESTRE', 'ANO'] as DrePeriodo[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodo(p)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    periodo === p 
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm' 
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {p === 'HOJE' ? 'Hoje' : p === 'SEMANA' ? 'Últimos 7d' : p === 'MES' ? 'Mês Vigente' : p === 'TRIMESTRE' ? 'Trimestre' : 'Ano 2026'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Unidade / Consolidação</label>
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
              {[
                { id: 'CONSOLIDADO', label: 'Rede Toda' },
                { id: 'MATRIZ', label: 'Matriz Jardins' },
                { id: 'MOEMA', label: 'Filial Moema' },
                { id: 'ALPHAVILLE', label: 'Franquia Alpha' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilial(f.id)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                    filial === f.id
                      ? 'bg-zinc-200 text-zinc-950 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1.5 border border-zinc-700"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Exportar DRE (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Receita Bruta Total</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-zinc-100">
            R$ {receitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% vs mês anterior</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>CMV (Custo Mercadorias)</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">
            R$ {cmv.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className="font-bold text-amber-300">{cmvPercent}%</span>
            <span>da receita bruta (Ideal &lt; 35%)</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Despesas Operacionais</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black font-mono text-zinc-200">
            R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-zinc-400">
            Folha, aluguel, luz dos freezers e sistemas
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold">
            <span>EBITDA / Lucro Líquido</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-300">
            R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-emerald-400/90 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Margem Líquida Real: {margemLiquidaPercent}%</span>
          </div>
        </div>
      </div>

      {/* Tabela Contábil DRE com Drilldown */}
      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-100 font-serif">Demonstrativo do Resultado do Exercício (DRE)</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cálculo contábil analítico com segregação de CMV por garrafas vs doses fracionadas
            </p>
          </div>
          <span className="text-[11px] bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full font-mono">
            {filial} • {periodo}
          </span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {dreCalculada.map((linha) => {
            const hasDetails = linha.detalhes && linha.detalhes.length > 0;
            const isExpanded = !!expandedRows[linha.id];
            const isPositive = linha.valor >= 0;

            return (
              <div key={linha.id} className={linha.destaque ? 'bg-zinc-950/50' : ''}>
                <div 
                  onClick={() => hasDetails && toggleRow(linha.id)}
                  className={`p-4 flex items-center justify-between transition-colors ${
                    hasDetails ? 'cursor-pointer hover:bg-zinc-800/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {hasDetails ? (
                      <button className="text-zinc-400 hover:text-zinc-200">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    ) : (
                      <div className="w-4" />
                    )}
                    <span className="font-mono text-xs text-zinc-500 font-bold w-10">
                      {linha.codigoContabil}
                    </span>
                    <span className={`text-sm ${
                      linha.isTotalizador 
                        ? 'font-black text-zinc-100 uppercase tracking-wide' 
                        : 'font-normal text-zinc-300'
                    }`}>
                      {linha.descricao}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-24 text-right hidden sm:block">
                      <span className="text-xs font-mono text-zinc-400">
                        {(linha.percentualSobreReceita ?? 0) > 0 ? `+${(linha.percentualSobreReceita ?? 0).toFixed(1)}%` : `${(linha.percentualSobreReceita ?? 0).toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="w-36 text-right font-mono font-bold text-sm">
                      <span className={
                        linha.tipo === 'EBITDA'
                          ? 'text-emerald-400 text-base font-black'
                          : isPositive
                          ? 'text-zinc-100'
                          : 'text-rose-400'
                      }>
                        R$ {linha.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Drilldown Details Sub-items */}
                {hasDetails && isExpanded && (
                  <div className="bg-zinc-950/70 py-2 px-6 sm:px-14 border-y border-zinc-800/40 space-y-1.5">
                    {linha.detalhes?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                          <span className="text-zinc-300">{item.nome}</span>
                          {item.observacao && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono">
                              {item.observacao}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="text-zinc-500 font-mono text-[11px] w-16 text-right">
                            {(item.percentual ?? 0).toFixed(1)}%
                          </span>
                          <span className="font-mono text-zinc-300 w-32 text-right">
                            R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
