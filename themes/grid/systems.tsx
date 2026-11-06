"use client";

import Link from "next/link";
import { useState } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, profile, systems, type SystemCase } from "@/lib/site";
import { Fig, Kicker, Lines, Turn, d, pad, sysPage } from "./ui";

export function Toc() {
  const [on, setOn] = useState(0);
  const s = systems[on];
  return (
    <section className="gr-tocpage">
      <header className="gr-sec-head">
        <Kicker n="02">Section · Systems</Kicker>
        <Lines as="h1" className="gr-display gr-display-xl" lines={["Contents"]} />
        <p className="gr-sec-lede" data-rv="">
          {systems.length} articles on systems running in production and on the bench. Each one is written as a case: the problem, the constraints, the
          architecture, what broke, and the receipts.
        </p>
      </header>

      <div className="gr-tocgrid">
        <ol className="gr-toclist">
          {systems.map((x, i) => (
            <li key={x.slug} data-rv="" style={d(i * 0.6)}>
              <Link href={`/systems/${x.slug}`} onPointerEnter={() => setOn(i)} onFocus={() => setOn(i)} className={i === on ? "is-hot" : undefined}>
                <b className="gr-toclist-n">{x.index}</b>
                <span className="gr-toclist-t">
                  <strong>{x.title}</strong>
                  <em>{x.category}</em>
                </span>
                <span className="gr-toclist-p">{x.promise}</span>
                <i className="gr-toclist-lead" aria-hidden="true" />
                <span className="gr-toclist-pg">p.&nbsp;{pad(sysPage(x.slug))}</span>
              </Link>
            </li>
          ))}
        </ol>

        <aside className="gr-tocpeek" aria-hidden="true">
          <div className="gr-tocpeek-in" key={s.slug}>
            <span className="gr-tocpeek-k">Turn to page</span>
            <b className="gr-tocpeek-n">{pad(sysPage(s.slug))}</b>
            <span className="gr-tocpeek-c">{s.category}</span>
            <dl>
              {s.metrics.slice(0, 2).map((m) => (
                <div key={m.label}>
                  <dt>{m.value}</dt>
                  <dd>{m.label}</dd>
                </div>
              ))}
            </dl>
            <span className="gr-tocpeek-y">
              {s.year} · {s.stack.slice(0, 3).join(", ")}
            </span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Sec({ n, label, children, margin, id }: { n: number; label: string; children: React.ReactNode; margin?: React.ReactNode; id?: string }) {
  return (
    <section className="gr-art-sec" id={id}>
      <h2 className="gr-art-label" data-rv="">
        <b>§{n}</b>
        <span>{label}</span>
      </h2>
      <div className="gr-art-body">{children}</div>
      {margin && <aside className="gr-margin">{margin}</aside>}
    </section>
  );
}

export function Article({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  const pg = sysPage(s.slug);
  const i = systems.indexOf(s);
  let n = 0;
  const quote = s.pager ?? s.promise;
  return (
    <article className="gr-art">
      <header className="gr-art-head">
        <Lines className="gr-art-folio" lines={[s.index]} />
        <div className="gr-art-titles">
          <Kicker n={`p.${pad(pg)}`}>
            Systems · Article {i + 1} of {systems.length} · {s.category}
          </Kicker>
          <Lines as="h1" className="gr-display gr-art-title" lines={[s.title]} delay={1} />
          <p className="gr-art-stand" data-rv="" style={d(2)}>
            {s.summary}
          </p>
          <dl className="gr-byline" data-rv="" style={d(3)}>
            <div>
              <dt>Words &amp; system</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{s.role}</dd>
            </div>
            <div>
              <dt>Period</dt>
              <dd>{s.year}</dd>
            </div>
            <div>
              <dt>Set in</dt>
              <dd>{s.stack.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </header>

      <Fig n={1} title={`Measurements, ${s.shortTitle.toLowerCase()}`} className="gr-measure gr-blue">
        <ul>
          {s.metrics.map((m, k) => (
            <li key={m.label} style={d(k)}>
              <b>{m.value}</b>
              <span>{m.label}</span>
              {m.note && <em>{m.note}</em>}
            </li>
          ))}
        </ul>
      </Fig>

      <div className="gr-art-flow">
        <Sec
          n={++n}
          label="The problem"
          margin={
            <>
              <p className="gr-margin-k">Constraints</p>
              <ol className="gr-margin-list">
                {s.constraints.map((c, k) => (
                  <li key={k} data-rv="" style={d(k)}>
                    <b>{pad(k + 1)}</b>
                    {c}
                  </li>
                ))}
              </ol>
            </>
          }
        >
          {s.problem.map((p, k) => (
            <p key={k} className={k === 0 ? "gr-drop" : undefined} data-rv="">
              {p}
            </p>
          ))}
        </Sec>

        <blockquote className="gr-pull" data-rv="">
          <span className="gr-pull-mark" aria-hidden="true">
            “
          </span>
          <p>{quote}</p>
          <cite>
            {s.title}, p.{pad(pg)}
          </cite>
        </blockquote>

        <Sec
          n={++n}
          label="Architecture"
          margin={
            <>
              <p className="gr-margin-k">Load-bearing decisions</p>
              <ul className="gr-margin-list gr-margin-dash">
                {s.rail.map((r) => (
                  <li key={r} data-rv="">
                    {r}
                  </li>
                ))}
              </ul>
            </>
          }
        >
          <Fig n={2} title={`Architecture, ${s.title.toLowerCase()}. Live diagram.`} className="gr-artifact">
            <div className="gr-artifact-box">
              <SystemArtifact kind={s.artifact} />
            </div>
          </Fig>
          <ol className="gr-flow" data-rv="">
            {s.architecture.map((a, k) => (
              <li key={a.label} style={d(k)}>
                <b>{pad(k + 1)}</b>
                <strong>{a.label}</strong>
                <span>{a.detail}</span>
              </li>
            ))}
          </ol>
        </Sec>

        <Sec
          n={++n}
          label="The hard part"
          margin={
            <>
              <p className="gr-margin-k">Receipts</p>
              <dl className="gr-receipts">
                {s.receipts.map((r, k) => (
                  <div key={r.label} data-rv="" style={d(k)}>
                    <dt>{r.value}</dt>
                    <dd>
                      <b>{r.label}</b>
                      {r.detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          }
        >
          <div className="gr-hard">
            {s.hardPart.map((h, k) => (
              <div key={h.title} data-rv="" style={d(k)}>
                <h3>
                  <b>{String.fromCharCode(97 + k)}.</b> {h.title}
                </h3>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </Sec>

        {s.broke && (
          <section className="gr-erratum gr-paper" data-rv="">
            <p className="gr-erratum-k">
              <b>Erratum</b> · What broke
            </p>
            <h3>{s.broke.title}</h3>
            <p>{s.broke.body}</p>
          </section>
        )}

        {s.flaws && s.flaws.length > 0 && (
          <Sec n={++n} label="Known flaws">
            <ol className="gr-flaws">
              {s.flaws.map((f, k) => (
                <li key={f.title} data-rv="" style={d(k)}>
                  <h3>{f.title}</h3>
                  <p>{f.body}</p>
                </li>
              ))}
            </ol>
          </Sec>
        )}

        {s.differently.length > 0 && (
          <Sec n={++n} label="Second edition">
            <p className="gr-art-note" data-rv="">
              What I would do differently:
            </p>
            <ul className="gr-diff">
              {s.differently.map((x) => (
                <li key={x} data-rv="">
                  <mark>{x}</mark>
                </li>
              ))}
            </ul>
          </Sec>
        )}

        <Sec n={++n} label="Index terms">
          <ul className="gr-terms" data-rv="">
            {s.proves.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Sec>
      </div>

      <Turn href={`/systems/${next.slug}`} k={`Next article · ${next.index}`} title={next.title} p={sysPage(next.slug)} />
    </article>
  );
}
