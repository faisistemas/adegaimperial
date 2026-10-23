import React, { useState } from 'react';
import { 
  Users, Award, Gift, Sparkles, MessageSquare, Clock, 
  Send, Phone, Search, Plus, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, ChevronRight, UserCheck, X
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { ClienteFidelidade, FilaEsperaItem } from '../../types';

export const CrmFidelidadeView: React.FC = () => {
  const { 
    clientesFidelidade, 
    fidelidadeExtrato, 
    resgatarCashback, 
    whatsappNotificacoes, 
    enviarNotificacaoWhatsapp,
    filaEspera,
    adicionarFilaEspera,
    chamarClienteFila,
    alocarClienteFilaMesa,
    removerClienteFila,
    tables 
  } = useAdega();

  const [activeSubTab, setActiveSubTab] = useState<'FIDELIDADE' | 'WHATSAPP' | 'FILA_ESPERA'>('FIDELIDADE');
  const [searchTerm, setSearchTerm] = useState('');

  // Resgate Modal
  const [selectedCliente, setSelectedCliente] = useState<ClienteFidelidade | null>(null);
  const [resgateValor, setResgateValor] = useState<number>(10);
  const [resgateFeedback, setResgateFeedback] = useState<string | null>(null);

  // WhatsApp manual test modal
  const [wppModal, setWppModal] = useState(false);
  const [wppTelefone, setWppTelefone] = useState('(11) 98765-4321');
  const [wppNome, setWppNome] = useState('Cliente Teste');
  const [wppMensagem, setWppMensagem] = useState('🍷 Adega Master informa: Seu pedido foi preparado e está pronto!');

  // Fila de Espera Modal
  const [novaFilaModal, setNovaFilaModal] = useState(false);
  const [filaNome, setFilaNome] = useState('');
  const [filaTelefone, setFilaTelefone] = useState('');
  const [filaPessoas, setFilaPessoas] = useState(2);
  const [filaObs, setFilaObs] = useState('');

  // Filtering clientes
  const filteredClientes = (clientesFidelidade || []).filter((c) =>
    (c.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.cpf || '').includes(searchTerm) ||
    (c.telefone || '').includes(searchTerm)
  );

  const handleConfirmResgate = () => {
    if (!selectedCliente) return;
    const res = resgatarCashback(selectedCliente.id, resgateValor);
    if (res.success) {
      setResgateFeedback(`Sucesso: ${res.message}`);
      setTimeout(() => {
        setResgateFeedback(null);
        setSelectedCliente(null);
      }, 1500);
    } else {
      setResgateFeedback(`Erro: ${res.message}`);
    }
  };

  const handleSendWpp = (e: React.FormEvent) => {
    e.preventDefault();
    enviarNotificacaoWhatsapp(wppTelefone, wppNome, 'PEDIDO_RECEBIDO', wppMensagem);
    setWppModal(false);
  };

  const handleAddFila = (e: React.FormEvent) => {
    e.preventDefault();
    adicionarFilaEspera(filaNome, filaTelefone, filaPessoas, filaObs || undefined);
    setNovaFilaModal(false);
    setFilaNome('');
    setFilaTelefone('');
    setFilaPessoas(2);
    setFilaObs('');
  };

  const getNivelBadge = (nivel: ClienteFidelidade['nivel']) => {
    switch (nivel) {
      case 'BLACK':
        return 'bg-purple-950/60 text-purple-300 border-purple-800 font-black';
      case 'OURO':
        return 'bg-amber-950/60 text-amber-300 border-amber-600 font-bold';
      case 'PRATA':
        return 'bg-zinc-800 text-zinc-300 border-zinc-600 font-medium';
      default:
        return 'bg-amber-900/30 text-amber-400 border-amber-800/40 font-medium';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-6 space-y-6">
      {/* Sub-tabs Header */}
      <div className="flex items-center justify-end border-b border-zinc-800 pb-4">
        {/* Sub-tabs switch */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveSubTab('FIDELIDADE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'FIDELIDADE'
                ? 'bg-amber-500 text-zinc-950 shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Fidelidade & Cashback</span>
          </button>

          <button
            onClick={() => setActiveSubTab('WHATSAPP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'WHATSAPP'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Bot de WhatsApp</span>
          </button>

          <button
            onClick={() => setActiveSubTab('FILA_ESPERA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'FILA_ESPERA'
                ? 'bg-blue-600 text-white shadow'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fila de Espera ({filaEspera.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: FIDELIDADE & CASHBACK */}
      {/* ========================================================================= */}
      {activeSubTab === 'FIDELIDADE' && (
        <div className="space-y-6">
          {/* Highlight metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400">Total de Clientes Cadastrados</span>
              <p className="text-2xl font-bold font-mono text-zinc-100 mt-1">{(clientesFidelidade || []).length}</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400">Saldo Total de Cashback Ativo</span>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
                R$ {((clientesFidelidade || []).reduce((a, b) => a + (b.saldoCashback ?? 0), 0)).toFixed(2)}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400">Pontuação Total em Circulação</span>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {(clientesFidelidade || []).reduce((a, b) => a + (b.pontos ?? 0), 0)} pts
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <span className="text-xs text-zinc-400">Regras de Cashback Ativas</span>
              <p className="text-xs text-zinc-300 font-semibold mt-2">
                Bronze: 2% | Prata: 3% | Ouro: 5% | Black: 7%
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, CPF ou telefone..."
              className="w-full pl-9 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500"
            />
          </div>

          {/* Clientes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(filteredClientes || []).map((cli) => (
              <div
                key={cli.id}
                className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${getNivelBadge(cli.nivel)}`}>
                      Nível {cli.nivel} ({cli.percentualCashbackAtual}%)
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      {cli.pontos} PONTOS
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="font-bold text-sm text-zinc-100">{cli.nome}</h3>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">CPF: {cli.cpf}</p>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-zinc-500" />
                      <span>{cli.telefone}</span>
                    </p>
                  </div>

                  {/* Balance Display */}
                  <div className="mt-4 p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">Cashback Disponível</span>
                      <p className="font-mono font-black text-lg text-amber-400">
                        R$ {(cli.saldoCashback ?? 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-500">Histórico Gasto</span>
                      <p className="font-mono text-xs text-zinc-300">
                        R$ {(cli.totalGastoHistorico ?? 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCliente(cli);
                    setResgateValor(Math.min(20, cli.saldoCashback));
                  }}
                  disabled={cli.saldoCashback <= 0}
                  className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-amber-500/20 text-zinc-200 hover:text-amber-300 border border-zinc-700 hover:border-amber-500/40 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>Resgatar Cashback no PDV</span>
                </button>
              </div>
            ))}
          </div>

          {/* Extrato Recente */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h3 className="font-bold text-xs text-zinc-200 uppercase tracking-wider">
              Extrato de Movimentações de Cashback Recentes
            </h3>
            <div className="divide-y divide-zinc-800/80">
              {(fidelidadeExtrato || []).map((ext) => (
                <div key={ext.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {ext.tipo === 'CREDITO_COMPRA' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                    )}
                    <div>
                      <p className="font-semibold text-zinc-200">
                        {ext.tipo === 'CREDITO_COMPRA' ? 'Cashback Creditado por Venda' : 'Resgate / Desconto em Caixa'}
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono">
                        Pedido {ext.pedidoCodigo} • {ext.dataMovimento}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        ext.tipo === 'CREDITO_COMPRA' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ext.tipo === 'CREDITO_COMPRA' ? '+' : ''}R$ {(ext.valorCashback ?? 0).toFixed(2)}
                    </span>
                    <p className="text-[10px] text-zinc-500 font-mono">Saldo: R$ {(ext.saldoFinalCashback ?? 0).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: BOT DE WHATSAPP / NOTIFICAÇÕES */}
      {/* ========================================================================= */}
      {activeSubTab === 'WHATSAPP' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Disparador & Log do Bot de WhatsApp</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Notificações automatizadas disparadas pelo PDV para avisar cliente sobre preparo, saída de motoboy e fila.
              </p>
            </div>
            <button
              onClick={() => setWppModal(true)}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Simular Envio Avulso</span>
            </button>
          </div>

          {/* Cards of Sent Notifications */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Histórico de Mensagens Transacionais
            </h4>
            <div className="divide-y divide-zinc-800/80">
              {(whatsappNotificacoes || []).map((wpp) => (
                <div key={wpp.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200">{wpp.destinatarioNome}</span>
                      <span className="text-[11px] font-mono text-zinc-500">{wpp.telefone}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold">
                        {wpp.tipoMensagem}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 bg-zinc-950/70 p-2.5 rounded-xl border border-zinc-800/80 font-sans">
                      "{wpp.texto}"
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                      {wpp.statusEnvio}
                    </span>
                    <p className="text-[10px] text-zinc-500 font-mono mt-1">{wpp.dataDisparo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: FILA DE ESPERA DIGITAL */}
      {/* ========================================================================= */}
      {activeSubTab === 'FILA_ESPERA' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-100">Fila de Espera Digital na Entrada da Adega</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Organize grupos na recepção, envie notificação no WhatsApp quando a mesa estiver livre e aloque sem atrito.
              </p>
            </div>
            <button
              onClick={() => setNovaFilaModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-950/40 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Inserir Cliente na Fila</span>
            </button>
          </div>

          {/* Waiting List Cards */}
          {(filaEspera || []).length === 0 ? (
            <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800/80 space-y-2">
              <UserCheck className="w-10 h-10 text-emerald-500/50 mx-auto" />
              <h4 className="font-semibold text-sm text-zinc-200">Nenhum cliente aguardando na fila</h4>
              <p className="text-xs text-zinc-500">Todas as mesas estão atendendo os grupos ou há mesas livres disponíveis no salão.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(filaEspera || []).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-lg text-amber-300">
                        #{idx + 1} na Fila
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                        item.status === 'NOTIFICADO'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 animate-pulse'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1">
                      <h4 className="font-bold text-sm text-zinc-100">{item.clienteNome}</h4>
                      <p className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-zinc-500" />
                        <span>{item.telefone}</span>
                      </p>
                      <p className="text-xs text-zinc-300 mt-1">
                        👥 Grupo: <strong>{item.quantidadePessoas} pessoas</strong>
                      </p>
                      {item.observacao && (
                        <p className="text-[11px] text-zinc-400 italic bg-zinc-950 p-2 rounded-lg border border-zinc-800 mt-1">
                          "{item.observacao}"
                        </p>
                      )}
                    </div>

                    <div className="mt-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Aguardando há:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {item.tempoAguardandoMinutos} min
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => chamarClienteFila(item.id, item.mesaSugeridaNumero)}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Avisar no WhatsApp (Mesa Pronta)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val) alocarClienteFilaMesa(item.id, val);
                        }}
                        defaultValue=""
                        className="flex-1 py-1.5 px-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300"
                      >
                        <option value="" disabled>
                          Alocar em Mesa Livre...
                        </option>
                        {(tables || [])
                          .filter((t) => t.status === 'FREE')
                          .map((t) => (
                            <option key={t.id} value={t.id}>
                              Mesa 0{t.number} (Cap. {t.capacity || 4}p)
                            </option>
                          ))}
                      </select>

                      <button
                        onClick={() => removerClienteFila(item.id, 'DESISTIU')}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-950 text-zinc-400 hover:text-rose-400 transition-colors"
                        title="Desistência / Remover"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Resgate Cashback */}
      {selectedCliente && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Resgatar Cashback no PDV</h3>
            <p className="text-xs text-zinc-400">
              Cliente: <strong className="text-zinc-200">{selectedCliente.nome}</strong>
              <br />
              Saldo Atual: <span className="text-amber-400 font-mono font-bold">R$ {(selectedCliente.saldoCashback ?? 0).toFixed(2)}</span>
            </p>

            <div>
              <label className="text-xs text-zinc-300 font-medium">Valor do Resgate (R$)</label>
              <input
                type="number"
                step="1"
                min="1"
                max={selectedCliente.saldoCashback}
                value={resgateValor}
                onChange={(e) => setResgateValor(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-sm font-mono font-bold text-amber-400"
              />
            </div>

            {resgateFeedback && (
              <p className="text-xs font-semibold text-emerald-400 bg-emerald-950/40 p-2 rounded-xl border border-emerald-800">
                {resgateFeedback}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCliente(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmResgate}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
              >
                Confirmar Resgate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Disparo WhatsApp */}
      {wppModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Simular Disparo de WhatsApp</h3>

            <form onSubmit={handleSendWpp} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium">Nome do Cliente</label>
                <input
                  type="text"
                  value={wppNome}
                  onChange={(e) => setWppNome(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={wppTelefone}
                  onChange={(e) => setWppTelefone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Mensagem Transacional</label>
                <textarea
                  value={wppMensagem}
                  onChange={(e) => setWppMensagem(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWppModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                >
                  Disparar Mensagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Fila de Espera */}
      {novaFilaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-sm text-zinc-100 font-serif">Inserir Grupo na Fila de Espera</h3>

            <form onSubmit={handleAddFila} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 font-medium">Nome do Responsável</label>
                <input
                  type="text"
                  value={filaNome}
                  onChange={(e) => setFilaNome(e.target.value)}
                  placeholder="Ex: Carlos Albuquerque"
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">WhatsApp para Notificação</label>
                <input
                  type="text"
                  value={filaTelefone}
                  onChange={(e) => setFilaTelefone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Quantidade de Pessoas</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={filaPessoas}
                  onChange={(e) => setFilaPessoas(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 font-medium">Preferência / Observação</label>
                <input
                  type="text"
                  value={filaObs}
                  onChange={(e) => setFilaObs(e.target.value)}
                  placeholder="Ex: Área externa / perto do telão"
                  className="w-full mt-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNovaFilaModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold"
                >
                  Confirmar na Fila
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
