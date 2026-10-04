import "dotenv/config";

export function getDatabaseUrl(): string {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  if (password) {
    const ref = process.env.SUPABASE_PROJECT_REF?.trim() || "wldjpcuaqxzmmiosivzi";
    const region = process.env.SUPABASE_REGION?.trim() || "eu-central-1";
    return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-1-${region}.pooler.supabase.com:5432/postgres`;
  }

  throw new Error(
    "Missing DATABASE_URL (or SUPABASE_DB_PASSWORD) for Shopping-Warehouse Database",
  );
}

/**
 * Postgres schema of the Case Desk tables. The test deployment uses its own schema
 * (dispute_case_desk_test) in the same database as case-desk-agent (dispute_case_desk).
 */
export function getDbSchema(): string {
  const schema = process.env.DB_SCHEMA?.trim() || "dispute_case_desk_test";
  if (!/^[a-z_][a-z0-9_]*$/.test(schema)) {
    throw new Error(`Invalid DB_SCHEMA: ${schema}`);
  }
  return schema;
}

export function getMcpApiKey(): string | undefined {
  const key = process.env.MCP_API_KEY?.trim();
  return key || undefined;
}

export function getHost(): string {
  return process.env.MCP_HOST?.trim() || "127.0.0.1";
}

/**
 * Host headers accepted when bound to a non-loopback address (comma-separated, without ports).
 * Empty: no Host check - behind Service Connect / a load balancer the Host header is the
 * service name, the ALB DNS name or the task IP; access is protected by MCP_API_KEY.
 */
export function getAllowedHosts(): string[] | undefined {
  const hosts = (process.env.MCP_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);
  return hosts.length ? hosts : undefined;
}

export function getPort(envName: string, fallback: number): number {
  const raw = process.env[envName]?.trim();
  if (!raw) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`Invalid port in ${envName}: ${raw}`);
  }
  return n;
}
