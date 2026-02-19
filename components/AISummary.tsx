
import React, { useState } from 'react';

interface AISummaryProps {
  insight?: string;
  onClear: () => void;
  isLoading?: boolean;
}

const AISummary: React.FC<AISummaryProps> = ({ insight, onClear, isLoading }) => {
  const [copied, setCopied] = useState(false);

  if (!insight && !isLoading) return null;

  const handleCopy = () => {
    if (!insight) return;
    navigator.clipboard.writeText(insight);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Formatação simples para simular "diagramação" (quebras de linha e negritos)
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return <li key={i} className="ml-4 mb-2">{line.replace(/^[-*]\s*/, '')}</li>;
      }
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <p key={i} className="mb-3">
            {parts.map((p, j) => j % 1 === 0 && j !== 0 ? <strong key={j} className="text-white font-black">{p}</strong> : p)}
          </p>
        );
      }
      return line.trim() === '' ? <br key={i} /> : <p key={i} className="mb-3">{line}</p>;
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div className="bg-[#1e1e2e] w-full max-w-2xl rounded-[2rem] shadow-2xl border border-indigo-500/30 overflow-hidden flex flex-col max-h-[85vh] animate-in slide-in-from-bottom-8 duration-500">
        
        {/* Header do Chat */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/10">
              🤖
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100 opacity-80">Consultoria Estratégica</h4>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">Inteligência UnimaxCRM</h3>
            </div>
          </div>
          <button 
            onClick={onClear} 
            className="w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all border border-white/5 active:scale-90"
          >
            ✕
          </button>
        </div>

        {/* Corpo do Chat */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce"></div>
              </div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Analisando Pipeline em tempo real...</p>
            </div>
          ) : (
            <div className="text-slate-300 text-sm leading-relaxed font-medium">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 relative">
                <div className="absolute -top-3 -left-2 bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">IA Message</div>
                {formatText(insight || '')}
              </div>
            </div>
          )}
        </div>

        {/* Footer/Ações */}
        {!isLoading && (
          <div className="p-6 bg-slate-900/50 border-t border-white/5 flex gap-4 shrink-0">
            <button 
              onClick={handleCopy}
              className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                copied 
                ? 'bg-emerald-600 border-emerald-500 text-white' 
                : 'bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {copied ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                )}
              </svg>
              {copied ? 'COPIADO!' : 'COPIAR PARA O WHATSAPP'}
            </button>
            <button 
              onClick={onClear}
              className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-900/20 transition-all"
            >
              ENTENDIDO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummary;
