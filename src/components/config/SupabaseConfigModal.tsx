import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ExternalLink, X, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { getSupabaseClient, checkBackendSupabaseStatus } from '../../lib/supabase';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { products, orders, users, customers, tables, comandas } = useAdega();
  const [status, setStatus] = useState<{
    configured: boolean;
    connected: boolean;
    schemaReady?: boolean;
    message: string;
    loading: boolean;
  }>({
    configured: false,
    connected: false,
    message: 'Verificando conexão...',
    loading: true,
  });

  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'STATUS' | 'SQL' | 'TUTORIAL'>('STATUS');

  const checkStatus = async () => {
    setStatus((prev) => ({ ...prev, loading: true }));
    try {
      const res = await checkBackendSupabaseStatus();
      setStatus({
        configured: res.configured,
        connected: res.connected,
        schemaReady: res.schemaReady,
        message: res.message || 'Status verificado.',
        loading: false,
      });
    } catch (err: any) {
      setStatus({
        configured: false,
        connected: false,
        message: `Falha ao verificar Supabase: ${err.message}`,
        loading: false,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkStatus();
    }
  }, [isOpen]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);

    let syncedSuccess = false;
    let pCount = 0;
    let oCount = 0;
    let uCount = 0;
    let cCount = 0;

    // 1. Tenta sincronização via API local / backend
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, orders, users, customers, tables, comandas }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.synced) {
          syncedSuccess = true;
          pCount = data.productsCount ?? 0;
          oCount = data.ordersCount ?? 0;
          uCount = data.usersCount ?? 0;
          cCount = data.customersCount ?? 0;
        }
      }
    } catch (err: any) {
      // Ignora erro da API e tenta sincronização direta via cliente Supabase
    }

    // 2. Se a API não respondeu (ex: deploy estático na Vercel), sincroniza diretamente via Supabase Client
    if (!syncedSuccess) {
      const sb = getSupabaseClient();
      if (sb) {
        try {
          if (products && products.length > 0) {
            const formattedProducts = products.map((p) => ({
              id: p.id,
              name: p.name,
              barcode: p.barcode,
              category: p.category,
              subcategory: p.subcategory || null,
              price: p.price,
              cost_price: p.costPrice || 0,
              stock_units: p.stockUnits || 0,
              image: p.image || null,
              is_fractionable: p.isFractionable ?? false,
              bottle_volume_ml: p.bottleVolumeMl || null,
              dose_volume_ml: p.doseVolumeMl || null,
              price_per_dose: p.pricePerDose || null,
              open_bottle_volume_ml: p.openBottleVolumeMl || null,
              is_weighed: p.isWeighed ?? false,
              price_per_kg: p.pricePerKg || null,
              min_stock_alert: p.minStockAlert ?? 5,
              ncm: p.ncm || '2208.90.00',
              cest: p.cest || null,
              cfop: p.cfop || '5.405',
              cst_icms: p.cstIcms || '500',
              updated_at: new Date().toISOString(),
            }));
            const { error: pErr } = await sb.from('produtos').upsert(formattedProducts);
            if (!pErr) pCount = formattedProducts.length;
          }

          if (orders && orders.length > 0) {
            const formattedOrders = orders.map((o) => ({
              id: o.id,
              code: o.code,
              store_id: o.storeId || 'store-1',
              created_at: o.createdAt || new Date().toISOString(),
              subtotal: o.subtotal || 0,
              discount: o.discount || 0,
              service_fee: o.serviceFee || 0,
              delivery_fee: o.deliveryFee || 0,
              total: o.total || 0,
              status: o.status || 'COMPLETED',
              order_type: o.orderType || 'PDV_BALCAO',
              table_number: o.tableNumber || null,
              comanda_number: o.comandaNumber || null,
              customer_name: o.customerName || null,
              customer_cpf: o.customerCpf || null,
              operator_name: o.operatorName || null,
              nfce_key: o.nfceKey || null,
              nfce_protocol: o.nfceProtocol || null,
              payment_method: o.paymentMethod || null,
              payment_details: o.paymentDetails || null,
              items: o.items || [],
            }));
            const { error: oErr } = await sb.from('pedidos').upsert(formattedOrders);
            if (!oErr) oCount = formattedOrders.length;
          }

          if (users && users.length > 0) {
            const formattedUsers = users.map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              avatar: u.avatar || '/logo.jpg',
              pin: u.pin,
              phone: u.whatsapp || u.phone || null,
              whatsapp: u.whatsapp || null,
              cpf_cnpj: u.cpfCnpj || null,
              store_id: u.storeId || 'store-1',
              updated_at: new Date().toISOString(),
            }));
            const { error: uErr } = await sb.from('usuarios').upsert(formattedUsers);
            if (!uErr) uCount = formattedUsers.length;
          }

          if (customers && customers.length > 0) {
            const formattedCustomers = customers.map((c) => ({
              id: c.id,
              name: c.name,
              cpf_cnpj: c.cpfCnpj || null,
              phone: c.phone || null,
              email: c.email || null,
              address: c.address || null,
              total_spent: c.totalSpent || 0,
              orders_count: c.ordersCount || 0,
              credit_balance: c.creditBalance || 0,
              loyalty_points: c.loyaltyPoints || 0,
              updated_at: new Date().toISOString(),
            }));
            const { error: cErr } = await sb.from('clientes').upsert(formattedCustomers);
            if (!cErr) cCount = formattedCustomers.length;
          }

          syncedSuccess = true;
        } catch (clientErr: any) {
          setSyncResult(`Erro ao sincronizar diretamente com Supabase: ${clientErr.message}`);
          setSyncing(false);
          return;
        }
      }
    }

    if (syncedSuccess) {
      setSyncResult(`Sincronização concluída com sucesso! ${pCount} produtos, ${oCount} pedidos, ${uCount} usuários e ${cCount} clientes sincronizados no Supabase.`);
    } else {
      setSyncResult('Não foi possível sincronizar com o banco de dados. Verifique a conexão com o Supabase.');
    }
    setSyncing(false);
  };

  const sqlCode = `-- ========================================================
-- Schema do Banco de Dados Supabase para AdeGaswg PDV
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Produtos / Catálogo
CREATE TABLE IF NOT EXISTS public.produtos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_units INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    is_fractionable BOOLEAN DEFAULT FALSE,
    bottle_volume_ml INTEGER,
    dose_volume_ml INTEGER,
    price_per_dose NUMERIC(10,2),
    open_bottle_volume_ml INTEGER,
    is_weighed BOOLEAN DEFAULT FALSE,
    price_per_kg NUMERIC(10,2),
    min_stock_alert INTEGER DEFAULT 5,
    ncm TEXT DEFAULT '2208.90.00',
    cest TEXT,
    cfop TEXT DEFAULT '5.405',
    cst_icms TEXT DEFAULT '500',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Pedidos / Vendas
CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    store_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) DEFAULT 0.00,
    service_fee NUMERIC(10,2) DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    order_type TEXT NOT NULL DEFAULT 'PDV_BALCAO',
    table_number INTEGER,
    comanda_number INTEGER,
    customer_name TEXT,
    customer_cpf TEXT,
    operator_name TEXT,
    nfce_key TEXT,
    nfce_protocol TEXT,
    payment_method TEXT,
    payment_details JSONB,
    items JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 3. Tabela de Sessões de Caixa
CREATE TABLE IF NOT EXISTS public.caixa_sessoes (
    id TEXT PRIMARY KEY,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    initial_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    current_cash NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_sales NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    is_open BOOLEAN DEFAULT TRUE,
    operator_name TEXT,
    terminal_number TEXT DEFAULT '01'
);

-- 4. Tabela de Movimentações de Caixa
CREATE TABLE IF NOT EXISTS public.caixa_movimentacoes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    session_id TEXT REFERENCES public.caixa_sessoes(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Mesas do Salão
CREATE TABLE IF NOT EXISTS public.mesas (
    id INTEGER PRIMARY KEY,
    number INTEGER NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'FREE',
    guests_count INTEGER DEFAULT 0,
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    waiter_name TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Comandas Individuais
CREATE TABLE IF NOT EXISTS public.comandas (
    id TEXT PRIMARY KEY,
    number INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_cpf TEXT,
    status TEXT NOT NULL DEFAULT 'OPEN',
    total_amount NUMERIC(10,2) DEFAULT 0.00,
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    items JSONB DEFAULT '[]'::jsonb
);

-- 7. Tabela de Usuários / Operadores do Sistema
CREATE TABLE IF NOT EXISTS public.usuarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'WAITER',
    avatar TEXT DEFAULT '/logo.jpg',
    pin TEXT NOT NULL,
    store_id TEXT DEFAULT 'store-1',
    phone TEXT,
    whatsapp TEXT,
    cpf_cnpj TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.usuarios (id, name, email, role, avatar, pin, store_id)
VALUES 
    ('u-1', 'Administrador', 'admin@adegaswg.com.br', 'SUPER_ADMIN', '/logo.jpg', '#Adegaswg2027*', 'store-1'),
    ('u-2', 'Garçom', 'garcom@adegaswg.com.br', 'WAITER', '/logo.jpg', '#Adegaswg2027*', 'store-1')
ON CONFLICT (id) DO UPDATE SET pin = EXCLUDED.pin;

-- 8. Tabela de Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    cpf_cnpj TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    total_spent NUMERIC(10,2) DEFAULT 0.00,
    orders_count INTEGER DEFAULT 0,
    credit_balance NUMERIC(10,2) DEFAULT 0.00,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Habilitar Row Level Security (RLS)
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comandas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- 10. Políticas de Acesso
DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
CREATE POLICY "Acesso total produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total pedidos" ON public.pedidos;
CREATE POLICY "Acesso total pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total caixa_sessoes" ON public.caixa_sessoes;
CREATE POLICY "Acesso total caixa_sessoes" ON public.caixa_sessoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total caixa_movimentacoes" ON public.caixa_movimentacoes;
CREATE POLICY "Acesso total caixa_movimentacoes" ON public.caixa_movimentacoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total mesas" ON public.mesas;
CREATE POLICY "Acesso total mesas" ON public.mesas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total comandas" ON public.comandas;
CREATE POLICY "Acesso total comandas" ON public.comandas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total usuarios" ON public.usuarios;
CREATE POLICY "Acesso total usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total clientes" ON public.clientes;
CREATE POLICY "Acesso total clientes" ON public.clientes FOR ALL USING (true) WITH CHECK (true);

NOTIFY pgrst, 'reload schema';`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg text-white">Integração Supabase & Backend</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs text-zinc-400">Banco de dados relacional em nuvem com sincronização em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-6 pt-2 gap-2 text-sm">
          <button
            onClick={() => setActiveTab('STATUS')}
            className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'STATUS'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Status da Conexão
          </button>
          <button
            onClick={() => setActiveTab('SQL')}
            className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'SQL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Script SQL (Schema)
          </button>
          <button
            onClick={() => setActiveTab('TUTORIAL')}
            className={`pb-3 px-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'TUTORIAL'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Como Configurar
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'STATUS' && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                  status.connected
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : status.configured
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-zinc-800/60 border-zinc-700 text-zinc-300'
                }`}
              >
                {status.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-sm space-y-1">
                  <div className="font-semibold text-white flex items-center justify-between">
                    <span>
                      {status.connected
                        ? 'Supabase Conectado e Operacional'
                        : status.configured
                        ? 'Chaves Detectadas (Aguardando Criação das Tabelas)'
                        : 'Modo Local / Aguardando Configuração de Chaves'}
                    </span>
                    <button
                      onClick={checkStatus}
                      disabled={status.loading}
                      className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 bg-zinc-800/80 px-2 py-1 rounded hover:bg-zinc-700 transition"
                    >
                      <RefreshCw className={`w-3 h-3 ${status.loading ? 'animate-spin' : ''}`} />
                      Recarregar
                    </button>
                  </div>
                  <p className="text-xs opacity-90 leading-relaxed">{status.message}</p>
                </div>
              </div>

              {/* Estatísticas Locais vs Nuvem */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-3.5">
                  <div className="text-xs text-zinc-400 mb-1">Produtos Cadastrados</div>
                  <div className="text-xl font-bold text-white">{products.length} itens</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Prontos para sincronização</div>
                </div>
                <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-3.5">
                  <div className="text-xs text-zinc-400 mb-1">Vendas / Pedidos Registrados</div>
                  <div className="text-xl font-bold text-white">{orders.length} vendas</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Histórico completo de PDV</div>
                </div>
              </div>

              {/* Botão Sincronizar */}
              <div className="pt-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Sincronizando com Supabase...' : 'Sincronizar Dados Locais para o Supabase'}
                </button>
                {syncResult && (
                  <p className="text-xs text-center mt-2.5 text-zinc-400 font-medium">
                    {syncResult}
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'SQL' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Copie e cole este script no <strong>SQL Editor</strong> do seu painel Supabase para criar as tabelas estruturadas:
                </p>
                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700 transition"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Copiado!' : 'Copiar Script SQL'}
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-72">
                <pre>{sqlCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'TUTORIAL' && (
            <div className="space-y-4 text-xs text-zinc-300 leading-relaxed">
              <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-xl p-4 space-y-2.5">
                <div className="font-semibold text-white text-sm">Passo a Passo para Conectar:</div>
                <ol className="list-decimal pl-4 space-y-2 text-zinc-300">
                  <li>
                    Acesse o painel do <strong>Supabase</strong> (app.supabase.com) e crie um novo projeto gratuito.
                  </li>
                  <li>
                    No menu lateral esquerdo, clique em <strong>SQL Editor</strong>, crie uma "New Query", cole o script da aba <strong>Script SQL</strong> e clique em <strong>Run</strong>.
                  </li>
                  <li>
                    Acesse <strong>Project Settings &gt; API</strong> e copie:
                    <ul className="list-disc pl-4 mt-1 text-zinc-400 space-y-0.5">
                      <li><strong>Project URL</strong> (ex: <code className="text-emerald-400">https://xyzcompany.supabase.co</code>)</li>
                      <li><strong>Project API Keys &gt; anon public</strong></li>
                      <li><strong>Project API Keys &gt; service_role (secret)</strong></li>
                    </ul>
                  </li>
                  <li>
                    Configure as variáveis de ambiente <code className="text-emerald-400">SUPABASE_URL</code> e <code className="text-emerald-400">SUPABASE_SERVICE_ROLE_KEY</code> (ou <code className="text-emerald-400">SUPABASE_ANON_KEY</code>) nas configurações do app.
                  </li>
                </ol>
              </div>

              <div className="flex items-center gap-2 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-zinc-400">
                <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>O sistema continuará gravando normalmente no armazenamento local caso a conexão com a nuvem esteja indisponível.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/40 flex justify-end">
          <button
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
