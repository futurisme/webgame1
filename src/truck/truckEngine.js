/**
 * Truck Simulator: Mud & Cargo - Master Engine & Freeform Drag & Drop Workspace
 * Supports drag & drop cargo loading with arbitrary angle, position, and unlimited count,
 * 4x4 / 6x6 / 8x8 / articulated semi-trailer configurations, variable chassis lengths,
 * live component compatibility, and ultra-stable 2D physics.
 */

import {
  TruckSimulation,
  CARGO_TYPES,
  TRUCK_CONFIGS,
  CHASSIS_LENGTHS,
  TRUCK_BEDS,
  ENGINES,
  GEARBOXES,
  SUSPENSIONS,
  TIRES
} from './truckPhysics.js';
import { TruckAudio } from './truckAudio.js';
import { TruckRenderer } from './truckRenderer.js';

export class TruckGameEngine {
  constructor(container) {
    this.container = container;
    this.sim = new TruckSimulation();
    this.audio = new TruckAudio();
    this.renderer = null;

    this.isWorkshopOpen = true; // starts open at depot
    this.activeTab = 'cargo'; // 'cargo' | 'tuning'
    this.isRunning = false;
    this.lastFrame = performance.now();
    this.keys = {};

    // Drag & Drop State
    this.isDraggingNewCargo = false;
    this.newCargoTemplate = null;
    this.isDraggingPlacedCargo = false;
    this.draggedCargo = null;
    this.dragOffset = { dx: 0, dy: 0 };
    this.currentPlacementAngle = 0; // radians

    this.renderLayout();
    this.initCanvas();
    this.bindEvents();
    this.bindDragAndDropEvents();

    // Start simulation loop
    this.start();
  }

  start() {
    this.isRunning = true;
    this.lastFrame = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.isRunning = false;
    this.audio.stopEngine();
    if (this.renderer) {
      this.renderer.destroy();
    }
    if (this.keyDownHandler) {
      window.removeEventListener('keydown', this.keyDownHandler);
      window.removeEventListener('keyup', this.keyUpHandler);
    }
  }

  loop(now) {
    if (!this.isRunning) return;

    const dt = Math.min(0.04, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    // Process Driving Inputs from Keys
    this.processDrivingInput(dt);

    // Step Physics Simulation
    this.sim.step(dt);

    // Audio Engine Sound
    this.audio.updateEngine(this.sim.engineRpm, this.sim.throttle);

    // Render Canvas Frame
    if (this.renderer) {
      this.renderer.render(dt);
    }

    // Update Telemetry Gauges
    this.updateHUD();

    requestAnimationFrame(this.loop);
  }

  processDrivingInput(dt) {
    let targetThrottle = 0;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      targetThrottle = 1.0;
    } else if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      targetThrottle = -0.8;
    }
    this.sim.throttle = targetThrottle;

    this.sim.brake = (this.keys['ArrowDown'] || this.keys['KeyS']) ? 1.0 : 0;
    this.sim.handbrake = !!this.keys['Space'];
  }

  renderLayout() {
    this.container.className = 'w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none relative flex flex-col';
    this.container.innerHTML = `
      <!-- ================= 1. FULL-SCREEN DRIVING CANVAS ================= -->
      <div id="truck-canvas-container" class="absolute inset-0 z-0 w-full h-full overflow-hidden bg-slate-950">
        <canvas id="truck-canvas" class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>
      </div>

      <!-- ================= 2. ULTRA-SLIM TOP COMMAND BAR (h-8) ================= -->
      <header class="w-full h-8 bg-slate-950/85 backdrop-blur-md border-b border-slate-700/70 px-2.5 flex items-center justify-between z-20 shrink-0 shadow-sm text-xs">
        
        <!-- Left: Hub Return & Logo -->
        <div class="flex items-center gap-2">
          <a href="#/" id="btn-return-hub" class="px-2 py-0.5 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] uppercase rounded border border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5" title="Kembali ke Arcade Hub">
            <span>◀</span> <span>HUB</span>
          </a>

          <div class="flex items-center gap-1 pl-1.5 border-l border-slate-800">
            <span class="text-sm">🚛</span>
            <span class="font-black text-[11px] text-yellow-300 tracking-wider">TRUCK SIM 2D</span>
            <span class="text-[9px] text-slate-400 font-mono hidden sm:inline">• OFFROAD MUD & CARGO</span>
          </div>
        </div>

        <!-- Center: High-Density Telemetry Strip -->
        <div class="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-2 py-0.5 rounded-md text-[11px]">
          <!-- Speed -->
          <div class="flex items-baseline gap-0.5">
            <span class="font-black text-xs text-yellow-400 font-mono" id="hud-speed">0</span>
            <span class="text-[8px] text-slate-400 font-mono">km/h</span>
          </div>

          <span class="text-slate-700">|</span>

          <!-- Gear -->
          <div class="flex items-baseline gap-0.5">
            <span class="text-[8px] text-slate-400">G:</span>
            <span class="font-black text-xs text-emerald-400 font-mono" id="hud-gear">1</span>
          </div>

          <span class="text-slate-700">|</span>

          <!-- RPM Bar -->
          <div class="flex items-center gap-1">
            <div class="w-10 bg-slate-950 rounded-full h-1.5 border border-slate-700 overflow-hidden">
              <div id="hud-rpm-bar" class="h-full bg-emerald-500 transition-all duration-75" style="width: 25%"></div>
            </div>
            <span class="text-[8px] font-mono text-slate-400" id="hud-rpm-val">850</span>
          </div>

          <span class="text-slate-700">|</span>

          <!-- Incline -->
          <div class="flex items-baseline gap-0.5">
            <span class="text-[8px] text-slate-400">📐</span>
            <span class="font-bold text-[10px] font-mono text-amber-400" id="hud-incline">0°</span>
          </div>

          <span class="text-slate-700">|</span>

          <!-- Diff-Lock Button -->
          <button id="btn-toggle-diff" class="px-1.5 py-0.2 rounded text-[8px] font-black uppercase font-mono border cursor-pointer ${this.sim.diffLock ? 'bg-amber-500 text-black border-amber-300' : 'bg-slate-800 text-slate-400 border-slate-700'}" title="Kunci Diferensial 4WD (X)">
            ${this.sim.diffLock ? '🔒 4WD' : '🔓 OPEN (X)'}
          </button>
        </div>

        <!-- Right: Action Buttons (Lights, Horn, Audio, Reset & Workshop Toggle) -->
        <div class="flex items-center gap-1">
          <button id="btn-toggle-lights" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-[10px] cursor-pointer" title="Lampu (L)">
            💡
          </button>
          <button id="btn-truck-horn" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-[10px] cursor-pointer" title="Klakson (H)">
            📯
          </button>
          <button id="btn-toggle-audio" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-[10px] cursor-pointer" title="Suara Mesin">
            🔊
          </button>
          <button id="btn-reset-truck" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-[10px] cursor-pointer" title="Reset Truk ke Posisi Awal (R)">
            🔄
          </button>
          <button id="btn-toggle-workshop" class="px-2 py-0.5 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[10px] uppercase flex items-center gap-1 border border-black shadow cursor-pointer ml-0.5">
            <span>⚙️</span> <span id="label-workshop-btn">DEPOT</span>
          </button>
        </div>
      </header>

      <!-- ================= 3. FLOATING COMPACT WORKSHOP DOCK (w-[290px]) ================= -->
      <aside id="workshop-drawer" class="absolute top-9 left-2 z-20 w-[290px] max-w-[92vw] max-h-[calc(100vh-4rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl flex flex-col shadow-2xl transition-all duration-200 ${this.isWorkshopOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none -translate-x-4'}">
        
        <!-- Dock Header: Segmented Tabs & Close -->
        <div class="bg-slate-950/90 px-2 py-1.5 border-b border-slate-800 rounded-t-xl flex items-center justify-between gap-1 shrink-0">
          <div class="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex-1">
            <button id="tab-btn-cargo" class="flex-1 py-0.5 rounded text-[10px] font-bold ${this.activeTab === 'cargo' ? 'bg-yellow-400 text-black shadow' : 'text-slate-400 hover:text-white'} transition-colors cursor-pointer">
              📦 Muat Kargo (Drag)
            </button>
            <button id="tab-btn-tuning" class="flex-1 py-0.5 rounded text-[10px] font-bold ${this.activeTab === 'tuning' ? 'bg-yellow-400 text-black shadow' : 'text-slate-400 hover:text-white'} transition-colors cursor-pointer">
              ⚙️ Sasis & Modif
            </button>
          </div>
          <button id="btn-close-workshop" class="w-5 h-5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center justify-center text-[10px] cursor-pointer" title="Sembunyikan Panel (T)">
            ✕
          </button>
        </div>

        <!-- Dock Content Body -->
        <div id="workshop-content" class="flex-1 overflow-y-auto p-2 flex flex-col gap-2 text-[10px]">
          <!-- Populated by renderActiveTab() -->
        </div>

        <!-- Dock Bottom Drive Action -->
        <div class="p-1.5 bg-slate-950/95 border-t border-slate-800/80 rounded-b-xl flex items-center justify-between gap-1 shrink-0">
          <button id="btn-dock-reset" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[9px] border border-slate-700 cursor-pointer">
            🔄 Posisi Awal (R)
          </button>
          <button id="btn-drive-now" class="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider border border-emerald-400 shadow cursor-pointer flex items-center justify-center gap-1">
            <span>GAS JALAN</span> <span>➔</span>
          </button>
        </div>
      </aside>

      <!-- ================= 4. SLIM FLOATING BOTTOM CONTROLS & DISTANCE HUD (h-6) ================= -->
      <footer class="absolute bottom-1 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-slate-700/70 shadow-lg text-[9px]">
        <!-- Controls Legend -->
        <div class="flex items-center gap-1 text-slate-300 font-bold">
          <span class="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400">A/D</span> Gas/Mundur
          <span class="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400">S</span> Rem
          <span class="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400">SPACE</span> Handbrake
          <span class="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400">W/Shift</span> Gigi
          <span class="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400">X</span> 4WD
          <span class="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 font-mono text-yellow-400">Q/E / Wheel</span> Putar Kargo
        </div>

        <span class="w-[1px] h-3 bg-slate-700"></span>

        <!-- Journey Distance Meter -->
        <div class="flex items-center gap-1 font-bold">
          <div class="w-16 bg-slate-900 rounded-full h-1.5 border border-slate-700 overflow-hidden">
            <div id="hud-progress-bar" class="h-full bg-yellow-400 transition-all duration-100" style="width: 0%"></div>
          </div>
          <span class="text-[9px] font-mono text-yellow-400 font-bold" id="hud-dist-val">0m/4150m</span>
        </div>
      </footer>
    `;

    this.renderActiveTab();
  }

  initCanvas() {
    const canvas = document.getElementById('truck-canvas');
    if (canvas) {
      this.renderer = new TruckRenderer(canvas, this.sim);
    }
  }

  toggleWorkshop(open) {
    if (typeof open === 'boolean') {
      this.isWorkshopOpen = open;
    } else {
      this.isWorkshopOpen = !this.isWorkshopOpen;
    }

    const drawer = document.getElementById('workshop-drawer');
    const label = document.getElementById('label-workshop-btn');
    if (drawer) {
      if (this.isWorkshopOpen) {
        drawer.className = 'absolute top-9 left-2 z-20 w-[290px] max-w-[92vw] max-h-[calc(100vh-4rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl flex flex-col shadow-2xl transition-all duration-200 opacity-100 scale-100 pointer-events-auto';
        if (label) label.textContent = 'TUTUP';
      } else {
        drawer.className = 'absolute top-9 left-2 z-20 w-[290px] max-w-[92vw] max-h-[calc(100vh-4rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl flex flex-col shadow-2xl transition-all duration-200 opacity-0 scale-95 pointer-events-none -translate-x-4';
        if (label) label.textContent = 'DEPOT';
      }
    }
  }

  renderActiveTab() {
    if (this.activeTab === 'cargo') {
      this.renderCargoTab();
    } else {
      this.renderTuningTab();
    }
  }

  renderCargoTab() {
    const container = document.getElementById('workshop-content');
    if (!container) return;

    const diag = this.sim.getDiagnostics();
    const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];
    const selectedCargo = this.sim.cargos.find(c => c.id === this.renderer?.selectedCargoId);

    container.innerHTML = `
      <!-- 1. Drag & Drop Direct Tip -->
      <div class="bg-yellow-400/10 border border-yellow-400/40 p-1.5 rounded-lg text-[9px] text-yellow-300 leading-snug flex items-start gap-1.5">
        <span class="text-xs">💡</span>
        <div>
          <b>Drag & Drop Bebas:</b> Tarik kargo dari rak ke atas bak/trailer! Putar sudut bebas dengan <b>Mouse Wheel</b> atau tombol <b>Q / E</b>. Tanpa batasan jumlah & sudut!
        </div>
      </div>

      <!-- 2. Live Mass & Axle Stability Gauge -->
      <div class="bg-slate-950/80 px-2 py-1.5 rounded-lg border border-slate-800 flex flex-col gap-1 text-[9px]">
        <div class="flex items-center justify-between">
          <span class="text-slate-400">Total Muatan:</span>
          <span class="font-mono font-bold ${diag.isOverload ? 'text-red-400 animate-pulse' : 'text-emerald-400'}">
            ${diag.cargoWeight.toLocaleString()} kg (${this.sim.cargos.length} item)
          </span>
        </div>
        
        <div class="flex items-center justify-between text-[8px] text-slate-400">
          <span>Distribusi Gandar:</span>
          <span class="font-mono text-yellow-300 font-bold">Depan ${diag.frontBias}% / Belakang ${diag.rearBias}%</span>
        </div>

        <div class="flex items-center justify-between">
          <span class="text-slate-400">Indeks Stabilitas:</span>
          <span class="font-mono font-bold ${diag.stabilityRating > 65 ? 'text-emerald-400' : (diag.stabilityRating > 35 ? 'text-amber-400' : 'text-red-400')}">
            ${diag.stabilityRating}% • Total ${diag.totalWeight.toLocaleString()}kg
          </span>
        </div>

        <!-- Stability Bar -->
        <div class="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div class="h-full ${diag.stabilityRating > 65 ? 'bg-emerald-500' : (diag.stabilityRating > 35 ? 'bg-amber-500' : 'bg-red-500')} transition-all duration-150" style="width: ${diag.stabilityRating}%"></div>
        </div>

        ${diag.warnings.length > 0 ? `
          <div class="bg-amber-950/70 border border-amber-600/50 p-1 rounded text-[8px] text-amber-200 flex flex-col gap-0.5 mt-0.5">
            ${diag.warnings.map(w => `<span class="leading-tight">• ${w}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <!-- 3. Selected Cargo Inspector (shows when a cargo is selected on canvas) -->
      ${selectedCargo ? `
        <div class="bg-blue-950/60 border border-blue-500/50 p-1.5 rounded-lg flex flex-col gap-1 text-[9px]">
          <div class="flex items-center justify-between">
            <span class="font-bold text-blue-300 flex items-center gap-1">
              <span>${selectedCargo.icon}</span> <span>${selectedCargo.name}</span>
            </span>
            <span class="text-[8px] font-mono text-slate-400">${selectedCargo.weight}kg</span>
          </div>

          <!-- Quick Angle Buttons & Controls -->
          <div class="flex items-center justify-between gap-1 pt-1 border-t border-blue-900/50">
            <span class="text-[8px] text-slate-400">Rotasi:</span>
            <div class="flex items-center gap-0.5">
              <button class="cargo-rotate-btn px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[8px] cursor-pointer" data-deg="-15">⟲ -15°</button>
              <button class="cargo-rotate-btn px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[8px] cursor-pointer" data-deg="15">⟳ +15°</button>
              <button class="cargo-set-angle-btn px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[8px] cursor-pointer" data-angle="0">0°</button>
              <button class="cargo-set-angle-btn px-1 py-0.2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[8px] cursor-pointer" data-angle="90">90°</button>
            </div>
            <button id="btn-delete-selected-cargo" class="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white font-black text-[8px] cursor-pointer" title="Hapus Kargo Ini">
              🗑️
            </button>
          </div>
        </div>
      ` : ''}

      <!-- 4. Rak Muatan Draggable (Palette) -->
      <div class="flex flex-col gap-1">
        <div class="flex items-center justify-between text-[9px] font-black uppercase text-yellow-400">
          <span>Rak Pemuatan Depot (Drag ke Bak):</span>
          <button id="btn-clear-all-cargo" class="text-[8px] text-red-400 hover:text-red-300 underline cursor-pointer">Kosongkan Semua</button>
        </div>

        <div class="grid grid-cols-2 gap-1.5">
          ${CARGO_TYPES.map(c => `
            <div 
              class="cargo-palette-item bg-slate-950/80 hover:bg-slate-800/80 px-1.5 py-1.5 rounded-lg border border-slate-800 hover:border-yellow-400/60 flex flex-col justify-between cursor-grab active:cursor-grabbing transition-all select-none group"
              draggable="true"
              data-type="${c.id}"
            >
              <div class="flex items-center gap-1.5 truncate">
                <span class="text-base group-hover:scale-110 transition-transform">${c.icon}</span>
                <div class="truncate">
                  <div class="text-[9px] font-bold text-slate-200 truncate leading-tight">${c.name}</div>
                  <div class="text-[8px] text-yellow-400 font-mono">${c.weight} kg</div>
                </div>
              </div>

              <div class="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/60 text-[8px]">
                <span class="text-slate-500 text-[7px] italic">Tarik ke bak</span>
                <button class="cargo-quick-add-btn px-1.5 py-0.2 rounded bg-yellow-400 hover:bg-yellow-300 text-black font-black text-[8px] cursor-pointer shadow-sm" data-type="${c.id}" title="Tambah Cepat">+ MUAT</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.bindCargoTabEvents();
  }

  renderTuningTab() {
    const container = document.getElementById('workshop-content');
    if (!container) return;

    container.innerHTML = `
      <!-- 1. Konfigurasi Sasis & Gandar Roda (4x4, 6x6, 8x8, Semi-Trailer) -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">1. Konfigurasi Sasis & Gandar Roda:</span>
        <div class="grid grid-cols-2 gap-1">
          ${TRUCK_CONFIGS.map(c => `
            <button class="config-select-btn px-1.5 py-1.5 rounded-lg border text-left cursor-pointer transition-colors ${this.sim.truckConfigId === c.id ? 'bg-yellow-400 text-black border-yellow-300 font-black shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700'}" data-config="${c.id}">
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-black">${c.badge}</span>
                <span class="text-[8px] opacity-75 font-mono">${c.axles} Gandar</span>
              </div>
              <div class="font-bold truncate text-[8px] leading-tight mt-0.5">${c.name.split('(')[0]}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 2. Panjang Sasis (Wheelbase) -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">2. Panjang Sasis (Wheelbase):</span>
        <div class="grid grid-cols-2 gap-1">
          ${CHASSIS_LENGTHS.map(l => `
            <button class="chassis-len-btn px-1.5 py-1 rounded border text-left cursor-pointer transition-colors ${this.sim.chassisLengthId === l.id ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800'}" data-len="${l.id}">
              <div class="text-[9px] font-bold truncate">${l.name}</div>
              <div class="text-[7px] ${this.sim.chassisLengthId === l.id ? 'text-black/80' : 'text-slate-400'}">${l.desc}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 3. Pilihan Bak Truk -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">3. Jenis Bak Kargo:</span>
        <div class="grid grid-cols-2 gap-1">
          ${TRUCK_BEDS.map(b => `
            <button class="bed-select-btn px-1.5 py-1 rounded border text-left cursor-pointer transition-colors ${this.sim.bedId === b.id ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800'}" data-bed="${b.id}">
              <div class="font-bold truncate text-[9px]">${b.name.replace('Bak ', '')}</div>
              <div class="text-[7px] ${this.sim.bedId === b.id ? 'text-black/80' : 'text-slate-400'}">Limit ${b.maxLoad}kg</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 4. Mesin Powertrain -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">4. Mesin Truk:</span>
        <div class="flex flex-col gap-1">
          ${ENGINES.map(e => `
            <button class="engine-select-btn px-2 py-1 rounded border text-left cursor-pointer transition-colors ${this.sim.engineId === e.id ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800'}" data-engine="${e.id}">
              <div class="text-[9px] font-bold flex items-center justify-between">
                <span>${e.name}</span>
                <span class="font-mono text-[8px] ${this.sim.engineId === e.id ? 'text-black' : 'text-yellow-400'}">${e.power}HP / ${e.torque}Nm</span>
              </div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 5. Transmisi -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">5. Transmisi:</span>
        <div class="grid grid-cols-3 gap-1">
          ${GEARBOXES.map(g => `
            <button class="gearbox-select-btn px-1 py-1 rounded border text-center cursor-pointer transition-colors ${this.sim.gearboxId === g.id ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800'}" data-gearbox="${g.id}">
              <div class="text-[8px] font-bold truncate">${g.name.split(' ')[0]}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 6. Suspensi -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">6. Tipe Suspensi:</span>
        <div class="flex flex-col gap-1">
          ${SUSPENSIONS.map(s => `
            <button class="susp-select-btn px-1.5 py-1 rounded border text-left cursor-pointer transition-colors ${this.sim.suspensionId === s.id ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800'}" data-susp="${s.id}">
              <div class="text-[8px] font-bold">${s.name}</div>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 7. Ban & Traksi -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[9px] font-black uppercase text-yellow-400">7. Ban & Traksi:</span>
        <div class="grid grid-cols-2 gap-1">
          ${TIRES.map(t => `
            <button class="tire-select-btn px-1.5 py-1 rounded border text-left cursor-pointer transition-colors ${this.sim.tireId === t.id ? 'bg-yellow-400 text-black border-yellow-300 font-bold shadow-sm' : 'bg-slate-950/70 text-slate-300 border-slate-800'}" data-tire="${t.id}">
              <div class="text-[8px] font-bold truncate">${t.name.split(' ')[1] || t.name}</div>
              <div class="text-[7px] ${this.sim.tireId === t.id ? 'text-black' : 'text-slate-400'}">${t.radius}" Radius</div>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    this.bindTuningTabEvents();
  }

  bindCargoTabEvents() {
    // Quick Add Button
    document.querySelectorAll('.cargo-quick-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const typeId = btn.dataset.type;
        const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];
        const count = this.sim.cargos.length;

        // Auto distribute along bed or trailer, falling realistically with gravity
        const relX = config.hasTrailer ? (-36 - (count % 4) * 20) : (-12 - (count % 5) * 15);
        const relY = -45 - Math.floor(count / 5) * 16;
        const carrier = config.hasTrailer ? 'trailer' : 'cab';

        const newC = this.sim.addFreeCargo(typeId, relX, relY, 0, carrier);
        if (this.renderer) {
          this.renderer.selectedCargoId = newC.id;
        }
        this.renderCargoTab();
      });
    });

    // Rotate Selected Cargo Buttons
    document.querySelectorAll('.cargo-rotate-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const deg = parseFloat(btn.dataset.deg) || 0;
        const c = this.sim.cargos.find(item => item.id === this.renderer?.selectedCargoId);
        if (c) {
          c.angle = (c.angle || 0) + (deg * Math.PI / 180);
          this.renderCargoTab();
        }
      });
    });

    document.querySelectorAll('.cargo-set-angle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const angleDeg = parseFloat(btn.dataset.angle) || 0;
        const c = this.sim.cargos.find(item => item.id === this.renderer?.selectedCargoId);
        if (c) {
          c.angle = angleDeg * Math.PI / 180;
          this.renderCargoTab();
        }
      });
    });

    // Delete Selected Cargo
    document.getElementById('btn-delete-selected-cargo')?.addEventListener('click', () => {
      if (this.renderer?.selectedCargoId) {
        this.sim.removeCargoById(this.renderer.selectedCargoId);
        this.renderer.selectedCargoId = null;
        this.renderCargoTab();
      }
    });

    // Clear All
    document.getElementById('btn-clear-all-cargo')?.addEventListener('click', () => {
      this.sim.clearCargo();
      if (this.renderer) this.renderer.selectedCargoId = null;
      this.renderCargoTab();
    });

    // Dragstart from Palette Items
    document.querySelectorAll('.cargo-palette-item').forEach(el => {
      el.addEventListener('dragstart', (e) => {
        const typeId = el.dataset.type;
        const def = CARGO_TYPES.find(c => c.id === typeId) || CARGO_TYPES[0];
        this.isDraggingNewCargo = true;
        this.newCargoTemplate = def;
        e.dataTransfer.setData('text/plain', typeId);
      });

      el.addEventListener('dragend', () => {
        this.isDraggingNewCargo = false;
        if (this.renderer) this.renderer.dragGhost = null;
      });
    });
  }

  bindTuningTabEvents() {
    // Config change (4x4, 6x6, 8x8, Semi-Trailer)
    document.querySelectorAll('.config-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.truckConfigId = btn.dataset.config;
        this.sim.rebuildWheelSetup();
        this.sim.respawnAt(this.sim.x);
        this.renderTuningTab();
      });
    });

    // Chassis Length change
    document.querySelectorAll('.chassis-len-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.chassisLengthId = btn.dataset.len;
        this.sim.rebuildWheelSetup();
        this.sim.respawnAt(this.sim.x);
        this.renderTuningTab();
      });
    });

    // Bed change
    document.querySelectorAll('.bed-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.bedId = btn.dataset.bed;
        this.renderTuningTab();
      });
    });

    // Engine change
    document.querySelectorAll('.engine-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.engineId = btn.dataset.engine;
        this.renderTuningTab();
      });
    });

    // Gearbox change
    document.querySelectorAll('.gearbox-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.gearboxId = btn.dataset.gearbox;
        this.renderTuningTab();
      });
    });

    // Suspension change
    document.querySelectorAll('.susp-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.suspensionId = btn.dataset.susp;
        this.renderTuningTab();
      });
    });

    // Tire change (rebuilds wheel setup to ensure logical spacing)
    document.querySelectorAll('.tire-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.sim.tireId = btn.dataset.tire;
        this.sim.rebuildWheelSetup();
        this.sim.respawnAt(this.sim.x);
        this.renderTuningTab();
      });
    });
  }

  // Interactive Drag & Drop on Canvas
  bindDragAndDropEvents() {
    const canvas = document.getElementById('truck-canvas');
    if (!canvas) return;

    // Mouse Drag on Canvas
    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Left click only
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hitCargo = this.renderer?.findCargoAtScreen(mouseX, mouseY);
      if (hitCargo) {
        this.isDraggingPlacedCargo = true;
        this.draggedCargo = hitCargo;
        hitCargo.isBeingDragged = true;
        hitCargo.velX = 0;
        hitCargo.velY = 0;
        this.renderer.selectedCargoId = hitCargo.id;

        const world = this.renderer.screenToWorld(mouseX, mouseY);
        const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];
        const local = (hitCargo.carrier === 'trailer' && config.hasTrailer)
          ? this.renderer.worldToTrailerLocal(world.x, world.y)
          : this.renderer.worldToTruckLocal(world.x, world.y);

        this.dragOffset = {
          dx: hitCargo.relX - local.relX,
          dy: hitCargo.relY - local.relY
        };

        this.renderCargoTab();
      } else {
        // Deselect if clicked elsewhere
        if (this.renderer?.selectedCargoId) {
          this.renderer.selectedCargoId = null;
          this.renderCargoTab();
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDraggingPlacedCargo && this.draggedCargo && this.renderer) {
        const world = this.renderer.screenToWorld(mouseX, mouseY);
        const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];

        // Determine target carrier
        let local;
        if (config.hasTrailer) {
          const hitchX = this.sim.x + (-26 * Math.cos(this.sim.angle) - 4 * Math.sin(this.sim.angle));
          const targetCarrier = world.x < hitchX ? 'trailer' : 'cab';
          if (this.draggedCargo.carrier !== targetCarrier) {
            this.draggedCargo.carrier = targetCarrier;
            local = targetCarrier === 'trailer'
              ? this.renderer.worldToTrailerLocal(world.x, world.y)
              : this.renderer.worldToTruckLocal(world.x, world.y);
            this.dragOffset = { dx: 0, dy: 0 };
          } else {
            local = targetCarrier === 'trailer'
              ? this.renderer.worldToTrailerLocal(world.x, world.y)
              : this.renderer.worldToTruckLocal(world.x, world.y);
          }
        } else {
          this.draggedCargo.carrier = 'cab';
          local = this.renderer.worldToTruckLocal(world.x, world.y);
        }

        this.draggedCargo.relX = Math.round(local.relX + this.dragOffset.dx);
        this.draggedCargo.relY = Math.round(local.relY + this.dragOffset.dy);
      } else if (this.renderer) {
        // Hover highlight
        const hover = this.renderer.findCargoAtScreen(mouseX, mouseY);
        this.renderer.hoveredCargoId = hover ? hover.id : null;
      }
    });

    window.addEventListener('mouseup', () => {
      if (this.isDraggingPlacedCargo) {
        if (this.draggedCargo) {
          this.draggedCargo.isBeingDragged = false;
          this.draggedCargo.velX = 0;
          this.draggedCargo.velY = 0;
        }
        this.isDraggingPlacedCargo = false;
        this.draggedCargo = null;
        this.renderCargoTab();
      }
    });

    // Native HTML5 Drag Over Canvas (from Cargo Palette)
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';

      if (this.isDraggingNewCargo && this.newCargoTemplate && this.renderer) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const world = this.renderer.screenToWorld(mouseX, mouseY);
        const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];

        let local;
        let carrier = 'cab';
        if (config.hasTrailer) {
          const hitchX = this.sim.x + (-26 * Math.cos(this.sim.angle) - 4 * Math.sin(this.sim.angle));
          carrier = world.x < hitchX ? 'trailer' : 'cab';
          local = carrier === 'trailer'
            ? this.renderer.worldToTrailerLocal(world.x, world.y)
            : this.renderer.worldToTruckLocal(world.x, world.y);
        } else {
          local = this.renderer.worldToTruckLocal(world.x, world.y);
        }

        this.renderer.dragGhost = {
          typeId: this.newCargoTemplate.id,
          name: this.newCargoTemplate.name,
          weight: this.newCargoTemplate.weight,
          length: this.newCargoTemplate.length,
          height: this.newCargoTemplate.height,
          color: this.newCargoTemplate.color,
          icon: this.newCargoTemplate.icon,
          relX: Math.round(local.relX),
          relY: Math.round(local.relY),
          angle: this.currentPlacementAngle,
          carrier
        };
      }
    });

    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const typeId = e.dataTransfer.getData('text/plain');
      if (typeId && this.renderer) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const world = this.renderer.screenToWorld(mouseX, mouseY);
        const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];

        let local;
        let carrier = 'cab';
        if (config.hasTrailer) {
          const hitchX = this.sim.x + (-26 * Math.cos(this.sim.angle) - 4 * Math.sin(this.sim.angle));
          carrier = world.x < hitchX ? 'trailer' : 'cab';
          local = carrier === 'trailer'
            ? this.renderer.worldToTrailerLocal(world.x, world.y)
            : this.renderer.worldToTruckLocal(world.x, world.y);
        } else {
          local = this.renderer.worldToTruckLocal(world.x, world.y);
        }

        const newC = this.sim.addFreeCargo(
          typeId,
          Math.round(local.relX),
          Math.round(local.relY),
          this.currentPlacementAngle,
          carrier
        );

        this.renderer.selectedCargoId = newC.id;
        this.renderer.dragGhost = null;
        this.isDraggingNewCargo = false;
        this.renderCargoTab();
      }
    });

    // Mouse Wheel to rotate cargo when hovering or dragging
    canvas.addEventListener('wheel', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hit = this.renderer?.findCargoAtScreen(mouseX, mouseY);
      if (hit || this.isDraggingPlacedCargo || this.isDraggingNewCargo) {
        e.preventDefault();
        const deltaAngle = (e.deltaY > 0 ? 1 : -1) * (15 * Math.PI / 180);

        if (this.draggedCargo) {
          this.draggedCargo.angle = (this.draggedCargo.angle || 0) + deltaAngle;
        } else if (hit) {
          hit.angle = (hit.angle || 0) + deltaAngle;
        } else if (this.isDraggingNewCargo) {
          this.currentPlacementAngle += deltaAngle;
          if (this.renderer?.dragGhost) {
            this.renderer.dragGhost.angle = this.currentPlacementAngle;
          }
        }
      }
    }, { passive: false });
  }

  updateHUD() {
    const kmh = Math.floor(Math.abs(this.sim.vx) * 0.95);
    const speedEl = document.getElementById('hud-speed');
    if (speedEl) speedEl.textContent = kmh;

    const gearIdx = this.sim.currentGearIndex;
    let gearText = 'N';
    if (gearIdx === 0) gearText = 'R';
    else if (gearIdx === 1) gearText = 'N';
    else gearText = `${gearIdx - 1}`;
    const gearEl = document.getElementById('hud-gear');
    if (gearEl) gearEl.textContent = gearText;

    const rpm = Math.floor(this.sim.engineRpm);
    const rpmValEl = document.getElementById('hud-rpm-val');
    if (rpmValEl) rpmValEl.textContent = rpm;
    const rpmBar = document.getElementById('hud-rpm-bar');
    if (rpmBar) {
      const pct = Math.min(100, Math.max(0, (rpm / 3200) * 100));
      rpmBar.style.width = `${pct}%`;
      rpmBar.className = pct > 80 ? 'h-full bg-red-500 transition-all duration-75' : 'h-full bg-emerald-500 transition-all duration-75';
    }

    const deg = Math.floor((this.sim.angle * 180) / Math.PI);
    const inclineEl = document.getElementById('hud-incline');
    if (inclineEl) {
      inclineEl.textContent = `${deg > 0 ? '+' : ''}${deg}°`;
      inclineEl.className = Math.abs(deg) > 35 ? 'font-bold text-[10px] font-mono text-red-500 animate-pulse' : 'font-bold text-[10px] font-mono text-amber-400';
    }

    const distMeter = Math.min(4150, Math.floor(this.sim.x));
    const distVal = document.getElementById('hud-dist-val');
    if (distVal) distVal.textContent = `${distMeter}m/4150m`;
    const distBar = document.getElementById('hud-progress-bar');
    if (distBar) {
      const pct = Math.min(100, (distMeter / 4150) * 100);
      distBar.style.width = `${pct}%`;
    }
  }

  bindEvents() {
    document.getElementById('btn-return-hub')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.audio.stopEngine();
      window.navigateTo('/');
    });

    document.getElementById('btn-toggle-workshop')?.addEventListener('click', () => {
      this.toggleWorkshop();
    });
    document.getElementById('btn-close-workshop')?.addEventListener('click', () => {
      this.toggleWorkshop(false);
    });

    document.getElementById('btn-drive-now')?.addEventListener('click', () => {
      this.audio.startEngine();
      this.toggleWorkshop(false);
    });

    document.getElementById('btn-reset-truck')?.addEventListener('click', () => {
      this.resetTruck();
    });
    document.getElementById('btn-dock-reset')?.addEventListener('click', () => {
      this.resetTruck();
    });

    // Drawer Tabs
    document.getElementById('tab-btn-cargo')?.addEventListener('click', () => {
      this.activeTab = 'cargo';
      const cBtn = document.getElementById('tab-btn-cargo');
      const tBtn = document.getElementById('tab-btn-tuning');
      if (cBtn) cBtn.className = 'flex-1 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-black shadow transition-colors cursor-pointer';
      if (tBtn) tBtn.className = 'flex-1 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer';
      this.renderCargoTab();
    });

    document.getElementById('tab-btn-tuning')?.addEventListener('click', () => {
      this.activeTab = 'tuning';
      const cBtn = document.getElementById('tab-btn-cargo');
      const tBtn = document.getElementById('tab-btn-tuning');
      if (tBtn) tBtn.className = 'flex-1 py-0.5 rounded text-[10px] font-bold bg-yellow-400 text-black shadow transition-colors cursor-pointer';
      if (cBtn) cBtn.className = 'flex-1 py-0.5 rounded text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer';
      this.renderTuningTab();
    });

    document.getElementById('btn-toggle-diff')?.addEventListener('click', () => {
      const isLocked = this.sim.toggleDiffLock();
      const b = document.getElementById('btn-toggle-diff');
      if (b) {
        b.className = `px-1.5 py-0.2 rounded text-[8px] font-black uppercase font-mono border cursor-pointer ${isLocked ? 'bg-amber-500 text-black border-amber-300' : 'bg-slate-800 text-slate-400 border-slate-700'}`;
        b.textContent = isLocked ? '🔒 4WD' : '🔓 OPEN (X)';
      }
    });

    document.getElementById('btn-toggle-lights')?.addEventListener('click', () => {
      const on = this.sim.toggleHeadlights();
      const b = document.getElementById('btn-toggle-lights');
      if (b) b.textContent = on ? '💡' : '🌑';
    });

    document.getElementById('btn-truck-horn')?.addEventListener('click', () => {
      this.audio.playHorn();
    });

    document.getElementById('btn-toggle-audio')?.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      const b = document.getElementById('btn-toggle-audio');
      if (b) b.textContent = muted ? '🔇' : '🔊';
    });

    // Keyboard Inputs
    this.keyDownHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      this.keys[e.code] = true;

      if (['KeyD', 'ArrowRight', 'KeyA', 'ArrowLeft'].includes(e.code)) {
        this.audio.startEngine();
      }

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (this.sim.shiftUp()) {
          this.audio.playGearShift();
        }
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        if (this.sim.shiftDown()) {
          this.audio.playGearShift();
        }
      } else if (e.code === 'KeyX') {
        document.getElementById('btn-toggle-diff')?.click();
      } else if (e.code === 'KeyL') {
        document.getElementById('btn-toggle-lights')?.click();
      } else if (e.code === 'KeyH') {
        this.audio.playHorn();
      } else if (e.code === 'KeyT') {
        this.toggleWorkshop();
      } else if (e.code === 'KeyR') {
        this.resetTruck();
      } else if (e.code === 'KeyQ') {
        // Rotate selected cargo CCW
        const c = this.sim.cargos.find(item => item.id === this.renderer?.selectedCargoId);
        if (c) {
          c.angle = (c.angle || 0) - (15 * Math.PI / 180);
          this.renderCargoTab();
        }
      } else if (e.code === 'KeyE') {
        // Rotate selected cargo CW
        const c = this.sim.cargos.find(item => item.id === this.renderer?.selectedCargoId);
        if (c) {
          c.angle = (c.angle || 0) + (15 * Math.PI / 180);
          this.renderCargoTab();
        }
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        if (this.renderer?.selectedCargoId) {
          this.sim.removeCargoById(this.renderer.selectedCargoId);
          this.renderer.selectedCargoId = null;
          this.renderCargoTab();
        }
      }
    };

    this.keyUpHandler = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space' || e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.audio.playAirBrake();
      }
    };

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  resetTruck() {
    this.sim.respawnAt(120);
    if (this.renderer) {
      this.renderer.camX = 120;
      this.renderer.camY = this.sim.y - 20;
    }
  }
}
