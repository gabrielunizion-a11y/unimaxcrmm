import React, { useState } from 'react';
import { authenticate, seedUsersIfMissing, startSession } from '../auth';

type Props = {
  onSuccess: () => void;
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

const Login: React.FC<Props> = ({ onSuccess }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isUserValid = onlyDigits(user).length === 11;
  const isPassValid = onlyDigits(pass).length === 11;
  const canSubmit = isUserValid && isPassValid && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    seedUsersIfMissing();
    const u = onlyDigits(user);
    const p = onlyDigits(pass);

    const res = authenticate(u, p);
    if (res.ok) {
      setErr(null);
      startSession(res.user.id);
      await new Promise((r) => setTimeout(r, 180));
      onSuccess();
    } else {
      setErr(res.error);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen w-screen grid lg:grid-cols-2 bg-[color:var(--unimax-bg)]">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-[color:var(--unimax-dark)] text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/brand/logo-icon.png" alt="UnimaxCRM" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <div className="font-extrabold tracking-wide">UnimaxCRM</div>
            <div className="text-white/70 text-sm">PRO v2.0</div>
          </div>
        </div>

        <div className="max-w-md">
          <div className="text-3xl font-extrabold leading-tight">
            Ambiente Comercial<br />
            com UnimaxCRM
          </div>
          <div className="mt-4 text-white/80">
            Acesse seu funil, propostas, vistorias e comissões em um único painel.
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl p-4 bg-white/10 border border-white/10">
              <div className="font-semibold">Links de Pagamento</div>
              <div className="text-white/70">Pix e conciliação</div>
            </div>
            <div className="rounded-2xl p-4 bg-white/10 border border-white/10">
              <div className="font-semibold">Assinatura Digital</div>
              <div className="text-white/70">Fluxo completo</div>
            </div>
            <div className="rounded-2xl p-4 bg-white/10 border border-white/10">
              <div className="font-semibold">Histórico de Vistorias</div>
              <div className="text-white/70">Laudos sempre acessíveis</div>
            </div>
            <div className="rounded-2xl p-4 bg-white/10 border border-white/10">
              <div className="font-semibold">Comissões</div>
              <div className="text-white/70">Carteira do consultor</div>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-xs">UnimaxCRM Pro v2.0 • Acesso restrito</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              <img src="/brand/logo-icon.png" alt="UnimaxCRM" className="w-10 h-10 object-contain" />
            </div>
          </div>

          <div className="rounded-3xl bg-white shadow-lg border border-[color:var(--unimax-border)] p-8 ui-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-slate-900 font-extrabold text-xl">Acesso do consultor</div>
                <div className="text-slate-500 text-sm mt-1">Entre com seu CPF e senha cadastrados.</div>
              </div>
              <div className="text-[11px] text-slate-400 font-semibold mt-1 whitespace-nowrap">PRO v2.0</div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">CPF</label>
                <input
                  value={user}
                  onChange={(e) => {
                    setErr(null);
                    setUser(maskCpf(e.target.value));
                  }}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                  className="mt-2 w-full rounded-2xl border border-[color:var(--unimax-border)] bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--unimax-cyan)] ui-input"
                />
                <div className="mt-2 text-[11px] text-slate-400">
                  {isUserValid ? 'CPF válido.' : 'Digite 11 dígitos.'}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700">Senha</label>
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  >
                    {showPass ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>

                <input
                  value={pass}
                  onChange={(e) => {
                    setErr(null);
                    setPass(maskCpf(e.target.value));
                  }}
                  placeholder="000.000.000-00"
                  type={showPass ? 'text' : 'password'}
                  className="mt-2 w-full rounded-2xl border border-[color:var(--unimax-border)] bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-[color:var(--unimax-cyan)] ui-input"
                />
                <div className="mt-2 text-[11px] text-slate-400">
                  {isPassValid ? 'Senha preenchida.' : 'Digite 11 dígitos.'}
                </div>
              </div>

              {err ? (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  {err}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-2xl text-white font-bold py-3 transition ui-btn-primary disabled:opacity-60 disabled:transform-none disabled:shadow-none disabled:filter-none"
                style={{ background: 'linear-gradient(135deg, var(--unimax-blue), #1F5FBF)' }}
              >
                {submitting ? 'Validando...' : 'Acessar Dashboard'}
              </button>
            </form>

            <div className="mt-6 text-xs text-slate-500">
              Demo: o usuário Admin padrão é <span className="font-semibold">123.456.789-98</span> e a senha é o mesmo CPF.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
