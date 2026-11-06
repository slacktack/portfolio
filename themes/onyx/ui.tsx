"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { openThemes } from "@/components/skin";
import type { View } from "../types";

export const stations: { n: string; label: string; href: string; views: View[]; line: string }[] = [
  { n: "01", label: "Arrival", href: "/", views: ["home"], line: "The platform" },
  { n: "02", label: "Systems", href: "/systems", views: ["systems", "system"], line: "Production work" },
  { n: "03", label: "Works", href: "/projects", views: ["projects"], line: "Things that ship" },
  { n: "04", label: "Lab", href: "/lab", views: ["lab"], line: "The site, taken apart" },
  { n: "05", label: "Notes", href: "/notes", views: ["notes", "note"], line: "Field notes" },
  { n: "06", label: "Studio", href: "/about", views: ["about"], line: "Who works here" },
];

export function stationOf(view: View) {
  return stations.findIndex((s) => s.views.includes(view));
}

// tiny localStorage-backed stores
function makeStore(key: string) {
  const subs = new Set<() => void>();
  let val: string | null = null;
  const read = () => {
    if (val === null) {
      try {
        val = localStorage.getItem(key) ?? "";
      } catch {
        val = "";
      }
    }
    return val;
  };
  return {
    get: read,
    set(v: string) {
      val = v;
      try {
        localStorage.setItem(key, v);
      } catch {}
      subs.forEach((f) => f());
    },
    sub(f: () => void) {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}

const starStore = makeStore("onyx-stars");
const negStore = makeStore("onyx-negative");
export const STAR_TOTAL = 5;

export function useStars() {
  const raw = useSyncExternalStore(starStore.sub, starStore.get, () => "");
  const found = raw ? raw.split(",") : [];
  const collect = (id: string) => {
    if (!found.includes(id)) starStore.set([...found, id].join(","));
  };
  const reset = () => starStore.set("");
  return { found, collect, reset };
}

export function useNegative() {
  const on = useSyncExternalStore(negStore.sub, negStore.get, () => "") === "1";
  return { on, toggle: () => negStore.set(on ? "" : "1") };
}

export function Star({ id, className = "" }: { id: string; className?: string }) {
  const { found, collect } = useStars();
  const got = found.includes(id);
  return (
    <button
      type="button"
      className={`on-star ${className}`}
      data-got={got || undefined}
      aria-label={got ? "Star collected" : "A hidden star. Collect it"}
      aria-pressed={got}
      data-cursor="✦"
      onClick={() => collect(id)}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" />
      </svg>
    </button>
  );
}

export function Rail({ view }: { view: View }) {
  const cur = stationOf(view);
  const { found } = useStars();
  const neg = useNegative();
  const p = cur < 0 ? 0 : cur / (stations.length);
  return (
    <nav className="on-rail" aria-label="Stations">
      <div className="on-rail-line" aria-hidden="true">
        <span style={{ transform: `scaleX(${p})` }} />
      </div>
      <ol className="on-stops">
        {stations.map((s, i) => (
          <li key={s.n}>
            <Link
              href={s.href}
              className="on-stop"
              data-cursor={s.n}
              data-state={i === cur ? "here" : i < cur ? "past" : "ahead"}
              aria-current={i === cur ? "page" : undefined}
            >
              <i className="on-dot" />
              <b>{s.n}</b>
              <span>{s.label}</span>
            </Link>
          </li>
        ))}
        <li>
          <button type="button" className="on-stop on-stop-themes" data-cursor="07" onClick={() => openThemes()}>
            <i className="on-dot" />
            <b>07</b>
            <span>Themes</span>
            <em aria-hidden="true">
              <u />
              <u />
            </em>
          </button>
        </li>
      </ol>
      <div className="on-rail-tools">
        <button
          type="button"
          className="on-tool"
          aria-pressed={neg.on}
          onClick={neg.toggle}
          title="Negative mode"
        >
          <i className="on-neg-ico" aria-hidden="true" />
          <span>Negative</span>
        </button>
        <span className="on-tool on-count" aria-live="polite" title="Hidden stars found">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z" />
          </svg>
          {found.length} / {STAR_TOTAL}
        </span>
      </div>
    </nav>
  );
}

export function Counter({ n }: { n: string }) {
  return (
    <span className="on-counter" aria-hidden="true">
      {n.split("").map((d, i) => (
        <span key={i} className="on-digit" style={{ ["--on-d" as string]: i }}>
          <span>{d}</span>
        </span>
      ))}
    </span>
  );
}

export function StationHead({
  n,
  sub,
  label,
  title,
  lede,
  children,
}: {
  n: string;
  sub?: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="on-head">
      <div className="on-head-num">
        <Counter n={n} />
        <span className="on-head-of">
          {sub ?? `/ 0${stations.length}`}
          <b>{label}</b>
        </span>
      </div>
      <div className="on-head-copy">
        <h1 className="on-head-title on-rv">{title}</h1>
        {lede ? <p className="on-head-lede on-rv">{lede}</p> : null}
        {children}
      </div>
    </header>
  );
}

export function useReveal(dep: string) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    el.querySelectorAll(".on-rv").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [dep]);
  return root;
}

export function Rule({ label }: { label?: string }) {
  return (
    <div className="on-rule on-rv" role="presentation">
      <span />
      {label ? <b>{label}</b> : null}
      <span />
    </div>
  );
}
