import React, { useState } from 'react';
import { 
  ShoppingCart, Receipt, Users, Calendar, Sparkles
} from 'lucide-react';
import { PdvView } from '../pdv/PdvView';
import { ConsultaVendasDevolucoesTab } from './ConsultaVendasDevolucoesTab';
import { CadastroGestaoClientesTab } from './CadastroGestaoClientesTab';
import { ReservasNotificacoesTab } from './ReservasNotificacoesTab';
import { useAdega } from '../../context/AdegaContext';

export type VendasClientesSubTab = 'pdv' | 'consulta_devolucoes' | 'clientes' | 'reservas';

interface VendasEClientesViewProps {
  initialSubTab?: VendasClientesSubTab;
}

export const VendasEClientesView: React.FC<VendasEClientesViewProps> = ({ 
  initialSubTab = 'pdv' 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<VendasClientesSubTab>(initialSubTab);
  const { orders, devolucoesVendas, customers, reservas } = useAdega();

  const reservasAtivasCount = reservas.filter(r => r.status === 'CONFIRMADA' || r.status === 'PENDENTE').length;

  return (
    <div id="vendas-e-clientes-hub" className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Barra de Navegação Superior do Módulo Vendas e Clientes */}
      <div className="bg-zinc-900 border-b border-zinc-800/90 px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between flex-shrink-0 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Abas das 4 Funcionalidades Requisitadas */}
          <nav className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-xl border border-zinc-800 shrink-0">
            {/* 1. Ponto de venda (PDV) */}
            <button
              id="subtab-pdv"
              onClick={() => setActiveSubTab('pdv')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'pdv'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>PDV</span>
            </button>

            {/* 2. Consulta de vendas e devoluções */}
            <button
              id="subtab-consulta-devolucoes"
              onClick={() => setActiveSubTab('consulta_devolucoes')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'consulta_devolucoes'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Consulta de Vendas e Devoluções</span>
              <span className="md:hidden">Vendas & Histórico</span>
              {devolucoesVendas.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  {devolucoesVendas.length}
                </span>
              )}
            </button>

            {/* 3. Cadastro e gestão de clientes */}
            <button
              id="subtab-clientes"
              onClick={() => setActiveSubTab('clientes')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'clientes'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cadastro e Gestão de Clientes</span>
              <span className="md:hidden">Clientes</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {customers.length}
              </span>
            </button>

            {/* 4. Reservas e notificações relacionadas */}
            <button
              id="subtab-reservas"
              onClick={() => setActiveSubTab('reservas')}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubTab === 'reservas'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reservas e Notificações</span>
              <span className="md:hidden">Reservas</span>
              {reservasAtivasCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {reservasAtivasCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Renderização do conteúdo ativo do Módulo */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        {activeSubTab === 'pdv' && <PdvView />}
        {activeSubTab === 'consulta_devolucoes' && <ConsultaVendasDevolucoesTab />}
        {activeSubTab === 'clientes' && <CadastroGestaoClientesTab />}
        {activeSubTab === 'reservas' && <ReservasNotificacoesTab />}
      </div>
    </div>
  );
};
