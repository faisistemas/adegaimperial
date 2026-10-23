import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Trash2, Calendar, DollarSign, Truck, AlertCircle, Check } from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Fornecedor, ItemPedidoCompra, StatusPedidoCompra } from '../../types';

interface NovoPedidoCompraModalProps {
  isOpen: boolean;
  onClose: () => void;
  fornecedorPreSelecionadoId?: string;
}

interface ItemRascunho {
  produtoId: string;
  produtoNome: string;
  quantidadePedida: number;
  precoCustoUnitario: number;
  estoqueAtual: number;
}

export const NovoPedidoCompraModal: React.FC<NovoPedidoCompraModalProps> = ({
  isOpen,
  onClose,
  fornecedorPreSelecionadoId,
}) => {
  const { fornecedores, products, adicionarPedidoCompra, activeStore, currentUser } = useAdega();

  if (!isOpen) return null;

  const [fornecedorId, setFornecedorId] = useState(fornecedorPreSelecionadoId || fornecedores[0]?.id || '');
  const [condicaoPagamento, setCondicaoPagamento] = useState('28 Dias (Boleto)');
  const [dataPrevisaoEntrega, setDataPrevisaoEntrega] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [observacoes, setObservacoes] = useState('');
  const [statusInicial, setStatusInicial] = useState<StatusPedidoCompra>('APROVADO');

  // Adição de itens
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [inputQtd, setInputQtd] = useState(12);
  const [inputPreco, setInputPreco] = useState(products[0]?.costPrice || 50);

  const [itens, setItens] = useState<ItemRascunho[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  const fornecedorSelecionado = fornecedores.find((f) => f.id === fornecedorId);

  const handleSelectProduct = (prodId: string) => {
    setSelectedProdId(prodId);
    const p = products.find((prod) => prod.id === prodId);
    if (p) {
      setInputPreco(p.costPrice || 50);
    }
  };

  const handleAddItem = () => {
    if (!selectedProdId) return;
    const prod = products.find((p) => p.id === selectedProdId);
    if (!prod) return;

    if (inputQtd <= 0) {
      setErro('A quantidade deve ser maior que zero.');
      return;
    }

    const itemExistenteIndex = itens.findIndex((i) => i.produtoId === selectedProdId);
    if (itemExistenteIndex >= 0) {
      // Atualizar item existente
      const atualizados = [...itens];
      atualizados[itemExistenteIndex].quantidadePedida += inputQtd;
      atualizados[itemExistenteIndex].precoCustoUnitario = inputPreco;
      setItens(atualizados);
    } else {
      setItens([
        ...itens,
        {
          produtoId: prod.id,
          produtoNome: prod.name,
          quantidadePedida: inputQtd,
          precoCustoUnitario: inputPreco,
          estoqueAtual: prod.stockUnits,
        },
      ]);
    }

    setErro(null);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const valorTotal = itens.reduce((acc, i) => acc + i.quantidadePedida * i.precoCustoUnitario, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorSelecionado) {
      setErro('Selecione um fornecedor para o pedido.');
      return;
    }
    if (itens.length === 0) {
      setErro('Adicione pelo menos um produto ao pedido de compra.');
      return;
    }

    const itensPedido: ItemPedidoCompra[] = itens.map((i) => ({
      produtoId: i.produtoId,
      produtoNome: i.produtoNome,
      quantidadePedida: i.quantidadePedida,
      quantidadeRecebida: 0,
      precoCustoUnitario: i.precoCustoUnitario,
      subtotal: i.quantidadePedida * i.precoCustoUnitario,
    }));

    adicionarPedidoCompra({
      lojaId: activeStore.id,
      fornecedorId: fornecedorSelecionado.id,
      fornecedorNome: fornecedorSelecionado.nomeFantasia,
      fornecedorCnpj: fornecedorSelecionado.cnpj,
      status: statusInicial,
      valorTotal,
      dataPrevisaoEntrega,
      condicaoPagamento,
      itens: itensPedido,
      observacoes: observacoes.trim() || undefined,
      solicitante: `${currentUser.name} (${currentUser.role})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">Novo Pedido de Compra</h2>
              <p className="text-xs text-zinc-400">
                Emissão de ordem de compra, negociação de custos e agendamento de reposição
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {erro && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Dados Gerais do Pedido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Fornecedor / Distribuidor <span className="text-amber-500">*</span>
              </label>
              <select
                value={fornecedorId}
                onChange={(e) => setFornecedorId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              >
                {fornecedores.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nomeFantasia} ({f.cnpj})
                  </option>
                ))}
              </select>
              {fornecedorSelecionado && (
                <span className="text-[11px] text-zinc-500 block mt-1">
                  Prazo padrão: {fornecedorSelecionado.prazoPagamentoPadrao} • {fornecedorSelecionado.telefone}
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" /> Previsão de Entrega
              </label>
              <input
                type="date"
                value={dataPrevisaoEntrega}
                onChange={(e) => setDataPrevisaoEntrega(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Condição de Pagamento
              </label>
              <input
                type="text"
                value={condicaoPagamento}
                onChange={(e) => setCondicaoPagamento(e.target.value)}
                placeholder="Ex: 28 Dias (Boleto)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Adicionar Itens */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ShoppingBag className="w-3.5 h-3.5" /> Adicionar Produtos ao Pedido
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              <div className="md:col-span-6">
                <label className="block text-xs font-medium text-zinc-400 mb-1">Produto</label>
                <select
                  value={selectedProdId}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Estoque atual: {p.stockUnits} un)
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">Qtd. Pedida</label>
                <input
                  type="number"
                  min="1"
                  value={inputQtd}
                  onChange={(e) => setInputQtd(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 text-center font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-400 mb-1">Custo Un. (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={inputPreco}
                  onChange={(e) => setInputPreco(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 text-right font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-950/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Incluir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Itens Selecionados */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-zinc-300">
                Itens da Ordem de Compra ({itens.length})
              </h4>
              <span className="text-xs font-mono font-bold text-amber-400">
                Total Estimado: R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {itens.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500 text-xs">
                Nenhum item incluído no pedido ainda. Selecione os produtos acima.
              </div>
            ) : (
              <div className="border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3">Produto</th>
                      <th className="p-3 text-center">Estoque Atual</th>
                      <th className="p-3 text-center">Qtd. Pedida</th>
                      <th className="p-3 text-right">Custo Unitário</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {itens.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40">
                        <td className="p-3 font-medium text-zinc-200">{item.produtoNome}</td>
                        <td className="p-3 text-center text-zinc-400 font-mono">
                          {item.estoqueAtual} un
                        </td>
                        <td className="p-3 text-center font-bold text-zinc-100 font-mono">
                          {item.quantidadePedida} un
                        </td>
                        <td className="p-3 text-right font-mono text-zinc-300">
                          R$ {item.precoCustoUnitario.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-amber-400">
                          R$ {(item.quantidadePedida * item.precoCustoUnitario).toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Observações & Status Inicial */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Instruções de Entrega / Observações ao Fornecedor
              </label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Ex: Entrega até às 14h pela doca dos fundos. Exigir conferência física na presença do motorista."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Status Inicial do Pedido
              </label>
              <select
                value={statusInicial}
                onChange={(e) => setStatusInicial(e.target.value as StatusPedidoCompra)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="APROVADO">Aprovado (Transmitir ao Fornecedor)</option>
                <option value="RASCUNHO">Rascunho (Salvar para revisar)</option>
                <option value="EM_APROVACAO">Aguardando Aprovação Gerencial</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              Solicitante: <span className="text-zinc-300 font-medium">{currentUser.name}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar & Emitir Pedido</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
