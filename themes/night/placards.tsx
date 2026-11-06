"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { ThemeTeaser } from "@/components/theme-palette";
import {
  currently,
  getNextNote,
  getNextSystem,
  getNote,
  getProject,
  getSystem,
  labItems,
  marqueeMetrics,
  notes,
  principles,
  profile,
  projects,
  systems,
  timeline,
  type SystemCase,
} from "@/lib/site";
import { labSystem, stageBy, type Cat } from "./data";
import type { Exhibit } from "./figures";

const st = (i: number) => ({ "--nt-i": i }) as CSSProperties;

function Labels({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="nt-labels">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Head({ code, title, lede, rows }: { code: string; title: string; lede?: string; rows?: [string, ReactNode][] }) {
  return (
    <header className="nt-ph">
      <p className="nt-acc">{code}</p>
      <h1 className="nt-pt">{title}</h1>
      {lede && <p className="nt-lede">{lede}</p>}
      {rows && <Labels rows={rows} />}
      <hr className="nt-rule" />
    </header>
  );
}

function Jump({ items }: { items: [string, string][] }) {
  return (
    <nav className="nt-jump" aria-label="On this placard">
      {items.map(([id, label], i) => (
        <button key={id} type="button" style={st(i)} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })}>
          <i>{String(i + 1).padStart(2, "0")}</i>
          {label}
        </button>
      ))}
    </nav>
  );
}

function Sec({ id, k, children }: { id: string; k: string; children: ReactNode }) {
  return (
    <section className="nt-sec" id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="nt-sec-h">
        {k}
      </h2>
      {children}
    </section>
  );
}

function SystemPlacard({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  const idx: [string, string][] = [
    ["nt-problem", "Problem"],
    ["nt-constraints", "Constraints"],
    ["nt-arch", "Architecture"],
    ["nt-hard", "Hard part"],
  ];
  if (s.broke) idx.push(["nt-broke", "What broke"]);
  if (s.flaws?.length) idx.push(["nt-flaws", "Flaws"]);
  idx.push(["nt-diff", "Differently"], ["nt-receipts", "Receipts"]);
  return (
    <article className="nt-plac">
      <Head
        code={`SYS·${s.index} · ${s.category}`}
        title={s.title}
        lede={s.promise}
        rows={[
          ["Year", s.year],
          ["Role", s.role],
          ["Stack", s.stack.join(" · ")],
        ]}
      />
      <div className="nt-pbody">
        <Jump items={idx} />
        <div className="nt-pcol">
          <p className="nt-summary">{s.summary}</p>
          <Sec id="nt-problem" k="The problem">
            {s.problem.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </Sec>
          <Sec id="nt-constraints" k="Constraints">
            <ol className="nt-ticks">
              {s.constraints.map((c, i) => (
                <li key={c} style={st(i)}>
                  {c}
                </li>
              ))}
            </ol>
          </Sec>
          <Sec id="nt-arch" k="Architecture">
            <ol className="nt-path">
              {s.architecture.map((a, i) => (
                <li key={a.label} style={st(i)}>
                  <b>{a.label}</b>
                  <span>{a.detail}</span>
                </li>
              ))}
            </ol>
            <ul className="nt-chips">
              {s.rail.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </Sec>
          <Sec id="nt-hard" k="The hard part">
            <div className="nt-hard">
              {s.hardPart.map((h, i) => (
                <div key={h.title} style={st(i)}>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </div>
              ))}
            </div>
          </Sec>
          {s.broke && (
            <Sec id="nt-broke" k="What broke">
              <div className="nt-broke">
                <h3>{s.broke.title}</h3>
                <p>{s.broke.body}</p>
              </div>
            </Sec>
          )}
          {s.flaws?.length ? (
            <Sec id="nt-flaws" k="Known flaws">
              <div className="nt-hard">
                {s.flaws.map((f, i) => (
                  <div key={f.title} style={st(i)}>
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </div>
                ))}
              </div>
            </Sec>
          ) : null}
          <Sec id="nt-diff" k="What I would do differently">
            <ul className="nt-ticks">
              {s.differently.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="nt-k">What it proves</p>
            <ul className="nt-chips">
              {s.proves.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </Sec>
          <Sec id="nt-receipts" k="Receipts">
            <table className="nt-receipts">
              <tbody>
                {s.receipts.map((r) => (
                  <tr key={r.label}>
                    <th scope="row">{r.label}</th>
                    <td>
                      <b>{r.value}</b>
                      <span>{r.detail}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Sec>
          <Link className="nt-next" href={`/systems/${next.slug}`}>
            <span>Next exhibit · SYS·{next.index}</span>
            <b>{next.title}</b>
            <em>{next.promise}</em>
          </Link>
        </div>
      </div>
    </article>
  );
}

function ProjectPlacard({ slug, onPick }: { slug: string; onPick: (kind: "project" | "lab", slug: string) => void }) {
  const p = getProject(slug);
  if (!p) return null;
  const i = projects.indexOf(p);
  const next = projects[(i + 1) % projects.length];
  const reel = stageBy(p.slug);
  return (
    <article className="nt-plac">
      <Head
        code={`PRJ·${String(i + 1).padStart(2, "0")} · ${p.category}`}
        title={p.title}
        lede={p.tagline}
        rows={[
          ["Year", p.year],
          ["Signal", p.highlight],
          ["Stack", p.stack.join(" · ")],
        ]}
      />
      <div className="nt-pcol nt-pcol-solo">
        <p className="nt-summary">{p.description}</p>
        <p>{p.note}</p>
        <div className="nt-acts">
          <a className="nt-btn nt-btn-hot" href={p.live} target="_blank" rel="noreferrer">
            Open the live site <span aria-hidden="true">↗</span>
          </a>
          {reel && reel.href !== p.live && (
            <a className="nt-btn" href={reel.href} target="_blank" rel="noreferrer">
              Live link <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <button type="button" className="nt-next" onClick={() => onPick("project", next.slug)}>
          <span>Next on the wall · project</span>
          <b>{next.title}</b>
          <em>{next.tagline}</em>
        </button>
      </div>
    </article>
  );
}

const labCopy: Record<string, { k: string; t: string; note: string }> = {
  "cache-key": { k: "Flights · cache design", t: "Change one thing. Watch the cache decide.", note: "A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building." },
  deadlines: { k: "Hotels · stragglers", t: "Average latency is a liar.", note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline." },
  identity: { k: "Hotels · identity", t: "Same name is not the same hotel.", note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else." },
  logs: { k: "Observability · alerting", t: "Silence is a signal.", note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice." },
  memcached: { k: "Systems · from scratch", t: "Memcached, rebuilt.", note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire." },
  "load-balancer": { k: "Build · Go load balancer", t: "Weighted routing you can break.", note: "A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo below runs the routing logic in your browser so you can kill a node and watch the next request fail over." },
  "vortex-vault": { k: "Build · VortexVault", t: "One vector database. Two runtimes.", note: "A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the same benchmark." },
};

function Demo({ slug }: { slug: string }) {
  if (slug === "cache-key") return <CacheKeyLab />;
  if (slug === "deadlines") return <DeadlineLab />;
  if (slug === "identity") return <IdentityLab />;
  if (slug === "logs") return <LogStreamLab />;
  if (slug === "memcached") return <MemcachedLab />;
  if (slug === "load-balancer") return <LoadBalancerDemo />;
  return null;
}

function LabPlacard({ slug, onPick }: { slug: string; onPick: (kind: "project" | "lab", slug: string) => void }) {
  const l = labItems.find((x) => x.slug === slug);
  if (!l) return null;
  const i = labItems.indexOf(l);
  const copy = labCopy[slug];
  const src = labSystem[slug];
  const next = labItems[(i + 1) % labItems.length];
  return (
    <article className="nt-plac">
      <Head code={`LAB·${String(i + 1).padStart(2, "0")} · ${copy?.k ?? l.detail}`} title={copy?.t ?? l.title} lede={copy?.note} rows={[["Instrument", l.title], ["Dated", l.year]]} />
      {slug === "vortex-vault" ? (
        <div className="nt-pcol nt-pcol-solo">
          <p className="nt-summary">Most vector database projects pick a language and inherit its assumptions. VortexVault implements the same engine twice — once in C++, once in Rust — behind a shared segment format and a shared benchmark harness.</p>
          <p>The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state. Keeping those semantics identical across two runtimes is the actual project.</p>
          <p>Still in progress. The benchmark reports latency, recall, and memory footprint for both implementations against the same workload.</p>
          <div className="nt-hard">
            <div>
              <h3>Shared format</h3>
              <p>Segments and manifests are written by both runtimes and read by either one.</p>
            </div>
            <div>
              <h3>Parity benchmark</h3>
              <p>The same vectors, queries, and recall target run through both engines.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="nt-bench" data-lab={slug}>
          <p className="nt-bench-k">
            <i aria-hidden="true" /> Live instrument · runs in your browser
          </p>
          <Demo slug={slug} />
          {slug === "load-balancer" && (
            <div className="nt-hard nt-hard-4">
              {[
                ["Weighted routing", "Each healthy node gets a share proportional to its weight. Set a weight to zero to drain it."],
                ["Health + circuit breaker", "Three failed checks open the circuit. Traffic stops landing on the node before users notice."],
                ["Sticky sessions", "When enabled, one client keeps landing on the same node until it disappears from the healthy set."],
                ["Observability", "Per-node request counts, shares, health state, and combined weight stay visible while the system changes."],
              ].map(([t, b]) => (
                <div key={t}>
                  <h3>{t}</h3>
                  <p>{b}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="nt-pcol nt-pcol-solo">
        {src && (
          <Link className="nt-btn" href={`/systems/${src.slug}`}>
            From the exhibit it came from · {src.title} <span aria-hidden="true">→</span>
          </Link>
        )}
        <button type="button" className="nt-next" onClick={() => onPick("lab", next.slug)}>
          <span>Next instrument</span>
          <b>{next.title}</b>
          <em>{next.detail}</em>
        </button>
      </div>
    </article>
  );
}

function NotePlacard({ slug }: { slug: string }) {
  const n = getNote(slug);
  if (!n) return null;
  const next = getNextNote(slug);
  return (
    <article className="nt-plac nt-reader">
      <Head code={`Reading room · ${n.category}`} title={n.title} lede={n.dek} rows={[["Dated", n.date], ["Read", n.readTime], ["Parts", String(n.sections.length)]]} />
      <div className="nt-pcol nt-pcol-solo nt-prose">
        {n.sections.map((sec, i) => (
          <section key={i} id={`nt-part-${i}`} data-part={i} className="nt-part">
            {sec.heading && <h2>{sec.heading}</h2>}
            {sec.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
            {sec.quote && <blockquote>{sec.quote}</blockquote>}
            {sec.list && (
              <ul className="nt-ticks">
                {sec.list.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            {sec.code && (
              <pre className="nt-code">
                <code>{sec.code}</code>
              </pre>
            )}
          </section>
        ))}
        <Link className="nt-next" href={`/notes/${next.slug}`}>
          <span>Next in the reading room</span>
          <b>{next.title}</b>
          <em>{next.dek}</em>
        </Link>
      </div>
    </article>
  );
}

function CuratorPlacard() {
  return (
    <article className="nt-plac">
      <Head code="The curator card" title={profile.name} lede={profile.description} rows={[["Role", profile.role], ["Based", profile.location], ["Open to", profile.availabilityDetail]]} />
      <div className="nt-pbody">
        <Jump items={[["nt-tl", "Timeline"], ["nt-pr", "House rules"], ["nt-now", "Currently"], ["nt-write", "Write"]]} />
        <div className="nt-pcol">
          <Sec id="nt-tl" k="Timeline">
            <ol className="nt-tl">
              {timeline.map((t, i) => (
                <li key={t.title} style={st(i)}>
                  <span>{t.year}</span>
                  <b>{t.title}</b>
                  <p>{t.body}</p>
                </li>
              ))}
            </ol>
          </Sec>
          <Sec id="nt-pr" k="House rules">
            <div className="nt-hard">
              {principles.map((p, i) => (
                <div key={p.num} style={st(i)}>
                  <h3>
                    <i>{p.num}</i> {p.title}
                  </h3>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>
          </Sec>
          <Sec id="nt-now" k="Currently">
            <Labels rows={currently.map((c) => [c.label, c.value])} />
          </Sec>
          <Sec id="nt-write" k="Write to the curator">
            <div className="nt-write">
              <a className="nt-mail" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <CopyEmail email={profile.email} />
            </div>
          </Sec>
        </div>
      </div>
    </article>
  );
}

function MissingPlacard({ path }: { path: string }) {
  return (
    <article className="nt-plac">
      <Head code="Fig. 404 · not in the collection" title="This plinth is empty." lede={`The night watch walked the whole building looking for ${path}. Nothing hangs here. The rest of the collection is still lit.`} />
      <div className="nt-pcol nt-pcol-solo">
        <div className="nt-acts">
          <Link className="nt-btn nt-btn-hot" href="/">
            Back to the machine <span aria-hidden="true">→</span>
          </Link>
          <Link className="nt-btn" href="/systems">
            Systems wing
          </Link>
          <Link className="nt-btn" href="/notes">
            Reading room
          </Link>
        </div>
      </div>
    </article>
  );
}

export function Placard({ ex, onPick }: { ex: Exhibit; onPick: (kind: "project" | "lab", slug: string) => void }) {
  if (ex.type === "system") {
    const s = getSystem(ex.slug);
    return s ? <SystemPlacard s={s} /> : null;
  }
  if (ex.type === "project") return <ProjectPlacard slug={ex.slug} onPick={onPick} />;
  if (ex.type === "lab") return <LabPlacard slug={ex.slug} onPick={onPick} />;
  if (ex.type === "note") return <NotePlacard slug={ex.slug} />;
  if (ex.type === "curator") return <CuratorPlacard />;
  return <MissingPlacard path={ex.path} />;
}

// Idle placard: the wing guide for whatever the catalogue is filtered to.
export function Guide({ cat, onPick }: { cat: Cat; onPick: (kind: "project" | "lab", slug: string) => void }) {
  if (cat === "systems")
    return (
      <article className="nt-plac nt-guide">
        <Head code={`Wing A · ${systems.length} exhibits`} title="Systems in production." lede="Comparison engines, pipelines and the plumbing under them. Each tile carries the headline number from its case. Pick one and the machine opens the case." />
        <ul className="nt-board">
          {systems.map((s, i) => (
            <li key={s.slug} style={st(i)}>
              <Link href={`/systems/${s.slug}`}>
                <span>SYS·{s.index}</span>
                <b>{s.metrics[0]?.value}</b>
                <small>{s.metrics[0]?.label}</small>
                <em>{s.title}</em>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    );
  if (cat === "projects")
    return (
      <article className="nt-plac nt-guide">
        <Head code={`Wing B · ${projects.length} works`} title="Built after hours." lede="Things nobody asked me to build. Each one is live; each one has a screen recording you can play on the machine." />
        <ul className="nt-sheet">
          {projects.map((p, i) => (
            <li key={p.slug} style={st(i)}>
              <button type="button" onClick={() => onPick("project", p.slug)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={stageBy(p.slug)?.poster ?? p.image} alt="" loading="lazy" decoding="async" />
                <b>{p.title}</b>
                <span>{p.highlight}</span>
              </button>
            </li>
          ))}
        </ul>
      </article>
    );
  if (cat === "lab")
    return (
      <article className="nt-plac nt-guide">
        <Head code={`Wing C · ${labItems.length} instruments`} title="Small systems, strange constraints." lede="The mechanisms from the systems wing, rebuilt small enough to hold in one hand and break on purpose. Every experiment runs in your browser. Simulations are labelled as simulations." />
        <ol className="nt-instr">
          {labItems.map((l, i) => (
            <li key={l.slug} style={st(i)}>
              <button type="button" onClick={() => onPick("lab", l.slug)}>
                <i>{String(i + 1).padStart(2, "0")}</i>
                <b>{l.title}</b>
                <span>{l.detail}</span>
                <small>{labSystem[l.slug]?.title ?? l.year}</small>
              </button>
            </li>
          ))}
        </ol>
      </article>
    );
  if (cat === "notes")
    return (
      <article className="nt-plac nt-guide">
        <Head code={`Reading room · ${notes.length} notes`} title="Field notes, read on the machine." lede="Long-form notes on latency, cost and the decisions behind the systems. Open one and the display turns into a reader." />
        <ul className="nt-shelf">
          {notes.map((n, i) => (
            <li key={n.slug} style={st(i)}>
              <Link href={`/notes/${n.slug}`}>
                <span>
                  {n.category} · {n.date} · {n.readTime}
                </span>
                <b>{n.title}</b>
                <em>{n.dek}</em>
              </Link>
            </li>
          ))}
        </ul>
      </article>
    );
  return (
    <article className="nt-plac nt-guide nt-home">
      <header className="nt-ph">
        <p className="nt-acc">Night shift · the gallery is closed, the machine is not</p>
        <h1 className="nt-pt nt-pt-xl">
          {profile.tagline.replace(/\.$/, "")}
          <em>, after hours.</em>
        </h1>
        <p className="nt-lede">{profile.description}</p>
      </header>
      <ul className="nt-ticker" aria-label="Measured in production">
        {marqueeMetrics.slice(0, 8).map((m, i) => (
          <li key={m} style={st(i)}>
            {m}
          </li>
        ))}
      </ul>
      <div className="nt-howto">
        <p className="nt-k">How the machine works</p>
        <ol>
          <li>Pick a work from the catalogue. The display obeys.</li>
          <li>Step through its figures with ← and →, or the transport keys.</li>
          <li>The case text lives on this placard. Scroll it here.</li>
        </ol>
      </div>
      <Labels rows={currently.map((c) => [c.label, c.value])} />
      <ThemeTeaser className="nt-teaser" />
    </article>
  );
}
