// Utilitários de Segurança e Conformidade LGPD

// Lista de extensões potencialmente perigosas bloqueadas por segurança
const BLOCKED_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'vbs', 'msi', 'com', 'scr', 'pif', 'jar', 'apk', 'iso', 'bin', 'dll', 'sys'
];

// Constantes de Limites de Tamanho
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB (limite seguro para compressão client-side)
export const MAX_DIRECT_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB (limite padrão do Supabase)

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

  const isVideo = file.type?.startsWith('video/') || /\.(mp4|mov|mkv|avi|webm)$/i.test(file.name);

  if (isVideo) {
    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      return {
        safe: false,
        reason: 'Vídeo muito grande (máx: 500MB). Limite de compressão do celular/navegador.'
      };
    }
  } else {
    if (file.size > MAX_DIRECT_SIZE_BYTES) {
      return {
        safe: false,
        reason: 'Fotos e documentos devem ter no máximo 50MB.'
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
