"use client";

import "./night.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { getNote, getSystem, labItems, profile, projects } from "@/lib/site";
import type { Route, ThemeAppProps, View } from "../types";
import { Catalogue } from "./catalogue";
import { works, type Cat } from "./data";
import { exhibitKey, figuresFor, type Exhibit } from "./figures";
import { Motes } from "./motes";
import { Guide, Placard } from "./placards";
import { Wall } from "./wall";

const listCat: Partial<Record<View, Cat>> = { home: "all", systems: "systems", projects: "projects", lab: "lab", notes: "notes" };
const firstCat = (v: View): Cat => listCat[v] ?? (v === "system" ? "systems" : v === "note" ? "notes" : "all");

const keys: { label: string; href: string; tone: string; on: View[] }[] = [
  { label: "Idle", href: "/", tone: "var(--nt-ink)", on: ["home"] },
  { label: "Systems", href: "/systems", tone: "var(--nt-flare)", on: ["systems", "system"] },
  { label: "Projects", href: "/projects", tone: "var(--nt-peri)", on: ["projects"] },
  { label: "Lab", href: "/lab", tone: "var(--nt-amber)", on: ["lab"] },
  { label: "Notes", href: "/notes", tone: "var(--nt-mint)", on: ["notes", "note"] },
  { label: "Curator", href: "/about", tone: "var(--nt-flare)", on: ["about"] },
];

const mq = "(max-width: 899px)";
const subNarrow = (cb: () => void) => {
  const m = matchMedia(mq);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
const useNarrow = () => useSyncExternalStore(subNarrow, () => matchMedia(mq).matches, () => false);

function Keys({ view }: { view: View }) {
  return keys.map((k, i) => (
    <Link key={k.label} href={k.href} className="nt-key" style={{ "--tone": k.tone, "--nt-i": i } as CSSProperties} aria-current={k.on.includes(view) ? "page" : undefined}>
      <i aria-hidden="true" />
      {k.label}
    </Link>
  ));
}

function Knob() {
  const skin = useSkin();
  const sw = skin.swatches.map((s) => s.hex);
  const ring = `conic-gradient(${sw.map((c, i) => `${c} ${(i / sw.length) * 100}% ${((i + 1) / sw.length) * 100}%`).join(",")})`;
  return (
    <button type="button" className="nt-knob" onClick={openThemes} aria-haspopup="dialog" data-cursor="Themes" aria-label={`Themes: change the whole site, now ${skin.name}`}>
      <span className="nt-knob-dial" style={{ "--nt-sw": ring } as CSSProperties} aria-hidden="true" />
      <span>
        Themes
        <small>Change the whole site</small>
      </span>
    </button>
  );
}

function resolve(route: Route, picked: { slug: string; path: string } | null): Exhibit | null {
  const v = route.view;
  if (v === "system") return route.slug && getSystem(route.slug) ? { type: "system", slug: route.slug } : { type: "missing", path: route.path };
  if (v === "note") return route.slug && getNote(route.slug) ? { type: "note", slug: route.slug } : { type: "missing", path: route.path };
  if (v === "about") return { type: "curator" };
  if (v === "missing") return { type: "missing", path: route.path };
  if (v === "systems" || v === "notes" || !picked || picked.path !== route.path) return null;
  if (projects.some((p) => p.slug === picked.slug)) return { type: "project", slug: picked.slug };
  if (labItems.some((l) => l.slug === picked.slug)) return { type: "lab", slug: picked.slug };
  return null;
}

export default function App({ route }: ThemeAppProps) {
  const router = useRouter();
  const narrow = useNarrow();
  const root = useRef<HTMLDivElement>(null);
  const placard = useRef<HTMLDivElement>(null);
  const jumping = useRef(0);

  const [picked, setPicked] = useState<{ slug: string; path: string } | null>(() => {
    const h = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
    return h ? { slug: h, path: route.path } : null;
  });

  // Index routes drive the catalogue filter; exhibit routes keep it.
  const [catState, setCatState] = useState({ path: route.path, cat: firstCat(route.view) });
  let cat = catState.cat;
  if (catState.path !== route.path) {
    cat = listCat[route.view] ?? catState.cat;
    setCatState({ path: route.path, cat });
  }

  const ex = resolve(route, picked);
  const exKey = exhibitKey(ex);
  const figs = figuresFor(ex);
  const [figState, setFigState] = useState({ key: exKey, i: 0, dir: 1 });
  const fig = figState.key === exKey ? Math.min(figState.i, Math.max(0, figs.length - 1)) : 0;
  const dir = figState.key === exKey ? figState.dir : 1;
  const activeId = ex && "slug" in ex ? `${ex.type}:${ex.slug}` : undefined;

  const [boot, setBoot] = useState(() => {
    try {
      return !sessionStorage.getItem("nt-boot") && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!boot) return;
    try {
      sessionStorage.setItem("nt-boot", "1");
    } catch {
      // storage blocked
    }
    const t = window.setTimeout(() => setBoot(false), 2100);
    return () => window.clearTimeout(t);
  }, [boot]);

  const pick = (kind: "project" | "lab", slug: string) => {
    const here = route.view === "home" || route.view === "projects" || route.view === "lab";
    const path = here ? route.path : kind === "project" ? "/projects" : "/lab";
    setPicked({ slug, path });
    if (here) window.history.replaceState(null, "", `${path}#${slug}`);
    else router.push(`${path}#${slug}`);
  };

  const onCat = (c: Cat) => {
    setCatState({ path: route.path, cat: c });
    const idx = route.view === "home" || listCat[route.view];
    const href = { all: "/", systems: "/systems", projects: "/projects", lab: "/lab", notes: "/notes" }[c];
    if (idx && href !== route.path) router.replace(href);
  };

  const close = () => {
    const id = activeId;
    if (!ex) return;
    if (ex.type === "project" || ex.type === "lab") {
      setPicked(null);
      window.history.replaceState(null, "", route.path);
    } else router.push(ex.type === "system" ? "/systems" : ex.type === "note" ? "/notes" : "/");
    if (id) window.setTimeout(() => root.current?.querySelector<HTMLElement>(`[data-work-id="${id}"]`)?.focus(), 60);
  };

  const go = (i: number) => {
    if (!figs.length) return;
    const n = (i + figs.length) % figs.length;
    setFigState({ key: exKey, i: n, dir: n >= fig ? 1 : -1 });
    if (ex?.type === "note") {
      jumping.current = Date.now();
      document.getElementById(`nt-part-${n}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    placard.current?.scrollTo(0, 0);
    if (!narrow) window.scrollTo(0, 0);
  }, [exKey, route.path, narrow]);

  // The reader keeps the figure counter in step with the part being read.
  useEffect(() => {
    if (!ex || ex.type !== "note") return;
    const parts = placard.current?.querySelectorAll<HTMLElement>("[data-part]");
    if (!parts?.length) return;
    const io = new IntersectionObserver(
      (es) => {
        if (Date.now() - jumping.current < 900) return;
        const hit = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setFigState({ key: exKey, i: Number((hit.target as HTMLElement).dataset.part), dir: 1 });
      },
      { root: placard.current, rootMargin: "0px 0px -60% 0px" }
    );
    parts.forEach((p) => io.observe(p));
    return () => io.disconnect();
  }, [ex?.type, exKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable], .nt-bench, [role=dialog], .themes-sheet")) return;
      if (e.key === "Escape" && ex) close();
      if (!figs.length || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") go(fig + 1);
      else if (e.key === "ArrowLeft") go(fig - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const sheet = narrow && !!ex;
  useEffect(() => {
    const d = document.documentElement;
    if (sheet) {
      d.dataset.ntSheet = "";
      root.current?.querySelector<HTMLElement>(".nt-sheet-close")?.focus({ preventScroll: true });
    } else delete d.dataset.ntSheet;
    return () => {
      delete d.dataset.ntSheet;
    };
  }, [sheet, exKey]);

  const torch = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let x = 0;
    let y = 0;
    const paint = () => {
      raf = 0;
      if (torch.current) torch.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  const cur = figs[fig];
  const state = boot ? "boot" : ex ? "selected" : "idle";

  return (
    <div className="t-night" ref={root} data-view={route.view} data-state={state} data-filter={cat} data-boot={boot || undefined} data-sheet={sheet ? "open" : "closed"}>
      <a className="nt-skip" href="#main">
        Skip to the machine
      </a>
      <aside className="nt-cat" aria-label="Catalogue">
        <div className="nt-cat-scroll" data-lenis-prevent={narrow ? undefined : ""}>
          <header className="nt-mast">
            <p className="nt-mast-k">
              <i className="nt-led" aria-hidden="true" />
              Night shift · open after hours
            </p>
            <Link href="/" className="nt-name" aria-label={`${profile.name}, back to the idle machine`}>
              Tushar <em>Gautam</em>
            </Link>
            <p className="nt-role">
              {profile.role} · {profile.location}
            </p>
          </header>
          <nav className="nt-mobile-console" aria-label="Sections">
            <Keys view={route.view} />
            <Knob />
          </nav>
          {narrow && (
            <div className="nt-mini">
              <div className="nt-screen-in" key={cat}>
                <Wall cat={cat} onPick={pick} limit={8} />
              </div>
              <div className="nt-scan" aria-hidden="true" />
            </div>
          )}
          <Catalogue cat={cat} onCat={onCat} activeId={activeId} onPick={pick} />
          {narrow && (
            <div className="nt-mguide">
              <Guide cat={cat} onPick={pick} />
            </div>
          )}
          <footer className="nt-cat-foot">
            <Link href="/about">Curator card</Link>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button type="button" onClick={openThemes}>
              Themes ↗
            </button>
            <small>
              © {new Date().getFullYear()} {profile.name} · {works.length} works in the collection
            </small>
          </footer>
        </div>
      </aside>

      <div className="nt-scrim" aria-hidden="true" onClick={close} />
      <main id="main" className="nt-machine" aria-label="The machine" data-kind={ex?.type ?? "idle"} inert={narrow && !ex ? true : undefined}>
        <div className="nt-lamp" aria-hidden="true" />
        <Motes />
        <div className="nt-sheet-head">
          <span>On display{cur ? ` · ${cur.caption}` : ""}</span>
          <button type="button" className="nt-eject nt-sheet-close" onClick={close}>
            Back to catalogue
          </button>
        </div>
        <nav className="nt-console" aria-label="Machine panel">
          <span className="nt-plate-id" aria-hidden="true">
            Night shift
            <b>Display</b>
          </span>
          <div className="nt-keys">
            <Keys view={route.view} />
          </div>
          <Knob />
        </nav>
        <div className="nt-bezel">
          <div className="nt-screen" aria-live="polite">
            <div className="nt-screen-in" key={exKey}>
              {!ex ? (
                <Wall key={cat} cat={cat} onPick={pick} />
              ) : (
                cur && (
                  <figure className="nt-fig" key={cur.key} style={{ "--nt-dir": dir } as CSSProperties} aria-label={`Fig. ${fig + 1} of ${figs.length}: ${cur.caption}`}>
                    {cur.node}
                  </figure>
                )
              )}
            </div>
            <i className="nt-wipe" key={`w-${exKey}`} aria-hidden="true" />
            <div className="nt-glass" aria-hidden="true" />
            <div className="nt-scan" aria-hidden="true" />
            <div className="nt-sheen" aria-hidden="true" />
            <i className="nt-corner" aria-hidden="true" />
            <i className="nt-corner" aria-hidden="true" />
            <i className="nt-corner" aria-hidden="true" />
            <i className="nt-corner" aria-hidden="true" />
            {boot && (
              <div className="nt-boot" aria-hidden="true">
                <b>Night shift</b>
                {["Lamp", "Glass", `Catalogue · ${works.length} works`].map((s, i) => (
                  <span key={s} style={{ "--nt-i": i } as CSSProperties}>
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="nt-transport">
          <div className="nt-arrows">
            <button type="button" className="nt-arrow" onClick={() => go(fig - 1)} disabled={figs.length < 2} aria-label="Previous figure">
              ←
            </button>
            <button type="button" className="nt-arrow" onClick={() => go(fig + 1)} disabled={figs.length < 2} aria-label="Next figure">
              →
            </button>
          </div>
          <p className="nt-count" aria-live="polite">
            Fig. <b>{figs.length ? String(fig + 1).padStart(2, "0") : "—"}</b> / {figs.length ? String(figs.length).padStart(2, "0") : "—"}
          </p>
          <p className="nt-cap">{cur ? cur.caption : ex ? "" : "Idle · the night watch walks the wall. Pick any work."}</p>
          {figs.length > 1 && (
            <div className="nt-pips">
              {figs.map((f, i) => (
                <button key={f.key} type="button" aria-label={`Figure ${i + 1}: ${f.caption}`} aria-current={i === fig ? "true" : undefined} onClick={() => go(i)} />
              ))}
            </div>
          )}
          {ex && (
            <button type="button" className="nt-eject" onClick={close}>
              Eject · Esc
            </button>
          )}
        </div>
        <div className="nt-placard" ref={placard} data-lenis-prevent="" tabIndex={-1}>
          {ex ? <Placard key={exKey} ex={ex} onPick={pick} /> : !narrow && <Guide key={cat} cat={cat} onPick={pick} />}
        </div>
      </main>
      <div className="nt-torch" ref={torch} aria-hidden="true" />
    </div>
  );
}
