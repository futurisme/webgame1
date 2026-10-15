/**
 * MOBA Turrets & Base Nexus Engine.
 * Aggro switching, minion tanking, escalating dive damage, plating gold.
 * 100% Pure JavaScript.
 */

export class TurretManager {
  constructor(map) {
    this.map = map;
    this.projectiles = [];
  }

  update(dt, engine) {
    // 1. Update Turrets
    for (const t of this.map.turrets) {
      if (!t.alive) continue;

      if (t.attackCooldown > 0) {
        t.attackCooldown -= dt;
      }

      // Check current target validity
      if (t.target) {
        const outOfRange = Math.hypot(t.target.x - t.x, t.target.y - t.y) > t.range;
        const dead = !t.target.alive;
        if (outOfRange || dead) {
          t.target = null;
          t.consecutiveHits = 0;
        }
      }

      // Acquire target if none
      if (!t.target) {
        t.target = this.acquireTurretTarget(t, engine);
        t.consecutiveHits = 0;
      }

      // Fire at target
      if (t.target && t.attackCooldown <= 0) {
        this.fireTurretShot(t, t.target, engine);
        t.attackCooldown = 1.15; // 1.15s per shot
      }
    }

    // 2. Update Base Cores
    this.updateBaseCore(this.map.blueCore, dt, engine);
    this.updateBaseCore(this.map.redCore, dt, engine);

    // 3. Update Turret Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      if (!p.target || !p.target.alive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      const dx = p.target.x - p.x;
      const dy = p.target.y - p.y;
      const dist = Math.hypot(dx, dy);
      const step = p.speed * dt;

      if (dist <= step + 12) {
        // Impact
        this.applyTurretDamage(p, engine);
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
      }
    }
  }

  acquireTurretTarget(t, engine) {
    const enemyTeam = t.team === 'blue' ? 'red' : 'blue';

    // 1. Prioritize enemy minions inside range so players can safely push
    let closestMinion = null;
    let minMinionDist = t.range;
    for (const m of engine.minionManager.minions) {
      if (m.team === enemyTeam && m.alive) {
        const d = Math.hypot(m.x - t.x, m.y - t.y);
        if (d <= minMinionDist) {
          minMinionDist = d;
          closestMinion = m;
        }
      }
    }
    if (closestMinion) return closestMinion;

    // 2. Next prioritize Marching Lord
    if (engine.isLordMarching && engine.lordTeam === enemyTeam && engine.lordEntity && engine.lordEntity.alive) {
      const d = Math.hypot(engine.lordEntity.x - t.x, engine.lordEntity.y - t.y);
      if (d <= t.range) return engine.lordEntity;
    }

    // 3. Next target enemy heroes inside range
    let closestHero = null;
    let minHeroDist = t.range;
    for (const h of engine.heroes) {
      if (h.team === enemyTeam && h.alive && !h.isConcealed) {
        const d = Math.hypot(h.x - t.x, h.y - t.y);
        if (d <= minHeroDist) {
          minHeroDist = d;
          closestHero = h;
        }
      }
    }
    return closestHero;
  }

  // Called when an enemy hero damages an allied hero inside turret range
  checkTurretAggroSwitch(victimHero, attackerHero) {
    if (!attackerHero || !attackerHero.isHero || attackerHero.team === victimHero.team) return;

    for (const t of this.map.turrets) {
      if (!t.alive || t.team !== victimHero.team) continue;
      const distToVictim = Math.hypot(victimHero.x - t.x, victimHero.y - t.y);
      const distToAttacker = Math.hypot(attackerHero.x - t.x, attackerHero.y - t.y);

      // If both are within or attacker is inside turret range, switch immediate aggro to attacker!
      if (distToAttacker <= t.range && distToVictim <= t.range + 80) {
        t.target = attackerHero;
      }
    }
  }

  fireTurretShot(t, target, engine) {
    engine.sound.playTurretFire();
    const isHero = target.isHero;
    let baseDmg = t.tier === 1 ? 380 : t.tier === 2 ? 450 : 540;

    if (isHero) {
      t.consecutiveHits = (t.consecutiveHits || 0) + 1;
      // Escalating damage against diving heroes!
      const mult = 1 + Math.min(1.2, (t.consecutiveHits - 1) * 0.3);
      baseDmg *= mult;
    }

    this.projectiles.push({
      x: t.x,
      y: t.y - 20,
      target,
      speed: 460,
      damage: Math.floor(baseDmg),
      team: t.team,
      color: t.team === 'blue' ? '#38bdf8' : '#ef4444'
    });
  }

  applyTurretDamage(p, engine) {
    const target = p.target;
    engine.particles.emit(target.x, target.y, 8, p.color, 110, 0.25);
    engine.sound.playImpact(true);

    if (target.isHero) {
      target.takeDamage(p.damage, 'phys', { name: 'Turret' }, engine);
    } else if (target.takeDamage) {
      target.takeDamage(p.damage, 'phys', { name: 'Turret' }, engine);
    } else if (target.hp !== undefined) {
      engine.minionManager.takeMinionDamage(target, p.damage, 'phys', null, engine);
    }
  }

  damageTurret(t, damage, attacker, engine) {
    if (!t.alive) return;

    t.hp -= damage;
    engine.combatTexts.addText(t.x, t.y, Math.floor(damage), 'phys');
    engine.particles.emit(t.x, t.y, 6, '#fbbf24', 80, 0.2);

    if (t.hp <= 0) {
      t.alive = false;
      t.hp = 0;
      t.target = null;

      engine.particles.triggerScreenShake(7, 0.35);
      engine.particles.emit(t.x, t.y, 35, '#ef4444', 180, 0.6);
      engine.sound.playAnnounce('turret_destroyed');

      const destroyedTeam = t.team;
      const rewardedTeam = destroyedTeam === 'blue' ? 'red' : 'blue';

      // Global team gold reward for turret destruction
      engine.heroes.forEach(h => {
        if (h.team === rewardedTeam) {
          h.addGold(200, engine);
        }
      });

      const laneName = t.lane.toUpperCase();
      const teamName = destroyedTeam === 'blue' ? 'Tim Biru' : 'Tim Merah';
      engine.addLog(`Turret ${teamName} (${laneName} Lane) hancur! Semua pemain tim lawan menerima +200 Gold!`, '#ef4444');
    }
  }

  updateBaseCore(core, dt, engine) {
    if (!core.alive) return;
    const enemyTeam = core.team === 'blue' ? 'red' : 'blue';

    // Core defense lasers
    if (!core.attackCooldown) core.attackCooldown = 0;
    core.attackCooldown -= dt;

    if (core.attackCooldown <= 0) {
      // Find closest enemy hero or minion within 280px
      let target = null;
      let minDist = 280;

      for (const m of engine.minionManager.minions) {
        if (m.team === enemyTeam && m.alive) {
          const d = Math.hypot(m.x - core.x, m.y - core.y);
          if (d < minDist) {
            minDist = d;
            target = m;
          }
        }
      }

      if (!target) {
        for (const h of engine.heroes) {
          if (h.team === enemyTeam && h.alive && !h.isConcealed) {
            const d = Math.hypot(h.x - core.x, h.y - core.y);
            if (d < minDist) {
              minDist = d;
              target = h;
            }
          }
        }
      }

      if (target) {
        this.fireTurretShot({ ...core, tier: 3 }, target, engine);
        core.attackCooldown = 1.0;
      }
    }
  }

  damageBaseCore(core, damage, attacker, engine) {
    if (!core.alive) return;

    core.hp -= damage;
    engine.combatTexts.addText(core.x, core.y, Math.floor(damage), 'phys');
    engine.particles.emit(core.x, core.y, 10, '#38bdf8', 120, 0.3);

    if (core.hp <= 0) {
      core.alive = false;
      core.hp = 0;
      engine.handleGameOver(core.team === 'blue' ? 'red' : 'blue');
    }
  }
}
