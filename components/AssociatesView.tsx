import React, { useMemo, useState } from 'react';
import { Lead } from '../types';
import { fmtBRL } from '../utils';

type Situacao = 'ATIVO' | 'INADIMPLENTE' | 'INATIVO';

function getSituacao(l: Lead): Situacao {
  // Operacional para a v2.0: associado é o lead ativado.
  // Inadimplente: ativado, porém pagamento não concluído.
  // Inativo: arquivado ou não ativado (ex.: voltou para etapas anteriores, ou foi desativado).
  if (l.archived) return 'INATIVO';
  if (l.status === 'ativado') return l.pagamentoConcluido ? 'ATIVO' : 'INADIMPLENTE';
  return 'INATIVO';
}

function getValor(l: Lead): number {
  const v = (l.mensalidade ?? 0);
  return Number.isFinite(v) ? v : 0;
}

interface Props {
  leads: Lead[];
  onOpenLead?: (l: Lead) => void;
}

const AssociatesView: React.FC<Props> = ({ leads, onOpenLead }) => {
  const [filter, setFilter] = useState<'TODOS' | Situacao>('TODOS');

  const rows = useMemo(() => {
    const mapped = leads
      .map(l => ({
        id: l.id,
        nome: l.nome || '- ',
        placa: (l.placa || '').toUpperCase(),
        valor: getValor(l),
        situacao: getSituacao(l),
        lead: l,
      }))
      // Só faz sentido listar quem já virou associado em algum momento ou foi arquivado.
      // Mantém simples e não polui com leads que ainda são cotação/proposta.
      .filter(r => r.lead.status === 'ativado' || r.lead.archived);

    if (filter === 'TODOS') return mapped;
    return mapped.filter(r => r.situacao === filter);
  }, [leads, filter]);

  const counts = useMemo(() => {
    const all = leads.filter(l => l.status === 'ativado' || l.archived);
    const ativos = all.filter(l => getSituacao(l) === 'ATIVO').length;
    const inad = all.filter(l => getSituacao(l) === 'INADIMPLENTE').length;
    const inat = all.filter(l => getSituacao(l) === 'INATIVO').length;
    return { total: all.length, ativos, inad, inat };
  }, [leads]);

  const pill = (id: 'TODOS' | Situacao, label: string, count: number) => {
    const active = filter === id;
    return (
      <button
        onClick={() => setFilter(id)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors ${
          active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        {label} <span className={`${active ? 'text-cyan-300' : 'text-slate-400'} ml-1`}>{count}</span>
      </button>
    );
  };

  return (
    <div className="p-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-slate-900 font-black text-xl tracking-tight">Associados</h2>
            <p className="text-slate-500 text-xs font-bold">Lista operacional de associados por situação de pagamento.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {pill('TODOS', 'Todos', counts.total)}
            {pill('ATIVO', 'Ativos', counts.ativos)}
            {pill('INADIMPLENTE', 'Inadimplentes', counts.inad)}
            {pill('INATIVO', 'Inativos', counts.inat)}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-6 py-4 bg-slate-50 border-b border-slate-200">
            <div className="col-span-5 text-[10px] font-black uppercase tracking-widest text-slate-500">Nome Completo</div>
            <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Placa</div>
            <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Valor (R$)</div>
            <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Situação</div>
          </div>

          {rows.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-sm font-bold">Nenhum associado encontrado.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {rows.map(r => (
                <button
                  key={r.id}
                  onClick={() => onOpenLead?.(r.lead)}
                  className="w-full text-left grid grid-cols-12 gap-3 px-6 py-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="col-span-5">
                    <div className="text-slate-900 font-black text-sm truncate">{r.nome}</div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">{r.lead.veiculo || r.lead.modelo || ''}</div>
                  </div>
                  <div className="col-span-2 text-slate-700 font-black text-sm tracking-widest">{r.placa || '-'}</div>
                  <div className="col-span-3 text-slate-900 font-black text-sm">{fmtBRL(r.valor)}</div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      r.situacao === 'ATIVO'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : r.situacao === 'INADIMPLENTE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-100'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                    >
                      {r.situacao}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssociatesView;
