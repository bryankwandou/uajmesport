"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Controls } from "@/components/Controls";
import { LogoMark } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { useApp } from "@/components/Providers";
import { AdminPanel } from "@/components/cert/AdminPanel";
import { CertCard } from "@/components/cert/CertCard";
import { allRecords, findFor, hasFile, SLOTS, type CertRecord } from "@/lib/certstore";
import { certDict, fill } from "@/lib/certdict";
import { contact } from "@/lib/content";

/* Certificate claim page.
 *
 * A member proves who they are with the two things the membership record
 * already holds — full name and NIM — and the certificates registered to that
 * identity open. Nothing is listed before a match, so the page cannot be used
 * to browse who holds what.
 *
 * The board reaches its dashboard through the separator dot in the footer
 * stamp (three clicks) or ?admin=1. Deliberately quiet: members need the claim
 * form, and a board sign-in button on a public page invites everyone else to
 * try it.
 */

const MAX_TRIES = 5;
const COOLDOWN_S = 60;

export default function CertificatePage() {
  const { locale } = useApp();
  const d = useMemo(() => certDict(locale), [locale]);

  const [records, setRecords] = useState<CertRecord[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [admin, setAdmin] = useState(false);

  const refresh = useCallback(() => {
    allRecords()
      .then(setRecords)
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("admin") === "1") setAdmin(true);
  }, []);

  useEffect(() => {
    if (admin) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [admin]);

  return (
    <main className="bg-field relative min-h-screen">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3.5">
          <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label={d.meta.home}>
            <LogoMark size={32} />
            <span className="min-w-0">
              <span className="block font-display text-sm font-extrabold tracking-tight text-[color:var(--text)]">
                UKM<span className="text-crimson-glow"> E-SPORT</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-[color:var(--faint)]">
                {d.meta.title}
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-3">
            <Controls />
            <Link
              href="/"
              className="hidden text-xs text-[color:var(--muted)] hover:text-[color:var(--text)] sm:inline-block"
            >
              {d.meta.back}
            </Link>
          </div>
        </div>
      </header>

      {admin ? (
        <section className="mx-auto max-w-5xl px-5 py-14">
          <AdminPanel d={d} records={records} onChanged={refresh} onClose={() => setAdmin(false)} />
        </section>
      ) : (
        <Claim d={d} records={records} loaded={loaded} />
      )}

      <Footer d={d} onAdmin={() => setAdmin(true)} count={records.length} />
    </main>
  );
}

function Claim({
  d,
  records,
  loaded,
}: {
  d: ReturnType<typeof certDict>;
  records: CertRecord[];
  loaded: boolean;
}) {
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [found, setFound] = useState<CertRecord[] | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [tries, setTries] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const resultsRef = useRef<HTMLDivElement>(null);

  // Only ticks while a cooldown is running, so the page is idle the rest of
  // the time.
  useEffect(() => {
    if (lockedUntil <= now) return;
    const t = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(t);
  }, [lockedUntil, now]);

  const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (remaining > 0) {
      setError(fill(d.err.cooldown, { s: remaining }));
      return;
    }
    if (!name.trim() || !nim.trim()) {
      setError(d.err.empty);
      setFound(null);
      return;
    }
    setChecking(true);
    // The typed identity is hashed here, in this browser, and compared against
    // the registry. It is never put in a URL, a request body or storage.
    // A roster entry whose certificate has not been uploaded yet is a match on
    // identity but has nothing to hand over, so it never reaches the member.
    const hits = (await findFor(records, name, nim)).filter(hasFile);
    setChecking(false);
    if (hits.length === 0) {
      const next = tries + 1;
      setTries(next);
      setFound(null);
      if (next >= MAX_TRIES) {
        const until = Date.now() + COOLDOWN_S * 1000;
        setLockedUntil(until);
        setNow(Date.now());
        setTries(0);
        setError(fill(d.err.cooldown, { s: COOLDOWN_S }));
      } else {
        setError(d.err.notFound);
      }
      return;
    }
    setTries(0);
    setFound(hits);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  function again() {
    setFound(null);
    setName("");
    setNim("");
    setError("");
  }

  return (
    <>
      <section className="relative overflow-hidden px-5 pb-4 pt-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto max-w-3xl text-center">
          <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-[color:var(--muted)]">
            {d.hero.kicker}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-[color:var(--text)] md:text-5xl">
            {d.hero.title} <span className="gradient-text">{d.hero.titleEm}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-[color:var(--muted)]">{d.hero.lede}</p>
          <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[color:var(--faint)]">{d.hero.scope}</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-6 pt-10">
        <Reveal>
          <form onSubmit={submit} className="panel-feature clip-corner p-7 md:p-9">
            <div className="text-[10px] uppercase tracking-[0.25em] text-[color:var(--crimson)]">{d.form.legend}</div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-[color:var(--faint)]">
                  {d.form.name}
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={d.form.namePh}
                  autoComplete="name"
                  className={inputCls}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] uppercase tracking-wider text-[color:var(--faint)]">
                  {d.form.nim}
                </span>
                <input
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder={d.form.nimPh}
                  inputMode="text"
                  className={`${inputCls} font-mono`}
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={checking || remaining > 0}
                className="btn-primary clip-corner px-6 py-3 text-sm disabled:opacity-60"
              >
                {checking ? d.form.working : d.form.submit}
              </button>
              <span className="text-[11px] leading-relaxed text-[color:var(--faint)]">{d.form.hint}</span>
            </div>

            {error && (
              <p role="alert" className="mt-5 border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--crimson)]">
                {error}
              </p>
            )}
          </form>
        </Reveal>

        {loaded && records.length === 0 && (
          <div className="panel clip-corner mt-5 p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">
              {d.empty.title}
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[color:var(--muted)]">{d.empty.body}</p>
          </div>
        )}
      </section>

      <div ref={resultsRef} className="scroll-mt-6">
        {found && found.length > 0 && (
          <section className="mx-auto max-w-5xl px-5 pb-10 pt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[color:var(--border)] pb-4">
              <h2 className="font-display text-xl font-extrabold uppercase tracking-tight text-[color:var(--text)]">
                {d.res.heading}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-xs text-[color:var(--muted)]">
                  {found.length === 1 ? d.res.one : fill(d.res.many, { n: found.length })}
                </span>
                <button
                  type="button"
                  onClick={again}
                  className="link-quiet text-xs text-[color:var(--muted)] underline decoration-[color:var(--border-strong)] underline-offset-4 hover:text-[color:var(--text)]"
                >
                  {d.res.again}
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-6">
              {found.map((r) => (
                <CertCard key={r.id} rec={r} d={d} />
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="mx-auto max-w-3xl px-5 pb-16 pt-6">
        <div className="panel-quiet pt-6">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">
            {d.help.title}
          </h2>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[color:var(--muted)]">{d.help.body}</p>
          <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs">
            <a href={contact.emailHref} className="text-[color:var(--muted)] hover:text-[color:var(--text)]">
              {d.help.email} · {contact.email}
            </a>
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[color:var(--muted)] hover:text-[color:var(--text)]"
            >
              {d.help.wa} · {contact.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

/* The separator dot in the stamp is the board's way in: three clicks inside
   two seconds. It carries a label for assistive technology, so it is quiet
   rather than hidden. */
function Footer({ d, onAdmin, count }: { d: ReturnType<typeof certDict>; onAdmin: () => void; count: number }) {
  const taps = useRef<number[]>([]);

  function knock() {
    const now = Date.now();
    taps.current = [...taps.current, now].filter((t) => now - t < 2000);
    if (taps.current.length >= 3) {
      taps.current = [];
      onAdmin();
    }
  }

  return (
    <footer className="border-t border-[color:var(--border)] px-5 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 text-center font-mono text-[11px] text-[color:var(--faint)]">
        <span>UKM E-Sport UAJM</span>
        <button
          type="button"
          onClick={knock}
          aria-label="Akses pengurus"
          className="px-1 text-[color:var(--faint)] hover:text-[color:var(--muted)]"
        >
          ·
        </button>
        <span>
          Registry {count}/{SLOTS}
        </span>
        <span aria-hidden="true">·</span>
        <Link href="/" className="hover:text-[color:var(--muted)]">
          {d.meta.back}
        </Link>
      </div>
    </footer>
  );
}

const inputCls =
  "w-full rounded border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3.5 py-3 text-sm text-[color:var(--text)] outline-none duration-200 ease-crisp [transition-property:opacity] placeholder:text-[color:var(--faint)] hover:border-[color:var(--border-strong)] focus-visible:border-[color:var(--crimson)]";
