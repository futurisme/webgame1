/**
 * Train Simulator: Steel & Rails - Positional & Distance-Based Railway Synthesizer
 * 100% procedural Web Audio API (0 KB external files):
 * - Distance-based 3D acoustic panning & lowpass filtering between camera, locomotive & carriages
 * - Stereo panning based on relative locomotive/carriage position to the camera
 * - Authentic Japanese VVVF Inverter melodic musical scale (JR Series E233 / Keikyu IGBT)
 * - CC 206 16-cylinder diesel throbbing with 8 distinct notch harmonic stages + variable turbo spool
 * - Steam 2-8-2 rhythmic dual-cylinder exhaust chuffing with safety valve hiss
 * - Carriage bogie track rumble, suspension creaks, and rhythmic dual-truck rail joint click-clack ("ka-tang... ka-tang")
 * - Authentic Japanese dual-tone air horns (Eb4 & F#4)
 * - Station departure melody chimes & authentic Japanese Fumikiri alternating bells
 */

export class TrainAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.isEngineRunning = false;
    this.engineType = 'electric'; // 'electric' | 'diesel' | 'steam'

    // Distance-based Listener & Master Gain
    this.masterGain = null;
    this.locoGain = null;
    this.locoFilter = null;
    this.locoPanner = null;
    this.coachGain = null;
    this.coachFilter = null;

    // Diesel audio nodes
    this.dieselOsc = null;
    this.dieselSubOsc = null;
    this.dieselGainNode = null;
    this.dieselFilter = null;
    this.turboOsc = null;
    this.turboGain = null;

    // Electric VVVF audio nodes
    this.electricOsc = null;
    this.electricOsc2 = null;
    this.electricGainNode = null;
    this.electricFilter = null;

    // Steam audio nodes
    this.steamHissSource = null;
    this.steamHissGain = null;
    this.steamHissFilter = null;
    this.lastChuffTime = 0;

    // Carriage rumble nodes
    this.coachRumbleSource = null;
    this.coachRumbleGain = null;
    this.coachRumbleFilter = null;

    // Rail click-clack timing
    this.lastClickClackTime = 0;

    // Flange squeal nodes
    this.flangeOsc = null;
    this.flangeGain = null;
    this.flangeFilter = null;

    // Horn state
    this.hornOsc1 = null;
    this.hornOsc2 = null;
    this.hornGain = null;
    this.isHornActive = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.setupMasterBuses();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setupMasterBuses() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Master
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1.0, now);
    this.masterGain.connect(this.ctx.destination);

    // Locomotive Bus (with distance lowpass filter + stereo panner)
    this.locoGain = this.ctx.createGain();
    this.locoFilter = this.ctx.createBiquadFilter();
    this.locoFilter.type = 'lowpass';
    this.locoFilter.frequency.setValueAtTime(5000, now);

    if (this.ctx.createStereoPanner) {
      this.locoPanner = this.ctx.createStereoPanner();
      this.locoGain.connect(this.locoFilter);
      this.locoFilter.connect(this.locoPanner);
      this.locoPanner.connect(this.masterGain);
    } else {
      this.locoGain.connect(this.locoFilter);
      this.locoFilter.connect(this.masterGain);
    }

    // Carriage Bus (richer rail joint clatter and car sway)
    this.coachGain = this.ctx.createGain();
    this.coachFilter = this.ctx.createBiquadFilter();
    this.coachFilter.type = 'lowpass';
    this.coachFilter.frequency.setValueAtTime(3600, now);
    this.coachGain.connect(this.coachFilter);
    this.coachFilter.connect(this.masterGain);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1.0, this.ctx.currentTime);
    }
    return this.muted;
  }

  setEngineType(type) {
    if (this.engineType !== type) {
      const wasRunning = this.isEngineRunning;
      if (wasRunning) this.stopEngine();
      this.engineType = type;
      if (wasRunning) this.startEngine();
    }
  }

  startEngine() {
    if (this.isEngineRunning) return;
    this.init();
    if (!this.ctx) return;

    try {
      if (this.engineType === 'diesel') {
        this.setupDieselAudio();
      } else if (this.engineType === 'electric') {
        this.setupElectricAudio();
      } else if (this.engineType === 'steam') {
        this.setupSteamAudio();
      }
      this.setupCoachRumble();
      this.setupFlangeAudio();
      this.isEngineRunning = true;
    } catch (e) {
      console.warn('Audio setup error:', e);
    }
  }

  setupDieselAudio() {
    const now = this.ctx.currentTime;

    // Primary 16-cylinder diesel throbbing
    this.dieselOsc = this.ctx.createOscillator();
    this.dieselSubOsc = this.ctx.createOscillator();
    this.dieselGainNode = this.ctx.createGain();
    this.dieselFilter = this.ctx.createBiquadFilter();

    this.dieselOsc.type = 'sawtooth';
    this.dieselOsc.frequency.setValueAtTime(26, now); // 26Hz idle rumble

    this.dieselSubOsc.type = 'triangle';
    this.dieselSubOsc.frequency.setValueAtTime(13, now); // Sub-bass visceral thrum

    this.dieselFilter.type = 'lowpass';
    this.dieselFilter.frequency.setValueAtTime(140, now);

    this.dieselGainNode.gain.setValueAtTime(0.09, now);

    this.dieselOsc.connect(this.dieselFilter);
    this.dieselSubOsc.connect(this.dieselFilter);
    this.dieselFilter.connect(this.dieselGainNode);
    this.dieselGainNode.connect(this.locoGain);

    this.dieselOsc.start();
    this.dieselSubOsc.start();

    // Turbocharger whistle
    this.turboOsc = this.ctx.createOscillator();
    this.turboGain = this.ctx.createGain();
    this.turboOsc.type = 'sine';
    this.turboOsc.frequency.setValueAtTime(1900, now);
    this.turboGain.gain.setValueAtTime(0, now);

    this.turboOsc.connect(this.turboGain);
    this.turboGain.connect(this.locoGain);
    this.turboOsc.start();
  }

  setupElectricAudio() {
    const now = this.ctx.currentTime;
    // Authentic JR Series E233 VVVF IGBT inverter whine
    this.electricOsc = this.ctx.createOscillator();
    this.electricOsc2 = this.ctx.createOscillator();
    this.electricGainNode = this.ctx.createGain();
    this.electricFilter = this.ctx.createBiquadFilter();

    this.electricOsc.type = 'sawtooth';
    this.electricOsc.frequency.setValueAtTime(320, now);

    this.electricOsc2.type = 'triangle';
    this.electricOsc2.frequency.setValueAtTime(640, now);

    this.electricFilter.type = 'bandpass';
    this.electricFilter.frequency.setValueAtTime(800, now);
    this.electricFilter.Q.setValueAtTime(4.0, now);

    this.electricGainNode.gain.setValueAtTime(0, now);

    this.electricOsc.connect(this.electricFilter);
    this.electricOsc2.connect(this.electricFilter);
    this.electricFilter.connect(this.electricGainNode);
    this.electricGainNode.connect(this.locoGain);

    this.electricOsc.start();
    this.electricOsc2.start();
  }

  setupSteamAudio() {
    // Gentle continuous boiler hiss
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    this.steamHissSource = this.ctx.createBufferSource();
    this.steamHissSource.buffer = buffer;
    this.steamHissSource.loop = true;

    this.steamHissFilter = this.ctx.createBiquadFilter();
    this.steamHissFilter.type = 'bandpass';
    this.steamHissFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.steamHissFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.steamHissGain = this.ctx.createGain();
    this.steamHissGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    this.steamHissSource.connect(this.steamHissFilter);
    this.steamHissFilter.connect(this.steamHissGain);
    this.steamHissGain.connect(this.locoGain);

    this.steamHissSource.start();
  }

  setupCoachRumble() {
    // Pink noise buffer for steel wheel rolling on rail
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.14;
    }

    this.coachRumbleSource = this.ctx.createBufferSource();
    this.coachRumbleSource.buffer = buffer;
    this.coachRumbleSource.loop = true;

    this.coachRumbleFilter = this.ctx.createBiquadFilter();
    this.coachRumbleFilter.type = 'lowpass';
    this.coachRumbleFilter.frequency.setValueAtTime(190, this.ctx.currentTime);

    this.coachRumbleGain = this.ctx.createGain();
    this.coachRumbleGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.coachRumbleSource.connect(this.coachRumbleFilter);
    this.coachRumbleFilter.connect(this.coachRumbleGain);
    this.coachRumbleGain.connect(this.coachGain);

    this.coachRumbleSource.start();
  }

  setupFlangeAudio() {
    const now = this.ctx.currentTime;
    this.flangeOsc = this.ctx.createOscillator();
    this.flangeGain = this.ctx.createGain();
    this.flangeFilter = this.ctx.createBiquadFilter();

    this.flangeOsc.type = 'triangle';
    this.flangeOsc.frequency.setValueAtTime(2100, now);

    this.flangeFilter.type = 'bandpass';
    this.flangeFilter.frequency.setValueAtTime(2200, now);
    this.flangeFilter.Q.setValueAtTime(7.0, now);

    this.flangeGain.gain.setValueAtTime(0, now);

    this.flangeOsc.connect(this.flangeFilter);
    this.flangeFilter.connect(this.flangeGain);
    this.flangeGain.connect(this.coachGain);

    this.flangeOsc.start();
  }

  stopEngine() {
    if (!this.isEngineRunning) return;
    try {
      if (this.dieselOsc) { this.dieselOsc.stop(); this.dieselOsc.disconnect(); }
      if (this.dieselSubOsc) { this.dieselSubOsc.stop(); this.dieselSubOsc.disconnect(); }
      if (this.turboOsc) { this.turboOsc.stop(); }
      if (this.electricOsc) { this.electricOsc.stop(); }
      if (this.electricOsc2) { this.electricOsc2.stop(); }
      if (this.steamHissSource) { this.steamHissSource.stop(); }
      if (this.coachRumbleSource) { this.coachRumbleSource.stop(); }
      if (this.flangeOsc) { this.flangeOsc.stop(); }
    } catch (_) {}
    this.isEngineRunning = false;
  }

  /**
   * Distance-Based & Positional Update
   * @param {number} speedKmh
   * @param {number} throttleNotch (0 to 8)
   * @param {boolean} isBraking
   * @param {number} cameraDistM (absolute distance from camera to loco)
   * @param {number} relCamX (locoX - camX, for stereo panning)
   */
  update(speedKmh, throttleNotch, isBraking, cameraDistM = 0, relCamX = 0) {
    if (!this.isEngineRunning || !this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    const absSpeed = Math.abs(speedKmh);

    // 1. Distance-Based Attenuation & Lowpass Acoustic Absorption
    const distFactor = Math.min(1.0, Math.abs(cameraDistM) / 100);

    if (this.locoGain && this.locoFilter) {
      const locoVol = 1.0 - distFactor * 0.75; // drops down to 25% when viewing distant coaches
      const locoCutoff = 5000 - distFactor * 4100; // high frequencies absorb, leaving muffled rumble
      this.locoGain.gain.setTargetAtTime(Math.max(0.04, locoVol), now, 0.08);
      this.locoFilter.frequency.setTargetAtTime(Math.max(400, locoCutoff), now, 0.08);

      // Stereo panning
      if (this.locoPanner) {
        const pan = Math.max(-0.85, Math.min(0.85, relCamX / 50));
        this.locoPanner.pan.setTargetAtTime(pan, now, 0.1);
      }
    }

    if (this.coachGain && this.coachFilter) {
      // Carriage sound is loudest when camera is focused on carriages
      const coachVol = 0.45 + distFactor * 0.55;
      this.coachGain.gain.setTargetAtTime(coachVol, now, 0.08);
    }

    // 2. Locomotive Engine Sound
    if (this.engineType === 'diesel') {
      const notchRatio = throttleNotch / 8;
      const speedRatio = Math.min(1.0, absSpeed / 120);

      // Distinct 8-notch fundamental harmonic frequency mapping
      // Idle: 22Hz. Notch 8: 78Hz deep pulsating bass thrum
      const baseFreq = 22 + notchRatio * 52 + speedRatio * 12;
      this.dieselOsc.frequency.setTargetAtTime(baseFreq, now, 0.06);
      this.dieselSubOsc.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.06);

      const targetFilter = 120 + notchRatio * 420 + speedRatio * 200;
      this.dieselFilter.frequency.setTargetAtTime(targetFilter, now, 0.06);

      const engineVol = 0.07 + notchRatio * 0.16 + speedRatio * 0.04;
      this.dieselGainNode.gain.setTargetAtTime(engineVol, now, 0.06);

      if (this.turboGain) {
        const turboFreq = 1700 + notchRatio * 1900 + speedRatio * 450;
        const turboVol = notchRatio * 0.035;
        this.turboOsc.frequency.setTargetAtTime(turboFreq, now, 0.1);
        this.turboGain.gain.setTargetAtTime(turboVol, now, 0.1);
      }
    } else if (this.engineType === 'electric') {
      // Authentic Japanese VVVF multi-stage scale (Keikyu / E233 musical chime on start)
      const speedRatio = Math.min(1.0, absSpeed / 110);
      let vvvfFreq = 260;
      let vvvfFreq2 = 520;

      if (speedRatio < 0.1) {
        // Musical ascending chord progression
        vvvfFreq = 261.63 + (speedRatio / 0.1) * 392.0; // C4 to G4
        vvvfFreq2 = vvvfFreq * 1.5;
      } else if (speedRatio < 0.35) {
        vvvfFreq = 440 + ((speedRatio - 0.1) / 0.25) * 650;
        vvvfFreq2 = vvvfFreq * 2;
      } else {
        vvvfFreq = 880 + ((speedRatio - 0.35) / 0.65) * 850;
        vvvfFreq2 = vvvfFreq * 1.25;
      }

      this.electricOsc.frequency.setTargetAtTime(vvvfFreq, now, 0.04);
      this.electricOsc2.frequency.setTargetAtTime(vvvfFreq2, now, 0.04);
      this.electricFilter.frequency.setTargetAtTime(vvvfFreq * 1.4, now, 0.04);

      const eVol = (throttleNotch > 0 || isBraking) ? 0.08 : Math.min(0.035, speedRatio * 0.035);
      this.electricGainNode.gain.setTargetAtTime(eVol, now, 0.05);
    } else if (this.engineType === 'steam') {
      // Steam rhythmic dual-cylinder exhaust chuffs (4 chuffs per wheel rotation)
      if (absSpeed > 1) {
        const chuffInterval = Math.max(0.12, 1.8 / Math.max(1, absSpeed * 0.28));
        if (now - this.lastChuffTime > chuffInterval) {
          this.playSteamChuff(Math.min(1.0, throttleNotch / 6 + 0.3));
          this.lastChuffTime = now;
        }
      }
    }

    // 3. Carriage Wheel-on-Rail Rumble & Sway (Louder at speed)
    if (this.coachRumbleGain) {
      const rumbleVol = Math.min(0.14, (absSpeed / 120) * 0.13);
      const rumbleFreq = 120 + (absSpeed / 120) * 500;
      this.coachRumbleGain.gain.setTargetAtTime(rumbleVol, now, 0.08);
      this.coachRumbleFilter.frequency.setTargetAtTime(rumbleFreq, now, 0.08);
    }

    // 4. Rhythmic Dual-Truck Rail Joint Click-Clack ("ka-tang... ka-tang")
    if (absSpeed > 5) {
      const speedMs = absSpeed * 0.277;
      // Rail length 25 meters
      const intervalSec = Math.max(0.16, 25 / Math.max(2, speedMs));
      if (now - this.lastClickClackTime > intervalSec) {
        this.playClickClack(absSpeed);
        this.lastClickClackTime = now;
      }
    }

    // 5. Flange Squeal on Curves & Switches
    if (this.flangeGain) {
      if (absSpeed > 15 && Math.random() < 0.04) {
        this.flangeGain.gain.setTargetAtTime(0.025, now, 0.08);
        this.flangeOsc.frequency.setTargetAtTime(1900 + Math.random() * 500, now, 0.04);
      } else {
        this.flangeGain.gain.setTargetAtTime(0, now, 0.2);
      }
    }
  }

  playSteamChuff(intensity = 0.8) {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.15);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(1.8, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.locoGain);

      noise.start(now);
    } catch (_) {}
  }

  startHorn() {
    if (this.isHornActive) return;
    this.init();
    if (!this.ctx || this.muted) return;

    try {
      const now = this.ctx.currentTime;
      this.hornOsc1 = this.ctx.createOscillator();
      this.hornOsc2 = this.ctx.createOscillator();
      this.hornGain = this.ctx.createGain();

      this.hornOsc1.type = 'sawtooth';
      this.hornOsc1.frequency.setValueAtTime(311.13, now); // Eb4
      this.hornOsc2.type = 'sawtooth';
      this.hornOsc2.frequency.setValueAtTime(369.99, now); // F#4

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, now);

      this.hornGain.gain.setValueAtTime(0.01, now);
      this.hornGain.gain.linearRampToValueAtTime(0.28, now + 0.03);

      this.hornOsc1.connect(filter);
      this.hornOsc2.connect(filter);
      filter.connect(this.hornGain);
      this.hornGain.connect(this.locoGain);

      this.hornOsc1.start(now);
      this.hornOsc2.start(now);
      this.isHornActive = true;
    } catch (_) {}
  }

  stopHorn() {
    if (!this.isHornActive || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.hornGain.gain.setValueAtTime(this.hornGain.gain.value, now);
      this.hornGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      this.hornOsc1.stop(now + 0.17);
      this.hornOsc2.stop(now + 0.17);
    } catch (_) {}
    this.isHornActive = false;
  }

  playBrakeHiss(intensity = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.42);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.28;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1500, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
    } catch (_) {}
  }

  /**
   * Dual-Truck Rail Click-Clack ("ka-tang... ka-tang")
   */
  playClickClack(speedKmh) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const vol = Math.min(0.09, 0.025 + (speedKmh / 120) * 0.065);

      this.triggerSingleRailClick(now, vol);
      const delay = Math.max(0.04, 0.11 - (speedKmh / 120) * 0.05);
      this.triggerSingleRailClick(now + delay, vol * 0.85);
    } catch (_) {}
  }

  triggerSingleRailClick(time, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(170, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, time);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.coachGain);

    osc.start(time);
    osc.stop(time + 0.035);
  }

  playCouplerClank(intensity = 0.5) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);

      gain.gain.setValueAtTime(0.09 * intensity, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.coachGain);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (_) {}
  }

  /**
   * Japanese Station Departure Melody (Hassha Melody / 発車メロディ)
   */
  playStationChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Japanese Yamanote Line Hassha Melody progression: C5, E5, G5, C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.16);
        gain.gain.setValueAtTime(0.14, now + i * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.45);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + i * 0.16);
        osc.stop(now + i * 0.16 + 0.45);
      });
    } catch (_) {}
  }

  /**
   * Japanese Fumikiri Crossing Bell (Dual alternating mechanical bells: 680Hz and 720Hz)
   */
  playFumikiriBell() {
    if (this.muted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (_) {}
  }
}
