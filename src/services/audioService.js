// src/services/audioService.js
import * as Tone from "tone";

class AudioService {
  constructor() {
    this.initialized = false;
    this.synths = {};
    this.backgroundMusic = null;
    this.musicPlaying = false;
  }

  async initialize() {
    if (this.initialized || !window.Tone) return;

    try {
      // Start audio context - MUST be called after user interaction
      if (Tone.context.state !== "running") {
        console.log("🎵 Starting audio context...");
        await Tone.start();
        console.log("✅ Audio context started successfully");
      }

      // Create synthesizers
      this.synths = {
        click: new Tone.Synth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        }).toDestination(),

        success: new Tone.PolySynth({
          oscillator: { type: "triangle" },
          envelope: { attack: 0.02, decay: 0.2, sustain: 0.3, release: 0.8 },
        }).toDestination(),

        error: new Tone.Synth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.05, decay: 0.3, sustain: 0, release: 0.2 },
        }).toDestination(),

        celebration: new Tone.PolySynth({
          oscillator: { type: "sawtooth" },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 1 },
        }).toDestination(),

        timer: new Tone.Synth({
          oscillator: { type: "sine" },
          envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        }).toDestination(),
      };

      // Create background music synth
      this.backgroundMusic = new Tone.PolySynth({
        oscillator: { type: "triangle" },
        envelope: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 2 },
      }).toDestination();

      // Set volume for background music
      this.backgroundMusic.volume.value = -25; // Much quieter for background

      this.initialized = true;
      console.log("🎵 Audio system initialized!");
    } catch (error) {
      console.warn("Audio initialization failed:", error);
    }
  }

  async playSound(type, options = {}) {
    try {
      if (!this.initialized) await this.initialize();
      if (!window.Tone || !this.synths[type]) return;

      const now = Tone.now();
      const { volume = 0.7, delay = 0 } = options;

      // Adjust volume
      const volumeDb = -20 + volume * 15;

      switch (type) {
        case "click":
          this.synths.click.volume.value = volumeDb;
          this.synths.click.triggerAttackRelease("C5", "0.1", now + delay);
          break;

        case "success":
          this.synths.success.volume.value = volumeDb;
          this.synths.success.triggerAttackRelease(
            ["C4", "E4", "G4"],
            "0.4",
            now + delay
          );
          setTimeout(() => {
            this.synths.success.triggerAttackRelease(
              ["D4", "F#4", "A4"],
              "0.3",
              now + delay + 0.2
            );
          }, 200);
          break;

        case "error":
          this.synths.error.volume.value = volumeDb;
          this.synths.error.triggerAttackRelease("C3", "0.3", now + delay);
          break;

        case "celebration":
          this.synths.celebration.volume.value = volumeDb;
          const melody = ["C5", "E5", "G5", "C6"];
          melody.forEach((note, i) => {
            this.synths.celebration.triggerAttackRelease(
              note,
              "0.2",
              now + delay + i * 0.1
            );
          });
          break;

        case "timer":
          this.synths.timer.volume.value = volumeDb - 5;
          this.synths.timer.triggerAttackRelease("G4", "0.1", now + delay);
          break;
      }
    } catch (error) {
      console.warn("Sound play failed:", error);
    }
  }

  // Convenience methods
  async buttonClick() {
    return this.playSound("click", { volume: 0.5 });
  }

  async correctAnswer() {
    return this.playSound("success", { volume: 0.8 });
  }

  async wrongAnswer() {
    return this.playSound("error", { volume: 0.6 });
  }

  async quizComplete() {
    return this.playSound("celebration", { volume: 1.0 });
  }

  async timeWarning() {
    return this.playSound("timer", { volume: 0.4 });
  }

  async navigation() {
    return this.playSound("click", { volume: 0.3 });
  }

  async achievement() {
    await this.playSound("celebration");
    setTimeout(() => this.playSound("success", { volume: 0.2 }), 500);
  }

  // Background Music Methods
  async startBackgroundMusic() {
    try {
      if (!this.initialized) await this.initialize();
      if (!this.backgroundMusic || this.musicPlaying) return;

      console.log("🎵 Starting background music...");
      this.musicPlaying = true;
      this.playBackgroundLoop();
    } catch (error) {
      console.warn("Background music failed:", error);
    }
  }

  stopBackgroundMusic() {
    console.log("🔇 Stopping background music...");
    this.musicPlaying = false;
    if (this.backgroundMusic) {
      this.backgroundMusic.releaseAll();
    }
  }

  playBackgroundLoop() {
    if (!this.musicPlaying || !this.backgroundMusic) return;

    // Simple and peaceful chord progression
    const chords = [
      ["C4", "E4", "G4"], // C major
      ["A3", "C4", "E4"], // A minor
      ["F3", "A3", "C4"], // F major
      ["G3", "B3", "D4"], // G major
    ];

    let chordIndex = 0;

    const playNextChord = () => {
      if (!this.musicPlaying || !this.backgroundMusic) return;

      try {
        const chord = chords[chordIndex];
        this.backgroundMusic.triggerAttackRelease(chord, "1n", Tone.now());

        chordIndex = (chordIndex + 1) % chords.length;

        // Schedule next chord (every 3 seconds for peaceful tempo)
        setTimeout(playNextChord, 3000);
      } catch (error) {
        console.warn("Chord play error:", error);
      }
    };

    playNextChord();
  }

  toggleBackgroundMusic() {
    if (this.musicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.musicPlaying;
  }
}

// Create singleton instance
const audioService = new AudioService();

export default audioService;
