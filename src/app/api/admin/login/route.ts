import { checkLogin, clientId, issueToken, lockedFor, noteLogin } from "@/lib/accounts";

export const dynamic = "force-dynamic";

/* Kata sandi dicocokkan di server terhadap hash di database. Setelah 8 kali
   gagal dari alamat yang sama, login dikunci 15 menit. */
export async function POST(req: Request) {
  const { user, pass } = (await req.json().catch(() => ({}))) as { user?: unknown; pass?: unknown };
  if (typeof user !== "string" || typeof pass !== "string" || !user.trim() || !pass || pass.length > 200) {
    return Response.json({ error: "wrong" }, { status: 401 });
  }
  try {
    const client = clientId(req);
    const wait = await lockedFor(client);
    if (wait > 0) {
      return Response.json(
        { error: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(wait / 60)} menit.` },
        { status: 429, headers: { "retry-after": String(wait) } },
      );
    }
    const found = await checkLogin(user, pass);
    await noteLogin(client, !!found);
    if (!found) return Response.json({ error: "wrong" }, { status: 401 });
    return Response.json({ token: issueToken(found), role: found.role, user: found.user, perms: found.perms });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Login gagal." }, { status: 500 });
  }
}
