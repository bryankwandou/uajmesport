import { db, SITE } from "@/lib/db";
import { guard } from "@/lib/perms";
import { bad, fail, UUID_RE } from "@/lib/galleryserver";

export const dynamic = "force-dynamic";

/* Langkah 3: post tampil di galeri begitu jumlah fotonya tercatat. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard(req, "gallery", "post");
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return bad("Id tidak sah.");
  try {
    const rows = (await db()`
      UPDATE gallery_posts
      SET images = (SELECT count(*) FROM gallery_images WHERE post_id = ${id}), updated_at = now()
      WHERE site = ${SITE} AND id = ${id}
      RETURNING images
    `) as unknown as { images: number }[];
    if (!rows[0]) return bad("Post tidak ditemukan.", 404);
    if (rows[0].images === 0) return bad("Post belum punya foto.");
    return Response.json({ ok: true, images: rows[0].images });
  } catch (e) {
    return fail(e, "Post tidak dapat diterbitkan.");
  }
}
