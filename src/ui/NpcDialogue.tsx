import { useState, useEffect, useRef } from "react";
import { Howl } from "howler";
import { useGameStore } from "../state/gameStore";
import { NPCS } from "../data/content";
import type { NpcCharacter, DialogueNode } from "../data/content";

const NPC_VOICE_SRC: Record<string, string> = {
  iara: "/audio/iara.mp3",
  banana: "/audio/banana.mp3",
  jesus: "/audio/jesus.mp3",
};

/**
 * RPG-style dialogue box shown at the bottom of the screen when
 * interacting with an NPC. Renders the branching dialogue tree
 * defined in content.ts.
 *
 * Flow:
 *  - Opens when openNpc is set (triggerInteract on a nearby NPC).
 *  - User clicks options to navigate the dialogue tree.
 *  - Leaf nodes (no options) display a "close" button.
 *  - Closing the dialogue also triggers closeZoneModal so both
 *    the dialogue and any linked zone content dismiss together.
 */
export function NpcDialogue() {
  const openNpc = useGameStore((s) => s.openNpc);
  const closeNpcDialogue = useGameStore((s) => s.closeNpcDialogue);
  const muted = useGameStore((s) => s.muted);
  const [nodeKey, setNodeKey] = useState("start");
  const voiceRef = useRef<Howl | null>(null);

  // Reset to "start" whenever a new NPC dialogue opens.
  useEffect(() => {
    if (openNpc) setNodeKey("start");
  }, [openNpc]);

  // Play the NPC-specific voice line while the dialogue is open.
  useEffect(() => {
    if (!openNpc) return;
    const src = NPC_VOICE_SRC[openNpc];
    if (!src) return;
    const howl = new Howl({
      src: [src],
      volume: 0.8,
      mute: muted,
      html5: false,
    });
    voiceRef.current = howl;
    howl.play();
    return () => {
      howl.stop();
      howl.unload();
      if (voiceRef.current === howl) voiceRef.current = null;
    };
  }, [openNpc, muted]);

  // Esc key closes the dialogue.
  useEffect(() => {
    if (!openNpc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNpcDialogue();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openNpc, closeNpcDialogue]);

  if (!openNpc) return null;

  const npc: NpcCharacter | undefined = NPCS.find((n) => n.id === openNpc);
  if (!npc) return null;

  const node: DialogueNode | undefined = npc.dialogue[nodeKey];
  if (!node) return null;

  const isLeaf = !node.options || node.options.length === 0;

  const handleClose = () => {
    closeNpcDialogue();
  };

  return (
    <div className="dialogue-root" onClick={handleClose}>
      <div
        className="dialogue-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: npc.accent,
          boxShadow: `0 0 50px ${npc.accent}40`,
        }}
      >
        {/* NPC header */}
        <div className="dialogue-header">
          <div className="dialogue-portrait" style={{ borderColor: npc.accent, color: npc.accent }}>
            💬
          </div>
          <div>
            <div className="dialogue-name" style={{ color: npc.accent }}>
              {npc.name}
            </div>
            <div className="dialogue-role">{npc.role}</div>
          </div>
        </div>

        {/* Current text */}
        <div className="dialogue-text">{node.text}</div>

        {/* Options or close */}
        {isLeaf ? (
          <div>
            <button
              className="dialogue-option"
              onClick={handleClose}
              style={{ borderColor: npc.accent, textAlign: "center" }}
            >
              ✕ close
            </button>
            <div className="dialogue-close-hint">press Esc or click outside</div>
          </div>
        ) : (
          <div className="dialogue-options">
            {node.options!.map((opt) => (
              <button
                key={opt.next}
                className="dialogue-option"
                onClick={() => setNodeKey(opt.next)}
                style={{ borderColor: `${npc.accent}40` }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
