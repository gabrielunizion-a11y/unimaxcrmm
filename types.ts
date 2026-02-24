
export type CRMStatus = 'novo' | 'cotacao' | 'proposta' | 'ativado';
export type TipoVeiculo = 'Carro/Utilitário' | 'Moto' | 'Caminhão' | 'Pickup Diesel' | 'Carreta' | '';
export type TipoImplemento = 'BAÚ' | 'PRANCHA' | 'CARRETA' | 'NENHUM';

export type ViewMode =
  | 'pipeline'
  | 'indicadores'
  | 'associados'
  | 'financeiro'
  | 'vistorias'
  | 'configuracoes'
  | 'usuarios'
  | 'proposal'
  | 'contract'
  | 'report'
  | 'regulation'
  | 'payment'
  | 'signature';

export type UserRole = 'admin' | 'supervisor' | 'consultor' | 'financeiro' | 'vistoriador';

export interface User {
  id: string;
  nome: string;
  cpf: string; // login
  senha: string; // demo/local only (no backend)
  role: UserRole;
  isActive: boolean;
  createdAt: number;
}

export type PermissionKey =
  | 'view:dashboard'
  | 'view:pipeline'
  | 'view:associados'
  | 'view:vistorias'
  | 'view:financeiro'
  | 'view:config'
  | 'manage:users'
  | 'edit:leads'
  | 'edit:financeiro'
  | 'edit:vistorias'
  | 'export:pdf';

export interface LeadHistory {
  from: CRMStatus;
  to: CRMStatus;
  ts: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'doc' | 'photo';
  ts: number;
}

export interface FipeHistoryPoint {
  tabela: number;
  mesReferencia: string;
  valor: number;
  valorFormatado?: string;
  mesTabela?: string;
  dataConsulta?: string;
}

export interface Lead {
  id: string;
  // IDENTIFICAÇÃO
  tipoPessoa: 'PF' | 'PJ';
  nome: string;
  documento: string; // CPF ou CNPJ
  rg_ie?: string;
  cnh?: string;
  dataNascimento?: string;
  fone: string;
  email: string;
  canal: string;
  associadoIndicador?: string;
  
  // ENDEREÇO
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  
  // DADOS DO VEICULO
  tipoVeiculo: TipoVeiculo;
  placa: string;
  renavam: string;
  chassi: string;
  marca: string;
  modelo: string;
  anoFabricacao: string;
  anoModelo: string;
  cor: string;
  combustivel: string;
  cambio: 'Manual' | 'Automático';
  valor: number; 
  tipoImplemento: TipoImplemento;
  valorImplemento: number;
  veiculo: string; 
  veiculoTrabalho: boolean; 
  codigoFipe?: string;

  // Histórico FIPE (argumento comercial)
  fipeHistory?: FipeHistoryPoint[];
  fipeHistoryUpdatedAt?: number;
  
  // CONFIGURAÇÃO DA PROPOSTA
  status: CRMStatus;
  variant: number; 
  mensalidade: number;
  desconto: number;
  adesao: number;
  coberturasAdicionais: string[];
  
  // FECHAMENTO E ANEXOS
  attachments: Attachment[];
  vistoriaLiberada: boolean;
  vistoriaConcluida: boolean;
  vistoriaConcluidaAt?: number;
  linkVistoria?: string;
  vistoriaLinkEnviado?: boolean;
  
  // NOTIFICAÇÕES E ESTÁGIOS
  pagamentoEnviado: boolean;
  pagamentoConcluido: boolean;
  assinaturaEnviada: boolean;
  assinaturaConcluida: boolean;
  assinaturaConcluidaAt?: number;

  assinaturaResponsavel?: string;
  assinaturaMetodo?: 'Presencial' | 'WhatsApp' | 'E-mail' | 'Outro';
  assinaturaObservacao?: string;

  // Links públicos (compartilhamento)
  proposalLink?: string;
  paymentLink?: string;
  signatureLink?: string;
  termoAdesaoLink?: string;

  createdAt: number;
  history: LeadHistory[];
  archived?: boolean;
}

export interface Transaction {
  id: string;
  tipo: 'Comissão' | 'Saque PIX';
  valor: number;
  status: 'pendente' | 'concluida' | 'cancelada';
  ts: number;
  desc: string;
}

export interface Profile {
  nome: string;
  pix: string;
  comissao: number;
  meta: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  ts: number;
}

export interface AppState {
  leads: Lead[];
  transactions: Transaction[];
  profile: Profile;
  saldo: number;
  filter: string;
  chatHistory: ChatMessage[];
  showArchived: boolean;
}