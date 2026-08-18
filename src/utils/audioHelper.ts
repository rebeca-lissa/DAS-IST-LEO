// Web Audio helper for in-browser 8-bit/16-bit retro chiptune sound generation & voice recording

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;
  private muted = false;

  constructor() {
    try {
      const savedMute = localStorage.getItem('das_ist_leo_sound_muted');
      if (savedMute !== null) {
        this.muted = savedMute === 'true';
      }
    } catch {
      // ignore
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem('das_ist_leo_sound_muted', muted ? 'true' : 'false');
    } catch {
      // ignore
    }
    if (muted) {
      this.stopAmbientTourSound();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  private initContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Play an 8-bit Retro Memory Chime (arpeggiated pentatonic chiptune note)
  public playMemoryChime(frequencyMultiplier = 1) {
    if (this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const notes = [
        392.00 * frequencyMultiplier, // G4
        523.25 * frequencyMultiplier, // C5
        659.25 * frequencyMultiplier, // E5
        783.99 * frequencyMultiplier, // G5
        1046.50 * frequencyMultiplier // C6
      ];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3200, now);

        gain.gain.setValueAtTime(0, now + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.08 / notes.length, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.6);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.7);
      });
    } catch {
      // AudioContext autoplay
    }
  }

  // 2. Play 8-bit Level-Up / Birthday Celebration Fanfare
  public playLevelUpFanfare() {
    if (this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const fanfare = [
        { f: 523.25, d: 0.1 },  // C5
        { f: 523.25, d: 0.1 },  // C5
        { f: 523.25, d: 0.1 },  // C5
        { f: 659.25, d: 0.25 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.50, d: 0.5 }, // C6
      ];

      let accumulatedTime = 0;
      fanfare.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(item.f, now + accumulatedTime);

        gain.gain.setValueAtTime(0.1, now + accumulatedTime);
        gain.gain.exponentialRampToValueAtTime(0.001, now + accumulatedTime + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + accumulatedTime);
        osc.stop(now + accumulatedTime + item.d);

        accumulatedTime += item.d * 0.85;
      });
    } catch {
      // ignore
    }
  }

  // 3. Play cute click / pop sound
  public playSootSpriteSqueak() {
    if (this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.12);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // ignore
    }
  }

  // 4. Play click rattle
  public playKodamaRattle() {
    if (this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      for (let i = 0; i < 4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200 + (i % 2) * 200, now + i * 0.05);

        gain.gain.setValueAtTime(0.08, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.04);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.05);
      }
    } catch {
      // ignore
    }
  }

  // 5. Play Campfire cozy guitar strum
  public playGuitarStrum() {
    if (this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      // Warm Cmaj7 acoustic chord
      const chord = [130.81, 196.00, 246.94, 329.63, 493.88, 523.25];

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, now);

        gain.gain.setValueAtTime(0.07, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.03 + 1.2);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 1.3);
      });
    } catch {
      // ignore
    }
  }

  // 6. Play Vista chime
  public playVistaChime() {
    if (this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const notes = [587.33, 880.00, 1174.66, 1760.00];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.6);
      });
    } catch {
      // ignore
    }
  }

  // 7. Simulated 16-bit JRPG cozy melody for voice capsules
  public playSynthesizedVoiceNote(seedString = 'leo', onEnded?: () => void): () => void {
    if (this.muted) {
      if (onEnded) setTimeout(onEnded, 1000);
      return () => {};
    }
    const ctx = this.initContext();
    if (!ctx) {
      if (onEnded) setTimeout(onEnded, 1000);
      return () => {};
    }
    const now = ctx.currentTime;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = (hash << 5) - hash + seedString.charCodeAt(i);
    }

    const rootNotes = [261.63, 293.66, 329.63, 392.00, 440.00];
    const baseFreq = rootNotes[Math.abs(hash) % rootNotes.length];

    const chords = [
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2],
      [baseFreq * 1.125, baseFreq * 1.334, baseFreq * 1.68, baseFreq * 2.25],
      [baseFreq * 0.89, baseFreq * 1.125, baseFreq * 1.334, baseFreq * 1.78],
      [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2],
    ];

    const stepDuration = 1.4;
    const totalDuration = chords.length * stepDuration;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.12, now);
    masterGain.connect(ctx.destination);

    const activeOscs: OscillatorNode[] = [];

    chords.forEach((chord, chordIdx) => {
      const chordStart = now + chordIdx * stepDuration;
      chord.forEach((freq, noteIdx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = noteIdx === 0 ? 'triangle' : noteIdx === 3 ? 'square' : 'sine';
        osc.frequency.setValueAtTime(freq, chordStart);

        noteGain.gain.setValueAtTime(0, chordStart);
        noteGain.gain.linearRampToValueAtTime(0.06, chordStart + 0.1);
        noteGain.gain.exponentialRampToValueAtTime(0.001, chordStart + stepDuration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(chordStart);
        osc.stop(chordStart + stepDuration + 0.1);
        activeOscs.push(osc);
      });
    });

    const timeout = setTimeout(() => {
      if (onEnded) onEnded();
    }, totalDuration * 1000);

    return () => {
      clearTimeout(timeout);
      try {
        masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        setTimeout(() => {
          activeOscs.forEach(o => {
            try { o.stop(); } catch { /* ignore */ }
          });
        }, 250);
      } catch {
        // ignore
      }
    };
  }

  // 8. Ambient Alpine sound for Tour mode
  public startAmbientTourSound() {
    if (this.isAmbientPlaying || this.muted) return;
    try {
      const ctx = this.initContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.linearRampToValueAtTime(0.05, now + 2);
      this.ambientGain.connect(ctx.destination);

      const notes = [130.81, 196.00, 246.94, 293.66, 329.63]; 
      this.ambientOscillators = notes.map((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.connect(this.ambientGain!);
        osc.start();
        return osc;
      });
      this.isAmbientPlaying = true;
    } catch {
      // ignore
    }
  }

  public stopAmbientTourSound() {
    if (!this.isAmbientPlaying || !this.ambientGain || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
      setTimeout(() => {
        this.ambientOscillators.forEach(osc => {
          try { osc.stop(); } catch { /* ignore */ }
        });
        this.ambientOscillators = [];
        this.isAmbientPlaying = false;
      }, 900);
    } catch {
      this.isAmbientPlaying = false;
    }
  }
}

export const soundManager = new SoundManager();

// Browser Microphone Recorder
export class AudioVoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  public async startRecording(): Promise<boolean> {
    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);
      return true;
    } catch (err) {
      console.warn('Microphone access not available or denied:', err);
      return false;
    }
  }

  public stopRecording(): Promise<{ blob: Blob; url: string; duration: number }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        return reject(new Error('No media recorder active'));
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }

        resolve({
          blob: audioBlob,
          url: audioUrl,
          duration: Math.max(1, Math.round(this.audioChunks.length * 0.1)),
        });
      };

      this.mediaRecorder.stop();
    });
  }

  public cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
  }
}
