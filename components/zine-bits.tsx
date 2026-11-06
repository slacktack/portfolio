"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type BandProps = { items: string[]; tone?: "red" | "blue" | "ink" | "butter"; reverse?: boolean; tilt?: number; label?: string };

// A taped-on sticker strip that loops; the second copy is decorative.
export function StickerBand({ items, tone = "red", reverse = false, tilt = 0, label = "Numbers from the work" }: BandProps) {
  const row = (hidden: boolean) => (
    <ul className="zb-row" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={`${t}-${i}`}>
          <span>{t}</span>
          <i aria-hidden="true">✶</i>
        </li>
      ))}
    </ul>
  );
  return (
    <div
      className="zb"
      data-tone={tone}
      data-reverse={reverse ? "" : undefined}
      style={{ "--zb-tilt": `${tilt}deg` } as CSSProperties}
      role="region"
      aria-label={label}
    >
      <div className="zb-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

type CutProps = { src: string; poster: string; className?: string; label: string; style?: CSSProperties };

// A screen recording pasted on like a clipping; plays only while on screen.
export function CutVideo({ src, poster, className = "", label, style }: CutProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className={`zcut ${className}`.trim()} style={style}>
      <video ref={ref} src={src} poster={poster} muted loop playsInline preload="metadata" aria-label={label} />
    </figure>
  );
}
