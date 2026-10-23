import React, { useState, useEffect } from 'react';
import { 
  X, PackageCheck, FileText, Calendar, Plus, Trash2, 
  DollarSign, AlertTriangle, ShieldCheck, CheckCircle2, 
  Warehouse, ArrowRight, Layers, Sparkles
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { PedidoCompra } from '../../types';

interface NovoRecebimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pedidoPreSelecionadoId?: string;
}

interface ItemRecebimentoRascunho {
  produtoId: string;
  produtoNome: string;
  quantidadePedida: number;
  quantidadeRecebida: number;
  fatorConversao: number; // Ex: 12 se recebido em caixas
  precoCustoUnitario: number;
  loteNumero: string;
  dataValidade: string;
  avariasOuQuebras: number;
  observacao: string;
}

export const NovoRecebimentoModal: React.FC<NovoRecebimentoModalProps> = ({
  isOpen,
  onClose,
  pedidoPreSelecionadoId,
}) => {
  const { 
    fornecedores, 
    pedidosCompra, 
    products, 
    realizarRecebimentoMercadoria,
    activeStore 
  } = useAdega();

  if (!isOpen) return null;

  const [pedidoId, setPedidoId] = useState<string>(pedidoPreSelecionadoId || '');
  const [fornecedorId, setFornecedorId] = useState<string>(fornecedores[0]?.id || '');
  const [notaFiscalNumero, setNotaFiscalNumero] = useState('048.912');
  const [notaFiscalChave, setNotaFiscalChave] = useState('3526 0961 1234 5600 0189 5500 1000 0489 1210 9876 5432');
  const [gerarContaPagar, setGerarContaPagar] = useState(true);
  const [condicaoPagamento, setCondicaoPagamento] = useState('28 Dias (Boleto)');
  const [dataVencimentoBoleto, setDataVencimentoBoleto] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 28);
    return d.toISOString().split('T')[0];
  });
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const [itens, setItens] = useState<ItemRecebimentoRascunho[]>([]);

  // Quando seleciona um pedido de compra, preenche automaticamente os itens
  useEffect(() => {
    if (pedidoId) {
      const ped = pedidosCompra.find((p) => p.id === pedidoId);
      if (ped) {
        setFornecedorId(ped.fornecedorId);
        setCondicaoPagamento(ped.condicaoPagamento || '28 Dias (Boleto)');
        
        const dataValidadePadrao = new Date();
        dataValidadePadrao.setFullYear(dataValidadePadrao.getFullYear() + 2);
        const dataValidadeStr = dataValidadePadrao.toISOString().split('T')[0];

        const itensDoPedido: ItemRecebimentoRascunho[] = ped.itens.map((item, idx) => {
          const saldoPendente = Math.max(0, item.quantidadePedida - (item.quantidadeRecebida || 0));
          return {
            produtoId: item.produtoId,
            produtoNome: item.produtoNome,
            quantidadePedida: item.quantidadePedida,
            quantidadeRecebida: saldoPendente > 0 ? saldoPendente : item.quantidadePedida,
            fatorConversao: 1,
            precoCustoUnitario: item.precoCustoUnitario,
            loteNumero: `LOTE-${new Date().getFullYear()}-${Math.floor(100 + idx * 50)}`,
            dataValidade: dataValidadeStr,
            avariasOuQuebras: 0,
            observacao: '',
          };
        });
        setItens(itensDoPedido);
      }
    } else if (itens.length === 0 && products.length > 0) {
      // Recebimento avulso sem pedido vinculado
      const prod = products[0];
      const dataVal = new Date();
      dataVal.setFullYear(dataVal.getFullYear() + 2);
      setItens([
        {
          produtoId: prod.id,
          produtoNome: prod.name,
          quantidadePedida: 12,
          quantidadeRecebida: 12,
          fatorConversao: 1,
          precoCustoUnitario: prod.costPrice || 45,
          loteNumero: `LOT-${Date.now().toString().slice(-5)}`,
          dataValidade: dataVal.toISOString().split('T')[0],
          avariasOuQuebras: 0,
          observacao: '',
        },
      ]);
    }
  }, [pedidoId]);

  const handleItemChange = (index: number, field: keyof ItemRecebimentoRascunho, value: any) => {
    const atualizados = [...itens];
    atualizados[index] = {
      ...atualizados[index],
      [field]: value,
    };
    setItens(atualizados);
  };

  const handleAddManualItem = () => {
    const prod = products[0];
    const dataVal = new Date();
    dataVal.setFullYear(dataVal.getFullYear() + 2);
    setItens([
      ...itens,
      {
        produtoId: prod.id,
        produtoNome: prod.name,
        quantidadePedida: 6,
        quantidadeRecebida: 6,
        fatorConversao: 1,
        precoCustoUnitario: prod.costPrice || 50,
        loteNumero: `LOT-${Date.now().toString().slice(-5)}`,
        dataValidade: dataVal.toISOString().split('T')[0],
        avariasOuQuebras: 0,
        observacao: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const totalEstoqueEntrada = itens.reduce((acc, i) => acc + i.quantidadeRecebida * i.fatorConversao, 0);
  const valorTotalNf = itens.reduce((acc, i) => acc + i.quantidadeRecebida * i.precoCustoUnitario, 0);
  const totalAvarias = itens.reduce((acc, i) => acc + (i.avariasOuQuebras || 0), 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorId) {
      setErro('Selecione um fornecedor para o recebimento.');
      return;
    }
    if (itens.length === 0) {
      setErro('Adicione pelo menos um item conferido.');
      return;
    }

    const payloadItens = itens.map((item) => ({
      produtoId: item.produtoId,
      quantidadeRecebida: Number(item.quantidadeRecebida),
      precoCustoUnitario: Number(item.precoCustoUnitario),
      fatorConversao: Number(item.fatorConversao) || 1,
      loteNumero: item.loteNumero.trim() || undefined,
      dataValidade: item.dataValidade || undefined,
      avariasOuQuebras: Number(item.avariasOuQuebras) || 0,
      observacao: item.observacao.trim() || undefined,
    }));

    realizarRecebimentoMercadoria({
      pedidoCompraId: pedidoId || undefined,
      fornecedorId,
      notaFiscalNumero: notaFiscalNumero.trim() || undefined,
      notaFiscalChave: notaFiscalChave.trim().replace(/\s+/g, '') || undefined,
      itens: payloadItens,
      gerarContaPagar,
      condicaoPagamento,
      dataVencimentoBoleto: gerarContaPagar ? dataVencimentoBoleto : undefined,
      observacoesGerais: observacoesGerais.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-950 border border-zinc-800/90 w-full max-w-5xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 font-sans">
                Recebimento de Mercadorias & Entrada de Estoque
              </h2>
              <p className="text-xs text-zinc-400">
                Conferência física, lote e validade, atualização imediata de estoque e geração de conta a pagar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-2 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Fechar Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6">
          {erro && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Vinculação de Pedido & NF-e */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-5 bg-zinc-900/50 border border-zinc-800/90 rounded-2xl">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Vincular Pedido de Compra
              </label>
              <select
                value={pedidoId}
                onChange={(e) => setPedidoId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">Entrada Avulsa (Sem pedido)</option>
                {pedidosCompra
                  .filter((p) => p.status !== 'RECEBIDO_TOTAL' && p.status !== 'CANCELADO')
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigo} - {p.fornecedorNome} (R$ {p.valorTotal.toFixed(2)})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Fornecedor / Distribuidor <span className="text-amber-500">*</span>
              </label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                required
              >
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nomeFantasia} ({f.cnpj})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Número da NF-e / Danfe
              </label>
              <input
                type="text"
                value={notaFiscalNumero}
                onChange={(e) => setNotaFiscalNumero(e.target.value)}
                placeholder="Ex: 848.912"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Chave de Acesso NF-e (44 Dígitos)
              </label>
              <input
                type="text"
                value={notaFiscalChave}
                onChange={(e) => setNotaFiscalChave(e.target.value)}
                placeholder="3526 0961 1234 5600 018"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono tracking-wider text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Grid de Itens Conferidos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Conferência Física de Itens, Lote e Estoque
                </h3>
              </div>
              <button
                type="button"
                onClick={handleAddManualItem}
                className="px-3.5 py-1.5 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700/60 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Outro Produto</span>
              </button>
            </div>

            <div className="space-y-3">
              {itens.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 sm:p-5 bg-zinc-900/50 border border-zinc-800/90 rounded-2xl space-y-3 hover:border-zinc-700/80 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 text-xs flex items-center justify-center font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <select
                        value={item.produtoId}
                        onChange={(e) => {
                          const p = products.find((prod) => prod.id === e.target.value);
                          if (p) {
                            handleItemChange(idx, 'produtoId', p.id);
                            handleItemChange(idx, 'produtoNome', p.name);
                            handleItemChange(idx, 'precoCustoUnitario', p.costPrice || 50);
                          }
                        }}
                        className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500 truncate"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Atual: {p.stockUnits} un)
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-zinc-500 hover:text-red-400 p-2 rounded-lg hover:bg-zinc-800/60 transition-colors shrink-0 cursor-pointer"
                      title="Excluir produto da conferência"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Campos do Item */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Qtd. Recebida</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantidadeRecebida}
                        onChange={(e) => handleItemChange(idx, 'quantidadeRecebida', Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium" title="Fator de conversão se comprado em caixa">
                        Fator Caixa (un)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.fatorConversao}
                        onChange={(e) => handleItemChange(idx, 'fatorConversao', Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Custo NF-e (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={item.precoCustoUnitario}
                        onChange={(e) => handleItemChange(idx, 'precoCustoUnitario', Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Nº Lote Rastreável</label>
                      <input
                        type="text"
                        value={item.loteNumero}
                        onChange={(e) => handleItemChange(idx, 'loteNumero', e.target.value)}
                        placeholder="Ex: LOT-19559"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1.5 font-medium">Data de Validade</label>
                      <input
                        type="date"
                        value={item.dataValidade}
                        onChange={(e) => handleItemChange(idx, 'dataValidade', e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-red-400 mb-1.5 font-semibold" title="Garrafas quebradas no transporte">
                        Avarias / Quebras
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.avariasOuQuebras}
                        onChange={(e) => handleItemChange(idx, 'avariasOuQuebras', Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-red-900/60 rounded-xl px-2.5 py-2 text-xs text-center font-mono text-red-400 focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>

                  {/* Resumo do Item */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                    <div>
                      Entrada direta no estoque:{' '}
                      <span className="font-bold font-mono text-emerald-400">
                        +{item.quantidadeRecebida * item.fatorConversao} unidades
                      </span>
                    </div>
                    <div>
                      Subtotal NF-e:{' '}
                      <span className="font-bold font-mono text-zinc-100">
                        R$ {(item.quantidadeRecebida * item.precoCustoUnitario).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integração Financeira Automática */}
          <div className="p-4 sm:p-5 bg-zinc-900/50 border border-zinc-800/90 rounded-2xl space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  Integração Financeira com Contas a Pagar
                </h4>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gerarContaPagar}
                  onChange={(e) => setGerarContaPagar(e.target.checked)}
                  className="rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-200">
                  Gerar lançamento de Conta a Pagar automaticamente
                </span>
              </label>
            </div>

            {gerarContaPagar && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Condição de Pagamento do Fornecedor
                  </label>
                  <input
                    type="text"
                    value={condicaoPagamento}
                    onChange={(e) => setCondicaoPagamento(e.target.value)}
                    placeholder="Ex: 28 Dias (Boleto)"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Data de Vencimento do Boleto
                  </label>
                  <input
                    type="date"
                    value={dataVencimentoBoleto}
                    onChange={(e) => setDataVencimentoBoleto(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Resumo Final & Validações */}
          <div className="p-4 sm:p-5 bg-emerald-950/20 border border-emerald-800/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs sm:text-sm text-emerald-400 font-bold block">
                Resumo da Conferência de Entrada
              </span>
              <p className="text-xs text-zinc-400">
                Total de <span className="text-zinc-100 font-bold">{itens.length}</span> produtos conferidos •{' '}
                <span className="text-emerald-300 font-bold">+{totalEstoqueEntrada} un</span> prontas para venda
                {totalAvarias > 0 && (
                  <span className="text-red-400 font-bold"> • {totalAvarias} un avariadas registradas</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider block">Valor Total NF-e</span>
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                R$ {valorTotalNf.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40 cursor-pointer active:scale-[0.99]"
            >
              <PackageCheck className="w-4 h-4" />
              <span>Concluir Recebimento & Integrar Estoque</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
