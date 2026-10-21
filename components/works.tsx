"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import type { StageItem } from "@/lib/site";

const inner: Record<string, string> = {
  "bh-flights": "/systems/flights",
  "bh-hotels": "/systems/hotels",
  "bh-food": "/systems/food",
};

const tilePalette = ["#2447e0", "#e8491d", "#f4c542", "#1f5a43", "#b9a7f7", "#f6a8bd", "#8fd0f2"];
const TILES = 40;

function Work({ item, index }: { item: StageItem; index: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const media = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = media.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.in = "";
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        el.dataset.in = "";
        io.disconnect();
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const play = () => {
    const v = video.current;
    if (!v) return;
    if (!v.src) v.src = item.video;
    v.play().catch(() => {});
  };
  const stop = () => {
    const v = video.current;
    if (!v) return;
    v.pause();
  };
  const caseHref = inner[item.slug] ?? `/projects#${item.slug}`;

  return (
    <article className="work" onPointerEnter={play} onPointerLeave={stop} onFocus={play} onBlur={stop}>
      <a ref={media} className="work-media" data-cursor="View" style={{ "--tile": tilePalette[index % tilePalette.length] } as CSSProperties} href={item.href} target="_blank" rel="noreferrer" aria-label={`Open ${item.title} live`}>
        <span className="work-tiles" aria-hidden="true">
          {Array.from({ length: TILES }, (_, i) => (
            <i key={i} style={{ "--d": `${((i * 17 + index * 7) % TILES) * 34}ms` } as CSSProperties} />
          ))}
        </span>
        <i className="crop crop-tl" />
        <i className="crop crop-br" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.poster} alt={`${item.title} running live`} loading="lazy" />
        <video ref={video} muted loop playsInline preload="none" poster={item.poster} />
        <span className="work-live">
          <b /> Live
        </span>
      </a>
      <div className="work-meta">
        <h3>{item.title}</h3>
        <div className="work-pills">
          <a href={item.href} target="_blank" rel="noreferrer">
            View
          </a>
          {inner[item.slug] ? <Link href={caseHref}>Case</Link> : null}
        </div>
      </div>
      <p className="work-cat">
        {item.tag} <span>/ {String(index + 1).padStart(2, "0")}</span>
      </p>
      <p className="work-desc">{item.tagline}</p>
    </article>
  );
}

export function Works({ items }: { items: StageItem[] }) {
  return (
    <div className="works">
      <div className="works-head">
        <span className="works-k">Selected work</span>
        <h2>
          Works<sup>{items.length}</sup>
        </h2>
      </div>
      <div className="works-grid">
        {items.map((item, i) => (
          <Work item={item} index={i} key={item.slug} />
        ))}
      </div>
    </div>
  );
}
