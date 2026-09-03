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
    lyrics: string;
    spec: string;
    usage: string;
    download: string;
    duration: string;
  };
  docs: {
    kicker: string;
    title: string;
    formatsTitle: string;
    formats: { name: string; body: string }[];
    streamTitle: string;
    streamBody: string;
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
    lyrics: "Lirik lengkap",
    spec: "Catatan aransemen",
    usage: "Penggunaan",
    download: "Unduh",
    duration: "Durasi",
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
          "Video spektrum 720p dengan logo dan judul lagu di layar. Siap dipakai sebagai bumper atau layar tunggu tanpa perlu menyunting apa pun.",
      },
    ],
    streamTitle: "Cara halaman ini memuat lagu",
    streamBody:
      "Halaman ini berdiri sendiri dan tidak ikut termuat bersama beranda, sehingga beranda tetap ringan. Tidak ada satu byte audio pun yang diunduh sampai tombol putar ditekan. Setelah itu berkas dialirkan potongan demi potongan lewat CDN yang mendukung range request, jadi lagu bisa dilompati ke menit mana pun tanpa menunggu bagian sebelumnya selesai. Bagian yang sudah tersimpan terlihat sebagai bilah lebih terang di belakang penunjuk posisi.",
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
    lyrics: "Full lyrics",
    spec: "Arrangement notes",
    usage: "Intended use",
    download: "Download",
    duration: "Length",
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
          "A 720p spectrum video carrying the crest and the song title. Usable as a bumper or a standby screen with no editing at all.",
      },
    ],
    streamTitle: "How this page loads the songs",
    streamBody:
      "This page stands on its own and is not bundled with the home page, so the home page stays light. Not one byte of audio is fetched until you press play. From there the file streams in pieces over a CDN that answers range requests, so you can jump to any minute without waiting for what comes before it. Whatever is already buffered shows as a lighter band behind the position marker.",
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
