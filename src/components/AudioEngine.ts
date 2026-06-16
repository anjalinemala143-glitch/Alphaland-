import { AlphabetItem } from '../types';

class AudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Plays a bubble/pop sound
  public playPop() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      console.warn('Audio playPop error:', e);
    }
  }

  // Plays an ascending happy sound for correct choices
  public playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Note frequencies for a happy arpeggio C4 to G4 to C5 to E5
      const notes = [261.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const noteTime = now + (index * 0.1);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.12, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.26);
      });
    } catch (e) {
      console.warn('Audio playSuccess error:', e);
    }
  }

  // Plays a low dual-tone bouncy chord for mistakes (extremely gentle, not discouraging)
  public playError() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Bass drone with decay
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(180, now);
      osc1.frequency.linearRampToValueAtTime(140, now + 0.25);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(183, now);
      osc2.frequency.linearRampToValueAtTime(143, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.3);
      osc2.stop(now + 0.3);
    } catch (e) {
      console.warn('Audio playError error:', e);
    }
  }

  // Plays drawing glide sound
  public playDraw() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pick a random frequency around a nice whistle range for whimsical drawing feel
      const randomFreq = 400 + Math.random() * 200;
      osc.frequency.setValueAtTime(randomFreq, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch (e) {
      // Ignored
    }
  }

  // Plays a final big trumpet-like celebratory chord
  public playFanfare() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chords = [261.63, 329.63, 392.00, 523.25, 1046.5]; // C major extended

      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Add tiny vibrato
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.0);
      });
    } catch (e) {
      console.warn('Audio playFanfare error:', e);
    }
  }

  /* ------------------- Speech Synthesis ------------------- */

  private getVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;
    const voices = window.speechSynthesis.getVoices();
    // Try to find a gentle Google or standard English child-sounding or clear voice
    const preferred = voices.find(v => 
      v.lang.startsWith('en-US') && 
      (v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('Google') || v.name.includes('Samantha'))
    );
    return preferred || voices.find(v => v.lang.startsWith('en')) || null;
  }

  public speak(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onEnd?.();
      return;
    }
    // Cancel any ongoing speeches
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    // Slow down speech slightly for child clarity and comprehension
    utterance.rate = 0.85;
    utterance.pitch = 1.15; // slightly higher pitch of child/cartoon-ish cheerful tone

    if (onEnd) {
      utterance.onend = () => onEnd();
      utterance.onerror = () => onEnd();
    }

    window.speechSynthesis.speak(utterance);
  }

  public speakLetter(item: AlphabetItem, onEnd?: () => void) {
    const textPrompt = `Letter ${item.letter}, lowercase ${item.lowercase}. ${item.word}! ${item.phonics}.`;
    this.speak(textPrompt, onEnd);
  }

  public speakEncouragement() {
    const rewards = [
      "Wow! Spectacular!",
      "Superb! You are amazing!",
      "Hooray! That is absolutely correct!",
      "Splendid! Beautiful!",
      "A star for you!",
      "Excellent job, little explorer!",
      "Keep it up, you are doing great!"
    ];
    const picked = rewards[Math.floor(Math.random() * rewards.length)];
    this.speak(picked);
  }

  public speakTryAgain() {
    const tryAgainPhrases = [
      "So close! Try another one!",
      "Oops! Let's give it another shot!",
      "You can do it! Try again!",
      "Almost! Let's think and try again!"
    ];
    const picked = tryAgainPhrases[Math.floor(Math.random() * tryAgainPhrases.length)];
    this.speak(picked);
  }
}

export const audio = new AudioEngine();
