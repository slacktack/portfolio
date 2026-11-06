"use client";

import "./summit.css";
import { useEffect, useRef } from "react";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { Footer, MobileBar, Rail, Wordmark, type Sub } from "./nav";
import { Home } from "./home";
import { System, Systems, systemSubs } from "./systems";
import { Gallery } from "./gallery";
import { About, Lab, Missing, Note, Notes, aboutSubs, labSubs, noteSubs } from "./pages";

function useMotion(root: React.RefObject<HTMLDivElement | null>, path: string) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rise = el.querySelectorAll<HTMLElement>("[data-rise]");
    const par = new Set<HTMLElement>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    rise.forEach((r) => (reduce ? (r.dataset.in = "") : io.observe(r)));

    let raf = 0;
    const tick = () => {
      raf = 0;
      const h = window.innerHeight;
      par.forEach((p) => {
        const b = p.getBoundingClientRect();
        const v = (b.top + b.height / 2 - h / 2) / (h / 2 + b.height / 2);
        p.style.setProperty("--par", Math.max(-1, Math.min(1, v)).toFixed(3));
      });
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const vis = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) par.add(e.target as HTMLElement);
        else par.delete(e.target as HTMLElement);
      }
      on();
    });
    if (!reduce) {
      el.querySelectorAll<HTMLElement>("[data-par]").forEach((p) => vis.observe(p));
      window.addEventListener("scroll", on, { passive: true });
    }
    return () => {
      io.disconnect();
      vis.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
    };
  }, [root, path]);
}

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  useMotion(root, route.path);

  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;

  let page: React.ReactNode;
  let subs: Sub[] = [];
  if (view === "home") page = <Home />;
  else if (view === "systems") page = <Systems />;
  else if (view === "system" && sys) {
    page = <System s={sys} />;
    subs = systemSubs(sys);
  } else if (view === "projects") page = <Gallery />;
  else if (view === "lab") {
    page = <Lab />;
    subs = labSubs;
  } else if (view === "notes") page = <Notes />;
  else if (view === "note" && note) {
    page = <Note n={note} />;
    subs = noteSubs(note);
  } else if (view === "about") {
    page = <About />;
    subs = aboutSubs;
  } else page = <Missing path={route.path} />;

  const r = { ...route, view };
  return (
    <div className="t-summit" ref={root} data-view={view}>
      <div className="sm-top">
        <Wordmark />
      </div>
      <Rail route={r} subs={subs} />
      <MobileBar route={r} subs={subs} />
      <main id="main" className="sm-main" key={route.path}>
        {page}
        <Footer />
      </main>
    </div>
  );
}
