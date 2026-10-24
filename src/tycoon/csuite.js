/**
 * C-Suite Executive Leadership & Full-Company Workforce Hierarchy Engine
 * Pure JavaScript • Manages Executive Board, Division Directors, Senior Specialists, and Junior Staff.
 */

export const EXECUTIVE_ROLES = {
  CEO: { label: 'Chief Executive Officer', title: 'Direktur Utama', icon: 'crown', color: 'text-amber-400' },
  CTO: { label: 'Chief Technology Officer', title: 'Direktur Teknologi', icon: 'code', color: 'text-cyan-400' },
  CFO: { label: 'Chief Financial Officer', title: 'Direktur Keuangan', icon: 'coins', color: 'text-emerald-400' },
  CMO: { label: 'Chief Marketing Officer', title: 'Direktur Pemasaran', icon: 'megaphone', color: 'text-purple-400' },
  COO: { label: 'Chief Operating Officer', title: 'Direktur Operasional', icon: 'settings', color: 'text-blue-400' },
};

/**
 * Calculates aggregate bonuses provided by the current executive leadership team.
 * @param {Object} executives
 * @returns {Object}
 */
export function calculateCSuiteBonuses(executives) {
  let revenueMultiplier = 1.0;
  let expenseReductionPct = 0;
  let techGenerationBonus = 0;
  let reputationMonthlyBonus = 0;
  let crashRiskReductionPct = 0;
  let investorTrustBonus = 0;

  // CEO bonuses
  const ceo = executives.CEO;
  if (ceo) {
    const ceoFactor = (ceo.leadership + ceo.specialty) / 200;
    const moraleFactor = 0.5 + (ceo.morale / 200);
    investorTrustBonus += Math.round(ceoFactor * 30 * moraleFactor);
    reputationMonthlyBonus += Math.round(ceoFactor * 5 * moraleFactor);
    if (ceo.trait === 'Charismatic Visionary') {
      revenueMultiplier += 0.15;
    }
  }

  // CTO bonuses
  const cto = executives.CTO;
  if (cto) {
    const ctoFactor = cto.specialty / 100;
    const moraleFactor = 0.5 + (cto.morale / 200);
    techGenerationBonus += Math.round(ctoFactor * 10 * moraleFactor);
    crashRiskReductionPct += Math.min(80, Math.round(ctoFactor * 50 * moraleFactor));
    if (cto.trait === 'Silicon Valley 10x') {
      techGenerationBonus += 8;
    }
  }

  // CFO bonuses
  const cfo = executives.CFO;
  if (cfo) {
    const cfoFactor = cfo.specialty / 100;
    const moraleFactor = 0.5 + (cfo.morale / 200);
    expenseReductionPct += Math.min(35, Math.round(cfoFactor * 25 * moraleFactor));
    if (cfo.trait === 'Wall Street Wizard') {
      revenueMultiplier += 0.10;
      expenseReductionPct += 5;
    }
  }

  // CMO bonuses
  const cmo = executives.CMO;
  if (cmo) {
    const cmoFactor = cmo.specialty / 100;
    revenueMultiplier += Math.round(cmoFactor * 0.25 * 100) / 100;
    reputationMonthlyBonus += Math.round(cmoFactor * 8);
    if (cmo.trait === 'Growth Hacker') {
      revenueMultiplier += 0.12;
    }
  }

  // COO bonuses
  const coo = executives.COO;
  if (coo) {
    const cooFactor = coo.specialty / 100;
    expenseReductionPct += Math.min(20, Math.round(cooFactor * 15));
    if (coo.trait === 'Operations Veteran') {
      expenseReductionPct += 8;
    }
  }

  return {
    revenueMultiplier: Math.round(revenueMultiplier * 100) / 100,
    expenseReductionPct: Math.min(60, expenseReductionPct),
    techGenerationBonus,
    reputationMonthlyBonus,
    crashRiskReductionPct: Math.min(95, crashRiskReductionPct),
    investorTrustBonus,
  };
}

/**
 * Calculates total executive payroll per month.
 * @param {Object} executives
 * @returns {number}
 */
export function calculateExecutivePayroll(executives) {
  let total = 0;
  for (const role of ['CEO', 'CTO', 'CFO', 'CMO', 'COO']) {
    const exec = executives[role];
    if (exec && !exec.isPlayer) {
      total += exec.salaryMonthly || 0;
    }
  }
  return total;
}

/**
 * Default starter executive candidates ready to hire.
 */
export const EXECUTIVE_CANDIDATE_POOL = [
  // CTO candidates
  {
    id: 'cto_1',
    name: 'Dr. Alistair Chen',
    role: 'CTO',
    icon: 'code',
    salaryMonthly: 18000,
    equityGrantedPct: 2.0,
    leadership: 78,
    specialty: 94,
    morale: 90,
    loyalty: 85,
    trait: 'Silicon Valley 10x',
    traitDescription: 'Menghasilkan +8 Tech Points ekstra per siklus dan mengurangi downtime server hingga 80%.',
    isPlayer: false,
  },
  {
    id: 'cto_2',
    name: 'Sarah Connor-Wong',
    role: 'CTO',
    icon: 'code',
    salaryMonthly: 12000,
    equityGrantedPct: 1.5,
    leadership: 65,
    specialty: 82,
    morale: 85,
    loyalty: 80,
    trait: 'Open Source Architect',
    traitDescription: 'Infrastruktur cloud modular dan menghemat biaya komputasi server.',
    isPlayer: false,
  },
  // CFO candidates
  {
    id: 'cfo_1',
    name: 'Marcus Sterling',
    role: 'CFO',
    icon: 'coins',
    salaryMonthly: 20000,
    equityGrantedPct: 2.0,
    leadership: 84,
    specialty: 96,
    morale: 92,
    loyalty: 88,
    trait: 'Wall Street Wizard',
    traitDescription: '+10% Pendapatan investasi treasury dan pemotongan beban pajak operasional.',
    isPlayer: false,
  },
  {
    id: 'cfo_2',
    name: 'Elena Rostova',
    role: 'CFO',
    icon: 'coins',
    salaryMonthly: 13000,
    equityGrantedPct: 1.0,
    leadership: 72,
    specialty: 85,
    morale: 88,
    loyalty: 82,
    trait: 'Cost Cutter',
    traitDescription: 'Mengaudit kontrak vendor dengan ketat dan memangkas biaya langganan software tak terpakai.',
    isPlayer: false,
  },
  // CMO candidates
  {
    id: 'cmo_1',
    name: 'Chloe Takahashi',
    role: 'CMO',
    icon: 'megaphone',
    salaryMonthly: 15000,
    equityGrantedPct: 1.5,
    leadership: 88,
    specialty: 91,
    morale: 95,
    loyalty: 80,
    trait: 'Growth Hacker',
    traitDescription: 'Kampanye viral terintegrasi dan mempercepat penetrasi pasar korporat +12%.',
    isPlayer: false,
  },
  // COO candidates
  {
    id: 'coo_1',
    name: 'Viktor Vance',
    role: 'COO',
    icon: 'settings',
    salaryMonthly: 16000,
    equityGrantedPct: 1.5,
    leadership: 90,
    specialty: 88,
    morale: 90,
    loyalty: 90,
    trait: 'Operations Veteran',
    traitDescription: 'Optimasi proses rantai pasok dan operasional kantor tanpa friksi.',
    isPlayer: false,
  },
];

/**
 * Default multi-tier corporate workforce structure.
 * Separated into distinct hierarchical castes:
 * - Tingkat 2: Direktur Bidang & HRD (5 divisional directors)
 * - Tingkat 3: Karyawan Senior / Tenaga Ahli (4 specialized branches)
 * - Tingkat 4: Karyawan Junior / Staf Pelaksana (4 operational branches)
 */
export const DEFAULT_WORKFORCE = {
  managers: [
    {
      id: 'mgr_hrd',
      title: 'Direktur HRD & People Ops',
      department: 'Sumber Daya Manusia',
      icon: 'users',
      count: 1,
      maxCount: 3,
      salaryTier: 'market', // 'budget' | 'market' | 'elite'
      salaryRates: { budget: 4500, market: 6500, elite: 10000 },
      isRecruiting: false,
      bonusDesc: '+15% Retensi Karyawan, -20% Biaya Rekrutmen',
      color: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    },
    {
      id: 'mgr_eng',
      title: 'Direktur Rekayasa & Sistem (VP Engineering)',
      department: 'Teknologi & Produk',
      icon: 'cpu',
      count: 1,
      maxCount: 3,
      salaryTier: 'market',
      salaryRates: { budget: 5500, market: 8000, elite: 12500 },
      isRecruiting: false,
      bonusDesc: '+25% Output Tech Points R&D & DevOps',
      color: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    },
    {
      id: 'mgr_fin',
      title: 'Direktur Keuangan & Treasury (VP Finance)',
      department: 'Akuntansi & Keuangan',
      icon: 'coins',
      count: 1,
      maxCount: 3,
      salaryTier: 'market',
      salaryRates: { budget: 5000, market: 7500, elite: 11500 },
      isRecruiting: false,
      bonusDesc: '-12% Beban Operasional Kantor & Pajak',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
    {
      id: 'mgr_mkt',
      title: 'Direktur Pemasaran & Brand (VP Marketing)',
      department: 'Pertumbuhan & Brand',
      icon: 'megaphone',
      count: 1,
      maxCount: 3,
      salaryTier: 'market',
      salaryRates: { budget: 4800, market: 7000, elite: 11000 },
      isRecruiting: false,
      bonusDesc: '+15% Multiplier Pendapatan Bulanan',
      color: 'text-purple-400',
      badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    },
    {
      id: 'mgr_ops',
      title: 'Direktur Operasional & Fasilitas (VP Ops)',
      department: 'Fasilitas & Logistik',
      icon: 'truck',
      count: 1,
      maxCount: 3,
      salaryTier: 'market',
      salaryRates: { budget: 4500, market: 6500, elite: 9800 },
      isRecruiting: false,
      bonusDesc: '-10% Biaya Pengadaan & Rantai Pasok',
      color: 'text-blue-400',
      badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },
  ],

  seniors: [
    {
      id: 'snr_arch',
      title: 'Senior Software Architect & Lead Dev',
      branch: 'Rekayasa Software',
      icon: 'code',
      count: 3,
      maxCount: 25,
      salaryTier: 'market',
      salaryRates: { budget: 3200, market: 4800, elite: 7200 },
      isRecruiting: true,
      bonusDesc: '+0.8 Tech Points/bln per arsitek',
      color: 'text-teal-400',
      badgeBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    },
    {
      id: 'snr_quant',
      title: 'Senior Quant & Analis Pasar Modal',
      branch: 'Analisis Finansial',
      icon: 'activity',
      count: 2,
      maxCount: 20,
      salaryTier: 'market',
      salaryRates: { budget: 3500, market: 5200, elite: 8000 },
      isRecruiting: false,
      bonusDesc: '+0.5% Revenue Margin per analis',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },
    {
      id: 'snr_growth',
      title: 'Senior Growth & Performance Lead',
      branch: 'Kampanye & Konversi',
      icon: 'rocket',
      count: 2,
      maxCount: 20,
      salaryTier: 'market',
      salaryRates: { budget: 3000, market: 4500, elite: 6800 },
      isRecruiting: true,
      bonusDesc: '+0.4% Revenue Volume per lead',
      color: 'text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },
    {
      id: 'snr_sec',
      title: 'Senior Security & Compliance Officer',
      branch: 'Siber & Hukum',
      icon: 'shield',
      count: 1,
      maxCount: 15,
      salaryTier: 'market',
      salaryRates: { budget: 3400, market: 5000, elite: 7500 },
      isRecruiting: false,
      bonusDesc: '-8% Risiko Insiden Sistem & Gugatan',
      color: 'text-sky-400',
      badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    },
  ],

  juniors: [
    {
      id: 'jnr_dev',
      title: 'Junior Software Engineer & QA Tester',
      branch: 'Coding & Debugging',
      icon: 'code',
      count: 12,
      maxCount: 150,
      salaryTier: 'market',
      salaryRates: { budget: 1200, market: 1800, elite: 2600 },
      isRecruiting: true,
      bonusDesc: '+0.15 Tech Points/bln per staf',
      color: 'text-slate-300',
      badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
    },
    {
      id: 'jnr_fin',
      title: 'Junior Finance Clerk & Admin Pajak',
      branch: 'Pembukuan & Faktur',
      icon: 'fileText',
      count: 6,
      maxCount: 80,
      salaryTier: 'market',
      salaryRates: { budget: 1100, market: 1600, elite: 2300 },
      isRecruiting: false,
      bonusDesc: 'Pencatatan kas dan ketepatan faktur',
      color: 'text-slate-300',
      badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
    },
    {
      id: 'jnr_media',
      title: 'Creative Content & Sales Associate',
      branch: 'Sosial & Penjualan',
      icon: 'sparkles',
      count: 8,
      maxCount: 80,
      salaryTier: 'market',
      salaryRates: { budget: 1000, market: 1500, elite: 2200 },
      isRecruiting: true,
      bonusDesc: 'Publikasi brand dan exposure viral',
      color: 'text-slate-300',
      badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
    },
    {
      id: 'jnr_ops',
      title: 'IT Support & Office Coordinator',
      branch: 'Operasional Lapangan',
      icon: 'layers',
      count: 6,
      maxCount: 80,
      salaryTier: 'market',
      salaryRates: { budget: 950, market: 1400, elite: 2000 },
      isRecruiting: false,
      bonusDesc: 'Kelancaran infrastruktur harian kantor',
      color: 'text-slate-300',
      badgeBg: 'bg-slate-700/30 text-slate-300 border-slate-700/50',
    },
  ],
};

/**
 * Calculates total workforce payroll including all 4 tiers.
 * @param {Object} workforce
 * @param {Object} executives
 * @returns {number}
 */
export function calculateTotalWorkforcePayroll(workforce, executives) {
  let total = calculateExecutivePayroll(executives);
  if (!workforce) return total;

  const sumTier = (list) => {
    if (!Array.isArray(list)) return 0;
    return list.reduce((acc, item) => {
      const rate = item.salaryRates?.[item.salaryTier] || item.salaryRates?.market || 0;
      return acc + ((item.count || 0) * rate);
    }, 0);
  };

  total += sumTier(workforce.managers);
  total += sumTier(workforce.seniors);
  total += sumTier(workforce.juniors);

  return total;
}

/**
 * Calculates aggregate statistics, bonuses, and morale for the workforce.
 * @param {Object} workforce
 * @param {Object} executives
 * @returns {Object}
 */
export function calculateWorkforceStats(workforce, executives) {
  let totalHeadcount = 0;
  let totalPayroll = 0;
  let totalTechBonus = 0;
  let totalRevenueMultiplierBonus = 0;
  let totalExpenseReductionPct = 0;
  let totalMoralePoints = 0;
  let totalRatedPositions = 0;
  let openRecruitingCount = 0;

  // Tier 1: C-Suite
  for (const role of ['CEO', 'CTO', 'CFO', 'CMO', 'COO']) {
    const exec = executives?.[role];
    if (exec) {
      totalHeadcount += 1;
      if (!exec.isPlayer) {
        totalPayroll += exec.salaryMonthly || 0;
      }
      totalMoralePoints += exec.morale || 85;
      totalRatedPositions += 1;
    } else {
      openRecruitingCount += 1;
    }
  }

  // Tiers 2-4
  const processTier = (list) => {
    if (!Array.isArray(list)) return;
    for (const item of list) {
      const count = item.count || 0;
      totalHeadcount += count;

      const rate = item.salaryRates?.[item.salaryTier] || item.salaryRates?.market || 0;
      totalPayroll += count * rate;

      if (item.isRecruiting) {
        openRecruitingCount += 1;
      }

      // Morale impact from salary tier
      const tierMorale = item.salaryTier === 'elite' ? 95 : (item.salaryTier === 'market' ? 85 : 68);
      if (count > 0) {
        totalMoralePoints += tierMorale * Math.min(count, 5);
        totalRatedPositions += Math.min(count, 5);
      }

      // Operational Bonuses
      const tierFactor = item.salaryTier === 'elite' ? 1.25 : (item.salaryTier === 'budget' ? 0.8 : 1.0);

      if (item.id === 'mgr_eng') {
        totalTechBonus += (item.count * 2.0) * tierFactor;
      } else if (item.id === 'mgr_fin') {
        totalExpenseReductionPct += (item.count * 2.5) * tierFactor;
      } else if (item.id === 'mgr_mkt') {
        totalRevenueMultiplierBonus += (item.count * 0.03) * tierFactor;
      } else if (item.id === 'mgr_ops') {
        totalExpenseReductionPct += (item.count * 1.8) * tierFactor;
      } else if (item.id === 'mgr_hrd') {
        totalExpenseReductionPct += (item.count * 1.5) * tierFactor;
      } else if (item.id === 'snr_arch') {
        totalTechBonus += (item.count * 0.8) * tierFactor;
      } else if (item.id === 'snr_quant') {
        totalRevenueMultiplierBonus += (item.count * 0.005) * tierFactor;
      } else if (item.id === 'snr_growth') {
        totalRevenueMultiplierBonus += (item.count * 0.004) * tierFactor;
      } else if (item.id === 'snr_sec') {
        totalExpenseReductionPct += (item.count * 0.8) * tierFactor;
      } else if (item.id === 'jnr_dev') {
        totalTechBonus += (item.count * 0.15) * tierFactor;
      }
    }
  };

  if (workforce) {
    processTier(workforce.managers);
    processTier(workforce.seniors);
    processTier(workforce.juniors);
  }

  const averageMorale = totalRatedPositions > 0
    ? Math.round(totalMoralePoints / totalRatedPositions)
    : 85;

  return {
    totalHeadcount,
    totalPayroll,
    totalTechBonus: Math.round(totalTechBonus * 10) / 10,
    totalRevenueMultiplierBonus: Math.round(totalRevenueMultiplierBonus * 100) / 100,
    totalExpenseReductionPct: Math.min(50, Math.round(totalExpenseReductionPct)),
    averageMorale: Math.min(100, Math.max(30, averageMorale)),
    openRecruitingCount,
  };
}
