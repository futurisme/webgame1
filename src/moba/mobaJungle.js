/**
 * MOBA Jungle Camps, Buff Monsters, Turtle & Sanctuary Lord Bosses.
 * 100% Pure JavaScript.
 */

export class JungleManager {
  constructor(map) {
    this.map = map;
    this.camps = this._initCamps();
    this.turtleSpawnTimer = 120; // 2 minutes (120s)
    this.turtleAlive = false;
    this.turtleEntity = null;

    this.lordSpawnTimer = 480;   // 8 minutes (480s)
    this.lordAlive = false;
    this.lordEntity = null;
  }

  _initCamps() {
    return [
      // --- Blue Team Jungle ---
      {
        id: 'camp_blue_fiend_blue',
        name: 'Blue Fiend',
        type: 'blue_buff',
        x: 1050,
        y: 2000,
        spawnX: 1050,
        spawnY: 2000,
        hp: 3400,
        maxHp: 3400,
        atk: 90,
        range: 80,
        radius: 28,
        alive: true,
        respawnTimer: 0,
        respawnDelay: 90,
        gold: 90,
        exp: 130,
        color: '#38bdf8'
      },
      {
        id: 'camp_red_beast_blue',
        name: 'Molten Beast',
        type: 'red_buff',
        x: 1350,
        y: 2450,
        spawnX: 1350,
        spawnY: 2450,
        hp: 3400,
        maxHp: 3400,
        atk: 95,
        range: 80,
        radius: 28,
        alive: true,
        respawnTimer: 0,
        respawnDelay: 90,
        gold: 90,
        exp: 130,
        color: '#f97316'
      },
      {
        id: 'camp_crammer_blue',
        name: 'Rock Beetle',
        type: 'minor',
        x: 520,
        y: 1050,
        spawnX: 520,
        spawnY: 1050,
        hp: 2200,
        maxHp: 2200,
        atk: 65,
        range: 75,
        radius: 22,
        alive: true,
        respawnTimer: 0,
        respawnDelay: 70,
        gold: 65,
        exp: 95,
        color: '#a3e635'
      },

      // --- Red Team Jungle ---
      {
        id: 'camp_blue_fiend_red',
        name: 'Blue Fiend',
        type: 'blue_buff',
        x: 2150,
        y: 1200,
        spawnX: 2150,
        spawnY: 1200,
        hp: 3400,
        maxHp: 3400,
        atk: 90,
        range: 80,
        radius: 28,
        alive: true,
        respawnTimer: 0,
        respawnDelay: 90,
        gold: 90,
        exp: 130,
        color: '#38bdf8'
      },
      {
        id: 'camp_red_beast_red',
        name: 'Molten Beast',
        type: 'red_buff',
        x: 1850,
        y: 750,
        spawnX: 1850,
        spawnY: 750,
        hp: 3400,
        maxHp: 3400,
        atk: 95,
        range: 80,
        radius: 28,
        alive: true,
        respawnTimer: 0,
        respawnDelay: 90,
        gold: 90,
        exp: 130,
        color: '#f97316'
      },
      {
        id: 'camp_crammer_red',
        name: 'Rock Beetle',
        type: 'minor',
        x: 2680,
        y: 2150,
        spawnX: 2680,
        spawnY: 2150,
        hp: 2200,
        maxHp: 2200,
        atk: 65,
        range: 75,
        radius: 22,
        alive: true,
        respawnTimer: 0,
        respawnDelay: 70,
        gold: 65,
        exp: 95,
        color: '#a3e635'
      }
    ];
  }

  update(dt, engine) {
    const gameTime = engine.gameTime;

    // 1. Update Regular Camps
    for (const c of this.camps) {
      if (!c.alive) {
        c.respawnTimer -= dt;
        if (c.respawnTimer <= 0) {
          c.alive = true;
          c.hp = c.maxHp;
          c.x = c.spawnX;
          c.y = c.spawnY;
          c.target = null;
        }
      } else {
        this.updateCampEntity(c, dt, engine);
      }
    }

    // 2. Update Turtle (2:00 until 8:00)
    if (gameTime < 480) {
      if (!this.turtleAlive) {
        this.turtleSpawnTimer -= dt;
        if (this.turtleSpawnTimer <= 0) {
          this.spawnTurtle(engine);
        }
      } else if (this.turtleEntity && this.turtleEntity.alive) {
        this.updateBossEntity(this.turtleEntity, dt, engine);
      }
    } else {
      // 8:00+ Turtle despawns if alive to make room for Lord
      if (this.turtleAlive) {
        this.turtleAlive = false;
        this.turtleEntity = null;
      }

      // 3. Update Lord
      if (!this.lordAlive && !engine.isLordMarching) {
        this.lordSpawnTimer -= dt;
        if (this.lordSpawnTimer <= 0) {
          this.spawnLord(engine);
        }
      } else if (this.lordEntity && this.lordEntity.alive) {
        this.updateBossEntity(this.lordEntity, dt, engine);
      }
    }

    // 4. Update Marching Lord if active
    if (engine.isLordMarching && engine.lordEntity && engine.lordEntity.alive) {
      this.updateMarchingLord(engine.lordEntity, dt, engine);
    }
  }

  spawnTurtle(engine) {
    this.turtleAlive = true;
    this.turtleEntity = {
      id: 'boss_turtle',
      name: 'Cryoturtle',
      type: 'turtle',
      x: 1250,
      y: 1100,
      spawnX: 1250,
      spawnY: 1100,
      hp: 7500,
      maxHp: 7500,
      atk: 140,
      range: 90,
      radius: 36,
      alive: true,
      gold: 140,
      exp: 180,
      color: '#06b6d4',
      attackCooldown: 0,
      target: null
    };
    engine.addLog('Cryoturtle telah muncul di sungai! Rebut untuk buff shield dan gold tim!', '#06b6d4');
  }

  spawnLord(engine) {
    this.lordAlive = true;
    this.lordEntity = {
      id: 'boss_lord',
      name: 'Sanctuary Lord',
      type: 'lord',
      x: 1950,
      y: 2100,
      spawnX: 1950,
      spawnY: 2100,
      hp: 13500,
      maxHp: 13500,
      atk: 220,
      range: 120,
      radius: 46,
      alive: true,
      gold: 240,
      exp: 300,
      color: '#eab308',
      attackCooldown: 0,
      target: null
    };
    engine.addLog('Sanctuary Lord telah bangkit di sungai! Kalahkan untuk memanggil Lord berjalan!', '#eab308');
  }

  updateCampEntity(c, dt, engine) {
    if (c.attackCooldown) c.attackCooldown -= dt;

    // Check if target is out of leash range (220px)
    if (c.target) {
      const distFromSpawn = Math.hypot(c.x - c.spawnX, c.y - c.spawnY);
      const distToTarget = Math.hypot(c.target.x - c.x, c.target.y - c.y);

      if (distFromSpawn > 220 || distToTarget > 260 || !c.target.alive) {
        // Leash reset: return to spawn and rapidly regen
        c.target = null;
      }
    }

    if (!c.target) {
      // Walk back to spawn
      const dx = c.spawnX - c.x;
      const dy = c.spawnY - c.y;
      const d = Math.hypot(dx, dy);
      if (d > 10) {
        c.x += (dx / d) * 120 * dt;
        c.y += (dy / d) * 120 * dt;
        c.hp = Math.min(c.maxHp, c.hp + c.maxHp * 0.2 * dt);
      }
      return;
    }

    // Move or attack target
    const dist = Math.hypot(c.target.x - c.x, c.target.y - c.y);
    if (dist <= c.range) {
      if (c.attackCooldown <= 0) {
        c.target.takeDamage(c.atk, 'phys', c, engine);
        engine.particles.emit(c.target.x, c.target.y, 4, c.color, 70, 0.2);
        c.attackCooldown = 1.2;
      }
    } else {
      const dx = c.target.x - c.x;
      const dy = c.target.y - c.y;
      c.x += (dx / dist) * 110 * dt;
      c.y += (dy / dist) * 110 * dt;
    }
  }

  updateBossEntity(boss, dt, engine) {
    if (boss.attackCooldown) boss.attackCooldown -= dt;

    if (boss.target) {
      const distFromSpawn = Math.hypot(boss.x - boss.spawnX, boss.y - boss.spawnY);
      const distToTarget = Math.hypot(boss.target.x - boss.x, boss.target.y - boss.y);

      if (distFromSpawn > 320 || distToTarget > 360 || !boss.target.alive) {
        boss.target = null;
      }
    }

    if (!boss.target) {
      const dx = boss.spawnX - boss.x;
      const dy = boss.spawnY - boss.y;
      const d = Math.hypot(dx, dy);
      if (d > 10) {
        boss.x += (dx / d) * 100 * dt;
        boss.y += (dy / d) * 100 * dt;
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * 0.15 * dt);
      }
      return;
    }

    const dist = Math.hypot(boss.target.x - boss.x, boss.target.y - boss.y);
    if (dist <= boss.range) {
      if (boss.attackCooldown <= 0) {
        // Boss AOE ground slam
        engine.particles.triggerScreenShake(4, 0.2);
        engine.particles.emitRing(boss.x, boss.y, 140, boss.color, 0.35);

        // Damage all nearby enemy heroes/minions within 140px
        engine.heroes.forEach(h => {
          if (h.alive && Math.hypot(h.x - boss.x, h.y - boss.y) < 140) {
            h.takeDamage(boss.atk, 'phys', boss, engine);
          }
        });
        boss.attackCooldown = 1.4;
      }
    } else {
      const dx = boss.target.x - boss.x;
      const dy = boss.target.y - boss.y;
      boss.x += (dx / dist) * 100 * dt;
      boss.y += (dy / dist) * 100 * dt;
    }
  }

  updateMarchingLord(lord, dt, engine) {
    if (!lord.alive) return;
    if (lord.attackCooldown) lord.attackCooldown -= dt;

    const enemyTeam = lord.team === 'blue' ? 'red' : 'blue';

    // 1. Check for enemy structures or heroes in range
    let target = null;
    let minDist = 180;

    // Check enemy turrets
    for (const t of this.map.turrets) {
      if (t.team === enemyTeam && t.alive) {
        const d = Math.hypot(t.x - lord.x, t.y - lord.y);
        if (d < minDist) {
          minDist = d;
          target = t;
        }
      }
    }

    // Check enemy core
    const enemyCore = enemyTeam === 'blue' ? this.map.blueCore : this.map.redCore;
    if (enemyCore.alive && Math.hypot(enemyCore.x - lord.x, enemyCore.y - lord.y) < 220) {
      target = enemyCore;
    }

    if (target) {
      // Smash structure
      if (lord.attackCooldown <= 0) {
        engine.particles.triggerScreenShake(8, 0.3);
        engine.particles.emit(target.x, target.y, 20, '#eab308', 140, 0.3);
        if (target.takeDamage) {
          target.takeDamage(380, 'true', lord, engine);
        } else if (target.tier) {
          engine.turretManager.damageTurret(target, 450, lord, engine);
        } else if (target === enemyCore) {
          engine.turretManager.damageBaseCore(enemyCore, 400, lord, engine);
        }
        lord.attackCooldown = 1.3;
      }
    } else {
      // March down lane path
      if (lord.pathIndex < lord.path.length) {
        const pt = lord.path[lord.pathIndex];
        const dx = pt.x - lord.x;
        const dy = pt.y - lord.y;
        const d = Math.hypot(dx, dy);

        if (d < 45) {
          lord.pathIndex++;
        } else {
          lord.x += (dx / d) * lord.speed * dt;
          lord.y += (dy / d) * lord.speed * dt;
        }
      }
    }
  }

  damageCamp(camp, damage, damageType, attacker, engine) {
    if (!camp.alive) return;

    camp.hp -= damage;
    camp.target = attacker;
    engine.combatTexts.addText(camp.x, camp.y, Math.floor(damage), damageType);
    engine.particles.emit(camp.x, camp.y, 5, camp.color, 90, 0.2);

    if (camp.hp <= 0) {
      camp.alive = false;
      camp.hp = 0;
      camp.respawnTimer = camp.respawnDelay;

      engine.particles.emit(camp.x, camp.y, 25, camp.color, 160, 0.45);

      if (attacker && attacker.isHero) {
        attacker.addGold(camp.gold, engine);
        attacker.addExp(camp.exp, engine);

        // Apply Buffs
        if (camp.type === 'blue_buff') {
          attacker.applyBuff('blue', 75);
          engine.addLog(`${attacker.name} mengeliminasi Blue Fiend & mendapatkan Blue Buff!`, '#38bdf8');
        } else if (camp.type === 'red_buff') {
          attacker.applyBuff('red', 75);
          engine.addLog(`${attacker.name} mengeliminasi Molten Beast & mendapatkan Red Buff!`, '#f97316');
        }
      }
    }
  }

  damageBoss(boss, damage, damageType, attacker, engine) {
    if (!boss.alive) return;

    boss.hp -= damage;
    boss.target = attacker;
    engine.combatTexts.addText(boss.x, boss.y, Math.floor(damage), damageType);

    if (boss.hp <= 0) {
      boss.alive = false;
      boss.hp = 0;

      const slayingTeam = attacker && attacker.isHero ? attacker.team : 'blue';

      if (boss.type === 'turtle') {
        this.turtleAlive = false;
        this.turtleSpawnTimer = 120; // Respawns in 2 minutes
        engine.sound.playAnnounce('turtle_slain');

        // Grant team gold, exp, and shield
        engine.heroes.forEach(h => {
          if (h.team === slayingTeam && h.alive) {
            h.addGold(150, engine);
            h.addExp(200, engine);
            h.shield = 400 + h.level * 40;
            h.shieldDuration = 45;
          }
        });

        const teamLabel = slayingTeam === 'blue' ? 'Tim Biru' : 'Tim Merah';
        engine.addLog(`${teamLabel} telah mengeliminasi Cryoturtle! Mendapatkan shield & gold!`, '#06b6d4');
      } else if (boss.type === 'lord') {
        this.lordAlive = false;
        this.lordSpawnTimer = 240;
        engine.sound.playAnnounce('lord_summoned');

        // Summon Marching Lord!
        this.summonMarchingLord(slayingTeam, engine);
      }
    }
  }

  summonMarchingLord(team, engine) {
    engine.isLordMarching = true;
    engine.lordTeam = team;

    // Pick lane with fewest enemy turrets alive
    const enemyTeam = team === 'blue' ? 'red' : 'blue';
    const laneScores = { top: 0, mid: 0, bot: 0 };
    for (const t of this.map.turrets) {
      if (t.team === enemyTeam && t.alive) {
        laneScores[t.lane]++;
      }
    }
    let chosenLane = 'mid';
    let minTurrets = 99;
    ['mid', 'top', 'bot'].forEach(l => {
      if (laneScores[l] < minTurrets) {
        minTurrets = laneScores[l];
        chosenLane = l;
      }
    });

    const rawPath = this.map.lanePaths[chosenLane];
    const path = team === 'blue' ? [...rawPath] : [...rawPath].reverse();

    engine.lordEntity = {
      id: 'marching_lord',
      name: 'Evolved Sanctuary Lord',
      type: 'marching_lord',
      team,
      lane: chosenLane,
      path,
      pathIndex: 1,
      x: path[0].x,
      y: path[0].y,
      hp: 12000,
      maxHp: 12000,
      atk: 320,
      speed: 90,
      radius: 44,
      alive: true,
      attackCooldown: 0,
      color: '#eab308'
    };

    const teamLabel = team === 'blue' ? 'Tim Biru' : 'Tim Merah';
    engine.addLog(`${teamLabel} telah memanggil Sanctuary Lord! Lord berbaris di ${chosenLane.toUpperCase()} Lane!`, '#eab308');
  }
}
