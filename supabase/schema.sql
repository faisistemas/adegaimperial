-- ========================================================
-- Schema do Banco de Dados Supabase para Adega Imperial PDV
-- Execute este script no SQL Editor do seu projeto Supabase
-- ========================================================

-- 1. Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Produtos / Catálogo
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

-- 3. Tabela de Pedidos / Vendas
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

-- 4. Tabela de Sessões de Caixa
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

-- 5. Tabela de Movimentações de Caixa (Sangrias e Suprimentos)
CREATE TABLE IF NOT EXISTS public.caixa_movimentacoes (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    session_id TEXT REFERENCES public.caixa_sessoes(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'BLEED' (Sangria) ou 'SUPPLY' (Suprimento)
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT NOT NULL,
    operator_name TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabela de Mesas do Salão
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

-- 7. Tabela de Comandas Individuais
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

-- 8. Habilitar Row Level Security (RLS) permissivo para o PDV
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caixa_movimentacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comandas ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Idempotentes (recria de forma segura se já existirem)
DROP POLICY IF EXISTS "Acesso total produtos" ON public.produtos;
DROP POLICY IF EXISTS "Permitir leitura anonima produtos" ON public.produtos;
CREATE POLICY "Acesso total produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Permitir escrita pedidos" ON public.pedidos;
CREATE POLICY "Acesso total pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total caixa_sessoes" ON public.caixa_sessoes;
DROP POLICY IF EXISTS "Permitir caixa sessoes" ON public.caixa_sessoes;
CREATE POLICY "Acesso total caixa_sessoes" ON public.caixa_sessoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total caixa_movimentacoes" ON public.caixa_movimentacoes;
DROP POLICY IF EXISTS "Permitir movimentacoes caixa" ON public.caixa_movimentacoes;
CREATE POLICY "Acesso total caixa_movimentacoes" ON public.caixa_movimentacoes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total mesas" ON public.mesas;
DROP POLICY IF EXISTS "Permitir mesas" ON public.mesas;
CREATE POLICY "Acesso total mesas" ON public.mesas FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total comandas" ON public.comandas;
DROP POLICY IF EXISTS "Permitir comandas" ON public.comandas;
CREATE POLICY "Acesso total comandas" ON public.comandas FOR ALL USING (true) WITH CHECK (true);

-- Notificar a API do Supabase para atualizar o cache de schemas imediatamente
NOTIFY pgrst, 'reload schema';

