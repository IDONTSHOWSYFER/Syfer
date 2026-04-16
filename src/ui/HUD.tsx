import { useGameStore } from "../state/gameStore";
import { ZONES, NPCS, QUEST_OBJECTIVES, COMPUTER_OBJECT } from "../data/content";
import { MusicPlayer } from "./MusicPlayer";

/**
 * Top HUD: shows the current quest objective, visit progress, music toggle.
 * Bottom center: contextual hint when the player is near the computer or an NPC.
 */
export function HUD() {
  const visited = useGameStore((s) => s.visitedZones);
  const activeComputer = useGameStore((s) => s.activeComputer);
  const activeNpc = useGameStore((s) => s.activeNpc);
  const hint = useGameStore((s) => s.hint);

  const npc = NPCS.find((n) => n.id === activeNpc);

  // The next unfinished quest objective, in zone order.
  const nextZone = ZONES.find((z) => !visited.has(z.id));
  const objective = nextZone
    ? QUEST_OBJECTIVES[nextZone.id]
    : "All objectives cleared";

  return (
    <>
      {/* Top-left: quest progress */}
      <div className="hud-top-left">
        <div className="hud-card">
          <div className="hud-card-title">OBJECTIVE</div>
          <div className="hud-card-objective">{objective}</div>
          <div className="hud-card-progress">
            {visited.size}/{ZONES.length}
          </div>
          <div className="hud-chips">
            {ZONES.map((z) => {
              const done = visited.has(z.id);
              return (
                <div
                  key={z.id}
                  className={`hud-chip ${done ? "done" : ""}`}
                  style={{
                    borderColor: z.color.primary,
                    boxShadow: done
                      ? `0 0 12px ${z.color.primary}, 0 0 24px ${z.color.primary}`
                      : "none",
                    color: done ? "#fff" : z.color.primary,
                    background: done
                      ? `linear-gradient(135deg, ${z.color.primary}, ${z.color.secondary})`
                      : "transparent",
                  }}
                  title={z.label}
                >
                  {z.emoji}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top-right: music toggle */}
      <div className="hud-top-right">
        <MusicPlayer />
      </div>

      {/* Bottom center hint: computer wins over NPC when both are in range */}
      {activeComputer ? (
        <div className="hud-bottom">
          <div className="hud-prompt" style={{ borderColor: COMPUTER_OBJECT.accent }}>
            <span style={{ color: COMPUTER_OBJECT.accent }}>💻</span>
            <span className="hud-prompt-title">{COMPUTER_OBJECT.label}</span>
            <span className="hud-prompt-key">E</span>
          </div>
        </div>
      ) : npc ? (
        <div className="hud-bottom">
          <div className="hud-prompt" style={{ borderColor: npc.accent }}>
            <span style={{ color: npc.accent }}>💬</span>
            <span className="hud-prompt-title">
              {npc.name} · {npc.topic}
            </span>
            <span className="hud-prompt-key">E</span>
          </div>
        </div>
      ) : null}

      {hint && <div className="hud-hint-bubble">{hint}</div>}
    </>
  );
}
