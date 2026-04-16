import { useEffect, useRef } from "react";
import nipplejs from "nipplejs";
import { useGameStore } from "../state/gameStore";
import { NPCS } from "../data/content";

/**
 * Virtual joystick for mobile using nipplejs v1.
 * Also renders a contextual interact button on the right side.
 * Jump is handled by a quick tap on the canvas (see Syfer.tsx touch handler).
 */
type Collection = ReturnType<typeof nipplejs.create>;

export function MobileJoystick() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<Collection | null>(null);
  const setMove = useGameStore((s) => s.setMove);
  const triggerInteract = useGameStore((s) => s.triggerInteract);
  const isMobile = useGameStore((s) => s.isMobile);
  const activeNpc = useGameStore((s) => s.activeNpc);
  const activeComputer = useGameStore((s) => s.activeComputer);

  useEffect(() => {
    if (!isMobile || !zoneRef.current) return;

    const manager = nipplejs.create({
      zone: zoneRef.current,
      mode: "static",
      position: { left: "80px", bottom: "80px" },
      color: "#00e1ff",
      size: 120,
      restOpacity: 0.7,
    });
    managerRef.current = manager;

    // nipplejs v1 uses InternalEvent — single-arg callback with { data }
    manager.on("move", (evt) => {
      const data = evt.data;
      if (!data?.vector) return;
      // vector.y positive = up, flip to match our 2D input (y+ = forward)
      setMove({ x: data.vector.x, y: -data.vector.y });
    });
    manager.on("end", () => {
      setMove({ x: 0, y: 0 });
    });

    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, [isMobile, setMove]);

  if (!isMobile) return null;

  // Contextual label for the action button: tells the player what they'll do.
  let actionLabel = "TAP";
  let actionEnabled = false;
  if (activeComputer) {
    actionLabel = "KNOCK";
    actionEnabled = true;
  } else if (activeNpc) {
    const npc = NPCS.find((n) => n.id === activeNpc);
    actionLabel = npc ? `TALK` : "TALK";
    actionEnabled = true;
  }

  return (
    <>
      <div ref={zoneRef} className="joystick-zone" />
      {/* Contextual interact button */}
      <button
        className={`mobile-action-btn ${actionEnabled ? "enabled" : "disabled"}`}
        onTouchStart={(e) => {
          e.preventDefault();
          if (actionEnabled) triggerInteract();
        }}
        onClick={() => {
          if (actionEnabled) triggerInteract();
        }}
      >
        {actionLabel}
      </button>
    </>
  );
}
