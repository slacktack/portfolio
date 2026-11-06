"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { CopyEmail } from "@/components/copy-email";
import { currently, getNextNote, internalTools, notes, principles, profile, timeline, type Note as NoteT } from "@/lib/site";
import { Arrow, AutoVideo, BrandCard, Browser, Head, Scene, pad, tones } from "./ui";

const labs: { id: string; label: string; title: ReactNode; note: string; demo: ReactNode }[] = [
  {
    id: "cache-key",
    label: "Flights · cache design",
    title: "Change one thing. Watch the cache decide.",
    note: "A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building.",
    demo: <CacheKeyLab />,
  },
  {
    id: "deadlines",
    label: "Hotels · stragglers",
    title: (
      <>
        Average latency is a <em>liar.</em>
      </>
    ),
    note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.",
    demo: <DeadlineLab />,
  },
  {
    id: "identity",
    label: "Hotels · identity",
    title: (
      <>
        Same name is not the <em>same hotel.</em>
      </>
    ),
    note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.",
    demo: <IdentityLab />,
  },
  {
    id: "logs",
    label: "Observability · alerting",
    title: (
      <>
        Silence is a <em>signal.</em>
      </>
    ),
    note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.",
    demo: <LogStreamLab />,
  },
  {
    id: "memcached",
    label: "Systems · from scratch",
    title: (
      <>
        Memcached, <em>rebuilt.</em>
      </>
    ),
    note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire.",
    demo: <MemcachedLab />,
  },
  {
    id: "load-balancer",
    label: "Build · Go load balancer",
    title: (
      <>
        Weighted routing you can <em>break.</em>
      </>
    ),
    note: "A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo below runs the routing logic in your browser so you can kill a node and watch the next request fail over.",
    demo: <LoadBalancerDemo />,
  },
];

const lbNotes = [
  ["Weighted routing", "Each healthy node gets a share proportional to its weight. Set a weight to zero to drain it."],
  ["Health + circuit breaker", "Three failed checks open the circuit. Traffic stops landing on the node before users notice."],
  ["Sticky sessions", "When enabled, one client keeps landing on the same node until it disappears from the healthy set."],
  ["Observability", "Per-node request counts, shares, health state, and combined weight stay visible while the system changes."],
];

export const labSubs = [...labs.map((l) => ({ id: l.id, label: l.label.split(" · ")[1] })), { id: "vortex-vault", label: "vector database" }];

export function Lab() {
  return (
    <>
      <Head
        n="04"
        label="Lab · no product pressure"
        title={
          <>
            Small systems, <em>strange constraints.</em>
          </>
        }
        lede="Experiments built to understand a mechanism, not to ship a roadmap. Some are interactive. All of them are allowed to break."
      />
      {labs.map((l, i) => (
        <section className="sm-exp" id={l.id} key={l.id}>
          <div className="sm-exp-head" data-rise="">
            <span className="sm-eyebrow">
              <b>E{pad(i + 1)}</b>
              {l.label}
            </span>
            <h2 className="sm-h2">{l.title}</h2>
            <p className="sm-body">{l.note}</p>
          </div>
          <div className="sm-exp-bench" data-rise="">
            {l.demo}
          </div>
          {l.id === "load-balancer" ? (
            <dl className="sm-lbnotes" data-rise="">
              {lbNotes.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </section>
      ))}
      <section className="sm-exp" id="vortex-vault">
        <div className="sm-exp-head" data-rise="">
          <span className="sm-eyebrow">
            <b>E07</b>Build · VortexVault
          </span>
          <h2 className="sm-h2">
            One vector database. <em>Two runtimes.</em>
          </h2>
          <p className="sm-body">
            A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the same benchmark.
          </p>
        </div>
        <div className="sm-vv">
          <div className="sm-prose" data-rise="">
            <p>
              Most vector database projects pick a language and inherit its assumptions. VortexVault implements the same engine twice — once in C++, once in Rust — behind a shared segment format and a shared benchmark harness.
            </p>
            <p>
              The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state. Keeping those semantics identical across two runtimes is the actual project.
            </p>
            <p>Still in progress. The benchmark reports latency, recall, and memory footprint for both implementations against the same workload.</p>
          </div>
          <div className="sm-arch sm-arch-v" data-rise="">
            {[
              ["Client", "insert / query / delete"],
              ["WAL", "durable append + replay"],
              ["Memtable", "mutable in-memory index"],
              ["Segment", "immutable on-disk index"],
              ["Compaction", "merge + tombstone cleanup"],
            ].map(([k, v], i) => (
              <div className="sm-arch-node" key={k}>
                <span>{pad(i + 1)}</span>
                <b>{k}</b>
                <small>{v}</small>
              </div>
            ))}
            <ul className="sm-rail-chips">
              <li>C++ engine</li>
              <li>Rust engine</li>
              <li>In progress</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

export function Notes() {
  return (
    <>
      <Head
        n="05"
        label="Journal"
        title={
          <>
            The journal. <em>Field notes on low-latency systems.</em>
          </>
        }
        lede="Long-form notes on the decisions behind the systems."
      />
      <ol className="sm-journal">
        {notes.map((n, i) => (
          <li key={n.slug} data-rise="" style={{ "--i": i } as CSSProperties}>
            <Link href={`/notes/${n.slug}`} className="sm-entry" data-cursor="Read">
              <span className={`sm-entry-swatch sm-card-${tones[i % 3]}`} data-par="">
                <Scene tone={tones[i % 3]} />
                <b>{pad(i + 1)}</b>
              </span>
              <span className="sm-entry-meta">
                {n.date} · {n.category} · {n.readTime}
              </span>
              <span className="sm-entry-t">{n.title}</span>
              <span className="sm-entry-d">{n.dek}</span>
              <span className="sm-link">
                Read the note
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

export const noteSubs = (n: NoteT) =>
  n.sections.flatMap((s, i) => (s.heading ? [{ id: `s-${i}`, label: s.heading }] : [])).slice(0, 8);

export function Note({ n }: { n: NoteT }) {
  const next = getNextNote(n.slug);
  const i = notes.indexOf(n);
  return (
    <article className="sm-note">
      <header className="sm-note-head" data-rise="">
        <Link href="/notes" className="sm-back">
          ← Journal
        </Link>
        <span className="sm-eyebrow">
          <b>{pad(i + 1)}</b>
          {n.category} · {n.date} · {n.readTime}
        </span>
        <h1 className="sm-h1">{n.title}</h1>
        <p className="sm-note-dek">{n.dek}</p>
      </header>
      <div className={`sm-note-band sm-card-${tones[i % 3]}`} data-par="" aria-hidden="true">
        <Scene tone={tones[i % 3]} wide />
      </div>
      <div className="sm-note-body">
        {n.sections.map((s, k) => (
          <section key={k} id={s.heading ? `s-${k}` : undefined}>
            {s.heading ? <h2>{s.heading}</h2> : null}
            {s.body.map((p, j) => (
              <p key={j} className={k === 0 && j === 0 ? "sm-first" : undefined}>
                {p}
              </p>
            ))}
            {s.list ? (
              <ul className="sm-ticks">
                {s.list.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            ) : null}
            {s.code ? (
              <pre className="sm-code">
                <code>{s.code}</code>
              </pre>
            ) : null}
            {s.quote ? <blockquote className="sm-pull">{s.quote}</blockquote> : null}
          </section>
        ))}
      </div>
      <Link href={`/notes/${next.slug}`} className="sm-nextnote" data-cursor="Read">
        <span className="sm-eyebrow">
          <b>Next note</b>
          {next.readTime}
        </span>
        <strong>{next.title}</strong>
        <span>{next.dek}</span>
      </Link>
    </article>
  );
}

const shots: Record<string, { src: string; poster: string } | undefined> = {
  "Halo design system": { src: "/assets/video/halo.mp4", poster: "/assets/video/halo.jpg" },
};

export function About() {
  const tool = internalTools[0];
  const media = shots[tool.name];
  return (
    <>
      <section className="sm-maker">
        <div className="sm-maker-copy">
          <span className="sm-eyebrow" data-rise="">
            <b>06</b>Maker
          </span>
          <h1 className="sm-display sm-display-sm" data-rise="">
            {profile.name}.
            <br />
            <em>{profile.tagline}</em>
          </h1>
          <p className="sm-lede" data-rise="">
            {profile.description}
          </p>
          <dl className="sm-facts" data-rise="">
            {currently.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <BrandCard
          tone="navy"
          className="sm-card-sheet"
          kicker="Maker · spec"
          title={profile.shortName}
          specs={[
            ["ROLE", profile.role.toUpperCase()],
            ["BASE", profile.location.toUpperCase()],
            ["STATUS", profile.availability.toUpperCase()],
          ]}
        >
          <p className="sm-card-p">{profile.availabilityDetail}</p>
        </BrandCard>
      </section>

      <section className="sm-sec" id="timeline">
        <div className="sm-sec-label" data-rise="">
          <b>01</b>
          <span>Timeline</span>
        </div>
        <ol className="sm-time sm-sec-body">
          {timeline.map((t, i) => (
            <li key={t.title} data-rise="" style={{ "--i": i } as CSSProperties}>
              <span className="sm-time-y">{t.year}</span>
              <div>
                <h3>{t.title}</h3>
                <p>{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="sm-sec" id="principles">
        <div className="sm-sec-label" data-rise="">
          <b>02</b>
          <span>Principles</span>
        </div>
        <div className="sm-feats sm-feats-3 sm-sec-body">
          {principles.map((p, i) => (
            <div className="sm-feat" key={p.num} data-rise="" style={{ "--i": i } as CSSProperties}>
              <span className="sm-feat-n">P{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sm-sec" id="tools">
        <div className="sm-sec-label" data-rise="">
          <b>03</b>
          <span>Internal tools</span>
        </div>
        <div className="sm-sec-body sm-tools">
          {media ? (
            <figure data-rise="">
              <Browser url="halo · design system reference">
                <AutoVideo src={media.src} poster={media.poster} label={`${tool.name} screen recording`} />
              </Browser>
              <figcaption className="sm-cap">Recorded from the running reference page. Sample numbers, no company data.</figcaption>
            </figure>
          ) : null}
          <ul className="sm-tool-list">
            {internalTools.map((t, i) => (
              <li key={t.name} data-rise="" style={{ "--i": i % 3 } as CSSProperties}>
                <span>{t.kind}</span>
                <h3>{t.name}</h3>
                <p>{t.line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="sm-sec" id="contact">
        <div className="sm-sec-label" data-rise="">
          <b>04</b>
          <span>Contact</span>
        </div>
        <div className="sm-sec-body sm-contact" data-rise="">
          <p className="sm-h2">
            Email is the fastest way. <em>Write to me.</em>
          </p>
          <div className="sm-contact-row">
            <a className="sm-btn" href={`mailto:${profile.email}`} data-cursor="Write">
              {profile.email}
              <Arrow />
            </a>
            <CopyEmail email={profile.email} />
          </div>
        </div>
      </section>
    </>
  );
}

export const aboutSubs = [
  { id: "timeline", label: "Timeline" },
  { id: "principles", label: "Principles" },
  { id: "tools", label: "Internal tools" },
  { id: "contact", label: "Contact" },
];

export function Missing({ path }: { path: string }) {
  return (
    <section className="sm-missing">
      <div className="sm-missing-copy" data-rise="">
        <span className="sm-eyebrow">
          <b>404</b>Not in the catalogue
        </span>
        <h1 className="sm-display sm-display-sm">
          This product <em>never launched.</em>
        </h1>
        <p className="sm-lede">
          Nothing ships at <code>{path}</code>. The index on the right lists everything that does.
        </p>
        <div className="sm-reel-links">
          <Link href="/" className="sm-btn">
            Back to launch
            <Arrow />
          </Link>
          <Link href="/systems" className="sm-link">
            The product line
            <Arrow />
          </Link>
        </div>
      </div>
      <BrandCard tone="coral" kicker="Spec sheet · 404" title="Unreleased" specs={[["STATUS", "NOT FOUND"], ["PATH", path.toUpperCase()]]} />
    </section>
  );
}
