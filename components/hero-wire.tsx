"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; px: number; py: number };

const N = 16;
const ORDER = [0, 4, 5, 1, 3, 7, 6, 2];

export function HeroWire() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    const root = cv?.parentElement;
    if (!cv || !root) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    let t = 0;
    let colors = { ink: "#12110e", accent: "#e8491d" };
    const mouse = { x: -999, y: -999 };
    const chains: P[][] = [];

    const resize = () => {
      const r = root.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const readColors = () => {
      const s = getComputedStyle(document.documentElement);
      colors = {
        ink: s.getPropertyValue("--ink").trim() || colors.ink,
        accent: s.getPropertyValue("--accent").trim() || colors.accent,
      };
    };

    const anchors = () => {
      const box = root.getBoundingClientRect();
      const out: { x: number; y: number }[] = [];
      for (const n of ORDER) {
        const el = root.querySelector<HTMLElement>(`.skx[data-n="${n}"]`);
        if (!el || el.offsetParent === null) continue;
        const r = el.getBoundingClientRect();
        out.push({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 });
      }
      return out;
    };

    const step = () => {
      const pts = anchors();
      const loop = pts.length > 2 ? pts.length : pts.length - 1;
      while (chains.length > loop) chains.pop();
      for (let c = 0; c < loop; c++) {
        const a = pts[c];
        const b = pts[(c + 1) % pts.length];
        let ch = chains[c];
        if (!ch) {
          ch = [];
          for (let i = 0; i < N; i++) {
            const k = i / (N - 1);
            const x = a.x + (b.x - a.x) * k;
            const y = a.y + (b.y - a.y) * k;
            ch.push({ x, y, px: x, py: y });
          }
          chains[c] = ch;
        }
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const rest = (dist * 1.14) / (N - 1);
        for (let i = 1; i < N - 1; i++) {
          const p = ch[i];
          const vx = (p.x - p.px) * 0.97;
          const vy = (p.y - p.py) * 0.97;
          p.px = p.x;
          p.py = p.y;
          p.x += vx;
          p.y += vy + 0.32;
          if (fine) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < 120 && d > 0.01) {
              const f = ((120 - d) / 120) * 4.2;
              p.x += (dx / d) * f;
              p.y += (dy / d) * f;
            }
          }
        }
        ch[0].x = ch[0].px = a.x;
        ch[0].y = ch[0].py = a.y;
        ch[N - 1].x = ch[N - 1].px = b.x;
        ch[N - 1].y = ch[N - 1].py = b.y;
        for (let it = 0; it < 7; it++) {
          for (let i = 0; i < N - 1; i++) {
            const p = ch[i];
            const q = ch[i + 1];
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const d = Math.hypot(dx, dy) || 0.0001;
            const diff = (d - rest) / d;
            const fixA = i === 0;
            const fixB = i + 1 === N - 1;
            const ox = dx * diff * 0.5;
            const oy = dy * diff * 0.5;
            if (!fixA) {
              p.x += ox;
              p.y += oy;
            }
            if (!fixB) {
              q.x -= ox;
              q.y -= oy;
            }
            if (fixA && !fixB) {
              q.x -= ox;
              q.y -= oy;
            }
            if (fixB && !fixA) {
              p.x += ox;
              p.y += oy;
            }
          }
        }
      }
    };

    const trace = (ch: P[]) => {
      ctx.beginPath();
      ctx.moveTo(ch[0].x, ch[0].y);
      for (let i = 1; i < N - 1; i++) {
        const mx = (ch[i].x + ch[i + 1].x) / 2;
        const my = (ch[i].y + ch[i + 1].y) / 2;
        ctx.quadraticCurveTo(ch[i].x, ch[i].y, mx, my);
      }
      ctx.lineTo(ch[N - 1].x, ch[N - 1].y);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const ch of chains) {
        ctx.setLineDash([]);
        ctx.strokeStyle = colors.ink;
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.6;
        trace(ch);
        ctx.stroke();

        ctx.globalAlpha = 1;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 3.2;
        ctx.setLineDash([0.1, 26]);
        ctx.lineDashOffset = -t * 0.9;
        trace(ch);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t += 1;
      if (t % 90 === 0) readColors();
      step();
      draw();
    };

    const move = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => {
      mouse.x = mouse.y = -999;
    };

    resize();
    readColors();
    const ro = new ResizeObserver(resize);
    ro.observe(root);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(root);
    root.addEventListener("pointermove", move, { passive: true });
    root.addEventListener("pointerleave", leave);

    if (still) {
      for (let i = 0; i < 40; i++) step();
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas className="skyx-wire" ref={canvas} aria-hidden="true" />;
}
