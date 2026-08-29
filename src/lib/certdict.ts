/* Copy for the certificate claim page.
 *
 * The site carries ten locales. This page is a member service that hands out
 * legal documents against a name and a NIM, so it ships Indonesian, the
 * language of record, plus English for anyone reading the site in another
 * locale. Names, NIM and decree numbers are never translated.
 */
import type { Locale } from "./i18n";

export type CertDict = {
  meta: { title: string; back: string; home: string };
  entry: { label: string; hint: string };
  hero: { kicker: string; title: string; titleEm: string; lede: string; scope: string };
  form: {
    legend: string;
    name: string;
    namePh: string;
    nim: string;
    nimPh: string;
    submit: string;
    working: string;
    hint: string;
  };
  err: {
    empty: string;
    notFound: string;
    cooldown: string;
    generic: string;
  };
  res: {
    heading: string;
    one: string;
    many: string;
    issued: string;
    ref: string;
    source: string;
    formats: string;
    formatsNote: string;
    preparing: string;
    original: string;
    again: string;
    preview: string;
    noPreview: string;
  };
  help: { title: string; body: string; email: string; wa: string };
  empty: { title: string; body: string };
  admin: {
    signIn: string;
    user: string;
    pass: string;
    enter: string;
    wrong: string;
    title: string;
    slots: string;
    slotsNote: string;
    add: string;
    edit: string;
    fName: string;
    fNim: string;
    fTitle: string;
    fEvent: string;
    fDate: string;
    fRef: string;
    fFile: string;
    fFileKeep: string;
    save: string;
    update: string;
    cancel: string;
    list: string;
    listEmpty: string;
    del: string;
    delConfirm: string;
    exportJson: string;
    exportFiles: string;
    importJson: string;
    signedInAs: string;
    roleLead: string;
    roleSekretaris: string;
    rolePembina: string;
    dropHere: string;
    awaiting: string;
    rosterLabel: string;
    rosterPh: string;
    rosterAdd: string;
    rosterHint: string;
    seed: string;
    wipe: string;
    wipeConfirm: string;
    signOut: string;
    saved: string;
    note: string;
    published: string;
    storage: string;
    publishHelp: string;
  };
};

const id: CertDict = {
  meta: {
    title: "Klaim Sertifikat Anggota",
    back: "Kembali ke beranda",
    home: "UKM E-Sport UAJM",
  },
  entry: { label: "Klaim sertifikat anggota", hint: "Untuk anggota UKM E-Sport UAJM." },
  hero: {
    kicker: "Layanan anggota",
    title: "Klaim sertifikat",
    titleEm: "anggota",
    lede: "Masukkan nama lengkap dan NIM/stambuk persis seperti pada data keanggotaan. Sertifikat yang terdaftar atas identitas tersebut akan terbuka dan dapat diunduh.",
    scope: "Halaman ini untuk anggota UKM E-Sport UAJM. Tanpa nama dan NIM yang cocok, tidak ada berkas yang ditampilkan.",
  },
  form: {
    legend: "Verifikasi identitas",
    name: "Nama lengkap",
    namePh: "Contoh: Vincentius Bryan Kwandou",
    nim: "NIM / stambuk",
    nimPh: "Contoh: 210211001",
    submit: "Buka sertifikat saya",
    working: "Memeriksa…",
    hint: "Huruf besar-kecil, spasi ganda dan tanda baca tidak berpengaruh.",
  },
  err: {
    empty: "Isi nama lengkap dan NIM/stambuk terlebih dahulu.",
    notFound: "Tidak ada sertifikat atas nama dan NIM tersebut. Periksa ejaan nama dan angka NIM, lalu coba lagi.",
    cooldown: "Terlalu banyak percobaan. Coba lagi dalam {s} detik.",
    generic: "Terjadi kesalahan saat membuka berkas.",
  },
  res: {
    heading: "Sertifikat ditemukan",
    one: "1 sertifikat terdaftar atas identitas ini.",
    many: "{n} sertifikat terdaftar atas identitas ini.",
    issued: "Tanggal terbit",
    ref: "Nomor",
    source: "Berkas",
    formats: "Unduh sebagai",
    formatsNote: "Berkas dikonversi di peramban Anda. Tidak ada dokumen yang dikirim ke layanan lain.",
    preparing: "Menyiapkan…",
    original: "Unduh berkas asli",
    again: "Cari identitas lain",
    preview: "Pratinjau",
    noPreview: "Pratinjau tidak tersedia untuk jenis berkas ini. Unduh berkas asli untuk membukanya.",
  },
  help: {
    title: "Sertifikat belum muncul?",
    body: "Sertifikat baru tampil setelah pengurus memasukkannya ke registry. Hubungi sekretariat jika nama Anda seharusnya terdaftar.",
    email: "Email sekretariat",
    wa: "WhatsApp pengurus",
  },
  empty: {
    title: "Registry sertifikat masih kosong",
    body: "Belum ada sertifikat yang dimasukkan pengurus. Formulir di atas tetap berfungsi dan akan menemukan berkas begitu registry terisi.",
  },
  admin: {
    signIn: "Masuk pengurus",
    user: "Nama pengguna",
    pass: "Kata sandi",
    enter: "Masuk",
    wrong: "Nama pengguna atau kata sandi salah.",
    title: "Dasbor pengurus",
    slots: "{n} dari {t} slot terisi",
    slotsNote: "Kapasitas 200 sertifikat pada database Neon Postgres.",
    add: "Tambah sertifikat",
    edit: "Ubah sertifikat",
    fName: "Nama lengkap penerima",
    fNim: "NIM / stambuk",
    fTitle: "Judul sertifikat",
    fEvent: "Kegiatan / penerbit",
    fDate: "Tanggal terbit",
    fRef: "Nomor sertifikat (opsional)",
    fFile: "Berkas sertifikat (PDF, JPG, PNG, WEBP) — boleh dikosongkan dulu",
    fFileKeep: "Biarkan kosong untuk mempertahankan berkas lama.",
    save: "Simpan sertifikat",
    update: "Simpan perubahan",
    cancel: "Batal",
    list: "Sertifikat terdaftar",
    listEmpty: "Belum ada entri. Tempel daftar nama di atas, lalu seret berkas sertifikat ke barisnya.",
    del: "Hapus",
    delConfirm: "Hapus sertifikat ini dari registry?",
    exportJson: "Ekspor registry (JSON)",
    exportFiles: "Unduh semua berkas",
    importJson: "Impor registry (JSON)",
    signedInAs: "Masuk sebagai",
    roleLead: "Ketua Umum",
    roleSekretaris: "Sekretaris",
    rolePembina: "Dosen Pembina",
    dropHere: "Seret berkas sertifikat ke baris ini",
    awaiting: "Menunggu berkas",
    rosterLabel: "Tambah banyak anggota sekaligus",
    rosterPh: "Nama Lengkap, NIM\nNama Lengkap, NIM",
    rosterAdd: "Tambah dari daftar",
    rosterHint: "Satu baris satu anggota, dipisah koma, titik koma, atau tab.",
    seed: "Muat 25 contoh",
    wipe: "Kosongkan data perangkat ini",
    wipeConfirm: "Hapus semua sertifikat yang tersimpan di perangkat ini?",
    signOut: "Keluar",
    saved: "Tersimpan.",
    note: "Gerbang masuk ini berjalan di peramban, bukan di server. Cukup untuk memisahkan pengurus dari pengunjung, bukan untuk menahan penyerang. Ketua Umum, Sekretaris, dan Dosen Pembina memakai akun terpisah dengan hak yang sama persis.",
    published: "Tersimpan",
    storage: "{mb} MB terpakai",
    publishHelp:
      "Sertifikat tersimpan di database Neon Postgres, jadi apa yang diunggah di satu perangkat langsung dapat diklaim dari perangkat mana pun. Ekspor registry dan Unduh semua berkas hanya untuk arsip cadangan; berkas JSON itu tidak memuat nama maupun NIM, hanya sidik SHA-256.",
  },
};

const en: CertDict = {
  meta: {
    title: "Member Certificate Claim",
    back: "Back to home",
    home: "UKM E-Sport UAJM",
  },
  entry: { label: "Claim member certificate", hint: "For members of UKM E-Sport UAJM." },
  hero: {
    kicker: "Member service",
    title: "Claim your member",
    titleEm: "certificate",
    lede: "Enter your full name and student number exactly as they appear in the membership record. Any certificate registered to that identity unlocks and can be downloaded.",
    scope: "This page is for members of UKM E-Sport UAJM. Without a matching name and student number, no file is shown.",
  },
  form: {
    legend: "Identity check",
    name: "Full name",
    namePh: "e.g. Vincentius Bryan Kwandou",
    nim: "Student number (NIM)",
    nimPh: "e.g. 210211001",
    submit: "Open my certificate",
    working: "Checking…",
    hint: "Letter case, double spaces and punctuation make no difference.",
  },
  err: {
    empty: "Enter both your full name and your student number.",
    notFound: "No certificate is registered to that name and student number. Check the spelling and the digits, then try again.",
    cooldown: "Too many attempts. Try again in {s} seconds.",
    generic: "Something went wrong while opening the file.",
  },
  res: {
    heading: "Certificate found",
    one: "1 certificate is registered to this identity.",
    many: "{n} certificates are registered to this identity.",
    issued: "Issued",
    ref: "Number",
    source: "File",
    formats: "Download as",
    formatsNote: "Conversion runs in your browser. No document is sent to another service.",
    preparing: "Preparing…",
    original: "Download original file",
    again: "Look up another identity",
    preview: "Preview",
    noPreview: "No preview is available for this file type. Download the original to open it.",
  },
  help: {
    title: "Certificate not showing?",
    body: "A certificate appears once the board has entered it into the registry. Contact the secretariat if your name should already be there.",
    email: "Secretariat email",
    wa: "Board WhatsApp",
  },
  empty: {
    title: "The certificate registry is still empty",
    body: "The board has not entered any certificate yet. The form above already works and will find a file the moment the registry is filled.",
  },
  admin: {
    signIn: "Board sign-in",
    user: "Username",
    pass: "Password",
    enter: "Sign in",
    wrong: "Wrong username or password.",
    title: "Board dashboard",
    slots: "{n} of {t} slots filled",
    slotsNote: "200 certificates of capacity on the Neon Postgres database.",
    add: "Add certificate",
    edit: "Edit certificate",
    fName: "Recipient full name",
    fNim: "Student number (NIM)",
    fTitle: "Certificate title",
    fEvent: "Event / issuer",
    fDate: "Issue date",
    fRef: "Certificate number (optional)",
    fFile: "Certificate file (PDF, JPG, PNG, WEBP) — may be left empty for now",
    fFileKeep: "Leave empty to keep the existing file.",
    save: "Save certificate",
    update: "Save changes",
    cancel: "Cancel",
    list: "Registered certificates",
    listEmpty: "No entry yet. Paste a name list above, then drop each certificate file on its row.",
    del: "Delete",
    delConfirm: "Remove this certificate from the registry?",
    exportJson: "Export registry (JSON)",
    exportFiles: "Download every file",
    importJson: "Import registry (JSON)",
    signedInAs: "Signed in as",
    roleLead: "Board chair",
    roleSekretaris: "Secretary",
    rolePembina: "Faculty supervisor",
    dropHere: "Drop the certificate file on this row",
    awaiting: "Awaiting file",
    rosterLabel: "Add several members at once",
    rosterPh: "Full Name, NIM\nFull Name, NIM",
    rosterAdd: "Add from list",
    rosterHint: "One member per line, separated by a comma, semicolon or tab.",
    seed: "Load 25 samples",
    wipe: "Clear this device",
    wipeConfirm: "Delete every certificate stored on this device?",
    signOut: "Sign out",
    saved: "Saved.",
    note: "This gate runs in the browser, not on a server. It separates the board from visitors; it does not hold off an attacker. The chair, the secretary and the faculty supervisor sign in separately and share one dashboard with identical rights.",
    published: "Stored",
    storage: "{mb} MB used",
    publishHelp:
      "Certificates live in the Neon Postgres database, so what is uploaded on one device is claimable from any other straight away. Export registry and Download every file are for an offline backup only; that JSON carries no name and no NIM, just a SHA-256.",
  },
};

export function certDict(locale: Locale): CertDict {
  return locale === "id" ? id : en;
}

export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
