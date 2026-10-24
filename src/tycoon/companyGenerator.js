/**
 * Custom-Internal Procedural Corporate Universe Generator
 * Pure Vanilla JavaScript • High-Precision Deterministic Financial Simulations.
 * Generates natural, varied, yet logically balanced competitor corporations led by intelligent AI-NPC CEOs.
 */

export function generateInitialCandleHistory(basePrice, count = 24) {
  const history = [];
  const baseTime = Date.now() - count * 60 * 1000;
  let p = basePrice;
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.49) * 0.04;
    const open = p;
    const close = Math.round(Math.max(0.5, p * (1 + change)) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * 0.8) * 100) / 100;
    const low = Math.round((Math.max(0.2, Math.min(open, close) - Math.random() * 0.8)) * 100) / 100;
    history.push({
      timestamp: baseTime + i * 60 * 1000,
      open,
      high,
      low,
      close,
      volume: Math.round(20000 + Math.random() * 60000),
    });
    p = close;
  }
  return history;
}

export const CORPORATE_ARCHETYPES = [
  {
    category: 'manufaktur',
    sector: 'Manufaktur & Energi',
    symbolPool: ['TITN', 'VULK', 'ATLS', 'HYPR', 'KRUP'],
    names: [
      'Titan Heavy Industries',
      'Vulcan Energy & Turbines',
      'Atlas Industrial Metallurgy',
      'Hyperion Heavy Engineering',
      'Krupp Dynamics Power',
    ],
    headquarters: ['Munich, Jerman', 'Zurich, Swiss', 'Frankfurt, Jerman', 'Sheffield, Inggris', 'Eindhoven, Belanda'],
    basePrice: 42.50,
    sharesRange: [8000000, 14000000],
    techLevelRange: [6, 8],
    peRange: [13.5, 17.5],
    dividendRange: [2.8, 4.2],
    marginRange: [0.18, 0.28],
    aiStrategy: 'Defensive Value & Buybacks',
    ceos: [
      {
        name: 'Marcus Vance',
        title: 'Group Chief Executive Officer',
        icon: 'briefcase',
        trait: 'Industrial Patriarch',
        leadership: 91,
        specialty: 93,
        visionQuote: 'Baja, energi, dan logistik berat adalah fondasi fisik peradaban industri.',
      },
      {
        name: 'Elena Rostova',
        title: 'President & Managing Director',
        icon: 'shield',
        trait: 'Heavy Metallurgy Commander',
        leadership: 89,
        specialty: 95,
        visionQuote: 'Ketahanan rantai pasok energi berat menentukan kedaulatan industri global.',
      },
    ],
    descriptions: [
      'Konglomerat manufaktur turbin hidrogen, rekayasa pembangkit daya, dan baja presisi.',
      'Raksasa manufaktur alat berat, komponen turbin nuklir, dan sistem peleburan logam masa depan.',
    ],
    moves: [
      'Mengesahkan ekspansi fasilitas manufaktur turbin hidrogen terbarukan.',
      'Mengamankan kontrak pasokan komponen turbin termal ke 12 negara industri.',
    ],
  },
  {
    category: 'ai',
    sector: 'Kecerdasan Buatan & Komputasi',
    symbolPool: ['QNTM', 'AXON', 'SING', 'CORT', 'TNSR'],
    names: [
      'Quantum AI Systems',
      'Axon Neuromorphic Labs',
      'Singularity Cognitive Computing',
      'Cortex Deep Intelligence',
      'Tensor Neural Dynamics',
    ],
    headquarters: ['San Francisco, USA', 'Toronto, Kanada', 'Cambridge, Inggris', 'Pangyo, Korea Selatan', 'Boston, USA'],
    basePrice: 118.20,
    sharesRange: [4500000, 7500000],
    techLevelRange: [9, 10],
    peRange: [42.0, 54.0],
    dividendRange: [0.0, 0.5],
    marginRange: [0.22, 0.35],
    aiStrategy: 'R&D Innovation Surge',
    ceos: [
      {
        name: 'Dr. Evelyn Zhao',
        title: 'Chief Scientist & Executive Officer',
        icon: 'brain',
        trait: 'Quantum Deep-Tech Pioneer',
        leadership: 88,
        specialty: 99,
        visionQuote: 'Komputasi klasik telah mencapai limit termodinamika; kuantum adalah satu-satunya lompatan.',
      },
      {
        name: 'Dr. Aris Thorne',
        title: 'Founder & Artificial Intelligence Director',
        icon: 'cpu',
        trait: 'Autonomous AGI Architect',
        leadership: 86,
        specialty: 98,
        visionQuote: 'Sistem penalaran neural multi-modal otonom akan merevolusi setiap disiplin sains modern.',
      },
    ],
    descriptions: [
      'Pionir prosesor kuantum qubit superkonduktor dan fondasi model bahasa neural multi-modal.',
      'Pengembang cluster komputasi neuromorphic berbasis silikon fotonik untuk simulasi skala besar.',
    ],
    moves: [
      'Mengumumkan uji coba jaringan transmisi kuantum terenkripsi anti-sadap.',
      'Meluncurkan superkomputer kuantum generasi baru dengan toleransi error tertinggi.',
    ],
  },
  {
    category: 'cloud',
    sector: 'Infrastruktur Cloud & SaaS',
    symbolPool: ['APEX', 'OBSD', 'STRT', 'VORT', 'CLDN'],
    names: [
      'Apex Cloud Solutions',
      'Obsidian Distributed Cloud',
      'Stratus Enterprise Core',
      'Vortex Mesh Cloud Systems',
      'CloudNet Global Grid',
    ],
    headquarters: ['Seattle, USA', 'Stockholm, Swedia', 'Helsinki, Finlandia', 'Frankfurt, Jerman', 'Denver, USA'],
    basePrice: 76.80,
    sharesRange: [7000000, 11000000],
    techLevelRange: [8, 9],
    peRange: [24.0, 31.0],
    dividendRange: [1.0, 1.8],
    marginRange: [0.25, 0.38],
    aiStrategy: 'High-Margin Expansion',
    ceos: [
      {
        name: 'Henrik Lindqvist',
        title: 'President & CEO',
        icon: 'cloud',
        trait: 'Disciplined Cloud Operator',
        leadership: 87,
        specialty: 91,
        visionQuote: 'Efisiensi beban data senter dan toleransi uptime 99.999% adalah pembeda utama reputasi cloud.',
      },
      {
        name: 'Farah Al-Mansoor',
        title: 'Group Chief Executive Officer',
        icon: 'layers',
        trait: 'Enterprise SaaS Maestro',
        leadership: 90,
        specialty: 89,
        visionQuote: 'Arsitektur terdistribusi multi-cloud menjamin skalabilitas tanpa kompromi performa.',
      },
    ],
    descriptions: [
      'Penyedia jaringan data center ramah lingkungan dan platform orkestrasi microservices enterprise.',
      'Infrastruktur edge computing global dengan latensi sub-milidetik untuk komputasi terdistribusi.',
    ],
    moves: [
      'Mengoperasikan data center baru berpendingin geotermal di kawasan Skandinavia.',
      'Menandatangani kontrak migrasi infrastruktur perbankan global ke platform private cloud.',
    ],
  },
  {
    category: 'cloud',
    sector: 'Keamanan Siber & Kriptografi',
    symbolPool: ['CRUX', 'CYBR', 'AEGS', 'CIPH', 'VULT'],
    names: [
      'Crux CyberSecurity Shield',
      'CyberShield Global Defense',
      'Aegis Cryptographic Labs',
      'CipherLock Zero-Trust Systems',
      'VaultSec Sentinel Group',
    ],
    headquarters: ['Tel Aviv, Israel', 'Washington D.C., USA', 'London, Inggris', 'Singapura', 'Tallinn, Estonia'],
    basePrice: 71.10,
    sharesRange: [6500000, 10000000],
    techLevelRange: [8, 9],
    peRange: [25.0, 32.0],
    dividendRange: [0.8, 1.6],
    marginRange: [0.20, 0.32],
    aiStrategy: 'Zero-Trust Defense Systems',
    ceos: [
      {
        name: 'Viktor Reznov',
        title: 'Managing Director & CEO',
        icon: 'shield',
        trait: 'Offensive Cyber Architect',
        leadership: 93,
        specialty: 96,
        visionQuote: 'Di medan perang digital, pertahanan pasif adalah kekalahan; zero-trust adalah doktrin wajib.',
      },
      {
        name: 'Sarah Stern',
        title: 'Chief Security Officer & CEO',
        icon: 'shieldCheck',
        trait: 'Post-Quantum Defense Strategist',
        leadership: 89,
        specialty: 97,
        visionQuote: 'Enkripsi lattice pasca-kuantum adalah perisai masa depan kedaulatan data finansial.',
      },
    ],
    descriptions: [
      'Protokol enkripsi pasca-kuantum lattice, analisis intrusi honeypot neural, dan forensik siber.',
      'Platform pertahanan ancaman persisten tingkat lanjut dengan isolasi kontainer zero-trust otomatis.',
    ],
    moves: [
      'Menggagalkan serangan peretasan infrastruktur kritis global melalui patching otomatis.',
      'Mendapatkan mandat keamanan siber nasional untuk perlindungan jaringan perbankan sentral.',
    ],
  },
  {
    category: 'dirgantara',
    sector: 'Dirgantara & Peluncuran Antariksa',
    symbolPool: ['AERO', 'ORBT', 'CLST', 'ASTR', 'PLRS'],
    names: [
      'Orbital Dynamics & Defense',
      'AeroSpace Global Propulsion',
      'Celestial Launch Systems',
      'Astra Orbital Logistics',
      'Polaris Heavy Spaceflight',
    ],
    headquarters: ['Houston, USA', 'Toulouse, Prancis', 'Tokyo, Jepang', 'Adelaide, Australia', 'Munich, Jerman'],
    basePrice: 165.40,
    sharesRange: [3500000, 6000000],
    techLevelRange: [8, 10],
    peRange: [28.0, 36.0],
    dividendRange: [1.2, 2.2],
    marginRange: [0.20, 0.30],
    aiStrategy: 'Orbital Fleet Dominance',
    ceos: [
      {
        name: 'Col. Nathaniel Drake',
        title: 'Chief Executive & Fleet Commander',
        icon: 'rocket',
        trait: 'Former Aerospace Fleet Commander',
        leadership: 94,
        specialty: 88,
        visionQuote: 'Orbit rendah bumi adalah koridor logistik paling strategis untuk industri abad 21.',
      },
      {
        name: 'Vivienne Moreau',
        title: 'President & Aerospace Architect',
        icon: 'activity',
        trait: 'Hypersonic Propulsion Pioneer',
        leadership: 91,
        specialty: 93,
        visionQuote: 'Roket pakai-ulang bertenaga metana-cair menurunkan ongkos muatan orbit hingga 90%.',
      },
    ],
    descriptions: [
      'Kendaraan peluncur roket orbit pakai-ulang, propulsi ion satelit, dan pertahanan ruang angkasa.',
      'Infrastruktur kapsul logistik kargo antariksa dan pelindung panas keramik canggih.',
    ],
    moves: [
      'Menuntaskan misi peluncuran roket orbit pakai-ulang ke-50 tanpa anomali struktural.',
      'Memenangkan kontrak armada satelit observasi lingkungan presisi tinggi.',
    ],
  },
  {
    category: 'biotek',
    sector: 'Bioteknologi & Rekayasa Genomik',
    symbolPool: ['BION', 'HLOS', 'GENX', 'ELYS', 'VIVN'],
    names: [
      'Helios Bioceuticals',
      'BioNova Genomic Systems',
      'Genex Longevity Therapeutics',
      'Elysium Cell Technologies',
      'Vivant Proteomics Lab',
    ],
    headquarters: ['Basel, Swiss', 'Boston, USA', 'Oxford, Inggris', 'San Diego, USA', 'Singapura'],
    basePrice: 58.30,
    sharesRange: [9000000, 15000000],
    techLevelRange: [8, 10],
    peRange: [32.0, 44.0],
    dividendRange: [0.5, 1.4],
    marginRange: [0.26, 0.40],
    aiStrategy: 'Therapeutic Breakthroughs',
    ceos: [
      {
        name: 'Dr. Astrid Falk',
        title: 'Managing Director & Chief Scientist',
        icon: 'activity',
        trait: 'Gene Therapy Visionary',
        leadership: 85,
        specialty: 98,
        visionQuote: 'Menulis ulang kode seluler manusia untuk memberantas degenerasi penuaan dan kelainan genetik.',
      },
      {
        name: 'Dr. Soren Nielsen',
        title: 'Founder & CEO',
        icon: 'heart',
        trait: 'Telomere Longevity Pioneer',
        leadership: 88,
        specialty: 96,
        visionQuote: 'Terapi peremajaan mitokondria berbasis mRNA akan menggandakan produktivitas usia dewasa.',
      },
    ],
    descriptions: [
      'Terapi gen in vivo berbasis CRISPR-Cas12, peremajaan telomer, dan formulasi vaksin mRNA.',
      'Platform screening molekuler terkomputasi untuk sintesis antibodi monoklonal spesifik.',
    ],
    moves: [
      'Fase 3 uji klinis terapi gen penyakit langka menunjukkan tingkat keberhasilan 94%.',
      'Mendapatkan persetujuan regulasi global untuk terapi perbaikan jaringan kardiovaskular.',
    ],
  },
  {
    category: 'ai',
    sector: 'Neuroteknologi & Antarmuka Otak',
    symbolPool: ['NEUR', 'SYNP', 'MIND', 'CERE', 'PSYC'],
    names: [
      'NeuroSynapse Tech Labs',
      'Synapse Bio-Neural Systems',
      'MindLink Neuro-Interface',
      'Cerebral Dynamics Corp',
      'Psyche Neural Core',
    ],
    headquarters: ['Zurich, Swiss', 'Austin, USA', 'Kyoto, Jepang', 'Stockholm, Swedia', 'Tel Aviv, Israel'],
    basePrice: 94.70,
    sharesRange: [5000000, 9000000],
    techLevelRange: [9, 10],
    peRange: [38.0, 50.0],
    dividendRange: [0.0, 0.8],
    marginRange: [0.20, 0.34],
    aiStrategy: 'Direct Neural Integration',
    ceos: [
      {
        name: 'Dr. Kenzo Morita',
        title: 'Founder & Chief Neuro-Architect',
        icon: 'brain',
        trait: 'Cortical Interface Master',
        leadership: 89,
        specialty: 97,
        visionQuote: 'Bandwidth komunikasi otak-ke-komputer adalah perbatasan terbesar evolusi kognitif.',
      },
      {
        name: 'Dr. Ingrid Lindholm',
        title: 'CEO & Cognitive Neuroscientist',
        icon: 'activity',
        trait: 'Biocompatible Neural Pioneer',
        leadership: 87,
        specialty: 98,
        visionQuote: 'Elektroda ultra-fleksibel biokompatibel membuka pemulihan motorik total tanpa trauma.',
      },
    ],
    descriptions: [
      'Implan elektroda mikroskopis fleksibel untuk komunikasi otak-ke-komputer berkecepatan tinggi.',
      'Sistem decoding sinyal gelombang motorik untuk kendali prostesis bionik presisi tinggi.',
    ],
    moves: [
      'Uji coba klinis implan kortikal nirkabel berhasil mentransmisikan sinyal ketik tanpa latensi.',
      'Mempublikasikan terobosan elektroda grafena biokompatibel yang dapat diserap jaringan saraf.',
    ],
  },
  {
    category: 'manufaktur',
    sector: 'Baterai & Penyimpanan Energi',
    symbolPool: ['VOLT', 'SOLR', 'FUSN', 'CELL', 'GRID'],
    names: [
      'Voltaic Energy Storage',
      'Solaria Solid-State Dynamics',
      'FusionCell Clean Power',
      'Prometheus Energy Grid',
      'GridCore MegaStorage',
    ],
    headquarters: ['Stockholm, Swedia', 'Nagoya, Jepang', 'Reno, USA', 'Stuttgart, Jerman', 'Daejeon, Korea Selatan'],
    basePrice: 38.90,
    sharesRange: [9000000, 16000000],
    techLevelRange: [7, 9],
    peRange: [20.0, 28.0],
    dividendRange: [1.8, 3.2],
    marginRange: [0.16, 0.26],
    aiStrategy: 'Global Battery Gigafactories',
    ceos: [
      {
        name: 'Amara Okafor',
        title: 'President & Chief Engineer',
        icon: 'zap',
        trait: 'Solid-State Battery Architect',
        leadership: 92,
        specialty: 94,
        visionQuote: 'Kepadatan energi 600 Wh/kg tanpa risiko kebakaran adalah kunci elektrifikasi transportasi total.',
      },
      {
        name: 'Mateo Alvares',
        title: 'Managing Director & CEO',
        icon: 'activity',
        trait: 'Grid Scale Energy Pioneer',
        leadership: 88,
        specialty: 90,
        visionQuote: 'Sistem penyimpanan energi berskala gigawatt-jam menstabilkan intermitensi surya dan angin.',
      },
    ],
    descriptions: [
      'Elektrolit padat baterai silikon anoda, penyimpanan energi skala gardu induk, dan daur ulang litium.',
      'Fasilitas gigafactory baterai natrium-ion berdensitas tinggi untuk armada komersial.',
    ],
    moves: [
      'Memulai produksi massal sel baterai solid-state generasi ketiga di pabrik Eropa utara.',
      'Mengintegrasikan sistem baterai skala 2 GWh ke jaringan transmisi tenaga listrik nasional.',
    ],
  },
  {
    category: 'robotika',
    sector: 'Robotika & Otomasi Pabrik',
    symbolPool: ['ROBO', 'MECH', 'AUTO', 'KNTS', 'CYBD'],
    names: [
      'RoboCraft Automation',
      'MechaDynamics Swarm Robotics',
      'Automata Kinetic Systems',
      'Kinesis Bipedal Dynamics',
      'Cyberdyne Industrial Swarm',
    ],
    headquarters: ['Osaka, Jepang', 'Stuttgart, Jerman', 'Pittsburgh, USA', 'Odense, Denmark', 'Shenzhen'],
    basePrice: 83.40,
    sharesRange: [6000000, 10000000],
    techLevelRange: [8, 10],
    peRange: [29.0, 38.0],
    dividendRange: [0.8, 1.8],
    marginRange: [0.22, 0.32],
    aiStrategy: 'Humanoid Labor Deployment',
    ceos: [
      {
        name: 'Kenjiro Sato',
        title: 'Executive Chairman & CEO',
        icon: 'cpu',
        trait: 'Bipedal Automation Pioneer',
        leadership: 93,
        specialty: 95,
        visionQuote: 'Robot bipedal fleksibel akan mengambil alih pekerjaan fisik berisiko tinggi di seluruh dunia.',
      },
      {
        name: 'Klaus Webber',
        title: 'Chief Robotics Officer & CEO',
        icon: 'settings',
        trait: 'Industrial Swarm Architect',
        leadership: 89,
        specialty: 96,
        visionQuote: 'Sinkronisasi swarm 10.000 lengan robotik menghasilkan jalur perakitan tanpa henti.',
      },
    ],
    descriptions: [
      'Robot humanoid bipedal serbaguna, lengan manipulator presisi sub-mikron, dan swarm AGV gudang.',
      'Sistem kendali aktuator torsi tinggi untuk exosuit dan robot pemeliharaan infrastruktur rel.',
    ],
    moves: [
      'Mendistribusikan 5.000 unit robot pekerja humanoid ke fasilitas logistik otomotif global.',
      'Mencapai sertifikasi keselamatan ISO untuk interaksi kolaboratif manusia dan robot bipedal.',
    ],
  },
  {
    category: 'semikonduktor',
    sector: 'Fabrikasi Semikonduktor & Chip',
    symbolPool: ['CHIP', 'NANO', 'LITH', 'TRCP', 'WAFF'],
    names: [
      'SiliconNanotech Foundry',
      'NanoLattice Microelectronics',
      'LithoPrecision Transistors',
      'TeraChip Global Foundry',
      'WaferCore NanoSystems',
    ],
    headquarters: ['Hsinchu, Taiwan', 'Dresden, Jerman', 'Phoenix, USA', 'Kumamoto, Jepang', 'Eindhoven, Belanda'],
    basePrice: 275.50,
    sharesRange: [3000000, 5500000],
    techLevelRange: [9, 10],
    peRange: [26.0, 35.0],
    dividendRange: [1.2, 2.2],
    marginRange: [0.30, 0.45],
    aiStrategy: 'Extreme Node Monopoly',
    ceos: [
      {
        name: 'Winston Wu',
        title: 'President & CEO',
        icon: 'cpu',
        trait: 'Lithography Silicon Master',
        leadership: 95,
        specialty: 98,
        visionQuote: 'Siapa yang menguasai litografi ekstrem pada skala angstrom mengendalikan roda ekonomi kecerdasan.',
      },
      {
        name: 'Dr. Mei-Ling Chang',
        title: 'Chief Technology Officer & CEO',
        icon: 'zap',
        trait: 'Gate-All-Around Nanotech Expert',
        leadership: 92,
        specialty: 99,
        visionQuote: 'Transistor Gate-All-Around 1nm dengan kanal nanosheet memangkas konsumsi daya chip 40%.',
      },
    ],
    descriptions: [
      'Foundry fabrikasi semikonduktor node 1.4nm GAA, kemasan 3D wafer-on-wafer, dan litografi High-NA EUV.',
      'Pabrikan chip akselerator kecerdasan buatan bervolume tinggi dengan interkoneksi optik terpadu.',
    ],
    moves: [
      'Mencapai yield komersial 82% pada fabrikasi wafer silikon node 1.4nm pertama di dunia.',
      'Memulai instalasi mesin litografi EUV High-NA generasi paling mutakhir di fab baru.',
    ],
  },
  {
    category: 'finansial',
    sector: 'Perbankan Kuantitatif & Likuiditas',
    symbolPool: ['FINX', 'SOVR', 'MRDN', 'VNTG', 'ARBT'],
    names: [
      'Sovereign Algorithmic Capital',
      'FinX Quantitative Securities',
      'Meridian Autonomous Asset Pool',
      'Vantage Global Arbitrage',
      'Arbitrage Prime Capital',
    ],
    headquarters: ['London, Inggris', 'New York, USA', 'Singapura', 'Zurich, Swiss', 'Frankfurt, Jerman'],
    basePrice: 135.50,
    sharesRange: [4500000, 7500000],
    techLevelRange: [7, 9],
    peRange: [15.0, 20.0],
    dividendRange: [2.5, 3.8],
    marginRange: [0.35, 0.50],
    aiStrategy: 'Algorithmic Liquidity Hegemony',
    ceos: [
      {
        name: 'Lord Sterling Ward',
        title: 'Managing Partner & Executive Director',
        icon: 'coins',
        trait: 'High-Frequency Capitalist',
        leadership: 92,
        specialty: 94,
        visionQuote: 'Likuiditas pasar bergerak berdasarkan mikro-detik arbitrase data; presisi adalah keuntungan murni.',
      },
      {
        name: 'Julian Montgomery',
        title: 'Chief Investment Officer & CEO',
        icon: 'briefcase',
        trait: 'Quantitative Macro Hedge Master',
        leadership: 90,
        specialty: 96,
        visionQuote: 'Algoritma prediktif kami menetralisir volatilitas makro dan mengunci spread dividen stabil.',
      },
    ],
    descriptions: [
      'Market-maker frekuensi tinggi otomatis, manajemen aset kuantitatif, dan kliring derivatif terdesentralisasi.',
      'Konsorsium pembiayaan sindikasi korporat dan sindikasi emisi obligasi pasar modal global.',
    ],
    moves: [
      'Mencatatkan volume transaksi harian melampaui $25 miliar di platform likuiditas algoritmik.',
      'Meluncurkan instrumen lindung nilai valuta otomatis berbasis AI untuk 500 korporasi multinasional.',
    ],
  },
  {
    category: 'logistik',
    sector: 'Ritel Digital & Rantai Pasok',
    symbolPool: ['OMNI', 'TERA', 'VLCT', 'CRGO', 'FLUX'],
    names: [
      'OmniRetail Syndicate',
      'TeraLogistics Drone Fleet',
      'Velocity Global Fulfillment',
      'CargoLink Autonomous Freight',
      'Flux Commerce Network',
    ],
    headquarters: ['New York, USA', 'Rotterdam, Belanda', 'Singapura', 'Chicago, USA', 'Shenzhen'],
    basePrice: 102.90,
    sharesRange: [6000000, 10000000],
    techLevelRange: [7, 9],
    peRange: [22.0, 29.0],
    dividendRange: [1.2, 2.0],
    marginRange: [0.14, 0.22],
    aiStrategy: 'Direct-to-Consumer Monopoly',
    ceos: [
      {
        name: 'Rachel Green-Levy',
        title: 'President & CEO',
        icon: 'users',
        trait: 'Algorithmic Consumer Mogul',
        leadership: 91,
        specialty: 86,
        visionQuote: 'Pengiriman 30 menit dari gudang robotik ke depan pintu konsumen adalah standar masa kini.',
      },
      {
        name: 'Arthur Pendelton',
        title: 'Group Chief Executive Officer',
        icon: 'truck',
        trait: 'Autonomous Fleet Commander',
        leadership: 88,
        specialty: 90,
        visionQuote: 'Armada kontainer nirawak dan drone kargo memangkas biaya transit pelabuhan 65%.',
      },
    ],
    descriptions: [
      'Platform marketplace hyper-lokal, armada drone pengantaran otonom, dan gudang pemenuhan mikro.',
      'Jaringan rantai pasok terintegrasi berbasis blockchain untuk pelacakan kargo maritim dan udara.',
    ],
    moves: [
      'Meluncurkan layanan pengiriman drone instan di 15 kota metropolitan baru.',
      'Mengoperasikan armada 2.000 truk kargo listrik otonom di koridor logistik trans-benua.',
    ],
  },
  {
    category: 'semikonduktor',
    sector: 'Optik Fotonik & Jaringan Laser',
    symbolPool: ['LUMX', 'PHOT', 'PRSM', 'OPTC', 'BEAM'],
    names: [
      'Lumix Fotonik Transceiver',
      'Photonic Wave Dynamics',
      'Prism Optical Computing',
      'OptiCore Laser Networks',
      'BeamWave Quantum Optics',
    ],
    headquarters: ['Kyoto, Jepang', 'Eindhoven, Belanda', 'Boulder, USA', 'Oxford, Inggris', 'Munich, Jerman'],
    basePrice: 47.60,
    sharesRange: [8500000, 13000000],
    techLevelRange: [8, 9],
    peRange: [23.0, 31.0],
    dividendRange: [1.5, 2.4],
    marginRange: [0.20, 0.30],
    aiStrategy: 'Optical Interconnect Standards',
    ceos: [
      {
        name: 'Dr. Hidenori Takahashi',
        title: 'Chief Technology Officer & CEO',
        icon: 'zap',
        trait: 'Laser Photonics Pioneer',
        leadership: 90,
        specialty: 97,
        visionQuote: 'Cahaya bergerak lebih cepat dari elektron; komputasi fotonik adalah akhir dari bottleneck tembaga.',
      },
      {
        name: 'Claire Dupont',
        title: 'Managing Director & CEO',
        icon: 'cpu',
        trait: 'Optical Network Architect',
        leadership: 88,
        specialty: 94,
        visionQuote: 'Transceiver laser terpadu memungkinkan interkoneksi data center dengan bandwidth terabit/detik.',
      },
    ],
    descriptions: [
      'Transceiver laser terpasang-wafer, sakelar jaringan fotonik serba-optik, dan sensor LIDAR frekuensi tinggi.',
      'Komponen pemandu gelombang silikon fotonik untuk interkoneksi server cluster kecerdasan buatan.',
    ],
    moves: [
      'Mengembangkan switch optik multi-terabit pertama yang mengonsumsi daya 80% lebih rendah.',
      'Menyelesaikan integrasi modul transceiver fotonik ke dalam server generasi berikutnya.',
    ],
  },
  {
    category: 'dirgantara',
    sector: 'Satelit & Konstelasi Orbit',
    symbolPool: ['STRT', 'TELM', 'ZNTH', 'CSMS', 'ASTX'],
    names: [
      'Stratos Orbit Satellites',
      'Telemetry Constellation Group',
      'Zenith Earth Observation',
      'Cosmos Orbital Link',
      'Asteria Deep Space Net',
    ],
    headquarters: ['Adelaide, Australia', 'Los Angeles, USA', 'Stockholm, Swedia', 'Toulouse, Prancis', 'Tokyo, Jepang'],
    basePrice: 62.40,
    sharesRange: [7000000, 11000000],
    techLevelRange: [8, 9],
    peRange: [24.0, 32.0],
    dividendRange: [1.4, 2.2],
    marginRange: [0.22, 0.33],
    aiStrategy: 'Global Orbital Coverage',
    ceos: [
      {
        name: 'Freja Lindemann',
        title: 'Founder & CEO',
        icon: 'rocket',
        trait: 'Satellite Constellation Visionary',
        leadership: 89,
        specialty: 93,
        visionQuote: 'Jaringan orbit rendah bumi menyediakan konektivitas latensi rendah ke setiap jengkal daratan.',
      },
      {
        name: 'David Sterling',
        title: 'President & Managing Director',
        icon: 'activity',
        trait: 'Orbital Telemetry Veteran',
        leadership: 87,
        specialty: 91,
        visionQuote: 'Pengamatan spektral real-time dari orbit memprediksi anomali iklim dan rantai pasok global.',
      },
    ],
    descriptions: [
      'Konstelasi satelit komunikasi orbit rendah, pemindaian radar apertur sintetis (SAR), dan stasiun bumi otomatis.',
      'Satelit pemantau maritim real-time dengan link laser antar-satelit untuk transfer data instan.',
    ],
    moves: [
      'Meluncurkan batch 48 satelit generasi baru dengan interlink laser berkecepatan tinggi.',
      'Mendapatkan lisensi spektrum frekuensi global untuk layanan konektivitas maritim dan penerbangan.',
    ],
  },
  {
    category: 'biotek',
    sector: 'Robotika Medis & Bedah Presisi',
    symbolPool: ['MEDX', 'SURG', 'MCRO', 'BRES', 'CURA'],
    names: [
      'Nanocure Surgical Robotics',
      'SurgiBot Precision Systems',
      'MicroRobotics Medical Instruments',
      'BioResonance Surgical AI',
      'CuraTech Autonomous Med',
    ],
    headquarters: ['Seoul, Korea Selatan', 'Boston, USA', 'Strasbourg, Prancis', 'Basel, Swiss', 'Singapura'],
    basePrice: 105.20,
    sharesRange: [4500000, 7500000],
    techLevelRange: [9, 10],
    peRange: [34.0, 42.0],
    dividendRange: [0.8, 1.4],
    marginRange: [0.24, 0.36],
    aiStrategy: 'Hospital Systems Integration',
    ceos: [
      {
        name: 'Dr. Priya Sharma',
        title: 'Chief Medical Officer & CEO',
        icon: 'shieldCheck',
        trait: 'Micro-Robotics Surgeon',
        leadership: 88,
        specialty: 97,
        visionQuote: 'Insisi mikroskopis dan stabilisasi tremor berbasis AI mempercepat pemulihan pasien bedah.',
      },
      {
        name: 'Dr. Jin-Woo Park',
        title: 'Founder & President',
        icon: 'activity',
        trait: 'Endoscopic Robotics Pioneer',
        leadership: 90,
        specialty: 95,
        visionQuote: 'Navigasi telerobotik memungkinkan dokter spesialis mengoperasi pasien dari belahan dunia lain.',
      },
    ],
    descriptions: [
      'Sistem konsol bedah laparoskopi tele-robotik dan mikrobot diagnostik pembuluh darah.',
      'Platform bedah saraf robotik dengan pelacakan tomografi real-time dan aktuator mikro-presisi.',
    ],
    moves: [
      'Mendapat sertifikasi keselamatan medis internasional untuk sistem bedah otonom.',
      'Melaksanakan 10.000 prosedur bedah telerobotik sukses tanpa komplikasi pasca-operasi.',
    ],
  },
  {
    category: 'manufaktur',
    sector: 'Eksplorasi Mineral Bawah Laut',
    symbolPool: ['DEEP', 'OCEN', 'MRNA', 'ABYS', 'PLGC'],
    names: [
      'DeepOcean Mineral Exploration',
      'Oceanic Hydrothermal Robotics',
      'Mariana Subsea Resources',
      'Abyssal Polymetallic Mining',
      'Pelagic Rare Minerals',
    ],
    headquarters: ['Sydney, Australia', 'Oslo, Norwegia', 'Reykjavik, Islandia', 'Halifax, Kanada', 'Auckland, Selandia Baru'],
    basePrice: 34.60,
    sharesRange: [10000000, 18000000],
    techLevelRange: [7, 8],
    peRange: [15.0, 21.0],
    dividendRange: [2.8, 4.0],
    marginRange: [0.18, 0.28],
    aiStrategy: 'Critical Mineral Harvesting',
    ceos: [
      {
        name: 'Hiroshi Tanaka',
        title: 'President & CEO',
        icon: 'activity',
        trait: 'Subsea Engineering Commander',
        leadership: 87,
        specialty: 91,
        visionQuote: 'Nodul polimetalik di dasar palung laut mengandung nikel dan kobalt untuk ratusan tahun energi bersih.',
      },
      {
        name: 'Lars Halvorsen',
        title: 'Managing Director & CEO',
        icon: 'briefcase',
        trait: 'Offshore Robotics Pioneer',
        leadership: 89,
        specialty: 92,
        visionQuote: 'Eksplorasi robotik ramah lingkungan menjaga integritas termal ekosistem palung dalam.',
      },
    ],
    descriptions: [
      'Kendaraan selam otonom tanpa awak (AUV), sensor sonar batimetri, dan penambangan nodul laut dalam.',
      'Robot selam tekanan ultra-ekstrem untuk inspeksi kabel internet bawah laut dan survei mineral.',
    ],
    moves: [
      'Mengamankan konsesi eksplorasi mineral zona ekonomi eksklusif di Samudra Pasifik.',
      'Menyelesaikan uji lapangan kapal riset selam otonom di kedalaman 6.000 meter.',
    ],
  },
  {
    category: 'imersif',
    sector: 'Realitas Imersif & Engine Game',
    symbolPool: ['AURA', 'MIRG', 'VRTS', 'SPAT', 'HOLX'],
    names: [
      'Aurora Entertainment & VR',
      'Mirage Spatial Simulations',
      'Virtualis Holographic Studios',
      'Spatial Neural Engines',
      'HoloCore Immersive Meta',
    ],
    headquarters: ['Toronto, Kanada', 'Tokyo, Jepang', 'Stockholm, Swedia', 'San Francisco, USA', 'London, Inggris'],
    basePrice: 28.30,
    sharesRange: [9000000, 16000000],
    techLevelRange: [7, 9],
    peRange: [20.0, 27.0],
    dividendRange: [1.4, 2.2],
    marginRange: [0.18, 0.26],
    aiStrategy: 'Spatial Engine Adoption',
    ceos: [
      {
        name: 'Chloe Davenport',
        title: 'Founder & Creative CEO',
        icon: 'gamepad',
        trait: 'Spatial Simulation Visionary',
        leadership: 89,
        specialty: 85,
        visionQuote: 'Menghapus batasan antara realitas optik fisik dengan simulasi real-time berbasis fotorealisme.',
      },
      {
        name: 'Tatsuya Endo',
        title: 'President & Technical Director',
        icon: 'sparkles',
        trait: 'Neural Rendering Architect',
        leadership: 88,
        specialty: 93,
        visionQuote: 'Perenderan neural real-time memungkinkan simulasi dunia virtual interaktif beresolusi 16K.',
      },
    ],
    descriptions: [
      'Game engine perenderan neural spasial 3D, headset VR holografik berbobot ringan, dan ekosistem kreator.',
      'Platform virtual production real-time untuk sinematografi canggih dan simulasi pelatihan imersif.',
    ],
    moves: [
      'Mengumumkan rilis engine fisika spasial generasi kelima yang diunduh 10 juta developer.',
      'Menjalin kemitraan lisensi teknologi grafik fotorealistik dengan studio animasi terkemuka.',
    ],
  },
  {
    category: 'manufaktur',
    sector: 'Energi Fusi & Reaktor Bersih',
    symbolPool: ['ATOM', 'TOKM', 'IGNT', 'PLSM', 'FUSX'],
    names: [
      'Tokamak Fusion Power Systems',
      'Ignition Plasma Dynamics',
      'Atomic Fusion Energy',
      'PlasmaCore Clean Power',
      'FusionX Magnetics Corp',
    ],
    headquarters: ['Oxford, Inggris', 'Aix-en-Provence, Prancis', 'Daejeon, Korea Selatan', 'Boston, USA', 'Lausanne, Swiss'],
    basePrice: 89.20,
    sharesRange: [5000000, 9000000],
    techLevelRange: [9, 10],
    peRange: [30.0, 42.0],
    dividendRange: [0.0, 1.2],
    marginRange: [0.24, 0.35],
    aiStrategy: 'Commercial Net-Gain Ignition',
    ceos: [
      {
        name: 'Dr. Alistair Sterling',
        title: 'Chief Scientist & CEO',
        icon: 'zap',
        trait: 'Magnetic Confinement Expert',
        leadership: 91,
        specialty: 98,
        visionQuote: 'Mengurung bintang di dalam medan magnet toroid untuk menyediakan energi tak terbatas bebas karbon.',
      },
      {
        name: 'Dr. Sunita Patel',
        title: 'Founder & Managing Director',
        icon: 'activity',
        trait: 'Plasma Physics Visionary',
        leadership: 89,
        specialty: 97,
        visionQuote: 'Reaksi fusi deuterium-tritium komersial akan menggantikan seluruh pembangkit fosil dunia.',
      },
    ],
    descriptions: [
      'Reaktor fusi magnetik kompak berbasis magnet superkonduktor suhu tinggi (HTS) untuk listrik bersih.',
      'Sistem diagnostik pemanasan gelombang mikro plasma dan penanganan bahan bakar tritium terintegrasi.',
    ],
    moves: [
      'Mencapai stabilitas plasma suhu 150 juta derajat Celsius selama 1.000 detik tanpa gangguan.',
      'Menyelesaikan konstruksi fasilitas demonstrasi daya fusi komersial pertama di Eropa.',
    ],
  },
  {
    category: 'biotek',
    sector: 'Pertanian Presisi & Bio-Pangan',
    symbolPool: ['AGRI', 'VERT', 'CELL', 'HARV', 'CULT'],
    names: [
      'TerraBio Precision Farms',
      'Vertical Harvest Systems',
      'Cellular AgriTech Labs',
      'HydroBiome Smart Farming',
      'Cultiva Cellular Proteins',
    ],
    headquarters: ['Wageningen, Belanda', 'Singapura', 'Davis, USA', 'Kopenhagen, Denmark', 'Melbourne, Australia'],
    basePrice: 32.80,
    sharesRange: [9500000, 16000000],
    techLevelRange: [6, 8],
    peRange: [18.0, 24.0],
    dividendRange: [2.0, 3.4],
    marginRange: [0.16, 0.25],
    aiStrategy: 'Sustainable Nutrient Monopolies',
    ceos: [
      {
        name: 'Anouk van der Meer',
        title: 'President & CEO',
        icon: 'heart',
        trait: 'Closed-Loop Agritech Pioneer',
        leadership: 90,
        specialty: 92,
        visionQuote: 'Pabrik tanaman vertikal nir-pestisida menggunakan air 95% lebih hemat dengan hasil panen 365 hari.',
      },
      {
        name: 'Liam Callaghan',
        title: 'Chief Agricultural Officer & CEO',
        icon: 'activity',
        trait: 'Cellular Agriculture Pioneer',
        leadership: 87,
        specialty: 94,
        visionQuote: 'Kultivasi protein seluler di bioreaktor memastikan ketahanan pangan tanpa degradasi lahan.',
      },
    ],
    descriptions: [
      'Fasilitas vertikal hidroponik terkontrol AI, kultur jaringan protein seluler, dan mikrobioma tanah.',
      'Sistem otomatisasi panen robotik spektral untuk hasil pertanian bebas fluktuasi cuaca ekstrem.',
    ],
    moves: [
      'Mengoperasikan fasilitas vertical farm terbesar di kawasan Eropa barat dengan kapasitas 50.000 ton.',
      'Mendapatkan lisensi komersial untuk produk protein seluler bebas emisi gas rumah kaca.',
    ],
  },
];

/**
 * Intelligent Custom Internal Generator.
 * Procedurally synthesizes a distinct, logically coherent universe of 19 competitor corporations.
 * Every new game session generates unique corporate identities, balanced financials, and varied AI CEOs.
 * @param {number} [count=19]
 * @param {string} [playerTicker='NXUS']
 * @returns {Array<Object>}
 */
export function generateProceduralCompetitors(count = 19, playerTicker = 'NXUS') {
  // Fisher-Yates Shuffle of Archetypes
  const shuffledPool = [...CORPORATE_ARCHETYPES].sort(() => Math.random() - 0.5);

  const usedSymbols = new Set([playerTicker]);
  const competitorStocks = [];

  const rivalryStances = [
    'Aggressive Rival',
    'Cautious Competitor',
    'Prospective Partner',
    'Neutral Observer',
  ];

  for (let i = 0; i < count; i++) {
    // Wrap around pool if count > pools length
    const archetype = shuffledPool[i % shuffledPool.length];

    // Find unused symbol
    let chosenSymbol = null;
    for (const sym of archetype.symbolPool) {
      if (!usedSymbols.has(sym)) {
        chosenSymbol = sym;
        break;
      }
    }
    if (!chosenSymbol) {
      // Fallback synthetic ticker
      const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      do {
        chosenSymbol = alpha[Math.floor(Math.random() * alpha.length)] +
          alpha[Math.floor(Math.random() * alpha.length)] +
          alpha[Math.floor(Math.random() * alpha.length)] +
          alpha[Math.floor(Math.random() * alpha.length)];
      } while (usedSymbols.has(chosenSymbol));
    }
    usedSymbols.add(chosenSymbol);

    // Pick Name variation
    const nameIndex = Math.floor(Math.random() * archetype.names.length);
    const chosenName = archetype.names[nameIndex];

    // Pick Headquarters
    const chosenHq = archetype.headquarters[Math.floor(Math.random() * archetype.headquarters.length)];

    // Calculate Price with natural variance (+/- 15%)
    const priceDrift = (Math.random() - 0.5) * 0.30;
    const price = Math.round(Math.max(12.50, archetype.basePrice * (1 + priceDrift)) * 100) / 100;

    // Calculate Shares (rounded to 250,000 steps)
    const [minShares, maxShares] = archetype.sharesRange;
    const rawShares = minShares + Math.random() * (maxShares - minShares);
    const totalShares = Math.round(rawShares / 250000) * 250000;

    // Market Cap
    const marketCap = Math.round(price * totalShares);

    // Calculate Financials
    const [minTech, maxTech] = archetype.techLevelRange;
    const techLevel = Math.floor(minTech + Math.random() * (maxTech - minTech + 1));

    const [minPe, maxPe] = archetype.peRange;
    const peRatio = Math.round((minPe + Math.random() * (maxPe - minPe)) * 10) / 10;

    const [minDiv, maxDiv] = archetype.dividendRange;
    const dividendYieldPct = Math.round((minDiv + Math.random() * (maxDiv - minDiv)) * 10) / 10;

    const [minMargin, maxMargin] = archetype.marginRange;
    const margin = minMargin + Math.random() * (maxMargin - minMargin);

    // Monthly revenue approx 7% to 11% of annual market cap / 12
    const monthlyRevenue = Math.round((marketCap * (0.07 + Math.random() * 0.04)) / 12);
    const monthlyExpenses = Math.round(monthlyRevenue * (1 - margin));

    // CEO Profile
    const ceoTemplate = archetype.ceos[Math.floor(Math.random() * archetype.ceos.length)];
    const chosenStance = rivalryStances[Math.floor(Math.random() * rivalryStances.length)];
    const leadershipBonus = Math.floor(Math.random() * 7) - 3;
    const specialtyBonus = Math.floor(Math.random() * 5) - 2;

    const ceo = {
      name: ceoTemplate.name,
      title: ceoTemplate.title,
      icon: ceoTemplate.icon || 'briefcase',
      trait: ceoTemplate.trait,
      leadership: Math.min(100, Math.max(80, ceoTemplate.leadership + leadershipBonus)),
      specialty: Math.min(100, Math.max(82, ceoTemplate.specialty + specialtyBonus)),
      rivalryStance: chosenStance,
      visionQuote: ceoTemplate.visionQuote,
    };

    // Description & Recent Move
    const description = archetype.descriptions[Math.floor(Math.random() * archetype.descriptions.length)];
    const recentMove = archetype.moves[Math.floor(Math.random() * archetype.moves.length)];

    // Generate Initial 24-Candle History
    const history = generateInitialCandleHistory(price, 24);
    const lastClose = history[history.length - 1].close;
    const firstOpen = history[0].open;
    const changePct = Math.round(((lastClose - firstOpen) / firstOpen) * 1000) / 10;

    competitorStocks.push({
      symbol: chosenSymbol,
      name: chosenName,
      sector: archetype.sector,
      headquarters: chosenHq,
      price: lastClose,
      changePct,
      totalShares,
      playerOwnedShares: 0,
      history,
      marketCap: Math.round(lastClose * totalShares),
      peRatio,
      dividendYieldPct,
      monthlyRevenue,
      monthlyExpenses,
      techLevel,
      isCompetitor: true,
      isAcquiredByPlayer: false,
      alertThresholdPassed: false,
      aiStrategy: archetype.aiStrategy,
      ceo,
      description,
      recentCorporateMove: recentMove,
    });
  }

  // Sort by market cap descending initially
  competitorStocks.sort((a, b) => b.marketCap - a.marketCap);

  return competitorStocks;
}
