"use client";

import { useEffect, useRef } from "react";

// Dust drifting through the spot lamp. Static when motion is reduced.
export function Motes() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(1.5, devicePixelRatio || 1);
    let w = 0;
    let h = 0;
    const fit = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    const motes = Array.from({ length: 54 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.00006,
      vy: -0.00002 - Math.random() * 0.00005,
      p: Math.random() * Math.PI * 2,
      warm: Math.random() < 0.62,
    }));
    let raf = 0;
    let last = performance.now();
    let seen = true;
    const io = new IntersectionObserver(([e]) => {
      seen = e.isIntersecting;
      if (seen && !raf && !still) raf = requestAnimationFrame(draw);
    });
    io.observe(c);
    function draw(now: number) {
      const dt = Math.min(64, now - last);
      last = now;
      ctx!.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.p += dt * 0.0012;
        if (m.y < -0.02) m.y = 1.02;
        if (m.x < -0.02) m.x = 1.02;
        if (m.x > 1.02) m.x = -0.02;
        // brighter inside the lamp cone, which is centred and widens downward
        const cone = Math.max(0, 1 - Math.abs(m.x - 0.5) / (0.16 + m.y * 0.34));
        const a = (0.12 + cone * 0.6) * (0.55 + 0.45 * Math.sin(m.p));
        ctx!.fillStyle = m.warm ? `rgba(255,196,150,${a})` : `rgba(170,184,255,${a * 0.8})`;
        ctx!.beginPath();
        ctx!.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      raf = !still && seen && !document.hidden ? requestAnimationFrame(draw) : 0;
    }
    const vis = () => {
      if (!document.hidden && !raf && !still) {
        last = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", vis);
    draw(last);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);
  return <canvas className="nt-motes" ref={ref} aria-hidden="true" />;
}
