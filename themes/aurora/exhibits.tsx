"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, systems, type SystemCase } from "@/lib/site";
import { Arrow, Aurora, Count, Label, Ribbon, SpreadHead, pad } from "./ui";

const tones = ["violet", "blue", "lime", "dusk"] as const;

export function Exhibits() {
  const [on, setOn] = useState(0);
  const s = systems[on];
  return (
    <>
      <section className="au-hall">
        <Aurora tone="dusk" />
        <div className="au-hall-in">
          <Label a="Room 01" b="Exhibits" className="au-hall-k" />
          <h1 className="au-hall-t">
            {systems.length} systems, <em>catalogued.</em>
          </h1>
          <p className="au-hall-d">
            Each exhibit is a production system, presented as a guideline document: the problem, the constraints, the architecture, what broke and
            what I would change.
          </p>
        </div>
      </section>

      <section className="au-cat">
        <aside className="au-plate" aria-hidden="true" data-tone={tones[on % tones.length]}>
          <div className="au-plate-in" key={s.slug}>
            <Aurora tone={tones[on % tones.length]} />
            <Label a={`Exhibit ${s.index}`} b={s.category} />
            <b className="au-plate-n">{s.metrics[0].value}</b>
            <span className="au-plate-l">{s.metrics[0].label}</span>
            <p className="au-plate-p">{s.promise}</p>
            <span className="au-plate-y">{s.year}</span>
          </div>
        </aside>
        <div className="au-cat-sheet">
          <div className="au-cat-head">
            <span>No.</span>
            <span>Exhibit</span>
            <span>Medium</span>
            <span>Key figure</span>
          </div>
          <ol className="au-cat-list">
            {systems.map((x, i) => (
              <li key={x.slug} data-au style={{ "--au-i": i } as CSSProperties}>
                <Link
                  href={`/systems/${x.slug}`}
                  className="au-cat-row"
                  data-on={i === on ? "" : undefined}
                  onMouseEnter={() => setOn(i)}
                  onFocus={() => setOn(i)}
                  data-cursor="Open"
                >
                  <span className="au-cat-no">{x.index}</span>
                  <span className="au-cat-t">
                    <b>{x.title}</b>
                    <small>{x.summary}</small>
                  </span>
                  <span className="au-cat-m">
                    <Label a={x.category} b={x.year} />
                  </span>
                  <span className="au-cat-v">
                    {x.metrics[0].value}
                    <small>{x.metrics[0].label}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

const sizes = [288, 168, 120, 96];

export function Exhibit({ s }: { s: SystemCase }) {
  const n = parseInt(s.index, 10);
  const next = getNextSystem(s.slug);
  const tone = tones[(n - 1) % tones.length];
  const spreads: { id: string; t: string }[] = [
    { id: "figures", t: "Figures" },
    { id: "problem", t: "Problem" },
    { id: "constraints", t: "Constraints" },
    { id: "architecture", t: "Architecture" },
    { id: "hard", t: "The hard part" },
  ];
  if (s.broke || s.pager) spreads.push({ id: "broke", t: s.broke ? "What broke" : "On call" });
  if (s.flaws?.length) spreads.push({ id: "flaws", t: "Known flaws" });
  spreads.push({ id: "differently", t: "Next time" }, { id: "receipts", t: "Receipts" });
  const no = (id: string) => `${n}.${spreads.findIndex((x) => x.id === id) + 1}`;

  return (
    <article className="au-doc">
      <header className="au-cover">
        <Aurora tone={tone} />
        <Ribbon className="au-cover-ribbon" d="M-40 480 C 300 380, 420 80, 760 160 S 1200 520, 1500 120" />
        <div className="au-cover-in">
          <div className="au-cover-top">
            <Label a={`Exhibit ${s.index}`} b={s.category} />
            <Label a={s.year} b={s.role} />
            <Link href="/systems" className="au-back">
              <Arrow /> All exhibits
            </Link>
          </div>
          <h1 className="au-cover-t">{s.title}</h1>
          <p className="au-cover-p">{s.promise}</p>
          <nav className="au-toc" aria-label="Spreads">
            {spreads.map((x, i) => (
              <a key={x.id} href={`#${x.id}`}>
                <span>
                  {n}.{i + 1}
                </span>
                {x.t}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section className="au-sheet au-intro">
        <div className="au-intro-grid" data-au="page">
          <p className="au-lede">{s.summary}</p>
          <dl className="au-spec">
            <div>
              <dt>Role</dt>
              <dd>{s.role}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{s.year}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{s.category}</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd className="au-tags">
                {s.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section id="figures" className="au-figblock">
        <SpreadHead no={no("figures")} a="Type scale" b="Figures" title="Set at the size they earned." />
        <div className="au-figscale">
          {s.metrics.map((m, i) => (
            <div key={m.label} className="au-figrow" data-au="page" style={{ "--au-fs": `${sizes[i] ?? 80}px` } as CSSProperties}>
              <Label a={`Roboto Serif Light`} b={`${sizes[i] ?? 80} pt`} className="au-figspec" />
              <Count value={m.value} className="au-fignum" />
              <div className="au-figlab">
                <b>{m.label}</b>
                {m.note ? <span>{m.note}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="problem" className="au-sheet au-spread">
        <SpreadHead no={no("problem")} a="Brief" b="Problem" />
        <div className="au-cols" data-au="page">
          {s.problem.map((p, i) => (
            <p key={i} className={i === 0 ? "au-big" : undefined}>
              {p}
            </p>
          ))}
        </div>
      </section>

      <section id="constraints" className="au-sheet au-spread au-sheet-alt">
        <SpreadHead no={no("constraints")} a="Guardrails" b="Constraints" />
        <table className="au-rules" data-au="page">
          <tbody>
            {s.constraints.map((c, i) => (
              <tr key={i}>
                <th scope="row">
                  {no("constraints")}.{i + 1}
                </th>
                <td>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="architecture" className="au-wall au-spread">
        <SpreadHead no={no("architecture")} a="System" b="Architecture" title="From request to answer, as a neutral ladder." />
        <ol className="au-ladder" data-au="page">
          {s.architecture.map((a, i) => (
            <li key={a.label} style={{ "--au-i": i, "--au-k": i / Math.max(1, s.architecture.length - 1) } as CSSProperties}>
              <span className="au-ladder-chip" />
              <Label a={`Step ${pad(i + 1)}`} b={a.label} />
              <p>{a.detail}</p>
            </li>
          ))}
        </ol>
        <div className="au-artgrid">
          <figure className="au-artframe" data-au="page">
            <div className="au-art">
              <SystemArtifact kind={s.artifact} />
            </div>
            <figcaption>
              <Label a="Plate" b={`${s.shortTitle}, live diagram`} />
            </figcaption>
          </figure>
          <ul className="au-rail" data-au>
            {s.rail.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="hard" className="au-block au-spread" data-tone="lime">
        <SpreadHead no={no("hard")} a="Usage" b="The hard part" />
        <div className="au-hard">
          {s.hardPart.map((h, i) => (
            <div key={h.title} className="au-hard-c" data-au="page" style={{ "--au-i": i } as CSSProperties}>
              <span className="au-hard-n">{pad(i + 1)}</span>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {s.broke || s.pager ? (
        <section id="broke" className="au-block au-spread" data-tone="violet">
          <SpreadHead no={no("broke")} a="Incident" b={s.broke ? "What broke" : "On call"} />
          {s.pager ? (
            <blockquote className="au-quote" data-au="page">
              <p>{s.pager}</p>
            </blockquote>
          ) : null}
          {s.broke ? (
            <div className="au-broke" data-au="page">
              <h3>{s.broke.title}</h3>
              <p>{s.broke.body}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {s.flaws?.length ? (
        <section id="flaws" className="au-sheet au-spread">
          <SpreadHead no={no("flaws")} a="Don't" b="Known flaws" />
          <div className="au-dont">
            {s.flaws.map((f) => (
              <div key={f.title} data-au="page">
                <span className="au-x" aria-hidden="true" />
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section id="differently" className="au-sheet au-spread au-sheet-alt">
        <SpreadHead no={no("differently")} a="Revision" b="Next time" />
        <div className="au-do" data-au="page">
          {s.differently.map((d, i) => (
            <p key={i}>
              <span>Do</span>
              {d}
            </p>
          ))}
        </div>
        <div className="au-proves" data-au>
          <Label a="This exhibit" b="Demonstrates" />
          <ul>
            {s.proves.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="receipts" className="au-wall au-spread">
        <SpreadHead no={no("receipts")} a="Evidence" b="Receipts" />
        <div className="au-receipts">
          {s.receipts.map((r, i) => (
            <div key={r.label} data-au="page" style={{ "--au-i": i } as CSSProperties}>
              <Label a={r.label} b={r.detail} />
              <Count value={r.value} className="au-receipt-v" />
            </div>
          ))}
        </div>
      </section>

      <Link href={`/systems/${next.slug}`} className="au-next" data-cursor="Next">
        <Aurora tone={tones[(n) % tones.length]} />
        <Label a="Next exhibit" b={`${next.index} · ${next.category}`} />
        <b>{next.title}</b>
        <span className="au-next-p">{next.promise}</span>
        <span className="au-next-go">
          <Arrow />
        </span>
      </Link>
    </article>
  );
}
