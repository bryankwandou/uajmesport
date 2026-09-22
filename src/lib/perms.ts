import { db, forbidden, unauthorized } from "@/lib/db";
import { atLeast, ensureAccounts, verifyToken, type Account, type Level, type Module } from "@/lib/accounts";

export { atLeast, isLevel } from "@/lib/accounts";
export type { Level, Module, Perms } from "@/lib/accounts";

/* Izin per akun, diatur pengelola izin dari dasbornya sendiri.
 *
 * Tiap modul punya tiga tingkat:
 *   none  – modul tidak tampil dan setiap route-nya menolak (403)
 *   post  – boleh menerbitkan yang baru saja
 *   full  – boleh menerbitkan, mengubah dan menghapus
 * Izin dibaca dari database pada SETIAP permintaan, jadi mencabut izin berlaku
 * seketika, termasuk untuk sesi yang sedang terbuka.
 */

/* Tabel galeri dibuat sendiri pada permintaan pertama tiap instance. */
let schemaReady: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    await ensureAccounts();
    const sql = db();
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_posts (
        id         UUID PRIMARY KEY,
        site       TEXT NOT NULL,
        caption    TEXT NOT NULL DEFAULT '',
        category   TEXT NOT NULL DEFAULT 'kegiatan',
        taken_at   TEXT NOT NULL DEFAULT '',
        author     TEXT NOT NULL DEFAULT '',
        images     INTEGER NOT NULL DEFAULT 0,
        width      INTEGER NOT NULL DEFAULT 0,
        height     INTEGER NOT NULL DEFAULT 0,
        created_at BIGINT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    await sql`CREATE INDEX IF NOT EXISTS gallery_posts_site_idx ON gallery_posts (site, created_at DESC)`;
    await sql`
      CREATE TABLE IF NOT EXISTS gallery_images (
        post_id UUID NOT NULL REFERENCES gallery_posts(id) ON DELETE CASCADE,
        idx     INTEGER NOT NULL,
        mime    TEXT NOT NULL,
        data    TEXT NOT NULL,
        PRIMARY KEY (post_id, idx)
      )`;
  })().catch((e) => {
    schemaReady = null;
    throw e;
  });
  return schemaReady;
}

/* Satu pintu untuk setiap route admin: token sah dan belum dicabut, lalu
   tingkat izin cukup. Mengembalikan akun, atau Response penolakan. */
export async function guard(
  req: Request,
  module: Module | "super",
  need: Level = "post",
): Promise<{ account: Account; perms: Account["perms"] } | Response> {
  let account: Account | null;
  try {
    account = await verifyToken(req.headers.get("authorization"));
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Sesi tidak dapat diperiksa." }, { status: 500 });
  }
  if (!account) return unauthorized();
  if (module === "super") return account.role === "super" ? { account, perms: account.perms } : forbidden();
  if (account.role === "super" || !atLeast(account.perms[module], need)) return forbidden();
  return { account, perms: account.perms };
}
