import { neon } from "@neondatabase/serverless";

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

/* Akun, kata sandi dan token sesi ada di src/lib/accounts.ts. Tidak ada
   kredensial di file ini maupun di bagian lain kode sumber. */

export function unauthorized() {
  return Response.json({ error: "Tidak berwenang." }, { status: 401 });
}

export function forbidden(msg = "Akun ini tidak punya izin untuk tindakan tersebut.") {
  return Response.json({ error: msg }, { status: 403 });
}

/* Everything the claim page is allowed to see.
 *
 * No name, no NIM — and, just as importantly, nothing that can address a
 * stored file. The row id is gone and the identity hash is truncated to 16 hex
 * characters, which is plenty for the browser to recognise its own row after
 * it has computed the full hash locally, and useless for fetching anything.
 *
 * That matters because the certificate itself carries the name. An earlier
 * shape published the id, and the id alone opened the document: walking the
 * 65,536 hash buckets would have handed a stranger every member's sheet. The
 * file route now demands the full 64-character hash, which cannot be derived
 * from anything on this response. */
export function publicShape(r: Row) {
  return {
    k16: r.identity_key.slice(0, 16),
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
  return {
    id: r.id,
    key: r.identity_key,
    fullName: r.full_name,
    nim: r.nim,
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
