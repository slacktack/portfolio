"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // phones scroll natively; a JS scroll loop only adds lag there
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.085,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      anchors: { offset: -86 },
    });

    return () => lenis.destroy();
  }, []);

  return null;
}
