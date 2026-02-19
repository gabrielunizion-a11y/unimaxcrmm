import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

// Carrega variáveis locais (frontend usa .env.local; reutilizamos aqui)
dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = Number(process.env.PORT || 8787);
const PLACAFIPE_TOKEN = process.env.PLACAFIPE_TOKEN;
const PLACAFIPE_BASE_URL = (process.env.PLACAFIPE_BASE_URL || 'https://api.placafipe.com.br').replace(/\/+$/, '');

// Cache simples em memória para reduzir custo/latência (evita estourar rate-limit)
const memCache = new Map();
const cacheGet = (key) => {
  const hit = memCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.ts > hit.ttl) {
    memCache.delete(key);
    return null;
  }
  return hit.data;
};
const cacheSet = (key, data, ttlMs) => {
  memCache.set(key, { ts: Date.now(), ttl: ttlMs, data });
};

const normalizePlaca = (s = '') => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);

function toNumber(v) {
  if (v === null || v === undefined) return NaN;
  const s = String(v)
    .replace(/R\$\s?/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function pickBestFipeCandidate(fipeArray) {
  if (!Array.isArray(fipeArray) || fipeArray.length === 0) return null;
  const scored = fipeArray.map((item) => {
    const corr = toNumber(item?.correspondencia);
    const sim = toNumber(item?.similaridade);
    return { item, corr: Number.isFinite(corr) ? corr : 0, sim: Number.isFinite(sim) ? sim : 0 };
  });
  scored.sort((a, b) => (b.corr - a.corr) || (b.sim - a.sim));
  return scored[0]?.item || null;
}

async function fetchPlacaFipe(placa) {
  if (!PLACAFIPE_TOKEN) {
    const err = new Error('PLACAFIPE_TOKEN não configurado no servidor.');
    err.status = 500;
    throw err;
  }

  const resp = await fetch(`${PLACAFIPE_BASE_URL}/getplacafipe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ placa, token: PLACAFIPE_TOKEN })
  });

  const data = await resp.json().catch(() => ({}));

  // A API pode retornar HTTP 200 com "codigo" de erro.
  const codigo = Number(data?.codigo);
  const isOk = resp.ok && (Number.isFinite(codigo) ? codigo === 1 : true);
  if (!isOk) {
    const err = new Error(data?.msg || data?.mensagem || 'Falha ao consultar PlacaFipe');
    err.status = resp.ok ? 400 : resp.status;
    err.apiCode = codigo;
    throw err;
  }

  return data;
}

async function fetchPlacaFipeGet(placa) {
  if (!PLACAFIPE_TOKEN) {
    const err = new Error('PLACAFIPE_TOKEN não configurado no servidor.');
    err.status = 500;
    throw err;
  }
  const resp = await fetch(`${PLACAFIPE_BASE_URL}/getplacafipe/${encodeURIComponent(placa)}/${encodeURIComponent(PLACAFIPE_TOKEN)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await resp.json().catch(() => ({}));
  const codigo = Number(data?.codigo);
  const isOk = resp.ok && (Number.isFinite(codigo) ? codigo === 1 : true);
  if (!isOk) {
    const err = new Error(data?.msg || data?.mensagem || 'Falha ao consultar PlacaFipe');
    err.status = resp.ok ? 400 : resp.status;
    err.apiCode = codigo;
    throw err;
  }
  return data;
}

async function fetchQuotas() {
  if (!PLACAFIPE_TOKEN) {
    const err = new Error('PLACAFIPE_TOKEN não configurado no servidor.');
    err.status = 500;
    throw err;
  }
  const resp = await fetch(`${PLACAFIPE_BASE_URL}/getquotas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: PLACAFIPE_TOKEN })
  });
  const data = await resp.json().catch(() => ({}));
  const codigo = Number(data?.codigo);
  const isOk = resp.ok && (Number.isFinite(codigo) ? codigo === 1 : true);
  if (!isOk) {
    const err = new Error(data?.msg || data?.mensagem || 'Falha ao consultar quotas');
    err.status = resp.ok ? 400 : resp.status;
    err.apiCode = codigo;
    throw err;
  }
  return data;
}

async function fetchDesvalorizometro(desvalorizometro) {
  if (!PLACAFIPE_TOKEN) {
    const err = new Error('PLACAFIPE_TOKEN não configurado no servidor.');
    err.status = 500;
    throw err;
  }
  const resp = await fetch(`${PLACAFIPE_BASE_URL}/getdesvalorizometro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ desvalorizometro, token: PLACAFIPE_TOKEN })
  });
  const data = await resp.json().catch(() => ({}));
  const codigo = Number(data?.codigo);
  const isOk = resp.ok && (Number.isFinite(codigo) ? codigo === 1 : true);
  if (!isOk) {
    const err = new Error(data?.msg || data?.mensagem || 'Falha ao consultar desvalorizômetro');
    err.status = resp.ok ? 400 : resp.status;
    err.apiCode = codigo;
    throw err;
  }
  return data;
}

async function placafipePost(path, body) {
  if (!PLACAFIPE_TOKEN) {
    const err = new Error('PLACAFIPE_TOKEN não configurado no servidor.');
    err.status = 500;
    throw err;
  }
  const resp = await fetch(`${PLACAFIPE_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, token: PLACAFIPE_TOKEN })
  });
  const data = await resp.json().catch(() => ({}));
  const codigo = Number(data?.codigo);
  const isOk = resp.ok && (Number.isFinite(codigo) ? codigo === 1 : true);
  if (!isOk) {
    const err = new Error(data?.msg || data?.mensagem || 'Falha ao consultar PlacaFipe');
    err.status = resp.ok ? 400 : resp.status;
    err.apiCode = codigo;
    throw err;
  }
  return data;
}

async function fetchBrasilApiFipePrice(codigoFipe) {
  // BrasilAPI: /api/fipe/preco/v1/{codigoFipe}
  const resp = await fetch(`https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(codigoFipe)}`);
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data) return null;
  // geralmente retorna array
  const item = Array.isArray(data) ? data[0] : data;
  const valor = toNumber(item?.valor);
  return Number.isFinite(valor) ? valor : null;
}

async function fetchBrasilApiFipeTables() {
  const cacheKey = 'brasilapi:fipe:tabelas';
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const resp = await fetch('https://brasilapi.com.br/api/fipe/tabelas/v1');
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !Array.isArray(data)) return [];
  // data: [{ codigo, mes }]
  const out = data
    .map((t) => ({ codigo: Number(t?.codigo), mes: String(t?.mes || '').trim() }))
    .filter((t) => Number.isFinite(t.codigo) && t.codigo > 0);

  // cache 12h
  cacheSet(cacheKey, out, 12 * 60 * 60 * 1000);
  return out;
}

async function fetchBrasilApiFipePriceByTable(codigoFipe, tabelaCodigo) {
  const cacheKey = `brasilapi:fipe:preco:${codigoFipe}:${tabelaCodigo || 'atual'}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const url = new URL(`https://brasilapi.com.br/api/fipe/preco/v1/${encodeURIComponent(codigoFipe)}`);
  if (tabelaCodigo) url.searchParams.set('tabela_referencia', String(tabelaCodigo));
  const resp = await fetch(url.toString());
  const data = await resp.json().catch(() => null);
  if (!resp.ok || !data) return null;
  const item = Array.isArray(data) ? data[0] : data;
  const valor = toNumber(item?.valor);
  if (!Number.isFinite(valor)) return null;
  const out = {
    tabela: tabelaCodigo,
    mesReferencia: String(item?.mesReferencia || item?.mes_referencia || '').trim(),
    valor,
    valorFormatado: String(item?.valor || '').trim(),
    marca: item?.marca,
    modelo: item?.modelo,
    anoModelo: item?.anoModelo,
    combustivel: item?.combustivel,
    dataConsulta: item?.dataConsulta
  };

  // cache 6h
  cacheSet(cacheKey, out, 6 * 60 * 60 * 1000);
  return out;
}

app.get('/api/fipe/historico', async (req, res) => {
  try {
    const codigoFipe = String(req.query?.codigoFipe || '').trim();
    const mesesRaw = Number(req.query?.meses || 6);
    const meses = Math.max(2, Math.min(12, Number.isFinite(mesesRaw) ? mesesRaw : 6));

    if (!/^[0-9]{6}-[0-9]$/.test(codigoFipe)) {
      return res.status(400).json({ message: 'codigoFipe inválido. Ex: 001004-9' });
    }

    const cacheKey = `hist:${codigoFipe}:${meses}`;
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const tabelas = await fetchBrasilApiFipeTables();
    if (!Array.isArray(tabelas) || tabelas.length === 0) {
      return res.status(502).json({ message: 'Não foi possível obter tabelas FIPE (BrasilAPI).' });
    }

    // pega as últimas N tabelas (mais recentes primeiro)
    const recent = tabelas
      .filter((t) => Number.isFinite(t.codigo))
      .sort((a, b) => b.codigo - a.codigo)
      .slice(0, meses);

    const series = [];
    for (const t of recent) {
      const point = await fetchBrasilApiFipePriceByTable(codigoFipe, t.codigo);
      if (point) {
        series.push({
          tabela: t.codigo,
          mesTabela: t.mes,
          mesReferencia: point.mesReferencia || t.mes,
          valor: point.valor,
          valorFormatado: point.valorFormatado,
          dataConsulta: point.dataConsulta
        });
      }
    }

    // ordenar do mais antigo -> mais recente para facilitar cálculo no front
    series.sort((a, b) => a.tabela - b.tabela);

    const payload = {
      codigoFipe,
      meses,
      series,
      updatedAt: Date.now()
    };

    // cache 6h
    cacheSet(cacheKey, payload, 6 * 60 * 60 * 1000);
    return res.json(payload);
  } catch (e) {
    return res.status(500).json({ message: e?.message || 'Erro ao obter histórico FIPE' });
  }
});

app.post('/api/placa', async (req, res) => {
  try {
    const placa = normalizePlaca(req.body?.placa);
    if (placa.length !== 7) {
      return res.status(400).json({ message: 'Placa inválida. Use 7 caracteres (ABC1D23 / ABC1234).' });
    }

    const useGet = String(req.query?.via || '').toLowerCase() === 'get';
    const raw = useGet ? await fetchPlacaFipeGet(placa) : await fetchPlacaFipe(placa);
    const info = raw?.informacoes_veiculo || {};
    const best = pickBestFipeCandidate(raw?.fipe);

    if (!best) {
      return res.status(404).json({ message: 'Nenhum resultado FIPE encontrado para esta placa.' });
    }

    const codigoFipe = best?.codigo_fipe;
    const valorPlacaFipe = toNumber(best?.valor);
    const valorBrasilApi = codigoFipe ? await fetchBrasilApiFipePrice(codigoFipe) : null;

    const desvalorizometro = best?.desvalorizometro;

    return res.json({
      placa,
      marca: info?.marca || best?.marca,
      modelo: info?.modelo || best?.modelo,
      anoFabricacao: info?.ano ? String(info.ano) : '',
      anoModelo: info?.ano_modelo ? String(info.ano_modelo) : String(best?.ano_modelo ?? ''),
      cor: info?.cor,
      combustivel: info?.combustivel || best?.combustivel,
      codigoFipe,
      valor: (valorBrasilApi ?? (Number.isFinite(valorPlacaFipe) ? valorPlacaFipe : 0)),
      desvalorizometro,
      chassi: info?.chassi,
      renavam: '',
      fonte: {
        placaFipeMesReferencia: best?.mes_referencia,
        brasilApi: valorBrasilApi !== null
      }
    });
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro interno ao consultar placa', apiCode: e?.apiCode });
  }
});

// GET alternativo (conveniência): /api/placa/MIH5B55
app.get('/api/placa/:placa', async (req, res) => {
  try {
    const placa = normalizePlaca(req.params?.placa);
    if (placa.length !== 7) {
      return res.status(400).json({ message: 'Placa inválida. Use 7 caracteres (ABC1D23 / ABC1234).' });
    }
    // Por padrão usamos POST (mais estável). Se quiser forçar GET, use ?via=get
    const useGet = String(req.query?.via || '').toLowerCase() === 'get';
    const raw = useGet ? await fetchPlacaFipeGet(placa) : await fetchPlacaFipe(placa);
    const info = raw?.informacoes_veiculo || {};
    const best = pickBestFipeCandidate(raw?.fipe);
    if (!best) return res.status(404).json({ message: 'Nenhum resultado FIPE encontrado para esta placa.' });

    const codigoFipe = best?.codigo_fipe;
    const valorPlacaFipe = toNumber(best?.valor);
    const valorBrasilApi = codigoFipe ? await fetchBrasilApiFipePrice(codigoFipe) : null;

    return res.json({
      placa,
      marca: info?.marca || best?.marca,
      modelo: info?.modelo || best?.modelo,
      anoFabricacao: info?.ano ? String(info.ano) : '',
      anoModelo: info?.ano_modelo ? String(info.ano_modelo) : String(best?.ano_modelo ?? ''),
      cor: info?.cor,
      combustivel: info?.combustivel || best?.combustivel,
      codigoFipe,
      valor: (valorBrasilApi ?? (Number.isFinite(valorPlacaFipe) ? valorPlacaFipe : 0)),
      desvalorizometro: best?.desvalorizometro,
      chassi: info?.chassi,
      renavam: '',
      fonte: {
        placaFipeMesReferencia: best?.mes_referencia,
        brasilApi: valorBrasilApi !== null
      }
    });
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro interno ao consultar placa', apiCode: e?.apiCode });
  }
});

// Quotas diárias do token (uso)
app.get('/api/placafipe/quotas', async (_req, res) => {
  try {
    const cacheKey = 'placafipe:quotas';
    const cached = cacheGet(cacheKey);
    if (cached) return res.json(cached);
    const data = await fetchQuotas();
    cacheSet(cacheKey, data, 60 * 1000); // 1 min
    return res.json(data);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro ao consultar quotas', apiCode: e?.apiCode });
  }
});

// Desvalorizômetro (você passa o campo desvalorizometro retornado no getplacafipe)
app.post('/api/placafipe/desvalorizometro', async (req, res) => {
  try {
    const dv = String(req.body?.desvalorizometro || '').trim();
    if (!dv) return res.status(400).json({ message: 'desvalorizometro é obrigatório.' });
    const data = await fetchDesvalorizometro(dv);
    return res.json(data);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro ao consultar desvalorizômetro', apiCode: e?.apiCode });
  }
});

// Endpoints FIPE adicionais (exigem assinatura em alguns casos):
// combustíveis, marcas, modelos, fipebycodigo
app.post('/api/placafipe/combustiveis', async (_req, res) => {
  try {
    const data = await placafipePost('/get-combustiveis', {});
    return res.json(data);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro ao consultar combustíveis', apiCode: e?.apiCode });
  }
});

app.post('/api/placafipe/marcas', async (req, res) => {
  try {
    const body = {};
    if (req.body?.veiculo_tipo !== undefined) body.veiculo_tipo = req.body.veiculo_tipo;
    if (req.body?.data_referencia) body.data_referencia = req.body.data_referencia;
    const data = await placafipePost('/get-marcas', body);
    return res.json(data);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro ao consultar marcas', apiCode: e?.apiCode });
  }
});

app.post('/api/placafipe/modelos', async (req, res) => {
  try {
    const body = {};
    if (req.body?.codigo_marca !== undefined) body.codigo_marca = req.body.codigo_marca;
    if (req.body?.marca_descricao) body.marca_descricao = req.body.marca_descricao;
    if (req.body?.data_referencia) body.data_referencia = req.body.data_referencia;
    const data = await placafipePost('/get-modelos', body);
    return res.json(data);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro ao consultar modelos', apiCode: e?.apiCode });
  }
});

app.post('/api/placafipe/fipebycodigo', async (req, res) => {
  try {
    const codigo_fipe = String(req.body?.codigo_fipe || '').trim();
    const ano = Number(req.body?.ano);
    if (!codigo_fipe) return res.status(400).json({ message: 'codigo_fipe é obrigatório.' });
    if (!Number.isFinite(ano)) return res.status(400).json({ message: 'ano é obrigatório (number).' });
    const data = await placafipePost('/fipebycodigo', { codigo_fipe, ano });
    return res.json(data);
  } catch (e) {
    const status = e?.status || 500;
    return res.status(status).json({ message: e?.message || 'Erro ao consultar FIPE por código', apiCode: e?.apiCode });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, provider: 'placafipe', ts: Date.now() }));

app.listen(PORT, () => {
  console.log(`[orbis-server] rodando em http://localhost:${PORT}`);
});
