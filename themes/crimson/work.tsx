"use client";

import Link from "next/link";
import type { PointerEvent } from "react";
import { systems, type SystemCase } from "@/lib/site";
import { recordingFor } from "./data";
import { Big } from "./ui";

function track(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--cr-x", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--cr-y", `${e.clientY - r.top}px`);
}

function play(e: { currentTarget: HTMLElement }, on: boolean) {
  const v = e.currentTarget.querySelector("video");
  if (!v) return;
  if (on && !matchMedia("(prefers-reduced-motion: reduce)").matches) v.play().catch(() => {});
  else v.pause();
}

export function Row({ s }: { s: SystemCase }) {
  const rec = recordingFor(s.slug);
  const m = s.metrics[0];
  return (
    <li className="cr-row-li" data-rv="">
      <Link
        href={`/systems/${s.slug}`}
        className="cr-row"
        data-peek=""
        onPointerEnter={(e) => {
          track(e);
          play(e, true);
        }}
        onPointerMove={track}
        onPointerLeave={(e) => play(e, false)}
        onFocus={(e) => play(e, true)}
        onBlur={(e) => play(e, false)}
      >
        <span className="cr-row-n">{s.index}</span>
        <span className="cr-row-t">{s.title}</span>
        <span className="cr-row-meta">
          {s.category}
          <br />
          {s.year}
        </span>
        <span className="cr-row-m">
          <b>{m.value}</b>
          {m.label}
        </span>
        <span className="cr-row-reveal" aria-hidden="true">
          <span className="cr-row-n">{s.index}</span>
          <span className="cr-row-t">{s.title}</span>
          <span className="cr-row-promise">{s.promise}</span>
        </span>
        <span className="cr-row-media" aria-hidden="true">
          {rec ? (
            <video src={rec.video} poster={rec.poster} muted loop playsInline preload="none" />
          ) : (
            <span className="cr-row-poster">
              <b>{m.value}</b>
              <small>{m.label}</small>
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

export function Rows({ list }: { list: SystemCase[] }) {
  return (
    <ol className="cr-rows" role="list">
      {list.map((s) => (
        <Row key={s.slug} s={s} />
      ))}
    </ol>
  );
}

export function SystemsIndex() {
  const withRec = systems.filter((s) => recordingFor(s.slug)).length;
  return (
    <div className="cr-page cr-work">
      <header className="cr-work-head">
        <p className="cr-kick" data-rv="">
          Index · {systems.length} systems · {withRec} with screen recordings
        </p>
        <Big as="h1" lines={["Systems", "in production."]} />
        <p className="cr-lede" data-rv="">
          Comparison engines, pipelines, classifiers and the platform that watches them. Hover a row and it opens up from wherever your pointer is.
          Each one is a full case: the problem, the constraints, what broke and the receipts.
        </p>
      </header>
      <Rows list={systems} />
      <Link href="/projects" className="cr-handoff" data-rv="" data-inv="">
        <small>Next · after hours</small>
        <b>Projects →</b>
      </Link>
    </div>
  );
}
