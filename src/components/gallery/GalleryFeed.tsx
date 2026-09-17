"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Segments } from "@/components/ui/Segments";
import { PostViewer } from "./PostViewer";
import {
  GALLERY_CATEGORIES,
  imageUrl,
  publicPosts,
  type GalleryCategory,
  type GalleryPost,
} from "@/lib/gallery";

/* Galeri dokumentasi di halaman depan, bergaya grid profil Instagram.
 *
 * Tertutup, grid hanya menampilkan satu baris penuh ditambah intipan baris
 * kedua. Gradasi hanya duduk di atas intipan itu — posisinya dimulai tepat
 * di bawah baris pertama — jadi foto baris pertama tidak pernah ikut pudar.
 * Tombol "Lihat lebih banyak" membuka sisanya dengan transisi tinggi.
 */
type Tab = "semua" | GalleryCategory;
const PAGE_ROWS = 4;

export function GalleryFeed({
  brand,
  labels = {},
}: {
  brand: { name: string; avatar: React.ReactNode };
  labels?: Partial<{ all: string; more: string; less: string; empty: string; loading: string }>;
}) {
  const L = {
    all: "Semua",
    more: "Lihat lebih banyak",
    less: "Tutup",
    empty: "Belum ada dokumentasi di kategori ini.",
    loading: "Memuat galeri…",
    ...labels,
  };
  const [posts, setPosts] = useState<GalleryPost[] | null>(null);
  const [tab, setTab] = useState<Tab>("semua");
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState(PAGE_ROWS);
  const [viewing, setViewing] = useState<number | null>(null);
  const [cols, setCols] = useState(3);
  const [rowH, setRowH] = useState(0);
  const [fullH, setFullH] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    publicPosts().then(setPosts);
  }, []);

  const shownAll = useMemo(
    () => (posts ?? []).filter((p) => tab === "semua" || p.category === tab),
    [posts, tab],
  );
  const visible = open ? shownAll.slice(0, rows * cols) : shownAll.slice(0, cols * 2);
  const collapsible = shownAll.length > cols;

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const measure = () => {
      const tracks = getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length;
      setCols(tracks || 3);
      const first = grid.firstElementChild as HTMLElement | null;
      setRowH(first ? first.offsetHeight : 0);
      setFullH(grid.scrollHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [visible.length, open]);

  const gap = 4;
  const peek = Math.round(rowH * 0.42);
  const collapsedH = rowH + gap + peek;
  const height = !collapsible ? undefined : open ? fullH : collapsedH;

  const changeTab = useCallback((t: Tab) => {
    setTab(t);
    setOpen(false);
    setRows(PAGE_ROWS);
  }, []);

  const tabs = [
    { id: "semua" as Tab, label: L.all, count: posts?.length },
    ...GALLERY_CATEGORIES.map((c) => ({
      id: c.id as Tab,
      label: c.label,
      count: posts?.filter((p) => p.category === c.id).length,
    })),
  ];

  const current = viewing !== null ? shownAll[viewing] : null;

  return (
    <div className="mt-10">
      <Segments items={tabs} value={tab} onChange={changeTab} label="Kategori galeri" className="[justify-content:safe_center]" />

      <div className="mt-5">
        {posts === null ? (
          <div className="grid grid-cols-3 gap-1 md:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square animate-pulse bg-[color:var(--ui-surface-2)] ${i === 3 ? "hidden md:block" : ""}`}
              />
            ))}
            <span className="sr-only">{L.loading}</span>
          </div>
        ) : shownAll.length === 0 ? (
          <p className="py-10 text-center text-sm text-[color:var(--ui-muted)]">{L.empty}</p>
        ) : (
          <div className="relative">
            <div
              className="overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.2,0.7,0.3,1)]"
              style={{ height }}
            >
              <div ref={gridRef} className="grid grid-cols-3 gap-1 md:grid-cols-4">
                {visible.map((p, i) => (
                  <Tile key={p.id} post={p} onOpen={() => setViewing(i)} eager={i < cols} />
                ))}
              </div>
            </div>

            {collapsible && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-x-0 transition-opacity duration-300 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
                style={{
                  top: rowH + gap,
                  height: peek,
                  background: "linear-gradient(to bottom, color-mix(in srgb, var(--ui-fade) 35%, transparent), var(--ui-fade) 92%)",
                }}
              />
            )}

            {collapsible && (
              <div className="relative mt-3 flex justify-center gap-3">
                {open && shownAll.length > visible.length && (
                  <button
                    type="button"
                    onClick={() => setRows((r) => r + PAGE_ROWS)}
                    className="rounded-full border border-[color:var(--ui-line-strong)] bg-[color:var(--ui-surface)] px-5 py-2 text-xs font-semibold text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-2)]"
                  >
                    {L.more} ({shownAll.length - visible.length})
                  </button>
                )}
                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => {
                    setOpen((v) => !v);
                    setRows(PAGE_ROWS);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--ui-line-strong)] bg-[color:var(--ui-surface)] px-5 py-2 text-xs font-semibold text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-2)]"
                >
                  {open ? L.less : `${L.more} · ${shownAll.length}`}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {current && viewing !== null && (
        <PostViewer
          post={current}
          brand={brand}
          onClose={() => setViewing(null)}
          onPrev={viewing > 0 ? () => setViewing(viewing - 1) : undefined}
          onNext={viewing < shownAll.length - 1 ? () => setViewing(viewing + 1) : undefined}
        />
      )}
    </div>
  );
}

export function Tile({
  post,
  onOpen,
  eager,
  badge,
}: {
  post: GalleryPost;
  onOpen: () => void;
  eager?: boolean;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block aspect-square overflow-hidden bg-[color:var(--ui-surface-2)]"
      aria-label={post.caption.slice(0, 80) || "Buka foto dokumentasi"}
    >
      {post.images > 0 && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl(post.id, 0)}
          alt=""
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      )}
      {post.images > 1 && (
        <span className="absolute right-2 top-2 text-white drop-shadow" aria-label={`${post.images} foto`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 3h11a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-5 5h1v12a1 1 0 0 0 1 1h12v1a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V9a1 1 0 0 1 1-1z" />
          </svg>
        </span>
      )}
      {badge && (
        <span className="absolute inset-x-0 bottom-0 bg-black/60 px-2 py-1 text-[10px] text-white">{badge}</span>
      )}
      <span className="absolute inset-0 flex items-end bg-black/0 p-2 text-left opacity-0 transition duration-200 group-hover:bg-black/35 group-hover:opacity-100">
        <span className="line-clamp-2 text-[11px] leading-snug text-white">{post.caption}</span>
      </span>
    </button>
  );
}
