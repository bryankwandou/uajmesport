import { db } from "@/lib/db";
import { atLeast, guard } from "@/lib/perms";
import { ALLOWED_MIME, bad, fail, getPost, MAX_IMAGE_BYTES, MAX_IMAGES, sniffMime, UUID_RE } from "@/lib/galleryserver";

export const dynamic = "force-dynamic";

/* Langkah 2: satu foto per request. Hanya untuk post yang belum terbit, kecuali
   akun dengan izin penuh. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await guard(req, "gallery", "post");
  if (g instanceof Response) return g;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return bad("Id tidak sah.");
  const b = (await req.json().catch(() => ({}))) as { idx?: number; mime?: string; data?: string };
  const idx = Number(b.idx);
  if (!Number.isInteger(idx) || idx < 0 || idx >= MAX_IMAGES) return bad("Urutan foto tidak sah.");
  if (!b.mime || !ALLOWED_MIME.includes(b.mime) || !b.data) return bad("Foto tidak sah.");
  if (b.data.length > MAX_IMAGE_BYTES * 1.4 || Buffer.byteLength(b.data, "base64") > MAX_IMAGE_BYTES) {
    return bad("Foto melebihi 3 MB.", 413);
  }
  const real = sniffMime(b.data);
  if (!real) return bad("Berkas bukan foto JPEG, PNG atau WebP.", 415);
  try {
    const post = await getPost(id);
    if (!post) return bad("Post tidak ditemukan.", 404);
    const full = atLeast(g.perms.gallery, "full");
    if (!full && (post.images > 0 || post.author !== g.account.user)) {
      return bad("Post ini tidak bisa diubah akun ini.", 403);
    }
    await db()`
      INSERT INTO gallery_images (post_id, idx, mime, data) VALUES (${id}, ${idx}, ${real}, ${b.data})
      ON CONFLICT (post_id, idx) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data
    `;
    return Response.json({ ok: true });
  } catch (e) {
    return fail(e, "Foto tidak dapat disimpan.");
  }
}
