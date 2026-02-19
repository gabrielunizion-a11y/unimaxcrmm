
import React, { useRef, useMemo } from 'react';
import { Lead, Profile } from '../types';
import { fmtBRL, fmtDateTimeBR } from '../utils';
import { COBERTURAS_ADICIONAIS, PLANOS } from '../constants';

interface ContractPageProps {
  lead: Lead;
  profile: Profile;
  onBack: () => void;
}

const TableHeader = ({ title }: { title: string }) => (
  <div className="bg-[#004595] text-white px-3 py-1 text-[11px] font-black uppercase tracking-widest mt-3 first:mt-0">
    {title}
  </div>
);

const Row = ({ children, last = false }: { children?: React.ReactNode; last?: boolean }) => (
  <div className={`flex border-x border-slate-300 ${last ? 'border-b' : 'border-b border-slate-200'}`}>
    {children}
  </div>
);

const Cell = ({ label, value, grow = 1, className = "" }: { label: string; value?: string | number; grow?: number; className?: string }) => (
  <div className={`p-1.5 border-r last:border-r-0 border-slate-200 flex-1 ${className}`} style={{ flexGrow: grow }}>
    <p className="text-[8px] font-bold text-slate-500 uppercase leading-none mb-1">{label}:</p>
    <p className="text-[10px] font-black text-slate-800 uppercase truncate leading-tight">{value || ''}</p>
  </div>
);

const ContractPage: React.FC<ContractPageProps> = ({ lead, profile, onBack }) => {
  const contractRef = useRef<HTMLDivElement>(null);

  const coverageLabel = useMemo(() => {
    const type = lead.tipoVeiculo || 'Carro/Utilitário';
    const variant = lead.variant || 1;

    if (type === 'Caminhão') {
      if (variant === 1) return 'Bronze (300Km / 30k)';
      if (variant === 2) return 'Prata (600Km / 50k)';
      if (variant === 3) return 'Ouro (600Km / 100k)';
    } else if (type === 'Carro/Utilitário' || type === 'Pickup Diesel') {
      if (variant === 1) return 'Standard (400Km / 30k)';
      if (variant === 2) return 'Premium (1000Km / 40k)';
    }
    return 'Padrão UnimaxCRM';
  }, [lead.tipoVeiculo, lead.variant]);

  const adicionaisDetalhe = useMemo(() => {
    const items = (lead.coberturasAdicionais || [])
      .map(id => COBERTURAS_ADICIONAIS.find(c => c.id === id))
      .filter(Boolean) as any[];
    const total = items.reduce((acc, it) => acc + (Number(it.preco) || 0), 0);
    return { items, total };
  }, [lead.coberturasAdicionais]);

  const resumoPlano = useMemo(() => {
    const variant = lead.variant || 1;
    const plano = (PLANOS as any)[variant] || (PLANOS as any)[1];
    const nome = plano?.nome || (variant === 1 ? "Bronze" : variant === 2 ? "Prata" : "Ouro");
    const cota = Number(plano?.cotaPct ?? (variant === 1 ? 5 : variant === 2 ? 7 : 8));
    const valorPlano = Math.max((lead.mensalidade || 0) - (adicionaisDetalhe.total || 0), 0);
    return { nome, cota, valorPlano };
  }, [lead.variant, lead.mensalidade, adicionaisDetalhe.total]);

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    // @ts-ignore
    const worker = html2pdf();
    const opt = {
      margin: 0,
      filename: `Termo_Adesao_UnimaxCRM_v2.0_${lead.nome.split(' ')[0]}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollY: 0, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await worker.set(opt).from(contractRef.current).save();
  };

  const valorProtegidoFinal = lead.valor + lead.valorImplemento;

  return (
    <div className="h-screen bg-slate-500 flex flex-col overflow-hidden">
      <nav className="shrink-0 bg-white border-b border-slate-300 px-6 py-3 flex items-center justify-between z-50 shadow-xl">
        <button onClick={onBack} className="text-[#004595] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 px-4 py-2 rounded-xl transition-all border border-slate-100 shrink-0">
          ← Sair do Termo
        </button>
        <button onClick={handleDownloadPDF} className="bg-[#004595] text-white px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">
          Baixar Termo PDF
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-slate-400/30 custom-scrollbar">
        <div 
          ref={contractRef} 
          className="w-[794px] min-w-[794px] bg-white shadow-2xl flex flex-col relative overflow-hidden text-slate-900"
          style={{ height: '1123px', padding: '40px 50px' }}
        >
          <div className="mb-6">
            <div className="w-full rounded-2xl overflow-hidden">
              <div className="bg-unimax-blue px-7 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src="/brand/logo-white.png" alt="Logo" className="h-14 w-auto object-contain" />
                  <div className="text-white/80 text-[10px] font-black uppercase tracking-[0.25em]">UnimaxCRM • Pro v2.0</div>
                </div>
                <div className="text-right">
                  <h2 className="text-[16px] font-black text-white uppercase tracking-widest">TERMO DE ADESÃO</h2>
                  <p className="text-[10px] text-white/80 mt-1 font-black italic">Protocolo: {lead.id.toUpperCase().slice(0, 8)}</p>
                </div>
              </div>
              <div className="h-4 bg-white" />
            </div>
          </div>

          <TableHeader title="DADOS DO ASSOCIADO" />
          <Row>
            <Cell label="Nome" value={lead.nome} grow={3} />
            <Cell label="Origem" value={lead.canal} />
          </Row>
          <Row last>
            <Cell label="Telefone" value={lead.fone} />
            <Cell label="Indicador" value={lead.associadoIndicador || '---'} grow={2} />
          </Row>

          <TableHeader title="DADOS DO VEÍCULO" />
          <Row>
            <Cell label="Marca" value={lead.marca} />
            <Cell label="Modelo" value={lead.modelo} grow={2} />
            <Cell label="Ano Mod" value={lead.anoModelo} />
          </Row>
          <Row>
            <Cell label="Placa" value={lead.placa} />
            <Cell label="Uso Profissional" value={lead.veiculoTrabalho ? 'Sim' : 'Não'} />
            <Cell label="Implemento" value={lead.tipoImplemento} />
          </Row>
          <Row last>
            <Cell label="Valor Protegido" value={fmtBRL(valorProtegidoFinal)} grow={2} />
            <Cell label="Status Vistoria" value={lead.vistoriaConcluida ? 'Concluída' : 'Pendente'} />
          </Row>

          <TableHeader title="RESUMO DO PLANO" />
          <div className="p-4 bg-slate-50 border-x border-b border-slate-300">
            <p className="text-[12px] font-black uppercase text-slate-800 italic">Plano: {resumoPlano.nome} ({resumoPlano.cota}%)  Valor do Plano: {fmtBRL(resumoPlano.valorPlano)}</p>
            <p className="text-[9px] font-black uppercase text-slate-700 mt-2">Produtos do plano:</p>
            <p className="text-[9px] font-semibold text-slate-700 leading-relaxed">ASSISTÊNCIA 24HORAS PRÓPRIA, REBOQUE PARA COLISÃO, REBOQUE PARA PANE MECÂNICA, ASSISTÊNCIA PARA PANE SECA, ASSISTÊNCIA TROCA DE PNEUS, S.O.S ELÉTRICO E MECÂNICO, ASSISTÊNCIA CHAVEIRO, AUXÍLIO HOSPEDAGEM EMERGENCIAL (voucher), AUXÍLIO TRANSPORTE EMERGENCIAL (voucher), CARRO RESERVA (mediante disponibilidade), ROUBO, FURTO, COLISÃO, FÊNOMENOS DA NATUREZA (após analise), INCÊNDIO (após análise), DANOS Á TERCEIROS (ATÉ R$ 30.000,00), PERCA TOTAL DO VEICULO.</p>

            <p className="text-[9px] font-black uppercase text-slate-700 mt-3">Coberturas Adicionais</p>
            {adicionaisDetalhe.items.length ? (
              <ul className="mt-1 space-y-0.5">
                {adicionaisDetalhe.items.map((it) => (
                  <li key={it.id} className="text-[9px] font-semibold text-slate-700">{it.label} *</li>
                ))}
              </ul>
            ) : (
              <p className="text-[9px] font-semibold text-slate-500 mt-1">Nenhuma</p>
            )}

            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase">Mensalidade:</p>
                <p className="text-[11px] font-black text-slate-800">{fmtBRL(lead.mensalidade)}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-slate-500 uppercase">Adesão:</p>
                <p className="text-[11px] font-black text-slate-800">{fmtBRL(lead.adesao)}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] text-slate-600 leading-relaxed text-justify">
             O associado acima identificado solicita através deste termo sua adesão ao programa de proteção automotiva UnimaxCRM. Declara estar ciente do regulamento vigente e da cota de participação em caso de eventos. O plano contratado segue o resumo acima.
          </div>

          <div className="mt-auto pt-20 flex flex-col items-center">
            <div className="w-full mb-8">
              <TableHeader title="ASSINATURA DIGITAL" />
              <Row>
                <Cell label="Status" value={lead.assinaturaConcluida ? 'Concluída' : 'Pendente'} grow={1} />
                <Cell label="Assinado por" value={lead.assinaturaResponsavel || (lead.assinaturaConcluida ? '---' : '')} grow={2} />
              </Row>
              <Row last>
                <Cell label="Método" value={lead.assinaturaMetodo || (lead.assinaturaConcluida ? '---' : '')} />
                <Cell label="Data/Hora" value={lead.assinaturaConcluida ? fmtDateTimeBR(lead.assinaturaConcluidaAt) : ''} grow={2} />
              </Row>
              {lead.assinaturaConcluida && (lead.assinaturaObservacao || '').trim() ? (
                <div className="border-x border-b border-slate-300 p-2 text-[9px] text-slate-600">
                  <span className="font-bold text-slate-500 uppercase">Observação:</span>{' '}
                  {(lead.assinaturaObservacao || '').trim()}
                </div>
              ) : null}
            </div>

            <div className="w-full flex justify-between gap-20 mb-10">
               <div className="flex-1 flex flex-col items-center">
                  <div className="w-full border-b border-slate-800 mb-2"></div>
                  <p className="text-[10px] font-black text-slate-900 uppercase">UnimaxCRM</p>
               </div>
               <div className="flex-1 flex flex-col items-center">
                  <div className="w-full border-b border-slate-800 mb-2"></div>
                  <p className="text-[10px] font-black text-slate-900 uppercase">Assinatura do Associado</p>
               </div>
            </div>
            <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
               Documento emitido digitalmente.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractPage;
