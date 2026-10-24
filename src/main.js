/**
 * Master System Controller & Tycoon Applet Entry (October 2026 Standards).
 * 100% Pure Vanilla ES Modules • Zero Frameworks • Zero Dependencies • Zero TypeScript.
 * Dedicated to: My Company Simulator - Business Tycoon, Stocks & Conglomerate Engine.
 * Specifically architected for Desktop/Laptop 16:9 Widescreen Displays.
 */

import { TycoonApp } from './tycoon/tycoonApp.js';

class AppController {
  constructor() {
    this.appContainer = document.getElementById('app');
    if (!this.appContainer) {
      this.appContainer = document.createElement('div');
      this.appContainer.id = 'app';
      document.body.appendChild(this.appContainer);
    }
    this.appContainer.className = 'w-screen h-screen overflow-hidden bg-[#070B14] text-slate-100';

    // Global navigation API
    window.navigateTo = (path) => {
      window.location.hash = path;
    };

    this.mountTycoon();
  }

  mountTycoon() {
    document.title = 'My Company Simulator - Business Tycoon, Stocks & Conglomerate Engine';
    this.appContainer.replaceChildren();

    const tycoonContainer = document.createElement('div');
    tycoonContainer.id = 'tycoon-root';
    tycoonContainer.className = 'w-screen h-screen overflow-hidden flex flex-col';
    this.appContainer.appendChild(tycoonContainer);

    this.engine = new TycoonApp(tycoonContainer, {
      onReturnToBeranda: () => {
        if (this.engine) {
          this.engine.destroy();
        }
        this.mountTycoon();
      },
    });
  }
}

// Start App when DOM is interactive
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new AppController());
} else {
  new AppController();
}
