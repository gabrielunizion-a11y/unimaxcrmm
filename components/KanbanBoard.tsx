
import React from 'react';
import { Lead, CRMStatus } from '../types';
import { STATUSES } from '../constants';
import { fmtBRL } from '../utils';

interface KanbanBoardProps {
  leads: Lead[];
  onMoveLead: (id: string, status: CRMStatus) => void;
  onEditLead: (lead: Lead) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ leads, onMoveLead, onEditLead }) => {
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
    e.currentTarget.classList.add('opacity-40');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-40');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-slate-100/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-slate-100/50');
  };

  const handleDrop = (e: React.DragEvent, status: CRMStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-slate-100/50');
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) onMoveLead(leadId, status);
  };

  const getStatusColor = (status: CRMStatus) => {
    switch (status) {
      case 'novo': return 'bg-unimax-blue';
      case 'cotacao': return 'bg-orange-500';
      case 'proposta': return 'bg-unimax-cyan';
      case 'ativado': return 'bg-unimax-emerald';
      default: return 'bg-slate-500';
    }
  };

  const getPlanBadge = (lead: Lead) => {
    const isHeavy = lead.tipoVeiculo === 'Caminhão' || lead.tipoVeiculo === 'Carreta';
    if (isHeavy) {
      if (lead.variant === 1) return { label: 'BRONZE', color: 'bg-orange-100 text-orange-700' };
      if (lead.variant === 2) return { label: 'PRATA', color: 'bg-slate-100 text-slate-600' };
      return { label: 'OURO', color: 'bg-amber-100 text-amber-600' };
    }
    return lead.variant === 2 
      ? { label: 'PREMIUM', color: 'bg-indigo-100 text-indigo-700' }
      : { label: 'STANDARD', color: 'bg-blue-100 text-blue-700' };
  };

  return (
    <div className="w-full h-full flex flex-row gap-6 overflow-x-auto px-8 py-8 bg-[#f1f5f9] no-scrollbar">
      {STATUSES.map((status) => {
        const columnLeads = leads.filter(l => l.status === status.id);
        const columnTotal = columnLeads.reduce((acc, curr) => acc + curr.mensalidade, 0);
        const accentColor = getStatusColor(status.id);

        return (
          <div 
            key={status.id}
            className="flex flex-col w-[340px] shrink-0 h-full"
            onDrop={(e) => handleDrop(e, status.id)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="mb-6 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${accentColor}`}></div>
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {status.label}
                  </h3>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded ${accentColor} text-white`}>
                  {columnLeads.length}
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xs font-bold text-slate-400 italic">R$</span>
                <span className="text-2xl font-black text-slate-800 tracking-tighter">
                  {fmtBRL(columnTotal).replace('R$', '').trim()}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar pb-24">
              {columnLeads.map((lead) => {
                const plan = getPlanBadge(lead);
                return (
                  <div 
                    key={lead.id}
                    draggable={!lead.archived}
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onEditLead(lead)}
                    className="group bg-white p-5 rounded-2xl border border-[color:var(--unimax-border)] transition-all duration-200 cursor-grab active:cursor-grabbing active:scale-[0.98] shadow-sm relative overflow-hidden ui-card"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[90%]">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${plan.color}`}>
                          {plan.label}
                        </span>
                        <span className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                          {lead.tipoVeiculo === 'Caminhão' ? 'PESADO' : lead.tipoVeiculo === 'Moto' ? 'MOTO' : 'LEVE'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-[13px] font-black text-slate-800 tracking-tight leading-tight truncate">
                        {lead.nome}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-bold uppercase truncate tracking-tight mt-1">
                         {lead.veiculo}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{lead.placa}</span>
                       </div>
                       <span className="text-[13px] font-black text-unimax-blue">
                        {fmtBRL(lead.mensalidade)}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                       <span className="text-[7px] font-black uppercase text-slate-300">
                          {lead.canal || 'LEAD DIRETO'}
                       </span>
                       {lead.veiculoTrabalho && (
                         <span className="text-[7px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded transition-all uppercase">APP</span>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;
