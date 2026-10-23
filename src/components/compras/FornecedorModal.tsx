import React, { useState } from 'react';
import { X, Building2, Phone, Mail, MapPin, CreditCard, Clock, Save, AlertCircle } from 'lucide-react';
import { Fornecedor, CategoriaFornecedor, StatusFornecedor } from '../../types';

interface FornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fornecedor: Omit<Fornecedor, 'id' | 'totalPedidosRealizados' | 'valorTotalComprado'>) => void;
  fornecedorParaEditar?: Fornecedor | null;
}

export const FornecedorModal: React.FC<FornecedorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  fornecedorParaEditar,
}) => {
  if (!isOpen) return null;

  const [razaoSocial, setRazaoSocial] = useState(fornecedorParaEditar?.razaoSocial || '');
  const [nomeFantasia, setNomeFantasia] = useState(fornecedorParaEditar?.nomeFantasia || '');
  const [cnpj, setCnpj] = useState(fornecedorParaEditar?.cnpj || '');
  const [inscricaoEstadual, setInscricaoEstadual] = useState(fornecedorParaEditar?.inscricaoEstadual || '');
  const [categoria, setCategoria] = useState<CategoriaFornecedor>(fornecedorParaEditar?.categoria || 'DISTRIBUIDOR_BEBIDAS');
  const [contatoNome, setContatoNome] = useState(fornecedorParaEditar?.contatoNome || '');
  const [telefone, setTelefone] = useState(fornecedorParaEditar?.telefone || '');
  const [email, setEmail] = useState(fornecedorParaEditar?.email || '');
  const [endereco, setEndereco] = useState(fornecedorParaEditar?.endereco || '');
  const [cidade, setCidade] = useState(fornecedorParaEditar?.cidade || 'São Paulo');
  const [estado, setEstado] = useState(fornecedorParaEditar?.estado || 'SP');
  const [prazoPagamentoPadrao, setPrazoPagamentoPadrao] = useState(fornecedorParaEditar?.prazoPagamentoPadrao || '28 Dias (Boleto)');
  const [chavePix, setChavePix] = useState(fornecedorParaEditar?.chavePix || '');
  const [status, setStatus] = useState<StatusFornecedor>(fornecedorParaEditar?.status || 'ATIVO');
  const [observacoes, setObservacoes] = useState(fornecedorParaEditar?.observacoes || '');
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeFantasia.trim() || !cnpj.trim()) {
      setErro('Informe pelo menos o Nome Fantasia e o CNPJ do fornecedor.');
      return;
    }

    onSave({
      razaoSocial: razaoSocial.trim() || nomeFantasia.trim(),
      nomeFantasia: nomeFantasia.trim(),
      cnpj: cnpj.trim(),
      inscricaoEstadual: inscricaoEstadual.trim() || undefined,
      categoria,
      contatoNome: contatoNome.trim() || undefined,
      telefone: telefone.trim(),
      email: email.trim(),
      endereco: endereco.trim() || undefined,
      cidade: cidade.trim(),
      estado: estado.trim().toUpperCase(),
      prazoPagamentoPadrao: prazoPagamentoPadrao.trim(),
      chavePix: chavePix.trim() || undefined,
      status,
      observacoes: observacoes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100">
                {fornecedorParaEditar ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
              </h2>
              <p className="text-xs text-zinc-400">
                Gestão de parceiros comerciais, distribuidores e prazos de faturamento
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {erro && (
            <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* Identificação */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nome Fantasia <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={nomeFantasia}
                onChange={(e) => setNomeFantasia(e.target.value)}
                placeholder="Ex: Ambev Distribuidora SP"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Razão Social
              </label>
              <input
                type="text"
                value={razaoSocial}
                onChange={(e) => setRazaoSocial(e.target.value)}
                placeholder="Ex: Companhia de Bebidas das Américas"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                CNPJ <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Inscrição Estadual (IE)
              </label>
              <input
                type="text"
                value={inscricaoEstadual}
                onChange={(e) => setInscricaoEstadual(e.target.value)}
                placeholder="Ex: 110.245.890.112"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Categoria Comercial
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaFornecedor)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="DISTRIBUIDOR_BEBIDAS">Distribuidor de Bebidas</option>
                <option value="IMPORTADORA_VINHOS">Importadora de Vinhos</option>
                <option value="CERVEJARIA_ARTESANAL">Cervejaria Artesanal / Barris</option>
                <option value="DESTILARIA">Destilaria / Licores</option>
                <option value="EMBALAGENS_DESCARTAVEIS">Embalagens & Taças</option>
                <option value="ALIMENTOS_TABUAS">Alimentos & Petiscos</option>
                <option value="OUTROS">Outros Suprimentos</option>
              </select>
            </div>
          </div>

          {/* Contato & Vendedor */}
          <div className="p-4 bg-zinc-950/60 border border-zinc-800/80 rounded-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> Contato & Representante
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nome do Vendedor / Representante
                </label>
                <input
                  type="text"
                  value={contatoNome}
                  onChange={(e) => setContatoNome(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  E-mail Comercial / Pedidos
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pedidos@fornecedor.com.br"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" /> Endereço / Galpão de Distribuição
              </label>
              <input
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Av. Presidente Wilson, 2800 - Ipiranga"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Cidade</label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">UF</label>
                <input
                  type="text"
                  maxLength={2}
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm uppercase text-center font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Condições de Faturamento & PIX */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" /> Prazo de Pagamento Padrão
              </label>
              <input
                type="text"
                value={prazoPagamentoPadrao}
                onChange={(e) => setPrazoPagamentoPadrao(e.target.value)}
                placeholder="Ex: 28 Dias (Boleto)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" /> Chave PIX Financeiro
              </label>
              <input
                type="text"
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                placeholder="CNPJ, E-mail ou Aleatória"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Status de Homologação
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFornecedor)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="ATIVO">Ativo / Homologado</option>
                <option value="EM_ANALISE">Em Análise Cadastral</option>
                <option value="BLOQUEADO">Bloqueado para Pedidos</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Observações Comerciais & Descontos por Volume
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Pedido mínimo de R$ 1.500 para frete CIF. Desconto de 5% no pagamento à vista via PIX."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
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
              <Save className="w-4 h-4" />
              <span>Salvar Fornecedor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
