"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { certificates, type Certificate } from "@/lib/content";

/* Certificate vault. Collapsed by default, expands to every scan on file and
   opens each one full size. The count is derived from the data, so it is always
   the true number of documents held, never a claimed figure. */
export function Certificates() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Certificate | null>(null);
  const total = certificates.length;

  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close]);

  return (
    <div className="mt-12">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="cert-vault"
        className="glass clip-corner mx-auto flex w-full max-w-md items-center justify-between gap-4 px-5 py-4 text-left duration-200 [transition-property:border-color] hover:border-[color:var(--border)]"
      >
        <span>
          <span className="block font-display text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">
            Lihat sertifikat
          </span>
          <span className="mt-0.5 block text-xs text-[color:var(--faint)]">
            {total} dokumen asli tersimpan
          </span>
        </span>
        <span
          className={`shrink-0 text-crimson-glow duration-300 [transition-property:transform] ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div id="cert-vault" className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((c) => (
            <figure key={c.src} className="glass clip-corner overflow-hidden">
              <button
                type="button"
                onClick={() => setActive(c)}
                className="relative block aspect-[16/10] w-full overflow-hidden bg-black/40"
                aria-label={`Perbesar sertifikat ${c.title}`}
              >
                <Image
                  src={c.src}
                  alt={`Sertifikat ${c.title}, ${c.event}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover duration-500 [transition-property:transform] hover:scale-[1.03]"
                />
              </button>
              <figcaption className="border-t border-[color:var(--border)] p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-display text-sm font-bold uppercase text-[color:var(--text)]">{c.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-[color:var(--faint)]">{c.date}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--faint)]">{c.event}</p>
                {c.ref && <p className="mt-1.5 font-mono text-[10px] text-[color:var(--faint)]">No. {c.ref}</p>}
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Sertifikat ${active.title}`}
          onClick={close}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <div className="relative max-h-full w-full max-w-4xl overflow-auto" onClick={(e) => e.stopPropagation()}>
            <Image
              src={active.src}
              alt={`Sertifikat ${active.title}, ${active.event}`}
              width={1600}
              height={1000}
              className="h-auto w-full rounded-lg object-contain"
            />
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3 text-[color:var(--muted)]">
              <span className="font-display text-sm font-bold uppercase">{active.title}</span>
              <span className="font-mono text-xs">{active.event} · {active.date}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-[color:var(--border)] text-[color:var(--text)] hover:text-[color:var(--text)]"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
