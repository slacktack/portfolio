"use client";

import { useEffect, useRef } from "react";

type MarqueeProps = {
  items: string[];
  ariaLabel?: string;
};

export function Marquee({ items, ariaLabel = "Selected production metrics" }: MarqueeProps) {
  const track = useRef<HTMLDivElement>(null);

  // Speed follows scroll velocity and reverses when scrolling up.
  useEffect(() => {
    const el = track.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let x = 0;
    let dir = 1;
    let boost = 0;
    let lastY = window.scrollY;
    let raf = 0;
    let last = performance.now();
    const onScroll = () => {
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      if (Math.abs(dy) > 0.5) dir = dy > 0 ? 1 : -1;
      boost = Math.min(boost + Math.abs(dy) * 0.06, 14);
    };
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      boost *= 0.92;
      x -= dir * (60 + boost * 60) * dt;
      const half = el.scrollWidth / 2;
      if (half > 0) x = ((x % half) - half) % half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const group = (
    <div className="marquee-group" aria-hidden="true">
      {items.map((item) => (
        <span className="marquee-item" key={item}>
          {item}
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee" role="region" aria-label={ariaLabel}>
      <div className="marquee-track marquee-js" ref={track}>
        {group}
        {group}
      </div>
    </div>
  );
}
