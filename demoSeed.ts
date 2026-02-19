import { Lead, Transaction } from './types';

// UnimaxCRM — v2.0 DEMO
// 33 cards preenchidos com variações de planos, coberturas, tipos de veículo e etapas do kanban.
// Dados 100% fictícios.

const now = Date.now();

const COBERTURAS_DETALHADAS = [
  'DANOS POR COLISÃO',
  'ROUBO E FURTO QUALIFICADO',
  'FENÔMENOS DA NATUREZA',
  'DANOS A TERCEIROS',
  'COTA DE PARTICIPAÇÃO',
  'ASSISTÊNCIA 24 HORAS ESPECIALIZADA',
  'REBOQUE PARA COLISÃO',
  'REBOQUE PARA PANE ELÉTRICA',
  'REBOQUE PARA PANE MECÂNICA',
  'ASSISTÊNCIA PARA PANE SECA',
  'ASSISTÊNCIA TROCA DE PNEUS',
  'S.O.S ELÉTRICO E MECÂNICO',
  'ASSISTÊNCIA CHAVEIRO',
  'AUXÍLIO HOSPEDAGEM EMERGENCIAL (voucher)',
  'AUXÍLIO TRANSPORTE EMERGENCIAL (voucher)',
  'COBERTURA DE VIDROS E LANTERNAS (em caso de colisão)',
  'CARRO RESERVA (PROMOCIONAL — mediante disponibilidade)',
];

const pick = <T,>(arr: T[], idx: number) => arr[idx % arr.length];

const mkLead = (i: number, overrides: Partial<Lead>): Lead => {
  const id = `DEMO-${String(i).padStart(3, '0')}`;

  const base: Lead = {
    id,
    tipoPessoa: 'PF',
    nome: `Cliente Demonstração ${String(i).padStart(2, '0')}`,
    documento: `000.000.00${String(i).padStart(2, '0')}-00`,
    fone: `(31) 9${String(8000 + i).padStart(4, '0')}-${String(1000 + i).padStart(4, '0')}`,
    email: `cliente${i}@demo.com`,
    canal: pick(['WhatsApp', 'Indicação', 'Posto Parceiro', 'Instagram', 'Site', 'Tráfego Pago'], i),
    associadoIndicador: i % 7 === 0 ? 'Associado: João Indicador' : '',

    cep: '00000-000',
    endereco: pick(['Av. Amazonas', 'Rua Rio de Janeiro', 'Rua Padre Eustáquio', 'Av. João César'], i),
    numero: String(100 + i),
    complemento: i % 5 === 0 ? 'Apto 302' : '',
    bairro: pick(['Centro', 'Eldorado', 'Industrial', 'Cabral', 'Alípio de Melo'], i),
    cidade: pick(['Contagem', 'Belo Horizonte', 'Betim', 'Ibirité'], i),
    uf: 'MG',

    tipoVeiculo: pick(['Carro/Utilitário', 'Moto', 'Pickup Diesel', 'Caminhão', 'Carreta'], i) as any,
    placa: `ABC${String(1000 + i).slice(-4)}`,
    renavam: String(10000000000 + i),
    chassi: `9BWZZZ377VT00${String(100 + i).slice(-3)}`,
    marca: pick(['Volkswagen', 'Fiat', 'Chevrolet', 'Toyota', 'Honda', 'Hyundai', 'Yamaha', 'Mercedes-Benz'], i),
    modelo: pick(['Gol', 'Onix', 'Argo', 'Corolla', 'HB20', 'Civic', 'CG 160', 'Actros'], i),
    anoFabricacao: String(2012 + (i % 12)),
    anoModelo: String(2013 + (i % 12)),
    cor: pick(['Prata', 'Preto', 'Branco', 'Vermelho', 'Azul'], i),
    combustivel: pick(['Flex', 'Gasolina', 'Diesel'], i),
    cambio: i % 3 === 0 ? 'Automático' : 'Manual',
    valor: 25000 + (i * 3500),
    tipoImplemento: pick(['NENHUM', 'BAÚ', 'PRANCHA', 'CARRETA'], i) as any,
    valorImplemento: i % 4 === 0 ? 18000 + (i * 200) : 0,
    veiculo: '',
    veiculoTrabalho: i % 6 === 0,
    codigoFipe: `00${i}.00${i}.00${i}-0`,

    status: pick(['novo', 'cotacao', 'proposta', 'ativado'], i) as any,
    variant: (i % 4) + 1,
    mensalidade: 119.9 + (i % 6) * 20,
    desconto: i % 4 === 0 ? 20 : i % 5 === 0 ? 40 : 0,
    adesao: 199.9 + (i % 5) * 50,
    coberturasAdicionais: [
      pick(['APP 10K', 'Vidros', 'Carro Reserva', 'Assistência Premium', 'Rastreamento'], i),
      ...(i % 3 === 0 ? [pick(['Proteção para terceiros 50k', 'Roubo/Furto ampliado', 'Fenômenos da natureza'], i + 1)] : []),
    ].filter(Boolean),

    attachments: [],
    vistoriaLiberada: i % 3 !== 0,
    vistoriaConcluida: i % 5 === 0,
    vistoriaConcluidaAt: i % 5 === 0 ? now - i * 3600_000 : undefined,
    linkVistoria: i % 3 !== 0 ? `https://demo.unimax/vistoria/${id}` : undefined,
    vistoriaLinkEnviado: i % 4 !== 0,

    pagamentoEnviado: i % 2 === 0,
    pagamentoConcluido: i % 7 === 0,
    assinaturaEnviada: i % 2 !== 0,
    assinaturaConcluida: i % 8 === 0,
    assinaturaConcluidaAt: i % 8 === 0 ? now - i * 1800_000 : undefined,
    assinaturaResponsavel: i % 8 === 0 ? 'Titular' : undefined,
    assinaturaMetodo: i % 8 === 0 ? 'WhatsApp' : undefined,
    assinaturaObservacao: i % 8 === 0 ? 'Assinatura via link público (demo).' : undefined,

    proposalLink: `https://demo.unimax/proposta?leadId=${id}`,
    paymentLink: `https://demo.unimax/pagamento?leadId=${id}`,
    signatureLink: `https://demo.unimax/assinatura?leadId=${id}`,
    termoAdesaoLink: `https://demo.unimax/termo?leadId=${id}`,

    createdAt: now - (i * 86_400_000) / 3,
    history: [],
    archived: false,
  };

  // Ajustes finos por etapa do funil (para ficar coerente)
  const merged = { ...base, ...overrides } as Lead;
  if (merged.status === 'novo') {
    merged.pagamentoEnviado = false;
    merged.pagamentoConcluido = false;
    merged.assinaturaEnviada = false;
    merged.assinaturaConcluida = false;
  }
  if (merged.status === 'cotacao') {
    merged.pagamentoConcluido = false;
    merged.assinaturaConcluida = false;
  }
  if (merged.status === 'proposta') {
    merged.vistoriaLiberada = true;
  }
  if (merged.status === 'ativado') {
    merged.pagamentoEnviado = true;
    merged.pagamentoConcluido = true;
    merged.assinaturaEnviada = true;
    merged.assinaturaConcluida = true;
    merged.vistoriaLiberada = true;
    merged.vistoriaConcluida = true;
    merged.vistoriaConcluidaAt = merged.vistoriaConcluidaAt || now - i * 7200_000;
    merged.assinaturaConcluidaAt = merged.assinaturaConcluidaAt || now - i * 3600_000;
  }

  return merged;
};

export const DEMO_LEADS: Lead[] = Array.from({ length: 33 }).map((_, idx) => {
  const i = idx + 1;
  // Distribuição intencional por etapa: 9 novos, 10 cotação, 9 proposta, 5 ativados
  const stage = i <= 9 ? 'novo' : i <= 19 ? 'cotacao' : i <= 28 ? 'proposta' : 'ativado';
  return mkLead(i, { status: stage as any });
});

// Alguns lançamentos para deixar o painel financeiro “vivo” na demo
export const DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: 'T-DEMO-001',
    tipo: 'Comissão',
    valor: 420,
    status: 'concluida',
    ts: now - 5 * 86_400_000,
    desc: 'Comissão — Ativação (demo) — Cliente Demonstração 29',
  },
  {
    id: 'T-DEMO-002',
    tipo: 'Comissão',
    valor: 250,
    status: 'pendente',
    ts: now - 2 * 86_400_000,
    desc: 'Comissão — Aguardando confirmação (demo) — Cliente Demonstração 31',
  },
  {
    id: 'T-DEMO-003',
    tipo: 'Saque PIX',
    valor: -300,
    status: 'concluida',
    ts: now - 1 * 86_400_000,
    desc: 'Saque PIX — chave comercial@unimax.com.br (demo)',
  },
];

export const DEMO_COBERTURAS_DETALHADAS = COBERTURAS_DETALHADAS;
