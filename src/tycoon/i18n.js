/**
 * Comprehensive Localization (i18n) Engine
 * Full bilingual support: Indonesian (id) & English (en)
 * Zero external libraries • Instant real-time language switching
 */

export const TRANSLATIONS = {
  id: {
    // Navigation Tabs
    tab_hq: 'Markas Kantor 2D',
    tab_stocks: 'Bursa Saham',
    tab_companies: 'Perusahaan Global',
    tab_equity: 'Ekuitas & Investor',
    tab_csuite: 'Pegawai',
    tab_products: 'Produk Device',
    tab_rnd: 'R&D & Paten',

    // Workforce & Pegawai Tab
    wf_title: 'Struktur Organisasi & Manajemen Pegawai',
    wf_sub: 'Hierarki Korporat 4 Tingkat: Dewan Eksekutif, Kepala Divisi, Tenaga Ahli, & Staf Pelaksana',
    wf_kpi_headcount: 'Total Tenaga Kerja',
    wf_kpi_payroll: 'Total Beban Payroll',
    wf_kpi_morale: 'Rata-rata Moral',
    wf_kpi_recruiting: 'Rekrutmen Terbuka',
    wf_kpi_efficiency: 'Efisiensi Operasional',
    wf_tier_1: 'TINGKAT 1: DEWAN DIREKSI & C-SUITE (5 KURSI)',
    wf_tier_1_sub: 'Pimpinan Tertinggi & Pembuat Kebijakan Strategis Korporasi',
    wf_tier_2: 'TINGKAT 2: KEPALA DIVISI & DIREKTUR BIDANG (5 DIVISI)',
    wf_tier_2_sub: 'Manajemen Menengah, Pimpinan Unit Bisnis, & HRD',
    wf_tier_3: 'TINGKAT 3: KARYAWAN SENIOR & TENAGA AHLI',
    wf_tier_3_sub: 'Spesialis Teknis, Arsitek Sistem, & Penggerak Pertumbuhan',
    wf_tier_4: 'TINGKAT 4: KARYAWAN JUNIOR & STAF PELAKSANA',
    wf_tier_4_sub: 'Staf Operasional, Tim Pendukung, & Pelaksana Harian',
    wf_quota: 'Jumlah / Kuota',
    wf_salary_tier: 'Rentang Gaji',
    wf_recruitment: 'Status Rekrutmen',
    wf_open: 'TERBUKA',
    wf_closed: 'DITUTUP',
    wf_budget: 'Hemat',
    wf_market: 'Pasar',
    wf_elite: 'Elit',
    wf_hire_btn: 'Rekrut',
    wf_fire_btn: 'Pemberhentian',

    // Header Financials
    hdr_cash: 'Kas Likuid',
    hdr_cash_short: 'KAS:',
    hdr_cashflow: 'Arus Kas/Bln',
    hdr_cashflow_short: 'ARUS:',
    hdr_valuation: 'Valuasi Pasar',
    hdr_val_short: 'VAL:',
    hdr_share_price: 'Harga Saham',
    hdr_price_short: 'SAHAM:',
    hdr_founder_stake: 'Saham Pendiri',
    hdr_founder_short: 'PENDIRI:',
    hdr_majority: '(Mayoritas)',
    hdr_minority: '(Minoritas)',

    // Header Controls & Tooltips
    btn_return: 'Kembali ke Beranda',
    btn_customize: 'Kustomisasi Profil Korporat',
    btn_pause: 'Jeda Simulasi',
    btn_speed_1: '1x Kecepatan Normal',
    btn_speed_2: '2x Cepat',
    btn_speed_5: '5x Ultra Cepat',
    btn_sound_mute: 'Matikan Audio',
    btn_sound_unmute: 'Nyalakan Audio',
    btn_ipo: 'IPO Bursa',
    btn_ipo_tooltip: 'Melantai di Bursa Efek (Initial Public Offering)',
    badge_public: 'PUBLIK',
    badge_public_tooltip: 'Status: Terdaftar Publik di Bursa Efek',
    btn_collapse: 'Kecilkan Bar',
    btn_expand: 'Perbesar Bar',
    btn_collapse_tooltip: 'Ciutkan Bar Teratas untuk Menghemat Layar',
    btn_expand_tooltip: 'Perbesar Bar Teratas untuk Menampilkan Seluruh Metrik',

    // HQ Markas Tab
    hq_title: 'DENAH MARKAS KORPORAT 2D',
    hq_subtitle: 'Klik Ruangan / Karyawan AI untuk Interaksi Langsung',
    hq_feed_title: 'FEED INTERNAL',
    hq_memo_placeholder: 'Kirim memo dewan direksi...',
    hq_memo_send: 'Kirim',
    hq_sprint_title: 'Eksekusi Sprint Rekayasa',
    hq_sprint_action: 'Mulai DevOps Sprint',

    // Stocks Tab
    stk_title: 'Terminal Pasar Modal & Indeks Global',
    stk_order_book: 'Buku Pesanan (Order Book)',
    stk_buy: 'Beli Saham',
    stk_sell: 'Jual Saham',
    stk_shares: 'Lembar',
    stk_total: 'Estimasi Total',
    stk_volume: 'Volume',
    stk_market_cap: 'Kapitalisasi Pasar',

    // Companies Tab
    cmp_title: 'Direktori 20 Konglomerasi Global',
    cmp_search_placeholder: 'Cari korporasi / kode ticker...',
    cmp_filter_all: 'Semua Sektor',
    cmp_sort_cap: 'Valuasi Tertinggi',
    cmp_sort_price: 'Harga Tertinggi',
    cmp_sort_change: 'Perubahan Harian',
    cmp_sort_tech: 'Level Teknologi',
    cmp_sort_stake: 'Kepemilikan Saham',
    cmp_dossier_btn: 'Buka Dossier',
    cmp_player_badge: 'Perusahaan Anda',

    // Equity Tab
    eq_title: 'Struktur Permodalan & Tabel Cap (Cap Table)',
    eq_founder: 'Saham Pendiri (Founder)',
    eq_investor: 'Investor Eksternal',
    eq_esop: 'Pool Opsi Saham Karyawan (ESOP)',
    eq_public: 'Investor Publik (Free Float)',
    eq_inbound_offers: 'Penawaran Term Sheet Investor Masuk',
    eq_no_offers: 'Belum ada tawaran aktif. Tingkatkan reputasi dan valuasi untuk menarik pemodal ventura.',
    eq_accept: 'Terima Penawaran',
    eq_reject: 'Tolak',
    eq_counter: 'Tawar Valuasi',

    // C-Suite Tab
    cs_title: 'Jajaran Eksekutif & Manajemen Kunci',
    cs_candidates: 'Kolam Kandidat C-Suite Tersedia',
    cs_hire: 'Rekrut Eksekutif',
    cs_fire: 'Pecat dari Jabatan',
    cs_salary: 'Gaji Pokok Bulanan',
    cs_equity_grant: 'Alokasi Saham ESOP',

    // R&D Tab
    rnd_title: 'Pohon Teknologi & Laboratorium Paten',
    rnd_points: 'Poin Riset Korporat',
    rnd_deploy: 'Riset & Terapkan',
    rnd_unlocked: 'Selesai Diterapkan',
    rnd_locked: 'Terkunci',

    // Settings Modal
    set_title: 'Pengaturan Sistem & Preferensi',
    set_sub: 'Hanya dapat diakses khusus melalui shortcut keyboard S+T.',
    set_theme_title: 'Warna Tema & Atmosfer Tampilan',
    set_theme_current: 'Tema Saat Ini:',
    set_lang_title: 'Bahasa Antarmuka',
    set_reset_title: 'Mulai Dari Awal / Reset Total Permainan',
    set_reset_desc: 'Menghapus data profil perusahaan, kas, valuasi pasar, dan portofolio saham, lalu membuka kembali Start Screen pendirian korporasi dengan 100% kepemilikan pendiri.',
    set_reset_btn: 'Reset & Mulai Dari Awal',
    set_reset_confirm_q: 'Apakah Anda yakin ingin mereset seluruh data? Tindakan ini tidak dapat dibatalkan.',
    set_reset_yes: 'Ya, Reset Sekarang',
    set_reset_cancel: 'Batalkan',
    set_close: 'Tutup',
    set_active: 'Aktif',

    // Start Screen Modal
    start_title: 'Pendirian Korporasi & Profil Bisnis',
    start_sub: 'Kustomisasi identitas perusahaan awal Anda sebelum melantai di panggung pasar modal global 2026.',
    start_name_label: 'Nama Resmi Perusahaan (Corporate Brand Name):',
    start_name_placeholder: 'Contoh: AETHER DYNAMICS CORP',
    start_sector_label: 'Bidang Industri & Spesialisasi Bisnis:',
    start_ticker_label: 'Kode Saham Ticker (Maksimal 4 Karakter):',
    start_ticker_hint: '2 - 4 HURUF KAPITAL',
    start_preview_title: 'Pratinjau Kartu Korporasi Anda:',
    start_equity_badge: 'Kepemilikan Saham Awal:',
    start_equity_text: '100.0% Pendiri (Mandiri & Bebas Dilusi)',
    start_btn_launch: 'Luncurkan Korporasi & Mulai Simulasi',
    start_btn_save: 'Simpan Profil & Perbarui Sistem',

    // Footer
    footer_tagline: 'Simulasi Konglomerasi Bisnis & Pasar Modal 2D Ultra-Ringan (Khusus Desktop/Laptop 16:9)',
  },

  en: {
    // Navigation Tabs
    tab_hq: '2D Corporate HQ',
    tab_stocks: 'Stock Market',
    tab_companies: 'Global Enterprises',
    tab_equity: 'Equity & Investors',
    tab_csuite: 'Workforce',
    tab_products: 'Products',
    tab_rnd: 'R&D & Patents',

    // Workforce Tab
    wf_title: 'Organizational Structure & Workforce Management',
    wf_sub: '4-Tier Corporate Hierarchy: Executive Board, Division Heads, Senior Specialists, & Junior Staff',
    wf_kpi_headcount: 'Total Workforce',
    wf_kpi_payroll: 'Total Payroll Expense',
    wf_kpi_morale: 'Avg Morale',
    wf_kpi_recruiting: 'Open Recruitment',
    wf_kpi_efficiency: 'Operational Efficiency',
    wf_tier_1: 'TIER 1: BOARD OF DIRECTORS & C-SUITE (5 SEATS)',
    wf_tier_1_sub: 'Top Leadership & Strategic Corporate Policy Makers',
    wf_tier_2: 'TIER 2: DIVISION HEADS & DEPARTMENT DIRECTORS (5 UNITS)',
    wf_tier_2_sub: 'Middle Management, Business Unit Leaders, & HRD',
    wf_tier_3: 'TIER 3: SENIOR EMPLOYEES & SPECIALISTS',
    wf_tier_3_sub: 'Technical Specialists, System Architects, & Growth Drivers',
    wf_tier_4: 'TIER 4: JUNIOR EMPLOYEES & OPERATIONAL STAFF',
    wf_tier_4_sub: 'Operational Associates, Support Crew, & Day-to-Day Staff',
    wf_quota: 'Headcount / Quota',
    wf_salary_tier: 'Salary Tier',
    wf_recruitment: 'Recruitment Status',
    wf_open: 'OPEN',
    wf_closed: 'CLOSED',
    wf_budget: 'Budget',
    wf_market: 'Market',
    wf_elite: 'Elite',
    wf_hire_btn: 'Hire',
    wf_fire_btn: 'Terminate',

    // Header Financials
    hdr_cash: 'Liquid Cash',
    hdr_cash_short: 'CASH:',
    hdr_cashflow: 'Net Cashflow/Mo',
    hdr_cashflow_short: 'FLOW:',
    hdr_valuation: 'Enterprise Valuation',
    hdr_val_short: 'VAL:',
    hdr_share_price: 'Share Price',
    hdr_price_short: 'PRICE:',
    hdr_founder_stake: 'Founder Stake',
    hdr_founder_short: 'FOUNDER:',
    hdr_majority: '(Majority)',
    hdr_minority: '(Minority)',

    // Header Controls & Tooltips
    btn_return: 'Return to Home',
    btn_customize: 'Customize Corporate Profile',
    btn_pause: 'Pause Simulation',
    btn_speed_1: '1x Normal Speed',
    btn_speed_2: '2x Fast Speed',
    btn_speed_5: '5x Ultra Speed',
    btn_sound_mute: 'Mute Audio',
    btn_sound_unmute: 'Unmute Audio',
    btn_ipo: 'Public IPO',
    btn_ipo_tooltip: 'Launch Initial Public Offering (IPO)',
    badge_public: 'PUBLIC',
    badge_public_tooltip: 'Status: Officially Listed on Public Stock Exchange',
    btn_collapse: 'Collapse Bar',
    btn_expand: 'Expand Bar',
    btn_collapse_tooltip: 'Collapse Top Bar to Maximize Screen Workspace',
    btn_expand_tooltip: 'Expand Top Bar to View All Metrics',

    // HQ Markas Tab
    hq_title: '2D CORPORATE HEADQUARTERS BLUEPRINT',
    hq_subtitle: 'Click Any Room / AI Personnel for Direct Interaction',
    hq_feed_title: 'INTERNAL DIRECTIVES',
    hq_memo_placeholder: 'Broadcast board directive memo...',
    hq_memo_send: 'Send',
    hq_sprint_title: 'Engineering Sprint Execution',
    hq_sprint_action: 'Execute DevOps Sprint',

    // Stocks Tab
    stk_title: 'Global Capital Markets & Securities Terminal',
    stk_order_book: 'Order Book & Market Depth',
    stk_buy: 'Buy Shares',
    stk_sell: 'Sell Shares',
    stk_shares: 'Shares',
    stk_total: 'Estimated Total',
    stk_volume: '24h Volume',
    stk_market_cap: 'Market Capitalization',

    // Companies Tab
    cmp_title: 'Directory of 20 Global Enterprises',
    cmp_search_placeholder: 'Search enterprise or ticker symbol...',
    cmp_filter_all: 'All Sectors',
    cmp_sort_cap: 'Highest Valuation',
    cmp_sort_price: 'Highest Price',
    cmp_sort_change: 'Daily Change',
    cmp_sort_tech: 'Technology Level',
    cmp_sort_stake: 'Your Shareholding',
    cmp_dossier_btn: 'Open Dossier',
    cmp_player_badge: 'Your Corporation',

    // Equity Tab
    eq_title: 'Capital Structure & Capitalization Table (Cap Table)',
    eq_founder: 'Founder Equity',
    eq_investor: 'External Institutional Investors',
    eq_esop: 'Employee Stock Option Pool (ESOP)',
    eq_public: 'Public Free Float',
    eq_inbound_offers: 'Inbound Term Sheet Offers',
    eq_no_offers: 'No active offers. Elevate corporate reputation and valuation to attract venture capital.',
    eq_accept: 'Accept Term Sheet',
    eq_reject: 'Decline',
    eq_counter: 'Counter Valuation',

    // C-Suite Tab
    cs_title: 'Executive Leadership & Key Management',
    cs_candidates: 'Available C-Suite Candidates',
    cs_hire: 'Appoint Executive',
    cs_fire: 'Dismiss from Post',
    cs_salary: 'Monthly Base Payroll',
    cs_equity_grant: 'ESOP Equity Grant',

    // R&D Tab
    rnd_title: 'Corporate Technology Tree & Patent Lab',
    rnd_points: 'Corporate Research Points',
    rnd_deploy: 'Research & Deploy',
    rnd_unlocked: 'Deployed',
    rnd_locked: 'Locked',

    // Settings Modal
    set_title: 'System Settings & Preferences',
    set_sub: 'Accessible exclusively via keyboard shortcut S + T.',
    set_theme_title: 'Visual Theme Atmosphere',
    set_theme_current: 'Active Theme:',
    set_lang_title: 'Interface Language',
    set_reset_title: 'Start Fresh / Total Corporate Reset',
    set_reset_desc: 'Wipes company profile data, cash, market valuation, and stock portfolio, then re-launches the Start Screen with 100% Founder Equity.',
    set_reset_btn: 'Reset & Start Fresh',
    set_reset_confirm_q: 'Are you sure you want to reset all data? This action cannot be undone.',
    set_reset_yes: 'Yes, Reset Now',
    set_reset_cancel: 'Cancel',
    set_close: 'Close',
    set_active: 'Active',

    // Start Screen Modal
    start_title: 'Corporate Incorporation & Business Profile',
    start_sub: 'Customize your company identity before stepping onto the 2026 global capital markets stage.',
    start_name_label: 'Official Corporate Brand Name:',
    start_name_placeholder: 'e.g. AETHER DYNAMICS CORP',
    start_sector_label: 'Industrial Sector & Core Specialization:',
    start_ticker_label: 'Stock Ticker Symbol (Max 4 Characters):',
    start_ticker_hint: '2 - 4 UPPERCASE LETTERS',
    start_preview_title: 'Your Corporate Card Preview:',
    start_equity_badge: 'Initial Equity Ownership:',
    start_equity_text: '100.0% Founder (Undiluted Sovereign Control)',
    start_btn_launch: 'Launch Corporation & Begin Simulation',
    start_btn_save: 'Save Profile & Update System',

    // Footer
    footer_tagline: 'Ultra-Lightweight 2D Enterprise & Stock Market Tycoon Simulation (Desktop/Laptop 16:9)',
  }
};

export function t(key, lang = 'id') {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['id'];
  return dict[key] || TRANSLATIONS['id'][key] || key;
}

export const SECTOR_OPTIONS = [
  { id: 'Consumer Devices & Perangkat Keras', labelId: 'Consumer Devices (HP, Laptop, Tablet)', labelEn: 'Consumer Devices & Hardware OEM', badge: 'bg-amber-950/80 border-amber-700/80 text-amber-300' },
  { id: 'Kecerdasan Buatan & Komputasi Neural', labelId: 'AI & Komputasi Neural', labelEn: 'AI & Neural Computing', badge: 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300' },
  { id: 'Cloud Skala-Hiper & Keamanan Siber', labelId: 'Cloud Skala-Hiper & Siber', labelEn: 'Hyper-scale Cloud & Cyber', badge: 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300' },
  { id: 'Fabrikasi Semikonduktor & Fotonik', labelId: 'Fabrikasi Semikonduktor & Chip', labelEn: 'Semiconductors & Photonics', badge: 'bg-sky-950/80 border-sky-700/80 text-sky-300' },
  { id: 'Robotika Humanoid & Otomasi Industri', labelId: 'Robotika Humanoid & Otomasi', labelEn: 'Humanoid Robotics & Automation', badge: 'bg-teal-950/80 border-teal-700/80 text-teal-300' },
  { id: 'Bioteknologi & Rekayasa Genomik', labelId: 'Bioteknologi & Rekayasa Genomik', labelEn: 'Biotechnology & Genomics', badge: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300' },
  { id: 'Dirgantara Orbit & Konstelasi Satelit', labelId: 'Dirgantara Orbit & Satelit', labelEn: 'Orbital Aerospace & Satellites', badge: 'bg-purple-950/80 border-purple-700/80 text-purple-300' },
  { id: 'Manufaktur Presisi & Energi Terbarukan', labelId: 'Manufaktur Presisi & Energi Bersih', labelEn: 'Clean Energy & Precision Mfg', badge: 'bg-blue-950/80 border-blue-700/80 text-blue-300' },
  { id: 'Teknologi Finansial & Likuiditas Global', labelId: 'Fintech & Likuiditas Global', labelEn: 'Fintech & Global Liquidity', badge: 'bg-amber-950/80 border-amber-700/80 text-amber-300' },
  { id: 'Logistik Otonom & Ritel Hiper-Cepat', labelId: 'Logistik Otonom & Ritel', labelEn: 'Autonomous Logistics & Retail', badge: 'bg-orange-950/80 border-orange-700/80 text-orange-300' },
  { id: 'Realitas Imersif & Dunia Komputasi', labelId: 'Realitas Imersif & Dunia Komputasi', labelEn: 'Spatial Computing & XR', badge: 'bg-fuchsia-950/80 border-fuchsia-700/80 text-fuchsia-300' },
];
