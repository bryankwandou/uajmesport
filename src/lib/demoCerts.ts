/* Sample registry generator.
 *
 * One click writes 25 sheets into the database so the claim flow can be
 * exercised end to end before a single real document exists. Every sheet it draws is
 * stamped DATA CONTOH and every recipient is "Anggota Contoh NN" with a
 * CONTOH-prefixed student number, so a sample can never be mistaken for, or
 * quietly replace, a real certificate.
 */
import { newId, type CertRecord } from "./certstore";

const PROGRAMS = [
  ["Anggota Aktif", "Kepengurusan UKM E-Sport UAJM 2025/2026"],
  ["Panitia Turnamen", "Divisi Turnamen & Kompetisi"],
  ["Peserta Pelatihan", "Divisi Pelatihan & Pengembangan"],
  ["Kontributor Konten", "Divisi Kreatif & Konten Digital"],
  ["Relasi & Humas", "Divisi Humas & Relasi"],
  ["Peserta Kelas Web3", "UAJM Blockchain Club"],
];

function draw(index: number): string {
  const w = 1400;
  const h = 990;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas tidak tersedia di peramban ini.");

  const [program, division] = PROGRAMS[index % PROGRAMS.length];
  const no = String(index + 1).padStart(2, "0");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  const bar = ctx.createLinearGradient(0, 0, w, 0);
  bar.addColorStop(0, "#c2003a");
  bar.addColorStop(1, "#a34500");
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, w, 14);
  ctx.fillRect(0, h - 14, w, 14);

  ctx.strokeStyle = "rgba(16,6,10,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(46, 46, w - 92, h - 92);

  ctx.textAlign = "center";
  ctx.fillStyle = "#150a0e";
  ctx.font = "600 26px Georgia, serif";
  ctx.fillText("UNIT KEGIATAN MAHASISWA E-SPORT", w / 2, 140);
  ctx.font = "400 20px Georgia, serif";
  ctx.fillStyle = "rgba(21,10,14,0.7)";
  ctx.fillText("UNIVERSITAS ATMA JAYA MAKASSAR", w / 2, 174);

  ctx.fillStyle = "#c2003a";
  ctx.font = "700 62px Georgia, serif";
  ctx.fillText("SERTIFIKAT", w / 2, 286);
  ctx.font = "400 24px Georgia, serif";
  ctx.fillStyle = "rgba(21,10,14,0.7)";
  ctx.fillText(program, w / 2, 328);

  ctx.font = "400 20px Georgia, serif";
  ctx.fillStyle = "rgba(21,10,14,0.62)";
  ctx.fillText("Diberikan kepada", w / 2, 412);

  ctx.fillStyle = "#150a0e";
  ctx.font = "700 52px Georgia, serif";
  ctx.fillText(`Anggota Contoh ${no}`, w / 2, 482);

  ctx.font = "400 22px Georgia, serif";
  ctx.fillStyle = "rgba(21,10,14,0.7)";
  ctx.fillText(`NIM CONTOH${no.padStart(4, "0")}`, w / 2, 522);

  ctx.font = "400 22px Georgia, serif";
  ctx.fillStyle = "rgba(21,10,14,0.7)";
  ctx.fillText("atas partisipasinya pada", w / 2, 596);
  ctx.fillStyle = "#150a0e";
  ctx.font = "600 30px Georgia, serif";
  ctx.fillText(division, w / 2, 640);

  ctx.font = "400 19px Georgia, serif";
  ctx.fillStyle = "rgba(21,10,14,0.62)";
  ctx.fillText("Makassar, 20 Desember 2025", w / 2, 760);
  ctx.fillText("Ketua Umum UKM E-Sport UAJM", w / 2, 848);

  ctx.textAlign = "left";
  ctx.font = "400 16px monospace";
  ctx.fillStyle = "rgba(21,10,14,0.5)";
  ctx.fillText(`No. CONTOH-${no}/UKM-ESPORT/UAJM/2026`, 92, h - 70);

  // Unmistakable sample stamp, drawn last so nothing sits over it.
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 9);
  ctx.textAlign = "center";
  ctx.font = "800 130px Georgia, serif";
  ctx.fillStyle = "rgba(194,0,58,0.13)";
  ctx.fillText("DATA CONTOH", 0, 40);
  ctx.restore();

  const url = canvas.toDataURL("image/png");
  // The API stores a bare base64 payload, not a data: URL.
  return url.slice(url.indexOf(",") + 1);
}

const SAMPLES = 25;

export function sampleRecords(): (CertRecord & { data: string })[] {
  const now = Date.now();
  return Array.from({ length: SAMPLES }, (_, i) => {
    const no = String(i + 1).padStart(2, "0");
    const data = draw(i);
    return {
      id: newId(),
      fullName: `Anggota Contoh ${no}`,
      nim: `CONTOH${no.padStart(4, "0")}`,
      title: `Sertifikat ${PROGRAMS[i % PROGRAMS.length][0]}`,
      event: PROGRAMS[i % PROGRAMS.length][1],
      issuedAt: "20 Desember 2025",
      ref: `CONTOH-${no}/UKM-ESPORT/UAJM/2026`,
      fileName: `contoh-${no}.png`,
      mime: "image/png",
      size: Math.round(data.length * 0.75),
      data,
      createdAt: now + i,
    };
  });
}
