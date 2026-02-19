
import React from 'react';
import { Profile, ViewMode } from '../types';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: ViewMode) => void;
  profile: Profile;
  canAccess?: (view: ViewMode) => boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const MENU_ITEMS = [
  { id: 'indicadores' as ViewMode, label: 'Dashboard', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 3h8v10H3zm10 0h8v6h-8zm0 8h8v10h-8zm-10 10h8v-6H3z"/>
    </svg>
  )},
  { id: 'pipeline' as ViewMode, label: 'Funil CRM', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
    </svg>
  )},
  { id: 'associados' as ViewMode, label: 'Associados', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h7v-3.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )},
  { id: 'vistorias' as ViewMode, label: 'Vistorias', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c1.65 0 3-1.35 3-3s-1.35-3-3-3-3 1.35-3 3 1.35 3 3 3zm10-7h-4.05L16 3H8L6.05 5H2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  )},
  { id: 'financeiro' as ViewMode, label: 'Comissões', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
    </svg>
  )},
  { id: 'configuracoes' as ViewMode, label: 'Meu Perfil', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  )},
  { id: 'usuarios' as ViewMode, label: 'Usuários', icon: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h7v-3.5c0-.46.08-.88.22-1.27C6.41 15.23 6 15.1 6 15c0-.55.9-1 2-1h4c1.1 0 2 .45 2 1 0 .1-.41.23-1.22.23.14.39.22.81.22 1.27V20h7v-3.5c0-2.33-4.67-3.5-7-3.5z"/>
    </svg>
  )},
];

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, profile, canAccess, isCollapsed = false, onToggleCollapse }) => {
  const SparkleIcon = () => (
    <svg className="w-5 h-5 text-[color:var(--unimax-dark)]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>
  );

  return (
    <>
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300" 
          onClick={onToggleCollapse}
        />
      )}
      
      <aside className={`fixed lg:relative inset-y-0 left-0 z-[60] transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 -translate-x-full lg:translate-x-0 lg:w-0' : 'w-64 md:w-72 translate-x-0'} bg-[color:var(--unimax-dark)] flex flex-col shrink-0 overflow-hidden shadow-2xl lg:shadow-none`}>
        <div className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'} w-64 md:w-72 h-full flex flex-col`}>
          <div className="p-8 flex flex-col items-start gap-6 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/brand/logo-icon.png" alt="UnimaxCRM" className="w-9 h-9 object-contain" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-white font-black text-xl tracking-tighter uppercase italic leading-none">
                  Unimax<span className="text-cyan-400 not-italic ml-1">CRM</span>
                </h1>
                <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Pro v2.0</span>
              </div>
            </div>
            
            <div className="w-full flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/5 group">
              <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
                <SparkleIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-cyan-400 font-black text-[9px] tracking-widest uppercase leading-none">UNIMAX IA CORE</span>
                <span className="text-white/40 font-black text-[7px] tracking-[0.2em] uppercase mt-1">PLANO ATIVO</span>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto no-scrollbar">
            {MENU_ITEMS.filter((item) => (canAccess ? canAccess(item.id) : true)).map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (window.innerWidth < 1024 && onToggleCollapse) {
                      onToggleCollapse();
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ui-sidebar-item ${
                    isActive ? 'bg-white text-[color:var(--unimax-blue)] shadow-xl' : 'text-white/75 hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-[color:var(--unimax-blue)]' : 'text-white/45 group-hover:text-white transition-colors'}`}>
                    {item.icon}
                  </span>
                  <span className="font-bold text-[11px] uppercase tracking-widest">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-6 mt-auto border-t border-white/10 shrink-0">
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
                {profile.nome.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-[10px] font-black truncate uppercase tracking-widest">{profile.nome}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-white/40 text-[7px] font-black uppercase tracking-widest">Sessão Ativa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
