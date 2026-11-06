"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SystemArtifact } from "@/components/artifacts";
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
  getSystem,
  labItems,
  marqueeMetrics,
  notes,
  principles,
  profile,
  projects,
  stage,
  systems,
  timeline,
} from "@/lib/site";
import { Rule, Star, StationHead, stations, useNegative, useStars, STAR_TOTAL } from "./ui";

const pad = (i: number) => String(i + 1).padStart(2, "0");

export function Home() {
  const counts: Record<string, string> = {
    "01": "You are here",
    "02": `${systems.length} systems`,
    "03": `${stage.length + projects.length} works`,
    "04": `${labItems.length} experiments`,
    "05": `${notes.length} notes`,
    "06": "Contact",
  };
  return (
    <div className="on-home">
      <section className="on-hero">
        <div className="on-hero-glow" aria-hidden="true" />
        <div className="on-hero-top on-rv">
          <span>[ 01 / 06 ] · Arrival</span>
          <span>{profile.location}</span>
          <span>{profile.role}</span>
        </div>
        <h1 className="on-hero-title">
          <span className="on-line on-rv">
            <span>I build the</span>
          </span>
          <span className="on-line on-rv">
            <span className="on-foil">invisible</span>
          </span>
          <span className="on-line on-line-echo on-rv" aria-hidden="true">
            <span>invisible</span>
          </span>
          <span className="on-line on-rv">
            <span>
              layer<em className="on-serif">.</em>
            </span>
          </span>
        </h1>
        <div className="on-hero-foot on-rv">
          <p className="on-serif">{profile.description}</p>
          <div className="on-hero-meta">
            <span>{profile.name}</span>
            <span>{profile.availability}</span>
            <Link href="/systems" className="on-btn" data-cursor="02">
              Board at station 02 <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <Star id="arrival" className="on-star-hero" />
      </section>

      <div className="on-ticker" aria-label="Numbers from production">
        <div className="on-ticker-row">
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1 || undefined}>
              {marqueeMetrics.map((m) => (
                <span key={m}>
                  {m} <i>✦</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section className="on-board">
        <div className="on-board-head on-rv">
          <span className="on-k">Station index</span>
          <h2>
            Six stations, <em className="on-serif">one line.</em>
          </h2>
          <p>Ride it in order or step off anywhere. The rail at the bottom always knows where you are.</p>
        </div>
        <ol className="on-board-list">
          {stations.map((s) => (
            <li key={s.n} className="on-rv">
              <Link href={s.href} data-cursor={s.n} className="on-board-row">
                <b>{s.n}</b>
                <span className="on-board-name">{s.label}</span>
                <span className="on-board-line on-serif">{s.line}</span>
                <span className="on-board-count">{counts[s.n]}</span>
                <i aria-hidden="true">→</i>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="on-feature">
        <div className="on-board-head on-rv">
          <span className="on-k">Now departing · 02</span>
          <h2>
            Three systems <em className="on-serif">worth the ride.</em>
          </h2>
        </div>
        <div className="on-feature-grid">
          {systems.slice(0, 3).map((s) => (
            <Link key={s.slug} href={`/systems/${s.slug}`} className="on-feature-card on-rv" data-cursor="02">
              <span className="on-k">
                02.{s.index} · {s.category}
              </span>
              <b className="on-foil-num">{s.metrics[0]?.value}</b>
              <span className="on-feature-label">{s.metrics[0]?.label}</span>
              <h3>{s.title}</h3>
              <p className="on-serif">{s.promise}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="on-teaser on-rv">
        <ThemeTeaser />
      </section>
    </div>
  );
}

export function Systems() {
  const [hot, setHot] = useState(0);
  const s = systems[hot];
  return (
    <div className="on-systems">
      <StationHead
        n="02"
        label="Systems"
        title={
          <>
            Production work, <em className="on-serif">after dark.</em>
          </>
        }
        lede={`${systems.length} systems I built or carry at work. Each one opens as a long read: the problem, the constraints, the hard part, what broke and what I would change.`}
      />
      <div className="on-sys-split">
        <aside className="on-sys-big" aria-hidden="true">
          <span key={hot} className="on-sys-bignum on-foil">
            {s.index}
          </span>
          <span className="on-sys-bigcat">{s.category}</span>
          <span className="on-sys-bigmetric">
            <b>{s.metrics[0]?.value}</b> {s.metrics[0]?.label}
          </span>
          <Star id="systems" className="on-star-sys" />
        </aside>
        <ol className="on-sys-list">
          {systems.map((x, i) => (
            <li key={x.slug} className="on-rv">
              <Link
                href={`/systems/${x.slug}`}
                className="on-sys-row"
                data-cursor={`02.${x.index}`}
                data-hot={i === hot || undefined}
                onMouseEnter={() => setHot(i)}
                onFocus={() => setHot(i)}
              >
                <b>{x.index}</b>
                <span className="on-sys-title">{x.title}</span>
                <span className="on-sys-promise on-serif">{x.promise}</span>
                <span className="on-sys-tags">
                  <span>{x.category}</span>
                  <span>{x.year}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Margin({ n, children }: { n: number; children: ReactNode }) {
  return (
    <aside className="on-mnote on-rv">
      <b>{String(n).padStart(2, "0")}</b>
      <span>{children}</span>
    </aside>
  );
}

function Block({ k, title, children, notes: side }: { k: string; title: ReactNode; children: ReactNode; notes?: ReactNode }) {
  return (
    <section className="on-block">
      <div className="on-block-main">
        <Rule label={k} />
        <h2 className="on-block-title on-rv">{title}</h2>
        {children}
      </div>
      <div className="on-block-side">{side}</div>
    </section>
  );
}

export function System({ slug }: { slug: string }) {
  const s = getSystem(slug);
  if (!s) return <Missing />;
  const next = getNextSystem(slug);
  let m = 0;
  return (
    <article className="on-case">
      <header className="on-case-head">
        <Link href="/systems" className="on-back" data-cursor="02">
          ← Station 02 · Systems
        </Link>
        <span className="on-k on-rv">
          02.{s.index} / {String(systems.length).padStart(2, "0")} · {s.category} · {s.year}
        </span>
        <h1 className="on-case-title on-rv">{s.title}</h1>
        <p className="on-case-promise on-serif on-rv">{s.promise}</p>
        <dl className="on-case-metrics">
          {s.metrics.map((x) => (
            <div key={x.label} className="on-rv">
              <dt>{x.label}</dt>
              <dd className="on-foil">{x.value}</dd>
              {x.note ? <small>{x.note}</small> : null}
            </div>
          ))}
        </dl>
        <p className="on-case-role">
          {s.role} · {s.stack.join(" · ")}
        </p>
      </header>

      <div className="on-read">
        <p className="on-lead on-rv">{s.summary}</p>

        <Block
          k="I · The problem"
          title="What it had to do"
          notes={s.constraints.map((c) => (
            <Margin key={c} n={++m}>
              {c}
            </Margin>
          ))}
        >
          {s.problem.map((p) => (
            <p key={p} className="on-p on-rv">
              {p}
            </p>
          ))}
          <p className="on-p-note on-rv">The margin holds the constraints it had to live within.</p>
        </Block>

        <Block
          k="II · Architecture"
          title="How it is laid out"
          notes={s.rail.map((r) => (
            <Margin key={r} n={++m}>
              {r}
            </Margin>
          ))}
        >
          <div className="on-art on-rv">
            <SystemArtifact kind={s.artifact} />
          </div>
          <ol className="on-chain">
            {s.architecture.map((a, i) => (
              <li key={a.label} className="on-rv">
                <b>{pad(i)}</b>
                <span>{a.label}</span>
                <em className="on-serif">{a.detail}</em>
              </li>
            ))}
          </ol>
        </Block>

        <Block k="III · The hard part" title="Where the difficulty lived">
          {s.hardPart.map((h) => (
            <div key={h.title} className="on-hard on-rv">
              <h3>{h.title}</h3>
              <p className="on-p">{h.body}</p>
            </div>
          ))}
        </Block>

        {s.broke ? (
          <Block k="IV · What broke" title={s.broke.title}>
            <p className="on-p on-p-broke on-rv">{s.broke.body}</p>
          </Block>
        ) : null}

        {s.flaws?.length ? (
          <Block k="V · Flaws" title="What is still wrong with it">
            {s.flaws.map((f) => (
              <div key={f.title} className="on-hard on-rv">
                <h3>{f.title}</h3>
                <p className="on-p">{f.body}</p>
              </div>
            ))}
          </Block>
        ) : null}

        <Block
          k="VI · Differently"
          title="What I would do differently"
          notes={s.proves.map((p) => (
            <Margin key={p} n={++m}>
              Proves · {p}
            </Margin>
          ))}
        >
          {s.differently.map((d) => (
            <blockquote key={d} className="on-quote on-rv">
              {d}
            </blockquote>
          ))}
        </Block>

        <Block k="VII · Receipts" title="The numbers, on the record">
          <table className="on-receipts on-rv">
            <tbody>
              {s.receipts.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td className="on-foil">{r.value}</td>
                  <td>{r.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
        <Star id="case" className="on-star-case" />
      </div>

      {next ? (
        <Link href={`/systems/${next.slug}`} className="on-next" data-cursor={`02.${next.index}`}>
          <span className="on-k">Next stop · 02.{next.index}</span>
          <b>{next.title}</b>
          <em className="on-serif">{next.promise}</em>
        </Link>
      ) : null}
    </article>
  );
}

function Screen({ video, poster, title }: { video: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <video ref={ref} src={video} poster={poster} muted loop playsInline preload="none" aria-label={`Screen recording: ${title}`} />
  );
}

export function Projects() {
  return (
    <div className="on-works">
      <StationHead
        n="03"
        label="Works"
        title={
          <>
            Things that ship, <em className="on-serif">in the vitrine.</em>
          </>
        }
        lede="Real screen recordings first, lit in gold until you look closer. Then the side projects, each with a live link."
      />
      <div className="on-vitrine">
        {stage.map((s, i) => (
          <a
            key={s.slug}
            href={s.href}
            target="_blank"
            rel="noreferrer"
            className={`on-plate on-rv ${i % 3 === 0 ? "is-wide" : ""}`}
            data-cursor="03 ↗"
          >
            <div className="on-plate-media">
              <Screen video={s.video} poster={s.poster} title={s.title} />
            </div>
            <div className="on-plate-cap">
              <span className="on-k">
                03.{pad(i)} · {s.tag}
              </span>
              <b>{s.title}</b>
              <em className="on-serif">{s.tagline}</em>
            </div>
          </a>
        ))}
      </div>
      <Rule label="Side projects" />
      <ol className="on-catalogue">
        {projects.map((p, i) => (
          <li key={p.slug} className="on-cat on-rv">
            <div className={`on-cat-img ${p.portrait ? "is-portrait" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" />
            </div>
            <div className="on-cat-copy">
              <span className="on-k">
                No. {pad(i)} · {p.category} · {p.year}
              </span>
              <h2>{p.title}</h2>
              <p className="on-serif on-cat-tag">{p.tagline}</p>
              <p className="on-cat-desc">{p.description}</p>
              <p className="on-cat-note">
                <b>{p.highlight}</b> · {p.note}
              </p>
              <div className="on-cat-foot">
                <span>{p.stack.join(" · ")}</span>
                <a href={p.live} target="_blank" rel="noreferrer" className="on-btn" data-cursor="03 ↗">
                  Visit live <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

const labNotes: Record<string, { from: string; why: string; how: string; demo: ReactNode; source?: string }> = {
  "cache-key": {
    from: "Flights · cache design",
    why: "A flight search is expensive. Refining it should not be.",
    how: "Tap the controls. The ones that change the answer miss the cache; the ones that only reshape it never leave the building.",
    demo: <CacheKeyLab />,
    source: "flights",
  },
  deadlines: {
    from: "Hotels · stragglers",
    why: "Average latency is a liar. Eight partners race and one of them hangs.",
    how: "Drag the time budget and see what the user waits for, with and without a deadline.",
    demo: <DeadlineLab />,
    source: "hotels",
  },
  identity: {
    from: "Hotels · identity",
    why: "Same name is not the same hotel. Seven partner records sit around one real hotel, two of them impostors.",
    how: "Move the gates and find the setting that merges the truth and nothing else.",
    demo: <IdentityLab />,
    source: "hotels",
  },
  logs: {
    from: "Observability · alerting",
    why: "Silence is a signal. A service that stops logging is telling you something.",
    how: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.",
    demo: <LogStreamLab />,
    source: "observability",
  },
  memcached: {
    from: "Systems · from scratch",
    why: "Written in C++ to understand how a cache really works.",
    how: "Type commands into the browser simulation of it and watch keys expire.",
    demo: <MemcachedLab />,
  },
  "load-balancer": {
    from: "Build · Go load balancer",
    why: "A small Go service with weighted routing, health checks, circuit breakers and sticky sessions.",
    how: "The routing logic runs in your browser. Kill a node and watch the next request fail over.",
    demo: <LoadBalancerDemo />,
  },
  "vortex-vault": {
    from: "Build · VortexVault",
    why: "A dual C++ / Rust vector database built to compare both runtimes against the same storage format and the same benchmark.",
    how: "The interesting part is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state.",
    demo: null,
  },
};

export function Lab() {
  const neg = useNegative();
  const { found, reset } = useStars();
  const parts = [
    {
      name: "Station rail",
      why: "Six numbered stops make a portfolio feel like one journey instead of loose pages.",
      how: "Each route maps to a station. The gold line fills to the current stop, and the cursor ring shows the station number of whatever link you point at.",
    },
    {
      name: "Negative mode",
      why: "A studio after dark should be able to switch the lights on.",
      how: "One attribute on the root swaps the palette tokens, so every view, demo and diagram inverts to gold on cream together.",
      action: (
        <button type="button" className="on-btn" aria-pressed={neg.on} onClick={neg.toggle}>
          {neg.on ? "Lights off" : "Lights on"}
        </button>
      ),
    },
    {
      name: "The star hunt",
      why: `Purely for fun: ${STAR_TOTAL} small gold stars are hidden across the stations.`,
      how: "Found stars are remembered in this browser only. The counter on the rail keeps score.",
      action: (
        <button type="button" className="on-btn" onClick={reset} disabled={!found.length}>
          Reset stars ({found.length} / {STAR_TOTAL})
        </button>
      ),
    },
  ];
  return (
    <div className="on-lab">
      <StationHead
        n="04"
        label="Lab"
        title={
          <>
            The site, <em className="on-serif">taken apart.</em>
          </>
        }
        lede={`${labItems.length} experiments from real systems, each with notes on why it exists and how to read it. Every simulation runs in your browser and is labelled as one.`}
      >
        <nav className="on-lab-index on-rv" aria-label="Experiments">
          {labItems.map((l, i) => (
            <a key={l.slug} href={`#${l.slug}`} data-cursor={`04.${i + 1}`}>
              <b>04.{i + 1}</b>
              <span>{l.title}</span>
            </a>
          ))}
          <a href="#dissected" data-cursor="04.✦">
            <b>04.✦</b>
            <span>This site</span>
          </a>
        </nav>
      </StationHead>

      {labItems.map((l, i) => {
        const d = labNotes[l.slug];
        if (!d) return null;
        return (
          <section key={l.slug} id={l.slug} className="on-exp">
            <div className="on-exp-notes">
              <span className="on-k on-rv">
                04.{i + 1} · {d.from}
              </span>
              <h2 className="on-rv">{l.title}</h2>
              <div className="on-why on-rv">
                <b>Why</b>
                <p>{d.why}</p>
              </div>
              <div className="on-why on-rv">
                <b>How</b>
                <p>{d.how}</p>
              </div>
              <p className="on-exp-meta on-rv">
                {d.demo ? "Simulation · runs in your browser" : "Writeup · no live demo"} · {l.year}
              </p>
              {d.source ? (
                <Link href={`/systems/${d.source}`} className="on-link on-rv" data-cursor="02">
                  From the system it came from →
                </Link>
              ) : null}
              {i === 2 ? <Star id="lab" className="on-star-lab" /> : null}
            </div>
            <div className="on-exp-demo on-rv">
              {d.demo ?? (
                <div className="on-vv">
                  <span className="on-foil">C++</span>
                  <i>/</i>
                  <span className="on-foil">Rust</span>
                  <p className="on-serif">One engine, written twice, behind a shared segment format.</p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      <section id="dissected" className="on-dissect">
        <div className="on-board-head on-rv">
          <span className="on-k">04.✦ · Dissected</span>
          <h2>
            This theme, <em className="on-serif">explained by itself.</em>
          </h2>
        </div>
        <div className="on-dissect-grid">
          {parts.map((p, i) => (
            <div key={p.name} className="on-part on-rv">
              <b className="on-foil-num">{pad(i)}</b>
              <h3>{p.name}</h3>
              <p>
                <span>Why</span> {p.why}
              </p>
              <p>
                <span>How</span> {p.how}
              </p>
              {p.action}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function Notes() {
  return (
    <div className="on-notes">
      <StationHead
        n="05"
        label="Notes"
        title={
          <>
            Field notes, <em className="on-serif">read slowly.</em>
          </>
        }
        lede="Long-form writing on low-latency systems. Pick one and the reading room dims around it."
      />
      <ol className="on-notes-list">
        {notes.map((n, i) => (
          <li key={n.slug} className="on-rv">
            <Link href={`/notes/${n.slug}`} className="on-note-row" data-cursor={`05.${i + 1}`}>
              <span className="on-k">
                05.{i + 1} · {n.category} · {n.date} · {n.readTime}
              </span>
              <b className="on-serif">{n.title}</b>
              <p>{n.dek}</p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Note({ slug }: { slug: string }) {
  const n = getNote(slug);
  if (!n) return <Missing />;
  const next = getNextNote(slug);
  const idx = notes.findIndex((x) => x.slug === slug);
  return (
    <article className="on-case on-article">
      <header className="on-case-head">
        <Link href="/notes" className="on-back" data-cursor="05">
          ← Station 05 · Notes
        </Link>
        <span className="on-k on-rv">
          05.{idx + 1} · {n.category} · {n.date} · {n.readTime}
        </span>
        <h1 className="on-case-title on-serif on-rv">{n.title}</h1>
        <p className="on-case-promise on-rv">{n.dek}</p>
      </header>
      <div className="on-read on-read-note">
        {n.sections.map((s, i) => (
          <section key={i} className="on-nsec">
            {s.heading ? <Rule label={`§ ${pad(i)}`} /> : null}
            {s.heading ? <h2 className="on-block-title on-rv">{s.heading}</h2> : null}
            {s.body.map((p, j) => (
              <p key={j} className={`on-p on-rv ${i === 0 && j === 0 ? "on-drop" : ""}`}>
                {p}
              </p>
            ))}
            {s.list ? (
              <ul className="on-list on-rv">
                {s.list.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            ) : null}
            {s.code ? (
              <pre className="on-code on-rv">
                <code>{s.code}</code>
              </pre>
            ) : null}
            {s.quote ? <blockquote className="on-quote on-rv">{s.quote}</blockquote> : null}
          </section>
        ))}
      </div>
      {next ? (
        <Link href={`/notes/${next.slug}`} className="on-next" data-cursor="05">
          <span className="on-k">Next note</span>
          <b className="on-serif">{next.title}</b>
          <em>{next.dek}</em>
        </Link>
      ) : null}
    </article>
  );
}

export function About() {
  return (
    <div className="on-studio">
      <StationHead
        n="06"
        label="Studio"
        title={
          <>
            {profile.name}, <em className="on-serif">at the desk.</em>
          </>
        }
        lede={profile.description}
      />
      <section className="on-studio-grid">
        <div className="on-plaque on-rv">
          <span className="on-k">The studio</span>
          <dl>
            <div>
              <dt>Name</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>Based</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{profile.availabilityDetail}</dd>
            </div>
          </dl>
          <Star id="studio" className="on-star-studio" />
        </div>
        <div className="on-line-map">
          <span className="on-k on-rv">The line so far</span>
          <ol>
            {timeline.map((t) => (
              <li key={t.title} className="on-rv">
                <i aria-hidden="true" />
                <span className="on-k">{t.year}</span>
                <b>{t.title}</b>
                <p className="on-serif">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <Rule label="House rules" />
      <div className="on-rules">
        {principles.map((p) => (
          <div key={p.num} className="on-rulecard on-rv">
            <b className="on-foil-num">{p.num}</b>
            <h3 className="on-serif">{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </div>
      <Rule label="On the bench" />
      <dl className="on-now">
        {currently.map((c) => (
          <div key={c.label} className="on-rv">
            <dt>{c.label}</dt>
            <dd className="on-serif">{c.value}</dd>
          </div>
        ))}
      </dl>
      <section className="on-contact on-rv">
        <span className="on-k">Last stop · write in</span>
        <a href={`mailto:${profile.email}`} className="on-mail on-foil" data-cursor="✉">
          {profile.email}
        </a>
        <CopyEmail email={profile.email} />
      </section>
    </div>
  );
}

export function Missing() {
  return (
    <div className="on-missing">
      <StationHead
        n="00"
        sub="/ not in service"
        label="Unknown stop"
        title={
          <>
            This station is <em className="on-serif">not on the line.</em>
          </>
        }
        lede="The train went somewhere the map does not. Step back onto a real platform."
      >
        <div className="on-missing-links on-rv">
          {stations.map((s) => (
            <Link key={s.n} href={s.href} className="on-btn" data-cursor={s.n}>
              {s.n} · {s.label}
            </Link>
          ))}
        </div>
      </StationHead>
    </div>
  );
}
