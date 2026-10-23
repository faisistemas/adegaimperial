import React, { useState } from 'react';
import { 
  DollarSign, ArrowDownLeft, ArrowUpRight, Plus, 
  CheckCircle2, AlertCircle, Lock, Unlock, Receipt, 
  CreditCard, Landmark, Calendar, RefreshCw, X, ShieldAlert,
  Wallet, Sparkles, Filter, ChevronRight, AlertTriangle, Eye
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ContaPagar, ContaReceber, CategoriaContaPagar, OrigemPagamento } from '../../types/backofficeTypes';

export const ControleCaixaContasTab: React.FC = () => {
  const { 
    cashSession, 
    cashMovements, 
    blindCloseRecords,
    openCashSession, 
    performSangria, 
    performSuprimento, 
    performBlindClose,
    contasPagar, 
    contasReceber, 
    adicionarContaPagar, 
    baixarContaPagar, 
    cancelarContaPagar, 
    conciliarContaReceber, 
    reportarDivergenciaReceber,
    currentUser,
    users
  } = useAdega();

  // Sub-aba interna: CAIXA_PDV, CONTAS_PAGAR, CONTAS_RECEBER
  const [activeSection, setActiveSection] = useState<'CAIXA' | 'PAGAR' | 'RECEBER'>('CAIXA');

  // Modais de Caixa
  const [modalAberturaOpen, setModalAberturaOpen] = useState(false);
  const [fundoInicialInput, setFundoInicialInput] = useState('200.00');
  const [terminalInput, setTerminalInput] = useState('PDV 01 - Balcão Principal');

  const [modalSangriaOpen, setModalSangriaOpen] = useState(false);
  const [valorSangriaInput, setValorSangriaInput] = useState('');
  const [motivoSangriaInput, setMotivoSangriaInput] = useState('Excesso de numerário para o cofre');
  const [gerentePinInput, setGerentePinInput] = useState('');
  const [sangriaError, setSangriaError] = useState<string | null>(null);

  const [modalSuprimentoOpen, setModalSuprimentoOpen] = useState(false);
  const [valorSuprimentoInput, setValorSuprimentoInput] = useState('');
  const [motivoSuprimentoInput, setMotivoSuprimentoInput] = useState('Troco inicial extra (moedas e notas pequenas)');

  const [modalFechamentoOpen, setModalFechamentoOpen] = useState(false);
  const [declaradoDinheiro, setDeclaradoDinheiro] = useState('');
  const [declaradoPix, setDeclaradoPix] = useState('');
  const [declaradoCartao, setDeclaradoCartao] = useState('');
  const [fechamentoNotas, setFechamentoNotas] = useState('');
  const [fechamentoResultado, setFechamentoResultado] = useState<any | null>(null);

  // Modais de Contas a Pagar
  const [modalNovaContaOpen, setModalNovaContaOpen] = useState(false);
  const [fornecedorNome, setFornecedorNome] = useState('');
  const [fornecedorCnpj, setFornecedorCnpj] = useState('');
  const [categoria, setCategoria] = useState<CategoriaContaPagar>('FORNECEDOR_BEBIDAS');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [valorNominal, setValorNominal] = useState('');
  const [dataVencimento, setDataVencimento] = useState(new Date().toISOString().split('T')[0]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [filtroStatusPagar, setFiltroStatusPagar] = useState<'TODAS' | 'PENDENTE' | 'ATRASADO' | 'PAGO'>('TODAS');

  const [modalBaixa, setModalBaixa] = useState<ContaPagar | null>(null);
  const [origemBaixa, setOrigemBaixa] = useState<OrigemPagamento>('CONTA_BANCARIA');

  // Cálculos de Caixa
  const dinheiroEmGaveta = cashSession.currentCash || 0;
  const totalVendasCaixa = (cashSession.totalSalesCash || 0) + (cashSession.totalSalesPix || 0) + (cashSession.totalSalesCard || 0);

  // Cálculos de Contas a Pagar
  const totalPagarPendente = contasPagar
    .filter((c) => c.status === 'PENDENTE' || c.status === 'ATRASADO')
    .reduce((acc, c) => acc + c.valorNominal, 0);

  const totalPagarAtrasado = contasPagar
    .filter((c) => c.status === 'ATRASADO')
    .reduce((acc, c) => acc + c.valorNominal, 0);

  const totalPagarPago = contasPagar
    .filter((c) => c.status === 'PAGO')
    .reduce((acc, c) => acc + c.valorPago, 0);

  // Cálculos de Contas a Receber
  const totalReceberPendente = contasReceber
    .filter((c) => c.status === 'A_RECEBER')
    .reduce((acc, c) => acc + c.valorLiquido, 0);

  const totalMdrRetido = contasReceber.reduce((acc, c) => acc + c.taxaMdrValor, 0);

  // Handlers de Caixa
  const handleConfirmarAbertura = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(fundoInicialInput) || 0;
    openCashSession(val, terminalInput);
    setModalAberturaOpen(false);
  };

  const handleConfirmarSangria = (e: React.FormEvent) => {
    e.preventDefault();
    setSangriaError(null);
    const val = parseFloat(valorSangriaInput);
    if (isNaN(val) || val <= 0) {
      setSangriaError('Informe um valor de sangria válido.');
      return;
    }
    const res = performSangria(val, motivoSangriaInput, gerentePinInput);
    if (!res.success) {
      setSangriaError(res.error || 'Erro ao realizar sangria.');
      return;
    }
    setModalSangriaOpen(false);
    setValorSangriaInput('');
    setGerentePinInput('');
  };

  const handleConfirmarSuprimento = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(valorSuprimentoInput);
    if (isNaN(val) || val <= 0) return;
    performSuprimento(val, motivoSuprimentoInput);
    setModalSuprimentoOpen(false);
    setValorSuprimentoInput('');
  };

  const handleConfirmarFechamentoCego = (e: React.FormEvent) => {
    e.preventDefault();
    const record = performBlindClose({
      cash: parseFloat(declaradoDinheiro) || 0,
      pix: parseFloat(declaradoPix) || 0,
      credit: parseFloat(declaradoCartao) || 0,
      debit: 0,
      notes: fechamentoNotas,
    });
    setFechamentoResultado(record);
  };

  // Handlers de Contas a Pagar
  const handleSalvarNovaConta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fornecedorNome || !valorNominal || !dataVencimento) return;

    adicionarContaPagar({
      lojaId: 'LOJA_01',
      categoria,
      fornecedorNome,
      fornecedorCnpj: fornecedorCnpj || '12.345.678/0001-90',
      numeroDocumento: numeroDocumento || `DOC-${Math.floor(Math.random() * 10000)}`,
      valorNominal: parseFloat(valorNominal),
      jurosMulta: 0,
      desconto: 0,
      dataVencimento,
      origemPagamento: 'CONTA_BANCARIA',
      codigoBarras,
    });

    setModalNovaContaOpen(false);
    setFornecedorNome('');
    setFornecedorCnpj('');
    setValorNominal('');
    setCodigoBarras('');
  };

  const handleExecutarBaixa = () => {
    if (!modalBaixa) return;
    baixarContaPagar(modalBaixa.id, modalBaixa.valorNominal, origemBaixa);
    setModalBaixa(null);
  };

  const contasPagarFiltradas = contasPagar.filter((c) => {
    if (filtroStatusPagar === 'TODAS') return true;
    return c.status === filtroStatusPagar;
  });

  return (
    <div className="space-y-6">
      {/* Sub-navegação do Módulo Financeiro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 p-2 sm:p-2.5 rounded-2xl">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0 shrink-0">
          <button
            onClick={() => setActiveSection('CAIXA')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
              activeSection === 'CAIXA'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Caixa & Turnos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
              cashSession.isOpen ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-zinc-800 text-zinc-400'
            }`}>
              {cashSession.isOpen ? 'ABERTO' : 'FECHADO'}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('PAGAR')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
              activeSection === 'PAGAR'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Contas a Pagar</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-800/80 font-mono">
              R$ {totalPagarPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </button>

          <button
            onClick={() => setActiveSection('RECEBER')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all shrink-0 whitespace-nowrap ${
              activeSection === 'RECEBER'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Contas a Receber</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono">
              R$ {totalReceberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-1 justify-end shrink-0">
          <span className="text-xs text-zinc-400 hidden sm:inline">Operador:</span>
          <span className="text-xs font-bold font-mono text-zinc-200 bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-700">
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SEÇÃO 1: CONTROLE DE CAIXA & TURNOS                       */}
      {/* ======================================================== */}
      {activeSection === 'CAIXA' && (
        <div className="space-y-6">
          {/* Card Principal de Status do Caixa */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${cashSession.isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {cashSession.isOpen ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      {cashSession.isOpen ? 'Turno de Caixa Aberto' : 'Caixa Encerrado'}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold ${
                        cashSession.isOpen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}>
                        {cashSession.isOpen ? 'Em Operação' : 'Aguardando Abertura'}
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Terminal: <span className="text-zinc-200 font-semibold">{cashSession.storeId ? 'PDV 01 - Balcão Principal' : 'Caixa Principal'}</span> • Operador: <span className="text-zinc-200 font-semibold">{cashSession.operatorName || currentUser.name}</span>
                      {cashSession.openedAt && ` • Aberto em: ${cashSession.openedAt}`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de Ação de Caixa */}
              <div className="flex flex-wrap items-center gap-2.5">
                {!cashSession.isOpen ? (
                  <button
                    onClick={() => setModalAberturaOpen(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Abrir Novo Turno de Caixa</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setModalSuprimentoOpen(true)}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-zinc-700 transition-all"
                    >
                      <Plus className="w-4 h-4 text-emerald-400" />
                      <span>Suprimento</span>
                    </button>

                    <button
                      onClick={() => setModalSangriaOpen(true)}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-zinc-700 transition-all"
                    >
                      <ArrowDownLeft className="w-4 h-4 text-amber-400" />
                      <span>Sangria (Retirada)</span>
                    </button>

                    <button
                      onClick={() => {
                        setFechamentoResultado(null);
                        setModalFechamentoOpen(true);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950 transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Fechamento Cego de Turno</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Grid de Balanço Financeiro do Caixa */}
            {cashSession.isOpen && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-zinc-800/80">
                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Dinheiro Físico em Gaveta</span>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    R$ {dinheiroEmGaveta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">Fundo inicial + entradas - sangrias</span>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Fundo de Troco Inicial</span>
                  <span className="text-xl font-bold font-mono text-zinc-200">
                    R$ {(cashSession.initialCash || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">Aporte no início do turno</span>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Vendas Cartão (TEF)</span>
                  <span className="text-xl font-bold font-mono text-cyan-400">
                    R$ {(cashSession.totalSalesCard || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">Crédito & Débito conciliado</span>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Vendas PIX Direto</span>
                  <span className="text-xl font-bold font-mono text-teal-400">
                    R$ {(cashSession.totalSalesPix || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">Líquido na conta bancária</span>
                </div>

                <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-xl p-3.5">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase block">Sangrias Realizadas</span>
                  <span className="text-xl font-bold font-mono text-amber-400">
                    R$ {(cashSession.bleedAmount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-1">Recolhimentos para o cofre</span>
                </div>
              </div>
            )}
          </div>

          {/* Histórico de Movimentações de Caixa do Turno */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sangrias e Suprimentos */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Sangrias e Suprimentos deste Turno</h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{cashMovements.length} registro(s)</span>
              </div>

              {cashMovements.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Nenhuma sangria ou suprimento registrado nesta sessão.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {cashMovements.map((mov) => (
                    <div key={mov.id} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${mov.tipo === 'SANGRIA' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {mov.tipo === 'SANGRIA' ? <ArrowDownLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-200">{mov.tipo}</span>
                            <span className="text-[10px] font-mono text-zinc-500">{mov.dataHora}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">{mov.motivo}</p>
                          {mov.managerAuthorizedName && (
                            <span className="text-[10px] text-emerald-400/90 block">Autorizado por: {mov.managerAuthorizedName}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold font-mono ${mov.tipo === 'SANGRIA' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {mov.tipo === 'SANGRIA' ? '-' : '+'} R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Histórico de Fechamentos de Caixa Anteriores */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-zinc-100">Fechamentos Cegos & Confronto de Turno</h3>
                </div>
                <span className="text-xs text-zinc-400 font-mono">{blindCloseRecords.length} fechamento(s)</span>
              </div>

              {blindCloseRecords.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  Nenhum fechamento cego anterior arquivado.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {blindCloseRecords.map((rec, idx) => (
                    <div key={idx} className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-zinc-200">{rec.operadorNome}</span>
                          <span className="text-[10px] font-mono text-zinc-500 block">{rec.dataFechamento}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          rec.statusConfronto === 'EXATO' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : rec.statusConfronto === 'SOBRA'
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {rec.statusConfronto}: {rec.diferencaDinheiro === 0 ? 'R$ 0,00' : `R$ ${Math.abs(rec.diferencaDinheiro).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-zinc-800/60 font-mono">
                        <div>
                          <span className="text-zinc-500">Declarado Dinheiro:</span>
                          <span className="text-zinc-200 ml-1">R$ {rec.declaradoDinheiro.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Apurado Sistema:</span>
                          <span className="text-zinc-200 ml-1">R$ {rec.sistemaDinheiro.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 2: CONTAS A PAGAR                                   */}
      {/* ======================================================== */}
      {activeSection === 'PAGAR' && (
        <div className="space-y-6">
          {/* Top KPI Cards de Contas a Pagar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total a Pagar Pendente</span>
              <span className="text-2xl font-black font-mono text-zinc-100 block mt-1">
                R$ {totalPagarPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Compromissos abertos</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-rose-400 block">Contas Atrasadas</span>
              <span className="text-2xl font-black font-mono text-rose-400 block mt-1">
                R$ {totalPagarAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Atenção para juros e multas</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-emerald-400 block">Total Liquidado (Pago)</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block mt-1">
                R$ {totalPagarPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Pagamentos já realizados</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 block">Novo Lançamento</span>
                <span className="text-xs text-zinc-300 block mt-1 font-semibold">Cadastrar Despesa</span>
              </div>
              <button
                onClick={() => setModalNovaContaOpen(true)}
                className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Conta</span>
              </button>
            </div>
          </div>

          {/* Filtros e Tabela de Contas a Pagar */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-zinc-400" />
                <span className="text-xs font-bold text-zinc-300">Filtrar por Status:</span>
                {(['TODAS', 'PENDENTE', 'ATRASADO', 'PAGO'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFiltroStatusPagar(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filtroStatusPagar === st
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {st === 'TODAS' ? 'Todas' : st === 'PENDENTE' ? 'Pendentes' : st === 'ATRASADO' ? 'Atrasadas' : 'Pagas'}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono text-zinc-500">{contasPagarFiltradas.length} documento(s) encontrado(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Favorecido / Fornecedor</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Documento</th>
                    <th className="py-2.5 px-3">Vencimento</th>
                    <th className="py-2.5 px-3">Valor Nominal</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {contasPagarFiltradas.map((conta) => (
                    <tr key={conta.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-zinc-200 block">{conta.fornecedorNome}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{conta.fornecedorCnpj}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                          {conta.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400">{conta.numeroDocumento}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{conta.dataVencimento}</td>
                      <td className="py-3 px-3 font-bold font-mono text-zinc-100">
                        R$ {conta.valorNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          conta.status === 'PAGO' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : conta.status === 'ATRASADO'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {conta.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {conta.status !== 'PAGO' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setModalBaixa(conta)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-sm transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Baixar</span>
                            </button>
                            <button
                              onClick={() => cancelarContaPagar(conta.id)}
                              className="px-2 py-1 bg-zinc-800 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 rounded-lg text-[11px] transition-all"
                              title="Cancelar título"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {conta.status === 'PAGO' && (
                          <span className="text-[11px] text-emerald-400 font-mono">Pago via {conta.origemPagamento}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SEÇÃO 3: CONTAS A RECEBER (ADQUIRENTES & TEF)             */}
      {/* ======================================================== */}
      {activeSection === 'RECEBER' && (
        <div className="space-y-6">
          {/* Top Cards de Recebíveis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-zinc-400 block">Total a Receber Líquido</span>
              <span className="text-2xl font-black font-mono text-emerald-400 block mt-1">
                R$ {totalReceberPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Previsão em conta D+1 a D+30</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-amber-400 block">Total Taxas MDR Retidas</span>
              <span className="text-2xl font-black font-mono text-amber-400 block mt-1">
                R$ {totalMdrRetido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Custo com maquininhas e adquirentes</span>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4">
              <span className="text-[10px] font-mono uppercase text-cyan-400 block">Adquirentes Conectadas</span>
              <span className="text-lg font-bold font-mono text-zinc-100 block mt-1">
                Stone • Cielo • Rede • PIX
              </span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">100% Conciliação Automática</span>
            </div>
          </div>

          {/* Tabela de Recebíveis */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-zinc-100">Lançamentos de Cartões e Repasses Futuros</h3>
              </div>
              <span className="text-xs font-mono text-zinc-500">{contasReceber.length} lançamento(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Adquirente / Bandeira</th>
                    <th className="py-2.5 px-3">Data Venda</th>
                    <th className="py-2.5 px-3">Data Prevista Repasse</th>
                    <th className="py-2.5 px-3">Valor Bruto</th>
                    <th className="py-2.5 px-3">Taxa MDR</th>
                    <th className="py-2.5 px-3">Valor Líquido</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Conciliação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-sans">
                  {contasReceber.map((cr) => (
                    <tr key={cr.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-zinc-200 block">{cr.adquirente}</span>
                        <span className="text-[10px] font-mono text-zinc-500">{cr.bandeira}</span>
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400">{cr.dataVenda}</td>
                      <td className="py-3 px-3 font-mono text-zinc-300">{cr.dataPrevistaRepasse}</td>
                      <td className="py-3 px-3 font-mono text-zinc-400">
                        R$ {cr.valorBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-400">
                        {cr.taxaMdrPercentual}% (-R$ {cr.taxaMdrValor.toFixed(2)})
                      </td>
                      <td className="py-3 px-3 font-bold font-mono text-emerald-400">
                        R$ {cr.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          cr.status === 'LIQUIDADO' 
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                            : cr.status === 'DIVERGENTE'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {cr.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {cr.status === 'A_RECEBER' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => conciliarContaReceber(cr.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Conciliar</span>
                            </button>
                            <button
                              onClick={() => reportarDivergenciaReceber(cr.id, 'Divergência de MDR apontada no extrato')}
                              className="px-2 py-1 bg-zinc-800 hover:bg-rose-950 text-rose-400 rounded-lg text-[11px] transition-all"
                              title="Reportar divergência de taxa"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        {cr.status === 'LIQUIDADO' && (
                          <span className="text-[11px] text-emerald-400 font-mono">Repassado em Conta</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAIS: ABERTURA, SANGRIA, SUPRIMENTO, FECHAMENTO CEGO    */}
      {/* ======================================================== */}

      {/* Modal Abertura de Caixa */}
      {modalAberturaOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Abertura de Turno de Caixa</h3>
              </div>
              <button onClick={() => setModalAberturaOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAbertura} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Terminal / Ponto de Venda</label>
                <input
                  type="text"
                  value={terminalInput}
                  onChange={(e) => setTerminalInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 font-medium focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Fundo de Troco Inicial em Dinheiro (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fundoInicialInput}
                  onChange={(e) => setFundoInicialInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base text-emerald-400 font-black font-mono focus:border-emerald-500 outline-none"
                  placeholder="0.00"
                  required
                />
                <span className="text-[11px] text-zinc-500 mt-1 block">Valor físico contado na gaveta antes de iniciar as vendas.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalAberturaOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950"
                >
                  Confirmar Abertura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sangria de Caixa */}
      {modalSangriaOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Sangria de Caixa (Retirada)</h3>
              </div>
              <button onClick={() => setModalSangriaOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {sangriaError && (
              <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{sangriaError}</span>
              </div>
            )}

            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs font-mono">
              <span className="text-zinc-400 block">Saldo Atual em Dinheiro na Gaveta:</span>
              <span className="text-lg font-bold text-emerald-400">R$ {dinheiroEmGaveta.toFixed(2)}</span>
            </div>

            <form onSubmit={handleConfirmarSangria} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Valor da Sangria (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorSangriaInput}
                  onChange={(e) => setValorSangriaInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base text-amber-400 font-bold font-mono focus:border-amber-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Justificativa / Destino</label>
                <input
                  type="text"
                  value={motivoSangriaInput}
                  onChange={(e) => setMotivoSangriaInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:border-amber-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">PIN de Autorização (Gerente / Super Admin)</label>
                <input
                  type="password"
                  maxLength={6}
                  value={gerentePinInput}
                  onChange={(e) => setGerentePinInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-zinc-100 focus:border-amber-500 outline-none"
                  placeholder="••••"
                  required
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">Exigido para segurança e trilha de auditoria.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalSangriaOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-950"
                >
                  Autorizar e Retirar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Suprimento de Caixa */}
      {modalSuprimentoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Suprimento de Caixa (Aporte de Troco)</h3>
              </div>
              <button onClick={() => setModalSuprimentoOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarSuprimento} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Valor do Suprimento (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={valorSuprimentoInput}
                  onChange={(e) => setValorSuprimentoInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-base text-emerald-400 font-bold font-mono focus:border-emerald-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Motivo do Suprimento</label>
                <input
                  type="text"
                  value={motivoSuprimentoInput}
                  onChange={(e) => setMotivoSuprimentoInput(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalSuprimentoOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950"
                >
                  Adicionar ao Gaveteiro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Fechamento Cego de Caixa */}
      {modalFechamentoOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Fechamento Cego de Turno</h3>
              </div>
              <button onClick={() => setModalFechamentoOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!fechamentoResultado ? (
              <form onSubmit={handleConfirmarFechamentoCego} className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-xs text-amber-300">
                  Faça a contagem física dos valores sem consultar o saldo do sistema. O confronto será gerado automaticamente.
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Dinheiro em Espécie (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={declaradoDinheiro}
                      onChange={(e) => setDeclaradoDinheiro(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:border-amber-500 outline-none"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 block mb-1">Total Comprovantes Cartão (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={declaradoCartao}
                      onChange={(e) => setDeclaradoCartao(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:border-amber-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Total PIX Conferido (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={declaradoPix}
                    onChange={(e) => setDeclaradoPix(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 font-mono font-bold focus:border-amber-500 outline-none"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Observações do Operador</label>
                  <textarea
                    value={fechamentoNotas}
                    onChange={(e) => setFechamentoNotas(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none resize-none h-16"
                    placeholder="Ex: Tudo conferido e envelopes de sangria lacrados."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setModalFechamentoOpen(false)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-950"
                  >
                    Encerrar e Confrontar
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${
                  fechamentoResultado.statusConfronto === 'EXATO'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : fechamentoResultado.statusConfronto === 'SOBRA'
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    {fechamentoResultado.statusConfronto === 'EXATO' ? 'Caixa 100% Exato' : `Divergência: ${fechamentoResultado.statusConfronto}`}
                  </h4>
                  <p className="text-xs mt-1">
                    Diferença em dinheiro apurada: R$ {fechamentoResultado.diferencaDinheiro.toFixed(2)}
                  </p>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Físico Declarado:</span>
                    <span className="text-zinc-200 font-bold">R$ {fechamentoResultado.totalDeclarado.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Esperado pelo Sistema:</span>
                    <span className="text-zinc-200 font-bold">R$ {fechamentoResultado.totalSistema.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 font-black">
                    <span className="text-zinc-400">Diferença Total:</span>
                    <span className={fechamentoResultado.diferencaTotal === 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      R$ {fechamentoResultado.diferencaTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    onClick={() => setModalFechamentoOpen(false)}
                    className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
                  >
                    Concluir e Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova Conta a Pagar */}
      {modalNovaContaOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Cadastrar Conta a Pagar</h3>
              </div>
              <button onClick={() => setModalNovaContaOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarNovaConta} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Favorecido / Fornecedor</label>
                <input
                  type="text"
                  value={fornecedorNome}
                  onChange={(e) => setFornecedorNome(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  placeholder="Ex: Distribuidora Ambev / Enel Energia"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">CNPJ do Favorecido</label>
                  <input
                    type="text"
                    value={fornecedorCnpj}
                    onChange={(e) => setFornecedorCnpj(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                    placeholder="00.000.000/0001-00"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Categoria</label>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value as CategoriaContaPagar)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  >
                    <option value="FORNECEDOR_BEBIDAS">Fornecedor de Bebidas</option>
                    <option value="ENERGIA_FREEZERS">Energia Elétrica / Câmaras</option>
                    <option value="ALUGUEL">Aluguel do Ponto</option>
                    <option value="FOLHA_PAGAMENTO">Folha de Pagamento</option>
                    <option value="SISTEMAS">Sistemas e TI</option>
                    <option value="TRIBUTOS">Tributos / Simples Nacional</option>
                    <option value="MANUTENCAO">Manutenção Geral</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Nº Documento / NF</label>
                  <input
                    type="text"
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                    placeholder="NF-e 1234"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Vencimento</label>
                  <input
                    type="date"
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Valor Nominal (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={valorNominal}
                    onChange={(e) => setValorNominal(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold font-mono focus:border-amber-500 outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Código de Barras / Linha Digitável do Boleto</label>
                <input
                  type="text"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-100 font-mono focus:border-amber-500 outline-none"
                  placeholder="34191.79001 01043.510047 91020.150008 5 89240026000"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalNovaContaOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold shadow-lg shadow-amber-950"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baixa de Conta a Pagar */}
      {modalBaixa && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Confirmar Pagamento (Baixa)</h3>
              </div>
              <button onClick={() => setModalBaixa(null)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Favorecido:</span>
                <span className="font-bold text-zinc-200">{modalBaixa.fornecedorNome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Documento:</span>
                <span className="font-mono text-zinc-200">{modalBaixa.numeroDocumento}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-2">
                <span className="text-zinc-400">Valor a Liquidar:</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  R$ {modalBaixa.valorNominal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-2">Origem do Recurso para Pagamento</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrigemBaixa('CONTA_BANCARIA')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    origemBaixa === 'CONTA_BANCARIA'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Landmark className="w-5 h-5" />
                  <span>Conta Bancária</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOrigemBaixa('SANGRIA_PDV')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                    origemBaixa === 'SANGRIA_PDV'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <Wallet className="w-5 h-5" />
                  <span>Sangria do Caixa PDV</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setModalBaixa(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExecutarBaixa}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-950"
              >
                Confirmar Baixa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
