import React, { useState } from 'react';
import { 
  PackageCheck, Plus, Search, Filter, FileText, 
  Calendar, CheckCircle2, AlertTriangle, Warehouse, 
  DollarSign, ArrowUpRight, ShieldCheck, Eye, XCircle
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { RecebimentoMercadoria } from '../../types';
import { NovoRecebimentoModal } from './NovoRecebimentoModal';

export const RecebimentoMercadoriasTab: React.FC = () => {
  const { recebimentosMercadoria, products } = useAdega();

  const [busca, setBusca] = useState('');
  const [modalNovoRecebimento, setModalNovoRecebimento] = useState(false);
  const [recebimentoSelecionado, setRecebimentoSelecionado] = useState<RecebimentoMercadoria | null>(null);

  const recebimentosFiltrados = recebimentosMercadoria.filter((r) => {
    const matchBusca =
      r.codigo.toLowerCase().includes(busca.toLowerCase()) ||
      r.fornecedorNome.toLowerCase().includes(busca.toLowerCase()) ||
      (r.notaFiscalNumero && r.notaFiscalNumero.includes(busca)) ||
      (r.pedidoCompraCodigo && r.pedidoCompraCodigo.toLowerCase().includes(busca.toLowerCase()));

    return matchBusca;
  });

  // Métricas
  const totalRecebimentos = recebimentosMercadoria.length;
  const totalItensEstoque = recebimentosMercadoria.reduce(
    (acc, r) => acc + r.totalItensRecebidosEstoque,
    0
  );
  const valorTotalNfs = recebimentosMercadoria.reduce(
    (acc, r) => acc + r.valorTotalRecebido,
    0
  );
  const totalAvarias = recebimentosMercadoria.reduce(
    (acc, r) => acc + r.itensConferidos.reduce((sub, i) => sub + (i.avariasOuQuebras || 0), 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Recebimentos Efetuados</span>
            <span className="text-2xl font-bold font-mono text-zinc-100">{totalRecebimentos}</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">100% conferidos</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Itens Injetados no Estoque</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">+{totalItensEstoque} un</span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">Prontos para venda imediata</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Warehouse className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Total Faturado em NF-e</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              R$ {valorTotalNfs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Lançado no Contas a Pagar</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Avarias Registradas</span>
            <span className={`text-2xl font-bold font-mono ${totalAvarias > 0 ? 'text-red-400' : 'text-zinc-100'}`}>
              {totalAvarias} un
            </span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Laudadas para reposição</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por código (REC-2026...), NF-e ou distribuidor..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          onClick={() => setModalNovoRecebimento(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/30 whitespace-nowrap"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Novo Recebimento de Mercadorias (NF-e)</span>
        </button>
      </div>

      {/* Tabela de Recebimentos */}
      {recebimentosFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
          <PackageCheck className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">Nenhum recebimento registrado com os termos pesquisados.</p>
        </div>
      ) : (
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-900/60 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-950/90 text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Código / Data</th>
                  <th className="p-3.5">Distribuidor / CNPJ</th>
                  <th className="p-3.5">Documento Fiscal</th>
                  <th className="p-3.5">Pedido Vinculado</th>
                  <th className="p-3.5 text-center">Entrada Estoque</th>
                  <th className="p-3.5 text-right">Valor NF-e</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {recebimentosFiltrados.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold font-mono text-zinc-100">{rec.codigo}</div>
                      <div className="text-[10px] text-zinc-500">{rec.dataHoraRecebimento}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-semibold text-zinc-200">{rec.fornecedorNome}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{rec.fornecedorCnpj}</div>
                    </td>

                    <td className="p-3.5">
                      {rec.notaFiscalNumero ? (
                        <div>
                          <span className="font-mono font-medium text-zinc-200">NF-e {rec.notaFiscalNumero}</span>
                          {rec.notaFiscalChave && (
                            <div className="text-[9px] font-mono text-zinc-500 truncate max-w-[140px]" title={rec.notaFiscalChave}>
                              {rec.notaFiscalChave}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-zinc-500">Sem NF-e</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono text-zinc-300">
                      {rec.pedidoCompraCodigo || <span className="text-zinc-500 text-[11px]">Entrada Avulsa</span>}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="font-bold font-mono text-emerald-400">
                        +{rec.totalItensRecebidosEstoque} un
                      </span>
                      <div className="text-[10px] text-zinc-500">
                        {rec.itensConferidos.length} item{rec.itensConferidos.length > 1 ? 's' : ''}
                      </div>
                    </td>

                    <td className="p-3.5 text-right font-mono font-bold text-zinc-100">
                      R$ {rec.valorTotalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Estoque Atualizado
                      </span>
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setRecebimentoSelecionado(rec)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        title="Ver Relatório de Conferência"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Conferência */}
      {recebimentoSelecionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PackageCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                    Comprovante de Entrada • {recebimentoSelecionado.codigo}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Conferido em {recebimentoSelecionado.dataHoraRecebimento} • Por: {recebimentoSelecionado.responsavelRecebimento}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRecebimentoSelecionado(null)}
                className="text-zinc-400 hover:text-zinc-100 p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Header do Recebimento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Fornecedor</span>
                  <span className="font-bold text-zinc-200">{recebimentoSelecionado.fornecedorNome}</span>
                  <span className="text-[10px] text-zinc-400 block font-mono">{recebimentoSelecionado.fornecedorCnpj}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Documento Fiscal</span>
                  <span className="font-bold text-zinc-200">
                    {recebimentoSelecionado.notaFiscalNumero ? `NF-e ${recebimentoSelecionado.notaFiscalNumero}` : 'Entrada Avulsa'}
                  </span>
                  {recebimentoSelecionado.pedidoCompraCodigo && (
                    <span className="text-[10px] text-amber-400 block font-mono">
                      Vinculado a: {recebimentoSelecionado.pedidoCompraCodigo}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Valor Faturado</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    R$ {recebimentoSelecionado.valorTotalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-400 block">
                    +{recebimentoSelecionado.totalItensRecebidosEstoque} unidades integradas
                  </span>
                </div>
              </div>

              {/* Itens Conferidos */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 mb-2">Produtos e Lotes Rastreáveis</h4>
                <div className="border border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-950 text-zinc-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-2.5">Produto</th>
                        <th className="p-2.5 text-center">Qtd. Recebida</th>
                        <th className="p-2.5 text-center">Fator / Entrada</th>
                        <th className="p-2.5 text-center">Lote / Validade</th>
                        <th className="p-2.5 text-right">Custo Un.</th>
                        <th className="p-2.5 text-center">Avarias</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {recebimentoSelecionado.itensConferidos.map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-800/30">
                          <td className="p-2.5 font-medium text-zinc-200">{item.produtoNome}</td>
                          <td className="p-2.5 text-center font-mono">{item.quantidadeRecebida} cx/un</td>
                          <td className="p-2.5 text-center font-mono font-bold text-emerald-400">
                            +{item.quantidadeTotalEstoque} un
                          </td>
                          <td className="p-2.5 text-center font-mono text-[11px] text-zinc-300">
                            {item.loteNumero ? (
                              <>
                                <div>{item.loteNumero}</div>
                                <div className="text-[10px] text-zinc-500">Val: {item.dataValidade || 'N/D'}</div>
                              </>
                            ) : (
                              <span className="text-zinc-500">-</span>
                            )}
                          </td>
                          <td className="p-2.5 text-right font-mono">
                            R$ {item.precoCustoUnitario.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center font-mono">
                            {item.avariasOuQuebras && item.avariasOuQuebras > 0 ? (
                              <span className="text-red-400 font-bold">{item.avariasOuQuebras} un</span>
                            ) : (
                              <span className="text-zinc-600">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {recebimentoSelecionado.observacoesGerais && (
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-400">
                  <span className="font-semibold text-zinc-300 block mb-0.5">Observações da Conferência:</span>
                  {recebimentoSelecionado.observacoesGerais}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-4 border-t border-zinc-800 bg-zinc-950">
              <button
                onClick={() => setRecebimentoSelecionado(null)}
                className="px-5 py-2 rounded-xl text-xs font-medium bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Novo Recebimento */}
      <NovoRecebimentoModal
        isOpen={modalNovoRecebimento}
        onClose={() => setModalNovoRecebimento(false)}
      />
    </div>
  );
};
