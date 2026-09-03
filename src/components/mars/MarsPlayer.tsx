"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MarsTrack, MarsVersion } from "@/lib/mars";

/* Pemutar lagu resmi.

   Strategi muat (mengikuti cara pemutar video arus utama bekerja, bukan
   mengunduh berkas utuh lebih dulu):

   1. preload="none" — halaman ini bisa dibuka tanpa satu byte audio pun
      terunduh. Jaringan baru bekerja setelah pengguna menekan putar.
   2. Berkas disajikan Vercel Blob CDN yang menjawab HTTP range request, jadi
      peramban mengunduh potongan demi potongan sambil memutar dan bisa
      melompat ke menit mana pun tanpa menunggu bagian sebelumnya.
   3. Rentang yang sudah tersimpan digambar di belakang bilah progres, sehingga
      pengguna melihat seberapa jauh buffer sudah terisi.
   4. Peristiwa waiting/playing menyalakan indikator memuat, jadi jeda karena
      buffer terbaca sebagai "sedang memuat", bukan aplikasi yang macet.
   5. MP3 adalah aliran bawaan. WAV lossless berukuran sekitar sepuluh kali
      lipat, jadi hanya dimuat kalau pengguna memang memilihnya. */

type Format = "mp3" | "wav";

type Loaded = { version: MarsVersion; trackTitle: string; format: Format };

type Ctx = {
  loaded: Loaded | null;
  playing: boolean;
  /** Memulai (atau menjeda, kalau versi yang sama sedang berbunyi). */
  toggle: (v: MarsVersion, trackTitle: string, format?: Format) => void;
  openVideo: (v: MarsVersion, trackTitle: string) => void;
};

const PlayerCtx = createContext<Ctx | null>(null);

export function useMarsPlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("useMarsPlayer harus dipakai di dalam MarsPlayerProvider");
  return ctx;
}

function fmt(s: number) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function MarsPlayerProvider({ tracks, children }: { tracks: MarsTrack[]; children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ranges, setRanges] = useState<[number, number][]>([]);
  const [volume, setVolume] = useState(1);
  const [loop, setLoop] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<{ version: MarsVersion; trackTitle: string } | null>(null);

  // Urutan datar dipakai tombol lagu sebelumnya / berikutnya.
  const flat = useMemo(
    () => tracks.flatMap((t) => t.versions.map((v) => ({ version: v, trackTitle: t.title }))),
    [tracks],
  );

  const play = useCallback((v: MarsVersion, trackTitle: string, format: Format) => {
    const el = audioRef.current;
    if (!el) return;
    const src = format === "wav" ? v.wav : v.mp3;
    if (el.src !== src) {
      el.src = src;
      // preload="none" dilepas begitu pengguna memang meminta lagu ini; sejak
      // titik ini peramban boleh menarik potongan berikutnya sendiri.
      el.preload = "auto";
      el.load();
      setCurrent(0);
      setRanges([]);
    }
    setError(null);
    setLoaded({ version: v, trackTitle, format });
    setDuration((d) => (el.src === src && d ? d : v.duration));
    void el.play().catch(() => setError("Audio gagal diputar. Coba tekan putar sekali lagi."));
  }, []);

  const toggle = useCallback(
    (v: MarsVersion, trackTitle: string, format: Format = "mp3") => {
      const el = audioRef.current;
      if (!el) return;
      if (loaded && loaded.version.id === v.id && loaded.format === format) {
        if (el.paused) void el.play().catch(() => undefined);
        else el.pause();
        return;
      }
      play(v, trackTitle, format);
    },
    [loaded, play],
  );

  const step = useCallback(
    (delta: number) => {
      if (!loaded) return;
      const i = flat.findIndex((f) => f.version.id === loaded.version.id);
      if (i < 0) return;
      const next = flat[(i + delta + flat.length) % flat.length];
      play(next.version, next.trackTitle, loaded.format);
    },
    [flat, loaded, play],
  );

  const setFormat = useCallback(
    (format: Format) => {
      if (!loaded) return;
      const el = audioRef.current;
      const at = el?.currentTime ?? 0;
      play(loaded.version, loaded.trackTitle, format);
      // Kedua berkas adalah rekaman yang sama, jadi posisi dengar dipertahankan.
      const keep = () => {
        if (el) el.currentTime = at;
        el?.removeEventListener("loadedmetadata", keep);
      };
      el?.addEventListener("loadedmetadata", keep);
    },
    [loaded, play],
  );

  // Semua peristiwa media dipasang sekali; elemen audio-nya tidak pernah diganti.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const readRanges = () => {
      const b = el.buffered;
      const out: [number, number][] = [];
      for (let i = 0; i < b.length; i++) out.push([b.start(i), b.end(i)]);
      setRanges(out);
    };

    const onTime = () => {
      if (!scrubbing) setCurrent(el.currentTime);
      readRanges();
    };
    const onMeta = () => {
      setDuration(el.duration || 0);
      readRanges();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onWaiting = () => setWaiting(true);
    const onPlaying = () => {
      setWaiting(false);
      setError(null);
    };
    const onError = () => {
      setWaiting(false);
      setError("Berkas tidak dapat dimuat. Periksa koneksi lalu coba lagi.");
    };
    const onEnded = () => {
      if (!loop) step(1);
    };

    el.addEventListener("timeupdate", onTime);
    el.addEventListener("progress", readRanges);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("playing", onPlaying);
    el.addEventListener("canplay", onPlaying);
    el.addEventListener("error", onError);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("progress", readRanges);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("playing", onPlaying);
      el.removeEventListener("canplay", onPlaying);
      el.removeEventListener("error", onError);
      el.removeEventListener("ended", onEnded);
    };
  }, [loop, scrubbing, step]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.loop = loop;
  }, [loop]);
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // Video dan audio tidak pernah berbunyi bersamaan.
  const openVideo = useCallback((version: MarsVersion, trackTitle: string) => {
    if (!version.mp4) return;
    audioRef.current?.pause();
    setVideo({ version, trackTitle });
  }, []);

  useEffect(() => {
    if (!video) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setVideo(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [video]);

  const seekTo = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      const el = audioRef.current;
      if (!bar || !el || !duration) return;
      const r = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
      const at = ratio * duration;
      setCurrent(at);
      el.currentTime = at;
    },
    [duration],
  );

  const ctx = useMemo<Ctx>(() => ({ loaded, playing, toggle, openVideo }), [loaded, playing, toggle, openVideo]);
  const pct = duration ? (current / duration) * 100 : 0;

  return (
    <PlayerCtx.Provider value={ctx}>
      {children}
      {/* Padding agar bilah pemutar tidak menutupi akhir halaman. */}
      {loaded && <div aria-hidden className="h-32" />}

      <audio ref={audioRef} preload="none" crossOrigin="anonymous" />

      {loaded && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--border)] bg-[color:var(--bg)]/95 backdrop-blur-xl">
          <div className="mx-auto max-w-6xl px-4 pb-3 pt-2.5 sm:px-5">
            {/* Bilah seek. Rentang tersimpan digambar lebih dulu, progres di
                atasnya, jadi jarak antara keduanya adalah buffer yang tersedia. */}
            <div
              ref={barRef}
              role="slider"
              tabIndex={0}
              aria-label="Posisi pemutaran"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(current)}
              aria-valuetext={`${fmt(current)} dari ${fmt(duration)}`}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setScrubbing(true);
                seekTo(e.clientX);
              }}
              onPointerMove={(e) => scrubbing && seekTo(e.clientX)}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
                setScrubbing(false);
              }}
              onKeyDown={(e) => {
                const el = audioRef.current;
                if (!el) return;
                if (e.key === "ArrowRight") el.currentTime = Math.min(duration, el.currentTime + 5);
                else if (e.key === "ArrowLeft") el.currentTime = Math.max(0, el.currentTime - 5);
                else return;
                e.preventDefault();
              }}
              className="group relative -mx-1 cursor-pointer px-1 py-2 focus-visible:outline-none"
            >
              <div className="relative h-1.5 rounded-full bg-[color:var(--surface)]">
                {duration > 0 &&
                  ranges.map(([s, e], i) => (
                    <div
                      key={i}
                      className="absolute inset-y-0 rounded-full bg-[color:var(--border-strong)]"
                      style={{ left: `${(s / duration) * 100}%`, width: `${((e - s) / duration) * 100}%` }}
                    />
                  ))}
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-crimson-glow to-ember-glow"
                  style={{ width: `${pct}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--crimson)] opacity-0 duration-200 ease-crisp [transition-property:opacity] group-hover:opacity-100 group-focus-visible:opacity-100"
                  style={{ left: `${pct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5">
                <IconButton label="Lagu sebelumnya" onClick={() => step(-1)}>
                  <path d="M18 5v14L8 12l10-7zM6 5v14" />
                </IconButton>
                <button
                  type="button"
                  onClick={() => toggle(loaded.version, loaded.trackTitle, loaded.format)}
                  aria-label={playing ? "Jeda" : "Putar"}
                  className="btn-primary grid h-10 w-10 shrink-0 place-items-center rounded-full"
                >
                  {waiting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : playing ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="ms-0.5 h-4 w-4" fill="currentColor">
                      <path d="M7 4l13 8-13 8z" />
                    </svg>
                  )}
                </button>
                <IconButton label="Lagu berikutnya" onClick={() => step(1)}>
                  <path d="M6 5v14l10-7L6 5zM18 5v14" />
                </IconButton>
              </div>

              <div className="min-w-0 flex-1">
                <div className="truncate font-display text-sm font-bold uppercase tracking-wide text-[color:var(--text)]">
                  {loaded.trackTitle}
                </div>
                <div className="truncate text-[11px] text-[color:var(--faint)]">
                  {loaded.version.label}
                  {" · "}
                  <span className="font-mono">{fmt(current)} / {fmt(duration || loaded.version.duration)}</span>
                  {waiting && <span className="text-[color:var(--crimson)]"> · memuat…</span>}
                  {error && <span className="text-[color:var(--crimson)]"> · {error}</span>}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {(["mp3", "wav"] as Format[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    aria-pressed={loaded.format === f}
                    title={f === "wav" ? "WAV lossless — berkas jauh lebih besar" : "MP3 — aliran ringan"}
                    className={`rounded border px-2 py-1 font-mono text-[10px] uppercase duration-200 ease-crisp [transition-property:opacity] ${
                      loaded.format === f
                        ? "border-[color:var(--crimson)] text-[color:var(--text)]"
                        : "border-[color:var(--border)] text-[color:var(--faint)] hover:text-[color:var(--text)]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
                <IconButton label="Ulang satu lagu" onClick={() => setLoop((v) => !v)} active={loop}>
                  <path d="M17 2l4 4-4 4" />
                  <path d="M3 11v-1a4 4 0 014-4h14M7 22l-4-4 4-4" />
                  <path d="M21 13v1a4 4 0 01-4 4H3" />
                </IconButton>
                <label className="hidden items-center gap-2 sm:flex">
                  <span className="sr-only">Volume</span>
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-[color:var(--faint)]" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.5 8.5a5 5 0 010 7" />
                  </svg>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-1 w-20 cursor-pointer accent-[color:var(--crimson)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    audioRef.current?.pause();
                    setLoaded(null);
                  }}
                  aria-label="Tutup pemutar"
                  className="grid h-8 w-8 place-items-center rounded border border-[color:var(--border)] text-[color:var(--faint)] hover:text-[color:var(--text)]"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {video && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Video ${video.trackTitle}`}
          className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setVideo(null)}
        >
          <div className="w-full max-w-4xl">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-bold uppercase tracking-wide text-white">
                  {video.trackTitle}
                </div>
                <div className="truncate text-[11px] text-white/60">{video.version.label} · video spektrum 720p</div>
              </div>
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="rounded border border-white/25 px-3 py-1.5 text-xs text-white/80 hover:text-white"
              >
                Tutup
              </button>
            </div>
            {/* preload="metadata": hanya header berkas yang diambil sampai
                pengguna menekan putar, lalu CDN mengalirkan sisanya. */}
            <video
              key={video.version.id}
              src={video.version.mp4}
              controls
              autoPlay
              playsInline
              preload="metadata"
              className="aspect-video w-full rounded border border-white/15 bg-black"
            />
          </div>
        </div>
      )}
    </PlayerCtx.Provider>
  );
}

function IconButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`grid h-8 w-8 place-items-center rounded border border-[color:var(--border)] duration-200 ease-crisp [transition-property:opacity] hover:text-[color:var(--text)] ${
        active ? "text-[color:var(--crimson)]" : "text-[color:var(--faint)]"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}
