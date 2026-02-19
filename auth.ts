import { PermissionKey, User, UserRole, ViewMode } from './types';
import { generateUID } from './utils';

export const USERS_STORAGE_KEY = 'unimaxcrm_users_v2.0';
export const SESSION_STORAGE_KEY = 'unimaxcrm_session_v2.0';

export type Session = { userId: string; issuedAt: number };

export const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    'view:dashboard',
    'view:pipeline',
    'view:associados',
    'view:vistorias',
    'view:financeiro',
    'view:config',
    'manage:users',
    'edit:leads',
    'edit:financeiro',
    'edit:vistorias',
    'export:pdf',
  ],
  supervisor: [
    'view:dashboard',
    'view:pipeline',
    'view:associados',
    'view:vistorias',
    'view:financeiro',
    'view:config',
    'edit:leads',
    'edit:vistorias',
    'export:pdf',
  ],
  consultor: [
    'view:dashboard',
    'view:pipeline',
    'view:associados',
    'view:config',
    'edit:leads',
    'export:pdf',
  ],
  financeiro: [
    'view:dashboard',
    'view:financeiro',
    'view:config',
    'edit:financeiro',
  ],
  vistoriador: ['view:dashboard', 'view:vistorias', 'view:config', 'edit:vistorias', 'export:pdf'],
};

export const VIEW_PERMISSION: Record<ViewMode, PermissionKey> = {
  indicadores: 'view:dashboard',
  pipeline: 'view:pipeline',
  associados: 'view:associados',
  vistorias: 'view:vistorias',
  financeiro: 'view:financeiro',
  configuracoes: 'view:config',
  usuarios: 'manage:users',
  proposal: 'export:pdf',
  contract: 'export:pdf',
  report: 'export:pdf',
  regulation: 'export:pdf',
  payment: 'export:pdf',
  signature: 'export:pdf',
};

export function seedUsersIfMissing() {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (raw) return;
  const now = Date.now();
  // Usuário admin padrão (CPF informado no projeto) — senha = CPF
  const users: User[] = [
    {
      id: generateUID('usr'),
      nome: 'Administrador',
      cpf: '12345678998',
      senha: '12345678998',
      role: 'admin',
      isActive: true,
      createdAt: now,
    },
  ];
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getUsers(): User[] {
  seedUsersIfMissing();
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [];
  }
}

export function saveUsers(users: User[]) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function createUser(input: Omit<User, 'id' | 'createdAt'>): User {
  const u: User = { ...input, id: generateUID('usr'), createdAt: Date.now() };
  const users = getUsers();
  users.push(u);
  saveUsers(users);
  return u;
}

export function updateUser(id: string, patch: Partial<User>) {
  const users = getUsers().map(u => (u.id === id ? { ...u, ...patch } : u));
  saveUsers(users);
}

export function removeUser(id: string) {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
}

export function authenticate(cpf: string, senha: string): { ok: true; user: User } | { ok: false; error: string } {
  const users = getUsers();
  const u = users.find(x => x.cpf === cpf);
  if (!u) return { ok: false, error: 'Usuário não encontrado.' };
  if (!u.isActive) return { ok: false, error: 'Usuário desativado.' };
  if (u.senha !== senha) return { ok: false, error: 'Senha inválida.' };
  return { ok: true, user: u };
}

export function startSession(userId: string) {
  const session: Session = { userId, issuedAt: Date.now() };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function endSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (!s?.userId) return null;
    return s;
  } catch {
    return null;
  }
}

export function getCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;
  const u = getUsers().find(x => x.id === session.userId);
  if (!u || !u.isActive) return null;
  return u;
}

export function hasPermission(user: User | null, permission: PermissionKey): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

export function firstAllowedView(user: User | null): ViewMode {
  const order: ViewMode[] = ['indicadores', 'pipeline', 'vistorias', 'associados', 'financeiro', 'configuracoes'];
  for (const v of order) {
    if (hasPermission(user, VIEW_PERMISSION[v])) return v;
  }
  return 'configuracoes';
}
