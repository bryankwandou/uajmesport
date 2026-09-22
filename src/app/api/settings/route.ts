import { getRegister } from "@/lib/settings";

export const dynamic = "force-dynamic";

/* Publik: link pendaftaran yang berlaku. Tanpa nama pengubah. */
export async function GET() {
  try {
    const r = await getRegister();
    return Response.json(
      { registerUrl: r.url },
      { headers: { "cache-control": "public, max-age=0, s-maxage=30, stale-while-revalidate=300" } },
    );
  } catch {
    return Response.json({ registerUrl: null });
  }
}
