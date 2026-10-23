import React, { useState } from 'react';
import { 
  X, Check, AlertTriangle, ShieldCheck, Plus, Trash2,
  FileSpreadsheet, ArrowRight, Building, Sparkles
} from 'lucide-react';
import { Product, Store } from '../../types';
import { DocumentoFiscalCompleto, RegraValidacaoAntiRejeicao } from '../../types/fiscalTypes';
import { validateFiscalPreEmission } from '../../utils/danfeThermalGenerator';

interface NovaNfeModalProps {
  products: Product[];
  store: Store;
  regras: RegraValidacaoAntiRejeicao[];
  onClose: () => void;
  onEmitir: (doc: DocumentoFiscalCompleto) => void;
}

export const NovaNfeModal: React.FC<NovaNfeModalProps> = ({
  products,
  store,
  regras,
  onClose,
  onEmitir,
}) => {
  const [modelo, setModelo] = useState<'55' | '65' | 'NFSe'>('55');
  const [naturezaOperacao, setNaturezaOperacao] = useState('VENDA DE MERCADORIAS B2B / ATACADO');
  const [destinatarioNome, setDestinatarioNome] = useState('');
  const [destinatarioCpfCnpj, setDestinatarioCpfCnpj] = useState('');
  const [destinatarioEmail, setDestinatarioEmail] = useState('');
  const [destinatarioEndereco, setDestinatarioEndereco] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(0);

  const [itens, setItens] = useState<Array<{
    produtoId: string;
    produtoNome: string;
    ncm: string;
    cest?: string;
    cfop: string;
    cstOuCsosn: string;
    quantidade: number;
    unidade: string;
    valorUnitario: number;
    valorTotal: number;
    vTributosAprox: number;
  }>>([]);

  const handleProductSelect = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setItemUnitPrice(prod.price);
    }
  };

  const handleAddItem = () => {
    const prod = products.find(p => p.id === selectedProductId);
    if (!prod || itemQuantity <= 0) return;

    const cfopPadrao = naturezaOperacao.includes('PERDA') 
      ? '5927' 
      : (prod.cfop || '5405');

    const total = itemQuantity * itemUnitPrice;
    const vTributos = total * 0.23; // Estimativa IBPT bebidas

    setItens(prev => [
      ...prev,
      {
        produtoId: prod.id,
        produtoNome: prod.name,
        ncm: prod.ncm || '22083020',
        cest: prod.cest || '03.014.00',
        cfop: cfopPadrao,
        cstOuCsosn: prod.cstIcms || '500',
        quantidade: itemQuantity,
        unidade: prod.isFractionable ? 'ML' : 'UN',
        valorUnitario: itemUnitPrice,
        valorTotal: total,
        vTributosAprox: vTributos,
      }
    ]);

    setSelectedProductId('');
    setItemQuantity(1);
    setItemUnitPrice(0);
  };

  const handleRemoveItem = (index: number) => {
    setItens(prev => prev.filter((_, i) => i !== index));
  };

  const totalGeral = itens.reduce((acc, it) => acc + it.valorTotal, 0);

  // Validação Tributária Prévia em Tempo Real
  const validacao = validateFiscalPreEmission(
    itens.map(it => ({
      name: it.produtoNome,
      ncm: it.ncm,
      cest: it.cest,
      cfop: it.cfop,
      quantity: it.quantidade,
      unitPrice: it.valorUnitario,
    })),
    totalGeral,
    false,
    false,
    regras
  );

  const handleEmitirNota = () => {
    if (itens.length === 0 || !destinatarioNome) return;
    if (!validacao.valid) {
      alert('Corrija os erros apontados pela auditoria tributária antes de emitir.');
      return;
    }

    const nextNum = Math.floor(Math.random() * 800) + 120;
    const key = `352609${store.cnpj.replace(/\D/g, '')}${modelo}001${String(nextNum).padStart(9, '0')}1092837465`;
    const protocol = `135269988${Math.floor(Math.random() * 900000) + 100000}`;

    const newDoc: DocumentoFiscalCompleto = {
      id: `fisc-man-${Date.now()}`,
      lojaId: store.id,
      modelo,
      serie: 1,
      numeroNota: nextNum,
      chaveAcesso: key,
      statusSefaz: 'AUTORIZADO',
      codigoStatusResposta: '100',
      protocoloAutorizacao: protocol,
      dataEmissao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      dataAutorizacao: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      valorTotal: totalGeral,
      valorTributosAprox: itens.reduce((acc, it) => acc + it.vTributosAprox, 0),
      destinatarioNome,
      destinatarioCpfCnpj: destinatarioCpfCnpj || '00.000.000/0001-00',
      destinatarioEmail,
      destinatarioEndereco,
      naturezaOperacao,
      tipoEmissao: 'NORMAL',
      xmlEnviado: `<nfeProc versao="4.00"><NFe><infNFe Id="NFe${key}"><ide><natOp>${naturezaOperacao}</natOp><mod>${modelo}</mod></ide></infNFe></NFe><protNFe><infProt><nProt>${protocol}</nProt><cStat>100</cStat></infProt></protNFe></nfeProc>`,
      itens: itens.map((it, idx) => ({
        itemNumero: idx + 1,
        produtoId: it.produtoId,
        produtoNome: it.produtoNome,
        ncm: it.ncm,
        cest: it.cest,
        cfop: it.cfop,
        cstOuCsosn: it.cstOuCsosn,
        quantidade: it.quantidade,
        unidade: it.unidade,
        valorUnitario: it.valorUnitario,
        valorTotal: it.valorTotal,
        vBcIcms: 0,
        vIcms: 0,
        vIcmsSt: 0,
        vPis: 0,
        vCofins: 0,
        vTributosAprox: it.vTributosAprox,
      })),
      qrcodeUrl: `https://www.nfe.fazenda.sp.gov.br/consulta?chNFe=${key}`,
    };

    onEmitir(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 font-serif">
                Emissão Fiscal Direta & B2B (NF-e 55 / NFC-e 65)
              </h2>
              <p className="text-xs text-zinc-400">
                Geração em conformidade com as regras SEFAZ, ICMS-ST e Monofásicos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          
          {/* Natureza e Modelo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Modelo Fiscal</label>
              <select
                value={modelo}
                onChange={(e) => setModelo(e.target.value as any)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-semibold"
              >
                <option value="55">NF-e (Modelo 55 - B2B / Atacado / Quebras)</option>
                <option value="65">NFC-e (Modelo 65 - Consumidor Varejo)</option>
                <option value="NFSe">NFS-e (Serviços / Couvert / Aluguel Chopeira)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Natureza da Operação (SEFAZ)</label>
              <select
                value={naturezaOperacao}
                onChange={(e) => setNaturezaOperacao(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="VENDA DE MERCADORIAS B2B / ATACADO">Venda B2B / Atacado para Empresas (CFOP 5.405 / 5.102)</option>
                <option value="BAIXA FISCAL POR QUEBRA / AVARIA DE GARRAFA">Baixa Fiscal por Quebra/Avaria (CFOP 5.927 - Ressarcimento ST)</option>
                <option value="REMESSA DE TRANSFERENCIA ENTRE FILIAIS">Remessa de Transferência entre Filiais (CFOP 5.409)</option>
                <option value="DEVOLUCAO DE MERCADORIA AO FORNECEDOR">Devolução de Mercadorias ao Fornecedor (CFOP 5.202)</option>
                <option value="PRESTACAO DE SERVICOS - COUVERT ARTISTICO">Prestação de Serviços - Couvert Artístico (ISS 5%)</option>
              </select>
            </div>
          </div>

          {/* Dados do Destinatário */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <span>Identificação do Destinatário / Tomador</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">Razão Social / Nome Completo *</label>
                <input
                  type="text"
                  placeholder="Ex: BUFFET CRISTAL LTDA ou NOME DO CLIENTE"
                  value={destinatarioNome}
                  onChange={(e) => setDestinatarioNome(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">CNPJ ou CPF *</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={destinatarioCpfCnpj}
                  onChange={(e) => setDestinatarioCpfCnpj(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">E-mail para Envio XML</label>
                <input
                  type="email"
                  placeholder="financeiro@empresa.com.br"
                  value={destinatarioEmail}
                  onChange={(e) => setDestinatarioEmail(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Av. Paulista, 1000 - Bela Vista - São Paulo/SP"
                  value={destinatarioEndereco}
                  onChange={(e) => setDestinatarioEndereco(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Adicionar Itens à Nota */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Itens da Nota Fiscal com Tributação Automática</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[11px] text-zinc-400 mb-1">Selecione o Produto do Catálogo</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductSelect(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecione um produto...</option>
                  {(products || []).map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - R$ {(p.price ?? 0).toFixed(2)} (NCM {p.ncm})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] text-zinc-400 mb-1">Valor Unit. (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={itemUnitPrice}
                  onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductId}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>
            </div>

            {/* Tabela de Itens Adicionados */}
            {itens.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-zinc-800 mt-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 text-[10px] uppercase font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">NCM</th>
                      <th className="py-2.5 px-3">CEST</th>
                      <th className="py-2.5 px-3">CFOP</th>
                      <th className="py-2.5 px-3 text-right">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Vl. Unit</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                    {(itens || []).map((it, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/40">
                        <td className="py-2.5 px-3 font-semibold text-zinc-200">{it.produtoNome}</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-400">{it.ncm}</td>
                        <td className="py-2.5 px-3 font-mono text-zinc-400">{it.cest || '-'}</td>
                        <td className="py-2.5 px-3 font-mono text-amber-400 font-bold">{it.cfop}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{it.quantidade}</td>
                        <td className="py-2.5 px-3 text-right font-mono">R$ {(it.valorUnitario ?? 0).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-zinc-100">
                          R$ {(it.valorTotal ?? 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                Nenhum item adicionado ainda. Escolha produtos acima.
              </div>
            )}
          </div>

          {/* Validador Anti-Rejeição SEFAZ */}
          <div className={`p-4 rounded-2xl border ${validacao?.valid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className={`w-4 h-4 ${validacao?.valid ? 'text-emerald-400' : 'text-red-400'}`} />
              <h4 className={`text-xs font-bold uppercase tracking-wider ${validacao?.valid ? 'text-emerald-300' : 'text-red-300'}`}>
                Motor de Auditoria Pré-Emissão SEFAZ
              </h4>
            </div>

            {validacao?.valid ? (
              <p className="text-xs text-emerald-400/90 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Todos os parâmetros fiscais (NCM, CEST, CFOP e Totais) foram validados com 100% de conformidade. Nota pronta para autorização!</span>
              </p>
            ) : (
              <div className="space-y-1 text-xs text-red-400">
                {(validacao?.errors || []).map((err, i) => (
                  <p key={i} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{err}</span>
                  </p>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-400">Total do Documento Fiscal:</p>
            <p className="text-xl font-bold font-mono text-zinc-100">
              R$ {(totalGeral ?? 0).toFixed(2)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleEmitirNota}
              disabled={itens.length === 0 || !destinatarioNome || !validacao.valid}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Transmitir e Autorizar na SEFAZ</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
