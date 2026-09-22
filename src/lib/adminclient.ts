/* Sesi dasbor, izin dan akun — sisi browser. Server tetap penentu akhir; nilai
   di sini hanya dipakai untuk menampilkan atau menyembunyikan kontrol. */

export type Level = "none" | "post" | "full";
export type Perms = { gallery: Level; cert: Level; form: Level };
export type Role = "lead" | "sekretaris" | "bendahara" | "pembina" | "staff" | "super";
export type AccountRow = { user: string; role: Role; perms: Perms; createdAt: number; self: boolean };

/** Dipakai sebelum server menjawab: tidak ada modul yang terbuka. */
export const NONE: Perms = { gallery: "none", cert: "none", form: "none" };
export const ROLE_CHOICES: Role[] = ["lead", "sekretaris", "bendahara", "pembina", "staff"];

export function can(p: Perms | undefined, module: keyof Perms, need: Level): boolean {
  const order: Level[] = ["none", "post", "full"];
  return order.indexOf((p ?? NONE)[module] ?? "none") >= order.indexOf(need);
}

function auth(token: string) {
  return { authorization: `Bearer ${token}`, "content-type": "application/json" };
}

async function send<T>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: auth(token) });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Gagal (${res.status}).`);
  return body as T;
}

export async function fetchMe(token: string): Promise<{ user: string; role: Role; perms: Perms } | null> {
  const res = await fetch("/api/admin/me", { headers: auth(token), cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Sesi tidak dapat diperiksa (${res.status}).`);
  return res.json();
}

/* ── pengelola izin ───────────────────────────────────────────────────── */
export async function fetchAccounts(token: string): Promise<AccountRow[]> {
  return (await send<{ accounts: AccountRow[] }>("/api/admin/accounts", token)).accounts;
}

export function setLevel(token: string, user: string, module: keyof Perms, level: Level) {
  return send("/api/admin/accounts", token, { method: "PATCH", body: JSON.stringify({ user, module, level }) });
}

export function setRole(token: string, user: string, role: Role) {
  return send("/api/admin/accounts", token, { method: "PATCH", body: JSON.stringify({ user, role }) });
}

export function renameAccount(token: string, user: string, rename: string) {
  return send("/api/admin/accounts", token, { method: "PATCH", body: JSON.stringify({ user, rename }) });
}

export function changePassword(token: string, user: string, pass: string) {
  return send("/api/admin/accounts", token, { method: "PATCH", body: JSON.stringify({ user, pass }) });
}

export function createAccount(token: string, user: string, pass: string, role: Role) {
  return send("/api/admin/accounts", token, { method: "POST", body: JSON.stringify({ user, pass, role }) });
}

export function deleteAccount(token: string, user: string, purge: boolean) {
  const q = new URLSearchParams({ user, ...(purge ? { purge: "1" } : {}) });
  return send<{ purged: number }>(`/api/admin/accounts?${q}`, token, { method: "DELETE" });
}

/* ── link pendaftaran ─────────────────────────────────────────────────── */
export type RegisterSetting = { url: string | null; updatedBy: string; updatedAt: string | null };

export function fetchRegister(token: string) {
  return send<RegisterSetting>("/api/admin/settings", token);
}

export function saveRegister(token: string, url: string | null) {
  return send<RegisterSetting>("/api/admin/settings", token, {
    method: "POST",
    body: JSON.stringify(url === null ? { reset: true } : { url }),
  });
}

export function roleName(role: Role | string): string {
  if (role === "lead") return "Ketua";
  if (role === "sekretaris") return "Sekretaris";
  if (role === "bendahara") return "Bendahara";
  if (role === "pembina") return "Pembina";
  if (role === "staff") return "Pengurus";
  return "Pengelola izin";
}
