import { SOCIAL_LINKS } from "../data/content";

/**
 * Socials zone body — big tappable cards opening Syfer's socials in a
 * new tab. Always feel free to add new platforms in content.ts.
 */
export function SocialsModule() {
  return (
    <div className="socials-body">
      <p className="socials-intro">
        Find Syfer everywhere else. Tap a card to open the link in a new tab.
      </p>
      <div className="socials-grid">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="social-card"
            style={{
              borderColor: s.color,
              boxShadow: `0 0 30px ${s.color}40`,
            }}
          >
            <div className="social-emoji" style={{ color: s.color }}>
              {s.emoji}
            </div>
            <div className="social-text">
              <div className="social-label">{s.label}</div>
              <div className="social-handle">{s.handle}</div>
            </div>
            <div className="social-cta">↗</div>
          </a>
        ))}
      </div>
    </div>
  );
}
