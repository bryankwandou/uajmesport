import { guard } from "@/lib/perms";
import { audit } from "@/lib/accounts";
import { checkRegisterUrl, getRegister, setRegister } from "@/lib/settings";

export const dynamic = "force-dynamic";

/* Link pendaftaran anggota. Hanya akun yang diberi izin "link pendaftaran"
   oleh pengelola izin. */
export async function GET(req: Request) {
  const g = await guard(req, "form", "full");
  if (g instanceof Response) return g;
  try {
    return Response.json(await getRegister(), { headers: { "cache-control": "no-store" } });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gagal." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const g = await guard(req, "form", "full");
  if (g instanceof Response) return g;
  const b = (await req.json().catch(() => ({}))) as { url?: unknown; reset?: unknown };
  try {
    if (b.reset === true) {
      await setRegister(null, g.account.user);
      await audit(g.account.user, "register_url", "(bawaan)");
      return Response.json({ ok: true, ...(await getRegister()) });
    }
    const c = checkRegisterUrl(b.url);
    if ("error" in c) return Response.json({ error: c.error }, { status: 400 });
    await setRegister(c.url, g.account.user);
    await audit(g.account.user, "register_url", c.url);
    return Response.json({ ok: true, ...(await getRegister()) });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Gagal." }, { status: 500 });
  }
}
