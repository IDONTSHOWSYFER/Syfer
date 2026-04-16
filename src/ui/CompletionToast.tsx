import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { ZONES } from "../data/content";

/**
 * Shows a celebratory toast the first time the player finishes all zones.
 */
export function CompletionToast() {
  const visited = useGameStore((s) => s.visitedZones);
  const [shown, setShown] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shown && visited.size === ZONES.length) {
      setShown(true);
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 5500);
      return () => clearTimeout(t);
    }
  }, [visited, shown]);

  if (!visible) return null;
  return (
    <div className="toast-root">
      <div className="toast-card">
        <div className="toast-emoji">🏆</div>
        <div className="toast-title">Run complete — all zones cleared</div>
        <div className="toast-sub">
          Nice one. The world is yours to re-explore.
        </div>
      </div>
    </div>
  );
}
