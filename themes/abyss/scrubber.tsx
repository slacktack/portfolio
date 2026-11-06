"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { openThemes } from "@/components/skin";
import type { View } from "../types";
import { chapterOf, chapters, css, player, PlayGlyph, RUNTIME, tc, usePlaying } from "./ui";

const SW = ["#0A1117", "#16343D", "#6FE3E9", "#FF6A2B"];

function useScrubber(c: number) {
  const fill = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const mfill = useRef<HTMLDivElement>(null);
  const mtime = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const g = c < 0 ? 0 : (c + p) / chapters.length;
      const t = c < 0 ? "--:--:--" : tc(g * RUNTIME);
      if (fill.current) fill.current.style.transform = `scaleX(${g})`;
      if (head.current) head.current.style.transform = `translateX(${g * 100}%)`;
      if (mfill.current) mfill.current.style.transform = `scaleX(${g})`;
      if (time.current) time.current.textContent = t;
      if (mtime.current) mtime.current.textContent = t;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    on();
    const ro = new ResizeObserver(on);
    ro.observe(document.body);
    window.addEventListener("scroll", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", on);
    };
  }, [c]);

  return { fill, head, time, mfill, mtime };
}

function FormatSwitch({ compact }: { compact?: boolean }) {
  return (
    <button type="button" className="ab-format" onClick={openThemes} aria-haspopup="dialog" aria-label="Themes: change the whole site. Now showing Abyss" data-cursor="Switch">
      <span className="ab-format-k">Themes</span>
      <span className="ab-format-cut">
        <span className="ab-format-sw" aria-hidden="true">
          {SW.map((h) => (
            <i key={h} style={{ background: h }} />
          ))}
        </span>
        {compact ? null : <b>Abyss · 2.39:1</b>}
      </span>
      <span className="ab-format-knob" aria-hidden="true">
        <i />
      </span>
    </button>
  );
}

function PlayButton({ className }: { className?: string }) {
  const on = usePlaying();
  return (
    <button type="button" className={`ab-playbtn ${className ?? ""}`.trim()} aria-pressed={on} aria-label={on ? "Pause" : "Play"} onClick={() => player.set(!on)}>
      <svg className="ab-playbtn-ring" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22.5" />
      </svg>
      <PlayGlyph on={on} />
    </button>
  );
}

export function Scrubber({ view, scenes }: { view: View; scenes: number }) {
  const c = chapterOf(view);
  const { fill, head, time, mfill, mtime } = useScrubber(c);
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (!sheet) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [sheet]);

  return (
    <>
      <nav className="ab-scrub" aria-label="Chapters">
        <PlayButton />
        <div className="ab-tc" aria-hidden="true">
          <span ref={time}>00:00:00</span>
          <em>/ {tc(RUNTIME)}</em>
        </div>
        <div className="ab-track">
          <div className="ab-track-line">
            <div className="ab-track-fill" ref={fill} />
          </div>
          <ol className="ab-marks">
            {chapters.map((ch, i) => (
              <li key={ch.id} data-on={i === c ? "" : undefined} data-past={i < c ? "" : undefined}>
                <Link href={ch.href} aria-current={i === c ? "page" : undefined}>
                  <span className="ab-mark-k">{String(i + 1).padStart(2, "0")}</span>
                  <span className="ab-mark-l">{ch.label}</span>
                  <span className="ab-mark-tip" aria-hidden="true">
                    <i />
                    <b>Chapter {String(i + 1).padStart(2, "0")}</b>
                    <span>{ch.title}</span>
                    <em>{tc((i / chapters.length) * RUNTIME)}</em>
                  </span>
                </Link>
                {i === 0 && scenes > 1 ? (
                  <span className="ab-subticks" aria-hidden="true">
                    {Array.from({ length: scenes }, (_, k) => (
                      <i key={k} style={css({ "--ab-k": k / scenes })} />
                    ))}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
          <div className="ab-head" ref={head} aria-hidden="true">
            <i />
          </div>
        </div>
        <FormatSwitch />
      </nav>

      <nav className="ab-mscrub" aria-label="Chapters">
        <div className="ab-mline" aria-hidden="true">
          <div className="ab-mfill" ref={mfill} />
          {chapters.map((ch, i) => (
            <i key={ch.id} style={css({ "--ab-k": i / chapters.length })} data-on={i === c ? "" : undefined} />
          ))}
        </div>
        <PlayButton className="ab-playbtn-sm" />
        <div className="ab-mtc">
          <span ref={mtime}>00:00:00</span>
          <b>{c >= 0 ? chapters[c].label : "Lost reel"}</b>
        </div>
        <button type="button" className="ab-chbtn" aria-expanded={sheet} aria-controls="ab-sheet" onClick={() => setSheet(true)}>
          Chapters
        </button>
      </nav>

      {sheet ? (
        <div className="ab-sheet-veil" onClick={(e) => e.target === e.currentTarget && setSheet(false)}>
          <div className="ab-sheet" id="ab-sheet" role="dialog" aria-modal="true" aria-label="Chapters" data-lenis-prevent>
            <div className="ab-sheet-head">
              <span>Chapters</span>
              <button type="button" onClick={() => setSheet(false)}>
                Close
              </button>
            </div>
            <ol>
              {chapters.map((ch, i) => (
                <li key={ch.id} style={css({ "--ab-i": i })}>
                  <Link href={ch.href} onClick={() => setSheet(false)} aria-current={i === c ? "page" : undefined}>
                    <em>{tc((i / chapters.length) * RUNTIME)}</em>
                    <b>{ch.label}</b>
                    <span>{ch.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
            <FormatSwitch />
          </div>
        </div>
      ) : null}
    </>
  );
}

export function TopBar({ view, shot }: { view: View; shot?: string }) {
  const c = chapterOf(view);
  return (
    <header className="ab-top">
      <Link href="/" className="ab-mark" aria-label="Tushar Gautam, title sequence">
        <span className="ab-mark-dot" aria-hidden="true" />
        Tushar Gautam
      </Link>
      <span className="ab-top-ch" aria-live="polite">
        {c >= 0 ? (
          <>
            <b>Ch {String(c + 1).padStart(2, "0")}</b> {chapters[c].title}
          </>
        ) : (
          <b>Missing reel</b>
        )}
        {shot ? <em>{shot}</em> : null}
      </span>
    </header>
  );
}
