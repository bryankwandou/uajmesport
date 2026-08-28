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
  /** Hashed identity, present on published rows instead of name and NIM. */
  key?: string;
  source: CertSource;
  createdAt: number;
};

/* What actually ships in public/data/certificates.json.
 *
 * No name and no NIM. A published row identifies its owner only by
 * `key` — a SHA-256 of the salt, the normalised name and the normalised NIM —
 * so the file anyone can fetch is not a member roster. A visitor who opens it
 * directly sees certificate titles and opaque hashes.
 *
 * Being straight about the limit: a hash is not a secret. Names are guessable
 * and a NIM is a short number, so someone determined could grind candidate
 * pairs offline against this file. What the hash buys is that reading the file
 * no longer *hands over* the roster: an attacker must already know who they
 * are looking for. Moving the lookup behind a server function with its own
 * rate limit is the step that would make guessing expensive too. */
export type PublishedRecord = {
  id: string;
  key: string;
  title: string;
  event: string;
  issuedAt: string;
  ref?: string;
  fileName: string;
  mime: string;
  size: number;
  url: string;
  createdAt: number;
};

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

/* The salt is in the client bundle, and it is meant to be: it stops one
   published registry from being matched against another site's leaked table,
   which is all a public-file salt can honestly do. */
const KEY_SALT = "ukm-esport-uajm/sertifikat/v1";

export async function identityKey(fullName: string, nim: string): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  const material = `${KEY_SALT}|${normName(fullName)}|${normNim(nim)}`;
  if (!subtle) return `plain:${material}`;
  const digest = await subtle.digest("SHA-256", new TextEncoder().encode(material));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function matches(rec: CertRecord, fullName: string, nim: string): boolean {
  return normName(rec.fullName) === normName(fullName) && normNim(rec.nim) === normNim(nim);
}

/* One lookup across both sources. Records the board holds on this device still
   carry the name in the clear and are compared directly; published records are
   compared by hash. A published row that matches is handed back carrying the
   identity the member just typed, so the card can print it without the
   registry ever having stored it. */
export async function findFor(
  records: CertRecord[],
  fullName: string,
  nim: string,
): Promise<CertRecord[]> {
  const key = await identityKey(fullName, nim);
  const name = fullName.trim().replace(/\s+/g, " ");
  const student = normNim(nim);
  const hits: CertRecord[] = [];
  for (const rec of records) {
    if (rec.key && rec.key === key) hits.push({ ...rec, fullName: name, nim: student });
    else if (rec.fullName && matches(rec, fullName, nim)) hits.push(rec);
  }
  return hits;
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
      .filter(
        (r): r is PublishedRecord =>
          !!r && typeof r === "object" && typeof (r as PublishedRecord).url === "string",
      )
      .map((r) => ({ ...r, fullName: "", nim: "", source: "published" as const }));
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

export function extensionFor(rec: CertRecord): string {
  const fromName = /\.([A-Za-z0-9]{1,5})$/.exec(rec.fileName)?.[1];
  if (fromName) return fromName.toLowerCase();
  if (rec.mime === "application/pdf") return "pdf";
  return rec.mime.split("/")[1] || "bin";
}

/** The filename a published certificate takes. The record id is a UUID, so the
    path cannot be guessed from a member's name the way "budi-santoso.pdf"
    could. */
export function publishedFileName(rec: CertRecord): string {
  return `${rec.id}.${extensionFor(rec)}`;
}

/** The JSON that belongs in public/data/certificates.json: hashes, never
    names. */
export async function toPublishedJson(records: CertRecord[]): Promise<string> {
  const rows: PublishedRecord[] = [];
  for (const r of records) {
    rows.push({
      id: r.id,
      key: r.key ?? (await identityKey(r.fullName, r.nim)),
      title: r.title,
      event: r.event,
      issuedAt: r.issuedAt,
      ...(r.ref ? { ref: r.ref } : {}),
      fileName: publishedFileName(r),
      mime: r.mime,
      size: r.size,
      url: `/sertifikat-berkas/${publishedFileName(r)}`,
      createdAt: r.createdAt,
    });
  }
  return JSON.stringify(rows, null, 2);
}
