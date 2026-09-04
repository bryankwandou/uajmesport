"use client";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { Controls } from "./Controls";
import { useApp } from "./Providers";
import { links } from "@/lib/content";
import { marsDict } from "@/lib/marsdict";

/* Jarak antar-tautan. Dipakai baris asli dan penggarisnya sekaligus, supaya
   yang diukur tidak pernah berbeda dari yang ditampilkan. */
const LINK_GAP = "gap-4";

export function Nav() {
  const { t, locale } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /* Hamburger hilang tepat ketika seluruh label muat utuh, bukan pada lebar
     yang ditebak lebih dulu. Breakpoint tetap salah dua arah: xl menyembunyikan
     menu di 1142-1279px yang sebenarnya cukup, sedangkan label yang suatu saat
     diperpanjang akan menabrak lagi tanpa ada yang memberi tahu.

     `fits` null berarti belum terukur: markup server memakai tebakan CSS agar
     lebar besar tidak berkedip lebih dulu, lalu hasil ukur mengambil alih. */
  const [fits, setFits] = useState<boolean | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | null>(null);
  const rightRef = useRef<HTMLDivElement | null>(null);
  const rulerRef = useRef<HTMLDivElement | null>(null);

  const items = [
    { href: "#tentang", label: t.nav.about },
    { href: "#prestasi", label: t.nav.achievements },
    { href: "#komunitas", label: t.nav.community },
    { href: "#pengurus", label: t.nav.officers },
    { href: "#legalitas", label: t.nav.legal },
    { href: "#kontak", label: t.nav.contact },
    // Halaman lagu resmi. Rutenya sendiri, jadi membukanya tidak membebani
    // beranda; ditaruh sejajar dengan menu lain supaya mudah ditemukan.
    { href: "/mars", label: marsDict(locale).entry.label },
    { href: "/deck.html", label: t.nav.deck },
  ];

  /* Penggaris di bawah mengukur lebar alami seluruh label. Ia dipakai
     ketimbang baris aslinya karena baris asli ikut disembunyikan saat tidak
     muat, dan sesuatu yang display:none tidak punya lebar untuk dibaca --
     pengukurannya akan macet pada keputusan pertama. */
  useEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const logo = logoRef.current;
      const right = rightRef.current;
      const ruler = rulerRef.current;
      if (!nav || !logo || !right || !ruler) return;
      const cs = getComputedStyle(nav);
      const inner = nav.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const gap = parseFloat(cs.columnGap) || 0;
      const need = logo.offsetWidth + ruler.offsetWidth + right.offsetWidth + gap * 2;
      // Lantai desktop: di bawah ini hamburger tetap, sekalipun aritmetikanya lolos.
      setFits(window.innerWidth >= 1024 && need <= inner);
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (navRef.current) ro.observe(navRef.current);
    // Label menyusut atau melebar begitu webfont menggantikan font sementara.
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [locale]);

  // Panel tidak boleh tertinggal terbuka di belakang bilah yang sudah utuh.
  useEffect(() => {
    if (fits) setOpen(false);
  }, [fits]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 duration-300 ease-crisp [transition-property:opacity] ${
        scrolled || open
          ? "border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav ref={navRef} className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <a ref={logoRef} href="#top" aria-label="UKM E-Sport UAJM" className="shrink-0">
          <Logo />
        </a>

        <div
          className={`shrink-0 items-center ${LINK_GAP} ${
            fits === null ? "hidden xl:flex" : fits ? "flex" : "hidden"
          }`}
        >
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="whitespace-nowrap text-xs text-[color:var(--muted)] duration-200 ease-crisp [transition-property:opacity] hover:text-[color:var(--text)]"
            >
              {i.label}
            </a>
          ))}
        </div>

        <div ref={rightRef} className="flex shrink-0 items-center gap-2">
          <Controls />
          <a
            href={links.register}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary clip-corner hidden px-4 py-2 text-xs sm:inline-block"
          >
            {t.nav.register}
          </a>
          <button
            className={`grid h-[30px] w-[30px] place-items-center rounded border border-[color:var(--border)] text-[color:var(--muted)] ${
              fits === null ? "xl:hidden" : fits ? "hidden" : ""
            }`}
            onClick={() => setOpen((v) => !v)}
            aria-label={t.nav.menu}
            aria-expanded={open}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {/* Penggaris: salinan label yang tidak pernah terlihat, tidak pernah
          bisa difokus, dan tidak menempati aliran layout. Ia satu-satunya yang
          selalu punya lebar untuk dibaca. */}
      <div
        ref={rulerRef}
        aria-hidden="true"
        className={`pointer-events-none invisible absolute left-0 top-0 flex items-center ${LINK_GAP}`}
      >
        {items.map((i) => (
          <span key={i.href} className="whitespace-nowrap text-xs">
            {i.label}
          </span>
        ))}
      </div>

      {open && !fits && (
        <div className="border-t border-[color:var(--border)] bg-[color:var(--bg)] px-5 py-4">
          <div className="flex flex-col gap-3.5">
            {items.map((i) => (
              <a
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="text-sm text-[color:var(--muted)] duration-200 ease-crisp [transition-property:opacity] hover:text-[color:var(--text)]"
              >
                {i.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
