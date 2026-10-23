import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdega } from '../context/AdegaContext';
import { buildScaleFrame, parseScaleFrame, isWebSerialSupported, playSuccessBeep } from '../utils/peripheralUtils';

interface UseSerialScaleReturn {
  isWebSerialSupported: boolean;
  isConnected: boolean;
  isStable: boolean;
  currentWeight: number; // Gross weight in kg
  netWeight: number;     // Weight deducting tare
  tareWeight: number;    // Stored tare
  rawHex: string;        // Hex frame visualization [02 STX] ... [03 ETX]
  rawAscii: string;      // Raw text representation
  statusMessage: string;
  connectRealPort: () => Promise<boolean>;
  disconnectPort: () => Promise<void>;
  applyTare: () => void;
  resetZero: () => void;
  simulateWeightChange: (newWeightKg: number) => void;
  toggleStability: () => void;
}

const DEFAULT_SCALE_CONFIG = {
  protocol: 'TOLEDO_PRIX3' as const,
  connectionType: 'WEB_SERIAL' as const,
  port: 'COM1',
  baudRate: 9600,
  dataBits: 8 as const,
  parity: 'none' as const,
  stopBits: 1 as const,
  readingMode: 'CONTINUOUS' as const,
  autoPriceWeighedProducts: true,
  timeoutMs: 1500,
  lastWeightSample: 1.250,
  isConnected: true,
  rawFrameFormat: 'STX + Peso (5 bytes) + ETX',
};

export const useSerialScale = (): UseSerialScaleReturn => {
  const { peripheralSettings, updateScaleConfig } = useAdega();
  const config = peripheralSettings?.scale || DEFAULT_SCALE_CONFIG;

  const [isConnected, setIsConnected] = useState<boolean>(config.isConnected ?? true);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [currentWeight, setCurrentWeight] = useState<number>(config.lastWeightSample || 1.250);
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Balança pronta para leitura');
  const [rawFrame, setRawFrame] = useState<{ rawAscii: string; rawHex: string }>(() =>
    buildScaleFrame(config.lastWeightSample || 1.250, config.protocol || 'TOLEDO_PRIX3')
  );

  const serialPortRef = useRef<any>(null);
  const readerRef = useRef<any>(null);
  const readingLoopActive = useRef<boolean>(false);

  // Atualizar frame quando peso ou protocolo mudar
  useEffect(() => {
    const frame = buildScaleFrame(currentWeight, config.protocol || 'TOLEDO_PRIX3');
    setRawFrame(frame);
  }, [currentWeight, config?.protocol]);

  // Aplicar tara
  const applyTare = useCallback(() => {
    if (currentWeight > 0) {
      setTareWeight(currentWeight);
      setStatusMessage(`Tara de ${currentWeight.toFixed(3)} kg aplicada.`);
      playSuccessBeep();
    }
  }, [currentWeight]);

  // Zerar tara
  const resetZero = useCallback(() => {
    setTareWeight(0);
    setStatusMessage('Balança zerada (Tara removida).');
  }, []);

  // Alternar estabilidade
  const toggleStability = useCallback(() => {
    setIsStable((prev) => !prev);
  }, []);

  // Simular alteração de peso manual (para testes e modo demonstração)
  const simulateWeightChange = useCallback((newWeightKg: number) => {
    const clamped = Math.max(0, Math.min(newWeightKg, 30.000));
    setCurrentWeight(clamped);
    setIsStable(true);
    setStatusMessage(`Peso atualizado: ${clamped.toFixed(3)} kg`);
    updateScaleConfig({ lastWeightSample: clamped });
  }, [updateScaleConfig]);

  // Conectar via Web Serial API nativa do navegador
  const connectRealPort = useCallback(async (): Promise<boolean> => {
    if (!isWebSerialSupported()) {
      setStatusMessage('Web Serial API não é suportada neste navegador. Utilize Google Chrome, Microsoft Edge ou Opera.');
      return false;
    }

    try {
      setStatusMessage('Solicitando porta serial COM / USB...');
      const navSerial = (navigator as any).serial;
      const port = await navSerial.requestPort();

      await port.open({
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
      });

      serialPortRef.current = port;
      readingLoopActive.current = true;
      setIsConnected(true);
      updateScaleConfig({ isConnected: true });
      setStatusMessage(`Conectado à balança física (${config.baudRate} bps, ${config.protocol}).`);
      playSuccessBeep();

      // Iniciar loop de leitura de stream contínuo
      const textDecoder = new TextDecoderStream();
      port.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable.getReader();
      readerRef.current = reader;

      (async () => {
        let buffer = '';
        try {
          while (readingLoopActive.current) {
            const { value, done } = await reader.read();
            if (done) break;
            if (value) {
              buffer += value;
              // Verificar se contém frame fechado STX ... ETX
              const stxIndex = buffer.indexOf('\x02');
              const etxIndex = buffer.indexOf('\x03', stxIndex);
              if (stxIndex !== -1 && etxIndex !== -1 && etxIndex > stxIndex) {
                const frameContent = buffer.substring(stxIndex, etxIndex + 1);
                buffer = buffer.substring(etxIndex + 1);

                const parsed = parseScaleFrame(frameContent, config.protocol);
                if (parsed !== null && !isNaN(parsed)) {
                  setCurrentWeight(parsed);
                  setIsStable(true);
                  updateScaleConfig({ lastWeightSample: parsed });
                }
              }
            }
          }
        } catch (err: any) {
          console.warn('Leitura serial encerrada:', err);
        }
      })();

      return true;
    } catch (err: any) {
      console.error('Erro ao conectar porta serial:', err);
      setStatusMessage(`Falha de conexão serial: ${err?.message || 'Porta cancelada ou indisponível'}.`);
      return false;
    }
  }, [config, updateScaleConfig]);

  // Desconectar porta serial
  const disconnectPort = useCallback(async () => {
    readingLoopActive.current = false;
    try {
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }
      if (serialPortRef.current) {
        await serialPortRef.current.close();
        serialPortRef.current = null;
      }
    } catch (err) {
      console.warn('Erro ao fechar porta serial:', err);
    }
    setIsConnected(false);
    updateScaleConfig({ isConnected: false });
    setStatusMessage('Porta serial desconectada.');
  }, [updateScaleConfig]);

  const netWeight = Math.max(0, currentWeight - tareWeight);

  return {
    isWebSerialSupported: isWebSerialSupported(),
    isConnected,
    isStable,
    currentWeight,
    netWeight,
    tareWeight,
    rawHex: rawFrame.rawHex,
    rawAscii: rawFrame.rawAscii,
    statusMessage,
    connectRealPort,
    disconnectPort,
    applyTare,
    resetZero,
    simulateWeightChange,
    toggleStability,
  };
};
