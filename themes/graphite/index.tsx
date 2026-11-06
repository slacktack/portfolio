"use client";

import "./graphite.css";
import { useEffect, useState } from "react";
import { getNote, getSystem } from "@/lib/site";
import type { ThemeAppProps } from "../types";
import { Case } from "./case";
import { Foot, Ruler } from "./chrome";
import { LensLayer, useReveal } from "./lens";
import { About, Home, Lab, Missing, NoteView, Notes, Projects, SystemsIndex } from "./views";

export default function App({ route }: ThemeAppProps) {
  const root = useReveal(route.path);
  const [xray, setXray] = useState(false);

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
    <div className="t-graphite" ref={root} data-view={view} data-xray={xray ? "" : undefined}>
      <a className="gr-skip" href="#gr-main">
        Skip to content
      </a>
      <div id="gr-main" className="gr-main" key={route.path}>
        {page}
      </div>
      <Foot />
      <Ruler view={view} xray={xray} onXray={() => setXray((v) => !v)} />
      <div className="gr-scan" aria-hidden="true" key={`s-${route.path}`} />
      <LensLayer path={route.path} />
    </div>
  );
}
