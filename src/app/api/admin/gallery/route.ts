import { db, SITE } from "@/lib/db";
import { guard } from "@/lib/perms";
import { bad, dropStaleDrafts, fail, isCategory, listPosts, postShape, uploadQuota } from "@/lib/galleryserver";

export const dynamic = "force-dynamic";

/* Semua post, termasuk yang unggahannya belum selesai, untuk editor galeri. */
export async function GET(req: Request) {
  const g = await guard(req, "gallery", "post");
  if (g instanceof Response) return g;
  try {
    const rows = await listPosts(true);
    return Response.json({ posts: rows.map((r) => postShape(r, true)) });
  } catch (e) {
    return fail(e, "Galeri tidak dapat dibaca.");
  }
}

/* Langkah 1 dari 3: buat post kosong. Foto dikirim satu per satu ke
   /[id]/image (menjaga tiap request di bawah batas 4,5 MB Vercel), lalu
   /[id]/publish membuatnya tampil. */
export async function POST(req: Request) {
  const g = await guard(req, "gallery", "post");
  if (g instanceof Response) return g;
  const b = (await req.json().catch(() => ({}))) as {
    caption?: string;
    category?: string;
    takenAt?: string;
    width?: number;
    height?: number;
  };
  if (!isCategory(b.category)) return bad("Kategori tidak sah.");
  const id = crypto.randomUUID();
  try {
    await dropStaleDrafts();
    const over = await uploadQuota(g.account.user);
    if (over) return bad(over, 429);
    await db()`
      INSERT INTO gallery_posts (id, site, caption, category, taken_at, author, images, width, height, created_at)
      VALUES (${id}, ${SITE}, ${(b.caption ?? "").slice(0, 2200)}, ${b.category},
              ${(b.takenAt ?? "").slice(0, 40)}, ${g.account.user}, 0,
              ${Math.round(Number(b.width) || 0)}, ${Math.round(Number(b.height) || 0)}, ${Date.now()})
    `;
    return Response.json({ id });
  } catch (e) {
    return fail(e, "Post tidak dapat dibuat.");
  }
}
