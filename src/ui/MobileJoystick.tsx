import { useEffect, useRef } from "react";
import nipplejs from "nipplejs";
import { useGameStore } from "../state/gameStore";

/**
 * Virtual joystick for mobile using nipplejs v1.
 * Also renders an E/interact button and a Jump button on the right side.
 */
type Collection = ReturnType<typeof nipplejs.create>;

export function MobileJoystick() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<Collection | null>(null);
  const setMove = useGameStore((s) => s.setMove);
  const triggerInteract = useGameStore((s) => s.triggerInteract);
  const isMobile = useGameStore((s) => s.isMobile);

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

  const handleJump = () => {
    // Dispatch a synthetic Space keydown to trigger jump
    window.dispatchEvent(
      new KeyboardEvent("keydown", { code: "Space", key: " ", bubbles: true }),
    );
  };

  return (
    <>
      <div ref={zoneRef} className="joystick-zone" />
      {/* Jump button */}
      <button
        className="mobile-jump-btn"
        onTouchStart={(e) => {
          e.preventDefault();
          handleJump();
        }}
      >
        ↑
      </button>
      {/* Interact button */}
      <button
        className="mobile-action-btn"
        onTouchStart={(e) => {
          e.preventDefault();
          triggerInteract();
        }}
        onClick={triggerInteract}
      >
        E
      </button>
    </>
  );
}
