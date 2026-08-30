import { db, SITE } from "@/lib/db";

export const dynamic = "force-dynamic";

/* The bytes of one certificate, addressed by the full identity hash.
 *
 * Not by row id. The id used to be the whole secret, and the registry
 * published it: anyone willing to walk the 65,536 hash buckets could collect
 * every id and download every sheet, and the sheet carries the member's name
 * and NIM. Nothing on the public registry response can produce the 64-character
 * hash this route demands — only knowing the name and the NIM can.
 *
 * A member can hold more than one certificate under the same identity, so the
 * row is pinned by its creation stamp as well.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const k = url.searchParams.get("k") ?? "";
  const c = url.searchParams.get("c") ?? "";

  if (!/^[0-9a-f]{64}$/.test(k) || !/^\d{1,20}$/.test(c)) {
    return Response.json({ error: "Permintaan tidak sah." }, { status: 400 });
  }

  try {
    const sql = db();
    const rows = (await sql`
      SELECT data, mime, file_name FROM certificates
      WHERE site = ${SITE} AND identity_key = ${k} AND created_at = ${c}
      LIMIT 1
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
