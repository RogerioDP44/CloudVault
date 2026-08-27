// Utilitários de formatação e classificação automática de arquivos

/**
 * Converte bytes em formatos legíveis (KB, MB, GB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Formata data em formato amigável em português (ex: "Hoje às 14:30" ou "27/08/2026")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
  
  const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  
  if (isToday) return `Hoje às ${timeStr}`;
  if (isYesterday) return `Ontem às ${timeStr}`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  }) + ` • ${timeStr}`;
}

/**
 * Obtém a extensão de um arquivo em minúsculo
 */
export function getFileExtension(filename) {
  if (!filename) return '';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * CLASSIFICAÇÃO AUTOMÁTICA INTELIGENTE:
 * Identifica se é 'photos', 'videos' ou 'documents' com base no MIME type e extensão
 */
export function classifyFile(file) {
  const mime = (file.type || '').toLowerCase();
  const ext = getFileExtension(file.name || '');

  // 1. Fotos & Imagens
  const photoExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'bmp', 'heic', 'heif', 'avif', 'tiff'];
  if (mime.startsWith('image/') || photoExtensions.includes(ext)) {
    return 'photos';
  }

  // 2. Vídeos
  const videoExtensions = ['mp4', 'mov', 'webm', 'mkv', 'avi', 'wmv', '3gp', 'flv', 'm4v', 'ts'];
  if (mime.startsWith('video/') || videoExtensions.includes(ext)) {
    return 'videos';
  }

  // 3. Qualquer outro tipo -> Arquivos / Documentos
  return 'documents';
}

/**
 * Rótulos das categorias em Português
 */
export const CATEGORY_DETAILS = {
  photos: {
    key: 'photos',
    label: 'Fotos',
    singular: 'Foto',
    icon: 'Camera',
    color: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    folderName: 'fotos'
  },
  videos: {
    key: 'videos',
    label: 'Vídeos',
    singular: 'Vídeo',
    icon: 'Video',
    color: 'rose',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    folderName: 'videos'
  },
  documents: {
    key: 'documents',
    label: 'Arquivos',
    singular: 'Arquivo',
    icon: 'FileText',
    color: 'blue',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    folderName: 'arquivos'
  }
};
