"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { openThemes } from "@/components/skin";
import { profile } from "@/lib/site";
import type { Route, View } from "../types";
import { layersFor, toolFor, tools, type Layer } from "./layout";
import { boardStore, useZoom } from "./store";
import { Ico } from "./ui";
import type { Note, SystemCase } from "@/lib/site";

const icons: Record<string, (p: React.SVGProps<SVGSVGElement>) => React.ReactElement> = {
  home: Ico.move,
  systems: Ico.frame,
  projects: Ico.board,
  lab: Ico.lab,
  notes: Ico.doc,
  about: Ico.credits,
};

const themeSw = ["#F7EDE6", "#E8382B", "#C81E1E", "#2747E8"];

function ThemesTool() {
  return (
    <button type="button" className="em-themes" onClick={openThemes} aria-haspopup="dialog" title="Change the whole site (T)">
      <span className="em-themes-sw" aria-hidden="true">
        {themeSw.map((c, i) => (
          <i key={c} style={{ background: c, "--em-i": i } as CSSProperties} />
        ))}
      </span>
      <span>Themes</span>
    </button>
  );
}

function Zoom({ home }: { home: boolean }) {
  const z = useZoom();
  const pct = `${Math.round((home ? z : 1) * 100)}%`;
  if (!home)
    return (
      <span className="em-zoom" aria-label="Zoom 100%">
        <b>{pct}</b>
      </span>
    );
  return (
    <span className="em-zoom" role="group" aria-label="Zoom">
      <button type="button" onClick={() => boardStore.zoomBy(1 / 1.2)} aria-label="Zoom out">
        <Ico.minus width={13} height={13} />
      </button>
      <button type="button" className="em-zoom-n" onClick={() => boardStore.reset()} title="Reset view (0)" aria-label={`Zoom ${pct}, reset view`}>
        {pct}
      </button>
      <button type="button" onClick={() => boardStore.zoomBy(1.2)} aria-label="Zoom in">
        <Ico.plus width={13} height={13} />
      </button>
    </span>
  );
}

export function Toolbar({ view }: { view: View }) {
  const active = toolFor(view);
  const router = useRouter();
  const wrap = useRef<HTMLDivElement>(null);
  const ind = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const w = wrap.current;
    const i = ind.current;
    if (!w || !i) return;
    const place = () => {
      const on = w.querySelector<HTMLElement>("[aria-current=page]");
      if (!on) {
        i.style.opacity = "0";
        return;
      }
      i.style.opacity = "1";
      i.style.width = `${on.offsetWidth}px`;
      i.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(w);
    return () => ro.disconnect();
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable], .lab2, .lab-demo")) return;
      const k = e.key.toUpperCase();
      if (k === "T") return openThemes();
      const tool = tools.find((x) => x.key === k);
      if (tool) router.push(tool.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <nav className="em-toolbar em-glass" aria-label="Site tools">
      <div className="em-tools" ref={wrap}>
        <i className="em-tb-ind" ref={ind} aria-hidden="true" />
        {tools.map((t) => {
          const I = icons[t.view];
          const on = active === t.view;
          return (
            <Link key={t.view} href={t.href} className="em-tool" aria-current={on ? "page" : undefined} title={`${t.page} (${t.key})`}>
              <I />
              <span>{t.label}</span>
              <kbd>{t.key}</kbd>
            </Link>
          );
        })}
      </div>
      <span className="em-tb-sep" aria-hidden="true" />
      <Zoom home={view === "home"} />
      <span className="em-tb-sep" aria-hidden="true" />
      <ThemesTool />
    </nav>
  );
}

export function FilePill({ route, title }: { route: Route; title: string }) {
  return (
    <div className="em-file em-glass">
      <Link href="/" className="em-file-mark" aria-label="Tushar Gautam, back to the board">
        <span className="em-logo" aria-hidden="true">
          tg
        </span>
      </Link>
      <span className="em-file-path">
        <span>tushar-gautam</span>
        <span aria-hidden="true">/</span>
        <b>{title}</b>
      </span>
      <span className="em-vh">{route.path}</span>
    </div>
  );
}

export function Presence() {
  return (
    <div className="em-presence em-glass">
      <span className="em-avs" aria-hidden="true">
        <i data-who="tg">TG</i>
        <i data-who="you">You</i>
      </span>
      <a className="em-share" href={`mailto:${profile.email}`}>
        Say hello
      </a>
    </div>
  );
}

function LayerLink({ l, onPick }: { l: Layer; onPick?: () => void }) {
  const inner = (
    <>
      <Ico.frame width={11} height={11} />
      <span>{l.label}</span>
      {l.sub ? <em>{l.sub}</em> : null}
    </>
  );
  if (l.focus)
    return (
      <button
        type="button"
        className="em-layer"
        onClick={() => {
          boardStore.focus(l.focus!);
          onPick?.();
        }}
      >
        {inner}
      </button>
    );
  if (l.href?.startsWith("#"))
    return (
      <a className="em-layer" href={l.href} onClick={onPick}>
        {inner}
      </a>
    );
  return (
    <Link className="em-layer" href={l.href ?? "/"} onClick={onPick}>
      {inner}
    </Link>
  );
}

function PageList({ view, onPick }: { view: View; onPick?: () => void }) {
  const active = toolFor(view);
  return (
    <ul className="em-pages">
      {tools.map((t) => {
        const I = icons[t.view];
        return (
          <li key={t.view}>
            <Link href={t.href} aria-current={active === t.view ? "page" : undefined} onClick={onPick}>
              <I width={14} height={14} />
              <span>{t.page}</span>
              <kbd>{t.key}</kbd>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function LayersPanel({ view, sys, note }: { view: View; sys?: SystemCase; note?: Note }) {
  const layers = layersFor(view, sys, note);
  const [open, setOpen] = useState(true);
  return (
    <aside className="em-layers em-glass" data-open={open ? "1" : "0"} aria-label="Pages and layers">
      <button type="button" className="em-layers-h" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <Ico.layers width={14} height={14} />
        <span>Layers</span>
        <em>{open ? "Hide" : "Show"}</em>
      </button>
      <div className="em-layers-b">
        <span className="em-layers-k">Pages</span>
        <PageList view={view} />
        {layers.length ? (
          <>
            <span className="em-layers-k">{view === "home" ? "Frames on this board" : "Layers"}</span>
            <ul className="em-layer-list" data-lenis-prevent="">
              {layers.map((l) => (
                <li key={l.label + (l.href ?? l.focus)}>
                  <LayerLink l={l} />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </aside>
  );
}

export function MobileBar({ view, sys, note }: { view: View; sys?: SystemCase; note?: Note }) {
  const [open, setOpen] = useState(false);
  const active = toolFor(view);
  const layers = layersFor(view, sys, note);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav className="em-mbar em-glass" aria-label="Site tools">
        {tools.map((t) => {
          const I = icons[t.view];
          return (
            <Link key={t.view} href={t.href} className="em-mtool" aria-current={active === t.view ? "page" : undefined} aria-label={t.page}>
              <I width={19} height={19} />
            </Link>
          );
        })}
        <button type="button" className="em-mtool em-mlayers" onClick={() => setOpen(true)} aria-expanded={open} aria-label="Layers and themes">
          <Ico.layers width={19} height={19} />
        </button>
      </nav>
      <div className="em-sheet" data-open={open ? "1" : "0"} aria-hidden={!open}>
        <button type="button" className="em-sheet-scrim" onClick={close} tabIndex={-1} aria-label="Close layers" />
        <div className="em-sheet-card" role="dialog" aria-modal="true" aria-label="Pages and layers" data-lenis-prevent="">
          <div className="em-sheet-h">
            <span>
              <Ico.layers width={14} height={14} /> Layers
            </span>
            <button type="button" onClick={close} aria-label="Close" tabIndex={open ? 0 : -1}>
              <Ico.close width={16} height={16} />
            </button>
          </div>
          <div className="em-sheet-themes" onClick={close}>
            <ThemesTool />
            <span>Change the whole site</span>
          </div>
          <span className="em-layers-k">Pages</span>
          <PageList view={view} onPick={close} />
          {layers.length ? (
            <>
              <span className="em-layers-k">Layers</span>
              <ul className="em-layer-list">
                {layers.map((l) => (
                  <li key={l.label + (l.href ?? l.focus)}>
                    <LayerLink l={l} onPick={close} />
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </div>
      <div className="em-mtop em-glass">
        <Link href="/" className="em-file-mark" aria-label="Back to the board">
          <span className="em-logo" aria-hidden="true">
            tg
          </span>
        </Link>
        <span className="em-mtop-t">{tools.find((t) => t.view === active)?.page ?? "Not found"}</span>
        <ThemesTool />
      </div>
    </>
  );
}

export function StatusBar() {
  return (
    <footer className="em-status">
      <span>
        <i aria-hidden="true" /> {profile.name} · {profile.role} · {profile.location}
      </span>
      <span className="em-status-r">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <button type="button" onClick={openThemes}>
          Themes
        </button>
      </span>
    </footer>
  );
}
