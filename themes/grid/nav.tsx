"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { notes, profile, systems } from "@/lib/site";
import type { Route } from "../types";
import { ISSUE, MAST, TOTAL, notePage, pad, pageSpan, sections, sysPage } from "./ui";

function Editions({ big }: { big?: boolean }) {
  const skin = useSkin();
  return (
    <button type="button" className={`gr-editions ${big ? "is-big" : ""}`} onClick={openThemes} aria-haspopup="dialog">
      <span className="gr-editions-k">Other editions</span>
      <span className="gr-editions-t">Change the whole site</span>
      <span className="gr-editions-sw" aria-hidden="true">
        {skin.swatches.map((s) => (
          <i key={s.hex} style={{ background: s.hex }} />
        ))}
        <em>Themes →</em>
      </span>
    </button>
  );
}

function Sub({ route }: { route: Route }) {
  if (route.view === "system" || route.view === "systems")
    return (
      <ol className="gr-toc-sub">
        {systems.map((s) => (
          <li key={s.slug}>
            <Link href={`/systems/${s.slug}`} aria-current={route.slug === s.slug ? "page" : undefined}>
              <span>{s.shortTitle}</span>
              <em>{pad(sysPage(s.slug))}</em>
            </Link>
          </li>
        ))}
      </ol>
    );
  if (route.view === "note" || route.view === "notes")
    return (
      <ol className="gr-toc-sub">
        {notes.map((n) => (
          <li key={n.slug}>
            <Link href={`/notes/${n.slug}`} aria-current={route.slug === n.slug ? "page" : undefined}>
              <span>{n.title}</span>
              <em>{pad(notePage(n.slug))}</em>
            </Link>
          </li>
        ))}
      </ol>
    );
  return null;
}

function List({ route, onPick, sub }: { route: Route; onPick?: () => void; sub?: boolean }) {
  return (
    <ol className="gr-toc-list">
      {sections.map((s) => {
        const on = s.views.includes(route.view);
        return (
          <li key={s.n} className={on ? "is-on" : undefined}>
            <Link href={s.href} onClick={onPick} aria-current={on && route.path === s.href ? "page" : undefined}>
              <b>{s.n}</b>
              <span>{s.label}</span>
              <em>p.{s.p}</em>
            </Link>
            {on && sub && <Sub route={route} />}
          </li>
        );
      })}
    </ol>
  );
}

export function Contents({ route }: { route: Route }) {
  return (
    <aside className="gr-toc" aria-label="Contents">
      <Link href="/" className="gr-toc-mast">
        <b>{MAST}</b>
        <span>
          Issue {ISSUE} · {profile.location.split(",")[0]}
        </span>
      </Link>
      <nav aria-label="Sections">
        <p className="gr-toc-k">Contents</p>
        <List route={route} sub />
      </nav>
      <div className="gr-toc-foot">
        <Editions />
        <a className="gr-toc-mail" href={`mailto:${profile.email}`}>
          <span>Correspondence</span>
          {profile.email}
        </a>
      </div>
    </aside>
  );
}

export function Folio({ route }: { route: Route }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [a, b] = pageSpan(route.view, route.slug);
  useEffect(() => {
    let raf = 0;
    const set = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const t = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
      if (ref.current) ref.current.textContent = String(Math.round(a + (b - a) * t));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(set);
    };
    set();
    addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", on);
    };
  }, [a, b]);
  return (
    <div className="gr-folio" aria-hidden="true">
      <span className="gr-folio-k">{MAST} · No.&nbsp;{ISSUE}</span>
      <span className="gr-folio-p">
        p.&nbsp;<span ref={ref}>{a}</span> / {route.view === "missing" ? "∅" : TOTAL}
      </span>
    </div>
  );
}

export function Running({ route }: { route: Route }) {
  const [open, setOpen] = useState(false);
  const cur = sections.find((s) => s.views.includes(route.view));
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.documentElement.classList.add("gr-locked");
    addEventListener("keydown", k);
    return () => {
      document.documentElement.classList.remove("gr-locked");
      removeEventListener("keydown", k);
    };
  }, [open]);

  return (
    <>
      <header className="gr-run">
        <Link href="/" className="gr-run-mast">
          <b>No.&nbsp;{ISSUE}</b>
          <span>{cur ? `${cur.n} ${cur.label}` : "Erratum"}</span>
        </Link>
        <button type="button" className="gr-run-btn" aria-expanded={open} aria-controls="gr-sheet" onClick={() => setOpen(true)}>
          Contents
          <i aria-hidden="true" />
        </button>
      </header>
      <div id="gr-sheet" className="gr-sheet" data-open={open ? "1" : "0"} role="dialog" aria-modal="true" aria-label="Contents" data-lenis-prevent hidden={!open}>
        <div className="gr-sheet-top">
          <span>
            {MAST} · Issue {ISSUE}
          </span>
          <button type="button" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        <p className="gr-sheet-k">Contents</p>
        <ol className="gr-sheet-list">
          {sections.map((s, i) => (
            <li key={s.n} style={{ "--gd": `${80 + i * 50}ms` } as React.CSSProperties} className={s.views.includes(route.view) ? "is-on" : undefined}>
              <Link href={s.href} onClick={() => setOpen(false)}>
                <b>{s.n}</b>
                <span>{s.label}</span>
                <em>p.{s.p}</em>
              </Link>
            </li>
          ))}
        </ol>
        <Editions big />
        <a className="gr-toc-mail" href={`mailto:${profile.email}`}>
          <span>Correspondence</span>
          {profile.email}
        </a>
      </div>
    </>
  );
}
