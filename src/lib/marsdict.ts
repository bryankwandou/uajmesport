/* Copy for the anthem page.
 *
 * The site carries ten locales, but this page ships Indonesian plus English
 * only — the same split the certificate page uses. Lyrics, song titles and the
 * arrangement notes are never translated: they are the work itself, in the
 * language it was written in.
 */
import type { Locale } from "./i18n";

export type MarsDict = {
  meta: { title: string; description: string };
  entry: { label: string; short: string };
  nav: { back: string; home: string };
  hero: {
    kicker: string;
    title: string;
    titleEm: string;
    lede: string;
    counts: string;
    playAll: string;
  };
  track: {
    play: string;
    pause: string;
    nowPlaying: string;
    lyrics: string;
    spec: string;
    usage: string;
    download: string;
    duration: string;
    videoQuality: string;
  };
  docs: {
    kicker: string;
    title: string;
    composer: string;
    written: string;
    owner: string;
    version: string;
  };
};

const id: MarsDict = {
  meta: {
    title: "Mars & Lagu Resmi · UKM E-Sport UAJM",
    description:
      "Tiga mars resmi UKM E-Sport Universitas Atma Jaya Makassar, masing-masing dua versi rekaman, lengkap dengan lirik, catatan aransemen, dan berkas MP3, WAV, serta video.",
  },
  entry: { label: "Mars & Lagu", short: "Mars" },
  nav: { back: "Kembali", home: "Beranda" },
  hero: {
    kicker: "Lagu Resmi",
    title: "Mars UKM",
    titleEm: "E-Sport UAJM",
    lede:
      "Tiga lagu resmi organisasi, masing-masing direkam dalam dua versi aransemen. Halaman ini memuat lirik lengkap, catatan produksi, dan berkas siap pakai untuk video profil, pelantikan, serta opening turnamen.",
    counts: "3 lagu · 6 versi rekaman · MP3, WAV, dan video",
    playAll: "Putar mars utama",
  },
  track: {
    play: "Putar",
    pause: "Jeda",
    nowPlaying: "Sedang diputar",
    lyrics: "Lirik lengkap",
    spec: "Catatan aransemen",
    usage: "Penggunaan",
    download: "Unduh",
    duration: "Durasi",
    videoQuality: "1080p · 60 fps · H.264 + AAC",
  },
  docs: {
    kicker: "Dokumentasi",
    title: "Kredit dan hak pakai",
    composer: "Penulis & aransemen",
    written: "Tanggal naskah",
    owner: "Pemilik hak pakai",
    version: "Versi naskah",
  },
};

const en: MarsDict = {
  meta: {
    title: "Anthems & Official Songs · UKM E-Sport UAJM",
    description:
      "Three official anthems of the e-sport unit of Universitas Atma Jaya Makassar, each in two recorded versions, with full lyrics, arrangement notes, and MP3, WAV and video files.",
  },
  entry: { label: "Anthems", short: "Anthem" },
  nav: { back: "Back", home: "Home" },
  hero: {
    kicker: "Official Songs",
    title: "Anthems of UKM",
    titleEm: "E-Sport UAJM",
    lede:
      "Three official songs, each recorded in two arrangements. This page holds the full lyrics, the production notes, and files ready for the organisation profile video, board inaugurations and tournament openings.",
    counts: "3 songs · 6 recorded versions · MP3, WAV and video",
    playAll: "Play the main anthem",
  },
  track: {
    play: "Play",
    pause: "Pause",
    nowPlaying: "Now playing",
    lyrics: "Full lyrics",
    spec: "Arrangement notes",
    usage: "Intended use",
    download: "Download",
    duration: "Length",
    videoQuality: "1080p · 60 fps · H.264 + AAC",
  },
  docs: {
    kicker: "Documentation",
    title: "Credit and permitted use",
    composer: "Written & arranged by",
    written: "Draft dated",
    owner: "Rights held by",
    version: "Draft version",
  },
};

export function marsDict(locale: Locale): MarsDict {
  return locale === "id" ? id : en;
}
