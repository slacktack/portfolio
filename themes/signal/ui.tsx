"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export const pad = (n: number) => String(n).padStart(2, "0");

export function useIst() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return { time: "--:--:--", date: "----.--.--" };
  const ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
  return {
    time: `${pad(ist.getHours())}:${pad(ist.getMinutes())}:${pad(ist.getSeconds())}`,
    date: `${ist.getFullYear()}.${pad(ist.getMonth() + 1)}.${pad(ist.getDate())}`,
  };
}

export function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

export function Panel({ label, aside, className = "", children, id, leds }: { label?: ReactNode; aside?: ReactNode; className?: string; children: ReactNode; id?: string; leds?: boolean }) {
  return (
    <section className={`sg-panel ${className}`} id={id}>
      <i className="sg-br tl" aria-hidden="true" />
      <i className="sg-br tr" aria-hidden="true" />
      <i className="sg-br bl" aria-hidden="true" />
      <i className="sg-br br" aria-hidden="true" />
      {label || aside ? (
        <header className="sg-panel-h">
          {label ? (
            <span className="sg-k sg-panel-l">
              {leds ? <Leds /> : null}
              {label}
            </span>
          ) : (
            <span />
          )}
          {aside ? <span className="sg-k sg-dim">{aside}</span> : null}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Leader({ k, v, href }: { k: ReactNode; v: ReactNode; href?: string }) {
  return (
    <div className="sg-leader">
      <span>{k}</span>
      <i aria-hidden="true" />
      {href ? <a href={href}>{v}</a> : <b>{v}</b>}
    </div>
  );
}

export function Glitch({ text, as: Tag = "h1", className = "" }: { text: string; as?: "h1" | "h2" | "h3"; className?: string }) {
  return (
    <Tag className={`sg-glitch ${className}`} data-text={text}>
      {text}
    </Tag>
  );
}

export function Ruler({ n = 48 }: { n?: number }) {
  return (
    <div className="sg-ruler" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className={i % 8 === 0 ? "l" : i % 4 === 0 ? "m" : ""} />
      ))}
    </div>
  );
}

export function Bar({ value, total, width = 24 }: { value: number; total: number; width?: number }) {
  const f = total > 0 ? Math.round((value / total) * width) : 0;
  return (
    <span className="sg-ascii" aria-hidden="true">
      [<b>{"█".repeat(f)}</b>
      {"░".repeat(width - f)}]
    </span>
  );
}

export function Dial({ value, label, turn }: { value: string; label: string; turn: number }) {
  const ticks = Array.from({ length: 48 }, (_, i) => i);
  return (
    <div className="sg-dial" aria-hidden="true">
      <svg viewBox="0 0 160 160">
        <circle className="ring" cx="80" cy="80" r="72" />
        {ticks.map((i) => {
          const a = (i / 48) * Math.PI * 2;
          const r1 = i % 4 === 0 ? 62 : 66;
          return <line key={i} x1={80 + Math.cos(a) * r1} y1={80 + Math.sin(a) * r1} x2={80 + Math.cos(a) * 70} y2={80 + Math.sin(a) * 70} />;
        })}
        <circle className="knob" cx="80" cy="80" r="44" />
        <g className="needle" style={{ transform: `rotate(${turn}deg)` }}>
          <line x1="80" y1="80" x2="80" y2="42" />
          <rect x="76" y="40" width="8" height="8" />
        </g>
        <circle className="hub" cx="80" cy="80" r="5" />
      </svg>
      <span className="sg-dial-v">{value}</span>
      <span className="sg-dial-k">{label}</span>
    </div>
  );
}

// One rAF loop shared by every canvas on the page.
const subs = new Set<(t: number) => void>();
let loop = 0;
function tick(t: number) {
  subs.forEach((f) => f(t));
  loop = subs.size ? requestAnimationFrame(tick) : 0;
}
export function onFrame(f: (t: number) => void) {
  subs.add(f);
  if (!loop) loop = requestAnimationFrame(tick);
  return () => {
    subs.delete(f);
  };
}

function useCanvas(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, reduce: boolean) => void, fps = 30) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  useEffect(() => {
    drawRef.current = draw;
  });
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    let visible = true;
    let last = -1000;
    const frame = (t: number) => drawRef.current(ctx, w, h, t, reduce);
    const size = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      frame(performance.now());
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(cv);
    const off = reduce
      ? () => undefined
      : onFrame((t) => {
          if (!visible || document.hidden || t - last < 1000 / fps - 2) return;
          last = t;
          frame(t);
        });
    return () => {
      off();
      ro.disconnect();
      io.disconnect();
    };
  }, [fps]);
  return ref;
}

const seed = (x: number, y: number) => {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

export function PixelField({ className = "", step = 22 }: { className?: string; step?: number }) {
  const ripples = useRef<{ x: number; y: number; t: number }[]>([]);
  const ptr = useRef<{ x: number; y: number } | null>(null);
  const ref = useCanvas((ctx, w, h, t, reduce) => {
    const time = reduce ? 4 : t / 1000;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.max(w, h) * 0.62;
    const ax = cx - w * 0.16 + Math.sin(time * 0.5) * w * 0.08;
    const ay = cy - h * 0.12 + Math.cos(time * 0.4) * h * 0.1;
    const bx = cx + w * 0.18 + Math.cos(time * 0.35) * w * 0.09;
    const by = cy + h * 0.14 + Math.sin(time * 0.45) * h * 0.1;
    const s = step * 0.6;
    const live = ripples.current.filter((r) => t - r.t < 1600);
    ripples.current = live;
    const p = ptr.current;
    for (let y = step / 2; y < h; y += step) {
      for (let x = step / 2; x < w; x += step) {
        const d = Math.hypot((x - cx) / (w / 2), (y - cy) / (h / 2));
        let wave = 0;
        for (const r of live) {
          const age = (t - r.t) / 1000;
          const band = Math.abs(Math.hypot(x - r.x, y - r.y) - age * 420);
          if (band < 26) wave = Math.max(wave, (1 - band / 26) * (1 - age / 1.6));
        }
        const near = p ? Math.max(0, 1 - Math.hypot(x - p.x, y - p.y) / 90) : 0;
        if (d > 1.15 && wave < 0.05 && near < 0.05) continue;
        const r = seed(Math.round(x / step), Math.round(y / step));
        const flick = Math.sin(time * 2 + r * 40) > 0.6;
        if (wave > 0.05 || near > 0.05) {
          const k = Math.max(wave, near);
          ctx.fillStyle = `rgba(43,217,74,${0.25 + k * 0.75})`;
          const z = s * (0.7 + k * 0.45);
          ctx.fillRect(x - z / 2, y - z / 2, z, z);
          continue;
        }
        const ta = Math.max(0, 1 - Math.hypot(x - ax, y - ay) / (R * 0.32));
        const tb = Math.max(0, 1 - Math.hypot(x - bx, y - by) / (R * 0.34));
        if (ta > 0.15 || tb > 0.15) {
          const green = tb > ta;
          const k = green ? tb : ta;
          const c = green ? `rgba(43,217,74,${0.4 + k * 0.6})` : `rgba(38,182,154,${0.4 + k * 0.6})`;
          ctx.strokeStyle = c;
          ctx.fillStyle = c;
          ctx.lineWidth = 1.5;
          if (k > 0.5 && flick) ctx.fillRect(x - s / 2, y - s / 2, s, s);
          else ctx.strokeRect(x - s / 2, y - s / 2, s, s);
        } else {
          const a = Math.max(0, 1.15 - d) * 0.3;
          ctx.strokeStyle = `rgba(17,17,17,${a * (r > 0.85 ? 1.6 : 0.7)})`;
          ctx.lineWidth = 1;
          if (r > 0.93 && flick) {
            ctx.fillStyle = `rgba(17,17,17,${a})`;
            ctx.fillRect(x - s / 2, y - s / 2, s, s);
          } else ctx.strokeRect(x - s / 2, y - s / 2, s, s);
        }
      }
    }
  }, 30);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lx = -999;
    let ly = -999;
    const move = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      const x = e.clientX - b.left;
      const y = e.clientY - b.top;
      ptr.current = { x, y };
      if (Math.hypot(x - lx, y - ly) > 70) {
        lx = x;
        ly = y;
        ripples.current.push({ x, y, t: performance.now() });
        if (ripples.current.length > 6) ripples.current.shift();
      }
    };
    const down = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      ripples.current.push({ x: e.clientX - b.left, y: e.clientY - b.top, t: performance.now() });
    };
    const leave = () => (ptr.current = null);
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerdown", down);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointerleave", leave);
    };
  }, [ref]);

  return <canvas className={`sg-field ${className}`} ref={ref} aria-hidden="true" />;
}

// Decorative live trace; shape is seeded noise, not data.
export function Spark({ seedN = 1, className = "" }: { seedN?: number; className?: string }) {
  const ref = useCanvas((ctx, w, h, t, reduce) => {
    ctx.clearRect(0, 0, w, h);
    const time = reduce ? 0 : t / 1000;
    const n = 40;
    const pts: [number, number][] = [];
    for (let i = 0; i <= n; i++) {
      const u = i + time * 3;
      const v = 0.55 + 0.22 * Math.sin(u * 0.35 + seedN) + 0.12 * Math.sin(u * 0.9 + seedN * 2) + 0.06 * Math.sin(u * 2.3 + seedN * 5);
      pts.push([(i / n) * w, h - v * h * 0.9]);
    }
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(43,217,74,0.35)");
    g.addColorStop(1, "rgba(38,182,154,0)");
    ctx.beginPath();
    ctx.moveTo(0, h);
    pts.forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.lineTo(w, h);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = "#1fbf5b";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const [ex, ey] = pts[pts.length - 1];
    ctx.fillStyle = "#2bd94a";
    ctx.fillRect(ex - 3, ey - 3, 6, 6);
  }, 30);
  return <canvas className={`sg-spark ${className}`} ref={ref} aria-hidden="true" />;
}

// Counts the numeric part up once, keeping prefix and suffix.
export function useCount(value: string, ms = 1300) {
  const m = value.match(/^([^0-9]*)([0-9][0-9,]*\.?[0-9]*)(.*)$/);
  const [out, setOut] = useState(value);
  useEffect(() => {
    if (!m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const dec = (num.split(".")[1] ?? "").length;
    const comma = num.includes(",");
    const t0 = performance.now();
    const off = onFrame((t) => {
      const k = Math.min(1, (t - t0) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      let v = (target * e).toFixed(dec);
      if (comma) v = Number(v).toLocaleString("en-IN");
      setOut(k >= 1 ? value : `${pre}${v}${post}`);
      if (k >= 1) off();
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return out;
}

// Dot-matrix text split per glyph so hover can ripple across it.
export function Dots({ text, count = false, className = "" }: { text: string; count?: boolean; className?: string }) {
  const counted = useCount(text);
  const shown = count ? counted : text;
  let k = 0;
  return (
    <b className={`sg-doto sg-wave ${className}`} aria-label={text}>
      {shown.split(/(\s+)/).map((w, wi) =>
        /^\s+$/.test(w) ? (
          <span key={wi} aria-hidden="true">
            {" "}
          </span>
        ) : (
          <span key={wi} className="sg-word" aria-hidden="true">
            {Array.from(w).map((c, i) => (
              <span key={i} style={{ "--d": k++ } as CSSProperties}>
                {c}
              </span>
            ))}
          </span>
        )
      )}
    </b>
  );
}

export function Leds({ n = 3 }: { n?: number }) {
  return (
    <span className="sg-leds" aria-hidden="true">
      {Array.from({ length: n }, (_, i) => (
        <i key={i} style={{ "--d": i } as CSSProperties} />
      ))}
    </span>
  );
}

export function Phos() {
  return (
    <span className="sg-phos" aria-hidden="true">
      <i />
    </span>
  );
}

const icons: Record<string, string[]> = {
  console: ["M2 2h5v5H2z", "M9 2h5v3H9z", "M9 7h5v7H9z", "M2 9h5v5H2z"],
  services: ["M2 3h12v3H2z", "M2 10h12v3H2z", "M4 4.5h1", "M4 11.5h1"],
  monitors: ["M2 3h12v8H2z", "M6 14h4", "M8 11v3", "M7 5.5l3 1.5-3 1.5z"],
  terminal: ["M2 3h12v10H2z", "M4.5 6l2 2-2 2", "M8 10h3.5"],
  logs: ["M3 2h10v12H3z", "M5 5h6", "M5 8h6", "M5 11h4"],
  operator: ["M5.5 3h5v5h-5z", "M3 14v-2.5h10V14"],
  themes: ["M2 2h5v5H2z", "M9 2h5v5H9z", "M2 9h5v5H2z", "M9 9h5v5H9z"],
  mail: ["M2 4h12v8H2z", "M2 4l6 5 6-5"],
  arrow: ["M4 12L12 4", "M6 4h6v6"],
};

export function Icon({ name }: { name: keyof typeof icons | string }) {
  return (
    <svg className="sg-ico" viewBox="0 0 16 16" aria-hidden="true">
      {(icons[name] ?? icons.console).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export function InView({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      const id = requestAnimationFrame(() => setOn(true));
      return () => cancelAnimationFrame(id);
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`sg-in ${className}`} data-on={on ? "" : undefined}>
      {children}
    </div>
  );
}
