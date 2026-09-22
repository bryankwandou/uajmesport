import { db, SITE } from "@/lib/db";
import { ensureAccounts } from "@/lib/accounts";

/* Setelan situs yang bisa diubah dari dasbor tanpa kode. Saat ini hanya satu:
   link pendaftaran anggota. Nilai kosong berarti situs memakai link bawaan di
   src/lib/content.ts. */

/* Hanya layanan formulir/grup yang dikenal. Akun yang dibobol tidak bisa
   mengarahkan tombol "Daftar" ke situs lain. Tambahkan host di sini bila
   organisasi pindah layanan. */
export const REGISTER_HOSTS = [
  "forms.gle",
  "docs.google.com",
  "forms.office.com",
  "chat.whatsapp.com",
  "wa.me",
];

export function checkRegisterUrl(v: unknown): { url: string } | { error: string } {
  if (typeof v !== "string") return { error: "Link tidak sah." };
  const raw = v.trim();
  if (raw.length > 300) return { error: "Link terlalu panjang." };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { error: "Link tidak sah. Salin link lengkap yang diawali https://" };
  }
  if (u.protocol !== "https:") return { error: "Link harus diawali https://" };
  if (u.username || u.password) return { error: "Link tidak sah." };
  if (!REGISTER_HOSTS.includes(u.hostname)) {
    return { error: `Hanya link dari ${REGISTER_HOSTS.join(", ")}.` };
  }
  if (u.hostname === "docs.google.com" && !u.pathname.startsWith("/forms/")) {
    return { error: "Link docs.google.com harus link Google Form (/forms/…)." };
  }
  return { url: u.toString() };
}

export type RegisterSetting = { url: string | null; updatedBy: string; updatedAt: string | null };

export async function getRegister(): Promise<RegisterSetting> {
  await ensureAccounts();
  const rows = (await db()`
    SELECT value, updated_by, updated_at FROM site_settings WHERE site = ${SITE} AND key = 'register_url'
  `) as unknown as { value: string; updated_by: string; updated_at: string }[];
  const r = rows[0];
  const ok = r ? checkRegisterUrl(r.value) : null;
  return {
    url: ok && "url" in ok ? ok.url : null,
    updatedBy: r?.updated_by ?? "",
    updatedAt: r?.updated_at ? new Date(r.updated_at).toISOString() : null,
  };
}

export async function setRegister(url: string | null, by: string) {
  await ensureAccounts();
  if (url === null) {
    await db()`DELETE FROM site_settings WHERE site = ${SITE} AND key = 'register_url'`;
    return;
  }
  await db()`
    INSERT INTO site_settings (site, key, value, updated_by) VALUES (${SITE}, 'register_url', ${url}, ${by})
    ON CONFLICT (site, key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`;
}
