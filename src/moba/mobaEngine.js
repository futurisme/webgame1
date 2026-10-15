/**
 * Master Game Engine for 5v5 MOBA Dawn Arena.
 * Deterministic simulation tick, 1 Player + 9 Smart AI Bots, PC Controls, and Multikill system.
 * 100% Pure JavaScript, zero TSX.
 */

import { HEROES_DATA, ITEMS_DATA, ROLES } from './mobaData.js';
import { MobaMap } from './mobaMap.js';
import { MobaHero } from './mobaHero.js';
import { MinionWaveManager } from './mobaMinions.js';
import { TurretManager } from './mobaTurrets.js';
import { JungleManager } from './mobaJungle.js';
import { MobaAiController } from './mobaAi.js';
import { MobaParticleSystem, MobaCombatTextSystem } from './mobaParticles.js';
import { mobaSound } from './mobaSound.js';
import { MobaRenderer } from './mobaRenderer.js';
import { MobaUIManager } from './mobaUi.js';

export class MobaGameEngine {
  constructor(options = {}) {
    this.canvas = document.getElementById('game-canvas');
    this.uiContainer = document.getElementById('game-ui');

    // Configuration options
    this.playerHeroId = options.heroId || 'layla';
    this.playerSpellId = options.spellId || 'flicker';

    // Systems
    this.sound = mobaSound;
    this.map = new MobaMap();
    this.particles = new MobaParticleSystem(350);
    this.combatTexts = new MobaCombatTextSystem(120);
    this.renderer = new MobaRenderer(this.canvas);

    // Fast item lookup map
    this.allItemsMap = {};
    ITEMS_DATA.forEach(it => { this.allItemsMap[it.id] = it; });

    // Game Match State
    this.gameTime = 0;
    this.teamKills = { blue: 0, red: 0 };
    this.isGameOver = false;
    this.winningTeam = null;

    // First Blood & Multikill tracking
    this.hasFirstBloodOccurred = false;
    this.recentKills = []; // { killer, victim, time }
    this.activePlayerPing = null; // { type, x, y, time }

    // Marching Lord status
    this.isLordMarching = false;
    this.lordTeam = null;
    this.lordEntity = null;

    // Subsystem Managers
    this.minionManager = new MinionWaveManager(this.map);
    this.turretManager = new TurretManager(this.map);
    this.jungleManager = new JungleManager(this.map);

    // Initialize 10 Heroes (5v5 balanced team compositions)
    this.initHeroes();

    // AI Controller
    this.aiController = new MobaAiController(this);

    // UI Manager
    this.ui = new MobaUIManager(this.uiContainer, this);

    // Aiming State for Skillshots
    this.aimingState = {
      active: false,
      skillNumber: 1,
      range: 300,
      type: 'line',
      targetX: 0,
      targetY: 0
    };

    // Input state & destination movement
    this.input = {
      keys: {},
      mouseScreen: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      mouseWorld: { x: 360, y: 2840 }
    };
    this.playerMoveTarget = null; // MOBA Right-click destination target

    // Timing & Loop
    this.lastTime = performance.now();
    this.running = true;

    this.initControls();
    this.start();

    // Welcome fanfare
    setTimeout(() => {
      this.sound.playAnnounce('first_blood');
      this.ui.showAnnouncement('SELAMAT DATANG DI DAWN ARENA!', 'Hancurkan Turret & Crystal Nexus Lawan!', 'from-amber-500 to-sky-600');
      this.addLog('Pertandingan 5v5 dimulai! Minion akan bergerak dalam 10 detik.', '#38bdf8');
    }, 600);
  }

  initHeroes() {
    this.heroes = [];

    // Role line-ups
    const roleRoster = ['exp', 'jungle', 'mid', 'gold', 'roam'];
    const bluePool = ['chou', 'alucard', 'eudora', 'layla', 'tigreal'];
    const redPool = ['balmond', 'gusion', 'kagura', 'miya', 'grock'];

    // Find Player role & hero
    const playerHeroData = HEROES_DATA[this.playerHeroId] || HEROES_DATA.layla;
    const playerRole = playerHeroData.role;

    // Setup Blue Team
    roleRoster.forEach((role, idx) => {
      let heroId = bluePool[idx];
      let isPlayer = false;

      if (role === playerRole) {
        heroId = this.playerHeroId;
        isPlayer = true;
      }

      const hero = new MobaHero(heroId, 'blue', role, isPlayer, isPlayer ? this.playerSpellId : null);
      this.heroes.push(hero);
      if (isPlayer) this.playerHero = hero;
    });

    // Fallback if player wasn't in standard roles
    if (!this.playerHero) {
      this.heroes[3] = new MobaHero(this.playerHeroId, 'blue', 'gold', true, this.playerSpellId);
      this.playerHero = this.heroes[3];
    }

    // Setup Red Team (all 5 AI Bots)
    roleRoster.forEach((role, idx) => {
      const heroId = redPool[idx];
      const hero = new MobaHero(heroId, 'red', role, false);
      this.heroes.push(hero);
    });
  }

  initControls() {
    this._onKeyDown = (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      this.input.keys[e.code] = true;

      // Handle Hotkeys (Q/E/R or 1/2/3 - W is exclusively reserved for movement!)
      if (e.code === 'Digit1' || e.code === 'KeyQ') {
        this.startOrCastSkill(1);
      } else if (e.code === 'Digit2' || e.code === 'KeyE') {
        this.startOrCastSkill(2);
      } else if (e.code === 'Digit3' || e.code === 'KeyR') {
        this.startOrCastSkill(3);
      } else if (e.code === 'Digit4' || e.code === 'KeyF') {
        this.castPlayerSkill(4);
      } else if (e.code === 'Digit5' || e.code === 'KeyG') {
        this.castPlayerRegen();
      } else if (e.code === 'KeyB') {
        this.castPlayerRecall();
      } else if (e.code === 'KeyP' || e.code === 'KeyV') {
        this.ui.toggleModal('shop');
      } else if (e.code === 'Tab') {
        e.preventDefault();
        this.ui.toggleModal('scoreboard');
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.playerHero.performBasicAttack(this);
      } else if (e.code === 'Escape') {
        if (this.aimingState.active) {
          this.aimingState.active = false;
        } else if (this.ui.activeModal) {
          this.ui.toggleModal(null);
        }
      }
    };
    window.addEventListener('keydown', this._onKeyDown);

    this._onKeyUp = (e) => {
      this.input.keys[e.code] = false;
    };
    window.addEventListener('keyup', this._onKeyUp);

    // Accurate canvas-relative coordinate resolution helper
    const getCanvasMouse = (e) => {
      if (!this.canvas) return { sx: e.clientX, sy: e.clientY };
      const rect = this.canvas.getBoundingClientRect();
      return {
        sx: e.clientX - rect.left,
        sy: e.clientY - rect.top
      };
    };

    // Mouse movement
    this._onMouseMove = (e) => {
      const { sx, sy } = getCanvasMouse(e);
      this.input.mouseScreen = { x: sx, y: sy };
      const worldPos = this.renderer.screenToWorld(sx, sy);
      this.input.mouseWorld = worldPos;

      if (this.aimingState.active) {
        this.aimingState.targetX = worldPos.x;
        this.aimingState.targetY = worldPos.y;
      }
    };
    window.addEventListener('mousemove', this._onMouseMove);

    // Mouse click for basic attack, aiming skill, and right-click move command
    this._onMouseDown = (e) => {
      this.sound.ensureContext();
      const { sx, sy } = getCanvasMouse(e);
      const worldPos = this.renderer.screenToWorld(sx, sy);
      this.input.mouseWorld = worldPos;

      if (e.button === 0) { // Left click
        if (this.aimingState.active) {
          this.playerHero.castSkill(
            this.aimingState.skillNumber,
            worldPos.x,
            worldPos.y,
            this
          );
          this.aimingState.active = false;
        } else {
          this.playerHero.performBasicAttack(this);
        }
      } else if (e.button === 2) { // Right click: Cancel aiming + MOBA move to destination
        e.preventDefault();
        if (this.aimingState.active) {
          this.aimingState.active = false;
        }
        // Set player destination target
        this.playerMoveTarget = { x: worldPos.x, y: worldPos.y };
        this.particles.emitMoveTargetPing(worldPos.x, worldPos.y);
      }
    };
    this.canvas.addEventListener('mousedown', this._onMouseDown);
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  destroy() {
    this.running = false;
    if (this._animFrame) cancelAnimationFrame(this._animFrame);
    if (this._onKeyDown) window.removeEventListener('keydown', this._onKeyDown);
    if (this._onKeyUp) window.removeEventListener('keyup', this._onKeyUp);
    if (this._onMouseMove) window.removeEventListener('mousemove', this._onMouseMove);
    if (this._onMouseDown && this.canvas) this.canvas.removeEventListener('mousedown', this._onMouseDown);
    if (this.renderer) this.renderer.destroy();
  }

  startOrCastSkill(num) {
    const p = this.playerHero;
    let skillData = null;
    if (num === 1) skillData = p.data.skills.skill1;
    else if (num === 2) skillData = p.data.skills.skill2;
    else if (num === 3) skillData = p.data.skills.ultimate;

    if (!skillData) return;

    // Direct instant cast towards mouse coordinates
    p.castSkill(num, this.input.mouseWorld.x, this.input.mouseWorld.y, this);
  }

  castPlayerSkill(num) {
    this.playerHero.castSkill(num, this.input.mouseWorld.x, this.input.mouseWorld.y, this);
  }

  castPlayerRegen() {
    const p = this.playerHero;
    if (p.regenCooldown <= 0 && !p.regenActive) {
      p.regenCooldown = 60;
      p.regenActive = true;
      p.regenTimer = 5;
      this.sound.playFlicker();
      this.combatTexts.addText(p.x, p.y, 'REGEN POTION!', 'heal');
    }
  }

  castPlayerRecall() {
    const p = this.playerHero;
    if (!p.recalling) {
      p.recalling = true;
      p.recallTimer = 0;
      this.addLog('Sedang melakukan Recall ke Fountain (4 detik)...', '#38bdf8');
    }
  }

  triggerPlayerPing(type) {
    const p = this.playerHero;
    this.activePlayerPing = {
      type,
      x: p.x,
      y: p.y,
      time: performance.now()
    };
    this.sound.playPing();

    const labels = {
      attack_lord: '[SERANG] Serang Lord / Turtle!',
      retreat: '[MUNDUR] Mundur / Retreat!',
      gather: '[KUMPUL] Berkumpul di sini!',
      backup: '[BANTUAN] Butuh Bantuan!'
    };

    const text = `${p.name} (Pemain): ${labels[type] || 'Ping!'}`;
    this.addLog(text, '#f59e0b');
    this.ui.showAnnouncement(labels[type], `${p.name} memberi sinyal`, 'from-amber-600 to-sky-600');
  }

  handleHeroKill(killer, victim) {
    // Increment Score
    if (killer.team === 'blue') this.teamKills.blue++;
    else this.teamKills.red++;

    // 1. Check First Blood
    if (!this.hasFirstBloodOccurred) {
      this.hasFirstBloodOccurred = true;
      this.sound.playAnnounce('first_blood');
      this.ui.showAnnouncement('FIRST BLOOD!', `${killer.name} mengeliminasi ${victim.name}!`);
      this.addLog(`[FIRST BLOOD] ${killer.name} mengeliminasi ${victim.name}!`, '#ef4444');
      return;
    }

    // 2. Multikill streak evaluation (within 10 seconds)
    const now = performance.now();
    this.recentKills.push({ killer, time: now });
    const killerRecent = this.recentKills.filter(k => k.killer === killer && now - k.time < 10000);
    const killCount = killerRecent.length;

    let announce = 'enemy_slain';
    let bannerTitle = `${killer.name.toUpperCase()} HAS SLAIN AN ENEMY`;

    if (killer.isPlayer) {
      announce = 'you_slain';
      bannerTitle = 'YOU HAVE SLAIN AN ENEMY';
    } else if (killer.team === 'blue') {
      announce = 'enemy_slain';
      bannerTitle = 'AN ENEMY HAS BEEN SLAIN';
    } else {
      announce = 'ally_slain';
      bannerTitle = 'AN ALLY HAS BEEN SLAIN';
    }

    if (killCount === 2) {
      announce = 'double_kill';
      bannerTitle = 'DOUBLE KILL!';
    } else if (killCount === 3) {
      announce = 'triple_kill';
      bannerTitle = 'TRIPLE KILL!';
    } else if (killCount === 4) {
      announce = 'maniac';
      bannerTitle = 'MANIAC!';
    } else if (killCount >= 5) {
      announce = 'savage';
      bannerTitle = 'SAVAGE!';
    }

    this.sound.playAnnounce(announce);
    this.ui.showAnnouncement(bannerTitle, `${killer.name} ➔ ${victim.name}`);
    this.addLog(`${killer.name} mengeliminasi ${victim.name}!`, killer.team === 'blue' ? '#38bdf8' : '#ef4444');

    // Check Wipe Out (if all 5 enemies are dead)
    const enemyTeam = killer.team === 'blue' ? 'red' : 'blue';
    const allEnemiesDead = this.heroes.filter(h => h.team === enemyTeam).every(h => !h.alive);
    if (allEnemiesDead) {
      setTimeout(() => {
        this.sound.playAnnounce('wipe_out');
        this.ui.showAnnouncement('WIPE OUT!', 'Semua lawan telah tereliminasi!');
      }, 1200);
    }
  }

  handleGameOver(winningTeam) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.winningTeam = winningTeam;

    const isVictory = winningTeam === this.playerHero.team;
    this.sound.playAnnounce(isVictory ? 'victory' : 'defeat');
    this.ui.showGameOver(winningTeam);
  }

  restartMatch() {
    this.destroy();
    new MobaGameEngine({ heroId: this.playerHeroId, spellId: this.playerSpellId });
  }

  addLog(msg, color = '#f1f5f9') {
    this.ui.addCombatChat(msg, color);
  }

  // --- Main Update Loop ---
  update(dt) {
    if (this.isGameOver) return;
    this.gameTime += dt;

    // 1. Update Player Movement via WASD
    this.updatePlayerMovement(dt);

    // 2. Update Heroes
    this.heroes.forEach(h => h.update(dt, this));

    // 3. Update Competitive AI
    this.aiController.update(dt);

    // 4. Update Minions
    this.minionManager.update(dt, this);

    // 5. Update Turrets & Bases
    this.turretManager.update(dt, this);

    // 6. Update Jungle & Bosses
    this.jungleManager.update(dt, this);

    // 7. Update Particles & Combat Text
    this.particles.update(dt);
    this.combatTexts.update(dt);

    // 8. Update Camera to Track Player
    this.renderer.updateCamera(
      this.playerHero.x,
      this.playerHero.y,
      dt,
      this.particles.shakeX,
      this.particles.shakeY
    );

    // 9. Update HUD
    this.ui.updateHUD();
  }

  updatePlayerMovement(dt) {
    const p = this.playerHero;
    if (!p.alive || p.stunTimer > 0) return;

    let mx = 0;
    let my = 0;

    if (this.input.keys['KeyW'] || this.input.keys['ArrowUp']) my -= 1;
    if (this.input.keys['KeyS'] || this.input.keys['ArrowDown']) my += 1;
    if (this.input.keys['KeyA'] || this.input.keys['ArrowLeft']) mx -= 1;
    if (this.input.keys['KeyD'] || this.input.keys['ArrowRight']) mx += 1;

    if (mx !== 0 || my !== 0) {
      // Manual keyboard cancels right-click destination target
      this.playerMoveTarget = null;
      p.recalling = false;

      const len = Math.hypot(mx, my);
      const step = p.moveSpeed * dt;
      p.x += (mx / len) * step;
      p.y += (my / len) * step;
      p.facingAngle = Math.atan2(my, mx);
      p.isMoving = true; // Actuate walking cycle, leg stride, body bob, and cloth physics

      // Clamp within map bounds
      const clamped = this.map.clampPosition(p.x, p.y);
      p.x = clamped.x;
      p.y = clamped.y;
    } else if (this.playerMoveTarget) {
      // Right-click destination MOBA pathing
      const dx = this.playerMoveTarget.x - p.x;
      const dy = this.playerMoveTarget.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        p.recalling = false;
        const step = Math.min(dist, p.moveSpeed * dt);
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
        p.facingAngle = Math.atan2(dy, dx);
        p.isMoving = true;

        const clamped = this.map.clampPosition(p.x, p.y);
        p.x = clamped.x;
        p.y = clamped.y;
      } else {
        this.playerMoveTarget = null;
      }
    }
  }

  render() {
    this.renderer.render(this);
  }

  loop(currentTime) {
    if (!this.running) return;
    const elapsed = Math.min(0.1, (currentTime - this.lastTime) / 1000);
    this.lastTime = currentTime;

    this.accumulator = (this.accumulator || 0) + elapsed;
    const FIXED_STEP = 1 / 60; // 60Hz deterministic tick rate
    let maxSteps = 4; // prevent spiral of death on background/tab switch

    while (this.accumulator >= FIXED_STEP && maxSteps > 0) {
      try {
        this.update(FIXED_STEP);
      } catch (err) {
        if (!this._updateErrorWarned) {
          console.warn('MobaGameEngine update recovered:', err);
          this._updateErrorWarned = true;
        }
      }
      this.accumulator -= FIXED_STEP;
      maxSteps--;
    }
    if (this.accumulator > FIXED_STEP * 2) {
      this.accumulator = 0;
    }

    try {
      this.render();
    } catch (err) {
      if (!this._renderErrorWarned) {
        console.warn('MobaGameEngine render recovered:', err);
        this._renderErrorWarned = true;
      }
    }

    this._animFrame = requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    this.lastTime = performance.now();
    this._animFrame = requestAnimationFrame((t) => this.loop(t));
  }
}
