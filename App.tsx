
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Lead, 
  AppState, 
  CRMStatus, 
  Transaction,
  ViewMode,
  TipoVeiculo
} from './types';
import { fmtBRL, generateUID, decodePublicPayload } from './utils';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import FinancialSidebar from './components/FinancialSidebar';
import DashboardKPIs from './components/DashboardKPIs';
import { LeadModal, ProfileModal, WithdrawModal } from './components/Modals';
import Toast from './components/Toast';
import AIMessenger from './components/AIMessenger';
import ProposalPage from './components/ProposalPage';
import ContractPage from './components/ContractPage';
import InspectionReportPage from './components/InspectionReportPage';
import RegulationPage from './components/RegulationPage';
import PaymentPage from './components/PaymentPage';
import SignaturePage from './components/SignaturePage';
import InspectionCenterView from './components/InspectionCenterView';
import AssociatesView from './components/AssociatesView';
import UsersView from './components/UsersView';
import Preloader from './components/Preloader';
import Login from './components/Login';
import { buildSnapshot, buildFunnelPrompt, orbisChat } from './orbisAI';
import { DEMO_LEADS, DEMO_TRANSACTIONS } from './demoSeed';
import { endSession, firstAllowedView, getCurrentUser, hasPermission, VIEW_PERMISSION } from './auth';

const APP_STORAGE_KEY = 'crm_unimax_v2.0_demo';

const INITIAL_STATE: AppState = {
  // DEMO: 33 cards preenchidos para apresentação.
  leads: DEMO_LEADS,
  transactions: DEMO_TRANSACTIONS,
  profile: { nome: 'Consultor Órbis PRO', pix: 'comercial@unimax.com.br', comissao: 0, meta: 35000 },
  saldo: 370,
  filter: '',
  chatHistory: [],
  showArchived: false,
};

const EMPTY_STATE: AppState = {
  leads: [],
  transactions: [],
  profile: { nome: 'Consultor', pix: '', comissao: 0, meta: 35000 },
  saldo: 0,
  filter: '',
  chatHistory: [],
  showArchived: false,
};

const App: React.FC = () => {
  const [bootPhase, setBootPhase] = useState<'loading' | 'exiting' | 'done'>('loading');
  const [appEntered, setAppEntered] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const isAuthed = !!currentUser;

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    // Estado inicial DEMO.
    return INITIAL_STATE;
  });

  const [view, setView] = useState<ViewMode>(() => (getCurrentUser() ? 'indicadores' : 'pipeline'));
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isAIMessengerOpen, setIsAIMessengerOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);
  
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [proposalLead, setProposalLead] = useState<Lead | null>(null);

  const setViewGuarded = useCallback(
    (next: ViewMode) => {
      if (!currentUser) return;
      const perm = VIEW_PERMISSION[next];
      if (perm && !hasPermission(currentUser, perm)) {
        setToast({ msg: 'Você não tem permissão para acessar este módulo.', type: 'error' });
        return;
      }
      setView(next);
    },
    [currentUser]
  );

  useEffect(() => {
    if (!currentUser) return;
    const perm = VIEW_PERMISSION[view];
    if (perm && !hasPermission(currentUser, perm)) {
      setView(firstAllowedView(currentUser));
    }
  }, [currentUser, view]);

  // Boot UX: 1) Pre-loader 2) (fade out) 3) Login/Dashboard
  useEffect(() => {
    const t1 = window.setTimeout(() => setBootPhase('exiting'), 1050);
    const t2 = window.setTimeout(() => setBootPhase('done'), 1500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (bootPhase === 'done') {
      // dispara animação de entrada do app (dashboard/login)
      const t = window.setTimeout(() => setAppEntered(true), 10);
      return () => window.clearTimeout(t);
    }
  }, [bootPhase]);

  const handleLoginSuccess = useCallback(() => {
    const u = getCurrentUser();
    setCurrentUser(u);
    setView(firstAllowedView(u));
    if (u) {
      setState(s => ({ ...s, profile: { ...s.profile, nome: u.nome } }));
    }
  }, []);

  const handleLogout = useCallback(() => {
    endSession();
    setCurrentUser(null);
    setView('pipeline');
  }, []);

  // Deep link support: ?view=contract|proposal|report|regulation|payment|signature&leadId=...&payload=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = (params.get('view') as any) || null;
      const leadId = params.get('leadId');
      const payload = params.get('payload');
      if (!v) return;
      if (!['proposal','contract','report','regulation','payment','signature'].includes(v)) return;

      // 1) Tenta achar o lead salvo
      if (leadId) {
        const found = state.leads.find(l => l.id === leadId);
        if (found) {
          setProposalLead(found);
          setView(v);
          return;
        }
      }

      // 2) Fallback: usa payload público (para links compartilháveis)
      const decoded = decodePublicPayload<any>(payload);
      if (decoded) {
        const tempLead = {
          id: decoded.leadId || leadId || 'PUBLIC',
          tipoPessoa: 'PF',
          nome: decoded.nome || '',
          documento: decoded.documento || '',
          fone: decoded.fone || '',
          email: '',
          canal: 'LINK PÚBLICO',
          cep: '', endereco: '', numero: '', bairro: '', cidade: '', uf: '',
          tipoVeiculo: (decoded.tipoVeiculo || '') as any,
          placa: decoded.placa || '', renavam: '', chassi: '',
          marca: '', modelo: '', anoFabricacao: '', anoModelo: '', cor: '', combustivel: '', cambio: 'Manual',
          valor: Number(decoded.valorFipe || 0),
          tipoImplemento: 'NENHUM' as any,
          valorImplemento: 0,
          veiculo: decoded.veiculo || '',
          veiculoTrabalho: false,
          codigoFipe: decoded.codigoFipe || '',
          status: 'novo' as any,
          variant: Number(decoded.variant || 1),
          mensalidade: Number(decoded.mensalidade || 0),
          desconto: Number(decoded.desconto || 0),
          adesao: Number(decoded.adesao || 0),
          coberturasAdicionais: decoded.coberturasAdicionais || [],
          attachments: [],
          vistoriaLiberada: false,
          vistoriaConcluida: false,
          pagamentoEnviado: false,
          pagamentoConcluido: false,
          assinaturaEnviada: false,
          assinaturaConcluida: false,
          createdAt: Date.now(),
          history: [],
          proposalLink: '', paymentLink: '', signatureLink: '', termoAdesaoLink: '',
        } as any;
        (tempLead as any).__public = true;
        (tempLead as any).__pix = decoded.pix || '';
        (tempLead as any).__consultor = decoded.consultor || '';
        setProposalLead(tempLead);
        setView(v);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showToast = useCallback((msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const appendChat = useCallback((role: 'user' | 'model', text: string) => {
    setState(s => ({ ...s, chatHistory: [...s.chatHistory, { role, text, ts: Date.now() }] }));
  }, []);

  const handleAISendMessage = useCallback(async (msg: string) => {
    const text = (msg || '').trim();
    if (!text || isAILoading) return;

    appendChat('user', text);
    setIsAILoading(true);

    try {
      const snapshot = buildSnapshot({
        leads: state.leads,
        profile: state.profile,
        transactions: state.transactions,
        saldo: state.saldo,
      });

      const reply = await orbisChat({
        userMessage: text,
        history: state.chatHistory.concat({ role: 'user', text, ts: Date.now() }),
        snapshot,
        profileName: state.profile.nome,
      });

      appendChat('model', reply);
    } catch (e: any) {
      const err = (e?.message || '').toString();
      appendChat('model', `Falha ao executar o Órbis IA agora. ${err ? `Detalhe: ${err}` : ''}`.trim());
    } finally {
      setIsAILoading(false);
    }
  }, [appendChat, isAILoading, state.leads, state.profile, state.saldo, state.transactions, state.chatHistory]);

  const handleAIAnalyzeFunnel = useCallback(async () => {
    if (isAILoading) return;
    const snapshot = buildSnapshot({
      leads: state.leads,
      profile: state.profile,
      transactions: state.transactions,
      saldo: state.saldo,
    });

    const userMessage = buildFunnelPrompt(snapshot);
    appendChat('user', 'Analisar meu funil (snapshot atual)');
    setIsAILoading(true);

    try {
      const reply = await orbisChat({
        userMessage,
        history: state.chatHistory.concat({ role: 'user', text: userMessage, ts: Date.now() }),
        snapshot,
        profileName: state.profile.nome,
      });
      appendChat('model', reply);
    } catch (e: any) {
      const err = (e?.message || '').toString();
      appendChat('model', `Falha ao analisar o funil agora. ${err ? `Detalhe: ${err}` : ''}`.trim());
    } finally {
      setIsAILoading(false);
    }
  }, [appendChat, isAILoading, state.leads, state.profile, state.saldo, state.transactions, state.chatHistory]);

  const handleSaveLead = useCallback((leadData: Partial<Lead>) => {
    const id = leadData.id || generateUID();
    const newLead = { 
      ...leadData, 
      id, 
      createdAt: leadData.createdAt || Date.now(), 
      history: leadData.history || [], 
      status: leadData.status || 'novo', 
      archived: !!leadData.archived, 
      attachments: leadData.attachments || [] 
    } as Lead;

    setState(prev => {
      const leads = [...prev.leads];
      const idx = leads.findIndex(l => l.id === id);
      if (idx > -1) leads[idx] = newLead;
      else leads.unshift(newLead);
      return { ...prev, leads };
    });

    if (proposalLead?.id === id) {
      setProposalLead(newLead);
    }

    return newLead;
  }, [proposalLead]);

  const handleMoveLead = useCallback((id: string, newStatus: CRMStatus) => {
    setState(prev => {
      const lead = prev.leads.find(l => l.id === id);
      if (!lead || lead.status === newStatus) return prev;
      let newSaldo = prev.saldo;
      let newTransactions = [...prev.transactions];

      if (newStatus === 'ativado' && lead.status !== 'ativado') {
        const valorComissao = lead.adesao || 350;
        newTransactions.push({ id: generateUID(), tipo: 'Comissão', valor: valorComissao, status: 'concluida', ts: Date.now(), desc: `Ativação: ${lead.nome}` });
        newSaldo += valorComissao;
        showToast(`Comissão de ${fmtBRL(valorComissao)} creditada!`, 'success');
      }

      return {
        ...prev,
        saldo: newSaldo,
        transactions: newTransactions,
        leads: prev.leads.map(l => l.id === id ? { ...l, status: newStatus, history: [...l.history, { from: l.status, to: newStatus, ts: Date.now() }] } : l)
      };
    });
  }, [showToast]);

  const filteredLeads = useMemo(() => {
    const q = (state.filter || '').toLowerCase();
    return state.leads.filter(l => {
      const isArchived = (l.archived ?? false);
      if (isArchived !== state.showArchived) return false;
      if (!q) return true;
      return (
        (l.nome || '').toLowerCase().includes(q) ||
        (l.placa || '').toLowerCase().includes(q)
      );
    });
  }, [state.leads, state.showArchived, state.filter]);

  // Funil CRM = visão completa do kanban (inclui cotação, vistoria/assinatura e finalizados)
  const pipelineLeads = useMemo(() => {
    return filteredLeads;
  }, [filteredLeads]);

  // View Router Inteligente
  if (view === 'proposal' && proposalLead) return <ProposalPage lead={proposalLead} profile={state.profile} onBack={() => setViewGuarded('pipeline')} onOpenContract={() => setViewGuarded('contract')} onUpdateLead={(partial) => { const saved = handleSaveLead({ ...proposalLead, ...partial }); setProposalLead(saved); }} />;
  if (view === 'contract' && proposalLead) return <ContractPage lead={proposalLead} profile={state.profile} onBack={() => setViewGuarded('pipeline')} />;
  if (view === 'report' && proposalLead) return <InspectionReportPage lead={proposalLead} profile={state.profile} onBack={() => setViewGuarded('pipeline')} />;
  if (view === 'regulation' && proposalLead) return <RegulationPage lead={proposalLead} profile={state.profile} onBack={() => setViewGuarded('pipeline')} />;
  if (view === 'payment' && proposalLead) return <PaymentPage lead={proposalLead} profile={state.profile} onBack={() => setViewGuarded('pipeline')} />;
  if (view === 'signature' && proposalLead) return <SignaturePage lead={proposalLead} profile={state.profile} onBack={() => setViewGuarded('pipeline')} />;

  // Gate de acesso: 1) Pre-loader 2) Login 3) Dashboard
  if (bootPhase !== 'done') return <Preloader phase={bootPhase === 'exiting' ? 'exiting' : 'loading'} />;
  if (!isAuthed) return (
    <div className={appEntered ? 'app-enter' : ''}>
      <Login onSuccess={handleLoginSuccess} />
    </div>
  );

  return (
    <div className={`${appEntered ? 'app-enter' : ''} h-screen w-full flex overflow-hidden bg-[#f8fafc]`}>
      <Sidebar
        activeView={view}
        onViewChange={setViewGuarded}
        canAccess={(v) => !!currentUser && hasPermission(currentUser, VIEW_PERMISSION[v])}
        profile={state.profile}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Header 
          title={
            view === 'pipeline'
              ? 'Funil Comercial'
              : view === 'vistorias'
              ? 'Central de Vistorias'
              : view === 'associados'
              ? 'Associados'
              : view === 'usuarios'
              ? 'Usuários'
              : view.toUpperCase()
          }
          onNewLead={() => { setActiveLead(null); setIsLeadModalOpen(true); }}
          onUndo={() => {}}
          canUndo={false}
          showArchivedToggle={view === 'pipeline'}
          isShowingArchived={state.showArchived}
          onToggleArchived={() => setState(s => ({ ...s, showArchived: !s.showArchived }))}
          onSearchChange={(val) => setState(s => ({ ...s, filter: val }))}
          searchValue={state.filter}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
            {view === 'pipeline' && (
              <KanbanBoard 
                leads={pipelineLeads} 
                onMoveLead={handleMoveLead} 
                onEditLead={(l) => { setActiveLead(l); setIsLeadModalOpen(true); }} 
              />
            )}
            {view === 'vistorias' && (
              <InspectionCenterView 
                leads={state.leads} 
                onEditLead={(l) => { setActiveLead(l); setIsLeadModalOpen(true); }} 
                onViewReport={(l) => { setProposalLead(l); setViewGuarded('report'); }} 
                onReleaseInspection={(l) => { handleSaveLead({...l, vistoriaLiberada: true}); showToast('Vistoria Órbis Liberada!', 'success'); }} 
              />
            )}
            {view === 'associados' && (
              <AssociatesView
                leads={state.leads}
                onOpenLead={(l) => { setActiveLead(l); setIsLeadModalOpen(true); }}
              />
            )}
            {view === 'indicadores' && <div className="p-10"><DashboardKPIs leads={state.leads} transactions={state.transactions} meta={state.profile.meta} /></div>}
            {view === 'financeiro' && <div className="p-10"><FinancialSidebar saldo={state.saldo} comissao={0} transactions={state.transactions} onWithdraw={() => setIsWithdrawModalOpen(true)} /></div>}
            {view === 'usuarios' && <UsersView />}
            {view === 'configuracoes' && (
              <div className="p-10 flex flex-col items-center gap-6">
                 <ProfileModal isOpen={true} onClose={() => setViewGuarded('pipeline')} profile={state.profile} onSave={(p) => setState(s => ({ ...s, profile: p }))} />

                 <div className="w-full max-w-xl grid md:grid-cols-2 gap-3 mt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full text-xs font-black text-slate-700 uppercase tracking-widest border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50"
                  >
                    Encerrar sessão
                  </button>
                  <button
                    onClick={() => {
                      if (!confirm('Zerar leads, transações e dados operacionais? (Usuários e permissões serão mantidos)')) return;
                      const base = JSON.parse(JSON.stringify(EMPTY_STATE)) as AppState;
                      base.profile.nome = currentUser?.nome || base.profile.nome;
                      setState(base);
                      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(base));
                      setToast({ msg: 'Sistema zerado. Usuários e permissões mantidos.', type: 'success' });
                      setView(firstAllowedView(currentUser));
                    }}
                    className="w-full text-xs font-black text-rose-600 uppercase tracking-widest border border-rose-200 px-6 py-3 rounded-xl hover:bg-rose-50"
                  >
                    Zerar informações
                  </button>
                 </div>

                 <button
                   onClick={() => {
                     if (!confirm('Factory reset? Isso remove TUDO (inclui usuários e permissões) e recarrega a página.')) return;
                     localStorage.clear();
                     window.location.reload();
                   }}
                   className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8"
                 >
                   Factory reset (apagar tudo)
                 </button>
              </div>
            )}
          </div>
        </main>

        <div className="fixed bottom-10 right-10 z-[60]">
           <button onClick={() => setIsAIMessengerOpen(true)} className="w-16 h-16 rounded-[1.75rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl active:scale-95 transition-all fab-pro-pulse">
              <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z" />
              </svg>
           </button>
        </div>
      </div>

      <LeadModal 
        isOpen={isLeadModalOpen} onClose={() => setIsLeadModalOpen(false)} lead={activeLead} 
        onSave={(l) => { handleSaveLead(l); setIsLeadModalOpen(false); showToast('Registro salvo.', 'success'); }} 
        onDelete={(id) => setState(s => ({ ...s, leads: s.leads.filter(l => l.id !== id) }))}
        profile={state.profile}
        onViewProposal={(l) => { const saved = handleSaveLead(l); setProposalLead(saved); setViewGuarded('proposal'); setIsLeadModalOpen(false); }}
        onViewContract={(l) => { const saved = handleSaveLead(l); setProposalLead(saved); setViewGuarded('contract'); setIsLeadModalOpen(false); }}
        onViewReport={(l) => { const saved = handleSaveLead(l); setProposalLead(saved); setViewGuarded('report'); setIsLeadModalOpen(false); }}
        onViewRegulation={(l) => { const saved = handleSaveLead(l); setProposalLead(saved); setViewGuarded('regulation'); setIsLeadModalOpen(false); }}
        showToast={showToast}
      />
      
      <AIMessenger
        isOpen={isAIMessengerOpen}
        onClose={() => setIsAIMessengerOpen(false)}
        history={state.chatHistory}
        onSendMessage={handleAISendMessage}
        onAnalyzeFunnel={handleAIAnalyzeFunnel}
        isLoading={isAILoading}
      />
      <WithdrawModal isOpen={isWithdrawModalOpen} onClose={() => setIsWithdrawModalOpen(false)} saldo={state.saldo} pix={state.profile.pix} onConfirm={(v) => { setState(s => ({ ...s, saldo: s.saldo - v, transactions: [...s.transactions, { id: generateUID(), tipo: 'Saque PIX', valor: -v, status: 'pendente', ts: Date.now(), desc: 'Resgate de Comissão' }] })); setIsWithdrawModalOpen(false); showToast('Saque solicitado.', 'success'); }} />
      {toast && <Toast msg={toast.msg} type={toast.type} onUndo={() => {}} />}
    </div>
  );
};

export default App;