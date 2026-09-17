/* Sesi dasbor dan izin — sisi browser. Server tetap penentu akhir; nilai di
   sini hanya dipakai untuk menampilkan atau menyembunyikan kontrol. */

export type Level = "none" | "post" | "full";
export type Perms = { gallery: Level; cert: Level };
export type Role = "lead" | "sekretaris" | "pembina" | "super";
export type AccountPerms = { user: string; role: Role; perms: Perms };

export const FULL: Perms = { gallery: "full", cert: "full" };

export function can(p: Perms | undefined, module: keyof Perms, need: Level): boolean {
  const order: Level[] = ["none", "post", "full"];
  return order.indexOf((p ?? FULL)[module]) >= order.indexOf(need);
}

function auth(token: string) {
  return { authorization: `Bearer ${token}`, "content-type": "application/json" };
}

export async function fetchMe(token: string): Promise<{ user: string; role: Role; perms: Perms } | null> {
  const res = await fetch("/api/admin/me", { headers: auth(token), cache: "no-store" });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Sesi tidak dapat diperiksa (${res.status}).`);
  return res.json();
}

export async function fetchPerms(token: string): Promise<AccountPerms[]> {
  const res = await fetch("/api/admin/perms", { headers: auth(token), cache: "no-store" });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Gagal memuat (${res.status}).`);
  return ((await res.json()) as { accounts: AccountPerms[] }).accounts;
}

export async function savePerms(token: string, user: string, perms: Perms): Promise<void> {
  const res = await fetch("/api/admin/perms", {
    method: "POST",
    headers: auth(token),
    body: JSON.stringify({ user, perms }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Gagal menyimpan (${res.status}).`);
}

export function roleName(role: Role): string {
  if (role === "lead") return "Ketua";
  if (role === "sekretaris") return "Sekretaris";
  if (role === "pembina") return "Pembina";
  return "Pengelola izin";
}
