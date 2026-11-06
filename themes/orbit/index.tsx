"use client";

import "./orbit.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { openThemes } from "@/components/skin";
import { ThemeTeaser } from "@/components/theme-palette";
import { getNote, getSystem, profile, systems } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { beaconColors, flyMarks, getMark, marks, routeTarget, targetHref, targetId, targetName, type MarkKey } from "./data";
import { PlanetMap } from "./map";
import { AboutView, LabView, MissingView, NoteView, NotesView, PortalView, ProjectsView } from "./pages";
import { SystemView, SystemsView } from "./systems";
import { Arrow, Glyph, Kbd, tint } from "./ui";
import { createWorld, hasWebGL, type Mode, type World } from "./world";

const FLY = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"]);
const wide = () => typeof window !== "undefined" && window.matchMedia("(min-width: 900px)").matches;

export default function App({ route }: ThemeAppProps) {
  const router = useRouter();
  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;
  const tid = targetId(routeTarget({ ...route, view }));

  const [use3d, setUse3d] = useState(() => hasWebGL() && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [night, setNight] = useState(() => {
    try {
      return localStorage.getItem("ob-night") === "1";
    } catch {
      return false;
    }
  });
  const [arrived, setArrived] = useState<string | null>(null);
  const [nearby, setNearby] = useState<string | null>(null);
  const [portal, setPortal] = useState(false);
  const [brief, setBrief] = useState(true);
  const [mode, setMode] = useState<Mode>("overview");

  const world = useRef<World | null>(null);
  const host = useRef<HTMLDivElement>(null);
  const mini = useRef<HTMLCanvasElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const labels = useRef(new Map<string, HTMLElement>());
  const live = useRef({ tid, nearby, open: false, path: route.path });

  const portalOpen = view === "home" && portal && (!use3d || arrived === "portal");
  const open = (!!tid && (!use3d || arrived === tid)) || portalOpen;
  const panelKey = portalOpen ? "portal" : route.path;

  useEffect(() => {
    live.current = { tid, nearby, open, path: route.path };
  });

  const land = useCallback(
    (id: string) => {
      if (id === "portal") {
        setPortal(true);
        if (live.current.path !== "/") router.push("/", { scroll: false });
        world.current?.flyTo("portal");
        return;
      }
      setPortal(false);
      const href = targetHref(id);
      if (!href) return;
      if (href === live.current.path) world.current?.flyTo(id);
      else router.push(href, { scroll: false });
    },
    [router]
  );

  const close = useCallback(() => {
    setPortal(false);
    if (live.current.path !== "/") router.push("/", { scroll: false });
    host.current?.focus();
  }, [router]);

  // The world lives for as long as 3D is on; React only talks to it through this handle.
  useEffect(() => {
    const el = host.current;
    if (!use3d || !el) return;
    let w: World;
    try {
      w = createWorld({
        host: el,
        minimap: () => mini.current,
        label: (id) => labels.current.get(id) ?? null,
        onNearby: setNearby,
        onArrive: (id) => setArrived(id),
        onPick: land,
        onGround: () => {
          setPortal(false);
          if (live.current.path !== "/") router.push("/", { scroll: false });
        },
        onMode: (m) => {
          setMode(m);
          if (m !== "docked") setArrived(null);
          if (m === "chase") setBrief(false);
        },
        start: live.current.tid || null,
        night: false,
      });
    } catch {
      queueMicrotask(() => setUse3d(false));
      return;
    }
    world.current = w;
    return () => {
      w.dispose();
      world.current = null;
    };
  }, [use3d, land, router]);

  useEffect(() => {
    if (tid) world.current?.flyTo(tid);
  }, [tid]);

  useEffect(() => {
    world.current?.setNight(night);
    try {
      localStorage.setItem("ob-night", night ? "1" : "0");
    } catch {
      // storage blocked
    }
  }, [night, use3d]);

  // Frame the landmark left of the panel on desktop; pause behind a full-screen sheet on mobile.
  useEffect(() => {
    const w = world.current;
    if (!w) return;
    const sync = () => w.setPanel(open && wide() ? (panelRef.current?.offsetWidth ?? 0) + 24 : 0);
    sync();
    window.addEventListener("resize", sync);
    let t = 0;
    if (open && !wide()) t = window.setTimeout(() => w.setPaused(true), 520);
    if (open) panelRef.current?.querySelector<HTMLElement>(".ob-panel-title")?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("resize", sync);
      window.clearTimeout(t);
      w.setPaused(false);
    };
  }, [open, panelKey]);

  useEffect(() => {
    const typing = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el?.closest?.("input, textarea, select, [contenteditable], [aria-modal='true'], .themes-sheet, .roul");
    };
    const down = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || typing(e.target)) return;
      const s = live.current;
      const inPanel = !!(e.target as HTMLElement | null)?.closest?.(".ob-panel");
      if (e.key === "Escape" && s.open) {
        e.preventDefault();
        close();
        return;
      }
      if (s.open || inPanel) return;
      const inBar = !!(e.target as HTMLElement | null)?.closest?.(".ob-flybar");
      if (inBar && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
        const items = [...document.querySelectorAll<HTMLElement>(".ob-flybar .ob-fly")];
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[(i + (e.key === "ArrowRight" ? 1 : items.length - 1)) % items.length]?.focus();
        e.preventDefault();
        return;
      }
      if (FLY.has(e.code)) {
        if (e.code.startsWith("Arrow")) e.preventDefault();
        world.current?.setKey(e.code, true);
        return;
      }
      const onBody = e.target === document.body || e.target === host.current;
      if ((e.code === "KeyE" || (e.key === "Enter" && onBody)) && s.nearby) {
        e.preventDefault();
        land(s.nearby);
        return;
      }
      const m = flyMarks.find((x) => x.hotkey === e.key);
      if (m) land(m.key);
      else if (e.code === "KeyM") world.current?.overview();
      else if (e.code === "KeyN") setNight((n) => !n);
    };
    const up = (e: KeyboardEvent) => {
      if (FLY.has(e.code)) world.current?.setKey(e.code, false);
    };
    const blur = () => FLY.forEach((k) => world.current?.setKey(k, false));
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [close, land]);

  // Reticle over the planet, native pointer elsewhere.
  useEffect(() => () => void delete document.documentElement.dataset.obAim, []);
  const aim = (on: boolean) => {
    if (on) document.documentElement.dataset.obAim = "";
    else delete document.documentElement.dataset.obAim;
  };

  const activeSection = portal && view === "home" ? "portal" : tid.startsWith("b:") ? "tower" : tid;
  const near = nearby ? targetName(nearby) : null;
  const here = arrived ? targetName(arrived) : null;

  let page: React.ReactNode = null;
  if (portalOpen) page = <PortalView />;
  else if (view === "systems") page = <SystemsView />;
  else if (view === "system" && sys) page = <SystemView s={sys} />;
  else if (view === "projects") page = <ProjectsView />;
  else if (view === "lab") page = <LabView />;
  else if (view === "notes") page = <NotesView />;
  else if (view === "note" && note) page = <NoteView n={note} />;
  else if (view === "about") page = <AboutView />;
  else if (view === "missing") page = <MissingView path={route.path} />;

  const pm = portalOpen ? getMark("portal") : tid ? (tid.startsWith("b:") ? null : getMark(tid as MarkKey)) : null;
  const pc = tid.startsWith("b:") ? targetName(tid) : null;
  const chapter = pm ? marks.indexOf(pm) + 1 : 1;
  const head = pm ? { name: pm.name, section: pm.section, color: pm.color, key: pm.key } : { name: pc?.name ?? "", section: "System", color: pc?.color ?? "#0ea5e9", key: "tower" as MarkKey };

  return (
    <div className="t-orbit" data-view={view} data-night={night ? "" : undefined} data-open={open ? "" : undefined} data-mode={use3d ? mode : "map"} data-brief={brief ? "" : undefined}>
      <div className="ob-sky" aria-hidden="true">
        <i className="ob-sun" />
      </div>

      {use3d ? (
        <div
          className="ob-stage"
          ref={host}
          tabIndex={0}
          role="application"
          aria-label="Planet. Fly with W A S D or the arrow keys, Shift to boost, E to land, M for the map, N for night. Use the landmark bar to jump straight to a section."
          onPointerEnter={() => aim(true)}
          onPointerLeave={() => aim(false)}
        >
          <div className="ob-labels">
            {marks.map((m) => (
              <button
                key={m.key}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className="ob-label"
                style={tint(m.color)}
                data-here={arrived === m.key ? "" : undefined}
                ref={(el) => {
                  if (el) labels.current.set(m.key, el);
                  else labels.current.delete(m.key);
                }}
                onClick={() => land(m.key)}
              >
                <i>
                  <Glyph k={m.key} size={15} />
                </i>
                <span>
                  <b>{m.section}</b>
                  <small>{m.name}</small>
                </span>
              </button>
            ))}
            {systems.map((s, i) => (
              <button
                key={s.slug}
                type="button"
                tabIndex={-1}
                aria-hidden="true"
                className="ob-label ob-label-b"
                style={tint(beaconColors[i % beaconColors.length])}
                ref={(el) => {
                  if (el) labels.current.set(`b:${s.slug}`, el);
                  else labels.current.delete(`b:${s.slug}`);
                }}
                onClick={() => land(`b:${s.slug}`)}
              >
                <span>
                  <b>{s.shortTitle}</b>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <PlanetMap onPortal={() => setPortal(true)} onForce3d={hasWebGL() ? () => setUse3d(true) : undefined} />
      )}

      <header className="ob-hud">
        <Link href="/" className="ob-brand" onClick={() => setPortal(false)}>
          <span className="ob-brand-mark" aria-hidden="true">
            <i />
          </span>
          <span>
            <b>{profile.name}</b>
            <small>{profile.role} · Orbit</small>
          </span>
        </Link>
        <p className="ob-loc" aria-live="polite">
          <span>{use3d ? (mode === "auto" ? "Autopilot" : mode === "overview" ? "Orbit view" : here ? "Landed" : "Flying") : "Map"}</span>
          <b>{use3d ? (mode === "auto" ? "En route" : here ? here.name : mode === "overview" ? "Whole planet" : "Open sky") : "Pick a landmark"}</b>
        </p>
        <div className="ob-hud-r">
          {use3d ? (
            <button type="button" className="ob-hbtn" onClick={() => world.current?.overview()} title="Orbit view (M)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <ellipse cx="12" cy="12" rx="10" ry="3.5" />
              </svg>
              <span>Orbit</span>
            </button>
          ) : null}
          <button type="button" className="ob-hbtn" aria-pressed={night} onClick={() => setNight((n) => !n)} title="Day and night (N)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              {night ? <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
            </svg>
            <span>{night ? "Night" : "Day"}</span>
          </button>
          <button type="button" className="ob-themes" onClick={openThemes} aria-haspopup="dialog">
            <span className="ob-sw" aria-hidden="true">
              <i style={{ background: "#7DD3FC" }} />
              <i style={{ background: "#FB923C" }} />
              <i style={{ background: "#4ADE80" }} />
            </span>
            Themes
          </button>
        </div>
      </header>

      {view === "home" && !portal ? (
        brief ? (
          <section className="ob-brief" aria-label="Mission briefing" data-lenis-prevent>
            <div className="ob-brief-top">
              <span>Mission briefing</span>
              <button type="button" onClick={() => setBrief(false)} aria-label="Hide briefing">
                ×
              </button>
            </div>
            <h1>
              {profile.name}. <em>{profile.tagline}</em>
            </h1>
            <p>{profile.description}</p>
            <p className="ob-brief-how">
              This portfolio is a tiny planet. Every section is a landmark: fly to one and land to read it.
            </p>
            <div className="ob-keys" aria-hidden={!use3d}>
              <span>
                <Kbd>W</Kbd>
                <Kbd>A</Kbd>
                <Kbd>S</Kbd>
                <Kbd>D</Kbd> fly
              </span>
              <span>
                <Kbd>E</Kbd> land
              </span>
              <span>
                <Kbd>1</Kbd>–<Kbd>6</Kbd> autopilot
              </span>
              <span>
                <Kbd>M</Kbd> orbit
              </span>
            </div>
            <div className="ob-brief-cta">
              <Link href="/systems" className="ob-btn">
                Fly to the systems <Arrow />
              </Link>
              <button
                type="button"
                className="ob-btn ob-btn-ghost"
                onClick={() => {
                  setBrief(false);
                  host.current?.focus();
                }}
              >
                Fly freely
              </button>
            </div>
            <ThemeTeaser className="ob-teaser" />
          </section>
        ) : (
          <button type="button" className="ob-brief-chip" onClick={() => setBrief(true)}>
            <Glyph k="cottage" size={14} /> Briefing
          </button>
        )
      ) : null}

      {use3d && near && !open ? (
        <button type="button" className="ob-prompt" style={tint(near.color)} onClick={() => land(nearby!)}>
          <small>{near.section}</small>
          <b>{near.name}</b>
          <span>
            <Kbd>E</Kbd> Land
          </span>
        </button>
      ) : null}

      <nav className="ob-flybar" aria-label="Fly to a landmark">
        {flyMarks.map((m) => {
          const cur = activeSection === m.key;
          const props = {
            className: "ob-fly",
            style: tint(m.color),
            "aria-current": cur ? ("location" as const) : undefined,
            title: `${m.name}: ${m.blurb} (${m.hotkey})`,
          };
          const inner = (
            <>
              <i>
                <Glyph k={m.key} size={18} />
              </i>
              <span>{m.section}</span>
              <kbd aria-hidden="true">{m.hotkey}</kbd>
            </>
          );
          return m.href ? (
            <Link key={m.key} href={m.href} {...props} onClick={() => setPortal(false)} scroll={false}>
              {inner}
            </Link>
          ) : (
            <button key={m.key} type="button" {...props} onClick={() => land("portal")}>
              {inner}
            </button>
          );
        })}
      </nav>

      {use3d ? (
        <div className="ob-mini" aria-hidden="true">
          <canvas ref={mini} width={280} height={280} />
          <span>Radar</span>
        </div>
      ) : null}

      {use3d ? (
        <p className="ob-hint" aria-hidden="true">
          <span className="ob-hint-d">
            <Kbd>WASD</Kbd> fly · <Kbd>Shift</Kbd> boost · drag to spin · click to fly
          </span>
          <span className="ob-hint-m">Tap the planet to fly · tap a landmark to land</span>
        </p>
      ) : null}

      {open && page ? (
        <aside className="ob-panel" ref={panelRef} key={panelKey} style={{ "--ob-c": head.color } as CSSProperties} aria-labelledby="ob-ptitle">
          <div className="ob-panel-bar">
            <span>
              Pilot&apos;s handbook · Ch {String(chapter).padStart(2, "0")}
            </span>
            <button type="button" className="ob-close" onClick={close} aria-label="Close handbook and take off">
              <span aria-hidden="true">Esc</span>×
            </button>
          </div>
          <div className="ob-panel-head">
            <i>
              <Glyph k={tid.startsWith("b:") ? "beacon" : head.key} size={22} />
            </i>
            <div>
              <small>{head.section}</small>
              <b id="ob-ptitle" className="ob-panel-title" tabIndex={-1}>
                {head.name}
              </b>
            </div>
          </div>
          <div className="ob-panel-scroll" data-lenis-prevent>
            {page}
            <footer className="ob-panel-foot">
              <span>© {new Date().getFullYear()} {profile.name}</span>
              <button type="button" className="ob-link" onClick={close}>
                Take off <Arrow />
              </button>
            </footer>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
