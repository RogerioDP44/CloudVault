// Utilitários de Segurança e Conformidade LGPD

// Lista de extensões potencialmente perigosas bloqueadas por segurança
const BLOCKED_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'sh', 'vbs', 'msi', 'com', 'scr', 'pif', 'jar', 'apk', 'iso', 'bin', 'dll', 'sys'
];

/**
 * Valida se o arquivo é seguro para envio
 */
export function validateFileSafety(file) {
  if (!file || !file.name) {
    return { safe: false, reason: 'Arquivo inválido' };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return {
      safe: false,
      reason: `Extensão .${ext} bloqueada por motivos de segurança e proteção do sistema.`
    };
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
