import { useGameStore } from "../state/gameStore";
import { INTRO_CONFIG } from "../data/content";

/**
 * Entry screen: big title, teaser, "enter" button.
 * The 3D scene is still rendering in the background so it feels alive.
 */
export function IntroScreen() {
  const start = useGameStore((s) => s.start);
  const isMobile = useGameStore((s) => s.isMobile);

  return (
    <div className="intro-root">
      <div className="intro-backdrop" />
      <div className="intro-content">
        <div className="intro-badge">NEURAL PRESENTS</div>
        <h1 className="intro-title">{INTRO_CONFIG.title}</h1>
        <div className="intro-sub">{INTRO_CONFIG.subtitle}</div>
        <button className="intro-btn" onClick={start}>
          ▶ enter
        </button>
        <div className="intro-hint">
          {isMobile ? INTRO_CONFIG.mobileHint : INTRO_CONFIG.hint}
        </div>
      </div>
    </div>
  );
}
