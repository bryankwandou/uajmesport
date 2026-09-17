import { accounts, db, forbidden, SITE, unauthorized, verifyToken, type Account } from "@/lib/db";

/* Izin per akun, diatur oleh pengelola izin dari dasbornya sendiri.
 *
 * Tiap modul punya tiga tingkat:
 *   none  – modul tidak tampil sama sekali
 *   post  – boleh menerbitkan yang baru saja
 *   full  – boleh menerbitkan, mengubah dan menghapus
 * Akun yang belum pernah diatur tetap "full", jadi akun lama bekerja persis
 * seperti sebelum fitur ini ada.
 */
export type Level = "none" | "post" | "full";
export type Perms = { gallery: Level; cert: Level };
export type Module = keyof Perms;

const DEFAULT: Perms = { gallery: "full", cert: "full" };
const LEVELS: Level[] = ["none", "post", "full"];

export function isLevel(v: unknown): v is Level {
  return typeof v === "string" && (LEVELS as string[]).includes(v);
}

export function atLeast(have: Level, need: Level): boolean {
  return LEVELS.indexOf(have) >= LEVELS.indexOf(need);
}

/* Tabel dibuat sendiri pada permintaan pertama tiap instance, jadi deploy baru
   tidak butuh langkah migrasi manual. Semua pernyataan idempoten. */
let schemaReady: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const sql = db();
    await sql`
      CREATE TABLE IF NOT EXISTS admin_perms (
        site       TEXT NOT NULL,
        username   TEXT NOT NULL,
        gallery    TEXT NOT NULL DEFAULT 'full',
        cert       TEXT NOT NULL DEFAULT 'full',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (site, username)
      )`;
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

export async function permsFor(a: Account): Promise<Perms> {
  if (a.role === "super") return { gallery: "none", cert: "none" };
  await ensureSchema();
  const rows = (await db()`
    SELECT gallery, cert FROM admin_perms WHERE site = ${SITE} AND username = ${a.user}
  `) as unknown as { gallery: string; cert: string }[];
  const r = rows[0];
  return {
    gallery: isLevel(r?.gallery) ? r.gallery : DEFAULT.gallery,
    cert: isLevel(r?.cert) ? r.cert : DEFAULT.cert,
  };
}

export type AccountPerms = { user: string; role: string; perms: Perms };

export async function listPerms(): Promise<AccountPerms[]> {
  const out: AccountPerms[] = [];
  for (const a of accounts()) out.push({ user: a.user, role: a.role, perms: await permsFor(a) });
  return out;
}

export async function setPerms(user: string, p: Perms): Promise<void> {
  await ensureSchema();
  await db()`
    INSERT INTO admin_perms (site, username, gallery, cert)
    VALUES (${SITE}, ${user}, ${p.gallery}, ${p.cert})
    ON CONFLICT (site, username) DO UPDATE SET
      gallery = EXCLUDED.gallery, cert = EXCLUDED.cert, updated_at = now()
  `;
}

/* Satu pintu untuk setiap route admin: token sah, lalu tingkat izin cukup.
   Mengembalikan akun + izinnya, atau Response penolakan yang siap dikirim. */
export async function guard(
  req: Request,
  module: Module | "super",
  need: Level = "post",
): Promise<{ account: Account; perms: Perms } | Response> {
  const account = verifyToken(req.headers.get("authorization"));
  if (!account) return unauthorized();
  if (module === "super") {
    return account.role === "super" ? { account, perms: DEFAULT } : forbidden();
  }
  const perms = await permsFor(account);
  if (!atLeast(perms[module], need)) return forbidden();
  return { account, perms };
}
