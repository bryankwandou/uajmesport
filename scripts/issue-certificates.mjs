/* Issues the real membership certificates for the registered members.
 *
 * Source of truth is the board's own registration export — no name is invented
 * here, and a row missing a name or a NIM is skipped rather than filled in.
 * Each sheet is a one-page vector PDF built from the base-14 Helvetica faces,
 * so it stays crisp at any zoom and weighs a few kilobytes instead of the
 * megabyte a rasterised canvas costs.
 *
 *   node scripts/issue-certificates.mjs "<path to csv>"    # write
 *   node scripts/issue-certificates.mjs --clean            # remove
 *
 * The organisation is the issuer. What the sheet asserts is exactly what the
 * registration record supports: that this person is a registered member for
 * the 2025/2026 term, under the decree the site already publishes.
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash, randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

const SITE = "uajmesport";
const SALT = "ukm-esport-uajm/sertifikat/v1";
const TITLE = "Sertifikat Anggota Terdaftar";
const EVENT = "Kepengurusan UKM E-Sport UAJM Periode 2025/2026";
const ISSUED = "20 Desember 2025";
const DECREE = "001/SK/UKM-ESPORT/UAJM/VI/2025";

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
const normNim = (v) => v.toUpperCase().replace(/[^A-Z0-9]/g, "");
const identityKey = (name, nim) =>
  createHash("sha256").update(SALT + "|" + normName(name) + "|" + normNim(nim)).digest("hex");

/* A comma-separated export with quoted fields and embedded newlines. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim()));
}

/* ── a minimal vector PDF ──────────────────────────────────────────────────
   One A4 landscape page, two base-14 faces, no embedded assets. Written by
   hand because the whole document is six objects and a text stream; a layout
   library would be a megabyte of dependency for that. */
function latin1(s) {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

function esc(s) {
  return s
    .normalize("NFC")
    .replace(/[\\()]/g, (m) => "\\" + m)
    .replace(/[^\x20-\x7e\xa0-\xff]/g, "");
}

function certificatePdf(name, nim, ref) {
  const W = 842;
  const H = 595;
  const M = 74;
  const line = (font, size, x, y, text) =>
    "BT /" + font + " " + size + " Tf " + x + " " + y + " Td (" + esc(text) + ") Tj ET\n";

  let c = "";
  c += "0.76 0 0.23 rg 0 " + (H - 10) + " " + W + " 10 re f\n";
  c += "0.64 0.27 0 rg 0 0 " + W + " 10 re f\n";
  c += "0.85 0.85 0.86 RG 1 w " + (M - 22) + " " + (M - 22) + " " + (W - 2 * (M - 22)) + " " + (H - 2 * (M - 22)) + " re S\n";
  c += "0 0 0 rg\n";

  c += line("F2", 13, M, H - 96, "UNIT KEGIATAN MAHASISWA E-SPORT");
  c += line("F1", 11, M, H - 114, "UNIVERSITAS ATMA JAYA MAKASSAR");

  c += "0.76 0 0.23 rg\n";
  c += line("F2", 40, M, H - 178, "SERTIFIKAT");
  c += "0 0 0 rg\n";
  c += line("F1", 15, M, H - 202, "Anggota Terdaftar Periode 2025/2026");

  c += line("F1", 11, M, H - 264, "Diberikan kepada");
  c += line("F2", 28, M, H - 302, name);
  c += line("F1", 13, M, H - 324, "NIM " + nim);

  c += line("F1", 11, M, H - 374, "atas keanggotaannya yang tercatat pada Unit Kegiatan Mahasiswa E-Sport");
  c += line("F1", 11, M, H - 392, "Universitas Atma Jaya Makassar untuk periode kepengurusan 2025/2026,");
  c += line("F1", 11, M, H - 410, "sebagaimana ditetapkan dalam SK Nomor " + DECREE + ".");

  c += line("F1", 11, M, H - 472, "Makassar, " + ISSUED);
  c += line("F2", 11, M, H - 494, "Ketua Umum UKM E-Sport UAJM");
  c += line("F1", 9, M, 44, "No. " + ref);

  const objs = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + W + " " + H + "] " +
      "/Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    "<< /Length " + c.length + " >>\nstream\n" + c + "endstream",
  ];

  const chunks = [];
  let offset = 0;
  const push = (u) => {
    chunks.push(u);
    offset += u.length;
  };
  push(latin1("%PDF-1.4\n%âãÏÓ\n"));
  const xref = [];
  objs.forEach((body, i) => {
    xref.push(offset);
    push(latin1(i + 1 + " 0 obj\n" + body + "\nendobj\n"));
  });
  const startxref = offset;
  let x = "xref\n0 " + (objs.length + 1) + "\n0000000000 65535 f \n";
  for (const o of xref) x += String(o).padStart(10, "0") + " 00000 n \n";
  x += "trailer\n<< /Size " + (objs.length + 1) + " /Root 1 0 R >>\nstartxref\n" + startxref + "\n%%EOF\n";
  push(latin1(x));

  const total = chunks.reduce((n, u) => n + u.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const u of chunks) {
    out.set(u, at);
    at += u.length;
  }
  return Buffer.from(out);
}

/* ── run ──────────────────────────────────────────────────────────────── */
const sql = neon(dbUrl());

if (process.argv.includes("--clean")) {
  const gone = await sql`DELETE FROM certificates WHERE site = ${SITE} AND title = ${TITLE} RETURNING id`;
  console.log("removed issued certificates:", gone.length);
  process.exit(0);
}

const csvPath = process.argv[2];
if (!csvPath || !existsSync(csvPath)) throw new Error("give the path to the registration csv");

const rows = parseCsv(readFileSync(csvPath, "utf8"));
const head = rows[0].map((h) => h.trim());
const iName = head.indexOf("Nama Lengkap");
const iNim = head.indexOf("NIM / Stambuk");
if (iName < 0 || iNim < 0) throw new Error("csv is missing 'Nama Lengkap' or 'NIM / Stambuk'");

const members = [];
for (const r of rows.slice(1)) {
  const name = (r[iName] ?? "").trim().replace(/\s+/g, " ");
  const nim = (r[iNim] ?? "").trim();
  if (!name || !nim) continue;
  const dup = members.some((m) => normName(m.name) === normName(name) && normNim(m.nim) === normNim(nim));
  if (dup) continue;
  members.push({ name, nim });
}
console.log("members read from the registration export:", members.length);

let n = 0;
let bytes = 0;
for (const m of members) {
  const no = String(++n).padStart(3, "0");
  const ref = no + "/ANG/UKM-ESPORT/UAJM/2026";
  const pdf = certificatePdf(m.name, m.nim, ref);
  bytes += pdf.length;
  await sql`
    INSERT INTO certificates
      (id, site, identity_key, full_name, nim, title, event, issued_at, ref,
       file_name, mime, size, data, created_at)
    VALUES (${randomUUID()}, ${SITE}, ${identityKey(m.name, m.nim)}, ${m.name}, ${m.nim},
            ${TITLE}, ${EVENT}, ${ISSUED}, ${ref},
            ${"sertifikat-anggota-" + no + ".pdf"}, 'application/pdf', ${pdf.length},
            ${pdf.toString("base64")}, ${Date.now() + n})
  `;
}
console.log("issued " + n + " certificates, " + (bytes / 1024).toFixed(1) + " KB total, " +
  (bytes / n / 1024).toFixed(1) + " KB each");
