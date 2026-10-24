/**
 * Autonomous AI NPCs, Strategic Investor Relations & Dynamic Corporate Intelligence
 * Pure JavaScript • High-Precision Strategic Reasoning • Zero Emojis • Vector-driven AI Agents.
 */

export const INITIAL_INVESTORS = [
  {
    id: 'inv_angel_1',
    name: 'Gavin Belson-Rizki',
    type: 'ANGEL',
    icon: 'user',
    firmName: 'Palo Alto Angels & Syndicate',
    checkSizeMin: 60000,
    checkSizeMax: 250000,
    targetEquityPct: 0.08,
    patienceMonths: 24,
    reputationReq: 20,
    demandsBoardSeat: false,
    thesis: 'Bertaruh pada pendiri visioner dengan kemampuan kepemimpinan dan arsitektur produk yang kuat.',
    flavorQuote: 'Valuasi fleksibel jika visi produk dan kepemimpinan CEO mampu membuktikan diferensiasi pasar nyata.',
  },
  {
    id: 'inv_vc_1',
    name: 'Kassandra Cross',
    type: 'VENTURE_CAPITAL',
    icon: 'briefcase',
    firmName: 'Horizon Ventures Capital',
    checkSizeMin: 600000,
    checkSizeMax: 4000000,
    targetEquityPct: 0.15,
    patienceMonths: 18,
    reputationReq: 45,
    demandsBoardSeat: true,
    thesis: 'Metrik pertumbuhan pendapatan bulanan dan efisiensi burn rate menjadi syarat mutlak komite investasi.',
    flavorQuote: 'Buktikan rasio efisiensi modal dan margin kas sehat, kami akan buka akses jaringan global seri lanjutan.',
  },
  {
    id: 'inv_pe_1',
    name: 'Lord Arthur Pendelton',
    type: 'PRIVATE_EQUITY',
    icon: 'coins',
    firmName: 'BlackRock Peak Partners',
    checkSizeMin: 5000000,
    checkSizeMax: 30000000,
    targetEquityPct: 0.22,
    patienceMonths: 12,
    reputationReq: 65,
    demandsBoardSeat: true,
    thesis: 'Arus kas bebas (Free Cash Flow) dan profitabilitas operasional EBITDA sebagai tolok ukur valuasi absolut.',
    flavorQuote: 'Kami menolak spekulasi bakar uang; hanya konglomerasi dengan arus kas riil yang berhak atas modal kami.',
  },
  {
    id: 'inv_sovereign_1',
    name: 'Sheikh Tariq Al-Rashid',
    type: 'SOVEREIGN_FUND',
    icon: 'crown',
    firmName: 'Global Prosperity Sovereign Fund',
    checkSizeMin: 50000000,
    checkSizeMax: 250000000,
    targetEquityPct: 0.12,
    patienceMonths: 48,
    reputationReq: 85,
    demandsBoardSeat: false,
    thesis: 'Akuisisi saham minoritas strategis jangka panjang pada infrastruktur teknologi pertahanan dan supply chain global.',
    flavorQuote: 'Investasi kedaulatan lintas dekade untuk memperkokoh hegemoni teknologi masa depan tanpa intervensi manajerial harian.',
  },
];

export const INVESTOR_DIRECTORY = INITIAL_INVESTORS;

/**
 * Intelligent Term Sheet Generator evaluating company fundamentals.
 * Calculates offer using Discounted Cash Flow (DCF) & revenue multiples based on profitability and risk.
 * @param {Object} investor
 * @param {Object} companyState
 * @returns {Object|null}
 */
export function generateSmartTermSheet(investor, companyState) {
  if (companyState.reputation < investor.reputationReq) {
    return null;
  }

  const netCashflow = companyState.monthlyRevenue - companyState.monthlyExpenses;
  const isProfitable = netCashflow > 0;
  const runwayMonths = companyState.monthlyExpenses > 0 ? Math.round(companyState.cash / companyState.monthlyExpenses) : 24;

  // Investor specific valuation adjustment
  let multipleAdj = 1.0;
  if (investor.type === 'ANGEL') {
    const ceoLeadership = companyState.executives.CEO?.leadership || 75;
    multipleAdj = 0.9 + (ceoLeadership / 250); // Angels value CEO charisma highly
  } else if (investor.type === 'VENTURE_CAPITAL') {
    multipleAdj = isProfitable ? 1.25 : (runwayMonths > 6 ? 0.95 : 0.75);
  } else if (investor.type === 'PRIVATE_EQUITY') {
    multipleAdj = isProfitable ? 1.35 : 0.65; // PE penalizes cash burns heavily
  } else if (investor.type === 'SOVEREIGN_FUND') {
    multipleAdj = 1.20; // Sovereign funds pay top dollar for scale
  }

  const calculatedPostMoney = Math.round(companyState.valuation * multipleAdj);
  const targetCheck = Math.min(
    investor.checkSizeMax,
    Math.max(investor.checkSizeMin, Math.round(calculatedPostMoney * investor.targetEquityPct))
  );

  const postMoneyValuation = Math.max(targetCheck * 2, calculatedPostMoney);
  const dilutionPct = Math.round((targetCheck / postMoneyValuation) * 10000) / 100;

  return {
    investorId: investor.id,
    investorName: investor.name,
    firmName: investor.firmName,
    investorType: investor.type,
    cashOffered: targetCheck,
    postMoneyValuation,
    equityDilutionPct: dilutionPct,
    demandsBoardSeat: investor.demandsBoardSeat,
    status: 'PENDING',
    thesisRationale: investor.thesis,
  };
}

/**
 * Strategic Investor Negotiation AI.
 * Simulates an internal investment committee vote based on financial health, CEO persuasion, and market sentiment.
 * @param {Object} originalOffer
 * @param {number} counterValuation
 * @param {Object} companyState
 * @returns {Object}
 */
export function evaluateStrategicNegotiation(originalOffer, counterValuation, companyState) {
  const investor = INVESTOR_DIRECTORY.find(inv => inv.id === originalOffer.investorId) || {
    type: 'VENTURE_CAPITAL',
  };

  const ceoLeadership = companyState.executives.CEO?.leadership || 80;
  const netMargin = companyState.monthlyRevenue > 0
    ? (companyState.monthlyRevenue - companyState.monthlyExpenses) / companyState.monthlyRevenue
    : -0.2;

  // Max premium factor acceptable
  let baseTolerance = 1.15; // 15% bump baseline
  if (investor.type === 'ANGEL') {
    baseTolerance += (ceoLeadership / 180); // Angel is receptive to charismatic CEO
  } else if (investor.type === 'VENTURE_CAPITAL') {
    baseTolerance += netMargin > 0.15 ? 0.25 : 0.08;
    baseTolerance += (ceoLeadership / 220);
  } else if (investor.type === 'PRIVATE_EQUITY') {
    baseTolerance += netMargin > 0.25 ? 0.20 : -0.10; // PE strictly bounds multiples to EBITDA
  } else if (investor.type === 'SOVEREIGN_FUND') {
    baseTolerance += 0.35; // Sovereign funds are flexible on entry price for scale
  }

  // Market sentiment impact
  if (companyState.marketSentiment === 'BULL_MARKET' || companyState.marketSentiment === 'TECH_RALLY') {
    baseTolerance += 0.12;
  } else if (companyState.marketSentiment === 'BEAR_MARKET' || companyState.marketSentiment === 'CRASH') {
    baseTolerance -= 0.15;
  }

  const maxValuationAccepted = originalOffer.postMoneyValuation * baseTolerance;

  if (counterValuation <= originalOffer.postMoneyValuation) {
    return {
      decision: 'ACCEPTED',
      revisedValuation: counterValuation,
      reason: 'Komite investasi menyetujui valuasi yang diajukan tanpa keberatan klausul.',
    };
  } else if (counterValuation <= maxValuationAccepted) {
    // If close to original, accept outright; if stretched, propose compromise
    const spreadPct = (counterValuation - originalOffer.postMoneyValuation) / originalOffer.postMoneyValuation;
    if (spreadPct <= 0.10) {
      return {
        decision: 'ACCEPTED',
        revisedValuation: counterValuation,
        reason: `Komite mitra terkesan dengan kepemimpinan CEO (${ceoLeadership}/100) dan menyetujui kenaikan valuasi penuh!`,
      };
    } else {
      const compromise = Math.round((originalOffer.postMoneyValuation * 0.4) + (counterValuation * 0.6));
      return {
        decision: 'COUNTER',
        revisedValuation: compromise,
        reason: `Komite menawar balik di angka $${compromise.toLocaleString()} dengan mempertimbangkan profil risiko neraca perusahaan.`,
      };
    }
  } else {
    return {
      decision: 'REJECTED',
      reason: `Valuasi yang diajukan melampaui batas model valuasi komite investasi (${Math.round((baseTolerance - 1) * 100)}% di atas valuasi wajar).`,
    };
  }
}

/**
 * Initial Office Workers with specialized AI personalities and routines.
 */
export const INITIAL_OFFICE_WORKERS = [
  {
    id: 'w_1',
    name: 'Budi Santoso',
    role: 'Staff Software Architect',
    department: 'engineering',
    icon: 'code',
    x: 375,
    y: 105,
    targetX: 375,
    targetY: 105,
    deskX: 375,
    deskY: 105,
    state: 'working',
    morale: 90,
    focusTask: 'Optimalisasi Kluster Cloud & Latensi P99',
    speechBubble: '',
    speechTimer: 0,
  },
  {
    id: 'w_2',
    name: 'Jessica Tan',
    role: 'Quant Treasury Analyst',
    department: 'finance',
    icon: 'coins',
    x: 95,
    y: 295,
    targetX: 95,
    targetY: 295,
    deskX: 95,
    deskY: 295,
    state: 'working',
    morale: 88,
    focusTask: 'Arbitrase Suku Bunga & Hedging Pasar Modal',
    speechBubble: '',
    speechTimer: 0,
  },
  {
    id: 'w_3',
    name: 'Reza Pratama',
    role: 'Growth Lead & Social Marketer',
    department: 'marketing',
    icon: 'megaphone',
    x: 95,
    y: 365,
    targetX: 95,
    targetY: 365,
    deskX: 95,
    deskY: 365,
    state: 'working',
    morale: 92,
    focusTask: 'Akuisisi Pengguna Korporat & Kampanye Viral',
    speechBubble: '',
    speechTimer: 0,
  },
  {
    id: 'w_4',
    name: 'Siti Rahma',
    role: 'Operations & Supply Specialist',
    department: 'operations',
    icon: 'settings',
    x: 375,
    y: 170,
    targetX: 375,
    targetY: 170,
    deskX: 375,
    deskY: 170,
    state: 'working',
    morale: 85,
    focusTask: 'Efisiensi Fasilitas Server & Rantai Pasok Logistik',
    speechBubble: '',
    speechTimer: 0,
  },
];

/**
 * Intelligent Dynamic Banter Generator reacting to actual live company state.
 * @param {Object} state
 * @returns {Object}
 */
export function generateContextualDialogue(state) {
  const netCashflow = state.monthlyRevenue - state.monthlyExpenses;
  const isBurning = netCashflow < 0;
  const isRich = state.cash > 400000;
  const isHighRep = state.reputation > 75;

  const choices = [];

  // Financial context
  if (isBurning) {
    choices.push({
      sender: 'Jessica Tan',
      role: 'Quant Treasury',
      icon: 'coins',
      text: `Arus kas bulanan defisit -$${Math.abs(netCashflow).toLocaleString()}. Perlu kontrol ketat pengeluaran operasional.`,
      tag: 'finance',
    });
  } else if (isRich) {
    choices.push({
      sender: 'Jessica Tan',
      role: 'Quant Treasury',
      icon: 'coins',
      text: `Kas likuid surplus $${Math.round(state.cash).toLocaleString()}. Waktu tepat untuk ekspansi R&D atau buyback saham.`,
      tag: 'finance',
    });
  }

  // Tech context
  if (state.techLevel >= 5) {
    choices.push({
      sender: 'Budi Santoso',
      role: 'Staff Architect',
      icon: 'code',
      text: `Infrastruktur Level ${state.techLevel} beroperasi prima! Kecepatan throughput komputasi meningkat 200%.`,
      tag: 'tech',
    });
  } else {
    choices.push({
      sender: 'Budi Santoso',
      role: 'Staff Architect',
      icon: 'code',
      text: `Sedang melakukan refactoring modul microservices untuk menekan latensi API internal.`,
      tag: 'tech',
    });
  }

  // Growth & Market context
  if (isHighRep) {
    choices.push({
      sender: 'Reza Pratama',
      role: 'Growth Lead',
      icon: 'megaphone',
      text: `Reputasi korporat menembus ${state.reputation}/100! Sentimen calon klien institusional sangat antusias.`,
      tag: 'market',
    });
  } else {
    choices.push({
      sender: 'Reza Pratama',
      role: 'Growth Lead',
      icon: 'megaphone',
      text: `A/B testing kampanye akuisisi menunjukkan lonjakan konversi pada segmen B2B.`,
      tag: 'market',
    });
  }

  // Operations context
  choices.push({
    sender: 'Siti Rahma',
    role: 'Operations',
    icon: 'settings',
    text: `Pemeriksaan rutin pendingin server cair dan suplai daya cadangan berjalan optimal tanpa anomali.`,
    tag: 'general',
  });

  return choices[Math.floor(Math.random() * choices.length)];
}
