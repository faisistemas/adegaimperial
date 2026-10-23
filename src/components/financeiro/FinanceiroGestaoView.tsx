import React, { useState } from 'react';
import { 
  DollarSign, BarChart3, FileText, ShieldAlert, 
  Settings, Wallet, ArrowDownLeft, ArrowUpRight,
  TrendingUp, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { ControleCaixaContasTab } from './ControleCaixaContasTab';
import { DashboardOperacionalTab } from './DashboardOperacionalTab';
import { RelatoriosGerenciaisTab } from './RelatoriosGerenciaisTab';
import { AuditoriaOperacoesTab } from './AuditoriaOperacoesTab';
import { ConfiguracoesAppTab } from './ConfiguracoesAppTab';

export type FinanceiroTab = 
  | 'CAIXA_CONTAS'
  | 'DASHBOARD'
  | 'RELATORIOS'
  | 'AUDITORIA'
  | 'CONFIGURACOES';

interface FinanceiroGestaoViewProps {
  initialTab?: FinanceiroTab;
}

export const FinanceiroGestaoView: React.FC<FinanceiroGestaoViewProps> = ({ initialTab = 'CAIXA_CONTAS' }) => {
  const [activeTab, setActiveTab] = useState<FinanceiroTab>(initialTab);

  const tabs = [
    {
      id: 'CAIXA_CONTAS' as FinanceiroTab,
      label: 'Controle de Caixa & Contas',
      subtitle: 'Caixa, Contas a Pagar e Receber',
      icon: Wallet,
    },
    {
      id: 'DASHBOARD' as FinanceiroTab,
      label: 'Dashboard Operacional',
      subtitle: 'Métricas em tempo real & Salão',
      icon: BarChart3,
    },
    {
      id: 'RELATORIOS' as FinanceiroTab,
      label: 'Relatórios Gerenciais',
      subtitle: 'DRE, Curva ABC e Metas',
      icon: FileText,
    },
    {
      id: 'AUDITORIA' as FinanceiroTab,
      label: 'Auditoria de Operações',
      subtitle: 'Trilha de segurança e eventos',
      icon: ShieldAlert,
    },
    {
      id: 'CONFIGURACOES' as FinanceiroTab,
      label: 'Configurações da Aplicação',
      subtitle: 'Parâmetros, taxas e alçadas',
      icon: Settings,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20">
      {/* Top Header do Módulo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-3.5 sm:p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 shrink-0">
            <DollarSign className="w-5 sm:w-6 h-5 sm:h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Financeiro e Gestão Integrada
            </h1>
            <p className="text-xs text-zinc-400">
              Controle de caixa, contas a pagar e receber, dashboard operacional, relatórios e auditoria.
            </p>
          </div>
        </div>

        {/* Abas Superiores Estilizadas */}
        <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 p-1.5 rounded-2xl overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/25'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderização da Aba Ativa */}
      {activeTab === 'CAIXA_CONTAS' && <ControleCaixaContasTab />}
      {activeTab === 'DASHBOARD' && <DashboardOperacionalTab onNavigateToTab={(t) => setActiveTab(t as any)} />}
      {activeTab === 'RELATORIOS' && <RelatoriosGerenciaisTab />}
      {activeTab === 'AUDITORIA' && <AuditoriaOperacoesTab />}
      {activeTab === 'CONFIGURACOES' && <ConfiguracoesAppTab />}
    </div>
  );
};
