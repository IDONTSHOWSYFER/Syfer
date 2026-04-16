import { useEffect } from "react";
import { useGameStore } from "../state/gameStore";
import {
  ZONES,
  STACK_BLOCKS,
  PROJECTS,
  TRADING_BRIEF,
} from "../data/content";
import type { ZoneId } from "../data/content";
import { TradingModule } from "./TradingModule";
import { CryptoModule } from "./CryptoModule";
import { BusinessModule } from "./BusinessModule";
import { SocialsModule } from "./SocialsModule";

/**
 * Content modal shown when the player presses E at a portal.
 * Each zone has its own body layout. Esc / click outside closes.
 */
export function ZoneModal() {
  const openZone = useGameStore((s) => s.openZone);
  const closeZoneModal = useGameStore((s) => s.closeZoneModal);

  useEffect(() => {
    if (!openZone) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeZoneModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openZone, closeZoneModal]);

  if (!openZone) return null;
  const zone = ZONES.find((z) => z.id === openZone);
  if (!zone) return null;

  return (
    <div className="modal-root" onClick={closeZoneModal}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          borderColor: zone.color.primary,
          boxShadow: `0 0 60px ${zone.color.primary}66, 0 0 160px ${zone.color.secondary}33`,
        }}
      >
        <button className="modal-close" onClick={closeZoneModal} aria-label="close">
          ✕
        </button>
        <div
          className="modal-header"
          style={{
            background: `linear-gradient(135deg, ${zone.color.primary}, ${zone.color.secondary})`,
          }}
        >
          <div className="modal-emoji">{zone.emoji}</div>
          <div>
            <div className="modal-kicker">{zone.label}</div>
            <h2 className="modal-title">{zone.title}</h2>
            <div className="modal-tag">{zone.tagline}</div>
          </div>
        </div>
        <div className="modal-body">
          <ZoneBody id={zone.id} />
        </div>
      </div>
    </div>
  );
}

function ZoneBody({ id }: { id: ZoneId }) {
  if (id === "stack") return <StackBody />;
  if (id === "projects") return <ProjectsBody />;
  if (id === "blockchain") return <CryptoModule />;
  if (id === "business") return <BusinessModule />;
  if (id === "trading") return <TradingBody />;
  if (id === "socials") return <SocialsModule />;
  return null;
}

function StackBody() {
  return (
    <div className="stack-grid">
      {STACK_BLOCKS.map((b) => (
        <div key={b.code} className="stack-block">
          <div className="stack-code">{b.code}</div>
          <div className="stack-title">{b.title}</div>
          <ul className="stack-list">
            {b.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ProjectsBody() {
  return (
    <div className="projects-grid">
      {PROJECTS.map((p) => (
        <div
          key={p.id}
          className="project-card"
          style={{
            borderColor: p.accent,
            boxShadow: `0 0 30px ${p.accent}40`,
          }}
        >
          <div className="project-header" style={{ color: p.accent }}>
            {p.name}
          </div>
          <div className="project-tag">{p.tagline}</div>
          <div className="project-vibe">{p.vibe}</div>
          <div className="project-stack">
            {p.stack.map((s) => (
              <span key={s} className="pill">
                {s}
              </span>
            ))}
          </div>
          <div className="project-badges">
            {p.badges.map((b) => (
              <span key={b} className="badge" style={{ background: p.accent }}>
                {b}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TradingBody() {
  return (
    <div className="trading-body">
      <div className="trading-intro">
        <p>{TRADING_BRIEF.intro}</p>
        <ul className="trading-rules">
          {TRADING_BRIEF.rules.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
      <TradingModule />
    </div>
  );
}
