"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Cards stack as they pin; each one shrinks back as the next slides over it.
export function SystemsStack({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = Array.from(el.children) as HTMLElement[];
    let raf = 0;
    const tops = new Map<HTMLElement, number>();
    const measure = () => cards.forEach((c) => tops.set(c, parseFloat(getComputedStyle(c).top) || 0));
    measure();
    const update = () => {
      raf = 0;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) {
          card.style.setProperty("--p", "0");
          return;
        }
        const top = tops.get(card) ?? 0;
        const gap = next.getBoundingClientRect().top - top;
        const p = Math.min(Math.max(1 - gap / Math.max(card.offsetHeight * 0.9, 1), 0), 1);
        card.style.setProperty("--p", p.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => {
      measure();
      onScroll();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="systems-list" ref={root}>
      {children}
    </div>
  );
}
