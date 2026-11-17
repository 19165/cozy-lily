/**
 * Cozy Ambient Soundscape Engine (FR-03)
 * Synthesizes warm rainfall + gentle sunlit lo-fi harmonic pad locally via Web Audio API
 * (zero external CDN failures, CSP-safe), while optionally supporting a custom remote MP3 stream
 * with graceful fallback if the external stream fails.
 */

class AmbientSoundEngine {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  private chordTimer: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
  private isPlaying = false;

  public getPlaying(): boolean {
    return this.isPlaying;
  }

  public async start(
    customUrl?: string,
    onFallbackNotice?: (msg: string) => void
  ): Promise<void> {
    if (this.isPlaying) return;

    if (customUrl && customUrl.trim().length > 0) {
      try {
        await this.startExternalStream(customUrl.trim());
        this.isPlaying = true;
        return;
      } catch {
        onFallbackNotice?.(
          'External audio stream could not load — playing built-in Cozy Rain instead.'
        );
      }
    }

    await this.startBuiltInCozyRain();
    this.isPlaying = true;
  }

  public stop(): void {
    this.isPlaying = false;

    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.src = '';
      this.htmlAudio = null;
    }

    if (this.chordTimer !== null) {
      window.clearInterval(this.chordTimer);
      this.chordTimer = null;
    }

    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.15);
    }

    const source = this.rainSource;
    const oscs = [...this.activeOscillators];
    this.rainSource = null;
    this.activeOscillators = [];

    window.setTimeout(() => {
      try {
        source?.stop();
        source?.disconnect();
      } catch {
        // Already stopped
      }
      oscs.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // Already stopped
        }
      });
    }, 350);
  }

  private async startExternalStream(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      audio.volume = 0.45;
      audio.src = url;

      const onCanPlay = () => {
        cleanup();
        audio
          .play()
          .then(() => {
            this.htmlAudio = audio;
            resolve();
          })
          .catch(reject);
      };

      const onError = () => {
        cleanup();
        reject(new Error('Stream failed to load'));
      };

      const cleanup = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.removeEventListener('error', onError);
      };

      audio.addEventListener('canplay', onCanPlay);
      audio.addEventListener('error', onError);
      audio.load();
    });
  }

  private async startBuiltInCozyRain(): Promise<void> {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }

    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    const ctx = this.audioCtx;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.setTargetAtTime(0.28, ctx.currentTime, 0.5);
    master.connect(ctx.destination);
    this.masterGain = master;

    // 1. Soft Brown/Pink filtered rain noise loop (4 seconds seamless buffer)
    const bufferSize = ctx.sampleRate * 4;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const output = noiseBuffer.getChannelData(ch);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.035 * white) / 1.035;
        output[i] = lastOut * 2.2;
      }
    }

    const rainSource = ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1150, ctx.currentTime);

    const rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.52, ctx.currentTime);

    rainSource.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(master);
    rainSource.start();
    this.rainSource = rainSource;

    // 2. Gentle warm lo-fi Rhodes chord loop (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
    const chords = [
      [174.61, 220.0, 261.63, 329.63], // Fmaj7
      [164.81, 196.0, 246.94, 293.66], // Em7
      [146.83, 174.61, 220.0, 261.63], // Dm7
      [130.81, 164.81, 196.0, 246.94], // Cmaj7
    ];
    let chordIdx = 0;

    const playSoftChord = () => {
      if (!this.isPlaying || !this.audioCtx || !this.masterGain) return;
      const now = this.audioCtx.currentTime;
      const freqs = chords[chordIdx % chords.length];
      chordIdx += 1;

      freqs.forEach((freq) => {
        if (!this.audioCtx || !this.masterGain) return;
        const osc = this.audioCtx.createOscillator();
        const noteGain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(680, now);

        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.032, now + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.0008, now + 4.6);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 4.8);
        this.activeOscillators.push(osc);

        osc.onended = () => {
          this.activeOscillators = this.activeOscillators.filter(
            (o) => o !== osc
          );
        };
      });
    };

    // Play first chord softly right after start
    window.setTimeout(() => {
      if (this.isPlaying) playSoftChord();
    }, 200);

    this.chordTimer = window.setInterval(playSoftChord, 4800);
  }
}

export const ambientSoundEngine = new AmbientSoundEngine();
