"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ThemeTeaser } from "@/components/theme-palette";
import { marqueeMetrics, profile, systems, type SystemCase } from "@/lib/site";
import { Arrow, Art, chapters, css, Duo, NextChapter, player, PlayGlyph, posterFor, usePlaying, Wide } from "./ui";

const leads = systems.slice(0, 6);
export const homeScenes = leads.length + 2;

function Opening({ on }: { on: boolean }) {
  const playing = usePlaying();
  return (
    <div className="ab-scene ab-scene-open" data-on={on ? "" : undefined} aria-hidden={!on}>
      <div className="ab-scene-copy">
        <span className="ab-kicker">A {profile.role.toLowerCase()} in {profile.location.split(",")[0]} presents</span>
        <Wide text={profile.name} as="h1" className="ab-title ab-title-xl" />
        <p className="ab-logline">{profile.tagline}</p>
        <p className="ab-sub">{profile.description}</p>
        <button type="button" className="ab-trailer" onClick={() => player.set(!playing)} tabIndex={on ? 0 : -1} data-cursor={playing ? "Pause" : "Play"}>
          <span className="ab-trailer-disc">
            <PlayGlyph on={playing} />
          </span>
          <span>{playing ? "Pause the reel" : "Play the reel"}</span>
        </button>
      </div>
      <span className="ab-scroll-cue" aria-hidden="true">
        <i />
        Scroll to roll
      </span>
    </div>
  );
}

function SystemScene({ s, i, on }: { s: SystemCase; i: number; on: boolean }) {
  const poster = posterFor(s.slug);
  const m = s.metrics[0];
  const len = s.shortTitle.length;
  return (
    <div className="ab-scene" data-on={on ? "" : undefined} data-tone={i % 2 ? "flare" : "cyan"} aria-hidden={!on}>
      <div className="ab-scene-bg">{poster ? <Duo src={poster} alt="" tone={i % 2 ? "flare" : "cyan"} /> : <Art seed={i + 3} />}</div>
      <span className="ab-ghost" aria-hidden="true">
        {String(i + 1).padStart(2, "0")}
      </span>
      <div className="ab-scene-copy">
        <span className="ab-kicker">
          <b>Scene {String(i + 1).padStart(2, "0")}</b> {s.category}
        </span>
        <Wide text={s.shortTitle} as="h2" className="ab-title" />
        <p className="ab-logline" style={css({ "--ab-len": len })}>
          {s.promise}
        </p>
      </div>
      <div className="ab-scene-foot">
        <div className="ab-metric">
          <b>{m.value}</b>
          <span>{m.label}</span>
        </div>
        <Link href={`/systems/${s.slug}`} className="ab-watch" tabIndex={on ? 0 : -1} data-cursor="Watch">
          Watch the scene <Arrow />
        </Link>
      </div>
    </div>
  );
}

function Finale({ on }: { on: boolean }) {
  return (
    <div className="ab-scene ab-scene-final" data-on={on ? "" : undefined} aria-hidden={!on}>
      <div className="ab-scene-copy">
        <span className="ab-kicker">
          <b>Intermission</b> {systems.length} systems, {chapters.length} chapters
        </span>
        <Wide text="The full feature" as="h2" className="ab-title" />
        <ul className="ab-final-grid">
          {chapters.slice(1).map((ch, k) => (
            <li key={ch.id} style={css({ "--ab-i": k })}>
              <Link href={ch.href} tabIndex={on ? 0 : -1}>
                <em>Ch {String(k + 2).padStart(2, "0")}</em>
                <b>{ch.label}</b>
                <span>{ch.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Home() {
  const seq = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(0);
  const n = homeScenes;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const el = seq.current;
      if (!el) return;
      const vh = window.innerHeight;
      const t = (window.scrollY - (el.getBoundingClientRect().top + window.scrollY)) / vh;
      const i = Math.max(0, Math.min(n - 1, Math.round(t)));
      el.style.setProperty("--ab-sp", (t - i).toFixed(3));
      setOn((p) => (p === i ? p : i));
    };
    const fire = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    fire();
    window.addEventListener("scroll", fire, { passive: true });
    window.addEventListener("resize", fire);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", fire);
      window.removeEventListener("resize", fire);
    };
  }, [n]);

  const jump = (i: number) => {
    const el = seq.current;
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + i * window.innerHeight, behavior: "instant" });
  };

  return (
    <>
      <div className="ab-seq" ref={seq} data-n={n} style={css({ "--ab-scenes": n })}>
        <div className="ab-stage">
          <Opening on={on === 0} />
          {leads.map((s, i) => (
            <SystemScene key={s.slug} s={s} i={i} on={on === i + 1} />
          ))}
          <Finale on={on === n - 1} />
          <div className="ab-cut" key={on} aria-hidden="true">
            <i />
          </div>
          <ol className="ab-dots" aria-label="Scenes">
            {Array.from({ length: n }, (_, i) => (
              <li key={i}>
                <button type="button" aria-current={on === i ? "step" : undefined} onClick={() => jump(i)} aria-label={i === 0 ? "Opening titles" : i === n - 1 ? "Intermission" : `Scene ${i}: ${leads[i - 1].shortTitle}`}>
                  <span>{i === 0 ? "Open" : i === n - 1 ? "End" : String(i).padStart(2, "0")}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <section className="ab-crawl" aria-label="Running numbers">
        <div className="ab-crawl-row">
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1}>
              {marqueeMetrics.map((m) => (
                <b key={m}>{m}</b>
              ))}
            </span>
          ))}
        </div>
      </section>

      <section className="ab-cuts" data-ab="">
        <div className="ab-cuts-head">
          <span className="ab-kicker">
            <b>Alternate cuts</b> Same footage, re-edited
          </span>
          <Wide text="Other versions" as="h2" className="ab-title ab-title-md" />
          <p>This film is one cut. The same systems and the same real numbers are also a dashboard, a game, a phone app and more. Pick a different edit.</p>
        </div>
        <ThemeTeaser className="ab-teaser" />
      </section>

      <NextChapter view="home" />
    </>
  );
}
