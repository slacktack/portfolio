"use client";

import { useEffect, useState } from "react";
import { openThemes } from "@/components/skin";
import { flyMarks, powerOf, targetName } from "./data";
import { Arrow, Glyph, Kbd, tint } from "./ui";

function CountUp({ value }: { value: string }) {
  const m = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  const [shown, setShown] = useState(m ? `${m[1]}0${m[3]}` : value);
  useEffect(() => {
    if (!m) return;
    const raw = m[2];
    const target = parseFloat(raw.replace(/,/g, ""));
    const dec = raw.includes(".") ? raw.split(".")[1].length : 0;
    const comma = raw.includes(",");
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const u = Math.min(1, (now - t0) / 900);
      const e = 1 - Math.pow(1 - u, 3);
      const n = target * e;
      const txt = comma ? Math.round(n).toLocaleString("en-US") : n.toFixed(dec);
      setShown(`${m[1]}${txt}${m[3]}`);
      if (u < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{shown}</>;
}

export function Scanner({ id, onLand }: { id: string; onLand: () => void }) {
  const t = targetName(id);
  const p = powerOf(id);
  return (
    <button type="button" className="ob-scan" style={tint(t.color)} onClick={onLand}>
      <span className="ob-scan-ret" aria-hidden="true">
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" className="ob-scan-r1" />
          <circle cx="50" cy="50" r="32" className="ob-scan-r2" />
          <path d="M50 2v14M50 84v14M2 50h14M84 50h14" />
          <circle cx="50" cy="50" r="5" />
        </svg>
      </span>
      <span className="ob-scan-read">
        <small>Power level · {t.name}</small>
        <b>
          <CountUp key={id} value={p.value} />
        </b>
        <em>{p.label}</em>
      </span>
      <span className="ob-scan-land">
        <Kbd>E</Kbd> Land
      </span>
    </button>
  );
}

export function Tracker({ collected, hint }: { collected: string[]; hint: string }) {
  return (
    <div className="ob-quest" role="status">
      <div className="ob-quest-top">
        <span>Quest</span>
        <b>
          Collect energy cores {collected.length}/{flyMarks.length}
        </b>
      </div>
      <div className="ob-pips" aria-hidden="true">
        {flyMarks.map((m) => (
          <i key={m.key} style={tint(m.color)} data-on={collected.includes(m.key) ? "" : undefined} title={m.name} />
        ))}
      </div>
      <p className="ob-quest-hint" key={hint}>
        {hint}
      </p>
    </div>
  );
}

export function FlightSchool({ onClose }: { onClose: () => void }) {
  const rows: [React.ReactNode, string][] = [
    [
      <>
        <Kbd>W</Kbd>
        <Kbd>A</Kbd>
        <Kbd>S</Kbd>
        <Kbd>D</Kbd>
        <span className="ob-or">or arrows</span>
      </>,
      "Fly the craft",
    ],
    [<Kbd key="s">Shift</Kbd>, "Hold to power up and boost"],
    [<Kbd key="e">E</Kbd>, "Land at the landmark you are near"],
    [
      <>
        <Kbd>1</Kbd>–<Kbd>6</Kbd>
      </>,
      "Autopilot to a landmark",
    ],
    [<Kbd key="m">M</Kbd>, "Pull back to orbit view"],
  ];
  return (
    <div className="ob-school" role="dialog" aria-modal="true" aria-labelledby="ob-school-t">
      <div className="ob-school-card">
        <span className="ob-school-k">Flight school</span>
        <h2 id="ob-school-t">
          Power up. <em>Find the six cores.</em>
        </h2>
        <p>Every section of this portfolio is a landmark with a glowing energy core above it. Land at each one to collect its core and read what is inside.</p>
        <ol>
          {rows.map(([k, t], i) => (
            <li key={t} style={{ animationDelay: `${0.15 + i * 0.08}s` }}>
              <span className="ob-school-keys" style={{ animationDelay: `${i * 0.35}s` }}>
                {k}
              </span>
              {t}
            </li>
          ))}
        </ol>
        <p className="ob-school-touch">On a phone: tap the planet to fly, tap a landmark to land.</p>
        <button type="button" className="ob-btn ob-btn-big" onClick={onClose} autoFocus>
          Start the quest <Arrow />
        </button>
      </div>
    </div>
  );
}

export function Toast({ id, count }: { id: string; count: number }) {
  const t = targetName(id);
  return (
    <div className="ob-toast" style={tint(t.color)} role="status">
      <span className="ob-toast-gem" aria-hidden="true" />
      <span>
        <small>Energy core collected</small>
        <b>
          {t.name} · {count}/{flyMarks.length}
        </b>
      </span>
    </div>
  );
}

export function Celebration({ onClose }: { onClose: () => void }) {
  return (
    <div className="ob-win" role="dialog" aria-modal="true" aria-labelledby="ob-win-t">
      <div className="ob-win-rays" aria-hidden="true" />
      <div className="ob-win-card">
        <span className="ob-school-k">Quest complete</span>
        <h2 id="ob-win-t">
          All six cores. <em>Maximum power.</em>
        </h2>
        <p>You have landed everywhere on this planet. The portal still has more: the same work as a completely different website, again and again.</p>
        <div className="ob-win-gems" aria-hidden="true">
          {flyMarks.map((m) => (
            <i key={m.key} style={tint(m.color)}>
              <Glyph k={m.key} size={18} />
            </i>
          ))}
        </div>
        <div className="ob-brief-cta">
          <button
            type="button"
            className="ob-btn ob-btn-big"
            onClick={() => {
              onClose();
              openThemes();
            }}
          >
            Open the theme portal <Arrow />
          </button>
          <button type="button" className="ob-btn ob-btn-ghost" onClick={onClose}>
            Keep flying
          </button>
        </div>
      </div>
    </div>
  );
}
