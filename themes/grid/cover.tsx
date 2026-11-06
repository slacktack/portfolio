"use client";

import Link from "next/link";
import { ThemeTeaser } from "@/components/theme-palette";
import { currently, labItems, marqueeMetrics, notes, profile, stage, systems, timeline } from "@/lib/site";
import { ISSUE, Lines, MAST, Slab, d, notePage, pad, sections, sysPage } from "./ui";

const split = (m: string) => {
  const i = m.indexOf(" ");
  const a = m.slice(0, i);
  const b = m.slice(i + 1);
  return /^\d/.test(a) ? [a, b] : [b, a];
};

export function Cover() {
  const lead = systems.slice(0, 3);
  return (
    <>
      <section className="gr-cover">
        <header className="gr-cover-top g4">
          <Lines as="h1" className="gr-mast" lines={[MAST]} />
          <p data-rv="" style={d(1)}>
            A journal of backend systems
            <br />
            by {profile.name}
          </p>
          <p data-rv="" style={d(2)}>
            {profile.role}
            <br />
            {profile.location}
          </p>
          <p className="gr-cover-no" data-rv="" style={d(3)}>
            Issue {ISSUE}
            <br />
            <span>{profile.availability}</span>
          </p>
        </header>

        <div className="gr-cover-mid">
          <Lines className="gr-numeral" lines={[ISSUE]} />
          <Slab />
          <p className="gr-cover-tag gr-lines" data-rv="">
            <span className="gr-line">
              <span style={d(2)}>I build the</span>
            </span>
            <span className="gr-line">
              <span style={d(3)}>
                <mark>invisible layer.</mark>
              </span>
            </span>
          </p>
        </div>

        <div className="gr-cover-cols g4">
          <div data-rv="">
            <h2 className="gr-h">About</h2>
            <p>{profile.description}</p>
            <Link className="gr-link" href="/about">
              Colophon, p.{sections[5].p}
            </Link>
          </div>
          <div data-rv="" style={d(1)}>
            <h2 className="gr-h">Systems</h2>
            <ol className="gr-rows">
              {systems.slice(0, 7).map((s) => (
                <li key={s.slug}>
                  <Link href={`/systems/${s.slug}`}>
                    <b>{s.index}</b>
                    <span>{s.shortTitle}</span>
                    <em>{pad(sysPage(s.slug))}</em>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/systems">
                  <b>+{systems.length - 7}</b>
                  <span>Full contents</span>
                  <em>04</em>
                </Link>
              </li>
            </ol>
          </div>
          <div data-rv="" style={d(2)}>
            <h2 className="gr-h">Contributors</h2>
            <ol className="gr-rows gr-rows-plain">
              {timeline.map((t) => (
                <li key={t.title}>
                  <b>{t.year}</b>
                  <span>{t.title}</span>
                </li>
              ))}
            </ol>
            <h2 className="gr-h gr-h-gap">Essays</h2>
            <ol className="gr-rows">
              {notes.map((n, i) => (
                <li key={n.slug}>
                  <Link href={`/notes/${n.slug}`}>
                    <b>E{i + 1}</b>
                    <span>{n.title}</span>
                    <em>{pad(notePage(n.slug))}</em>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div data-rv="" style={d(3)}>
            <h2 className="gr-h">Currently</h2>
            <dl className="gr-dl">
              {currently.map((c) => (
                <div key={c.label}>
                  <dt>{c.label}</dt>
                  <dd>{c.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="gr-spread gr-blue gr-figures" aria-labelledby="gr-figs">
        <div className="gr-spread-head">
          <p className="gr-kick">
            <b>02</b>
            <span>In this issue, by the numbers</span>
          </p>
          <Lines as="h2" className="gr-display" lines={["Every figure", "is a receipt."]} />
        </div>
        <ul className="gr-figs" id="gr-figs">
          {marqueeMetrics.slice(0, 8).map((m, i) => {
            const [v, l] = split(m);
            return (
              <li key={m} data-rv="" style={d(i)}>
                <b>{v}</b>
                <span>{l}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="gr-also">
        <p className="gr-kick" data-rv="">
          <b>03</b>
          <span>Features in this issue</span>
        </p>
        <div className="gr-also-grid">
          {lead.map((s, i) => (
            <Link key={s.slug} href={`/systems/${s.slug}`} className="gr-feature" data-rv="" style={d(i)}>
              <span className="gr-feature-n">{s.index}</span>
              <span className="gr-feature-k">{s.category}</span>
              <b>{s.title}</b>
              <span className="gr-feature-p">{s.promise}</span>
              <em>p.&nbsp;{pad(sysPage(s.slug))} →</em>
            </Link>
          ))}
          <Link href="/projects" className="gr-feature gr-feature-plate" data-rv="" style={d(3)}>
            <span className="gr-duo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={stage[0].poster} alt="" loading="lazy" />
            </span>
            <span className="gr-feature-k">Plate I — {stage[0].title}</span>
            <b>{stage.length} plates of working software</b>
            <em>p.&nbsp;{sections[2].p} →</em>
          </Link>
          <Link href="/lab" className="gr-feature gr-feature-lab" data-rv="" style={d(4)}>
            <span className="gr-feature-k">Laboratory</span>
            <b>{labItems.length} experiments you can break</b>
            <span className="gr-feature-p">{labItems.slice(0, 4).map((l) => l.title).join(" · ")}</span>
            <em>p.&nbsp;{sections[3].p} →</em>
          </Link>
        </div>
      </section>

      <section className="gr-spread gr-paper gr-other">
        <div className="gr-other-head">
          <p className="gr-kick">
            <b>∞</b>
            <span>Other editions of this issue</span>
          </p>
          <Lines as="h2" className="gr-display" lines={["Same contents.", "Different press."]} />
        </div>
        <ThemeTeaser className="gr-teaser" />
      </section>
    </>
  );
}
