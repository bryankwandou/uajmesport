import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";

/* Server side of the certificate registry.
 *
 * Both sites share one Neon Postgres and are told apart by CERT_SITE. The
 * recipient's name lives in this table because the board needs to see who is
 * who; what must never carry a name is the public surface, so /api/registry
 * selects the hashed identity and leaves full_name behind. A visitor who
 * fetches every public endpoint still cannot enumerate the roster.
 */

export const SITE = process.env.CERT_SITE ?? "uajmesport";

export type Row = {
  id: string;
  identity_key: string;
  full_name: string;
  nim: string;
  title: string;
  event: string;
  issued_at: string;
  ref: string | null;
  file_name: string;
  mime: string;
  size: number;
  created_at: string | number;
};

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

/* ── accounts ──────────────────────────────────────────────────────────────
   CERT_ACCOUNTS is "user:pass:role,user:pass:role". Keeping it in the
   environment rather than the bundle is the point: the passwords are no
   longer readable in the page source. */
export type Role = "lead" | "sekretaris" | "pembina";
export type Account = { user: string; pass: string; role: Role };

export function accounts(): Account[] {
  return (process.env.CERT_ACCOUNTS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [user, pass, role] = entry.split(":");
      return { user, pass, role: (role as Role) ?? "lead" };
    })
    .filter((a) => a.user && a.pass);
}

/* A stateless bearer token: the account name plus a digest of the password and
   a server-only secret. It cannot be forged without one of the two, and it
   needs no session table. */
function digest(a: Account): string {
  const secret = process.env.DATABASE_URL ?? "";
  return createHash("sha256").update(`${a.user}:${a.pass}:${secret}`).digest("hex");
}

export function issueToken(a: Account): string {
  return `${a.user}.${digest(a)}`;
}

export function verifyToken(header: string | null): Account | null {
  if (!header) return null;
  const token = header.replace(/^Bearer\s+/i, "").trim();
  const at = token.lastIndexOf(".");
  if (at < 1) return null;
  const user = token.slice(0, at);
  const found = accounts().find((a) => a.user === user);
  if (!found) return null;
  return token === issueToken(found) ? found : null;
}

export function unauthorized() {
  return Response.json({ error: "Tidak berwenang." }, { status: 401 });
}

/** Everything the claim page is allowed to see: no name, no NIM. */
export function publicShape(r: Row) {
  return {
    id: r.id,
    key: r.identity_key,
    title: r.title,
    event: r.event,
    issuedAt: r.issued_at,
    ref: r.ref ?? undefined,
    fileName: r.file_name,
    mime: r.mime,
    size: r.size,
    createdAt: Number(r.created_at),
  };
}

/** What the dashboard sees once an account has signed in. */
export function adminShape(r: Row) {
  return { ...publicShape(r), fullName: r.full_name, nim: r.nim };
}
