import { create } from "zustand";
import type { ZoneId } from "../data/content";

export type GamePhase = "intro" | "playing";

export type MoveInput = {
  x: number; // -1..1
  y: number; // -1..1
};

type GameState = {
  // Lifecycle
  phase: GamePhase;
  loaded: boolean;
  loadingProgress: number;
  setLoaded: (v: boolean) => void;
  setLoadingProgress: (v: number) => void;
  start: () => void;

  // Device
  isMobile: boolean;
  setIsMobile: (v: boolean) => void;

  // Input
  move: MoveInput;
  setMove: (m: MoveInput) => void;
  interactPressed: number;
  triggerInteract: () => void;

  // Active zone (when player is standing in a portal)
  activeZone: ZoneId | null;
  setActiveZone: (z: ZoneId | null) => void;

  // Active NPC (when player is standing near an NPC)
  activeNpc: string | null;
  setActiveNpc: (id: string | null) => void;

  // Open NPC dialogue
  openNpc: string | null;
  openNpcDialogue: (id: string) => void;
  closeNpcDialogue: () => void;

  // NPCs you have already talked to (controls bubble visibility).
  spokenNpcs: Set<string>;
  markSpoken: (id: string) => void;

  // Open modal zone
  openZone: ZoneId | null;
  openZoneModal: (z: ZoneId) => void;
  closeZoneModal: () => void;

  // Active computer (when player is standing near a computer terminal)
  activeComputer: boolean;
  setActiveComputer: (v: boolean) => void;

  // Computer terminal state
  terminalOpen: boolean;
  openTerminal: () => void;
  closeTerminal: () => void;

  // Quest system
  visitedZones: Set<ZoneId>;
  visitZone: (z: ZoneId) => void;
  resetVisits: () => void;

  // Audio (just the mute mirror — actual playback lives in SoundManager)
  muted: boolean;
  toggleMuted: () => void;

  // Player world position (updated every frame by Syfer component)
  playerPosition: [number, number, number];
  setPlayerPosition: (p: [number, number, number]) => void;

  // Hint bubble shown at top
  hint: string | null;
  setHint: (h: string | null) => void;
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: "intro",
  loaded: false,
  loadingProgress: 0,
  setLoaded: (v) => set({ loaded: v }),
  setLoadingProgress: (v) => set({ loadingProgress: v }),
  start: () => set({ phase: "playing" }),

  isMobile: false,
  setIsMobile: (v) => set({ isMobile: v }),

  move: { x: 0, y: 0 },
  setMove: (m) => set({ move: m }),
  interactPressed: 0,
  triggerInteract: () => {
    const { activeZone, activeNpc, activeComputer, openZone, openNpc } = get();
    if (openZone || openNpc) {
      set({ interactPressed: get().interactPressed + 1 });
      return;
    }
    // NPC opens dialogue (not zone modal)
    if (activeNpc) {
      set({
        openNpc: activeNpc,
        interactPressed: get().interactPressed + 1,
      });
      get().markSpoken(activeNpc);
    } else if (activeComputer) {
      set({ terminalOpen: true, interactPressed: get().interactPressed + 1 });
    } else if (activeZone) {
      set({ openZone: activeZone, interactPressed: get().interactPressed + 1 });
      get().visitZone(activeZone);
    } else {
      set({ interactPressed: get().interactPressed + 1 });
    }
  },

  activeZone: null,
  setActiveZone: (z) => set({ activeZone: z }),

  activeNpc: null,
  setActiveNpc: (id) => set({ activeNpc: id }),

  activeComputer: false,
  setActiveComputer: (v) => set({ activeComputer: v }),

  terminalOpen: false,
  openTerminal: () => set({ terminalOpen: true }),
  closeTerminal: () => set({ terminalOpen: false }),

  openNpc: null,
  openNpcDialogue: (id) => {
    set({ openNpc: id });
    get().markSpoken(id);
  },
  closeNpcDialogue: () => set({ openNpc: null, terminalOpen: false }),

  spokenNpcs: new Set<string>(),
  markSpoken: (id) =>
    set((state) => {
      if (state.spokenNpcs.has(id)) return state;
      const next = new Set(state.spokenNpcs);
      next.add(id);
      return { spokenNpcs: next };
    }),

  openZone: null,
  openZoneModal: (z) => {
    set({ openZone: z });
    get().visitZone(z);
  },
  // Closing the modal also releases any NPC that was bound to it so their
  // animation snaps back to idle.
  closeZoneModal: () => set({ openZone: null, openNpc: null, terminalOpen: false }),

  visitedZones: new Set<ZoneId>(),
  visitZone: (z) =>
    set((state) => {
      if (state.visitedZones.has(z)) return state;
      const next = new Set(state.visitedZones);
      next.add(z);
      return { visitedZones: next };
    }),
  resetVisits: () => set({ visitedZones: new Set<ZoneId>() }),

  muted: false,
  toggleMuted: () => set((s) => ({ muted: !s.muted })),

  playerPosition: [0, 0, 0],
  setPlayerPosition: (p) => set({ playerPosition: p }),

  hint: null,
  setHint: (h) => set({ hint: h }),
}));
