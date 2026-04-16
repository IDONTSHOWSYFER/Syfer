import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { AdaptiveDpr } from "@react-three/drei";

import { Scene } from "./world/Scene";
import { IntroScreen } from "./ui/IntroScreen";
import { HUD } from "./ui/HUD";
import { ZoneModal } from "./ui/ZoneModal";
import { MobileJoystick } from "./ui/MobileJoystick";
import { LoadingScreen } from "./ui/LoadingScreen";
import { CompletionToast } from "./ui/CompletionToast";
import { NpcDialogue } from "./ui/NpcDialogue";
import { TerminalUI } from "./ui/TerminalUI";

import { useDetectMobile, useKeyboardControls } from "./utils/hooks";
import { useGameStore } from "./state/gameStore";
import { SoundManager } from "./audio/SoundManager";

function App() {
  useDetectMobile();
  useKeyboardControls();

  const phase = useGameStore((s) => s.phase);
  const openZone = useGameStore((s) => s.openZone);
  const interactPressed = useGameStore((s) => s.interactPressed);
  const isMobile = useGameStore((s) => s.isMobile);

  // Tiny UI confirmation when interacting with a portal.
  useEffect(() => {
    if (interactPressed > 0 && openZone) {
      SoundManager.playBlip(740);
    }
  }, [interactPressed, openZone]);

  // Prevent default touch behaviors that cause viewport issues
  useEffect(() => {
    const prevent = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    return () => document.removeEventListener("touchmove", prevent);
  }, []);

  return (
    <div className="app-root">
      <Canvas
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
          alpha: false,
        }}
        camera={{ position: [0, 8, 14], fov: 55, near: 0.3, far: 800 }}
        performance={{ min: 0.5 }}
        flat
      >
        <AdaptiveDpr pixelated />
        <Scene />
      </Canvas>

      <LoadingScreen />
      {phase === "intro" && <IntroScreen />}
      {phase === "playing" && (
        <>
          <HUD />
          <MobileJoystick />
          <ZoneModal />
          <NpcDialogue />
          <TerminalUI />
          <CompletionToast />
        </>
      )}
    </div>
  );
}

export default App;
