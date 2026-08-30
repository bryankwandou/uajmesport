/* End-to-end verification of every issued certificate.
 *
 * For each of the 22 members: compute the identity hash the way the browser
 * does, ask production for the file exactly as a member's browser would, and
 * compare the bytes against the sheet in the board's own zip. No trust in the
 * database is assumed — the comparison is against the original export.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const ROOT = "E:/000VSCODE PROJECT MULAI DARI DESEMBER 2025/uajmesport";
const ZIP = "C:/Users/arche/AppData/Local/Temp/claude/E--Download-BAHAN-UAJMESPORT-VERCEL-APP/752865a4-c62b-4fab-8ead-ce8b1a4896c6/scratchpad/realcerts";
const BASE = "https://uajmesport.vercel.app";
const SALT = "ukm-esport-uajm/sertifikat/v1";

const SHEETS = [
  [1, "Vincentius Bryan Kwandou"], [2, "Anneliese Trevina Wijaya"],
  [3, "Felisitas Natasya Lady Claudia"], [4, "Deagustino Lallo"],
  [5, "Athallah Eriel"], [6, "Marvel Harjosetio"],
  [7, "Venilia Dina Minarti"], [8, "Avelita Jaquline Ampulembang"],
  [9, "Valentino Filemon Limer"], [10, "Daniel Advent Ramba"],
  [11, "Melinda Chandra"], [12, "Isabella"], [13, "Davin Keiko Lim"],
  [14, "Bryan Michelangelo Mengku"], [15, "Firman Kaleb"],
  [16, "Edmun Hosni Thamrin"], [17, "Rivaldo Charlie Hermawan"],
  [18, "Putra Purwanugraha Tengbunan"], [19, "Felix Hwinardy"],
  [20, "Denis Juandri"], [21, "Owen Liem"], [22, "Mighdad Abdul Fattah Jaba"],
];

const url = readFileSync(ROOT + "/.env.local", "utf8")
  .split(/\r?\n/).find((l) => l.startsWith("DATABASE_URL=")).slice(13);
const sql = neon(url);

const normName = (v) =>
  v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const normNim = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");
const key = (n, m) => createHash("sha256").update(`${SALT}|${normName(n)}|${normNim(m)}`).digest("hex");
const sha = (b) => createHash("sha256").update(b).digest("hex");
const redact = (n) => n.split(" ")[0] + " " + n.split(" ").slice(1).map((w) => w[0] + ".").join(" ");

const rows = await sql`SELECT full_name, nim, created_at, size FROM certificates WHERE site = 'uajmesport'`;
const byName = new Map(rows.map((r) => [normName(r.full_name), r]));

let ok = 0;
const problems = [];

for (const [n, name] of SHEETS) {
  const row = byName.get(normName(name));
  if (!row) { problems.push(`${redact(name)}: tidak ada baris di database`); continue; }

  const k = key(row.full_name, row.nim);
  const res = await fetch(`${BASE}/api/file?k=${k}&c=${row.created_at}`);
  if (!res.ok) { problems.push(`${redact(name)}: produksi menjawab ${res.status}`); continue; }

  const served = Buffer.from(await res.arrayBuffer());
  const original = readFileSync(`${ZIP}/${n}.png`);

  if (sha(served) !== sha(original)) {
    problems.push(`${redact(name)}: byte berbeda (${served.length} vs ${original.length})`);
    continue;
  }
  // The bucket the browser would ask for must also contain this row.
  const bucket = await (await fetch(`${BASE}/api/registry?p=${k.slice(0, 4)}`)).json();
  const found = Array.isArray(bucket) && bucket.some((b) => b.k16 === k.slice(0, 16));
  if (!found) { problems.push(`${redact(name)}: tidak ditemukan di ember ${k.slice(0, 4)}`); continue; }

  ok++;
  process.stdout.write(`  ${String(n).padStart(2)}. ${redact(name).padEnd(24)} ${served.length} B  identik\n`);
}

console.log("");
console.log("cocok sempurna :", ok, "dari", SHEETS.length);
console.log("bermasalah     :", problems.length);
for (const p of problems) console.log("  " + p);
