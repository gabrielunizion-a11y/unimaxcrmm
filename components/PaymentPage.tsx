import React, { useMemo } from 'react';
import { Lead, Profile } from '../types';
import { fmtBRL } from '../utils';

interface PaymentPageProps {
  lead: Lead;
  profile: Profile;
  onBack: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ lead, profile, onBack }) => {
  const pixKey = (lead as any).__pix ? String((lead as any).__pix) : (profile.pix || '');
  const amount = useMemo(() => fmtBRL(lead.mensalidade || 0), [lead.mensalidade]);

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copiado.`);
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
          <div className="text-xs font-black uppercase tracking-widest text-cyan-300">Pagamento</div>
        </div>

        <div className="mt-8 rounded-3xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-center gap-3">
            <img src="/brand/logo-white.png" alt="UnimaxCRM" className="w-8 h-8 object-contain" />
            <div className="text-lg font-black tracking-tight">UnimaxCRM • Pagamento</div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v2.0</div>
          </div>
          <div className="mt-2 text-white/70 text-sm">
            {lead.nome ? <span className="font-bold text-white">{lead.nome}</span> : null}
            {lead.veiculo ? <span> • {lead.veiculo}</span> : null}
            {lead.placa ? <span> • Placa {lead.placa}</span> : null}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Valor</div>
              <div className="mt-2 text-3xl font-black tracking-tighter">{amount}</div>
              <div className="mt-2 text-[11px] text-white/60">Referente à mensalidade do plano selecionado.</div>
            </div>

            <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-white/60">PIX (chave)</div>
              <div className="mt-2 text-sm font-bold break-all">{pixKey || 'Chave PIX não configurada'}</div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => copy(pixKey, 'Chave PIX')}
                  disabled={!pixKey}
                  className="px-4 py-2 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 disabled:opacity-40 text-[10px] font-black uppercase tracking-widest"
                >
                  Copiar PIX
                </button>
                <button
                  onClick={() => copy(String(lead.mensalidade || 0), 'Valor')}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[10px] font-black uppercase tracking-widest"
                >
                  Copiar valor
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/60">Confirmação</div>
            <div className="mt-2 text-sm text-white/80">
              Após o pagamento, envie o comprovante para seu consultor para liberar as próximas etapas (vistoria e assinatura).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;