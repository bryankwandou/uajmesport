import { db, SITE } from "@/lib/db";
import { guard } from "@/lib/perms";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard(req, "cert", "full");
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  try {
    await db()`DELETE FROM certificates WHERE site = ${SITE} AND id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Data tidak dapat dihapus." },
      { status: 500 },
    );
  }
}
