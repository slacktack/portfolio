"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CopyEmail } from "@/components/copy-email";
import { openThemes } from "@/components/skin";
import { profile } from "@/lib/site";
import type { View } from "../types";

export const marks: { href: string; label: string; views: View[] }[] = [
  { href: "/", label: "Index", views: ["home"] },
  { href: "/systems", label: "Systems", views: ["systems", "system"] },
  { href: "/projects", label: "Projects", views: ["projects"] },
  { href: "/lab", label: "Lab", views: ["lab"] },
  { href: "/notes", label: "Notes", views: ["notes", "note"] },
  { href: "/about", label: "About", views: ["about"] },
];

// Right-edge measuring ruler: labels magnify under the pointer like a loupe.
export function Ruler({ view, xray, onXray }: { view: View; xray: boolean; onXray: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const [mm, setMm] = useState<number | null>(null);

  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    let raf = 0;
    const prog = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        nav.style.setProperty("--gr-p", String(max > 0 ? Math.min(1, scrollY / max) : 0));
      });
    };
    prog();
    addEventListener("scroll", prog, { passive: true });
    addEventListener("resize", prog);
    return () => {
      removeEventListener("scroll", prog);
      removeEventListener("resize", prog);
      cancelAnimationFrame(raf);
    };
  }, [view]);

  const loupe = (y: number | null) => {
    const nav = ref.current;
    if (!nav) return;
    nav.querySelectorAll<HTMLElement>("[data-tick]").forEach((n) => {
      if (y === null) return n.style.removeProperty("--gr-s");
      const r = n.getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - y);
      n.style.setProperty("--gr-s", (1 + 1.1 * Math.max(0, 1 - d / 110)).toFixed(3));
    });
  };

  return (
    <nav
      ref={ref}
      className="gr-ruler"
      aria-label="Site"
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--gr-y", `${e.clientY - r.top}px`);
        setMm(Math.round(((e.clientY - r.top) / r.height) * 297));
        loupe(e.clientY);
      }}
      onPointerLeave={() => {
        setMm(null);
        loupe(null);
      }}
      data-hover={mm !== null ? "" : undefined}
    >
      <Link href="/" className="gr-ruler-mark" aria-label={`${profile.name}, index`}>
        TG
      </Link>
      <button type="button" className="gr-xbtn" aria-pressed={xray} onClick={onXray} data-tick="">
        <span>X-ray</span>
        <b>{xray ? "on" : "off"}</b>
      </button>
      <ol className="gr-ruler-list">
        {marks.map((m, i) => {
          const on = m.views.includes(view);
          return (
            <li key={m.href}>
              <Link href={m.href} data-tick="" aria-current={on ? "page" : undefined}>
                <small>{String(i * 40 + 20).padStart(3, "0")}</small>
                <span>{m.label}</span>
              </Link>
            </li>
          );
        })}
      </ol>
      <button type="button" className="gr-themes" onClick={openThemes} data-tick="">
        <span className="gr-sw" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span>Themes</span>
      </button>
      <span className="gr-ruler-cross" aria-hidden="true">
        {mm !== null ? `${String(mm).padStart(3, "0")} mm` : ""}
      </span>
      <span className="gr-ruler-prog" aria-hidden="true" />
    </nav>
  );
}

export function Foot() {
  return (
    <footer className="gr-foot">
      <p className="gr-kick">End of the reel · contact</p>
      <a className="gr-foot-mail" href={`mailto:${profile.email}`}>
        {profile.email}
      </a>
      <div className="gr-foot-row">
        <CopyEmail email={profile.email} />
        <span>
          {profile.role} · {profile.location}
        </span>
        <button type="button" className="gr-btn" onClick={openThemes}>
          Change the whole site
        </button>
        <span>Graphite · lens build</span>
      </div>
    </footer>
  );
}
