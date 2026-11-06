"use client";

import "./crimson.css";
import { useCallback, useEffect, useState } from "react";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { Case } from "./case";
import { Cursor } from "./cursor";
import { Home } from "./home";
import { Bar, Menu } from "./nav";
import { About, Foot, Lab, Missing, NoteView, Notes, Projects } from "./pages";
import { useReveal } from "./ui";
import { SystemsIndex } from "./work";

export default function App({ route }: ThemeAppProps) {
  const root = useReveal(route.path);
  const [menu, setMenu] = useState<string | null>(null);
  const open = menu === route.path;
  const close = useCallback(() => setMenu(null), []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route.path]);

  const sys = route.view === "system" && route.slug ? getSystem(route.slug) : undefined;
  const note = route.view === "note" && route.slug ? getNote(route.slug) : undefined;
  const missing = route.view === "missing" || (route.view === "system" && !sys) || (route.view === "note" && !note);
  const view = missing ? "missing" : route.view;

  let page: React.ReactNode;
  if (view === "home") page = <Home />;
  else if (view === "systems") page = <SystemsIndex />;
  else if (view === "system" && sys) page = <Case s={sys} />;
  else if (view === "projects") page = <Projects />;
  else if (view === "lab") page = <Lab />;
  else if (view === "notes") page = <Notes />;
  else if (view === "note" && note) page = <NoteView n={note} />;
  else if (view === "about") page = <About />;
  else page = <Missing path={route.path} />;

  return (
    <div className="t-crimson" ref={root} data-view={view} data-menu={open ? "" : undefined}>
      <a className="cr-skip" href="#cr-main">
        Skip to content
      </a>
      <Bar route={{ ...route, view }} open={open} onMenu={() => setMenu(open ? null : route.path)} />
      <main id="cr-main" className="cr-main" key={route.path} inert={open}>
        {page}
      </main>
      <Foot />
      <Menu open={open} onClose={close} path={route.path} />
      <div className="cr-wipe" aria-hidden="true" key={`w-${route.path}`} />
      <Cursor />
    </div>
  );
}
