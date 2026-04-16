import { useEffect, useState } from "react";
import { SoundManager, type PlayerSnapshot } from "../audio/SoundManager";

/**
 * Simple on/off music toggle button.
 * Single track ("Party Tunes") — click to play/pause.
 */
export function MusicPlayer() {
  const [snap, setSnap] = useState<PlayerSnapshot>(() => SoundManager.getState());

  useEffect(() => SoundManager.subscribe(setSnap), []);

  const handleToggle = () => {
    if (snap.isPlaying) {
      SoundManager.pause();
    } else {
      // Make sure the first track is selected
      if (snap.trackId == null && snap.tracks.length > 0) {
        SoundManager.selectTrack(snap.tracks[0].id);
      }
      SoundManager.play();
    }
  };

  return (
    <div className="music-root">
      <button
        className="music-toggle"
        onClick={handleToggle}
        aria-label={snap.isPlaying ? "pause music" : "play music"}
      >
        <span className="music-toggle-icon">
          {snap.isPlaying ? "♫" : "♪"}
        </span>
        <span className="music-toggle-text">
          {snap.isPlaying ? "ON" : "OFF"}
        </span>
      </button>
    </div>
  );
}
