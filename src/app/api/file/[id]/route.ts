import { db, SITE } from "@/lib/db";

export const dynamic = "force-dynamic";

/* The bytes of one certificate, addressed by its UUID. The id only becomes
   known after the browser has matched a hashed identity locally, so this is
   not a route a stranger can walk. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return Response.json({ error: "Id tidak sah." }, { status: 400 });
  }
  try {
    const sql = db();
    const rows = (await sql`
      SELECT data, mime, file_name FROM certificates WHERE site = ${SITE} AND id = ${id}
    `) as unknown as { data: string | null; mime: string; file_name: string }[];
    const row = rows[0];
    if (!row?.data) return Response.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
    const bytes = Buffer.from(row.data, "base64");
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": row.mime || "application/octet-stream",
        "content-length": String(bytes.length),
        "cache-control": "no-store",
        "content-disposition": `inline; filename="${row.file_name.replace(/[^\w.\-]/g, "_")}"`,
      },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Berkas tidak dapat dibaca." },
      { status: 500 },
    );
  }
}
