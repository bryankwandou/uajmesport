"use client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { links } from "@/lib/content";

const items = [
  { href: "#tentang", label: "Tentang" },
  { href: "#prestasi", label: "Prestasi" },
  { href: "#komunitas", label: "Komunitas" },
  { href: "#pengurus", label: "Pengurus" },
  { href: "#legalitas", label: "Legalitas" },
  { href: "#kontak", label: "Kontak" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 duration-300 [transition-property:background-color,border-color,backdrop-filter] ${
        scrolled ? "backdrop-blur-xl bg-ink-950/70 border-b border-white/5" : ""
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <a href="#top" aria-label="UKM E-Sport UAJM">
          <Logo />
        </a>
        <div className="hidden items-center gap-7 md:flex">
          {items.map((i) => (
            <a key={i.href} href={i.href} className="text-sm text-white/60 transition-colors hover:text-white">
              {i.label}
            </a>
          ))}
          <a href={links.register} target="_blank" rel="noopener noreferrer" className="btn-primary clip-corner px-4 py-2 text-sm">
            Daftar Anggota
          </a>
        </div>
        <button className="md:hidden text-white/70" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-white/5 bg-ink-950/95 px-5 py-4">
          <div className="flex flex-col gap-3">
            {items.map((i) => (
              <a key={i.href} href={i.href} onClick={() => setOpen(false)} className="text-sm text-white/70">
                {i.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
