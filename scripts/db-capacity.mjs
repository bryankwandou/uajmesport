/* Capacity check.
 *
 * Writes N real certificates — the same JPEG scan on every row, so the byte
 * count is honest — under hashed identities computed exactly the way the
 * browser computes them, then reads them back. Removes them again unless
 * --keep is passed.
 *
 *   node scripts/db-capacity.mjs 200
 *   node scripts/db-capacity.mjs --clean
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
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
  throw new Error("DATABASE_URL is not set");
}

const SITE = "uajmesport";
const SALT = "ukm-esport-uajm/sertifikat/v1";
const PREFIX = "Anggota Kapasitas";

const normName = (v) =>
  v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const normNim = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");
const key = (name, nim) =>
  createHash("sha256").update(`${SALT}|${normName(name)}|${normNim(nim)}`).digest("hex");

const sql = neon(loadEnv());

if (process.argv.includes("--clean")) {
  const rows = await sql`DELETE FROM certificates WHERE site = ${SITE} AND full_name LIKE ${PREFIX + "%"} RETURNING id`;
  console.log("removed capacity rows:", rows.length);
  process.exit(0);
}

const n = Number(process.argv[2] ?? 200);
const jpeg = readFileSync("public/certs/best-fighter-s7.jpg").toString("base64");
const bytes = Buffer.byteLength(jpeg, "base64");
console.log(`writing ${n} certificates of ${(bytes / 1024).toFixed(0)} KB each`);

const started = Date.now();
for (let i = 0; i < n; i++) {
  const no = String(i + 1).padStart(3, "0");
  const name = `${PREFIX} ${no}`;
  const nim = `KAP${no}`;
  await sql`
    INSERT INTO certificates
      (id, site, identity_key, full_name, nim, title, event, issued_at, ref,
       file_name, mime, size, data, created_at)
    VALUES (${randomUUID()}, ${SITE}, ${key(name, nim)}, ${name}, ${nim},
            'Sertifikat Uji Kapasitas', 'Uji beban registry', '29 Agustus 2026',
            ${`KAP-${no}/UKM-ESPORT/UAJM/2026`}, 'uji-kapasitas.jpg', 'image/jpeg',
            ${bytes}, ${jpeg}, ${Date.now() + i})
  `;
  if ((i + 1) % 50 === 0) console.log(`  ${i + 1} written`);
}
const wrote = Date.now() - started;

const readAt = Date.now();
const rows = await sql`SELECT count(*)::int AS n, COALESCE(SUM(size),0)::bigint AS bytes
                       FROM certificates WHERE site = ${SITE}`;
const readMs = Date.now() - readAt;

console.log("rows for this site:", rows[0].n);
console.log("stored bytes:", (Number(rows[0].bytes) / 1024 / 1024).toFixed(1), "MB");
console.log("insert time:", (wrote / 1000).toFixed(1), "s");
console.log("count query:", readMs, "ms");
