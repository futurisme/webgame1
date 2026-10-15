/**
 * Ultra-Lightweight Object-Pooled Particle & Combat Text System for 5v5 MOBA.
 * Duplicated and specialized from the base engine particles.js.
 * Zero-garbage collection design (fixed pre-allocated pools) for 120 FPS buttery gameplay.
 */

export class MobaParticleSystem {
  constructor(maxParticles = 350) {
    this.maxParticles = maxParticles;
    this.pool = new Array(maxParticles);
    this.activeCount = 0;

    // Screen Shake state
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeX = 0;
    this.shakeY = 0;

    // Pre-allocate pool
    for (let i = 0; i < maxParticles; i++) {
      this.pool[i] = {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        size: 2,
        color: '#ffffff',
        alpha: 1,
        life: 0,
        maxLife: 1,
        shape: 'circle', // 'circle', 'spark', 'beam', 'ring'
        radius: 0
      };
    }
  }

  triggerScreenShake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  emit(x, y, count = 8, color = '#fbbf24', speed = 120, life = 0.4, shape = 'circle', size = 3) {
    for (let i = 0; i < count; i++) {
      const p = this._acquire();
      if (!p) break;

      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const spd = speed * (0.6 + Math.random() * 0.8);

      p.active = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.size = size;
      p.color = color;
      p.alpha = 1;
      p.life = 0;
      p.maxLife = life * (0.8 + Math.random() * 0.4);
      p.shape = shape;
    }
  }

  emitRing(x, y, radius = 60, color = '#38bdf8', life = 0.35) {
    const p = this._acquire();
    if (!p) return;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = 0;
    p.vy = 0;
    p.size = 2;
    p.color = color;
    p.alpha = 1;
    p.life = 0;
    p.maxLife = life;
    p.shape = 'ring';
    p.radius = radius;
  }

  emitMoveTargetPing(x, y) {
    this.emitRing(x, y, 22, '#10b981', 0.4);
    this.emit(x, y, 5, '#34d399', 50, 0.25, 'spark', 2.5);
  }

  emitBeam(x1, y1, x2, y2, color = '#eab308', life = 0.2, size = 6) {
    const p = this._acquire();
    if (!p) return;
    p.active = true;
    p.x = x1;
    p.y = y1;
    p.vx = x2;
    p.vy = y2;
    p.size = size;
    p.color = color;
    p.alpha = 1;
    p.life = 0;
    p.maxLife = life;
    p.shape = 'beam';
  }

  emitSlashArc(x, y, angle, radius = 70, color = '#ef4444', life = 0.22) {
    const p = this._acquire();
    if (!p) return;
    p.active = true;
    p.x = x;
    p.y = y;
    p.vx = Math.cos(angle);
    p.vy = Math.sin(angle);
    p.angle = angle;
    p.size = 4;
    p.radius = Math.max(10, radius);
    p.color = color;
    p.alpha = 1;
    p.life = 0;
    p.maxLife = life;
    p.shape = 'slash_arc';
  }

  emitLightning(x1, y1, x2, y2, color = '#38bdf8', life = 0.18) {
    // Branching jagged lightning bolt
    const steps = 5;
    let prevX = x1;
    let prevY = y1;
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 1; i <= steps; i++) {
      const isEnd = i === steps;
      const jitter = isEnd ? 0 : (Math.random() - 0.5) * 36;
      const nx = x1 + dx * i - (dy / steps) * jitter;
      const ny = y1 + dy * i + (dx / steps) * jitter;
      this.emitBeam(prevX, prevY, nx, ny, color, life, 3.5);
      prevX = nx;
      prevY = ny;
    }
  }

  emitShockwave(x, y, radius = 90, color = '#eab308', life = 0.35) {
    this.emitRing(x, y, radius, color, life);
    this.emit(x, y, 12, color, 140, 0.35, 'spark', 3);
    this.triggerScreenShake(4, 0.2);
  }

  emitGroundRupture(x, y, radius = 80, color = '#78350f', life = 0.5) {
    const p = this._acquire();
    if (!p) return;
    p.active = true;
    p.x = x;
    p.y = y;
    p.radius = radius;
    p.color = color;
    p.alpha = 1;
    p.life = 0;
    p.maxLife = life;
    p.shape = 'ground_rupture';
    this.triggerScreenShake(7, 0.3);
  }

  _acquire() {
    for (let i = 0; i < this.maxParticles; i++) {
      if (!this.pool[i].active) return this.pool[i];
    }
    return null;
  }

  update(dt) {
    // Update Screen Shake
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      this.shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity *= Math.pow(0.1, dt);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }

    // Update Particles
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      p.life += dt;
      if (p.life >= p.maxLife) {
        p.active = false;
        continue;
      }

      const progress = p.life / p.maxLife;
      p.alpha = 1 - progress;

      if (p.shape !== 'beam' && p.shape !== 'ring') {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vx *= 0.94;
        p.vy *= 0.94;
      }
    }
  }

  render(ctx, camera) {
    ctx.save();
    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));

      if (p.shape === 'ring') {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;
        const progress = p.maxLife > 0 ? p.life / p.maxLife : 0;
        const r = Math.max(0.1, (p.radius || 30) * Math.max(0.05, progress));
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, 3 * (1 - progress));
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'beam') {
        const sx1 = p.x - camera.x;
        const sy1 = p.y - camera.y;
        const sx2 = p.vx - camera.x;
        const sy2 = p.vy - camera.y;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, p.size || 4);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
      } else if (p.shape === 'slash_arc' || p.shape === 'slash') {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;
        const angle = p.angle !== undefined ? p.angle : (typeof p.size === 'number' && Math.abs(p.size) <= Math.PI * 2 ? p.size : 0);
        const progress = p.maxLife > 0 ? p.life / p.maxLife : 0;
        const currentR = Math.max(0.1, (p.radius || 60) * (0.7 + progress * 0.4));
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(angle);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, 6 * (1 - progress));
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, currentR, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();
        ctx.restore();
      } else if (p.shape === 'ground_rupture') {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;
        const progress = p.maxLife > 0 ? p.life / p.maxLife : 0;
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, 3 * (1 - progress));
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (Math.PI * 2 * a) / 6;
          const r = Math.max(0.1, (p.radius || 50) * (0.4 + (a % 2) * 0.5));
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
        }
        ctx.stroke();
      } else {
        const sx = p.x - camera.x;
        const sy = p.y - camera.y;
        const safeSize = Math.max(0.1, typeof p.size === 'number' && p.size > 0 ? p.size : 2.5);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, sy, safeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  render2D5(ctx, renderer) {
    ctx.save();
    const pitch = renderer.pitch || 0.72;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.pool[i];
      if (!p.active) continue;

      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      const spos = renderer.worldToScreen(p.x, p.y);

      if (p.shape === 'beam') {
        const spos2 = renderer.worldToScreen(p.x2 !== undefined ? p.x2 : p.vx, p.y2 !== undefined ? p.y2 : p.vy);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, p.width || p.size || 4);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(spos.x, spos.y);
        ctx.lineTo(spos2.x, spos2.y);
        ctx.stroke();
      } else if (p.shape === 'ring') {
        const progress = p.maxLife > 0 ? p.life / p.maxLife : 0;
        const currentR = Math.max(0.1, (p.radius || 40) * (0.3 + progress * 0.7));
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, (p.lineWidth || 2.5) * (1 - progress));
        ctx.beginPath();
        ctx.ellipse(spos.x, spos.y, currentR, Math.max(0.1, currentR * pitch), 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'slash_arc' || p.shape === 'slash') {
        const angle = p.angle !== undefined ? p.angle : (typeof p.size === 'number' && Math.abs(p.size) <= Math.PI * 2 ? p.size : 0);
        const progress = p.maxLife > 0 ? p.life / p.maxLife : 0;
        const currentR = Math.max(0.1, (p.radius || 65) * (0.65 + progress * 0.45));
        ctx.save();
        ctx.translate(spos.x, spos.y);
        ctx.scale(1, pitch);
        ctx.rotate(angle);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, 6 * (1 - progress));
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(0, 0, currentR, -Math.PI * 0.35, Math.PI * 0.35);
        ctx.stroke();
        ctx.restore();
      } else if (p.shape === 'ground_rupture') {
        const progress = p.maxLife > 0 ? p.life / p.maxLife : 0;
        ctx.save();
        ctx.translate(spos.x, spos.y);
        ctx.scale(1, pitch);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(0.5, 3.5 * (1 - progress));
        ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const ang = (Math.PI * 2 * a) / 6;
          const r = Math.max(0.1, (p.radius || 55) * (0.4 + (a % 2) * 0.5));
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.stroke();
        ctx.restore();
      } else if (p.shape === 'lightning') {
        const spos2 = renderer.worldToScreen(p.x2 !== undefined ? p.x2 : p.vx, p.y2 !== undefined ? p.y2 : p.vy);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(spos.x, spos.y);
        const segs = 4;
        const seed = Math.sin(p.x * 0.05 + p.y * 0.05);
        for (let s = 1; s <= segs; s++) {
          const t = s / segs;
          const wobble = (s % 2 === 1 ? 1 : -1) * 9 * (1 + seed * 0.3);
          const lx = spos.x + (spos2.x - spos.x) * t + (s < segs ? wobble : 0);
          const ly = spos.y + (spos2.y - spos.y) * t + (s < segs ? wobble * 0.6 : 0);
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      } else {
        const safeSize = Math.max(0.1, typeof p.size === 'number' && p.size > 0 ? p.size : 2.5);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(spos.x, spos.y, safeSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

export class MobaCombatTextSystem {
  constructor(maxTexts = 120) {
    this.maxTexts = maxTexts;
    this.pool = new Array(maxTexts);

    for (let i = 0; i < maxTexts; i++) {
      this.pool[i] = {
        active: false,
        x: 0,
        y: 0,
        text: '',
        color: '#ffffff',
        type: 'phys', // 'phys', 'magic', 'true', 'crit', 'heal', 'status'
        alpha: 1,
        life: 0,
        maxLife: 0.85,
        offsetY: 0,
        scale: 1
      };
    }
  }

  addText(x, y, text, type = 'phys') {
    let p = null;
    for (let i = 0; i < this.maxTexts; i++) {
      if (!this.pool[i].active) {
        p = this.pool[i];
        break;
      }
    }
    if (!p) return;

    p.active = true;
    p.x = x + (Math.random() - 0.5) * 24;
    p.y = y - 30;
    p.text = text;
    p.type = type;
    p.life = 0;
    p.maxLife = type === 'crit' ? 1.0 : 0.85;
    p.alpha = 1;
    p.offsetY = 0;
    p.scale = type === 'crit' ? 1.4 : 1.0;

    switch (type) {
      case 'phys':
        p.color = '#fbbf24'; // Warm yellow/orange
        break;
      case 'magic':
        p.color = '#a855f7'; // Purple
        break;
      case 'true':
        p.color = '#ffffff'; // Pure white true damage
        break;
      case 'crit':
        p.color = '#ef4444'; // Red fiery crit
        break;
      case 'heal':
        p.color = '#22c55e'; // Green heal
        break;
      case 'status':
        p.color = '#38bdf8'; // Blue status
        break;
      default:
        p.color = '#ffffff';
    }
  }

  update(dt) {
    for (let i = 0; i < this.maxTexts; i++) {
      const t = this.pool[i];
      if (!t.active) continue;

      t.life += dt;
      if (t.life >= t.maxLife) {
        t.active = false;
        continue;
      }

      const progress = t.life / t.maxLife;
      t.offsetY = -progress * 42;
      t.alpha = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;

      if (t.type === 'crit') {
        // Bounce pop scale
        t.scale = progress < 0.2 ? 1 + progress * 2.5 : Math.max(1, 1.5 - (progress - 0.2));
      }
    }
  }

  render(ctx, camera) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.maxTexts; i++) {
      const t = this.pool[i];
      if (!t.active) continue;

      const sx = t.x - camera.x;
      const sy = t.y + t.offsetY - camera.y;

      ctx.globalAlpha = t.alpha;
      ctx.font = t.type === 'crit'
        ? `900 ${Math.floor(18 * t.scale)}px sans-serif`
        : `bold ${Math.floor(13 * t.scale)}px sans-serif`;

      // Dark stroke outline for readability
      ctx.strokeStyle = '#05070f';
      ctx.lineWidth = 3.5;
      ctx.strokeText(t.text, sx, sy);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, sx, sy);
    }
    ctx.restore();
  }

  render2D5(ctx, renderer) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < this.maxTexts; i++) {
      const t = this.pool[i];
      if (!t.active) continue;

      const spos = renderer.worldToScreen(t.x, t.y);
      const sx = spos.x;
      const sy = spos.y + t.offsetY;

      ctx.globalAlpha = t.alpha;
      ctx.font = t.type === 'crit'
        ? `900 ${Math.floor(18 * t.scale)}px sans-serif`
        : `bold ${Math.floor(13 * t.scale)}px sans-serif`;

      ctx.strokeStyle = '#05070f';
      ctx.lineWidth = 3.5;
      ctx.strokeText(t.text, sx, sy);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, sx, sy);
    }
    ctx.restore();
  }
}
