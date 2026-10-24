/**
 * Products Tab & Device OEM Production Desk View
 * Pure Vanilla JavaScript • High-Precision Real-Time Reactive UI
 * 
 * Provides end-to-end device creation wizard:
 * 1. Product Identity (Series name, Model name, Category: HP/Smartphone, Laptop, Tablet)
 * 2. Real-time synchronous 2D vector SVG visualizer of physical device styling
 * 3. Strict B2B semiconductor supply chain dependency (CPU, GPU, RAM) with authentic empty states:
 *    - "Belum ada CPU di pasaran"
 *    - "Belum ada GPU di pasaran"
 *    - "Belum ada merek RAM di pasaran"
 * 4. Bill of Materials (BOM) breakdown, MSRP pricing, unit profit margin ($ & %),
 *    and batch production volume slider with company cash validation.
 */

import { getIcon } from './icons.js';
import { soundEngine } from './audioEngine.js';
import { formatCurrency, formatNumber } from './economy.js';
import {
  COLOR_PALETTES,
  CAMERA_STYLES,
  BEZEL_STYLES,
  renderDevicePreviewSvg,
} from './deviceVisualizer.js';
import {
  calculateDeviceBom,
  estimateDeviceMarketDemand,
  getAvailableComponents,
  DEVICE_MATERIALS,
  DEVICE_DISPLAYS,
} from './hardwareMarket.js';
import { t } from './i18n.js';

/**
 * State of the currently active configuration in the wizard
 */
let wizardState = {
  step: 1, // 1: Identity, 2: Appearance & Visualizer, 3: Hardware, 4: Pricing & Batch
  isOpen: false,
  seriesName: 'Apex',
  modelName: 'Pro Ultra',
  deviceType: 'smartphone', // 'smartphone' | 'laptop' | 'tablet'
  colorId: 'titanium_gray',
  materialId: 'titanium',
  cameraStyle: 'triple_matrix',
  bezelStyle: 'ultra_thin',
  displayId: 'oled_120',
  viewMode: 'duo', // 'duo' | 'front' | 'back'
  selectedCpuId: null,
  selectedGpuId: null,
  selectedRamId: null,
  msrp: 899,
  batchUnits: 2500,
};

/**
 * Quick name presets for instant convenience
 */
const SERIES_PRESETS = ['Apex', 'Nova', 'Horizon', 'Titan', 'CyberBook', 'Aether', 'Quantum', 'Vanguard'];
const MODEL_PRESETS = ['Pro Ultra', 'Max', 'Studio Edition', 'Neo 5G', 'X1 Carbon', 'Air Slim', 'Fold Matrix'];

/**
 * Render the main Products tab
 * @param {Object} app - TycoonApp instance
 * @param {HTMLElement} mainEl - Main content container
 */
export function renderProductsView(app, mainEl) {
  const s = app.state;
  if (!s.products) {
    s.products = [];
  }

  // Ensure default sector for player is device OEM if not already defined
  if (!s.sector) {
    s.sector = 'Perangkat Keras & Consumer Devices';
  }

  // Calculate portfolio totals
  const totalProducts = s.products.length;
  const activeProducts = s.products.filter(p => !p.isDiscontinued);
  const totalMonthlySalesUnits = activeProducts.reduce((acc, p) => acc + (p.monthlySalesUnits || 0), 0);
  const totalMonthlyDeviceRevenue = activeProducts.reduce((acc, p) => acc + ((p.monthlySalesUnits || 0) * p.msrp), 0);
  const totalLifetimeUnits = s.products.reduce((acc, p) => acc + (p.totalUnitsSold || 0), 0);

  // Weighted average margin percentage
  let avgMarginPct = 0;
  if (activeProducts.length > 0) {
    const totalMargin = activeProducts.reduce((acc, p) => acc + (((p.msrp - p.bom) / Math.max(1, p.msrp)) * 100), 0);
    avgMarginPct = Math.round((totalMargin / activeProducts.length) * 10) / 10;
  }

  mainEl.innerHTML = `
    <div class="flex flex-col gap-4 select-none pb-12">
      <!-- 1. Top Executive Banner & KPI Summary -->
      <div class="bg-gradient-to-r from-[#0B101D] via-[#0E1526] to-[#0B101D] border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
            ${getIcon('smartphone', 'w-6 h-6')}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-bold text-white tracking-tight">Divisi Consumer Hardware & Produk Device</h1>
              <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-400 text-[10px] font-mono font-bold">OEM ORIGINAL DESIGN</span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5">
              Rancang arsitektur visual perangkat, tentukan pasokan semikonduktor B2B, kendalikan margin keuntungan, dan produksi massal.
            </p>
          </div>
        </div>

        <!-- Action: Open Creation Wizard -->
        <button id="btn-open-create-wizard" class="w-full md:w-auto h-10 px-4 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all active:scale-95 cursor-pointer shrink-0">
          ${getIcon('package', 'w-4 h-4')}
          <span>Rancang Produk Device Baru</span>
        </button>
      </div>

      <!-- 2. Financial & Sales Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <!-- Active Models -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span class="text-[10px] text-slate-400 uppercase font-mono font-medium">Model Aktif di Pasar</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold font-mono text-white">${activeProducts.length}</span>
            <span class="text-xs text-slate-500 font-mono">/ ${totalProducts} total</span>
          </div>
          <span class="text-[10px] text-slate-500">Lini produk beroperasi</span>
        </div>

        <!-- Monthly Units Sold -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span class="text-[10px] text-slate-400 uppercase font-mono font-medium">Penjualan Unit/Bln</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold font-mono text-emerald-400">${formatNumber(totalMonthlySalesUnits)}</span>
            <span class="text-xs text-emerald-500/80 font-mono">unit</span>
          </div>
          <span class="text-[10px] text-slate-500">Volume serapan konsumen</span>
        </div>

        <!-- Monthly Hardware Revenue -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span class="text-[10px] text-slate-400 uppercase font-mono font-medium">Pendapatan Device/Bln</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold font-mono text-amber-400">${formatCurrency(totalMonthlyDeviceRevenue)}</span>
          </div>
          <span class="text-[10px] text-slate-500">Arus kas omset hardware</span>
        </div>

        <!-- Average Unit Margin -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col gap-1">
          <span class="text-[10px] text-slate-400 uppercase font-mono font-medium">Rata-rata Margin Produk</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold font-mono ${avgMarginPct >= 35 ? 'text-cyan-400' : 'text-amber-400'}">+${avgMarginPct}%</span>
            <span class="text-xs text-slate-500 font-mono">bersih</span>
          </div>
          <span class="text-[10px] text-slate-500">Efisiensi harga terhadap HPP</span>
        </div>

        <!-- Total Lifetime Units -->
        <div class="bg-[#0B101D] border border-slate-800 rounded-xl p-3 flex flex-col gap-1 col-span-2 lg:col-span-1">
          <span class="text-[10px] text-slate-400 uppercase font-mono font-medium">Total Akumulasi Terjual</span>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-xl font-bold font-mono text-purple-400">${formatNumber(totalLifetimeUnits)}</span>
            <span class="text-xs text-purple-400/80 font-mono">unit</span>
          </div>
          <span class="text-[10px] text-slate-500">Basis terpasang global</span>
        </div>
      </div>

      <!-- 3. Active Portfolio Section -->
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            ${getIcon('layers', 'w-4 h-4 text-cyan-400')}
            <h2 class="text-xs font-bold text-white uppercase tracking-wider">Katalog Produk & Lini Portofolio Aktif</h2>
          </div>
          <span class="text-[11px] text-slate-400 font-mono">${s.products.length} Model Terdaftar</span>
        </div>

        ${s.products.length === 0 ? `
          <!-- Empty State when no products created yet -->
          <div class="bg-[#0B101D] border border-slate-800/80 border-dashed rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3">
            <div class="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
              ${getIcon('smartphone', 'w-8 h-8 text-amber-500/60')}
            </div>
            <div class="max-w-md">
              <h3 class="text-sm font-bold text-slate-200">Belum Ada Model Perangkat yang Diproduksi</h3>
              <p class="text-xs text-slate-400 mt-1">
                Perusahaan Anda belum merilis seri smartphone, laptop, atau tablet ke pasar global.
                Buka wizard konfigurasi untuk merancang sasis, memilih komponen semikonduktor mitra, dan menetapkan margin keuntungan Anda.
              </p>
            </div>
            <button id="btn-empty-start-wizard" class="mt-2 h-9 px-4 inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition-all active:scale-95 cursor-pointer">
              ${getIcon('plus', 'w-4 h-4')}
              <span>Rancang Perangkat Pertama Sekarang</span>
            </button>
          </div>
        ` : `
          <!-- Product Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            ${s.products.map(prod => renderProductCard(prod, app)).join('')}
          </div>
        `}
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('btn-open-create-wizard')?.addEventListener('click', () => {
    soundEngine.playKeyboardClick();
    openDeviceConfigWizard(app);
  });

  document.getElementById('btn-empty-start-wizard')?.addEventListener('click', () => {
    soundEngine.playKeyboardClick();
    openDeviceConfigWizard(app);
  });

  // Attach card action listeners (MSRP adjustment, restock, retire)
  mainEl.querySelectorAll('.btn-adjust-msrp').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-id');
      openPriceAdjustModal(app, prodId);
    });
  });

  mainEl.querySelectorAll('.btn-restock-batch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-id');
      openRestockModal(app, prodId);
    });
  });

  mainEl.querySelectorAll('.btn-toggle-discontinue').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = e.currentTarget.getAttribute('data-id');
      const prod = s.products.find(p => p.id === prodId);
      if (prod) {
        prod.isDiscontinued = !prod.isDiscontinued;
        soundEngine.playKeyboardClick();
        renderProductsView(app, mainEl);
      }
    });
  });
}

/**
 * Render individual product card in the portfolio
 */
function renderProductCard(p, app) {
  const marginDollar = p.msrp - p.bom;
  const marginPct = Math.round((marginDollar / Math.max(1, p.msrp)) * 1000) / 10;
  const monthlyRevenue = (p.monthlySalesUnits || 0) * p.msrp;
  const categoryIcon = p.deviceType === 'laptop' ? 'laptop' : p.deviceType === 'tablet' ? 'tablet' : 'smartphone';
  const categoryLabel = p.deviceType === 'laptop' ? 'LAPTOP' : p.deviceType === 'tablet' ? 'TABLET' : 'SMARTPHONE (HP)';

  return `
    <div class="bg-[#0B101D] border ${p.isDiscontinued ? 'border-slate-800/60 opacity-60' : 'border-slate-800 hover:border-slate-700'} rounded-xl p-4 flex flex-col gap-3 shadow-sm transition-all relative overflow-hidden group">
      <!-- Top Header -->
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 shrink-0">
            ${getIcon(categoryIcon, 'w-4 h-4')}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-mono font-bold text-slate-400 uppercase">${p.seriesName}</span>
              <span class="text-sm font-bold text-white tracking-tight">${p.modelName}</span>
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">${categoryLabel}</span>
              <span class="text-[9px] font-mono text-slate-500">Rilis ${p.releaseYear || 2026}</span>
            </div>
          </div>
        </div>

        <div class="text-right">
          <span class="text-sm font-bold font-mono text-emerald-400 tabular-nums">${formatCurrency(p.msrp)}</span>
          <div class="text-[10px] font-mono ${marginDollar >= 0 ? 'text-cyan-400' : 'text-rose-400'}">
            Margin: +${formatCurrency(marginDollar)} (${marginPct}%)
          </div>
        </div>
      </div>

      <!-- Center: Hardware Specifications Badge Bar -->
      <div class="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5 flex flex-col gap-1.5 text-[11px] font-mono">
        <div class="flex items-center justify-between text-slate-300">
          <span class="text-slate-500 flex items-center gap-1">
            ${getIcon('cpu', 'w-3 h-3 text-cyan-400')}
            <span>CPU</span>
          </span>
          <span class="truncate max-w-[190px] font-medium" title="${p.hardware?.cpu?.modelName || 'Custom'}">
            ${p.hardware?.cpu?.modelName || 'Standar SoC'} (${p.hardware?.cpu?.vendorSymbol || 'OEM'})
          </span>
        </div>

        <div class="flex items-center justify-between text-slate-300">
          <span class="text-slate-500 flex items-center gap-1">
            ${getIcon('zap', 'w-3 h-3 text-amber-400')}
            <span>GPU</span>
          </span>
          <span class="truncate max-w-[190px] font-medium" title="${p.hardware?.gpu?.modelName || 'Integrated'}">
            ${p.hardware?.gpu?.modelName || 'Akselerator Neural'} (${p.hardware?.gpu?.vendorSymbol || 'OEM'})
          </span>
        </div>

        <div class="flex items-center justify-between text-slate-300">
          <span class="text-slate-500 flex items-center gap-1">
            ${getIcon('layers', 'w-3 h-3 text-purple-400')}
            <span>RAM</span>
          </span>
          <span class="truncate max-w-[190px] font-medium" title="${p.hardware?.ram?.modelName || 'Module'}">
            ${p.hardware?.ram?.capacityGb || '16 GB'} ${p.hardware?.ram?.ramType || ''} (${p.hardware?.ram?.vendorSymbol || 'OEM'})
          </span>
        </div>
      </div>

      <!-- Financial & Stock Breakdown Strip -->
      <div class="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/60 text-[10px] font-mono">
        <div>
          <span class="text-slate-500 block">Biaya HPP (BOM)</span>
          <span class="font-bold text-slate-200">${formatCurrency(p.bom)}</span>
        </div>
        <div>
          <span class="text-slate-500 block">Penjualan/Bln</span>
          <span class="font-bold text-emerald-400">${formatNumber(p.monthlySalesUnits || 0)} unit</span>
        </div>
        <div>
          <span class="text-slate-500 block">Stok Sisa</span>
          <span class="font-bold ${(p.inventory || 0) < 500 ? 'text-amber-400' : 'text-slate-300'}">${formatNumber(p.inventory || 0)} unit</span>
        </div>
      </div>

      <!-- Card Action Buttons -->
      <div class="flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
        <button class="btn-adjust-msrp flex-1 h-7 inline-flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition-colors cursor-pointer" data-id="${p.id}">
          ${getIcon('sliders', 'w-3 h-3 text-cyan-400')}
          <span>Ubah Harga</span>
        </button>
        <button class="btn-restock-batch flex-1 h-7 inline-flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-medium rounded-lg transition-colors cursor-pointer" data-id="${p.id}">
          ${getIcon('plus', 'w-3 h-3 text-emerald-400')}
          <span>Tambah Batch</span>
        </button>
        <button class="btn-toggle-discontinue h-7 px-2.5 inline-flex items-center justify-center bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-700/60 text-slate-400 hover:text-rose-300 text-[11px] rounded-lg transition-colors cursor-pointer" data-id="${p.id}" title="${p.isDiscontinued ? 'Aktifkan Kembali' : 'Hentikan Penjualan'}">
          ${getIcon(p.isDiscontinued ? 'checkCircle' : 'power', 'w-3 h-3')}
        </button>
      </div>
    </div>
  `;
}

/**
 * Open Full Multi-Step Interactive Device Configurator Wizard
 * @param {Object} app
 */
export function openDeviceConfigWizard(app) {
  const modalsEl = document.getElementById('tycoon-modals');
  if (!modalsEl) return;

  // Initialize or fetch current market chips
  if (!app.state.hardwareMarket) {
    app.state.hardwareMarket = getAvailableComponents(null, null);
  }

  // Auto-pick first available chips as defaults if not already picked
  const availableCpus = getAvailableComponents(app.state.hardwareMarket, 'cpu');
  const availableGpus = getAvailableComponents(app.state.hardwareMarket, 'gpu');
  const availableRams = getAvailableComponents(app.state.hardwareMarket, 'ram');

  wizardState.selectedCpuId = availableCpus[0]?.id || null;
  wizardState.selectedGpuId = availableGpus[0]?.id || null;
  wizardState.selectedRamId = availableRams[0]?.id || null;
  wizardState.step = 1;
  wizardState.isOpen = true;

  const renderWizardModal = () => {
    // Current selected parts
    const currentCpu = availableCpus.find(c => c.id === wizardState.selectedCpuId) || null;
    const currentGpu = availableGpus.find(g => g.id === wizardState.selectedGpuId) || null;
    const currentRam = availableRams.find(r => r.id === wizardState.selectedRamId) || null;

    // BOM calculation
    const bomCalc = calculateDeviceBom({
      deviceType: wizardState.deviceType,
      materialId: wizardState.materialId,
      displayId: wizardState.displayId,
      cpu: currentCpu,
      gpu: currentGpu,
      ram: currentRam,
    });

    // Market demand assessment
    const demand = estimateDeviceMarketDemand({
      deviceType: wizardState.deviceType,
      bom: bomCalc.totalBom,
      msrp: wizardState.msrp,
      qualityScore: bomCalc.material.qualityScore,
      companyReputation: app.state.reputation,
      techLevel: app.state.techLevel,
    });

    const totalBatchCost = bomCalc.totalBom * wizardState.batchUnits;
    const hasEnoughCash = app.state.cash >= totalBatchCost;

    // SVG Visual preview
    const svgPreviewHtml = renderDevicePreviewSvg({
      deviceType: wizardState.deviceType,
      colorId: wizardState.colorId,
      material: wizardState.materialId,
      cameraStyle: wizardState.cameraStyle,
      bezelStyle: wizardState.bezelStyle,
      brandName: app.state.ticker || app.state.companyName.split(' ')[0] || 'CORP',
      viewMode: wizardState.viewMode,
    });

    modalsEl.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <div class="bg-gradient-to-b from-[#0F1626] to-[#0A0E1A] border border-cyan-500/40 rounded-xl max-w-5xl w-full p-4 sm:p-6 flex flex-col gap-4 shadow-2xl relative my-auto max-h-[96vh] overflow-y-auto scrollbar-thin">
          
          <!-- Wizard Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-800">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                ${getIcon('smartphone', 'w-5 h-5')}
              </div>
              <div>
                <h2 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Rancang & Konfigurasi Perangkat Baru</span>
                  <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 text-[10px] font-mono">LANGKAH ${wizardState.step} DARI 4</span>
                </h2>
                <p class="text-xs text-slate-400">Penyelarasan visual 2D, komponen semikonduktor pasar, dan kalkulasi HPP margin laba.</p>
              </div>
            </div>
            
            <button id="btn-close-wizard" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer">
              ${getIcon('x', 'w-5 h-5')}
            </button>
          </div>

          <!-- Wizard Step Navigator Tabs -->
          <div class="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg text-xs font-semibold">
            <button class="step-nav-btn py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${wizardState.step === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-step="1">
              <span>1. Identitas Seri</span>
            </button>
            <button class="step-nav-btn py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${wizardState.step === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-step="2">
              <span>2. Visual & Sasis</span>
            </button>
            <button class="step-nav-btn py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${wizardState.step === 3 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-step="3">
              <span>3. Pasokan Hardware</span>
            </button>
            <button class="step-nav-btn py-1.5 px-2 rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer ${wizardState.step === 4 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}" data-step="4">
              <span>4. Harga & Batch</span>
            </button>
          </div>

          <!-- STEP 1: IDENTITY & CATEGORY -->
          ${wizardState.step === 1 ? `
            <div class="flex flex-col gap-4 py-2">
              <!-- Category Selector (HP, Laptop, Tablet) -->
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Pilih Kategori Perangkat Device:</label>
                <div class="grid grid-cols-3 gap-3">
                  <button type="button" class="btn-category-select p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${wizardState.deviceType === 'smartphone' ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}" data-cat="smartphone">
                    <div class="flex items-center justify-between">
                      <div class="p-2 rounded-lg ${wizardState.deviceType === 'smartphone' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
                        ${getIcon('smartphone', 'w-5 h-5')}
                      </div>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 font-bold">Volume Tinggi</span>
                    </div>
                    <div>
                      <span class="text-sm font-bold block text-white">Smartphone / HP</span>
                      <span class="text-[11px] text-slate-400 mt-0.5 block">Pasar konsumer masif, siklus pembaruan tahunan cepat.</span>
                    </div>
                  </button>

                  <button type="button" class="btn-category-select p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${wizardState.deviceType === 'laptop' ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}" data-cat="laptop">
                    <div class="flex items-center justify-between">
                      <div class="p-2 rounded-lg ${wizardState.deviceType === 'laptop' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
                        ${getIcon('laptop', 'w-5 h-5')}
                      </div>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400 font-bold">Margin Tinggi</span>
                    </div>
                    <div>
                      <span class="text-sm font-bold block text-white">Laptop & Workstation</span>
                      <span class="text-[11px] text-slate-400 mt-0.5 block">Komputasi profesional, margin laba per unit tebal.</span>
                    </div>
                  </button>

                  <button type="button" class="btn-category-select p-3 rounded-xl border text-left flex flex-col gap-2 transition-all cursor-pointer ${wizardState.deviceType === 'tablet' ? 'bg-amber-500/10 border-amber-500 text-white shadow-sm' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'}" data-cat="tablet">
                    <div class="flex items-center justify-between">
                      <div class="p-2 rounded-lg ${wizardState.deviceType === 'tablet' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'}">
                        ${getIcon('tablet', 'w-5 h-5')}
                      </div>
                      <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-400 font-bold">Kreatif & Stylus</span>
                    </div>
                    <div>
                      <span class="text-sm font-bold block text-white">Tablet & Kanvas Layar</span>
                      <span class="text-[11px] text-slate-400 mt-0.5 block">Perangkat produktivitas sentuh & stylus seniman digital.</span>
                    </div>
                  </button>
                </div>
              </div>

              <!-- Series & Model Name Inputs -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Series Name -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Nama Seri Perangkat:</label>
                  <input type="text" id="input-series-name" value="${wizardState.seriesName}" class="h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:border-amber-500" placeholder="Contoh: Apex, Nova, Titan" />
                  <!-- Quick Preset Pills -->
                  <div class="flex items-center gap-1.5 flex-wrap mt-1">
                    <span class="text-[10px] text-slate-500 font-mono">Preset:</span>
                    ${SERIES_PRESETS.map(pre => `
                      <button type="button" class="btn-preset-series text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer" data-val="${pre}">${pre}</button>
                    `).join('')}
                  </div>
                </div>

                <!-- Model Name -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Nama Model / Varian:</label>
                  <input type="text" id="input-model-name" value="${wizardState.modelName}" class="h-10 px-3 bg-slate-900 border border-slate-700 rounded-lg text-sm font-bold text-white focus:outline-none focus:border-amber-500" placeholder="Contoh: Pro Ultra, Max, Slim Z" />
                  <div class="flex items-center gap-1.5 flex-wrap mt-1">
                    <span class="text-[10px] text-slate-500 font-mono">Preset:</span>
                    ${MODEL_PRESETS.map(pre => `
                      <button type="button" class="btn-preset-model text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono transition-colors cursor-pointer" data-val="${pre}">${pre}</button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Brand Preview Card -->
              <div class="bg-slate-900/50 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-400">Nama Resmi Komersial:</span>
                  <span class="text-sm font-bold text-amber-400 font-mono tracking-wide">${app.state.companyName} ${wizardState.seriesName} ${wizardState.modelName}</span>
                </div>
                <span class="text-[11px] font-mono text-cyan-400 font-bold">${wizardState.deviceType.toUpperCase()}</span>
              </div>
            </div>
          ` : ''}

          <!-- STEP 2: PHYSICAL APPEARANCE & REAL-TIME SYNCHRONOUS 2D VISUALIZER -->
          ${wizardState.step === 2 ? `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 py-1 items-start">
              <!-- Left: Live Synchronous 2D Vector Preview (7 cols) -->
              <div class="lg:col-span-7 bg-[#070B14] border border-slate-800 rounded-xl p-3 flex flex-col gap-2 shadow-inner">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span class="text-xs font-bold text-white uppercase tracking-wider">Live Synchronous 2D CAD Visualizer</span>
                  </div>
                  <!-- View Mode Toggle -->
                  <div class="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                    <button type="button" class="btn-view-toggle px-2 py-0.5 rounded transition-colors cursor-pointer ${wizardState.viewMode === 'duo' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}" data-mode="duo">Duo (2D)</button>
                    <button type="button" class="btn-view-toggle px-2 py-0.5 rounded transition-colors cursor-pointer ${wizardState.viewMode === 'front' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}" data-mode="front">Depan</button>
                    <button type="button" class="btn-view-toggle px-2 py-0.5 rounded transition-colors cursor-pointer ${wizardState.viewMode === 'back' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}" data-mode="back">Belakang</button>
                  </div>
                </div>

                <!-- Synchronously Rendered SVG Vector Container -->
                <div id="visualizer-container" class="relative w-full aspect-[4/3] flex items-center justify-center overflow-hidden bg-slate-950/90 rounded-lg p-2 border border-slate-800/60">
                  ${svgPreviewHtml}
                </div>

                <div class="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                  <span>Warna: ${COLOR_PALETTES.find(c => c.id === wizardState.colorId)?.name}</span>
                  <span>Material: ${DEVICE_MATERIALS.find(m => m.id === wizardState.materialId)?.name}</span>
                </div>
              </div>

              <!-- Right: Styling Configuration Controls (5 cols) -->
              <div class="lg:col-span-5 flex flex-col gap-3">
                <!-- Color Palette Selection -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Warna Sasis & Finishing:</label>
                  <div class="grid grid-cols-4 gap-2">
                    ${COLOR_PALETTES.map(col => `
                      <button type="button" class="btn-color-select p-2 rounded-lg border flex flex-col items-center gap-1 transition-all cursor-pointer ${wizardState.colorId === col.id ? 'border-amber-500 bg-amber-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}" data-col="${col.id}" title="${col.name}">
                        <div class="w-6 h-6 rounded-full border border-white/20 shadow-sm" style="background-color: ${col.hex}"></div>
                        <span class="text-[9px] font-mono text-slate-300 truncate max-w-[65px]">${col.name.split(' ')[0]}</span>
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Material Chassis -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Material & Ketahanan Bodi:</label>
                  <select id="select-material" class="h-9 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-amber-500">
                    ${DEVICE_MATERIALS.map(m => `
                      <option value="${m.id}" ${wizardState.materialId === m.id ? 'selected' : ''}>
                        ${m.name} (HPP +$${m.baseCost} · Kualitas ${m.qualityScore}/100)
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Camera Module Style -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Gaya Modul Kamera & Sensor:</label>
                  <select id="select-camera" class="h-9 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-amber-500">
                    ${(CAMERA_STYLES[wizardState.deviceType] || CAMERA_STYLES.smartphone).map(c => `
                      <option value="${c.id}" ${wizardState.cameraStyle === c.id ? 'selected' : ''}>
                        ${c.name} - ${c.desc}
                      </option>
                    `).join('')}
                  </select>
                </div>

                <!-- Bezel & Chassis Chamfer -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Desain Bezel & Kelengkungan:</label>
                  <div class="grid grid-cols-3 gap-2">
                    ${BEZEL_STYLES.map(b => `
                      <button type="button" class="btn-bezel-select py-1.5 px-2 rounded-lg border text-center text-[10px] font-mono transition-all cursor-pointer ${wizardState.bezelStyle === b.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}" data-bezel="${b.id}">
                        ${b.name.split(' ')[0]}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- Display Panel Selection -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-xs font-bold text-slate-300 uppercase tracking-wider">Panel Layar (Display):</label>
                  <select id="select-display" class="h-9 px-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-medium text-white focus:outline-none focus:border-amber-500">
                    ${(DEVICE_DISPLAYS[wizardState.deviceType] || DEVICE_DISPLAYS.smartphone).map(d => `
                      <option value="${d.id}" ${wizardState.displayId === d.id ? 'selected' : ''}>
                        ${d.name} (+$${d.cost})
                      </option>
                    `).join('')}
                  </select>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- STEP 3: STRICT B2B HARDWARE SUPPLY CHAIN DEPENDENCY -->
          ${wizardState.step === 3 ? `
            <div class="flex flex-col gap-4 py-1">
              <div class="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 flex items-start gap-2.5">
                ${getIcon('cpu', 'w-4 h-4 text-cyan-400 shrink-0 mt-0.5')}
                <div>
                  <span class="font-bold">Ketergantungan Rantai Pasok Industri Semikonduktor:</span>
                  <p class="text-slate-300 text-[11px] mt-0.5">
                    Sebagai perusahaan perakit/OEM device, Anda TIDAK dapat memproduksi CPU, GPU, atau RAM sendiri secara magis.
                    Komponen wajib dibeli secara B2B dari produk yang telah diproduksi dan dirilis oleh perusahaan foundry semikonduktor di bursa global.
                  </p>
                </div>
              </div>

              <!-- CPU Selection Section -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    ${getIcon('cpu', 'w-3.5 h-3.5 text-cyan-400')}
                    <span>Pilih Prosesor Utama (CPU)</span>
                  </label>
                  <span class="text-[10px] font-mono text-slate-400">${availableCpus.length} Model di Pasar B2B</span>
                </div>

                ${availableCpus.length === 0 ? `
                  <!-- AUTHENTIC EMPTY STATE FOR CPU AS REQUESTED -->
                  <div class="p-4 rounded-xl bg-rose-950/30 border border-rose-800/80 text-rose-300 flex items-center gap-3">
                    ${getIcon('alertCircle', 'w-5 h-5 text-rose-400 shrink-0')}
                    <div>
                      <div class="text-xs font-bold">Belum ada CPU di pasaran</div>
                      <div class="text-[11px] text-rose-300/80 mt-0.5">
                        Belum ada perusahaan semikonduktor yang memproduksi dan memasarkan prosesor B2B. Produksi tidak dapat dilanjutkan tanpa CPU.
                      </div>
                    </div>
                  </div>
                ` : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    ${availableCpus.map(cpu => `
                      <button type="button" class="btn-select-cpu p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${wizardState.selectedCpuId === cpu.id ? 'bg-cyan-500/10 border-cyan-400 shadow-sm' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}" data-id="${cpu.id}">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-white truncate max-w-[160px]">${cpu.modelName}</span>
                          <span class="text-xs font-bold font-mono text-cyan-400">$${cpu.unitCost}</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-[10px] font-mono">
                          <span class="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">${cpu.vendorSymbol}</span>
                          <span class="text-slate-400">${cpu.processNode}</span>
                          <span class="text-slate-500">·</span>
                          <span class="text-slate-400">${cpu.cores}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
                          <span>Skor: ${cpu.benchmarkScore}</span>
                          <span class="text-slate-500">${cpu.tdp}</span>
                        </div>
                      </button>
                    `).join('')}
                  </div>
                `}
              </div>

              <!-- GPU Selection Section -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    ${getIcon('zap', 'w-3.5 h-3.5 text-amber-400')}
                    <span>Pilih Akselerator Grafis & Neural (GPU)</span>
                  </label>
                  <span class="text-[10px] font-mono text-slate-400">${availableGpus.length} Model di Pasar B2B</span>
                </div>

                ${availableGpus.length === 0 ? `
                  <!-- AUTHENTIC EMPTY STATE FOR GPU AS REQUESTED -->
                  <div class="p-4 rounded-xl bg-rose-950/30 border border-rose-800/80 text-rose-300 flex items-center gap-3">
                    ${getIcon('alertCircle', 'w-5 h-5 text-rose-400 shrink-0')}
                    <div>
                      <div class="text-xs font-bold">Belum ada GPU di pasaran</div>
                      <div class="text-[11px] text-rose-300/80 mt-0.5">
                        Belum ada perusahaan semikonduktor yang memproduksi unit akselerator grafis B2B. Harap tunggu rilis produk foundry AI-NPC.
                      </div>
                    </div>
                  </div>
                ` : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    ${availableGpus.map(gpu => `
                      <button type="button" class="btn-select-gpu p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${wizardState.selectedGpuId === gpu.id ? 'bg-amber-500/10 border-amber-400 shadow-sm' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}" data-id="${gpu.id}">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-white truncate max-w-[160px]">${gpu.modelName}</span>
                          <span class="text-xs font-bold font-mono text-amber-400">$${gpu.unitCost}</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-[10px] font-mono">
                          <span class="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">${gpu.vendorSymbol}</span>
                          <span class="text-slate-400">${gpu.vramGb}</span>
                          <span class="text-slate-500">·</span>
                          <span class="text-slate-400">${gpu.tflops}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
                          <span>Skor: ${gpu.benchmarkScore}</span>
                          <span class="text-slate-500">${gpu.architecture}</span>
                        </div>
                      </button>
                    `).join('')}
                  </div>
                `}
              </div>

              <!-- RAM Selection Section -->
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between">
                  <label class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    ${getIcon('layers', 'w-3.5 h-3.5 text-purple-400')}
                    <span>Pilih Modul Memori (RAM)</span>
                  </label>
                  <span class="text-[10px] font-mono text-slate-400">${availableRams.length} Merek di Pasar B2B</span>
                </div>

                ${availableRams.length === 0 ? `
                  <!-- AUTHENTIC EMPTY STATE FOR RAM AS REQUESTED -->
                  <div class="p-4 rounded-xl bg-rose-950/30 border border-rose-800/80 text-rose-300 flex items-center gap-3">
                    ${getIcon('alertCircle', 'w-5 h-5 text-rose-400 shrink-0')}
                    <div>
                      <div class="text-xs font-bold">Belum ada merek RAM di pasaran</div>
                      <div class="text-[11px] text-rose-300/80 mt-0.5">
                        Belum ada pemasok modul RAM di pasar memori global saat ini.
                      </div>
                    </div>
                  </div>
                ` : `
                  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    ${availableRams.map(ram => `
                      <button type="button" class="btn-select-ram p-2.5 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${wizardState.selectedRamId === ram.id ? 'bg-purple-500/10 border-purple-400 shadow-sm' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}" data-id="${ram.id}">
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-white truncate max-w-[160px]">${ram.modelName}</span>
                          <span class="text-xs font-bold font-mono text-purple-400">$${ram.unitCost}</span>
                        </div>
                        <div class="flex items-center gap-1.5 text-[10px] font-mono">
                          <span class="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-amber-300 font-bold">${ram.vendorSymbol}</span>
                          <span class="text-slate-400">${ram.capacityGb}</span>
                          <span class="text-slate-500">·</span>
                          <span class="text-slate-400">${ram.speedMts}</span>
                        </div>
                        <div class="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
                          <span>Skor: ${ram.benchmarkScore}</span>
                          <span class="text-slate-500">${ram.ramType}</span>
                        </div>
                      </button>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          ` : ''}

          <!-- STEP 4: BOM BREAKDOWN, MSRP PRICING, MARGIN CALCULATION & BATCH PRODUCTION SLIDER -->
          ${wizardState.step === 4 ? `
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 py-1 items-start">
              <!-- Left: Bill of Materials (BOM) Detailed Cost Breakdown (6 cols) -->
              <div class="lg:col-span-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span class="text-xs font-bold text-white uppercase tracking-wider">Struktur HPP (Bill of Materials)</span>
                  <span class="text-xs font-mono font-bold text-cyan-400">Total BOM: $${bomCalc.totalBom}/unit</span>
                </div>

                <div class="flex flex-col gap-2 text-xs font-mono">
                  <div class="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                    <span class="text-slate-400">Bodi & Sasis (${bomCalc.material.name}):</span>
                    <span>+$${bomCalc.chassisCost}</span>
                  </div>
                  <div class="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                    <span class="text-slate-400">Panel Layar (${bomCalc.display.name}):</span>
                    <span>+$${bomCalc.displayCost}</span>
                  </div>
                  <div class="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                    <span class="text-slate-400">CPU B2B (${currentCpu ? currentCpu.vendorSymbol : 'Kosong'}):</span>
                    <span>+$${bomCalc.cpuCost}</span>
                  </div>
                  <div class="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                    <span class="text-slate-400">GPU B2B (${currentGpu ? currentGpu.vendorSymbol : 'Kosong'}):</span>
                    <span>+$${bomCalc.gpuCost}</span>
                  </div>
                  <div class="flex items-center justify-between py-1 border-b border-slate-800/40 text-slate-300">
                    <span class="text-slate-400">RAM B2B (${currentRam ? currentRam.vendorSymbol : 'Kosong'}):</span>
                    <span>+$${bomCalc.ramCost}</span>
                  </div>
                  <div class="flex items-center justify-between py-1 text-slate-300">
                    <span class="text-slate-400">Perakitan, Baterai, & Pengujian OEM:</span>
                    <span>+$${bomCalc.assemblyCost}</span>
                  </div>
                </div>

                <!-- Total BOM Summary Box -->
                <div class="mt-1 p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="text-[10px] text-slate-500 block uppercase font-mono">Biaya Pokok Bersih per Unit</span>
                    <span class="text-lg font-bold font-mono text-white">$${bomCalc.totalBom}</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] text-slate-500 block uppercase font-mono">Estimasi Minat Konsumen</span>
                    <span class="text-sm font-bold font-mono text-emerald-400">${demand.appealScore}/100</span>
                  </div>
                </div>
              </div>

              <!-- Right: Pricing Slider, Margin $ & %, and Batch Volume Slider (6 cols) -->
              <div class="lg:col-span-6 flex flex-col gap-3.5">
                <!-- MSRP Slider & Margin -->
                <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-white uppercase tracking-wider">Harga Jual Konsumen (MSRP):</label>
                    <span class="text-lg font-mono font-bold text-amber-400">$${wizardState.msrp}</span>
                  </div>

                  <input type="range" id="slider-msrp" min="${Math.max(50, Math.round(bomCalc.totalBom * 0.5))}" max="${Math.round(bomCalc.totalBom * 3.5)}" step="10" value="${wizardState.msrp}" class="w-full accent-amber-500 cursor-pointer" />

                  <!-- Real-Time Margin Profit Display -->
                  <div class="grid grid-cols-2 gap-2 pt-1">
                    <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                      <span class="text-[10px] text-slate-400 uppercase font-mono">Margin Bersih/Unit ($)</span>
                      <span class="text-base font-bold font-mono ${demand.marginDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                        ${demand.marginDollar >= 0 ? '+' : ''}$${demand.marginDollar}
                      </span>
                    </div>

                    <div class="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col">
                      <span class="text-[10px] text-slate-400 uppercase font-mono">Margin Persentase (%)</span>
                      <span class="text-base font-bold font-mono ${demand.marginPct >= 0 ? 'text-cyan-400' : 'text-rose-400'}">
                        ${demand.marginPct >= 0 ? '+' : ''}${demand.marginPct}%
                      </span>
                    </div>
                  </div>

                  <!-- Status Label -->
                  <div class="text-[11px] font-mono text-center py-1 rounded bg-slate-950/80 border border-slate-800/80 ${demand.marginDollar < 0 ? 'text-rose-400' : demand.marginPct > 50 ? 'text-amber-400 font-bold' : 'text-emerald-400'}">
                    Status Margin: ${demand.marginHealth.replace(/_/g, ' ')}
                  </div>
                </div>

                <!-- Batch Production Volume Slider & Validation against Cash -->
                <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-bold text-white uppercase tracking-wider">Jumlah Unit Produksi Batch Awal:</label>
                    <span class="text-sm font-mono font-bold text-cyan-400">${formatNumber(wizardState.batchUnits)} Unit</span>
                  </div>

                  <input type="range" id="slider-batch" min="200" max="25000" step="100" value="${wizardState.batchUnits}" class="w-full accent-cyan-500 cursor-pointer" />

                  <!-- Total Capital Required vs Liquid Cash -->
                  <div class="p-2.5 rounded-lg bg-slate-950 border ${hasEnoughCash ? 'border-slate-800' : 'border-rose-700/80 bg-rose-950/20'} flex flex-col gap-1 text-xs font-mono">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">Total Modal Produksi Batch:</span>
                      <span class="font-bold text-white">${formatCurrency(totalBatchCost)}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-slate-400">Kas Likuid Tersedia:</span>
                      <span class="font-bold ${hasEnoughCash ? 'text-emerald-400' : 'text-rose-400'}">${formatCurrency(app.state.cash)}</span>
                    </div>
                    ${!hasEnoughCash ? `
                      <div class="mt-1 text-[11px] text-rose-400 font-bold flex items-center gap-1">
                        ${getIcon('alertCircle', 'w-3.5 h-3.5')}
                        <span>Kas Tidak Mencukupi! Kurang ${formatCurrency(totalBatchCost - app.state.cash)}. Kurangi batch unit atau tambah modal.</span>
                      </div>
                    ` : `
                      <div class="text-[10px] text-slate-500 mt-0.5">
                        Sisa kas setelah peluncuran: ${formatCurrency(app.state.cash - totalBatchCost)}
                      </div>
                    `}
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Wizard Footer Controls -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-800">
            <button id="btn-prev-step" class="h-9 px-4 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${wizardState.step === 1 ? 'opacity-40 pointer-events-none' : ''}">
              ${getIcon('chevronLeft', 'w-4 h-4')}
              <span>Sebelumnya</span>
            </button>

            <div class="flex items-center gap-2">
              ${wizardState.step < 4 ? `
                <button id="btn-next-step" class="h-9 px-5 inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow transition-all active:scale-95 cursor-pointer">
                  <span>Lanjutkan ke Langkah ${wizardState.step + 1}</span>
                  ${getIcon('chevronRight', 'w-4 h-4')}
                </button>
              ` : `
                <!-- Final Launch Button -->
                <button id="btn-launch-device" class="h-9 px-6 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 text-xs font-bold rounded-lg shadow-lg transition-all active:scale-95 cursor-pointer ${(!hasEnoughCash || !currentCpu || !currentGpu || !currentRam) ? 'opacity-40 pointer-events-none' : ''}">
                  ${getIcon('rocket', 'w-4 h-4')}
                  <span>Luncurkan Produk & Mulai Produksi Massal</span>
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    attachWizardEvents(renderWizardModal, app, modalsEl);
  };

  renderWizardModal();
}

/**
 * Attach dynamic events inside the wizard modal
 */
function attachWizardEvents(renderWizardModal, app, modalsEl) {
  // Close Wizard
  document.getElementById('btn-close-wizard')?.addEventListener('click', () => {
    modalsEl.innerHTML = '';
    wizardState.isOpen = false;
  });

  // Step Tabs Navigation
  modalsEl.querySelectorAll('.step-nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetStep = parseInt(e.currentTarget.getAttribute('data-step'), 10);
      wizardState.step = targetStep;
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  document.getElementById('btn-next-step')?.addEventListener('click', () => {
    if (wizardState.step < 4) {
      wizardState.step += 1;
      soundEngine.playKeyboardClick();
      renderWizardModal();
    }
  });

  document.getElementById('btn-prev-step')?.addEventListener('click', () => {
    if (wizardState.step > 1) {
      wizardState.step -= 1;
      soundEngine.playKeyboardClick();
      renderWizardModal();
    }
  });

  // Step 1 Events
  modalsEl.querySelectorAll('.btn-category-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.deviceType = e.currentTarget.getAttribute('data-cat');
      // Set reasonable defaults based on category
      if (wizardState.deviceType === 'laptop') {
        wizardState.msrp = 1499;
        wizardState.cameraStyle = 'sleek_bezel';
        wizardState.displayId = 'miniled_165';
      } else if (wizardState.deviceType === 'tablet') {
        wizardState.msrp = 799;
        wizardState.cameraStyle = 'dual_module';
        wizardState.displayId = 'oled_tandem';
      } else {
        wizardState.msrp = 899;
        wizardState.cameraStyle = 'triple_matrix';
        wizardState.displayId = 'oled_120';
      }
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  const seriesInput = document.getElementById('input-series-name');
  seriesInput?.addEventListener('input', (e) => {
    wizardState.seriesName = e.target.value.trim() || 'Apex';
  });

  const modelInput = document.getElementById('input-model-name');
  modelInput?.addEventListener('input', (e) => {
    wizardState.modelName = e.target.value.trim() || 'Pro Ultra';
  });

  modalsEl.querySelectorAll('.btn-preset-series').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.seriesName = e.currentTarget.getAttribute('data-val');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  modalsEl.querySelectorAll('.btn-preset-model').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.modelName = e.currentTarget.getAttribute('data-val');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  // Step 2 Events: Synchronous 2D CAD updates
  modalsEl.querySelectorAll('.btn-color-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.colorId = e.currentTarget.getAttribute('data-col');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  modalsEl.querySelectorAll('.btn-view-toggle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.viewMode = e.currentTarget.getAttribute('data-mode');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  modalsEl.querySelectorAll('.btn-bezel-select').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.bezelStyle = e.currentTarget.getAttribute('data-bezel');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  document.getElementById('select-material')?.addEventListener('change', (e) => {
    wizardState.materialId = e.target.value;
    renderWizardModal();
  });

  document.getElementById('select-camera')?.addEventListener('change', (e) => {
    wizardState.cameraStyle = e.target.value;
    renderWizardModal();
  });

  document.getElementById('select-display')?.addEventListener('change', (e) => {
    wizardState.displayId = e.target.value;
    renderWizardModal();
  });

  // Step 3 Events: Hardware Selection
  modalsEl.querySelectorAll('.btn-select-cpu').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.selectedCpuId = e.currentTarget.getAttribute('data-id');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  modalsEl.querySelectorAll('.btn-select-gpu').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.selectedGpuId = e.currentTarget.getAttribute('data-id');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  modalsEl.querySelectorAll('.btn-select-ram').forEach(btn => {
    btn.addEventListener('click', (e) => {
      wizardState.selectedRamId = e.currentTarget.getAttribute('data-id');
      soundEngine.playKeyboardClick();
      renderWizardModal();
    });
  });

  // Step 4 Events: Pricing and Volume Slider
  const msrpSlider = document.getElementById('slider-msrp');
  msrpSlider?.addEventListener('input', (e) => {
    wizardState.msrp = parseInt(e.target.value, 10);
    renderWizardModal();
  });

  const batchSlider = document.getElementById('slider-batch');
  batchSlider?.addEventListener('input', (e) => {
    wizardState.batchUnits = parseInt(e.target.value, 10);
    renderWizardModal();
  });

  // Final Device Launch
  document.getElementById('btn-launch-device')?.addEventListener('click', () => {
    const availableCpus = getAvailableComponents(app.state.hardwareMarket, 'cpu');
    const availableGpus = getAvailableComponents(app.state.hardwareMarket, 'gpu');
    const availableRams = getAvailableComponents(app.state.hardwareMarket, 'ram');

    const cpu = availableCpus.find(c => c.id === wizardState.selectedCpuId);
    const gpu = availableGpus.find(g => g.id === wizardState.selectedGpuId);
    const ram = availableRams.find(r => r.id === wizardState.selectedRamId);

    const bomCalc = calculateDeviceBom({
      deviceType: wizardState.deviceType,
      materialId: wizardState.materialId,
      displayId: wizardState.displayId,
      cpu,
      gpu,
      ram,
    });

    const totalBatchCost = bomCalc.totalBom * wizardState.batchUnits;
    if (app.state.cash < totalBatchCost) return;

    // Deduct batch production cost from cash
    app.state.cash -= totalBatchCost;

    // Create and save new product
    const newProduct = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      seriesName: wizardState.seriesName,
      modelName: wizardState.modelName,
      deviceType: wizardState.deviceType,
      colorId: wizardState.colorId,
      materialId: wizardState.materialId,
      cameraStyle: wizardState.cameraStyle,
      bezelStyle: wizardState.bezelStyle,
      displayId: wizardState.displayId,
      bom: bomCalc.totalBom,
      msrp: wizardState.msrp,
      inventory: wizardState.batchUnits,
      monthlySalesUnits: 0,
      totalUnitsSold: 0,
      releaseYear: app.state.year,
      releaseMonth: app.state.month,
      isDiscontinued: false,
      hardware: {
        cpu,
        gpu,
        ram,
      },
    };

    app.state.products.unshift(newProduct);

    // Audio & News announcement
    soundEngine.playCashChime();
    app.addChatMessage({
      sender: 'Divisi Produksi Device',
      role: 'Hardware Manufacturing',
      icon: 'smartphone',
      text: `Produk baru resmi diluncurkan! ${newProduct.seriesName} ${newProduct.modelName} (${newProduct.deviceType.toUpperCase()}) masuk jalur produksi massal ${formatNumber(newProduct.inventory)} unit dengan MSRP ${formatCurrency(newProduct.msrp)}.`,
      tag: 'general',
    });

    // Close wizard and refresh products view
    modalsEl.innerHTML = '';
    wizardState.isOpen = false;
    const mainEl = document.getElementById('tycoon-main');
    if (mainEl && app.activeTab === 'products') {
      renderProductsView(app, mainEl);
    }
  });
}

/**
 * Open Modal to adjust MSRP price of an existing product
 */
function openPriceAdjustModal(app, prodId) {
  const prod = app.state.products.find(p => p.id === prodId);
  if (!prod) return;

  const modalsEl = document.getElementById('tycoon-modals');
  if (!modalsEl) return;

  let tempMsrp = prod.msrp;

  const render = () => {
    const marginDollar = tempMsrp - prod.bom;
    const marginPct = Math.round((marginDollar / Math.max(1, tempMsrp)) * 1000) / 10;

    modalsEl.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#0F1626] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 class="text-sm font-bold text-white">Sesuaikan Harga MSRP: ${prod.seriesName} ${prod.modelName}</h3>
            <button id="btn-close-msrp-modal" class="text-slate-400 hover:text-white cursor-pointer">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Biaya HPP (BOM):</span>
              <span class="text-white font-bold">${formatCurrency(prod.bom)}</span>
            </div>
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Harga Jual Baru (MSRP):</span>
              <span class="text-amber-400 font-bold text-base">${formatCurrency(tempMsrp)}</span>
            </div>

            <input type="range" id="input-adjust-msrp" min="${Math.max(50, Math.round(prod.bom * 0.6))}" max="${Math.round(prod.bom * 3.5)}" step="10" value="${tempMsrp}" class="w-full accent-amber-500 cursor-pointer mt-1" />

            <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono mt-1">
              <span class="text-slate-400">Margin Laba:</span>
              <span class="font-bold ${marginDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}">
                +${formatCurrency(marginDollar)} (${marginPct}%)
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button id="btn-cancel-msrp" class="h-8 px-3 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer">Batal</button>
            <button id="btn-save-msrp" class="h-8 px-4 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg cursor-pointer">Simpan Harga</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-msrp-modal')?.addEventListener('click', () => { modalsEl.innerHTML = ''; });
    document.getElementById('btn-cancel-msrp')?.addEventListener('click', () => { modalsEl.innerHTML = ''; });
    document.getElementById('input-adjust-msrp')?.addEventListener('input', (e) => {
      tempMsrp = parseInt(e.target.value, 10);
      render();
    });
    document.getElementById('btn-save-msrp')?.addEventListener('click', () => {
      prod.msrp = tempMsrp;
      soundEngine.playKeyboardClick();
      modalsEl.innerHTML = '';
      const mainEl = document.getElementById('tycoon-main');
      if (mainEl && app.activeTab === 'products') renderProductsView(app, mainEl);
    });
  };

  render();
}

/**
 * Open Modal to restock an existing product batch
 */
function openRestockModal(app, prodId) {
  const prod = app.state.products.find(p => p.id === prodId);
  if (!prod) return;

  const modalsEl = document.getElementById('tycoon-modals');
  if (!modalsEl) return;

  let addUnits = 1000;

  const render = () => {
    const totalCost = addUnits * prod.bom;
    const canAfford = app.state.cash >= totalCost;

    modalsEl.innerHTML = `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#0F1626] border border-cyan-500/40 rounded-xl max-w-md w-full p-5 flex flex-col gap-4 shadow-2xl">
          <div class="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 class="text-sm font-bold text-white">Produksi Tambahan: ${prod.seriesName} ${prod.modelName}</h3>
            <button id="btn-close-restock-modal" class="text-slate-400 hover:text-white cursor-pointer">
              ${getIcon('x', 'w-4 h-4')}
            </button>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Stok Saat Ini:</span>
              <span class="text-white font-bold">${formatNumber(prod.inventory || 0)} Unit</span>
            </div>
            <div class="flex items-center justify-between text-xs font-mono">
              <span class="text-slate-400">Tambah Unit Produksi:</span>
              <span class="text-cyan-400 font-bold text-base">${formatNumber(addUnits)} Unit</span>
            </div>

            <input type="range" id="input-restock-units" min="200" max="15000" step="100" value="${addUnits}" class="w-full accent-cyan-500 cursor-pointer mt-1" />

            <div class="p-2.5 rounded-lg bg-slate-900 border ${canAfford ? 'border-slate-800' : 'border-rose-700/80'} flex flex-col gap-1 text-xs font-mono mt-1">
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Biaya Total Restock:</span>
                <span class="text-white font-bold">${formatCurrency(totalCost)}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-400">Kas Likuid Anda:</span>
                <span class="font-bold ${canAfford ? 'text-emerald-400' : 'text-rose-400'}">${formatCurrency(app.state.cash)}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button id="btn-cancel-restock" class="h-8 px-3 text-xs text-slate-300 hover:bg-slate-800 rounded-lg cursor-pointer">Batal</button>
            <button id="btn-confirm-restock" class="h-8 px-4 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg cursor-pointer ${!canAfford ? 'opacity-40 pointer-events-none' : ''}">Konfirmasi Produksi</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-restock-modal')?.addEventListener('click', () => { modalsEl.innerHTML = ''; });
    document.getElementById('btn-cancel-restock')?.addEventListener('click', () => { modalsEl.innerHTML = ''; });
    document.getElementById('input-restock-units')?.addEventListener('input', (e) => {
      addUnits = parseInt(e.target.value, 10);
      render();
    });
    document.getElementById('btn-confirm-restock')?.addEventListener('click', () => {
      if (app.state.cash >= totalCost) {
        app.state.cash -= totalCost;
        prod.inventory = (prod.inventory || 0) + addUnits;
        soundEngine.playCashChime();
        modalsEl.innerHTML = '';
        const mainEl = document.getElementById('tycoon-main');
        if (mainEl && app.activeTab === 'products') renderProductsView(app, mainEl);
      }
    });
  };

  render();
}
