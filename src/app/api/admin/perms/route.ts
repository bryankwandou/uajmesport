import { accounts } from "@/lib/db";
import { guard, isLevel, listPerms, setPerms } from "@/lib/perms";

export const dynamic = "force-dynamic";

/* Hanya pengelola izin yang bisa membaca dan mengubah tabel ini. */
export async function GET(req: Request) {
  const g = await guard(req, "super");
  if (g instanceof Response) return g;
  try {
    return Response.json({ accounts: await listPerms() });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gagal." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard(req, "super");
  if (g instanceof Response) return g;
  const b = (await req.json().catch(() => ({}))) as {
    user?: string;
    perms?: { gallery?: unknown; cert?: unknown };
  };
  if (!b.user || !accounts().some((a) => a.user === b.user)) {
    return Response.json({ error: "Akun tidak dikenal." }, { status: 400 });
  }
  if (!isLevel(b.perms?.gallery) || !isLevel(b.perms?.cert)) {
    return Response.json({ error: "Tingkat izin tidak sah." }, { status: 400 });
  }
  try {
    await setPerms(b.user, { gallery: b.perms.gallery, cert: b.perms.cert });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gagal." }, { status: 500 });
  }
}
