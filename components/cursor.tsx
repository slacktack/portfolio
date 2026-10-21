"use client";

import { useEffect, useRef } from "react";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const root = document.documentElement;
    root.classList.add("has-cursor");
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    let state = "";
    let text = "";

    let magnet: HTMLElement | null = null;
    const pull = (e: PointerEvent) => {
      const b = (e.target as Element | null)?.closest?.<HTMLElement>(".btn");
      if (magnet && magnet !== b) {
        magnet.style.removeProperty("--mx");
        magnet.style.removeProperty("--my");
      }
      magnet = b ?? null;
      if (!b) return;
      const r = b.getBoundingClientRect();
      b.style.setProperty("--mx", `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
      b.style.setProperty("--my", `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
    };

    const move = (e: PointerEvent) => {
      pull(e);
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as Element | null)?.closest?.("[data-cursor], a, button, [role=button], input, textarea, select, summary");
      let next = "";
      let nextText = "";
      if (t) {
        const c = (t as HTMLElement).dataset?.cursor;
        if (c) {
          next = "label";
          nextText = c;
        } else if ((t as HTMLElement).matches("input, textarea")) next = "text";
        else next = "link";
      }
      if (next !== state || nextText !== text) {
        state = next;
        text = nextText;
        ring.current?.setAttribute("data-state", state);
        if (label.current) label.current.textContent = text;
      }
    };
    const down = () => ring.current?.setAttribute("data-down", "");
    const up = () => ring.current?.removeAttribute("data-down");
    const leave = () => {
      x = -100;
      y = -100;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    };
    tick();

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);
    return () => {
      root.classList.remove("has-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <>
      <div className="cur-ring" ref={ring} aria-hidden="true">
        <span ref={label} />
      </div>
      <div className="cur-dot" ref={dot} aria-hidden="true" />
    </>
  );
}
