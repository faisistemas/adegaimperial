import React, { useState } from 'react';
import { 
  Building2, TrendingUp, DollarSign, ShoppingCart, 
  BarChart3, Landmark, Percent, Award, ShieldCheck, 
  Sparkles, Layers
} from 'lucide-react';
import { DreGerencialTab } from './DreGerencialTab';
import { CurvaAbcTab } from './CurvaAbcTab';
import { FluxoCaixaOfxTab } from './FluxoCaixaOfxTab';
import { ContasPagarReceberTab } from './ContasPagarReceberTab';
import { SugestaoComprasIaTab } from './SugestaoComprasIaTab';
import { PrecificacaoFranquiasTab } from './PrecificacaoFranquiasTab';
import { BackupSegurancaTab } from './BackupSegurancaTab';

export type BackofficeTab = 'DRE' | 'CURVA_ABC' | 'FLUXO_OFX' | 'CONTAS' | 'COMPRAS_IA' | 'ESTRATEGIA' | 'BACKUP';

export const BackofficeView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BackofficeTab>('DRE');

  const tabs = [
    { id: 'DRE', label: 'DRE Gerencial', icon: TrendingUp, badge: 'CMV Analítico' },
    { id: 'CURVA_ABC', label: 'Curva ABC de Bebidas', icon: BarChart3, badge: 'Cauda Longa' },
    { id: 'FLUXO_OFX', label: 'Fluxo & OFX Bancário', icon: Landmark, badge: 'D+7 Projetado' },
    { id: 'CONTAS', label: 'Contas Pagar & Receber', icon: DollarSign, badge: 'MDR Adquirentes' },
    { id: 'COMPRAS_IA', label: 'Sugestão de Compras', icon: ShoppingCart, badge: 'ROP / IA' },
    { id: 'ESTRATEGIA', label: 'Markup & Franquias', icon: Building2, badge: 'Royalties' },
    { id: 'BACKUP', label: 'Backup & Nuvem', icon: ShieldCheck, badge: 'Agendado' },
  ] as const;

  return (
    <div className="flex-1 overflow-y-auto w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-24 lg:pb-6">

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as BackofficeTab)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-950/30'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-normal ${
                  isActive ? 'bg-zinc-950 text-amber-300 font-bold' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Dynamic Tab Body */}
      <div>
        {activeTab === 'DRE' && <DreGerencialTab />}
        {activeTab === 'CURVA_ABC' && <CurvaAbcTab />}
        {activeTab === 'FLUXO_OFX' && <FluxoCaixaOfxTab />}
        {activeTab === 'CONTAS' && <ContasPagarReceberTab />}
        {activeTab === 'COMPRAS_IA' && <SugestaoComprasIaTab />}
        {activeTab === 'ESTRATEGIA' && <PrecificacaoFranquiasTab />}
        {activeTab === 'BACKUP' && <BackupSegurancaTab />}
      </div>
    </div>
  );
};
