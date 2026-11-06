"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent as RKE, type ReactNode } from "react";
import { openThemes } from "@/components/skin";
import { ThemeTeaser } from "@/components/theme-palette";
import { currently, notes, profile, stage, systems } from "@/lib/site";
import type { Route, ThemeAppProps, View } from "../types";
import { StarChart, type ChartHover } from "./chart";
import { chartItems, coords, stageHref } from "./data";
import { AboutView, CaseView, LabView, MissingView, NoteView, NotesView, ProjectsView, SystemsChart, SystemsView } from "./views";
import "./nebula.css";

const stars: { view: View | "themes"; href?: string; label: string; x: number; y: number }[] = [
  { view: "home", href: "/", label: "Atlas", x: 10, y: 74 },
  { view: "systems", href: "/systems", label: "Systems", x: 28, y: 32 },
  { view: "projects", href: "/projects", label: "Works", x: 52, y: 12 },
  { view: "lab", href: "/lab", label: "Lab", x: 64, y: 50 },
  { view: "notes", href: "/notes", label: "Notes", x: 88, y: 26 },
  { view: "about", href: "/about", label: "About", x: 46, y: 84 },
  { view: "themes", label: "Themes", x: 84, y: 78 },
];

const group: Partial<Record<View, View>> = { system: "systems", note: "notes" };

const plates: Record<View, string> = {
  home: "I",
  systems: "II",
  system: "II",
  projects: "III",
  notes: "IV",
  note: "IV",
  about: "V",
  lab: "VI",
  missing: "∅",
};

const names: Record<View, string> = {
  home: "The atlas",
  systems: "Systems",
  system: "Systems",
  projects: "Works",
  notes: "Notes",
  note: "Notes",
  about: "About",
  lab: "Lab",
  missing: "Uncharted",
};

function Constellation({ view }: { view: View }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(view);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const active = group[view] ?? view;
  if (seen !== view) {
    setSeen(view);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    box.current?.querySelector<HTMLElement>("[data-star]")?.focus();
    const down = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [open]);

  const keys = (e: RKE) => {
    const items = [...(box.current?.querySelectorAll<HTMLElement>("[data-star]") ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      setOpen(false);
      btn.current?.focus();
    } else if (open && ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
      e.preventDefault();
      const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      items[(i + d + items.length) % items.length]?.focus();
    }
  };

  return (
    <nav className="ne-nav" aria-label="Constellation" onKeyDown={keys}>
      <button type="button" className="ne-nav-themes" onClick={openThemes} aria-label="Themes: change the whole site">
        <i aria-hidden="true" />
        Themes
      </button>
      <button ref={btn} type="button" className="ne-nav-btn" aria-expanded={open} aria-controls="ne-constellation" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 17 9 7l6 5 5-7" />
          <circle cx="4" cy="17" r="1.6" />
          <circle cx="9" cy="7" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="20" cy="5" r="1.6" />
        </svg>
        <span>{open ? "Close" : "Index"}</span>
      </button>
      <div id="ne-constellation" ref={box} className="ne-const" hidden={!open}>
        <span className="ne-const-k">Constellation · choose a star</span>
        <div className="ne-const-map">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {stars.slice(1).map((s, i) => (
              <line key={s.label} x1={stars[i].x} y1={stars[i].y} x2={s.x} y2={s.y} />
            ))}
          </svg>
          {stars.map((s) => {
            const style = { left: `${s.x}%`, top: `${s.y}%` };
            if (s.view === "themes")
              return (
                <button
                  key={s.label}
                  type="button"
                  data-star
                  className="ne-star ne-star-themes"
                  style={style}
                  onClick={() => {
                    setOpen(false);
                    openThemes();
                  }}
                >
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
        <span className="ne-const-f">Arrow keys move · Esc closes</span>
      </div>
    </nav>
  );
}

function Pointer() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const d = el.current!;
    d.dataset.on = "1";
    const move = (e: PointerEvent) => {
      d.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const t = (e.target as Element | null)?.closest?.("a, button, [data-star]");
      const c = e.target instanceof HTMLCanvasElement && e.target.style.cursor === "pointer";
      d.dataset.hot = t || c ? "1" : "";
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return (
    <div className="ne-pointer" ref={el} aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <path d="M10 1 11.6 8.4 19 10 11.6 11.6 10 19 8.4 11.6 1 10 8.4 8.4Z" />
      </svg>
    </div>
  );
}

function Observatory() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<StarChart | null>(null);
  const [hover, setHover] = useState<ChartHover>(null);
  const router = useRouter();

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    let dead = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.fonts.ready.then(() => {
      if (dead) return;
      chart.current = new StarChart(c, chartItems, still, { onHover: setHover, onSelect: (i) => router.push(i.href) });
    });
    return () => {
      dead = true;
      chart.current?.dispose();
    };
  }, [router]);

  const mark = (id: string | null) => chart.current?.highlight(id);

  return (
    <figure className="ne-obs">
      <div className="ne-port">
        <svg className="ne-ticks" viewBox="0 0 200 200" aria-hidden="true">
          <circle cx="100" cy="100" r="99" />
          <circle cx="100" cy="100" r="93" />
          {Array.from({ length: 72 }, (_, i) => {
            const a = (i * Math.PI) / 36;
            const l = i % 6 ? 96 : 93;
            return <line key={i} x1={100 + Math.cos(a) * l} y1={100 + Math.sin(a) * l} x2={100 + Math.cos(a) * 99} y2={100 + Math.sin(a) * 99} />;
          })}
          {["0°", "90°", "180°", "270°"].map((t, i) => (
            <text key={t} x={100 + Math.cos((i * Math.PI) / 2 - Math.PI / 2) * 86} y={100 + Math.sin((i * Math.PI) / 2 - Math.PI / 2) * 86 + 2}>
              {t}
            </text>
          ))}
        </svg>
        <canvas ref={canvas} aria-label="Star map of the work. Hover to identify, click to open. The same objects are listed beside it." />
        {hover && (
          <div className="ne-tip" style={{ left: hover.x, top: hover.y }} aria-hidden="true">
            <small>No. {String(hover.item.no).padStart(2, "0")}</small>
            <b>{hover.item.title}</b>
            <span>{hover.item.sub}</span>
          </div>
        )}
      </div>
      <figcaption>
        <span className="ne-k">Fig. 1 · The works, charted</span>
        <p>Squares are screen recordings; crosses are the systems, marked by their biggest number. Hover to identify, click to open.</p>
        <ol className="ne-legend">
          {chartItems.map((it) => (
            <li key={it.id}>
              <Link href={it.href} onPointerEnter={() => mark(it.id)} onPointerLeave={() => mark(null)} onFocus={() => mark(it.id)} onBlur={() => mark(null)}>
                <span>{String(it.no).padStart(2, "0")}</span>
                {it.title}
                <i aria-hidden="true">{it.kind === "tile" ? "□" : "+"}</i>
              </Link>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}

function PlateHead({ no, title, k, more }: { no: string; title: string; k: string; more?: ReactNode }) {
  return (
    <div className="ne-plate-head">
      <span className="ne-plate-no">Plate {no}</span>
      <h2>{title}</h2>
      <span className="ne-coord">{k}</span>
      {more}
    </div>
  );
}

function Home() {
  return (
    <>
      <section className="ne-hero">
        <div className="ne-hero-copy">
          <span className="ne-k">
            Plate I · {profile.role} · {profile.location}
          </span>
          <h1>
            {profile.name}
            <em>an atlas of the work.</em>
          </h1>
          <p className="ne-lede">{profile.description}</p>
          <div className="ne-cta">
            <Link href="/systems" className="ne-btn">
              Open the star chart
            </Link>
            <Link href="/projects" className="ne-btn ne-btn-ghost">
              See the works
            </Link>
          </div>
          <dl className="ne-specs">
            <div>
              <dt>Systems catalogued</dt>
              <dd>{systems.length}</dd>
            </div>
            <div>
              <dt>Recordings</dt>
              <dd>{stage.length}</dd>
            </div>
            <div>
              <dt>Field notes</dt>
              <dd>{notes.length}</dd>
            </div>
          </dl>
        </div>
        <Observatory />
      </section>

      <section className="ne-plate">
        <PlateHead no="II" title="Systems" k={coords("systems")} more={<Link href="/systems" className="ne-more">Full chart →</Link>} />
        <div className="ne-split">
          <SystemsChart />
          <ol className="ne-cat">
            {systems.map((s) => (
              <li key={s.slug}>
                <Link href={`/systems/${s.slug}`}>
                  <span className="ne-num">{s.index}</span>
                  <b>{s.title}</b>
                  <small>{s.category}</small>
                  <strong>{s.metrics[0]?.value}</strong>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ne-plate">
        <PlateHead no="III" title="Selected works" k={coords("works")} more={<Link href="/projects" className="ne-more">All works →</Link>} />
        <div className="ne-works">
          {stage.map((s, i) => (
            <Link key={s.slug} href={stageHref(s.slug)} className="ne-wcard">
              <span className="ne-wcard-no">No. {String(i + 1).padStart(2, "0")}</span>
              <img src={s.poster} alt="" loading="lazy" />
              <b>{s.title}</b>
              <small>
                {s.tag} · {s.tagline}
              </small>
            </Link>
          ))}
        </div>
      </section>

      <section className="ne-plate">
        <PlateHead no="IV" title="Field notes" k={coords("notes")} more={<Link href="/notes" className="ne-more">All notes →</Link>} />
        <ol className="ne-noterow">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`}>
                <span className="ne-k">
                  {n.date} · {n.readTime}
                </span>
                <b>{n.title}</b>
                <span>{n.dek}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="ne-plate">
        <PlateHead no="V" title="The observer" k={coords("about")} more={<Link href="/about" className="ne-more">About →</Link>} />
        <div className="ne-split ne-split-even">
          <div className="ne-observer">
            <p className="ne-big">{profile.tagline}</p>
            <p>{profile.availability}. {profile.availabilityDetail}.</p>
            <a className="ne-mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
          <dl className="ne-now">
            {currently.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="ne-plate">
        <PlateHead no="VI" title="Other atlases" k="The same work, bound differently" />
        <div className="ne-teaser">
          <ThemeTeaser />
        </div>
      </section>
    </>
  );
}

const noop = () => () => {};
const readWork = () => new URLSearchParams(window.location.search).get("work") ?? undefined;

function Plate({ route }: { route: Route }) {
  const work = useSyncExternalStore(noop, readWork, () => undefined);
  const v = route.view;
  const parent = v === "system" ? "/systems" : v === "note" ? "/notes" : null;
  return (
    <div className="ne-sheet">
      <div className="ne-strip">
        <p className="ne-crumb">
          <Link href="/">Atlas</Link>
          <i aria-hidden="true">/</i>
          {parent ? <Link href={parent}>{names[v]}</Link> : <span>{names[v]}</span>}
          {route.slug && v !== "missing" && (
            <>
              <i aria-hidden="true">/</i>
              <span>{route.slug}</span>
            </>
          )}
        </p>
        <span className="ne-plate-no">Plate {plates[v]}</span>
        <span className="ne-coord">{coords(route.path)}</span>
      </div>
      <article className="ne-card" data-view={v}>
        {v === "systems" && <SystemsView />}
        {v === "system" && <CaseView slug={route.slug ?? ""} />}
        {v === "projects" && <ProjectsView work={work} />}
        {v === "lab" && <LabView />}
        {v === "notes" && <NotesView />}
        {v === "note" && <NoteView slug={route.slug ?? ""} />}
        {v === "about" && <AboutView />}
        {v === "missing" && <MissingView />}
      </article>
    </div>
  );
}

export default function App({ route }: ThemeAppProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);
  return (
    <div className="t-nebula" data-view={route.view}>
      <div className="ne-frame" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <header className="ne-top">
        <Link href="/" className="ne-brand">
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 1 11.6 8.4 19 10 11.6 11.6 10 19 8.4 11.6 1 10 8.4 8.4Z" />
          </svg>
          <span>{profile.name}</span>
          <small>Observatory atlas</small>
        </Link>
        <span className="ne-top-mid">
          Plate {plates[route.view]} · {names[route.view]}
        </span>
        <Constellation view={route.view} />
      </header>
      <div className="ne-page" key={route.path}>
        {route.view === "home" ? <Home /> : <Plate route={route} />}
      </div>
      <footer className="ne-foot">
        <div>
          <span className="ne-k">End of catalogue</span>
          <p>
            {profile.name} · {profile.role} · {profile.location}
          </p>
        </div>
        <nav aria-label="Footer">
          <Link href="/systems">Systems</Link>
          <Link href="/projects">Works</Link>
          <Link href="/lab">Lab</Link>
          <Link href="/notes">Notes</Link>
          <Link href="/about">About</Link>
          <button type="button" onClick={openThemes}>
            Themes
          </button>
        </nav>
        <a href={`mailto:${profile.email}`} className="ne-mail">
          {profile.email}
        </a>
      </footer>
      <Pointer />
    </div>
  );
}
