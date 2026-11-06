"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export function Big({ as: Tag = "h2", lines, className }: { as?: "h1" | "h2" | "h3"; lines: ReactNode[]; className?: string }) {
  return (
    <Tag className={`cr-big ${className ?? ""}`}>
      {lines.map((l, i) => (
        <span className="cr-line" key={i} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
          <span>{l}</span>
        </span>
      ))}
    </Tag>
  );
}

export function Kick({ n, children }: { n?: string; children: ReactNode }) {
  return (
    <p className="cr-kick" data-rv="">
      {n && <b>{n}</b>}
      {children}
    </p>
  );
}

// A red-tinted frame that clears when hovered and plays only while on screen.
export function Frame({ video, poster, alt, className }: { video?: string; poster: string; alt: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = ref.current;
    const v = box?.querySelector("video");
    if (!box || !v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(box);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`cr-frame ${className ?? ""}`} ref={ref}>
      {video ? (
        <video src={video} poster={poster} muted loop playsInline preload="none" aria-label={alt} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={alt} loading="lazy" />
      )}
      <i className="cr-frame-tint" aria-hidden="true" />
    </div>
  );
}

// Highlights every number in a sentence.
export function Nums({ text }: { text: string }) {
  const parts = text.split(/(₹?[\d][\d.,]*\s?(?:[KMB%]\+?|ms|GB|TB)?\+?)/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <em key={i}>{p}</em> : p))}
    </>
  );
}

export function useReveal(path: string) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const all = el.querySelectorAll<HTMLElement>("[data-rv]");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      all.forEach((r) => (r.dataset.in = ""));
      return;
    }
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.in = "";
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
    );
    all.forEach((r) => io.observe(r));
    const fast = (e: FocusEvent) => {
      const t = (e.target as HTMLElement).closest?.<HTMLElement>("[data-rv]");
      if (t) t.dataset.in = "";
    };
    el.addEventListener("focusin", fast);
    return () => {
      io.disconnect();
      el.removeEventListener("focusin", fast);
    };
  }, [path]);
  return root;
}
