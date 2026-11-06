"use client";

import "./abyss.css";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps, View } from "../types";
import { Home, homeScenes } from "./home";
import { CaseStudy, SceneSelect } from "./scenes";
import { Reel } from "./reel";
import { About, Lab, Missing, Note, Notes } from "./pages";
import { Scrubber, TopBar } from "./scrubber";
import { NextChapter, player, usePlaying } from "./ui";
import { Water } from "./water";

function useReveal(root: React.RefObject<HTMLDivElement | null>, path: string, setShot: (s: string) => void) {
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    el.querySelectorAll<HTMLElement>("[data-ab]").forEach((n) => (reduce ? (n.dataset.in = "") : io.observe(n)));

    const shots = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setShot((e.target as HTMLElement).dataset.shot ?? "");
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    el.querySelectorAll<HTMLElement>("[data-shot]").forEach((n) => shots.observe(n));
    setShot("");
    return () => {
      io.disconnect();
      shots.disconnect();
    };
  }, [root, path, setShot]);
}

// Play: the home reel steps scene by scene; elsewhere the film rolls slowly.
function usePlayback(view: View, path: string) {
  const on = usePlaying();
  useEffect(() => () => player.set(false), [path]);
  useEffect(() => {
    if (!on) return;
    const stop = () => player.set(false);
    const keys = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(e.key)) stop();
    };
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", keys);
    let timer = 0;
    let raf = 0;
    if (view === "home") {
      const step = () => {
        const seq = document.querySelector<HTMLElement>(".ab-seq");
        if (!seq) return stop();
        const n = Number(seq.dataset.n);
        const vh = window.innerHeight;
        const top = seq.getBoundingClientRect().top + window.scrollY;
        const i = Math.round((window.scrollY - top) / vh);
        const next = window.scrollY < top - 4 ? 0 : i + 1;
        if (next >= n) return stop();
        window.scrollTo({ top: top + next * vh, behavior: "instant" });
      };
      timer = window.setTimeout(function loop() {
        step();
        if (player.get()) timer = window.setTimeout(loop, 5600);
      }, 500);
    } else {
      let last = performance.now();
      const roll = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= max - 2) return stop();
        window.scrollBy(0, 64 * dt);
        raf = requestAnimationFrame(roll);
      };
      raf = requestAnimationFrame(roll);
    }
    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", keys);
    };
  }, [on, view]);
}

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  const [shot, setShot] = useState("");
  useReveal(root, route.path, setShot);

  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view: View = missing ? "missing" : route.view;
  usePlayback(view, route.path);

  let page: ReactNode;
  if (view === "home") page = <Home />;
  else if (view === "systems") page = <SceneSelect />;
  else if (view === "system" && sys) page = <CaseStudy s={sys} />;
  else if (view === "projects") page = <Reel />;
  else if (view === "lab") page = <Lab />;
  else if (view === "notes") page = <Notes />;
  else if (view === "note" && note) page = <Note n={note} />;
  else if (view === "about") page = <About />;
  else page = <Missing path={route.path} />;

  return (
    <div className="t-abyss" ref={root} data-view={view}>
      <Water />
      <div className="ab-letterbox" data-on={view === "system" ? "" : undefined} aria-hidden="true">
        <i />
        <i />
      </div>
      <TopBar view={view} shot={shot} />
      <div className="ab-flare" key={`f-${route.path}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      <main id="main" className="ab-main" key={route.path}>
        {page}
        {view !== "home" && view !== "missing" ? <NextChapter view={view} /> : null}
      </main>
      <Scrubber view={view} scenes={view === "home" ? homeScenes : 0} />
    </div>
  );
}
