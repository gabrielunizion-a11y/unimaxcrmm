
import React from 'react';
import { Transaction } from '../types';
import { fmtBRL } from '../utils';

interface FinancialSidebarProps {
  saldo: number;
  comissao: number; // Agora ignorado em favor da adesão do lead
  transactions: Transaction[];
  onWithdraw: () => void;
}

const FinancialSidebar: React.FC<FinancialSidebarProps> = ({ 
  saldo, transactions, onWithdraw 
}) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-unimax-blue uppercase tracking-widest mb-1">Conta de Comissões</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Saldos e Transferências UnimaxCRM</p>
          </div>
          <button 
            onClick={onWithdraw}
            className="bg-unimax-emerald hover:brightness-110 text-white font-black px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-unimax-emerald/20"
          >
            SOLICITAR SAQUE PIX
          </button>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-1">Saldo Disponível</span>
            <span className="text-3xl font-black text-slate-800 tracking-tighter">{fmtBRL(saldo)}</span>
          </div>
          <div className="bg-unimax-blue/5 p-6 rounded-2xl border border-unimax-blue/10">
            <span className="text-[10px] text-unimax-blue font-black uppercase tracking-widest block mb-1">Comissão p/ Venda</span>
            <span className="text-3xl font-black text-unimax-blue tracking-tighter italic">100% Adesão</span>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Extrato Detalhado</h3>
            <span className="text-[9px] font-bold text-slate-300">Últimos 30 dias</span>
          </div>
          <div className="flex flex-col gap-3 min-h-[300px]">
            {transactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl p-12 opacity-40">
                <span className="text-4xl mb-3">🏦</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Nenhuma movimentação</span>
              </div>
            ) : (
              transactions.slice().reverse().map(tx => (
                <div key={tx.id} className="bg-white border border-slate-50 p-4 rounded-2xl flex justify-between items-center hover:bg-slate-50 hover:shadow-md hover:border-slate-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${tx.valor > 0 ? 'bg-unimax-emerald/10 text-unimax-emerald' : 'bg-rose-50 text-rose-600'}`}>
                      {tx.valor > 0 ? '+' : '-'}
                    </div>
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-tighter ${tx.valor > 0 ? 'text-unimax-emerald' : 'text-rose-600'}`}>
                        {tx.tipo}
                      </span>
                      <p className="text-xs font-bold text-slate-600 truncate max-w-[140px] md:max-w-none">{tx.desc}</p>
                      <p className="text-[9px] text-slate-400 font-medium uppercase">{new Date(tx.ts).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black block text-slate-800">{fmtBRL(Math.abs(tx.valor))}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                      tx.status === 'concluida' ? 'bg-unimax-emerald/10 text-unimax-emerald' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSidebar;
