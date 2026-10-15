/**
 * Procedural Web Audio API Synthesizer for Dawn Arena 5v5 MOBA.
 * Duplicated and specialized from the base sound engine.
 * 100% Pure JavaScript, zero external audio assets, zero latency, ultra-low memory.
 */

class MobaSoundSystem {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterGain = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      if (!this._warned) {
        console.warn('AudioContext pending user interaction');
        this._warned = true;
      }
    }
  }

  ensureContext() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.28, this.ctx.currentTime);
    }
    return this.muted;
  }

  // --- Combat SFX ---

  // Basic Attack Slash (Melee)
  playSlash() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.1);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // Ranged Shot (Layla / Miya arrow/gun)
  playShoot() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(680, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  // Magic Spell Blast (Eudora / Kagura)
  playMagicSpell() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc2.type = 'square';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.2);
    osc2.frequency.setValueAtTime(440, t);
    osc2.frequency.exponentialRampToValueAtTime(110, t + 0.2);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.23);
    osc2.stop(t + 0.23);
  }

  // Hit Impact
  playImpact(isCrit = false) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isCrit ? 'square' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 260 : 180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + (isCrit ? 0.18 : 0.1));
    gain.gain.setValueAtTime(isCrit ? 0.45 : 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isCrit ? 0.2 : 0.11));
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.21);
  }

  // Turret Laser Shot
  playTurretFire() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.18);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Retribution Smite
  playRetribution() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Thunder rumble + lightning pop
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(740, t);
    osc1.frequency.exponentialRampToValueAtTime(60, t + 0.35);
    osc2.frequency.setValueAtTime(140, t);
    osc2.frequency.exponentialRampToValueAtTime(30, t + 0.4);
    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);
    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.45);
    osc2.stop(t + 0.45);
  }

  // Flicker / Teleport
  playFlicker() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.14);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Gold Coin Chime
  playGold() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [987, 1318].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      gain.gain.setValueAtTime(0.18, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.12);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.13);
    });
  }

  // Level Up Fanfare
  playLevelUp() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      gain.gain.setValueAtTime(0.28, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * 0.07);
      osc.stop(t + i * 0.07 + 0.28);
    });
  }

  // Ping Bell
  playPing() {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  // --- MLBB Announcer Voice & Chords ---

  playAnnounce(type) {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    switch (type) {
      case 'first_blood':
        // Dramatic low brass + high fanfare
        this._playBrassChord([185, 277, 370, 554], 0.6, 0.45);
        break;
      case 'double_kill':
        this._playArpeggio([440, 554, 659, 880], 0.06, 0.4);
        break;
      case 'triple_kill':
        this._playArpeggio([523, 659, 784, 1046], 0.05, 0.42);
        break;
      case 'maniac':
        this._playBrassChord([261, 329, 392, 523, 659], 0.8, 0.5);
        break;
      case 'savage':
        // Grand epic fanfare
        this._playEpicFanfare();
        break;
      case 'wipe_out':
        this._playBrassChord([220, 277, 330, 440], 0.7, 0.45);
        break;
      case 'enemy_slain':
      case 'you_slain':
        this._playArpeggio([392, 523, 659, 784], 0.06, 0.35);
        break;
      case 'ally_slain':
        this._playMinorChord([330, 392, 494], 0.5, 0.35);
        break;
      case 'turret_destroyed':
        this._playBrassChord([196, 247, 294, 392], 0.6, 0.4);
        break;
      case 'lord_summoned':
        // Deep dragon roar / rumbling horn
        this._playLordRoar();
        break;
      case 'turtle_slain':
        this._playArpeggio([330, 440, 554, 659], 0.07, 0.35);
        break;
      case 'victory':
        this._playVictoryTheme();
        break;
      case 'defeat':
        this._playDefeatTheme();
        break;
      default:
        this._playArpeggio([440, 554, 659], 0.08, 0.3);
    }
  }

  _playBrassChord(freqs, duration = 0.5, gainLevel = 0.35) {
    const t = this.ctx.currentTime;
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(gainLevel / freqs.length, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    });
  }

  _playMinorChord(freqs, duration = 0.6, gainLevel = 0.35) {
    const t = this.ctx.currentTime;
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(gainLevel / freqs.length, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + duration + 0.02);
    });
  }

  _playArpeggio(freqs, interval = 0.06, gainLevel = 0.35) {
    const t = this.ctx.currentTime;
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * interval);
      gain.gain.setValueAtTime(gainLevel, t + i * interval);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * interval + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + i * interval);
      osc.stop(t + i * interval + 0.28);
    });
  }

  _playEpicFanfare() {
    const t = this.ctx.currentTime;
    // Savage celebration chords
    const chord1 = [523, 659, 784, 1046];
    const chord2 = [587, 740, 880, 1174];
    const chord3 = [659, 830, 987, 1318];
    this._playBrassChord(chord1, 0.25, 0.4);
    setTimeout(() => {
      if (this.ctx) this._playBrassChord(chord2, 0.25, 0.45);
    }, 240);
    setTimeout(() => {
      if (this.ctx) this._playBrassChord(chord3, 0.9, 0.55);
    }, 480);
  }

  _playLordRoar() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.8);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.9);
  }

  _playVictoryTheme() {
    const notes = [523, 659, 784, 1046, 1318];
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (this.ctx && !this.muted) {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.4, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.65);
        }
      }, i * 140);
    });
  }

  _playDefeatTheme() {
    const notes = [440, 415, 392, 349, 329];
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (this.ctx && !this.muted) {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.3, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.55);
        }
      }, i * 160);
    });
  }
}

export const mobaSound = new MobaSoundSystem();
