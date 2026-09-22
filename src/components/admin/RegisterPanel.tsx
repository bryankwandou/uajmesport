"use client";
import { useEffect, useState, type FormEvent } from "react";
import { fetchRegister, saveRegister, type RegisterSetting } from "@/lib/adminclient";
import { announceRegisterUrl } from "@/lib/registerlink";

/* Segmen "Pendaftaran": mengganti link Google Form di balik setiap tombol
   "Daftar Anggota" di situs. Hanya tampil untuk akun yang diberi izin oleh
   pengelola izin; server memeriksa izin yang sama. */
export function RegisterPanel({
  token,
  fallback,
  onSignOut,
}: {
  token: string;
  fallback: string;
  onSignOut: () => void;
}) {
  const [data, setData] = useState<RegisterSetting | null>(null);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchRegister(token)
      .then((d) => {
        setData(d);
        setValue(d.url ?? fallback);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Gagal memuat."));
  }, [token, fallback]);

  async function save(url: string | null) {
    setBusy(true);
    setError("");
    try {
      const d = await saveRegister(token, url);
      setData(d);
      setValue(d.url ?? fallback);
      announceRegisterUrl(d.url);
      setSaved(url === null ? "Link dikembalikan ke bawaan." : "Link pendaftaran tersimpan. Situs langsung memakainya.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    save(value.trim());
  }

  const active = data?.url ?? fallback;

  return (
    <div className="mx-auto max-w-2xl text-[color:var(--ui-text)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--ui-accent)]">Pendaftaran</div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Link pendaftaran anggota</h2>
          <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-[color:var(--ui-muted)]">
            Link ini dipakai semua tombol “Daftar” di situs. Tempel link Google Form yang baru, lalu simpan — tanpa
            build ulang.
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

      <form onSubmit={submit} className="mt-8 rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-surface)] p-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[color:var(--ui-muted)]">Sedang dipakai</div>
        <a
          href={active}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all font-mono text-sm text-[color:var(--ui-accent)] underline-offset-2 hover:underline"
        >
          {active}
        </a>
        <p className="mt-1 text-[11px] text-[color:var(--ui-muted)]">
          {data?.url
            ? `Diubah oleh ${data.updatedBy || "pengurus"}${
                data.updatedAt ? ` · ${new Date(data.updatedAt).toLocaleString("id-ID")}` : ""
              }`
            : "Link bawaan situs"}
        </p>

        <label className="mt-6 block">
          <span className="mb-1 block text-xs text-[color:var(--ui-muted)]">Link baru</span>
          <input
            type="url"
            inputMode="url"
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://forms.gle/…"
            className="w-full rounded-lg border border-[color:var(--ui-line-strong)] bg-[color:var(--ui-surface)] px-3 py-2 font-mono text-sm outline-none focus:border-[color:var(--ui-accent)]"
          />
        </label>
        <p className="mt-1.5 text-[11px] text-[color:var(--ui-muted)]">
          Diterima: forms.gle, docs.google.com/forms, forms.office.com, chat.whatsapp.com, wa.me.
        </p>

        {error && (
          <p role="alert" className="mt-4 text-sm text-[#ed4956]">
            {error}
          </p>
        )}
        {saved && !error && (
          <p role="status" className="mt-4 text-sm text-[color:var(--ui-accent)]">
            {saved}
          </p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {data?.url && (
            <button
              type="button"
              disabled={busy}
              onClick={() => save(null)}
              className="rounded-lg border border-[color:var(--ui-line-strong)] px-4 py-2 text-xs font-medium disabled:opacity-40"
            >
              Kembalikan ke bawaan
            </button>
          )}
          <button
            type="submit"
            disabled={busy || !value.trim() || value.trim() === active}
            className="rounded-lg bg-[color:var(--ui-accent)] px-4 py-2 text-xs font-semibold text-[color:var(--ui-on-accent)] disabled:opacity-40"
          >
            {busy ? "Menyimpan…" : "Simpan link"}
          </button>
        </div>
      </form>
    </div>
  );
}
