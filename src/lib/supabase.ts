/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

const DEFAULT_SUPABASE_URL = 'https://zaryikcqbvjueyisudqy.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inphcnlpa2NxYnZqdWV5aXN1ZHF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc3MDM3MiwiZXhwIjoyMTA4MzQ2MzcyfQ.pYraq-QNLJwgRs3LPiUKz9ZhQPC9aB3ztnJ8TgOMkfs';

export function getSupabaseClient(): SupabaseClient | null {
  const metaEnv = (import.meta as any).env || {};
  const url = metaEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = metaEnv.VITE_SUPABASE_SERVICE_ROLE_KEY || metaEnv.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.warn('[Supabase Client] Failed to initialize:', err);
      return null;
    }
  }

  return supabaseClient;
}

export function isSupabaseClientConfigured(): boolean {
  return true;
}

export async function checkBackendSupabaseStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  schemaReady?: boolean;
  message: string;
}> {
  try {
    const res = await fetch('/api/supabase/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // API endpoint might be offline or running as static host
  }

  // Fallback: verificação direta no cliente via Supabase JS SDK
  const client = getSupabaseClient();
  if (!client) {
    return {
      configured: false,
      connected: false,
      message: 'Supabase não inicializado.',
    };
  }

  try {
    const { error } = await client.from('produtos').select('count', { count: 'exact', head: true });
    return {
      configured: true,
      connected: true,
      schemaReady: !error,
      message: error
        ? `Conectado ao Supabase! (${error.message})`
        : 'Conectado com sucesso ao banco de dados Supabase.',
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      message: `Erro ao conectar diretamente ao Supabase: ${err.message}`,
    };
  }
}
