import React, { useState, useMemo } from 'react';
import { 
  X, ArrowUpRight, ArrowDownRight, RefreshCw, AlertTriangle, 
  AlertOctagon, CheckCircle2, DollarSign, Package, Sliders, 
  FileText, User, HelpCircle, ArrowRight
} from 'lucide-react';
import { Product, TipoMovimentacaoEstoque } from '../../types';
import { useAdega } from '../../context/AdegaContext';

interface ModalMovimentacaoEstoqueProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onSuccess?: (msg: string) => void;
}

export type OperacaoMovimento = 'ENTRADA' | 'SAIDA' | 'AJUSTE';

const MOTIVOS_SUGERIDOS: Record<OperacaoMovimento, string[]> = {
  ENTRADA: [
    'Compra / Reposição de Fornecedor',
    'Bonificação / Brinde Promocional',
    'Devolução de Venda / Cliente',
    'Retorno de Evento / Consignação',
    'Ajuste por Sobra Física'
  ],
  SAIDA: [
    'Venda Balcão / Avulsa',
    'Quebra / Avaria Interna / Garrafa Quebrada',
    'Degustação / Cortesia a Cliente',
    'Consumo Interno do Bar / Casa',
    'Uso em Preparo de Drinks / Coquetelaria',
    'Descarte por Validade Vencida'
  ],
  AJUSTE: [
    'Balanço Físico / Contagem de Inventário',
    'Correção de Divergência de Sistema',
    'Reclassificação de Lote ou Embalagem',
    'Acerto Administrativo de Auditoria'
  ]
};

export const ModalMovimentacaoEstoque: React.FC<ModalMovimentacaoEstoqueProps> = ({
  isOpen,
  onClose,
  product,
  onSuccess
}) => {
  const { products, updateProduct, registrarMovimentacaoEstoque, activeStore, currentUser } = useAdega();

  const [selectedProductId, setSelectedProductId] = useState<string>(product?.id || products[0]?.id || '');
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === (product?.id || selectedProductId)) || product || products[0];
  }, [products, product, selectedProductId]);

  const [operacao, setOperacao] = useState<OperacaoMovimento>('ENTRADA');
  const [quantidade, setQuantidade] = useState<number>(1);
  
  // Para modo Ajuste: se ajusta por delta ou se informa o saldo real contado
  const [modoAjuste, setModoAjuste] = useState<'DELTA' | 'SALDO_REAL'>('SALDO_REAL');
  const [saldoRealContado, setSaldoRealContado] = useState<number>(activeProduct?.stockUnits || 0);

  const [motivo, setMotivo] = useState<string>(MOTIVOS_SUGERIDOS.ENTRADA[0]);
  const [documentoRef, setDocumentoRef] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');

  // Atualiza motivo padrão ao trocar operação
  const handleOperacaoChange = (novaOp: OperacaoMovimento) => {
    setOperacao(novaOp);
    setMotivo(MOTIVOS_SUGERIDOS[novaOp][0]);
    if (novaOp === 'AJUSTE') {
      setSaldoRealContado(activeProduct?.stockUnits || 0);
    }
  };

  // Cálculo do Preview em Tempo Real
  const preview = useMemo(() => {
    if (!activeProduct) return null;

    const saldoAtual = activeProduct.stockUnits;
    let delta = 0;
    let novoSaldo = saldoAtual;

    if (operacao === 'ENTRADA') {
      delta = Math.abs(quantidade || 0);
      novoSaldo = saldoAtual + delta;
    } else if (operacao === 'SAIDA') {
      delta = -Math.abs(quantidade || 0);
      novoSaldo = Math.max(0, saldoAtual + delta);
    } else if (operacao === 'AJUSTE') {
      if (modoAjuste === 'SALDO_REAL') {
        novoSaldo = Math.max(0, Number(saldoRealContado) || 0);
        delta = novoSaldo - saldoAtual;
      } else {
        delta = Number(quantidade) || 0;
        novoSaldo = Math.max(0, saldoAtual + delta);
      }
    }

    const custoUnitario = activeProduct.costPrice || 0;
    const variacaoFinanceira = delta * custoUnitario;
    const isZerado = novoSaldo === 0;
    const isCritico = !isZerado && novoSaldo <= activeProduct.minStockAlert;
    const isNormal = novoSaldo > activeProduct.minStockAlert;
    const saidaExcedeSaldo = operacao === 'SAIDA' && (quantidade || 0) > saldoAtual;

    return {
      saldoAtual,
      delta,
      novoSaldo,
      custoUnitario,
      variacaoFinanceira,
      isZerado,
      isCritico,
      isNormal,
      saidaExcedeSaldo
    };
  }, [activeProduct, operacao, quantidade, modoAjuste, saldoRealContado]);

  if (!isOpen || !activeProduct || !preview) return null;

  const handleConfirmarMovimentacao = (e: React.FormEvent) => {
    e.preventDefault();

    if (preview.delta === 0) {
      alert('A movimentação não altera o saldo de estoque.');
      return;
    }

    // Tipo de Kardex correspondente
    let tipoKardex: TipoMovimentacaoEstoque = 'ENTRADA_COMPRA';
    if (operacao === 'ENTRADA') {
      tipoKardex = 'ENTRADA_COMPRA';
    } else if (operacao === 'SAIDA') {
      tipoKardex = motivo.toLowerCase().includes('quebra') || motivo.toLowerCase().includes('avaria') 
        ? 'PERDA_AVARIA' 
        : 'SAIDA_VENDA';
    } else {
      tipoKardex = preview.delta > 0 ? 'AJUSTE_POSITIVO' : 'AJUSTE_NEGATIVO';
    }

    // 1. Atualiza o produto
    updateProduct({
      ...activeProduct,
      stockUnits: preview.novoSaldo,
    });

    // 2. Registra a movimentação no Kardex
    const docFormatado = documentoRef.trim() || `Mov. ${operacao} #${Date.now().toString().slice(-4)}`;
    const motivoFinal = observacoes.trim() 
      ? `${motivo} - ${observacoes.trim()}`
      : motivo;

    registrarMovimentacaoEstoque({
      lojaId: activeStore.id,
      produtoId: activeProduct.id,
      produtoNome: activeProduct.name,
      tipo: tipoKardex,
      quantidade: preview.delta,
      saldoAnterior: preview.saldoAtual,
      saldoPosterior: preview.novoSaldo,
      usuarioNome: currentUser?.name || 'Operador',
      documentoRef: docFormatado,
      motivo: motivoFinal,
      custoUnitario: activeProduct.costPrice,
    });

    if (onSuccess) {
      const sinal = preview.delta > 0 ? `+${preview.delta}` : `${preview.delta}`;
      onSuccess(`Movimentação confirmada com sucesso! ${activeProduct.name}: ${sinal} un (Novo saldo: ${preview.novoSaldo} un).`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl my-6">
        {/* Modal Header */}
        <div className="p-4 md:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              operacao === 'ENTRADA' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
              operacao === 'SAIDA' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
              'bg-blue-500/15 text-blue-400 border border-blue-500/30'
            }`}>
              {operacao === 'ENTRADA' && <ArrowUpRight className="w-5 h-5" />}
              {operacao === 'SAIDA' && <ArrowDownRight className="w-5 h-5" />}
              {operacao === 'AJUSTE' && <Sliders className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Movimentação de Estoque</h3>
              <p className="text-xs text-zinc-400">Entrada, Saída ou Ajuste com preview em tempo real</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmarMovimentacao} className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Seletor do Produto caso não tenha vindo fixado */}
          {!product && (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Selecione o Produto *</label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setSaldoRealContado(p.stockUnits);
                }}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Estoque atual: {p.stockUnits} un | EAN: {p.barcode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cartão do Produto Selecionado */}
          <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 flex items-center gap-3">
            <img 
              src={activeProduct.image} 
              alt={activeProduct.name}
              className="w-12 h-12 rounded-lg object-cover bg-zinc-800 border border-zinc-700/60 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-xs sm:text-sm truncate">{activeProduct.name}</p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-amber-400 uppercase">
                  {activeProduct.category}
                </span>
                {activeProduct.subcategory && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800/80 text-zinc-300">
                    {activeProduct.subcategory}
                  </span>
                )}
                <span className="text-[11px] text-zinc-400 font-mono">
                  EAN: {activeProduct.barcode}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Estoque Atual</span>
              <span className={`text-sm font-black font-mono px-2 py-0.5 rounded inline-block ${
                activeProduct.stockUnits === 0
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : activeProduct.stockUnits <= activeProduct.minStockAlert
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'bg-zinc-800 text-white'
              }`}>
                {activeProduct.stockUnits} un
              </span>
            </div>
          </div>

          {/* Abas de Tipo de Operação */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-2">Tipo de Movimentação *</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => handleOperacaoChange('ENTRADA')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  operacao === 'ENTRADA'
                    ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Entrada (+)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOperacaoChange('SAIDA')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  operacao === 'SAIDA'
                    ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Saída (-)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOperacaoChange('AJUSTE')}
                className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  operacao === 'AJUSTE'
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Ajuste (±)</span>
              </button>
            </div>
          </div>

          {/* Campos Específicos por Tipo de Operação */}
          {operacao !== 'AJUSTE' ? (
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                Quantidade de Unidades a {operacao === 'ENTRADA' ? 'Adicionar' : 'Remover'} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={1}
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-mono uppercase">
                  unidades ({activeProduct.tipoEmbalagem || 'UN'})
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-zinc-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modoAjuste"
                    checked={modoAjuste === 'SALDO_REAL'}
                    onChange={() => setModoAjuste('SALDO_REAL')}
                    className="text-blue-500 focus:ring-0"
                  />
                  <span>Informar Saldo Real Contado em Prateleira</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="modoAjuste"
                    checked={modoAjuste === 'DELTA'}
                    onChange={() => setModoAjuste('DELTA')}
                    className="text-blue-500 focus:ring-0"
                  />
                  <span>Informar Variação (+ / -)</span>
                </label>
              </div>

              {modoAjuste === 'SALDO_REAL' ? (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Estoque Físico Contado na Adega (Novo Saldo) *
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={saldoRealContado}
                    onChange={(e) => setSaldoRealContado(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-blue-500/50 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-blue-400"
                  />
                  <p className="text-[11px] text-zinc-400 mt-1">
                    O sistema calculará automaticamente se houve sobra ou falta comparado ao estoque atual ({activeProduct.stockUnits} un).
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">
                    Quantidade do Ajuste (use positivo para adicionar, negativo para reduzir) *
                  </label>
                  <input
                    type="number"
                    required
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-blue-500/50 rounded-xl px-4 py-2.5 text-white font-mono font-bold text-base focus:outline-none focus:border-blue-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Motivo e Documento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Motivo da Movimentação *</label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                {MOTIVOS_SUGERIDOS[operacao].map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Documento de Referência</label>
              <input
                type="text"
                value={documentoRef}
                onChange={(e) => setDocumentoRef(e.target.value)}
                placeholder="Ex: NF-e 4920, Inventário #03, Vale"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Observações Adicionais (Opcional)</label>
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Lote recebido sem avarias, conferido por João"
              className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* ======================================================== */}
          {/* PREVIEW EM TEMPO REAL DA MOVIMENTAÇÃO ANTES DE CONFIRMAR */}
          {/* ======================================================== */}
          <div className="rounded-xl border border-zinc-700/80 bg-zinc-950/90 p-4 space-y-3 shadow-inner">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-amber-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Preview em Tempo Real da Movimentação</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Prévia antes de confirmar</span>
            </div>

            {/* Simulação Visual de Transição de Estoque */}
            <div className="grid grid-cols-3 gap-2 text-center items-center py-1">
              <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] text-zinc-400 block font-semibold">Estoque Atual</span>
                <span className="text-base font-black font-mono text-zinc-200">{preview.saldoAtual} un</span>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black font-mono text-xs ${
                  preview.delta > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  preview.delta < 0 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {preview.delta > 0 ? `+${preview.delta}` : `${preview.delta}`}
                </div>
                <span className="text-[9px] text-zinc-400 mt-0.5 uppercase font-bold">{operacao}</span>
              </div>

              <div className={`p-2.5 rounded-lg border transition-all ${
                preview.isZerado ? 'bg-rose-950/40 border-rose-500 text-rose-400 shadow-md shadow-rose-950' :
                preview.isCritico ? 'bg-amber-950/30 border-amber-500/50 text-amber-400' :
                'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
              }`}>
                <span className="text-[10px] block font-semibold">Novo Saldo Previsto</span>
                <span className="text-lg font-black font-mono">{preview.novoSaldo} un</span>
              </div>
            </div>

            {/* Status Previsto e Impacto Financeiro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center gap-2">
                {preview.isZerado && (
                  <>
                    <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                    <span className="text-rose-400 font-bold text-[11px]">
                      ATENÇÃO: Produto ficará com ESTOQUE ZERADO!
                    </span>
                  </>
                )}
                {preview.isCritico && (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-amber-400 font-semibold text-[11px]">
                      ALERTA: Ficará abaixo do mínimo ({activeProduct.minStockAlert} un)
                    </span>
                  </>
                )}
                {preview.isNormal && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-emerald-400 font-semibold text-[11px]">
                      Estoque normal e seguro (mín: {activeProduct.minStockAlert} un)
                    </span>
                  </>
                )}
              </div>

              <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Impacto no Custo de Estoque:</span>
                <span className={`font-mono font-bold ${
                  preview.variacaoFinanceira > 0 ? 'text-emerald-400' :
                  preview.variacaoFinanceira < 0 ? 'text-rose-400' : 'text-zinc-400'
                }`}>
                  {preview.variacaoFinanceira >= 0 ? '+' : ''}
                  R$ {preview.variacaoFinanceira.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Aviso de saída maior que estoque */}
            {preview.saidaExcedeSaldo && (
              <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Atenção: A quantidade informada ({quantidade} un) excede o saldo atual ({preview.saldoAtual} un). O estoque será zerado (0 un).
                </span>
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-95 ${
                operacao === 'ENTRADA' ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20' :
                operacao === 'SAIDA' ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20' :
                'bg-blue-500 hover:bg-blue-400 text-white shadow-blue-500/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar {operacao === 'ENTRADA' ? 'Entrada' : operacao === 'SAIDA' ? 'Saída' : 'Ajuste'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
