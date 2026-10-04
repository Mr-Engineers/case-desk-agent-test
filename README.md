# Case Desk Agent (test)

Bank-internal **Case Desk** MCP for the Modus dispute-ops demo.

Same tech stack as [`card-network-agent`](../card-network-agent/):

- TypeScript (Node 20+)
- `@modelcontextprotocol/server` + Express streamable HTTP
- `postgres` → Shopping-Warehouse schema `dispute_case_desk`
- Zod tool schemas
- OpenAPI + Postman served from the process

| | |
|---|---|
| MCP | `http://127.0.0.1:4102/mcp` |
| Schema | `dispute_case_desk` |
| Pair | Network Portal in `card-network-agent` (`:4101`) |

Plans: [`plans/dispute-ops/`](./plans/dispute-ops/).  
Usage: [`docs/USAGE.md`](./docs/USAGE.md).

## Setup

```bash
cp .env.example .env
# set DATABASE_URL (Supabase → Shopping-Warehouse → Database)
npm install
npm run seed
npm run start          # or: npm run dev
```

| Endpoint | Purpose |
|---|---|
| `GET /health` | liveness |
| `POST /demo/reset` | restore Case Desk fixtures |
| `GET /openapi.json` | OpenAPI 3.1 |
| `GET /postman.json` | Postman collection |
| `POST /mcp` | MCP (Modus / agents) |
| `/v1/*` | REST mirrors for Postman |

## MCP tools

| Tool | Notes |
|---|---|
| `case.list` / `case.get` / `case.update` | reads + low-risk write |
| `refund.post` / `refund.adjust` | money mutations (idempotent keys) |
| `chargeback.file` | irreversible ops path |
| `demo.reset` | seed reset |

## Fixtures

| Id | Role |
|---|---|
| `case_189_unrecognized` | €189 / `txn_189_travel`, fraud 0.55 |
| `case_12_clear_fraud` | clear fraud, fraud 0.92 |
| `case_88_low_trust` | weak merchant path |
| `case_64_chargeback_ready` | happy chargeback |
| `case_650_overcap` | hard-cap / over-refund |
| `case_12_adjust` + `ref_adjust_seed` | adjust demos |

## Modus

```bash
CASE_DESK_MCP_URL=http://127.0.0.1:4102/mcp
NETWORK_MCP_URL=http://127.0.0.1:4101/mcp
DEMO_SEED=dispute_v1
```

## Test copy

Copy of [case-desk-agent](https://github.com/Mr-Engineers/case-desk-agent) for the direct agent
(tests), like `test-backend-one` for `one-backend`: same code and database, own schema.
Every query goes to `DB_SCHEMA` (default `dispute_case_desk_test`), set in one place:
`SCHEMA` in `src/shared/db.ts`. Create the schema once with
`supabase/migrations/20261004040000_dispute_case_desk_test.sql`, then `npm run seed`
(or `POST /demo/reset`). It does not touch `dispute_case_desk`.

## AWS (ECS)

Runs as the `one-dev-case-desk-test` service in `one-dev-cluster`: `http://case-desk-test:4102`
(Service Connect, proxy-server) and `http://case-desk-test.one-dev.internal:4102` (Cloud Map DNS,
for the one-off direct agent). `MCP_API_KEY` is the test-backend's gateway token
(`/one/dev/test-backend/GATEWAY_TOKEN`), which the direct agent already gets.

CI (`.github/workflows/deploy.yml`): push to `main` -> typecheck, image to ECR
`one-dev-case-desk-test`, new deployment of the service. Infrastructure:
`one-infrastructure/ecs_case_desk.tf`.
