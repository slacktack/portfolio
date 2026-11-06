"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, systems, type SystemCase } from "@/lib/site";
import { systemSections } from "./layout";
import { FrameLabel, Ico, Pin, RedlineH, RedlineV, Sel, SplitTitle, Sticky, gradFor, posterFor, useMeasure } from "./ui";

function Preview({ s, i }: { s: SystemCase; i: number }) {
  const p = posterFor(s.slug);
  const [ref, [w, h]] = useMeasure<HTMLDivElement>();
  return (
    <div className="em-pv" key={s.slug}>
      <FrameLabel n={s.index} name={s.shortTitle} dims={w ? `${w} × ${h}` : undefined} />
      <div className="em-pv-frame" ref={ref} style={{ background: gradFor(i) }}>
        <RedlineH w={w} />
        <RedlineV h={h} />
        {p ? (
          <div className="em-pv-shot">
            <Image src={p.poster} alt={`${s.title} screen recording still`} fill sizes="(max-width: 1100px) 90vw, 560px" />
          </div>
        ) : null}
        <div className="em-pv-copy">
          <span className="em-pv-k">
            {s.category} · {s.year}
          </span>
          <b className="em-pv-big">{s.metrics[0].value}</b>
          <span className="em-pv-l">{s.metrics[0].label}</span>
          <p>{s.promise}</p>
        </div>
        <ol className="em-pv-chain">
          {s.architecture.map((a, k) => (
            <li key={a.label} style={{ "--em-d": `${k * 60}ms` } as CSSProperties}>
              <Pin n={k + 1} />
              {a.label}
            </li>
          ))}
        </ol>
      </div>
      <Link href={`/systems/${s.slug}`} className="em-sqbtn em-pv-open">
        Open frame {s.index} <Ico.arrow width={15} height={15} />
      </Link>
    </div>
  );
}

export function Systems() {
  const [on, setOn] = useState(0);
  return (
    <div className="em-sys">
      <header className="em-pagehead" data-em-in="">
        <span className="em-kicker">
          <Ico.frame width={12} height={12} /> Page · Frames
        </span>
        <h1>
          {systems.length} systems, laid out <em className="em-serif">as frames.</em>
        </h1>
        <p>Production work and side builds, each one a frame you can open: the problem, the constraints, the architecture with callouts, and the parts that broke.</p>
      </header>
      <div className="em-sys-grid">
        <ol className="em-sys-list">
          {systems.map((s, i) => (
            <li key={s.slug} data-em-in="" style={{ "--em-d": `${i * 40}ms` } as CSSProperties}>
              <Link href={`/systems/${s.slug}`} className="em-sys-row em-frame" data-on={on === i ? "1" : undefined} onMouseEnter={() => setOn(i)} onFocus={() => setOn(i)}>
                <span className="em-sys-thumb" style={{ background: gradFor(i) }} aria-hidden="true">
                  {s.index}
                </span>
                <span className="em-sys-t">
                  <b>{s.title}</b>
                  <em>{s.category}</em>
                </span>
                <span className="em-sys-m">
                  <b>{s.metrics[0].value}</b>
                  <em>{s.metrics[0].label}</em>
                </span>
                <span className="em-sys-promise">{s.promise}</span>
                <Sel />
              </Link>
            </li>
          ))}
        </ol>
        <aside className="em-sys-pv" aria-hidden="true">
          <Preview s={systems[on]} i={on} />
        </aside>
      </div>
    </div>
  );
}

function Inspector({ s }: { s: SystemCase }) {
  return (
    <aside className="em-insp em-glass" aria-label="Frame properties">
      <div className="em-insp-tabs" aria-hidden="true">
        <b>Design</b>
        <span>Inspect</span>
      </div>
      <section>
        <h2>Frame</h2>
        <dl>
          <div>
            <dt>Index</dt>
            <dd>{s.index}</dd>
          </div>
          <div>
            <dt>Year</dt>
            <dd>{s.year}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{s.role}</dd>
          </div>
        </dl>
      </section>
      <section>
        <h2>Fills · stack</h2>
        <ul className="em-insp-fills">
          {s.stack.map((t, i) => (
            <li key={t}>
              <i style={{ background: gradFor(i + 1) }} />
              {t}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Jump to</h2>
        <ul className="em-insp-jump">
          {systemSections(s).map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

function Head({ s, i }: { s: SystemCase; i: number }) {
  const [ref, [w, h]] = useMeasure<HTMLDivElement>();
  const p = posterFor(s.slug);
  return (
    <header className="em-case-head">
      <div className="em-case-title" ref={ref}>
        <RedlineH w={w} />
        <RedlineV h={h} />
        <span className="em-kicker">
          {s.category} · {s.year}
        </span>
        <h1>
          <SplitTitle text={s.title} />
        </h1>
        <p className="em-case-promise">{s.promise}</p>
        <p className="em-case-sum">{s.summary}</p>
      </div>
      <div className="em-case-block" style={{ background: gradFor(i) }} data-em-in="">
        {p ? (
          <a className="em-case-shot" href={p.href} target="_blank" rel="noreferrer" data-cursor="Live">
            <Image src={p.poster} alt={`${s.title} screen recording still`} fill sizes="(max-width: 1100px) 92vw, 760px" priority />
            <span>
              Live product <Ico.out width={12} height={12} />
            </span>
          </a>
        ) : null}
        <ul className="em-case-metrics">
          {s.metrics.map((m, k) => (
            <li key={m.label}>
              <Pin n={k + 1} />
              <b>{m.value}</b>
              <span>{m.label}</span>
              {m.note ? <em>{m.note}</em> : null}
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}

function Sect({ id, n, title, children, tone, wide }: { id: string; n: string; title: string; children: React.ReactNode; tone?: string; wide?: boolean }) {
  return (
    <section id={id} className="em-sect" data-tone={tone} data-wide={wide ? "1" : undefined} data-em-in="">
      <div className="em-sect-l">
        <span className="em-sect-n">{n}</span>
        <h2>{title}</h2>
      </div>
      <div className="em-sect-b">{children}</div>
    </section>
  );
}

export function System({ s }: { s: SystemCase }) {
  const i = systems.indexOf(s);
  const next = getNextSystem(s.slug);
  const prev = systems[(i - 1 + systems.length) % systems.length];
  let n = 0;
  const num = () => String(++n).padStart(2, "0");
  return (
    <div className="em-case">
      <div className="em-case-main">
        <Link href="/systems" className="em-crumb">
          <Ico.back width={13} height={13} /> All frames
        </Link>
        <div className="em-openframe">
          <FrameLabel n={s.index} name={s.shortTitle} dims="1200 × auto" />
          <div className="em-openframe-b">
            <Head s={s} i={i} />

            <Sect id="problem" n={num()} title="Problem">
              <div className="em-prose">
                {s.problem.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
            </Sect>

            <Sect id="constraints" n={num()} title="Constraints">
              <ul className="em-spec">
                {s.constraints.map((c, k) => (
                  <li key={c} style={{ "--em-d": `${k * 70}ms` } as CSSProperties}>
                    <span className="em-spec-i">C{k + 1}</span>
                    <span>{c}</span>
                    {k < s.constraints.length - 1 ? <i className="em-gap" aria-hidden="true">16</i> : null}
                  </li>
                ))}
              </ul>
            </Sect>

            <Sect id="architecture" n={num()} title="Architecture" wide>
              <ol className="em-arch" style={{ "--em-cols": s.architecture.length } as CSSProperties}>
                {s.architecture.map((a, k) => (
                  <li key={a.label} style={{ "--em-d": `${k * 90}ms` } as CSSProperties}>
                    <Pin n={k + 1} />
                    <b>{a.label}</b>
                    <span>{a.detail}</span>
                    <Sel />
                  </li>
                ))}
              </ol>
              <ul className="em-annot">
                {s.rail.map((r) => (
                  <li key={r}>
                    <Ico.comp width={12} height={12} />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="em-proto">
                <FrameLabel name="Prototype · live diagram" />
                <div className="em-art" data-kind={s.artifact}>
                  <SystemArtifact kind={s.artifact} />
                </div>
              </div>
            </Sect>

            {s.pager ? (
              <blockquote className="em-pager" data-em-in="">
                <span>Pager note</span>
                <p>{s.pager}</p>
              </blockquote>
            ) : null}

            <Sect id="hard" n={num()} title="Hard parts" wide>
              <div className="em-stickies">
                {s.hardPart.map((h, k) => (
                  <Sticky key={h.title} i={k} tone={(["butter", "peach", "pink"] as const)[k % 3]} k={`Hard part ${k + 1}`} title={h.title}>
                    <p>{h.body}</p>
                  </Sticky>
                ))}
              </div>
            </Sect>

            {s.broke ? (
              <Sect id="broke" n={num()} title="What broke" tone="hot">
                <Sticky tone="crimson" i={1} k="Incident" title={s.broke.title} tape>
                  <p>{s.broke.body}</p>
                </Sticky>
              </Sect>
            ) : null}

            {s.flaws?.length ? (
              <Sect id="flaws" n={num()} title="Known flaws" wide>
                <div className="em-stickies">
                  {s.flaws.map((f, k) => (
                    <Sticky key={f.title} i={k + 2} tone="coral" k={`Flaw ${k + 1}`} title={f.title} tape>
                      <p>{f.body}</p>
                    </Sticky>
                  ))}
                </div>
              </Sect>
            ) : null}

            {s.differently.length ? (
              <Sect id="next" n={num()} title="Next iteration">
                <ul className="em-todo">
                  {s.differently.map((d) => (
                    <li key={d}>
                      <i aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>
              </Sect>
            ) : null}

            <Sect id="receipts" n={num()} title="Receipts">
              <table className="em-receipts">
                <thead>
                  <tr>
                    <th scope="col">Layer</th>
                    <th scope="col">Value</th>
                    <th scope="col">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {s.receipts.map((r) => (
                    <tr key={r.label}>
                      <th scope="row">{r.label}</th>
                      <td>{r.value}</td>
                      <td>{r.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="em-proves">
                <span>Components this frame proves</span>
                <ul>
                  {s.proves.map((p) => (
                    <li key={p}>
                      <Ico.comp width={12} height={12} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </Sect>
          </div>
        </div>
        <nav className="em-pager-nav" aria-label="More frames">
          <Link href={`/systems/${prev.slug}`} className="em-pn">
            <span className="em-sqicon">
              <Ico.back width={16} height={16} />
            </span>
            <span>
              <em>Previous frame · {prev.index}</em>
              <b>{prev.title}</b>
            </span>
          </Link>
          <Link href={`/systems/${next.slug}`} className="em-pn em-pn-next">
            <span>
              <em>Next frame · {next.index}</em>
              <b>{next.title}</b>
            </span>
            <span className="em-sqicon">
              <Ico.arrow width={16} height={16} />
            </span>
          </Link>
        </nav>
      </div>
      <Inspector s={s} />
    </div>
  );
}
