import { accounts, issueToken } from "@/lib/db";

export const dynamic = "force-dynamic";

/* Credentials are compared here, on the server, against CERT_ACCOUNTS. They
   are no longer readable in the page source. */
export async function POST(req: Request) {
  const { user, pass } = (await req.json().catch(() => ({}))) as {
    user?: string;
    pass?: string;
  };
  const list = accounts();
  if (list.length === 0) {
    return Response.json({ error: "CERT_ACCOUNTS belum dikonfigurasi." }, { status: 503 });
  }
  const found = list.find((a) => a.user === (user ?? "").trim() && a.pass === pass);
  if (!found) return Response.json({ error: "wrong" }, { status: 401 });
  return Response.json({ token: issueToken(found), role: found.role });
}
