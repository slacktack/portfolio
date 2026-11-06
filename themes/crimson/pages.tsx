"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { Ledger } from "@/components/ledger";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { openThemes } from "@/components/skin";
import { currently, getNextNote, getSystem, notes, principles, profile, timeline, type Note } from "@/lib/site";
import { afterHours, dayJob, pad, projectFor } from "./data";
import { links } from "./nav";
import { Toy } from "./toy";
import { Big, Frame, Kick } from "./ui";

// ---- Projects: sheets that stack over each other ----

export function Projects() {
  return (
    <div className="cr-page cr-projects">
      <header className="cr-proj-head">
        <Kick>After hours · {afterHours.length} projects</Kick>
        <Big as="h1" lines={["Built for", "fun. Shipped", "anyway."]} />
        <p className="cr-lede" data-rv="">
          Things nobody asked me to build. Each one is live, and each one has a real screen recording. The red tint lifts when you hover the frame.
        </p>
      </header>
      <ol className="cr-sheets">
        {afterHours.map((st, i) => {
          const p = projectFor(st.slug);
          return (
            <li key={st.slug} className={`cr-sheet cr-sheet-${i % 3}`} style={{ "--cr-z": i + 1 } as CSSProperties}>
              <div className="cr-sheet-copy">
                <span className="cr-sheet-n">
                  {pad(i + 1)} / {pad(afterHours.length)}
                </span>
                <h2>{st.title}</h2>
                <p className="cr-sheet-tag">{st.tagline}</p>
                {p && (
                  <>
                    <p className="cr-sheet-desc">{p.description}</p>
                    <p className="cr-sheet-note">{p.note}</p>
                    <ul className="cr-stack">
                      <li className="is-hl">{p.highlight}</li>
                      {p.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </>
                )}
                <a className="cr-pill is-ink" href={st.href} target="_blank" rel="noreferrer" data-mag="">
                  Open it live ↗
                </a>
              </div>
              <Frame video={st.video} poster={st.poster} alt={`Screen recording of ${st.title}`} className="cr-sheet-frame" />
            </li>
          );
        })}
      </ol>
      <section className="cr-dayjob" aria-labelledby="cr-dj-h">
        <Kick>From the day job</Kick>
        <h2 id="cr-dj-h" className="cr-h2" data-rv="">
          The systems have recordings too.
        </h2>
        <ul className="cr-dj-grid">
          {dayJob.map((st) => {
            const slug = st.slug.replace("bh-", "");
            const s = getSystem(slug);
            return (
              <li key={st.slug} data-rv="">
                <Link href={`/systems/${slug}`} data-peek="">
                  <Frame poster={st.poster} alt={`${st.title} screen`} />
                  <b>{s?.title ?? st.title} →</b>
                  <span>{st.tagline}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

// ---- Lab: a bench of specimen boxes with a sticky tag index ----

type Exp = { slug: string; label: string; title: string; note: string; demo: ReactNode; src?: string };

const exps: Exp[] = [
  {
    slug: "cache-key",
    label: "Flights · cache design",
    title: "Change one thing. Watch the cache decide.",
    note: "A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building.",
    demo: <CacheKeyLab />,
    src: "flights",
  },
  {
    slug: "deadlines",
    label: "Hotels · stragglers",
    title: "Average latency is a liar.",
    note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.",
    demo: <DeadlineLab />,
    src: "hotels",
  },
  {
    slug: "identity",
    label: "Hotels · identity",
    title: "Same name is not the same hotel.",
    note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.",
    demo: <IdentityLab />,
    src: "hotels",
  },
  {
    slug: "logs",
    label: "Observability · alerting",
    title: "Silence is a signal.",
    note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.",
    demo: <LogStreamLab />,
    src: "observability",
  },
  {
    slug: "memcached",
    label: "Systems · from scratch",
    title: "Memcached, rebuilt.",
    note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire.",
    demo: <MemcachedLab />,
  },
  {
    slug: "load-balancer",
    label: "Build · Go load balancer",
    title: "Weighted routing you can break.",
    note: "A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo runs the routing logic in your browser so you can kill a node and watch the next request fail over.",
    demo: <LoadBalancerDemo />,
  },
];

const lbNotes = [
  ["Weighted routing", "Each healthy node gets a share proportional to its weight. Set a weight to zero to drain it."],
  ["Health + circuit breaker", "Three failed checks open the circuit. Traffic stops landing on the node before users notice."],
  ["Sticky sessions", "When enabled, one client keeps landing on the same node until it disappears from the healthy set."],
  ["Observability", "Per-node request counts, shares, health state, and combined weight stay visible while the system changes."],
];

const vv = [
  ["Client", "insert / query / delete"],
  ["WAL", "durable append + replay"],
  ["Memtable", "mutable in-memory index"],
  ["Segment", "immutable on-disk index"],
  ["Compaction", "merge + tombstone cleanup"],
];

export function Lab() {
  return (
    <div className="cr-page cr-lab">
      <header className="cr-lab-head">
        <Kick>The lab · {exps.length + 1} experiments</Kick>
        <Big as="h1" lines={["Break it", "on purpose."]} />
        <p className="cr-lede" data-rv="">
          The mechanisms from the systems, rebuilt small enough to hold in one hand. Every experiment runs in your browser. Simulations are labelled as
          simulations.
        </p>
      </header>
      <div className="cr-bench">
        <nav className="cr-bench-index" aria-label="Experiments">
          {[...exps.map((e) => [e.slug, e.title] as const), ["vortex-vault", "VortexVault"] as const].map(([slug, t], i) => (
            <a key={slug} href={`#cr-x-${slug}`}>
              <b>{pad(i + 1)}</b>
              {t}
            </a>
          ))}
        </nav>
        <div className="cr-bench-main">
          {exps.map((e, i) => {
            const src = e.src ? getSystem(e.src) : undefined;
            return (
              <section key={e.slug} id={`cr-x-${e.slug}`} className="cr-spec" aria-labelledby={`cr-x-${e.slug}-h`}>
                <header className="cr-spec-head" data-inv="">
                  <span>Exp {pad(i + 1)}</span>
                  <span>{e.label}</span>
                </header>
                <div className="cr-spec-copy" data-rv="">
                  <h2 id={`cr-x-${e.slug}-h`}>{e.title}</h2>
                  <p>{e.note}</p>
                </div>
                <div className="cr-spec-demo">{e.demo}</div>
                {e.slug === "load-balancer" && (
                  <ul className="cr-lb-notes">
                    {lbNotes.map(([t, d]) => (
                      <li key={t}>
                        <b>{t}</b>
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {src && (
                  <Link className="cr-spec-src" href={`/systems/${src.slug}`} data-mag="">
                    From the system · <b>{src.title} →</b>
                  </Link>
                )}
              </section>
            );
          })}
          <section id="cr-x-vortex-vault" className="cr-spec cr-vv" aria-labelledby="cr-vv-h">
            <header className="cr-spec-head" data-inv="">
              <span>Exp {pad(exps.length + 1)}</span>
              <span>Build · VortexVault · in progress</span>
            </header>
            <div className="cr-spec-copy" data-rv="">
              <h2 id="cr-vv-h">One vector database. Two runtimes.</h2>
              <p>
                A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the
                same benchmark. The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point
                where a query has to touch both in-memory and on-disk state.
              </p>
            </div>
            <ol className="cr-chain cr-vv-chain">
              {vv.map(([a, b], i) => (
                <li key={a} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
                  <b>{a}</b>
                  <span>{b}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

// ---- Notes: hanging tags ----

export function Notes() {
  const [lead, ...rest] = notes;
  return (
    <div className="cr-page cr-notes">
      <header className="cr-notes-head">
        <Kick>Notes · {notes.length} field notes</Kick>
        <Big as="h1" lines={["Written", "down."]} />
      </header>
      <Link href={`/notes/${lead.slug}`} className="cr-note-lead" data-inv="" data-rv="">
        <span className="cr-note-pin" aria-hidden="true" />
        <small>
          Latest · {lead.date} · {lead.readTime} · {lead.category}
        </small>
        <b>{lead.title}</b>
        <span>{lead.dek}</span>
        <em>Read it →</em>
      </Link>
      <ol className="cr-tags">
        {rest.map((n, i) => (
          <li key={n.slug} data-rv="" style={{ "--cr-tilt": `${i % 2 ? 1.6 : -1.4}deg` } as CSSProperties}>
            <Link href={`/notes/${n.slug}`} className="cr-tag" data-peek="">
              <span className="cr-note-pin" aria-hidden="true" />
              <small>
                {n.date} · {n.readTime} · {n.category}
              </small>
              <b>{n.title}</b>
              <span>{n.dek}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NoteView({ n }: { n: Note }) {
  const next = getNextNote(n.slug);
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - innerHeight * 2;
      setP(Math.min(1, Math.max(0, scrollY / Math.max(1, h))));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <article className="cr-page cr-note">
      <i className="cr-progress" style={{ transform: `scaleX(${p})` }} aria-hidden="true" />
      <header className="cr-note-poster" data-inv="">
        <p className="cr-poster-k" data-rv="">
          <Link href="/notes">Notes</Link> / {n.category} · {n.date} · {n.readTime}
        </p>
        <h1 data-rv="">{n.title}</h1>
        <p className="cr-note-dek" data-rv="">
          {n.dek}
        </p>
      </header>
      <div className="cr-note-body">
        {n.sections.map((sec, i) => (
          <section key={i} data-rv="">
            {sec.heading && (
              <h2>
                <span aria-hidden="true">{pad(i)}</span>
                {sec.heading}
              </h2>
            )}
            {sec.body.map((b, j) => (
              <p key={j} className={i === 0 && j === 0 ? "cr-drop" : undefined}>
                {b}
              </p>
            ))}
            {sec.quote && <blockquote>{sec.quote}</blockquote>}
            {sec.list && (
              <ul>
                {sec.list.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
            {sec.code && (
              <pre>
                <code>{sec.code}</code>
              </pre>
            )}
          </section>
        ))}
      </div>
      <Link href={`/notes/${next.slug}`} className="cr-next" data-inv="">
        <small>Next note · {next.readTime}</small>
        <b>{next.title} →</b>
        <span>{next.dek}</span>
      </Link>
    </article>
  );
}

// ---- About: a spec sheet ----

export function About() {
  return (
    <div className="cr-page cr-about">
      <header className="cr-about-head">
        <Kick>About · spec sheet</Kick>
        <Big as="h1" lines={[profile.tagline.replace(/\.$/, ""), <em key="d">.</em>]} />
        <dl className="cr-spec-sheet" data-rv="">
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
            <dd className="cr-avail">
              <i aria-hidden="true" />
              {profile.availability}
            </dd>
          </div>
        </dl>
        <p className="cr-lede" data-rv="">
          {profile.description}
        </p>
      </header>

      <section className="cr-principles" aria-labelledby="cr-pr-h" data-inv="">
        <h2 id="cr-pr-h" className="cr-h2">
          Three rules.
        </h2>
        <ol>
          {principles.map((p, i) => (
            <li key={p.num} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
              <span aria-hidden="true">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cr-timeline" aria-labelledby="cr-tl-h">
        <Kick>Timeline</Kick>
        <h2 id="cr-tl-h" className="cr-h2" data-rv="">
          So far.
        </h2>
        <ol>
          {timeline.map((t) => (
            <li key={t.title} data-rv="">
              <b>{t.year}</b>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cr-currently" aria-labelledby="cr-cu-h">
        <Kick>Currently</Kick>
        <h2 id="cr-cu-h" className="cr-sr">
          Currently
        </h2>
        <dl>
          {currently.map((c, i) => (
            <div key={c.label} data-rv="" className={`cr-tone-${i % 4}`}>
              <dt>{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="cr-ledger" aria-labelledby="cr-lg-h">
        <Kick>Ledger</Kick>
        <h2 id="cr-lg-h" className="cr-h2" data-rv="">
          Commits, counted.
        </h2>
        <div data-rv="">
          <Ledger />
        </div>
      </section>

      <section className="cr-contact" aria-labelledby="cr-ct-h" data-inv="">
        <h2 id="cr-ct-h">Write to me.</h2>
        <a className="cr-mail" href={`mailto:${profile.email}`} data-mag="">
          {profile.email}
        </a>
        <CopyEmail email={profile.email} />
      </section>
    </div>
  );
}

// ---- Missing: the page fell off the shelf ----

export function Missing({ path }: { path: string }) {
  return (
    <div className="cr-page cr-missing" data-inv="">
      <Toy
        rows={["404"]}
        fill={0.5}
        keys
        label="A physics 404. Grab and throw the digits."
        className="cr-missing-toy"
        items={links.map((l, i) => ({ id: l.href, value: l.label, href: l.href, tone: i % 4, aria: `Go to ${l.label}` }))}
        auto={links.length}
        every={160}
      >
        <div className="cr-missing-copy">
          <p className="cr-poster-k">Nothing at {path}</p>
          <h1>This page fell off the shelf.</h1>
          <p>Throw the digits around if it helps. The tags are real links.</p>
        </div>
      </Toy>
    </div>
  );
}

// ---- Footer: pinned underneath, revealed at the end ----

export function Foot() {
  return (
    <footer className="cr-foot" data-inv="">
      <div className="cr-foot-in">
        <p className="cr-foot-k">
          <i aria-hidden="true" />
          {profile.availability}
        </p>
        <a className="cr-foot-mail" href={`mailto:${profile.email}`} data-mag="">
          Say hi<span aria-hidden="true">→</span>
        </a>
        <p className="cr-foot-addr">{profile.email}</p>
        <nav className="cr-foot-nav" aria-label="Footer">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
          <button type="button" onClick={openThemes}>
            Themes
          </button>
        </nav>
        <p className="cr-foot-fine">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Crimson · a physics toy in one red</span>
        </p>
      </div>
    </footer>
  );
}
