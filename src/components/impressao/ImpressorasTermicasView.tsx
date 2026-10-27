import React, { useState } from 'react';
import { 
  Printer, Usb, Wifi, Play, CheckCircle2, AlertCircle, 
  RotateCw, Scissors, Volume2, FileText, Utensils, Wine, 
  ShoppingBag, ShieldCheck, Terminal, Copy, Check, ExternalLink,
  Layers, ArrowRight, Settings, Clock, Sparkles, RefreshCw,
  HardDriveDownload, Server
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { 
  SectorPrinterConfig, 
  ThermalPrintJob, 
  PrintSector, 
  ThermalConnectionType 
} from '../../types';
import { 
  generatePdvReceipt, 
  generateKitchenTicket, 
  generateBarTicket, 
  generatePreContaTicket, 
  printThermalViaBrowser, 
  sendEscPosToSerial, 
  checkWebSerialSupport, 
  bytesToHexString,
  ESC_POS_COMMANDS,
  concatByteArrays,
  stringToBytes
} from '../../utils/thermalPrinter';
import { playSuccessBeep, playCashDrawerSound, playErrorBuzz } from '../../utils/peripheralUtils';

export const ImpressorasTermicasView: React.FC = () => {
  const { activeStore, orders, tables, currentUser, peripheralSettings } = useAdega();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'ROUTING' | 'SIMULATOR' | 'SPOOLER' | 'GUIDE'>('ROUTING');

  // Sector Printers State
  const [printers, setPrinters] = useState<{
    pdv: SectorPrinterConfig;
    kitchen: SectorPrinterConfig;
    bar: SectorPrinterConfig;
  }>({
    pdv: {
      sector: 'PDV',
      name: 'Impressora Caixa Principal (Elgin i9)',
      model: 'ESC_POS_80MM',
      connectionType: 'BROWSER_PRINT',
      serialPort: 'COM3',
      baudRate: 9600,
      ipAddress: '192.168.1.150',
      tcpPort: 9100,
      autoCut: true,
      openDrawer: true,
      copies: 1,
      paperWidthMm: 80,
      printDensity: 'HIGH',
      isConnected: true,
      enabled: true,
      autoPrint: true,
      headerTitle: 'ADEGASWG - PDV',
    },
    kitchen: {
      sector: 'COZINHA',
      name: 'Impressora Cozinha (Bematech MP-4200 TH)',
      model: 'ESC_POS_80MM',
      connectionType: 'BROWSER_PRINT',
      serialPort: 'COM4',
      baudRate: 9600,
      ipAddress: '192.168.1.200',
      tcpPort: 9100,
      autoCut: true,
      openDrawer: false,
      copies: 1,
      paperWidthMm: 80,
      printDensity: 'NORMAL',
      isConnected: true,
      enabled: true,
      autoPrint: true,
      headerTitle: 'COZINHA / CHAPA',
    },
    bar: {
      sector: 'BAR',
      name: 'Impressora Bar & Choperia (Epson TM-T20X)',
      model: 'ESC_POS_80MM',
      connectionType: 'BROWSER_PRINT',
      serialPort: 'COM5',
      baudRate: 9600,
      ipAddress: '192.168.1.201',
      tcpPort: 9100,
      autoCut: true,
      openDrawer: false,
      copies: 1,
      paperWidthMm: 80,
      printDensity: 'NORMAL',
      isConnected: true,
      enabled: true,
      autoPrint: true,
      headerTitle: 'BAR & DOSES',
    },
  });

  // Simulator State
  const [selectedTicketType, setSelectedTicketType] = useState<'PDV' | 'COZINHA' | 'BAR' | 'PRE_CONTA' | 'GAVETA'>('PDV');
  const [previewPaperWidth, setPreviewPaperWidth] = useState<80 | 58>(80);
  const [copiedHex, setCopiedHex] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [isSerialPrinting, setIsSerialPrinting] = useState(false);

  // Spooler History State
  const [printJobs, setPrintJobs] = useState<ThermalPrintJob[]>([]);

  const isWebSerialAvailable = checkWebSerialSupport();

  // Mock Sample Order for PDV
  const sampleOrder = orders[0] || {
    id: 'ord-mock',
    code: '#2045',
    createdAt: new Date().toLocaleTimeString('pt-BR'),
    operatorName: currentUser.name || 'Operador Caixa',
    subtotal: 185.00,
    discount: 10.00,
    serviceFee: 0,
    deliveryFee: 0,
    total: 175.00,
    payment: {
      method: 'PIX',
      amount: 175.00,
      pixKey: activeStore.cnpj,
    },
    items: [
      {
        product: {
          id: 'p1',
          name: 'Whisky Black Label 1L',
          price: 180.00,
          costPrice: 110.00,
          category: 'destilados',
          stockQuantity: 12,
          minStockAlert: 5,
          unit: 'garrafa',
          image: '',
          isFractionable: true,
          mlPerBottle: 1000,
          mlPerDose: 50,
          pricePerDose: 22.00,
        },
        quantity: 2,
        isDose: true,
        unitPrice: 22.00,
        totalPrice: 44.00,
        notes: 'Com gelo de coco e limao',
      },
      {
        product: {
          id: 'p2',
          name: 'Cerveja Heineken 330ml',
          price: 11.00,
          costPrice: 6.50,
          category: 'cervejas',
          stockQuantity: 48,
          minStockAlert: 12,
          unit: 'un',
          image: '',
          isFractionable: false,
        },
        quantity: 4,
        isDose: false,
        unitPrice: 11.00,
        totalPrice: 44.00,
      },
      {
        product: {
          id: 'p3',
          name: 'Picanha em Tiras na Chapa',
          price: 87.00,
          costPrice: 45.00,
          category: 'petiscos',
          stockQuantity: 20,
          minStockAlert: 4,
          unit: 'un',
          image: '',
          isFractionable: false,
        },
        quantity: 1,
        isDose: false,
        unitPrice: 87.00,
        totalPrice: 87.00,
        notes: 'Ao ponto com farofa e vinagrete',
      },
    ],
    status: 'COMPLETED',
    orderType: 'PDV_BALCAO',
    nfceKey: '35260912345678000190650010000001011128392109',
    nfceProtocol: '135269988112233',
  };

  // Generate Current Ticket Details
  const getTicketData = () => {
    if (selectedTicketType === 'PDV') {
      return generatePdvReceipt(sampleOrder, activeStore, previewPaperWidth);
    }
    if (selectedTicketType === 'COZINHA') {
      return generateKitchenTicket(
        {
          code: '#2045',
          origin: 'MESA',
          originNumber: 4,
          waiterName: currentUser.name,
          customerName: 'Roberto Alves',
          items: sampleOrder.items || [],
          generalNotes: 'Mesa solicitou entregar tudo junto assim que ficar pronto',
        },
        activeStore,
        previewPaperWidth
      );
    }
    if (selectedTicketType === 'BAR') {
      return generateBarTicket(
        {
          code: '#2045',
          origin: 'MESA',
          originNumber: 4,
          waiterName: currentUser.name,
          customerName: 'Roberto Alves',
          items: sampleOrder.items || [],
        },
        activeStore,
        previewPaperWidth
      );
    }
    if (selectedTicketType === 'PRE_CONTA') {
      return generatePreContaTicket(
        {
          tableOrComandaName: 'Mesa 04 (Salão Principal)',
          number: 4,
          waiterName: currentUser.name,
          items: sampleOrder.items || [],
          subtotal: 175.00,
          serviceFee: 17.50,
          couvertTotal: 20.00,
          total: 212.50,
        },
        activeStore,
        previewPaperWidth
      );
    }

    // GAVETA PULSE
    const drawerBytes = concatByteArrays([
      ESC_POS_COMMANDS.INIT,
      ESC_POS_COMMANDS.DRAWER_PULSE_PIN2,
      stringToBytes(`>>> ABERTURA DE GAVETA DE DINHEIRO (PULSO 24V) <<<\n`),
    ]);
    return {
      text: `>>> PULSO DE ABERTURA DE GAVETA DE DINHEIRO <<<\nComando: ESC p 0 25 250 (Pino 2 RJ12 / 24V)\nStatus: Enviado com Sucesso.`,
      html: `<div class="center bold large" style="margin: 20px 0;">ABERTURA DE GAVETA 24V<br><span style="font-size: 11px;">ESC p 0 25 250</span></div>`,
      escPosBytes: drawerBytes,
    };
  };

  const currentTicket = getTicketData();

  // Print Handlers
  const handlePrintBrowser = async () => {
    playSuccessBeep();
    setActionStatus('Enviando para impressão térmica no navegador...');
    
    // Add to spooler history
    const newJob: ThermalPrintJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      title: `Impressão ${selectedTicketType}`,
      sector: selectedTicketType === 'COZINHA' ? 'COZINHA' : selectedTicketType === 'BAR' ? 'BAR' : 'PDV',
      contentRaw: currentTicket.text,
      paperWidthMm: previewPaperWidth,
      orderCode: sampleOrder.code,
      tableOrComanda: 'Mesa 04',
      status: 'IMPRESSO',
      printerName: selectedTicketType === 'COZINHA' ? printers.kitchen.name : selectedTicketType === 'BAR' ? printers.bar.name : printers.pdv.name,
      reprintCount: 0,
    };
    setPrintJobs((prev) => [newJob, ...prev]);

    await printThermalViaBrowser(currentTicket.html, previewPaperWidth);
    setActionStatus('Comprovante térmico enviado para impressão com sucesso!');
    setTimeout(() => setActionStatus(null), 3500);
  };

  const handlePrintSerial = async () => {
    if (!isWebSerialAvailable) {
      playErrorBuzz();
      alert('A Web Serial API não é suportada neste navegador. Utilize Google Chrome ou Edge para comunicação serial direta.');
      return;
    }

    setIsSerialPrinting(true);
    setActionStatus('Conectando à porta serial da impressora...');

    const result = await sendEscPosToSerial(currentTicket.escPosBytes, 9600);
    setIsSerialPrinting(false);

    if (result.success) {
      playSuccessBeep();
      setActionStatus(result.message);
      
      const newJob: ThermalPrintJob = {
        id: `job-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        title: `Serial ${selectedTicketType}`,
        sector: selectedTicketType === 'COZINHA' ? 'COZINHA' : selectedTicketType === 'BAR' ? 'BAR' : 'PDV',
        contentRaw: currentTicket.text,
        paperWidthMm: previewPaperWidth,
        orderCode: sampleOrder.code,
        tableOrComanda: 'Mesa 04',
        status: 'IMPRESSO',
        printerName: 'Web Serial USB/COM',
        reprintCount: 0,
      };
      setPrintJobs((prev) => [newJob, ...prev]);
    } else {
      playErrorBuzz();
      setActionStatus(result.message);
    }
    setTimeout(() => setActionStatus(null), 4000);
  };

  const handleTriggerDrawerOnly = () => {
    playCashDrawerSound();
    setActionStatus('Pulso elétrico de 24V acionado na gaveta de dinheiro (ESC p 0 25 250)!');
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleReprintJob = async (job: ThermalPrintJob) => {
    playSuccessBeep();
    setActionStatus(`Reimprimindo ${job.title}...`);
    
    // Increment reprint count
    setPrintJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, reprintCount: j.reprintCount + 1 } : j))
    );

    const formattedHtml = `
      <div class="center bold large">*** REIMPRESSÃO (2ª VIA) ***</div>
      <div class="center bold" style="margin: 4px 0;">${job.title}</div>
      <div class="divider"></div>
      <pre style="white-space: pre-wrap; font-family: monospace; font-size: 11px;">${job.contentRaw}</pre>
      <div class="double-divider"></div>
      <div class="center" style="font-size: 9px;">Segunda via gerada em: ${new Date().toLocaleTimeString('pt-BR')}</div>
    `;

    await printThermalViaBrowser(formattedHtml, job.paperWidthMm);
    setActionStatus(`Reimpressão de ${job.title} concluída!`);
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleCopyHex = () => {
    const hex = bytesToHexString(currentTicket.escPosBytes, 256);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(hex);
      setCopiedHex(true);
      setTimeout(() => setCopiedHex(false), 2000);
    }
  };

  const updateSectorPrinter = (sector: 'pdv' | 'kitchen' | 'bar', updates: Partial<SectorPrinterConfig>) => {
    setPrinters((prev) => ({
      ...prev,
      [sector]: { ...prev[sector], ...updates },
    }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-950 overflow-y-auto select-none pb-24 lg:pb-6">
      
      {/* Top Banner Header */}
      <div className="p-3 sm:p-5 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-zinc-100 font-serif flex items-center gap-2 flex-wrap">
                Integração de Impressoras Térmicas
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-sans font-bold uppercase tracking-wider">
                  ESC/POS & Browser
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Roteamento setorizado via navegador para Frente de Caixa (PDV), Cozinha e Bar (80mm & 58mm)
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators & Drawer Shortcut */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
            isWebSerialAvailable 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}>
            <Usb className="w-3.5 h-3.5" />
            <span>Web Serial: {isWebSerialAvailable ? 'Disponível' : 'Nativo Navegador'}</span>
          </div>

          <button
            type="button"
            onClick={handleTriggerDrawerOnly}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors shadow-sm"
            title="Enviar pulso de abertura de 24V para a gaveta de dinheiro acoplada"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Gaveta</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="px-5 bg-zinc-950 border-b border-zinc-800 flex items-center gap-2 shrink-0 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('ROUTING')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'ROUTING'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Roteamento por Setor (PDV, Cozinha, Bar)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SIMULATOR')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'SIMULATOR'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Testador & Bobina Térmica ao Vivo</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SPOOLER')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'SPOOLER'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Fila de Impressão & Reimpressão</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
            {printJobs.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GUIDE')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === 'GUIDE'
              ? 'border-amber-500 text-amber-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Guia de Conexão de Hardware</span>
        </button>
      </div>

      {/* Floating Action Banner Alert */}
      {actionStatus && (
        <div className="bg-amber-500 text-zinc-950 font-bold px-4 py-2 text-xs flex items-center justify-between shadow-md shrink-0 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionStatus}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActionStatus(null)}
            className="text-zinc-950/70 hover:text-zinc-950 text-xs font-black"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0 space-y-6">
        
        {/* =================================================================== */}
        {/* TAB 1: ROTEAMENTO SETORIZADO */}
        {/* =================================================================== */}
        {activeTab === 'ROUTING' && (
          <div className="space-y-6 max-w-6xl mx-auto">
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-4 sm:p-5">
              <h2 className="text-sm font-bold text-zinc-100 mb-1 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Roteamento Inteligente de Impressão por Setor</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Configure impressoras físicas dedicadas para cada ambiente da adega. Ao registrar pedidos em mesas, comandas ou no balcão, o sistema distribui os tickets automaticamente para seus respectivos destinos.
              </p>
            </div>

            {/* Grid of 3 Sector Printers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              
              {/* 1. PDV CAIXA */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-100">Frente de Caixa (PDV)</h3>
                        <span className="text-[10px] text-zinc-400">Cupons, NFC-e e Sangrias</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={printers.pdv.enabled} 
                        onChange={(e) => updateSectorPrinter('pdv', { enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nome do Equipamento:</label>
                      <input 
                        type="text" 
                        value={printers.pdv.name}
                        onChange={(e) => updateSectorPrinter('pdv', { name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Largura Papel:</label>
                        <select 
                          value={printers.pdv.paperWidthMm}
                          onChange={(e) => updateSectorPrinter('pdv', { paperWidthMm: Number(e.target.value) as 80 | 58 })}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                        >
                          <option value={80}>80 mm (Padrão)</option>
                          <option value={58}>58 mm (Compacto)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Conexão:</label>
                        <select 
                          value={printers.pdv.connectionType}
                          onChange={(e) => updateSectorPrinter('pdv', { connectionType: e.target.value as ThermalConnectionType })}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                        >
                          <option value="BROWSER_PRINT">Impressão Navegador</option>
                          <option value="WEB_SERIAL">Web Serial (USB/COM)</option>
                          <option value="NETWORK_TCP">Rede TCP (IP:9100)</option>
                        </select>
                      </div>
                    </div>

                    {printers.pdv.connectionType === 'WEB_SERIAL' && (
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Porta Serial COM:</label>
                        <input 
                          type="text" 
                          value={printers.pdv.serialPort || 'COM3'}
                          onChange={(e) => updateSectorPrinter('pdv', { serialPort: e.target.value })}
                          className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                          placeholder="Ex: COM3 ou /dev/ttyUSB0"
                        />
                      </div>
                    )}

                    {printers.pdv.connectionType === 'NETWORK_TCP' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="col-span-2">
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">IP da Impressora:</label>
                          <input 
                            type="text" 
                            value={printers.pdv.ipAddress || '192.168.1.150'}
                            onChange={(e) => updateSectorPrinter('pdv', { ipAddress: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">Porta RAW:</label>
                          <input 
                            type="number" 
                            value={printers.pdv.tcpPort || 9100}
                            onChange={(e) => updateSectorPrinter('pdv', { tcpPort: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Automations */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.pdv.autoPrint}
                          onChange={(e) => updateSectorPrinter('pdv', { autoPrint: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-blue-500"
                        />
                        <span>Imprimir cupom automaticamente na venda</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.pdv.autoCut}
                          onChange={(e) => updateSectorPrinter('pdv', { autoCut: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-blue-500"
                        />
                        <span>Corte de papel automático (Guilhotina GS V)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.pdv.openDrawer}
                          onChange={(e) => updateSectorPrinter('pdv', { openDrawer: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-blue-500"
                        />
                        <span>Abrir gaveta de dinheiro (Pulso 24V)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketType('PDV');
                      setActiveTab('SIMULATOR');
                    }}
                    className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Testar Impressão do Caixa</span>
                  </button>
                </div>
              </div>

              {/* 2. COZINHA */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <Utensils className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-100">Cozinha & Petiscos</h3>
                        <span className="text-[10px] text-zinc-400">Pratos quentes, porções e chapas</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={printers.kitchen.enabled} 
                        onChange={(e) => updateSectorPrinter('kitchen', { enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nome do Equipamento:</label>
                      <input 
                        type="text" 
                        value={printers.kitchen.name}
                        onChange={(e) => updateSectorPrinter('kitchen', { name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:border-emerald-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Largura Papel:</label>
                        <select 
                          value={printers.kitchen.paperWidthMm}
                          onChange={(e) => updateSectorPrinter('kitchen', { paperWidthMm: Number(e.target.value) as 80 | 58 })}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                        >
                          <option value={80}>80 mm (Padrão)</option>
                          <option value={58}>58 mm (Compacto)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Conexão:</label>
                        <select 
                          value={printers.kitchen.connectionType}
                          onChange={(e) => updateSectorPrinter('kitchen', { connectionType: e.target.value as ThermalConnectionType })}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                        >
                          <option value="BROWSER_PRINT">Impressão Navegador</option>
                          <option value="NETWORK_TCP">Rede TCP (IP:9100)</option>
                          <option value="WEB_SERIAL">Web Serial (USB/COM)</option>
                        </select>
                      </div>
                    </div>

                    {printers.kitchen.connectionType === 'NETWORK_TCP' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="col-span-2">
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">IP Cozinha (Rede):</label>
                          <input 
                            type="text" 
                            value={printers.kitchen.ipAddress || '192.168.1.200'}
                            onChange={(e) => updateSectorPrinter('kitchen', { ipAddress: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">Porta:</label>
                          <input 
                            type="number" 
                            value={printers.kitchen.tcpPort || 9100}
                            onChange={(e) => updateSectorPrinter('kitchen', { tcpPort: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Automations */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.kitchen.autoPrint}
                          onChange={(e) => updateSectorPrinter('kitchen', { autoPrint: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-emerald-500"
                        />
                        <span>Imprimir comanda ao lançar em mesa/comanda</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.kitchen.autoCut}
                          onChange={(e) => updateSectorPrinter('kitchen', { autoCut: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-emerald-500"
                        />
                        <span>Corte total de comanda (Guilhotina)</span>
                      </label>
                      <div className="text-[11px] text-emerald-400/90 font-medium pt-1">
                        ✓ Filtra apenas petiscos, porções e alimentos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketType('COZINHA');
                      setActiveTab('SIMULATOR');
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Testar Comanda de Cozinha</span>
                  </button>
                </div>
              </div>

              {/* 3. BAR & DOSES */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <Wine className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-zinc-100">Bar, Doses & Chopp</h3>
                        <span className="text-[10px] text-zinc-400">Whiskies (50ml), drinks e balcão</span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={printers.bar.enabled} 
                        onChange={(e) => updateSectorPrinter('bar', { enabled: e.target.checked })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nome do Equipamento:</label>
                      <input 
                        type="text" 
                        value={printers.bar.name}
                        onChange={(e) => updateSectorPrinter('bar', { name: e.target.value })}
                        className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:border-amber-500 outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Largura Papel:</label>
                        <select 
                          value={printers.bar.paperWidthMm}
                          onChange={(e) => updateSectorPrinter('bar', { paperWidthMm: Number(e.target.value) as 80 | 58 })}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                        >
                          <option value={80}>80 mm (Padrão)</option>
                          <option value={58}>58 mm (Compacto)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-zinc-400 font-medium block mb-1">Conexão:</label>
                        <select 
                          value={printers.bar.connectionType}
                          onChange={(e) => updateSectorPrinter('bar', { connectionType: e.target.value as ThermalConnectionType })}
                          className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                        >
                          <option value="BROWSER_PRINT">Impressão Navegador</option>
                          <option value="NETWORK_TCP">Rede TCP (IP:9100)</option>
                          <option value="WEB_SERIAL">Web Serial (USB/COM)</option>
                        </select>
                      </div>
                    </div>

                    {printers.bar.connectionType === 'NETWORK_TCP' && (
                      <div className="grid grid-cols-3 gap-1.5">
                        <div className="col-span-2">
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">IP Bar (Rede):</label>
                          <input 
                            type="text" 
                            value={printers.bar.ipAddress || '192.168.1.201'}
                            onChange={(e) => updateSectorPrinter('bar', { ipAddress: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-zinc-400 font-medium block mb-1">Porta:</label>
                          <input 
                            type="number" 
                            value={printers.bar.tcpPort || 9100}
                            onChange={(e) => updateSectorPrinter('bar', { tcpPort: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {/* Automations */}
                    <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.bar.autoPrint}
                          onChange={(e) => updateSectorPrinter('bar', { autoPrint: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-amber-500"
                        />
                        <span>Imprimir comanda ao lançar bebidas/doses</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={printers.bar.autoCut}
                          onChange={(e) => updateSectorPrinter('bar', { autoCut: e.target.checked })}
                          className="rounded border-zinc-700 bg-zinc-950 text-amber-500"
                        />
                        <span>Corte total de comanda (Guilhotina)</span>
                      </label>
                      <div className="text-[11px] text-amber-400/90 font-medium pt-1">
                        ✓ Destaque para doses fracionadas (50ml) e copos com gelo
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketType('BAR');
                      setActiveTab('SIMULATOR');
                    }}
                    className="w-full py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Testar Comanda de Bar</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: SIMULADOR & BOBINA TÉRMICA AO VIVO */}
        {/* =================================================================== */}
        {activeTab === 'SIMULATOR' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Controls Panel (Left Col) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Configurar Teste de Impressão</span>
                </h3>

                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">
                    Selecione o Modelo de Comprovante:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'PDV', label: '1. Cupom de Venda / NFC-e (Caixa)', icon: ShoppingBag, color: 'text-blue-400' },
                      { id: 'COZINHA', label: '2. Comanda de Cozinha (Mesa 04)', icon: Utensils, color: 'text-emerald-400' },
                      { id: 'BAR', label: '3. Comanda de Bar & Doses (Mesa 04)', icon: Wine, color: 'text-amber-400' },
                      { id: 'PRE_CONTA', label: '4. Pré-Conta de Mesa (Conferência)', icon: FileText, color: 'text-purple-400' },
                      { id: 'GAVETA', label: '5. Pulso Gaveta 24V (ESC p 0 25 250)', icon: Scissors, color: 'text-rose-400' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSel = selectedTicketType === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSelectedTicketType(item.id as any)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                            isSel
                              ? 'bg-amber-500/15 border border-amber-500/40 text-zinc-100 shadow-sm'
                              : 'bg-zinc-950 border border-zinc-800 text-zinc-300 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className={`w-4 h-4 ${item.color}`} />
                            <span>{item.label}</span>
                          </div>
                          {isSel && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Paper Width Selector */}
                <div>
                  <label className="text-xs text-zinc-400 font-medium block mb-1.5">Largura da Bobina:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewPaperWidth(80)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        previewPaperWidth === 80
                          ? 'bg-amber-500 text-zinc-950 border-amber-400'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                      }`}
                    >
                      80 mm (Padrão 48 col)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewPaperWidth(58)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        previewPaperWidth === 58
                          ? 'bg-amber-500 text-zinc-950 border-amber-400'
                          : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-850'
                      }`}
                    >
                      58 mm (Mini 32 col)
                    </button>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={handlePrintBrowser}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-zinc-950 font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir Agora pelo Navegador ({previewPaperWidth}mm)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSerial}
                    disabled={isSerialPrinting}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Usb className="w-4 h-4 text-emerald-400" />
                    <span>{isSerialPrinting ? 'Transmitindo...' : 'Enviar Direto via Web Serial (USB/COM)'}</span>
                  </button>
                </div>
              </div>

              {/* ESC/POS Hex Inspector */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    <span>Bytes ESC/POS Brutos (Hexadecimal)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyHex}
                    className="text-[11px] text-zinc-400 hover:text-zinc-100 flex items-center gap-1"
                  >
                    {copiedHex ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHex ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-[10px] text-amber-400/90 leading-relaxed overflow-x-auto max-h-24">
                  {bytesToHexString(currentTicket.escPosBytes, 120)}
                </div>
              </div>
            </div>

            {/* Realistic Thermal Paper Bobina Preview (Right Col) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="text-center mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Pré-visualização da Bobina Térmica ({previewPaperWidth}mm)
                </span>
              </div>

              {/* Styled Paper Container with Perforations */}
              <div 
                className={`bg-stone-50 text-stone-900 p-6 rounded-sm shadow-2xl font-mono text-[11px] leading-tight select-all relative border-t-8 border-b-8 border-dashed border-stone-300 transition-all ${
                  previewPaperWidth === 80 ? 'w-[320px]' : 'w-[240px]'
                }`}
                style={{
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
                }}
              >
                {/* Paper Header Notch Effect */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-2 bg-zinc-950 rounded-b-md" />

                {/* Render HTML Content as Authentic Thermal Print */}
                <div dangerouslySetInnerHTML={{ __html: currentTicket.html }} />

                {/* Paper Tear / Cutting Guide */}
                <div className="mt-4 pt-3 border-t-2 border-dashed border-stone-400 text-center text-[9px] text-stone-500 uppercase tracking-widest font-sans font-bold">
                  ✂ Corte de Guilhotina Automático
                </div>
              </div>
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: FILA DE IMPRESSÃO & REIMPRESSÃO (SPOOLER) */}
        {/* =================================================================== */}
        {activeTab === 'SPOOLER' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>Histórico de Impressão & Spooler de Comandas</span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Reimprima com 1 clique qualquer comanda ou comprovante caso a bobina da cozinha ou do bar tenha acabado.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPrintJobs([]);
                  setActionStatus('Fila de impressão limpa!');
                  setTimeout(() => setActionStatus(null), 2000);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Limpar Histórico
              </button>
            </div>

            {printJobs.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 bg-zinc-900/40 rounded-2xl border border-zinc-850">
                Nenhuma impressão registrada nesta sessão.
              </div>
            ) : (
              <div className="space-y-2.5">
                {printJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        job.sector === 'COZINHA' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : job.sector === 'BAR'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}>
                        {job.sector === 'COZINHA' ? <Utensils className="w-4 h-4" /> : job.sector === 'BAR' ? <Wine className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-zinc-100">{job.title}</span>
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                            {job.tableOrComanda}
                          </span>
                          {job.reprintCount > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              {job.reprintCount}ª Reimpressão
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span>{job.timestamp}</span>
                          <span>•</span>
                          <span>{job.printerName} ({job.paperWidthMm}mm)</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">Status: {job.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleReprintJob(job)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-zinc-950 border border-amber-500/30 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reimprimir Comanda</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: GUIA DE CONEXÃO DE HARDWARE */}
        {/* =================================================================== */}
        {activeTab === 'GUIDE' && (
          <div className="max-w-4xl mx-auto space-y-5">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Como Funciona a Impressão Térmica Direta pelo Navegador</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Printer className="w-4 h-4" />
                    <span>Modo 1: Impressão Térmica Limpa (Iframe)</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Funciona em <b>qualquer navegador e sistema operacional</b> (Windows, Mac, Linux, Android e iOS). O sistema cria um fluxo isolado configurado com estilo de 80mm ou 58mm, eliminando cabeçalhos de URL, datas e rodapés de navegador.
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Dica: Ative a opção "Margens: Nenhuma" na caixa de diálogo do Chrome/Edge para precisão milimétrica.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Usb className="w-4 h-4" />
                    <span>Modo 2: Web Serial API (USB / Portas COM)</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    Permite ao navegador comunicar <b>diretamente com a porta serial física</b> (ex: COM1, COM3 ou portas USB CDC) sem necessidade de drivers complexos do Windows ou Spooler, transmitindo comandos binários ESC/POS puros com corte de papel e pulso de gaveta.
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Compatível nativamente com Google Chrome, Microsoft Edge e Opera.
                  </p>
                </div>
              </div>

              {/* Supported Models */}
              <div className="pt-3 border-t border-zinc-800 space-y-2 text-xs">
                <div className="font-bold text-zinc-200">Equipamentos e Marcas 100% Homologados:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Elgin i9 / i7 / i8',
                    'Bematech MP-4200 TH / MP-100',
                    'Epson TM-T20 / TM-T20X / TM-T88',
                    'Daruma DR800 / DR700',
                    'Control iD Print iD',
                    'POS-58 & POS-80 USB/Serial',
                    'RawBT (Android Bluetooth / USB)',
                  ].map((brand) => (
                    <span key={brand} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-[11px] font-medium border border-zinc-700">
                      ✓ {brand}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
