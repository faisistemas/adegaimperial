import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Edit3, Trash2, Shield, DollarSign,
  Phone, Mail, MapPin, Award, CreditCard, Clock, MessageSquare,
  AlertCircle, CheckCircle2, ChevronRight, X, Sparkles, Filter,
  TrendingUp, ShoppingBag, Lock, Unlock, Eye
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Customer, CustomerStatus, NivelFidelidade } from '../../types';

export const CadastroGestaoClientesTab: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, ajustarSaldoCreditoCliente, orders } = useAdega();

  // Estados de busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [nivelFilter, setNivelFilter] = useState<string>('TODOS');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewCustomerDetails, setViewCustomerDetails] = useState<Customer | null>(null);
  const [creditAdjustmentModal, setCreditAdjustmentModal] = useState<Customer | null>(null);

  // Formulário de Cliente (State)
  const initialFormData: Omit<Customer, 'id' | 'totalSpent' | 'ordersCount' | 'loyaltyPoints' | 'lastPurchaseDate'> = {
    name: '',
    cpf: '',
    phone: '',
    email: '',
    birthDate: '',
    tipoPessoa: 'PF',
    rgIe: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: ''
    },
    limiteCredito: 500,
    saldoCreditoAtual: 500,
    saldoCashback: 0,
    nivelFidelidade: 'BRONZE',
    status: 'ATIVO',
    preferenciaBebida: '',
    favoriteDrink: '',
    tags: ['Cliente'],
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estado para modal de crédito
  const [valorAjusteCredito, setValorAjusteCredito] = useState<number>(100);
  const [tipoOperacaoCredito, setTipoOperacaoCredito] = useState<'QUITACAO_DEBITO' | 'CONCESSAO_CREDITO' | 'AJUSTE_AVULSO'>('QUITACAO_DEBITO');
  const [motivoAjuste, setMotivoAjuste] = useState('');

  // Filtragem de clientes
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cpf && c.cpf.includes(searchTerm)) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())));

      let matchesStatus = true;
      if (statusFilter !== 'TODOS') {
        matchesStatus = c.status === statusFilter;
      }

      let matchesNivel = true;
      if (nivelFilter !== 'TODOS') {
        matchesNivel = c.nivelFidelidade === nivelFilter;
      }

      return matchesSearch && matchesStatus && matchesNivel;
    });
  }, [customers, searchTerm, statusFilter, nivelFilter]);

  // Resumo de métricas
  const totalGastoGeral = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  }, [customers]);

  const totalCreditoConcedido = useMemo(() => {
    return customers.reduce((sum, c) => sum + (c.limiteCredito || 0), 0);
  }, [customers]);

  const totalClientesAtivos = useMemo(() => {
    return customers.filter(c => c.status === 'ATIVO').length;
  }, [customers]);

  // Abrir Modal para Cadastro
  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData(initialFormData);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Abrir Modal para Edição
  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      cpf: customer.cpf || '',
      phone: customer.phone,
      email: customer.email,
      birthDate: customer.birthDate || '',
      tipoPessoa: customer.tipoPessoa || 'PF',
      rgIe: customer.rgIe || '',
      endereco: customer.endereco || {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: 'SP',
        cep: ''
      },
      limiteCredito: customer.limiteCredito || 500,
      saldoCreditoAtual: customer.saldoCreditoAtual ?? (customer.limiteCredito || 500),
      saldoCashback: customer.saldoCashback || 0,
      nivelFidelidade: customer.nivelFidelidade || 'BRONZE',
      status: customer.status || 'ATIVO',
      motivoBloqueio: customer.motivoBloqueio || '',
      preferenciaBebida: customer.preferenciaBebida || '',
      tags: customer.tags || ['Cliente'],
      observacoes: customer.observacoes || ''
    });
    setFormError(null);
    setIsFormModalOpen(true);
  };

  // Salvar formulário (Create ou Update)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Nome do cliente é obrigatório.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Telefone para contato é obrigatório.');
      return;
    }

    if (editingCustomer) {
      updateCustomer({
        ...editingCustomer,
        ...formData,
      });
      setFeedbackMessage({ type: 'success', text: `Cliente "${formData.name}" atualizado com sucesso!` });
    } else {
      addCustomer(formData);
      setFeedbackMessage({ type: 'success', text: `Cliente "${formData.name}" cadastrado com sucesso!` });
    }

    setIsFormModalOpen(false);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Excluir cliente
  const handleDelete = (customer: Customer) => {
    if (confirm(`Tem certeza que deseja excluir o cadastro de ${customer.name}?`)) {
      const res = deleteCustomer(customer.id);
      if (res.success) {
        setFeedbackMessage({ type: 'success', text: res.message || 'Cliente excluído.' });
      } else {
        setFeedbackMessage({ type: 'error', text: res.message || 'Erro ao excluir.' });
      }
      setTimeout(() => setFeedbackMessage(null), 4000);
    }
  };

  // Confirmar ajuste de crédito
  const handleConfirmarAjusteCredito = () => {
    if (!creditAdjustmentModal) return;
    const delta = tipoOperacaoCredito === 'QUITACAO_DEBITO' ? valorAjusteCredito : -valorAjusteCredito;
    ajustarSaldoCreditoCliente(creditAdjustmentModal.id, delta, motivoAjuste || 'Ajuste manual');
    setCreditAdjustmentModal(null);
    setFeedbackMessage({ type: 'success', text: `Saldo de crédito do cliente ${creditAdjustmentModal.name} ajustado com sucesso!` });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  return (
    <div id="cadastro-gestao-clientes-container" className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header & Métricas */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-white">Cadastro e Gestão de Clientes</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {customers.length} cadastrados
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              CRM, limites de crédito, níveis de fidelidade, preferências de consumo e controle cadastral.
            </p>
          </div>

          <button
            id="btn-novo-cliente"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Novo Cliente
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMessage && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/15 border border-red-500/30 text-red-400'
          }`}>
            {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedbackMessage.text}
          </div>
        )}

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Clientes Ativos</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{totalClientesAtivos}</div>
            <span className="text-[10px] text-zinc-500">De {customers.length} cadastros totais</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">LTV Acumulado</span>
            <div className="text-lg font-bold text-white mt-0.5">
              R$ {totalGastoGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">Volume total de compras</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Crédito Concedido</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              R$ {totalCreditoConcedido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-zinc-500">Limite de crédito fiado</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Nível Black / Ouro</span>
            <div className="text-lg font-bold text-amber-500 mt-0.5">
              {customers.filter(c => c.nivelFidelidade === 'BLACK' || c.nivelFidelidade === 'OURO').length}
            </div>
            <span className="text-[10px] text-zinc-500">Clientes VIP / Alta recorrência</span>
          </div>
        </div>
      </div>

      {/* Tabela de Clientes */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Filtros */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-busca-clientes"
              type="text"
              placeholder="Buscar por nome, CPF/CNPJ, telefone, email ou tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Status:</span>
              <select
                id="select-filtro-cliente-status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="TODOS">Todos os status</option>
                <option value="ATIVO">Ativo</option>
                <option value="BLOQUEADO">Bloqueado</option>
                <option value="INADIMPLENTE">Inadimplente</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-zinc-400 font-medium">Nível:</span>
              <select
                id="select-filtro-cliente-nivel"
                value={nivelFilter}
                onChange={(e) => setNivelFilter(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="TODOS">Todos os níveis</option>
                <option value="BLACK">Black VIP</option>
                <option value="OURO">Ouro</option>
                <option value="PRATA">Prata</option>
                <option value="BRONZE">Bronze</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="flex-1 overflow-auto rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Users className="w-12 h-12 stroke-[1.2] mb-2 text-zinc-600" />
              <p className="text-sm font-medium">Nenhum cliente encontrado.</p>
              <p className="text-xs text-zinc-600 mt-1">Cadastre um novo cliente clicando no botão acima.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 sticky top-0 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Contato / Endereço</th>
                  <th className="py-3 px-4">Nível Fidelidade</th>
                  <th className="py-3 px-4">Limite Crédito</th>
                  <th className="py-3 px-4">Saldo Disponível</th>
                  <th className="py-3 px-4">Total Gasto</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-medium">
                {filteredCustomers.map((customer) => {
                  const saldoCredito = customer.saldoCreditoAtual ?? (customer.limiteCredito || 0);
                  const limiteCredito = customer.limiteCredito || 0;

                  return (
                    <tr key={customer.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            customer.nivelFidelidade === 'BLACK' ? 'bg-zinc-800 text-amber-400 border border-amber-500/40' :
                            customer.nivelFidelidade === 'OURO' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            customer.nivelFidelidade === 'PRATA' ? 'bg-zinc-700 text-zinc-200' :
                            'bg-zinc-800 text-zinc-400'
                          }`}>
                            {customer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {customer.name}
                              {customer.tags && customer.tags.map((tag, i) => (
                                <span key={i} className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono">
                              {customer.tipoPessoa || 'PF'} • {customer.cpf || 'Sem CPF'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-300">
                        <div className="flex items-center gap-1 text-zinc-200">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{customer.phone}</span>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Mail className="w-2.5 h-2.5" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                          customer.nivelFidelidade === 'BLACK' ? 'bg-zinc-900 text-amber-300 border-amber-500/40' :
                          customer.nivelFidelidade === 'OURO' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                          customer.nivelFidelidade === 'PRATA' ? 'bg-slate-500/15 text-slate-300 border-slate-500/30' :
                          'bg-amber-900/20 text-amber-600 border-amber-800/30'
                        }`}>
                          ★ {customer.nivelFidelidade || 'BRONZE'}
                        </span>
                        {customer.saldoCashback && customer.saldoCashback > 0 ? (
                          <div className="text-[10px] text-emerald-400 mt-0.5">
                            Cashback: R$ {customer.saldoCashback.toFixed(2)}
                          </div>
                        ) : null}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        R$ {limiteCredito.toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={saldoCredito < limiteCredito ? 'text-amber-400' : 'text-emerald-400'}>
                          R$ {saldoCredito.toFixed(2)}
                        </span>
                        {saldoCredito < limiteCredito && (
                          <span className="text-[10px] text-red-400 block font-sans">
                            Devedor: R$ {(limiteCredito - saldoCredito).toFixed(2)}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">
                          R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {customer.ordersCount} compras
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          customer.status === 'ATIVO' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          customer.status === 'BLOQUEADO' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                          'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        }`}>
                          {customer.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Visualizar ficha completa */}
                          <button
                            id={`btn-view-customer-${customer.id}`}
                            onClick={() => setViewCustomerDetails(customer)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors"
                            title="Ver Ficha Completa do Cliente"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Ajuste de Saldo de Crédito */}
                          <button
                            id={`btn-credit-customer-${customer.id}`}
                            onClick={() => {
                              setCreditAdjustmentModal(customer);
                              setValorAjusteCredito(100);
                              setMotivoAjuste('Quitação de débito no caixa');
                            }}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 hover:text-amber-300 rounded-lg transition-colors"
                            title="Ajustar Crédito / Quitar Débito"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* Editar */}
                          <button
                            id={`btn-edit-customer-${customer.id}`}
                            onClick={() => handleOpenEditModal(customer)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
                            title="Editar Dados do Cliente"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Excluir */}
                          <button
                            id={`btn-delete-customer-${customer.id}`}
                            onClick={() => handleDelete(customer)}
                            className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                            title="Excluir Cadastro"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: CADASTRO / EDIÇÃO DE CLIENTE */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingCustomer ? 'Editar Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Preencha os dados pessoais, perfil de crédito e preferências da adega.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                {/* Tipo de Pessoa e Documentos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Tipo:</label>
                    <select
                      value={formData.tipoPessoa}
                      onChange={(e) => setFormData({ ...formData, tipoPessoa: e.target.value as 'PF' | 'PJ' })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="PF">Pessoa Física (CPF)</option>
                      <option value="PJ">Pessoa Jurídica (CNPJ)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-zinc-400 block mb-1">
                      {formData.tipoPessoa === 'PF' ? 'Nome Completo:*' : 'Razão Social / Nome Fantasia:*'}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">
                      {formData.tipoPessoa === 'PF' ? 'CPF:' : 'CNPJ:'}
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">
                      {formData.tipoPessoa === 'PF' ? 'RG / Órgão:' : 'Inscrição Estadual:'}
                    </label>
                    <input
                      type="text"
                      value={formData.rgIe}
                      onChange={(e) => setFormData({ ...formData, rgIe: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Data Nascimento / Fundação:</label>
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Contatos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Telefone / WhatsApp:*</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">E-mail:</label>
                    <input
                      type="email"
                      placeholder="cliente@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
                  <div className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    Endereço de Entrega & Cobrança
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-zinc-500 block mb-1">Logradouro (Rua/Av):</label>
                      <input
                        type="text"
                        value={formData.endereco?.logradouro}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco!, logradouro: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">Número / Comp.:</label>
                      <input
                        type="text"
                        value={formData.endereco?.numero}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco!, numero: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-zinc-500 block mb-1">Bairro:</label>
                      <input
                        type="text"
                        value={formData.endereco?.bairro}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco!, bairro: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">Cidade / UF:</label>
                      <input
                        type="text"
                        value={`${formData.endereco?.cidade || ''} - ${formData.endereco?.uf || 'SP'}`}
                        onChange={(e) => {
                          const parts = e.target.value.split('-');
                          setFormData({
                            ...formData,
                            endereco: { 
                              ...formData.endereco!, 
                              cidade: parts[0]?.trim() || '', 
                              uf: parts[1]?.trim() || 'SP' 
                            }
                          });
                        }}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-zinc-500 block mb-1">CEP:</label>
                      <input
                        type="text"
                        value={formData.endereco?.cep}
                        onChange={(e) => setFormData({
                          ...formData,
                          endereco: { ...formData.endereco!, cep: e.target.value }
                        })}
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded px-2.5 py-1.5 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Perfil de Crédito e Fidelidade */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Limite de Crédito Fiado (R$):</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={formData.limiteCredito}
                      onChange={(e) => setFormData({ ...formData, limiteCredito: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Nível Fidelidade:</label>
                    <select
                      value={formData.nivelFidelidade}
                      onChange={(e) => setFormData({ ...formData, nivelFidelidade: e.target.value as NivelFidelidade })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="BRONZE">Bronze (Padrão)</option>
                      <option value="PRATA">Prata (Desconto 3%)</option>
                      <option value="OURO">Ouro (Desconto 5% + Cashback)</option>
                      <option value="BLACK">Black VIP (Desconto 10% + Sommelier)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Status Cadastral:</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="ATIVO">Ativo</option>
                      <option value="BLOQUEADO">Bloqueado</option>
                      <option value="INADIMPLENTE">Inadimplente</option>
                    </select>
                  </div>
                </div>

                {/* Preferência e Observações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Preferência de Vinhos / Bebidas:</label>
                    <input
                      type="text"
                      placeholder="Ex: Cabernet Sauvignon encorpados, Gin artesanal..."
                      value={formData.preferenciaBebida}
                      onChange={(e) => setFormData({ ...formData, preferenciaBebida: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Tags (separadas por vírgula):</label>
                    <input
                      type="text"
                      placeholder="VIP, Sommelier, Degustação..."
                      value={formData.tags?.join(', ')}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) 
                      })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Observações Internas:</label>
                  <textarea
                    rows={2}
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white placeholder-zinc-500"
                    placeholder="Informações adicionais do cliente..."
                  />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-950">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  id="btn-salvar-cliente"
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  {editingCustomer ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUSTE DE SALDO DE CRÉDITO / QUITAÇÃO FIADO */}
      {creditAdjustmentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-white text-sm">
                  Gestão de Crédito - {creditAdjustmentModal.name}
                </h3>
              </div>
              <button
                onClick={() => setCreditAdjustmentModal(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 grid grid-cols-2 gap-3 text-center">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Limite Total</span>
                  <span className="font-bold text-white text-sm">R$ {creditAdjustmentModal.limiteCredito?.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Saldo Disponível</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    R$ {(creditAdjustmentModal.saldoCreditoAtual ?? creditAdjustmentModal.limiteCredito ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Tipo de Movimentação:</label>
                <select
                  value={tipoOperacaoCredito}
                  onChange={(e) => setTipoOperacaoCredito(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="QUITACAO_DEBITO">Quitação / Pagamento de Débito (+ Saldo Disponível)</option>
                  <option value="CONCESSAO_CREDITO">Concessão / Uso de Crédito (- Saldo Disponível)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Valor da Operação (R$):</label>
                <input
                  type="number"
                  min={1}
                  step={10}
                  value={valorAjusteCredito}
                  onChange={(e) => setValorAjusteCredito(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white font-mono font-bold text-base rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Motivo / Documento:</label>
                <input
                  type="text"
                  placeholder="Ex: Pagamento recebido via PIX, quitação semanal..."
                  value={motivoAjuste}
                  onChange={(e) => setMotivoAjuste(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-950">
              <button
                onClick={() => setCreditAdjustmentModal(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarAjusteCredito}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md"
              >
                Confirmar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FICHA 360º DO CLIENTE */}
      {viewCustomerDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm">
                  {viewCustomerDetails.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    {viewCustomerDetails.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-amber-400 border border-zinc-700">
                      ★ {viewCustomerDetails.nivelFidelidade}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Cadastrado desde {viewCustomerDetails.dataCadastro || '2024'} • {viewCustomerDetails.ordersCount} compras
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewCustomerDetails(null)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">Total Gasto</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    R$ {viewCustomerDetails.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">Saldo Cashback</span>
                  <span className="font-bold text-amber-400 text-sm">
                    R$ {(viewCustomerDetails.saldoCashback || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 block uppercase">Crédito Atual</span>
                  <span className="font-bold text-white text-sm">
                    R$ {(viewCustomerDetails.saldoCreditoAtual ?? viewCustomerDetails.limiteCredito ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Informações detalhadas */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span className="text-zinc-400">CPF / CNPJ:</span>
                  <span className="font-mono text-white">{viewCustomerDetails.cpf || 'Não informado'}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span className="text-zinc-400">Telefone:</span>
                  <span className="text-white flex items-center gap-1">
                    {viewCustomerDetails.phone}
                    <a
                      href={`https://wa.me/55${viewCustomerDetails.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                  </span>
                </div>
                <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                  <span className="text-zinc-400">E-mail:</span>
                  <span className="text-white">{viewCustomerDetails.email || 'Não informado'}</span>
                </div>
                {viewCustomerDetails.preferenciaBebida && (
                  <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                    <span className="text-zinc-400">Preferência de Bebida:</span>
                    <span className="text-amber-300">{viewCustomerDetails.preferenciaBebida}</span>
                  </div>
                )}
                {viewCustomerDetails.endereco && (
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-400">Endereço:</span>
                    <span className="text-white text-right max-w-[280px]">
                      {viewCustomerDetails.endereco.logradouro}, {viewCustomerDetails.endereco.numero} - {viewCustomerDetails.endereco.bairro}, {viewCustomerDetails.endereco.cidade}/{viewCustomerDetails.endereco.uf}
                    </span>
                  </div>
                )}
              </div>

              {/* Histórico de Compras do Cliente */}
              <div>
                <span className="font-bold text-zinc-300 uppercase tracking-wider block mb-2 text-[11px]">
                  Últimas Compras do Cliente:
                </span>
                <div className="space-y-2">
                  {orders
                    .filter(o => o.customerId === viewCustomerDetails.id || (o.customerCpf && o.customerCpf === viewCustomerDetails.cpf))
                    .slice(0, 5)
                    .map((order) => (
                      <div key={order.id} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800 flex justify-between items-center">
                        <div>
                          <span className="font-mono text-amber-400 font-bold">{order.code}</span>
                          <span className="text-zinc-500 text-[10px] ml-2">{order.createdAt}</span>
                          <div className="text-[10px] text-zinc-400">
                            {order.items.length} itens ({order.items.map(i => i.product.name).slice(0, 2).join(', ')}...)
                          </div>
                        </div>
                        <div className="text-right font-mono font-bold text-white">
                          R$ {order.total.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  {orders.filter(o => o.customerId === viewCustomerDetails.id || (o.customerCpf && o.customerCpf === viewCustomerDetails.cpf)).length === 0 && (
                    <div className="text-zinc-500 text-center py-4 bg-zinc-950/40 rounded-lg border border-zinc-800/60">
                      Nenhuma compra associada ao CPF/ID deste cliente ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end bg-zinc-950">
              <button
                onClick={() => setViewCustomerDetails(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
