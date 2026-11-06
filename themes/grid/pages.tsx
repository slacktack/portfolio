"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ContactForm } from "@/components/contact-form";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { currently, getNextNote, getSystem, labItems, notes, principles, profile, timeline, type Note } from "@/lib/site";
import { Fig, ISSUE, Kicker, Lines, MAST, Slab, Turn, d, notePage, pad, sections, sysPage } from "./ui";

// ---- Laboratory ----

type Exp = { slug: string; label: string; title: ReactNode; note: string; demo: ReactNode; src?: string; invert?: boolean };

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
    invert: true,
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

const vvSteps = [
  ["Client", "insert / query / delete"],
  ["WAL", "durable append + replay"],
  ["Memtable", "mutable in-memory index"],
  ["Segment", "immutable on-disk index"],
  ["Compaction", "merge + tombstone cleanup"],
];

export function Lab() {
  return (
    <section className="gr-lab">
      <header className="gr-sec-head">
        <Kicker n="04">Section · Laboratory</Kicker>
        <Lines as="h1" className="gr-display gr-display-xl" lines={["Laboratory"]} />
        <p className="gr-sec-lede" data-rv="">
          The mechanisms from the systems section, rebuilt small enough to hold in one hand and break on purpose. Every experiment runs in your
          browser. Simulations are labelled as simulations.
        </p>
      </header>

      <ol className="gr-explist" aria-label="Experiments">
        {labItems.map((l, i) => (
          <li key={l.slug} data-rv="" style={d(i * 0.6)}>
            <a href={`#${l.slug}`}>
              <b>Exp. {pad(i + 1)}</b>
              <strong>{l.title}</strong>
              <span>{l.detail}</span>
              <em>{l.year}</em>
            </a>
          </li>
        ))}
      </ol>

      {exps.map((e, i) => {
        const src = e.src ? getSystem(e.src) : undefined;
        return (
          <section key={e.slug} id={e.slug} className={`gr-exp ${e.invert ? "gr-spread gr-paper" : ""}`}>
            <header className="gr-exp-head">
              <p className="gr-exp-n" data-rv="">
                <b>{pad(i + 1)}</b>
                <span>Exp.</span>
              </p>
              <div>
                <p className="gr-exp-k" data-rv="">
                  {e.label}
                </p>
                <Lines as="h2" className="gr-exp-t" lines={[e.title]} />
              </div>
              <p className="gr-exp-note" data-rv="">
                {e.note}
                {src && (
                  <Link className="gr-link" href={`/systems/${src.slug}`}>
                    From the article: {src.title}, p.{pad(sysPage(src.slug))}
                  </Link>
                )}
              </p>
            </header>
            <div className="gr-exp-demo" data-rv="">
              {e.demo}
            </div>
            {e.slug === "load-balancer" && (
              <ul className="gr-exp-notes">
                {lbNotes.map(([t, b], k) => (
                  <li key={t} data-rv="" style={d(k)}>
                    <b>{t}</b>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <section id="vortex-vault" className="gr-exp gr-spread gr-blue gr-vv">
        <header className="gr-exp-head">
          <p className="gr-exp-n" data-rv="">
            <b>07</b>
            <span>Exp.</span>
          </p>
          <div>
            <p className="gr-exp-k" data-rv="">
              Build · VortexVault · in progress
            </p>
            <Lines as="h2" className="gr-exp-t" lines={["One vector database.", "Two runtimes."]} />
          </div>
          <div className="gr-exp-note" data-rv="">
            <p>
              Most vector database projects pick a language and inherit its assumptions. VortexVault implements the same engine twice, once in C++ and
              once in Rust, behind a shared segment format and a shared benchmark harness.
            </p>
            <p>
              The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query
              has to touch both in-memory and on-disk state.
            </p>
          </div>
        </header>
        <Fig n="7.1" title="VortexVault write and read path, shared by both engines">
          <ol className="gr-vv-path">
            {vvSteps.map(([t, s], k) => (
              <li key={t} style={d(k)}>
                <b>{pad(k + 1)}</b>
                <strong>{t}</strong>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </Fig>
      </section>
    </section>
  );
}

// ---- Essays ----

export function Essays() {
  const [lead, ...rest] = notes;
  return (
    <section className="gr-essays">
      <header className="gr-sec-head">
        <Kicker n="05">Section · Essays</Kicker>
        <Lines as="h1" className="gr-display gr-display-xl" lines={["Essays"]} />
        <p className="gr-sec-lede" data-rv="">
          Field notes on low-latency systems, written after the fact and checked against the numbers.
        </p>
      </header>

      <Link href={`/notes/${lead.slug}`} className="gr-lead gr-blue" data-rv="">
        <span className="gr-lead-k">
          Lead essay · {lead.category} · p.{pad(notePage(lead.slug))}
        </span>
        <strong className="gr-lead-t">{lead.title}</strong>
        <span className="gr-lead-d">{lead.dek}</span>
        <span className="gr-lead-m">
          {lead.date} · {lead.readTime} read <i aria-hidden="true">→</i>
        </span>
      </Link>

      <ol className="gr-essay-list">
        {rest.map((n, i) => (
          <li key={n.slug} data-rv="" style={d(i)}>
            <Link href={`/notes/${n.slug}`}>
              <b className="gr-essay-n">{pad(i + 2)}</b>
              <span className="gr-essay-k">
                {n.category} · {n.date} · {n.readTime}
              </span>
              <strong>{n.title}</strong>
              <span className="gr-essay-d">{n.dek}</span>
              <em>p.&nbsp;{pad(notePage(n.slug))} →</em>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Essay({ n }: { n: Note }) {
  const next = getNextNote(n.slug);
  let fig = 0;
  return (
    <article className="gr-art gr-essay">
      <header className="gr-essay-head">
        <Kicker n={`p.${pad(notePage(n.slug))}`}>
          Essay · {n.category} · {n.date} · {n.readTime} read
        </Kicker>
        <Lines as="h1" className="gr-display gr-essay-title" lines={[n.title]} />
        <p className="gr-art-stand" data-rv="">
          {n.dek}
        </p>
        <p className="gr-essay-by" data-rv="">
          By {profile.name}
        </p>
      </header>

      <div className="gr-essay-grid">
        <aside className="gr-essay-toc" aria-label="In this essay">
          <p className="gr-margin-k">In this essay</p>
          <ol>
            {n.sections.map((s, i) =>
              s.heading ? (
                <li key={i}>
                  <a href={`#s-${i}`}>{s.heading}</a>
                </li>
              ) : null
            )}
          </ol>
        </aside>
        <div className="gr-essay-body">
          {n.sections.map((s, i) => (
            <section key={i} id={`s-${i}`}>
              {s.heading && (
                <h2 className="gr-essay-h" data-rv="">
                  <b>§{i}</b> {s.heading}
                </h2>
              )}
              {s.body.map((p, k) => (
                <p key={k} className={i === 0 && k === 0 ? "gr-drop" : undefined} data-rv="">
                  {p}
                </p>
              ))}
              {s.list && (
                <ul className="gr-essay-ul" data-rv="">
                  {s.list.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              )}
              {s.code && (
                <Fig n={++fig} title="Listing" className="gr-code">
                  <pre>
                    <code>{s.code}</code>
                  </pre>
                </Fig>
              )}
              {s.quote && (
                <blockquote className="gr-pull gr-pull-wide" data-rv="">
                  <span className="gr-pull-mark" aria-hidden="true">
                    “
                  </span>
                  <p>{s.quote}</p>
                </blockquote>
              )}
            </section>
          ))}
          <p className="gr-end" data-rv="">
            <i aria-hidden="true" /> End of essay.
          </p>
        </div>
      </div>

      <Turn href={`/notes/${next.slug}`} k="Next essay" title={next.title} p={notePage(next.slug)} />
    </article>
  );
}

// ---- Colophon ----

export function Colophon() {
  return (
    <section className="gr-colo">
      <header className="gr-colo-head">
        <div>
          <Kicker n="06">Section · Colophon</Kicker>
          <Lines as="h1" className="gr-display gr-display-xl" lines={["Colophon"]} />
        </div>
        <Slab size="sm" label="TG" />
      </header>

      <div className="gr-masthead g4">
        <div data-rv="">
          <h2 className="gr-h">Masthead</h2>
          <p className="gr-masthead-name">{profile.name}</p>
          <p>
            {profile.role}
            <br />
            {profile.location}
          </p>
        </div>
        <div data-rv="" style={d(1)}>
          <h2 className="gr-h">This issue</h2>
          <p>{profile.description}</p>
        </div>
        <div data-rv="" style={d(2)}>
          <h2 className="gr-h">In progress</h2>
          <dl className="gr-dl">
            {currently.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div data-rv="" style={d(3)}>
          <h2 className="gr-h">Production notes</h2>
          <p>
            {MAST}, issue {ISSUE}. Set in Hanken Grotesk and Geist Mono. Built with Next.js and React. Printed on black stock, one spot colour:
            Klein blue.
          </p>
        </div>
      </div>

      <section className="gr-contrib" aria-labelledby="gr-contrib-h">
        <h2 id="gr-contrib-h" className="gr-art-label" data-rv="">
          <b>A</b>
          <span>Contributors</span>
        </h2>
        <ol>
          {[...timeline].reverse().map((t, i) => (
            <li key={t.title} data-rv="" style={d(i)}>
              <b>{t.year}</b>
              <strong>{t.title}</strong>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="gr-spread gr-blue gr-editorial" aria-labelledby="gr-ed-h">
        <p className="gr-kick">
          <b>B</b>
          <span id="gr-ed-h">Editorial note</span>
        </p>
        <ol>
          {principles.map((p, i) => (
            <li key={p.num} data-rv="" style={d(i)}>
              <b>{p.num}</b>
              <strong>{p.title}</strong>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="gr-spread gr-paper gr-corr" aria-labelledby="gr-corr-h">
        <div className="gr-corr-l">
          <p className="gr-kick">
            <b>C</b>
            <span id="gr-corr-h">Correspondence</span>
          </p>
          <Lines as="h2" className="gr-display" lines={["Letters to", "the editor."]} />
          <p className="gr-corr-p">{profile.availability}. {profile.availabilityDetail}.</p>
          <div className="gr-corr-mail">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <CopyEmail email={profile.email} />
          </div>
        </div>
        <div className="gr-corr-form">
          <ContactForm email={profile.email} />
        </div>
      </section>
    </section>
  );
}

// ---- Not found ----

export function Missing({ path }: { path: string }) {
  return (
    <section className="gr-missing">
      <Kicker n="p.404">Erratum</Kicker>
      <Lines className="gr-numeral gr-numeral-404" lines={["404"]} />
      <div className="gr-missing-copy">
        <Lines as="h1" className="gr-display" lines={["This page was not", "printed in this issue."]} />
        <p data-rv="">
          <code>{path}</code> does not appear in the contents. It may have been cut at the proof stage, or the page number was misprinted.
        </p>
        <ol className="gr-rows" data-rv="">
          {sections.map((s) => (
            <li key={s.n}>
              <Link href={s.href}>
                <b>{s.n}</b>
                <span>{s.label}</span>
                <em>p.{s.p}</em>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
