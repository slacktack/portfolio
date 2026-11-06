"use client";

import { useEffect, useRef, useState } from "react";
import { NameField, useVisitor } from "@/components/visitor";

type Pt = { x: number; y: number; w: number };
type Stroke = { c: string; pts: Pt[] };

const inks = [
  { id: "graphite", label: "Graphite", hex: "#16130f" },
  { id: "vermilion", label: "Vermilion", hex: "#e8491d" },
  { id: "cobalt", label: "Cobalt", hex: "#2447e0" },
];

function paint(ctx: CanvasRenderingContext2D, s: Stroke, W: number, H: number) {
  const p = s.pts;
  ctx.strokeStyle = s.c;
  ctx.fillStyle = s.c;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (p.length === 1) {
    ctx.beginPath();
    ctx.arc(p[0].x * W, p[0].y * H, p[0].w / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1];
    const b = p[i];
    const m = p[i - 2] ?? a;
    ctx.beginPath();
    ctx.lineWidth = (a.w + b.w) / 2;
    ctx.moveTo(((m.x + a.x) / 2) * W, ((m.y + a.y) / 2) * H);
    ctx.quadraticCurveTo(a.x * W, a.y * H, ((a.x + b.x) / 2) * W, ((a.y + b.y) / 2) * H);
    ctx.stroke();
  }
}

function draw(c: HTMLCanvasElement | null, list: Stroke[]) {
  const ctx = c?.getContext("2d");
  if (!c || !ctx) return;
  const W = c.clientWidth;
  const H = c.clientHeight;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, c.width, c.height);
  const dpr = c.width / Math.max(W, 1);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  list.forEach((s) => paint(ctx, s, W, H));
}

export function InkPad({ email }: { email: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const [ink, setInk] = useState(inks[0]);
  const [count, setCount] = useState(0);
  const name = useVisitor().trim();

  const redraw = () => draw(canvas.current, strokes.current);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const fit = () => {
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2.5);
      c.width = Math.round(c.clientWidth * dpr);
      c.height = Math.round(c.clientHeight * dpr);
      draw(c, strokes.current);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let cur: Stroke | null = null;
    let last = { x: 0, y: 0, t: 0 };
    const at = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, r };
    };
    const down = (e: PointerEvent) => {
      e.preventDefault();
      c.setPointerCapture(e.pointerId);
      const p = at(e);
      cur = { c: c.dataset.ink ?? inks[0].hex, pts: [{ x: p.x, y: p.y, w: 3.2 }] };
      strokes.current.push(cur);
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      draw(c, strokes.current);
    };
    const move = (e: PointerEvent) => {
      if (!cur) return;
      const p = at(e);
      const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);
      if (dist < 1.2) return;
      const v = dist / Math.max(e.timeStamp - last.t, 1);
      const prev = cur.pts[cur.pts.length - 1].w;
      // Faster strokes thin out, like a real nib.
      const w = prev * 0.6 + Math.min(Math.max(4.4 - v * 1.6, 1.4), 4.6) * (e.pressure > 0 && e.pointerType === "pen" ? 0.6 + e.pressure : 1) * 0.4;
      cur.pts.push({ x: p.x, y: p.y, w });
      last = { x: e.clientX, y: e.clientY, t: e.timeStamp };
      draw(c, strokes.current);
    };
    const up = () => {
      if (!cur) return;
      cur = null;
      setCount(strokes.current.length);
    };
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    return () => {
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointercancel", up);
    };
  }, []);

  const clear = () => {
    strokes.current = [];
    setCount(0);
    redraw();
  };
  const undo = () => {
    strokes.current.pop();
    setCount(strokes.current.length);
    redraw();
  };

  const who = name || "a visitor";
  const subject = `Hello from ${who}`;
  const body = `Hi Tushar,\n\n\n\n— ${name || ""}\n(signed on your site)`;
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const signed = count > 0 || !!name;

  return (
    <div className="ink" data-signed={signed ? "" : undefined}>
      <div className="ink-pad">
        <span className="ink-k" aria-hidden="true">
          Sign here
        </span>
        <canvas
          ref={canvas}
          className="ink-canvas"
          data-ink={ink.hex}
          role="img"
          aria-label="Signature pad. Draw with a mouse, pen or finger, or type your name below instead."
        />
        {count === 0 ? (
          <span className={`ink-typed ${name ? "" : "is-empty"}`.trim()} aria-hidden="true">
            {name || "your signature"}
          </span>
        ) : null}
        <span className="ink-x" aria-hidden="true">
          ×
        </span>
        <span className="ink-line" aria-hidden="true" />
        <div className="ink-tools">
          <div className="ink-swatches" role="group" aria-label="Ink colour">
            {inks.map((i) => (
              <button
                type="button"
                key={i.id}
                aria-pressed={ink.id === i.id}
                aria-label={`${i.label} ink`}
                style={{ background: i.hex }}
                onClick={() => setInk(i)}
              />
            ))}
          </div>
          <button type="button" className="ink-btn" onClick={undo} disabled={count === 0}>
            Undo
          </button>
          <button type="button" className="ink-btn" onClick={clear} disabled={count === 0}>
            Clear
          </button>
        </div>
      </div>

      <div className="ink-send">
        <NameField className="ink-name" label="Sign with your name" placeholder="type your name" />
        <a className="ink-go" href={href}>
          <span>{name ? `Send it, ${name}` : count ? "Send it, signed" : "Send a hello"}</span>
          <i aria-hidden="true">→</i>
        </a>
      </div>
      <p className="ink-note">
        Opens your mail app with your name filled in. The drawing never leaves this page.
      </p>
    </div>
  );
}
