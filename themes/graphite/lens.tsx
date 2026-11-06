"use client";

import { Fragment, useEffect, useRef, type ReactNode } from "react";

// A block whose x-ray layer only shows through the lens.
export function Gx({
  children,
  xray,
  label,
  className = "",
}: {
  children: ReactNode;
  xray: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <div className={`gx ${className}`} tabIndex={0} role="group" aria-label={`${label}. Focus to x-ray`}>
      <div className="gx-surface">{children}</div>
      <div className="gx-xray">
        <span className="gx-tag">X-RAY · {label}</span>
        {xray}
      </div>
    </div>
  );
}

// Splits a headline into letters that lift under the pointer.
export function Tact({ text, as: Tag = "span", className = "" }: { text: string; as?: "span" | "h1" | "h2" | "h3"; className?: string }) {
  const words = text.split(" ");
  return (
    <Tag className={`tact ${className}`} aria-label={text}>
      {words.map((w, wi) => (
        <Fragment key={wi}>
          <span className="tact-w" aria-hidden="true">
            {[...w].map((c, ci) => (
              <span className="tact-c" key={ci}>
                {c}
              </span>
            ))}
          </span>
          {wi < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </Tag>
  );
}

const hash = (a: number, b: number, c: number) => {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

// Pointer lens: eases a circle over .gx blocks, paints pixel cells and drives the cursor ring.
export function LensLayer({ path }: { path: string }) {
  const cv = useRef<HTMLCanvasElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const read = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".t-graphite");
    const canvas = cv.current;
    const el = ring.current;
    if (!root || !canvas || !el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.dataset.still = "";
      return () => {
        delete root.dataset.still;
      };
    }
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (fine) root.dataset.fine = "";
    const ctx = canvas.getContext("2d");
    let tx = -400;
    let ty = -400;
    let x = tx;
    let y = ty;
    let r = 0;
    let tr = 0;
    let base = 150;
    let dirty = true;
    let raf = 0;
    let painted = false;
    const dpr = Math.min(2, devicePixelRatio || 1);

    const size = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      dirty = true;
    };
    size();

    const target = (t: Element | null, cx: number, cy: number) => {
      const g = t?.closest?.(".gx");
      const link = t?.closest?.("a, button, [role=button], input, textarea");
      tr = g && !link ? (fine ? base : 110) : 0;
      if (fine) el.dataset.state = link ? "link" : g ? "lens" : "idle";
      tx = cx;
      ty = cy;
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
      target(e.target as Element, e.clientX, e.clientY);
      el.dataset.on = "";
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      target(e.target as Element, e.clientX, e.clientY);
      x = tx;
      y = ty;
    };
    const leave = () => {
      tr = 0;
      delete el.dataset.on;
    };
    const key = (e: KeyboardEvent) => {
      if (!fine || (e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "]" || e.key === "=") base = Math.min(260, base + 20);
      else if (e.key === "[" || e.key === "-") base = Math.max(70, base - 20);
      else return;
      if (tr > 0) tr = base;
    };
    const scroll = () => {
      dirty = true;
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dx = tx - x;
      const dy = ty - y;
      const dr = tr - r;
      if (Math.abs(dx) + Math.abs(dy) + Math.abs(dr) > 0.05) dirty = true;
      x += dx * 0.24;
      y += dy * 0.24;
      r += dr * 0.16;
      const live = r > 1;
      if (dirty) {
        dirty = false;
        const gs = root.querySelectorAll<HTMLElement>(".gx");
        const rects = Array.from(gs, (g) => g.getBoundingClientRect());
        gs.forEach((g, i) => {
          g.style.setProperty("--lx", `${(x - rects[i].left).toFixed(1)}px`);
          g.style.setProperty("--ly", `${(y - rects[i].top).toFixed(1)}px`);
          g.style.setProperty("--lr", `${r.toFixed(1)}px`);
        });
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.setProperty("--gr-r", `${Math.max(r, 20).toFixed(1)}px`);
        if (read.current) {
          const z = live ? 1 + r / 40 : 1;
          read.current.textContent = `×${z.toFixed(1)}  X${String(Math.round(x)).padStart(4, "0")} Y${String(Math.round(y)).padStart(4, "0")}`;
        }
      }
      if (!ctx) return;
      if (!live) {
        if (painted) ctx.clearRect(0, 0, canvas.width, canvas.height);
        painted = false;
        return;
      }
      painted = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cell = 12;
      const t = Math.floor(now / 140);
      const i0 = Math.floor((x - r) / cell);
      const i1 = Math.ceil((x + r) / cell);
      const j0 = Math.floor((y - r) / cell);
      const j1 = Math.ceil((y + r) / cell);
      for (let i = i0; i <= i1; i++) {
        for (let j = j0; j <= j1; j++) {
          const cx = i * cell + cell / 2;
          const cy = j * cell + cell / 2;
          const d = Math.hypot(cx - x, cy - y);
          if (d > r) continue;
          const edge = d > r - cell * 1.4;
          const h = hash(i, j, edge ? 0 : t);
          const a = edge ? 0.5 + h * 0.4 : h > 0.86 ? 0.22 : h * 0.06;
          if (a < 0.02) continue;
          ctx.fillStyle = `rgba(232,255,58,${a.toFixed(3)})`;
          ctx.fillRect((i * cell + 1) * dpr, (j * cell + 1) * dpr, (cell - 2) * dpr, (cell - 2) * dpr);
        }
      }
    };
    raf = requestAnimationFrame(frame);

    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerdown", down, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    addEventListener("scroll", scroll, { passive: true });
    addEventListener("resize", size);
    addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerdown", down);
      document.documentElement.removeEventListener("pointerleave", leave);
      removeEventListener("scroll", scroll);
      removeEventListener("resize", size);
      removeEventListener("keydown", key);
      delete root.dataset.fine;
    };
  }, []);

  // Route change: drop the lens until the pointer moves again.
  useEffect(() => {
    const el = ring.current;
    if (el) el.dataset.state = "idle";
  }, [path]);

  return (
    <>
      <canvas ref={cv} className="gr-pix" aria-hidden="true" />
      <div ref={ring} className="gr-lens" aria-hidden="true" data-state="idle">
        <i className="gr-lens-ring" />
        <i className="gr-lens-h" />
        <i className="gr-lens-v" />
        <span ref={read} className="gr-lens-read" />
      </div>
    </>
  );
}

// Adds data-in to [data-r] blocks as they scroll into view.
export function useReveal(key: string) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    );
    const t = setTimeout(() => root.querySelectorAll("[data-r]").forEach((n) => io.observe(n)), 30);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [key]);
  return ref;
}
