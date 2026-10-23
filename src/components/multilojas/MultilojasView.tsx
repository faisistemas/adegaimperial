import React, { useState } from 'react';
import { 
  Building2, ArrowRightLeft, Plus, CheckCircle2, 
  MapPin, Phone, DollarSign, Package, Users, 
  TrendingUp, ArrowRight, ShieldCheck, X
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';
import { Store, Product } from '../../types';

export const MultilojasView: React.FC = () => {
  const { stores, activeStore, setActiveStore, products, restockProduct } = useAdega();

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [sourceStoreId, setSourceStoreId] = useState(stores[0].id);
  const [destStoreId, setDestStoreId] = useState(stores[1]?.id || stores[0].id);
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [transferUnits, setTransferUnits] = useState(6);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  const [newStoreModalOpen, setNewStoreModalOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCnpj, setNewStoreCnpj] = useState('');
  const [newStoreCity, setNewStoreCity] = useState('');

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find((p) => p.id === selectedProductId);
    const sourceStore = stores.find((s) => s.id === sourceStoreId);
    const destStore = stores.find((s) => s.id === destStoreId);

    if (!prod || !sourceStore || !destStore) return;

    // Simulate transfer by updating product stock and creating confirmation
    setTransferSuccess(
      `Transferência de ${transferUnits}x ${prod.name} realizada com sucesso de ${sourceStore.name} para ${destStore.name}! Guia de remessa gerada.`
    );
    setTransferModalOpen(false);
    setTimeout(() => setTransferSuccess(null), 5000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 pb-20">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 font-serif">Gestão Multilojas & Franquias</h2>
          <p className="text-xs text-zinc-400">Matriz, filiais integradas e guias de remessa de mercadorias</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => setTransferModalOpen(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
          >
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Transferir Estoque</span>
          </button>

          <button
            onClick={() => setNewStoreModalOpen(true)}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-950/40 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Filial</span>
          </button>
        </div>
      </div>

      {transferSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{transferSuccess}</span>
        </div>
      )}

      {/* Network Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Faturamento Total da Rede</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            R$ 242.720,00
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold">2 lojas em operação ativa</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Garrafas Totais em Rede</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            800 <span className="text-xs font-sans text-zinc-400">unidades</span>
          </div>
          <p className="text-[11px] text-zinc-400">Distribuídas entre matriz e filiais</p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Colaboradores Conectados</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            9 <span className="text-xs font-sans text-zinc-400">usuários com RBAC</span>
          </div>
          <p className="text-[11px] text-zinc-400">Caixas, garçons, motoboys e gerentes</p>
        </div>
      </div>

      {/* Stores List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(stores || []).map((st) => {
          const isSelected = activeStore.id === st.id;
          const isMatriz = st.id === 'store-1';

          return (
            <div
              key={st.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40'
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-zinc-400'}`} />
                    <h3 className="font-bold text-base text-zinc-100">{st.name}</h3>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                    isMatriz
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {isMatriz ? 'Matriz' : 'Filial'}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-zinc-400">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{st.address} - {st.city}/{st.state}</span>
                  </p>
                  <p className="font-mono text-[11px]">CNPJ: {st.cnpj} | IE: {st.ie}</p>
                </div>

                {/* Performance stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-center">
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Faturamento</span>
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      {isMatriz ? 'R$ 148.520' : 'R$ 94.200'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Estoque</span>
                    <span className="font-mono font-bold text-xs text-zinc-200">
                      {isMatriz ? '480 un' : '320 un'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block">Status</span>
                    <span className="text-[10px] font-bold text-emerald-400">Aberta</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400">
                  {isSelected ? 'Loja Selecionada Atualmente' : 'Operar nesta filial'}
                </span>
                <button
                  onClick={() => setActiveStore(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-zinc-950'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {isSelected ? 'Ativa' : 'Alternar para esta Loja'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Transferência de Estoque */}
      {transferModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Transferência de Estoque entre Unidades</h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Loja de Origem</label>
                  <select
                    value={sourceStoreId}
                    onChange={(e) => setSourceStoreId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                  >
                    {(stores || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Loja de Destino</label>
                  <select
                    value={destStoreId}
                    onChange={(e) => setDestStoreId(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                  >
                    {(stores || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Bebida / Produto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-200"
                >
                  {(products || []).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Disponível: {p.stockUnits} garrafas)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Quantidade de Garrafas para Transferir</label>
                <input
                  type="number"
                  min="1"
                  value={transferUnits}
                  onChange={(e) => setTransferUnits(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 font-mono font-bold text-lg"
                />
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                O sistema gerará automaticamente uma Nota Fiscal Eletrônica de Transferência (CFOP 5.152) para acompanhar o transporte entre filiais.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                >
                  Efetivar Transferência de Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nova Filial */}
      {newStoreModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="font-bold text-sm text-zinc-100 font-serif">Cadastrar Nova Filial ou Franquia</h3>
              <button onClick={() => setNewStoreModalOpen(false)} className="text-zinc-400 hover:text-zinc-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Nome Fantasia da Unidade</label>
                <input
                  type="text"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Ex: Adega Imperial - Filial Moema"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">CNPJ</label>
                <input
                  type="text"
                  value={newStoreCnpj}
                  onChange={(e) => setNewStoreCnpj(e.target.value)}
                  placeholder="12.345.678/0003-90"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Cidade / UF</label>
                <input
                  type="text"
                  value={newStoreCity}
                  onChange={(e) => setNewStoreCity(e.target.value)}
                  placeholder="São Paulo / SP"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setNewStoreModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => setNewStoreModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
              >
                Salvar Filial
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
