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
    versions: string;
    play: string;
    pause: string;
    nowPlaying: string;
    video: string;
    videoClose: string;
    lyrics: string;
    spec: string;
    usage: string;
    download: string;
    duration: string;
    videoQuality: string;
    videoAbout: string;
    videoMore: string;
    videoLess: string;
  };
  docs: {
    kicker: string;
    title: string;
    formatsTitle: string;
    formats: { name: string; body: string }[];
    creditTitle: string;
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
    versions: "Versi rekaman",
    play: "Putar",
    pause: "Jeda",
    nowPlaying: "Sedang diputar",
    video: "Video",
    videoClose: "Tutup video",
    lyrics: "Lirik lengkap",
    spec: "Catatan aransemen",
    usage: "Penggunaan",
    download: "Unduh",
    duration: "Durasi",
    videoQuality: "1080p · 60 fps · H.264 + AAC",
    videoAbout:
      "Visualisasi spektrum dirender langsung dari master WAV lagu ini, lalu dialirkan dari Vercel Blob potongan demi potongan, sehingga bisa dilompati ke menit mana pun tanpa mengunduh berkasnya lebih dulu.",
    videoMore: "Selengkapnya",
    videoLess: "Sembunyikan",
  },
  docs: {
    kicker: "Dokumentasi",
    title: "Berkas dan cara memakainya",
    formatsTitle: "Format yang tersedia",
    formats: [
      {
        name: "MP3",
        body:
          "Aliran bawaan pemutar di halaman ini. Ukurannya ringan, cocok untuk pemutaran langsung, siaran, dan konten media sosial.",
      },
      {
        name: "WAV",
        body:
          "Master lossless untuk keperluan penyuntingan dan penayangan di acara. Ukurannya kira-kira sepuluh kali MP3, jadi hanya dimuat kalau memang dipilih.",
      },
      {
        name: "MP4",
        body:
          "Video spektrum 1080p 60 fps dengan logo dan judul lagu di layar. Siap dipakai sebagai bumper atau layar tunggu tanpa perlu menyunting apa pun.",
      },
    ],
    creditTitle: "Kredit dan hak pakai",
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
    versions: "Recorded versions",
    play: "Play",
    pause: "Pause",
    nowPlaying: "Now playing",
    video: "Video",
    videoClose: "Close video",
    lyrics: "Full lyrics",
    spec: "Arrangement notes",
    usage: "Intended use",
    download: "Download",
    duration: "Length",
    videoQuality: "1080p · 60 fps · H.264 + AAC",
    videoAbout:
      "The spectrum visual is rendered straight from the WAV master of this song, then streamed from Vercel Blob piece by piece, so you can jump to any minute without downloading the file first.",
    videoMore: "Show more",
    videoLess: "Show less",
  },
  docs: {
    kicker: "Documentation",
    title: "The files and how to use them",
    formatsTitle: "Available formats",
    formats: [
      {
        name: "MP3",
        body:
          "What the player on this page streams by default. Small enough for live playback, broadcast and social content.",
      },
      {
        name: "WAV",
        body:
          "The lossless master, for editing and for playback at events. Roughly ten times the size of the MP3, so it only loads when you ask for it.",
      },
      {
        name: "MP4",
        body:
          "A 1080p 60 fps spectrum video carrying the crest and the song title. Usable as a bumper or a standby screen with no editing at all.",
      },
    ],
    creditTitle: "Credit and permitted use",
    composer: "Written & arranged by",
    written: "Draft dated",
    owner: "Rights held by",
    version: "Draft version",
  },
};

export function marsDict(locale: Locale): MarsDict {
  return locale === "id" ? id : en;
}
