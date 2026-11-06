"use client";

import "./onyx.css";
import type { ThemeAppProps } from "../types";
import { Rail, STAR_TOTAL, useNegative, useReveal, useStars } from "./ui";
import { About, Home, Lab, Missing, Note, Notes, Projects, System, Systems } from "./views";

export default function App({ route }: ThemeAppProps) {
  const root = useReveal(route.path);
  const neg = useNegative();
  const { found } = useStars();
  const v = route.view;
  const page =
    v === "home" ? <Home />
    : v === "systems" ? <Systems />
    : v === "system" ? <System slug={route.slug ?? ""} />
    : v === "projects" ? <Projects />
    : v === "lab" ? <Lab />
    : v === "notes" ? <Notes />
    : v === "note" ? <Note slug={route.slug ?? ""} />
    : v === "about" ? <About />
    : <Missing />;
  return (
    <div className="t-onyx" data-view={v} data-neg={neg.on ? "on" : "off"} ref={root}>
      <span className="on-sweep" key={`s-${route.path}`} aria-hidden="true" />
      <div className="on-page" key={route.path}>
        {page}
      </div>
      {found.length === STAR_TOTAL ? (
        <div className="on-toast" role="status">
          ✦ All {STAR_TOTAL} stars found. The studio lights stay on.
        </div>
      ) : null}
      <Rail view={v} />
      <div className="on-grain" aria-hidden="true" />
    </div>
  );
}
