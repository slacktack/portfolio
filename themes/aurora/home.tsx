"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ThemeTeaser } from "@/components/theme-palette";
import { labItems, marqueeMetrics, notes, profile, stage, systems } from "@/lib/site";
import { Arrow, Aurora, Count, Label, Ribbon, SpreadHead, pad } from "./ui";

const scale = [200, 160, 128, 96, 72, 56];

const figures = marqueeMetrics
  .filter((m) => /^\d/.test(m))
  .slice(0, scale.length)
  .map((m) => {
    const [value, ...rest] = m.split(" ");
    return { value, label: rest.join(" ") };
  });

const floor = [
  { href: "/systems", no: "01", a: "Exhibits", b: "Systems", n: systems.length, unit: "cases", tone: "violet" },
  { href: "/projects", no: "02", a: "Salon", b: "Projects", n: stage.length, unit: "recordings", tone: "lime" },
  { href: "/lab", no: "03", a: "Bench", b: "Lab", n: labItems.length, unit: "pieces", tone: "blue" },
  { href: "/notes", no: "04", a: "Essays", b: "Notes", n: notes.length, unit: "essays", tone: "paper" },
  { href: "/about", no: "05", a: "Statement", b: "About", n: 0, unit: "", tone: "ink" },
];

export function Home() {
  const lead = systems[0];
  const words = profile.tagline.replace(/\.$/, "").split(" ");
  return (
    <>
      <section className="au-open">
        <Aurora tone="violet" />
        <Ribbon className="au-open-ribbon" />
        <div className="au-open-in">
          <Label a="Now showing" b="An exhibition in five rooms" className="au-open-k" />
          <h1 className="au-open-t" aria-label={profile.tagline}>
            {words.map((w, i) => (
              <span key={i} className="au-word" style={{ "--au-i": i } as CSSProperties} aria-hidden="true">
                <span>{i === words.length - 1 ? <em>{w}.</em> : w}</span>
              </span>
            ))}
          </h1>
          <div className="au-open-foot">
            <div className="au-placard" data-au>
              <Label a={profile.name} b={`${profile.role}, ${profile.location}`} />
              <p>{profile.description}</p>
              <div className="au-placard-row">
                <span>
                  <b>{pad(systems.length)}</b> exhibits
                </span>
                <span>
                  <b>{pad(stage.length)}</b> recordings
                </span>
                <span>
                  <b>{pad(notes.length)}</b> essays
                </span>
              </div>
            </div>
            <Link href="/systems" className="au-enter" data-cursor="Enter">
              <span>Enter the exhibition</span>
              <Arrow />
            </Link>
          </div>
        </div>
      </section>

      <section className="au-sheet au-figs" aria-labelledby="au-figs-t">
        <SpreadHead no="1.0" a="Type scale" b="Figures" title={<span id="au-figs-t">The numbers, set at the size they earned.</span>} />
        <table className="au-scale" data-au="page">
          <thead>
            <tr>
              <th scope="col">Style</th>
              <th scope="col">Figure</th>
              <th scope="col">Measure</th>
            </tr>
          </thead>
          <tbody>
            {figures.map((f, i) => (
              <tr key={f.value} style={{ "--au-fs": `${scale[i]}px` } as CSSProperties}>
                <td>
                  <Label a={`Display ${pad(i + 1)}`} b={`Light ${scale[i]} / ${Math.round(scale[i] * 0.92)}`} />
                </td>
                <td>
                  <Count value={f.value} className="au-scale-v" />
                </td>
                <td className="au-scale-l">{f.label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="au-floor" aria-labelledby="au-floor-t">
        <SpreadHead no="2.0" a="Floor plan" b="Rooms" title={<span id="au-floor-t">Five rooms. Walk them in any order.</span>} />
        <div className="au-plan" data-au="page">
          {floor.map((r, i) => (
            <Link key={r.href} href={r.href} className={`au-room au-room-${i}`} data-tone={r.tone}>
              <span className="au-room-no">{r.no}</span>
              <Label a={r.a} b={r.b} />
              <b className="au-room-t">{r.a}</b>
              <span className="au-room-n">{r.n ? `${pad(r.n)} ${r.unit}` : "Statement and CV"}</span>
              <span className="au-room-go">
                <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="au-feature" aria-labelledby="au-feat-t">
        <Aurora tone="blue" />
        <div className="au-feature-in">
          <Label a={`Exhibit ${lead.index}`} b={lead.category} />
          <Count value={lead.metrics[0].value} className="au-feature-n" />
          <p className="au-feature-l">{lead.metrics[0].label}</p>
          <h2 id="au-feat-t" className="au-feature-t">
            {lead.promise}
          </h2>
          <Link href={`/systems/${lead.slug}`} className="au-pill" data-cursor="View">
            View the {lead.shortTitle.toLowerCase()} exhibit <Arrow />
          </Link>
        </div>
        <ol className="au-feature-list">
          {systems.slice(1, 6).map((s) => (
            <li key={s.slug}>
              <Link href={`/systems/${s.slug}`}>
                <span>{s.index}</span>
                <b>{s.shortTitle}</b>
                <em>{s.metrics[0].value}</em>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="au-sheet au-editions" aria-label="Other editions">
        <SpreadHead no="3.0" a="Editions" b="The same show, re-hung" title="This exhibition travels. Each venue rebuilds it." />
        <div data-au="page">
          <ThemeTeaser className="au-teaser" />
        </div>
      </section>
    </>
  );
}
