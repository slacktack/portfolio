"use client";

import Link from "next/link";
import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import type { View } from "../types";

export const css = (o: Record<string, string | number>) => o as CSSProperties;

export const chapters = [
  { id: "home", label: "Home", title: "Title sequence", href: "/" },
  { id: "scenes", label: "Scenes", title: "Scene selection", href: "/systems" },
  { id: "reel", label: "Reel", title: "The reel", href: "/projects" },
  { id: "lab", label: "Lab", title: "Practical effects", href: "/lab" },
  { id: "commentary", label: "Commentary", title: "Director's commentary", href: "/notes" },
  { id: "credits", label: "Credits", title: "Cast and crew", href: "/about" },
] as const;

export function chapterOf(view: View) {
  const map: Partial<Record<View, number>> = { home: 0, systems: 1, system: 1, projects: 2, lab: 3, notes: 4, note: 4, about: 5 };
  return map[view] ?? -1;
}

// Decorative runtime: the whole film is twelve minutes on the scrubber.
export const RUNTIME = 12 * 60;

export function tc(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}

let playing = false;
const subs = new Set<() => void>();
export const player = {
  get: () => playing,
  set(v: boolean) {
    if (v === playing) return;
    playing = v;
    subs.forEach((f) => f());
  },
  sub(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

export function usePlaying() {
  return useSyncExternalStore(player.sub, player.get, () => false);
}

const posters: Record<string, string> = {
  flights: "/assets/video/bh-flights.jpg",
  hotels: "/assets/video/bh-hotels.jpg",
  food: "/assets/video/bh-food.jpg",
  grocery: "/assets/video/bh-grocery.jpg",
};
export const posterFor = (slug: string) => posters[slug];

// Wide-tracked title; letters slide in from wider tracking.
export function Wide({ text, className, as = "span" }: { text: string; className?: string; as?: "span" | "h1" | "h2" | "h3" }) {
  const Tag = as;
  const words = text.toUpperCase().split(" ");
  const total = text.length;
  const mid = (total - 1) / 2;
  const starts = words.map((_, wi) => words.slice(0, wi).reduce((a, w) => a + w.length + 1, 0));
  return (
    <Tag className={`ab-wide ${className ?? ""}`.trim()} aria-label={text} style={css({ "--ab-len": total, "--ab-wlen": Math.max(...words.map((w) => w.length)) })}>
      {words.map((w, wi) => (
        <span className="ab-word" key={wi} aria-hidden="true">
          {[...w].map((c, ci) => {
            const k = starts[wi] + ci;
            return (
              <span key={k} className="ab-ch" style={css({ "--ab-d": (k - mid).toFixed(1), "--ab-i": k })}>
                {c}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

// Grayscale media pushed into deep teal and cyan.
export function Duo({ src, alt, video, className, tone = "cyan" }: { src: string; alt: string; video?: string; className?: string; tone?: "cyan" | "flare" }) {
  return (
    <span className={`ab-duo ab-duo-${tone} ${className ?? ""}`.trim()}>
      {video ? (
        <video src={video} poster={src} muted playsInline autoPlay loop preload="metadata" aria-label={alt} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      )}
      <i className="ab-duo-a" aria-hidden="true" />
      <i className="ab-duo-b" aria-hidden="true" />
    </span>
  );
}

// Abstract frame for systems without a recording.
export function Art({ seed, label }: { seed: number; label?: string }) {
  const r = (n: number) => ((Math.sin(seed * 91.7 + n * 12.9) + 1) / 2).toFixed(3);
  return (
    <span className="ab-art" style={css({ "--ab-x": r(1), "--ab-y": r(2), "--ab-r": `${Math.round(+r(3) * 60 - 30)}deg` })} aria-hidden="true">
      <i />
      <i />
      <i />
      {label ? <b>{label}</b> : null}
    </span>
  );
}

export function Shot({ n, label, children, className, id }: { n: string; label: string; children: ReactNode; className?: string; id?: string }) {
  return (
    <section className={`ab-shot ${className ?? ""}`.trim()} id={id} data-shot={`${n} · ${label}`}>
      <span className="ab-shot-tag" data-ab="">
        <b>Shot {n}</b>
        <span>{label}</span>
      </span>
      {children}
    </section>
  );
}

export function NextChapter({ view }: { view: View }) {
  const c = chapterOf(view);
  const next = chapters[(c + 1) % chapters.length];
  return (
    <Link href={next.href} className="ab-next" data-ab="">
      <span className="ab-next-k">{c === chapters.length - 1 ? "Rewind to the start" : "Next chapter"}</span>
      <Wide text={next.title} className="ab-next-t" />
      <span className="ab-next-go" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22">
          <path d="M8 5l11 7-11 7z" fill="currentColor" />
        </svg>
      </span>
      <i className="ab-next-flare" aria-hidden="true" />
    </Link>
  );
}

export function PlayGlyph({ on }: { on: boolean }) {
  return on ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <rect x="6" y="5" width="4" height="14" fill="currentColor" />
      <rect x="14" y="5" width="4" height="14" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M8 5l11 7-11 7z" fill="currentColor" />
    </svg>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function Out() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
      <path d="M8 16L16 8M9 8h7v7" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
