# UKM E-Sport UAJM

Situs showcase resmi **Unit Kegiatan Mahasiswa E-Sport Universitas Atma Jaya Makassar** — UKM E-Sport pertama yang lahir dari mahasiswa FTI. Resmi, terstruktur, kompetitif.

Tema: gaming / esport profesional. Menampilkan visi-misi resmi (AD/ART), gelar turnamen Mobile Legends, komposisi komunitas lintas fakultas, dan struktur kepengurusan 2025/2026. Menaungi divisi Web3 **UAJM BCC**.

## Stack
- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS 3 · Framer Motion

## Jalankan lokal
```bash
npm install
npm run dev
```
Buka http://localhost:3000

## Konten
Seluruh angka & klaim bersumber dari dokumen resmi (SK, AD/ART, respons pendaftaran) dan sertifikat turnamen pada arsip organisasi. Tidak ada metrik fiktif.

---
Ekosistem: UAJM BCC · [uajmbcc.vercel.app](https://uajmbcc.vercel.app)

## Periode otomatis

Angka periode tidak pernah diketik tangan. `src/lib/period.ts` menghitungnya dari
kalender (WITA) dan berganti setiap 1 Agustus:

| Token di teks | Contoh (Sep 2026) | Contoh (Agu 2027) |
|---|---|---|
| `{REG}` pendaftaran | 2026/2027 | 2027/2028 |
| `{TERM}` kepengurusan | 2025/2026 | 2026/2027 |
| `{TERM_NO}` kepengurusan ke- | 2 | 3 |

Tulis token itu di `src/lib/i18n.ts` atau `src/lib/content.ts`; `Providers` dan
`withPeriod()` mengisinya. `public/deck.html` memakai rumus yang sama.

## Galeri dokumentasi

Dikelola tanpa kode: `/sertifikat` → **Masuk pengurus** → tab **Galeri** →
**+ Post baru** → pilih foto → Berikutnya → keterangan & kategori → **Bagikan**.
Foto dikompres di browser (maks. 1440 px, JPEG) lalu disimpan di Neon.

- Tampilan depan: `src/components/gallery/GalleryFeed.tsx`
- Editor dasbor: `src/components/gallery/GalleryEditor.tsx`
- API: `src/app/api/gallery/*` (publik), `src/app/api/admin/gallery/*`
- Kategori: `GALLERY_CATEGORIES` di `src/lib/gallery.ts` dan `CATEGORIES` di `src/lib/galleryserver.ts`

## Akun dan izin

- Akun pengurus: env `CERT_ACCOUNTS` (`user:pass:role,...`).
- Pengelola izin: nama lengkap *Vincentius Bryan Kwandou* (huruf besar/kecil
  bebas). Kata sandinya hanya disimpan sebagai hash scrypt di `src/lib/db.ts`.
  Akun ini hanya melihat panel izin.
- Izin per akun (tabel `admin_perms`): galeri dan sertifikat masing-masing
  `none` / `post` (terbitkan saja) / `full` (plus edit & hapus). Akun yang belum
  diatur bernilai `full`. Semua route admin memeriksa izin lewat `guard()` di
  `src/lib/perms.ts`.
- Tabel baru dibuat otomatis saat pertama dipakai; `node scripts/db-setup.mjs`
  juga membuatnya.

Komponen di `src/components/{gallery,admin,ui}` dan `src/lib/{period,perms,gallery,galleryserver,adminclient}.ts`
identik di repo uajmesport dan uajmbcc. Warnanya lewat token `--ui-*` di `globals.css`.
