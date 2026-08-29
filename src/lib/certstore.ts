/* Certificate registry for UKM E-Sport UAJM.
 *
 * One Neon Postgres holds every certificate, so what the board uploads on one
 * machine is what a member claims on another. Nothing lives in this browser
 * any more: the claim page reads the public registry, the dashboard reads and
 * writes through authenticated routes.
 *
 * The privacy line is drawn on the server. /api/registry returns hashed
 * identities and file metadata and never selects a name, so a visitor who
 * fetches it sees certificate titles and opaque hashes. The name and NIM a
 * member types are hashed here, in the browser, and compared locally — they
 * are never put in a URL, a request body, or a log.
 */

export const SLOTS = 2000;

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
  /** Hashed identity. Present on rows read from the public registry. */
  key?: string;
  createdAt: number;
};

/* ── identity matching ─────────────────────────────────────────────────────
   A member types their name the way they remember it. Case, double spaces,
   punctuation and accents must not decide whether a certificate is found; the
   identity behind them must. NIM is compared on alphanumerics only, so
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

/* The salt is public, and it is meant to be: it stops one registry from being
   matched against another site's leaked table, which is all a shipped salt can
   honestly do. */
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

export function hasFile(rec: CertRecord): boolean {
  return rec.size > 0;
}

/* One lookup. Public rows carry a hash and are compared against the hash of
   what was typed; rows the dashboard loaded carry the name in the clear and
   are compared directly. A hashed row that matches is handed back carrying the
   identity the member just typed, so the card can print it without the public
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

/* ── public registry ───────────────────────────────────────────────────── */
async function settle<T>(p: Promise<T[]>, ms = 8000): Promise<T[]> {
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

/** How many certificates are claimable. One integer, whatever the size. */
export async function registryCount(): Promise<number> {
  try {
    const res = await fetch("/api/registry", { cache: "no-store" });
    if (!res.ok) return 0;
    const body = (await res.json()) as { count?: number };
    return typeof body.count === "number" ? body.count : 0;
  } catch {
    return 0;
  }
}

/* The claim itself.
 *
 * The identity is hashed here and only the first four hex characters of that
 * hash leave the browser. The server answers with the rows sharing that
 * bucket — a couple of rows at any realistic size — and the full comparison
 * happens back here. The name and NIM never travel, and the payload does not
 * grow with the registry. */
export async function lookup(fullName: string, nim: string): Promise<CertRecord[]> {
  const key = await identityKey(fullName, nim);
  const res = await fetch(`/api/registry?p=${key.slice(0, 4)}`, { cache: "no-store" });
  if (!res.ok) return [];
  const rows: unknown = await res.json();
  if (!Array.isArray(rows)) return [];
  const name = fullName.trim().replace(/\s+/g, " ");
  const student = normNim(nim);
  return (rows as CertRecord[])
    .filter((r) => r.key === key)
    .map((r) => ({ ...r, fullName: name, nim: student }));
}

/* ── files ─────────────────────────────────────────────────────────────── */
export async function recordBytes(rec: CertRecord): Promise<Uint8Array> {
  const res = await fetch(`/api/file/${rec.id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Berkas sertifikat tidak dapat dimuat (${res.status}).`);
  return new Uint8Array(await res.arrayBuffer());
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
}

export async function fileToBase64(file: File): Promise<string> {
  const url = await fileToDataUrl(file);
  return url.slice(url.indexOf(",") + 1);
}

/** The database column is a uuid, so the id has to be a real one.
    randomUUID is available in every secure context this page runs in. */
export function newId(): string {
  return crypto.randomUUID();
}

/* ── authenticated dashboard calls ─────────────────────────────────────── */
export type Session = { token: string; role: "lead" | "sekretaris" | "pembina" };

export async function login(user: string, pass: string): Promise<Session | null> {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user, pass }),
  });
  if (!res.ok) return null;
  return (await res.json()) as Session;
}

function auth(token: string) {
  return { authorization: `Bearer ${token}`, "content-type": "application/json" };
}

export async function adminList(token: string): Promise<{ records: CertRecord[]; bytes: number }> {
  const res = await fetch("/api/admin/records", { headers: auth(token), cache: "no-store" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Gagal memuat (${res.status}).`);
  return (await res.json()) as { records: CertRecord[]; bytes: number };
}

export async function saveRecord(
  token: string,
  rec: CertRecord,
  data: string | null,
): Promise<void> {
  const key = await identityKey(rec.fullName, rec.nim);
  const res = await fetch("/api/admin/records", {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify({ ...rec, key, data }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Gagal menyimpan (${res.status}).`);
}

export async function deleteRecord(token: string, id: string): Promise<void> {
  const res = await fetch(`/api/admin/records/${id}`, { method: "DELETE", headers: auth(token) });
  if (!res.ok) throw new Error(`Gagal menghapus (${res.status}).`);
}

export async function clearAll(token: string): Promise<void> {
  const res = await fetch("/api/admin/records", { method: "DELETE", headers: auth(token) });
  if (!res.ok) throw new Error(`Gagal mengosongkan (${res.status}).`);
}

export function extensionFor(rec: CertRecord): string {
  const fromName = /\.([A-Za-z0-9]{1,5})$/.exec(rec.fileName)?.[1];
  if (fromName) return fromName.toLowerCase();
  if (rec.mime === "application/pdf") return "pdf";
  return rec.mime.split("/")[1] || "bin";
}

export function publishedFileName(rec: CertRecord): string {
  return `${rec.id}.${extensionFor(rec)}`;
}

/** A backup of the registry, still without names: hashes only. */
export function toPublishedJson(records: CertRecord[]): string {
  return JSON.stringify(
    records.map((r) => ({
      id: r.id,
      key: r.key,
      title: r.title,
      event: r.event,
      issuedAt: r.issuedAt,
      ...(r.ref ? { ref: r.ref } : {}),
      fileName: publishedFileName(r),
      mime: r.mime,
      size: r.size,
      createdAt: r.createdAt,
    })),
    null,
    2,
  );
}
