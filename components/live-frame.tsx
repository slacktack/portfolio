"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const DESKTOP_W = 1000;

type Props = {
  url: string;
  poster: string;
  title: string;
  portrait?: boolean;
  embed?: boolean;
  tall?: string;
};

export function LiveFrame({ url, poster, title, portrait, embed = true, tall }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0);
  const screen = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [explore, setExplore] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const seen = useRef(false);
  const hovered = useRef(false);
  const host = new URL(url).host.replace(/^www\./, "");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        seen.current = e.isIntersecting;
        if (e.isIntersecting && embed) setNear(true);
        else {
          setActive(false);
          if (!e.isIntersecting) setExplore(false);
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [embed]);

  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // A slow, looping tour of the real page until the visitor takes over.
  useEffect(() => {
    const el = scroller.current;
    if (!tall || embed || !el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let dir = 1;
    let y = 0;
    let last = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 50);
      last = now;
      if (!seen.current || hovered.current || explore) {
        y = el.scrollTop;
        return;
      }
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      y += dir * dt * 0.035;
      if (y >= max || y <= 0) {
        dir *= -1;
        y = Math.min(Math.max(y, 0), max);
      }
      el.scrollTop = y;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [tall, embed, explore]);

  const scale = !portrait && box.w && box.w < DESKTOP_W ? box.w / DESKTOP_W : 1;
  const frameStyle =
    scale < 1
      ? { width: DESKTOP_W, height: box.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }
      : undefined;

  return (
    <div className={`lf ${portrait ? "lf-portrait" : ""}`} ref={wrapRef}>
      <div className="lf-bar">
        <span className="lf-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="lf-url">{host}</span>
        <button type="button" className="lf-btn" onClick={() => { setLoaded(false); setKey((k) => k + 1); }} aria-label="Reload">
          ↻
        </button>
        <a className="lf-btn" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title} in a new tab`}>
          ↗
        </a>
      </div>
      {!embed && tall ? (
        <div
          className={`lf-screen lf-tall ${explore ? "is-active" : ""}`}
          ref={screen}
          onPointerEnter={() => {
            hovered.current = true;
          }}
          onPointerLeave={() => {
            hovered.current = false;
          }}
        >
          <div className="lf-scroll" ref={scroller}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tall} alt={`${title}, scrolling through the live page`} loading="lazy" draggable={false} />
          </div>
          <a className="lf-link" data-cursor="Open" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title} live`}>
            <span>Open the live app</span>
          </a>
          {explore ? (
            <button type="button" className="lf-exit lf-exit-left" onClick={() => setExplore(false)}>
              Done
            </button>
          ) : (
            <button type="button" className="lf-explore" data-cursor="Scroll" onClick={() => setExplore(true)} aria-label={`Scroll through ${title}`}>
              <span>Tap to scroll through it</span>
            </button>
          )}
        </div>
      ) : (
      <div className={`lf-screen ${active ? "is-active" : ""}`} ref={screen}>
        <Image className="lf-poster" src={poster} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" style={{ opacity: loaded ? 0 : 1 }} />
        {near ? (
          <iframe
            key={key}
            className="lf-frame"
            style={frameStyle}
            src={url}
            title={`${title}, running live`}
            loading="lazy"
            allow="geolocation; clipboard-write; fullscreen"
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
          />
        ) : null}
        {!embed ? (
          <a className="lf-link" data-cursor="Open" href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title} live`}>
            <span>Open the live app</span>
          </a>
        ) : !active ? (
          <button type="button" className="lf-cover" data-cursor="Run" onClick={() => setActive(true)} aria-label={`Use ${title} here`}>
            <span>{loaded ? "Tap to use it here" : "Starting live app…"}</span>
          </button>
        ) : (
          <button type="button" className="lf-exit" onClick={() => setActive(false)}>
            Done
          </button>
        )}
      </div>
      )}
    </div>
  );
}
