import React, { useState } from 'react';
import { 
  Building2, ArrowRight, Truck, CheckCircle2, 
  Plus, Clock, PackageCheck, AlertCircle, Calendar
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { TransferenciaLojas } from '../../types';

export const TransferenciasLojasTab: React.FC = () => {
  const { 
    transferenciasLojas, 
    criarTransferenciaLoja, 
    concluirTransferenciaLoja, 
    stores, 
    products, 
    activeStore, 
    currentUser 
  } = useAdega();

  const [modalOpen, setModalOpen] = useState(false);
  const [lojaDestinoId, setLojaDestinoId] = useState('');
  const [itensTransferencia, setItensTransferencia] = useState<Array<{ produtoId: string; quantidade: number }>>([
    { produtoId: products[0]?.id || 'prod-1', quantidade: 6 },
  ]);
  const [motorista, setMotorista] = useState('');
  const [placa, setPlaca] = useState('');

  const outrasLojas = (stores || []).filter(s => s.id !== activeStore?.id);

  const handleAddItem = () => {
    setItensTransferencia([...itensTransferencia, { produtoId: products?.[0]?.id || 'prod-1', quantidade: 6 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItensTransferencia(itensTransferencia.filter((_, i) => i !== index));
  };

  const handleCriar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lojaDestinoId || itensTransferencia.length === 0) return;

    const destStore = (stores || []).find(s => s.id === lojaDestinoId);
    if (!destStore) return;

    criarTransferenciaLoja({
      lojaOrigemId: activeStore.id,
      lojaOrigemNome: activeStore.nomeFantasia,
      lojaDestinoId: destStore.id,
      lojaDestinoNome: destStore.nomeFantasia,
      status: 'EM_TRANSITO',
      usuarioEnvioNome: `${currentUser.name} (${currentUser.role})`,
      motoristaResponsavel: motorista || 'Transporte Próprio',
      placaVeiculo: placa || 'BRA-2025',
      itens: itensTransferencia.map(it => {
        const prod = (products || []).find(p => p.id === it.produtoId);
        return {
          produtoId: it.produtoId,
          produtoNome: prod?.name || 'Produto',
          quantidadeEnviada: it.quantidade,
        };
      }),
    });

    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
            Logística Multilojas
          </span>
          <h3 className="text-xl font-bold text-white mt-1.5 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Transferências de Estoque Entre Lojas
          </h3>
          <p className="text-xs text-zinc-400 max-w-xl mt-1">
            Controle de remessas entre matriz e filiais com conferência de recebimento cega, 
            garantindo que o estoque só seja acrescido após confirmação do gerente de destino.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Remessa de Transferência
        </button>
      </div>

      {/* Cards of Transfers */}
      <div className="space-y-4">
        {(transferenciasLojas || []).map((transf) => {
          const isTransit = transf.status === 'EM_TRANSITO';

          return (
            <div
              key={transf.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isTransit ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {isTransit ? <Truck className="w-5 h-5" /> : <PackageCheck className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-zinc-300">
                        {transf.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isTransit ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isTransit ? 'EM TRÂNSITO' : 'CONCLUÍDO / RECEBIDO'}
                      </span>
                    </div>

                    {/* Stores Route */}
                    <div className="flex items-center gap-2 text-sm font-bold text-white mt-1">
                      <span>{transf.lojaOrigemNome}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-500" />
                      <span className="text-amber-400">{transf.lojaDestinoNome}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right text-xs text-zinc-400">
                  <p>Despachado: <span className="text-zinc-200">{transf.dataEnvio}</span></p>
                  {transf.dataRecebimento && (
                    <p className="text-emerald-400">Recebido: {transf.dataRecebimento}</p>
                  )}
                </div>
              </div>

              {/* Items List */}
              <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800/80">
                <p className="text-[11px] text-zinc-400 font-semibold uppercase mb-2">Itens em Remessa:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {(transf.itens || []).map((it, idx) => (
                    <div key={idx} className="bg-zinc-900/80 p-2 rounded border border-zinc-800 text-xs flex justify-between items-center">
                      <span className="text-zinc-300 font-medium truncate mr-2">{it.produtoNome}</span>
                      <span className="font-mono font-bold text-amber-400 bg-zinc-950 px-2 py-0.5 rounded">
                        {it.quantidadeEnviada} un
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logistics Details & Confirm Action */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-t border-zinc-800 text-xs">
                <div className="text-zinc-400 space-x-3">
                  <span>Motorista: <strong className="text-zinc-200">{transf.motoristaResponsavel}</strong></span>
                  {transf.placaVeiculo && <span>Placa: <strong className="text-zinc-200">{transf.placaVeiculo}</strong></span>}
                  <span>Despachado por: <strong className="text-zinc-200">{transf.usuarioEnvioNome}</strong></span>
                </div>

                {isTransit && (
                  <button
                    onClick={() => concluirTransferenciaLoja(transf.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Recebimento na Loja Destino
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nova Transferência */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-400" />
                Despachar Transferência de Estoque
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriar} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-300 font-semibold mb-1 block">
                  Loja de Destino:
                </label>
                <select
                  value={lojaDestinoId}
                  onChange={(e) => setLojaDestinoId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  required
                >
                  <option value="">Selecione a loja destino...</option>
                  {(outrasLojas || []).map(s => (
                    <option key={s.id} value={s.id}>{s.nomeFantasia} ({s.endereco})</option>
                  ))}
                </select>
              </div>

              {/* Dynamic Items */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs text-zinc-300 font-semibold">Itens da Carga:</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Produto
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(itensTransferencia || []).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
                      <select
                        value={item.produtoId}
                        onChange={(e) => {
                          const updated = [...itensTransferencia];
                          updated[idx].produtoId = e.target.value;
                          setItensTransferencia(updated);
                        }}
                        className="flex-1 bg-zinc-900 border border-zinc-700 text-xs text-white rounded p-1.5"
                      >
                        {(products || []).map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Disp: {p.stockUnits} un)
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => {
                          const updated = [...itensTransferencia];
                          updated[idx].quantidade = Number(e.target.value);
                          setItensTransferencia(updated);
                        }}
                        min={1}
                        className="w-20 bg-zinc-900 border border-zinc-700 text-xs text-white rounded p-1.5 text-center font-mono"
                        placeholder="Qtd"
                      />

                      {itensTransferencia.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-zinc-500 hover:text-rose-400 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-300 font-semibold mb-1 block">Motorista:</label>
                  <input
                    type="text"
                    value={motorista}
                    onChange={(e) => setMotorista(e.target.value)}
                    placeholder="Ex: Carlos Andrade"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300 font-semibold mb-1 block">Placa Veículo:</label>
                  <input
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="Ex: BRA2E19"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white uppercase"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 bg-zinc-800 text-zinc-300 rounded-lg text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs"
                >
                  Despachar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
