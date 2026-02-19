
import { 
  PRECO_LEVES, 
  PRECO_PESADOS, 
  PRECO_PICKUPS, 
  PRECO_MOTOS, 
  PRECO_CARRETAS, 
  COBERTURAS_ADICIONAIS,
  PLANOS
} from './constants';
import { TipoVeiculo } from './types';

export const fmtBRL = (v: number) => 
  new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(v);

export const parseBRL = (s: string) => {
  if (!s) return NaN;
  const n = Number(
    String(s)
      .replace(/R\$\s?/g, '')
      .replace(/\./g, '')
      .replace(',', '.')
      .trim()
  );
  return Number.isFinite(n) ? n : NaN;
};

export const fmtPct = (v: number, digits: number = 2) => {
  if (!Number.isFinite(v)) return '';
  return `${v.toFixed(digits)}%`;
};

export const getTabelaParaCategoria = (cat: TipoVeiculo) => {
  switch (cat) {
    case 'Carro/Utilitário': return PRECO_LEVES;
    case 'Caminhão': return PRECO_PESADOS;
    case 'Moto': return PRECO_MOTOS;
    case 'Pickup Diesel': return PRECO_PICKUPS;
    case 'Carreta': return PRECO_CARRETAS;
    default: return PRECO_LEVES;
  }
};


export const calcMensalByPlano = (
  valorFipe: number,
  categoria: TipoVeiculo,
  variant: number = 1,
  adicionaisIds: string[] = [],
  descontoPerc: number = 0
) => {
  if (!categoria) return 0;

  const tabela = getTabelaParaCategoria(categoria);
  let faixa = tabela.find((f: any) => valorFipe <= f.max);
  if (!faixa) faixa = tabela[tabela.length - 1];

  if (!faixa) return 69.90;

  // Base sempre parte do preço "Bronze" (p1). Os demais planos são calculados por fator,
  // alinhado à cota de participação (franquia) do associado.
  const baseBronze = Number((faixa as any).p1 || 0);

  const plano = (PLANOS as any)[variant] || (PLANOS as any)[1];
  const basePrice = baseBronze * Number(plano?.fatorMensal ?? 1);

  // Soma dos Adicionais
  const totalAdicionais = (adicionaisIds || []).reduce((acc, id) => {
    const item = COBERTURAS_ADICIONAIS.find(c => c.id === id);
    return acc + (item?.preco || 0);
  }, 0);

  // Soma Final com Desconto
  const subtotal = basePrice + totalAdicionais;
  const valorComDesconto = subtotal * ((100 - (descontoPerc || 0)) / 100);

  // Valor mínimo de segurança do sistema
  return Math.max(Math.round(valorComDesconto * 100) / 100, 69.90);
};


export const generateUID = () => Math.random().toString(16).slice(2, 10);

export const fmtDateTimeBR = (ts?: number) => {
  if (!ts) return '';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toLocaleString('pt-BR');
  }
};

// Payload público (para links compartilháveis sem backend)
export const encodePublicPayload = (data: any): string => {
  try {
    const json = JSON.stringify(data ?? {});
    // utf-8 safe base64
    const bytes = new TextEncoder().encode(json);
    let bin = '';
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    const b64 = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    return b64;
  } catch {
    return '';
  }
};

export const decodePublicPayload = <T = any>(payload: string | null): T | null => {
  try {
    if (!payload) return null;
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
    const bin = atob(b64 + pad);
    const bytes = new Uint8Array(bin.split('').map(c => c.charCodeAt(0)));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};