/**
 * Truck Simulator: Mud & Cargo - High-Performance 60-120FPS 2D Canvas Renderer
 * Detailed procedural truck anatomy, articulated semi-trailer, 4x4 / 6x6 / 8x8 setups,
 * dynamic suspension leaf spring kinematics, freeform cargo drag-and-drop visualization,
 * headlights cone, exhaust soot puffs, tire mud spray, and parallax offroad world.
 */

import { TIRES, TRUCK_CONFIGS, CHASSIS_LENGTHS } from './truckPhysics.js';

export class TruckRenderer {
  constructor(canvas, sim) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sim = sim;

    this.particles = [];
    this.sootParticles = [];
    this.mudSplashes = [];

    // Camera
    this.camX = 100;
    this.camY = 250;
    this.camZoom = 1.15;

    // Interactive Drag & Drop State
    this.hoveredCargoId = null;
    this.selectedCargoId = null;
    this.dragGhost = null; // { typeId, relX, relY, angle, length, height, color, icon, carrier }

    this.handleResize = this.resize.bind(this);
    window.addEventListener('resize', this.handleResize);
    this.resize();
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

  // Coordinate Conversion Helpers for Drag & Drop
  screenToWorld(screenX, screenY) {
    const w = this.displayWidth || (this.canvas.width / 2);
    const h = this.displayHeight || (this.canvas.height / 2);
    const wx = (screenX - w / 2) / this.camZoom + this.camX;
    const wy = (screenY - h * 0.65) / this.camZoom + this.camY;
    return { x: wx, y: wy };
  }

  worldToTruckLocal(worldX, worldY) {
    const dx = worldX - this.sim.x;
    const dy = worldY - this.sim.y;
    const cosA = Math.cos(-this.sim.angle);
    const sinA = Math.sin(-this.sim.angle);
    const relX = dx * cosA - dy * sinA;
    const relY = dx * sinA + dy * cosA;
    return { relX, relY };
  }

  worldToTrailerLocal(worldX, worldY) {
    const cosA = Math.cos(this.sim.angle);
    const sinA = Math.sin(this.sim.angle);
    const hitchX = this.sim.x + (-26 * cosA - 4 * sinA);
    const hitchY = this.sim.y + (-26 * sinA + 4 * cosA);

    const dx = worldX - hitchX;
    const dy = worldY - hitchY;
    const cosT = Math.cos(-this.sim.trailerAngle);
    const sinT = Math.sin(-this.sim.trailerAngle);
    const relX = dx * cosT - dy * sinT;
    const relY = dx * sinT + dy * cosT;
    return { relX, relY };
  }

  findCargoAtScreen(screenX, screenY) {
    const world = this.screenToWorld(screenX, screenY);
    for (let i = this.sim.cargos.length - 1; i >= 0; i--) {
      const c = this.sim.cargos[i];
      let local;
      if (c.carrier === 'trailer') {
        local = this.worldToTrailerLocal(world.x, world.y);
      } else {
        local = this.worldToTruckLocal(world.x, world.y);
      }
      const cdx = local.relX - c.relX;
      const cdy = local.relY - c.relY;
      const cosCA = Math.cos(-(c.angle || 0));
      const sinCA = Math.sin(-(c.angle || 0));
      const unrotX = cdx * cosCA - cdy * sinCA;
      const unrotY = cdx * sinCA + cdy * cosCA;
      const halfW = (c.length || 30) / 2 + 5;
      const halfH = (c.height || 20) / 2 + 5;
      if (Math.abs(unrotX) <= halfW && Math.abs(unrotY) <= halfH) {
        return c;
      }
    }
    return null;
  }

  render(dt = 0.016) {
    const ctx = this.ctx;
    const w = this.displayWidth || (this.canvas.width / 2);
    const h = this.displayHeight || (this.canvas.height / 2);

    if (!w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // 1. Smooth Camera Tracking with Lookahead
    const targetCamX = this.sim.x + Math.max(-40, Math.min(130, this.sim.vx * 0.45));
    const targetCamY = this.sim.y - 20;

    this.camX += (targetCamX - this.camX) * Math.min(1, dt * 5.5);
    this.camY += (targetCamY - this.camY) * Math.min(1, dt * 5.5);

    const speed = Math.abs(this.sim.vx);
    const targetZoom = Math.max(0.85, 1.22 - (speed / 130) * 0.35);
    this.camZoom += (targetZoom - this.camZoom) * Math.min(1, dt * 3);

    // 2. Parallax Sky & Mountain Ridge
    this.drawSkyAndBackdrop(ctx, w, h);

    // 3. World Transform
    ctx.save();
    ctx.translate(w / 2, h * 0.65);
    ctx.scale(this.camZoom, this.camZoom);
    ctx.translate(-this.camX, -this.camY);

    // 4. Draw Offroad Terrain & Structures
    this.drawOffroadTerrain(ctx);

    // 5. Draw Headlight Beams
    if (this.sim.headlights) {
      this.drawHeadlightBeams(ctx);
    }

    // 6. Draw Articulated Trailer (if attached)
    const config = TRUCK_CONFIGS.find(c => c.id === this.sim.truckConfigId) || TRUCK_CONFIGS[0];
    if (config.hasTrailer) {
      this.drawArticulatedTrailer(ctx, config);
    }

    // 7. Draw Detailed Truck Body
    this.drawDetailedTruck(ctx, config);

    // 8. Draw Drag Ghost Preview (if user is dragging a cargo)
    if (this.dragGhost) {
      this.drawDragGhost(ctx);
    }

    // 9. Draw Exhaust Soot & Mud Sprays
    this.renderExhaustAndDirt(ctx, dt);

    ctx.restore();

    // 10. Screen Overlays / Alerts
    this.drawScreenHUDAlerts(ctx, w, h);
  }

  drawSkyAndBackdrop(ctx, w, h) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#090d16');
    sky.addColorStop(0.4, '#172554');
    sky.addColorStop(0.7, '#1e1b4b');
    sky.addColorStop(1, '#3b1d11');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Mountain silhouettes
    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.55);
    for (let x = 0; x <= w; x += 40) {
      const px = x + this.camX * 0.08;
      const my = (h * 0.55) - Math.sin(px * 0.003) * 60 - Math.sin(px * 0.01) * 25;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Closer ridge
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    for (let x = 0; x <= w; x += 30) {
      const px = x + this.camX * 0.22;
      const my = (h * 0.65) - Math.sin(px * 0.006) * 45 - Math.sin(px * 0.02) * 15;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawOffroadTerrain(ctx) {
    const pts = this.sim.terrainPoints;
    if (!pts || pts.length < 2) return;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }

    ctx.lineTo(pts[pts.length - 1].x, 600);
    ctx.lineTo(pts[0].x, 600);
    ctx.closePath();

    const soilGrad = ctx.createLinearGradient(0, 200, 0, 550);
    soilGrad.addColorStop(0, '#332014');
    soilGrad.addColorStop(0.3, '#1c120c');
    soilGrad.addColorStop(1, '#0a0604');
    ctx.fillStyle = soilGrad;
    ctx.fill();

    // Surface Crust Layer
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      if (p1.surfaceType === 'mud') {
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 14;
      } else if (p1.surfaceType === 'rock') {
        ctx.strokeStyle = '#57534e';
        ctx.lineWidth = 10;
      } else if (p1.surfaceType === 'bridge') {
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 8;
      } else {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 9;
      }
      ctx.stroke();
    }

    // Depot Warehouse (0 to 320m)
    this.drawDepotWarehouse(ctx);

    // Outpost Destination Crane (4150m)
    this.drawOutpostFinish(ctx);

    ctx.restore();
  }

  drawDepotWarehouse(ctx) {
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 150, 250, 150);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 150, 250, 150);

    // Corrugated roof
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(30, 150);
    ctx.lineTo(165, 95);
    ctx.lineTo(300, 150);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Overhead gantry loading crane
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(220, 300); ctx.lineTo(220, 75);
    ctx.lineTo(330, 75); ctx.lineTo(330, 300);
    ctx.stroke();

    // Crane Pulley Cable
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(275, 75);
    ctx.lineTo(275, 130);
    ctx.stroke();

    // Crane Hook
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(270, 130, 10, 8);

    // Signboard
    ctx.fillStyle = '#000';
    ctx.fillRect(80, 168, 170, 24);
    ctx.strokeStyle = '#FFE500';
    ctx.lineWidth = 2;
    ctx.strokeRect(80, 168, 170, 24);

    ctx.fillStyle = '#FFE500';
    ctx.font = '900 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DEPOT PEMUATAN KREASI', 165, 184);

    ctx.restore();
  }

  drawOutpostFinish(ctx) {
    ctx.save();
    const fx = 4150;
    const fy = 273;

    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy - 95);
    ctx.lineTo(fx + 70, fy - 95);
    ctx.lineTo(fx + 70, fy);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx, fy - 95, 70, 22);
    ctx.fillStyle = '#000000';
    for (let c = 0; c < 7; c++) {
      for (let r = 0; r < 2; r++) {
        if ((c + r) % 2 === 0) {
          ctx.fillRect(fx + c * 10, fy - 95 + r * 11, 10, 11);
        }
      }
    }

    ctx.fillStyle = '#FFE500';
    ctx.font = '900 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('FINISH DROP-OFF', fx + 35, fy - 102);

    ctx.restore();
  }

  drawHeadlightBeams(ctx) {
    ctx.save();
    ctx.translate(this.sim.x, this.sim.y);
    ctx.rotate(this.sim.angle);

    const beamLength = 280;
    const beamSpread = 70;

    const grad = ctx.createRadialGradient(48, 6, 5, 48 + beamLength * 0.7, 6, beamSpread * 2);
    grad.addColorStop(0, 'rgba(254, 240, 138, 0.85)');
    grad.addColorStop(0.3, 'rgba(253, 224, 71, 0.4)');
    grad.addColorStop(1, 'rgba(253, 224, 71, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(48, 6);
    ctx.lineTo(48 + beamLength, 6 - beamSpread);
    ctx.lineTo(48 + beamLength, 6 + beamSpread);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // Articulated Semi-Trailer Rendering
  drawArticulatedTrailer(ctx, config) {
    const cosA = Math.cos(this.sim.angle);
    const sinA = Math.sin(this.sim.angle);
    const hitchX = this.sim.x + (-26 * cosA - 4 * sinA);
    const hitchY = this.sim.y + (-26 * sinA + 4 * cosA);

    ctx.save();
    ctx.translate(hitchX, hitchY);
    ctx.rotate(this.sim.trailerAngle);

    const trailerLen = config.trailerLength || 130;

    // 1. Trailer Steel Beam Frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-trailerLen, -4, trailerLen, 10);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(-trailerLen, -4, trailerLen, 10);

    // 2. Articulated Fifth-Wheel Hitch Joint
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Trailer Floor / Lowboy deck
    ctx.fillStyle = '#334155';
    ctx.fillRect(-trailerLen + 5, -8, trailerLen - 10, 5);
    ctx.strokeRect(-trailerLen + 5, -8, trailerLen - 10, 5);

    // Hazard striped bumper at trailer rear
    ctx.fillStyle = '#FFE500';
    ctx.fillRect(-trailerLen - 4, -8, 5, 14);
    ctx.fillStyle = '#000';
    ctx.fillRect(-trailerLen - 4, -4, 5, 4);

    // 4. Trailer Cargos
    this.sim.cargos.filter(c => c.carrier === 'trailer').forEach(c => {
      this.drawSingleCargo(ctx, c);
    });

    // 5. Trailer Wheels & Suspensions
    if (this.sim.trailerWheels) {
      const tireDef = TIRES.find(t => t.id === this.sim.tireId) || TIRES[0];
      const radius = tireDef.radius || 21;

      this.sim.trailerWheels.forEach(w => {
        const deflection = w.suspensionDeflection || 0;
        const wheelY = w.relY - deflection;

        // Leaf spring
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w.relX - 12, w.relY - 6);
        ctx.quadraticCurveTo(w.relX, wheelY - 2, w.relX + 12, w.relY - 6);
        ctx.stroke();

        ctx.save();
        ctx.translate(w.relX, wheelY);
        ctx.rotate(w.spinAngle);
        this.renderTireCircle(ctx, radius, tireDef);
        ctx.restore();
      });
    }

    ctx.restore();
  }

  drawDetailedTruck(ctx, config) {
    ctx.save();
    ctx.translate(this.sim.x, this.sim.y);
    ctx.rotate(this.sim.angle);

    const bedId = this.sim.bedId;
    const rearWheel = this.sim.wheels[this.sim.wheels.length - 1];
    const frontWheel = this.sim.wheels[0];
    const tireDef = TIRES.find(t => t.id === this.sim.tireId) || TIRES[0];
    const radius = tireDef.radius || 21;
    const lenDef = CHASSIS_LENGTHS.find(l => l.id === this.sim.chassisLengthId) || CHASSIS_LENGTHS[1];
    const lenMul = lenDef.lengthFactor || 1.0;

    const minRearX = rearWheel ? (rearWheel.relX - radius - 6) : -65;
    const chassisRear = Math.min(minRearX, Math.round(-65 * lenMul));
    const chassisFront = frontWheel ? Math.max(50, frontWheel.relX + radius + 4) : 50;
    const chassisWidth = chassisFront - chassisRear;

    // 1. Heavy Steel Ladder Chassis
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(chassisRear, 8, chassisWidth, 8);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(chassisRear, 8, chassisWidth, 8);

    // Fuel Tank & Air Cylinders below chassis
    ctx.fillStyle = '#475569';
    ctx.fillRect(-15, 14, 24, 8);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(12, 14, 8, 8);

    // 2. Vertical Exhaust Smoke Stack
    ctx.fillStyle = '#64748b';
    ctx.fillRect(16, -35, 5, 42);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, -35, 5, 42);

    // Curved exhaust tip
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.moveTo(16, -35);
    ctx.lineTo(24, -40);
    ctx.lineTo(26, -36);
    ctx.lineTo(21, -33);
    ctx.closePath();
    ctx.fill();

    // 3. Modular Cargo Bed Body (unless tractor cab for semi-trailer)
    if (!config.hasTrailer) {
      this.drawTruckBed(ctx, bedId, chassisRear);
    } else {
      // Draw 5th-wheel coupler plate on tractor cab
      ctx.fillStyle = '#000';
      ctx.fillRect(-32, 2, 16, 6);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-28, 0, 8, 3);
    }

    // 4. Physical Cargos Loaded on Truck Bed (cab carrier)
    this.sim.cargos.filter(c => c.carrier !== 'trailer').forEach(c => {
      this.drawSingleCargo(ctx, c);
    });

    // 5. Heavy Truck Front Cab
    this.drawTruckCab(ctx);

    // 6. Suspensions
    this.drawSuspensions(ctx);

    // 7. Rotating Wheels & Tires
    this.drawWheels(ctx);

    ctx.restore();
  }

  drawTruckCab(ctx) {
    // Cab Body
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(18, -32, 34, 40);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, -32, 34, 40);

    // Sloped Windshield
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.moveTo(28, -30);
    ctx.lineTo(46, -20);
    ctx.lineTo(46, -6);
    ctx.lineTo(28, -6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Glass reflection streak
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, -26);
    ctx.lineTo(42, -10);
    ctx.stroke();

    // Driver Silhouette
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(36, -14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(34, -10, 6, 4);

    // Chrome Bumper & Front Grille
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(48, -4, 6, 16);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(48, -4, 6, 16);

    // Grille Slits
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(49, 0); ctx.lineTo(53, 0);
    ctx.moveTo(49, 4); ctx.lineTo(53, 4);
    ctx.moveTo(49, 8); ctx.lineTo(53, 8);
    ctx.stroke();

    // Headlight Lens
    ctx.fillStyle = this.sim.headlights ? '#fef08a' : '#94a3b8';
    ctx.fillRect(48, -1, 4, 5);
    ctx.strokeStyle = '#000';
    ctx.strokeRect(48, -1, 4, 5);

    // Side Mirror
    ctx.fillStyle = '#000';
    ctx.fillRect(26, -24, 3, 8);
    ctx.fillRect(29, -24, 4, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(29, -23, 3, 6);
  }

  drawTruckBed(ctx, bedId, rearX) {
    const bedWidth = 14 - rearX;

    if (bedId === 'flatbed') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(rearX, -2, bedWidth, 10);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(rearX, -2, bedWidth, 10);

      // Wooden Stakes
      ctx.fillStyle = '#451a03';
      for (let x = rearX + 4; x <= 10; x += 16) {
        ctx.fillRect(x, -16, 4, 16);
        ctx.strokeRect(x, -16, 4, 16);
      }
    } else if (bedId === 'dump') {
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(rearX, -22);
      ctx.lineTo(14, -22);
      ctx.lineTo(14, 8);
      ctx.lineTo(rearX, 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(rearX, -22);
      ctx.lineTo(rearX - 3, 8);
      ctx.stroke();
    } else if (bedId === 'box') {
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(rearX, -36, bedWidth, 44);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(rearX, -36, bedWidth, 44);

      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      for (let x = rearX + 8; x <= 8; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, -34);
        ctx.lineTo(x, 6);
        ctx.stroke();
      }
    } else if (bedId === 'lowboy') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rearX - 8, -4, bedWidth + 8, 12);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.strokeRect(rearX - 8, -4, bedWidth + 8, 12);
    }
  }

  // Draw an individual freeform cargo item with rotation & interaction styles
  drawSingleCargo(ctx, c) {
    ctx.save();
    ctx.translate(c.relX, c.relY);
    ctx.rotate(c.angle || 0);

    const isHovered = this.hoveredCargoId === c.id;
    const isSelected = this.selectedCargoId === c.id;

    if (c.typeId === 'logs') {
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.length / 2, -c.height / 2, c.length, c.height);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-c.length / 2, -c.height / 2, c.length, c.height);

      ctx.beginPath();
      ctx.arc(c.length / 2 - 2, 0, c.height / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (c.typeId === 'stone') {
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.moveTo(-c.length / 2, -c.height / 2);
      ctx.lineTo(c.length / 2 - 4, -c.height / 2 - 2);
      ctx.lineTo(c.length / 2, c.height / 2);
      ctx.lineTo(-c.length / 2 + 4, c.height / 2 + 1);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (c.typeId === 'fuel') {
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.length / 2, -c.height / 2, c.length, c.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.8;
      ctx.strokeRect(-c.length / 2, -c.height / 2, c.length, c.height);

      ctx.fillStyle = '#fff';
      ctx.fillRect(-c.length / 2, -2, c.length, 4);
    } else if (c.typeId === 'pipes') {
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.length / 2, -c.height / 2, c.length, c.height);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(-c.length / 2, -c.height / 2, c.length, c.height);

      // Hollow pipe ends
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(c.length / 2 - 2, 0, c.height / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (c.typeId === 'concrete') {
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.length / 2, -c.height / 2, c.length, c.height);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(-c.length / 2, -c.height / 2, c.length, c.height);

      // Reinforcing rebar indicators
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-c.length / 2, -2, 4, 4);
      ctx.fillRect(c.length / 2 - 4, -2, 4, 4);
    } else if (c.typeId === 'machinery') {
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.length / 2, -c.height / 2, c.length, c.height);
      ctx.strokeStyle = '#0369a1';
      ctx.lineWidth = 2;
      ctx.strokeRect(-c.length / 2, -c.height / 2, c.length, c.height);

      // Metallic turbine cylinder
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.length / 2, -c.height / 2, c.length, c.height);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-c.length / 2, -c.height / 2, c.length, c.height);

      ctx.beginPath();
      ctx.moveTo(-c.length / 2, -c.height / 2);
      ctx.lineTo(c.length / 2, c.height / 2);
      ctx.moveTo(c.length / 2, -c.height / 2);
      ctx.lineTo(-c.length / 2, c.height / 2);
      ctx.stroke();
    }

    // Tie-down yellow strap
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -c.height / 2 - 2);
    ctx.lineTo(0, c.height / 2 + 3);
    ctx.stroke();

    // Hover / Selection glow
    if (isHovered || isSelected) {
      ctx.strokeStyle = isSelected ? '#38bdf8' : '#fef08a';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 2]);
      ctx.strokeRect(-c.length / 2 - 3, -c.height / 2 - 3, c.length + 6, c.height + 6);
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  // Draw ghost preview when user is dragging an item to drop
  drawDragGhost(ctx) {
    const g = this.dragGhost;
    if (!g) return;

    ctx.save();
    // Ghost is relative to truck or trailer
    if (g.carrier === 'trailer') {
      const cosA = Math.cos(this.sim.angle);
      const sinA = Math.sin(this.sim.angle);
      const hitchX = this.sim.x + (-26 * cosA - 4 * sinA);
      const hitchY = this.sim.y + (-26 * sinA + 4 * cosA);
      ctx.translate(hitchX, hitchY);
      ctx.rotate(this.sim.trailerAngle);
    } else {
      ctx.translate(this.sim.x, this.sim.y);
      ctx.rotate(this.sim.angle);
    }

    ctx.translate(g.relX, g.relY);
    ctx.rotate(g.angle || 0);

    ctx.globalAlpha = 0.8;
    ctx.fillStyle = g.color || '#f59e0b';
    ctx.fillRect(-g.length / 2, -g.height / 2, g.length, g.height);

    ctx.strokeStyle = '#FFE500';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 3]);
    ctx.strokeRect(-g.length / 2, -g.height / 2, g.length, g.height);
    ctx.setLineDash([]);

    // Icon & Weight label in ghost
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${g.icon || '📦'} ${g.weight}kg`, 0, 3);

    ctx.restore();
  }

  drawSuspensions(ctx) {
    const numWheels = this.sim.wheels.length;
    for (let i = 0; i < numWheels; i++) {
      const w = this.sim.wheels[i];
      const deflection = w.suspensionDeflection || 0;
      const wheelY = w.relY - deflection;

      // Steel leaf spring arch
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(w.relX - 14, w.relY - 6);
      ctx.quadraticCurveTo(w.relX, wheelY - 2, w.relX + 14, w.relY - 6);
      ctx.stroke();

      // Damper cylinder
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w.relX, w.relY - 6);
      ctx.lineTo(w.relX, wheelY);
      ctx.stroke();
    }
  }

  drawWheels(ctx) {
    const tireDef = TIRES.find(t => t.id === this.sim.tireId) || TIRES[0];
    const radius = tireDef.radius || 21;
    const numWheels = this.sim.wheels.length;

    for (let i = 0; i < numWheels; i++) {
      const w = this.sim.wheels[i];
      const deflection = w.suspensionDeflection || 0;
      const wheelY = w.relY - deflection;

      ctx.save();
      ctx.translate(w.relX, wheelY);
      ctx.rotate(w.spinAngle);

      this.renderTireCircle(ctx, radius, tireDef);

      ctx.restore();
    }
  }

  renderTireCircle(ctx, radius, tireDef) {
    // Heavy Rubber Outer Tire
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Distinctive Offroad Lug Treads
    const lugCount = tireDef.id === 'tire_monster' ? 10 : (tireDef.id === 'tire_allterrain' ? 8 : 6);
    ctx.fillStyle = tireDef.id === 'tire_monster' ? '#475569' : '#334155';
    for (let a = 0; a < lugCount; a++) {
      const ang = (a / lugCount) * Math.PI * 2;
      ctx.save();
      ctx.rotate(ang);
      const lugDepth = tireDef.id === 'tire_monster' ? 5 : (tireDef.id === 'tire_allterrain' ? 4 : 2.5);
      ctx.fillRect(-2.5, radius - lugDepth, 5, lugDepth + 1);
      ctx.restore();
    }

    // Steel Rim
    const rimRadius = radius * 0.58;
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, 0, rimRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Rim cooling holes
    ctx.fillStyle = '#475569';
    for (let v = 0; v < 5; v++) {
      const vAng = (v / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(vAng) * (rimRadius * 0.65), Math.sin(vAng) * (rimRadius * 0.65), 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wheel Lug Nuts (6 nuts)
    ctx.fillStyle = '#0f172a';
    for (let n = 0; n < 6; n++) {
      const nutAng = (n / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(nutAng) * (rimRadius * 0.4), Math.sin(nutAng) * (rimRadius * 0.4), 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Axle Hub Cap
    ctx.fillStyle = this.sim.diffLock ? '#f59e0b' : '#3b82f6';
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  renderExhaustAndDirt(ctx, dt) {
    if (Math.abs(this.sim.throttle) > 0.1 || Math.random() < 0.2) {
      const cosA = Math.cos(this.sim.angle);
      const sinA = Math.sin(this.sim.angle);
      const tipX = this.sim.x + (24 * cosA - (-38) * sinA);
      const tipY = this.sim.y + (24 * sinA + (-38) * cosA);

      const sootDarkness = Math.abs(this.sim.throttle) > 0.7 ? '#1e293b' : '#64748b';
      this.sootParticles.push({
        x: tipX,
        y: tipY,
        vx: -Math.abs(this.sim.vx * 0.4) - 2 - Math.random() * 2,
        vy: -2 - Math.random() * 3,
        size: 3 + Math.abs(this.sim.throttle) * 4,
        alpha: 0.7,
        color: sootDarkness
      });
    }

    for (let i = this.sootParticles.length - 1; i >= 0; i--) {
      const p = this.sootParticles[i];
      p.x += p.vx * dt * 45;
      p.y += p.vy * dt * 45;
      p.size += dt * 8;
      p.alpha -= dt * 0.8;

      if (p.alpha <= 0) {
        this.sootParticles.splice(i, 1);
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

  drawScreenHUDAlerts(ctx, w, h) {
    if (this.sim.isRolledOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(w / 2 - 180, h / 2 - 45, 360, 90);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.strokeRect(w / 2 - 180, h / 2 - 45, 360, 90);

      ctx.fillStyle = '#ef4444';
      ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ TRUK TERBALIK / ROLLOVER! ⚠️', w / 2, h / 2 - 12);

      ctx.fillStyle = '#FFE500';
      ctx.font = '700 12px monospace';
      ctx.fillText('Tekan [R] untuk Reset Truk ke Posisi Awal', w / 2, h / 2 + 18);
    } else if (this.sim.hasFinished) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(w / 2 - 200, h / 2 - 50, 400, 100);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(w / 2 - 200, h / 2 - 50, 400, 100);

      ctx.fillStyle = '#34d399';
      ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎉 MISI DROP-OFF SUKSES! 🎉', w / 2, h / 2 - 15);

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px monospace';
      ctx.fillText(`Muatan Terkirim: ${this.sim.cargos.length} Unit Kargo Utuh`, w / 2, h / 2 + 12);
      ctx.fillStyle = '#FFE500';
      ctx.fillText('Tekan [R] untuk Memuat Kargo Baru di Depot', w / 2, h / 2 + 32);
    }
  }
}
