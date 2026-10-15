/**
 * Train Simulator: Steel & Rails - High-Performance 60-120FPS 2D Canvas Renderer
 * Modern Japan 2026 Anime & Cinematic Edition:
 * - 100% Zoom-Consistent Vector Blueprint Architecture:
 *   Every vehicle is rendered in unified local coordinate space (screenX, railheadY) with ctx.scale(camZoom, camZoom).
 *   Sub-millimeter railhead alignment: Zero floating, zero sinking, zero cropped elements at ANY zoom factor (45% - 250%).
 * - Full Free Camera (Freecam):
 *   Default smooth freecam following train motion with custom horizontal offset.
 *   Hold right-click & drag, left-click drag, mouse edge pan, mouse wheel zoom, and key 'C' smooth recenter.
 * - Accurate Physical Wheel Kinematics:
 *   True wheel rotation angle (distM * 18 / wheelRadius) with rotating lightening holes, axle bearing caps,
 *   brake calipers, and fully synchronized Walschaerts valve gear connecting rods on steam drivers.
 * - Volumetric Particle System:
 *   Fluid expansion, aerodynamic drag from train speed, turbulent swirling vortices, and soft alpha dissipation.
 * - Modern Japan 2026 Scenery:
 *   Mount Fuji (snowcapped peak), Tokyo Skytree & Tokyo Tower, neo-cyber illuminated skyscrapers,
 *   blooming Sakura groves with drifting cherry blossom petals, red Shinto Torii gates,
 *   authentic Japanese level crossings (踏切 Fumikiri) with warning chimes,
 *   and Japanese stations every ~450m (Sakuragicho, Shinjuku, Fujimidai, Akihabara, Hakone-Yumoto, Tokyo Central).
 */

export class TrainRenderer {
  constructor(canvas, sim) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sim = sim;

    // Camera & Freecam System
    this.camX = 150;
    this.camY = 0;
    this.camZoom = 1.05;
    this.camOffsetX = 0; // Freecam horizontal offset relative to train in world meters
    this.targetCamOffsetX = 0;
    this.cameraMode = 'follow_loco'; // 'follow_loco' | 'consist_center' | 'trackside'
    this.tracksideCamX = 400;

    // Interactive Dragging / Panning State
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartOffsetX = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.isHoveringCanvas = false;

    // Particles (Smoke, Steam, Sparks, Sakura Petals)
    this.smokeParticles = [];
    this.steamClouds = [];
    this.brakeSparks = [];
    this.sakuraPetals = [];

    // Lighting and Weather
    this.timeOfDay = 'golden_hour'; // 'day' | 'golden_hour' | 'night' | 'rain'
    this.timeCounter = 0;

    // Viewport dimensions
    this.displayWidth = 1200;
    this.displayHeight = 700;

    // Bind event handlers
    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.resize();

    this.initMouseInteractions();
    this.initSakuraPetals();
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (parent) {
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.floor(rect.width * dpr);
      this.canvas.height = Math.floor(rect.height * dpr);
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.displayWidth = rect.width;
      this.displayHeight = rect.height;
    }
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.cleanupMouse) {
      this.cleanupMouse();
    }
  }

  initMouseInteractions() {
    const canvas = this.canvas;
    canvas.style.cursor = 'grab';

    const onMouseDown = (e) => {
      // Right-click (button 2) or Left-click (button 0)
      if (e.button === 0 || e.button === 2) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartOffsetX = this.camOffsetX;
        canvas.style.cursor = 'grabbing';
      }
    };

    const onContextMenu = (e) => {
      e.preventDefault(); // Prevent default browser context menu on canvas for seamless right-click freecam!
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
      this.isHoveringCanvas = true;

      if (this.isDragging) {
        const dx = e.clientX - this.dragStartX;
        const scale = 18 * this.camZoom;
        // Panning moves the camera opposite to drag direction
        this.camOffsetX = this.dragStartOffsetX - (dx / scale);
        this.targetCamOffsetX = this.camOffsetX;
      }
    };

    const onMouseUp = () => {
      this.isDragging = false;
      canvas.style.cursor = 'grab';
    };

    const onMouseLeave = () => {
      this.isDragging = false;
      this.isHoveringCanvas = false;
      canvas.style.cursor = 'grab';
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.camZoom = Math.max(0.5, Math.min(2.4, this.camZoom * zoomFactor));
    };

    // Touch support for laptops with touchscreens or trackpads
    let touchStartX = 0;
    let touchStartOffset = 0;
    const onTouchStart = (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartOffset = this.camOffsetX;
      }
    };
    const onTouchMove = (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchStartX;
        const scale = 18 * this.camZoom;
        this.camOffsetX = touchStartOffset - (dx / scale);
        this.targetCamOffsetX = this.camOffsetX;
      }
    };
    const onTouchEnd = () => {
      this.isDragging = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd);

    this.cleanupMouse = () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }

  initSakuraPetals() {
    this.sakuraPetals = [];
    for (let i = 0; i < 35; i++) {
      this.sakuraPetals.push({
        x: Math.random() * 1600,
        y: Math.random() * 800,
        vx: -18 - Math.random() * 25,
        vy: 12 + Math.random() * 18,
        size: 3 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 4,
        opacity: 0.55 + Math.random() * 0.4
      });
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    if (mode === 'follow_loco') {
      this.targetCamOffsetX = 0;
    } else if (mode === 'consist_center') {
      const totalLen = this.sim.getTotalTrainLengthM();
      this.targetCamOffsetX = -totalLen / 2;
    } else if (mode === 'trackside') {
      this.tracksideCamX = this.sim.distanceM + (this.sim.velocityMs >= 0 ? 110 : -110);
    }
  }

  resetFreecam() {
    this.targetCamOffsetX = 0;
    this.camOffsetX = 0;
    this.cameraMode = 'follow_loco';
  }

  cycleWeather() {
    const modes = ['golden_hour', 'day', 'night', 'rain'];
    const idx = modes.indexOf(this.timeOfDay);
    this.timeOfDay = modes[(idx + 1) % modes.length];
    return this.timeOfDay;
  }

  worldToScreen(distM, elevationM = 0) {
    const scale = 18 * this.camZoom;
    const sx = this.displayWidth / 2 + (distM - this.camX) * scale;
    const baseY = this.displayHeight * 0.65;
    const sy = baseY - (elevationM - this.camY) * scale;
    return { x: sx, y: sy };
  }

  screenToWorld(sx, sy) {
    const scale = 18 * this.camZoom;
    const distM = (sx - this.displayWidth / 2) / scale + this.camX;
    const baseY = this.displayHeight * 0.65;
    const elevationM = (baseY - sy) / scale + this.camY;
    return { distM, elevationM };
  }

  render(dt) {
    if (!this.ctx) return;
    this.timeCounter += dt;

    this.updateCamera(dt);
    this.drawSkyAndAtmosphere(dt);
    this.drawJapanModernParallax(dt);
    this.drawRailwayInfrastructure(dt);
    this.drawStationAndSignals(dt);
    this.drawTrainConsist(dt);
    this.drawStationForeground(dt);
    this.renderParticles(dt);
    this.renderSakuraPetals(dt);
    this.drawWeatherOverlay(dt);
    this.drawFreecamIndicator();
  }

  updateCamera(dt) {
    // Note: Edge hovering does NOT move the camera. Panning is strictly input-driven via drag/swipe hold!

    // Smooth lerp to targetCamOffsetX if set by buttons
    if (Math.abs(this.targetCamOffsetX - this.camOffsetX) > 0.05 && !this.isDragging) {
      this.camOffsetX += (this.targetCamOffsetX - this.camOffsetX) * Math.min(1.0, dt * 6);
    }

    // Base camera follow
    if (this.cameraMode === 'trackside') {
      this.camX += (this.tracksideCamX - this.camX) * Math.min(1.0, dt * 6);
    } else {
      // Follow the train motion precisely, locked to the user's custom camOffsetX
      const trainBase = this.sim.distanceM + (this.sim.velocityMs * 0.15);
      const targetX = trainBase + this.camOffsetX;
      this.camX += (targetX - this.camX) * Math.min(1.0, dt * 10);
    }
  }

  /**
   * Layer 0: Japanese Anime Sky & Lighting
   */
  drawSkyAndAtmosphere(dt) {
    const w = this.displayWidth;
    const h = this.displayHeight;

    const skyGrad = this.ctx.createLinearGradient(0, 0, 0, h * 0.72);
    if (this.timeOfDay === 'golden_hour') {
      // Makoto Shinkai style romantic sunset
      skyGrad.addColorStop(0, '#701a75');   // Deep violet
      skyGrad.addColorStop(0.25, '#c2410c'); // Warm crimson
      skyGrad.addColorStop(0.55, '#f97316'); // Radiant orange
      skyGrad.addColorStop(0.82, '#fde047'); // Golden amber
      skyGrad.addColorStop(1, '#ffedd5');    // Warm horizon glow
    } else if (this.timeOfDay === 'day') {
      // Vibrant anime blue sky
      skyGrad.addColorStop(0, '#0284c7');   // Rich cobalt
      skyGrad.addColorStop(0.45, '#38bdf8'); // Sky cyan
      skyGrad.addColorStop(0.85, '#bae6fd'); // Soft pale blue
      skyGrad.addColorStop(1, '#f0f9ff');    // Radiant white horizon
    } else if (this.timeOfDay === 'night') {
      // Neo-Tokyo Cyberpunk Night
      skyGrad.addColorStop(0, '#020617');   // Obsidian
      skyGrad.addColorStop(0.5, '#0f172a');  // Deep midnight
      skyGrad.addColorStop(0.85, '#1e1b4b'); // Cyber indigo glow
      skyGrad.addColorStop(1, '#311042');    // Distant city light haze
    } else if (this.timeOfDay === 'rain') {
      // Atmospheric moody Japanese rain
      skyGrad.addColorStop(0, '#1e293b');
      skyGrad.addColorStop(0.65, '#475569');
      skyGrad.addColorStop(1, '#94a3b8');
    }

    this.ctx.fillStyle = skyGrad;
    this.ctx.fillRect(0, 0, w, h);

    // Stars at Night
    if (this.timeOfDay === 'night') {
      this.ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 60; i++) {
        const sx = ((i * 173 + this.camX * 0.005) % w);
        const sy = (i * 97) % (h * 0.45);
        const twinkle = Math.sin(this.timeCounter * 3 + i) > 0.3 ? 1.5 : 0.8;
        this.ctx.fillRect(sx, sy, twinkle, twinkle);
      }
    }

    // Anime Sun with Soft Lens Flare
    if (this.timeOfDay === 'golden_hour' || this.timeOfDay === 'day') {
      const sunX = w * 0.78 - (this.camX * 0.008) % (w * 1.5);
      const sunY = h * 0.22;
      const sunR = this.timeOfDay === 'golden_hour' ? 44 : 36;

      const sunGlow = this.ctx.createRadialGradient(sunX, sunY, sunR * 0.2, sunX, sunY, sunR * 2.8);
      sunGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      sunGlow.addColorStop(0.3, this.timeOfDay === 'golden_hour' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(186, 230, 253, 0.5)');
      sunGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = sunGlow;
      this.ctx.beginPath();
      this.ctx.arc(sunX, sunY, sunR * 2.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  /**
   * Layer 1 - 4: Modern Japan 2026 Dynamic Parallax Scenery
   * Fully responsive to train speed and position:
   * Uses physical world coordinate transformations (scale = 18 * this.camZoom).
   * Features 5 distinct geographic zones across the route (0m - 6800m+):
   * 1. Neo-Tokyo Metropolis & Shinjuku Skyscraper Cluster (0m - 1400m)
   * 2. Tokyo Suburbs, Residential Living & Sakura Groves (1400m - 2700m)
   * 3. Mount Fuji Foothills & Sacred Shinto Heritage (2700m - 4100m)
   * 4. Hakone Alpine Mountain Pass & Ravine (4100m - 5300m)
   * 5. Yokohama Coastal Port & Bay Bridge Terminus (5300m - 6800m+)
   */
  drawJapanModernParallax(dt) {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const trackY = h * 0.65;
    const scale = 18 * this.camZoom;

    // 1. Far Mount Fuji & Horizon (Parallax 0.05x - responsive to train movement)
    this.drawMountFuji(w, trackY, scale);

    // 2. Distant Mountains, Horizons & Landmark Silhouettes (Parallax 0.16x)
    this.drawDistantHorizons(w, trackY, scale, dt);

    // 3. Midground City Skyline, Expressway, Ferris Wheel, Pagoda & Ropeway (Parallax 0.36x)
    this.drawMidgroundScenery(w, trackY, scale, dt);

    // 4. Near Suburbs, Convenience Stores, Vending Machines, Torii Gates & Trees (Parallax 0.68x)
    this.drawNearScenery(w, trackY, scale, dt);
  }

  /**
   * Helper to compute screen X from world meters with parallax factor
   */
  calcParallaxX(worldM, parallaxFactor, cycleM = 6800) {
    const w = this.displayWidth;
    const scale = 18 * this.camZoom;
    // Normalized relative offset with seamless world wrapping
    let diffM = (worldM - this.camX);
    if (cycleM > 0) {
      diffM = ((diffM % cycleM) + cycleM * 1.5) % cycleM - (cycleM / 2);
    }
    return (w / 2) + diffM * (scale * parallaxFactor);
  }

  drawMountFuji(w, trackY, scale) {
    // Mount Fuji is anchored at 2800m world coordinate (near Fujimidai & Lake Kawaguchiko)
    const fujiScreenX = this.calcParallaxX(2800, 0.05, 6800);
    const fujiBaseW = 540;
    const fujiPeakH = 240;
    const fujiPeakY = trackY - fujiPeakH;

    // Viewport cull
    if (fujiScreenX < -fujiBaseW || fujiScreenX > w + fujiBaseW) return;

    this.ctx.save();

    // Volcanic Slopes
    const slopeGrad = this.ctx.createLinearGradient(0, fujiPeakY, 0, trackY);
    if (this.timeOfDay === 'golden_hour') {
      slopeGrad.addColorStop(0, '#9a3412');
      slopeGrad.addColorStop(0.4, '#7c2d12');
      slopeGrad.addColorStop(1, '#431407');
    } else if (this.timeOfDay === 'night') {
      slopeGrad.addColorStop(0, '#1e1b4b');
      slopeGrad.addColorStop(1, '#090d16');
    } else {
      slopeGrad.addColorStop(0, '#3b82f6');
      slopeGrad.addColorStop(0.5, '#1e3a8a');
      slopeGrad.addColorStop(1, '#0f172a');
    }

    this.ctx.fillStyle = slopeGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(fujiScreenX - fujiBaseW / 2, trackY + 20);
    this.ctx.quadraticCurveTo(fujiScreenX - fujiBaseW * 0.22, fujiPeakY + 65, fujiScreenX - 38, fujiPeakY);
    this.ctx.lineTo(fujiScreenX + 38, fujiPeakY);
    this.ctx.quadraticCurveTo(fujiScreenX + fujiBaseW * 0.22, fujiPeakY + 65, fujiScreenX + fujiBaseW / 2, trackY + 20);
    this.ctx.closePath();
    this.ctx.fill();

    // Iconic Snow-Capped Crown (Fuji Snowcap)
    const snowGrad = this.ctx.createLinearGradient(0, fujiPeakY, 0, fujiPeakY + 75);
    snowGrad.addColorStop(0, '#ffffff');
    snowGrad.addColorStop(0.7, this.timeOfDay === 'golden_hour' ? '#fed7aa' : '#e0f2fe');
    snowGrad.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

    this.ctx.fillStyle = snowGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(fujiScreenX - 38, fujiPeakY);
    this.ctx.lineTo(fujiScreenX + 38, fujiPeakY);
    this.ctx.lineTo(fujiScreenX + 75, fujiPeakY + 58);
    // Jagged snow finger tongues
    this.ctx.lineTo(fujiScreenX + 44, fujiPeakY + 48);
    this.ctx.lineTo(fujiScreenX + 24, fujiPeakY + 72);
    this.ctx.lineTo(fujiScreenX + 5, fujiPeakY + 52);
    this.ctx.lineTo(fujiScreenX - 16, fujiPeakY + 68);
    this.ctx.lineTo(fujiScreenX - 48, fujiPeakY + 50);
    this.ctx.lineTo(fujiScreenX - 75, fujiPeakY + 58);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();
  }

  drawDistantHorizons(w, trackY, scale, dt) {
    const pf = 0.16;
    this.ctx.save();

    // Distant mountain ridge silhouette that dynamically scrolls with train motion
    const pDist = (this.camX * scale * pf);
    const mGrad = this.ctx.createLinearGradient(0, trackY - 140, 0, trackY);
    if (this.timeOfDay === 'golden_hour') {
      mGrad.addColorStop(0, '#7c2d12');
      mGrad.addColorStop(1, '#431407');
    } else if (this.timeOfDay === 'night') {
      mGrad.addColorStop(0, '#0f172a');
      mGrad.addColorStop(1, '#020617');
    } else {
      mGrad.addColorStop(0, '#1d4ed8');
      mGrad.addColorStop(1, '#0f172a');
    }
    this.ctx.fillStyle = mGrad;

    const ridgeStep = 320;
    const startTile = Math.floor((this.camX * pf * scale - w) / ridgeStep) - 1;
    const endTile = Math.floor((this.camX * pf * scale + w * 2) / ridgeStep) + 1;

    this.ctx.beginPath();
    this.ctx.moveTo(0, trackY);
    for (let t = startTile; t <= endTile; t++) {
      const rx = t * ridgeStep - (pDist % ridgeStep);
      const rh = 70 + Math.sin(t * 1.7) * 35 + Math.cos(t * 0.9) * 25;
      this.ctx.lineTo(rx, trackY - rh);
    }
    this.ctx.lineTo(w, trackY);
    this.ctx.closePath();
    this.ctx.fill();

    // Tokyo Skytree (World pos: ~450m)
    const skytreeX = this.calcParallaxX(450, pf);
    if (skytreeX > -100 && skytreeX < w + 100) {
      this.drawTokyoSkytree(skytreeX, trackY);
    }

    // Tokyo Tower (World pos: ~950m)
    const tokyoTowerX = this.calcParallaxX(950, pf);
    if (tokyoTowerX > -100 && tokyoTowerX < w + 100) {
      this.drawTokyoTower(tokyoTowerX, trackY);
    }

    // Yokohama Landmark Tower (World pos: ~5100m)
    const landmarkX = this.calcParallaxX(5100, pf);
    if (landmarkX > -100 && landmarkX < w + 100) {
      this.drawLandmarkTower(landmarkX, trackY);
    }

    // Yokohama Bay Bridge Suspension Towers (World pos: ~5500m)
    const bayBridgeX = this.calcParallaxX(5500, pf);
    if (bayBridgeX > -200 && bayBridgeX < w + 200) {
      this.drawBayBridgeCables(bayBridgeX, trackY);
    }

    this.ctx.restore();
  }

  drawTokyoSkytree(x, trackY) {
    const skytreeH = 265;
    this.ctx.fillStyle = '#64748b';
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 22, trackY);
    this.ctx.lineTo(x - 6, trackY - skytreeH * 0.6);
    this.ctx.lineTo(x - 2, trackY - skytreeH);
    this.ctx.lineTo(x + 2, trackY - skytreeH);
    this.ctx.lineTo(x + 6, trackY - skytreeH * 0.6);
    this.ctx.lineTo(x + 22, trackY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Skytree Observation Decks
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(x - 16, trackY - skytreeH * 0.58, 32, 10);
    this.ctx.fillRect(x - 12, trackY - skytreeH * 0.78, 24, 7);

    // Flashing Red Aviation Strobe
    if (Math.sin(this.timeCounter * 6) > 0.3) {
      this.ctx.fillStyle = '#ef4444';
      this.ctx.shadowColor = '#ef4444';
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(x, trackY - skytreeH - 4, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }
  }

  drawTokyoTower(x, trackY) {
    const towerH = 190;
    this.ctx.fillStyle = '#ea580c';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 18, trackY);
    this.ctx.lineTo(x - 3, trackY - towerH);
    this.ctx.lineTo(x + 3, trackY - towerH);
    this.ctx.lineTo(x + 18, trackY);
    this.ctx.closePath();
    this.ctx.fill();

    // White Lattice Section Bands
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x - 13, trackY - towerH * 0.38, 26, 8);
    this.ctx.fillRect(x - 9, trackY - towerH * 0.68, 18, 7);
  }

  drawLandmarkTower(x, trackY) {
    const lmH = 220;
    const lmW = 55;
    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x - lmW / 2, trackY);
    this.ctx.lineTo(x - lmW * 0.35, trackY - lmH);
    this.ctx.lineTo(x + lmW * 0.35, trackY - lmH);
    this.ctx.lineTo(x + lmW / 2, trackY);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Light crown
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.fillRect(x - 10, trackY - lmH - 12, 20, 12);
  }

  drawBayBridgeCables(x, trackY) {
    const pylonH = 160;
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(x - 8, trackY - pylonH, 16, pylonH);
    this.ctx.fillRect(x + 120 - 8, trackY - pylonH, 16, pylonH);

    // Suspension cables
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 90, trackY - 40);
    this.ctx.quadraticCurveTo(x, trackY - pylonH + 10, x + 60, trackY - 50);
    this.ctx.quadraticCurveTo(x + 120, trackY - pylonH + 10, x + 210, trackY - 40);
    this.ctx.stroke();
  }

  drawMidgroundScenery(w, trackY, scale, dt) {
    const pf = 0.36;
    this.ctx.save();

    // 1. ZONE 1: SHINJUKU & NEO-TOKYO METROPOLIS (0m - 1400m & 5800m - 6800m)
    const cityBuildings = [
      { worldM: 100, w: 70, h: 180, color: '#0f172a', billboard: '新宿 2026' },
      { worldM: 220, w: 90, h: 225, color: '#1e293b', billboard: 'JR EAST' },
      { worldM: 350, w: 60, h: 160, color: '#1e1b4b', billboard: '新幹線' },
      { worldM: 480, w: 85, h: 210, color: '#0f172a', billboard: 'NEO TOKYO' },
      { worldM: 620, w: 75, h: 175, color: '#334155', billboard: 'SONY' },
      { worldM: 760, w: 95, h: 235, color: '#0f172a', billboard: '秋葉原' },
      { worldM: 900, w: 65, h: 155, color: '#1e293b' },
      { worldM: 1040, w: 80, h: 190, color: '#1e1b4b', billboard: 'CYBER TOKYO' },
      { worldM: 1180, w: 70, h: 145, color: '#0f172a' },
      // Tokyo Central approach
      { worldM: 5900, w: 90, h: 220, color: '#0f172a', billboard: 'TOKYO CENTRAL' },
      { worldM: 6100, w: 105, h: 240, color: '#1e293b', billboard: 'YAMANOTE' },
      { worldM: 6300, w: 85, h: 200, color: '#1e1b4b', billboard: 'SHINKANSEN' }
    ];

    cityBuildings.forEach(b => {
      const bx = this.calcParallaxX(b.worldM, pf);
      if (bx > -120 && bx < w + 120) {
        this.drawSkyscraper(bx, trackY, b.w, b.h, b.color, b.billboard);
      }
    });

    // Elevated Shuto Expressway with animated car traffic in Zone 1
    const expX = this.calcParallaxX(600, pf);
    if (expX > -300 && expX < w + 300) {
      this.drawShutoExpressway(expX, trackY, dt);
    }

    // 2. ZONE 3: CHUREITO 5-STORY PAGODA (World pos: ~3200m)
    const pagodaX = this.calcParallaxX(3200, pf);
    if (pagodaX > -100 && pagodaX < w + 100) {
      this.drawPagoda(pagodaX, trackY);
    }

    // 3. ZONE 4: HAKONE CABLE CAR ROPEWAY (World pos: ~4500m)
    const ropewayX = this.calcParallaxX(4500, pf);
    if (ropewayX > -250 && ropewayX < w + 250) {
      this.drawCableCarRopeway(ropewayX, trackY, dt);
    }

    // 4. ZONE 5: YOKOHAMA COSMO CLOCK 21 FERRIS WHEEL (World pos: ~4900m)
    const ferrisX = this.calcParallaxX(4900, pf);
    if (ferrisX > -250 && ferrisX < w + 250) {
      this.drawCosmoClockFerrisWheel(ferrisX, trackY, dt);
    }

    // 5. ZONE 5: HARBOR CONTAINER CRANES (World pos: ~5350m)
    const craneX = this.calcParallaxX(5350, pf);
    if (craneX > -150 && craneX < w + 150) {
      this.drawHarborCranes(craneX, trackY);
    }

    this.ctx.restore();
  }

  drawSkyscraper(bx, trackY, bw, bh, color, billboard) {
    const by = trackY - bh;

    // Building facade
    this.ctx.fillStyle = color;
    this.ctx.fillRect(bx, by, bw, bh);

    // Window grid
    this.ctx.fillStyle = this.timeOfDay === 'night'
      ? '#fef08a'
      : (this.timeOfDay === 'golden_hour' ? 'rgba(251, 191, 36, 0.45)' : 'rgba(56, 189, 248, 0.35)');

    const cols = Math.floor(bw / 9);
    const rows = Math.floor(bh / 12);
    for (let r = 1; r < rows; r++) {
      for (let c = 1; c < cols; c++) {
        if ((r + c) % 2 === 0) {
          this.ctx.fillRect(bx + c * 8, by + r * 11, 5, 6);
        }
      }
    }

    // Illuminated Neon Billboard
    if (billboard) {
      const boardW = bw - 14;
      const boardH = 22;
      const boardY = by + 12;
      this.ctx.fillStyle = '#020617';
      this.ctx.fillRect(bx + 7, boardY, boardW, boardH);

      this.ctx.fillStyle = this.timeOfDay === 'night' ? '#ec4899' : '#0284c7';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(bx + 7, boardY, boardW, boardH);

      this.ctx.font = 'bold 9px "DotGothic16", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(billboard, bx + bw / 2, boardY + 15);
    }
  }

  drawShutoExpressway(x, trackY, dt) {
    const expH = 75;
    const expY = trackY - expH;
    const expW = 420;

    // Viaduct support pillars
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(x - expW / 2 + 50, expY, 18, expH);
    this.ctx.fillRect(x + expW / 2 - 50, expY, 18, expH);

    // Road deck
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(x - expW / 2, expY - 8, expW, 10);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(x - expW / 2, expY - 12, expW, 4); // Guardrail

    // Moving Car Headlights / Taillights along highway
    const trafficTime = this.timeCounter * 50;
    for (let i = 0; i < 4; i++) {
      const carX = x - expW / 2 + ((trafficTime + i * 110) % expW);
      // Eastbound (White headlights)
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(carX, expY - 14, 14, 5);
      this.ctx.fillStyle = '#fef08a';
      this.ctx.fillRect(carX + 12, expY - 13, 3, 3);
    }
  }

  drawPagoda(x, trackY) {
    const pW = 58;
    const tiers = 5;
    this.ctx.save();

    for (let i = 0; i < tiers; i++) {
      const tierW = pW - (i * 6);
      const tierH = 14;
      const tierY = trackY - (i * 22) - 18;

      // Vermilion wooden walls
      this.ctx.fillStyle = '#dc2626';
      this.ctx.fillRect(x - tierW * 0.35, tierY, tierW * 0.7, tierH);

      // Curved pagoda eaves roof
      this.ctx.fillStyle = '#1e293b';
      this.ctx.beginPath();
      this.ctx.moveTo(x - tierW / 2 - 8, tierY);
      this.ctx.lineTo(x, tierY - 8);
      this.ctx.lineTo(x + tierW / 2 + 8, tierY);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Sorin Spire Finial
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(x - 2, trackY - tiers * 22 - 32, 4, 18);
    this.ctx.restore();
  }

  drawCableCarRopeway(x, trackY, dt) {
    this.ctx.save();
    // Pylon towers
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 120, trackY);
    this.ctx.lineTo(x - 120, trackY - 120);
    this.ctx.moveTo(x + 120, trackY);
    this.ctx.lineTo(x + 120, trackY - 150);
    this.ctx.stroke();

    // Steel cables
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#475569';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 200, trackY - 105);
    this.ctx.lineTo(x - 120, trackY - 120);
    this.ctx.lineTo(x + 120, trackY - 150);
    this.ctx.lineTo(x + 220, trackY - 165);
    this.ctx.stroke();

    // Gliding Gondola Cabin
    const gondolaProgress = (this.timeCounter * 0.08) % 1.0;
    const gx = (x - 120) + (240 * gondolaProgress);
    const gy = (trackY - 120) + ((trackY - 150) - (trackY - 120)) * gondolaProgress + 10;

    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(gx - 8, gy, 16, 12);
    this.ctx.fillStyle = '#e0f2fe';
    this.ctx.fillRect(gx - 6, gy + 2, 12, 5);
    this.ctx.restore();
  }

  drawCosmoClockFerrisWheel(x, trackY, dt) {
    const wheelR = 85;
    const wheelY = trackY - wheelR - 15;
    const rot = this.timeCounter * 0.35;

    this.ctx.save();
    // A-Frame Support legs
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(x - 45, trackY);
    this.ctx.lineTo(x, wheelY);
    this.ctx.lineTo(x + 45, trackY);
    this.ctx.stroke();

    // Outer Illuminated Wheel Rim
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x, wheelY, wheelR, 0, Math.PI * 2);
    this.ctx.stroke();

    // Rotating Spokes with glowing LED lights
    const numSpokes = 16;
    for (let s = 0; s < numSpokes; s++) {
      const angle = rot + (s * Math.PI * 2 / numSpokes);
      const sx = x + Math.cos(angle) * wheelR;
      const sy = wheelY + Math.sin(angle) * wheelR;

      this.ctx.strokeStyle = (s % 2 === 0) ? '#f43f5e' : '#38bdf8';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(x, wheelY);
      this.ctx.lineTo(sx, sy);
      this.ctx.stroke();

      // Gondola cabin
      this.ctx.fillStyle = (s % 3 === 0) ? '#facc15' : '#ffffff';
      this.ctx.fillRect(sx - 3, sy - 3, 6, 6);
    }

    // Center Clock Hub
    this.ctx.fillStyle = '#0284c7';
    this.ctx.beginPath();
    this.ctx.arc(x, wheelY, 9, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawHarborCranes(x, trackY) {
    // Red & White Maritime Gantry Crane
    this.ctx.save();
    const cH = 130;
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.lineWidth = 2.5;

    // Legs
    this.ctx.beginPath();
    this.ctx.moveTo(x - 28, trackY);
    this.ctx.lineTo(x - 14, trackY - cH);
    this.ctx.lineTo(x + 14, trackY - cH);
    this.ctx.lineTo(x + 28, trackY);
    this.ctx.stroke();

    // Boom arm
    this.ctx.beginPath();
    this.ctx.moveTo(x - 40, trackY - cH);
    this.ctx.lineTo(x + 75, trackY - cH);
    this.ctx.stroke();

    // Cab
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(x - 10, trackY - cH + 4, 18, 12);
    this.ctx.restore();
  }

  drawNearScenery(w, trackY, scale, dt) {
    const pf = 0.68;
    this.ctx.save();

    // Deterministic distribution of near roadside architecture across zones:
    // 1. SUBURBS (1400m - 2800m): Japanese Houses, Conbini, Vending Machines, Sakura Trees
    const suburbElements = [
      { type: 'house', m: 1450 },
      { type: 'vending', m: 1530 },
      { type: 'sakura', m: 1590 },
      { type: 'conbini', m: 1680 },
      { type: 'house', m: 1790 },
      { type: 'sakura', m: 1870 },
      { type: 'house', m: 1960 },
      { type: 'vending', m: 2040 },
      { type: 'sakura', m: 2120 },
      { type: 'house', m: 2210 },
      { type: 'conbini', m: 2340 },
      { type: 'vending', m: 2420 },
      { type: 'sakura', m: 2500 },
      { type: 'house', m: 2600 }
    ];

    // 2. SHINTO & FUJI HERITAGE (2800m - 4100m): Torii Gates, Stone Lanterns, Sakura, Old Houses
    const shintoElements = [
      { type: 'torii', m: 2850 },
      { type: 'sakura', m: 2950 },
      { type: 'torii', m: 3300 },
      { type: 'house', m: 3450 },
      { type: 'sakura', m: 3600 },
      { type: 'torii', m: 3850 },
      { type: 'sakura', m: 4000 }
    ];

    // 3. YOKOHAMA SEAPORT (4700m - 5700m): Shipping Container Stacks
    const harborElements = [
      { type: 'container', m: 4750 },
      { type: 'container', m: 4950 },
      { type: 'container', m: 5150 },
      { type: 'container', m: 5350 },
      { type: 'container', m: 5550 }
    ];

    const allNear = [...suburbElements, ...shintoElements, ...harborElements];

    allNear.forEach(item => {
      const sx = this.calcParallaxX(item.m, pf);
      if (sx < -120 || sx > w + 120) return;

      if (item.type === 'house') {
        this.drawJapaneseHouse(sx, trackY);
      } else if (item.type === 'sakura') {
        this.drawSakuraTree(sx, trackY);
      } else if (item.type === 'torii') {
        this.drawToriiGate(sx, trackY);
      } else if (item.type === 'conbini') {
        this.drawConbini(sx, trackY);
      } else if (item.type === 'vending') {
        this.drawVendingMachines(sx, trackY);
      } else if (item.type === 'container') {
        this.drawContainerStack(sx, trackY);
      }
    });

    this.ctx.restore();
  }

  drawJapaneseHouse(x, trackY) {
    const houseW = 85;
    const houseH = 50;
    const houseY = trackY - houseH;

    // Plaster Walls
    this.ctx.fillStyle = '#f1f5f9';
    this.ctx.fillRect(x, houseY, houseW, houseH);
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(x, houseY, houseW, houseH);

    // Traditional Japanese Gabled Tile Roof (Kawara)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 10, houseY);
    this.ctx.lineTo(x + houseW / 2, houseY - 20);
    this.ctx.lineTo(x + houseW + 10, houseY);
    this.ctx.closePath();
    this.ctx.fill();

    // Wood Sliding Doors & Windows (Shoji style)
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(x + 12, houseY + 16, 26, 34);
    this.ctx.fillStyle = this.timeOfDay === 'night' ? '#fef08a' : '#bae6fd';
    this.ctx.fillRect(x + 14, houseY + 18, 22, 14);

    this.ctx.fillStyle = this.timeOfDay === 'night' ? '#fef08a' : '#bae6fd';
    this.ctx.fillRect(x + 48, houseY + 14, 25, 18);

    // Wall Air Conditioner Outdoor Unit
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(x + houseW - 18, houseY + 34, 14, 12);
  }

  drawSakuraTree(x, trackY) {
    const trunkH = 55;
    const crownR = 36;

    // Brown Wood Trunk
    this.ctx.fillStyle = '#5c2c16';
    this.ctx.beginPath();
    this.ctx.moveTo(x - 5, trackY);
    this.ctx.lineTo(x - 3, trackY - trunkH);
    this.ctx.lineTo(x + 3, trackY - trunkH);
    this.ctx.lineTo(x + 5, trackY);
    this.ctx.closePath();
    this.ctx.fill();

    // Vibrant Blooming Sakura Petal Crown
    const sakuraColors = ['#f472b6', '#ec4899', '#fbcfe8', '#f9a8d4'];
    sakuraColors.forEach((color, i) => {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      const ox = (i === 0 ? 0 : (i === 1 ? -14 : (i === 2 ? 14 : 0)));
      const oy = (i === 0 ? 0 : (i === 1 ? -8 : (i === 2 ? -6 : -16)));
      this.ctx.arc(x + ox, trackY - trunkH + oy, crownR * (0.85 + (i % 2) * 0.15), 0, Math.PI * 2);
      this.ctx.fill();
    });
  }

  drawToriiGate(x, trackY) {
    const toriiH = 65;
    const toriiW = 44;

    // Bright Crimson Red Wood
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(x - toriiW / 2, trackY - toriiH, 6, toriiH);
    this.ctx.fillRect(x + toriiW / 2 - 6, trackY - toriiH, 6, toriiH);

    // Kasagi Top Beam (Curved ends)
    this.ctx.fillStyle = '#b91c1c';
    this.ctx.fillRect(x - toriiW / 2 - 12, trackY - toriiH - 6, toriiW + 24, 7);

    // Nuki Crossbeam
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(x - toriiW / 2 - 6, trackY - toriiH + 12, toriiW + 12, 5);

    // Black Top Cap
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(x - toriiW / 2 - 14, trackY - toriiH - 9, toriiW + 28, 3);
  }

  drawConbini(x, trackY) {
    const storeW = 95;
    const storeH = 42;
    const storeY = trackY - storeH;

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, storeY, storeW, storeH);
    this.ctx.strokeStyle = '#334155';
    this.ctx.strokeRect(x, storeY, storeW, storeH);

    // Glowing Conbini Awning Stripes (Blue / Green / White)
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(x, storeY, storeW, 6);
    this.ctx.fillStyle = '#16a34a';
    this.ctx.fillRect(x, storeY + 6, storeW, 4);

    // Store Glass Entrance
    this.ctx.fillStyle = this.timeOfDay === 'night' ? '#fef08a' : '#e0f2fe';
    this.ctx.fillRect(x + 10, storeY + 14, storeW - 20, storeH - 14);

    // 24H Sign
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.fillText('24H', x + storeW / 2 - 8, storeY + 11);
  }

  drawVendingMachines(x, trackY) {
    // Red (Coca-Cola/Hot Coffee) and Blue (Water/Tea) Jihanki
    const mH = 26;
    this.ctx.fillStyle = '#dc2626';
    this.ctx.fillRect(x, trackY - mH, 12, mH);
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(x + 13, trackY - mH, 12, mH);

    // Lit Can Displays
    this.ctx.fillStyle = this.timeOfDay === 'night' ? '#fef08a' : '#ffffff';
    this.ctx.fillRect(x + 2, trackY - mH + 4, 8, 8);
    this.ctx.fillRect(x + 15, trackY - mH + 4, 8, 8);
  }

  drawContainerStack(x, trackY) {
    // Intermodal Shipping Containers (ONE Magenta, NYK Dark Blue, Evergreen Emerald)
    const cW = 60;
    const cH = 22;

    // Bottom container: ONE Magenta
    this.ctx.fillStyle = '#e11d48';
    this.ctx.fillRect(x, trackY - cH, cW, cH);
    this.ctx.strokeStyle = '#9f1239';
    this.ctx.strokeRect(x, trackY - cH, cW, cH);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 7px sans-serif';
    this.ctx.fillText('ONE', x + 6, trackY - 8);

    // Top container: NYK Blue
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(x + 10, trackY - cH * 2, cW, cH);
    this.ctx.strokeStyle = '#172554';
    this.ctx.strokeRect(x + 10, trackY - cH * 2, cW, cH);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('NYK', x + 16, trackY - cH - 8);
  }

  /**
   * Layer 5: Railway Infrastructure (Rails, Ballast, Bridges, Catenary, Tunnels)
   */
  drawRailwayInfrastructure(dt) {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const trackY = h * 0.65;
    const scale = 18 * this.camZoom;

    const viewLeftM = this.camX - (w / 2) / scale - 30;
    const viewRightM = this.camX + (w / 2) / scale + 30;

    // 1. Bridges & Japanese Shinkansen Concrete Viaducts
    if (this.sim.route && this.sim.route.bridges) {
      this.sim.route.bridges.forEach(b => {
        if (b.endM >= viewLeftM && b.startM <= viewRightM) {
          const p1 = this.worldToScreen(b.startM);
          const p2 = this.worldToScreen(b.endM);

          // River water with sparkling surface reflections
          this.ctx.fillStyle = '#0284c7';
          this.ctx.fillRect(p1.x, h - 45, p2.x - p1.x, 45);

          // Water ripple highlights
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          for (let rx = p1.x; rx <= p2.x; rx += 40) {
            const wave = Math.sin(this.timeCounter * 3 + rx * 0.05) * 2;
            this.ctx.fillRect(rx, h - 35 + wave, 24, 2);
          }

          // Shinkansen-style Solid Concrete Viaduct Deck
          this.ctx.fillStyle = '#94a3b8';
          this.ctx.fillRect(p1.x, trackY, p2.x - p1.x, 16);

          // Massive Concrete Piers
          const pierSpacingM = 35;
          this.ctx.fillStyle = '#64748b';
          for (let m = b.startM; m <= b.endM; m += pierSpacingM) {
            const pierScr = this.worldToScreen(m);
            this.ctx.fillRect(pierScr.x - 10, trackY + 16, 20, h - (trackY + 16) - 45);
          }

          // Steel Truss Overhead Arches
          this.ctx.strokeStyle = '#dc2626';
          this.ctx.lineWidth = 3.5;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, trackY);
          this.ctx.lineTo((p1.x + p2.x) / 2, trackY - 95 * this.camZoom);
          this.ctx.lineTo(p2.x, trackY);
          this.ctx.stroke();
        }
      });
    }

    // 2. Embankment Ground (Japanese green embankment / ballast bed)
    this.ctx.fillStyle = this.timeOfDay === 'night' ? '#090d16' : '#15803d';
    this.ctx.fillRect(0, trackY + 18, w, h - (trackY + 18));

    // 3. Ballast Bed (Clean volcanic crushed gravel / Kerikil Balas)
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(0, trackY, w, 18);
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(0, trackY, w, 5);

    // 4. Concrete Sleepers / Ties (Bantalan Beton Shinkansen/JR)
    const sleeperSpacingM = 0.65;
    const startSleeperM = Math.floor(viewLeftM / sleeperSpacingM) * sleeperSpacingM;
    const sleeperW = Math.max(3, 4.2 * this.camZoom);
    const sleeperH = 8.5 * this.camZoom;

    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;

    for (let m = startSleeperM; m <= viewRightM; m += sleeperSpacingM) {
      const scr = this.worldToScreen(m);
      this.ctx.fillRect(scr.x - sleeperW / 2, trackY + 1, sleeperW, sleeperH);
      this.ctx.strokeRect(scr.x - sleeperW / 2, trackY + 1, sleeperW, sleeperH);
    }

    // 5. Continuous Polished Steel Rails (JIS 60kg Heavy Rail)
    // Rail Base & Web
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(0, trackY - 5 * this.camZoom, w, 6 * this.camZoom);

    // Railhead Polished Steel Highlight (The true rail contact line at trackY - 6 * camZoom)
    const railheadY = trackY - 6 * this.camZoom;
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(0, railheadY, w, 2.5 * this.camZoom);

    // Rail Expansion Joints every 50m
    const startJointM = Math.floor(viewLeftM / 50) * 50;
    for (let m = startJointM; m <= viewRightM; m += 50) {
      const scr = this.worldToScreen(m);
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(scr.x - 1, railheadY - 2, 2, 8 * this.camZoom);
      this.ctx.fillStyle = '#64748b';
      this.ctx.fillRect(scr.x - 5, railheadY + 1, 10, 4 * this.camZoom);
    }

    // 6. Japanese Overhead Catenary Gantries (JR East 架線柱)
    const catenarySpacingM = 50;
    const startPoleM = Math.floor(viewLeftM / catenarySpacingM) * catenarySpacingM;
    const wireY = trackY - 110 * this.camZoom;
    const messengerY = wireY - 15 * this.camZoom;

    // Contact Trolley Wire (Copper)
    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 1.2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, wireY);
    this.ctx.lineTo(w, wireY);
    this.ctx.stroke();

    // Messenger Catenary Cable
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, messengerY);
    this.ctx.lineTo(w, messengerY);
    this.ctx.stroke();

    // Steel Lattice Catenary Masts
    for (let m = startPoleM; m <= viewRightM; m += catenarySpacingM) {
      const scr = this.worldToScreen(m);
      const poleH = 135 * this.camZoom;

      // Green Steel Lattice Mast (JR Style)
      this.ctx.fillStyle = '#15803d';
      this.ctx.fillRect(scr.x - 3.5, trackY - poleH, 7, poleH + 10);

      // Cantilever Arm
      this.ctx.strokeStyle = '#cbd5e1';
      this.ctx.lineWidth = 2.2;
      this.ctx.beginPath();
      this.ctx.moveTo(scr.x, trackY - poleH + 12);
      this.ctx.lineTo(scr.x + 24 * this.camZoom, wireY);
      this.ctx.stroke();

      // Ceramic Tension Insulator (Orange)
      this.ctx.fillStyle = '#ea580c';
      this.ctx.fillRect(scr.x + 18 * this.camZoom, wireY - 6, 6, 8);
    }

    // 7. Mountain Tunnels (Hakone Tunnel)
    if (this.sim.route && this.sim.route.tunnels) {
      this.sim.route.tunnels.forEach(t => {
        if (t.endM >= viewLeftM && t.startM <= viewRightM) {
          const p1 = this.worldToScreen(t.startM);
          const p2 = this.worldToScreen(t.endM);

          // Tunnel Interior Abyss
          this.ctx.fillStyle = '#05070c';
          this.ctx.fillRect(p1.x, trackY - 130 * this.camZoom, p2.x - p1.x, 150 * this.camZoom);

          this.drawTunnelPortal(p1.x, trackY, true, '箱根山トンネル');
          this.drawTunnelPortal(p2.x, trackY, false, 'HAKONE EXIT');
        }
      });
    }
  }

  drawTunnelPortal(x, trackY, isEntrance, title) {
    this.ctx.save();
    this.ctx.fillStyle = '#334155';
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.rect(x - 26, trackY - 140 * this.camZoom, 52, 145 * this.camZoom);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#020617';
    this.ctx.beginPath();
    this.ctx.arc(x, trackY - 48 * this.camZoom, 38 * this.camZoom, Math.PI, 0);
    this.ctx.lineTo(x + 38 * this.camZoom, trackY);
    this.ctx.lineTo(x - 38 * this.camZoom, trackY);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#f8fafc';
    this.ctx.font = 'bold 9px "DotGothic16", monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, x, trackY - 120 * this.camZoom);
    this.ctx.restore();
  }

  /**
   * Layer 5B: Station Backgrounds, Skybridges, Platforms & Signage
   * Full 3-Tier Architecture (Grand Terminal, City Station, Rural Halte)
   */
  drawStationAndSignals(dt) {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const trackY = h * 0.65;
    const scale = 18 * this.camZoom;
    const viewLeftM = this.camX - (w / 2) / scale - 30;
    const viewRightM = this.camX + (w / 2) / scale + 30;

    // 1. Station Platforms & Architectural Shells
    if (this.sim.route && this.sim.route.stations) {
      this.sim.route.stations.forEach(st => {
        const platStartM = st.posM - st.platformLenM / 2;
        const platEndM = st.posM + st.platformLenM / 2;

        if (platEndM >= viewLeftM && platStartM <= viewRightM) {
          const p1 = this.worldToScreen(platStartM);
          const p2 = this.worldToScreen(platEndM);
          const platWidth = p2.x - p1.x;
          const platHeight = 15 * this.camZoom;

          // Dispatch to Tier-Specific Station Architectures
          if (st.type === 'large') {
            this.drawGrandTerminalStation(st, p1, p2, platWidth, platHeight, trackY, dt, platStartM, platEndM);
          } else if (st.type === 'medium') {
            this.drawCityMediumStation(st, p1, p2, platWidth, platHeight, trackY, dt, platStartM, platEndM);
          } else {
            this.drawRuralSmallStation(st, p1, p2, platWidth, platHeight, trackY, dt, platStartM, platEndM);
          }
        }
      });
    }

    // 2. Japanese Level Crossings (踏切 Fumikiri)
    if (this.sim.route && this.sim.route.crossings) {
      this.sim.route.crossings.forEach(cr => {
        if (cr.posM >= viewLeftM - 30 && cr.posM <= viewRightM + 30) {
          const scr = this.worldToScreen(cr.posM);
          this.drawJapaneseFumikiri(scr.x, trackY, cr.isGateClosed, cr.bellActive);
        }
      });
    }

    // 3. Block Color Light Signals
    if (this.sim.route && this.sim.route.signals) {
      this.sim.route.signals.forEach(sig => {
        if (sig.posM >= viewLeftM - 15 && sig.posM <= viewRightM + 15) {
          const scr = this.worldToScreen(sig.posM);
          this.drawColorLightSignal(scr.x, trackY, sig.aspect);
        }
      });
    }
  }

  /**
   * TIER 1: STASIUN BESAR (Grand Megastation / Terminal)
   * Monumental barrel-vault glass spaceframe, suspended skybridge concourse,
   * animated electronic arrival warnings, LED matrix boards, kiosks & bustling crowds!
   */
  drawGrandTerminalStation(st, p1, p2, platWidth, platHeight, trackY, dt, platStartM, platEndM) {
    if (platStartM === undefined) platStartM = st.posM - st.platformLenM / 2;
    if (platEndM === undefined) platEndM = st.posM + st.platformLenM / 2;
    const platY = trackY - platHeight;
    const isTrainArriving = Math.abs(this.sim.distanceM - st.posM) < 320;
    const isTrainStopped = isTrainArriving && Math.abs(this.sim.velocityMs) < 0.2;

    this.ctx.save();

    // 1. Soaring Glass Barrel-Vault Atrium (Rises 175px above tracks)
    const atriumH = 175 * this.camZoom;
    const atriumApexY = trackY - atriumH;

    // Translucent Skyframe Backdrop
    const atriumGrad = this.ctx.createLinearGradient(0, atriumApexY, 0, trackY);
    atriumGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    atriumGrad.addColorStop(0.3, 'rgba(30, 41, 59, 0.85)');
    atriumGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.22)');
    atriumGrad.addColorStop(1, 'rgba(2, 6, 23, 0.95)');

    this.ctx.fillStyle = atriumGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x - 10, platY);
    this.ctx.quadraticCurveTo((p1.x + p2.x) / 2, atriumApexY, p2.x + 10, platY);
    this.ctx.closePath();
    this.ctx.fill();

    // Monumental Curved Steel Arches & Skylight Mullions
    this.ctx.strokeStyle = '#38bdf8';
    this.ctx.lineWidth = 2.5 * this.camZoom;
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x - 10, platY);
    this.ctx.quadraticCurveTo((p1.x + p2.x) / 2, atriumApexY, p2.x + 10, platY);
    this.ctx.stroke();

    // Internal Diagonal Steel Spaceframe Trusses
    this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
    this.ctx.lineWidth = 1.2;
    const archStep = 55 * this.camZoom;
    for (let ax = p1.x + 20; ax <= p2.x - 20; ax += archStep) {
      this.ctx.beginPath();
      this.ctx.moveTo(ax, platY);
      this.ctx.lineTo(ax, atriumApexY + 25 * this.camZoom);
      this.ctx.lineTo(ax + archStep * 0.5, atriumApexY + 15 * this.camZoom);
      this.ctx.stroke();
    }

    // 2. Suspended Skybridge Concourse & Overhead Walkway (trackY - 115 * camZoom)
    const skybridgeY = trackY - 115 * this.camZoom;
    const skybridgeH = 22 * this.camZoom;

    // Concourse floor and ceiling
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(p1.x + 30, skybridgeY, platWidth - 60, skybridgeH);
    this.ctx.strokeStyle = '#0284c7';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(p1.x + 30, skybridgeY, platWidth - 60, skybridgeH);

    // Illuminated glass windows with silhouettes of commuters walking overhead
    this.ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
    this.ctx.fillRect(p1.x + 35, skybridgeY + 4, platWidth - 70, skybridgeH - 8);

    // Walking commuter silhouettes inside skybridge
    for (let c = 0; c < 12; c++) {
      const cx = p1.x + 50 + ((c * 75 + this.timeCounter * 20) % (platWidth - 100));
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(cx, skybridgeY + 7, 3 * this.camZoom, 11 * this.camZoom);
      this.ctx.beginPath();
      this.ctx.arc(cx + 1.5 * this.camZoom, skybridgeY + 5, 2 * this.camZoom, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Escalators descending to platform
    const centerScr = this.worldToScreen(st.posM);
    this.ctx.strokeStyle = '#64748b';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(centerScr.x - 120 * this.camZoom, skybridgeY + skybridgeH);
    this.ctx.lineTo(centerScr.x - 40 * this.camZoom, platY);
    this.ctx.moveTo(centerScr.x + 120 * this.camZoom, skybridgeY + skybridgeH);
    this.ctx.lineTo(centerScr.x + 40 * this.camZoom, platY);
    this.ctx.stroke();

    // 3. Platform Concrete Deck
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(p1.x, platY, platWidth, platHeight);
    this.ctx.fillStyle = '#94a3b8';
    this.ctx.fillRect(p1.x, platY, platWidth, 4 * this.camZoom);

    // Yellow Tenji Braille Hazard Tiles
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(p1.x, platY + 1, platWidth, 3 * this.camZoom);

    // 4. Master Electronic Departure Information Board (High up at trackY - 148 * camZoom)
    const ledY = trackY - 148 * this.camZoom;
    const ledW = 160 * this.camZoom;
    const ledH = 26 * this.camZoom;
    this.ctx.fillStyle = '#020617';
    this.ctx.fillRect(centerScr.x - ledW / 2, ledY, ledW, ledH);
    this.ctx.strokeStyle = isTrainArriving ? '#f59e0b' : '#38bdf8';
    this.ctx.lineWidth = 1.5;
    this.ctx.strokeRect(centerScr.x - ledW / 2, ledY, ledW, ledH);

    // Electronic Matrix Display Text
    this.ctx.font = `bold ${Math.max(7, 9 * this.camZoom)}px monospace`;
    this.ctx.textAlign = 'center';
    if (isTrainArriving) {
      // Blinking arrival alert
      const flash = Math.sin(this.timeCounter * 10) > 0;
      this.ctx.fillStyle = flash ? '#ef4444' : '#facc15';
      this.ctx.fillText('⚠️ 電車がまいります / TRAIN ARRIVING ⚠️', centerScr.x, ledY + 11 * this.camZoom);
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillText('14:35 [特別急行] 東京行 1-10号車', centerScr.x, ledY + 22 * this.camZoom);
    } else {
      this.ctx.fillStyle = '#f97316';
      this.ctx.fillText('14:35 [特別急行] 東京行 RAPID 10-CAR', centerScr.x, ledY + 11 * this.camZoom);
      this.ctx.fillStyle = '#22c55e';
      this.ctx.fillText('14:42 [各駅停車] 新宿・渋谷行 LOCAL', centerScr.x, ledY + 22 * this.camZoom);
    }

    // Twin High-Intensity Yellow Arrival Warning Beacons
    if (isTrainArriving) {
      const bFlash = Math.sin(this.timeCounter * 12) > 0;
      this.ctx.fillStyle = bFlash ? '#facc15' : '#713f12';
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = bFlash ? 14 : 0;
      this.ctx.beginPath();
      this.ctx.arc(centerScr.x - ledW / 2 - 10, ledY + ledH / 2, 5 * this.camZoom, 0, Math.PI * 2);
      this.ctx.arc(centerScr.x + ledW / 2 + 10, ledY + ledH / 2, 5 * this.camZoom, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 5. Official JR Grand Illuminated Station Nameplate
    this.drawStationSignboard(centerScr.x, trackY - 122 * this.camZoom, st, true);

    // 6. Platform Kiosk (NewDays / Kiosk)
    this.drawStationKiosk(centerScr.x - 180 * this.camZoom, platY);

    // 7. Vending Machines & Waiting Benches
    this.drawPlatformAmenities(centerScr.x + 140 * this.camZoom, platY);

    // 8. Animated Crowd of Passengers (25-35 people walking & waiting)
    this.drawAnimatedCrowd(st, platStartM, platEndM, platY, dt);

    this.ctx.restore();
  }

  /**
   * TIER 2: STASIUN KOTA (City / Suburban Station)
   * Cantilever structural steel canopy, digital arrival display, vending machines,
   * platform waiting shelter and commuter crowd!
   */
  drawCityMediumStation(st, p1, p2, platWidth, platHeight, trackY, dt, platStartM, platEndM) {
    if (platStartM === undefined) platStartM = st.posM - st.platformLenM / 2;
    if (platEndM === undefined) platEndM = st.posM + st.platformLenM / 2;
    const platY = trackY - platHeight;
    const isTrainArriving = Math.abs(this.sim.distanceM - st.posM) < 260;
    const centerScr = this.worldToScreen(st.posM);

    this.ctx.save();

    // 1. Modern Cantilever Canopy (trackY - 96 * camZoom)
    const canopyY = trackY - 96 * this.camZoom;
    const canopyH = 8 * this.camZoom;

    // Translucent Modern Glass Roof Panels
    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    this.ctx.fillRect(p1.x + 8, canopyY, platWidth - 16, canopyH);
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(p1.x + 8, canopyY - 2, platWidth - 16, 2.5);

    // Structural Cantilever Pillars with Downlights
    const pillarStep = 55 * this.camZoom;
    for (let px = p1.x + 25; px <= p2.x - 25; px += pillarStep) {
      this.ctx.strokeStyle = '#38bdf8';
      this.ctx.lineWidth = 3.2;
      this.ctx.beginPath();
      this.ctx.moveTo(px, canopyY + canopyH);
      this.ctx.lineTo(px, platY);
      this.ctx.stroke();

      // Downlight cone onto platform
      const lightGrad = this.ctx.createRadialGradient(px, canopyY + canopyH, 2, px, platY, 35);
      lightGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
      lightGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      this.ctx.fillStyle = lightGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(px - 15, platY);
      this.ctx.lineTo(px + 15, platY);
      this.ctx.lineTo(px + 3, canopyY + canopyH);
      this.ctx.lineTo(px - 3, canopyY + canopyH);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // 2. Platform Concrete Deck & Yellow Warning Tiles
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(p1.x, platY, platWidth, platHeight);
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(p1.x, platY + 1, platWidth, 3 * this.camZoom);

    // 3. Compact Digital Arrival Sign
    const ledW = 110 * this.camZoom;
    const ledH = 18 * this.camZoom;
    const ledY = canopyY - ledH - 2;
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(centerScr.x - ledW / 2, ledY, ledW, ledH);
    this.ctx.strokeStyle = '#475569';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(centerScr.x - ledW / 2, ledY, ledW, ledH);

    this.ctx.font = `bold ${Math.max(7, 8.5 * this.camZoom)}px monospace`;
    this.ctx.textAlign = 'center';
    if (isTrainArriving) {
      const flash = Math.sin(this.timeCounter * 8) > 0;
      this.ctx.fillStyle = flash ? '#facc15' : '#ef4444';
      this.ctx.fillText('⚡ 電車接近中 [APPROACHING] ⚡', centerScr.x, ledY + 13 * this.camZoom);
    } else {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.fillText('14:40 [普通] 新宿・東京行', centerScr.x, ledY + 13 * this.camZoom);
    }

    // 4. Station Signboard
    this.drawStationSignboard(centerScr.x, canopyY + 14 * this.camZoom, st, false);

    // 5. Platform Amenities (Vending Machines & Benches)
    this.drawPlatformAmenities(centerScr.x - 70 * this.camZoom, platY);

    // 6. Commuters (12-18 passengers)
    this.drawAnimatedCrowd(st, platStartM, platEndM, platY, dt);

    this.ctx.restore();
  }

  /**
   * TIER 3: STASIUN KECIL (Rural / Halte Station)
   * Quaint Japanese wooden shelter, warm glowing paper lanterns, retro wooden sign,
   * IC card touch pole, safety mirror, and cherry blossom tree!
   */
  drawRuralSmallStation(st, p1, p2, platWidth, platHeight, trackY, dt, platStartM, platEndM) {
    if (platStartM === undefined) platStartM = st.posM - st.platformLenM / 2;
    if (platEndM === undefined) platEndM = st.posM + st.platformLenM / 2;
    const platY = trackY - platHeight;
    const centerScr = this.worldToScreen(st.posM);

    this.ctx.save();

    // 1. Traditional Timber Waiting Shelter (trackY - 78 * camZoom)
    const shelterY = trackY - 78 * this.camZoom;
    const shelterW = Math.min(platWidth - 20, 85 * this.camZoom);
    const shelterX = centerScr.x - shelterW / 2;

    // Cedar Gabled Roof
    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.moveTo(shelterX - 8, shelterY + 10);
    this.ctx.lineTo(shelterX + shelterW / 2, shelterY - 14);
    this.ctx.lineTo(shelterX + shelterW + 8, shelterY + 10);
    this.ctx.closePath();
    this.ctx.fill();

    // Dark Timber Framing
    this.ctx.strokeStyle = '#5c2c16';
    this.ctx.lineWidth = 3.5;
    this.ctx.strokeRect(shelterX, shelterY + 10, shelterW, platY - (shelterY + 10));

    // Warm Incandescent Glass Lanterns (Hanging with golden glow)
    for (let lx of [shelterX + 15, shelterX + shelterW - 15]) {
      this.ctx.fillStyle = '#fef08a';
      this.ctx.shadowColor = '#facc15';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(lx, shelterY + 18, 4.5 * this.camZoom, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // 2. Platform Wooden Deck & Yellow Tactile Line
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(p1.x, platY, platWidth, platHeight);
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(p1.x, platY + 1, platWidth, 2.5 * this.camZoom);

    // 3. Retro Wooden Station Signboard on Twin Posts
    const signW = 75 * this.camZoom;
    const signH = 22 * this.camZoom;
    const signY = platY - 42 * this.camZoom;
    const signX = centerScr.x - signW / 2;

    // Wooden Posts
    this.ctx.fillStyle = '#5c2c16';
    this.ctx.fillRect(signX + 10, signY, 3, 42 * this.camZoom);
    this.ctx.fillRect(signX + signW - 13, signY, 3, 42 * this.camZoom);

    // White Enamel Board with Brown Border
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.fillRect(signX, signY, signW, signH);
    this.ctx.strokeStyle = '#15803d';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(signX, signY, signW, signH);

    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = `bold ${Math.max(7, 9 * this.camZoom)}px "DotGothic16", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(st.name.split(' ')[0], centerScr.x, signY + 12 * this.camZoom);
    this.ctx.font = `bold ${Math.max(5, 6.5 * this.camZoom)}px sans-serif`;
    this.ctx.fillStyle = '#475569';
    this.ctx.fillText(st.name.split(' ').slice(1).join(' '), centerScr.x, signY + 19 * this.camZoom);

    // 4. IC Card Touch Pole (Suica / Pasmo reader with blue LED ring)
    const poleX = p1.x + 22 * this.camZoom;
    this.ctx.fillStyle = '#64748b';
    this.ctx.fillRect(poleX, platY - 26 * this.camZoom, 4 * this.camZoom, 26 * this.camZoom);
    this.ctx.fillStyle = '#38bdf8';
    this.ctx.shadowColor = '#38bdf8';
    this.ctx.shadowBlur = 6;
    this.ctx.beginPath();
    this.ctx.arc(poleX + 2 * this.camZoom, platY - 22 * this.camZoom, 3.5 * this.camZoom, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;

    // 5. Curved Platform Mirror (Kābu mirā)
    const mirrorX = p2.x - 25 * this.camZoom;
    this.ctx.strokeStyle = '#f97316';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(mirrorX, platY);
    this.ctx.lineTo(mirrorX, platY - 35 * this.camZoom);
    this.ctx.stroke();
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.arc(mirrorX, platY - 35 * this.camZoom, 7 * this.camZoom, 0, Math.PI * 2);
    this.ctx.fill();

    // 6. Cherry Blossom Tree at Halte Border
    this.drawSakuraTree(p2.x - 8 * this.camZoom, platY);

    // 7. Small Group of Waiting Villagers (4-7 passengers)
    this.drawAnimatedCrowd(st, platStartM, platEndM, platY, dt);

    this.ctx.restore();
  }

  /**
   * Foreground Station Layer: Platform Screen Doors (ホームドア) & Front Railings
   * Rendered in front of the train for true realistic depth!
   */
  drawStationForeground(dt) {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const trackY = h * 0.65;
    const scale = 18 * this.camZoom;
    const viewLeftM = this.camX - (w / 2) / scale - 30;
    const viewRightM = this.camX + (w / 2) / scale + 30;

    if (!this.sim.route || !this.sim.route.stations) return;

    this.sim.route.stations.forEach(st => {
      // Only Grand Terminal & City Stations have Platform Screen Doors
      if (st.type !== 'large' && st.type !== 'medium') return;

      const platStartM = st.posM - st.platformLenM / 2;
      const platEndM = st.posM + st.platformLenM / 2;

      if (platEndM >= viewLeftM && platStartM <= viewRightM) {
        const p1 = this.worldToScreen(platStartM);
        const p2 = this.worldToScreen(platEndM);
        const platY = trackY - 15 * this.camZoom;
        const isTrainStopped = Math.abs(this.sim.velocityMs) < 0.2 && Math.abs(this.sim.distanceM - st.posM) < 280;
        const doorsOpen = isTrainStopped && this.sim.doorsOpen;

        this.drawPlatformScreenDoors(p1.x, p2.x, platY, doorsOpen, dt);
      }
    });
  }

  /**
   * Japanese Automated Platform Screen Doors (ホームドア Homu-doa)
   */
  drawPlatformScreenDoors(x1, x2, platY, doorsOpen, dt) {
    this.ctx.save();
    const doorH = 24 * this.camZoom;
    const doorUnitW = 40 * this.camZoom;
    const doorTopY = platY - doorH;

    for (let dx = x1 + 10; dx < x2 - 10; dx += doorUnitW) {
      // Barrier Stainless Steel Housing
      this.ctx.fillStyle = '#cbd5e1';
      this.ctx.fillRect(dx, doorTopY, 6 * this.camZoom, doorH);
      this.ctx.fillRect(dx + doorUnitW - 6 * this.camZoom, doorTopY, 6 * this.camZoom, doorH);

      // Glass Sliding Panels
      const openGap = doorsOpen ? 14 * this.camZoom : 0;
      this.ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      this.ctx.fillRect(dx + 6 * this.camZoom - openGap, doorTopY + 3, (doorUnitW / 2 - 6 * this.camZoom), doorH - 4);
      this.ctx.fillRect(dx + doorUnitW / 2 + openGap, doorTopY + 3, (doorUnitW / 2 - 6 * this.camZoom), doorH - 4);

      // Door Edge Status Light Strip
      // Emerald Green when open, Blue when closed, Yellow when closing
      this.ctx.fillStyle = doorsOpen ? '#22c55e' : '#0284c7';
      this.ctx.fillRect(dx + 2, doorTopY - 2, doorUnitW - 4, 2 * this.camZoom);
    }
    this.ctx.restore();
  }

  /**
   * Official JR East Style Station Nameboard
   */
  drawStationSignboard(x, y, st, isGrand) {
    this.ctx.save();
    const signW = (isGrand ? 150 : 120) * this.camZoom;
    const signH = 26 * this.camZoom;
    const bx = x - signW / 2;

    // White Enamel Board
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(bx, y, signW, signH);
    this.ctx.strokeStyle = '#15803d'; // JR Green
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(bx, y, signW, signH);

    // Green Ribbon Band
    this.ctx.fillStyle = '#15803d';
    this.ctx.fillRect(bx, y, signW, 5 * this.camZoom);

    // Station Code Badge (e.g. [JC 05])
    if (st.code) {
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(bx + 4, y + 8 * this.camZoom, 20 * this.camZoom, 13 * this.camZoom);
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = `bold ${Math.max(6, 7 * this.camZoom)}px monospace`;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(st.code, bx + 14 * this.camZoom, y + 17 * this.camZoom);
    }

    // Japanese Kanji & Romanized Station Name
    this.ctx.fillStyle = '#0f172a';
    this.ctx.font = `bold ${Math.max(8, 10.5 * this.camZoom)}px "Plus Jakarta Sans", sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(st.name, x + (st.code ? 10 * this.camZoom : 0), y + 18 * this.camZoom);

    this.ctx.restore();
  }

  /**
   * Station Platform Convenience Kiosk (NewDays / Kiosk)
   */
  drawStationKiosk(x, platY) {
    this.ctx.save();
    const kW = 48 * this.camZoom;
    const kH = 34 * this.camZoom;
    const kY = platY - kH;

    // Store Kiosk Shell
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, kY, kW, kH);
    this.ctx.strokeStyle = '#16a34a';
    this.ctx.strokeRect(x, kY, kW, kH);

    // Glowing Green Brand Awning
    this.ctx.fillStyle = '#16a34a';
    this.ctx.fillRect(x, kY, kW, 7 * this.camZoom);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold ${Math.max(6, 7 * this.camZoom)}px sans-serif`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('NewDays', x + kW / 2, kY + 5.5 * this.camZoom);

    // Lit display showcase
    this.ctx.fillStyle = '#fef08a';
    this.ctx.fillRect(x + 5, kY + 11 * this.camZoom, kW - 10, kH - 14 * this.camZoom);

    this.ctx.restore();
  }

  drawPlatformAmenities(x, platY) {
    this.drawVendingMachines(x, platY);
    // Wooden waiting bench
    const bW = 26 * this.camZoom;
    this.ctx.fillStyle = '#78350f';
    this.ctx.fillRect(x + 35 * this.camZoom, platY - 8 * this.camZoom, bW, 4 * this.camZoom);
    this.ctx.fillRect(x + 37 * this.camZoom, platY - 4 * this.camZoom, 3, 4 * this.camZoom);
    this.ctx.fillRect(x + 35 * this.camZoom + bW - 6, platY - 4 * this.camZoom, 3, 4 * this.camZoom);
  }

  /**
   * Dynamic Animated Crowd of Walking & Waiting Passengers
   */
  drawAnimatedCrowd(st, platStartM, platEndM, platY, dt) {
    const isGrand = st.type === 'large';
    const isMedium = st.type === 'medium';
    const totalCount = isGrand ? 28 : (isMedium ? 15 : 6);

    for (let i = 0; i < totalCount; i++) {
      // Deterministic spread along platform
      const baseM = platStartM + 14 + (i * (st.platformLenM - 28)) / totalCount;
      const isWalking = (i % 3 !== 0); // 2/3 walking, 1/3 standing
      const walkSpeed = 0.9 + ((i * 17) % 5) * 0.2;
      const walkRange = 12 + ((i * 23) % 18);
      const walkPhase = this.timeCounter * walkSpeed + (i * 2.1);
      const walkOffsetM = isWalking ? Math.sin(walkPhase) * walkRange : 0;
      const passM = baseM + walkOffsetM;
      const passScr = this.worldToScreen(passM);

      // Facing direction
      const facingRight = isWalking ? Math.cos(walkPhase) >= 0 : (i % 2 === 0);

      this.drawAnimatedPassenger(passScr.x, platY, i, dt, isWalking, facingRight, walkPhase);
    }
  }

  /**
   * Realistic Detailed Passenger with Walking Legs, Colors, Bags & Phones
   */
  drawAnimatedPassenger(x, y, seed, dt, isWalking, facingRight, phase) {
    this.ctx.save();
    const cz = this.camZoom;
    const pScale = 0.85 + (seed % 4) * 0.08; // Natural height variation
    const totalH = 22 * cz * pScale;
    const bodyY = y - totalH;

    // Palette variation
    const clothesColors = ['#1e293b', '#0369a1', '#b91c1c', '#047857', '#475569', '#7c2d12', '#334155'];
    const coatColor = clothesColors[seed % clothesColors.length];

    // Animated Leg Swing
    const legSwing = isWalking ? Math.sin(phase * 4) * 5 * cz : 0;

    // Legs (Dark Trousers / Skirt)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(x - 2 * cz + legSwing, y - 8 * cz, 2 * cz, 8 * cz);
    this.ctx.fillRect(x + 0.5 * cz - legSwing, y - 8 * cz, 2 * cz, 8 * cz);

    // Torso / Jacket
    this.ctx.fillStyle = coatColor;
    this.ctx.fillRect(x - 3 * cz, bodyY + 6 * cz, 6 * cz, 10 * cz);

    // Head
    this.ctx.fillStyle = '#fed7aa'; // Skin tone
    this.ctx.beginPath();
    this.ctx.arc(x, bodyY + 4 * cz, 3 * cz, 0, Math.PI * 2);
    this.ctx.fill();

    // Hair
    this.ctx.fillStyle = seed % 3 === 0 ? '#78350f' : '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(x, bodyY + 2.5 * cz, 3.2 * cz, Math.PI, 0);
    this.ctx.fill();

    // Smartphone with Glowing Cyan Screen
    if (seed % 4 === 1 && !isWalking) {
      this.ctx.fillStyle = '#38bdf8';
      this.ctx.shadowColor = '#38bdf8';
      this.ctx.shadowBlur = 6;
      this.ctx.fillRect(x + (facingRight ? 3 : -5) * cz, bodyY + 9 * cz, 2.5 * cz, 3 * cz);
      this.ctx.shadowBlur = 0;
    }

    // Briefcase / Backpack
    if (seed % 3 === 0) {
      this.ctx.fillStyle = '#78350f';
      this.ctx.fillRect(x + (facingRight ? -4.5 : 3.5) * cz, bodyY + 8 * cz, 3 * cz, 5 * cz);
    }

    this.ctx.restore();
  }

  /**
   * Japanese Level Crossing (踏切 Fumikiri) with Hazard Stripes & Flashers
   */
  drawJapaneseFumikiri(x, trackY, isClosed, bellActive) {
    this.ctx.save();

    // Roadway asphalt
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(x - 45 * this.camZoom, trackY - 5 * this.camZoom, 90 * this.camZoom, 22 * this.camZoom);

    // Hazard Striped Post (Yellow and Black diagonal bands)
    const postW = 5 * this.camZoom;
    const postH = 75 * this.camZoom;
    const postX = x - 32 * this.camZoom;
    const postY = trackY - postH;

    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(postX, postY, postW, postH);

    // Black Diagonal Hazard Stripes
    this.ctx.fillStyle = '#0f172a';
    for (let sy = postY; sy < trackY; sy += 12 * this.camZoom) {
      this.ctx.fillRect(postX, sy, postW, 6 * this.camZoom);
    }

    // Japanese Crossing Crossbuck (踏切警報機 X Sign)
    const crossY = postY + 12 * this.camZoom;
    this.ctx.strokeStyle = '#facc15';
    this.ctx.lineWidth = 4 * this.camZoom;
    this.ctx.beginPath();
    this.ctx.moveTo(postX - 14 * this.camZoom, crossY - 10 * this.camZoom);
    this.ctx.lineTo(postX + 14 * this.camZoom, crossY + 10 * this.camZoom);
    this.ctx.moveTo(postX + 14 * this.camZoom, crossY - 10 * this.camZoom);
    this.ctx.lineTo(postX - 14 * this.camZoom, crossY + 10 * this.camZoom);
    this.ctx.stroke();

    // Flashing Red Dual Lamps
    const flash = Math.sin(this.timeCounter * 12) > 0;
    const leftLampActive = bellActive && flash;
    const rightLampActive = bellActive && !flash;

    this.ctx.fillStyle = leftLampActive ? '#ef4444' : '#450a0a';
    this.ctx.beginPath();
    this.ctx.arc(postX - 10 * this.camZoom, crossY + 18 * this.camZoom, 4.5 * this.camZoom, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = rightLampActive ? '#ef4444' : '#450a0a';
    this.ctx.beginPath();
    this.ctx.arc(postX + 10 * this.camZoom, crossY + 18 * this.camZoom, 4.5 * this.camZoom, 0, Math.PI * 2);
    this.ctx.fill();

    // Crossing Gate Boom with Suspended Skirt
    const angle = isClosed ? 0 : -Math.PI / 3;
    const boomLength = 75 * this.camZoom;
    this.ctx.save();
    this.ctx.translate(postX + postW, trackY - 14 * this.camZoom);
    this.ctx.rotate(angle);

    // Yellow & Black Boom
    this.ctx.fillStyle = '#facc15';
    this.ctx.fillRect(0, -3 * this.camZoom, boomLength, 6 * this.camZoom);
    this.ctx.fillStyle = '#0f172a';
    for (let s = 8 * this.camZoom; s < boomLength; s += 16 * this.camZoom) {
      this.ctx.fillRect(s, -3 * this.camZoom, 8 * this.camZoom, 6 * this.camZoom);
    }
    this.ctx.restore();

    this.ctx.restore();
  }

  drawColorLightSignal(x, trackY, aspect) {
    this.ctx.save();
    const mastH = 80 * this.camZoom;
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(x - 2.5 * this.camZoom, trackY - mastH, 5 * this.camZoom, mastH);

    this.ctx.fillStyle = '#090d16';
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.roundRect(x - 9 * this.camZoom, trackY - mastH, 18 * this.camZoom, 44 * this.camZoom, 5);
    this.ctx.fill();
    this.ctx.stroke();

    const lights = [
      { color: '#22c55e', active: aspect === 'green', cy: trackY - mastH + 8 * this.camZoom },
      { color: '#eab308', active: aspect === 'yellow', cy: trackY - mastH + 22 * this.camZoom },
      { color: '#ef4444', active: aspect === 'red', cy: trackY - mastH + 36 * this.camZoom }
    ];

    lights.forEach(l => {
      this.ctx.beginPath();
      this.ctx.arc(x, l.cy, 4.5 * this.camZoom, 0, Math.PI * 2);
      if (l.active) {
        this.ctx.fillStyle = l.color;
        this.ctx.shadowColor = l.color;
        this.ctx.shadowBlur = 12;
      } else {
        this.ctx.fillStyle = '#1e293b';
        this.ctx.shadowBlur = 0;
      }
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  /**
   * DRAW ENTIRE TRAIN CONSIST
   * 100% Zoom-Consistent Architecture:
   * Every vehicle translates to (scr.x, railheadY) and scales by camZoom!
   */
  drawTrainConsist(dt) {
    const vehicles = this.sim.vehicles;
    if (!vehicles || vehicles.length === 0) return;

    const trackY = this.displayHeight * 0.65;
    const railheadY = trackY - 6 * this.camZoom;

    // Draw from rear car to lead car
    for (let i = vehicles.length - 1; i >= 0; i--) {
      const veh = vehicles[i];
      const scr = this.worldToScreen(veh.distanceM);

      // Coupler & Vestibule Bellows to adjacent car
      if (i > 0) {
        const nextVeh = vehicles[i - 1];
        const nextScr = this.worldToScreen(nextVeh.distanceM);
        this.drawIntercarCoupler(scr.x, nextScr.x, railheadY, veh.config.category, nextVeh.config.category);
      }

      // Draw Vehicle Body
      if (veh.isLoco) {
        this.drawLocomotive(scr.x, railheadY, veh);
      } else {
        this.drawCarriage(scr.x, railheadY, veh);
      }
    }
  }

  drawIntercarCoupler(x1, x2, railheadY, cat1, cat2) {
    this.ctx.save();
    const midX = (x1 + x2) / 2;
    const bodyH = 62 * this.camZoom;
    const roofY = railheadY - bodyH;

    // Rubber Accordion Gangway Bellows (Diaphragms)
    if ((cat1 === 'passenger' || cat1 === 'service') && (cat2 === 'passenger' || cat2 === 'service')) {
      const bellowLeft = x1 + 2;
      const bellowRight = x2 - 2;
      const bellowW = bellowRight - bellowLeft;
      const bellowTop = roofY + 8 * this.camZoom;
      const bellowH = bodyH - 24 * this.camZoom;

      this.ctx.fillStyle = '#111827';
      this.ctx.fillRect(bellowLeft, bellowTop, bellowW, bellowH);

      this.ctx.strokeStyle = '#374151';
      this.ctx.lineWidth = 1.5;
      const pleatStep = Math.max(3, bellowW / 4);
      for (let px = bellowLeft; px <= bellowRight; px += pleatStep) {
        this.ctx.beginPath();
        this.ctx.moveTo(px, bellowTop);
        this.ctx.lineTo(px, bellowTop + bellowH);
        this.ctx.stroke();
      }
    }

    // Steel Tightlock Coupler Shank
    const couplerY = railheadY - 12 * this.camZoom;
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(x1 + 2, couplerY - 3 * this.camZoom, x2 - x1 - 4, 6 * this.camZoom);
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 1.2;
    this.ctx.strokeRect(x1 + 2, couplerY - 3 * this.camZoom, x2 - x1 - 4, 6 * this.camZoom);

    // Flexible Air Brake Hose
    this.ctx.strokeStyle = '#020617';
    this.ctx.lineWidth = 2.0;
    this.ctx.beginPath();
    this.ctx.moveTo(x1 + 3, couplerY + 2 * this.camZoom);
    this.ctx.quadraticCurveTo(midX, couplerY + 14 * this.camZoom, x2 - 3, couplerY + 2 * this.camZoom);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * UNIFIED BOGIE ASSEMBLY (In Local Scaled Coordinate Space: Y=0 is railhead!)
   */
  drawTwoAxleBogieLocal(bx, wheelRadius = 8.0, axleSpan = 14.0) {
    this.ctx.save();
    const wheelY = -wheelRadius; // Tangent to railhead at Y = 0

    // Bogie Frame Beam
    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(bx - axleSpan * 1.35, wheelY - 8, axleSpan * 2.7, 9, 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Secondary Air Spring Bolster
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(bx - 5, wheelY - 14, 10, 6);

    // Wheels & Axles
    [-axleSpan, axleSpan].forEach(dx => {
      this.drawWheelsetLocal(bx + dx, wheelY, wheelRadius);

      // Helical coil spring over axle journal box
      this.ctx.strokeStyle = '#cbd5e1';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(bx + dx - 3.5, wheelY - 9);
      this.ctx.lineTo(bx + dx + 3.5, wheelY - 9);
      this.ctx.stroke();
    });

    this.ctx.restore();
  }

  drawThreeAxleBogieLocal(bx, wheelRadius = 8.5, axleSpan = 14.0) {
    this.ctx.save();
    const wheelY = -wheelRadius;

    this.ctx.fillStyle = '#1e293b';
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.roundRect(bx - axleSpan * 1.45, wheelY - 8, axleSpan * 2.9, 9, 3);
    this.ctx.fill();
    this.ctx.stroke();

    [-axleSpan, 0, axleSpan].forEach(dx => {
      this.drawWheelsetLocal(bx + dx, wheelY, wheelRadius);
    });

    this.ctx.restore();
  }

  drawWheelsetLocal(wx, wy, radius) {
    this.ctx.save();
    // Mathematically accurate physical wheel rotation (theta = distance * 18 / radius)
    const angle = (this.sim.distanceM * 18 / radius) % (Math.PI * 2);

    // Wheel Flange (extends 2 units below railhead on inside)
    this.ctx.fillStyle = '#0f172a';
    this.ctx.beginPath();
    this.ctx.arc(wx, wy, radius + 1.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Wheel Tire (Black tempered steel)
    this.ctx.fillStyle = '#1e293b';
    this.ctx.beginPath();
    this.ctx.arc(wx, wy, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Polished Silver Rim (Reflects light)
    this.ctx.strokeStyle = '#f8fafc';
    this.ctx.lineWidth = 1.8;
    this.ctx.beginPath();
    this.ctx.arc(wx, wy, radius - 1, 0, Math.PI * 2);
    this.ctx.stroke();

    // Wheel Center Disc
    this.ctx.fillStyle = '#334155';
    this.ctx.beginPath();
    this.ctx.arc(wx, wy, radius * 0.58, 0, Math.PI * 2);
    this.ctx.fill();

    // Rotating Axle Lightening Holes (6 holes)
    this.ctx.fillStyle = '#0f172a';
    for (let h = 0; h < 6; h++) {
      const ha = angle + (h * Math.PI / 3);
      const hx = wx + Math.cos(ha) * (radius * 0.38);
      const hy = wy + Math.sin(ha) * (radius * 0.38);
      this.ctx.beginPath();
      this.ctx.arc(hx, hy, 1.2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Central Axle Bearing Cap with 4 Hex Bolts
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.beginPath();
    this.ctx.arc(wx, wy, 2.8, 0, Math.PI * 2);
    this.ctx.fill();

    // Rotation crosshairs indicator
    this.ctx.strokeStyle = '#94a3b8';
    this.ctx.lineWidth = 1.0;
    this.ctx.beginPath();
    this.ctx.moveTo(wx + Math.cos(angle) * (radius - 2), wy + Math.sin(angle) * (radius - 2));
    this.ctx.lineTo(wx - Math.cos(angle) * (radius - 2), wy - Math.sin(angle) * (radius - 2));
    this.ctx.stroke();

    // Rigid Brake Caliper Shoe (Positioned right at the wheel circumference)
    this.ctx.fillStyle = '#475569';
    this.ctx.fillRect(wx - radius - 2.5, wy - 4, 2, 8);
    this.ctx.fillRect(wx + radius + 0.5, wy - 4, 2, 8);

    this.ctx.restore();
  }

  drawUnderfloorGearLocal(halfW) {
    this.ctx.save();
    const gearW = halfW * 0.95;
    const underY = -14;

    // Battery Box
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-gearW * 0.45, underY, gearW * 0.38, 8);
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(-gearW * 0.45, underY, gearW * 0.38, 8);

    // Compressed Air Main Reservoir Cylinders (Yellow)
    this.ctx.fillStyle = '#eab308';
    this.ctx.beginPath();
    this.ctx.roundRect(5, underY + 2, gearW * 0.32, 5.5, 2.5);
    this.ctx.fill();

    // Auxiliary Inverter Cooler Box
    this.ctx.fillStyle = '#334155';
    this.ctx.fillRect(gearW * 0.22, underY, gearW * 0.22, 7.5);

    this.ctx.restore();
  }

  /**
   * HIGH-PRECISION CARRIAGES (100% Zoom-Consistent in Local Transform)
   */
  drawCarriage(screenX, railheadY, veh) {
    const config = veh.config;
    const bodyW = veh.lengthM * 18; // Base width in model units
    const bodyH = 60;              // Base height in model units
    const halfW = bodyW / 2;
    const roofY = -bodyH;

    this.ctx.save();
    // UNIFIED LOCAL TRANSFORM: Origin (0,0) is railhead directly under car center!
    this.ctx.translate(screenX, railheadY);
    this.ctx.scale(this.camZoom, this.camZoom);

    // 1. Dual Two-Axle Bogies
    const bogieOffset = 34;
    this.drawTwoAxleBogieLocal(-halfW + bogieOffset);
    this.drawTwoAxleBogieLocal(halfW - bogieOffset);

    // 2. Underfloor Equipment
    this.drawUnderfloorGearLocal(halfW);

    // 3. Passenger Coaches (K1 Eksekutif, K3 Ekonomi, MP Pembangkit)
    if (config.category === 'passenger' || config.category === 'service') {
      const isEksekutif = config.id === 'eksekutif';
      const isEkonomi = config.id === 'ekonomi';
      const isPembangkit = config.id === 'pembangkit';

      // Coach Shell Metallic Gradient
      const shellGrad = this.ctx.createLinearGradient(0, roofY, 0, -15);
      if (isEksekutif) {
        shellGrad.addColorStop(0, '#e2e8f0');
        shellGrad.addColorStop(0.35, '#f8fafc');
        shellGrad.addColorStop(0.75, '#cbd5e1');
        shellGrad.addColorStop(1, '#94a3b8');
      } else if (isEkonomi) {
        shellGrad.addColorStop(0, '#0d9488');
        shellGrad.addColorStop(0.65, '#0f766e');
        shellGrad.addColorStop(1, '#115e59');
      } else {
        shellGrad.addColorStop(0, '#334155');
        shellGrad.addColorStop(1, '#1e293b');
      }

      this.ctx.fillStyle = shellGrad;
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2.0;

      // Aerodynamic Car Profile
      this.ctx.beginPath();
      this.ctx.roundRect(-halfW, roofY, bodyW, bodyH - 15, 5);
      this.ctx.fill();
      this.ctx.stroke();

      // Corrugated Stainless Steel Fluting Ribs
      if (isEksekutif) {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        this.ctx.lineWidth = 1;
        for (let ry = roofY + 6; ry < -32; ry += 4) {
          this.ctx.beginPath();
          this.ctx.moveTo(-halfW + 6, ry);
          this.ctx.lineTo(halfW - 6, ry);
          this.ctx.stroke();
        }
      }

      // Continuous Flush Panoramic Window Band
      const bandTop = roofY + 15;
      const bandH = 18;
      this.ctx.fillStyle = '#090d16';
      this.ctx.fillRect(-halfW + 14, bandTop - 2, bodyW - 28, bandH + 4);

      // Double-Glazed Windows with Curtains & Seated Passengers
      const windowW = 20;
      const windowSpacing = 28;
      for (let wx = -halfW + 24; wx < halfW - 30; wx += windowSpacing) {
        this.ctx.fillStyle = this.timeOfDay === 'night' ? '#fef08a' : '#0284c7';
        this.ctx.fillRect(wx, bandTop, windowW, bandH);

        // Curtains
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(wx, bandTop, 3, bandH);
        this.ctx.fillRect(wx + windowW - 3, bandTop, 3, bandH);

        // Passenger Silhouette
        this.ctx.fillStyle = '#0f172a';
        this.ctx.beginPath();
        this.ctx.arc(wx + windowW / 2, bandTop + 7, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillRect(wx + windowW / 2 - 4, bandTop + 10, 8, 7);
      }

      // Waist Speedline
      const stripeY = -27;
      this.ctx.fillStyle = config.stripeColor || '#f97316';
      this.ctx.fillRect(-halfW, stripeY, bodyW, 4);

      if (isEksekutif) {
        this.ctx.fillStyle = '#1d4ed8';
        this.ctx.fillRect(-halfW, stripeY + 4, bodyW, 3);
      }

      // Rooftop Recessed HVAC Air Conditioners
      this.ctx.fillStyle = '#1e293b';
      this.ctx.fillRect(-38, roofY - 5, 76, 5);
      this.ctx.strokeStyle = '#475569';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-38, roofY - 5, 76, 5);

      // Generator Car Exhaust & Louvers
      if (isPembangkit) {
        this.ctx.fillStyle = '#0f172a';
        for (let gx = 10; gx < halfW - 20; gx += 8) {
          this.ctx.fillRect(gx, bandTop - 1, 4, bandH + 2);
        }
        this.ctx.fillRect(halfW - 35, roofY - 9, 8, 9);
      }

      // Carriage Designation Marking
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(-28, stripeY + 8, 56, 9);
      this.ctx.fillStyle = '#f8fafc';
      this.ctx.font = 'bold 7px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(config.carCode || config.name.substring(0, 10), 0, stripeY + 15);

    } else if (config.id === 'petikemas') {
      // Container Flatcar (JRF / KAI Intermodal)
      this.ctx.fillStyle = '#0f172a';
      this.ctx.fillRect(-halfW, -19, bodyW, 7);

      // Twistlocks
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.fillRect(-halfW + 6, -21, 4, 3);
      this.ctx.fillRect(halfW - 10, -21, 4, 3);

      // 40ft Intermodal Shipping Container
      const containerW = bodyW - 14;
      const containerH = 38;
      const cTop = -19 - containerH;

      this.ctx.fillStyle = config.color || '#b45309';
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(-containerW / 2, cTop, containerW, containerH, 3);
      this.ctx.fill();
      this.ctx.stroke();

      // Vertical Corrugation Ribs
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
      this.ctx.lineWidth = 1.5;
      for (let rx = -containerW / 2 + 7; rx < containerW / 2 - 7; rx += 7) {
        this.ctx.beginPath();
        this.ctx.moveTo(rx, cTop);
        this.ctx.lineTo(rx, cTop + containerH);
        this.ctx.stroke();
      }

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('JR FREIGHT 40FT ECO-RAIL', 0, cTop + containerH / 2 + 3);

    } else if (config.id === 'ketel_pertamina') {
      // Petroleum Tanker (JOT / Pertamina)
      const tankW = bodyW - 12;
      const tankH = 38;
      const tTop = -19 - tankH;

      this.ctx.fillStyle = '#15803d'; // Japanese Oil Transportation Green
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(-tankW / 2, tTop, tankW, tankH, 14);
      this.ctx.fill();
      this.ctx.stroke();

      // Top Dome
      this.ctx.fillStyle = '#e2e8f0';
      this.ctx.fillRect(-8, tTop - 6, 16, 6);

      // Hazmat Flammable Diamond
      this.ctx.save();
      this.ctx.translate(-tankW / 4, tTop + tankH / 2);
      this.ctx.rotate(Math.PI / 4);
      this.ctx.fillStyle = '#ef4444';
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1;
      this.ctx.fillRect(-5, -5, 10, 10);
      this.ctx.strokeRect(-5, -5, 10, 10);
      this.ctx.restore();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('JOT OIL TANKER', 12, tTop + tankH / 2 + 3);

    } else if (config.id === 'batubara') {
      // Coal Hopper
      const hopperW = bodyW - 10;
      const hopperH = 34;
      const hTop = -19 - hopperH;

      this.ctx.fillStyle = '#334155';
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(-hopperW / 2, -19);
      this.ctx.lineTo(-hopperW / 2, hTop);
      this.ctx.lineTo(hopperW / 2, hTop);
      this.ctx.lineTo(hopperW / 2, -19);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();

      // Coal Mounds
      this.ctx.fillStyle = '#090d16';
      this.ctx.beginPath();
      this.ctx.arc(-22, hTop, 16, Math.PI, 0);
      this.ctx.arc(22, hTop, 16, Math.PI, 0);
      this.ctx.fill();

    } else if (config.id === 'boxcar') {
      // Boxcar
      const boxW = bodyW - 12;
      const boxH = 38;
      const bTop = -19 - boxH;

      this.ctx.fillStyle = '#7c2d12';
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(-boxW / 2, bTop, boxW, boxH, 3);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.strokeRect(-16, bTop + 3, 32, boxH - 5);
      this.ctx.fillStyle = '#fbbf24';
      this.ctx.font = 'bold 8px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('EXPRESS CARGO', 0, bTop + boxH / 2);

    } else if (config.id === 'caboose') {
      // Conductor Caboose
      const cabW = bodyW - 10;
      const cabH = 40;
      const cabTop = -18 - cabH;

      this.ctx.fillStyle = '#991b1b';
      this.ctx.strokeStyle = '#0f172a';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(-cabW / 2, cabTop, cabW, cabH, 4);
      this.ctx.fill();
      this.ctx.stroke();

      // Rooftop Cupola
      this.ctx.fillStyle = '#7f1d1d';
      this.ctx.fillRect(-18, cabTop - 12, 36, 12);
      this.ctx.strokeRect(-18, cabTop - 12, 36, 12);

      // Red Rear Marker Lantern (Semboyan 21)
      this.ctx.fillStyle = '#ef4444';
      this.ctx.shadowColor = '#ef4444';
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(-cabW / 2 - 2, cabTop + 14, 4, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.restore();
  }

  /**
   * HIGH-PRECISION LOCOMOTIVES (100% Zoom-Consistent in Local Transform)
   */
  drawLocomotive(screenX, railheadY, veh) {
    const config = veh.config;
    const bodyW = veh.lengthM * 18;
    const bodyH = 62;
    const halfW = bodyW / 2;

    this.ctx.save();
    // UNIFIED LOCAL TRANSFORM: Origin (0,0) is railhead directly under loco center!
    this.ctx.translate(screenX, railheadY);
    this.ctx.scale(this.camZoom, this.camZoom);

    if (config.id === 'krl_e233') {
      // JR Series E233 Commuter EMU
      this.drawTwoAxleBogieLocal(-halfW + 36);
      this.drawTwoAxleBogieLocal(halfW - 36);
      this.drawKRLE233BodyLocal(halfW, bodyH);
    } else if (config.id === 'cc206') {
      // Heavy Co-Co 6 Axles
      this.drawThreeAxleBogieLocal(-halfW + 42);
      this.drawThreeAxleBogieLocal(halfW - 42);
      this.drawCC206BodyLocal(halfW, bodyH);
    } else if (config.id === 'bb301') {
      // Vintage Bo-Bo
      this.drawTwoAxleBogieLocal(-halfW + 30);
      this.drawTwoAxleBogieLocal(halfW - 30);
      this.drawBB301BodyLocal(halfW, bodyH);
    } else if (config.id === 'steam_mikado') {
      // SL D51 2-8-2 Steam Locomotive with Walschaerts Valve Gear
      this.drawSteamMikadoLocal(halfW, bodyH);
    }

    // Headlight Volumetric Beam
    if (this.sim.headlights > 0) {
      const isReverse = this.sim.reverser === -1;
      const headlightX = isReverse ? -halfW : halfW;
      const headlightDir = isReverse ? -1 : 1;
      this.drawHeadlightBeamLocal(headlightX, -34, headlightDir, this.sim.headlights);
    }

    this.ctx.restore();

    // Spawn Particles in World Coordinates
    this.spawnLocomotiveParticles(screenX, railheadY, veh);
  }

  drawKRLE233BodyLocal(halfW, h) {
    const w = halfW * 2;
    const bodyTop = -h;

    // Stainless Steel Body
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2.0;
    this.ctx.beginPath();
    this.ctx.roundRect(-halfW, bodyTop, w, h - 15, 5);
    this.ctx.fill();
    this.ctx.stroke();

    // Aerodynamic Curved Front FRP Mask (Cab Nose)
    this.ctx.fillStyle = '#f8fafc';
    this.ctx.beginPath();
    this.ctx.moveTo(halfW - 25, bodyTop);
    this.ctx.lineTo(halfW, bodyTop + 14);
    this.ctx.lineTo(halfW, -15);
    this.ctx.lineTo(halfW - 25, -15);
    this.ctx.closePath();
    this.ctx.fill();

    // Chuo Line Orange Rapid Stripes
    this.ctx.fillStyle = '#f97316';
    this.ctx.fillRect(-halfW, -38, w, 6);
    this.ctx.fillStyle = '#fbbf24';
    this.ctx.fillRect(-halfW, -32, w, 4);

    // Front Destination LED Display (快速 新宿行)
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(halfW - 22, bodyTop + 6, 20, 8);
    this.ctx.fillStyle = '#f97316';
    this.ctx.font = 'bold 6px monospace';
    this.ctx.fillText('新宿行', halfW - 12, bodyTop + 12);

    // Tinted Front Windshield
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(halfW - 22, bodyTop + 15, 18, 14);

    // Passenger Tinted Windows
    for (let wx = -halfW + 20; wx < halfW - 32; wx += 38) {
      this.ctx.fillStyle = '#0284c7';
      this.ctx.fillRect(wx, bodyTop + 14, 22, 16);
    }

    // Modern Single-Arm Pantograph (PS33D)
    if (this.sim.pantographRaised) {
      this.drawPantographLocal(-halfW + 45, bodyTop);
    }
  }

  drawPantographLocal(x, roofY) {
    this.ctx.save();
    this.ctx.strokeStyle = '#dc2626';
    this.ctx.lineWidth = 2.0;

    // Contact wire is at Y = -110 in local coords!
    const wireY = -110;
    const apexX = x + 14;

    // Pantograph Articulated Diamond Knee
    this.ctx.beginPath();
    this.ctx.moveTo(x - 10, roofY);
    this.ctx.lineTo(apexX, wireY + 4);
    this.ctx.lineTo(x + 28, roofY);
    this.ctx.stroke();

    // Copper Collector Shoe
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 3.2;
    this.ctx.beginPath();
    this.ctx.moveTo(apexX - 12, wireY);
    this.ctx.lineTo(apexX + 12, wireY);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawCC206BodyLocal(halfW, h) {
    const w = halfW * 2;
    const bodyTop = -h;

    // Fuel Tank Underbody
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-halfW + 68, -17, w - 136, 12);

    // Dual-Cab Aerodynamic Profile
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#0f172a';
    this.ctx.lineWidth = 2.2;
    this.ctx.beginPath();
    this.ctx.moveTo(-halfW, -15);
    this.ctx.lineTo(-halfW + 14, bodyTop + 14);
    this.ctx.lineTo(-halfW + 28, bodyTop);
    this.ctx.lineTo(halfW - 28, bodyTop);
    this.ctx.lineTo(halfW - 14, bodyTop + 14);
    this.ctx.lineTo(halfW, -15);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();

    // Navy Blue Lower Skirt
    this.ctx.fillStyle = '#1e3a8a';
    this.ctx.fillRect(-halfW, -26, w, 11);

    // Orange Speedline
    this.ctx.fillStyle = '#f97316';
    this.ctx.fillRect(-halfW, -32, w, 5);

    // Cab Windshields
    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(halfW - 26, bodyTop + 12, 13, 12);
    this.ctx.fillRect(-halfW + 13, bodyTop + 12, 13, 12);

    // Radiator Cooling Louvers
    this.ctx.fillStyle = '#334155';
    for (let gx = -45; gx <= 45; gx += 12) {
      this.ctx.fillRect(gx, bodyTop + 12, 6, 18);
    }

    // Cab Identification Plate
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(halfW - 46, bodyTop + 28, 40, 10);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 8px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('CC 206 13', halfW - 26, bodyTop + 36);
  }

  drawBB301BodyLocal(halfW, h) {
    const w = halfW * 2;
    const bodyTop = -h;

    this.ctx.fillStyle = '#fef08a';
    this.ctx.strokeStyle = '#1e293b';
    this.ctx.lineWidth = 2.0;
    this.ctx.beginPath();
    this.ctx.roundRect(-halfW, bodyTop, w, h - 15, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#15803d';
    this.ctx.fillRect(-halfW, -32, w, 17);

    this.ctx.fillStyle = '#0284c7';
    this.ctx.fillRect(halfW - 24, bodyTop + 10, 16, 13);
    this.ctx.fillRect(-halfW + 8, bodyTop + 10, 16, 13);
  }

  /**
   * SL D51 STEAM MIKADO WITH SYNCHRONIZED WALSCHAERTS VALVE GEAR
   */
  drawSteamMikadoLocal(halfW, h) {
    const w = halfW * 2;
    const bodyTop = -h;
    const wheelR = 15.0; // Large 1.7m diameter steam driving wheels
    const wheelY = -wheelR;

    // Driving Wheels Spacing (4 wheelsets)
    const driverSpacing = 28;
    const driverCenterX = -15;
    const driverAngle = (this.sim.distanceM * 18 / wheelR) % (Math.PI * 2);

    // 1. Draw 4 Heavy Driving Wheelsets with Bronze Counterweights
    [-1.5, -0.5, 0.5, 1.5].forEach(mult => {
      const wx = driverCenterX + mult * driverSpacing;

      // Heavy Iron Driver Wheel
      this.ctx.fillStyle = '#0f172a';
      this.ctx.beginPath();
      this.ctx.arc(wx, wheelY, wheelR, 0, Math.PI * 2);
      this.ctx.fill();

      // Polished Rim
      this.ctx.strokeStyle = '#f8fafc';
      this.ctx.lineWidth = 2.0;
      this.ctx.beginPath();
      this.ctx.arc(wx, wheelY, wheelR - 1, 0, Math.PI * 2);
      this.ctx.stroke();

      // Rotating Crescent Counterweight (180 deg opposite crankpin)
      const cwAngle = driverAngle + Math.PI;
      this.ctx.fillStyle = '#78350f';
      this.ctx.beginPath();
      this.ctx.arc(wx, wheelY, wheelR * 0.82, cwAngle - 0.7, cwAngle + 0.7);
      this.ctx.lineTo(wx, wheelY);
      this.ctx.closePath();
      this.ctx.fill();

      // Brass Central Axle Cap
      this.ctx.fillStyle = '#f59e0b';
      this.ctx.beginPath();
      this.ctx.arc(wx, wheelY, 3.5, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Synchronized Side Connecting Rod linking all 4 driver crankpins
    const pinR = wheelR * 0.55;
    const pinY = wheelY + Math.sin(driverAngle) * pinR;
    const pinX1 = driverCenterX - 1.5 * driverSpacing + Math.cos(driverAngle) * pinR;
    const pinX4 = driverCenterX + 1.5 * driverSpacing + Math.cos(driverAngle) * pinR;

    this.ctx.strokeStyle = '#e2e8f0';
    this.ctx.lineWidth = 4.0;
    this.ctx.beginPath();
    this.ctx.moveTo(pinX1, pinY);
    this.ctx.lineTo(pinX4, pinY);
    this.ctx.stroke();

    // Main Piston Cylinder & Crosshead Slider
    const cylX = halfW - 45;
    const cylY = wheelY;
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(cylX - 15, cylY - 6, 25, 12);

    // Crosshead Slider moving with piston stroke
    const crossheadX = cylX - 12 + Math.cos(driverAngle) * (pinR * 0.7);
    this.ctx.fillStyle = '#cbd5e1';
    this.ctx.fillRect(crossheadX - 4, cylY - 4, 8, 8);

    // Main Drive Rod from Crosshead to 2nd Driver Crankpin
    const pinX2 = driverCenterX - 0.5 * driverSpacing + Math.cos(driverAngle) * pinR;
    this.ctx.strokeStyle = '#cbd5e1';
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    this.ctx.moveTo(crossheadX, cylY);
    this.ctx.lineTo(pinX2, pinY);
    this.ctx.stroke();

    // 3. Boiler Shell (Matte Cast Iron)
    this.ctx.fillStyle = '#090d16';
    this.ctx.strokeStyle = '#334155';
    this.ctx.lineWidth = 2.0;
    this.ctx.beginPath();
    this.ctx.roundRect(-halfW + 38, bodyTop + 8, w - 82, h - 24, 6);
    this.ctx.fill();
    this.ctx.stroke();

    // Brass Boiler Bands
    this.ctx.strokeStyle = '#f59e0b';
    this.ctx.lineWidth = 1.2;
    for (let bx = -halfW + 55; bx < halfW - 60; bx += 24) {
      this.ctx.beginPath();
      this.ctx.moveTo(bx, bodyTop + 8);
      this.ctx.lineTo(bx, bodyTop + h - 16);
      this.ctx.stroke();
    }

    // Driver Cab
    this.ctx.fillStyle = '#1e293b';
    this.ctx.fillRect(-halfW + 14, bodyTop, 34, h - 16);

    // Glowing Firebox
    this.ctx.fillStyle = '#ef4444';
    this.ctx.shadowColor = '#f97316';
    this.ctx.shadowBlur = 12;
    this.ctx.fillRect(-halfW + 20, -28, 14, 10);
    this.ctx.shadowBlur = 0;

    // Steam Chimney Smokebox
    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(halfW - 55, bodyTop - 10, 14, 18);

    // Steam Whistle Dome (Brass)
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(halfW - 85, bodyTop - 6, 12, 14);
  }

  drawHeadlightBeamLocal(hx, hy, dir, intensity) {
    this.ctx.save();
    const beamLength = 280 * (intensity === 2 ? 1.4 : 0.8);
    const beamEndH = 70;

    const beamGrad = this.ctx.createLinearGradient(hx, hy, hx + dir * beamLength, hy);
    const alpha = (this.timeOfDay === 'night' ? 0.45 : 0.25) * (intensity === 2 ? 1.0 : 0.5);
    beamGrad.addColorStop(0, `rgba(254, 240, 138, ${alpha})`);
    beamGrad.addColorStop(0.35, `rgba(253, 224, 71, ${alpha * 0.7})`);
    beamGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');

    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(hx, hy);
    this.ctx.lineTo(hx + dir * beamLength, hy - beamEndH / 2);
    this.ctx.lineTo(hx + dir * beamLength, hy + beamEndH / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = '#facc15';
    this.ctx.shadowBlur = 18;
    this.ctx.beginPath();
    this.ctx.arc(hx, hy, 4, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * ADVANCED VOLUMETRIC PARTICLES (Smoke, Steam, Sparks)
   */
  spawnLocomotiveParticles(screenX, railheadY, veh) {
    const config = veh.config;
    const notch = this.sim.throttleNotch;
    const halfW = (veh.lengthM * 18 * this.camZoom) / 2;

    if (config.engineType === 'diesel' && notch > 0) {
      if (Math.random() < 0.25 + notch * 0.08) {
        this.smokeParticles.push({
          x: screenX + 10 * this.camZoom,
          y: railheadY - 60 * this.camZoom,
          vx: -this.sim.velocityMs * 0.45 + (Math.random() - 0.5) * 8,
          vy: -35 - notch * 12 + (Math.random() - 0.5) * 10,
          radius: 4,
          maxRadius: 22 + notch * 4,
          life: 1.0,
          decayRate: 0.85,
          colorBase: notch > 5 ? [30, 41, 59] : [100, 116, 139]
        });
      }
    } else if (config.engineType === 'steam') {
      const chuffRate = Math.abs(this.sim.velocityMs) * 0.85 + 0.35;
      if (Math.random() < Math.min(0.85, chuffRate)) {
        this.steamClouds.push({
          x: screenX + halfW - 55 * this.camZoom,
          y: railheadY - 58 * this.camZoom,
          vx: -this.sim.velocityMs * 0.5 + (Math.random() - 0.5) * 12,
          vy: -45 - Math.random() * 25,
          radius: 7,
          maxRadius: 42,
          life: 1.0,
          decayRate: 0.75,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 3
        });
      }
    }

    // Brake Shoe Sparks under heavy air braking
    if (this.sim.brakeCylinderBar > 2.0 && Math.abs(this.sim.velocityMs) > 6) {
      for (let i = 0; i < 2; i++) {
        this.brakeSparks.push({
          x: screenX + (Math.random() - 0.5) * halfW,
          y: railheadY - 4 * this.camZoom,
          vx: (Math.random() - 0.5) * 45 - this.sim.velocityMs * 5,
          vy: -Math.random() * 28,
          life: 0.35 + Math.random() * 0.3
        });
      }
    }
  }

  renderParticles(dt) {
    this.ctx.save();

    // 1. Diesel Smoke Particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const p = this.smokeParticles[i];
      p.life -= dt * p.decayRate;
      if (p.life <= 0) {
        this.smokeParticles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96; // Aerodynamic drag
      p.radius += (p.maxRadius - p.radius) * dt * 2.5;

      const alpha = Math.sin(p.life * Math.PI) * 0.65;
      this.ctx.fillStyle = `rgba(${p.colorBase[0]}, ${p.colorBase[1]}, ${p.colorBase[2]}, ${alpha})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Volumetric Steam Clouds
    for (let i = this.steamClouds.length - 1; i >= 0; i--) {
      const p = this.steamClouds[i];
      p.life -= dt * p.decayRate;
      if (p.life <= 0) {
        this.steamClouds.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.95;
      p.radius += (p.maxRadius - p.radius) * dt * 2.8;

      const alpha = Math.sin(p.life * Math.PI) * 0.72;
      const grad = this.ctx.createRadialGradient(p.x, p.y - p.radius * 0.2, p.radius * 0.1, p.x, p.y, p.radius);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      grad.addColorStop(0.65, `rgba(241, 245, 249, ${alpha * 0.8})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 3. Glowing Brake Shoe Sparks
    for (let i = this.brakeSparks.length - 1; i >= 0; i--) {
      const sp = this.brakeSparks[i];
      sp.life -= dt * 2.2;
      if (sp.life <= 0) {
        this.brakeSparks.splice(i, 1);
        continue;
      }

      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.vy += 80 * dt; // Gravity

      this.ctx.fillStyle = '#fbbf24';
      this.ctx.shadowColor = '#f97316';
      this.ctx.shadowBlur = 6;
      this.ctx.fillRect(sp.x, sp.y, 2.5, 2.5);
    }

    this.ctx.restore();
  }

  renderSakuraPetals(dt) {
    this.ctx.save();
    const w = this.displayWidth;
    const h = this.displayHeight;

    this.sakuraPetals.forEach(p => {
      // Wind speed affected by train relative motion
      const relWind = p.vx - this.sim.velocityMs * 2.0;
      p.x += relWind * dt;
      p.y += p.vy * dt;
      p.rot += p.rotSpeed * dt;

      // Wrap around screen
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y > h + 20) p.y = -20;

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rot);
      this.ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    this.ctx.restore();
  }

  drawWeatherOverlay(dt) {
    if (this.timeOfDay !== 'rain') return;

    this.ctx.save();
    this.ctx.strokeStyle = 'rgba(203, 213, 225, 0.45)';
    this.ctx.lineWidth = 1.2;

    const w = this.displayWidth;
    const h = this.displayHeight;
    const rainCount = 120;

    for (let i = 0; i < rainCount; i++) {
      const rx = (i * 97 + this.timeCounter * 650) % w;
      const ry = (i * 131 + this.timeCounter * 1200) % h;
      this.ctx.beginPath();
      this.ctx.moveTo(rx, ry);
      this.ctx.lineTo(rx - 8, ry + 16);
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  drawFreecamIndicator() {
    // Subtle indicator when freecam offset is active
    if (Math.abs(this.camOffsetX) > 2.0) {
      this.ctx.save();
      const indicatorText = `FREECAM PAN: ${this.camOffsetX > 0 ? '+' : ''}${Math.round(this.camOffsetX)}m • [C] RESET`;
      this.ctx.font = 'bold 10px monospace';
      const textW = this.ctx.measureText(indicatorText).width;
      const bx = this.displayWidth / 2 - textW / 2 - 12;
      const by = 55;

      this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      this.ctx.strokeStyle = '#FFE500';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.roundRect(bx, by, textW + 24, 22, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#FFE500';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(indicatorText, this.displayWidth / 2, by + 15);
      this.ctx.restore();
    }
  }
}
