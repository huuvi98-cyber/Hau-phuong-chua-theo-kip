/**
 * Web Audio API Ocean Waves Synthesizer
 * Generates realistic procedural ocean surf and breaking waves
 * without any external audio files.
 */
class OceanSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private masterGain: GainNode | null = null;
  private volume: number = 0.5;

  private bufferSource1: AudioBufferSourceNode | null = null;
  private bufferSource2: AudioBufferSourceNode | null = null;
  private filter1: BiquadFilterNode | null = null;
  private filter2: BiquadFilterNode | null = null;
  private lfoOsc1: OscillatorNode | null = null;
  private lfoOsc2: OscillatorNode | null = null;

  public init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();
  }

  private createNoiseBuffer(durationSeconds: number = 5): AudioBuffer {
    if (!this.ctx) throw new Error('Audio context not initialized');
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    
    // Generate pink/brownish noise for sea rumble
    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Simple 1-pole filter to produce brown noise
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
    }
    return buffer;
  }

  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.isPlaying) return;

    const noiseBuffer = this.createNoiseBuffer(6);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume), this.ctx.currentTime + 2);
    this.masterGain.connect(this.ctx.destination);

    // Channel 1: Rolling swell
    this.bufferSource1 = this.ctx.createBufferSource();
    this.bufferSource1.buffer = noiseBuffer;
    this.bufferSource1.loop = true;

    this.filter1 = this.ctx.createBiquadFilter();
    this.filter1.type = 'lowpass';
    this.filter1.frequency.setValueAtTime(250, this.ctx.currentTime);
    this.filter1.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // LFO for wave modulation
    this.lfoOsc1 = this.ctx.createOscillator();
    this.lfoOsc1.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8s cycle
    const lfoGain1 = this.ctx.createGain();
    lfoGain1.gain.setValueAtTime(280, this.ctx.currentTime);
    this.lfoOsc1.connect(lfoGain1);
    lfoGain1.connect(this.filter1.frequency);

    this.bufferSource1.connect(this.filter1);
    this.filter1.connect(this.masterGain);

    // Channel 2: Foam and hiss
    this.bufferSource2 = this.ctx.createBufferSource();
    this.bufferSource2.buffer = noiseBuffer;
    this.bufferSource2.loop = true;

    this.filter2 = this.ctx.createBiquadFilter();
    this.filter2.type = 'bandpass';
    this.filter2.frequency.setValueAtTime(600, this.ctx.currentTime);
    this.filter2.Q.setValueAtTime(0.8, this.ctx.currentTime);

    this.lfoOsc2 = this.ctx.createOscillator();
    this.lfoOsc2.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    // Slight phase difference
    const lfoGain2 = this.ctx.createGain();
    lfoGain2.gain.setValueAtTime(350, this.ctx.currentTime);
    this.lfoOsc2.connect(lfoGain2);
    lfoGain2.connect(this.filter2.frequency);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.35, this.ctx.currentTime);
    this.bufferSource2.connect(this.filter2);
    this.filter2.connect(gain2);
    gain2.connect(this.masterGain);

    this.bufferSource1.start();
    this.bufferSource2.start();
    this.lfoOsc1.start();
    this.lfoOsc2.start();

    this.isPlaying = true;
  }

  public stop() {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    const now = this.ctx.currentTime;
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
    setTimeout(() => {
      try {
        this.bufferSource1?.stop();
        this.bufferSource2?.stop();
        this.lfoOsc1?.stop();
        this.lfoOsc2?.stop();
      } catch {
        // Safe ignore
      }
      this.isPlaying = false;
    }, 1300);
  }

  public setVolume(val: number) {
    this.volume = val;
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.1);
    }
  }

  public triggerSplash() {
    if (!this.ctx || !this.isPlaying) return;
    try {
      const splashGain = this.ctx.createGain();
      splashGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      splashGain.gain.linearRampToValueAtTime(this.volume * 0.8, this.ctx.currentTime + 0.1);
      splashGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);

      const splashFilter = this.ctx.createBiquadFilter();
      splashFilter.type = 'lowpass';
      splashFilter.frequency.setValueAtTime(800, this.ctx.currentTime);
      splashFilter.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 1.8);

      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(2);
      noise.connect(splashFilter);
      splashFilter.connect(splashGain);
      splashGain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Safe ignore
    }
  }

  public getStatus(): boolean {
    return this.isPlaying;
  }
}

export const oceanSound = new OceanSoundEngine();
