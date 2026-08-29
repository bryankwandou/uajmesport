import { db, publicShape, SITE, type Row } from "@/lib/db";

export const dynamic = "force-dynamic";

/* The public registry, addressed by hash prefix.
 *
 * Shipping the whole registry to every visitor is what does not scale: at two
 * thousand certificates that is a 664 KB download before anyone has typed a
 * name. Instead the browser hashes the identity locally, sends only the first
 * four hex characters of that hash, and gets back the handful of rows sharing
 * that bucket — then finishes the match locally against the full hash.
 *
 * Four hex characters is 1 of 65,536 buckets. The server learns which bucket,
 * never which person: at any realistic registry size a bucket holds a couple
 * of rows, and the space of names that could have produced it is effectively
 * unbounded. This is the same k-anonymity trade a breached-password lookup
 * makes, and it turns an O(registry) payload into an O(1) one.
 *
 * With no prefix the route answers with a count only, which is all the page
 * needs to print "Registry n/200".
 */
export async function GET(req: Request) {
  try {
    const sql = db();
    const p = new URL(req.url).searchParams.get("p");

    if (p === null) {
      const [{ count }] = (await sql`
        SELECT count(*)::int AS count FROM certificates
        WHERE site = ${SITE} AND data IS NOT NULL
      `) as unknown as { count: number }[];
      return Response.json({ count }, { headers: { "cache-control": "no-store" } });
    }

    if (!/^[0-9a-f]{4}$/.test(p)) {
      return Response.json({ error: "Prefix tidak sah." }, { status: 400 });
    }

    const rows = (await sql`
      SELECT id, identity_key, title, event, issued_at, ref, file_name, mime, size, created_at
      FROM certificates
      WHERE site = ${SITE} AND data IS NOT NULL AND identity_key LIKE ${p + "%"}
      ORDER BY created_at ASC
      LIMIT 200
    `) as unknown as Row[];

    return Response.json(rows.map(publicShape), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Registry tidak dapat dibaca." },
      { status: 500 },
    );
  }
}
