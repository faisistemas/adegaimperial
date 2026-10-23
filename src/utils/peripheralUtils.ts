import { ScaleConfig, ScaleProtocol, ThermalPrinterConfig, CashMovement, CashBlindCloseRecord, Store } from '../types';

/**
 * Utilitários de Periféricos & Comunicação de Hardware (Módulo 2)
 * Suporte a Balanças Checkout (Toledo, Filizola), Impressora Térmica ESC/POS e Leitor Barcode
 */

// ----------------------------------------------------
// 1. Balança Checkout (Protocolos Toledo / Filizola)
// ----------------------------------------------------

/**
 * Gera frame serial bruto (STX + Peso + ETX) conforme padrão Toledo/Filizola
 */
export function buildScaleFrame(weightKg: number, protocol: ScaleProtocol = 'TOLEDO_PRIX3'): {
  rawAscii: string;
  rawHex: string;
  weightFormatted: string;
} {
  const STX = '\x02'; // ASCII 2
  const ETX = '\x03'; // ASCII 3

  const clamped = Math.max(0, Math.min(weightKg, 30.000));
  const weightStr = clamped.toFixed(3).padStart(6, '0'); // ex: "01.250"

  let payload = weightStr;
  if (protocol === 'TOLEDO_9094') {
    payload = `02${weightStr}`; // Toledo 9094 inclui identificador
  } else if (protocol === 'FILIZOLA') {
    // Filizola usa 5 dígitos inteiros em gramas sem ponto: 1250g -> "01250"
    const grams = Math.round(clamped * 1000).toString().padStart(5, '0');
    payload = grams;
  }

  const rawAscii = `${STX}${payload}${ETX}`;

  // Converter para representação hexadecimal legível
  const rawHex = Array.from(rawAscii)
    .map((char) => {
      const hex = char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0');
      if (char === '\x02') return `[02 STX]`;
      if (char === '\x03') return `[03 ETX]`;
      return hex;
    })
    .join(' ');

  return {
    rawAscii,
    rawHex,
    weightFormatted: `${clamped.toFixed(3)} kg`,
  };
}

/**
 * Decodifica frame serial recebido da porta serial COM / USB
 */
export function parseScaleFrame(frameText: string, protocol: ScaleProtocol = 'TOLEDO_PRIX3'): number | null {
  // Remove caracteres fora do STX / ETX
  const clean = frameText.replace(/[\x02\x03\r\n]/g, '').trim();
  if (!clean) return null;

  if (protocol === 'FILIZOLA') {
    // 5 dígitos em gramas (ex: "01250" = 1.250kg)
    const grams = parseInt(clean, 10);
    return isNaN(grams) ? null : grams / 1000;
  }

  // Toledo padrão: "01.250" ou "0201.250"
  const match = clean.match(/(\d+\.?\d*)/);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : val;
  }

  return null;
}

/**
 * Verifica se o navegador atual suporta a Web Serial API (Chrome, Edge, Opera)
 */
export function isWebSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

// ----------------------------------------------------
// 2. Feedback Sonoro (Web Audio API)
// ----------------------------------------------------

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Bip clássico de scanner de código de barras (1800Hz / 60ms)
 */
export function playScannerBeep(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1850, ctx.currentTime);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // Silencioso em caso de restrição do navegador
  }
}

/**
 * Som de sucesso de pagamento / pesagem estável (acorde de 2 tons)
 */
export function playSuccessBeep(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.setValueAtTime(1046.5, now); // C6
    osc2.frequency.setValueAtTime(1318.5, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.08);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch {
    // Silencioso
  }
}

/**
 * Som de erro / bloqueio / recusa de PIN
 */
export function playErrorBuzz(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {
    // Silencioso
  }
}

/**
 * Som de abertura mecânica de gaveta de dinheiro (pulso 24V)
 */
export function playCashDrawerSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    // Silencioso
  }
}

// ----------------------------------------------------
// 3. Comprovantes Térmicos ESC/POS (80mm / 58mm)
// ----------------------------------------------------

/**
 * Gera texto formatado para Impressão Térmica de Sangria ou Suprimento
 */
export function generateCashMovementThermalReceipt(
  movement: CashMovement,
  store: Store,
  terminalNumber: string = 'Caixa 01',
  width: 80 | 58 = 80
): string {
  const line = width === 80 ? '='.repeat(48) : '='.repeat(32);
  const subline = width === 80 ? '-'.repeat(48) : '-'.repeat(32);

  const title = movement.tipo === 'SANGRIA' ? 'COMPROVANTE DE SANGRIA DE CAIXA' : 'COMPROVANTE DE SUPRIMENTO DE CAIXA';

  return `
${line}
${store.name.toUpperCase()}
CNPJ: ${store.cnpj}
TERMINAL: ${terminalNumber}
DATA/HORA: ${movement.dataHora}
${line}
>>> ${title} <<<
${subline}

VALOR: R$ {(movement.valor ?? 0).toFixed(2)}
MOTIVO / JUSTIFICATIVA:
${movement.motivo}

OPERADOR DO CAIXA:
${movement.userName}

GERENTE AUTORIZADOR:
${movement.managerAuthorizedName || 'SUPERVISAO GERAL'}

${subline}
ASSINATURA OPERADOR:


________________________________________________
${movement.userName}

ASSINATURA GERENTE:


________________________________________________
${movement.managerAuthorizedName || 'GERENCIA'}

${line}
SISTEMA ADEGA ERP - MÓDULO 2 PERIFÉRICOS
[CORTE DE PAPEL ESC/POS: GS V 66 0]
`.trim();
}

/**
 * Gera texto de Relatório de Fechamento Cego de Caixa
 */
export function generateBlindCloseThermalReport(
  record: CashBlindCloseRecord,
  store: Store,
  terminalNumber: string = 'Caixa 01',
  width: 80 | 58 = 80
): string {
  const line = width === 80 ? '='.repeat(48) : '='.repeat(32);
  const subline = width === 80 ? '-'.repeat(48) : '-'.repeat(32);

  const statusLabel =
    record.statusConfronto === 'EXATO'
      ? 'FECHAMENTO EXATO (SEM DIFERENCA)'
      : record.statusConfronto === 'SOBRA'
      ? `SOBRA DE CAIXA (+ R$ ${Math.abs(record.diferencaTotal ?? 0).toFixed(2)})`
      : `QUEBRA DE CAIXA (- R$ ${Math.abs(record.diferencaTotal ?? 0).toFixed(2)})`;

  return `
${line}
${store.name.toUpperCase()}
CNPJ: ${store.cnpj}
TERMINAL: ${terminalNumber} - TURNO ENCERRADO
ENCERRAMENTO: ${record.dataFechamento}
OPERADOR: ${record.operadorNome}
${line}
RELATÓRIO DE AUDITORIA - FECHAMENTO CEGO
${subline}
STATUS CONFRONTO: ${statusLabel}
${subline}

VALORES DECLARADOS (CONTAGEM FÍSICA):
Dinheiro Físico:       R$ ${(record.declaradoDinheiro ?? 0).toFixed(2).padStart(10)}
Cartão de Crédito:     R$ ${(record.declaradoCartaoCredito ?? 0).toFixed(2).padStart(10)}
Cartão de Débito:      R$ ${(record.declaradoCartaoDebito ?? 0).toFixed(2).padStart(10)}
PIX Conferido:         R$ ${(record.declaradoPix ?? 0).toFixed(2).padStart(10)}
------------------------------------------------
TOTAL DECLARADO:       R$ ${(record.totalDeclarado ?? 0).toFixed(2).padStart(10)}

VALORES APURADOS NO SISTEMA (SESSÃO):
Dinheiro Sistema:      R$ ${(record.sistemaDinheiro ?? 0).toFixed(2).padStart(10)}
Cartão de Crédito:     R$ ${(record.sistemaCartaoCredito ?? 0).toFixed(2).padStart(10)}
Cartão de Débito:      R$ ${(record.sistemaCartaoDebito ?? 0).toFixed(2).padStart(10)}
PIX Sistema:           R$ ${(record.sistemaPix ?? 0).toFixed(2).padStart(10)}
------------------------------------------------
TOTAL SISTEMA:         R$ ${(record.totalSistema ?? 0).toFixed(2).padStart(10)}

CONFRONTO FINAL:
Diferença Dinheiro:    R$ ${(record.diferencaDinheiro ?? 0) >= 0 ? '+' : ''}${(record.diferencaDinheiro ?? 0).toFixed(2).padStart(10)}
Diferença Geral:       R$ ${(record.diferencaTotal ?? 0) >= 0 ? '+' : ''}${(record.diferencaTotal ?? 0).toFixed(2).padStart(10)}

${subline}
OBSERVAÇÕES DO OPERADOR:
${record.observacoes || 'Fechamento de turno regular.'}

VISTO DA GERÊNCIA:


________________________________________________
ASSINATURA DO GERENTE DE TURNO

${line}
ADEGA ERP - CONTROLE FISCAL E DE CAIXA
[CORTE DE PAPEL ESC/POS: GS V 66 0]
`.trim();
}
