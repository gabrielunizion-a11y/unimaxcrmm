import { Lead, TipoVeiculo } from './types';
import { calcMensalByPlano } from './utils';

// Seed de dados para operação em preview (demo). Só é aplicado quando não há estado salvo.

type VehicleTemplate = {
  tipoVeiculo: TipoVeiculo;
  marca: string;
  modelo: string;
  anoFabricacao: string;
  anoModelo: string;
  combustivel: string;
  cambio: 'Manual' | 'Automático';
  cor: string;
  valorFipe: number;
  codigoFipe?: string;
};

type PersonTemplate = {
  tipoPessoa: 'PF' | 'PJ';
  nome: string;
  documento: string;
  fone: string;
  email: string;
};

const mulberry32 = (seed: number) => {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

const plateFromIndex = (i: number) => {
  // Gera placas no padrão Mercosul (ex: ABC1D23) sem validação de existência real.
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const L = (n: number) => letters[(n + i * 7) % letters.length];
  const d = (n: number) => String((n + i * 3) % 10);
  return `${L(1)}${L(2)}${L(3)}${d(1)}${L(4)}${d(2)}${d(3)}`;
};

const pessoas: PersonTemplate[] = [
  { tipoPessoa: 'PF', nome: 'Gabriel Souza', documento: '123.456.789-10', fone: '31999990001', email: 'gabriel.souza@email.com' },
  { tipoPessoa: 'PF', nome: 'Mariana Alves', documento: '987.654.321-00', fone: '31999990002', email: 'mariana.alves@email.com' },
  { tipoPessoa: 'PF', nome: 'Rafael Oliveira', documento: '222.333.444-55', fone: '31999990003', email: 'rafael.oliveira@email.com' },
  { tipoPessoa: 'PF', nome: 'Camila Pereira', documento: '111.222.333-44', fone: '31999990004', email: 'camila.pereira@email.com' },
  { tipoPessoa: 'PF', nome: 'Bruno Costa', documento: '555.666.777-88', fone: '31999990005', email: 'bruno.costa@email.com' },
  { tipoPessoa: 'PJ', nome: 'Transporte Silva LTDA', documento: '12.345.678/0001-90', fone: '31333340001', email: 'contato@transportesilva.com.br' },
  { tipoPessoa: 'PJ', nome: 'Logística Rota Sul', documento: '98.765.432/0001-10', fone: '31333340002', email: 'vendas@rotasul.com.br' },
  { tipoPessoa: 'PJ', nome: 'Frota Horizonte', documento: '11.222.333/0001-55', fone: '31333340003', email: 'financeiro@frotahorizonte.com.br' },
];

const veiculos: VehicleTemplate[] = [
  // Leves
  { tipoVeiculo: 'Carro/Utilitário', marca: 'Volkswagen', modelo: 'Gol 1.6', anoFabricacao: '2019', anoModelo: '2019', combustivel: 'Flex', cambio: 'Manual', cor: 'Branco', valorFipe: 52000, codigoFipe: '005340-6' },
  { tipoVeiculo: 'Carro/Utilitário', marca: 'Chevrolet', modelo: 'Onix 1.0', anoFabricacao: '2021', anoModelo: '2021', combustivel: 'Flex', cambio: 'Manual', cor: 'Prata', valorFipe: 68000, codigoFipe: '004400-8' },
  { tipoVeiculo: 'Carro/Utilitário', marca: 'Fiat', modelo: 'Argo 1.3', anoFabricacao: '2022', anoModelo: '2022', combustivel: 'Flex', cambio: 'Manual', cor: 'Cinza', valorFipe: 76000, codigoFipe: '001999-0' },
  // Motos
  { tipoVeiculo: 'Moto', marca: 'Honda', modelo: 'CG 160 Start', anoFabricacao: '2023', anoModelo: '2023', combustivel: 'Gasolina', cambio: 'Manual', cor: 'Vermelho', valorFipe: 14000, codigoFipe: '811130-6' },
  { tipoVeiculo: 'Moto', marca: 'Yamaha', modelo: 'Fazer 250', anoFabricacao: '2022', anoModelo: '2022', combustivel: 'Gasolina', cambio: 'Manual', cor: 'Azul', valorFipe: 21000, codigoFipe: '827063-3' },
  // Pickups
  { tipoVeiculo: 'Pickup Diesel', marca: 'Toyota', modelo: 'Hilux 2.8 Diesel', anoFabricacao: '2021', anoModelo: '2021', combustivel: 'Diesel', cambio: 'Automático', cor: 'Preto', valorFipe: 210000, codigoFipe: '002180-6' },
  { tipoVeiculo: 'Pickup Diesel', marca: 'Ford', modelo: 'Ranger 3.2 Diesel', anoFabricacao: '2020', anoModelo: '2020', combustivel: 'Diesel', cambio: 'Automático', cor: 'Prata', valorFipe: 185000, codigoFipe: '003200-2' },
  // Pesados
  { tipoVeiculo: 'Caminhão', marca: 'Volvo', modelo: 'FH 460 6x2', anoFabricacao: '2020', anoModelo: '2020', combustivel: 'Diesel', cambio: 'Automático', cor: 'Branco', valorFipe: 620000, codigoFipe: '515040-2' },
  { tipoVeiculo: 'Caminhão', marca: 'Scania', modelo: 'R 450 6x2', anoFabricacao: '2019', anoModelo: '2019', combustivel: 'Diesel', cambio: 'Automático', cor: 'Vermelho', valorFipe: 590000, codigoFipe: '513030-4' },
  // Carretas
  { tipoVeiculo: 'Carreta', marca: 'Randon', modelo: 'Carreta LS', anoFabricacao: '2018', anoModelo: '2018', combustivel: '—', cambio: 'Manual', cor: 'Cinza', valorFipe: 110000, codigoFipe: undefined },
];

const fontes = [
  'Tráfego Meta',
  'Indicação',
  'Parceria Rede Aqui',
  'WhatsApp Orgânico',
  'Instagram',
  'Google',
  'Indicação de Associado',
  'Parceria Oficina',
];

const adicionaisPool = [['vidros'], ['reserva_7'], ['reserva_15'], ['funeral'], ['vidros','reserva_7'], ['funeral','vidros'], []];

const mkLead = (base: Partial<Lead>): Lead => {
  const now = Date.now();
  return {
    id: base.id || `L${Math.random().toString(16).slice(2, 10)}`,
    tipoPessoa: base.tipoPessoa || 'PF',
    nome: base.nome || '',
    documento: base.documento || '',
    rg_ie: base.rg_ie,
    cnh: base.cnh,
    dataNascimento: base.dataNascimento,
    fone: base.fone || '',
    email: base.email || '',
    canal: base.canal || '',
    associadoIndicador: base.associadoIndicador,
    cep: base.cep || '32000-000',
    endereco: base.endereco || 'Av. Exemplo',
    numero: base.numero || '100',
    complemento: base.complemento,
    bairro: base.bairro || 'Centro',
    cidade: base.cidade || 'Contagem',
    uf: base.uf || 'MG',
    tipoVeiculo: base.tipoVeiculo || '',
    placa: base.placa || '',
    renavam: base.renavam || '',
    chassi: base.chassi || '',
    marca: base.marca || '',
    modelo: base.modelo || '',
    anoFabricacao: base.anoFabricacao || '',
    anoModelo: base.anoModelo || '',
    cor: base.cor || '',
    combustivel: base.combustivel || '',
    cambio: base.cambio || 'Manual',
    valor: base.valor ?? 0,
    tipoImplemento: base.tipoImplemento || 'NENHUM',
    valorImplemento: base.valorImplemento ?? 0,
    veiculo: base.veiculo || '',
    veiculoTrabalho: base.veiculoTrabalho ?? false,
    codigoFipe: base.codigoFipe,
    fipeHistory: base.fipeHistory,
    fipeHistoryUpdatedAt: base.fipeHistoryUpdatedAt,
    status: (base.status as any) || 'novo',
    variant: base.variant ?? 1,
    mensalidade: base.mensalidade ?? 0,
    desconto: base.desconto ?? 0,
    adesao: base.adesao ?? 350,
    coberturasAdicionais: base.coberturasAdicionais || [],
    attachments: base.attachments || [],
    vistoriaLiberada: base.vistoriaLiberada ?? false,
    vistoriaConcluida: base.vistoriaConcluida ?? false,
    vistoriaConcluidaAt: base.vistoriaConcluidaAt,
    linkVistoria: base.linkVistoria,
    vistoriaLinkEnviado: base.vistoriaLinkEnviado,
    pagamentoEnviado: base.pagamentoEnviado ?? false,
    pagamentoConcluido: base.pagamentoConcluido ?? false,
    assinaturaEnviada: base.assinaturaEnviada ?? false,
    assinaturaConcluida: base.assinaturaConcluida ?? false,
    assinaturaConcluidaAt: base.assinaturaConcluidaAt,
    assinaturaResponsavel: base.assinaturaResponsavel,
    assinaturaMetodo: base.assinaturaMetodo,
    assinaturaObservacao: base.assinaturaObservacao,
    proposalLink: base.proposalLink,
    paymentLink: base.paymentLink,
    signatureLink: base.signatureLink,
    termoAdesaoLink: base.termoAdesaoLink,
    createdAt: base.createdAt ?? now,
    history: base.history || [],
    // Importante: no app, o Funil filtra por archived === showArchived.
    // Se vier undefined, o lead some do Funil. Default deve ser false.
    archived: base.archived ?? false,
  };
};

export const generateSeedLeads = (): Lead[] => {
  const rng = mulberry32(1909);
  const leads: Lead[] = [];

  // 100 associados (ativos/inadimplentes/inativos)
  for (let i = 0; i < 100; i++) {
    const pessoa = pick(rng, pessoas);
    const v = pick(rng, veiculos);
    const variant = pick(rng, [1, 2, 3]);
    const adicionais = pick(rng, adicionaisPool);
    const desconto = pick(rng, [0, 0, 0, 5, 10]);
    const mensal = calcMensalByPlano(v.valorFipe, v.tipoVeiculo, variant, adicionais, desconto);
    const placa = plateFromIndex(i);

    // Distribuição: 60 ativos, 20 inadimplentes, 20 inativos
    const bucket = i;
    const isAtivo = bucket < 60;
    const isInad = bucket >= 60 && bucket < 80;
    const isInativo = bucket >= 80;

    leads.push(
      mkLead({
        id: `A${String(i + 1).padStart(3, '0')}`,
        tipoPessoa: pessoa.tipoPessoa,
        nome: isInativo ? `${pessoa.nome} (Inativo)` : pessoa.nome,
        documento: pessoa.documento,
        fone: pessoa.fone,
        email: pessoa.email,
        canal: pick(rng, fontes),
        tipoVeiculo: v.tipoVeiculo,
        placa,
        marca: v.marca,
        modelo: v.modelo,
        anoFabricacao: v.anoFabricacao,
        anoModelo: v.anoModelo,
        combustivel: v.combustivel,
        cambio: v.cambio,
        cor: v.cor,
        valor: v.valorFipe,
        codigoFipe: v.codigoFipe,
        veiculo: `${v.marca} ${v.modelo}`,
        veiculoTrabalho: v.tipoVeiculo === 'Caminhão' || v.tipoVeiculo === 'Carreta',
        status: 'ativado',
        variant,
        mensalidade: mensal,
        desconto,
        adesao: pick(rng, [250, 300, 350, 399]),
        coberturasAdicionais: adicionais,
        vistoriaLiberada: true,
        vistoriaConcluida: true,
        vistoriaConcluidaAt: Date.now() - Math.floor(rng() * 30) * 86400000,
        pagamentoEnviado: true,
        pagamentoConcluido: isAtivo,
        assinaturaEnviada: true,
        assinaturaConcluida: true,
        assinaturaConcluidaAt: Date.now() - Math.floor(rng() * 60) * 86400000,
        assinaturaResponsavel: 'Órbis PRO',
        assinaturaMetodo: pick(rng, ['WhatsApp', 'E-mail', 'Presencial'] as any),
        archived: isInativo ? true : false,
        createdAt: Date.now() - (90 + i) * 86400000,
        history: [{ from: 'proposta', to: 'ativado', ts: Date.now() - (90 + i) * 86400000 } as any],
      })
    );
  }

  // 33 cards no Kanban (leads em etapas)
  const pipelineStatuses: any[] = ['novo', 'cotacao', 'proposta'];
  for (let i = 0; i < 33; i++) {
    const pessoa = pick(rng, pessoas);
    const v = pick(rng, veiculos);
    const variant = pick(rng, [1, 2, 3]);
    const adicionais = pick(rng, adicionaisPool);
    const desconto = pick(rng, [0, 0, 5]);
    const mensal = calcMensalByPlano(v.valorFipe, v.tipoVeiculo, variant, adicionais, desconto);
    const placa = plateFromIndex(200 + i);
    const status = pick(rng, pipelineStatuses);

    leads.push(
      mkLead({
        id: `P${String(i + 1).padStart(2, '0')}`,
        tipoPessoa: pessoa.tipoPessoa,
        nome: pessoa.nome,
        documento: pessoa.documento,
        fone: pessoa.fone,
        email: pessoa.email,
        canal: pick(rng, fontes),
        tipoVeiculo: v.tipoVeiculo,
        placa,
        marca: v.marca,
        modelo: v.modelo,
        anoFabricacao: v.anoFabricacao,
        anoModelo: v.anoModelo,
        combustivel: v.combustivel,
        cambio: v.cambio,
        cor: v.cor,
        valor: v.valorFipe,
        codigoFipe: v.codigoFipe,
        veiculo: `${v.marca} ${v.modelo}`,
        status,
        variant,
        mensalidade: mensal,
        desconto,
        adesao: 350,
        coberturasAdicionais: adicionais,
        pagamentoEnviado: status === 'proposta',
        assinaturaEnviada: status === 'proposta',
        createdAt: Date.now() - (i + 2) * 86400000,
        history: [],
      })
    );
  }

  return leads;
};
