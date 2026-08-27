import React from 'react';
import { Image, Video, FileText, Sparkles, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenUpload, counts = {} }) {
  const navItems = [
    {
      id: 'photos',
      label: 'Fotos',
      icon: Image,
      count: counts.photos || 0,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15'
    },
    {
      id: 'videos',
      label: 'Vídeos',
      icon: Video,
      count: counts.videos || 0,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/15'
    },
    {
      id: 'documents',
      label: 'Arquivos',
      icon: FileText,
      count: counts.documents || 0,
      color: 'text-blue-400',
      activeBg: 'bg-blue-500/15'
    },
    {
      id: 'cleaning',
      label: 'Limpeza',
      icon: Sparkles,
      count: null,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 border-t border-slate-800">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        
        {/* Primeiras 2 Tabs */}
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              data-testid={`tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl cursor-pointer transition-all ${
                isActive ? `${item.color} ${item.activeBg} font-semibold` : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative pointer-events-none">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 pointer-events-none">{item.label}</span>
            </button>
          );
        })}

        {/* Botão Central de Upload (FAB) */}
        <div className="flex-1 flex justify-center px-1">
          <button
            id="btn-fab-upload"
            data-testid="btn-fab-upload"
            onClick={onOpenUpload}
            className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-brand-400 text-white flex items-center justify-center shadow-glow-brand hover:scale-105 active:scale-95 transition-all border-2 border-[#0B0F19] cursor-pointer"
            title="Fazer Upload de Arquivos"
            aria-label="Fazer Upload de Arquivos"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Últimas 2 Tabs */}
        {navItems.slice(2, 4).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-${item.id}`}
              data-testid={`tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-2xl cursor-pointer transition-all ${
                isActive ? `${item.color} ${item.activeBg} font-semibold` : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative pointer-events-none">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {item.count > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 pointer-events-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
