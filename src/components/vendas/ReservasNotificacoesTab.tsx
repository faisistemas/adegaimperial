import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Users, Send, CheckCircle2, AlertCircle,
  XCircle, Phone, MapPin, Wine, MessageSquare, Plus, Search, Filter,
  Check, X, Eye, Bell, Sparkles, MessageCircle, ChevronRight
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ReservaMesaAmbiente, NotificacaoReserva } from '../../types';

export const ReservasNotificacoesTab: React.FC = () => {
  const { 
    reservas, 
    tables, 
    customers, 
    criarReserva, 
    atualizarStatusReserva, 
    fazerCheckinReserva, 
    cancelarReserva, 
    enviarNotificacaoReserva 
  } = useAdega();

  // Sub-abas locais: 'reservas' | 'notificacoes_historico'
  const [subView, setSubView] = useState<'reservas' | 'notificacoes_historico'>('reservas');

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [dataFilter, setDataFilter] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [ambienteFilter, setAmbienteFilter] = useState<string>('TODOS');

  // Modais
  const [isNewReservaModalOpen, setIsNewReservaModalOpen] = useState(false);
  const [notificationModalReserva, setNotificationModalReserva] = useState<ReservaMesaAmbiente | null>(null);
  const [viewReservaDetails, setViewReservaDetails] = useState<ReservaMesaAmbiente | null>(null);

  // Formulário de Nova Reserva
  const initialReservaForm = {
    clienteNome: '',
    clienteTelefone: '',
    clienteEmail: '',
    dataReserva: new Date().toISOString().split('T')[0],
    horario: '20:00',
    quantidadePessoas: 2,
    ambiente: 'Salão Principal' as ReservaMesaAmbiente['ambiente'],
    mesaId: undefined as number | undefined,
    tipoReserva: 'MESA_COMUM' as ReservaMesaAmbiente['tipoReserva'],
    caucaoValor: 0,
    caucaoPago: false,
    garrafaPreReservada: '',
    observacoes: ''
  };

  const [formData, setFormData] = useState(initialReservaForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Estado do Modal de Envio de Notificação
  const [notifTipo, setNotifTipo] = useState<'CONFIRMACAO' | 'LEMBRETE_2H' | 'ALTERACAO' | 'CANCELAMENTO'>('LEMBRETE_2H');
  const [notifCustomText, setNotifCustomText] = useState('');

  // Filtragem de Reservas
  const filteredReservas = useMemo(() => {
    const hojeStr = new Date().toLocaleDateString('pt-BR');

    return reservas.filter(res => {
      const matchesSearch = 
        res.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.clienteTelefone.includes(searchTerm) ||
        (res.observacoes && res.observacoes.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchesStatus = true;
      if (statusFilter !== 'TODOS') {
        matchesStatus = res.status === statusFilter;
      }

      let matchesAmbiente = true;
      if (ambienteFilter !== 'TODOS') {
        matchesAmbiente = res.ambiente === ambienteFilter;
      }

      let matchesData = true;
      if (dataFilter === 'HOJE') {
        matchesData = res.dataReserva === hojeStr || res.dataReserva === new Date().toISOString().split('T')[0];
      }

      return matchesSearch && matchesStatus && matchesAmbiente && matchesData;
    });
  }, [reservas, searchTerm, statusFilter, ambienteFilter, dataFilter]);

  // Coleta de todas as notificações enviadas
  const todasNotificacoes = useMemo(() => {
    const list: NotificacaoReserva[] = [];
    reservas.forEach(r => {
      if (r.notificacoes && r.notificacoes.length > 0) {
        list.push(...r.notificacoes);
      }
    });
    return list.sort((a, b) => b.dataHora.localeCompare(a.dataHora));
  }, [reservas]);

  // Submeter formulário de reserva
  const handleSalvarReserva = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clienteNome.trim()) {
      setFormError('Nome do cliente é obrigatório.');
      return;
    }
    if (!formData.clienteTelefone.trim()) {
      setFormError('Telefone para contato é obrigatório.');
      return;
    }

    // Se vinculou mesa, busca o número da mesa
    let mesaNum: string | undefined = undefined;
    if (formData.mesaId) {
      const mesa = tables.find(t => t.id === formData.mesaId);
      if (mesa) mesaNum = String(mesa.number);
    }

    // Converte data ISO yyyy-mm-dd para formato pt-BR dd/mm/yyyy para exibição padrão
    const dataParts = formData.dataReserva.split('-');
    const dataFormatada = dataParts.length === 3 ? `${dataParts[2]}/${dataParts[1]}/${dataParts[0]}` : formData.dataReserva;

    const nova = criarReserva({
      clienteNome: formData.clienteNome,
      clienteTelefone: formData.clienteTelefone,
      clienteEmail: formData.clienteEmail,
      dataReserva: dataFormatada,
      horario: formData.horario,
      quantidadePessoas: formData.quantidadePessoas,
      ambiente: formData.ambiente,
      mesaId: formData.mesaId,
      mesaNumero: mesaNum,
      status: 'CONFIRMADA',
      tipoReserva: formData.tipoReserva,
      caucaoValor: formData.caucaoValor,
      caucaoPago: formData.caucaoPago,
      garrafaPreReservada: formData.garrafaPreReservada,
      observacoes: formData.observacoes
    });

    setFeedback({
      success: true,
      message: `Reserva ${nova.codigo} cadastrada com sucesso para ${nova.clienteNome}! Notificação de confirmação enviada.`
    });

    setIsNewReservaModalOpen(false);
    setTimeout(() => setFeedback(null), 4000);
  };

  // Enviar notificação customizada
  const handleEnviarNotificacao = () => {
    if (!notificationModalReserva) return;
    const res = enviarNotificacaoReserva(notificationModalReserva.id, notifTipo, notifCustomText || undefined);
    setNotificationModalReserva(null);
    setFeedback({ success: res.success, message: res.mensagem });
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div id="reservas-notificacoes-container" className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Top Header & Métricas */}
      <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-6 py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-bold tracking-tight text-white">Reservas & Notificações</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {reservas.filter(r => r.status !== 'CANCELADA').length} ativas
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Agendamento de mesas, experiências de degustação guiada, lockers e confirmação via WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternância de Sub-aba */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
              <button
                onClick={() => setSubView('reservas')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  subView === 'reservas' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Reservas ({reservas.length})
              </button>
              <button
                onClick={() => setSubView('notificacoes_historico')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  subView === 'notificacoes_historico' ? 'bg-amber-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Notificações ({todasNotificacoes.length})
              </button>
            </div>

            <button
              id="btn-nova-reserva"
              onClick={() => {
                setFormData(initialReservaForm);
                setFormError(null);
                setIsNewReservaModalOpen(true);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Reserva
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-3 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            feedback.success
              ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/15 border border-red-500/30 text-red-400'
          }`}>
            {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {feedback.message}
          </div>
        )}

        {/* Mini KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Confirmadas</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {reservas.filter(r => r.status === 'CONFIRMADA').length}
            </div>
            <span className="text-[10px] text-zinc-500">Prontas para recepção</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Pessoas Esperadas</span>
            <div className="text-lg font-bold text-amber-400 mt-0.5">
              {reservas.filter(r => r.status !== 'CANCELADA').reduce((sum, r) => sum + r.quantidadePessoas, 0)} pax
            </div>
            <span className="text-[10px] text-zinc-500">Capacidade reservada</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Degustações & VIP</span>
            <div className="text-lg font-bold text-purple-400 mt-0.5">
              {reservas.filter(r => r.tipoReserva !== 'MESA_COMUM').length}
            </div>
            <span className="text-[10px] text-zinc-500">Experiências especiais</span>
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Lembretes Disparados</span>
            <div className="text-lg font-bold text-blue-400 mt-0.5">
              {todasNotificacoes.length}
            </div>
            <span className="text-[10px] text-zinc-500">Via WhatsApp automatizado</span>
          </div>
        </div>
      </div>

      {/* VIEW 1: RESERVAS */}
      {subView === 'reservas' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          {/* Filtros */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-busca-reservas"
                type="text"
                placeholder="Buscar por código, cliente, telefone ou observação..."
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
                <span className="text-xs text-zinc-400 font-medium">Data:</span>
                <select
                  id="select-filtro-reserva-data"
                  value={dataFilter}
                  onChange={(e) => setDataFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODAS">Todas as datas</option>
                  <option value="HOJE">Apenas Hoje</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-medium">Status:</span>
                <select
                  id="select-filtro-reserva-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODOS">Todos os status</option>
                  <option value="CONFIRMADA">Confirmadas</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="CLIENTE_PRESENTE">Cliente Presente (Check-in)</option>
                  <option value="CONCLUIDA">Concluídas</option>
                  <option value="CANCELADA">Canceladas</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-400 font-medium">Ambiente:</span>
                <select
                  id="select-filtro-reserva-ambiente"
                  value={ambienteFilter}
                  onChange={(e) => setAmbienteFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODOS">Todos os ambientes</option>
                  <option value="Salão Principal">Salão Principal</option>
                  <option value="Deck Externo">Deck Externo</option>
                  <option value="Balcão VIP">Balcão VIP</option>
                  <option value="Adega Subterrânea">Adega Subterrânea</option>
                  <option value="Lounge VIP">Lounge VIP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards de Reservas */}
          <div className="flex-1 overflow-auto">
            {filteredReservas.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-zinc-900/40 rounded-xl border border-zinc-800/80">
                <CalendarIcon className="w-12 h-12 stroke-[1.2] mb-2 text-zinc-600" />
                <p className="text-sm font-medium">Nenhuma reserva encontrada.</p>
                <p className="text-xs text-zinc-600 mt-1">Clique em "Nova Reserva" para agendar uma mesa ou degustação.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReservas.map((res) => (
                  <div
                    key={res.id}
                    className={`bg-zinc-900/80 border rounded-xl p-4 flex flex-col justify-between transition-all hover:border-zinc-700 ${
                      res.status === 'CLIENTE_PRESENTE' ? 'border-emerald-500/40 bg-emerald-950/10' :
                      res.status === 'CONFIRMADA' ? 'border-amber-500/30' :
                      res.status === 'CANCELADA' ? 'border-zinc-800 opacity-60' :
                      'border-zinc-800'
                    }`}
                  >
                    <div>
                      {/* Top Info */}
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2.5">
                        <span className="font-mono font-bold text-amber-400 text-xs">
                          {res.codigo}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                          res.status === 'CONFIRMADA' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                          res.status === 'CLIENTE_PRESENTE' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' :
                          res.status === 'PENDENTE' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                          res.status === 'CONCLUIDA' ? 'bg-zinc-800 text-zinc-300' :
                          'bg-red-500/15 text-red-400 border border-red-500/20'
                        }`}>
                          {res.status === 'CONFIRMADA' && 'Confirmada'}
                          {res.status === 'CLIENTE_PRESENTE' && 'Cliente na Casa'}
                          {res.status === 'PENDENTE' && 'Pendente'}
                          {res.status === 'CONCLUIDA' && 'Concluída'}
                          {res.status === 'CANCELADA' && 'Cancelada'}
                        </span>
                      </div>

                      {/* Nome e Pessoas */}
                      <div className="mt-3">
                        <h4 className="font-bold text-white text-base leading-tight">
                          {res.clienteNome}
                        </h4>
                        <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          <span>{res.clienteTelefone}</span>
                        </div>
                      </div>

                      {/* Horário, Setor e Mesa */}
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80">
                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Data & Hora</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {res.dataReserva} às {res.horario}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Ambiente / Mesa</span>
                          <span className="text-zinc-200 font-semibold">
                            {res.ambiente} {res.mesaNumero ? `(Mesa ${res.mesaNumero})` : ''}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Qtd. Pessoas</span>
                          <span className="text-white font-semibold flex items-center gap-1">
                            <Users className="w-3 h-3 text-zinc-400" />
                            {res.quantidadePessoas} lugares
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-zinc-500 block uppercase">Experiência</span>
                          <span className="text-purple-300 font-semibold text-[11px] truncate block">
                            {res.tipoReserva === 'MESA_COMUM' && 'Mesa Convencional'}
                            {res.tipoReserva === 'DEGUSTACAO_GUIADA' && '🍷 Degustação Guiada'}
                            {res.tipoReserva === 'ANIVERSARIO_EVENTO' && '🎉 Aniversário'}
                            {res.tipoReserva === 'CLUBE_WHISKY_LOCKER' && '🥃 Clube do Whisky'}
                          </span>
                        </div>
                      </div>

                      {res.garrafaPreReservada && (
                        <div className="mt-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded flex items-center gap-1.5">
                          <Wine className="w-3.5 h-3.5" />
                          Pré-reservado: {res.garrafaPreReservada}
                        </div>
                      )}

                      {res.observacoes && (
                        <p className="mt-2 text-[11px] text-zinc-400 italic line-clamp-2">
                          "{res.observacoes}"
                        </p>
                      )}
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between gap-1.5">
                      {res.status !== 'CANCELADA' && res.status !== 'CONCLUIDA' && (
                        <>
                          {res.status !== 'CLIENTE_PRESENTE' ? (
                            <button
                              id={`btn-checkin-${res.id}`}
                              onClick={() => {
                                const ans = fazerCheckinReserva(res.id);
                                setFeedback({ success: ans.success, message: ans.message });
                                setTimeout(() => setFeedback(null), 3000);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Check-in
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Acomodado
                            </span>
                          )}

                          <button
                            id={`btn-notif-${res.id}`}
                            onClick={() => {
                              setNotificationModalReserva(res);
                              setNotifTipo('LEMBRETE_2H');
                              setNotifCustomText('');
                            }}
                            className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                            title="Disparar Notificação / Lembrete"
                          >
                            <Send className="w-3 h-3 text-emerald-400" />
                            Notificar
                          </button>

                          <button
                            id={`btn-cancel-${res.id}`}
                            onClick={() => {
                              if (confirm(`Cancelar a reserva de ${res.clienteNome}? A mesa será liberada.`)) {
                                cancelarReserva(res.id, 'Cancelamento solicitado pelo cliente');
                                setFeedback({ success: true, message: `Reserva ${res.codigo} cancelada.` });
                                setTimeout(() => setFeedback(null), 3000);
                              }
                            }}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                            title="Cancelar Reserva"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => setViewReservaDetails(res)}
                        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors ml-auto"
                        title="Ver Detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: HISTÓRICO DE NOTIFICAÇÕES */}
      {subView === 'notificacoes_historico' && (
        <div className="flex-1 flex flex-col overflow-hidden p-6">
          <div className="flex-1 overflow-auto rounded-xl border border-zinc-800/80 bg-zinc-900/40">
            {todasNotificacoes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <Bell className="w-12 h-12 stroke-[1.2] mb-2 text-zinc-600" />
                <p className="text-sm font-medium">Nenhuma notificação enviada ainda.</p>
                <p className="text-xs text-zinc-600 mt-1">Ao confirmar ou enviar lembretes aos clientes, os disparos serão registrados aqui.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800 sticky top-0 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Canal</th>
                    <th className="py-3 px-4">Destinatário</th>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Mensagem Enviada</th>
                    <th className="py-3 px-4">Status Envio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-medium">
                  {todasNotificacoes.map((notif) => (
                    <tr key={notif.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3.5 px-4 text-zinc-400 whitespace-nowrap">
                        {notif.dataHora}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{notif.destinatarioNome}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{notif.destinatarioTelefone}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 uppercase">
                          {notif.tipo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-300 max-w-md">
                        {notif.mensagem}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          ✓ Entregue
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* MODAL: NOVA RESERVA */}
      {isNewReservaModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Nova Reserva de Mesa / Experiência</h3>
                  <p className="text-xs text-zinc-400">
                    Cadastre a reserva e notifique o cliente instantaneamente por WhatsApp.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewReservaModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarReserva} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {formError}
                  </div>
                )}

                {/* Seletor Rápido de Cliente Cadastrado */}
                <div>
                  <label className="text-zinc-400 block mb-1">
                    Selecionar Cliente Cadastrado (Opcional):
                  </label>
                  <select
                    onChange={(e) => {
                      const selected = customers.find(c => c.id === e.target.value);
                      if (selected) {
                        setFormData(prev => ({
                          ...prev,
                          clienteNome: selected.name,
                          clienteTelefone: selected.phone,
                          clienteEmail: selected.email || '',
                        }));
                      }
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 text-zinc-300 rounded-lg px-3 py-2"
                  >
                    <option value="">-- Ou digite os dados abaixo manualmente --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) - {c.nivelFidelidade}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nome e Telefone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Nome do Cliente:*</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Roberto Alcantara"
                      value={formData.clienteNome}
                      onChange={(e) => setFormData({ ...formData, clienteNome: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Telefone WhatsApp:*</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.clienteTelefone}
                      onChange={(e) => setFormData({ ...formData, clienteTelefone: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Data, Horário e Pessoas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Data da Reserva:*</label>
                    <input
                      type="date"
                      required
                      value={formData.dataReserva}
                      onChange={(e) => setFormData({ ...formData, dataReserva: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Horário:*</label>
                    <input
                      type="time"
                      required
                      value={formData.horario}
                      onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Qtd. de Pessoas:*</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={formData.quantidadePessoas}
                      onChange={(e) => setFormData({ ...formData, quantidadePessoas: parseInt(e.target.value) || 1 })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 font-bold"
                    />
                  </div>
                </div>

                {/* Ambiente e Mesa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Ambiente / Setor:*</label>
                    <select
                      value={formData.ambiente}
                      onChange={(e) => setFormData({ ...formData, ambiente: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="Salão Principal">Salão Principal</option>
                      <option value="Deck Externo">Deck Externo</option>
                      <option value="Balcão VIP">Balcão VIP</option>
                      <option value="Adega Subterrânea">Adega Subterrânea</option>
                      <option value="Lounge VIP">Lounge VIP</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Vincular Mesa do Salão (Opcional):</label>
                    <select
                      value={formData.mesaId || ''}
                      onChange={(e) => setFormData({ ...formData, mesaId: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="">A definir na chegada</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>
                          Mesa {t.number} ({t.seats} lugares) - {t.status === 'FREE' ? 'Disponível' : t.status}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tipo de Reserva e Pré-reserva de Bebida */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Tipo de Experiência:</label>
                    <select
                      value={formData.tipoReserva}
                      onChange={(e) => setFormData({ ...formData, tipoReserva: e.target.value as any })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    >
                      <option value="MESA_COMUM">Mesa Convencional</option>
                      <option value="DEGUSTACAO_GUIADA">Degustação Guiada com Sommelier</option>
                      <option value="ANIVERSARIO_EVENTO">Aniversário / Evento Especial</option>
                      <option value="CLUBE_WHISKY_LOCKER">Reserva com Locker do Clube do Whisky</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-400 block mb-1">Rótulo / Garrafa Pré-Reservada:</label>
                    <input
                      type="text"
                      placeholder="Ex: Barolo DOCG 2018 na adega climatizada"
                      value={formData.garrafaPreReservada}
                      onChange={(e) => setFormData({ ...formData, garrafaPreReservada: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                {/* Caução e Observações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Valor Caução / Consumação Mínima (R$):</label>
                    <input
                      type="number"
                      min={0}
                      step={50}
                      value={formData.caucaoValor}
                      onChange={(e) => setFormData({ ...formData, caucaoValor: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2 font-mono"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.caucaoPago}
                        onChange={(e) => setFormData({ ...formData, caucaoPago: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700"
                      />
                      <span className="text-zinc-300 font-semibold">Caução pago antecipadamente</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Observações e Pedidos Especiais:</label>
                  <textarea
                    rows={2}
                    placeholder="Decoração na mesa, taças especiais, gelo prévio..."
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-950">
                <button
                  type="button"
                  onClick={() => setIsNewReservaModalOpen(false)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  id="btn-confirmar-reserva"
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Salvar Reserva & Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISPARO DE NOTIFICAÇÃO / LEMBRETE */}
      {notificationModalReserva && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Enviar Notificação WhatsApp
                </h3>
              </div>
              <button
                onClick={() => setNotificationModalReserva(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <div className="font-bold text-white">{notificationModalReserva.clienteNome}</div>
                <div className="text-zinc-400 font-mono text-[11px]">{notificationModalReserva.clienteTelefone}</div>
                <div className="text-zinc-500 text-[10px] mt-1">
                  Reserva {notificationModalReserva.codigo} • {notificationModalReserva.dataReserva} às {notificationModalReserva.horario}
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Modelo de Notificação:</label>
                <select
                  value={notifTipo}
                  onChange={(e) => setNotifTipo(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-700 text-white rounded-lg px-3 py-2"
                >
                  <option value="LEMBRETE_2H">Lembrete de Reserva (Hoje às {notificationModalReserva.horario})</option>
                  <option value="CONFIRMACAO">Confirmação de Agendamento</option>
                  <option value="ALTERACAO">Aviso de Alteração de Horário</option>
                  <option value="CANCELAMENTO">Aviso de Cancelamento</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Mensagem Customizada (Opcional):</label>
                <textarea
                  rows={3}
                  placeholder="Deixe em branco para usar o texto padrão do sistema..."
                  value={notifCustomText}
                  onChange={(e) => setNotifCustomText(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-white placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="p-4 border-t border-zinc-800 flex justify-end gap-2 bg-zinc-950">
              <button
                onClick={() => setNotificationModalReserva(null)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleEnviarNotificacao}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Enviar Notificação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETALHES DA RESERVA */}
      {viewReservaDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-2 text-amber-400">
                <CalendarIcon className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Reserva {viewReservaDetails.codigo}</h3>
              </div>
              <button
                onClick={() => setViewReservaDetails(null)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs bg-zinc-950/60">
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Cliente:</span>
                <span className="font-bold text-white">{viewReservaDetails.clienteNome}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Telefone:</span>
                <span className="font-mono text-white">{viewReservaDetails.clienteTelefone}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Data e Hora:</span>
                <span className="text-amber-400 font-semibold">{viewReservaDetails.dataReserva} às {viewReservaDetails.horario}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Ambiente / Mesa:</span>
                <span className="text-white">{viewReservaDetails.ambiente} (Mesa {viewReservaDetails.mesaNumero || 'A definir'})</span>
              </div>
              <div className="flex justify-between border-b border-zinc-800 pb-2">
                <span className="text-zinc-400">Pessoas:</span>
                <span className="text-white">{viewReservaDetails.quantidadePessoas} lugares</span>
              </div>
              {viewReservaDetails.garrafaPreReservada && (
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Garrafa Reservada:</span>
                  <span className="text-amber-300">{viewReservaDetails.garrafaPreReservada}</span>
                </div>
              )}
              {viewReservaDetails.caucaoValor && viewReservaDetails.caucaoValor > 0 ? (
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Caução:</span>
                  <span className="font-bold text-emerald-400">
                    R$ {viewReservaDetails.caucaoValor.toFixed(2)} {viewReservaDetails.caucaoPago ? '(Pago)' : '(Pendente)'}
                  </span>
                </div>
              ) : null}
              {viewReservaDetails.observacoes && (
                <div className="pt-1">
                  <span className="text-zinc-400 block mb-1">Observações:</span>
                  <p className="text-zinc-300 italic bg-zinc-900 p-2 rounded border border-zinc-800">
                    "{viewReservaDetails.observacoes}"
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-zinc-800 flex justify-end bg-zinc-950">
              <button
                onClick={() => setViewReservaDetails(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold"
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
