/* Membuat atau mengatur ulang akun pengelola izin untuk satu situs.
 *
 * Nama dan kata sandi dibaca dari variabel lingkungan saat skrip dijalankan,
 * tidak pernah ditulis ke repo. Yang tersimpan di database hanya hash scrypt
 * dengan salt acak. Sesi lama akun itu ikut dicabut.
 *
 *   SUPER_NAME="Nama Lengkap" SUPER_PASS="..." CERT_SITE=uajmesport \
 *     node scripts/seed-super.mjs
 *
 * DATABASE_URL diambil dari lingkungan atau dari .env.local.
 */
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";

let url = process.env.DATABASE_URL;
if (!url && fs.existsSync(".env.local")) {
  url = fs.readFileSync(".env.local", "utf8").match(/^DATABASE_URL=["']?([^"'\r\n]+)/m)?.[1];
}
const site = process.env.CERT_SITE;
const name = (process.env.SUPER_NAME ?? "").trim().replace(/\s+/g, " ");
const pass = process.env.SUPER_PASS ?? "";
if (!url || !site || !name || pass.length < 10) {
  console.error("Butuh DATABASE_URL, CERT_SITE, SUPER_NAME dan SUPER_PASS (min. 10 karakter).");
  process.exit(1);
}

const sql = neon(url);
await sql`
  CREATE TABLE IF NOT EXISTS admin_accounts (
    site TEXT NOT NULL, ukey TEXT NOT NULL, username TEXT NOT NULL, role TEXT NOT NULL,
    pass_salt TEXT NOT NULL, pass_hash TEXT NOT NULL,
    gallery TEXT NOT NULL DEFAULT 'none', cert TEXT NOT NULL DEFAULT 'none', form TEXT NOT NULL DEFAULT 'none',
    token_ver INTEGER NOT NULL DEFAULT 1, created_at BIGINT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (site, ukey)
  )`;
const salt = randomBytes(16).toString("hex");
const hash = scryptSync(pass, salt, 32).toString("hex");
const ukey = name.toLowerCase();
await sql`
  INSERT INTO admin_accounts (site, ukey, username, role, pass_salt, pass_hash, created_at)
  VALUES (${site}, ${ukey}, ${name}, 'super', ${salt}, ${hash}, ${Date.now()})
  ON CONFLICT (site, ukey) DO UPDATE SET
    role = 'super', pass_salt = EXCLUDED.pass_salt, pass_hash = EXCLUDED.pass_hash,
    token_ver = admin_accounts.token_ver + 1, updated_at = now()`;
console.log(`Pengelola izin "${name}" siap untuk ${site}.`);
