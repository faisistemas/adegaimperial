import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check, ExternalLink, X, ShieldCheck, Terminal, Layers } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { products, orders } = useAdega();
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
      const res = await fetch('/api/supabase/status');
      const data = await res.json();
      setStatus({
        configured: data.configured ?? false,
        connected: data.connected ?? false,
        schemaReady: data.schemaReady,
        message: data.message || 'Status verificado.',
        loading: false,
      });
    } catch (err: any) {
      setStatus({
        configured: false,
        connected: false,
        message: 'Falha ao contatar a API local do servidor backend.',
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
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products, orders }),
      });
      const data = await res.json();
      if (data.synced) {
        setSyncResult(`Sincronização concluída com sucesso! ${data.productsCount} produtos e ${data.ordersCount} pedidos atualizados no Supabase.`);
      } else {
        setSyncResult(data.message || 'Erro durante a sincronização.');
      }
    } catch (err: any) {
      setSyncResult(`Erro ao sincronizar: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const sqlCode = `-- 1. Tabela de Produtos
CREATE TABLE IF NOT EXISTS public.produtos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    barcode TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    stock_units INTEGER NOT NULL DEFAULT 0,
    image TEXT,
    is_fractionable BOOLEAN DEFAULT FALSE,
    bottle_volume_ml INTEGER,
    dose_volume_ml INTEGER,
    price_per_dose NUMERIC(10,2),
    open_bottle_volume_ml INTEGER,
    ncm TEXT DEFAULT '2208.90.00',
    cfop TEXT DEFAULT '5.405',
    cst_icms TEXT DEFAULT '500',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Pedidos / Vendas
CREATE TABLE IF NOT EXISTS public.pedidos (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    store_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    order_type TEXT NOT NULL DEFAULT 'PDV_BALCAO',
    customer_name TEXT,
    customer_cpf TEXT,
    operator_name TEXT,
    nfce_key TEXT,
    nfce_protocol TEXT,
    payment_method TEXT,
    payment_details JSONB,
    items JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- 3. Habilitar Políticas de Acesso
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir Leitura e Escrita Produtos" ON public.produtos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir Leitura e Escrita Pedidos" ON public.pedidos FOR ALL USING (true) WITH CHECK (true);`;

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
