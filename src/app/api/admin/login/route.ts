import { accounts, issueToken, matchSuper } from "@/lib/db";
import { permsFor } from "@/lib/perms";

export const dynamic = "force-dynamic";

/* Credentials are compared here, on the server, against CERT_ACCOUNTS and the
   single permissions account. They are never readable in the page source. */
export async function POST(req: Request) {
  const { user, pass } = (await req.json().catch(() => ({}))) as {
    user?: string;
    pass?: string;
  };
  const name = (user ?? "").trim();
  const found =
    matchSuper(name, pass ?? "") ??
    accounts().find((a) => a.user === name && a.pass === pass) ??
    null;
  if (!found) {
    if (accounts().length === 0) {
      return Response.json({ error: "CERT_ACCOUNTS belum dikonfigurasi." }, { status: 503 });
    }
    return Response.json({ error: "wrong" }, { status: 401 });
  }
  try {
    const perms = await permsFor(found);
    return Response.json({ token: issueToken(found), role: found.role, user: found.user, perms });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Izin tidak dapat dibaca." },
      { status: 500 },
    );
  }
}
