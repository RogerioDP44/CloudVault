import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check, X, ExternalLink } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'cloudvault_cookie_consent_v1';

export default function CookieBanner({ onOpenTerms, onOpenPrivacy }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Exibe após 1 segundo na primeira visita
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      preferences: true,
      analytics: true,
      date: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      preferences: false,
      analytics: false,
      date: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 max-w-xl mx-auto z-50 animate-slide-up">
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/95 border-2 border-brand-500/40 shadow-2xl backdrop-blur-xl space-y-3">
        
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-500/20 text-brand-400 border border-brand-500/30 shrink-0">
            <Cookie className="w-5 h-5 animate-pulse-subtle" />
          </div>
          
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>Privacidade & Cookies (LGPD)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-1 leading-relaxed">
              Utilizamos cookies e tecnologias seguras para garantir a integridade do seu backup, autenticação de sessão e proteção dos seus dados conforme a <strong>Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/18)</strong>.
            </p>
          </div>
        </div>

        {/* Links Legais */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pl-1">
          <button
            onClick={onOpenPrivacy}
            className="text-brand-400 hover:text-brand-300 underline font-semibold flex items-center gap-1"
          >
            Política de Privacidade <ExternalLink className="w-3 h-3" />
          </button>
          <span>•</span>
          <button
            onClick={onOpenTerms}
            className="text-brand-400 hover:text-brand-300 underline font-semibold flex items-center gap-1"
          >
            Termos de Uso <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={handleAcceptEssential}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors text-center"
          >
            Apenas Necessários
          </button>
          <button
            onClick={handleAcceptAll}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-extrabold shadow-glow-brand transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Aceitar Todos os Cookies
          </button>
        </div>

      </div>
    </div>
  );
}
