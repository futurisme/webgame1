/**
 * 2D Interactive Corporate Headquarters Canvas Engine
 * High-Precision Architectural Floor Plan • Ultra-Crisp HiDPI/Retina Vector Rendering
 * Detailed Human Character Models • Autonomous AI Personnel Routines • Zero Blur • 60 FPS
 * Conforms to 2026-10-24 Pure Vanilla JS & Clean Architectural Standards.
 */

const THEME_PALETTES = {
  slate: {
    bg: '#070D18',
    grid: 'rgba(56, 189, 248, 0.06)',
    gridCross: 'rgba(56, 189, 248, 0.15)',
    border: 'rgba(56, 189, 248, 0.35)',
    roomBg: '#0B1324',
    accent: '#38BDF8',
    accentGlow: 'rgba(56, 189, 248, 0.25)',
  },
  cyan: {
    bg: '#020C18',
    grid: 'rgba(0, 229, 255, 0.07)',
    gridCross: 'rgba(0, 229, 255, 0.18)',
    border: 'rgba(0, 229, 255, 0.40)',
    roomBg: '#051528',
    accent: '#00E5FF',
    accentGlow: 'rgba(0, 229, 255, 0.25)',
  },
  emerald: {
    bg: '#02120A',
    grid: 'rgba(16, 185, 129, 0.07)',
    gridCross: 'rgba(16, 185, 129, 0.18)',
    border: 'rgba(16, 185, 129, 0.40)',
    roomBg: '#051D12',
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
  },
  amber: {
    bg: '#120B02',
    grid: 'rgba(245, 158, 11, 0.07)',
    gridCross: 'rgba(245, 158, 11, 0.18)',
    border: 'rgba(245, 158, 11, 0.40)',
    roomBg: '#1C1204',
    accent: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
  },
  violet: {
    bg: '#0B0316',
    grid: 'rgba(168, 85, 247, 0.07)',
    gridCross: 'rgba(168, 85, 247, 0.18)',
    border: 'rgba(168, 85, 247, 0.40)',
    roomBg: '#140726',
    accent: '#A855F7',
    accentGlow: 'rgba(168, 85, 247, 0.25)',
  },
  crimson: {
    bg: '#140307',
    grid: 'rgba(244, 63, 94, 0.07)',
    gridCross: 'rgba(244, 63, 94, 0.18)',
    border: 'rgba(244, 63, 94, 0.40)',
    roomBg: '#20060E',
    accent: '#F43F5E',
    accentGlow: 'rgba(244, 63, 94, 0.25)',
  },
};

export class OfficeCanvasEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {Array} initialWorkers
   * @param {Function} onRoomClick
   * @param {Function} onWorkerClick
   * @param {Object} options
   */
  constructor(canvas, initialWorkers = [], onRoomClick = null, onWorkerClick = null, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    this.onRoomClick = onRoomClick;
    this.onWorkerClick = onWorkerClick;
    this.theme = options.theme || localStorage.getItem('corp_tycoon_theme') || 'slate';
    this.lang = options.lang || localStorage.getItem('corp_tycoon_lang') || 'id';

    // Virtual logical blueprint dimensions (16:9-adjacent ratio, 640x550)
    this.V_WIDTH = 640;
    this.V_HEIGHT = 550;

    this.animId = null;
    this.isRunning = false;
    this.mousePos = { x: 0, y: 0 };
    this.hoveredRoomId = null;
    this.hoveredWorker = null;
    this.startTime = performance.now();
    this.lastFrameTime = performance.now();
    this.dpr = 1;

    // Steam particles for coffee machine
    this.steamParticles = [];
    for (let i = 0; i < 12; i++) {
      this.steamParticles.push({
        x: 65 + Math.random() * 8,
        y: 472 + Math.random() * 8,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.4 - Math.random() * 0.4,
        radius: 1 + Math.random() * 2,
        alpha: Math.random(),
      });
    }

    // Initialize detailed workers with facing angles, limb cycles, and attire
    this.workers = this.initDetailedWorkers(initialWorkers);

    this.initRooms();

    // Event listeners
    this.onMouseMove = this.handleMouseMove.bind(this);
    this.onClick = this.handleClick.bind(this);
    this.onMouseLeave = this.handleMouseLeave.bind(this);

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);

    // Dynamic HiDPI Resize Observer to eliminate any blur permanently
    this.setupResizeObserver();

    this.resize();
    this.start();
  }

  initDetailedWorkers(initialWorkers) {
    const raw = JSON.parse(JSON.stringify(initialWorkers));
    const personaDetails = {
      w_1: {
        hairColor: '#1E293B',
        skinColor: '#F6D8AE',
        attireColor: '#0E7490', // Cyan dark architect hoodie
        attireAccent: '#06B6D4',
        hasHeadset: true,
        hairStyle: 'shortFade',
        initialAngle: -Math.PI / 2, // Facing north towards desk monitor
      },
      w_2: {
        hairColor: '#0F172A',
        skinColor: '#FDE047',
        attireColor: '#047857', // Emerald quant suit
        attireAccent: '#10B981',
        hasGlasses: true,
        hairStyle: 'sleekBun',
        initialAngle: -Math.PI / 2,
      },
      w_3: {
        hairColor: '#3B2F2F',
        skinColor: '#E2B887',
        attireColor: '#7E22CE', // Violet marketing blazer
        attireAccent: '#A855F7',
        hasTablet: true,
        hairStyle: 'stylishCrop',
        initialAngle: -Math.PI / 2,
      },
      w_4: {
        hairColor: '#2D3748',
        skinColor: '#F5D0A9',
        attireColor: '#1D4ED8', // Royal blue operations attire
        attireAccent: '#3B82F6',
        hasBadge: true,
        hairStyle: 'hijabOrStyled',
        initialAngle: 0,
      },
    };

    return raw.map((w, idx) => {
      const p = personaDetails[w.id] || {
        hairColor: '#1E293B',
        skinColor: '#F6D8AE',
        attireColor: '#334155',
        attireAccent: '#64748B',
        initialAngle: 0,
      };

      const defaultDesks = {
        w_1: { deskX: 375, deskY: 105 },
        w_2: { deskX: 95, deskY: 295 },
        w_3: { deskX: 95, deskY: 365 },
        w_4: { deskX: 375, deskY: 170 },
      };
      const d = defaultDesks[w.id];
      const deskX = d ? d.deskX : (w.deskX || 100);
      const deskY = d ? d.deskY : (w.deskY || 100);

      return {
        ...w,
        deskX,
        deskY,
        x: w.state === 'working' ? deskX : (w.x || deskX),
        y: w.state === 'working' ? deskY : (w.y || deskY),
        targetX: w.state === 'working' ? deskX : (w.targetX || deskX),
        targetY: w.state === 'working' ? deskY : (w.targetY || deskY),
        angle: p.initialAngle,
        targetAngle: p.initialAngle,
        walkCycle: Math.random() * Math.PI * 2,
        isMoving: false,
        hairColor: p.hairColor,
        skinColor: p.skinColor,
        attireColor: p.attireColor,
        attireAccent: p.attireAccent,
        hasHeadset: !!p.hasHeadset,
        hasGlasses: !!p.hasGlasses,
        hasTablet: !!p.hasTablet,
        hasBadge: !!p.hasBadge,
        hairStyle: p.hairStyle || 'shortFade',
        coffeeSteaming: false,
      };
    });
  }

  setupResizeObserver() {
    this.onWindowResize = () => this.resize();
    window.addEventListener('resize', this.onWindowResize);

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
      });
      const container = this.canvas.parentElement || this.canvas;
      this.resizeObserver.observe(container);
    }
  }

  setThemeAndLang(theme, lang) {
    this.theme = theme;
    this.lang = lang;
    this.initRooms();
  }

  initRooms() {
    const isEn = this.lang === 'en';
    const c = THEME_PALETTES[this.theme] || THEME_PALETTES.slate;
    this.themeColors = c;

    this.rooms = [
      {
        id: 'ceo_suite',
        name: 'CEO Executive Suite',
        tag: isEn ? 'EXECUTIVE COMMAND' : 'KOMANDO EKSEKUTIF',
        dimension: '145 m²',
        department: 'executive',
        x: 20,
        y: 20,
        width: 250,
        height: 185,
        color: this.theme === 'slate' ? '#0D1527' : c.roomBg,
        accentColor: '#F59E0B',
        accentGlow: 'rgba(245, 158, 11, 0.3)',
        description: isEn ? 'Executive governance, strategic alliances, and corporate leadership.' : 'Pusat komando strategis dewan eksekutif dan persetujuan kebijakan korporat.',
      },
      {
        id: 'eng_lab',
        name: 'R&D & Server Cluster',
        tag: isEn ? 'SYSTEMS ARCHITECTURE' : 'REKAYASA SISTEM',
        dimension: '180 m²',
        department: 'engineering',
        x: 285,
        y: 20,
        width: 335,
        height: 185,
        color: this.theme === 'slate' ? '#091522' : c.roomBg,
        accentColor: c.accent,
        accentGlow: c.accentGlow,
        description: isEn ? 'Liquid-cooled server infrastructure and core software engineering.' : 'Gudang server berpendingin cair dan workstation arsitek perangkat lunak.',
      },
      {
        id: 'trading_floor',
        name: 'Trading & Quant Floor',
        tag: isEn ? 'TREASURY & MARKETS' : 'TREASURY & PASAR',
        dimension: '160 m²',
        department: 'finance',
        x: 20,
        y: 220,
        width: 280,
        height: 200,
        color: this.theme === 'slate' ? '#091917' : c.roomBg,
        accentColor: '#10B981',
        accentGlow: 'rgba(16, 185, 129, 0.3)',
        description: isEn ? 'Quantitative Bloomberg terminals and capital market portfolio analytics.' : 'Terminal Bloomberg kuantitatif dan analisis portofolio pasar modal.',
      },
      {
        id: 'boardroom',
        name: 'Boardroom & Governance',
        tag: isEn ? 'BOARD & SHAREHOLDERS' : 'RAPAT PEMEGANG SAHAM',
        dimension: '175 m²',
        department: 'operations',
        x: 315,
        y: 220,
        width: 305,
        height: 200,
        color: this.theme === 'slate' ? '#120F26' : c.roomBg,
        accentColor: '#8B5CF6',
        accentGlow: 'rgba(139, 92, 246, 0.3)',
        description: isEn ? 'Roundtable for shareholder equity, term sheet negotiations, and funding rounds.' : 'Meja bundar pemegang saham untuk negosiasi term sheet dan putaran pendanaan.',
      },
      {
        id: 'breakroom',
        name: 'Espresso Bar & Lounge',
        tag: isEn ? 'TEAM WELLBEING' : 'KESEJAHTERAAN TIM',
        dimension: '220 m²',
        department: 'general',
        x: 20,
        y: 435,
        width: 600,
        height: 95,
        color: this.theme === 'slate' ? '#14141A' : c.roomBg,
        accentColor: '#E2E8F0',
        accentGlow: 'rgba(226, 232, 240, 0.25)',
        description: isEn ? 'Premium espresso bar for corporate morale and team stamina.' : 'Bar kopi premium untuk memulihkan stamina dan moral seluruh karyawan korporat.',
      },
    ];
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const cssWidth = Math.floor(rect.width) || 640;
    const cssHeight = Math.floor(rect.height) || 550;

    if (cssWidth === 0 || cssHeight === 0) return;

    // Retina / HiDPI crisp factor: 2x on standard screens, up to 3x on high-density 4k displays
    const rawDpr = window.devicePixelRatio || 1;
    this.dpr = Math.min(Math.max(rawDpr, 2), 3);

    this.canvas.width = Math.round(cssWidth * this.dpr);
    this.canvas.height = Math.round(cssHeight * this.dpr);

    // Maintain crisp vector styling
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }
  }

  updateWorkers(newWorkers) {
    if (!newWorkers) return;
    for (const nw of newWorkers) {
      const existing = this.workers.find(w => w.id === nw.id);
      if (existing) {
        existing.morale = nw.morale;
        existing.speechBubble = nw.speechBubble;
        existing.speechTimer = nw.speechTimer;
        existing.focusTask = nw.focusTask;
      }
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Direct mapping to virtual coordinate space (640 x 550)
    const scaleX = this.V_WIDTH / rect.width;
    const scaleY = this.V_HEIGHT / rect.height;
    this.mousePos.x = (e.clientX - rect.left) * scaleX;
    this.mousePos.y = (e.clientY - rect.top) * scaleY;

    // Check hovered worker first (interaction radius: 18px)
    let foundWorker = null;
    for (const w of this.workers) {
      const dist = Math.hypot(this.mousePos.x - w.x, this.mousePos.y - w.y);
      if (dist <= 18) {
        foundWorker = w;
        break;
      }
    }
    this.hoveredWorker = foundWorker;

    if (foundWorker) {
      this.hoveredRoomId = null;
      this.canvas.style.cursor = 'pointer';
      return;
    }

    // Check hovered room
    let foundRoom = null;
    for (const r of this.rooms) {
      if (
        this.mousePos.x >= r.x &&
        this.mousePos.x <= r.x + r.width &&
        this.mousePos.y >= r.y &&
        this.mousePos.y <= r.y + r.height
      ) {
        foundRoom = r.id;
        break;
      }
    }
    this.hoveredRoomId = foundRoom;
    this.canvas.style.cursor = foundRoom ? 'pointer' : 'default';
  }

  handleMouseLeave() {
    this.hoveredRoomId = null;
    this.hoveredWorker = null;
    this.canvas.style.cursor = 'default';
  }

  handleClick() {
    if (this.hoveredWorker && this.onWorkerClick) {
      this.onWorkerClick(this.hoveredWorker);
      return;
    }
    if (this.hoveredRoomId && this.onRoomClick) {
      this.onRoomClick(this.hoveredRoomId);
    }
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastFrameTime = performance.now();

    const loop = (timestamp) => {
      if (!this.isRunning) return;

      const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = timestamp;

      this.updateSimulation(dt, timestamp);
      this.render(timestamp);

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  destroy() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.onMouseMove);
      this.canvas.removeEventListener('click', this.onClick);
      this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    }
    if (this.onWindowResize) {
      window.removeEventListener('resize', this.onWindowResize);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  updateSimulation(dt, now) {
    // Update steam particles in breakroom
    for (const p of this.steamParticles) {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.015;
      if (p.alpha <= 0 || p.y < 450) {
        p.x = 65 + Math.random() * 8;
        p.y = 472 + Math.random() * 4;
        p.vx = (Math.random() - 0.5) * 0.25;
        p.vy = -0.35 - Math.random() * 0.35;
        p.alpha = 0.7 + Math.random() * 0.3;
      }
    }

    // Workers simulation
    for (const w of this.workers) {
      if (w.speechTimer > 0) {
        w.speechTimer -= dt;
        if (w.speechTimer <= 0) {
          w.speechBubble = '';
        }
      }

      // Natural AI movement trigger
      if (Math.random() < 0.004 && w.state === 'working') {
        const rand = Math.random();
        if (rand < 0.38) {
          // Walk to Espresso Bar
          w.targetX = 80 + Math.random() * 460;
          w.targetY = 470 + Math.random() * 30;
          w.state = 'coffee';
          w.coffeeSteaming = true;
          w.speechBubble = this.lang === 'en' ? 'Brewing fresh espresso...' : 'Ambil espresso segar...';
          w.speechTimer = 4.0;
        } else if (rand < 0.72) {
          // Walk to Boardroom table
          w.targetX = 370 + Math.random() * 190;
          w.targetY = 280 + Math.random() * 80;
          w.state = 'meeting';
          w.coffeeSteaming = false;
          w.speechBubble = this.lang === 'en' ? 'Synchronizing team directives...' : 'Sinkronisasi strategi tim...';
          w.speechTimer = 4.0;
        } else {
          // Server cluster check
          w.targetX = 540 + Math.random() * 45;
          w.targetY = 70 + Math.random() * 80;
          w.state = 'server';
          w.coffeeSteaming = false;
          w.speechBubble = this.lang === 'en' ? 'Verifying cluster uptime...' : 'Audit latensi server...';
          w.speechTimer = 3.5;
        }
      } else if (Math.random() < 0.008 && w.state !== 'working') {
        // Return to designated work desk
        w.targetX = w.deskX;
        w.targetY = w.deskY;
        w.state = 'working';
      }

      // Smooth navigation towards target
      const dx = w.targetX - w.x;
      const dy = w.targetY - w.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 2.0) {
        w.isMoving = true;
        const speed = 75; // pixels per second
        w.x += (dx / dist) * Math.min(speed * dt, dist);
        w.y += (dy / dist) * Math.min(speed * dt, dist);

        // Turn towards movement direction smoothly
        w.targetAngle = Math.atan2(dy, dx);
        let diff = w.targetAngle - w.angle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        w.angle += diff * Math.min(10 * dt, 1);

        // Animate walk cycle
        w.walkCycle += dt * 14;
      } else {
        w.isMoving = false;
        // When settled at desk, rotate to face desk northwards
        if (w.state === 'working') {
          let diff = -Math.PI / 2 - w.angle;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          w.angle += diff * Math.min(6 * dt, 1);
        }
      }
    }
  }

  // ==========================================
  // MASTER RENDER LOOP (NATIVE HIGH-DEF VECTOR)
  // Zero pixelated bitmaps: 100% vector drawn at full buffer resolution
  // ==========================================
  render(now) {
    const ctx = this.ctx;
    if (!ctx) return;

    const timeSec = (now - this.startTime) / 1000;
    const c = this.themeColors || THEME_PALETTES.slate;

    // Save and clear physical buffer
    ctx.save();
    ctx.fillStyle = c.bg;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Scale canvas context from virtual (640x550) to physical buffer (e.g. 1920x1650)
    const scaleX = this.canvas.width / this.V_WIDTH;
    const scaleY = this.canvas.height / this.V_HEIGHT;
    ctx.scale(scaleX, scaleY);

    // 1. Draw Architectural Floor & Tactical Blueprint Grid
    this.drawBlueprintGrid(ctx, c);

    // 2. Draw Rooms & Structures
    for (const r of this.rooms) {
      const isHovered = this.hoveredRoomId === r.id;
      this.drawRoomStructure(ctx, r, isHovered, c);
    }

    // 3. Draw Room Furniture & High-Precision Fixtures
    this.drawCeoSuiteFixtures(ctx, this.rooms[0], timeSec);
    this.drawRndLabFixtures(ctx, this.rooms[1], timeSec);
    this.drawTradingFloorFixtures(ctx, this.rooms[2], timeSec);
    this.drawBoardroomFixtures(ctx, this.rooms[3], timeSec);
    this.drawBreakroomFixtures(ctx, this.rooms[4], timeSec);

    // 4. Draw Detailed Animated Human Character Models
    for (const w of this.workers) {
      const isHovered = this.hoveredWorker && this.hoveredWorker.id === w.id;
      this.drawDetailedHuman(ctx, w, isHovered, timeSec, c);
    }

    // 5. Draw Speech/Thought Bubbles on top layer
    for (const w of this.workers) {
      if (w.speechBubble && w.speechTimer > 0) {
        this.drawSpeechBubble(ctx, w.speechBubble, w.x, w.y - 20, c);
      }
    }

    // 6. Draw Detailed Hover Tooltip if hovering a worker
    if (this.hoveredWorker) {
      this.drawWorkerHoverCard(ctx, this.hoveredWorker, c);
    }

    ctx.restore();
  }

  // ==========================================
  // ARCHITECTURAL BLUEPRINT GRID
  // ==========================================
  drawBlueprintGrid(ctx, c) {
    ctx.strokeStyle = c.grid;
    ctx.lineWidth = 1;

    // Grid lines (every 20px)
    for (let x = 0; x <= this.V_WIDTH; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.V_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= this.V_HEIGHT; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.V_WIDTH, y);
      ctx.stroke();
    }

    // Tactical crosshairs at major nodes (every 80px)
    ctx.strokeStyle = c.gridCross;
    ctx.lineWidth = 1;
    const crossSize = 3;
    for (let x = 40; x < this.V_WIDTH; x += 80) {
      for (let y = 40; y < this.V_HEIGHT; y += 80) {
        ctx.beginPath();
        ctx.moveTo(x - crossSize, y);
        ctx.lineTo(x + crossSize, y);
        ctx.moveTo(x, y - crossSize);
        ctx.lineTo(x, y + crossSize);
        ctx.stroke();
      }
    }
  }

  // ==========================================
  // ROOM STRUCTURE & BORDERS
  // ==========================================
  drawRoomStructure(ctx, r, isHovered, c) {
    // Room Base Fill
    ctx.fillStyle = r.color;
    ctx.fillRect(r.x, r.y, r.width, r.height);

    // Subtle inner ambient shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x + 1, r.y + 1, r.width - 2, r.height - 2);

    // Wall Perimeter Outline
    ctx.strokeStyle = isHovered ? r.accentColor : c.border;
    ctx.lineWidth = isHovered ? 2.2 : 1.5;
    ctx.strokeRect(r.x, r.y, r.width, r.height);

    if (isHovered) {
      ctx.strokeStyle = r.accentGlow;
      ctx.lineWidth = 6;
      ctx.strokeRect(r.x - 2, r.y - 2, r.width + 4, r.height + 4);
    }

    // Room Header Bar
    ctx.fillStyle = 'rgba(11, 19, 36, 0.88)';
    ctx.fillRect(r.x, r.y, r.width, 24);

    // Header Bottom Divider
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y + 24);
    ctx.lineTo(r.x + r.width, r.y + 24);
    ctx.stroke();

    // Accent Tag Bar (Left)
    ctx.fillStyle = r.accentColor;
    ctx.fillRect(r.x, r.y, 4, 24);

    // Room Title (Crisp native font rendering)
    ctx.font = '700 11px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(r.name, r.x + 12, r.y + 16);

    // Dimension / Tag Label
    ctx.font = '600 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = r.accentColor;
    ctx.textAlign = 'right';
    ctx.fillText(`${r.tag} · ${r.dimension}`, r.x + r.width - 10, r.y + 16);
    ctx.textAlign = 'left';
  }

  // ==========================================
  // ROOM FIXTURE 1: CEO EXECUTIVE SUITE
  // ==========================================
  drawCeoSuiteFixtures(ctx, r, timeSec) {
    // Designer Parquet Inlay Area
    ctx.fillStyle = 'rgba(245, 158, 11, 0.03)';
    ctx.fillRect(r.x + 40, r.y + 50, 170, 110);
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.lineWidth = 1;
    ctx.strokeRect(r.x + 40, r.y + 50, 170, 110);

    // Executive Mahogany Desk with Glass Top
    const deskX = r.x + 60;
    const deskY = r.y + 75;
    const deskW = 130;
    const deskH = 48;

    // Desk shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(deskX + 3, deskY + 3, deskW, deskH);

    // Desk wood grain base
    ctx.fillStyle = '#3E2723';
    ctx.fillRect(deskX, deskY, deskW, deskH);
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(deskX, deskY, deskW, deskH);

    // Executive Desk Leather Mat
    ctx.fillStyle = '#1A1817';
    ctx.fillRect(deskX + 35, deskY + 10, 60, 28);
    ctx.strokeStyle = '#8D6E63';
    ctx.lineWidth = 1;
    ctx.strokeRect(deskX + 35, deskY + 10, 60, 28);

    // Curved Ultra-Wide Monitor on Desk
    ctx.fillStyle = '#0F172A';
    ctx.beginPath();
    ctx.roundRect(deskX + 42, deskY + 12, 46, 7, 2);
    ctx.fill();
    // Glowing Terminal Screen
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(deskX + 44, deskY + 13, 42, 4);

    // Brass Desk Task Lamp with ambient light cone
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(deskX + 18, deskY + 24, 5, 0, Math.PI * 2);
    ctx.fill();

    // Soft warm radial glow from lamp
    const lampGlow = ctx.createRadialGradient(deskX + 18, deskY + 24, 2, deskX + 18, deskY + 24, 32);
    lampGlow.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    lampGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = lampGlow;
    ctx.beginPath();
    ctx.arc(deskX + 18, deskY + 24, 32, 0, Math.PI * 2);
    ctx.fill();

    // High-Back Executive Leather Chair
    ctx.fillStyle = '#181E29';
    ctx.beginPath();
    ctx.ellipse(deskX + 65, deskY - 12, 14, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Architectural Monstera Plant in Slate Pot (Corner)
    const potX = r.x + 225;
    const potY = r.y + 45;
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(potX, potY, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#64748B';
    ctx.stroke();

    // Plant leaves
    ctx.fillStyle = '#10B981';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + Math.sin(timeSec + i) * 0.05;
      const lx = potX + Math.cos(angle) * 11;
      const ly = potY + Math.sin(angle) * 11;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 6, 3, angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==========================================
  // ROOM FIXTURE 2: R&D & SERVER CLUSTER
  // ==========================================
  drawRndLabFixtures(ctx, r, timeSec) {
    // Dual Engineering Workstations
    const drawDesk = (x, y) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(x + 2, y + 2, 110, 36);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(x, y, 110, 36);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, 110, 36);

      // Dual Monitors
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(x + 18, y + 6, 32, 5);
      ctx.fillRect(x + 58, y + 6, 32, 5);

      // Code editor screen glow
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(x + 20, y + 7, 28, 3);
      ctx.fillStyle = '#10B981';
      ctx.fillRect(x + 60, y + 7, 28, 3);

      // Keyboard & Trackpad
      ctx.fillStyle = '#090D16';
      ctx.fillRect(x + 38, y + 18, 34, 12);

      // Ergonomic mesh chair
      ctx.fillStyle = '#0B1324';
      ctx.beginPath();
      ctx.arc(x + 55, y - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    drawDesk(r.x + 35, r.y + 60);
    drawDesk(r.x + 35, r.y + 125);

    // High-Density Liquid-Cooled Server Racks Box
    const rackX = r.x + 230;
    const rackY = r.y + 45;
    const rackW = 85;
    const rackH = 125;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(rackX + 3, rackY + 3, rackW, rackH);

    ctx.fillStyle = '#070D18';
    ctx.fillRect(rackX, rackY, rackW, rackH);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(rackX, rackY, rackW, rackH);

    // Glass panel reflection line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(rackX + 8, rackY + 8);
    ctx.lineTo(rackX + rackW - 8, rackY + rackH - 8);
    ctx.stroke();

    // Server Units & Dynamic Blinking LEDs
    for (let row = 0; row < 7; row++) {
      const sy = rackY + 12 + row * 15;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(rackX + 8, sy, rackW - 16, 11);
      ctx.strokeStyle = '#1E293B';
      ctx.strokeRect(rackX + 8, sy, rackW - 16, 11);

      // Diagnostic LEDs
      for (let led = 0; led < 4; led++) {
        const lx = rackX + 16 + led * 14;
        const blinkPhase = Math.sin(timeSec * 4 + row * 1.8 + led * 2.3);
        const isBlinking = blinkPhase > 0;

        ctx.fillStyle = isBlinking
          ? (led === 0 ? '#10B981' : led === 1 ? '#00E5FF' : led === 2 ? '#38BDF8' : '#F59E0B')
          : '#1E293B';
        ctx.fillRect(lx, sy + 3, 5, 5);
      }
    }
  }

  // ==========================================
  // ROOM FIXTURE 3: TRADING & QUANT FLOOR
  // ==========================================
  drawTradingFloorFixtures(ctx, r, timeSec) {
    // Quant Desks with Triple Bloomberg Monitors
    const drawTradingDesk = (x, y) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(x + 2, y + 2, 115, 38);
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(x, y, 115, 38);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(x, y, 115, 38);

      // Triple curved displays
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(x + 12, y + 6, 26, 6);
      ctx.fillRect(x + 44, y + 4, 28, 6);
      ctx.fillRect(x + 78, y + 6, 26, 6);

      // Mini green/red candlestick charts
      ctx.fillStyle = '#10B981';
      ctx.fillRect(x + 14, y + 7, 22, 4);
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(x + 46, y + 5, 24, 4);
      ctx.fillStyle = '#F43F5E';
      ctx.fillRect(x + 80, y + 7, 22, 4);

      // Chair
      ctx.fillStyle = '#0B1324';
      ctx.beginPath();
      ctx.arc(x + 58, y - 10, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    drawTradingDesk(r.x + 30, r.y + 65);
    drawTradingDesk(r.x + 30, r.y + 135);

    // Wall-Mounted Panoramic LED Ticker Board
    const tickerX = r.x + 165;
    const tickerY = r.y + 55;
    const tickerW = 95;
    const tickerH = 125;

    ctx.fillStyle = '#070C14';
    ctx.fillRect(tickerX, tickerY, tickerW, tickerH);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tickerX, tickerY, tickerW, tickerH);

    // Live Ticker Rows (Crisp typography)
    ctx.font = '700 8.5px "JetBrains Mono", monospace';
    ctx.fillStyle = '#10B981';
    ctx.fillText('TITN $44.8 ▲', tickerX + 8, tickerY + 22);

    ctx.fillStyle = '#00E5FF';
    ctx.fillText('QNTM $122 ▲', tickerX + 8, tickerY + 44);

    ctx.fillStyle = '#F43F5E';
    ctx.fillText('APEX $74.2 ▼', tickerX + 8, tickerY + 66);

    ctx.fillStyle = '#F59E0B';
    ctx.fillText('CYBR $26.9 ▲', tickerX + 8, tickerY + 88);

    ctx.fillStyle = '#10B981';
    ctx.fillText('NXUS $0.45 ▲', tickerX + 8, tickerY + 110);
  }

  // ==========================================
  // ROOM FIXTURE 4: BOARDROOM & GOVERNANCE
  // ==========================================
  drawBoardroomFixtures(ctx, r) {
    const tableCenterX = r.x + 150;
    const tableCenterY = r.y + 115;
    const rx = 90;
    const ry = 42;

    // Table shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(tableCenterX + 3, tableCenterY + 4, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Solid Walnut Conference Table
    ctx.fillStyle = '#2C1B18';
    ctx.beginPath();
    ctx.ellipse(tableCenterX, tableCenterY, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#533529';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inset frosted glass center console
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.beginPath();
    ctx.ellipse(tableCenterX, tableCenterY, rx - 30, ry - 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center Holographic Projection Ring
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.beginPath();
    ctx.arc(tableCenterX, tableCenterY, 8, 0, Math.PI * 2);
    ctx.fill();

    // 8 Boardroom Swivel Chairs
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const cx = tableCenterX + Math.cos(angle) * (rx + 15);
      const cy = tableCenterY + Math.sin(angle) * (ry + 15);

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(cx, cy, 7.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // ==========================================
  // ROOM FIXTURE 5: ESPRESSO BAR & LOUNGE
  // ==========================================
  drawBreakroomFixtures(ctx, r) {
    // Espresso Counter (Black Granite)
    const barX = r.x + 30;
    const barY = r.y + 40;
    const barW = 190;
    const barH = 30;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(barX + 2, barY + 2, barW, barH);
    ctx.fillStyle = '#27272A';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.strokeStyle = '#3F3F46';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(barX, barY, barW, barH);

    // Chrome Italian Espresso Machine
    ctx.fillStyle = '#71717A';
    ctx.fillRect(barX + 20, barY - 8, 36, 24);
    ctx.strokeStyle = '#A1A1AA';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX + 20, barY - 8, 36, 24);

    // Steam wisps from coffee machine
    for (const p of this.steamParticles) {
      ctx.fillStyle = `rgba(244, 244, 245, ${p.alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ceramic Coffee Mugs
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.arc(barX + 85, barY + 15, 3.5, 0, Math.PI * 2);
    ctx.arc(barX + 115, barY + 15, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Bar Stools (3 stools)
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#18181B';
      ctx.beginPath();
      ctx.arc(barX + 50 + i * 45, barY + 45, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#52525B';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Modern Lounge Sofas & Coffee Table
    const sofa1X = r.x + 290;
    const sofa2X = r.x + 440;

    const drawSofa = (sx) => {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(sx, barY, 100, 26);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(sx, barY, 100, 26);

      // Throw cushions
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(sx + 5, barY + 4, 14, 18);
      ctx.fillStyle = '#A855F7';
      ctx.fillRect(sx + 81, barY + 4, 14, 18);
    };

    drawSofa(sofa1X);
    drawSofa(sofa2X);
  }

  // ==========================================
  // DETAILED HUMAN CHARACTER MODEL (TOP-DOWN 2.5D)
  // Anatomical Head, Hair, Tailored Attire, Arms & Accessories
  // ==========================================
  drawDetailedHuman(ctx, w, isHovered, timeSec, c) {
    ctx.save();
    ctx.translate(w.x, w.y);

    // 1. Soft Dynamic Ambient Occlusion Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 7, 11, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. High Morale Aura / Status Ring
    if (w.morale > 75) {
      const pulse = Math.sin(timeSec * 3 + w.walkCycle) * 0.15;
      ctx.strokeStyle = isHovered ? c.accent : 'rgba(16, 185, 129, ' + (0.35 + pulse) + ')';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.beginPath();
      ctx.arc(0, 0, isHovered ? 16 : 13, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rotate context to character's facing angle
    ctx.rotate(w.angle + Math.PI / 2);

    // 3. Shoulders & Torso (Tailored Business Uniform)
    const armSwing = w.isMoving ? Math.sin(w.walkCycle) * 3.5 : 0;

    // Torso Shape
    ctx.fillStyle = w.attireColor;
    ctx.beginPath();
    ctx.roundRect(-8, -5, 16, 12, 4);
    ctx.fill();
    ctx.strokeStyle = isHovered ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left Arm & Hand
    ctx.fillStyle = w.attireColor;
    ctx.beginPath();
    ctx.ellipse(-9, -1 + armSwing, 3, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = w.skinColor;
    ctx.beginPath();
    ctx.arc(-9, 4 + armSwing, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Right Arm & Hand
    ctx.fillStyle = w.attireColor;
    ctx.beginPath();
    ctx.ellipse(9, -1 - armSwing, 3, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = w.skinColor;
    ctx.beginPath();
    ctx.arc(9, 4 - armSwing, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Carried accessory if applicable
    if (w.coffeeSteaming) {
      // Steaming coffee mug in right hand
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(8, 2 - armSwing, 4, 4);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(9, 3 - armSwing, 2, 2);
    } else if (w.hasTablet) {
      // Sleek tablet in hands
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-5, 3, 10, 5);
      ctx.fillStyle = '#A855F7';
      ctx.fillRect(-4, 4, 8, 3);
    }

    // 4. Head, Neck & Hair Model
    // Neck collar
    ctx.fillStyle = w.skinColor;
    ctx.beginPath();
    ctx.arc(0, -3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Head base
    ctx.fillStyle = w.skinColor;
    ctx.beginPath();
    ctx.arc(0, -6, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Hair Style
    ctx.fillStyle = w.hairColor;
    if (w.hairStyle === 'shortFade') {
      ctx.beginPath();
      ctx.arc(0, -7, 5.6, -Math.PI, 0);
      ctx.fill();
    } else if (w.hairStyle === 'sleekBun') {
      ctx.beginPath();
      ctx.arc(0, -7, 5.8, -Math.PI * 1.1, 0.1);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(0, -11, 2.8, 0, Math.PI * 2);
      ctx.fill();
    } else if (w.hairStyle === 'stylishCrop') {
      ctx.beginPath();
      ctx.arc(0, -7, 5.8, -Math.PI, 0.2);
      ctx.fill();
    } else {
      // Hijab or styled wrap
      ctx.fillStyle = w.attireColor;
      ctx.beginPath();
      ctx.arc(0, -6.5, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = w.skinColor;
      ctx.beginPath();
      ctx.arc(0, -5, 3.8, 0, Math.PI);
      ctx.fill();
    }

    // Headset or glasses accessory
    if (w.hasHeadset) {
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(4.5, -6, 1.8, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    // 5. Overhead Worker Name Tag & Role Pill (Screen-oriented, unrotated)
    ctx.font = '700 9px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.textAlign = 'center';

    // Name text shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillText(w.name.split(' ')[0], w.x + 1, w.y - 15);

    // Name text
    ctx.fillStyle = isHovered ? '#00E5FF' : '#F1F5F9';
    ctx.fillText(w.name.split(' ')[0], w.x, w.y - 16);
  }

  // ==========================================
  // SPEECH & THOUGHT BUBBLE (GLASSMORPHIC)
  // ==========================================
  drawSpeechBubble(ctx, text, x, y, c) {
    ctx.font = '600 9px "Plus Jakarta Sans", system-ui, sans-serif';
    const textW = ctx.measureText(text).width;
    const bubbleW = textW + 16;
    const bubbleH = 20;

    // Keep bubble on-screen within bounds
    const bx = Math.min(this.V_WIDTH - bubbleW - 10, Math.max(10, x - bubbleW / 2));
    const by = Math.max(10, y - bubbleH);

    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.roundRect(bx + 1, by + 1, bubbleW, bubbleH, 5);
    ctx.fill();

    // Bubble body
    ctx.fillStyle = 'rgba(10, 15, 29, 0.95)';
    ctx.beginPath();
    ctx.roundRect(bx, by, bubbleW, bubbleH, 5);
    ctx.fill();

    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Little pointer arrow pointing towards worker
    ctx.fillStyle = 'rgba(10, 15, 29, 0.95)';
    ctx.beginPath();
    ctx.moveTo(x - 3, by + bubbleH);
    ctx.lineTo(x + 3, by + bubbleH);
    ctx.lineTo(x, by + bubbleH + 4);
    ctx.closePath();
    ctx.fill();

    // Bubble text
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText(text, bx + bubbleW / 2, by + 13);
  }

  // ==========================================
  // DETAILED HOVER CARD (WHEN HOVERING A WORKER)
  // ==========================================
  drawWorkerHoverCard(ctx, w, c) {
    const cardW = 160;
    const cardH = 46;
    let cx = w.x + 16;
    let cy = w.y - 25;

    if (cx + cardW > this.V_WIDTH - 10) cx = w.x - cardW - 16;
    if (cy < 10) cy = 10;
    if (cy + cardH > this.V_HEIGHT - 10) cy = this.V_HEIGHT - cardH - 10;

    // Background shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(cx + 2, cy + 2, cardW, cardH, 6);
    ctx.fill();

    // Card background
    ctx.fillStyle = '#0B1324';
    ctx.beginPath();
    ctx.roundRect(cx, cy, cardW, cardH, 6);
    ctx.fill();

    ctx.strokeStyle = c.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Left accent bar
    ctx.fillStyle = c.accent;
    ctx.fillRect(cx, cy, 3, cardH);

    // Worker full name
    ctx.font = '700 9.5px "Plus Jakarta Sans", system-ui, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(w.name, cx + 8, cy + 14);

    // Role
    ctx.font = '500 8px "JetBrains Mono", monospace';
    ctx.fillStyle = '#94A3B8';
    ctx.fillText(w.role, cx + 8, cy + 26);

    // Morale & Status
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.fillStyle = w.morale > 75 ? '#10B981' : '#F59E0B';
    ctx.fillText(`MORALE: ${w.morale}% · ${w.state.toUpperCase()}`, cx + 8, cy + 38);
  }
}
