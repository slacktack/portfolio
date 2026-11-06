"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type SVGProps } from "react";
import { stage } from "@/lib/site";

type IconProps = SVGProps<SVGSVGElement>;
const base = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Ico = {
  move: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M5 3.5 18.5 10l-6 1.6L10 18z" />
    </svg>
  ),
  frame: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M8 3v18M16 3v18M3 8h18M3 16h18" />
    </svg>
  ),
  board: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <rect x="3.5" y="4" width="8" height="10" rx="1" transform="rotate(-6 7.5 9)" />
      <rect x="12.5" y="9" width="8" height="10" rx="1" transform="rotate(5 16.5 14)" />
    </svg>
  ),
  lab: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m10 8.5 5.5 3.5-5.5 3.5z" fill="currentColor" />
    </svg>
  ),
  doc: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4M9 12h6M9 16h6" />
    </svg>
  ),
  credits: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M5 4h14v16H5z" />
      <path d="M9 9h6M8 13h8M10 17h4" />
    </svg>
  ),
  layers: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  ),
  plus: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  minus: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  ),
  arrow: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  ),
  back: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  ),
  out: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  ),
  close: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  ),
  comp: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="m12 3 4 4-4 4-4-4zM12 13l4 4-4 4-4-4zM7 8l4 4-4 4-4-4zM17 8l4 4-4 4-4-4z" />
    </svg>
  ),
  fit: (p: IconProps) => (
    <svg {...base} {...p} aria-hidden="true">
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
    </svg>
  ),
};

// Dashed selection box with square handles; snaps in on hover via CSS.
export function Sel({ dims, tone }: { dims?: string; tone?: "light" }) {
  return (
    <span className="em-sel" data-tone={tone} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
      {dims ? <b>{dims}</b> : null}
    </span>
  );
}

export function FrameLabel({ n, name, dims }: { n?: string; name: string; dims?: string }) {
  return (
    <span className="em-flabel">
      <span>
        <Ico.frame width={11} height={11} />
        {n ? `Frame ${n} — ` : ""}
        {name}
      </span>
      {dims ? <em>{dims}</em> : null}
    </span>
  );
}

export function Pin({ n, style }: { n: number | string; style?: CSSProperties }) {
  return (
    <span className="em-pin" style={style} aria-hidden="true">
      {n}
    </span>
  );
}

const tilts = [-2.4, 1.8, -1.2, 2.6, -2, 1.3];

export function Sticky({ tone = "peach", i = 0, k, title, children, tape }: { tone?: "peach" | "butter" | "pink" | "coral" | "crimson" | "cobalt"; i?: number; k?: string; title: string; children: ReactNode; tape?: boolean }) {
  return (
    <article className="em-sticky" data-tone={tone} data-em-in="" style={{ "--em-r": `${tilts[i % tilts.length]}deg`, "--em-d": `${(i % 4) * 90}ms` } as CSSProperties}>
      {tape ? <span className="em-tape" aria-hidden="true" /> : null}
      {k ? <span className="em-sticky-k">{k}</span> : null}
      <h3>{title}</h3>
      <div className="em-sticky-b">{children}</div>
    </article>
  );
}

// Live measured width, shown as a redline readout.
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<[number, number]>([0, 0]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize([Math.round(e.contentRect.width), Math.round(e.contentRect.height)]));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function RedlineH({ w, label }: { w: number; label?: string }) {
  return (
    <span className="em-rl em-rl-h" aria-hidden="true">
      <b>{label ?? (w ? `${w}` : "—")}</b>
    </span>
  );
}

export function RedlineV({ h }: { h: number }) {
  return (
    <span className="em-rl em-rl-v" aria-hidden="true">
      <b>{h ? `${h}` : "—"}</b>
    </span>
  );
}

// Reveal: anything with [data-em-in] gets data-in="1" when it scrolls into view.
export function useReveal(key: string, root?: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const scope = root?.current ?? document;
    const els = scope.querySelectorAll<HTMLElement>("[data-em-in]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((e) => (e.dataset.emIn = "1"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.emIn = "1";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    els.forEach((e) => {
      if (e.dataset.emIn !== "1" && !e.closest(".em-board")) io.observe(e);
    });
    return () => io.disconnect();
  }, [key, root]);
}

export function SplitTitle({ text }: { text: string }) {
  const words = text.split(" ");
  if (words.length < 2) return <em className="em-serif">{text}</em>;
  return (
    <>
      {words.slice(0, -1).join(" ")} <em className="em-serif">{words[words.length - 1]}</em>
    </>
  );
}

export const posterFor = (slug: string) => stage.find((s) => s.slug === `bh-${slug}` || s.slug === slug);

export const grads = [
  "linear-gradient(135deg, #ff8a6b 0%, #e8382b 48%, #8e1020 100%)",
  "linear-gradient(150deg, #ffd2b8 0%, #ff7a59 55%, #c81e1e 100%)",
  "linear-gradient(135deg, #f7ede6 0%, #ffb38f 45%, #e8382b 100%)",
  "linear-gradient(160deg, #e8382b 0%, #8e1020 70%, #3a0a10 100%)",
  "linear-gradient(135deg, #ffc2b0 0%, #ff5a4a 50%, #2747e8 130%)",
  "linear-gradient(145deg, #c81e1e 0%, #ff6b57 60%, #ffd9c2 100%)",
];

export const gradFor = (i: number) => grads[i % grads.length];

export function Swatches({ list }: { list: string[] }) {
  return (
    <span className="em-swatch-strip" aria-hidden="true">
      {list.map((c) => (
        <i key={c} style={{ background: c }}>
          <em>{c.replace("#", "").toUpperCase()}</em>
        </i>
      ))}
    </span>
  );
}
