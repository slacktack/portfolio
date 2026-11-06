"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getProject, stage, type StageItem } from "@/lib/site";
import { Arrow, AutoVideo, Browser, Head, Phone, host, pad } from "./ui";

const portrait = (s: StageItem) => !!getProject(s.slug)?.portrait;

function Device({ s, big = false }: { s: StageItem; big?: boolean }) {
  const video = big ? (
    <video key={s.slug} src={s.video} poster={s.poster} muted loop playsInline autoPlay aria-label={`${s.title} screen recording`} />
  ) : (
    <AutoVideo src={s.video} poster={s.poster} label={`${s.title} screen recording`} />
  );
  return portrait(s) ? <Phone>{video}</Phone> : <Browser url={host(s.href)}>{video}</Browser>;
}

function Lightbox({ i, onClose, onStep }: { i: number; onClose: () => void; onStep: (d: number) => void }) {
  const s = stage[i];
  const p = getProject(s.slug);
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("sm-locked");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("sm-locked");
      prev?.focus();
    };
  }, [onClose, onStep]);

  return (
    <div className="sm-lb" role="dialog" aria-modal="true" aria-label={s.title} data-lenis-prevent="" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sm-lb-inner">
        <div className={`sm-lb-stage ${portrait(s) ? "is-phone" : ""}`} key={s.slug}>
          <Device s={s} big />
          {p?.tall ? (
            <Phone className="sm-lb-tall">
              <div className="sm-tall" style={{ backgroundImage: `url(${p.tall})` }} role="img" aria-label={`${s.title}, full-length screen`} />
            </Phone>
          ) : null}
        </div>
        <aside className="sm-lb-info" key={`i-${s.slug}`}>
          <div className="sm-lb-top">
            <span className="sm-eyebrow">
              <b>{pad(i + 1)}</b>
              {s.tag}
              {p ? ` · ${p.category}` : ""}
            </span>
            <button type="button" ref={close} className="sm-close" onClick={onClose}>
              Close
            </button>
          </div>
          <h2 className="sm-h2">{s.title}</h2>
          <p className="sm-lb-tag">{s.tagline}</p>
          {p ? <p className="sm-body">{p.description}</p> : null}
          {p ? (
            <dl className="sm-spec sm-spec-light">
              <div>
                <dt>Highlight</dt>
                <dd>{p.highlight}</dd>
              </div>
              <div>
                <dt>Year</dt>
                <dd>{p.year}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{p.stack.join(" · ")}</dd>
              </div>
            </dl>
          ) : null}
          {p ? <p className="sm-lb-note">{p.note}</p> : null}
          <div className="sm-lb-actions">
            <a className="sm-btn" href={s.href} target="_blank" rel="noreferrer" data-cursor="Visit">
              Visit live
              <Arrow />
            </a>
            <span className="sm-lb-step">
              <button type="button" onClick={() => onStep(-1)} aria-label="Previous">
                ←
              </button>
              <span>
                {pad(i + 1)} / {pad(stage.length)}
              </span>
              <button type="button" onClick={() => onStep(1)} aria-label="Next">
                →
              </button>
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const onClose = useCallback(() => setOpen(null), []);
  const onStep = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + stage.length) % stage.length)), []);
  const groups = [...new Set(stage.map((s) => s.tag))];

  return (
    <>
      <Head
        n="03"
        label="Gallery"
        title={
          <>
            The gallery wall. <em>Recorded from the real thing.</em>
          </>
        }
        lede={`${stage.length} real screen recordings, shipped at work and after hours. Open any device for the details and a live link.`}
      />
      {groups.map((g) => (
        <section className="sm-wall-sec" key={g} aria-label={g}>
          <div className="sm-wall-h" data-rise="">
            <span className="sm-eyebrow">
              <b>{pad(stage.filter((s) => s.tag === g).length)}</b>
              {g}
            </span>
            <span className="sm-rule" />
          </div>
          <div className="sm-wall">
            {stage.map((s, i) =>
              s.tag === g ? (
                <figure key={s.slug} className={`sm-tile ${portrait(s) ? "is-phone" : ""}`} data-rise="" style={{ "--i": i % 3 } as CSSProperties}>
                  <button type="button" className="sm-tile-hit" data-cursor="View" onClick={() => setOpen(i)} aria-label={`View ${s.title}`}>
                    <Device s={s} />
                  </button>
                  <figcaption>
                    <div>
                      <b>{s.title}</b>
                      <span>{s.tagline}</span>
                    </div>
                    <a href={s.href} target="_blank" rel="noreferrer" className="sm-link">
                      Visit live
                      <Arrow />
                    </a>
                  </figcaption>
                </figure>
              ) : null
            )}
          </div>
        </section>
      ))}
      {open !== null ? <Lightbox i={open} onClose={onClose} onStep={onStep} /> : null}
    </>
  );
}
