"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { ThemeTeaser } from "@/components/theme-palette";
import { currently, getSystem, labItems, marqueeMetrics, notes, profile, stage, systems } from "@/lib/site";
import { HERO, WORLD, boardFrames, type BoardFrame } from "./layout";
import { boardStore } from "./store";
import { FrameLabel, Ico, Pin, Sel, Swatches, gradFor, posterFor } from "./ui";

const flatQuery = "(max-width: 860px)";
const subFlat = (f: () => void) => {
  const m = window.matchMedia(flatQuery);
  m.addEventListener("change", f);
  return () => m.removeEventListener("change", f);
};
const useFlat = () =>
  useSyncExternalStore(
    subFlat,
    () => window.matchMedia(flatQuery).matches,
    () => false
  );

const clampN = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function SystemBody({ slug, i }: { slug: string; i: number }) {
  const s = getSystem(slug);
  const p = posterFor(slug);
  if (!s) return null;
  return (
    <>
      <div className="em-bf-media" style={{ background: gradFor(i) }}>
        {p ? <Image src={p.poster} alt="" fill sizes="480px" draggable={false} /> : null}
        <span className="em-bf-metric">
          <b>{s.metrics[0].value}</b>
          <em>{s.metrics[0].label}</em>
        </span>
      </div>
      <div className="em-bf-cap">
        <span className="em-bf-k">
          {s.index} · {s.category}
        </span>
        <h2>{s.title}</h2>
        <p>{s.promise}</p>
      </div>
    </>
  );
}

function FrameBody({ f }: { f: BoardFrame }) {
  switch (f.id) {
    case "flights":
    case "hotels":
    case "food":
    case "grocery":
      return <SystemBody slug={f.id} i={["flights", "hotels", "food", "grocery"].indexOf(f.id)} />;
    case "doc":
      return (
        <div className="em-bf-doc">
          <span className="em-bf-k">Field notes · {notes.length} docs</span>
          <h2>
            Writing on <em className="em-serif">low-latency</em> systems
          </h2>
          <ol>
            {notes.map((n, i) => (
              <li key={n.slug}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <b>{n.title}</b>
                <em>
                  {n.readTime} · {n.category}
                </em>
              </li>
            ))}
          </ol>
          <span className="em-doc-lines" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>
      );
    case "credits":
      return (
        <div className="em-bf-credits">
          <span className="em-bf-k">Studio credits</span>
          <h2 className="em-serif">{profile.name}</h2>
          <p>
            {profile.role} · {profile.location}
          </p>
          <dl>
            {currently.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "lab":
      return (
        <div className="em-bf-lab">
          <span className="em-bf-k">Prototypes · press play</span>
          <h2>
            Small systems, <em className="em-serif">strange constraints.</em>
          </h2>
          <ul>
            {labItems.slice(0, 6).map((l) => (
              <li key={l.slug}>
                <Ico.lab width={14} height={14} />
                <b>{l.title}</b>
                <em>{l.detail}</em>
              </li>
            ))}
          </ul>
        </div>
      );
    case "board": {
      const picks = stage.filter((s) => s.tag !== "Buyhatke").slice(0, 4);
      return (
        <div className="em-bf-mood">
          <span className="em-bf-k">Moodboard · {stage.length} recordings</span>
          <h2>
            Things made <em className="em-serif">after hours</em>
          </h2>
          <div className="em-bf-pins">
            {picks.map((p, i) => (
              <figure key={p.slug} style={{ "--em-r": `${[-5, 3, -2, 4][i]}deg` } as CSSProperties}>
                <span className="em-tape" aria-hidden="true" />
                <Image src={p.poster} alt="" width={320} height={200} sizes="200px" draggable={false} />
                <figcaption>{p.title}</figcaption>
              </figure>
            ))}
          </div>
          <Swatches list={["#F7EDE6", "#FFB38F", "#FF6B57", "#E8382B", "#8E1020"]} />
        </div>
      );
    }
    case "systems":
      return (
        <div className="em-bf-list">
          <span className="em-bf-k">All frames · {systems.length} systems</span>
          <ol>
            {systems.map((s, i) => (
              <li key={s.slug}>
                <i style={{ background: gradFor(i) }} />
                <b>{s.title}</b>
                <em>{s.metrics[0].value}</em>
              </li>
            ))}
          </ol>
        </div>
      );
    case "themes":
      return (
        <div className="em-bf-themes">
          <ThemeTeaser className="em-teaser" />
        </div>
      );
    case "numbers":
      return (
        <div className="em-bf-numbers">
          {marqueeMetrics.slice(0, 6).map((m, i) => (
            <span key={m} className="em-mini-sticky" data-tone={["butter", "peach", "pink", "coral", "peach", "butter"][i]} style={{ "--em-r": `${[-3, 2, -1.5, 2.5, -2, 1][i]}deg` } as CSSProperties}>
              {m}
            </span>
          ))}
        </div>
      );
    default:
      return null;
  }
}

const hrefFor: Record<string, string | undefined> = {
  flights: "/systems/flights",
  hotels: "/systems/hotels",
  food: "/systems/food",
  grocery: "/systems/grocery",
  doc: "/notes",
  credits: "/about",
  lab: "/lab",
  board: "/projects",
  systems: "/systems",
};

function Frame({ f }: { f: BoardFrame }) {
  const href = hrefFor[f.id];
  const style = { "--x": `${f.x}px`, "--y": `${f.y}px`, "--w": `${f.w}px`, "--h": `${f.h}px` } as CSSProperties;
  const body: ReactNode = <FrameBody f={f} />;
  return (
    <div className="em-bframe" data-id={f.id} data-em-in="" style={style}>
      <FrameLabel n={f.n} name={f.name} dims={`${f.w} × ${f.h}`} />
      {href ? (
        <Link href={href} className={`em-frame em-bf em-bf-${f.id}`} draggable={false} aria-label={`Frame ${f.n}, ${f.name}. Open`}>
          {body}
          <span className="em-bf-open" aria-hidden="true">
            Open <Ico.arrow width={13} height={13} />
          </span>
          <Sel dims={`${f.w} × ${f.h}`} />
        </Link>
      ) : (
        <div className={`em-bf em-bf-${f.id}`}>{body}</div>
      )}
    </div>
  );
}

function Hero() {
  const style = { "--x": `${HERO.x}px`, "--y": `${HERO.y}px`, "--w": `${HERO.w}px`, "--h": `${HERO.h}px` } as CSSProperties;
  return (
    <section className="em-hero-wrap" data-id="hero" style={style} aria-labelledby="em-hero-h">
      <span className="em-comp-tag" aria-hidden="true">
        <Ico.comp width={11} height={11} /> Hero · Auto layout
      </span>
      <div className="em-hero em-glass em-refract">
        <span className="em-hero-status">
          <i aria-hidden="true" /> {profile.availability} · {profile.availabilityDetail}
        </span>
        <h1 id="em-hero-h">
          Tushar <em className="em-serif">Gautam</em>
        </h1>
        <p>
          {profile.tagline} <span>{profile.description}</span>
        </p>
        <div className="em-hero-cta">
          <Link href="/systems" className="em-sqbtn" draggable={false}>
            Open the frames <Ico.arrow width={15} height={15} />
          </Link>
          <Link href="/about" className="em-ghostbtn" draggable={false}>
            Studio credits
          </Link>
        </div>
      </div>
      <Sel dims={`${HERO.w} × ${HERO.h}`} />
    </section>
  );
}

export function Board() {
  const flat = useFlat();
  const vp = useRef<HTMLDivElement>(null);
  const world = useRef<HTMLDivElement>(null);
  const mini = useRef<HTMLSpanElement>(null);
  const st = useRef({ x: 0, y: 0, s: 1 });
  const anim = useRef(0);

  const apply = useCallback(() => {
    const w = world.current;
    const v = vp.current;
    if (!w || !v) return;
    const { x, y, s } = st.current;
    w.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${s.toFixed(4)})`;
    boardStore.setZoom(s);
    const m = mini.current;
    if (m) {
      m.style.left = `${(-x / s / WORLD.w) * 100}%`;
      m.style.top = `${(-y / s / WORLD.h) * 100}%`;
      m.style.width = `${(v.clientWidth / s / WORLD.w) * 100}%`;
      m.style.height = `${(v.clientHeight / s / WORLD.h) * 100}%`;
    }
  }, []);

  const clamp = useCallback((t: { x: number; y: number; s: number }) => {
    const v = vp.current!;
    const W = v.clientWidth;
    const H = v.clientHeight;
    const M = 160;
    const ax = W - WORLD.w * t.s - M;
    const ay = H - WORLD.h * t.s - M;
    return { s: t.s, x: clampN(t.x, Math.min(M, ax), Math.max(M, ax)), y: clampN(t.y, Math.min(M + 40, ay), Math.max(M + 40, ay)) };
  }, []);

  useEffect(() => {
    const v = vp.current;
    if (flat || !v) {
      boardStore.attach({
        zoomBy: () => {},
        reset: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        focus: (id) => document.querySelector(`[data-id="${id}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
      });
      return () => boardStore.attach(null);
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const side = () => (v.clientWidth >= 1180 ? 250 : 0);

    const tween = (to: { x: number; y: number; s: number }, ms = 760) => {
      cancelAnimationFrame(anim.current);
      const target = clamp(to);
      if (reduce) {
        st.current = target;
        apply();
        return;
      }
      const from = { ...st.current };
      const t0 = performance.now();
      v.dataset.moving = "1";
      const step = (now: number) => {
        const k = ease(Math.min(1, (now - t0) / ms));
        st.current = { x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k, s: from.s + (target.s - from.s) * k };
        apply();
        if (k < 1) anim.current = requestAnimationFrame(step);
        else delete v.dataset.moving;
      };
      anim.current = requestAnimationFrame(step);
    };

    const fitTo = (r: { x: number; y: number; w: number; h: number }, fill: number, cap: number) => {
      const W = v.clientWidth - side();
      const H = v.clientHeight - 170;
      const s = clampN(Math.min((W * fill) / r.w, (H * fill) / r.h), 0.35, cap);
      return { s, x: side() + W / 2 - (r.x + r.w / 2) * s, y: 110 + H / 2 - (r.y + r.h / 2) * s };
    };
    const home = () => {
      const W = v.clientWidth - side();
      const s = clampN(Math.min(W / 1650, (v.clientHeight - 120) / 1050), 0.42, 1);
      return { s, x: side() + W / 2 - (HERO.x + HERO.w / 2) * s, y: 60 + (v.clientHeight - 60) / 2 - (HERO.y + HERO.h / 2) * s };
    };
    const zoomAt = (f: number, cx = v.clientWidth / 2, cy = v.clientHeight / 2, animate = true) => {
      const { x, y, s } = st.current;
      const s2 = clampN(s * f, 0.35, 1.6);
      const to = { s: s2, x: cx - (cx - x) * (s2 / s), y: cy - (cy - y) * (s2 / s) };
      if (animate) tween(to, 320);
      else {
        st.current = clamp(to);
        apply();
      }
    };
    const focus = (id: string) => {
      const r = id === "hero" ? HERO : boardFrames.find((f) => f.id === id);
      if (r) tween(fitTo(r, 0.8, 1.1), 900);
    };

    const start = home();
    st.current = clamp({ ...start, s: start.s * (reduce ? 1 : 0.86), x: start.x + (reduce ? 0 : 60) });
    apply();
    v.dataset.ready = "1";
    tween(start, 1300);
    boardStore.attach({ zoomBy: (f) => zoomAt(f), reset: () => tween(home(), 800), focus });

    // drag to pan, with a little inertia
    let down: { x: number; y: number; px: number; py: number; id: number } | null = null;
    let dragging = false;
    let swallow = false;
    let vx = 0;
    let vy = 0;
    let last = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || (e.target as Element).closest("button, input, textarea, select, .tteaser")) return;
      cancelAnimationFrame(anim.current);
      down = { x: e.clientX, y: e.clientY, px: st.current.x, py: st.current.y, id: e.pointerId };
      vx = vy = 0;
      last = performance.now();
    };
    const onMove = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      const dx = e.clientX - down.x;
      const dy = e.clientY - down.y;
      if (!dragging && Math.hypot(dx, dy) > 5) {
        dragging = true;
        v.setPointerCapture(e.pointerId);
        v.dataset.drag = "1";
      }
      if (!dragging) return;
      const now = performance.now();
      const prev = st.current;
      st.current = clamp({ s: prev.s, x: down.px + dx, y: down.py + dy });
      const dt = Math.max(1, now - last);
      vx = (st.current.x - prev.x) / dt;
      vy = (st.current.y - prev.y) / dt;
      last = now;
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return;
      down = null;
      if (!dragging) return;
      dragging = false;
      swallow = true;
      delete v.dataset.drag;
      if (v.hasPointerCapture(e.pointerId)) v.releasePointerCapture(e.pointerId);
      if (reduce || performance.now() - last > 80) return;
      let t = performance.now();
      const glide = (now: number) => {
        const dt = now - t;
        t = now;
        vx *= Math.pow(0.92, dt / 16);
        vy *= Math.pow(0.92, dt / 16);
        st.current = clamp({ s: st.current.s, x: st.current.x + vx * dt, y: st.current.y + vy * dt });
        apply();
        if (Math.abs(vx) + Math.abs(vy) > 0.02) anim.current = requestAnimationFrame(glide);
      };
      anim.current = requestAnimationFrame(glide);
    };
    const onClick = (e: MouseEvent) => {
      if (!swallow) return;
      swallow = false;
      e.preventDefault();
      e.stopPropagation();
    };
    const onWheel = (e: WheelEvent) => {
      if ((e.target as Element).closest(".tteaser-deck")) return;
      e.preventDefault();
      cancelAnimationFrame(anim.current);
      const r = v.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.008), e.clientX - r.left, e.clientY - r.top, false);
      else {
        const k = e.deltaMode === 1 ? 32 : 1;
        st.current = clamp({ s: st.current.s, x: st.current.x - e.deltaX * k, y: st.current.y - e.deltaY * k });
        apply();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as Element).closest("input, textarea, .tteaser")) return;
      const step = 140;
      const { x, y, s } = st.current;
      const moves: Record<string, () => void> = {
        ArrowLeft: () => tween({ s, x: x + step, y }, 260),
        ArrowRight: () => tween({ s, x: x - step, y }, 260),
        ArrowUp: () => tween({ s, x, y: y + step }, 260),
        ArrowDown: () => tween({ s, x, y: y - step }, 260),
        "+": () => zoomAt(1.2),
        "=": () => zoomAt(1.2),
        "-": () => zoomAt(1 / 1.2),
        "0": () => tween(home(), 700),
      };
      const fn = moves[e.key];
      if (!fn) return;
      e.preventDefault();
      fn();
    };
    const onFocus = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (!t.matches(":focus-visible")) return;
      const host = t.closest<HTMLElement>("[data-id]");
      if (host?.dataset.id) focus(host.dataset.id);
    };
    const onResize = () => {
      st.current = clamp(st.current);
      apply();
    };

    v.addEventListener("pointerdown", onDown);
    v.addEventListener("pointermove", onMove);
    v.addEventListener("pointerup", onUp);
    v.addEventListener("pointercancel", onUp);
    v.addEventListener("click", onClick, true);
    v.addEventListener("wheel", onWheel, { passive: false });
    v.addEventListener("focusin", onFocus);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    // frames ease in as they enter the view
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const el = en.target as HTMLElement;
          if (en.isIntersecting) el.dataset.emIn = "1";
        }
      },
      { root: v, threshold: 0.12 }
    );
    v.querySelectorAll("[data-em-in]").forEach((el) => io.observe(el));

    return () => {
      cancelAnimationFrame(anim.current);
      boardStore.attach(null);
      io.disconnect();
      v.removeEventListener("pointerdown", onDown);
      v.removeEventListener("pointermove", onMove);
      v.removeEventListener("pointerup", onUp);
      v.removeEventListener("pointercancel", onUp);
      v.removeEventListener("click", onClick, true);
      v.removeEventListener("wheel", onWheel);
      v.removeEventListener("focusin", onFocus);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [flat, apply, clamp]);

  // flat (mobile) mode reveals on page scroll instead
  useEffect(() => {
    if (!flat) return;
    const els = document.querySelectorAll<HTMLElement>(".em-board [data-em-in]");
    const io = new IntersectionObserver((entries) => entries.forEach((en) => en.isIntersecting && ((en.target as HTMLElement).dataset.emIn = "1")), { threshold: 0.1 });
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [flat]);

  return (
    <div
      className="em-board"
      ref={vp}
      data-flat={flat ? "1" : "0"}
      data-lenis-prevent=""
      tabIndex={flat ? undefined : 0}
      role={flat ? undefined : "region"}
      aria-label={flat ? undefined : "Design board. Drag or use arrow keys to pan, plus and minus to zoom, 0 to reset. Tab through frames to open them."}
    >
      <div className="em-world" ref={world} style={{ "--ww": `${WORLD.w}px`, "--wh": `${WORLD.h}px` } as CSSProperties}>
        <span className="em-guide em-guide-h" style={{ top: HERO.y + HERO.h / 2 }} aria-hidden="true" />
        <span className="em-guide em-guide-v" style={{ left: HERO.x + HERO.w / 2 }} aria-hidden="true" />
        <span className="em-space" style={{ left: HERO.x + HERO.w / 2 - 1, top: 670, height: HERO.y - 670 }} aria-hidden="true">
          <b>{HERO.y - 670}</b>
        </span>
        <Hero />
        {boardFrames.map((f) => (
          <Frame key={f.id} f={f} />
        ))}
        <span className="em-peer" style={{ left: HERO.x + HERO.w - 120, top: HERO.y + HERO.h + 30 }} aria-hidden="true">
          <svg width="18" height="20" viewBox="0 0 18 20">
            <path d="M1 1l15 7-6.5 1.8L6.6 17z" fill="#2747e8" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          <b>Tushar</b>
        </span>
        <span className="em-comment" style={{ left: 820, top: 660 }} aria-hidden="true">
          <Pin n={1} />
          <span>Click any frame to open it</span>
        </span>
        <span className="em-comment" style={{ left: 2280, top: 1210 }} aria-hidden="true">
          <Pin n={2} />
          <span>Drag the canvas, or pick a layer</span>
        </span>
      </div>
      {!flat ? (
        <>
          <div className="em-hint em-glass" aria-hidden="true">
            <span>
              <kbd>Drag</kbd> pan
            </span>
            <span>
              <kbd>Scroll</kbd> move
            </span>
            <span>
              <kbd>⌘</kbd>+<kbd>Scroll</kbd> zoom
            </span>
            <span>
              <kbd>0</kbd> reset
            </span>
          </div>
          <div className="em-minimap em-glass" aria-hidden="true">
            <span className="em-mm-world">
              {boardFrames.map((f) => (
                <i key={f.id} style={{ left: `${(f.x / WORLD.w) * 100}%`, top: `${(f.y / WORLD.h) * 100}%`, width: `${(f.w / WORLD.w) * 100}%`, height: `${(f.h / WORLD.h) * 100}%` }} />
              ))}
              <i data-hero="" style={{ left: `${(HERO.x / WORLD.w) * 100}%`, top: `${(HERO.y / WORLD.h) * 100}%`, width: `${(HERO.w / WORLD.w) * 100}%`, height: `${(HERO.h / WORLD.h) * 100}%` }} />
              <span className="em-mm-vp" ref={mini} />
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
