"use client";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Controls } from "./Controls";
import { useApp } from "./Providers";
import { links } from "@/lib/content";

export function Nav() {
  const { t } = useApp();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const items = [
    { href: "#tentang", label: t.nav.about },
    { href: "#prestasi", label: t.nav.achievements },
    { href: "#komunitas", label: t.nav.community },
    { href: "#pengurus", label: t.nav.officers },
    { href: "#legalitas", label: t.nav.legal },
    { href: "#kontak", label: t.nav.contact },
    { href: "/deck.html", label: t.nav.deck },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile sheet once the viewport passes the breakpoint, so the
  // panel can never linger behind the desktop bar.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 duration-300 ease-crisp [transition-property:opacity] ${
        scrolled || open
          ? "border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur-xl"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5">
        <a href="#top" aria-label="UKM E-Sport UAJM" className="min-w-0 shrink">
          <Logo />
        </a>

        <div className="hidden items-center gap-6 lg:flex">
          {items.map((i) => (
            <a
              key={i.href}
              href={i.href}
              className="whitespace-nowrap text-[13px] text-[color:var(--muted)] duration-200 ease-crisp [transition-property:opacity] hover:text-[color:var(--text)]"
            >
              {i.label}
            </a>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Controls />
          <a
            href={links.register}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary clip-corner hidden px-4 py-2 text-[12px] sm:inline-block"
          >
            {t.nav.register}
          </a>
          <button
            className="grid h-[30px] w-[30px] place-items-center rounded border border-[color:var(--border)] text-[color:var(--muted)] lg:hidden"
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

      {open && (
        <div className="border-t border-[color:var(--border)] bg-[color:var(--bg)] px-5 py-4 lg:hidden">
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
