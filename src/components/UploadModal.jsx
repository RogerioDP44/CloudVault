import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  UploadCloud, 
  Camera, 
  Video, 
  FolderPlus, 
  FileUp, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Loader2,
  Trash2,
  Layers,
  ArrowRight,
  Folder,
  Plus,
  Check,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { classifyFile, formatBytes, CATEGORY_DETAILS } from '../utils/formatters';
import { uploadSingleFile } from '../services/supabase';
import { needsCompression } from '../services/videoCompressor';
import { validateFileSafety } from '../utils/security';

export default function UploadModal({ isOpen, onClose, currentUser, onUploadComplete, onOpenCleaning, onOpenAuth, folders = [], defaultFolder = null }) {
  if (!isOpen) return null;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadIndex, setUploadIndex] = useState(0);
  const [completedResults, setCompletedResults] = useState(null);

  // Pasta de destino
  const [selectedFolder, setSelectedFolder] = useState(defaultFolder || null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderInput, setNewFolderInput] = useState('');

  const fileInputRef = useRef(null);
  const cameraPhotoRef = useRef(null);
  const cameraVideoRef = useRef(null);

  // Reseta estado quando o modal abre
  useEffect(() => {
    if (isOpen) {
      setSelectedFolder(defaultFolder || null);
      setIsCreatingFolder(false);
      setNewFolderInput('');
    }
  }, [isOpen, defaultFolder]);

  // Manipula a seleção de arquivos com validação de segurança
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const mapped = files.map((file, idx) => {
      const safety = validateFileSafety(file);
      const category = classifyFile(file);
      const willCompress = needsCompression(file);

      return {
        id: `queue_${Date.now()}_${idx}`,
        file,
        name: file.name,
        size: file.size,
        category,
        willCompress,
        isSafe: safety.safe,
        status: safety.safe ? 'pending' : 'error',
        progress: 0,
        statusText: !safety.safe 
          ? safety.reason 
          : willCompress 
            ? 'Será comprimido (>50MB)' 
            : 'Pronto para envio'
      };
    });

    setSelectedFiles((prev) => [...prev, ...mapped]);
    e.target.value = '';
  };

  // Remove um item da fila antes do envio
  const handleRemoveFile = (id) => {
    setSelectedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Inicia o processo de upload sequencial inteligente
  const handleStartUpload = async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    let totalBytesUploaded = 0;
    const uploadedRecords = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const item = selectedFiles[i];
      setUploadIndex(i + 1);

      setSelectedFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: 'processing', statusText: 'Iniciando...' } : f
        )
      );

      try {
        const record = await uploadSingleFile({
          file: item.file,
          user: currentUser,
          folderName: selectedFolder,
          onProgress: (p) => {
            setCurrentProgress(p);
            setSelectedFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: p } : f
              )
            );
          },
          onStatusChange: (status) => {
            setStatusMessage(status.message);
            setSelectedFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, statusText: status.message } : f
              )
            );
          }
        });

        totalBytesUploaded += item.file.size;
        uploadedRecords.push(record);

        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'done', progress: 100, statusText: 'Salvo com sucesso!' } : f
          )
        );
      } catch (err) {
        console.error('Erro no upload do item:', item.name, err);
        setSelectedFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'error', statusText: 'Falha: ' + err.message } : f
          )
        );
      }
    }

    setIsUploading(false);

    // Efeito de celebração com confetes
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Resumo final
    setCompletedResults({
      count: uploadedRecords.length,
      totalBytes: totalBytesUploaded
    });

    if (onUploadComplete) {
      onUploadComplete(uploadedRecords);
    }
  };

  // Resetar modal
  const handleReset = () => {
    setSelectedFiles([]);
    setIsUploading(false);
    setCompletedResults(null);
    setCurrentProgress(0);
    setStatusMessage('');
    setSelectedFolder(defaultFolder || null);
    setIsCreatingFolder(false);
    setNewFolderInput('');
  };

  // Totais
  const totalQueueBytes = selectedFiles.reduce((acc, f) => acc + f.size, 0);
  const heavyVideosCount = selectedFiles.filter((f) => f.willCompress).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      
      {/* Inputs Ocultos para Acesso à Câmera e Galeria */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        multiple 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraPhotoRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraVideoRef} 
        onChange={handleFileChange} 
        accept="video/*" 
        capture="camcorder" 
        className="hidden" 
      />

      {/* Painel do Modal */}
      <div className="w-full max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-none">Backup na Nuvem</h2>
              <p className="text-xs text-slate-400 mt-0.5">Separação e compressão 100% automáticas</p>
            </div>
          </div>

          <button
            onClick={() => { if (!isUploading) onClose(); }}
            disabled={isUploading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Central */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {/* Tela de Sucesso Pós-Upload */}
          {completedResults ? (
            <div className="py-6 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/40">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-white">Upload Concluído com Sucesso!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  <span className="text-emerald-400 font-bold">{completedResults.count} arquivos</span> ({formatBytes(completedResults.totalBytes)}) estão salvos e seguros na sua nuvem.
                </p>
              </div>

              {/* Card de Dica de Limpeza */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Pronto para liberar espaço no celular?
                </div>
                <p className="text-xs text-slate-300">
                  Como esses arquivos já estão guardados no Supabase, você já pode apagá-los da memória do seu celular com tranquilidade.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenCleaning) onOpenCleaning();
                  }}
                  className="w-full mt-2 py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 border border-amber-500/40 transition-colors"
                >
                  Abrir Assistente de Limpeza <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  Enviar Mais Arquivos
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-glow-brand"
                >
                  Ver Meus Arquivos
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Seletor de Pasta */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Folder className="w-3.5 h-3.5 text-indigo-400" /> Pasta de destino
                  </span>
                  {selectedFolder && (
                    <button
                      onClick={() => setSelectedFolder(null)}
                      className="text-[10px] text-slate-600 hover:text-rose-400 transition-colors"
                    >
                      remover pasta
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {/* Sem pasta */}
                  <button
                    onClick={() => setSelectedFolder(null)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      !selectedFolder
                        ? 'bg-slate-700 text-white border-slate-600'
                        : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    Sem pasta
                  </button>

                  {/* Pastas existentes */}
                  {folders.map(f => (
                    <button
                      key={f}
                      onClick={() => setSelectedFolder(f)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 ${
                        selectedFolder === f
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                          : 'bg-slate-900/80 text-slate-500 border-slate-800 hover:text-slate-300'
                      }`}
                    >
                      <Folder className="w-3 h-3" /> {f}
                    </button>
                  ))}

                  {/* Nova pasta */}
                  <button
                    onClick={() => setIsCreatingFolder(v => !v)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border border-dashed border-slate-700 text-slate-600 hover:text-brand-400 hover:border-brand-500/40 transition-all flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Nova
                  </button>
                </div>

                {/* Input criação inline */}
                {isCreatingFolder && (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      type="text"
                      value={newFolderInput}
                      onChange={e => setNewFolderInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newFolderInput.trim()) {
                          setSelectedFolder(newFolderInput.trim());
                          setIsCreatingFolder(false);
                          setNewFolderInput('');
                        }
                        if (e.key === 'Escape') {
                          setIsCreatingFolder(false);
                          setNewFolderInput('');
                        }
                      }}
                      placeholder="Nome da nova pasta..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-slate-600 outline-none focus:border-brand-500/60"
                    />
                    <button
                      type="button"
                      onClick={() => setNewFolderInput(
                        new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                          .replace(/^\w/, c => c.toUpperCase())
                      )}
                      title="Usar mês atual"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-brand-400 transition-colors"
                    >
                      <Calendar className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (newFolderInput.trim()) {
                          setSelectedFolder(newFolderInput.trim());
                          setIsCreatingFolder(false);
                          setNewFolderInput('');
                        }
                      }}
                      disabled={!newFolderInput.trim()}
                      className="p-1.5 rounded-lg bg-brand-600 text-white disabled:opacity-40 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsCreatingFolder(false); setNewFolderInput(''); }}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Botões de Seleção Rápida */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex flex-col items-center justify-center gap-1.5 transition-all text-center group disabled:opacity-50"
                >
                  <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 group-hover:scale-110 transition-transform">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Selecionar Tudo</span>
                  <span className="text-[10px] text-slate-400">Fotos, vídeos e docs</span>
                </button>

                <button
                  onClick={() => cameraPhotoRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex flex-col items-center justify-center gap-1.5 transition-all text-center group disabled:opacity-50"
                >
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Tirar Foto</span>
                  <span className="text-[10px] text-slate-400">Câmera direta</span>
                </button>

                <button
                  onClick={() => cameraVideoRef.current?.click()}
                  disabled={isUploading}
                  className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex flex-col items-center justify-center gap-1.5 transition-all text-center group disabled:opacity-50"
                >
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-200">Gravar Vídeo</span>
                  <span className="text-[10px] text-slate-400">Vídeo direto</span>
                </button>
              </div>

              {/* Aviso de Compressão de Vídeo Automática */}
              {heavyVideosCount > 0 && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-200 leading-relaxed">
                    <strong className="text-rose-300">Compressão Automática Ativa:</strong> {heavyVideosCount} vídeo(s) com mais de 50MB serão comprimidos no navegador antes de subir para o Supabase.
                  </p>
                </div>
              )}

              {/* Lista de Arquivos Selecionados */}
              {selectedFiles.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span>Fila de Upload ({selectedFiles.length} itens • {formatBytes(totalQueueBytes)})</span>
                    {!isUploading && (
                      <button
                        onClick={() => setSelectedFiles([])}
                        className="text-rose-400 hover:text-rose-300 text-[11px] font-semibold"
                      >
                        Limpar Fila
                      </button>
                    )}
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {selectedFiles.map((item) => {
                      const details = CATEGORY_DETAILS[item.category];
                      return (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase ${details.badgeClass}`}>
                                {details.label}
                              </span>
                              <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                              <span>{formatBytes(item.size)}</span>
                              <span>•</span>
                              <span className={item.status === 'error' ? 'text-rose-400' : 'text-slate-400'}>
                                {item.statusText}
                              </span>
                            </div>
                            {/* Barra de progresso individual se em processamento */}
                            {item.status === 'processing' && (
                              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                <div
                                  className="bg-brand-500 h-full transition-all duration-200"
                                  style={{ width: `${item.progress}%` }}
                                />
                              </div>
                            )}
                          </div>

                          {!isUploading && item.status === 'pending' && (
                            <button
                              onClick={() => handleRemoveFile(item.id)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {item.status === 'done' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}

                          {item.status === 'processing' && (
                            <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Estado Vazio / Dica */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-3xl border-2 border-dashed border-slate-800 hover:border-brand-500/50 bg-slate-950/40 text-center cursor-pointer transition-all space-y-2"
                >
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                    <FileUp className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-200">Toque aqui para escolher arquivos</h4>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Fotos, vídeos e documentos são separados automaticamente nas categorias certas.
                  </p>
                </div>
              )}
            </>
          )}

        </div>

        {/* Rodapé com Botão de Ação Principal */}
        {!completedResults && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/90">
            {isUploading ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                    Enviando item {uploadIndex} de {selectedFiles.length}...
                  </span>
                  <span className="text-brand-400 font-bold">{currentProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-600 to-indigo-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 truncate">{statusMessage}</p>
              </div>
            ) : (
              <button
                onClick={handleStartUpload}
                disabled={selectedFiles.length === 0}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-indigo-400 text-white text-sm font-bold shadow-glow-brand disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
              >
                <UploadCloud className="w-5 h-5" />
                Fazer Backup no Supabase ({selectedFiles.length})
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
