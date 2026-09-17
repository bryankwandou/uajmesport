import { db, SITE } from "@/lib/db";
import { guard } from "@/lib/perms";
import { bad, fail, isCategory, UUID_RE } from "@/lib/galleryserver";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/* Ubah keterangan, kategori atau tanggal. Foto tidak diganti di sini. */
export async function PATCH(req: Request, ctx: Ctx) {
  const g = await guard(req, "gallery", "full");
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return bad("Id tidak sah.");
  const b = (await req.json().catch(() => ({}))) as { caption?: string; category?: string; takenAt?: string };
  if (!isCategory(b.category)) return bad("Kategori tidak sah.");
  try {
    await db()`
      UPDATE gallery_posts SET caption = ${(b.caption ?? "").slice(0, 2200)}, category = ${b.category},
        taken_at = ${(b.takenAt ?? "").slice(0, 40)}, updated_at = now()
      WHERE site = ${SITE} AND id = ${id}
    `;
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e, "Post tidak dapat diubah.");
  }
}

export async function DELETE(req: Request, ctx: Ctx) {
  const g = await guard(req, "gallery", "full");
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return bad("Id tidak sah.");
  try {
    await db()`DELETE FROM gallery_posts WHERE site = ${SITE} AND id = ${id}`;
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e, "Post tidak dapat dihapus.");
  }
}
