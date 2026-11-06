"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as RKE } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { profile, systems } from "@/lib/site";
import type { View } from "../types";

type Slot = { id: string; label: string; sub: string; href?: string; icon: string };

const slots: Slot[] = [
  { id: "home", label: "Lobby", sub: "Character card and continue", href: "/", icon: "M4 11l8-7 8 7v9h-5v-6H9v6H4z" },
  { id: "systems", label: "Quests", sub: `${systems.length} production systems`, href: "/systems", icon: "M6 3h12v18l-6-4-6 4z" },
  { id: "projects", label: "Loadout", sub: "Builds, recordings, live links", href: "/projects", icon: "M3 7h18v12H3zM8 7V4h8v3M3 12h18" },
  { id: "lab", label: "Training", sub: "Interactive demos", href: "/lab", icon: "M12 3v18M3 12h18M6 6l12 12M18 6L6 18" },
  { id: "notes", label: "Codex", sub: "Field notes and lore", href: "/notes", icon: "M5 4h10l4 4v12H5zM15 4v4h4M8 12h8M8 16h6" },
  { id: "about", label: "Character", sub: "Sheet, campaign, perks", href: "/about", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21c1-4 4-6 8-6s7 2 8 6" },
  { id: "raven", label: "Raven", sub: "Email Tushar", href: `mailto:${profile.email}`, icon: "M3 6h18v12H3zM3 6l9 7 9-7" },
  { id: "themes", label: "Themes", sub: "Change the whole site", icon: "M12 3a9 9 0 100 18c1 0 2-1 1-2-1-2 0-3 2-3h3a3 3 0 003-3c0-5-4-10-9-10zM7 12h.01M9 7h.01M15 7h.01" },
];

const N = slots.length;
const STEP = 360 / N;
const R = 96;
const r = 50;

function pt(deg: number, rad: number) {
  const a = (deg * Math.PI) / 180;
  return `${(rad * Math.sin(a)).toFixed(2)} ${(-rad * Math.cos(a)).toFixed(2)}`;
}

function wedge(i: number) {
  const a0 = i * STEP - STEP / 2 + 1.4;
  const a1 = i * STEP + STEP / 2 - 1.4;
  return `M${pt(a0, r)} L${pt(a0, R)} A${R} ${R} 0 0 1 ${pt(a1, R)} L${pt(a1, r)} A${r} ${r} 0 0 0 ${pt(a0, r)} Z`;
}

const nearest = (from: number, to: number) => from + ((((to - from) % 360) + 540) % 360) - 180;

function viewSlot(view: View) {
  if (view === "system") return "systems";
  if (view === "note") return "notes";
  return view;
}

export function Wheel({ view }: { view: View }) {
  const router = useRouter();
  const skin = useSkin();
  const here = viewSlot(view);
  const hereIdx = Math.max(0, slots.findIndex((s) => s.id === here));
  // #menu deep-links straight into the open wheel
  const [open, setOpen] = useState(() => window.location.hash === "#menu");
  const [idx, setIdx] = useState(hereIdx);
  const [rot, setRot] = useState(0);
  const [needle, setNeedle] = useState(hereIdx * STEP);
  const ring = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  const highlight = (i: number, spin: boolean) => {
    const n = ((i % N) + N) % N;
    const nextRot = spin ? nearest(rot, -n * STEP) : rot;
    setIdx(n);
    setRot(nextRot);
    setNeedle((p) => nearest(p, n * STEP + nextRot));
  };

  const show = useCallback(() => {
    setOpen(true);
    setIdx(hereIdx);
    setRot(0);
    setNeedle(hereIdx * STEP);
  }, [hereIdx]);

  const close = useCallback(() => {
    setOpen(false);
    window.setTimeout(() => trigger.current?.focus({ preventScroll: true }), 0);
  }, []);

  const activate = useCallback(
    (i: number) => {
      const s = slots[i];
      setOpen(false);
      if (s.id === "themes") openThemes();
      else if (s.href?.startsWith("mailto:")) window.location.href = s.href;
      else if (s.href) router.push(s.href);
    },
    [router]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === "q" || e.key === "Q") {
        e.preventDefault();
        if (open) close();
        else show();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show, close]);

  useEffect(() => {
    if (!open) return;
    document.documentElement.classList.add("fg-wheel-open");
    const el = ring.current?.querySelector<HTMLElement>(`[data-slot="${idx}"]`);
    el?.focus({ preventScroll: true });
    return () => document.documentElement.classList.remove("fg-wheel-open");
    // focus only once on open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onKey = (e: RKE) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      highlight(idx + 1, true);
      ring.current?.querySelector<HTMLElement>(`[data-slot="${(idx + 1) % N}"]`)?.focus({ preventScroll: true });
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      highlight(idx - 1, true);
      ring.current?.querySelector<HTMLElement>(`[data-slot="${(idx - 1 + N) % N}"]`)?.focus({ preventScroll: true });
    } else if (/^[1-8]$/.test(e.key)) {
      activate(Number(e.key) - 1);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const n = idx + (e.shiftKey ? -1 : 1);
      highlight(n, false);
      ring.current?.querySelector<HTMLElement>(`[data-slot="${(n + N) % N}"]`)?.focus({ preventScroll: true });
    }
  };

  const onMove = (e: React.PointerEvent) => {
    const el = ring.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const dx = e.clientX - (b.left + b.width / 2);
    const dy = e.clientY - (b.top + b.height / 2);
    const dist = Math.hypot(dx, dy) / (b.width / 2);
    if (dist < r / 100 || dist > 1.08) return;
    const deg = (Math.atan2(dx, -dy) * 180) / Math.PI - rot;
    const i = ((Math.round(deg / STEP) % N) + N) % N;
    if (i !== idx) highlight(i, false);
  };

  const onRingClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a, button")) return;
    const el = ring.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    const dist = Math.hypot(e.clientX - (b.left + b.width / 2), e.clientY - (b.top + b.height / 2)) / (b.width / 2);
    if (dist >= r / 100 && dist <= 1.08) activate(idx);
  };

  const cur = slots[idx];

  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={`fg-wheel-btn${open ? " is-open" : ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Open the menu wheel (Q)"
        onClick={() => (open ? close() : show())}
      >
        <svg viewBox="-100 -100 200 200" aria-hidden="true">
          {slots.map((s, i) => (
            <path key={s.id} d={wedge(i)} className={i === hereIdx ? "on" : undefined} />
          ))}
        </svg>
        <span className="fg-wheel-btn-k">Menu</span>
        <kbd>Q</kbd>
      </button>

      {open ? (
        <div className="fg-wheel" role="dialog" aria-modal="true" aria-label="Menu wheel" data-lenis-prevent onKeyDown={onKey} onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="fg-wheel-glow" aria-hidden="true" />
          <div className="fg-wheel-top">
            <span>Select destination</span>
            <button type="button" className="fg-wheel-x" onClick={close}>
              Close <kbd>Esc</kbd>
            </button>
          </div>

          <div className="fg-wheel-stage" onClick={(e) => e.target === e.currentTarget && close()}>
            <div className="fg-wheel-ring" ref={ring} onPointerMove={onMove} onClick={onRingClick}>
              <div className="fg-wheel-spin" style={{ "--rot": `${rot}deg` } as CSSProperties}>
                <svg viewBox="-100 -100 200 200" aria-hidden="true">
                  <defs>
                    <radialGradient id="fg-w-on" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
                      <stop offset="0.5" stopColor="#8a4519" />
                      <stop offset="1" stopColor="#e07f33" />
                    </radialGradient>
                  </defs>
                  <circle r="99" className="fg-wheel-hair" />
                  <circle r={r - 4} className="fg-wheel-hair" />
                  {slots.map((s, i) => (
                    <path
                      key={s.id}
                      d={wedge(i)}
                      className={`fg-wedge${i === idx ? " on" : ""}${i === hereIdx ? " here" : ""}`}
                      style={{ "--a": `${i * STEP}deg` } as CSSProperties}
                    />
                  ))}
                  {Array.from({ length: 48 }, (_, i) => (
                    <line key={i} x1="0" y1={-99} x2="0" y2={i % 6 === 0 ? -94 : -97} transform={`rotate(${i * 7.5})`} className="fg-wheel-tick" />
                  ))}
                </svg>
                {slots.map((s, i) => {
                  const a = (i * STEP * Math.PI) / 180;
                  const m = (R + r) / 2;
                  const style = {
                    left: `${50 + (m / 2) * Math.sin(a)}%`,
                    top: `${50 - (m / 2) * Math.cos(a)}%`,
                  } as CSSProperties;
                  const inner = (
                    <>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d={s.icon} />
                      </svg>
                      <b>{s.label}</b>
                      <small>{i + 1}</small>
                    </>
                  );
                  const common = {
                    "data-slot": i,
                    className: `fg-slot${i === idx ? " on" : ""}${i === hereIdx ? " here" : ""}`,
                    style,
                    onFocus: () => i !== idx && highlight(i, false),
                    onPointerEnter: () => i !== idx && highlight(i, false),
                  };
                  if (s.id === "themes")
                    return (
                      <button key={s.id} type="button" {...common} onClick={() => activate(i)} aria-label="Themes: change the whole site">
                        {inner}
                      </button>
                    );
                  if (s.href?.startsWith("mailto:"))
                    return (
                      <a key={s.id} href={s.href} {...common} onClick={() => setOpen(false)}>
                        {inner}
                      </a>
                    );
                  return (
                    <Link key={s.id} href={s.href ?? "/"} {...common} onClick={() => setOpen(false)} aria-current={i === hereIdx ? "page" : undefined}>
                      {inner}
                    </Link>
                  );
                })}
              </div>

              <div className="fg-wheel-hub" aria-live="polite">
                <i className="fg-needle" style={{ "--fg-n": `${needle}deg` } as CSSProperties} aria-hidden="true" />
                <span className="fg-hub-k">{idx === hereIdx ? "You are here" : `Slot ${idx + 1}`}</span>
                <b key={cur.id}>{cur.label}</b>
                <span className="fg-hub-sub">{cur.sub}</span>
                {cur.id === "themes" ? (
                  <span className="fg-hub-sw" aria-label={`Current theme ${skin.name}`}>
                    {skin.swatches.map((w) => (
                      <i key={w.hex} style={{ background: w.hex }} />
                    ))}
                    {skin.name}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="fg-wheel-keys" aria-hidden="true">
            <span>
              <kbd>←</kbd>
              <kbd>→</kbd> rotate
            </span>
            <span>
              <kbd>Enter</kbd> go
            </span>
            <span>
              <kbd>1</kbd>–<kbd>8</kbd> jump
            </span>
          </div>
        </div>
      ) : null}
    </>
  );
}
