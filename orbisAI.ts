// UnimaxCRM (Gemini) — helper único para chat + análise do funil.
// 100% client-side (Vite) usando env GEMINI_API_KEY (ver vite.config.ts).

import { GoogleGenAI } from '@google/genai';
import type { ChatMessage, Lead, Profile, Transaction } from './types';

type GenAIContent = {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
};

export type OrbisSnapshot = {
  generatedAt: number;
  profile: { nome: string; meta: number };
  totals: {
    leads: number;
    mensalidadeTotal: number;
    potencialMensalNaBase: number;
    saldo: number;
    transacoes: number;
  };
  byStatus: Record<string, number>;
  pendencias: {
    semVistoriaLiberada: number;
    semVistoriaConcluida: number;
    semPagamento: number;
    semAssinatura: number;
  };
  hotlist: Array<{
    id: string;
    nome: string;
    status: string;
    fone?: string;
    tipoPessoa?: string;
    tipoVeiculo?: string;
    placa?: string;
    valor?: number;
    mensalidade?: number;
    desconto?: number;
    adesao?: number;
    flags: string[];
    createdAt: number;
  }>;
};

const DEFAULT_MODEL = 'gemini-2.0-flash';

function safeNumber(n: any): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function leadFlags(l: Lead): string[] {
  const flags: string[] = [];
  if (l.vistoriaLiberada && !l.vistoriaConcluida) flags.push('vistoria_pendente');
  if (!l.vistoriaLiberada) flags.push('vistoria_nao_liberada');
  if (!l.pagamentoConcluido) flags.push('pagamento_pendente');
  if (!l.assinaturaConcluida) flags.push('assinatura_pendente');
  if ((l.desconto || 0) > 0) flags.push('tem_desconto');
  if ((l.mensalidade || 0) >= 0) flags.push('mensalidade_ok');
  return flags;
}

export function buildSnapshot(args: {
  leads: Lead[];
  profile: Profile;
  transactions: Transaction[];
  saldo: number;
}): OrbisSnapshot {
  const { leads, profile, transactions, saldo } = args;

  const byStatus: Record<string, number> = {};
  for (const l of leads) {
    const k = l.status || 'desconhecido';
    byStatus[k] = (byStatus[k] || 0) + 1;
  }

  const mensalidadeTotal = leads.reduce((acc, l) => acc + safeNumber(l.mensalidade), 0);
  const potencialMensalNaBase = leads
    .filter(l => l.status !== 'ativado' && !l.archived)
    .reduce((acc, l) => acc + safeNumber(l.mensalidade), 0);

  const pendencias = {
    semVistoriaLiberada: leads.filter(l => !l.archived && !l.vistoriaLiberada).length,
    semVistoriaConcluida: leads.filter(l => !l.archived && l.vistoriaLiberada && !l.vistoriaConcluida).length,
    semPagamento: leads.filter(l => !l.archived && !l.pagamentoConcluido).length,
    semAssinatura: leads.filter(l => !l.archived && !l.assinaturaConcluida).length,
  };

  // Prioriza: proposta/cotacao recentes + pendências que travam ativação
  const score = (l: Lead) => {
    let s = 0;
    if (l.status === 'proposta') s += 50;
    if (l.status === 'cotacao') s += 30;
    if (l.status === 'novo') s += 10;
    if (!l.pagamentoConcluido) s += 15;
    if (!l.assinaturaConcluida) s += 10;
    if (!l.vistoriaLiberada) s += 8;
    if (l.vistoriaLiberada && !l.vistoriaConcluida) s += 12;
    s += Math.min(10, Math.floor(safeNumber(l.mensalidade) / 100));
    // recência
    const ageHours = (Date.now() - (l.createdAt || Date.now())) / 36e5;
    if (ageHours < 24) s += 8;
    else if (ageHours < 72) s += 4;
    return s;
  };

  const hotlist = [...leads]
    .filter(l => !l.archived)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 12)
    .map(l => ({
      id: l.id,
      nome: l.nome,
      status: l.status,
      fone: l.fone,
      tipoPessoa: l.tipoPessoa,
      tipoVeiculo: l.tipoVeiculo,
      placa: l.placa,
      valor: safeNumber(l.valor),
      mensalidade: safeNumber(l.mensalidade),
      desconto: safeNumber(l.desconto),
      adesao: safeNumber(l.adesao),
      flags: leadFlags(l),
      createdAt: l.createdAt,
    }));

  return {
    generatedAt: Date.now(),
    profile: { nome: profile.nome, meta: safeNumber(profile.meta) },
    totals: {
      leads: leads.length,
      mensalidadeTotal,
      potencialMensalNaBase,
      saldo: safeNumber(saldo),
      transacoes: transactions.length,
    },
    byStatus,
    pendencias,
    hotlist,
  };
}

function systemPrompt(profileName: string) {
  return [
    'Você é o UnimaxCRM Pro v2.0 — mentor comercial estratégico da UNIMAX Proteção Veicular.',
    'Responda em português do Brasil, direto e aplicável, com foco em conversão.',
    'Priorize ações que gerem ativação de associados no curto prazo.',
    'Quando possível, entregue: (1) diagnóstico (2) prioridades (3) roteiro de contato (4) próximos passos no CRM.',
    `Consultor atual: ${profileName}.`,
    'Nunca invente dados do funil. Use apenas o snapshot fornecido.',
  ].join('\n');
}

function toContentsFromHistory(history: ChatMessage[], limit = 18): GenAIContent[] {
  const recent = history.slice(-limit);
  return recent.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
}

function extractText(res: any): string {
  // @google/genai muda formatos entre versões; tentamos vários caminhos.
  if (!res) return '';
  if (typeof res.text === 'string') return res.text;
  if (typeof res?.response?.text === 'function') return res.response.text();
  if (typeof res?.response?.text === 'string') return res.response.text;
  const c0 = res?.candidates?.[0];
  const parts = c0?.content?.parts;
  const t = parts?.map((p: any) => p?.text).filter(Boolean).join('\n');
  return typeof t === 'string' ? t : '';
}

function apiKeyFromBuild(): string {
  // vite.config.ts injeta process.env.GEMINI_API_KEY
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const k = (process as any)?.env?.GEMINI_API_KEY || (process as any)?.env?.API_KEY;
  return typeof k === 'string' ? k : '';
}

export async function orbisChat(args: {
  userMessage: string;
  history: ChatMessage[];
  snapshot?: OrbisSnapshot;
  profileName?: string;
  model?: string;
}): Promise<string> {
  const apiKey = apiKeyFromBuild();
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    return 'Para ativar o Órbis IA: defina sua chave em .env.local (GEMINI_API_KEY) e reinicie o projeto.';
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = args.model || DEFAULT_MODEL;

  const contents: GenAIContent[] = [];

  // System prompt como primeira mensagem do "model" para manter compatibilidade ampla.
  contents.push({ role: 'model', parts: [{ text: systemPrompt(args.profileName || 'Consultor') }] });

  // Contexto: histórico recente
  contents.push(...toContentsFromHistory(args.history));

  // Snapshot do funil (se existir)
  if (args.snapshot) {
    contents.push({
      role: 'user',
      parts: [
        {
          text:
            'SNAPSHOT_ATUAL_DO_FUNIL (JSON):\n' +
            JSON.stringify(args.snapshot, null, 2),
        },
      ],
    });
  }

  // Pergunta do usuário
  contents.push({ role: 'user', parts: [{ text: args.userMessage }] });

  const res = await ai.models.generateContent({
    model,
    contents,
  } as any);

  const text = extractText(res);
  return text?.trim() || 'Não consegui gerar uma resposta agora. Tente novamente.';
}

export function buildFunnelPrompt(snapshot: OrbisSnapshot): string {
  return [
    'Analise o snapshot do meu funil e me devolva:',
    '1) Diagnóstico rápido do funil (onde está travando)',
    '2) Top 5 prioridades (em ordem) para ativar mais rápido',
    '3) Um plano de ações de 30-60-90 minutos',
    '4) 2 roteiros curtos de WhatsApp (um para PF e um para PJ/Frota)',
    '5) Uma sugestão de regra simples de próxima ação por status (novo/cotacao/proposta)',
    'Se houver pendências de vistoria/pagamento/assinatura, detalhe como destravar primeiro.',
    '\nSnapshot já está incluído em JSON na conversa.',
  ].join('\n');
}
