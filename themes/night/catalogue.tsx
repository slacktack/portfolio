"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { cats, catOf, inCat, works, type Cat, type Work } from "./data";

type Pick = (kind: "project" | "lab", slug: string) => void;

const tones: Record<string, string> = Object.fromEntries(cats.map((c) => [c.id, c.tone]));
const wings: Record<string, string> = { systems: "Wing A · Systems", projects: "Wing B · Projects", lab: "Wing C · Lab", notes: "Reading room · Notes" };

function Item({ w, r, active, onPick }: { w: Work; r: number; active: boolean; onPick: Pick }) {
  const style = { "--nt-r": r, "--tone": tones[catOf[w.kind]] } as CSSProperties;
  const body = (
    <>
      <span className="nt-item-meta">
        <b>{w.code}</b>
        <span>{w.badge}</span>
        <em>On display</em>
      </span>
      <span className="nt-item-t">{w.title}</span>
      <span className="nt-item-l">{w.line}</span>
      <span className="nt-thumb" aria-hidden="true">
        {w.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.thumb} alt="" loading="lazy" decoding="async" />
        ) : (
          <span>{w.code.slice(-2)}</span>
        )}
      </span>
    </>
  );
  const common = { className: "nt-item", style, "data-work-id": w.id, "aria-current": active ? ("true" as const) : undefined };
  return w.href ? (
    <Link href={w.href} {...common}>
      {body}
    </Link>
  ) : (
    <button type="button" {...common} onClick={() => onPick(w.kind as "project" | "lab", w.slug)}>
      {body}
    </button>
  );
}

export function Catalogue({ cat, onCat, activeId, onPick }: { cat: Cat; onCat: (c: Cat) => void; activeId?: string; onPick: Pick }) {
  const [view, setView] = useState<"list" | "grid">(() => {
    try {
      return localStorage.getItem("nt-works-view") === "grid" ? "grid" : "list";
    } catch {
      return "list";
    }
  });
  const pickView = (v: "list" | "grid") => {
    setView(v);
    try {
      localStorage.setItem("nt-works-view", v);
    } catch {
      // storage blocked
    }
  };
  const list = inCat(cat);
  const groups = cat === "all" ? (["systems", "projects", "lab", "notes"] as const).map((g) => ({ g, items: list.filter((w) => catOf[w.kind] === g) })) : [{ g: cat, items: list }];
  let r = 0;
  return (
    <section className="nt-works" aria-label="Catalogue of works">
      <div className="nt-filters">
        <div className="nt-filters-top">
          <h2>
            The catalogue<small>{list.length} works</small>
          </h2>
          <div className="nt-views" role="group" aria-label="Catalogue layout">
            <button type="button" aria-pressed={view === "list"} aria-label="List view" onClick={() => pickView("list")}>
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M0 1h12M0 6h12M0 11h12" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
            <button type="button" aria-pressed={view === "grid"} aria-label="Grid view" onClick={() => pickView("grid")}>
              <svg viewBox="0 0 12 12" aria-hidden="true">
                <path d="M0 0h5v5H0zM7 0h5v5H7zM0 7h5v5H0zM7 7h5v5H7z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
        <div className="nt-chips-row" role="group" aria-label="Filter by category">
          {cats.map((c) => (
            <button key={c.id} type="button" className="nt-chip" aria-pressed={cat === c.id} style={{ "--tone": c.tone } as CSSProperties} onClick={() => onCat(c.id)}>
              <i aria-hidden="true" />
              {c.label}
              <b>{c.id === "all" ? works.length : inCat(c.id).length}</b>
            </button>
          ))}
        </div>
      </div>
      <div className="nt-list" data-view={view} key={cat}>
        {groups.map(({ g, items }) => (
          <div key={g}>
            {cat === "all" && (
              <h3 className="nt-group" style={{ "--tone": tones[g] } as CSSProperties}>
                <i aria-hidden="true" />
                {wings[g]}
              </h3>
            )}
            <div className="nt-items">
              {items.map((w) => (
                <Item key={w.id} w={w} r={r++} active={w.id === activeId} onPick={onPick} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
