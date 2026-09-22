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
kalender (WITA) dan berganti setiap **1 September**, tanpa batas tahun:

| Token di teks | Sep 2026 | Sep 2027 | Sep 2510 |
|---|---|---|---|
| `{REG}` pendaftaran / tahun ajaran | 2026/2027 | 2027/2028 | 2510/2511 |
| `{TERM}` kepengurusan | 2025/2026 | 2026/2027 | 2509/2510 |
| `{TERM_NO}` kepengurusan ke- | 2 | 3 | 486 |

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

- Semua akun ada di tabel `admin_accounts` (Neon). Kata sandi hanya disimpan
  sebagai hash scrypt dengan salt acak per akun. **Tidak ada kredensial di repo.**
- Pengelola izin (role `super`) masuk dengan nama lengkapnya (huruf besar/kecil
  bebas) dan hanya melihat dua segmen: **Izin** dan **Akun**. Di sana ia membuat
  akun, mengganti nama, mengganti kata sandi, mengubah jabatan dan menghapus akun.
  Akun ini sendiri dibuat/diatur ulang dengan `scripts/seed-super.mjs` (nama dan
  kata sandi lewat variabel lingkungan).
- Izin per akun: galeri dan sertifikat `none` / `post` / `full`, link pendaftaran
  `none` / `full`. Akun baru mulai tanpa izin. Izin dibaca dari database di
  setiap permintaan (`guard()` di `src/lib/perms.ts`); dasbor menanyakannya ulang
  tiap 15 detik, jadi mencabut izin langsung menutup segmennya.
- Token sesi ditandatangani HMAC (`SESSION_SECRET`), habis dalam 12 jam, dan
  dicabut seketika saat kata sandi/nama diganti atau akun dihapus.
- Login dikunci 15 menit setelah 8 kali gagal dari alamat yang sama.
- Galeri: isi foto diperiksa dari byte awalnya (hanya JPEG/PNG/WebP asli),
  maks. 20 post per akun per 24 jam, akun "posting saja" hanya bisa mengisi post
  miliknya sendiri. Menghapus akun bisa sekaligus menghapus semua post-nya.
- Setiap perubahan akun, izin dan link tercatat di tabel `admin_audit`.
- `CERT_ACCOUNTS` hanya dibaca sekali untuk memindahkan akun lama ke tabel.

## Link pendaftaran

Akun yang diberi izin "link pendaftaran" mendapat segmen **Pendaftaran** di
dasbor. Link yang disimpan di sana dipakai semua tombol "Daftar" (dan slide deck)
tanpa build ulang. Host yang diterima ada di `REGISTER_HOSTS`, `src/lib/settings.ts`.

Komponen di `src/components/{gallery,admin,ui}` dan `src/lib/{period,perms,gallery,galleryserver,adminclient}.ts`
identik di repo uajmesport dan uajmbcc. Warnanya lewat token `--ui-*` di `globals.css`.
