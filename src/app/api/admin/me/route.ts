import { permsFor } from "@/lib/perms";
import { unauthorized, verifyToken } from "@/lib/db";

export const dynamic = "force-dynamic";

/* Izin terbaru untuk sesi yang sedang terbuka. Dasbor memanggilnya saat dibuka,
   jadi perubahan dari pengelola izin berlaku tanpa perlu keluar-masuk. */
export async function GET(req: Request) {
  const account = verifyToken(req.headers.get("authorization"));
  if (!account) return unauthorized();
  try {
    return Response.json({ user: account.user, role: account.role, perms: await permsFor(account) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gagal." }, { status: 500 });
  }
}
