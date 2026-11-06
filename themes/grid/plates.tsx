"use client";

import { useEffect, useRef } from "react";
import { projects, stage, type StageItem } from "@/lib/site";
import { Kicker, Lines, Out, d, roman } from "./ui";

function Plate({ s, n, size }: { s: StageItem; n: number; size: "full" | "half" }) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = box.current;
    const v = vid.current;
    if (!el || !v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const tall = s.slug === "wardrobe-ai";
  return (
    <figure className={`gr-plate gr-plate-${size} ${tall ? "is-tall" : ""}`} data-rv="">
      <div className="gr-plate-media gr-duo" ref={box}>
        <video ref={vid} src={s.video} poster={s.poster} muted loop playsInline preload="none" aria-label={`Screen recording: ${s.title}`} />
        <span className="gr-plate-num" aria-hidden="true">
          {roman(n)}
        </span>
        <span className="gr-plate-hint" aria-hidden="true">
          Hover for full colour
        </span>
      </div>
      <figcaption className="gr-plate-cap">
        <b>Plate {roman(n)}</b>
        <strong>{s.title}</strong>
        <span>{s.tagline}</span>
        <em>{s.tag}</em>
        <Out href={s.href}>Live</Out>
      </figcaption>
    </figure>
  );
}

export function Plates() {
  return (
    <section className="gr-plates">
      <header className="gr-sec-head">
        <Kicker n="03">Section · Plates</Kicker>
        <Lines as="h1" className="gr-display gr-display-xl" lines={["Plates"]} />
        <p className="gr-sec-lede" data-rv="">
          Screen recordings of working software, printed in Klein blue. Hover a plate to see it in full colour; every caption links to the live
          thing.
        </p>
      </header>

      <div className="gr-plate-grid">
        {stage.map((s, i) => (
          <Plate key={s.slug} s={s} n={i + 1} size={i % 3 === 0 ? "full" : "half"} />
        ))}
      </div>

      <section className="gr-cat" aria-labelledby="gr-cat-h">
        <header className="gr-cat-head">
          <Kicker n="03.b">Catalogue of works</Kicker>
          <h2 id="gr-cat-h" className="gr-display" data-rv="">
            After hours
          </h2>
        </header>
        <ol className="gr-cat-list">
          {projects.map((p, i) => (
            <li key={p.slug} data-rv="" style={d(i * 0.5)}>
              <span className="gr-cat-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="gr-cat-t">
                <strong>{p.title}</strong>
                <em>{p.tagline}</em>
              </span>
              <p className="gr-cat-d">{p.description}</p>
              <span className="gr-cat-m">
                <b>{p.highlight}</b>
                {p.category} · {p.year}
                <br />
                {p.stack.join(", ")}
              </span>
              <Out href={p.live} className="gr-cat-live">
                Visit
              </Out>
            </li>
          ))}
        </ol>
      </section>
    </section>
  );
}
