/**
 * Real-Time 2D Vector SVG Device Visualizer Engine
 * Pure Vanilla JavaScript • High-Precision Reactive Rendering
 * 
 * Synchronously generates ultra-sharp, modern 2026 industrial hardware visuals
 * for Smartphones, Laptops, and Tablets with live updates to body color,
 * material textures, bezel thickness, camera modules, and brand logos.
 */

export const COLOR_PALETTES = [
  { id: 'titanium_gray', name: 'Natural Titanium', hex: '#64748B', accent: '#94A3B8', border: '#475569' },
  { id: 'midnight_black', name: 'Midnight Obsidian', hex: '#090D16', accent: '#1E293B', border: '#334155' },
  { id: 'alpine_silver', name: 'Alpine Silver', hex: '#CBD5E1', accent: '#F1F5F9', border: '#94A3B8' },
  { id: 'deep_navy', name: 'Pacific Deep Navy', hex: '#0369A1', accent: '#38BDF8', border: '#0284C7' },
  { id: 'emerald_matrix', name: 'Bio-Emerald', hex: '#065F46', accent: '#34D399', border: '#059669' },
  { id: 'imperial_amber', name: 'Cyber Amber', hex: '#B45309', accent: '#FBBF24', border: '#D97706' },
  { id: 'cosmic_violet', name: 'Cosmic Violet', hex: '#581C87', accent: '#C084FC', border: '#7E22CE' },
  { id: 'crimson_ruby', name: 'Hyperion Crimson', hex: '#881337', accent: '#FB7185', border: '#BE123C' },
];

export const CAMERA_STYLES = {
  smartphone: [
    { id: 'triple_matrix', name: 'Triple Matrix 50MP', desc: 'Tiga lensa optik sapphire dengan sensor periskop' },
    { id: 'island_bar', name: 'Horizontal Visor Bar', desc: 'Pulau kamera horizontal futuristik edge-to-edge' },
    { id: 'circle_halo', name: 'Circular Halo Ring', desc: 'Modul melingkar simetris bergaya jam mewah' },
    { id: 'dual_minimal', name: 'Dual Minimalist Pill', desc: 'Dua modul ringkas tanpa tonjolan berlebih' },
  ],
  laptop: [
    { id: 'notch', name: 'Infinity Display Notch', desc: 'Notch ringkas dengan kamera 1080p IR & FaceID' },
    { id: 'sleek_bezel', name: 'Micro-Bezel Lens', desc: 'Kamera mikro tersembunyi di dalam bingkai atas' },
  ],
  tablet: [
    { id: 'dual_module', name: 'Dual Studio Cam + LiDAR', desc: 'Modul kamera sudut dengan sensor kedalaman' },
    { id: 'minimal_lens', name: 'Single Discreet Lens', desc: 'Satu lensa flush datar di sudut belakang' },
  ],
};

export const BEZEL_STYLES = [
  { id: 'ultra_thin', name: 'Ultra-Thin Borderless', borderPx: 3, radius: 24 },
  { id: 'flat_edge', name: 'Flat Industrial Chamfer', borderPx: 5, radius: 18 },
  { id: 'curved_organic', name: 'Curved Organic Ergonomic', borderPx: 4, radius: 28 },
];

/**
 * Render reactive SVG preview for the configured device
 * @param {Object} config
 * @returns {string} Raw SVG string
 */
export function renderDevicePreviewSvg(config = {}) {
  const {
    deviceType = 'smartphone',
    colorId = 'titanium_gray',
    customHex = null,
    material = 'aluminum',
    cameraStyle = 'triple_matrix',
    bezelStyle = 'ultra_thin',
    brandName = 'CORP',
    viewMode = 'duo', // 'duo' | 'front' | 'back'
  } = config;

  const palette = COLOR_PALETTES.find(c => c.id === colorId) || COLOR_PALETTES[0];
  const bodyHex = customHex || palette.hex;
  const accentHex = palette.accent;
  const borderHex = palette.border;

  // Material gradient filters & texture
  let matGradient = '';
  let matGloss = 0.35;
  if (material === 'titanium') {
    matGloss = 0.5;
  } else if (material === 'ceramic') {
    matGloss = 0.85;
  } else if (material === 'matte_glass') {
    matGloss = 0.2;
  } else if (material === 'polycarbonate') {
    matGloss = 0.15;
  }

  if (deviceType === 'smartphone') {
    return renderSmartphoneSvg({
      bodyHex,
      accentHex,
      borderHex,
      matGloss,
      material,
      cameraStyle,
      bezelStyle,
      brandName,
      viewMode,
    });
  }

  if (deviceType === 'laptop') {
    return renderLaptopSvg({
      bodyHex,
      accentHex,
      borderHex,
      matGloss,
      material,
      cameraStyle,
      bezelStyle,
      brandName,
      viewMode,
    });
  }

  // Default: Tablet
  return renderTabletSvg({
    bodyHex,
    accentHex,
    borderHex,
    matGloss,
    material,
    cameraStyle,
    bezelStyle,
    brandName,
    viewMode,
  });
}

/**
 * Render Smartphone Vector
 */
function renderSmartphoneSvg({ bodyHex, accentHex, borderHex, matGloss, material, cameraStyle, brandName, viewMode }) {
  const isDuo = viewMode === 'duo';
  const width = isDuo ? 480 : 260;
  const height = 360;

  // Front offset: x=24, y=20. Back offset: x=isDuo?250:24, y=20
  const fX = isDuo ? 30 : 20;
  const bX = isDuo ? 250 : 20;
  const dW = 190;
  const dH = 320;
  const cornerR = 26;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full max-h-[360px] drop-shadow-2xl select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Body Chassis Gradient -->
        <linearGradient id="phone-body-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bodyHex}" />
          <stop offset="50%" stop-color="${bodyHex}" stop-opacity="0.88" />
          <stop offset="100%" stop-color="${accentHex}" stop-opacity="0.25" />
        </linearGradient>

        <!-- Glass Reflection -->
        <linearGradient id="glass-reflection" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="${matGloss * 0.4}" />
          <stop offset="35%" stop-color="#FFFFFF" stop-opacity="0.03" />
          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="${matGloss * 0.15}" />
        </linearGradient>

        <!-- Screen Wallpaper Gradient -->
        <linearGradient id="phone-screen-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="40%" stop-color="#0B1329" />
          <stop offset="70%" stop-color="${accentHex}" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#0F172A" />
        </linearGradient>

        <!-- Camera Lens Ring -->
        <linearGradient id="lens-rim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#64748B" />
          <stop offset="50%" stop-color="#1E293B" />
          <stop offset="100%" stop-color="#94A3B8" />
        </linearGradient>
      </defs>

      ${(isDuo || viewMode === 'front') ? `
        <!-- FRONT VIEW (DISPLAY) -->
        <g id="phone-front" transform="translate(${fX}, 20)">
          <!-- Outer Chassis Border -->
          <rect x="0" y="0" width="${dW}" height="${dH}" rx="${cornerR}" fill="${bodyHex}" stroke="${borderHex}" stroke-width="2" />
          <!-- Screen Glass Bezel -->
          <rect x="5" y="5" width="${dW - 10}" height="${dH - 10}" rx="${cornerR - 4}" fill="#050811" stroke="#000000" stroke-width="1.5" />
          
          <!-- Active Screen Display -->
          <rect x="7" y="7" width="${dW - 14}" height="${dH - 14}" rx="${cornerR - 6}" fill="url(#phone-screen-bg)" />
          
          <!-- Dynamic Island / Punch Hole Camera -->
          <rect x="${dW / 2 - 24}" y="12" width="48" height="12" rx="6" fill="#000000" />
          <circle cx="${dW / 2 + 12}" cy="18" r="2.5" fill="#1E293B" />
          <circle cx="${dW / 2 + 12}" cy="18" r="1" fill="#38BDF8" opacity="0.8" />

          <!-- Futuristic Lockscreen UI Mockup -->
          <text x="${dW / 2}" y="52" fill="#F8FAFC" font-size="24" font-weight="800" font-family="sans-serif" text-anchor="middle" letter-spacing="1">10:42</text>
          <text x="${dW / 2}" y="67" fill="#94A3B8" font-size="8" font-family="sans-serif" text-anchor="middle" font-weight="600">SENIN, 24 OKTOBER 2026</text>

          <!-- Notification Pill -->
          <g transform="translate(18, 92)">
            <rect width="${dW - 36}" height="32" rx="10" fill="#0F172A" fill-opacity="0.85" stroke="#334155" stroke-width="0.75" />
            <circle cx="16" cy="16" r="6" fill="${accentHex}" />
            <text x="28" y="14" fill="#F8FAFC" font-size="8" font-weight="700" font-family="sans-serif">Sistem Operasi ${brandName}</text>
            <text x="28" y="24" fill="#94A3B8" font-size="7" font-family="sans-serif">Chipset AI Siap Beroperasi · 100%</text>
          </g>

          <!-- App Grid Icons Mockup -->
          <g transform="translate(22, 145)">
            ${[0, 1, 2, 3].map(col => `
              <rect x="${col * 38}" y="0" width="28" height="28" rx="8" fill="#1E293B" stroke="#334155" stroke-width="0.8" />
              <rect x="${col * 38}" y="42" width="28" height="28" rx="8" fill="#1E293B" stroke="#334155" stroke-width="0.8" />
            `).join('')}
          </g>

          <!-- Dock Bar -->
          <rect x="20" y="${dH - 52}" width="${dW - 40}" height="36" rx="14" fill="#0F172A" fill-opacity="0.8" stroke="#334155" stroke-width="0.8" />
          ${[0, 1, 2, 3].map(col => `
            <circle cx="${38 + col * 32}" cy="${dH - 34}" r="10" fill="${col === 1 ? accentHex : '#1E293B'}" />
          `).join('')}

          <!-- Home Indicator Bar -->
          <rect x="${dW / 2 - 25}" y="${dH - 12}" width="50" height="3" rx="1.5" fill="#FFFFFF" opacity="0.65" />

          <!-- Front Glass Reflection Slant -->
          <rect x="7" y="7" width="${dW - 14}" height="${dH - 14}" rx="${cornerR - 6}" fill="url(#glass-reflection)" pointer-events="none" />
          
          <text x="${dW / 2}" y="${dH + 16}" fill="#64748B" font-size="9" font-family="sans-serif" text-anchor="middle" font-weight="700">TAMPILAN DEPAN (FRONT)</text>
        </g>
      ` : ''}

      ${(isDuo || viewMode === 'back') ? `
        <!-- BACK VIEW (CHASSIS & CAMERA) -->
        <g id="phone-back" transform="translate(${bX}, 20)">
          <!-- Main Back Cover Body -->
          <rect x="0" y="0" width="${dW}" height="${dH}" rx="${cornerR}" fill="url(#phone-body-grad)" stroke="${borderHex}" stroke-width="2" />
          
          <!-- Subtle Antennas -->
          <line x1="0" y1="36" x2="4" y2="36" stroke="${borderHex}" stroke-width="2" />
          <line x1="${dW - 4}" y1="36" x2="${dW}" y2="36" stroke="${borderHex}" stroke-width="2" />
          <line x1="0" y1="${dH - 36}" x2="4" y2="${dH - 36}" stroke="${borderHex}" stroke-width="2" />
          <line x1="${dW - 4}" y1="${dH - 36}" x2="${dW}" y2="${dH - 36}" stroke="${borderHex}" stroke-width="2" />

          <!-- CAMERA MODULE RENDERER -->
          ${cameraStyle === 'triple_matrix' ? `
            <!-- Triple Matrix Island -->
            <g transform="translate(16, 16)">
              <rect width="68" height="74" rx="16" fill="#0A0E1A" fill-opacity="0.95" stroke="${borderHex}" stroke-width="1.5" />
              <!-- Top Left Lens -->
              <circle cx="22" cy="22" r="13" fill="url(#lens-rim)" />
              <circle cx="22" cy="22" r="10" fill="#020617" />
              <circle cx="22" cy="22" r="4.5" fill="#1E293B" />
              <circle cx="20" cy="20" r="1.5" fill="#38BDF8" opacity="0.9" />

              <!-- Bottom Left Lens -->
              <circle cx="22" cy="52" r="13" fill="url(#lens-rim)" />
              <circle cx="22" cy="52" r="10" fill="#020617" />
              <circle cx="22" cy="52" r="4.5" fill="#1E293B" />
              <circle cx="20" cy="50" r="1.5" fill="#34D399" opacity="0.9" />

              <!-- Right Telephoto Lens -->
              <circle cx="48" cy="37" r="13" fill="url(#lens-rim)" />
              <circle cx="48" cy="37" r="10" fill="#020617" />
              <circle cx="48" cy="37" r="4.5" fill="#1E293B" />
              <circle cx="46" cy="35" r="1.5" fill="#FBBF24" opacity="0.9" />

              <!-- Dual LED Flash -->
              <circle cx="50" cy="18" r="4" fill="#FEF08A" opacity="0.9" />
              <!-- LiDAR Sensor -->
              <circle cx="50" cy="58" r="3" fill="#0F172A" stroke="#334155" stroke-width="0.8" />
            </g>
          ` : cameraStyle === 'island_bar' ? `
            <!-- Horizontal Visor Bar -->
            <g transform="translate(0, 22)">
              <rect x="0" y="0" width="${dW}" height="44" rx="8" fill="#070B14" stroke="${borderHex}" stroke-width="1.5" />
              <circle cx="40" cy="22" r="12" fill="url(#lens-rim)" />
              <circle cx="40" cy="22" r="9" fill="#020617" />
              <circle cx="75" cy="22" r="12" fill="url(#lens-rim)" />
              <circle cx="75" cy="22" r="9" fill="#020617" />
              <circle cx="110" cy="22" r="12" fill="url(#lens-rim)" />
              <circle cx="110" cy="22" r="9" fill="#020617" />
              <!-- Flash -->
              <circle cx="${dW - 32}" cy="22" r="5" fill="#FEF08A" />
            </g>
          ` : cameraStyle === 'circle_halo' ? `
            <!-- Circular Halo Module -->
            <g transform="translate(${dW / 2}, 60)">
              <circle cx="0" cy="0" r="38" fill="#0B1120" stroke="${borderHex}" stroke-width="2" />
              <circle cx="0" cy="0" r="35" fill="#030712" />
              <!-- 4 symmetrical lenses -->
              <circle cx="-16" cy="-14" r="9" fill="url(#lens-rim)" />
              <circle cx="-16" cy="-14" r="6" fill="#020617" />
              <circle cx="16" cy="-14" r="9" fill="url(#lens-rim)" />
              <circle cx="16" cy="-14" r="6" fill="#020617" />
              <circle cx="-16" cy="14" r="9" fill="url(#lens-rim)" />
              <circle cx="-16" cy="14" r="6" fill="#020617" />
              <circle cx="16" cy="14" r="9" fill="url(#lens-rim)" />
              <circle cx="16" cy="14" r="6" fill="#020617" />
              <circle cx="0" cy="0" r="4" fill="#FEF08A" />
            </g>
          ` : `
            <!-- Dual Minimalist Pill -->
            <g transform="translate(18, 18)">
              <rect width="36" height="64" rx="18" fill="#070B14" stroke="${borderHex}" stroke-width="1.5" />
              <circle cx="18" cy="18" r="10" fill="url(#lens-rim)" />
              <circle cx="18" cy="18" r="7" fill="#020617" />
              <circle cx="18" cy="46" r="10" fill="url(#lens-rim)" />
              <circle cx="18" cy="46" r="7" fill="#020617" />
            </g>
          `}

          <!-- Company Brand Engraving (Center Back) -->
          <g transform="translate(${dW / 2}, ${dH / 2 + 35})">
            <!-- Subtle Emblem Shield -->
            <circle cx="0" cy="0" r="14" fill="${borderHex}" fill-opacity="0.4" stroke="${accentHex}" stroke-width="1" />
            <text x="0" y="4" fill="#F8FAFC" font-size="9" font-weight="900" font-family="monospace" text-anchor="middle" letter-spacing="0.5">${brandName.slice(0, 4)}</text>
            <text x="0" y="24" fill="#94A3B8" font-size="7" font-weight="700" font-family="sans-serif" text-anchor="middle" letter-spacing="1.5">${brandName.toUpperCase()}</text>
            <text x="0" y="34" fill="#64748B" font-size="6" font-family="sans-serif" text-anchor="middle">DESIGNED IN HQ · 2026</text>
          </g>

          <!-- Back Material Sheen Reflection -->
          <rect x="0" y="0" width="${dW}" height="${dH}" rx="${cornerR}" fill="url(#glass-reflection)" pointer-events="none" />
          
          <text x="${dW / 2}" y="${dH + 16}" fill="#64748B" font-size="9" font-family="sans-serif" text-anchor="middle" font-weight="700">TAMPILAN BELAKANG (CHASSIS)</text>
        </g>
      ` : ''}
    </svg>
  `;
}

/**
 * Render Laptop Vector
 */
function renderLaptopSvg({ bodyHex, accentHex, borderHex, matGloss, brandName }) {
  const width = 480;
  const height = 360;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full max-h-[360px] drop-shadow-2xl select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="laptop-screen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="50%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="${accentHex}" stop-opacity="0.35" />
        </linearGradient>
        <linearGradient id="laptop-lid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bodyHex}" />
          <stop offset="100%" stop-color="${accentHex}" stop-opacity="0.2" />
        </linearGradient>
      </defs>

      <!-- OPEN LAPTOP PERSPECTIVE -->
      <g transform="translate(40, 25)">
        <!-- Top Screen Lid (Beveled Display) -->
        <rect x="35" y="10" width="330" height="205" rx="10" fill="#0A0E1A" stroke="${borderHex}" stroke-width="2" />
        <!-- Screen Panel -->
        <rect x="43" y="18" width="314" height="189" rx="6" fill="url(#laptop-screen-grad)" />

        <!-- Screen Top Bezel Camera & Mic -->
        <circle cx="200" cy="14" r="2.5" fill="#1E293B" />
        <circle cx="200" cy="14" r="1.2" fill="#38BDF8" />
        <circle cx="192" cy="14" r="0.8" fill="#475569" />
        <circle cx="208" cy="14" r="0.8" fill="#475569" />

        <!-- Screen OS Workspace Mockup -->
        <!-- Top Menu Bar -->
        <rect x="43" y="18" width="314" height="14" fill="#0B101D" fill-opacity="0.85" />
        <text x="52" y="28" fill="#F8FAFC" font-size="7" font-weight="700" font-family="monospace">${brandName} OS Pro</text>
        <text x="325" y="28" fill="#94A3B8" font-size="6.5" font-family="monospace">100% · 10:42 AM</text>

        <!-- IDE / Terminal Code Window on Screen -->
        <rect x="58" y="40" width="180" height="120" rx="6" fill="#030712" fill-opacity="0.9" stroke="#1E293B" stroke-width="1" />
        <rect x="58" y="40" width="180" height="14" rx="6" fill="#0F172A" />
        <circle cx="68" cy="47" r="2.5" fill="#EF4444" />
        <circle cx="76" cy="47" r="2.5" fill="#F59E0B" />
        <circle cx="84" cy="47" r="2.5" fill="#10B981" />
        <text x="96" y="50" fill="#94A3B8" font-size="6" font-family="monospace">enterprise-firmware.ts</text>
        
        <text x="68" y="66" fill="#38BDF8" font-size="6" font-family="monospace">import { NeuralEngine } from '@foundry';</text>
        <text x="68" y="77" fill="#34D399" font-size="6" font-family="monospace">const device = new Laptop();</text>
        <text x="68" y="88" fill="#A855F7" font-size="6" font-family="monospace">device.compileArchitecture();</text>
        <text x="68" y="99" fill="#FBBF24" font-size="6" font-family="monospace">// Benchmark Score: 18,400 pts</text>
        <text x="68" y="110" fill="#E2E8F0" font-size="6" font-family="monospace">status: "OPERATIONAL_STABLE"</text>

        <!-- Bottom Base Chassis (Keyboard Deck - Trapezoid Perspective) -->
        <polygon points="10,215 390,215 420,295 -20,295" fill="url(#laptop-lid-grad)" stroke="${borderHex}" stroke-width="2" />

        <!-- Keyboard Inset Well -->
        <polygon points="40,222 360,222 375,268 25,268" fill="#050811" stroke="#1E293B" stroke-width="1" />
        <!-- Key Rows Mockup -->
        ${[0, 1, 2, 3].map(row => `
          <line x1="${38 - row * 3}" y1="${228 + row * 10}" x2="${362 + row * 3}" y2="${228 + row * 10}" stroke="#1E293B" stroke-width="1.2" stroke-dasharray="14 3" />
        `).join('')}

        <!-- Precision Trackpad -->
        <polygon points="155,272 245,272 250,292 150,292" rx="3" fill="#0B101D" stroke="${borderHex}" stroke-width="1" />
        
        <!-- Engraved Brand Logo on Deck -->
        <text x="200" y="212" fill="#64748B" font-size="7" font-weight="700" font-family="monospace" text-anchor="middle" letter-spacing="1">${brandName.toUpperCase()} WORKSTATION</text>
      </g>
    </svg>
  `;
}

/**
 * Render Tablet Vector
 */
function renderTabletSvg({ bodyHex, accentHex, borderHex, matGloss, cameraStyle, brandName }) {
  const width = 480;
  const height = 360;
  const dW = 340;
  const dH = 230;

  return `
    <svg viewBox="0 0 ${width} ${height}" class="w-full h-full max-h-[360px] drop-shadow-2xl select-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tab-screen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#020617" />
          <stop offset="60%" stop-color="#0F172A" />
          <stop offset="100%" stop-color="${accentHex}" stop-opacity="0.3" />
        </linearGradient>
      </defs>

      <g transform="translate(70, 45)">
        <!-- Magnetic Stylus Pen on Top Edge -->
        <rect x="80" y="-12" width="180" height="7" rx="3.5" fill="#E2E8F0" stroke="#94A3B8" stroke-width="0.8" />
        <rect x="250" y="-12" width="10" height="7" rx="1" fill="${accentHex}" />

        <!-- Outer Chassis -->
        <rect x="0" y="0" width="${dW}" height="${dH}" rx="20" fill="${bodyHex}" stroke="${borderHex}" stroke-width="2.5" />
        <!-- Screen Bezel -->
        <rect x="8" y="8" width="${dW - 16}" height="${dH - 16}" rx="14" fill="#040711" />
        <!-- Active OLED Screen -->
        <rect x="12" y="12" width="${dW - 24}" height="${dH - 24}" rx="10" fill="url(#tab-screen-grad)" />

        <!-- Front Camera Centered on Long Bezel (Landscape orientation) -->
        <circle cx="${dW / 2}" cy="5" r="2" fill="#1E293B" />
        <circle cx="${dW / 2}" cy="5" r="1" fill="#38BDF8" />

        <!-- Creative Canvas Drawing UI Mockup -->
        <g transform="translate(25, 25)">
          <!-- Top Tool Palette -->
          <rect width="${dW - 50}" height="24" rx="8" fill="#0B101D" fill-opacity="0.85" stroke="#1E293B" stroke-width="0.8" />
          <text x="14" y="16" fill="#F8FAFC" font-size="8" font-weight="700" font-family="sans-serif">${brandName} Studio Canvas</text>
          ${[0, 1, 2, 3, 4].map(i => `
            <circle cx="${140 + i * 20}" cy="12" r="5" fill="${i === 1 ? accentHex : '#1E293B'}" stroke="#334155" stroke-width="0.75" />
          `).join('')}

          <!-- Drawing Art Stroke -->
          <path d="M 40,80 Q 90,30 160,80 T 260,110" fill="none" stroke="${accentHex}" stroke-width="5" stroke-linecap="round" opacity="0.8" />
          <circle cx="260" cy="110" r="4" fill="#FFFFFF" />

          <!-- Bottom Floating Widget -->
          <rect x="${dW / 2 - 80}" y="${dH - 68}" width="110" height="26" rx="10" fill="#0F172A" fill-opacity="0.9" stroke="#334155" stroke-width="0.8" />
          <text x="${dW / 2 - 25}" y="${dH - 52}" fill="#E2E8F0" font-size="7.5" font-family="sans-serif" text-anchor="middle" font-weight="600">Hardware Stylus Connected</text>
        </g>
      </g>
    </svg>
  `;
}
