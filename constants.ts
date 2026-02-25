
import { CRMStatus, TipoVeiculo } from './types';


export const PLANOS = {
  1: { id: 1, nome: 'Bronze', label: 'BRONZE', cotaPerc: 5, fatorMensal: 1.0, reboque: '400 KM', terceiros: 'R$ 30.000,00', tag: 'Econômico' },
  2: { id: 2, nome: 'Prata',  label: 'PRATA',  cotaPerc: 7, fatorMensal: 0.93, reboque: '600 KM', terceiros: 'R$ 50.000,00', tag: 'Equilibrado' },
  3: { id: 3, nome: 'Ouro',   label: 'OURO',   cotaPerc: 8, fatorMensal: 0.88, reboque: '1000 KM', terceiros: 'R$ 100.000,00', tag: 'Completo' },
} as const;

export const PLANOS_LIST = [PLANOS[1], PLANOS[2], PLANOS[3]];

export const STATUSES: { id: CRMStatus; label: string; color: string }[] = [
  { id: 'novo', label: 'COTAÇÃO ENVIADA', color: 'bg-unimax-blue' },
  { id: 'cotacao', label: 'RELAÇÃO DE DOCS', color: 'bg-orange-500' },
  { id: 'proposta', label: 'VISTORIA / ASSINATURA', color: 'bg-unimax-cyan' },
  { id: 'ativado', label: 'ATIVO / FINALIZADO', color: 'bg-unimax-emerald' },
];

export const CATEGORIAS_VEICULOS = [
  { id: 'Carro/Utilitário', label: 'Leve Particular (Flex)', reboque: '400km', terceiros: '30k' },
  { id: 'Pickup Diesel', label: 'Pick-up / SUV (Diesel)', reboque: '400km', terceiros: '30k' },
  { id: 'Moto', label: 'Motocicleta (Até 300cc)', reboque: '400km', terceiros: '10k' },
  { id: 'Caminhão', label: 'Pesado (Caminhão)', reboque: '300km', terceiros: '30k' },
  { id: 'Carreta', label: 'Implemento (Carreta)', reboque: 'N/A', terceiros: 'N/A' }
];

export const PRECO_PESADOS = [
  { max: 20000, p1: 144.99, p2: 184.99, p3: 204.99 },
  { max: 40000, p1: 193.99, p2: 233.99, p3: 253.99 },
  { max: 60000, p1: 243.99, p2: 283.99, p3: 303.99 },
  { max: 100000, p1: 354.99, p2: 394.00, p3: 414.99 },
  { max: 300000, p1: 1185.99, p2: 1220.99, p3: 1240.99 },
];

export const PRECO_LEVES = [
  { max: 10000, p1: 69.99, p2: 84.99 },
  { max: 30000, p1: 109.99, p2: 124.99 },
  { max: 60000, p1: 186.99, p2: 211.99 },
  { max: 120000, p1: 358.99, p2: 380.99 },
];

export const PRECO_PICKUPS = [
  { max: 40000, p1: 149.99, p2: 190.99 },
  { max: 80000, p1: 314.99, p2: 323.99 },
  { max: 120000, p1: 405.99, p2: 430.99 },
];

export const PRECO_MOTOS = [
  { max: 5000, p1: 69.99 },
  { max: 20000, p1: 129.99 },
];

export const PRECO_CARRETAS = [
  { max: 50000, p1: 150.00, p2: 190.00, p3: 210.00 },
  { max: 200000, p1: 450.00, p2: 490.00, p3: 510.00 },
];

export const COBERTURAS_ADICIONAIS = [
  { id: 'terceiros_50', label: 'Danos à terceiros (até R$ 50.000,00)', preco: 17.50 },
  { id: 'terceiros_100', label: 'Danos à terceiros (até R$ 100.000,00)', preco: 35.00 },
  { id: 'assist_400', label: 'Assistência 24h (até 400km)', preco: 22.00 },
  { id: 'assist_600', label: 'Assistência 24h (até 600km)', preco: 40.00 },
  { id: 'assist_1000', label: 'Assistência 24h (até 1000km)', preco: 60.00 },
  { id: 'parabrisa', label: 'Proteção parabrisa', preco: 20.00 },
  { id: 'vidros_lanternas', label: 'Proteção vidros e lanternas', preco: 50.00 },
  { id: 'apolice_10', label: 'Apolice para passageiro (R$ 10.000,00)', preco: 8.00 },
  { id: 'apolice_30', label: 'Apolice para passageiro (R$ 30.000,00)', preco: 13.00 },
  { id: 'reserva_7', label: 'Carro Reserva (7 dias)', preco: 21.00 },
  { id: 'reserva_15', label: 'Carro Reserva (15 dias)', preco: 44.00 },
];



export const MOCK_PLATES: Record<string, any> = {
  'BRA2E19': { 
    marca: 'Toyota', 
    modelo: 'Corolla XEI 2.0 Flex 16V Aut.', 
    ano: '2023', 
    valor: 145230, 
    tipoVeiculo: 'Carro/Utilitário',
    cambio: 'Automático', 
    combustivel: 'Flex', 
    cor: 'Prata',
    codigoFipe: '002194-6'
  }
};
