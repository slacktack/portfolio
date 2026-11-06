"use client";

import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

export function Unfurl({ children, as: Tag = "div", className = "", delay = 0, style }: { children: ReactNode; as?: ElementType; className?: string; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setIn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setIn(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`mo-unfurl ${className}`} data-in={inView ? "" : undefined} style={{ ...style, "--mo-dl": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

export type Origin = { x: number; y: number };

export const originOf = (el: Element | null): Origin => {
  if (!el) return { x: innerWidth / 2, y: innerHeight / 2 };
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

export function GrowDialog({ open, origin, onClose, label, children, className = "" }: { open: boolean; origin: Origin | null; onClose: () => void; label: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [closing, setClosing] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      document.documentElement.classList.add("mo-locked");
    }
    return () => window.clearTimeout(timer.current);
  }, [open]);

  useEffect(() => () => document.documentElement.classList.remove("mo-locked"), []);

  const shut = () => {
    if (closing) return;
    setClosing(true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(
      () => {
        ref.current?.close();
        document.documentElement.classList.remove("mo-locked");
        setClosing(false);
        onClose();
      },
      reduce ? 0 : 320
    );
  };

  if (!open) return null;
  const o = origin ?? { x: 0, y: 0 };
  return (
    <dialog
      ref={ref}
      className={`mo-dialog ${className}`}
      aria-label={label}
      data-lenis-prevent=""
      data-closing={closing ? "" : undefined}
      style={{ "--ox": `${o.x}px`, "--oy": `${o.y}px` } as CSSProperties}
      onCancel={(e) => {
        e.preventDefault();
        shut();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) shut();
      }}
    >
      <div className="mo-dialog-in">
        <button type="button" className="mo-x" onClick={shut} aria-label="Close">
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <Leaves />
        {children}
      </div>
    </dialog>
  );
}

export function Leaf({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg className={`mo-leaf ${className}`} style={style} viewBox="0 0 40 60" aria-hidden="true">
      <path d="M20 58C6 44 2 26 20 2c18 24 14 42 0 56z" />
      <path className="mo-leaf-vein" d="M20 56V10" />
    </svg>
  );
}

function Leaves() {
  return (
    <span className="mo-dleaves" aria-hidden="true">
      <Leaf style={{ "--r": "-38deg", "--x": "0", "--d": "120ms" } as CSSProperties} />
      <Leaf style={{ "--r": "-8deg", "--x": "1", "--d": "200ms" } as CSSProperties} />
      <Leaf style={{ "--r": "26deg", "--x": "2", "--d": "280ms" } as CSSProperties} />
    </span>
  );
}

export function Arrow({ up = false }: { up?: boolean }) {
  return (
    <svg className="mo-arrow" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path d={up ? "M4 12L12 4M6 4h6v6" : "M2 8h11M9 4l4 4-4 4"} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// A hanging fern drawn in strokes; it grows in once and then breathes.
export function Fern({ className = "" }: { className?: string }) {
  const fronds = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg className={`mo-fern ${className}`} viewBox="0 0 200 320" aria-hidden="true">
      <path className="mo-fern-stem" d="M100 0C100 80 96 160 104 300" />
      {fronds.map((i) => {
        const y = 40 + i * 30;
        const w = 30 + Math.sin((i / 8) * Math.PI) * 52;
        return (
          <g key={i} className="mo-fern-pair" style={{ "--d": `${i * 90}ms`, transformOrigin: `100px ${y}px` } as CSSProperties}>
            <path d={`M100 ${y}C${100 - w * 0.4} ${y - 4} ${100 - w * 0.8} ${y + 4} ${100 - w} ${y + 22}C${100 - w * 0.6} ${y + 18} ${100 - w * 0.3} ${y + 14} 100 ${y}z`} />
            <path d={`M102 ${y + 8}C${102 + w * 0.4} ${y + 4} ${102 + w * 0.8} ${y + 12} ${102 + w} ${y + 30}C${102 + w * 0.6} ${y + 26} ${102 + w * 0.3} ${y + 22} 102 ${y + 8}z`} />
          </g>
        );
      })}
    </svg>
  );
}
