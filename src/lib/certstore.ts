/* Certificate registry for UKM E-Sport UAJM.
 *
 * Two sources feed one list:
 *   published — /data/certificates.json, committed to the repository and served
 *               to every device. This is the registry members claim from in
 *               production.
 *   local     — records the board adds from the admin dashboard. They live in
 *               this browser's IndexedDB so an upload works with no database,
 *               no environment variable and no vendor lock-in. "Ekspor
 *               registry" writes the exact JSON that belongs in
 *               public/data/certificates.json, which is how a local record
 *               becomes a published one.
 *
 * Nothing here fabricates a certificate. The registry starts empty and only
 * holds what the board puts in it.
 */

export const SLOTS = 22;

export type CertSource = "published" | "local";

export type CertRecord = {
  id: string;
  fullName: string;
  nim: string;
  title: string;
  event: string;
  issuedAt: string;
  ref?: string;
  fileName: string;
  mime: string;
  size: number;
  /** data: URL, held by locally added records. */
  data?: string;
  /** Path under /public, held by published records. */
  url?: string;
  source: CertSource;
  createdAt: number;
};

export type PublishedRecord = Omit<CertRecord, "source" | "data"> & { url: string };

/* ── identity matching ─────────────────────────────────────────────────────
   A member types their name the way they remember it. Case, double spaces,
   punctuation and accents must not decide whether a certificate is found;
   the identity behind them must. NIM is compared on alphanumerics only, so
   "042 xx 03" and "042xx03" are the same student. */
export function normName(v: string): string {
  return v
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function normNim(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function matches(rec: CertRecord, fullName: string, nim: string): boolean {
  return normName(rec.fullName) === normName(fullName) && normNim(rec.nim) === normNim(nim);
}

/* ── IndexedDB ─────────────────────────────────────────────────────────────
   Certificate files are megabyte-scale binaries. localStorage would blow its
   quota on the third upload, so records live in IndexedDB. */
const DB_NAME = "uajmesport-certs";
const DB_VERSION = 1;
const STORE = "records";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.oncomplete = () => db.close();
      }),
  );
}

/* A registry read must always settle. A storage layer that stalls — a blocked
   IndexedDB upgrade, a request the network never answers — would otherwise
   leave the claim page waiting on a spinner with no way out, so both sources
   fall back to "nothing found" after a few seconds rather than hanging. */
function orEmpty<T>(p: Promise<T[]>, ms = 4000): Promise<T[]> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve([]), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v ?? []);
      },
      () => {
        clearTimeout(t);
        resolve([]);
      },
    );
  });
}

export function localRecords(): Promise<CertRecord[]> {
  return orEmpty(
    tx<CertRecord[]>("readonly", (s) => s.getAll() as IDBRequest<CertRecord[]>).then((rows) =>
      (rows ?? []).map((r) => ({ ...r, source: "local" as const })),
    ),
  );
}

export async function putRecord(rec: CertRecord): Promise<void> {
  await tx("readwrite", (s) => s.put({ ...rec, source: "local" }));
}

export async function deleteRecord(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

export async function clearLocal(): Promise<void> {
  await tx("readwrite", (s) => s.clear());
}

/* ── published registry ────────────────────────────────────────────────── */
export function publishedRecords(): Promise<CertRecord[]> {
  return orEmpty(fetchPublished());
}

async function fetchPublished(): Promise<CertRecord[]> {
  try {
    const res = await fetch("/data/certificates.json", { cache: "no-store" });
    if (!res.ok) return [];
    const raw: unknown = await res.json();
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((r): r is PublishedRecord => !!r && typeof r === "object" && typeof (r as PublishedRecord).url === "string")
      .map((r) => ({ ...r, source: "published" as const }));
  } catch {
    return [];
  }
}

/** Published first, then locally added, newest local record last. */
export async function allRecords(): Promise<CertRecord[]> {
  const [pub, loc] = await Promise.all([publishedRecords(), localRecords()]);
  const seen = new Set(pub.map((r) => r.id));
  return [...pub, ...loc.filter((r) => !seen.has(r.id)).sort((a, b) => a.createdAt - b.createdAt)];
}

/* ── file helpers ──────────────────────────────────────────────────────── */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(base64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function recordBytes(rec: CertRecord): Promise<Uint8Array> {
  if (rec.data) return dataUrlToBytes(rec.data);
  if (rec.url) {
    const res = await fetch(rec.url);
    if (!res.ok) throw new Error(`Berkas sertifikat tidak dapat dimuat (${res.status}).`);
    return new Uint8Array(await res.arrayBuffer());
  }
  throw new Error("Rekaman sertifikat tidak memuat berkas.");
}

export function newId(): string {
  const c = globalThis.crypto;
  if (c && "randomUUID" in c) return c.randomUUID();
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** The JSON shape that belongs in public/data/certificates.json. */
export function toPublishedJson(records: CertRecord[]): string {
  const rows = records.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    nim: r.nim,
    title: r.title,
    event: r.event,
    issuedAt: r.issuedAt,
    ...(r.ref ? { ref: r.ref } : {}),
    fileName: r.fileName,
    mime: r.mime,
    size: r.size,
    url: r.url ?? `/sertifikat-berkas/${r.fileName}`,
    createdAt: r.createdAt,
  }));
  return JSON.stringify(rows, null, 2);
}
