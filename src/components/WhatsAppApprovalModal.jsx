import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  ShieldCheck, 
  CheckCircle2, 
  Phone, 
  User, 
  Mail, 
  ExternalLink,
  Copy,
  Check,
  Smartphone
} from 'lucide-react';

const DEFAULT_ADMIN_WHATSAPP = '5517997812145'; // WhatsApp do Administrador configurado

export default function WhatsAppApprovalModal({ isOpen, onClose, registeredUser, onContinue }) {
  if (!isOpen) return null;

  const [adminPhone, setAdminPhone] = useState(DEFAULT_ADMIN_WHATSAPP);
  const [copied, setCopied] = useState(false);

  const userName = registeredUser?.name || 'Novo Usuário';
  const userEmail = registeredUser?.email || '';
  const userPhone = registeredUser?.phone || '';

  // Mensagem padronizada pronta para o WhatsApp
  const rawMessage = `👋 Olá Admin! Acabei de me cadastrar no CloudVault para salvar meus arquivos na nuvem.

👤 Nome: ${userName}
📧 E-mail: ${userEmail}
📱 WhatsApp: ${userPhone}

👉 Poderia autorizar o acesso à minha conta, por favor?`;

  const encodedMessage = encodeURIComponent(rawMessage);
  const whatsappUrl = `https://wa.me/${adminPhone.replace(/\D/g, '')}?text=${encodedMessage}`;

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(rawMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-emerald-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Autorização de Conta</h2>
              <p className="text-xs text-emerald-400 font-semibold">Cadastro realizado com sucesso!</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Seus Dados de Cadastro:
            </h3>

            <div className="grid grid-cols-1 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Nome:</span>
                <strong className="text-white">{userName}</strong>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">E-mail:</span>
                <strong className="text-white">{userEmail}</strong>
              </div>
              {userPhone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-400">WhatsApp:</span>
                  <strong className="text-white">{userPhone}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Instruções */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200">
              📲 Envie uma mensagem para o Administrador liberar seu acesso:
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clique no botão verde abaixo para abrir o WhatsApp com a mensagem de autorização já preenchida.
            </p>
          </div>

          {/* Prévia da Mensagem */}
          <div className="relative">
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line font-mono leading-relaxed">
              {rawMessage}
            </div>
            <button
              onClick={handleCopyMessage}
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors border border-slate-700"
              title="Copiar texto da mensagem"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>

          {/* Ajuste de Número do Admin se necessário */}
          <div className="pt-2">
            <label className="block text-[11px] text-slate-400 mb-1">
              WhatsApp do Administrador (DDD + Número):
            </label>
            <input
              type="text"
              value={adminPhone}
              onChange={(e) => setAdminPhone(e.target.value)}
              placeholder="5511999999999"
              className="w-full bg-slate-950 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

        </div>

        {/* Rodapé com Botão WhatsApp */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => {
              onClose();
              if (onContinue) onContinue();
            }}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors order-2 sm:order-1"
          >
            Entrar no App
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-extrabold shadow-glow-emerald transition-all flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Enviar Mensagem no WhatsApp
          </button>
        </div>

      </div>
    </div>
  );
}
