import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import type { DecorModel as DecorModelData } from "../../data/content";

/**
 * Pure visual decor — no collision, no halo, no interaction.
 * Used for props like the Lamborghini that are part of the scene dressing.
 */
export function DecorModel({ model }: { model: DecorModelData }) {
  const { modelUrl, position, rotation = 0, targetHeight = 1.4 } = model;

  const gltf = useGLTF(modelUrl);
  const cloned = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);

  useLayoutEffect(() => {
    cloned.rotation.set(0, 0, 0);
    cloned.position.set(0, 0, 0);
    cloned.scale.setScalar(1);
    cloned.updateMatrixWorld(true);

    const probe = new THREE.Box3().setFromObject(cloned, true);
    const size = new THREE.Vector3();
    probe.getSize(size);
    if (size.y <= 0) return;

    const k = targetHeight / size.y;
    cloned.scale.setScalar(k);
    cloned.updateMatrixWorld(true);

    const fitted = new THREE.Box3().setFromObject(cloned, true);
    const center = new THREE.Vector3();
    fitted.getCenter(center);
    cloned.position.set(-center.x, -fitted.min.y, -center.z);
    cloned.updateMatrixWorld(true);

    cloned.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.frustumCulled = true;
    });
  }, [cloned, targetHeight]);

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <primitive object={cloned} />
    </group>
  );
}
