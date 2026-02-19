
import React from 'react';
import { Lead } from '../types';
import { fmtBRL } from '../utils';

interface InspectionCenterViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onViewReport: (lead: Lead) => void;
  onReleaseInspection: (lead: Lead) => void;
}

const InspectionCenterView: React.FC<InspectionCenterViewProps> = ({ leads, onEditLead, onViewReport, onReleaseInspection }) => {
  // Central de Vistorias: exibe apenas negociações em etapa de vistoria.
  // No modelo atual, isso corresponde aos leads com status "proposta".
  const inspectionLeads = leads.filter(l => (l.archived ?? false) === false && (l.status === 'proposta' || l.status === 'ativado'));
  // Regra v2.0: laudos devem permanecer visíveis após a venda (status ativado).
  
  const pending = inspectionLeads.filter(l => l.status === 'proposta' && !l.vistoriaLiberada);
  const inProgress = inspectionLeads.filter(l => l.status === 'proposta' && l.vistoriaLiberada && !l.vistoriaConcluida);
  const finished = inspectionLeads.filter(l => l.vistoriaConcluida);

  const Card: React.FC<{ lead: Lead, status: 'pending' | 'progress' | 'done' }> = ({ lead, status }) => (
    <div 
      onClick={() => onEditLead(lead)}
      className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-unimax-blue transition-all cursor-pointer group shadow-sm hover:shadow-xl"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="min-w-0">
          <h4 className="text-[14px] font-black text-slate-800 uppercase truncate">{lead.nome || 'Lead sem nome'}</h4>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{lead.veiculo || 'Veículo não cadastrado'} • {lead.placa || 'Sem Placa'}</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${status === 'pending' ? 'bg-slate-300' : status === 'progress' ? 'bg-orange-500 animate-pulse' : 'bg-unimax-emerald'}`}></div>
      </div>
      
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
        <div className="flex flex-col">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Adesão</span>
          <span className="text-[12px] font-black text-unimax-blue">{fmtBRL(lead.adesao || 0)}</span>
        </div>
        
        {status === 'pending' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onReleaseInspection(lead); }}
            className="bg-unimax-blue text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
          >
            Liberar Órbis
          </button>
        ) : status === 'done' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onViewReport(lead); }}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-unimax-blue transition-all"
          >
            Ver Laudo
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest italic">Aguardando Fotos</span>
            <div className="flex gap-1">
               <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
               <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
               <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-12 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Aguardando ({pending.length})</h3>
          </div>
          <div className="space-y-4">
            {pending.map(l => <Card key={l.id} lead={l} status="pending" />)}
            {pending.length === 0 && <p className="text-center py-20 text-[10px] text-slate-300 font-black uppercase tracking-widest border border-dashed rounded-3xl">Limpo</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Em Aberto ({inProgress.length})</h3>
          </div>
          <div className="space-y-4">
            {inProgress.map(l => <Card key={l.id} lead={l} status="progress" />)}
            {inProgress.length === 0 && <p className="text-center py-20 text-[10px] text-slate-300 font-black uppercase tracking-widest border border-dashed rounded-3xl">Vazio</p>}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-xl bg-unimax-emerald/10 flex items-center justify-center text-unimax-emerald">
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-unimax-emerald">Laudos v2.0 ({finished.length})</h3>
          </div>
          <div className="space-y-4">
            {finished.map(l => <Card key={l.id} lead={l} status="done" />)}
            {finished.length === 0 && <p className="text-center py-20 text-[10px] text-slate-300 font-black uppercase tracking-widest border border-dashed rounded-3xl">Sem dados</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionCenterView;
