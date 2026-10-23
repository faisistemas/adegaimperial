import React, { useState } from 'react';
import { 
  Plus, DollarSign, Calendar, CreditCard, CheckCircle2, 
  AlertCircle, Building2, Zap, Users, Receipt, Filter, 
  ArrowUpRight, ArrowDownLeft, X, ShieldAlert, Check
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ContaPagar, ContaReceber, CategoriaContaPagar, OrigemPagamento } from '../../types/backofficeTypes';

export const ContasPagarReceberTab: React.FC = () => {
  const { 
    contasPagar, 
    contasReceber, 
    adicionarContaPagar, 
    baixarContaPagar, 
    cancelarContaPagar, 
    conciliarContaReceber, 
    reportarDivergenciaReceber 
  } = useAdega();

  const [activeSubTab, setActiveSubTab] = useState<'PAGAR' | 'RECEBER'>('PAGAR');
  const [modalNovaConta, setModalNovaConta] = useState(false);
  const [modalBaixa, setModalBaixa] = useState<ContaPagar | null>(null);
  const [origemBaixa, setOrigemBaixa] = useState<OrigemPagamento>('CONTA_BANCARIA');

  // Form states para nova conta a pagar
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [categoria, setCategoria] = useState<CategoriaContaPagar>('FORNECEDOR_BEBIDAS');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [valorNominal, setValorNominal] = useState('');
  const [dataVencimento, setDataVencimento] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');

  // Totais analíticos
  const totalPagarPendente = contasPagar
    .filter((c) => c.status === 'PENDENTE' || c.status === 'ATRASADO')
    .reduce((a, c) => a + c.valorNominal, 0);

  const totalReceberPendente = contasReceber
    .filter((c) => c.status === 'A_RECEBER')
    .reduce((a, c) => a + c.valorLiquido, 0);

  const totalMdrRetido = contasReceber.reduce((a, c) => a + c.taxaMdrValor, 0);

  const handleSalvarNovaConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorNome || !valorNominal || !dataVencimento) return;

    adicionarContaPagar({
      lojaId: 'LOJA_01',
      categoria,
      fornecedorNome,
      fornecedorCnpj: fornecedorCnpj || '00.000.000/0001-00',
      numeroDocumento: numeroDocumento || `DOC-${Math.floor(Math.random() * 10000)}`,
      valorNominal: parseFloat(valorNominal),
      jurosMulta: 0,
      desconto: 0,
      valorPago: 0,
      dataVencimento,
      status: 'PENDENTE',
      origemPagamento: 'CONTA_BANCARIA',
      codigoBarras,
    });

    setModalNovaConta(false);
    setFornecedorNome('');
    setFornecedorCnpj('');
    setValorNominal('');
    setDataVencimento('');
    setCodigoBarras('');
  };

  const handleConfirmarBaixa = () => {
    if (!modalBaixa) return;
    baixarContaPagar(modalBaixa.id, origemBaixa);
    setModalBaixa(null);
  };

  const getCategoriaIcon = (cat: CategoriaContaPagar) => {
    switch (cat) {
      case 'FORNECEDOR_BEBIDAS': return <Building2 className="w-3.5 h-3.5 text-amber-400" />;
      case 'ENERGIA_FREEZERS': return <Zap className="w-3.5 h-3.5 text-yellow-400" />;
      case 'FOLHA_PAGAMENTO': return <Users className="w-3.5 h-3.5 text-blue-400" />;
      case 'TRIBUTOS': return <Receipt className="w-3.5 h-3.5 text-rose-400" />;
      default: return <DollarSign className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total a Pagar Pendente</span>
            <ArrowUpRight className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-400">
            R$ {totalPagarPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-zinc-400">
            {contasPagar.filter((c) => c.status === 'PENDENTE').length} boletos a vencer neste período
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Total a Receber (Adquirentes)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-emerald-400">
            R$ {totalReceberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-zinc-400">
            Líquido a ser repassado por Stone, Cielo e Rede
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Taxa MDR Retida pelas Maquininhas</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-amber-400">
            R$ {totalMdrRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="text-[11px] text-zinc-400">
            Média de 2.2% sobre transações de crédito e débito
          </div>
        </div>
      </div>

      {/* Switch Sub-tab */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab('PAGAR')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'PAGAR'
                ? 'bg-rose-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Contas a Pagar ({contasPagar.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('RECEBER')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'RECEBER'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Contas a Receber ({contasReceber.length})</span>
          </button>
        </div>

        {activeSubTab === 'PAGAR' && (
          <button
            onClick={() => setModalNovaConta(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta a Pagar</span>
          </button>
        )}
      </div>

      {/* Tabela de Contas a Pagar */}
      {activeSubTab === 'PAGAR' && (
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Compromissos Financeiros & Fornecedores</h3>
            <span className="text-xs text-zinc-400 font-mono">
              Suporta baixa direta via Sangria do PDV ou Débito Bancário
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Fornecedor / Favorecido</th>
                  <th className="p-3">Categoria</th>
                  <th className="p-3">Vencimento</th>
                  <th className="p-3 text-right">Valor Nominal</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Origem da Baixa</th>
                  <th className="p-3 pr-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {contasPagar.map((conta) => (
                  <tr key={conta.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-4">
                      <div>
                        <p className="font-bold text-zinc-100">{conta.fornecedorNome}</p>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Doc: {conta.numeroDocumento} • CNPJ: {conta.fornecedorCnpj}
                        </span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        {getCategoriaIcon(conta.categoria)}
                        <span className="text-[11px] capitalize">{conta.categoria.replace('_', ' ').toLowerCase()}</span>
                      </div>
                    </td>

                    <td className="p-3 font-mono text-zinc-300">
                      {conta.dataVencimento}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-sm text-zinc-100">
                      R$ {(conta.valorNominal ?? 0).toFixed(2)}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        conta.status === 'PAGO'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                          : conta.status === 'ATRASADO'
                          ? 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                          : 'bg-amber-950/40 text-amber-400 border-amber-800/60'
                      }`}>
                        {conta.status}
                      </span>
                    </td>

                    <td className="p-3">
                      {conta.status === 'PAGO' ? (
                        <span className="text-[11px] text-zinc-400 font-mono">
                          {conta.origemPagamento === 'SANGRIA_PDV' ? 'Sangria de Caixa' : 'Conta Bancária'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-600">-</span>
                      )}
                    </td>

                    <td className="p-3 pr-4 text-right">
                      {conta.status !== 'PAGO' && conta.status !== 'CANCELADO' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setModalBaixa(conta)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors"
                          >
                            Baixar
                          </button>
                          <button
                            onClick={() => cancelarContaPagar(conta.id)}
                            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono">Liquidada</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Contas a Receber (Adquirentes) */}
      {activeSubTab === 'RECEBER' && (
        <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Recebíveis de Cartão & TEF</h3>
            <span className="text-xs text-zinc-400 font-mono">
              Auditoria de MDR contratada vs descontada pela maquininha
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3 pl-4">Adquirente & Bandeira</th>
                  <th className="p-3 text-right">Valor Bruto</th>
                  <th className="p-3 text-right">Taxa MDR</th>
                  <th className="p-3 text-right">Valor Líquido</th>
                  <th className="p-3">Data Venda</th>
                  <th className="p-3">Repasse Previsto</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {contasReceber.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="p-3 pl-4">
                      <div>
                        <p className="font-bold text-zinc-100">{rec.adquirente} - {rec.bandeira}</p>
                        {rec.comprovanteTefId && (
                          <span className="text-[10px] text-zinc-500 font-mono">NSU/TEF: {rec.comprovanteTefId}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono text-zinc-300">
                      R$ {(rec.valorBruto ?? 0).toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-mono text-rose-400">
                      -{(rec.taxaMdrPercentual ?? 0).toFixed(2)}% (R$ {(rec.taxaMdrValor ?? 0).toFixed(2)})
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-emerald-400">
                      R$ {(rec.valorLiquido ?? 0).toFixed(2)}
                    </td>

                    <td className="p-3 font-mono text-zinc-400">
                      {rec.dataVenda}
                    </td>

                    <td className="p-3 font-mono text-zinc-300">
                      {rec.dataPrevistaRepasse}
                    </td>

                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        rec.status === 'LIQUIDADO'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60'
                          : rec.status === 'DIVERGENTE'
                          ? 'bg-rose-950/40 text-rose-400 border-rose-800/60'
                          : 'bg-blue-950/40 text-blue-400 border-blue-800/60'
                      }`}>
                        {rec.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3 pr-4 text-right">
                      {rec.status === 'A_RECEBER' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => conciliarContaReceber(rec.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                          >
                            Liquidar
                          </button>
                          <button
                            onClick={() => reportarDivergenciaReceber(rec.id, 'Divergência MDR de 0.5% a maior')}
                            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-400 text-xs"
                          >
                            Auditar
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-500">Conciliado</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Nova Conta a Pagar */}
      {modalNovaConta && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSalvarNovaConta} className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-100 font-serif">Cadastrar Conta a Pagar</h3>
              <button type="button" onClick={() => setModalNovaConta(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-zinc-300 font-medium block mb-1">Fornecedor / Favorecido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Heineken Brasil S/A"
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">CNPJ do Fornecedor</label>
                <input
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={fornecedorCnpj}
                  onChange={(e) => setFornecedorCnpj(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">Categoria de Despesa</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaContaPagar)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200"
                >
                  <option value="FORNECEDOR_BEBIDAS">Fornecedor de Bebidas / Cervejarias</option>
                  <option value="ENERGIA_FREEZERS">Energia Elétrica dos Freezers</option>
                  <option value="ALUGUEL">Aluguel do Ponto</option>
                  <option value="FOLHA_PAGAMENTO">Folha de Pagamento / Garçons</option>
                  <option value="TRIBUTOS">Tributos / Guia DAS Simples</option>
                  <option value="MANUTENCAO">Manutenção de Chopeiras / Balcões</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">Nº do Documento / NF-e</label>
                <input
                  type="text"
                  placeholder="NF-e 88129"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">Valor Nominal (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 3450.00"
                  value={valorNominal}
                  onChange={(e) => setValorNominal(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200 font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-300 font-medium block mb-1">Data de Vencimento *</label>
                <input
                  type="date"
                  required
                  value={dataVencimento}
                  onChange={(e) => setDataVencimento(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-zinc-300 font-medium block mb-1">Linha Digitável / Código de Barras</label>
                <input
                  type="text"
                  placeholder="34191.79001 01043.510047 91020.150008 8 98760000345000"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-zinc-200 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setModalNovaConta(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-950/40"
              >
                Salvar Conta a Pagar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Baixa de Conta (com opção de Sangria no PDV) */}
      {modalBaixa && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-base text-zinc-100 font-serif">Baixar Pagamento</h3>
              <button onClick={() => setModalBaixa(null)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs space-y-1">
              <p className="text-zinc-400">Favorecido: <strong className="text-zinc-200">{modalBaixa.fornecedorNome}</strong></p>
              <p className="text-zinc-400">Documento: <strong className="text-zinc-200">{modalBaixa.numeroDocumento}</strong></p>
              <p className="text-zinc-400">Valor a Liquidar: <strong className="text-emerald-400 font-mono text-sm">R$ {(modalBaixa.valorNominal ?? 0).toFixed(2)}</strong></p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-zinc-300 font-medium block">
                Selecione a Origem dos Recursos:
              </label>

              <div className="space-y-2">
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  origemBaixa === 'CONTA_BANCARIA'
                    ? 'bg-amber-500/10 border-amber-500/50 text-zinc-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="origem"
                      checked={origemBaixa === 'CONTA_BANCARIA'}
                      onChange={() => setOrigemBaixa('CONTA_BANCARIA')}
                      className="accent-amber-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-zinc-200 block">Conta Bancária da Empresa</span>
                      <span className="text-[11px] text-zinc-500">Itaú / Bradesco Corporate</span>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                  origemBaixa === 'SANGRIA_PDV'
                    ? 'bg-amber-500/10 border-amber-500/50 text-zinc-100'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="origem"
                      checked={origemBaixa === 'SANGRIA_PDV'}
                      onChange={() => setOrigemBaixa('SANGRIA_PDV')}
                      className="accent-amber-500"
                    />
                    <div>
                      <span className="font-bold text-xs text-zinc-200 block">Sangria de Dinheiro Físico no PDV</span>
                      <span className="text-[11px] text-amber-400/90 font-mono">
                        Gera saída de caixa imediata no PDV com recibo
                      </span>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setModalBaixa(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarBaixa}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40"
              >
                Confirmar Liquidação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
