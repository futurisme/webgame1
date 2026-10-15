/**
 * 2.5D Third-Person Procedural Vector Hero Models & Animation Engine for Dawn Arena MOBA.
 * 100% Pure JavaScript, Canvas 2D Vector Primitives, Zero External Assets.
 * Features:
 * - Upright 2.5D Perspective (elevated ~56° isometric third-person view).
 * - Articulated legs, torsos, expressive faces, physics-driven hair & capes.
 * - Dynamic 3D weapon stances with recoil, slash arcs, and muzzle flashes.
 * - Multi-directional facing with auto-flip and depth sorting.
 * - Ultra-lightweight, 60-120 FPS buttery smooth on all browsers.
 */

// Shared Helper: 2.5D Elliptical Ground Shadow under character's feet
export function renderHeroShadow2D5(ctx, radius = 18, stretch = 1.0) {
  ctx.save();
  ctx.fillStyle = 'rgba(2, 6, 23, 0.58)';
  ctx.beginPath();
  // Flattened Y-axis reflects 2.5D ground plane compression
  ctx.ellipse(0, 0, radius * stretch, radius * 0.44, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Shared Helper: 2.5D Ground Runic Cast Circle
export function renderCastAura2D5(ctx, h, anim) {
  if (!anim.isCasting) return;
  ctx.save();
  const castScale = 1.0 + Math.sin(anim.time * 12) * 0.08;
  const rx = (h.radius + 14) * castScale;
  const ry = rx * 0.48; // Perspective ellipse
  const color = h.team === 'blue' ? '#38bdf8' : '#ef4444';

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner rotating runic star on ground plane
  ctx.rotate(anim.time * 2.5);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (rx * 0.35), Math.sin(a) * (ry * 0.35));
    ctx.lineTo(Math.cos(a + 0.35) * (rx * 0.8), Math.sin(a + 0.35) * (ry * 0.8));
    ctx.stroke();
  }
  ctx.restore();
}

// Shared Helper: Hit flash reaction overlay
export function applyHitFlash2D5(ctx, h) {
  if (h.hitFlashTimer > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0, -26, 20, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// -------------------------------------------------------------
// 1. LAYLA: MALEFIC GUNNER (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderLayla2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, isCasting, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 8 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2.5 : Math.sin(time * 3) * 0.8;

  // Weapon Recoil
  let gunRecoilX = 0;
  let muzzleFlash = false;
  if (isAttacking) {
    if (attackProgress < 0.35) {
      gunRecoilX = -3;
    } else if (attackProgress < 0.65) {
      gunRecoilX = -9;
      muzzleFlash = true;
    } else {
      gunRecoilX = -5 * (1 - (attackProgress - 0.65) / 0.35);
    }
  }
  if (isCasting && h.lastCastSkill === 3) {
    gunRecoilX = -7;
    muzzleFlash = true;
  }

  // 1. Ground Shadow & Cast Glyph
  renderHeroShadow2D5(ctx, 20, 1.2);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  // Directional Horizontal Flip if facing left
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -bodyBob);

  // 2. Animated Flowing Twin-tails Hair (Back Layer)
  const hairSway = Math.sin(time * 4 + walkCycle) * 4 + (isMoving ? -6 : 0) + (muzzleFlash ? -8 : 0);
  ctx.fillStyle = '#facc15'; // Vibrant blonde
  // Left Pigtail
  ctx.beginPath();
  ctx.moveTo(-6, -42);
  ctx.bezierCurveTo(-18 + hairSway, -38, -26 + hairSway, -24, -28 + hairSway, -14);
  ctx.bezierCurveTo(-24 + hairSway, -16, -14, -30, -4, -38);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pink Hair Ribbon Tie
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(-6, -41, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 3. Legs & Armored Cyber Boots (Articulated 2.5D Stride)
  // Back Leg
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-6 - legStride, -14, 5, 12);
  ctx.fillStyle = '#38bdf8'; // Cyan illuminated sole
  ctx.fillRect(-6 - legStride, -3, 6, 3.5);

  // Front Leg
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(1 + legStride, -15, 6, 13);
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(1 + legStride, -3, 7, 3.5);

  // 4. Cobalt Battle Suit & Torso
  ctx.fillStyle = '#0284c7'; // Cobalt armor
  ctx.beginPath();
  ctx.roundRect(-7, -32, 14, 18, 3);
  ctx.fill();

  // Golden Breastplate Armor Crest
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(-4, -30);
  ctx.lineTo(4, -30);
  ctx.lineTo(5, -23);
  ctx.lineTo(0, -19);
  ctx.lineTo(-5, -23);
  ctx.closePath();
  ctx.fill();

  // White Utility Belt with Holster
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-6, -18, 12, 3);
  ctx.fillStyle = '#334155';
  ctx.fillRect(-5, -16, 4, 5);

  // 5. Head & Anime Face
  ctx.fillStyle = '#fed7aa'; // Skin
  ctx.beginPath();
  ctx.arc(0, -42, 9, 0, Math.PI * 2);
  ctx.fill();

  // Front Blonde Hair Fringe
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(0, -44, 9.5, -Math.PI * 0.8, Math.PI * 0.1);
  ctx.fill();

  // Cybernetic Targeting Goggles on Forehead
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-3, -48, 10, 4);
  ctx.fillStyle = '#06b6d4'; // Glowing cyan optic lens
  ctx.beginPath();
  ctx.arc(4, -46, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Eye & Smile
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(3, -42, 2.5, 3);

  // 6. Right Pigtail (Front Layer)
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(3, -42);
  ctx.bezierCurveTo(-4 + hairSway, -36, -14 + hairSway, -22, -16 + hairSway, -12);
  ctx.bezierCurveTo(-12 + hairSway, -14, -4, -28, 5, -38);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 7. Colossal Malefic Rail Cannon (Held Horizontally in 2.5D)
  ctx.save();
  ctx.translate(gunRecoilX + 2, -26);

  // Cannon Main Chassis
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(0, -7, 34, 14, 3);
  ctx.fill();

  // Chrome Plated Barrel
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(20, -5, 18, 10);

  // Energy Battery Core (Glowing Cyan Wave)
  const plasmaAlpha = 0.7 + Math.sin(time * 8) * 0.3;
  ctx.fillStyle = `rgba(56, 189, 248, ${plasmaAlpha})`;
  ctx.fillRect(8, -4, 12, 8);
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(8, -4, 12, 8);

  // Heavy Muzzle Rings
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(34, -7, 6, 14);

  // Mechanical Power Gauntlet Hands (Bracing the Cannon)
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(6, 4, 4.5, 0, Math.PI * 2);
  ctx.arc(16, 3, 4, 0, Math.PI * 2);
  ctx.fill();

  // Muzzle Blast Starburst when firing
  if (muzzleFlash) {
    ctx.save();
    ctx.translate(42, 0);
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(0, -12);
    ctx.lineTo(5, -4);
    ctx.lineTo(16, 0);
    ctx.lineTo(5, 4);
    ctx.lineTo(0, 12);
    ctx.lineTo(-3, 4);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-3, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 2. TIGREAL: WARRIOR OF DAWN (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderTigreal2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, isCasting, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 7 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2 : Math.sin(time * 2.5) * 0.7;

  let swordAngle = 0.2;
  let swordOffsetY = 0;
  if (isAttacking) {
    if (attackProgress < 0.3) {
      swordAngle = -0.7; // Wind-up high
      swordOffsetY = -8;
    } else if (attackProgress < 0.7) {
      swordAngle = 1.3; // Cleave down!
      swordOffsetY = 8;
    } else {
      swordAngle = 0.3;
    }
  }

  renderHeroShadow2D5(ctx, 24, 1.2);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -bodyBob);

  // 1. Royal Crimson Velvet Cape (Flowing behind in 2.5D)
  const capeWave = Math.sin(time * 3 + walkCycle) * 5 + (isMoving ? -7 : 0);
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-8, -36);
  ctx.lineTo(-24 + capeWave, -30);
  ctx.lineTo(-30 + capeWave, -6);
  ctx.lineTo(-18 + capeWave * 0.5, -2);
  ctx.lineTo(-4, -20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 2. Heavy Greaves & Steel Knight Boots
  ctx.fillStyle = '#334155';
  ctx.fillRect(-8 - legStride, -16, 7, 15);
  ctx.fillRect(2 + legStride, -17, 7, 16);
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-8 - legStride, -4, 9, 4);
  ctx.fillRect(2 + legStride, -4, 9, 4);

  // 3. Royal Knight Steel Breastplate (Layered Silver & Gold)
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(-10, -36, 20, 22, 4);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Golden Lion Head Crest on Breastplate
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(0, -25, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-2, -28, 4, 6);

  // Massive Golden Lion Pauldrons (Shoulders)
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(-11, -34, 7, 0, Math.PI * 2);
  ctx.arc(11, -34, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 4. Knight Helmet with Glowing Cyan Visor Slit
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, -45, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Visor Slit (Cyan glow)
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(1, -46, 7, 3);

  // Golden Helmet Plume
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-3, -55, 6, 8);

  // 5. Aegis Tower Bastion Shield (Held on Left Arm)
  ctx.save();
  ctx.translate(-14, -30);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.roundRect(0, 0, 15, 28, 3);
  ctx.fill();
  ctx.fillStyle = '#1e3a8a'; // Royal Navy
  ctx.beginPath();
  ctx.roundRect(2, 2, 11, 24, 2);
  ctx.fill();

  // Embossed Golden Lion Head Emblem
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(7.5, 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 15, 28);

  if (isCasting) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(-3, -3, 21, 34);
  }
  ctx.restore();

  // 6. Royal Radiant Broadsword (Right Hand)
  ctx.save();
  ctx.translate(10, -26 + swordOffsetY);
  ctx.rotate(swordAngle);

  // Crossguard & Sapphire
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-3, -6, 6, 12);
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Blade with Fuller
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(3, -4);
  ctx.lineTo(28, -2.5);
  ctx.lineTo(34, 0); // Blade Point
  ctx.lineTo(28, 2.5);
  ctx.lineTo(3, 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cyan Fuller
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(4, -0.8, 20, 1.6);

  // Slashing Arc Trail during attack
  if (isAttacking && attackProgress > 0.3 && attackProgress < 0.7) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, 32, -0.7, 0.9);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 3. EUDORA: LIGHTNING EMPRESS (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderEudora2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, isCasting } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const floatBob = Math.sin(time * 4) * 4; // Floating high in 2.5D!

  renderHeroShadow2D5(ctx, 20, 1.0 - floatBob * 0.04);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -14 - floatBob); // Levitating elevation

  // 1. Flowing Silk Gown & Mantle (Deep Violet & Indigo)
  const gownWave = Math.sin(time * 3.5) * 5;
  ctx.fillStyle = '#3b0764'; // Royal deep purple
  ctx.beginPath();
  ctx.moveTo(-8, -32);
  ctx.lineTo(-18 + gownWave, -20);
  ctx.lineTo(-22 + gownWave, 6);
  ctx.lineTo(16, 6);
  ctx.lineTo(8, -20);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#c084fc';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Golden Hem Embroidery
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-22 + gownWave, 4);
  ctx.lineTo(16, 4);
  ctx.stroke();

  // 2. Torso & Corset
  ctx.fillStyle = '#6b21a8';
  ctx.beginPath();
  ctx.roundRect(-7, -35, 14, 18, 3);
  ctx.fill();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(0, -32);
  ctx.lineTo(4, -26);
  ctx.lineTo(0, -20);
  ctx.lineTo(-4, -26);
  ctx.closePath();
  ctx.fill();

  // 3. Head & Silver-Lavender Hair
  ctx.fillStyle = '#e9d5ff';
  ctx.beginPath();
  ctx.arc(0, -45, 9.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fed7aa'; // Anime face
  ctx.beginPath();
  ctx.arc(2, -44, 7, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(4, -45, 2.5, 3);

  // 4. Floating Crystalline Lightning Tiara
  const crownHover = Math.sin(time * 6) * 2;
  ctx.fillStyle = '#38bdf8';
  for (let c = -1; c <= 1; c++) {
    ctx.beginPath();
    ctx.moveTo(c * 5, -53);
    ctx.lineTo(c * 6, -60 - crownHover);
    ctx.lineTo(c * 4 + 2, -54);
    ctx.closePath();
    ctx.fill();
  }

  // 5. Electric Hands & Filament Discharges
  const handOffset = (isAttacking || isCasting) ? 8 : 0;
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(10 + handOffset, -28, 4, 0, Math.PI * 2);
  ctx.arc(12 + handOffset, -20, 4, 0, Math.PI * 2);
  ctx.fill();

  // Zigzag lightning filaments
  if (isAttacking || isCasting) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(10 + handOffset, -28);
    ctx.lineTo(18 + handOffset, -24);
    ctx.lineTo(15 + handOffset, -20);
    ctx.lineTo(24 + handOffset, -16);
    ctx.stroke();
  }

  // 6. Dual Revolving 3D Plasma Orbs
  const orbAngle = time * 4;
  const o1x = Math.cos(orbAngle) * 20;
  const o1y = -26 + Math.sin(orbAngle) * 10;
  const o2x = Math.cos(orbAngle + Math.PI) * 20;
  const o2y = -26 + Math.sin(orbAngle + Math.PI) * 10;

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(o1x, o1y, 4.5, 0, Math.PI * 2);
  ctx.arc(o2x, o2y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(o1x, o1y, 2, 0, Math.PI * 2);
  ctx.arc(o2x, o2y, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 4. ALUCARD: DEMON HUNTER (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderAlucard2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 8 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2.2 : Math.sin(time * 3) * 0.8;
  const isUlt = h.alucardUltActive;

  let swordAngle = 0.3;
  let swordOffsetY = 0;
  if (isAttacking) {
    if (attackProgress < 0.3) {
      swordAngle = -0.7;
      swordOffsetY = -6;
    } else if (attackProgress < 0.7) {
      swordAngle = 1.4;
      swordOffsetY = 8;
    } else {
      swordAngle = 0.4;
    }
  }

  renderHeroShadow2D5(ctx, 22, 1.2);
  renderCastAura2D5(ctx, h, anim);

  // Demonic Fire Pillars during Ult
  if (isUlt) {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -bodyBob);

  // 1. Midnight Leather Duster Coat Tails (Fluttering behind)
  const coatWave = Math.sin(time * 4 + walkCycle) * 6 + (isMoving ? -8 : 0);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(-6, -30);
  ctx.lineTo(-24 + coatWave, -22);
  ctx.lineTo(-28 + coatWave, -2);
  ctx.lineTo(-14 + coatWave * 0.5, 0);
  ctx.lineTo(-2, -18);
  ctx.closePath();
  ctx.fill();

  // 2. Leather Boots & Greaves
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-7 - legStride, -16, 6, 15);
  ctx.fillRect(2 + legStride, -17, 6, 16);
  ctx.fillStyle = '#475569';
  ctx.fillRect(-7 - legStride, -4, 8, 4);
  ctx.fillRect(2 + legStride, -4, 8, 4);

  // 3. Hunter Torso & Silver Buckles
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-8, -36, 16, 20, 3);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-4, -28, 8, 3);
  ctx.fillRect(-4, -22, 8, 3);

  // 4. Swept Blonde Hair & Hunter Collar
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(-2, -45, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fed7aa'; // Face
  ctx.beginPath();
  ctx.arc(2, -43, 7, 0, Math.PI * 2);
  ctx.fill();

  // Popped Duster Collar
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6, -42, 4, 10);

  // 5. Burning Fiend Claw Arm (Left Arm)
  ctx.fillStyle = '#dc2626'; // Red demon carapace
  ctx.beginPath();
  ctx.roundRect(-12, -32, 8, 16, 3);
  ctx.fill();
  // Fiery Demon Talons
  ctx.fillStyle = '#f59e0b';
  for (let c = 0; c < 3; c++) {
    ctx.fillRect(-14, -20 + c * 3, 3, 2);
  }

  // 6. Colossal Demonic Cleaver Greatsword (Right Hand)
  ctx.save();
  ctx.translate(10, -28 + swordOffsetY);
  ctx.rotate(swordAngle);

  // Serrated Cleaver Blade
  ctx.fillStyle = isUlt ? '#ef4444' : '#64748b';
  ctx.beginPath();
  ctx.moveTo(3, -5);
  ctx.lineTo(28, -6);
  ctx.lineTo(36, -2);
  ctx.lineTo(32, 5);
  ctx.lineTo(3, 5);
  ctx.closePath();
  ctx.fill();

  // Glowing Crimson Blood-Groove
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(6, -1.5, 22, 3);

  // Crimson Cleave Arc VFX
  if (isAttacking && attackProgress > 0.3 && attackProgress < 0.7) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 36, -0.6, 1.0);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 5. CHOU: KUNG FU BOY (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderChou2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, isCasting, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 9 : 0;
  const boxerBounce = Math.sin(time * 6) * 2;

  let punchExtend = 0;
  let kickExtend = 0;
  if (isAttacking) {
    punchExtend = attackProgress < 0.5 ? 12 : 5;
  }
  if (h.chouComboStep === 3 && isCasting) {
    kickExtend = 14;
  }

  renderHeroShadow2D5(ctx, 19, 1.1);
  renderCastAura2D5(ctx, h, anim);

  // S2 Shield Barrier
  if (h.shield > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.ellipse(0, -24, 22, 28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -boxerBounce);

  // 1. Tied Crimson Headband Ribbons (Fluttering)
  const ribbonWave = Math.sin(time * 6 + walkCycle) * 5 + (isMoving ? -7 : 0);
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(-6, -44);
  ctx.lineTo(-22 + ribbonWave, -40);
  ctx.lineTo(-24 + ribbonWave, -35);
  ctx.lineTo(-6, -41);
  ctx.closePath();
  ctx.fill();

  // 2. Yellow Tracksuit Pants & Sneakers
  ctx.fillStyle = '#eab308';
  ctx.fillRect(-6 - legStride, -16, 5.5, 15);
  ctx.fillRect(1 + legStride + kickExtend, -16, 5.5 + kickExtend * 0.4, 15);
  // Black Racing Stripes on Legs
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-5 - legStride, -16, 1.5, 15);
  ctx.fillRect(2 + legStride, -16, 1.5, 15);

  // Sneakers
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-7 - legStride, -3, 7, 3.5);
  ctx.fillRect(1 + legStride + kickExtend, -3, 7, 3.5);

  // 3. Yellow Tracksuit Torso
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.roundRect(-7, -35, 14, 20, 3);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-1, -35, 2, 20); // Front zip line
  ctx.fillRect(-7, -26, 14, 3);

  // 4. Head & Spiky Raven Hair
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(0, -45, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fed7aa'; // Face
  ctx.beginPath();
  ctx.arc(2, -43, 7, 0, Math.PI * 2);
  ctx.fill();

  // Crimson Headband
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(-4, -46, 12, 3.5);

  // 5. Sparring Knuckles & Punch Animation
  ctx.fillStyle = '#f8fafc'; // Taped wraps
  ctx.beginPath();
  ctx.arc(6, -28, 4, 0, Math.PI * 2);
  ctx.arc(10 + punchExtend, -24, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a'; // Black MMA gloves
  ctx.beginPath();
  ctx.arc(12 + punchExtend, -24, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Kinetic Shockwave Rings on Punch
  if (isAttacking && attackProgress > 0.3) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(16 + punchExtend, -24, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 6. MIYA: MOONLIGHT ARCHER (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderMiya2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 7 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2 : Math.sin(time * 3) * 0.7;

  let bowPull = 0;
  let showArrow = false;
  if (isAttacking) {
    if (attackProgress < 0.45) {
      bowPull = 7 * (attackProgress / 0.45);
      showArrow = true;
    }
  }

  renderHeroShadow2D5(ctx, 19, 1.1);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -bodyBob);

  // 1. Long Silver-White Ponytail (Cascading in 2.5D)
  const hairWave = Math.sin(time * 4 + walkCycle) * 4 + (isMoving ? -7 : 0);
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(-4, -46);
  ctx.bezierCurveTo(-16 + hairWave, -40, -24 + hairWave, -22, -26 + hairWave, -8);
  ctx.bezierCurveTo(-22 + hairWave, -10, -12, -26, -2, -42);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Sapphire Ribbon
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(-4, -45, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 2. Leather Quiver on Back
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-10, -32, 5, 16);
  ctx.fillStyle = '#38bdf8'; // Feathers
  ctx.fillRect(-12, -36, 4, 5);

  // 3. Legs & Light Elven Boots
  ctx.fillStyle = '#064e3b';
  ctx.fillRect(-6 - legStride, -15, 5, 14);
  ctx.fillRect(1 + legStride, -16, 5, 15);
  ctx.fillStyle = '#059669';
  ctx.fillRect(-6 - legStride, -3, 6, 3);
  ctx.fillRect(1 + legStride, -3, 6, 3);

  // 4. Emerald Ranger Tunic & Silver Leaf Pauldrons
  ctx.fillStyle = '#059669';
  ctx.beginPath();
  ctx.roundRect(-6, -34, 13, 19, 3);
  ctx.fill();
  ctx.fillStyle = '#e2e8f0'; // Leaf Pauldrons
  ctx.beginPath();
  ctx.arc(-7, -32, 4, 0, Math.PI * 2);
  ctx.arc(7, -32, 4, 0, Math.PI * 2);
  ctx.fill();

  // 5. Head & Pointed Elven Ears
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, -43, 8.5, 0, Math.PI * 2);
  ctx.fill();

  // Pointed Ear
  ctx.beginPath();
  ctx.moveTo(-3, -44);
  ctx.lineTo(-8, -48);
  ctx.lineTo(-2, -42);
  ctx.fill();

  // Silver Fringe Bangs
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(1, -44, 8.5, -Math.PI * 0.8, Math.PI * 0.1);
  ctx.fill();

  // 6. Recurve Moonbow (Held Vertically in 2.5D)
  ctx.save();
  ctx.translate(10, -28);

  // Bow Limbs
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 18, -Math.PI * 0.45, Math.PI * 0.45);
  ctx.stroke();

  // Bowstring
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(Math.cos(-Math.PI * 0.45) * 18, Math.sin(-Math.PI * 0.45) * 18);
  ctx.lineTo(-bowPull, 0);
  ctx.lineTo(Math.cos(Math.PI * 0.45) * 18, Math.sin(Math.PI * 0.45) * 18);
  ctx.stroke();

  // Nocked Starlight Arrow
  if (showArrow) {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-bowPull, 0);
    ctx.lineTo(20, 0);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(20, -3.5);
    ctx.lineTo(26, 0);
    ctx.lineTo(20, 3.5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 7. GROCK: FORTRESS TITAN (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderGrock2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 6 : 0;
  const titanThud = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2.8 : Math.sin(time * 2) * 0.6;

  let pillarAngle = 0;
  if (isAttacking) {
    if (attackProgress < 0.4) {
      pillarAngle = -0.5; // Wind-up back
    } else if (attackProgress < 0.7) {
      pillarAngle = 0.9; // Ground slam!
    }
  }

  renderHeroShadow2D5(ctx, 30, 1.25);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -titanThud);

  // 1. Massive Granite Feet
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-12 - legStride, -18, 11, 17);
  ctx.fillRect(2 + legStride, -19, 11, 18);

  // 2. Colossal Stone Monolith Body
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(-16, -46, 32, 30, 6);
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Moss & Overgrowth on Shoulders
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(-14, -46, 8, 0, Math.PI * 2);
  ctx.arc(14, -46, 8, 0, Math.PI * 2);
  ctx.fill();

  // 3. Glowing Emerald Titan Core
  const corePulse = 0.7 + Math.sin(time * 5) * 0.3;
  ctx.fillStyle = `rgba(16, 185, 129, ${corePulse})`;
  ctx.beginPath();
  ctx.arc(0, -32, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // 4. Carved Gargoyle Brow & Glowing Jade Eyes
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-8, -56, 16, 12, 3);
  ctx.fill();
  ctx.fillStyle = '#10b981';
  ctx.fillRect(1, -52, 3, 3);

  // 5. Massive Carved Castle Pillar (Shoulder Weapon)
  ctx.save();
  ctx.translate(10, -38);
  ctx.rotate(pillarAngle);

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(0, -7, 40, 14, 3);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Carved Gargoyle Head on Pillar End
  ctx.fillStyle = '#475569';
  ctx.fillRect(26, -9, 8, 18);
  ctx.fillStyle = '#10b981';
  ctx.fillRect(12, -2, 10, 3); // Runic engraving
  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 8. BALMOND: BERSERKER ORC (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderBalmond2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, isCasting, attackProgress } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 8 : 0;
  const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2.2 : Math.sin(time * 3) * 0.8;

  const isSpinning = isCasting && h.lastCastSkill === 2;
  let axeAngle = 0.2;
  let axeOffsetY = 0;
  if (isAttacking) {
    if (attackProgress < 0.3) {
      axeAngle = -0.7;
      axeOffsetY = -7;
    } else if (attackProgress < 0.7) {
      axeAngle = 1.3;
      axeOffsetY = 8;
    } else {
      axeAngle = 0.3;
    }
  }

  renderHeroShadow2D5(ctx, 24, 1.2);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight && !isSpinning) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -bodyBob);
  if (isSpinning) {
    ctx.rotate(time * 16);
  }

  // 1. Spiked Boots
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(-8 - legStride, -16, 7, 15);
  ctx.fillRect(2 + legStride, -17, 7, 16);

  // 2. Muscular Crimson Orc Torso
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  ctx.roundRect(-11, -38, 22, 24, 4);
  ctx.fill();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Spiked Bone Pauldrons
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.arc(-12, -36, 6, 0, Math.PI * 2);
  ctx.arc(12, -36, 6, 0, Math.PI * 2);
  ctx.fill();

  // Iron Skull Belt
  ctx.fillStyle = '#18181b';
  ctx.fillRect(-9, -18, 18, 5);
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(0, -15, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 3. Head & Wild Black Mane
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.arc(-2, -46, 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#b91c1c'; // Face
  ctx.beginPath();
  ctx.arc(2, -44, 8, 0, Math.PI * 2);
  ctx.fill();

  // Tusks
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(7, -43, 3, 2);

  // 4. Double-Bladed Battleaxe
  ctx.save();
  ctx.translate(10, -28 + axeOffsetY);
  ctx.rotate(axeAngle);

  // Haft
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-3, -3, 32, 5);

  // Dual Axe Blades
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.arc(22, -12, 10, 0, Math.PI * 2);
  ctx.arc(22, 12, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Skull Hub
  ctx.fillStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.arc(22, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  if (isSpinning) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 36, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 9. GUSION: HOLY BLADE (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderGusion2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const legStride = isMoving ? Math.sin(walkCycle) * 8 : 0;
  const assassinBob = isMoving ? Math.abs(Math.sin(walkCycle * 2)) * 2 : Math.sin(time * 3) * 0.7;

  renderHeroShadow2D5(ctx, 19, 1.1);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -assassinBob);

  // 1. Midnight-Sapphire Tailored Rogue Coat Tails
  const coatWave = Math.sin(time * 4 + walkCycle) * 4;
  ctx.fillStyle = '#1e1b4b';
  ctx.beginPath();
  ctx.moveTo(-6, -30);
  ctx.lineTo(-20 + coatWave, -22);
  ctx.lineTo(-22 + coatWave, -2);
  ctx.lineTo(-2, -18);
  ctx.closePath();
  ctx.fill();

  // 2. High Boots
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-6 - legStride, -16, 5, 15);
  ctx.fillRect(1 + legStride, -17, 5, 16);

  // 3. Tailored Vest & Silver Clasps
  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.roundRect(-6, -34, 13, 19, 3);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(-3, -26, 6, 2.5);

  // 4. Head & Silver-Violet Hair
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(0, -43, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fed7aa'; // Face
  ctx.beginPath();
  ctx.arc(2, -41, 7, 0, Math.PI * 2);
  ctx.fill();

  // 5. 5 Runic Daggers Floating in 3D Arc around him
  const daggerSpread = isAttacking ? 22 : 16;
  ctx.fillStyle = '#c084fc';
  for (let i = -2; i <= 2; i++) {
    const angle = i * 0.3;
    const osc = Math.sin(time * 6 + i) * 2;
    const dx = 10 + Math.cos(angle) * (daggerSpread + osc);
    const dy = -28 + Math.sin(angle) * (daggerSpread + osc) * 0.6;

    ctx.save();
    ctx.translate(dx, dy);
    ctx.beginPath();
    ctx.moveTo(7, 0);
    ctx.lineTo(0, -2);
    ctx.lineTo(-3, 0);
    ctx.lineTo(0, 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, -0.6, 4, 1.2);
    ctx.restore();
  }

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}

// -------------------------------------------------------------
// 10. KAGURA: ONMYOJI MASTER (2.5D UPRIGHT MODEL)
// -------------------------------------------------------------
export function renderKagura2D5(ctx, h, anim) {
  const { time, walkCycle, isMoving, isAttacking, isCasting } = anim;
  const isFacingRight = Math.cos(h.facingAngle) >= 0;
  const kimonoSway = isMoving ? Math.sin(walkCycle) * 2 : Math.sin(time * 3) * 0.8;

  renderHeroShadow2D5(ctx, 20, 1.1);
  renderCastAura2D5(ctx, h, anim);

  ctx.save();
  if (!isFacingRight) {
    ctx.scale(-1, 1);
  }
  ctx.translate(0, -kimonoSway);

  // 1. Cherry Blossom Pink Kimono Sleeves & Skirt
  const sleeveWave = Math.sin(time * 3.5) * 4;
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.moveTo(-6, -30);
  ctx.lineTo(-18 + sleeveWave, -22);
  ctx.lineTo(-20 + sleeveWave, 0);
  ctx.lineTo(14, 0);
  ctx.lineTo(6, -20);
  ctx.closePath();
  ctx.fill();

  // Magenta Center Robe
  ctx.fillStyle = '#db2777';
  ctx.beginPath();
  ctx.roundRect(-6, -34, 13, 20, 3);
  ctx.fill();

  // Golden Obi Sash
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(-5, -24, 11, 6);

  // 2. Head & Hime-cut Lavender Hair with Kanzashi Pin
  ctx.fillStyle = '#c084fc';
  ctx.beginPath();
  ctx.arc(0, -43, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fed7aa'; // Face
  ctx.beginPath();
  ctx.arc(2, -41, 7, 0, Math.PI * 2);
  ctx.fill();

  // Sakura Pin
  ctx.fillStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(-2, -47, 3, 0, Math.PI * 2);
  ctx.fill();

  // 3. Seimei Paper Umbrella (Floating & Spinning in 3D)
  const umbrellaSpin = time * (isCasting || isAttacking ? 6 : 2.5);
  ctx.save();
  ctx.translate(16, -28);
  ctx.rotate(umbrellaSpin);

  // Wagasa Canopy
  ctx.fillStyle = '#ec4899';
  ctx.beginPath();
  ctx.arc(0, 0, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fbcfe8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 8 Bamboo Ribs
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 1;
  for (let rib = 0; rib < 8; rib++) {
    const ra = (rib * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ra) * 15, Math.sin(ra) * 15);
    ctx.stroke();
  }

  // Center Talisman
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
  applyHitFlash2D5(ctx, h);
}
