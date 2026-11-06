"use client";

import "./ember.css";
import { useEffect, useRef } from "react";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { Board } from "./board";
import { tools, toolFor } from "./layout";
import { FilePill, LayersPanel, MobileBar, Presence, StatusBar, Toolbar } from "./nav";
import { About, Lab, Missing, Note, Notes, Projects } from "./pages";
import { System, Systems } from "./systems";
import { useReveal } from "./ui";

// Moves the glass highlight toward the pointer.
function useRefract(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let ev: PointerEvent | null = null;
    const run = () => {
      raf = 0;
      const t = (ev?.target as Element | null)?.closest?.<HTMLElement>(".em-refract");
      if (!t || !ev) return;
      const r = t.getBoundingClientRect();
      t.style.setProperty("--gx", `${(((ev.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      t.style.setProperty("--gy", `${(((ev.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };
    const on = (e: PointerEvent) => {
      ev = e;
      if (!raf) raf = requestAnimationFrame(run);
    };
    el.addEventListener("pointermove", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", on);
    };
  }, [root]);
}

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;

  useReveal(route.path, root);
  useRefract(root);

  useEffect(() => {
    if (!location.hash) window.scrollTo(0, 0);
  }, [route.path]);

  let page: React.ReactNode;
  if (view === "home") page = <Board />;
  else if (view === "systems") page = <Systems />;
  else if (view === "system" && sys) page = <System s={sys} />;
  else if (view === "projects") page = <Projects />;
  else if (view === "lab") page = <Lab />;
  else if (view === "notes") page = <Notes />;
  else if (view === "note" && note) page = <Note n={note} />;
  else if (view === "about") page = <About />;
  else page = <Missing path={route.path} />;

  const t = toolFor(view);
  const title = sys ? `Frames / ${sys.shortTitle}` : note ? `Doc / ${note.title}` : (tools.find((x) => x.view === t)?.page ?? "Not found");

  return (
    <div className="t-ember" ref={root} data-view={view}>
      <div className="em-grain" aria-hidden="true" />
      <FilePill route={route} title={title} />
      <Toolbar view={view} />
      <Presence />
      <LayersPanel view={view} sys={sys} note={note} />
      <MobileBar view={view} sys={sys} note={note} />
      <main id="main" className="em-main" key={route.path}>
        {page}
      </main>
      {view !== "home" ? <StatusBar /> : null}
    </div>
  );
}
