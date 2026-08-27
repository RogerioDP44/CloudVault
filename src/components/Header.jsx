import React from 'react';
import { Cloud, Settings, Search, X, User, LogOut, LogIn, Sparkles, ShieldCheck } from 'lucide-react';
import { formatBytes } from '../utils/formatters';

export default function Header({
  isConfigured,
  onOpenConfig,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  pendingCount = 0,
  totalFiles = 0,
  totalSavedSpace = 0,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen
}) {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        
        {/* Logo e Título */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-glow-brand shrink-0">
            <Cloud className="w-5 h-5 animate-pulse-subtle" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0B0F19] rounded-full"></span>
          </div>
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">CloudVault</h1>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                isConfigured 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                {isConfigured ? 'Nuvem Ativa' : 'Modo Demo'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5 flex items-center gap-1.5">
              <span>{totalFiles} itens</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{formatBytes(totalSavedSpace)} salvos</span>
            </p>
          </div>
        </div>

        {/* Ações do Header */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Botão de Busca */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-2.5 rounded-xl transition-all ${
              isSearchOpen 
                ? 'bg-brand-500 text-white' 
                : 'text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800'
            }`}
            title="Buscar arquivos"
            aria-label="Buscar arquivos"
          >
            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
          </button>

          {/* Usuário / Login */}
          {currentUser ? (
            <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 rounded-xl p-1">
              <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-slate-200 font-semibold max-w-[110px] truncate">
                <div className="w-5 h-5 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                  <User className="w-3 h-3" />
                </div>
                <span className="truncate">{currentUser.name || currentUser.email}</span>
              </div>

              {/* Botão Admin com Alerta de Pendentes (Apenas para Administrador) */}
              {currentUser?.role === 'admin' && (
                <button
                  onClick={onOpenAdmin}
                  className="relative p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-colors"
                  title={pendingCount > 0 ? `${pendingCount} cadastro(s) pendente(s)` : 'Painel Admin (Autorizar Usuários)'}
                  aria-label="Painel Admin"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-slate-950 flex items-center justify-center animate-bounce">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                title="Sair da Conta"
                aria-label="Sair da Conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-glow-brand transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          )}

          {/* Configuração Supabase */}
          <button
            onClick={onOpenConfig}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 transition-colors"
            title="Configurar Supabase"
            aria-label="Configurar Supabase"
          >
            <Settings className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Barra de Busca Expansível */}
      {isSearchOpen && (
        <div className="max-w-6xl mx-auto mt-3 pt-2 border-t border-slate-800/60 animate-slide-up">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome do arquivo..."
              autoFocus
              className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 pl-10 pr-10 py-2.5 rounded-xl border border-slate-700/60 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
