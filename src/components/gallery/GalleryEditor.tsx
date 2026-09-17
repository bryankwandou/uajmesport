"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PostViewer } from "./PostViewer";
import { Tile } from "./GalleryFeed";
import { Segments } from "@/components/ui/Segments";
import { can, type Perms } from "@/lib/adminclient";
import {
  adminPosts,
  deletePost,
  GALLERY_CATEGORIES,
  MAX_PHOTOS,
  prepareImage,
  sharePost,
  updatePost,
  type GalleryCategory,
  type GalleryPost,
} from "@/lib/gallery";

/* Editor galeri di dasbor, meniru alur Instagram:
 *   profil (grid post) → "+" → pilih foto → potong → keterangan → Bagikan.
 * Ketuk post untuk membukanya; menu ⋯ berisi Edit dan Hapus bila akun ini
 * punya izin penuh. Akun "posting saja" hanya melihat tombol "+". */

type Brand = { name: string; handle: string; avatar: React.ReactNode };

export function GalleryEditor({
  token,
  perms,
  brand,
  onSignOut,
}: {
  token: string;
  perms: Perms;
  brand: Brand;
  onSignOut: () => void;
}) {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const [editing, setEditing] = useState<GalleryPost | null>(null);
  const [toast, setToast] = useState("");
  const full = can(perms, "gallery", "full");

  const reload = useCallback(async () => {
    try {
      setPosts(await adminPosts(token));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Galeri gagal dimuat.");
    } finally {
      setLoaded(true);
    }
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  async function remove(p: GalleryPost) {
    if (!window.confirm("Hapus post ini? Foto dan keterangannya hilang dari galeri.")) return;
    try {
      await deletePost(token, p.id);
      setViewing(null);
      setToast("Post dihapus.");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Post gagal dihapus.");
    }
  }

  const published = posts.filter((p) => p.images > 0);
  const current = viewing !== null ? published[viewing] : null;
  const drafts = posts.filter((p) => p.images === 0);

  return (
    <div className="mx-auto max-w-3xl">
      {/* kepala profil */}
      <div className="flex items-center gap-5 sm:gap-8">
        <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full p-[3px] sm:h-24 sm:w-24 [background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)]">
          <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-[color:var(--ui-surface)] p-2">
            {brand.avatar}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="truncate text-lg font-semibold text-[color:var(--ui-text)]">{brand.handle}</h2>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="rounded-lg bg-[#0095f6] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1877f2]"
            >
              + Post baru
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-lg bg-[color:var(--ui-surface-2)] px-4 py-1.5 text-sm font-semibold text-[color:var(--ui-text)] hover:opacity-80"
            >
              Keluar
            </button>
          </div>
          <div className="mt-3 flex gap-6 text-sm text-[color:var(--ui-text)]">
            <span>
              <b>{published.length}</b> postingan
            </span>
            <span className="text-[color:var(--ui-muted)]">
              {full ? "Izin: posting, edit & hapus" : "Izin: posting saja"}
            </span>
          </div>
          <p className="mt-1 text-sm text-[color:var(--ui-text)]">{brand.name} · Galeri dokumentasi</p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-lg border border-[#ed4956]/40 px-4 py-3 text-sm text-[#ed4956]">
          {error}
        </p>
      )}

      <div className="mt-8 border-t border-[color:var(--ui-line)]">
        <div className="flex justify-center">
          <span className="-mt-px flex items-center gap-1.5 border-t border-[color:var(--ui-text)] py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-[color:var(--ui-text)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <rect x="3" y="3" width="18" height="18" />
              <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
            </svg>
            Postingan
          </span>
        </div>

        {!loaded ? (
          <p className="py-16 text-center text-sm text-[color:var(--ui-muted)]">Memuat…</p>
        ) : published.length === 0 ? (
          <div className="py-16 text-center">
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-[color:var(--ui-text)] text-3xl text-[color:var(--ui-text)]"
              aria-label="Buat post pertama"
            >
              +
            </button>
            <h3 className="mt-4 text-2xl font-extrabold text-[color:var(--ui-text)]">Bagikan foto</h3>
            <p className="mt-2 text-sm text-[color:var(--ui-muted)]">
              Foto yang Anda bagikan akan tampil di galeri halaman depan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {published.map((p, i) => (
              <Tile key={p.id} post={p} onOpen={() => setViewing(i)} />
            ))}
          </div>
        )}

        {full && drafts.length > 0 && (
          <div className="mt-6 rounded-lg border border-[color:var(--ui-line)] p-4">
            <p className="text-xs text-[color:var(--ui-muted)]">
              {drafts.length} unggahan tidak selesai (koneksi terputus). Tidak tampil di galeri.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {drafts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => remove(p)}
                  className="rounded-md border border-[color:var(--ui-line)] px-2.5 py-1 text-[11px] text-[#ed4956]"
                >
                  Hapus “{p.caption.slice(0, 24) || "tanpa keterangan"}”
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {current && viewing !== null && (
        <PostViewer
          post={current}
          brand={{ name: brand.handle, avatar: brand.avatar }}
          onClose={() => setViewing(null)}
          onPrev={viewing > 0 ? () => setViewing(viewing - 1) : undefined}
          onNext={viewing < published.length - 1 ? () => setViewing(viewing + 1) : undefined}
          actions={
            full
              ? [
                  { label: "Hapus", danger: true, onClick: () => remove(current) },
                  {
                    label: "Edit",
                    onClick: () => {
                      setEditing(current);
                      setViewing(null);
                    },
                  },
                  { label: "Batal", onClick: () => {} },
                ]
              : undefined
          }
        />
      )}

      {creating && (
        <Composer
          token={token}
          brand={brand}
          onClose={() => setCreating(false)}
          onShared={async () => {
            setToast("Postingan Anda telah dibagikan.");
            await reload();
          }}
        />
      )}

      {editing && (
        <EditInfo
          post={editing}
          brand={brand}
          onClose={() => setEditing(null)}
          onSave={async (meta) => {
            await updatePost(token, editing.id, meta);
            setEditing(null);
            setToast("Perubahan disimpan.");
            await reload();
          }}
        />
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

/* ── pembuat post ───────────────────────────────────────────────────────── */
type Picked = { file: File; url: string };
type Step = "pick" | "crop" | "caption" | "sharing" | "done";

function todayIso() {
  const d = new Date(Date.now() + 8 * 3600e3);
  return d.toISOString().slice(0, 10);
}

function Composer({
  token,
  brand,
  onClose,
  onShared,
}: {
  token: string;
  brand: Brand;
  onClose: () => void;
  onShared: () => void;
}) {
  const [step, setStep] = useState<Step>("pick");
  const [picked, setPicked] = useState<Picked[]>([]);
  const [active, setActive] = useState(0);
  const [square, setSquare] = useState(true);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("kegiatan");
  const [takenAt, setTakenAt] = useState(todayIso());
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // URL pratinjau dilepas saat modal ditutup; yang dihapus satu-satu dilepas di removeAt.
  const urls = useRef<string[]>([]);
  useEffect(() => {
    urls.current = picked.map((p) => p.url);
  }, [picked]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function add(files: FileList | File[] | null) {
    if (!files) return;
    const imgs = Array.from(files).filter((f) => /^image\/(jpeg|png|webp|heic|heif)$/i.test(f.type) || /\.(jpe?g|png|webp)$/i.test(f.name));
    if (imgs.length === 0) {
      setError("Pilih file foto (JPG, PNG atau WEBP).");
      return;
    }
    setError("");
    setPicked((cur) => {
      const room = MAX_PHOTOS - cur.length;
      const next = [...cur, ...imgs.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))];
      if (imgs.length > room) setError(`Maksimal ${MAX_PHOTOS} foto per post.`);
      return next;
    });
    setStep("crop");
  }

  function removeAt(i: number) {
    setPicked((cur) => {
      if (cur[i]) URL.revokeObjectURL(cur[i].url);
      const next = cur.filter((_, j) => j !== i);
      if (next.length === 0) setStep("pick");
      setActive((a) => Math.min(a, Math.max(0, next.length - 1)));
      return next;
    });
  }

  function back() {
    if (step === "caption") setStep("crop");
    else if (step === "crop") {
      if (window.confirm("Buang postingan? Foto yang dipilih akan dibatalkan.")) {
        picked.forEach((p) => URL.revokeObjectURL(p.url));
        setPicked([]);
        setStep("pick");
      }
    }
  }

  async function share() {
    setError("");
    setStep("sharing");
    setProgress({ done: 0, total: picked.length });
    try {
      const prepared = [];
      for (const p of picked) prepared.push(await prepareImage(p.file, square));
      await sharePost(token, { caption: caption.trim(), category, takenAt }, prepared, (done, total) =>
        setProgress({ done, total }),
      );
      setStep("done");
      onShared();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membagikan.");
      setStep("caption");
    }
  }

  const title =
    step === "pick" ? "Buat postingan baru" : step === "crop" ? "Potong" : step === "caption" ? "Buat postingan baru" : step === "sharing" ? "Membagikan" : "Postingan dibagikan";
  const shown = picked[active];
  const wide = step === "caption";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-0 sm:p-6"
      onClick={() => (step === "pick" || step === "done" ? onClose() : undefined)}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        disabled={step === "sharing"}
        className="absolute right-3 top-3 hidden h-10 w-10 place-items-center text-white sm:grid"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className={`flex h-full w-full flex-col overflow-hidden bg-[color:var(--ui-surface)] text-[color:var(--ui-text)] transition-[max-width] duration-300 sm:h-auto sm:rounded-xl ${
          wide ? "sm:max-w-[860px]" : "sm:max-w-[520px]"
        }`}
      >
        {/* bilah atas */}
        <div className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[color:var(--ui-line)] px-2">
          <div>
            {(step === "crop" || step === "caption") && (
              <button type="button" onClick={back} aria-label="Kembali" className="grid h-9 w-9 place-items-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12H4M10 6l-6 6 6 6" />
                </svg>
              </button>
            )}
            {(step === "pick" || step === "done") && (
              <button type="button" onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 place-items-center sm:hidden">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
          <h3 className="text-center text-base font-semibold">{title}</h3>
          <div className="text-right">
            {step === "crop" && (
              <button type="button" onClick={() => setStep("caption")} className="px-2 text-sm font-semibold text-[#0095f6] hover:text-[#00376b]">
                Berikutnya
              </button>
            )}
            {step === "caption" && (
              <button type="button" onClick={share} className="px-2 text-sm font-semibold text-[#0095f6] hover:text-[#00376b]">
                Bagikan
              </button>
            )}
          </div>
        </div>

        {/* isi */}
        {step === "pick" && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              add(e.dataTransfer.files);
            }}
            className={`flex aspect-square max-h-[70vh] w-full flex-1 flex-col items-center justify-center gap-4 p-8 text-center sm:flex-none ${
              drag ? "bg-[color:var(--ui-surface-2)]" : ""
            }`}
          >
            <svg width="96" height="77" viewBox="0 0 97.6 77.3" fill="currentColor" aria-hidden="true">
              <path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" />
              <path d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z" />
              <path d="M78.2 41.6 61.3 30.5c-2.1-1.4-4.9-.8-6.2 1.3-.4.7-.7 1.4-.7 2.2l-1.2 20.1c-.1 2.5 1.7 4.6 4.2 4.8h.3c.7 0 1.4-.2 2-.5l18-9c2.2-1.1 3.1-3.8 2-6-.4-.7-.9-1.3-1.5-1.8zm-1.4 6-18 9c-.4.2-.8.3-1.3.3-.4 0-.9-.2-1.2-.4-.7-.5-1.2-1.3-1.1-2.2l1.2-20.1c.1-.9.6-1.7 1.4-2.1.8-.4 1.7-.3 2.5.1L77 43.3c1.2.8 1.5 2.3.7 3.4-.2.4-.5.7-.9.9z" />
            </svg>
            <p className="text-xl font-light">Seret foto ke sini</p>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="rounded-lg bg-[#0095f6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1877f2]"
            >
              Pilih dari galeri
            </button>
            <p className="text-[11px] text-[color:var(--ui-muted)]">Hingga {MAX_PHOTOS} foto · JPG, PNG, WEBP</p>
            {error && <p className="text-xs text-[#ed4956]">{error}</p>}
          </div>
        )}

        {(step === "crop" || step === "caption") && shown && (
          <div className={`flex min-h-0 flex-1 flex-col ${wide ? "md:flex-row" : ""}`}>
            <div className={`relative w-full bg-black ${wide ? "md:basis-[60%]" : ""}`}>
              <div className="relative mx-auto aspect-square max-h-[62vh] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shown.url}
                  alt={`Foto ${active + 1}`}
                  className={`h-full w-full ${square ? "object-cover" : "object-contain"}`}
                />
                {square && step === "crop" && (
                  <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }, (_, i) => (
                      <span key={i} className="border border-white/25" />
                    ))}
                  </div>
                )}
                {active > 0 && (
                  <button
                    type="button"
                    aria-label="Foto sebelumnya"
                    onClick={() => setActive(active - 1)}
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"
                  >
                    ‹
                  </button>
                )}
                {active < picked.length - 1 && (
                  <button
                    type="button"
                    aria-label="Foto berikutnya"
                    onClick={() => setActive(active + 1)}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"
                  >
                    ›
                  </button>
                )}
                {step === "crop" && (
                  <button
                    type="button"
                    onClick={() => setSquare((v) => !v)}
                    aria-label={square ? "Pakai rasio asli" : "Potong 1:1"}
                    title={square ? "Rasio asli" : "Potong 1:1"}
                    className="absolute bottom-3 left-3 grid h-8 min-w-8 place-items-center rounded-full bg-black/70 px-2.5 text-[11px] font-semibold text-white"
                  >
                    {square ? "1:1" : "Asli"}
                  </button>
                )}
                {picked.length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                    {picked.map((p, i) => (
                      <span key={p.url} className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-[#0095f6]" : "bg-white/50"}`} />
                    ))}
                  </div>
                )}
              </div>
              {step === "crop" && (
                <div className="flex gap-2 overflow-x-auto bg-black/85 p-3">
                  {picked.map((p, i) => (
                    <div key={p.url} className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        className={`block h-16 w-16 overflow-hidden ${i === active ? "ring-2 ring-white" : "opacity-60"}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt="" className="h-full w-full object-cover" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus foto ${i + 1}`}
                        onClick={() => removeAt(i)}
                        className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black text-[11px] text-white ring-1 ring-white/40"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {picked.length < MAX_PHOTOS && (
                    <button
                      type="button"
                      aria-label="Tambah foto"
                      onClick={() => input.current?.click()}
                      className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-white/40 text-2xl text-white"
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>

            {step === "caption" && (
              <div className="flex min-h-0 flex-col border-[color:var(--ui-line)] md:basis-[40%] md:border-l">
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full ring-1 ring-[color:var(--ui-line)]">
                    {brand.avatar}
                  </span>
                  <span className="text-sm font-semibold">{brand.handle}</span>
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
                  placeholder="Tulis keterangan..."
                  rows={7}
                  autoFocus
                  className="w-full resize-none bg-transparent px-4 text-[15px] leading-relaxed outline-none focus-visible:outline-none placeholder:text-[color:var(--ui-muted)]"
                />
                <div className="px-4 pb-2 text-right text-[11px] text-[color:var(--ui-muted)]">{caption.length}/2.200</div>
                <div className="border-t border-[color:var(--ui-line)] px-4 py-3">
                  <div className="text-sm">Kategori</div>
                  <Segments
                    items={GALLERY_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
                    value={category}
                    onChange={setCategory}
                    label="Kategori"
                    className="mt-1"
                  />
                </div>
                <label className="flex items-center justify-between gap-3 border-t border-[color:var(--ui-line)] px-4 py-3 text-sm">
                  Tanggal kegiatan
                  <input
                    type="date"
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                    className="rounded-md border border-[color:var(--ui-line)] bg-transparent px-2 py-1 text-sm"
                  />
                </label>
                {error && <p className="px-4 pb-3 text-xs text-[#ed4956]">{error}</p>}
                <div className="mt-auto border-t border-[color:var(--ui-line)] p-4 md:hidden">
                  <button
                    type="button"
                    onClick={share}
                    className="w-full rounded-lg bg-[#0095f6] py-2.5 text-sm font-semibold text-white"
                  >
                    Bagikan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {(step === "sharing" || step === "done") && (
          <div className="flex aspect-square max-h-[70vh] w-full flex-1 flex-col items-center justify-center gap-4 p-8 text-center sm:flex-none">
            {step === "sharing" ? (
              <>
                <span
                  className="h-24 w-24 animate-spin rounded-full p-[3px] [background:conic-gradient(#f9ce34,#ee2a7b,#6228d7,#f9ce34)]"
                  aria-hidden="true"
                >
                  <span className="block h-full w-full rounded-full bg-[color:var(--ui-surface)]" />
                </span>
                <p className="text-sm text-[color:var(--ui-muted)]">
                  Membagikan… {progress.done}/{progress.total} foto
                </p>
              </>
            ) : (
              <>
                <span className="grid h-24 w-24 place-items-center rounded-full [background:linear-gradient(45deg,#f9ce34,#ee2a7b,#6228d7)]">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                <p className="text-xl font-light">Postingan Anda telah dibagikan.</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg bg-[#0095f6] px-4 py-2 text-sm font-semibold text-white"
                >
                  Selesai
                </button>
              </>
            )}
          </div>
        )}

        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

/* ── edit info ──────────────────────────────────────────────────────────── */
function EditInfo({
  post,
  brand,
  onClose,
  onSave,
}: {
  post: GalleryPost;
  brand: Brand;
  onClose: () => void;
  onSave: (meta: { caption: string; category: GalleryCategory; takenAt: string }) => Promise<void>;
}) {
  const [caption, setCaption] = useState(post.caption);
  const [category, setCategory] = useState<GalleryCategory>(post.category);
  const [takenAt, setTakenAt] = useState(post.takenAt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function done() {
    setBusy(true);
    setError("");
    try {
      await onSave({ caption: caption.trim(), category, takenAt });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan.");
      setBusy(false);
    }
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Edit info" className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-0 sm:p-6">
      <div className="flex h-full w-full flex-col overflow-hidden bg-[color:var(--ui-surface)] text-[color:var(--ui-text)] sm:h-auto sm:max-w-[520px] sm:rounded-xl">
        <div className="grid h-12 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[color:var(--ui-line)] px-2">
          <button type="button" onClick={onClose} className="text-left text-sm px-2">
            Batal
          </button>
          <h3 className="text-center text-base font-semibold">Edit info</h3>
          <button
            type="button"
            onClick={done}
            disabled={busy}
            className="px-2 text-right text-sm font-semibold text-[#0095f6] disabled:opacity-50"
          >
            {busy ? "…" : "Selesai"}
          </button>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full ring-1 ring-[color:var(--ui-line)]">{brand.avatar}</span>
          <span className="text-sm font-semibold">{brand.handle}</span>
        </div>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
          rows={6}
          autoFocus
          className="w-full resize-none bg-transparent px-4 text-[15px] leading-relaxed outline-none focus-visible:outline-none"
        />
        <div className="border-t border-[color:var(--ui-line)] px-4 py-3">
          <div className="text-sm">Kategori</div>
          <Segments
            items={GALLERY_CATEGORIES.map((c) => ({ id: c.id, label: c.label }))}
            value={category}
            onChange={setCategory}
            label="Kategori"
            className="mt-1"
          />
        </div>
        <label className="flex items-center justify-between gap-3 border-t border-[color:var(--ui-line)] px-4 py-3 text-sm">
          Tanggal kegiatan
          <input
            type="date"
            value={takenAt}
            onChange={(e) => setTakenAt(e.target.value)}
            className="rounded-md border border-[color:var(--ui-line)] bg-transparent px-2 py-1 text-sm"
          />
        </label>
        {error && <p className="px-4 pb-3 text-xs text-[#ed4956]">{error}</p>}
      </div>
    </div>
  );
}
