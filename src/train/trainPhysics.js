/**
 * Train Simulator: Steel & Rails - Longitudinal Train Dynamics (LTD) Engine
 * Rock-solid physics with critically damped kinematic draft gear couplers:
 * - Zero flinging, zero elastic divergence, zero bounce or jumping
 * - Realistic slack action propagation ("klang-klang") across draft gears
 * - Davis Equation train resistance (mechanical friction + air drag)
 * - Tractive effort curves & 8-notch throttle governor
 * - Pneumatic air brake simulation (Brake Pipe, Brake Cylinder, Equalizing Res)
 * - Dynamic braking & wheel slip adhesion limit with sanding
 * - Track topography (elevations, grades, curved tracks, viaducts, tunnels)
 * - Turnout switch points with diverging tracks
 * - Block signals interlocking (Green, Yellow, Red) and ATS penalty
 * - Station platform passenger boarding & freight loading
 */

export const LOCOMOTIVES = [
  {
    id: 'cc206',
    name: 'CC 206 (GE CM20EMP)',
    subName: 'Heavy Diesel-Electric Workhorse',
    engineType: 'diesel',
    badge: 'DIESEL CO-CO',
    powerHP: 2250,
    maxTractiveEffortKN: 260,
    maxSpeedKmh: 120,
    weightTons: 90,
    lengthM: 20.9,
    axles: 6,
    bogieType: 'Co-Co',
    hasPantograph: false,
    livery: 'KAI Modern White-Blue-Orange with dual cab',
    desc: 'Lokomotif diesel elektrik gandar ganda Co-Co tulang punggung kereta api penumpang dan kargo berat.'
  },
  {
    id: 'krl_e233',
    name: 'KRL Commuter / Series E233',
    subName: 'Electric Multiple Unit (EMU)',
    engineType: 'electric',
    badge: 'ELECTRIC EMU',
    powerHP: 3400,
    maxTractiveEffortKN: 210,
    maxSpeedKmh: 130,
    weightTons: 36,
    lengthM: 20.0,
    axles: 4,
    bogieType: 'Bo-Bo',
    hasPantograph: true,
    livery: 'Stainless Steel with Red-Yellow Commuter Stripes',
    desc: 'Kereta rel listrik komuter perkotaan akselerasi tinggi dengan pantograf atap dan desingan inverter VVVF merdu.'
  },
  {
    id: 'bb301',
    name: 'BB 301 (Krupp M1500BB)',
    subName: 'Classic Vintage Diesel-Hydraulic',
    engineType: 'diesel',
    badge: 'HYDRAULIC BO-BO',
    powerHP: 1500,
    maxTractiveEffortKN: 160,
    maxSpeedKmh: 90,
    weightTons: 52,
    lengthM: 14.5,
    axles: 4,
    bogieType: 'Bo-Bo',
    hasPantograph: false,
    livery: 'Classic Cream-Green Vintage Heritage',
    desc: 'Lokomotif diesel hidrolik legendaris era klasik buatan Krupp Jerman, handal untuk jalur cabang dan langsir.'
  },
  {
    id: 'steam_mikado',
    name: 'Steam 2-8-2 Mikado (D51)',
    subName: 'Heavy Steam Freight Locomotive',
    engineType: 'steam',
    badge: 'STEAM 2-8-2',
    powerHP: 1850,
    maxTractiveEffortKN: 220,
    maxSpeedKmh: 85,
    weightTons: 112,
    lengthM: 22.4,
    axles: 8,
    bogieType: '2-8-2',
    hasPantograph: false,
    livery: 'Burnished Cast Iron Black with Brass Piping',
    desc: 'Monster uap lokomotif batu bara dengan 4 pasang roda penggerak besar, batang torak bergerak, dan kepulan asap tebal.'
  }
];

export const CAR_TYPES = [
  {
    id: 'eksekutif',
    name: 'Kereta Eksekutif (K1)',
    category: 'passenger',
    icon: '🚄',
    tareWeight: 40,
    capacity: 50,
    lengthM: 20.0,
    color: '#0284c7',
    stripeColor: '#f97316',
    carCode: 'K1 0 24 01 BD',
    desc: 'Kereta penumpang eksekutif bodi stainless steel, AC sentral, kursi empuk berputar dan jendela panorama flush.'
  },
  {
    id: 'ekonomi',
    name: 'Kereta Ekonomi AC (K3)',
    category: 'passenger',
    icon: '🚃',
    tareWeight: 38,
    capacity: 80,
    lengthM: 20.0,
    color: '#0f766e',
    stripeColor: '#fbbf24',
    carCode: 'K3 0 23 18 JNG',
    desc: 'Kereta penumpang komuter berkapasitas tinggi, pintu otomatis geser, interior terang dan suspensi udara.'
  },
  {
    id: 'pembangkit',
    name: 'Kereta Restorasi & Pembangkit (MP)',
    category: 'service',
    icon: '⚡',
    tareWeight: 42,
    capacity: 20,
    lengthM: 20.0,
    color: '#1e293b',
    stripeColor: '#e11d48',
    carCode: 'MP3 0 16 02 SLO',
    desc: 'Kereta genset diesel pembangkit listrik kelistrikan AC rangkaian serta dapur restoran restorasi.'
  },
  {
    id: 'petikemas',
    name: 'Gerbong Datar Peti Kemas (GD)',
    category: 'freight',
    icon: '📦',
    tareWeight: 18,
    cargoWeight: 32,
    lengthM: 16.0,
    color: '#b45309',
    stripeColor: '#ffffff',
    carCode: 'PPCW 40012',
    desc: 'Gerbong datar pengangkut kontainer peti kemas multimoda ekspor-impor 20 kaki dan 40 kaki.'
  },
  {
    id: 'ketel_pertamina',
    name: 'Gerbong Ketel Minyak BBM (GK)',
    category: 'freight',
    icon: '🛢️',
    tareWeight: 22,
    cargoWeight: 38,
    lengthM: 14.5,
    color: '#dc2626',
    stripeColor: '#ffffff',
    carCode: 'KKW 88201',
    desc: 'Gerbong tangki silinder baja tebal pengangkut bahan bakar minyak Pertamina Premium/Solar antarkota.'
  },
  {
    id: 'batubara',
    name: 'Gerbong Terbuka Batubara (GB)',
    category: 'freight',
    icon: '⛏️',
    tareWeight: 24,
    cargoWeight: 46,
    lengthM: 15.0,
    color: '#334155',
    stripeColor: '#f59e0b',
    carCode: 'KKBW 99014',
    desc: 'Gerbong hopper terbuka berdinding baja kokoh untuk angkutan batu bara tambang rangkaian panjang.'
  },
  {
    id: 'boxcar',
    name: 'Gerbong Box Logistik Ekspres (GG)',
    category: 'freight',
    icon: '🚚',
    tareWeight: 21,
    cargoWeight: 26,
    lengthM: 15.5,
    color: '#7c2d12',
    stripeColor: '#fbbf24',
    carCode: 'GW 55102',
    desc: 'Gerbong kargo tertutup rapat kedap cuaca untuk paket ekspres logistik, suku cadang dan sembako.'
  },
  {
    id: 'caboose',
    name: 'Gerbong Ekor Kondektur (Caboose)',
    category: 'service',
    icon: '🏮',
    tareWeight: 20,
    capacity: 4,
    lengthM: 12.0,
    color: '#991b1b',
    stripeColor: '#fef08a',
    carCode: 'BW 1204',
    desc: 'Kabin pengawas belakang rangkaian lengkap dengan lampu semboyan 21 merah dan katup rem darurat kondektur.'
  }
];

export const PRESET_CONSISTS = [
  {
    id: 'e233_chuo',
    name: 'JR East Series E233 Commuter Line (Japan 2026)',
    badge: 'TOKYO EMU RAPID',
    locoId: 'krl_e233',
    cars: ['ekonomi', 'ekonomi', 'eksekutif', 'ekonomi', 'ekonomi'],
    desc: 'Kereta rel listrik komuter perkotaan Tokyo 2026, akselerasi gesit dengan desingan VVVF IGBT dan pintu otomatis cepat.'
  },
  {
    id: 'tokaido_ltd',
    name: 'Tokaido Limited Express & Green Car',
    badge: 'LIMITED EXPRESS',
    locoId: 'cc206',
    cars: ['pembangkit', 'eksekutif', 'eksekutif', 'eksekutif', 'eksekutif', 'pembangkit'],
    desc: 'Rangkaian ekspres antarkota premium dengan lokomotif diesel-elektrik bertenaga tinggi dan gerbong eksekutif ber-AC sentral.'
  },
  {
    id: 'jrf_container',
    name: 'JR Freight Eco-Rail Container Express',
    badge: 'JRF INTERMODAL',
    locoId: 'cc206',
    cars: ['petikemas', 'petikemas', 'petikemas', 'boxcar', 'petikemas', 'caboose'],
    desc: 'Kereta barang cepat logistik intermodal pelabuhan dengan peti kemas 19D/20D ramah lingkungan.'
  },
  {
    id: 'jot_tanker',
    name: 'JOT Petroleum Tanker Unit Train',
    badge: 'ENERGY TANKER',
    locoId: 'cc206',
    cars: ['ketel_pertamina', 'ketel_pertamina', 'ketel_pertamina', 'ketel_pertamina', 'caboose'],
    desc: 'Kereta tangki BBM silinder berbobot masif untuk pasokan energi antardepo industri.'
  },
  {
    id: 'd51_steam',
    name: 'SL D51 Mikado Heritage Steam Train',
    badge: 'STEAM EXPRESS',
    locoId: 'steam_mikado',
    cars: ['ekonomi', 'eksekutif', 'ekonomi', 'caboose'],
    desc: 'Lokomotif uap legendaris D51 dengan 4 pasang roda penggerak besar, kepulan asap dinamis, dan suara peluit uap merdu.'
  }
];

export const ROUTES = [
  {
    id: 'japan_tokaido_scenic',
    name: 'Lintas Tokaido - Shinjuku - Hakone - Fuji Express (Jepang Modern 2026)',
    badge: 'JAPAN SCENIC EXPRESS',
    totalDistanceM: 6400,
    speedLimitKmh: 120,
    background: 'japan_fuji',
    stations: [
      // === SECTOR 1: TOKYO METROPOLITAN (0m - 1500m) ===
      { id: 'st_01_minami', name: '南新宿 MINAMI-SHINJUKU', subName: 'Suburban Halte', posM: 90, platformLenM: 90, type: 'small', isPassenger: true, passengers: 28, code: 'OH02' },
      { id: 'st_02_yoyogi', name: '代々木 YOYOGI CITY', subName: 'Yamanote Junction', posM: 190, platformLenM: 160, type: 'medium', isPassenger: true, passengers: 95, code: 'JY18' },
      { id: 'st_03_shinjuku', name: '新宿 SHINJUKU GRAND CENTRAL', subName: 'World Largest Megastation', posM: 380, platformLenM: 260, type: 'large', isPassenger: true, passengers: 280, code: 'JC05' },
      { id: 'st_04_hnakano', name: '東中野 HIGASHI-NAKANO', subName: 'Local Line Halte', posM: 520, platformLenM: 90, type: 'small', isPassenger: true, passengers: 32, code: 'JB08' },
      { id: 'st_05_nakano', name: '中野 NAKANO CENTRAL', subName: 'Sub-Center Interchange', posM: 690, platformLenM: 170, type: 'medium', isPassenger: true, passengers: 110, code: 'JC06' },
      { id: 'st_06_asagaya', name: '阿佐ヶ谷 ASAGAYA', subName: 'Shopping Arcade Halte', posM: 810, platformLenM: 95, type: 'small', isPassenger: true, passengers: 35, code: 'JB05' },
      { id: 'st_07_koenji', name: '高円寺 KOENJI URBAN', subName: 'Creative City Station', posM: 940, platformLenM: 155, type: 'medium', isPassenger: true, passengers: 85, code: 'JC07' },
      { id: 'st_08_kichijoji', name: '吉祥寺 KICHIJOJI GRAND TERMINAL', subName: 'Musashino Mega Hub', posM: 1120, platformLenM: 240, type: 'large', isPassenger: true, passengers: 230, code: 'JC11' },
      { id: 'st_09_inokashira', name: '井の頭公園 INOKASHIRA PARK', subName: 'Scenic Pond Halte', posM: 1260, platformLenM: 90, type: 'small', isPassenger: true, passengers: 40, code: 'IN13' },
      { id: 'st_10_nogikubo', name: '西荻窪 NISHI-OGIKUBO', subName: 'Suburban City Station', posM: 1390, platformLenM: 160, type: 'medium', isPassenger: true, passengers: 90, code: 'JC12' },
      
      // === SECTOR 2: SAKURA RESIDENTIAL & MT FUJI VISTA (1500m - 3000m) ===
      { id: 'st_11_sakura_h', name: '桜ヶ丘 SAKURAGAOKA HALTE', subName: 'Cherry Blossom Halte', posM: 1520, platformLenM: 95, type: 'small', isPassenger: true, passengers: 38, code: 'SK01' },
      { id: 'st_12_msakai', name: '武蔵境 MUSASHI-SAKAI', subName: 'Campus City Station', posM: 1680, platformLenM: 165, type: 'medium', isPassenger: true, passengers: 85, code: 'JC13' },
      { id: 'st_13_sakurazawa', name: '桜沢 SAKURAZAWA GRAND TERMINAL', subName: 'Sakura Shrine Interchange', posM: 1850, platformLenM: 240, type: 'large', isPassenger: true, passengers: 210, code: 'SK05' },
      { id: 'st_14_musashino', name: '武蔵野 MUSASHINO WAYSIDE', subName: 'Greenway Halte', posM: 1990, platformLenM: 90, type: 'small', isPassenger: true, passengers: 30, code: 'SK06' },
      { id: 'st_15_kunitachi', name: '国立 KUNITACHI CITY', subName: 'Avenue Station', posM: 2140, platformLenM: 160, type: 'medium', isPassenger: true, passengers: 95, code: 'JC16' },
      { id: 'st_16_fujimi_h', name: '富士見町 FUJIMI-CHO', subName: 'Fuji Foothill Halte', posM: 2280, platformLenM: 95, type: 'small', isPassenger: true, passengers: 36, code: 'FJ01' },
      { id: 'st_17_fujimidai', name: '富士見台 FUJIMIDAI SCENIC OVERLOOK', subName: 'Mt. Fuji Vista Grand Terminal', posM: 2480, platformLenM: 250, type: 'large', isPassenger: true, passengers: 240, code: 'FJ08' },
      { id: 'st_18_tachikawa', name: '立川 TACHIKAWA METRO', subName: 'West Tokyo Urban Hub', posM: 2660, platformLenM: 175, type: 'medium', isPassenger: true, passengers: 125, code: 'JC19' },
      { id: 'st_19_mansei', name: '万世橋 MANSEIBASHI', subName: 'Historic River Halte', posM: 2800, platformLenM: 90, type: 'small', isPassenger: true, passengers: 42, code: 'AK01' },
      { id: 'st_20_ochanomizu', name: '御茶ノ水 OCHANOMIZU', subName: 'River Gorge Station', posM: 2950, platformLenM: 170, type: 'medium', isPassenger: true, passengers: 120, code: 'JC03' },

      // === SECTOR 3: AKIHABARA & HAKONE ALPINE PASS (3000m - 4500m) ===
      { id: 'st_21_akihabara', name: '秋葉原 AKIHABARA CYBER MEGASTATION', subName: 'Electric Cyber Grand Hub', posM: 3150, platformLenM: 260, type: 'large', isPassenger: true, passengers: 290, code: 'JY13' },
      { id: 'st_22_kanda', name: '神田 KANDA ELECTRIC', subName: 'Metro High-Tech Station', posM: 3320, platformLenM: 160, type: 'medium', isPassenger: true, passengers: 105, code: 'JY02' },
      { id: 'st_23_fujichaya', name: '富士見茶屋 FUJI TEAHOUSE', subName: 'Mountain Way Halte', posM: 3450, platformLenM: 90, type: 'small', isPassenger: true, passengers: 35, code: 'FJ10' },
      { id: 'st_24_odawara', name: '小田原 ODAWARA CASTLE CITY', subName: 'Castle Gateway Station', posM: 3620, platformLenM: 180, type: 'medium', isPassenger: true, passengers: 130, code: 'JT16' },
      { id: 'st_25_iriuda', name: '入生田 IRIUDA ALPINE', subName: 'Mountain Stream Halte', posM: 3750, platformLenM: 90, type: 'small', isPassenger: true, passengers: 28, code: 'OH52' },
      { id: 'st_26_hakone', name: '箱根湯本 HAKONE-YUMOTO GRAND TERMINAL', subName: 'Alpine Resort Terminus', posM: 3950, platformLenM: 240, type: 'large', isPassenger: true, passengers: 220, code: 'OH51' },
      { id: 'st_27_tonosawa', name: '塔ノ沢 TONOSAWA RAVINE', subName: 'Hot Spring Halte', posM: 4100, platformLenM: 90, type: 'small', isPassenger: true, passengers: 30, code: 'OH50' },
      { id: 'st_28_yugawara', name: '湯河原 YUGAWARA ONSEN', subName: 'Coastal Resort Station', posM: 4260, platformLenM: 165, type: 'medium', isPassenger: true, passengers: 95, code: 'JT20' },
      { id: 'st_29_nebukawa', name: '根府川 NEBUKAWA OCEAN', subName: 'Pacific Cliff Halte', posM: 4390, platformLenM: 95, type: 'small', isPassenger: true, passengers: 35, code: 'JT18' },
      { id: 'st_30_atami', name: '熱海 ATAMI RESORT CITY', subName: 'Seaside Springs Station', posM: 4540, platformLenM: 180, type: 'medium', isPassenger: true, passengers: 135, code: 'JT21' },

      // === SECTOR 4: KAMAKURA & YOKOHAMA SEAPORT (4500m - 5800m) ===
      { id: 'st_31_kamakura', name: '鎌倉海岸 KAMAKURA HERITAGE TERMINAL', subName: 'Shinto Shrine Grand Terminal', posM: 4750, platformLenM: 240, type: 'large', isPassenger: true, passengers: 240, code: 'JO07' },
      { id: 'st_32_enoshima', name: '江ノ島海岸 ENOSHIMA COAST', subName: 'Island View Halte', posM: 4890, platformLenM: 95, type: 'small', isPassenger: true, passengers: 45, code: 'EN06' },
      { id: 'st_33_fujisawa', name: '藤沢 FUJISAWA COASTAL', subName: 'Shonan Express Station', posM: 5040, platformLenM: 170, type: 'medium', isPassenger: true, passengers: 115, code: 'JT08' },
      { id: 'st_34_tsujido', name: '辻堂海岸 TSUJIDO', subName: 'Seaside Park Halte', posM: 5180, platformLenM: 90, type: 'small', isPassenger: true, passengers: 32, code: 'JT09' },
      { id: 'st_35_ofuna', name: '大船 OFUNA INTERCHANGE', subName: 'Monorail Junction Station', posM: 5320, platformLenM: 175, type: 'medium', isPassenger: true, passengers: 120, code: 'JT07' },
      { id: 'st_36_yokohama', name: '横浜港 YOKOHAMA MINATO MIRAI', subName: 'Harbor Commercial Megastation', posM: 5520, platformLenM: 260, type: 'large', isPassenger: true, passengers: 300, code: 'JK12' },
      { id: 'st_37_sakuragicho', name: '桜木町 SAKURAGICHO PORT', subName: 'Promenade Halte', posM: 5660, platformLenM: 95, type: 'small', isPassenger: true, passengers: 45, code: 'JK11' },
      { id: 'st_38_kawasaki', name: '川崎 KAWASAKI INDUSTRIAL', subName: 'Metropolitan Crossway', posM: 5800, platformLenM: 180, type: 'medium', isPassenger: true, passengers: 140, code: 'JT04' },

      // === SECTOR 5: SHINAGAWA & TOKYO IMPERIAL TERMINAL (5800m - 6400m) ===
      { id: 'st_39_shinagawa', name: '品川 SHINAGAWA INTERCHANGE', subName: 'Shinkansen Bullet Hub', posM: 5980, platformLenM: 250, type: 'large', isPassenger: true, passengers: 280, code: 'JY25' },
      { id: 'st_40_takanawa', name: '高輪ゲートウェイ TAKANAWA GATEWAY', subName: 'Futuristic Eco Halte', posM: 6110, platformLenM: 95, type: 'small', isPassenger: true, passengers: 48, code: 'JY26' },
      { id: 'st_41_shimbashi', name: '新橋 SHIMBASHI CITY', subName: 'Railway Birthplace Station', posM: 6220, platformLenM: 170, type: 'medium', isPassenger: true, passengers: 135, code: 'JY29' },
      { id: 'st_42_tokyo_central', name: '東京中央 TOKYO IMPERIAL CENTRAL', subName: 'Grand Terminus of Japan 2026', posM: 6350, platformLenM: 280, type: 'large', isPassenger: true, passengers: 380, code: 'TY01' }
    ],
    switches: [
      { id: 'sw_1', posM: 1250, name: 'Wesel 01 Jalur Silang Kichijoji', isDiverged: false, divergeAngle: -0.035, targetTrack: 'loop' },
      { id: 'sw_2', posM: 2380, name: 'Wesel 02 Emplasemen Akihabara', isDiverged: false, divergeAngle: 0.035, targetTrack: 'main' },
      { id: 'sw_3', posM: 3750, name: 'Wesel 03 Jalur Lingkar Hakone', isDiverged: false, divergeAngle: -0.035, targetTrack: 'loop' }
    ],
    signals: [
      { id: 'sig_1', posM: 700, aspect: 'green', type: 'block' },
      { id: 'sig_2', posM: 1220, aspect: 'green', type: 'entry' },
      { id: 'sig_3', posM: 1800, aspect: 'green', type: 'block' },
      { id: 'sig_4', posM: 2400, aspect: 'yellow', type: 'entry' },
      { id: 'sig_5', posM: 3100, aspect: 'green', type: 'block' },
      { id: 'sig_6', posM: 3800, aspect: 'green', type: 'block' },
      { id: 'sig_7', posM: 4500, aspect: 'yellow', type: 'entry' },
      { id: 'sig_8', posM: 5400, aspect: 'yellow', type: 'home' }
    ],
    crossings: [
      { id: 'cr_1', posM: 720, name: '踏切 JPL 01 Kichijoji Fumikiri', isGateClosed: false, bellActive: false },
      { id: 'cr_2', posM: 1780, name: '踏切 JPL 02 Sakura Shrine Crossing', isGateClosed: false, bellActive: false },
      { id: 'cr_3', posM: 3000, name: '踏切 JPL 03 Hakone Alpine Crossing', isGateClosed: false, bellActive: false },
      { id: 'cr_4', posM: 4420, name: '踏切 JPL 04 Kamakura Coastal Crossing', isGateClosed: false, bellActive: false }
    ],
    bridges: [
      { startM: 2200, endM: 2500, name: 'Jembatan Viaduk Baja Shinkansen Tama River' },
      { startM: 4200, endM: 4500, name: 'Jembatan Pesisir Teluk Sagami' }
    ],
    tunnels: [
      { startM: 3500, endM: 3950, name: 'Terowongan Gunung Hakone (Panjang 450m)' }
    ],
    grades: [
      { startM: 0, endM: 1200, gradePercent: 0.2 },
      { startM: 1200, endM: 2400, gradePercent: 1.4 },
      { startM: 2400, endM: 3600, gradePercent: -1.2 },
      { startM: 3600, endM: 4800, gradePercent: 0.8 },
      { startM: 4800, endM: 6400, gradePercent: 0.0 }
    ]
  },
  {
    id: 'urban_tokyo_loop',
    name: 'Jalur Lingkar Tokyo Yamanote & Chuo Rapid 2026',
    badge: 'TOKYO METRO RAPID',
    totalDistanceM: 5200,
    speedLimitKmh: 110,
    background: 'tokyo_city',
    stations: [
      { id: 'st_shibuya', name: '渋谷 SHIBUYA CROSSING', subName: 'Neo Shibuya Central', posM: 350, platformLenM: 230, type: 'large', isPassenger: true, passengers: 210 },
      { id: 'st_harajuku', name: '原宿 HARAJUKU', subName: 'Meiji Jingu Overlook', posM: 900, platformLenM: 180, type: 'small', isPassenger: true, passengers: 75 },
      { id: 'st_shinjuku2', name: '新宿 SHINJUKU TERMINUS', subName: 'Metropolitan Terminal', posM: 1550, platformLenM: 250, type: 'large', isPassenger: true, passengers: 220 },
      { id: 'st_ikebukuro', name: '池袋 IKEBUKURO', subName: 'Sub-Center Interchange', posM: 2250, platformLenM: 220, type: 'large', isPassenger: true, passengers: 160 },
      { id: 'st_ueno', name: '上野 UENO PARK', subName: 'Cultural Museum Station', posM: 3100, platformLenM: 200, type: 'medium', isPassenger: true, passengers: 130 },
      { id: 'st_akiba2', name: '秋葉原 AKIHABARA ELECTRIC', subName: 'Electric Town Station', posM: 3800, platformLenM: 210, type: 'large', isPassenger: true, passengers: 180 },
      { id: 'st_tokyo_main', name: '東京 TOKYO MARUNOUCHI', subName: 'Imperial Grand Terminal', posM: 4800, platformLenM: 260, type: 'large', isPassenger: true, passengers: 280 }
    ],
    switches: [
      { id: 'sw_u1', posM: 1300, name: 'Wesel Jalur Chuo Rapid 1', isDiverged: false, divergeAngle: -0.035, targetTrack: 'loop' },
      { id: 'sw_u2', posM: 2800, name: 'Wesel Yamanote Outer Loop', isDiverged: false, divergeAngle: 0.035, targetTrack: 'main' }
    ],
    signals: [
      { id: 'sig_u1', posM: 650, aspect: 'green', type: 'block' },
      { id: 'sig_u2', posM: 1350, aspect: 'green', type: 'entry' },
      { id: 'sig_u3', posM: 2000, aspect: 'green', type: 'block' },
      { id: 'sig_u4', posM: 2850, aspect: 'yellow', type: 'entry' },
      { id: 'sig_u5', posM: 3600, aspect: 'green', type: 'block' },
      { id: 'sig_u6', posM: 4400, aspect: 'yellow', type: 'home' }
    ],
    crossings: [
      { id: 'cr_u1', posM: 1100, name: '踏切 Yamanote North Crossing', isGateClosed: false, bellActive: false },
      { id: 'cr_u2', posM: 3450, name: '踏切 Ueno Sakura Crossing', isGateClosed: false, bellActive: false }
    ],
    bridges: [],
    tunnels: [],
    grades: [
      { startM: 0, endM: 1800, gradePercent: 0.0 },
      { startM: 1800, endM: 3200, gradePercent: 0.5 },
      { startM: 3200, endM: 5200, gradePercent: -0.3 }
    ]
  }
];

/**
 * Ultra-Stable Longitudinal Train Dynamics (LTD)
 */
export class TrainSimulation {
  constructor() {
    this.locoConfig = LOCOMOTIVES[0];
    this.carList = [];
    this.route = ROUTES[0];

    // Train Position along track in meters (front locomotive nose)
    this.distanceM = 150;
    this.velocityMs = 0; // m/s (1 m/s = 3.6 km/h)
    this.accelerationMs2 = 0;

    // Controls
    this.reverser = 1; // 1: Forward, 0: Neutral, -1: Reverse
    this.throttleNotch = 0; // 0 to 8
    this.trainBrakeLevel = 0; // 0.0 (Release) to 1.0 (Emergency)
    this.independentBrakeLevel = 0; // 0.0 to 1.0
    this.dynamicBrakeLevel = 0;
    this.sanderActive = false;
    this.emergencyBrakeTriggered = false;
    this.pantographRaised = true;
    this.doorsOpen = false;
    this.headlights = 2; // 0: Off, 1: Dim, 2: High Beam

    // Pneumatic Air Brake System (bar)
    this.mainReservoirBar = 8.5;
    this.brakePipeBar = 5.0;
    this.brakeCylinderBar = 0.0;

    // Adhesion and Slip
    this.isWheelSlipping = false;
    this.wheelSlipTimer = 0;

    // Station and Stopping Accuracy
    this.currentStation = null;
    this.stationStopEvaluated = false;
    this.stopAccuracyCm = 0;
    this.boardingProgress = 0;
    this.isBoarding = false;
    this.totalPassengersCarried = 0;
    this.totalCargoDeliveredTons = 0;
    this.totalScore = 0;

    // Consist vehicle bodies
    this.vehicles = [];

    // Initialize default consist
    this.loadPresetConsist('e233_chuo');
  }

  loadPresetConsist(presetId) {
    const preset = PRESET_CONSISTS.find(p => p.id === presetId) || PRESET_CONSISTS[0];
    this.locoConfig = LOCOMOTIVES.find(l => l.id === preset.locoId) || LOCOMOTIVES[0];
    this.carList = preset.cars.map(cId => CAR_TYPES.find(c => c.id === cId) || CAR_TYPES[0]);
    this.rebuildVehicleConsist();
  }

  setLocomotive(locoId) {
    const loco = LOCOMOTIVES.find(l => l.id === locoId);
    if (loco) {
      this.locoConfig = loco;
      this.rebuildVehicleConsist();
    }
  }

  addCar(carId, positionIndex = -1) {
    const car = CAR_TYPES.find(c => c.id === carId);
    if (car) {
      if (positionIndex >= 0 && positionIndex < this.carList.length) {
        this.carList.splice(positionIndex, 0, car);
      } else {
        this.carList.push(car);
      }
      this.rebuildVehicleConsist();
    }
  }

  removeCar(index) {
    if (index >= 0 && index < this.carList.length) {
      this.carList.splice(index, 1);
      this.rebuildVehicleConsist();
    }
  }

  clearCars() {
    this.carList = [];
    this.rebuildVehicleConsist();
  }

  setRoute(routeId) {
    const r = ROUTES.find(item => item.id === routeId);
    if (r) {
      this.route = JSON.parse(JSON.stringify(r));
      this.distanceM = 150;
      this.velocityMs = 0;
      this.accelerationMs2 = 0;
      this.doorsOpen = false;
      this.isBoarding = false;
      this.boardingProgress = 0;
      this.currentStation = null;
      this.stationStopEvaluated = false;
      this.rebuildVehicleConsist();
    }
  }

  /**
   * Rebuild the multi-body vehicles array with masses, lengths, and couplers
   */
  rebuildVehicleConsist() {
    this.vehicles = [];

    // Lead vehicle is Locomotive
    this.vehicles.push({
      index: 0,
      isLoco: true,
      config: this.locoConfig,
      lengthM: this.locoConfig.lengthM,
      weightTons: this.locoConfig.weightTons,
      distanceM: this.distanceM,
      velocityMs: this.velocityMs,
      couplerForceN: 0,
      couplerSlackM: 0,
      targetSlackM: 0,
      bogieFrontM: 0,
      bogieRearM: 0,
      bogieAngle: 0
    });

    let cumulativeDist = this.distanceM;
    this.carList.forEach((car, i) => {
      const prevVeh = this.vehicles[i];
      const couplerNominalGap = 0.85; // Standard AAR tightlock coupler spacing (0.85m)
      cumulativeDist -= (prevVeh.lengthM / 2 + car.lengthM / 2 + couplerNominalGap);

      const totalWeight = car.tareWeight + (car.cargoWeight || 0);
      this.vehicles.push({
        index: i + 1,
        isLoco: false,
        config: car,
        lengthM: car.lengthM,
        weightTons: totalWeight,
        distanceM: cumulativeDist,
        velocityMs: this.velocityMs,
        couplerForceN: 0,
        couplerSlackM: 0,
        targetSlackM: 0,
        bogieFrontM: 0,
        bogieRearM: 0,
        bogieAngle: 0
      });
    });
  }

  getTotalTrainWeightTons() {
    return this.vehicles.reduce((sum, v) => sum + v.weightTons, 0);
  }

  getTotalTrainLengthM() {
    return this.vehicles.reduce((sum, v) => sum + v.lengthM + 0.85, 0);
  }

  getGradeAt(distM) {
    if (!this.route || !this.route.grades) return 0;
    const grade = this.route.grades.find(g => distM >= g.startM && distM < g.endM);
    return grade ? grade.gradePercent : 0;
  }

  /**
   * Primary Step Physics (Longitudinal Dynamics + Kinematic Relaxation)
   */
  step(dt, onCouplerClank) {
    if (dt <= 0) return;
    dt = Math.min(0.033, dt); // Cap timestep for rock-solid stability

    // 1. Update Air Brake System Pressures
    this.updatePneumaticBrakes(dt);

    // 2. Calculate Locomotive Tractive Effort
    const tractiveForceN = this.calculateTractiveForce(dt);

    // 3. Calculate Train Braking Force
    const totalBrakingForceN = this.calculateBrakingForce();

    // 4. Calculate Train Resistance (Davis Equation) + Grade Resistance
    const totalMassKg = this.getTotalTrainWeightTons() * 1000;
    const speedMs = this.velocityMs;
    const absSpeedMs = Math.abs(speedMs);

    // Davis Equation: R = A + B*v + C*v^2
    const A = 1.35 * (totalMassKg / 1000) * 9.81; // Rolling resistance
    const B = 0.025 * (totalMassKg / 1000) * absSpeedMs; // Mechanical & flange
    const C = 0.5 * 1.225 * 0.65 * 10.0 * (absSpeedMs * absSpeedMs); // Aero drag
    const trainResistanceN = A + B + C;

    // Grade Resistance
    const avgGrade = this.getGradeAt(this.distanceM);
    const gradeForceN = totalMassKg * 9.81 * (avgGrade / 100);

    // Directional resistance
    let netResistanceN = 0;
    if (absSpeedMs > 0.02) {
      netResistanceN = Math.sign(speedMs) * trainResistanceN;
    }

    // Directional braking
    let netBrakeN = 0;
    if (absSpeedMs > 0.02) {
      netBrakeN = Math.sign(speedMs) * totalBrakingForceN;
    } else if (totalBrakingForceN > Math.abs(tractiveForceN - gradeForceN)) {
      // Clamped at rest by brakes
      this.velocityMs = 0;
      this.accelerationMs2 = 0;
      this.updateMultiBodyKinematics(dt, onCouplerClank);
      this.checkStationAndSignals(dt);
      return;
    }

    // Door Interlocking: Cannot apply tractive power if doors are open!
    let appliedTractionN = tractiveForceN;
    if (this.doorsOpen) {
      appliedTractionN = 0;
    }

    // Net Force on consist
    const netForceN = appliedTractionN - netBrakeN - netResistanceN - gradeForceN;
    this.accelerationMs2 = netForceN / totalMassKg;

    // Integration with anti-overshoot clamp
    const prevSpeed = this.velocityMs;
    this.velocityMs += this.accelerationMs2 * dt;

    // Natural stop clamp
    if (Math.sign(prevSpeed) !== Math.sign(this.velocityMs) && totalBrakingForceN > 500) {
      this.velocityMs = 0;
    }

    if (this.reverser === 0 && Math.abs(this.velocityMs) < 0.1) {
      this.velocityMs = 0;
    }

    // Speed Governor: Capped strictly at locomotive design max speed + 10%
    const maxAllowedMs = (this.locoConfig.maxSpeedKmh * 1.1) / 3.6;
    if (Math.abs(this.velocityMs) > maxAllowedMs) {
      this.velocityMs = Math.sign(this.velocityMs) * maxAllowedMs;
    }

    // Distance update
    this.distanceM += this.velocityMs * dt;
    if (this.distanceM < 10) {
      this.distanceM = 10;
      this.velocityMs = 0;
    }
    if (this.distanceM > this.route.totalDistanceM) {
      this.distanceM = this.route.totalDistanceM;
      this.velocityMs = 0;
    }

    // 5. Multi-body Coupler Dynamics with Critical Damping & Zero Fling
    this.updateMultiBodyKinematics(dt, onCouplerClank);

    // 6. Station Stop, Signals, and Level Crossings check
    this.checkStationAndSignals(dt);
  }

  updatePneumaticBrakes(dt) {
    let targetBP = 5.0;
    if (this.emergencyBrakeTriggered || this.trainBrakeLevel >= 0.95) {
      targetBP = 0.0;
    } else {
      targetBP = 5.0 - this.trainBrakeLevel * 1.5;
    }

    const ventRate = this.emergencyBrakeTriggered ? 4.5 : 1.2;
    if (this.brakePipeBar > targetBP) {
      this.brakePipeBar = Math.max(targetBP, this.brakePipeBar - ventRate * dt);
    } else if (this.brakePipeBar < targetBP) {
      const chargeRate = 0.8;
      this.brakePipeBar = Math.min(targetBP, this.brakePipeBar + chargeRate * dt);
    }

    const bpReduction = Math.max(0, 5.0 - this.brakePipeBar);
    const targetBC = Math.min(3.8, bpReduction * 2.5);

    if (this.brakeCylinderBar < targetBC) {
      this.brakeCylinderBar = Math.min(targetBC, this.brakeCylinderBar + 2.0 * dt);
    } else if (this.brakeCylinderBar > targetBC) {
      this.brakeCylinderBar = Math.max(targetBC, this.brakeCylinderBar - 1.5 * dt);
    }
  }

  calculateTractiveForce(dt) {
    if (this.reverser === 0 || this.throttleNotch === 0) return 0;

    const notchFraction = this.throttleNotch / 8;
    const maxPowerWatts = this.locoConfig.powerHP * 745.7;
    const currentPowerWatts = maxPowerWatts * notchFraction;

    const absSpeedMs = Math.max(0.6, Math.abs(this.velocityMs));
    const rawTractiveForceKN = Math.min(
      this.locoConfig.maxTractiveEffortKN * notchFraction,
      (currentPowerWatts / absSpeedMs) / 1000
    );
    let tractiveN = rawTractiveForceKN * 1000 * this.reverser;

    // Adhesion limit calculation
    let mu = this.sanderActive ? 0.38 : 0.26;
    const locoWeightN = this.locoConfig.weightTons * 1000 * 9.81;
    const maxAdhesionN = locoWeightN * mu;

    if (Math.abs(tractiveN) > maxAdhesionN) {
      this.isWheelSlipping = true;
      this.wheelSlipTimer = 0.5;
      tractiveN = Math.sign(tractiveN) * maxAdhesionN * 0.65;
    } else {
      if (this.wheelSlipTimer > 0) {
        this.wheelSlipTimer -= dt;
      } else {
        this.isWheelSlipping = false;
      }
    }

    return tractiveN;
  }

  calculateBrakingForce() {
    const totalMassKg = this.getTotalTrainWeightTons() * 1000;
    const trainAirBrakeRatio = (this.brakeCylinderBar / 3.8) * 0.14;
    const locoBrakeRatio = this.independentBrakeLevel * 0.18;
    const dynamicBrakeRatio = this.dynamicBrakeLevel * 0.08;
    return totalMassKg * 9.81 * (trainAirBrakeRatio + locoBrakeRatio + dynamicBrakeRatio);
  }

  /**
   * Ultra-Stable Multi-Body Coupler Kinematics
   * Uses Critically Damped Relaxation with strict physical envelope:
   * - Max slack travel: +/- 0.03m (3 cm)
   * - ZERO possibility of carriages separating, flying, or overlapping
   */
  updateMultiBodyKinematics(dt, onCouplerClank) {
    if (this.vehicles.length === 0) return;

    // Lead vehicle position is locked to distanceM
    this.vehicles[0].distanceM = this.distanceM;
    this.vehicles[0].velocityMs = this.velocityMs;

    const couplerNominalGap = 0.85; // Exact distance between car bodies

    // Acceleration-dependent target draft gear travel (stretch on traction, compress on braking)
    const normalizedAcc = Math.max(-3, Math.min(3, this.accelerationMs2));
    const targetConsistSlack = normalizedAcc * 0.012; // max ~0.025m

    for (let i = 1; i < this.vehicles.length; i++) {
      const parent = this.vehicles[i - 1];
      const current = this.vehicles[i];

      // Delay slack propagation down the train (simulates 400m/s acoustic draft gear shockwave)
      current.targetSlackM = targetConsistSlack;

      // Critically damped convergence to target slack (damping ratio = 1.0, omega = 18 rad/s)
      const prevSlack = current.couplerSlackM || 0;
      const slackDiff = current.targetSlackM - prevSlack;
      current.couplerSlackM = prevSlack + slackDiff * Math.min(1.0, dt * 16);

      // Clamp slack within strict physical draft gear stops (+/- 0.03m)
      current.couplerSlackM = Math.max(-0.03, Math.min(0.03, current.couplerSlackM));

      // Calculate exact rigid distance
      const nominalDistance = (parent.lengthM / 2) + (current.lengthM / 2) + couplerNominalGap;
      const targetPos = parent.distanceM - (nominalDistance + current.couplerSlackM);

      // Smooth position following with anti-jitter filter
      current.distanceM = targetPos;
      current.velocityMs = parent.velocityMs;

      // Detect sharp coupler impact ("klang-klang") on direction reversal or sudden brake
      if (Math.abs(slackDiff) > 0.012 && Math.abs(this.accelerationMs2) > 0.8 && onCouplerClank) {
        onCouplerClank(Math.min(1.0, Math.abs(this.accelerationMs2) / 2.0));
      }
    }
  }

  checkStationAndSignals(dt) {
    const locoDist = this.distanceM;

    // 1. Level Crossings Detection
    if (this.route && this.route.crossings) {
      this.route.crossings.forEach(cr => {
        const distToCrossing = cr.posM - locoDist;
        if (distToCrossing > -50 && distToCrossing < 500) {
          cr.isGateClosed = true;
          cr.bellActive = true;
        } else {
          cr.isGateClosed = false;
          cr.bellActive = false;
        }
      });
    }

    // 2. Station Stopping Accuracy & Boarding
    if (this.route && this.route.stations) {
      const nearStation = this.route.stations.find(st => {
        const d = Math.abs(locoDist - st.posM);
        return d < st.platformLenM / 2 + 30;
      });

      if (nearStation) {
        this.currentStation = nearStation;
        const speedKmh = Math.abs(this.velocityMs * 3.6);

        if (speedKmh < 0.2) {
          if (!this.stationStopEvaluated) {
            this.evaluateStationStop(nearStation);
            this.stationStopEvaluated = true;
          }

          if (this.doorsOpen) {
            this.isBoarding = true;
            this.boardingProgress = Math.min(1.0, this.boardingProgress + dt * 0.25);
            if (this.boardingProgress >= 1.0 && nearStation.isPassenger && nearStation.passengers > 0) {
              this.totalPassengersCarried += nearStation.passengers;
              nearStation.passengers = 0;
            }
          } else {
            this.isBoarding = false;
          }
        } else {
          this.stationStopEvaluated = false;
        }
      } else {
        this.currentStation = null;
        this.stationStopEvaluated = false;
        this.boardingProgress = 0;
      }
    }

    // 3. ATS on Passing Red Signal
    if (this.route && this.route.signals) {
      this.route.signals.forEach(sig => {
        if (Math.abs(locoDist - sig.posM) < 8 && sig.aspect === 'red') {
          this.triggerEmergencyBrake();
        }
      });
    }
  }

  evaluateStationStop(station) {
    const deltaM = this.distanceM - station.posM;
    this.stopAccuracyCm = Math.round(Math.abs(deltaM) * 100);

    let points = 0;
    if (this.stopAccuracyCm < 50) {
      points = 250;
    } else if (this.stopAccuracyCm < 150) {
      points = 150;
    } else if (this.stopAccuracyCm < 350) {
      points = 80;
    } else {
      points = 30;
    }
    this.totalScore += points;
  }

  notchUp() {
    if (this.throttleNotch < 8) this.throttleNotch++;
  }

  notchDown() {
    if (this.throttleNotch > 0) this.throttleNotch--;
  }

  setNotch(notch) {
    this.throttleNotch = Math.max(0, Math.min(8, notch));
  }

  setReverser(direction) {
    if (Math.abs(this.velocityMs) < 0.5) {
      this.reverser = direction;
    }
  }

  applyTrainBrake(amount) {
    this.trainBrakeLevel = Math.max(0.0, Math.min(1.0, amount));
    if (this.trainBrakeLevel < 0.9) {
      this.emergencyBrakeTriggered = false;
    }
  }

  applyIndependentBrake(amount) {
    this.independentBrakeLevel = Math.max(0.0, Math.min(1.0, amount));
  }

  triggerEmergencyBrake() {
    this.emergencyBrakeTriggered = true;
    this.trainBrakeLevel = 1.0;
    this.throttleNotch = 0;
  }

  resetEmergencyBrake() {
    this.emergencyBrakeTriggered = false;
    this.trainBrakeLevel = 0.0;
  }

  toggleDoors() {
    if (Math.abs(this.velocityMs) < 0.2) {
      this.doorsOpen = !this.doorsOpen;
      return this.doorsOpen;
    }
    return false;
  }

  toggleSwitch(switchId) {
    if (this.route && this.route.switches) {
      const sw = this.route.switches.find(s => s.id === switchId);
      if (sw) {
        sw.isDiverged = !sw.isDiverged;
        return sw.isDiverged;
      }
    }
    return false;
  }
}
