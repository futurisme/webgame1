/**
 * B2B Hardware Semiconductor Supply Chain & AI-NPC Component Evolution Engine
 * Pure Vanilla JavaScript • Real-time Economic Interdependency
 * 
 * In this simulation, Device OEM corporations (such as the player's enterprise)
 * CANNOT magically fabricate processors, discrete graphics, or memory in a vacuum.
 * All hardware parts (CPU, GPU, RAM) MUST be procured directly from active
 * semiconductor foundries and chipmaker corporations in the global market.
 * 
 * If no semiconductor firm has released a specific category to the B2B market,
 * authentic supply chain empty states are strictly enforced:
 * - "Belum ada CPU di pasaran"
 * - "Belum ada GPU di pasaran"
 * - "Belum ada merek RAM di pasaran"
 */

/**
 * Standard Hardware Tier Archetypes
 */
export const COMPONENT_CATEGORIES = {
  CPU: 'cpu',
  GPU: 'gpu',
  RAM: 'ram',
};

/**
 * Procedural generation templates for semiconductor foundry products
 */
const CPU_FAMILIES = [
  { prefix: 'TeraCore', suffix: ['Pro', 'Max', 'Ultra', 'Extreme'], nodes: [7, 5, 4, 3, 2, 1.4] },
  { prefix: 'NanoSilicon', suffix: ['Apex', 'Prime', 'X-Gen', 'Quantum'], nodes: [6, 5, 3, 2] },
  { prefix: 'LithoZenith', suffix: ['Core', 'Pulse', 'HyperThread', 'Matrix'], nodes: [7, 4, 3, 1.8] },
  { prefix: 'WaferMatrix', suffix: ['Compute', 'Neural', 'Architect', 'Omni'], nodes: [5, 4, 3, 2] },
];

const GPU_FAMILIES = [
  { prefix: 'NeuralViper', suffix: ['RTX', 'Titan', 'Neural', 'Optic'], vrams: [6, 8, 12, 16, 24] },
  { prefix: 'OpticShade', suffix: ['HyperRaster', 'RayCore', 'Vision', 'FX'], vrams: [4, 8, 12, 16] },
  { prefix: 'TitanShade', suffix: ['Discrete', 'Matrix', 'Accelerate', 'Vortex'], vrams: [8, 12, 16, 32] },
  { prefix: 'QuantumRaster', suffix: ['Tensor', 'Compute', 'UltraCore', 'Nova'], vrams: [8, 16, 24, 48] },
];

const RAM_FAMILIES = [
  { prefix: 'NanoDRAM', types: ['LPDDR5', 'LPDDR5X', 'HBM3e', 'DDR5'], capacities: [8, 12, 16, 24, 32, 64] },
  { prefix: 'LatticeMemory', types: ['LPDDR5X', 'DDR5-6400', 'HBM3', 'DDR5-7200'], capacities: [8, 16, 32, 64] },
  { prefix: 'WaferSpeed', types: ['LPDDR5X', 'DDR5X', 'HBM3e', 'UltraLowLatency'], capacities: [12, 16, 32, 48] },
];

/**
 * Build initial catalog of components produced by active competitor semiconductor companies
 * @param {Array} competitorStocks
 * @returns {Object} { cpus: [], gpus: [], rams: [], marketNews: [] }
 */
export function initializeHardwareMarket(competitorStocks = []) {
  const market = {
    cpus: [],
    gpus: [],
    rams: [],
    lastTechEvolutionMonth: 1,
  };

  // Find companies with category or sector matching semikonduktor / chip / ai
  const semiCompanies = competitorStocks.filter(c => 
    c.category === 'semikonduktor' || 
    (c.sector && c.sector.toLowerCase().includes('semikonduktor')) ||
    (c.sector && c.sector.toLowerCase().includes('chip'))
  );

  // If no specific semiconductor companies found, check for AI/compute foundries
  const supplierCompanies = semiCompanies.length > 0 
    ? semiCompanies 
    : competitorStocks.filter(c => c.category === 'ai' || (c.sector && c.sector.toLowerCase().includes('komputasi')));

  if (supplierCompanies.length === 0) {
    // True empty state: no semiconductor companies exist in the universe yet
    return market;
  }

  // Seed realistic initial catalog
  supplierCompanies.forEach((supplier, idx) => {
    const techLvl = supplier.techLevel || 8;
    const vendorName = supplier.name;
    const vendorSymbol = supplier.symbol;

    // Supplier 0 & 1 typically produce CPUs
    if (idx % 2 === 0 || idx === 0) {
      const family = CPU_FAMILIES[idx % CPU_FAMILIES.length];
      const node = techLvl >= 10 ? 2 : techLvl >= 9 ? 3 : 4;
      const clock = (3.2 + (techLvl - 7) * 0.4).toFixed(1);
      const cores = techLvl >= 9 ? 12 : 8;
      const score = Math.round(1800 + techLvl * 280);
      const cost = Math.round(90 + (score / 35));

      market.cpus.push({
        id: `cpu_${vendorSymbol.toLowerCase()}_${Date.now()}_${idx}`,
        category: 'cpu',
        vendor: vendorName,
        vendorSymbol: vendorSymbol,
        modelName: `${family.prefix} ${family.suffix[idx % family.suffix.length]} ${techLvl}X`,
        processNode: `${node}nm GAA`,
        clockGhz: `${clock} GHz`,
        cores: `${cores} Cores`,
        tdp: `${node <= 3 ? 28 : 45}W`,
        benchmarkScore: score,
        unitCost: cost, // Wholesale price to Device OEMs
        generation: 1,
        releasedYear: 2026,
        isFlagship: techLvl >= 9,
      });

      // Also generate a second entry for variety if techLevel is high
      if (techLvl >= 9) {
        const entryModel = `${family.prefix} Neo Lite ${techLvl - 1}`;
        market.cpus.push({
          id: `cpu_${vendorSymbol.toLowerCase()}_lite_${idx}`,
          category: 'cpu',
          vendor: vendorName,
          vendorSymbol: vendorSymbol,
          modelName: entryModel,
          processNode: `${node + 1}nm GAA`,
          clockGhz: `${(parseFloat(clock) - 0.5).toFixed(1)} GHz`,
          cores: `${cores - 2} Cores`,
          tdp: `20W`,
          benchmarkScore: Math.round(score * 0.78),
          unitCost: Math.round(cost * 0.65),
          generation: 1,
          releasedYear: 2026,
          isFlagship: false,
        });
      }
    }

    // Supplier 1 & 2 produce GPUs
    if (idx % 2 === 1 || supplierCompanies.length === 1) {
      const family = GPU_FAMILIES[idx % GPU_FAMILIES.length];
      const vram = techLvl >= 10 ? 16 : techLvl >= 9 ? 12 : 8;
      const tflops = (14 + (techLvl - 7) * 4.5).toFixed(1);
      const score = Math.round(2200 + techLvl * 320);
      const cost = Math.round(120 + (score / 30));

      market.gpus.push({
        id: `gpu_${vendorSymbol.toLowerCase()}_${Date.now()}_${idx}`,
        category: 'gpu',
        vendor: vendorName,
        vendorSymbol: vendorSymbol,
        modelName: `${family.prefix} ${family.suffix[idx % family.suffix.length]} ${vram}G`,
        vramGb: `${vram} GB GDDR6X`,
        tflops: `${tflops} TFLOPS`,
        architecture: techLvl >= 10 ? 'Neural-Ray 3D' : 'Unified Compute 2',
        benchmarkScore: score,
        unitCost: cost,
        generation: 1,
        releasedYear: 2026,
        isFlagship: techLvl >= 9,
      });

      if (techLvl >= 9) {
        market.gpus.push({
          id: `gpu_${vendorSymbol.toLowerCase()}_budget_${idx}`,
          category: 'gpu',
          vendor: vendorName,
          vendorSymbol: vendorSymbol,
          modelName: `${family.prefix} Mobile Core 6G`,
          vramGb: `6 GB GDDR6`,
          tflops: `${(parseFloat(tflops) - 6).toFixed(1)} TFLOPS`,
          architecture: 'Unified Mobile Matrix',
          benchmarkScore: Math.round(score * 0.68),
          unitCost: Math.round(cost * 0.58),
          generation: 1,
          releasedYear: 2026,
          isFlagship: false,
        });
      }
    }

    // Suppliers produce RAM modules
    if (idx % 3 === 0 || supplierCompanies.length <= 2) {
      const family = RAM_FAMILIES[idx % RAM_FAMILIES.length];
      const cap = techLvl >= 10 ? 32 : techLvl >= 9 ? 16 : 8;
      const rType = techLvl >= 9 ? 'LPDDR5X-8533' : 'LPDDR5-6400';
      const score = Math.round(1100 + cap * 45 + techLvl * 60);
      const cost = Math.round(35 + cap * 2.8);

      market.rams.push({
        id: `ram_${vendorSymbol.toLowerCase()}_${Date.now()}_${idx}`,
        category: 'ram',
        vendor: vendorName,
        vendorSymbol: vendorSymbol,
        modelName: `${family.prefix} ${rType} ${cap}GB`,
        capacityGb: `${cap} GB`,
        ramType: rType,
        speedMts: techLvl >= 9 ? '8533 MT/s' : '6400 MT/s',
        benchmarkScore: score,
        unitCost: cost,
        generation: 1,
        releasedYear: 2026,
        isFlagship: cap >= 16,
      });

      // Add a higher capacity option
      market.rams.push({
        id: `ram_${vendorSymbol.toLowerCase()}_high_${idx}`,
        category: 'ram',
        vendor: vendorName,
        vendorSymbol: vendorSymbol,
        modelName: `${family.prefix} UltraPro ${cap * 2}GB`,
        capacityGb: `${cap * 2} GB`,
        ramType: 'LPDDR5X-9600',
        speedMts: '9600 MT/s',
        benchmarkScore: Math.round(score * 1.45),
        unitCost: Math.round(cost * 1.8),
        generation: 1,
        releasedYear: 2026,
        isFlagship: true,
      });
    }
  });

  return market;
}

/**
 * Filter available components by category (CPU, GPU, RAM)
 * @param {Object} market
 * @param {string} category
 * @returns {Array} List of components or empty array
 */
export function getAvailableComponents(market, category) {
  if (!market) return [];
  if (category === 'cpu') return market.cpus || [];
  if (category === 'gpu') return market.gpus || [];
  if (category === 'ram') return market.rams || [];
  return [];
}

/**
 * AI-NPC Autonomous R&D and Hardware Evolution Loop
 * Periodic simulation tick where semiconductor foundries innovate and release new generations.
 * @param {Object} state - Main game state
 * @returns {Object|null} Notification if a new component was released
 */
export function advanceHardwareMarketSimulation(state) {
  if (!state.hardwareMarket) {
    state.hardwareMarket = initializeHardwareMarket(state.competitorStocks || []);
    return null;
  }

  const market = state.hardwareMarket;
  const currentMonth = state.month + (state.year - 2026) * 12;

  // Evaluate every 3-4 game months for tech advancement
  if (currentMonth - (market.lastTechEvolutionMonth || 0) < 3) {
    return null;
  }

  market.lastTechEvolutionMonth = currentMonth;

  // Pick an active semiconductor competitor
  const semiCompanies = (state.competitorStocks || []).filter(c => 
    c.category === 'semikonduktor' || 
    (c.sector && c.sector.toLowerCase().includes('semikonduktor'))
  );

  if (semiCompanies.length === 0) return null;

  const foundry = semiCompanies[Math.floor(Math.random() * semiCompanies.length)];
  const techLvl = Math.min(12, (foundry.techLevel || 8) + Math.floor(Math.random() * 2));
  foundry.techLevel = techLvl;

  // Decide category to upgrade: CPU (40%), GPU (35%), RAM (25%)
  const rand = Math.random();
  let releasedItem = null;

  if (rand < 0.40) {
    // Release a cutting-edge next-gen CPU
    const family = CPU_FAMILIES[Math.floor(Math.random() * CPU_FAMILIES.length)];
    const nodeNm = techLvl >= 11 ? '1.4nm Angstrom' : techLvl >= 10 ? '1.8nm GAA' : '2nm GAA';
    const clock = (3.8 + (techLvl - 8) * 0.35).toFixed(1);
    const cores = 12 + (techLvl - 8) * 2;
    const score = Math.round(2800 + techLvl * 340);
    const cost = Math.round(110 + (score / 32));

    releasedItem = {
      id: `cpu_${foundry.symbol.toLowerCase()}_gen_${Date.now()}`,
      category: 'cpu',
      vendor: foundry.name,
      vendorSymbol: foundry.symbol,
      modelName: `${family.prefix} Ultra-GAA Gen ${techLvl - 6}`,
      processNode: nodeNm,
      clockGhz: `${clock} GHz`,
      cores: `${cores} Cores`,
      tdp: '25W',
      benchmarkScore: score,
      unitCost: cost,
      generation: techLvl - 7,
      releasedYear: state.year,
      isFlagship: true,
    };
    market.cpus.unshift(releasedItem);
    if (market.cpus.length > 8) market.cpus.pop();
  } else if (rand < 0.75) {
    // Release a cutting-edge next-gen GPU
    const family = GPU_FAMILIES[Math.floor(Math.random() * GPU_FAMILIES.length)];
    const vram = techLvl >= 11 ? 24 : 16;
    const tflops = (22 + (techLvl - 8) * 5.2).toFixed(1);
    const score = Math.round(3400 + techLvl * 380);
    const cost = Math.round(155 + (score / 28));

    releasedItem = {
      id: `gpu_${foundry.symbol.toLowerCase()}_gen_${Date.now()}`,
      category: 'gpu',
      vendor: foundry.name,
      vendorSymbol: foundry.symbol,
      modelName: `${family.prefix} RayMatrix ${vram}GB`,
      vramGb: `${vram} GB GDDR7`,
      tflops: `${tflops} TFLOPS`,
      architecture: 'Neural-Tensor 4D',
      benchmarkScore: score,
      unitCost: cost,
      generation: techLvl - 7,
      releasedYear: state.year,
      isFlagship: true,
    };
    market.gpus.unshift(releasedItem);
    if (market.gpus.length > 8) market.gpus.pop();
  } else {
    // Release a high-speed next-gen RAM
    const family = RAM_FAMILIES[Math.floor(Math.random() * RAM_FAMILIES.length)];
    const cap = techLvl >= 11 ? 48 : 32;
    const score = Math.round(1800 + cap * 40 + techLvl * 75);
    const cost = Math.round(48 + cap * 2.5);

    releasedItem = {
      id: `ram_${foundry.symbol.toLowerCase()}_gen_${Date.now()}`,
      category: 'ram',
      vendor: foundry.name,
      vendorSymbol: foundry.symbol,
      modelName: `${family.prefix} LPDDR6 ${cap}GB`,
      capacityGb: `${cap} GB`,
      ramType: 'LPDDR6-10400',
      speedMts: '10400 MT/s',
      benchmarkScore: score,
      unitCost: cost,
      generation: techLvl - 7,
      releasedYear: state.year,
      isFlagship: true,
    };
    market.rams.unshift(releasedItem);
    if (market.rams.length > 8) market.rams.pop();
  }

  if (releasedItem) {
    return {
      vendor: foundry.name,
      symbol: foundry.symbol,
      item: releasedItem,
      message: `${foundry.name} (${foundry.symbol}) baru saja merilis inovasi semikonduktor B2B: ${releasedItem.modelName} ke pasaran global!`,
    };
  }

  return null;
}

/**
 * Physical materials & structural BOM cost calculation
 */
export const DEVICE_MATERIALS = [
  { id: 'aluminum', name: 'Aerospace Aluminum', costMultiplier: 1.0, baseCost: 35, qualityScore: 80, badge: 'Standard Premium' },
  { id: 'titanium', name: 'Grade 5 Titanium Alloy', costMultiplier: 1.45, baseCost: 75, qualityScore: 96, badge: 'Ultra Durable' },
  { id: 'matte_glass', name: 'Frosted AG Glass & Steel', costMultiplier: 1.15, baseCost: 45, qualityScore: 88, badge: 'Elegant Finish' },
  { id: 'ceramic', name: 'Nanocrystal Ceramic Armor', costMultiplier: 1.6, baseCost: 95, qualityScore: 99, badge: 'Luxury Flagship' },
  { id: 'polycarbonate', name: 'Lightweight Bio-Polymer', costMultiplier: 0.65, baseCost: 18, qualityScore: 65, badge: 'Cost Efficient' },
];

export const DEVICE_DISPLAYS = {
  smartphone: [
    { id: 'oled_120', name: '6.7" Super Retina LTPO OLED 120Hz', cost: 65, qualityScore: 92 },
    { id: 'amoled_90', name: '6.4" Dynamic AMOLED 90Hz', cost: 42, qualityScore: 82 },
    { id: 'ips_fhd', name: '6.5" High-Brightness IPS LCD 120Hz', cost: 24, qualityScore: 70 },
  ],
  laptop: [
    { id: 'miniled_165', name: '16.0" Liquid Retina Mini-LED 165Hz HDR', cost: 130, qualityScore: 97 },
    { id: 'oled_120', name: '14.5" OLED 3K 120Hz TrueColor', cost: 95, qualityScore: 90 },
    { id: 'ips_qhd', name: '15.6" IPS Anti-Glare 165Hz QHD', cost: 55, qualityScore: 78 },
  ],
  tablet: [
    { id: 'oled_tandem', name: '11.0" Ultra Retina Tandem OLED 120Hz', cost: 85, qualityScore: 95 },
    { id: 'ips_pro', name: '10.9" Liquid Color IPS 90Hz Stylus-Ready', cost: 45, qualityScore: 80 },
    { id: 'ips_budget', name: '10.2" Standard IPS Touch Display', cost: 28, qualityScore: 68 },
  ],
};

/**
 * Calculate total Bill of Materials (BOM / HPP per unit)
 */
export function calculateDeviceBom({
  deviceType = 'smartphone',
  materialId = 'aluminum',
  displayId = null,
  cpu = null,
  gpu = null,
  ram = null,
}) {
  const mat = DEVICE_MATERIALS.find(m => m.id === materialId) || DEVICE_MATERIALS[0];
  const displays = DEVICE_DISPLAYS[deviceType] || DEVICE_DISPLAYS['smartphone'];
  const disp = displays.find(d => d.id === displayId) || displays[0];

  const chassisCost = mat.baseCost;
  const displayCost = disp.cost;
  const cpuCost = cpu ? cpu.unitCost : 0;
  const gpuCost = gpu ? gpu.unitCost : 0;
  const ramCost = ram ? ram.unitCost : 0;
  
  // Base assembly, battery, thermal cooling & packaging costs by device category
  const assemblyCost = deviceType === 'laptop' ? 45 : deviceType === 'tablet' ? 32 : 28;

  const totalBom = chassisCost + displayCost + cpuCost + gpuCost + ramCost + assemblyCost;

  return {
    chassisCost,
    displayCost,
    cpuCost,
    gpuCost,
    ramCost,
    assemblyCost,
    totalBom: Math.round(totalBom),
    material: mat,
    display: disp,
  };
}

/**
 * Estimate consumer demand score and projected monthly sales
 */
export function estimateDeviceMarketDemand({
  deviceType = 'smartphone',
  bom = 300,
  msrp = 699,
  qualityScore = 85,
  companyReputation = 60,
  techLevel = 5,
  marketingEfficiency = 1.0,
}) {
  const marginDollar = msrp - bom;
  const marginPct = (marginDollar / Math.max(1, msrp)) * 100;

  // Price-to-Value benchmark ratio
  const standardMsrp = bom * 1.65;
  const priceCompetitiveness = standardMsrp / Math.max(10, msrp); // >1 = bargain, <1 = overpriced

  // Overall perceived consumer appeal score (0 - 100)
  const baseAppeal = (qualityScore * 0.45) + (companyReputation * 0.25) + (techLevel * 3.5);
  const finalAppealScore = Math.min(99, Math.max(10, baseAppeal * Math.pow(priceCompetitiveness, 0.75)));

  // Base monthly market sales volume estimation
  let volumeBase = deviceType === 'smartphone' ? 3500 : deviceType === 'laptop' ? 1800 : 2200;
  volumeBase *= (finalAppealScore / 50) * marketingEfficiency;

  // Severe penalty if negative margin (losing money) or ridiculously priced (> 4x standard)
  if (msrp < bom) {
    volumeBase *= 1.8; // High sales if sold at loss, but company loses money
  } else if (msrp > bom * 3.5) {
    volumeBase *= 0.25; // Luxury niche only
  }

  return {
    marginDollar: Math.round(marginDollar),
    marginPct: Math.round(marginPct * 10) / 10,
    appealScore: Math.round(finalAppealScore),
    projectedMonthlySales: Math.round(volumeBase),
    marginHealth: marginDollar <= 0 
      ? 'LOSS_DEFICIT' 
      : marginPct < 15 
        ? 'SLIM_MARGIN' 
        : marginPct <= 45 
          ? 'HEALTHY_EXPANSION' 
          : marginPct <= 65 
            ? 'HIGH_MARGIN_FLAGSHIP' 
            : 'ULTRA_LUXURY',
  };
}
