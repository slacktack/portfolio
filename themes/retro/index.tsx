"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { openThemes } from "@/components/skin";
import { getNote, getSystem, profile } from "@/lib/site";
import type { ThemeAppProps, View } from "../types";
import { Home } from "./home";
import { AboutView, LabView, MissingView, NoteView, NotesView, ProjectsView, SystemView, SystemsView } from "./views";
import "./retro.css";

const NAV: { view: View; href: string; label: string; no: string }[] = [
  { view: "home", href: "/", label: "Overview", no: "01" },
  { view: "systems", href: "/systems", label: "Systems", no: "02" },
  { view: "projects", href: "/projects", label: "Projects", no: "03" },
  { view: "lab", href: "/lab", label: "Lab", no: "04" },
  { view: "notes", href: "/notes", label: "Notes", no: "05" },
  { view: "about", href: "/about", label: "About", no: "06" },
];

const group: Partial<Record<View, View>> = { system: "systems", note: "notes" };

function Clock() {
  const [t, setT] = useState("--:--:--");
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString("en-GB", { hour12: false }));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="rt-clock">{t}<small>IST</small></span>;
}

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = root.current?.querySelectorAll<HTMLElement>(".rt-r");
    if (!els?.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route.path]);

  let content;
  if (view === "system" && sys) content = <SystemView s={sys} />;
  else if (view === "note" && note) content = <NoteView n={note} />;
  else if (view === "systems") content = <SystemsView />;
  else if (view === "projects") content = <ProjectsView />;
  else if (view === "lab") content = <LabView />;
  else if (view === "notes") content = <NotesView />;
  else if (view === "about") content = <AboutView />;
  else if (view === "missing") content = <MissingView path={route.path} />;
  else content = <Home />;

  const active = group[view] ?? view;

  return (
    <div className="t-retro" ref={root} data-view={view}>
      <div className="rt-boot" key={`boot-${route.path}`} aria-hidden="true"><i /></div>

      <header className="rt-top">
        <div className="rt-top-main">
          <Link href="/" className="rt-brand" aria-label="Tushar Gautam · home">
            <span className="rt-mark">TG</span>
            <span>
              <b>Tushar Gautam</b>
              <small>Analytics · real-time portfolio monitoring</small>
            </span>
          </Link>
          <nav className="rt-nav" aria-label="Sections">
            {NAV.map((n) => (
              <Link key={n.view} href={n.href} className={active === n.view ? "on" : ""}>
                <span>{n.no}</span>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="rt-top-right">
            <Clock />
            <button type="button" className="rt-top-theme" onClick={openThemes}>Theme <i>◐</i></button>
            <a href={`mailto:${profile.email}`} className="rt-btn small primary rt-top-cta">
              Open channel →
            </a>
          </div>
        </div>
      </header>

      <main className="rt-main" key={route.path}>
        {content}
      </main>

      <footer className="rt-foot">
        <div className="rt-foot-brand">
          <span className="rt-mark small">TG</span>
          <div>
            <b>{profile.name}</b>
            <span>{profile.role} · {profile.location}</span>
          </div>
        </div>
        <div className="rt-foot-cols">
          <div>
            <span className="rt-k">Index</span>
            {NAV.slice(1).map((n) => <Link key={n.view} href={n.href}>{n.label}</Link>)}
          </div>
          <div>
            <span className="rt-k">Elsewhere</span>
            {profile.socials.map((s) => <a key={s.label} href={s.href}>{s.label} · {s.handle}</a>)}
          </div>
          <div>
            <span className="rt-k">Status</span>
            <span className="rt-foot-status"><i className="rt-live-dot" /> all systems nominal</span>
            <span className="rt-foot-dim">p99 20ms · 3.79M events/day</span>
          </div>
        </div>
        <div className="rt-foot-bottom">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>CREAM / INDIGO / JETBRAINS MONO · hand-built, no template</span>
          <button type="button" onClick={openThemes}>Change theme ↻</button>
        </div>
      </footer>
    </div>
  );
}
