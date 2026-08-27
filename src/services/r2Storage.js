import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const STORAGE_R2_CONFIG_KEY = 'cloudvault_r2_config';

/**
 * Obtém as configurações salvas do Cloudflare R2
 */
export function getR2Config() {
  let savedConfig = {};
  try {
    const saved = localStorage.getItem(STORAGE_R2_CONFIG_KEY);
    if (saved) {
      savedConfig = JSON.parse(saved) || {};
    }
  } catch (e) {
    console.error('Erro ao ler configurações do Cloudflare R2:', e);
  }
  return {
    accountId: savedConfig.accountId || '7f58455c5d37e2b50d7aa575e205a3ad',
    accessKeyId: savedConfig.accessKeyId || '',
    secretAccessKey: savedConfig.secretAccessKey || '',
    bucketName: savedConfig.bucketName || 'cloudvault',
    publicDomain: savedConfig.publicDomain || 'https://pub-099dd212ad0b4679afe763ed23cf8626.r2.dev'
  };
}

/**
 * Salva as configurações do Cloudflare R2
 */
export function saveR2Config(config) {
  localStorage.setItem(STORAGE_R2_CONFIG_KEY, JSON.stringify(config));
  cachedR2Client = null;
}

let cachedR2Client = null;
let cachedClientKey = '';

/**
 * Retorna o cliente S3 configurado para o Cloudflare R2
 */
export function getR2Client() {
  const config = getR2Config();
  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    return null;
  }
  const key = `${config.accountId}_${config.accessKeyId}`;
  if (cachedR2Client && cachedClientKey === key) {
    return cachedR2Client;
  }

  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
  cachedR2Client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey
    }
  });
  cachedClientKey = key;
  return cachedR2Client;
}

/**
 * Envia o arquivo diretamente para o Cloudflare R2
 */
export async function uploadToR2({ file, storagePath }) {
  const config = getR2Config();
  const s3 = getR2Client();

  if (!s3) {
    throw new Error('Cloudflare R2 não está configurado.');
  }

  const bucketName = config.bucketName || 'cloudvault';
  const arrayBuffer = await file.arrayBuffer();

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: storagePath,
    Body: new Uint8Array(arrayBuffer),
    ContentType: file.type || 'application/octet-stream'
  });

  await s3.send(command);

  // Formata a URL pública de acesso ao arquivo
  let publicUrl = '';
  if (config.publicDomain) {
    let cleanDomain = config.publicDomain.trim().replace(/\/$/, '');
    if (!cleanDomain.startsWith('http://') && !cleanDomain.startsWith('https://')) {
      cleanDomain = `https://${cleanDomain}`;
    }
    publicUrl = `${cleanDomain}/${storagePath}`;
  } else {
    publicUrl = `https://${config.accountId}.r2.cloudflarestorage.com/${bucketName}/${storagePath}`;
  }

  return { storagePath, publicUrl };
}
