import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Phone, 
  Mail, 
  Search, 
  RefreshCw, 
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { fetchAllUsers, toggleUserApproval } from '../services/supabase';
import { formatDate } from '../utils/formatters';

export default function AdminUsersModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleApproval = async (user) => {
    const newStatus = !user.is_approved;
    setUpdatingId(user.id);

    try {
      await toggleUserApproval(user.id, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_approved: newStatus } : u))
      );
      setToastMsg({
        type: 'success',
        text: `Usuário ${user.name} ${newStatus ? 'Autorizado com sucesso!' : 'Bloqueado com sucesso!'}`
      });
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      console.error('Erro ao alternar status:', err);
      setToastMsg({ type: 'error', text: 'Erro ao atualizar status do usuário' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Painel do Administrador</h2>
              <p className="text-xs text-slate-400">Autorizar e gerenciar contas de usuários</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadUsers}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email ou telefone..."
              className="w-full bg-slate-900 text-xs text-slate-100 placeholder-slate-500 pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMsg && (
          <div className={`p-2.5 text-xs text-center font-bold flex items-center justify-center gap-2 ${
            toastMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{toastMsg.text}</span>
          </div>
        )}

        {/* Lista de Usuários */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400" />
              <p className="text-xs">Carregando usuários...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhum usuário encontrado.
            </div>
          ) : (
            filtered.map((u) => {
              const isUpdating = updatingId === u.id;
              const isApproved = Boolean(u.is_approved);

              return (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white truncate">{u.name || 'Usuário'}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      }`}>
                        {isApproved ? '✓ Autorizado' : '✕ Bloqueado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" /> {u.email}
                      </span>
                      {u.phone && (
                        <a
                          href={`https://wa.me/${u.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-400 hover:underline font-semibold"
                        >
                          <Phone className="w-3 h-3" /> {u.phone}
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {u.phone && (
                      <a
                        href={`https://wa.me/${u.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${u.name}! Sua conta no CloudVault foi autorizada.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1 transition-colors"
                        title="Enviar mensagem no WhatsApp do usuário"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleToggleApproval(u)}
                      disabled={isUpdating}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow ${
                        isApproved
                          ? 'bg-slate-800 hover:bg-rose-950/80 text-rose-400 border border-slate-700 hover:border-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow-emerald'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isApproved ? (
                        <>
                          <UserX className="w-3.5 h-3.5" /> Bloquear
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" /> Autorizar Acesso
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
