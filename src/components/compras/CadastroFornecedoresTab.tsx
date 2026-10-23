import React, { useState } from 'react';
import { 
  Building2, Plus, Search, Filter, Phone, Mail, 
  MapPin, Edit, Trash2, ShoppingCart, CheckCircle2, 
  AlertCircle, DollarSign, Calendar, ChevronRight
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Fornecedor, StatusFornecedor, CategoriaFornecedor } from '../../types';
import { FornecedorModal } from './FornecedorModal';
import { NovoPedidoCompraModal } from './NovoPedidoCompraModal';

export const CadastroFornecedoresTab: React.FC = () => {
  const { fornecedores, adicionarFornecedor, atualizarFornecedor, excluirFornecedor } = useAdega();

  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<StatusFornecedor | 'TODOS'>('TODOS');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaFornecedor | 'TODAS'>('TODAS');

  const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false);
  const [fornecedorEmEdicao, setFornecedorEmEdicao] = useState<Fornecedor | null>(null);

  const [modalPedidoAberto, setModalPedidoAberto] = useState(false);
  const [fornecedorParaPedidoId, setFornecedorParaPedidoId] = useState<string | undefined>(undefined);

  const fornecedoresFiltrados = fornecedores.filter((f) => {
    const cidade = f.cidade || f.endereco?.cidade || '';
    const matchBusca = 
      f.nomeFantasia.toLowerCase().includes(busca.toLowerCase()) ||
      f.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      f.cnpj.includes(busca) ||
      cidade.toLowerCase().includes(busca.toLowerCase());

    const matchStatus = filtroStatus === 'TODOS' || f.status === filtroStatus;
    const matchCategoria = filtroCategoria === 'TODAS' || f.categoria === filtroCategoria;

    return matchBusca && matchStatus && matchCategoria;
  });

  // Métricas
  const totalFornecedores = fornecedores.length;
  const ativos = fornecedores.filter((f) => f.status === 'ATIVO').length;
  const totalGasto = fornecedores.reduce((acc, f) => acc + f.valorTotalComprado, 0);
  const totalPedidos = fornecedores.reduce((acc, f) => acc + f.totalPedidosRealizados, 0);

  const handleSalvarFornecedor = (dados: Omit<Fornecedor, 'id' | 'totalPedidosRealizados' | 'valorTotalComprado'>) => {
    if (fornecedorEmEdicao) {
      atualizarFornecedor({
        ...fornecedorEmEdicao,
        ...dados,
      });
    } else {
      adicionarFornecedor(dados);
    }
    setFornecedorEmEdicao(null);
  };

  const handleNovoPedidoParaFornecedor = (fornecedorId: string) => {
    setFornecedorParaPedidoId(fornecedorId);
    setModalPedidoAberto(true);
  };

  const getCategoriaLabel = (cat: CategoriaFornecedor) => {
    switch (cat) {
      case 'DISTRIBUIDOR_BEBIDAS':
        return 'Distribuidor de Bebidas';
      case 'IMPORTADORA_VINHOS':
        return 'Importadora de Vinhos';
      case 'CERVEJARIA_ARTESANAL':
        return 'Cervejaria Artesanal';
      case 'DESTILARIA':
        return 'Destilaria';
      case 'EMBALAGENS_DESCARTAVEIS':
        return 'Embalagens & Taças';
      case 'ALIMENTOS_TABUAS':
        return 'Alimentos & Petiscos';
      default:
        return 'Suprimentos Gerais';
    }
  };

  const getStatusBadge = (status: StatusFornecedor) => {
    switch (status) {
      case 'ATIVO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Homologado
          </span>
        );
      case 'EM_ANALISE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Em Análise
          </span>
        );
      case 'BLOQUEADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Bloqueado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Fornecedores Cadastrados</span>
            <span className="text-2xl font-bold font-mono text-zinc-100">{totalFornecedores}</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">{ativos} parceiros ativos</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Volume Total Comprado</span>
            <span className="text-xl font-bold font-mono text-amber-400">
              R$ {totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-zinc-500 block mt-0.5">Histórico consolidado</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Ordens de Compra</span>
            <span className="text-2xl font-bold font-mono text-zinc-100">{totalPedidos}</span>
            <span className="text-[11px] text-zinc-400 block mt-0.5">Pedidos efetuados</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Prazo Médio Boleto</span>
            <span className="text-xl font-bold font-mono text-zinc-100">28 a 42 Dias</span>
            <span className="text-[11px] text-emerald-400 block mt-0.5">Sem juros de faturamento</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Bar & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, razão social, CNPJ ou cidade..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="ATIVO">Homologados (Ativos)</option>
            <option value="EM_ANALISE">Em Análise</option>
            <option value="BLOQUEADO">Bloqueados</option>
          </select>

          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value as any)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="DISTRIBUIDOR_BEBIDAS">Distribuidores</option>
            <option value="IMPORTADORA_VINHOS">Importadoras de Vinho</option>
            <option value="CERVEJARIA_ARTESANAL">Cervejarias</option>
            <option value="DESTILARIA">Destilarias</option>
            <option value="EMBALAGENS_DESCARTAVEIS">Embalagens</option>
          </select>
        </div>

        <button
          onClick={() => {
            setFornecedorEmEdicao(null);
            setModalFornecedorAberto(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-950/30 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Fornecedor</span>
        </button>
      </div>

      {/* Grid de Fornecedores */}
      {fornecedoresFiltrados.length === 0 ? (
        <div className="p-12 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-3">
          <Building2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <p className="text-sm text-zinc-400">Nenhum fornecedor encontrado com os filtros selecionados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fornecedoresFiltrados.map((fornecedor) => (
            <div
              key={fornecedor.id}
              className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl p-5 space-y-4 transition-all shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                      {fornecedor.nomeFantasia}
                    </h3>
                    <p className="text-[11px] text-zinc-400 truncate max-w-[220px]" title={fornecedor.razaoSocial}>
                      {fornecedor.razaoSocial}
                    </p>
                  </div>
                  {getStatusBadge(fornecedor.status)}
                </div>

                <div className="text-[11px] font-mono text-zinc-500">
                  CNPJ: <span className="text-zinc-300">{fornecedor.cnpj}</span>
                  {fornecedor.inscricaoEstadual && (
                    <span className="block">IE: {fornecedor.inscricaoEstadual}</span>
                  )}
                </div>

                {/* Badge da Categoria */}
                <div className="inline-block px-2 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {getCategoriaLabel(fornecedor.categoria || 'DISTRIBUIDOR_BEBIDAS')}
                </div>

                {/* Contatos & Local */}
                <div className="space-y-1.5 pt-2 border-t border-zinc-800/80 text-xs text-zinc-300">
                  {(fornecedor.contatoNome || fornecedor.contatoRepresentante) && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-[11px] text-zinc-500">Vendedor:</span>
                      <span className="text-zinc-200 font-medium">{fornecedor.contatoNome || fornecedor.contatoRepresentante}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{fornecedor.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="truncate">{fornecedor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span>{fornecedor.cidade || fornecedor.endereco?.cidade} - {fornecedor.estado || fornecedor.endereco?.uf}</span>
                  </div>
                </div>

                {/* Condição & Faturamento */}
                <div className="p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">Condição:</span>
                    <span className="font-semibold text-zinc-200">{fornecedor.prazoPagamentoPadrao || fornecedor.condicaoPagamentoPadrao}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">Histórico de Compras:</span>
                    <span className="font-mono font-bold text-amber-400">
                      R$ {fornecedor.valorTotalComprado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span>{fornecedor.totalPedidosRealizados} pedidos realizados</span>
                    {fornecedor.ultimoPedidoData && <span>Último: {fornecedor.ultimoPedidoData}</span>}
                  </div>
                </div>
              </div>

              {/* Ações do Card */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setFornecedorEmEdicao(fornecedor);
                      setModalFornecedorAberto(true);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    title="Editar Cadastro"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Deseja realmente remover ou bloquear o fornecedor "${fornecedor.nomeFantasia}"?`)) {
                        excluirFornecedor(fornecedor.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                    title="Excluir ou Bloquear"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleNovoPedidoParaFornecedor(fornecedor.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/20 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Novo Pedido</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro / Edição */}
      <FornecedorModal
        isOpen={modalFornecedorAberto}
        onClose={() => {
          setModalFornecedorAberto(false);
          setFornecedorEmEdicao(null);
        }}
        onSave={handleSalvarFornecedor}
        fornecedorParaEditar={fornecedorEmEdicao}
      />

      {/* Modal de Pedido Direto */}
      <NovoPedidoCompraModal
        isOpen={modalPedidoAberto}
        onClose={() => setModalPedidoAberto(false)}
        fornecedorPreSelecionadoId={fornecedorParaPedidoId}
      />
    </div>
  );
};
