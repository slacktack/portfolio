"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import {
  currently,
  getNextNote,
  getNextSystem,
  labItems,
  notes,
  principles,
  profile,
  projects,
  stage,
  systems,
  timeline,
  type Note,
  type SystemCase,
} from "@/lib/site";
import { Spark } from "./charts";
import { fmt, onWatch, opFor, ops, pct, totalVolume } from "./data";

function Head({
  k,
  title,
  lede,
  aside,
}: {
  k: string;
  title: ReactNode;
  lede: string;
  aside?: ReactNode;
}) {
  return (
    <header className="rt-page-head rt-r">
      <div>
        <p className="rt-kick">{k}</p>
        <h1>{title}</h1>
        <p className="rt-lede">{lede}</p>
      </div>
      {aside && <div className="rt-page-aside">{aside}</div>}
    </header>
  );
}

export function SystemsView() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "healthy" | "watch">("all");
  const list = useMemo(
    () =>
      ops.filter((o) => {
        const hit = `${o.name} ${o.code} ${o.slug}`.toLowerCase().includes(q.toLowerCase());
        const health = filter === "all" || (filter === "healthy" ? !onWatch(o) : onWatch(o));
        return hit && health;
      }),
    [q, filter],
  );
  return (
    <div className="rt-page">
      <Head
        k="02 / Systems"
        title={<>Eleven surfaces. <em>One contract.</em></>}
        lede="Comparison engines, pipelines, and platforms running in production. Every number below is a real readout, mapped onto this dashboard."
        aside={
          <div className="rt-head-stats">
            <div><span className="rt-k">Total POS</span><b>{String(systems.length).padStart(2, "0")}</b></div>
            <div><span className="rt-k">Requests / day</span><b>{(totalVolume / 1000).toFixed(2)}M</b></div>
            <div><span className="rt-k">p99</span><b>20ms</b></div>
          </div>
        }
      />
      <div className="rt-toolbar rt-r">
        <div className="rt-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Filter systems, POS codes, slugs…"
            aria-label="Filter systems"
          />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear filter">×</button>}
        </div>
        <div className="rt-seg">
          {(["all", "healthy", "watch"] as const).map((f) => (
            <button key={f} type="button" className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "healthy" ? "Healthy" : "Watchlist"}
            </button>
          ))}
        </div>
        <span className="rt-chip">{list.length} shown</span>
      </div>
      <div className="rt-table-wrap rt-r">
        <table className="rt-table">
          <thead>
            <tr>
              <th>POS</th>
              <th>System</th>
              <th>Category</th>
              <th>Trend</th>
              <th>Success</th>
              <th>Volume</th>
              <th>Errors</th>
              <th>Delay</th>
              <th aria-label="Open" />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.slug}>
                <td><span className="rt-k">{o.code}</span></td>
                <td>
                  <Link href={`/systems/${o.slug}`} className="rt-table-name">
                    <span className={`rt-status-dot ${onWatch(o) ? "warn" : "ok"}`} />
                    {o.name}
                  </Link>
                </td>
                <td>{systems.find((s) => s.slug === o.slug)?.category}</td>
                <td className="rt-table-spark"><Spark data={o.spark} color={onWatch(o) ? "var(--r-orange)" : "var(--r-blue)"} height={26} /></td>
                <td>
                  <div className="rt-table-rate">
                    <b>{pct(o.success)}</b>
                    <div className="rt-bar"><i className="fill green" style={{ width: `${o.success}%` }} /></div>
                  </div>
                </td>
                <td>{fmt(o.volume)}K</td>
                <td>{pct(o.errors)}</td>
                <td>{o.delay}ms</td>
                <td><Link href={`/systems/${o.slug}`} className="rt-arrow">→</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="rt-empty">No systems match “{q}”. Clear the filter or try another POS code.</p>}
      </div>
      <p className="rt-foot-note rt-r">
        <span className="rt-live-dot" /> Readout window · last 24h · synthetic dashboard metrics mapped to real shipped systems.
      </p>
    </div>
  );
}

export function SystemView({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  const op = opFor(s.slug);
  return (
    <article className="rt-page rt-case">
      <nav className="rt-crumbs rt-r" aria-label="Breadcrumb">
        <Link href="/systems">Systems</Link>
        <span>/</span>
        <span>{s.index}</span>
      </nav>
      <header className="rt-case-head rt-r">
        <div>
          <p className="rt-kick">{s.index} · {s.category} · {s.year}</p>
          <h1>{s.title}</h1>
          <p className="rt-case-promise">{s.promise}</p>
          <p className="rt-lede">{s.summary}</p>
          <div className="rt-chips">
            <span className="rt-chip">{s.role}</span>
            {s.stack.map((t) => <span className="rt-chip" key={t}>{t}</span>)}
          </div>
        </div>
        <div className="rt-case-status">
          <span className="rt-k">Live readout</span>
          <span className="rt-chip ok"><i /> operational</span>
          <dl>
            <div><dt>Success</dt><dd>{pct(op.success)}</dd></div>
            <div><dt>Delay</dt><dd>{op.delay}ms</dd></div>
            <div><dt>Volume</dt><dd>{fmt(op.volume)}K/day</dd></div>
          </dl>
          <Spark data={op.spark} color="var(--r-blue)" height={54} />
        </div>
      </header>

      <section className="rt-metrics rt-r">
        {s.metrics.map((m, i) => (
          <div className="rt-metric" key={m.label} style={{ "--i": i } as CSSProperties}>
            <span className="rt-k">{m.label}</span>
            <b>{m.value}</b>
            {m.note && <span>{m.note}</span>}
          </div>
        ))}
      </section>

      <div className="rt-case-grid">
        <section className="rt-panel rt-r">
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Context</span><h2>The problem</h2></div></header>
          <div className="rt-prose">
            {s.problem.map((p) => <p key={p}>{p}</p>)}
          </div>
        </section>
        <section className="rt-panel rt-r" style={{ "--i": 1 } as CSSProperties}>
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Guardrails</span><h2>Constraints</h2></div></header>
          <ul className="rt-checks">
            {s.constraints.map((c) => <li key={c}><i>✓</i>{c}</li>)}
          </ul>
        </section>
      </div>

      <section className="rt-panel rt-r">
        <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Topology</span><h2>Architecture</h2></div><span className="rt-chip">{s.architecture.length} hops</span></header>
        <ol className="rt-flow">
          {s.architecture.map((a, i) => (
            <li key={a.label} style={{ "--i": i } as CSSProperties}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{a.label}</b>
              <small>{a.detail}</small>
            </li>
          ))}
        </ol>
        <div className="rt-rail">
          {s.rail.map((r) => <span key={r}><i />{r}</span>)}
        </div>
      </section>

      <section className="rt-panel rt-r">
        <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Detail</span><h2>The hard part</h2></div></header>
        <div className="rt-hard-grid">
          {s.hardPart.map((h) => (
            <div className="rt-hard" key={h.title}>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {(s.broke || s.flaws?.length) && (
        <div className="rt-case-grid">
          {s.broke && (
            <section className="rt-panel rt-r">
              <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Incident</span><h2>What broke</h2></div></header>
              <div className="rt-hard crit"><h3>{s.broke.title}</h3><p>{s.broke.body}</p></div>
            </section>
          )}
          {s.flaws?.length ? (
            <section className="rt-panel rt-r">
              <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Honesty</span><h2>Known flaws</h2></div></header>
              {s.flaws.map((f) => <div className="rt-hard" key={f.title}><h3>{f.title}</h3><p>{f.body}</p></div>)}
            </section>
          ) : null}
        </div>
      )}

      <div className="rt-case-grid">
        <section className="rt-panel rt-r">
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Takeaways</span><h2>What it proves</h2></div></header>
          <ul className="rt-checks">{s.proves.map((p) => <li key={p}><i>→</i>{p}</li>)}</ul>
          <header className="rt-ph sub"><div className="rt-ph-t"><h2>Differently</h2></div></header>
          <ul className="rt-checks">{s.differently.map((p) => <li key={p}><i>↺</i>{p}</li>)}</ul>
        </section>
        <section className="rt-panel rt-r">
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Numbers</span><h2>Receipts</h2></div></header>
          <dl className="rt-receipts">
            {s.receipts.map((r) => (
              <div key={r.label}>
                <dt>{r.label}</dt>
                <dd><b>{r.value}</b><span>{r.detail}</span></dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <Link href={`/systems/${next.slug}`} className="rt-next rt-r">
        <span className="rt-k">Next system · {next.index}</span>
        <b>{next.title}</b>
        <span>{next.promise}</span>
        <em>→</em>
      </Link>
    </article>
  );
}

export function ProjectsView() {
  return (
    <div className="rt-page">
      <Head
        k="03 / Projects"
        title={<>Shipped, hosted, <em>breathing.</em></>}
        lede="After-hours builds that run like production: live data, graceful degradation, and a bottom nav built for one thumb."
        aside={<div className="rt-head-stats"><div><span className="rt-k">Shipped</span><b>{projects.length}</b></div><div><span className="rt-k">Live feeds</span><b>03</b></div><div><span className="rt-k">Status</span><b className="rt-ok">online</b></div></div>}
      />
      <div className="rt-project-grid">
        {projects.map((p, i) => (
          <article className="rt-project rt-r" key={p.slug} style={{ "--i": i } as CSSProperties}>
            <div className="rt-project-media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={`${p.title} interface`} loading="lazy" />
              <span className="rt-project-chip">{p.highlight}</span>
            </div>
            <div className="rt-project-b">
              <div className="rt-project-meta"><span className="rt-k">{p.year}</span><span className="rt-k">{p.category}</span></div>
              <h2>{p.title}</h2>
              <p className="rt-project-tag">{p.tagline}</p>
              <p>{p.description}</p>
              <div className="rt-chips">{p.stack.map((t) => <span className="rt-chip" key={t}>{t}</span>)}</div>
              <div className="rt-project-foot">
                <a href={p.live} target="_blank" rel="noreferrer" className="rt-btn small primary">Open live ↗</a>
                <span className="rt-k">{p.note}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <section className="rt-panel rt-r rt-stage">
        <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Surfaces</span><h2>Live product screens</h2></div><span className="rt-chip ok"><i /> recording</span></header>
        <ul>
          {stage.map((s, i) => (
            <li key={s.slug} style={{ "--i": i } as CSSProperties}>
              <span className="rt-k">{String(i + 1).padStart(2, "0")} · {s.tag}</span>
              <b>{s.title}</b>
              <p>{s.tagline}</p>
              <a href={s.href} target="_blank" rel="noreferrer">Visit ↗</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const DEMOS: Record<string, () => ReactNode> = {
  "cache-key": () => <CacheKeyLab />,
  deadlines: () => <DeadlineLab />,
  identity: () => <IdentityLab />,
  logs: () => <LogStreamLab />,
  memcached: () => <MemcachedLab />,
  "load-balancer": () => <LoadBalancerDemo />,
};

export function LabView() {
  return (
    <div className="rt-page">
      <Head
        k="04 / Lab"
        title={<>Mechanisms, <em>small enough to break.</em></>}
        lede="The systems rebuilt as simulations you can poke. Every demo runs in the browser; every simulation is labelled as one."
        aside={<div className="rt-head-stats"><div><span className="rt-k">Experiments</span><b>{labItems.length}</b></div><div><span className="rt-k">Runtime</span><b>client</b></div><div><span className="rt-k">Mocked</span><b className="rt-warn">yes</b></div></div>}
      />
      <nav className="rt-lab-nav rt-r" aria-label="Experiments">
        {labItems.map((l, i) => (
          <a key={l.slug} href={`#${l.slug}`}>
            <span className="rt-k">{String(i + 1).padStart(2, "0")}</span>
            {l.title}
          </a>
        ))}
      </nav>
      {labItems.map((l, i) => (
        <section key={l.slug} id={l.slug} className="rt-panel rt-bench rt-r" style={{ "--i": i % 3 } as CSSProperties}>
          <header className="rt-ph">
            <div className="rt-ph-t"><span className="rt-k">{String(i + 1).padStart(2, "0")} · {l.year}</span><h2>{l.title}</h2></div>
            <span className="rt-chip warn">simulation</span>
          </header>
          <p className="rt-bench-d">{l.detail}</p>
          <div className="rt-bench-demo">{DEMOS[l.slug] ? DEMOS[l.slug]() : <p className="rt-empty">No browser demo for this one yet.</p>}</div>
        </section>
      ))}
    </div>
  );
}

export function NotesView() {
  return (
    <div className="rt-page">
      <Head
        k="05 / Notes"
        title={<>Field notes from <em>the hot path.</em></>}
        lede="Latency, cost, calibration, quotas. Lessons written down while the graphs were still moving."
        aside={<div className="rt-head-stats"><div><span className="rt-k">Filed</span><b>{notes.length}</b></div><div><span className="rt-k">Topics</span><b>03</b></div><div><span className="rt-k">Status</span><b className="rt-ok">publishing</b></div></div>}
      />
      <ol className="rt-notes">
        {notes.map((n, i) => (
          <li key={n.slug} className="rt-r" style={{ "--i": i } as CSSProperties}>
            <Link href={`/notes/${n.slug}`} className="rt-note-row">
              <span className="rt-note-no">{String(i + 1).padStart(2, "0")}</span>
              <span className="rt-note-meta"><b>{n.date}</b><small>{n.readTime}</small></span>
              <span className="rt-note-c">
                <small>{n.category}</small>
                <strong>{n.title}</strong>
                <span>{n.dek}</span>
              </span>
              <span className="rt-arrow">→</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NoteView({ n }: { n: Note }) {
  const next = getNextNote(n.slug);
  return (
    <article className="rt-page rt-note">
      <nav className="rt-crumbs rt-r"><Link href="/notes">Notes</Link><span>/</span><span>{n.category}</span></nav>
      <header className="rt-note-head rt-r">
        <p className="rt-kick">{n.date} · {n.readTime} · {n.category}</p>
        <h1>{n.title}</h1>
        <p className="rt-lede">{n.dek}</p>
      </header>
      <div className="rt-note-grid">
        <aside className="rt-note-aside rt-r">
          <span className="rt-k">In this note</span>
          {n.sections.map((s, i) => <span key={i}>{String(i + 1).padStart(2, "0")} · {s.heading ?? "Opening"}</span>)}
          <Link href="/notes" className="rt-link">← All notes</Link>
        </aside>
        <div className="rt-note-b">
          {n.sections.map((s, i) => (
            <section key={i} className="rt-r" style={{ "--i": Math.min(i, 3) } as CSSProperties}>
              {s.heading && <h2>{s.heading}</h2>}
              {s.body.map((p) => <p key={p}>{p}</p>)}
              {s.quote && <blockquote>{s.quote}</blockquote>}
              {s.list && <ul className="rt-checks">{s.list.map((x) => <li key={x}><i>→</i>{x}</li>)}</ul>}
              {s.code && <pre><code>{s.code}</code></pre>}
            </section>
          ))}
        </div>
      </div>
      <Link href={`/notes/${next.slug}`} className="rt-next rt-r">
        <span className="rt-k">Next note · {next.readTime}</span>
        <b>{next.title}</b>
        <span>{next.dek}</span>
        <em>→</em>
      </Link>
    </article>
  );
}

export function AboutView() {
  return (
    <div className="rt-page">
      <Head
        k={`06 / About · ${profile.location}`}
        title={<>{profile.name}. <em>{profile.tagline}</em></>}
        lede={profile.description}
        aside={<div className="rt-head-stats"><div><span className="rt-k">Status</span><b className="rt-ok">available</b></div><div><span className="rt-k">Timezone</span><b>UTC+5:30</b></div><div><span className="rt-k">Focus</span><b>backend</b></div></div>}
      />
      <div className="rt-about-grid">
        <section className="rt-panel rt-r">
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">History</span><h2>Timeline</h2></div></header>
          <ol className="rt-timeline">
            {timeline.map((t) => (
              <li key={t.title}>
                <span className="rt-k">{t.year}</span>
                <div><h3>{t.title}</h3><p>{t.body}</p></div>
              </li>
            ))}
          </ol>
        </section>
        <section className="rt-panel rt-r" style={{ "--i": 1 } as CSSProperties}>
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Operating rules</span><h2>Principles</h2></div></header>
          <div className="rt-principles">
            {principles.map((p) => (
              <div key={p.num}>
                <span className="rt-princ-num">{p.num}</span>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="rt-about-grid">
        <section className="rt-panel rt-r">
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Telemetry</span><h2>Right now</h2></div><span className="rt-chip ok"><i /> live</span></header>
          <dl className="rt-now-list">
            {currently.map((c) => <div key={c.label}><dt>{c.label}</dt><dd>{c.value}</dd></div>)}
          </dl>
        </section>
        <section className="rt-panel rt-r rt-contact-panel" style={{ "--i": 1 } as CSSProperties}>
          <header className="rt-ph"><div className="rt-ph-t"><span className="rt-k">Signal</span><h2>Open channel</h2></div></header>
          <p className="rt-contact-k">{profile.availability} · {profile.availabilityDetail}</p>
          <a href={`mailto:${profile.email}`} className="rt-contact-mail">{profile.email}</a>
          <div className="rt-contact-actions">
            <a href={`mailto:${profile.email}`} className="rt-btn primary">Say hello</a>
            <a href={profile.socials[0]?.href ?? `mailto:${profile.email}`} className="rt-btn">Email client</a>
          </div>
        </section>
      </div>
    </div>
  );
}

export function MissingView({ path }: { path: string }) {
  return (
    <div className="rt-page rt-missing">
      <div className="rt-404 rt-r" aria-hidden="true">404</div>
      <p className="rt-kick rt-r">Route not found · {path}</p>
      <h1 className="rt-r">Endpoint missing.</h1>
      <p className="rt-lede rt-r">This route is not in the registry. Check the path, or fall back to the overview.</p>
      <div className="rt-hero-actions rt-r">
        <Link href="/" className="rt-btn primary">Back to overview</Link>
        <Link href="/systems" className="rt-btn">Browse systems</Link>
      </div>
      <div className="rt-missing-log rt-r">
        <p><b>GET</b> {path} <span className="rt-warn">404</span></p>
        <p><b>trace</b> router.match · no handler registered</p>
        <p><b>hint</b> try /, /systems, /projects, /lab, /notes, /about</p>
      </div>
    </div>
  );
}
