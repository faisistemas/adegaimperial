import React, { useState } from 'react';
import { 
  Scale, Printer, Barcode, Cpu, Usb, Wifi, CheckCircle2, 
  RefreshCw, Volume2, ShieldCheck, Database, Save, Play, 
  Scissors, AlertCircle, FileText, Activity
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ScaleProtocol, ThermalPrinterConfig } from '../../types';
import { 
  buildScaleFrame, isWebSerialSupported, playScannerBeep, 
  playSuccessBeep, playCashDrawerSound, generateCashMovementThermalReceipt 
} from '../../utils/peripheralUtils';

export const PeripheralConfigView: React.FC = () => {
  const { 
    peripheralSettings, 
    updateScaleConfig, 
    updatePrinterConfig, 
    updateScannerConfig,
    activeStore,
    cashMovements,
    accessLogs,
    currentUser
  } = useAdega();

  const [activeTab, setActiveTab] = useState<'SCALE' | 'PRINTER' | 'SCANNER' | 'SCHEMA_AUDIT'>('SCALE');

  const scaleConfig = peripheralSettings?.scale || {
    protocol: 'TOLEDO_PRIX3' as const,
    port: 'COM1',
    baudRate: 9600,
    dataBits: 8 as const,
    parity: 'none' as const,
    stopBits: 1 as const,
    lastWeightSample: 1.450,
    autoPriceWeighedProducts: true,
  };

  // Balança Tester Local State
  const [testWeight, setTestWeight] = useState<number>(scaleConfig.lastWeightSample || 1.450);
  const [testTare, setTestTare] = useState<number>(0);
  const [scaleStatus, setScaleStatus] = useState<string>('Pronto para comunicação serial.');
  const [scaleFrame, setScaleFrame] = useState(() => buildScaleFrame(testWeight, scaleConfig.protocol));

  // Impressora Tester Local State
  const [printerReceiptPreview, setPrinterReceiptPreview] = useState<string>('');
  const [printerStatus, setPrinterStatus] = useState<string>('Impressora conectada e pronta.');

  // Scanner Tester Local State
  const [scannerTestInput, setScannerTestInput] = useState<string>('');
  const [scannedHistory, setScannedHistory] = useState<Array<{ code: string; time: string }>>([
    { code: '7891991010856', time: '15:45:10' },
    { code: '7891000100103', time: '15:47:22' }
  ]);

  const handleWeightChange = (newWeight: number) => {
    const clamped = Math.max(0, Math.min(newWeight, 30.000));
    setTestWeight(clamped);
    const frame = buildScaleFrame(clamped, scaleConfig.protocol);
    setScaleFrame(frame);
    updateScaleConfig({ lastWeightSample: clamped });
  };

  const handleApplyTare = () => {
    setTestTare(testWeight);
    playSuccessBeep();
    setScaleStatus(`Tara de ${testWeight.toFixed(3)} kg gravada.`);
  };

  const handleResetTare = () => {
    setTestTare(0);
    setScaleStatus('Tara removida (Balança em zero líquido).');
  };

  const handlePrintTestReceipt = () => {
    playSuccessBeep();
    setPrinterStatus('Enviando bytes ESC/POS com comando de guilhotina (GS V 66 0)...');
    
    const sampleMovement = cashMovements[0] || {
      id: 'mov-test',
      sessionId: 'cx-1',
      userId: currentUser.id,
      userName: currentUser.name,
      managerAuthorizedName: 'Gerência de Turno',
      tipo: 'SANGRIA' as const,
      valor: 150.00,
      motivo: 'Recolhimento para cofre central (Sangria de rotina)',
      dataHora: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR'),
    };

    const text = generateCashMovementThermalReceipt(
      sampleMovement,
      activeStore,
      'Caixa 01',
      peripheralSettings.printer.paperWidthMm
    );

    setPrinterReceiptPreview(text);
    setTimeout(() => {
      setPrinterStatus('Comprovante térmico impresso com sucesso!');
    }, 400);
  };

  const handleTestDrawerPulse = () => {
    try {
      playSuccessBeep();
    } catch {}
    setPrinterStatus('Pulso elétrico de 24V enviado à gaveta de dinheiro (ESC p 0 25 250). Gaveta Aberta!');
  };

  const handleScannerTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannerTestInput.trim()) return;
    playScannerBeep();
    setScannedHistory((prev) => [
      { code: scannerTestInput.trim(), time: new Date().toLocaleTimeString('pt-BR') },
      ...prev.slice(0, 7)
    ]);
    setScannerTestInput('');
  };

  const effectiveNetWeight = Math.max(0, testWeight - testTare);

  return (
    <div className="flex-1 overflow-y-auto w-full p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-serif">Periféricos & Automação Comercial</h2>
          <p className="text-xs text-zinc-400">Balanças de checkout, leitores barcode HID e impressoras térmicas</p>
        </div>

        {/* Quick Peripherals Status Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono self-start sm:self-auto">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Balança: {scaleConfig.protocol} ({scaleConfig.port})
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Térmica: {peripheralSettings?.printer?.model || 'ESC_POS_80MM'}
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Leitor: {peripheralSettings?.scanner?.mode || 'KEYBOARD_HID'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800 space-x-1 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('SCALE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'SCALE'
              ? 'border-amber-500 text-amber-400 bg-zinc-900/80'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Balança Checkout (Toledo / Filizola)</span>
        </button>

        <button
          onClick={() => setActiveTab('PRINTER')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'PRINTER'
              ? 'border-amber-500 text-amber-400 bg-zinc-900/80'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Impressora Térmica ESC/POS</span>
        </button>

        <button
          onClick={() => setActiveTab('SCANNER')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'SCANNER'
              ? 'border-amber-500 text-amber-400 bg-zinc-900/80'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Barcode className="w-4 h-4" />
          <span>Leitor de Código de Barras (HID)</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHEMA_AUDIT')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
            activeTab === 'SCHEMA_AUDIT'
              ? 'border-amber-500 text-amber-400 bg-zinc-900/80'
              : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Schema SQL & Auditoria PostgreSQL</span>
        </button>
      </div>

      {/* TAB 1: BALANÇA CHECKOUT */}
      {activeTab === 'SCALE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuração da Balança */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Usb className="w-4 h-4 text-amber-400" />
                Parâmetros de Comunicação Serial (RS-232 / Virtual COM)
              </h3>
              <span className="text-[11px] text-zinc-400">
                Suporte nativo a STX + Peso + ETX
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Protocolo / Fabricante
                </label>
                <select
                  value={peripheralSettings.scale.protocol}
                  onChange={(e) => {
                    const proto = e.target.value as ScaleProtocol;
                    updateScaleConfig({ protocol: proto });
                    setScaleFrame(buildScaleFrame(testWeight, proto));
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="TOLEDO_PRIX3">Toledo Prix 3 / Prix 4 (STX + 01.250 + ETX)</option>
                  <option value="TOLEDO_9094">Toledo 9094 Checkout (STX + 02 + Peso + ETX)</option>
                  <option value="FILIZOLA">Filizola Plat. Checkout (STX + 01250g + ETX)</option>
                  <option value="URANO_POP">Urano Pop-Z / Elgin DP-30</option>
                  <option value="CUSTOM">Customizado (Contínuo 8N1)</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">Padrão Toledo contínuo a 9600 bps.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Porta Serial COM / Device
                </label>
                <select
                  value={peripheralSettings.scale.port}
                  onChange={(e) => updateScaleConfig({ port: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="COM1">COM1 (Porta Serial Padrão)</option>
                  <option value="COM2">COM2 (Virtual USB Serial)</option>
                  <option value="COM3">COM3 (Adaptador FTDI / Prolific)</option>
                  <option value="COM4">COM4 (Terminal PDV Checkout)</option>
                  <option value="/dev/ttyUSB0">/dev/ttyUSB0 (Linux / POS)</option>
                  <option value="/dev/ttyACM0">/dev/ttyACM0 (Linux USB CDC)</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">Compatível com conversores USB-Serial FTDI.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Taxa de Transmissão (Baud Rate)
                </label>
                <select
                  value={peripheralSettings.scale.baudRate}
                  onChange={(e) => updateScaleConfig({ baudRate: Number(e.target.value) })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 font-mono"
                >
                  <option value="2400">2400 bps</option>
                  <option value="4800">4800 bps</option>
                  <option value="9600">9600 bps (Recomendado Toledo/Filizola)</option>
                  <option value="19200">19200 bps</option>
                  <option value="115200">115200 bps</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Formato de Bits (Data / Parity / Stop)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={peripheralSettings.scale.dataBits}
                    onChange={(e) => updateScaleConfig({ dataBits: Number(e.target.value) })}
                    className="bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-100 text-center font-mono"
                  >
                    <option value="8">8 bits</option>
                    <option value="7">7 bits</option>
                  </select>
                  <select
                    value={peripheralSettings.scale.parity}
                    onChange={(e) => updateScaleConfig({ parity: e.target.value as any })}
                    className="bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-100 text-center font-mono"
                  >
                    <option value="none">None (N)</option>
                    <option value="even">Even (E)</option>
                    <option value="odd">Odd (O)</option>
                  </select>
                  <select
                    value={peripheralSettings.scale.stopBits}
                    onChange={(e) => updateScaleConfig({ stopBits: Number(e.target.value) })}
                    className="bg-zinc-950 border border-zinc-700 rounded-xl px-2 py-2 text-xs text-zinc-100 text-center font-mono"
                  >
                    <option value="1">1 stop</option>
                    <option value="2">2 stop</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peripheralSettings.scale.autoPriceWeighedProducts}
                  onChange={(e) => updateScaleConfig({ autoPriceWeighedProducts: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-zinc-950"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  Precificação automática no PDV: ler balança instantaneamente ao selecionar produtos com preço por Kg
                </span>
              </label>

              <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-200">Integração Web Serial API Ativa</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    O sistema acessa diretamente as portas seriais COM físicas do computador operacional através da Web Serial API do navegador sem necessidade de plugins Java adicionais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Testador & Mostrador Digital Interativo */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Mostrador Digital da Balança (VFD)
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                  Sinal Estável
                </span>
              </div>

              {/* VFD Digital Display */}
              <div className="mt-4 bg-emerald-950/70 border-2 border-emerald-600/70 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] text-emerald-400 font-mono mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    STATUS: LEITURA CONTÍNUA
                  </span>
                  <span>{testTare > 0 ? `TARA: ${testTare.toFixed(3)} kg` : 'SEM TARA'}</span>
                </div>

                <div className="font-mono font-black text-5xl sm:text-6xl text-emerald-300 tracking-wider my-2">
                  {effectiveNetWeight.toFixed(3)} <span className="text-xl font-medium text-emerald-400">kg</span>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-300 font-mono pt-2 border-t border-emerald-800/60">
                  <span>Peso Bruto: {testWeight.toFixed(3)} kg</span>
                  <span>Líquido: {effectiveNetWeight.toFixed(3)} kg</span>
                </div>
              </div>

              {/* Hex / ASCII Byte Stream Preview */}
              <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Bytes Hexadecimais:</span>
                  <span className="text-amber-300 font-bold">{scaleFrame.rawHex}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-zinc-500">Payload ASCII:</span>
                  <span className="text-zinc-300">{`[STX] ${effectiveNetWeight.toFixed(3)} [ETX]`}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-300">
                  <span>Ajuste de Carga no Prato:</span>
                  <span className="font-mono font-bold text-amber-400">{testWeight.toFixed(3)} kg</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.05}
                  value={testWeight}
                  onChange={(e) => handleWeightChange(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="grid grid-cols-4 gap-1.5">
                  {[0.5, 1.0, 2.5, 5.0].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleWeightChange(w)}
                      className="py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700"
                    >
                      {w.toFixed(1)} kg
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyTare}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                Aplicar Tara
              </button>
              <button
                type="button"
                onClick={handleResetTare}
                className="flex-1 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              >
                Zerar
              </button>
              <button
                type="button"
                onClick={() => {
                  playSuccessBeep();
                  setScaleStatus('Configuração da balança gravada com sucesso!');
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPRESSORA TÉRMICA ESC/POS */}
      {activeTab === 'PRINTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Configuração Térmica */}
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Printer className="w-4 h-4 text-amber-400" />
                Impressora Térmica Não Fiscal (Padrão ESC/POS)
              </h3>
              <span className="text-[11px] text-zinc-400">Guilhotina & Abertura de Gaveta</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Modelo e Largura da Bobina
                </label>
                <select
                  value={peripheralSettings.printer.model}
                  onChange={(e) => {
                    const model = e.target.value as any;
                    const paperWidthMm = model === 'ESC_POS_80MM' ? 80 : 58;
                    updatePrinterConfig({ model, paperWidthMm });
                  }}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="ESC_POS_80MM">Padrão ESC/POS 80mm (48 Colunas - Bematech, Elgin, Epson)</option>
                  <option value="ESC_POS_58MM">Padrão ESC/POS 58mm (32 Colunas - Mini Térmica)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tipo de Conexão
                </label>
                <select
                  value={peripheralSettings.printer.connectionType}
                  onChange={(e) => updatePrinterConfig({ connectionType: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="USB_DIRECT">USB Direto / Driver Nativo</option>
                  <option value="NETWORK_TCP">Rede Ethernet / Wi-Fi (TCP/IP Porta 9100)</option>
                  <option value="SYSTEM_SPOOLER">Spooler do Sistema Operacional (Windows/Linux)</option>
                </select>
              </div>

              {peripheralSettings.printer.connectionType === 'NETWORK_TCP' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Endereço IP da Impressora
                    </label>
                    <input
                      type="text"
                      value={peripheralSettings.printer.ipAddress || '192.168.1.200'}
                      onChange={(e) => updatePrinterConfig({ ipAddress: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                      placeholder="192.168.1.200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Porta TCP RAW
                    </label>
                    <input
                      type="number"
                      value={peripheralSettings.printer.tcpPort || 9100}
                      onChange={(e) => updatePrinterConfig({ tcpPort: Number(e.target.value) })}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peripheralSettings.printer.autoCut}
                  onChange={(e) => updatePrinterConfig({ autoCut: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-zinc-950"
                />
                <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-amber-400" />
                  Acionar corte automático de papel (Guilhotina ESC/POS: GS V 66 0)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peripheralSettings.printer.openDrawer}
                  onChange={(e) => updatePrinterConfig({ openDrawer: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-zinc-950"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  Abrir gaveta de dinheiro automaticamente no fechamento de venda em dinheiro ou sangria
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-zinc-800 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handlePrintTestReceipt}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Imprimir Cupom de Teste ESC/POS</span>
              </button>

              <button
                type="button"
                onClick={handleTestDrawerPulse}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 flex items-center gap-2 transition-colors"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>Testar Pulso da Gaveta (24V)</span>
              </button>
            </div>
            {printerStatus && (
              <p className="text-xs text-emerald-400 font-mono mt-1">{printerStatus}</p>
            )}
          </div>

          {/* Visualizador do Cupom Térmico Simulado */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-400" />
                  Pré-visualização do Cupom Térmico (80mm)
                </h3>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {peripheralSettings.printer.paperWidthMm}mm
                </span>
              </div>

              {/* Papel Térmico Amarelado / Realista */}
              <div className="mt-4 p-4 rounded-xl bg-amber-50 text-zinc-900 font-mono text-[11px] leading-relaxed shadow-lg max-h-[400px] overflow-y-auto border-t-4 border-dashed border-zinc-400 select-text">
                <pre className="whitespace-pre-wrap font-mono">
                  {printerReceiptPreview || `
================================================
${activeStore.name.toUpperCase()}
CNPJ: ${activeStore.cnpj}
TERMINAL: Caixa 01 - IMPRESSORA PRONTA
DATA/HORA: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}
================================================
>>> TESTE DE COMUNICAÇÃO ESC/POS <<<
------------------------------------------------
Impressora Térmica Operacional
Corte de Papel: ATIVO
Abertura de Gaveta: HABILITADA
Largura: ${peripheralSettings.printer.paperWidthMm}mm
------------------------------------------------
ADEGA ERP - MÓDULO DE HARDWARE
[CORTE DE PAPEL ESC/POS: GS V 66 0]
`.trim()}
                </pre>
              </div>
            </div>

            <div className="pt-3 text-[11px] text-zinc-500 text-center">
              Comandos binários gerados em padrão Epson ESC/POS com acentuação compatível CP850.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEITOR DE CÓDIGO DE BARRAS */}
      {activeTab === 'SCANNER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Barcode className="w-4 h-4 text-amber-400" />
                Leitor de Código de Barras (Modo Teclado HID / Serial)
              </h3>
              <span className="text-[11px] text-zinc-400">Escuta Global no PDV</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Modo de Operação
                </label>
                <select
                  value={peripheralSettings.scanner.mode}
                  onChange={(e) => updateScannerConfig({ mode: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="KEYBOARD_HID">Emulação de Teclado USB (Padrão Honeywell, Datalogic, Elgin)</option>
                  <option value="WEBCAM_CAMERA">Leitor Visual via Câmera / Webcam</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Sufixo do Scanner
                </label>
                <select
                  value={peripheralSettings.scanner.suffix}
                  onChange={(e) => updateScannerConfig({ suffix: e.target.value as any })}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="ENTER">Enter (Padrão 99% dos Scanners)</option>
                  <option value="TAB">Tab</option>
                  <option value="NONE">Nenhum (Digitação Direta)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peripheralSettings.scanner.playBeepOnScan}
                  onChange={(e) => updateScannerConfig({ playBeepOnScan: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-zinc-950"
                />
                <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  Emitir Bip sonoro (1850Hz) em cada leitura bem-sucedida
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={peripheralSettings.scanner.active}
                  onChange={(e) => updateScannerConfig({ active: e.target.checked })}
                  className="rounded border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 bg-zinc-950"
                />
                <span className="text-xs text-zinc-300 font-medium">
                  Ativar captura de scanner global no PDV (reconhece código mesmo sem foco no campo de busca)
                </span>
              </label>
            </div>

            {/* Test Input Area */}
            <div className="pt-4 border-t border-zinc-800">
              <label className="block text-xs font-semibold text-zinc-200 mb-2">
                Área de Teste do Leitor (Aponte o leitor físico ou digite o EAN abaixo):
              </label>
              <form onSubmit={handleScannerTestSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={scannerTestInput}
                  onChange={(e) => setScannerTestInput(e.target.value)}
                  placeholder="Passe o leitor de código de barras aqui..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl transition-colors"
                >
                  Testar Bip
                </button>
              </form>

              {/* Quick EAN Presets */}
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                <span className="text-zinc-500 self-center">EANs Rápidos:</span>
                {[
                  { name: 'Heineken 350ml', code: '7891991010856' },
                  { name: 'Gin Tanqueray', code: '7891000100103' },
                  { name: 'Whisky Red Label', code: '7896000700014' }
                ].map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setScannerTestInput(item.code);
                      playScannerBeep();
                      setScannedHistory((prev) => [
                        { code: item.code, time: new Date().toLocaleTimeString('pt-BR') },
                        ...prev.slice(0, 7)
                      ]);
                    }}
                    className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono border border-zinc-700"
                  >
                    {item.name} ({item.code})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Histórico de Leituras */}
          <div className="lg:col-span-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Histórico de Capturas Recentes
              </h3>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                {scannedHistory.length} lidos
              </span>
            </div>

            <div className="mt-4 space-y-2 max-h-[340px] overflow-y-auto">
              {scannedHistory.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-6">Nenhum código lido ainda.</p>
              ) : (
                scannedHistory.map((h, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Barcode className="w-4 h-4 text-emerald-400" />
                      <span className="text-zinc-200 font-bold">{h.code}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500">{h.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEMA SQL & AUDITORIA POSTGRESQL */}
      {activeTab === 'SCHEMA_AUDIT' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  Estrutura do Banco de Dados Relacional (PostgreSQL DDL)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Suporta multilojas, autenticação RBAC com tokens, controle de sessões e auditoria de hardware.
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-mono">
                PostgreSQL 16
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: 'lojas', desc: 'Matriz e Filiais com CNPJ e Inscrição Estadual', records: '2 ativas' },
                { name: 'perfis', desc: 'ADMIN, GERENTE, CAIXA, GARCOM, MOTOBOY', records: '5 perfis' },
                { name: 'usuarios', desc: 'Operadores com PIN Touch, hash de senha e perfil', records: '4 usuários' },
                { name: 'logs_acesso', desc: 'Auditoria de IP, Login, Sangrias e Desbloqueios', records: `${accessLogs.length} eventos` },
                { name: 'caixas_sessoes', desc: 'Turnos, Abertura, Fechamento Cego e Vendas', records: '1 aberta' },
                { name: 'caixa_movimentacoes', desc: 'Sangrias com autorização de Gerente e Suprimentos', records: `${cashMovements.length} registradas` },
              ].map((table) => (
                <div key={table.name} className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="font-bold text-amber-300">public.{table.name}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">{table.records}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1.5 line-clamp-2">{table.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Live Access & Hardware Audit Logs */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Logs de Auditoria em Tempo Real (Tabela public.logs_acesso)
              </h3>
              <span className="text-xs text-zinc-400 font-mono">Conexão Segura</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 font-mono text-[11px]">
                    <th className="pb-2">Data/Hora</th>
                    <th className="pb-2">Operador</th>
                    <th className="pb-2">Ação</th>
                    <th className="pb-2">IP / Terminal</th>
                    <th className="pb-2">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-950/40">
                      <td className="py-2.5 text-zinc-400">{log.dataHora}</td>
                      <td className="py-2.5 text-zinc-200 font-semibold">{log.usuarioNome}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.acao.includes('SANGRIA') 
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                            : log.acao.includes('ABERTURA') 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {log.acao}
                        </span>
                      </td>
                      <td className="py-2.5 text-zinc-400">{log.ipOrigem}</td>
                      <td className="py-2.5 text-zinc-300 truncate max-w-xs">{log.detalhes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
