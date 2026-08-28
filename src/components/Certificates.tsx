"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { certificates, type Certificate } from "@/lib/content";
import { certDict } from "@/lib/certdict";
import { useApp } from "./Providers";

/* Every award is shown as its own certificate scan, always on screen. There is
   no toggle and no separate summary list: a claim and its proof are the same
   card, so the evidence cannot end up one interaction away from the assertion.
   Clicking a card opens the full-size scan. */
export function Certificates({ note, attrib }: { note: string; attrib: string }) {
  const { locale } = useApp();
  const cd = certDict(locale);
  const [active, setActive] = useState<Certificate | null>(null);
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c) => (
          <figure key={c.src} className="panel clip-corner overflow-hidden">
            <button
              type="button"
              onClick={() => setActive(c)}
              className="relative block aspect-[16/10] w-full overflow-hidden bg-[color:var(--surface-2)]"
              aria-label={`Perbesar sertifikat ${c.title}`}
            >
              <Image
                src={c.src}
                alt={`Sertifikat ${c.title}, ${c.event}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover duration-500 ease-crisp [transition-property:transform] hover:scale-[1.03]"
              />
            </button>
            <figcaption className="border-t border-[color:var(--border)] p-4">
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-sm font-bold uppercase text-[color:var(--text)]">{c.title}</span>
                <span className="shrink-0 font-mono text-[10px] text-[color:var(--faint)]">{c.date}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--muted)]">{c.event}</p>
              {c.ref && <p className="mt-1.5 font-mono text-[10px] text-[color:var(--faint)]">No. {c.ref}</p>}
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="mt-6 text-center font-mono text-[11px] leading-relaxed text-[color:var(--faint)]">
        {attrib} {note}
      </p>

      {/* Members collect their own certificates elsewhere. The link stays plain
          and unbranded: it is a service door for the fifteen people it concerns,
          not a call to action for everyone reading the achievements section. */}
      <div className="mt-8 flex flex-col items-center gap-2 border-t border-[color:var(--border)] pt-8">
        <Link
          href="/sertifikat"
          className="clip-corner inline-flex items-center gap-2 border border-[color:var(--border)] px-4 py-2.5 text-xs text-[color:var(--muted)] duration-200 ease-crisp [transition-property:border-color] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]"
        >
          {cd.entry.label}
          <span aria-hidden="true">&#8594;</span>
        </Link>
        <span className="text-[11px] text-[color:var(--faint)]">{cd.entry.hint}</span>
      </div>

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
              className="h-auto w-full rounded object-contain"
            />
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3 text-white/80">
              <span className="font-display text-sm font-bold uppercase">{active.title}</span>
              <span className="font-mono text-xs">{active.event} · {active.date}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Tutup"
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
