import { adminShape, db, SITE, unauthorized, verifyToken, type Row } from "@/lib/db";

export const dynamic = "force-dynamic";

/** A cap that keeps one oversized scan from eating the whole database. */
const MAX_FILE_BYTES = 8 * 1024 * 1024;

export async function GET(req: Request) {
  if (!verifyToken(req.headers.get("authorization"))) return unauthorized();
  try {
    const sql = db();
    const rows = (await sql`
      SELECT id, identity_key, full_name, nim, title, event, issued_at, ref,
             file_name, mime, size, created_at
      FROM certificates WHERE site = ${SITE} ORDER BY created_at ASC
    `) as unknown as Row[];
    const [{ bytes }] = (await sql`
      SELECT COALESCE(SUM(size), 0)::bigint AS bytes FROM certificates WHERE site = ${SITE}
    `) as unknown as { bytes: string }[];
    return Response.json({ records: rows.map(adminShape), bytes: Number(bytes) });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Data tidak dapat dibaca." },
      { status: 500 },
    );
  }
}

/* Insert or update one certificate. `data` is a base64 payload; omitting it on
   an update keeps whatever file is already stored, which is what the edit form
   does when the board only fixes a spelling. */
export async function POST(req: Request) {
  if (!verifyToken(req.headers.get("authorization"))) return unauthorized();
  try {
    const b = (await req.json()) as {
      id: string;
      key: string;
      fullName: string;
      nim?: string;
      title?: string;
      event?: string;
      issuedAt?: string;
      ref?: string;
      fileName?: string;
      mime?: string;
      size?: number;
      data?: string | null;
      createdAt?: number;
    };
    if (!b?.id || !b?.key || !b?.fullName) {
      return Response.json({ error: "Data tidak lengkap." }, { status: 400 });
    }
    if (b.data && Buffer.byteLength(b.data, "base64") > MAX_FILE_BYTES) {
      return Response.json({ error: "Berkas melebihi 8 MB." }, { status: 413 });
    }
    const sql = db();
    await sql`
      INSERT INTO certificates
        (id, site, identity_key, full_name, nim, title, event, issued_at, ref,
         file_name, mime, size, data, created_at)
      VALUES
        (${b.id}, ${SITE}, ${b.key}, ${b.fullName}, ${b.nim ?? ""}, ${b.title ?? ""},
         ${b.event ?? ""}, ${b.issuedAt ?? ""}, ${b.ref ?? null}, ${b.fileName ?? ""},
         ${b.mime ?? ""}, ${b.size ?? 0}, ${b.data ?? null}, ${b.createdAt ?? Date.now()})
      ON CONFLICT (id) DO UPDATE SET
        identity_key = EXCLUDED.identity_key,
        full_name    = EXCLUDED.full_name,
        nim          = EXCLUDED.nim,
        title        = EXCLUDED.title,
        event        = EXCLUDED.event,
        issued_at    = EXCLUDED.issued_at,
        ref          = EXCLUDED.ref,
        file_name    = CASE WHEN EXCLUDED.data IS NULL THEN certificates.file_name ELSE EXCLUDED.file_name END,
        mime         = CASE WHEN EXCLUDED.data IS NULL THEN certificates.mime      ELSE EXCLUDED.mime END,
        size         = CASE WHEN EXCLUDED.data IS NULL THEN certificates.size      ELSE EXCLUDED.size END,
        data         = COALESCE(EXCLUDED.data, certificates.data),
        updated_at   = now()
    `;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Data tidak dapat disimpan." },
      { status: 500 },
    );
  }
}
