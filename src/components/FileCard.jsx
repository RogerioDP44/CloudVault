import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Download, 
  Share2, 
  Trash2, 
  ExternalLink, 
  FileText, 
  FileCode, 
  FileArchive, 
  FileAudio, 
  FileSpreadsheet,
  File,
  Sparkles,
  MoreVertical,
  Check,
  Folder,
  FolderInput
} from 'lucide-react';
import { formatBytes, formatDate, getFileExtension } from '../utils/formatters';

export default function FileCard({ file, onView, onDownload, onShare, onDelete, onMove, folders = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const moveRef = useRef(null);

  // Fecha dropdown de pasta ao clicar fora
  useEffect(() => {
    if (!moveOpen) return;
    const handleOutside = (e) => {
      if (moveRef.current && !moveRef.current.contains(e.target)) {
        setMoveOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [moveOpen]);

  const handleMove = (folderName) => {
    if (onMove) onMove(file, folderName || null);
    setMoveOpen(false);
  };

  const ext = getFileExtension(file.original_name || file.name);

  // Calcula quanto espaço foi economizado
  const savedBytes = (file.original_size_bytes && file.original_size_bytes > file.size_bytes)
    ? file.original_size_bytes - file.size_bytes
    : 0;
  
  const savedPercent = file.original_size_bytes 
    ? Math.round((savedBytes / file.original_size_bytes) * 100) 
    : 0;

  // Renderizador de Ícones para Documentos
  const renderDocIcon = () => {
    const iconClass = "w-10 h-10";
    if (['pdf'].includes(ext)) return <FileText className={`${iconClass} text-red-400`} />;
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <FileArchive className={`${iconClass} text-amber-400`} />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <FileSpreadsheet className={`${iconClass} text-emerald-400`} />;
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) return <FileAudio className={`${iconClass} text-purple-400`} />;
    if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py'].includes(ext)) return <FileCode className={`${iconClass} text-cyan-400`} />;
    return <File className={`${iconClass} text-blue-400`} />;
  };

  return (
    <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 flex flex-col overflow-hidden shadow-lg hover:shadow-indigo-500/10">
      
      {/* Visualização de Fotos */}
      {file.category === 'photos' && (
        <div 
          onClick={() => onView(file)}
          className="relative aspect-square w-full bg-slate-950/60 overflow-hidden cursor-pointer flex items-center justify-center"
        >
          {!imgLoaded && <div className="absolute inset-0 skeleton-shimmer" />}
          <img
            src={file.file_url}
            alt={file.original_name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          
          {/* Tag de Economia de Espaço */}
          {savedPercent > 10 && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-950/80 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-300 flex items-center gap-1 shadow">
              <Sparkles className="w-2.5 h-2.5" /> -{savedPercent}%
            </span>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span className="text-xs font-semibold text-white drop-shadow">Ver foto completa</span>
          </div>
        </div>
      )}

      {/* Visualização de Vídeos */}
      {file.category === 'videos' && (
        <div 
          onClick={() => onView(file)}
          className="relative aspect-video w-full bg-slate-950 overflow-hidden cursor-pointer flex items-center justify-center group/video"
        >
          <video
            src={file.file_url}
            preload="metadata"
            className="w-full h-full object-cover opacity-80 group-hover/video:opacity-100 transition-opacity"
          />
          
          {/* Overlay do Botão Play */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/video:bg-black/10 transition-colors">
            <div className="w-12 h-12 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-glow-brand group-hover/video:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>

          {/* Badge de Compressão */}
          {file.compressed && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-rose-950/80 backdrop-blur-md border border-rose-500/30 text-[10px] font-bold text-rose-300 flex items-center gap-1 shadow">
              <Sparkles className="w-2.5 h-2.5" /> Vídeo Otimizado
            </span>
          )}
        </div>
      )}

      {/* Visualização de Arquivos / Documentos */}
      {file.category === 'documents' && (
        <div 
          onClick={() => onView(file)}
          className="p-5 bg-gradient-to-b from-slate-800/40 to-slate-900/60 flex items-center justify-between cursor-pointer border-b border-slate-800/60"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700/60 shrink-0">
              {renderDocIcon()}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                {ext || 'ARQUIVO'}
              </span>
              <p className="text-xs text-slate-400 mt-1">Clique para abrir ou baixar</p>
            </div>
          </div>
        </div>
      )}

      {/* Detalhes do Arquivo (Nome, Tamanho, Data e Ações) */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2">
        <div className="min-w-0">
          <h3 
            className="text-xs font-semibold text-slate-200 truncate group-hover:text-white transition-colors"
            title={file.original_name || file.name}
          >
            {file.original_name || file.name}
          </h3>
          
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span className="font-medium text-slate-300">{formatBytes(file.size_bytes)}</span>
            <span>•</span>
            <span className="truncate">{formatDate(file.created_at)}</span>
          </div>
        </div>

        {/* Barra de Ações Rápidas */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 mt-1">
          <div className="flex items-center gap-1">
            {/* Compartilhar */}
            <button
              onClick={(e) => { e.stopPropagation(); onShare(file); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors"
              title="Compartilhar arquivo"
              aria-label="Compartilhar arquivo"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Baixar */}
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(file); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
              title="Baixar arquivo"
              aria-label="Baixar arquivo"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Mover para Pasta */}
            <div ref={moveRef} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setMoveOpen(v => !v); }}
                className={`p-1.5 rounded-lg transition-colors ${
                  file.folder_name
                    ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-950/40'
                    : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
                }`}
                title={file.folder_name ? `Pasta: ${file.folder_name}` : 'Mover para pasta'}
              >
                <FolderInput className="w-4 h-4" />
              </button>

              {/* Dropdown de pastas */}
              {moveOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-8 left-0 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl min-w-[170px] py-1.5 animate-fade-in"
                >
                  <p className="text-[10px] font-bold text-slate-500 px-3 py-1">Mover para:</p>

                  {/* Sem pasta */}
                  <button
                    onClick={() => handleMove(null)}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                      !file.folder_name
                        ? 'text-slate-300 bg-slate-800/80'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    Sem pasta
                  </button>

                  {/* Pastas disponíveis */}
                  {folders.map(f => (
                    <button
                      key={f}
                      onClick={() => handleMove(f)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 transition-colors ${
                        file.folder_name === f
                          ? 'text-indigo-300 bg-indigo-950/60'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{f}</span>
                      {file.folder_name === f && <Check className="w-3 h-3 ml-auto shrink-0" />}
                    </button>
                  ))}

                  {folders.length === 0 && (
                    <p className="text-[10px] text-slate-600 px-3 py-1.5">
                      Crie uma pasta na barra acima
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Excluir com confirmação inline */}
          <div>
            {deleteConfirm ? (
              <div className="flex items-center gap-1 animate-fadeIn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file);
                    setDeleteConfirm(false);
                  }}
                  className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-[11px] font-bold text-white transition-colors"
                >
                  Excluir?
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(false); }}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] text-slate-300 hover:text-white"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(true); }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Excluir arquivo"
                aria-label="Excluir arquivo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
