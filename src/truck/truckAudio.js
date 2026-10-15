/**
 * Truck Simulator: Mud & Cargo - Web Audio API Procedural Heavy Diesel Synthesizer (0 KB)
 * Dynamic engine idle rumble, turbo spool, air brake hiss, and pneumatic truck horn.
 */

export class TruckAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.turboOsc = null;
    this.turboGain = null;
    this.isEngineRunning = false;
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

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    return this.muted;
  }

  startEngine() {
    if (this.isEngineRunning) return;
    this.init();
    if (!this.ctx) return;

    try {
      // 1. Diesel Cylinder Pulse Oscillator
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineFilter = this.ctx.createBiquadFilter();

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(32, this.ctx.currentTime); // Low 32Hz idle rumble

      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(this.muted ? 0 : 0.08, this.ctx.currentTime);

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();

      // 2. High-Pitched Turbo Whistle
      this.turboOsc = this.ctx.createOscillator();
      this.turboGain = this.ctx.createGain();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(2200, this.ctx.currentTime);
      this.turboGain.gain.setValueAtTime(0, this.ctx.currentTime);

      this.turboOsc.connect(this.turboGain);
      this.turboGain.connect(this.ctx.destination);
      this.turboOsc.start();

      this.isEngineRunning = true;
    } catch (_) {}
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      }
      if (this.turboOsc) {
        this.turboOsc.stop();
        this.turboOsc.disconnect();
      }
    } catch (_) {}
    this.isEngineRunning = false;
  }

  updateEngine(rpm, throttle) {
    if (!this.isEngineRunning || !this.ctx || this.muted) return;

    const clampedRpm = Math.max(700, Math.min(3200, rpm));
    const now = this.ctx.currentTime;

    // Diesel fundamental frequency maps from 28Hz (idle) to 90Hz (redline)
    const engineFreq = 26 + (clampedRpm / 3200) * 65;
    this.engineOsc.frequency.setTargetAtTime(engineFreq, now, 0.04);

    const filterFreq = 120 + (clampedRpm / 3200) * 380 + Math.abs(throttle) * 200;
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.04);

    const vol = 0.06 + Math.abs(throttle) * 0.08;
    this.engineGain.gain.setTargetAtTime(vol, now, 0.05);

    // Turbo whistle increases with throttle & high RPM
    if (this.turboGain && this.turboOsc) {
      const turboIntensity = Math.max(0, Math.min(1, (clampedRpm - 1400) / 1600)) * Math.abs(throttle);
      this.turboOsc.frequency.setTargetAtTime(1800 + turboIntensity * 1600, now, 0.08);
      this.turboGain.gain.setTargetAtTime(turboIntensity * 0.025, now, 0.08);
    }
  }

  playAirBrake() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(now);
    } catch (_) {}
  }

  playGearShift() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  playHorn() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Pneumatic Dual-Tone Train/Truck Horn (F# & A#)
      [185.0, 233.08].forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.45);
      });
    } catch (_) {}
  }
}
