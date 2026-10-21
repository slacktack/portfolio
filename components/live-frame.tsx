"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const DESKTOP_W = 1000;

type Props = {
  url: string;
  poster: string;
  title: string;
  portrait?: boolean;
};

export function LiveFrame({ url, poster, title, portrait }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const [key, setKey] = useState(0);
  const screen = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const host = new URL(url).host.replace(/^www\./, "");

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        else setActive(false);
      },
      { rootMargin: "200px 0px", threshold: 0.01 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = screen.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setBox({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

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
        {!active ? (
          <button type="button" className="lf-cover" data-cursor="Run" onClick={() => setActive(true)} aria-label={`Use ${title} here`}>
            <span>{loaded ? "Tap to use it here" : "Starting live app…"}</span>
          </button>
        ) : (
          <button type="button" className="lf-exit" onClick={() => setActive(false)}>
            Done
          </button>
        )}
      </div>
    </div>
  );
}
