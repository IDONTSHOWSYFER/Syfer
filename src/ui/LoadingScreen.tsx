import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";

/**
 * Loading overlay shown until all Suspense-loaded assets resolve.
 * Uses drei's useProgress hook plus a local "done" latch so the screen
 * doesn't flash at 0% before anything actually starts loading.
 */
export function LoadingScreen() {
  const { active, progress } = useProgress();
  const [done, setDone] = useState(false);

  // Once loading has actively started and completed, latch to hidden.
  useEffect(() => {
    if (!active && progress >= 100) {
      const t = setTimeout(() => setDone(true), 250);
      return () => clearTimeout(t);
    }
  }, [active, progress]);

  if (done) return null;
  // Before the first loader kicks in there is nothing meaningful to show.
  if (!active && progress === 0) return null;

  return (
    <div className="loading-root">
      <div className="loading-card">
        <div className="loading-title">booting neural…</div>
        <div className="loading-bar">
          <div className="loading-bar-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="loading-pct">{Math.floor(progress)}%</div>
        <div className="loading-tip">tip: visit every portal for a clean run</div>
      </div>
    </div>
  );
}
