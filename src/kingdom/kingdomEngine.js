/**
 * Kingdom Idle: Reborn - Master Engine & Full-Screen Architecture
 * Supports Full-Screen Kingdom Realm, Collapsible Management Drawer,
 * Compact High-Density Strategy HUD, Procedural Web Audio, Auto-save.
 */

import {
  KingdomState,
  BUILDINGS,
  TECHNOLOGIES,
  EXPEDITIONS,
  DYNASTIC_TALENTS,
  SEASONS
} from './kingdomState.js';
import { KingdomAudio } from './kingdomAudio.js';
import { KingdomCanvas } from './kingdomCanvas.js';

export class KingdomEngine {
  constructor(container) {
    this.container = container;
    this.state = new KingdomState();
    this.audio = new KingdomAudio();
    this.canvasRenderer = null;

    this.buyMultiplier = 1;
    this.gameSpeed = 1;
    this.isDrawerOpen = true; // Collapsible management drawer
    this.activeDrawerTab = 'workers'; // 'workers' | 'buildings' | 'market' | 'research' | 'military' | 'decrees' | 'prestige' | 'stats'

    this.isRunning = false;
    this.lastFrameTime = performance.now();
    this.saveTimer = 0;
    this.uiUpdateTimer = 0;

    // Load saved game & process offline gains
    const offlineGains = this.state.load();

    // Setup DOM and Canvas
    this.renderLayout();
    this.initCanvas();
    this.bindEvents();

    if (offlineGains) {
      this.showOfflineModal(offlineGains);
    }

    // Start Simulation Loop
    this.start();
  }

  start() {
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.isRunning = false;
    this.state.save();
    if (this.canvasRenderer) {
      this.canvasRenderer.destroy();
    }
    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }
  }

  loop(now) {
    if (!this.isRunning) return;

    const rawDelta = Math.min(0.2, (now - this.lastFrameTime) / 1000);
    this.lastFrameTime = now;

    // Simulation tick with game speed multiplier
    const simDelta = rawDelta * this.gameSpeed;
    this.state.tick(simDelta);

    // Render Canvas Visualizer
    if (this.canvasRenderer) {
      this.canvasRenderer.render(simDelta);
    }

    // Update UI labels periodically (10 times per second for fluid response & minimal CPU)
    this.uiUpdateTimer += rawDelta;
    if (this.uiUpdateTimer >= 0.1) {
      this.uiUpdateTimer = 0;
      this.updateUI();
    }

    // Auto-save every 4 seconds
    this.saveTimer += rawDelta;
    if (this.saveTimer >= 4) {
      this.saveTimer = 0;
      this.state.save();
      this.flashSaveIndicator();
    }

    requestAnimationFrame(this.loop);
  }

  renderLayout() {
    this.container.className = 'w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none relative flex flex-col';
    this.container.innerHTML = `
      <!-- ================= 1. FULL-SCREEN CANVAS BACKGROUND ================= -->
      <div id="canvas-stage" class="absolute inset-0 z-0 w-full h-full overflow-hidden bg-slate-950">
        <canvas id="kingdom-canvas" class="w-full h-full block cursor-crosshair"></canvas>
      </div>

      <!-- ================= 2. COMPACT ULTRA-HIGH DENSITY TOP COMMAND BAR ================= -->
      <header class="w-full h-11 bg-slate-950/85 backdrop-blur-md border-b border-slate-700/80 px-3 flex items-center justify-between gap-2.5 z-20 shrink-0 shadow-lg">
        
        <!-- Left: Hub Exit & Kingdom Emblem Badge -->
        <div class="flex items-center gap-2 shrink-0">
          <a href="#/" id="btn-return-hub" class="px-2 py-1 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[11px] uppercase rounded border border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5">
            <span>◀</span> <span>HUB</span>
          </a>

          <div class="flex items-center gap-1.5 pl-1 border-l border-slate-800">
            <span id="header-emblem" class="text-base">👑</span>
            <span id="header-kingdom-name" class="font-extrabold text-xs text-yellow-300 cursor-pointer hover:underline truncate max-w-28" title="Klik untuk mengganti nama">
              ${this.state.name}
            </span>
            <span id="header-title-badge" class="px-1.5 py-0.2 text-[9px] font-black uppercase rounded bg-indigo-900/80 border border-indigo-400/60 text-indigo-200">
              Dusun Perintis
            </span>
            <span class="text-[10px] text-slate-400 font-mono hidden sm:inline">T-${this.state.territory}</span>
          </div>
        </div>

        <!-- Center: Compact Resource Stream (Pill format, saves maximum vertical space) -->
        <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-3xl">
          <!-- Gold -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-yellow-500/40 text-xs shrink-0" title="Kas Emas Kerajaan">
            <span>🪙</span>
            <span class="font-black text-yellow-400 font-mono" id="res-gold">0</span>
            <span class="text-[9px] text-yellow-300/70 font-mono" id="rate-gold">+0/s</span>
          </div>

          <!-- Food -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-500/40 text-xs shrink-0" title="Persediaan Pangan Rakyat">
            <span>🌾</span>
            <span class="font-black text-emerald-400 font-mono" id="res-food">0</span>
            <span class="text-[9px] font-mono" id="rate-food">+0/s</span>
          </div>

          <!-- Wood -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-amber-600/40 text-xs shrink-0" title="Kayu Penebangan">
            <span>🪵</span>
            <span class="font-black text-amber-300 font-mono" id="res-wood">0</span>
            <span class="text-[9px] text-amber-200/70 font-mono" id="rate-wood">+0/s</span>
          </div>

          <!-- Stone -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-500/40 text-xs shrink-0" title="Batu Tambang">
            <span>🪨</span>
            <span class="font-black text-slate-200 font-mono" id="res-stone">0</span>
            <span class="text-[9px] text-slate-400 font-mono" id="rate-stone">+0/s</span>
          </div>

          <!-- Iron -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-cyan-500/40 text-xs shrink-0" title="Bijih Besi">
            <span>⛏️</span>
            <span class="font-black text-cyan-300 font-mono" id="res-iron">0</span>
            <span class="text-[9px] text-cyan-200/70 font-mono" id="rate-iron">+0/s</span>
          </div>

          <!-- Tools -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-blue-500/40 text-xs shrink-0" title="Alat & Senjata Baja">
            <span>🛠️</span>
            <span class="font-black text-blue-300 font-mono" id="res-tools">0</span>
          </div>

          <!-- Faith -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-purple-500/40 text-xs shrink-0" title="Keimanan Suci">
            <span>✨</span>
            <span class="font-black text-purple-300 font-mono" id="res-faith">0</span>
          </div>

          <!-- Knowledge -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-sky-500/40 text-xs shrink-0" title="Pengetahuan Risalah">
            <span>📜</span>
            <span class="font-black text-sky-300 font-mono" id="res-knowledge">0</span>
          </div>

          <!-- Mana -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/90 border border-indigo-500/40 text-xs shrink-0" title="Mana Arcana">
            <span>🔮</span>
            <span class="font-black text-indigo-300 font-mono" id="res-mana">0</span>
          </div>

          <!-- Population -->
          <div class="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950/90 border border-indigo-500/50 text-xs shrink-0" title="Jumlah Warga & Penganggur">
            <span>👥</span>
            <span class="font-black text-indigo-200 font-mono" id="res-population">6/6</span>
            <span class="text-[10px] text-yellow-300 font-mono" id="res-idle-pop">0</span>
          </div>
        </div>

        <!-- Right: Speed, Sound, Multiplier & Fullscreen Toggle -->
        <div class="flex items-center gap-1.5 shrink-0">
          <!-- Multiplier -->
          <div class="flex items-center bg-slate-900 rounded p-0.5 border border-slate-700 text-[10px] font-bold">
            <button class="buy-mult-btn px-1.5 py-0.5 rounded ${this.buyMultiplier === 1 ? 'bg-yellow-400 text-black' : 'text-slate-400'}" data-mult="1">1x</button>
            <button class="buy-mult-btn px-1.5 py-0.5 rounded ${this.buyMultiplier === 5 ? 'bg-yellow-400 text-black' : 'text-slate-400'}" data-mult="5">5x</button>
            <button class="buy-mult-btn px-1.5 py-0.5 rounded ${this.buyMultiplier === 25 ? 'bg-yellow-400 text-black' : 'text-slate-400'}" data-mult="25">25x</button>
            <button class="buy-mult-btn px-1.5 py-0.5 rounded ${this.buyMultiplier === 100 ? 'bg-yellow-400 text-black' : 'text-slate-400'}" data-mult="100">100x</button>
          </div>

          <!-- Game Speed -->
          <div class="flex items-center bg-slate-900 rounded p-0.5 border border-slate-700 text-[10px] font-bold">
            <button id="btn-speed-1" class="px-1.5 py-0.5 rounded ${this.gameSpeed === 1 ? 'bg-amber-500 text-black' : 'text-slate-400'}">1x</button>
            <button id="btn-speed-2" class="px-1.5 py-0.5 rounded ${this.gameSpeed === 2 ? 'bg-amber-500 text-black' : 'text-slate-400'}">2x</button>
            <button id="btn-speed-5" class="px-1.5 py-0.5 rounded ${this.gameSpeed === 5 ? 'bg-amber-500 text-black' : 'text-slate-400'}">5x</button>
          </div>

          <!-- Audio Toggle -->
          <button id="btn-toggle-sound" class="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-xs cursor-pointer" title="Suara">
            🔊
          </button>

          <!-- Fullscreen Realm Toggle Button -->
          <button id="btn-toggle-fullscreen-realm" class="px-2 py-1 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-[11px] border border-indigo-400 flex items-center gap-1 cursor-pointer shadow" title="Layar Penuh (F)">
            <span id="fs-icon">⛶</span>
            <span id="fs-label" class="hidden sm:inline">Peta Penuh</span>
          </button>

          <!-- Save dot indicator -->
          <span id="save-dot" class="w-2 h-2 rounded-full bg-emerald-500" title="Tersimpan otomatis"></span>
        </div>
      </header>

      <!-- ================= 3. FLOATING WEATHER & SEASON BADGE ================= -->
      <div class="absolute top-13 left-3 z-10 flex items-center gap-2 bg-slate-950/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-700 text-xs pointer-events-auto shadow-md">
        <span id="header-season-icon" class="text-base">🌸</span>
        <div class="flex items-center gap-1.5">
          <span id="header-season-name" class="font-bold text-emerald-400 text-xs">Musim Semi</span>
          <span id="header-season-timer" class="text-[10px] font-mono text-slate-400">45s</span>
        </div>
        <span class="text-slate-600">|</span>
        <span id="header-season-desc" class="text-[10px] text-slate-300 hidden md:inline">+25% Pangan</span>
      </div>

      <!-- ================= 4. COLLAPSIBLE RIGHT MANAGEMENT DRAWER ================= -->
      <aside id="management-drawer" class="absolute top-11 right-0 bottom-14 z-20 w-[440px] max-w-[95vw] bg-slate-900/95 backdrop-blur-xl border-l-2 border-slate-700/80 flex flex-col shadow-2xl transition-transform duration-300 ease-out translate-x-0">
        
        <!-- Drawer Top Tab Header (Internal Navigation) -->
        <div class="w-full bg-slate-950/90 border-b border-slate-800 px-2 py-1.5 flex items-center justify-between gap-1 shrink-0 overflow-x-auto scrollbar-none">
          <div class="flex items-center gap-1">
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'workers' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="workers">
              👥 Pekerja
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'buildings' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="buildings">
              🏗️ Gedung
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'military' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="military">
              ⚔️ Militer
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'market' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="market">
              ⚖️ Bursa
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'research' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="research">
              🔬 Riset
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'decrees' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="decrees">
              📜 Dekrit
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'prestige' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="prestige">
              👑 Tahta
            </button>
            <button class="drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${this.activeDrawerTab === 'stats' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}" data-tab="stats">
              ⚙️
            </button>
          </div>

          <!-- Close Drawer Button -->
          <button id="btn-close-drawer" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-xs cursor-pointer ml-1" title="Tutup Panel (F)">
            ✕
          </button>
        </div>

        <!-- Drawer Content Body (Scrollable, High Information Density) -->
        <div id="drawer-body" class="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <!-- Dynamically populated by renderDrawerContent() -->
        </div>
      </aside>

      <!-- ================= 5. FLOATING QUICK-ACTION BOTTOM DOCK ================= -->
      <footer class="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
        <!-- Big Harvest Button -->
        <button id="btn-dock-harvest" class="px-4 py-2 bg-[#FFE500] hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl border border-black shadow-[2px_2px_0px_0px_#000] flex items-center gap-1.5 cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0">
          <span>⚡</span> <span>PANEN REALM [SPACE]</span>
        </button>

        <span class="w-[1px] h-6 bg-slate-700 mx-1"></span>

        <!-- Tab Toggle Buttons -->
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all cursor-pointer flex items-center gap-1" data-tab="workers">
          <span>👥</span> <span class="hidden md:inline">Pekerja</span>
        </button>
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all cursor-pointer flex items-center gap-1" data-tab="buildings">
          <span>🏗️</span> <span class="hidden md:inline">Gedung</span>
        </button>
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all cursor-pointer flex items-center gap-1" data-tab="military">
          <span>⚔️</span> <span class="hidden md:inline">Garnisun</span>
        </button>
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all cursor-pointer flex items-center gap-1" data-tab="market">
          <span>⚖️</span> <span class="hidden md:inline">Bursa</span>
        </button>
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all cursor-pointer flex items-center gap-1" data-tab="research">
          <span>🔬</span> <span class="hidden md:inline">Riset</span>
        </button>
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/90 transition-all cursor-pointer flex items-center gap-1" data-tab="decrees">
          <span>📜</span> <span class="hidden md:inline">Dekrit</span>
        </button>
        <button class="dock-tab-btn px-2.5 py-1.5 rounded-xl text-xs font-bold text-yellow-300 hover:text-yellow-200 hover:bg-amber-950/60 transition-all cursor-pointer flex items-center gap-1" data-tab="prestige">
          <span>👑</span> <span class="hidden md:inline">Tahta</span>
        </button>

        <span class="w-[1px] h-6 bg-slate-700 mx-1"></span>

        <!-- Drawer Toggle Quick Button -->
        <button id="btn-toggle-drawer" class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer flex items-center gap-1">
          <span id="dock-drawer-icon">◀</span> <span class="hidden sm:inline">Panel</span>
        </button>
      </footer>

      <!-- ================= 6. MODAL CONTAINER ================= -->
      <div id="modal-container" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4"></div>
    `;

    this.renderDrawerContent();
  }

  initCanvas() {
    const canvas = document.getElementById('kingdom-canvas');
    if (canvas) {
      this.canvasRenderer = new KingdomCanvas(canvas, this.state, this.audio);
    }
  }

  // Toggle Drawer Open / Close
  toggleDrawer(open) {
    if (typeof open === 'boolean') {
      this.isDrawerOpen = open;
    } else {
      this.isDrawerOpen = !this.isDrawerOpen;
    }

    const drawer = document.getElementById('management-drawer');
    const dockIcon = document.getElementById('dock-drawer-icon');
    const fsIcon = document.getElementById('fs-icon');
    const fsLabel = document.getElementById('fs-label');

    if (drawer) {
      if (this.isDrawerOpen) {
        drawer.style.transform = 'translateX(0)';
        if (dockIcon) dockIcon.textContent = '▶';
        if (fsIcon) fsIcon.textContent = '⛶';
        if (fsLabel) fsLabel.textContent = 'Peta Penuh';
      } else {
        drawer.style.transform = 'translateX(105%)';
        if (dockIcon) dockIcon.textContent = '◀';
        if (fsIcon) fsIcon.textContent = '🗔';
        if (fsLabel) fsLabel.textContent = 'Buka Panel';
      }
    }
  }

  // Render Internal Tab Content inside the Collapsible Drawer
  renderDrawerContent() {
    const body = document.getElementById('drawer-body');
    if (!body) return;

    if (this.activeDrawerTab === 'workers') {
      body.innerHTML = this.getWorkersHTML();
    } else if (this.activeDrawerTab === 'buildings') {
      body.innerHTML = this.getBuildingsHTML();
    } else if (this.activeDrawerTab === 'military') {
      body.innerHTML = this.getMilitaryHTML();
    } else if (this.activeDrawerTab === 'market') {
      body.innerHTML = this.getMarketHTML();
    } else if (this.activeDrawerTab === 'research') {
      body.innerHTML = this.getResearchHTML();
    } else if (this.activeDrawerTab === 'decrees') {
      body.innerHTML = this.getDecreesHTML();
    } else if (this.activeDrawerTab === 'prestige') {
      body.innerHTML = this.getPrestigeHTML();
    } else if (this.activeDrawerTab === 'stats') {
      body.innerHTML = this.getStatsHTML();
    }

    this.bindDrawerActions();
  }

  getWorkersHTML() {
    const w = this.state.workers;
    const idle = this.state.getIdleWorkers();

    const workerDefs = [
      { id: 'farmer', name: 'Petani Gandum & Ternak', icon: '🌾', count: w.farmer || 0, rate: '+2.2 🌾/s', desc: 'Mencegah kelaparan rakyat' },
      { id: 'woodcutter', name: 'Penebang Kayu', icon: '🪵', count: w.woodcutter || 0, rate: '+1.8 🪵/s', desc: 'Bahan bangunan & gubuk' },
      { id: 'quarryman', name: 'Penambang Batu', icon: '🪨', count: w.quarryman || 0, rate: '+1.4 🪨/s', desc: 'Fondasi benteng & dinding' },
      { id: 'miner', name: 'Penambang Besi', icon: '⛏️', count: w.miner || 0, rate: '+1.0 ⛓️/s', desc: 'Dilebur jadi senjata & alat' },
      { id: 'blacksmith', name: 'Pandai Besi', icon: '🛠️', count: w.blacksmith || 0, rate: '+0.5 🛠️/s', desc: 'Olahan Besi & Kayu baja' },
      { id: 'merchant', name: 'Pedagang & Retribusi', icon: '💰', count: w.merchant || 0, rate: '+2.5 🪙/s', desc: 'Pajak & karavan pasar' },
      { id: 'scholar', name: 'Cendekiawan', icon: '📜', count: w.scholar || 0, rate: '+1.2 📜/s', desc: 'Riset teknologi risalah' },
      { id: 'priest', name: 'Biarawan Kuil', icon: '✨', count: w.priest || 0, rate: '+1.5 ✨/s', desc: 'Keimanan & berkah suci' }
    ];

    return `
      <div class="flex flex-col gap-2">
        <!-- Top Compact Pop Bar -->
        <div class="bg-indigo-950/70 p-2 rounded-lg border border-indigo-500/40 flex items-center justify-between text-xs">
          <div>
            <span class="font-bold text-indigo-300">Total Warga:</span>
            <b class="text-white">${this.state.population} / ${this.state.getMaxPopulation()}</b>
            <span class="ml-2 text-slate-400">Bebas: <b class="text-yellow-400" id="tab-idle-workers">${idle}</b></span>
          </div>
          <button id="btn-unassign-all" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-slate-700 cursor-pointer">
            Kosongkan
          </button>
        </div>

        <!-- Worker Rows -->
        <div class="flex flex-col gap-1.5">
          ${workerDefs.map(def => `
            <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800/90 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-lg">${def.icon}</span>
                <div class="leading-tight">
                  <div class="text-xs font-bold text-slate-200">${def.name}</div>
                  <div class="text-[10px] text-slate-400 font-mono">${def.rate} • ${def.desc}</div>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button class="worker-btn-sub w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer text-slate-200" data-worker="${def.id}">-</button>
                <span class="w-7 text-center font-mono font-bold text-xs text-yellow-400" id="worker-count-${def.id}">${def.count}</span>
                <button class="worker-btn-add w-6 h-6 rounded bg-indigo-700 hover:bg-indigo-600 text-xs font-bold flex items-center justify-center cursor-pointer text-white" data-worker="${def.id}">+</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getBuildingsHTML() {
    const list = Object.values(BUILDINGS);

    return `
      <div class="flex flex-col gap-1.5">
        <div class="text-[10px] text-slate-400 flex items-center justify-between mb-0.5">
          <span>Bangunan berkembang visual tiap level</span>
          <span class="text-yellow-400 font-mono font-bold">Qty: ${this.buyMultiplier}x</span>
        </div>

        <div class="flex flex-col gap-1.5">
          ${list.map(b => {
            const count = this.state.buildings[b.id] || 0;
            const cost = this.state.getBuildingCost(b.id);
            const canAfford = this.state.canAfford(cost);

            const costStr = Object.entries(cost)
              .map(([res, val]) => `${val}${this.getResourceIcon(res)}`)
              .join(' ');

            return `
              <div class="bg-slate-950/80 p-2 rounded-lg border ${canAfford ? 'border-slate-800 hover:border-slate-700' : 'border-slate-900/60 opacity-75'} flex items-center justify-between gap-2">
                <div class="flex-1 leading-tight">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-200">${b.name}</span>
                    <span class="px-1.5 py-0.2 rounded bg-indigo-950 border border-indigo-500/40 text-[9px] text-indigo-300 font-mono font-bold">Lvl ${count}</span>
                  </div>
                  <div class="text-[9px] text-slate-400 mt-0.5">${b.desc}</div>
                  <div class="text-[10px] text-amber-300 font-mono mt-0.5">${costStr}</div>
                </div>
                <button class="buy-building-btn px-2.5 py-1 rounded-lg text-xs font-black uppercase shrink-0 ${canAfford ? 'bg-yellow-400 hover:bg-yellow-300 text-black shadow cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}" data-building="${b.id}" ${canAfford ? '' : 'disabled'}>
                  +${this.buyMultiplier}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  getMilitaryHTML() {
    const power = this.state.getMilitaryPower();
    const count = this.state.getCurrentTroopCount();
    const maxMil = this.state.getMaxGarrison();

    const troopTypes = [
      { id: 'militia', name: 'Milisi Rakyat', icon: '🗡️', cost: { food: 20, wood: 15, gold: 10 }, power: 5 },
      { id: 'archer', name: 'Pemanah Elit', icon: '🏹', cost: { food: 40, wood: 50, tools: 2, gold: 25 }, power: 12 },
      { id: 'knight', name: 'Ksatria Zirah Besi', icon: '🛡️', cost: { food: 90, iron: 40, tools: 5, gold: 80 }, power: 35 },
      { id: 'trebuchet', name: 'Ketapel Tempur', icon: '☄️', cost: { wood: 150, stone: 80, tools: 8, gold: 120 }, power: 80 }
    ];

    return `
      <div class="flex flex-col gap-2">
        <!-- Garrison Power Banner -->
        <div class="bg-red-950/60 p-2 rounded-lg border border-red-600/40 flex items-center justify-between text-xs">
          <div>
            <div class="font-black text-red-300 uppercase">Kekuatan Garnisun</div>
            <div class="text-[10px] text-slate-400">Kapasitas: <b class="text-yellow-400">${count}</b> / ${maxMil}</div>
          </div>
          <span class="px-2 py-1 rounded bg-red-900 border border-red-400 font-black text-white text-xs font-mono">
            ⚡ ${power} POWER
          </span>
        </div>

        <!-- Troop Recruitment -->
        <div class="grid grid-cols-2 gap-1.5">
          ${troopTypes.map(tr => {
            const owned = this.state.troops[tr.id] || 0;
            const canAfford = this.state.canAfford(tr.cost) && (count < maxMil);
            const costStr = Object.entries(tr.cost).map(([res, val]) => `${val}${this.getResourceIcon(res)}`).join(' ');

            return `
              <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
                <div>
                  <div class="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span>${tr.icon} ${tr.name}</span>
                    <span class="text-yellow-400 font-mono">(${owned})</span>
                  </div>
                  <div class="text-[9px] text-amber-300 font-mono mt-0.5">${costStr}</div>
                </div>
                <button class="recruit-troop-btn w-full py-1 rounded text-[11px] font-bold ${canAfford ? 'bg-red-700 hover:bg-red-600 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}" data-troop="${tr.id}" ${canAfford ? '' : 'disabled'}>
                  Latih (+${tr.power} Pwr)
                </button>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Expeditions List -->
        <div class="text-[10px] font-bold text-slate-400 mt-1">Ekspedisi Wilayah:</div>
        <div class="flex flex-col gap-1.5">
          ${EXPEDITIONS.map(exp => {
            const isRunning = this.state.activeExpeditions.some(e => e.id === exp.id);
            const activeExp = this.state.activeExpeditions.find(e => e.id === exp.id);
            const canLaunch = power >= exp.powerReq && !isRunning;

            return `
              <div class="bg-slate-950/80 p-2 rounded-lg border ${isRunning ? 'border-amber-500/50' : 'border-slate-800'} flex flex-col gap-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="font-bold text-slate-200">${exp.icon} ${exp.name}</span>
                  <span class="text-[10px] font-mono text-red-300">Req ${exp.powerReq}</span>
                </div>
                <div class="text-[9px] text-slate-400 leading-none">${exp.desc}</div>

                ${isRunning ? `
                  <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-0.5">
                    <div class="bg-amber-400 h-full transition-all duration-200" style="width: ${(activeExp.elapsed / activeExp.duration) * 100}%"></div>
                  </div>
                  <div class="text-[9px] text-amber-400 font-mono text-right">Berjalan (${Math.ceil(activeExp.duration - activeExp.elapsed)}s)</div>
                ` : `
                  <button class="launch-expedition-btn w-full py-1 rounded text-[11px] font-bold mt-0.5 ${canLaunch ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}" data-exp="${exp.id}" ${canLaunch ? '' : 'disabled'}>
                    Luncurkan (${exp.duration}s)
                  </button>
                `}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  getMarketHTML() {
    return `
      <div class="flex flex-col gap-2">
        <div class="text-[10px] text-slate-400">Bursa barter komoditas kerajaan</div>
        <div class="grid grid-cols-2 gap-1.5">
          <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
            <div class="text-xs font-bold text-emerald-400">Jual 50 Pangan 🌾</div>
            <div class="text-[10px] text-yellow-300 font-mono">+25 Emas 🪙</div>
            <button class="market-trade-btn py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold cursor-pointer" data-trade="sellFood">Jual</button>
          </div>

          <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
            <div class="text-xs font-bold text-yellow-400">Beli 50 Pangan 🌾</div>
            <div class="text-[10px] text-slate-400 font-mono">Biaya 30 Emas 🪙</div>
            <button class="market-trade-btn py-1 rounded bg-slate-800 hover:bg-slate-700 text-yellow-400 text-[11px] font-bold cursor-pointer" data-trade="buyFood">Beli</button>
          </div>

          <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
            <div class="text-xs font-bold text-amber-400">Jual 50 Kayu 🪵</div>
            <div class="text-[10px] text-yellow-300 font-mono">+20 Emas 🪙</div>
            <button class="market-trade-btn py-1 rounded bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-bold cursor-pointer" data-trade="sellWood">Jual</button>
          </div>

          <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
            <div class="text-xs font-bold text-yellow-400">Beli 50 Kayu 🪵</div>
            <div class="text-[10px] text-slate-400 font-mono">Biaya 25 Emas 🪙</div>
            <button class="market-trade-btn py-1 rounded bg-slate-800 hover:bg-slate-700 text-yellow-400 text-[11px] font-bold cursor-pointer" data-trade="buyWood">Beli</button>
          </div>

          <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
            <div class="text-xs font-bold text-slate-300">Jual 50 Batu 🪨</div>
            <div class="text-[10px] text-yellow-300 font-mono">+30 Emas 🪙</div>
            <button class="market-trade-btn py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-bold cursor-pointer" data-trade="sellStone">Jual</button>
          </div>

          <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex flex-col justify-between gap-1">
            <div class="text-xs font-bold text-cyan-400">Beli 20 Besi ⛏️</div>
            <div class="text-[10px] text-slate-400 font-mono">Biaya 40 Emas 🪙</div>
            <button class="market-trade-btn py-1 rounded bg-cyan-800 hover:bg-cyan-700 text-white text-[11px] font-bold cursor-pointer" data-trade="buyIron">Beli</button>
          </div>
        </div>
      </div>
    `;
  }

  getResearchHTML() {
    return `
      <div class="flex flex-col gap-1.5">
        <div class="text-[10px] text-slate-400 mb-0.5">Riset Pengetahuan Kerajaan</div>
        <div class="flex flex-col gap-1.5">
          ${TECHNOLOGIES.map(t => {
            const isDone = this.state.researchedTechs.includes(t.id);
            const canAfford = this.state.knowledge >= t.cost;

            return `
              <div class="bg-slate-950/80 p-2 rounded-lg border ${isDone ? 'border-emerald-600/50 bg-emerald-950/20' : 'border-slate-800'} flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-xl">${t.icon}</span>
                  <div class="leading-tight">
                    <div class="text-xs font-bold ${isDone ? 'text-emerald-400' : 'text-slate-200'}">${t.name}</div>
                    <div class="text-[9px] text-slate-400">${t.desc}</div>
                    ${!isDone ? `<div class="text-[9px] text-sky-400 font-mono">${t.cost} 📜 Pengetahuan</div>` : ''}
                  </div>
                </div>
                ${!isDone ? `
                  <button class="research-tech-btn px-2.5 py-1 rounded text-[11px] font-bold shrink-0 ${canAfford ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}" data-tech="${t.id}" ${canAfford ? '' : 'disabled'}>
                    Riset
                  </button>
                ` : `<span class="text-emerald-400 text-xs font-bold shrink-0">Aktif</span>`}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  getDecreesHTML() {
    return `
      <div class="flex flex-col gap-2">
        <div class="text-[10px] text-slate-400">Aktifkan kebijakan darurat & mandat suci</div>
        <div class="grid grid-cols-1 gap-2">
          <!-- Harvest Feast -->
          <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-emerald-400">🌾 Pesta Panen Raya</div>
              <div class="text-[10px] text-slate-400">+100% Pangan selama 45s (Biaya 25 Keimanan)</div>
              <div class="text-[9px] text-yellow-400 font-mono mt-0.5" id="timer-decree-harvest">Siap</div>
            </div>
            <button class="decree-btn px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer" data-decree="harvest">
              Gelar
            </button>
          </div>

          <!-- Conscription -->
          <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-red-400">⚔️ Mobilisasi Perang</div>
              <div class="text-[10px] text-slate-400">+25% Power Militer selama 60s (Biaya 50 Emas)</div>
              <div class="text-[9px] text-yellow-400 font-mono mt-0.5" id="timer-decree-conscription">Siap</div>
            </div>
            <button class="decree-btn px-3 py-1.5 rounded bg-red-700 hover:bg-red-600 text-white font-bold text-xs cursor-pointer" data-decree="conscription">
              Gelar
            </button>
          </div>

          <!-- Free Trade -->
          <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-yellow-400">💰 Pakta Dagang Bebas</div>
              <div class="text-[10px] text-slate-400">+150% Emas Pajak & Pasar selama 60s (Biaya 40 Kayu)</div>
              <div class="text-[9px] text-yellow-400 font-mono mt-0.5" id="timer-decree-freeTrade">Siap</div>
            </div>
            <button class="decree-btn px-3 py-1.5 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs cursor-pointer" data-decree="freeTrade">
              Gelar
            </button>
          </div>

          <!-- Chrono Warp -->
          <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs font-bold text-indigo-400">🔮 Percepatan Arcana</div>
              <div class="text-[10px] text-slate-400">Simulasi 5x lebih cepat selama 20s (Biaya 30 Mana)</div>
              <div class="text-[9px] text-yellow-400 font-mono mt-0.5" id="timer-decree-chronoWarp">Siap</div>
            </div>
            <button class="decree-btn px-3 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs cursor-pointer" data-decree="chronoWarp">
              Gelar
            </button>
          </div>
        </div>
      </div>
    `;
  }

  getPrestigeHTML() {
    const renownGain = this.state.calculateAscensionRenown();

    return `
      <div class="flex flex-col gap-2">
        <div class="bg-amber-950/60 p-2.5 rounded-lg border border-amber-500/40 text-center">
          <div class="text-xs font-black uppercase text-yellow-300">👑 KENAIKAN TAHTA & MAHKOTA</div>
          <div class="text-xs text-slate-300 mt-1">Kemasyhuran Dinasti: <b class="text-yellow-400 font-mono text-sm">${this.state.royalRenown}</b> Renown</div>
          <button id="btn-ascend-coronation" class="w-full mt-2 py-1.5 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border border-black shadow cursor-pointer">
            👑 NOBATKAN TAHTA (+${renownGain} Renown)
          </button>
        </div>

        <div class="text-[10px] font-bold text-slate-400 mt-1">Bakat Dinasti Permanen:</div>
        <div class="flex flex-col gap-1.5">
          ${DYNASTIC_TALENTS.map(t => {
            const currentRank = this.state.dynasticTalents[t.id] || 0;
            const cost = t.costPerRank;
            const canAfford = this.state.royalRenown >= cost && currentRank < t.maxRank;

            return `
              <div class="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <span class="text-lg">${t.icon}</span>
                  <div>
                    <div class="text-xs font-bold text-slate-200">${t.name} <span class="text-yellow-400 font-mono">(${currentRank}/${t.maxRank})</span></div>
                    <div class="text-[9px] text-slate-400">${t.desc}</div>
                  </div>
                </div>
                ${currentRank < t.maxRank ? `
                  <button class="upgrade-talent-btn px-2.5 py-1 rounded text-xs font-bold shrink-0 ${canAfford ? 'bg-yellow-500 hover:bg-yellow-400 text-black cursor-pointer font-black' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}" data-talent="${t.id}" ${canAfford ? '' : 'disabled'}>
                    +1 (${cost} ⚜️)
                  </button>
                ` : `<span class="text-yellow-400 text-xs font-bold shrink-0">Maks</span>`}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  getStatsHTML() {
    const s = this.state.stats;
    const playMinutes = Math.floor(this.state.totalPlaytime / 60);

    return `
      <div class="flex flex-col gap-2">
        <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-300 flex flex-col gap-1">
          <div class="font-bold text-yellow-300 mb-1">Statistik Kerajaan</div>
          <div class="flex justify-between"><span>Waktu Bermain:</span> <b class="font-mono">${playMinutes} m</b></div>
          <div class="flex justify-between"><span>Total Emas Dihasilkan:</span> <b class="font-mono text-yellow-400">${Math.floor(s.totalGoldCollected)} 🪙</b></div>
          <div class="flex justify-between"><span>Ekspedisi Menang:</span> <b class="font-mono text-emerald-400">${s.totalExpeditionsWon}</b></div>
          <div class="flex justify-between"><span>Total Warga Lahir:</span> <b class="font-mono text-indigo-300">${s.totalCitizensBorn}</b></div>
          <div class="flex justify-between"><span>Klik Panen:</span> <b class="font-mono text-slate-400">${s.manualClicks}x</b></div>
        </div>

        <div class="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 flex flex-col gap-1.5">
          <div class="text-xs font-bold text-slate-300">Penyimpanan & Cadangan</div>
          <button id="btn-manual-save" class="w-full py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer">
            💾 Simpan Sekarang
          </button>
          <button id="btn-export-save" class="w-full py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer">
            📋 Ekspor Simpanan (JSON)
          </button>
          <button id="btn-import-save" class="w-full py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer">
            📥 Impor Simpanan
          </button>
          <button id="btn-reset-save" class="w-full py-1 rounded bg-red-950 hover:bg-red-900 text-red-300 text-xs font-bold border border-red-800 cursor-pointer mt-1">
            ⚠️ Hapus & Mulai Ulang
          </button>
        </div>
      </div>
    `;
  }

  updateUI() {
    const s = this.state;
    const rates = s.getRates();
    const title = s.getTitleInfo();

    this.setText('header-title-badge', title.title);
    this.setText('header-emblem', title.emblem);

    const season = SEASONS[s.seasonIndex] || SEASONS[0];
    this.setText('header-season-icon', season.icon);
    this.setText('header-season-name', season.name);
    this.setText('header-season-desc', season.desc);
    this.setText('header-season-timer', `${Math.ceil(s.seasonDuration - s.seasonTimer)}s`);

    this.setText('res-gold', this.formatNum(s.gold));
    this.setText('rate-gold', `+${rates.gold.toFixed(1)}/s`);

    this.setText('res-food', this.formatNum(s.food));
    const foodRateEl = document.getElementById('rate-food');
    if (foodRateEl) {
      foodRateEl.textContent = `${rates.food >= 0 ? '+' : ''}${rates.food.toFixed(1)}/s`;
      foodRateEl.className = rates.food >= 0 ? 'text-[9px] text-emerald-300 font-mono' : 'text-[9px] text-red-400 font-mono animate-pulse';
    }

    this.setText('res-wood', this.formatNum(s.wood));
    this.setText('rate-wood', `+${rates.wood.toFixed(1)}/s`);

    this.setText('res-stone', this.formatNum(s.stone));
    this.setText('rate-stone', `+${rates.stone.toFixed(1)}/s`);

    this.setText('res-iron', this.formatNum(s.iron));
    this.setText('rate-iron', `+${rates.iron.toFixed(1)}/s`);

    this.setText('res-tools', this.formatNum(s.tools));
    this.setText('res-faith', this.formatNum(s.faith));
    this.setText('res-knowledge', this.formatNum(s.knowledge));
    this.setText('res-mana', this.formatNum(s.mana));

    this.setText('res-population', `${s.population}/${s.getMaxPopulation()}`);
    this.setText('res-idle-pop', s.getIdleWorkers());

    // Update Decrees countdown
    ['harvest', 'conscription', 'freeTrade', 'chronoWarp'].forEach(decId => {
      const el = document.getElementById(`timer-decree-${decId}`);
      if (!el) return;
      if (s.isDecreeActive(decId)) {
        el.textContent = `Aktif (${Math.ceil(s.activeDecrees[decId])}s)`;
        el.className = 'text-[9px] text-emerald-400 font-mono mt-0.5 font-bold animate-pulse';
      } else {
        el.textContent = 'Siap';
        el.className = 'text-[9px] text-yellow-400 font-mono mt-0.5';
      }
    });
  }

  formatNum(num) {
    const n = Math.floor(num || 0);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 10000) return (n / 1000).toFixed(1) + 'k';
    return n.toLocaleString();
  }

  setText(id, val) {
    const el = document.getElementById(id);
    if (el && el.textContent !== String(val)) {
      el.textContent = String(val);
    }
  }

  flashSaveIndicator() {
    const dot = document.getElementById('save-dot');
    if (!dot) return;
    dot.className = 'w-2 h-2 rounded-full bg-yellow-400 scale-125 transition-all';
    setTimeout(() => {
      dot.className = 'w-2 h-2 rounded-full bg-emerald-500 transition-all';
    }, 400);
  }

  bindEvents() {
    // Return to game center button
    document.getElementById('btn-return-hub')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.state.save();
      window.navigateTo('/');
    });

    // Rename kingdom
    document.getElementById('header-kingdom-name')?.addEventListener('click', () => {
      const newName = prompt('Beri nama baru untuk kerajaan Anda:', this.state.name);
      if (newName && newName.trim().length > 0) {
        this.state.name = newName.trim().slice(0, 24);
        this.setText('header-kingdom-name', this.state.name);
        this.state.save();
      }
    });

    // Toggle Drawer Open / Close Buttons
    document.getElementById('btn-toggle-fullscreen-realm')?.addEventListener('click', () => {
      this.toggleDrawer();
      this.audio.playClick();
    });
    document.getElementById('btn-toggle-drawer')?.addEventListener('click', () => {
      this.toggleDrawer();
      this.audio.playClick();
    });
    document.getElementById('btn-close-drawer')?.addEventListener('click', () => {
      this.toggleDrawer(false);
      this.audio.playClick();
    });

    // Bottom Dock Harvest Button
    document.getElementById('btn-dock-harvest')?.addEventListener('click', () => {
      const canvas = document.getElementById('kingdom-canvas');
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        canvas.dispatchEvent(new MouseEvent('click', {
          clientX: rect.left + rect.width / 2,
          clientY: rect.top + rect.height / 2
        }));
      }
    });

    // Bottom Dock Tabs -> opens drawer to that specific tab!
    document.querySelectorAll('.dock-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        if (this.isDrawerOpen && this.activeDrawerTab === targetTab) {
          // If already open to this tab, toggle closed
          this.toggleDrawer(false);
        } else {
          this.activeDrawerTab = targetTab;
          this.toggleDrawer(true);
          this.updateDrawerTabsUI();
          this.renderDrawerContent();
        }
        this.audio.playClick();
      });
    });

    // Drawer Tabs (Internal Navigation)
    document.querySelectorAll('.drawer-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeDrawerTab = btn.dataset.tab;
        this.updateDrawerTabsUI();
        this.renderDrawerContent();
        this.audio.playClick();
      });
    });

    // Multipliers
    document.querySelectorAll('.buy-mult-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.buyMultiplier = parseInt(btn.dataset.mult, 10) || 1;
        document.querySelectorAll('.buy-mult-btn').forEach(b => {
          b.className = `buy-mult-btn px-1.5 py-0.5 rounded ${parseInt(b.dataset.mult, 10) === this.buyMultiplier ? 'bg-yellow-400 text-black' : 'text-slate-400'}`;
        });
        this.renderDrawerContent();
        this.audio.playClick();
      });
    });

    // Speeds
    const setSpeed = (spd) => {
      this.gameSpeed = spd;
      [1, 2, 5].forEach(s => {
        const b = document.getElementById(`btn-speed-${s}`);
        if (b) b.className = `px-1.5 py-0.5 rounded ${this.gameSpeed === s ? 'bg-amber-500 text-black' : 'text-slate-400'}`;
      });
      this.audio.playClick();
    };
    document.getElementById('btn-speed-1')?.addEventListener('click', () => setSpeed(1));
    document.getElementById('btn-speed-2')?.addEventListener('click', () => setSpeed(2));
    document.getElementById('btn-speed-5')?.addEventListener('click', () => setSpeed(5));

    // Audio Mute
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      const b = document.getElementById('btn-toggle-sound');
      if (b) b.textContent = isMuted ? '🔇' : '🔊';
    });

    // Global Hotkeys
    this.handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        document.getElementById('btn-dock-harvest')?.click();
      } else if (e.key.toLowerCase() === 'f') {
        this.toggleDrawer();
      } else if (e.key === '1') {
        document.querySelector('.buy-mult-btn[data-mult="1"]')?.click();
      } else if (e.key === '2') {
        document.querySelector('.buy-mult-btn[data-mult="5"]')?.click();
      } else if (e.key === '3') {
        document.querySelector('.buy-mult-btn[data-mult="25"]')?.click();
      } else if (e.key === '4') {
        document.querySelector('.buy-mult-btn[data-mult="100"]')?.click();
      } else if (e.key.toLowerCase() === 'q') {
        document.querySelector('.dock-tab-btn[data-tab="workers"]')?.click();
      } else if (e.key.toLowerCase() === 'w') {
        document.querySelector('.dock-tab-btn[data-tab="buildings"]')?.click();
      } else if (e.key.toLowerCase() === 'e') {
        document.querySelector('.dock-tab-btn[data-tab="military"]')?.click();
      } else if (e.key.toLowerCase() === 'r') {
        document.querySelector('.dock-tab-btn[data-tab="market"]')?.click();
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);

    window.addEventListener('beforeunload', () => {
      this.state.save();
    });
  }

  updateDrawerTabsUI() {
    document.querySelectorAll('.drawer-tab-btn').forEach(tb => {
      const isActive = tb.dataset.tab === this.activeDrawerTab;
      tb.className = `drawer-tab-btn px-2 py-1 rounded text-xs font-bold cursor-pointer transition-colors ${isActive ? (tb.dataset.tab === 'military' ? 'bg-red-600 text-white shadow' : (tb.dataset.tab === 'prestige' ? 'bg-amber-600 text-white shadow' : 'bg-indigo-600 text-white shadow')) : 'text-slate-400 hover:text-white'}`;
    });
  }

  bindDrawerActions() {
    // Workers Add / Sub
    document.querySelectorAll('.worker-btn-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const workerId = btn.dataset.worker;
        const idle = this.state.getIdleWorkers();
        if (idle > 0) {
          const toAdd = Math.min(idle, this.buyMultiplier);
          this.state.workers[workerId] = (this.state.workers[workerId] || 0) + toAdd;
          this.audio.playClick();
          this.renderDrawerContent();
        }
      });
    });

    document.querySelectorAll('.worker-btn-sub').forEach(btn => {
      btn.addEventListener('click', () => {
        const workerId = btn.dataset.worker;
        const current = this.state.workers[workerId] || 0;
        if (current > 0) {
          const toSub = Math.min(current, this.buyMultiplier);
          this.state.workers[workerId] -= toSub;
          this.audio.playClick();
          this.renderDrawerContent();
        }
      });
    });

    document.getElementById('btn-unassign-all')?.addEventListener('click', () => {
      Object.keys(this.state.workers).forEach(k => {
        this.state.workers[k] = 0;
      });
      this.audio.playClick();
      this.renderDrawerContent();
    });

    // Building Purchases
    document.querySelectorAll('.buy-building-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const buildingId = btn.dataset.building;
        const bought = this.state.buyBuilding(buildingId, this.buyMultiplier);
        if (bought > 0) {
          this.audio.playHammer();
          this.renderDrawerContent();
        }
      });
    });

    // Market Exchanges
    document.querySelectorAll('.market-trade-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tradeType = btn.dataset.trade;
        this.executeMarketTrade(tradeType);
      });
    });

    // Research Tech
    document.querySelectorAll('.research-tech-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const techId = btn.dataset.tech;
        const techDef = TECHNOLOGIES.find(t => t.id === techId);
        if (techDef && this.state.knowledge >= techDef.cost) {
          this.state.knowledge -= techDef.cost;
          this.state.researchedTechs.push(techId);
          this.audio.playFanfare();
          this.renderDrawerContent();
        }
      });
    });

    // Decrees
    document.querySelectorAll('.decree-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const dec = btn.dataset.decree;
        this.activateDecree(dec);
      });
    });

    // Recruit Troops
    document.querySelectorAll('.recruit-troop-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const troopId = btn.dataset.troop;
        const troopDefs = {
          militia: { food: 20, wood: 15, gold: 10 },
          archer: { food: 40, wood: 50, tools: 2, gold: 25 },
          knight: { food: 90, iron: 40, tools: 5, gold: 80 },
          trebuchet: { wood: 150, stone: 80, tools: 8, gold: 120 }
        };
        const cost = troopDefs[troopId];
        if (cost && this.state.canAfford(cost) && this.state.getCurrentTroopCount() < this.state.getMaxGarrison()) {
          this.state.deductCost(cost);
          this.state.troops[troopId] = (this.state.troops[troopId] || 0) + 1;
          this.audio.playAnvil();
          this.renderDrawerContent();
        }
      });
    });

    // Launch Expeditions
    document.querySelectorAll('.launch-expedition-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const expId = btn.dataset.exp;
        const expDef = EXPEDITIONS.find(e => e.id === expId);
        if (expDef && this.state.startExpedition(expDef)) {
          this.audio.playWarHorn();
          this.renderDrawerContent();
        }
      });
    });

    // Coronation / Ascension
    document.getElementById('btn-ascend-coronation')?.addEventListener('click', () => {
      const renownGain = this.state.calculateAscensionRenown();
      if (confirm(`Nobatkan Tahta Baru?\n\nKerajaan saat ini akan direset dan Anda akan memperoleh +${renownGain} Kemasyhuran (Renown) permanen!`)) {
        this.state.ascend();
        this.audio.playFanfare();
        this.renderDrawerContent();
      }
    });

    // Dynastic Talent Upgrades
    document.querySelectorAll('.upgrade-talent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const talentId = btn.dataset.talent;
        const talentDef = DYNASTIC_TALENTS.find(t => t.id === talentId);
        if (talentDef && this.state.royalRenown >= talentDef.costPerRank) {
          this.state.royalRenown -= talentDef.costPerRank;
          this.state.dynasticTalents[talentId] = (this.state.dynasticTalents[talentId] || 0) + 1;
          this.audio.playFanfare();
          this.renderDrawerContent();
        }
      });
    });

    // Save Actions
    document.getElementById('btn-manual-save')?.addEventListener('click', () => {
      this.state.save();
      this.audio.playClick();
      alert('Kerajaan berhasil disimpan secara permanen!');
    });

    document.getElementById('btn-export-save')?.addEventListener('click', () => {
      const data = this.state.serialize();
      navigator.clipboard.writeText(data).then(() => {
        alert('Kode simpanan disalin ke clipboard!');
      }).catch(() => {
        prompt('Salin kode simpanan berikut:', data);
      });
    });

    document.getElementById('btn-import-save')?.addEventListener('click', () => {
      const raw = prompt('Tempelkan kode simpanan kerajaan (JSON):');
      if (raw) {
        try {
          localStorage.setItem('KINGDOM_IDLE_REBORN_SAVE_V1', raw);
          this.state.load();
          this.renderDrawerContent();
          alert('Simpanan berhasil dimuat!');
        } catch (_) {
          alert('Format data tidak valid.');
        }
      }
    });

    document.getElementById('btn-reset-save')?.addEventListener('click', () => {
      if (confirm('PERINGATAN: Hapus seluruh progres kerajaan dan mulai dari awal?')) {
        this.state.resetSave();
        this.renderDrawerContent();
      }
    });
  }

  activateDecree(dec) {
    if (this.state.isDecreeActive(dec)) return;

    if (dec === 'harvest') {
      if (this.state.faith >= 25) {
        this.state.faith -= 25;
        this.state.activeDecrees.harvest = 45;
        this.audio.playCoin();
      } else { alert('Keimanan tidak cukup (Butuh 25 ✨).'); }
    } else if (dec === 'conscription') {
      if (this.state.gold >= 50) {
        this.state.gold -= 50;
        this.state.activeDecrees.conscription = 60;
        this.audio.playWarHorn();
      } else { alert('Emas tidak cukup (Butuh 50 🪙).'); }
    } else if (dec === 'freeTrade') {
      if (this.state.wood >= 40) {
        this.state.wood -= 40;
        this.state.activeDecrees.freeTrade = 60;
        this.audio.playCoin();
      } else { alert('Kayu tidak cukup (Butuh 40 🪵).'); }
    } else if (dec === 'chronoWarp') {
      if (this.state.mana >= 30) {
        this.state.mana -= 30;
        this.state.activeDecrees.chronoWarp = 20;
        this.gameSpeed = 5;
        setTimeout(() => { this.gameSpeed = 1; }, 20000);
        this.audio.playFanfare();
      } else { alert('Mana tidak cukup (Butuh 30 🔮).'); }
    }
  }

  executeMarketTrade(type) {
    if (type === 'sellFood') {
      if (this.state.food >= 50) {
        this.state.food -= 50;
        this.state.gold += 25;
        this.audio.playCoin();
      } else { alert('Pangan tidak cukup.'); }
    } else if (type === 'buyFood') {
      if (this.state.gold >= 30) {
        this.state.gold -= 30;
        this.state.food += 50;
        this.audio.playCoin();
      } else { alert('Emas tidak cukup.'); }
    } else if (type === 'sellWood') {
      if (this.state.wood >= 50) {
        this.state.wood -= 50;
        this.state.gold += 20;
        this.audio.playCoin();
      } else { alert('Kayu tidak cukup.'); }
    } else if (type === 'buyWood') {
      if (this.state.gold >= 25) {
        this.state.gold -= 25;
        this.state.wood += 50;
        this.audio.playCoin();
      } else { alert('Emas tidak cukup.'); }
    } else if (type === 'sellStone') {
      if (this.state.stone >= 50) {
        this.state.stone -= 50;
        this.state.gold += 30;
        this.audio.playCoin();
      } else { alert('Batu tidak cukup.'); }
    } else if (type === 'buyIron') {
      if (this.state.gold >= 40) {
        this.state.gold -= 40;
        this.state.iron += 20;
        this.audio.playCoin();
      } else { alert('Emas tidak cukup.'); }
    }
    this.renderDrawerContent();
  }

  showOfflineModal(gains) {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const hours = Math.floor(gains.secondsAway / 3600);
    const minutes = Math.floor((gains.secondsAway % 3600) / 60);

    modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-slate-900 border-2 border-yellow-400 p-5 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <span class="text-3xl mb-1">⏳</span>
        <h3 class="text-base font-black text-yellow-300 uppercase">Laporan Pengurus Kerajaan</h3>
        <p class="text-xs text-slate-300 mt-1">
          Offline selama <b>${hours > 0 ? `${hours}j ` : ''}${minutes}m</b>.
        </p>

        <div class="w-full bg-slate-950 p-2.5 rounded-xl border border-slate-800 my-3 grid grid-cols-2 gap-1.5 text-left text-xs">
          <div class="text-yellow-400">🪙 +${gains.goldEarned} Emas</div>
          <div class="text-emerald-400">🌾 +${gains.foodEarned} Pangan</div>
          <div class="text-amber-400">🪵 +${gains.woodEarned} Kayu</div>
          <div class="text-slate-300">🪨 +${gains.stoneEarned} Batu</div>
        </div>

        <button id="btn-claim-offline" class="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs uppercase tracking-wider border border-black shadow cursor-pointer">
          TERIMA HASIL
        </button>
      </div>
    `;

    document.getElementById('btn-claim-offline')?.addEventListener('click', () => {
      modal.className = 'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm hidden items-center justify-center p-4';
      this.audio.playCoin();
    });
  }

  getResourceIcon(res) {
    const icons = {
      gold: '🪙',
      food: '🌾',
      wood: '🪵',
      stone: '🪨',
      iron: '⛏️',
      tools: '🛠️',
      faith: '✨',
      knowledge: '📜',
      mana: '🔮'
    };
    return icons[res] || res;
  }
}
