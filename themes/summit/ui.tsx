"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export type Tone = "navy" | "blue" | "coral";
export const tones: Tone[] = ["navy", "blue", "coral"];
export const toneHex: Record<Tone, string> = { navy: "#071330", blue: "#1268FB", coral: "#FC6F6F" };
export const pad = (n: number) => String(n).padStart(2, "0");

export const chapters = [
  { href: "/", label: "Launch", views: ["home"] },
  { href: "/systems", label: "Products", views: ["systems", "system"] },
  { href: "/projects", label: "Gallery", views: ["projects"] },
  { href: "/lab", label: "Lab", views: ["lab"] },
  { href: "/notes", label: "Journal", views: ["notes", "note"] },
  { href: "/about", label: "Maker", views: ["about"] },
] as const;

export function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function Arrow({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true" className="sm-arrow">
      <path d="M3 9 9 3M4 3h5v5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// Racks for the aisle scene, in perspective toward a vanishing point.
const leds = Array.from({ length: 7 }, (_, r) =>
  Array.from({ length: 6 }, (_, c) => {
    const t = c / 6;
    return { r, c, t, x: 6 + t * 72, y: 30 + r * 15 * (1 - t * 0.78) + t * 34, s: 1.8 - t * 1.2 };
  })
).flat();

export function Scene({ tone, wide = false }: { tone: Tone; wide?: boolean }) {
  const ar = wide ? "xMidYMid slice" : "xMidYMax slice";
  if (tone === "navy")
    return (
      <div className="sm-scene sm-scene-navy" aria-hidden="true">
        <svg viewBox="0 0 200 160" preserveAspectRatio={ar}>
          <defs>
            <linearGradient id="smSnow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#f4f7fd" />
              <stop offset="1" stopColor="#9fb3d9" />
            </linearGradient>
          </defs>
          <g className="sm-l1">
            <path fill="#4a6297" opacity="0.55" d="M0 112 L28 96 L52 104 L84 80 L118 98 L150 84 L200 96 L200 160 L0 160Z" />
          </g>
          <g className="sm-l2">
            <path fill="#1a2d5e" d="M0 160 L52 112 L74 90 L92 66 L102 50 L112 64 L126 82 L160 112 L200 140 L200 160Z" />
            <path fill="url(#smSnow)" d="M92 66 L102 50 L112 64 L107 62 L103 70 L99 63 L94 70Z" />
            <path fill="#2b4380" opacity="0.6" d="M102 50 L112 64 L126 82 L160 112 L200 140 L200 160 L120 160 L114 108 L108 80Z" />
          </g>
          <g className="sm-l3">
            <path fill="#0c1a3e" d="M0 160 L0 132 L36 120 L70 134 L110 124 L150 140 L200 128 L200 160Z" />
          </g>
        </svg>
      </div>
    );
  if (tone === "blue")
    return (
      <div className="sm-scene sm-scene-blue" aria-hidden="true">
        <svg viewBox="0 0 200 160" preserveAspectRatio={ar}>
          <defs>
            <radialGradient id="smGlow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#e8f1ff" />
              <stop offset="0.4" stopColor="#7fb0ff" stopOpacity="0.7" />
              <stop offset="1" stopColor="#1268fb" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g className="sm-l1">
            <circle cx="100" cy="74" r="34" fill="url(#smGlow)" />
            <rect x="94" y="62" width="12" height="22" fill="#eaf2ff" opacity="0.9" />
          </g>
          <g className="sm-l2">
            <path fill="#0a2a78" d="M0 8 L84 56 L84 92 L0 150Z" />
            <path fill="#0a2a78" d="M200 8 L116 56 L116 92 L200 150Z" />
            <path fill="#0f3a9e" d="M0 150 L84 92 L116 92 L200 150 L200 160 L0 160Z" />
            <path stroke="#4d8dff" strokeOpacity="0.35" strokeWidth="0.6" fill="none" d="M100 92 L100 160 M84 92 L40 160 M116 92 L160 160" />
            {leds.map((l) => (
              <g key={`${l.r}-${l.c}`}>
                <rect className="sm-led" style={{ "--d": `${(l.r * 7 + l.c * 13) % 23}` } as CSSProperties} x={l.x} y={l.y} width={l.s * 2.2} height={l.s * 0.8} fill={l.r % 3 === 1 ? "#ff9b9b" : "#8fd0ff"} />
                <rect className="sm-led" style={{ "--d": `${(l.r * 11 + l.c * 5) % 19}` } as CSSProperties} x={200 - l.x - l.s * 2.2} y={l.y} width={l.s * 2.2} height={l.s * 0.8} fill="#8fd0ff" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    );
  return (
    <div className="sm-scene sm-scene-coral" aria-hidden="true">
      <svg viewBox="0 0 200 160" preserveAspectRatio={ar}>
        <g className="sm-l1">
          <circle cx="146" cy="72" r="17" fill="#fff4e4" />
          <circle cx="146" cy="72" r="26" fill="#fff4e4" opacity="0.18" />
        </g>
        <g className="sm-l2">
          <path fill="#f48a7b" d="M0 160 L0 112 C40 104 80 96 120 100 C150 103 176 92 200 86 L200 160Z" />
        </g>
        <g className="sm-l3">
          <path fill="#e9605f" d="M0 160 L0 128 C60 120 120 92 200 70 L200 160Z" opacity="0.92" />
        </g>
      </svg>
    </div>
  );
}

export type Spec = [string, string];

export function BrandCard({
  tone,
  title,
  kicker,
  specs,
  href,
  index,
  className = "",
  cursor = "View",
  children,
  style,
}: {
  tone: Tone;
  title: ReactNode;
  kicker?: string;
  specs: Spec[];
  href?: string;
  index?: number;
  className?: string;
  cursor?: string;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const body = (
    <>
      <Scene tone={tone} />
      <div className="sm-card-fade" />
      {kicker ? <span className="sm-card-k">{kicker}</span> : null}
      <div className="sm-card-body">
        <h3 className="sm-card-title">{title}</h3>
        {children}
        <dl className="sm-spec">
          {specs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          <div>
            <dt>HEX</dt>
            <dd>{toneHex[tone]}</dd>
          </div>
        </dl>
      </div>
    </>
  );
  const props = {
    className: `sm-card sm-card-${tone} ${className}`,
    "data-par": "",
    "data-rise": "",
    style: { ...style, "--i": index ?? 0 } as CSSProperties,
  };
  if (href)
    return (
      <Link href={href} data-cursor={cursor} {...props}>
        {body}
      </Link>
    );
  return <div {...props}>{body}</div>;
}

export function AutoVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);
  return <video ref={ref} src={src} poster={poster} muted loop playsInline preload="none" aria-label={label} />;
}

export function Browser({ url, children, className = "" }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`sm-browser ${className}`}>
      <div className="sm-browser-bar">
        <span className="sm-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="sm-url">{url}</span>
        <span className="sm-browser-sp" aria-hidden="true" />
      </div>
      <div className="sm-browser-screen">{children}</div>
    </div>
  );
}

export function Phone({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`sm-phone ${className}`}>
      <div className="sm-phone-screen">
        <span className="sm-island" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

export function Head({ n, label, title, lede }: { n: string; label: string; title: ReactNode; lede?: ReactNode }) {
  return (
    <header className="sm-head" data-rise="">
      <span className="sm-eyebrow">
        <b>{n}</b>
        {label}
      </span>
      <h1 className="sm-h1">{title}</h1>
      {lede ? <p className="sm-lede">{lede}</p> : null}
    </header>
  );
}
