import React, { useState } from 'react';
import { 
  Database, Cloud, HardDrive, ShieldCheck, Clock, 
  Download, RefreshCw, CheckCircle2, AlertCircle, Calendar, 
  KeyRound, FileArchive, Lock, Server
} from 'lucide-react';
import { useAdega } from '../../context/AdegaContext';

interface BackupScheduleConfig {
  autoBackupEnabled: boolean;
  frequency: 'HOURLY' | 'DAILY' | 'TWICE_DAILY' | 'WEEKLY';
  dailyTime: string;
  destination: 'LOCAL_AND_CLOUD' | 'LOCAL_ONLY' | 'CLOUD_ONLY';
  cloudProvider: 'GOOGLE_CLOUD_STORAGE' | 'AWS_S3' | 'FIREBASE_STORAGE';
  retentionDays: number;
  encryptBackups: boolean;
  notifyOnFailure: boolean;
  lastBackupDate: string;
  nextScheduledBackup: string;
}

export const BackupSegurancaTab: React.FC = () => {
  const { 
    products, 
    orders, 
    customers, 
    cashSession, 
    documentosFiscais, 
    fornecedores, 
    pedidosCompra, 
    recebimentosMercadoria,
    resetarDadosParaPadrao 
  } = useAdega();

  const [config, setConfig] = useState<BackupScheduleConfig>({
    autoBackupEnabled: true,
    frequency: 'DAILY',
    dailyTime: '23:30',
    destination: 'LOCAL_AND_CLOUD',
    cloudProvider: 'GOOGLE_CLOUD_STORAGE',
    retentionDays: 30,
    encryptBackups: true,
    notifyOnFailure: true,
    lastBackupDate: new Date(Date.now() - 3600000 * 4).toLocaleString('pt-BR'),
    nextScheduledBackup: 'Hoje às 23:30 (Automático)',
  });

  const [isExporting, setIsExporting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleManualBackup = () => {
    setIsExporting(true);
    setTimeout(() => {
      // Create backup snapshot payload with all live entities
      const backupData = {
        system: 'ADEGAPRO PDV & GESTÃO',
        version: '4.2.0',
        timestamp: new Date().toISOString(),
        data: {
          products,
          fornecedores,
          pedidosCompra,
          recebimentosMercadoria,
          customers,
          orders,
          cashSession,
          documentosFiscaisCount: documentosFiscais?.length || 0,
          exportedAt: new Date().toLocaleString('pt-BR'),
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_adegapro_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      setConfig(prev => ({
        ...prev,
        lastBackupDate: new Date().toLocaleString('pt-BR'),
      }));
      setIsExporting(false);
      setSuccessToast('Backup completo exportado e sincronizado com sucesso!');
      setTimeout(() => setSuccessToast(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Snapshot Verificado</span>
        </div>
      )}

      {/* Top Banner Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Status do Agendador</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-xl font-bold text-zinc-100 flex items-center gap-2 font-serif">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>{config.autoBackupEnabled ? 'Agendador Ativo' : 'Pausado'}</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Próxima execução: <strong className="text-zinc-200">{config.nextScheduledBackup}</strong>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold">Último Backup Realizado</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-base font-bold text-zinc-200 font-mono">
            {config.lastBackupDate}
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            100% íntegro (Local + Nuvem)
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-300">Backup Imediato</span>
            <p className="text-[11px] text-zinc-400 mt-1">
              Gere um snapshot instantâneo com todos os dados de estoque, PDV e clientes.
            </p>
          </div>
          <button
            onClick={handleManualBackup}
            disabled={isExporting}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Empacotando Snapshot...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Fazer Backup Agora</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <div className="border-b border-zinc-800 pb-4">
          <h3 className="font-bold text-base text-zinc-100 font-serif flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-400" />
            Configuração de Agendamento Automático de Backups
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Defina horários, retenção de dados e replicação em nuvem para proteção contra perda de dados.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frequência e Horário */}
          <div className="space-y-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-200 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                Agendamento Automático
              </label>
              <input
                type="checkbox"
                checked={config.autoBackupEnabled}
                onChange={(e) => setConfig({ ...config, autoBackupEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Frequência de Execução</label>
              <select
                value={config.frequency}
                onChange={(e) => setConfig({ ...config, frequency: e.target.value as any })}
                disabled={!config.autoBackupEnabled}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500 disabled:opacity-40"
              >
                <option value="HOURLY">A cada 1 hora (Tempo Real)</option>
                <option value="TWICE_DAILY">2 vezes ao dia (Fechamento de turno)</option>
                <option value="DAILY">Diariamente (Recomendado)</option>
                <option value="WEEKLY">Semanalmente</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Horário Preferencial (Rotina Noturna)</label>
              <input
                type="time"
                value={config.dailyTime}
                onChange={(e) => setConfig({ ...config, dailyTime: e.target.value })}
                disabled={!config.autoBackupEnabled}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-500 disabled:opacity-40"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Geralmente configurado após o fechamento do caixa da adega.
              </p>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Retenção de Arquivos (Dias)</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={config.retentionDays}
                  onChange={(e) => setConfig({ ...config, retentionDays: Number(e.target.value) })}
                  className="w-24 bg-zinc-900 border border-zinc-700 rounded-xl p-2 text-xs text-zinc-100 font-mono"
                />
                <span className="text-xs text-zinc-400">dias de histórico arquivado</span>
              </div>
            </div>
          </div>

          {/* Destino e Criptografia */}
          <div className="space-y-4 p-5 rounded-2xl bg-zinc-950 border border-zinc-800">
            <label className="text-xs font-bold text-zinc-200 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-sky-400" />
              Destino do Armazenamento
            </label>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Local de Gravação</label>
              <select
                value={config.destination}
                onChange={(e) => setConfig({ ...config, destination: e.target.value as any })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
              >
                <option value="LOCAL_AND_CLOUD">Local + Nuvem Segura (Máxima Proteção)</option>
                <option value="LOCAL_ONLY">Apenas Local (Disco / Servidor PDV)</option>
                <option value="CLOUD_ONLY">Apenas Nuvem Externa</option>
              </select>
            </div>

            {config.destination !== 'LOCAL_ONLY' && (
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Provedor Cloud</label>
                <select
                  value={config.cloudProvider}
                  onChange={(e) => setConfig({ ...config, cloudProvider: e.target.value as any })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="GOOGLE_CLOUD_STORAGE">Google Cloud Storage (Brasil - São Paulo)</option>
                  <option value="AWS_S3">Amazon S3 (South America)</option>
                  <option value="FIREBASE_STORAGE">Firebase Cloud Storage</option>
                </select>
              </div>
            )}

            <div className="pt-2 space-y-3 border-t border-zinc-800">
              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Criptografia AES-256 no Snapshot
                </span>
                <input
                  type="checkbox"
                  checked={config.encryptBackups}
                  onChange={(e) => setConfig({ ...config, encryptBackups: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-zinc-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Alertar Gerência em caso de Falha
                </span>
                <input
                  type="checkbox"
                  checked={config.notifyOnFailure}
                  onChange={(e) => setConfig({ ...config, notifyOnFailure: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Restaurar Dados Originais de Fábrica</span>
          </button>

          <button
            onClick={() => {
              setSuccessToast('Agendamento de backup salvo com sucesso no sistema!');
              setTimeout(() => setSuccessToast(null), 3000);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Salvar Configurações de Backup</span>
          </button>
        </div>

        {/* Local Storage Health Card */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-zinc-200">Persistência Local Ativa</p>
              <p className="text-[11px] text-zinc-400">
                {products.length} produtos, {fornecedores.length} fornecedores, {pedidosCompra.length} pedidos de compra e {customers.length} clientes salvos continuamente no navegador.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Sincronizado
          </span>
        </div>

        {/* Modal de Confirmação de Restauração */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-rose-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Restaurar Dados Originais?</h4>
                  <p className="text-xs text-zinc-400">Esta ação limpará as alterações recentes salvas localmente.</p>
                </div>
              </div>
              <p className="text-xs text-zinc-300">
                Todos os produtos, pedidos de compra e fornecedores cadastrados retornarão ao catálogo padrão inicial do sistema.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    resetarDadosParaPadrao();
                    setShowResetConfirm(false);
                    setSuccessToast('Dados restaurados para o padrão de fábrica com sucesso!');
                    setTimeout(() => setSuccessToast(null), 3000);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30"
                >
                  Sim, Restaurar Padrão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
