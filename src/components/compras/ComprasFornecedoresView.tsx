import React, { useState } from 'react';
import { 
  Building2, ShoppingBag, PackageCheck, 
  Layers, ChevronRight, ShieldCheck, Warehouse
} from 'lucide-react';
import { CadastroFornecedoresTab } from './CadastroFornecedoresTab';
import { PedidosCompraTab } from './PedidosCompraTab';
import { RecebimentoMercadoriasTab } from './RecebimentoMercadoriasTab';
import { useAdega } from '../../context/AdegaContext';

export type ComprasTab = 'fornecedores' | 'pedidos' | 'recebimento';

interface ComprasFornecedoresViewProps {
  initialSubTab?: ComprasTab;
}

export const ComprasFornecedoresView: React.FC<ComprasFornecedoresViewProps> = ({
  initialSubTab = 'fornecedores',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<ComprasTab>(initialSubTab);
  const { fornecedores, pedidosCompra, recebimentosMercadoria } = useAdega();

  const tabs = [
    {
      id: 'fornecedores' as ComprasTab,
      label: 'Cadastro de Fornecedores',
      description: 'Parceiros, CNPJ, prazos de faturamento e canais de contato',
      icon: Building2,
      count: fornecedores.length,
      badge: 'Gestão',
    },
    {
      id: 'pedidos' as ComprasTab,
      label: 'Pedidos de Compra',
      description: 'Registro, cotações, transmissão e acompanhamento de status',
      icon: ShoppingBag,
      count: pedidosCompra.length,
      badge: `${pedidosCompra.filter(p => ['APROVADO', 'ENVIADO_FORNECEDOR'].includes(p.status)).length} Ativos`,
    },
    {
      id: 'recebimento' as ComprasTab,
      label: 'Recebimento de Mercadorias',
      description: 'Conferência física, NF-e, lote e entrada direta no estoque',
      icon: PackageCheck,
      count: recebimentosMercadoria.length,
      badge: 'Estoque Atualizado',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-24 lg:pb-6">


      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all whitespace-nowrap shrink-0 border ${
                isActive
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-lg shadow-amber-950/30'
                  : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-zinc-950 text-amber-400' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-amber-600 text-zinc-950 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Conteúdo da Aba Ativa */}
      <div>
        {activeSubTab === 'fornecedores' && <CadastroFornecedoresTab />}
        {activeSubTab === 'pedidos' && <PedidosCompraTab />}
        {activeSubTab === 'recebimento' && <RecebimentoMercadoriasTab />}
      </div>
    </div>
  );
};
