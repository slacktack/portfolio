"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { profile } from "@/lib/site";
import { skins } from "@/lib/skins";
import type { Route } from "../types";
import { counts } from "./data";
import { Toy, type ToyItem } from "./toy";

const where: Record<string, string> = {
  home: "The toy",
  systems: "Systems",
  system: "Case study",
  projects: "Projects",
  lab: "Lab",
  notes: "Notes",
  note: "Note",
  about: "About",
  missing: "Lost",
};

export const links = [
  { href: "/", label: "Home", n: "" },
  { href: "/systems", label: "Systems", n: counts.systems },
  { href: "/projects", label: "Projects", n: counts.projects },
  { href: "/lab", label: "Lab", n: counts.lab },
  { href: "/notes", label: "Notes", n: counts.notes },
  { href: "/about", label: "About", n: "" },
];

export function ThemesButton({ big }: { big?: boolean }) {
  const skin = useSkin();
  return (
    <button type="button" className={`cr-themes ${big ? "is-big" : ""}`} onClick={openThemes} aria-haspopup="dialog" data-mag="" title="Change the whole site">
      <span className="cr-sw" aria-hidden="true">
        {skin.swatches.slice(0, 3).map((s) => (
          <i key={s.hex} style={{ background: s.hex }} />
        ))}
      </span>
      <span>Themes</span>
      <small aria-hidden="true">{skins.length}</small>
    </button>
  );
}

export function Bar({ route, open, onMenu }: { route: Route; open: boolean; onMenu: () => void }) {
  return (
    <header className="cr-bar">
      <Link href="/" className="cr-mark" data-mag="" aria-label="Tushar Gautam, home">
        TG
      </Link>
      <p className="cr-where" aria-live="polite">
        <i aria-hidden="true" />
        {where[route.view]}
      </p>
      <nav className="cr-quick" aria-label="Primary">
        {links.slice(1).map((l) => {
          const on = route.path === l.href || route.path.startsWith(`${l.href}/`);
          return (
            <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined} data-mag="">
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="cr-bar-end">
        <ThemesButton />
        <button type="button" className="cr-menu-btn" aria-expanded={open} aria-controls="cr-menu" onClick={onMenu} data-mag="">
          <span className="cr-burger" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="cr-menu-word">{open ? "Close" : "Menu"}</span>
        </button>
      </div>
    </header>
  );
}

export function Menu({ open, onClose, path }: { open: boolean; onClose: () => void; path: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [peek, setPeek] = useState<ToyItem | null>(null);
  const items = useMemo<ToyItem[]>(
    () => [
      ...links.map((l, i) => ({
        id: l.href,
        value: l.label,
        label: l.n === "" ? undefined : `×${l.n}`,
        href: l.href,
        tone: i % 4,
        aria: `${l.label}${path === l.href ? ", current page" : ""}`,
      })),
      { id: "themes", value: "Themes", label: `×${skins.length}`, action: openThemes, tone: 1, aria: "Change the whole site" },
      { id: "mail", value: "Email", label: "say hi", href: `mailto:${profile.email}`, external: true, tone: 2, aria: `Email ${profile.email}` },
    ],
    [path],
  );

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => box.current?.querySelector<HTMLElement>(".cr-menu-close")?.focus(), 30);
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !box.current) return;
      const f = [...box.current.querySelectorAll<HTMLElement>("a, button")].filter((x) => x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", key);
    document.documentElement.classList.add("cr-menu-open");
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", key);
      document.documentElement.classList.remove("cr-menu-open");
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="cr-menu" id="cr-menu" role="dialog" aria-modal="true" aria-label="Site menu" ref={box} data-inv="" data-lenis-prevent>
      <div className="cr-menu-head">
        <p>
          <b>Grab a tag.</b> Throw it, stack it, or click it to go. Tab and Enter work too.
        </p>
        <button type="button" className="cr-menu-close" onClick={onClose} data-mag="">
          Close <kbd>Esc</kbd>
        </button>
      </div>
      <p className="cr-menu-peek" aria-hidden="true">
        {peek ? (
          <>
            <b>{peek.value}</b> {peek.label}
          </>
        ) : (
          <>
            <b>{profile.name}</b> {profile.role}, {profile.location}
          </>
        )}
      </p>
      <Toy rows={[]} items={items} auto={items.length} every={110} label="Menu tags. Each one is a link." className="cr-menu-toy" onPeek={setPeek} />
    </div>
  );
}
