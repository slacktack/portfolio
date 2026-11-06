"use client";

import { useEffect, useRef } from "react";

type Drop = { x: number; y: number; r: number; z: number; vy: number; ph: number; sp: number };

function sprite(size: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = size / 2;
  const body = g.createRadialGradient(r * 0.7, r * 0.6, r * 0.05, r, r, r);
  body.addColorStop(0, "rgba(40, 92, 104, 0.95)");
  body.addColorStop(0.55, "rgba(10, 30, 38, 0.92)");
  body.addColorStop(0.88, "rgba(6, 16, 22, 0.9)");
  body.addColorStop(1, "rgba(111, 227, 233, 0.55)");
  g.fillStyle = body;
  g.beginPath();
  g.arc(r, r, r * 0.98, 0, Math.PI * 2);
  g.fill();
  const rim = g.createLinearGradient(0, size, size, 0);
  rim.addColorStop(0, "rgba(255, 106, 43, 0.5)");
  rim.addColorStop(0.4, "rgba(255, 106, 43, 0)");
  g.strokeStyle = rim;
  g.lineWidth = Math.max(1, size * 0.03);
  g.beginPath();
  g.arc(r, r, r * 0.92, Math.PI * 0.45, Math.PI * 1.05);
  g.stroke();
  const spec = g.createRadialGradient(r * 0.62, r * 0.48, 0, r * 0.62, r * 0.48, r * 0.38);
  spec.addColorStop(0, "rgba(255, 255, 255, 0.95)");
  spec.addColorStop(0.25, "rgba(200, 250, 252, 0.45)");
  spec.addColorStop(1, "rgba(200, 250, 252, 0)");
  g.fillStyle = spec;
  g.beginPath();
  g.ellipse(r * 0.62, r * 0.48, r * 0.34, r * 0.22, -0.6, 0, Math.PI * 2);
  g.fill();
  return c;
}

// Glossy droplets and motes; sleeps when the tab is hidden.
function Droplets() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.innerWidth < 760;
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const spr = sprite(128);
    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const drops: Drop[] = Array.from({ length: small ? 12 : 22 }, () => {
      const z = Math.random();
      return { x: rnd(0, 1), y: rnd(0, 1), r: 4 + z * z * (small ? 26 : 42), z, vy: rnd(0.004, 0.012) * (0.4 + z), ph: rnd(0, 6.28), sp: rnd(0.2, 0.6) };
    }).sort((a, b) => a.z - b.z);
    const motes = Array.from({ length: small ? 40 : 90 }, () => ({ x: rnd(0, 1), y: rnd(0, 1), s: rnd(0.4, 1.6), v: rnd(0.002, 0.008), o: rnd(0.15, 0.6), c: Math.random() < 0.12 }));

    let raf = 0;
    let last = performance.now();
    let sy = window.scrollY;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      sy += (window.scrollY - sy) * 0.08;
      g.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.y -= m.v * dt * 6;
        if (m.y < -0.02) m.y = 1.02;
        const y = (((m.y * h - sy * 0.05 * m.s) % h) + h) % h;
        g.fillStyle = m.c ? `rgba(255,106,43,${m.o})` : `rgba(160,240,244,${m.o})`;
        g.fillRect(m.x * w, y, m.s, m.s);
      }
      for (const d of drops) {
        d.y -= d.vy * dt;
        d.ph += dt * d.sp;
        if (d.y < -0.15) {
          d.y = 1.15;
          d.x = Math.random();
        }
        const x = d.x * w + Math.sin(d.ph) * 18 * (0.3 + d.z);
        const span = h * 1.3;
        const y = ((((d.y * span - sy * (0.1 + d.z * 0.35)) % span) + span) % span) - h * 0.15;
        const s = d.r * 2 * (1 + Math.sin(d.ph * 1.7) * 0.03);
        g.globalAlpha = 0.45 + d.z * 0.55;
        g.drawImage(spr, x - s / 2, y - s / 2, s, s * (1 - Math.sin(d.ph) * 0.04));
      }
      g.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    const start = () => {
      if (raf || reduce) return;
      last = performance.now();
      raf = requestAnimationFrame(draw);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const vis = () => (document.hidden ? stop() : start());
    if (reduce) {
      draw(performance.now());
      stop();
    } else start();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", vis);
    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  return <canvas ref={ref} className="ab-drops" aria-hidden="true" />;
}

export function Water() {
  return (
    <div className="ab-water" aria-hidden="true">
      <div className="ab-glow" />
      <svg className="ab-ribbons" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="ab-rib-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0a1117" />
            <stop offset="0.45" stopColor="#1d4a55" />
            <stop offset="0.55" stopColor="#3b8d97" />
            <stop offset="0.7" stopColor="#123038" />
            <stop offset="1" stopColor="#0a1117" />
          </linearGradient>
          <linearGradient id="ab-rib-b" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0a1117" />
            <stop offset="0.5" stopColor="#16343d" />
            <stop offset="0.62" stopColor="#2b6c76" />
            <stop offset="1" stopColor="#0a1117" />
          </linearGradient>
          <linearGradient id="ab-rib-hi" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6fe3e9" stopOpacity="0" />
            <stop offset="0.5" stopColor="#c9fbfd" stopOpacity="0.8" />
            <stop offset="1" stopColor="#6fe3e9" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="ab-rib-fl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff6a2b" stopOpacity="0" />
            <stop offset="0.6" stopColor="#ff6a2b" stopOpacity="0.7" />
            <stop offset="1" stopColor="#ff6a2b" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g className="ab-rib-1">
          <path d="M-200 760 C 200 520, 520 980, 900 640 S 1500 260, 1820 460" stroke="url(#ab-rib-a)" strokeWidth="150" fill="none" strokeLinecap="round" />
          <path d="M-200 712 C 200 472, 520 932, 900 592 S 1500 212, 1820 412" stroke="url(#ab-rib-hi)" strokeWidth="2" fill="none" />
        </g>
        <g className="ab-rib-2">
          <path d="M-100 240 C 300 80, 600 420, 1000 260 S 1500 40, 1760 180" stroke="url(#ab-rib-b)" strokeWidth="90" fill="none" strokeLinecap="round" />
          <path d="M-100 210 C 300 50, 600 390, 1000 230 S 1500 10, 1760 150" stroke="url(#ab-rib-hi)" strokeWidth="1.4" fill="none" />
        </g>
        <g className="ab-rib-3">
          <path d="M200 1100 C 500 820, 900 1000, 1200 800 S 1600 700, 1800 820" stroke="url(#ab-rib-b)" strokeWidth="60" fill="none" strokeLinecap="round" />
          <path d="M200 1080 C 500 800, 900 980, 1200 780 S 1600 680, 1800 800" stroke="url(#ab-rib-fl)" strokeWidth="1.4" fill="none" />
        </g>
      </svg>
      <div className="ab-shafts">
        <i />
        <i />
        <i />
      </div>
      <div className="ab-caustics" />
      <Droplets />
      <div className="ab-grain" />
      <div className="ab-vignette" />
    </div>
  );
}
