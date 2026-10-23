import React, { useState } from 'react';
import { 
  ShieldAlert, Filter, Search, Calendar, User, Terminal, 
  AlertTriangle, CheckCircle2, ArrowDownLeft, XCircle, 
  Settings, DollarSign, Download, Eye, ShieldCheck, Tag
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { AuditRecord, AuditCategory, AuditSeverity } from '../../types/financeiroGestaoTypes';

export const AuditoriaOperacoesTab: React.FC = () => {
  const { auditRecords } = useAdega();

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('TODAS');
  const [severidadeFiltro, setSeveridadeFiltro] = useState<string>('TODAS');
  const [registroSelecionado, setRegistroSelecionado] = useState<AuditRecord | null>(null);

  const recordsFiltrados = auditRecords.filter((rec) => {
    if (categoriaFiltro !== 'TODAS' && rec.categoria !== categoriaFiltro) return false;
    if (severidadeFiltro !== 'TODAS' && rec.severidade !== severidadeFiltro) return false;
    if (busca.trim()) {
      const termo = busca.toLowerCase();
      const matchDesc = rec.descricao.toLowerCase().includes(termo);
      const matchUser = rec.usuarioNome.toLowerCase().includes(termo);
      const matchDoc = rec.detalhesTecnicos?.documentoRef?.toLowerCase().includes(termo);
      if (!matchDesc && !matchUser && !matchDoc) return false;
    }
    return true;
  });

  const getSeveridadeBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-950 text-rose-300 border border-rose-800">CRÍTICO</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-950 text-amber-300 border border-amber-800">ALTO</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">MÉDIO</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">BAIXO</span>;
    }
  };

  const getCategoriaIcon = (cat: AuditCategory) => {
    switch (cat) {
      case 'SANGRIA_SUPRIMENTO':
        return <ArrowDownLeft className="w-4 h-4 text-amber-400" />;
      case 'CANCELAMENTO_ITEM':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'DESCONTO_CONCEDIDO':
        return <Tag className="w-4 h-4 text-cyan-400" />;
      case 'ALTERACAO_PRECO':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'CONFIGURACAO_SISTEMA':
        return <Settings className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner de Auditoria e Compliance */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Trilha de Auditoria & Segurança Operacional
              </h2>
              <p className="text-xs text-zinc-400">
                Registro criptográfico e imutável de autorizações gerenciais, sangrias, cancelamentos e alterações sensíveis.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-zinc-500 uppercase block">Total Registros</span>
            <span className="text-base font-bold text-zinc-200">{auditRecords.length}</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por descrição, operador, documento ou motivo..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro de Categoria */}
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none"
          >
            <option value="TODAS">Todas as Categorias</option>
            <option value="SANGRIA_SUPRIMENTO">Sangrias & Suprimentos</option>
            <option value="CANCELAMENTO_ITEM">Cancelamentos de Itens/Comandas</option>
            <option value="DESCONTO_CONCEDIDO">Descontos Concedidos</option>
            <option value="AJUSTE_ESTOQUE">Ajustes Manuais de Estoque</option>
            <option value="ALTERACAO_PRECO">Alterações de Preços / Markup</option>
            <option value="CAIXA_SESSAO">Abertura / Fechamento de Caixa</option>
            <option value="CONFIGURACAO_SISTEMA">Configurações do Sistema</option>
          </select>

          {/* Filtro de Severidade */}
          <select
            value={severidadeFiltro}
            onChange={(e) => setSeveridadeFiltro(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:border-amber-500 outline-none"
          >
            <option value="TODAS">Todas Severidades</option>
            <option value="CRITICAL">Crítico</option>
            <option value="HIGH">Alto</option>
            <option value="MEDIUM">Médio</option>
            <option value="LOW">Baixo</option>
          </select>
        </div>
      </div>

      {/* Tabela Principal de Auditoria */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10px] bg-zinc-950/60">
                <th className="py-3 px-4">Data / Hora</th>
                <th className="py-3 px-4">Severidade</th>
                <th className="py-3 px-4">Evento / Categoria</th>
                <th className="py-3 px-4">Descrição da Operação</th>
                <th className="py-3 px-4">Operador / Terminal</th>
                <th className="py-3 px-4">Autorização Gerencial</th>
                <th className="py-3 px-4 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {recordsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-500 text-xs">
                    Nenhum registro de auditoria encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                recordsFiltrados.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-zinc-300 whitespace-nowrap">
                      {rec.dataHora}
                    </td>
                    <td className="py-3 px-4">
                      {getSeveridadeBadge(rec.severidade)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getCategoriaIcon(rec.categoria)}
                        <span className="font-mono text-[11px] text-zinc-300">
                          {rec.categoria.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-zinc-100 font-medium block">{rec.descricao}</span>
                      {rec.detalhesTecnicos?.motivo && (
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Motivo: {rec.detalhesTecnicos.motivo}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-zinc-200 font-semibold block">{rec.usuarioNome}</span>
                      <span className="text-[10px] font-mono text-zinc-500">{rec.terminal || 'PDV Local'}</span>
                    </td>
                    <td className="py-3 px-4">
                      {rec.autorizadorNome ? (
                        <span className="text-xs text-emerald-400 font-mono font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {rec.autorizadorNome}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500 font-mono">Próprio Usuário</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setRegistroSelecionado(rec)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all"
                        title="Ver detalhes técnicos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes Técnicos do Log */}
      {registroSelecionado && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Detalhes do Registro de Auditoria</h3>
              </div>
              <button onClick={() => setRegistroSelecionado(null)} className="text-zinc-400 hover:text-white">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">ID do Registro:</span>
                  <span className="text-zinc-300">{registroSelecionado.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Data e Hora:</span>
                  <span className="text-zinc-300">{registroSelecionado.dataHora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Terminal:</span>
                  <span className="text-zinc-300">{registroSelecionado.terminal || 'PDV 01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Operador / Autorizador:</span>
                  <span className="text-zinc-300">{registroSelecionado.usuarioNome}</span>
                </div>
              </div>

              <div>
                <span className="text-zinc-400 font-semibold block mb-1">Descrição:</span>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-medium">
                  {registroSelecionado.descricao}
                </div>
              </div>

              {registroSelecionado.detalhesTecnicos && (
                <div className="space-y-2">
                  <span className="text-zinc-400 font-semibold block">Parâmetros Técnicos & Impacto:</span>
                  <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 font-mono">
                    {registroSelecionado.detalhesTecnicos.valorAnterior && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Valor Anterior:</span>
                        <span className="text-zinc-200">{registroSelecionado.detalhesTecnicos.valorAnterior}</span>
                      </div>
                    )}
                    {registroSelecionado.detalhesTecnicos.valorNovo && (
                      <div className="flex justify-between text-zinc-400">
                        <span>Valor Novo:</span>
                        <span className="text-zinc-200">{registroSelecionado.detalhesTecnicos.valorNovo}</span>
                      </div>
                    )}
                    {registroSelecionado.detalhesTecnicos.impactoFinanceiro !== undefined && (
                      <div className="flex justify-between font-bold">
                        <span className="text-zinc-400">Impacto Financeiro:</span>
                        <span className={registroSelecionado.detalhesTecnicos.impactoFinanceiro < 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          R$ {registroSelecionado.detalhesTecnicos.impactoFinanceiro.toFixed(2)}
                        </span>
                      </div>
                    )}
                    {registroSelecionado.detalhesTecnicos.motivo && (
                      <div className="pt-2 border-t border-zinc-800 text-zinc-300">
                        <span className="text-zinc-500 block">Justificativa Registrada:</span>
                        <span className="text-xs">{registroSelecionado.detalhesTecnicos.motivo}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                onClick={() => setRegistroSelecionado(null)}
                className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold"
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
