import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RigidBody, CapsuleCollider } from "@react-three/rapier";
import { useGameStore } from "../../state/gameStore";
import type { NpcCharacter } from "../../data/content";

/**
 * GLB-based NPC.
 *  - Auto-fits the model to a target height
 *  - Plays an "idle" animation by default; switches to a "talk" animation
 *    while the player is talking to them, then snaps back to idle.
 *  - Floats a name + idle hint bubble above the head — disappears after
 *    the player has talked to them at least once (per the gameStore).
 *  - Soft accent ground ring that pulses while the player is in range.
 */

export type NpcProps = {
  character: NpcCharacter;
};

export function Npc({ character }: NpcProps) {
  const {
    id,
    accent,
    modelUrl,
    rotation = 0,
    scale = 1,
    targetHeight = 2,
    position,
  } = character;

  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const playerPosition = useGameStore((s) => s.playerPosition);

  const activeNpc = useGameStore((s) => s.activeNpc);
  const openNpc = useGameStore((s) => s.openNpc);
  const isActive = activeNpc === id;
  const isTalking = openNpc === id;

  const gltf = useGLTF(modelUrl);
  const cloned = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions, names } = useAnimations(gltf.animations, cloned);

  // Pick idle/talk clip names from whatever the GLB ships with.
  const idleClip = useMemo(() => pickClip(names, IDLE_HINTS) ?? names[0], [names]);
  const talkClip = useMemo(
    () => pickClip(names, TALK_HINTS) ?? names[1] ?? names[0],
    [names]
  );

  // Auto-fit the model: scale to targetHeight, sit on the floor, recentre X/Z.
  // Skinned meshes need `precise=true` on setFromObject so vertex positions
  // (not just geometry bboxes) are walked — otherwise Iara-style rigs can
  // return bounds with the head clipped off.
  useLayoutEffect(() => {
    cloned.rotation.y = 0;
    cloned.position.set(0, 0, 0);
    cloned.scale.setScalar(1);
    cloned.updateMatrixWorld(true);

    const probe = new THREE.Box3().setFromObject(cloned, true);
    const size = new THREE.Vector3();
    probe.getSize(size);
    if (size.y <= 0) return;
    const k = (targetHeight / size.y) * scale;
    cloned.scale.setScalar(k);
    cloned.updateMatrixWorld(true);

    const fitted = new THREE.Box3().setFromObject(cloned, true);
    const center = new THREE.Vector3();
    fitted.getCenter(center);
    cloned.position.set(-center.x, -fitted.min.y, -center.z);
    // Don't set rotation here — rotation is handled by groupRef in useFrame
    cloned.updateMatrixWorld(true);

    // Make sure materials don't disappear in the dim location lighting.
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = true;
      const m = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[] | undefined;
      const bump = (mat: THREE.MeshStandardMaterial) => {
        if (!mat) return;
        if ("emissiveIntensity" in mat && mat.emissive && mat.emissive.getHex() === 0) {
          mat.emissive = new THREE.Color(accent).multiplyScalar(0.15);
          mat.emissiveIntensity = 0.4;
        }
      };
      if (Array.isArray(m)) m.forEach(bump);
      else if (m) bump(m);
    });
  }, [cloned, targetHeight, scale, rotation, accent]);

  // Animation switching: idle <-> talk based on store state.
  useEffect(() => {
    if (!actions || names.length === 0) return;
    const target = isTalking ? talkClip : idleClip;
    if (!target) return;
    const action = actions[target];
    if (!action) return;
    // Stop everything else
    Object.entries(actions).forEach(([n, a]) => {
      if (!a) return;
      if (n === target) return;
      a.fadeOut(0.25);
    });
    action.reset().fadeIn(0.25).setEffectiveTimeScale(1).setEffectiveWeight(1).play();
  }, [actions, names, isTalking, talkClip, idleClip]);

  // Procedural idle bob — extra life when there is no anim or when the
  // single anim is just a static T-pose.
  useFrame((state) => {
    const t = state.clock.elapsedTime + position[0];
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.6) * 0.04;
      // Subtle swing — stop swinging once you're talking, head turns toward player.
      if (!isTalking) {
        groupRef.current.rotation.y = rotation + Math.sin(t * 0.3) * 0.15;
      } else {
        // Face the player
        const dx = playerPosition[0] - position[0];
        const dz = playerPosition[2] - position[2];
        const targetAngle = Math.atan2(dx, dz);
        let diff = targetAngle - groupRef.current.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        groupRef.current.rotation.y += diff * 0.1;
      }
    }
    if (ringRef.current) {
      const target = isActive ? 1 : 0.45;
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity += (target * 0.7 - m.opacity) * 0.1;
      const s = isActive ? 1.1 + Math.sin(t * 4) * 0.08 : 1;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      <RigidBody type="fixed" colliders={false}>
        <CapsuleCollider args={[0.55, 0.5]} position={[0, 1.1, 0]} />
      </RigidBody>

      {/* Highlight ring on the ground */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
      >
        <ringGeometry args={[0.9, 1.25, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.45}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Soft accent fill so the model isn't black in dim rooms. */}
      <pointLight position={[0, 2.4, 0.5]} color={accent} intensity={1.6} distance={6} />

      <group ref={groupRef}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

const IDLE_HINTS = ["idle", "breath", "stand", "base", "rest", "nlatrack", "afro", "boogie"];
const TALK_HINTS = ["talk", "speak", "hello", "wave", "salute", "nlatrack.001", "acrobatic", "super"];

function pickClip(names: string[], hints: string[]): string | undefined {
  for (const hint of hints) {
    const found = names.find((n) => n.toLowerCase().includes(hint));
    if (found) return found;
  }
  return undefined;
}
