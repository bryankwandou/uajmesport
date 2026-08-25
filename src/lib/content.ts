// Single source of truth. Verified against UKM E-Sport UAJM official documents
// (SK No. 001 & 002/SK/UKM-E-SPORT/UAJM/XII/2025, AD/ART, Google Form responses)
// and tournament certificates on file. No fabricated metrics.

export const org = {
  name: "UKM E-Sport UAJM",
  full: "Unit Kegiatan Mahasiswa E-Sport Universitas Atma Jaya Makassar",
  short: "UAJM E-Sport",
  tagline: "UKM pertama yang lahir dari mahasiswa FTI. Resmi, terstruktur, kompetitif.",
  location: "Universitas Atma Jaya Makassar, Sulawesi Selatan",
  period: "Periode 2025/2026, kepengurusan ke-2",
  sk: "SK No. 001/SK/UKM-ESPORT/UAJM/VI/2025",
  domainBcc: "uajmbcc.vercel.app",
};

export const stats = [
  { value: 15, suffix: "+", label: "Anggota terdaftar", sub: "3 fakultas" },
  { value: 3, suffix: "", label: "Gelar turnamen 1v1", sub: "Mobile Legends" },
  { value: 4, suffix: "", label: "Divisi aktif", sub: "struktur resmi" },
  { value: 1, suffix: "", label: "Divisi Web3 (BCC)", sub: "di bawah UKM" },
];

// Official, verbatim from AD/ART Pasal 6 & 7 (SK No. 002/XII/2025)
export const vision =
  "Menjadi wadah pengembangan minat, bakat, dan prestasi mahasiswa Universitas Atma Jaya Makassar di bidang E-Sport yang edukatif, berintegritas, dan berkelanjutan.";

export const missions = [
  "Mengembangkan minat dan bakat mahasiswa di bidang E-Sport secara terarah dan bertanggung jawab.",
  "Menanamkan nilai sportivitas, etika digital, dan kerja sama tim.",
  "Mendorong prestasi mahasiswa melalui kegiatan yang selaras dengan tujuan pendidikan tinggi.",
  "Mendukung reputasi Universitas Atma Jaya Makassar melalui kegiatan kemahasiswaan yang positif.",
];

// Tournament wins from Titans Organizer certificates (all: Vincentius Bryan K.)
export const trophies = [
  { title: "Best of Fighter", event: "Titans Organizer ML, Season 7", mode: "1v1 Fighter", date: "12 Apr 2024" },
  { title: "Best of Marksman", event: "Titans Organizer ML, Season 6", mode: "1v1 Marksman", date: "07 Apr 2024" },
  { title: "Best of Assassin", event: "Titans Organizer ML, Season 8", mode: "1v1 Assassin", date: "14 Apr 2024" },
];

// Games from member registration (aggregate, no PII)
export const games = [
  { name: "Mobile Legends", count: 13 },
  { name: "Honkai: Star Rail", count: 5 },
  { name: "Clash of Clans", count: 4 },
  { name: "Genshin Impact", count: 4 },
  { name: "FIFA / eFootball", count: 3 },
  { name: "PUBG Mobile", count: 1 },
  { name: "CS2", count: 1 },
  { name: "Delta Force", count: 1 },
];

export const ranks = [
  "Mythic Immortal (ML)", "Conqueror (PUBG)", "Legend 5K (COC)", "Glory (ML)", "Marshall (Delta Force)",
];

export const faculties = [
  { name: "Ekonomi & Bisnis", count: 7 },
  { name: "Teknologi Informasi", count: 4 },
  { name: "Hukum", count: 4 },
];

export const timeline = [
  { date: "Pra-2024", title: "Starboy Esport", body: "Akar komunitas nonformal. Tim Starboy Esport dan solo gameplay kompetitif jauh sebelum status resmi." },
  { date: "Apr 2024", title: "Panen gelar 1v1", body: "Tiga gelar Titans Organizer Mobile Legends: Best Fighter, Best Marksman, dan Best Assassin." },
  { date: "10 Jun 2025", title: "Proposal disahkan", body: "Proposal pembentukan UKM E-Sport UAJM ditetapkan sebagai wadah resmi dan sah bagi minat serta bakat mahasiswa." },
  { date: "20 Des 2025", title: "SK & AD/ART", body: "Penetapan kepengurusan periode 2025/2026 beserta Anggaran Dasar dan Anggaran Rumah Tangga organisasi." },
  { date: "2026", title: "Lahirnya BCC", body: "UKM E-Sport menaungi UAJM Blockchain Club dan memperluas ekosistem digital ke ranah Web3." },
];

export const structure = {
  lead: { role: "Ketua Umum", name: "Vincentius Bryan Kwandou", prodi: "Teknik Informatika" },
  core: [
    { role: "Sekretaris", name: "Anneliese Trevina Wijaya" },
    { role: "Bendahara", name: "Felisitas Natasya Lady Claudia" },
  ],
  divisions: [
    { name: "Turnamen & Kompetisi", coord: "Deagustino Lallo" },
    { name: "Pelatihan & Pengembangan", coord: "Athallah Eriel" },
    { name: "Kreatif & Konten Digital", coord: "Marvel Harjosetio" },
    { name: "Humas & Relasi", coord: "Venilia Dina Minarti" },
  ],
};

export const values = [
  { title: "Edukatif", body: "Bermain sebagai sarana belajar disiplin, strategi, dan manajemen waktu." },
  { title: "Sportif", body: "Etika kompetitif dan rasa hormat pada lawan di atas segalanya." },
  { title: "Kolaboratif", body: "Kerja sama tim lintas fakultas dan lintas peran." },
  { title: "Berkelanjutan", body: "Kepengurusan terstruktur yang menjaga kesinambungan antar-periode." },
];

export const links = {
  instagram: "https://instagram.com/uajm_esport",
  instagramBcc: "https://instagram.com/uajm_bcc",
  campus: "https://uajm.ac.id",
  // Membership registration, UKM E-Sport #2, period 2026/2027.
  register: "https://forms.gle/ed2zW5avK34mnLGF9",
};

// Kop surat resmi UKM E-Sport, disalin persis dari header dokumen SK dan AD/ART.
// Header aslinya memuat tiga baris nama organisasi beserta dua logo resmi.
// Tidak ada baris alamat pada kop surat; alamat di bawah adalah alamat sekretariat
// kampus sesuai Proposal Pembentukan UKM E-Sport tertanggal 10 Juni 2025.
export const letterhead = {
  line1: "UNIT KEGIATAN MAHASISWA",
  line2: "E-SPORT",
  line3: "UNIVERSITAS ATMA JAYA MAKASSAR",
  secretariat: "Universitas Atma Jaya Makassar",
  address: "Jl. Tanjung Alang No. 23, Makassar 90224",
  email: "uajmesports@gmail.com",
  sourceNote: "Disalin persis dari kop surat resmi pada dokumen SK dan AD/ART UKM E-Sport UAJM.",
};

// Dasar hukum organisasi, dikutip dari nomor surat pada dokumen resmi.
export const legal = [
  { label: "SK Kepengurusan", value: "Nomor 001/SK/UKM-ESPORT/UAJM/VI/2025" },
  { label: "SK Penetapan AD/ART", value: "Nomor 002/SK/UKM-E-SPORT/UAJM/XII/2025" },
  { label: "Proposal Pembentukan", value: "Disahkan 10 Juni 2025" },
  { label: "Periode Kepengurusan", value: "2025/2026" },
];

// Alamat dan email resmi UKM diambil dari kop surat resmi UKM E-Sport.
// Telepon dan WhatsApp dari Proposal Pembentukan UKM tertanggal 10 Juni 2025.
export const contact = {
  secretariat: "Universitas Atma Jaya Makassar",
  address: "Jl. Tanjung Alang No. 23, Makassar 90224",
  email: "uajmesports@gmail.com",
  emailHref: "mailto:uajmesports@gmail.com",
  phone: "(0411) 871038",
  whatsapp: "+62 813-5504-9802",
  whatsappHref: "https://wa.me/6281355049802",
  website: "www.uajm.ac.id",
  websiteHref: "https://uajm.ac.id",
};

/* Real certificate scans on file. Every entry corresponds to a document held by
   the organisation; nothing here is a placeholder. To publish more, drop the
   scan into public/certs and add a row: the gallery counts and paginates itself. */
export type Certificate = {
  src: string; title: string; event: string; date: string;
  ref?: string; category: "turnamen" | "kompetisi" | "pelatihan";
};

export const certificates: Certificate[] = [
  { src: "/certs/best-fighter-s7.jpg", title: "Best of Fighter", event: "Titans Organizer, Mobile Legends Season 7", date: "12 Apr 2024", category: "turnamen" },
  { src: "/certs/best-marksman-s6.jpg", title: "Best of Marksman", event: "Titans Organizer, Mobile Legends Season 6", date: "07 Apr 2024", category: "turnamen" },
  { src: "/certs/best-assassin-s8.jpg", title: "Best of Assassin", event: "Titans Organizer, Mobile Legends Season 8", date: "14 Apr 2024", category: "turnamen" },
  { src: "/certs/efortion-enspirit-2024.jpg", title: "E-Fortion 5.0, ENSPIRIT 5.0", event: "IBM Student Union, Universitas Ciputra", date: "25 Feb 2024", ref: "186/UC-SUIBM/CERTIFICATE/III/2024", category: "kompetisi" },
  { src: "/certs/personal-branding-kadev.jpg", title: "Personal Branding Academy", event: "Kadev Co., Certificate of Completion", date: "31 Jul 2026", category: "pelatihan" },
];
