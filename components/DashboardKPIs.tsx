
import React from 'react';
import { Lead, Transaction } from '../types';
import { fmtBRL } from '../utils';
import { STATUSES } from '../constants';

interface DashboardKPIsProps {
  leads: Lead[];
  transactions: Transaction[];
  meta: number;
}

const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ leads, transactions, meta }) => {
  const ativados = leads.filter(l => l.status === 'ativado');
  const totalFaturado = ativados.reduce((acc, l) => acc + l.mensalidade, 0);
  const conversionRate = leads.length > 0 ? (ativados.length / leads.length) * 100 : 0;
  
  const progressPercent = Math.min((totalFaturado / meta) * 100, 100);

  const dist = STATUSES.map(s => ({
    label: s.label,
    count: leads.filter(l => l.status === s.id).length,
    color: s.id === 'novo' ? '#004595' : s.id === 'cotacao' ? '#f97316' : s.id === 'proposta' ? '#0ea5e9' : '#10b981'
  }));

  const maxCount = Math.max(...dist.map(d => d.count), 1);

  const channels: string[] = Array.from(new Set(leads.map(l => l.canal || 'Outros')));
  const channelData = channels.map(channel => {
    const count = leads.filter(l => l.canal === channel).length;
    return {
      name: channel,
      count,
      percent: leads.length > 0 ? (count / leads.length) * 100 : 0
    };
  }).sort((a, b) => b.count - a.count);

  const getChannelColor = (name: string) => {
    switch (name) {
      case 'Indicação': return 'bg-emerald-500';
      case 'Marketing Digital': return 'bg-unimax-blue';
      case 'Aqui Rede de Postos': return 'bg-amber-500';
      case 'Propostas Antigas': return 'bg-slate-400';
      case 'Google Search': return 'bg-indigo-500';
      default: return 'bg-slate-300';
    }
  };

  const radius = 36;
  const stroke = 8;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (conversionRate / 100) * circumference;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Meta Progressiva */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col justify-between min-h-[280px] shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-2xl bg-unimax-blue/10 flex items-center justify-center text-unimax-blue">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
             </div>
             <div>
               <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Progresso da Meta</h3>
               <p className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Performance Mensal UnimaxCRM</p>
             </div>
          </div>
          <div className="flex flex-col mb-6">
            <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none mb-2">{fmtBRL(totalFaturado)}</span>
            <div className="flex items-center gap-2">
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Objetivo: {fmtBRL(meta)}</span>
               <span className="w-1 h-1 rounded-full bg-slate-300"></span>
               <span className="text-[11px] font-black text-unimax-blue">{progressPercent.toFixed(1)}%</span>
            </div>
          </div>
          <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
            <div 
              className="h-full bg-gradient-to-r from-unimax-blue to-unimax-cyan transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            >
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-unimax-blue"></span>
             Restam {fmtBRL(Math.max(meta - totalFaturado, 0))} para meta
           </p>
           <span className="text-[11px] font-black text-unimax-emerald bg-unimax-emerald/10 px-3 py-1 rounded-xl">
             Pipeline Ativo
           </span>
        </div>
      </div>

      {/* Performance & Conversão */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col justify-between min-h-[280px] shadow-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-6">Conversão & Eficiência</h3>
        <div className="grid grid-cols-2 gap-8 flex-1 items-center">
          <div className="flex flex-col items-center justify-center border-r border-slate-100 h-full pr-4">
            <div className="relative w-32 h-32 flex items-center justify-center">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                  <circle 
                    cx="40" cy="40" r={radius} 
                    fill="none" 
                    stroke="var(--unimax-blue)" 
                    strokeWidth={stroke} 
                    strokeDasharray={circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round" 
                    className="transition-all duration-1000" 
                  />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-black text-unimax-blue leading-none">{Math.round(conversionRate)}%</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase mt-1">Taxa Conv.</span>
               </div>
            </div>
          </div>
          <div className="flex flex-col justify-center gap-6 pl-4">
            <div className="group">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none block mb-2 group-hover:text-unimax-blue transition-colors">Total de Leads</span>
              <p className="text-3xl font-black text-slate-800 leading-none">{leads.length}</p>
            </div>
            <div className="group">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none block mb-2 group-hover:text-unimax-blue transition-colors">Ticket Médio</span>
              <p className="text-xl font-black text-slate-700 leading-none">
                {fmtBRL(leads.length > 0 ? leads.reduce((a, b) => a + b.mensalidade, 0) / leads.length : 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fontes de Captação */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col min-h-[280px] shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Origem dos Leads</h3>
           <span className="text-[10px] font-black text-unimax-blue bg-unimax-blue/5 px-3 py-1 rounded-full uppercase">Top Canais</span>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
          {channelData.map((ch, i) => (
            <div key={i} className="space-y-2 group">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getChannelColor(ch.name)}`}></div>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight group-hover:text-unimax-blue transition-colors">{ch.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-400">{ch.count} <span className="ml-1 opacity-50">({Math.round(ch.percent)}%)</span></span>
              </div>
              <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${getChannelColor(ch.name)}`}
                  style={{ width: `${ch.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funil Estratégico */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 min-h-[280px] flex flex-col shadow-sm">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Fluxo do Funil UnimaxCRM</h3>
           <div className="flex gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-unimax-blue"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-unimax-cyan"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-unimax-emerald"></div>
           </div>
        </div>
        <div className="flex-1 flex justify-between items-end gap-6 pb-2 px-4">
          {dist.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
              <div 
                className="w-full rounded-2xl transition-all duration-500 hover:brightness-110 relative cursor-help hover:-translate-y-2"
                style={{ 
                  height: `${Math.max((d.count / maxCount) * 85, 10)}%`, 
                  backgroundColor: d.color,
                  opacity: d.count === 0 ? 0.2 : 1
                }}
              >
                 <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-10">
                   {d.count} leads
                 </div>
              </div>
              <div className="mt-4 text-center w-full">
                <span className="text-[9px] font-black text-slate-500 uppercase leading-none block truncate mb-1">
                  {d.label.split(' ')[0]}
                </span>
                <span className="text-xs font-black text-slate-800 leading-none">
                  {d.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardKPIs;
