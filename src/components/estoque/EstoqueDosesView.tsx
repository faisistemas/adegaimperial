import React, { useState } from 'react';
import { 
  Droplets, Wine, Plus, Search, AlertTriangle, 
  TrendingUp, History, ShieldAlert, CheckCircle2,
  PackageCheck, ArrowUpDown, Sparkles, Filter, X,
  Layers, Beer, RotateCcw, Calendar, Truck, ClipboardList,
  Edit2, Tag, ArrowRightLeft, Package
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

// Sub-componentes modulares de Produtos & Estoque
import { ProdutosCatalogoTab } from './ProdutosCatalogoTab';
import { CategoriasTab } from './CategoriasTab';
import { MovimentacoesKardexTab } from './MovimentacoesKardexTab';
import { LotesValidadeTab } from './LotesValidadeTab';
import { InventarioCegoTab } from './InventarioCegoTab';
import { TransferenciasLojasTab } from './TransferenciasLojasTab';
import { BancadaDosesTab } from './BancadaDosesTab';
import { FichasTecnicasCombosTab } from './FichasTecnicasCombosTab';
import { ChopeirasBarrisTab } from './ChopeirasBarrisTab';
import { VasilhamesCascosTab } from './VasilhamesCascosTab';
import { PerdasAvariasTab } from './PerdasAvariasTab';

export type EstoqueSubTab = 
  | 'PRODUTOS'
  | 'CATEGORIAS'
  | 'MOVIMENTACOES'
  | 'LOTES'
  | 'INVENTARIO'
  | 'TRANSFERENCIAS'
  | 'BANCADA' 
  | 'COMBOS' 
  | 'CHOPP' 
  | 'VASILHAMES' 
  | 'PERDAS' 
  | 'AUDITORIA';

export const EstoqueDosesView: React.FC = () => {
  const { 
    products, 
    categories,
    movimentacoesEstoque,
    doseAuditLogs, 
    recipientesAbertos,
    fichasTecnicas,
    torneirasChopp,
    vasilhames,
    produtoLotes,
    perdasEstoque,
    transferenciasLojas,
    inventarios
  } = useAdega();

  const [activeSubTab, setActiveSubTab] = useState<EstoqueSubTab>('PRODUTOS');

  const produtosAbaixoMinimo = products.filter(p => p.stockUnits <= p.minStockAlert).length;
  const lotesAlerta = produtoLotes.filter(l => l.status === 'ALERTA_VENCIMENTO' || (l.diasAteVencer !== undefined && l.diasAteVencer <= 30)).length;

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 md:p-6 space-y-6">
      {/* Navegação por Sub-Abas do Módulo de Produtos & Estoque */}
      <div className="overflow-x-auto pb-1">
        <div className="flex items-center gap-1.5 min-w-max border-b border-zinc-800/80 pb-2">
          {/* 1. Produtos e Embalagens */}
          <button
            id="tab-estoque-produtos"
            onClick={() => setActiveSubTab('PRODUTOS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'PRODUTOS'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos & Embalagens ({products.length})</span>
            {produtosAbaixoMinimo > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'PRODUTOS' ? 'bg-zinc-950 text-rose-400' : 'bg-rose-500 text-white'
              }`}>
                {produtosAbaixoMinimo}
              </span>
            )}
          </button>

          {/* 2. Categorias */}
          <button
            id="tab-estoque-categorias"
            onClick={() => setActiveSubTab('CATEGORIAS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'CATEGORIAS'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categorias ({categories.length})</span>
          </button>

          {/* 3. Movimentações & Kardex */}
          <button
            id="tab-estoque-movimentacoes"
            onClick={() => setActiveSubTab('MOVIMENTACOES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'MOVIMENTACOES'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Movimentações / Kardex ({movimentacoesEstoque.length})</span>
          </button>

          {/* 4. Lotes & Validade FIFO */}
          <button
            id="tab-estoque-lotes"
            onClick={() => setActiveSubTab('LOTES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'LOTES'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lotes & FIFO ({produtoLotes.length})</span>
            {lotesAlerta > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeSubTab === 'LOTES' ? 'bg-zinc-950 text-amber-400' : 'bg-amber-500 text-zinc-950'
              }`}>
                {lotesAlerta}
              </span>
            )}
          </button>

          {/* 5. Inventário Cego */}
          <button
            id="tab-estoque-inventario"
            onClick={() => setActiveSubTab('INVENTARIO')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'INVENTARIO'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Inventário & Balanço</span>
          </button>

          {/* 6. Transferências entre Filiais */}
          <button
            id="tab-estoque-transferencias"
            onClick={() => setActiveSubTab('TRANSFERENCIAS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'TRANSFERENCIAS'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Transferências Filiais ({transferenciasLojas.length})</span>
          </button>

          {/* 7. Bancada & Doses Fracionadas */}
          <button
            id="tab-estoque-bancada"
            onClick={() => setActiveSubTab('BANCADA')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'BANCADA'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Wine className="w-4 h-4" />
            <span>Bancada & Doses ({recipientesAbertos.filter(r => r.status === 'EM_USO').length})</span>
          </button>

          {/* 8. Fichas Técnicas & Combos */}
          <button
            id="tab-estoque-combos"
            onClick={() => setActiveSubTab('COMBOS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'COMBOS'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Combos & Copões ({fichasTecnicas.length})</span>
          </button>

          {/* 9. Chopeiras & Barris */}
          <button
            id="tab-estoque-chopp"
            onClick={() => setActiveSubTab('CHOPP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'CHOPP'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Beer className="w-4 h-4" />
            <span>Chopp & Barris ({torneirasChopp.length})</span>
          </button>

          {/* 10. Vasilhames / Cascos Retornáveis */}
          <button
            id="tab-estoque-vasilhames"
            onClick={() => setActiveSubTab('VASILHAMES')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'VASILHAMES'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Cascos Retornáveis ({vasilhames.length})</span>
          </button>

          {/* 11. Perdas & Avarias */}
          <button
            id="tab-estoque-perdas"
            onClick={() => setActiveSubTab('PERDAS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'PERDAS'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Perdas & Avarias ({perdasEstoque.length})</span>
          </button>

          {/* 12. Auditoria de Doses */}
          <button
            id="tab-estoque-auditoria"
            onClick={() => setActiveSubTab('AUDITORIA')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'AUDITORIA'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Auditoria Doses ({doseAuditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Renderização Condicional Limpa e Modular */}
      {activeSubTab === 'PRODUTOS' && <ProdutosCatalogoTab />}
      {activeSubTab === 'CATEGORIAS' && <CategoriasTab />}
      {activeSubTab === 'MOVIMENTACOES' && <MovimentacoesKardexTab />}
      {activeSubTab === 'LOTES' && <LotesValidadeTab />}
      {activeSubTab === 'INVENTARIO' && <InventarioCegoTab />}
      {activeSubTab === 'TRANSFERENCIAS' && <TransferenciasLojasTab />}
      {activeSubTab === 'BANCADA' && <BancadaDosesTab />}
      {activeSubTab === 'COMBOS' && <FichasTecnicasCombosTab />}
      {activeSubTab === 'CHOPP' && <ChopeirasBarrisTab />}
      {activeSubTab === 'VASILHAMES' && <VasilhamesCascosTab />}
      {activeSubTab === 'PERDAS' && <PerdasAvariasTab />}

      {/* SubTab: AUDITORIA DE DOSES (LOGS HISTÓRICOS) */}
      {activeSubTab === 'AUDITORIA' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950">
            <h4 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <span>Registro de Auditoria de Doses (Dispensações, Degustações e Perdas)</span>
            </h4>
            <span className="text-xs text-zinc-400">{doseAuditLogs.length} eventos registrados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-950/80 uppercase text-[11px] text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Data / Hora</th>
                  <th className="p-3.5">Bebida / Rótulo</th>
                  <th className="p-3.5">Operação</th>
                  <th className="p-3.5 text-center">Volume (ml)</th>
                  <th className="p-3.5">Operador / Bartender</th>
                  <th className="p-3.5">Origem / Comanda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {doseAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-zinc-500">
                      Nenhum registro de auditoria de doses gravado até o momento.
                    </td>
                  </tr>
                ) : (
                  doseAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-3.5 font-mono text-zinc-400 text-[11px] whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="p-3.5 font-semibold text-white">
                        {log.productName}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          log.actionType === 'SALE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : log.actionType === 'WASTE'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                        }`}>
                          {log.actionType === 'SALE' ? 'Venda PDV' : log.actionType === 'WASTE' ? 'Avaria/Quebra' : 'Degustação/Cortesia'}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-mono font-bold text-amber-400">
                        {log.volumeMl} ml
                      </td>
                      <td className="p-3.5 text-zinc-300">
                        {log.operatorName}
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {log.comandaNumber ? `Comanda #${log.comandaNumber}` : (log.notes || 'Venda Direta Balcão')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
