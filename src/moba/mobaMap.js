/**
 * Land of Dawn MOBA Map Engine.
 * 3-Lane Layout, 18 Turrets + 2 Base Cores, Jungle Camps, River, Bushes.
 * 100% Pure JavaScript.
 */

export class MobaMap {
  constructor() {
    this.width = 3200;
    this.height = 3200;

    // Base Fountains & Cores
    this.blueFountain = { x: 260, y: 2940, radius: 240, team: 'blue' };
    this.redFountain = { x: 2940, y: 260, radius: 240, team: 'red' };

    this.blueCore = { x: 380, y: 2820, hp: 5000, maxHp: 5000, radius: 60, team: 'blue', alive: true };
    this.redCore = { x: 2820, y: 380, hp: 5000, maxHp: 5000, radius: 60, team: 'red', alive: true };

    // Waypoints for the 3 lanes (Optimized clearance corridors, never intersect turret centers)
    this.lanePaths = {
      top: [
        { x: 380, y: 2820 },
        { x: 490, y: 2500 },
        { x: 490, y: 2000 },
        { x: 490, y: 1400 },
        { x: 490, y: 490 },  // River Corner
        { x: 1400, y: 490 },
        { x: 2000, y: 490 },
        { x: 2500, y: 490 },
        { x: 2820, y: 380 }
      ],
      mid: [
        { x: 380, y: 2820 },
        { x: 720, y: 2480 },
        { x: 1020, y: 2180 },
        { x: 1335, y: 1865 }, // Smooth detour around b_mid_outer (1300, 1900)
        { x: 1600, y: 1600 }, // River Center
        { x: 1865, y: 1335 }, // Smooth detour around r_mid_outer (1900, 1300)
        { x: 2180, y: 1020 },
        { x: 2480, y: 720 },
        { x: 2820, y: 380 }
      ],
      bot: [
        { x: 380, y: 2820 },
        { x: 700, y: 2710 },
        { x: 1200, y: 2710 },
        { x: 1800, y: 2710 },
        { x: 2710, y: 2710 }, // River Corner
        { x: 2710, y: 1800 },
        { x: 2710, y: 1200 },
        { x: 2710, y: 700 },
        { x: 2820, y: 380 }
      ]
    };

    // Tactical Bushes (Concealment zones)
    this.bushes = [
      // Top Lane & River Bushes
      { id: 'b_top_river_1', x: 750, y: 600, radius: 75 },
      { id: 'b_top_river_2', x: 600, y: 750, radius: 75 },
      { id: 'b_top_lane_1', x: 450, y: 1550, radius: 70 },
      { id: 'b_top_lane_2', x: 1650, y: 450, radius: 70 },

      // Mid River Bushes (High-priority ambush spots)
      { id: 'b_mid_top_river', x: 1400, y: 1400, radius: 85 },
      { id: 'b_mid_bot_river', x: 1800, y: 1800, radius: 85 },
      { id: 'b_mid_lane_blue', x: 1200, y: 2000, radius: 70 },
      { id: 'b_mid_lane_red', x: 2000, y: 1200, radius: 70 },

      // Bot Lane & River Bushes
      { id: 'b_bot_river_1', x: 2450, y: 2600, radius: 75 },
      { id: 'b_bot_river_2', x: 2600, y: 2450, radius: 75 },
      { id: 'b_bot_lane_1', x: 1550, y: 2750, radius: 70 },
      { id: 'b_bot_lane_2', x: 2750, y: 1650, radius: 70 },

      // Jungle Buff Bushes
      { id: 'b_blue_buff_blue', x: 920, y: 2050, radius: 70 },
      { id: 'b_red_buff_blue', x: 1480, y: 2400, radius: 70 },
      { id: 'b_blue_buff_red', x: 2280, y: 1150, radius: 70 },
      { id: 'b_red_buff_red', x: 1720, y: 800, radius: 70 },

      // Objective Pits
      { id: 'b_pit_turtle', x: 1250, y: 1050, radius: 80 },
      { id: 'b_pit_lord', x: 1950, y: 2150, radius: 80 }
    ];

    // Initial Turret definitions
    this.turrets = this._initTurrets();
  }

  _initTurrets() {
    return [
      // --- BLUE TEAM TURRETS ---
      // Top Lane
      { id: 'b_top_outer', team: 'blue', lane: 'top', tier: 1, x: 450, y: 1400, hp: 3800, maxHp: 3800, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 500 },
      { id: 'b_top_inner', team: 'blue', lane: 'top', tier: 2, x: 450, y: 2000, hp: 4400, maxHp: 4400, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      { id: 'b_top_inhib', team: 'blue', lane: 'top', tier: 3, x: 450, y: 2500, hp: 5000, maxHp: 5000, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      // Mid Lane
      { id: 'b_mid_outer', team: 'blue', lane: 'mid', tier: 1, x: 1300, y: 1900, hp: 3800, maxHp: 3800, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 500 },
      { id: 'b_mid_inner', team: 'blue', lane: 'mid', tier: 2, x: 950, y: 2250, hp: 4400, maxHp: 4400, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      { id: 'b_mid_inhib', team: 'blue', lane: 'mid', tier: 3, x: 680, y: 2520, hp: 5000, maxHp: 5000, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      // Bot Lane
      { id: 'b_bot_outer', team: 'blue', lane: 'bot', tier: 1, x: 1800, y: 2750, hp: 3800, maxHp: 3800, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 500 },
      { id: 'b_bot_inner', team: 'blue', lane: 'bot', tier: 2, x: 1200, y: 2750, hp: 4400, maxHp: 4400, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      { id: 'b_bot_inhib', team: 'blue', lane: 'bot', tier: 3, x: 700, y: 2750, hp: 5000, maxHp: 5000, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },

      // --- RED TEAM TURRETS ---
      // Top Lane
      { id: 'r_top_outer', team: 'red', lane: 'top', tier: 1, x: 1400, y: 450, hp: 3800, maxHp: 3800, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 500 },
      { id: 'r_top_inner', team: 'red', lane: 'top', tier: 2, x: 2000, y: 450, hp: 4400, maxHp: 4400, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      { id: 'r_top_inhib', team: 'red', lane: 'top', tier: 3, x: 2500, y: 450, hp: 5000, maxHp: 5000, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      // Mid Lane
      { id: 'r_mid_outer', team: 'red', lane: 'mid', tier: 1, x: 1900, y: 1300, hp: 3800, maxHp: 3800, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 500 },
      { id: 'r_mid_inner', team: 'red', lane: 'mid', tier: 2, x: 2250, y: 950, hp: 4400, maxHp: 4400, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      { id: 'r_mid_inhib', team: 'red', lane: 'mid', tier: 3, x: 2520, y: 680, hp: 5000, maxHp: 5000, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      // Bot Lane
      { id: 'r_bot_outer', team: 'red', lane: 'bot', tier: 1, x: 2750, y: 1800, hp: 3800, maxHp: 3800, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 500 },
      { id: 'r_bot_inner', team: 'red', lane: 'bot', tier: 2, x: 2750, y: 1200, hp: 4400, maxHp: 4400, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 },
      { id: 'r_bot_inhib', team: 'red', lane: 'bot', tier: 3, x: 2750, y: 700, hp: 5000, maxHp: 5000, radius: 36, alive: true, range: 240, attackCooldown: 0, shieldPlating: 0 }
    ];
  }

  isInBush(x, y) {
    for (const b of this.bushes) {
      const dist = Math.hypot(b.x - x, b.y - y);
      if (dist < b.radius) return b;
    }
    return null;
  }

  isInFountain(x, y, team) {
    const f = team === 'blue' ? this.blueFountain : this.redFountain;
    return Math.hypot(f.x - x, f.y - y) < f.radius;
  }

  isEnemyFountain(x, y, team) {
    const f = team === 'blue' ? this.redFountain : this.blueFountain;
    return Math.hypot(f.x - x, f.y - y) < f.radius;
  }

  isInRiver(x, y) {
    // Diagonal river belt running from (0, 1600)-(1600,0) down to (1600, 3200)-(3200, 1600)
    return Math.abs(x + y - 3200) < 220;
  }

  getLaneWaypoints(lane, team = 'blue') {
    const raw = this.lanePaths[lane] || this.lanePaths.mid;
    return team === 'blue' ? raw : [...raw].reverse();
  }

  findNearestWaypointIndex(path, x, y) {
    let nearestIdx = 0;
    let minDist = 999999;
    for (let i = 0; i < path.length; i++) {
      const d = Math.hypot(path[i].x - x, path[i].y - y);
      if (d < minDist) {
        minDist = d;
        nearestIdx = i;
      }
    }
    return nearestIdx;
  }

  clampPosition(x, y) {
    return {
      x: Math.max(80, Math.min(this.width - 80, x)),
      y: Math.max(80, Math.min(this.height - 80, y))
    };
  }
}
