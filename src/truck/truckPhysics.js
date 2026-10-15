/**
 * Truck Simulator: Mud & Cargo - 100% Custom 2D Multi-Body & Articulated Physics
 * Supports 4x4, 6x6, 8x8, and Articulated Semi-Trailer (truk gandeng bersambung).
 * Dynamic logical axle spacing (zero overlap/clipping), anti-fling speed governor,
 * critically damped suspension, and ultra-stable articulated trailer kinematics.
 */

export const CARGO_TYPES = [
  { id: 'logs', name: 'Kayu Pinus Gelondongan', icon: '🪵', weight: 450, length: 50, height: 16, color: '#854d0e', desc: 'Batang kayu bundar gelondongan' },
  { id: 'stone', name: 'Balok Granit Tambang', icon: '🪨', weight: 800, length: 34, height: 24, color: '#64748b', desc: 'Batu granit padat ekstra berat' },
  { id: 'fuel', name: 'Drum Minyak Industri', icon: '🛢️', weight: 350, length: 22, height: 28, color: '#dc2626', desc: 'Drum bahan bakar minyak baja' },
  { id: 'crates', name: 'Peti Suku Cadang Mesin', icon: '📦', weight: 280, length: 28, height: 22, color: '#d97706', desc: 'Peti kayu industri berpalet' },
  { id: 'pipes', name: 'Pipa Baja Konstruksi', icon: '⛓️', weight: 600, length: 60, height: 18, color: '#475569', desc: 'Pipa baja konstruksi memanjang' },
  { id: 'concrete', name: 'Girder Beton Jembatan', icon: '🏗️', weight: 950, length: 56, height: 22, color: '#94a3b8', desc: 'Beton cor bertulang jembatan' },
  { id: 'machinery', name: 'Generator Turbin Heavy', icon: '⚙️', weight: 1100, length: 38, height: 28, color: '#0284c7', desc: 'Mesin generator industri tambang' },
  { id: 'pallet', name: 'Palet Logistik Cepat', icon: '📦', weight: 200, length: 24, height: 18, color: '#ca8a04', desc: 'Palet karton logistik ekspres' }
];

export const TRUCK_CONFIGS = [
  {
    id: 'pickup_4x4',
    name: 'Pickup / Light Hauler 4x4',
    badge: '4x4',
    axles: 2,
    hasTrailer: false,
    baseWeight: 2100,
    chassisLength: 90,
    desc: '2 Gandar (4 Roda) lincah untuk jalur sempit'
  },
  {
    id: 'rigid_6x6',
    name: 'Heavy Rigid 6x6 (Tandem Belakang)',
    badge: '6x6',
    axles: 3,
    hasTrailer: false,
    baseWeight: 3200,
    chassisLength: 125,
    desc: '3 Gandar (6 Roda) gandar tandem belakang bertenaga'
  },
  {
    id: 'heavy_8x8',
    name: 'Kolosal Hauler 8x8 (Twin Steer)',
    badge: '8x8',
    axles: 4,
    hasTrailer: false,
    baseWeight: 4500,
    chassisLength: 155,
    desc: '4 Gandar (8 Roda) monster segala medan untuk beban raksasa'
  },
  {
    id: 'semi_trailer',
    name: 'Truk Gandeng Semi-Trailer (Articulated)',
    badge: 'TRAILER',
    axles: 4,
    hasTrailer: true,
    trailerAxles: 2,
    baseWeight: 4400,
    chassisLength: 82,
    trailerLength: 130,
    desc: 'Truk Kepala Traktor + Gandengan Trailer bersambung sendi artikulasi'
  }
];

export const CHASSIS_LENGTHS = [
  { id: 'short', name: 'Sasis Pendek (85%)', lengthFactor: 0.88, weightDelta: -250, desc: 'Lincah di tikungan sempit' },
  { id: 'std', name: 'Sasis Standar (100%)', lengthFactor: 1.0, weightDelta: 0, desc: 'Keseimbangan ideal' },
  { id: 'long', name: 'Sasis Panjang (120%)', lengthFactor: 1.2, weightDelta: 350, desc: 'Bak kargo lebih luas' },
  { id: 'extra', name: 'Sasis Ekstra Panjang (140%)', lengthFactor: 1.4, weightDelta: 700, desc: 'Kapasitas muat maksimal' }
];

export const TRUCK_BEDS = [
  { id: 'flatbed', name: 'Bak Kayu Tradisional', weight: 400, maxLoad: 5000, desc: 'Dinding pasak terbuka, akses muat 360°' },
  { id: 'dump', name: 'Bak Besi Dump Tambang', weight: 800, maxLoad: 9000, desc: 'Baja keras tahan benturan batu berat' },
  { id: 'box', name: 'Boks Kargo Tertutup', weight: 650, maxLoad: 6000, desc: 'Kedap lumpur, debu dan hujan' },
  { id: 'lowboy', name: 'Lowboy Trailer Alat Berat', weight: 1100, maxLoad: 16000, desc: 'Dek lantai baja rendah untuk muatan berat' }
];

export const ENGINES = [
  { id: 'diesel_4cyl', name: '2.8L Turbo Diesel', power: 160, torque: 420, weight: 350, desc: 'Responsif & hemat untuk 4x4' },
  { id: 'inline_6', name: '6.7L Inline-6 Heavy', power: 340, torque: 1150, weight: 580, desc: 'Torsi badak medan bebatuan dan lumpur' },
  { id: 'v8_bigrig', name: '12.8L V8 Big Rig Turbo', power: 580, torque: 2400, weight: 850, desc: 'Tenaga brutal penghela beban 20+ ton' },
  { id: 'twin_v12', name: '16.0L Twin-Turbo Hauler', power: 780, torque: 3500, weight: 1150, desc: 'Mesin super kolosal tanjakan ekstrem' }
];

export const GEARBOXES = [
  { id: 'manual_5', name: '5-Speed Manual Serbaguna', gears: [-3.5, 0, 4.2, 2.5, 1.6, 1.0, 0.78], desc: 'Rasio umum serbaguna' },
  { id: 'splitter_10', name: '10-Speed Hi/Lo Splitter', gears: [-5.0, 0, 6.8, 4.8, 3.4, 2.4, 1.8, 1.3, 1.0, 0.8, 0.65], desc: 'Pilihan rasio lengkap tiap gradien' },
  { id: 'crawler_16', name: '16-Speed Heavy Crawler', gears: [-7.5, 0, 9.8, 7.2, 5.2, 3.8, 2.8, 2.0, 1.5, 1.1, 0.9, 0.7], desc: 'Gigi 1 perayap lumpur beban ekstrem' }
];

export const SUSPENSIONS = [
  { id: 'leaf_std', name: 'Per Daun Multi-Leaf Standar', stiffness: 1.0, damping: 1.0, desc: 'Lentur harian' },
  { id: 'leaf_heavy', name: 'Per Daun Ganda 12-Lapis HD', stiffness: 1.8, damping: 1.5, desc: 'Kuat menahan beban puluhan ton' },
  { id: 'air_adaptive', name: 'Suspensi Udara Hidrolik Adaptif', stiffness: 2.2, damping: 2.0, desc: 'Peredam kejut cerdas anti goyang' }
];

export const TIRES = [
  { id: 'tire_highway', name: 'Ban Aspal Radial 31"', gripRoad: 1.0, gripMud: 0.35, radius: 18, desc: 'Cepat di aspal halus' },
  { id: 'tire_allterrain', name: 'Ban All-Terrain Gripper 35"', gripRoad: 0.9, gripMud: 0.8, radius: 21, desc: 'Kembangan kasar tanah & batu' },
  { id: 'tire_rock', name: 'Ban Rock Crawler Lug 38"', gripRoad: 0.85, gripMud: 0.95, radius: 23, desc: 'Cakar batu cengkeraman terjal' },
  { id: 'tire_monster', name: 'Ban Balon Monster Offroad 44"', gripRoad: 0.75, gripMud: 1.25, radius: 26, desc: 'Raksasa 44" mengapung di lumpur hidup' }
];

export class TruckSimulation {
  constructor() {
    this.generateTerrain();
    this.resetDefaults();
  }

  resetDefaults() {
    this.truckConfigId = 'rigid_6x6';
    this.chassisLengthId = 'std';
    this.bedId = 'flatbed';
    this.engineId = 'inline_6';
    this.gearboxId = 'splitter_10';
    this.suspensionId = 'leaf_heavy';
    this.tireId = 'tire_allterrain';

    // Freeform drag & drop cargos array:
    this.cargos = [];

    // Driving Controls
    this.throttle = 0;
    this.brake = 0;
    this.handbrake = false;
    this.diffLock = true;
    this.headlights = true;
    this.currentGearIndex = 2; // 1st Forward Gear

    // Telemetry
    this.engineRpm = 850;
    this.engineTemp = 75;
    this.isOverheated = false;
    this.distanceTraveled = 0;
    this.hasFinished = false;
    this.isRolledOver = false;

    // Articulated trailer pitch angle
    this.trailerAngle = 0;
    this.trailerAngularVel = 0;

    this.rebuildWheelSetup();
    this.respawnAt(120);
  }

  // Dynamic Logical Axle Spacing (Never Overlap, Auto Adjusts to Tire Size and Config)
  rebuildWheelSetup() {
    const config = TRUCK_CONFIGS.find(c => c.id === this.truckConfigId) || TRUCK_CONFIGS[1];
    const lenDef = CHASSIS_LENGTHS.find(l => l.id === this.chassisLengthId) || CHASSIS_LENGTHS[1];
    const tireDef = TIRES.find(t => t.id === this.tireId) || TIRES[0];
    const radius = tireDef.radius || 21;
    const lengthMul = lenDef.lengthFactor;

    // Minimum physical clearance between adjacent tire edges: at least 2*radius + 8px
    const minAxleDistance = Math.round((radius * 2) + 8);

    this.wheels = [];
    this.trailerWheels = null;

    if (config.id === 'pickup_4x4') {
      const wheelbase = Math.max(minAxleDistance + 24, Math.round(76 * lengthMul));
      const frontX = Math.round(wheelbase * 0.45);
      const rearX = frontX - wheelbase;
      this.wheels.push(
        { id: 'front', relX: frontX, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'rear1', relX: rearX, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 }
      );
    } else if (config.id === 'rigid_6x6') {
      const tandemSpacing = Math.max(minAxleDistance, Math.round(44 * lengthMul));
      const rear1X = Math.round(-20 * lengthMul);
      const rear2X = rear1X - tandemSpacing;
      const frontX = Math.round(44 * lengthMul);
      this.wheels.push(
        { id: 'front', relX: frontX, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'rear1', relX: rear1X, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'rear2', relX: rear2X, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 }
      );
    } else if (config.id === 'heavy_8x8') {
      const steerSpacing = Math.max(minAxleDistance, Math.round(42 * lengthMul));
      const tandemSpacing = Math.max(minAxleDistance, Math.round(44 * lengthMul));
      const front2X = Math.round(24 * lengthMul);
      const front1X = front2X + steerSpacing;
      const rear1X = Math.round(-20 * lengthMul);
      const rear2X = rear1X - tandemSpacing;
      this.wheels.push(
        { id: 'front1', relX: front1X, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'front2', relX: front2X, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'rear1', relX: rear1X, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'rear2', relX: rear2X, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 }
      );
    } else if (config.id === 'semi_trailer') {
      // Tractor Cab: 1 front steer, 1 drive axle
      const tractorWheelbase = Math.max(minAxleDistance + 14, 62);
      const frontX = 30;
      const rearX = frontX - tractorWheelbase;
      this.wheels.push(
        { id: 'front', relX: frontX, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'rear1', relX: rearX, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 }
      );

      // Semi-Trailer: Tandem rear trailer axles properly spaced
      const trailerTandemSpacing = minAxleDistance;
      const trailerLen = Math.max(130, trailerTandemSpacing * 2 + 45);
      config.trailerLength = trailerLen;
      const tAxle1 = Math.round(-trailerLen + trailerTandemSpacing + 18);
      const tAxle2 = Math.round(tAxle1 - trailerTandemSpacing);

      this.trailerWheels = [
        { id: 'trailer1', relX: tAxle1, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 },
        { id: 'trailer2', relX: tAxle2, relY: 14, isGrounded: true, spinAngle: 0, angularVel: 0, suspensionDeflection: 0 }
      ];
    }

    if (!config.hasTrailer && this.cargos) {
      this.cargos.forEach(c => {
        if (c.carrier === 'trailer') {
          c.carrier = 'cab';
          c.relX = -25;
          c.relY = -20;
          c.velX = 0;
          c.velY = 0;
        }
      });
    }
  }

  respawnAt(targetX = 120) {
    this.x = targetX;
    this.vx = 0;
    this.vy = 0;
    this.angularVelocity = 0;
    this.isRolledOver = false;

    const config = TRUCK_CONFIGS.find(c => c.id === this.truckConfigId) || TRUCK_CONFIGS[0];
    const tireDef = TIRES.find(t => t.id === this.tireId) || TIRES[0];
    const firstWheel = this.wheels[0];
    const lastWheel = this.wheels[this.wheels.length - 1];

    const frontX = targetX + (firstWheel?.relX || 40);
    const rearX = targetX + (lastWheel?.relX || -40);

    const groundF = this.getTerrainAt(frontX);
    const groundR = this.getTerrainAt(rearX);

    // Initial angle naturally matches the ground slope
    this.angle = Math.atan2(groundF.y - groundR.y, frontX - rearX);
    this.trailerAngle = this.angle;
    this.trailerAngularVel = 0;

    const avgGroundY = (groundF.y + groundR.y) / 2;
    this.y = avgGroundY - tireDef.radius - 14;

    // Stable trailer pitch at spawn
    if (config.hasTrailer && this.trailerWheels) {
      const hitchX = this.x - 26;
      const hitchY = this.y + 4;
      const trailerLen = config.trailerLength || 130;
      const bogieDist = trailerLen - 25;
      const trailerGround = this.getTerrainAt(hitchX - bogieDist);
      const targetBogieWheelY = trailerGround.y - tireDef.radius;
      this.trailerAngle = Math.atan2(hitchY + 14 - targetBogieWheelY, bogieDist);
      this.trailerAngularVel = 0;
    }

    this.wheels.forEach(w => {
      w.isGrounded = true;
      w.angularVel = 0;
      w.suspensionDeflection = 0;
    });

    if (this.trailerWheels) {
      this.trailerWheels.forEach(w => {
        w.isGrounded = true;
        w.angularVel = 0;
        w.suspensionDeflection = 0;
      });
    }
  }

  getDiagnostics() {
    const config = TRUCK_CONFIGS.find(c => c.id === this.truckConfigId) || TRUCK_CONFIGS[0];
    const lenDef = CHASSIS_LENGTHS.find(l => l.id === this.chassisLengthId) || CHASSIS_LENGTHS[1];
    const bed = TRUCK_BEDS.find(b => b.id === this.bedId) || TRUCK_BEDS[0];
    const engine = ENGINES.find(e => e.id === this.engineId) || ENGINES[0];
    const susp = SUSPENSIONS.find(s => s.id === this.suspensionId) || SUSPENSIONS[0];
    const tire = TIRES.find(t => t.id === this.tireId) || TIRES[0];

    const baseMass = config.baseWeight + lenDef.weightDelta + bed.weight + engine.weight;

    let cabCargoMass = 0;
    let cabCargoMoment = 0;
    let trailerCargoMass = 0;

    this.cargos.forEach(c => {
      if (c.carrier === 'trailer' && config.hasTrailer) {
        trailerCargoMass += c.weight;
      } else {
        cabCargoMass += c.weight;
        cabCargoMoment += c.weight * (c.relX || 0);
      }
    });

    const cargoMass = cabCargoMass + trailerCargoMass;
    const totalWeight = baseMass + cargoMass;
    let centerOfMassX = cabCargoMass > 0 ? (cabCargoMoment / cabCargoMass) : -10;
    if (config.hasTrailer) {
      const hitchTransfer = trailerCargoMass * 0.32;
      centerOfMassX = (cabCargoMoment + hitchTransfer * (-26)) / Math.max(1, cabCargoMass + hitchTransfer);
    }

    const warnings = [];
    const maxCargoLoad = bed.maxLoad * (config.hasTrailer ? 1.6 : 1);
    const isOverload = cargoMass > maxCargoLoad;

    if (isOverload) {
      warnings.push(`Kelebihan Beban: ${cargoMass.toLocaleString()}kg melebihi limit (${maxCargoLoad.toLocaleString()}kg)!`);
    }

    if (engine.torque > 2000 && susp.stiffness < 1.4) {
      warnings.push('Torsi Ekstrem: Disarankan memakai suspensi per daun HD atau udara adaptif.');
    }

    if (tire.id === 'tire_highway' && totalWeight > 6500) {
      warnings.push('Traksi Rendah: Ban aspal mudah selip di lumpur tanjakan.');
    }

    const rearBias = Math.max(20, Math.min(80, Math.round(50 - (centerOfMassX * 0.6))));
    const frontBias = 100 - rearBias;

    let stabilityRating = 100 - (cargoMass / 180) - (Math.abs(centerOfMassX) * 0.7);
    if (config.hasTrailer) stabilityRating -= 5;
    stabilityRating = Math.max(25, Math.min(100, Math.round(stabilityRating)));

    return {
      totalWeight,
      cargoWeight: cargoMass,
      cabCargoMass,
      trailerCargoMass,
      maxLoad: maxCargoLoad,
      centerOfMassX,
      frontBias,
      rearBias,
      stabilityRating,
      warnings,
      isOverload,
      cargoCount: this.cargos.length
    };
  }

  generateTerrain() {
    this.terrainPoints = [];
    const totalDist = 4500;
    const step = 20;

    for (let x = 0; x <= totalDist; x += step) {
      let y = 300;
      let surfaceType = 'road';

      if (x < 360) {
        y = 300;
        surfaceType = 'road';
      } else if (x < 950) {
        const localX = x - 360;
        y = 300 - Math.sin(localX * 0.008) * 32 - Math.sin(localX * 0.02) * 12;
        surfaceType = 'dirt';
      } else if (x < 1700) {
        const localX = x - 950;
        y = 265 - (localX * 0.12) + Math.sin(localX * 0.035) * 14 + Math.cos(localX * 0.07) * 7;
        surfaceType = 'rock';
      } else if (x < 2400) {
        const localX = x - 1700;
        y = 175 + Math.sin(localX * 0.014) * 20;
        surfaceType = 'mud';
      } else if (x < 2900) {
        const localX = x - 2400;
        const bridgeSag = Math.sin((localX / 500) * Math.PI) * 20;
        y = 185 + bridgeSag;
        surfaceType = 'bridge';
      } else if (x < 3700) {
        const localX = x - 2900;
        y = 185 + (localX * 0.11) + Math.sin(localX * 0.028) * 12;
        surfaceType = localX > 450 ? 'dirt' : 'rock';
      } else {
        const localX = x - 3700;
        y = 273 - Math.sin(localX * 0.005) * 12;
        surfaceType = localX > 350 ? 'road' : 'dirt';
      }

      this.terrainPoints.push({ x, y, surfaceType });
    }
  }

  getTerrainHeight(worldX) {
    if (!this.terrainPoints || this.terrainPoints.length === 0) return 300;
    const first = this.terrainPoints[0];
    const last = this.terrainPoints[this.terrainPoints.length - 1];

    if (worldX <= first.x) return first.y;
    if (worldX >= last.x) return last.y;

    const step = 20;
    const index = Math.floor(worldX / step);
    const p1 = this.terrainPoints[index] || first;
    const p2 = this.terrainPoints[index + 1] || last;

    const t = Math.max(0, Math.min(1, (worldX - p1.x) / (p2.x - p1.x || 1)));
    return p1.y + (p2.y - p1.y) * t;
  }

  getTerrainAt(worldX) {
    if (!this.terrainPoints || this.terrainPoints.length === 0) return { y: 300, slope: 0, surfaceType: 'road' };

    const first = this.terrainPoints[0];
    const last = this.terrainPoints[this.terrainPoints.length - 1];

    if (worldX <= first.x) return { y: first.y, slope: 0, surfaceType: first.surfaceType };
    if (worldX >= last.x) return { y: last.y, slope: 0, surfaceType: last.surfaceType };

    const step = 20;
    const index = Math.floor(worldX / step);
    const p1 = this.terrainPoints[index] || first;
    const p2 = this.terrainPoints[index + 1] || last;

    const t = Math.max(0, Math.min(1, (worldX - p1.x) / (p2.x - p1.x || 1)));
    const y = p1.y + (p2.y - p1.y) * t;

    // Continuous smooth slope across terrain segment vertices
    const yLeft = this.getTerrainHeight(worldX - 10);
    const yRight = this.getTerrainHeight(worldX + 10);
    const slope = Math.atan2(yRight - yLeft, 20);

    return { y, slope, surfaceType: p1.surfaceType };
  }

  getBedBounds(carrier) {
    const config = TRUCK_CONFIGS.find(c => c.id === this.truckConfigId) || TRUCK_CONFIGS[0];
    const lenDef = CHASSIS_LENGTHS.find(l => l.id === this.chassisLengthId) || CHASSIS_LENGTHS[1];
    const lenMul = lenDef.lengthFactor || 1.0;
    const rearWheel = this.wheels[this.wheels.length - 1];
    const tireDef = TIRES.find(t => t.id === this.tireId) || TIRES[0];
    const radius = tireDef.radius || 21;
    const minRearX = rearWheel ? (rearWheel.relX - radius - 6) : -65;
    const chassisRear = Math.min(minRearX, Math.round(-65 * lenMul));

    if (carrier === 'trailer' && config.hasTrailer) {
      const trailerLen = config.trailerLength || 130;
      return {
        carrier: 'trailer',
        floorY: -8, // Trailer deck floor surface
        minX: -trailerLen + 8,
        maxX: -10
      };
    } else {
      let floorY = -2;
      if (this.bedId === 'dump' || this.bedId === 'box') {
        floorY = 6;
      } else if (this.bedId === 'lowboy') {
        floorY = -4;
      } else {
        floorY = -2;
      }
      return {
        carrier: 'cab',
        floorY,
        minX: config.hasTrailer ? -38 : (chassisRear + 4),
        maxX: 14
      };
    }
  }

  updateCargos(dt) {
    if (!this.cargos || this.cargos.length === 0) return;

    const config = TRUCK_CONFIGS.find(c => c.id === this.truckConfigId) || TRUCK_CONFIGS[0];

    // Auto-migrate trailer cargo if truck was reconfigured to non-trailer
    if (!config.hasTrailer) {
      for (const c of this.cargos) {
        if (c.carrier === 'trailer') {
          c.carrier = 'cab';
          c.relX = -25;
          c.relY = -20;
          c.velX = 0;
          c.velY = 0;
        }
      }
    }

    // Sort descending by relY so lower cargos settle first, enabling solid stacking
    const sorted = [...this.cargos].sort((a, b) => (b.relY || 0) - (a.relY || 0));

    for (const c of sorted) {
      if (c.isBeingDragged) {
        c.velX = 0;
        c.velY = 0;
        continue;
      }

      const bounds = this.getBedBounds(c.carrier);
      const rad = c.angle || 0;
      const cosA = Math.abs(Math.cos(rad));
      const sinA = Math.abs(Math.sin(rad));
      const effW = (c.length || 30) * cosA + (c.height || 20) * sinA;
      const effH = (c.length || 30) * sinA + (c.height || 20) * cosA;

      // Base resting Y on this carrier's bed / deck floor
      const baseRestY = bounds.floorY - effH / 2;
      let targetRestY = baseRestY;

      // Check vertical stacking onto lower cargos in the same carrier
      for (const other of this.cargos) {
        if (other === c || other.carrier !== c.carrier) continue;
        const oRad = other.angle || 0;
        const oEffW = (other.length || 30) * Math.abs(Math.cos(oRad)) + (other.height || 20) * Math.abs(Math.sin(oRad));
        const oEffH = (other.length || 30) * Math.abs(Math.sin(oRad)) + (other.height || 20) * Math.abs(Math.cos(oRad));

        const overlapLimit = (effW + oEffW) * 0.44;
        if (Math.abs(c.relX - other.relX) < overlapLimit) {
          // If other cargo is lower down (greater Y)
          if (other.relY > c.relY - 1) {
            const stackY = other.relY - (oEffH + effH) / 2;
            if (stackY < targetRestY) {
              targetRestY = stackY;
            }
          }
        }
      }

      // 1. Realistic Gravitational Drop
      const gravity = 620; // px/s²
      c.velY = (c.velY || 0) + gravity * dt;
      c.relY = (c.relY || 0) + c.velY * dt;

      // Ground / floor contact resolution
      if (c.relY >= targetRestY) {
        c.relY = targetRestY;
        if (c.velY > 0) {
          if (c.velY > 60) {
            c.velY = -c.velY * 0.12; // Damped tactile thud
          } else {
            c.velY = 0;
          }
        }
        // Bed surface friction
        c.velX = (c.velX || 0) * 0.82;
      }

      // 2. Horizontal inertia & slope pull
      const carrierAngle = (c.carrier === 'trailer' && config.hasTrailer) ? this.trailerAngle : this.angle;
      const slopeForce = Math.sin(carrierAngle) * 380;
      c.velX = (c.velX || 0) + slopeForce * dt;
      c.relX = (c.relX || 0) + c.velX * dt;

      // 3. Lateral containment inside truck bed or trailer
      const minX = bounds.minX + effW / 2;
      const maxX = bounds.maxX - effW / 2;
      if (c.relX < minX) {
        c.relX = minX;
        if (c.velX < 0) c.velX = 0;
      } else if (c.relX > maxX) {
        c.relX = maxX;
        if (c.velX > 0) c.velX = 0;
      }
    }
  }

  addFreeCargo(cargoTypeId, relX = -25, relY = -25, angle = 0, carrier = 'cab') {
    const def = CARGO_TYPES.find(c => c.id === cargoTypeId) || CARGO_TYPES[0];
    const newCargo = {
      id: `${def.id}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      typeId: def.id,
      name: def.name,
      weight: def.weight,
      relX,
      relY,
      velX: 0,
      velY: 0,
      angle: angle || 0,
      length: def.length,
      height: def.height,
      color: def.color,
      icon: def.icon,
      carrier: carrier || 'cab',
      isBeingDragged: false
    };

    this.cargos.push(newCargo);
    return newCargo;
  }

  removeCargoById(id) {
    const idx = this.cargos.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.cargos.splice(idx, 1);
      return true;
    }
    return false;
  }

  clearCargo() {
    this.cargos = [];
  }

  // 4-Substep stable physics solver with Anti-Fling Speed Governor
  step(dt) {
    if (this.isRolledOver) return;

    const clampedDt = Math.min(0.04, Math.max(0.001, dt));
    const subSteps = 4;
    const subDt = clampedDt / subSteps;

    for (let s = 0; s < subSteps; s++) {
      this.subStep(subDt);
    }
  }

  subStep(dt) {
    const engineDef = ENGINES.find(e => e.id === this.engineId) || ENGINES[0];
    const gearDef = GEARBOXES.find(g => g.id === this.gearboxId) || GEARBOXES[0];
    const suspDef = SUSPENSIONS.find(s => s.id === this.suspensionId) || SUSPENSIONS[0];
    const tireDef = TIRES.find(t => t.id === this.tireId) || TIRES[0];
    const config = TRUCK_CONFIGS.find(c => c.id === this.truckConfigId) || TRUCK_CONFIGS[0];

    const diag = this.getDiagnostics();
    const mass = Math.max(1200, diag.totalWeight);
    const gravity = 460; // px/s²

    // Update physical cargo falling, stacking, and resting
    this.updateCargos(dt);

    // 1. Engine & Gearbox
    const gearRatio = gearDef.gears[this.currentGearIndex] || 0;
    const isNeutral = gearRatio === 0;

    let targetRpm = 850;
    if (Math.abs(this.throttle) > 0.05) {
      targetRpm = 850 + Math.abs(this.throttle) * (engineDef.power * 14);
    }
    this.engineRpm += (targetRpm - this.engineRpm) * Math.min(1, dt * 7);

    if (this.engineRpm > 2900 || (Math.abs(this.throttle) > 0.8 && diag.isOverload)) {
      this.engineTemp += dt * 2.5;
    } else {
      this.engineTemp = Math.max(75, this.engineTemp - dt * 1.5);
    }
    this.isOverheated = this.engineTemp > 115;

    // Realistic gear-based speed limits (Anti-Fling Governor)
    // Low gears provide massive pulling torque at low speeds; high gears reach up to ~75 km/h
    let maxGearSpeed = 70; // px/s (~65 km/h)
    if (gearRatio < 0) maxGearSpeed = 16; // Reverse
    else if (gearRatio > 6.0) maxGearSpeed = 22; // Low crawler gear
    else if (gearRatio > 3.5) maxGearSpeed = 38;
    else if (gearRatio > 2.0) maxGearSpeed = 52;
    else if (gearRatio > 1.2) maxGearSpeed = 66;
    else maxGearSpeed = 82; // Top overdrive gear (~78 km/h max)

    let driveForce = 0;
    if (!isNeutral && !this.isOverheated) {
      const netTorque = (engineDef.torque * Math.abs(this.throttle)) * Math.min(8.0, Math.abs(gearRatio));
      driveForce = (gearRatio > 0 ? 1 : -1) * (netTorque / (tireDef.radius * 0.04));
      if (this.throttle < 0 && gearRatio > 0) driveForce = -driveForce;

      // Soft speed limiter per gear
      const currentSpeed = Math.abs(this.vx);
      if (currentSpeed > maxGearSpeed) {
        driveForce *= Math.max(0, 1 - (currentSpeed - maxGearSpeed) / 10);
      }
    }

    const isBraking = this.brake > 0.1 || this.handbrake;
    const brakeForceMag = (this.brake * 18000) + (this.handbrake ? 32000 : 0);

    // 2. Track Wheels & Ground Contacts
    const cosA = Math.cos(this.angle);
    const sinA = Math.sin(this.angle);
    let totalForceX = 0;
    let totalForceY = mass * gravity;

    const numWheels = this.wheels.length;
    let frontWheelWorld = null;
    let rearWheelWorld = null;
    let groundedCount = 0;

    for (let i = 0; i < numWheels; i++) {
      const w = this.wheels[i];
      const wx = this.x + (w.relX * cosA - w.relY * sinA);
      const wy = this.y + (w.relX * sinA + w.relY * cosA);

      const terrain = this.getTerrainAt(wx);
      const targetCenterY = terrain.y - tireDef.radius;
      const penetration = wy - targetCenterY;

      if (i === 0) frontWheelWorld = { x: wx, y: terrain.y };
      if (i === numWheels - 1) rearWheelWorld = { x: wx, y: terrain.y };

      if (penetration >= -3) {
        w.isGrounded = true;
        groundedCount++;
        // Realistic static suspension sag from truck base weight and loaded cargo
        const isRear = w.id.includes('rear');
        const cargoWeightShare = isRear ? (diag.cabCargoMass * 0.72 / Math.max(1, numWheels - 1)) : (diag.cabCargoMass * 0.28 / Math.max(1, numWheels));
        const wheelLoad = (config.baseWeight / numWheels) + cargoWeightShare;
        const staticSag = Math.min(7.5, (wheelLoad / 1200) * (1.5 / suspDef.stiffness));
        
        // Smooth suspension deflection interpolation (prevents instant snapping/jitter)
        const targetDef = Math.max(0, Math.min(11, penetration + staticSag * 0.4));
        w.suspensionDeflection = (w.suspensionDeflection || 0) + (targetDef - (w.suspensionDeflection || 0)) * Math.min(1, dt * 28);

        // Upward support force: Critically damped to eliminate wheel oscillations
        const restingWeightPerWheel = (mass * gravity) / numWheels;
        const kSpring = (restingWeightPerWheel / 4.8) * suspDef.stiffness;
        const cDamper = 2.0 * Math.sqrt(kSpring * (mass / numWheels)) * suspDef.damping;
        const relVy = this.vy + this.angularVelocity * (w.relX * cosA);

        // When chassis descends (relVy > 0), damper adds upward force (+ relVy * cDamper) to cushion landing.
        // When chassis rebounds (relVy < 0), damper reduces upward force to stop wheel/cab from launching into the air.
        const springForce = Math.max(0, penetration) * kSpring;
        const damperForce = relVy * cDamper;
        const rawForce = restingWeightPerWheel + springForce + damperForce;
        const fSusp = Math.max(0, Math.min(restingWeightPerWheel * 2.5, rawForce));

        // In screen coordinates (+Y down), ground normal vector pointing into air is (sin(slope), -cos(slope)).
        // On a downhill slope (slope > 0), normX > 0 pushes truck FORWARD (+X) down the slope.
        // On an uphill slope (slope < 0), normX < 0 pushes truck BACKWARD (-X), requiring throttle to climb.
        const normX = Math.sin(terrain.slope);
        const normY = -Math.cos(terrain.slope);
        totalForceX += normX * fSusp;
        totalForceY += normY * fSusp;

        // Grip & Traction
        let grip = terrain.surfaceType === 'mud' ? tireDef.gripMud : (terrain.surfaceType === 'rock' ? 0.9 : tireDef.gripRoad);
        if (this.diffLock) grip *= 1.35;

        // Drive effort
        const isDriveWheel = w.id.includes('rear') || this.diffLock || config.id === 'heavy_8x8';
        if (isDriveWheel && !isBraking) {
          const tractiveEffort = (driveForce / numWheels) * grip;
          totalForceX += Math.cos(terrain.slope) * tractiveEffort;
          totalForceY += Math.sin(terrain.slope) * tractiveEffort;
          w.angularVel = (this.vx / tireDef.radius) * 1.5;
        } else if (isBraking) {
          const bForce = Math.min(Math.abs(this.vx) * mass * 8, brakeForceMag) * grip;
          totalForceX -= Math.sign(this.vx || 1) * bForce * Math.cos(terrain.slope);
          totalForceY -= Math.sign(this.vx || 1) * bForce * Math.sin(terrain.slope);
          w.angularVel = 0;
        } else {
          w.angularVel = this.vx / tireDef.radius;
        }

        if (terrain.surfaceType === 'mud') {
          totalForceX -= this.vx * 280;
        }

        w.spinAngle += w.angularVel * dt * 4;
      } else {
        w.isGrounded = false;
        // Smooth relaxation in air
        w.suspensionDeflection = Math.max(0, (w.suspensionDeflection || 0) - dt * 25);
        w.spinAngle += (this.throttle * 8) * dt;
      }
    }

    // 3. Pitch Stabilization (Locks gently to road slope, zero backflips)
    if (frontWheelWorld && rearWheelWorld) {
      const roadSlope = Math.atan2(frontWheelWorld.y - rearWheelWorld.y, frontWheelWorld.x - rearWheelWorld.x);
      const angleErr = this.angle - roadSlope;

      if (groundedCount >= 1) {
        const alignSpring = mass * 40;
        const alignDamp = Math.sqrt(alignSpring * mass) * 2.2;
        const alignTorque = -angleErr * alignSpring - this.angularVelocity * alignDamp;
        this.angularVelocity += (alignTorque / (mass * 18)) * dt;
      }
    }

    // Drag
    totalForceX -= this.vx * 85;

    // 4. Integrate Velocities & Positions
    this.vx += (totalForceX / mass) * dt;
    this.vy += (totalForceY / mass) * dt;

    // Absolute Speed Governor (Prevents 300+ km/h glitch)
    const MAX_PHYSICS_VX = 88; // ~80 km/h top offroad speed
    this.vx = Math.max(-MAX_PHYSICS_VX, Math.min(MAX_PHYSICS_VX, this.vx));
    this.vy = Math.max(-110, Math.min(160, this.vy));

    this.angularVelocity *= 0.92;
    this.angle += this.angularVelocity * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Ground clamping (Bump stop to prevent clipping through terrain under heavy shocks)
    const curCos = Math.cos(this.angle);
    const curSin = Math.sin(this.angle);
    for (let i = 0; i < numWheels; i++) {
      const w = this.wheels[i];
      const effRelY = w.relY - (w.suspensionDeflection || 0);
      const wx = this.x + (w.relX * curCos - effRelY * curSin);
      const wy = this.y + (w.relX * curSin + effRelY * curCos);
      const ground = this.getTerrainAt(wx);
      const maxAllowedY = ground.y - tireDef.radius;

      // Allow natural suspension compression; only bump-stop if pushed deep past bottom-out
      if (wy > maxAllowedY + 2.0) {
        const excess = wy - (maxAllowedY + 2.0);
        this.y -= excess * 0.75;
        if (this.vy > 0) this.vy *= 0.25;
      }
    }

    // Road slope boundary clamp (max ±28° deviation)
    const midTerrain = this.getTerrainAt(this.x);
    const maxRelAngle = 0.50;
    this.angle = Math.max(midTerrain.slope - maxRelAngle, Math.min(midTerrain.slope + maxRelAngle, this.angle));

    // 5. Articulated Semi-Trailer Kinematics (Ultra-Stable, Conforms to Terrain, Never Flips)
    if (config.hasTrailer) {
      const hitchLocalX = -26;
      const hitchLocalY = 4;
      const hitchX = this.x + (hitchLocalX * curCos - hitchLocalY * curSin);
      const hitchY = this.y + (hitchLocalX * curSin + hitchLocalY * curCos);

      const trailerLen = config.trailerLength || 130;
      const bogieDist = Math.max(90, trailerLen - 26);
      const bogieWorldX = hitchX - bogieDist * Math.cos(this.trailerAngle);
      const bogieGround = this.getTerrainAt(bogieWorldX);
      const targetBogieWheelY = bogieGround.y - tireDef.radius;

      // In rotated local frame: y_world = hitchY - bogieDist * sin(pitch) + 14
      // We want y_world = targetBogieWheelY ==> sin(pitch) = (hitchY + 14 - targetBogieWheelY) / bogieDist
      const targetPitch = Math.atan2(hitchY + 14 - targetBogieWheelY, bogieDist);

      // Critically damped spring towards targetPitch
      const pitchDiff = targetPitch - this.trailerAngle;
      this.trailerAngularVel += (pitchDiff * 35 - this.trailerAngularVel * 14) * dt;
      this.trailerAngle += this.trailerAngularVel * dt;

      // Realistic angular limits relative to tractor
      const maxTrailerPitch = 0.55; // ~31 degrees
      this.trailerAngle = Math.max(-maxTrailerPitch, Math.min(maxTrailerPitch, this.trailerAngle));

      // Ground collision prevention & dynamic trailer cargo suspension load
      if (this.trailerWheels) {
        const cosT = Math.cos(this.trailerAngle);
        const sinT = Math.sin(this.trailerAngle);
        const tWheelCount = this.trailerWheels.length || 2;
        const tCargoMass = diag.trailerCargoMass || 0;
        const tWheelLoad = (1400 / tWheelCount) + (tCargoMass / tWheelCount);
        const trailerStaticSag = Math.min(8.0, (tWheelLoad / 950) * (1.5 / suspDef.stiffness));

        this.trailerWheels.forEach(w => {
          const wx = hitchX + (w.relX * cosT - w.relY * sinT);
          const wy = hitchY + (w.relX * sinT + w.relY * cosT);
          const ground = this.getTerrainAt(wx);
          const maxAllowedY = ground.y - tireDef.radius;
          const penetration = wy - maxAllowedY;

          // Smooth trailer suspension deflection
          const targetDef = Math.max(0, Math.min(10, penetration + trailerStaticSag * 0.4));
          w.suspensionDeflection = (w.suspensionDeflection || 0) + (targetDef - (w.suspensionDeflection || 0)) * Math.min(1, dt * 25);
          w.isGrounded = penetration >= -2.5;

          // Soft bump-stop if bottomed out
          if (wy > maxAllowedY + 2.0) {
            const excess = wy - (maxAllowedY + 2.0);
            this.trailerAngle += (excess / bogieDist) * 0.4;
            if (this.trailerAngularVel < 0) this.trailerAngularVel *= 0.3;
          }

          w.angularVel = this.vx / tireDef.radius;
          w.spinAngle += w.angularVel * dt * 4;
        });
      }
    }

    this.distanceTraveled = Math.max(this.distanceTraveled, Math.floor(this.x / 10));

    if (this.x >= 4150 && !this.hasFinished) {
      this.hasFinished = true;
    }
  }

  shiftUp() {
    const gearDef = GEARBOXES.find(g => g.id === this.gearboxId) || GEARBOXES[0];
    if (this.currentGearIndex < gearDef.gears.length - 1) {
      this.currentGearIndex++;
      return true;
    }
    return false;
  }

  shiftDown() {
    if (this.currentGearIndex > 0) {
      this.currentGearIndex--;
      return true;
    }
    return false;
  }

  toggleDiffLock() {
    this.diffLock = !this.diffLock;
    return this.diffLock;
  }

  toggleHeadlights() {
    this.headlights = !this.headlights;
    return this.headlights;
  }
}
