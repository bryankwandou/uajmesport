import { unauthorized } from "@/lib/db";
import { verifyToken } from "@/lib/accounts";

export const dynamic = "force-dynamic";

/* Izin terbaru untuk sesi yang sedang terbuka. Dasbor menanyakannya saat
   dibuka dan berkala sesudahnya; izin yang dicabut langsung menutup modulnya. */
export async function GET(req: Request) {
  try {
    const a = await verifyToken(req.headers.get("authorization"));
    if (!a) return unauthorized();
    return Response.json(
      { user: a.user, role: a.role, perms: a.perms },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gagal." }, { status: 500 });
  }
}
