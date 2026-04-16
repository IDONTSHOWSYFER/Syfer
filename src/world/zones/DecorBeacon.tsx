import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import type { DecorBeacon as Beacon } from "../../data/content";
import { useGameStore } from "../../state/gameStore";

/**
 * Floating interaction beacon tied to a decor element (desk, wall, prop).
 *
 * Visual: a glowing orb with a slim halo ring, a small label + hint bubble
 * on top. Pressing E while inside its trigger radius opens the linked
 * content zone. Used for content that doesn't have an NPC
 * (stack & socials).
 *
 * Collision: a small ball collider as a sensor so the beacon itself never
 * blocks movement; range detection lives in Syfer.tsx.
 */
export function DecorBeacon({ beacon }: { beacon: Beacon }) {
  const orbRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  const activeZone = useGameStore((s) => s.activeZone);
  const visited = useGameStore((s) => s.visitedZones.has(beacon.zoneId));
  const isActive = activeZone === beacon.zoneId;

  const color = useMemo(() => new THREE.Color(beacon.color), [beacon.color]);

  useFrame((state) => {
    const t = state.clock.elapsedTime + beacon.position[0] * 0.3;
    if (orbRef.current) {
      orbRef.current.position.y = Math.sin(t * 2.2) * 0.12;
      const s = isActive ? 1.25 + Math.sin(t * 5) * 0.08 : 1;
      orbRef.current.scale.set(s, s, s);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.9;
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity = isActive ? 0.9 : 0.55 + Math.sin(t * 2) * 0.15;
    }
  });

  return (
    <group position={beacon.position}>
      {/* Orb */}
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.28, 20, 16]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>

      {/* Halo ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[0.42, 0.6, 40]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.65}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Accent point light */}
      <pointLight color={color} intensity={2} distance={6} />

      {/* Floating label bubble */}
      <Billboard follow lockX lockZ position={[0, 0.95, 0]}>
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[3.2, 0.9]} />
          <meshBasicMaterial color="#0a0418" transparent opacity={0.65} />
        </mesh>
        <Text
          fontSize={0.26}
          color={color}
          anchorX="center"
          anchorY="middle"
          position={[0, 0.15, 0]}
          outlineWidth={0.018}
          outlineColor="#000"
        >
          {beacon.label}
        </Text>
        <Text
          fontSize={0.17}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          position={[0, -0.17, 0]}
          outlineWidth={0.012}
          outlineColor="#000"
          maxWidth={3}
        >
          {isActive ? "press E to open" : beacon.hint}
        </Text>
      </Billboard>

      {/* Visited checkmark */}
      {visited && (
        <Billboard follow lockX lockZ position={[0.55, 0.55, 0]}>
          <Text
            fontSize={0.22}
            color="#00ff9c"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.018}
            outlineColor="#000"
          >
            ✓
          </Text>
        </Billboard>
      )}

      {/* Range detection is handled by distance check in Syfer.tsx —
          no physics collider needed here (and this component lives
          outside <Physics> anyway). */}
    </group>
  );
}
