import { SITE } from "@/lib/db";
import { guard } from "@/lib/perms";
import {
  audit,
  checkPassword,
  createAccount,
  deleteAccount,
  findAccount,
  isLevel,
  isModule,
  isRole,
  listAccounts,
  nameKey,
  renameAccount,
  setLevel,
  setPassword,
  setRole,
  USER_RE,
} from "@/lib/accounts";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/* Pengelolaan akun dan izin. Hanya pengelola izin (role "super"). */

const err = (msg: string, status = 400) => Response.json({ error: msg }, { status });
const fail = (e: unknown) => err(e instanceof Error ? e.message : "Gagal.", 500);

function shape(a: Awaited<ReturnType<typeof listAccounts>>[number], me: string) {
  return { user: a.user, role: a.role, perms: a.perms, createdAt: a.createdAt, self: a.key === me };
}

export async function GET(req: Request) {
  const g = await guard(req, "super");
  if (g instanceof Response) return g;
  try {
    const list = await listAccounts();
    return Response.json(
      { accounts: list.map((a) => shape(a, g.account.key)) },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    return fail(e);
  }
}

/* Buat akun baru. Akun baru mulai tanpa izin apa pun. */
export async function POST(req: Request) {
  const g = await guard(req, "super");
  if (g instanceof Response) return g;
  const b = (await req.json().catch(() => ({}))) as { user?: unknown; pass?: unknown; role?: unknown };
  const user = typeof b.user === "string" ? b.user.trim().replace(/\s+/g, " ") : "";
  if (!USER_RE.test(user)) return err("Nama akun 3–40 karakter: huruf, angka, spasi, titik, garis bawah, strip.");
  const bad = checkPassword(b.pass);
  if (bad) return err(bad);
  if (!isRole(b.role) || b.role === "super") return err("Jabatan tidak sah.");
  try {
    const a = await createAccount(user, b.pass as string, b.role);
    await audit(g.account.user, "create", a.user);
    return Response.json({ ok: true, user: a.user });
  } catch (e) {
    return e instanceof Error && e.message.includes("dipakai") ? err(e.message, 409) : fail(e);
  }
}

/* Satu perubahan per permintaan: izin satu modul, jabatan, nama, atau kata sandi. */
export async function PATCH(req: Request) {
  const g = await guard(req, "super");
  if (g instanceof Response) return g;
  const b = (await req.json().catch(() => ({}))) as {
    user?: unknown;
    module?: unknown;
    level?: unknown;
    role?: unknown;
    rename?: unknown;
    pass?: unknown;
  };
  if (typeof b.user !== "string") return err("Akun tidak dikenal.");
  try {
    const target = await findAccount(b.user);
    if (!target) return err("Akun tidak dikenal.", 404);
    const isSuper = target.role === "super";

    if (b.module !== undefined) {
      if (isSuper) return err("Pengelola izin tidak memakai izin modul.");
      if (!isModule(b.module) || !isLevel(b.level)) return err("Tingkat izin tidak sah.");
      await setLevel(target.key, b.module, b.level);
      await audit(g.account.user, "perm", `${target.user} ${b.module}=${b.level}`);
    } else if (b.role !== undefined) {
      if (isSuper || !isRole(b.role) || b.role === "super") return err("Jabatan tidak sah.");
      await setRole(target.key, b.role);
      await audit(g.account.user, "role", `${target.user} → ${b.role}`);
    } else if (b.rename !== undefined) {
      const name = typeof b.rename === "string" ? b.rename.trim().replace(/\s+/g, " ") : "";
      if (!USER_RE.test(name)) return err("Nama akun 3–40 karakter: huruf, angka, spasi, titik, garis bawah, strip.");
      await renameAccount(target.key, name);
      await db()`UPDATE gallery_posts SET author = ${name} WHERE site = ${SITE} AND author = ${target.user}`;
      await audit(g.account.user, "rename", `${target.user} → ${name}`);
    } else if (b.pass !== undefined) {
      const bad = checkPassword(b.pass);
      if (bad) return err(bad);
      await setPassword(target.key, b.pass as string);
      await audit(g.account.user, "password", target.user);
    } else {
      return err("Tidak ada perubahan.");
    }
    const after = await findAccount(typeof b.rename === "string" ? b.rename : target.user);
    return Response.json({ ok: true, account: after ? shape(after, g.account.key) : null });
  } catch (e) {
    return e instanceof Error && e.message.includes("dipakai") ? err(e.message, 409) : fail(e);
  }
}

/* Hapus akun. Sesi akun itu mati seketika. ?purge=1 juga menghapus semua post
   galeri yang pernah diunggahnya — untuk akun yang disalahgunakan. */
export async function DELETE(req: Request) {
  const g = await guard(req, "super");
  if (g instanceof Response) return g;
  const url = new URL(req.url);
  const user = url.searchParams.get("user") ?? "";
  try {
    const target = await findAccount(user);
    if (!target) return err("Akun tidak dikenal.", 404);
    if (target.role === "super") return err("Akun pengelola izin tidak bisa dihapus.");
    let purged = 0;
    if (url.searchParams.get("purge") === "1") {
      const rows = (await db()`
        DELETE FROM gallery_posts WHERE site = ${SITE} AND author = ${target.user} RETURNING id
      `) as unknown as { id: string }[];
      purged = rows.length;
    }
    await deleteAccount(nameKey(target.user));
    await audit(g.account.user, "delete", `${target.user}${purged ? ` (+${purged} post)` : ""}`);
    return Response.json({ ok: true, purged });
  } catch (e) {
    return fail(e);
  }
}
