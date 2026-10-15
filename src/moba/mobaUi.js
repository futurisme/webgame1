/**
 * MLBB-Style Competitive MOBA User Interface & HUD.
 * Top scoreboard, skills hotbar, Quick-Buy recommendations, Ping wheel, Full Shop, and 5v5 Tab Scoreboard.
 * 100% Pure JavaScript, zero TSX.
 */

import { ITEMS_DATA, ROLE_LABELS } from './mobaData.js';
import { getMobaIcon } from './mobaIcons.js';

export class MobaUIManager {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.activeModal = null; // null, 'shop', 'scoreboard', 'victory', 'defeat'

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container.innerHTML = `
      <!-- Top Center Scoreboard & Clock -->
      <div class="pointer-events-auto absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-3 z-30">
        <div class="flex items-center bg-slate-950/90 border border-slate-700/80 rounded-full px-5 py-1.5 shadow-2xl backdrop-blur-md">
          <!-- Blue Team Kills -->
          <div class="flex items-center gap-2 pr-4 border-r border-slate-700">
            <span class="w-3 h-3 rounded-full bg-sky-400"></span>
            <span id="score-blue" class="text-lg font-black text-sky-400 font-mono">0</span>
          </div>

          <!-- Match Clock -->
          <div class="px-4 text-center">
            <span id="match-timer" class="text-sm font-bold text-slate-200 font-mono tracking-wider">00:00</span>
          </div>

          <!-- Red Team Kills -->
          <div class="flex items-center gap-2 pl-4 border-l border-slate-700">
            <span id="score-red" class="text-lg font-black text-rose-500 font-mono">0</span>
            <span class="w-3 h-3 rounded-full bg-rose-500"></span>
          </div>
        </div>

        <!-- Latency & FPS Monitor -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-[10px] text-emerald-400 font-mono">
          <span id="moba-fps">120 FPS</span>
          <span class="text-slate-600">|</span>
          <span id="moba-ping">3.2ms</span>
        </div>

        <!-- Menu / Back to Beranda Button -->
        <button id="moba-menu-btn" class="px-3 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full border border-slate-700 text-xs font-bold transition-all shadow-lg flex items-center gap-1.5">
          ${getMobaIcon('home', 14)} <span>Beranda</span>
        </button>
      </div>

      <!-- Top Left: Player KDA, Gold & Scoreboard Toggle -->
      <div class="pointer-events-auto absolute top-3 left-3 flex flex-col gap-2 z-30">
        <div class="bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 px-3 flex items-center gap-3 shadow-xl backdrop-blur-md">
          <!-- Hero Avatar -->
          <div class="relative w-11 h-11 rounded-xl bg-slate-800 border-2 border-amber-400 overflow-hidden flex items-center justify-center font-black text-amber-300 text-base shadow-inner">
            <span id="player-hud-avatar">L</span>
            <span id="player-hud-lvl" class="absolute bottom-0 right-0 bg-amber-500 text-slate-950 text-[9px] font-black px-1 rounded-tl">1</span>
          </div>

          <!-- KDA & Gold -->
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <span id="player-hud-name" class="text-xs font-bold text-white">Layla</span>
              <span id="player-hud-kda" class="text-xs font-mono font-black text-amber-400">0 / 0 / 0</span>
            </div>
            <div class="flex items-center gap-1 text-xs text-amber-300 font-bold font-mono">
              ${getMobaIcon('coin', 12, 'text-amber-400')}
              <span id="player-hud-gold">300</span>
            </div>
          </div>

          <!-- Tab Scoreboard Trigger -->
          <button id="btn-toggle-scoreboard" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded font-bold border border-slate-700" title="Scoreboard [Tab]">
            TAB
          </button>
        </div>

        <!-- Quick-Buy Item Slot -->
        <div id="quick-buy-box" class="hidden bg-slate-950/90 border border-amber-500/80 rounded-xl p-2 flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md cursor-pointer hover:border-amber-400 transition-all">
          <div class="flex items-center gap-2">
            <span id="qb-icon" class="text-amber-400">${getMobaIcon('swords_cross', 18)}</span>
            <div>
              <span id="qb-name" class="text-[11px] font-bold text-white block">Item</span>
              <span id="qb-cost" class="text-[10px] font-bold text-amber-400 font-mono flex items-center gap-1">${getMobaIcon('coin', 11, 'text-amber-400')} 2100</span>
            </div>
          </div>
          <button id="qb-btn" class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg transition-transform hover:scale-105">
            BELI
          </button>
        </div>
      </div>

      <!-- Right Side: Tactical Pings Wheel / Buttons -->
      <div class="pointer-events-auto absolute top-20 right-3 flex flex-col gap-2 z-30">
        <button class="ping-btn w-10 h-10 rounded-full bg-slate-900/90 hover:bg-amber-600/80 text-amber-300 hover:text-white border border-amber-500/50 flex items-center justify-center shadow-xl transition-all" data-ping="attack_lord" title="Serang Lord / Turtle [Alt+1]">
          ${getMobaIcon('ping_attack', 18)}
        </button>
        <button class="ping-btn w-10 h-10 rounded-full bg-slate-900/90 hover:bg-rose-600/80 text-rose-300 hover:text-white border border-rose-500/50 flex items-center justify-center shadow-xl transition-all" data-ping="retreat" title="Mundur / Retreat [Alt+2]">
          ${getMobaIcon('ping_retreat', 18)}
        </button>
        <button class="ping-btn w-10 h-10 rounded-full bg-slate-900/90 hover:bg-sky-600/80 text-sky-300 hover:text-white border border-sky-500/50 flex items-center justify-center shadow-xl transition-all" data-ping="gather" title="Kumpul / Gather [Alt+3]">
          ${getMobaIcon('ping_gather', 18)}
        </button>
        <button class="ping-btn w-10 h-10 rounded-full bg-slate-900/90 hover:bg-emerald-600/80 text-emerald-300 hover:text-white border border-emerald-500/50 flex items-center justify-center shadow-xl transition-all" data-ping="backup" title="Minta Bantuan [Alt+4]">
          ${getMobaIcon('ping_backup', 18)}
        </button>
        <button id="btn-open-shop" class="w-10 h-10 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black flex items-center justify-center shadow-2xl transition-all" title="Toko Peralatan [P / B]">
          ${getMobaIcon('shop', 18)}
        </button>
      </div>

      <!-- Bottom Center: Hero Status & Skills Hotbar -->
      <div class="pointer-events-auto absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-30">
        <!-- Player HP & Mana Gauge -->
        <div class="w-80 flex flex-col gap-0.5">
          <div class="w-full bg-slate-950/90 rounded-full h-3 p-0.5 border border-slate-700 overflow-hidden relative shadow-lg">
            <div id="hud-hp-bar" class="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-75" style="width: 100%"></div>
            <span id="hud-hp-numbers" class="absolute inset-0 text-[9px] font-black text-white flex items-center justify-center font-mono drop-shadow">2400 / 2400</span>
          </div>
          <div class="w-full bg-slate-950/90 rounded-full h-2 p-0.5 border border-slate-700 overflow-hidden relative shadow-lg">
            <div id="hud-mana-bar" class="bg-gradient-to-r from-sky-600 to-sky-400 h-full rounded-full transition-all duration-75" style="width: 100%"></div>
            <span id="hud-mana-numbers" class="absolute inset-0 text-[7px] font-bold text-white flex items-center justify-center font-mono drop-shadow">400 / 400</span>
          </div>
        </div>

        <!-- Controls Hint Banner -->
        <div class="text-[9px] font-bold text-slate-300 font-mono tracking-wider bg-slate-950/80 px-3 py-0.5 rounded-full border border-slate-800/80 flex items-center gap-2 shadow">
          <span class="text-amber-400">GERAK: WASD / KLIK KANAN</span>
          <span class="text-slate-600">•</span>
          <span class="text-sky-400">SERANG: KLIK KIRI / SPASI</span>
        </div>

        <!-- Hotbar Slots -->
        <div class="bg-slate-950/90 border border-slate-800 rounded-3xl p-2 px-3 flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
          <!-- Skill 1 -->
          <div class="relative flex flex-col items-center">
            <button id="slot-skill1" class="skill-btn relative w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center overflow-hidden transition-all group shadow-inner" title="Skill 1 [1 / Q]">
              <span class="text-amber-400">${getMobaIcon('skill1', 20)}</span>
              <span class="absolute -top-1 left-0.5 bg-slate-800 text-amber-300 text-[8px] font-mono font-bold px-1 rounded border border-slate-700">1/Q</span>
              <div id="cd-skill1" class="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-sm font-black text-amber-300 font-mono hidden"></div>
            </button>
            <button id="upgrade-skill1" class="hidden mt-0.5 w-5 h-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[9px] font-black rounded flex items-center justify-center shadow">+</button>
          </div>

          <!-- Skill 2 -->
          <div class="relative flex flex-col items-center">
            <button id="slot-skill2" class="skill-btn relative w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-amber-400 flex flex-col items-center justify-center overflow-hidden transition-all group shadow-inner" title="Skill 2 [2 / E]">
              <span class="text-cyan-400">${getMobaIcon('skill2', 20)}</span>
              <span class="absolute -top-1 left-0.5 bg-slate-800 text-amber-300 text-[8px] font-mono font-bold px-1 rounded border border-slate-700">2/E</span>
              <div id="cd-skill2" class="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-sm font-black text-amber-300 font-mono hidden"></div>
            </button>
            <button id="upgrade-skill2" class="hidden mt-0.5 w-5 h-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[9px] font-black rounded flex items-center justify-center shadow">+</button>
          </div>

          <!-- Ultimate Skill 3 -->
          <div class="relative flex flex-col items-center">
            <button id="slot-skill3" class="skill-btn relative w-14 h-14 rounded-2xl bg-slate-900 border-2 border-amber-500/80 hover:border-amber-400 flex flex-col items-center justify-center overflow-hidden transition-all group shadow-inner" title="Ultimate [3 / R]">
              <span class="text-rose-400">${getMobaIcon('skill3', 22)}</span>
              <span class="absolute -top-1 left-0.5 bg-amber-500 text-slate-950 text-[8px] font-mono font-black px-1.5 rounded">3/R</span>
              <div id="cd-skill3" class="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-sm font-black text-amber-300 font-mono hidden"></div>
            </button>
            <button id="upgrade-skill3" class="hidden mt-0.5 w-5 h-4 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[9px] font-black rounded flex items-center justify-center shadow">+</button>
          </div>

          <div class="w-px h-8 bg-slate-800 mx-0.5"></div>

          <!-- Battle Spell -->
          <button id="slot-spell" class="skill-btn relative w-11 h-11 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-sky-400 flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner" title="Battle Spell [4 / F]">
            <span id="spell-icon" class="text-sky-300">${getMobaIcon('spark', 18)}</span>
            <span class="absolute -top-1 left-0.5 bg-slate-800 text-sky-300 text-[8px] font-mono font-bold px-1 rounded border border-slate-700">4/F</span>
            <div id="cd-spell" class="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-xs font-black text-sky-300 font-mono hidden"></div>
          </button>

          <!-- Regen Spell -->
          <button id="slot-regen" class="skill-btn relative w-11 h-11 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-emerald-400 flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner" title="HP Regen [5 / G]">
            <span class="text-emerald-400">${getMobaIcon('potion', 18)}</span>
            <span class="absolute -top-1 left-0.5 bg-slate-800 text-emerald-300 text-[8px] font-mono font-bold px-1 rounded border border-slate-700">5/G</span>
            <div id="cd-regen" class="absolute inset-0 bg-slate-950/85 flex items-center justify-center text-xs font-black text-emerald-300 font-mono hidden"></div>
          </button>

          <!-- Recall Spell -->
          <button id="slot-recall" class="skill-btn relative w-11 h-11 rounded-2xl bg-slate-900 border-2 border-slate-700 hover:border-indigo-400 flex flex-col items-center justify-center overflow-hidden transition-all shadow-inner" title="Recall ke Fountain [B]">
            <span class="text-indigo-400">${getMobaIcon('recall', 18)}</span>
            <span class="absolute -top-1 left-0.5 bg-slate-800 text-indigo-300 text-[8px] font-mono font-bold px-1 rounded border border-slate-700">B</span>
          </button>
        </div>
      </div>

      <!-- Bottom Left: Tactical Combat Chat Log -->
      <div class="pointer-events-none absolute bottom-4 left-3 w-80 max-h-36 overflow-hidden flex flex-col justify-end gap-1 z-20">
        <div id="moba-chat-feed" class="flex flex-col gap-1 text-[11px] font-medium leading-tight"></div>
      </div>

      <!-- Center Big Announcement Banner -->
      <div id="announcement-banner" class="pointer-events-none absolute top-28 left-1/2 -translate-x-1/2 flex flex-col items-center z-40 transition-all duration-300 opacity-0 scale-90">
        <div class="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-slate-950 font-black text-2xl md:text-3xl px-8 py-2.5 rounded-full shadow-2xl border-2 border-amber-300 tracking-wider text-center drop-shadow">
          <span id="announcement-title">FIRST BLOOD</span>
        </div>
        <span id="announcement-sub" class="text-xs font-bold text-amber-200 mt-1 bg-slate-950/80 px-4 py-0.5 rounded-full drop-shadow"></span>
      </div>

      <!-- MODAL: Equipment Shop -->
      <div id="modal-shop" class="pointer-events-auto absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 hidden">
        <div class="bg-slate-900 border border-slate-700 rounded-3xl w-11/12 max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div class="flex items-center gap-3">
              <span class="text-amber-400">${getMobaIcon('shop', 24)}</span>
              <div>
                <h2 class="text-lg font-bold text-white">Toko Peralatan (Item Shop)</h2>
                <span class="text-xs text-amber-400 font-mono font-bold flex items-center gap-1">Gold Anda: ${getMobaIcon('coin', 12, 'text-amber-400')} <span id="shop-player-gold">0</span></span>
              </div>
            </div>
            <button id="close-shop-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center">✕</button>
          </div>

          <!-- Category Tabs -->
          <div class="flex items-center gap-2 p-3 px-6 bg-slate-950/40 border-b border-slate-800">
            <button class="shop-tab px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950" data-cat="all">Semua</button>
            <button class="shop-tab px-4 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800" data-cat="attack">Physical</button>
            <button class="shop-tab px-4 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800" data-cat="magic">Magic</button>
            <button class="shop-tab px-4 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800" data-cat="defense">Defense</button>
            <button class="shop-tab px-4 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:bg-slate-800" data-cat="movement">Movement</button>
          </div>

          <!-- Items Grid -->
          <div id="shop-items-grid" class="p-6 grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto max-h-[50vh]"></div>

          <!-- Player Inventory Footer -->
          <div class="p-4 px-6 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-400 font-bold">Item Terpasang (Max 6):</span>
              <div id="shop-inventory-slots" class="flex items-center gap-1.5"></div>
            </div>
            <button id="close-shop-footer-btn" class="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">Tutup</button>
          </div>
        </div>
      </div>

      <!-- MODAL: Scoreboard (TAB) -->
      <div id="modal-scoreboard" class="pointer-events-auto absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 hidden">
        <div class="bg-slate-900 border border-slate-700 rounded-3xl w-11/12 max-w-4xl max-h-[85vh] flex flex-col shadow-2xl p-6 overflow-hidden">
          <div class="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 class="text-lg font-black text-white tracking-wide">PAPAN SKOR PERTANDINGAN (5 VS 5)</h2>
            <button id="close-score-btn" class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center justify-center">✕</button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 overflow-y-auto">
            <!-- Blue Team List -->
            <div class="bg-slate-950/70 border border-sky-500/30 rounded-2xl p-4 flex flex-col gap-2">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800 text-sky-400 font-bold text-sm">
                <span>TIM BIRU (ALLIES)</span>
                <span id="tab-score-blue">0 Kills</span>
              </div>
              <div id="tab-list-blue" class="flex flex-col gap-2"></div>
            </div>

            <!-- Red Team List -->
            <div class="bg-slate-950/70 border border-rose-500/30 rounded-2xl p-4 flex flex-col gap-2">
              <div class="flex items-center justify-between pb-2 border-b border-slate-800 text-rose-400 font-bold text-sm">
                <span>TIM MERAH (ENEMIES)</span>
                <span id="tab-score-red">0 Kills</span>
              </div>
              <div id="tab-list-red" class="flex flex-col gap-2"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL: Game Over Screen (Victory / Defeat) -->
      <div id="modal-gameover" class="pointer-events-auto absolute inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center z-50 hidden">
        <div class="bg-slate-900 border border-slate-700 rounded-3xl w-11/12 max-w-xl p-8 flex flex-col items-center text-center shadow-2xl">
          <div id="gameover-title-badge" class="px-8 py-3 rounded-full text-3xl font-black tracking-widest uppercase mb-4 shadow-2xl">
            VICTORY
          </div>
          <p id="gameover-desc" class="text-sm text-slate-300 mb-6 font-medium">Crystal Nexus musuh telah berhasil dihancurkan!</p>

          <div class="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-3 text-center">
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">K / D / A</span>
              <span id="gameover-kda" class="text-base font-black text-amber-400 font-mono">0 / 0 / 0</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Total Gold</span>
              <span id="gameover-gold" class="text-base font-black text-amber-300 font-mono">0</span>
            </div>
            <div>
              <span class="text-[10px] text-slate-400 font-bold uppercase block">Durasi</span>
              <span id="gameover-time" class="text-base font-black text-white font-mono">00:00</span>
            </div>
          </div>

          <div class="flex items-center gap-3 w-full justify-center">
            <button id="btn-play-again" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg hover:scale-105 flex items-center gap-2">
              ${getMobaIcon('swords_cross', 16)} <span>Main Lagi</span>
            </button>
            <button id="btn-gameover-home" class="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-2">
              ${getMobaIcon('home', 16)} <span>Kembali ke Beranda</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Menu / Beranda button
    document.getElementById('moba-menu-btn').addEventListener('click', () => {
      window.navigateTo('/beranda');
    });

    // Scoreboard TAB button
    document.getElementById('btn-toggle-scoreboard').addEventListener('click', () => {
      this.toggleModal('scoreboard');
    });
    document.getElementById('close-score-btn').addEventListener('click', () => {
      this.toggleModal(null);
    });

    // Shop buttons
    document.getElementById('btn-open-shop').addEventListener('click', () => {
      this.toggleModal('shop');
    });
    document.getElementById('close-shop-btn').addEventListener('click', () => {
      this.toggleModal(null);
    });
    document.getElementById('close-shop-footer-btn').addEventListener('click', () => {
      this.toggleModal(null);
    });

    // Quick-buy click
    document.getElementById('quick-buy-box').addEventListener('click', () => {
      this.handleQuickBuy();
    });

    // Shop Category Tabs
    const tabs = this.container.querySelectorAll('.shop-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('bg-amber-500', 'text-slate-950');
          t.classList.add('text-slate-300');
        });
        tab.classList.add('bg-amber-500', 'text-slate-950');
        tab.classList.remove('text-slate-300');
        this.renderShopItems(tab.dataset.cat);
      });
    });

    // Ping buttons
    this.container.querySelectorAll('.ping-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pingType = btn.dataset.ping;
        this.engine.triggerPlayerPing(pingType);
      });
    });

    // Skill Hotbar clicks
    document.getElementById('slot-skill1').addEventListener('click', () => {
      this.engine.castPlayerSkill(1);
    });
    document.getElementById('slot-skill2').addEventListener('click', () => {
      this.engine.castPlayerSkill(2);
    });
    document.getElementById('slot-skill3').addEventListener('click', () => {
      this.engine.castPlayerSkill(3);
    });
    document.getElementById('slot-spell').addEventListener('click', () => {
      this.engine.castPlayerSkill(4);
    });
    document.getElementById('slot-regen').addEventListener('click', () => {
      this.engine.castPlayerRegen();
    });
    document.getElementById('slot-recall').addEventListener('click', () => {
      this.engine.castPlayerRecall();
    });

    // Skill Upgrade '+' Buttons
    document.getElementById('upgrade-skill1').addEventListener('click', (e) => {
      e.stopPropagation();
      this.engine.playerHero.skill1Level++;
      this.engine.sound.playLevelUp();
    });
    document.getElementById('upgrade-skill2').addEventListener('click', (e) => {
      e.stopPropagation();
      this.engine.playerHero.skill2Level++;
      this.engine.sound.playLevelUp();
    });
    document.getElementById('upgrade-skill3').addEventListener('click', (e) => {
      e.stopPropagation();
      this.engine.playerHero.ultLevel++;
      this.engine.sound.playLevelUp();
    });

    // Game Over buttons
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.engine.restartMatch();
    });
    document.getElementById('btn-gameover-home').addEventListener('click', () => {
      window.navigateTo('/beranda');
    });

    // Render initial shop items
    this.renderShopItems('all');
  }

  toggleModal(name) {
    this.activeModal = this.activeModal === name ? null : name;

    const shopModal = document.getElementById('modal-shop');
    const scoreModal = document.getElementById('modal-scoreboard');

    shopModal.classList.toggle('hidden', this.activeModal !== 'shop');
    scoreModal.classList.toggle('hidden', this.activeModal !== 'scoreboard');

    if (this.activeModal === 'shop') {
      this.updateShopUI();
    } else if (this.activeModal === 'scoreboard') {
      this.updateScoreboardUI();
    }
  }

  updateHUD() {
    const engine = this.engine;
    const p = engine.playerHero;
    if (!p) return;

    // 1. Scoreboard & Clock
    document.getElementById('score-blue').textContent = engine.teamKills.blue;
    document.getElementById('score-red').textContent = engine.teamKills.red;

    const mins = Math.floor(engine.gameTime / 60).toString().padStart(2, '0');
    const secs = Math.floor(engine.gameTime % 60).toString().padStart(2, '0');
    document.getElementById('match-timer').textContent = `${mins}:${secs}`;

    // 2. Player Top Stats
    document.getElementById('player-hud-avatar').textContent = p.name.charAt(0);
    document.getElementById('player-hud-lvl').textContent = p.level;
    document.getElementById('player-hud-name').textContent = p.name;
    document.getElementById('player-hud-kda').textContent = `${p.kills} / ${p.deaths} / ${p.assists}`;
    document.getElementById('player-hud-gold').textContent = Math.floor(p.gold);

    // 3. Health & Mana Gauges
    const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
    document.getElementById('hud-hp-bar').style.width = `${hpPct}%`;
    document.getElementById('hud-hp-numbers').textContent = `${Math.floor(p.hp)} / ${Math.floor(p.maxHp)}`;

    const manaPct = p.maxMana > 0 ? Math.max(0, Math.min(100, (p.mana / p.maxMana) * 100)) : 100;
    document.getElementById('hud-mana-bar').style.width = `${manaPct}%`;
    document.getElementById('hud-mana-numbers').textContent = p.maxMana > 0 ? `${Math.floor(p.mana)} / ${Math.floor(p.maxMana)}` : 'ENERGY';

    // 4. Cooldown Overlays
    this._updateCdOverlay('cd-skill1', p.skill1Cd);
    this._updateCdOverlay('cd-skill2', p.skill2Cd, p.skill2Level === 0 ? 'LOCK' : null);
    this._updateCdOverlay('cd-skill3', p.ultCd, p.ultLevel === 0 ? 'LOCK' : null);
    this._updateCdOverlay('cd-spell', p.spellCooldown);
    this._updateCdOverlay('cd-regen', p.regenCooldown);

    // 5. Upgrade '+' buttons
    const unspentPoints = p.level - (p.skill1Level + p.skill2Level + p.ultLevel);
    document.getElementById('upgrade-skill1').classList.toggle('hidden', unspentPoints <= 0 || p.skill1Level >= 6);
    document.getElementById('upgrade-skill2').classList.toggle('hidden', unspentPoints <= 0 || p.skill2Level >= 6 || p.level < 2);
    document.getElementById('upgrade-skill3').classList.toggle('hidden', unspentPoints <= 0 || p.ultLevel >= 3 || p.level < 4);

    // 6. Quick-Buy Slot Check
    this.updateQuickBuy();
  }

  _updateCdOverlay(elementId, cd, customText = null) {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (customText) {
      el.classList.remove('hidden');
      el.textContent = customText;
    } else if (cd > 0) {
      el.classList.remove('hidden');
      el.textContent = Math.ceil(cd);
    } else {
      el.classList.add('hidden');
    }
  }

  updateQuickBuy() {
    const p = this.engine.playerHero;
    const qbBox = document.getElementById('quick-buy-box');
    if (!p || p.items.length >= 6) {
      qbBox.classList.add('hidden');
      return;
    }

    const nextRecId = p.data.recommendedItems[p.items.length];
    const itemData = this.engine.allItemsMap[nextRecId];

    if (itemData && p.gold >= itemData.cost) {
      qbBox.classList.remove('hidden');
      document.getElementById('qb-icon').textContent = itemData.icon;
      document.getElementById('qb-name').textContent = itemData.name;
      document.getElementById('qb-cost').textContent = `🪙 ${itemData.cost}`;
      this.currentQuickBuyItem = itemData;
    } else {
      qbBox.classList.add('hidden');
      this.currentQuickBuyItem = null;
    }
  }

  handleQuickBuy() {
    if (this.currentQuickBuyItem) {
      this.engine.playerHero.buyItem(this.currentQuickBuyItem, this.engine);
      this.updateQuickBuy();
    }
  }

  renderShopItems(category = 'all') {
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    const filtered = category === 'all'
      ? ITEMS_DATA
      : ITEMS_DATA.filter(it => it.category === category);

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'bg-slate-950/80 border border-slate-800 hover:border-amber-400/80 rounded-2xl p-3 flex items-center justify-between gap-3 transition-all';
      card.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl shrink-0 border border-slate-700">
            ${item.icon}
          </div>
          <div class="min-w-0">
            <span class="font-bold text-xs text-white block truncate">${item.name}</span>
            <span class="text-[10px] text-amber-300 font-mono font-bold flex items-center gap-1">${getMobaIcon('coin', 11, 'text-amber-400')} ${item.cost}</span>
            <span class="text-[9px] text-slate-400 block line-clamp-1">${item.desc}</span>
          </div>
        </div>
        <button class="buy-item-btn px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shrink-0 transition-transform hover:scale-105" data-id="${item.id}">
          Beli
        </button>
      `;

      card.querySelector('.buy-item-btn').addEventListener('click', () => {
        const p = this.engine.playerHero;
        if (p.buyItem(item, this.engine)) {
          this.updateShopUI();
        } else {
          this.engine.addLog('Gold tidak cukup atau inventaris penuh!', '#ef4444');
        }
      });

      grid.appendChild(card);
    });
  }

  updateShopUI() {
    const p = this.engine.playerHero;
    document.getElementById('shop-player-gold').textContent = Math.floor(p.gold);

    const slotsContainer = document.getElementById('shop-inventory-slots');
    slotsContainer.innerHTML = '';

    for (let i = 0; i < 6; i++) {
      const it = p.items[i];
      const slot = document.createElement('div');
      slot.className = 'w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-sm shadow-inner';
      if (it) {
        slot.textContent = it.icon;
        slot.title = it.name;
      }
      slotsContainer.appendChild(slot);
    }
  }

  updateScoreboardUI() {
    const engine = this.engine;
    document.getElementById('tab-score-blue').textContent = `${engine.teamKills.blue} Kills`;
    document.getElementById('tab-score-red').textContent = `${engine.teamKills.red} Kills`;

    const blueList = document.getElementById('tab-list-blue');
    const redList = document.getElementById('tab-list-red');
    blueList.innerHTML = '';
    redList.innerHTML = '';

    engine.heroes.forEach(h => {
      const row = document.createElement('div');
      row.className = `flex items-center justify-between p-2 rounded-xl ${h.isPlayer ? 'bg-amber-500/10 border border-amber-500/40' : 'bg-slate-900/60'}`;

      const roleBadge = ROLE_LABELS[h.role] ? ROLE_LABELS[h.role].name : h.role;

      row.innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
            ${h.name.charAt(0)}
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-white">${h.name}</span>
              <span class="text-[9px] bg-slate-800 text-slate-300 px-1 py-0.2 rounded">${roleBadge}</span>
            </div>
            <span class="text-[9px] text-slate-400">Lv.${h.level}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-mono font-bold text-slate-200">${h.kills}/${h.deaths}/${h.assists}</span>
          <span class="text-xs font-mono font-bold text-amber-400">🪙${Math.floor(h.gold)}</span>
        </div>
      `;

      if (h.team === 'blue') blueList.appendChild(row);
      else redList.appendChild(row);
    });
  }

  showAnnouncement(title, subtitle = '', color = 'from-amber-600 to-rose-600') {
    const banner = document.getElementById('announcement-banner');
    document.getElementById('announcement-title').textContent = title;
    document.getElementById('announcement-sub').textContent = subtitle;

    banner.classList.remove('opacity-0', 'scale-90');
    banner.classList.add('opacity-100', 'scale-100');

    clearTimeout(this._announceTimeout);
    this._announceTimeout = setTimeout(() => {
      banner.classList.remove('opacity-100', 'scale-100');
      banner.classList.add('opacity-0', 'scale-90');
    }, 2800);
  }

  addCombatChat(text, color = '#f1f5f9') {
    const feed = document.getElementById('moba-chat-feed');
    if (!feed) return;

    const line = document.createElement('div');
    line.className = 'bg-slate-950/80 px-2 py-1 rounded border-l-2 shadow backdrop-blur-sm';
    line.style.borderColor = color;
    line.style.color = color;
    line.textContent = text;

    feed.appendChild(line);
    if (feed.children.length > 5) {
      feed.removeChild(feed.firstChild);
    }
  }

  showGameOver(winningTeam) {
    const modal = document.getElementById('modal-gameover');
    modal.classList.remove('hidden');

    const p = this.engine.playerHero;
    const isVictory = winningTeam === p.team;

    const badge = document.getElementById('gameover-title-badge');
    if (isVictory) {
      badge.textContent = 'VICTORY';
      badge.className = 'px-8 py-3 rounded-full text-3xl font-black tracking-widest uppercase mb-4 shadow-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 border border-amber-300';
      document.getElementById('gameover-desc').textContent = 'Selamat! Core Nexus musuh hancur berkat kerja sama tim hebat!';
    } else {
      badge.textContent = 'DEFEAT';
      badge.className = 'px-8 py-3 rounded-full text-3xl font-black tracking-widest uppercase mb-4 shadow-2xl bg-gradient-to-r from-rose-600 to-red-800 text-white border border-rose-500';
      document.getElementById('gameover-desc').textContent = 'Core Nexus tim Anda telah hancur. Evaluasi strategi dan coba lagi!';
    }

    document.getElementById('gameover-kda').textContent = `${p.kills} / ${p.deaths} / ${p.assists}`;
    document.getElementById('gameover-gold').textContent = Math.floor(p.totalGoldEarned);

    const mins = Math.floor(this.engine.gameTime / 60).toString().padStart(2, '0');
    const secs = Math.floor(this.engine.gameTime % 60).toString().padStart(2, '0');
    document.getElementById('gameover-time').textContent = `${mins}:${secs}`;
  }
}
