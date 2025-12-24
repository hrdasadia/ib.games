// Audio Manager for IB.GAMES using Web Audio API
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isInitialized = false;
    this.isMuted = false;
    this.musicOscillators = [];
    this.currentIntensity = 0;
  }

  init() {
    if (this.isInitialized) return;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Master gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      
      // Music gain
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.15;
      this.musicGain.connect(this.masterGain);
      
      // SFX gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.4;
      this.sfxGain.connect(this.masterGain);
      
      this.isInitialized = true;
    } catch (e) {
      console.log('Web Audio not supported');
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  mute(muted) {
    this.isMuted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.3;
    }
  }

  // === AMBIENT MUSIC ===
  startAmbientMusic() {
    if (!this.isInitialized || this.isMuted) return;
    this.stopAmbientMusic();
    
    // Create layered ambient pads
    const baseFreqs = [65.41, 98.0, 130.81]; // C2, G2, C3 - financial/serious tone
    
    baseFreqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      filter.Q.value = 1;
      
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 2);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);
      
      osc.start();
      this.musicOscillators.push({ osc, gain, filter, baseFreq: freq });
    });

    // Add subtle high shimmer
    const shimmer = this.ctx.createOscillator();
    const shimmerGain = this.ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.value = 523.25; // C5
    shimmerGain.gain.value = 0.02;
    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.musicGain);
    shimmer.start();
    this.musicOscillators.push({ osc: shimmer, gain: shimmerGain });
  }

  stopAmbientMusic() {
    this.musicOscillators.forEach(({ osc, gain }) => {
      try {
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
        setTimeout(() => osc.stop(), 600);
      } catch (e) {}
    });
    this.musicOscillators = [];
  }

  // Update music intensity based on game state
  setIntensity(intensity) {
    if (!this.isInitialized) return;
    this.currentIntensity = intensity;
    
    // Adjust filter and volume based on intensity
    this.musicOscillators.forEach(({ filter, gain, baseFreq }) => {
      if (filter) {
        filter.frequency.linearRampToValueAtTime(
          300 + intensity * 800,
          this.ctx.currentTime + 0.3
        );
      }
      if (gain && baseFreq) {
        gain.gain.linearRampToValueAtTime(
          0.05 + intensity * 0.08,
          this.ctx.currentTime + 0.3
        );
      }
    });
  }

  // === SOUND EFFECTS ===
  
  // Trade tick sound
  playTick() {
    if (!this.isInitialized || this.isMuted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.value = 880 + Math.random() * 200;
    
    gain.gain.value = 0.1;
    gain.gain.exponentialDecayToValueAtTime?.(0.01, this.ctx.currentTime + 0.05) ||
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  // Greenshoe activation - satisfying "release" sound
  playGreenshoe() {
    if (!this.isInitialized || this.isMuted) return;
    
    // Layered sound: whoosh + chime
    const now = this.ctx.currentTime;
    
    // Whoosh (noise burst)
    const bufferSize = this.ctx.sampleRate * 0.3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2000;
    noiseFilter.Q.value = 0.5;
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.15;
    noiseGain.gain.linearRampToValueAtTime(0, now + 0.3);
    
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start();
    
    // Chime (success tone)
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.12, now + 0.02 + i * 0.05);
      gain.gain.linearRampToValueAtTime(0, now + 0.4 + i * 0.05);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.05);
      osc.stop(now + 0.5);
    });
  }

  // Stabilization hold sound - continuous hum
  playStabilizeStart() {
    if (!this.isInitialized || this.isMuted || this.stabilizeOsc) return;
    
    this.stabilizeOsc = this.ctx.createOscillator();
    this.stabilizeGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    this.stabilizeOsc.type = 'sawtooth';
    this.stabilizeOsc.frequency.value = 110;
    
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    
    this.stabilizeGain.gain.value = 0;
    this.stabilizeGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.2);
    
    this.stabilizeOsc.connect(filter);
    filter.connect(this.stabilizeGain);
    this.stabilizeGain.connect(this.sfxGain);
    
    this.stabilizeOsc.start();
  }

  playStabilizeEnd() {
    if (this.stabilizeOsc) {
      this.stabilizeGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
      setTimeout(() => {
        try { this.stabilizeOsc.stop(); } catch(e) {}
        this.stabilizeOsc = null;
        this.stabilizeGain = null;
      }, 150);
    }
  }

  // Volatility warning
  playVolatilityWarning() {
    if (!this.isInitialized || this.isMuted) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.value = 220;
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);
    
    gain.gain.value = 0.08;
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(now + 0.3);
  }

  // Positive news
  playPositiveNews() {
    if (!this.isInitialized || this.isMuted) return;
    
    const now = this.ctx.currentTime;
    [392, 493.88, 587.33, 783.99].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.1, now + i * 0.08 + 0.02);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.4);
    });
  }

  // Negative news
  playNegativeNews() {
    if (!this.isInitialized || this.isMuted) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.value = 150;
    osc.frequency.linearRampToValueAtTime(80, now + 0.4);
    
    gain.gain.value = 0.1;
    gain.gain.linearRampToValueAtTime(0, now + 0.4);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(now + 0.5);
  }

  // Phase transition
  playPhaseTransition() {
    if (!this.isInitialized || this.isMuted) return;
    
    const now = this.ctx.currentTime;
    
    // Rising sweep
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 200;
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);
    gain.gain.value = 0.12;
    gain.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(now + 0.7);
    
    // Accent hit
    setTimeout(() => {
      const hit = this.ctx.createOscillator();
      const hitGain = this.ctx.createGain();
      hit.type = 'triangle';
      hit.frequency.value = 440;
      hitGain.gain.value = 0.15;
      hitGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
      hit.connect(hitGain);
      hitGain.connect(this.sfxGain);
      hit.start();
      hit.stop(this.ctx.currentTime + 0.25);
    }, 400);
  }

  // Game end fanfare
  playGameEnd(isGoodScore) {
    if (!this.isInitialized || this.isMuted) return;
    this.stopAmbientMusic();
    
    const now = this.ctx.currentTime;
    const notes = isGoodScore 
      ? [261.63, 329.63, 392, 523.25] // C major arpeggio
      : [261.63, 311.13, 349.23, 415.30]; // C minor
    
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
      gain.gain.linearRampToValueAtTime(i === notes.length - 1 ? 0.1 : 0, now + i * 0.15 + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + (i === notes.length - 1 ? 1.5 : 0.6));
    });
  }

  destroy() {
    this.stopAmbientMusic();
    if (this.ctx) {
      this.ctx.close();
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();
