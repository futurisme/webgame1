/**
 * MOBA Data: Heroes, Roles, Skills, Items, and Battle Spells.
 * Inspired by competitive Mobile Legends: Bang Bang (MLBB).
 * 100% Pure JavaScript, ultra-lightweight, zero external dependencies.
 */

export const ROLES = {
  EXP: 'exp',       // EXP Lane: Fighter / Offlane
  JUNGLE: 'jungle', // Jungler: Assassin / Retribution Farmer
  MID: 'mid',       // Mid Lane: Mage / Burst & Waveclear
  GOLD: 'gold',     // Gold Lane: Marksman / Late-Game Carry
  ROAM: 'roam'      // Roamer: Tank / Support Initiator
};

export const ROLE_LABELS = {
  exp: { name: 'EXP Lane', title: 'Fighter / Offlane', color: '#f59e0b', desc: 'Mandiri di offlane, kuat bertahan dan inisiasi teamfight.' },
  jungle: { name: 'Jungler', title: 'Assassin / Core', color: '#8b5cf6', desc: 'Farming monster jungle dengan Retribution, gank lane lain.' },
  mid: { name: 'Mid Lane', title: 'Mage / Burst', color: '#06b6d4', desc: 'Bersihkan minion tengah cepat, rotasi bantu EXP & Gold.' },
  gold: { name: 'Gold Lane', title: 'Marksman / Carry', color: '#eab308', desc: 'Farming gold cepat dari siege minion, pemberi damage utama akhir game.' },
  roam: { name: 'Roamer', title: 'Tank / Initiator', color: '#10b981', desc: 'Buka map (bush check), inisiasi pertarungan, lindungi carry.' }
};

export const BATTLE_SPELLS = {
  retribution: {
    id: 'retribution',
    name: 'Retribution',
    cd: 35,
    iconKey: 'retribution',
    color: '#8b5cf6',
    desc: 'Memberikan 1000 (+100x Lv) True Damage ke monster jungle / minion. Wajib untuk Jungler!'
  },
  flicker: {
    id: 'flicker',
    name: 'Flicker',
    cd: 120,
    iconKey: 'flicker',
    color: '#38bdf8',
    desc: 'Teleport seketika ke arah kursor mouse (jarak 240px). Menembus dinding & lolos dari bahaya.'
  },
  execute: {
    id: 'execute',
    name: 'Execute',
    cd: 90,
    iconKey: 'execute',
    color: '#ef4444',
    desc: 'Memberikan 200 (+15% HP hilang lawan) True Damage ke hero musuh terdekat. Cooldown berkurang 40% jika membunuh.'
  },
  purify: {
    id: 'purify',
    name: 'Purify',
    cd: 90,
    iconKey: 'purify',
    color: '#10b981',
    desc: 'Seketika melepaskan semua efek Crowd Control (stun/slow) & memberikan imun CC + 30% speed selama 1.2 detik.'
  },
  sprint: {
    id: 'sprint',
    name: 'Sprint',
    cd: 100,
    iconKey: 'sprint',
    color: '#f97316',
    desc: 'Meningkatkan Kecepatan Gerak sebesar 45% dan kebal efek slow selama 8 detik.'
  },
  aegis: {
    id: 'aegis',
    name: 'Aegis',
    cd: 90,
    iconKey: 'aegis',
    color: '#eab308',
    desc: 'Seketika mendapatkan shield 750 (+50x Lv) selama 4 detik, dan memberikan 70% shield ke rekan HP terendah di dekatnya.'
  }
};

export const ITEMS_DATA = [
  // Physical Attack
  {
    id: 'bod',
    name: 'Blade of Despair',
    category: 'attack',
    cost: 3010,
    iconKey: 'bod',
    stats: { physicalAttack: 160, moveSpeed: 15 },
    desc: 'Pasif: Menyerang lawan dengan HP di bawah 50% meningkatkan Physical Attack sebesar 25% selama 2 detik.'
  },
  {
    id: 'fury',
    name: "Berserker's Fury",
    category: 'attack',
    cost: 2250,
    iconKey: 'fury',
    stats: { physicalAttack: 65, critChance: 0.25, critDamage: 0.4 },
    desc: 'Pasif: Serangan Critical memberikan +5% Physical Attack tambahan selama 2 detik.'
  },
  {
    id: 'malefic',
    name: 'Malefic Roar',
    category: 'attack',
    cost: 2060,
    iconKey: 'malefic',
    stats: { physicalAttack: 60, physicalPen: 35 },
    desc: 'Pasif: Setiap poin Physical Defense musuh meningkatkan penetrasi armor hingga 20% ekstra.'
  },
  {
    id: 'endless',
    name: 'Endless Battle',
    category: 'attack',
    cost: 2470,
    iconKey: 'endless',
    stats: { physicalAttack: 65, hp: 250, cdr: 0.1, lifesteal: 0.1, moveSpeed: 15 },
    desc: 'Pasif: Setelah menggunakan skill, Basic Attack berikutnya memberikan True Damage tambahan sebesar 60% Physical Attack.'
  },
  {
    id: 'windtalker',
    name: 'Windtalker',
    category: 'attack',
    cost: 1820,
    iconKey: 'windtalker',
    stats: { attackSpeed: 0.4, moveSpeed: 30, critChance: 0.1 },
    desc: 'Pasif: Setiap 3-5 detik, serangan berikutnya memicu pantulan angin sihir mengenai 3 lawan.'
  },
  {
    id: 'haas',
    name: "Haas's Claws",
    category: 'attack',
    cost: 2020,
    iconKey: 'haas',
    stats: { physicalAttack: 70, lifesteal: 0.25 },
    desc: 'Pasif: Ketika HP di bawah 50%, lifesteal meningkat ekstra 15%.'
  },

  // Magic Power
  {
    id: 'holy_crystal',
    name: 'Holy Crystal',
    category: 'magic',
    cost: 2180,
    iconKey: 'holy_crystal',
    stats: { magicPower: 100 },
    desc: 'Pasif: Meningkatkan total Magic Power sebesar 21% - 35% (skala level hero).'
  },
  {
    id: 'lightning',
    name: 'Lightning Truncheon',
    category: 'magic',
    cost: 2250,
    iconKey: 'lightning',
    stats: { magicPower: 75, mana: 400, cdr: 0.1 },
    desc: 'Pasif: Setiap 6 detik, skill berikutnya memicu sambaran petir menyengat 3 musuh.'
  },
  {
    id: 'genius_wand',
    name: 'Genius Wand',
    category: 'magic',
    cost: 2000,
    iconKey: 'genius_wand',
    stats: { magicPower: 75, magicPen: 12, moveSpeed: 15 },
    desc: 'Pasif: Memberikan damage ke lawan mengurangi 3-7 Magic Defense mereka selama 2 detik (dapat di-stack).'
  },
  {
    id: 'glowing_wand',
    name: 'Glowing Wand',
    category: 'magic',
    cost: 2200,
    iconKey: 'glowing_wand',
    stats: { magicPower: 75, hp: 400, moveSpeed: 15 },
    desc: 'Pasif: Membakar target selama 3 detik, memberikan damage sihir 1.5% dari HP maksimal musuh per detik.'
  },
  {
    id: 'divine_glaive',
    name: 'Divine Glaive',
    category: 'magic',
    cost: 1970,
    iconKey: 'divine_glaive',
    stats: { magicPower: 65, magicPen: 35 },
    desc: 'Pasif: Menembus pertahanan magic tank lawan dengan efektivitas penetrasi tinggi.'
  },
  {
    id: 'blood_wings',
    name: 'Blood Wings',
    category: 'magic',
    cost: 3000,
    iconKey: 'blood_wings',
    stats: { magicPower: 175, hp: 500 },
    desc: 'Pasif: Memberikan shield pelindung setara 800 poin yang menyerap serangan dan menambah kecepatan lari.'
  },

  // Defense
  {
    id: 'athena',
    name: "Athena's Shield",
    category: 'defense',
    cost: 2150,
    iconKey: 'athena',
    stats: { hp: 900, magicDef: 62, hpRegen: 2 },
    desc: 'Pasif: Saat menerima Magic Damage, memicu shield yang mereduksi Magic Damage sebesar 25% selama 3 detik.'
  },
  {
    id: 'antique',
    name: 'Antique Cuirass',
    category: 'defense',
    cost: 2170,
    iconKey: 'antique',
    stats: { hp: 920, physicalDef: 54, hpRegen: 4 },
    desc: 'Pasif: Diserang dengan skill musuh mengurangi Physical Attack lawan sebesar 8% (stack 3x).'
  },
  {
    id: 'immortality',
    name: 'Immortality',
    category: 'defense',
    cost: 2120,
    iconKey: 'immortality',
    stats: { hp: 800, physicalDef: 20 },
    desc: 'Pasif: Bangkit kembali setelah tereliminasi (cooldown 210 detik), dengan 16% HP dan shield 1200 poin!'
  },
  {
    id: 'dominance',
    name: 'Dominance Ice',
    category: 'defense',
    cost: 2010,
    iconKey: 'dominance',
    stats: { mana: 500, physicalDef: 70, moveSpeed: 15 },
    desc: 'Pasif: Mengurangi Attack Speed lawan di sekitar sebesar 65% dan mengurangi efek Regen/Lifesteal mereka 50%.'
  },
  {
    id: 'blade_armor',
    name: 'Blade Armor',
    category: 'defense',
    cost: 1960,
    iconKey: 'blade_armor',
    stats: { physicalDef: 90, critResist: 0.2 },
    desc: 'Pasif: Memantulkan 25% damage basic attack musuh kembali ke penyerangnya sebagai physical damage.'
  },

  // Boots
  {
    id: 'warrior_boots',
    name: 'Warrior Boots',
    category: 'movement',
    cost: 720,
    iconKey: 'warrior_boots',
    stats: { physicalDef: 22, moveSpeed: 40 },
    desc: 'Meningkatkan Physical Defense saat terkena basic attack.'
  },
  {
    id: 'tough_boots',
    name: 'Tough Boots',
    category: 'movement',
    cost: 700,
    iconKey: 'tough_boots',
    stats: { magicDef: 22, moveSpeed: 40, resilience: 0.3 },
    desc: 'Mengurangi durasi terkena crowd control (stun/slow) sebesar 30%.'
  },
  {
    id: 'demon_shoes',
    name: 'Demon Shoes',
    category: 'movement',
    cost: 720,
    iconKey: 'demon_shoes',
    stats: { manaRegen: 6, moveSpeed: 40 },
    desc: 'Memulihkan Mana saat mengeliminasi minion atau hero musuh.'
  },
  {
    id: 'swift_boots',
    name: 'Swift Boots',
    category: 'movement',
    cost: 710,
    iconKey: 'swift_boots',
    stats: { attackSpeed: 0.15, moveSpeed: 40 },
    desc: 'Meningkatkan Attack Speed untuk Marksman.'
  }
];

export const HEROES_DATA = {
  // 1. TIGREAL - Roamer (Tank)
  tigreal: {
    id: 'tigreal',
    name: 'Tigreal',
    title: 'Warrior of Dawn',
    role: ROLES.ROAM,
    avatarColor: '#3b82f6',
    defaultSpell: 'flicker',
    recommendedItems: ['tough_boots', 'athena', 'antique', 'dominance', 'immortality', 'blade_armor'],
    quote: 'A warrior never surrenders!',
    stats: {
      hp: 2890,
      hpGrowth: 260,
      mana: 450,
      manaGrowth: 40,
      physicalAttack: 112,
      attackGrowth: 7.5,
      magicPower: 0,
      physicalDef: 30,
      defGrowth: 4.2,
      magicDef: 20,
      magicDefGrowth: 2.5,
      moveSpeed: 255,
      attackSpeed: 0.85,
      attackRange: 80, // Melee
      isRanged: false
    },
    skills: {
      passive: {
        name: 'Fearless',
        desc: 'Mendapatkan lapisan pelindung setiap menggunakan skill atau terkena basic attack. Pada 4 stack, kebal terhadap basic attack berikutnya.'
      },
      skill1: {
        name: 'Attack Wave',
        key: '1',
        cd: 7,
        manaCost: 45,
        range: 320,
        type: 'line',
        desc: 'Menghempaskan pedang ke tanah, menembakkan gelombang kejut yang memberikan 320 (+80% ATK) Damage & Slow 40% selama 1.5 detik.'
      },
      skill2: {
        name: 'Sacred Hammer',
        key: '2',
        cd: 11,
        manaCost: 70,
        range: 280,
        type: 'dash',
        desc: 'Melesat ke depan mendorong musuh yang dilewati, lalu mengayunkan palu ke atas melempar musuh ke udara (Airborne) selama 1 detik.'
      },
      ultimate: {
        name: 'Implosion',
        key: '3',
        cd: 40,
        manaCost: 110,
        range: 250,
        type: 'aoe',
        desc: 'Menancapkan pedang ke tanah dengan daya magnet kuat, menarik semua hero musuh di sekitarnya dan memberikan Stun selama 1.5 detik!'
      }
    }
  },

  // 2. LAYLA - Gold Lane (Marksman)
  layla: {
    id: 'layla',
    name: 'Layla',
    title: 'Shining Cannon',
    role: ROLES.GOLD,
    avatarColor: '#eab308',
    defaultSpell: 'flicker',
    recommendedItems: ['swift_boots', 'windtalker', 'fury', 'haas', 'malefic', 'bod'],
    quote: 'We can do it!',
    stats: {
      hp: 2400,
      hpGrowth: 175,
      mana: 400,
      manaGrowth: 35,
      physicalAttack: 125,
      attackGrowth: 11,
      magicPower: 0,
      physicalDef: 15,
      defGrowth: 3.2,
      magicDef: 15,
      magicDefGrowth: 1.5,
      moveSpeed: 240,
      attackSpeed: 1.05,
      attackRange: 310, // Ranged (scales up to 410)
      isRanged: true
    },
    skills: {
      passive: {
        name: 'Malefic Gun',
        desc: 'Jangkauan tembakan dan damage meningkat seiring level, menghasilkan hingga +35% damage lebih tinggi pada target yang jauh.'
      },
      skill1: {
        name: 'Malefic Bomb',
        key: '1',
        cd: 5,
        manaCost: 40,
        range: 420,
        type: 'line',
        desc: 'Menembakkan peluru energi lurus. Jika mengenai sasaran, memberikan 340 (+120% ATK) Damage dan menambah 40% Movement Speed Layla.'
      },
      skill2: {
        name: 'Void Projectile',
        key: '2',
        cd: 8,
        manaCost: 60,
        range: 360,
        type: 'aoe',
        desc: 'Menembakkan bola energi ledak yang meledak pada area target, memberikan 280 Damage, slow 40%, dan menandai musuh untuk ekstra damage.'
      },
      ultimate: {
        name: 'Destruction Rush',
        key: '3',
        cd: 36,
        manaCost: 120,
        range: 750, // Massive laser
        type: 'beam',
        desc: 'Menembakkan meriam laser raksasa berjarak sangat jauh, memusnahkan semua musuh di jalurnya dengan 650 (+180% ATK) Physical Damage!'
      }
    }
  },

  // 3. EUDORA - Mid Lane (Mage)
  eudora: {
    id: 'eudora',
    name: 'Eudora',
    title: 'Lightning Sorceress',
    role: ROLES.MID,
    avatarColor: '#06b6d4',
    defaultSpell: 'flicker',
    recommendedItems: ['demon_shoes', 'genius_wand', 'lightning', 'holy_crystal', 'divine_glaive', 'blood_wings'],
    quote: 'Feel the power of lightning!',
    stats: {
      hp: 2350,
      hpGrowth: 165,
      mana: 500,
      manaGrowth: 55,
      physicalAttack: 105,
      attackGrowth: 6,
      magicPower: 0,
      physicalDef: 16,
      defGrowth: 3.0,
      magicDef: 15,
      magicDefGrowth: 1.5,
      moveSpeed: 245,
      attackSpeed: 0.9,
      attackRange: 270,
      isRanged: true
    },
    skills: {
      passive: {
        name: 'Superconductor',
        desc: 'Skill Eudora menandai musuh dengan Superconductor selama 3 detik, memperkuat efek skill berikutnya secara dramatis.'
      },
      skill1: {
        name: 'Forked Lightning',
        key: '1',
        cd: 6,
        manaCost: 65,
        range: 340,
        type: 'cone',
        desc: 'Menyemburkan gelombang petir bercabang, memberikan 450 (+150% Magic) Magic Damage. Mengurangi magic resist musuh bertanda Superconductor.'
      },
      skill2: {
        name: 'Electric Arrow',
        key: '2',
        cd: 10,
        manaCost: 80,
        range: 320,
        type: 'target',
        desc: 'Melepaskan bola petir berputar ke target, memberikan 350 Magic Damage dan Stun selama 1.2 detik. Jika bertanda Superconductor, menyengat hero terdekat.'
      },
      ultimate: {
        name: "Thunder's Wrath",
        key: '3',
        cd: 32,
        manaCost: 130,
        range: 360,
        type: 'target_aoe',
        desc: 'Menurunkan badai halilintar kiamat ke target! Menghasilkan ledakan 780 (+210% Magic) Damage instan yang memusnahkan hero tipis!'
      }
    }
  },

  // 4. ALUCARD - Jungler (Fighter / Assassin)
  alucard: {
    id: 'alucard',
    name: 'Alucard',
    title: 'Demon Hunter',
    role: ROLES.JUNGLE,
    avatarColor: '#8b5cf6',
    defaultSpell: 'retribution',
    recommendedItems: ['warrior_boots', 'endless', 'haas', 'fury', 'malefic', 'immortality'],
    quote: 'Nothing lasts forever, we can change the future!',
    stats: {
      hp: 2750,
      hpGrowth: 215,
      mana: 0, // Energy / no mana
      manaGrowth: 0,
      physicalAttack: 128,
      attackGrowth: 10.5,
      magicPower: 0,
      physicalDef: 24,
      defGrowth: 3.8,
      magicDef: 18,
      magicDefGrowth: 2.0,
      moveSpeed: 285,
      attackSpeed: 1.0,
      attackRange: 90,
      isRanged: false
    },
    skills: {
      passive: {
        name: 'Pursuit',
        desc: 'Setelah menggunakan skill, basic attack berikutnya membuat Alucard melompat ke arah target dengan +20% bonus damage dan lifesteal tinggi.'
      },
      skill1: {
        name: 'Groundsplitter',
        key: '1',
        cd: 8,
        manaCost: 0,
        range: 310,
        type: 'leap',
        desc: 'Melompat ke lokasi target, menghantam tanah dengan pedang besar memberikan 320 (+110% ATK) Damage & Slow 40%.'
      },
      skill2: {
        name: 'Whirling Smash',
        key: '2',
        cd: 5,
        manaCost: 0,
        range: 160,
        type: 'spin',
        desc: 'Memutar pedang iblis 360 derajat di sekitar tubuh, menyayat semua musuh di dekatnya dengan 350 (+120% ATK) Damage.'
      },
      ultimate: {
        name: 'Fission Wave',
        key: '3',
        cd: 30,
        manaCost: 0,
        range: 400,
        type: 'wave',
        desc: 'Mengunci target: meningkatkan Lifesteal Alucard sebesar 40% selama 8 detik. Dapat ditekan kembali untuk menembakkan sepasang gelombang energi tebasan dahsyat!'
      }
    }
  },

  // 5. CHOU - EXP Lane (Fighter)
  chou: {
    id: 'chou',
    name: 'Chou',
    title: 'Kung Fu Boy',
    role: ROLES.EXP,
    avatarColor: '#f59e0b',
    defaultSpell: 'flicker',
    recommendedItems: ['tough_boots', 'endless', 'blade_armor', 'antique', 'athena', 'bod'],
    quote: 'Knowing is not enough, we must apply!',
    stats: {
      hp: 2800,
      hpGrowth: 230,
      mana: 0,
      manaGrowth: 0,
      physicalAttack: 120,
      attackGrowth: 9.5,
      magicPower: 0,
      physicalDef: 26,
      defGrowth: 3.8,
      magicDef: 18,
      magicDefGrowth: 2.0,
      moveSpeed: 280,
      attackSpeed: 0.95,
      attackRange: 85,
      isRanged: false
    },
    skills: {
      passive: {
        name: 'Only Fast',
        desc: 'Setiap bergerak 8 yard, basic attack berikutnya menghasilkan 180% Critical Damage dan memperlambat musuh sebesar 80%.'
      },
      skill1: {
        name: 'Jeet Kune Do',
        key: '1',
        cd: 9,
        manaCost: 0,
        range: 220,
        type: 'combo',
        desc: 'Jurus tinju 3 tahap! Pukulan 1 & 2 memberikan 200 Damage. Pukulan ke-3 menghempaskan musuh ke udara (Knockup) selama 1 detik.'
      },
      skill2: {
        name: 'Shunpo',
        key: '2',
        cd: 5,
        manaCost: 0,
        range: 240,
        type: 'dash_immune',
        desc: 'Melesat ke depan dengan gesit, kebal terhadap semua efek Crowd Control saat bergerak dan mendapatkan shield pelindung 350 poin.'
      },
      ultimate: {
        name: 'The Way of Dragon',
        key: '3',
        cd: 34,
        manaCost: 0,
        range: 200,
        type: 'kick',
        desc: 'Tendangan maut putar naga! Menendang musuh terpilih terbang jauh ke arah tim, lalu melompat memukul bertubi-tubi di udara!'
      }
    }
  },

  // 6. MIYA - Gold Lane (Marksman / Stealth)
  miya: {
    id: 'miya',
    name: 'Miya',
    title: 'Moonlight Archer',
    role: ROLES.GOLD,
    avatarColor: '#38bdf8',
    defaultSpell: 'flicker',
    recommendedItems: ['swift_boots', 'windtalker', 'fury', 'haas', 'malefic', 'bod'],
    quote: 'Wise choice!',
    stats: {
      hp: 2380,
      hpGrowth: 170,
      mana: 420,
      manaGrowth: 38,
      physicalAttack: 122,
      attackGrowth: 10.8,
      magicPower: 0,
      physicalDef: 16,
      defGrowth: 3.1,
      magicDef: 15,
      magicDefGrowth: 1.5,
      moveSpeed: 250,
      attackSpeed: 1.1,
      attackRange: 290,
      isRanged: true
    },
    skills: {
      passive: {
        name: 'Moon Blessing',
        desc: 'Setiap mengenai musuh dengan basic attack meningkatkan Attack Speed sebesar 5% (stack hingga 5x). Pada stack penuh, memanggil bayangan bulan penyerang.'
      },
      skill1: {
        name: 'Moon Arrow',
        key: '1',
        cd: 7,
        manaCost: 50,
        range: 300,
        type: 'split',
        desc: 'Membelah panah menjadi 3 arah selama 6 detik, memberikan damage serempak ke target utama dan musuh di sekitarnya.'
      },
      skill2: {
        name: 'Arrow of Eclipse',
        key: '2',
        cd: 10,
        manaCost: 65,
        range: 340,
        type: 'aoe_root',
        desc: 'Menghujani area target dengan panah gerhana bulan, memberikan 260 Damage dan mengikat musuh (Immobilize) di tengahnya selama 1.2 detik.'
      },
      ultimate: {
        name: 'Hidden Moonlight',
        key: '3',
        cd: 38,
        manaCost: 90,
        range: 0,
        type: 'stealth',
        desc: 'Seketika melepaskan semua efek CC, memasuki mode tidak terlihat (Stealth) dan meningkatkan Kecepatan Gerak sebesar 45% selama 2 detik!'
      }
    }
  },

  // 7. GROCK - Roamer (Tank / Vanguard)
  grock: {
    id: 'grock',
    name: 'Grock',
    title: 'Fortress Titan',
    role: ROLES.ROAM,
    avatarColor: '#10b981',
    defaultSpell: 'flicker',
    recommendedItems: ['warrior_boots', 'antique', 'athena', 'blade_armor', 'immortality', 'dominance'],
    quote: 'Welcome to my castle!',
    stats: {
      hp: 2950,
      hpGrowth: 270,
      mana: 400,
      manaGrowth: 30,
      physicalAttack: 125,
      attackGrowth: 8,
      magicPower: 0,
      physicalDef: 32,
      defGrowth: 4.5,
      magicDef: 22,
      magicDefGrowth: 2.8,
      moveSpeed: 270,
      attackSpeed: 0.8,
      attackRange: 85,
      isRanged: false
    },
    skills: {
      passive: {
        name: 'Ancestral Gift',
        desc: 'Ketika berada di dekat dinding atau turret, Grock mendapatkan +40 Physical & Magic Defense serta regenerasi HP cepat.'
      },
      skill1: {
        name: 'Power of Nature',
        key: '1',
        cd: 6,
        manaCost: 50,
        range: 220,
        type: 'spin_charge',
        desc: 'Memutar senjata batu raksasa. Menahan tombol membuat Grock kebal CC. Saat dilepaskan, menghantam dengan 420 (+140% ATK) Damage.'
      },
      skill2: {
        name: "Guardian's Barrier",
        key: '2',
        cd: 12,
        manaCost: 70,
        range: 350,
        type: 'wall',
        desc: 'Mendirikan tembok batu tebal di lokasi target selama 4 detik yang tidak bisa dilewati musuh, memotong jalur kabur lawan.'
      },
      ultimate: {
        name: 'Wild Charge',
        key: '3',
        cd: 38,
        manaCost: 100,
        range: 380,
        type: 'dash_slam',
        desc: 'Menyeruduk ke depan dengan kekuatan dahsyat, melempar musuh ke udara. Jika menabrak dinding, memicu ledakan gelombang gempa dahsyat!'
      }
    }
  },

  // 8. BALMOND - EXP Lane (Fighter / Berserker)
  balmond: {
    id: 'balmond',
    name: 'Balmond',
    title: 'Bloody Beast',
    role: ROLES.EXP,
    avatarColor: '#dc2626',
    defaultSpell: 'execute',
    recommendedItems: ['warrior_boots', 'war_axe', 'bloodlust', 'antique', 'athena', 'immortality'],
    quote: 'My axe thirsts for blood!',
    stats: {
      hp: 2850,
      hpGrowth: 240,
      mana: 0,
      manaGrowth: 0,
      physicalAttack: 122,
      attackGrowth: 9,
      magicPower: 0,
      physicalDef: 28,
      defGrowth: 4.0,
      magicDef: 20,
      magicDefGrowth: 2.2,
      moveSpeed: 275,
      attackSpeed: 0.9,
      attackRange: 85,
      isRanged: false
    },
    skills: {
      passive: {
        name: 'Bloodthirst',
        desc: 'Memulihkan 5% Max HP setiap kali mengeliminasi minion, dan memulihkan 20% Max HP seketika saat membunuh hero musuh.'
      },
      skill1: {
        name: 'Soul Lock',
        key: '1',
        cd: 7,
        manaCost: 0,
        range: 260,
        type: 'dash',
        desc: 'Menerjang ke depan menghantam musuh, memberikan 250 Damage dan memperlambat gerak mereka sebesar 30%.'
      },
      skill2: {
        name: 'Cyclone Sweep',
        key: '2',
        cd: 6,
        manaCost: 0,
        range: 170,
        type: 'spin_continuous',
        desc: 'Memutar kapak raksasa terus menerus selama 3 detik sambil tetap bisa bergerak, menghasilkan tebasan berulang yang semakin sakit!'
      },
      ultimate: {
        name: 'Lethal Counter',
        key: '3',
        cd: 28,
        manaCost: 0,
        range: 220,
        type: 'slam_execute',
        desc: 'Menghantamkan kapak raksasa ke tanah berbentuk kerucut, memberikan 400 (+25% HP hilang target) True Damage eksekusi mati!'
      }
    }
  },

  // 9. GUSION - Jungler (Assassin / High Burst)
  gusion: {
    id: 'gusion',
    name: 'Gusion',
    title: 'Holy Blade',
    role: ROLES.JUNGLE,
    avatarColor: '#a855f7',
    defaultSpell: 'retribution',
    recommendedItems: ['demon_shoes', 'genius_wand', 'lightning', 'holy_crystal', 'divine_glaive', 'blood_wings'],
    quote: 'The perfect combination of magic and blade!',
    stats: {
      hp: 2520,
      hpGrowth: 180,
      mana: 450,
      manaGrowth: 45,
      physicalAttack: 115,
      attackGrowth: 7,
      magicPower: 0,
      physicalDef: 18,
      defGrowth: 3.4,
      magicDef: 16,
      magicDefGrowth: 1.8,
      moveSpeed: 295,
      attackSpeed: 1.0,
      attackRange: 90,
      isRanged: false
    },
    skills: {
      passive: {
        name: 'Dagger Specialist',
        desc: 'Setiap menggunakan skill mengisi rune pada belati. Pada 3 rune, basic attack berikutnya memberikan tambahan 15% dari HP musuh yang hilang.'
      },
      skill1: {
        name: 'Sword Spike',
        key: '1',
        cd: 6,
        manaCost: 50,
        range: 360,
        type: 'dagger_throw',
        desc: 'Melempar belati ke arah musuh. Tekan kembali untuk seketika teleport melesat ke belakang korban dan menusuknya!'
      },
      skill2: {
        name: 'Shadowblade Slaughter',
        key: '2',
        cd: 7,
        manaCost: 65,
        range: 320,
        type: 'dagger_fan',
        desc: 'Melemparkan kipas berisi 5 belati bercahaya. Tekan kembali untuk memanggil kelima belati pulang menusuk musuh di jalurnya!'
      },
      ultimate: {
        name: 'Incandescence',
        key: '3',
        cd: 26,
        manaCost: 100,
        range: 260,
        type: 'reset_blink',
        desc: 'Blink melesat ke arah target dan seketika mereset cooldown Skill 1 dan Skill 2 untuk kombo pembunuhan kilat ganda!'
      }
    }
  },

  // 10. KAGURA - Mid Lane (Mage / Yin Yang)
  kagura: {
    id: 'kagura',
    name: 'Kagura',
    title: 'Onmyouji Master',
    role: ROLES.MID,
    avatarColor: '#ec4899',
    defaultSpell: 'flicker',
    recommendedItems: ['demon_shoes', 'lightning', 'genius_wand', 'holy_crystal', 'divine_glaive', 'blood_wings'],
    quote: 'A thought to ponder, a dance of umbrella.',
    stats: {
      hp: 2420,
      hpGrowth: 170,
      mana: 480,
      manaGrowth: 50,
      physicalAttack: 108,
      attackGrowth: 6.5,
      magicPower: 0,
      physicalDef: 17,
      defGrowth: 3.2,
      magicDef: 15,
      magicDefGrowth: 1.5,
      moveSpeed: 250,
      attackSpeed: 0.9,
      attackRange: 260,
      isRanged: true
    },
    skills: {
      passive: {
        name: 'Yin Yang Gathering',
        desc: 'Saat memegang payung Seimei kembali, Kagura mendapatkan perisai 280 HP, men-stun musuh di sekitar dan memperlambat mereka.'
      },
      skill1: {
        name: 'Seimei Umbrella Open',
        key: '1',
        cd: 5,
        manaCost: 55,
        range: 400,
        type: 'umbrella_throw',
        desc: 'Melemparkan payung Seimei ke lokasi target, memberikan 330 (+105% Magic) Damage ke semua yang dilewati & slow 60%.'
      },
      skill2: {
        name: 'Rasho Umbrella Flee',
        key: '2',
        cd: 10,
        manaCost: 75,
        range: 250,
        type: 'umbrella_flee',
        desc: 'Melepaskan semua efek Crowd Control dan melompat kabur meninggalkan payung di tempat asal (atau teleport ke payung jika terpisah).'
      },
      ultimate: {
        name: 'Yin-Yang Overturn',
        key: '3',
        cd: 32,
        manaCost: 110,
        range: 300,
        type: 'umbrella_ult',
        desc: 'Payung melepaskan badai yin-yang: memberikan 420 Magic Damage, mengikat musuh dengan benang roh, dan menarik mereka ke pusat pusaran!'
      }
    }
  }
};
