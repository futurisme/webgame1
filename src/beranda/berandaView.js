/**
 * Neo Arcade - Anime Pop Web Game Center & Horizontal Selector.
 * Otasukebu visual theme: Yellow (#FFE500), Pink (#FF2A85), White (#FFFFFF), Black ink borders.
 * Strictly 100% Viewport Height (Zero vertical scroll), Fluid Horizontal Deck Navigation.
 * Web Desktop/Laptop native, ultra-lightweight, procedural Web Audio SFX.
 */

import { HEROES_DATA, BATTLE_SPELLS } from '../moba/mobaData.js';
import mobaBanner from '../assets/images/moba_game_banner_1791918928027.jpg';
import fosBanner from '../rpg/assets/images/fos_game_banner_1791727769327.jpg';
import mechaBanner from '../assets/images/arcade_mecha_banner_1791918927802.jpg';
import trainBanner from '../assets/images/train_sim_banner_1791990907399.jpg';

class ArcadeSynth {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBlip() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (_) {}
  }

  playSelect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(460, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(920, this.ctx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (_) {}
  }

  playLaunch() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.2);
      });
    } catch (_) {}
  }
}

export class BerandaView {
  constructor(container) {
    this.container = container;
    this.synth = new ArcadeSynth();
    this.activeSlideIndex = 0;
    this.selectedHeroId = 'layla';
    this.selectedSpellId = 'flicker';
    this.activeStation = 'station-01';

    this.games = [
      {
        id: 'moba',
        route: '/moba',
        title: 'DAWN ARENA 5v5',
        jpTitle: 'ドーン・アリーナ 5v5',
        badge: '5v5 MOBA WEB EDITION',
        banner: mobaBanner,
        tags: ['5v5 MOBA', '1v9 AI BOTS', '3 LANES', '120 FPS'],
        actionText: 'PLAY 5v5 MOBA',
        desc: 'Kompetisi MOBA 5v5 offline ultra-cepat dengan 9 bot cerdas, neutral boss, dan item build MLBB.'
      },
      {
        id: 'mmorpg',
        route: '/mmorpg',
        title: 'FOREST OF SAVIOR',
        jpTitle: 'フォレスト・オブ・セイヴァー',
        badge: 'ANIME MMORPG',
        banner: fosBanner,
        tags: ['OPEN WORLD MMORPG', 'YAMADA-KUN LV999', 'CANVAS 2D', 'QUESTING'],
        actionText: 'PLAY MMORPG',
        desc: 'MMORPG anime open world legendaris. Kamera 2.5D, kota NPC, questing, dan audio prosedural 0 KB.'
      },
      {
        id: 'kingdom',
        route: '/kingdom',
        title: 'KINGDOM IDLE: REBORN',
        jpTitle: 'キングダム・アイドル：リボーン',
        badge: 'IDLE STRATEGY MANAGEMENT',
        banner: mechaBanner,
        tags: ['DESKTOP IDLE', 'SUPPLY LINES', 'ROYAL PRESTIGE', 'AUTO-SAVE'],
        actionText: 'PLAY KINGDOM IDLE',
        desc: 'Bangun kerajaan fantasi dari desa kecil, kelola jalur suplai pekerja, ekspansi garnisun militer, dan kenaikan tahta dinasti.'
      },
      {
        id: 'truck',
        route: '/truck',
        title: 'TRUCK SIMULATOR: MUD & CARGO',
        jpTitle: 'トラック・シミュレーター：マッド＆カーゴ',
        badge: '2D OFFROAD SIMULATOR',
        banner: mechaBanner,
        tags: ['2D RIGID BODY', 'CARGO LOADING', 'CUSTOM ENGINE', 'OFFROAD 4WD'],
        actionText: 'PLAY TRUCK SIM',
        desc: 'Simulator truk realistis: isi muatan manual, modif mesin & komponen, taklukkan rute offroad berlumpur tanpa terbalik.'
      },
      {
        id: 'trainsim',
        route: '/trainsim',
        title: 'TRAIN SIMULATOR: STEEL & RAILS',
        jpTitle: 'トレイン・シミュレーター：スティール＆レール',
        badge: '2D RAILWAY SIMULATOR',
        banner: trainBanner,
        tags: ['2D MULTI-BODY', 'COUPLER DYNAMICS', 'CC 206 & KRL', 'STATION TIMETABLE'],
        actionText: 'PLAY TRAIN SIM',
        desc: 'Simulator masinis kereta api 2D realistis: atur gerbong di depo, kendalikan throttle notch, rem angin, semboyan 35, wesel & persinyalan stasiun.'
      }
    ];

    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="w-screen h-screen overflow-hidden bg-[#FF2A85] text-slate-950 font-sans select-none flex flex-col relative">
        
        <!-- ================= TOP COMPACT HEADER (h-12) ================= -->
        <header class="w-full h-12 bg-[#FFE500] border-b-3 border-black px-4 flex items-center justify-between gap-4 z-40 shrink-0 shadow-[0_2px_0_0_#000]">
          <!-- Zone 1: Wordmark -->
          <a href="#/" class="flex items-center gap-2 text-black whitespace-nowrap shrink-0 group">
            <span class="w-7 h-7 bg-black text-[#FFE500] border-2 border-black rounded-lg flex items-center justify-center font-black text-sm shadow-[1.5px_1.5px_0px_0px_#FFFFFF] group-hover:rotate-6 transition-transform">
              ✦
            </span>
            <div class="leading-none flex items-baseline gap-1.5">
              <span class="font-bungee text-base tracking-wider uppercase text-black">
                NEO ARCADE
              </span>
              <span class="hidden sm:inline text-[10px] font-black text-black/80 tracking-widest uppercase">
                // ゲームセンター
              </span>
            </div>
          </a>

          <!-- Zone 2: Station Jump Tabs (Horizontal Navigation) -->
          <nav class="flex items-center gap-2 text-xs font-black tracking-wider uppercase text-black">
            <button id="tab-station-01" class="station-tab px-3 py-1 rounded-md border-2 border-black bg-black text-[#FFE500] shadow-[2px_2px_0px_0px_#000] cursor-pointer whitespace-nowrap shrink-0 transition-transform active:translate-y-0.5">
              ★ 01. SPOTLIGHT
            </button>
            <button id="tab-station-02" class="station-tab px-3 py-1 rounded-md border-2 border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer whitespace-nowrap shrink-0 transition-transform active:translate-y-0.5">
              🎮 02. GAME SELECTOR
            </button>
            <button id="tab-station-03" class="station-tab px-3 py-1 rounded-md border-2 border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer whitespace-nowrap shrink-0 transition-transform active:translate-y-0.5">
              ⌨ 03. CONTROLS
            </button>
          </nav>

          <!-- Zone 3: Navigation Quick Controls & SFX Toggle -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="hidden md:flex items-center gap-1 border-2 border-black bg-white rounded-md px-1 py-0.5 shadow-[1.5px_1.5px_0px_0px_#000]">
              <button id="hdr-scroll-left" class="px-2 py-0.5 hover:bg-[#FFE500] rounded font-black text-xs cursor-pointer" title="Scroll Left (A / Left Arrow)">
                ◀
              </button>
              <span class="text-[9px] font-mono font-bold text-slate-500">DECK</span>
              <button id="hdr-scroll-right" class="px-2 py-0.5 hover:bg-[#FFE500] rounded font-black text-xs cursor-pointer" title="Scroll Right (D / Right Arrow)">
                ▶
              </button>
            </div>

            <button id="btn-toggle-sound" class="neo-btn px-2.5 py-1 bg-white text-black font-black text-xs rounded-md flex items-center gap-1 whitespace-nowrap shrink-0" title="Toggle Sound">
              <span id="sound-icon">🔊</span> <span id="sound-label" class="hidden sm:inline">SFX: ON</span>
            </button>

            <button id="btn-header-quickplay" class="neo-btn px-3 py-1 bg-black text-[#FFE500] font-black text-xs rounded-md flex items-center gap-1 whitespace-nowrap shrink-0 hover:bg-white hover:text-black">
              <span>▶ PLAY</span>
            </button>
          </div>
        </header>

        <!-- Animated Caution Hazard Tape Bar with Cyber Line Accent -->
        <div class="relative w-full h-2.5 otasukebu-hazard border-b-2 border-black shrink-0">
          <div class="absolute inset-x-0 bottom-0 h-0.5 bg-black/60"></div>
        </div>

        <!-- ================= MAIN CENTER STAGE WITH SIDE MARGIN RIBBONS & CYBER STRIPES ================= -->
        <div class="flex-1 min-h-0 flex flex-row overflow-hidden relative">
          
          <!-- LEFT YELLOW RIBBON (w-10 md:w-11) -->
          <aside class="w-9 md:w-10 bg-[#FFE500] border-r-2.5 border-black shrink-0 relative overflow-hidden flex flex-col items-center justify-between z-30 select-none shadow-[2px_0px_0px_0px_#000]">
            <div class="pt-2 text-black text-xs font-black">✦</div>
            <div class="h-full overflow-hidden relative w-full flex items-center justify-center">
              <div class="marquee-track-vertical-up whitespace-nowrap text-[10px] md:text-[11px] font-black tracking-widest text-black flex flex-col items-center gap-8 py-2 [writing-mode:vertical-rl]">
                <span>★ NEO ARCADE 2026 ★</span>
                <span>👓 MEGANE POP GAME CENTER 👓</span>
                <span>★ ネオ・アーケード ★</span>
                <span>🎮 100% WEB NATIVE GAMES 🎮</span>
                <span>★ HYPER LOAD DECK ★</span>
                <span>✦ HORIZONTAL SELECTOR ✦</span>
                <span>★ NEO ARCADE 2026 ★</span>
                <span>👓 MEGANE POP GAME CENTER 👓</span>
                <span>★ ネオ・アーケード ★</span>
                <span>🎮 100% WEB NATIVE GAMES 🎮</span>
                <span>★ HYPER LOAD DECK ★</span>
                <span>✦ HORIZONTAL SELECTOR ✦</span>
              </div>
            </div>
            <div class="pb-2 text-black text-xs font-black">✦</div>
          </aside>

          <!-- ================= LEFT WHITE-BLACK CYBER STRIPE (ANIMATED UPWARDS) ================= -->
          <div class="w-4 md:w-5.5 h-full cyber-stripes-up border-r-3 border-black relative overflow-hidden flex flex-col items-center justify-between py-2 shrink-0 z-20 shadow-[2px_0px_0px_0px_#000]" title="Cyber Stripe [L-UP]">
            <!-- Top Cyber Node -->
            <div class="w-3 h-3 bg-[#FFE500] border-2 border-black rounded-sm flex items-center justify-center shadow-[1px_1px_0px_0px_#000] z-10">
              <span class="text-[7px] font-black leading-none">▲</span>
            </div>
            
            <!-- Middle Cyber Indicator Vertical Pill -->
            <div class="bg-black/85 backdrop-blur-sm border border-[#FFE500] rounded px-0.5 py-1.5 flex flex-col items-center gap-1 shadow-lg z-10">
              <span class="w-1.5 h-1.5 rounded-full bg-[#FFE500] animate-pulse"></span>
              <span class="text-[7px] font-mono font-black text-white [writing-mode:vertical-rl] tracking-tighter">UP-01</span>
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
            </div>

            <!-- Bottom Cyber Node -->
            <div class="w-3 h-3 bg-black border-2 border-[#FFE500] rounded-sm flex items-center justify-center shadow-[1px_1px_0px_0px_#000] z-10">
              <span class="text-[7px] font-black text-[#FFE500] leading-none">▲</span>
            </div>
          </div>

          <!-- ================= MIDDLE HORIZONTAL SCROLL TRACK ================= -->
          <main id="horizontal-deck" class="horizontal-scroll-track flex-1 h-full otasukebu-grid-bg flex flex-row flex-nowrap items-stretch p-3 md:p-4 gap-4 md:gap-6 overflow-x-auto overflow-y-hidden select-none cursor-grab active:cursor-grabbing">
            
            <!-- ================= STATION 01: HERO SPOTLIGHT (COMPACT OTASUKEBU STAGE) ================= -->
            <section id="station-01" class="horizontal-panel w-[680px] md:w-[780px] lg:w-[860px] h-full flex flex-col justify-between shrink-0">
              
              <!-- Spotlight Card Container with Cyber HUD Corners -->
              <div class="w-full h-full bg-white neo-box cyber-hud-corner rounded-2xl p-3 md:p-4 flex flex-col justify-between relative overflow-hidden shadow-[5px_5px_0px_0px_#000]">
                
                <!-- Card Header Strip with Cyber Line Accent -->
                <div class="flex items-center justify-between pb-2 mb-2 border-b-2 border-black shrink-0 relative">
                  <!-- Cyber Accent Top Marker -->
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-[#FFE500] border-2 border-black font-bungee text-[11px] text-black rounded uppercase shadow-[1px_1px_0px_0px_#000]">
                      STATION 01
                    </span>
                    <h2 class="font-bungee text-sm md:text-base text-black uppercase tracking-wider flex items-center gap-1.5">
                      <span>FEATURED SHOWCASE</span>
                      <span class="text-slate-400 font-mono text-xs hidden sm:inline">// 今すぐ遊ぶ</span>
                    </h2>
                  </div>

                  <!-- Cyber HUD Status Ticks -->
                  <div class="flex items-center gap-2">
                    <div class="hidden sm:flex items-center gap-1 text-[9px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-black/20">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>SYS:ONLINE</span>
                    </div>
                    <span id="showcase-index-badge" class="px-2 py-0.5 bg-black text-[#FFE500] font-mono text-[11px] font-bold rounded border border-black">
                      01 / 05
                    </span>
                    <div class="flex items-center gap-1">
                      <button id="showcase-prev-btn" class="neo-btn w-6 h-6 rounded bg-white text-black font-black flex items-center justify-center text-xs hover:bg-[#FFE500]" title="Previous">
                        ◀
                      </button>
                      <button id="showcase-next-btn" class="neo-btn w-6 h-6 rounded bg-white text-black font-black flex items-center justify-center text-xs hover:bg-[#FFE500]" title="Next">
                        ▶
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Main Cinema Banner Frame with Central Otasukebu PLAY Button -->
                <div class="relative flex-1 min-h-0 w-full rounded-xl overflow-hidden border-2.5 border-black bg-slate-900 group shadow-inner">
                  <img 
                    id="showcase-banner-img"
                    src="${this.games[0].banner}" 
                    alt="${this.games[0].title}"
                    class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    referrerpolicy="no-referrer"
                  />

                  <!-- Contrast Scrim -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 flex flex-col justify-between p-3 md:p-5">
                    
                    <!-- Top Badge -->
                    <div class="flex items-center justify-between">
                      <span id="showcase-badge" class="px-2.5 py-0.5 bg-[#FFE500] border-2 border-black text-black font-black text-[11px] rounded shadow-[1.5px_1.5px_0px_0px_#000] tracking-wider uppercase">
                        ${this.games[0].badge}
                      </span>
                      <span class="hidden sm:inline px-2 py-0.5 bg-black/60 backdrop-blur text-white text-[10px] font-bold rounded border border-white/20">
                        ⚡ HYPER LOAD 120 FPS
                      </span>
                    </div>

                    <!-- Center Big Otasukebu PLAY Button -->
                    <div class="flex items-center justify-center my-auto">
                      <button id="showcase-play-btn" class="neo-play-btn px-6 md:px-10 py-2.5 md:py-3.5 rounded-full flex items-center gap-3 text-base md:text-xl font-black tracking-wider uppercase">
                        <span class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FFE500] text-black flex items-center justify-center text-xs md:text-sm font-black shadow-[1px_1px_0px_0px_#000]">▶</span>
                        <span id="showcase-play-label">PLAY NOW</span>
                      </button>
                    </div>

                    <!-- Bottom Info Strip -->
                    <div class="flex flex-col md:flex-row md:items-end justify-between gap-1.5 bg-black/50 backdrop-blur-sm p-2 rounded-lg border border-white/10">
                      <div>
                        <h3 id="showcase-title" class="text-xl md:text-2xl font-black text-white uppercase tracking-wide leading-none mb-0.5 drop-shadow">
                          ${this.games[0].title}
                        </h3>
                        <p id="showcase-jptitle" class="text-[11px] font-bold text-[#FFE500] tracking-wider leading-none">
                          ${this.games[0].jpTitle}
                        </p>
                      </div>
                      <div id="showcase-tags" class="flex flex-wrap items-center gap-1.5 text-[10px] text-white/90 font-mono">
                        ${this.games[0].tags.map(t => `<span class="bg-black/70 px-1.5 py-0.5 rounded border border-white/20">${t}</span>`).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Showcase Bottom Control & Station Switcher -->
                <div class="flex items-center justify-between pt-2.5 mt-2 border-t-2 border-black shrink-0">
                  <div class="flex items-center gap-2" id="showcase-dots-container">
                    <!-- Dots injected -->
                  </div>

                  <div class="text-[11px] font-bold text-slate-600 hidden sm:flex items-center gap-2">
                    <span>Gunakan Mouse Wheel atau Panah ◀ ▶ untuk Geser</span>
                  </div>

                  <button id="btn-jump-to-selector" class="neo-btn px-3 py-1 bg-[#FFE500] hover:bg-black hover:text-[#FFE500] text-black font-black text-xs rounded-md flex items-center gap-1 uppercase tracking-wider">
                    <span>KE GAME SELECTOR ➔</span>
                  </button>
                </div>
              </div>
            </section>

            <!-- ================= STATION 02: GAME SELECTOR ARSENAL (5 COMPACT CARDS) ================= -->
            <section id="station-02" class="horizontal-panel w-[1380px] md:w-[1550px] lg:w-[1720px] h-full flex flex-col justify-between shrink-0">
              
              <div class="w-full h-full bg-white neo-box rounded-2xl p-3 md:p-4 flex flex-col justify-between relative shadow-[5px_5px_0px_0px_#000]">
                
                <!-- Station 02 Header -->
                <div class="flex items-center justify-between pb-2 mb-2 border-b-2 border-black shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-[#FF2A85] text-white border-2 border-black font-bungee text-[11px] rounded uppercase">
                      STATION 02
                    </span>
                    <h2 class="font-bungee text-sm md:text-base text-black uppercase tracking-wider">
                      GAME SELECTOR ARSENAL // ゲーム選択
                    </h2>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-black text-[#FFE500] font-mono text-[10px] font-bold rounded">
                      5 GAMES READY TO PLAY
                    </span>
                  </div>
                </div>

                <!-- 5 Cards Grid - strictly fits within height -->
                <div class="flex-1 min-h-0 grid grid-cols-5 gap-2.5 md:gap-3 items-stretch">
                  
                  <!-- CARD 1: DAWN ARENA 5v5 MOBA -->
                  <div class="bg-[#FFFEE5] border-2.5 border-black rounded-xl p-2.5 md:p-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform group">
                    <div class="flex flex-col gap-1.5">
                      <!-- Mini Thumbnail -->
                      <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-black bg-slate-900 shrink-0">
                        <img 
                          src="${mobaBanner}" 
                          alt="Dawn Arena MOBA"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerpolicy="no-referrer"
                        />
                        <span class="absolute top-1 left-1 px-1.5 py-0.2 bg-[#FFE500] border border-black text-black font-black text-[9px] rounded uppercase shadow-[1px_1px_0px_0px_#000]">
                          5v5 MOBA
                        </span>
                        <span class="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black text-white font-mono text-[9px] font-bold rounded">
                          120 FPS
                        </span>
                      </div>

                      <h4 class="font-bungee text-sm md:text-base text-black leading-tight">
                        DAWN ARENA 5v5
                      </h4>
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        1v9 AI BOTS · 3-LANE MLBB
                      </p>

                      <!-- Unboxed Tags -->
                      <div class="flex flex-wrap items-center gap-1 text-[10px] text-slate-700 font-bold">
                        <span>10 Heroes</span>
                        <span aria-hidden="true">·</span>
                        <span>Lord & Turtle</span>
                        <span aria-hidden="true">·</span>
                        <span>0 KB Audio</span>
                      </div>
                    </div>

                    <!-- Play Action -->
                    <div class="pt-2 border-t-2 border-black/15 flex flex-col gap-1.5 shrink-0">
                      <button id="card-btn-moba" class="neo-btn w-full py-2 bg-[#FFE500] hover:bg-black hover:text-[#FFE500] text-black font-black text-xs rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <span>▶ PLAY MOBA (/moba)</span>
                      </button>
                      <button id="card-btn-quick-hero" class="w-full py-0.5 text-[10px] font-bold text-slate-700 hover:text-black underline cursor-pointer">
                        Hero Pilihan: Layla / Chou
                      </button>
                    </div>
                  </div>

                  <!-- CARD 2: FOREST OF SAVIOR MMORPG -->
                  <div class="bg-[#FFEBF4] border-2.5 border-black rounded-xl p-2.5 md:p-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform group">
                    <div class="flex flex-col gap-1.5">
                      <!-- Mini Thumbnail -->
                      <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-black bg-slate-900 shrink-0">
                        <img 
                          src="${fosBanner}" 
                          alt="Forest of Savior MMORPG"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerpolicy="no-referrer"
                        />
                        <span class="absolute top-1 left-1 px-1.5 py-0.2 bg-[#FF2A85] border border-black text-white font-black text-[9px] rounded uppercase shadow-[1px_1px_0px_0px_#000]">
                          MMORPG
                        </span>
                        <span class="absolute bottom-1 right-1 px-1.5 py-0.2 bg-black text-white font-mono text-[9px] font-bold rounded">
                          CANVAS 2D
                        </span>
                      </div>

                      <h4 class="font-bungee text-sm md:text-base text-black leading-tight">
                        FOREST OF SAVIOR
                      </h4>
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        YAMADA LV999 · OPEN WORLD
                      </p>

                      <!-- Unboxed Tags -->
                      <div class="flex flex-wrap items-center gap-1 text-[10px] text-slate-700 font-bold">
                        <span>NPC Quests</span>
                        <span aria-hidden="true">·</span>
                        <span>2.5D Angles</span>
                        <span aria-hidden="true">·</span>
                        <span>Procedural</span>
                      </div>
                    </div>

                    <!-- Play Action -->
                    <div class="pt-2 border-t-2 border-black/15 flex flex-col gap-1.5 shrink-0">
                      <button id="card-btn-rpg" class="neo-btn w-full py-2 bg-[#FF2A85] hover:bg-black text-white hover:text-[#FF2A85] font-black text-xs rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider">
                        <span>▶ PLAY RPG (/mmorpg)</span>
                      </button>
                      <span class="text-center text-[10px] font-bold text-slate-600">
                        ✓ Disimpan Permanen & Utuh
                      </span>
                    </div>
                  </div>

                  <!-- CARD 3: PROJECT SPEEDSTAR (UPCOMING TEASER) -->
                  <div class="bg-slate-100 border-2.5 border-black rounded-xl p-2.5 md:p-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform group">
                    <div class="flex flex-col gap-1.5">
                      <!-- Mini Thumbnail -->
                      <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-black bg-slate-900 shrink-0">
                        <img 
                          src="${mechaBanner}" 
                          alt="Project Speedstar"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                          referrerpolicy="no-referrer"
                        />
                        <span class="absolute top-1 left-1 px-1.5 py-0.2 bg-black border border-[#FFE500] text-[#FFE500] font-black text-[9px] rounded uppercase shadow-[1px_1px_0px_0px_#000]">
                          COMING SOON
                        </span>
                        <span class="absolute bottom-1 right-1 px-1.5 py-0.2 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded">
                          PLAY NOW
                        </span>
                      </div>

                      <h4 class="font-bungee text-sm md:text-base text-black leading-tight">
                        KINGDOM IDLE: REBORN
                      </h4>
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        IDLE STRATEGY MANAGEMENT
                      </p>

                      <!-- Unboxed Tags -->
                      <div class="flex flex-wrap items-center gap-1 text-[10px] text-slate-700 font-bold">
                        <span>Supply Lines</span>
                        <span aria-hidden="true">·</span>
                        <span>Prestige Throne</span>
                        <span aria-hidden="true">·</span>
                        <span>Auto-Save</span>
                      </div>
                    </div>

                    <!-- Play Action -->
                    <div class="pt-2 border-t-2 border-black/15 flex flex-col gap-1.5 shrink-0">
                      <button id="card-btn-kingdom" class="neo-play-btn w-full py-2 bg-black hover:bg-[#FFE500] text-[#FFE500] hover:text-black font-black text-xs rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer">
                        <span>👑 PLAY KINGDOM IDLE ⚔️</span>
                      </button>
                      <span class="text-center text-[10px] font-bold text-slate-500">
                        Desktop/Laptop • Simpan Otomatis
                      </span>
                    </div>
                  </div>

                  <!-- CARD 4: TRUCK SIMULATOR MUD & CARGO -->
                  <div class="bg-[#FFF4E5] border-2.5 border-black rounded-xl p-2.5 md:p-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform group">
                    <div class="flex flex-col gap-1.5">
                      <!-- Mini Thumbnail -->
                      <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-black bg-slate-900 shrink-0">
                        <img 
                          src="${mechaBanner}" 
                          alt="Truck Simulator Mud & Cargo"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerpolicy="no-referrer"
                        />
                        <span class="absolute top-1 left-1 px-1.5 py-0.2 bg-[#F59E0B] border border-black text-black font-black text-[9px] rounded uppercase shadow-[1px_1px_0px_0px_#000]">
                          SIMULATOR
                        </span>
                        <span class="absolute bottom-1 right-1 px-1.5 py-0.2 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded">
                          CUSTOM 2D
                        </span>
                      </div>

                      <h4 class="font-bungee text-sm md:text-base text-black leading-tight">
                        TRUCK SIMULATOR
                      </h4>
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        MUD & CARGO · 2D REAL RIGID
                      </p>

                      <!-- Unboxed Tags -->
                      <div class="flex flex-wrap items-center gap-1 text-[10px] text-slate-700 font-bold">
                        <span>Pemuatan Manual</span>
                        <span aria-hidden="true">·</span>
                        <span>Diff-Lock 4WD</span>
                        <span aria-hidden="true">·</span>
                        <span>Offroad Bog</span>
                      </div>
                    </div>

                    <!-- Play Action -->
                    <div class="pt-2 border-t-2 border-black/15 flex flex-col gap-1.5 shrink-0">
                      <button id="card-btn-truck" class="neo-play-btn w-full py-2 bg-black hover:bg-[#FFE500] text-[#FFE500] hover:text-black font-black text-xs rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer">
                        <span>🚛 PLAY TRUCK SIM ⚙️</span>
                      </button>
                      <span class="text-center text-[10px] font-bold text-slate-500">
                        Fisika Realistis Bebas • 0 KB Audio
                      </span>
                    </div>
                  </div>

                  <!-- CARD 5: TRAIN SIMULATOR STEEL & RAILS -->
                  <div class="bg-[#E0F2FE] border-2.5 border-black rounded-xl p-2.5 md:p-3 flex flex-col justify-between shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-transform group">
                    <div class="flex flex-col gap-1.5">
                      <!-- Mini Thumbnail -->
                      <div class="relative w-full aspect-[16/9] rounded-lg overflow-hidden border-2 border-black bg-slate-900 shrink-0">
                        <img 
                          src="${trainBanner}" 
                          alt="Train Simulator Steel & Rails"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerpolicy="no-referrer"
                        />
                        <span class="absolute top-1 left-1 px-1.5 py-0.2 bg-[#0284c7] border border-black text-white font-black text-[9px] rounded uppercase shadow-[1px_1px_0px_0px_#000]">
                          TRAIN SIM
                        </span>
                        <span class="absolute bottom-1 right-1 px-1.5 py-0.2 bg-emerald-600 text-white font-mono text-[9px] font-bold rounded">
                          120 FPS
                        </span>
                      </div>

                      <h4 class="font-bungee text-sm md:text-base text-black leading-tight">
                        TRAIN SIMULATOR
                      </h4>
                      <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        STEEL & RAILS · 2D REAL TRAIN
                      </p>

                      <!-- Unboxed Tags -->
                      <div class="flex flex-wrap items-center gap-1 text-[10px] text-slate-700 font-bold">
                        <span>CC 206 & KRL</span>
                        <span aria-hidden="true">·</span>
                        <span>Depo Gerbong</span>
                        <span aria-hidden="true">·</span>
                        <span>Wesel Rel</span>
                      </div>
                    </div>

                    <!-- Play Action -->
                    <div class="pt-2 border-t-2 border-black/15 flex flex-col gap-1.5 shrink-0">
                      <button id="card-btn-trainsim" class="neo-play-btn w-full py-2 bg-[#0284c7] hover:bg-[#FFE500] text-white hover:text-black font-black text-xs rounded-lg flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer">
                        <span>🚂 PLAY TRAIN SIM 🛤️</span>
                      </button>
                      <span class="text-center text-[10px] font-bold text-slate-500">
                        Rem Angin • Semboyan 35 • 0 KB Audio
                      </span>
                    </div>
                  </div>

                </div>

                <!-- Bottom Selector Footer -->
                <div class="flex items-center justify-between pt-2.5 mt-2 border-t-2 border-black shrink-0">
                  <button id="btn-back-to-spotlight" class="neo-btn px-3 py-1 bg-white hover:bg-[#FFE500] text-black font-black text-xs rounded-md uppercase tracking-wider">
                    ◀ KEMBALI KE SPOTLIGHT
                  </button>

                  <div class="text-[11px] font-bold text-slate-700 hidden sm:block">
                    Pilih game untuk langsung masuk tanpa jeda
                  </div>

                  <button id="btn-jump-to-controls" class="neo-btn px-3 py-1 bg-[#FFE500] hover:bg-black hover:text-[#FFE500] text-black font-black text-xs rounded-md uppercase tracking-wider">
                    PANDUAN KONTROL ➔
                  </button>
                </div>
              </div>
            </section>

            <!-- ================= STATION 03: PC CONTROLS & BENCHMARKS ================= -->
            <section id="station-03" class="horizontal-panel w-[520px] md:w-[600px] h-full flex flex-col justify-between shrink-0">
              
              <div class="w-full h-full bg-[#FFE500] neo-box rounded-2xl p-3 md:p-4 flex flex-col justify-between relative shadow-[5px_5px_0px_0px_#000]">
                
                <!-- Station 03 Header -->
                <div class="flex items-center justify-between pb-2 mb-2 border-b-2 border-black shrink-0">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-black text-[#FFE500] border-2 border-black font-bungee text-[11px] rounded uppercase">
                      STATION 03
                    </span>
                    <h2 class="font-bungee text-sm md:text-base text-black uppercase tracking-wider">
                      PC CONTROLS // 操作ガイド
                    </h2>
                  </div>
                  <span class="text-[10px] font-bold text-black/80">Desktop-Only</span>
                </div>

                <!-- Controls 2x2 Grid -->
                <div class="grid grid-cols-2 gap-2.5 my-auto">
                  <div class="bg-white border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000]">
                    <span class="font-mono font-black text-black text-xs block mb-0.5">WASD / Klik Kanan</span>
                    <span class="font-bold text-slate-800 text-[11px] block">Pergerakan Hero & Karakter</span>
                  </div>
                  <div class="bg-white border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000]">
                    <span class="font-mono font-black text-black text-xs block mb-0.5">1 2 3 / Q E R</span>
                    <span class="font-bold text-slate-800 text-[11px] block">Skill 1, 2 & Ultimate</span>
                  </div>
                  <div class="bg-white border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000]">
                    <span class="font-mono font-black text-black text-xs block mb-0.5">Klik Kiri / Spasi</span>
                    <span class="font-bold text-slate-800 text-[11px] block">Basic Attack & Serangan</span>
                  </div>
                  <div class="bg-white border-2 border-black rounded-xl p-2.5 shadow-[2px_2px_0px_0px_#000]">
                    <span class="font-mono font-black text-black text-xs block mb-0.5">4 / F & 5 & B</span>
                    <span class="font-bold text-slate-800 text-[11px] block">Battle Spell & Recall</span>
                  </div>
                </div>

                <!-- Engine Specs Benchmark -->
                <div class="bg-black text-[#FFE500] border-2 border-black rounded-xl p-2.5 flex items-center justify-between text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000]">
                  <div>
                    <span class="text-[10px] text-white block">ENGINE BENCHMARK:</span>
                    <span>120 FPS · 0 KB AUDIO</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button id="btn-test-sfx-blip" class="px-2 py-1 bg-white text-black rounded text-[10px] font-black cursor-pointer hover:bg-[#FFE500]">
                      ♫ BLIP
                    </button>
                    <button id="btn-test-sfx-fanfare" class="px-2 py-1 bg-[#FFE500] text-black rounded text-[10px] font-black cursor-pointer hover:bg-white">
                      ★ FANFARE
                    </button>
                  </div>
                </div>

                <!-- Station 03 Footer -->
                <div class="flex items-center justify-between pt-2.5 mt-2 border-t-2 border-black shrink-0">
                  <button id="btn-back-to-deck-start" class="neo-btn px-3 py-1 bg-white hover:bg-black hover:text-[#FFE500] text-black font-black text-xs rounded-md uppercase tracking-wider">
                    ◀ KEMBALI KE AWAL
                  </button>
                  <button id="btn-controls-play-now" class="neo-btn px-4 py-1 bg-black text-[#FFE500] font-black text-xs rounded-md uppercase tracking-wider hover:bg-white hover:text-black">
                    ▶ MAIN SEKARANG
                  </button>
                </div>
              </div>
            </section>

          </main>

          <!-- ================= RIGHT WHITE-BLACK CYBER STRIPE (ANIMATED DOWNWARDS) ================= -->
          <div class="w-4 md:w-5.5 h-full cyber-stripes-down border-l-3 border-black relative overflow-hidden flex flex-col items-center justify-between py-2 shrink-0 z-20 shadow-[-2px_0px_0px_0px_#000]" title="Cyber Stripe [R-DOWN]">
            <!-- Top Cyber Node -->
            <div class="w-3 h-3 bg-black border-2 border-[#FFE500] rounded-sm flex items-center justify-center shadow-[1px_1px_0px_0px_#000] z-10">
              <span class="text-[7px] font-black text-[#FFE500] leading-none">▼</span>
            </div>
            
            <!-- Middle Cyber Indicator Vertical Pill -->
            <div class="bg-black/85 backdrop-blur-sm border border-[#FFE500] rounded px-0.5 py-1.5 flex flex-col items-center gap-1 shadow-lg z-10">
              <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
              <span class="text-[7px] font-mono font-black text-white [writing-mode:vertical-rl] tracking-tighter">DN-02</span>
              <span class="w-1.5 h-1.5 rounded-full bg-[#FFE500] animate-pulse"></span>
            </div>

            <!-- Bottom Cyber Node -->
            <div class="w-3 h-3 bg-[#FFE500] border-2 border-black rounded-sm flex items-center justify-center shadow-[1px_1px_0px_0px_#000] z-10">
              <span class="text-[7px] font-black leading-none">▼</span>
            </div>
          </div>

          <!-- RIGHT YELLOW RIBBON (w-9 md:w-10) -->
          <aside class="w-9 md:w-10 bg-[#FFE500] border-l-2.5 border-black shrink-0 relative overflow-hidden flex flex-col items-center justify-between z-30 select-none shadow-[-2px_0px_0px_0px_#000]">
            <div class="pt-2 text-black text-xs font-black">✦</div>
            <div class="h-full overflow-hidden relative w-full flex items-center justify-center">
              <div class="marquee-track-vertical-down whitespace-nowrap text-[10px] md:text-[11px] font-black tracking-widest text-black flex flex-col items-center gap-8 py-2 [writing-mode:vertical-rl]">
                <span>★ SELECT YOUR BATTLE ★</span>
                <span>⚡ 5v5 MOBA ARENA ⚡</span>
                <span>★ FOREST OF SAVIOR RPG ★</span>
                <span>💖 OTAKU POP CULTURE 💖</span>
                <span>★ ZERO SCROLL DOWN ★</span>
                <span>✦ 今すぐプレイ ✦</span>
                <span>★ SELECT YOUR BATTLE ★</span>
                <span>⚡ 5v5 MOBA ARENA ⚡</span>
                <span>★ FOREST OF SAVIOR RPG ★</span>
                <span>💖 OTAKU POP CULTURE 💖</span>
                <span>★ ZERO SCROLL DOWN ★</span>
                <span>✦ 今すぐプレイ ✦</span>
              </div>
            </div>
            <div class="pb-2 text-black text-xs font-black">✦</div>
          </aside>
        </div>

        <!-- ================= BOTTOM COMPACT STATUS BAR (h-7) ================= -->
        <footer class="w-full h-7 bg-black text-[#FFE500] border-t-2 border-black px-4 flex items-center justify-between text-[11px] font-mono font-bold shrink-0 z-40 select-none">
          <div class="flex items-center gap-3">
            <span>NEO ARCADE // HORIZONTAL DECK</span>
            <span class="text-white/60">·</span>
            <span class="text-white">100% NO VERTICAL SCROLL</span>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-white/80 hidden sm:inline">NAVIGASI:</span>
            <span class="bg-[#FFE500] text-black px-1.5 py-0.2 rounded font-black text-[10px]">MOUSE WHEEL ⇄</span>
            <span class="text-white/60">atau</span>
            <span class="bg-white text-black px-1.5 py-0.2 rounded font-black text-[10px]">PANAH ◀ ▶</span>
          </div>

          <div class="flex items-center gap-3">
            <span id="footer-active-station" class="text-white">STATION: 01 SPOTLIGHT</span>
            <span class="text-[#FFE500]">EDISI 2026</span>
          </div>
        </footer>

      </div>
    `;
  }

  bindEvents() {
    const deck = document.getElementById('horizontal-deck');

    // ================= 1. REKAYASA MOUSE WHEEL KE HORIZONTAL SCROLL =================
    // Mengubah perputaran vertikal mouse wheel (deltaY) menjadi pergerakan horizontal mulus (scrollLeft)
    this.wheelHandler = (e) => {
      if (deck) {
        e.preventDefault();
        deck.scrollLeft += e.deltaY * 1.1;
      }
    };
    deck?.addEventListener('wheel', this.wheelHandler, { passive: false });

    // ================= 2. DRAG TO SCROLL (MOUSE GRAB / TOUCH) =================
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    deck?.addEventListener('mousedown', (e) => {
      // Don't intercept button clicks
      if (e.target.closest('button') || e.target.closest('a')) return;
      isDown = true;
      startX = e.pageX - deck.offsetLeft;
      scrollLeft = deck.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
    });

    deck?.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - deck.offsetLeft;
      const walk = (x - startX) * 1.5;
      deck.scrollLeft = scrollLeft - walk;
    });

    // ================= 3. SCROLL POSITION SYNC DENGAN HEADER & FOOTER =================
    deck?.addEventListener('scroll', () => {
      this.syncActiveStationWithScroll();
    });

    // ================= 4. HEADER TABS SMOOTH SCROLL =================
    document.getElementById('tab-station-01')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-01');
    });

    document.getElementById('tab-station-02')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-02');
    });

    document.getElementById('tab-station-03')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-03');
    });

    // Header Quick Buttons
    document.getElementById('hdr-scroll-left')?.addEventListener('click', () => {
      this.synth.playBlip();
      if (deck) deck.scrollBy({ left: -450, behavior: 'smooth' });
    });

    document.getElementById('hdr-scroll-right')?.addEventListener('click', () => {
      this.synth.playBlip();
      if (deck) deck.scrollBy({ left: 450, behavior: 'smooth' });
    });

    // Sound Toggle
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      this.synth.enabled = !this.synth.enabled;
      const icon = document.getElementById('sound-icon');
      const label = document.getElementById('sound-label');
      if (icon) icon.textContent = this.synth.enabled ? '🔊' : '🔇';
      if (label) label.textContent = this.synth.enabled ? 'SFX: ON' : 'SFX: OFF';
      if (this.synth.enabled) this.synth.playBlip();
    });

    // Quick Play in Header
    document.getElementById('btn-header-quickplay')?.addEventListener('click', () => {
      this.synth.playLaunch();
      const activeGame = this.games[this.activeSlideIndex];
      if (activeGame && activeGame.route) {
        window.navigateTo(activeGame.route, { heroId: this.selectedHeroId, spellId: this.selectedSpellId });
      } else {
        window.navigateTo('/moba');
      }
    });

    // ================= 5. STATION 01 SHOWCASE CAROUSEL =================
    document.getElementById('showcase-prev-btn')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.prevSlide();
    });

    document.getElementById('showcase-next-btn')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.nextSlide();
    });

    document.getElementById('showcase-play-btn')?.addEventListener('click', () => {
      const activeGame = this.games[this.activeSlideIndex];
      if (activeGame.isUpcoming) {
        this.synth.playSelect();
        alert('🚀 PROJECT: SPEEDSTAR sedang dalam pengembangan aktif! Nantikan perilisannya di Neo Arcade!');
        return;
      }
      this.synth.playLaunch();
      window.navigateTo(activeGame.route, { heroId: this.selectedHeroId, spellId: this.selectedSpellId });
    });

    document.getElementById('btn-jump-to-selector')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-02');
    });

    // ================= 6. STATION 02 GAME CARDS =================
    document.getElementById('card-btn-moba')?.addEventListener('click', () => {
      this.synth.playLaunch();
      window.navigateTo('/moba', { heroId: this.selectedHeroId, spellId: this.selectedSpellId });
    });

    document.getElementById('card-btn-quick-hero')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.selectedHeroId = this.selectedHeroId === 'layla' ? 'chou' : 'layla';
      const btn = document.getElementById('card-btn-quick-hero');
      if (btn) btn.textContent = `Hero: ${this.selectedHeroId === 'layla' ? 'Layla (Marksman)' : 'Chou (Fighter)'}`;
    });

    document.getElementById('card-btn-rpg')?.addEventListener('click', () => {
      this.synth.playLaunch();
      window.navigateTo('/mmorpg');
    });

    document.getElementById('card-btn-kingdom')?.addEventListener('click', () => {
      this.synth.playLaunch();
      window.navigateTo('/kingdom');
    });

    document.getElementById('card-btn-truck')?.addEventListener('click', () => {
      this.synth.playLaunch();
      window.navigateTo('/truck');
    });

    document.getElementById('card-btn-trainsim')?.addEventListener('click', () => {
      this.synth.playLaunch();
      window.navigateTo('/trainsim');
    });

    document.getElementById('btn-back-to-spotlight')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-01');
    });

    document.getElementById('btn-jump-to-controls')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-03');
    });

    // ================= 7. STATION 03 CONTROLS & BENCHMARKS =================
    document.getElementById('btn-test-sfx-blip')?.addEventListener('click', () => {
      this.synth.playBlip();
    });

    document.getElementById('btn-test-sfx-fanfare')?.addEventListener('click', () => {
      this.synth.playLaunch();
    });

    document.getElementById('btn-back-to-deck-start')?.addEventListener('click', () => {
      this.synth.playBlip();
      this.scrollToStation('station-01');
    });

    document.getElementById('btn-controls-play-now')?.addEventListener('click', () => {
      this.synth.playLaunch();
      window.navigateTo('/moba');
    });

    // ================= 8. KEYBOARD NAVIGATION SHORTCUTS =================
    this.keyHandler = (e) => {
      if (e.key === 'ArrowLeft') {
        if (e.shiftKey) {
          this.prevSlide();
        } else if (deck) {
          deck.scrollBy({ left: -320, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowRight') {
        if (e.shiftKey) {
          this.nextSlide();
        } else if (deck) {
          deck.scrollBy({ left: 320, behavior: 'smooth' });
        }
      } else if (e.key === 'Enter') {
        const activeGame = this.games[this.activeSlideIndex];
        if (activeGame && activeGame.route) {
          this.synth.playLaunch();
          window.navigateTo(activeGame.route, { heroId: this.selectedHeroId, spellId: this.selectedSpellId });
        }
      }
    };
    window.addEventListener('keydown', this.keyHandler);

    this.updateDots();
  }

  scrollToStation(stationId) {
    const el = document.getElementById(stationId);
    const deck = document.getElementById('horizontal-deck');
    if (el && deck) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }

  syncActiveStationWithScroll() {
    const deck = document.getElementById('horizontal-deck');
    if (!deck) return;

    const scrollLeft = deck.scrollLeft;
    const st1 = document.getElementById('station-01');
    const st2 = document.getElementById('station-02');
    const st3 = document.getElementById('station-03');

    let current = 'station-01';
    if (st3 && scrollLeft >= st2.offsetLeft + st2.offsetWidth / 2) {
      current = 'station-03';
    } else if (st2 && scrollLeft >= st1.offsetWidth / 2) {
      current = 'station-02';
    }

    if (current !== this.activeStation) {
      this.activeStation = current;
      this.updateActiveTabUI(current);
    }
  }

  updateActiveTabUI(currentStation) {
    ['station-01', 'station-02', 'station-03'].forEach(s => {
      const btn = document.getElementById(`tab-${s}`);
      if (btn) {
        if (s === currentStation) {
          btn.className = 'station-tab px-3 py-1 rounded-md border-2 border-black bg-black text-[#FFE500] shadow-[2px_2px_0px_0px_#000] cursor-pointer whitespace-nowrap shrink-0 transition-transform active:translate-y-0.5';
        } else {
          btn.className = 'station-tab px-3 py-1 rounded-md border-2 border-black bg-white hover:bg-slate-100 text-black shadow-[2px_2px_0px_0px_#000] cursor-pointer whitespace-nowrap shrink-0 transition-transform active:translate-y-0.5';
        }
      }
    });

    const footerSpan = document.getElementById('footer-active-station');
    if (footerSpan) {
      if (currentStation === 'station-01') footerSpan.textContent = 'STATION: 01 SPOTLIGHT';
      if (currentStation === 'station-02') footerSpan.textContent = 'STATION: 02 SELECTOR';
      if (currentStation === 'station-03') footerSpan.textContent = 'STATION: 03 CONTROLS';
    }
  }

  prevSlide() {
    this.activeSlideIndex = (this.activeSlideIndex - 1 + this.games.length) % this.games.length;
    this.updateSlide();
  }

  nextSlide() {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.games.length;
    this.updateSlide();
  }

  setSlide(index) {
    this.activeSlideIndex = index;
    this.updateSlide();
  }

  updateSlide() {
    const g = this.games[this.activeSlideIndex];
    if (!g) return;

    const img = document.getElementById('showcase-banner-img');
    const badge = document.getElementById('showcase-badge');
    const idx = document.getElementById('showcase-index-badge');
    const title = document.getElementById('showcase-title');
    const jptitle = document.getElementById('showcase-jptitle');
    const tags = document.getElementById('showcase-tags');
    const playLabel = document.getElementById('showcase-play-label');

    if (img) img.src = g.banner;
    if (badge) badge.textContent = g.badge;
    if (idx) idx.textContent = `0${this.activeSlideIndex + 1} / 0${this.games.length}`;
    if (title) title.textContent = g.title;
    if (jptitle) jptitle.textContent = g.jpTitle;
    if (playLabel) playLabel.textContent = g.actionText;

    if (tags) {
      tags.innerHTML = g.tags.map(t => `<span class="bg-black/70 px-1.5 py-0.5 rounded border border-white/20">${t}</span>`).join('');
    }

    this.updateDots();
  }

  updateDots() {
    const container = document.getElementById('showcase-dots-container');
    if (!container) return;
    container.innerHTML = '';

    this.games.forEach((_, i) => {
      const dot = document.createElement('button');
      const isActive = i === this.activeSlideIndex;
      dot.className = `w-3.5 h-3.5 rounded-full border-2 border-black transition-all cursor-pointer ${isActive ? 'bg-[#FFE500] scale-125 shadow-[1px_1px_0px_0px_#000]' : 'bg-white hover:bg-slate-200'}`;
      dot.title = `Switch to Game ${i + 1}`;
      dot.addEventListener('click', () => {
        this.synth.playBlip();
        this.setSlide(i);
      });
      container.appendChild(dot);
    });
  }

  destroy() {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    const deck = document.getElementById('horizontal-deck');
    if (deck && this.wheelHandler) {
      deck.removeEventListener('wheel', this.wheelHandler);
    }
  }
}
