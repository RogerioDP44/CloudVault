import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import FileCard from './components/FileCard';
import MediaViewer from './components/MediaViewer';
import UploadModal from './components/UploadModal';
import CleaningAssistant from './components/CleaningAssistant';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import AuthModal from './components/AuthModal';
import WhatsAppApprovalModal from './components/WhatsAppApprovalModal';
import AdminUsersModal from './components/AdminUsersModal';
import CookieBanner from './components/CookieBanner';
import LegalModal from './components/LegalModal';
import FolderBar from './components/FolderBar';
import { 
  fetchFiles, 
  deleteFile, 
  getSupabaseConfig,
  getCurrentUser,
  signOutUser,
  onAuthStateChange,
  fetchAllUsers
} from './services/supabase';
import { shareFile, downloadFile } from './utils/share';
import { 
  Image, 
  Video, 
  FileText, 
  UploadCloud, 
  RefreshCw, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Sparkles,
  Layers,
  Lock,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  MessageSquare,
  Users
} from 'lucide-react';
import { CATEGORY_DETAILS } from './utils/formatters';

export default function App() {
  const [activeTab, setActiveTab] = useState('photos');
  const [activeFolder, setActiveFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Autenticação de Usuários
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);

  // Termos e LGPD
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState('terms');

  // Modais
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);

  // Config do Supabase
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true);

  const showToast = (toastObj) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 3500);
  };

  const openLegalModal = (tab = 'terms') => {
    setLegalTab(tab);
    setIsLegalOpen(true);
  };

  // Carregar usuários pendentes de aprovação
  const checkPendingUsers = async () => {
    try {
      const all = await fetchAllUsers();
      const pendings = all.filter(u => u.is_approved === false);
      setPendingUsers(pendings);
    } catch (e) {
      console.warn('Erro ao verificar usuários pendentes:', e);
    }
  };

  // Inicialização de Usuário e Auth Listener
  useEffect(() => {
    const initAuth = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    initAuth();

    const unsubscribe = onAuthStateChange((user) => {
      setCurrentUser(user);
      checkPendingUsers();
    });

    checkPendingUsers();
    const interval = setInterval(checkPendingUsers, 6000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  // Carrega arquivos do usuário conectado
  const loadFiles = async () => {
    setLoading(true);
    try {
      const config = getSupabaseConfig();
      setIsSupabaseConfigured(Boolean(config.url && config.anonKey));

      if (currentUser && currentUser.is_approved === false) {
        setFiles([]);
        setLoading(false);
        return;
      }

      const data = await fetchFiles({
        category: 'all',
        searchQuery: searchQuery.trim(),
        user: currentUser
      });
      setFiles(data || []);
    } catch (err) {
      console.error('Erro ao carregar arquivos:', err);
      showToast({ type: 'error', message: 'Erro ao listar arquivos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [searchQuery, currentUser]);

  // Contadores por categoria
  const counts = useMemo(() => {
    return {
      photos: files.filter((f) => f.category === 'photos').length,
      videos: files.filter((f) => f.category === 'videos').length,
      documents: files.filter((f) => f.category === 'documents').length,
    };
  }, [files]);

  // Total economizado
  const totalSavedSpace = useMemo(() => {
    return files.reduce((acc, f) => {
      return acc + (f.original_size_bytes || f.size_bytes || 0);
    }, 0);
  }, [files]);

  // Pastas derivadas dos arquivos carregados
  const folders = useMemo(() => {
    const map = {};
    files.forEach(f => {
      if (f.folder_name) {
        map[f.folder_name] = (map[f.folder_name] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [files]);

  // Nomes das pastas para o UploadModal
  const folderNames = useMemo(() => folders.map(f => f.name), [folders]);

  // Arquivos filtrados pela aba ativa e pasta ativa
  const filteredFiles = useMemo(() => {
    if (activeTab === 'cleaning') return files;
    let result = files.filter((f) => f.category === activeTab);
    if (activeFolder !== null) {
      result = result.filter((f) => f.folder_name === activeFolder);
    }
    return result;
  }, [files, activeTab, activeFolder]);

  // Logout
  const handleLogout = async () => {
    await signOutUser();
    setCurrentUser(null);
    showToast({ type: 'info', message: 'Você saiu da sua conta.' });
  };

  // Callback de sucesso no cadastro -> Abre modal do WhatsApp!
  const handleSignUpSuccess = (userData) => {
    setIsAuthOpen(false);
    setRegisteredUser(userData);
    setIsWhatsAppOpen(true);
    showToast({ type: 'success', message: 'Cadastro enviado! Solicite a autorização no WhatsApp.' });
  };

  // Deletar arquivo
  const handleDelete = async (fileItem) => {
    try {
      await deleteFile(fileItem);
      setFiles((prev) => prev.filter((f) => f.id !== fileItem.id));
      showToast({ type: 'success', message: 'Arquivo excluído!' });
    } catch (err) {
      console.error(err);
      showToast({ type: 'error', message: 'Erro ao excluir arquivo' });
    }
  };

  // Compartilhar
  const handleShare = (fileItem) => {
    shareFile(fileItem, showToast);
  };

  // Baixar
  const handleDownload = (fileItem) => {
    downloadFile(fileItem, showToast);
  };

  // Callback de upload finalizado
  const handleUploadComplete = (newRecords) => {
    loadFiles();
    showToast({ type: 'success', message: 'Backup concluído com sucesso!' });
  };

  // Abrir upload
  const handleTriggerUpload = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      showToast({ type: 'info', message: 'Faça login para salvar seus arquivos.' });
      return;
    }
    if (currentUser.is_approved === false) {
      setIsWhatsAppOpen(true);
      setRegisteredUser(currentUser);
      showToast({ type: 'error', message: 'Sua conta ainda não foi autorizada pelo Administrador.' });
      return;
    }
    setIsUploadOpen(true);
  };

  const isUserBlocked = currentUser && currentUser.is_approved === false;
  const currentCategoryDetails = CATEGORY_DETAILS[activeTab] || CATEGORY_DETAILS.photos;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col antialiased">
      
      {/* Header Fixo no Topo */}
      <Header
        isConfigured={isSupabaseConfigured}
        onOpenConfig={() => setIsConfigOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        pendingCount={pendingUsers.length}
        totalFiles={files.length}
        totalSavedSpace={totalSavedSpace}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ALERTA DE CADASTROS PENDENTES PARA AUTORIZAÇÃO (Apenas para Administrador) */}
        {currentUser?.role === 'admin' && pendingUsers.length > 0 && !isUserBlocked && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/10 border-2 border-amber-500/50 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Users className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
                  <span>{pendingUsers.length} Cadastro(s) Aguardando Sua Autorização!</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                </h3>
                <p className="text-xs text-slate-300 truncate">
                  Pendente: <strong className="text-white">{pendingUsers.map(u => u.name || u.email).join(', ')}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-glow-amber transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Toque Aqui para Autorizar
            </button>
          </div>
        )}
        
        {/* BLOQUEIO DE CONTA PENDENTE DE APROVAÇÃO */}
        {isUserBlocked ? (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-950/80 via-slate-900 to-amber-950/60 border-2 border-rose-500/40 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Conta Bloqueada • Aguardando Autorização
                </h2>
                <p className="text-xs text-rose-300">
                  Olá, <strong className="text-white">{currentUser.name}</strong>! Seu cadastro foi recebido com sucesso.
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Por medidas de segurança, o acesso aos uploads e visualização de arquivos fica bloqueado até que o <strong>Administrador</strong> aprove sua conta no WhatsApp.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  setRegisteredUser(currentUser);
                  setIsWhatsAppOpen(true);
                }}
                className="py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-extrabold shadow-glow-emerald transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                Enviar Mensagem no WhatsApp para Liberar (17 99781-2145)
              </button>

              <button
                onClick={loadFiles}
                className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Já Fui Autorizado (Verificar)
              </button>
            </div>
          </div>
        ) : currentUser ? (
          /* Usuário Aprovado */
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="truncate">
                Conectado como <strong className="text-white">{currentUser.name || currentUser.email}</strong> • Seus dados estão 100% isolados.
              </p>
            </div>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setIsAdminOpen(true)}
                className="text-[11px] font-bold px-3 py-1 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/40 shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Users className="w-3 h-3" /> Gerenciar Usuários
              </button>
            )}
          </div>
        ) : (
          /* Deslogado */
          <div className="p-4 rounded-3xl bg-gradient-to-r from-brand-950/60 via-slate-900 to-indigo-950/60 border border-brand-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">Espaço Multi-Usuários com Isolamento Total</h2>
                <p className="text-[11px] text-slate-300">Crie sua conta ou faça login para que seus arquivos fiquem visíveis apenas para você.</p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shrink-0 shadow-glow-brand cursor-pointer"
            >
              Entrar ou Cadastrar
            </button>
          </div>
        )}

        {/* Seletor de Categorias / Abas Superior */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'photos', label: 'Fotos', count: counts.photos, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
            { id: 'videos', label: 'Vídeos', count: counts.videos, color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10' },
            { id: 'documents', label: 'Arquivos', count: counts.documents, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
            { id: 'cleaning', label: 'Assistente de Limpeza', count: null, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' }
          ].map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                id={`pill-${cat.id}`}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border cursor-pointer ${
                  isActive
                    ? `${cat.bg} ${cat.color} ${cat.border} shadow-sm`
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{cat.label}</span>
                {cat.count !== null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-slate-900/80 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Renderização Condicional da Aba Ativa */}
        {activeTab === 'cleaning' ? (
          <CleaningAssistant 
            files={files} 
            onOpenUpload={handleTriggerUpload} 
          />
        ) : (
          <section className="space-y-4">
            
            {/* Barra de Filtros e Título da Categoria */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span>{currentCategoryDetails.label}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                    {filteredFiles.length}
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadFiles}
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Atualizar lista"
                  aria-label="Atualizar lista"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Grid de Arquivos */}
            {!isUserBlocked && currentUser && (
              <FolderBar
                folders={folders}
                activeFolder={activeFolder}
                onSelectFolder={setActiveFolder}
                onCreateFolder={(name) => setActiveFolder(name)}
              />
            )}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-2xl bg-slate-900 border border-slate-800 h-44 skeleton-shimmer" />
                ))}
              </div>
            ) : isUserBlocked ? (
              <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-rose-500/20 space-y-3">
                <ShieldAlert className="w-12 h-12 mx-auto text-rose-400" />
                <h3 className="text-sm font-bold text-white">Acesso Bloqueado</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Aguarde a liberação do administrador no WhatsApp para começar a visualizar e subir arquivos.
                </p>
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    onView={setActiveMedia}
                    onDownload={handleDownload}
                    onShare={handleShare}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              /* Estado Vazio */
              <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/60 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400">
                  {activeTab === 'photos' && <Image className="w-8 h-8 text-emerald-400" />}
                  {activeTab === 'videos' && <Video className="w-8 h-8 text-rose-400" />}
                  {activeTab === 'documents' && <FileText className="w-8 h-8 text-blue-400" />}
                </div>
                <h3 className="text-sm font-bold text-slate-200">
                  Nenhum arquivo em {currentCategoryDetails.label}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {currentUser 
                    ? 'Faça backup do seu celular para salvar na sua conta privada.' 
                    : 'Faça login ou cadastre-se para começar a subir seus arquivos.'}
                </p>
                <button
                  onClick={handleTriggerUpload}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow-brand transition-all cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4" />
                  Enviar {currentCategoryDetails.label}
                </button>
              </div>
            )}

          </section>
        )}

        {/* Rodapé Legal com Links LGPD */}
        <footer className="pt-8 pb-4 text-center border-t border-slate-800/60 space-y-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
            <button
              onClick={() => openLegalModal('terms')}
              className="hover:text-brand-400 transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>
            <span>•</span>
            <button
              onClick={() => openLegalModal('privacy')}
              className="hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Política de Privacidade (LGPD)
            </button>
          </div>
          <p className="text-[11px] text-slate-600">
            CloudVault © 2026 • Backup Seguro e Privado em Conformidade com a LGPD (Lei nº 13.709/18)
          </p>
        </footer>

      </main>

      {/* Barra de Navegação Inferior Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={handleTriggerUpload}
        counts={counts}
      />

      {/* Modais */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentUser={currentUser}
        onUploadComplete={handleUploadComplete}
        onOpenCleaning={() => setActiveTab('cleaning')}
        onOpenAuth={() => setIsAuthOpen(true)}
        folders={folderNames}
        defaultFolder={activeFolder}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          showToast({ type: 'success', message: `Bem-vindo(a), ${user.name}!` });
        }}
        onSignUpSuccess={handleSignUpSuccess}
        onOpenTerms={() => openLegalModal('terms')}
        onOpenPrivacy={() => openLegalModal('privacy')}
      />

      <WhatsAppApprovalModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        registeredUser={registeredUser}
        onContinue={() => {
          setIsWhatsAppOpen(false);
          loadFiles();
        }}
      />

      <AdminUsersModal
        isOpen={isAdminOpen}
        onClose={() => {
          setIsAdminOpen(false);
          checkPendingUsers();
          loadFiles();
        }}
      />

      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        initialTab={legalTab}
      />

      <CookieBanner
        onOpenTerms={() => openLegalModal('terms')}
        onOpenPrivacy={() => openLegalModal('privacy')}
      />

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConfigSaved={loadFiles}
      />

      <MediaViewer
        file={activeMedia}
        onClose={() => setActiveMedia(null)}
        onDownload={handleDownload}
        onShare={handleShare}
        onDelete={handleDelete}
      />

      {/* Toast Notification Flutuante */}
      {toast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-slate-700 text-white text-xs font-bold shadow-2xl backdrop-blur-md animate-slide-up">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-brand-400" />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  );
}
