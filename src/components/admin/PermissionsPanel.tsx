"use client";
import { useCallback, useEffect, useState } from "react";
import { Toggle } from "@/components/ui/Segments";
import {
  fetchPerms,
  roleName,
  savePerms,
  type AccountPerms,
  type Level,
  type Perms,
} from "@/lib/adminclient";

/* Dasbor pengelola izin. Hanya berisi daftar akun dan sakelar izinnya —
   tidak ada sertifikat, tidak ada galeri. Setiap sakelar langsung tersimpan.
 *
 *   Admin medsos (galeri):  akses → posting saja; + edit & hapus → penuh
 *   Admin sertifikat:       akses → terbitkan saja; + edit & hapus → penuh
 */
export function PermissionsPanel({
  token,
  siteName,
  onSignOut,
}: {
  token: string;
  siteName: string;
  onSignOut: () => void;
}) {
  const [rows, setRows] = useState<AccountPerms[] | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    try {
      setRows(await fetchPerms(token));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat izin.");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!saved) return;
    const t = window.setTimeout(() => setSaved(""), 2200);
    return () => window.clearTimeout(t);
  }, [saved]);

  async function change(user: string, perms: Perms) {
    const before = rows;
    setRows((cur) => cur?.map((r) => (r.user === user ? { ...r, perms } : r)) ?? cur);
    try {
      await savePerms(token, user, perms);
      setSaved(`Izin ${user} tersimpan.`);
    } catch (e) {
      setRows(before);
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl text-[color:var(--ui-text)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--ui-accent)]">Pengelola izin</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Izin akun pengurus</h2>
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-[color:var(--ui-muted)]">
            Atur apa yang boleh dilakukan setiap akun di {siteName}. Perubahan berlaku seketika. Akun ini hanya mengelola
            izin dan tidak membuka dasbor sertifikat maupun galeri.
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

      {error && (
        <p role="alert" className="mt-5 text-sm text-[#ed4956]">
          {error}
        </p>
      )}

      {rows === null ? (
        <p className="mt-10 text-sm text-[color:var(--ui-muted)]">Memuat…</p>
      ) : rows.length === 0 ? (
        <p className="mt-10 text-sm text-[color:var(--ui-muted)]">Belum ada akun pengurus (CERT_ACCOUNTS kosong).</p>
      ) : (
        <div className="mt-8 space-y-5">
          {rows.map((r) => (
            <AccountCard key={r.user} row={r} onChange={(p) => change(r.user, p)} />
          ))}
        </div>
      )}

      {saved && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg bg-[#262626] px-4 py-3 text-sm text-white shadow-lg"
        >
          {saved}
        </div>
      )}
    </div>
  );
}

function AccountCard({ row, onChange }: { row: AccountPerms; onChange: (p: Perms) => void }) {
  const p = row.perms;
  const set = (module: keyof Perms, level: Level) => onChange({ ...p, [module]: level });
  const initial = row.user.replace(/[^A-Za-z]/g, "").slice(0, 1).toUpperCase() || "?";

  return (
    <div className="rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-surface)]">
      <div className="flex items-center gap-3 border-b border-[color:var(--ui-line)] px-5 py-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--ui-surface-2)] font-bold">
          {initial}
        </span>
        <div className="min-w-0">
          <div className="truncate font-semibold">{row.user}</div>
          <div className="text-xs text-[color:var(--ui-muted)]">{roleName(row.role)}</div>
        </div>
      </div>
      <div className="grid gap-0 sm:grid-cols-2 sm:divide-x sm:divide-[color:var(--ui-line)]">
        <Module
          title="Admin medsos · Galeri"
          accessLabel="Boleh posting"
          accessHint="Membuat post dokumentasi baru"
          fullLabel="Juga boleh edit & hapus"
          fullHint="Mengubah keterangan dan menghapus post"
          level={p.gallery}
          onChange={(l) => set("gallery", l)}
        />
        <Module
          title="Admin sertifikat · Bendahara"
          accessLabel="Boleh terbitkan"
          accessHint="Menambah dan menerbitkan sertifikat baru"
          fullLabel="Juga boleh edit & hapus"
          fullHint="Mengubah dan menghapus sertifikat yang sudah terbit"
          level={p.cert}
          onChange={(l) => set("cert", l)}
        />
      </div>
    </div>
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
  const full = level === "full";
  return (
    <div className="border-t border-[color:var(--ui-line)] px-5 py-3 first:border-t-0 sm:border-t-0">
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ui-muted)]">{title}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
            level === "none"
              ? "bg-[color:var(--ui-surface-2)] text-[color:var(--ui-muted)]"
              : "bg-[color:var(--ui-accent)] text-[color:var(--ui-on-accent)]"
          }`}
        >
          {level === "none" ? "Tidak ada akses" : level === "post" ? "Posting saja" : "Penuh"}
        </span>
      </div>
      <div className="divide-y divide-[color:var(--ui-line)]">
        <Toggle
          label={accessLabel}
          hint={accessHint}
          checked={access}
          onChange={(v) => onChange(v ? "post" : "none")}
        />
        <Toggle
          label={fullLabel}
          hint={fullHint}
          checked={full}
          disabled={!access}
          onChange={(v) => onChange(v ? "full" : "post")}
        />
      </div>
    </div>
  );
}
