"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { ThemeTeaser } from "@/components/theme-palette";
import { labItems, marqueeMetrics, notes, profile, stage, systems, type Note } from "@/lib/site";
import { wall } from "./data";
import { Arrow, Fern, GrowDialog, originOf, Unfurl, type Origin } from "./kit";
import { SpecimenCard, useSpecimenDialog } from "./wall";

type Bed = "all" | "system" | "lab";

export function Glasshouse() {
  return (
    <div className="mo-arch" aria-hidden="true">
      <svg className="mo-arch-frame" viewBox="0 0 400 520" preserveAspectRatio="xMidYMax meet">
        <defs>
          <linearGradient id="mo-pane" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#efffc4" stopOpacity="0.9" />
            <stop offset="0.45" stopColor="#c8f04b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#3f7a43" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="mo-sun" cx="0.62" cy="0.18" r="0.7">
            <stop offset="0" stopColor="#fff9d6" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="#ddf7a8" stopOpacity="0.25" />
            <stop offset="1" stopColor="#ddf7a8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="mo-arch-glass" d="M20 520V200C20 100 100 20 200 20s180 80 180 180v320z" fill="url(#mo-pane)" />
        <path d="M20 520V200C20 100 100 20 200 20s180 80 180 180v320z" fill="url(#mo-sun)" />
        <g className="mo-arch-mull">
          <path d="M20 520V200C20 100 100 20 200 20s180 80 180 180v320z" />
          <path d="M200 20v500M110 46v474M290 46v474M20 200h360M20 340h360M20 440h360" />
          <path d="M70 92c40 30 90 44 130 44s90-14 130-44" />
        </g>
      </svg>
      <span className="mo-arch-fern">
        <Fern />
      </span>
      <span className="mo-arch-fern mo-arch-fern-b">
        <Fern />
      </span>
      {[marqueeMetrics[0], marqueeMetrics[3], marqueeMetrics[4]].map((m, i) => (
        <span key={m} className="mo-hangtag" style={{ "--i": i } as CSSProperties}>
          <i />
          <b>{m}</b>
        </span>
      ))}
      <span className="mo-blossom mo-blossom-a" />
      <span className="mo-blossom mo-blossom-b" />
    </div>
  );
}

export function Home() {
  const [bed, setBed] = useState<Bed>("all");
  const dlg = useSpecimenDialog();
  const [note, setNote] = useState<{ n: Note; o: Origin } | null>(null);
  const shown = wall.filter((s) => bed === "all" || s.kind === bed);
  const beds: [Bed, string, number][] = [
    ["all", "Whole wall", wall.length],
    ["system", "Systems", systems.length],
    ["lab", "Experiments", labItems.length],
  ];
  return (
    <>
      <section className="mo-hero">
        <div className="mo-hero-copy">
          <Unfurl>
            <span className="mo-k mo-k-pill">The glasshouse of {profile.name} · {profile.location}</span>
          </Unfurl>
          <Unfurl delay={80}>
            <h1 className="mo-display">
              A living collection of <em>working systems.</em>
            </h1>
          </Unfurl>
          <Unfurl delay={160}>
            <p className="mo-lede">
              <b>{profile.tagline}</b> {profile.description} Every specimen on this wall is playable: poke it and it shows you the mechanism it was grown around.
            </p>
          </Unfurl>
          <Unfurl delay={220} className="mo-hero-cta">
            <a className="mo-btn" href="#wall">
              Walk the specimen wall <Arrow />
            </a>
            <Link className="mo-btn mo-btn-ghost" href="/systems">
              Open the field guide <Arrow />
            </Link>
          </Unfurl>
          <Unfurl delay={280}>
            <dl className="mo-census">
              <div>
                <dt>systems in the collection</dt>
                <dd>{systems.length}</dd>
              </div>
              <div>
                <dt>experiments on the bench</dt>
                <dd>{labItems.length}</dd>
              </div>
              <div>
                <dt>recordings in the seed library</dt>
                <dd>{stage.length}</dd>
              </div>
              <div>
                <dt>field journals</dt>
                <dd>{notes.length}</dd>
              </div>
            </dl>
          </Unfurl>
        </div>
        <Glasshouse />
      </section>

      <section className="mo-wall-sec" id="wall" aria-labelledby="mo-wall-h">
        <header className="mo-sec-head">
          <div>
            <span className="mo-k">Bed I · the specimen wall</span>
            <h2 id="mo-wall-h" className="mo-h2">
              Every card is a <em>live specimen.</em>
            </h2>
          </div>
          <div className="mo-beds" role="group" aria-label="Show specimens">
            {beds.map(([k, l, c]) => (
              <button key={k} type="button" className="mo-bed" aria-pressed={bed === k} onClick={() => setBed(k)}>
                {l} <span>{c}</span>
              </button>
            ))}
          </div>
        </header>
        <p className="mo-wall-hint">Play with the little mechanism on each card. Press a name to examine the whole specimen.</p>
        <div className="mo-wall" data-bed={bed}>
          {shown.map((s, i) => (
            <SpecimenCard key={s.id} s={s} n={wall.indexOf(s) + 1} i={i} onOpen={dlg.open} />
          ))}
        </div>
      </section>

      <section className="mo-shelf" aria-label="More of the glasshouse">
        <Unfurl className="mo-shelf-seeds">
          <span className="mo-k">Bed II · the seed library</span>
          <h2 className="mo-h3">
            {stage.length} recordings, <em>each one live.</em>
          </h2>
          <div className="mo-seedrow">
            {stage.slice(0, 4).map((r, i) => (
              <Link key={r.slug} href="/projects" className="mo-seedmini" style={{ "--i": i } as CSSProperties}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.poster} alt={`${r.title} screen recording`} loading="lazy" />
                <b>{r.title}</b>
              </Link>
            ))}
          </div>
          <Link className="mo-btn" href="/projects">
            Open the seed library <Arrow />
          </Link>
        </Unfurl>
        <Unfurl className="mo-shelf-notes" delay={120}>
          <span className="mo-k">Bed III · field journals</span>
          <h2 className="mo-h3">
            Notes from <em>the potting shed.</em>
          </h2>
          <ul className="mo-notechips">
            {notes.map((n, i) => (
              <li key={n.slug}>
                <button type="button" className="mo-notechip" data-i={i % 3} aria-haspopup="dialog" onClick={(e) => setNote({ n, o: originOf(e.currentTarget) })}>
                  <span>{n.date} · {n.readTime}</span>
                  <b>{n.title}</b>
                  <Arrow up />
                </button>
              </li>
            ))}
          </ul>
        </Unfurl>
      </section>

      <section className="mo-other" aria-label="Other versions of this site">
        <Unfurl>
          <span className="mo-k">Beyond the glass</span>
          <h2 className="mo-h3">
            Same plants, <em>other gardens.</em>
          </h2>
        </Unfurl>
        <ThemeTeaser className="mo-teaser" />
      </section>

      {dlg.node}
      <GrowDialog open={!!note} origin={note?.o ?? null} onClose={() => setNote(null)} label={note ? note.n.title : "Field journal"} className="mo-notedlg">
        {note && (
          <div className="mo-notesheet">
            <span className="mo-stamp">{note.n.date}</span>
            <span className="mo-k">Field journal · {note.n.category} · {note.n.readTime}</span>
            <h2>{note.n.title}</h2>
            <p>{note.n.dek}</p>
            <Link className="mo-btn" href={`/notes/${note.n.slug}`}>
              Read the journal <Arrow />
            </Link>
          </div>
        )}
      </GrowDialog>
    </>
  );
}
