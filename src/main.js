/**
 * Client-Side Router & Master Entry Point.
 * 100% Pure JavaScript (No TSX / TypeScript overhead).
 * Coordinates /beranda (Game Center & Selector), /moba (5v5 MOBA), and /mmorpg or /rpg (Forest of Savior).
 */

import { BerandaView } from './beranda/berandaView.js';
import { MobaGameEngine } from './moba/mobaEngine.js';
import { GameEngine as RpgGameEngine } from './rpg/main.js';
import { KingdomEngine } from './kingdom/kingdomEngine.js';
import { TruckGameEngine } from './truck/truckEngine.js';
import { TrainGameEngine } from './train/trainEngine.js';

class AppRouter {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.currentEngine = null;

    // Global navigation helper
    window.navigateTo = (path, state = {}) => {
      this.navigate(path, state);
    };

    window.addEventListener('popstate', () => {
      this.handleRoute();
    });

    window.addEventListener('hashchange', () => {
      this.handleRoute();
    });

    this.handleRoute();
  }

  getCurrentPath() {
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      return hash.startsWith('/') ? hash : `/${hash}`;
    }
    const path = window.location.pathname;
    return path;
  }

  navigate(path, state = {}) {
    this.cleanupCurrentView();

    // Use hash navigation for flawless web preview iframe compatibility
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
    window.history.pushState(state, '', window.location.pathname + window.location.hash);
    this.renderRoute(path, state);
  }

  cleanupCurrentView() {
    if (this.currentEngine && typeof this.currentEngine.destroy === 'function') {
      try {
        this.currentEngine.destroy();
      } catch (err) {
        console.warn('Engine teardown warning:', err);
      }
    }
    this.currentEngine = null;
    if (this.appContainer) {
      this.appContainer.innerHTML = '';
    }
  }

  handleRoute() {
    const path = this.getCurrentPath();
    const state = window.history.state || {};
    this.cleanupCurrentView();
    this.renderRoute(path, state);
  }

  renderRoute(path, state) {
    const normalized = path.replace(/^\//, '').split('?')[0].split('#')[0];

    if (normalized === 'moba') {
      this.mountMoba(state);
    } else if (normalized === 'rpg' || normalized === 'mmorpg') {
      this.mountRpg(state);
    } else if (normalized === 'kingdom' || normalized === 'idle') {
      this.mountKingdom(state);
    } else if (normalized === 'truck' || normalized === 'simulator') {
      this.mountTruck(state);
    } else if (normalized === 'trainsim' || normalized === 'train') {
      this.mountTrain(state);
    } else {
      // Default: /beranda (Game Center Selector)
      this.mountBeranda();
    }
  }

  mountBeranda() {
    document.title = 'NEO ARCADE // Web Game Center - ゲームセンター';
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-[#FF2A85] text-slate-900';
    new BerandaView(this.appContainer);
  }

  mountMoba(state = {}) {
    document.title = 'Dawn Arena 5v5 - MOBA MLBB Web Edition';
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-slate-950 relative';
    this.appContainer.innerHTML = `
      <div id="game-container" class="relative w-full h-full overflow-hidden bg-slate-950 select-none">
        <canvas id="game-canvas" class="block w-full h-full cursor-crosshair"></canvas>
        <div id="game-ui" class="absolute inset-0 pointer-events-none"></div>

        <!-- In-game Return to Hub Button -->
        <a href="#/" id="in-game-return-btn" class="absolute top-3 left-3 z-50 pointer-events-auto px-4 py-2 bg-[#FFE500] hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
          <span class="text-sm">◀</span> <span>GAME CENTER / ゲームセンター</span>
        </a>
      </div>
    `;

    document.getElementById('in-game-return-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/');
    });

    // Instantiate MOBA engine
    this.currentEngine = new MobaGameEngine({
      heroId: state.heroId || 'layla',
      spellId: state.spellId || 'flicker'
    });
  }

  mountRpg(state = {}) {
    document.title = 'Forest of Savior - Anime MMORPG';
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-slate-950 relative';
    this.appContainer.innerHTML = `
      <div id="game-container" class="relative w-full h-full overflow-hidden bg-slate-950 select-none">
        <canvas id="game-canvas" class="block w-full h-full cursor-crosshair"></canvas>
        <div id="game-ui" class="absolute inset-0 pointer-events-none"></div>

        <!-- In-game Return to Hub Button -->
        <a href="#/" id="in-game-return-btn" class="absolute top-3 left-3 z-50 pointer-events-auto px-4 py-2 bg-[#FFE500] hover:bg-white text-black font-black text-xs uppercase tracking-wider rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_#000000] flex items-center gap-2 transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer">
          <span class="text-sm">◀</span> <span>GAME CENTER / ゲームセンター</span>
        </a>
      </div>
    `;

    document.getElementById('in-game-return-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      window.navigateTo('/');
    });

    // Instantiate RPG engine
    this.currentEngine = new RpgGameEngine();
  }

  mountKingdom(state = {}) {
    document.title = 'Kingdom Idle: Reborn - Incremental Strategy Realm';
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 relative';
    this.currentEngine = new KingdomEngine(this.appContainer);
  }

  mountTruck(state = {}) {
    document.title = 'Truck Simulator: Mud & Cargo - 2D Realistic Heavy Hauler';
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 relative';
    this.currentEngine = new TruckGameEngine(this.appContainer);
  }

  mountTrain(state = {}) {
    document.title = 'Train Simulator: Steel & Rails - 2D Realistic Railway';
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 relative';
    this.currentEngine = new TrainGameEngine(this.appContainer);
  }
}

// Initialize router when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AppRouter());
} else {
  new AppRouter();
}
