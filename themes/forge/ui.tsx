"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

export type TabItem = { id: string; label: string; href?: string; count?: string | number };

// Condensed panel tabs: links, anchors or state switches, with a sliding underline on a rail.
export function Tabs({
  items,
  active,
  onSelect,
  label,
  sticky,
}: {
  items: TabItem[];
  active: string;
  onSelect?: (id: string) => void;
  label: string;
  sticky?: boolean;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [bar, setBar] = useState({ x: 0, w: 0 });

  useLayoutEffect(() => {
    const el = rail.current;
    if (!el) return;
    const place = () => {
      const on = el.querySelector<HTMLElement>(`[data-tab="${active}"]`);
      if (!on) return;
      setBar({ x: on.offsetLeft, w: on.offsetWidth });
      const left = on.offsetLeft - el.clientWidth / 2 + on.offsetWidth / 2;
      if (el.scrollWidth > el.clientWidth) el.scrollTo({ left, behavior: "smooth" });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [active, items.length]);

  const stateful = !!onSelect;
  return (
    <div className={`fg-tabs${sticky ? " is-sticky" : ""}`}>
      <div className="fg-tabs-rail" ref={rail} role={stateful ? "tablist" : undefined} aria-label={label}>
        {items.map((t) => {
          const on = t.id === active;
          const inner = (
            <>
              {t.label}
              {t.count !== undefined ? <small>{t.count}</small> : null}
            </>
          );
          if (stateful)
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                data-tab={t.id}
                className={on ? "on" : undefined}
                onClick={() => onSelect?.(t.id)}
              >
                {inner}
              </button>
            );
          if (t.href?.startsWith("#"))
            return (
              <a key={t.id} href={t.href} data-tab={t.id} className={on ? "on" : undefined} aria-current={on ? "true" : undefined}>
                {inner}
              </a>
            );
          return (
            <Link key={t.id} href={t.href ?? "/"} data-tab={t.id} className={on ? "on" : undefined} aria-current={on ? "page" : undefined}>
              {inner}
            </Link>
          );
        })}
        <i className="fg-tabs-bar" style={{ "--x": `${bar.x}px`, "--w": `${bar.w}px` } as CSSProperties} aria-hidden="true" />
      </div>
    </div>
  );
}

export function useSpy(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const key = ids.join("|");
  useEffect(() => {
    const list = key.split("|");
    const els = list.map((id) => document.getElementById(id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [key]);
  return active;
}

type PlateProps = { children: ReactNode; href?: string; external?: boolean; onClick?: () => void; tone?: "ghost"; className?: string };

// Slanted, rough-edged burnt-orange plate.
export function Plate({ children, href, external, onClick, tone, className }: PlateProps) {
  const cls = `fg-plate${tone ? ` is-${tone}` : ""}${className ? ` ${className}` : ""}`;
  const body = <span className="fg-plate-in">{children}</span>;
  if (href && (external || href.startsWith("mailto:")))
    return (
      <a className={cls} href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
        {body}
      </a>
    );
  if (href)
    return (
      <Link className={cls} href={href}>
        {body}
      </Link>
    );
  return (
    <button type="button" className={cls} onClick={onClick}>
      {body}
    </button>
  );
}

export function Panel({ children, className, id, label }: { children: ReactNode; className?: string; id?: string; label?: string }) {
  return (
    <section className={`fg-panel${className ? ` ${className}` : ""}`} id={id} aria-label={label}>
      <i className="fg-corner tl" aria-hidden="true" />
      <i className="fg-corner tr" aria-hidden="true" />
      <i className="fg-corner bl" aria-hidden="true" />
      <i className="fg-corner br" aria-hidden="true" />
      {children}
    </section>
  );
}

export function Head({ k, title, note, as = "h2" }: { k: string; title: ReactNode; note?: ReactNode; as?: "h1" | "h2" | "h3" }) {
  const H = as;
  return (
    <header className="fg-head">
      <span className="fg-k">{k}</span>
      <H className="fg-title">{title}</H>
      {note ? <p className="fg-note">{note}</p> : null}
    </header>
  );
}

export function StatTable({ rows, caption }: { rows: { label: string; value: string; detail?: string }[]; caption?: string }) {
  return (
    <table className="fg-table">
      {caption ? <caption>{caption}</caption> : null}
      <tbody>
        {rows.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            <td className="fg-table-d">{r.detail}</td>
            <td className="fg-table-v">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function Crest({ size = 120, initials = "TG", ribbon }: { size?: number; initials?: string; ribbon?: string }) {
  return (
    <div className="fg-crest" style={{ width: size, height: size * 1.16 }}>
      <svg viewBox="0 0 100 116" aria-hidden="true">
        <defs>
          <linearGradient id="fg-crest-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a3a52" />
            <stop offset="1" stopColor="#231b29" />
          </linearGradient>
          <linearGradient id="fg-crest-r" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2a53a" />
            <stop offset="1" stopColor="#c8692a" />
          </linearGradient>
        </defs>
        <path d="M50 3 L95 17 L92 66 C88 88 70 103 50 113 C30 103 12 88 8 66 L5 17 Z" fill="url(#fg-crest-g)" stroke="url(#fg-crest-r)" strokeWidth="2.4" />
        <path d="M50 12 L86 23 L83 64 C80 81 66 94 50 102 C34 94 20 81 17 64 L14 23 Z" fill="none" stroke="rgba(242,165,58,.28)" strokeWidth="1" />
        <path d="M50 20 L54 30 L50 27 L46 30 Z" fill="#f2a53a" />
      </svg>
      <b>{initials}</b>
      {ribbon ? <span className="fg-crest-ribbon">{ribbon}</span> : null}
    </div>
  );
}

export function Pips({ n, of = 5, label }: { n: number; of?: number; label: string }) {
  return (
    <span className="fg-pips" role="img" aria-label={label} title={label}>
      {Array.from({ length: of }, (_, i) => (
        <i key={i} className={i < n ? "on" : undefined} />
      ))}
    </span>
  );
}

export function Arrow() {
  return (
    <svg className="fg-arrow" viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M3 8h9M8.5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

export function Out() {
  return (
    <svg className="fg-arrow" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
      <path d="M5 11l6-6M6 5h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square" />
    </svg>
  );
}

export function split(metric: string) {
  const i = metric.indexOf(" ");
  if (i < 0) return { value: metric, label: "" };
  const a = metric.slice(0, i);
  const b = metric.slice(i + 1);
  return /^\d/.test(a) ? { value: a, label: b } : { value: b, label: a };
}
