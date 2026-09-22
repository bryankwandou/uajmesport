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

/* Isi berkas diperiksa dari byte awalnya, bukan dari label yang dikirim
   browser. Yang bukan JPEG/PNG/WebP asli ditolak, jadi route foto tidak bisa
   dipakai untuk menaruh HTML, SVG atau skrip. */
export function sniffMime(b64: string): string | null {
  const head = Buffer.from(b64.slice(0, 24), "base64");
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "image/jpeg";
  if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (head.subarray(0, 4).toString("latin1") === "RIFF" && head.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
  return null;
}

/* Batas unggah. Satu akun yang dibobol tetap tidak bisa membanjiri galeri:
   paling banyak POSTS_PER_DAY post per akun per 24 jam, dan galeri satu situs
   tidak menampung lebih dari MAX_POSTS post. */
export const POSTS_PER_DAY = 20;
export const MAX_POSTS = 1500;

export async function uploadQuota(author: string): Promise<string | null> {
  await ensureSchema();
  const since = Date.now() - 24 * 3600 * 1000;
  const [r] = (await db()`
    SELECT count(*) FILTER (WHERE author = ${author} AND created_at > ${since})::int AS mine,
           count(*)::int AS total
    FROM gallery_posts WHERE site = ${SITE}
  `) as unknown as { mine: number; total: number }[];
  if (r.mine >= POSTS_PER_DAY) return `Batas ${POSTS_PER_DAY} post per akun per 24 jam tercapai.`;
  if (r.total >= MAX_POSTS) return `Galeri sudah berisi ${MAX_POSTS} post. Hapus yang lama dulu.`;
  return null;
}

/* Unggahan yang tidak pernah selesai lebih dari sehari dibuang. */
export async function dropStaleDrafts() {
  const before = Date.now() - 24 * 3600 * 1000;
  await db()`DELETE FROM gallery_posts WHERE site = ${SITE} AND images = 0 AND created_at < ${before}`;
}

export function bad(msg: string, status = 400) {
  return Response.json({ error: msg }, { status });
}

export function fail(e: unknown, fallback: string) {
  return Response.json({ error: e instanceof Error ? e.message : fallback }, { status: 500 });
}
