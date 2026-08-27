import React, { useState } from 'react';
import { 
  X, 
  Database, 
  Key, 
  Link, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Loader2, 
  ExternalLink,
  Code2,
  Sparkles
} from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig, testSupabaseConnection } from '../services/supabase';

const SQL_SETUP_SNIPPET = `-- Execute no SQL Editor do Supabase (https://supabase.com/dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES ('cloudvault', 'cloudvault', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Acesso Publico Storage" ON storage.objects FOR ALL USING (bucket_id = 'cloudvault') WITH CHECK (bucket_id = 'cloudvault');

CREATE TABLE IF NOT EXISTS public.media_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    category TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    original_size_bytes BIGINT,
    storage_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    compressed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.media_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir Tudo Media" ON public.media_files FOR ALL USING (true) WITH CHECK (true);`;

export default function SupabaseConfigModal({ isOpen, onClose, onConfigSaved }) {
  if (!isOpen) return null;

  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [showSql, setShowSql] = useState(false);

  const handleTest = async () => {
    if (!url || !anonKey) {
      setTestResult({ success: false, message: 'Preencha a URL e a Anon Key do Supabase' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    setTestResult(res);
  };

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      alert('Por favor, informe a URL e a Chave Anon.');
      return;
    }

    saveSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim()
    });

    if (onConfigSaved) onConfigSaved();
    onClose();
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SETUP_SNIPPET);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleClearConfig = () => {
    saveSupabaseConfig({ url: '', anonKey: '' });
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    if (onConfigSaved) onConfigSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Configurar Supabase</h2>
              <p className="text-xs text-slate-400">Conecte sua conta do Supabase para guardar os arquivos</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Link className="w-3.5 h-3.5 text-brand-400" />
              Project URL do Supabase
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://sua-empresa.supabase.co"
              className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 px-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-400" />
              Anon (Public) Key do Supabase
            </label>
            <textarea
              rows={3}
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 font-mono resize-none"
            />
          </div>

          {/* Resultado do Teste */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
              testResult.success 
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message || testResult.error}</span>
            </div>
          )}

          {/* Seção SQL Setup */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowSql(!showSql)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white py-1"
            >
              <span className="flex items-center gap-1.5 text-brand-400">
                <Code2 className="w-4 h-4" /> Script SQL para o Supabase (Bucket + Tabela)
              </span>
              <span className="text-[11px] text-slate-500">{showSql ? 'Ocultar' : 'Ver Script'}</span>
            </button>

            {showSql && (
              <div className="mt-2 space-y-2 animate-fadeIn">
                <div className="relative">
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono overflow-x-auto max-h-36">
                    {SQL_SETUP_SNIPPET}
                  </pre>
                  <button
                    onClick={handleCopySql}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-200 flex items-center gap-1 transition-colors border border-slate-700"
                  >
                    {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedSql ? 'Copiado!' : 'Copiar SQL'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Cole este código no menu <strong>SQL Editor</strong> do painel do seu Supabase para criar o bucket <code className="text-brand-300">cloudvault</code> e a tabela automaticamente.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Rodapé com Ações */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
          {url && (
            <button
              onClick={handleClearConfig}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              Desconectar
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleTest}
              disabled={isTesting || !url || !anonKey}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              Testar Conexão
            </button>

            <button
              onClick={handleSave}
              disabled={!url || !anonKey}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors shadow-glow-brand disabled:opacity-50"
            >
              Salvar e Conectar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
