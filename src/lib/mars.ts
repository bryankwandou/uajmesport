/* Lagu resmi UKM E-Sport UAJM.
   Lirik disalin persis dari naskah lagu (BRYAN KWANDOU, 2 September 2026,
   v5.5). Setiap judul punya dua versi rekaman dengan lirik identik; yang
   berbeda hanya aransemen dan durasi, jadi lirik disimpan sekali per lagu.

   Berkas audio dan video TIDAK ikut ke dalam repo. Semuanya berada di Vercel
   Blob (store: mars-uajmesport) dan disajikan lewat CDN yang mendukung HTTP
   range request, sehingga pemutar bisa melakukan buffering bertahap seperti
   pemutar video pada umumnya, bukan mengunduh seluruh berkas lebih dulu. */

const BLOB = "https://ugkly8vjiv2tzhrp.public.blob.vercel-storage.com/mars";

export type LyricSection = { label: string; lines: string[] };

export type MarsVersion = {
  id: string;
  label: string;
  /** Ringkasan aransemen yang membedakan versi ini dari versi lainnya. */
  note: string;
  /** Detik. Dipakai menggambar bilah seek sebelum metadata selesai terunduh. */
  duration: number;
  mp3: string;
  wav: string;
  /** Hanya ada kalau video spektrum untuk versi ini sudah dirender & diunggah. */
  mp4?: string;
};

export type MarsTrack = {
  slug: string;
  title: string;
  fullTitle: string;
  tagline: string;
  spec: { label: string; value: string }[];
  usage: string;
  lyrics: LyricSection[];
  versions: MarsVersion[];
};

/* Audio selalu ada. Video spektrum dirender terpisah, jadi tautannya baru
   dipasang untuk versi yang berkasnya memang sudah berada di blob store. */
const WITH_VIDEO = new Set<string>([
  "melangkah-berjaya-v1",
  "melangkah-berjaya-v2",
  "siap-menyerang-v1",
  "siap-menyerang-v2",
  "siap-menang-v1",
  "siap-menang-v2",
]);

function media(slug: string) {
  return {
    mp3: BLOB + "/" + slug + ".mp3",
    wav: BLOB + "/" + slug + ".wav",
    ...(WITH_VIDEO.has(slug) ? { mp4: BLOB + "/" + slug + ".mp4" } : {}),
  };
}

export const marsCredit = {
  composer: "BRYAN KWANDOU",
  written: "2 September 2026",
  version: "v5.5",
  owner: "UKM E-Sport Universitas Atma Jaya Makassar",
  note:
    "Naskah lirik dan aransemen disusun untuk keperluan internal organisasi: video profil, pelantikan pengurus, dan opening turnamen. Penggunaan di luar kegiatan UKM E-Sport UAJM harap seizin pengurus.",
};

export const tracks: MarsTrack[] = [
  {
    slug: "melangkah-berjaya",
    title: "Melangkah Berjaya",
    fullTitle: "UAJM Esport, Melangkah Berjaya",
    tagline: "Mars utama. Anthem pop-rock elektronik yang naik bertahap sampai reff final.",
    spec: [
      { label: "Genre", value: "Mars modern — anthem pop-rock elektronik" },
      { label: "Tempo", value: "122–126 BPM, birama 4/4" },
      { label: "Nada dasar", value: "C mayor / A minor — heroik namun hangat" },
      {
        label: "Instrumen",
        value:
          "Synth pad megah, gitar elektrik distorsi ringan, kick-snare tegas ala stadium anthem, string section di reff",
      },
      {
        label: "Vokal",
        value: "Solo di verse (tegas, penuh keyakinan); gang vocal dan choir serentak di reff",
      },
      {
        label: "Dinamika",
        value:
          "Intro synth, verse membangun, reff pecah, bridge melambat lalu build-up ke reff final paling megah",
      },
    ],
    usage: "Video profil organisasi, pelantikan pengurus, dan opening turnamen UKM.",
    lyrics: [
      { label: "Intro", lines: ["UAJM E-Sport... bangkit dan melaju"] },
      {
        label: "Verse 1",
        lines: [
          "Dari kampus Atma Jaya kami berasal",
          "Menyatukan hati, langkah tak kenal lelah",
          "Lintas fakultas, satu barisan",
          "Menuju arena dengan keyakinan",
        ],
      },
      {
        label: "Reff",
        lines: [
          "UKM E-Sport, UAJM jaya",
          "Unggul dalam laga, teguh integritas",
          "Sportif kita jaga, edukatif jiwa raga",
          "Bela rasa mengiring setiap asa",
        ],
      },
      {
        label: "Verse 2",
        lines: [
          "Kolaborasi jadi kunci kemenangan",
          "Disiplin dan strategi kami pegang",
          "Bukan sekadar menang di medan maya",
          "Tapi nama kampus yang kami jaga",
        ],
      },
      {
        label: "Reff",
        lines: [
          "UKM E-Sport, UAJM jaya",
          "Unggul dalam laga, teguh integritas",
          "Sportif kita jaga, edukatif jiwa raga",
          "Bela rasa mengiring setiap asa",
        ],
      },
      {
        label: "Bridge",
        lines: [
          "Berkelanjutan, kita rawat bersama",
          "Generasi baru, tunas penerus jaya",
          "Dari layar kecil, mimpi jadi nyata",
          "Atma Jaya Makassar, harum namanya",
        ],
      },
      {
        label: "Reff Final",
        lines: [
          "UKM E-Sport, UAJM jaya",
          "Unggul, integritas, bela rasa",
          "Sportif, edukatif, kolaboratif nyata",
          "Berkelanjutan selamanya, esport UAJM!",
        ],
      },
      { label: "Outro", lines: ["UAJM Esport... berjaya!"] },
    ],
    versions: [
      {
        id: "melangkah-berjaya-v1",
        label: "Versi 1",
        note: "Take pendek dan padat. Tempo terasa lebih rapat, reff langsung penuh.",
        duration: 139.76,
        ...media("melangkah-berjaya-v1"),
      },
      {
        id: "melangkah-berjaya-v2",
        label: "Versi 2",
        note: "Take panjang. Intro dan bridge diberi ruang lebih, build-up ke reff final lebih lama.",
        duration: 199.52,
        ...media("melangkah-berjaya-v2"),
      },
    ],
  },
  {
    slug: "siap-menyerang",
    title: "Siap Menyerang",
    fullTitle: "UAJM Esport: Siap Menyerang",
    tagline: "Hype anthem untuk walk-in dan opening ceremony. Lead perempuan, chant pria.",
    spec: [
      { label: "Genre", value: "Hype anthem esport — electro-trap × rock, gaya entrance arena turnamen" },
      { label: "Tempo", value: "132–138 BPM, energik dan agresif, drop bass tegas tiap masuk reff" },
      { label: "Nada dasar", value: "E minor — gelap, garang, powerful" },
      {
        label: "Instrumen",
        value:
          "Synth bass berat, drum elektronik punchy, gitar power chord di reff, tepuk tangan dan stomp untuk chant",
      },
      {
        label: "Vokal",
        value:
          "Solo perempuan memimpin verse dan melodi utama; gang vocal pria untuk chant dan penebal reff; bridge call-response; reff final unison",
      },
      { label: "Dinamika", value: "Naik tajam tiap segmen menuju klimaks" },
    ],
    usage: "Walk-in tim, opening ceremony turnamen, dan bumper konten media sosial.",
    lyrics: [
      { label: "Intro — chant perempuan", lines: ["Siap? Menyala!"] },
      {
        label: "Verse 1 — Lead Perempuan",
        lines: [
          "Detak jantung, tangan di kontroler",
          "Fokus tajam, mental sang juara",
          "Atma Jaya mengalir di darah kami",
          "Integritas jadi senjata sejati",
        ],
      },
      {
        label: "Pre-Chorus — Perempuan + gang vocal pria",
        lines: ["Satu komando, satu barisan", "Lintas fakultas, siap bertarung!"],
      },
      {
        label: "Reff — full voice",
        lines: [
          "UAJM Esport, siap menyerang!",
          "Unggul di medan, tak pernah goyang",
          "Sportif berjuang, edukatif melangkah",
          "Bela rasa jaga kawan seperjuangan",
        ],
      },
      {
        label: "Verse 2 — Vokal Pria",
        lines: [
          "Strategi matang, timing tepat sasaran",
          "Kolaborasi jadi kekuatan",
          "Bukan sekadar menang di papan skor",
          "Nama kampus yang kami junjung tinggi tegak",
        ],
      },
      {
        label: "Reff (ulang)",
        lines: [
          "UAJM Esport, siap menyerang!",
          "Unggul di medan, tak pernah goyang",
          "Sportif berjuang, edukatif melangkah",
          "Bela rasa jaga kawan seperjuangan",
        ],
      },
      {
        label: "Bridge — call & response",
        lines: [
          "Perempuan: Kita berlari, tak pernah berhenti",
          "Pria (chant): Berkelanjutan! Berkelanjutan!",
          "Perempuan: Dari kampus kecil menuju panggung besar",
          "Pria (chant): UAJM! UAJM!",
        ],
      },
      {
        label: "Reff Final — unison, lebih tebal & tinggi",
        lines: [
          "UAJM Esport, siap menyerang!",
          "Unggul, integritas, bela rasa!",
          "Sportif, edukatif, kolaboratif nyata!",
          "Berkelanjutan selamanya — UAJM!",
        ],
      },
      { label: "Outro — chant serentak", lines: ["UAJM Esport... Juara!"] },
    ],
    versions: [
      {
        id: "siap-menyerang-v1",
        label: "Versi 1",
        note: "Take pendek. Chant lebih rapat, cocok untuk bumper dan potongan pendek.",
        duration: 138.48,
        ...media("siap-menyerang-v1"),
      },
      {
        id: "siap-menyerang-v2",
        label: "Versi 2",
        note: "Take panjang. Bridge call-response diperpanjang, reff final terdengar lebih tebal.",
        duration: 174.2,
        ...media("siap-menyerang-v2"),
      },
    ],
  },
  {
    slug: "siap-menang",
    title: "Siap Menang",
    fullTitle: "UAJM Esport: Siap Menang",
    tagline: "EDM mars kompetitif. Hype dari detik pertama, tanpa bagian slow.",
    spec: [
      {
        label: "Genre",
        value: "EDM mars kompetitif — future bass dan big room, progressive & electro house, dance-pop",
      },
      { label: "Tempo", value: "128–132 BPM, birama 4/4" },
      { label: "Nada dasar", value: "E minor — tegang" },
      {
        label: "Instrumen",
        value:
          "Synth lead tajam, bass drop menghentak, kick 4-on-the-floor, clap dan snare cepat, riser sebelum drop, vokal chop untuk hook",
      },
      { label: "Vokal", value: "Chant dan gang vocal tegas, gaya sorakan tribun turnamen" },
      { label: "Dinamika", value: "Intro langsung hype, reff meledak seperti drop EDM, drop final paling keras" },
    ],
    usage: "Highlight reel, momen kemenangan, dan backsound siaran turnamen.",
    lyrics: [
      { label: "Intro — chant", lines: ["U! A! J! M! Esport bangkit malam ini!"] },
      {
        label: "Verse 1",
        lines: [
          "Layar menyala, tangan mengepal",
          "Bukan basa-basi, saatnya beraksi",
          "Lintas fakultas, satu barisan",
          "Datang untuk menang, bukan main-main",
        ],
      },
      {
        label: "Pre-Reff",
        lines: ["Unggul di jiwa, integritas di setiap laga", "Bela rasa jadi senjata"],
      },
      {
        label: "Reff",
        lines: [
          "Ayo UAJM, tunjukkan taringmu!",
          "Sportif tapi ganas, edukatif tapi tegas",
          "Kolaboratif kita serang bersama",
          "Berkelanjutan sampai jadi juara!",
        ],
      },
      {
        label: "Verse 2",
        lines: [
          "Bukan sekadar hobi, ini jati diri",
          "Disiplin di latihan, ganas di kompetisi",
          "Setiap round, setiap detik berarti",
          "Kampus Atma Jaya kami bawa pergi",
        ],
      },
      {
        label: "Reff",
        lines: [
          "Ayo UAJM, tunjukkan taringmu!",
          "Sportif tapi ganas, edukatif tapi tegas",
          "Kolaboratif kita serang bersama",
          "Berkelanjutan sampai jadi juara!",
        ],
      },
      {
        label: "Bridge — drop moment",
        lines: [
          "Dengar sorak dari tribun",
          "Kita bukan cuma tim, kita satu jiwa",
          "Menang bukan tujuan akhir",
          "Tapi cara kita jaga nama almamater",
        ],
      },
      {
        label: "Reff Final — paling keras",
        lines: [
          "Ayo UAJM, tunjukkan taringmu!",
          "Sportif tapi ganas, edukatif tapi tegas",
          "Kolaboratif kita serang bersama",
          "Berkelanjutan sampai jadi juara!",
        ],
      },
      { label: "Outro — chant", lines: ["UAJM Esport... SIAP MENANG!", "UAJM Esport... SIAP JUARA!"] },
    ],
    versions: [
      {
        id: "siap-menang-v1",
        label: "Versi 1",
        note: "Take future bass. Drop lebih melodius, vokal chop terdengar jelas di hook.",
        duration: 200.08,
        ...media("siap-menang-v1"),
      },
      {
        id: "siap-menang-v2",
        label: "Versi 2",
        note: "Take big room dan progressive house. Kick lebih keras, riser lebih panjang sebelum drop final.",
        duration: 209.72,
        ...media("siap-menang-v2"),
      },
    ],
  },
];
