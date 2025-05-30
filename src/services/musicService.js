// src/services/musicService.js - จัดการเพลง Background (ใช้ชื่อไฟล์ง่ายขึ้น)
class MusicService {
  constructor() {
    this.quizMusic = null;
    this.menuMusic = null;
    this.currentMusic = null;
    this.isPlaying = false;
    this.volume = 0.3; // ระดับเสียงเริ่มต้น (30%)
    this.initialized = false;
    // ✅ เปลี่ยนเป็นชื่อไฟล์ที่ง่ายขึ้น
    this.musicPath = "/quiz-music.mp3"; // เปลี่ยนชื่อไฟล์ให้ง่ายขึ้น
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log("🎵 Initializing music service...");
      console.log("🎵 Music file path:", this.musicPath);

      // สร้าง Audio objects
      this.quizMusic = new Audio(this.musicPath);

      // ตั้งค่าเพลง
      this.quizMusic.loop = true;
      this.quizMusic.volume = this.volume;
      this.quizMusic.preload = "auto";

      // Event listeners สำหรับ debug
      this.quizMusic.addEventListener("loadstart", () => {
        console.log("🎵 Music loading started...");
      });

      this.quizMusic.addEventListener("canplay", () => {
        console.log("✅ Music can start playing");
      });

      this.quizMusic.addEventListener("canplaythrough", () => {
        console.log("✅ Music ready to play through");
      });

      this.quizMusic.addEventListener("error", (e) => {
        console.error("❌ Quiz music load failed:", e);
        console.error("❌ Error details:", {
          error: e.target.error,
          code: e.target.error?.code,
          message: e.target.error?.message,
          src: e.target.src,
        });
      });

      this.quizMusic.addEventListener("loadeddata", () => {
        console.log("✅ Music data loaded successfully");
      });

      // ลองโหลดไฟล์ก่อน
      await this.testMusicFile();

      this.initialized = true;
      console.log("✅ Music service initialized");
    } catch (error) {
      console.error("❌ Music service initialization failed:", error);
    }
  }

  // ฟังก์ชันทดสอบการโหลดไฟล์
  async testMusicFile() {
    return new Promise((resolve) => {
      if (!this.quizMusic) {
        console.error("❌ Quiz music object not created");
        resolve(false);
        return;
      }

      const timeout = setTimeout(() => {
        console.warn("⚠️ Music file load timeout (10s)");
        resolve(false);
      }, 10000);

      const onLoad = () => {
        clearTimeout(timeout);
        console.log("✅ Music file loaded successfully");
        this.quizMusic.removeEventListener("canplaythrough", onLoad);
        this.quizMusic.removeEventListener("error", onError);
        resolve(true);
      };

      const onError = (e) => {
        clearTimeout(timeout);
        console.error("❌ Music file failed to load:", e);
        this.quizMusic.removeEventListener("canplaythrough", onLoad);
        this.quizMusic.removeEventListener("error", onError);
        resolve(false);
      };

      this.quizMusic.addEventListener("canplaythrough", onLoad);
      this.quizMusic.addEventListener("error", onError);

      // เริ่มโหลด
      this.quizMusic.load();
    });
  }

  async playQuizMusic() {
    if (!this.initialized) await this.initialize();

    try {
      // หยุดเพลงอื่นที่เล่นอยู่
      this.stopAll();

      if (this.quizMusic) {
        console.log("🎵 Attempting to play quiz music...");
        console.log("🎵 Music ready state:", this.quizMusic.readyState);
        console.log("🎵 Music duration:", this.quizMusic.duration);

        // ตรวจสอบว่าไฟล์พร้อมเล่นหรือไม่
        if (this.quizMusic.readyState >= 2) {
          // HAVE_CURRENT_DATA
          this.quizMusic.currentTime = 0;
          await this.quizMusic.play();
          this.currentMusic = this.quizMusic;
          this.isPlaying = true;
          console.log("✅ Quiz music started playing");
          return true;
        } else {
          console.warn("⚠️ Music not ready yet, trying to load...");

          // ลองโหลดใหม่
          return new Promise((resolve) => {
            const onReady = async () => {
              try {
                this.quizMusic.currentTime = 0;
                await this.quizMusic.play();
                this.currentMusic = this.quizMusic;
                this.isPlaying = true;
                console.log("✅ Quiz music started playing (after load)");
                resolve(true);
              } catch (playError) {
                console.error("❌ Failed to play after load:", playError);
                resolve(false);
              }
              this.quizMusic.removeEventListener("canplaythrough", onReady);
            };

            this.quizMusic.addEventListener("canplaythrough", onReady);
            this.quizMusic.load();

            // Timeout หลัง 5 วินาที
            setTimeout(() => {
              this.quizMusic.removeEventListener("canplaythrough", onReady);
              console.warn("⚠️ Music load timeout");
              resolve(false);
            }, 5000);
          });
        }
      } else {
        console.error("❌ Quiz music object not available");
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to play quiz music:", error);

      // เพิ่มข้อมูล error เพิ่มเติม
      if (error.name === "NotAllowedError") {
        console.warn(
          "⚠️ Autoplay blocked by browser. User interaction required."
        );
      } else if (error.name === "NotSupportedError") {
        console.warn("⚠️ Audio format not supported by browser.");
      }

      return false;
    }
  }

  async playMenuMusic() {
    // สำหรับตอนนี้ใช้เพลงเดียวกัน แต่สามารถเพิ่มเพลงอื่นได้
    return this.playQuizMusic();
  }

  stop() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
      this.isPlaying = false;
      console.log("🔇 Music stopped");
    }
  }

  stopAll() {
    if (this.quizMusic) {
      this.quizMusic.pause();
      this.quizMusic.currentTime = 0;
    }
    this.currentMusic = null;
    this.isPlaying = false;
  }

  pause() {
    if (this.currentMusic && this.isPlaying) {
      this.currentMusic.pause();
      this.isPlaying = false;
      console.log("⏸️ Music paused");
    }
  }

  resume() {
    if (this.currentMusic && !this.isPlaying) {
      this.currentMusic
        .play()
        .then(() => {
          this.isPlaying = true;
          console.log("▶️ Music resumed");
        })
        .catch((error) => {
          console.warn("❌ Failed to resume music:", error);
        });
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else if (this.currentMusic) {
      this.resume();
    } else {
      this.playQuizMusic();
    }
    return this.isPlaying;
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume)); // 0-1
    if (this.quizMusic) this.quizMusic.volume = this.volume;
    if (this.menuMusic) this.menuMusic.volume = this.volume;
    console.log("🔊 Volume set to:", Math.round(this.volume * 100) + "%");
  }

  getVolume() {
    return this.volume;
  }

  isCurrentlyPlaying() {
    return this.isPlaying && this.currentMusic && !this.currentMusic.paused;
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าไฟล์มีอยู่หรือไม่
  async checkMusicFile() {
    try {
      console.log("🔍 Checking if music file exists...");
      const response = await fetch(this.musicPath, { method: "HEAD" });

      if (response.ok) {
        console.log("✅ Music file exists and accessible");
        console.log("📄 File info:", {
          status: response.status,
          contentType: response.headers.get("content-type"),
          contentLength: response.headers.get("content-length"),
        });
        return true;
      } else {
        console.error(
          "❌ Music file not accessible:",
          response.status,
          response.statusText
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error checking music file:", error);
      return false;
    }
  }

  // ฟังก์ชันสำหรับ fade in/out
  async fadeIn(duration = 1000) {
    if (!this.currentMusic) return;

    const startVolume = 0;
    const endVolume = this.volume;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = (endVolume - startVolume) / steps;

    this.currentMusic.volume = startVolume;

    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        if (this.currentMusic) {
          this.currentMusic.volume = Math.min(
            startVolume + volumeStep * i,
            endVolume
          );
        }
      }, stepTime * i);
    }
  }

  async fadeOut(duration = 1000) {
    if (!this.currentMusic) return;

    const startVolume = this.currentMusic.volume;
    const endVolume = 0;
    const steps = 50;
    const stepTime = duration / steps;
    const volumeStep = (startVolume - endVolume) / steps;

    for (let i = 0; i <= steps; i++) {
      setTimeout(() => {
        if (this.currentMusic) {
          this.currentMusic.volume = Math.max(
            startVolume - volumeStep * i,
            endVolume
          );
          if (i === steps) {
            this.stop();
          }
        }
      }, stepTime * i);
    }
  }
}

// สร้าง singleton instance
const musicService = new MusicService();

export default musicService;
