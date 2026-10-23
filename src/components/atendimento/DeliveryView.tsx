import React, { useState } from 'react';
import { 
  Bike, MapPin, Clock, Plus, Phone, CheckCircle2, 
  ArrowRight, ShieldCheck, UserCheck, Package, DollarSign, 
  X, Layers, Check, Calculator, AlertCircle, Banknote, Navigation
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { DeliveryPedido, Motoboy, Product, CartItem, PaymentMethod } from '../../types';

export const DeliveryView: React.FC = () => {
  const { 
    deliveryPedidos, 
    motoboys, 
    criarDeliveryPedido, 
    despacharPedidoDelivery, 
    concluirEntregaDelivery, 
    criarRotaLote,
    liquidarAcertoMotoboy, 
    cadastrarMotoboy,
    products, 
    currentUser 
  } = useAdega();

  const [activeTab, setActiveTab] = useState<'PEDIDOS' | 'ROTAS_LOTES' | 'MOTOBOYS'>('PEDIDOS');

  // Modal Novo Pedido Delivery
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [clienteNome, setClienteNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('Pinheiros');
  const [taxaEntrega, setTaxaEntrega] = useState(15);
  const [formaPagamento, setFormaPagamento] = useState<PaymentMethod>('PIX');
  const [trocoPara, setTrocoPara] = useState<number | undefined>(undefined);
  const [selectedProduct, setSelectedProduct] = useState<Product>(products?.[0] || ({} as Product));
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');

  // Modal Despacho
  const [despachoModalOpen, setDespachoModalOpen] = useState(false);
  const [pedidoParaDespachar, setPedidoParaDespachar] = useState<DeliveryPedido | null>(null);
  const [motoboySelecionadoId, setMotoboySelecionadoId] = useState<string>(motoboys?.[0]?.id || '');

  // Modal Novo Motoboy
  const [novoMotoboyModal, setNovoMotoboyModal] = useState(false);
  const [novoMotoNome, setNovoMotoNome] = useState('');
  const [novoMotoTelefone, setNovoMotoTelefone] = useState('');
  const [novoMotoPlaca, setNovoMotoPlaca] = useState('');
  const [novoMotoTaxaPadrao, setNovoMotoTaxaPadrao] = useState(10);

  // Roteirização Lote Seleção
  const [selectedPedidosLote, setSelectedPedidosLote] = useState<string[]>([]);
  const [motoboyLoteId, setMotoboyLoteId] = useState<string>(motoboys?.[0]?.id || '');

  // Filtering pedidos
  const pedidosPendentes = (deliveryPedidos || []).filter((p) => p.status === 'PENDENTE' || p.status === 'PREPARANDO');
  const pedidosEmRota = (deliveryPedidos || []).filter((p) => p.status === 'EM_ROTA');
  const pedidosEntregues = (deliveryPedidos || []).filter((p) => p.status === 'ENTREGUE');

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const item: CartItem = {
      product: selectedProduct,
      quantity: quantidade,
      isDose: false,
      unitPrice: selectedProduct.price,
      discount: 0,
      totalPrice: selectedProduct.price * quantidade,
    };

    criarDeliveryPedido(
      clienteNome,
      telefone,
      endereco,
      bairro,
      taxaEntrega,
      [item],
      formaPagamento,
      trocoPara,
      observacoes || undefined
    );

    setNewModalOpen(false);
    setClienteNome('');
    setTelefone('');
    setEndereco('');
    setTrocoPara(undefined);
    setObservacoes('');
  };

  const handleConfirmDespacho = () => {
    if (!pedidoParaDespachar || !motoboySelecionadoId) return;
    despacharPedidoDelivery(pedidoParaDespachar.id, motoboySelecionadoId);
    setDespachoModalOpen(false);
    setPedidoParaDespachar(null);
  };

  const handleCadastrarNovoMoto = (e: React.FormEvent) => {
    e.preventDefault();
    cadastrarMotoboy(novoMotoNome, novoMotoTelefone, novoMotoPlaca, novoMotoTaxaPadrao);
    setNovoMotoboyModal(false);
    setNovoMotoNome('');
    setNovoMotoTelefone('');
    setNovoMotoPlaca('');
  };

  const handleCriarLote = () => {
    if (selectedPedidosLote.length === 0 || !motoboyLoteId) {
      alert('Selecione pelo menos um pedido e o motoboy.');
      return;
    }
    const res = criarRotaLote(motoboyLoteId, selectedPedidosLote);
    alert(res.message);
    setSelectedPedidosLote([]);
  };

  const toggleSelectLote = (id: string) => {
    if (selectedPedidosLote.includes(id)) {
      setSelectedPedidosLote(selectedPedidosLote.filter((x) => x !== id));
    } else {
      setSelectedPedidosLote([...selectedPedidosLote, id]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-24 lg:pb-6">
      {/* Header Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-3 flex-wrap">
        {/* Sub-tabs switcher */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-800 shrink-0 overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('PEDIDOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'PEDIDOS'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pedidos ({(deliveryPedidos || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ROTAS_LOTES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ROTAS_LOTES'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Rotas em Lote</span>
          </button>

          <button
            onClick={() => setActiveTab('MOTOBOYS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'MOTOBOYS'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Acerto de Motoboys ({(motoboys || []).length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: PEDIDOS DE DELIVERY */}
      {/* ========================================================================= */}
      {activeTab === 'PEDIDOS' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                Pendentes: <strong className="text-amber-400">{pedidosPendentes.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                Em Rota: <strong className="text-blue-400">{pedidosEmRota.length}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300">
                Entregues: <strong className="text-emerald-400">{pedidosEntregues.length}</strong>
              </span>
            </div>

            <button
              onClick={() => setNewModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-950/40 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Pedido Delivery</span>
            </button>
          </div>

          {/* Cards Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(deliveryPedidos || []).map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-zinc-100">{ord.codigo}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                        ord.status === 'PENDENTE'
                          ? 'bg-amber-950/50 text-amber-300 border-amber-800'
                          : ord.status === 'PREPARANDO'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                          : ord.status === 'EM_ROTA'
                          ? 'bg-blue-950/50 text-blue-300 border-blue-700'
                          : 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  {/* Recipient Details */}
                  <div className="mt-3 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{ord.clienteNome}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 pl-5 leading-tight">
                      {ord.endereco} - <strong className="text-zinc-300">{ord.bairro}</strong>
                    </p>
                    <p className="text-[11px] text-zinc-500 pl-5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{ord.telefone}</span>
                    </p>
                  </div>

                  {/* Items Preview */}
                  <div className="mt-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 text-xs">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">Itens:</span>
                    {(ord.itens || []).map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-300">
                        <span className="truncate">{it.quantity}x {it.product?.name || ''}</span>
                        <span className="font-mono text-zinc-400">R$ {(it.totalPrice ?? 0).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t border-zinc-800 text-zinc-400 text-[11px]">
                      <span>Taxa de Entrega:</span>
                      <span className="font-mono">R$ {(ord.taxaEntrega ?? 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-amber-400 pt-1 border-t border-zinc-800">
                      <span>Total do Pedido:</span>
                      <span className="font-mono">R$ {(ord.totalComTaxa ?? 0).toFixed(2)}</span>
                    </div>

                    {/* Pagamento e Troco */}
                    <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80">
                      <span>Pagto: <strong className="text-zinc-200">{ord.formaPagamento}</strong></span>
                      {ord.trocoPara && (
                        <span className="text-emerald-400 font-mono">
                          Troco p/ R$ {(ord.trocoPara ?? 0).toFixed(2)} (R$ {((ord.trocoPara ?? 0) - (ord.totalComTaxa ?? 0)).toFixed(2)})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Motoboy Details */}
                  {ord.motoboyNome && (
                    <div className="mt-3 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/60 p-2 rounded-xl border border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-amber-400" />
                        <span>Entregador: <strong className="text-zinc-200">{ord.motoboyNome}</strong></span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Taxa: R$ {(ord.taxaMotoboyRepasse ?? 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-zinc-800">
                  {(ord.status === 'PENDENTE' || ord.status === 'PREPARANDO') && (
                    <button
                      onClick={() => {
                        setPedidoParaDespachar(ord);
                        setDespachoModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Despachar (Atribuir Motoboy)</span>
                    </button>
                  )}

                  {ord.status === 'EM_ROTA' && (
                    <button
                      onClick={() => concluirEntregaDelivery(ord.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirmar Entrega Concluída</span>
                    </button>
                  )}

                  {ord.status === 'ENTREGUE' && (
                    <div className="p-2 rounded-xl bg-emerald-950/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-800/40">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Finalizado & Entregue</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: ROTEIRIZAÇÃO EM LOTE */}
      {/* ========================================================================= */}
      {activeTab === 'ROTAS_LOTES' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Despacho de Pedidos em Lote (Agrupados por Região)</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Selecione os pedidos prontos para a mesma região ou bairro e envie o motoboy em uma única viagem.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={motoboyLoteId}
                onChange={(e) => setMotoboyLoteId(e.target.value)}
                className="bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200"
              >
                {(motoboys || [])
                  .filter((m) => m.status === 'DISPONIVEL' || m.status === 'EM_ROTA')
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({m.placaMoto})
                    </option>
                  ))}
              </select>

              <button
                disabled={selectedPedidosLote.length === 0}
                onClick={handleCriarLote}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-blue-950/50"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Despachar Lote ({selectedPedidosLote.length})</span>
              </button>
            </div>
          </div>

          {/* List of orders available for grouping */}
          <div className="space-y-2">
            {(deliveryPedidos || [])
              .filter((p) => p.status === 'PENDENTE' || p.status === 'PREPARANDO')
              .map((p) => (
                <div
                  key={p.id}
                  onClick={() => toggleSelectLote(p.id)}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedPedidosLote.includes(p.id)
                      ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500/50'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        selectedPedidosLote.includes(p.id)
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-zinc-700 bg-zinc-950'
                      }`}
                    >
                      {selectedPedidosLote.includes(p.id) && <Check className="w-3.5 h-3.5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-zinc-100">{p.codigo}</span>
                        <span className="text-xs font-semibold text-zinc-300">{p.clienteNome}</span>
                        <span className="text-[10px] bg-zinc-800 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          {p.bairro}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{p.endereco}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-zinc-200">
                      R$ {(p.totalComTaxa ?? 0).toFixed(2)}
                    </span>
                    <p className="text-[10px] text-zinc-500">Taxa R$ {(p.taxaEntrega ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: GESTÃO & ACERTO FINANCEIRO DE MOTOBOYS */}
      {/* ========================================================================= */}
      {activeTab === 'MOTOBOYS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <button
              onClick={() => setNovoMotoboyModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-950/40"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Motoboy</span>
            </button>
          </div>

          {/* Motoboys Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(motoboys || []).map((mb) => {
              const taxasAcumuladas = mb.totalTaxasAcumuladasHoje ?? (mb as any).saldoTaxasAcumuladas ?? 0;
              const dinheiroRecebido = mb.totalDinheiroRecebidoHoje ?? (mb as any).totalDinheiroRecebidoEmMaos ?? 0;
              const saldoLiquido = taxasAcumuladas - dinheiroRecebido;
              const statusMotoboy = (mb as any).status || (mb.ativo ? 'DISPONIVEL' : 'INATIVO');
              const entregasTurno = mb.entregasRealizadasHoje ?? (mb as any).totalEntregasTurno ?? 0;

              return (
                <div
                  key={mb.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-zinc-100">{mb.nome}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                          statusMotoboy === 'DISPONIVEL'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : statusMotoboy === 'EM_ROTA'
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}
                      >
                        {statusMotoboy}
                      </span>
                    </div>

                    <div className="mt-2 space-y-0.5 text-xs text-zinc-400">
                      <p className="font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{mb.telefone}</span>
                      </p>
                      <p className="font-mono text-zinc-500">Moto: {mb.placaMoto}</p>
                      <p className="text-zinc-400 mt-1">
                        Entregas no Turno: <strong className="text-zinc-200">{entregasTurno} corridas</strong>
                      </p>
                    </div>

                    {/* Financial Summary */}
                    <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 text-xs">
                      <div className="flex justify-between text-zinc-400">
                        <span>Taxas de Entrega Acumuladas:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +R$ {taxasAcumuladas.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between text-zinc-400">
                        <span>Dinheiro em Mãos a Prestar Contas:</span>
                        <span className="font-mono font-bold text-rose-400">
                          -R$ {dinheiroRecebido.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold">
                        <span className="text-zinc-300">
                          {saldoLiquido >= 0 ? 'Adega paga ao Motoboy:' : 'Motoboy devolve à Adega:'}
                        </span>
                        <span
                          className={`font-mono text-sm ${
                            saldoLiquido >= 0 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          R$ {Math.abs(saldoLiquido).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Liquidar */}
                  <button
                    onClick={() => {
                      const res = liquidarAcertoMotoboy(mb.id);
                      if (res && res.recibo) {
                        alert(res.recibo);
                      }
                    }}
                    disabled={taxasAcumuladas === 0 && dinheiroRecebido === 0}
                    className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-emerald-500/20 text-zinc-200 hover:text-emerald-300 text-xs font-bold transition-all border border-zinc-700 hover:border-emerald-500/40 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Banknote className="w-4 h-4 text-emerald-400" />
                    <span>Fechar Diária / Liquidar Acerto</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Novo Pedido de Delivery */}
      {newModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Lançar Pedido de Delivery</h3>
              <button onClick={() => setNewModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Ex: Amanda Albuquerque"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(11) 98888-7766"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">Bairro de Entrega</label>
                  <select
                    value={bairro}
                    onChange={(e) => {
                      const b = e.target.value;
                      setBairro(b);
                      if (b === 'Pinheiros') setTaxaEntrega(15);
                      else if (b === 'Jardins') setTaxaEntrega(15);
                      else if (b === 'Vila Madalena') setTaxaEntrega(18);
                      else if (b === 'Moema') setTaxaEntrega(20);
                      else setTaxaEntrega(12);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100"
                  >
                    <option value="Pinheiros">Pinheiros (Taxa R$ 15)</option>
                    <option value="Jardins">Jardins (Taxa R$ 15)</option>
                    <option value="Vila Madalena">Vila Madalena (Taxa R$ 18)</option>
                    <option value="Moema">Moema (Taxa R$ 20)</option>
                    <option value="Centro">Centro (Taxa R$ 12)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Endereço Completo</label>
                <input
                  type="text"
                  required
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Ex: Rua dos Pinheiros, 450 - Apto 82"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-300 font-medium block mb-1">Bebida / Produto</label>
                  <select
                    value={selectedProduct?.id || ''}
                    onChange={(e) => {
                      const f = (products || []).find((p) => p.id === e.target.value);
                      if (f) setSelectedProduct(f);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-100"
                  >
                    {(products || []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - R$ {(p.price ?? 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="text-xs text-zinc-300 font-medium block mb-1">Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-100 font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-zinc-300 font-medium block mb-1">Forma de Pagamento</label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as PaymentMethod)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100"
                  >
                    <option value="PIX">PIX na Entrega / Chave</option>
                    <option value="TEF_CREDITO">Cartão de Crédito</option>
                    <option value="TEF_DEBITO">Cartão de Débito</option>
                    <option value="DINHEIRO">Dinheiro em Espécie</option>
                  </select>
                </div>

                {formaPagamento === 'DINHEIRO' && (
                  <div>
                    <label className="text-xs text-zinc-300 font-medium block mb-1">Troco para (R$)</label>
                    <input
                      type="number"
                      placeholder="Ex: 200"
                      value={trocoPara || ''}
                      onChange={(e) => setTrocoPara(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs flex justify-between font-bold">
                <span className="text-zinc-400">Total com Frete:</span>
                <span className="font-mono text-amber-400">
                  R$ {(((selectedProduct?.price ?? 0) * (quantidade || 1)) + (taxaEntrega ?? 0)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-950/40"
                >
                  Criar Pedido e Enviar ao KDS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Atribuir Despacho ao Motoboy */}
      {despachoModalOpen && pedidoParaDespachar && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Despachar Pedido {pedidoParaDespachar.codigo}</h3>
              <button onClick={() => setDespachoModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Destino: <strong>{pedidoParaDespachar.clienteNome}</strong> - {pedidoParaDespachar.bairro}
              <br />
              Total com frete: <span className="font-mono font-bold text-amber-400">R$ {(pedidoParaDespachar.totalComTaxa ?? 0).toFixed(2)}</span>
            </p>

            <div>
              <label className="text-xs text-zinc-300 font-medium block mb-1">Selecionar Entregador / Motoboy</label>
              <select
                value={motoboySelecionadoId}
                onChange={(e) => setMotoboySelecionadoId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-200"
              >
                {(motoboys || []).map((mb) => (
                  <option key={mb.id} value={mb.id}>
                    {mb.nome} ({mb.placaMoto}) - {mb.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setDespachoModalOpen(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDespacho}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-950/50"
              >
                Confirmar Saída do Motoboy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Motoboy */}
      {novoMotoboyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Cadastrar Motoboy Parceiro</h3>

            <form onSubmit={handleCadastrarNovoMoto} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={novoMotoNome}
                  onChange={(e) => setNovoMotoNome(e.target.value)}
                  placeholder="Ex: Marcos Rogério"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  required
                  value={novoMotoTelefone}
                  onChange={(e) => setNovoMotoTelefone(e.target.value)}
                  placeholder="(11) 97777-6655"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Placa da Moto</label>
                <input
                  type="text"
                  required
                  value={novoMotoPlaca}
                  onChange={(e) => setNovoMotoPlaca(e.target.value.toUpperCase())}
                  placeholder="BRA2E19"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium block mb-1">Taxa Padrão de Repasse (R$)</label>
                <input
                  type="number"
                  required
                  value={novoMotoTaxaPadrao}
                  onChange={(e) => setNovoMotoTaxaPadrao(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNovoMotoboyModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  Salvar Motoboy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
