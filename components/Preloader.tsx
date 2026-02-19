import React from 'react';

type PreloaderPhase = 'loading' | 'exiting';

const Preloader: React.FC<{ phase?: PreloaderPhase }> = ({ phase = 'loading' }) => {
  return (
    <div className={`preloader-shell h-full w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 ${phase === 'exiting' ? 'preloader-exit' : 'preloader-enter'}`}>
      <div className="w-full max-w-sm px-6 relative">
        <div className="flex items-center justify-center">
          <img
            src="/brand/logo-blue.png"
            alt="Unimax"
            className="h-48 md:h-60 w-auto object-contain"
          />
        </div>

        <div className="mt-3 text-center">
          <div className="text-[11px] md:text-xs font-black tracking-[0.28em] text-slate-700">UNIMAX IA CORE</div>
          <div className="mt-1 text-[10px] md:text-[11px] font-black tracking-[0.34em] text-slate-500">PLANO ATIVO</div>
        </div>

        <div className="mt-6 h-2 w-full rounded-full bg-slate-200 overflow-hidden relative">
          <div className="absolute inset-0 w-2/5 bg-[color:var(--unimax-blue)] rounded-full orbis-progress" />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
