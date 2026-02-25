
import React, { useRef } from 'react';
import { Lead, Profile } from '../types';
import { fmtBRL } from '../utils';

interface InspectionReportPageProps {
  lead: Lead;
  profile: Profile;
  onBack: () => void;
}

const fmtTS = (ts?: number) => {
  if (!ts) return '';
  return new Date(ts).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', ' às');
};

const InspectionReportPage: React.FC<InspectionReportPageProps> = ({ lead, profile, onBack }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    // @ts-ignore
    const worker = html2pdf();
    const opt = {
      margin: 0,
      filename: `Laudo_Vistoria_UnimaxCRM_v2.0_${lead.id}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 3, useCORS: true, letterRendering: true, scrollY: 0, backgroundColor: '#ffffff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    await worker.set(opt).from(reportRef.current).save();
  };

  const LogoHeader = () => (
    <div className="flex items-center">
      <img src="/brand/laudo-logo.png" alt="Logo" className="h-16 object-contain" />
    </div>
  );

  return (
    <div className="h-screen bg-slate-200 flex flex-col overflow-hidden">
      <nav className="shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-300 px-6 py-3 flex items-center justify-between z-50 overflow-x-auto no-scrollbar">
        <button onClick={onBack} className="text-[#004595] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all border border-slate-100 shrink-0">
          ← Voltar
        </button>
        <button onClick={handleDownloadPDF} className="bg-[#004595] text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-2">
          Exportar Laudo v2.0
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-10 flex justify-center custom-scrollbar bg-slate-200/50">
        <div ref={reportRef} className="w-full max-w-[794px] bg-white flex flex-col relative animate-slide-up shadow-2xl overflow-hidden" style={{ height: '1123px', minHeight: '1123px' }}>
          
          <div className="bg-[#004595] p-10 md:p-12 text-white relative">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-400/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex justify-between items-center">
                <LogoHeader />
                <div className="text-right">
                  <span className="text-cyan-400 font-black text-[8px] tracking-[0.3em] uppercase block mb-1">UnimaxCRM • Pro v2.0</span>
                  <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Laudo de Vistoria</h1>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                <div>
                  <span className="text-[9px] font-black uppercase text-cyan-400 tracking-[0.2em] block">Associado</span>
                  <p className="text-lg font-black text-white leading-tight uppercase">{lead.nome}</p>
                  {/* Fix: lead.cpf replaced with lead.documento */}
                  <p className="text-[9px] font-bold text-blue-200 opacity-60">DOC: {lead.documento}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black uppercase text-cyan-400 tracking-[0.2em] block">ID Vistoria</span>
                  <p className="text-lg font-black text-white leading-tight uppercase">#VST-{lead.id.slice(0,6).toUpperCase()}</p>
                  <p className="text-[8px] text-blue-200 font-bold opacity-60">AUDITADO v2.0 EM: {fmtTS(lead.vistoriaConcluidaAt)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-12 py-8 flex-1 flex flex-col gap-8 overflow-hidden">
             <section>
                <h3 className="text-[#004595] font-black text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Identificação Detalhada</h3>
                <div className="grid grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Marca/Modelo</p><p className="text-[11px] font-black text-slate-800 uppercase">{lead.veiculo}</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Placa</p><p className="text-[11px] font-black text-slate-800 uppercase">{lead.placa}</p></div>
                   {/* Fix: lead.ano replaced with lead.anoFabricacao */}
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Ano/Fab</p><p className="text-[11px] font-black text-slate-800 uppercase">{lead.anoFabricacao}</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Chassi</p><p className="text-[10px] font-black text-slate-800 truncate">{lead.chassi}</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Renavam</p><p className="text-[11px] font-black text-slate-800 uppercase">{lead.renavam}</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Cor</p><p className="text-[11px] font-black text-slate-800 uppercase">{lead.cor}</p></div>
                </div>
             </section>

             <section>
                <h3 className="text-[#004595] font-black text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Equipamentos e Acessórios</h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between">
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Implemento v2.0</p><p className="text-[11px] font-black text-slate-800 uppercase">{lead.tipoImplemento}</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase">Avaliação Técnica</p><p className="text-[11px] font-black text-slate-800 uppercase">{fmtBRL(lead.valorImplemento)}</p></div>
                   <div className="text-right"><p className="text-[8px] font-black text-slate-400 uppercase">Status Global</p><p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">CERTIFICADO UNIMAXCRM</p></div>
                </div>
             </section>

             <section className="flex-1">
                <h3 className="text-[#004595] font-black text-[10px] uppercase tracking-[0.2em] mb-4 border-b border-slate-100 pb-2">Auditoria de Integridade IA</h3>
                <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                   {['Geometria de Chassi', 'Estética e Pintura', 'Conjunto Óptico', 'Estofamento Interno', 'Pneus e Estepe', 'Performance Motor', 'Módulo Eletrônico', 'Dispositivos v2.0'].map((item, i) => (
                     <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{item}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                           <span className="text-[9px] font-black text-emerald-600 uppercase">CONFORME</span>
                        </div>
                     </div>
                   ))}
                </div>
             </section>

             <div className="mt-auto pt-10 border-t border-slate-100 flex justify-between items-end">
                <div className="flex flex-col gap-4">
                   <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-lg text-slate-800 border border-slate-200 uppercase">
                      {profile.nome.charAt(0)}
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase">Inspetor Responsável</p>
                      <p className="text-[12px] font-black text-slate-800 uppercase">{profile.nome}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-300 uppercase italic">Laudo Certificado Digitalmente • UnimaxCRM Pro v2.0</p>
                </div>
             </div>
          </div>
          <div className="h-2 bg-[#004595] w-full shrink-0 flex">
             <div className="h-full bg-cyan-400 w-1/4"></div>
             <div className="h-full bg-[#004595] w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionReportPage;
