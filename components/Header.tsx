
import React from 'react';

interface HeaderProps {
  title: string;
  onNewLead: () => void;
  onUndo: () => void;
  canUndo: boolean;
  showArchivedToggle?: boolean;
  isShowingArchived?: boolean;
  onToggleArchived?: () => void;
  onMenuOpen?: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  onNewLead, 
  showArchivedToggle, 
  isShowingArchived, 
  onToggleArchived, 
  onToggleSidebar, 
  isSidebarCollapsed,
  searchValue,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 md:px-10 py-4 flex items-center justify-between shrink-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-5">
        <button 
          onClick={onToggleSidebar}
          className="group flex items-center justify-center gap-3 px-4 py-2.5 rounded-2xl transition-all duration-500 border active:scale-95 bg-white border-slate-200 text-[#004595] hover:bg-[#002a5e] hover:border-[#002a5e] hover:text-white shadow-sm hover:shadow-xl hover:shadow-blue-900/10"
        >
          <div className="flex flex-col items-center justify-center gap-1">
            <div className={`h-[2px] transition-all duration-500 rounded-full bg-current ${isSidebarCollapsed ? 'w-4' : 'w-6'}`}></div>
            <div className="w-6 h-[2px] bg-current rounded-full transition-colors"></div>
            <div className={`h-[2px] transition-all duration-500 rounded-full bg-current ${isSidebarCollapsed ? 'w-4' : 'w-3'}`}></div>
          </div>
          <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest">Painel</span>
        </button>
        
        <div className="hidden lg:flex flex-col">
          <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] ml-2 animate-in fade-in slide-in-from-left-4 duration-700">
            {title}
          </h2>
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest ml-2">UnimaxCRM Pro v2.0</span>
        </div>
      </div>

      <div className="flex-1 max-w-xl px-8 hidden md:block">
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-[#004595] group-focus-within:text-cyan-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar por nome, placa ou veículo..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-6 text-[12px] font-bold text-slate-700 placeholder:text-slate-400 outline-none focus:bg-white focus:border-[#004595] focus:ring-4 focus:ring-[#004595]/5 transition-all shadow-inner"
          />
          {searchValue && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-rose-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        {showArchivedToggle && (
          <button 
            onClick={onToggleArchived}
            className={`flex items-center gap-2.5 px-4 md:px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 border active:scale-95 ${
              isShowingArchived 
              ? 'bg-slate-900 border-slate-800 text-white shadow-lg' 
              : 'bg-white border-slate-200 text-slate-500 hover:border-[#004595] hover:text-[#004595] hover:shadow-md'
            }`}
          >
            <svg className={`w-4 h-4 transition-transform duration-500 ${isShowingArchived ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.01 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12.14l.81 1H5.12z"/>
            </svg>
            <span className="hidden sm:block">{isShowingArchived ? 'VER FUNIL ATIVO' : 'ARQUIVADOS'}</span>
          </button>
        )}

        <button 
          onClick={onNewLead}
          className="group flex items-center justify-center gap-3 px-5 md:px-7 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500 border active:scale-95 shimmer-effect bg-gradient-to-r from-[#004595] to-[#002a5e] border-white/10 text-white shadow-[0_10px_30px_rgba(0,42,94,0.2)] hover:shadow-[0_15px_40px_rgba(0,42,94,0.4)] hover:scale-105"
        >
          <svg className="w-4 h-4 text-cyan-400 transition-all duration-300 group-hover:rotate-90 group-hover:scale-125" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          <span className="hidden sm:block">NOVO LEAD</span>
          <span className="sm:hidden">+ LEAD</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
