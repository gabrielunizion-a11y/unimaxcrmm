import React, { useMemo, useState } from 'react';
import { Lead, Profile } from '../types';

interface SignaturePageProps {
  lead: Lead;
  profile: Profile;
  onBack: () => void;
}

const SignaturePage: React.FC<SignaturePageProps> = ({ lead, profile, onBack }) => {
  const [nome, setNome] = useState(lead.nome || '');
  const [doc, setDoc] = useState((lead.documento || '').replace(/\D/g, ''));
  const codigo = useMemo(() => String(lead.id || '').slice(-6).toUpperCase() || 'UnimaxCRM', [lead.id]);

  const termoLink = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    // se veio via payload público, mantém o payload no link do termo
    const payload = params.get('payload');
    const leadId = params.get('leadId') || lead.id;
    const origin = window.location.origin;
    const base = `${origin}/?view=contract&leadId=${encodeURIComponent(leadId)}`;
    return payload ? `${base}&payload=${encodeURIComponent(payload)}` : base;
  }, [lead.id]);

  const phrase = useMemo(() => {
    const n = (nome || '').trim();
    const d = (doc || '').trim();
    return `ACEITO ${codigo} - ${n || 'NOME'} - CPF/CNPJ: ${d || '________'}`;
  }, [codigo, nome, doc]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado.');
    } catch {
      alert('Não foi possível copiar. Copie manualmente.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="text-xs font-black uppercase tracking-widest text-white/70 hover:text-white">
            Voltar
          </button>
          <div className="text-xs font-black uppercase tracking-widest text-cyan-300">Assinatura Digital</div>
        </div>

        <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-white.png" alt="UnimaxCRM" className="w-8 h-8 object-contain" />
            <div className="text-lg font-black tracking-tight">UnimaxCRM • Assinatura Digital</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v2.0</div>
          </div>
          <div className="mt-2 text-sm text-white/70">
            Leia o termo e confirme sua aceitação com a frase padronizada (auditável).
          </div>

          <div className="mt-6 rounded-2xl bg-black/20 border border-white/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Termo de Adesão</div>
            <div className="mt-2 text-sm break-all text-cyan-300 underline">
              <a href={termoLink} target="_blank" rel="noreferrer">{termoLink}</a>
            </div>
            <div className="mt-3">
              <button onClick={() => copy(termoLink)} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-black uppercase tracking-widest">
                Copiar link do termo
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Nome completo</div>
              <input value={nome} onChange={(e) => setNome(e.target.value)} className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" placeholder="Digite seu nome" />
            </div>
            <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">CPF/CNPJ</div>
              <input value={doc} onChange={(e) => setDoc(e.target.value.replace(/\D/g,''))} className="mt-2 w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none" placeholder="Somente números" />
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Frase de Aceite</div>
            <div className="mt-2 font-black text-sm break-words">{phrase}</div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => copy(phrase)} className="px-4 py-2 rounded-xl bg-cyan-500/80 hover:bg-cyan-500 text-[10px] font-black uppercase tracking-widest">
                Copiar frase
              </button>
            </div>
            <div className="mt-3 text-[11px] text-white/60">
              Envie essa frase para o consultor no mesmo canal em que recebeu o link (WhatsApp ou e-mail).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignaturePage;