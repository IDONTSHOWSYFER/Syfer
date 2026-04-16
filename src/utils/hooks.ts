import { useEffect, useRef } from "react";
import { useGameStore } from "../state/gameStore";

/** Detect mobile / coarse pointer once on mount. */
export function useDetectMobile() {
  const setIsMobile = useGameStore((s) => s.setIsMobile);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => {
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const hover = window.matchMedia("(hover: hover)").matches;
      const narrow = window.innerWidth < 820;
      // Treat as mobile only when it's a touch device without hover, or a narrow screen.
      setIsMobile((coarse && !hover) || narrow);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [setIsMobile]);
}

/**
 * Keyboard controller: listens for WASD / ZQSD / arrow keys + E / Space
 * and writes move vector + interact triggers into the game store.
 */
export function useKeyboardControls() {
  const setMove = useGameStore((s) => s.setMove);
  const triggerInteract = useGameStore((s) => s.triggerInteract);
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const mapDir = () => {
      const k = keys.current;
      const up = k["w"] || k["z"] || k["arrowup"];
      const down = k["s"] || k["arrowdown"];
      const left = k["a"] || k["q"] || k["arrowleft"];
      const right = k["d"] || k["arrowright"];
      let x = 0;
      let y = 0;
      if (up) y -= 1;
      if (down) y += 1;
      if (left) x -= 1;
      if (right) x += 1;
      // Normalize diagonal
      const len = Math.hypot(x, y);
      if (len > 0) {
        x /= len;
        y /= len;
      }
      setMove({ x, y });
    };

    const handleDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "e" || k === "enter") {
        triggerInteract();
        return;
      }
      keys.current[k] = true;
      mapDir();
    };
    const handleUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keys.current[k] = false;
      mapDir();
    };
    const handleBlur = () => {
      keys.current = {};
      setMove({ x: 0, y: 0 });
    };

    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [setMove, triggerInteract]);
}
