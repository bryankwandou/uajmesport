import { db, SITE } from "@/lib/db";
import { ensureSchema } from "@/lib/perms";
import { bad, fail, UUID_RE } from "@/lib/galleryserver";

export const dynamic = "force-dynamic";

/* Satu foto: /api/gallery/img?id=<post>&i=<urutan>. Foto sebuah post tidak
   pernah diganti setelah terbit, jadi boleh di-cache selamanya. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id") ?? "";
  const i = Number(url.searchParams.get("i") ?? "0");
  if (!UUID_RE.test(id) || !Number.isInteger(i) || i < 0 || i > 20) return bad("Permintaan tidak sah.");
  try {
    await ensureSchema();
    const rows = (await db()`
      SELECT gi.mime, gi.data FROM gallery_images gi
      JOIN gallery_posts gp ON gp.id = gi.post_id
      WHERE gp.site = ${SITE} AND gi.post_id = ${id} AND gi.idx = ${i}
    `) as unknown as { mime: string; data: string }[];
    const row = rows[0];
    if (!row) return bad("Foto tidak ditemukan.", 404);
    const bytes = Buffer.from(row.data, "base64");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": ["image/jpeg", "image/png", "image/webp"].includes(row.mime) ? row.mime : "application/octet-stream",
        "content-length": String(bytes.length),
        "cache-control": "public, max-age=31536000, immutable",
        "x-content-type-options": "nosniff",
        "content-security-policy": "default-src 'none'; sandbox",
      },
    });
  } catch (e) {
    return fail(e, "Foto tidak dapat dibaca.");
  }
}
