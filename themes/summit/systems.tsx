"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, stage, systems, type SystemCase } from "@/lib/site";
import { Arrow, AutoVideo, BrandCard, Browser, Head, Scene, host, pad, tones } from "./ui";
import type { Sub } from "./nav";

const toneOf = (s: SystemCase) => tones[(systems.indexOf(s) + tones.length) % tones.length];
const shortLabel = (l: string) => l.toUpperCase().replace(" / ", "/");

export function Systems() {
  return (
    <>
      <Head
        n="02"
        label="Products"
        title={
          <>
            The product line. <em>Every number is a receipt.</em>
          </>
        }
        lede={`${systems.length} production systems: comparison engines, pipelines and the platforms around them. Each one has a spec sheet, an architecture, and an honest list of what broke.`}
      />
      <div className="sm-grid">
        {systems.map((s, i) => (
          <BrandCard
            key={s.slug}
            tone={toneOf(s)}
            index={i % 3}
            href={`/systems/${s.slug}`}
            kicker={`${s.index} · ${s.category}`}
            title={s.shortTitle}
            specs={s.metrics.slice(0, 3).map((m) => [shortLabel(m.label), m.value])}
          >
            <p className="sm-card-p">{s.promise}</p>
          </BrandCard>
        ))}
      </div>
    </>
  );
}

export function systemSubs(s: SystemCase): Sub[] {
  return [
    { id: "problem", label: "Problem" },
    { id: "constraints", label: "Constraints" },
    { id: "architecture", label: "Architecture" },
    { id: "features", label: "Hard parts" },
    ...(s.broke || s.flaws?.length ? [{ id: "limits", label: "Known limitations" }] : []),
    { id: "spec", label: "Spec table" },
  ];
}

function Section({ id, n, label, children }: { id: string; n: string; label: string; children: React.ReactNode }) {
  return (
    <section className="sm-sec" id={id}>
      <div className="sm-sec-label" data-rise="">
        <b>{n}</b>
        <span>{label}</span>
      </div>
      <div className="sm-sec-body">{children}</div>
    </section>
  );
}

export function System({ s }: { s: SystemCase }) {
  const tone = toneOf(s);
  const rec = stage.find((x) => x.slug === `bh-${s.slug}`);
  const next = getNextSystem(s.slug);
  const limits = !!(s.broke || s.flaws?.length);
  let n = 0;
  const num = () => pad(++n);

  return (
    <article className="sm-case">
      <header className="sm-case-hero">
        <div className="sm-case-copy">
          <Link href="/systems" className="sm-back" data-rise="">
            ← Product line
          </Link>
          <span className="sm-eyebrow" data-rise="">
            <b>{s.index}</b>
            {s.category}
          </span>
          <h1 className="sm-h1" data-rise="">
            {s.title}
          </h1>
          <p className="sm-promise" data-rise="">
            {s.promise}
          </p>
          <p className="sm-lede" data-rise="">
            {s.summary}
          </p>
          <dl className="sm-facts" data-rise="">
            <div>
              <dt>Year</dt>
              <dd>{s.year}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{s.role}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd className="sm-chips">
                {s.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <BrandCard tone={tone} className="sm-card-sheet" kicker={`Spec sheet · ${s.index}`} title={s.shortTitle} specs={s.metrics.map((m) => [shortLabel(m.label), m.value])}>
          <p className="sm-card-p">{s.metrics.find((m) => m.note)?.note}</p>
        </BrandCard>
      </header>

      <div className="sm-figure" data-rise="">
        {rec ? (
          <div className="sm-figure-rec">
            <Browser url={host(rec.href) + new URL(rec.href).pathname}>
              <AutoVideo src={rec.video} poster={rec.poster} label={`${rec.title} screen recording`} />
            </Browser>
            <div className="sm-figure-cap">
              <span className="sm-eyebrow">
                <b>Fig. A</b>Recorded in production
              </span>
              <p>{rec.tagline}</p>
              <a className="sm-btn" href={rec.href} target="_blank" rel="noreferrer" data-cursor="Visit">
                Visit live
                <Arrow />
              </a>
            </div>
          </div>
        ) : null}
        <div className="sm-figure-art">
          <span className="sm-eyebrow">
            <b>Fig. {rec ? "B" : "A"}</b>Schematic
          </span>
          <div className="sm-art-box">
            <SystemArtifact kind={s.artifact} />
          </div>
        </div>
      </div>

      <Section id="problem" n={num()} label="The problem">
        <div className="sm-prose" data-rise="">
          {s.problem.map((p, i) => (
            <p key={i} className={i === 0 ? "sm-first" : undefined}>
              {p}
            </p>
          ))}
        </div>
        {s.pager ? (
          <blockquote className="sm-pull" data-rise="">
            {s.pager}
          </blockquote>
        ) : null}
      </Section>

      <Section id="constraints" n={num()} label="Constraints">
        <ol className="sm-cons">
          {s.constraints.map((c, i) => (
            <li key={i} data-rise="" style={{ "--i": i % 4 } as CSSProperties}>
              <span>C{pad(i + 1)}</span>
              {c}
            </li>
          ))}
        </ol>
      </Section>

      <Section id="architecture" n={num()} label="Architecture">
        <div className="sm-arch" data-rise="" style={{ "--cols": s.architecture.length } as CSSProperties}>
          <div className="sm-arch-line" aria-hidden="true">
            <i />
          </div>
          {s.architecture.map((a, i) => (
            <div className="sm-arch-node" key={a.label}>
              <span>{pad(i + 1)}</span>
              <b>{a.label}</b>
              <small>{a.detail}</small>
            </div>
          ))}
        </div>
        <ul className="sm-rail-chips" data-rise="">
          {s.rail.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Section>

      <Section id="features" n={num()} label="The hard parts">
        <div className="sm-feats">
          {s.hardPart.map((h, i) => (
            <div className="sm-feat" key={h.title} data-rise="" style={{ "--i": i % 2 } as CSSProperties}>
              <span className="sm-feat-n">F{pad(i + 1)}</span>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {limits ? (
        <Section id="limits" n={num()} label="Known limitations">
          <div className="sm-limits">
            {s.broke ? (
              <div className="sm-limit sm-limit-broke" data-rise="">
                <span className="sm-tag-coral">What broke</span>
                <h3>{s.broke.title}</h3>
                <p>{s.broke.body}</p>
              </div>
            ) : null}
            {s.flaws?.map((f, i) => (
              <div className="sm-limit" key={f.title} data-rise="" style={{ "--i": i % 3 } as CSSProperties}>
                <span className="sm-tag-coral">Flaw {pad(i + 1)}</span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section id="spec" n={num()} label="Spec table">
        <table className="sm-table" data-rise="">
          <caption className="sm-visually-hidden">Receipts for {s.title}</caption>
          <thead>
            <tr>
              <th scope="col">Spec</th>
              <th scope="col">Value</th>
              <th scope="col">Detail</th>
            </tr>
          </thead>
          <tbody>
            {s.receipts.map((r) => (
              <tr key={r.label}>
                <th scope="row">{r.label}</th>
                <td className="sm-table-v">{r.value}</td>
                <td>{r.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="sm-after">
          {s.differently.length ? (
            <div data-rise="">
              <h3 className="sm-h3">What I&rsquo;d do differently</h3>
              <ul className="sm-ticks">
                {s.differently.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div data-rise="">
            <h3 className="sm-h3">What it proves</h3>
            <ul className="sm-chips sm-chips-lg">
              {s.proves.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Link href={`/systems/${next.slug}`} className={`sm-next sm-card-${toneOf(next)}`} data-cursor="Next" data-par="" data-rise="">
        <Scene tone={toneOf(next)} wide />
        <div className="sm-card-fade" />
        <div className="sm-next-copy">
          <span className="sm-eyebrow sm-eyebrow-inv">
            <b>Next product</b>
            {next.index} · {next.category}
          </span>
          <strong>{next.title}</strong>
          <span>{next.promise}</span>
        </div>
        <Arrow size={28} />
      </Link>
    </article>
  );
}
