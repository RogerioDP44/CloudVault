import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Smartphone, 
  Trash2, 
  HardDrive, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Info,
  Copy,
  Check
} from 'lucide-react';
import { formatBytes, formatDate } from '../utils/formatters';

export default function CleaningAssistant({ files = [], onOpenUpload }) {
  const [copied, setCopied] = useState(false);
  const [deviceTab, setDeviceTab] = useState('android'); // 'android' | 'ios'

  const totalSize = files.reduce((acc, f) => acc + (f.size_bytes || 0), 0);
  const totalOriginal = files.reduce((acc, f) => acc + (f.original_size_bytes || f.size_bytes || 0), 0);

  const handleCopyList = () => {
    const listText = files.map(f => `- ${f.original_name || f.name} (${formatBytes(f.size_bytes)})`).join('\n');
    navigator.clipboard.writeText(`Arquivos salvos no Supabase:\n${listText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      
      {/* Banner Principal de Economia */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 border border-indigo-500/20 p-5 sm:p-7 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-2.5 text-brand-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Assistente de Liberação de Memória</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
          Você pode liberar até <span className="text-emerald-400">{formatBytes(totalOriginal)}</span> do seu celular
        </h2>
        
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
          Todos os seus <strong className="text-white">{files.length} arquivos</strong> já foram transferidos e estão armazenados com segurança no Supabase. Agora você pode apagar as cópias locais do celular.
        </p>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400">Arquivos na Nuvem</span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">{files.length}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[11px] text-slate-400">Espaço Ocupado</span>
            <p className="text-base sm:text-lg font-bold text-emerald-400 mt-0.5">{formatBytes(totalSize)}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400">Status Backup</span>
              <p className="text-xs font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Protegido
              </p>
            </div>
            <button
              onClick={handleCopyList}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
              title="Copiar lista de arquivos salvos"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Guia Passo a Passo por Dispositivo */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand-400" />
            Como apagar os arquivos com segurança no celular:
          </h3>

          {/* Seletor Android / iOS */}
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setDeviceTab('android')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                deviceTab === 'android' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setDeviceTab('ios')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                deviceTab === 'ios' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              iPhone (iOS)
            </button>
          </div>
        </div>

        {/* Instruções Android */}
        {deviceTab === 'android' && (
          <div className="space-y-3 text-xs text-slate-300 animate-fadeIn">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">1</span>
              <p>Abra o aplicativo <strong>Galeria</strong> ou <strong>Google Fotos / Arquivos (Files)</strong> no seu Android.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">2</span>
              <p>Selecione as fotos, vídeos e documentos que você acabou de subir para o CloudVault.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">3</span>
              <p>Toque em <strong>Mover para a Lixeira</strong> e depois esvazie a lixeira para recuperar a memória imediatamente!</p>
            </div>
          </div>
        )}

        {/* Instruções iPhone iOS */}
        {deviceTab === 'ios' && (
          <div className="space-y-3 text-xs text-slate-300 animate-fadeIn">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">1</span>
              <p>Abra o app <strong>Fotos</strong> ou <strong>Arquivos</strong> no seu iPhone.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">2</span>
              <p>Selecione as fotos/vídeos que foram enviados para o CloudVault e clique no ícone da <strong>Lixeira</strong>.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold shrink-0">3</span>
              <p>Vá até a aba <strong>Álbuns ➔ Apagados</strong> e toque em <strong>Apagar Tudo</strong> para liberar o espaço do iPhone na hora.</p>
            </div>
          </div>
        )}
      </div>

      {/* Checklist de Arquivos Salvos na Nuvem */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Lista de Arquivos Salvos na Nuvem ({files.length}):
        </h3>

        {files.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            Nenhum arquivo enviado ainda. Faça o seu primeiro backup!
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-200 truncate">{file.original_name || file.name}</p>
                    <span className="text-[11px] text-slate-400">{formatBytes(file.size_bytes)}</span>
                  </div>
                </div>

                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shrink-0">
                  Seguro na Nuvem
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
