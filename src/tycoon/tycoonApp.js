/**
 * CorpTycoon: Master Tycoon Application Controller & UI Renderer
 * Pure Vanilla JavaScript • Modern 2026 Executive UI • Zero Emojis • Pure SVG Icons
 * High-Precision Deterministic Financial Simulations, Stock Candlestick Terminal,
 * 2D Headquarters Canvas, Cap Table Dilution, C-Suite Directives, and R&D Tech Tree.
 * Upgraded with Intelligent AI Workers, Strategic Investor Committee, and Competitor Rivalry AI.
 */

import { getIcon } from './icons.js';
import { soundEngine } from './audioEngine.js';
import {
  calculateValuation,
  calculateSharePrice,
  calculateOwnershipPercentages,
  processFundingRound,
  executeIpo,
  calculateCashFlow,
  formatCurrency,
  formatNumber,
} from './economy.js';
import {
  MARKET_REGIMES,
  INITIAL_COMPETITOR_STOCKS,
  generateNextCandle,
  generateInitialCandleHistory,
  checkControllingStake,
  executeStockBuy,
  executeStockSell,
  evaluateCompetitorStrategicMove,
} from './stockMarket.js';
import { generateProceduralCompetitors } from './companyGenerator.js';
import { StockCanvasChart } from './stockCanvas.js';
import { renderWorkforceView } from './workforceView.js';
import { renderStockMarketView, updateStockMarketViewTicks } from './stockMarketView.js';
import {
  EXECUTIVE_ROLES,
  calculateCSuiteBonuses,
  calculateExecutivePayroll,
  EXECUTIVE_CANDIDATE_POOL,
  DEFAULT_WORKFORCE,
  calculateTotalWorkforcePayroll,
  calculateWorkforceStats,
} from './csuite.js';
import {
  INITIAL_INVESTORS,
  INVESTOR_DIRECTORY,
  generateSmartTermSheet,
  evaluateStrategicNegotiation,
  INITIAL_OFFICE_WORKERS,
  generateContextualDialogue,
} from './aiNpc.js';
import { OfficeCanvasEngine } from './officeCanvas.js';
import { TECH_CATALOG } from './techTree.js';
import { t, SECTOR_OPTIONS } from './i18n.js';

export class TycoonApp {
  /**
   * @param {HTMLElement} container
   * @param {Object} options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.activeTab = 'hq'; // 'hq' | 'stocks' | 'equity' | 'csuite' | 'rnd'
    this.selectedTicker = 'TITN';
    this.selectedRoomId = 'ceo_suite';
    this.chatFilter = 'all';
    this.tradeMode = 'buy';
    this.tradeSharesInput = 1000;
    this.gameLoopInterval = null;
    this.stockChart = null;
    this.officeEngine = null;

    // Modals state
    this.isIpoModalOpen = false;
    this.ipoFloatPct = 0.20;
    this.negotiatingSheet = null;
    this.counterValuation = 0;
    this.selectedWorker = null;

    // Companies Tab State (Max 20 Active Global Enterprises)
    this.companySearchQuery = '';
    this.companySectorFilter = 'all';
    this.companySortBy = 'marketCap'; // 'marketCap' | 'price' | 'changePct' | 'playerStake' | 'techLevel'
    this.currentOpenDossierSymbol = null;

    // Workforce / Pegawai Tab State
    this.workforceActiveTier = 'all'; // 'all' | 'csuite' | 'managers' | 'seniors' | 'juniors'
    this.workforceViewMode = 'grid'; // 'grid' | 'table'
    this.workforceDeptFilter = 'all'; // 'all' | 'tech' | 'fin' | 'mkt' | 'ops' | 'hr'
    this.isCandidateDrawerOpen = false;

    // Stock Market Tab State
    this.stockSearchQuery = '';
    this.stockSectorFilter = 'all'; // 'all' | 'portfolio' | 'gainers' | 'tech' | 'conglomerate'

    // Collapsible Header & Start Screen Customization State
    const saved = this.loadSavedProfile();
    this.isStartScreenOpen = !saved;
    this.isHeaderCollapsed = localStorage.getItem('my_tycoon_header_collapsed') === 'true';

    // Settings, Theme & Language (Only accessible via Shortcut S + T)
    this.theme = localStorage.getItem('corp_tycoon_theme') || 'slate';
    document.body.setAttribute('data-theme', this.theme);
    this.lang = localStorage.getItem('corp_tycoon_lang') || 'id'; // 'id' | 'en'
    this.isSettingsOpen = false;
    this.isResetConfirmOpen = false;

    // Register strictly keyboard shortcut S + T
    this.setupShortcutListener();

    // Initialize Game State
    this.initState();

    // Render DOM structure
    this.render();

    // Attach simulation loop
    this.startGameLoop();
  }

  loadSavedProfile() {
    try {
      const saved = localStorage.getItem('corp_tycoon_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  }

  initState() {
    const saved = this.loadSavedProfile();
    const companyName = saved?.companyName || 'NEXUS DYNAMICS CORP';
    const ticker = (saved?.ticker || 'NXUS').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'NXUS';
    const sector = saved?.sector || 'Kecerdasan Buatan & Komputasi Neural';

    // Guaranteed 100% Founder Equity at initial start before accepting external investors
    const initialEquity = {
      totalShares: 10000000,
      founderShares: 10000000, // 100%
      investorShares: 0,        // 0%
      esopShares: 0,            // 0%
      publicShares: 0,          // 0%
    };

    const initialValuation = calculateValuation({
      cash: 150000,
      monthlyRevenue: 24000,
      monthlyExpenses: 14000,
      techLevel: 3,
      reputation: 60,
      marketSentiment: 1.0,
    });

    const initialSharePrice = calculateSharePrice(initialValuation, initialEquity.totalShares);
    const initialHistory = generateInitialCandleHistory(initialSharePrice, 24);

    const founderCeo = {
      id: 'exec_founder',
      name: 'Anda (Founder & Chief Architect)',
      role: 'CEO',
      icon: 'crown',
      salaryMonthly: 12000,
      equityGrantedPct: 100.0, // 100% Founder Equity
      leadership: 88,
      specialty: 92,
      morale: 100,
      loyalty: 100,
      trait: 'Charismatic Visionary',
      traitDescription: 'Meningkatkan kepercayaan investor +30%, reputasi korporat +5/bln, dan pendapatan +15%.',
      isPlayer: true,
    };

    // Procedurally generated 19 active competitor corporations excluding player's custom ticker
    const populatedCompetitors = generateProceduralCompetitors(19, ticker);

    this.state = {
      companyName,
      ticker,
      sector,
      day: 1,
      month: 1,
      year: 2026,
      gameSpeed: 1, // 0=pause, 1=1x, 2=2x, 5=5x
      reputation: 60,
      techLevel: 3,
      techPoints: 25,
      researchedTechs: [],
      marketSentiment: 'BULL_MARKET',
      sentimentTimer: 45,
      cash: 150000,
      monthlyRevenue: 24000,
      monthlyExpenses: 14000,
      totalDividendsPaid: 0,
      isIpoCompleted: false,
      equity: initialEquity,
      valuation: initialValuation,
      sharePrice: initialSharePrice,
      sharePriceHistory: initialHistory,
      alliances: [], // Active B2B strategic alliances with AI CEOs
      executives: {
        CEO: founderCeo,
        CTO: null,
        CFO: null,
        CMO: null,
        COO: null,
      },
      candidatePool: [...EXECUTIVE_CANDIDATE_POOL],
      competitorStocks: populatedCompetitors,
      investors: [...INITIAL_INVESTORS],
      activeTermSheets: [],
      workers: JSON.parse(JSON.stringify(INITIAL_OFFICE_WORKERS)),
      workforce: JSON.parse(JSON.stringify(DEFAULT_WORKFORCE)),
      chatMessages: [
        {
          id: 'msg_0',
          sender: 'Sistem Operasi Markas',
          role: 'AI Secretary',
          icon: 'building',
          text: `Selamat datang di Markas ${companyName}! Anda memegang 100% kedaulatan saham pendiri tanpa intervensi investor eksternal. Kendalikan strategi perusahaan dan perluas dominasi pasar modal global.`,
          timestamp: '08:00',
          tag: 'general',
        },
      ],
    };

    this.selectedTicker = ticker;
  }

  destroy() {
    if (this.gameLoopInterval) {
      clearInterval(this.gameLoopInterval);
      this.gameLoopInterval = null;
    }
    if (this.stockChart) {
      this.stockChart.destroy();
      this.stockChart = null;
    }
    if (this.officeEngine) {
      this.officeEngine.destroy();
      this.officeEngine = null;
    }
    if (this.cleanupShortcutListener) {
      this.cleanupShortcutListener();
      this.cleanupShortcutListener = null;
    }
    this.container.innerHTML = '';
  }

  startGameLoop() {
    if (this.gameLoopInterval) clearInterval(this.gameLoopInterval);
    this.gameLoopInterval = setInterval(() => {
      if (this.state.gameSpeed > 0) {
        this.tickSimulation();
      }
    }, 1000);
  }

  setSpeed(speed) {
    this.state.gameSpeed = speed;
    soundEngine.playKeyboardClick();
    this.updateHeaderBar();
  }

  tickSimulation() {
    const s = this.state;
    const speed = s.gameSpeed;
    if (speed <= 0) return;

    // Advance Calendar
    s.day += speed;
    if (s.day > 30) {
      s.day = 1;
      s.month += 1;
      if (s.month > 12) {
        s.month = 1;
        s.year += 1;
      }
    }

    // Calculate executive & workforce bonuses & payroll
    if (!s.workforce) {
      s.workforce = JSON.parse(JSON.stringify(DEFAULT_WORKFORCE));
    }
    const wfStats = calculateWorkforceStats(s.workforce, s.executives);
    const execBonuses = calculateCSuiteBonuses(s.executives);
    const totalPayroll = wfStats.totalPayroll;

    // Alliance Synergies: Each active B2B alliance provides +$3,000/mo cashflow and +0.2 tech synergy
    const allianceCount = (s.alliances || []).length;
    const allianceRevenueBonus = allianceCount * 3000;
    const allianceTechBonus = allianceCount * 0.2;

    // Apply bonuses to baseline revenue and expenses
    const totalRevenueMultiplier = execBonuses.revenueMultiplier + wfStats.totalRevenueMultiplierBonus;
    const totalExpenseReductionPct = Math.min(60, execBonuses.expenseReductionPct + wfStats.totalExpenseReductionPct);
    const effectiveRevenue = (s.monthlyRevenue * totalRevenueMultiplier) + allianceRevenueBonus;
    const effectiveExpenses = (s.monthlyExpenses * (1 - totalExpenseReductionPct / 100)) + totalPayroll;

    // Cash flow delta for this tick (proportional to speed)
    const { updatedCash } = calculateCashFlow(s.cash, effectiveRevenue, effectiveExpenses, (speed / 30));
    s.cash = updatedCash;

    // Tech points generation
    const techGain = (1 + (execBonuses.techGenerationBonus / 10) + wfStats.totalTechBonus + allianceTechBonus) * speed * 0.5;
    s.techPoints = Math.round((s.techPoints + techGain) * 10) / 10;

    // Dynamic Sentiment Regimes
    s.sentimentTimer -= speed;
    if (s.sentimentTimer <= 0) {
      const regimes = Object.keys(MARKET_REGIMES);
      s.marketSentiment = regimes[Math.floor(Math.random() * regimes.length)];
      s.sentimentTimer = 35 + Math.floor(Math.random() * 30);
      soundEngine.playAlertTone();
      this.addChatMessage({
        sender: 'Market Intelligence Bot',
        role: 'Regime Monitor',
        icon: 'activity',
        text: `Sentimen pasar modal beralih ke fase: ${MARKET_REGIMES[s.marketSentiment].label}.`,
        tag: 'market',
      });
    }

    // Recalculate Valuation & Share Price
    const sentimentMult = MARKET_REGIMES[s.marketSentiment].multiplier;
    s.valuation = calculateValuation({
      cash: s.cash,
      monthlyRevenue: effectiveRevenue,
      monthlyExpenses: effectiveExpenses,
      techLevel: s.techLevel,
      reputation: s.reputation,
      marketSentiment: sentimentMult,
    });
    s.sharePrice = calculateSharePrice(s.valuation, s.equity.totalShares);

    // Update Competitor Stocks with Strategic AI
    for (const comp of s.competitorStocks) {
      const aiMove = evaluateCompetitorStrategicMove(comp, s.marketSentiment);
      const shock = aiMove ? aiMove.priceImpact : 0;

      if (aiMove) {
        soundEngine.playAlertTone();
        this.addChatMessage({
          sender: `Market Wire: ${comp.symbol}`,
          role: 'Corporate Intelligence',
          icon: 'activity',
          text: aiMove.message,
          tag: 'market',
        });
      }

      const newCandle = generateNextCandle(comp.price, 0.025, 0.001, shock);
      comp.price = newCandle.close;
      if (!comp.totalShares || comp.totalShares <= 0) {
        comp.totalShares = Math.max(1000000, Math.round((comp.marketCap || 50000000) / (comp.price || 50)));
      }
      comp.marketCap = Math.round(comp.price * comp.totalShares);
      comp.history.push(newCandle);
      if (comp.history.length > 30) comp.history.shift();
      const firstPrice = comp.history[0].open;
      comp.changePct = Math.round(((comp.price - firstPrice) / firstPrice) * 1000) / 10;
    }

    // Update Player Share History
    const playerCandle = generateNextCandle(s.sharePrice, 0.018, 0.002);
    s.sharePriceHistory.push(playerCandle);
    if (s.sharePriceHistory.length > 30) s.sharePriceHistory.shift();

    // Smart Investor Term Sheet Generation
    if (Math.random() < 0.035 * speed && s.activeTermSheets.length < 2) {
      const eligibleInvestors = s.investors.filter(inv => s.reputation >= inv.reputationReq);
      if (eligibleInvestors.length > 0) {
        const inv = eligibleInvestors[Math.floor(Math.random() * eligibleInvestors.length)];
        const sheet = generateSmartTermSheet(inv, s);
        if (sheet && !s.activeTermSheets.some(st => st.investorId === inv.id)) {
          s.activeTermSheets.push(sheet);
          soundEngine.playCashChime();
          this.addChatMessage({
            sender: inv.firmName,
            role: 'Investor Relations',
            icon: 'briefcase',
            text: `Proposal Term Sheet Masuk! Investor ${sheet.investorName} (${sheet.investorType}) menawarkan ${formatCurrency(sheet.cashOffered)} pada valuasi post-money ${formatCurrency(sheet.postMoneyValuation)}.`,
            tag: 'finance',
          });
        }
      }
    }

    // Natural Contextual AI Worker Dialogue
    if (Math.random() < 0.05 * speed) {
      const dialogue = generateContextualDialogue(s);
      this.addChatMessage(dialogue);
    }

    // Update Active View Components with zero-lag targeted updates
    this.updateHeaderBar(false);
    if (this.activeTab === 'stocks') {
      if (this.stockChart) {
        const activeStock = this.getActiveStock();
        if (activeStock) {
          this.stockChart.setData(activeStock.symbol, activeStock.history);
        }
      }
      this.updateStockTabLiveTicks();
    }
    if (this.activeTab === 'companies') {
      this.updateCompaniesDOM();
    }
    if (this.currentOpenDossierSymbol) {
      this.updateDossierModalLiveDOM();
    }
  }

  addChatMessage(msg) {
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      timestamp: `${String(this.state.month).padStart(2, '0')}/${String(this.state.day).padStart(2, '0')}`,
      ...msg,
    };
    this.state.chatMessages.push(newMsg);
    if (this.state.chatMessages.length > 40) {
      this.state.chatMessages.shift();
    }
    if (this.activeTab === 'hq') {
      this.updateChatDOM();
    }
  }

  getActiveStock() {
    if (this.selectedTicker === this.state.ticker) {
      return {
        symbol: this.state.ticker,
        name: this.state.companyName,
        sector: this.state.sector || 'Kecerdasan Buatan & Komputasi Neural',
        price: this.state.sharePrice,
        changePct: 2.4,
        totalShares: this.state.equity.totalShares,
        playerOwnedShares: this.state.equity.founderShares,
        history: this.state.sharePriceHistory,
        marketCap: this.state.valuation,
        peRatio: 22.4,
        dividendYieldPct: 1.5,
        isCompetitor: false,
        isAcquiredByPlayer: true,
        description: 'Perusahaan teknologi yang Anda dirikan dan kendalikan secara mandiri dengan 100% kedaulatan pendiri.',
      };
    }
    return this.state.competitorStocks.find(s => s.symbol === this.selectedTicker) || this.state.competitorStocks[0];
  }

  // Master UI Renderer
  render() {
    this.container.className = 'w-screen h-screen overflow-hidden bg-[#070B14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black antialiased';
    this.container.innerHTML = `
      <!-- Top Navigation & Financial Ticker Bar (Fixed Widescreen Desktop Header) -->
      <header id="tycoon-header" class="shrink-0 z-40 bg-[#0B101D]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-2 transition-all duration-200">
        <!-- Rendered by updateHeaderBar -->
      </header>

      <!-- Main Content Container (Desktop 16:9 Optimized Scroll Container) -->
      <main id="tycoon-main" class="flex-1 overflow-y-auto max-w-[1720px] 2xl:max-w-[1840px] w-full mx-auto p-4 scrollbar-thin">
        <!-- Tab Content Mounted Here -->
      </main>

      <!-- Footer Info (Clean Desktop Status Strip) -->
      <footer class="shrink-0 bg-[#0B101D]/90 border-t border-slate-800/80 text-[11px] text-slate-400 py-1.5 px-4 select-none">
        <div class="max-w-[1720px] 2xl:max-w-[1840px] mx-auto flex items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-300">My Company Simulator © 2026</span>
            <span class="text-slate-600">·</span>
            <span>${t('footer_tagline', this.lang)}</span>
          </div>
          <div class="flex items-center gap-2.5 text-slate-500 font-mono text-[10px]">
            <span class="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">DESKTOP 16:9 WIDESCREEN</span>
            <span class="text-slate-600">·</span>
            <span class="text-emerald-400 font-semibold">LIVE TICK 60FPS</span>
            <span class="text-slate-600">·</span>
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400/90 font-mono font-bold flex items-center gap-1.5 shadow-inner">
              ${getIcon('keyboard', 'w-3 h-3 text-amber-400')}
              <span>SHORTCUT: S + T</span>
            </span>
          </div>
        </div>
      </footer>

      <!-- Modals Container -->
      <div id="tycoon-modals"></div>
    `;

    this.updateHeaderBar(true);
    this.renderActiveTab();

    // Launch First-Time Start Screen Customization Modal if not yet configured
    if (this.isStartScreenOpen) {
      this.openStartScreenModal(true);
    }
  }

  /**
   * Ultra-fast targeted header updater.
   * If full=false, updates only the text content of existing DOM nodes without rebuilding HTML or losing hover/focus.
   * If full=true, re-renders the complete header template with collapsible/expandable state.
   */
  updateHeaderBar(full = false) {
    const headerEl = document.getElementById('tycoon-header');
    if (!headerEl) return;

    const s = this.state;
    if (!s.workforce) {
      s.workforce = JSON.parse(JSON.stringify(DEFAULT_WORKFORCE));
    }
    const wfStats = calculateWorkforceStats(s.workforce, s.executives);
    const pcts = calculateOwnershipPercentages(s.equity);
    const totalPayroll = wfStats.totalPayroll;
    const execBonuses = calculateCSuiteBonuses(s.executives);
    const totalRevMultiplier = execBonuses.revenueMultiplier + wfStats.totalRevenueMultiplierBonus;
    const totalExpReduction = Math.min(60, execBonuses.expenseReductionPct + wfStats.totalExpenseReductionPct);
    const netCashflow = (s.monthlyRevenue * totalRevMultiplier) - ((s.monthlyExpenses * (1 - totalExpReduction / 100)) + totalPayroll);
    const isNetPositive = netCashflow >= 0;
    const isControlling = pcts.founderPct >= 50.0;

    const currentMode = headerEl.getAttribute('data-collapsed');
    const targetMode = String(this.isHeaderCollapsed);
    const needsFullBuild = full || currentMode !== targetMode || !headerEl.querySelector('.tab-btn');

    if (needsFullBuild) {
      headerEl.setAttribute('data-collapsed', targetMode);
      if (this.isHeaderCollapsed) {
        // Collapsed Single-Row Header
        headerEl.innerHTML = `
          <div class="max-w-[1720px] 2xl:max-w-[1840px] mx-auto flex items-center justify-between gap-3 select-none">
            <!-- Left: Return, Identity & Compact Financial Ticker -->
            <div class="flex items-center gap-2.5 shrink-0">
              <button id="btn-return-beranda" class="h-8 w-8 inline-flex items-center justify-center text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/80 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95" title="${t('btn_return', this.lang)}">
                ${getIcon('gamepad', 'w-4 h-4 text-amber-400')}
              </button>
              <div class="flex items-center gap-1.5">
                <span id="header-company-name-collapsed" class="text-xs font-bold tracking-tight text-white font-mono">${s.companyName}</span>
                <span id="header-company-ticker-collapsed" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700/80 font-bold">${s.ticker}</span>
                <button id="btn-customize-company" class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer" title="${t('btn_customize', this.lang)}">
                  ${getIcon('sliders', 'w-3 h-3')}
                </button>
              </div>

              <!-- Compact Metrics Ribbon -->
              <div class="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono ml-1">
                <span class="text-slate-400 text-[10px]">${t('hdr_cash_short', this.lang)}</span>
                <span id="header-cash-collapsed" class="font-bold text-white tabular-nums">${formatCurrency(s.cash)}</span>
                <span class="text-slate-700">|</span>
                <span class="text-slate-400 text-[10px]">${t('hdr_cashflow_short', this.lang)}</span>
                <span id="header-cashflow-collapsed" class="font-bold tabular-nums ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}">${isNetPositive ? '+' : ''}${formatCurrency(netCashflow)}/bln</span>
                <span class="text-slate-700">|</span>
                <span class="text-slate-400 text-[10px]">${t('hdr_val_short', this.lang)}</span>
                <span id="header-val-collapsed" class="font-bold text-cyan-400 tabular-nums">${formatCurrency(s.valuation, true)}</span>
                <span class="text-slate-700">|</span>
                <span class="text-slate-400 text-[10px]">${t('hdr_price_short', this.lang)}</span>
                <span id="header-price-collapsed" class="font-bold text-amber-400 tabular-nums">$${s.sharePrice.toFixed(2)}</span>
                <span class="text-slate-700">|</span>
                <span class="text-slate-400 text-[10px]">${t('hdr_founder_short', this.lang)}</span>
                <span id="header-founder-collapsed" class="font-bold text-emerald-400 tabular-nums">${pcts.founderPct.toFixed(1)}%</span>
              </div>
            </div>

            <!-- Center: Navigation Tabs in Compact Bar -->
            <nav class="flex items-center gap-1 overflow-x-auto scrollbar-none">
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'hq' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="hq" data-active="${this.activeTab === 'hq'}">
                ${getIcon('building', 'w-3.5 h-3.5 text-amber-400')}
                <span>${t('tab_hq', this.lang)}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'stocks' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="stocks" data-active="${this.activeTab === 'stocks'}">
                ${getIcon('trendingUp', 'w-3.5 h-3.5 text-emerald-400')}
                <span>${t('tab_stocks', this.lang)}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'companies' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="companies" data-active="${this.activeTab === 'companies'}">
                ${getIcon('globe', 'w-3.5 h-3.5 text-cyan-400')}
                <span>${t('tab_companies', this.lang)}</span>
                <span class="header-badge-companies px-1.5 py-0.2 text-[10px] rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">20</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'equity' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="equity" data-active="${this.activeTab === 'equity'}">
                ${getIcon('pieChart', 'w-3.5 h-3.5 text-blue-400')}
                <span>${t('tab_equity', this.lang)}</span>
                <span class="header-badge-equity px-1.5 py-0.2 text-[10px] rounded bg-amber-500/20 text-amber-300 font-mono font-bold ${s.activeTermSheets.length > 0 ? '' : 'hidden'}">${s.activeTermSheets.length}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'csuite' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="csuite" data-active="${this.activeTab === 'csuite'}">
                ${getIcon('users', 'w-3.5 h-3.5 text-purple-400')}
                <span>${t('tab_csuite', this.lang)}</span>
                <span class="header-badge-csuite px-1.5 py-0.2 text-[10px] rounded bg-purple-500/20 text-purple-300 font-mono font-bold">${wfStats.totalHeadcount}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'rnd' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="rnd" data-active="${this.activeTab === 'rnd'}">
                ${getIcon('cpu', 'w-3.5 h-3.5 text-cyan-400')}
                <span>${t('tab_rnd', this.lang)}</span>
                <span class="header-badge-rnd text-[10px] font-mono text-cyan-400">LVL ${s.techLevel}</span>
              </button>
            </nav>

            <!-- Right: Controls & Expand Button -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Speed Selector -->
              <div class="h-8 inline-flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5">
                <button class="btn-speed h-7 px-2 inline-flex items-center justify-center rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 0 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="0" title="${t('btn_pause', this.lang)}">
                  ${getIcon('pause', 'w-3.5 h-3.5')}
                </button>
                <button class="btn-speed h-7 px-2.5 inline-flex items-center justify-center text-xs font-mono font-semibold rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 1 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="1" title="${t('btn_speed_1', this.lang)}">
                  1x
                </button>
                <button class="btn-speed h-7 px-2 inline-flex items-center justify-center rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 2 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="2" title="${t('btn_speed_2', this.lang)}">
                  ${getIcon('fastForward', 'w-3.5 h-3.5')}
                </button>
                <button class="btn-speed h-7 px-2 inline-flex items-center justify-center rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 5 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="5" title="${t('btn_speed_5', this.lang)}">
                  ${getIcon('zap', 'w-3.5 h-3.5')}
                </button>
              </div>

              <!-- Audio Mute -->
              <button id="btn-toggle-sound" class="h-8 w-8 inline-flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer" title="${soundEngine.isMuted ? t('btn_sound_unmute', this.lang) : t('btn_sound_mute', this.lang)}">
                ${getIcon(soundEngine.isMuted ? 'volumeMute' : 'volume', 'w-4 h-4')}
              </button>

              <!-- Expand Bar Toggle Button -->
              <button id="btn-toggle-header-collapse" class="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 rounded-lg transition-all cursor-pointer font-bold shadow-sm" title="${t('btn_expand_tooltip', this.lang)}">
                ${getIcon('sliders', 'w-3.5 h-3.5')}
                <span class="hidden sm:inline">${t('btn_expand', this.lang)}</span>
              </button>
            </div>
          </div>
        `;
      } else {
        // Expanded High-Precision Command Header
        headerEl.innerHTML = `
          <div class="max-w-[1720px] 2xl:max-w-[1840px] mx-auto flex flex-col gap-2 select-none">
            <!-- Zone 1: Brand, Financial KPIs Strip & Global Controls -->
            <div class="flex items-center justify-between gap-3">
              <!-- Brand & Return -->
              <div class="flex items-center gap-2.5 shrink-0">
                <button id="btn-return-beranda" class="h-8 w-8 inline-flex items-center justify-center text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/80 rounded-lg transition-all cursor-pointer shadow-sm group active:scale-95" title="${t('btn_return', this.lang)}">
                  ${getIcon('gamepad', 'w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform')}
                </button>
                <div class="flex items-baseline gap-2">
                  <span id="header-company-name" class="text-sm font-bold tracking-tight text-white font-mono">${s.companyName}</span>
                  <span id="header-company-ticker" class="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700/80 font-bold">${s.ticker}</span>
                  <button id="btn-customize-company" class="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer" title="${t('btn_customize', this.lang)}">
                    ${getIcon('sliders', 'w-3.5 h-3.5')}
                  </button>
                </div>
              </div>

              <!-- Financial KPIs Strip (High-Precision Desktop Tabular View) -->
              <div class="flex items-center gap-4 text-xs font-mono">
                <!-- Cash -->
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 uppercase font-sans">${t('hdr_cash', this.lang)}</span>
                  <span id="header-cash" class="font-bold text-white tabular-nums">${formatCurrency(s.cash)}</span>
                </div>
                <div class="w-px h-6 bg-slate-800"></div>
                <!-- Net Flow -->
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 uppercase font-sans">${t('hdr_cashflow', this.lang)}</span>
                  <span id="header-cashflow" class="font-bold tabular-nums ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}">
                    ${isNetPositive ? '+' : ''}${formatCurrency(netCashflow)}/bln
                  </span>
                </div>
                <div class="w-px h-6 bg-slate-800"></div>
                <!-- Valuation -->
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 uppercase font-sans">${t('hdr_valuation', this.lang)}</span>
                  <span id="header-valuation" class="font-bold text-cyan-400 tabular-nums">${formatCurrency(s.valuation, true)}</span>
                </div>
                <div class="w-px h-6 bg-slate-800"></div>
                <!-- Share Price -->
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 uppercase font-sans">${t('hdr_share_price', this.lang)}</span>
                  <span id="header-share-price" class="font-bold text-amber-400 tabular-nums">$${s.sharePrice.toFixed(2)}</span>
                </div>
                <div class="w-px h-6 bg-slate-800"></div>
                <!-- Founder Stake -->
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 uppercase font-sans">${t('hdr_founder_stake', this.lang)}</span>
                  <span id="header-founder-stake" class="font-bold tabular-nums ${isControlling ? 'text-emerald-400' : 'text-amber-400'}">
                    ${pcts.founderPct.toFixed(1)}% ${isControlling ? t('hdr_majority', this.lang) : t('hdr_minority', this.lang)}
                  </span>
                </div>
              </div>

              <!-- Controls: Speed, Audio, IPO & Collapse Button -->
              <div class="flex items-center gap-2 shrink-0">
                <!-- Calendar Date Badge -->
                <div class="h-8 inline-flex items-center gap-1.5 px-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                  ${getIcon('calendar', 'w-3.5 h-3.5 text-slate-400')}
                  <span id="header-date-text">${String(s.day).padStart(2, '0')}/${String(s.month).padStart(2, '0')}/${s.year}</span>
                </div>

                <!-- Speed Selector -->
                <div class="h-8 inline-flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 gap-0.5">
                  <button class="btn-speed h-7 px-2 inline-flex items-center justify-center rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 0 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="0" title="${t('btn_pause', this.lang)}">
                    ${getIcon('pause', 'w-3.5 h-3.5')}
                  </button>
                  <button class="btn-speed h-7 px-2.5 inline-flex items-center justify-center text-xs font-mono font-semibold rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 1 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="1" title="${t('btn_speed_1', this.lang)}">
                    1x
                  </button>
                  <button class="btn-speed h-7 px-2 inline-flex items-center justify-center rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 2 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="2" title="${t('btn_speed_2', this.lang)}">
                    ${getIcon('fastForward', 'w-3.5 h-3.5')}
                  </button>
                  <button class="btn-speed h-7 px-2 inline-flex items-center justify-center rounded-md transition-all active:scale-95 cursor-pointer ${s.gameSpeed === 5 ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}" data-speed="5" title="${t('btn_speed_5', this.lang)}">
                    ${getIcon('zap', 'w-3.5 h-3.5')}
                  </button>
                </div>

                <!-- Audio Mute Icon-Button -->
                <button id="btn-toggle-sound" class="h-8 w-8 inline-flex items-center justify-center bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-lg transition-all active:scale-95 cursor-pointer" title="${soundEngine.isMuted ? t('btn_sound_unmute', this.lang) : t('btn_sound_mute', this.lang)}">
                  ${getIcon(soundEngine.isMuted ? 'volumeMute' : 'volume', 'w-4 h-4')}
                </button>

                <!-- IPO Action Slot -->
                <div id="header-ipo-slot">
                  ${!s.isIpoCompleted ? `
                    <button id="btn-open-ipo" class="h-8 inline-flex items-center gap-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer group" title="${t('btn_ipo_tooltip', this.lang)}">
                      ${getIcon('rocket', 'w-4 h-4 group-hover:scale-110 transition-transform')}
                      <span>${t('btn_ipo', this.lang)}</span>
                    </button>
                  ` : `
                    <div class="h-8 inline-flex items-center gap-1.5 px-2.5 bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-xs font-mono font-bold rounded-lg" title="${t('badge_public_tooltip', this.lang)}">
                      ${getIcon('checkCircle', 'w-3.5 h-3.5')}
                      <span>${t('badge_public', this.lang)}</span>
                    </div>
                  `}
                </div>

                <!-- Collapse Bar Button -->
                <button id="btn-toggle-header-collapse" class="h-8 px-2.5 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-all cursor-pointer font-medium" title="${t('btn_collapse_tooltip', this.lang)}">
                  ${getIcon('sliders', 'w-3.5 h-3.5 text-slate-400')}
                  <span class="hidden sm:inline">${t('btn_collapse', this.lang)}</span>
                </button>
              </div>
            </div>

            <!-- Zone 2: Navigation Tabs Row -->
            <nav class="flex items-center gap-1.5 border-t border-slate-800/60 pt-1.5 overflow-x-auto scrollbar-none">
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'hq' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="hq" data-active="${this.activeTab === 'hq'}">
                ${getIcon('building', 'w-3.5 h-3.5 text-amber-400')}
                <span>${t('tab_hq', this.lang)}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'stocks' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="stocks" data-active="${this.activeTab === 'stocks'}">
                ${getIcon('trendingUp', 'w-3.5 h-3.5 text-emerald-400')}
                <span>${t('tab_stocks', this.lang)}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'companies' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="companies" data-active="${this.activeTab === 'companies'}">
                ${getIcon('globe', 'w-3.5 h-3.5 text-cyan-400')}
                <span>${t('tab_companies', this.lang)}</span>
                <span class="header-badge-companies px-1.5 py-0.2 text-[10px] rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">20</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'equity' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="equity" data-active="${this.activeTab === 'equity'}">
                ${getIcon('pieChart', 'w-3.5 h-3.5 text-blue-400')}
                <span>${t('tab_equity', this.lang)}</span>
                <span class="header-badge-equity px-1.5 py-0.2 text-[10px] rounded bg-amber-500/20 text-amber-300 font-mono font-bold ${s.activeTermSheets.length > 0 ? '' : 'hidden'}">${s.activeTermSheets.length}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'csuite' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="csuite" data-active="${this.activeTab === 'csuite'}">
                ${getIcon('users', 'w-3.5 h-3.5 text-purple-400')}
                <span>${t('tab_csuite', this.lang)}</span>
                <span class="header-badge-csuite px-1.5 py-0.2 text-[10px] rounded bg-purple-500/20 text-purple-300 font-mono font-bold">${wfStats.totalHeadcount}</span>
              </button>
              <button class="tab-btn h-8 inline-flex items-center gap-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer active:scale-[0.98] ${this.activeTab === 'rnd' ? 'active-tab' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'}" data-tab="rnd" data-active="${this.activeTab === 'rnd'}">
                ${getIcon('cpu', 'w-3.5 h-3.5 text-cyan-400')}
                <span>${t('tab_rnd', this.lang)}</span>
                <span class="header-badge-rnd text-[10px] font-mono text-cyan-400">LVL ${s.techLevel}</span>
              </button>
            </nav>
          </div>
        `;
      }

      // Attach Header Event Handlers once per DOM build
      this.attachHeaderEvents(headerEl);
    }

    // Always perform fast in-place sync for all dynamic nodes (0ms lag, zero layout shift)
    this.syncHeaderDynamicState(headerEl, s, wfStats, pcts, netCashflow, isNetPositive, isControlling);
  }

  attachHeaderEvents(headerEl) {
    document.getElementById('btn-return-beranda')?.addEventListener('click', () => {
      soundEngine.playKeyboardClick();
      if (this.options.onReturnToBeranda) {
        this.options.onReturnToBeranda();
      } else if (typeof window.navigateTo === 'function') {
        window.navigateTo('/');
      }
    });

    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      soundEngine.toggleMute();
      this.updateHeaderBar(false);
    });

    document.getElementById('btn-toggle-header-collapse')?.addEventListener('click', () => {
      this.isHeaderCollapsed = !this.isHeaderCollapsed;
      try {
        localStorage.setItem('my_tycoon_header_collapsed', this.isHeaderCollapsed ? 'true' : 'false');
      } catch (e) {}
      soundEngine.playKeyboardClick();
      this.updateHeaderBar(true);
    });

    document.getElementById('btn-customize-company')?.addEventListener('click', () => {
      soundEngine.playKeyboardClick();
      this.openStartScreenModal(false);
    });

    document.getElementById('btn-open-ipo')?.addEventListener('click', () => {
      soundEngine.playKeyboardClick();
      this.openIpoModal();
    });

    headerEl.querySelectorAll('.btn-speed').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const spd = parseInt(e.currentTarget.getAttribute('data-speed'), 10);
        this.setSpeed(spd);
      });
    });

    headerEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        soundEngine.playKeyboardClick();
        this.switchTab(tab);
      });
    });
  }

  syncHeaderDynamicState(headerEl, s, wfStats, pcts, netCashflow, isNetPositive, isControlling) {
    // 1. Financial Numbers & Date
    const cashEl = document.getElementById('header-cash');
    if (cashEl) cashEl.textContent = formatCurrency(s.cash);

    const cashflowEl = document.getElementById('header-cashflow');
    if (cashflowEl) {
      cashflowEl.textContent = `${isNetPositive ? '+' : ''}${formatCurrency(netCashflow)}/bln`;
      cashflowEl.className = `font-bold tabular-nums ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`;
    }

    const valEl = document.getElementById('header-valuation');
    if (valEl) valEl.textContent = formatCurrency(s.valuation, true);

    const priceEl = document.getElementById('header-share-price');
    if (priceEl) priceEl.textContent = `$${s.sharePrice.toFixed(2)}`;

    const founderEl = document.getElementById('header-founder-stake');
    if (founderEl) {
      founderEl.textContent = `${pcts.founderPct.toFixed(1)}% ${isControlling ? t('hdr_majority', this.lang) : t('hdr_minority', this.lang)}`;
      founderEl.className = `font-bold tabular-nums ${isControlling ? 'text-emerald-400' : 'text-amber-400'}`;
    }

    const dateEl = document.getElementById('header-date-text');
    if (dateEl) {
      dateEl.textContent = `${String(s.day).padStart(2, '0')}/${String(s.month).padStart(2, '0')}/${s.year}`;
    }

    // Collapsed Mode Fields
    const cashColEl = document.getElementById('header-cash-collapsed');
    if (cashColEl) cashColEl.textContent = formatCurrency(s.cash);

    const cashflowColEl = document.getElementById('header-cashflow-collapsed');
    if (cashflowColEl) {
      cashflowColEl.textContent = `${isNetPositive ? '+' : ''}${formatCurrency(netCashflow)}/bln`;
      cashflowColEl.className = `font-bold tabular-nums ${isNetPositive ? 'text-emerald-400' : 'text-rose-400'}`;
    }

    const valColEl = document.getElementById('header-val-collapsed');
    if (valColEl) valColEl.textContent = formatCurrency(s.valuation, true);

    const priceColEl = document.getElementById('header-price-collapsed');
    if (priceColEl) priceColEl.textContent = `$${s.sharePrice.toFixed(2)}`;

    const founderColEl = document.getElementById('header-founder-collapsed');
    if (founderColEl) founderColEl.textContent = `${pcts.founderPct.toFixed(1)}%`;

    // Company Name & Ticker
    const compNameEl = document.getElementById('header-company-name');
    if (compNameEl) compNameEl.textContent = s.companyName;
    const compTickerEl = document.getElementById('header-company-ticker');
    if (compTickerEl) compTickerEl.textContent = s.ticker;

    const compNameColEl = document.getElementById('header-company-name-collapsed');
    if (compNameColEl) compNameColEl.textContent = s.companyName;
    const compTickerColEl = document.getElementById('header-company-ticker-collapsed');
    if (compTickerColEl) compTickerColEl.textContent = s.ticker;

    // 2. Speed Buttons Active Status
    headerEl.querySelectorAll('.btn-speed').forEach(btn => {
      const spd = parseInt(btn.getAttribute('data-speed'), 10);
      const isActive = spd === s.gameSpeed;
      if (isActive) {
        btn.className = 'btn-speed h-7 px-2.5 inline-flex items-center justify-center text-xs font-mono font-bold rounded-md transition-all active:scale-95 cursor-pointer bg-amber-500 text-slate-950 shadow-sm';
      } else {
        btn.className = 'btn-speed h-7 px-2 inline-flex items-center justify-center text-xs font-mono font-semibold rounded-md transition-all active:scale-95 cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800';
      }
    });

    // 3. Audio Mute Button
    const muteBtn = document.getElementById('btn-toggle-sound');
    if (muteBtn) {
      muteBtn.innerHTML = getIcon(soundEngine.isMuted ? 'volumeMute' : 'volume', 'w-4 h-4');
      muteBtn.title = soundEngine.isMuted ? t('btn_sound_unmute', this.lang) : t('btn_sound_mute', this.lang);
    }

    // 4. Tab Navigation Buttons & Badges
    headerEl.querySelectorAll('.tab-btn').forEach(btn => {
      const tab = btn.getAttribute('data-tab');
      const isActive = tab === this.activeTab;
      btn.setAttribute('data-active', isActive ? 'true' : 'false');
      if (isActive) {
        btn.classList.add('active-tab');
        btn.classList.remove('text-slate-400', 'border-transparent');
      } else {
        btn.classList.remove('active-tab');
        btn.classList.add('text-slate-400', 'border-transparent');
      }
    });

    // Tab Badges
    headerEl.querySelectorAll('.header-badge-csuite').forEach(el => {
      el.textContent = wfStats.totalHeadcount;
    });

    headerEl.querySelectorAll('.header-badge-equity').forEach(el => {
      el.textContent = s.activeTermSheets.length;
      if (s.activeTermSheets.length > 0) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    });

    headerEl.querySelectorAll('.header-badge-rnd').forEach(el => {
      el.textContent = `LVL ${s.techLevel}`;
    });

    // 5. IPO Slot Sync
    const ipoSlot = document.getElementById('header-ipo-slot');
    if (ipoSlot) {
      if (s.isIpoCompleted) {
        if (!ipoSlot.querySelector('.text-emerald-400')) {
          ipoSlot.innerHTML = `
            <div class="h-8 inline-flex items-center gap-1.5 px-2.5 bg-emerald-950/80 border border-emerald-600/40 text-emerald-400 text-xs font-mono font-bold rounded-lg" title="${t('badge_public_tooltip', this.lang)}">
              ${getIcon('checkCircle', 'w-3.5 h-3.5')}
              <span>${t('badge_public', this.lang)}</span>
            </div>
          `;
        }
      } else {
        if (!ipoSlot.querySelector('#btn-open-ipo')) {
          ipoSlot.innerHTML = `
            <button id="btn-open-ipo" class="h-8 inline-flex items-center gap-1.5 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer group" title="${t('btn_ipo_tooltip', this.lang)}">
              ${getIcon('rocket', 'w-4 h-4 group-hover:scale-110 transition-transform')}
              <span>${t('btn_ipo', this.lang)}</span>
            </button>
          `;
          document.getElementById('btn-open-ipo')?.addEventListener('click', () => {
            soundEngine.playKeyboardClick();
            this.openIpoModal();
          });
        }
      }
    }
  }

  switchTab(tab) {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.updateHeaderBar(false);
    this.renderActiveTab();
  }

  // ==========================================
  // KEYBOARD SHORTCUT: S + T (SETTINGS ONLY VIA SHORTCUT)
  // ==========================================
  setupShortcutListener() {
    const activeKeys = new Set();
    let lastSPress = 0;

    const onKeyDown = (e) => {
      // Ignore if user is currently typing inside an input, textarea, or select
      const activeEl = document.activeElement;
      const tag = (activeEl?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return;
      }

      const key = (e.key || '').toLowerCase();
      activeKeys.add(key);

      const now = Date.now();
      if (key === 's') {
        lastSPress = now;
      }

      // Check simultaneous 's' and 't' OR sequential chord 's' then 't' within 800ms
      const isSimultaneous = (activeKeys.has('s') && activeKeys.has('t'));
      const isSequentialST = (key === 't' && (now - lastSPress < 800));

      if (isSimultaneous || isSequentialST) {
        e.preventDefault();
        activeKeys.clear();
        lastSPress = 0;
        this.toggleSettingsModal();
        return;
      }

      // Escape key to dismiss settings modal if open
      if (key === 'escape' && this.isSettingsOpen) {
        e.preventDefault();
        this.closeSettingsModal();
      }
    };

    const onKeyUp = (e) => {
      const key = (e.key || '').toLowerCase();
      activeKeys.delete(key);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    this.cleanupShortcutListener = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }

  toggleSettingsModal() {
    if (this.isSettingsOpen) {
      this.closeSettingsModal();
    } else {
      this.openSettingsModal();
    }
  }

  closeSettingsModal() {
    this.isSettingsOpen = false;
    this.isResetConfirmOpen = false;
    const modalsEl = document.getElementById('tycoon-modals');
    if (modalsEl) modalsEl.innerHTML = '';
  }

  // ==========================================
  // MODAL: SYSTEM SETTINGS (THEMES, LANGUAGE, RESET)
  // Strictly accessible only via shortcut S + T
  // ==========================================
  openSettingsModal() {
    const modalsEl = document.getElementById('tycoon-modals');
    if (!modalsEl) return;

    this.isSettingsOpen = true;
    soundEngine.playKeyboardClick();

    const isEn = this.lang === 'en';

    const themes = [
      { id: 'slate', name: 'Midnight Slate', desc: isEn ? 'Cyber-Navy & Sky Blue' : 'Klasik Cyber-Navy & Biru Langit', color: '#0ea5e9', dotClass: 'bg-sky-500', borderActive: 'border-sky-500 shadow-sky-500/20' },
      { id: 'cyan', name: 'Cyberpunk Neon', desc: isEn ? 'Electric Cyan & Neon Hologram' : 'Sian Elektrik & Pendar Neon', color: '#00e5ff', dotClass: 'bg-cyan-400', borderActive: 'border-cyan-400 shadow-cyan-400/20' },
      { id: 'emerald', name: 'BioTech Matrix', desc: isEn ? 'Genomic Emerald & Matrix Green' : 'Zamrud Genomik & Hijau Matrix', color: '#10b981', dotClass: 'bg-emerald-500', borderActive: 'border-emerald-500 shadow-emerald-500/20' },
      { id: 'amber', name: 'Imperial Gold', desc: isEn ? 'Executive Amber & Sovereign Capital' : 'Emas Eksekutif & Modal Berdaulat', color: '#f59e0b', dotClass: 'bg-amber-500', borderActive: 'border-amber-500 shadow-amber-500/20' },
      { id: 'violet', name: 'Cosmic Violet', desc: isEn ? 'Deep Space Quantum Purple' : 'Ungu Quantum Antariksa Orbit', color: '#a855f7', dotClass: 'bg-purple-500', borderActive: 'border-purple-500 shadow-purple-500/20' },
      { id: 'crimson', name: 'Obsidian Crimson', desc: isEn ? 'Vampire Red & High-Roller Edge' : 'Merah Delima & Karbon Vampir', color: '#f43f5e', dotClass: 'bg-rose-500', borderActive: 'border-rose-500 shadow-rose-500/20' },
    ];

    const renderSettings = () => {
      modalsEl.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div class="bg-gradient-to-b from-[#0F1626] to-[#0A0E1A] border border-cyan-500/40 rounded-xl max-w-xl w-full p-5 sm:p-6 flex flex-col gap-4 shadow-2xl shadow-black relative my-auto">
            <!-- Modal Header -->
            <div class="flex items-start justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-md bg-cyan-950/80 border border-cyan-700/70 text-cyan-400 shrink-0 shadow-inner">
                  ${getIcon('settings', 'w-5 h-5')}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h2 class="text-base font-bold text-white tracking-tight">
                      ${t('set_title', this.lang)}
                    </h2>
                    <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1 shadow-inner">
                      ${getIcon('keyboard', 'w-3 h-3')}
                      <span>S + T</span>
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 mt-0.5">
                    ${t('set_sub', this.lang)}
                  </p>
                </div>
              </div>
              <button id="btn-close-settings-modal" class="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors" title="${t('set_close', this.lang)}">
                ${getIcon('x', 'w-5 h-5')}
              </button>
            </div>

            <!-- Settings Sections -->
            <div class="space-y-4">
              <!-- Section 1: Warna Tema (Theme Color) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-1.5">
                    ${getIcon('palette', 'w-4 h-4 text-cyan-400')}
                    <label class="text-xs font-bold text-slate-200">
                      ${t('set_theme_title', this.lang)}
                    </label>
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono">
                    ${t('set_theme_current', this.lang)} <span class="text-cyan-400 font-bold uppercase">${this.theme}</span>
                  </span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  ${themes.map(th => {
                    const isActive = this.theme === th.id;
                    return `
                      <button
                        type="button"
                        data-theme-id="${th.id}"
                        class="btn-select-theme p-2.5 rounded-md border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          isActive
                            ? `bg-slate-900/90 ${th.borderActive} shadow-lg ring-1 ring-white/10`
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                        }">
                        <div class="flex items-center justify-between">
                          <span class="w-3.5 h-3.5 rounded-full ${th.dotClass} shadow-md"></span>
                          ${isActive ? `<span class="text-emerald-400 font-mono text-[10px] font-bold flex items-center gap-0.5">${getIcon('check', 'w-3 h-3')} ${t('set_active', this.lang)}</span>` : ''}
                        </div>
                        <div>
                          <div class="text-xs font-bold text-white tracking-tight">${th.name}</div>
                          <div class="text-[10px] text-slate-400 truncate">${th.desc}</div>
                        </div>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <!-- Section 2: Bahasa (Language) -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-1.5">
                    ${getIcon('globe', 'w-4 h-4 text-amber-400')}
                    <label class="text-xs font-bold text-slate-200">
                      ${t('set_lang_title', this.lang)}
                    </label>
                  </div>
                  <span class="text-[10px] text-slate-400 font-mono">
                    ${isEn ? 'Current: English (EN)' : 'Aktif: Bahasa Indonesia (ID)'}
                  </span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    data-lang-id="id"
                    class="btn-select-lang p-2.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                      this.lang === 'id'
                        ? 'bg-slate-900/90 border-amber-500/80 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded bg-red-950/80 border border-red-700/60 text-red-400 font-mono text-xs font-bold flex items-center justify-center">ID</span>
                      <div>
                        <div class="text-xs font-bold text-white">Bahasa Indonesia</div>
                        <div class="text-[10px] text-slate-400">Bahasa Baku Nasional</div>
                      </div>
                    </div>
                    ${this.lang === 'id' ? `<span class="text-amber-400">${getIcon('check', 'w-4 h-4')}</span>` : ''}
                  </button>

                  <button
                    type="button"
                    data-lang-id="en"
                    class="btn-select-lang p-2.5 rounded-md border text-left transition-all cursor-pointer flex items-center justify-between ${
                      this.lang === 'en'
                        ? 'bg-slate-900/90 border-amber-500/80 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }">
                    <div class="flex items-center gap-2.5">
                      <span class="w-6 h-6 rounded bg-sky-950/80 border border-sky-700/60 text-sky-400 font-mono text-xs font-bold flex items-center justify-center">EN</span>
                      <div>
                        <div class="text-xs font-bold text-white">English (US)</div>
                        <div class="text-[10px] text-slate-400">Global Financial Standard</div>
                      </div>
                    </div>
                    ${this.lang === 'en' ? `<span class="text-amber-400">${getIcon('check', 'w-4 h-4')}</span>` : ''}
                  </button>
                </div>
              </div>

              <!-- Section 3: Reset / Mulai Dari Awal -->
              <div class="pt-2 border-t border-slate-800/80">
                <div class="p-3 rounded-md bg-rose-950/30 border border-rose-800/50 flex flex-col gap-2.5">
                  <div class="flex items-start gap-2.5">
                    <span class="p-1.5 rounded-md bg-rose-900/40 border border-rose-700/60 text-rose-400 shrink-0">
                      ${getIcon('alertTriangle', 'w-4 h-4')}
                    </span>
                    <div>
                      <div class="text-xs font-bold text-white">
                        ${t('set_reset_title', this.lang)}
                      </div>
                      <div class="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        ${t('set_reset_desc', this.lang)}
                      </div>
                    </div>
                  </div>

                  ${!this.isResetConfirmOpen ? `
                    <button
                      id="btn-prompt-reset"
                      class="h-9 bg-rose-600/90 hover:bg-rose-500 text-white font-bold text-xs rounded-md shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
                      ${getIcon('rotateCcw', 'w-3.5 h-3.5')}
                      <span>${t('set_reset_btn', this.lang)}</span>
                    </button>
                  ` : `
                    <div class="p-2.5 rounded-md bg-rose-950/80 border border-rose-500/80 flex flex-col gap-2 animate-in fade-in">
                      <div class="text-xs font-bold text-rose-200">
                        ${t('set_reset_confirm_q', this.lang)}
                      </div>
                      <div class="flex items-center gap-2">
                        <button
                          id="btn-confirm-reset-yes"
                          class="flex-1 h-8 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]">
                          ${getIcon('trash', 'w-3.5 h-3.5')}
                          <span>${t('set_reset_yes', this.lang)}</span>
                        </button>
                        <button
                          id="btn-confirm-reset-cancel"
                          class="px-3.5 h-8 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-md transition-all cursor-pointer">
                          ${t('set_reset_cancel', this.lang)}
                        </button>
                      </div>
                    </div>
                  `}
                </div>
              </div>
            </div>

            <!-- Footer indicator -->
            <div class="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60">
              <span class="flex items-center gap-1">
                ${getIcon('info', 'w-3.5 h-3.5 text-slate-400')}
                <span>${isEn ? 'Press ESC or S+T anytime to close' : 'Tekan ESC atau S+T untuk menutup'}</span>
              </span>
              <button id="btn-close-settings-bottom" class="px-3.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors">
                ${t('set_close', this.lang)}
              </button>
            </div>
          </div>
        </div>
      `;

      // Event Listeners for Theme selection
      modalsEl.querySelectorAll('.btn-select-theme').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const themeId = e.currentTarget.getAttribute('data-theme-id');
          if (themeId && themeId !== this.theme) {
            this.theme = themeId;
            document.body.setAttribute('data-theme', themeId);
            try {
              localStorage.setItem('corp_tycoon_theme', themeId);
            } catch (err) {}
            soundEngine.playKeyboardClick();
            if (this.officeEngine) {
              this.officeEngine.setThemeAndLang(this.theme, this.lang);
            }
            this.updateHeaderBar(true);
            this.renderActiveTab();
            renderSettings();
          }
        });
      });

      // Event Listeners for Language selection
      modalsEl.querySelectorAll('.btn-select-lang').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const langId = e.currentTarget.getAttribute('data-lang-id');
          if (langId && langId !== this.lang) {
            this.lang = langId;
            try {
              localStorage.setItem('corp_tycoon_lang', langId);
            } catch (err) {}
            soundEngine.playKeyboardClick();
            if (this.officeEngine) {
              this.officeEngine.setThemeAndLang(this.theme, this.lang);
            }
            this.updateHeaderBar(true);
            this.renderActiveTab();
            renderSettings();
          }
        });
      });

      // Close buttons
      document.getElementById('btn-close-settings-modal')?.addEventListener('click', () => {
        this.closeSettingsModal();
      });
      document.getElementById('btn-close-settings-bottom')?.addEventListener('click', () => {
        this.closeSettingsModal();
      });

      // Reset flow
      document.getElementById('btn-prompt-reset')?.addEventListener('click', () => {
        this.isResetConfirmOpen = true;
        soundEngine.playKeyboardClick();
        renderSettings();
      });

      document.getElementById('btn-confirm-reset-cancel')?.addEventListener('click', () => {
        this.isResetConfirmOpen = false;
        soundEngine.playKeyboardClick();
        renderSettings();
      });

      document.getElementById('btn-confirm-reset-yes')?.addEventListener('click', () => {
        this.resetGameFromScratch();
      });
    };

    renderSettings();
  }

  resetGameFromScratch() {
    try {
      localStorage.removeItem('corp_tycoon_profile');
      localStorage.removeItem('my_tycoon_header_collapsed');
    } catch (e) {}

    this.closeSettingsModal();

    // Re-initialize game state strictly with 100% Founder Equity
    this.initState();
    this.updateHeaderBar(true);
    this.renderActiveTab();

    // Open Start Screen Onboarding Modal for fresh customization
    this.openStartScreenModal(true);

    soundEngine.playCashChime();
  }

  // ==========================================
  // MODAL: START SCREEN & CUSTOM COMPANY ONBOARDING
  // ==========================================
  openStartScreenModal(isFirstTime = false) {
    const modalsEl = document.getElementById('tycoon-modals');
    if (!modalsEl) return;

    const s = this.state;
    let tempName = s.companyName || 'NEXUS DYNAMICS CORP';
    let tempTicker = (s.ticker || 'NXUS').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'NXUS';
    let tempSector = s.sector || 'Kecerdasan Buatan & Komputasi Neural';

    const sectorOptions = SECTOR_OPTIONS;
    const isEn = this.lang === 'en';

    const currentOpt = sectorOptions.find(o => o.id === tempSector) || sectorOptions[0];
    const currentLabel = isEn ? currentOpt.labelEn : currentOpt.labelId;

    const renderStartModal = () => {
      modalsEl.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md overflow-y-auto">
          <div class="bg-gradient-to-b from-[#0F1626] to-[#0A0E1A] border border-amber-500/50 rounded-xl max-w-xl w-full p-5 sm:p-6 flex flex-col gap-4 shadow-2xl shadow-black relative my-auto">
            <!-- Modal Header -->
            <div class="flex items-start justify-between pb-3 border-b border-slate-800">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-md bg-amber-950/80 border border-amber-700/70 text-amber-400 shrink-0 shadow-inner">
                  ${getIcon('building', 'w-5 h-5')}
                </div>
                <div>
                  <h2 class="text-base font-bold text-white tracking-tight">${t('start_title', this.lang)}</h2>
                  <p class="text-xs text-slate-400 mt-0.5">${t('start_sub', this.lang)}</p>
                </div>
              </div>
              ${!isFirstTime ? `
                <button id="btn-close-start-modal" class="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors" title="${t('set_close', this.lang)}">
                  ${getIcon('x', 'w-5 h-5')}
                </button>
              ` : ''}
            </div>

            <!-- Form Fields -->
            <div class="space-y-3.5">
              <!-- Field 1: Nama Perusahaan -->
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">
                  ${t('start_name_label', this.lang)}
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    ${getIcon('briefcase', 'w-4 h-4')}
                  </span>
                  <input
                    id="input-start-name"
                    type="text"
                    maxlength="36"
                    value="${tempName}"
                    placeholder="${t('start_name_placeholder', this.lang)}"
                    class="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-md text-xs font-bold text-white tracking-wide focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <!-- Field 2: Sektor Industri -->
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">
                  ${t('start_sector_label', this.lang)}
                </label>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-400">
                    ${getIcon('cpu', 'w-4 h-4')}
                  </span>
                  <select
                    id="select-start-sector"
                    class="w-full h-9 pl-9 pr-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-md text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer transition-colors font-sans">
                    ${sectorOptions.map(opt => `
                      <option value="${opt.id}" ${tempSector === opt.id ? 'selected' : ''}>
                        ${isEn ? opt.labelEn : opt.labelId}
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>

              <!-- Field 3: Kode Saham Ticker (Max 4 Karakter) -->
              <div>
                <div class="flex items-center justify-between mb-1">
                  <label class="text-xs font-semibold text-slate-300">
                    ${t('start_ticker_label', this.lang)}
                  </label>
                  <span class="text-[10px] text-amber-400 font-mono font-bold">${t('start_ticker_hint', this.lang)}</span>
                </div>
                <div class="relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400 font-mono font-bold">
                    #
                  </span>
                  <input
                    id="input-start-ticker"
                    type="text"
                    maxlength="4"
                    value="${tempTicker}"
                    placeholder="NXUS"
                    class="w-full h-10 pl-8 pr-3 bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-lg text-sm font-mono text-amber-400 font-bold uppercase tracking-widest focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <!-- Live Preview Card (High Visual Distinction) -->
              <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
                <span class="text-[10px] font-sans text-slate-400 uppercase tracking-wider block font-semibold">${t('start_preview_title', this.lang)}</span>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2 min-w-0">
                    <span id="preview-ticker-badge" class="px-2.5 py-1 rounded-md font-mono font-bold text-xs bg-slate-900 border border-slate-700 text-amber-400 shadow-inner shrink-0">
                      #1 · ${tempTicker || 'NXUS'}
                    </span>
                    <span id="preview-company-name" class="text-sm font-bold text-white truncate">
                      ${tempName || 'NEXUS DYNAMICS CORP'}
                    </span>
                  </div>
                  <span id="preview-sector-badge" class="text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${currentOpt.badge}">
                    ${currentLabel}
                  </span>
                </div>
                <!-- 100% Founder Equity Guarantee Badge -->
                <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <span class="text-slate-400 text-[11px] flex items-center gap-1">
                    ${getIcon('pieChart', 'w-3 h-3 text-emerald-400')}
                    ${t('start_equity_badge', this.lang)}
                  </span>
                  <span class="text-emerald-400 font-bold">${t('start_equity_text', this.lang)}</span>
                </div>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div class="flex items-center gap-3 pt-2">
              <button
                id="btn-confirm-start"
                class="flex-1 h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]">
                ${getIcon('rocket', 'w-4 h-4')}
                <span>${isFirstTime ? t('start_btn_launch', this.lang) : t('start_btn_save', this.lang)}</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Live update preview listeners
      const nameInput = document.getElementById('input-start-name');
      const tickerInput = document.getElementById('input-start-ticker');
      const sectorSelect = document.getElementById('select-start-sector');

      nameInput?.addEventListener('input', (e) => {
        tempName = e.target.value.trim() || 'NEXUS DYNAMICS CORP';
        const el = document.getElementById('preview-company-name');
        if (el) el.textContent = tempName;
      });

      tickerInput?.addEventListener('input', (e) => {
        const clean = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
        e.target.value = clean;
        tempTicker = clean || 'NXUS';
        const el = document.getElementById('preview-ticker-badge');
        if (el) el.textContent = `#1 · ${tempTicker}`;
      });

      sectorSelect?.addEventListener('change', (e) => {
        tempSector = e.target.value;
        const opt = sectorOptions.find(o => o.id === tempSector);
        const el = document.getElementById('preview-sector-badge');
        if (el && opt) {
          el.textContent = opt.label;
          el.className = `text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${opt.badge}`;
        }
      });

      document.getElementById('btn-close-start-modal')?.addEventListener('click', () => {
        modalsEl.innerHTML = '';
        this.isStartScreenOpen = false;
      });

      document.getElementById('btn-confirm-start')?.addEventListener('click', () => {
        const finalName = nameInput?.value.trim() || 'NEXUS DYNAMICS CORP';
        let finalTicker = tickerInput?.value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'NXUS';
        if (finalTicker.length < 2) finalTicker = 'NXUS';
        const finalSector = sectorSelect?.value || 'Kecerdasan Buatan & Komputasi Neural';

        this.state.companyName = finalName;
        this.state.ticker = finalTicker;
        this.state.sector = finalSector;
        this.selectedTicker = finalTicker;

        // Guaranteed 100% Founder Equity at initial startup
        this.state.equity = {
          totalShares: 10000000,
          founderShares: 10000000,
          investorShares: 0,
          esopShares: 0,
          publicShares: 0,
        };
        if (this.state.executives?.CEO) {
          this.state.executives.CEO.equityGrantedPct = 100.0;
        }

        // Procedurally generate 19 competitors guaranteeing no ticker clash with player
        this.state.competitorStocks = generateProceduralCompetitors(19, finalTicker);

        // Save customized profile
        try {
          localStorage.setItem('corp_tycoon_profile', JSON.stringify({
            companyName: finalName,
            ticker: finalTicker,
            sector: finalSector,
          }));
        } catch (e) {}

        soundEngine.playCashChime();
        modalsEl.innerHTML = '';
        this.isStartScreenOpen = false;

        this.updateHeaderBar(true);
        this.renderActiveTab();
      });
    };

    renderStartModal();
  }

  renderActiveTab() {
    const mainEl = document.getElementById('tycoon-main');
    if (!mainEl) return;

    if (this.officeEngine) {
      this.officeEngine.destroy();
      this.officeEngine = null;
    }
    if (this.stockChart) {
      this.stockChart.destroy();
      this.stockChart = null;
    }

    if (this.activeTab === 'hq') {
      this.renderHeadquartersTab(mainEl);
    } else if (this.activeTab === 'stocks') {
      this.renderStockMarketTab(mainEl);
    } else if (this.activeTab === 'companies') {
      this.renderCompaniesTab(mainEl);
    } else if (this.activeTab === 'equity') {
      this.renderEquityTab(mainEl);
    } else if (this.activeTab === 'csuite') {
      this.renderCSuiteTab(mainEl);
    } else if (this.activeTab === 'rnd') {
      this.renderRndTab(mainEl);
    }
  }

  // TAB 1: HEADQUARTERS & OFFICE CANVAS
  renderHeadquartersTab(mainEl) {
    mainEl.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        <!-- Left: 2D Interactive Office Canvas Floor Plan (7 cols) -->
        <div class="lg:col-span-7 bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col shadow-sm">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              ${getIcon('building', 'w-4 h-4 text-amber-400')}
              <span class="text-xs font-bold text-white uppercase tracking-wider">${t('hq_title', this.lang)}</span>
            </div>
            <span class="text-[11px] text-slate-400 font-mono">${t('hq_subtitle', this.lang)}</span>
          </div>

          <div class="relative w-full aspect-[640/550] bg-[#06090F] rounded-lg overflow-hidden border border-slate-800/60">
            <canvas id="office-canvas" class="w-full h-full block"></canvas>
          </div>

          <!-- Quick Interactive Worker Roster Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2.5 pt-2 border-t border-slate-800/60 text-xs">
            ${this.state.workers.map(w => `
              <button class="btn-inspect-worker flex items-center justify-between p-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer text-left" data-id="${w.id}">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="w-2 h-2 rounded-full ${w.morale > 75 ? 'bg-emerald-400' : 'bg-amber-400'} shrink-0"></span>
                  <span class="text-[11px] font-semibold text-slate-200 truncate">${w.name.split(' ')[0]}</span>
                </div>
                <span class="text-[10px] text-cyan-400 font-mono">${w.morale}%</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Right: Selected Room Directives & Corporate Slack Feed (5 cols) -->
        <div class="lg:col-span-5 flex flex-col gap-3.5">
          <!-- Room Action Directive Panel -->
          <div id="room-action-panel" class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 shadow-sm">
            <!-- Dynamically populated by updateRoomDirectivePanel -->
          </div>

          <!-- Real-Time Corporate Slack / Chat Feed -->
          <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col shadow-sm">
            <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 gap-2">
              <div class="flex items-center gap-1.5">
                ${getIcon('messageSquare', 'w-4 h-4 text-cyan-400')}
                <span class="text-xs font-bold text-white uppercase tracking-wider truncate">${t('hq_feed_title', this.lang)}</span>
              </div>
              <!-- Streamlined Icon-Buttons for Chat Filters -->
              <div class="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                <button class="chat-filter-btn p-1.5 rounded transition-colors ${this.chatFilter === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}" data-filter="all" title="All Messages">
                  ${getIcon('layers', 'w-3.5 h-3.5')}
                </button>
                <button class="chat-filter-btn p-1.5 rounded transition-colors ${this.chatFilter === 'tech' ? 'bg-slate-800 text-cyan-400 shadow-sm' : 'text-slate-400 hover:text-cyan-400'}" data-filter="tech" title="Engineering">
                  ${getIcon('code', 'w-3.5 h-3.5')}
                </button>
                <button class="chat-filter-btn p-1.5 rounded transition-colors ${this.chatFilter === 'finance' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-emerald-400'}" data-filter="finance" title="Treasury">
                  ${getIcon('coins', 'w-3.5 h-3.5')}
                </button>
                <button class="chat-filter-btn p-1.5 rounded transition-colors ${this.chatFilter === 'market' ? 'bg-slate-800 text-amber-400 shadow-sm' : 'text-slate-400 hover:text-amber-400'}" data-filter="market" title="Market Wire">
                  ${getIcon('trendingUp', 'w-3.5 h-3.5')}
                </button>
              </div>
            </div>

            <!-- Messages Scroll Box -->
            <div id="chat-messages-container" class="h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              <!-- Rendered by updateChatDOM -->
            </div>

            <!-- Chat Input Memo Form -->
            <form id="chat-input-form" class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
              <input
                id="chat-input-text"
                type="text"
                placeholder="${t('hq_memo_placeholder', this.lang)}"
                class="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button type="submit" class="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors cursor-pointer" title="${t('hq_memo_send', this.lang)}">
                ${getIcon('send', 'w-3.5 h-3.5')}
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    // Init Office Canvas Engine with room & worker clicks
    const canvas = document.getElementById('office-canvas');
    if (canvas) {
      this.officeEngine = new OfficeCanvasEngine(
        canvas,
        this.state.workers,
        (roomId) => {
          this.selectedRoomId = roomId;
          soundEngine.playKeyboardClick();
          this.updateRoomDirectivePanel();
        },
        (worker) => {
          soundEngine.playKeyboardClick();
          this.openWorkerModal(worker);
        },
        { theme: this.theme, lang: this.lang }
      );
    }

    this.updateRoomDirectivePanel();
    this.updateChatDOM();

    // Attach chat form
    const chatForm = document.getElementById('chat-input-form');
    chatForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('chat-input-text');
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();
      input.value = '';

      soundEngine.playKeyboardClick();
      this.addChatMessage({
        sender: 'Anda (Chief Architect)',
        role: 'CEO Memo',
        icon: 'crown',
        text,
        tag: 'general',
      });

      // Autonomous response after 700ms
      setTimeout(() => {
        const worker = this.state.workers[Math.floor(Math.random() * this.state.workers.length)];
        const replies = [
          'Instruksi dipahami! Tim segera menyelaraskan prioritas sprint.',
          'Siap, koordinasi antar divisi sedang kami laksanakan.',
          'Catatan dewan direksi diterima dan masuk eksekusi utama.',
        ];
        this.addChatMessage({
          sender: worker.name,
          role: worker.role,
          icon: worker.icon,
          text: replies[Math.floor(Math.random() * replies.length)],
          tag: worker.department === 'engineering' ? 'tech' : 'general',
        });
      }, 700);
    });

    // Chat filter icon buttons
    mainEl.querySelectorAll('.chat-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.chatFilter = e.currentTarget.getAttribute('data-filter');
        mainEl.querySelectorAll('.chat-filter-btn').forEach(b => {
          b.className = `chat-filter-btn p-1.5 rounded transition-colors ${b.getAttribute('data-filter') === this.chatFilter ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`;
        });
        this.updateChatDOM();
      });
    });

    // Inspect worker roster buttons
    mainEl.querySelectorAll('.btn-inspect-worker').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const worker = this.state.workers.find(w => w.id === id);
        if (worker) this.openWorkerModal(worker);
      });
    });
  }

  // Interactive AI Worker Dossier Modal
  openWorkerModal(worker) {
    const modalsEl = document.getElementById('tycoon-modals');
    if (!modalsEl) return;

    modalsEl.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#0B101D] border border-slate-700 rounded-2xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl">
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-2.5">
              <div class="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
                ${getIcon(worker.icon, 'w-5 h-5')}
              </div>
              <div>
                <h3 class="text-sm font-bold text-white">${worker.name}</h3>
                <span class="text-xs text-slate-400 font-mono">${worker.role} · ${worker.department.toUpperCase()}</span>
              </div>
            </div>
            <button id="btn-close-worker-modal" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <!-- Live AI Status -->
          <div class="space-y-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs font-mono">
            <div class="flex justify-between">
              <span class="text-slate-400">Aktivitas Terkini:</span>
              <span class="text-emerald-400 font-bold">${worker.state.toUpperCase()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-400">Tugas Fokus:</span>
              <span class="text-slate-200">${worker.focusTask || 'Pengembangan Sistem'}</span>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-slate-800">
              <span class="text-slate-400">Moral & Kebugaran:</span>
              <span class="font-bold text-amber-400">${worker.morale}%</span>
            </div>
            <div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div class="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all" style="width: ${worker.morale}%"></div>
            </div>
          </div>

          <!-- Worker Directive Actions -->
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button id="btn-boost-coffee" class="flex items-center justify-center gap-2 p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 text-xs font-semibold rounded-lg transition-colors cursor-pointer" title="Berikan bonus kopi dan pujian (Biaya $200 Kas)">
              ${getIcon('coffee', 'w-4 h-4')}
              <span>Traktir Kopi (+15 Moral)</span>
            </button>
            <button id="btn-assign-sprint" class="flex items-center justify-center gap-2 p-2 bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-800/60 text-cyan-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer" title="Tugaskan sprint prioritas tinggi">
              ${getIcon('target', 'w-4 h-4')}
              <span>Prioritas Sprint (+10 Tech)</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-worker-modal')?.addEventListener('click', () => {
      modalsEl.innerHTML = '';
    });

    document.getElementById('btn-boost-coffee')?.addEventListener('click', () => {
      if (this.state.cash < 200) return;
      this.state.cash -= 200;
      worker.morale = Math.min(100, worker.morale + 15);
      worker.speechBubble = 'Terima kasih atas apresiasinya, Pak!';
      worker.speechTimer = 4.0;
      soundEngine.playKeyboardClick();
      this.addChatMessage({
        sender: worker.name,
        role: worker.role,
        icon: worker.icon,
        text: 'Apresiasi kopi diterima dengan antusias! Semangat kerja meningkat prima.',
        tag: 'general',
      });
      modalsEl.innerHTML = '';
      this.updateHeaderBar();
      this.renderHeadquartersTab(document.getElementById('tycoon-main'));
    });

    document.getElementById('btn-assign-sprint')?.addEventListener('click', () => {
      this.state.techPoints += 10;
      worker.speechBubble = 'Sprint prioritas dimulai!';
      worker.speechTimer = 4.0;
      soundEngine.playCashChime();
      this.addChatMessage({
        sender: worker.name,
        role: worker.role,
        icon: worker.icon,
        text: 'Sprint prioritas tinggi selesai dieksekusi! Menghasilkan +10 Tech Points tambahan.',
        tag: 'tech',
      });
      modalsEl.innerHTML = '';
      this.updateHeaderBar();
      this.renderHeadquartersTab(document.getElementById('tycoon-main'));
    });
  }

  updateRoomDirectivePanel() {
    const panel = document.getElementById('room-action-panel');
    if (!panel) return;

    const roomId = this.selectedRoomId;
    const roomDefs = {
      ceo_suite: {
        title: 'CEO Executive Suite',
        dept: 'DEWAN EKSEKUTIF',
        icon: 'crown',
        color: 'text-amber-400',
        desc: 'Pusat komando strategis dewan eksekutif dan persetujuan kebijakan korporat.',
        actions: [
          {
            id: 'vision_speech',
            title: 'Pidato Visi Korporat & Reputasi',
            cost: '$5,000 Kas',
            effect: '+8 Reputasi & +5% Pendapatan Bulanan',
            icon: 'megaphone',
            handler: () => {
              if (this.state.cash < 5000) return;
              this.state.cash -= 5000;
              this.state.reputation = Math.min(100, this.state.reputation + 8);
              this.state.monthlyRevenue = Math.round(this.state.monthlyRevenue * 1.05);
              soundEngine.playCashChime();
              this.addChatMessage({
                sender: 'Kantor CEO',
                role: 'Executive Directives',
                icon: 'crown',
                text: 'Pidato visi korporat disiarkan langsung ke pemangku kepentingan! Kepercayaan publik dan investor meningkat.',
                tag: 'general',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
          {
            id: 'executive_review',
            title: 'Audit Kinerja Strategis Dewan Direksi',
            cost: '10 Tech Points',
            effect: '+10 Moral Staf & Penghematan 4% Beban',
            icon: 'shieldCheck',
            handler: () => {
              if (this.state.techPoints < 10) return;
              this.state.techPoints -= 10;
              this.state.monthlyExpenses = Math.max(5000, Math.round(this.state.monthlyExpenses * 0.96));
              soundEngine.playKeyboardClick();
              this.addChatMessage({
                sender: 'Komite Audit CEO',
                role: 'Executive Directives',
                icon: 'crown',
                text: 'Audit operasional selesai! Beban inefisiensi berhasil ditekan 4%.',
                tag: 'finance',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
        ],
      },
      eng_lab: {
        title: 'R&D & Server Cluster',
        dept: 'REKAYASA SISTEM',
        icon: 'code',
        color: 'text-cyan-400',
        desc: 'Gudang server berpendingin cair dan workstation arsitek perangkat lunak.',
        actions: [
          {
            id: 'code_sprint',
            title: 'Extreme DevOps & Architecture Sprint',
            cost: '$8,000 Kas',
            effect: '+25 Tech Points Langsung & Efisiensi Cloud',
            icon: 'zap',
            handler: () => {
              if (this.state.cash < 8000) return;
              this.state.cash -= 8000;
              this.state.techPoints += 25;
              soundEngine.playCashChime();
              this.addChatMessage({
                sender: 'Budi Santoso',
                role: 'Staff Architect',
                icon: 'code',
                text: 'Sprint arsitektur sukses! 25 Tech Points berhasil diproduksi untuk riset selanjutnya.',
                tag: 'tech',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
          {
            id: 'server_optimize',
            title: 'Overhaul Cluster Server & Toleransi Bencana',
            cost: '15 Tech Points',
            effect: 'Turunkan Risiko Downtime & -8% Biaya Hosting',
            icon: 'rotateCw',
            handler: () => {
              if (this.state.techPoints < 15) return;
              this.state.techPoints -= 15;
              this.state.monthlyExpenses = Math.max(5000, Math.round(this.state.monthlyExpenses * 0.92));
              soundEngine.playKeyboardClick();
              this.addChatMessage({
                sender: 'Tim Server R&D',
                role: 'Infrastructure',
                icon: 'code',
                text: 'Kluster server berhasil dioverhaul! Biaya hosting server berkurang 8%.',
                tag: 'tech',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
        ],
      },
      trading_floor: {
        title: 'Trading & Quant Floor',
        dept: 'TREASURY & PASAR MODAL',
        icon: 'coins',
        color: 'text-emerald-400',
        desc: 'Terminal Bloomberg kuantitatif dan analisis portofolio pasar modal.',
        actions: [
          {
            id: 'treasury_arbitrage',
            title: 'Eksekusi Arbitrase Treasury Korporat',
            cost: '$15,000 Kas',
            effect: 'Peluang Imbal Hasil 8%-25% Kas Seketika',
            icon: 'trendingUp',
            handler: () => {
              if (this.state.cash < 15000) return;
              const yieldPct = 0.08 + Math.random() * 0.17;
              const profit = Math.round(15000 * yieldPct);
              this.state.cash += profit;
              soundEngine.playCashChime();
              this.addChatMessage({
                sender: 'Jessica Tan',
                role: 'Quant Treasury',
                icon: 'coins',
                text: `Arbitrase instrumen pasar uang menghasilkan keuntungan kas likuid ${formatCurrency(profit)}!`,
                tag: 'finance',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
          {
            id: 'hedge_risk',
            title: 'Lindung Nilai Portofolio (Hedging)',
            cost: '$6,000 Kas',
            effect: 'Proteksi Risiko Koreksi Saham Selama 3 Bulan',
            icon: 'shield',
            handler: () => {
              if (this.state.cash < 6000) return;
              this.state.cash -= 6000;
              this.state.reputation = Math.min(100, this.state.reputation + 4);
              soundEngine.playKeyboardClick();
              this.addChatMessage({
                sender: 'Jessica Tan',
                role: 'Risk Management',
                icon: 'coins',
                text: 'Posisi derivatif lindung nilai berhasil dipasang untuk mengamankan valuasi neraca.',
                tag: 'finance',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
        ],
      },
      boardroom: {
        title: 'Boardroom & Governance',
        dept: 'TATA KELOLA KORPORAT',
        icon: 'briefcase',
        color: 'text-purple-400',
        desc: 'Meja bundar pemegang saham untuk negosiasi term sheet dan putaran pendanaan.',
        actions: [
          {
            id: 'shareholder_meeting',
            title: 'Rapat Umum Pemegang Saham (RUPS)',
            cost: '$4,000 Kas',
            effect: '+12 Reputasi & Menarik Minat Investor Baru',
            icon: 'users',
            handler: () => {
              if (this.state.cash < 4000) return;
              this.state.cash -= 4000;
              this.state.reputation = Math.min(100, this.state.reputation + 12);
              soundEngine.playGavel();
              this.addChatMessage({
                sender: 'Sekretariat RUPS',
                role: 'Governance',
                icon: 'briefcase',
                text: 'Ketok palu RUPS! Seluruh agenda disetujui bulat oleh pemegang saham.',
                tag: 'finance',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
        ],
      },
      breakroom: {
        title: 'Espresso Bar & Lounge',
        dept: 'KESEJAHTERAAN KARYAWAN',
        icon: 'coffee',
        color: 'text-slate-300',
        desc: 'Bar kopi premium untuk memulihkan stamina dan moral seluruh karyawan korporat.',
        actions: [
          {
            id: 'barista_sponsor',
            title: 'Sponsor Spesialiti Espresso Gratis',
            cost: '$1,500 Kas',
            effect: '+25 Moral Seluruh Staf & Produktivitas Naik',
            icon: 'heart',
            handler: () => {
              if (this.state.cash < 1500) return;
              this.state.cash -= 1500;
              for (const w of this.state.workers) {
                w.morale = Math.min(100, w.morale + 25);
                w.speechBubble = 'Kopi spesialiti terbaik!';
                w.speechTimer = 4.0;
              }
              soundEngine.playKeyboardClick();
              this.addChatMessage({
                sender: 'Espresso Barista Bot',
                role: 'Office Vibes',
                icon: 'coffee',
                text: 'Espresso hangat dibagikan ke seluruh meja kerja! Moral tim melonjak tinggi.',
                tag: 'general',
              });
              this.updateHeaderBar();
              this.updateRoomDirectivePanel();
            },
          },
        ],
      },
    };

    const room = roomDefs[roomId] || roomDefs.ceo_suite;

    panel.innerHTML = `
      <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
        <div class="flex items-center gap-2">
          ${getIcon(room.icon, `w-4 h-4 ${room.color}`)}
          <div>
            <h3 class="text-xs font-bold text-white">${room.title}</h3>
            <span class="text-[10px] text-slate-400 font-mono tracking-wider">${room.dept}</span>
          </div>
        </div>
      </div>
      <p class="text-[11px] text-slate-400 mb-2 leading-relaxed">${room.desc}</p>
      <div class="space-y-1.5">
        ${room.actions.map((act, idx) => `
          <button class="room-action-btn w-full flex items-center justify-between p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg transition-colors cursor-pointer text-left group" data-index="${idx}">
            <div class="flex items-center gap-2">
              <div class="p-1 rounded bg-slate-800 text-slate-300 group-hover:text-cyan-400 transition-colors">
                ${getIcon(act.icon || 'zap', 'w-3.5 h-3.5')}
              </div>
              <div>
                <div class="text-xs font-semibold text-white">${act.title}</div>
                <div class="text-[10px] text-emerald-400 font-mono">${act.effect}</div>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[11px] font-bold text-amber-400 font-mono">${act.cost}</span>
            </div>
          </button>
        `).join('')}
      </div>
    `;

    panel.querySelectorAll('.room-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        const act = room.actions[idx];
        if (act && act.handler) act.handler();
      });
    });
  }

  updateChatDOM() {
    const container = document.getElementById('chat-messages-container');
    if (!container) return;

    const filtered = this.state.chatMessages.filter(m => {
      if (this.chatFilter === 'all') return true;
      return m.tag === this.chatFilter;
    });

    container.innerHTML = filtered.map(m => {
      return `
        <div class="flex items-start gap-2 text-xs bg-slate-900/60 p-2 rounded-lg border border-slate-800/50">
          <div class="p-1 rounded bg-slate-800 shrink-0 text-slate-300">
            ${getIcon(m.icon || 'user', 'w-3.5 h-3.5')}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="font-bold text-slate-200 truncate">${m.sender}</span>
              <span class="text-[10px] text-slate-500 font-mono">${m.role}</span>
              <span class="text-[10px] text-slate-600 font-mono ml-auto">${m.timestamp}</span>
            </div>
            <p class="text-slate-300 text-xs leading-relaxed break-words">${m.text}</p>
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  }

  // TAB 2: STOCK MARKET & HOSTILE TAKEOVER TERMINAL
  renderStockMarketTab(mainEl) {
    renderStockMarketView(this, mainEl);
  }

  // ==========================================
  // TAB: COMPANIES DIRECTORY & AI-NPC CEO DOSSIER (MAX 20 ACTIVE)
  // ==========================================

  /**
   * Returns the definitive list of 20 active global corporations.
   * Player's flagship enterprise (NXUS) + 19 AI-NPC competitor corporations.
   * @returns {Array<Object>}
   */
  getAllCompanies() {
    const s = this.state;
    const playerPriceChange = s.sharePriceHistory.length > 1
      ? Math.round(((s.sharePrice - s.sharePriceHistory[0].open) / s.sharePriceHistory[0].open) * 1000) / 10
      : 2.5;

    const playerCompany = {
      symbol: s.ticker,
      name: s.companyName,
      sector: 'Enterprise Software & Konglomerasi',
      headquarters: 'Silicon Valley / Jakarta Tower',
      price: s.sharePrice,
      changePct: playerPriceChange,
      totalShares: s.equity.totalShares,
      playerOwnedShares: s.equity.founderShares,
      history: s.sharePriceHistory,
      marketCap: s.valuation,
      peRatio: 22.4,
      dividendYieldPct: s.isIpoCompleted ? 1.8 : 0.0,
      monthlyRevenue: s.monthlyRevenue,
      monthlyExpenses: s.monthlyExpenses,
      techLevel: s.techLevel,
      isCompetitor: false,
      isAcquiredByPlayer: true,
      aiStrategy: 'Player Sovereign Leadership',
      ceo: {
        name: s.executives.CEO?.name || 'Anda (Founder & Chief Architect)',
        title: s.executives.CEO?.role || 'CEO & Sovereign Founder',
        icon: 'crown',
        trait: s.executives.CEO?.trait || 'Charismatic Visionary',
        leadership: s.executives.CEO?.leadership || 92,
        specialty: s.executives.CEO?.specialty || 94,
        rivalryStance: 'Flagship Sovereign (Perusahaan Anda)',
        visionQuote: 'Membangun ekosistem konglomerasi teknologi terdepan dengan kedaulatan modal dan kepemimpinan strategis.',
      },
      description: 'Konglomerasi teknologi dan korporasi terintegrasi yang Anda rintis dan pimpin menuju supremasi industri global.',
      recentCorporateMove: 'Mengekspansi operasi bisnis multi-sektor dan mengoptimalkan neraca keuangan pasar modal.',
    };

    // Exactly 20 companies: player's flagship + 19 competitor corporations
    const list = [playerCompany, ...s.competitorStocks];

    // Compute dynamic rank by market cap (1..20)
    const sortedByCap = [...list].sort((a, b) => b.marketCap - a.marketCap);
    const rankMap = new Map();
    sortedByCap.forEach((c, idx) => {
      rankMap.set(c.symbol, idx + 1);
    });

    return list.map(c => {
      const isPlayer = c.symbol === s.ticker;
      const isAllied = (s.alliances || []).includes(c.symbol);
      const playerOwned = isPlayer ? s.equity.founderShares : c.playerOwnedShares;
      const ownershipPct = c.totalShares > 0 ? Math.round((playerOwned / c.totalShares) * 10000) / 100 : 0;
      return {
        ...c,
        rank: rankMap.get(c.symbol) || 1,
        isAllied,
        ownershipPct,
        playerOwned,
      };
    });
  }

  // RENDER TAB: COMPANIES
  renderCompaniesTab(mainEl) {
    const s = this.state;
    const allCompanies = this.getAllCompanies();

    // Summary Statistics
    const totalMarketCap = allCompanies.reduce((acc, c) => acc + c.marketCap, 0);
    const totalPortfolioValue = allCompanies.reduce((acc, c) => {
      return acc + (c.playerOwned * c.price);
    }, 0);
    const activeAlliancesCount = (s.alliances || []).length;

    // Filter Logic
    let filtered = [...allCompanies];

    // Sector Filter
    if (this.companySectorFilter !== 'all') {
      const f = this.companySectorFilter.toLowerCase();
      filtered = filtered.filter(c => {
        const sec = c.sector.toLowerCase();
        if (f === 'ai') return sec.includes('kecerdasan') || sec.includes('komputasi') || sec.includes('neural');
        if (f === 'cloud') return sec.includes('cloud') || sec.includes('keamanan') || sec.includes('siber');
        if (f === 'manufaktur') return sec.includes('manufaktur') || sec.includes('energi') || sec.includes('mineral');
        if (f === 'biotek') return sec.includes('bioteknologi') || sec.includes('genomik') || sec.includes('medis');
        if (f === 'robotika') return sec.includes('robotika') || sec.includes('otomasi');
        if (f === 'semikonduktor') return sec.includes('semikonduktor') || sec.includes('fotonik') || sec.includes('chip');
        if (f === 'dirgantara') return sec.includes('dirgantara') || sec.includes('satelit') || sec.includes('antariksa');
        if (f === 'finansial') return sec.includes('finansial') || sec.includes('fintech') || sec.includes('likuiditas');
        if (f === 'logistik') return sec.includes('logistik') || sec.includes('ritel') || sec.includes('rantai pasok');
        if (f === 'imersif') return sec.includes('realitas') || sec.includes('vr') || sec.includes('game');
        return sec.includes(f);
      });
    }

    // Search Query Filter
    if (this.companySearchQuery.trim()) {
      const q = this.companySearchQuery.toLowerCase().trim();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q) ||
        (c.headquarters && c.headquarters.toLowerCase().includes(q)) ||
        (c.ceo?.name && c.ceo.name.toLowerCase().includes(q)) ||
        c.sector.toLowerCase().includes(q) ||
        (c.ceo?.trait && c.ceo.trait.toLowerCase().includes(q))
      );
    }

    // Sorting Logic
    filtered.sort((a, b) => {
      if (this.companySortBy === 'marketCap') return b.marketCap - a.marketCap;
      if (this.companySortBy === 'price') return b.price - a.price;
      if (this.companySortBy === 'changePct') return b.changePct - a.changePct;
      if (this.companySortBy === 'playerStake') return b.ownershipPct - a.ownershipPct;
      if (this.companySortBy === 'techLevel') return b.techLevel - a.techLevel;
      return a.rank - b.rank;
    });

    const sectorFilters = [
      { id: 'all', label: 'Semua (20)' },
      { id: 'ai', label: 'AI & Neural' },
      { id: 'cloud', label: 'Cloud & Siber' },
      { id: 'semikonduktor', label: 'Semikonduktor' },
      { id: 'robotika', label: 'Robotika' },
      { id: 'biotek', label: 'Bioteknologi' },
      { id: 'dirgantara', label: 'Dirgantara' },
      { id: 'manufaktur', label: 'Manufaktur & Energi' },
      { id: 'finansial', label: 'Finansial & Fintech' },
      { id: 'logistik', label: 'Logistik & Ritel' },
      { id: 'imersif', label: 'Realitas Imersif' },
    ];

    const getSectorStyle = (sectorStr) => {
      const sec = (sectorStr || '').toLowerCase();
      if (sec.includes('kecerdasan') || sec.includes('komputasi') || sec.includes('neural')) {
        return { label: 'AI & Neural', badgeCls: 'bg-indigo-950/80 border-indigo-700/80 text-indigo-300' };
      }
      if (sec.includes('cloud') || sec.includes('siber')) {
        return { label: 'Cloud & Siber', badgeCls: 'bg-cyan-950/80 border-cyan-700/80 text-cyan-300' };
      }
      if (sec.includes('manufaktur') || sec.includes('energi')) {
        return { label: 'Manufaktur & Energi', badgeCls: 'bg-blue-950/80 border-blue-700/80 text-blue-300' };
      }
      if (sec.includes('biotek') || sec.includes('genomik')) {
        return { label: 'Bioteknologi', badgeCls: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300' };
      }
      if (sec.includes('robotika')) {
        return { label: 'Robotika & Otomasi', badgeCls: 'bg-teal-950/80 border-teal-700/80 text-teal-300' };
      }
      if (sec.includes('semikonduktor') || sec.includes('fotonik')) {
        return { label: 'Semikonduktor', badgeCls: 'bg-sky-950/80 border-sky-700/80 text-sky-300' };
      }
      if (sec.includes('dirgantara') || sec.includes('satelit')) {
        return { label: 'Dirgantara Orbit', badgeCls: 'bg-purple-950/80 border-purple-700/80 text-purple-300' };
      }
      if (sec.includes('finansial') || sec.includes('likuiditas')) {
        return { label: 'Finansial & Fintech', badgeCls: 'bg-amber-950/80 border-amber-700/80 text-amber-300' };
      }
      if (sec.includes('logistik') || sec.includes('ritel')) {
        return { label: 'Logistik & Ritel', badgeCls: 'bg-orange-950/80 border-orange-700/80 text-orange-300' };
      }
      if (sec.includes('realitas') || sec.includes('imersif')) {
        return { label: 'Realitas Imersif', badgeCls: 'bg-fuchsia-950/80 border-fuchsia-700/80 text-fuchsia-300' };
      }
      return { label: 'Konglomerasi Multi', badgeCls: 'bg-emerald-950/80 border-emerald-700/80 text-emerald-300' };
    };

    const getCompanyCardTheme = (c, isPlayer) => {
      if (isPlayer) {
        return {
          cardBg: 'bg-gradient-to-b from-[#0a2318] via-[#071710] to-[#040e0a]',
          borderCls: 'border-emerald-500/80 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-950/40',
          ceoBg: 'bg-[#030d08]/90 border-emerald-900/50',
          ceoBar: 'bg-emerald-400',
        };
      }
      if (c.isAllied) {
        return {
          cardBg: 'bg-gradient-to-b from-[#092230] via-[#051620] to-[#030e15]',
          borderCls: 'border-cyan-500/70 ring-1 ring-cyan-500/30 shadow-lg shadow-cyan-950/40',
          ceoBg: 'bg-[#030e15]/90 border-cyan-900/50',
          ceoBar: 'bg-cyan-400',
        };
      }
      const sec = (c.sector || '').toLowerCase();
      if (sec.includes('kecerdasan') || sec.includes('neural')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#131535] via-[#0c0d23] to-[#070715]',
          borderCls: 'border-indigo-500/40 hover:border-indigo-400/80 shadow-md',
          ceoBg: 'bg-[#070715]/90 border-indigo-900/50',
          ceoBar: 'bg-indigo-400',
        };
      }
      if (sec.includes('robotika')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#0a2529] via-[#06181b] to-[#030f11]',
          borderCls: 'border-teal-500/40 hover:border-teal-400/80 shadow-md',
          ceoBg: 'bg-[#030f11]/90 border-teal-900/50',
          ceoBar: 'bg-teal-400',
        };
      }
      if (sec.includes('biotek')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#0a2419] via-[#061810] to-[#030f0a]',
          borderCls: 'border-emerald-500/40 hover:border-emerald-400/80 shadow-md',
          ceoBg: 'bg-[#030f0a]/90 border-emerald-900/50',
          ceoBar: 'bg-emerald-400',
        };
      }
      if (sec.includes('dirgantara')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#1c1335] via-[#120b22] to-[#0a0614]',
          borderCls: 'border-purple-500/40 hover:border-purple-400/80 shadow-md',
          ceoBg: 'bg-[#0a0614]/90 border-purple-900/50',
          ceoBar: 'bg-purple-400',
        };
      }
      if (sec.includes('semikonduktor') || sec.includes('fotonik')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#0a1f36] via-[#061423] to-[#030d17]',
          borderCls: 'border-sky-500/40 hover:border-sky-400/80 shadow-md',
          ceoBg: 'bg-[#030d17]/90 border-sky-900/50',
          ceoBar: 'bg-sky-400',
        };
      }
      if (sec.includes('finansial')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#251c09] via-[#181205] to-[#0d0902]',
          borderCls: 'border-amber-500/40 hover:border-amber-400/80 shadow-md',
          ceoBg: 'bg-[#0d0902]/90 border-amber-900/50',
          ceoBar: 'bg-amber-400',
        };
      }
      if (sec.includes('manufaktur')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#101c30] via-[#0a1220] to-[#060b14]',
          borderCls: 'border-blue-500/40 hover:border-blue-400/80 shadow-md',
          ceoBg: 'bg-[#060b14]/90 border-blue-900/50',
          ceoBar: 'bg-blue-400',
        };
      }
      if (sec.includes('logistik')) {
        return {
          cardBg: 'bg-gradient-to-b from-[#24160a] via-[#160d05] to-[#0d0702]',
          borderCls: 'border-orange-500/40 hover:border-orange-400/80 shadow-md',
          ceoBg: 'bg-[#0d0702]/90 border-orange-900/50',
          ceoBar: 'bg-orange-400',
        };
      }
      return {
        cardBg: 'bg-gradient-to-b from-[#111a2d] via-[#0b101d] to-[#060912]',
        borderCls: 'border-slate-700/80 hover:border-amber-400/70 shadow-md',
        ceoBg: 'bg-[#060912]/90 border-slate-800',
        ceoBar: 'bg-amber-400',
      };
    };

    mainEl.innerHTML = `
      <div class="flex flex-col gap-3.5">
        <!-- Top Executive KPI Summary Strip (Disciplined Modern Geometry) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Total Enterprises -->
          <div class="bg-gradient-to-br from-[#0c2038] via-[#081525] to-[#050e18] border border-cyan-500/40 rounded-lg p-3.5 flex items-center justify-between shadow-md relative overflow-hidden group hover:border-cyan-400/70 transition-all">
            <div>
              <span class="text-[10px] text-cyan-400/90 font-sans uppercase tracking-wider font-semibold block">Entitas Global Aktif</span>
              <div class="text-xl font-bold font-mono text-white mt-1 tracking-tight">20 Perusahaan</div>
              <span class="text-xs text-cyan-300 font-sans mt-0.5 block flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                1 Flagship + 19 AI-NPC CEOs
              </span>
            </div>
            <div class="p-2.5 rounded-md bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              ${getIcon('globe', 'w-5 h-5')}
            </div>
          </div>

          <!-- Total Global Market Cap -->
          <div class="bg-gradient-to-br from-[#2c1d06] via-[#1a1104] to-[#100a02] border border-amber-500/40 rounded-lg p-3.5 flex items-center justify-between shadow-md relative overflow-hidden group hover:border-amber-400/70 transition-all">
            <div>
              <span class="text-[10px] text-amber-400/90 font-sans uppercase tracking-wider font-semibold block">Total Kapitalisasi Pasar</span>
              <div id="companies-kpi-total-market-cap" class="text-xl font-bold font-mono text-amber-400 mt-1 tracking-tight">${formatCurrency(totalMarketCap, true)}</div>
              <span class="text-xs text-slate-300 font-sans mt-0.5 block flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Likuiditas Bursa Efek Dunia
              </span>
            </div>
            <div class="p-2.5 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              ${getIcon('trendingUp', 'w-5 h-5')}
            </div>
          </div>

          <!-- Player Portfolio Holding Value -->
          <div class="bg-gradient-to-br from-[#072618] via-[#05180f] to-[#030e09] border border-emerald-500/40 rounded-lg p-3.5 flex items-center justify-between shadow-md relative overflow-hidden group hover:border-emerald-400/70 transition-all">
            <div>
              <span class="text-[10px] text-emerald-400/90 font-sans uppercase tracking-wider font-semibold block">Portofolio Ekuitas Anda</span>
              <div id="companies-kpi-portfolio-val" class="text-xl font-bold font-mono text-emerald-400 mt-1 tracking-tight">${formatCurrency(totalPortfolioValue, true)}</div>
              <span class="text-xs text-slate-300 font-sans mt-0.5 block flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Flagship + Saham Kompetitor
              </span>
            </div>
            <div class="p-2.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              ${getIcon('pieChart', 'w-5 h-5')}
            </div>
          </div>

          <!-- Active B2B Alliances -->
          <div class="bg-gradient-to-br from-[#1c123d] via-[#110a26] to-[#0a0618] border border-indigo-500/40 rounded-lg p-3.5 flex items-center justify-between shadow-md relative overflow-hidden group hover:border-indigo-400/70 transition-all">
            <div>
              <span class="text-[10px] text-indigo-400/90 font-sans uppercase tracking-wider font-semibold block">Aliansi Bisnis B2B Aktif</span>
              <div id="companies-kpi-alliances" class="text-xl font-bold font-mono text-indigo-300 mt-1 tracking-tight">${activeAlliancesCount} Perusahaan Mitra</div>
              <span id="companies-kpi-alliances-cashflow" class="text-xs text-slate-300 font-sans mt-0.5 block flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                +${formatCurrency(activeAlliancesCount * 3000)}/bln Arus Sinergi
              </span>
            </div>
            <div class="p-2.5 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 shrink-0 shadow-inner group-hover:scale-105 transition-transform">
              ${getIcon('handshake', 'w-5 h-5')}
            </div>
          </div>
        </div>

        <!-- Filter & Search Command Deck (Comfortable, Modern, Zero Pill Bloat) -->
        <div class="bg-gradient-to-b from-[#0d1526] to-[#080d18] border border-slate-700/70 rounded-lg p-3 flex flex-col gap-2.5 shadow-md">
          <!-- Top Row: Search Input + Live Counter + Sort Select -->
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            <!-- Search Input -->
            <div class="relative flex-1 max-w-lg">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                ${getIcon('search', 'w-4 h-4')}
              </span>
              <input
                id="company-search-input"
                type="text"
                value="${this.companySearchQuery}"
                placeholder="Cari nama perusahaan, ticker, kota HQ, atau CEO AI..."
                class="w-full h-9 pl-9 pr-8 bg-[#040711] border border-slate-700/80 focus:border-amber-400 rounded-md text-xs font-sans text-white placeholder-slate-400 focus:outline-none transition-colors shadow-inner"
              />
              ${this.companySearchQuery ? `
                <button id="btn-clear-search" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-white cursor-pointer" title="Bersihkan pencarian">
                  ${getIcon('x', 'w-3.5 h-3.5')}
                </button>
              ` : ''}
            </div>

            <!-- Right Controls: Status Tag + Sort Selector -->
            <div class="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
              <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Menampilkan <strong class="text-amber-400">${filtered.length}</strong> / ${allCompanies.length} Korporasi</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="text-slate-400 text-xs font-semibold whitespace-nowrap flex items-center gap-1.5">
                  ${getIcon('sliders', 'w-3.5 h-3.5 text-amber-400')}
                  Urutkan:
                </span>
                <select id="company-sort-select" class="h-9 bg-[#040711] border border-slate-700/80 rounded-md px-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-sans cursor-pointer hover:border-slate-600 transition-colors shadow-inner">
                  <option value="marketCap" ${this.companySortBy === 'marketCap' ? 'selected' : ''}>Valuasi Pasar Tertinggi</option>
                  <option value="price" ${this.companySortBy === 'price' ? 'selected' : ''}>Harga Saham Tertinggi</option>
                  <option value="changePct" ${this.companySortBy === 'changePct' ? 'selected' : ''}>Performa (+/- % Ticker)</option>
                  <option value="playerStake" ${this.companySortBy === 'playerStake' ? 'selected' : ''}>Kepemilikan Anda</option>
                  <option value="techLevel" ${this.companySortBy === 'techLevel' ? 'selected' : ''}>Level Riset Teknologi</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Sector Filter Ribbon (Comfortable Horizontal Scroll Ribbon) -->
          <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none flex-1">
              <span class="text-slate-400 text-xs font-semibold whitespace-nowrap flex items-center gap-1 mr-1 shrink-0">
                ${getIcon('filter', 'w-3.5 h-3.5 text-cyan-400')}
                Sektor:
              </span>
              ${sectorFilters.map(sf => {
                const isActive = this.companySectorFilter === sf.id;
                return `
                  <button
                    class="btn-sector-filter h-7.5 px-2.5 inline-flex items-center justify-center rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold border border-amber-300 shadow-sm shadow-amber-400/20'
                        : 'bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                    }"
                    data-filter="${sf.id}">
                    ${sf.label}
                  </button>
                `;
              }).join('')}
            </div>

            ${(this.companySectorFilter !== 'all' || this.companySearchQuery) ? `
              <button id="btn-reset-filters-inline" class="h-7.5 px-2.5 rounded-md bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/70 text-rose-300 hover:text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer shrink-0">
                ${getIcon('rotateCw', 'w-3 h-3')}
                <span>Reset</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- 20 Company Cards Grid (Comfortable Desktop 16:9 Grid: Distinct Sector Themes & Crisp Modern Edges) -->
        ${filtered.length === 0 ? `
          <div class="bg-[#0b101d] border border-slate-800 rounded-lg p-8 text-center flex flex-col items-center justify-center gap-2">
            <div class="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              ${getIcon('search', 'w-6 h-6')}
            </div>
            <h4 class="text-sm font-bold text-slate-300">Tidak ada perusahaan yang cocok</h4>
            <p class="text-xs text-slate-500 max-w-sm">Coba ubah kata kunci pencarian atau reset filter sektor untuk melihat 20 perusahaan aktif.</p>
            <button id="btn-reset-filters" class="mt-2 h-8 px-3.5 inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-xs text-white font-semibold rounded-md transition-all active:scale-95 cursor-pointer">
              Reset Filter
            </button>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            ${filtered.map(c => {
              const isPlayer = c.symbol === s.ticker;
              const isUp = c.changePct >= 0;
              const secInfo = getSectorStyle(c.sector);
              const cardTheme = getCompanyCardTheme(c, isPlayer);

              // Stance Badge Style (Disciplined rounded-md, not bulbous pills)
              let stanceBadge = '';
              if (isPlayer) {
                stanceBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 border border-emerald-600/80 text-emerald-300">Sovereign (Anda)</span>`;
              } else if (c.isAllied) {
                stanceBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/90 border border-cyan-600/80 text-cyan-300 flex items-center gap-1">${getIcon('handshake', 'w-3 h-3')} Mitra Aliansi</span>`;
              } else if (c.ceo?.rivalryStance?.includes('Aggressive')) {
                stanceBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/90 border border-rose-700/80 text-rose-300">Rival Agresif</span>`;
              } else if (c.ceo?.rivalryStance?.includes('Cautious')) {
                stanceBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/90 border border-amber-700/80 text-amber-300">Kompetitor Waspada</span>`;
              } else if (c.ceo?.rivalryStance?.includes('Prospective')) {
                stanceBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950/90 border border-indigo-700/80 text-indigo-300">Calon Mitra</span>`;
              } else {
                stanceBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-slate-300">Pengamat Netral</span>`;
              }

              return `
                <div
                  class="company-card ${cardTheme.cardBg} border ${cardTheme.borderCls} transition-all duration-200 rounded-lg p-3.5 flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
                  data-symbol="${c.symbol}">
                  <div>
                    <!-- Top Row: Rank & Ticker Badge + Sector Badge -->
                    <div class="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800/90">
                      <div class="flex items-center gap-1.5">
                        <span class="company-card-rank px-2 py-0.5 rounded font-mono font-bold text-xs bg-slate-950 border border-slate-700/90 text-amber-400 shadow-inner">
                          #${c.rank} · ${c.symbol}
                        </span>
                        ${isPlayer ? `
                          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/90 border border-emerald-600/80 text-emerald-300 flex items-center gap-1">
                            ${getIcon('crown', 'w-3 h-3 text-emerald-400')}
                            Sovereign
                          </span>
                        ` : ''}
                      </div>
                      <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 ${secInfo.badgeCls}">
                        ${secInfo.label}
                      </span>
                    </div>

                    <!-- Company Name & HQ City -->
                    <div class="mt-2.5">
                      <h3 class="text-sm font-bold text-white group-hover:text-amber-300 transition-colors tracking-tight line-clamp-1 leading-snug">${c.name}</h3>
                      <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        ${getIcon('mapPin', 'w-3 h-3 text-slate-500 shrink-0')}
                        <span class="text-slate-300 font-medium truncate">${c.headquarters || 'Metropolis Global'}</span>
                      </div>
                    </div>

                    <!-- AI-NPC CEO Box (Distinct inner container with purpose-designed accent strip) -->
                    <div class="mt-2.5 p-2.5 rounded-md ${cardTheme.ceoBg} border shadow-sm flex flex-col gap-1.5 relative overflow-hidden">
                      <div class="absolute left-0 inset-y-0 w-1 ${cardTheme.ceoBar}"></div>
                      <div class="flex items-center justify-between gap-2 pl-1.5">
                        <div class="flex items-center gap-2 min-w-0">
                          <div class="p-1.5 rounded-md bg-slate-800/95 border border-slate-700 text-cyan-400 shrink-0 shadow-inner">
                            ${getIcon(c.ceo?.icon || 'briefcase', 'w-3.5 h-3.5')}
                          </div>
                          <div class="min-w-0">
                            <span class="text-xs font-bold text-white truncate block">${c.ceo?.name || 'Chief Executive'}</span>
                            <span class="text-[10.5px] text-slate-400 truncate block">${c.ceo?.trait || c.ceo?.title}</span>
                          </div>
                        </div>
                        <div class="shrink-0">
                          ${stanceBadge}
                        </div>
                      </div>
                      ${c.ceo?.visionQuote ? `
                        <div class="text-[10.5px] text-slate-300 italic pt-1.5 pl-1.5 border-t border-slate-800/90 flex items-start gap-1 leading-snug">
                          <span class="text-amber-400 font-serif text-xs leading-none shrink-0">“</span>
                          <span class="line-clamp-2">${c.ceo.visionQuote}</span>
                        </div>
                      ` : ''}
                    </div>

                    <!-- Financial Metrics Matrix (4 distinct tiles with inner fill) -->
                    <div class="grid grid-cols-2 gap-1.5 mt-2.5 text-xs font-mono">
                      <!-- Valuasi Pasar -->
                      <div class="p-2 rounded-md bg-[#03060d]/90 border border-slate-800/80 flex flex-col justify-between">
                        <span class="text-[9.5px] text-slate-400 font-sans uppercase tracking-wider block font-semibold">Valuasi Pasar</span>
                        <span class="company-card-market-cap font-bold text-white text-xs tabular-nums mt-0.5 block">${formatCurrency(c.marketCap, true)}</span>
                      </div>

                      <!-- Harga Saham -->
                      <div class="p-2 rounded-md bg-[#070502]/90 border border-amber-900/30 flex flex-col justify-between">
                        <span class="text-[9.5px] text-slate-400 font-sans uppercase tracking-wider block font-semibold">Harga Saham</span>
                        <div class="flex items-center justify-between gap-1 mt-0.5">
                          <span class="company-card-price font-bold text-amber-400 text-xs tabular-nums">$${c.price.toFixed(2)}</span>
                          <span class="company-card-change text-[9.5px] font-bold px-1.5 py-0.2 rounded ${isUp ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60' : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'} tabular-nums">
                            ${isUp ? '+' : ''}${c.changePct.toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <!-- Rasio P/E -->
                      <div class="p-2 rounded-md bg-[#03060d]/90 border border-slate-800/80 flex flex-col justify-between">
                        <span class="text-[9.5px] text-slate-400 font-sans uppercase tracking-wider block font-semibold">Rasio P/E</span>
                        <span class="font-bold text-slate-300 text-xs tabular-nums mt-0.5 block">${c.peRatio ? c.peRatio.toFixed(1) + 'x' : '15.0x'}</span>
                      </div>

                      <!-- Tingkat Teknologi -->
                      <div class="p-2 rounded-md bg-[#02070d]/90 border border-cyan-900/30 flex flex-col justify-between">
                        <span class="text-[9.5px] text-slate-400 font-sans uppercase tracking-wider block font-semibold">Level Riset</span>
                        <span class="font-bold text-cyan-400 text-xs tabular-nums mt-0.5 flex items-center gap-1">
                          ${getIcon('zap', 'w-3 h-3 text-cyan-400')} LVL ${c.techLevel || 1}
                        </span>
                      </div>
                    </div>

                    <!-- Player Ownership Status Bar -->
                    <div class="mt-2.5 p-2 rounded-md bg-[#03060d]/80 border border-slate-800/90">
                      ${c.ownershipPct > 0 ? `
                        <div class="flex items-center justify-between text-xs font-mono mb-1">
                          <span class="text-slate-300 font-sans text-[10.5px] font-semibold">Kepemilikan Anda:</span>
                          <span class="company-card-ownership-val font-bold ${c.ownershipPct >= 50 ? 'text-emerald-400' : 'text-amber-400'}">
                            ${c.ownershipPct.toFixed(1)}% ${c.ownershipPct >= 50 ? '(Mayoritas)' : ''}
                          </span>
                        </div>
                        <div class="w-full h-1.5 bg-slate-900 rounded overflow-hidden border border-slate-800">
                          <div class="company-card-ownership-bar h-full ${c.ownershipPct >= 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'} rounded transition-all" style="width: ${Math.min(100, c.ownershipPct)}%"></div>
                        </div>
                      ` : `
                        <div class="flex items-center justify-between text-xs font-mono text-slate-400">
                          <span class="font-sans text-[10.5px] text-slate-400 font-semibold">Status Saham</span>
                          <span class="text-[10.5px] font-semibold text-slate-300 flex items-center gap-1">
                            ${getIcon('globe', 'w-3 h-3 text-slate-500')} 0.0% · Terbuka di Bursa
                          </span>
                        </div>
                      `}
                    </div>
                  </div>

                  <!-- Card Action Button at Bottom (Sleek dark finish, subtle amber accent on hover) -->
                  <div class="mt-3 pt-2.5 border-t border-slate-800/80">
                    <button class="w-full h-8.5 px-3 rounded-md bg-slate-900/90 hover:bg-slate-800/95 border border-slate-700/80 hover:border-amber-400/80 text-xs text-slate-200 hover:text-white font-semibold transition-all flex items-center justify-between cursor-pointer active:scale-98 shadow-sm group/btn">
                      <span class="inline-flex items-center gap-1.5">
                        ${getIcon('fileText', 'w-3.5 h-3.5 text-amber-400')}
                        <span>Buka Dossier & Analisis</span>
                      </span>
                      ${getIcon('arrowRight', 'w-3.5 h-3.5 text-slate-400 group-hover/btn:text-amber-400 group-hover/btn:translate-x-0.5 transition-all')}
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;

    // Attach Event Handlers
    const searchInput = document.getElementById('company-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.companySearchQuery = e.target.value;
      const cursorPos = e.target.selectionStart;
      this.renderCompaniesTab(mainEl);
      const newSearchInput = document.getElementById('company-search-input');
      if (newSearchInput) {
        newSearchInput.focus();
        newSearchInput.setSelectionRange(cursorPos, cursorPos);
      }
    });

    document.getElementById('btn-clear-search')?.addEventListener('click', () => {
      this.companySearchQuery = '';
      soundEngine.playKeyboardClick();
      this.renderCompaniesTab(mainEl);
    });

    mainEl.querySelectorAll('.btn-sector-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.companySectorFilter = e.currentTarget.getAttribute('data-filter');
        soundEngine.playKeyboardClick();
        this.renderCompaniesTab(mainEl);
      });
    });

    document.getElementById('company-sort-select')?.addEventListener('change', (e) => {
      this.companySortBy = e.target.value;
      soundEngine.playKeyboardClick();
      this.renderCompaniesTab(mainEl);
    });

    document.getElementById('btn-reset-filters')?.addEventListener('click', () => {
      this.companySearchQuery = '';
      this.companySectorFilter = 'all';
      this.companySortBy = 'marketCap';
      soundEngine.playKeyboardClick();
      this.renderCompaniesTab(mainEl);
    });

    document.getElementById('btn-reset-filters-inline')?.addEventListener('click', () => {
      this.companySearchQuery = '';
      this.companySectorFilter = 'all';
      soundEngine.playKeyboardClick();
      this.renderCompaniesTab(mainEl);
    });

    mainEl.querySelectorAll('.company-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const symbol = e.currentTarget.getAttribute('data-symbol');
        const company = allCompanies.find(c => c.symbol === symbol);
        if (company) {
          soundEngine.playKeyboardClick();
          this.openCompanyDetailModal(company);
        }
      });
    });
  }

  /**
   * Ultra-lightweight live updates for the Companies tab DOM.
   * Modifies text nodes in-place on existing cards and KPI boxes without destroying user scroll position or search input focus.
   */
  updateCompaniesDOM() {
    const s = this.state;
    const allCompanies = this.getAllCompanies();

    const totalMarketCap = allCompanies.reduce((acc, c) => acc + c.marketCap, 0);
    const totalPortfolioValue = allCompanies.reduce((acc, c) => acc + (c.playerOwned * c.price), 0);
    const activeAlliancesCount = (s.alliances || []).length;

    const capEl = document.getElementById('companies-kpi-total-market-cap');
    if (capEl) capEl.textContent = formatCurrency(totalMarketCap, true);

    const portEl = document.getElementById('companies-kpi-portfolio-val');
    if (portEl) portEl.textContent = formatCurrency(totalPortfolioValue, true);

    const allianceEl = document.getElementById('companies-kpi-alliances');
    if (allianceEl) allianceEl.textContent = `${activeAlliancesCount} Perusahaan Mitra`;

    const allianceCashEl = document.getElementById('companies-kpi-alliances-cashflow');
    if (allianceCashEl) allianceCashEl.textContent = `+${formatCurrency(activeAlliancesCount * 3000)}/bln Arus Sinergi`;

    const compMap = new Map();
    allCompanies.forEach(c => compMap.set(c.symbol, c));

    const cards = document.querySelectorAll('.company-card[data-symbol]');
    cards.forEach(card => {
      const sym = card.getAttribute('data-symbol');
      const comp = compMap.get(sym);
      if (!comp) return;

      const isUp = comp.changePct >= 0;

      const rankBadge = card.querySelector('.company-card-rank');
      if (rankBadge) rankBadge.textContent = `#${comp.rank} · ${comp.symbol}`;

      const capText = card.querySelector('.company-card-market-cap');
      if (capText) capText.textContent = formatCurrency(comp.marketCap, true);

      const priceText = card.querySelector('.company-card-price');
      if (priceText) priceText.textContent = `$${comp.price.toFixed(2)}`;

      const changeText = card.querySelector('.company-card-change');
      if (changeText) {
        changeText.textContent = `${isUp ? '+' : ''}${comp.changePct.toFixed(1)}%`;
        changeText.className = `company-card-change text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`;
      }

      const ownText = card.querySelector('.company-card-ownership-val');
      if (ownText && comp.ownershipPct > 0) {
        ownText.textContent = `${comp.ownershipPct.toFixed(1)}% ${comp.ownershipPct >= 50 ? '(Mayoritas)' : ''}`;
      }

      const ownBar = card.querySelector('.company-card-ownership-bar');
      if (ownBar && comp.ownershipPct > 0) {
        ownBar.style.width = `${Math.min(100, comp.ownershipPct)}%`;
      }
    });
  }

  /**
   * Ultra-lightweight live updates for the currently opened Corporate Intelligence Dossier modal.
   */
  updateDossierModalLiveDOM() {
    if (!this.currentOpenDossierSymbol) return;
    const allCompanies = this.getAllCompanies();
    const comp = allCompanies.find(c => c.symbol === this.currentOpenDossierSymbol);
    if (!comp) return;

    const s = this.state;
    const isPlayer = comp.symbol === s.ticker;
    const playerOwned = isPlayer ? s.equity.founderShares : comp.playerOwnedShares;
    const ownershipPct = comp.totalShares > 0 ? Math.round((playerOwned / comp.totalShares) * 10000) / 100 : 0;
    const portfolioValue = playerOwned * comp.price;
    const isUp = comp.changePct >= 0;

    const rankBadge = document.getElementById('dossier-rank-badge');
    if (rankBadge) rankBadge.textContent = `#${comp.rank} · ${comp.symbol}`;

    const capEl = document.getElementById('dossier-market-cap');
    if (capEl) capEl.textContent = formatCurrency(comp.marketCap, true);

    const priceEl = document.getElementById('dossier-price');
    if (priceEl) priceEl.textContent = `$${comp.price.toFixed(2)}`;

    const changeEl = document.getElementById('dossier-change');
    if (changeEl) {
      changeEl.textContent = `${isUp ? '+' : ''}${comp.changePct.toFixed(1)}%`;
      changeEl.className = `text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`;
    }

    const portValEl = document.getElementById('dossier-portfolio-val');
    if (portValEl) portValEl.textContent = formatCurrency(portfolioValue);

    const playerOwnedEl = document.getElementById('dossier-player-owned');
    if (playerOwnedEl) playerOwnedEl.textContent = `${formatNumber(playerOwned)} Lembar`;

    const ownPctEl = document.getElementById('dossier-ownership-pct');
    if (ownPctEl) ownPctEl.textContent = `${ownershipPct.toFixed(2)}%`;
  }

  /**
   * Ultra-lightweight live ticker updater for the Stocks tab.
   */
  updateStockTabLiveTicks() {
    updateStockMarketViewTicks(this);
  }

  // ==========================================
  // MODAL: CORPORATE INTELLIGENCE DOSSIER & AI-NPC CEO PROFILE
  // ==========================================
  openCompanyDetailModal(company) {
    const modalsEl = document.getElementById('tycoon-modals');
    if (!modalsEl) return;
    this.currentOpenDossierSymbol = company.symbol;

    const renderModal = () => {
      const s = this.state;
      const isPlayer = company.symbol === s.ticker;
      const isAllied = (s.alliances || []).includes(company.symbol);
      const isUp = company.changePct >= 0;

      // Ownership calculation
      const playerOwned = isPlayer ? s.equity.founderShares : company.playerOwnedShares;
      const ownershipPct = company.totalShares > 0 ? Math.round((playerOwned / company.totalShares) * 10000) / 100 : 0;
      const portfolioValue = playerOwned * company.price;

      // Control Status Tag
      let governanceText = 'Belum Memiliki Saham (0%)';
      let governanceColor = 'text-slate-400';
      if (isPlayer) {
        governanceText = 'Entitas Induk Pengendali Penuh';
        governanceColor = 'text-emerald-400';
      } else if (ownershipPct > 50) {
        governanceText = 'Pemegang Saham Mayoritas Pengendali (>50%)';
        governanceColor = 'text-emerald-400';
      } else if (ownershipPct >= 20) {
        governanceText = 'Pemegang Saham Minoritas Signifikan (Hak Dewan)';
        governanceColor = 'text-cyan-400';
      } else if (ownershipPct > 0) {
        governanceText = 'Pemegang Saham Publik Pasif';
        governanceColor = 'text-amber-400';
      }

      // Dynamic Rivalry Assessment
      let assessmentText = '';
      if (isPlayer) {
        assessmentText = 'Pusat komando strategis yang dipimpin langsung oleh Anda selaku pendiri dan arsitek utama konglomerasi.';
      } else if (isAllied) {
        assessmentText = 'Mitra aliansi strategis B2B resmi. Memberikan kontribusi kas sinergi +$3,000/bln dan percepatan transfer riset teknologi.';
      } else if (ownershipPct > 50) {
        assessmentText = `Telah tunduk di bawah kendali pemegang saham mayoritas ${s.companyName}. Direksi eksekutif wajib mematuhi mandat dividen dan arahan strategis Anda.`;
      } else if (company.ceo?.rivalryStance?.includes('Aggressive')) {
        assessmentText = `Memandang ${s.companyName} sebagai ancaman langsung terhadap pangsa pasar mereka. Cenderung bersaing agresif dalam inovasi dan ekspansi pasar.`;
      } else if (company.ceo?.rivalryStance?.includes('Cautious')) {
        assessmentText = `Memantau setiap manuver ${s.companyName} dengan cermat. Bersikap defensif dan menjaga stabilitas margin dari potensi hostile takeover.`;
      } else if (company.ceo?.rivalryStance?.includes('Prospective')) {
        assessmentText = `Menaruh respek tinggi terhadap kapabilitas teknologi ${s.companyName}. Sangat terbuka untuk negosiasi aliansi B2B dan kemitraan komersial.`;
      } else {
        assessmentText = `Menjaga sikap independen dan fokus pada fundamental bisnis internal tanpa intervensi polarisasi pasar.`;
      }

      modalsEl.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div class="bg-gradient-to-b from-[#0e1526] to-[#090d18] border border-slate-700/80 rounded-xl max-w-4xl w-full p-4 sm:p-6 flex flex-col gap-4 shadow-2xl my-auto">
            
            <!-- Dossier Header -->
            <div class="flex items-start justify-between pb-3 border-b border-slate-800 gap-3">
              <div class="flex items-center gap-3">
                <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-400 shrink-0">
                  ${getIcon(company.ceo?.icon || 'building', 'w-6 h-6')}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span id="dossier-rank-badge" class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-700">#${company.rank} · ${company.symbol}</span>
                    <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">${company.sector}</span>
                  </div>
                  <h2 class="text-lg font-bold text-white mt-1">${company.name}</h2>
                  <div class="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                    ${getIcon('mapPin', 'w-3.5 h-3.5 text-slate-500')}
                    <span>Kantor Pusat: ${company.headquarters || 'Metropolis Global'}</span>
                  </div>
                </div>
              </div>
              <button id="btn-close-dossier" class="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors" title="Tutup Dossier">
                ${getIcon('x', 'w-5 h-5')}
              </button>
            </div>

            <!-- Two-Column Executive Dossier Layout (Desktop 16:9 Optimized) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Left Column: CEO AI-NPC Profile & Intelligence (Deep Navy Surface) -->
              <div class="bg-gradient-to-b from-[#0b1424] to-[#060b14] border border-cyan-900/40 rounded-lg p-3.5 flex flex-col gap-2.5">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div class="flex items-center gap-2">
                    ${getIcon('user', 'w-4 h-4 text-cyan-400')}
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">Profil Pemimpin AI-NPC</h3>
                  </div>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Otonom Cerdas</span>
                </div>

                <!-- CEO Card Strip -->
                <div class="flex items-start gap-3 p-3 rounded-md bg-slate-900/90 border border-slate-800">
                  <div class="w-11 h-11 rounded-md bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 shadow-inner">
                    ${getIcon(company.ceo?.icon || 'briefcase', 'w-5 h-5')}
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-bold text-white truncate">${company.ceo?.name || 'Chief Executive Officer'}</h4>
                    <span class="text-xs text-amber-400 font-mono block">${company.ceo?.title || 'Group CEO'}</span>
                    <span class="text-[10.5px] text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700 inline-block mt-1 font-sans">
                      ${company.ceo?.trait || 'Corporate Strategist'}
                    </span>
                  </div>
                </div>

                <!-- CEO Vision Quote -->
                ${company.ceo?.visionQuote ? `
                  <div class="p-2.5 rounded-md bg-blue-950/30 border border-blue-900/40 text-xs text-slate-300">
                    <span class="text-blue-400 font-semibold block text-[10px] uppercase font-mono mb-0.5">Visi Kepemimpinan:</span>
                    <p class="italic leading-relaxed">"${company.ceo.visionQuote}"</p>
                  </div>
                ` : ''}

                <!-- CEO Rating Progress Bars -->
                <div class="space-y-2 bg-[#040812] p-2.5 rounded-md border border-slate-800 text-xs font-mono">
                  <div>
                    <div class="flex justify-between text-slate-400 mb-1">
                      <span>Kepemimpinan Korporat:</span>
                      <span class="font-bold text-cyan-400">${company.ceo?.leadership || 85}/100</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded overflow-hidden">
                      <div class="h-full bg-cyan-400 rounded" style="width: ${company.ceo?.leadership || 85}%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-slate-400 mb-1">
                      <span>Keahlian Industri & R&D:</span>
                      <span class="font-bold text-amber-400">${company.ceo?.specialty || 88}/100</span>
                    </div>
                    <div class="w-full h-1.5 bg-slate-800 rounded overflow-hidden">
                      <div class="h-full bg-amber-400 rounded" style="width: ${company.ceo?.specialty || 88}%"></div>
                    </div>
                  </div>
                </div>

                <!-- Psychological Stance towards Player -->
                <div class="p-2.5 rounded-md bg-[#040812] border border-slate-800 text-xs">
                  <span class="text-[10px] text-slate-400 font-mono uppercase block mb-1">Analisis Relasi dengan Anda:</span>
                  <p class="text-slate-300 leading-relaxed">${assessmentText}</p>
                </div>

                <!-- Latest Autonomous Move -->
                ${company.recentCorporateMove ? `
                  <div class="p-2 rounded-md bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                    <div class="p-1 rounded bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                      ${getIcon('activity', 'w-3 h-3')}
                    </div>
                    <div>
                      <span class="font-semibold text-slate-300">Keputusan Otonom Terkini: </span>
                      <span>${company.recentCorporateMove}</span>
                    </div>
                  </div>
                ` : ''}
              </div>

              <!-- Right Column: Financial Intelligence & Cap Table (Deep Obsidian-Slate Surface) -->
              <div class="bg-gradient-to-b from-[#0c1622] to-[#070c14] border border-amber-900/30 rounded-lg p-3.5 flex flex-col gap-2.5">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div class="flex items-center gap-2">
                    ${getIcon('trendingUp', 'w-4 h-4 text-emerald-400')}
                    <h3 class="text-xs font-bold text-white uppercase tracking-wider">Laporan Keuangan & Operasional</h3>
                  </div>
                  <span class="text-[10px] font-mono text-slate-400">AUDIT PRESISI</span>
                </div>

                <!-- 4 Financial Highlights Grid -->
                <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div class="bg-[#040711] p-2.5 rounded-md border border-slate-800">
                    <span class="text-[10px] text-slate-400 block font-sans">Valuasi Pasar (Cap)</span>
                    <span id="dossier-market-cap" class="text-sm font-bold text-cyan-400 tabular-nums">${formatCurrency(company.marketCap, true)}</span>
                  </div>
                  <div class="bg-[#040711] p-2.5 rounded-md border border-slate-800">
                    <span class="text-[10px] text-slate-400 block font-sans">Harga per Lembar</span>
                    <div class="flex items-center gap-1.5">
                      <span id="dossier-price" class="text-sm font-bold text-amber-400 tabular-nums">$${company.price.toFixed(2)}</span>
                      <span id="dossier-change" class="text-[10px] font-semibold ${isUp ? 'text-emerald-400' : 'text-rose-400'}">
                        ${isUp ? '+' : ''}${company.changePct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div class="bg-[#040711] p-2.5 rounded-md border border-slate-800">
                    <span class="text-[10px] text-slate-400 block font-sans">Pendapatan Bulanan</span>
                    <span class="text-xs font-bold text-emerald-400 tabular-nums">${formatCurrency(company.monthlyRevenue || 3000000)}/bln</span>
                  </div>
                  <div class="bg-[#040711] p-2.5 rounded-md border border-slate-800">
                    <span class="text-[10px] text-slate-400 block font-sans">Beban Operasional</span>
                    <span class="text-xs font-bold text-rose-400 tabular-nums">${formatCurrency(company.monthlyExpenses || 2400000)}/bln</span>
                  </div>
                </div>

                <!-- Financial Multipliers -->
                <div class="bg-[#040711] p-2.5 rounded-md border border-slate-800 space-y-1.5 text-xs font-mono">
                  <div class="flex justify-between text-slate-400">
                    <span>Rasio P/E:</span>
                    <span class="font-bold text-white">${company.peRatio ? company.peRatio.toFixed(1) + 'x' : '22.4x'}</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>Dividend Yield:</span>
                    <span class="font-bold text-emerald-400">${company.dividendYieldPct ? company.dividendYieldPct.toFixed(1) + '%' : '1.5%'}</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>Level Riset Teknologi:</span>
                    <span class="font-bold text-cyan-400">LVL ${company.techLevel || 3}/10</span>
                  </div>
                  <div class="flex justify-between text-slate-400">
                    <span>Total Lembar Saham Beredar:</span>
                    <span class="font-bold text-slate-200">${formatNumber(company.totalShares)} Saham</span>
                  </div>
                </div>

                <!-- Player Cap Table Position Card -->
                <div class="bg-[#040711] p-2.5 rounded-md border border-slate-800 flex flex-col gap-1.5">
                  <div class="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span class="text-xs font-bold text-white">Posisi Saham Anda</span>
                    <span class="text-xs font-mono font-bold ${governanceColor}">${governanceText}</span>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span class="text-[10px] text-slate-400 block font-sans">Saham yang Anda Miliki:</span>
                      <span id="dossier-player-owned" class="font-bold text-white tabular-nums">${formatNumber(playerOwned)} Lembar</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-slate-400 block font-sans">Persentase Kepemilikan:</span>
                      <span id="dossier-ownership-pct" class="font-bold text-amber-400 tabular-nums">${ownershipPct.toFixed(2)}%</span>
                    </div>
                    <div class="col-span-2 pt-1 border-t border-slate-800/60 flex justify-between">
                      <span class="text-slate-400 text-xs">Nilai Pasar Portofolio Anda:</span>
                      <span id="dossier-portfolio-val" class="font-bold text-emerald-400 tabular-nums">${formatCurrency(portfolioValue)}</span>
                    </div>
                  </div>
                </div>

                <!-- Company Description -->
                <div class="p-2.5 rounded-md bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                  <span class="text-slate-300 font-semibold block mb-0.5">Tentang Korporasi:</span>
                  ${company.description || 'Salah satu pilar industri teknologi dan manufaktur global terkemuka.'}
                </div>
              </div>
            </div>

            <!-- Strategic Executive Directives Bar (Bottom Actions) -->
            <div class="flex flex-wrap items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              
              <!-- Direct Trading Terminal Jump -->
              <button id="btn-jump-trade" class="h-8.5 px-3.5 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95 shadow-sm">
                ${getIcon('trendingUp', 'w-3.5 h-3.5 text-emerald-400')}
                <span>Buka Terminal Trading (${company.symbol})</span>
              </button>

              <!-- Strategic B2B Alliance Proposal (Competitors Only) -->
              ${!isPlayer && !isAllied ? `
                <button id="btn-propose-alliance" class="h-8.5 px-3.5 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md transition-all cursor-pointer active:scale-95 shadow-md">
                  ${getIcon('handshake', 'w-3.5 h-3.5')}
                  <span>Jalin Aliansi Bisnis B2B</span>
                </button>
              ` : ''}

              <!-- Hostile Takeover Dividend Extraction (If > 50% majority stake) -->
              ${!isPlayer && ownershipPct > 50 ? `
                <button id="btn-extract-majority-dividend" class="h-8.5 px-3.5 inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-md transition-all cursor-pointer active:scale-95 shadow-md">
                  ${getIcon('crown', 'w-3.5 h-3.5')}
                  <span>Ekstrak Dividen Mayoritas ($250,000)</span>
                </button>
              ` : ''}

              <!-- Close Button -->
              <button id="btn-dismiss-dossier" class="h-8.5 px-4 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-md transition-all cursor-pointer active:scale-95">
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      `;

      // Event Handlers for Dossier Modal
      document.getElementById('btn-close-dossier')?.addEventListener('click', () => {
        this.currentOpenDossierSymbol = null;
        modalsEl.innerHTML = '';
      });
      document.getElementById('btn-dismiss-dossier')?.addEventListener('click', () => {
        this.currentOpenDossierSymbol = null;
        modalsEl.innerHTML = '';
      });

      // Jump to Trading Terminal
      document.getElementById('btn-jump-trade')?.addEventListener('click', () => {
        this.currentOpenDossierSymbol = null;
        modalsEl.innerHTML = '';
        this.selectedTicker = company.symbol;
        this.switchTab('stocks');
      });

      // Propose B2B Alliance with AI CEO
      document.getElementById('btn-propose-alliance')?.addEventListener('click', () => {
        const ceoLeadership = company.ceo?.leadership || 85;
        const requiredReputation = Math.max(50, Math.floor(ceoLeadership * 0.75));

        if (s.reputation < requiredReputation && s.techLevel < (company.techLevel - 1)) {
          soundEngine.playAlertTone();
          this.addChatMessage({
            sender: company.ceo?.name || company.name,
            role: 'B2B Council',
            icon: company.ceo?.icon || 'briefcase',
            text: `Proposal Aliansi Ditolak: "${s.companyName} belum memenuhi standar reputasi pasar (minimal ${requiredReputation}) atau level teknologi kami. Tingkatkan performa Anda sebelum mengajukan ulang."`,
            tag: 'general',
          });
          renderModal();
          return;
        }

        // Alliance Accepted!
        soundEngine.playCashChime();
        if (!s.alliances) s.alliances = [];
        if (!s.alliances.includes(company.symbol)) {
          s.alliances.push(company.symbol);
        }
        company.isAllied = true;
        s.reputation = Math.min(100, s.reputation + 6);

        this.addChatMessage({
          sender: company.ceo?.name || company.name,
          role: 'B2B Syndicate',
          icon: 'handshake',
          text: `PERJANJIAN ALIANSI B2B DISETUJUI! CEO ${company.ceo?.name} menandatangani pakta kerja sama dengan ${s.companyName}. Sinergi pendapatan +$3,000/bln dan riset teknologi aktif!`,
          tag: 'finance',
        });

        this.updateHeaderBar();
        renderModal();
      });

      // Extract Majority Dividend
      document.getElementById('btn-extract-majority-dividend')?.addEventListener('click', () => {
        const payout = 250000;
        s.cash += payout;
        s.totalDividendsPaid = (s.totalDividendsPaid || 0) + payout;
        soundEngine.playCashChime();

        this.addChatMessage({
          sender: 'Dewan Komisaris Pengendali',
          role: 'Mandat Mayoritas',
          icon: 'crown',
          text: `DIVIDEN SPESIAL DIEKSTRAK! Berdasarkan kepemilikan saham pengendali ${ownershipPct.toFixed(1)}%, dividen tunai ${formatCurrency(payout)} dari kas ${company.symbol} telah ditransfer ke kas Nexus Dynamics.`,
          tag: 'finance',
        });

        this.updateHeaderBar();
        renderModal();
      });
    };

    renderModal();
  }

  // TAB 3: CAP TABLE & INVESTOR RELATIONS
  renderEquityTab(mainEl) {
    const s = this.state;
    const pcts = calculateOwnershipPercentages(s.equity);
    const isControlling = pcts.founderPct >= 50.0;

    mainEl.innerHTML = `
      <div class="space-y-3.5">
        <!-- Cap Table Card -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-2.5 mb-2.5 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              ${getIcon('pieChart', 'w-4 h-4 text-blue-400')}
              <span class="text-xs font-bold text-white uppercase tracking-wider">Struktur Kepemilikan Saham (Cap Table)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-mono">Total Saham:</span>
              <span class="text-xs font-bold text-white font-mono">${formatNumber(s.equity.totalShares)} Lembar</span>
            </div>
          </div>

          <!-- Visual Bar Representation -->
          <div class="mb-3">
            <div class="w-full h-3.5 bg-slate-900 rounded-lg overflow-hidden flex border border-slate-800">
              <div class="h-full bg-blue-500 transition-all" style="width: ${pcts.founderPct}%" title="Founder: ${pcts.founderPct}%"></div>
              <div class="h-full bg-purple-500 transition-all" style="width: ${pcts.investorPct}%" title="Investor: ${pcts.investorPct}%"></div>
              <div class="h-full bg-cyan-500 transition-all" style="width: ${pcts.esopPct}%" title="ESOP: ${pcts.esopPct}%"></div>
              <div class="h-full bg-amber-500 transition-all" style="width: ${pcts.publicPct}%" title="Publik: ${pcts.publicPct}%"></div>
            </div>
            <div class="flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 mt-2">
              <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-blue-500"></span><span>Founder (${pcts.founderPct.toFixed(1)}%)</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-purple-500"></span><span>Investor VC/Angel (${pcts.investorPct.toFixed(1)}%)</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-cyan-500"></span><span>Opsi Karyawan ESOP (${pcts.esopPct.toFixed(1)}%)</span></div>
              <div class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded bg-amber-500"></span><span>Publik Bursa (${pcts.publicPct.toFixed(1)}%)</span></div>
            </div>
          </div>

          <!-- Precision Breakdown Table -->
          <div class="overflow-x-auto border border-slate-800 rounded-lg">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="py-2 px-3">Pemangku Kepentingan</th>
                  <th class="py-2 px-3">Lembar Saham</th>
                  <th class="py-2 px-3">Persentase</th>
                  <th class="py-2 px-3">Nilai Pasar Implied</th>
                  <th class="py-2 px-3">Hak Suara Dewan</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-200">
                <tr>
                  <td class="py-2 px-3 font-semibold text-white">Founder & Chief Architect</td>
                  <td class="py-2 px-3">${formatNumber(s.equity.founderShares)}</td>
                  <td class="py-2 px-3 font-bold text-blue-400">${pcts.founderPct.toFixed(2)}%</td>
                  <td class="py-2 px-3">${formatCurrency((s.equity.founderShares / s.equity.totalShares) * s.valuation)}</td>
                  <td class="py-2 px-3 ${isControlling ? 'text-emerald-400 font-bold' : 'text-amber-400'}">
                    ${isControlling ? 'KENDALI MAYORITAS' : 'HAK SUARA BIASA'}
                  </td>
                </tr>
                <tr>
                  <td class="py-2 px-3 font-semibold text-white">Sindikasi Investor Modal Ventura</td>
                  <td class="py-2 px-3">${formatNumber(s.equity.investorShares)}</td>
                  <td class="py-2 px-3 text-purple-400 font-bold">${pcts.investorPct.toFixed(2)}%</td>
                  <td class="py-2 px-3">${formatCurrency((s.equity.investorShares / s.equity.totalShares) * s.valuation)}</td>
                  <td class="py-2 px-3 text-slate-400">Hak Veto Protektif</td>
                </tr>
                <tr>
                  <td class="py-2 px-3 font-semibold text-white">Pool Opsi Saham Karyawan (ESOP)</td>
                  <td class="py-2 px-3">${formatNumber(s.equity.esopShares)}</td>
                  <td class="py-2 px-3 text-cyan-400 font-bold">${pcts.esopPct.toFixed(2)}%</td>
                  <td class="py-2 px-3">${formatCurrency((s.equity.esopShares / s.equity.totalShares) * s.valuation)}</td>
                  <td class="py-2 px-3 text-slate-400">Non-Voting Trust</td>
                </tr>
                ${s.isIpoCompleted ? `
                  <tr>
                    <td class="py-2 px-3 font-semibold text-white">Pemegang Saham Publik Bursa</td>
                    <td class="py-2 px-3">${formatNumber(s.equity.publicShares)}</td>
                    <td class="py-2 px-3 text-amber-400 font-bold">${pcts.publicPct.toFixed(2)}%</td>
                    <td class="py-2 px-3">${formatCurrency((s.equity.publicShares / s.equity.totalShares) * s.valuation)}</td>
                    <td class="py-2 px-3 text-slate-400">Voting Pasar Bebas</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          <!-- Declare Cash Dividend Module with Icon Buttons -->
          <div class="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-bold text-white">Pembagian Dividen Tunai Pemegang Saham</h4>
              <p class="text-[11px] text-slate-400">Bagikan dividen tunai per lembar untuk meningkatkan reputasi korporat.</p>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn-declare-dividend flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-emerald-400 font-semibold rounded-lg transition-colors cursor-pointer" data-div="0.01" title="Bagikan dividen $0.01 per lembar">
                ${getIcon('coins', 'w-3.5 h-3.5')}
                <span>Dividen $0.01/sh</span>
              </button>
              <button class="btn-declare-dividend flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-emerald-400 font-semibold rounded-lg transition-colors cursor-pointer" data-div="0.02" title="Bagikan dividen $0.02 per lembar">
                ${getIcon('coins', 'w-3.5 h-3.5')}
                <span>Dividen $0.02/sh</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Active Term Sheets Proposals Grid with Compact Icon-Buttons -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col">
          <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              ${getIcon('handshake', 'w-4 h-4 text-emerald-400')}
              <span class="text-xs font-bold text-white uppercase tracking-wider">Penawaran Pendanaan Masuk (Term Sheets)</span>
            </div>
            <span class="text-[10px] font-mono text-slate-400">${s.activeTermSheets.length} Penawaran Aktif</span>
          </div>

          ${s.activeTermSheets.length === 0 ? `
            <div class="p-6 text-center text-slate-500 text-xs">
              Belum ada proposal term sheet investor saat ini. Tingkatkan valuasi dan reputasi perusahaan di atas 45 untuk menarik modal ventura kelas institusional.
            </div>
          ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${s.activeTermSheets.map(sheet => `
                <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2.5">
                  <div>
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-white">${sheet.investorName}</span>
                      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40 font-semibold">${sheet.investorType || 'VC'}</span>
                    </div>
                    <span class="text-[11px] text-slate-400">${sheet.firmName}</span>
                    <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800 text-xs font-mono">
                      <div>
                        <span class="text-[10px] text-slate-500 block">Suntikan Kas:</span>
                        <span class="font-bold text-emerald-400">${formatCurrency(sheet.cashOffered)}</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-slate-500 block">Valuasi Post-Money:</span>
                        <span class="font-bold text-cyan-400">${formatCurrency(sheet.postMoneyValuation)}</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-slate-500 block">Dilusi Saham:</span>
                        <span class="font-bold text-amber-400">${sheet.equityDilutionPct.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-slate-500 block">Kursi Dewan:</span>
                        <span class="font-bold ${sheet.demandsBoardSeat ? 'text-rose-400' : 'text-slate-400'}">${sheet.demandsBoardSeat ? 'Wajib Kursi' : 'Pengamat'}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Space-Efficient Icon-Buttons for Actions -->
                  <div class="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-800">
                    <button class="btn-negotiate-sheet p-2 bg-blue-950/80 hover:bg-blue-900/80 border border-blue-800/60 text-blue-300 rounded-lg transition-colors cursor-pointer" data-id="${sheet.investorId}" title="Negosiasikan Valuasi">
                      ${getIcon('sliders', 'w-4 h-4')}
                    </button>
                    <button class="btn-accept-sheet flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-sm" data-id="${sheet.investorId}" title="Terima Pendanaan & Terbitkan Saham Baru">
                      ${getIcon('checkCircle', 'w-4 h-4')}
                      <span>Terima</span>
                    </button>
                    <button class="btn-reject-sheet p-2 bg-slate-800 hover:bg-rose-950/80 hover:border-rose-800/60 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer" data-id="${sheet.investorId}" title="Tolak Proposal">
                      ${getIcon('xCircle', 'w-4 h-4')}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>

        <!-- Directory of Institutional Investors -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col">
          <div class="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              ${getIcon('users', 'w-4 h-4 text-purple-400')}
              <span class="text-xs font-bold text-white uppercase tracking-wider">Direktori Pemodal & Sindikasi Modal Ventura</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            ${INVESTOR_DIRECTORY.map(inv => {
              const isEligible = s.reputation >= inv.reputationReq;
              return `
                <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex flex-col justify-between text-xs">
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <span class="font-bold text-white text-xs truncate">${inv.name}</span>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${isEligible ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-slate-800 text-slate-500'} font-semibold">
                        ${isEligible ? 'MINAT TINGGI' : `REQ ${inv.reputationReq}`}
                      </span>
                    </div>
                    <span class="text-[11px] text-slate-400 block">${inv.firmName}</span>
                    <p class="text-[11px] text-slate-400 italic my-2">"${inv.flavorQuote}"</p>
                  </div>
                  <div class="pt-2 border-t border-slate-800/60 font-mono text-[11px] space-y-1">
                    <div class="flex justify-between text-slate-400">
                      <span>Besaran Tiket:</span>
                      <span class="text-white">${formatCurrency(inv.checkSizeMin, true)} - ${formatCurrency(inv.checkSizeMax, true)}</span>
                    </div>
                    <div class="flex justify-between text-slate-400">
                      <span>Target Ekuitas:</span>
                      <span class="text-amber-400 font-bold">${(inv.targetEquityPct * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    // Handlers
    mainEl.querySelectorAll('.btn-declare-dividend').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const div = parseFloat(e.currentTarget.getAttribute('data-div'));
        const totalCost = s.equity.totalShares * div;
        if (s.cash < totalCost) {
          soundEngine.playAlertTone();
          alert('Saldo kas tidak mencukupi untuk pembayaran dividen tunai ini.');
          return;
        }
        s.cash -= totalCost;
        s.totalDividendsPaid += totalCost;
        s.reputation = Math.min(100, s.reputation + 8);
        soundEngine.playCashChime();
        this.addChatMessage({
          sender: 'Dewan Pemegang Saham',
          role: 'Corporate Action',
          icon: 'coins',
          text: `Dividen tunai resmi dicairkan! Total ${formatCurrency(totalCost)} didistribusikan kepada pemegang saham.`,
          tag: 'finance',
        });
        this.updateHeaderBar();
        this.renderEquityTab(mainEl);
      });
    });

    mainEl.querySelectorAll('.btn-negotiate-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const sheet = s.activeTermSheets.find(st => st.investorId === id);
        if (sheet) {
          soundEngine.playKeyboardClick();
          this.openNegotiationModal(sheet);
        }
      });
    });

    mainEl.querySelectorAll('.btn-accept-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const sheet = s.activeTermSheets.find(st => st.investorId === id);
        if (sheet) {
          this.acceptTermSheet(sheet);
          this.renderEquityTab(mainEl);
        }
      });
    });

    mainEl.querySelectorAll('.btn-reject-sheet').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        s.activeTermSheets = s.activeTermSheets.filter(st => st.investorId !== id);
        soundEngine.playKeyboardClick();
        this.renderEquityTab(mainEl);
      });
    });
  }

  acceptTermSheet(sheet) {
    const s = this.state;
    const { newEquity } = processFundingRound(s.equity, sheet.cashOffered, sheet.postMoneyValuation);
    s.cash += sheet.cashOffered;
    s.equity = newEquity;
    s.valuation = sheet.postMoneyValuation;
    s.reputation = Math.min(100, s.reputation + 10);
    s.activeTermSheets = s.activeTermSheets.filter(st => st.investorId !== sheet.investorId);

    soundEngine.playFanfare();
    this.addChatMessage({
      sender: 'Dewan Pemegang Saham',
      role: 'Funding Round Closed',
      icon: 'handshake',
      text: `Putaran Pendanaan Resmi Ditutup! Investor ${sheet.firmName} menyetor ${formatCurrency(sheet.cashOffered)} kas segar ke rekening perusahaan.`,
      tag: 'finance',
    });
    this.updateHeaderBar();
  }

  // TAB 4: WORKFORCE & CORPORATE PERSONNEL HIERARCHY (4 TIERS)
  renderCSuiteTab(mainEl) {
    renderWorkforceView(this, mainEl);
  }

  // TAB 5: R&D & TECH OPERATIONS
  renderRndTab(mainEl) {
    const s = this.state;
    const researchedSet = new Set(s.researchedTechs);

    mainEl.innerHTML = `
      <div class="space-y-3.5">
        <!-- R&D Status Banner -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
              ${getIcon('cpu', 'w-6 h-6')}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-white">Laboratorium Riset & Operasi Teknologi</h3>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-700/60">LEVEL ${s.techLevel}</span>
              </div>
              <p class="text-xs text-slate-400">Riset teknologi enterprise untuk memperluas margin laba, skala kluster, dan reputasi korporat.</p>
            </div>
          </div>

          <div class="flex items-center gap-3 font-mono text-xs">
            <div class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-right">
              <span class="text-[10px] text-slate-500 block uppercase font-sans">Saldo Tech Points</span>
              <span class="text-sm font-bold text-cyan-400">${s.techPoints.toFixed(1)} PTS</span>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-lg p-2 text-right">
              <span class="text-[10px] text-slate-500 block uppercase font-sans">Teknologi Terpasang</span>
              <span class="text-sm font-bold text-white">${s.researchedTechs.length} / ${TECH_CATALOG.length}</span>
            </div>
          </div>
        </div>

        <!-- Tech Upgrade Grid with Compact Icon Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          ${TECH_CATALOG.map(tech => {
            const isResearched = researchedSet.has(tech.id);
            const canAfford = s.techPoints >= tech.costTechPoints && s.cash >= tech.costCash;

            return `
              <div class="bg-slate-900/70 border ${isResearched ? 'border-emerald-700/60 bg-emerald-950/10' : 'border-slate-800'} rounded-xl p-3 flex flex-col justify-between gap-2.5 text-xs">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <div class="flex items-center gap-2">
                      <div class="p-1.5 rounded-lg ${isResearched ? 'bg-emerald-950/80 text-emerald-400' : 'bg-slate-800 text-cyan-400'}">
                        ${getIcon(tech.icon, 'w-4 h-4')}
                      </div>
                      <span class="font-bold text-white text-xs">${tech.name}</span>
                    </div>
                    ${isResearched ? `
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-bold">AKTIF</span>
                    ` : `
                      <span class="text-[10px] font-mono text-slate-400">${tech.category.toUpperCase()}</span>
                    `}
                  </div>

                  <p class="text-[11px] text-slate-400 mb-2 leading-relaxed">${tech.description}</p>
                  <div class="p-2 rounded bg-slate-950/60 border border-slate-800/60 text-[11px] font-mono text-emerald-400">
                    ${tech.effectDescription}
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-800/80 space-y-2">
                  <div class="flex justify-between items-center text-[11px] font-mono">
                    <span class="text-slate-500">Biaya:</span>
                    <span class="font-bold ${s.techPoints >= tech.costTechPoints ? 'text-cyan-400' : 'text-rose-400'}">${tech.costTechPoints} PTS</span>
                    <span class="text-slate-600">·</span>
                    <span class="font-bold ${s.cash >= tech.costCash ? 'text-amber-400' : 'text-rose-400'}">${formatCurrency(tech.costCash)}</span>
                  </div>

                  ${isResearched ? `
                    <div class="w-full py-1.5 bg-emerald-950/40 border border-emerald-700/40 rounded-lg text-center text-emerald-400 font-mono text-xs font-semibold">
                      Beroperasi Penuh
                    </div>
                  ` : `
                    <button class="btn-research-tech flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${canAfford ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}" data-id="${tech.id}" ${canAfford ? '' : 'disabled'}>
                      ${getIcon('cpu', 'w-3.5 h-3.5')}
                      <span>${canAfford ? 'Riset Teknologi' : 'Sumber Daya Kurang'}</span>
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    mainEl.querySelectorAll('.btn-research-tech').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const tech = TECH_CATALOG.find(t => t.id === id);
        if (tech && s.techPoints >= tech.costTechPoints && s.cash >= tech.costCash) {
          s.techPoints -= tech.costTechPoints;
          s.cash -= tech.costCash;
          s.researchedTechs.push(tech.id);
          s.techLevel += 1;
          s.monthlyRevenue = Math.round(s.monthlyRevenue * (1 + tech.revenueBonusPct));
          s.monthlyExpenses = Math.max(5000, Math.round(s.monthlyExpenses * (1 - tech.expenseReductionPct)));
          s.reputation = Math.min(100, s.reputation + tech.reputationBonus);

          soundEngine.playFanfare();
          this.addChatMessage({
            sender: 'Laboratorium R&D',
            role: 'Tech Upgrade Deployed',
            icon: 'cpu',
            text: `Teknologi ${tech.name} berhasil diluncurkan ke production! Kapasitas dan efisiensi meningkat drastis.`,
            tag: 'tech',
          });
          this.updateHeaderBar();
          this.renderRndTab(mainEl);
        }
      });
    });
  }

  // MODAL: IPO INITIAL PUBLIC OFFERING
  openIpoModal() {
    const modalsEl = document.getElementById('tycoon-modals');
    if (!modalsEl) return;

    this.isIpoModalOpen = true;
    this.ipoFloatPct = 0.20;

    const renderModalContent = () => {
      const s = this.state;
      const sharesFloated = Math.round((s.equity.totalShares * this.ipoFloatPct) / (1 - this.ipoFloatPct));
      const totalSharesAfter = s.equity.totalShares + sharesFloated;
      const proceedsRaised = Math.round(s.valuation * this.ipoFloatPct);
      const founderPctAfter = ((s.equity.founderShares / totalSharesAfter) * 100).toFixed(1);

      modalsEl.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div class="bg-[#0B101D] border border-slate-700 rounded-2xl max-w-lg w-full p-5 flex flex-col gap-3.5 shadow-2xl">
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div class="flex items-center gap-2">
                ${getIcon('rocket', 'w-5 h-5 text-amber-400')}
                <div>
                  <h3 class="text-sm font-bold text-white">Initial Public Offering (IPO)</h3>
                  <span class="text-xs text-slate-400 font-mono">Bursa Efek Global · Pencatatan Saham Perdana</span>
                </div>
              </div>
              <button id="btn-close-ipo-modal" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                ${getIcon('x', 'w-4 h-4')}
              </button>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">
              Melantaikan saham di bursa efek pasar modal akan menghimpun dana segar tunai dan membuka likuiditas publik bagi ticker <span class="font-mono text-amber-400 font-bold">${s.ticker}</span>.
            </p>

            <!-- Float Percentage Slider -->
            <div class="space-y-1.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-slate-400">Porsi Saham Mengambang Publik:</span>
                <span class="font-bold text-amber-400">${(this.ipoFloatPct * 100).toFixed(0)}%</span>
              </div>
              <input
                id="ipo-slider"
                type="range"
                min="0.10"
                max="0.35"
                step="0.05"
                value="${this.ipoFloatPct}"
                class="w-full accent-amber-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>10% (Konservatif)</span>
                <span>20% (Standar)</span>
                <span>35% (Maksimal)</span>
              </div>
            </div>

            <!-- Projections Table -->
            <div class="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span class="text-[10px] text-slate-500 block">Dana Segar Dihimpun:</span>
                <span class="text-base font-bold text-emerald-400">${formatCurrency(proceedsRaised)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 block">Lembar Saham Baru:</span>
                <span class="text-base font-bold text-white">${formatNumber(sharesFloated)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 block">Valuasi Post-IPO:</span>
                <span class="font-bold text-cyan-400">${formatCurrency(s.valuation + proceedsRaised)}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-500 block">Sisa Saham Founder:</span>
                <span class="font-bold ${parseFloat(founderPctAfter) >= 50 ? 'text-emerald-400' : 'text-amber-400'}">${founderPctAfter}%</span>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <button id="btn-cancel-ipo" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                Batalkan
              </button>
              <button id="btn-confirm-ipo" class="flex-2 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                ${getIcon('bell', 'w-4 h-4')}
                <span>Bunyikan Lonceng & IPO</span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('ipo-slider')?.addEventListener('input', (e) => {
        this.ipoFloatPct = parseFloat(e.target.value);
        renderModalContent();
      });

      document.getElementById('btn-close-ipo-modal')?.addEventListener('click', () => {
        modalsEl.innerHTML = '';
        this.isIpoModalOpen = false;
      });

      document.getElementById('btn-cancel-ipo')?.addEventListener('click', () => {
        modalsEl.innerHTML = '';
        this.isIpoModalOpen = false;
      });

      document.getElementById('btn-confirm-ipo')?.addEventListener('click', () => {
        const { newEquity, sharesFloated: sf } = executeIpo(s.equity, this.ipoFloatPct);
        const proceeds = Math.round(s.valuation * this.ipoFloatPct);

        s.isIpoCompleted = true;
        s.cash += proceeds;
        s.equity = newEquity;
        s.reputation = Math.min(100, s.reputation + 25);

        soundEngine.playBellRing();
        setTimeout(() => soundEngine.playFanfare(), 400);

        this.addChatMessage({
          sender: 'Bursa Efek Global (Floor Desk)',
          role: 'IPO Syndicate',
          icon: 'bell',
          text: `LONCENG IPO DIBUNYIKAN! ${formatNumber(sf)} lembar saham ${s.ticker} resmi melantai. Perusahaan menghimpun dana tunai ${formatCurrency(proceeds)}!`,
          tag: 'market',
        });

        modalsEl.innerHTML = '';
        this.isIpoModalOpen = false;
        this.updateHeaderBar();
        this.renderActiveTab();
      });
    };

    renderModalContent();
  }

  // MODAL: STRATEGIC INVESTOR NEGOTIATION
  openNegotiationModal(sheet) {
    const modalsEl = document.getElementById('tycoon-modals');
    if (!modalsEl) return;

    this.negotiatingSheet = sheet;
    this.counterValuation = sheet.postMoneyValuation;

    const renderModal = () => {
      const s = this.state;
      const ceoLeadership = s.executives.CEO?.leadership || 80;
      const impliedDilution = Math.round((sheet.cashOffered / this.counterValuation) * 10000) / 100;

      modalsEl.innerHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div class="bg-[#0B101D] border border-slate-700 rounded-2xl max-w-lg w-full p-5 flex flex-col gap-3.5 shadow-2xl">
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div class="flex items-center gap-2">
                ${getIcon('handshake', 'w-5 h-5 text-blue-400')}
                <div>
                  <h3 class="text-sm font-bold text-white">Komite Negosiasi Pendanaan Investor</h3>
                  <span class="text-xs text-slate-400 font-mono">${sheet.firmName}</span>
                </div>
              </div>
              <button id="btn-close-neg-modal" class="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
                ${getIcon('x', 'w-4 h-4')}
              </button>
            </div>

            <!-- Thesis info -->
            <div class="p-2.5 rounded-lg bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300">
              <span class="text-blue-400 font-semibold block mb-0.5">Tesis Investasi Komite:</span>
              ${sheet.thesisRationale || 'Fokus pada efisiensi modal dan skalabilitas margin.'}
            </div>

            <div class="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
              <div class="flex justify-between text-slate-400">
                <span>Suntikan Kas:</span>
                <span class="font-bold text-emerald-400">${formatCurrency(sheet.cashOffered)}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Tawaran Valuasi Awal:</span>
                <span class="font-bold text-white">${formatCurrency(sheet.postMoneyValuation)}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Dilusi Ekuitas:</span>
                <span class="font-bold text-amber-400">${impliedDilution.toFixed(2)}%</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Persuasi Kepemimpinan CEO:</span>
                <span class="font-bold text-cyan-400">${ceoLeadership}/100</span>
              </div>
            </div>

            <!-- Counter Offer Slider -->
            <div class="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div class="flex justify-between text-xs font-mono">
                <span class="text-slate-400">Tawaran Balik Valuasi:</span>
                <span class="font-bold text-cyan-400">${formatCurrency(this.counterValuation)}</span>
              </div>
              <input
                id="counter-val-slider"
                type="range"
                min="${sheet.postMoneyValuation}"
                max="${Math.round(sheet.postMoneyValuation * 1.6)}"
                step="50000"
                value="${this.counterValuation}"
                class="w-full accent-cyan-500 cursor-pointer"
              />
              <div class="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Valuasi Investor</span>
                <span>+30%</span>
                <span>+60% Agresif</span>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <button id="btn-cancel-neg" class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer">
                Batalkan
              </button>
              <button id="btn-submit-counter" class="flex-2 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5">
                ${getIcon('sliders', 'w-3.5 h-3.5')}
                <span>Kirim Tawaran Negosiasi</span>
              </button>
            </div>
          </div>
        </div>
      `;

      document.getElementById('counter-val-slider')?.addEventListener('input', (e) => {
        this.counterValuation = parseInt(e.target.value, 10);
        renderModal();
      });

      document.getElementById('btn-close-neg-modal')?.addEventListener('click', () => {
        modalsEl.innerHTML = '';
      });
      document.getElementById('btn-cancel-neg')?.addEventListener('click', () => {
        modalsEl.innerHTML = '';
      });

      document.getElementById('btn-submit-counter')?.addEventListener('click', () => {
        const evalRes = evaluateStrategicNegotiation(sheet, this.counterValuation, s);
        if (evalRes.decision === 'ACCEPTED') {
          sheet.postMoneyValuation = evalRes.revisedValuation || this.counterValuation;
          soundEngine.playCashChime();
          alert(`Sukses! ${evalRes.reason}`);
          this.acceptTermSheet(sheet);
        } else if (evalRes.decision === 'COUNTER') {
          sheet.postMoneyValuation = evalRes.revisedValuation;
          soundEngine.playKeyboardClick();
          alert(evalRes.reason);
        } else {
          soundEngine.playAlertTone();
          alert(`Penolakan: ${evalRes.reason}`);
          s.activeTermSheets = s.activeTermSheets.filter(st => st.investorId !== sheet.investorId);
        }
        modalsEl.innerHTML = '';
        this.renderActiveTab();
      });
    };

    renderModal();
  }
}
