<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>


# UnimaxCRM Pro v2.0 — Protótipo (Local + API Placa FIPE)

Este repositório roda o protótipo do CRM (frontend) e um servidor Node (API) que consulta **PlacaFipe** (placa + FIPE) sem expor o token no navegador.

## Rodar local (do zero)

**Pré-requisitos:** Node.js 18+ (recomendado 20+). O servidor usa `fetch` nativo do Node.


1) Instale dependências:

```bash
npm install
```

2) Configure o ambiente:

- Copie `.env.example` para `.env.local`
- Preencha `PLACAFIPE_TOKEN` com o token do seu plano

```bash
cp .env.example .env.local
```

3) Rode frontend + API juntos:

```bash
npm run dev:full
```

4) Acesse:

- Frontend: http://localhost:3000
- API: http://localhost:8787/api/health

### Endpoints expostos pela API

- `POST /api/placa` → consulta dados do veículo + melhor candidato FIPE
  - body: `{ "placa": "ABC1D23" }`
  - query opcional: `?via=get` para usar o modo GET do provedor (se você precisar)

- `GET /api/placa/:placa` → mesma consulta, porém via rota GET (conveniência)

- `GET /api/placafipe/quotas` → uso de quotas diárias do token

- `POST /api/placafipe/desvalorizometro` → retorna dados do desvalorizômetro
  - body: `{ "desvalorizometro": "..." }`

- (assinatura necessária no provedor) `POST /api/placafipe/combustiveis`

- (assinatura necessária no provedor) `POST /api/placafipe/marcas`
  - body opcional: `{ "veiculo_tipo": 1, "data_referencia": "2024-10-31" }`

- (assinatura necessária no provedor) `POST /api/placafipe/modelos`
  - recomendado: `{ "codigo_marca": 1 }`

- `POST /api/placafipe/fipebycodigo`
  - body: `{ "codigo_fipe": "001337-4", "ano": 2013 }`

As chamadas reais são feitas para:
- `https://api.placafipe.com.br/getplacafipe` (token no servidor)

## Publicar no GitHub (arquivo pronto)

1) Crie um repositório vazio no GitHub (privado ou público).

2) No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "UnimaxCRM Pro v2.0 — base"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### Importante (segurança)

- **Não** suba `.env.local` (o `.gitignore` já bloqueia).
- Como você colou o token em conversa, considere **gerar um novo token** no painel do provedor.


