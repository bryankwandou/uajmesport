import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profil Organisasi UKM E-Sport UAJM",
  description:
    "Pitch deck profil organisasi UKM E-Sport Universitas Atma Jaya Makassar: legalitas, visi, misi, struktur kepengurusan, keanggotaan, program kerja, prestasi, dan pendaftaran anggota.",
};

/* The deck is a standalone slide document served from /deck.html, so it keeps
   its own fixed presentation canvas without inheriting the site chrome. */
export default function DeckPage() {
  redirect("/deck.html");
}
