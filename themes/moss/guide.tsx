"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, getSystem, systems } from "@/lib/site";
import { latinFor, specimenFor, systemSpecimens } from "./data";
import { Arrow, Leaf, Unfurl } from "./kit";
import { Plant } from "./plants";
import { Missing } from "./pages";

export function Systems() {
  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = Array.from(list.current?.querySelectorAll<HTMLElement>("[data-entry]") ?? []);
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.entry));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    items.forEach((i) => io.observe(i));
    return () => io.disconnect();
  }, []);

  const s = systemSpecimens[active];
  return (
    <>
      <header className="mo-page-head mo-guide-head">
        <Unfurl>
          <span className="mo-k mo-k-pill">The field guide · {systems.length} plates</span>
        </Unfurl>
        <Unfurl delay={80}>
          <h1 className="mo-display">
            How to identify <em>a system</em> in the wild.
          </h1>
        </Unfurl>
        <Unfurl delay={160}>
          <p className="mo-lede">Each plate is one production system: the habitat it grows in, the conditions it tolerates, its anatomy, the blight it survived, and the receipts. Scroll the guide; the bell jar holds the specimen you are reading.</p>
        </Unfurl>
      </header>

      <div className="mo-guide">
        <aside className="mo-jar" aria-hidden="true">
          <div className="mo-jar-glass" data-hue={s.hue}>
            <span className="mo-jar-knob" />
            <div className="mo-jar-art" key={s.id}>
              <SystemArtifact kind={s.system!.artifact} />
            </div>
            <div className="mo-jar-label" key={`l-${s.id}`}>
              <em>{s.latin}</em>
              <b>{s.metric.value}</b>
              <span>{s.metric.label}</span>
            </div>
          </div>
          <span className="mo-jar-base" />
        </aside>

        <ol className="mo-entries" ref={list}>
          {systemSpecimens.map((sp, i) => {
            const c = sp.system!;
            return (
              <li key={sp.id} data-entry={i} data-on={i === active ? "" : undefined}>
                <Link href={sp.href} className="mo-entry" data-hue={sp.hue} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)}>
                  <span className="mo-entry-no">{c.index}</span>
                  <span className="mo-entry-main">
                    <span className="mo-k">Family · {c.category}</span>
                    <em className="mo-entry-latin">{sp.latin}</em>
                    <b className="mo-entry-common">{c.title}</b>
                    <span className="mo-entry-promise">{c.promise}</span>
                    <span className="mo-entry-ms">
                      {c.metrics.slice(0, 2).map((m) => (
                        <span key={m.label}>
                          <b>{m.value}</b> {m.label}
                        </span>
                      ))}
                    </span>
                  </span>
                  <span className="mo-entry-go">
                    Read plate <Arrow />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

function Section({ k, title, children, className = "" }: { k: string; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Unfurl as="section" className={`mo-psec ${className}`}>
      <header>
        <span className="mo-k">{k}</span>
        <h2 className="mo-h3">{title}</h2>
      </header>
      <div className="mo-psec-body">{children}</div>
    </Unfurl>
  );
}

export function System({ slug }: { slug: string }) {
  const c = getSystem(slug);
  if (!c) return <Missing />;
  const sp = specimenFor(slug)!;
  const next = getNextSystem(slug);
  return (
    <article className="mo-plate" data-hue={sp.hue}>
      <nav className="mo-crumb" aria-label="Breadcrumb">
        <Link href="/systems">Field guide</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Plate {c.index}</span>
      </nav>

      <header className="mo-plate-head">
        <div>
          <Unfurl>
            <span className="mo-k mo-k-pill">
              Plate {c.index} · Family {c.category}
            </span>
          </Unfurl>
          <Unfurl delay={80}>
            <h1 className="mo-plate-latin">
              <em>{sp.latin}</em>
            </h1>
          </Unfurl>
          <Unfurl delay={140}>
            <p className="mo-plate-common">
              {c.title} <span>— {c.promise}</span>
            </p>
          </Unfurl>
          <Unfurl delay={200}>
            <dl className="mo-plate-meta">
              <div>
                <dt>Collected</dt>
                <dd>{c.year}</dd>
              </div>
              <div>
                <dt>Grower</dt>
                <dd>{c.role}</dd>
              </div>
              <div>
                <dt>Soil</dt>
                <dd>{c.stack.join(" · ")}</dd>
              </div>
            </dl>
          </Unfurl>
        </div>
        <Unfurl delay={120} className="mo-measure">
          {c.metrics.map((m, i) => (
            <div key={m.label} className="mo-measure-row" style={{ "--i": i } as CSSProperties}>
              <b>{m.value}</b>
              <span>
                {m.label}
                {m.note && <small>{m.note}</small>}
              </span>
            </div>
          ))}
        </Unfurl>
      </header>

      <Unfurl as="figure" className="mo-fig">
        <div className="mo-fig-art">
          <SystemArtifact kind={c.artifact} />
        </div>
        <figcaption className="mo-fig-cap">
          <span className="mo-k">Fig. 1 — anatomy of the specimen</span>
          <ol className="mo-anat">
            {c.architecture.map((a, i) => (
              <li key={a.label} style={{ "--i": i } as CSSProperties}>
                <i>{i + 1}</i>
                <b>{a.label}</b>
                <span>{a.detail}</span>
              </li>
            ))}
          </ol>
          <p className="mo-fig-sum">{c.summary}</p>
        </figcaption>
      </Unfurl>

      {c.rail.length > 0 && (
        <ul className="mo-roots" aria-label="Root system">
          {c.rail.map((r, i) => (
            <li key={r} style={{ "--i": i } as CSSProperties}>
              <Leaf />
              {r}
            </li>
          ))}
        </ul>
      )}

      <div className="mo-plate-body">
        <Section k="Habitat · the problem" title={<>Where it <em>grows.</em></>} className="mo-psec-habitat">
          {c.problem.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
        </Section>

        <Section k="Growing conditions · constraints" title={<>What it has to <em>tolerate.</em></>}>
          <ul className="mo-conds">
            {c.constraints.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>

        <Section k="The hard part" title={<>The <em>tricky</em> cuttings.</>} className="mo-psec-wide">
          <div className="mo-hard">
            {c.hardPart.map((h, i) => (
              <div key={h.title} className="mo-hard-card" data-i={i % 3}>
                <b>{h.title}</b>
                <p>{h.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section k="Try the mechanism" title={<>Poke the <em>specimen.</em></>} className="mo-psec-play">
          <Plant s={sp} big />
        </Section>

        {c.broke && (
          <Section k="Blight · what broke" title={<em>{c.broke.title}</em>} className="mo-psec-blight">
            <p>{c.broke.body}</p>
          </Section>
        )}

        {c.flaws && c.flaws.length > 0 && (
          <Section k="Known flaws" title={<>Where it is still <em>weak.</em></>}>
            <ul className="mo-flaws">
              {c.flaws.map((f) => (
                <li key={f.title}>
                  <b>{f.title}</b>
                  <span>{f.body}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section k="Pruning notes · what I'd do differently" title={<>Next <em>season.</em></>}>
          <ul className="mo-conds mo-conds-prune">
            {c.differently.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>

        <Section k="What it proves" title={<>Traits it <em>carries.</em></>}>
          <ul className="mo-traits">
            {c.proves.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Section>
      </div>

      <Unfurl as="section" className="mo-receipts" aria-label="Receipts">
        <header>
          <span className="mo-k">Herbarium · receipts</span>
          <h2 className="mo-h3">
            Pressed, dated, <em>verifiable.</em>
          </h2>
        </header>
        <div className="mo-receipt-grid">
          {c.receipts.map((r, i) => (
            <div key={r.label} className="mo-receipt" style={{ "--i": i } as CSSProperties}>
              <span className="mo-k">{r.label}</span>
              <b>{r.value}</b>
              <p>{r.detail}</p>
            </div>
          ))}
        </div>
      </Unfurl>

      <Link href={`/systems/${next.slug}`} className="mo-nextplate" data-cursor="Next plate">
        <span className="mo-k">Turn to plate {next.index}</span>
        <em>{latinFor(next.slug)}</em>
        <b>
          {next.title} <Arrow />
        </b>
      </Link>
    </article>
  );
}
