"use client";
import Link from "next/link";
import { Controls } from "@/components/Controls";
import { LogoMark } from "@/components/Logo";
import { Reveal } from "@/components/Reveal";
import { useApp } from "@/components/Providers";
import { MarsPlayerProvider, useMarsPlayer } from "@/components/mars/MarsPlayer";
import { marsDict } from "@/lib/marsdict";
import { marsCredit, tracks, type MarsTrack, type MarsVersion } from "@/lib/mars";
import { org } from "@/lib/content";

/* Halaman berdiri sendiri: rutenya terpisah dari beranda, jadi kode pemutar
   dan seluruh naskah lirik hanya diunduh ketika halaman ini dibuka. Berkas
   audio sendiri baru diambil setelah tombol putar ditekan. */

export default function MarsPage() {
  return (
    <MarsPlayerProvider tracks={tracks}>
      <main className="bg-field relative min-h-screen">
        <PageNav />
        <Hero />
        <div className="mx-auto max-w-5xl space-y-16 px-5 pb-24">
          {tracks.map((t, i) => (
            <TrackSection key={t.slug} track={t} index={i} />
          ))}
          <Docs />
        </div>
        <Footer />
      </main>
    </MarsPlayerProvider>
  );
}

function PageNav() {
  const { locale } = useApp();
  const d = marsDict(locale);
  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--border)] bg-[color:var(--bg)]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          <span className="truncate font-display text-xs font-bold uppercase tracking-wide text-[color:var(--text)]">
            {org.name}
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <Controls />
          <Link
            href="/"
            className="rounded border border-[color:var(--border)] px-3 py-1.5 text-xs text-[color:var(--muted)] duration-200 ease-crisp [transition-property:opacity] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]"
          >
            {d.nav.home}
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  const { locale } = useApp();
  const d = marsDict(locale);
  const { toggle } = useMarsPlayer();
  const main = tracks[0];
  return (
    <section className="bg-grid border-b border-[color:var(--border)]">
      <div className="mx-auto max-w-5xl px-5 py-20 md:py-28">
        <Reveal>
          <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-[color:var(--muted)]">
            {d.hero.kicker}
          </span>
          <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-[color:var(--text)] md:text-6xl">
            {d.hero.title} <span className="gradient-text">{d.hero.titleEm}</span>
          </h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-[color:var(--muted)]">{d.hero.lede}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => toggle(main.versions[0], main.title)}
              className="btn-primary clip-corner px-6 py-3 text-sm"
            >
              {d.hero.playAll}
            </button>
            <span className="font-mono text-xs text-[color:var(--faint)]">{d.hero.counts}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TrackSection({ track, index }: { track: MarsTrack; index: number }) {
  const { locale } = useApp();
  const d = marsDict(locale);
  return (
    <section id={track.slug} className="scroll-mt-20 pt-16">
      <Reveal>
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-sm text-[color:var(--crimson)]">
            {(index + 1).toString().padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight text-[color:var(--text)] md:text-3xl">
              {track.title}
            </h2>
            <p className="mt-1 text-sm text-[color:var(--faint)]">{track.fullTitle}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed text-[color:var(--muted)]">{track.tagline}</p>
      </Reveal>

      <div className="mt-8 space-y-3">
        {track.versions.map((v) => (
          <VersionRow key={v.id} version={v} track={track} />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Reveal>
          <div className="panel clip-corner h-full p-7">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
              {d.track.lyrics}
            </h3>
            <div className="mt-5 space-y-5">
              {track.lyrics.map((s, i) => (
                <div key={i}>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--crimson)]">{s.label}</div>
                  <p className="mt-1.5 whitespace-pre-line text-[15px] leading-[1.85] text-[color:var(--text)]">
                    {s.lines.join("\n")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Naskah lirik jauh lebih tinggi daripada catatan aransemen, jadi
            kolom kanan dibuat menempel dan mengikuti gulir alih-alih meninggalkan
            ruang kosong panjang di sebelahnya. */}
        <Reveal delay={0.05} className="self-start lg:sticky lg:top-20">
          <div className="panel-feature clip-corner p-7">
            <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[color:var(--muted)]">
              {d.track.spec}
            </h3>
            <dl className="mt-5 space-y-4">
              {track.spec.map((s) => (
                <div key={s.label}>
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--faint)]">{s.label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">{s.value}</dd>
                </div>
              ))}
              <div className="panel-quiet pt-4">
                <dt className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--faint)]">{d.track.usage}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[color:var(--muted)]">{track.usage}</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function VersionRow({ version, track }: { version: MarsVersion; track: MarsTrack }) {
  const { locale } = useApp();
  const d = marsDict(locale);
  const { loaded, playing, toggle, pauseAudio } = useMarsPlayer();
  const active = loaded?.version.id === version.id;
  const isPlaying = active && playing;
  const mins = Math.floor(version.duration / 60);
  const secs = Math.round(version.duration % 60);
  const length = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <div className="panel overflow-hidden">
      {/* Videonya berdiri di atas kartunya sendiri, tidak di balik tombol.
          preload="metadata" berarti yang terambil saat halaman dibuka hanya
          kepala berkas -- gambar dan suaranya baru mengalir, potongan demi
          potongan, setelah tombol putar ditekan. */}
      {version.mp4 && (
        <video
          src={version.mp4}
          controls
          playsInline
          preload="metadata"
          onPlay={pauseAudio}
          aria-label={`${track.fullTitle} ${version.label}`}
          className="aspect-video w-full bg-black"
        />
      )}

      <div
        className={`flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[color:var(--border)] p-4 duration-200 ease-crisp [transition-property:border-color] ${
          version.mp4 ? "" : "border-t-0"
        } ${active ? "border-[color:var(--crimson)]" : ""}`}
      >
        <button
          type="button"
          onClick={() => toggle(version, track.title)}
          aria-label={`${isPlaying ? d.track.pause : d.track.play} ${track.title} ${version.label}`}
          className="btn-primary grid h-10 w-10 shrink-0 place-items-center rounded-full"
        >
          {isPlaying ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ms-0.5 h-4 w-4" fill="currentColor">
              <path d="M7 4l13 8-13 8z" />
            </svg>
          )}
        </button>

        <div className="min-w-[14rem] flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <h4 className="font-display text-sm font-extrabold uppercase tracking-wide text-[color:var(--text)]">
              {track.fullTitle} — {version.label}
            </h4>
            {active && (
              <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--crimson)]">
                {d.track.nowPlaying}
              </span>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] text-[color:var(--faint)]">
            {length}
            {version.mp4 ? ` · ${d.track.videoQuality}` : ""}
          </p>
          <p className="mt-1.5 text-xs leading-relaxed text-[color:var(--faint)]">{version.note}</p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="me-1 font-mono text-[10px] uppercase text-[color:var(--faint)]">{d.track.download}</span>
          {(
            [
              ["mp3", version.mp3],
              ["wav", version.wav],
              ...(version.mp4 ? ([["mp4", version.mp4]] as const) : []),
            ] as [string, string][]
          ).map(([label, href]) => (
            <a
              key={label}
              href={href}
              download
              className="rounded border border-[color:var(--border)] px-2.5 py-1.5 font-mono text-[10px] uppercase text-[color:var(--muted)] duration-200 ease-crisp [transition-property:opacity] hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Docs() {
  const { locale } = useApp();
  const d = marsDict(locale);
  return (
    <section id="dokumentasi" className="scroll-mt-20 pt-16">
      <Reveal>
        <span className="chip clip-corner inline-block px-3 py-1 text-xs uppercase tracking-wider text-[color:var(--muted)]">
          {d.docs.kicker}
        </span>
        <h2 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-tight text-[color:var(--text)] md:text-3xl">
          {d.docs.title}
        </h2>
      </Reveal>


      <div className="mt-8">
        <Reveal>
          <div className="panel clip-corner h-full p-7">
            <dl className="space-y-3.5">
              {[
                [d.docs.composer, marsCredit.composer],
                [d.docs.written, marsCredit.written],
                [d.docs.version, marsCredit.version],
                [d.docs.owner, marsCredit.owner],
              ].map(([k, v]) => (
                <div key={k} className="flex flex-wrap justify-between gap-2 border-b border-[color:var(--border)] pb-2.5 last:border-0">
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--faint)]">{k}</dt>
                  <dd className="text-sm text-[color:var(--text)]">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs leading-relaxed text-[color:var(--faint)]">{marsCredit.note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  const { locale } = useApp();
  const d = marsDict(locale);
  return (
    <footer className="border-t border-[color:var(--border)]">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8">
        <span className="text-xs text-[color:var(--faint)]">{org.full}</span>
        <Link href="/" className="text-xs text-[color:var(--muted)] hover:text-[color:var(--text)]">
          ← {d.nav.home}
        </Link>
      </div>
    </footer>
  );
}
