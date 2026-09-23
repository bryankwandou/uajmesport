import { getRegister } from "@/lib/settings";

export const dynamic = "force-dynamic";

/* Publik: link pendaftaran yang berlaku. Tanpa nama pengubah.
   Tanpa cache: begitu pengurus menyimpan link baru, pengunjung berikutnya
   langsung mendapatkannya. Satu query ringan per sesi pengunjung. */
export async function GET() {
  try {
    const r = await getRegister();
    return Response.json({ registerUrl: r.url }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ registerUrl: null });
  }
}
