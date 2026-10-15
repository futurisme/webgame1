/**
 * Train Simulator: Steel & Rails - Master Game Engine & Compact Cab Controller
 * Ultra-lightweight, 60-120 FPS, desktop-laptop optimized.
 * Features:
 * - Smart Collapsible Driver Cab (Compact Micro-Dock vs Full Instrument Console)
 * - Anti-Thrashing Cached Telemetry & Zero-Lag Speedometer
 * - Freeform Consist Builder (CC 206, KRL E233, BB 301, Steam Mikado)
 * - Compact Floating Station & Mission Micro-Badge
 * - Real-time Semboyan 35 Horn, Pneumatic Air Brakes, Reverser, Sander, Doors & Wesel switches
 */

import {
  TrainSimulation,
  LOCOMOTIVES,
  CAR_TYPES,
  PRESET_CONSISTS,
  ROUTES
} from './trainPhysics.js';
import { TrainAudio } from './trainAudio.js';
import { TrainRenderer } from './trainRenderer.js';

export class TrainGameEngine {
  constructor(container) {
    this.container = container;
    this.sim = new TrainSimulation();
    this.audio = new TrainAudio();
    this.renderer = null;

    this.isDepotOpen = true; // Starts in Depot / Consist Builder
    this.isHelpOpen = false;
    this.isCabExpanded = false; // Smart Collapsible Cab (Default compact)
    this.isRunning = false;
    this.lastFrame = performance.now();
    this.keys = {};

    // Telemetry cache to prevent DOM thrashing / reflow loops
    this.cache = {
      speedKmh: -1,
      speedLimit: -1,
      reverser: null,
      notch: -1,
      bp: -1,
      bc: -1,
      stationName: '',
      stationDist: '',
      boardingPct: -1,
      score: -1,
      slip: false,
      doors: null,
      switchState: null
    };

    this.renderLayout();
    this.initCanvas();
    this.bindKeyboardEvents();
    this.bindUIEvents();

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

  initCanvas() {
    const canvas = document.getElementById('train-canvas');
    if (canvas) {
      this.renderer = new TrainRenderer(canvas, this.sim);
    }
  }

  loop(now) {
    if (!this.isRunning) return;

    const dt = Math.min(0.033, (now - this.lastFrame) / 1000);
    this.lastFrame = now;

    // 1. Step Train Physics
    this.sim.step(dt, (intensity) => {
      this.audio.playCouplerClank(intensity);
    });

    // 2. Audio Engine Sound with Distance & Positional Attenuation
    const speedKmh = this.sim.velocityMs * 3.6;
    const isBraking = this.sim.brakeCylinderBar > 0.5;
    this.audio.setEngineType(this.sim.locoConfig.engineType);
    const locoDist = this.sim.distanceM;
    const camDist = this.renderer ? Math.abs(this.renderer.camX - locoDist) : 0;
    const relCamX = this.renderer ? (locoDist - this.renderer.camX) : 0;
    this.audio.update(speedKmh, this.sim.throttleNotch, isBraking, camDist, relCamX);

    // 3. Render 2D Canvas Scene
    if (this.renderer) {
      this.renderer.render(dt);
    }

    // 4. Update HUD without DOM thrashing
    this.updateHUD();

    requestAnimationFrame(this.loop);
  }

  bindKeyboardEvents() {
    this.keyDownHandler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      this.keys[e.code] = true;

      this.audio.init();
      if (!this.audio.isEngineRunning && !this.isDepotOpen) {
        this.audio.startEngine();
      }

      // Throttle Notch: W / ArrowUp = Notch Up, S / ArrowDown = Notch Down
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.sim.notchUp();
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.sim.notchDown();
      }

      // Train Brakes: A / ArrowLeft = Apply Brake, D / ArrowRight = Release Brake
      else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        this.sim.applyTrainBrake(Math.min(1.0, this.sim.trainBrakeLevel + 0.15));
        this.audio.playBrakeHiss(0.7);
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        this.sim.applyTrainBrake(Math.max(0.0, this.sim.trainBrakeLevel - 0.15));
        this.audio.playBrakeHiss(0.4);
      }

      // Reverser: R
      else if (e.code === 'KeyR') {
        if (this.sim.reverser === 1) this.sim.setReverser(0);
        else if (this.sim.reverser === 0) this.sim.setReverser(-1);
        else this.sim.setReverser(1);
      }

      // Horn / Semboyan 35: Spacebar
      else if (e.code === 'Space') {
        e.preventDefault();
        this.audio.startHorn();
      }

      // Bell / Departure Chime: B
      else if (e.code === 'KeyB') {
        this.audio.playStationChime();
      }

      // Sander: F
      else if (e.code === 'KeyF') {
        this.sim.sanderActive = !this.sim.sanderActive;
      }

      // Emergency Brake: X
      else if (e.code === 'KeyX') {
        this.sim.triggerEmergencyBrake();
        this.audio.playBrakeHiss(1.5);
      }

      // Reset Freecam: C
      else if (e.code === 'KeyC') {
        this.renderer?.resetFreecam();
      }

      // Passenger Doors: O or P
      else if (e.code === 'KeyO' || e.code === 'KeyP') {
        this.sim.toggleDoors();
      }

      // Turnout Switch: T
      else if (e.code === 'KeyT') {
        if (this.sim.route.switches && this.sim.route.switches.length > 0) {
          const sw = this.sim.route.switches[0];
          this.sim.toggleSwitch(sw.id);
        }
      }

      // Toggle Cab Expand/Collapse: Tab
      else if (e.code === 'Tab') {
        e.preventDefault();
        this.toggleCabDrawer();
      }

      // Camera views: 1, 2, 3
      else if (e.code === 'Digit1') {
        this.renderer?.setCameraMode('follow_loco');
      } else if (e.code === 'Digit2') {
        this.renderer?.setCameraMode('consist_center');
      } else if (e.code === 'Digit3') {
        this.renderer?.setCameraMode('trackside');
      }

      // Headlights: L
      else if (e.code === 'KeyL') {
        this.sim.headlights = (this.sim.headlights + 1) % 3;
      }
    };

    this.keyUpHandler = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        this.audio.stopHorn();
      }
    };

    window.addEventListener('keydown', this.keyDownHandler);
    window.addEventListener('keyup', this.keyUpHandler);
  }

  bindUIEvents() {
    // Top Bar
    document.getElementById('train-return-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/');
    });

    document.getElementById('train-depot-toggle')?.addEventListener('click', () => {
      this.toggleDepotModal();
    });

    document.getElementById('train-weather-btn')?.addEventListener('click', () => {
      if (this.renderer) {
        const nextWeather = this.renderer.cycleWeather();
        const badge = document.getElementById('train-weather-label');
        if (badge) badge.innerText = nextWeather.toUpperCase();
      }
    });

    document.getElementById('train-audio-btn')?.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      const icon = document.getElementById('train-audio-icon');
      if (icon) icon.innerText = isMuted ? '🔇' : '🔊';
    });

    document.getElementById('train-help-btn')?.addEventListener('click', () => {
      this.toggleHelpModal();
    });

    // Smart Cab Drawer Toggle
    document.getElementById('btn-cab-toggle')?.addEventListener('click', () => {
      this.toggleCabDrawer();
    });

    // Controls
    document.getElementById('btn-reverser-fwd')?.addEventListener('click', () => this.sim.setReverser(1));
    document.getElementById('btn-reverser-neu')?.addEventListener('click', () => this.sim.setReverser(0));
    document.getElementById('btn-reverser-rev')?.addEventListener('click', () => this.sim.setReverser(-1));

    document.getElementById('btn-notch-up')?.addEventListener('click', () => {
      this.audio.init();
      this.audio.startEngine();
      this.sim.notchUp();
    });
    document.getElementById('btn-notch-down')?.addEventListener('click', () => this.sim.notchDown());

    document.getElementById('btn-brake-apply')?.addEventListener('click', () => {
      this.sim.applyTrainBrake(Math.min(1.0, this.sim.trainBrakeLevel + 0.2));
      this.audio.playBrakeHiss(0.7);
    });
    document.getElementById('btn-brake-release')?.addEventListener('click', () => {
      this.sim.applyTrainBrake(Math.max(0.0, this.sim.trainBrakeLevel - 0.2));
      this.audio.playBrakeHiss(0.4);
    });

    // Horn Button
    const hornBtn = document.getElementById('btn-horn');
    if (hornBtn) {
      const startH = (e) => {
        e.preventDefault();
        this.audio.startHorn();
      };
      const stopH = (e) => {
        e.preventDefault();
        this.audio.stopHorn();
      };
      hornBtn.addEventListener('mousedown', startH);
      hornBtn.addEventListener('mouseup', stopH);
      hornBtn.addEventListener('mouseleave', stopH);
      hornBtn.addEventListener('touchstart', startH);
      hornBtn.addEventListener('touchend', stopH);
    }

    document.getElementById('btn-bell')?.addEventListener('click', () => {
      this.audio.playStationChime();
    });

    document.getElementById('btn-sander')?.addEventListener('click', () => {
      this.sim.sanderActive = !this.sim.sanderActive;
    });

    document.getElementById('btn-ebrake')?.addEventListener('click', () => {
      if (this.sim.emergencyBrakeTriggered) {
        this.sim.resetEmergencyBrake();
      } else {
        this.sim.triggerEmergencyBrake();
        this.audio.playBrakeHiss(1.5);
      }
    });

    document.getElementById('btn-doors')?.addEventListener('click', () => {
      this.sim.toggleDoors();
    });

    document.getElementById('btn-switch')?.addEventListener('click', () => {
      if (this.sim.route.switches && this.sim.route.switches.length > 0) {
        const sw = this.sim.route.switches[0];
        this.sim.toggleSwitch(sw.id);
      }
    });

    // Camera Views & Freecam
    document.getElementById('btn-freecam-reset')?.addEventListener('click', () => this.renderer?.resetFreecam());
    document.getElementById('cam-btn-1')?.addEventListener('click', () => this.renderer?.setCameraMode('follow_loco'));
    document.getElementById('cam-btn-2')?.addEventListener('click', () => this.renderer?.setCameraMode('consist_center'));
    document.getElementById('cam-btn-3')?.addEventListener('click', () => this.renderer?.setCameraMode('trackside'));

    document.getElementById('zoom-in-btn')?.addEventListener('click', () => {
      if (this.renderer) this.renderer.camZoom = Math.min(2.4, this.renderer.camZoom * 1.15);
    });
    document.getElementById('zoom-out-btn')?.addEventListener('click', () => {
      if (this.renderer) this.renderer.camZoom = Math.max(0.5, this.renderer.camZoom * 0.85);
    });
  }

  toggleCabDrawer() {
    this.isCabExpanded = !this.isCabExpanded;
    const fullPanel = document.getElementById('cab-full-panel');
    const toggleBtn = document.getElementById('btn-cab-toggle');
    if (fullPanel && toggleBtn) {
      if (this.isCabExpanded) {
        fullPanel.classList.remove('hidden');
        toggleBtn.innerHTML = `<span>▼ KEMAS PANEL</span>`;
      } else {
        fullPanel.classList.add('hidden');
        toggleBtn.innerHTML = `<span>▲ PANEL LENGKAP</span>`;
      }
    }
  }

  toggleDepotModal() {
    this.isDepotOpen = !this.isDepotOpen;
    this.updateDepotVisibility();
    if (this.isDepotOpen) {
      this.renderDepotContent();
    }
  }

  toggleHelpModal() {
    this.isHelpOpen = !this.isHelpOpen;
    const modal = document.getElementById('train-help-modal');
    if (modal) {
      modal.className = this.isHelpOpen
        ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4'
        : 'hidden';
    }
  }

  updateDepotVisibility() {
    const modal = document.getElementById('train-depot-modal');
    if (modal) {
      modal.className = this.isDepotOpen
        ? 'fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto'
        : 'hidden';
      if (this.isDepotOpen) {
        this.renderDepotContent();
      }
    }
  }

  renderDepotContent() {
    const container = document.getElementById('depot-builder-content');
    if (!container) return;

    const currentLoco = this.sim.locoConfig;
    const cars = this.sim.carList;
    const totalWeight = this.sim.getTotalTrainWeightTons();
    const totalLength = Math.round(this.sim.getTotalTrainLengthM());
    const hpPerTon = (currentLoco.powerHP / Math.max(1, totalWeight)).toFixed(1);

    container.innerHTML = `
      <div class="max-w-4xl w-full bg-slate-900 border-3 border-black rounded-2xl shadow-[6px_6px_0px_0px_#FFE500] p-5 text-white select-none">
        <div class="flex items-center justify-between pb-3 border-b border-slate-700">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-[#FFE500] text-black font-black text-[10px] uppercase rounded">BALAI YASA & DEPO KERETA</span>
              <span class="text-xs text-slate-400">Consist Customizer</span>
            </div>
            <h2 class="text-xl font-black text-white mt-0.5">PERAKITAN RANGKAIAN KERETA API</h2>
          </div>
          <button id="btn-depot-close" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 font-bold text-xs uppercase rounded-xl cursor-pointer">
            ✕ TUTUP
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 my-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-center">
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">Total Berat</div>
            <div class="text-base font-black text-[#FFE500]">${totalWeight} <span class="text-xs text-slate-400">Ton</span></div>
          </div>
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">Panjang Kereta</div>
            <div class="text-base font-black text-cyan-400">${totalLength} <span class="text-xs text-slate-400">Meter</span></div>
          </div>
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">Daya Tarik</div>
            <div class="text-base font-black text-emerald-400">${currentLoco.powerHP} <span class="text-xs text-slate-400">HP</span></div>
          </div>
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">HP / Ton</div>
            <div class="text-base font-black text-amber-400">${hpPerTon}</div>
          </div>
          <div>
            <div class="text-[9px] font-bold text-slate-400 uppercase">Rangkaian</div>
            <div class="text-base font-black text-pink-400">${cars.length + 1} <span class="text-xs text-slate-400">Unit</span></div>
          </div>
        </div>

        <!-- Presets -->
        <div class="mb-3">
          <div class="text-[10px] font-black uppercase text-slate-400 mb-1.5">PILIH RANGKAIAN PRESET:</div>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
            ${PRESET_CONSISTS.map(p => `
              <button data-preset="${p.id}" class="preset-btn text-left p-2 rounded-xl border-2 transition-all cursor-pointer bg-slate-800 hover:bg-slate-700 text-white border-slate-700">
                <div class="text-[8px] uppercase tracking-wider text-pink-400 font-black">${p.badge}</div>
                <div class="text-xs font-bold leading-tight truncate mt-0.5">${p.name}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Locomotive -->
        <div class="mb-3">
          <div class="text-[10px] font-black uppercase text-slate-400 mb-1.5">PILIH LOKOMOTIF:</div>
          <div class="grid grid-cols-1 sm:grid-cols-4 gap-2">
            ${LOCOMOTIVES.map(loco => `
              <button data-loco="${loco.id}" class="loco-select-btn text-left p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                loco.id === currentLoco.id ? 'bg-cyan-700 border-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800 hover:bg-slate-700 border-slate-700'
              }">
                <div class="flex items-center justify-between">
                  <span class="text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${loco.id === currentLoco.id ? 'bg-white text-black' : 'bg-slate-900 text-cyan-400'}">${loco.badge}</span>
                  <span class="text-xs font-mono font-bold">${loco.powerHP} HP</span>
                </div>
                <div class="font-black text-xs text-white mt-1">${loco.name}</div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Consist Strip -->
        <div class="mb-3 p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-[10px] font-black uppercase text-[#FFE500]">GERBONG TERSAMBUNG (COUPLER):</span>
            <button id="btn-clear-cars" class="text-[9px] font-bold text-rose-400 hover:text-rose-300 uppercase cursor-pointer">
              ✕ Kosongkan Gerbong
            </button>
          </div>
          <div class="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
            <div class="shrink-0 p-2 bg-cyan-700 border border-cyan-400 rounded-lg text-center min-w-[95px]">
              <div class="text-xl">🚂</div>
              <div class="text-[11px] font-black text-white truncate">${currentLoco.name.split(' ')[0]}</div>
              <div class="text-[8px] text-cyan-200">${currentLoco.weightTons}T</div>
            </div>

            ${cars.map((car, idx) => `
              <div class="flex items-center shrink-0">
                <span class="text-slate-600 text-[10px] px-0.5">🔗</span>
                <div class="relative group p-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg text-center min-w-[90px]">
                  <button data-remove-car="${idx}" class="remove-car-btn absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center cursor-pointer shadow">
                    ✕
                  </button>
                  <div class="text-lg">${car.icon}</div>
                  <div class="text-[9px] font-bold text-white truncate">${car.name.split(' ')[0]}</div>
                  <div class="text-[8px] text-slate-400">${car.tareWeight + (car.cargoWeight || 0)}T</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Add Carriages Palette -->
        <div class="mb-3">
          <div class="text-[10px] font-black uppercase text-slate-400 mb-1.5">TAMBAHKAN GERBONG:</div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            ${CAR_TYPES.map(car => `
              <button data-add-car="${car.id}" class="add-car-btn flex items-center gap-1.5 p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-left cursor-pointer transition-transform hover:-translate-y-0.5">
                <span class="text-xl">${car.icon}</span>
                <div class="overflow-hidden">
                  <div class="text-[11px] font-black text-white truncate">${car.name}</div>
                  <div class="text-[8px] text-slate-400">${car.tareWeight + (car.cargoWeight || 0)}T • ${car.lengthM}m</div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Launch -->
        <div class="pt-2 border-t border-slate-700 flex justify-end">
          <button id="btn-depot-launch" class="px-5 py-2.5 bg-[#FFE500] hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl border-2 border-black shadow-[3px_3px_0px_0px_#000000] cursor-pointer transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1.5">
            <span>MULAI JALANKAN KERETA</span> <span>▶</span>
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-depot-close')?.addEventListener('click', () => this.toggleDepotModal());
    container.querySelector('#btn-depot-launch')?.addEventListener('click', () => {
      this.isDepotOpen = false;
      this.audio.init();
      this.audio.startEngine();
      this.updateDepotVisibility();
    });

    container.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = btn.getAttribute('data-preset');
        this.sim.loadPresetConsist(pId);
        this.renderDepotContent();
      });
    });

    container.querySelectorAll('.loco-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const lId = btn.getAttribute('data-loco');
        this.sim.setLocomotive(lId);
        this.renderDepotContent();
      });
    });

    container.querySelectorAll('.add-car-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cId = btn.getAttribute('data-add-car');
        this.sim.addCar(cId);
        this.renderDepotContent();
      });
    });

    container.querySelectorAll('.remove-car-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-remove-car'), 10);
        this.sim.removeCar(idx);
        this.renderDepotContent();
      });
    });

    container.querySelector('#btn-clear-cars')?.addEventListener('click', () => {
      this.sim.clearCars();
      this.renderDepotContent();
    });
  }

  /**
   * Anti-Thrashing Cached Telemetry Update
   */
  updateHUD() {
    const speedKmh = Math.abs(Math.round(this.sim.velocityMs * 3.6));
    const speedLimit = this.sim.route.speedLimitKmh;

    // 1. Speedometer
    if (this.cache.speedKmh !== speedKmh) {
      this.cache.speedKmh = speedKmh;
      const speedEl = document.getElementById('hud-speed-value');
      if (speedEl) {
        speedEl.textContent = speedKmh;
        speedEl.className = speedKmh > speedLimit
          ? 'text-xl md:text-2xl font-black font-mono text-rose-500'
          : 'text-xl md:text-2xl font-black font-mono text-[#FFE500]';
      }
    }

    if (this.cache.speedLimit !== speedLimit) {
      this.cache.speedLimit = speedLimit;
      const limitEl = document.getElementById('hud-speed-limit');
      if (limitEl) limitEl.textContent = speedLimit;
    }

    // 2. Reverser
    if (this.cache.reverser !== this.sim.reverser) {
      this.cache.reverser = this.sim.reverser;
      const revEl = document.getElementById('hud-reverser');
      if (revEl) {
        revEl.textContent = this.sim.reverser === 1 ? 'FWD' : (this.sim.reverser === -1 ? 'REV' : 'N');
        revEl.className = `font-black text-[10px] px-1.5 py-0.5 rounded ${
          this.sim.reverser === 1 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
          this.sim.reverser === -1 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
          'bg-slate-700 text-slate-300'
        }`;
      }
    }

    // 3. Throttle Notch
    if (this.cache.notch !== this.sim.throttleNotch) {
      this.cache.notch = this.sim.throttleNotch;
      const notchEl = document.getElementById('hud-notch');
      if (notchEl) {
        notchEl.textContent = `N${this.sim.throttleNotch}`;
      }
    }

    // 4. Brakes
    const bpFixed = this.sim.brakePipeBar.toFixed(1);
    if (this.cache.bp !== bpFixed) {
      this.cache.bp = bpFixed;
      const bpEl = document.getElementById('hud-bp');
      if (bpEl) bpEl.textContent = `${bpFixed} bar`;
    }

    const bcFixed = this.sim.brakeCylinderBar.toFixed(1);
    if (this.cache.bc !== bcFixed) {
      this.cache.bc = bcFixed;
      const bcEl = document.getElementById('hud-bc');
      if (bcEl) bcEl.textContent = `${bcFixed} bar`;
    }

    // 5. Wheel Slip Warning
    if (this.cache.slip !== this.sim.isWheelSlipping) {
      this.cache.slip = this.sim.isWheelSlipping;
      const slipEl = document.getElementById('hud-wheelslip-alert');
      if (slipEl) {
        slipEl.className = this.sim.isWheelSlipping
          ? 'px-1.5 py-0.5 bg-rose-600 text-white font-black text-[9px] rounded uppercase animate-pulse'
          : 'hidden';
      }
    }

    // 6. Station & Timetable
    if (this.sim.route && this.sim.route.stations) {
      const nextSt = this.sim.route.stations.find(s => s.posM >= this.sim.distanceM - s.platformLenM / 2) || this.sim.route.stations[this.sim.route.stations.length - 1];
      if (nextSt) {
        const dist = Math.round(nextSt.posM - this.sim.distanceM);
        const distStr = Math.abs(dist) < nextSt.platformLenM / 2 ? `PERON (${Math.abs(dist)}m)` : `${dist > 0 ? dist : 0}m`;
        
        if (this.cache.stationName !== nextSt.name || this.cache.stationDist !== distStr) {
          this.cache.stationName = nextSt.name;
          this.cache.stationDist = distStr;
          const stEl = document.getElementById('hud-mini-station');
          if (stEl) stEl.textContent = `${nextSt.name} • ${distStr}`;
        }
      }
    }

    // 7. Boarding progress bar
    const boardingPct = Math.round(this.sim.boardingProgress * 100);
    if (this.cache.boardingPct !== boardingPct) {
      this.cache.boardingPct = boardingPct;
      const bar = document.getElementById('hud-boarding-bar');
      if (bar) bar.style.width = `${boardingPct}%`;
    }

    // 8. Doors
    if (this.cache.doors !== this.sim.doorsOpen) {
      this.cache.doors = this.sim.doorsOpen;
      const doorsBtn = document.getElementById('btn-doors');
      if (doorsBtn) {
        doorsBtn.textContent = this.sim.doorsOpen ? '🚪 PINTU: BUKA' : '🚪 PINTU: TUTUP';
        doorsBtn.className = this.sim.doorsOpen
          ? 'px-2 py-1 bg-amber-500 text-black font-black text-[11px] uppercase rounded border border-black cursor-pointer'
          : 'px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] uppercase rounded border border-slate-700 cursor-pointer';
      }
    }

    // 9. Switch Points
    if (this.sim.route.switches && this.sim.route.switches.length > 0) {
      const sw = this.sim.route.switches[0];
      if (this.cache.switchState !== sw.isDiverged) {
        this.cache.switchState = sw.isDiverged;
        const switchBtn = document.getElementById('btn-switch');
        if (switchBtn) {
          switchBtn.textContent = sw.isDiverged ? '🔀 WESEL: BELOK' : '🔀 WESEL: LURUS';
          switchBtn.className = sw.isDiverged
            ? 'px-2 py-1 bg-pink-600 text-white font-black text-[11px] uppercase rounded border border-black cursor-pointer'
            : 'px-2 py-1 bg-emerald-600 text-white font-bold text-[11px] uppercase rounded border border-black cursor-pointer';
        }
      }
    }
  }

  /**
   * Compact, Tight, Space-Saving HTML Layout
   */
  renderLayout() {
    this.container.innerHTML = `
      <div id="train-master-wrapper" class="relative w-full h-full overflow-hidden bg-slate-950 select-none flex flex-col font-sans">
        <!-- 1. Top Ultra-Compact Menu Bar (h-10) -->
        <header class="h-10 bg-slate-900 border-b-2 border-black px-3 flex items-center justify-between z-30 shrink-0">
          <div class="flex items-center gap-2">
            <a href="#/" id="train-return-btn" class="px-2.5 py-1 bg-[#FFE500] hover:bg-white text-black font-black text-[11px] uppercase tracking-wider rounded-lg border border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1 cursor-pointer transition-transform active:translate-y-0.5">
              <span>◀</span> <span>HUB</span>
            </a>
            <div class="flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 bg-pink-600 text-white font-black text-[9px] uppercase rounded">TRAIN SIM</span>
              <span class="hidden sm:inline text-xs font-black text-white tracking-wide">STEEL & RAILS 2D</span>
            </div>
          </div>

          <!-- Micro Station Pill -->
          <div class="flex items-center gap-2 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-lg">
            <span class="text-xs">🚉</span>
            <span id="hud-mini-station" class="text-[11px] font-bold text-white truncate max-w-[200px] sm:max-w-[320px]">Memuat Rute...</span>
            <div class="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
              <div id="hud-boarding-bar" class="h-full bg-emerald-500 transition-all duration-200" style="width: 0%"></div>
            </div>
            <span id="hud-wheelslip-alert" class="hidden">SLIP</span>
          </div>

          <div class="flex items-center gap-1.5">
            <button id="train-depot-toggle" class="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] uppercase rounded-lg border border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1 cursor-pointer">
              <span>🛠️</span> <span>DEPO</span>
            </button>

            <button id="train-weather-btn" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer">
              <span>🌤️</span> <span id="train-weather-label">GOLDEN</span>
            </button>

            <button id="train-audio-btn" class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 flex items-center justify-center cursor-pointer text-xs">
              <span id="train-audio-icon">🔊</span>
            </button>

            <button id="train-help-btn" class="w-7 h-7 bg-[#FFE500] hover:bg-white text-black font-black rounded-lg border border-black flex items-center justify-center cursor-pointer text-xs">
              ?
            </button>
          </div>
        </header>

        <!-- 2. Simulation Canvas -->
        <div id="canvas-container" class="relative flex-1 w-full overflow-hidden bg-slate-950">
          <canvas id="train-canvas" class="block w-full h-full"></canvas>

          <!-- Floating Micro-Camera Buttons (Top-Right) -->
          <div class="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-lg shadow-md z-20">
            <button id="btn-freecam-reset" class="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-black rounded cursor-pointer flex items-center gap-1 transition-transform active:scale-95" title="Reset posisi kamera geser (C)">
              <span>🔄</span> <span>RESET CAM [C]</span>
            </button>
            <div class="w-px h-3 bg-slate-700 mx-0.5"></div>
            <button id="cam-btn-1" class="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-black text-white rounded cursor-pointer">1: KABIN</button>
            <button id="cam-btn-2" class="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-black text-white rounded cursor-pointer">2: RANGKAIAN</button>
            <button id="cam-btn-3" class="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-[9px] font-black text-white rounded cursor-pointer">3: TRACKSIDE</button>
            <div class="w-px h-3 bg-slate-700 mx-0.5"></div>
            <button id="zoom-in-btn" class="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-white rounded flex items-center justify-center cursor-pointer" title="Perbesar (Zoom In)">+</button>
            <button id="zoom-out-btn" class="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-white rounded flex items-center justify-center cursor-pointer" title="Perkecil (Zoom Out)">-</button>
          </div>

          <!-- Freecam Desktop Hint Pill (Bottom-Left of Canvas) -->
          <div class="absolute bottom-2 left-2 pointer-events-none hidden md:flex items-center gap-1.5 bg-slate-950/75 backdrop-blur border border-slate-800/80 px-2 py-1 rounded-md text-[9px] text-slate-300 font-mono z-10">
            <span class="text-amber-400 font-bold">🖱️ FREECAM:</span>
            <span>Hold Klik Kanan / Swipe Drag untuk geser kamera • Scroll Zoom • Tombol [C] Reset</span>
          </div>
        </div>

        <!-- 3. Smart Collapsible Cab Console (Default Compact ~46px, Expandable) -->
        <footer class="bg-slate-900 border-t-2 border-black z-30 shrink-0 flex flex-col">
          <!-- Compact Primary Micro-Dock -->
          <div class="h-12 px-3 flex items-center justify-between gap-2 text-white">
            <!-- Speedometer Cluster -->
            <div class="flex items-center gap-2 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 shrink-0">
              <div class="flex items-baseline gap-1">
                <span id="hud-speed-value" class="text-xl md:text-2xl font-black font-mono text-[#FFE500]">0</span>
                <span class="text-[9px] text-slate-400 font-bold">KM/H</span>
              </div>
              <div class="text-[9px] text-slate-400 border-l border-slate-800 pl-2">
                Batas: <span id="hud-speed-limit" class="text-white font-bold">80</span>
              </div>
              <span id="hud-reverser" class="font-black text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">FWD</span>
              <span id="hud-notch" class="font-mono font-bold text-amber-400 text-[11px]">N0</span>
            </div>

            <!-- Driving Controls Cluster -->
            <div class="flex items-center gap-1.5">
              <!-- Throttle -->
              <div class="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <span class="text-[8px] font-bold text-slate-400 px-1">GAS</span>
                <button id="btn-notch-down" class="w-7 h-7 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded flex items-center justify-center cursor-pointer">-</button>
                <button id="btn-notch-up" class="w-7 h-7 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded flex items-center justify-center cursor-pointer font-bold shadow">+</button>
              </div>

              <!-- Brakes -->
              <div class="flex items-center gap-0.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <span class="text-[8px] font-bold text-slate-400 px-1">REM</span>
                <button id="btn-brake-release" class="px-2 h-7 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded cursor-pointer">LEPAS</button>
                <button id="btn-brake-apply" class="px-2 h-7 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded cursor-pointer shadow">REM</button>
              </div>

              <!-- Horn -->
              <button id="btn-horn" class="h-8 px-3 bg-[#FFE500] hover:bg-white text-black font-black text-[11px] uppercase tracking-wider rounded-lg border border-black shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1 cursor-pointer active:translate-y-0.5">
                <span>📯</span> <span>SEMBOYAN 35</span>
              </button>
            </div>

            <!-- Quick Action Toggles & Drawer Collapse Button -->
            <div class="flex items-center gap-1.5">
              <button id="btn-doors" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] uppercase rounded border border-slate-700 cursor-pointer">
                🚪 PINTU: TUTUP
              </button>

              <button id="btn-switch" class="px-2 py-1 bg-emerald-600 text-white font-bold text-[11px] uppercase rounded border border-black cursor-pointer">
                🔀 WESEL: LURUS
              </button>

              <button id="btn-ebrake" class="h-8 px-2.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-[10px] uppercase rounded-lg border border-black shadow flex items-center gap-1 cursor-pointer">
                <span>🛑</span> <span>E-BRAKE</span>
              </button>

              <!-- Full Console Drawer Toggle -->
              <button id="btn-cab-toggle" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded border border-slate-700 cursor-pointer">
                <span>▲ PANEL LENGKAP</span>
              </button>
            </div>
          </div>

          <!-- Collapsible Full Detail Console (Revealed on Demand) -->
          <div id="cab-full-panel" class="hidden border-t border-slate-800 bg-slate-950 p-2.5 text-xs text-white grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
              <div class="text-[9px] font-bold text-slate-400 uppercase">TEKANAN PIPA REM (BP)</div>
              <div id="hud-bp" class="font-mono font-black text-cyan-400 text-sm">5.0 bar</div>
            </div>
            <div class="bg-slate-900 p-2 rounded-lg border border-slate-800 text-center">
              <div class="text-[9px] font-bold text-slate-400 uppercase">TEKANAN SILINDER REM (BC)</div>
              <div id="hud-bc" class="font-mono font-black text-rose-400 text-sm">0.0 bar</div>
            </div>
            <div class="flex items-center justify-center gap-1 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
              <button id="btn-reverser-fwd" class="px-2 py-1 text-[10px] font-bold bg-emerald-600 rounded cursor-pointer">FWD</button>
              <button id="btn-reverser-neu" class="px-2 py-1 text-[10px] font-bold bg-slate-800 rounded cursor-pointer">NEUT</button>
              <button id="btn-reverser-rev" class="px-2 py-1 text-[10px] font-bold bg-amber-600 rounded cursor-pointer">REV</button>
            </div>
            <div class="flex items-center justify-center gap-2">
              <button id="btn-bell" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded border border-slate-700 cursor-pointer">
                🔔 Genta Stasiun (B)
              </button>
              <button id="btn-sander" class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[10px] rounded border border-slate-700 cursor-pointer">
                ⏳ Pasir Rel (F)
              </button>
            </div>
          </div>
        </footer>

        <!-- 4. Depot / Consist Builder Modal -->
        <div id="train-depot-modal" class="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div id="depot-builder-content" class="w-full flex justify-center"></div>
        </div>

        <!-- 5. Keyboard Help Modal -->
        <div id="train-help-modal" class="hidden">
          <div class="max-w-md w-full bg-slate-900 border-3 border-black rounded-2xl p-5 text-white shadow-[6px_6px_0px_0px_#FFE500]">
            <div class="flex items-center justify-between pb-2 border-b border-slate-700">
              <h3 class="font-black text-base text-[#FFE500]">KONTROL MASINIS DESKTOP</h3>
              <button id="btn-close-help" class="text-slate-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>
            <div class="space-y-1.5 mt-3 text-xs font-mono">
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Gas / Throttle (Notch)</span>
                <span class="font-bold text-amber-400">W / S</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Pengereman Bertahap</span>
                <span class="font-bold text-rose-400">A (Rem) / D (Lepas)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Klakson Semboyan 35</span>
                <span class="font-bold text-[#FFE500]">SPASI (Tahan)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Reverser Maju / Mundur</span>
                <span class="font-bold text-emerald-400">R</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Genta Keberangkatan</span>
                <span class="font-bold text-white">B</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Penyemprot Pasir Adhesi</span>
                <span class="font-bold text-amber-300">F</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Pintu Penumpang</span>
                <span class="font-bold text-cyan-300">O (Buka/Tutup)</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Reset Posisi Freecam</span>
                <span class="font-bold text-amber-400">C</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Freecam Geser Kamera</span>
                <span class="font-bold text-yellow-300">Hold Klik-Kanan / Tepi Layar</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Zoom Kamera In/Out</span>
                <span class="font-bold text-cyan-400">Scroll Mouse / [+/-]</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Ganti Wesel Rel</span>
                <span class="font-bold text-pink-400">T</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Rem Darurat (E-Brake)</span>
                <span class="font-bold text-rose-500">X</span>
              </div>
              <div class="flex justify-between py-1 border-b border-slate-800">
                <span class="text-slate-400">Buka/Kemas Panel Cab</span>
                <span class="font-bold text-yellow-300">TAB</span>
              </div>
              <div class="flex justify-between py-1">
                <span class="text-slate-400">Preset Kamera</span>
                <span class="font-bold text-white">1 (Kabin) / 2 (Tengah) / 3 (Sisi Rel)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-help')?.addEventListener('click', () => this.toggleHelpModal());
    this.renderDepotContent();
  }
}
