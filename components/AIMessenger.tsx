
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface AIMessengerProps {
  history: ChatMessage[];
  onSendMessage: (msg: string) => void;
  onClose: () => void;
  onAnalyzeFunnel: () => void;
  isLoading: boolean;
  isOpen: boolean;
}

const AIMessenger: React.FC<AIMessengerProps> = ({ history, onSendMessage, onClose, onAnalyzeFunnel, isLoading, isOpen }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [history, isLoading]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const formatText = (text: string, isUser: boolean) => {
    return text.split('\n').map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, 
        isUser 
        ? '<strong class="text-white font-black">$1</strong>' 
        : '<strong class="text-indigo-900 font-black">$1</strong>'
      );
      return (
        <p key={i} 
           className={`mb-2 last:mb-0 leading-relaxed text-[13px] ${isUser ? 'text-white/95 text-right' : 'text-slate-600'}`} 
           dangerouslySetInnerHTML={{ __html: formatted }} 
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-10 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-white w-full max-w-5xl h-full md:h-[85vh] md:rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 relative border border-white/20">
        
        {/* Top Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-6">
            <div className="relative group">
               <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-all">
                  <svg className="w-9 h-9 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z" />
                  </svg>
               </div>
               <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white"></div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Órbis<span className="text-indigo-600 not-italic ml-0.5">IA v2.0</span></h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                Mentor Comercial Estratégico
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Chat Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-12 space-y-8 custom-scrollbar bg-slate-50/30">
          {history.length === 0 && !isLoading && (
            <div className="h-full flex flex-col items-center justify-center text-center px-12 animate-in fade-in duration-1000">
               <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl border border-slate-100">
                  <svg className="w-12 h-12 text-indigo-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" /></svg>
               </div>
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest mb-4">Como posso impulsionar<br/>suas vendas hoje?</h2>
               <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-md uppercase tracking-widest">
                  Analiso seu pipeline, contorno objeções e crio estratégias exclusivas baseadas nos seus leads ativos.
               </p>
            </div>
          )}

          {history.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-4 duration-500`}>
              <div className={`max-w-[80%] p-7 rounded-[2.5rem] relative ${
                msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-2xl shadow-indigo-600/20' 
                : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-xl'
              }`}>
                {msg.role === 'model' && (
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-2">
                     <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">UnimaxCRM Insight</span>
                  </div>
                )}
                <div className="space-y-1">{formatText(msg.text, msg.role === 'user')}</div>
                <span className={`text-[8px] font-black mt-4 block opacity-30 uppercase ${msg.role === 'user' ? 'text-white' : 'text-slate-400'}`}>
                  {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start animate-in fade-in">
              <div className="bg-white p-6 rounded-3xl rounded-tl-none shadow-lg border border-slate-100 flex items-center gap-4">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.2s]"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.4s]"></div>
                 </div>
                 <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Sincronizando Pipeline...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-10 bg-white border-t border-slate-100">
          <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar pb-2">
             <button onClick={onAnalyzeFunnel} className="bg-slate-900 text-white px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0">
               <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg>
               ANALISAR MEU FUNIL
             </button>
             {["Como vencer o concorrente?", "Roteiro de abordagem", "Dicas para o dia"].map(txt => (
               <button key={txt} onClick={() => onSendMessage(txt)} className="bg-white border border-slate-200 text-slate-500 px-8 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shrink-0">
                 {txt}
               </button>
             ))}
          </div>
          <form onSubmit={handleSend} className="relative flex items-center gap-5">
            <input 
              value={input} onChange={(e) => setInput(e.target.value)} disabled={isLoading}
              placeholder="Escreva sua dúvida comercial..."
              className="flex-1 bg-slate-100 border-none rounded-[1.75rem] px-10 py-6 text-[14px] font-bold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            <button 
              type="submit" disabled={!input.trim() || isLoading}
              className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-xl active:scale-90 transition-all shrink-0 ${!input.trim() || isLoading ? 'bg-slate-100 text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'}`}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIMessenger;
