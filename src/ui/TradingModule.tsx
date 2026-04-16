import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Paper-trading mini-game rendered inside the Trading Floor modal.
 *
 * - Simulated asset "NEU/USD" with a random-walk candle generator
 * - User starts with $10,000 and can go long, short, or close
 * - Live PnL, equity, last trade tracking
 * - Pure canvas rendering — zero dependency weight
 */
type Side = "long" | "short" | null;

type Position = {
  side: Exclude<Side, null>;
  entry: number;
  size: number; // USD exposure at entry
  openedAt: number;
};

type Candle = {
  o: number;
  h: number;
  l: number;
  c: number;
};

type TradeLog = {
  side: "long" | "short";
  entry: number;
  exit: number;
  pnl: number;
  at: number;
};

const START_BALANCE = 10_000;
const MAX_CANDLES = 80;
const TICK_MS = 500;
const POSITION_SIZE = 2_500; // USD per trade (25% of starting balance)

function makeCandle(prev: number): { close: number; candle: Candle } {
  // Small Brownian step with bias noise for realism.
  const drift = (Math.random() - 0.5) * 0.4;
  const vol = 0.45 + Math.random() * 0.55;
  const open = prev;
  const close = Math.max(1, open + drift * vol * 2.5);
  const high = Math.max(open, close) + Math.random() * vol * 1.8;
  const low = Math.min(open, close) - Math.random() * vol * 1.8;
  return { close, candle: { o: open, h: high, l: Math.max(1, low), c: close } };
}

export function TradingModule() {
  const [candles, setCandles] = useState<Candle[]>(() => {
    // Seed with ~40 historical candles so the chart isn't empty at open.
    let price = 100;
    const seed: Candle[] = [];
    for (let i = 0; i < 40; i++) {
      const { close, candle } = makeCandle(price);
      seed.push(candle);
      price = close;
    }
    return seed;
  });
  const [price, setPrice] = useState(() => 100);
  const [balance, setBalance] = useState(START_BALANCE);
  const [position, setPosition] = useState<Position | null>(null);
  const [lastTrade, setLastTrade] = useState<TradeLog | null>(null);
  const [paused, setPaused] = useState(false);
  const [trades, setTrades] = useState(0);
  const [wins, setWins] = useState(0);

  // Tick price live with a random walk.
  const priceRef = useRef(price);
  priceRef.current = price;
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setCandles((prev) => {
        const last = prev[prev.length - 1];
        const { close, candle } = makeCandle(last.c);
        setPrice(Number(close.toFixed(2)));
        const next = [...prev, candle];
        return next.length > MAX_CANDLES ? next.slice(next.length - MAX_CANDLES) : next;
      });
    }, TICK_MS);
    return () => clearInterval(id);
  }, [paused]);

  // Unrealised PnL for the open position.
  const upnl = useMemo(() => {
    if (!position) return 0;
    const dir = position.side === "long" ? 1 : -1;
    return ((price - position.entry) / position.entry) * position.size * dir;
  }, [position, price]);

  const equity = balance + upnl;

  function openPosition(side: Exclude<Side, null>) {
    if (position) return;
    if (balance < POSITION_SIZE) return;
    setPosition({
      side,
      entry: price,
      size: POSITION_SIZE,
      openedAt: Date.now(),
    });
  }

  function closePosition() {
    if (!position) return;
    const pnl = upnl;
    setBalance((b) => b + pnl);
    setLastTrade({
      side: position.side,
      entry: position.entry,
      exit: price,
      pnl,
      at: Date.now(),
    });
    setTrades((t) => t + 1);
    if (pnl > 0) setWins((w) => w + 1);
    setPosition(null);
  }

  function reset() {
    setBalance(START_BALANCE);
    setPosition(null);
    setLastTrade(null);
    setTrades(0);
    setWins(0);
  }

  // Canvas rendering of the candles.
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = cvs.getBoundingClientRect();
    cvs.width = rect.width * dpr;
    cvs.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width;
    const H = rect.height;

    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.fillStyle = "#05010e";
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 5) * H;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    if (candles.length < 2) return;

    // Compute min/max for scale
    let min = Infinity;
    let max = -Infinity;
    for (const c of candles) {
      if (c.l < min) min = c.l;
      if (c.h > max) max = c.h;
    }
    const pad = (max - min) * 0.08 || 1;
    min -= pad;
    max += pad;

    const candleW = (W - 20) / candles.length;
    const y = (p: number) => H - ((p - min) / (max - min)) * H;

    // Draw candles
    candles.forEach((c, i) => {
      const x = 10 + i * candleW + candleW / 2;
      const up = c.c >= c.o;
      ctx.strokeStyle = up ? "#00ff9c" : "#ff2e63";
      ctx.fillStyle = up ? "#00ff9c" : "#ff2e63";

      // Wick
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y(c.h));
      ctx.lineTo(x, y(c.l));
      ctx.stroke();

      // Body
      const bodyTop = y(Math.max(c.o, c.c));
      const bodyBot = y(Math.min(c.o, c.c));
      const w = Math.max(2, candleW * 0.65);
      ctx.fillRect(x - w / 2, bodyTop, w, Math.max(1, bodyBot - bodyTop));
    });

    // Current price line
    const py = y(price);
    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(W, py);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px ui-monospace, Menlo, monospace";
    ctx.textAlign = "right";
    ctx.fillText(price.toFixed(2), W - 6, py - 4);

    // Entry price line for open position
    if (position) {
      const ey = y(position.entry);
      ctx.strokeStyle = position.side === "long" ? "#00e1ff" : "#ff4df0";
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(0, ey);
      ctx.lineTo(W, ey);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = position.side === "long" ? "#00e1ff" : "#ff4df0";
      ctx.textAlign = "left";
      ctx.fillText(
        `${position.side.toUpperCase()} @ ${position.entry.toFixed(2)}`,
        6,
        ey - 4
      );
    }
  }, [candles, price, position]);

  const winRate = trades > 0 ? (wins / trades) * 100 : 0;
  const pnlColor = upnl >= 0 ? "#00ff9c" : "#ff2e63";
  const equityColor = equity >= START_BALANCE ? "#00ff9c" : "#ff2e63";

  return (
    <div className="trading-module">
      <div className="trading-head">
        <div className="trading-ticker">
          <span className="trading-symbol">NEU/USD</span>
          <span className="trading-price">{price.toFixed(2)}</span>
        </div>
        <div className="trading-stats">
          <div>
            <div className="trading-stat-label">EQUITY</div>
            <div className="trading-stat-value" style={{ color: equityColor }}>
              ${equity.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="trading-stat-label">BALANCE</div>
            <div className="trading-stat-value">${balance.toFixed(2)}</div>
          </div>
          <div>
            <div className="trading-stat-label">UPNL</div>
            <div className="trading-stat-value" style={{ color: pnlColor }}>
              {upnl >= 0 ? "+" : ""}
              {upnl.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="trading-stat-label">WIN RATE</div>
            <div className="trading-stat-value">
              {winRate.toFixed(0)}% · {trades} trades
            </div>
          </div>
        </div>
      </div>

      <div className="trading-chart-wrap">
        <canvas ref={canvasRef} className="trading-chart" />
      </div>

      <div className="trading-controls">
        <button
          className="trade-btn long"
          onClick={() => openPosition("long")}
          disabled={!!position || balance < POSITION_SIZE}
        >
          ▲ LONG
        </button>
        <button
          className="trade-btn short"
          onClick={() => openPosition("short")}
          disabled={!!position || balance < POSITION_SIZE}
        >
          ▼ SHORT
        </button>
        <button
          className="trade-btn close"
          onClick={closePosition}
          disabled={!position}
        >
          ✕ CLOSE
        </button>
        <button className="trade-btn neutral" onClick={() => setPaused((p) => !p)}>
          {paused ? "▶ RESUME" : "⏸ PAUSE"}
        </button>
        <button className="trade-btn neutral" onClick={reset}>
          ↺ RESET
        </button>
      </div>

      {lastTrade && (
        <div className="trading-last">
          Last trade · {lastTrade.side.toUpperCase()} {lastTrade.entry.toFixed(2)} →{" "}
          {lastTrade.exit.toFixed(2)} ·{" "}
          <span style={{ color: lastTrade.pnl >= 0 ? "#00ff9c" : "#ff2e63" }}>
            {lastTrade.pnl >= 0 ? "+" : ""}
            {lastTrade.pnl.toFixed(2)} USD
          </span>
        </div>
      )}
    </div>
  );
}
