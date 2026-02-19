
import React, { useState, useEffect, useMemo } from 'react';
import { Lead, Profile, TipoVeiculo, Attachment } from '../types';
import { COBERTURAS_ADICIONAIS, PLANOS, PLANOS_LIST, CATEGORIAS_VEICULOS } from '../constants';
import { fmtBRL, fmtPct, calcMensalByPlano, getTabelaParaCategoria, generateUID, fmtDateTimeBR, encodePublicPayload } from '../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  rightActions?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, rightActions }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 transition-all backdrop-blur-md">
      <div className="bg-white w-full max-w-7xl h-[95vh] rounded-[2.5rem] overflow-hidden border border-slate-200 flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 rounded-full bg-unimax-blue animate-pulse"></div>
             <h3 className="font-black text-slate-800 uppercase tracking-widest text-[12px]">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {rightActions}
            <button onClick={onClose} className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-all">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

const FormSection: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({ title, icon, children }) => (
  <div className="p-10 border-b border-slate-100 last:border-0 bg-white">
     <div className="flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-xl bg-unimax-blue/5 flex items-center justify-center text-unimax-blue shrink-0 shadow-sm">{icon}</div>
        <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-widest">{title}</h4>
     </div>
     {children}
  </div>
);

const Icons = {
  User: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  Map: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5z"/></svg>,
  Truck: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4z"/></svg>,
  Doc: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6z"/></svg>,
  Workflow: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>,
  Check: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>,
  Send: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Star: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>,
  Camera: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>,
  Clip: () => <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.31 2.69 6 6 6s6-2.69 6-6V6h-1.5z"/></svg>,
};

type LeadTabId = 'identificacao' | 'endereco' | 'veiculo' | 'proposta' | 'vistoria' | 'fechamento';

export const LeadModal: React.FC<{
  isOpen: boolean; onClose: () => void; lead: Lead | null; 
  onSave: (l: Partial<Lead>) => void; onDelete: (id: string) => void;
  profile: Profile;
  onViewProposal: (lead: Lead) => void;
  onViewContract: (lead: Lead) => void;
  onViewReport: (lead: Lead) => void;
  onViewRegulation: (lead: Lead) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}> = ({ isOpen, onClose, lead, onSave, showToast, profile, onViewProposal, onViewContract }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [activeTab, setActiveTab] = useState<LeadTabId>('identificacao');
  const [isPlacaLoading, setIsPlacaLoading] = useState(false);
  const [placaNotFound, setPlacaNotFound] = useState(false);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [signMeta, setSignMeta] = useState({ responsavel: '', metodo: 'WhatsApp' as 'Presencial' | 'WhatsApp' | 'E-mail' | 'Outro', observacao: '' });
  const [isFipeHistoryLoading, setIsFipeHistoryLoading] = useState(false);

  const normalizeToWa = (raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    if (!digits) return '';
    // Se já vier com DDI, usa. Caso contrário assume Brasil (+55).
    if (digits.startsWith('55')) return digits;
    // Se tiver 10/11 dígitos, assume DDD+numero
    if (digits.length >= 10) return '55' + digits;
    return '55' + digits; // fallback
  };

  const openWhatsApp = async (rawPhone: string, message: string) => {
    const wa = normalizeToWa(rawPhone);
    if (!wa) {
      showToast('Lead sem WhatsApp/telefone para envio.', 'error');
      return;
    }
    const url = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyToClipboard = async (value: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(okMsg, 'success');
    } catch {
      showToast('Não foi possível copiar automaticamente. Copie manualmente.', 'error');
    }
  };

  const getPublicLink = (view: 'proposal' | 'contract' | 'report' | 'regulation' | 'payment' | 'signature') => {
    const origin = window.location.origin;
    const leadId = (lead?.id || formData.id || '');
    const payload = encodePublicPayload({
      leadId,
      nome: formData.nome || lead?.nome || '',
      documento: formData.documento || lead?.documento || '',
      fone: formData.fone || lead?.fone || '',
      veiculo: formData.veiculo || `${formData.marca || ''} ${formData.modelo || ''}`.trim(),
      placa: formData.placa || lead?.placa || '',
      tipoVeiculo: formData.tipoVeiculo || lead?.tipoVeiculo || '',
      variant: formData.variant || lead?.variant || 1,
      mensalidade: formData.mensalidade || lead?.mensalidade || 0,
      adesao: formData.adesao ?? lead?.adesao ?? 0,
      desconto: formData.desconto || lead?.desconto || 0,
      coberturasAdicionais: formData.coberturasAdicionais || lead?.coberturasAdicionais || [],
      codigoFipe: formData.codigoFipe || (lead as any)?.codigoFipe || '',
      valorFipe: formData.valor || (lead as any)?.valor || 0,
      pix: (profile?.pix || '').trim(),
      consultor: (profile?.nome || '').trim(),
      ts: Date.now(),
    });
    const base = `${origin}/?view=${view}`;
    const qs = `leadId=${encodeURIComponent(leadId)}&payload=${encodeURIComponent(payload)}`;
    return `${base}&${qs}`;
  };

  const handleGerarProposta = () => {
    if (!lead) { showToast('Salve o lead antes de gerar a proposta.', 'error'); return; }
    onViewProposal({ ...(lead as any), ...(formData as any) } as Lead);
  };

  const handleGerarTermoAdesao = () => {
    if (!lead) { showToast('Salve o lead antes de gerar o termo.', 'error'); return; }
    onViewContract({ ...(lead as any), ...(formData as any) } as Lead);
  };

  const handleGerarLinkPagamento = async () => {
    if (!lead) { showToast('Salve o lead antes de gerar link de pagamento.', 'error'); return; }
    const amount = fmtBRL(formData.mensalidade || 0);
    const pix = (profile?.pix || '').trim();
    const nome = (formData.nome || lead?.nome || '').trim();
    const veiculo = (formData.veiculo || `${formData.marca || ''} ${formData.modelo || ''}`.trim()).trim();
    const linkPagamento = getPublicLink('payment');
    const linkProposta = getPublicLink('proposal');
    try { await navigator.clipboard.writeText(linkPagamento); showToast('Link de pagamento copiado.', 'success'); } catch { showToast('Não foi possível copiar o link.'); }
    const msgParts = [
      `Olá, ${nome}! Segue o link para pagamento da sua proteção veicular UnimaxCRM.`,
      veiculo ? `Veículo: ${veiculo}.` : '',
      `Mensalidade: ${amount}.`,
      pix ? `PIX (chave): ${pix}` : 'PIX: (chave a definir).',
      `Pagamento: ${linkPagamento}`,
      `Proposta: ${linkProposta}`,
      `Após o pagamento, me confirme por aqui para liberar as próximas etapas.`
    ].filter(Boolean);
    const updated = { ...formData, pagamentoEnviado: true, paymentLink: linkPagamento, proposalLink: linkProposta };
    setFormData(updated);
    onSave(updated);
    await openWhatsApp(formData.fone || lead?.fone || '', msgParts.join('\n'));
  };

  const handleGerarLinkAssinatura = async () => {
    if (!lead) { showToast('Salve o lead antes de gerar link de assinatura.', 'error'); return; }
    const nome = (formData.nome || lead?.nome || '').trim();
    const linkAssinatura = getPublicLink('signature');
    const linkTermo = getPublicLink('contract');
    const codigo = String((lead?.id || formData.id || '')).slice(-6).toUpperCase();
    try { await navigator.clipboard.writeText(linkAssinatura); showToast('Link de assinatura copiado.', 'success'); } catch { showToast('Não foi possível copiar o link.'); }
    const msgParts = [
      `Olá, ${nome}! Segue o link de assinatura digital (simplificada) UnimaxCRM:`,
      linkAssinatura,
      '',
      `Termo de adesão (visualização):`,
      linkTermo,
      '',
      `Se preferir, você também pode confirmar respondendo:`,
      `"ACEITO ${codigo} - ${nome} - CPF/CNPJ: ______"`
    ];
    const updated = { ...formData, assinaturaEnviada: true, signatureLink: linkAssinatura, termoAdesaoLink: linkTermo };
    setFormData(updated);
    onSave(updated);
    await openWhatsApp(formData.fone || lead?.fone || '', msgParts.join('\n'));
  };


  useEffect(() => {
    if (isOpen) {
      setFormData(lead || { 
        status: 'novo', 
        variant: 1,
        tipoPessoa: 'PF',
        attachments: [],
        coberturasAdicionais: [],
        valor: 0,
        adesao: 350,
        desconto: 0,
        tipoVeiculo: '',
        veiculoTrabalho: false,
        vistoriaLiberada: false,
        vistoriaConcluida: false,
        assinaturaEnviada: false,
        assinaturaConcluida: false,
        assinaturaResponsavel: '',
        assinaturaMetodo: 'WhatsApp',
        assinaturaObservacao: '',
        pagamentoEnviado: false,
        pagamentoConcluido: false,
        tipoImplemento: 'NENHUM',
        valorImplemento: 0,
        canal: 'LEAD DIRETO'
      });
      setActiveTab('identificacao');
    }
  }, [isOpen, lead]);

  useEffect(() => {
    if (formData.valor !== undefined && formData.tipoVeiculo) {
      const novaMensal = calcMensalByPlano(
        (formData.valor || 0) + (formData.valorImplemento || 0), 
        formData.tipoVeiculo as TipoVeiculo, 
        formData.variant || 1,
        formData.coberturasAdicionais || [], 
        formData.desconto || 0
      );
      if (novaMensal !== formData.mensalidade) {
        setFormData(prev => ({ ...prev, mensalidade: novaMensal }));
      }
    }
  }, [formData.valor, formData.valorImplemento, formData.tipoVeiculo, formData.variant, formData.coberturasAdicionais, formData.desconto]);

  const handlePlacaSearch = async (placa: string) => {
    const p = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!formData.tipoVeiculo) {
      showToast("Selecione a categoria antes de digitar a placa!", "error");
      return;
    }
    setFormData(prev => ({ ...prev, placa: p }));
    if (p.length === 7) {
      setIsPlacaLoading(true);
      try {
        const res = await fetch('/api/placa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placa: p })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message || 'Falha ao consultar placa');
        }

        const vehicleData = {
          marca: data.marca,
          modelo: data.modelo,
          anoFabricacao: String(data.anoFabricacao || ''),
          anoModelo: String(data.anoModelo || ''),
          cor: data.cor,
          combustivel: data.combustivel,
          valor: Number(data.valor || 0),
          codigoFipe: data.codigoFipe,
          renavam: data.renavam || '',
          chassi: data.chassi || '',
        };

        setFormData(prev => ({
          ...prev,
          ...vehicleData,
          veiculo: `${vehicleData.marca} ${vehicleData.modelo}`
        }));
        setPlacaNotFound(false);
        showToast('Órbis Scanner: FIPE carregada e mensalidade recalculada!', 'success');

        // Carrega histórico FIPE (argumento comercial) sem travar o fluxo
        if (vehicleData.codigoFipe) {
          void loadFipeHistory(vehicleData.codigoFipe, true);
        }
      } catch (err: any) {
        // Libera preenchimento manual quando não encontra dados
        setPlacaNotFound(true);
        showToast(err?.message || 'Não foi possível consultar a placa. Verifique e tente novamente.', 'error');
      } finally {
        setIsPlacaLoading(false);
      }
    }
  };

  const toggleArchive = () => {
    const next = !(formData.archived || lead?.archived);
    setFormData(prev => ({ ...prev, archived: next }));
    onSave({ id: (lead as any)?.id, archived: next } as any);
    showToast(next ? 'NEGOCIAÇÃO ARQUIVADA' : 'NEGOCIAÇÃO RESTAURADA', 'success');
    onClose();
  };

  const loadFipeHistory = async (codigoFipe: string, force: boolean = false) => {
    const now = Date.now();
    const last = Number(formData.fipeHistoryUpdatedAt || 0);
    const has = Array.isArray(formData.fipeHistory) && (formData.fipeHistory?.length || 0) > 1;

    // Atualiza no máximo 1x a cada 7 dias, salvo force
    if (!force && has && last && (now - last) < (7 * 24 * 60 * 60 * 1000)) return;

    setIsFipeHistoryLoading(true);
    try {
      const res = await fetch(`/api/fipe/historico?codigoFipe=${encodeURIComponent(codigoFipe)}&meses=6`);
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) throw new Error(data?.message || 'Falha ao obter histórico FIPE');

      const series = Array.isArray(data.series) ? data.series : [];
      const points = series
        .filter((p: any) => typeof p?.valor === 'number')
        .map((p: any) => ({
          tabela: Number(p.tabela),
          mesReferencia: String(p.mesReferencia || p.mesTabela || ''),
          valor: Number(p.valor),
          valorFormatado: String(p.valorFormatado || ''),
          mesTabela: String(p.mesTabela || ''),
          dataConsulta: String(p.dataConsulta || '')
        }));

      setFormData(prev => ({
        ...prev,
        fipeHistory: points,
        fipeHistoryUpdatedAt: Number(data.updatedAt || Date.now())
      }));
      showToast('Histórico FIPE atualizado.', 'info');
    } catch (e: any) {
      showToast(e?.message || 'Não foi possível obter o histórico FIPE.', 'error');
    } finally {
      setIsFipeHistoryLoading(false);
    }
  };

  const handleCepSearch = async (cep: string) => {
    const c = cep.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, cep: c }));
    if (c.length === 8) {
      setIsCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${c}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({ 
            ...prev, 
            endereco: data.logradouro, 
            bairro: data.bairro, 
            cidade: data.localidade, 
            uf: data.uf 
          }));
          showToast("Endereço Localizado!", "success");
        }
      } catch (err) {} finally { setIsCepLoading(false); }
    }
  };

  const toggleAdicional = (id: string) => {
    const current = formData.coberturasAdicionais || [];
    const next = current.includes(id) 
      ? current.filter(x => x !== id)
      : [...current, id];
    setFormData({ ...formData, coberturasAdicionais: next });
  };

  const handleAddAttachment = (type: 'doc' | 'photo') => {
    const name = type === 'doc' ? 'Documento_' + generateUID().toUpperCase() : 'Foto_' + generateUID().toUpperCase();
    const newAttach: Attachment = {
      id: generateUID(),
      name,
      type,
      ts: Date.now()
    };
    setFormData(prev => ({ ...prev, attachments: [...(prev.attachments || []), newAttach] }));
    showToast(`Anexo ${type.toUpperCase()} adicionado!`, 'success');
  };

  const handleRemoveAttachment = (id: string) => {
    setFormData(prev => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.id !== id) }));
    showToast('Anexo removido.', 'info');
  };


const openSignatureModal = () => {
  // Prefill from existing fields (if any)
  setSignMeta({
    responsavel: (formData.assinaturaResponsavel as string) || '',
    metodo: ((formData.assinaturaMetodo as any) || 'WhatsApp'),
    observacao: (formData.assinaturaObservacao as string) || '',
  });
  setIsSignModalOpen(true);
};

const confirmSignature = () => {
  const responsavel = (signMeta.responsavel || '').trim();
  if (!responsavel) {
    showToast('Informe o responsável pela assinatura.', 'error');
    return;
  }
  setFormData(prev => ({
    ...prev,
    assinaturaConcluida: true,
    assinaturaConcluidaAt: Date.now(),
    assinaturaResponsavel: responsavel,
    assinaturaMetodo: signMeta.metodo,
    assinaturaObservacao: (signMeta.observacao || '').trim(),
  }));
  showToast('ASSINATURA REGISTRADA', 'success');
  setIsSignModalOpen(false);
};

  const triggerWorkflowAction = (action: 'pay_link' | 'pay_done' | 'sign_link' | 'sign_done' | 'inspection_link' | 'inspection_done') => {
    const updates: Partial<Lead> = {};
    let toastMsg = "";

    switch(action) {
      case 'pay_link':
        updates.pagamentoEnviado = true;
        toastMsg = "LINK DE PAGAMENTO ENVIADO";
        break;
      case 'pay_done':
        updates.pagamentoConcluido = true;
        toastMsg = "PAGAMENTO CONCLUIDO";
        break;
      case 'sign_link':
        updates.assinaturaEnviada = true;
        toastMsg = "LINK DE ASSINATURA ENVIADO";
        break;
      case 'sign_done':
        // Assinatura digital simplificada (metadados)
        openSignatureModal();
        return;
      case 'inspection_link':
        updates.vistoriaLiberada = true;
        updates.vistoriaLinkEnviado = true;
        updates.linkVistoria = `https://unimax.orbis/v/${generateUID()}`;
        toastMsg = "VISTORIA ÓRBIS LIBERADA";
        break;
      case 'inspection_done':
        updates.vistoriaConcluida = true;
        updates.vistoriaConcluidaAt = Date.now();
        toastMsg = "VISTORIA CONCLUÍDA";
        break;
    }

    setFormData(prev => ({ ...prev, ...updates }));
    showToast(toastMsg, action.includes('done') ? 'success' : 'info');
  };

  const comercialBreakdown = useMemo(() => {
    const variant = formData.variant || 1;
    const cat = formData.tipoVeiculo as TipoVeiculo;
    const valorFipe = (formData.valor || 0) + (formData.valorImplemento || 0);
    
    const tabela = getTabelaParaCategoria(cat);
    let faixa = tabela.find(f => valorFipe <= f.max);
    if (!faixa) faixa = tabela[tabela.length - 1];
    
    let basePrice = 0;
    if (faixa) {
      const baseBronze = Number((faixa as any).p1 || 0);
      const plano = (PLANOS as any)[variant] || (PLANOS as any)[1];
      basePrice = baseBronze * Number(plano?.fatorMensal ?? 1);
    }

    const totalAdicionais = (formData.coberturasAdicionais || []).reduce((acc, id) => {
      const item = COBERTURAS_ADICIONAIS.find(c => c.id === id);
      return acc + (item?.preco || 0);
    }, 0);

    const plano = (PLANOS as any)[variant] || (PLANOS as any)[1];

    return { basePrice, totalAdicionais, name: plano.label, reboque: plano.reboque, terceiros: plano.terceiros, cotaPerc: plano.cotaPerc };
  }, [formData.variant, formData.tipoVeiculo, formData.valor, formData.valorImplemento, formData.coberturasAdicionais]);

  const fipeStats = useMemo(() => {
    const hist = Array.isArray(formData.fipeHistory) ? formData.fipeHistory : [];
    if (hist.length < 2) {
      return { has: false, last: 0, prev: 0, first: 0, var1m: 0, var6m: 0 };
    }
    const sorted = [...hist].sort((a: any, b: any) => (a.tabela || 0) - (b.tabela || 0));
    const first = Number(sorted[0]?.valor || 0);
    const last = Number(sorted[sorted.length - 1]?.valor || 0);
    const prev = Number(sorted[sorted.length - 2]?.valor || 0);
    const var1m = prev > 0 ? ((last - prev) / prev) * 100 : 0;
    const var6m = first > 0 ? ((last - first) / first) * 100 : 0;
    return { has: true, last, prev, first, var1m, var6m, sorted };
  }, [formData.fipeHistory]);

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-[13px] font-bold text-slate-800 outline-none focus:border-unimax-blue transition-all focus:bg-white";
  const labelClass = "text-[10px] text-slate-400 uppercase tracking-widest font-black mb-2 block";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={lead ? `REGISTRO: ${lead.nome}` : 'CADASTRAR NOVO LEAD'}
        rightActions={lead ? (
          <button
            type="button"
            onClick={toggleArchive}
            className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${((formData.archived || lead?.archived) ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-amber-500 text-white hover:brightness-110')} `}
            title={((formData.archived || lead?.archived) ? 'Desarquivar negociação' : 'Arquivar negociação')}
          >
            {((formData.archived || lead?.archived) ? 'DESARQUIVAR' : 'ARQUIVAR')}
          </button>
        ) : null}
      >
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden bg-slate-50/50">
        <div className="w-full lg:w-72 bg-white border-r border-slate-100 flex lg:flex-col p-6 gap-2.5 overflow-x-auto shrink-0">
           {(['identificacao', 'endereco', 'veiculo', 'proposta', 'vistoria', 'fechamento'] as LeadTabId[]).map(id => (
             <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-4 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === id ? 'bg-unimax-blue text-white shadow-xl' : 'text-slate-400 hover:bg-slate-50'}`}>
               {id === 'veiculo' ? <Icons.Truck /> : id === 'endereco' ? <Icons.Map /> : id === 'fechamento' ? <Icons.Workflow /> : id === 'proposta' ? <Icons.Doc /> : id === 'vistoria' ? <Icons.Camera /> : <Icons.User />}
               {id === 'fechamento' ? 'Workflow' : id}
             </button>
           ))}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {activeTab === 'identificacao' && (
            <FormSection title="Dados Pessoais" icon={<Icons.User />}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 md:col-span-3">
                   <label className={labelClass}>Tipo de Pessoa</label>
                   <select className={inputClass} value={formData.tipoPessoa} onChange={e => setFormData({...formData, tipoPessoa: e.target.value as 'PF' | 'PJ'})}>
                      <option value="PF">Pessoa Física</option>
                      <option value="PJ">Pessoa Jurídica</option>
                   </select>
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className={labelClass}>Documento (CPF/CNPJ)</label>
                  <input className={inputClass} value={formData.documento || ''} onChange={e => setFormData({...formData, documento: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-6">
                  <label className={labelClass}>Nome Completo / Razão Social</label>
                  <input className={inputClass} value={formData.nome || ''} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: João da Silva" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className={labelClass}>WhatsApp / Celular</label>
                  <input className={inputClass} value={formData.fone || ''} onChange={e => setFormData({...formData, fone: e.target.value})} placeholder="(00) 00000-0000" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className={labelClass}>E-mail</label>
                  <input className={inputClass} value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@exemplo.com" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className={labelClass}>Fonte / Origem do lead</label>
                  <select
                    className={inputClass}
                    value={(formData.canal as string) || 'LEAD DIRETO'}
                    onChange={e => setFormData({ ...formData, canal: e.target.value })}
                  >
                    <option value="LEAD DIRETO">Lead direto</option>
                    <option value="INDICACAO">Indicação</option>
                    <option value="GOOGLE">Google</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="PARCEIRO">Parceiro</option>
                    <option value="REDE AQUI">Rede Aqui</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>
            </FormSection>
          )}

          {activeTab === 'endereco' && (
            <FormSection title="Localização" icon={<Icons.Map />}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 md:col-span-2 relative">
                  <label className={labelClass}>CEP</label>
                  <input className={inputClass} value={formData.cep || ''} onChange={e => handleCepSearch(e.target.value)} maxLength={8} placeholder="00000000" />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className={labelClass}>Logradouro</label>
                  <input className={inputClass} value={formData.endereco || ''} onChange={e => setFormData({...formData, endereco: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <label className={labelClass}>Nº</label>
                  <input className={inputClass} value={formData.numero || ''} onChange={e => setFormData({...formData, numero: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className={labelClass}>Bairro</label>
                  <input className={inputClass} value={formData.bairro || ''} onChange={e => setFormData({...formData, bairro: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-3">
                  <label className={labelClass}>Cidade</label>
                  <input className={inputClass} value={formData.cidade || ''} onChange={e => setFormData({...formData, cidade: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-1">
                  <label className={labelClass}>UF</label>
                  <input className={inputClass} value={formData.uf || ''} onChange={e => setFormData({...formData, uf: e.target.value})} />
                </div>
              </div>
            </FormSection>
          )}

          {activeTab === 'veiculo' && (
            <FormSection title="Dados Técnicos (Órbis v2.0)" icon={<Icons.Truck />}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label className={labelClass}>1. Categoria</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {CATEGORIAS_VEICULOS.map(cat => (
                      <button key={cat.id} onClick={() => setFormData({...formData, tipoVeiculo: cat.id as TipoVeiculo})} className={`p-4 rounded-2xl border text-[10px] font-black uppercase transition-all ${formData.tipoVeiculo === cat.id ? 'bg-unimax-blue text-white border-unimax-blue shadow-lg' : 'bg-white border-slate-200 text-slate-400'}`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className={labelClass}>2. Placa</label>
                  <input 
                    className={`${inputClass} uppercase tracking-widest text-lg font-black ${!formData.tipoVeiculo ? 'opacity-30' : 'bg-unimax-blue/5'}`} 
                    value={formData.placa || ''} onChange={e => handlePlacaSearch(e.target.value)} maxLength={7} disabled={!formData.tipoVeiculo}
                  />
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className={labelClass}>Marca / Modelo</label>
                  <input
                    className={inputClass}
                    value={formData.veiculo || ''}
                    readOnly={!placaNotFound}
                    onChange={e => {
                      const v = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        veiculo: v,
                        // mantém marca/modelo livres para preenchimento manual futuro (sem quebrar compat)
                        marca: prev.marca || '',
                        modelo: prev.modelo || ''
                      }));
                    }}
                    placeholder={placaNotFound ? 'Digite Marca e Modelo manualmente' : 'Aguardando scanner...'}
                  />
                  {placaNotFound ? (
                    <p className="mt-2 text-[10px] font-bold text-amber-600">
                      Scanner não encontrou a placa. Preencha Marca/Modelo e Ano manualmente e continue.
                    </p>
                  ) : null}
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className={labelClass}>Renavam</label>
                  <input className={inputClass} value={formData.renavam || ''} onChange={e => setFormData({...formData, renavam: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-2">
                  <label className={labelClass}>Chassi</label>
                  <input className={inputClass} value={formData.chassi || ''} onChange={e => setFormData({...formData, chassi: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-2">
                   <label className={labelClass}>Cor</label>
                   <input className={inputClass} value={formData.cor || ''} onChange={e => setFormData({...formData, cor: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-2">
                   <label className={labelClass}>Ano Fabr.</label>
                   <input className={inputClass} value={formData.anoFabricacao || ''} onChange={e => setFormData({...formData, anoFabricacao: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-2">
                   <label className={labelClass}>Ano Modelo</label>
                   <input className={inputClass} value={formData.anoModelo || ''} onChange={e => setFormData({...formData, anoModelo: e.target.value})} />
                </div>
                <div className="col-span-6 md:col-span-2">
                   <label className={labelClass}>Valor FIPE</label>
                   <input className={inputClass} type="number" value={formData.valor || 0} onChange={e => setFormData({...formData, valor: Number(e.target.value)})} />
                </div>

                <div className="col-span-6">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Histórico FIPE</span>
                        <span className="text-[11px] font-bold text-slate-700 mt-1">
                          {formData.codigoFipe ? `Código FIPE: ${formData.codigoFipe}` : 'Preencha a placa para obter o código FIPE'}
                        </span>
                        {formData.fipeHistoryUpdatedAt ? (
                          <span className="text-[10px] text-slate-400 mt-1">Atualizado em {fmtDateTimeBR(formData.fipeHistoryUpdatedAt)}</span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => formData.codigoFipe && void loadFipeHistory(String(formData.codigoFipe), true)}
                          disabled={!formData.codigoFipe || isFipeHistoryLoading}
                          className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${(!formData.codigoFipe || isFipeHistoryLoading) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-unimax-blue text-white hover:brightness-110 shadow-lg'}`}
                        >
                          {isFipeHistoryLoading ? 'Atualizando...' : 'Atualizar FIPE'}
                        </button>
                      </div>
                    </div>

                    {fipeStats.has ? (
                      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Último valor</p>
                          <p className="text-[16px] font-black text-slate-800 mt-2">{fmtBRL(fipeStats.last)}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-1">Variação 1 mês: {fmtPct(fipeStats.var1m)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Variação (janela)</p>
                          <p className="text-[16px] font-black text-slate-800 mt-2">{fmtPct(fipeStats.var6m)}</p>
                          <p className="text-[10px] font-bold text-slate-500 mt-1">Comparação: {fmtBRL(fipeStats.first)} → {fmtBRL(fipeStats.last)}</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-slate-200 p-5">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Argumento comercial</p>
                          <p className="text-[11px] font-bold text-slate-700 mt-2 leading-relaxed">
                            {fipeStats.var6m >= 0
                              ? `Seu veículo valorizou ${fmtPct(fipeStats.var6m)} no período. A proteção acompanha essa referência e evita surpresa no bolso em caso de perda total.`
                              : `Mesmo com desvalorização de ${fmtPct(Math.abs(fipeStats.var6m))}, a FIPE continua sendo a referência objetiva para indenização. Você garante previsibilidade e segurança.`}
                          </p>
                        </div>

                        <div className="lg:col-span-3">
                          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left">
                              <thead className="bg-slate-50">
                                <tr>
                                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Mês</th>
                                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Valor</th>
                                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Tabela</th>
                                </tr>
                              </thead>
                              <tbody>
                                {fipeStats.sorted.map((p: any) => (
                                  <tr key={String(p.tabela)} className="border-t border-slate-100">
                                    <td className="p-4 text-[11px] font-bold text-slate-700">{p.mesReferencia || p.mesTabela}</td>
                                    <td className="p-4 text-[11px] font-black text-slate-800">{fmtBRL(Number(p.valor || 0))}</td>
                                    <td className="p-4 text-[11px] font-bold text-slate-500">{p.tabela}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5 text-[11px] font-bold text-slate-500">
                        {formData.codigoFipe ? 'Clique em “Atualizar FIPE” para carregar o histórico (últimos meses).' : 'O histórico FIPE aparece automaticamente após a consulta de placa.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </FormSection>
          )}

          {activeTab === 'proposta' && (
            <FormSection title="Configuração da Proposta" icon={<Icons.Doc />}>
              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-8 space-y-10">
                  <div>
                    <label className={labelClass}>1. Nível de Proteção</label>
                    <div className="grid grid-cols-3 gap-4">
                       {PLANOS_LIST.map((p: any) => (
                         <button 
                          key={p.id}
                          onClick={() => setFormData({...formData, variant: p.id})}
                          className={`p-6 rounded-2xl border text-left transition-all ${formData.variant === p.id ? 'bg-unimax-blue border-unimax-blue text-white shadow-xl' : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-white'}`}
                         >
                           <p className="text-[12px] font-black uppercase tracking-widest">{p.label}</p>
                           <p className={`text-[9px] font-bold mt-1 ${formData.variant === p.id ? 'text-cyan-300' : 'text-slate-400'}`}>{p.tag}</p>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>2. Coberturas Adicionais</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       {COBERTURAS_ADICIONAIS.map(ad => (
                         <button 
                          key={ad.id}
                          onClick={() => toggleAdicional(ad.id)}
                          className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${formData.coberturasAdicionais?.includes(ad.id) ? 'bg-cyan-50 border-cyan-200 text-cyan-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                         >
                           <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-tight">{ad.label}</span>
                              <span className="text-[9px] font-bold opacity-60">+{fmtBRL(ad.preco)}/mês</span>
                           </div>
                           {formData.coberturasAdicionais?.includes(ad.id) && <Icons.Check />}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                       <label className={labelClass}>Taxa de Adesão (R$)</label>
                       <input 
                         type="number" 
                         className={inputClass} 
                         value={formData.adesao || ''} 
                         onChange={e => setFormData({...formData, adesao: Number(e.target.value)})} 
                       />
                    </div>
                    <div>
                       <label className={labelClass}>Desconto Comercial (%)</label>
                       <input 
                         type="number" 
                         className={inputClass} 
                         value={formData.desconto || ''} 
                         onChange={e => setFormData({...formData, desconto: Number(e.target.value)})} 
                         max={100}
                       />
                    </div>
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-4">
                   <div className="bg-[#0f172a] rounded-[2.5rem] p-8 text-white sticky top-0 shadow-2xl overflow-hidden border border-white/5">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-8 flex items-center gap-2">
                        <Icons.Star />
                        Resumo Comercial
                      </h5>
                      
                      <div className="space-y-5">
                         <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Preço Base (FIPE)</span>
                            <span className="text-[11px] font-black text-white">{fmtBRL(comercialBreakdown.basePrice)}</span>
                         </div>
                         <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Soma Adicionais</span>
                            <span className="text-[11px] font-black text-white">+{fmtBRL(comercialBreakdown.totalAdicionais)}</span>
                         </div>
                         {formData.desconto ? (
                           <div className="flex justify-between items-center border-b border-white/5 pb-3">
                              <span className="text-[10px] font-bold text-rose-400 uppercase">Desconto ({formData.desconto}%)</span>
                              <span className="text-[11px] font-black text-rose-400">-{fmtBRL((comercialBreakdown.basePrice + comercialBreakdown.totalAdicionais) * (formData.desconto / 100))}</span>
                           </div>
                         ) : null}
                         <div className="flex justify-between items-center border-b border-white/5 pb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Plano</span>
                            <span className="text-[11px] font-black text-cyan-400">{comercialBreakdown.name}</span>
                         </div>
                      </div>

                      

                      <div className="mt-2 grid grid-cols-1 gap-2">
                        <button type="button" onClick={handleGerarProposta} className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                          GERAR PROPOSTA
                        </button>
                        <button type="button" onClick={handleGerarTermoAdesao} className="w-full px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                          GERAR TERMO DE ADESÃO
                        </button>
                        <button type="button" onClick={handleGerarLinkPagamento} className="w-full px-4 py-3 rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                          GERAR LINK DE PAGAMENTO
                        </button>
                        <button type="button" onClick={handleGerarLinkAssinatura} className="w-full px-4 py-3 rounded-2xl bg-cyan-500/80 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest transition-all">
                          GERAR LINK ASSINATURA DIGITAL
                        </button>
                      </div>
<div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center text-center">
                         <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2">Mensalidade Final</span>
                         <span className="text-4xl font-black italic tracking-tighter text-white">{fmtBRL(formData.mensalidade || 0)}</span>
                         <p className="text-[9px] font-bold text-slate-500 uppercase mt-4">Auditado em tempo real</p>
                      </div>

                      <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Assinatura</p>
                        {formData.assinaturaConcluida ? (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                              <span className="text-[10px] font-black text-emerald-300 uppercase">Concluída</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Assinado por</span>
                              <span className="text-[10px] font-black text-white uppercase truncate max-w-[55%] text-right">{(formData.assinaturaResponsavel as string) || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Método</span>
                              <span className="text-[10px] font-black text-white uppercase">{(formData.assinaturaMetodo as string) || '---'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Data/Hora</span>
                              <span className="text-[10px] font-black text-white uppercase">{fmtDateTimeBR(formData.assinaturaConcluidaAt as number)}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                            <span className="text-[10px] font-black text-slate-300 uppercase">Pendente</span>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            </FormSection>
          )}

          {activeTab === 'vistoria' && (
            <FormSection title="Inspeção Órbis & Anexos" icon={<Icons.Camera />}>
              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 lg:col-span-7 space-y-10">
                   {/* Controle de Vistoria Digital */}
                   <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-unimax-blue/10 text-unimax-blue flex items-center justify-center">
                               <Icons.Workflow />
                            </div>
                            <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Fluxo Órbis Digital</h5>
                         </div>
                         {formData.vistoriaConcluida ? (
                           <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">CONCLUÍDA</span>
                         ) : (
                           <span className="bg-slate-200 text-slate-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">PENDENTE</span>
                         )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => triggerWorkflowAction('inspection_link')}
                          className={`p-5 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${formData.vistoriaLiberada ? 'bg-unimax-blue text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-unimax-blue'}`}
                        >
                          <span>{formData.vistoriaLiberada ? 'Vistoria Liberada' : 'Liberar Vistoria'}</span>
                          {formData.vistoriaLiberada ? <Icons.Check /> : <Icons.Send />}
                        </button>
                        <button 
                          disabled={!formData.vistoriaLiberada}
                          onClick={() => triggerWorkflowAction('inspection_done')}
                          className={`p-5 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${formData.vistoriaConcluida ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-500 disabled:opacity-50'}`}
                        >
                          <span>Marcar Concluída</span>
                          {formData.vistoriaConcluida ? <Icons.Check /> : <Icons.Camera />}
                        </button>
                      </div>

                      {formData.vistoriaLiberada && (
                        <div className="mt-6 p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                           <div className="min-w-0">
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Link de Inspeção</p>
                              <p className="text-[11px] font-bold text-unimax-blue truncate">{formData.linkVistoria}</p>
                           </div>
                           <button onClick={() => { navigator.clipboard.writeText(formData.linkVistoria || ''); showToast('Link copiado!'); }} className="p-2 hover:bg-slate-50 text-slate-400 transition-colors">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                           </button>
                        </div>
                      )}
                   </div>

                   {/* Gestor de Anexos */}
                   <div>
                      <div className="flex items-center justify-between mb-6">
                         <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Anexos e Documentos</h5>
                         <div className="flex gap-2">
                            <button onClick={() => handleAddAttachment('doc')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                               <Icons.Clip /> + DOC
                            </button>
                            <button onClick={() => handleAddAttachment('photo')} className="bg-unimax-blue text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                               <Icons.Camera /> + FOTO
                            </button>
                         </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {(formData.attachments || []).map(at => (
                           <div key={at.id} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center justify-between group hover:border-unimax-blue transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${at.type === 'doc' ? 'bg-slate-100 text-slate-500' : 'bg-cyan-50 text-cyan-600'}`}>
                                    {at.type === 'doc' ? <Icons.Doc /> : <Icons.Camera />}
                                 </div>
                                 <div className="min-w-0">
                                    <p className="text-[11px] font-black text-slate-800 uppercase truncate">{at.name}</p>
                                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(at.ts).toLocaleDateString()}</p>
                                 </div>
                              </div>
                              <button onClick={() => handleRemoveAttachment(at.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                              </button>
                           </div>
                         ))}
                         {(formData.attachments || []).length === 0 && (
                           <div className="col-span-2 py-20 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center opacity-30">
                              <Icons.Clip />
                              <p className="text-[10px] font-black uppercase tracking-widest mt-4">Nenhum anexo enviado</p>
                           </div>
                         )}
                      </div>
                   </div>
                </div>

                <div className="col-span-12 lg:col-span-5">
                   <div className="bg-[#1e293b] rounded-[2.5rem] p-10 text-white shadow-2xl border border-white/5">
                      <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-8">Auditoria de Vistoria</h5>
                      
                      <div className="space-y-6">
                         {[
                           { label: 'Documentação do Veículo', status: (formData.attachments || []).some(a => a.type === 'doc') ? 'OK' : 'PENDENTE' },
                           { label: 'Fotos do Veículo (Geral)', status: (formData.attachments || []).filter(a => a.type === 'photo').length >= 4 ? 'OK' : 'PENDENTE' },
                           { label: 'Fotos do Interior', status: (formData.attachments || []).filter(a => a.type === 'photo').length >= 2 ? 'OK' : 'PENDENTE' },
                           { label: 'Órbis AI Scanner', status: formData.vistoriaConcluida ? 'PROCESSADO' : 'AGUARDANDO' }
                         ].map((item, idx) => (
                           <div key={idx} className="flex justify-between items-center border-b border-white/5 pb-4">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</span>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${item.status.includes('OK') || item.status === 'PROCESSADO' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {item.status}
                              </span>
                           </div>
                         ))}
                      </div>

                      <div className="mt-12 bg-white/5 p-6 rounded-2xl border border-white/5">
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Requisitos Órbis</p>
                         <ul className="space-y-2">
                            <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                               <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                               CNH Legível (Frente e Verso)
                            </li>
                            <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                               <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                               CRLV Atualizado
                            </li>
                            <li className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                               <div className="w-1 h-1 rounded-full bg-cyan-400"></div>
                               Fotos nítidas (Frente, Traseira, Laterais)
                            </li>
                         </ul>
                      </div>
                   </div>
                </div>
              </div>
            </FormSection>
          )}

          {activeTab === 'fechamento' && (
            <FormSection title="Workflow de Fechamento" icon={<Icons.Workflow />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    </div>
                    <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Etapa 1: Faturamento</h5>
                  </div>
                  <button onClick={() => triggerWorkflowAction('pay_link')} className={`w-full p-4 rounded-xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${formData.pagamentoEnviado ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-600'}`}>
                    <span>Link de Pagamento</span>
                    {formData.pagamentoEnviado ? <Icons.Check /> : <Icons.Send />}
                  </button>
                  <button disabled={!formData.pagamentoEnviado} onClick={() => triggerWorkflowAction('pay_done')} className={`w-full p-4 rounded-xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${formData.pagamentoConcluido ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-500'}`}>
                    <span>Pagamento Confirmado</span>
                    {formData.pagamentoConcluido ? <Icons.Check /> : <Icons.Doc />}
                  </button>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200 flex flex-col gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-unimax-cyan/10 text-unimax-cyan flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </div>
                    <h5 className="text-[11px] font-black uppercase text-slate-800 tracking-widest">Etapa 2: Assinatura</h5>
                  </div>
                  <button disabled={!formData.pagamentoConcluido} onClick={() => triggerWorkflowAction('sign_link')} className={`w-full p-4 rounded-xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${formData.assinaturaEnviada ? 'bg-unimax-cyan text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-unimax-cyan'}`}>
                    <span>Link de Assinatura</span>
                    {formData.assinaturaEnviada ? <Icons.Check /> : <Icons.Send />}
                  </button>
                  <button disabled={!formData.assinaturaEnviada} onClick={() => triggerWorkflowAction('sign_done')} className={`w-full p-4 rounded-xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest transition-all ${formData.assinaturaConcluida ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:border-emerald-500'}`}>
                    <span>Contrato Assinado</span>
                    {formData.assinaturaConcluida ? <Icons.Check /> : <Icons.Doc />}
                  </button>
                </div>
              </div>
            </FormSection>
          )}

          <div className="p-8 border-t bg-white flex justify-end gap-3 sticky bottom-0 z-30">
            <button onClick={onClose} className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
            <button onClick={() => onSave(formData)} className="px-12 py-4 bg-unimax-emerald text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all">Salvar Registro</button>
          </div>
        </div>
      </div>
    </Modal>

      <Modal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title="Assinatura Digital (Simplificada)"
      >
        <div className="p-10">
          <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
            <p className="text-slate-600 text-sm leading-relaxed">
              Registre os metadados da assinatura. A data/hora será salva automaticamente no momento da confirmação.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <label className={labelClass}>Responsável</label>
                <input
                  className={inputClass}
                  value={signMeta.responsavel}
                  onChange={e => setSignMeta(prev => ({ ...prev, responsavel: e.target.value }))}
                  placeholder="Ex.: Gabriel / Regional SP / Atendente"
                />
              </div>

              <div>
                <label className={labelClass}>Método</label>
                <select
                  className={inputClass}
                  value={signMeta.metodo}
                  onChange={e => setSignMeta(prev => ({ ...prev, metodo: e.target.value as any }))}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Observação (opcional)</label>
                <textarea
                  className={inputClass}
                  value={signMeta.observacao}
                  onChange={e => setSignMeta(prev => ({ ...prev, observacao: e.target.value }))}
                  placeholder="Ex.: assinado via link, confirmado pelo cliente no WhatsApp, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setIsSignModalOpen(false)}
                className="px-8 py-4 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSignature}
                className="px-12 py-4 bg-unimax-emerald text-white rounded-2xl text-[10px] font-black uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Confirmar Assinatura
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </>
  );
};

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; profile: Profile; onSave: (p: Profile) => void; }> = ({ isOpen, onClose, profile, onSave }) => {
  const [formData, setFormData] = useState<Profile>(profile);
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Perfil do Consultor">
      <div className="p-12 space-y-8 max-w-2xl mx-auto">
        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">Nome de Exibição</label>
          <input className="w-full bg-slate-50 border p-5 rounded-2xl font-bold text-lg" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
        </div>
        <div>
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">Chave PIX</label>
          <input className="w-full bg-slate-50 border p-5 rounded-2xl font-bold" value={formData.pix} onChange={e => setFormData({...formData, pix: e.target.value})} />
        </div>
        <button onClick={() => onSave(formData)} className="w-full bg-unimax-blue text-white py-5 rounded-2xl font-black uppercase text-[11px] shadow-xl hover:brightness-110">Salvar Alterações</button>
      </div>
    </Modal>
  );
};

export const WithdrawModal: React.FC<{ isOpen: boolean; onClose: () => void; saldo: number; pix: string; onConfirm: (v: number) => void; }> = ({ isOpen, onClose, saldo, pix, onConfirm }) => {
  const [valor, setValor] = useState(0);
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Resgate de Comissões">
      <div className="p-12 text-center space-y-8">
        <div className="w-20 h-20 bg-unimax-emerald/10 text-unimax-emerald rounded-3xl flex items-center justify-center mx-auto">
           <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Disponível para Resgate</p>
          <p className="text-4xl font-black text-slate-800">{fmtBRL(saldo)}</p>
        </div>
        <div className="max-w-xs mx-auto">
          <label className="text-[10px] text-slate-400 font-black uppercase mb-2 block">Quanto deseja sacar?</label>
          <input type="number" className="w-full bg-slate-50 border p-6 rounded-3xl text-center text-3xl font-black focus:ring-4 focus:ring-unimax-emerald/10" value={valor || ''} onChange={e => setValor(Math.min(Number(e.target.value), saldo))} placeholder="0,00" />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">Destino: PIX {pix}</p>
        <div className="flex gap-4">
           <button onClick={onClose} className="flex-1 py-4 text-[11px] font-black uppercase text-slate-400">Cancelar</button>
           <button onClick={() => onConfirm(valor)} className="flex-1 bg-unimax-emerald text-white py-4 rounded-2xl font-black uppercase text-[11px] shadow-xl">Confirmar Transferência</button>
        </div>
      </div>
    </Modal>
  );
};