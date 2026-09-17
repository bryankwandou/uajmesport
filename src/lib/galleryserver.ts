import { db, SITE } from "@/lib/db";
import { ensureSchema } from "@/lib/perms";

/* Sisi server galeri dokumentasi. Setiap unggahan adalah satu "post" seperti
   Instagram: satu keterangan, satu kategori, sampai 10 foto. Foto disimpan
   sebagai base64 di Neon (sudah dikompres di browser), dan dilayani lewat
   /api/gallery/img dengan cache panjang karena isinya tidak pernah berubah. */

export const CATEGORIES = ["kegiatan", "prestasi", "medsos"] as const;
export type Category = (typeof CATEGORIES)[number];
export const MAX_IMAGES = 10;
export const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
export const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PostRow = {
  id: string;
  caption: string;
  category: string;
  taken_at: string;
  author: string;
  images: number;
  width: number;
  height: number;
  created_at: string | number;
};

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}

export function postShape(r: PostRow, withAuthor = false) {
  return {
    id: r.id,
    caption: r.caption,
    category: r.category,
    takenAt: r.taken_at,
    images: r.images,
    width: r.width,
    height: r.height,
    createdAt: Number(r.created_at),
    ...(withAuthor ? { author: r.author } : {}),
  };
}

export async function listPosts(includeDrafts: boolean): Promise<PostRow[]> {
  await ensureSchema();
  const sql = db();
  const rows = includeDrafts
    ? await sql`SELECT id, caption, category, taken_at, author, images, width, height, created_at
                FROM gallery_posts WHERE site = ${SITE} ORDER BY created_at DESC LIMIT 1000`
    : await sql`SELECT id, caption, category, taken_at, author, images, width, height, created_at
                FROM gallery_posts WHERE site = ${SITE} AND images > 0
                ORDER BY created_at DESC LIMIT 1000`;
  return rows as unknown as PostRow[];
}

export async function getPost(id: string): Promise<PostRow | null> {
  await ensureSchema();
  const rows = (await db()`
    SELECT id, caption, category, taken_at, author, images, width, height, created_at
    FROM gallery_posts WHERE site = ${SITE} AND id = ${id}
  `) as unknown as PostRow[];
  return rows[0] ?? null;
}

export function bad(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

export function fail(e: unknown, fallback: string) {
  return Response.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 });
}
