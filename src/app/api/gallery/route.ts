import { fail, listPosts, postShape } from "@/lib/galleryserver";

export const dynamic = "force-dynamic";

/* Daftar post galeri yang sudah terbit. Tanpa nama pengunggah. */
export async function GET() {
  try {
    const rows = await listPosts(false);
    return Response.json({ posts: rows.map((r) => postShape(r)) }, { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return fail(e, "Galeri tidak dapat dibaca.");
  }
}
