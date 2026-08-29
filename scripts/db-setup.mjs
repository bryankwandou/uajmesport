/* Creates the certificate table both sites share.
 *
 * One table, one Neon project, a `site` column telling the two apart. The
 * board's own view needs the recipient's name, so the name lives here — in a
 * private database behind credentials, which is where a roster belongs. It is
 * the public surface that must not carry it: /api/registry returns hashes and
 * never names.
 *
 * Run with:  node scripts/db-setup.mjs
 * Needs DATABASE_URL in the environment or in .env.local.
 */
import { readFileSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

function loadEnv() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const f of [".env.local", ".env.development.local"]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = /^\s*DATABASE_URL\s*=\s*(.+)\s*$/.exec(line);
      if (m) return m[1].replace(/^["']|["']$/g, "");
    }
  }
  throw new Error("DATABASE_URL is not set and no .env.local carries it");
}

const sql = neon(loadEnv());

await sql`
  CREATE TABLE IF NOT EXISTS certificates (
    id          UUID PRIMARY KEY,
    site        TEXT NOT NULL,
    identity_key TEXT NOT NULL,
    full_name   TEXT NOT NULL,
    nim         TEXT NOT NULL DEFAULT '',
    title       TEXT NOT NULL DEFAULT '',
    event       TEXT NOT NULL DEFAULT '',
    issued_at   TEXT NOT NULL DEFAULT '',
    ref         TEXT,
    file_name   TEXT NOT NULL DEFAULT '',
    mime        TEXT NOT NULL DEFAULT '',
    size        INTEGER NOT NULL DEFAULT 0,
    data        TEXT,
    created_at  BIGINT NOT NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`;

// The claim path looks a record up by site and hashed identity, nothing else.
await sql`CREATE INDEX IF NOT EXISTS certificates_site_key_idx ON certificates (site, identity_key)`;
await sql`CREATE INDEX IF NOT EXISTS certificates_site_created_idx ON certificates (site, created_at)`;

// The claim path asks for one hash bucket at a time: identity_key LIKE 'ab12%'.
// A plain btree cannot serve that under a non-C collation, so the prefix index
// is declared with text_pattern_ops.
await sql`CREATE INDEX IF NOT EXISTS certificates_key_prefix_idx ON certificates (site, identity_key text_pattern_ops)`;

const [{ count }] = await sql`SELECT count(*)::int AS count FROM certificates`;
const [{ version }] = await sql`SELECT version()`;
console.log("schema ready on", version.split(",")[0]);
console.log("rows currently stored:", count);
