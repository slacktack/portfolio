"use client";

import "./aurora.css";
import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
import { openThemes } from "@/components/skin";
import { getNote, getSystem, labItems, notes, profile, systems, stage } from "@/lib/site";
import type { ThemeAppProps, View } from "../types";
import { Aurora, Colophon, Label, pad } from "./ui";
import { Home } from "./home";
import { Exhibit, Exhibits } from "./exhibits";
import { Bench, Salon } from "./salon";
import { About, Essay, Essays, Missing } from "./texts";

type Item = { href: string; a: string; b: string; views: View[]; count?: number };

const corners: Record<"tl" | "tr" | "bl" | "br", Item> = {
  tl: { href: "/systems", a: "Index", b: "Exhibits", views: ["systems", "system"], count: systems.length },
  tr: { href: "/about", a: "Statement", b: "About", views: ["about"] },
  bl: { href: "/projects", a: "Salon", b: "Projects", views: ["projects"], count: stage.length },
  br: { href: "/notes", a: "Essays", b: "Notes", views: ["notes", "note"], count: notes.length },
};

const rooms: Item[] = [
  { href: "/", a: "Opening", b: "Home", views: ["home"] },
  corners.tl,
  corners.bl,
  { href: "/lab", a: "Bench", b: "Lab", views: ["lab"], count: labItems.length },
  corners.br,
  corners.tr,
];

function useMotion(root: RefObject<HTMLDivElement | null>, path: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );
    el.querySelectorAll<HTMLElement>("[data-au]").forEach((n) => (reduce ? (n.dataset.in = "") : io.observe(n)));

    // pause the drifting aurora when it is off screen
    const live = new IntersectionObserver((es) => {
      for (const e of es) (e.target as HTMLElement).toggleAttribute("data-run", e.isIntersecting);
    });
    el.querySelectorAll<HTMLElement>(".au-aurora").forEach((n) => live.observe(n));
    return () => {
      io.disconnect();
      live.disconnect();
    };
  }, [root, path]);
}

function useFrame(frame: RefObject<HTMLDivElement | null>, path: string) {
  useEffect(() => {
    const f = frame.current;
    if (!f) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 40 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const seg = (i: number) => Math.min(1, Math.max(0, p * 4 - i)).toFixed(4);
      f.style.setProperty("--au-p0", seg(0));
      f.style.setProperty("--au-p1", seg(1));
      f.style.setProperty("--au-p2", seg(2));
      f.style.setProperty("--au-p3", seg(3));
      f.toggleAttribute("data-on", p > 0.002);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [frame, path]);
}

function Corner({ pos, item, view }: { pos: string; item: Item; view: View }) {
  const on = item.views.includes(view);
  return (
    <Link href={item.href} className={`au-corner au-${pos}`} aria-current={on ? "page" : undefined}>
      <span>
        {item.a}
        {item.count ? <sup>{pad(item.count)}</sup> : null}
      </span>
      <span>{item.b}</span>
    </Link>
  );
}

function ThemesButton({ className }: { className?: string }) {
  return (
    <button type="button" className={`au-themes ${className ?? ""}`.trim()} onClick={openThemes} data-cursor="Palette">
      <span className="au-themes-sw" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="au-themes-t">
        <span>Themes</span>
        <span>Change the whole site</span>
      </span>
    </button>
  );
}

function MobileIndex({ view, path }: { view: View; path: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const isOpen = open === path;
  useEffect(() => {
    if (!isOpen) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [isOpen]);
  return (
    <>
      <button
        type="button"
        className="au-mtrigger"
        aria-expanded={isOpen}
        aria-controls="au-mindex"
        onClick={() => setOpen(isOpen ? null : path)}
      >
        <span>{isOpen ? "Close" : "Index"}</span>
        <span>{isOpen ? "Back to room" : "All rooms"}</span>
        <i aria-hidden="true" />
      </button>
      <div id="au-mindex" className="au-mindex" data-open={isOpen ? "" : undefined} data-lenis-prevent inert={!isOpen}>
        <Aurora tone="violet" />
        <nav aria-label="Rooms">
          <ol>
            {rooms.map((r, i) => (
              <li key={r.href} style={{ "--au-i": i } as React.CSSProperties}>
                <Link href={r.href} aria-current={r.views.includes(view) ? "page" : undefined} onClick={() => setOpen(null)}>
                  <small>{pad(i)}</small>
                  <b>{r.b}</b>
                  <span>{r.a}</span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
        <ThemesButton className="au-themes-m" />
        <a className="au-mindex-mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
      </div>
    </>
  );
}

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  useMotion(root, route.path);
  useFrame(frame, route.path);

  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view: View = missing ? "missing" : route.view;

  let page: React.ReactNode;
  if (view === "home") page = <Home />;
  else if (view === "systems") page = <Exhibits />;
  else if (view === "system" && sys) page = <Exhibit s={sys} />;
  else if (view === "projects") page = <Salon />;
  else if (view === "lab") page = <Bench />;
  else if (view === "notes") page = <Essays />;
  else if (view === "note" && note) page = <Essay n={note} />;
  else if (view === "about") page = <About />;
  else page = <Missing path={route.path} />;

  return (
    <div className="t-aurora" ref={root} data-view={view}>
      <a className="au-skip" href="#au-main">
        Skip to content
      </a>
      <header className="au-nav">
        <Link href="/" className="au-mark" aria-current={view === "home" ? "page" : undefined}>
          <b>{profile.name}</b>
          <span>{view === "home" ? "An exhibition of systems" : "Back to the opening"}</span>
        </Link>
        <nav aria-label="Rooms" className="au-corners">
          <Corner pos="tl" item={corners.tl} view={view} />
          <Corner pos="tr" item={corners.tr} view={view} />
          <Corner pos="bl" item={corners.bl} view={view} />
          <Corner pos="br" item={corners.br} view={view} />
          <Link href="/lab" className="au-bench" aria-current={view === "lab" ? "page" : undefined}>
            <span>Bench</span>
            <span>Lab</span>
          </Link>
        </nav>
        <ThemesButton className="au-themes-d" />
        <MobileIndex view={view} path={route.path} />
      </header>
      <div className="au-frame" ref={frame} aria-hidden="true">
        <i className="au-f0" />
        <i className="au-f1" />
        <i className="au-f2" />
        <i className="au-f3" />
      </div>
      <div className="au-sweep" key={`s-${route.path}`} aria-hidden="true">
        <Label a={view === "missing" ? "Room" : "Now entering"} b={rooms.find((r) => r.views.includes(view))?.b ?? "Unlisted"} />
      </div>
      <main id="au-main" className="au-page" key={route.path}>
        {page}
        <Colophon />
      </main>
    </div>
  );
}
