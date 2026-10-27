/**
 * Utilitário central de persistência local para o Adega SaaS.
 * Garante que produtos cadastrados, alterações de estoque, vendas,
 * fornecedores, pedidos e clientes NUNCA sejam perdidos ao recarregar a página (F5/Reload).
 */

export const STORAGE_PREFIX = 'adega_saas_v2_';

// Purge old mock data from previous version if present in browser
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith('adega_saas_v1_')) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => window.localStorage.removeItem(k));
  } catch {
    // Ignore storage access errors
  }
}

export const STORAGE_KEYS = {
  PRODUCTS: `${STORAGE_PREFIX}products`,
  CUSTOMERS: `${STORAGE_PREFIX}customers`,
  ORDERS: `${STORAGE_PREFIX}orders`,
  FORNECEDORES: `${STORAGE_PREFIX}fornecedores`,
  PEDIDOS_COMPRA: `${STORAGE_PREFIX}pedidos_compra`,
  RECEBIMENTOS: `${STORAGE_PREFIX}recebimentos_mercadoria`,
  PRODUTO_LOTES: `${STORAGE_PREFIX}produto_lotes`,
  MOVIMENTACOES_ESTOQUE: `${STORAGE_PREFIX}movimentacoes_estoque`,
  DEVOLUCOES: `${STORAGE_PREFIX}devolucoes`,
  RESERVAS: `${STORAGE_PREFIX}reservas`,
  CONTAS_PAGAR: `${STORAGE_PREFIX}contas_pagar`,
  CONTAS_RECEBER: `${STORAGE_PREFIX}contas_receber`,
  COMANDAS: `${STORAGE_PREFIX}comandas`,
  TABLES: `${STORAGE_PREFIX}tables`,
  CATEGORIES: `${STORAGE_PREFIX}categories`,
  RECIPIENTES_ABERTOS: `${STORAGE_PREFIX}recipientes_abertos`,
  PERDAS_ESTOQUE: `${STORAGE_PREFIX}perdas_estoque`,
  TORNEIRAS_CHOPP: `${STORAGE_PREFIX}torneiras_chopp`,
  VASILHAMES: `${STORAGE_PREFIX}vasilhames`,
  CARTOES_CONSUMO: `${STORAGE_PREFIX}cartoes_consumo`,
  CLIENTES_FIDELIDADE: `${STORAGE_PREFIX}clientes_fidelidade`,
  CASH_SESSION: `${STORAGE_PREFIX}cash_session`,
  APP_SETTINGS: `${STORAGE_PREFIX}app_settings`,
  AUDIT_LOGS: `${STORAGE_PREFIX}audit_logs`,
  USERS: `${STORAGE_PREFIX}users`,
} as const;

/**
 * Carrega dados do localStorage com tratamento defensivo e fallback
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    // Se o fallback for um array, garanta que o item recuperado seja um array
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      return fallback;
    }
    return parsed as T;
  } catch (err) {
    console.warn(`[Storage] Erro ao carregar chave "${key}":`, err);
    return fallback;
  }
}

/**
 * Salva dados no localStorage imediatamente com tratamento de quota
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const serialized = JSON.stringify(data);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (err) {
    console.error(`[Storage] Falha ao persistir chave "${key}":`, err);
    return false;
  }
}

/**
 * Remove uma chave do localStorage
 */
export function removeFromStorage(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[Storage] Falha ao remover chave "${key}":`, err);
  }
}

/**
 * Limpa todos os dados persistidos pelo sistema (para reset de fábrica ou testes)
 */
export function clearAllAdegaStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    Object.values(STORAGE_KEYS).forEach((k) => {
      window.localStorage.removeItem(k);
    });
    console.info('[Storage] Todos os dados locais do Adega SaaS foram resetados.');
  } catch (err) {
    console.error('[Storage] Falha ao limpar storage:', err);
  }
}
