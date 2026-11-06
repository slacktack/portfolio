"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { openThemes } from "@/components/skin";
import { CopyEmail } from "@/components/copy-email";
import { getSkin } from "@/lib/skins";
import { profile } from "@/lib/site";
import type { Route } from "../types";
import { Arrow, chapters, pad } from "./ui";

export type Sub = { id: string; label: string };

function ThemesButton({ compact = false }: { compact?: boolean }) {
  const sw = getSkin("summit").swatches;
  return (
    <button type="button" className="sm-themes" onClick={openThemes} aria-haspopup="dialog" aria-label="Themes: change the whole site">
      <span className="sm-themes-sw" aria-hidden="true">
        {sw.map((s) => (
          <i key={s.hex} style={{ background: s.hex }} />
        ))}
      </span>
      <span className="sm-themes-t">
        <b>Themes</b>
        {compact ? null : <small>Change the whole site</small>}
      </span>
    </button>
  );
}

function useScrollProgress(ref: React.RefObject<HTMLElement | null>, path: string) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const set = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      el.style.setProperty("--prog", max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : "0");
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(set);
    };
    set();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, [ref, path]);
}

function useActiveSub(subs: Sub[]) {
  const [active, setActive] = useState("");
  const key = subs.map((s) => s.id).join();
  useEffect(() => {
    const els = key
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (seen[0]) setActive(seen[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [key]);
  return active;
}

function IndexList({ route, subs, onGo }: { route: Route; subs: Sub[]; onGo?: () => void }) {
  const ai = Math.max(
    0,
    chapters.findIndex((c) => (c.views as readonly string[]).includes(route.view))
  );
  const sub = useActiveSub(subs);
  return (
    <ol className="sm-index" style={{ "--ai": ai, "--n": chapters.length } as CSSProperties}>
      <span className="sm-index-track" aria-hidden="true">
        <span className="sm-index-fill" />
      </span>
      {chapters.map((c, i) => {
        const on = i === ai && route.view !== "missing";
        return (
          <li key={c.href} data-on={on ? "" : undefined}>
            <Link href={c.href} aria-current={on ? "page" : undefined} onClick={onGo}>
              <span className="sm-index-n">{pad(i + 1)}</span>
              <span className="sm-index-l">{c.label}</span>
            </Link>
            {on && subs.length ? (
              <ul className="sm-index-sub">
                {subs.map((s) => (
                  <li key={s.id} data-on={sub === s.id ? "" : undefined}>
                    <a href={`#${s.id}`} onClick={onGo}>
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

export function Wordmark() {
  return (
    <Link href="/" className="sm-wordmark" aria-label={`${profile.name}, home`}>
      <span className="sm-mark" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span>
        <b>{profile.name}</b>
        <small>{profile.role}</small>
      </span>
    </Link>
  );
}

export function Rail({ route, subs }: { route: Route; subs: Sub[] }) {
  const ref = useRef<HTMLElement>(null);
  useScrollProgress(ref, route.path);
  return (
    <nav className="sm-rail" ref={ref} aria-label="Chapters">
      <ThemesButton />
      <IndexList route={route} subs={subs} />
      <div className="sm-rail-foot">
        <span>{profile.location}</span>
        <a href={`mailto:${profile.email}`}>Write to me</a>
      </div>
    </nav>
  );
}

export function MobileBar({ route, subs }: { route: Route; subs: Sub[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  useScrollProgress(bar, route.path);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    ref.current?.querySelector<HTMLElement>("a,button")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="sm-mbar" ref={bar}>
        <Wordmark />
        <ThemesButton compact />
        <button type="button" className="sm-menu" aria-expanded={open} aria-controls="sm-sheet" onClick={() => setOpen(true)}>
          Index
          <span aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
        <span className="sm-mbar-prog" aria-hidden="true" />
      </header>
      <div className="sm-sheet-wrap" data-open={open ? "" : undefined} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="sm-sheet" id="sm-sheet" ref={ref} role="dialog" aria-modal="true" aria-label="Index" data-lenis-prevent="">
          <div className="sm-sheet-top">
            <span className="sm-eyebrow">Index</span>
            <button type="button" className="sm-close" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
          <IndexList route={route} subs={subs} onGo={() => setOpen(false)} />
          <ThemesButton />
          <a className="sm-sheet-mail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="sm-foot" data-rise="">
      <div className="sm-foot-card">
        <span className="sm-eyebrow sm-eyebrow-inv">
          <b>∎</b>Contact
        </span>
        <p className="sm-foot-h">
          Have a hard problem? <em>Let&rsquo;s spec it.</em>
        </p>
        <div className="sm-foot-mail">
          <a href={`mailto:${profile.email}`} data-cursor="Write">
            {profile.email}
            <Arrow size={16} />
          </a>
          <CopyEmail email={profile.email} />
        </div>
        <dl className="sm-spec sm-foot-spec">
          <div>
            <dt>Role</dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt>Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{profile.availability}</dd>
          </div>
        </dl>
      </div>
      <div className="sm-foot-row">
        <span>© {profile.name}</span>
        <nav aria-label="Footer">
          {chapters.map((c) => (
            <Link key={c.href} href={c.href}>
              {c.label}
            </Link>
          ))}
        </nav>
        <button type="button" onClick={openThemes} className="sm-foot-themes">
          Change theme
        </button>
      </div>
    </footer>
  );
}
