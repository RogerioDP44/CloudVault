import { createClient } from '@supabase/supabase-js';
import { classifyFile } from '../utils/formatters';
import { compressVideoClientSide, needsCompression } from './videoCompressor';
import { optimizeImage } from './imageCompressor';

// Chaves de armazenamento local
const STORAGE_CONFIG_KEY = 'cloudvault_supabase_config';
const LOCAL_MOCK_STORAGE_KEY = 'cloudvault_local_files_demo';
const LOCAL_MOCK_AUTH_KEY = 'cloudvault_local_auth_demo';
const LOCAL_MOCK_PROFILES_KEY = 'cloudvault_local_profiles_demo';

// Configuração padrão do Supabase CloudVault
const DEFAULT_SUPABASE_URL = 'https://tkpuhumphrakvnwvltqc.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrcHVodW1waHJha3Zud3ZsdHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NDE0MTQsImV4cCI6MjEwMzQxNzQxNH0.ooRO1hEDkshTtaINxdJWLNxoRSTI9Dw-JLd2WJcSh4k';

// Carrega configurações salvas ou variáveis de ambiente com fallback padrão
export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch (e) {
    console.error('Erro ao ler config do Supabase:', e);
  }

  return {
    url: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  };
}

export function saveSupabaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(config));
    supabaseClientInstance = null;
    return true;
  } catch (e) {
    console.error('Erro ao salvar config do Supabase:', e);
    return false;
  }
}

// Instância única do cliente Supabase
let supabaseClientInstance = null;

export function getSupabase() {
  if (supabaseClientInstance) return supabaseClientInstance;

  const config = getSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseClientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        }
      });
      return supabaseClientInstance;
    } catch (e) {
      console.error('Falha ao inicializar Supabase:', e);
    }
  }
  return null;
}

/**
 * Testa a conexão com o Supabase fornecido
 */
export async function testSupabaseConnection(url, anonKey) {
  try {
    const testClient = createClient(url, anonKey);
    const { data, error } = await testClient.storage.listBuckets();
    if (error) {
      if (error.message.includes('permission') || error.message.includes('policy')) {
        return { success: true, message: 'Conectado! (Políticas ativas)' };
      }
      return { success: false, error: error.message };
    }
    return { success: true, message: 'Conexão estabelecida com sucesso!', buckets: data };
  } catch (e) {
    return { success: false, error: e.message || 'Falha ao conectar no Supabase' };
  }
}

/**
 * AUTENTICAÇÃO: Obter sessão / usuário logado atual + perfil de aprovação
 */
export async function getCurrentUser() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session?.user) {
        // Busca perfil na tabela public.profiles para ver se is_approved = true
        let profile = null;
        try {
          const { data, error: pErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (!pErr && data) profile = data;
        } catch (pe) {}

        const isAdminEmail = session.user.email?.toLowerCase() === 'rdpisa@gmail.com';
        const isApproved = isAdminEmail ? true : Boolean(profile?.is_approved);
        const resolvedRole = isAdminEmail ? 'admin' : (profile?.role === 'admin' ? 'admin' : 'user');

        return {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          phone: profile?.phone || session.user.user_metadata?.phone || '',
          is_approved: isApproved,
          role: resolvedRole,
          isLocal: false
        };
      }
    } catch (e) {
      console.error('Erro ao obter sessão Supabase:', e);
    }
  }

  // Limpa qualquer dado mock residual antigo
  try {
    localStorage.removeItem(LOCAL_MOCK_AUTH_KEY);
  } catch (e) {}

  return null;
}

/**
 * AUTENTICAÇÃO: Cadastro de Novo Usuário (Sign Up)
 * Novos usuários começam estritamente com is_approved = false (bloqueados)
 */
export async function signUpUser({ email, password, name, phone }) {
  const supabase = getSupabase();

  if (!supabase) {
    throw new Error('Supabase não conectado. Verifique as credenciais.');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        phone
      }
    }
  });

  if (error) throw error;

  const userId = data.user?.id || 'user_' + Date.now();
  const isAdminEmail = email.toLowerCase() === 'rdpisa@gmail.com';
  const profileRecord = {
    id: userId,
    name,
    email,
    phone,
    is_approved: isAdminEmail ? true : false, // Estritamente bloqueado para novos usuários
    role: isAdminEmail ? 'admin' : 'user',
    created_at: new Date().toISOString()
  };

  // Garante a inserção/atualização do perfil na tabela profiles
  if (data.user) {
    try {
      await supabase.from('profiles').upsert(profileRecord);
    } catch (err) {
      console.warn('Erro ao inserir perfil no Supabase:', err);
    }
  }

  return {
    user: {
      id: userId,
      email: data.user?.email || email,
      name,
      phone,
      is_approved: isAdminEmail ? true : false,
      role: isAdminEmail ? 'admin' : 'user',
      isLocal: false
    },
    session: data.session
  };
}

/**
 * AUTENTICAÇÃO: Login de Usuário (Sign In)
 */
export async function signInUser({ email, password }) {
  const supabase = getSupabase();

  if (!supabase) {
    throw new Error('Supabase não inicializado.');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Busca perfil
  let profile = null;
  try {
    const { data: pData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
    profile = pData;
  } catch (pe) {}

  const isAdminEmail = data.user.email?.toLowerCase() === 'rdpisa@gmail.com';
  const isApproved = isAdminEmail ? true : Boolean(profile?.is_approved);
  const resolvedRole = isAdminEmail ? 'admin' : (profile?.role === 'admin' ? 'admin' : 'user');

  // Limpa qualquer mock anterior
  try {
    localStorage.removeItem(LOCAL_MOCK_AUTH_KEY);
    localStorage.removeItem(LOCAL_MOCK_PROFILES_KEY);
  } catch (e) {}

  return {
    user: {
      id: data.user.id,
      email: data.user.email,
      name: profile?.name || data.user.user_metadata?.name || data.user.email.split('@')[0],
      phone: profile?.phone || data.user.user_metadata?.phone || '',
      is_approved: isApproved,
      role: resolvedRole,
      isLocal: false
    },
    session: data.session
  };
}

/**
 * AUTENTICAÇÃO: Logout (Sign Out)
 */
export async function signOutUser() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  }
  try {
    localStorage.removeItem(LOCAL_MOCK_AUTH_KEY);
    localStorage.removeItem(LOCAL_MOCK_PROFILES_KEY);
    localStorage.removeItem(LOCAL_MOCK_STORAGE_KEY);
  } catch (e) {}
  return true;
}

/**
 * ADMIN: Buscar todos os usuários cadastrados para autorização
 */
export async function fetchAllUsers() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        return data;
      }
    } catch (e) {
      console.warn('Consulta Supabase profiles falhou:', e);
    }
  }
  return [];
}

/**
 * ADMIN: Alternar aprovação do usuário (Autorizar / Bloquear)
 */
export async function toggleUserApproval(userId, isApproved) {
  const supabase = getSupabase();

  if (!supabase) {
    throw new Error('Supabase não está conectado. Verifique as credenciais.');
  }

  // Tenta update direto
  const { error } = await supabase
    .from('profiles')
    .update({ is_approved: isApproved })
    .eq('id', userId);

  if (error) {
    console.error('[toggleUserApproval] Erro no UPDATE:', JSON.stringify(error));
    
    // Fallback: tenta upsert caso o update tenha falhado por RLS
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({ id: userId, is_approved: isApproved }, { onConflict: 'id' });

    if (upsertError) {
      console.error('[toggleUserApproval] Erro no UPSERT fallback:', JSON.stringify(upsertError));
      throw upsertError;
    }
  }

  return true;
}

/**
 * Observador de mudanças no estado de autenticação
 */
export function onAuthStateChange(callback) {
  const supabase = getSupabase();
  if (supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        let profile = null;
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          profile = data;
        } catch (pe) {}

        callback({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name || session.user.email.split('@')[0],
          phone: profile?.phone || session.user.user_metadata?.phone || '',
          is_approved: profile?.is_approved !== undefined ? profile.is_approved : true,
          role: profile?.role || 'user',
          isLocal: false
        });
      } else {
        callback(null);
      }
    });
    return () => subscription?.unsubscribe();
  }
  return () => {};
}

/**
 * Upload de arquivo único com suporte a compressão e categorização automática
 */
export async function uploadSingleFile({
  file,
  user,
  folderName = null,
  onProgress = () => {},
  onStatusChange = () => {}
}) {
  const category = classifyFile(file);
  const originalSize = file.size;
  let fileToUpload = file;
  let isCompressed = false;

  const userId = user?.id || 'anonymous';

  // 1. Etapa de Compressão Automática
  if (needsCompression(file)) {
    onStatusChange({ step: 'compressing', message: 'Comprimindo vídeo (>50MB)...' });
    try {
      fileToUpload = await compressVideoClientSide(file, (p) => {
        onProgress(Math.round(p * 0.45));
      });
      isCompressed = true;
    } catch (err) {
      console.warn('Falha na compressão de vídeo:', err);
    }
  } else if (category === 'photos' && file.size > 3 * 1024 * 1024) {
    onStatusChange({ step: 'optimizing', message: 'Otimizando foto...' });
    fileToUpload = await optimizeImage(file);
    if (fileToUpload.size < originalSize) isCompressed = true;
  }

  const supabase = getSupabase();

  // MODO COM SUPABASE CONECTADO
  if (supabase && user && !user.isLocal) {
    onStatusChange({ step: 'uploading', message: 'Enviando para sua pasta privada no Supabase...' });
    
    const timestamp = Date.now();
    const cleanFileName = fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${userId}/${category}/${timestamp}_${cleanFileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cloudvault')
      .upload(storagePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erro no Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('cloudvault')
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData?.publicUrl || '';

    const mediaRecord = {
      user_id: userId,
      name: cleanFileName,
      original_name: file.name,
      category,
      mime_type: fileToUpload.type || file.type || 'application/octet-stream',
      size_bytes: fileToUpload.size,
      original_size_bytes: originalSize,
      storage_path: storagePath,
      file_url: publicUrl,
      compressed: isCompressed,
      folder_name: folderName || null,
      created_at: new Date().toISOString()
    };

    try {
      const { data: insertData, error: insertError } = await supabase
        .from('media_files')
        .insert([mediaRecord])
        .select()
        .single();

      if (insertError) {
        console.warn('Aviso ao inserir metadados:', insertError);
        return { id: timestamp.toString(), ...mediaRecord };
      }

      onProgress(100);
      onStatusChange({ step: 'done', message: 'Concluído com sucesso!' });
      return insertData || mediaRecord;
    } catch (dbErr) {
      return { id: timestamp.toString(), ...mediaRecord };
    }
  }

  // MODO DEMO / LOCALSTORAGE
  onStatusChange({ step: 'uploading', message: 'Salvando no armazenamento local...' });
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const mockRecord = {
        id: 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        user_id: userId,
        name: fileToUpload.name,
        original_name: file.name,
        category,
        mime_type: fileToUpload.type || file.type,
        size_bytes: fileToUpload.size,
        original_size_bytes: originalSize,
        storage_path: `local/${userId}/${category}/${fileToUpload.name}`,
        file_url: e.target.result,
        compressed: isCompressed,
        folder_name: folderName || null,
        created_at: new Date().toISOString(),
        isLocalDemo: true
      };

      const existing = getDemoFiles(userId);
      existing.unshift(mockRecord);
      saveDemoFiles(userId, existing);

      onProgress(100);
      onStatusChange({ step: 'done', message: 'Salvo em modo local!' });
      resolve(mockRecord);
    };
    reader.readAsDataURL(fileToUpload);
  });
}

/**
 * Busca os arquivos EXCLUSIVAMENTE do usuário conectado
 */
export async function fetchFiles({ category = 'all', searchQuery = '', user = null } = {}) {
  const supabase = getSupabase();
  const userId = user?.id || 'anonymous';

  if (supabase && user && !user.isLocal) {
    try {
      let query = supabase
        .from('media_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.ilike('original_name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data;
      }
      console.warn('Erro ao consultar tabela media_files:', error);
    } catch (e) {
      console.error('Erro na consulta Supabase:', e);
    }
  }

  let localFiles = getDemoFiles(userId);
  if (category && category !== 'all') {
    localFiles = localFiles.filter(f => f.category === category);
  }
  if (searchQuery) {
    localFiles = localFiles.filter(f => 
      f.original_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  return localFiles;
}

/**
 * Deleta um arquivo garantindo que pertença ao usuário
 */
export async function deleteFile(fileItem) {
  const supabase = getSupabase();

  if (supabase && !fileItem.isLocalDemo) {
    if (fileItem.storage_path) {
      await supabase.storage.from('cloudvault').remove([fileItem.storage_path]);
    }
    if (fileItem.id) {
      await supabase.from('media_files').delete().eq('id', fileItem.id);
    }
    return true;
  }

  const userId = fileItem.user_id || 'anonymous';
  let localFiles = getDemoFiles(userId);
  localFiles = localFiles.filter(f => f.id !== fileItem.id);
  saveDemoFiles(userId, localFiles);
  return true;
}

// Helpers de dados
function getDemoFiles(userId = 'anonymous') {
  try {
    const raw = localStorage.getItem(`${LOCAL_MOCK_STORAGE_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveDemoFiles(userId = 'anonymous', files = []) {
  try {
    localStorage.setItem(`${LOCAL_MOCK_STORAGE_KEY}_${userId}`, JSON.stringify(files));
  } catch (e) {
    console.error('Erro ao salvar demo:', e);
  }
}
