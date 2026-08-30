/* Replaces every generated sheet with the certificate the board actually
 * issued.
 *
 * The organisation had already designed and signed these — two logos, the
 * chair's signature, the faculty supervisor's name — and my generated PDFs
 * were a stand-in built before I had seen them. A stand-in must not outlive
 * the real document, so this overwrites rather than adds.
 *
 * The mapping below is read off the sheets themselves, not guessed from the
 * file numbering. Files 23 and 26 are blank spares and 24 and 25 duplicate the
 * chair under a different heading, so all four are skipped: a registry should
 * hold one issued document per person.
 *
 *   node scripts/import-real-certificates.mjs "<folder of png files>"
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";

const SITE = "uajmesport";
const TITLE = "Sertifikat Keanggotaan";
const PERIOD = "UKM E-Sport UAJM, Periode I (Tahun Akademik 2025/2026)";
const ISSUED = "Tahun Akademik 2025/2026";

/** file number -> [name as printed on the sheet, role as printed on the sheet] */
const SHEETS = [
  [1, "Vincentius Bryan Kwandou", "Ketua"],
  [2, "Anneliese Trevina Wijaya", "Sekretaris"],
  [3, "Felisitas Natasya Lady Claudia", "Bendahara"],
  [4, "Deagustino Lallo", "Divisi Turnamen & Kompetisi"],
  [5, "Athallah Eriel", "Divisi Pelatihan & Pengembangan"],
  [6, "Marvel Harjosetio", "Divisi Kreatif & Konten Digital"],
  [7, "Venilia Dina Minarti", "Divisi Humas & Relasi"],
  [8, "Avelita Jaquline Ampulembang", "Divisi Humas & Relasi"],
  [9, "Valentino Filemon Limer", "Anggota"],
  [10, "Daniel Advent Ramba", "Anggota"],
  [11, "Melinda Chandra", "Anggota"],
  [12, "Isabella", "Anggota"],
  [13, "Davin Keiko Lim", "Anggota"],
  [14, "Bryan Michelangelo Mengku", "Anggota"],
  [15, "Firman Kaleb", "Anggota"],
  [16, "Edmun Hosni Thamrin", "Anggota"],
  [17, "Rivaldo Charlie Hermawan", "Anggota"],
  [18, "Putra Purwanugraha Tengbunan", "Anggota"],
  [19, "Felix Hwinardy", "Anggota"],
  [20, "Denis Juandri", "Anggota"],
  [21, "Owen Liem", "Anggota"],
  [22, "Mighdad Abdul Fattah Jaba", "Anggota"],
];

function dbUrl() {
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

const normName = (v) =>
  v.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const dir = process.argv[2];
if (!dir || !existsSync(dir)) throw new Error("give the folder holding the png sheets");

const sql = neon(dbUrl());
const rows = await sql`SELECT id, full_name, nim FROM certificates WHERE site = ${SITE}`;
const byName = new Map(rows.map((r) => [normName(r.full_name), r]));

let replaced = 0;
let bytes = 0;
const unmatched = [];

for (const [n, name, role] of SHEETS) {
  const file = join(dir, `${n}.png`);
  if (!existsSync(file)) {
    unmatched.push(`${n}.png missing on disk`);
    continue;
  }
  const row = byName.get(normName(name));
  if (!row) {
    unmatched.push(`no registry row for sheet ${n} (${name})`);
    continue;
  }
  const png = readFileSync(file);
  bytes += png.length;
  await sql`
    UPDATE certificates SET
      title      = ${TITLE},
      event      = ${role + " · " + PERIOD},
      issued_at  = ${ISSUED},
      ref        = NULL,
      file_name  = ${"sertifikat-" + normName(name).replace(/ /g, "-") + ".png"},
      mime       = 'image/png',
      size       = ${png.length},
      data       = ${png.toString("base64")},
      updated_at = now()
    WHERE id = ${row.id}
  `;
  replaced++;
}

console.log("sheets replaced:", replaced, "of", SHEETS.length);
console.log("payload:", (bytes / 1024 / 1024).toFixed(1), "MB total,",
  (bytes / replaced / 1024).toFixed(0), "KB each");
if (unmatched.length) {
  console.log("NOT replaced:");
  for (const u of unmatched) console.log("  " + u);
}

const left = await sql`
  SELECT count(*)::int AS n FROM certificates WHERE site = ${SITE} AND mime <> 'image/png'
`;
console.log("rows still holding a generated stand-in:", left[0].n);
