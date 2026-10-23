import React, { useState } from 'react';
import { 
  Settings, Building2, Store, Package, Bike, 
  Shield, Check, Save, RotateCcw, AlertCircle,
  HelpCircle, Lock, Percent, Clock, DollarSign
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { AppSettings } from '../../types/financeiroGestaoTypes';

export const ConfiguracoesAppTab: React.FC = () => {
  const { appSettings, updateAppSettings } = useAdega();

  const [formState, setFormState] = useState<AppSettings>(appSettings);
  const [activeTab, setActiveTab] = useState<'EMPRESA' | 'PDV' | 'ESTOQUE' | 'DELIVERY' | 'SEGURANCA'>('EMPRESA');
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  const handleChange = <K extends keyof AppSettings>(
    section: K, 
    field: keyof AppSettings[K], 
    value: any
  ) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    updateAppSettings(formState);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Configurações */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Configurações Gerais da Aplicação
              </h2>
              <p className="text-xs text-zinc-400">
                Parâmetros fiscais, regras de PDV, limites de alçada, políticas de estoque e delivery.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {salvoFeedback && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl font-mono animate-fade-in">
              <Check className="w-4 h-4" /> Configurações salvas!
            </span>
          )}
          <button
            onClick={handleSalvar}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-950 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      {/* Navegação de Abas de Configurações */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('EMPRESA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'EMPRESA'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dados da Empresa</span>
        </button>

        <button
          onClick={() => setActiveTab('PDV')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'PDV'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Parâmetros de PDV</span>
        </button>

        <button
          onClick={() => setActiveTab('ESTOQUE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'ESTOQUE'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Políticas de Estoque</span>
        </button>

        <button
          onClick={() => setActiveTab('DELIVERY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'DELIVERY'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Expedição & Delivery</span>
        </button>

        <button
          onClick={() => setActiveTab('SEGURANCA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'SEGURANCA'
              ? 'bg-zinc-800 text-amber-400 border border-zinc-700 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Segurança & Alçadas</span>
        </button>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSalvar} className="space-y-6">
        {/* ABA: DADOS DA EMPRESA */}
        {activeTab === 'EMPRESA' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              Identificação Fiscal e Cadastral do Estabelecimento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Razão Social</label>
                <input
                  type="text"
                  value={formState.empresa.razaoSocial}
                  onChange={(e) => handleChange('empresa', 'razaoSocial', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  value={formState.empresa.nomeFantasia}
                  onChange={(e) => handleChange('empresa', 'nomeFantasia', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">CNPJ</label>
                <input
                  type="text"
                  value={formState.empresa.cnpj}
                  onChange={(e) => handleChange('empresa', 'cnpj', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Inscrição Estadual (IE)</label>
                <input
                  type="text"
                  value={formState.empresa.inscricaoEstadual}
                  onChange={(e) => handleChange('empresa', 'inscricaoEstadual', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Telefone / WhatsApp Comercial</label>
                <input
                  type="text"
                  value={formState.empresa.telefone}
                  onChange={(e) => handleChange('empresa', 'telefone', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">E-mail Comercial</label>
                <input
                  type="email"
                  value={formState.empresa.email}
                  onChange={(e) => handleChange('empresa', 'email', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Regime Tributário</label>
                <select
                  value={formState.empresa.regimeTributario}
                  onChange={(e) => handleChange('empresa', 'regimeTributario', e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                >
                  <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                  <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                  <option value="LUCRO_REAL">Lucro Real</option>
                  <option value="MEI">Microempreendedor Individual (MEI)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">CEP</label>
                <input
                  type="text"
                  value={formState.empresa.cep}
                  onChange={(e) => handleChange('empresa', 'cep', e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-zinc-400 block mb-1">Logradouro / Rua</label>
                  <input
                    type="text"
                    value={formState.empresa.logradouro}
                    onChange={(e) => handleChange('empresa', 'logradouro', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Número</label>
                  <input
                    type="text"
                    value={formState.empresa.numero}
                    onChange={(e) => handleChange('empresa', 'numero', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Bairro</label>
                  <input
                    type="text"
                    value={formState.empresa.bairro}
                    onChange={(e) => handleChange('empresa', 'bairro', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Cidade</label>
                  <input
                    type="text"
                    value={formState.empresa.cidade}
                    onChange={(e) => handleChange('empresa', 'cidade', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">UF (Estado)</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formState.empresa.uf}
                    onChange={(e) => handleChange('empresa', 'uf', e.target.value.toUpperCase())}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono uppercase text-zinc-100 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA: PARÂMETROS DE PDV */}
        {activeTab === 'PDV' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Store className="w-4 h-4 text-amber-400" />
              Taxas, Couvert e Regras de Operação de Balcão e Mesas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Fundo de Troco Padrão de Caixa (R$)</label>
                <input
                  type="number"
                  step="10"
                  value={formState.pdv.fundoTrocoPadrao}
                  onChange={(e) => handleChange('pdv', 'fundoTrocoPadrao', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Alerta Sugestão de Sangria (R$ em dinheiro)</label>
                <input
                  type="number"
                  step="50"
                  value={formState.pdv.alertaSangriaValor}
                  onChange={(e) => handleChange('pdv', 'alertaSangriaValor', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-400 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Taxa de Serviço Padrão em Mesas (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.pdv.taxaServicoPadraoPercent}
                  onChange={(e) => handleChange('pdv', 'taxaServicoPadraoPercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Couvert Artístico por Pessoa (R$)</label>
                <input
                  type="number"
                  step="1"
                  value={formState.pdv.couvertArtisticoPadrao}
                  onChange={(e) => handleChange('pdv', 'couvertArtisticoPadrao', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Limite Desconto sem Gerente (%)</label>
                <input
                  type="number"
                  step="1"
                  value={formState.pdv.limiteDescontoSemGerentePercent}
                  onChange={(e) => handleChange('pdv', 'limiteDescontoSemGerentePercent', parseFloat(e.target.value) || 0)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-400 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Bloqueio Automático por Inatividade (minutos)</label>
                <input
                  type="number"
                  step="1"
                  value={formState.pdv.tempoInatividadeBloqueioMinutos}
                  onChange={(e) => handleChange('pdv', 'tempoInatividadeBloqueioMinutos', parseInt(e.target.value) || 10)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.pdv.biparComSom}
                    onChange={(e) => handleChange('pdv', 'biparComSom', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Emitir bipe sonoro na leitura de códigos de barras / RFID</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.pdv.impressaoAutomaticaComprovante}
                    onChange={(e) => handleChange('pdv', 'impressaoAutomaticaComprovante', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Impressão automática de comprovante térmico ao finalizar venda</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ABA: POLÍTICAS DE ESTOQUE */}
        {activeTab === 'ESTOQUE' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-400" />
              Controle de Ponto de Pedido, Validades e Chopp
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Estoque Mínimo Padrão Geral (unidades)</label>
                <input
                  type="number"
                  value={formState.estoque.estoqueMinimoPadraoGeral}
                  onChange={(e) => handleChange('estoque', 'estoqueMinimoPadraoGeral', parseInt(e.target.value) || 5)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Alerta Preventivo de Validade (dias antes do vencimento)</label>
                <input
                  type="number"
                  value={formState.estoque.notificarValidadeProximaDias}
                  onChange={(e) => handleChange('estoque', 'notificarValidadeProximaDias', parseInt(e.target.value) || 30)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-amber-400 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Tolerância Máxima de Perda em Chopp (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.estoque.toleranciaPerdaChoppPercent}
                  onChange={(e) => handleChange('estoque', 'toleranciaPerdaChoppPercent', parseFloat(e.target.value) || 5)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.estoque.bloquearVendaSemEstoque}
                    onChange={(e) => handleChange('estoque', 'bloquearVendaSemEstoque', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Bloquear venda no PDV se o estoque estiver zerado</span>
                    <span className="text-[11px] text-zinc-500">Impede que operadores lancem produtos com saldo zerado ou negativo</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.estoque.exigirAberturaGarrafaFracionada}
                    onChange={(e) => handleChange('estoque', 'exigirAberturaGarrafaFracionada', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Exigir registro de abertura de garrafa para doses e fracionados</span>
                    <span className="text-[11px] text-zinc-500">Dose só pode ser servida se houver garrafa aberta cadastrada</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ABA: DELIVERY */}
        {activeTab === 'DELIVERY' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-400" />
              Parâmetros de Raio, Taxas e Despacho de Delivery
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Tempo Médio Estimado de Entrega (min)</label>
                <input
                  type="number"
                  value={formState.delivery.tempoMedioEntregaMinutos}
                  onChange={(e) => handleChange('delivery', 'tempoMedioEntregaMinutos', parseInt(e.target.value) || 40)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Taxa Fixa Base de Entrega (R$)</label>
                <input
                  type="number"
                  step="0.5"
                  value={formState.delivery.taxaEntregaBase}
                  onChange={(e) => handleChange('delivery', 'taxaEntregaBase', parseFloat(e.target.value) || 8)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-emerald-400 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1">Raio Máximo de Atendimento (km)</label>
                <input
                  type="number"
                  value={formState.delivery.raioMaximoEntregaKm}
                  onChange={(e) => handleChange('delivery', 'raioMaximoEntregaKm', parseFloat(e.target.value) || 10)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-zinc-100 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.delivery.exigirMotoboyCadastradoDespacho}
                    onChange={(e) => handleChange('delivery', 'exigirMotoboyCadastradoDespacho', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Exigir motoboy cadastrado para despachar entrega</span>
                    <span className="text-[11px] text-zinc-500">Garante o acerto de diárias e comissões por corrida</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.delivery.aplicarTaxaServicoDelivery}
                    onChange={(e) => handleChange('delivery', 'aplicarTaxaServicoDelivery', e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block">Aplicar taxa de serviço também sobre pedidos de delivery</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ABA: SEGURANÇA E ALÇADAS */}
        {activeTab === 'SEGURANCA' && (
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-5 shadow-lg">
            <h3 className="text-sm font-bold text-zinc-100 border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Políticas de Auditoria, PIN Gerencial e Backups
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={formState.pdv.exigirSenhaGerenteSangria}
                  onChange={(e) => handleChange('pdv', 'exigirSenhaGerenteSangria', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Exigir PIN de Gerente / Admin para Sangrias de Caixa</span>
                  <span className="text-[11px] text-zinc-500">Impede retiradas em dinheiro sem autorização expressa</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={formState.pdv.exigirSenhaGerenteCancelamento}
                  onChange={(e) => handleChange('pdv', 'exigirSenhaGerenteCancelamento', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Exigir PIN de Gerente para Cancelamento de Itens ou Vendas</span>
                  <span className="text-[11px] text-zinc-500">Registra o motivo da perda ou erro na trilha de auditoria</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={formState.pdv.exigirConferenciaCegaFechamento}
                  onChange={(e) => handleChange('pdv', 'exigirConferenciaCegaFechamento', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Exigir Fechamento Cego de Caixa</span>
                  <span className="text-[11px] text-zinc-500">Operador digita os valores sem consultar o saldo total do sistema</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={formState.seguranca.auditarTodasOperacoesCriticas}
                  onChange={(e) => handleChange('seguranca', 'auditarTodasOperacoesCriticas', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-900 border-zinc-700"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Auditar todas as operações críticas e movimentações sensíveis</span>
                  <span className="text-[11px] text-zinc-500">Alimenta a trilha de segurança e compliance</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 bg-zinc-950 border border-zinc-800 rounded-xl">
                <input
                  type="checkbox"
                  checked={formState.seguranca.salvarBackupLocalAutomatico}
                  onChange={(e) => handleChange('seguranca', 'salvarBackupLocalAutomatico', e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-zinc-950 border-zinc-700"
                />
                <div>
                  <span className="text-xs font-semibold text-zinc-200 block">Salvar backup local automático no navegador</span>
                  <span className="text-[11px] text-zinc-500">Frequência programada: a cada {formState.seguranca.frequenciaBackupHoras} horas</span>
                </div>
              </label>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
