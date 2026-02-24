import React, { useMemo, useState } from 'react';
import { createUser, getUsers, removeUser, updateUser } from '../auth';
import { User, UserRole } from '../types';

const roleLabel: Record<UserRole, string> = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  consultor: 'Consultor',
  financeiro: 'Financeiro',
  vistoriador: 'Vistoriador',
};

const onlyDigits = (v: string) => (v || '').replace(/\D+/g, '');
const maskCpf = (raw: string) => {
  const d = onlyDigits(raw).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `-${p4}`;
  return out;
};

const UsersView: React.FC = () => {
  const [refresh, setRefresh] = useState(0);
  const users = useMemo(() => {
    void refresh;
    return getUsers().sort((a, b) => b.createdAt - a.createdAt);
  }, [refresh]);

  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [role, setRole] = useState<UserRole>('consultor');
  const [err, setErr] = useState<string | null>(null);

  const canCreate = nome.trim().length >= 2 && onlyDigits(cpf).length === 11 && senha.length >= 4;

  const handleCreate = () => {
    setErr(null);
    const rawCpf = onlyDigits(cpf);
    if (getUsers().some(u => u.cpf === rawCpf)) {
      setErr('Já existe um usuário com este CPF.');
      return;
    }
    createUser({
      nome: nome.trim(),
      cpf: rawCpf,
      senha,
      role,
      isActive: true,
    });
    setNome('');
    setCpf('');
    setSenha('');
    setRole('consultor');
    setRefresh((v) => v + 1);
  };

  const toggleActive = (u: User) => {
    updateUser(u.id, { isActive: !u.isActive });
    setRefresh((v) => v + 1);
  };

  const resetPassword = (u: User) => {
    // política simples para demo: resetar para CPF
    updateUser(u.id, { senha: u.cpf });
    setRefresh((v) => v + 1);
  };

  const deleteUser = (u: User) => {
    if (!confirm(`Remover o usuário ${u.nome}?`)) return;
    removeUser(u.id);
    setRefresh((v) => v + 1);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-slate-900 font-black text-2xl tracking-tight">Usuários & Permissões</div>
          <div className="text-slate-500 mt-1">Crie usuários, defina perfis e controle acessos por módulo.</div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
          <div className="text-slate-900 font-extrabold">Novo usuário</div>
          <div className="text-slate-500 text-sm mt-1">O login é o CPF (somente números).</div>

          <div className="mt-5 space-y-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">Nome</label>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--unimax-cyan)]"
                placeholder="Ex: João Consultor"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">CPF (usuário)</label>
              <input
                value={cpf}
                onChange={(e) => setCpf(maskCpf(e.target.value))}
                inputMode="numeric"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--unimax-cyan)]"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Senha</label>
              <input
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--unimax-cyan)]"
                placeholder="Defina uma senha"
              />
              <div className="text-[11px] text-slate-400 mt-2">Sugestão: use o CPF como senha inicial.</div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Perfil</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
              >
                <option value="consultor">Consultor</option>
                <option value="vistoriador">Vistoriador</option>
                <option value="financeiro">Financeiro</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {err ? (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{err}</div>
            ) : null}

            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="w-full rounded-2xl bg-[color:var(--unimax-blue)] hover:bg-[color:var(--unimax-dark)] disabled:opacity-60 disabled:hover:bg-[color:var(--unimax-blue)] text-white font-bold py-3 transition"
            >
              Criar usuário
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-slate-900 font-extrabold">Usuários cadastrados</div>
              <div className="text-slate-500 text-sm">Total: {users.length}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left px-6 py-3 font-bold">Nome</th>
                  <th className="text-left px-6 py-3 font-bold">CPF</th>
                  <th className="text-left px-6 py-3 font-bold">Perfil</th>
                  <th className="text-left px-6 py-3 font-bold">Status</th>
                  <th className="text-right px-6 py-3 font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                    <td className="px-6 py-4 font-semibold text-slate-900">{u.nome}</td>
                    <td className="px-6 py-4 text-slate-700">{maskCpf(u.cpf)}</td>
                    <td className="px-6 py-4 text-slate-700">{roleLabel[u.role]}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {u.isActive ? 'Ativo' : 'Desativado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={() => toggleActive(u)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50"
                        >
                          {u.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          onClick={() => resetPassword(u)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50"
                        >
                          Reset senha
                        </button>
                        <button
                          onClick={() => deleteUser(u)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-red-50 border border-red-200 text-red-700 hover:bg-red-100"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersView;
