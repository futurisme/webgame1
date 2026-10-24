/**
 * Stock Market Trading Desk & Corporate Acquisition View Engine (Bursa Saham)
 * Pure JavaScript • Ultra-Lightweight • Modern 2026 Executive UI
 * Provides:
 * - 3-Column Ergonomic Trading Desk (Watchlist | Candlestick Terminal | Order & Takeover)
 * - Search & Sector Filtering (Tech, Conglomerate, Gainers, Portfolio)
 * - Real-Time Live Ticker Updating without Layout Jitter
 * - Hostile Takeover & Majority Ownership Governance
 */

import { getIcon } from './icons.js';
import { soundEngine } from './audioEngine.js';
import { formatCurrency, formatNumber } from './economy.js';
import {
  checkControllingStake,
  executeStockBuy,
  executeStockSell,
} from './stockMarket.js';
import { StockCanvasChart } from './stockCanvas.js';

export function renderStockMarketView(app, mainEl) {
  const s = app.state;

  // Build unified stock list (Player stock at front if IPO completed)
  const allStocks = [...s.competitorStocks];
  if (s.isIpoCompleted) {
    allStocks.unshift({
      symbol: s.ticker,
      name: s.companyName,
      sector: 'Enterprise Software & Conglomerate',
      price: s.sharePrice,
      changePct: (s.sharePriceHistory.length > 1)
        ? Math.round(((s.sharePrice - s.sharePriceHistory[0].open) / s.sharePriceHistory[0].open) * 1000) / 10
        : 2.5,
      totalShares: s.equity.totalShares,
      playerOwnedShares: s.equity.founderShares,
      history: s.sharePriceHistory,
      marketCap: s.valuation,
      peRatio: 22.4,
      dividendYieldPct: 1.5,
      isCompetitor: false,
      isAcquiredByPlayer: true,
      description: 'Perusahaan induk teknologi & konglomerasi yang Anda kendalikan.',
    });
  }

  // Ensure active stock exists
  let currentStock = allStocks.find(stk => stk.symbol === app.selectedTicker);
  if (!currentStock) {
    currentStock = allStocks[0];
    app.selectedTicker = currentStock.symbol;
  }

  const isPlayerStock = currentStock.symbol === s.ticker;
  const stakeInfo = checkControllingStake(currentStock.playerOwnedShares || 0, currentStock.totalShares);

  // Filter stocks for watchlist
  const query = (app.stockSearchQuery || '').toLowerCase().trim();
  const filter = app.stockSectorFilter || 'all';

  const filteredStocks = allStocks.filter(stk => {
    if (query) {
      const match = stk.symbol.toLowerCase().includes(query) || stk.name.toLowerCase().includes(query);
      if (!match) return false;
    }
    if (filter === 'portfolio') {
      return (stk.playerOwnedShares || 0) > 0;
    }
    if (filter === 'gainers') {
      return stk.changePct >= 0;
    }
    if (filter === 'tech') {
      const sec = (stk.sector || '').toLowerCase();
      return sec.includes('software') || sec.includes('tech') || sec.includes('cloud') || sec.includes('cyber');
    }
    if (filter === 'conglomerate') {
      const sec = (stk.sector || '').toLowerCase();
      return sec.includes('conglomerate') || sec.includes('konglomerasi') || sec.includes('industrial') || sec.includes('holding');
    }
    return true;
  });

  const isCurrentUp = currentStock.changePct >= 0;
  const playerShareVal = (currentStock.playerOwnedShares || 0) * currentStock.price;

  mainEl.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start max-w-[1720px] mx-auto select-none">
      
      <!-- ============================================== -->
      <!-- KOLOM 1: EMITEN WATCHLIST & PENCARIAN (3.5 cols) -->
      <!-- ============================================== -->
      <div class="lg:col-span-3 bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col gap-2.5 shadow-sm">
        
        <!-- Header -->
        <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div class="flex items-center gap-2">
            ${getIcon('trendingUp', 'w-4 h-4 text-emerald-400')}
            <span class="text-xs font-bold text-white uppercase tracking-wider">Pasar Saham & Emiten</span>
          </div>
          <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
            ${filteredStocks.length} Emiten
          </span>
        </div>

        <!-- Search Input -->
        <div class="relative">
          <input
            id="stock-search-input"
            type="text"
            placeholder="Cari ticker atau nama emiten..."
            value="${app.stockSearchQuery || ''}"
            class="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
          />
          <div class="absolute left-2.5 top-2 text-slate-500 pointer-events-none">
            ${getIcon('search', 'w-3.5 h-3.5')}
          </div>
        </div>

        <!-- Quick Filter Chips -->
        <div class="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px] font-mono">
          ${[
            { id: 'all', label: 'Semua' },
            { id: 'portfolio', label: 'Portofolio' },
            { id: 'gainers', label: 'Gainers' },
            { id: 'tech', label: 'Tech' },
            { id: 'conglomerate', label: 'Konglo' },
          ].map(f => {
            const isActive = filter === f.id;
            return `
              <button class="btn-stock-filter px-2 py-1 rounded-md transition-all cursor-pointer whitespace-nowrap ${isActive ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'}" data-filter="${f.id}">
                ${f.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Stock List (Scrollable, High-Density & Clean) -->
        <div class="space-y-1.5 overflow-y-auto max-h-[580px] pr-1 scrollbar-thin">
          ${filteredStocks.length === 0 ? `
            <div class="text-center py-8 text-slate-500 text-xs font-mono">
              Tidak ada emiten yang sesuai pencarian
            </div>
          ` : filteredStocks.map(stk => {
            const isSelected = stk.symbol === app.selectedTicker;
            const isUp = stk.changePct >= 0;
            const isSelf = stk.symbol === s.ticker;
            const ownsStake = (stk.playerOwnedShares || 0) > 0;
            const stakePct = ((stk.playerOwnedShares || 0) / stk.totalShares) * 100;

            return `
              <button class="stock-tab-btn w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${isSelected ? 'bg-slate-800/95 border-amber-500/80 shadow-md ring-1 ring-amber-500/30 border-l-4 border-l-amber-400' : 'bg-[#0E1424] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'}" data-symbol="${stk.symbol}">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-xs ${isSelected ? 'text-amber-400' : 'text-white'}">${stk.symbol}</span>
                    ${isSelf ? `
                      <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">INDUK</span>
                    ` : ''}
                    ${ownsStake && !isSelf ? `
                      <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${stakePct >= 50 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}">
                        ${stakePct >= 50 ? '👑 KONTROL' : `MILIK ${stakePct.toFixed(0)}%`}
                      </span>
                    ` : ''}
                  </div>
                  <span class="stock-btn-change text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}">
                    ${isUp ? '+' : ''}${stk.changePct.toFixed(1)}%
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[11px] text-slate-400 truncate max-w-[140px] font-sans">${stk.name}</span>
                  <span class="stock-btn-price font-bold font-mono text-white tabular-nums">$${stk.price.toFixed(2)}</span>
                </div>
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <!-- ============================================== -->
      <!-- KOLOM 2: CANDLESTICK CHART & EMITEN DETAILS (5.5 cols) -->
      <!-- ============================================== -->
      <div class="lg:col-span-5 bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2.5 shadow-sm">
        
        <!-- Stock Details Header -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <span class="text-base font-bold font-mono text-white tracking-wide">${currentStock.symbol}</span>
              <span class="text-xs text-slate-300 font-semibold truncate max-w-[220px]">• ${currentStock.name}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                ${currentStock.sector}
              </span>
            </div>
            <p class="text-[11px] text-slate-400 line-clamp-1">${currentStock.description || 'Emiten terdaftar di bursa efek pasar modal global.'}</p>
          </div>

          <!-- Live Price Banner -->
          <div class="flex items-baseline gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span id="stock-header-price" class="text-lg font-bold font-mono text-white tabular-nums">
              $${currentStock.price.toFixed(2)}
            </span>
            <span id="stock-header-change" class="text-xs font-mono font-bold ${isCurrentUp ? 'text-emerald-400' : 'text-rose-400'}">
              ${isCurrentUp ? '+' : ''}${currentStock.changePct.toFixed(1)}%
            </span>
          </div>
        </div>

        <!-- Key Financial Metrics Strip -->
        <div class="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/60 p-2 rounded-lg border border-slate-800/70">
          <div>
            <span class="text-slate-400 text-[10px] block">KAPITALISASI PASAR:</span>
            <span id="stock-chart-header-cap" class="font-bold text-white">${formatCurrency(currentStock.marketCap, true)}</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] block">PRICE-TO-EARNINGS (P/E):</span>
            <span class="font-bold text-slate-200">${currentStock.peRatio.toFixed(1)}x</span>
          </div>
          <div>
            <span class="text-slate-400 text-[10px] block">DIVIDEN YIELD:</span>
            <span class="font-bold text-emerald-400">${currentStock.dividendYieldPct.toFixed(1)}%</span>
          </div>
        </div>

        <!-- Candlestick Chart Canvas Container -->
        <div class="relative w-full h-[350px] rounded-lg overflow-hidden border border-slate-800/60 bg-[#070A12]">
          <canvas id="stock-chart-canvas" class="w-full h-full block"></canvas>
        </div>

        <!-- Chart Legend & Technical Indicators -->
        <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
          <div class="flex items-center gap-2">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-cyan-400"></span>SMA 7 Trendline</span>
            <span class="text-slate-600">|</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-500"></span>Volume Histogram</span>
          </div>
          <span class="text-slate-500 hidden sm:inline">Arahkan kursor untuk Detail Candle (OHLC)</span>
        </div>

        <!-- Player's Position in this Stock -->
        <div class="pt-2 border-t border-slate-800/80 bg-slate-950/50 p-2.5 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div>
            <span class="text-slate-400 text-[11px]">Kepemilikan Anda: </span>
            <strong class="text-white">${formatNumber(currentStock.playerOwnedShares || 0)} lembar</strong>
            <span class="text-amber-400 ml-1">(${formatCurrency(playerShareVal)})</span>
          </div>
          <div class="flex items-center gap-2 text-[11px]">
            <span class="text-slate-400">Porsi: <strong class="${stakeInfo.hasControllingStake ? 'text-emerald-400' : 'text-cyan-400'}">${stakeInfo.ownershipPct.toFixed(2)}%</strong></span>
            <span class="text-slate-600">|</span>
            <span class="text-slate-400">Est. Dividen: <strong class="text-emerald-400">+${formatCurrency(playerShareVal * (currentStock.dividendYieldPct / 100))}/thn</strong></span>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- KOLOM 3: TERMINAL TRANSAKSI & M&A / AKUISISI (3.5 cols) -->
      <!-- ============================================== -->
      <div class="lg:col-span-4 flex flex-col gap-3">
        
        <!-- 1. ORDER EXECUTION TERMINAL -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col gap-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              ${getIcon('trendingUp', 'w-4 h-4 text-emerald-400')}
              <span class="text-xs font-bold text-white uppercase tracking-wider">Terminal Order Saham</span>
            </div>
            <span class="text-[10px] font-mono text-slate-400">PASAR REGULER</span>
          </div>

          <!-- Trade Mode Tabs: Beli vs Jual -->
          <div class="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button id="btn-trade-buy" class="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${app.tradeMode === 'buy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
              ${getIcon('trendingUp', 'w-3.5 h-3.5')}
              <span>Beli Saham</span>
            </button>
            <button id="btn-trade-sell" class="flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${app.tradeMode === 'sell' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}">
              ${getIcon('trendingDown', 'w-3.5 h-3.5')}
              <span>Jual Saham</span>
            </button>
          </div>

          <!-- Shares Input & Stepper -->
          <div class="space-y-2">
            <div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <label for="trade-shares-input">Jumlah Lembar Saham</label>
                <span class="text-[10px] text-slate-500">Lot: 100 Lembar</span>
              </div>
              <input
                id="trade-shares-input"
                type="number"
                min="100"
                step="100"
                value="${app.tradeSharesInput}"
                class="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <!-- Quick % Preset Chips -->
            <div class="grid grid-cols-4 gap-1 font-mono text-xs">
              <button class="btn-quick-pct py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors cursor-pointer" data-pct="0.25">25%</button>
              <button class="btn-quick-pct py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors cursor-pointer" data-pct="0.50">50%</button>
              <button class="btn-quick-pct py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors cursor-pointer" data-pct="0.75">75%</button>
              <button class="btn-quick-pct py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-slate-300 transition-colors cursor-pointer" data-pct="1.00">Maks</button>
            </div>

            <!-- Real-time Cost Breakdown -->
            <div class="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800/80 space-y-1.5 text-xs font-mono">
              <div class="flex justify-between text-slate-400">
                <span>Harga per Lembar:</span>
                <span id="trade-live-unit-price" class="text-white font-bold">$${currentStock.price.toFixed(2)}</span>
              </div>
              <div class="flex justify-between text-slate-400">
                <span>Estimasi Total:</span>
                <span id="trade-total-cost" class="font-bold text-amber-400">${formatCurrency(app.tradeSharesInput * currentStock.price)}</span>
              </div>
              <div class="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                <span>Kas Tersedia:</span>
                <span class="text-emerald-400 font-bold">${formatCurrency(s.cash)}</span>
              </div>
            </div>

            <!-- Execute Button -->
            <button
              id="btn-execute-trade"
              class="w-full py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 ${app.tradeMode === 'buy' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-rose-600 hover:bg-rose-500 text-white'}"
            >
              ${getIcon(app.tradeMode === 'buy' ? 'trendingUp' : 'trendingDown', 'w-3.5 h-3.5')}
              <span>${app.tradeMode === 'buy' ? `Konfirmasi Beli ${formatNumber(app.tradeSharesInput)} Saham` : `Konfirmasi Jual ${formatNumber(app.tradeSharesInput)} Saham`}</span>
            </button>
          </div>
        </div>

        <!-- 2. CORPORATE TAKEOVER & M&A CONSOLE -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div class="flex items-center gap-2">
              ${getIcon('crown', 'w-4 h-4 text-amber-400')}
              <span class="text-xs font-bold text-white uppercase tracking-wider">Status Akuisisi Korporat</span>
            </div>
            <span class="text-[10px] font-mono font-bold ${stakeInfo.hasControllingStake ? 'text-emerald-400' : 'text-slate-400'}">
              ${stakeInfo.ownershipPct.toFixed(2)}% DIMILIKI
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            <!-- Progress Bar with 50% Milestone Marker -->
            <div>
              <div class="flex justify-between text-[11px] text-slate-400 mb-1 font-mono">
                <span>Ambang Kontrol Mayoritas (50%)</span>
                <span>${stakeInfo.ownershipPct.toFixed(1)}% / 100%</span>
              </div>
              <div class="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 relative">
                <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-amber-400/80 z-10" title="Ambang 50% Kontrol Mayoritas"></div>
                <div class="h-full transition-all duration-500 ${stakeInfo.hasControllingStake ? 'bg-gradient-to-r from-amber-500 to-emerald-500' : 'bg-blue-500'}" style="width: ${Math.min(100, stakeInfo.ownershipPct)}%"></div>
              </div>
            </div>

            <!-- Contextual Actions & Status Details -->
            ${currentStock.isCompetitor ? `
              ${stakeInfo.hasControllingStake ? `
                <div class="p-3 bg-amber-950/30 border border-amber-600/40 rounded-lg space-y-2">
                  <div class="flex items-center gap-1.5 text-amber-400 font-semibold text-xs">
                    ${getIcon('crown', 'w-4 h-4')}
                    <span>Pemegang Saham Mayoritas Pengendali!</span>
                  </div>
                  <p class="text-[11px] text-slate-300 leading-relaxed">
                    Anda memegang hak suara penentu atas emiten ini. Anda berhak mengekstrak dividen kas spesial atau melakukan konsolidasi merger penuh.
                  </p>
                  <div class="grid grid-cols-1 gap-2 pt-1">
                    <button id="btn-takeover-dividend" class="w-full py-1.5 px-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm">
                      ${getIcon('coins', 'w-3.5 h-3.5')}
                      <span>Tarik Dividen Spesial ($150,000)</span>
                    </button>
                    ${!currentStock.isAcquiredByPlayer ? `
                      <button id="btn-force-merger" class="w-full py-1.5 px-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-xs transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-sm">
                        ${getIcon('sparkles', 'w-3.5 h-3.5')}
                        <span>Konsolidasi Merger Konglomerasi (+ $18,000/bln)</span>
                      </button>
                    ` : `
                      <div class="text-center text-[10px] text-emerald-400 font-mono py-1 bg-emerald-950/40 border border-emerald-800/40 rounded">
                        ✓ Telah Dikonsolidasi Penuh ke Konglomerasi Induk
                      </div>
                    `}
                  </div>
                </div>
              ` : `
                <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
                  <div class="font-semibold text-slate-300">Hak Suara Saat Ini: Minoritas</div>
                  <p>Beli akumulasi saham hingga melampaui ambang 50.0% untuk mengambil alih dewan direksi emiten ini.</p>
                </div>
              `}
            ` : `
              <div class="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
                <div class="font-semibold text-amber-400">Saham Induk Perusahaan Anda (${s.ticker})</div>
                <p>Pertahankan kepemilikan pendiri di atas 50% untuk mencegah investor luar mengambil alih hak veto dewan komisaris Anda.</p>
              </div>
            `}
          </div>
        </div>

      </div>

    </div>
  `;

  // Initialize stock candlestick chart
  const canvas = document.getElementById('stock-chart-canvas');
  if (canvas) {
    if (app.stockChart) {
      app.stockChart.destroy();
      app.stockChart = null;
    }
    app.stockChart = new StockCanvasChart(canvas);
    app.stockChart.resize();
    app.stockChart.setData(currentStock.symbol, currentStock.history);
  }

  // Attach all stock market events
  attachStockMarketEvents(app, mainEl, currentStock);
}

/**
 * Attaches event handlers for the stock market trading desk
 */
function attachStockMarketEvents(app, mainEl, currentStock) {
  const s = app.state;

  // Search input handler
  const searchInput = document.getElementById('stock-search-input');
  searchInput?.addEventListener('input', (e) => {
    app.stockSearchQuery = e.target.value;
    renderStockMarketView(app, mainEl);
    // keep focus on search input
    const newInp = document.getElementById('stock-search-input');
    if (newInp) {
      newInp.focus();
      newInp.selectionStart = newInp.selectionEnd = newInp.value.length;
    }
  });

  // Filter chips handler
  mainEl.querySelectorAll('.btn-stock-filter').forEach(btn => {
    btn.addEventListener('click', (e) => {
      app.stockSectorFilter = e.currentTarget.getAttribute('data-filter');
      soundEngine.playKeyboardClick();
      renderStockMarketView(app, mainEl);
    });
  });

  // Ticker select handlers
  mainEl.querySelectorAll('.stock-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sym = e.currentTarget.getAttribute('data-symbol');
      app.selectedTicker = sym;
      soundEngine.playKeyboardClick();
      renderStockMarketView(app, mainEl);
    });
  });

  // Trade mode toggles
  document.getElementById('btn-trade-buy')?.addEventListener('click', () => {
    app.tradeMode = 'buy';
    renderStockMarketView(app, mainEl);
  });

  document.getElementById('btn-trade-sell')?.addEventListener('click', () => {
    app.tradeMode = 'sell';
    renderStockMarketView(app, mainEl);
  });

  // Trade shares input change
  const sharesInput = document.getElementById('trade-shares-input');
  sharesInput?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    app.tradeSharesInput = Math.max(0, val);
    const costEl = document.getElementById('trade-total-cost');
    if (costEl) {
      costEl.textContent = formatCurrency(app.tradeSharesInput * currentStock.price);
    }
  });

  // Quick % buttons
  mainEl.querySelectorAll('.btn-quick-pct').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pct = parseFloat(e.currentTarget.getAttribute('data-pct'));
      if (app.tradeMode === 'buy') {
        const maxAffordable = Math.floor(s.cash / currentStock.price);
        app.tradeSharesInput = Math.max(100, Math.floor(maxAffordable * pct));
      } else {
        app.tradeSharesInput = Math.max(0, Math.floor((currentStock.playerOwnedShares || 0) * pct));
      }
      if (sharesInput) sharesInput.value = app.tradeSharesInput;
      const costEl = document.getElementById('trade-total-cost');
      if (costEl) costEl.textContent = formatCurrency(app.tradeSharesInput * currentStock.price);
    });
  });

  // Execute Trade button
  document.getElementById('btn-execute-trade')?.addEventListener('click', () => {
    if (app.tradeMode === 'buy') {
      const res = executeStockBuy(s.cash, currentStock, app.tradeSharesInput);
      if (!res.success) {
        soundEngine.playAlertTone();
        alert(res.errorMessage || 'Pembelian gagal');
        return;
      }
      s.cash = res.newPlayerCash;
      currentStock.playerOwnedShares = res.newPlayerShares;
      soundEngine.playCashChime();
      app.addChatMessage({
        sender: 'Bursa Efek Global',
        role: 'Order Execution',
        icon: 'trendingUp',
        text: `Pembelian ekuitas berhasil! Membeli ${formatNumber(app.tradeSharesInput)} lembar ${currentStock.symbol} senilai ${formatCurrency(res.totalCost)}.`,
        tag: 'market',
      });
    } else {
      const res = executeStockSell(s.cash, currentStock, app.tradeSharesInput);
      if (!res.success) {
        soundEngine.playAlertTone();
        alert(res.errorMessage || 'Penjualan gagal');
        return;
      }
      s.cash = res.newPlayerCash;
      currentStock.playerOwnedShares = res.newPlayerShares;
      soundEngine.playCashChime();
      app.addChatMessage({
        sender: 'Bursa Efek Global',
        role: 'Order Execution',
        icon: 'trendingDown',
        text: `Penjualan saham tereksekusi! Menjual ${formatNumber(app.tradeSharesInput)} lembar ${currentStock.symbol} dan menerima dana segar ${formatCurrency(res.totalProceeds)}.`,
        tag: 'market',
      });
    }
    app.updateHeaderBar();
    renderStockMarketView(app, mainEl);
  });

  // Takeover Dividend Button
  document.getElementById('btn-takeover-dividend')?.addEventListener('click', () => {
    soundEngine.playCashChime();
    s.cash += 150000;
    app.addChatMessage({
      sender: 'Departemen M&A',
      role: 'Hostile Takeover',
      icon: 'crown',
      text: `Sukses mengekstrak dividen kontrol mayoritas $150,000 dari emiten ${currentStock.symbol}!`,
      tag: 'market',
    });
    app.updateHeaderBar();
    renderStockMarketView(app, mainEl);
  });

  // Force Merger Button
  document.getElementById('btn-force-merger')?.addEventListener('click', () => {
    soundEngine.playFanfare();
    currentStock.isAcquiredByPlayer = true;
    s.monthlyRevenue += 18000;
    s.reputation = Math.min(100, s.reputation + 20);
    app.addChatMessage({
      sender: 'Departemen M&A & Konsolidasi',
      role: 'Corporate Merger',
      icon: 'crown',
      text: `KONSOLIDASI SUKSES! Emiten ${currentStock.symbol} resmi diakuisisi penuh ke dalam konglomerasi induk. Arus kas dividen bulanan bertambah +$18,000/bln!`,
      tag: 'finance',
    });
    app.updateHeaderBar();
    renderStockMarketView(app, mainEl);
  });
}

/**
 * Real-time fast live ticker updates without layout shifts
 */
export function updateStockMarketViewTicks(app) {
  const s = app.state;
  const currentStock = app.getActiveStock();
  const allStocks = [
    {
      symbol: s.ticker,
      price: s.sharePrice,
      changePct: (s.sharePriceHistory.length > 1)
        ? Math.round(((s.sharePrice - s.sharePriceHistory[0].open) / s.sharePriceHistory[0].open) * 1000) / 10
        : 0,
      marketCap: s.valuation,
    },
    ...s.competitorStocks,
  ];

  const btns = document.querySelectorAll('.stock-tab-btn[data-symbol]');
  btns.forEach(btn => {
    const sym = btn.getAttribute('data-symbol');
    const stk = allStocks.find(item => item.symbol === sym);
    if (!stk) return;

    const isUp = stk.changePct >= 0;
    const changeEl = btn.querySelector('.stock-btn-change');
    if (changeEl) {
      changeEl.textContent = `${isUp ? '+' : ''}${stk.changePct.toFixed(1)}%`;
      changeEl.className = `stock-btn-change text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isUp ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`;
    }

    const priceEl = btn.querySelector('.stock-btn-price');
    if (priceEl) {
      priceEl.textContent = `$${stk.price.toFixed(2)}`;
    }
  });

  const headerPriceEl = document.getElementById('stock-header-price');
  if (headerPriceEl) headerPriceEl.textContent = `$${currentStock.price.toFixed(2)}`;

  const headerChangeEl = document.getElementById('stock-header-change');
  if (headerChangeEl) {
    const isUp = currentStock.changePct >= 0;
    headerChangeEl.textContent = `${isUp ? '+' : ''}${currentStock.changePct.toFixed(1)}%`;
    headerChangeEl.className = `text-xs font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`;
  }

  const capEl = document.getElementById('stock-chart-header-cap');
  if (capEl) capEl.textContent = formatCurrency(currentStock.marketCap, true);

  const unitPriceEl = document.getElementById('trade-live-unit-price');
  if (unitPriceEl) unitPriceEl.textContent = `$${currentStock.price.toFixed(2)}`;

  const costEl = document.getElementById('trade-total-cost');
  if (costEl) costEl.textContent = formatCurrency(app.tradeSharesInput * currentStock.price);
}
