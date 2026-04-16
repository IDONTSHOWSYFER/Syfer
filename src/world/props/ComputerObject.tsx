import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Text, Billboard } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useGameStore } from "../../state/gameStore";
import { COMPUTER_OBJECT } from "../../data/content";

/**
 * Interactive computer/desk setup placed in the room.
 * Pressing E near it opens the full-screen terminal UI
 * with tabs for all zones (stack, projects, blockchain,
 * business, trading, socials).
 */
export function ComputerObject() {
  const {
    modelUrl,
    position,
    scale: targetScale,
    label,
    hint,
    accent,
  } = COMPUTER_OBJECT;
  const yRotation = 0;

  const ringRef = useRef<THREE.Mesh>(null!);
  const activeComputer = useGameStore((s) => s.activeComputer);
  const terminalOpen = useGameStore((s) => s.terminalOpen);

  const gltf = useGLTF(modelUrl);
  const cloned = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);

  // Auto-fit: scale to a reasonable size, sit on floor, recentre.
  useLayoutEffect(() => {
    cloned.rotation.set(0, 0, 0);
    cloned.position.set(0, 0, 0);
    cloned.scale.setScalar(1);
    cloned.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(cloned, true);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.y <= 0) return;

    // Scale so the object is roughly targetScale world units tall
    const k = targetScale / Math.max(size.x, size.y, size.z);
    cloned.scale.setScalar(k);
    cloned.updateMatrixWorld(true);

    const fitted = new THREE.Box3().setFromObject(cloned, true);
    const center = new THREE.Vector3();
    fitted.getCenter(center);
    cloned.position.set(-center.x, -fitted.min.y, -center.z);
    cloned.updateMatrixWorld(true);

    // Boost emissive so it glows in the dark room
    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = true;
      const m = mesh.material as THREE.MeshStandardMaterial | undefined;
      if (m && "emissiveIntensity" in m) {
        if (m.emissive && m.emissive.getHex() === 0) {
          m.emissive = new THREE.Color(accent).multiplyScalar(0.1);
        }
        m.emissiveIntensity = Math.max(m.emissiveIntensity, 0.3);
      }
    });
  }, [cloned, targetScale, accent]);

  // Pulse the ring when player is near
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      const target = activeComputer ? 1 : 0.45;
      const m = ringRef.current.material as THREE.MeshBasicMaterial;
      m.opacity += (target * 0.7 - m.opacity) * 0.1;
      const s = activeComputer ? 1.2 + Math.sin(t * 4) * 0.08 : 1;
      ringRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position} rotation={[0, yRotation, 0]}>
      {/* Collision box so the player can't walk through */}
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[1.2, 0.8, 0.8]} position={[0, 0.8, 0]} />
      </RigidBody>

      {/* Highlight ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.06, 0]}
      >
        <ringGeometry args={[1.0, 1.5, 32]} />
        <meshBasicMaterial
          color={accent}
          transparent
          opacity={0.45}
          toneMapped={false}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Accent light */}
      <pointLight position={[0, 1.5, 0.5]} color={accent} intensity={2} distance={8} />

      {/* The model */}
      <primitive object={cloned} />

      {/* Floating label — hidden when terminal is open */}
      {!terminalOpen && (
        <Billboard follow lockX lockZ position={[0, 3.0, 0]}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[4, 1.05]} />
            <meshBasicMaterial color="#0a0418" transparent opacity={0.65} />
          </mesh>
          <Text
            fontSize={0.3}
            color={accent}
            anchorX="center"
            anchorY="middle"
            position={[0, 0.18, 0]}
            outlineWidth={0.02}
            outlineColor="#000"
          >
            {label}
          </Text>
          <Text
            fontSize={0.19}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            position={[0, -0.22, 0]}
            maxWidth={3.8}
            outlineWidth={0.014}
            outlineColor="#000"
          >
            {activeComputer ? "press E to open" : hint}
          </Text>
        </Billboard>
      )}
    </group>
  );
}

useGLTF.preload(COMPUTER_OBJECT.modelUrl);
