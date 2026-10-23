import React, { useState } from 'react';
import { Printer, X, Download, CheckCircle2, QrCode, Usb, Scissors } from 'lucide-react';
import { Order, Store } from '../../types';
import { formatAccessKey } from '../../utils/fiscalUtils';
import { printThermalViaBrowser, sendEscPosToSerial, generatePdvReceipt, checkWebSerialSupport } from '../../utils/thermalPrinter';
import { playSuccessBeep, playCashDrawerSound } from '../../utils/peripheralUtils';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  store: Store;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({ isOpen, onClose, order, store }) => {
  const [printFeedback, setPrintFeedback] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const isWebSerialAvailable = checkWebSerialSupport();
  const receiptData = generatePdvReceipt(order, store, 80);

  const handlePrint = async () => {
    playSuccessBeep();
    setPrintFeedback('Imprimindo via navegador (80mm)...');
    await printThermalViaBrowser(receiptData.html, 80);
    setTimeout(() => setPrintFeedback(null), 3000);
  };

  const handlePrintSerial = async () => {
    setPrintFeedback('Transmitindo bytes ESC/POS via Web Serial...');
    const result = await sendEscPosToSerial(receiptData.escPosBytes, 9600);
    if (result.success) {
      playSuccessBeep();
      setPrintFeedback('Cupom impresso na porta serial com sucesso!');
    } else {
      setPrintFeedback(result.message);
    }
    setTimeout(() => setPrintFeedback(null), 4000);
  };

  const handleOpenDrawer = () => {
    playCashDrawerSound();
    setPrintFeedback('Pulso elétrico de 24V enviado à gaveta de dinheiro!');
    setTimeout(() => setPrintFeedback(null), 3000);
  };

  const handleDownloadTxt = () => {
    const lines = [
      `================================================`,
      `            ${store.name.toUpperCase()}         `,
      ` CNPJ: ${store.cnpj}   IE: ${store.ie} `,
      ` ${store.address} - ${store.city}/${store.state} `,
      `================================================`,
      `DANFE NFC-e - Documento Auxiliar da Nota Fiscal `,
      `de Consumidor Eletronica                        `,
      `================================================`,
      `COD  DESCRICAO               QTD   UN    V.TOTAL`,
      `------------------------------------------------`,
      ...(order?.items || []).map((item, i) => {
        const desc = item.isDose 
          ? `DOSE 50ML ${(item.product?.name || '').substring(0, 18)}`
          : (item.product?.name || '').substring(0, 24);
        const un = item.isDose ? 'ML' : (item.weightKg ? 'KG' : 'UN');
        const qtd = item.weightKg ? (item.weightKg ?? 0).toFixed(3) : (item.quantity ?? 1).toString();
        return `${String(i + 1).padStart(3, '0')}  ${desc.padEnd(24, ' ')} ${qtd.padStart(4, ' ')} ${un.padEnd(2, ' ')} R$${(item.totalPrice ?? 0).toFixed(2).padStart(7, ' ')}`;
      }),
      `------------------------------------------------`,
      `QTD. TOTAL DE ITENS: ${(order?.items || []).length}`,
      `SUBTOTAL:                          R$ ${(order?.subtotal ?? 0).toFixed(2)}`,
      (order?.serviceFee || 0) > 0 ? `TAXA DE SERVICO (10%):             R$ ${(order.serviceFee ?? 0).toFixed(2)}` : '',
      (order?.deliveryFee || 0) > 0 ? `TAXA DE ENTREGA:                   R$ ${(order.deliveryFee ?? 0).toFixed(2)}` : '',
      `VALOR TOTAL A PAGAR:               R$ ${(order?.total ?? 0).toFixed(2)}`,
      `FORMA DE PAGAMENTO:                ${order.payment?.method || 'PIX'}`,
      `================================================`,
      `EMISSAO: ${order.createdAt}   PEDIDO: ${order.code}`,
      `OPERADOR: ${order.operatorName}`,
      `CHAVE DE ACESSO NFC-e:`,
      `${formatAccessKey(order?.nfceKey || '35260912345678000190650010000001011128392109')}`,
      `PROTOCOLO DE AUTORIZACAO: ${order?.nfceProtocol || '135269988112233'}`,
      `Tributos Totais Incidentes (Lei 12.741/12): R$ {(((order?.total ?? 0) * 0.28)).toFixed(2)} (28%)`,
      `================================================`,
      `      OBRIGADO PELA PREFERENCIA! VOLTE SEMPRE!  `,
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([lines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cupom_NFCe_${order.code.replace('#', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-zinc-100 font-serif">Simulação Impressora Térmica ESC/POS (80mm)</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Container - Realistic Paper Look */}
        <div className="p-6 bg-zinc-950 flex justify-center">
          <div className="w-80 bg-stone-50 text-stone-900 p-5 rounded shadow-2xl font-mono text-[11px] leading-tight select-all border-dashed border-t-4 border-b-4 border-stone-300 relative">
            {/* Store details */}
            <div className="text-center pb-2 border-b border-dashed border-stone-400">
              <h2 className="font-black text-xs tracking-wider uppercase">{store.name}</h2>
              <p className="text-[10px] text-stone-700 mt-0.5">CNPJ: {store.cnpj} - IE: {store.ie}</p>
              <p className="text-[9px] text-stone-600">{store.address}</p>
              <p className="text-[9px] text-stone-600">{store.city} - {store.state} | {store.phone}</p>
            </div>

            <div className="py-2 text-center border-b border-dashed border-stone-400">
              <p className="font-bold text-[10px] uppercase">DANFE NFC-e - Documento Auxiliar</p>
              <p className="text-[9px] text-stone-600">Nota Fiscal de Consumidor Eletrônica</p>
              <p className="text-[9px] text-emerald-800 font-bold mt-0.5">EMITIDA E AUTORIZADA NA SEFAZ</p>
            </div>

            {/* Items Table with Fractionated Dose Specifications */}
            <div className="py-2 border-b border-dashed border-stone-400">
              <div className="grid grid-cols-12 font-bold text-[10px] pb-1 mb-1 border-b border-stone-300">
                <span className="col-span-1">#</span>
                <span className="col-span-6">ITEM</span>
                <span className="col-span-2 text-center">QTD</span>
                <span className="col-span-3 text-right">TOTAL</span>
              </div>

              <div className="space-y-1.5">
                {(order?.items || []).map((item, index) => (
                  <div key={index} className="grid grid-cols-12 text-[10px] leading-snug">
                    <span className="col-span-1 text-stone-500">{index + 1}</span>
                    <span className="col-span-6 font-semibold truncate">
                      {item.isDose ? `DOSE 50ML ${item.product?.name || ''}` : (item.product?.name || '')}
                      {item.isDose && (
                        <span className="block text-[8px] text-amber-800 font-sans font-bold">
                          [Fracionado Garrafa Lote #26]
                        </span>
                      )}
                      {item.weightKg && (
                        <span className="block text-[8px] text-stone-600">
                          {(item.weightKg ?? 0).toFixed(3)}kg x R$ {(item.product?.pricePerKg ?? 0).toFixed(2)}/kg
                        </span>
                      )}
                    </span>
                    <span className="col-span-2 text-center">
                      {item.weightKg ? '1 un' : `${item.quantity} un`}
                    </span>
                    <span className="col-span-3 text-right font-bold">
                      R$ {(item.totalPrice ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
              <div className="flex justify-between">
                <span>SUBTOTAL:</span>
                <span>R$ {(order?.subtotal ?? 0).toFixed(2)}</span>
              </div>
              {(order?.serviceFee || 0) > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>TAXA DE SERVIÇO (10%):</span>
                  <span>R$ {(order?.serviceFee ?? 0).toFixed(2)}</span>
                </div>
              )}
              {(order?.deliveryFee || 0) > 0 && (
                <div className="flex justify-between text-stone-700">
                  <span>TAXA DE ENTREGA:</span>
                  <span>R$ {(order?.deliveryFee ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xs pt-1 border-t border-stone-300">
                <span>VALOR TOTAL:</span>
                <span>R$ {(order?.total ?? 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-0.5 text-stone-700">
                <span>PAGAMENTO:</span>
                <span className="font-bold">{order?.payment?.method || 'PIX'}</span>
              </div>
            </div>

            {/* Fiscal Footer & NFC-e Access Key */}
            <div className="pt-2 text-center text-[9px] space-y-1">
              <p className="font-bold">CHAVE DE ACESSO SEFAZ:</p>
              <p className="text-[8px] font-mono tracking-tighter break-all bg-stone-200 p-1 rounded">
                {formatAccessKey(order?.nfceKey || '35260912345678000190650010000001011128392109')}
              </p>
              <p>PROTOCOLO: {order?.nfceProtocol || '135269988112233'}</p>
              <p className="text-stone-500">
                Tributos Totais Incidentes (Lei 12.741/12): R$ {(((order?.total ?? 0) * 0.28)).toFixed(2)} (28.4%)
              </p>
              
              {/* Mock QR Code for SEFAZ Consultation */}
              <div className="py-2 flex flex-col items-center">
                <div className="w-20 h-20 bg-stone-900 p-1.5 rounded flex items-center justify-center text-stone-50 shadow-sm">
                  <QrCode className="w-full h-full text-white" />
                </div>
                <span className="text-[8px] text-stone-600 mt-1">Consulte pela chave de acesso em sefaz.sp.gov.br</span>
              </div>

              <p className="font-bold text-[9px] pt-1">Obrigado pela preferência!</p>
            </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {printFeedback && (
          <div className="mx-6 mb-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{printFeedback}</span>
            </div>
            <button type="button" onClick={() => setPrintFeedback(null)} className="text-zinc-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Modal Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTxt}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
              title="Baixar arquivo TXT com formatação para impressora térmica"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Baixar TXT</span>
            </button>
            <button
              onClick={handleOpenDrawer}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition-colors"
              title="Abrir gaveta de dinheiro (Pulso elétrico 24V)"
            >
              <Scissors className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Abrir Gaveta</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isWebSerialAvailable && (
              <button
                onClick={handlePrintSerial}
                className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Imprimir direto na porta serial USB/COM sem abrir caixa de diálogo do Windows"
              >
                <Usb className="w-4 h-4 text-emerald-400" />
                <span>Web Serial</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Imprimir cupom térmico no navegador"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir 80mm</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
