import { db, SITE, unauthorized, verifyToken } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!verifyToken(req.headers.get("authorization"))) return unauthorized();
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
