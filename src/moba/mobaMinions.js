/**
 * 5v5 MOBA Minion Wave & Siege Mechanics.
 * 3-Lane deterministic waves, melee, ranged caster, siege cannon, super minions.
 * 100% Pure JavaScript.
 */

export class MinionWaveManager {
  constructor(map) {
    this.map = map;
    this.minions = [];
    this.projectiles = [];
    this.waveInterval = 30; // 30s between waves
    this.waveTimer = 10;    // First wave at 10s
    this.waveCount = 0;
    this.nextId = 1;
  }

  update(dt, engine) {
    this.waveTimer -= dt;
    if (this.waveTimer <= 0) {
      this.spawnWaves(engine);
      this.waveTimer = this.waveInterval;
    }

    // Update active minions
    for (let i = this.minions.length - 1; i >= 0; i--) {
      const m = this.minions[i];
      if (!m.alive) {
        this.minions.splice(i, 1);
        continue;
      }
      this.updateMinion(m, dt, engine);
    }

    // Update minion projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const target = p.target;
      if (!target || !target.alive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * dt;

      if (dist <= step + 10) {
        // Hit target
        if (target.takeDamage) {
          target.takeDamage(p.damage, p.type, p.source, engine);
        }
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }
  }

  spawnWaves(engine) {
    this.waveCount++;
    const lanes = ['top', 'mid', 'bot'];
    lanes.forEach(lane => {
      // Check if team has super minions (if opposing inhibitor is dead or Lord marching)
      const blueHasSuper = this._checkHasSuper('blue', lane, engine);
      const redHasSuper = this._checkHasSuper('red', lane, engine);

      this._spawnLaneWave('blue', lane, blueHasSuper);
      this._spawnLaneWave('red', lane, redHasSuper);
    });
  }

  _checkHasSuper(team, lane, engine) {
    if (engine.isLordMarching && engine.lordTeam === team) return true;
    const enemyTeam = team === 'blue' ? 'red' : 'blue';
    const enemyInhib = this.map.turrets.find(t => t.team === enemyTeam && t.lane === lane && t.tier === 3);
    return enemyInhib && !enemyInhib.alive;
  }

  _spawnLaneWave(team, lane, isSuper = false) {
    const rawPath = this.map.lanePaths[lane];
    const path = team === 'blue' ? [...rawPath] : [...rawPath].reverse();
    const start = path[0];

    const types = isSuper
      ? ['melee', 'super', 'siege']
      : ['melee', 'caster', 'siege'];

    types.forEach((type, index) => {
      // Offset minions slightly so they march in order
      const offset = (index + 1) * 35;
      const dx = path[1].x - path[0].x;
      const dy = path[1].y - path[0].y;
      const len = Math.hypot(dx, dy) || 1;
      const posX = start.x + (dx / len) * offset;
      const posY = start.y + (dy / len) * offset;

      let hp = 750;
      let atk = 42;
      let range = 65;
      let radius = 16;
      let gold = 50;
      let exp = 65;

      if (type === 'caster') {
        hp = 500;
        atk = 68;
        range = 220;
        gold = 45;
        exp = 55;
      } else if (type === 'siege') {
        hp = 1150;
        atk = 90;
        range = 240;
        gold = 85; // Big gold bonus from siege cannon!
        exp = 110;
        radius = 18;
      } else if (type === 'super') {
        hp = 2600;
        atk = 145;
        range = 80;
        radius = 22;
        gold = 100;
        exp = 130;
      }

      this.minions.push({
        id: this.nextId++,
        team,
        lane,
        type,
        x: posX,
        y: posY,
        hp,
        maxHp: hp,
        atk,
        range,
        radius,
        gold,
        exp,
        speed: 135,
        path,
        pathIndex: 1,
        target: null,
        attackCooldown: index * 0.2, // Stagger initial attacks
        alive: true
      });
    });
  }

  updateMinion(m, dt, engine) {
    if (m.attackCooldown > 0) {
      m.attackCooldown -= dt;
    }

    // 1. Target Acquisition
    if (!m.target || !m.target.alive || Math.hypot(m.target.x - m.x, m.target.y - m.y) > m.range + 80) {
      m.target = this.findTarget(m, engine);
    }

    // 2. Attack or Move
    if (m.target && m.target.alive) {
      const dist = Math.hypot(m.target.x - m.x, m.target.y - m.y);
      if (dist <= m.range) {
        // In range, attack
        if (m.attackCooldown <= 0) {
          this.performAttack(m, m.target, engine);
          m.attackCooldown = 1.1;
        }
      } else {
        // Move towards target
        const dx = m.target.x - m.x;
        const dy = m.target.y - m.y;
        m.x += (dx / dist) * m.speed * dt;
        m.y += (dy / dist) * m.speed * dt;
      }
    } else {
      // Advance along lane waypoints
      this.advanceWaypoint(m, dt);
    }
  }

  advanceWaypoint(m, dt) {
    if (m.pathIndex >= m.path.length) return;
    const targetPt = m.path[m.pathIndex];
    const dx = targetPt.x - m.x;
    const dy = targetPt.y - m.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 40) {
      m.pathIndex++;
      if (m.pathIndex >= m.path.length) return;
    } else {
      m.x += (dx / dist) * m.speed * dt;
      m.y += (dy / dist) * m.speed * dt;
    }
  }

  findTarget(m, engine) {
    const enemyTeam = m.team === 'blue' ? 'red' : 'blue';
    const agroRange = 260;
    let closest = null;
    let minDist = agroRange;

    // Prioritize enemy minions
    for (const enemyM of this.minions) {
      if (enemyM.team === enemyTeam && enemyM.alive) {
        const d = Math.hypot(enemyM.x - m.x, enemyM.y - m.y);
        if (d < minDist) {
          minDist = d;
          closest = enemyM;
        }
      }
    }
    if (closest) return closest;

    // Next prioritize enemy turrets
    for (const t of this.map.turrets) {
      if (t.team === enemyTeam && t.alive) {
        const d = Math.hypot(t.x - m.x, t.y - m.y);
        if (d < minDist + 60) {
          minDist = d;
          closest = t;
        }
      }
    }
    if (closest) return closest;

    // Next prioritize enemy heroes
    for (const h of engine.heroes) {
      if (h.team === enemyTeam && h.alive && !h.isConcealed) {
        const d = Math.hypot(h.x - m.x, h.y - m.y);
        if (d < minDist) {
          minDist = d;
          closest = h;
        }
      }
    }
    if (closest) return closest;

    // Next prioritize enemy Base Core
    const enemyCore = enemyTeam === 'blue' ? this.map.blueCore : this.map.redCore;
    if (enemyCore.alive) {
      const d = Math.hypot(enemyCore.x - m.x, enemyCore.y - m.y);
      if (d < 300) return enemyCore;
    }

    return null;
  }

  performAttack(m, target, engine) {
    if (m.type === 'melee' || m.type === 'super') {
      // Instant melee damage
      engine.particles.emit(target.x, target.y, 4, '#fbbf24', 60, 0.2);
      if (target.takeDamage) {
        target.takeDamage(m.atk, 'phys', m, engine);
      }
    } else {
      // Fire ranged projectile
      this.projectiles.push({
        x: m.x,
        y: m.y,
        speed: 360,
        damage: m.atk,
        type: m.type === 'caster' ? 'magic' : 'phys',
        target,
        source: m
      });
    }
  }

  takeMinionDamage(minion, damage, damageType, attacker, engine) {
    minion.hp -= damage;
    engine.combatTexts.addText(minion.x, minion.y, Math.floor(damage), damageType);

    if (minion.hp <= 0 && minion.alive) {
      minion.alive = false;
      engine.particles.emit(minion.x, minion.y, 10, '#f59e0b', 90, 0.35);

      // Reward gold and exp
      if (attacker && attacker.isHero) {
        // Last hit bonus: 150% reward!
        const bonusGold = Math.floor(minion.gold * 1.5);
        attacker.addGold(bonusGold, engine);
        attacker.addExp(Math.floor(minion.exp * 1.3), engine);
        engine.particles.emit(attacker.x, attacker.y, 6, '#eab308', 70, 0.3);
      } else {
        // Area bounty for nearby allied heroes
        engine.heroes.forEach(h => {
          if (h.team !== minion.team && h.alive && Math.hypot(h.x - minion.x, h.y - minion.y) < 420) {
            h.addGold(minion.gold, engine);
            h.addExp(minion.exp, engine);
          }
        });
      }
    }
  }
}
