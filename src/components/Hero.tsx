"use client";
import { motion } from "framer-motion";
import { org, stats, trophies, links } from "@/lib/content";
import { CountUp } from "./CountUp";
import { useApp } from "./Providers";

export function Hero() {
  const { t } = useApp();
  const h = t.hero;
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="chip inline-flex items-center gap-2 px-3 py-1.5 text-xs text-[color:var(--muted)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-crimson-glow shadow-[0_0_8px_2px_rgba(255,45,85,0.8)]" />
            {org.period}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-5 font-display text-4xl font-extrabold uppercase leading-[1.02] tracking-tight text-[color:var(--text)] sm:text-5xl md:text-6xl"
          >
            {h.title1} <br />
            {h.title2} <br />
            <span className="gradient-text">{h.title3}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-[color:var(--muted)] md:text-lg"
          >
            {org.full}. {h.lede}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <a href={links.register} target="_blank" rel="noopener noreferrer" className="btn-primary clip-corner px-6 py-3 text-sm">
              {h.ctaPrimary}
            </a>
            <a
              href="#prestasi"
              className="clip-corner border border-[color:var(--border)] px-6 py-3 text-sm text-[color:var(--text)] transition-colors hover:border-[color:var(--border)] hover:text-[color:var(--text)]"
            >
              {h.ctaSecondary} →
            </a>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              >
                <div className="font-display text-2xl font-extrabold text-[color:var(--text)] md:text-3xl">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-xs leading-tight text-[color:var(--faint)]">{t.stats[i]}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right side: trophy HUD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mx-auto hidden w-full max-w-sm md:block"
        >
          <div className="glass clip-corner relative overflow-hidden p-6">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-crimson-glow/20 blur-3xl" />
            <div className="flex items-center justify-between">
              <div className="font-display text-xs uppercase tracking-widest text-[color:var(--faint)]">{h.cabinet}</div>
              <span className="h-2 w-2 animate-pulseglow rounded-full bg-crimson-glow" />
            </div>
            <div className="mt-5 space-y-3">
              {trophies.map((t, i) => (
                <motion.div
                  key={t.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-2)] p-3"
                >
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-gradient-to-br from-ember-glow/30 to-crimson-glow/20 font-display text-xs font-bold text-[color:var(--text)]">
                    ★
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-[color:var(--text)]">{t.title}</div>
                    <div className="truncate text-[11px] text-[color:var(--faint)]">{t.mode} · {t.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 border-t border-[color:var(--border)] pt-4 text-[11px] text-[color:var(--faint)]">
              {h.cabinetNote}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
