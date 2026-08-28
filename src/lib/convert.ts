/* Format converter.
 *
 * The board uploads whatever it has — a PDF export, a JPG scan, a PNG render.
 * A member should not have to care: they pick the format they need and get it.
 * Everything runs in the browser, so a certificate file is never posted to a
 * third-party conversion service.
 *
 *   image -> png | jpg | jpeg | webp   canvas re-encode
 *   image -> pdf                       single-page PDF wrapping the JPEG
 *   pdf   -> png | jpg | jpeg | webp   pdf.js rasterises page 1 at 2x
 *   pdf   -> pdf                       the original bytes, untouched
 *
 * Requesting the format a file already is returns the original bytes rather
 * than a re-encode, so no generation loss is introduced for nothing.
 */
import { recordBytes, type CertRecord } from "./certstore";

export type Format = "pdf" | "png" | "jpg" | "jpeg" | "webp";

export const FORMATS: Format[] = ["pdf", "png", "jpg", "jpeg", "webp"];

const MIME: Record<Format, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export function isPdf(rec: CertRecord): boolean {
  return rec.mime === "application/pdf" || /\.pdf$/i.test(rec.fileName);
}

export function isImage(rec: CertRecord): boolean {
  return rec.mime.startsWith("image/");
}

/** Formats a given record can actually be served as. */
export function formatsFor(rec: CertRecord): Format[] {
  if (isPdf(rec) || isImage(rec)) return FORMATS;
  return [];
}

export function safeSlug(v: string): string {
  return (
    v
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "sertifikat"
  );
}

export function downloadName(rec: CertRecord, fmt: Format): string {
  return `${safeSlug(rec.title)}-${safeSlug(rec.fullName)}-${safeSlug(rec.nim)}.${fmt}`;
}

/* Raster helpers */
const MAX_EDGE = 4000;

function bufOf(bytes: Uint8Array): ArrayBuffer {
  return bytes.slice().buffer as ArrayBuffer;
}

function loadImage(bytes: Uint8Array, mime: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([bufOf(bytes)], { type: mime }));
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Berkas gambar tidak dapat dibaca."));
    };
    img.src = url;
  });
}

function canvasOf(w: number, h: number): HTMLCanvasElement {
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w * scale));
  c.height = Math.max(1, Math.round(h * scale));
  return c;
}

function encode(canvas: HTMLCanvasElement, mime: string, quality = 0.94): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(`Peramban ini tidak dapat menulis ${mime}.`))),
      mime,
      quality,
    );
  });
}

/** Rasterises page 1 of a PDF.
 *
 *  pdf.js loads on demand and its worker is served from /public as a module
 *  worker we construct ourselves. Handing pdf.js a ready port rather than a
 *  workerSrc string matters: left to guess, a bundled pdf.js starts the .mjs
 *  worker as a classic script, and the load failure leaves getDocument()
 *  pending forever instead of rejecting — a spinner that never ends. The race
 *  below is the second belt: any stall becomes a message the member can read. */
async function pdfToCanvas(bytes: Uint8Array): Promise<HTMLCanvasElement> {
  const pdfjs = await import("pdfjs-dist");
  const port = new Worker("/pdf.worker.min.mjs", { type: "module" });
  try {
    pdfjs.GlobalWorkerOptions.workerPort = port;
    const task = pdfjs.getDocument({ data: bytes.slice() });
    const doc = await withTimeout(task.promise, "Berkas PDF terlalu lama dibaca.");
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 2 });
    const canvas = canvasOf(base.width, base.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Kanvas tidak tersedia di peramban ini.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const viewport = page.getViewport({ scale: (2 * canvas.width) / base.width });
    // intent "print" also decides how pdf.js paces itself: the screen path
    // drives its render loop from requestAnimationFrame, which never fires in a
    // background tab, so a member who switches away mid-download would come
    // back to a spinner. The print path uses timers and finishes either way.
    await withTimeout(
      page.render({ canvasContext: ctx, viewport, intent: "print" } as Parameters<typeof page.render>[0])
        .promise,
      "Halaman PDF terlalu lama digambar.",
    );
    await doc.destroy();
    return canvas;
  } finally {
    port.terminate();
  }
}

function withTimeout<T>(p: Promise<T>, message: string, ms = 20000): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      },
    );
  });
}

async function toCanvas(rec: CertRecord, bytes: Uint8Array): Promise<HTMLCanvasElement> {
  if (isPdf(rec)) return pdfToCanvas(bytes);
  const img = await loadImage(bytes, rec.mime || "image/png");
  const canvas = canvasOf(img.naturalWidth, img.naturalHeight);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas tidak tersedia di peramban ini.");
  // A white ground keeps a transparent PNG readable once it becomes a JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

/* Minimal PDF writer.
   One page, one DCTDecode (JPEG) image, no fonts. Written by hand rather than
   pulled from a PDF library: the whole feature needs five objects and an xref
   table, and a 300 kB dependency for that would be the wrong trade. */
function latin1(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

function pdfFromJpeg(jpeg: Uint8Array, wPx: number, hPx: number): Blob {
  // A4 long edge in points; the page keeps the scan's aspect ratio.
  const long = 842;
  const scale = long / Math.max(wPx, hPx);
  const wPt = Number((wPx * scale).toFixed(2));
  const hPt = Number((hPx * scale).toFixed(2));

  const content = `q ${wPt} 0 0 ${hPt} 0 0 cm /Im0 Do Q\n`;
  const objects: (string | Uint8Array)[][] = [
    ["<< /Type /Catalog /Pages 2 0 R >>"],
    ["<< /Type /Pages /Kids [3 0 R] /Count 1 >>"],
    [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${wPt} ${hPt}] ` +
        `/Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    ],
    [
      `<< /Type /XObject /Subtype /Image /Width ${wPx} /Height ${hPx} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
      jpeg,
      "\nendstream",
    ],
    [`<< /Length ${content.length} >>\nstream\n${content}endstream`],
  ];

  const chunks: Uint8Array[] = [];
  let offset = 0;
  const push = (u: Uint8Array) => {
    chunks.push(u);
    offset += u.length;
  };

  push(latin1("%PDF-1.4\n%âãÏÓ\n"));
  const xref: number[] = [];
  objects.forEach((parts, i) => {
    xref.push(offset);
    push(latin1(`${i + 1} 0 obj\n`));
    for (const p of parts) push(typeof p === "string" ? latin1(p) : p);
    push(latin1("\nendobj\n"));
  });

  const startxref = offset;
  let table = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of xref) table += `${String(o).padStart(10, "0")} 00000 n \n`;
  table += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  push(latin1(table));

  return new Blob(chunks.map(bufOf), { type: "application/pdf" });
}

export async function convert(rec: CertRecord, fmt: Format): Promise<Blob> {
  const bytes = await recordBytes(rec);
  const targetMime = MIME[fmt];

  // Already in the requested format: hand back the bytes on file.
  if (rec.mime === targetMime || (targetMime === "image/jpeg" && rec.mime === "image/jpg")) {
    return new Blob([bufOf(bytes)], { type: targetMime });
  }
  if (fmt === "pdf" && isPdf(rec)) {
    return new Blob([bufOf(bytes)], { type: "application/pdf" });
  }

  const canvas = await toCanvas(rec, bytes);

  if (fmt === "pdf") {
    const jpegBlob = await encode(canvas, "image/jpeg", 0.94);
    return pdfFromJpeg(new Uint8Array(await jpegBlob.arrayBuffer()), canvas.width, canvas.height);
  }
  return encode(canvas, targetMime, fmt === "png" ? 1 : 0.94);
}

export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** A preview image URL for any supported record, PDF included. */
export async function previewUrl(rec: CertRecord): Promise<string> {
  const bytes = await recordBytes(rec);
  if (isImage(rec)) {
    return URL.createObjectURL(new Blob([bufOf(bytes)], { type: rec.mime }));
  }
  const canvas = await pdfToCanvas(bytes);
  return URL.createObjectURL(await encode(canvas, "image/jpeg", 0.9));
}
