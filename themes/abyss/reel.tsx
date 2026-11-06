"use client";

import { useEffect, useRef, useState } from "react";
import { getProject, internalTools, stage } from "@/lib/site";
import { css, Out, Wide } from "./ui";

const stills: Record<string, string> = {
  "Halo design system": "/assets/video/halo.jpg",
  "Ads campaign dashboard": "/assets/video/ads-dashboard.jpg",
  "Feature-tracking dashboard": "/assets/video/feature-dashboard.jpg",
};

export function Reel() {
  const [i, setI] = useState(0);
  const [grade, setGrade] = useState(true);
  const strip = useRef<HTMLOListElement>(null);
  const v = useRef<HTMLVideoElement>(null);
  const item = stage[i];
  const p = getProject(item.slug);
  const go = (n: number) => setI((n + stage.length) % stage.length);

  useEffect(() => {
    const el = strip.current?.children[i] as HTMLElement | undefined;
    const box = strip.current;
    if (el && box) box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [i]);

  useEffect(() => {
    const vid = v.current;
    if (!vid) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) vid.play().catch(() => {});
      else vid.pause();
    });
    io.observe(vid);
    return () => io.disconnect();
  }, [i]);

  return (
    <div className="ab-reel">
      <section className="ab-screen" aria-label="Now playing">
        <div className={`ab-screen-media ${grade ? "is-graded" : ""}`} key={item.slug} data-cursor="Play">
          <video ref={v} src={item.video} poster={item.poster} muted playsInline autoPlay preload="metadata" onEnded={() => go(i + 1)} aria-label={`${item.title} screen recording`} />
          <i className="ab-duo-a" aria-hidden="true" />
          <i className="ab-duo-b" aria-hidden="true" />
        </div>
        <div className="ab-screen-shade" aria-hidden="true" />
        <div className="ab-screen-copy" key={`c-${item.slug}`}>
          <span className="ab-kicker">
            <b>Reel {String(i + 1).padStart(2, "0")} / {String(stage.length).padStart(2, "0")}</b> {item.tag}
          </span>
          <Wide text={item.title} as="h1" className="ab-title ab-title-md" />
          <p className="ab-logline">{item.tagline}</p>
          {p ? (
            <p className="ab-sub">
              {p.description}
              <span className="ab-stack">
                {p.stack.map((t) => (
                  <i key={t}>{t}</i>
                ))}
              </span>
            </p>
          ) : null}
          <div className="ab-screen-act">
            <a href={item.href} target="_blank" rel="noreferrer" className="ab-live">
              Visit live <Out />
            </a>
            <button type="button" className="ab-grade" aria-pressed={grade} onClick={() => setGrade((g) => !g)}>
              <i aria-hidden="true" />
              {grade ? "Duotone grade" : "Original colour"}
            </button>
          </div>
        </div>
        <div className="ab-screen-nav">
          <button type="button" onClick={() => go(i - 1)} aria-label="Previous recording">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Next recording">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <div className="ab-film">
          <ol className="ab-strip" ref={strip} data-lenis-prevent aria-label="Filmstrip">
            {stage.map((s, k) => (
              <li key={s.slug} style={css({ "--ab-i": k })}>
                <button type="button" aria-current={k === i ? "true" : undefined} onClick={() => setI(k)} data-cursor="Play">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.poster} alt="" loading="lazy" decoding="async" />
                  <span>
                    <em>{String(k + 1).padStart(2, "0")}</em>
                    {s.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ab-broll" aria-labelledby="ab-broll-h">
        <header data-ab="">
          <span className="ab-kicker">
            <b>B-roll</b> Internal tools, not public
          </span>
          <h2 id="ab-broll-h" className="ab-h">
            <Wide text="Behind closed doors" />
          </h2>
        </header>
        <ul>
          {internalTools.map((t, k) => (
            <li key={t.name} data-ab="" style={css({ "--ab-i": k })}>
              {stills[t.name] ? (
                <span className="ab-duo ab-duo-cyan ab-broll-img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stills[t.name]} alt={`${t.name}, still`} loading="lazy" decoding="async" />
                  <i className="ab-duo-a" aria-hidden="true" />
                  <i className="ab-duo-b" aria-hidden="true" />
                </span>
              ) : null}
              <em>{t.kind}</em>
              <b>{t.name}</b>
              <p>{t.line}</p>
              <ul>
                {t.points.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
