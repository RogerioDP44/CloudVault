import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Lock, 
  CheckCircle2, 
  ExternalLink, 
  Info,
  Scale,
  Eye,
  Trash2,
  Download
} from 'lucide-react';

export default function LegalModal({ isOpen, onClose, initialTab = 'terms' }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab); // 'terms' | 'privacy'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Transparência & Proteção Legal</h2>
              <p className="text-xs text-slate-400">Termos de Uso e Política de Privacidade (LGPD)</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-brand-500 text-brand-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Termos de Uso
          </button>
          
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'privacy'
                ? 'border-emerald-500 text-emerald-400 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Política de Privacidade (LGPD)
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed flex-1">
          
          {/* TERMOS DE USO */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs">
                Última atualização: 27 de Agosto de 2026. Este documento rege o uso da plataforma <strong>CloudVault</strong> conforme o Marco Civil da Internet (Lei nº 12.965/14) e o Código de Defesa do Consumidor.
              </div>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  1. Objeto e Funcionamento do Serviço
                </h3>
                <p>
                  O CloudVault é um serviço web destinado ao armazenamento em nuvem, compressão automática de vídeos pesados e backup de mídias (fotos, vídeos e documentos), auxiliando na liberação de espaço de armazenamento de dispositivos móveis.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  2. Cadastro, Segurança e Autorização
                </h3>
                <p>
                  O acesso à plataforma requer cadastro prévio com e-mail, telefone (WhatsApp) e senha segura. A ativação da conta está sujeita à aprovação por parte do Administrador da plataforma para garantir a integridade do ambiente multi-usuário.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  3. Titularidade e Direitos sobre os Arquivos
                </h3>
                <p>
                  Você permanece como único e exclusivo proprietário de todos os direitos sobre as fotos, vídeos e arquivos enviados para sua conta. O CloudVault não reivindica direitos de propriedade sobre seus conteúdos pessoais e não os compartilha com terceiros.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  4. Conteúdos Proibidos e Conduta do Usuário
                </h3>
                <p>É expressamente proibido fazer upload de:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li>Arquivos que contenham vírus, malwares, códigos maliciosos ou scripts executáveis;</li>
                  <li>Materiais ilegais, pornografia infantil, incitação à violência ou discriminação;</li>
                  <li>Arquivos que violem direitos autorais, patentes ou segredos comerciais de terceiros.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  5. Limites e Isenção de Responsabilidade
                </h3>
                <p>
                  Embora utilizemos infraestrutura segura na nuvem (Supabase Storage com redundância), recomendamos que o usuário mantenha cópias de segurança de arquivos críticos e verifique a confirmação de upload antes de realizar a exclusão definitiva em seu celular.
                </p>
              </section>
            </div>
          )}

          {/* POLÍTICA DE PRIVACIDADE E LGPD */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                Em total conformidade com a <strong>Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)</strong>. Seus dados e mídias são privados e isolados por criptografia e Row Level Security (RLS).
              </div>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  1. Dados Pessoais Coletados
                </h3>
                <p>Coletamos apenas as informações estritamente necessárias para a prestação do serviço:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                  <li><strong>Dados de Identificação:</strong> Nome completo, endereço de e-mail e número de WhatsApp.</li>
                  <li><strong>Arquivos e Mídias:</strong> Fotos, vídeos e documentos enviados voluntariamente pelo titular.</li>
                  <li><strong>Metadados Técnicos:</strong> Tamanho dos arquivos, formato (MIME type) e data de envio.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  2. Finalidade e Base Legal do Tratamento (Art. 7º da LGPD)
                </h3>
                <p>
                  O tratamento dos dados tem como finalidade exclusiva o gerenciamento do backup em nuvem, a autenticação de segurança do usuário e a liberação de espaço do aparelho mediante o consentimento expresso do titular (Art. 7º, I) e a execução do contrato de serviço (Art. 7º, V).
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  3. Isolamento Total e Segurança das Mídias
                </h3>
                <p>
                  Adotamos medidas rigorosas de proteção, incluindo autenticação com tokens criptografados (JWT), políticas de segurança em nível de linha no banco de dados (Row Level Security - RLS) e diretórios isolados por identificador de usuário no Storage.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  4. Direitos do Titular de Dados (Art. 18 da LGPD)
                </h3>
                <p>Você tem o direito de, a qualquer momento e gratuitamente:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-slate-200">Acesso e Portabilidade:</strong> Visualizar e baixar todos os seus arquivos a qualquer hora.
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <strong className="text-slate-200">Eliminação Definitiva:</strong> Excluir seus arquivos e metadados com remoção instantânea na nuvem.
                  </div>
                </div>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  5. Contato do Encarregado de Dados (DPO)
                </h3>
                <p>
                  Para exercer seus direitos de titular ou tirar dúvidas sobre a privacidade dos seus dados, entre em contato com nosso Encarregado pelo WhatsApp <strong>(17) 99781-2145</strong>.
                </p>
              </section>
            </div>
          )}

        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Ambiente Seguro e Conforme LGPD</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all shadow-glow-brand"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
