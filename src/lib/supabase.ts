/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const metaEnv = (import.meta as any).env || {};
  const url = metaEnv.VITE_SUPABASE_URL;
  const anonKey = metaEnv.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseClient) {
    try {
      supabaseClient = createClient(url, anonKey, {
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
  const metaEnv = (import.meta as any).env || {};
  return Boolean(metaEnv.VITE_SUPABASE_URL && metaEnv.VITE_SUPABASE_ANON_KEY);
}

export async function checkBackendSupabaseStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  schemaReady?: boolean;
  message: string;
}> {
  try {
    const res = await fetch('/api/supabase/status');
    if (!res.ok) {
      return {
        configured: false,
        connected: false,
        message: 'Servidor local respondeu com erro ao verificar Supabase.',
      };
    }
    return await res.json();
  } catch (err) {
    return {
      configured: false,
      connected: false,
      message: 'Não foi possível conectar à API do servidor backend.',
    };
  }
}
