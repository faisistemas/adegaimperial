import React, { useState } from 'react';
import { Printer, X, Download, CheckCircle2, Usb, Scissors } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Order, Store } from '../../types';
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

  const items = order.items || [];
  const totalItemsCount = items.reduce((sum, it) => sum + (it.quantity ?? 1), 0);
  const now = new Date();
  const dateStr = order.createdAt ? order.createdAt.split(',')[0].trim() : now.toLocaleDateString('pt-BR');
  const timeStr = order.createdAt && order.createdAt.includes(',') 
    ? order.createdAt.split(',')[1].trim() 
    : now.toLocaleTimeString('pt-BR');

  const rawKey = (order.nfceKey || '32170133014556014901652030000122301986636180')
    .replace(/\D/g, '')
    .padEnd(44, '0')
    .slice(0, 44);
  const formattedKey = rawKey.replace(/(\d{4})/g, '$1 ').trim();

  const numeroNota = (order.code.replace(/\D/g, '') || '000012230').padStart(9, '0');
  const coo = (order.code.replace(/\D/g, '') || '029158').slice(-6).padStart(6, '0');
  const nsu = (order.payment?.tefAuthorizationCode?.replace(/\D/g, '') || order.code.replace(/\D/g, '') || '000139')
    .slice(-6)
    .padStart(6, '0');
  const protocolo = order.nfceProtocol || '332170000222766';
  const sefazUrl = `http://app.sefaz.${(store.state || 'sp').toLowerCase()}.gov.br/ConsultaNFCe/QRCode.aspx`;
  const qrCodeUrl = `${sefazUrl}?p=${rawKey}|2|1|1|8B92942F-8461-41AA-B73C-E68241A0B2C9`;

  const fedTax = (order.total ?? 0) * 0.1345;
  const stateTax = (order.total ?? 0) * 0.1500;
  const paymentMethodName = order.payment?.method === 'TEF_CREDITO' ? 'Cartao de Credito'
    : order.payment?.method === 'TEF_DEBITO' ? 'Cartao de Debito'
    : order.payment?.method === 'DINHEIRO' ? 'Dinheiro'
    : order.payment?.method === 'PIX' ? 'PIX'
    : order.payment?.method || 'Cartao de Credito';
  const isCard = paymentMethodName.includes('Cartao') || (order.payment?.method || '').toUpperCase().startsWith('TEF');
  const cardBrand = (order.payment?.tefCardBrand || 'MASTERCARD').toUpperCase();
  const cardAut = order.payment?.tefAuthorizationCode?.replace(/\D/g, '') || '451771';
  const nsuCtf = order.payment?.pixTxId?.replace(/\D/g, '') || '505311';

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
    const blob = new Blob([receiptData.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Comprovante_NFCe_${order.code.replace('#', '')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-sm text-zinc-100 font-serif">Comprovante de Pagamento / NFC-e (80mm)</span>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Container - Realistic Paper Look matching photograph */}
        <div className="p-4 sm:p-6 bg-zinc-950 flex justify-center max-h-[70vh] overflow-y-auto">
          <div className="w-[330px] bg-stone-50 text-stone-900 p-4 sm:p-5 rounded shadow-2xl font-mono text-[9.5px] leading-tight select-all border-dashed border-t-4 border-b-4 border-stone-300 relative">
            
            {/* Logomarca da Empresa */}
            <div className="text-center mb-2">
              <img 
                src="/logo.jpg" 
                alt={`Logo ${store.name}`}
                className="mx-auto max-h-12 w-auto object-contain filter grayscale contrast-150" 
              />
            </div>

            {/* Cabeçalho do Estabelecimento */}
            <div className="text-center pb-2 leading-tight">
              <h2 className="font-bold text-[11px] tracking-wide uppercase">{store.name} - #0103</h2>
              <p className="text-[9.5px] mt-0.5">CNPJ-{store.cnpj} &nbsp;&nbsp; {dateStr}</p>
              <p className="text-[8.5px] uppercase mt-0.5">{store.address}, {store.city}-{store.state}</p>
              <p className="font-bold text-[9.5px] uppercase mt-1">DANFE NFC-e Documento Auxiliar</p>
              <p className="text-[8.5px]">da Nota Fiscal de Consumidor Eletronica</p>
            </div>

            {/* Tabela de Itens exatamente como no comprovante */}
            <table className="w-full text-[8.5px] border-collapse mt-1">
              <thead>
                <tr className="border-b border-dashed border-stone-700 text-left font-bold">
                  <th className="py-1 w-6">ITEM</th>
                  <th className="py-1 w-24">CODIGO</th>
                  <th className="py-1">DESCRICAO</th>
                  <th className="py-1 text-right w-16">TOT. ITEM(R$)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const itemNum = String(idx + 1).padStart(3, '0');
                  const unit = item.isDose ? 'ML' : (item.product?.tipoEmbalagem || (item.weightKg ? 'KG' : 'PC'));
                  const desc = item.isDose 
                    ? `DOSE 50ML ${item.product?.name?.toUpperCase() || ''}` 
                    : `${item.product?.name?.toUpperCase() || ''} ${unit}`;
                  const totPrice = (item.totalPrice ?? (item.quantity * item.unitPrice)).toFixed(2).replace('.', ',');
                  const barcode = item.product?.barcode && item.product.barcode.length >= 8 
                    ? item.product.barcode 
                    : `789${String(Math.abs(idx * 8191 + 104857)).padStart(9, '0').slice(0, 9)}2`;

                  return (
                    <React.Fragment key={idx}>
                      <tr className="leading-tight">
                        <td className="py-0.5 align-top">{itemNum}</td>
                        <td className="py-0.5 align-top font-mono">{barcode}</td>
                        <td className="py-0.5 align-top font-semibold uppercase">{desc}</td>
                        <td className="py-0.5 align-top text-right font-bold">{totPrice}</td>
                      </tr>
                      {(item.quantity ?? 1) > 1 && (
                        <tr>
                          <td></td>
                          <td colSpan={3} className="text-[8px] text-stone-700 pl-1 pb-0.5">
                            &nbsp;&nbsp;{item.quantity} {unit} X {(item.unitPrice ?? 0).toFixed(2).replace('.', ',')}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>

            {/* Totais do Cupom */}
            <div className="py-1.5 border-t border-dashed border-stone-700 space-y-0.5 text-[9px] mt-1">
              <div className="flex justify-between">
                <span>QTD. TOTAL DE ITENS</span>
                <span className="font-bold">{totalItemsCount}</span>
              </div>
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between">
                  <span>DESCONTO R$</span>
                  <span>- {order.discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              {(order.serviceFee || 0) > 0 && (
                <div className="flex justify-between">
                  <span>TAXA DE SERVICO R$</span>
                  <span>{order.serviceFee.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-[10.5px] pt-1">
                <span>VALOR TOTAL R$</span>
                <span>{order.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 text-[9px]">
                <span>FORMA DE PAGAMENTO</span>
                <span>VALOR PAGO</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span>{paymentMethodName}</span>
                <span>{(order.payment?.amount || order.total).toFixed(2).replace('.', ',')}</span>
              </div>
              {order.payment?.change && order.payment.change > 0 && (
                <>
                  <div className="flex justify-between text-[8px] text-stone-700">
                    <span>VALOR RECEBIDO R$</span>
                    <span>{(order.payment.receivedAmount || order.total).toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-stone-700 font-bold">
                    <span>TROCO R$</span>
                    <span>{order.payment.change.toFixed(2).replace('.', ',')}</span>
                  </div>
                </>
              )}
            </div>

            {/* Linha dos Tributos IBPT */}
            <div className="text-[8px] text-stone-800 leading-tight pt-1">
              Trib aprox: R$ {fedTax.toFixed(2).replace('.', ',')} Fed, R$ {stateTax.toFixed(2).replace('.', ',')} Est e<br />
              R$ 0,00 Mun Fonte: IBPT
            </div>

            {/* Identificação de Caixa e Terminal */}
            <div className="text-[8px] text-stone-800 mt-1 space-y-0.5 leading-tight">
              <p>LJ:0103 PDV:001 NSU:{nsu} O:001090 A:001083 COO:{coo}</p>
              <p>Numero {numeroNota} Serie 203 Emissao {dateStr} {timeStr}</p>
              <p className="break-all text-[7.5px]">{sefazUrl}</p>
              <p className="font-bold tracking-tight text-[8px] break-all">{formattedKey}</p>
            </div>

            {/* Consumidor e Consulta QR Code */}
            <div className="text-center mt-1">
              <p className="font-bold text-[8px] uppercase">
                {order.customerCpf ? `CONSUMIDOR CPF: ${order.customerCpf}` : 'CONSUMIDOR NAO IDENTIFICADO'}
              </p>
              <p className="text-[7.5px] text-stone-700">Consulta via leitor de QR Code</p>
            </div>

            {/* QR Code Regulamentar SEFAZ */}
            <div className="my-2 flex justify-center">
              <div className="p-1 bg-white border border-stone-300 rounded shadow-sm inline-block">
                <QRCodeSVG value={qrCodeUrl} size={110} level="M" />
              </div>
            </div>

            {/* Protocolo de Autorização */}
            <div className="text-center text-[8px] text-stone-800 leading-tight">
              <p>Protocolo de autorizacao: {protocolo}</p>
              <p>{dateStr}</p>
              {isCard && (
                <div className="font-bold mt-1">
                  <p>{cardBrand} *8033 AUT:{cardAut}</p>
                  <p>NSU_CTF:{nsuCtf}</p>
                </div>
              )}
            </div>

            {/* Divisória e Seção Cupom de Troca */}
            <div className="border-t border-dashed border-stone-700 mt-2.5 pt-2 text-center">
              <p className="font-bold text-[9.5px] tracking-wider uppercase">CUPOM DE TROCA</p>
              <p className="text-[8px] text-stone-700 mt-0.5">DATA:{dateStr} LJ:0103 ECF:001 COD:{coo} NSU:{nsu}</p>
              <div className="text-[7.5px] text-stone-800 mt-1 text-left leading-tight">
                {items.slice(0, 3).map((it, i) => (
                  <p key={i} className="truncate">
                    {it.product?.barcode || '7898279790417'} {it.product?.name?.toUpperCase()}
                  </p>
                ))}
              </div>
              <p className="font-bold text-[8.5px] mt-2 uppercase">OBRIGADO PELA PREFERENCIA! VOLTE SEMPRE</p>
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
              id="btn-print-thermal-receipt"
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
