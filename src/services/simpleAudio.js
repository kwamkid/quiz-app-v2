// src/services/simpleAudio.js - ทดสอบ audio แบบง่าย
class SimpleAudioService {
  constructor() {
    this.audioContext = null;
    this.initialized = false;
    this.musicPlaying = false;
    this.musicOscillator = null;
    this.musicGain = null;
  }

  async initialize() {
    if (this.initialized) return true;

    try {
      // Create AudioContext
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      console.log("🎵 Simple audio initialized!");
      this.initialized = true;
      return true;
    } catch (error) {
      console.error("❌ Audio initialization failed:", error);
      return false;
    }
  }

  async playClickSound() {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.1
      );

      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.1);

      console.log("🔊 Click sound played");
    } catch (error) {
      console.error("❌ Click sound failed:", error);
    }
  }

  async startBackgroundMusic() {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) return;
    }

    if (this.musicPlaying) return;

    try {
      // Create a simple background tone
      this.musicOscillator = this.audioContext.createOscillator();
      this.musicGain = this.audioContext.createGain();

      this.musicOscillator.connect(this.musicGain);
      this.musicGain.connect(this.audioContext.destination);

      // Very low volume for background
      this.musicGain.gain.setValueAtTime(0.02, this.audioContext.currentTime);

      // Simple peaceful frequency
      this.musicOscillator.frequency.setValueAtTime(
        220,
        this.audioContext.currentTime
      );
      this.musicOscillator.type = "sine";

      this.musicOscillator.start();
      this.musicPlaying = true;

      console.log("🎵 Background music started");
    } catch (error) {
      console.error("❌ Background music failed:", error);
    }
  }

  stopBackgroundMusic() {
    if (this.musicOscillator && this.musicPlaying) {
      try {
        this.musicOscillator.stop();
        this.musicOscillator = null;
        this.musicGain = null;
        this.musicPlaying = false;
        console.log("🔇 Background music stopped");
      } catch (error) {
        console.error("❌ Stop music failed:", error);
      }
    }
  }

  toggleBackgroundMusic() {
    if (this.musicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.musicPlaying;
  }

  // Convenience methods
  async buttonClick() {
    return this.playClickSound();
  }

  async correctAnswer() {
    // Play a happy sound
    if (!this.initialized) await this.initialize();

    try {
      const frequencies = [523, 659, 784]; // C, E, G
      frequencies.forEach((freq, i) => {
        setTimeout(() => this.playTone(freq, 0.2), i * 100);
      });
    } catch (error) {
      console.error("Success sound failed:", error);
    }
  }

  async wrongAnswer() {
    // Play a sad sound
    if (!this.initialized) await this.initialize();

    try {
      this.playTone(200, 0.3);
    } catch (error) {
      console.error("Error sound failed:", error);
    }
  }

  async playTone(frequency, duration) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(
      frequency,
      this.audioContext.currentTime
    );
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Aliases for compatibility
  async navigation() {
    return this.buttonClick();
  }
  async timeWarning() {
    return this.playTone(1000, 0.1);
  }
  async quizComplete() {
    return this.correctAnswer();
  }
  async achievement() {
    return this.correctAnswer();
  }
}

// Create singleton instance
const simpleAudioService = new SimpleAudioService();

export default simpleAudioService;
