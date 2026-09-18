// Web Audio API Synthesizer & Custom MP3 Audio Player for Romantic Soundscapes
// Supports custom audio.mp3 from assest/audio/audio.mp3 and assets/audio/audio.mp3 with soft synth fallback

class RomanticAudioController {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private ambientTimer: number | null = null;
  private ambientStep = 0;
  private masterGain: GainNode | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private isUsingCustomMp3 = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Romantic unlock success celebration chime
  public playUnlockSuccess() {
    try {
      this.initCtx();
      this.playChime([440, 554.37, 659.25, 880, 1108.73]);
      setTimeout(() => {
        this.playHeartSpark();
      }, 300);
    } catch {}
  }

  // Play a gentle bell / chime chord
  public playChime(freqs = [523.25, 659.25, 783.99, 1046.50]) {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      freqs.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, this.ctx!.currentTime + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + idx * 0.08 + 1.6);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 1.8);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Balloon Pop Sound
  public playPop() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {}
  }

  // Candle blow out whoosh / gentle breath
  public playBlowCandle() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      // Soft filtered noise buffer for blowing candle
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.45);
    } catch {}
  }

  // Letter paper rustle / open seal
  public playLetterOpen() {
    this.playChime([440, 554.37, 659.25, 880]);
  }

  // Romantic Birthday Melody snippet ("Happy Birthday To You")
  public playBirthdayMelody() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const melody = [
        { note: 261.63, dur: 0.28 }, // C4
        { note: 261.63, dur: 0.16 }, // C4
        { note: 293.66, dur: 0.45 }, // D4
        { note: 261.63, dur: 0.45 }, // C4
        { note: 349.23, dur: 0.45 }, // F4
        { note: 329.63, dur: 0.90 }, // E4
        { note: 261.63, dur: 0.28 }, // C4
        { note: 261.63, dur: 0.16 }, // C4
        { note: 293.66, dur: 0.45 }, // D4
        { note: 261.63, dur: 0.45 }, // C4
        { note: 392.00, dur: 0.45 }, // G4
        { note: 349.23, dur: 0.90 }, // F4
      ];

      let time = this.ctx.currentTime + 0.1;
      melody.forEach(({ note, dur }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.2, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(time);
        osc.stop(time + dur);

        time += dur + 0.05;
      });
    } catch {}
  }

  // Candidate paths where user may place audio.mp3
  private candidateAudioUrls = [
    '/assest/audio/audio.mp3',
    '/assets/audio/audio.mp3',
    '/assests/audio/audio.mp3',
    '/assest/audio.mp3',
    '/assets/audio.mp3',
    '/assests/audio.mp3',
    '/audio.mp3',
  ];

  // Ambient Romantic Music Generator: First tries audio.mp3, falls back to sweet ambient synthesizer
  public toggleAmbientMusic(onStatusChange?: (playing: boolean) => void): boolean {
    this.initCtx();
    if (this.isMusicPlaying) {
      this.stopAmbientMusic();
      if (onStatusChange) onStatusChange(false);
      return false;
    } else {
      this.startAmbientMusic(onStatusChange);
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isMusicPlaying;
  }

  public startAmbientMusic(onStatusChange?: (playing: boolean) => void) {
    this.initCtx();
    this.isMusicPlaying = true;
    if (onStatusChange) onStatusChange(true);

    // Try HTML Audio element with user's audio.mp3
    this.tryPlayCustomAudio(0)
      .then((success) => {
        if (!success) {
          // Fall back to Web Audio ambient synthesizer
          this.startAmbientSynth();
        }
      })
      .catch(() => {
        this.startAmbientSynth();
      });
  }

  private async tryPlayCustomAudio(index: number): Promise<boolean> {
    if (index >= this.candidateAudioUrls.length) {
      return false;
    }

    const url = this.candidateAudioUrls[index];

    return new Promise<boolean>((resolve) => {
      try {
        const audio = new Audio();
        audio.src = url;
        audio.loop = true;
        audio.volume = 0.65;

        // Detect if file exists and can play
        const handleCanPlay = () => {
          if (!this.isMusicPlaying) {
            audio.pause();
            resolve(false);
            return;
          }
          audio
            .play()
            .then(() => {
              this.htmlAudio = audio;
              this.isUsingCustomMp3 = true;
              resolve(true);
            })
            .catch(() => {
              // Try next candidate or fallback
              this.tryPlayCustomAudio(index + 1).then(resolve);
            });
        };

        const handleError = () => {
          // Try next candidate
          this.tryPlayCustomAudio(index + 1).then(resolve);
        };

        audio.addEventListener('canplaythrough', handleCanPlay, { once: true });
        audio.addEventListener('error', handleError, { once: true });

        // Trigger load
        audio.load();

        // Timeout guard: if takes more than 1.5s to respond, try next
        setTimeout(() => {
          if (!this.htmlAudio) {
            handleError();
          }
        }, 1500);
      } catch {
        resolve(false);
      }
    });
  }

  private startAmbientSynth() {
    if (!this.isMusicPlaying) return;
    const chords = [
      // Fmaj7 - C - Dm7 - Bbmaj7 romantic progression
      [349.23, 440.00, 523.25, 659.25], // F, A, C, E
      [261.63, 329.63, 392.00, 523.25], // C, E, G, C
      [293.66, 349.23, 440.00, 523.25], // D, F, A, C
      [233.08, 293.66, 349.23, 440.00], // Bb, D, F, A
    ];

    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.masterGain || this.isUsingCustomMp3) return;

      const chordIndex = Math.floor(this.ambientStep / 8) % chords.length;
      const currentChord = chords[chordIndex];
      const noteIndex = this.ambientStep % currentChord.length;
      const baseFreq = currentChord[noteIndex];

      // Add soft warm octave variations
      const octaveMult = (this.ambientStep % 3 === 0) ? 2 : 1;
      const freq = baseFreq * octaveMult;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = (this.ambientStep % 2 === 0) ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.9);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 2.0);

      this.ambientStep++;
      const nextDelay = 380 + Math.random() * 80;
      this.ambientTimer = window.setTimeout(playNextNote, nextDelay);
    };

    playNextNote();
  }

  // Sweet delicate heart explosion sparkle sound (soft music-box bell)
  public playHeartSpark() {
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const pentatonic = [523.25, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
      const note = pentatonic[Math.floor(Math.random() * pentatonic.length)];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.38);
    } catch {}
  }

  public stopAmbientMusic() {
    this.isMusicPlaying = false;
    if (this.htmlAudio) {
      try {
        this.htmlAudio.pause();
      } catch {}
      this.htmlAudio = null;
    }
    this.isUsingCustomMp3 = false;
    if (this.ambientTimer) {
      clearTimeout(this.ambientTimer);
      this.ambientTimer = null;
    }
  }
}

export const romanticAudio = new RomanticAudioController();
