import type { Metadata } from "next";

/* A member service, not a marketing page: it is linked from the site but kept
   out of search results, so a certificate lookup form is not what a stranger
   finds when they search for the organisation. */
export const metadata: Metadata = {
  title: "Klaim Sertifikat Anggota · UKM E-Sport UAJM",
  description:
    "Layanan anggota UKM E-Sport Universitas Atma Jaya Makassar: buka dan unduh sertifikat dengan nama lengkap dan NIM.",
  robots: { index: false, follow: false },
};

export default function CertLayout({ children }: { children: React.ReactNode }) {
  return children;
}
