"use client";

import { useEffect, useRef } from "react";

// dot by default, ring over links, grab over bodies, sticks to [data-mag] buttons.
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const txt = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const c = el.current;
    if (!c || !matchMedia("(pointer: fine)").matches) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let x = -80;
    let y = -80;
    let cx = x;
    let cy = y;
    let raf = 0;
    let mag: HTMLElement | null = null;
    let state = "";
    c.dataset.on = "";

    const set = (s: string, label = "") => {
      if (s !== state) {
        state = s;
        c.dataset.state = s;
      }
      if (txt.current && txt.current.textContent !== label) txt.current.textContent = label;
    };

    const unmag = () => {
      if (!mag) return;
      mag.style.removeProperty("translate");
      mag = null;
      c.style.removeProperty("width");
      c.style.removeProperty("height");
      c.style.removeProperty("border-radius");
    };

    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = e.target as Element | null;
      const inv = !!t?.closest?.("[data-inv]");
      if (inv) c.dataset.inv = "";
      else delete c.dataset.inv;
      const m = t?.closest?.<HTMLElement>("[data-mag]") ?? null;
      if (m !== mag) unmag();
      if (document.documentElement.dataset.crGrab !== undefined) set("grabbing");
      else if (m) {
        mag = m;
        const r = m.getBoundingClientRect();
        const ox = x - (r.left + r.width / 2);
        const oy = y - (r.top + r.height / 2);
        if (!still) m.style.translate = `${(ox * 0.12).toFixed(1)}px ${(oy * 0.18).toFixed(1)}px`;
        c.style.width = `${r.width + 10}px`;
        c.style.height = `${r.height + 10}px`;
        c.style.borderRadius = getComputedStyle(m).borderRadius;
        x = r.left + r.width / 2 + ox * 0.22;
        y = r.top + r.height / 2 + oy * 0.3;
        set("stick");
      } else if (t?.closest?.("[data-body]")) set("grab", "Grab");
      else if (t?.closest?.("[data-peek]")) set("peek", "Open");
      else if (t?.closest?.("input, textarea")) set("text");
      else if (t?.closest?.("a, button, [role=button], summary, label, select")) set("ring");
      else set("dot");
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      const k = still ? 1 : 0.28;
      cx += (x - cx) * k;
      cy += (y - cy) * k;
      c.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.3 ? requestAnimationFrame(tick) : 0;
    };

    const down = () => (c.dataset.down = "");
    const up = () => delete c.dataset.down;
    const out = (e: PointerEvent) => {
      if (!e.relatedTarget) c.dataset.hide = "";
    };
    const over = () => delete c.dataset.hide;
    const scroll = () => unmag();

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("pointerout", out);
    document.addEventListener("pointerover", over);
    return () => {
      unmag();
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("pointerover", over);
    };
  }, []);

  return (
    <div className="cr-cursor" ref={el} aria-hidden="true" data-state="dot">
      <span ref={txt} />
    </div>
  );
}
