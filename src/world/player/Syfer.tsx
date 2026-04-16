import { useRef, useEffect, useMemo, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Howl } from "howler";
import {
  RigidBody,
  CapsuleCollider,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useGameStore } from "../../state/gameStore";
import { NPCS, COMPUTER_OBJECT } from "../../data/content";

const SPEED = 9;
const JUMP_FORCE = 10;
const CAM_MIN = 4;
const CAM_MAX = 16;
const CAM_HEIGHT = 4.5;
const NPC_INTERACT_RADIUS = 4;
const ACCENT = "#00e1ff";
const MODEL_URL = "/syfer.glb";

const IDLE_CLIP = "NlaTrack.001";
const MOVE_CLIP = "NlaTrack.003";
const JUMP_CLIP = "NlaTrack";

export function Syfer() {
  const body = useRef<RapierRigidBody>(null!);
  const root = useRef<THREE.Group>(null!);
  const modelRef = useRef<THREE.Group>(null!);
  const haloRef = useRef<THREE.Mesh>(null!);

  const { camera } = useThree();
  const move = useGameStore((s) => s.move);
  const setActiveNpc = useGameStore((s) => s.setActiveNpc);
  const setActiveComputer = useGameStore((s) => s.setActiveComputer);
  const setPlayerPosition = useGameStore((s) => s.setPlayerPosition);
  const openZone = useGameStore((s) => s.openZone);
  const openNpc = useGameStore((s) => s.openNpc);
  const terminalOpen = useGameStore((s) => s.terminalOpen);

  const camDist = useRef(10); // zoom distance — modified by scroll
  const camAngle = useRef(0); // orbital angle around player (radians)
  const camTarget = useRef(new THREE.Vector3(0, CAM_HEIGHT, 10));
  const visualTarget = useRef(new THREE.Vector3());
  const camLook = useRef(new THREE.Vector3(0, 1.5, 0));
  const isDragging = useRef(false);
  const lastPointerX = useRef(0);

  const gltf = useGLTF(MODEL_URL);
  const scene = useMemo(() => clone(gltf.scene) as THREE.Group, [gltf.scene]);
  const { actions, names, clips } = useAnimations(gltf.animations, scene);
  const currentAnim = useRef<string | null>(null);
  const wasMoving = useRef(false);
  const jumpQueued = useRef(false);
  const isJumping = useRef(false);

  const runSound = useRef<Howl | null>(null);
  const jumpSound = useRef<Howl | null>(null);
  const muted = useGameStore((s) => s.muted);

  useEffect(() => {
    runSound.current = new Howl({
      src: ["/audio/running.mp3"],
      loop: true,
      volume: 0.45,
      html5: false,
    });
    jumpSound.current = new Howl({
      src: ["/audio/jump.mp3"],
      volume: 0.6,
      html5: false,
    });
    return () => {
      runSound.current?.stop();
      runSound.current?.unload();
      jumpSound.current?.unload();
      runSound.current = null;
      jumpSound.current = null;
    };
  }, []);

  useEffect(() => {
    runSound.current?.mute(muted);
    jumpSound.current?.mute(muted);
  }, [muted]);

  useLayoutEffect(() => {
    scene.updateMatrixWorld(true);

    const initialBox = new THREE.Box3().setFromObject(scene);
    const initialSize = new THREE.Vector3();
    initialBox.getSize(initialSize);

    const targetHeight = 1.5;
    const scale = initialSize.y > 0 ? targetHeight / initialSize.y : 1;
    scene.scale.setScalar(scale);
    scene.updateMatrixWorld(true);

    const fittedBox = new THREE.Box3().setFromObject(scene);
    const fittedCenter = new THREE.Vector3();
    fittedBox.getCenter(fittedCenter);

    scene.position.set(-fittedCenter.x, -fittedBox.min.y, -fittedCenter.z);
    scene.updateMatrixWorld(true);
  }, [scene]);

  useEffect(() => {
    camera.position.set(0, CAM_HEIGHT + 2, camDist.current + 1);
    camera.lookAt(0, 1, 0);
  }, [camera]);

  // Space = jump
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        jumpQueued.current = true;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Scroll wheel / trackpad = zoom
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camDist.current = Math.max(
        CAM_MIN,
        Math.min(CAM_MAX, camDist.current + e.deltaY * 0.02),
      );
    };
    const canvas = document.querySelector("canvas");
    if (canvas) {
      canvas.addEventListener("wheel", onWheel, { passive: false });
      return () => canvas.removeEventListener("wheel", onWheel);
    }
  }, []);

  // Mouse drag = orbit camera
  useEffect(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      // Right-click or middle-click, or left-click on desktop (not on UI)
      if (e.button === 2 || e.button === 1 || (e.button === 0 && e.pointerType === "mouse")) {
        isDragging.current = true;
        lastPointerX.current = e.clientX;
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointerX.current;
      camAngle.current -= dx * 0.005;
      lastPointerX.current = e.clientX;
    };
    const onPointerUp = () => {
      isDragging.current = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // Touch: pinch = zoom, single finger on right half = orbit
  useEffect(() => {
    let lastPinchDist = 0;
    let lastTouchX = 0;
    let touchOrbit = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        // Single touch on right side of screen = orbit
        const x = e.touches[0].clientX;
        if (x > window.innerWidth * 0.4) {
          touchOrbit = true;
          lastTouchX = x;
        }
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        if (lastPinchDist > 0) {
          const delta = lastPinchDist - dist;
          camDist.current = Math.max(
            CAM_MIN,
            Math.min(CAM_MAX, camDist.current + delta * 0.05),
          );
        }
        lastPinchDist = dist;
        touchOrbit = false;
      } else if (e.touches.length === 1 && touchOrbit) {
        const x = e.touches[0].clientX;
        const dx = x - lastTouchX;
        camAngle.current -= dx * 0.008;
        lastTouchX = x;
      }
    };
    const onTouchEnd = () => {
      lastPinchDist = 0;
      touchOrbit = false;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  void names;
  void clips;

  const fadeToAction = (name: string | undefined, restart = false) => {
    if (!name || !actions[name]) return;
    if (currentAnim.current === name && !restart) return;

    const next = actions[name];
    const prev = currentAnim.current ? actions[currentAnim.current] : null;

    if (prev && prev !== next) {
      prev.fadeOut(0.2);
      prev.stop();
    }

    if (restart) {
      next.reset();
    }

    next.enabled = true;
    next.setLoop(THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = false;
    next.fadeIn(0.2).setEffectiveTimeScale(1).setEffectiveWeight(1);
    next.paused = false;
    next.play();

    currentAnim.current = name;
  };

  useFrame((state, delta) => {
    const b = body.current;
    if (!b) return;

    const frozen = openZone || openNpc || terminalOpen;
    const mv = frozen ? { x: 0, y: 0 } : move;
    const len = Math.hypot(mv.x, mv.y);
    const moving = len > 0.2;

    const camForward = new THREE.Vector3();
    camera.getWorldDirection(camForward);
    camForward.y = 0;
    camForward.normalize();

    const camRight = new THREE.Vector3()
      .crossVectors(camForward, new THREE.Vector3(0, 1, 0))
      .normalize();

    const desired = new THREE.Vector3();
    if (moving) {
      desired
        .addScaledVector(camForward, -mv.y)
        .addScaledVector(camRight, mv.x)
        .normalize()
        .multiplyScalar(SPEED);
    }

    const cur = b.linvel();
    const grounded = Math.abs(cur.y) < 0.05;

    if (jumpQueued.current && grounded) {
      b.setLinvel({ x: desired.x, y: JUMP_FORCE, z: desired.z }, true);
      jumpQueued.current = false;
      isJumping.current = true;
      if (jumpSound.current && !muted) {
        jumpSound.current.stop();
        jumpSound.current.play();
      }
    } else {
      b.setLinvel({ x: desired.x, y: cur.y, z: desired.z }, true);
      if (grounded && isJumping.current) {
        isJumping.current = false;
      }
    }

    // Running sound: loop while moving on the ground.
    const shouldRun = moving && grounded && !isJumping.current && !frozen;
    const rs = runSound.current;
    if (rs) {
      if (shouldRun && !rs.playing()) {
        rs.play();
      } else if (!shouldRun && rs.playing()) {
        rs.pause();
      }
    }

    if (root.current) {
      const pos = b.translation();
      visualTarget.current.set(pos.x, pos.y, pos.z);
      root.current.position.lerp(
        visualTarget.current,
        Math.min(1, delta * 25),
      );

      if (moving) {
        const targetY = Math.atan2(desired.x, desired.z);
        let dy = targetY - root.current.rotation.y;
        while (dy > Math.PI) dy -= Math.PI * 2;
        while (dy < -Math.PI) dy += Math.PI * 2;
        root.current.rotation.y += dy * Math.min(1, delta * 12);
      }
    }

    const idleName = actions[IDLE_CLIP] ? IDLE_CLIP : names[0];
    const walkOrRunName = actions[MOVE_CLIP]
      ? MOVE_CLIP
      : names[1] ?? names[0];
    const jumpName = actions[JUMP_CLIP] ? JUMP_CLIP : undefined;

    if (!currentAnim.current) {
      fadeToAction(idleName, true);
      wasMoving.current = false;
    }

    if (isJumping.current && jumpName) {
      fadeToAction(jumpName, false);
    } else if (moving !== wasMoving.current) {
      fadeToAction(moving ? walkOrRunName : idleName, true);
      wasMoving.current = moving;
    } else if (!isJumping.current) {
      const targetAnim = moving ? walkOrRunName : idleName;
      if (currentAnim.current !== targetAnim) {
        fadeToAction(targetAnim, true);
      }
    }

    if (haloRef.current) {
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * 3) * 0.08;
      haloRef.current.scale.set(s, s, s);
      (haloRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.35 + Math.sin(t * 3) * 0.1;
    }

    // Camera follow with orbital rotation + zoom
    const pos = b.translation();
    const angle = camAngle.current;
    const dist = camDist.current;
    camTarget.current.set(
      pos.x + Math.sin(angle) * dist,
      pos.y + CAM_HEIGHT,
      pos.z + Math.cos(angle) * dist,
    );
    camera.position.lerp(camTarget.current, Math.min(1, delta * 8));
    camLook.current.set(pos.x, pos.y + 0.8, pos.z);
    camera.lookAt(camLook.current);

    // Publish player position for NPCs to face toward
    setPlayerPosition([pos.x, pos.y, pos.z]);

    // Elliptical clamp matching the dotted track boundary
    const RX = 20; // track half-width (X axis)
    const RZ = 16; // track half-depth (Z axis)
    let cx = pos.x;
    let cz = pos.z;
    const d = (cx * cx) / (RX * RX) + (cz * cz) / (RZ * RZ);
    if (d > 1) {
      const s = 1 / Math.sqrt(d);
      cx = cx * s;
      cz = cz * s;
    }
    // Cap Y — prevent climbing terrain slopes / mountains
    let cy = pos.y;
    if (cy > 10) cy = 10;
    if (cx !== pos.x || cz !== pos.z || cy !== pos.y) {
      b.setTranslation({ x: cx, y: cy, z: cz }, true);
    }

    // NPC proximity
    let closestNpc: { id: string; dist: number } | null = null;
    for (const n of NPCS) {
      const dx = pos.x - n.position[0];
      const dz = pos.z - n.position[2];
      const d = Math.hypot(dx, dz);
      if (
        d < NPC_INTERACT_RADIUS &&
        (!closestNpc || d < closestNpc.dist)
      ) {
        closestNpc = { id: n.id, dist: d };
      }
    }
    setActiveNpc(closestNpc ? closestNpc.id : null);

    // Computer proximity
    const cdx = pos.x - COMPUTER_OBJECT.position[0];
    const cdz = pos.z - COMPUTER_OBJECT.position[2];
    const cDist = Math.hypot(cdx, cdz);
    setActiveComputer(cDist < COMPUTER_OBJECT.interactRadius);
  });

  return (
    <>
      <RigidBody
        ref={body}
        colliders={false}
        position={[0, 10, 0]}
        enabledRotations={[false, false, false]}
        lockRotations
        linearDamping={6}
        angularDamping={6}
        mass={1.0}
        friction={0.2}
        restitution={0.1}
        ccd
      >
        <CapsuleCollider args={[0.4, 0.3]} position={[0, 0.75, 0]} />
      </RigidBody>

      <group ref={root} position={[0, 2, 0]}>
        <group
          ref={modelRef}
          position={[0, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <primitive object={scene} />
        </group>

        <mesh
          ref={haloRef}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.06, 0]}
        >
          <ringGeometry args={[0.9, 1.3, 32]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.4}
            toneMapped={false}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        <pointLight
          position={[0, 3, 0]}
          color="#ff2e9a"
          intensity={2.4}
          distance={10}
        />
      </group>
    </>
  );
}

useGLTF.preload(MODEL_URL);
