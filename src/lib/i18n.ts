// Locale dictionaries for UKM E-Sport UAJM. Indonesian is the source of record.
// Names, NIM, decree numbers, addresses and dates are never localised away.

export const LOCALES = [
  { code: "id", label: "Indonesia", dir: "ltr" },
  { code: "en", label: "English", dir: "ltr" },
  { code: "zh", label: "中文", dir: "ltr" },
  { code: "ja", label: "日本語", dir: "ltr" },
  { code: "ko", label: "한국어", dir: "ltr" },
  { code: "es", label: "Español", dir: "ltr" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "pt", label: "Português", dir: "ltr" },
  { code: "ar", label: "العربية", dir: "rtl" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];
export const DEFAULT_LOCALE: Locale = "id";

export function isLocale(v: string): v is Locale {
  return LOCALES.some((l) => l.code === v);
}
export function dirFor(code: Locale): "ltr" | "rtl" {
  return LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}

export type Dict = {
  nav: { about: string; achievements: string; community: string; officers: string; legal: string; contact: string; deck: string; register: string; menu: string };
  hero: { title1: string; title2: string; title3: string; lede: string; ctaPrimary: string; ctaSecondary: string; cabinet: string; cabinetNote: string };
  stats: string[];
  about: { kicker: string; title: string; titleEm: string; visionLabel: string; visionRef: string };
  values: { title: string; body: string }[];
  ach: { kicker: string; title: string; titleEm: string; sub: string; certToggle: string; certCount: string; note: string };
  com: { kicker: string; title: string; titleEm: string; sub: string; games: string; ranks: string; faculties: string; note: string };
  officers: { kicker: string; title: string; titleEm: string; president: string; secretary: string; treasurer: string; division: string; coordinator: string };
  legal: { kicker: string; title: string; titleEm: string; sub: string; secretariat: string; address: string; email: string; decree: string; charter: string; proposal: string; proposalVal: string; term: string; note: string };
  cta: { kicker: string; title: string; titleEm: string; lede: string; register: string; instagram: string; bcc: string };
  footer: { contact: string; links: string; phone: string; whatsapp: string };
  a11y: { theme: string; language: string };
};

const id: Dict = {
  nav: { about: "Tentang", achievements: "Prestasi", community: "Komunitas", officers: "Pengurus", legal: "Legalitas", contact: "Kontak", deck: "Profil Organisasi", register: "Daftar Anggota", menu: "Menu" },
  hero: {
    title1: "Unit kegiatan", title2: "mahasiswa e-sport", title3: "Atma Jaya Makassar.",
    lede: "UKM E-Sport pertama yang lahir dari mahasiswa FTI, kini menaungi komunitas lintas fakultas dan divisi Web3 UAJM BCC.",
    ctaPrimary: "Daftar Anggota 2026/2027", ctaSecondary: "Lihat prestasi",
    cabinet: "Lemari Trofi", cabinetNote: "Titans Organizer, Mobile Legends Championship",
  },
  stats: ["Anggota terdaftar", "Gelar turnamen 1v1", "Divisi aktif", "Divisi Web3 (BCC)"],
  about: { kicker: "Visi & Misi", title: "Visi dan misi", titleEm: "organisasi", visionLabel: "Visi", visionRef: "AD/ART Pasal 6 · SK No. 002/XII/2025" },
  values: [
    { title: "Edukatif", body: "Bermain sebagai sarana belajar disiplin, strategi, dan manajemen waktu." },
    { title: "Sportif", body: "Etika kompetitif dan rasa hormat pada lawan di atas segalanya." },
    { title: "Kolaboratif", body: "Kerja sama tim lintas fakultas dan lintas peran." },
    { title: "Berkelanjutan", body: "Kepengurusan terstruktur yang menjaga kesinambungan antar-periode." },
  ],
  ach: {
    kicker: "Prestasi", title: "Tiga gelar 1v1", titleEm: "Mobile Legends",
    sub: "Tiga gelar 1v1 Mobile Legends dari Titans Organizer: Fighter, Marksman, dan Assassin.",
    certToggle: "Lihat sertifikat", certCount: "dokumen asli tersimpan",
    note: "Klik untuk memperbesar dan memeriksa.",
  },
  com: {
    kicker: "Komunitas", title: "15 anggota,", titleEm: "tiga fakultas",
    sub: "Komposisi game dan rank tertinggi dari data pendaftaran resmi, lintas tiga fakultas.",
    games: "Game paling dimainkan", ranks: "Rank tertinggi anggota", faculties: "Lintas fakultas",
    note: "Data agregat dari formulir pendaftaran resmi. Identitas anggota tidak dipublikasikan.",
  },
  officers: {
    kicker: "Pengurus", title: "Kepengurusan periode", titleEm: "2025/2026",
    president: "Ketua Umum", secretary: "Sekretaris", treasurer: "Bendahara",
    division: "Divisi", coordinator: "Koordinator",
  },
  legal: {
    kicker: "Legalitas", title: "Kop surat dan", titleEm: "dasar hukum",
    sub: "Identitas persuratan resmi organisasi beserta dasar hukum penetapannya.",
    secretariat: "Sekretariat", address: "Alamat", email: "Email",
    decree: "SK Kepengurusan", charter: "SK Penetapan AD/ART",
    proposal: "Proposal Pembentukan", proposalVal: "Disahkan 10 Juni 2025", term: "Periode Kepengurusan",
    note: "Disalin persis dari kop surat resmi pada dokumen SK dan AD/ART UKM E-Sport UAJM.",
  },
  cta: {
    kicker: "Pendaftaran Anggota 2026/2027", title: "Pendaftaran anggota", titleEm: "dibuka",
    lede: "Mahasiswa UAJM yang ingin berkompetisi, berlatih, atau membangun komunitas, silakan mendaftar sebagai anggota UKM E-Sport.",
    register: "Daftar Anggota 2026/2027", instagram: "Instagram @uajm_esport", bcc: "Divisi Web3 (BCC)",
  },
  footer: { contact: "Sekretariat", links: "Tautan", phone: "Telp", whatsapp: "WhatsApp" },
  a11y: { theme: "Ganti tema", language: "Ganti bahasa" },
};

const en: Dict = {
  nav: { about: "About", achievements: "Achievements", community: "Community", officers: "Board", legal: "Legal", contact: "Contact", deck: "Organisation Profile", register: "Register", menu: "Menu" },
  hero: {
    title1: "The student", title2: "e-sport unit of", title3: "Atma Jaya Makassar.",
    lede: "The first student e-sport unit born from the Faculty of Information Technology, now home to a cross-faculty community and the UAJM BCC Web3 division.",
    ctaPrimary: "Register for 2026/2027", ctaSecondary: "See achievements",
    cabinet: "Trophy Cabinet", cabinetNote: "Titans Organizer, Mobile Legends Championship",
  },
  stats: ["Registered members", "1v1 tournament titles", "Active divisions", "Web3 division (BCC)"],
  about: { kicker: "Vision & Mission", title: "Vision and", titleEm: "mission", visionLabel: "Vision", visionRef: "Charter Article 6 · Decree No. 002/XII/2025" },
  values: [
    { title: "Educational", body: "Play as a way to learn discipline, strategy, and time management." },
    { title: "Sporting", body: "Competitive ethics and respect for the opponent above everything." },
    { title: "Collaborative", body: "Teamwork across faculties and across roles." },
    { title: "Sustainable", body: "A structured board that carries continuity between terms." },
  ],
  ach: {
    kicker: "Achievements", title: "Three 1v1", titleEm: "Mobile Legends titles",
    sub: "Three 1v1 Mobile Legends titles from Titans Organizer: Fighter, Marksman, and Assassin.",
    certToggle: "View certificates", certCount: "original documents on file",
    note: "Click to enlarge and inspect.",
  },
  com: {
    kicker: "Community", title: "15 members,", titleEm: "three faculties",
    sub: "Game mix and highest ranks drawn from official registration data, across three faculties.",
    games: "Most played games", ranks: "Highest member ranks", faculties: "Across faculties",
    note: "Aggregate data from the official registration form. No member identity is published.",
  },
  officers: {
    kicker: "Board", title: "Board for the", titleEm: "2025/2026 term",
    president: "President", secretary: "Secretary", treasurer: "Treasurer",
    division: "Division", coordinator: "Coordinator",
  },
  legal: {
    kicker: "Legal basis", title: "Letterhead and", titleEm: "founding decrees",
    sub: "The organisation's formal correspondence identity and its founding decrees.",
    secretariat: "Secretariat", address: "Address", email: "Email",
    decree: "Board decree", charter: "Charter decree",
    proposal: "Founding proposal", proposalVal: "Approved 10 June 2025", term: "Board term",
    note: "Reproduced exactly from the official letterhead on the UKM E-Sport UAJM decree and charter documents.",
  },
  cta: {
    kicker: "Membership 2026/2027", title: "Membership", titleEm: "registration is open",
    lede: "UAJM students who want to compete, train, or help build the community are welcome to register as members of UKM E-Sport.",
    register: "Register for 2026/2027", instagram: "Instagram @uajm_esport", bcc: "Web3 division (BCC)",
  },
  footer: { contact: "Secretariat", links: "Links", phone: "Tel", whatsapp: "WhatsApp" },
  a11y: { theme: "Toggle theme", language: "Change language" },
};

const zh: Dict = {
  ...en,
  nav: { about: "关于", achievements: "成绩", community: "社群", officers: "干部", legal: "合法性", contact: "联系", deck: "组织简介", register: "报名", menu: "菜单" },
  hero: { ...en.hero, title1: "正式。", title2: "有组织。", title3: "有竞争力。",
    lede: "由信息技术学院学生创立的首个电竞学生组织，如今涵盖跨院系社群与 UAJM BCC Web3 部门。",
    ctaPrimary: "报名 2026/2027", ctaSecondary: "查看成绩", cabinet: "奖杯陈列" },
  stats: ["注册成员", "1v1 赛事冠军", "活跃部门", "Web3 部门"],
  about: { ...en.about, kicker: "愿景与使命", title: "正式的", titleEm: "平台", visionLabel: "愿景" },
  ach: { ...en.ach, kicker: "成绩", title: "经得起", titleEm: "验证", certToggle: "查看证书", certCount: "份原始文件" },
  com: { ...en.com, kicker: "社群", title: "一个俱乐部，", titleEm: "多个赛场", games: "最常玩的游戏", ranks: "成员最高段位", faculties: "跨院系" },
  officers: { ...en.officers, kicker: "干部 2025/2026", title: "组织", titleEm: "架构", division: "部门", coordinator: "协调员" },
  legal: { ...en.legal, kicker: "合法性", title: "正式", titleEm: "信头" },
  cta: { ...en.cta, title: "是时候", titleEm: "升级了" },
  a11y: { theme: "切换主题", language: "切换语言" },
};

const ja: Dict = {
  ...en,
  nav: { about: "概要", achievements: "実績", community: "コミュニティ", officers: "役員", legal: "法的根拠", contact: "連絡先", deck: "団体概要", register: "登録", menu: "メニュー" },
  hero: { ...en.hero, title1: "公式。", title2: "組織的。", title3: "競技志向。",
    lede: "情報技術学部の学生から生まれた最初の e スポーツ団体。現在は学部横断のコミュニティと UAJM BCC の Web3 部門を擁します。",
    ctaPrimary: "2026/2027 登録", ctaSecondary: "実績を見る", cabinet: "トロフィー棚" },
  stats: ["登録メンバー", "1v1 優勝タイトル", "活動部門", "Web3 部門"],
  about: { ...en.about, kicker: "ビジョンとミッション", title: "公式の", titleEm: "受け皿", visionLabel: "ビジョン" },
  ach: { ...en.ach, kicker: "実績", title: "証明された", titleEm: "タイトル", certToggle: "証書を見る", certCount: "件の原本を保管" },
  com: { ...en.com, kicker: "コミュニティ", title: "一つのクラブ、", titleEm: "多くの舞台", games: "よく遊ばれるゲーム", ranks: "メンバー最高ランク", faculties: "学部横断" },
  officers: { ...en.officers, kicker: "役員 2025/2026", title: "組織", titleEm: "体制", division: "部門", coordinator: "コーディネーター" },
  legal: { ...en.legal, kicker: "法的根拠", title: "公式", titleEm: "レターヘッド" },
  cta: { ...en.cta, title: "次の", titleEm: "ステージへ" },
  a11y: { theme: "テーマ切り替え", language: "言語切り替え" },
};

const ko: Dict = {
  ...en,
  nav: { about: "소개", achievements: "성과", community: "커뮤니티", officers: "임원", legal: "법적 근거", contact: "문의", deck: "단체 소개", register: "가입", menu: "메뉴" },
  hero: { ...en.hero, title1: "공식.", title2: "체계적.", title3: "경쟁적.",
    lede: "정보기술학부 학생들이 만든 최초의 e스포츠 단체로, 현재 학부를 아우르는 커뮤니티와 UAJM BCC Web3 부문을 운영합니다.",
    ctaPrimary: "2026/2027 가입", ctaSecondary: "성과 보기", cabinet: "트로피 진열장" },
  stats: ["등록 회원", "1v1 우승 타이틀", "활동 부문", "Web3 부문"],
  about: { ...en.about, kicker: "비전과 미션", title: "공식", titleEm: "기반", visionLabel: "비전" },
  ach: { ...en.ach, kicker: "성과", title: "입증된", titleEm: "타이틀", certToggle: "증서 보기", certCount: "건의 원본 보관" },
  com: { ...en.com, kicker: "커뮤니티", title: "하나의 클럽,", titleEm: "여러 무대", games: "가장 많이 하는 게임", ranks: "회원 최고 랭크", faculties: "학부 전반" },
  officers: { ...en.officers, kicker: "임원 2025/2026", title: "조직", titleEm: "구조", division: "부문", coordinator: "코디네이터" },
  legal: { ...en.legal, kicker: "법적 근거", title: "공식", titleEm: "레터헤드" },
  cta: { ...en.cta, title: "이제", titleEm: "레벨 업" },
  a11y: { theme: "테마 전환", language: "언어 변경" },
};

const es: Dict = {
  ...en,
  nav: { about: "Nosotros", achievements: "Logros", community: "Comunidad", officers: "Directiva", legal: "Legalidad", contact: "Contacto", deck: "Perfil de la organización", register: "Inscribirse", menu: "Menú" },
  hero: { ...en.hero, title1: "Oficial.", title2: "Estructurado.", title3: "Competitivo.",
    lede: "La primera unidad estudiantil de e-sport nacida en la Facultad de Tecnología de la Información, hoy sede de una comunidad multifacultad y de la división Web3 UAJM BCC.",
    ctaPrimary: "Inscríbete 2026/2027", ctaSecondary: "Ver logros", cabinet: "Vitrina de trofeos" },
  stats: ["Miembros inscritos", "Títulos 1v1", "Divisiones activas", "División Web3"],
  about: { ...en.about, kicker: "Visión y misión", title: "Un espacio", titleEm: "oficial", visionLabel: "Visión" },
  ach: { ...en.ach, kicker: "Logros", title: "Títulos", titleEm: "comprobados", certToggle: "Ver certificados", certCount: "documentos originales en archivo" },
  com: { ...en.com, kicker: "Comunidad", title: "Un club,", titleEm: "muchas arenas", games: "Juegos más jugados", ranks: "Rangos más altos", faculties: "Entre facultades" },
  officers: { ...en.officers, kicker: "Directiva 2025/2026", title: "Estructura", titleEm: "organizativa", division: "División", coordinator: "Coordinador" },
  legal: { ...en.legal, kicker: "Legalidad", title: "Membrete", titleEm: "oficial" },
  cta: { ...en.cta, title: "Es hora de", titleEm: "subir de nivel" },
  a11y: { theme: "Cambiar tema", language: "Cambiar idioma" },
};

const fr: Dict = {
  ...en,
  nav: { about: "À propos", achievements: "Palmarès", community: "Communauté", officers: "Bureau", legal: "Légalité", contact: "Contact", deck: "Profil de l'association", register: "S'inscrire", menu: "Menu" },
  hero: { ...en.hero, title1: "Officiel.", title2: "Structuré.", title3: "Compétitif.",
    lede: "La première association étudiante d'e-sport née de la Faculté des technologies de l'information, qui réunit aujourd'hui une communauté pluridisciplinaire et la division Web3 UAJM BCC.",
    ctaPrimary: "S'inscrire 2026/2027", ctaSecondary: "Voir le palmarès", cabinet: "Vitrine des trophées" },
  stats: ["Membres inscrits", "Titres 1v1", "Divisions actives", "Division Web3"],
  about: { ...en.about, kicker: "Vision et mission", title: "Un cadre", titleEm: "officiel", visionLabel: "Vision" },
  ach: { ...en.ach, kicker: "Palmarès", title: "Des titres", titleEm: "vérifiables", certToggle: "Voir les certificats", certCount: "documents originaux archivés" },
  com: { ...en.com, kicker: "Communauté", title: "Un club,", titleEm: "plusieurs arènes", games: "Jeux les plus pratiqués", ranks: "Rangs les plus élevés", faculties: "Entre facultés" },
  officers: { ...en.officers, kicker: "Bureau 2025/2026", title: "Structure", titleEm: "de l'association", division: "Division", coordinator: "Coordinateur" },
  legal: { ...en.legal, kicker: "Légalité", title: "En-tête", titleEm: "officiel" },
  cta: { ...en.cta, title: "Il est temps de", titleEm: "passer au niveau supérieur" },
  a11y: { theme: "Changer de thème", language: "Changer de langue" },
};

const de: Dict = {
  ...en,
  nav: { about: "Über uns", achievements: "Erfolge", community: "Community", officers: "Vorstand", legal: "Rechtsgrundlage", contact: "Kontakt", deck: "Organisationsprofil", register: "Anmelden", menu: "Menü" },
  hero: { ...en.hero, title1: "Offiziell.", title2: "Strukturiert.", title3: "Wettbewerbsstark.",
    lede: "Die erste studentische E-Sport-Gruppe aus der Fakultät für Informationstechnologie, heute Heimat einer fakultätsübergreifenden Community und der Web3-Abteilung UAJM BCC.",
    ctaPrimary: "Anmelden 2026/2027", ctaSecondary: "Erfolge ansehen", cabinet: "Pokalvitrine" },
  stats: ["Registrierte Mitglieder", "1v1-Titel", "Aktive Abteilungen", "Web3-Abteilung"],
  about: { ...en.about, kicker: "Vision und Mission", title: "Ein offizieller", titleEm: "Rahmen", visionLabel: "Vision" },
  ach: { ...en.ach, kicker: "Erfolge", title: "Titel, die", titleEm: "belegt sind", certToggle: "Zertifikate ansehen", certCount: "Originaldokumente archiviert" },
  com: { ...en.com, kicker: "Community", title: "Ein Klub,", titleEm: "viele Arenen", games: "Meistgespielte Spiele", ranks: "Höchste Ränge", faculties: "Fakultätsübergreifend" },
  officers: { ...en.officers, kicker: "Vorstand 2025/2026", title: "Organisations", titleEm: "struktur", division: "Abteilung", coordinator: "Koordinator" },
  legal: { ...en.legal, kicker: "Rechtsgrundlage", title: "Offizieller", titleEm: "Briefkopf" },
  cta: { ...en.cta, title: "Zeit für das", titleEm: "nächste Level" },
  a11y: { theme: "Thema wechseln", language: "Sprache wechseln" },
};

const pt: Dict = {
  ...en,
  nav: { about: "Sobre", achievements: "Conquistas", community: "Comunidade", officers: "Diretoria", legal: "Legalidade", contact: "Contato", deck: "Perfil da organização", register: "Inscrever-se", menu: "Menu" },
  hero: { ...en.hero, title1: "Oficial.", title2: "Estruturado.", title3: "Competitivo.",
    lede: "A primeira entidade estudantil de e-sport nascida na Faculdade de Tecnologia da Informação, hoje lar de uma comunidade multifacultativa e da divisão Web3 UAJM BCC.",
    ctaPrimary: "Inscreva-se 2026/2027", ctaSecondary: "Ver conquistas", cabinet: "Vitrine de troféus" },
  stats: ["Membros inscritos", "Títulos 1v1", "Divisões ativas", "Divisão Web3"],
  about: { ...en.about, kicker: "Visão e missão", title: "Um espaço", titleEm: "oficial", visionLabel: "Visão" },
  ach: { ...en.ach, kicker: "Conquistas", title: "Títulos", titleEm: "comprovados", certToggle: "Ver certificados", certCount: "documentos originais arquivados" },
  com: { ...en.com, kicker: "Comunidade", title: "Um clube,", titleEm: "muitas arenas", games: "Jogos mais jogados", ranks: "Ranques mais altos", faculties: "Entre faculdades" },
  officers: { ...en.officers, kicker: "Diretoria 2025/2026", title: "Estrutura", titleEm: "organizacional", division: "Divisão", coordinator: "Coordenador" },
  legal: { ...en.legal, kicker: "Legalidade", title: "Papel timbrado", titleEm: "oficial" },
  cta: { ...en.cta, title: "Hora de", titleEm: "subir de nível" },
  a11y: { theme: "Alternar tema", language: "Mudar idioma" },
};

const ar: Dict = {
  ...en,
  nav: { about: "عن الوحدة", achievements: "الإنجازات", community: "المجتمع", officers: "الإدارة", legal: "الأساس القانوني", contact: "التواصل", deck: "ملف المنظمة", register: "التسجيل", menu: "القائمة" },
  hero: { ...en.hero, title1: "رسمي.", title2: "منظّم.", title3: "تنافسي.",
    lede: "أول وحدة طلابية للرياضات الإلكترونية انطلقت من كلية تقنية المعلومات، وتضم اليوم مجتمعاً من مختلف الكليات وقسم Web3 التابع لـ UAJM BCC.",
    ctaPrimary: "سجّل 2026/2027", ctaSecondary: "اطّلع على الإنجازات", cabinet: "خزانة الكؤوس" },
  stats: ["الأعضاء المسجّلون", "ألقاب الفردي", "الأقسام النشطة", "قسم Web3"],
  about: { ...en.about, kicker: "الرؤية والرسالة", title: "إطار", titleEm: "رسمي", visionLabel: "الرؤية" },
  ach: { ...en.ach, kicker: "الإنجازات", title: "ألقاب", titleEm: "موثّقة", certToggle: "عرض الشهادات", certCount: "وثيقة أصلية محفوظة" },
  com: { ...en.com, kicker: "المجتمع", title: "ناد واحد،", titleEm: "ساحات متعددة", games: "أكثر الألعاب ممارسة", ranks: "أعلى الرتب", faculties: "عبر الكليات" },
  officers: { ...en.officers, kicker: "الإدارة 2025/2026", title: "الهيكل", titleEm: "التنظيمي", division: "قسم", coordinator: "منسّق" },
  legal: { ...en.legal, kicker: "الأساس القانوني", title: "ترويسة", titleEm: "رسمية" },
  cta: { ...en.cta, title: "حان وقت", titleEm: "الارتقاء" },
  a11y: { theme: "تبديل السمة", language: "تغيير اللغة" },
};

export const DICTS: Record<Locale, Dict> = { id, en, zh, ja, ko, es, fr, de, pt, ar };
