"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, getSystem, systems } from "@/lib/site";
import { Footer } from "./home";
import { Dots, Glitch, Icon, InView, Leader, Leds, Panel, Ruler, Spark, pad } from "./ui";
import { Missing } from "./pages";

export function Services() {
  const [sel, setSel] = useState(systems[0].slug);
  const s = getSystem(sel) ?? systems[0];
  return (
    <div className="sg-page">
      <header className="sg-head">
        <span className="sg-k">Services / Registry</span>
        <Glitch text="Service registry" />
        <p className="sg-lede">Every production system I own or built, as a service you can inspect. Each row opens its runbook: situation, topology, the incident, the known issues and the telemetry.</p>
      </header>
      <div className="sg-reg">
        <Panel className="sg-table" leds label="svc ls --all" aside={`${systems.length} rows`}>
          <div className="sg-tr sg-th" aria-hidden="true">
            <span>ID</span>
            <span>Service</span>
            <span>Category</span>
            <span>Primary signal</span>
            <span>Since</span>
          </div>
          <ul>
            {systems.map((x) => (
              <li key={x.slug}>
                <Link
                  href={`/systems/${x.slug}`}
                  className="sg-tr"
                  aria-current={x.slug === sel ? "true" : undefined}
                  onMouseEnter={() => setSel(x.slug)}
                  onFocus={() => setSel(x.slug)}
                >
                  <span className="sg-dim">
                    <i className="sg-dot" aria-hidden="true" /> {x.index}
                  </span>
                  <b>{x.title}</b>
                  <span className="sg-tr-c">{x.category}</span>
                  <span className="sg-tr-m">
                    <b>{x.metrics[0].value}</b> <small>{x.metrics[0].label}</small>
                  </span>
                  <span className="sg-dim">{x.year}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="sg-inspect" leds label={`Inspect · svc/${s.slug}`} aside={s.index}>
          <Dots key={s.slug} text={s.metrics[0].value} count className="sg-inspect-v" />
          <Spark seedN={systems.indexOf(s) + 2} className="sg-inspect-spark" />
          <span className="sg-k">{s.metrics[0].label}</span>
          <p className="sg-inspect-p">{s.promise}</p>
          <div className="sg-leaders">
            {s.metrics.slice(1).map((m) => (
              <Leader key={m.label} k={m.label} v={m.value} />
            ))}
          </div>
          <div className="sg-tags">
            {s.stack.map((t) => (
              <span key={t} className="sg-tag">
                {t}
              </span>
            ))}
          </div>
          <Link className="sg-btn sg-btn-inv" href={`/systems/${s.slug}`}>
            Open runbook <Icon name="arrow" />
          </Link>
        </Panel>
      </div>
      <Footer />
    </div>
  );
}

function Sec({ n, k, title, children, id }: { n: number; k: string; title?: string; children: React.ReactNode; id: string }) {
  return (
    <InView className="sg-sec">
      <section id={id} aria-labelledby={`${id}-h`}>
        <div className="sg-sec-h">
          <span className="sg-sec-n">§{pad(n)}</span>
          <span className="sg-chip sg-chip-inv">
            <Leds n={1} /> {k}
          </span>
          <Ruler n={40} />
        </div>
        {title ? (
          <h2 className="sg-sec-t" id={`${id}-h`}>
            {title}
          </h2>
        ) : (
          <h2 className="sg-vh" id={`${id}-h`}>
            {k}
          </h2>
        )}
        {children}
      </section>
    </InView>
  );
}

export function ServiceCase({ slug }: { slug: string }) {
  const s = getSystem(slug);
  if (!s) return <Missing path={`/systems/${slug}`} />;
  const next = getNextSystem(s.slug);
  const prev = systems[(systems.findIndex((x) => x.slug === s.slug) + systems.length - 1) % systems.length];
  let n = 0;
  const toc = [
    ["situation", "Situation"],
    ["constraints", "Constraints"],
    ["topology", "Topology"],
    ["hard-part", "Hard part"],
    s.broke ? ["incident", "Incident"] : null,
    s.flaws?.length ? ["known-issues", "Known issues"] : null,
    s.differently.length ? ["next", "Next iteration"] : null,
    ["telemetry", "Telemetry"],
  ].filter(Boolean) as string[][];

  return (
    <div className="sg-page sg-case">
      <header className="sg-head sg-case-head">
        <nav className="sg-crumbs" aria-label="Breadcrumb">
          <Link href="/systems">Services</Link>
          <span>/</span>
          <span>{s.index}</span>
          <span>/</span>
          <span aria-current="page">{s.slug}</span>
        </nav>
        <div className="sg-case-meta">
          <span className="sg-chip">
            <i className="sg-pulse" /> Runbook
          </span>
          <span className="sg-chip">{s.category}</span>
          <span className="sg-chip">{s.year}</span>
        </div>
        <Glitch text={s.title} />
        <p className="sg-case-promise">{s.promise}</p>
        <p className="sg-lede">{s.summary}</p>
        <div className="sg-case-own">
          <Leader k="Owner role" v={s.role} />
          <Leader k="Stack" v={s.stack.join(" · ")} />
        </div>
      </header>

      <div className="sg-kpis sg-kpis-4">
        {s.metrics.map((m, i) => (
          <div className="sg-kpi" key={m.label} style={{ animationDelay: `${i * 70}ms` }}>
            <span className="sg-k">
              <span>{pad(i + 1)}</span> {m.label}
            </span>
            <b className="sg-doto">{m.value}</b>
            <span className="sg-kpi-src">{m.note ?? " "}</span>
          </div>
        ))}
      </div>

      <div className="sg-case-body">
        <aside className="sg-toc" aria-label="Runbook sections">
          <span className="sg-k">Runbook</span>
          <ol>
            {toc.map(([id, l], i) => (
              <li key={id}>
                <a href={`#${id}`}>
                  <span className="sg-dim">§{pad(i + 1)}</span> {l}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <div className="sg-case-main">
          <Sec n={++n} k="Situation" id="situation">
            <div className="sg-prose">
              {s.problem.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Sec>

          <Sec n={++n} k="Constraints" id="constraints">
            <ul className="sg-checks">
              {s.constraints.map((c, i) => (
                <li key={c}>
                  <span className="sg-acc">[C{pad(i + 1)}]</span> {c}
                </li>
              ))}
            </ul>
          </Sec>

          <Sec n={++n} k="Topology" id="topology">
            <ol className="sg-topo" style={{ "--sg-n": s.architecture.length } as CSSProperties}>
              {s.architecture.map((a, i) => (
                <li key={a.label} style={{ "--i": i } as CSSProperties}>
                  <span className="sg-dim">N{pad(i + 1)}</span>
                  <b>{a.label}</b>
                  <span>{a.detail}</span>
                </li>
              ))}
            </ol>
            <div className="sg-tags sg-rail-tags">
              {s.rail.map((r) => (
                <span key={r} className="sg-tag">
                  {r}
                </span>
              ))}
            </div>
            <Panel className="sg-schematic" label="Schematic" aside={`svc/${s.slug}`}>
              <div className="sg-art" data-kind={s.artifact}>
                <SystemArtifact kind={s.artifact} />
              </div>
            </Panel>
            {s.pager ? (
              <div className="sg-pager" role="note">
                <span className="sg-chip sg-chip-inv">Pager</span>
                <p>{s.pager}</p>
              </div>
            ) : null}
          </Sec>

          <Sec n={++n} k="Hard part" id="hard-part">
            <div className="sg-cards">
              {s.hardPart.map((h, i) => (
                <article key={h.title} className="sg-card">
                  <span className="sg-dim">H{pad(i + 1)}</span>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </article>
              ))}
            </div>
          </Sec>

          {s.broke ? (
            <Sec n={++n} k="Incident" id="incident">
              <article className="sg-incident">
                <div className="sg-incident-h">
                  <span className="sg-chip sg-chip-alert">INC-{s.index}</span>
                  <span className="sg-k">Postmortem · what broke</span>
                </div>
                <h3>{s.broke.title}</h3>
                <p>{s.broke.body}</p>
              </article>
            </Sec>
          ) : null}

          {s.flaws?.length ? (
            <Sec n={++n} k="Known issues" id="known-issues">
              <ul className="sg-issues">
                {s.flaws.map((f, i) => (
                  <li key={f.title}>
                    <span className="sg-chip">KI-{pad(i + 1)}</span>
                    <div>
                      <h3>{f.title}</h3>
                      <p>{f.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Sec>
          ) : null}

          {s.differently.length ? (
            <Sec n={++n} k="Next iteration" id="next">
              <ul className="sg-checks">
                {s.differently.map((d) => (
                  <li key={d}>
                    <span className="sg-acc">[ ]</span> {d}
                  </li>
                ))}
              </ul>
            </Sec>
          ) : null}

          <Sec n={++n} k="Telemetry" id="telemetry">
            <div className="sg-telemetry">
              {s.receipts.map((r) => (
                <div key={r.label} className="sg-tele">
                  <Leader k={r.label} v={<Dots text={r.value} />} />
                  <span className="sg-dim">{r.detail}</span>
                </div>
              ))}
            </div>
            <div className="sg-proves">
              <span className="sg-k">Proves</span>
              <div className="sg-tags">
                {s.proves.map((p) => (
                  <span key={p} className="sg-tag on">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </Sec>

          <nav className="sg-pn" aria-label="More services">
            <Link href={`/systems/${prev.slug}`}>
              <span className="sg-k">‹ Prev service</span>
              <b>{prev.title}</b>
            </Link>
            <Link href={`/systems/${next.slug}`} className="sg-pn-next">
              <span className="sg-k">Next service ›</span>
              <b>{next.title}</b>
            </Link>
          </nav>
        </div>
      </div>
      <Footer />
    </div>
  );
}
