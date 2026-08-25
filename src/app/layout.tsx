import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers, noFlashScript } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const orbit = Orbitron({ subsets: ["latin"], weight: ["600", "700", "800", "900"], variable: "--font-orbit" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "UKM E-Sport UAJM · Unit Kegiatan Mahasiswa E-Sport",
  description:
    "UKM E-Sport pertama Universitas Atma Jaya Makassar. Resmi, terstruktur, kompetitif. Gelar turnamen Mobile Legends, komunitas lintas fakultas, dan divisi Web3 (UAJM BCC).",
  keywords: ["UKM E-Sport", "UAJM", "Universitas Atma Jaya Makassar", "Esport", "Mobile Legends", "Starboy Esport"],
  openGraph: {
    title: "UKM E-Sport UAJM",
    description: "Resmi, terstruktur, kompetitif. UKM E-Sport pertama UAJM.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" dir="ltr" className={`${inter.variable} ${orbit.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Applies the stored theme and locale before first paint, so the page
            never flashes the wrong theme. Values are checked against a fixed
            allow-list and never interpolated into markup. */}
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
