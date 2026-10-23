import React, { useState } from 'react';
import { 
  Sparkles, ShoppingCart, Truck, CheckCircle2, Clock, 
  ChevronRight, AlertTriangle, ArrowRight, PackageCheck, 
  Send, Bot, FileText, ChevronDown
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { OrdemCompra } from '../../types/backofficeTypes';

export const SugestaoComprasIaTab: React.FC = () => {
  const { 
    ordensCompra, 
    aprovarOrdemCompra, 
    receberOrdemCompraEstoque,
    adicionarOrdemCompra 
  } = useAdega();

  const [selectedOrdem, setSelectedOrdem] = useState<OrdemCompra | null>(ordensCompra?.[0] || null);
  const [isGeneratingIa, setIsGeneratingIa] = useState(false);
  const [iaFeedback, setIaFeedback] = useState<string | null>(null);

  const handleGerarSugestaoIa = () => {
    setIsGeneratingIa(true);
    setTimeout(() => {
      const novaOc: OrdemCompra = {
        id: `oc-ia-${Date.now()}`,
        codigo: `OC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        lojaId: 'LOJA_01',
        fornecedorNome: 'Pernod Ricard / Diadema Destilados',
        fornecedorCnpj: '61.123.456/0001-89',
        status: 'RASCUNHO',
        valorTotalEstimado: 3820.00,
        dataEmissao: '2026-09-16',
        dataPrevisaoEntrega: '2026-09-18',
        geradoPorIa: true,
        motivoIa: 'Estoque de Gin Tanqueray e Vodka Absolut abaixo de 4 dias para o fim de semana.',
        itens: [
          {
            produtoId: 'prod-tanqueray',
            produtoNome: 'Gin Tanqueray London Dry 750ml',
            estoqueAtual: 3,
            consumoMedioDiario: 2.8,
            leadTimeDias: 2,
            estoqueSeguranca: 6,
            pontoReposicao: 12,
            quantidadeSugerida: 12,
            quantidadeAprovada: 12,
            custoUnitarioEstimado: 89.90,
            subtotalEstimado: 1078.80,
            motivoIa: 'Fim de semana quente previsto, aumento de 35% na saída de Gin Tônica no salão.',
          },
          {
            produtoId: 'prod-absolut',
            produtoNome: 'Vodka Absolut Regular 1L',
            estoqueAtual: 4,
            consumoMedioDiario: 3.2,
            leadTimeDias: 2,
            estoqueSeguranca: 8,
            pontoReposicao: 14,
            quantidadeSugerida: 18,
            quantidadeAprovada: 18,
            custoUnitarioEstimado: 75.00,
            subtotalEstimado: 1350.00,
            motivoIa: 'Consumo do lounge de coquetelaria alto, ponto de reposição atingido.',
          },
        ],
      };

      adicionarOrdemCompra(novaOc);
      setSelectedOrdem(novaOc);
      setIsGeneratingIa(false);
      setIaFeedback('Ordem de Compra sugerida pela IA gerada com sucesso com base nas previsões de demanda!');
      setTimeout(() => setIaFeedback(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Automação de Compras */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-900 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-zinc-100 font-serif">Motor de Reposição Preditiva (ROP & Lead Time)</h3>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                IA Ativa
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Calcula o Ponto de Reposição (ROP) exato: <strong className="text-zinc-200">ROP = (Consumo Diário × Lead Time) + Estoque de Segurança</strong>. 
              Gera ordens de compra automáticas antes que as cervejas de maior giro zerem na sexta-feira.
            </p>
          </div>
        </div>

        <button
          onClick={handleGerarSugestaoIa}
          disabled={isGeneratingIa}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-950/40 whitespace-nowrap transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>{isGeneratingIa ? 'Calculando Previsão...' : 'Rodar Análise de Estoque Crítico'}</span>
        </button>
      </div>

      {iaFeedback && (
        <div className="p-3 bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{iaFeedback}</span>
        </div>
      )}

      {/* Grid: Lista de OCs à esquerda + Detalhe da OC selecionada à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Ordens de Compra */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="font-bold text-sm text-zinc-200 font-serif px-1">Ordens de Compra & Cotações</h4>

          <div className="space-y-2">
            {(ordensCompra || []).map((oc) => {
              const isSelected = selectedOrdem?.id === oc.id;
              return (
                <div
                  key={oc.id}
                  onClick={() => setSelectedOrdem(oc)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-zinc-800/90 border-amber-500/60 shadow-lg'
                      : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-100">{oc.codigo}</span>
                      {oc.geradoPorIa && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 border border-amber-500/30">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>IA</span>
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                      oc.status === 'RECEBIDO_TOTAL'
                        ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                        : oc.status === 'ENVIADO'
                        ? 'bg-blue-950/40 text-blue-400 border-blue-800/60'
                        : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                    }`}>
                      {oc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="font-bold text-xs text-zinc-300">{oc.fornecedorNome}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 pt-2 border-t border-zinc-800">
                    <span>{(oc.itens || []).length} itens sugeridos</span>
                    <span className="font-mono font-bold text-zinc-100">
                      R$ {(oc.valorTotalEstimado ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detalhe da OC selecionada */}
        <div className="lg:col-span-7">
          {selectedOrdem ? (
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-5 shadow-xl">
              {/* Header da OC */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-zinc-100 font-serif">
                      {selectedOrdem.codigo} - {selectedOrdem.fornecedorNome}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Previsão de entrega: {selectedOrdem.dataPrevisaoEntrega} • CNPJ: {selectedOrdem.fornecedorCnpj}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase text-zinc-500 font-mono block">Total Estimado</span>
                  <span className="text-xl font-black font-mono text-amber-400">
                    R$ {(selectedOrdem.valorTotalEstimado ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Justificativa da IA */}
              {selectedOrdem.motivoIa && (
                <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Diagnóstico Preditivo da IA:</strong>
                    <span className="text-zinc-300">{selectedOrdem.motivoIa}</span>
                  </div>
                </div>
              )}

              {/* Tabela de Itens da Ordem */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-zinc-400 font-mono">Itens Sugeridos com Parâmetros de Estoque</h4>
                <div className="divide-y divide-zinc-800/80 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                  {(selectedOrdem.itens || []).map((it, idx) => (
                    <div key={idx} className="p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-zinc-100 text-sm font-bold block">{it.produtoNome}</strong>
                          <span className="text-[11px] text-zinc-400">{it.motivoIa}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="text-zinc-400 text-[11px] block">Custo Unit: R$ {(it.custoUnitarioEstimado ?? 0).toFixed(2)}</span>
                          <span className="text-amber-400 font-bold">R$ {(it.subtotalEstimado ?? 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-zinc-900/60 p-2 rounded-xl text-[11px] font-mono text-zinc-400">
                        <div>
                          <span className="text-zinc-500 text-[10px] block">Estoque Atual:</span>
                          <strong className={it.estoqueAtual <= it.estoqueSeguranca ? 'text-rose-400' : 'text-zinc-200'}>
                            {it.estoqueAtual} un
                          </strong>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[10px] block">Consumo Médio:</span>
                          <span className="text-zinc-200">{it.consumoMedioDiario}/dia</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[10px] block">Lead Time:</span>
                          <span className="text-zinc-200">{it.leadTimeDias} dias</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 text-[10px] block">Pto Reposição (ROP):</span>
                          <span className="text-amber-300 font-bold">{it.pontoReposicao} un</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações da Ordem */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-end gap-2">
                {selectedOrdem.status === 'RASCUNHO' && (
                  <button
                    onClick={() => aprovarOrdemCompra(selectedOrdem.id)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Aprovar & Enviar Pedido</span>
                  </button>
                )}

                {selectedOrdem.status === 'ENVIADO' && (
                  <button
                    onClick={() => receberOrdemCompraEstoque(selectedOrdem.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <PackageCheck className="w-3.5 h-3.5" />
                    <span>Confirmar Recebimento no Estoque</span>
                  </button>
                )}

                {selectedOrdem.status === 'RECEBIDO_TOTAL' && (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Ordem Totalmente Recebida & Estoque Atualizado</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 bg-zinc-900 rounded-3xl border border-zinc-800">
              Selecione uma ordem de compra para inspecionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
