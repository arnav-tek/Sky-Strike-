import { musicManager } from './MusicManager';

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;

  constructor() {
    // We don't initialize until first user interaction to satisfy browser policies
  }

  init() {
    if (this.initialized) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = 0.4; // Default volume
    
    musicManager.init(this.ctx);
    this.initialized = true;
  }

  playMenuMusic() {
    if (!this.initialized) this.init();
    musicManager.setTheme('menu');
  }

  playGameplayMusic() {
    if (!this.initialized) this.init();
    musicManager.setTheme('gameplay');
  }

  playBossMusic() {
    if (!this.initialized) this.init();
    musicManager.setTheme('boss');
  }

  stopMusic() {
    musicManager.stop();
  }

  // Helper to create a noise buffer for explosions
  private createNoiseBuffer() {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  playShoot() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playMissile() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 0.5);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.5);
  }

  playEnemyDeath(type: string) {
    if (!this.initialized) this.init();
    switch(type) {
      case 'drone': case 'jeep': this.playExplosionSmall(); break;
      case 'helicopter': case 'scout': case 'armored_car': this.playExplosionMedium(); break;
      case 'tank': case 'gunship': case 'missile_truck': this.playExplosionLarge(); break;
      case 'blackshark': this.playExplosionBoss(); break;
      default: this.playExplosionMedium(); break;
    }
  }

  playExplosionSmall() {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.3);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  playExplosionMedium() {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;
    const pitchJitter = 1.0 + (Math.random() - 0.5) * 0.1;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.frequency.exponentialRampToValueAtTime(100, time + 0.6);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 0.6);

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200 * pitchJitter, time);
    osc.frequency.exponentialRampToValueAtTime(30, time + 0.5);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.6, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.5);

    const fmOsc = this.ctx.createOscillator();
    fmOsc.type = 'square';
    fmOsc.frequency.setValueAtTime(300 * pitchJitter, time);
    fmOsc.frequency.exponentialRampToValueAtTime(50, time + 0.3);
    const fmGain = this.ctx.createGain();
    fmGain.gain.setValueAtTime(0.2, time);
    fmGain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    fmOsc.connect(fmGain);
    fmGain.connect(this.masterGain);
    fmOsc.start(time);
    fmOsc.stop(time + 0.3);
  }

  playExplosionLarge() {
    if (!this.ctx || !this.masterGain) return;
    const time = this.ctx.currentTime;
    const pitchJitter = 1.0 + (Math.random() - 0.5) * 0.15;
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, time);
    filter.frequency.exponentialRampToValueAtTime(50, time + 1.2);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 1.2);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(time);
    noise.stop(time + 1.2);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120 * pitchJitter, time);
    osc.frequency.exponentialRampToValueAtTime(20, time + 1.0);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(1.0, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 1.0);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 1.0);

    const fmOsc = this.ctx.createOscillator();
    fmOsc.type = 'sawtooth';
    fmOsc.frequency.setValueAtTime(150 * pitchJitter, time);
    fmOsc.frequency.exponentialRampToValueAtTime(30, time + 0.6);
    const fmGain = this.ctx.createGain();
    fmGain.gain.setValueAtTime(0.4, time);
    fmGain.gain.exponentialRampToValueAtTime(0.01, time + 0.6);
    fmOsc.connect(fmGain);
    fmGain.connect(this.masterGain);
    fmOsc.start(time);
    fmOsc.stop(time + 0.6);
  }

  playExplosionBoss() {
    if (!this.ctx || !this.masterGain) return;
    
    this.playExplosionLarge();
    setTimeout(() => this.playExplosionLarge(), 200);
    setTimeout(() => this.playExplosionMedium(), 400);
    setTimeout(() => this.playExplosionLarge(), 600);
    setTimeout(() => this.playExplosionMedium(), 800);
    setTimeout(() => {
        this.playExplosionLarge();
        const osc = this.ctx!.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(50, this.ctx!.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx!.currentTime + 2.0);
        const oscGain = this.ctx!.createGain();
        oscGain.gain.setValueAtTime(0.8, this.ctx!.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 2.0);
        osc.connect(oscGain);
        oscGain.connect(this.masterGain!);
        osc.start();
        osc.stop(this.ctx!.currentTime + 2.0);
    }, 1200);
  }

  playExplosion() {
    this.playExplosionMedium();
  }

  playHit() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCombo(level: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    const freq = 440 * Math.pow(1.059, level % 12);
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playUIClick() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(1500, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.02);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }

  playGameOver() {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(55, this.ctx.currentTime + 2.0);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 2.0);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 2.0);
  }

  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = v;
    }
  }
}

export const audioManager = new AudioManager();
