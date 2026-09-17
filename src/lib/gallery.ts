/* Galeri dokumentasi — sisi browser.
 *
 * Konten dikelola dari dasbor pengurus tanpa menyentuh kode: pilih foto,
 * tulis keterangan, bagikan. Kategori menentukan tab di halaman depan. */

export type GalleryCategory = "kegiatan" | "prestasi" | "medsos";

export const GALLERY_CATEGORIES: { id: GalleryCategory; label: string }[] = [
  { id: "kegiatan", label: "Kegiatan" },
  { id: "prestasi", label: "Prestasi" },
  { id: "medsos", label: "Medsos" },
];

export type GalleryPost = {
  id: string;
  caption: string;
  category: GalleryCategory;
  takenAt: string;
  images: number;
  width: number;
  height: number;
  createdAt: number;
  author?: string;
};

export const MAX_PHOTOS = 10;

export function imageUrl(id: string, i = 0): string {
  return `/api/gallery/img?id=${id}&i=${i}`;
}

export function categoryLabel(c: string): string {
  return GALLERY_CATEGORIES.find((x) => x.id === c)?.label ?? c;
}

export function formatDate(p: GalleryPost): string {
  if (p.takenAt) {
    const d = new Date(`${p.takenAt}T00:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
    return p.takenAt;
  }
  return new Date(p.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

export async function publicPosts(): Promise<GalleryPost[]> {
  try {
    const res = await fetch("/api/gallery", { cache: "no-store" });
    if (!res.ok) return [];
    const body = (await res.json()) as { posts?: GalleryPost[] };
    return Array.isArray(body.posts) ? body.posts : [];
  } catch {
    return [];
  }
}

/* ── kompresi ─────────────────────────────────────────────────────────────
   Foto dari ponsel bisa 5–12 MB. Sisi terpanjang diperkecil ke 1440 px dan
   disimpan sebagai JPEG, biasanya 150–400 KB, jadi database tidak cepat
   penuh dan galeri tetap ringan dibuka. `square` memotong ke tengah 1:1,
   sama seperti pilihan potong di Instagram. */
export type Prepared = { mime: string; data: string; width: number; height: number };

const MAX_EDGE = 1440;

export async function prepareImage(file: File, square: boolean): Promise<Prepared> {
  const bitmap = await loadBitmap(file);
  const sw = bitmap.width;
  const sh = bitmap.height;
  let sx = 0;
  let sy = 0;
  let cw = sw;
  let ch = sh;
  if (square) {
    const side = Math.min(sw, sh);
    sx = (sw - side) / 2;
    sy = (sh - side) / 2;
    cw = side;
    ch = side;
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(cw, ch));
  const w = Math.round(cw * scale);
  const h = Math.round(ch * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Browser tidak dapat memproses foto.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, sx, sy, cw, ch, 0, 0, w, h);
  if ("close" in bitmap && typeof bitmap.close === "function") bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
  if (!blob) throw new Error("Foto tidak dapat dikompres.");
  const data = await blobToBase64(blob);
  return { mime: "image/jpeg", data, width: w, height: h };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* jatuh ke <img> di bawah */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const s = String(fr.result);
      resolve(s.slice(s.indexOf(",") + 1));
    };
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(blob);
  });
}

/* ── panggilan dasbor ───────────────────────────────────────────────────── */
function auth(token: string) {
  return { authorization: `Bearer ${token}`, "content-type": "application/json" };
}

async function ok<T>(res: Response, fallback: string): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `${fallback} (${res.status}).`);
  }
  return (await res.json()) as T;
}

export async function adminPosts(token: string): Promise<GalleryPost[]> {
  const res = await fetch("/api/admin/gallery", { headers: auth(token), cache: "no-store" });
  return (await ok<{ posts: GalleryPost[] }>(res, "Galeri gagal dimuat")).posts;
}

export async function sharePost(
  token: string,
  meta: { caption: string; category: GalleryCategory; takenAt: string },
  photos: Prepared[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const first = photos[0];
  const created = await ok<{ id: string }>(
    await fetch("/api/admin/gallery", {
      method: "POST",
      headers: auth(token),
      body: JSON.stringify({ ...meta, width: first?.width ?? 0, height: first?.height ?? 0 }),
    }),
    "Post gagal dibuat",
  );
  for (let i = 0; i < photos.length; i++) {
    await ok(
      await fetch(`/api/admin/gallery/${created.id}/image`, {
        method: "POST",
        headers: auth(token),
        body: JSON.stringify({ idx: i, mime: photos[i].mime, data: photos[i].data }),
      }),
      "Foto gagal diunggah",
    );
    onProgress?.(i + 1, photos.length);
  }
  await ok(
    await fetch(`/api/admin/gallery/${created.id}/publish`, { method: "POST", headers: auth(token) }),
    "Post gagal diterbitkan",
  );
}

export async function updatePost(
  token: string,
  id: string,
  meta: { caption: string; category: GalleryCategory; takenAt: string },
): Promise<void> {
  await ok(
    await fetch(`/api/admin/gallery/${id}`, { method: "PATCH", headers: auth(token), body: JSON.stringify(meta) }),
    "Post gagal diubah",
  );
}

export async function deletePost(token: string, id: string): Promise<void> {
  await ok(await fetch(`/api/admin/gallery/${id}`, { method: "DELETE", headers: auth(token) }), "Post gagal dihapus");
}
