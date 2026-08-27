import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Loader2, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Cloud,
  CheckSquare,
  Square
} from 'lucide-react';
import { signInUser, signUpUser } from '../services/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, onSignUpSuccess, onOpenTerms, onOpenPrivacy }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, preencha o e-mail e a senha.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A senha deve ter no mínimo 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('As senhas digitadas não coincidem.');
        return;
      }
      if (!agreeTerms) {
        setErrorMsg('Você precisa aceitar os Termos de Uso e a Política de Privacidade (LGPD) para se cadastrar.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signUpUser({
          email: email.trim(),
          password: password.trim(),
          name: name.trim(),
          phone: phone.trim()
        });

        setLoading(false);
        if (onSignUpSuccess) {
          onSignUpSuccess({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim()
          });
        }
      } else {
        const res = await signInUser({
          email: email.trim(),
          password: password.trim()
        });

        setLoading(false);
        if (onAuthSuccess) {
          onAuthSuccess(res.user);
        }
        onClose();
      }
    } catch (err) {
      setLoading(false);
      console.error('Erro de autenticação:', err);
      let msg = err.message || 'Erro ao processar solicitação';
      if (msg.includes('Invalid login credentials')) {
        msg = 'E-mail ou senha incorretos.';
      } else if (msg.includes('User already registered')) {
        msg = 'Este e-mail já está cadastrado. Faça login.';
      }
      setErrorMsg(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white flex items-center justify-center shadow-glow-brand mb-2">
            <Cloud className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-extrabold text-white">
            {mode === 'login' ? 'Acessar CloudVault' : 'Criar Nova Conta'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'login' 
              ? 'Seus arquivos guardados com isolamento total e segurança' 
              : 'Cadastre-se para ter seu espaço individual e privado'}
          </p>

          {/* Abas Alternadoras */}
          <div className="flex p-1 rounded-2xl bg-slate-900 border border-slate-800 mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-4 h-4" /> Entrar
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMsg(''); }}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Criar Conta
            </button>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-3.5 flex-1">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp / Celular</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(17) 99999-9999"
                    className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Senha</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 pl-10 pr-10 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 text-xs text-slate-100 placeholder-slate-600 pl-10 pr-3.5 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Checkbox de Aceite LGPD & Termos */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="leading-snug text-[11px] text-slate-400">
                    Li e concordo com os{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenTerms(); }}
                      className="text-brand-400 underline hover:text-brand-300 font-semibold"
                    >
                      Termos de Uso
                    </button>{' '}
                    e a{' '}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onOpenPrivacy(); }}
                      className="text-emerald-400 underline hover:text-emerald-300 font-semibold"
                    >
                      Política de Privacidade (LGPD)
                    </button>.
                  </span>
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-500 hover:from-brand-500 hover:to-indigo-400 text-white text-xs font-extrabold shadow-glow-brand transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar na Minha Conta
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Criar Conta e Solicitar Acesso
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
