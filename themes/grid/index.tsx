"use client";

import "./grid.css";
import { useEffect, useRef } from "react";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { Cover } from "./cover";
import { Contents, Folio, Running } from "./nav";
import { Colophon, Essay, Essays, Lab, Missing } from "./pages";
import { Plates } from "./plates";
import { Article, Toc } from "./systems";

function useReveal(root: React.RefObject<HTMLDivElement | null>, path: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const all = el.querySelectorAll<HTMLElement>("[data-rv]");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      all.forEach((r) => (r.dataset.in = ""));
      return;
    }
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
    all.forEach((r) => io.observe(r));
    return () => io.disconnect();
  }, [root, path]);
}

const COLS = 13;

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root, route.path);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;
  const r = { ...route, view };

  let page: React.ReactNode;
  if (view === "home") page = <Cover />;
  else if (view === "systems") page = <Toc />;
  else if (view === "system" && sys) page = <Article s={sys} />;
  else if (view === "projects") page = <Plates />;
  else if (view === "lab") page = <Lab />;
  else if (view === "notes") page = <Essays />;
  else if (view === "note" && note) page = <Essay n={note} />;
  else if (view === "about") page = <Colophon />;
  else page = <Missing path={route.path} />;

  return (
    <div className="t-grid" ref={root} data-view={view}>
      <div className="gr-stock" aria-hidden="true" />
      <div className="gr-cols" aria-hidden="true" key={`c-${route.path}`}>
        {Array.from({ length: COLS }, (_, i) => (
          <i key={i} style={{ "--gi": i } as React.CSSProperties} />
        ))}
      </div>
      <a className="gr-skip" href="#gr-main">
        Skip to article
      </a>
      <Contents route={r} />
      <Running route={r} />
      <main id="gr-main" className="gr-main" key={route.path}>
        {page}
        <footer className="gr-foot">
          <span>The Invisible Layer · Issue 01</span>
          <span>Printed on black stock in one spot colour</span>
          <span>© {new Date().getFullYear()} Tushar Gautam</span>
        </footer>
      </main>
      <div className="gr-turn" aria-hidden="true" key={`t-${route.path}`}>
        <i />
      </div>
      <Folio route={r} />
    </div>
  );
}
