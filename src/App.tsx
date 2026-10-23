import React, { useState, useEffect } from 'react';
import { AdegaProvider, useAdega } from './context/AdegaContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { UserRoleSwitcherModal } from './components/auth/UserRoleSwitcherModal';
import { CardapioQrModal } from './components/atendimento/CardapioQrModal';

// Views
import { VendasEClientesView } from './components/vendas/VendasEClientesView';
import { PdvView } from './components/pdv/PdvView';
import { EstoqueDosesView } from './components/estoque/EstoqueDosesView';
import { MesasView } from './components/atendimento/MesasView';
import { ComandasView } from './components/atendimento/ComandasView';
import { KdsView } from './components/atendimento/KdsView';
import { DeliveryView } from './components/atendimento/DeliveryView';
import { CrmFidelidadeView } from './components/atendimento/CrmFidelidadeView';
import { FiscalView } from './components/fiscal/FiscalView';
import { FinanceiroGestaoView } from './components/financeiro/FinanceiroGestaoView';
import { BackofficeView } from './components/backoffice/BackofficeView';
import { ComprasFornecedoresView } from './components/compras/ComprasFornecedoresView';
import { DashboardView } from './components/dashboard/DashboardView';
import { MultilojasView } from './components/multilojas/MultilojasView';
import { PeripheralConfigView } from './components/peripherals/PeripheralConfigView';
import { ImpressorasTermicasView } from './components/impressao/ImpressorasTermicasView';
import { ConfiguracoesView } from './components/config/ConfiguracoesView';
import { ScreenLockOverlay } from './components/pdv/ScreenLockOverlay';
import { SalesLandingPageView } from './components/sales/SalesLandingPageView';
import { MobileBottomNav } from './components/common/MobileBottomNav';

interface MainLayoutProps {
  onOpenSalesPage: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onOpenSalesPage }) => {
  const { currentUser } = useAdega();
  const [activeTab, setActiveTab] = useState<any>('vendas');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Auto adjust tab if user role does not have access
  useEffect(() => {
    if (currentUser.role === 'DELIVERY_COURIER') {
      setActiveTab('delivery');
    } else if (currentUser.role === 'WAITER') {
      if (!['mesas', 'comandas', 'kds'].includes(activeTab)) {
        setActiveTab('mesas');
      }
    } else if (currentUser.role === 'CASHIER') {
      if (['fiscal', 'backoffice', 'dashboard', 'multiloja', 'multilojas', 'configuracoes'].includes(activeTab)) {
        setActiveTab('vendas');
      }
    }
  }, [currentUser.role]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'vendas':
        return <VendasEClientesView />;
      case 'pdv':
        return <VendasEClientesView initialSubTab="pdv" />;
      case 'crm':
        return <VendasEClientesView initialSubTab="clientes" />;
      case 'compras':
        return <ComprasFornecedoresView />;
      case 'estoque':
        return <EstoqueDosesView />;
      case 'mesas':
        return <MesasView />;
      case 'comandas':
        return <ComandasView />;
      case 'kds':
        return <KdsView />;
      case 'delivery':
        return <DeliveryView />;
      case 'fiscal':
        return <FiscalView />;
      case 'financeiro':
        return <FinanceiroGestaoView />;
      case 'backoffice':
        return <BackofficeView />;
      case 'dashboard':
        return <DashboardView />;
      case 'multiloja':
      case 'multilojas':
        return <MultilojasView />;
      case 'impressoras':
        return <ImpressorasTermicasView />;
      case 'perifericos':
        return <PeripheralConfigView />;
      case 'configuracoes':
        return <ConfiguracoesView />;
      default:
        return <PdvView />;
    }
  };

  return (
    <div className="flex h-screen h-[100dvh] w-full bg-zinc-950 text-zinc-100 overflow-hidden select-none font-sans antialiased">
      {/* Screen Lock Security Overlay */}
      <ScreenLockOverlay />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenCardapioQr={() => setQrModalOpen(true)}
      />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <Header
          onOpenRoleModal={() => setRoleModalOpen(true)}
          onOpenCardapioModal={() => setQrModalOpen(true)}
          onOpenQrCardapio={() => setQrModalOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenSalesPage={onOpenSalesPage}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden relative">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Smartphones & Small Tablets) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setMobileMenuOpen(false);
        }}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />

      {/* RBAC & Self-service Modals */}
      <UserRoleSwitcherModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
      />

      <CardapioQrModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
      />
    </div>
  );
};

const AppContent: React.FC = () => {
  const [viewMode, setViewMode] = useState<'SYSTEM' | 'SALES_PAGE'>('SYSTEM');

  if (viewMode === 'SALES_PAGE') {
    return <SalesLandingPageView onEnterSystem={() => setViewMode('SYSTEM')} />;
  }

  return <MainLayout onOpenSalesPage={() => setViewMode('SALES_PAGE')} />;
};

export default function App() {
  return (
    <AdegaProvider>
      <AppContent />
    </AdegaProvider>
  );
}
