"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as RPE } from "react";
import { openThemes, useSkin } from "@/components/skin";
import { skins } from "@/lib/skins";
import { getSystem, labItems, notes, profile, stage, systems } from "@/lib/site";

export type Hour = { key: string; label: string; kicker: string; value: string; caption: string; href?: string; themes?: boolean };

function sysHour(slug: string): Hour {
  const s = getSystem(slug) ?? systems[0];
  return { key: s.slug, label: s.title, kicker: `System ${s.index}`, value: s.metrics[0].value, caption: s.metrics[0].label, href: `/systems/${s.slug}` };
}

export const HOURS: Hour[] = [
  { key: "systems", label: "Systems", kicker: "Chapter", value: String(systems.length), caption: "Production case studies", href: "/systems" },
  sysHour("flights"),
  sysHour("hotels"),
  { key: "projects", label: "Projects", kicker: "Chapter", value: String(stage.length), caption: "Screen recordings, live links", href: "/projects" },
  sysHour("food"),
  sysHour("grocery"),
  { key: "lab", label: "Lab", kicker: "Chapter", value: String(labItems.length), caption: "Experiments to break", href: "/lab" },
  sysHour("categorizer"),
  sysHour("search"),
  { key: "notes", label: "Notes", kicker: "Chapter", value: String(notes.length), caption: "Field notes", href: "/notes" },
  { key: "about", label: "About", kicker: "Chapter", value: "SDE-1", caption: `${profile.role} · ${profile.location}`, href: "/about" },
  { key: "themes", label: "Themes", kicker: "Switch", value: String(skins.length), caption: "Versions of this site", themes: true },
];

const num = (p: number) => (p === 0 ? 12 : p);
const norm = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

export function ThemesButton({ small }: { small?: boolean }) {
  const skin = useSkin();
  return (
    <button type="button" className={`sl-themes${small ? " is-small" : ""}`} onClick={openThemes} data-cursor="Themes">
      <span className="sl-sw" aria-hidden="true">
        {skin.swatches.map((s) => (
          <i key={s.hex} style={{ background: s.hex }} />
        ))}
      </span>
      Themes
    </button>
  );
}

export function ClockHero({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const [order, setOrder] = useState(() => HOURS.map((_, i) => i));
  const [sel, setSel] = useState(0);
  const [angle, setAngle] = useState(0);
  const [drag, setDrag] = useState(false);
  const [rush, setRush] = useState(false);
  const [night, setNight] = useState(false);
  const angleRef = useRef(0);
  const box = useRef<HTMLDivElement>(null);
  const minR = useRef<SVGGElement>(null);
  const secR = useRef<SVGGElement>(null);
  const timeR = useRef<HTMLSpanElement>(null);
  const rushRef = useRef(false);
  useEffect(() => {
    rushRef.current = rush;
  }, [rush]);

  const item = HOURS[order[sel]];

  const setA = (a: number) => {
    angleRef.current = a;
    setAngle(a);
  };
  const select = useCallback((p: number) => {
    const i = ((p % 12) + 12) % 12;
    setSel(i);
    const a = angleRef.current + norm(i * 30 - angleRef.current);
    angleRef.current = a;
    setAngle(a);
  }, []);

  const open = (h: Hour) => {
    onNavigate?.();
    if (h.themes) openThemes();
    else if (h.href) router.push(h.href);
  };

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const now = new Date();
    let sec = (now.getSeconds() + now.getMilliseconds() / 1000) * 6;
    let min = (now.getMinutes() + now.getSeconds() / 60) * 6;
    let raf = 0;
    let last = performance.now();
    let visible = true;
    const paint = () => {
      const r = rushRef.current;
      secR.current?.setAttribute("transform", `rotate(${r ? sec : Math.floor(sec / 6) * 6} 500 500)`);
      minR.current?.setAttribute("transform", `rotate(${min} 500 500)`);
      if (timeR.current) {
        const d = new Date();
        timeR.current.textContent = d.toTimeString().slice(0, 8);
      }
    };
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      const r = rushRef.current;
      sec += dt * (r ? 240 : 6);
      min += dt * (r ? 30 : 1.2);
      paint();
      raf = visible ? requestAnimationFrame(tick) : 0;
    };
    paint();
    if (reduce) return;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    if (box.current) io.observe(box.current);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const pointAngle = (e: RPE) => {
    const r = box.current!.getBoundingClientRect();
    return (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
  };
  const down = (e: RPE<HTMLDivElement>) => {
    if ((e.target as Element).closest("a, button")) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(true);
    move(e);
  };
  const move = (e: RPE<HTMLDivElement>) => {
    if (!drag && e.type === "pointermove") return;
    const d = pointAngle(e);
    const a = angleRef.current + norm(d - angleRef.current);
    setA(a);
    setSel(((Math.round(a / 30) % 12) + 12) % 12);
  };
  const up = () => {
    if (!drag) return;
    setDrag(false);
    setA(Math.round(angleRef.current / 30) * 30);
  };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") select(sel + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") select(sel - 1);
    else if (e.key === "Home") select(0);
    else if (e.key === "End") select(11);
    else if (e.key === "Enter") open(item);
    else return;
    e.preventDefault();
  };
  const shuffle = () => {
    const o = [...order];
    for (let i = o.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [o[i], o[j]] = [o[j], o[i]];
    }
    setOrder(o);
  };

  return (
    <section
      className={`sl-hero${compact ? " is-compact" : ""}`}
      data-mode={night ? "night" : "sun"}
      data-rush={rush ? "" : undefined}
      aria-label="The clock: every hour is a chapter"
    >
      <div className="sl-hero-glow" aria-hidden="true" />
      <div className="sl-dialwrap">
        <div
          ref={box}
          className="sl-dial"
          data-drag={drag ? "" : undefined}
          role="slider"
          tabIndex={0}
          aria-label="Hour hand. Arrow keys turn it, Enter opens the hour."
          aria-valuemin={1}
          aria-valuemax={12}
          aria-valuenow={num(sel)}
          aria-valuetext={`${num(sel)} o'clock: ${item.label}`}
          onKeyDown={key}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <svg viewBox="0 0 1000 1000" className="sl-face" aria-hidden="true">
            <defs>
              <radialGradient id="sl-fg" cx="38%" cy="30%" r="80%">
                <stop offset="0" stopColor="var(--sl-f1)" />
                <stop offset="0.55" stopColor="var(--sl-f2)" />
                <stop offset="1" stopColor="var(--sl-f3)" />
              </radialGradient>
            </defs>
            <circle cx="500" cy="500" r="490" className="sl-rim" />
            <circle cx="500" cy="500" r="470" fill="url(#sl-fg)" />
            {Array.from({ length: 60 }, (_, i) => (
              <line
                key={i}
                x1="500"
                y1={i % 5 ? 44 : 40}
                x2="500"
                y2={i % 5 ? 60 : 92}
                className={i % 5 ? "sl-tk" : "sl-tk is-h"}
                transform={`rotate(${i * 6} 500 500)`}
              />
            ))}
            <circle cx="500" cy="500" r="300" className="sl-ring" />
            <g className="sl-hh" style={{ transform: `rotate(${angle}deg)` }}>
              <path d="M484 500 L490 262 L500 236 L510 262 L516 500 Z" className="sl-hh-b" />
              <circle cx="500" cy="252" r="14" className="sl-hh-t" />
            </g>
            <g ref={minR}>
              <rect x="496" y="70" width="8" height="430" rx="4" className="sl-mh" />
            </g>
            <g ref={secR}>
              <rect x="498.5" y="56" width="3" height="510" className="sl-sh" />
              <circle cx="500" cy="56" r="9" className="sl-sh" />
            </g>
          </svg>
          {order.map((hi, p) => {
            const h = HOURS[hi];
            const a = p * 30;
            return (
              <button
                key={h.key}
                type="button"
                tabIndex={-1}
                className="sl-hr"
                aria-pressed={p === sel}
                style={{ "--sl-a": `${a}deg` } as CSSProperties}
                onClick={() => (p === sel ? open(h) : select(p))}
                onDoubleClick={() => open(h)}
              >
                <b>{num(p)}</b>
                <span>{getSystem(h.key)?.shortTitle ?? h.label}</span>
              </button>
            );
          })}
          <div className="sl-centre" key={item.key}>
            <small>
              {String(num(sel)).padStart(2, "0")}:00 · {item.kicker}
            </small>
            <strong className="sl-c-title">{item.label}</strong>
            <span className="sl-c-val">{item.value}</span>
            <span className="sl-c-cap">{item.caption}</span>
            {item.themes ? (
              <button type="button" className="sl-open" onClick={() => open(item)}>
                Open themes
              </button>
            ) : (
              <Link className="sl-open" href={item.href!} onClick={onNavigate}>
                Open
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="sl-side">
        <div className="sl-side-top">
          {!compact && <ThemesButton />}
          <p className="sl-kick">
            {profile.name} · {profile.role}
          </p>
          {!compact && (
            <h1 className="sl-h1">
              A clock <em>you play.</em>
            </h1>
          )}
          <p className="sl-lede">Drag the hour hand or pick an hour. Every hour is a chapter or a system I built.</p>
        </div>
        <div className="sl-ctrls" role="group" aria-label="Clock controls">
          <button type="button" onClick={shuffle}>
            Shuffle
          </button>
          <button type="button" aria-pressed={rush} onClick={() => setRush(!rush)}>
            Rush hour
          </button>
          <button type="button" aria-pressed={night} onClick={() => setNight(!night)}>
            {night ? "Night" : "Sundial"}
          </button>
          <span className="sl-time" aria-hidden="true">
            <span ref={timeR}>--:--:--</span> your time
          </span>
        </div>
        <ol className="sl-board" aria-label="All hours">
          {order.map((hi, p) => {
            const h = HOURS[hi];
            const inner = (
              <>
                <b>{String(num(p)).padStart(2, "0")}:00</b>
                <span>{h.label}</span>
                <em>{h.value}</em>
              </>
            );
            return (
              <li key={h.key} aria-current={p === sel ? "true" : undefined}>
                {h.themes ? (
                  <button type="button" onClick={() => open(h)} onMouseEnter={() => select(p)} onFocus={() => select(p)}>
                    {inner}
                  </button>
                ) : (
                  <Link href={h.href!} onClick={onNavigate} onMouseEnter={() => select(p)} onFocus={() => select(p)}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function MiniClock({ path }: { path: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const hand = useRef<SVGLineElement>(null);
  const isOpen = open === path;

  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        const p = max > 0 ? scrollY / max : 0;
        hand.current?.setAttribute("transform", `rotate(${p * 360} 20 20)`);
      });
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => {
      removeEventListener("scroll", on);
      cancelAnimationFrame(raf);
    };
  }, [path]);

  useEffect(() => {
    if (!isOpen) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    addEventListener("keydown", esc);
    document.documentElement.style.overflow = "hidden";
    return () => {
      removeEventListener("keydown", esc);
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button type="button" className="sl-mini" aria-label="Open the dial" aria-expanded={isOpen} onClick={() => setOpen(path)} data-cursor="Dial">
        <svg viewBox="0 0 40 40" aria-hidden="true">
          <circle cx="20" cy="20" r="18" />
          {[0, 90, 180, 270].map((a) => (
            <line key={a} x1="20" y1="4" x2="20" y2="8" transform={`rotate(${a} 20 20)`} />
          ))}
          <line x1="20" y1="20" x2="20" y2="11" className="is-h" />
          <line ref={hand} x1="20" y1="22" x2="20" y2="6" className="is-m" />
        </svg>
      </button>
      {isOpen && (
        <div className="sl-overlay" role="dialog" aria-modal="true" aria-label="The dial">
          <button type="button" className="sl-close" onClick={() => setOpen(null)} autoFocus>
            Close
          </button>
          <ClockHero compact onNavigate={() => setOpen(null)} />
        </div>
      )}
    </>
  );
}
