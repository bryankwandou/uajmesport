import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, SITE } from "@/lib/db";

/* Akun dasbor — satu tabel, satu sumber kebenaran.
 *
 * Kata sandi hanya disimpan sebagai hash scrypt dengan salt acak per akun, di
 * database. Tidak ada kata sandi, salt, maupun hash di kode sumber (repo ini
 * publik). Pengelola izin membuat, mengganti nama, mengganti kata sandi dan
 * menghapus akun dari dasbornya; tidak ada yang perlu diubah lewat kode.
 *
 * Token sesi ditandatangani HMAC dan membawa `token_ver`. Mengganti kata sandi,
 * mengganti nama atau menghapus akun menaikkan versi itu, sehingga semua sesi
 * lama akun tersebut langsung mati. Sesi juga habis sendiri setelah 12 jam.
 */

export type Role = "lead" | "sekretaris" | "bendahara" | "pembina" | "staff" | "super";
export const ROLES: Role[] = ["lead", "sekretaris", "bendahara", "pembina", "staff", "super"];
export type Level = "none" | "post" | "full";
export type Perms = { gallery: Level; cert: Level; form: Level };
export type Module = keyof Perms;
export const MODULES: Module[] = ["gallery", "cert", "form"];
const LEVELS: Level[] = ["none", "post", "full"];

export type Account = { user: string; key: string; role: Role; perms: Perms; ver: number; createdAt: number };

type Row = {
  username: string;
  ukey: string;
  role: string;
  pass_salt: string;
  pass_hash: string;
  gallery: string;
  cert: string;
  form: string;
  token_ver: number;
  created_at: string | number;
};

export function isLevel(v: unknown): v is Level {
  return typeof v === "string" && (LEVELS as string[]).includes(v);
}
export function isModule(v: unknown): v is Module {
  return typeof v === "string" && (MODULES as string[]).includes(v);
}
export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as string[]).includes(v);
}
export function atLeast(have: Level, need: Level): boolean {
  return LEVELS.indexOf(have) >= LEVELS.indexOf(need);
}

/** Nama dicocokkan tanpa peduli huruf besar/kecil dan spasi ganda. */
export function nameKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export const USER_RE = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{1,38}[\p{L}\p{N}]$/u;
export const MIN_PASS = 10;

export function checkPassword(pass: unknown): string | null {
  if (typeof pass !== "string" || pass.length < MIN_PASS) return `Kata sandi minimal ${MIN_PASS} karakter.`;
  if (pass.length > 200) return "Kata sandi terlalu panjang.";
  if (!/[A-Za-z]/.test(pass) || !/[0-9]/.test(pass)) return "Kata sandi harus memuat huruf dan angka.";
  return null;
}

function hashPass(pass: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(pass, salt, 32).toString("hex") };
}

function toAccount(r: Row): Account {
  const role = isRole(r.role) ? r.role : "staff";
  const lvl = (v: string): Level => (role === "super" ? "none" : isLevel(v) ? v : "none");
  return {
    user: r.username,
    key: r.ukey,
    role,
    perms: { gallery: lvl(r.gallery), cert: lvl(r.cert), form: lvl(r.form) },
    ver: Number(r.token_ver),
    createdAt: Number(r.created_at),
  };
}

/* ── skema ────────────────────────────────────────────────────────────────
   Dibuat sendiri pada permintaan pertama tiap instance. Akun lama dari env
   CERT_ACCOUNTS dipindahkan sekali ke tabel (kata sandinya di-hash), lengkap
   dengan izin yang sudah diatur di admin_perms. Setelah itu env tidak dibaca
   lagi — tabel inilah sumbernya. */
let ready: Promise<void> | null = null;
export function ensureAccounts(): Promise<void> {
  ready ??= (async () => {
    const sql = db();
    await sql`
      CREATE TABLE IF NOT EXISTS admin_accounts (
        site       TEXT NOT NULL,
        ukey       TEXT NOT NULL,
        username   TEXT NOT NULL,
        role       TEXT NOT NULL,
        pass_salt  TEXT NOT NULL,
        pass_hash  TEXT NOT NULL,
        gallery    TEXT NOT NULL DEFAULT 'none',
        cert       TEXT NOT NULL DEFAULT 'none',
        form       TEXT NOT NULL DEFAULT 'none',
        token_ver  INTEGER NOT NULL DEFAULT 1,
        created_at BIGINT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (site, ukey)
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS login_attempts (
        site     TEXT NOT NULL,
        client   TEXT NOT NULL,
        fails    INTEGER NOT NULL DEFAULT 0,
        first_at BIGINT NOT NULL,
        PRIMARY KEY (site, client)
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        site       TEXT NOT NULL,
        key        TEXT NOT NULL,
        value      TEXT NOT NULL,
        updated_by TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        PRIMARY KEY (site, key)
      )`;
    await sql`
      CREATE TABLE IF NOT EXISTS admin_audit (
        id     BIGSERIAL PRIMARY KEY,
        site   TEXT NOT NULL,
        actor  TEXT NOT NULL,
        action TEXT NOT NULL,
        detail TEXT NOT NULL DEFAULT '',
        at     TIMESTAMPTZ NOT NULL DEFAULT now()
      )`;
    const [{ n }] = (await sql`SELECT count(*)::int AS n FROM admin_accounts WHERE site = ${SITE} AND role <> 'super'`) as {
      n: number;
    }[];
    if (n === 0) await importEnvAccounts();
  })().catch((e) => {
    ready = null;
    throw e;
  });
  return ready;
}

async function importEnvAccounts() {
  const sql = db();
  const legacy = (process.env.CERT_ACCOUNTS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean)
    .map((e) => {
      const [user, pass, role] = e.split(":");
      return { user, pass, role: isRole(role) && role !== "super" ? role : "lead" };
    })
    .filter((a) => a.user && a.pass);
  let old: { username: string; gallery: string; cert: string }[] = [];
  try {
    old = (await sql`SELECT username, gallery, cert FROM admin_perms WHERE site = ${SITE}`) as typeof old;
  } catch {
    /* tabel lama belum pernah ada */
  }
  for (const a of legacy) {
    const p = old.find((o) => o.username === a.user);
    const { salt, hash } = hashPass(a.pass);
    await sql`
      INSERT INTO admin_accounts (site, ukey, username, role, pass_salt, pass_hash, gallery, cert, form, created_at)
      VALUES (${SITE}, ${nameKey(a.user)}, ${a.user}, ${a.role}, ${salt}, ${hash},
              ${isLevel(p?.gallery) ? p.gallery : "full"}, ${isLevel(p?.cert) ? p.cert : "full"}, 'full', ${Date.now()})
      ON CONFLICT (site, ukey) DO NOTHING`;
  }
}

async function rowByKey(key: string): Promise<Row | null> {
  await ensureAccounts();
  const rows = (await db()`SELECT * FROM admin_accounts WHERE site = ${SITE} AND ukey = ${key}`) as Row[];
  return rows[0] ?? null;
}

export async function findAccount(name: string): Promise<Account | null> {
  const r = await rowByKey(nameKey(name));
  return r ? toAccount(r) : null;
}

export async function listAccounts(): Promise<Account[]> {
  await ensureAccounts();
  const rows = (await db()`
    SELECT * FROM admin_accounts WHERE site = ${SITE} ORDER BY (role = 'super') DESC, created_at, username
  `) as Row[];
  return rows.map(toAccount);
}

/* ── login ────────────────────────────────────────────────────────────── */
const DUMMY = hashPass("tidak-pernah-cocok");

export async function checkLogin(name: string, pass: string): Promise<Account | null> {
  const r = await rowByKey(nameKey(name));
  // Tetap menghitung scrypt untuk nama yang tidak ada, supaya waktu respons
  // tidak membocorkan nama mana yang terdaftar.
  const salt = r?.pass_salt ?? DUMMY.salt;
  const want = Buffer.from(r?.pass_hash ?? DUMMY.hash, "hex");
  const got = scryptSync(pass, salt, 32);
  return r && timingSafeEqual(got, want) ? toAccount(r) : null;
}

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS = 8;

export function clientId(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  return (fwd.split(",")[0] || req.headers.get("x-real-ip") || "unknown").trim().slice(0, 64);
}

/** Sisa detik penguncian, atau 0 bila boleh mencoba. */
export async function lockedFor(client: string): Promise<number> {
  await ensureAccounts();
  const rows = (await db()`SELECT fails, first_at FROM login_attempts WHERE site = ${SITE} AND client = ${client}`) as {
    fails: number;
    first_at: string | number;
  }[];
  const r = rows[0];
  if (!r) return 0;
  const age = Date.now() - Number(r.first_at);
  if (age > WINDOW_MS) return 0;
  return r.fails >= MAX_FAILS ? Math.ceil((WINDOW_MS - age) / 1000) : 0;
}

export async function noteLogin(client: string, ok: boolean) {
  const sql = db();
  if (ok) {
    await sql`DELETE FROM login_attempts WHERE site = ${SITE} AND client = ${client}`;
    return;
  }
  const now = Date.now();
  await sql`
    INSERT INTO login_attempts (site, client, fails, first_at) VALUES (${SITE}, ${client}, 1, ${now})
    ON CONFLICT (site, client) DO UPDATE SET
      fails    = CASE WHEN ${now} - login_attempts.first_at > ${WINDOW_MS} THEN 1 ELSE login_attempts.fails + 1 END,
      first_at = CASE WHEN ${now} - login_attempts.first_at > ${WINDOW_MS} THEN ${now} ELSE login_attempts.first_at END`;
}

/* ── token ────────────────────────────────────────────────────────────── */
const SESSION_MS = 12 * 3600 * 1000;

function secret(): string {
  const s = process.env.SESSION_SECRET || process.env.DATABASE_URL;
  if (!s) throw new Error("SESSION_SECRET is not configured");
  return s;
}

function sign(body: string): string {
  return createHmac("sha256", secret()).update(`${SITE}.${body}`).digest("base64url");
}

export function issueToken(a: Account): string {
  const body = Buffer.from(JSON.stringify({ k: a.key, v: a.ver, e: Date.now() + SESSION_MS })).toString("base64url");
  return `${body}.${sign(body)}`;
}

export async function verifyToken(header: string | null): Promise<Account | null> {
  if (!header) return null;
  const token = header.replace(/^Bearer\s+/i, "").trim();
  const dot = token.indexOf(".");
  if (dot < 1 || token.length > 600) return null;
  const body = token.slice(0, dot);
  const mac = Buffer.from(token.slice(dot + 1));
  const want = Buffer.from(sign(body));
  if (mac.length !== want.length || !timingSafeEqual(mac, want)) return null;
  let p: { k?: string; v?: number; e?: number };
  try {
    p = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (typeof p.k !== "string" || typeof p.e !== "number" || p.e < Date.now()) return null;
  const r = await rowByKey(p.k);
  if (!r || Number(r.token_ver) !== p.v) return null;
  return toAccount(r);
}

/* ── pengelolaan akun (hanya pengelola izin) ─────────────────────────── */
export async function audit(actor: string, action: string, detail = "") {
  try {
    await db()`INSERT INTO admin_audit (site, actor, action, detail) VALUES (${SITE}, ${actor}, ${action}, ${detail.slice(0, 500)})`;
  } catch {
    /* log bukan syarat keberhasilan */
  }
}

export async function createAccount(user: string, pass: string, role: Role): Promise<Account> {
  const { salt, hash } = hashPass(pass);
  const rows = (await db()`
    INSERT INTO admin_accounts (site, ukey, username, role, pass_salt, pass_hash, gallery, cert, form, created_at)
    VALUES (${SITE}, ${nameKey(user)}, ${user.trim().replace(/\s+/g, " ")}, ${role}, ${salt}, ${hash},
            'none', 'none', 'none', ${Date.now()})
    ON CONFLICT (site, ukey) DO NOTHING
    RETURNING *`) as Row[];
  if (!rows[0]) throw new Error("Nama akun sudah dipakai.");
  return toAccount(rows[0]);
}

export async function setPassword(key: string, pass: string) {
  const { salt, hash } = hashPass(pass);
  await db()`
    UPDATE admin_accounts SET pass_salt = ${salt}, pass_hash = ${hash}, token_ver = token_ver + 1, updated_at = now()
    WHERE site = ${SITE} AND ukey = ${key}`;
}

export async function renameAccount(key: string, user: string) {
  const rows = (await db()`
    UPDATE admin_accounts SET ukey = ${nameKey(user)}, username = ${user.trim().replace(/\s+/g, " ")},
           token_ver = token_ver + 1, updated_at = now()
    WHERE site = ${SITE} AND ukey = ${key}
      AND NOT EXISTS (SELECT 1 FROM admin_accounts o WHERE o.site = ${SITE} AND o.ukey = ${nameKey(user)} AND o.ukey <> ${key})
    RETURNING ukey`) as { ukey: string }[];
  if (!rows[0]) throw new Error("Nama akun sudah dipakai.");
}

export async function setRole(key: string, role: Role) {
  await db()`UPDATE admin_accounts SET role = ${role}, updated_at = now() WHERE site = ${SITE} AND ukey = ${key} AND role <> 'super'`;
}

/** Mengubah SATU modul saja, jadi dua sakelar yang ditekan berdekatan tidak
    saling menimpa. */
export async function setLevel(key: string, module: Module, level: Level) {
  const sql = db();
  if (module === "gallery") await sql`UPDATE admin_accounts SET gallery = ${level}, updated_at = now() WHERE site = ${SITE} AND ukey = ${key} AND role <> 'super'`;
  if (module === "cert") await sql`UPDATE admin_accounts SET cert = ${level}, updated_at = now() WHERE site = ${SITE} AND ukey = ${key} AND role <> 'super'`;
  if (module === "form") await sql`UPDATE admin_accounts SET form = ${level}, updated_at = now() WHERE site = ${SITE} AND ukey = ${key} AND role <> 'super'`;
}

export async function deleteAccount(key: string) {
  await db()`DELETE FROM admin_accounts WHERE site = ${SITE} AND ukey = ${key}`;
}
