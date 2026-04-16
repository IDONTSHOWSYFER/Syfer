# SYFER WORLD

An immersive 3D portfolio universe for **lil 6ixseven** — a neon cyberpunk
playground you walk around in instead of scrolling.

Built with React 19, Three.js, @react-three/fiber, @react-three/rapier,
@react-three/drei, @react-three/postprocessing, Zustand and nipplejs.

## ✨ What's in here

- A walkable 3D hub with a custom neon-grid ground, aurora sky dome, a
  procedurally generated cyberpunk skyline and drifting particles.
- Syfer as the player character — a transparent PNG sprite rendered as a
  camera-locked billboard driven by a Rapier capsule collider.
- 5 interactive portals that open themed content panels:
  - **STACK.EXE** — CDA RNCP technical blocks
  - **PROJECTS.LAB** — Lilpump, Lama LinkedIn, Iara
  - **CHAIN.ZONE** — blockchain vibes
  - **BUSINESS.HQ** — building / shipping mindset
  - **TRADING.FLOOR** — charts, risk, conviction
- 4 ambient NPCs with speech bubbles (Guide, Hype-chan, Bouncer, Iara).
- A quest system: visit every portal for a completion toast.
- Post-processing: Bloom + subtle chromatic aberration + vignette.
- Procedural WebAudio ambient drone (no external audio files).
- Fully responsive: WASD / ZQSD / arrow keys on desktop, nipplejs virtual
  joystick + action button on mobile.

## 🚀 Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## 🕹 Controls

**Desktop**
- `W A S D` / `Z Q S D` / Arrow keys — move
- `E` / `Space` / `Enter` — interact with a glowing portal
- `Esc` — close modal

**Mobile**
- Virtual joystick (bottom-left) — move
- `E` button (bottom-right) — interact
- Tap anywhere on the intro — start

## 🧱 Project structure

```
src/
├── App.tsx                 # Canvas + UI overlay root
├── world/
│   ├── Scene.tsx           # Lighting, fog, physics, player, post-fx
│   ├── environment/        # SkyDome, Ground, Buildings, Streetlights, Particles
│   ├── player/Syfer.tsx    # Billboard sprite + Rapier capsule + camera follow
│   ├── zones/ZonePortal.tsx# Rotating neon ring portals
│   └── npcs/Npc.tsx        # Low-poly NPC with speech bubble
├── ui/                     # HUD, IntroScreen, ZoneModal, CompletionToast, MobileJoystick, LoadingScreen
├── state/gameStore.ts      # Zustand global state (phase, move, zones, quest)
├── audio/SoundManager.ts   # Procedural WebAudio drone + blip
├── utils/hooks.ts          # useDetectMobile, useKeyboardControls
├── data/content.ts         # Zones, projects, blurbs, NPC lines
└── index.css               # Cyberpunk neon UI styles
```

## 📦 Build

```bash
npm run build
```

Output lands in `dist/`. Deploy anywhere static (Vercel, Netlify, GitHub
Pages, S3, …).

## 🎨 Tweaking the vibe

- **Content** lives in `src/data/content.ts` — edit zones, projects,
  blurbs and NPC lines without touching any 3D code.
- **Zone positions** are in that same file, under each zone's `position`
  field. Keep them inside the safe play disc (roughly `r < 30`) so the
  follow camera never clips into the building ring.
- **Colors / fog / lighting** live in `src/world/Scene.tsx`.
- **Bloom intensity** is in the `<EffectComposer>` block of `Scene.tsx`.
- **Player speed / camera distance** are constants at the top of
  `src/world/player/Syfer.tsx`.
