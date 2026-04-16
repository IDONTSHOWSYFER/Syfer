import { useEffect, useMemo, useRef, useState } from "react";
import { BLOCKCHAIN_SECTIONS } from "../data/content";

/**
 * Interactive onchain module for the Blockchain zone.
 *
 *  - Live "mempool" feed of fake transactions ticking in
 *  - Portfolio allocation sliders for ETH / BTC / SOL / Stables that
 *    compute a risk score the user can play with
 *  - Click a section card to expand its body
 *  - Pure React + DOM; no extra deps.
 */

type Tx = {
  id: number;
  from: string;
  to: string;
  amount: number;
  symbol: string;
  hash: string;
  age: number;
};

const SYMBOLS = ["ETH", "USDC", "SOL", "WBTC", "ARB", "PEPE", "AERO", "BONK"];

function shortHash(): string {
  const c = "0123456789abcdef";
  let out = "0x";
  for (let i = 0; i < 6; i++) out += c[Math.floor(Math.random() * 16)];
  out += "…";
  for (let i = 0; i < 4; i++) out += c[Math.floor(Math.random() * 16)];
  return out;
}

function makeTx(id: number): Tx {
  return {
    id,
    from: shortHash(),
    to: shortHash(),
    amount: Math.round(Math.random() * 50_000) / 10,
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    hash: shortHash(),
    age: 0,
  };
}

export function CryptoModule() {
  const [feed, setFeed] = useState<Tx[]>(() =>
    Array.from({ length: 6 }, (_, i) => makeTx(i))
  );
  const idRef = useRef(6);

  // Tick the mempool feed.
  useEffect(() => {
    const id = setInterval(() => {
      setFeed((prev) => {
        const next = prev.map((t) => ({ ...t, age: t.age + 1 }));
        next.unshift(makeTx(idRef.current++));
        return next.slice(0, 8);
      });
    }, 1300);
    return () => clearInterval(id);
  }, []);

  // Allocation sliders.
  const [eth, setEth] = useState(40);
  const [btc, setBtc] = useState(30);
  const [sol, setSol] = useState(15);
  const [stables, setStables] = useState(15);

  const total = eth + btc + sol + stables;

  // Risk score: heavier weight on volatile assets, lower for stables.
  const risk = useMemo(() => {
    const weights = { eth: 0.55, btc: 0.45, sol: 0.75, stables: 0.05 };
    const raw =
      (eth * weights.eth +
        btc * weights.btc +
        sol * weights.sol +
        stables * weights.stables) /
      Math.max(total, 1);
    return Math.round(raw * 100);
  }, [eth, btc, sol, stables, total]);

  const riskLabel =
    risk > 55
      ? { label: "DEGEN", color: "#ff2e63" }
      : risk > 40
        ? { label: "AGGRESSIVE", color: "#ff8a00" }
        : risk > 25
          ? { label: "BALANCED", color: "#ffd000" }
          : { label: "DEFENSIVE", color: "#00ff9c" };

  // Click-to-expand sections.
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="crypto-body">
      <div className="crypto-grid">
        <div className="crypto-card">
          <div className="crypto-card-title">Portfolio simulator</div>
          <div className="alloc-row">
            <span className="alloc-label">ETH</span>
            <input
              type="range"
              min={0}
              max={100}
              value={eth}
              onChange={(e) => setEth(parseInt(e.target.value))}
            />
            <span className="alloc-pct">{eth}%</span>
          </div>
          <div className="alloc-row">
            <span className="alloc-label">BTC</span>
            <input
              type="range"
              min={0}
              max={100}
              value={btc}
              onChange={(e) => setBtc(parseInt(e.target.value))}
            />
            <span className="alloc-pct">{btc}%</span>
          </div>
          <div className="alloc-row">
            <span className="alloc-label">SOL</span>
            <input
              type="range"
              min={0}
              max={100}
              value={sol}
              onChange={(e) => setSol(parseInt(e.target.value))}
            />
            <span className="alloc-pct">{sol}%</span>
          </div>
          <div className="alloc-row">
            <span className="alloc-label">Stables</span>
            <input
              type="range"
              min={0}
              max={100}
              value={stables}
              onChange={(e) => setStables(parseInt(e.target.value))}
            />
            <span className="alloc-pct">{stables}%</span>
          </div>
          <div className="risk-row">
            <span className="risk-label">RISK</span>
            <div className="risk-bar">
              <div
                className="risk-fill"
                style={{
                  width: `${risk}%`,
                  background: riskLabel.color,
                  boxShadow: `0 0 14px ${riskLabel.color}`,
                }}
              />
            </div>
            <span className="risk-tag" style={{ color: riskLabel.color }}>
              {riskLabel.label}
            </span>
          </div>
          <div className="alloc-total">
            Total weight · <strong>{total}%</strong>
            {total !== 100 && (
              <span className="alloc-warn"> (rebalance to 100%)</span>
            )}
          </div>
        </div>

        <div className="crypto-card">
          <div className="crypto-card-title">Live mempool · base</div>
          <div className="mempool">
            {feed.map((t) => (
              <div key={t.id} className="tx">
                <span className="tx-symbol">{t.symbol}</span>
                <span className="tx-amount">
                  {t.amount.toLocaleString()} {t.symbol}
                </span>
                <span className="tx-from">{t.from}</span>
                <span className="tx-arrow">→</span>
                <span className="tx-to">{t.to}</span>
                <span className="tx-age">{t.age}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="crypto-sections">
        {BLOCKCHAIN_SECTIONS.map((s, i) => {
          const open = openIdx === i;
          return (
            <button
              key={i}
              className={`crypto-section ${open ? "open" : ""}`}
              onClick={() => setOpenIdx(open ? null : i)}
            >
              <div className="crypto-section-head">
                <span className="crypto-section-num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="crypto-section-title">{s.title}</span>
                <span className="crypto-section-chev">{open ? "−" : "+"}</span>
              </div>
              {open && <div className="crypto-section-body">{s.body}</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
