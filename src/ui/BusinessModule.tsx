import { useMemo, useState } from "react";
import { BUSINESS_PRINCIPLES } from "../data/content";

/**
 * Interactive business module for the Business HQ zone.
 *
 *  - Growth-funnel calculator: tweak audience size, conversion %, ARPU,
 *    churn — see ARR, CAC payback, and a "moat score".
 *  - Click-to-flip principle cards (front = title, back = body).
 *  - Pure DOM, no extra deps.
 */
export function BusinessModule() {
  const [audience, setAudience] = useState(10_000);
  const [conv, setConv] = useState(2);
  const [arpu, setArpu] = useState(15);
  const [churn, setChurn] = useState(5);

  const metrics = useMemo(() => {
    const customers = Math.round(audience * (conv / 100));
    const mrr = customers * arpu;
    const arr = mrr * 12;
    // Lifetime months ≈ 100 / churn%
    const lifetime = churn > 0 ? 100 / churn : 100;
    const ltv = arpu * lifetime;
    // Pretend CAC is 1/3 of LTV — payback in months.
    const cac = Math.max(1, ltv / 3);
    const paybackMonths = cac / Math.max(1, arpu);
    // Moat score: high audience + low churn + high ARPU.
    const moat = Math.round(
      Math.min(
        100,
        Math.log10(audience + 10) * 10 +
          (arpu / 100) * 30 +
          Math.max(0, 30 - churn * 3)
      )
    );
    return { customers, mrr, arr, ltv, cac, paybackMonths, moat };
  }, [audience, conv, arpu, churn]);

  const moatColor =
    metrics.moat > 70
      ? "#00ff9c"
      : metrics.moat > 50
        ? "#ffd000"
        : "#ff8a00";

  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const toggle = (i: number) =>
    setFlipped((f) => ({ ...f, [i]: !f[i] }));

  return (
    <div className="biz-body">
      <div className="biz-card biz-sim">
        <div className="biz-card-title">Growth simulator</div>
        <div className="biz-controls">
          <div className="biz-ctrl">
            <label>Audience</label>
            <input
              type="range"
              min={500}
              max={250_000}
              step={500}
              value={audience}
              onChange={(e) => setAudience(parseInt(e.target.value))}
            />
            <span>{audience.toLocaleString()}</span>
          </div>
          <div className="biz-ctrl">
            <label>Conversion</label>
            <input
              type="range"
              min={0.1}
              max={20}
              step={0.1}
              value={conv}
              onChange={(e) => setConv(parseFloat(e.target.value))}
            />
            <span>{conv}%</span>
          </div>
          <div className="biz-ctrl">
            <label>ARPU / mo</label>
            <input
              type="range"
              min={1}
              max={500}
              step={1}
              value={arpu}
              onChange={(e) => setArpu(parseInt(e.target.value))}
            />
            <span>${arpu}</span>
          </div>
          <div className="biz-ctrl">
            <label>Churn</label>
            <input
              type="range"
              min={0.5}
              max={25}
              step={0.5}
              value={churn}
              onChange={(e) => setChurn(parseFloat(e.target.value))}
            />
            <span>{churn}%</span>
          </div>
        </div>

        <div className="biz-metrics">
          <div className="biz-metric">
            <div className="biz-metric-label">Customers</div>
            <div className="biz-metric-value">
              {metrics.customers.toLocaleString()}
            </div>
          </div>
          <div className="biz-metric">
            <div className="biz-metric-label">MRR</div>
            <div className="biz-metric-value">
              ${metrics.mrr.toLocaleString()}
            </div>
          </div>
          <div className="biz-metric">
            <div className="biz-metric-label">ARR</div>
            <div className="biz-metric-value">
              ${metrics.arr.toLocaleString()}
            </div>
          </div>
          <div className="biz-metric">
            <div className="biz-metric-label">LTV</div>
            <div className="biz-metric-value">${metrics.ltv.toFixed(0)}</div>
          </div>
          <div className="biz-metric">
            <div className="biz-metric-label">CAC payback</div>
            <div className="biz-metric-value">
              {metrics.paybackMonths.toFixed(1)} mo
            </div>
          </div>
          <div className="biz-metric">
            <div className="biz-metric-label">Moat</div>
            <div
              className="biz-metric-value"
              style={{ color: moatColor, textShadow: `0 0 12px ${moatColor}` }}
            >
              {metrics.moat}
            </div>
          </div>
        </div>
      </div>

      <div className="biz-principles">
        {BUSINESS_PRINCIPLES.map((p, i) => {
          const isFlipped = !!flipped[i];
          return (
            <button
              key={i}
              className={`biz-principle ${isFlipped ? "flipped" : ""}`}
              onClick={() => toggle(i)}
            >
              <div className="biz-principle-front">
                <div className="biz-principle-num">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="biz-principle-title">{p.title}</div>
                <div className="biz-principle-flip">tap to read</div>
              </div>
              <div className="biz-principle-back">
                <div className="biz-principle-body">{p.body}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
