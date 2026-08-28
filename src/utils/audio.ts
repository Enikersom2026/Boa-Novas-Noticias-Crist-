/**
 * Web Audio API synthesizer for realistic light clicks, fluorescent tube hum/flicker, and terminal sounds
 */

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopFluorescentHum();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Realistic light switch mechanical click
  public playSwitchClick(stateOn: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(stateOn ? 620 : 440, t);
    osc.frequency.exponentialRampToValueAtTime(stateOn ? 180 : 120, t + 0.04);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);

    // Mechanical snap sound
    const noise = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.005));
    }
    noise.buffer = buffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.value = 1800;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + 0.03);
  }

  // Fluorescent tube starter electrical pop/buzz
  public playTubeFlickerPop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t); // 120Hz mains buzz harmonic
    osc.frequency.setValueAtTime(180 + Math.random() * 60, t + 0.01);

    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + Math.random() * 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Subtle continuous fluorescent ambient hum (very soft, authentic 60/120Hz)
  public startFluorescentHum(volume: number = 0.015) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (this.humOsc) return;

    const t = this.ctx.currentTime;
    this.humOsc = this.ctx.createOscillator();
    this.humGain = this.ctx.createGain();

    this.humOsc.type = 'sine';
    this.humOsc.frequency.setValueAtTime(120, t);

    this.humGain.gain.setValueAtTime(0.0001, t);
    this.humGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), t + 0.2);

    this.humOsc.connect(this.humGain);
    this.humGain.connect(this.ctx.destination);

    this.humOsc.start();
  }

  public stopFluorescentHum() {
    if (this.humGain && this.ctx) {
      try {
        const t = this.ctx.currentTime;
        this.humGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
        setTimeout(() => {
          if (this.humOsc) {
            try { this.humOsc.stop(); } catch {}
            this.humOsc.disconnect();
            this.humOsc = null;
          }
          if (this.humGain) {
            this.humGain.disconnect();
            this.humGain = null;
          }
        }, 120);
      } catch {
        this.humOsc = null;
        this.humGain = null;
      }
    }
  }

  // Key press sound in terminal
  public playKeyType() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.02);

    gain.gain.setValueAtTime(0.03, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.02);
  }

  // Terminal notification sound
  public playAlert(type: 'error' | 'success' | 'info') {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    if (type === 'error') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.setValueAtTime(160, t + 0.08);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    } else if (type === 'success') {
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        gain.gain.setValueAtTime(0.08, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.25);
      });
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }
  }
}

export const sounds = new SoundSystem();
