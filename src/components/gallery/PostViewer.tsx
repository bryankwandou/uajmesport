"use client";
import { useEffect, useRef, useState } from "react";
import { categoryLabel, formatDate, imageUrl, type GalleryPost } from "@/lib/gallery";

/* Tampilan satu post seperti membuka foto di Instagram: foto di kiri (geser
   untuk carousel), keterangan di kanan. Di layar sempit keduanya bertumpuk.
   `actions` hanya diisi dasbor, untuk menu ⋯ Edit / Hapus. */
export function PostViewer({
  post,
  brand,
  onClose,
  onPrev,
  onNext,
  actions,
}: {
  post: GalleryPost;
  brand: { name: string; avatar: React.ReactNode };
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  actions?: { label: string; danger?: boolean; onClick: () => void }[];
}) {
  const [slide, setSlide] = useState(0);
  const [menu, setMenu] = useState(false);
  const touch = useRef<number | null>(null);
  const count = Math.max(1, post.images);

  useEffect(() => setSlide(0), [post.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        if (slide < count - 1) setSlide((s) => s + 1);
        else onNext?.();
      }
      if (e.key === "ArrowLeft") {
        if (slide > 0) setSlide((s) => s - 1);
        else onPrev?.();
      }
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose, onNext, onPrev, slide, count]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.caption.slice(0, 60) || "Foto dokumentasi"}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup"
        className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full text-white/90 hover:bg-white/10"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      {onPrev && (
        <button
          type="button"
          aria-label="Post sebelumnya"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow md:grid"
        >
          ‹
        </button>
      )}
      {onNext && (
        <button
          type="button"
          aria-label="Post berikutnya"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-black shadow md:grid"
        >
          ›
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-[color:var(--ui-surface)] sm:h-auto sm:max-h-[90vh] sm:rounded-lg md:flex-row"
      >
        {/* foto */}
        <div
          className="relative flex min-h-0 flex-1 items-center justify-center bg-black md:aspect-square md:max-h-[90vh] md:flex-none md:basis-[60%]"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current === null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (dx < -40 && slide < count - 1) setSlide(slide + 1);
            if (dx > 40 && slide > 0) setSlide(slide - 1);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={`${post.id}-${slide}`}
            src={imageUrl(post.id, slide)}
            alt={post.caption.slice(0, 120) || "Foto dokumentasi"}
            className="max-h-[60vh] w-full object-contain md:max-h-full md:h-full"
          />
          {slide > 0 && (
            <button
              type="button"
              aria-label="Foto sebelumnya"
              onClick={() => setSlide(slide - 1)}
              className="absolute left-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-sm text-black shadow"
            >
              ‹
            </button>
          )}
          {slide < count - 1 && (
            <button
              type="button"
              aria-label="Foto berikutnya"
              onClick={() => setSlide(slide + 1)}
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-sm text-black shadow"
            >
              ›
            </button>
          )}
          {count > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
              {Array.from({ length: count }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === slide ? "bg-white" : "bg-white/40"}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* keterangan */}
        <div className="flex min-h-0 flex-col md:basis-[40%]">
          <div className="flex items-center gap-3 border-b border-[color:var(--ui-line)] px-4 py-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full ring-1 ring-[color:var(--ui-line)]">
              {brand.avatar}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[color:var(--ui-text)]">{brand.name}</span>
            {actions && actions.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  aria-label="Opsi post"
                  aria-expanded={menu}
                  onClick={() => setMenu((v) => !v)}
                  className="grid h-8 w-8 place-items-center rounded-full text-lg text-[color:var(--ui-text)] hover:bg-[color:var(--ui-surface-2)]"
                >
                  ⋯
                </button>
                {menu && (
                  <div className="absolute right-0 top-9 z-10 w-44 overflow-hidden rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-surface)] shadow-xl">
                    {actions.map((a) => (
                      <button
                        key={a.label}
                        type="button"
                        onClick={() => {
                          setMenu(false);
                          a.onClick();
                        }}
                        className={`block w-full border-b border-[color:var(--ui-line)] px-4 py-3 text-center text-sm last:border-b-0 hover:bg-[color:var(--ui-surface-2)] ${
                          a.danger ? "font-semibold text-[#ed4956]" : "text-[color:var(--ui-text)]"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {post.caption ? (
              <p className="whitespace-pre-line break-words text-sm leading-relaxed text-[color:var(--ui-text)]">
                <span className="mr-1.5 font-semibold">{brand.name}</span>
                {post.caption}
              </p>
            ) : (
              <p className="text-sm text-[color:var(--ui-muted)]">Tanpa keterangan.</p>
            )}
          </div>
          <div className="border-t border-[color:var(--ui-line)] px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-[color:var(--ui-line)] px-2.5 py-0.5 text-[11px] text-[color:var(--ui-muted)]">
                {categoryLabel(post.category)}
              </span>
              <time className="text-[11px] uppercase tracking-wide text-[color:var(--ui-muted)]">{formatDate(post)}</time>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
