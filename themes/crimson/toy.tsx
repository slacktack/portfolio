"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { World } from "./physics";

export type ToyItem = {
  id: string;
  value: string;
  label?: string;
  href?: string;
  external?: boolean;
  action?: () => void;
  tone?: number;
  aria?: string;
};

type Inst = { key: string; item: ToyItem };
type Glyph = { ch: string; w: number; h: number; ox: number; oy: number; x: number; y: number; f: number; r: number };

type Props = {
  rows: string[];
  items: ToyItem[];
  auto?: number;
  controls?: boolean;
  keys?: boolean;
  label: string;
  className?: string;
  fill?: number;
  every?: number;
  onPeek?: (item: ToyItem | null) => void;
  children?: ReactNode;
};

const MAX = 22;

function reduced() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Toy({ rows, items, auto = 0, controls, keys, label, className, fill = 0.62, every = 380, onPeek, children }: Props) {
  const stage = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const els = useRef(new Map<string, HTMLElement>());
  const world = useRef(new World());
  const raf = useRef(0);
  const seen = useRef(true);
  const drag = useRef<{ id: string; pid: number; sx: number; sy: number; moved: number } | null>(null);
  const dragged = useRef(new Set<string>());
  const next = useRef(0);
  const actions = useRef(new Map<string, () => void>());
  const [motion, setMotion] = useState<boolean | null>(null);
  const [glyphs, setGlyphs] = useState<Glyph[]>([]);
  const [live, setLive] = useState<Inst[]>([]);
  const [said, setSaid] = useState("");
  const [grabbing, setGrabbing] = useState(false);
  const dropped = live.length > 0 || grabbing;

  const paint = useCallback(() => {
    const w = world.current;
    for (const b of w.bodies) {
      const el = els.current.get(b.id);
      if (!el) continue;
      const { cx, cy, ang } = w.pose(b);
      el.style.transform = `translate3d(${(cx - b.w / 2).toFixed(2)}px, ${(cy - b.h / 2).toFixed(2)}px, 0) rotate(${ang.toFixed(4)}rad)`;
    }
  }, []);

  const wake = useCallback(() => {
    if (raf.current) return;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      const w = world.current;
      acc = Math.min(acc + (now - last), 50);
      last = now;
      while (acc >= 16.6) {
        w.step();
        acc -= 16.6;
      }
      paint();
      if (seen.current && !document.hidden && w.awake()) raf.current = requestAnimationFrame(tick);
      else raf.current = 0;
    };
    raf.current = requestAnimationFrame(tick);
  }, [paint]);

  // Work out glyph boxes from real font metrics, then fit the rows to the stage.
  const layout = useCallback(() => {
    const st = stage.current;
    const pr = probe.current;
    if (!st || !pr) return [];
    const W = st.clientWidth;
    const H = st.clientHeight;
    const ctx = document.createElement("canvas").getContext("2d");
    if (!ctx) return [];
    const fam = getComputedStyle(pr).fontFamily;
    ctx.font = `400 100px ${fam}`;
    const cap = ctx.measureText("H");
    const capH = cap.actualBoundingBoxAscent;
    const asc = cap.fontBoundingBoxAscent;
    const desc = cap.fontBoundingBoxDescent;
    const gap = 3;
    const meas = rows.map((r) =>
      [...r].map((ch) => {
        const m = ctx.measureText(ch);
        return { ch, w: m.actualBoundingBoxLeft + m.actualBoundingBoxRight, l: m.actualBoundingBoxLeft };
      }),
    );
    const widest = Math.max(1, ...meas.map((r) => r.reduce((s, g) => s + g.w, 0)));
    const most = Math.max(1, ...meas.map((r) => r.length));
    const padX = Math.max(16, W * 0.035);
    const byW = ((W * (W > 760 ? 0.9 : 1) - padX * 2 - gap * (most - 1)) / widest) * 100;
    const byH = ((H * fill) / (rows.length * capH * 1.04)) * 100;
    const F = Math.min(byW, byH);
    const k = F / 100;
    const h = capH * k;
    const lineTop = (F - (asc + desc) * k) / 2 + asc * k;
    const out: Glyph[] = [];
    meas.forEach((r, ri) => {
      let x = padX;
      const y = H - (rows.length - ri) * (h + gap * 2) + h / 2;
      for (const g of r) {
        const w = g.w * k;
        out.push({ ch: g.ch, w, h, ox: g.l * k, oy: h - lineTop, x: x + w / 2, y, f: F, r: ri });
        x += w + gap;
      }
    });
    return out;
  }, [rows, fill]);

  const place = useCallback(
    (gs: Glyph[], dropIn: boolean) => {
      const w = world.current;
      w.bodies = w.bodies.filter((b) => !b.id.startsWith("l"));
      gs.forEach((g, i) => {
        const lift = dropIn ? w.H * 0.9 + (gs.length ? (gs[gs.length - 1].r - g.r) * w.H * 0.45 : 0) + i * 22 + (i % 3) * 14 : 0;
        w.add(`l${i}`, g.x, g.y - lift, g.w, g.h, 0, 0, 0, 0.6);
      });
      w.quiet = 0;
    },
    [],
  );

  useEffect(() => {
    const st = stage.current;
    if (!st) return;
    let alive = true;
    const go = async () => {
      if (reduced()) {
        setMotion(false);
        return;
      }
      try {
        await document.fonts.ready;
      } catch {
        // fonts api blocked
      }
      const pr = probe.current;
      if (pr) {
        try {
          await document.fonts.load(`400 100px ${getComputedStyle(pr).fontFamily}`, "TUSHARGM");
        } catch {
          // font api blocked
        }
      }
      if (!alive) return;
      const w = world.current;
      w.W = st.clientWidth;
      w.H = st.clientHeight;
      const gs = layout();
      setGlyphs(gs);
      setMotion(true);
      place(gs, true);
      wake();
    };
    go();
    return () => {
      alive = false;
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [layout, place, wake]);

  useEffect(() => {
    if (!motion) return;
    const st = stage.current;
    if (!st) return;
    let lastW = st.clientWidth;
    const ro = new ResizeObserver(() => {
      const w = world.current;
      w.W = st.clientWidth;
      w.H = st.clientHeight;
      if (Math.abs(st.clientWidth - lastW) > 40) {
        lastW = st.clientWidth;
        const gs = layout();
        setGlyphs(gs);
        place(gs, false);
      }
      w.quiet = 0;
      wake();
    });
    ro.observe(st);
    const io = new IntersectionObserver(([e]) => {
      seen.current = e.isIntersecting;
      if (e.isIntersecting) wake();
    });
    io.observe(st);
    const vis = () => !document.hidden && wake();
    document.addEventListener("visibilitychange", vis);
    return () => {
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
    };
  }, [motion, layout, place, wake]);

  // Register a body for every dropped item once its element exists.
  useLayoutEffect(() => {
    if (!motion) return;
    const w = world.current;
    let added = false;
    live.forEach((inst, i) => {
      if (w.get(inst.key)) return;
      const el = els.current.get(inst.key);
      if (!el) return;
      const bw = el.offsetWidth;
      const bh = el.offsetHeight;
      const x = w.W * (0.18 + ((i * 0.37 + 0.11) % 0.64));
      w.add(inst.key, x, -bh - 30 - (i % 4) * 40, bw, bh, (((i * 7) % 5) - 2) * 0.12, ((i % 3) - 1) * 2, 0, 1);
      added = true;
    });
    const keys = new Set(live.map((l) => l.key));
    for (const b of [...w.bodies]) if (!b.id.startsWith("l") && !keys.has(b.id)) w.remove(b.id);
    if (added) {
      paint();
      wake();
    }
  }, [live, motion, paint, wake]);

  const drop = useCallback(() => {
    if (!items.length) return;
    const item = items[next.current % items.length];
    next.current += 1;
    const key = `d${next.current}-${item.id}`;
    if (item.action) actions.current.set(key, item.action);
    setLive((l) => [...l, { key, item }].slice(-MAX));
    setSaid(`Dropped ${item.value}${item.label ? ` ${item.label}` : ""}`);
  }, [items]);

  const reset = useCallback(() => {
    setLive([]);
    next.current = 0;
    if (motion) {
      place(glyphs, true);
      wake();
    }
    setSaid("Scene reset");
  }, [motion, glyphs, place, wake]);

  useEffect(() => {
    if (!auto) return;
    let n = 0;
    const t = window.setInterval(() => {
      if (n >= auto) return window.clearInterval(t);
      n += 1;
      drop();
    }, every);
    return () => window.clearInterval(t);
  }, [auto, every, drop]);

  useEffect(() => {
    if (!keys) return;
    const on = (e: globalThis.KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, [contenteditable]")) return;
      if (!seen.current) return;
      if (e.key === "r" || e.key === "R") reset();
      else if (e.key === "+" || e.key === "=") drop();
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [keys, reset, drop]);

  const local = (e: PointerEvent) => {
    const r = stage.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const bid = (e: { currentTarget: HTMLElement }) => e.currentTarget.dataset.bid ?? "";
  const down = (e: PointerEvent<HTMLElement>) => {
    const id = bid(e);
    if (e.button !== 0 || !motion) return;
    const b = world.current.get(id);
    if (!b) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    world.current.startGrab(b, p.x, p.y);
    drag.current = { id, pid: e.pointerId, sx: e.clientX, sy: e.clientY, moved: 0 };
    e.currentTarget.dataset.grab = "";
    document.documentElement.setAttribute("data-cr-grab", "");
    setGrabbing(true);
    wake();
  };
  const move = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const g = world.current.grab;
    if (!d || d.pid !== e.pointerId || !g) return;
    const p = local(e);
    g.tx = p.x;
    g.ty = p.y;
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.sx, e.clientY - d.sy));
    world.current.quiet = 0;
    wake();
  };
  const up = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pid !== e.pointerId) return;
    if (d.moved > 6) dragged.current.add(d.id);
    drag.current = null;
    world.current.grab = null;
    delete e.currentTarget.dataset.grab;
    document.documentElement.removeAttribute("data-cr-grab");
    wake();
  };
  const click = (e: React.MouseEvent<HTMLElement>) => {
    const id = bid(e);
    const fn = id.startsWith("l") ? () => hop(id) : actions.current.get(id);
    if (dragged.current.has(id)) {
      dragged.current.delete(id);
      e.preventDefault();
      return;
    }
    if (fn) {
      e.preventDefault();
      fn();
    }
  };
  const nudge = (e: KeyboardEvent<HTMLElement>) => {
    const id = bid(e);
    const b = world.current.get(id);
    if (!b) return;
    const m: Record<string, [number, number, number]> = {
      ArrowLeft: [-7, -3, -0.02],
      ArrowRight: [7, -3, 0.02],
      ArrowUp: [0, -14, 0],
      ArrowDown: [0, 8, 0],
    };
    const v = m[e.key] ?? (id.startsWith("l") && e.key === " " ? [0, -16, 0.03] : null);
    if (!v) return;
    e.preventDefault();
    world.current.push(b, v[0], v[1], v[2]);
    wake();
  };
  const hop = (id: string) => {
    const b = world.current.get(id);
    if (b) {
      world.current.push(b, 0, -12, 0.02);
      wake();
    }
  };
  const reg = (el: HTMLElement | null) => {
    if (!el) return;
    const id = el.dataset.bid ?? "";
    els.current.set(id, el);
    return () => {
      els.current.delete(id);
    };
  };

  const itemEl = (inst: Inst, phys: boolean) => {
    const { item } = inst;
    const cls = `cr-chip cr-tone-${item.tone ?? 0}`;
    const inner = (
      <>
        <b>{item.value}</b>
        {item.label && <small>{item.label}</small>}
      </>
    );
    const common = {
      className: cls,
      ref: reg,
      "data-bid": inst.key,
      "aria-label": item.aria,
      "data-body": phys ? "" : undefined,
      draggable: false,
      onPointerDown: phys ? down : undefined,
      onPointerMove: phys ? move : undefined,
      onPointerUp: phys ? up : undefined,
      onPointerCancel: phys ? up : undefined,
      onKeyDown: phys ? nudge : undefined,
      onFocus: () => onPeek?.(item),
      onMouseEnter: () => onPeek?.(item),
      onClick: click,
    };
    if (item.action) return <button key={inst.key} type="button" {...common}>{inner}</button>;
    if (item.external || !item.href) return <a key={inst.key} href={item.href} {...common}>{inner}</a>;
    return <Link key={inst.key} href={item.href} {...common}>{inner}</Link>;
  };

  const n = glyphs.length;
  return (
    <div className={`cr-toy ${className ?? ""}`} data-motion={motion === null ? "pending" : motion ? "on" : "off"} data-dropped={dropped ? "" : undefined}>
      <div className="cr-toy-stage" ref={stage}>
        <span className="cr-probe" ref={probe} aria-hidden="true">
          H
        </span>
        {motion ? (
          <div className="cr-toy-bodies" role="group" aria-label={label}>
            {glyphs.map((g, i) => (
              <button
                key={`l${i}`}
                type="button"
                className="cr-l"
                data-body=""
                ref={reg}
                data-bid={`l${i}`}
                aria-label={`Letter ${g.ch}, ${i + 1} of ${n}. Arrow keys nudge it, Space tosses it.`}
                style={{ width: g.w, height: g.h, fontSize: g.f } as CSSProperties}
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onKeyDown={nudge}
                onClick={click}
              >
                <svg width={g.w} height={g.h} aria-hidden="true">
                  <text x={g.ox} y={g.h} fontSize={g.f}>
                    {g.ch}
                  </text>
                </svg>
              </button>
            ))}
            {live.map((inst) => itemEl(inst, true))}
          </div>
        ) : (
          <div className="cr-toy-static">
            <p className="cr-static-word" aria-label={rows.join(" ")}>
              {rows.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </p>
            {live.length > 0 && <div className="cr-static-chips">{live.map((inst) => itemEl(inst, false))}</div>}
          </div>
        )}
        {children}
      </div>
      {controls && (
        <div className="cr-toy-controls">
          <button type="button" className="cr-ctl cr-ctl-add" data-mag="" onClick={drop} aria-keyshortcuts="+">
            <span aria-hidden="true">+</span> Drop a number
          </button>
          <button type="button" className="cr-ctl" data-mag="" onClick={reset} aria-keyshortcuts="R">
            Reset <kbd>R</kbd>
          </button>
        </div>
      )}
      <p className="cr-sr" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
