"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { notes, systems } from "@/lib/site";
import type { View } from "../types";

export const ISSUE = "01";
export const TOTAL = 48;
export const MAST = "The Invisible Layer";

export type Section = { n: string; label: string; href: string; views: View[]; p: number };

export const sections: Section[] = [
  { n: "01", label: "Cover", href: "/", views: ["home"], p: 1 },
  { n: "02", label: "Systems", href: "/systems", views: ["systems", "system"], p: 4 },
  { n: "03", label: "Plates", href: "/projects", views: ["projects"], p: 28 },
  { n: "04", label: "Laboratory", href: "/lab", views: ["lab"], p: 36 },
  { n: "05", label: "Essays", href: "/notes", views: ["notes", "note"], p: 40 },
  { n: "06", label: "Colophon", href: "/about", views: ["about"], p: 46 },
];

export const sysPage = (slug: string) => 6 + Math.max(0, systems.findIndex((s) => s.slug === slug)) * 2;
export const notePage = (slug: string) => 41 + Math.max(0, notes.findIndex((n) => n.slug === slug)) * 2;
export const pad = (n: number) => String(n).padStart(2, "0");

// Decorative page span for the counter: [first, last].
export function pageSpan(view: View, slug?: string): [number, number] {
  if (view === "system" && slug) return [sysPage(slug), sysPage(slug) + 1];
  if (view === "note" && slug) return [notePage(slug), notePage(slug) + 1];
  if (view === "systems") return [4, 5];
  if (view === "missing") return [404, 404];
  const i = sections.findIndex((s) => s.views.includes(view));
  const next = sections[i + 1]?.p ?? TOTAL + 1;
  return [sections[i]?.p ?? 1, next - 1];
}

const R: [number, string][] = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];
export function roman(n: number) {
  let out = "";
  for (const [v, s] of R) while (n >= v) {
    out += s;
    n -= v;
  }
  return out;
}

export const d = (i: number) => ({ "--gd": `${i * 70}ms` }) as CSSProperties;

// Line-clip reveal: each line slides up from behind its own mask.
export function Lines({ lines, className, as: Tag = "span", delay = 0 }: { lines: ReactNode[]; className?: string; as?: "h1" | "h2" | "h3" | "p" | "span"; delay?: number }) {
  return (
    <Tag className={`gr-lines ${className ?? ""}`.trim()} data-rv="">
      {lines.map((l, i) => (
        <span className="gr-line" key={i}>
          <span style={d(i + delay)}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Kicker({ children, n }: { children: ReactNode; n?: string }) {
  return (
    <p className="gr-kick" data-rv="">
      {n && <b>{n}</b>}
      <span>{children}</span>
    </p>
  );
}

export function Arrow() {
  return (
    <svg className="gr-arr" viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
      <path d="M2 10 10 2M4 2h6v6" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function Out({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className ?? "gr-link"} href={href} target="_blank" rel="noreferrer">
      {children} <Arrow />
    </a>
  );
}

export function Turn({ href, k, title, p }: { href: string; k: string; title: string; p: number }) {
  return (
    <Link href={href} className="gr-turnover" data-rv="">
      <span className="gr-turnover-k">{k}</span>
      <span className="gr-turnover-t">{title}</span>
      <span className="gr-turnover-p">
        Turn to p.&nbsp;{pad(p)} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

// The single colour object: a Klein-blue slab in a clear acrylic case.
export function Slab({ label = ISSUE, size = "lg" }: { label?: string; size?: "lg" | "sm" }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      el.dataset.on = e.isIntersecting ? "1" : "0";
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const faces = ["f", "b", "l", "r", "t", "u"];
  return (
    <div className={`gr-slab gr-slab-${size}`} ref={ref} aria-hidden="true">
      <div className="gr-slab-floor" />
      <div className="gr-slab-spin">
        <div className="gr-case">
          {faces.map((f) => (
            <i key={f} className={`gr-case-${f}`} />
          ))}
        </div>
        <div className="gr-block">
          {faces.map((f) => (
            <i key={f} className={`gr-block-${f}`}>
              {f === "f" && <b>{label}</b>}
              {f === "b" && <b className="gr-block-mark">TG</b>}
            </i>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Fig({ n, title, children, className }: { n: number | string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <figure className={`gr-fig ${className ?? ""}`.trim()} data-rv="">
      {children}
      <figcaption>
        <b>Fig. {n}</b> — {title}
      </figcaption>
    </figure>
  );
}
