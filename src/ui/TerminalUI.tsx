import { useEffect, useState } from "react";
import { useGameStore } from "../state/gameStore";
import { ZONES, STACK_BLOCKS, PROJECTS, TRADING_BRIEF } from "../data/content";
import type { ZoneId } from "../data/content";
import { TradingModule } from "./TradingModule";
import { CryptoModule } from "./CryptoModule";
import { BusinessModule } from "./BusinessModule";
import { SocialsModule } from "./SocialsModule";

/**
 * Full-screen immersive terminal UI opened when the player
 * interacts with the computer object. Contains tabs for every
 * zone: stack, projects, blockchain, business, trading, socials.
 */
const TABS: { id: ZoneId; label: string; emoji: string }[] = [
  { id: "stack", label: "STACK", emoji: "⚙" },
  { id: "projects", label: "PROJECTS", emoji: "🧪" },
  { id: "blockchain", label: "CRYPTO", emoji: "⛓" },
  { id: "business", label: "BUSINESS", emoji: "💼" },
  { id: "trading", label: "TRADING", emoji: "📈" },
  { id: "socials", label: "SOCIALS", emoji: "🔗" },
];

export function TerminalUI() {
  const terminalOpen = useGameStore((s) => s.terminalOpen);
  const closeTerminal = useGameStore((s) => s.closeTerminal);
  const visitZone = useGameStore((s) => s.visitZone);
  const [activeTab, setActiveTab] = useState<ZoneId>("stack");

  // Esc closes the terminal
  useEffect(() => {
    if (!terminalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTerminal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [terminalOpen, closeTerminal]);

  // Mark zone as visited when switching tabs
  useEffect(() => {
    if (terminalOpen) visitZone(activeTab);
  }, [terminalOpen, activeTab, visitZone]);

  if (!terminalOpen) return null;

  const zone = ZONES.find((z) => z.id === activeTab);

  return (
    <div className="terminal-root" onClick={closeTerminal}>
      <div className="terminal-frame" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="terminal-header">
          <div className="terminal-title">Terminal</div>
          <button className="terminal-close" onClick={closeTerminal}>
            ✕ ESC
          </button>
        </div>

        {/* Tab bar */}
        <div className="terminal-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`terminal-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={
                activeTab === tab.id && zone
                  ? {
                      borderColor: zone.color.primary,
                      color: zone.color.primary,
                      background: `${zone.color.primary}18`,
                    }
                  : undefined
              }
            >
              <span className="terminal-tab-emoji">{tab.emoji}</span>
              <span className="terminal-tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="terminal-content">
          {zone && (
            <div className="terminal-zone-header" style={{ color: zone.color.primary }}>
              <span>{zone.emoji}</span> {zone.title}
              <span className="terminal-zone-tag">{zone.tagline}</span>
            </div>
          )}
          <div className="terminal-body">
            <TabContent id={activeTab} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TabContent({ id }: { id: ZoneId }) {
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
