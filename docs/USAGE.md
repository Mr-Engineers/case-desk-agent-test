# How to use Case Desk

## Stack

Matches `card-network-agent`: TypeScript, MCP Express, `postgres`, Zod, OpenAPI/Postman.

## Start

```bash
cp .env.example .env   # DATABASE_URL
npm install
npm run seed
npm run start          # http://127.0.0.1:4102
```

## OpenAPI & Postman

| URL | What |
|---|---|
| `http://127.0.0.1:4102/openapi.json` | OpenAPI 3.1 |
| `http://127.0.0.1:4102/openapi.yaml` | YAML |
| `http://127.0.0.1:4102/postman.json` | Collection |

Repo files:

- `openapi/dispute-case-desk.openapi.yaml`
- `postman/dispute-case-desk.postman_collection.json`
- `postman/dispute-ops.postman_environment.json`

### Postman

1. Import collection + environment
2. Run **Ops → Demo reset**
3. **REST mirrors → GET case_189_unrecognized**
4. Set `apiKey` if `MCP_API_KEY` is configured

### curl

```bash
curl http://127.0.0.1:4102/health
curl -X POST http://127.0.0.1:4102/demo/reset
curl http://127.0.0.1:4102/v1/cases/case_189_unrecognized
curl -X POST http://127.0.0.1:4102/v1/refunds \
  -H "Content-Type: application/json" \
  -d "{\"case_id\":\"case_189_unrecognized\",\"amount_eur\":189,\"kind\":\"provisional\"}"
```

## MCP / Modus

Register `http://127.0.0.1:4102/mcp` as **Case Desk**.  
For the full dispute journey, also run Network Portal from `card-network-agent` on `:4101`.
