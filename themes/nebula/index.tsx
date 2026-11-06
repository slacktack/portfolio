"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as RKE } from "react";
import { openThemes } from "@/components/skin";
import { ThemeTeaser } from "@/components/theme-palette";
import { profile, stage, systems } from "@/lib/site";
import type { Route, ThemeAppProps, View } from "../types";
import { Cosmos, hasWebGL, type HoverInfo } from "./cosmos";
import { cosmosItems, stageHref } from "./data";
import { AboutView, CaseView, LabView, MissingView, NoteView, NotesView, ProjectsView, SystemsView } from "./views";
import "./nebula.css";

type Mode = "" | "live" | "static";

function useMode(): Mode {
  const [mode, setMode] = useState<Mode>("");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setMode(mq.matches || !hasWebGL() ? "static" : "live");
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);
  return mode;
}

const stars: { view: View | "themes"; href?: string; label: string; x: number; y: number }[] = [
  { view: "home", href: "/", label: "Origin", x: 14, y: 74 },
  { view: "systems", href: "/systems", label: "Systems", x: 30, y: 34 },
  { view: "projects", href: "/projects", label: "Projects", x: 54, y: 16 },
  { view: "lab", href: "/lab", label: "Lab", x: 66, y: 50 },
  { view: "notes", href: "/notes", label: "Notes", x: 88, y: 28 },
  { view: "about", href: "/about", label: "About", x: 48, y: 82 },
  { view: "themes", label: "Themes", x: 84, y: 78 },
];

const group: Partial<Record<View, View>> = { system: "systems", note: "notes" };

function Constellation({ view }: { view: View }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const active = group[view] ?? view;

  useEffect(() => {
    if (!open) return;
    box.current?.querySelector<HTMLElement>("[data-star]")?.focus();
    const down = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);

  const [seen, setSeen] = useState(view);
  if (seen !== view) {
    setSeen(view);
    setOpen(false);
  }

  const keys = (e: RKE) => {
    const items = [...(box.current?.querySelectorAll<HTMLElement>("[data-star]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      setOpen(false);
      btn.current?.focus();
    } else if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      items[(i + d + items.length) % items.length]?.focus();
    }
  };

  return (
    <nav className="ne-nav" aria-label="Constellation" onKeyDown={keys}>
      <button ref={btn} type="button" className="ne-nav-btn" aria-expanded={open} aria-controls="ne-constellation" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 17 9 7l6 5 5-7" />
          <circle cx="4" cy="17" r="1.8" />
          <circle cx="9" cy="7" r="1.8" />
          <circle cx="15" cy="12" r="1.8" />
          <circle cx="20" cy="5" r="1.8" />
        </svg>
        <span>{open ? "Close" : "Navigate"}</span>
      </button>
      <button type="button" className="ne-nav-themes" onClick={openThemes} aria-label="Themes: change the whole site">
        <i aria-hidden="true" />
        Themes
      </button>
      <div id="ne-constellation" ref={box} className="ne-const" data-open={open || undefined} hidden={!open}>
        <span className="ne-const-k">Choose a star</span>
        <div className="ne-const-map">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {stars.slice(1).map((s, i) => (
            <line key={s.label} x1={stars[i].x} y1={stars[i].y} x2={s.x} y2={s.y} style={{ ["--ne-d" as string]: `${i * 70}ms` }} />
          ))}
        </svg>
        {stars.map((s, i) => {
          const style = { left: `${s.x}%`, top: `${s.y}%`, ["--ne-d" as string]: `${i * 60}ms` };
          if (s.view === "themes")
            return (
              <button key={s.label} type="button" data-star className="ne-star ne-star-themes" style={style} onClick={() => { setOpen(false); openThemes(); }}>
                <i aria-hidden="true" />
                <span>{s.label}</span>
              </button>
            );
          return (
            <Link key={s.label} href={s.href!} data-star className="ne-star" style={style} aria-current={active === s.view ? "page" : undefined}>
              <i aria-hidden="true" />
              <span>{s.label}</span>
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}

function Comet() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = host.current!;
    const dots = [...el.children] as HTMLElement[];
    const pts = dots.map(() => ({ x: -100, y: -100 }));
    let x = -100;
    let y = -100;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as Element | null)?.closest?.("a, button, [data-star], canvas");
      el.dataset.hot = t && (t.tagName !== "CANVAS" || (t as HTMLElement).style.cursor === "pointer") ? "1" : "";
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      pts.forEach((p, i) => {
        const lead = i === 0 ? { x, y } : pts[i - 1];
        const k = i === 0 ? 1 : 0.42;
        p.x += (lead.x - p.x) * k;
        p.y += (lead.y - p.y) * k;
        dots[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${1 - i / dots.length})`;
      });
    };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(loop);
    el.dataset.on = "1";
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div className="ne-comet" ref={host} aria-hidden="true">
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

function Sky({ route, mode, onFocusRef }: { route: Route; mode: Mode; onFocusRef: (fn: ((id: string) => void) | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const gauge = useRef<HTMLSpanElement>(null);
  const cosmos = useRef<Cosmos | null>(null);
  const router = useRouter();
  const panel = route.view !== "home";

  useEffect(() => {
    if (mode !== "live" || !canvas.current) return;
    let dead = false;
    const el = canvas.current;
    document.fonts.ready.then(() => {
      if (dead) return;
      cosmos.current = new Cosmos(el, cosmosItems, {
        onHover: (h: HoverInfo) => {
          const d = hud.current;
          if (!d) return;
          if (!h) {
            d.dataset.on = "";
            return;
          }
          d.dataset.on = "1";
          d.style.transform = `translate3d(${h.x}px, ${h.y}px, 0)`;
          d.querySelector("b")!.textContent = h.title;
          d.querySelector("small")!.textContent = h.sub;
        },
        onSelect: (item) => router.push(item.href),
        onTravel: (t) => {
          if (gauge.current) gauge.current.textContent = t.toFixed(1).padStart(5, "0");
        },
      });
      onFocusRef((id) => cosmos.current?.focus(id));
    });
    return () => {
      dead = true;
      onFocusRef(null);
      cosmos.current?.dispose();
      cosmos.current = null;
    };
  }, [mode, router, onFocusRef]);

  useEffect(() => {
    const c = cosmos.current;
    if (!c) return;
    c.setDim(panel);
    if (route.view === "system" && route.slug) c.focus(`metric:${route.slug}`);
    if (route.view === "projects") {
      const w = new URLSearchParams(window.location.search).get("work");
      if (w) c.focus(`tile:${w}`);
    }
  }, [route.view, route.slug, route.path, panel]);

  useEffect(() => {
    if (mode !== "live" || panel) return;
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, .ne-const, [role=dialog]")) return;
      const map: Record<string, number> = { ArrowDown: 3, PageDown: 8, " ": 6, ArrowUp: -3, PageUp: -8 };
      if (map[e.key] !== undefined) {
        e.preventDefault();
        cosmos.current?.nudge(map[e.key]);
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [mode, panel]);

  if (mode !== "live") return null;
  return (
    <>
      <canvas ref={canvas} className="ne-canvas" aria-label="A field of work: scroll or drag to fly, click a tile to open it" />
      <div className="ne-hud" ref={hud} aria-hidden="true">
        <span className="ne-hud-ring" />
        <span className="ne-hud-card">
          <b />
          <small />
        </span>
      </div>
      {!panel && (
        <div className="ne-gauge" aria-hidden="true">
          <span>Depth</span>
          <span ref={gauge}>000.0</span>
          <span>Scroll · drag · arrows to fly</span>
        </div>
      )}
    </>
  );
}

function Home({ mode, focus }: { mode: Mode; focus: (id: string) => void }) {
  return (
    <div className="ne-home" data-lenis-prevent={mode === "static" ? "" : undefined}>
      <section className="ne-intro">
        <span className="ne-k">
          <i aria-hidden="true">✦</i> {profile.role} · {profile.location}
        </span>
        <h1>
          <span>{profile.name}</span>
          <em>A cosmos of work.</em>
        </h1>
        <p>{profile.description}</p>
        <div className="ne-intro-cta">
          <Link href="/systems" className="ne-btn">
            Open the star chart
          </Link>
          <Link href="/about" className="ne-btn ne-btn-ghost">
            About me
          </Link>
        </div>
      </section>

      {mode === "live" ? (
        <nav className="ne-sr" aria-label="Everything in this field">
          <p>Each link flies to its object, then opens it.</p>
          <ul>
            {cosmosItems.map((it) => (
              <li key={it.id}>
                <Link href={it.href} onFocus={() => focus(it.id)}>
                  {it.title}: {it.sub}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : (
        <div className="ne-grid">
          {stage.map((s) => (
            <Link key={s.slug} href={stageHref(s.slug)} className="ne-gtile">
              <img src={s.poster} alt="" />
              <span>
                <b>{s.title}</b>
                <small>{s.tag}</small>
              </span>
            </Link>
          ))}
          {systems.map((s) => (
            <Link key={s.slug} href={`/systems/${s.slug}`} className="ne-gmetric">
              <strong>{s.metrics[0]?.value}</strong>
              <span>{s.metrics[0]?.label}</span>
              <small>{s.title}</small>
            </Link>
          ))}
        </div>
      )}
      <div className="ne-teaser">
        <ThemeTeaser />
      </div>
    </div>
  );
}

const noop = () => () => {};
const readWork = () => new URLSearchParams(window.location.search).get("work") ?? undefined;

function Panel({ route }: { route: Route }) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const work = useSyncExternalStore(noop, readWork, () => undefined);
  useEffect(() => {
    ref.current?.scrollTo({ top: 0 });
  }, [route.path]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector(".ne-const[data-open]") && !document.querySelector(".themes-modal, [aria-modal=true]")) router.push("/");
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [router]);
  const v = route.view;
  const crumb = { systems: "Systems", system: "Systems", projects: "Projects", lab: "Lab", notes: "Notes", note: "Notes", about: "About", missing: "Uncharted", home: "" }[v];
  const parent = v === "system" ? "/systems" : v === "note" ? "/notes" : null;
  return (
    <section className="ne-panel" data-view={v} aria-label={crumb}>
      <div className="ne-panel-bar">
        <p className="ne-crumb">
          <Link href="/">Origin</Link>
          <i aria-hidden="true">✦</i>
          {parent ? <Link href={parent}>{crumb}</Link> : <span>{crumb}</span>}
          {route.slug && v !== "missing" && (
            <>
              <i aria-hidden="true">✦</i>
              <span>{route.slug}</span>
            </>
          )}
        </p>
        <Link href="/" className="ne-close" aria-label="Close panel and return to the cosmos">
          <span aria-hidden="true">×</span>
        </Link>
      </div>
      <div className="ne-panel-scroll" ref={ref} data-lenis-prevent key={route.path}>
        <div className="ne-panel-in">
          {v === "systems" && <SystemsView />}
          {v === "system" && <CaseView slug={route.slug ?? ""} />}
          {v === "projects" && <ProjectsView work={work} />}
          {v === "lab" && <LabView />}
          {v === "notes" && <NotesView />}
          {v === "note" && <NoteView slug={route.slug ?? ""} />}
          {v === "about" && <AboutView />}
          {v === "missing" && <MissingView />}
        </div>
      </div>
    </section>
  );
}

export default function App({ route }: ThemeAppProps) {
  const mode = useMode();
  const focusFn = useRef<((id: string) => void) | null>(null);
  const setFocus = useCallback((fn: ((id: string) => void) | null) => {
    focusFn.current = fn;
  }, []);
  const focus = useCallback((id: string) => focusFn.current?.(id), []);
  return (
    <div className="t-nebula" data-view={route.view} data-mode={mode || undefined}>
      <div className="ne-sky" aria-hidden="true" />
      <Sky route={route} mode={mode} onFocusRef={setFocus} />
      <div className="ne-veil" aria-hidden="true" />
      <Link href="/" className="ne-brand" aria-label={`${profile.name}, home`}>
        <i aria-hidden="true" />
        <span>{profile.shortName}</span>
      </Link>
      <Constellation view={route.view} />
      {route.view === "home" ? <Home mode={mode} focus={focus} /> : <Panel route={route} />}
      <Comet />
    </div>
  );
}
