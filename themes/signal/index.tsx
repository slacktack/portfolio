"use client";

import "./signal.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { profile, systems } from "@/lib/site";
import type { Route, ThemeAppProps, View } from "../types";
import { Icon, Leds, Phos, useIst } from "./ui";
import { Boot, Home } from "./home";
import { ServiceCase, Services } from "./services";
import { About, Lab, Missing, Note, Notes, Projects } from "./pages";

const nav: { href: string; label: string; icon: string; views: View[]; code: string }[] = [
  { href: "/", label: "Console", icon: "console", views: ["home"], code: "00" },
  { href: "/systems", label: "Services", icon: "services", views: ["systems", "system"], code: "01" },
  { href: "/projects", label: "Monitors", icon: "monitors", views: ["projects"], code: "02" },
  { href: "/lab", label: "Terminal", icon: "terminal", views: ["lab"], code: "03" },
  { href: "/notes", label: "Logs", icon: "logs", views: ["notes", "note"], code: "04" },
  { href: "/about", label: "Operator", icon: "operator", views: ["about"], code: "05" },
];

function ThemesButton({ compact }: { compact?: boolean }) {
  const skin = useSkin();
  return (
    <button type="button" className="sg-themes" onClick={openThemes} aria-haspopup="dialog" aria-label={`Change the whole site, now ${skin.name}`}>
      <Icon name="themes" />
      <span className="sg-themes-t">
        <b>Themes</b>
        {compact ? null : <small>Change the whole site</small>}
      </span>
      <span className="sg-themes-sw" aria-hidden="true">
        {skin.swatches.map((s) => (
          <i key={s.hex} style={{ background: s.hex }} />
        ))}
      </span>
    </button>
  );
}

function NavList({ route, onGo }: { route: Route; onGo?: () => void }) {
  return (
    <ul className="sg-nav">
      {nav.map((n) => {
        const on = n.views.includes(route.view);
        return (
          <li key={n.href}>
            <Link href={n.href} aria-current={on ? "page" : undefined} onClick={onGo} title={n.label}>
              <Icon name={n.icon} />
              <span className="sg-nav-l">{n.label}</span>
              <span className="sg-nav-c">{n.code}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Rail({ route, collapsed, onToggle }: { route: Route; collapsed: boolean; onToggle: () => void }) {
  const { time } = useIst();
  return (
    <aside className="sg-rail" aria-label="Primary">
      <Phos />
      <div className="sg-rail-top">
        <Link href="/" className="sg-brand" aria-label={`${profile.name}, console home`}>
          <span className="sg-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span className="sg-brand-t">
            <b>TG/OPS</b>
            <small>{profile.role}</small>
          </span>
        </Link>
        <button type="button" className="sg-collapse" onClick={onToggle} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed}>
          <span aria-hidden="true">{collapsed ? "»" : "«"}</span>
        </button>
      </div>
      <span className="sg-rail-k">Navigate</span>
      <NavList route={route} />
      <div className="sg-rail-sp" />
      <ThemesButton />
      <div className="sg-status">
        <div className="sg-status-row">
          <span className="sg-live">
            <i /> Live
          </span>
          <b>{time}</b>
        </div>
        <Leds n={8} />
        <div className="sg-status-row sg-dim">
          <span>Bangalore · IST</span>
          <span>{systems.length} svc</span>
        </div>
        <a className="sg-status-mail" href={`mailto:${profile.email}`}>
          <Icon name="mail" />
          <span>Page the operator</span>
        </a>
      </div>
    </aside>
  );
}

function MobileBar({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const { time } = useIst();
  const here = nav.find((n) => n.views.includes(route.view));
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open]);
  return (
    <div className="sg-mbar" data-open={open ? "" : undefined}>
      <div className="sg-mbar-row">
        <Link href="/" className="sg-brand" onClick={() => setOpen(false)}>
          <span className="sg-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <b>TG/OPS</b>
        </Link>
        <span className="sg-mbar-here">
          <span className="sg-live">
            <i />
          </span>
          {here?.label ?? "404"} · {time}
        </span>
        <button type="button" className="sg-mbar-btn" aria-expanded={open} aria-controls="sg-drawer" onClick={() => setOpen((o) => !o)}>
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <div className="sg-drawer" id="sg-drawer" hidden={!open}>
        <NavList route={route} onGo={() => setOpen(false)} />
        <ThemesButton />
      </div>
    </div>
  );
}

function Screen({ route }: { route: Route }) {
  switch (route.view) {
    case "home":
      return <Home />;
    case "systems":
      return <Services />;
    case "system":
      return <ServiceCase slug={route.slug ?? ""} />;
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
      return <Missing path={route.path} />;
  }
}

export default function App({ route }: ThemeAppProps) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("sg-rail") === "1";
    } catch {
      return false;
    }
  });
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("sg-rail", c ? "0" : "1");
      } catch {
        // storage blocked
      }
      return !c;
    });

  return (
    <div className="t-signal" data-collapsed={collapsed ? "" : undefined}>
      <Rail route={route} collapsed={collapsed} onToggle={toggle} />
      <MobileBar route={route} />
      <div className="sg-scanbar" aria-hidden="true" />
      {route.view === "home" ? <Boot /> : null}
      <main id="main" className="sg-main">
        <div className="sg-view" key={route.path}>
          <Screen route={route} />
        </div>
      </main>
    </div>
  );
}
