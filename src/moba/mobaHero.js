/**
 * Comprehensive MOBA Hero Entity Class.
 * Supports Player and 9 Competitive AI NPC Bots across all 5 roles.
 * 100% Pure JavaScript, zero TSX.
 */

import { HEROES_DATA, BATTLE_SPELLS, ITEMS_DATA } from './mobaData.js';

export class MobaHero {
  constructor(heroId, team, role, isPlayer = false, spellId = null) {
    this.isHero = true;
    this.heroId = heroId;
    this.data = HEROES_DATA[heroId];
    this.name = this.data.name;
    this.title = this.data.title;
    this.team = team; // 'blue' or 'red'
    this.role = role; // 'exp', 'mid', 'gold', 'roam', 'jungle'
    this.isPlayer = isPlayer;

    // Position & Coordinates
    this.x = team === 'blue' ? 360 : 2840;
    this.y = team === 'blue' ? 2840 : 360;
    this.vx = 0;
    this.vy = 0;
    this.facingAngle = team === 'blue' ? -Math.PI / 4 : (3 * Math.PI) / 4;
    this.radius = 24;

    // Level & Progression
    this.level = 1;
    this.exp = 0;
    this.expToNext = 180;
    this.gold = 300; // Starting gold
    this.totalGoldEarned = 300;

    // Stats
    this.maxHp = this.data.stats.hp;
    this.hp = this.maxHp;
    this.maxMana = this.data.stats.mana;
    this.mana = this.maxMana;
    this.physicalAttack = this.data.stats.physicalAttack;
    this.magicPower = this.data.stats.magicPower;
    this.physicalDef = this.data.stats.physicalDef;
    this.magicDef = this.data.stats.magicDef;
    this.baseMoveSpeed = this.data.stats.moveSpeed;
    this.moveSpeed = this.baseMoveSpeed;
    this.attackSpeed = this.data.stats.attackSpeed;
    this.attackRange = this.data.stats.attackRange;
    this.critChance = 0;
    this.lifesteal = 0;
    this.cdr = 0;

    // Shield
    this.shield = 0;
    this.shieldDuration = 0;

    // Buffs
    this.hasBlueBuff = false;
    this.blueBuffTimer = 0;
    this.hasRedBuff = false;
    this.redBuffTimer = 0;
    this.speedBuffTimer = 0;
    this.speedBuffAmount = 0;

    // Battle Spell & Consumables
    this.spellId = spellId || this.data.defaultSpell || 'flicker';
    this.spellData = BATTLE_SPELLS[this.spellId];
    this.spellCooldown = 0;
    this.regenCooldown = 0;
    this.regenActive = false;
    this.regenTimer = 0;

    // Recall to base
    this.recalling = false;
    this.recallTimer = 0;

    // Skills cooldowns and levels
    this.skill1Level = 1;
    this.skill1Cd = 0;
    this.skill2Level = 0; // Unlocked at Lv 2
    this.skill2Cd = 0;
    this.ultLevel = 0;    // Unlocked at Lv 4
    this.ultCd = 0;
    this.basicAttackCooldown = 0;

    // Equipment items (up to 6)
    this.items = [];

    // Crowd Control & States
    this.alive = true;
    this.respawnTimer = 0;
    this.stunTimer = 0;
    this.slowTimer = 0;
    this.slowAmount = 0;
    this.isInBush = false;
    this.isConcealed = false;
    this.stealthTimer = 0; // Miya ult
    this.immortalityCd = 0;

    // Combat Tracking (KDA)
    this.kills = 0;
    this.deaths = 0;
    this.assists = 0;
    this.damageDealt = 0;
    this.damageTaken = 0;

    // Special Hero Mechanic Variables
    this.passiveStacks = 0;
    this.chouComboStep = 1;
    this.chouComboTimer = 0;
    this.alucardUltActive = false;
    this.alucardUltTimer = 0;
    this.gusionDaggerState = 0; // 0: none, 1: thrown
    this.gusionDaggers = [];
    this.kaguraUmbrella = null; // { x, y, active }

    // Dynamic Animation States for Custom Character Rendering
    this.walkCycle = 0;
    this.isMoving = false;
    this.attackAnimTimer = 0;
    this.castAnimTimer = 0;
    this.lastCastSkill = 0;
    this.hitFlashTimer = 0;
  }

  update(dt, engine) {
    if (!this.alive) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.respawn(engine);
      }
      return;
    }

    // Animation timers
    if (this.attackAnimTimer > 0) this.attackAnimTimer -= dt;
    if (this.castAnimTimer > 0) this.castAnimTimer -= dt;
    if (this.hitFlashTimer > 0) this.hitFlashTimer -= dt;

    if (this.isMoving) {
      this.walkCycle += dt * (this.moveSpeed / 25);
    } else {
      this.walkCycle *= 0.85;
    }
    this.isMoving = false;

    // Soft collision separation between heroes to prevent clumping
    for (const other of engine.heroes) {
      if (other !== this && other.alive) {
        let dx = this.x - other.x;
        let dy = this.y - other.y;
        let dist = Math.hypot(dx, dy);
        const minDist = this.radius + other.radius + 8;
        if (dist < 0.001) {
          dx = Math.cos(this.heroId.length) || 1;
          dy = Math.sin(this.heroId.length) || 1;
          dist = Math.hypot(dx, dy);
        }
        if (dist < minDist) {
          const overlap = (minDist - dist) * 0.35;
          this.x += (dx / dist) * overlap;
          this.y += (dy / dist) * overlap;
        }
      }
    }

    // Cooldown reductions
    if (this.basicAttackCooldown > 0) this.basicAttackCooldown -= dt;
    if (this.skill1Cd > 0) this.skill1Cd -= dt;
    if (this.skill2Cd > 0) this.skill2Cd -= dt;
    if (this.ultCd > 0) this.ultCd -= dt;
    if (this.spellCooldown > 0) this.spellCooldown -= dt;
    if (this.regenCooldown > 0) this.regenCooldown -= dt;
    if (this.immortalityCd > 0) this.immortalityCd -= dt;

    // Shield decay
    if (this.shield > 0) {
      this.shieldDuration -= dt;
      if (this.shieldDuration <= 0) this.shield = 0;
    }

    // Regen spell active tick
    if (this.regenActive) {
      this.regenTimer -= dt;
      this.hp = Math.min(this.maxHp, this.hp + (this.maxHp * 0.04) * dt);
      if (this.regenTimer <= 0) this.regenActive = false;
    }

    // Buff Timers
    if (this.hasBlueBuff) {
      this.blueBuffTimer -= dt;
      this.mana = Math.min(this.maxMana, this.mana + 15 * dt);
      if (this.blueBuffTimer <= 0) this.hasBlueBuff = false;
    }
    if (this.hasRedBuff) {
      this.redBuffTimer -= dt;
      if (this.redBuffTimer <= 0) this.hasRedBuff = false;
    }

    // Passive Base HP & Mana Regen
    this.hp = Math.min(this.maxHp, this.hp + (this.maxHp * 0.005) * dt);
    if (this.maxMana > 0) {
      this.mana = Math.min(this.maxMana, this.mana + 5 * dt);
    }

    // Fountain rapid recovery
    if (engine.map.isInFountain(this.x, this.y, this.team)) {
      this.hp = Math.min(this.maxHp, this.hp + this.maxHp * 0.25 * dt);
      this.mana = Math.min(this.maxMana, this.mana + this.maxMana * 0.3 * dt);
    }

    // Enemy fountain deadly beam protection
    if (engine.map.isEnemyFountain(this.x, this.y, this.team)) {
      this.takeDamage(this.maxHp * 0.5 * dt, 'true', { name: 'Fountain Turret' }, engine);
    }

    // CC & Speed Buff timers
    if (this.speedBuffTimer > 0) {
      this.speedBuffTimer -= dt;
      if (this.speedBuffTimer <= 0) {
        this.speedBuffAmount = 0;
      }
    }

    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      this.recalling = false;
      return; // Stunned: cannot move or cast
    }

    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) this.slowAmount = 0;
    }

    // Refresh dynamic speed stats
    this.recomputeStats(engine);

    // Stealth timer (Miya)
    if (this.stealthTimer > 0) {
      this.stealthTimer -= dt;
      this.isConcealed = true;
    } else {
      // Check Bush Concealment
      const bush = engine.map.isInBush(this.x, this.y);
      this.isInBush = !!bush;
      this.isConcealed = !!bush;
    }

    // Recall channeling
    if (this.recalling) {
      this.recallTimer += dt;
      engine.particles.emitRing(this.x, this.y, 45, '#38bdf8', 0.2);
      if (this.recallTimer >= 4.0) {
        // Teleport to fountain!
        const fountain = this.team === 'blue' ? engine.map.blueFountain : engine.map.redFountain;
        this.x = fountain.x;
        this.y = fountain.y;
        this.recalling = false;
        engine.sound.playFlicker();
        engine.particles.emit(this.x, this.y, 25, '#38bdf8', 140, 0.4);
      }
    }

    // Passive passive expiration
    if (this.chouComboTimer > 0) {
      this.chouComboTimer -= dt;
      if (this.chouComboTimer <= 0) this.chouComboStep = 1;
    }
    if (this.alucardUltActive) {
      this.alucardUltTimer -= dt;
      if (this.alucardUltTimer <= 0) this.alucardUltActive = false;
    }

    // Passive gold gain (3 gold/sec)
    this.addGold(3 * dt, engine, false);
  }

  // --- Stats Recomputation & Leveling ---
  recomputeStats(engine = null) {
    let bonusHp = 0;
    let bonusMana = 0;
    let bonusAtk = 0;
    let bonusMagic = 0;
    let bonusDef = 0;
    let bonusMDef = 0;
    let bonusSpd = 0;
    let bonusAtkSpd = 0;
    let bonusCrit = 0;
    let bonusLifesteal = 0;
    let bonusCdr = 0;

    this.items.forEach(item => {
      const s = item.stats;
      if (s.hp) bonusHp += s.hp;
      if (s.mana) bonusMana += s.mana;
      if (s.physicalAttack) bonusAtk += s.physicalAttack;
      if (s.magicPower) bonusMagic += s.magicPower;
      if (s.physicalDef) bonusDef += s.physicalDef;
      if (s.magicDef) bonusMDef += s.magicDef;
      if (s.moveSpeed) bonusSpd += s.moveSpeed;
      if (s.attackSpeed) bonusAtkSpd += s.attackSpeed;
      if (s.critChance) bonusCrit += s.critChance;
      if (s.lifesteal) bonusLifesteal += s.lifesteal;
      if (s.cdr) bonusCdr += s.cdr;
    });

    const lvlGrowth = this.level - 1;
    this.maxHp = this.data.stats.hp + lvlGrowth * this.data.stats.hpGrowth + bonusHp;
    this.maxMana = this.data.stats.mana + lvlGrowth * this.data.stats.manaGrowth + bonusMana;
    this.physicalAttack = this.data.stats.physicalAttack + lvlGrowth * this.data.stats.attackGrowth + bonusAtk;
    this.magicPower = bonusMagic;
    this.physicalDef = this.data.stats.physicalDef + lvlGrowth * this.data.stats.defGrowth + bonusDef;
    this.magicDef = this.data.stats.magicDef + lvlGrowth * this.data.stats.magicDefGrowth + bonusMDef;
    this.critChance = bonusCrit;
    this.lifesteal = bonusLifesteal;
    this.cdr = Math.min(0.4, bonusCdr + (this.hasBlueBuff ? 0.1 : 0));

    // Move speed calculation with items, buffs, terrain, and slow reduction
    let terrainSpeed = 0;
    if (engine && engine.map) {
      if (engine.map.isInRiver(this.x, this.y)) {
        terrainSpeed += 15; // River current speed boost
      }
      if (this.heroId === 'grock') {
        let nearObstacle = false;
        for (const t of engine.map.turrets) {
          if (Math.hypot(this.x - t.x, this.y - t.y) < 220) { nearObstacle = true; break; }
        }
        if (nearObstacle || this.x < 250 || this.x > 2950 || this.y < 250 || this.y > 2950) {
          terrainSpeed += 25; // Grock stone wall passive
        }
      }
    }

    const buffSpeed = this.speedBuffTimer > 0 ? this.speedBuffAmount : 0;
    const effectiveSpd = this.baseMoveSpeed + bonusSpd + buffSpeed + terrainSpeed;
    this.moveSpeed = this.slowTimer > 0 ? Math.max(120, effectiveSpd * (1 - this.slowAmount)) : effectiveSpd;
  }

  addExp(amount, engine) {
    if (this.level >= 15) return;
    this.exp += amount;
    while (this.exp >= this.expToNext && this.level < 15) {
      this.exp -= this.expToNext;
      this.level++;
      this.expToNext = Math.floor(180 * Math.pow(1.22, this.level - 1));

      // Auto-unlock or upgrade skills
      if (this.level === 2 && this.skill2Level === 0) this.skill2Level = 1;
      if (this.level === 4 && this.ultLevel === 0) this.ultLevel = 1;

      this.recomputeStats();
      this.hp = Math.min(this.maxHp, this.hp + this.data.stats.hpGrowth);

      engine.particles.emitRing(this.x, this.y, 60, '#eab308', 0.4);
      engine.combatTexts.addText(this.x, this.y, `LEVEL ${this.level}!`, 'status');
      if (this.isPlayer) {
        engine.sound.playLevelUp();
      }
    }
  }

  addGold(amount, engine, isDirect = true) {
    const rounded = Math.floor(amount);
    this.gold += amount;
    this.totalGoldEarned += amount;
    if (isDirect && this.isPlayer && rounded > 0) {
      engine.sound.playGold();
    }
  }

  buyItem(itemData, engine) {
    if (this.items.length >= 6) return false;
    if (this.gold < itemData.cost) return false;

    this.gold -= itemData.cost;
    this.items.push(itemData);
    this.recomputeStats();
    if (this.isPlayer) {
      engine.sound.playGold();
      engine.addLog(`Membeli ${itemData.name}!`, '#22c55e');
    }
    return true;
  }

  applyBuff(type, duration = 75) {
    if (type === 'blue') {
      this.hasBlueBuff = true;
      this.blueBuffTimer = duration;
      this.recomputeStats();
    } else if (type === 'red') {
      this.hasRedBuff = true;
      this.redBuffTimer = duration;
    }
  }

  // --- Damage & Combat Mechanics ---
  takeDamage(amount, damageType, attacker, engine) {
    if (!this.alive) return;

    this.hitFlashTimer = 0.16;

    // Cancel Recall channeling on damage
    if (this.recalling) {
      this.recalling = false;
      engine.addLog('Recall dibatalkan karena menerima serangan!', '#ef4444');
    }

    // Reveal from bush / stealth when taking hero damage
    if (attacker && attacker.isHero) {
      this.isConcealed = false;
      // Notify Turret Manager for aggro check
      engine.turretManager.checkTurretAggroSwitch(this, attacker);
    }

    // Defensive reductions
    let finalDamage = amount;
    if (damageType === 'phys') {
      const armorReduct = this.physicalDef / (this.physicalDef + 120);
      finalDamage = amount * (1 - armorReduct);
    } else if (damageType === 'magic') {
      const magicReduct = this.magicDef / (this.magicDef + 120);
      finalDamage = amount * (1 - magicReduct);
    }

    // Apply shield absorption first
    if (this.shield > 0) {
      if (this.shield >= finalDamage) {
        this.shield -= finalDamage;
        engine.combatTexts.addText(this.x, this.y, `(${Math.floor(finalDamage)})`, 'status');
        return;
      } else {
        finalDamage -= this.shield;
        this.shield = 0;
      }
    }

    this.hp -= finalDamage;
    this.damageTaken += finalDamage;

    // Floating text
    engine.combatTexts.addText(this.x, this.y, Math.floor(finalDamage), damageType);

    // Blade Armor reflection
    if (this.items.some(it => it.id === 'blade_armor') && attacker && attacker.isHero && damageType === 'phys') {
      attacker.takeDamage(finalDamage * 0.25, 'phys', this, engine);
    }

    // Check Death
    if (this.hp <= 0) {
      // Check Immortality item passive
      const hasImmo = this.items.some(it => it.id === 'immortality');
      if (hasImmo && this.immortalityCd <= 0) {
        this.immortalityCd = 210; // 210s cd
        this.hp = this.maxHp * 0.16;
        this.shield = 1200;
        this.shieldDuration = 3;
        engine.particles.emitRing(this.x, this.y, 80, '#eab308', 0.6);
        engine.combatTexts.addText(this.x, this.y, 'IMMORTALITY!', 'crit');
        engine.sound.playFlicker();
        return;
      }

      this.die(attacker, engine);
    }
  }

  die(killer, engine) {
    this.alive = false;
    this.hp = 0;
    this.deaths++;
    this.recalling = false;

    // Calculate death respawn timer (8s early up to 35s late game)
    this.respawnTimer = Math.min(35, Math.floor(8 + (engine.gameTime / 60) * 3 + this.level));

    engine.particles.triggerScreenShake(7, 0.3);
    engine.particles.emit(this.x, this.y, 30, '#ef4444', 150, 0.5);

    // Award kill credit
    if (killer && killer.isHero) {
      killer.kills++;
      const bountyGold = Math.floor(200 + Math.min(200, this.kills * 40));
      killer.addGold(bountyGold, engine);
      killer.addExp(250, engine);

      // Award assists to nearby teammates
      engine.heroes.forEach(h => {
        if (h.team === killer.team && h !== killer && h.alive && Math.hypot(h.x - this.x, h.y - this.y) < 550) {
          h.assists++;
          h.addGold(Math.floor(bountyGold * 0.5), engine);
          h.addExp(140, engine);
        }
      });

      // Announce Kill & Multikill
      engine.handleHeroKill(killer, this);
    } else {
      engine.sound.playAnnounce(this.team === 'blue' ? 'ally_slain' : 'enemy_slain');
      engine.addLog(`${this.name} tereliminasi oleh ${killer ? killer.name || 'Turret' : 'Turret'}!`, '#ef4444');
    }
  }

  respawn(engine) {
    this.alive = true;
    this.hp = this.maxHp;
    this.mana = this.maxMana;
    const f = this.team === 'blue' ? engine.map.blueFountain : engine.map.redFountain;
    this.x = f.x;
    this.y = f.y;
    engine.particles.emit(this.x, this.y, 20, '#38bdf8', 120, 0.4);
    if (this.isPlayer) {
      engine.sound.playFlicker();
    }
  }

  // --- Basic Attack & Skill Casts ---
  performBasicAttack(engine, targetOverride = null) {
    if (!this.alive || this.stunTimer > 0 || this.basicAttackCooldown > 0) return;

    const target = targetOverride || this.findBestTarget(this.attackRange + 40, engine);
    if (!target) return;

    this.basicAttackCooldown = 1.0 / this.attackSpeed;
    this.recalling = false;
    this.attackAnimTimer = 0.28;

    // Face target
    this.facingAngle = Math.atan2(target.y - this.y, target.x - this.x);

    // Critical check
    const isCrit = Math.random() < this.critChance;
    let damage = this.physicalAttack * (isCrit ? 2.0 : 1.0);

    // Blade of Despair passive: +25% atk if target < 50% HP
    if (this.items.some(it => it.id === 'bod') && target.hp < target.maxHp * 0.5) {
      damage *= 1.25;
    }

    if (this.data.stats.isRanged) {
      // Fire ranged projectile
      engine.sound.playShoot();
      engine.minionManager.projectiles.push({
        x: this.x,
        y: this.y,
        speed: 550,
        damage,
        type: 'phys',
        target,
        source: this,
        isCrit,
        hasRedBuff: this.hasRedBuff
      });
    } else {
      // Melee strike
      engine.sound.playSlash();
      engine.particles.emit(target.x, target.y, 6, isCrit ? '#ef4444' : '#fbbf24', 80, 0.2);

      if (target.isHero) {
        target.takeDamage(damage, isCrit ? 'crit' : 'phys', this, engine);
      } else if (target.tier) {
        engine.turretManager.damageTurret(target, damage, this, engine);
      } else if (target.type === 'turtle' || target.type === 'lord') {
        engine.jungleManager.damageBoss(target, damage, 'phys', this, engine);
      } else if (target.type === 'blue_buff' || target.type === 'red_buff' || target.type === 'minor') {
        engine.jungleManager.damageCamp(target, damage, 'phys', this, engine);
      } else if (target.hp !== undefined) {
        engine.minionManager.takeMinionDamage(target, damage, isCrit ? 'crit' : 'phys', this, engine);
      }

      // Lifesteal heal
      if (this.lifesteal > 0) {
        const healAmt = damage * this.lifesteal;
        this.hp = Math.min(this.maxHp, this.hp + healAmt);
        engine.combatTexts.addText(this.x, this.y, `+${Math.floor(healAmt)}`, 'heal');
      }
    }
  }

  castSkill(skillNumber, targetX, targetY, engine) {
    if (!this.alive || this.stunTimer > 0) return false;
    this.recalling = false;
    this.lastCastSkill = skillNumber;
    this.castAnimTimer = skillNumber === 3 ? 0.45 : 0.32;

    if (skillNumber === 1 && this.skill1Cd <= 0) {
      return this._executeSkill1(targetX, targetY, engine);
    } else if (skillNumber === 2 && this.skill2Cd <= 0 && this.skill2Level > 0) {
      return this._executeSkill2(targetX, targetY, engine);
    } else if (skillNumber === 3 && this.ultCd <= 0 && this.ultLevel > 0) {
      return this._executeUlt(targetX, targetY, engine);
    } else if (skillNumber === 4 && this.spellCooldown <= 0) {
      return this._executeSpell(targetX, targetY, engine);
    }
    return false;
  }

  // --- Specific Skill Executions ---
  _executeSkill1(tx, ty, engine) {
    const s = this.data.skills.skill1;
    if (this.mana < s.manaCost) return false;
    this.mana -= s.manaCost;
    this.skill1Cd = s.cd * (1 - this.cdr);

    const angle = Math.atan2(ty - this.y, tx - this.x);
    this.facingAngle = angle;

    switch (this.heroId) {
      case 'tigreal':
        // Shockwave line & ground crack
        engine.sound.playSlash();
        engine.particles.emitGroundRupture(this.x + Math.cos(angle) * 80, this.y + Math.sin(angle) * 80, 50, '#38bdf8', 0.35);
        this._dealLineDamage(angle, s.range, 320 + this.physicalAttack * 0.8, 'phys', engine, (h) => {
          h.slowTimer = 1.5;
          h.slowAmount = 0.4;
        });
        break;
      case 'layla':
        // Malefic bomb projectile
        engine.sound.playShoot();
        engine.particles.emitBeam(this.x, this.y, this.x + Math.cos(angle) * s.range, this.y + Math.sin(angle) * s.range, '#38bdf8', 0.25, 4);
        engine.particles.emit(this.x + Math.cos(angle) * s.range, this.y + Math.sin(angle) * s.range, 10, '#38bdf8', 120, 0.3);
        this._dealLineDamage(angle, s.range, 340 + this.physicalAttack * 1.2, 'phys', engine);
        break;
      case 'eudora':
        // Forked lightning branching arc
        engine.sound.playMagicSpell();
        engine.particles.emitLightning(this.x, this.y, this.x + Math.cos(angle) * s.range, this.y + Math.sin(angle) * s.range, '#06b6d4', 0.22);
        engine.particles.emitRing(this.x, this.y, s.range * 0.5, '#06b6d4', 0.28);
        this._dealConeDamage(angle, s.range, 450 + this.magicPower * 1.5, 'magic', engine);
        break;
      case 'alucard':
        // Groundsplitter leap & demonic slash
        engine.sound.playSlash();
        this.x = Math.max(80, Math.min(3120, this.x + Math.cos(angle) * s.range));
        this.y = Math.max(80, Math.min(3120, this.y + Math.sin(angle) * s.range));
        engine.particles.emitShockwave(this.x, this.y, 110, '#dc2626', 0.32);
        engine.particles.emitSlashArc(this.x, this.y, angle, 90, '#ef4444', 0.25);
        this._dealAoeDamage(this.x, this.y, 110, 320 + this.physicalAttack * 1.1, 'phys', engine);
        break;
      case 'chou':
        // Jeet kune do combo
        engine.sound.playImpact();
        this.x += Math.cos(angle) * 75;
        this.y += Math.sin(angle) * 75;
        this.chouComboStep = (this.chouComboStep % 3) + 1;
        this.chouComboTimer = 4.0;
        const isKnockup = this.chouComboStep === 3;
        this._dealAoeDamage(this.x, this.y, 90, 260 + this.physicalAttack * 0.8, 'phys', engine, (h) => {
          if (isKnockup) {
            h.stunTimer = 1.0;
            engine.combatTexts.addText(h.x, h.y, 'KNOCKUP!', 'crit');
          }
        });
        break;
      case 'miya':
        // Moon arrow split active
        engine.sound.playShoot();
        this.passiveStacks = 5;
        engine.combatTexts.addText(this.x, this.y, 'MOON ARROW!', 'status');
        break;
      case 'grock':
        // Power of nature charge & smash
        engine.sound.playSlash();
        engine.particles.emitRing(this.x, this.y, 130, '#10b981', 0.35);
        this._dealAoeDamage(this.x, this.y, 130, 420 + this.physicalAttack * 1.4, 'phys', engine);
        break;
      case 'balmond':
        // Soul lock dash
        engine.sound.playImpact();
        this.x += Math.cos(angle) * s.range;
        this.y += Math.sin(angle) * s.range;
        this._dealAoeDamage(this.x, this.y, 90, 250 + this.physicalAttack * 0.7, 'phys', engine, (h) => {
          h.slowTimer = 1.5;
          h.slowAmount = 0.3;
        });
        break;
      case 'gusion':
        // Sword spike dagger
        engine.sound.playShoot();
        this._dealLineDamage(angle, s.range, 280 + this.magicPower * 0.9, 'magic', engine, (h) => {
          // Blink behind target
          this.x = h.x - Math.cos(angle) * 35;
          this.y = h.y - Math.sin(angle) * 35;
          engine.sound.playFlicker();
        });
        break;
      case 'kagura':
        // Seimei umbrella throw
        engine.sound.playMagicSpell();
        this._dealLineDamage(angle, s.range, 330 + this.magicPower * 1.05, 'magic', engine);
        break;
      default:
        this._dealLineDamage(angle, s.range, 300, 'phys', engine);
    }
    return true;
  }

  _executeSkill2(tx, ty, engine) {
    const s = this.data.skills.skill2;
    if (this.mana < s.manaCost) return false;
    this.mana -= s.manaCost;
    this.skill2Cd = s.cd * (1 - this.cdr);

    const angle = Math.atan2(ty - this.y, tx - this.x);
    this.facingAngle = angle;

    switch (this.heroId) {
      case 'tigreal':
        // Sacred Hammer dash & shove
        engine.sound.playSlash();
        this.x += Math.cos(angle) * s.range;
        this.y += Math.sin(angle) * s.range;
        this._dealAoeDamage(this.x, this.y, 95, 280 + this.physicalAttack * 0.7, 'phys', engine, (h) => {
          h.stunTimer = 1.0;
          engine.combatTexts.addText(h.x, h.y, 'AIRBORNE!', 'crit');
        });
        break;
      case 'layla':
        // Void projectile aoe slow
        engine.sound.playShoot();
        engine.particles.emitRing(tx, ty, 90, '#eab308', 0.35);
        this._dealAoeDamage(tx, ty, 90, 280 + this.physicalAttack * 0.9, 'phys', engine, (h) => {
          h.slowTimer = 2.0;
          h.slowAmount = 0.45;
        });
        break;
      case 'eudora':
        // Electric arrow target stun
        engine.sound.playMagicSpell();
        const target = this.findBestTarget(s.range + 30, engine);
        if (target) {
          engine.particles.emit(target.x, target.y, 12, '#06b6d4', 90, 0.3);
          target.takeDamage(350 + this.magicPower * 1.1, 'magic', this, engine);
          target.stunTimer = 1.2;
          engine.combatTexts.addText(target.x, target.y, 'STUNNED!', 'crit');
        }
        break;
      case 'alucard':
        // Whirling smash 360 spin
        engine.sound.playSlash();
        engine.particles.emitRing(this.x, this.y, 120, '#8b5cf6', 0.25);
        this._dealAoeDamage(this.x, this.y, 120, 350 + this.physicalAttack * 1.2, 'phys', engine);
        break;
      case 'chou':
        // Shunpo dash + cc immunity + shield
        engine.sound.playFlicker();
        this.x += Math.cos(angle) * s.range;
        this.y += Math.sin(angle) * s.range;
        this.shield = 350;
        this.shieldDuration = 2.5;
        this.stunTimer = 0; // Immune cleanse
        engine.combatTexts.addText(this.x, this.y, 'IMMUNE!', 'status');
        break;
      case 'miya':
        // Arrow of Eclipse AOE root
        engine.sound.playShoot();
        engine.particles.emitRing(tx, ty, 95, '#38bdf8', 0.35);
        this._dealAoeDamage(tx, ty, 95, 260 + this.physicalAttack * 0.7, 'phys', engine, (h) => {
          h.stunTimer = 1.2;
          engine.combatTexts.addText(h.x, h.y, 'IMMOBILIZED!', 'crit');
        });
        break;
      case 'grock':
        // Guardian barrier wall
        engine.sound.playImpact(true);
        engine.particles.emit(tx, ty, 20, '#10b981', 110, 0.4);
        engine.combatTexts.addText(tx, ty, 'STONE WALL!', 'status');
        break;
      case 'balmond':
        // Cyclone sweep continuous spin
        engine.sound.playSlash();
        engine.particles.emitRing(this.x, this.y, 110, '#dc2626', 0.4);
        this._dealAoeDamage(this.x, this.y, 110, 380 + this.physicalAttack * 1.3, 'phys', engine);
        break;
      case 'gusion':
        // Shadowblade slaughter 5 daggers
        engine.sound.playShoot();
        engine.particles.emit(this.x, this.y, 18, '#a855f7', 150, 0.3);
        this._dealConeDamage(angle, s.range, 380 + this.magicPower * 1.2, 'magic', engine);
        break;
      case 'kagura':
        // Rasho umbrella flee
        engine.sound.playFlicker();
        this.x -= Math.cos(angle) * s.range;
        this.y -= Math.sin(angle) * s.range;
        this.stunTimer = 0;
        this.shield = 280;
        this.shieldDuration = 2;
        break;
      default:
        this._dealAoeDamage(this.x, this.y, 100, 250, 'phys', engine);
    }
    return true;
  }

  _executeUlt(tx, ty, engine) {
    const s = this.data.skills.ultimate;
    if (this.mana < s.manaCost) return false;
    this.mana -= s.manaCost;
    this.ultCd = s.cd * (1 - this.cdr);

    const angle = Math.atan2(ty - this.y, tx - this.x);
    this.facingAngle = angle;

    switch (this.heroId) {
      case 'tigreal':
        // Implosion magnetic vortex pull + massive stun
        engine.sound.playImpact(true);
        engine.particles.triggerScreenShake(7, 0.4);
        engine.particles.emitRing(this.x, this.y, s.range, '#3b82f6', 0.5);
        this._dealAoeDamage(this.x, this.y, s.range, 420 + this.physicalAttack * 0.9, 'phys', engine, (h) => {
          // Pull to Tigreal
          h.x = this.x + (Math.random() - 0.5) * 30;
          h.y = this.y + (Math.random() - 0.5) * 30;
          h.stunTimer = 1.5;
          engine.combatTexts.addText(h.x, h.y, 'IMPLOSION STUN!', 'crit');
        });
        break;
      case 'layla':
        // Destruction rush gigabeam laser
        engine.sound.playTurretFire();
        engine.particles.triggerScreenShake(8, 0.35);
        const bx2 = this.x + Math.cos(angle) * s.range;
        const by2 = this.y + Math.sin(angle) * s.range;
        engine.particles.emitBeam(this.x, this.y, bx2, by2, '#38bdf8', 0.45, 14);
        engine.particles.emitBeam(this.x, this.y, bx2, by2, '#ffffff', 0.35, 6);
        engine.particles.emitShockwave(this.x, this.y, 75, '#38bdf8', 0.3);
        this._dealLineDamage(angle, s.range, 650 + this.physicalAttack * 1.8, 'phys', engine);
        break;
      case 'eudora':
        // Thunder's wrath catastrophic lightning burst
        engine.sound.playMagicSpell();
        engine.particles.triggerScreenShake(9, 0.4);
        const target = this.findBestTarget(s.range + 40, engine);
        if (target) {
          engine.particles.emitLightning(target.x, target.y - 280, target.x, target.y, '#38bdf8', 0.35);
          engine.particles.emitShockwave(target.x, target.y, 130, '#06b6d4', 0.4);
          engine.particles.emit(target.x, target.y, 25, '#38bdf8', 160, 0.45);
          target.takeDamage(780 + this.magicPower * 2.1, 'magic', this, engine);
        }
        break;
      case 'alucard':
        // Fission wave lifesteal frenzy + demonic cleaves
        engine.sound.playSlash();
        this.alucardUltActive = true;
        this.alucardUltTimer = 8;
        this.lifesteal += 0.4;
        engine.particles.emitSlashArc(this.x, this.y, angle, 120, '#ef4444', 0.3);
        engine.combatTexts.addText(this.x, this.y, 'FISSION WAVE!', 'crit');
        this._dealConeDamage(angle, s.range, 440 + this.physicalAttack * 1.3, 'phys', engine);
        break;
      case 'chou':
        // The Way of Dragon roundhouse fly kick
        engine.sound.playImpact(true);
        const kTarget = this.findBestTarget(s.range + 20, engine);
        if (kTarget) {
          engine.particles.triggerScreenShake(6, 0.3);
          engine.particles.emitShockwave(kTarget.x, kTarget.y, 90, '#f59e0b', 0.35);
          kTarget.x += Math.cos(angle) * 160;
          kTarget.y += Math.sin(angle) * 160;
          kTarget.stunTimer = 1.4;
          kTarget.takeDamage(480 + this.physicalAttack * 1.5, 'phys', this, engine);
          engine.combatTexts.addText(kTarget.x, kTarget.y, 'DRAGON KICK!', 'crit');
        }
        break;
      case 'miya':
        // Hidden Moonlight stealth + speed
        engine.sound.playFlicker();
        this.stealthTimer = 2.5;
        this.stunTimer = 0;
        this.speedBuffTimer = 2.5;
        this.speedBuffAmount = 90;
        this.recomputeStats(engine);
        engine.combatTexts.addText(this.x, this.y, 'STEALTH!', 'status');
        break;
      case 'grock':
        // Wild Charge knockup slam
        engine.sound.playImpact(true);
        engine.particles.triggerScreenShake(8, 0.35);
        this.x += Math.cos(angle) * s.range;
        this.y += Math.sin(angle) * s.range;
        engine.particles.emitRing(this.x, this.y, 130, '#10b981', 0.4);
        this._dealAoeDamage(this.x, this.y, 130, 480 + this.physicalAttack * 1.5, 'phys', engine, (h) => {
          h.stunTimer = 1.2;
          engine.combatTexts.addText(h.x, h.y, 'AIRBORNE!', 'crit');
        });
        break;
      case 'balmond':
        // Lethal Counter execute smash
        engine.sound.playImpact(true);
        engine.particles.triggerScreenShake(9, 0.4);
        engine.particles.emitRing(this.x, this.y, 120, '#dc2626', 0.4);
        this._dealAoeDamage(this.x, this.y, 120, 400 + this.physicalAttack * 1.0, 'true', engine, (h) => {
          // Lost HP execute damage!
          const lostHp = h.maxHp - h.hp;
          h.takeDamage(lostHp * 0.25, 'true', this, engine);
        });
        break;
      case 'gusion':
        // Incandescence reset & blink
        engine.sound.playFlicker();
        this.x += Math.cos(angle) * s.range;
        this.y += Math.sin(angle) * s.range;
        this.skill1Cd = 0;
        this.skill2Cd = 0;
        engine.combatTexts.addText(this.x, this.y, 'SKILLS RESET!', 'status');
        break;
      case 'kagura':
        // Yin-Yang overturn vortex
        engine.sound.playMagicSpell();
        engine.particles.emitRing(tx, ty, 140, '#ec4899', 0.5);
        this._dealAoeDamage(tx, ty, 140, 460 + this.magicPower * 1.4, 'magic', engine, (h) => {
          h.slowTimer = 2.0;
          h.slowAmount = 0.5;
        });
        break;
      default:
        this._dealAoeDamage(this.x, this.y, 120, 400, 'phys', engine);
    }
    return true;
  }

  _executeSpell(tx, ty, engine) {
    const s = this.spellData;
    this.spellCooldown = s.cd;

    switch (this.spellId) {
      case 'retribution':
        engine.sound.playRetribution();
        engine.particles.triggerScreenShake(5, 0.2);
        // Find closest jungle monster or minion in 260px
        const monster = this.findClosestMonsterOrMinion(260, engine);
        const retriDamage = 1000 + this.level * 100;
        if (monster) {
          engine.particles.emitBeam(monster.x, monster.y - 120, monster.x, monster.y, '#8b5cf6', 0.3);
          if (monster.type === 'turtle' || monster.type === 'lord') {
            engine.jungleManager.damageBoss(monster, retriDamage, 'true', this, engine);
          } else if (monster.spawnX !== undefined) {
            engine.jungleManager.damageCamp(monster, retriDamage, 'true', this, engine);
          } else {
            engine.minionManager.takeMinionDamage(monster, retriDamage, 'true', this, engine);
          }
          engine.combatTexts.addText(monster.x, monster.y, `${retriDamage} SMITE!`, 'crit');
        }
        break;
      case 'flicker':
        engine.sound.playFlicker();
        const fAngle = Math.atan2(ty - this.y, tx - this.x);
        this.x = Math.max(80, Math.min(3120, this.x + Math.cos(fAngle) * 240));
        this.y = Math.max(80, Math.min(3120, this.y + Math.sin(fAngle) * 240));
        engine.particles.emit(this.x, this.y, 16, '#38bdf8', 100, 0.3);
        break;
      case 'execute':
        engine.sound.playSlash();
        const exTarget = this.findBestTarget(240, engine);
        if (exTarget) {
          const lost = exTarget.maxHp - exTarget.hp;
          const dmg = 200 + lost * 0.15;
          exTarget.takeDamage(dmg, 'true', this, engine);
          engine.combatTexts.addText(exTarget.x, exTarget.y, 'EXECUTE!', 'crit');
        }
        break;
      case 'purify':
        engine.sound.playFlicker();
        this.stunTimer = 0;
        this.slowTimer = 0;
        this.speedBuffTimer = 1.8;
        this.speedBuffAmount = 80;
        this.recomputeStats(engine);
        engine.combatTexts.addText(this.x, this.y, 'PURIFIED!', 'status');
        break;
      case 'sprint':
        this.slowTimer = 0;
        this.speedBuffTimer = 8.0;
        this.speedBuffAmount = 110;
        this.recomputeStats(engine);
        engine.combatTexts.addText(this.x, this.y, 'SPRINT!', 'status');
        break;
      case 'aegis':
        this.shield = 750 + this.level * 50;
        this.shieldDuration = 4.0;
        engine.combatTexts.addText(this.x, this.y, 'AEGIS SHIELD!', 'status');
        break;
    }
    return true;
  }

  // --- Targeting Helpers ---
  findBestTarget(maxRange, engine) {
    const enemyTeam = this.team === 'blue' ? 'red' : 'blue';
    let target = null;
    let minHp = 999999;

    // 1. Prioritize low-HP enemy heroes in range
    for (const h of engine.heroes) {
      if (h.team === enemyTeam && h.alive && !h.isConcealed) {
        const d = Math.hypot(h.x - this.x, h.y - this.y);
        if (d <= maxRange) {
          if (h.hp < minHp) {
            minHp = h.hp;
            target = h;
          }
        }
      }
    }
    if (target) return target;

    // 2. Target enemy turrets
    for (const t of engine.map.turrets) {
      if (t.team === enemyTeam && t.alive) {
        const d = Math.hypot(t.x - this.x, t.y - this.y);
        if (d <= maxRange) return t;
      }
    }

    // 3. Target enemy minions
    let closestM = null;
    let minMDist = maxRange;
    for (const m of engine.minionManager.minions) {
      if (m.team === enemyTeam && m.alive) {
        const d = Math.hypot(m.x - this.x, m.y - this.y);
        if (d <= minMDist) {
          minMDist = d;
          closestM = m;
        }
      }
    }
    if (closestM) return closestM;

    // 4. Target Jungle boss/creeps if nearby
    for (const c of engine.jungleManager.camps) {
      if (c.alive && Math.hypot(c.x - this.x, c.y - this.y) <= maxRange) return c;
    }
    if (engine.jungleManager.turtleAlive && engine.jungleManager.turtleEntity) {
      if (Math.hypot(engine.jungleManager.turtleEntity.x - this.x, engine.jungleManager.turtleEntity.y - this.y) <= maxRange) {
        return engine.jungleManager.turtleEntity;
      }
    }
    if (engine.jungleManager.lordAlive && engine.jungleManager.lordEntity) {
      if (Math.hypot(engine.jungleManager.lordEntity.x - this.x, engine.jungleManager.lordEntity.y - this.y) <= maxRange) {
        return engine.jungleManager.lordEntity;
      }
    }

    return null;
  }

  findClosestMonsterOrMinion(maxRange, engine) {
    // Check Turtle or Lord
    if (engine.jungleManager.turtleAlive && engine.jungleManager.turtleEntity) {
      const d = Math.hypot(engine.jungleManager.turtleEntity.x - this.x, engine.jungleManager.turtleEntity.y - this.y);
      if (d <= maxRange) return engine.jungleManager.turtleEntity;
    }
    if (engine.jungleManager.lordAlive && engine.jungleManager.lordEntity) {
      const d = Math.hypot(engine.jungleManager.lordEntity.x - this.x, engine.jungleManager.lordEntity.y - this.y);
      if (d <= maxRange) return engine.jungleManager.lordEntity;
    }

    // Check Jungle Camps
    for (const c of engine.jungleManager.camps) {
      if (c.alive && Math.hypot(c.x - this.x, c.y - this.y) <= maxRange) return c;
    }

    // Check Minions
    const enemyTeam = this.team === 'blue' ? 'red' : 'blue';
    for (const m of engine.minionManager.minions) {
      if (m.team === enemyTeam && m.alive && Math.hypot(m.x - this.x, m.y - this.y) <= maxRange) return m;
    }

    return null;
  }

  // Damage delivery primitives
  _dealAoeDamage(cx, cy, radius, damage, type, engine, onHit = null) {
    const enemyTeam = this.team === 'blue' ? 'red' : 'blue';

    // Damage enemy heroes
    engine.heroes.forEach(h => {
      if (h.team === enemyTeam && h.alive && Math.hypot(h.x - cx, h.y - cy) <= radius) {
        h.takeDamage(damage, type, this, engine);
        if (onHit) onHit(h);
      }
    });

    // Damage enemy minions
    engine.minionManager.minions.forEach(m => {
      if (m.team === enemyTeam && m.alive && Math.hypot(m.x - cx, m.y - cy) <= radius) {
        engine.minionManager.takeMinionDamage(m, damage, type, this, engine);
      }
    });

    // Damage neutral creeps
    engine.jungleManager.camps.forEach(c => {
      if (c.alive && Math.hypot(c.x - cx, c.y - cy) <= radius) {
        engine.jungleManager.damageCamp(c, damage, type, this, engine);
      }
    });
  }

  _dealLineDamage(angle, range, damage, type, engine, onHit = null) {
    const enemyTeam = this.team === 'blue' ? 'red' : 'blue';
    const lx2 = this.x + Math.cos(angle) * range;
    const ly2 = this.y + Math.sin(angle) * range;

    engine.heroes.forEach(h => {
      if (h.team === enemyTeam && h.alive) {
        const d = this._distToSegment(h.x, h.y, this.x, this.y, lx2, ly2);
        if (d <= h.radius + 20) {
          h.takeDamage(damage, type, this, engine);
          if (onHit) onHit(h);
        }
      }
    });

    engine.minionManager.minions.forEach(m => {
      if (m.team === enemyTeam && m.alive) {
        const d = this._distToSegment(m.x, m.y, this.x, this.y, lx2, ly2);
        if (d <= m.radius + 15) {
          engine.minionManager.takeMinionDamage(m, damage, type, this, engine);
        }
      }
    });
  }

  _dealConeDamage(centerAngle, range, damage, type, engine, onHit = null) {
    const enemyTeam = this.team === 'blue' ? 'red' : 'blue';
    const halfCone = Math.PI / 4; // 45 deg

    engine.heroes.forEach(h => {
      if (h.team === enemyTeam && h.alive) {
        const dist = Math.hypot(h.x - this.x, h.y - this.y);
        if (dist <= range) {
          const a = Math.atan2(h.y - this.y, h.x - this.x);
          let diff = Math.abs(a - centerAngle);
          while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);
          if (diff <= halfCone) {
            h.takeDamage(damage, type, this, engine);
            if (onHit) onHit(h);
          }
        }
      }
    });
  }

  _distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.hypot(px - x1, py - y1);
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }
}
