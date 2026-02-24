
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Lead, Profile, TipoVeiculo } from '../types';
import { fmtBRL, fmtPct, calcMensalByPlano } from '../utils';
import { COBERTURAS_ADICIONAIS, PLANOS, PLANOS_LIST } from '../constants';

interface ProposalPageProps {
  lead: Lead;
  profile: Profile;
  onBack: () => void;
  onOpenContract: () => void;
  onUpdateLead: (lead: Partial<Lead>) => void;
}

const TableHeader: React.FC<{ title: string; color?: string; noMargin?: boolean }> = ({ title, color = "bg-unimax-blue", noMargin = false }) => (
  <div className={`${color} text-white px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${noMargin ? '' : 'mt-6'}`}>
    {title}
  </div>
);

const Row: React.FC<{ label: string; value: string | React.ReactNode; subLabel?: string; isBold?: boolean; isLast?: boolean; className?: string }> = ({ label, value, subLabel, isBold = false, isLast = false, className = "" }) => (
  <div className={`flex justify-between items-center px-5 py-3 border-x border-slate-200 ${isLast ? 'border-b' : 'border-b border-slate-100'} bg-white ${className}`}>
    <div className="flex flex-col max-w-[65%]">
      <span className="text-[9px] font-black text-slate-800 uppercase tracking-tight">{label}</span>
      {subLabel && <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{subLabel}</span>}
    </div>
    <span className={`text-[10px] uppercase text-right ${isBold ? 'font-black text-unimax-blue' : 'font-bold text-slate-700'}`}>
      {value || '---'}
    </span>
  </div>
);

const ProposalPage: React.FC<ProposalPageProps> = ({ lead, profile, onBack, onUpdateLead }) => {
  const proposalRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sincroniza cálculo local para UI reativa rápida
  const updateConfig = (updates: Partial<Lead>) => {
    const nextLead = { ...lead, ...updates };
    const novaMensal = calcMensalByPlano(
      (nextLead.valor || 0) + (nextLead.valorImplemento || 0),
      nextLead.tipoVeiculo as TipoVeiculo,
      nextLead.variant || 1,
      nextLead.coberturasAdicionais || [],
      nextLead.desconto || 0
    );
    onUpdateLead({ ...updates, mensalidade: novaMensal });
  };

  const planConfig = useMemo(() => {
    const variant = lead?.variant || 1;
    return (PLANOS as any)[variant] || (PLANOS as any)[1];
  }, [lead?.variant]);

  const selectedAdicionais = useMemo(() => {
    return (lead.coberturasAdicionais || []).map(id => {
      return COBERTURAS_ADICIONAIS.find(c => c.id === id);
    }).filter(Boolean);
  }, [lead.coberturasAdicionais]);

  const handleDownloadPDF = async () => {
    if (!proposalRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      // @ts-ignore
      const worker = html2pdf();
      const opt = {
        margin: 0,
        filename: `Proposta_UnimaxCRM_v2.0_${(lead?.nome || 'Lead').split(' ')[0]}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
      };
      await worker.set(opt).from(proposalRef.current).save();
    } catch (err) { 
      console.error(err); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const toggleAdicional = (id: string) => {
    const current = lead.coberturasAdicionais || [];
    const next = current.includes(id) 
      ? current.filter(x => x !== id)
      : [...current, id];
    updateConfig({ coberturasAdicionais: next });
  };

  return (
    <div className="h-screen bg-[#0f172a] flex flex-col overflow-hidden">
      {/* Barra de Topo */}
      <nav className="shrink-0 bg-[#0f172a] border-b border-white/5 px-8 py-5 flex items-center justify-between z-50">
        <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M15 19l-7-7 7-7"/></svg>
          Sair da Proposta
        </button>
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Live Editor v2.0</span>
           </div>
           <button onClick={handleDownloadPDF} disabled={isGenerating} className="px-8 py-3.5 bg-unimax-blue text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all">
             {isGenerating ? 'Processando...' : 'Exportar PDF'}
           </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Painel de Configuração Lateral */}
        <aside className="w-80 bg-[#1e293b] border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar shrink-0 p-8 space-y-10">
           <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">1. Nível de Proteção</label>
              <div className="flex flex-col gap-2">
                 {[
                   {v: 1, label: 'BRONZE'},
                   {v: 2, label: 'PRATA'},
                   {v: 3, label: 'OURO'}
                 ].map(p => (
                   <button 
                    key={p.v}
                    onClick={() => updateConfig({ variant: p.v })}
                    className={`w-full p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${lead.variant === p.v ? 'bg-unimax-blue text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                   >
                     {p.label}
                     {lead.variant === p.v && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>}
                   </button>
                 ))}
              </div>
           </div>

           <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">2. Opcionais Extras</label>
              <div className="space-y-2">
                 {COBERTURAS_ADICIONAIS.map(ad => (
                   <button 
                    key={ad.id}
                    onClick={() => toggleAdicional(ad.id)}
                    className={`w-full p-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${lead.coberturasAdicionais?.includes(ad.id) ? 'bg-cyan-500 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                   >
                     <div className="flex flex-col">
                        <span>{ad.label}</span>
                        <span className="opacity-60 text-[8px]">{fmtBRL(ad.preco)}/mês</span>
                     </div>
                     {lead.coberturasAdicionais?.includes(ad.id) && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>}
                   </button>
                 ))}
              </div>
           </div>

           <div>
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">3. Valores e Desconto</label>
              <div className="space-y-4">
                 <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Adesão (R$)</span>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-black outline-none focus:border-cyan-500 transition-all"
                      value={lead.adesao}
                      onChange={e => updateConfig({ adesao: Number(e.target.value) })}
                    />
                 </div>
                 <div>
                    <span className="text-[8px] font-bold text-slate-500 uppercase block mb-1">Desconto (%)</span>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm font-black outline-none focus:border-cyan-500 transition-all"
                      value={lead.desconto}
                      onChange={e => updateConfig({ desconto: Number(e.target.value) })}
                      max={100}
                    />
                 </div>
              </div>
           </div>
        </aside>

        {/* Live Preview do Documento */}
        <div className="flex-1 overflow-y-auto p-12 flex justify-center bg-[#0f172a] custom-scrollbar">
          <div ref={proposalRef} className="w-[794px] bg-white shadow-2xl flex flex-col p-[50px_70px] shrink-0 min-h-[1123px] text-slate-900 animate-in fade-in zoom-in-95 duration-500">
            
            <div className="flex justify-between items-start mb-8 pb-0 border-b-2 border-slate-100">
               <div className="w-full rounded-2xl overflow-hidden">
                 <div className="bg-unimax-blue px-8 py-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                     <img src="/brand/logo-white.png" alt="Logo" className="h-14 w-auto object-contain" />
                     <div className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em]">UnimaxCRM • Pro v2.0</div>
                   </div>
                   <div className="text-right">
                     <h2 className="text-[16px] font-black text-white uppercase tracking-widest">PROPOSTA COMERCIAL</h2>
                     <p className="text-[11px] text-white/80 font-black mt-1 italic">{`${planConfig.nome}`.toUpperCase()}</p>
                   </div>
                 </div>
                 <div className="h-4 bg-white" />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-10 mb-8">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Associado</p>
                <p className="text-[16px] font-black text-slate-800 uppercase leading-none">{lead.nome}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-2">Documento: <span className="text-slate-800">{lead.documento}</span></p>
                <p className="text-[10px] font-bold text-slate-500">Localidade: <span className="text-slate-800">{lead.cidade}/{lead.uf}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Protocolo UnimaxCRM</p>
                <p className="text-[14px] font-black text-unimax-blue uppercase">#{lead.id.toUpperCase().slice(0, 12)}</p>
                <p className="text-[10px] font-bold text-slate-500 mt-2">Data: <span className="text-slate-800">{new Date().toLocaleDateString('pt-BR')}</span></p>
              </div>
            </div>

            <TableHeader title="DADOS TÉCNICOS DO VEÍCULO" noMargin />
            <Row label="Marca / Modelo" value={lead.veiculo} isBold />            <Row label="Valor FIPE" value={fmtBRL(lead.valor)} isBold />
            {lead.valorImplemento > 0 && (
              <Row label={`Implemento: ${lead.tipoImplemento}`} value={fmtBRL(lead.valorImplemento)} />
            )}
            <Row label="Valor Total Protegido" value={fmtBRL(lead.valor + lead.valorImplemento)} isBold isLast />

            <TableHeader title="DETALHAMENTO DE COBERTURAS" />
            <Row label="DANOS POR COLISÃO" value="INCLUSO" isBold />
            <Row label="ROUBO E FURTO QUALIFICADO" value="INCLUSO" isBold />
            <Row label="FENÔMENOS DA NATUREZA" value="INCLUSO" />
            <Row label="DANOS A TERCEIROS" value={planConfig.terceiros} isBold />
            <Row label="COTA DE PARTICIPAÇÃO" value={fmtPct(planConfig.cotaPerc, 0)} isBold />
            <Row label="ASSISTÊNCIA 24 HORAS ESPECIALIZADA" value="INCLUSO" isBold />
            <Row label="REBOQUE PARA COLISÃO" value="INCLUSO" />
            <Row label="REBOQUE PARA PANE ELÉTRICA" value="INCLUSO" />
            <Row label="REBOQUE PARA PANE MECANICA" value="INCLUSO" />
            <Row label="ASSISTÊNCIA PARA PANE SECA" value="INCLUSO" />
            <Row label="ASSISTÊNCIA TROCA DE PNEUS" value="INCLUSO" />
            <Row label="S.O.S ELÉTRICO E MECÂNICO" value="INCLUSO" />
            <Row label="ASSISTÊNCIA CHAVEIRO" value="INCLUSO" />
            <Row label="AUXÍLIO HOSPEDAGEM EMERGENCIAL (voucher)" value="INCLUSO" />
            <Row label="AUXÍLIO TRANSPORTE EMERGENCIAL (voucher)" value="INCLUSO" />
            <Row label="COBERTURA DE VIDROS E LANTERNAS (em caso de colisão)" value="INCLUSO" />
            <Row label="CARRO RESERVA (PROMOCIONAL)" subLabel="(mediante disponibilidade)" value="INCLUSO" isLast />

            <TableHeader title="OPCIONAIS E ADICIONAIS" />
            {selectedAdicionais.length > 0 ? (
              selectedAdicionais.map((ad, idx) => (
                <Row 
                  key={ad?.id} 
                  label={ad?.label || ''} 
                  subLabel="Benefício extra selecionado para este perfil." 
                  value={fmtBRL(ad?.preco || 0)}
                  isLast={idx === selectedAdicionais.length - 1}
                />
              ))
            ) : (
              <Row label="Nenhum opcional selecionado" value="-" isLast />
            )
            }

            <TableHeader title="CONDIÇÕES FINANCEIRAS" />
            <div className="grid grid-cols-2 gap-8 mt-6">
               <div className="p-6 bg-unimax-blue/5 border border-unimax-blue/10 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Investimento Mensal</span>
                  <p className="text-4xl font-black text-unimax-blue italic tracking-tighter">{fmtBRL(lead?.mensalidade || 0)}</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase italic">Pós-pago via Boleto ou PIX</p>
               </div>
               <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase block mb-1 tracking-widest">Taxa de Adesão</span>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{fmtBRL(lead?.adesao || 0)}</p>
                  <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase italic">Vistoria Digital UnimaxCRM Inclusa</p>
               </div>
            </div>

            <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-end">
               <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-slate-900 uppercase italic">UNIMAX PROTEÇÃO NACIONAL</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest italic">Documento Válido por 07 dias • Gerado via UnimaxCRM Pro v2.0</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black text-slate-800 uppercase leading-none">{profile.nome}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Consultor Autorizado</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalPage;
