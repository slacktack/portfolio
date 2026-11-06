"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { catOf, inCat, type Cat, type Work } from "./data";

type Pick = (kind: "project" | "lab", slug: string) => void;

const tone: Record<string, string> = { systems: "var(--nt-flare)", projects: "var(--nt-peri)", lab: "var(--nt-amber)", notes: "var(--nt-mint)" };

function Tile({ w, i, lit, onLight, onPick }: { w: Work; i: number; lit: boolean; onLight: (i: number) => void; onPick: Pick }) {
  const style = { "--nt-i": i, "--nt-tone": tone[catOf[w.kind]] } as CSSProperties;
  const inner = (
    <>
      {w.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={w.thumb} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="nt-tile-glyph" aria-hidden="true">
          {w.title}
        </span>
      )}
      <span className="nt-tile-code">{w.code}</span>
    </>
  );
  const common = {
    className: "nt-tile",
    style,
    "data-lit": lit || undefined,
    "data-kind": w.kind,
    "aria-label": `${w.title}: ${w.line}`,
    onPointerEnter: () => onLight(i),
    onFocus: () => onLight(i),
  };
  if (w.href)
    return (
      <Link href={w.href} {...common}>
        {inner}
      </Link>
    );
  return (
    <button type="button" {...common} onClick={() => onPick(w.kind as "project" | "lab", w.slug)}>
      {inner}
    </button>
  );
}

// Idle loop: a night watchman's torch walks the wall, one work at a time.
export function Wall({ cat, onPick, limit }: { cat: Cat; onPick: Pick; limit?: number }) {
  const list = inCat(cat).slice(0, limit ?? 99);
  const [lit, setLit] = useState(0);
  const [held, setHeld] = useState(false);
  const wall = useRef<HTMLDivElement>(null);
  const beam = useRef<HTMLDivElement>(null);
  const count = list.length;

  useEffect(() => {
    if (held || count < 2 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wall.current;
    let seen = true;
    const io = new IntersectionObserver(([e]) => (seen = e.isIntersecting));
    if (el) io.observe(el);
    const t = window.setInterval(() => {
      if (seen && !document.hidden) setLit((l) => (l + 1) % count);
    }, 2600);
    return () => {
      window.clearInterval(t);
      io.disconnect();
    };
  }, [held, count]);

  useLayoutEffect(() => {
    const w = wall.current;
    const b = beam.current;
    const t = w?.querySelectorAll<HTMLElement>(".nt-tile")[lit];
    if (!w || !b || !t) return;
    b.style.transform = `translate3d(${t.offsetLeft + t.offsetWidth / 2}px, ${t.offsetTop + t.offsetHeight / 2}px, 0)`;
  }, [lit, cat, count]);

  const cur = list[lit] ?? list[0];
  return (
    <div className="nt-wall-wrap" onPointerLeave={() => setHeld(false)} onBlur={() => setHeld(false)}>
      <div className="nt-wall" ref={wall} data-count={count} data-cat={cat}>
        <div className="nt-beam" ref={beam} aria-hidden="true" />
        {list.map((w, i) => (
          <Tile
            key={w.id}
            w={w}
            i={i}
            lit={i === lit}
            onPick={onPick}
            onLight={(n) => {
              setHeld(true);
              setLit(n);
            }}
          />
        ))}
      </div>
      {cur && (
        <p className="nt-wall-cap" key={cur.id}>
          <span>{cur.code}</span>
          <b>{cur.title}</b>
          <em>{cur.line}</em>
        </p>
      )}
    </div>
  );
}
