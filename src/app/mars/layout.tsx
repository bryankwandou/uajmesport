import type { Metadata } from "next";

/* Halaman lagu berdiri sendiri di rutenya sendiri. Next.js memecah rute ini
   menjadi bundel terpisah, jadi kode pemutar dan seluruh naskah lirik tidak
   ikut membebani beranda dan baru diunduh ketika halaman ini dibuka. */
export const metadata: Metadata = {
  title: "Mars & Lagu Resmi · UKM E-Sport UAJM",
  description:
    "Tiga mars resmi UKM E-Sport Universitas Atma Jaya Makassar, masing-masing dua versi rekaman, lengkap dengan lirik, catatan aransemen, dan berkas MP3, WAV, serta video.",
  openGraph: {
    title: "Mars & Lagu Resmi · UKM E-Sport UAJM",
    description: "Tiga lagu resmi, enam versi rekaman, lirik lengkap, dan berkas siap pakai.",
    type: "music.album",
  },
};

export default function MarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
