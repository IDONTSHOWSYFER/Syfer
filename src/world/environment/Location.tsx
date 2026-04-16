import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { RigidBody, TrimeshCollider, CuboidCollider } from "@react-three/rapier";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Loads the "Bikini Bottom" GLB as the world environment.
 *
 * The map is scaled so buildings are proportional to the 2.2-unit player,
 * then centred on the pineapple / squidward neighbourhood so the player
 * spawns inside the town.
 */

export const PLAY_HALF = 14;
export const WALL_HEIGHT = 10;
export const WALL_THICK = 1;

const GLB_URL = "/location/bikini_bottom.glb";

// Town centre in raw world-space coords (after GLB's embedded FBX matrix).
// Halfway between SpongeBob's pineapple and Squidward's house.
const TOWN_RAW_X = 0.72;
const TOWN_RAW_Z = 0.06;

// Makes the pineapple house ~4.5 units tall — proportional to the player.
const MAP_SCALE = 100;

export function Location() {
  const gltf = useGLTF(GLB_URL);

  const { visual, trimeshArgs } = useMemo(() => {
    const root = gltf.scene.clone(true) as THREE.Group;

    // Strip baked lights / cameras
    const toRemove: THREE.Object3D[] = [];
    root.traverse((obj) => {
      if ((obj as THREE.Light).isLight || (obj as THREE.Camera).isCamera) {
        toRemove.push(obj);
      }
    });
    toRemove.forEach((o) => o.parent?.remove(o));

    // Scale so buildings are proportional to the ~2-unit player
    root.updateMatrixWorld(true);
    root.scale.multiplyScalar(MAP_SCALE);
    root.updateMatrixWorld(true);

    // Find the pineapple house mesh to anchor the positioning
    let pineappleBox: THREE.Box3 | null = null;
    let squidwardBox: THREE.Box3 | null = null;
    root.traverse((obj) => {
      if (obj.name === "surface_house_spongebob2") {
        pineappleBox = new THREE.Box3().setFromObject(obj);
      }
      if (obj.name === "surface_house_squidward") {
        squidwardBox = new THREE.Box3().setFromObject(obj);
      }
    });

    // Town centre = midpoint between the two houses
    let townX: number, townZ: number, floorY: number;

    if (pineappleBox && squidwardBox) {
      const pC = new THREE.Vector3();
      const sC = new THREE.Vector3();
      (pineappleBox as THREE.Box3).getCenter(pC);
      (squidwardBox as THREE.Box3).getCenter(sC);
      townX = (pC.x + sC.x) / 2;
      townZ = (pC.z + sC.z) / 2;
      // Floor = bottom of pineapple house (its base sits on the ground)
      floorY = (pineappleBox as THREE.Box3).min.y;
    } else {
      townX = TOWN_RAW_X * MAP_SCALE;
      townZ = TOWN_RAW_Z * MAP_SCALE;
      floorY = 0;
    }

    // Reposition: town centre at XZ origin, floor at Y = 0
    root.position.set(-townX, -floorY, -townZ);
    root.updateMatrixWorld(true);

    // Build collision trimesh
    const geos: THREE.BufferGeometry[] = [];
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!mesh.isMesh) return;
      const geo = mesh.geometry;
      if (!geo?.getAttribute("position")) return;

      const g = geo.clone();
      g.applyMatrix4(mesh.matrixWorld);

      if (!g.index) {
        const count = g.getAttribute("position").count;
        const idx = new Uint32Array(count);
        for (let i = 0; i < count; i++) idx[i] = i;
        g.setIndex(new THREE.BufferAttribute(idx, 1));
      }

      const stripped = new THREE.BufferGeometry();
      stripped.setAttribute("position", g.getAttribute("position"));
      stripped.setIndex(g.index!);
      geos.push(stripped);
    });

    let trimesh: [Float32Array, Uint32Array] | null = null;
    if (geos.length > 0) {
      try {
        const merged = mergeGeometries(geos, false);
        if (merged && merged.getAttribute("position") && merged.index) {
          trimesh = [
            new Float32Array(merged.getAttribute("position").array),
            new Uint32Array(merged.index.array),
          ];
          // trimesh built OK
        }
      } catch {
        console.warn("[Location] trimesh merge failed, using cuboid fallback");
      }
    }

    // 7. Freeze transforms
    root.traverse((obj) => {
      obj.matrixAutoUpdate = false;
    });
    root.updateMatrixWorld(true);

    return { visual: root, trimeshArgs: trimesh };
  }, [gltf]);

  useLayoutEffect(() => {
    return () => {
      visual.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const m = mesh.material;
        if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
        else m?.dispose();
      });
    };
  }, [visual]);

  return (
    <group>
      <primitive object={visual} />

      {/* Accurate trimesh collision */}
      {trimeshArgs && (
        <RigidBody type="fixed" colliders={false} friction={0.8}>
          <TrimeshCollider args={trimeshArgs} />
        </RigidBody>
      )}

      {/* Fallback flat floor */}
      {!trimeshArgs && (
        <RigidBody type="fixed" colliders={false} friction={0.6}>
          <CuboidCollider
            args={[PLAY_HALF + 4, 0.5, PLAY_HALF + 4]}
            position={[0, -0.5, 0]}
          />
        </RigidBody>
      )}

      {/* No invisible walls — terrain slope + player clamp = boundary */}
    </group>
  );
}

useGLTF.preload(GLB_URL);
