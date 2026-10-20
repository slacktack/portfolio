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
  "/resume": "Résumé",
};

const nameFor = (path: string) => {
  const base = "/" + (path.split("/")[1] ?? "");
  return names[path] ?? names[base] ?? "Tushar Gautam";
};

export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [label, setLabel] = useState("");
  const target = useRef<string | null>(null);
  const busy = useRef(false);

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
      target.current = url.pathname + url.search + url.hash;
      setLabel(nameFor(url.pathname));
      setPhase("in");
      window.setTimeout(() => router.push(target.current as string), 520);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  useEffect(() => {
    if (!busy.current) return;
    window.scrollTo(0, 0);
    setPhase("out");
    const t = window.setTimeout(() => {
      setPhase("idle");
      busy.current = false;
    }, 700);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div className="pt" data-phase={phase} aria-hidden="true">
      <div className="pt-panel">
        <span>{label}</span>
      </div>
    </div>
  );
}
