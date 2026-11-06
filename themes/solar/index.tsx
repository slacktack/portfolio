"use client";

import "./solar.css";
import { useEffect, useRef } from "react";
import { ThemeTeaser } from "@/components/theme-palette";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { ClockHero, MiniClock } from "./clock";
import { About, Case, Foot, Lab, Missing, NoteView, Notes, Projects, SystemsIndex, Top } from "./pages";

const WORLDS = {
  home: ["sun", "Now", "The clock"],
  systems: ["amber", "12:00", "Systems"],
  system: ["amber", "12:00", "Systems"],
  projects: ["tangerine", "03:00", "Projects"],
  lab: ["lemon", "06:00", "Lab"],
  notes: ["honey", "09:00", "Notes"],
  note: ["honey", "09:00", "Notes"],
  about: ["sun", "10:00", "About"],
  missing: ["night", "13:00", "Nowhere"],
} as const;

export default function App({ route }: ThemeAppProps) {
  const root = useRef<HTMLDivElement>(null);
  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;
  const [world, hour, name] = WORLDS[view];

  useEffect(() => {
    window.scrollTo(0, 0);
    const els = root.current?.querySelectorAll<HTMLElement>(".sl-r");
    if (!els) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.setAttribute("data-in", "");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [route.path]);

  let page: React.ReactNode;
  if (view === "home")
    page = (
      <>
        <ClockHero />
        <section className="sl-tease">
          <ThemeTeaser />
        </section>
      </>
    );
  else if (view === "systems") page = <SystemsIndex />;
  else if (view === "system" && sys) page = <Case s={sys} />;
  else if (view === "projects") page = <Projects />;
  else if (view === "lab") page = <Lab />;
  else if (view === "notes") page = <Notes />;
  else if (view === "note" && note) page = <NoteView n={note} />;
  else if (view === "about") page = <About />;
  else page = <Missing path={route.path} />;

  return (
    <div className="t-solar" data-world={world} data-view={view} ref={root}>
      {view !== "home" && <Top hour={hour} name={name} />}
      {view !== "home" && <MiniClock path={route.path} />}
      <div className="sl-page" key={route.path}>
        {page}
        {view !== "missing" && <Foot />}
      </div>
    </div>
  );
}
