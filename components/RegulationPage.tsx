
import React, { useRef } from 'react';
import { Lead, Profile } from '../types';

interface RegulationPageProps {
  lead: Lead;
  profile: Profile;
  onBack: () => void;
}

// Fix: Explicitly define as React.FC to resolve "children missing" error in certain TypeScript environments
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[#004595] font-black text-sm uppercase tracking-widest border-b-2 border-[#004595]/10 pb-2 mb-6 mt-10 first:mt-0">
    {children}
  </h3>
);

const RegulationPage: React.FC<RegulationPageProps> = ({ lead, profile, onBack }) => {
  const regRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!regRef.current) return;
    // @ts-ignore
    const worker = html2pdf();
    const opt = {
      margin: [10, 15, 10, 15],
      filename: `Regulamento_UnimaxCRM_Completo_v2.0.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: 'avoid-all', before: '.page-break' }
    };
    await worker.set(opt).from(regRef.current).save();
  };

  return (
    <div className="h-screen bg-slate-200 flex flex-col overflow-hidden">
      <nav className="shrink-0 bg-white/95 backdrop-blur-xl border-b border-slate-300 px-6 py-3 flex items-center justify-between z-50">
        <button onClick={onBack} className="text-[#004595] font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-slate-100 px-4 py-2 rounded-xl transition-all border border-slate-100">
          ← Voltar ao CRM
        </button>
        <button onClick={handleDownloadPDF} className="bg-[#004595] text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
          Baixar Texto Completo v2.0
        </button>
      </nav>

      <div className="flex-1 overflow-y-auto px-4 py-12 flex justify-center custom-scrollbar bg-slate-100">
        <div ref={regRef} className="w-full max-w-[850px] bg-white shadow-2xl flex flex-col p-16 relative text-slate-700 leading-relaxed text-justify">
          
          <div className="flex flex-col items-center mb-12 border-b-4 border-[#004595] pb-8">
            <h1 className="text-3xl font-black text-[#004595] uppercase tracking-tighter text-center">REGULAMENTO DO PROGRAMA DE PROTEÇÃO VEICULAR UNIMAX</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Versão Oficial v2.0 - Auditoria UnimaxCRM</p>
          </div>

          <SectionTitle>1. OBJETIVOS E NATUREZA JURÍDICA</SectionTitle>
          <p className="mb-4"><strong>1.1</strong> - O presente regulamento tem como objetivo estabelecer as normas e regras do Programa de Proteção VEICULAR da UNIMAX, devendo ser meticulosamente cumprido e observado pelos órgãos estatutários, dirigentes, funcionários e associados.</p>
          <p className="mb-4"><strong>1.2</strong> - A UNIMAX é dotada de personalidade jurídica, constituída na forma de associação SEM FINALIDADE LUCRATIVA, não devendo ser tratado em hipótese alguma como uma sociedade empresária (como por exemplo, companhias seguradoras), baseando-se no mutualismo puro.</p>

          <SectionTitle>2. VINCULAÇÃO AO PROGRAMA (PPV)</SectionTitle>
          <p className="mb-4"><strong>2.1</strong> - Para aderir ao PPV da UNIMAX, o associado deverá encaminhar à Diretoria os seguintes documentos: Requerimento de adesão, CNH atualizada, CRLV do veículo e Comprovante de residência atualizado, além de efetuar o pagamento da taxa de adesão.</p>
          <p className="mb-4"><strong>2.2</strong> - O período mínimo de participação é de 6 (seis) meses. Em caso de acionamento de benefícios, haverá uma nova fidelização de 12 (doze) meses a contar da data do acionamento.</p>
          <p className="mb-4"><strong>2.2.1</strong> - O pedido de desligamento deverá ser realizado até o 25º dia do mês, ressaltada a responsabilidade pelo pagamento do próximo mês (regime pós-pago).</p>
          <p className="mb-4"><strong>2.4</strong> - Caso o associado se envolva em 2 (dois) acidentes em 12 meses, poderá ser excluído compulsoriamente a critério da Diretoria Executiva.</p>
          <p className="mb-4"><strong>2.5</strong> - O período de carência para furto/roubo e colisão é de 90 dias após a ativação.</p>
          <p className="mb-4"><strong>2.6</strong> - A proteção da ASSISTÊNCIA NACIONAL terá carência de 90 dias. Eventos neste período sofrerão cobrança da cota de participação em dobro.</p>

          <SectionTitle>4. COBERTURA DA PROTEÇÃO AUTOMOTIVA</SectionTitle>
          <p className="mb-2">A cobertura se aplica aos seguintes eventos:</p>
          <ul className="list-disc ml-8 mb-6 font-bold text-slate-800">
            <li>ROUBO E FURTO QUALIFICADO</li>
            <li>COLISÃO TOTAL OU PARCIAL</li>
            <li>INCÊNDIO DECORRENTE DE COLISÃO</li>
            <li>FENÔMENOS DA NATUREZA (Após Sindicância)</li>
          </ul>

          <div className="page-break"></div>

          <SectionTitle>7. PARTICIPAÇÃO DO ASSOCIADO (COTA)</SectionTitle>
          <p className="mb-4">Em caso de utilização, o associado participará com os seguintes percentuais conforme o plano escolhido:</p>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 p-4 rounded-xl border">
              <p className="font-black text-[#004595]">NACIONAIS LEVES</p>
              <p>Bronze (5%), Prata (7%), Ouro (8%), VIP (18%). Mínimo R$ 1.200,00.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border">
              <p className="font-black text-[#004595]">APP / COMERCIAIS</p>
              <p>Bronze (7%), Prata (12%), Ouro (15%). Mínimo R$ 2.500,00.</p>
            </div>
          </div>

          <SectionTitle>8. OBRIGAÇÕES DO ASSOCIADO</SectionTitle>
          <p className="mb-4"><strong>8.3</strong> - Manter o veículo em bom estado de conservação.</p>
          <p className="mb-4"><strong>8.7</strong> - Informar imediatamente autoridades em caso de eventos e à central de assistência 24h em no máximo 06 horas.</p>
          <p className="mb-4"><strong>8.8</strong> - Acionar a UNIMAX no prazo máximo de 48h corridas para danos materiais.</p>

          <SectionTitle>10. DOCUMENTAÇÃO PARA RESSARCIMENTO</SectionTitle>
          <p className="mb-4">Para indenização integral (Perda Total/Roubo): Cópia CPF/RG, CRV Original assinado, CRLV quitado (IPVA/Seguro), Boletim de Ocorrência Original e Chaves do Veículo.</p>

          <div className="mt-20 flex flex-col items-center">
             <div className="w-full flex justify-between gap-20 mb-10">
                <div className="flex-1 border-t border-slate-400 text-center pt-2">
                   <p className="text-[10px] font-black uppercase">Diretoria Executiva UnimaxCRM Pro v2.0</p>
                </div>
                <div className="flex-1 border-t border-slate-400 text-center pt-2">
                   <p className="text-[10px] font-black uppercase">{lead.nome}</p>
                   {/* Fix: lead.cpf replaced with lead.documento */}
                   <p className="text-[8px] text-slate-400">Associado Aderente - DOC: {lead.documento}</p>
                </div>
             </div>
             <div className="bg-[#f0f9ff] border border-blue-100 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#004595] text-white flex items-center justify-center">
                   <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>
                </div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                   Certificado Digital UnimaxCRM Auth v2.0 Protocol<br/>
                   <span className="text-[#004595]">Auditado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegulationPage;
