import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * Subtle white dust motes — lightweight atmosphere.
 * Single draw call via Points, minimal per-frame work.
 */
export function Particles({ count = 60 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, offsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const off = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = Math.random() * 8 + 0.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      off[i] = Math.random() * Math.PI * 2;
    }
    return { positions: pos, offsets: off };
  }, [count]);

  useFrame((state) => {
    const p = pointsRef.current;
    if (!p) return;
    const t = state.clock.elapsedTime;
    const attr = p.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] =
        ((arr[i * 3 + 1] + 0.005) % 8) +
        Math.sin(t * 0.3 + offsets[i]) * 0.001;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.08}
        sizeAttenuation
        transparent
        opacity={0.4}
        toneMapped={false}
        depthWrite={false}
      />
    </points>
  );
}
