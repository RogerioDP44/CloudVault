import React, { useState, useRef } from 'react';
import { Folder, FolderOpen, Plus, Calendar, Check, X } from 'lucide-react';

export default function FolderBar({ folders = [], activeFolder, onSelectFolder, onCreateFolder }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const inputRef = useRef(null);

  const todayLabel = new Date()
    .toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase());

  const handleConfirm = () => {
    const name = newName.trim();
    if (!name) return;
    onCreateFolder(name);
    setNewName('');
    setIsCreating(false);
  };

  const handleCancel = () => {
    setNewName('');
    setIsCreating(false);
  };

  const startCreating = () => {
    setIsCreating(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="space-y-2">
      {/* Chips de pastas */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">

        {/* Chip "Todas" */}
        <button
          onClick={() => onSelectFolder(null)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
            activeFolder === null
              ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
              : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" /> Todas
        </button>

        {/* Chips das pastas existentes */}
        {folders.map((folder) => (
          <button
            key={folder.name}
            onClick={() => onSelectFolder(folder.name)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border cursor-pointer ${
              activeFolder === folder.name
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <Folder className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[120px]">{folder.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800/80 text-slate-500 shrink-0">
              {folder.count}
            </span>
          </button>
        ))}

        {/* Botão Nova Pasta */}
        <button
          onClick={startCreating}
          className="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 border border-dashed border-slate-700 text-slate-500 hover:text-brand-400 hover:border-brand-500/50 hover:bg-brand-500/5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Nova Pasta
        </button>
      </div>

      {/* Formulário inline de criação */}
      {isCreating && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-900 border border-brand-500/30 animate-fade-in">
          <Folder className="w-4 h-4 text-brand-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleConfirm();
              if (e.key === 'Escape') handleCancel();
            }}
            placeholder="Nome da pasta... (ex: Viagem SP, RG e CPF)"
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none min-w-0"
          />
          {/* Sugestão: mês atual */}
          <button
            type="button"
            onClick={() => setNewName(todayLabel)}
            title={`Usar: ${todayLabel}`}
            className="p-1 rounded-lg text-slate-500 hover:text-brand-400 transition-colors shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
          </button>
          {/* Confirmar */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!newName.trim()}
            className="p-1 rounded-lg text-emerald-400 hover:text-emerald-300 disabled:opacity-30 transition-colors shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          {/* Cancelar */}
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 rounded-lg text-slate-500 hover:text-rose-400 transition-colors shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
