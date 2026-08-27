import { classifyFile } from './formatters';

// Lista de extensões potencialmente perigosas bloqueadas por segurança
const BLOCKED_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'vbs', 'msi', 'com', 'scr', 'pif', 'jar', 'apk', 'iso', 'bin', 'dll', 'sys'
];

// Constantes de Limites de Tamanho por Categoria
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB (vídeos comprimíveis client-side)
export const MAX_PHOTO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB (fotos otimizáveis client-side)
export const MAX_DOC_SIZE_BYTES   = 50 * 1024 * 1024;  // 50 MB (documentos/arquivos para upload direto)

/**
 * Valida se o arquivo é seguro e respeita os limites de tamanho para envio
 */
export function validateFileSafety(file) {
  if (!file || !file.name) {
    return { safe: false, reason: 'Arquivo inválido' };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return {
      safe: false,
      reason: `Extensão .${ext} bloqueada por motivos de segurança.`
    };
  }

  const category = classifyFile(file);

  if (category === 'videos') {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return {
        safe: false,
        reason: 'Vídeo muito grande (máx: 500MB). Excede o limite de compressão.'
      };
    }
  } else if (category === 'photos') {
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      return {
        safe: false,
        reason: 'Foto muito grande (máx: 100MB). Excede o limite de otimização.'
      };
    }
  } else {
    if (file.size > MAX_DOC_SIZE_BYTES) {
      return {
        safe: false,
        reason: 'Documentos/Arquivos devem ter no máximo 50MB.'
      };
    }
  }

  return { safe: true };
}

/**
 * Sanitiza nomes de arquivos contra injeção e caracteres maliciosos
 */
export function sanitizeFileName(name) {
  if (!name) return 'arquivo';
  return name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .trim();
}
