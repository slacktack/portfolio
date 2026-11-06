"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ContactForm } from "@/components/contact-form";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { openThemes } from "@/components/skin";
import { ThemeTeaser } from "@/components/theme-palette";
import { currently, getNextNote, internalTools, labItems, ledger, notes, principles, profile, projects, stage, timeline, type Note } from "@/lib/site";
import { flyMarks } from "./data";
import { Arrow, Glyph, Kicker, SectionHead, tint } from "./ui";

/* Projects: the hangar */

function Recorder() {
  const [i, setI] = useState(0);
  const vid = useRef<HTMLVideoElement>(null);
  const s = stage[i];
  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => io.disconnect();
  }, [i]);
  return (
    <section className="ob-block ob-rec" aria-label="Flight recorder">
      <SectionHead k="Flight recorder" title="Real screen recordings, unedited" note="Pick a tape. Each one has a live link." />
      <div className="ob-rec-screen">
        <video key={s.slug} ref={vid} src={s.video} poster={s.poster} muted loop playsInline preload="metadata" aria-label={`Screen recording: ${s.title}`} />
        <div className="ob-rec-hud" aria-hidden="true">
          <span className="ob-rec-dot">REC</span>
          <span>
            TAPE {String(i + 1).padStart(2, "0")}/{String(stage.length).padStart(2, "0")}
          </span>
        </div>
        <div className="ob-rec-cap">
          <div>
            <small>{s.tag}</small>
            <b>{s.title}</b>
            <p>{s.tagline}</p>
          </div>
          <a className="ob-btn" href={s.href} target="_blank" rel="noreferrer">
            Open live <Arrow dir="out" />
          </a>
        </div>
      </div>
      <div className="ob-tapes" role="tablist" aria-label="Recordings">
        {stage.map((t, k) => (
          <button key={t.slug} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)}>
            <span>{String(k + 1).padStart(2, "0")}</span>
            {t.title}
            <small>{t.tag}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ProjectsView() {
  const work = ledger.filter((l) => l.group === "work");
  const own = ledger.filter((l) => l.group === "personal");
  return (
    <div className="ob-v ob-v-projects">
      <Kicker>Hangar bay · {projects.length} craft parked</Kicker>
      <h2 className="ob-h2">
        Side builds, <em>fuelled and flying.</em>
      </h2>
      <p className="ob-lede">Everything here is live. Recordings first, then each build in its own bay, then the commit ledger that keeps me honest.</p>

      <Recorder />

      <section className="ob-block" aria-label="The bay">
        <SectionHead k="The bay" title="Every build, one bay each" />
        <ol className="ob-bays">
          {projects.map((p, i) => (
            <li key={p.slug} className="ob-bay" style={{ "--ob-i": i } as CSSProperties}>
              <div className="ob-bay-plate">
                <span>BAY {String(i + 1).padStart(2, "0")}</span>
                <span>{p.year}</span>
              </div>
              <div className={`ob-bay-img${p.portrait ? " is-portrait" : ""}`}>
                <Image src={p.image} alt={`${p.title} screenshot`} fill sizes="(max-width: 900px) 92vw, 640px" />
                <em>{p.highlight}</em>
              </div>
              <div className="ob-bay-body">
                <small>{p.category}</small>
                <h4>{p.title}</h4>
                <p className="ob-bay-tag">{p.tagline}</p>
                <p>{p.description}</p>
                <p className="ob-bay-note">{p.note}</p>
                <ul className="ob-chips">
                  {p.stack.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <a className="ob-btn" href={p.live} target="_blank" rel="noreferrer">
                  Launch {p.title} <Arrow dir="out" />
                </a>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ob-block" aria-label="Commit ledger">
        <SectionHead k="Logbook" title="The commit ledger" note="Authored commits against each repo's total." />
        {[
          { t: "At Buyhatke", rows: work },
          { t: "After hours", rows: own },
        ].map((g) => (
          <div key={g.t} className="ob-ledger">
            <h4>{g.t}</h4>
            <ul>
              {g.rows.map((l) => {
                const share = l.total ? Math.max(2, Math.round((l.mine / l.total) * 100)) : 0;
                return (
                  <li key={l.name}>
                    <div>
                      <b>{l.name}</b>
                      <p>{l.line}</p>
                      <small>{l.proof}</small>
                    </div>
                    <div className="ob-meter" style={{ "--ob-share": `${share}%` } as CSSProperties}>
                      {l.total ? (
                        <>
                          <span>
                            <b>{l.mine.toLocaleString("en-IN")}</b> of {l.total.toLocaleString("en-IN")}
                          </span>
                          <i aria-hidden="true" />
                        </>
                      ) : (
                        <span>Local build</span>
                      )}
                      {l.span ? <small>{l.span}</small> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="ob-block" aria-label="Internal tools">
        <SectionHead k="Ground crew" title="Internal tools behind the scenes" />
        <div className="ob-crew">
          {internalTools.map((t) => (
            <div key={t.name}>
              <small>{t.kind}</small>
              <b>{t.name}</b>
              <p>{t.line}</p>
              <ul>
                {t.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* Lab: the dome */

const experiments: Record<string, { label: string; title: string; note: string; demo: ReactNode; from?: string }> = {
  "cache-key": { label: "Flights · cache design", title: "Change one thing. Watch the cache decide.", note: "Controls that change the answer miss the cache. Controls that only reshape it never leave the building.", demo: <CacheKeyLab />, from: "flights" },
  deadlines: { label: "Hotels · stragglers", title: "Average latency is a liar.", note: "Eight partners race and one hangs. Drag the time budget and see what the user waits for, with and without a deadline.", demo: <DeadlineLab />, from: "hotels" },
  identity: { label: "Hotels · identity", title: "Same name is not the same hotel.", note: "Seven partner records around one real hotel, two of them impostors. Find the gate settings that merge the truth and nothing else.", demo: <IdentityLab />, from: "hotels" },
  logs: { label: "Observability · alerting", title: "Silence is a signal.", note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.", demo: <LogStreamLab />, from: "observability" },
  memcached: { label: "Systems · from scratch", title: "Memcached, rebuilt.", note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation and watch keys expire.", demo: <MemcachedLab /> },
  "load-balancer": { label: "Build · Go load balancer", title: "Weighted routing you can break.", note: "Weighted routing, health checks, circuit breakers and sticky sessions. The routing logic runs in your browser, so kill a node and watch the next request fail over.", demo: <LoadBalancerDemo /> },
  "vortex-vault": {
    label: "Build · VortexVault",
    title: "One vector database. Two runtimes.",
    note: "The same engine implemented twice, in C++ and in Rust, behind a shared segment format and a shared benchmark harness. Still in progress.",
    demo: (
      <div className="ob-vault">
        <p>
          The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state. Keeping those semantics identical across two runtimes is the actual project.
        </p>
        <ol className="ob-path">
          {[
            ["Client", "insert / query / delete"],
            ["WAL", "durable append + replay"],
            ["Memtable", "mutable in-memory index"],
            ["Segment", "immutable on-disk index"],
            ["Compaction", "merge + tombstone cleanup"],
          ].map(([a, b], i) => (
            <li key={a} style={{ "--ob-i": i } as CSSProperties}>
              <i aria-hidden="true">{i + 1}</i>
              <b>{a}</b>
              <span>{b}</span>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
};

export function LabView() {
  const [cur, setCur] = useState(() => {
    const h = typeof location !== "undefined" ? location.hash.slice(1) : "";
    return h in experiments ? h : labItems[0].slug;
  });
  const pickExp = (slug: string) => {
    setCur(slug);
    history.replaceState(history.state, "", `#${slug}`);
  };
  const e = experiments[cur];
  const idx = labItems.findIndex((l) => l.slug === cur);
  return (
    <div className="ob-v ob-v-lab">
      <Kicker>Lab dome · {labItems.length} experiments</Kicker>
      <h2 className="ob-h2">
        Small systems, <em>built to be broken.</em>
      </h2>
      <p className="ob-lede">Mechanisms from the outposts, rebuilt small enough to hold in one hand. Everything runs in your browser, and simulations are labelled as simulations.</p>
      <div className="ob-exp-tabs" role="tablist" aria-label="Experiments">
        {labItems.map((l, i) => (
          <button key={l.slug} type="button" role="tab" id={`ob-tab-${l.slug}`} aria-controls="ob-exp" aria-selected={l.slug === cur} onClick={() => pickExp(l.slug)}>
            <span>EXP {String(i + 1).padStart(2, "0")}</span>
            <b>{l.title}</b>
            <small>{l.detail}</small>
          </button>
        ))}
      </div>
      <section className="ob-exp" id="ob-exp" role="tabpanel" aria-labelledby={`ob-tab-${cur}`} key={cur}>
        <header>
          <span className="ob-exp-n">EXP {String(idx + 1).padStart(2, "0")}</span>
          <small>{e.label}</small>
          <h3>{e.title}</h3>
          <p>{e.note}</p>
        </header>
        <div className="ob-exp-demo">{e.demo}</div>
        {e.from ? (
          <Link className="ob-link" href={`/systems/${e.from}`}>
            From the {e.from} outpost <Arrow />
          </Link>
        ) : null}
      </section>
    </div>
  );
}

/* Notes: the archive */

export function NotesView() {
  return (
    <div className="ob-v ob-v-notes">
      <Kicker>Archive · logbook</Kicker>
      <h2 className="ob-h2">
        Field notes <em>from the hot path.</em>
      </h2>
      <p className="ob-lede">Long-form entries on latency, quotas and keeping the request path boring.</p>
      <ol className="ob-log">
        {notes.map((n, i) => (
          <li key={n.slug} style={{ "--ob-i": i } as CSSProperties}>
            <Link href={`/notes/${n.slug}`} className="ob-log-entry">
              <span className="ob-log-stamp">
                <b>ENTRY {String(i + 1).padStart(2, "0")}</b>
                <small>{n.date}</small>
              </span>
              <span className="ob-log-body">
                <small>
                  {n.category} · {n.readTime}
                </small>
                <b>{n.title}</b>
                <span>{n.dek}</span>
              </span>
              <span className="ob-log-go">
                Read <Arrow />
              </span>
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
    <article className="ob-v ob-v-note">
      <Link href="/notes" className="ob-link ob-back">
        <Arrow dir="left" /> Archive
      </Link>
      <Kicker>
        {n.category} · {n.date} · {n.readTime}
      </Kicker>
      <h2 className="ob-h2">{n.title}</h2>
      <p className="ob-dek">{n.dek}</p>
      <div className="ob-article">
        {n.sections.map((s, i) => (
          <section key={i}>
            {s.heading ? <h3>{s.heading}</h3> : null}
            {s.body.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
            {s.quote ? <blockquote>{s.quote}</blockquote> : null}
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
          </section>
        ))}
      </div>
      {next.slug !== n.slug ? (
        <nav className="ob-pager" aria-label="Next note">
          <Link href={`/notes/${next.slug}`} className="ob-next" style={tint("#8b5cf6")}>
            <small>Next entry</small>
            <b>
              {next.title} <Arrow />
            </b>
          </Link>
        </nav>
      ) : null}
    </article>
  );
}

/* About: the cottage */

export function AboutView() {
  return (
    <div className="ob-v ob-v-about">
      <div className="ob-licence">
        <div className="ob-licence-top">
          <span>Pilot licence</span>
          <span>Orbit · home cottage</span>
        </div>
        <div className="ob-licence-main">
          <div className="ob-licence-avatar" aria-hidden="true">
            TG
          </div>
          <div>
            <h2 className="ob-h2">{profile.name}</h2>
            <p>
              {profile.role} · {profile.location}
            </p>
          </div>
        </div>
        <dl>
          <div>
            <dt>Status</dt>
            <dd>{profile.availability}</dd>
          </div>
          <div>
            <dt>Looking for</dt>
            <dd>{profile.availabilityDetail}</dd>
          </div>
          <div>
            <dt>Radio</dt>
            <dd>{profile.email}</dd>
          </div>
        </dl>
        <p className="ob-licence-tag">{profile.tagline}</p>
      </div>
      <p className="ob-lede">{profile.description}</p>

      <section className="ob-block">
        <SectionHead k="Flight log" title="Where I have flown" />
        <ol className="ob-flog">
          {timeline.map((t) => (
            <li key={t.title}>
              <span>{t.year}</span>
              <b>{t.title}</b>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ob-block">
        <SectionHead k="Rules of flight" title="Three principles" />
        <div className="ob-rules3">
          {principles.map((p) => (
            <div key={p.num}>
              <span>{p.num}</span>
              <b>{p.title}</b>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="ob-block">
        <SectionHead k="Instruments" title="Currently" />
        <dl className="ob-now">
          {currently.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ob-block ob-radio">
        <SectionHead k="Radio the pilot" title="Say hello" note="Email is the fastest way in." />
        <div className="ob-radio-mail">
          <a href={`mailto:${profile.email}`} className="ob-btn">
            {profile.email} <Arrow dir="out" />
          </a>
          <CopyEmail email={profile.email} />
        </div>
        <ContactForm email={profile.email} />
      </section>
    </div>
  );
}

/* Missing and portal */

export function MissingView({ path }: { path: string }) {
  return (
    <div className="ob-v ob-v-missing">
      <div className="ob-lost">
        <Glyph k="void" size={40} />
        <span>Signal lost</span>
      </div>
      <h2 className="ob-h2">
        Uncharted sector. <em>Nothing has landed here.</em>
      </h2>
      <p className="ob-lede">
        <code>{path}</code> is not on any map of this planet. Pick a landmark and the autopilot will take you there.
      </p>
      <div className="ob-lost-list">
        {flyMarks
          .filter((m) => m.href)
          .map((m) => (
            <Link key={m.key} href={m.href!} style={tint(m.color)}>
              <Glyph k={m.key} />
              <b>{m.section}</b>
              <small>{m.name}</small>
            </Link>
          ))}
      </div>
    </div>
  );
}

export function PortalView() {
  return (
    <div className="ob-v ob-v-portal">
      <Kicker>Theme portal</Kicker>
      <h2 className="ob-h2">
        Step through. <em>Land on a different website.</em>
      </h2>
      <p className="ob-lede">This planet is one version of the portfolio. The portal leads to the others: same work, a completely different site each time.</p>
      <button type="button" className="ob-btn ob-btn-big" onClick={openThemes}>
        Open the theme portal <Arrow />
      </button>
      <ThemeTeaser className="ob-teaser" />
    </div>
  );
}
