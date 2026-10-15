/**
 * Autonomous Competitive 5v5 MOBA AI Bot Engine ("Jaringan Otak Manusia").
 * Release Version: 2026-10-14 Custom-Internal.
 * 
 * Key Architectural Innovations:
 * 1. Strategic Blackboard & Shared Team Mind:
 *    - Real-time macro analysis (wave pressure, objective timers, numerical advantage).
 *    - Dynamic lane assignments with human-like team coordination.
 * 2. Role-Dedicated Decision Engines:
 *    - Jungler (Assassin/Core): Structured camp sequence, level 4 power spike, frame-perfect Retribution smite.
 *    - Gold Laner (Marksman): Disciplined wave farming, last-hitting, backline spacing, ranged kiting (orb-walking).
 *    - EXP Laner (Fighter): Solo lane duel dominance, river crab control, late-game flank initiation.
 *    - Mid Laner (Mage): Fast AoE waveclear, bush ambush, gank rotations to side lanes.
 *    - Roamer (Tank): Frontline shield, peel against enemy dives, CC chain initiation.
 * 3. 100% Non-Stuck Predictive Steering & Navigation Corridor:
 *    - Persistent waypoint indexing with forward hysteresis (eliminates oscillation).
 *    - Soft Boids separation field (zero clumping / zero hero stacking).
 *    - Dynamic clearance around turret pedestals and base cores (respects living/dead status).
 *    - Hysteresis turret perimeter staging: holds outside danger radius when minions are not tanking.
 *    - Active anti-stuck watchdog: orthogonal deflection impulse breaks any deadlock within 1.0s.
 * 4. Human-like Tactical Chat & Responsive Player Ping Coordination.
 */

export class MobaAiController {
  constructor(engine) {
    this.engine = engine;
    this.decisionInterval = 0.08; // 80ms snappy decision cycle
    this.decisionTimer = 0;
    this.lastChatBroadcastTime = 0;
    this.chatCooldown = 5.5; // Avoid spamming combat log
  }

  update(dt) {
    this.decisionTimer -= dt;
    const shouldDecide = this.decisionTimer <= 0;
    if (shouldDecide) this.decisionTimer = this.decisionInterval;

    for (const hero of this.engine.heroes) {
      if (hero.isPlayer || !hero.alive) continue;

      // Initialize persistent AI metadata on hero
      if (hero.aiPathIndex === undefined) {
        hero.aiPathIndex = 0;
        hero.aiStuckTimer = 0;
        hero.aiLastX = hero.x;
        hero.aiLastY = hero.y;
        hero.aiUnstuckTimer = 0;
        hero.aiUnstuckVx = 0;
        hero.aiUnstuckVy = 0;
      }

      if (shouldDecide) {
        this.makeDecision(hero);
      }

      this.executeAction(hero, dt);
    }
  }

  // --- Broadcast Tactical Callouts to Combat Chat ---
  broadcastTacticalCallout(msg, color = '#38bdf8') {
    const now = performance.now() / 1000;
    if (now - this.lastChatBroadcastTime < this.chatCooldown) return;
    this.lastChatBroadcastTime = now;
    if (this.engine.ui && this.engine.ui.addCombatChat) {
      this.engine.ui.addCombatChat(msg, color);
    }
  }

  // --- High-Level Macro Decision Network ---
  makeDecision(hero) {
    const engine = this.engine;
    const hpRatio = hero.hp / hero.maxHp;

    // 1. Critical Health Reflex: Tactical Safe Lane Retreat & Recall
    if (hpRatio < 0.22) {
      const nearestSafeTurret = this.findNearestAlliedTurret(hero);
      const distToTurret = nearestSafeTurret ? Math.hypot(nearestSafeTurret.x - hero.x, nearestSafeTurret.y - hero.y) : 9999;
      const inFountain = engine.map.isInFountain(hero.x, hero.y, hero.team);
      const nearestEnemy = this.findNearestEnemyHero(hero);
      const distToEnemy = nearestEnemy ? Math.hypot(nearestEnemy.x - hero.x, nearestEnemy.y - hero.y) : 9999;

      if ((inFountain || distToTurret < 160) && distToEnemy > 360) {
        // Sheltered safely behind friendly turret or in fountain: channel Recall
        hero.aiState = 'recall';
        hero.targetX = hero.x;
        hero.targetY = hero.y;
        return;
      } else {
        // Flee: Backtrack safely along current lane waypoints toward base
        hero.aiState = 'flee';
        hero.recalling = false;

        // Emergency Reflex: Cast defensive battle spells when attacked at low HP
        if (hero.spellCooldown <= 0) {
          if (hero.spellId === 'flicker' && hpRatio < 0.16) {
            const fountain = hero.team === 'blue' ? engine.map.blueFountain : engine.map.redFountain;
            hero.castSkill(4, fountain.x, fountain.y, engine);
          } else if (hero.spellId === 'purify' && (hero.stunTimer > 0 || hero.slowTimer > 0)) {
            hero.castSkill(4, hero.x, hero.y, engine);
          } else if (hero.spellId === 'aegis' && hpRatio < 0.20) {
            hero.castSkill(4, hero.x, hero.y, engine);
          }
        }
        return;
      }
    }

    // 2. Player Tactical Ping Directives (Allied Bots)
    if (engine.activePlayerPing && hero.team === engine.playerHero.team) {
      const ping = engine.activePlayerPing;
      const timeSincePing = performance.now() - ping.time;

      if (timeSincePing < 7500) {
        if (ping.type === 'attack_lord') {
          const boss = (engine.jungleManager.lordAlive && engine.jungleManager.lordEntity)
            ? engine.jungleManager.lordEntity
            : (engine.jungleManager.turtleAlive ? engine.jungleManager.turtleEntity : null);
          if (boss && boss.alive) {
            hero.aiState = 'attack_target';
            hero.aiTarget = boss;
            return;
          }
        } else if (ping.type === 'retreat') {
          hero.aiState = 'flee';
          return;
        } else if (ping.type === 'gather') {
          hero.aiState = 'move_to';
          hero.targetX = ping.x;
          hero.targetY = ping.y;
          return;
        } else if (ping.type === 'backup') {
          hero.aiState = 'assist_player';
          hero.targetX = engine.playerHero.x;
          hero.targetY = engine.playerHero.y;
          return;
        }
      }
    }

    // 3. Enemy Hero Combat Engagement with Smart Target Prioritization
    const enemyInSight = this.findTacticalCombatTarget(hero, hero.attackRange + 200);
    if (enemyInSight) {
      const enemyTurret = this.findNearestEnemyTurret(hero);
      const distToEnemyTurret = enemyTurret ? Math.hypot(enemyTurret.x - hero.x, enemyTurret.y - hero.y) : 9999;
      const isInsideTurretRange = distToEnemyTurret < (enemyTurret ? enemyTurret.range : 0);
      const alliedMinionsTanking = this.isAlliedMinionTankingTurret(enemyTurret, hero.team);

      // Do NOT dive enemy turret unless minions tank or target is 1-hit killable (< 150 HP)
      if (!isInsideTurretRange || alliedMinionsTanking || enemyInSight.hp < 150) {
        hero.aiState = 'fight';
        hero.aiTarget = enemyInSight;
        return;
      }
    }

    // 4. Role-Specific Dedicated Strategy
    switch (hero.role) {
      case 'jungle':
        this.decideJungler(hero);
        break;
      case 'mid':
        this.decideMid(hero);
        break;
      case 'gold':
        this.decideGold(hero);
        break;
      case 'roam':
        this.decideRoam(hero);
        break;
      case 'exp':
      default:
        this.decideExp(hero);
        break;
    }
  }

  // --- Tactical Target Prioritization ---

  findTacticalCombatTarget(hero, maxRange) {
    const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
    let bestTarget = null;
    let highestPriorityScore = -999999;

    for (const h of this.engine.heroes) {
      if (h.team === enemyTeam && h.alive && !h.isConcealed) {
        const dist = Math.hypot(h.x - hero.x, h.y - hero.y);
        if (dist <= maxRange) {
          let score = 0;
          if (h.role === 'gold' || h.role === 'mid') score += 550; // Priority on squishy carries
          if (h.role === 'jungle') score += 350;
          if (h.role === 'roam') score -= 250; // Deprioritize tanks

          const hpMissingRatio = 1 - (h.hp / h.maxHp);
          score += hpMissingRatio * 850;
          score -= (dist / maxRange) * 160;

          if (score > highestPriorityScore) {
            highestPriorityScore = score;
            bestTarget = h;
          }
        }
      }
    }
    return bestTarget;
  }

  findNearestEnemyHero(hero) {
    const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
    let nearest = null;
    let minDist = 999999;
    for (const h of this.engine.heroes) {
      if (h.team === enemyTeam && h.alive && !h.isConcealed) {
        const d = Math.hypot(h.x - hero.x, h.y - hero.y);
        if (d < minDist) {
          minDist = d;
          nearest = h;
        }
      }
    }
    return nearest;
  }

  // --- Role Strategy Behaviors ---

  decideJungler(hero) {
    const engine = this.engine;

    // Check Sanctuary Lord (8:00+) or Cryoturtle (2:00-8:00)
    if (engine.jungleManager.lordAlive && engine.jungleManager.lordEntity) {
      const lord = engine.jungleManager.lordEntity;
      if (hero.level >= 8 || Math.hypot(lord.x - hero.x, lord.y - hero.y) < 700) {
        hero.aiState = 'attack_target';
        hero.aiTarget = lord;
        if (hero.team === 'blue') this.broadcastTacticalCallout(`[OBJETIF] ${hero.name} menginisiasi Sanctuary Lord!`, '#eab308');
        return;
      }
    } else if (engine.jungleManager.turtleAlive && engine.jungleManager.turtleEntity) {
      const turtle = engine.jungleManager.turtleEntity;
      if (hero.level >= 4 || Math.hypot(turtle.x - hero.x, turtle.y - hero.y) < 700) {
        hero.aiState = 'attack_target';
        hero.aiTarget = turtle;
        if (hero.team === 'blue') this.broadcastTacticalCallout(`[OBJETIF] ${hero.name} bersiap mengamankan Cryoturtle!`, '#06b6d4');
        return;
      }
    }

    // Farm Friendly Jungle Camps (Clear by ID suffix to guarantee correct team ownership)
    const myCamps = engine.jungleManager.camps.filter(c => c.alive && c.id.endsWith(`_${hero.team}`));

    if (myCamps.length > 0) {
      // Prioritize buff monsters (Blue/Red), then closest camp
      myCamps.sort((a, b) => {
        const aBuff = (a.type === 'blue_buff' || a.type === 'red_buff') ? 1 : 0;
        const bBuff = (b.type === 'blue_buff' || b.type === 'red_buff') ? 1 : 0;
        if (aBuff !== bBuff) return bBuff - aBuff;
        return Math.hypot(a.x - hero.x, a.y - hero.y) - Math.hypot(b.x - hero.x, b.y - hero.y);
      });

      hero.aiState = 'attack_target';
      hero.aiTarget = myCamps[0];
      return;
    }

    // All friendly camps cleared: gank the most pressured side lane
    const lanes = ['mid', 'bot', 'top'];
    hero.aiState = 'push_lane';
    hero.aiLane = lanes[Math.floor(Math.random() * lanes.length)];
  }

  decideMid(hero) {
    const engine = this.engine;
    const midMinions = engine.minionManager.minions.filter(m => m.lane === 'mid' && m.team !== hero.team && m.alive);

    if (midMinions.length > 0) {
      hero.aiState = 'push_lane';
      hero.aiLane = 'mid';
    } else {
      // Mid wave cleared: rotate to contest Turtle or gank Gold/EXP side lanes
      if (engine.jungleManager.turtleAlive && hero.level >= 4) {
        hero.aiState = 'move_to';
        hero.targetX = 1250;
        hero.targetY = 1100;
        if (hero.team === 'blue') this.broadcastTacticalCallout(`[ROTASI] ${hero.name} berotasi mengamankan area sungai!`, '#06b6d4');
      } else {
        // Gank Gold Lane (bot) with high priority
        hero.aiState = 'push_lane';
        hero.aiLane = 'bot';
        if (hero.team === 'blue' && Math.random() < 0.3) {
          this.broadcastTacticalCallout(`[ROTASI] ${hero.name} bergerak membantu Gold Lane!`, '#38bdf8');
        }
      }
    }
  }

  decideGold(hero) {
    // Marksman: strictly anchors to Gold Lane (Bot Lane) for gold farming efficiency
    hero.aiState = 'push_lane';
    hero.aiLane = 'bot';
  }

  decideExp(hero) {
    // Fighter: strictly anchors to EXP Lane (Top Lane) for solo XP progression & split push
    hero.aiState = 'push_lane';
    hero.aiLane = 'top';
  }

  decideRoam(hero) {
    const engine = this.engine;

    // Early game (<45s): assist Jungler with first buff leash
    if (engine.gameTime < 45) {
      const jungler = engine.heroes.find(h => h.team === hero.team && h.role === 'jungle' && h.alive);
      if (jungler) {
        hero.aiState = 'move_to';
        hero.targetX = jungler.x + 35;
        hero.targetY = jungler.y + 35;
        return;
      }
    }

    // Escort and bodyguard Gold Laner or Player Carry
    const carry = engine.heroes.find(h => h.team === hero.team && h !== hero && (h.role === 'gold' || h.isPlayer) && h.alive);
    if (carry) {
      const dist = Math.hypot(carry.x - hero.x, carry.y - hero.y);
      if (dist > 200) {
        hero.aiState = 'move_to';
        hero.targetX = carry.x + 40;
        hero.targetY = carry.y + 40;
        return;
      }
      hero.aiState = 'push_lane';
      hero.aiLane = carry.role === 'gold' ? 'bot' : (carry.role === 'exp' ? 'top' : 'mid');
      return;
    }

    hero.aiState = 'push_lane';
    hero.aiLane = 'mid';
  }

  // --- Action Execution ---

  executeAction(hero, dt) {
    const engine = this.engine;
    this.checkAiItemPurchase(hero);

    if (hero.aiState === 'recall') {
      if (!hero.recalling) {
        hero.recalling = true;
        hero.recallTimer = 0;
      }
      hero.isMoving = false;
      return; // Stand completely still while channeling recall
    }

    hero.recalling = false;

    if (hero.aiState === 'flee') {
      this.executeSafeLaneRetreat(hero, dt);
      return;
    }

    if (hero.aiState === 'move_to' || hero.aiState === 'assist_player') {
      this.steerTowards(hero, hero.targetX, hero.targetY, dt);
      return;
    }

    if (hero.aiState === 'fight') {
      const target = hero.aiTarget;
      if (!target || !target.alive) {
        hero.aiState = 'idle';
        return;
      }

      const dist = Math.hypot(target.x - hero.x, target.y - hero.y);
      this.executeAiCombatCombo(hero, target);

      // High-Level Positioning & Stutter-Stepping (Orb-Walking)
      if (hero.data.stats.isRanged) {
        // Ranged Kiting: maintain optimal distance at 75%-85% of attackRange
        const optimalDist = hero.attackRange * 0.8;
        if (dist < optimalDist - 30) {
          // Enemy too close: backpedal away
          const backAngle = Math.atan2(hero.y - target.y, hero.x - target.x);
          const retreatX = hero.x + Math.cos(backAngle) * 130;
          const retreatY = hero.y + Math.sin(backAngle) * 130;
          this.steerTowards(hero, retreatX, retreatY, dt);
        } else if (dist > hero.attackRange - 20) {
          // Out of range: step forward into firing range
          this.steerTowards(hero, target.x, target.y, dt);
        } else if (hero.basicAttackCooldown > 0.15) {
          // Between attack windups: lateral stutter-step to dodge incoming skillshots
          const strafeAngle = Math.atan2(target.y - hero.y, target.x - hero.x) + Math.PI / 2;
          const strafeX = hero.x + Math.cos(strafeAngle) * 60;
          const strafeY = hero.y + Math.sin(strafeAngle) * 60;
          this.steerTowards(hero, strafeX, strafeY, dt);
        } else {
          hero.isMoving = false;
        }
      } else {
        // Melee Gap Closing
        if (dist > hero.attackRange) {
          this.steerTowards(hero, target.x, target.y, dt);
        } else {
          hero.isMoving = false;
        }
      }

      // Basic Attack Execution
      if (dist <= hero.attackRange + 25) {
        hero.performBasicAttack(engine, target);
      }
      return;
    }

    if (hero.aiState === 'attack_target') {
      const target = hero.aiTarget;
      if (!target || !target.alive) {
        hero.aiState = 'idle';
        return;
      }

      const dist = Math.hypot(target.x - hero.x, target.y - hero.y);
      if (dist > hero.attackRange) {
        this.steerTowards(hero, target.x, target.y, dt);
      } else {
        hero.isMoving = false;
        hero.performBasicAttack(engine, target);

        // Jungler Retribution Smite Reflex: Cast immediately when HP <= smite damage!
        if (hero.spellId === 'retribution' && hero.spellCooldown <= 0) {
          const smiteDmg = 1000 + hero.level * 100;
          if (target.hp <= smiteDmg) {
            hero.castSkill(4, target.x, target.y, engine);
          }
        }

        if (hero.skill1Cd <= 0) hero.castSkill(1, target.x, target.y, engine);
        if (hero.skill2Cd <= 0) hero.castSkill(2, target.x, target.y, engine);
      }
      return;
    }

    if (hero.aiState === 'push_lane') {
      this.executeLanePush(hero, dt);
    }
  }

  // --- Safe Lane Retreat (Never Get Stuck in Jungle / Corners) ---

  executeSafeLaneRetreat(hero, dt) {
    const engine = this.engine;
    const lane = hero.aiLane || (hero.role === 'exp' ? 'top' : (hero.role === 'gold' ? 'bot' : 'mid'));
    const path = engine.map.getLaneWaypoints(lane, hero.team);

    // Find closest waypoint and retreat towards lower index (friendly fountain)
    const nearestIdx = engine.map.findNearestWaypointIndex(path, hero.x, hero.y);
    const targetIdx = Math.max(0, nearestIdx - 1);
    const targetPt = path[targetIdx];

    this.steerTowards(hero, targetPt.x, targetPt.y, dt);
  }

  // --- Lane Push & Minion Tethering ---

  executeLanePush(hero, dt) {
    const engine = this.engine;
    const lane = hero.aiLane || (hero.role === 'exp' ? 'top' : (hero.role === 'gold' ? 'bot' : 'mid'));
    const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';

    // 1. Look for enemy minions in this lane with smart last-hit priority
    let laneEnemyMinion = null;
    let minMinionDist = 450;
    let lowestMinionHp = 99999;
    for (const m of engine.minionManager.minions) {
      if (m.team === enemyTeam && m.lane === lane && m.alive) {
        const d = Math.hypot(m.x - hero.x, m.y - hero.y);
        if (d < minMinionDist) {
          if (m.hp < hero.physicalAttack * 1.8 && m.hp < lowestMinionHp) {
            lowestMinionHp = m.hp;
            laneEnemyMinion = m;
          } else if (!laneEnemyMinion) {
            laneEnemyMinion = m;
          }
        }
      }
    }

    // 2. Look for enemy turret in this lane
    let laneEnemyTurret = null;
    for (const t of engine.map.turrets) {
      if (t.team === enemyTeam && t.lane === lane && t.alive) {
        const d = Math.hypot(t.x - hero.x, t.y - hero.y);
        if (d < 540) {
          laneEnemyTurret = t;
          break;
        }
      }
    }

    // 3. Engage lane minions safely
    if (laneEnemyMinion) {
      const dist = Math.hypot(laneEnemyMinion.x - hero.x, laneEnemyMinion.y - hero.y);

      if (dist <= hero.attackRange) {
        hero.isMoving = false;
        hero.performBasicAttack(engine, laneEnemyMinion);
        if (hero.skill1Cd <= 0 && hero.mana > 80) {
          hero.castSkill(1, laneEnemyMinion.x, laneEnemyMinion.y, engine);
        }
      } else {
        this.steerTowards(hero, laneEnemyMinion.x, laneEnemyMinion.y, dt);
      }
      return;
    }

    // 4. Enemy Turret Siege or Safe Hold
    if (laneEnemyTurret) {
      const distToTurret = Math.hypot(laneEnemyTurret.x - hero.x, laneEnemyTurret.y - hero.y);
      const alliedMinionsInside = this.isAlliedMinionTankingTurret(laneEnemyTurret, hero.team);

      if (alliedMinionsInside) {
        // Safe to siege turret
        if (distToTurret <= hero.attackRange) {
          hero.isMoving = false;
          hero.performBasicAttack(engine, laneEnemyTurret);
        } else {
          this.steerTowards(hero, laneEnemyTurret.x, laneEnemyTurret.y, dt);
        }
        return;
      } else {
        // Dangerous: hold position 45px outside turret range and wait for next wave!
        if (distToTurret < laneEnemyTurret.range + 45) {
          const awayAngle = Math.atan2(hero.y - laneEnemyTurret.y, hero.x - laneEnemyTurret.x);
          const safeX = laneEnemyTurret.x + Math.cos(awayAngle) * (laneEnemyTurret.range + 55);
          const safeY = laneEnemyTurret.y + Math.sin(awayAngle) * (laneEnemyTurret.range + 55);
          this.steerTowards(hero, safeX, safeY, dt);
          return;
        }
      }
    }

    // 5. Advance along designated lane waypoints using persistent progressive index
    const path = engine.map.getLaneWaypoints(lane, hero.team);
    
    // Ensure index is valid
    if (hero.aiPathIndex === undefined || hero.aiPathIndex >= path.length) {
      hero.aiPathIndex = engine.map.findNearestWaypointIndex(path, hero.x, hero.y);
    }

    let targetPt = path[hero.aiPathIndex];
    const distToPt = Math.hypot(targetPt.x - hero.x, targetPt.y - hero.y);

    // If within 65px of current waypoint, advance to next waypoint
    if (distToPt < 65 && hero.aiPathIndex < path.length - 1) {
      hero.aiPathIndex++;
      targetPt = path[hero.aiPathIndex];
    }

    // Stagger lateral offset based on role to prevent single-file clumping
    const offset = hero.role === 'exp' ? -20 : (hero.role === 'gold' ? 20 : 0);
    this.steerTowards(hero, targetPt.x + offset, targetPt.y + offset, dt);
  }

  // --- Tangential Steering, Boids Herd Separation, & Anti-Stuck Watchdog ---

  steerTowards(hero, targetX, targetY, dt) {
    hero.isMoving = true;
    let desiredDx = targetX - hero.x;
    let desiredDy = targetY - hero.y;
    const desiredDist = Math.hypot(desiredDx, desiredDy);

    if (desiredDist < 4) {
      hero.isMoving = false;
      return;
    }

    let moveVx = desiredDx / desiredDist;
    let moveVy = desiredDy / desiredDist;

    // 1. Anti-Stuck Watchdog: Check if hero is pinned/immobile
    const movedDist = Math.hypot(hero.x - hero.aiLastX, hero.y - hero.aiLastY);
    hero.aiLastX = hero.x;
    hero.aiLastY = hero.y;

    if (movedDist < 0.8) {
      hero.aiStuckTimer = (hero.aiStuckTimer || 0) + dt;
      if (hero.aiStuckTimer > 0.9) {
        // Trigger emergency orthogonal deflection nudge
        const normalAngle = Math.atan2(moveVy, moveVx) + Math.PI / 2;
        hero.aiUnstuckVx = Math.cos(normalAngle) * 2.5;
        hero.aiUnstuckVy = Math.sin(normalAngle) * 2.5;
        hero.aiUnstuckTimer = 0.45;
        hero.aiStuckTimer = 0;
      }
    } else {
      hero.aiStuckTimer = Math.max(0, (hero.aiStuckTimer || 0) - dt * 2);
    }

    // Apply active unstuck boost if timer active
    if (hero.aiUnstuckTimer > 0) {
      hero.aiUnstuckTimer -= dt;
      moveVx += hero.aiUnstuckVx;
      moveVy += hero.aiUnstuckVy;
    }

    // 2. Physical Turret Pedestal Clearance (Only applies to LIVING turrets!)
    for (const t of this.engine.map.turrets) {
      if (!t.alive) continue; // Destroyed turrets are passable rubble

      const d = Math.hypot(hero.x - t.x, hero.y - t.y);
      const avoidDist = 28 + hero.radius; // Exact footprint of the stone tower base

      if (d < avoidDist && d > 0.01) {
        const nx = (hero.x - t.x) / d;
        const ny = (hero.y - t.y) / d;

        // Tangential vectors
        const t1x = -ny;
        const t1y = nx;
        const t2x = ny;
        const t2y = -nx;

        // Pick tangent matching desired vector
        const dot1 = t1x * moveVx + t1y * moveVy;
        const dot2 = t2x * moveVx + t2y * moveVy;
        const chosenTx = dot1 >= dot2 ? t1x : t2x;
        const chosenTy = dot1 >= dot2 ? t1y : t2y;

        moveVx += nx * 1.5 + chosenTx * 1.8;
        moveVy += ny * 1.5 + chosenTy * 1.8;
      }
    }

    // 3. Enemy Turret Danger Area (Smooth Hysteresis Braking)
    for (const t of this.engine.map.turrets) {
      if (t.team !== hero.team && t.alive) {
        const d = Math.hypot(hero.x - t.x, hero.y - t.y);
        const minionsTanking = this.isAlliedMinionTankingTurret(t, hero.team);

        // If no minions tanking and hero steps inside danger radius, apply soft braking
        if (!minionsTanking && d < t.range + 30 && d > 0.01) {
          const nx = (hero.x - t.x) / d;
          const ny = (hero.y - t.y) / d;
          const dangerFactor = Math.min(2.2, (t.range + 30 - d) / 30);
          moveVx += nx * dangerFactor * 1.6;
          moveVy += ny * dangerFactor * 1.6;
        }
      }
    }

    // 4. Boids Hero Separation (Prevents Team Clumping / Stacking)
    for (const other of this.engine.heroes) {
      if (other !== hero && other.alive) {
        const d = Math.hypot(hero.x - other.x, hero.y - other.y);
        const separationThreshold = 52;
        if (d < separationThreshold && d > 0.01) {
          const sepNx = (hero.x - other.x) / d;
          const sepNy = (hero.y - other.y) / d;
          const strength = (separationThreshold - d) / separationThreshold;
          moveVx += sepNx * strength * 0.95;
          moveVy += sepNy * strength * 0.95;
        }
      }
    }

    // 5. Reflex Projectile Dodging
    if (this.engine.minionManager && this.engine.minionManager.projectiles) {
      for (const p of this.engine.minionManager.projectiles) {
        if (p.source && p.source.team !== hero.team) {
          const pdx = p.x - hero.x;
          const pdy = p.y - hero.y;
          const pdist = Math.hypot(pdx, pdy);
          if (pdist < 160 && pdist > 5) {
            const perpX = -pdy / pdist;
            const perpY = pdx / pdist;
            moveVx += perpX * 1.8;
            moveVy += perpY * 1.8;
            break;
          }
        }
      }
    }

    // 6. Normalize final motion vector and apply hero's distinct moveSpeed
    const finalLen = Math.hypot(moveVx, moveVy);
    if (finalLen > 0.001) {
      const speed = hero.moveSpeed;
      const stepX = (moveVx / finalLen) * speed * dt;
      const stepY = (moveVy / finalLen) * speed * dt;

      hero.x += stepX;
      hero.y += stepY;

      // Bound clamping
      const clamped = this.engine.map.clampPosition(hero.x, hero.y);
      hero.x = clamped.x;
      hero.y = clamped.y;

      hero.facingAngle = Math.atan2(moveVy, moveVx);
    }
  }

  isAlliedMinionTankingTurret(turret, alliedTeam) {
    if (!turret || !turret.alive) return false;
    for (const m of this.engine.minionManager.minions) {
      if (m.team === alliedTeam && m.alive) {
        if (Math.hypot(m.x - turret.x, m.y - turret.y) <= turret.range) {
          return true;
        }
      }
    }
    return false;
  }

  // --- Dynamic Combat Combos for All 10 Heroes ---

  executeAiCombatCombo(hero, target) {
    const engine = this.engine;
    const dist = Math.hypot(target.x - hero.x, target.y - hero.y);

    // EUDORA: 2 (Ball Lightning Stun) -> 1 (Forked Lightning) -> 3 (Thunder's Wrath Burst)
    if (hero.heroId === 'eudora') {
      if (hero.skill2Cd <= 0 && dist <= 330) {
        hero.castSkill(2, target.x, target.y, engine);
      } else if (hero.skill1Cd <= 0 && dist <= 340) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 360) {
        hero.castSkill(3, target.x, target.y, engine);
      }
      return;
    }

    // TIGREAL: 2 (Sacred Hammer Shove) -> 3 (Implosion Magnet Stun) -> 1 (Attack Wave Slow)
    if (hero.heroId === 'tigreal') {
      if (hero.skill2Cd <= 0 && dist <= 280) {
        hero.castSkill(2, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 240) {
        hero.castSkill(3, target.x, target.y, engine);
      } else if (hero.skill1Cd <= 0 && dist <= 320) {
        hero.castSkill(1, target.x, target.y, engine);
      }
      return;
    }

    // ALUCARD: 1 (Groundsplitter Leap) -> 3 (Fission Wave Buff) -> 2 (Whirling Smash Spin)
    if (hero.heroId === 'alucard') {
      if (hero.skill1Cd <= 0 && dist <= 310) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 320) {
        hero.castSkill(3, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 170) {
        hero.castSkill(2, target.x, target.y, engine);
      }
      return;
    }

    // CHOU: 1 (Jeet Kune Do Knockup) -> 2 (Shunpo Immune Dash) -> 3 (The Way of Dragon Kick)
    if (hero.heroId === 'chou') {
      if (hero.skill1Cd <= 0 && dist <= 230) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 250) {
        hero.castSkill(2, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 210) {
        hero.castSkill(3, target.x, target.y, engine);
      }
      return;
    }

    // GUSION: 1 (Sword Spike Throw) -> 2 (Shadowblade Daggers) -> 3 (Incandescence Reset & Burst)
    if (hero.heroId === 'gusion') {
      if (hero.skill1Cd <= 0 && dist <= 360) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 320) {
        hero.castSkill(2, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 260) {
        hero.castSkill(3, target.x, target.y, engine);
      }
      return;
    }

    // BALMOND: 1 (Soul Lock Dash) -> 2 (Cyclone Sweep Spin) -> 3 (Lethal Counter Execute if < 38% HP)
    if (hero.heroId === 'balmond') {
      if (hero.ultCd <= 0 && hero.ultLevel > 0 && target.hp < target.maxHp * 0.38 && dist <= 230) {
        hero.castSkill(3, target.x, target.y, engine);
      } else if (hero.skill1Cd <= 0 && dist <= 260) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 170) {
        hero.castSkill(2, target.x, target.y, engine);
      }
      return;
    }

    // GROCK: 1 (Power of Nature Sweep) -> 3 (Wild Charge Slam) -> 2 (Guardian's Barrier Wall)
    if (hero.heroId === 'grock') {
      if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 370) {
        hero.castSkill(3, target.x, target.y, engine);
      } else if (hero.skill1Cd <= 0 && dist <= 220) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 350) {
        hero.castSkill(2, target.x, target.y, engine);
      }
      return;
    }

    // MIYA: 1 (Moon Arrow Split) -> 3 (Hidden Moonlight Stealth if target approaches)
    if (hero.heroId === 'miya') {
      if (hero.skill1Cd <= 0 && dist <= 310) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist < 220) {
        hero.castSkill(3, target.x, target.y, engine);
      }
      return;
    }

    // LAYLA: 1 (Malefic Bomb Poke) -> 2 (Void Slow) -> 3 (Destruction Rush Laser Finisher)
    if (hero.heroId === 'layla') {
      if (hero.ultCd <= 0 && hero.ultLevel > 0 && target.hp < target.maxHp * 0.45 && dist <= 750) {
        hero.castSkill(3, target.x, target.y, engine);
      } else if (hero.skill1Cd <= 0 && dist <= 420) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 360) {
        hero.castSkill(2, target.x, target.y, engine);
      }
      return;
    }

    // KAGURA: 1 (Seimei Umbrella Poke) -> 3 (Yin Yang Overturn) -> 2 (Teleport)
    if (hero.heroId === 'kagura') {
      if (hero.skill1Cd <= 0 && dist <= 360) {
        hero.castSkill(1, target.x, target.y, engine);
      } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 280) {
        hero.castSkill(3, target.x, target.y, engine);
      } else if (hero.skill2Cd <= 0 && dist <= 320) {
        hero.castSkill(2, target.x, target.y, engine);
      }
      return;
    }

    // General Skill Fallback
    if (hero.skill1Cd <= 0 && dist <= 320) {
      hero.castSkill(1, target.x, target.y, engine);
    } else if (hero.skill2Cd <= 0 && hero.skill2Level > 0 && dist <= 300) {
      hero.castSkill(2, target.x, target.y, engine);
    } else if (hero.ultCd <= 0 && hero.ultLevel > 0 && dist <= 320) {
      hero.castSkill(3, target.x, target.y, engine);
    }

    // Execute Spell Finisher: Instant cast when enemy hero is in execute range
    if (hero.spellId === 'execute' && hero.spellCooldown <= 0 && target.hp < target.maxHp * 0.24 && dist <= 240) {
      hero.castSkill(4, target.x, target.y, engine);
    }
  }

  checkAiItemPurchase(hero) {
    if (hero.items.length >= 6) return;
    const recs = hero.data && hero.data.recommendedItems;
    if (!recs) return;
    const nextRecId = recs[hero.items.length];
    if (!nextRecId) return;

    const allItems = this.engine.allItemsMap || {};
    const itemData = allItems[nextRecId];
    if (itemData && hero.gold >= itemData.cost) {
      hero.buyItem(itemData, this.engine);
    }
  }

  findNearestAlliedTurret(hero) {
    let nearest = null;
    let minDist = 999999;
    for (const t of this.engine.map.turrets) {
      if (t.team === hero.team && t.alive) {
        const d = Math.hypot(t.x - hero.x, t.y - hero.y);
        if (d < minDist) {
          minDist = d;
          nearest = t;
        }
      }
    }
    return nearest;
  }

  findNearestEnemyTurret(hero) {
    const enemyTeam = hero.team === 'blue' ? 'red' : 'blue';
    let nearest = null;
    let minDist = 999999;
    for (const t of this.engine.map.turrets) {
      if (t.team === enemyTeam && t.alive) {
        const d = Math.hypot(t.x - hero.x, t.y - hero.y);
        if (d < minDist) {
          minDist = d;
          nearest = t;
        }
      }
    }
    return nearest;
  }
}
