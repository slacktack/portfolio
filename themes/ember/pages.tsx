"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { Ledger } from "@/components/ledger";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { openThemes } from "@/components/skin";
import { currently, getNextNote, getProject, labItems, notes, principles, profile, stage, timeline, type Note as NoteT } from "@/lib/site";
import { noteId } from "./layout";
import { FrameLabel, Ico, Sel, Sticky, Swatches, gradFor } from "./ui";

function PageHead({ k, icon, children, lede }: { k: string; icon: ReactNode; children: ReactNode; lede?: ReactNode }) {
  return (
    <header className="em-pagehead" data-em-in="">
      <span className="em-kicker">
        {icon} {k}
      </span>
      <h1>{children}</h1>
      {lede ? <p>{lede}</p> : null}
    </header>
  );
}

// Projects: a moodboard of pinned recordings

const tilt = [-3.2, 2.1, -1.4, 2.8, -2.4, 1.6, -0.8, 3.1, -2.8, 1.2, -1.8, 2.4];
const swatchSets = [
  ["#F7EDE6", "#FFB38F", "#E8382B"],
  ["#FFD9C2", "#FF6B57", "#8E1020"],
  ["#2747E8", "#F7EDE6", "#C81E1E"],
];

function Pinned({ i }: { i: number }) {
  const s = stage[i];
  const proj = getProject(s.slug);
  const vid = useRef<HTMLVideoElement>(null);
  const portrait = s.slug === "wardrobe-ai";

  useEffect(() => {
    const v = vid.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.45 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <article id={`p-${s.slug}`} className="em-pinned" data-portrait={portrait ? "1" : undefined} data-em-in="" style={{ "--em-r": `${tilt[i % tilt.length]}deg`, "--em-d": `${(i % 3) * 80}ms` } as CSSProperties}>
      <span className="em-tape em-tape-l" aria-hidden="true" />
      <span className="em-tape em-tape-r" aria-hidden="true" />
      <div className="em-pinned-media">
        <video ref={vid} src={s.video} poster={s.poster} muted loop playsInline preload="none" aria-label={`${s.title} screen recording`} />
        <span className="em-pinned-tag">{s.tag === "Buyhatke" ? "At work · Buyhatke" : "After hours"}</span>
      </div>
      <div className="em-pinned-cap">
        <h2 className="em-serif">{s.title}</h2>
        <p>{s.tagline}</p>
        {proj ? (
          <ul className="em-chips">
            {proj.stack.slice(0, 4).map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        <a href={s.href} target="_blank" rel="noreferrer" className="em-live">
          Open live <Ico.out width={12} height={12} />
          <span className="em-vh">{s.title} (opens in a new tab)</span>
        </a>
      </div>
      <Sel />
    </article>
  );
}

export function Projects() {
  const work = stage.map((_, i) => i).filter((i) => stage[i].tag === "Buyhatke");
  const own = stage.map((_, i) => i).filter((i) => stage[i].tag !== "Buyhatke");
  const notesFrom = ["train-tracker", "flight-tracker", "chauka-cricket"].map((s) => getProject(s)).filter(Boolean);
  return (
    <div className="em-mood">
      <PageHead k="Page · Board" icon={<Ico.board width={13} height={13} />} lede="Real screen recordings, pinned up. Hover one to straighten it, open the live build from its caption.">
        Pinned <em className="em-serif">recordings.</em>
      </PageHead>

      <div className="em-mood-zone" data-zone="work">
        <span className="em-zone-tag">Section · At work</span>
        <div className="em-mood-grid">
          {work.map((i) => (
            <Pinned key={stage[i].slug} i={i} />
          ))}
          <div className="em-mood-swatch" data-em-in="" style={{ "--em-r": "4deg" } as CSSProperties} aria-hidden="true">
            <Swatches list={swatchSets[0]} />
            <span>Ember / warm</span>
          </div>
        </div>
      </div>

      <div className="em-mood-zone" data-zone="own">
        <span className="em-zone-tag">Section · After hours</span>
        <div className="em-mood-grid">
          {own.map((i, k) => (
            <PinnedWithNote key={stage[i].slug} i={i} k={k} note={k < notesFrom.length ? notesFrom[k]?.note : undefined} />
          ))}
          <div className="em-mood-swatch" data-em-in="" style={{ "--em-r": "-3deg" } as CSSProperties} aria-hidden="true">
            <Swatches list={swatchSets[2]} />
            <span>Redline / cobalt</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PinnedWithNote({ i, k, note }: { i: number; k: number; note?: string }) {
  if (!note) return <Pinned i={i} />;
  return (
    <>
      <Pinned i={i} />
      <Sticky tone={(["butter", "pink", "peach"] as const)[k % 3]} i={k} k={`Note · ${stage[i].title}`} title={getProject(stage[i].slug)?.highlight ?? stage[i].title}>
        <p>{note}</p>
      </Sticky>
    </>
  );
}

// Lab: prototypes in a switchable frame

type Demo = { slug: string; label: string; title: ReactNode; note: string; demo: ReactNode; from?: { slug: string; title: string } };

const demos: Demo[] = [
  { slug: "cache-key", label: "Flights · cache design", title: <>Change one thing. Watch the cache <em className="em-serif">decide.</em></>, note: "A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building.", demo: <CacheKeyLab />, from: { slug: "flights", title: "Flight comparison" } },
  { slug: "deadlines", label: "Hotels · stragglers", title: <>Average latency is a <em className="em-serif">liar.</em></>, note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.", demo: <DeadlineLab />, from: { slug: "hotels", title: "Hotel comparison" } },
  { slug: "identity", label: "Hotels · identity", title: <>Same name is not the <em className="em-serif">same hotel.</em></>, note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.", demo: <IdentityLab />, from: { slug: "hotels", title: "Hotel comparison" } },
  { slug: "logs", label: "Observability · alerting", title: <>Silence is a <em className="em-serif">signal.</em></>, note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.", demo: <LogStreamLab />, from: { slug: "observability", title: "OpenObserve platform" } },
  { slug: "memcached", label: "Systems · from scratch", title: <>Memcached, <em className="em-serif">rebuilt.</em></>, note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire.", demo: <MemcachedLab /> },
  { slug: "load-balancer", label: "Build · Go load balancer", title: <>Weighted routing you can <em className="em-serif">break.</em></>, note: "A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo runs the routing logic in your browser so you can kill a node and watch the next request fail over.", demo: <LoadBalancerDemo /> },
  {
    slug: "vortex-vault",
    label: "Build · VortexVault",
    title: <>One vector database. <em className="em-serif">Two runtimes.</em></>,
    note: "A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the same benchmark. Still in progress.",
    demo: (
      <div className="em-vv">
        <p>The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state. Keeping those semantics identical across two runtimes is the actual project.</p>
        <ol className="em-arch em-arch-v">
          {[
            ["Client", "insert / query / delete"],
            ["WAL", "durable append + replay"],
            ["Memtable", "mutable in-memory index"],
            ["Segment", "immutable on-disk index"],
            ["Compaction", "merge + tombstone cleanup"],
          ].map(([l, d], k) => (
            <li key={l}>
              <span className="em-pin">{k + 1}</span>
              <b>{l}</b>
              <span>{d}</span>
            </li>
          ))}
        </ol>
        <ul className="em-chips">
          <li>C++ engine</li>
          <li>Rust engine</li>
          <li>in progress</li>
        </ul>
      </div>
    ),
  },
];

export function Lab() {
  const [on, setOn] = useState(0);
  useEffect(() => {
    const sync = () => {
      const k = demos.findIndex((d) => d.slug === location.hash.slice(1));
      if (k >= 0) setOn(k);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const pick = (k: number) => {
    setOn(k);
    history.replaceState(null, "", `#${demos[k].slug}`);
  };
  const d = demos[on];
  return (
    <div className="em-lab">
      <PageHead k="Page · Prototypes" icon={<Ico.lab width={13} height={13} />} lede="The mechanisms from the frames, rebuilt small enough to break on purpose. Every experiment runs in your browser; simulations are labelled as simulations.">
        Small systems, <em className="em-serif">strange constraints.</em>
      </PageHead>
      <div className="em-lab-strip" role="tablist" aria-label="Prototypes" data-lenis-prevent="">
        {labItems.map((l, k) => (
          <button key={l.slug} type="button" role="tab" id={`tab-${l.slug}`} aria-selected={on === k} aria-controls="em-lab-stage" className="em-lab-tab" onClick={() => pick(k)} style={{ "--em-g": gradFor(k) } as CSSProperties}>
            <span className="em-lab-thumb" aria-hidden="true">
              <Ico.lab width={16} height={16} />
            </span>
            <b>{l.title}</b>
            <em>{l.detail}</em>
          </button>
        ))}
      </div>
      <section id="em-lab-stage" className="em-lab-stage" role="tabpanel" aria-labelledby={`tab-${d.slug}`} key={d.slug}>
        <span id={d.slug} className="em-anchor" />
        <div className="em-lab-copy">
          <span className="em-kicker">
            {String(on + 1).padStart(2, "0")} · {d.label}
          </span>
          <h2>{d.title}</h2>
          <p>{d.note}</p>
          {d.from ? (
            <Link href={`/systems/${d.from.slug}`} className="em-from">
              <span>From the frame</span>
              <b>{d.from.title}</b>
              <Ico.arrow width={13} height={13} />
            </Link>
          ) : null}
          <span className="em-lab-sim">Simulation · state resets on reload</span>
        </div>
        <div className="em-lab-frame">
          <FrameLabel name={`Prototype — ${labItems[on].title}`} />
          <div className="em-lab-dev">
            <div className="em-lab-bar" aria-hidden="true">
              <i />
              <i />
              <i />
              <span>▶ Present</span>
            </div>
            <div className="em-demo">{d.demo}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Notes: a doc frame

function Ruler() {
  return (
    <div className="em-ruler" aria-hidden="true">
      {Array.from({ length: 17 }, (_, i) => (
        <span key={i}>{i * 50}</span>
      ))}
    </div>
  );
}

export function Notes() {
  return (
    <div className="em-notes">
      <PageHead k="Page · Doc" icon={<Ico.doc width={13} height={13} />} lede="Long-form notes from the systems on this board. One doc, a few chapters.">
        Field <em className="em-serif">notes.</em>
      </PageHead>
      <div className="em-docframe" data-em-in="">
        <FrameLabel name="Doc — Field notes" dims="A4 · 820 × auto" />
        <div className="em-paper">
          <Ruler />
          <div className="em-paper-b">
            <span className="em-paper-k">Contents</span>
            <ol className="em-toc">
              {notes.map((n, i) => (
                <li key={n.slug} data-em-in="" style={{ "--em-d": `${i * 90}ms` } as CSSProperties}>
                  <Link href={`/notes/${n.slug}`} className="em-toc-row em-frame">
                    <span className="em-toc-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="em-toc-t">
                      <b>{n.title}</b>
                      <span>{n.dek}</span>
                    </span>
                    <span className="em-toc-m">
                      <em>{n.category}</em>
                      {n.date} · {n.readTime}
                    </span>
                    <Sel />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Note({ n }: { n: NoteT }) {
  const next = getNextNote(n.slug);
  return (
    <div className="em-note">
      <Link href="/notes" className="em-crumb">
        <Ico.back width={13} height={13} /> All notes
      </Link>
      <article className="em-docframe">
        <FrameLabel name={`Doc — ${n.title}`} dims={`${n.readTime} read`} />
        <div className="em-paper">
          <Ruler />
          <div className="em-paper-b">
            <header className="em-note-head">
              <span className="em-paper-k">
                {n.category} · {n.date} · {n.readTime}
              </span>
              <h1>{n.title}</h1>
              <p>{n.dek}</p>
            </header>
            {n.sections.map((s, i) => (
              <section key={i} id={noteId(i)} className="em-note-s">
                {s.heading ? <h2>{s.heading}</h2> : null}
                {s.body.map((b) => (
                  <p key={b.slice(0, 30)}>{b}</p>
                ))}
                {s.list ? (
                  <ul>
                    {s.list.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                ) : null}
                {s.code ? (
                  <pre className="em-code">
                    <code>{s.code}</code>
                  </pre>
                ) : null}
                {s.quote ? (
                  <aside className="em-cmt">
                    <span className="em-cmt-av" aria-hidden="true">
                      TG
                    </span>
                    <blockquote>{s.quote}</blockquote>
                  </aside>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </article>
      <nav className="em-pager-nav" aria-label="Next note">
        <Link href={`/notes/${next.slug}`} className="em-pn em-pn-next">
          <span>
            <em>Next doc · {next.readTime}</em>
            <b>{next.title}</b>
          </span>
          <span className="em-sqicon">
            <Ico.arrow width={16} height={16} />
          </span>
        </Link>
      </nav>
    </div>
  );
}

// About: studio credits

export function About() {
  return (
    <div className="em-about">
      <section id="credits" className="em-credits" data-em-in="">
        <FrameLabel name="Credits — Studio" dims="Auto layout" />
        <div className="em-credits-b">
          <span className="em-kicker">A design board by</span>
          <h1 className="em-serif">{profile.name}</h1>
          <p className="em-credits-tag">{profile.tagline}</p>
          <dl className="em-roll">
            <div>
              <dt>Role</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{profile.availability}</dd>
            </div>
            <div>
              <dt>Looking for</dt>
              <dd>{profile.availabilityDetail}</dd>
            </div>
            <div>
              <dt>Type</dt>
              <dd>Inter Tight · DM Serif Display</dd>
            </div>
          </dl>
          <p className="em-credits-desc">{profile.description}</p>
        </div>
      </section>

      <section id="history" className="em-hist" data-em-in="">
        <h2 className="em-h2">
          Version <em className="em-serif">history</em>
        </h2>
        <ol>
          {[...timeline].reverse().map((t, i) => (
            <li key={t.title} data-current={i === 0 ? "1" : undefined}>
              <i aria-hidden="true" />
              <span className="em-hist-y">{t.year}</span>
              <b>{t.title}</b>
              <p>{t.body}</p>
              {i === 0 ? <em>Current version</em> : null}
            </li>
          ))}
        </ol>
      </section>

      <section id="principles" className="em-princ">
        <h2 className="em-h2">
          Shared <em className="em-serif">styles</em>
        </h2>
        <div className="em-princ-grid">
          {principles.map((p, i) => (
            <article key={p.num} data-em-in="" style={{ background: gradFor([0, 3, 4][i]), "--em-d": `${i * 100}ms` } as CSSProperties}>
              <span>Style / {p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="currently" className="em-curr" data-em-in="">
        <h2 className="em-h2">
          Currently <em className="em-serif">editing</em>
        </h2>
        <ul>
          {currently.map((c, i) => (
            <li key={c.label} style={{ "--em-c": ["#E8382B", "#2747E8", "#FF8A5B", "#8E1020"][i] } as CSSProperties}>
              <span className="em-curr-cur" aria-hidden="true">
                <svg width="14" height="16" viewBox="0 0 18 20">
                  <path d="M1 1l15 7-6.5 1.8L6.6 17z" fill="currentColor" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
                </svg>
                <b>{c.label}</b>
              </span>
              <span>{c.value}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="ledger" className="em-ledger">
        <h2 className="em-h2">
          Commit <em className="em-serif">credits</em>
        </h2>
        <div className="em-demo">
          <Ledger />
        </div>
      </section>

      <section id="contact" className="em-contact" data-em-in="">
        <span className="em-kicker">Contact</span>
        <h2>
          Got a hard problem? <em className="em-serif">Leave a comment.</em>
        </h2>
        <a className="em-contact-mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <div className="em-contact-row">
          <a className="em-sqbtn" href={`mailto:${profile.email}`}>
            Write an email <Ico.arrow width={15} height={15} />
          </a>
          <CopyEmail email={profile.email} />
          <button type="button" className="em-ghostbtn" onClick={openThemes}>
            See the other themes
          </button>
        </div>
      </section>
    </div>
  );
}

export function Missing({ path }: { path: string }) {
  return (
    <div className="em-missing">
      <div className="em-missing-frame">
        <FrameLabel name="Frame not found" dims="0 × 0" />
        <div className="em-missing-b">
          <Sel dims="404" />
          <span className="em-kicker">Layer missing</span>
          <h1>
            This frame was deleted, <em className="em-serif">or never drawn.</em>
          </h1>
          <p>
            Nothing lives at <code>{path}</code>. Pick a page from the toolbar, or jump back to the board.
          </p>
          <div className="em-contact-row">
            <Link className="em-sqbtn" href="/">
              Back to the board <Ico.arrow width={15} height={15} />
            </Link>
            <Link className="em-ghostbtn" href="/systems">
              All frames
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
