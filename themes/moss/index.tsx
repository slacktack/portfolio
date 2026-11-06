"use client";

import "./moss.css";
import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { openThemes } from "@/components/skin";
import { profile } from "@/lib/site";
import type { Route, ThemeAppProps, View } from "../types";
import { Systems, System } from "./guide";
import { Home } from "./home";
import { About, Lab, Missing, Note, Notes, Projects } from "./pages";

const tags: { href: string; label: string; num: string; views: View[]; len: number }[] = [
  { href: "/", label: "The wall", num: "I", views: ["home"], len: 18 },
  { href: "/systems", label: "Field guide", num: "II", views: ["systems", "system"], len: 34 },
  { href: "/projects", label: "Seed library", num: "III", views: ["projects"], len: 12 },
  { href: "/lab", label: "Bench", num: "IV", views: ["lab"], len: 28 },
  { href: "/notes", label: "Journals", num: "V", views: ["notes", "note"], len: 16 },
  { href: "/about", label: "Notebook", num: "VI", views: ["about"], len: 30 },
];

function screenFor(route: Route) {
  switch (route.view) {
    case "home":
      return <Home />;
    case "systems":
      return <Systems />;
    case "system":
      return <System slug={route.slug ?? ""} />;
    case "projects":
      return <Projects />;
    case "lab":
      return <Lab />;
    case "notes":
      return <Notes />;
    case "note":
      return <Note slug={route.slug ?? ""} />;
    case "about":
      return <About />;
    default:
      return <Missing />;
  }
}

function Swatches() {
  return (
    <span className="mo-sw" aria-hidden="true">
      <i style={{ background: "#2F432C" }} />
      <i style={{ background: "#A9C9A0" }} />
      <i style={{ background: "#DDF7A8" }} />
      <i style={{ background: "#FF8A6B" }} />
    </span>
  );
}

function Sign({ view }: { view: View }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    if (!menu) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [menu]);
  return (
    <header className="mo-sign" data-menu={menu ? "" : undefined}>
      <i className="mo-rod" aria-hidden="true" />
      <Link href="/" className="mo-brand" aria-label={`${profile.name}, the glasshouse home`}>
        <i className="mo-brand-str" aria-hidden="true" />
        <span className="mo-brand-plaque">
          <span className="mo-brand-seal">TG</span>
          <span className="mo-brand-txt">
            <b>Tushar&apos;s Glasshouse</b>
            <span>a living collection</span>
          </span>
        </span>
      </Link>
      <nav className="mo-tags" aria-label="Main">
        {tags.map((t, i) => (
          <Link key={t.href} href={t.href} className="mo-tag" aria-current={t.views.includes(view) ? "page" : undefined} style={{ "--i": i, "--len": `${t.len}px` } as CSSProperties} onClick={() => setMenu(false)}>
            <i className="mo-tag-str" aria-hidden="true" />
            <span className="mo-tag-card">
              <i className="mo-tag-hole" aria-hidden="true" />
              <em>{t.num}</em>
              <b>{t.label}</b>
            </span>
          </Link>
        ))}
      </nav>
      <button type="button" className="mo-menu" aria-expanded={menu} aria-controls="mo-vine" onClick={() => setMenu((m) => !m)}>
        <i className="mo-tag-str" aria-hidden="true" />
        <span className="mo-tag-card">
          <i className="mo-tag-hole" aria-hidden="true" />
          <b>{menu ? "Close" : "Index"}</b>
        </span>
      </button>
      <button type="button" className="mo-themes" onClick={openThemes} aria-haspopup="dialog" aria-label="Themes: change the whole site. Now showing Moss">
        <i className="mo-tag-str" aria-hidden="true" />
        <i className="mo-tag-str mo-tag-str-b" aria-hidden="true" />
        <span className="mo-themes-card">
          <Swatches />
          <span className="mo-themes-txt">
            <b>Themes</b>
            <span>change the whole site</span>
          </span>
        </span>
      </button>
      <div id="mo-vine" className="mo-vine" hidden={!menu}>
        {tags.map((t, i) => (
          <Link key={t.href} href={t.href} className="mo-vine-l" aria-current={t.views.includes(view) ? "page" : undefined} style={{ "--i": i } as CSSProperties} onClick={() => setMenu(false)}>
            <em>{t.num}</em> {t.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mo-foot">
      <div className="mo-foot-l">
        <span className="mo-k">Pressed, labelled and kept by</span>
        <b className="mo-foot-name">{profile.name}</b>
        <span>
          {profile.role} · {profile.location}
        </span>
      </div>
      <nav className="mo-foot-nav" aria-label="Footer">
        {tags.map((t) => (
          <Link key={t.href} href={t.href}>
            {t.label}
          </Link>
        ))}
        <button type="button" onClick={openThemes}>
          Themes
        </button>
      </nav>
      <a className="mo-btn" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
    </footer>
  );
}

export default function MossApp({ route }: ThemeAppProps) {
  const reduce = useReducedMotion();
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const on = () => setLifted(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [route.path]);

  return (
    <div className="t-moss" data-view={route.view} data-lifted={lifted ? "" : undefined}>
      <div className="mo-bg" aria-hidden="true">
        <i className="mo-bg-shaft" />
        <i className="mo-bg-shaft mo-bg-shaft-b" />
        <i className="mo-bg-glow" />
        <i className="mo-bg-mull" />
      </div>
      <Sign view={route.view} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
          key={route.path}
          id="main"
          className="mo-main"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 46, clipPath: "inset(14% 3% 0% 3% round 48px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -18, transition: { duration: 0.22 } }}
        >
          {screenFor(route)}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
