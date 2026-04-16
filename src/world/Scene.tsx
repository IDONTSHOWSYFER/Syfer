import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

import { Location } from "./environment/Location";
import { Particles } from "./environment/Particles";
import { Syfer } from "./player/Syfer";
import { Npc } from "./npcs/Npc";
import { ComputerObject } from "./props/ComputerObject";
import { DecorModel } from "./props/DecorModel";

import { NPCS, DECOR_MODELS } from "../data/content";

/**
 * Main 3D scene composition.
 *
 * Interaction model:
 *  - 3 NPCs (Iara, Banana, Jesus) — dialogue only, no zone modals.
 *  - 1 computer object — opens the immersive terminal UI with all zones.
 */
export function Scene() {
  return (
    <>
      {/* Bright outdoor-style lighting for the Bikini Bottom map */}
      <ambientLight intensity={1.4} color="#b8d4ff" />
      <hemisphereLight args={["#87ceeb", "#3a6b4f", 0.8]} />
      <directionalLight position={[20, 30, 10]} intensity={1.8} color="#fff5d6" />
      <directionalLight position={[-18, 20, -14]} intensity={0.7} color="#7ec8ff" />

      {/* Deep ocean blue background — no black edges */}
      <color attach="background" args={["#001a33"]} />
      <fog attach="fog" args={["#001a33", 80, 350]} />

      <Suspense fallback={null}>
        <Physics gravity={[0, -24, 0]} timeStep={1 / 60}>
          <Location />

          <Syfer />

          {NPCS.map((n) => (
            <Npc key={n.id} character={n} />
          ))}

          {DECOR_MODELS.map((d) => (
            <DecorModel key={d.id} model={d} />
          ))}

          <ComputerObject />
        </Physics>

        <Particles />
      </Suspense>

      {/* Post-processing */}
      <EffectComposer multisampling={0} enableNormalPass={false}>
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.7}
          luminanceSmoothing={0.85}
          mipmapBlur
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.5} />
      </EffectComposer>
    </>
  );
}
