"use client";

import "./forge.css";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { getNote, getSystem, profile } from "@/lib/site";
import type { Route, ThemeAppProps } from "../types";
import { Wheel } from "./wheel";
import { Lobby } from "./lobby";
import { QuestBoard, Mission } from "./quests";
import { Loadout } from "./loadout";
import { Training } from "./training";
import { Codex, Entry } from "./codex";
import { Sheet } from "./character";
import { Lost } from "./lost";

function World() {
  return (
    <div className="fg-world" aria-hidden="true">
      <div className="fg-smoke">
        <i className="s1" />
        <i className="s2" />
        <i className="s3" />
        <i className="s4" />
      </div>
      <svg className="fg-ridge" viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 230 L120 170 L210 205 L330 120 L420 168 L520 98 L610 150 L700 112 L820 176 L930 104 L1040 160 L1150 118 L1260 182 L1360 140 L1440 170 L1440 360 L0 360 Z" className="r1" />
        <path d="M0 290 L90 250 L200 276 L300 222 L410 262 L540 214 L660 268 L760 236 L880 280 L1010 226 L1120 270 L1240 238 L1340 272 L1440 246 L1440 360 L0 360 Z" className="r2" />
        <path d="M0 330 L160 306 L300 324 L460 300 L640 328 L820 304 L1000 330 L1180 308 L1320 326 L1440 312 L1440 360 L0 360 Z" className="r3" />
      </svg>
      <div className="fg-embers">
        {Array.from({ length: 22 }, (_, i) => (
          <i key={i} style={{ "--e": i } as CSSProperties} />
        ))}
      </div>
      <div className="fg-vignette" />
    </div>
  );
}

function crumbs(route: Route): { label: string; href?: string }[] {
  const home = { label: "Lobby", href: "/" };
  switch (route.view) {
    case "home":
      return [{ label: "Lobby" }];
    case "systems":
      return [home, { label: "Quest board" }];
    case "system":
      return [home, { label: "Quest board", href: "/systems" }, { label: getSystem(route.slug ?? "")?.shortTitle ?? "Unknown" }];
    case "projects":
      return [home, { label: "Loadout" }];
    case "lab":
      return [home, { label: "Training ground" }];
    case "notes":
      return [home, { label: "Codex" }];
    case "note":
      return [home, { label: "Codex", href: "/notes" }, { label: getNote(route.slug ?? "")?.title ?? "Unknown" }];
    case "about":
      return [home, { label: "Character sheet" }];
    default:
      return [home, { label: "Off the map" }];
  }
}

function Hud({ route }: { route: Route }) {
  const skin = useSkin();
  const trail = crumbs(route);
  return (
    <header className="fg-hud">
      <Link href="/" className="fg-hud-id" aria-label="Tushar Gautam, back to the lobby">
        <span className="fg-hud-crest" aria-hidden="true">
          TG
        </span>
        <span className="fg-hud-name">
          <b>{profile.name}</b>
          <small>Backend Engineer · SDE-1</small>
        </span>
      </Link>
      <nav className="fg-hud-trail" aria-label="Breadcrumb">
        <ol>
          {trail.map((c, i) => (
            <li key={`${c.label}-${i}`}>
              {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <button type="button" className="fg-hud-themes" onClick={openThemes} aria-label={`Themes: change the whole site. Current theme ${skin.name}`}>
        <span className="fg-hud-sw" aria-hidden="true">
          {skin.swatches.map((w) => (
            <i key={w.hex} style={{ background: w.hex }} />
          ))}
        </span>
        <span>Themes</span>
      </button>
    </header>
  );
}

function Sparks() {
  const layer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const burst = (x: number, y: number, n: number, big: boolean) => {
      const el = layer.current;
      if (!el) return;
      for (let i = 0; i < n; i++) {
        const s = document.createElement("i");
        const a = (-90 + (Math.random() - 0.5) * (big ? 300 : 140)) * (Math.PI / 180);
        const d = (big ? 26 : 16) + Math.random() * (big ? 40 : 22);
        s.style.cssText = `left:${x}px;top:${y}px;--dx:${(Math.cos(a) * d).toFixed(1)}px;--dy:${(Math.sin(a) * d).toFixed(1)}px;--r:${((a * 180) / Math.PI + 90).toFixed(0)}deg`;
        el.appendChild(s);
        s.addEventListener("animationend", () => s.remove(), { once: true });
      }
    };
    let last: Element | null = null;
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest?.(".fg-plate, .fg-spark");
      if (t && t !== last) burst(e.clientX, e.clientY, 5, false);
      last = t ?? null;
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") burst(e.clientX, e.clientY, 9, true);
    };
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    return () => {
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
    };
  }, []);
  return <div className="fg-sparks" ref={layer} aria-hidden="true" />;
}

function Screen({ route }: { route: Route }) {
  switch (route.view) {
    case "home":
      return <Lobby />;
    case "systems":
      return <QuestBoard />;
    case "system": {
      const s = getSystem(route.slug ?? "");
      return s ? <Mission system={s} /> : <Lost path={route.path} />;
    }
    case "projects":
      return <Loadout />;
    case "lab":
      return <Training />;
    case "notes":
      return <Codex />;
    case "note": {
      const n = getNote(route.slug ?? "");
      return n ? <Entry note={n} /> : <Lost path={route.path} />;
    }
    case "about":
      return <Sheet />;
    default:
      return <Lost path={route.path} />;
  }
}

export default function App({ route }: ThemeAppProps) {
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "Lobby",
      systems: "Quest board",
      projects: "Loadout",
      lab: "Training ground",
      notes: "Codex",
      about: "Character sheet",
      missing: "Off the map",
    };
    const t =
      route.view === "system"
        ? getSystem(route.slug ?? "")?.title
        : route.view === "note"
          ? getNote(route.slug ?? "")?.title
          : titles[route.view];
    document.title = `${t ?? "Off the map"} · ${profile.name}`;
  }, [route.view, route.slug]);

  return (
    <div className="t-forge">
      <World />
      <a className="fg-skip" href="#fg-main">
        Skip to content
      </a>
      <Hud route={route} />
      <main id="fg-main" className="fg-main" key={route.path}>
        <Screen route={route} />
      </main>
      <footer className="fg-foot">
        <span>
          {profile.name} · {profile.location}
        </span>
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button type="button" onClick={openThemes}>
          Change the whole site
        </button>
      </footer>
      <Wheel view={route.view} />
      <Sparks />
    </div>
  );
}
