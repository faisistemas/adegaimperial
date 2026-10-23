import React, { useState } from 'react';
import { 
  Settings, Building2, Clock, Calendar, Bell, 
  Shield, Save, CheckCircle2, Plus, Trash2, Wine
} from 'lucide-react';

interface DadosAdegaImperial {
  nome: string;
  cnpj: string;
  telefone: string;
  horarioFuncionamento: string;
  endereco: string;
}

interface HorarioDia {
  dia: string;
  abertura: string;
  fechamento: string;
  ativo: boolean;
}

interface FeriadoItem {
  id: string;
  data: string;
  descricao: string;
  aberto: boolean;
}

const STORAGE_KEY = 'adega_imperial_configuracoes';

export const ConfiguracoesView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'horarios' | 'feriados' | 'notificacoes' | 'auditoria'>('geral');
  const [feedback, setFeedback] = useState<string | null>(null);

  // 1. Dados Gerais da Adega Imperial
  const [dados, setDados] = useState<DadosAdegaImperial>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_dados`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return {
      nome: 'Adega Imperial LTDA',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 98765-4321',
      horarioFuncionamento: 'Seg a Dom: 10:00 - 02:00',
      endereco: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
    };
  });

  // 2. Horários de Atendimento da Adega & Salão
  const [horarios, setHorarios] = useState<HorarioDia[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_horarios`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { dia: 'Segunda-feira', abertura: '10:00', fechamento: '00:00', ativo: true },
      { dia: 'Terça-feira', abertura: '10:00', fechamento: '00:00', ativo: true },
      { dia: 'Quarta-feira', abertura: '10:00', fechamento: '01:00', ativo: true },
      { dia: 'Quinta-feira', abertura: '10:00', fechamento: '02:00', ativo: true },
      { dia: 'Sexta-feira', abertura: '10:00', fechamento: '03:00', ativo: true },
      { dia: 'Sábado', abertura: '11:00', fechamento: '04:00', ativo: true },
      { dia: 'Domingo', abertura: '12:00', fechamento: '23:00', ativo: true },
    ];
  });

  // 3. Feriados e Datas Especiais
  const [feriados, setFeriados] = useState<FeriadoItem[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_feriados`);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', data: '2026-01-01', descricao: 'Confraternização Universal (Ano Novo)', aberto: false },
      { id: '2', data: '2026-04-21', descricao: 'Tiradentes - Degustação Especial', aberto: true },
      { id: '3', data: '2026-05-01', descricao: 'Dia do Trabalho', aberto: true },
      { id: '4', data: '2026-09-07', descricao: 'Independência do Brasil', aberto: true },
      { id: '5', data: '2026-11-15', descricao: 'Proclamação da República', aberto: true },
      { id: '6', data: '2026-12-25', descricao: 'Natal', aberto: false },
    ];
  });

  // 4. Notificações do Sistema da Adega
  const [notificacoes, setNotificacoes] = useState({
    notifWhatsapp: true,
    notifSms: false,
    alertaEstoqueBaixo: true,
    alertaFechamentoCaixa: true,
    relatorioDiarioEmail: true,
  });

  // Salvar Dados
  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(`${STORAGE_KEY}_dados`, JSON.stringify(dados));
      localStorage.setItem(`${STORAGE_KEY}_horarios`, JSON.stringify(horarios));
      localStorage.setItem(`${STORAGE_KEY}_feriados`, JSON.stringify(feriados));
      setFeedback('Configurações da Adega Imperial salvas com sucesso!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setFeedback('Erro ao salvar configurações.');
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div id="modulo-configuracoes-sistema" className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-y-auto p-3 sm:p-6 pb-24 lg:pb-6 space-y-4 sm:space-y-6">
      {/* Cabeçalho da Tela (Adaptado para Adega Imperial) */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-2">
          Configurações
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Dados da Adega Imperial, horários de atendimento, feriados e notificações
        </p>
      </div>

      {/* Sub-abas de Navegação Ampliada */}
      <div className="bg-zinc-900/70 p-1.5 rounded-2xl border border-zinc-800/90 w-full max-w-4xl shadow-lg">
        <div className="flex items-center justify-between sm:justify-start gap-1 sm:gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveSubTab('geral')}
            className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'geral'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Geral</span>
          </button>

          <button
            onClick={() => setActiveSubTab('horarios')}
            className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'horarios'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Horários</span>
          </button>

          <button
            onClick={() => setActiveSubTab('feriados')}
            className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'feriados'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Calendar className="w-4 h-4 text-purple-400" />
            <span>Feriados</span>
          </button>

          <button
            onClick={() => setActiveSubTab('notificacoes')}
            className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'notificacoes'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Bell className="w-4 h-4 text-blue-400" />
            <span>Notificações</span>
          </button>

          <button
            onClick={() => setActiveSubTab('auditoria')}
            className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
              activeSubTab === 'auditoria'
                ? 'bg-zinc-800 text-white shadow-md border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Auditoria</span>
          </button>
        </div>
      </div>

      {/* Alerta de Feedback */}
      {feedback && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2 w-fit">
          <CheckCircle2 className="w-4 h-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* CONTEÚDO DA ABA GERAL (Adega Imperial) */}
      {activeSubTab === 'geral' && (
        <form onSubmit={handleSalvar} className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-7 space-y-6 max-w-4xl shadow-xl">
          {/* Card Header com Ícone de Engrenagem Verde */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <Settings className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white font-sans">
              Dados da Adega Imperial
            </h2>
          </div>

          {/* Campos do Formulário */}
          <div className="space-y-4">
            {/* Linha 1: Nome da Adega + CNPJ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                  Nome da Adega (Razão Social / Nome Fantasia)
                </label>
                <input
                  type="text"
                  value={dados.nome}
                  onChange={(e) => setDados({ ...dados, nome: e.target.value })}
                  placeholder="Adega Imperial LTDA"
                  className="w-full bg-zinc-950 border border-zinc-800/90 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={dados.cnpj}
                  onChange={(e) => setDados({ ...dados, cnpj: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="w-full bg-zinc-950 border border-zinc-800/90 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Linha 2: Telefone/WhatsApp + Horário de Funcionamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                  Telefone / WhatsApp Comercial
                </label>
                <input
                  type="text"
                  value={dados.telefone}
                  onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="w-full bg-zinc-950 border border-zinc-800/90 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                  Horário de Funcionamento (Adega & Salão)
                </label>
                <input
                  type="text"
                  value={dados.horarioFuncionamento}
                  onChange={(e) => setDados({ ...dados, horarioFuncionamento: e.target.value })}
                  placeholder="Seg a Dom: 10:00 - 02:00"
                  className="w-full bg-zinc-950 border border-zinc-800/90 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Linha 3: Endereço (Full width) */}
            <div>
              <label className="text-xs text-zinc-400 block mb-1.5 font-medium">
                Endereço Completo
              </label>
              <input
                type="text"
                value={dados.endereco}
                onChange={(e) => setDados({ ...dados, endereco: e.target.value })}
                placeholder="Rua, número, bairro, cidade e CEP"
                className="w-full bg-zinc-950 border border-zinc-800/90 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Botão de Salvar Verde */}
          <div className="pt-2">
            <button
              id="btn-salvar-configuracoes-gerais"
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações</span>
            </button>
          </div>
        </form>
      )}

      {/* CONTEÚDO DA ABA HORÁRIOS */}
      {activeSubTab === 'horarios' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-7 space-y-6 max-w-4xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white">
              Grade Semanal de Horários da Adega & Salão
            </h2>
          </div>

          <div className="space-y-3">
            {horarios.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 gap-3 text-xs">
                <span className="font-semibold text-white min-w-[140px]">{item.dia}</span>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Abertura:</span>
                  <input
                    type="time"
                    value={item.abertura}
                    onChange={(e) => {
                      const next = [...horarios];
                      next[index].abertura = e.target.value;
                      setHorarios(next);
                    }}
                    className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white font-mono"
                  />
                  <span className="text-zinc-500">Fechamento:</span>
                  <input
                    type="time"
                    value={item.fechamento}
                    onChange={(e) => {
                      const next = [...horarios];
                      next[index].fechamento = e.target.value;
                      setHorarios(next);
                    }}
                    className="bg-zinc-900 border border-zinc-700 px-2 py-1 rounded text-white font-mono"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.ativo}
                    onChange={(e) => {
                      const next = [...horarios];
                      next[index].ativo = e.target.checked;
                      setHorarios(next);
                    }}
                    className="rounded text-emerald-500 bg-zinc-900 border-zinc-700"
                  />
                  <span className="text-zinc-300">Adega em funcionamento</span>
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSalvar}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Horários da Adega</span>
          </button>
        </div>
      )}

      {/* CONTEÚDO DA ABA FERIADOS */}
      {activeSubTab === 'feriados' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-7 space-y-6 max-w-4xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-sm text-white">
                Feriados e Datas Especiais da Adega
              </h2>
            </div>
            <button
              onClick={() => {
                const novoFeriado: FeriadoItem = {
                  id: String(Date.now()),
                  data: new Date().toISOString().split('T')[0],
                  descricao: 'Novo Evento / Feriado Especial',
                  aberto: true,
                };
                setFeriados([...feriados, novoFeriado]);
              }}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              Adicionar Data
            </button>
          </div>

          <div className="space-y-2">
            {feriados.map((f, i) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs gap-3">
                <input
                  type="date"
                  value={f.data}
                  onChange={(e) => {
                    const next = [...feriados];
                    next[i].data = e.target.value;
                    setFeriados(next);
                  }}
                  className="bg-zinc-900 border border-zinc-700 px-2.5 py-1 rounded text-white font-mono"
                />
                <input
                  type="text"
                  value={f.descricao}
                  onChange={(e) => {
                    const next = [...feriados];
                    next[i].descricao = e.target.value;
                    setFeriados(next);
                  }}
                  className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-1 rounded text-white"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={f.aberto}
                    onChange={(e) => {
                      const next = [...feriados];
                      next[i].aberto = e.target.checked;
                      setFeriados(next);
                    }}
                    className="rounded text-emerald-500 bg-zinc-900 border-zinc-700"
                  />
                  <span className={f.aberto ? 'text-emerald-400' : 'text-zinc-500'}>
                    {f.aberto ? 'Aberta normal' : 'Fechada'}
                  </span>
                </label>
                <button
                  onClick={() => setFeriados(feriados.filter(item => item.id !== f.id))}
                  className="p-1 text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleSalvar}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Feriados</span>
          </button>
        </div>
      )}

      {/* CONTEÚDO DA ABA NOTIFICAÇÕES */}
      {activeSubTab === 'notificacoes' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-7 space-y-6 max-w-4xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white">
              Canais e Notificações da Adega
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">WhatsApp para Clientes (Reservas & Mesas)</span>
                <span className="text-zinc-400 text-[11px]">Envia confirmação instantânea de reservas de mesas e degustações guiadas</span>
              </div>
              <input
                type="checkbox"
                checked={notificacoes.notifWhatsapp}
                onChange={(e) => setNotificacoes({ ...notificacoes, notifWhatsapp: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Alerta de Estoque Mínimo de Rótulos & Bebidas</span>
                <span className="text-zinc-400 text-[11px]">Avisa quando garrafas ou barris atingirem o ponto de pedido ao fornecedor</span>
              </div>
              <input
                type="checkbox"
                checked={notificacoes.alertaEstoqueBaixo}
                onChange={(e) => setNotificacoes({ ...notificacoes, alertaEstoqueBaixo: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
              <div>
                <span className="font-bold text-white block">Resumo do Fechamento de Caixa por E-mail</span>
                <span className="text-zinc-400 text-[11px]">Envia relatório financeiro e quebras de caixa ao gestor da adega ao fim do turno</span>
              </div>
              <input
                type="checkbox"
                checked={notificacoes.alertaFechamentoCaixa}
                onChange={(e) => setNotificacoes({ ...notificacoes, alertaFechamentoCaixa: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-900 border-zinc-700"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={() => {
              setFeedback('Preferências de notificação da adega salvas com sucesso!');
              setTimeout(() => setFeedback(null), 3000);
            }}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Notificações</span>
          </button>
        </div>
      )}

      {/* CONTEÚDO DA ABA AUDITORIA */}
      {activeSubTab === 'auditoria' && (
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-5 sm:p-7 space-y-4 max-w-4xl shadow-xl text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm text-white">
              Trilha de Auditoria de Parâmetros da Adega Imperial
            </h2>
          </div>

          <div className="divide-y divide-zinc-800 bg-zinc-950 rounded-xl border border-zinc-800">
            <div className="p-3 flex items-center justify-between text-zinc-300">
              <div>
                <span className="font-bold text-white">Alteração do Horário de Atendimento da Adega</span>
                <span className="text-zinc-500 block text-[10px]">Operador: Carlos Albuquerque (Super Admin)</span>
              </div>
              <span className="text-zinc-400 font-mono text-[10px]">Hoje, 03:45</span>
            </div>
            <div className="p-3 flex items-center justify-between text-zinc-300">
              <div>
                <span className="font-bold text-white">Atualização dos Dados Cadastrais / CNPJ da Adega</span>
                <span className="text-zinc-500 block text-[10px]">Operador: Carlos Albuquerque (Super Admin)</span>
              </div>
              <span className="text-zinc-400 font-mono text-[10px]">Ontem, 18:20</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
