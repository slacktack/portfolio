import Link from "next/link";
import type { CSSProperties } from "react";
import { flyMarks, type Mark } from "./data";
import { Glyph, tint } from "./ui";

// Static illustrated planet for no-WebGL and reduced motion.
const pos = (m: Mark) => {
  const a = (m.lat * Math.PI) / 180;
  const b = (m.lon * Math.PI) / 180;
  return { x: 50 + Math.cos(a) * Math.sin(b) * 40, y: 50 - Math.sin(a) * 40 };
};

export function PlanetMap({ onPortal, onForce3d }: { onPortal: () => void; onForce3d?: () => void }) {
  return (
    <div className="ob-map">
      <div className="ob-map-globe">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <radialGradient id="ob-sea" cx="0.38" cy="0.32" r="0.75">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#0284c7" />
            </radialGradient>
            <radialGradient id="ob-shade" cx="0.35" cy="0.3" r="0.8">
              <stop offset="0.55" stopColor="#0c1b2a" stopOpacity="0" />
              <stop offset="1" stopColor="#0c1b2a" stopOpacity="0.35" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill="url(#ob-sea)" />
          <g fill="#4ade80" stroke="#fde68a" strokeWidth="0.8" strokeLinejoin="round">
            <path d="M22 30c6-8 18-10 24-6s4 10 10 10 10-6 16-2 4 12-2 14-12-2-16 4-2 12-10 12-12-8-18-10-12-2-12-10 4-8 8-12z" />
            <path d="M30 66c6-4 14-2 18 2s10 2 14 6-2 10-10 10-12-2-16-6-12-6-6-12z" />
            <path d="M70 52c4-2 10 0 10 6s-4 8-8 6-6-10-2-12z" />
          </g>
          <g fill="#22c55e">
            <circle cx="34" cy="38" r="2" />
            <circle cx="58" cy="30" r="1.6" />
            <circle cx="44" cy="74" r="1.8" />
          </g>
          <circle cx="50" cy="50" r="44" fill="url(#ob-shade)" />
          <circle cx="50" cy="50" r="47" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="0.4" strokeDasharray="1 2" />
        </svg>
        {flyMarks.map((m) => {
          const p = pos(m);
          const style = { ...tint(m.color), left: `${p.x}%`, top: `${p.y}%` } as CSSProperties;
          const inner = (
            <>
              <i>
                <Glyph k={m.key} size={18} />
              </i>
              <span>
                <b>{m.section}</b>
                <small>{m.name}</small>
              </span>
            </>
          );
          return m.href ? (
            <Link key={m.key} href={m.href} className="ob-pin" style={style}>
              {inner}
            </Link>
          ) : (
            <button key={m.key} type="button" className="ob-pin" style={style} onClick={onPortal}>
              {inner}
            </button>
          );
        })}
      </div>
      {onForce3d ? (
        <button type="button" className="ob-btn ob-btn-ghost ob-map-3d" onClick={onForce3d}>
          Fly it in 3D instead
        </button>
      ) : null}
    </div>
  );
}
