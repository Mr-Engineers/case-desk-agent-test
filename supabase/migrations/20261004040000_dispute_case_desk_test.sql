-- Case Desk TEST schema (case-desk-agent-test) on Shopping-Warehouse Database.
-- Same tables as dispute_case_desk (case-desk-agent), separate data.
CREATE SCHEMA IF NOT EXISTS dispute_case_desk_test;

CREATE TABLE IF NOT EXISTS dispute_case_desk_test.cases (
  id text PRIMARY KEY,
  txn_id text NOT NULL,
  customer_id text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  fraud_score numeric(4,3) NOT NULL,
  customer_tier text NOT NULL DEFAULT 'standard',
  internal_notes text NOT NULL DEFAULT '',
  reason_code_internal text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispute_case_desk_test.refunds (
  id text PRIMARY KEY,
  case_id text NOT NULL REFERENCES dispute_case_desk_test.cases(id),
  amount_eur numeric(12,2) NOT NULL,
  kind text NOT NULL CHECK (kind IN ('provisional', 'final', 'clawback')),
  status text NOT NULL DEFAULT 'posted',
  posted_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text UNIQUE
);

CREATE TABLE IF NOT EXISTS dispute_case_desk_test.chargeback_intents (
  id text PRIMARY KEY,
  case_id text NOT NULL REFERENCES dispute_case_desk_test.cases(id),
  network_dispute_id text,
  reason_code text NOT NULL,
  evidence_note text,
  status text NOT NULL DEFAULT 'filed',
  filed_at timestamptz NOT NULL DEFAULT now(),
  idempotency_key text UNIQUE
);

CREATE TABLE IF NOT EXISTS dispute_case_desk_test.case_history (
  id bigserial PRIMARY KEY,
  case_id text NOT NULL REFERENCES dispute_case_desk_test.cases(id),
  event_type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cases_txn_id_idx ON dispute_case_desk_test.cases(txn_id);
CREATE INDEX IF NOT EXISTS refunds_case_id_idx ON dispute_case_desk_test.refunds(case_id);

GRANT USAGE ON SCHEMA dispute_case_desk_test TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA dispute_case_desk_test TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA dispute_case_desk_test TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA dispute_case_desk_test TO anon, authenticated;

ALTER TABLE dispute_case_desk_test.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_case_desk_test.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_case_desk_test.chargeback_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_case_desk_test.case_history ENABLE ROW LEVEL SECURITY;
