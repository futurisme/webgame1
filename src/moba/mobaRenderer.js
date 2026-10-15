/**
 * 2.5D High-Performance Third-Person Isometric Renderer for Dawn Arena MOBA.
 * Engine Version: 2026-10-13 2.5D Reworks.
 * Features:
 * - Real 2.5D Third-Person Perspective (Camera tilted at ~56° pitch with PITCH=0.72).
 * - Full Y-Depth Sorting (Dynamic Z-ordering for realistic 3D occlusion of all entities).
 * - Upright 2.5D Procedural Vector Hero Models, Turrets, Nexus Cores, Minions & Bosses.
 * - Elevated Projectiles with Ground Drop Shadows & 2.5D Skill Targeting Ellipses.
 * - 100% Internal-Custom Engine, Ultra-Lightweight, Zero External Assets, 60-120 FPS.
 */

import {
  renderHeroShadow2D5,
  renderCastAura2D5,
  applyHitFlash2D5,
  renderLayla2D5,
  renderTigreal2D5,
  renderEudora2D5,
  renderAlucard2D5,
  renderChou2D5,
  renderMiya2D5,
  renderGrock2D5,
  renderBalmond2D5,
  renderGusion2D5,
  renderKagura2D5
} from './mobaHeroModels.js';

export class MobaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      willReadFrequently: false
    }) || canvas.getContext('2d');

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Realistic 2.5D Isometric Pitch Ratio (~56° elevation angle)
    this.pitch = 0.72;

    this.camera = {
      x: 360,
      y: 2840,
      targetX: 360,
      targetY: 2840,
      zoom: 1.0,
      width: window.innerWidth || 1280,
      height: window.innerHeight || 720
    };

    this.time = 0;
    this.resize();
    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth || document.documentElement.clientWidth || 1280;
    const h = window.innerHeight || document.documentElement.clientHeight || 720;
    this.camera.width = w;
    this.camera.height = h;
    this.dpr = dpr;
    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  destroy() {
    window.removeEventListener('resize', this._onResize);
  }

  updateCamera(targetX, targetY, dt, shakeX = 0, shakeY = 0) {
    const lerpSpeed = 7.5;
    this.camera.targetX = targetX;
    this.camera.targetY = targetY;

    this.camera.x += (this.camera.targetX - this.camera.x) * Math.min(1, lerpSpeed * dt);
    this.camera.y += (this.camera.targetY - this.camera.y) * Math.min(1, lerpSpeed * dt);

    this.camera.x += shakeX;
    this.camera.y += shakeY;
  }

  // Inverse 2.5D transformation: Screen coordinates to Ground Plane World coordinates
  screenToWorld(sx, sy) {
    const halfW = this.camera.width / 2;
    const halfH = this.camera.height / 2;
    return {
      x: (sx - halfW) / this.camera.zoom + this.camera.x,
      y: (sy - halfH) / (this.camera.zoom * this.pitch) + this.camera.y
    };
  }

  // Forward 2.5D transformation: Ground Plane World coordinates (+ optional vertical elevation Z) to Screen coordinates
  worldToScreen(wx, wy, z = 0) {
    const halfW = this.camera.width / 2;
    const halfH = this.camera.height / 2;
    return {
      x: (wx - this.camera.x) * this.camera.zoom + halfW,
      y: (wy - this.camera.y) * this.pitch * this.camera.zoom + halfH - z * this.camera.zoom
    };
  }

  render(engine) {
    this.time += 0.016;
    const ctx = this.ctx;
    const w = this.camera.width;
    const h = this.camera.height;
    const dpr = this.dpr || 1;

    // Clear buffer with deep battleground space
    ctx.fillStyle = '#060a12';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const cameraBounds = {
      x: this.camera.x - (w / 2) / this.camera.zoom - 140,
      y: this.camera.y - (h / 2) / (this.camera.zoom * this.pitch) - 140,
      w: w / this.camera.zoom + 280,
      h: (h / (this.camera.zoom * this.pitch)) + 280
    };

    // ========================================================
    // LAYER 1: GROUND PLANE WITH 2.5D PERSPECTIVE MATRIX
    // ========================================================
    ctx.save();
    if (dpr !== 1) ctx.scale(dpr, dpr);
    ctx.translate(w / 2, h / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom * this.pitch);
    ctx.translate(-this.camera.x, -this.camera.y);

    // 1. Terrain Grass, River, Cobblestone Lanes, Boss Pits
    this.renderTerrain(ctx, engine.map, cameraBounds);

    // 2. Base Fountain Healing Rings & Ground Decals
    this.renderGroundBases(ctx, engine.map);

    // 3. Ground Bush Footprints
    for (const b of engine.map.bushes) {
      this.renderGroundBushFootprint(ctx, b);
    }

    // 4. Aiming Reticle (Circles project as 2.5D ground ellipses!)
    if (engine.aimingState && engine.aimingState.active) {
      this.renderAimingReticle2D5(ctx, engine.playerHero, engine.aimingState);
    }

    ctx.restore();

    // ========================================================
    // LAYER 2: 2.5D UPRIGHT ENTITIES WITH DEPTH SORTING (Y-SORT)
    // ========================================================
    const entities = [];

    // Turrets
    for (const t of engine.map.turrets) {
      entities.push({ type: 'turret', y: t.y, data: t });
    }

    // Base Nexus Cores
    entities.push({ type: 'core', y: engine.map.blueCore.y, data: engine.map.blueCore });
    entities.push({ type: 'core', y: engine.map.redCore.y, data: engine.map.redCore });

    // Jungle Camps & Bosses
    for (const c of engine.jungleManager.camps) {
      entities.push({ type: 'camp', y: c.y, data: c });
    }
    if (engine.jungleManager.turtleAlive && engine.jungleManager.turtleEntity && engine.jungleManager.turtleEntity.alive) {
      entities.push({ type: 'turtle', y: engine.jungleManager.turtleEntity.y, data: engine.jungleManager.turtleEntity });
    }
    if (engine.jungleManager.lordAlive && engine.jungleManager.lordEntity && engine.jungleManager.lordEntity.alive) {
      entities.push({ type: 'lord', y: engine.jungleManager.lordEntity.y, data: engine.jungleManager.lordEntity });
    }
    if (engine.isLordMarching && engine.lordEntity && engine.lordEntity.alive) {
      entities.push({ type: 'marching_lord', y: engine.lordEntity.y, data: engine.lordEntity });
    }

    // Minions
    for (const m of engine.minionManager.minions) {
      if (m.alive) {
        entities.push({ type: 'minion', y: m.y, data: m });
      }
    }

    // Heroes
    for (const h of engine.heroes) {
      if (h.alive) {
        if (h.isConcealed && h !== engine.playerHero && h.team !== engine.playerHero.team) {
          continue;
        }
        entities.push({ type: 'hero', y: h.y, data: h });
      }
    }

    // Volumetric Bush Canopies (characters walk behind/under them)
    for (const b of engine.map.bushes) {
      entities.push({ type: 'bush_canopy', y: b.y, data: b });
    }

    // Sort all upright entities back-to-front by Y coordinate
    entities.sort((a, b) => a.y - b.y);

    // Render sorted upright entities in screen space
    ctx.save();
    if (dpr !== 1) ctx.scale(dpr, dpr);

    for (const item of entities) {
      const spos = this.worldToScreen(item.data.x, item.data.y);
      // Viewport frustum culling
      if (spos.x < -140 || spos.x > w + 140 || spos.y < -140 || spos.y > h + 140) {
        continue;
      }

      ctx.save();
      ctx.translate(spos.x, spos.y);
      ctx.scale(this.camera.zoom, this.camera.zoom);

      switch (item.type) {
        case 'turret':
          this.renderTurret2D5(ctx, item.data, engine.heroes);
          break;
        case 'core':
          this.renderCore2D5(ctx, item.data);
          break;
        case 'camp':
          this.renderCamp2D5(ctx, item.data);
          break;
        case 'turtle':
          this.renderTurtle2D5(ctx, item.data);
          break;
        case 'lord':
        case 'marching_lord':
          this.renderLord2D5(ctx, item.data);
          break;
        case 'minion':
          this.renderMinion2D5(ctx, item.data);
          break;
        case 'hero':
          this.renderHero2D5(ctx, item.data, engine.playerHero);
          break;
        case 'bush_canopy':
          this.renderBushCanopy2D5(ctx, item.data, engine.playerHero);
          break;
      }
      ctx.restore();
    }

    // ========================================================
    // LAYER 3: PROJECTILES, PARTICLES & COMBAT TEXTS IN 2.5D
    // ========================================================
    this.renderProjectiles2D5(ctx, engine);
    engine.particles.render2D5(ctx, this);
    engine.combatTexts.render2D5(ctx, this);

    ctx.restore();

    // ========================================================
    // LAYER 4: TACTICAL MINIMAP OVERLAY (TOP RIGHT)
    // ========================================================
    ctx.save();
    if (dpr !== 1) ctx.scale(dpr, dpr);
    this.renderMinimap(ctx, engine);
    ctx.restore();
  }

  // --- 2.5D Ground Plane Terrain Layers ---

  renderTerrain(ctx, map, bounds) {
    // 1. Base Grass Field
    ctx.fillStyle = '#0f1c2d';
    ctx.fillRect(0, 0, map.width, map.height);

    // Subtle 2.5D Isometric Grass Tile Pattern
    ctx.fillStyle = 'rgba(16, 185, 129, 0.04)';
    for (let x = 0; x < map.width; x += 160) {
      for (let y = 0; y < map.height; y += 160) {
        if ((x + y) % 320 === 0) {
          ctx.fillRect(x, y, 80, 80);
        }
      }
    }

    // 2. Animated River Waterway with Currents & Banks
    ctx.fillStyle = '#08253d'; // Deep riverbed
    ctx.beginPath();
    ctx.moveTo(0, 1600);
    ctx.lineTo(1600, 0);
    ctx.lineTo(1880, 0);
    ctx.lineTo(3200, 1320);
    ctx.lineTo(3200, 1600);
    ctx.lineTo(1600, 3200);
    ctx.lineTo(1320, 3200);
    ctx.lineTo(0, 1880);
    ctx.closePath();
    ctx.fill();

    // Flowing River Center Channel
    ctx.fillStyle = '#0e3d5e';
    ctx.beginPath();
    ctx.moveTo(0, 1640);
    ctx.lineTo(1640, 0);
    ctx.lineTo(1840, 0);
    ctx.lineTo(3200, 1360);
    ctx.lineTo(3200, 1560);
    ctx.lineTo(1560, 3200);
    ctx.lineTo(1360, 3200);
    ctx.lineTo(0, 1840);
    ctx.closePath();
    ctx.fill();

    // Animated River Current Caustics
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const offset = (this.time * 40 + i * 260) % 2400;
      ctx.beginPath();
      ctx.arc(1600 + (i % 2 === 0 ? offset * 0.4 : -offset * 0.4), 1600 + (offset - 1200) * 0.4, 55 + i * 14, 0, Math.PI * 0.7);
      ctx.stroke();
    }

    // 3. Paved Stone Lanes (Top, Mid, Bot)
    this.renderLanePath(ctx, map.lanePaths.top);
    this.renderLanePath(ctx, map.lanePaths.mid);
    this.renderLanePath(ctx, map.lanePaths.bot);

    // 4. Boss Summoning Pits (Cryoturtle & Sanctuary Lord)
    this.renderRiverPit(ctx, 1250, 1100, 'CRYOTURTLE', '#06b6d4');
    this.renderRiverPit(ctx, 1950, 2100, 'SANCTUARY LORD', '#eab308');
  }

  renderLanePath(ctx, path) {
    // Outer stone road border
    ctx.strokeStyle = '#1b2a3f';
    ctx.lineWidth = 148;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    path.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.stroke();

    // Inner flagged cobblestone pavers
    ctx.strokeStyle = '#273c57';
    ctx.lineWidth = 110;
    ctx.stroke();

    // Center dividing road stripe with golden runes
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
    ctx.lineWidth = 4;
    ctx.setLineDash([25, 35]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  renderRiverPit(ctx, x, y, label, color) {
    ctx.save();
    // Dark stone pit floor
    ctx.fillStyle = '#071524';
    ctx.beginPath();
    ctx.arc(x, y, 165, 0, Math.PI * 2);
    ctx.fill();

    // Outer rocky rim
    ctx.strokeStyle = '#1e334a';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Runic summoning ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.arc(x, y, 135, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Rotating rune glyphs
    ctx.translate(x, y);
    ctx.rotate(this.time * 0.2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 110, Math.sin(a) * 110);
      ctx.lineTo(Math.cos(a + 0.3) * 125, Math.sin(a + 0.3) * 125);
      ctx.stroke();
    }
    ctx.restore();

    // Label
    ctx.fillStyle = color;
    ctx.font = '900 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y - 175);
  }

  renderGroundBases(ctx, map) {
    // Blue & Red Fountain healing pools on ground plane
    this.renderFountain(ctx, map.blueFountain, '#38bdf8');
    this.renderFountain(ctx, map.redFountain, '#ef4444');
  }

  renderFountain(ctx, f, color) {
    ctx.fillStyle = f.team === 'blue' ? 'rgba(56, 189, 248, 0.16)' : 'rgba(239, 68, 68, 0.16)';
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Animated healing ripple wave
    const pulseR = Math.max(0.5, (this.time * 70) % Math.max(1, f.radius));
    ctx.strokeStyle = f.team === 'blue' ? 'rgba(56, 189, 248, 0.5)' : 'rgba(239, 68, 68, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(f.x, f.y, pulseR, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderGroundBushFootprint(ctx, b) {
    // Ground shadow for bush
    ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // ========================================================
  // 2.5D UPRIGHT ENTITY RENDERERS (SCREEN SPACE)
  // ========================================================

  // 1. 2.5D Turret (Towering Pillar + Levitating Crystal Spire)
  renderTurret2D5(ctx, t, heroes) {
    const color = t.team === 'blue' ? '#38bdf8' : '#ef4444';

    if (!t.alive) {
      // Rubble debris
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // 1. Ground Shadow Ellipse
    renderHeroShadow2D5(ctx, 32, 1.2);

    // 2. Heavy Hexagonal Stone Base Plinth
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 26, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 3. 2.5D Vertical Stone Tower Shaft (Rising 55px into the air!)
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(-14, -50);
    ctx.lineTo(14, -50);
    ctx.lineTo(18, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stone Masonry Grooves & Gargoyle Brackets
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-16, -20);
    ctx.lineTo(16, -20);
    ctx.moveTo(-15, -35);
    ctx.lineTo(15, -35);
    ctx.stroke();

    // Team Energy Conduit in Center of Tower
    ctx.fillStyle = color;
    ctx.fillRect(-3, -45, 6, 38);

    // 4. Tower Top Platform
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.ellipse(0, -52, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Levitating Rotating Elemental Power Crystal Spire (Hovering 70px in 3D!)
    const crystalFloat = Math.sin(this.time * 3.5) * 5;
    ctx.save();
    ctx.translate(0, -72 + crystalFloat);
    ctx.rotate(this.time * 1.5);

    // Crystal Shard (Diamond)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(12, 0);
    ctx.lineTo(0, 20);
    ctx.lineTo(-12, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner bright core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Shield Plating Barrier (First 5 min)
    if (t.shieldPlating && t.shieldPlating > 0) {
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.ellipse(0, -32, 34, 45, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 7. Targeting Warning Laser (if targeting an enemy hero)
    if (t.target && t.target.isHero) {
      const targetScreen = this.worldToScreen(t.target.x, t.target.y);
      const turretScreen = this.worldToScreen(t.x, t.y, 70);
      ctx.save();
      ctx.strokeStyle = t.team === 'blue' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(239, 68, 68, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -72 + crystalFloat);
      ctx.lineTo((targetScreen.x - this.worldToScreen(t.x, t.y).x) / this.camera.zoom, (targetScreen.y - this.worldToScreen(t.x, t.y).y) / this.camera.zoom - 25);
      ctx.stroke();
      ctx.restore();
    }

    // 8. Overhead Health Bar
    this.renderHealthBar(ctx, 0, -100, 75, 7, t.hp, t.maxHp, color, `T${t.tier}`);
  }

  // 2. 2.5D Fortress Nexus Core
  renderCore2D5(ctx, core) {
    if (!core.alive) return;
    const color = core.team === 'blue' ? '#38bdf8' : '#ef4444';

    // 1. Ground Shadow
    renderHeroShadow2D5(ctx, 42, 1.2);

    // 2. Multi-tier Stepped Stone Dais
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 38, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(0, -8, 28, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Levitating Colossal Diamond Nexus Crystal (Hovering 80px high!)
    const crystalFloat = Math.sin(this.time * 2.5) * 6;
    ctx.save();
    ctx.translate(0, -82 + crystalFloat);
    ctx.rotate(this.time * 0.9);

    // Huge Diamond
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(26, 0);
    ctx.lineTo(0, 36);
    ctx.lineTo(-26, 0);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // Health Bar
    this.renderHealthBar(ctx, 0, -135, 130, 12, core.hp, core.maxHp, color, `${core.team.toUpperCase()} NEXUS`);
  }

  // 3. 2.5D Jungle Camp Monsters
  renderCamp2D5(ctx, c) {
    if (!c.alive) {
      const timerText = `${Math.ceil(c.respawnTimer)}s`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timerText, 0, -10);
      return;
    }

    renderHeroShadow2D5(ctx, c.radius, 1.1);

    // Upright Elemental Golem Body
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.ellipse(0, -c.radius, c.radius * 0.9, c.radius * 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Eyes
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(3, -c.radius - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();

    this.renderHealthBar(ctx, 0, -c.radius * 2 - 14, 60, 6, c.hp, c.maxHp, c.color, c.name);
  }

  // 4. 2.5D Cryoturtle Boss
  renderTurtle2D5(ctx, t) {
    renderHeroShadow2D5(ctx, t.radius * 1.1, 1.2);

    // Ice Dome Shell Carapace
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.ellipse(0, -t.radius * 0.7, t.radius, t.radius * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Multifaceted Crystal Frost Spikes (Protruding vertically)
    ctx.fillStyle = '#e0f2fe';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 12, -t.radius * 0.7);
      ctx.lineTo(i * 14, -t.radius * 1.3);
      ctx.lineTo(i * 12 + 6, -t.radius * 0.7);
      ctx.closePath();
      ctx.fill();
    }

    this.renderHealthBar(ctx, 0, -t.radius * 1.6 - 16, 95, 8, t.hp, t.maxHp, t.color, 'CRYOTURTLE');
  }

  // 5. 2.5D Sanctuary Lord & Marching Lord (Towering 85px Celestial Titan)
  renderLord2D5(ctx, l) {
    const isBlue = l.team === 'blue';
    const teamColor = l.team ? (isBlue ? '#38bdf8' : '#ef4444') : '#eab308';
    const wingFlap = Math.sin(this.time * 5) * 16;

    renderHeroShadow2D5(ctx, 36, 1.25);

    // Golden Feathered Wings (Flapping Dynamically high in 2.5D!)
    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2;
    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-8, -45);
    ctx.quadraticCurveTo(-45 - wingFlap, -80, -60 - wingFlap, -45);
    ctx.quadraticCurveTo(-35, -20, -8, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right Wing
    ctx.beginPath();
    ctx.moveTo(8, -45);
    ctx.quadraticCurveTo(45 + wingFlap, -80, 60 + wingFlap, -45);
    ctx.quadraticCurveTo(35, -20, 8, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Celestial Titan Armor Body
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(-18, -60, 36, 50, 6);
    ctx.fill();
    ctx.strokeStyle = teamColor;
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Sacred War Halberd (Held vertically in 2.5D)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(18, -75, 5, 70);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(20, -90);
    ctx.lineTo(34, -75);
    ctx.lineTo(20, -60);
    ctx.lineTo(6, -75);
    ctx.closePath();
    ctx.fill();

    // Divine Floating Halo above head
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, -78, 22, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    this.renderHealthBar(ctx, 0, -100, 120, 10, l.hp, l.maxHp, '#eab308', l.team ? 'MARCHING LORD' : 'SANCTUARY LORD');
  }

  // 6. 2.5D Minions (Upright Soldiers & Mages)
  renderMinion2D5(ctx, m) {
    const color = m.team === 'blue' ? '#38bdf8' : '#ef4444';
    const isSuper = m.type === 'super';
    const isSiege = m.type === 'siege';

    renderHeroShadow2D5(ctx, m.radius, 1.1);

    if (isSuper) {
      // Super Iron Golem
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-12, -32, 24, 28, 4);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glowing Core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, -18, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (isSiege) {
      // Siege Cannon Wagon
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-10, -16, 20, 12);
      ctx.fillStyle = '#334155'; // Cannon barrel angled up
      ctx.fillRect(2, -22, 14, 7);
    } else if (m.type === 'ranged') {
      // Hooded Mage Minion with Staff Orb
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-6, -2);
      ctx.lineTo(-4, -18);
      ctx.lineTo(4, -18);
      ctx.lineTo(6, -2);
      ctx.closePath();
      ctx.fill();

      // Staff Orb
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(8, -20, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Melee Warrior Minion with Helmet & Shield
      ctx.fillStyle = color;
      ctx.fillRect(-5, -16, 10, 14);
      ctx.fillStyle = '#cbd5e1'; // Shield
      ctx.fillRect(3, -15, 4, 10);
      ctx.fillStyle = '#64748b'; // Helmet
      ctx.beginPath();
      ctx.arc(0, -20, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    this.renderHealthBar(ctx, 0, -m.radius * 2 - 10, isSuper ? 48 : 34, isSuper ? 5 : 4, m.hp, m.maxHp, color);
  }

  // 7. 2.5D Volumetric Bush Canopy (Floating above characters with inside-vision transparency)
  renderBushCanopy2D5(ctx, b, playerHero) {
    const floatSway = Math.sin(this.time * 2.5 + b.x) * 2;
    ctx.save();
    ctx.translate(0, -18 + floatSway);

    // If player is inside this bush, make canopy semi-transparent so character is clearly visible
    const isPlayerInside = playerHero && Math.hypot(playerHero.x - b.x, playerHero.y - b.y) <= b.radius * 1.05;
    ctx.globalAlpha = isPlayerInside ? 0.58 : 0.96;

    // Deep lush canopy body
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.arc(0, 0, b.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Vibrant emerald leaf clusters
    ctx.fillStyle = '#059669';
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const lx = Math.cos(a) * (b.radius * 0.65);
      const ly = Math.sin(a) * (b.radius * 0.65);
      ctx.beginPath();
      ctx.arc(lx, ly, b.radius * 0.42, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top leaf highlights
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, -4, b.radius * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // Glowing firefly
    const flyX = Math.sin(this.time * 2 + b.x) * (b.radius * 0.4);
    const flyY = Math.cos(this.time * 2 + b.y) * (b.radius * 0.4);
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.arc(flyX, flyY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // 8. 2.5D Upright Hero Rendering & Overhead HUD
  renderHero2D5(ctx, h, playerHero) {
    ctx.save();
    if (h.isConcealed) {
      ctx.globalAlpha = 0.55;
    }

    const teamColor = h.team === 'blue' ? '#38bdf8' : '#ef4444';

    // Buff Auras on Ground
    if (h.hasRedBuff) {
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, h.radius + 6, (h.radius + 6) * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (h.hasBlueBuff) {
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, h.radius + 10, (h.radius + 10) * 0.48, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // River water wake ripples
    if (Math.abs(h.x + h.y - 3200) < 220) {
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.8;
      const rippleR = 14 + Math.sin(this.time * 6 + h.x) * 4;
      ctx.beginPath();
      ctx.ellipse(0, 4, rippleR, rippleR * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stealth eye indicator
    if (h.isConcealed && (h.isPlayer || h.team === playerHero.team)) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -60, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(0, -60, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render 2.5D Upright Character Model
    this.renderHeroCharacterModel2D5(ctx, h);

    // Overhead HUD
    this.renderHeroOverheadHUD2D5(ctx, h);

    ctx.restore();
  }

  renderHeroCharacterModel2D5(ctx, h) {
    const isMoving = h.isMoving || Math.abs(h.walkCycle || 0) > 0.05;
    const isAttacking = (h.attackAnimTimer || 0) > 0;
    const attackProgress = Math.max(0, Math.min(1, 1 - ((h.attackAnimTimer || 0) / 0.28)));
    const isCasting = (h.castAnimTimer || 0) > 0;
    const maxCastTime = (h.lastCastSkill === 3) ? 0.45 : 0.32;
    const castProgress = Math.max(0, Math.min(1, 1 - ((h.castAnimTimer || 0) / maxCastTime)));

    const anim = {
      time: this.time,
      walkCycle: h.walkCycle || 0,
      isMoving,
      isAttacking,
      attackProgress,
      isCasting,
      castProgress,
      lastCastSkill: h.lastCastSkill || 1,
      isHit: (h.hitFlashTimer || 0) > 0
    };

    switch (h.heroId) {
      case 'layla':
        renderLayla2D5(ctx, h, anim);
        break;
      case 'tigreal':
        renderTigreal2D5(ctx, h, anim);
        break;
      case 'eudora':
        renderEudora2D5(ctx, h, anim);
        break;
      case 'alucard':
        renderAlucard2D5(ctx, h, anim);
        break;
      case 'chou':
        renderChou2D5(ctx, h, anim);
        break;
      case 'miya':
        renderMiya2D5(ctx, h, anim);
        break;
      case 'grock':
        renderGrock2D5(ctx, h, anim);
        break;
      case 'balmond':
        renderBalmond2D5(ctx, h, anim);
        break;
      case 'gusion':
        renderGusion2D5(ctx, h, anim);
        break;
      case 'kagura':
        renderKagura2D5(ctx, h, anim);
        break;
      default:
        renderLayla2D5(ctx, h, anim);
    }
  }

  renderHeroOverheadHUD2D5(ctx, h) {
    const barW = 60;
    const barH = 6;
    const sx = -barW / 2;
    const sy = -56; // Floating cleanly above upright head

    // HP Bar background
    ctx.fillStyle = '#05070f';
    ctx.fillRect(sx, sy, barW, barH);

    // HP Fill
    const hpColor = h.isPlayer ? '#22c55e' : (h.team === 'blue' ? '#38bdf8' : '#ef4444');
    const hpRatio = Math.max(0, Math.min(1, h.hp / h.maxHp));
    ctx.fillStyle = hpColor;
    ctx.fillRect(sx, sy, barW * hpRatio, barH);

    // Shield Bar
    if (h.shield && h.shield > 0) {
      const shieldRatio = Math.min(1, h.shield / h.maxHp);
      ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
      ctx.fillRect(sx, sy, barW * shieldRatio, barH);
    }

    // Border
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, sy, barW, barH);

    // 1000 HP Segment notches
    const totalSegments = Math.floor(h.maxHp / 1000);
    if (totalSegments > 0) {
      ctx.fillStyle = '#05070f';
      for (let i = 1; i <= totalSegments; i++) {
        const nx = sx + (barW * (i * 1000 / h.maxHp));
        if (nx < sx + barW) {
          ctx.fillRect(nx, sy, 1.5, barH);
        }
      }
    }

    // Mana Bar
    if (h.maxMana > 0) {
      const manaH = 3;
      ctx.fillStyle = '#05070f';
      ctx.fillRect(sx, sy + barH + 1, barW, manaH);
      const manaRatio = Math.max(0, Math.min(1, h.mana / h.maxMana));
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(sx, sy + barH + 1, barW * manaRatio, manaH);
    }

    // Level Badge
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(sx - 7, sy + barH / 2, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = '900 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(h.level, sx - 7, sy + barH / 2);

    // Name Plate
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(h.name, 0, sy - 5);

    // Status CC Indicator
    if (h.recalling) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 8px sans-serif';
      ctx.fillText('RECALLING...', 0, sy - 15);
    } else if (h.stunTimer > 0) {
      ctx.fillStyle = '#ef4444';
      ctx.font = '900 8px sans-serif';
      ctx.fillText('STUNNED', 0, sy - 15);
    } else if (h.slowTimer > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('SLOWED', 0, sy - 15);
    }
  }

  renderHealthBar(ctx, cx, cy, width, height, currentHp, maxHp, color, label = null) {
    const sx = cx - width / 2;
    ctx.fillStyle = '#05070f';
    ctx.fillRect(sx, cy, width, height);

    const ratio = Math.max(0, Math.min(1, currentHp / maxHp));
    ctx.fillStyle = color;
    ctx.fillRect(sx, cy, width * ratio, height);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(sx, cy, width, height);

    if (label) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, cx, cy - 4);
    }
  }

  // --- 2.5D Elevated Projectiles with Drop Shadow ---

  renderProjectiles2D5(ctx, engine) {
    // Minion & Hero ranged attack projectiles
    for (const p of engine.minionManager.projectiles) {
      const isHeroProj = p.source && p.source.isHero;
      const elevation = isHeroProj ? 24 : 20;
      const shadowPos = this.worldToScreen(p.x, p.y, 0);
      const projPos = this.worldToScreen(p.x, p.y, elevation);

      // Ground Drop Shadow in 2.5D
      ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
      ctx.beginPath();
      ctx.ellipse(shadowPos.x, shadowPos.y, isHeroProj ? 6 : 4, (isHeroProj ? 6 : 4) * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Elevated Projectile with Custom Hero Styling
      if (isHeroProj) {
        const heroId = p.source.heroId;
        if (heroId === 'layla') {
          // Cyber-laser slug
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(projPos.x, projPos.y, 6.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(projPos.x, projPos.y, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (heroId === 'miya') {
          // Lunar arrow
          ctx.fillStyle = '#e0e7ff';
          ctx.beginPath();
          ctx.arc(projPos.x, projPos.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (heroId === 'eudora') {
          // Violet spark
          ctx.fillStyle = '#c084fc';
          ctx.beginPath();
          ctx.arc(projPos.x, projPos.y, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (heroId === 'kagura') {
          // Pink talisman
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.arc(projPos.x, projPos.y, 5.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Radiant golden energy
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(projPos.x, projPos.y, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Standard minion orb
        ctx.fillStyle = p.type === 'magic' ? '#a855f7' : '#fbbf24';
        ctx.beginPath();
        ctx.arc(projPos.x, projPos.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Turret heavy energy projectiles
    for (const p of engine.turretManager.projectiles) {
      const shadowPos = this.worldToScreen(p.x, p.y, 0);
      const projPos = this.worldToScreen(p.x, p.y, 28);

      // Shadow
      ctx.fillStyle = 'rgba(2, 6, 23, 0.5)';
      ctx.beginPath();
      ctx.ellipse(shadowPos.x, shadowPos.y, 8, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fireball Core
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(projPos.x, projPos.y, 8.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(projPos.x, projPos.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- 2.5D Aiming Indicators ---

  renderAimingReticle2D5(ctx, hero, aim) {
    const mx = aim.targetX;
    const my = aim.targetY;
    const range = aim.range;
    const type = aim.type;

    // Range boundary circle on ground plane (renders as true 2.5D ellipse)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(hero.x, hero.y, Math.max(1, range || 100), 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    if (type === 'line' || type === 'beam') {
      const angle = Math.atan2(my - hero.y, mx - hero.x);
      const ex = hero.x + Math.cos(angle) * range;
      const ey = hero.y + Math.sin(angle) * range;

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(hero.x, hero.y);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      // Sharp directional arrowhead at tip
      const arrowLen = 18;
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - Math.cos(angle - 0.4) * arrowLen, ey - Math.sin(angle - 0.4) * arrowLen);
      ctx.lineTo(ex - Math.cos(angle + 0.4) * arrowLen, ey - Math.sin(angle + 0.4) * arrowLen);
      ctx.closePath();
      ctx.fill();
    } else if (type === 'aoe' || type === 'target_aoe') {
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(mx, my, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // --- Tactical Minimap Overlay ---

  renderMinimap(ctx, engine) {
    const size = 180;
    const padding = 16;
    const mx = this.camera.width - size - padding;
    const my = padding;
    const map = engine.map;

    ctx.save();
    // Background Frame
    ctx.fillStyle = 'rgba(11, 15, 25, 0.92)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    ctx.lineWidth = 2;
    ctx.fillRect(mx, my, size, size);
    ctx.strokeRect(mx, my, size, size);

    const scale = size / map.width;

    // Lanes lines
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.7)';
    ctx.lineWidth = 2.5;
    ['top', 'mid', 'bot'].forEach(l => {
      const p = map.lanePaths[l];
      ctx.beginPath();
      p.forEach((pt, idx) => {
        const px = mx + pt.x * scale;
        const py = my + pt.y * scale;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    });

    // Turret Dots
    for (const t of map.turrets) {
      if (!t.alive) continue;
      ctx.fillStyle = t.team === 'blue' ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(mx + t.x * scale, my + t.y * scale, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boss Icons
    if (engine.jungleManager.turtleAlive && engine.jungleManager.turtleEntity) {
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(mx + 1250 * scale, my + 1100 * scale, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    if (engine.jungleManager.lordAlive && engine.jungleManager.lordEntity) {
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(mx + 1950 * scale, my + 2100 * scale, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hero Dots
    for (const h of engine.heroes) {
      if (!h.alive) continue;
      if (h.isConcealed && h !== engine.playerHero && h.team !== engine.playerHero.team) continue;

      const hx = mx + h.x * scale;
      const hy = my + h.y * scale;

      ctx.fillStyle = h.isPlayer ? '#22c55e' : (h.team === 'blue' ? '#38bdf8' : '#ef4444');
      ctx.beginPath();
      ctx.arc(hx, hy, h.isPlayer ? 5.5 : 4, 0, Math.PI * 2);
      ctx.fill();

      if (h.isPlayer) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Camera Viewport Box on Minimap
    const camW = (this.camera.width / this.camera.zoom) * scale;
    const camH = (this.camera.height / (this.camera.zoom * this.pitch)) * scale;
    const camX = mx + (this.camera.x * scale) - camW / 2;
    const camY = my + (this.camera.y * scale) - camH / 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(camX, camY, camW, camH);

    // Tactical Ping Ripple
    if (engine.activePlayerPing) {
      const ping = engine.activePlayerPing;
      const age = (performance.now() - ping.time) / 1000;
      if (age < 5) {
        const px = mx + ping.x * scale;
        const py = my + ping.y * scale;
        const pulseR = 4 + (age * 12) % 18;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
