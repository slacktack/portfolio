"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { k: "01 · Request", t: "A tap becomes a request.", d: "One search lands on the gateway. Everything after this is invisible to the person who typed it.", m: "478K+ requests a day" },
  { k: "02 · Fan-out", t: "Seventeen sources, at once.", d: "Flights, hotels, food, cabs. Each provider has its own contract, its own speed and its own idea of done.", m: "17 sources, one deadline" },
  { k: "03 · Resolve", t: "Many answers, one identity.", d: "Names disagree, ids disagree. Identity is resolved, and a wrong merge is worse than a missing one.", m: "7 records, 1 property" },
  { k: "04 · Cache", t: "Ask once, answer many.", d: "The key holds only what changes the answer. Refining a search never reaches the provider again.", m: "Refine without re-asking" },
  { k: "05 · Answer", t: "One price. Under a deadline.", d: "Early results are kept, stragglers are settled, and the best answer arrives while the user is still looking.", m: "p99 20ms" },
];

export function Journey() {
  const wrapRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);
  const [gl, setGl] = useState(true);

  useEffect(() => {
    let stopped = false;
    let dispose = () => {};

    (async () => {
      const { createJourneyScene } = await import("@/components/journey-scene");
      const host = hostRef.current;
      const wrap = wrapRef.current;
      if (!host || !wrap || stopped) return;
      const handle = createJourneyScene({
        host,
        wrap,
        chapters: chapters.length,
        onChapter: setActive,
        onProgress: setPct,
      });
      if (!handle) {
        setGl(false);
        return;
      }
      dispose = handle.dispose;
    })();

    return () => {
      stopped = true;
      dispose();
    };
  }, []);

  const goTo = (i: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const total = wrap.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (total * i) / (chapters.length - 1), behavior: "smooth" });
  };

  const c = chapters[active];

  return (
    <section className="journey" ref={wrapRef} aria-label="The life of a request">
      <div className="journey-sticky" data-chapter={active} data-gl={gl ? "on" : "off"}>
        {gl ? null : (
          <div className="journey-aurora" aria-hidden="true">
            {chapters.map((_, i) => (
              <i key={i} className={i === active ? "is-on" : undefined} />
            ))}
          </div>
        )}
        <div className="journey-stage" ref={hostRef} aria-hidden="true" />
        <div className="journey-vignette" aria-hidden="true" />
        <div className="journey-ui wrap">
          <div className="journey-top">
            <span>The life of a request</span>
            <span className="journey-pct">{String(pct).padStart(2, "0")}%</span>
          </div>
          <div className="journey-panel">
            <div className="journey-copy" key={active}>
              <span className="journey-k">{c.k}</span>
              <h2>{c.t}</h2>
              <p>{c.d}</p>
              <span className="journey-m">{c.m}</span>
            </div>
            <div className="journey-dots" role="tablist" aria-label="Chapters">
              {chapters.map((ch, i) => (
                <button
                  type="button"
                  key={ch.k}
                  role="tab"
                  aria-selected={i === active}
                  aria-label={`Chapter ${i + 1}: ${ch.t}`}
                  className={i === active ? "is-on" : i < active ? "is-done" : undefined}
                  onClick={() => goTo(i)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="journey-hint" aria-hidden="true">
          <i />
        </div>
      </div>
    </section>
  );
}
