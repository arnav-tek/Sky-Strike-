import { audioManager } from './AudioManager';

// Simple step sequencer for retro arcade music
// Uses Web Audio API to synthesize sounds on the fly

interface Note {
  freq: number;
  duration: number;
  volume: number;
}

class MusicManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private isPlaying = false;
  private currentTheme: 'menu' | 'gameplay' | 'boss' | null = null;
  private nextTheme: 'menu' | 'gameplay' | 'boss' | null = null;
  
  private bpm = 120;
  private currentStep = 0;
  private schedulerTimer: number | null = null;
  private nextStepTime = 0;
  private noiseBuffer: AudioBuffer | null = null;
  
  private tracks: {
    kick: boolean[];
    snare: boolean[];
    hihat: boolean[];
    bass: (number | null)[];
    lead: (number | null)[];
  } = {
    kick: [],
    snare: [],
    hihat: [],
    bass: [],
    lead: []
  };

  constructor() {}

  init(ctx: AudioContext) {
    this.ctx = ctx;
    this.musicGain = ctx.createGain();
    this.musicGain.connect(ctx.destination);
    this.musicGain.gain.value = 0.4;
    this.noiseBuffer = this.createNoiseBuffer();
  }

  setTheme(theme: 'menu' | 'gameplay' | 'boss') {
    if (this.currentTheme === theme) return;
    
    if (this.isPlaying) {
      this.nextTheme = theme;
      this.fadeOut();
    } else {
      this.startTheme(theme);
    }
  }

  private startTheme(theme: 'menu' | 'gameplay' | 'boss') {
    if (!this.ctx) return;
    this.currentTheme = theme;
    this.currentStep = 0;
    this.nextStepTime = this.ctx.currentTime + 0.1;
    
    switch (theme) {
      case 'menu':
        this.bpm = 95;
        this.setupMenuTrack();
        break;
      case 'gameplay':
        this.bpm = 142;
        this.setupGameplayTrack();
        break;
      case 'boss':
        this.bpm = 155;
        this.setupBossTrack();
        break;
    }
    
    if (this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 1.5);
    }
    
    this.isPlaying = true;
    this.runScheduler();
  }

  private fadeOut() {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      
      setTimeout(() => {
        if (this.nextTheme) {
          const theme = this.nextTheme;
          this.nextTheme = null;
          this.startTheme(theme);
        } else {
          this.stop();
        }
      }, 800);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.schedulerTimer) {
      cancelAnimationFrame(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    this.currentTheme = null;
  }

  private runScheduler = () => {
    if (!this.isPlaying || !this.ctx) return;
    
    while (this.nextStepTime < this.ctx.currentTime + 0.1) {
      this.scheduleStep(this.currentStep, this.nextStepTime);
      this.advanceStep();
    }
    
    this.schedulerTimer = requestAnimationFrame(this.runScheduler);
  }

  private advanceStep() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextStepTime += 0.25 * secondsPerBeat; // 16th notes
    this.currentStep = (this.currentStep + 1) % 16;
  }

  private scheduleStep(step: number, time: number) {
    if (this.tracks.kick[step]) this.playKick(time);
    if (this.tracks.snare[step]) this.playSnare(time);
    if (this.tracks.hihat[step]) this.playHiHat(time);
    
    const bassNote = this.tracks.bass[step];
    if (bassNote !== null) this.playBass(bassNote, time);
    
    const leadNote = this.tracks.lead[step];
    if (leadNote !== null) this.playLead(leadNote, time);
  }

  // --- Patterns ---

  private setupMenuTrack() {
    this.tracks.kick = [true, false, false, false, false, false, true, false, true, false, false, false, false, false, false, false];
    this.tracks.snare = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    this.tracks.hihat = [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false];
    
    // Atmospheric minor bass line
    const A1 = 55.0;
    const F1 = 43.65;
    const E1 = 41.2;
    this.tracks.bass = [A1, null, null, A1, F1, null, null, F1, E1, null, null, E1, A1, null, null, null];
    
    const A2 = 110.0;
    const C3 = 130.81;
    const E3 = 164.81;
    this.tracks.lead = [A2, null, null, null, C3, null, null, null, E3, null, null, null, A2, null, null, null];
  }

  private setupGameplayTrack() {
    this.tracks.kick = [true, false, true, false, true, false, true, false, true, false, true, false, true, true, false, false];
    this.tracks.snare = [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false];
    this.tracks.hihat = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    
    const A1 = 55.0;
    const G1 = 49.0;
    const C2 = 65.41;
    this.tracks.bass = [A1, A1, G1, G1, C2, C2, G1, G1, A1, A1, G1, G1, C2, C2, G1, G1];
    
    const A3 = 220.0;
    const C4 = 261.63;
    const D4 = 293.66;
    const E4 = 329.63;
    this.tracks.lead = [A3, null, C4, null, D4, null, E4, null, A3, null, C4, null, D4, E4, D4, C4];
  }

  private setupBossTrack() {
    this.tracks.kick = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    this.tracks.snare = [false, false, true, false, false, false, true, false, false, false, true, false, false, true, true, true];
    this.tracks.hihat = [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true];
    
    const E1 = 41.2;
    const F1 = 43.65;
    this.tracks.bass = [E1, E1, F1, F1, E1, E1, F1, F1, E1, E1, F1, F1, E1, E1, F1, F1];
    
    const E4 = 329.63;
    const F4 = 349.23;
    const G4 = 392.0;
    this.tracks.lead = [E4, E4, F4, F4, G4, G4, F4, F4, E4, E4, F4, F4, G4, G4, F4, F4];
  }

  // --- Synthesis ---

  private playKick(time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    gain.gain.setValueAtTime(0.3, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.3);
    
    osc.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.3);
  }

  private playSnare(time: number) {
    if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(800, time);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    noise.start(time);
    noise.stop(time + 0.15);
  }

  private playHiHat(time: number) {
    if (!this.ctx || !this.musicGain || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    noise.start(time);
    noise.stop(time + 0.04);
  }

  private playBass(freq: number, time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, time);
    
    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.25);
  }

  private playLead(freq: number, time: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, time);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, time);
    
    gain.gain.setValueAtTime(0.08, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    
    osc.start(time);
    osc.stop(time + 0.2);
  }

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
}

export const musicManager = new MusicManager();
