import { db, publicShape, SITE, type Row } from "@/lib/db";

export const dynamic = "force-dynamic";

/* The public registry. Hashed identities and file metadata only; full_name and
   nim are not in the SELECT at all, so no name can leak through this route
   even by accident. */
export async function GET() {
  try {
    const sql = db();
    const rows = (await sql`
      SELECT id, identity_key, title, event, issued_at, ref, file_name, mime, size, created_at
      FROM certificates
      WHERE site = ${SITE} AND data IS NOT NULL
      ORDER BY created_at ASC
    `) as unknown as Row[];
    return Response.json(rows.map(publicShape), {
      headers: { "cache-control": "no-store" },
    });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Registry tidak dapat dibaca." },
      { status: 500 },
    );
  }
}
