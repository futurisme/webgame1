/**
 * Kingdom Idle: Reborn - Core State & Economy Model
 * Ultra-lightweight, 100% deterministic arithmetic, offline progression calculator.
 */

export const SAVE_KEY = 'KINGDOM_IDLE_REBORN_SAVE_V1';

export const TITLES = [
  { minPop: 0, title: 'Dusun Perintis', rank: 1, emblem: '🏕️' },
  { minPop: 15, title: 'Desa Makmur', rank: 2, emblem: '🏡' },
  { minPop: 50, title: 'Baroni Wilayah', rank: 3, emblem: '🏰' },
  { minPop: 150, title: 'Kadipaten Agung', rank: 4, emblem: '🛡️' },
  { minPop: 400, title: 'Kerajaan Berdaulat', rank: 5, emblem: '👑' },
  { minPop: 1000, title: 'Kekaisaran Abadi', rank: 6, emblem: '⚜️' },
  { minPop: 2500, title: 'Dinasti Surgawi', rank: 7, emblem: '🌟' }
];

export const SEASONS = [
  { id: 'spring', name: 'Musim Semi', icon: '🌸', color: '#10b981', foodMod: 1.25, woodMod: 1.1, desc: '+25% Hasil Pangan, Bibit Tumbuh Subur' },
  { id: 'summer', name: 'Musim Panas', icon: '☀️', color: '#f59e0b', foodMod: 1.0, stoneMod: 1.2, goldMod: 1.15, desc: '+20% Hasil Batu, Perdagangan Ramai' },
  { id: 'autumn', name: 'Musim Gugur', icon: '🍂', color: '#d97706', foodMod: 1.35, woodMod: 1.25, desc: '+35% Panen Melimpah, Kayu Siap Penebangan' },
  { id: 'winter', name: 'Musim Dingin', icon: '❄️', color: '#38bdf8', foodMod: 0.7, goldMod: 0.9, faithMod: 1.3, desc: '-30% Pangan Beku, +30% Doa di Kuil Hangat' }
];

export const BUILDINGS = {
  hovel: { id: 'hovel', name: 'Gubuk Rakyat', category: 'pop', cost: { wood: 15, gold: 10 }, costMult: 1.14, cap: 3, desc: 'Menampung +3 Warga baru.' },
  cottage: { id: 'cottage', name: 'Rumah Batu', category: 'pop', cost: { wood: 50, stone: 35, gold: 40 }, costMult: 1.16, cap: 8, desc: 'Menampung +8 Warga terdidik.' },
  estate: { id: 'estate', name: 'Kediaman Bangsawan', category: 'pop', cost: { wood: 200, stone: 160, gold: 220 }, costMult: 1.18, cap: 25, desc: 'Menampung +25 Warga bangsawan.' },

  farm: { id: 'farm', name: 'Lahan Gandum', category: 'prod', cost: { wood: 20, gold: 15 }, costMult: 1.15, desc: 'Meningkatkan produktivitas Petani +15%.' },
  windmill: { id: 'windmill', name: 'Kincir Angin', category: 'prod', cost: { wood: 120, stone: 60, gold: 80 }, costMult: 1.18, desc: 'Mengolah gandum efisien, +30% Pangan.' },
  lumberCamp: { id: 'lumberCamp', name: 'Kamp Penebang', category: 'prod', cost: { wood: 30, gold: 20 }, costMult: 1.15, desc: 'Meningkatkan efisiensi Penebang Kayu +15%.' },
  sawmill: { id: 'sawmill', name: 'Penggergajian Air', category: 'prod', cost: { wood: 150, stone: 80, gold: 120 }, costMult: 1.19, desc: 'Mempercepat olah kayu +35%.' },
  quarryDerrick: { id: 'quarryDerrick', name: 'Derek Tambang Batu', category: 'prod', cost: { wood: 70, stone: 40, gold: 50 }, costMult: 1.16, desc: 'Meningkatkan produksi Tambang Batu +20%.' },
  ironMineShaft: { id: 'ironMineShaft', name: 'Terowongan Besi Dalam', category: 'prod', cost: { wood: 140, stone: 100, gold: 90 }, costMult: 1.18, desc: 'Meningkatkan hasil Tambang Besi +25%.' },

  blacksmith: { id: 'blacksmith', name: 'Bengkel Pandai Besi', category: 'ind', cost: { wood: 90, stone: 70, gold: 60 }, costMult: 1.2, desc: 'Memungkinkan produksi Alat & Senjata Baja.' },
  marketStall: { id: 'marketStall', name: 'Pasar Rakyat', category: 'com', cost: { wood: 80, stone: 40, gold: 100 }, costMult: 1.17, desc: '+25% Pendapatan Emas dari perniagaan.' },
  guildHall: { id: 'guildHall', name: 'Balai Serikat Dagang', category: 'com', cost: { wood: 300, stone: 250, gold: 400 }, costMult: 1.22, desc: '+50% Efisiensi Pedagang & rute karavan.' },
  chapel: { id: 'chapel', name: 'Kapel Suci', category: 'rel', cost: { stone: 120, wood: 80, gold: 90 }, costMult: 1.18, desc: 'Menghasilkan Keimanan (Faith) untuk berkah kerajaan.' },
  cathedral: { id: 'cathedral', name: 'Katedral Agung', category: 'rel', cost: { stone: 600, gold: 800, tools: 50 }, costMult: 1.25, desc: '+100% Keimanan & memicu Doa Perlindungan.' },
  library: { id: 'library', name: 'Perpustakaan Kerajaan', category: 'sci', cost: { wood: 150, stone: 120, gold: 140 }, costMult: 1.18, desc: 'Tempat Cendekiawan meneliti Pengetahuan Kerajaan.' },
  arcaneTower: { id: 'arcaneTower', name: 'Menara Sihir Arcana', category: 'sci', cost: { stone: 450, gold: 500, mana: 50 }, costMult: 1.25, desc: 'Menyuling Mana untuk mantra percepatan kerajaan.' },

  barracks: { id: 'barracks', name: 'Barak Prajurit', category: 'mil', cost: { wood: 100, stone: 80, gold: 100 }, costMult: 1.18, capMil: 10, desc: 'Meningkatkan kapasitas garnisun +10 pasukan.' },
  fortressWall: { id: 'fortressWall', name: 'Dinding Benteng Batu', category: 'mil', cost: { stone: 350, iron: 150, gold: 200 }, costMult: 1.22, desc: '+30% Daya tahan garnisun & batas garnisun +20.' },
  siegeWorkshop: { id: 'siegeWorkshop', name: 'Bengkel Mesin Tempur', category: 'mil', cost: { wood: 400, iron: 250, gold: 350 }, costMult: 1.25, desc: 'Memproduksi Ketapel & Trebuchet penghancur benteng.' }
};

export const TECHNOLOGIES = [
  { id: 'cropRotation', name: 'Rotasi Tanaman', cost: 40, icon: '🌾', desc: '+30% Produksi Pangan permanen.' },
  { id: 'hardwoodAxe', name: 'Kapak Baja Tempa', cost: 75, icon: '🪓', desc: '+30% Hasil Penebangan Kayu.' },
  { id: 'stoneMasonry', name: 'Teknik Pahatan Batu', cost: 120, icon: '🧱', desc: '+35% Hasil Tambang Batu & gedung lebih kokoh.' },
  { id: 'blastFurnace', name: 'Tanur Tiup Logam', cost: 200, icon: '🔥', desc: '+40% Hasil Bijih Besi & Alat Baja.' },
  { id: 'tradeLedgers', name: 'Buku Kas Akuntansi', cost: 350, icon: '📜', desc: '+35% Pendapatan Emas dari Pajak & Pasar.' },
  { id: 'militaryDrill', name: 'Disiplin Formasi Militer', cost: 500, icon: '⚔️', desc: '+40% Kekuatan Tempur semua Pasukan.' },
  { id: 'divineBlessing', name: 'Hak Suci Mahkota', cost: 800, icon: '✨', desc: '+50% Keimanan & Menurunkan Biaya Kenaikan Tahta 15%.' },
  { id: 'grandLogistics', name: 'Jalur Logistik Kerajaan', cost: 1400, icon: '🗺️', desc: 'Mempersingkat waktu ekspedisi 35% & +25% Rampasan Perang.' },
  { id: 'arcaneAlchemy', name: 'Alkimia Transmutasi', cost: 2500, icon: '🔮', desc: '+100% Produksi Mana & Transmutasi Emas otomatis.' }
];

export const EXPEDITIONS = [
  { id: 'exp_bandit', name: 'Pembersihan Sarang Bandit', powerReq: 35, duration: 15, goldReward: 90, territoryReward: 1, icon: '🏹', desc: 'Hentikan pemalakan pedagang. Hadiah: Emas & Wilayah Perintis.' },
  { id: 'exp_goblin', name: 'Tambang Lembah Goblin', powerReq: 90, duration: 30, goldReward: 260, ironReward: 80, territoryReward: 2, icon: '⛏️', desc: 'Rebut kembali tambang bawah tanah. Hadiah: Besi & Tambahan Wilayah.' },
  { id: 'exp_ruins', name: 'Eksplorasi Reruntuhan Kuno', powerReq: 220, duration: 60, goldReward: 650, manaReward: 120, knowledgeReward: 150, territoryReward: 3, icon: '🏛️', desc: 'Gali artefak purba. Hadiah: Pengetahuan, Mana & Wilayah.' },
  { id: 'exp_baron', name: 'Penaklukan Benteng Pengkhianat', powerReq: 500, duration: 120, goldReward: 1800, territoryReward: 6, renownReward: 2, icon: '🏰', desc: 'Tundukkan Baron pemberontak. Hadiah: Wilayah Luas & Kemasyhuran.' },
  { id: 'exp_dragon', name: 'Perburuan Sarang Wyvern Kuno', powerReq: 1200, duration: 240, goldReward: 5000, territoryReward: 12, renownReward: 5, icon: '🐉', desc: 'Taklukkan naga penjaga harta karun kekaisaran. Hadiah: Legenda Kerajaan.' }
];

export const DYNASTIC_TALENTS = [
  { id: 'warlordBlood', name: 'Darah Sang Penakluk', maxRank: 10, costPerRank: 1, icon: '⚔️', desc: '+25% Kekuatan Militer & +20% Hasil Rampasan per level.' },
  { id: 'prosperousCrown', name: 'Mahkota Kemakmuran', maxRank: 10, costPerRank: 1, icon: '💰', desc: '+20% Pendapatan Emas & Sumber Daya per level.' },
  { id: 'fertileLands', name: 'Tanah Subur Abadi', maxRank: 10, costPerRank: 1, icon: '🌾', desc: '+30% Hasil Pangan & Pertumbuhan Rakyat per level.' },
  { id: 'eternalSteward', name: 'Pengurus Kerajaan Abadi', maxRank: 5, costPerRank: 2, icon: '⏳', desc: '+4 Jam batas Waktu Offline & +15% efisiensi idle per level.' },
  { id: 'masterBuilders', name: 'Arsitek Kekaisaran', maxRank: 10, costPerRank: 1, icon: '🏗️', desc: '-8% Biaya Konstruksi Gedung per level.' }
];

export class KingdomState {
  constructor() {
    this.resetDefaults();
  }

  resetDefaults() {
    this.name = 'Arcadia';
    this.creationTime = Date.now();
    this.lastTickTime = Date.now();
    this.lastSaveTime = Date.now();
    this.totalPlaytime = 0;

    // Resources
    this.food = 100;
    this.wood = 80;
    this.stone = 40;
    this.iron = 10;
    this.tools = 5;
    this.gold = 50;
    this.faith = 0;
    this.mana = 0;
    this.knowledge = 0;

    // Storage Caps
    this.baseStorage = 500;

    // Population
    this.population = 6;
    this.workers = {
      farmer: 3,
      woodcutter: 2,
      quarryman: 1,
      miner: 0,
      blacksmith: 0,
      merchant: 0,
      scholar: 0,
      priest: 0
    };

    // Military
    this.troops = {
      militia: 2,
      archer: 0,
      knight: 0,
      trebuchet: 0
    };

    // Buildings Owned
    this.buildings = {};
    Object.keys(BUILDINGS).forEach(k => {
      this.buildings[k] = 0;
    });
    this.buildings.hovel = 2; // initial housing for 6 pop

    // Technologies Researched
    this.researchedTechs = [];

    // Territories & Prestige
    this.territory = 1;
    this.reignNumber = 1;
    this.royalRenown = 0;
    this.totalRenownEarned = 0;
    this.dynasticTalents = {
      warlordBlood: 0,
      prosperousCrown: 0,
      fertileLands: 0,
      eternalSteward: 0,
      masterBuilders: 0
    };

    // Active Expeditions
    this.activeExpeditions = [];

    // Active Decrees / Edicts
    this.activeDecrees = {};
    this.decreeCooldowns = {};

    // Season System
    this.seasonIndex = 0;
    this.seasonTimer = 0;
    this.seasonDuration = 60; // 60 seconds per season

    // Random Event
    this.currentEvent = null;
    this.eventCooldown = 45;

    // Statistics
    this.stats = {
      totalGoldCollected: 50,
      totalExpeditionsWon: 0,
      totalCitizensBorn: 6,
      manualClicks: 0
    };
  }

  // Calculate Max Population
  getMaxPopulation() {
    let cap = 5;
    cap += (this.buildings.hovel || 0) * BUILDINGS.hovel.cap;
    cap += (this.buildings.cottage || 0) * BUILDINGS.cottage.cap;
    cap += (this.buildings.estate || 0) * BUILDINGS.estate.cap;
    return cap;
  }

  // Calculate Max Garrison Cap
  getMaxGarrison() {
    let cap = 15;
    cap += (this.buildings.barracks || 0) * (BUILDINGS.barracks.capMil || 10);
    cap += (this.buildings.fortressWall || 0) * 20;
    return cap;
  }

  getCurrentTroopCount() {
    return (
      (this.troops.militia || 0) +
      (this.troops.archer || 0) +
      (this.troops.knight || 0) +
      (this.troops.trebuchet || 0)
    );
  }

  getMilitaryPower() {
    let power =
      (this.troops.militia || 0) * 5 +
      (this.troops.archer || 0) * 12 +
      (this.troops.knight || 0) * 35 +
      (this.troops.trebuchet || 0) * 80;

    // Tech multiplier
    if (this.researchedTechs.includes('militaryDrill')) {
      power *= 1.4;
    }

    // Dynastic Talent: Warlord Blood (+25% per level)
    const talentMult = 1 + (this.dynasticTalents.warlordBlood || 0) * 0.25;
    power *= talentMult;

    // Decree multiplier
    if (this.isDecreeActive('conscription')) {
      power *= 1.25;
    }

    return Math.floor(power);
  }

  getTitleInfo() {
    let current = TITLES[0];
    for (const t of TITLES) {
      if (this.population >= t.minPop) {
        current = t;
      }
    }
    return current;
  }

  getIdleWorkers() {
    let assigned = 0;
    Object.values(this.workers).forEach(v => { assigned += v; });
    return Math.max(0, this.population - assigned);
  }

  // Building Cost Calculation with Dynastic Discount
  getBuildingCost(id) {
    const def = BUILDINGS[id];
    if (!def) return {};
    const count = this.buildings[id] || 0;
    const mult = Math.pow(def.costMult, count);
    const costDiscount = 1 - Math.min(0.6, (this.dynasticTalents.masterBuilders || 0) * 0.08);

    const cost = {};
    Object.entries(def.cost).forEach(([res, val]) => {
      cost[res] = Math.ceil(val * mult * costDiscount);
    });
    return cost;
  }

  canAfford(costObj) {
    for (const [res, val] of Object.entries(costObj)) {
      if ((this[res] || 0) < val) return false;
    }
    return true;
  }

  deductCost(costObj) {
    for (const [res, val] of Object.entries(costObj)) {
      this[res] = Math.max(0, (this[res] || 0) - val);
    }
  }

  buyBuilding(id, qty = 1) {
    let bought = 0;
    for (let i = 0; i < qty; i++) {
      const cost = this.getBuildingCost(id);
      if (this.canAfford(cost)) {
        this.deductCost(cost);
        this.buildings[id] = (this.buildings[id] || 0) + 1;
        bought++;
      } else {
        break;
      }
    }
    return bought;
  }

  // Calculate Net Production Rates per second
  getRates() {
    const season = SEASONS[this.seasonIndex] || SEASONS[0];
    const crownTalent = 1 + (this.dynasticTalents.prosperousCrown || 0) * 0.2;
    const fertileTalent = 1 + (this.dynasticTalents.fertileLands || 0) * 0.3;

    // Decrees
    const harvestDecree = this.isDecreeActive('harvest') ? 2.0 : 1.0;
    const tradeDecree = this.isDecreeActive('freeTrade') ? 2.5 : 1.0;

    // Food Production & Consumption
    let foodBase = (this.workers.farmer || 0) * 2.2;
    foodBase *= 1 + (this.buildings.farm || 0) * 0.15;
    foodBase *= 1 + (this.buildings.windmill || 0) * 0.30;
    if (this.researchedTechs.includes('cropRotation')) foodBase *= 1.30;
    foodBase *= (season.foodMod || 1.0);
    foodBase *= fertileTalent;
    foodBase *= harvestDecree;

    // Citizen Food Consumption: 0.8 food/sec per person
    const foodConsumption = this.population * 0.8;
    const foodNet = foodBase - foodConsumption;

    // Wood
    let woodBase = (this.workers.woodcutter || 0) * 1.8;
    woodBase *= 1 + (this.buildings.lumberCamp || 0) * 0.15;
    woodBase *= 1 + (this.buildings.sawmill || 0) * 0.35;
    if (this.researchedTechs.includes('hardwoodAxe')) woodBase *= 1.30;
    woodBase *= (season.woodMod || 1.0);
    woodBase *= crownTalent;

    // Stone
    let stoneBase = (this.workers.quarryman || 0) * 1.4;
    stoneBase *= 1 + (this.buildings.quarryDerrick || 0) * 0.20;
    if (this.researchedTechs.includes('stoneMasonry')) stoneBase *= 1.35;
    stoneBase *= (season.stoneMod || 1.0);
    stoneBase *= crownTalent;

    // Iron
    let ironBase = (this.workers.miner || 0) * 1.0;
    ironBase *= 1 + (this.buildings.ironMineShaft || 0) * 0.25;
    if (this.researchedTechs.includes('blastFurnace')) ironBase *= 1.40;
    ironBase *= crownTalent;

    // Tools & Weapons (Blacksmith consumes Iron & Wood)
    const smithCount = this.workers.blacksmith || 0;
    let toolsNet = 0;
    let blacksmithIronCost = 0;
    let blacksmithWoodCost = 0;
    if (smithCount > 0 && this.buildings.blacksmith > 0) {
      const ironReq = smithCount * 0.6;
      const woodReq = smithCount * 0.4;
      if (this.iron >= ironReq && this.wood >= woodReq) {
        toolsNet = smithCount * 0.5 * crownTalent;
        blacksmithIronCost = ironReq;
        blacksmithWoodCost = woodReq;
      }
    }

    // Gold
    let goldBase = 0.5; // base tax
    goldBase += this.population * 0.15; // head tax
    goldBase += (this.workers.merchant || 0) * 2.5;
    goldBase *= 1 + (this.buildings.marketStall || 0) * 0.25;
    goldBase *= 1 + (this.buildings.guildHall || 0) * 0.50;
    if (this.researchedTechs.includes('tradeLedgers')) goldBase *= 1.35;
    goldBase *= (season.goldMod || 1.0);
    goldBase *= crownTalent;
    goldBase *= tradeDecree;

    // Territory Bonus (+5% gold and all yields per territory)
    const territoryBonus = 1 + (this.territory - 1) * 0.05;
    goldBase *= territoryBonus;

    // Faith
    let faithBase = (this.workers.priest || 0) * 1.5;
    faithBase += (this.buildings.chapel || 0) * 0.5;
    faithBase += (this.buildings.cathedral || 0) * 2.0;
    if (this.researchedTechs.includes('divineBlessing')) faithBase *= 1.5;
    faithBase *= (season.faithMod || 1.0);

    // Knowledge
    let knowledgeBase = (this.workers.scholar || 0) * 1.2;
    knowledgeBase += (this.buildings.library || 0) * 0.6;

    // Mana
    let manaBase = (this.buildings.arcaneTower || 0) * 1.0;
    if (this.researchedTechs.includes('arcaneAlchemy')) manaBase *= 2.0;

    return {
      food: foodNet,
      foodGross: foodBase,
      foodConsumption,
      wood: woodBase - blacksmithWoodCost,
      stone: stoneBase,
      iron: ironBase - blacksmithIronCost,
      tools: toolsNet,
      gold: goldBase,
      faith: faithBase,
      knowledge: knowledgeBase,
      mana: manaBase
    };
  }

  isDecreeActive(id) {
    return !!(this.activeDecrees[id] && this.activeDecrees[id] > 0);
  }

  // Tick Simulation by Delta Seconds
  tick(dt) {
    this.totalPlaytime += dt;

    // Tick Decrees
    Object.keys(this.activeDecrees).forEach(k => {
      this.activeDecrees[k] = Math.max(0, this.activeDecrees[k] - dt);
      if (this.activeDecrees[k] === 0) delete this.activeDecrees[k];
    });
    Object.keys(this.decreeCooldowns).forEach(k => {
      this.decreeCooldowns[k] = Math.max(0, this.decreeCooldowns[k] - dt);
      if (this.decreeCooldowns[k] === 0) delete this.decreeCooldowns[k];
    });

    // Tick Seasons
    this.seasonTimer += dt;
    if (this.seasonTimer >= this.seasonDuration) {
      this.seasonTimer = 0;
      this.seasonIndex = (this.seasonIndex + 1) % SEASONS.length;
    }

    // Apply Economy Rates
    const rates = this.getRates();
    this.food = Math.max(0, this.food + rates.food * dt);
    this.wood += rates.wood * dt;
    this.stone += rates.stone * dt;
    this.iron += rates.iron * dt;
    this.tools += rates.tools * dt;
    this.gold += rates.gold * dt;
    this.faith += rates.faith * dt;
    this.knowledge += rates.knowledge * dt;
    this.mana += rates.mana * dt;

    this.stats.totalGoldCollected += Math.max(0, rates.gold * dt);

    // Population Growth check (if food > 30 and population < maxPop)
    const maxPop = this.getMaxPopulation();
    if (this.population < maxPop && this.food >= 30) {
      // 1 new citizen every ~15 seconds when well-fed
      const growthChance = (dt / 15) * (1 + (this.dynasticTalents.fertileLands || 0) * 0.1);
      if (Math.random() < growthChance) {
        this.population += 1;
        this.stats.totalCitizensBorn += 1;
        this.food = Math.max(0, this.food - 15);
      }
    }

    // Starvation penalty
    if (this.food <= 0 && this.population > 2) {
      // Small chance of citizen leaving if starving for extended time
      if (Math.random() < (dt / 40)) {
        this.population = Math.max(2, this.population - 1);
        // reduce assigned worker if needed
        const keys = Object.keys(this.workers);
        for (const k of keys) {
          if (this.workers[k] > 0) {
            this.workers[k]--;
            break;
          }
        }
      }
    }

    // Tick Expeditions
    for (let i = this.activeExpeditions.length - 1; i >= 0; i--) {
      const exp = this.activeExpeditions[i];
      exp.elapsed += dt;
      if (exp.elapsed >= exp.duration) {
        this.completeExpedition(exp);
        this.activeExpeditions.splice(i, 1);
      }
    }

    // Event cooldown tick
    this.eventCooldown -= dt;
  }

  startExpedition(expDef) {
    if (this.getMilitaryPower() < expDef.powerReq) return false;
    if (this.activeExpeditions.some(e => e.id === expDef.id)) return false;

    // Logistics tech speed bonus
    let duration = expDef.duration;
    if (this.researchedTechs.includes('grandLogistics')) {
      duration *= 0.65;
    }

    this.activeExpeditions.push({
      ...expDef,
      duration,
      elapsed: 0
    });
    return true;
  }

  completeExpedition(exp) {
    const spoilsMult = 1 + (this.dynasticTalents.warlordBlood || 0) * 0.2;
    const goldEarned = Math.floor(exp.goldReward * spoilsMult);

    this.gold += goldEarned;
    if (exp.ironReward) this.iron += Math.floor(exp.ironReward * spoilsMult);
    if (exp.manaReward) this.mana += Math.floor(exp.manaReward * spoilsMult);
    if (exp.knowledgeReward) this.knowledge += Math.floor(exp.knowledgeReward * spoilsMult);
    if (exp.territoryReward) this.territory += exp.territoryReward;
    if (exp.renownReward) {
      this.royalRenown += exp.renownReward;
      this.totalRenownEarned += exp.renownReward;
    }

    this.stats.totalExpeditionsWon += 1;
    return goldEarned;
  }

  // Calculate Royal Renown for Abdication / Ascension
  calculateAscensionRenown() {
    // Formula based on total gold collected, territory, population, and techs
    const goldFactor = Math.floor(Math.sqrt(this.stats.totalGoldCollected) / 40);
    const terrFactor = (this.territory - 1) * 2;
    const popFactor = Math.floor(this.population / 15);
    const techFactor = this.researchedTechs.length * 2;
    const total = Math.max(1, goldFactor + terrFactor + popFactor + techFactor);
    return total;
  }

  ascend() {
    const gainedRenown = this.calculateAscensionRenown();
    this.royalRenown += gainedRenown;
    this.totalRenownEarned += gainedRenown;
    this.reignNumber += 1;

    // Preserve dynastic talents and stats, reset realm
    const savedTalents = { ...this.dynasticTalents };
    const savedRenown = this.royalRenown;
    const savedTotalRenown = this.totalRenownEarned;
    const savedReign = this.reignNumber;
    const savedTotalPlaytime = this.totalPlaytime;
    const savedStats = { ...this.stats };

    this.resetDefaults();

    this.dynasticTalents = savedTalents;
    this.royalRenown = savedRenown;
    this.totalRenownEarned = savedTotalRenown;
    this.reignNumber = savedReign;
    this.totalPlaytime = savedTotalPlaytime;
    this.stats = savedStats;

    // Starting bonuses based on dynastic prestige
    this.gold = 50 + this.dynasticTalents.prosperousCrown * 50;
    this.food = 100 + this.dynasticTalents.fertileLands * 50;
    this.wood = 80 + this.dynasticTalents.masterBuilders * 40;
    this.stone = 40;

    return gainedRenown;
  }

  // Serialization for LocalStorage
  serialize() {
    return JSON.stringify({
      version: 1,
      name: this.name,
      timestamp: Date.now(),
      totalPlaytime: this.totalPlaytime,
      food: this.food,
      wood: this.wood,
      stone: this.stone,
      iron: this.iron,
      tools: this.tools,
      gold: this.gold,
      faith: this.faith,
      mana: this.mana,
      knowledge: this.knowledge,
      population: this.population,
      workers: this.workers,
      troops: this.troops,
      buildings: this.buildings,
      researchedTechs: this.researchedTechs,
      territory: this.territory,
      reignNumber: this.reignNumber,
      royalRenown: this.royalRenown,
      totalRenownEarned: this.totalRenownEarned,
      dynasticTalents: this.dynasticTalents,
      stats: this.stats,
      seasonIndex: this.seasonIndex
    });
  }

  save() {
    try {
      const data = this.serialize();
      localStorage.setItem(SAVE_KEY, data);
      this.lastSaveTime = Date.now();
      return true;
    } catch (e) {
      console.warn('Failed to save Kingdom Idle game:', e);
      return false;
    }
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!data) return null;

      this.name = data.name || this.name;
      this.totalPlaytime = data.totalPlaytime || 0;
      this.food = Number(data.food) || 100;
      this.wood = Number(data.wood) || 80;
      this.stone = Number(data.stone) || 40;
      this.iron = Number(data.iron) || 10;
      this.tools = Number(data.tools) || 5;
      this.gold = Number(data.gold) || 50;
      this.faith = Number(data.faith) || 0;
      this.mana = Number(data.mana) || 0;
      this.knowledge = Number(data.knowledge) || 0;
      this.population = Number(data.population) || 6;
      this.territory = Number(data.territory) || 1;
      this.reignNumber = Number(data.reignNumber) || 1;
      this.royalRenown = Number(data.royalRenown) || 0;
      this.totalRenownEarned = Number(data.totalRenownEarned) || 0;
      this.seasonIndex = Number(data.seasonIndex) || 0;

      if (data.workers) Object.assign(this.workers, data.workers);
      if (data.troops) Object.assign(this.troops, data.troops);
      if (data.buildings) Object.assign(this.buildings, data.buildings);
      if (Array.isArray(data.researchedTechs)) this.researchedTechs = data.researchedTechs;
      if (data.dynasticTalents) Object.assign(this.dynasticTalents, data.dynasticTalents);
      if (data.stats) Object.assign(this.stats, data.stats);

      // Process Offline Progression
      const now = Date.now();
      const lastTime = data.timestamp || now;
      const diffSeconds = Math.max(0, (now - lastTime) / 1000);

      const maxOfflineHours = 2 + (this.dynasticTalents.eternalSteward || 0) * 4;
      const cappedSeconds = Math.min(diffSeconds, maxOfflineHours * 3600);

      let offlineGains = null;
      if (cappedSeconds > 30) {
        // Calculate offline progress with efficiency penalty
        const efficiency = 0.5 + Math.min(0.5, (this.dynasticTalents.eternalSteward || 0) * 0.1);
        const effectiveSeconds = cappedSeconds * efficiency;
        const initialGold = this.gold;
        const initialFood = this.food;
        const initialWood = this.wood;
        const initialStone = this.stone;

        this.tick(effectiveSeconds);

        offlineGains = {
          secondsAway: Math.floor(diffSeconds),
          effectiveSeconds: Math.floor(effectiveSeconds),
          goldEarned: Math.max(0, Math.floor(this.gold - initialGold)),
          foodEarned: Math.max(0, Math.floor(this.food - initialFood)),
          woodEarned: Math.max(0, Math.floor(this.wood - initialWood)),
          stoneEarned: Math.max(0, Math.floor(this.stone - initialStone))
        };
      }

      return offlineGains;
    } catch (e) {
      console.warn('Failed to load Kingdom save:', e);
      return null;
    }
  }

  resetSave() {
    localStorage.removeItem(SAVE_KEY);
    this.resetDefaults();
  }
}
