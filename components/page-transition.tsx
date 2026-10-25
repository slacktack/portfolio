"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const names: Record<string, string> = {
  "/": "Home",
  "/systems": "Systems",
  "/projects": "Projects",
  "/lab": "Lab",
  "/notes": "Notes",
  "/about": "About",
};

const nameFor = (path: string) => {
  const base = "/" + (path.split("/")[1] ?? "");
  return names[path] ?? names[base] ?? "Tushar Gautam";
};

const CURTAIN_IN = 380;
const CURTAIN_OUT = 620;

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [label, setLabel] = useState("");
  const busy = useRef(false);
  const startedAt = useRef(0);
  const timers = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const finish = () => {
    window.scrollTo(0, 0);
    setPhase("out");
    document.documentElement.dataset.nav = "enter";
    later(() => {
      setPhase("idle");
      busy.current = false;
      delete document.documentElement.dataset.nav;
    }, CURTAIN_OUT);
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      e.preventDefault();
      if (busy.current) return;
      busy.current = true;
      startedAt.current = performance.now();
      setLabel(nameFor(url.pathname));
      setPhase("in");
      router.push(url.pathname + url.search + url.hash);
      // never leave the curtain stuck if the route is slow
      later(() => {
        if (busy.current) finish();
      }, 4000);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (!busy.current) return;
    const wait = Math.max(0, CURTAIN_IN - (performance.now() - startedAt.current));
    later(finish, wait);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  return (
    <div className="pt" data-phase={phase} aria-hidden="true">
      <div className="pt-panel">
        <span>{label}</span>
      </div>
    </div>
  );
}
