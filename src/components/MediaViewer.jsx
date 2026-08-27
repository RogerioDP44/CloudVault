import React, { useEffect } from 'react';
import { 
  X, 
  Download, 
  Share2, 
  Trash2, 
  ExternalLink, 
  FileText, 
  Maximize2, 
  Sparkles,
  Calendar,
  HardDrive
} from 'lucide-react';
import { formatBytes, formatDate, getFileExtension } from '../utils/formatters';

export default function MediaViewer({ file, onClose, onDownload, onShare, onDelete }) {
  if (!file) return null;

  // Fechar com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const ext = getFileExtension(file.original_name || file.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-2 sm:p-4">
      
      {/* Container Principal */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Barra Superior do Viewer */}
        <div className="flex items-center justify-between p-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="min-w-0 pr-3">
            <h2 className="text-sm font-bold text-slate-100 truncate">
              {file.original_name || file.name}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{formatBytes(file.size_bytes)}</span>
              <span>•</span>
              <span>{formatDate(file.created_at)}</span>
              {file.compressed && (
                <span className="hidden sm:inline-flex text-emerald-400 font-semibold items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Otimizado
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onShare(file)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title="Compartilhar"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDownload(file)}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              title="Baixar Arquivo"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-200 hover:text-white transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Área Central de Conteúdo */}
        <div className="relative flex-1 min-h-[300px] max-h-[65vh] bg-black/50 flex items-center justify-center p-2 overflow-auto">
          {file.category === 'photos' && (
            <img
              src={file.file_url}
              alt={file.original_name}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          )}

          {file.category === 'videos' && (
            <video
              src={file.file_url}
              controls
              autoPlay
              playsInline
              className="max-h-[60vh] max-w-full rounded-lg shadow-lg"
            />
          )}

          {file.category === 'documents' && (
            <div className="text-center p-8 max-w-md">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 text-brand-400">
                <FileText className="w-10 h-10" />
              </div>
              <h3 className="text-base font-bold text-slate-200 mb-1 truncate">{file.original_name || file.name}</h3>
              <p className="text-xs text-slate-400 mb-6">Formato {ext.toUpperCase()} • {formatBytes(file.size_bytes)}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Abrir em Nova Aba
                </a>
                <button
                  onClick={() => onDownload(file)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-glow-brand"
                >
                  <Download className="w-4 h-4" /> Baixar no Dispositivo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Ações & Metadados */}
        <div className="p-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              {formatBytes(file.size_bytes)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {formatDate(file.created_at)}
            </span>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja excluir este arquivo da nuvem?')) {
                onDelete(file);
                onClose();
              }
            }}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>
        </div>

      </div>
    </div>
  );
}
