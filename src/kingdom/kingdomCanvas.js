/**
 * Kingdom Idle: Reborn - Living Kingdom Isometric Canvas Renderer
 * High-fidelity procedural isometric settlement with upgrade-reactive architecture,
 * animated water river with bridges, forge sparks, rotating windmills, villagers, and seasons.
 */

export class KingdomCanvas {
  constructor(canvas, state, audio) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = state;
    this.audio = audio;

    this.particles = [];
    this.floatingTexts = [];
    this.villagers = [];
    this.chimneyParticles = [];
    this.animTime = 0;

    // Viewport pan & zoom
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;

    // Initialize interactive villagers
    this.initVillagers();

    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.resize();

    // Mouse drag & click interactions
    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = false;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) {
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          this.isDragging = true;
          this.panX += dx * 0.7;
          this.panY += dy * 0.7;
          this.dragStartX = e.clientX;
          this.dragStartY = e.clientY;
        }
      }
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      this.zoom = Math.max(0.6, Math.min(2.4, this.zoom * zoomFactor));
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      if (!this.isDragging) {
        this.handleClick(e);
      }
    });
  }

  initVillagers() {
    this.villagers = [];
    const roles = ['farmer', 'woodcutter', 'miner', 'smith', 'guard', 'scholar', 'priest'];
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 120;
      this.villagers.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * (dist * 0.55),
        targetX: Math.cos(angle) * dist,
        targetY: Math.sin(angle) * (dist * 0.55),
        speed: 0.35 + Math.random() * 0.3,
        role: roles[i % roles.length],
        anim: Math.random() * 20,
        pauseTimer: Math.random() * 2
      });
    }
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
      this.ctx.scale(dpr, dpr);
      this.displayWidth = rect.width;
      this.displayHeight = rect.height;
    }
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }

  resetCamera() {
    this.zoom = 1.0;
    this.panX = 0;
    this.panY = 0;
  }

  handleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Harvest calculation
    const goldEarned = Math.max(1, Math.floor(1 + (this.state.population * 0.25)));
    const foodEarned = Math.max(1, Math.floor(2 + (this.state.workers.farmer || 0) * 0.4));
    const woodEarned = Math.max(0, Math.floor((this.state.workers.woodcutter || 0) * 0.2));

    this.state.gold += goldEarned;
    this.state.food += foodEarned;
    if (woodEarned > 0) this.state.wood += woodEarned;
    this.state.stats.manualClicks++;
    this.audio.playCoin();

    // Spawn floating text
    this.floatingTexts.push({
      x: clickX,
      y: clickY,
      text: `+${goldEarned} 🪙  +${foodEarned} 🌾${woodEarned > 0 ? `  +${woodEarned} 🪵` : ''}`,
      color: '#FFE500',
      alpha: 1.0,
      vy: -1.4
    });

    // Particle burst
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 2.8;
      this.particles.push({
        x: clickX,
        y: clickY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1.0,
        color: ['#FFE500', '#FFFFFF', '#10B981', '#F59E0B', '#38BDF8'][i % 5],
        size: 2 + Math.random() * 3.5,
        life: 0.7
      });
    }
  }

  render(dt = 0.016) {
    this.animTime += dt;
    const ctx = this.ctx;
    const w = this.displayWidth || (this.canvas.width / (window.devicePixelRatio || 1));
    const h = this.displayHeight || (this.canvas.height / (window.devicePixelRatio || 1));

    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    const seasonIndex = this.state.seasonIndex || 0;

    // 1. Atmospheric Gradient Backdrop
    this.drawSkyBackdrop(ctx, w, h, seasonIndex);

    // 2. Transform Camera (Center + Pan + Zoom)
    ctx.save();
    const centerX = w / 2 + this.panX;
    const centerY = h / 2 + 20 + this.panY;
    ctx.translate(centerX, centerY);
    ctx.scale(this.zoom, this.zoom);

    // 3. Render Island Terrain Base & River
    this.drawIslandTerrain(ctx, seasonIndex);

    // 4. Render Roads & Canal Bridges
    this.drawRoadsAndBridges(ctx);

    // 5. Render All Upgraded Settlement Buildings
    this.drawUpgradedBuildings(ctx, seasonIndex);

    // 6. Render Animated Villagers and Sentries
    this.drawLivingVillagers(ctx, dt);

    // 7. Render Animated Chimney Smoke & Forge Sparks
    this.renderStructuralVFX(ctx, dt);

    ctx.restore();

    // 8. Foreground Weather / Season Ambient Particles
    this.renderWeatherParticles(ctx, w, h, seasonIndex, dt);

    // 9. Floating Resource Numbers
    this.renderFloatingText(ctx, dt);

    // 10. Minimal Realm Status Stamp
    this.drawRealmOverlay(ctx, w, h);
  }

  drawSkyBackdrop(ctx, w, h, seasonIndex) {
    const sky = ctx.createRadialGradient(w / 2, h * 0.4, 60, w / 2, h / 2, Math.max(w, h));
    if (seasonIndex === 0) { // Spring (Lush Teal / Rose glow)
      sky.addColorStop(0, '#0f2b26');
      sky.addColorStop(0.6, '#061a17');
      sky.addColorStop(1, '#020b0a');
    } else if (seasonIndex === 1) { // Summer (Deep Azure / Golden horizon)
      sky.addColorStop(0, '#132847');
      sky.addColorStop(0.6, '#0c182c');
      sky.addColorStop(1, '#050c17');
    } else if (seasonIndex === 2) { // Autumn (Warm Ember / Twilight)
      sky.addColorStop(0, '#2e1809');
      sky.addColorStop(0.6, '#1a0d05');
      sky.addColorStop(1, '#0a0502');
    } else { // Winter (Crisp Midnight Navy / Starlight)
      sky.addColorStop(0, '#0f172a');
      sky.addColorStop(0.6, '#080c17');
      sky.addColorStop(1, '#020409');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Subtle star twinkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const seed = 42;
    for (let i = 0; i < 24; i++) {
      const sx = ((i * 137.5) % w);
      const sy = ((i * 83.3) % (h * 0.45));
      const pulse = 0.5 + Math.sin(this.animTime * 2 + i) * 0.5;
      ctx.globalAlpha = 0.2 + pulse * 0.5;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
    ctx.globalAlpha = 1.0;
  }

  drawIslandTerrain(ctx, seasonIndex) {
    // Dynamic island diameter expands with kingdom territory & population
    const terr = this.state.territory || 1;
    const islandRadius = Math.min(380, 210 + terr * 16 + Math.min(80, this.state.population * 2));
    const tileH = islandRadius * 0.52;
    const depth = 55;

    // Palette by season
    const grassThemes = [
      { top: '#15803d', light: '#22c55e', sideL: '#166534', sideR: '#14532d', rock: '#334155' }, // Spring
      { top: '#4d7c0f', light: '#65a30d', sideL: '#3f6212', sideR: '#365314', rock: '#1e293b' }, // Summer
      { top: '#9a3412', light: '#c2410c', sideL: '#7c2d12', sideR: '#431407', rock: '#292524' }, // Autumn
      { top: '#cbd5e1', light: '#f1f5f9', sideL: '#94a3b8', sideR: '#64748b', rock: '#1e293b' }  // Winter (snow)
    ];
    const pal = grassThemes[seasonIndex] || grassThemes[0];

    // Left Cliff Wall
    ctx.beginPath();
    ctx.moveTo(-islandRadius, 0);
    ctx.lineTo(0, tileH);
    ctx.lineTo(0, tileH + depth);
    ctx.lineTo(-islandRadius, depth);
    ctx.closePath();
    ctx.fillStyle = pal.sideL;
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Right Cliff Wall
    ctx.beginPath();
    ctx.moveTo(0, tileH);
    ctx.lineTo(islandRadius, 0);
    ctx.lineTo(islandRadius, depth);
    ctx.lineTo(0, tileH + depth);
    ctx.closePath();
    ctx.fillStyle = pal.sideR;
    ctx.fill();
    ctx.stroke();

    // Geological Rock Strata details on cliffs
    ctx.strokeStyle = pal.rock;
    ctx.lineWidth = 3;
    for (let r = 10; r < depth; r += 16) {
      ctx.beginPath();
      ctx.moveTo(-islandRadius * 0.8, r);
      ctx.lineTo(0, tileH + r - 8);
      ctx.lineTo(islandRadius * 0.75, r + 4);
      ctx.stroke();
    }

    // Top Island Surface
    ctx.beginPath();
    ctx.moveTo(0, -tileH);
    ctx.lineTo(islandRadius, 0);
    ctx.lineTo(0, tileH);
    ctx.lineTo(-islandRadius, 0);
    ctx.closePath();
    ctx.fillStyle = pal.top;
    ctx.fill();
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Soft highlight on northern bank
    const topGlow = ctx.createRadialGradient(0, -tileH * 0.3, 10, 0, 0, islandRadius);
    topGlow.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    topGlow.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = topGlow;
    ctx.fill();

    // Animated River Stream traversing from northeast to southwest
    this.drawRiver(ctx, islandRadius, tileH);
  }

  drawRiver(ctx, islandRadius, tileH) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(islandRadius * 0.35, -tileH * 0.7);
    ctx.bezierCurveTo(islandRadius * 0.1, -tileH * 0.2, islandRadius * 0.2, tileH * 0.2, -islandRadius * 0.45, tileH * 0.65);
    ctx.lineTo(-islandRadius * 0.55, tileH * 0.6);
    ctx.bezierCurveTo(islandRadius * 0.1, tileH * 0.15, 0, -tileH * 0.25, islandRadius * 0.25, -tileH * 0.75);
    ctx.closePath();

    // Water gradient with shimmering wavelets
    const waterGrad = ctx.createLinearGradient(0, -tileH, 0, tileH);
    waterGrad.addColorStop(0, '#0284c7');
    waterGrad.addColorStop(0.5, '#0369a1');
    waterGrad.addColorStop(1, '#075985');
    ctx.fillStyle = waterGrad;
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Animated water ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const offset = (this.animTime * 20 + i * 40) % (islandRadius * 0.8);
      ctx.beginPath();
      ctx.arc(islandRadius * 0.1 - offset * 0.4, -tileH * 0.2 + offset * 0.5, 8, 0.4, 2.2);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawRoadsAndBridges(ctx) {
    ctx.save();
    // Cobblestone Highway
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-140, 20);
    ctx.lineTo(0, 0);
    ctx.lineTo(130, -20);
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-140, 20);
    ctx.lineTo(0, 0);
    ctx.lineTo(130, -20);
    ctx.stroke();

    // Stone / Wooden River Bridge
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.fillRect(-22, -8, 44, 16);
    ctx.strokeRect(-22, -8, 44, 16);

    // Bridge Planks
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    for (let x = -18; x <= 18; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, -8);
      ctx.lineTo(x, 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawUpgradedBuildings(ctx, seasonIndex) {
    const b = this.state.buildings;
    const titleRank = this.state.getTitleInfo().rank || 1;

    // 1. Central Keep / Castle Palace (Upgrades heavily with title rank & walls)
    this.drawDetailedCastleKeep(ctx, 0, -25, titleRank, b.fortressWall || 0);

    // 2. Residential Houses (Hovels, Cottages, Estates)
    this.drawResidentialSector(ctx, -120, -50, b.hovel || 0, b.cottage || 0, b.estate || 0);

    // 3. Farms & Windmill (Agricultural District)
    this.drawAgriculturalDistrict(ctx, 110, -50, b.farm || 0, b.windmill || 0, seasonIndex);

    // 4. Timber Camp & Sawmill (Forestry Sector)
    this.drawForestrySector(ctx, 110, 45, b.lumberCamp || 0, b.sawmill || 0);

    // 5. Stone Quarry & Iron Mine (Mining District)
    this.drawMiningDistrict(ctx, -130, 40, b.quarryDerrick || 0, b.ironMineShaft || 0);

    // 6. Blacksmith Forge (Industrial Forge)
    if (b.blacksmith > 0) {
      this.drawBlacksmithForge(ctx, -55, 35, b.blacksmith);
    }

    // 7. Market Stalls & Guild Hall (Commercial Hub)
    if (b.marketStall > 0 || b.guildHall > 0) {
      this.drawCommercialSector(ctx, 45, 30, b.marketStall || 0, b.guildHall || 0);
    }

    // 8. Chapel & Cathedral (Holy District)
    if (b.chapel > 0 || b.cathedral > 0) {
      this.drawHolySector(ctx, -60, -75, b.chapel || 0, b.cathedral || 0);
    }

    // 9. Arcane Spire Tower (Magical Academy)
    if (b.arcaneTower > 0) {
      this.drawArcaneSpire(ctx, 60, -85, b.arcaneTower);
    }

    // 10. Military Barracks & Walls (Garrison Bastion)
    if (b.barracks > 0 || b.fortressWall > 0 || b.siegeWorkshop > 0) {
      this.drawGarrisonBastion(ctx, -10, 55, b.barracks || 0, b.siegeWorkshop || 0);
    }
  }

  // 1. Detailed Multi-Level Castle Keep
  drawDetailedCastleKeep(ctx, x, y, rank, wallLevel) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow on ground
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 24, 46 + rank * 6, 18 + rank * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    const w = 44 + rank * 7;
    const h = 48 + rank * 9;

    // Stone Block Texture Base
    ctx.fillStyle = rank >= 5 ? '#1e293b' : (rank >= 3 ? '#334155' : '#475569');
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(-w / 2, -h, w, h);

    // Masonry Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let ly = -h + 10; ly < 0; ly += 10) {
      ctx.beginPath();
      ctx.moveTo(-w / 2, ly);
      ctx.lineTo(w / 2, ly);
      ctx.stroke();
    }

    // Crenellations / Battlements
    const merlonCount = 4 + rank;
    const mWidth = w / merlonCount;
    ctx.fillStyle = rank >= 5 ? '#334155' : '#64748b';
    for (let i = 0; i < merlonCount; i += 2) {
      ctx.fillRect(-w / 2 + i * mWidth, -h - 10, mWidth, 10);
      ctx.strokeRect(-w / 2 + i * mWidth, -h - 10, mWidth, 10);
    }

    // Corner Watchtowers (If Rank >= 3)
    if (rank >= 3) {
      [-w / 2 - 6, w / 2 - 6].forEach(tx => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx, -h - 18, 12, h + 18);
        ctx.strokeRect(tx, -h - 18, 12, h + 18);

        // Tower Roof Spire
        ctx.fillStyle = rank >= 5 ? '#1e40af' : '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(tx - 2, -h - 18);
        ctx.lineTo(tx + 6, -h - 34);
        ctx.lineTo(tx + 14, -h - 18);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    }

    // Imperial Golden Dome / Spires (If Rank >= 6)
    if (rank >= 6) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(0, -h - 12, 14, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-2, -h - 32, 4, 18);
    }

    // Grand Portal / Gate
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, -18, 10, Math.PI, 0);
    ctx.rect(-10, -18, 20, 18);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Portcullis Grate
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-6, -18); ctx.lineTo(-6, 0);
    ctx.moveTo(-2, -18); ctx.lineTo(-2, 0);
    ctx.moveTo(2, -18); ctx.lineTo(2, 0);
    ctx.moveTo(6, -18); ctx.lineTo(6, 0);
    ctx.stroke();

    // Stained Glass / Lantern Windows
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-12, -h * 0.6, 6, 10);
    ctx.fillRect(6, -h * 0.6, 6, 10);

    // Royal Banner Flapping in Wind
    const flagH = h + (rank >= 5 ? 38 : 24);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -h);
    ctx.lineTo(0, -flagH);
    ctx.stroke();

    const wave = Math.sin(this.animTime * 5) * 5;
    ctx.fillStyle = rank >= 5 ? '#FFE500' : (rank >= 3 ? '#3b82f6' : '#FF2A85');
    ctx.beginPath();
    ctx.moveTo(0, -flagH);
    ctx.lineTo(22 + wave, -flagH + 7);
    ctx.lineTo(0, -flagH + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Heraldic crest on flag
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(7 + wave * 0.3, -flagH + 7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 2. Residential Sector (Hovel, Cottage, Estate)
  drawResidentialSector(ctx, x, y, hovels, cottages, estates) {
    ctx.save();
    ctx.translate(x, y);

    const totalHouses = hovels + cottages + estates;
    if (totalHouses === 0) {
      ctx.restore();
      return;
    }

    // Cluster 1: Peasant Hovels (Straw roofs, timber)
    if (hovels > 0) {
      const displayCount = Math.min(3, hovels);
      for (let i = 0; i < displayCount; i++) {
        const ox = (i - 1) * 20;
        const oy = i * 8;

        // Timber walls
        ctx.fillStyle = '#78350f';
        ctx.fillRect(ox - 8, oy - 12, 16, 12);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox - 8, oy - 12, 16, 12);

        // Thatched Straw Roof
        ctx.fillStyle = '#ca8a04';
        ctx.beginPath();
        ctx.moveTo(ox - 10, oy - 12);
        ctx.lineTo(ox, oy - 20);
        ctx.lineTo(ox + 10, oy - 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Cluster 2: Stone Cottages (Red tiled roofs, glass windows)
    if (cottages > 0) {
      const displayCount = Math.min(3, cottages);
      for (let i = 0; i < displayCount; i++) {
        const ox = (i - 1) * 24 - 15;
        const oy = -25 + i * 10;

        // Stone Wall
        ctx.fillStyle = '#64748b';
        ctx.fillRect(ox - 10, oy - 14, 20, 14);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(ox - 10, oy - 14, 20, 14);

        // Red Tile Roof
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(ox - 12, oy - 14);
        ctx.lineTo(ox, oy - 24);
        ctx.lineTo(ox + 12, oy - 14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Chimney
        ctx.fillStyle = '#475569';
        ctx.fillRect(ox + 4, oy - 26, 4, 8);
      }
    }

    // Cluster 3: Noble Estates (Grand 2-story manor with portico)
    if (estates > 0) {
      const ox = 15;
      const oy = -40;

      // 2-Story Manor
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(ox - 16, oy - 26, 32, 26);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.strokeRect(ox - 16, oy - 26, 32, 26);

      // Mansard Slate Blue Roof
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(ox - 18, oy - 26);
      ctx.lineTo(ox - 10, oy - 38);
      ctx.lineTo(ox + 10, oy - 38);
      ctx.lineTo(ox + 18, oy - 26);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Balcony & Pillars
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(ox - 6, oy - 16, 12, 4);
    }

    ctx.restore();
  }

  // 3. Agricultural District (Wheat Plots, Windmill)
  drawAgriculturalDistrict(ctx, x, y, farmLvl, windmillLvl, seasonIndex) {
    ctx.save();
    ctx.translate(x, y);

    // Wheat Furrows based on Farm Level
    if (farmLvl > 0) {
      const plotW = 38 + Math.min(30, farmLvl * 4);
      const plotH = 24 + Math.min(18, farmLvl * 2);

      ctx.fillStyle = seasonIndex === 3 ? '#e2e8f0' : (seasonIndex === 2 ? '#b45309' : '#eab308');
      ctx.fillRect(-plotW / 2, -plotH / 2, plotW, plotH);
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-plotW / 2, -plotH / 2, plotW, plotH);

      // Crops stripes
      ctx.strokeStyle = seasonIndex === 3 ? '#94a3b8' : '#ca8a04';
      ctx.lineWidth = 1.2;
      for (let py = -plotH / 2 + 4; py < plotH / 2; py += 5) {
        ctx.beginPath();
        ctx.moveTo(-plotW / 2 + 2, py);
        ctx.lineTo(plotW / 2 - 2, py);
        ctx.stroke();
      }

      // Wooden Scarecrow
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-2, -plotH / 2 - 8, 4, 8);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-5, -plotH / 2 - 7, 10, 3);
    }

    // Windmill (Multi-level detail)
    if (windmillLvl > 0) {
      const wx = 20;
      const wy = -18;
      const isStoneMill = windmillLvl >= 3;

      // Base
      ctx.fillStyle = isStoneMill ? '#475569' : '#f8fafc';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wx - 14, wy);
      ctx.lineTo(wx - 9, wy - 36);
      ctx.lineTo(wx + 9, wy - 36);
      ctx.lineTo(wx + 14, wy);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Roof Cap
      ctx.fillStyle = '#991b1b';
      ctx.beginPath();
      ctx.moveTo(wx - 11, wy - 36);
      ctx.lineTo(wx, wy - 48);
      ctx.lineTo(wx + 11, wy - 36);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Rotating 4-Winged Sails
      const angle = this.animTime * (1.8 + windmillLvl * 0.2);
      ctx.save();
      ctx.translate(wx, wy - 36);
      ctx.rotate(angle);

      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = 'rgba(254, 240, 138, 0.9)';
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.fillRect(0, -3, 24 + Math.min(10, windmillLvl * 2), 6);
        ctx.strokeRect(0, -3, 24 + Math.min(10, windmillLvl * 2), 6);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // 4. Forestry Sector (Lumber Camp + Sawmill with Waterwheel)
  drawForestrySector(ctx, x, y, campLvl, sawmillLvl) {
    ctx.save();
    ctx.translate(x, y);

    if (campLvl === 0 && sawmillLvl === 0) {
      ctx.restore();
      return;
    }

    // Woodsman Cabin
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-18, -16, 26, 16);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -16, 26, 16);

    // Pine Bark Roof
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.moveTo(-20, -16);
    ctx.lineTo(-5, -28);
    ctx.lineTo(10, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Stacked Lumber Beams
    ctx.fillStyle = '#a16207';
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3 - r; c++) {
        ctx.beginPath();
        ctx.arc(16 + c * 7, -2 - r * 6, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#451a03';
        ctx.stroke();
      }
    }

    // Advanced Sawmill Waterwheel (If sawmillLvl > 0)
    if (sawmillLvl > 0) {
      const wheelAngle = this.animTime * 3.2;
      ctx.save();
      ctx.translate(-26, -4);
      ctx.rotate(wheelAngle);

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.stroke();

      for (let p = 0; p < 6; p++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(-2, -14, 4, 8);
      }
      ctx.restore();
    }

    ctx.restore();
  }

  // 5. Mining District (Stone Derrick & Iron Shaft)
  drawMiningDistrict(ctx, x, y, quarryLvl, ironLvl) {
    ctx.save();
    ctx.translate(x, y);

    if (quarryLvl === 0 && ironLvl === 0) {
      ctx.restore();
      return;
    }

    // Quarry Stone Pit Excavation
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, 4, 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Wooden Derrick Gantry Crane
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-16, 4);
    ctx.lineTo(-8, -32);
    ctx.lineTo(12, -32);
    ctx.lineTo(16, 4);
    ctx.stroke();

    // Winch Cable & Ore Bucket
    const bucketSwing = Math.sin(this.animTime * 3) * 3;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(4, -32);
    ctx.lineTo(4 + bucketSwing, -14);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.fillRect(1 + bucketSwing, -14, 7, 7);

    // Deep Iron Mine Shaft Fortified Entry (If IronLvl > 0)
    if (ironLvl > 0) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-34, -18, 14, 18);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(-34, -18, 14, 18);

      // Iron Mine Cart
      ctx.fillStyle = '#334155';
      ctx.fillRect(-32, 2, 10, 6);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(-32, 2, 10, 6);
    }

    ctx.restore();
  }

  // 6. Blacksmith Forge (Puffing Chimney & Glowing Anvil)
  drawBlacksmithForge(ctx, x, y, level) {
    ctx.save();
    ctx.translate(x, y);

    // Stone Smithy Building
    ctx.fillStyle = '#334155';
    ctx.fillRect(-14, -18, 28, 18);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-14, -18, 28, 18);

    // Roof
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-16, -18);
    ctx.lineTo(0, -28);
    ctx.lineTo(16, -18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Smoking Chimney
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-12, -34, 6, 16);
    ctx.strokeRect(-12, -34, 6, 16);

    // Glowing Orange Forge Hearth
    const pulse = 0.7 + Math.sin(this.animTime * 8) * 0.3;
    ctx.fillStyle = `rgba(249, 115, 22, ${pulse})`;
    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 10;
    ctx.fillRect(4, -12, 8, 10);
    ctx.shadowBlur = 0;

    // Anvil
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, -4, 8, 4);

    ctx.restore();
  }

  // 7. Commercial Sector (Market Stalls, Guild Hall)
  drawCommercialSector(ctx, x, y, stalls, guildHall) {
    ctx.save();
    ctx.translate(x, y);

    // Striped Bazaar Canopies
    if (stalls > 0) {
      const colors = ['#ef4444', '#f59e0b', '#3b82f6'];
      for (let i = 0; i < Math.min(3, stalls); i++) {
        const ox = (i - 1) * 20;
        const oy = i * 6;

        // Stall table
        ctx.fillStyle = '#78350f';
        ctx.fillRect(ox - 8, oy - 6, 16, 6);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(ox - 8, oy - 6, 16, 6);

        // Striped Awning
        ctx.fillStyle = colors[i % colors.length];
        ctx.beginPath();
        ctx.moveTo(ox - 10, oy - 12);
        ctx.lineTo(ox + 10, oy - 12);
        ctx.lineTo(ox + 8, oy - 6);
        ctx.lineTo(ox - 8, oy - 6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // Guild Hall (Prominent Building with Flag)
    if (guildHall > 0) {
      const gx = 25;
      const gy = -25;
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(gx - 14, gy - 20, 28, 20);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(gx - 14, gy - 20, 28, 20);

      // Gabled Roof
      ctx.fillStyle = '#1e3a8a';
      ctx.beginPath();
      ctx.moveTo(gx - 16, gy - 20);
      ctx.lineTo(gx, gy - 32);
      ctx.lineTo(gx + 16, gy - 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Trade Scale Crest
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(gx, gy - 12, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 8. Holy District (Chapel, Grand Cathedral)
  drawHolySector(ctx, x, y, chapelLvl, cathedralLvl) {
    ctx.save();
    ctx.translate(x, y);

    const isGrand = cathedralLvl > 0;
    const w = isGrand ? 34 : 22;
    const h = isGrand ? 48 : 30;

    // Marble Stone Walls
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-w / 2, -h, w, h);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-w / 2, -h, w, h);

    // Gothic Steeple Spire
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(-w / 2 - 2, -h);
    ctx.lineTo(0, -h - (isGrand ? 32 : 20));
    ctx.lineTo(w / 2 + 2, -h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Golden Cross
    const crossTop = -h - (isGrand ? 32 : 20);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, crossTop);
    ctx.lineTo(0, crossTop - 10);
    ctx.moveTo(-4, crossTop - 7);
    ctx.lineTo(4, crossTop - 7);
    ctx.stroke();

    // Radiant stained glass window
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, -h * 0.6, isGrand ? 6 : 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.restore();
  }

  // 9. Arcane Spire Tower (Floating Crystals & Runic Rings)
  drawArcaneSpire(ctx, x, y, level) {
    ctx.save();
    ctx.translate(x, y);

    const towerH = 50 + Math.min(25, level * 3);

    // Deep Obsidian Spire
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-10, -towerH, 20, towerH);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(-10, -towerH, 20, towerH);

    // Glowing Leyline Runes
    const runeGlow = 0.5 + Math.sin(this.animTime * 4) * 0.5;
    ctx.fillStyle = `rgba(192, 132, 252, ${runeGlow})`;
    ctx.fillRect(-4, -towerH * 0.7, 8, 2);
    ctx.fillRect(-6, -towerH * 0.4, 12, 2);

    // Floating Orbiting Crystal
    const crystalFloat = Math.sin(this.animTime * 3.5) * 5;
    const crystalY = -towerH - 18 + crystalFloat;

    ctx.fillStyle = '#d8b4fe';
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.moveTo(0, crystalY - 10);
    ctx.lineTo(7, crystalY);
    ctx.lineTo(0, crystalY + 10);
    ctx.lineTo(-7, crystalY);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Orbiting magical sparks
    const orbitAngle = this.animTime * 4;
    const ox = Math.cos(orbitAngle) * 14;
    const oy = Math.sin(orbitAngle) * 6;
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(ox, crystalY + oy, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 10. Garrison Bastion & Siege Workshop
  drawGarrisonBastion(ctx, x, y, barracksLvl, siegeLvl) {
    ctx.save();
    ctx.translate(x, y);

    // Fortified Barracks
    ctx.fillStyle = '#475569';
    ctx.fillRect(-18, -16, 36, 16);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-18, -16, 36, 16);

    // Red Roof
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-20, -16);
    ctx.lineTo(0, -26);
    ctx.lineTo(20, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Weapon Rack / Shields
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -8, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Siege Trebuchet (If siegeLvl > 0)
    if (siegeLvl > 0) {
      const tx = 28;
      const ty = -2;

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx - 6, ty);
      ctx.lineTo(tx, ty - 16);
      ctx.lineTo(tx + 6, ty);
      ctx.stroke();

      // Throwing Arm & Counterweight
      ctx.strokeStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(tx - 12, ty - 8);
      ctx.lineTo(tx + 14, ty - 22);
      ctx.stroke();

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tx - 14, ty - 10, 5, 5);
    }

    ctx.restore();
  }

  drawLivingVillagers(ctx, dt) {
    this.villagers.forEach(v => {
      // Movement logic
      if (v.pauseTimer > 0) {
        v.pauseTimer -= dt;
      } else {
        const dx = v.targetX - v.x;
        const dy = v.targetY - v.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 4) {
          const angle = Math.random() * Math.PI * 2;
          const range = 40 + Math.random() * 120;
          v.targetX = Math.cos(angle) * range;
          v.targetY = Math.sin(angle) * (range * 0.52);
          v.pauseTimer = 1.5 + Math.random() * 3;
        } else {
          v.x += (dx / dist) * v.speed;
          v.y += (dy / dist) * v.speed;
        }
      }

      v.anim += dt * 6;

      ctx.save();
      ctx.translate(v.x, v.y);

      // Villager Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 1, 3.5, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Walking bounce
      const bob = Math.abs(Math.sin(v.anim)) * 1.5;

      // Clothes by Role
      let tunic = '#f59e0b';
      if (v.role === 'guard') tunic = '#64748b';
      if (v.role === 'priest') tunic = '#f8fafc';
      if (v.role === 'woodcutter') tunic = '#16a34a';
      if (v.role === 'scholar') tunic = '#3b82f6';
      if (v.role === 'smith') tunic = '#ea580c';

      // Body
      ctx.fillStyle = tunic;
      ctx.fillRect(-2, -6 - bob, 4, 5);

      // Head
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -8 - bob, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Spear for Guard
      if (v.role === 'guard') {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(3, 0);
        ctx.lineTo(3, -12 - bob);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  renderStructuralVFX(ctx, dt) {
    // Generate chimney puffs from smithy & cottages
    if (Math.random() < 0.25) {
      this.chimneyParticles.push({
        x: -55 - 10 + (Math.random() - 0.5) * 4,
        y: 35 - 34,
        vx: 0.2 + (Math.random() - 0.5) * 0.4,
        vy: -0.8 - Math.random() * 0.6,
        size: 2.5,
        alpha: 0.6,
        color: '#94a3b8'
      });
    }

    // Tick smoke particles
    for (let i = this.chimneyParticles.length - 1; i >= 0; i--) {
      const p = this.chimneyParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.size += dt * 3.5;
      p.alpha -= dt * 0.35;

      if (p.alpha <= 0) {
        this.chimneyParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  renderWeatherParticles(ctx, w, h, seasonIndex, dt) {
    if (Math.random() < 0.35) {
      this.particles.push({
        x: Math.random() * w,
        y: -10,
        vx: (Math.random() - 0.5) * 2,
        vy: 1.2 + Math.random() * 2.5,
        alpha: 0.85,
        life: 5.0,
        color: seasonIndex === 3 ? '#ffffff' : (seasonIndex === 0 ? '#fbcfe8' : (seasonIndex === 2 ? '#fdba74' : '#fef08a')),
        size: seasonIndex === 3 ? 2.2 : 3.0
      });
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      p.alpha = Math.max(0, p.life * 0.25);

      if (p.life <= 0 || p.y > h + 10) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  renderFloatingText(ctx, dt) {
    ctx.font = '900 15px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= dt * 1.3;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = '#000000';
      ctx.fillText(ft.text, ft.x + 1.5, ft.y + 1.5);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  drawRealmOverlay(ctx, w, h) {
    // Elegant bottom-left quick tip badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(16, h - 36, 320, 24);
    ctx.strokeStyle = '#FFE500';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, h - 36, 320, 24);

    ctx.fillStyle = '#FFE500';
    ctx.font = '800 10px "Plus Jakarta Sans", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('⚡ KLIK REALM UNTUK PANEN / [SPACEBAR] • ZOOM [SCROLL] ⚡', 24, h - 20);
  }
}
