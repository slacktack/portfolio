"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { currently, getNextNote, labItems, ledger, notes, principles, profile, systems, timeline, type Note as NoteT } from "@/lib/site";
import { Arrow, css, player, PlayGlyph, tc, usePlaying, Wide } from "./ui";

function Hero({ k, title, children }: { k: string; title: string; children?: ReactNode }) {
  return (
    <header className="ab-hero" data-ab="">
      <span className="ab-kicker">{k}</span>
      <Wide text={title} as="h1" className="ab-title ab-title-lg" />
      {children}
    </header>
  );
}

const demos: Record<string, { node: ReactNode; src?: [string, string] }> = {
  "cache-key": { node: <CacheKeyLab />, src: ["flights", "Flight comparison"] },
  deadlines: { node: <DeadlineLab />, src: ["hotels", "Hotel comparison"] },
  identity: { node: <IdentityLab />, src: ["hotels", "Hotel comparison"] },
  logs: { node: <LogStreamLab />, src: ["observability", "OpenObserve platform"] },
  memcached: { node: <MemcachedLab /> },
  "load-balancer": { node: <LoadBalancerDemo /> },
};

function Slate({ n, title, detail, year, src }: { n: number; title: string; detail: string; year: string; src?: [string, string] }) {
  return (
    <div className="ab-slate">
      <div className="ab-slate-clap" aria-hidden="true">
        <i />
      </div>
      <dl>
        <div>
          <dt>Prod</dt>
          <dd>The invisible layer</dd>
        </div>
        <div>
          <dt>Scene</dt>
          <dd>04.{n}</dd>
        </div>
        <div>
          <dt>Take</dt>
          <dd>{year}</dd>
        </div>
      </dl>
      <h2>{title}</h2>
      <p>{detail}</p>
      {src ? (
        <Link href={`/systems/${src[0]}`} className="ab-slate-src">
          From the scene · {src[1]} <Arrow />
        </Link>
      ) : null}
    </div>
  );
}

export function Lab() {
  return (
    <div className="ab-lab">
      <Hero k="Chapter 04 · Special features" title="Practical effects">
        <p className="ab-sub">The mechanisms from the scenes, rebuilt small enough to break on purpose. Every take runs live in your browser. Simulations are labelled as simulations.</p>
        <ol className="ab-takes-index">
          {labItems.map((l, i) => (
            <li key={l.slug}>
              <a href={`#${l.slug}`}>
                <em>04.{i + 1}</em>
                {l.title}
              </a>
            </li>
          ))}
        </ol>
      </Hero>
      {labItems.map((l, i) => {
        const d = demos[l.slug];
        return (
          <section className="ab-take" id={l.slug} key={l.slug} data-shot={`04.${i + 1} · ${l.title}`}>
            <div className="ab-take-slate" data-ab="">
              <Slate n={i + 1} title={l.title} detail={l.detail} year={l.year} src={d?.src} />
            </div>
            <div className="ab-monitor" data-ab="">
              <span className="ab-monitor-rec" aria-hidden="true">
                <i /> Rec · take {i + 1}
              </span>
              {d ? (
                d.node
              ) : (
                <div className="ab-vv">
                  <p>
                    VortexVault implements the same vector database engine twice, once in C++ and once in Rust, behind a shared segment format and a shared benchmark harness. The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state.
                  </p>
                  <p>Still in progress. The benchmark reports latency, recall and memory footprint for both implementations against the same workload.</p>
                  <ol className="ab-schema" style={css({ "--ab-cols": 5 })} data-in="">
                    {[
                      ["Client", "insert / query / delete"],
                      ["WAL", "durable append + replay"],
                      ["Memtable", "mutable in-memory index"],
                      ["Segment", "immutable on-disk index"],
                      ["Compaction", "merge + tombstone cleanup"],
                    ].map(([a, b], k) => (
                      <li key={a} style={css({ "--ab-i": k })}>
                        <em>{String(k + 1).padStart(2, "0")}</em>
                        <b>{a}</b>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {l.slug === "load-balancer" ? (
                <dl className="ab-lbnotes">
                  <div>
                    <dt>Weighted routing</dt>
                    <dd>Each healthy node gets a share proportional to its weight. Set a weight to zero to drain it.</dd>
                  </div>
                  <div>
                    <dt>Health and circuit breaker</dt>
                    <dd>Three failed checks open the circuit. Traffic stops landing on the node before users notice.</dd>
                  </div>
                  <div>
                    <dt>Sticky sessions</dt>
                    <dd>One client keeps landing on the same node until it leaves the healthy set.</dd>
                  </div>
                </dl>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function bars(seed: string, n: number) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const out: number[] = [];
  for (let k = 0; k < n; k++) {
    h = (h * 1103515245 + 12345) >>> 0;
    out.push(0.18 + ((h >>> 8) % 1000) / 1250);
  }
  return out;
}

function Wave({ seed, n = 48 }: { seed: string; n?: number }) {
  return (
    <span className="ab-wave" aria-hidden="true">
      {bars(seed, n).map((v, k) => (
        <i key={k} style={css({ "--ab-v": v.toFixed(2), "--ab-i": k })} />
      ))}
    </span>
  );
}

export function Notes() {
  return (
    <div className="ab-notes">
      <Hero k="Chapter 05 · Audio tracks" title="Director's commentary">
        <p className="ab-sub">Field notes on why the scenes were shot the way they were. Pick a track.</p>
      </Hero>
      <ol className="ab-tracks">
        {notes.map((n, i) => (
          <li key={n.slug} data-ab="" style={css({ "--ab-i": i })}>
            <Link href={`/notes/${n.slug}`} className="ab-track-row" data-cursor="Listen">
              <span className="ab-track-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ab-track-main">
                <em>
                  Track {i + 1} · {n.category}
                </em>
                <b>{n.title}</b>
                <span>{n.dek}</span>
                <Wave seed={n.slug} />
              </span>
              <span className="ab-track-meta">
                <b>{n.readTime}</b>
                <span>{n.date}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Note({ n }: { n: NoteT }) {
  const next = getNextNote(n.slug);
  const i = notes.findIndex((x) => x.slug === n.slug);
  const counts = n.sections.map((s) => s.body.join(" ").split(/\s+/).length + (s.list?.join(" ").split(/\s+/).length ?? 0));
  const stamps = counts.map((_, k) => tc((counts.slice(0, k).reduce((a, b) => a + b, 0) / 150) * 60));
  return (
    <article className="ab-note">
      <header className="ab-hero ab-note-hero" data-ab="">
        <span className="ab-kicker">
          Commentary track {String(i + 1).padStart(2, "0")} · {n.category} · {n.date} · {n.readTime}
        </span>
        <h1 className="ab-note-title">{n.title}</h1>
        <p className="ab-logline">{n.dek}</p>
        <div className="ab-nowplaying">
          <span>
            <i /> Now playing
          </span>
          <Wave seed={n.slug} n={72} />
        </div>
      </header>
      <div className="ab-transcript">
        {n.sections.map((s, k) => (
          <section key={k} className="ab-tsec" data-ab="">
            <span className="ab-tstamp">{stamps[k]}</span>
            <div>
              {s.heading ? <h2>{s.heading}</h2> : null}
              {s.body.map((b, j) => (
                <p key={j}>{b}</p>
              ))}
              {s.list ? (
                <ul>
                  {s.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              ) : null}
              {s.code ? (
                <pre>
                  <code>{s.code}</code>
                </pre>
              ) : null}
              {s.quote ? <blockquote>{s.quote}</blockquote> : null}
            </div>
          </section>
        ))}
      </div>
      {next.slug !== n.slug ? (
        <Link href={`/notes/${next.slug}`} className="ab-nextscene" data-ab="">
          <span className="ab-kicker">
            <b>Next track</b> {next.category} · {next.readTime}
          </span>
          <span className="ab-note-next">{next.title}</span>
          <span className="ab-watch">
            Listen <Arrow />
          </span>
        </Link>
      ) : null}
    </article>
  );
}

export function About() {
  const playing = usePlaying();
  return (
    <div className="ab-about">
      <Hero k="Chapter 06 · End credits" title="Cast and crew">
        <button type="button" className="ab-trailer" onClick={() => player.set(!playing)}>
          <span className="ab-trailer-disc">
            <PlayGlyph on={playing} />
          </span>
          <span>{playing ? "Stop the roll" : "Roll credits"}</span>
        </button>
      </Hero>

      <section className="ab-credits" data-ab="">
        <p className="ab-credits-lead">Written, engineered and directed by</p>
        <Wide text={profile.name} className="ab-title ab-title-md" />
        <dl className="ab-cr">
          <div>
            <dt>Role</dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>
              {profile.availability} · {profile.availabilityDetail}
            </dd>
          </div>
          {currently.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ab-credits" data-ab="">
        <p className="ab-credits-lead">Filmography</p>
        <ol className="ab-filmo">
          {timeline.map((t) => (
            <li key={t.title}>
              <em>{t.year}</em>
              <b>{t.title}</b>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ab-rules" aria-label="Principles">
        {principles.map((p, k) => (
          <div key={p.num} data-ab="" style={css({ "--ab-i": k })}>
            <em>Rule {p.num}</em>
            <b>{p.title}</b>
            <p>{p.body}</p>
          </div>
        ))}
      </section>

      <section className="ab-credits" data-ab="">
        <p className="ab-credits-lead">Starring</p>
        <ul className="ab-starring">
          {systems.map((s) => (
            <li key={s.slug}>
              <Link href={`/systems/${s.slug}`}>
                <span>{s.title}</span>
                <em>{s.metrics[0].value}</em>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="ab-credits" data-ab="">
        <p className="ab-credits-lead">Production ledger · authored commits</p>
        <ul className="ab-ledger">
          {ledger.map((l) => (
            <li key={l.name}>
              <b>{l.name}</b>
              <span>{l.line}</span>
              <em>
                {l.span}
                {l.total ? ` · ${l.mine} of ${l.total} commits` : ""}
              </em>
            </li>
          ))}
        </ul>
      </section>

      <section className="ab-book" data-ab="">
        <span className="ab-kicker">
          <b>For bookings</b> {profile.availabilityDetail}
        </span>
        <a href={`mailto:${profile.email}`} className="ab-mail">
          {profile.email}
        </a>
        <CopyEmail email={profile.email} />
      </section>
    </div>
  );
}

export function Missing({ path }: { path: string }) {
  return (
    <div className="ab-missing">
      <div className="ab-burn" aria-hidden="true" />
      <span className="ab-kicker">
        <b>Signal lost</b> Reel {path}
      </span>
      <Wide text="Scene missing" as="h1" className="ab-title ab-title-lg" />
      <p className="ab-logline">This reel was left on the cutting room floor.</p>
      <div className="ab-missing-go">
        <Link href="/" className="ab-trailer">
          <span className="ab-trailer-disc">
            <PlayGlyph on={false} />
          </span>
          <span>Back to the title sequence</span>
        </Link>
        <Link href="/systems" className="ab-watch">
          Scene selection <Arrow />
        </Link>
      </div>
    </div>
  );
}
