import { Howl } from "howler";
import { MUSIC_TRACKS, type MusicTrack } from "../data/content";

/**
 * Audio system for Syfer World.
 *  - Howler-based music player with a playlist (tracks live in /public/music/).
 *  - WebAudio blip for UI confirmations (no asset needed).
 *  - All state is centralised here so the UI just calls methods.
 *
 * The player tolerates "no track selected" — that's how the user
 * picks "no music".
 */

type Listener = (state: PlayerSnapshot) => void;

export type PlayerSnapshot = {
  trackId: string | null;
  isPlaying: boolean;
  muted: boolean;
  volume: number;
  tracks: MusicTrack[];
};

class SoundManagerImpl {
  private howl: Howl | null = null;
  private currentId: string | null = null;
  private playing = false;
  private muted = false;
  private volume = 0.55;
  private listeners = new Set<Listener>();

  // Tiny WebAudio context for the UI blip — created lazily so the page
  // never instantiates audio before the first user gesture.
  private blipCtx: AudioContext | null = null;

  private snapshot(): PlayerSnapshot {
    return {
      trackId: this.currentId,
      isPlaying: this.playing,
      muted: this.muted,
      volume: this.volume,
      tracks: MUSIC_TRACKS,
    };
  }

  private notify() {
    const s = this.snapshot();
    this.listeners.forEach((l) => l(s));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): PlayerSnapshot {
    return this.snapshot();
  }

  /** Plays the track by id (loads on demand). Pass null to clear. */
  selectTrack(id: string | null) {
    if (id === this.currentId) {
      // Toggle play/pause if same track tapped again.
      if (this.playing) this.pause();
      else this.play();
      return;
    }
    this.stop();
    this.currentId = id;
    if (id == null) {
      this.notify();
      return;
    }
    const track = MUSIC_TRACKS.find((t) => t.id === id);
    if (!track) {
      this.notify();
      return;
    }
    this.howl = new Howl({
      src: [track.src],
      html5: true, // stream long files
      volume: this.muted ? 0 : this.volume,
      onend: () => this.next(),
      onloaderror: () => {
        this.playing = false;
        this.notify();
      },
      onplayerror: () => {
        // Try to recover after a user gesture.
        if (this.howl) {
          this.howl.once("unlock", () => this.howl?.play());
        }
      },
    });
    this.howl.play();
    this.playing = true;
    this.notify();
  }

  play() {
    if (!this.howl) {
      // Auto-pick the first track if nothing is selected.
      this.selectTrack(MUSIC_TRACKS[0]?.id ?? null);
      return;
    }
    this.howl.play();
    this.playing = true;
    this.notify();
  }

  pause() {
    if (!this.howl) return;
    this.howl.pause();
    this.playing = false;
    this.notify();
  }

  stop() {
    if (this.howl) {
      this.howl.stop();
      this.howl.unload();
      this.howl = null;
    }
    this.playing = false;
  }

  next() {
    if (MUSIC_TRACKS.length === 0) return;
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.currentId);
    const nextIdx = (idx + 1) % MUSIC_TRACKS.length;
    this.selectTrack(MUSIC_TRACKS[nextIdx].id);
  }

  prev() {
    if (MUSIC_TRACKS.length === 0) return;
    const idx = MUSIC_TRACKS.findIndex((t) => t.id === this.currentId);
    const prevIdx = (idx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    this.selectTrack(MUSIC_TRACKS[prevIdx].id);
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.howl && !this.muted) this.howl.volume(this.volume);
    this.notify();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.howl) this.howl.volume(muted ? 0 : this.volume);
    this.notify();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
  }

  isMuted() {
    return this.muted;
  }

  // ------------------------------------------------------------------
  // Tiny UI blip (WebAudio, no assets)
  // ------------------------------------------------------------------
  private ensureBlipCtx() {
    if (!this.blipCtx) {
      type WithWebkit = typeof window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const Ctor: typeof AudioContext =
        window.AudioContext || (window as WithWebkit).webkitAudioContext!;
      this.blipCtx = new Ctor();
    }
    return this.blipCtx;
  }

  playBlip(freq = 660) {
    if (this.muted) return;
    try {
      const ctx = this.ensureBlipCtx();
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0005, ctx.currentTime + 0.15);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.frequency.exponentialRampToValueAtTime(freq * 1.6, ctx.currentTime + 0.12);
      o.stop(ctx.currentTime + 0.2);
    } catch {
      // Silently ignore — audio context can fail before user gesture.
    }
  }

  /** Legacy compat with App.tsx — no-op now that ambient is replaced by music. */
  startAmbient() {
    /* music is opt-in via the picker */
  }
}

export const SoundManager = new SoundManagerImpl();
