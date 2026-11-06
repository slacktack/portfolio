"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { profile } from "@/lib/site";

export const pad = (n: number) => String(n).padStart(2, "0");

export function Aurora({ tone = "violet", className }: { tone?: "violet" | "lime" | "blue" | "dusk"; className?: string }) {
  return (
    <div className={`au-aurora ${className ?? ""}`.trim()} data-tone={tone} aria-hidden="true">
      <i className="au-b1" />
      <i className="au-b2" />
      <i className="au-b3" />
      <i className="au-b4" />
      <span className="au-grain" />
    </div>
  );
}

export function Grain() {
  return <span className="au-grain" aria-hidden="true" />;
}

// Two-line gallery label: "Color / Neutrals".
export function Label({ a, b, className, as = "span" }: { a: ReactNode; b: ReactNode; className?: string; as?: "span" | "p" | "div" }) {
  const Tag = as;
  return (
    <Tag className={`au-label ${className ?? ""}`.trim()}>
      <span>{a}</span>
      <span>{b}</span>
    </Tag>
  );
}

export function Ribbon({ className, d = "M-40 420 C 260 120, 520 520, 820 300 S 1260 40, 1500 220" }: { className?: string; d?: string }) {
  const offs = [0, 9, 18, 27, 36];
  return (
    <svg className={`au-ribbon ${className ?? ""}`.trim()} viewBox="0 0 1440 560" preserveAspectRatio="none" aria-hidden="true" data-au="draw">
      {offs.map((o, i) => (
        <path key={o} d={d} transform={`translate(0 ${o})`} pathLength={1} style={{ "--au-i": i } as CSSProperties} />
      ))}
    </svg>
  );
}

// Serif numeral that counts up once it is on screen.
export function Count({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const m = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
    if (!m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const [, pre, num, post] = m;
    const target = parseFloat(num.replace(/,/g, ""));
    const dec = num.includes(".") ? num.split(".")[1].length : 0;
    const comma = num.includes(",");
    const fmt = (v: number) => {
      const s = v.toFixed(dec);
      return comma ? Number(s).toLocaleString("en-US", { minimumFractionDigits: dec }) : s;
    };
    let raf = 0;
    const io = new IntersectionObserver(
      (es) => {
        if (!es.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1600;
        const step = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const e = 1 - Math.pow(1 - p, 4);
          el.textContent = pre + fmt(target * e) + post;
          if (p < 1) raf = requestAnimationFrame(step);
        };
        el.textContent = pre + fmt(0) + post;
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);
  return (
    <span ref={ref} className={className} aria-label={value}>
      {value}
    </span>
  );
}

export function Arrow({ up }: { up?: boolean }) {
  return (
    <svg className="au-arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      {up ? <path d="M4 12 L12 4 M5.5 4 H12 V10.5" /> : <path d="M2 8 H14 M9 3 L14 8 L9 13" />}
    </svg>
  );
}

// Spread header: "2.1" number, two-line label and a serif title.
export function SpreadHead({ no, a, b, title, children }: { no: string; a: string; b: string; title?: ReactNode; children?: ReactNode }) {
  return (
    <header className="au-shead" data-au>
      <div className="au-shead-k">
        <span className="au-no">{no}</span>
        <Label a={a} b={b} />
      </div>
      {title ? <h2 className="au-shead-t">{title}</h2> : null}
      {children}
    </header>
  );
}

export function Colophon() {
  return (
    <footer className="au-colophon">
      <Aurora tone="dusk" />
      <div className="au-colophon-in">
        <Label a="Enquiries" b={profile.availability} />
        <a className="au-colophon-mail" href={`mailto:${profile.email}`} data-cursor="Write">
          {profile.email.split("@")[0]}
          <em>@{profile.email.split("@")[1]}</em>
        </a>
        <div className="au-colophon-grid">
          <Label a="Exhibition" b={`${profile.name}, ${profile.role}`} />
          <Label a="Venue" b={profile.location} />
          <Label a="Set in" b="Roboto Serif & Inter" />
          <nav aria-label="Footer" className="au-colophon-nav">
            <Link href="/">Index</Link>
            <Link href="/systems">Exhibits</Link>
            <Link href="/projects">Salon</Link>
            <Link href="/lab">Bench</Link>
            <Link href="/notes">Essays</Link>
            <Link href="/about">Statement</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
