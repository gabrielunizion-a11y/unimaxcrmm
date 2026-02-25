import React from 'react';

interface ToastProps {
  msg: string;
  type?: 'success' | 'info' | 'error';
  onUndo: () => void;
}

const Toast: React.FC<ToastProps> = ({ msg, type = 'info', onUndo }) => {
  const styles = {
    success: 'bg-white border-emerald-200 text-emerald-600',
    info: 'bg-white border-blue-200 text-[#004595]',
    error: 'bg-white border-rose-200 text-rose-600'
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-6 py-4 rounded-2xl border min-w-[320px] justify-between transition-all duration-300 ${styles[type]}`} 
         style={{ animation: 'slideUp 0.3s ease-out forwards' }}>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black uppercase tracking-tight">{msg}</span>
      </div>
      <button 
        onClick={onUndo}
        className="text-[10px] uppercase font-black bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-all text-slate-600"
      >
        Desfazer
      </button>
    </div>
  );
};

export default Toast;