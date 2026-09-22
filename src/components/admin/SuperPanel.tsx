"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Segments, Toggle } from "@/components/ui/Segments";
import {
  changePassword,
  createAccount,
  deleteAccount,
  fetchAccounts,
  renameAccount,
  ROLE_CHOICES,
  roleName,
  setLevel,
  setRole,
  type AccountRow,
  type Level,
  type Perms,
  type Role,
} from "@/lib/adminclient";

/* Dasbor pengelola izin. Dua segmen, tanpa sertifikat dan tanpa galeri:
 *   Izin  – sakelar per akun: galeri, sertifikat, link pendaftaran
 *   Akun  – buat akun, ganti nama, ganti kata sandi, jabatan, hapus
 *
 * Setiap sakelar mengirim SATU perubahan (modul + tingkat), dan perubahan
 * untuk satu akun dikirim berurutan. Setelah tersimpan, daftar dibaca ulang
 * dari server, jadi yang tampil selalu keadaan yang benar-benar berlaku. */
type Tab = "perms" | "accounts";

export function SuperPanel({ token, siteName, onSignOut }: { token: string; siteName: string; onSignOut: () => void }) {
  const [rows, setRows] = useState<AccountRow[] | null>(null);
  const [tab, setTab] = useState<Tab>("perms");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const load = useCallback(async () => {
    try {
      setRows(await fetchAccounts(token));
      setError("");
    } catch (e) {
      const m = e instanceof Error ? e.message : "Gagal memuat akun.";
      if (/berwenang/i.test(m)) return onSignOut();
      setError(m);
    }
  }, [token, onSignOut]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  /** Menjalankan perubahan satu per satu, lalu membaca ulang dari server. */
  function run(user: string, label: string, op: () => Promise<unknown>, optimistic?: (r: AccountRow[]) => AccountRow[]) {
    if (optimistic) setRows((cur) => (cur ? optimistic(cur) : cur));
    setBusy((b) => new Set(b).add(user));
    const next = queue.current.then(async () => {
      try {
        await op();
        setToast(label);
        setError("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal menyimpan.");
      } finally {
        await load();
        setBusy((b) => {
          const n = new Set(b);
          n.delete(user);
          return n;
        });
      }
    });
    queue.current = next;
    return next;
  }

  const staff = rows?.filter((r) => r.role !== "super") ?? [];

  return (
    <div className="mx-auto max-w-3xl text-[color:var(--ui-text)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--ui-accent)]">Pengelola izin</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Izin &amp; akun pengurus</h2>
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-[color:var(--ui-muted)]">
            Atur siapa boleh melakukan apa di {siteName}, dan kelola akunnya. Perubahan berlaku seketika — sesi akun yang
            izinnya dicabut ikut tertutup. Akun ini tidak membuka dasbor sertifikat maupun galeri.
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-lg border border-[color:var(--ui-line-strong)] px-4 py-2 text-xs font-medium hover:bg-[color:var(--ui-surface-2)]"
        >
          Keluar
        </button>
      </div>

      <Segments
        items={[
          { id: "perms" as Tab, label: "Izin", count: staff.length || undefined },
          { id: "accounts" as Tab, label: "Akun", count: rows?.length || undefined },
        ]}
        value={tab}
        onChange={setTab}
        label="Bagian pengelola izin"
        className="mt-8 [justify-content:safe_center]"
      />

      {error && (
        <p role="alert" className="mt-5 rounded-lg border border-[#ed4956]/40 px-4 py-3 text-sm text-[#ed4956]">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="mt-10 text-sm text-[color:var(--ui-muted)]">Memuat…</p>
      ) : tab === "perms" ? (
        staff.length === 0 ? (
          <p className="mt-10 text-sm text-[color:var(--ui-muted)]">Belum ada akun pengurus. Buat di segmen Akun.</p>
        ) : (
          <div className="mt-8 space-y-5">
            {staff.map((r) => (
              <PermCard
                key={r.user}
                row={r}
                busy={busy.has(r.user)}
                onChange={(module, level) =>
                  run(
                    r.user,
                    `Izin ${r.user} tersimpan.`,
                    () => setLevel(token, r.user, module, level),
                    (cur) => cur.map((x) => (x.user === r.user ? { ...x, perms: { ...x.perms, [module]: level } } : x)),
                  )
                }
              />
            ))}
          </div>
        )
      ) : (
        <Accounts rows={rows} busy={busy} token={token} run={run} />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg bg-[#262626] px-4 py-3 text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

/* ── Izin ─────────────────────────────────────────────────────────────── */
function Avatar({ name }: { name: string }) {
  const initial = name.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 1).toUpperCase() || "?";
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--ui-surface-2)] font-bold">
      {initial}
    </span>
  );
}

function PermCard({
  row,
  busy,
  onChange,
}: {
  row: AccountRow;
  busy: boolean;
  onChange: (module: keyof Perms, level: Level) => void;
}) {
  const p = row.perms;
  return (
    <div className="rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-surface)]">
      <div className="flex items-center gap-3 border-b border-[color:var(--ui-line)] px-5 py-4">
        <Avatar name={row.user} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{row.user}</div>
          <div className="text-xs text-[color:var(--ui-muted)]">{roleName(row.role)}</div>
        </div>
        {busy && <span className="text-[11px] text-[color:var(--ui-muted)]">Menyimpan…</span>}
      </div>
      <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-[color:var(--ui-line)]">
        <Module
          title="Admin medsos · Galeri"
          accessLabel="Boleh posting"
          accessHint="Membuat post dokumentasi baru"
          fullLabel="Juga boleh edit & hapus"
          fullHint="Mengubah keterangan dan menghapus post"
          level={p.gallery}
          onChange={(l) => onChange("gallery", l)}
        />
        <Module
          title="Admin sertifikat · Bendahara"
          accessLabel="Boleh terbitkan"
          accessHint="Menambah dan menerbitkan sertifikat baru"
          fullLabel="Juga boleh edit & hapus"
          fullHint="Mengubah dan menghapus sertifikat yang sudah terbit"
          level={p.cert}
          onChange={(l) => onChange("cert", l)}
        />
      </div>
      <div className="border-t border-[color:var(--ui-line)] px-5 py-3">
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ui-muted)]">
            Link pendaftaran · Google Form
          </span>
          <Badge level={p.form === "none" ? "none" : "full"} />
        </div>
        <Toggle
          label="Boleh ganti link pendaftaran"
          hint="Mengubah link tombol “Daftar Anggota” di seluruh situs"
          checked={p.form !== "none"}
          onChange={(v) => onChange("form", v ? "full" : "none")}
        />
      </div>
    </div>
  );
}

function Badge({ level }: { level: Level }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        level === "none"
          ? "bg-[color:var(--ui-surface-2)] text-[color:var(--ui-muted)]"
          : "bg-[color:var(--ui-accent)] text-[color:var(--ui-on-accent)]"
      }`}
    >
      {level === "none" ? "Tidak ada akses" : level === "post" ? "Posting saja" : "Penuh"}
    </span>
  );
}

function Module({
  title,
  accessLabel,
  accessHint,
  fullLabel,
  fullHint,
  level,
  onChange,
}: {
  title: string;
  accessLabel: string;
  accessHint: string;
  fullLabel: string;
  fullHint: string;
  level: Level;
  onChange: (l: Level) => void;
}) {
  const access = level !== "none";
  return (
    <div className="border-t border-[color:var(--ui-line)] px-5 py-3 first:border-t-0 sm:border-t-0">
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ui-muted)]">{title}</span>
        <Badge level={level} />
      </div>
      <div className="divide-y divide-[color:var(--ui-line)]">
        <Toggle label={accessLabel} hint={accessHint} checked={access} onChange={(v) => onChange(v ? "post" : "none")} />
        <Toggle
          label={fullLabel}
          hint={fullHint}
          checked={level === "full"}
          disabled={!access}
          onChange={(v) => onChange(v ? "full" : "post")}
        />
      </div>
    </div>
  );
}

/* ── Akun ─────────────────────────────────────────────────────────────── */
const input =
  "w-full rounded-lg border border-[color:var(--ui-line-strong)] bg-[color:var(--ui-surface)] px-3 py-2 text-sm text-[color:var(--ui-text)] outline-none focus:border-[color:var(--ui-accent)]";
const btn =
  "rounded-lg border border-[color:var(--ui-line-strong)] px-3 py-1.5 text-xs font-medium hover:bg-[color:var(--ui-surface-2)] disabled:opacity-40";
const primary =
  "rounded-lg bg-[color:var(--ui-accent)] px-4 py-2 text-xs font-semibold text-[color:var(--ui-on-accent)] disabled:opacity-40";

type Run = (user: string, label: string, op: () => Promise<unknown>) => Promise<unknown>;

function Accounts({ rows, busy, token, run }: { rows: AccountRow[]; busy: Set<string>; token: string; run: Run }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRoleSel] = useState<Role>("staff");
  const [show, setShow] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    const name = user.trim();
    await run(name, `Akun ${name} dibuat. Atur izinnya di segmen Izin.`, async () => {
      await createAccount(token, name, pass, role);
      setUser("");
      setPass("");
    });
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={create} className="rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-surface)] p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ui-muted)]">Buat akun baru</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-xs text-[color:var(--ui-muted)]">Nama akun</span>
            <input className={input} value={user} onChange={(e) => setUser(e.target.value)} autoComplete="off" required />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[color:var(--ui-muted)]">Kata sandi (min. 10, huruf + angka)</span>
            <div className="flex gap-2">
              <input
                className={input}
                type={show ? "text" : "password"}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button type="button" className={btn} onClick={() => setShow((v) => !v)}>
                {show ? "Tutup" : "Lihat"}
              </button>
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-[color:var(--ui-muted)]">Jabatan</span>
            <select className={input} value={role} onChange={(e) => setRoleSel(e.target.value as Role)}>
              {ROLE_CHOICES.map((r) => (
                <option key={r} value={r}>
                  {roleName(r)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-[color:var(--ui-muted)]">Akun baru mulai tanpa izin apa pun.</p>
          <button type="submit" className={primary} disabled={!user.trim() || pass.length < 10}>
            Buat akun
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {rows.map((r) => (
          <AccountItem key={r.user} row={r} busy={busy.has(r.user)} token={token} run={run} />
        ))}
      </div>
    </div>
  );
}

function AccountItem({ row, busy, token, run }: { row: AccountRow; busy: boolean; token: string; run: Run }) {
  const [mode, setMode] = useState<"" | "pass" | "rename" | "delete">("");
  const [value, setValue] = useState("");
  const [purge, setPurge] = useState(false);
  const isSuper = row.role === "super";

  function open(m: typeof mode) {
    setMode(mode === m ? "" : m);
    setValue(m === "rename" ? row.user : "");
    setPurge(false);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (mode === "pass") await run(row.user, `Kata sandi ${row.user} diganti. Sesi lamanya ditutup.`, () => changePassword(token, row.user, value));
    if (mode === "rename") await run(row.user, `Akun diganti nama menjadi ${value.trim()}.`, () => renameAccount(token, row.user, value));
    if (mode === "delete") await run(row.user, `Akun ${row.user} dihapus.`, () => deleteAccount(token, row.user, purge));
    setMode("");
  }

  return (
    <div className="rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-surface)] px-5 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={row.user} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">
            {row.user} {row.self && <span className="text-xs font-normal text-[color:var(--ui-muted)]">(Anda)</span>}
          </div>
          {isSuper ? (
            <div className="text-xs text-[color:var(--ui-muted)]">Pengelola izin</div>
          ) : (
            <select
              aria-label={`Jabatan ${row.user}`}
              className="mt-0.5 bg-transparent text-xs text-[color:var(--ui-muted)] outline-none"
              value={row.role}
              disabled={busy}
              onChange={(e) => run(row.user, `Jabatan ${row.user} diubah.`, () => setRole(token, row.user, e.target.value as Role))}
            >
              {ROLE_CHOICES.map((r) => (
                <option key={r} value={r}>
                  {roleName(r)}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={btn} disabled={busy} onClick={() => open("pass")}>
            Ganti kata sandi
          </button>
          {!isSuper && (
            <>
              <button type="button" className={btn} disabled={busy} onClick={() => open("rename")}>
                Ganti nama
              </button>
              <button type="button" className={`${btn} text-[#ed4956]`} disabled={busy} onClick={() => open("delete")}>
                Hapus
              </button>
            </>
          )}
        </div>
      </div>

      {mode && (
        <form onSubmit={submit} className="mt-4 border-t border-[color:var(--ui-line)] pt-4">
          {mode === "delete" ? (
            <>
              <p className="text-sm">
                Hapus akun <b>{row.user}</b>? Sesinya langsung ditutup dan tidak bisa masuk lagi.
              </p>
              <label className="mt-3 flex items-center gap-2 text-xs text-[color:var(--ui-muted)]">
                <input type="checkbox" checked={purge} onChange={(e) => setPurge(e.target.checked)} />
                Hapus juga semua post galeri yang pernah diunggah akun ini
              </label>
            </>
          ) : (
            <label className="block">
              <span className="mb-1 block text-xs text-[color:var(--ui-muted)]">
                {mode === "pass" ? "Kata sandi baru (min. 10, huruf + angka)" : "Nama akun baru"}
              </span>
              <input
                className={input}
                type={mode === "pass" ? "password" : "text"}
                autoComplete={mode === "pass" ? "new-password" : "off"}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                autoFocus
              />
            </label>
          )}
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className={btn} onClick={() => setMode("")}>
              Batal
            </button>
            <button
              type="submit"
              disabled={busy || (mode !== "delete" && !value.trim())}
              className={mode === "delete" ? "rounded-lg bg-[#ed4956] px-4 py-2 text-xs font-semibold text-white" : primary}
            >
              {mode === "delete" ? "Hapus akun" : "Simpan"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
