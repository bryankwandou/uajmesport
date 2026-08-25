"use client";
import { LOCALES, isLocale } from "@/lib/i18n";
import { useApp } from "./Providers";

/* A native select drives the language, so the control stays accessible, works
   on touch, and cannot produce overlapping custom-dropdown layers. */
export function Controls({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, locale, setLocale, t } = useApp();

  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <select
          aria-label={t.a11y.language}
          value={locale}
          onChange={(e) => {
            const v = e.target.value;
            if (isLocale(v)) setLocale(v);
          }}
          className="cursor-pointer appearance-none rounded border border-[color:var(--border)] bg-transparent py-1.5 pl-2.5 pr-7 font-mono text-[11px] text-[color:var(--muted)] outline-none duration-200 ease-crisp [transition-property:color,border-color] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)] focus-visible:border-[color:var(--crimson)]"
        >
          {LOCALES.map((l) => (
            <option key={l.code} value={l.code} className="bg-[color:var(--bg)] text-[color:var(--text)]">
              {l.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-2 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[color:var(--faint)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </div>

      <button
        type="button"
        aria-label={t.a11y.theme}
        aria-pressed={theme === "light"}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className={`grid place-items-center rounded border border-[color:var(--border)] text-[color:var(--muted)] duration-200 ease-crisp [transition-property:color,border-color,background-color] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)] focus-visible:border-[color:var(--crimson)] ${
          compact ? "h-[30px] w-[30px]" : "h-[30px] w-[30px]"
        }`}
      >
        {theme === "dark" ? (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="10" cy="10" r="3.4" />
            <path d="M10 2.4v1.8M10 15.8v1.8M17.6 10h-1.8M4.2 10H2.4M15.4 4.6l-1.3 1.3M5.9 14.1l-1.3 1.3M15.4 15.4l-1.3-1.3M5.9 5.9 4.6 4.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M16.5 12.4A7 7 0 0 1 7.6 3.5a7 7 0 1 0 8.9 8.9Z" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
