"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { CopyEmail } from "@/components/copy-email";
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
  getNote,
  getSystem,
  labItems,
  notes,
  principles,
  profile,
  projects,
  stage,
  systems,
  timeline,
} from "@/lib/site";
import { stageCase } from "./data";

function Head({ k, title, lede, children }: { k: string; title: ReactNode; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="ne-head">
      <span className="ne-k">
        <i aria-hidden="true">✦</i> {k}
      </span>
      <h1>{title}</h1>
      {lede && <p className="ne-lede">{lede}</p>}
      {children}
    </header>
  );
}

function Sec({ k, title, children, className }: { k: string; title: string; children: ReactNode; className?: string }) {
  return (
    <section className={`ne-sec ${className ?? ""}`}>
      <div className="ne-sec-k">
        <span>{k}</span>
        <h2>{title}</h2>
      </div>
      <div className="ne-sec-b">{children}</div>
    </section>
  );
}

// Deterministic star positions for the systems chart.
const chart = systems.map((s, i) => {
  const a = i * 2.39996;
  const r = 18 + ((i * 37) % 26);
  return { s, x: Math.min(78, Math.max(6, 44 + Math.cos(a) * r * 1.2)), y: Math.min(88, Math.max(10, 50 + Math.sin(a) * r * 0.9)) };
});

export function SystemsChart() {
  return (
      <div className="ne-chart" role="group" aria-label="Systems star chart">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {chart.slice(1).map((p, i) => (
          <line key={p.s.slug} x1={chart[i].x} y1={chart[i].y} x2={p.x} y2={p.y} />
        ))}
      </svg>
      {chart.map((p, i) => (
        <Link key={p.s.slug} href={`/systems/${p.s.slug}`} className="ne-chart-star" style={{ left: `${p.x}%`, top: `${p.y}%`, ["--ne-d" as string]: `${i * 60}ms` }}>
          <i aria-hidden="true" />
          <span>{p.s.shortTitle}</span>
        </Link>
      ))}
    </div>
  );
}

export function SystemsView() {
  return (
    <>
      <Head
        k="Star chart · systems"
        title={
          <>
            Systems, <em>charted.</em>
          </>
        }
        lede={`${systems.length} systems, each a star you can open. Every case explains the problem, the constraints, what broke, and what I would change.`}
      />
      <SystemsChart />
      <ol className="ne-syslist">
        {systems.map((s) => (
          <li key={s.slug}>
            <Link href={`/systems/${s.slug}`}>
              <span className="ne-num">{s.index}</span>
              <span className="ne-syslist-main">
                <b>{s.title}</b>
                <span>{s.promise}</span>
                <small>
                  {s.category} · {s.year}
                </small>
              </span>
              <span className="ne-mag">
                <strong>{s.metrics[0]?.value}</strong>
                <small>{s.metrics[0]?.label}</small>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

export function CaseView({ slug }: { slug: string }) {
  const s = getSystem(slug);
  if (!s) return <MissingView />;
  const next = getNextSystem(slug);
  const rec = stage.find((x) => stageCase(x.slug) === slug);
  return (
    <>
      <Head k={`System ${s.index} · ${s.category}`} title={s.title} lede={s.promise}>
        <p className="ne-meta">
          <span>{s.role}</span>
          <span>{s.year}</span>
          <span>{s.stack.join(" · ")}</span>
        </p>
      </Head>
      <div className="ne-mags">
        {s.metrics.map((m, i) => (
          <div key={m.label} className="ne-magcard" style={{ ["--ne-d" as string]: `${i * 80}ms` }}>
            <strong>{m.value}</strong>
            <span>{m.label}</span>
            {m.note && <small>{m.note}</small>}
          </div>
        ))}
      </div>
      <p className="ne-summary">{s.summary}</p>
      <div className="ne-artifact">
        <SystemArtifact kind={s.artifact} />
      </div>
      {rec && (
        <figure className="ne-rec">
          <video src={rec.video} poster={rec.poster} muted loop playsInline autoPlay preload="metadata" aria-label={`${rec.title} screen recording`} />
          <figcaption>
            {rec.tagline}{" "}
            <a href={rec.href} target="_blank" rel="noreferrer">
              Live ↗
            </a>
          </figcaption>
        </figure>
      )}
      <Sec k="01" title="The problem">
        {s.problem.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </Sec>
      <Sec k="02" title="Constraints">
        <ul className="ne-bullets">
          {s.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Sec>
      <Sec k="03" title="Architecture">
        <ol className="ne-orbit">
          {s.architecture.map((a, i) => (
            <li key={a.label}>
              <span className="ne-num">{String(i + 1).padStart(2, "0")}</span>
              <b>{a.label}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ol>
        <ul className="ne-rail">
          {s.rail.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </Sec>
      <Sec k="04" title="The hard part">
        <div className="ne-cards">
          {s.hardPart.map((h) => (
            <article key={h.title}>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </article>
          ))}
        </div>
      </Sec>
      {s.broke && (
        <Sec k="05" title="What broke" className="ne-sec-hot">
          <h3>{s.broke.title}</h3>
          <p>{s.broke.body}</p>
        </Sec>
      )}
      {s.flaws && s.flaws.length > 0 && (
        <Sec k="06" title="Known flaws">
          <div className="ne-cards">
            {s.flaws.map((f) => (
              <article key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </article>
            ))}
          </div>
        </Sec>
      )}
      <Sec k="07" title="What I'd do differently">
        <ul className="ne-bullets">
          {s.differently.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </Sec>
      <Sec k="08" title="What it proves">
        <ul className="ne-chips">
          {s.proves.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Sec>
      <Sec k="09" title="Receipts">
        <dl className="ne-receipts">
          {s.receipts.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>
                <strong>{r.value}</strong>
                <span>{r.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Sec>
      <Link href={`/systems/${next.slug}`} className="ne-next">
        <span>Next star</span>
        <b>{next.title}</b>
        <small>{next.promise}</small>
      </Link>
    </>
  );
}

function Rec({ video, poster, title }: { video: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const play = () => void ref.current?.play().catch(() => {});
  const stop = () => ref.current?.pause();
  return (
    <div className="ne-vid" onPointerEnter={play} onPointerLeave={stop} onFocus={play} onBlur={stop}>
      <video ref={ref} src={video} poster={poster} muted loop playsInline preload="none" aria-label={`${title} screen recording`} />
      <span aria-hidden="true">▶ hover to play</span>
    </div>
  );
}

export function ProjectsView({ work }: { work?: string }) {
  useEffect(() => {
    if (!work) return;
    const el = document.getElementById(`ne-w-${work}`);
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [work]);
  const bh = stage.filter((s) => stageCase(s.slug));
  return (
    <>
      <Head
        k="Constellation · projects"
        title={
          <>
            Things I shipped <em>for myself.</em>
          </>
        }
        lede="Every one is live. The recordings are real screen captures; hover one to play it."
      />
      <div className="ne-projects">
        {projects.map((p, i) => {
          const rec = stage.find((s) => s.slug === p.slug);
          return (
            <article key={p.slug} id={`ne-w-${p.slug}`} className="ne-project" data-active={work === p.slug || undefined} style={{ ["--ne-d" as string]: `${i * 70}ms` }}>
              {rec ? <Rec video={rec.video} poster={rec.poster} title={p.title} /> : <img src={p.image} alt={`${p.title} screenshot`} className="ne-vid" />}
              <div className="ne-project-b">
                <span className="ne-k">
                  {p.category} · {p.year}
                </span>
                <h2>{p.title}</h2>
                <p className="ne-tag">{p.tagline}</p>
                <p>{p.description}</p>
                <p className="ne-note">{p.note}</p>
                <ul className="ne-chips">
                  {p.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
                <a href={p.live} target="_blank" rel="noreferrer" className="ne-btn">
                  Visit live <span aria-hidden="true">↗</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <Sec k="Work" title="Recorded at Buyhatke">
        <div className="ne-bh">
          {bh.map((s) => (
            <figure key={s.slug} id={`ne-w-${s.slug}`}>
              <Rec video={s.video} poster={s.poster} title={s.title} />
              <figcaption>
                <b>{s.title}</b>
                <span>{s.tagline}</span>
                <Link href={`/systems/${stageCase(s.slug)}`}>Open the system →</Link>
              </figcaption>
            </figure>
          ))}
        </div>
      </Sec>
    </>
  );
}

const demos: Record<string, ReactNode> = {
  "cache-key": <CacheKeyLab />,
  deadlines: <DeadlineLab />,
  identity: <IdentityLab />,
  logs: <LogStreamLab />,
  memcached: <MemcachedLab />,
  "load-balancer": <LoadBalancerDemo />,
};

export function LabView() {
  return (
    <>
      <Head
        k="Observatory · lab"
        title={
          <>
            Small systems, <em>broken on purpose.</em>
          </>
        }
        lede="The mechanisms behind the systems, rebuilt small enough to hold in one hand. Everything runs in your browser; simulations are labelled as simulations."
      >
        <nav className="ne-labindex" aria-label="Experiments">
          {labItems.map((l) => (
            <a key={l.slug} href={`#ne-lab-${l.slug}`}>
              {l.title}
            </a>
          ))}
        </nav>
      </Head>
      {labItems.map((l, i) => (
        <section key={l.slug} id={`ne-lab-${l.slug}`} className="ne-lab">
          <div className="ne-lab-h">
            <span className="ne-num">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2>{l.title}</h2>
              <p>
                {l.detail} · {l.year}
              </p>
            </div>
          </div>
          {demos[l.slug] ? <div className="ne-demo">{demos[l.slug]}</div> : <p className="ne-note">No in-browser demo for this one yet.</p>}
        </section>
      ))}
    </>
  );
}

export function NotesView() {
  return (
    <>
      <Head
        k="Transmissions · notes"
        title={
          <>
            Field notes from <em>the hot path.</em>
          </>
        }
        lede="Long-form writing on low-latency systems: what the constraint really was, and what I measured."
      />
      <ol className="ne-notes">
        {notes.map((n, i) => (
          <li key={n.slug} style={{ ["--ne-d" as string]: `${i * 80}ms` }}>
            <Link href={`/notes/${n.slug}`}>
              <span className="ne-k">
                {n.category} · {n.date} · {n.readTime}
              </span>
              <b>{n.title}</b>
              <span>{n.dek}</span>
              <i aria-hidden="true">Read →</i>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

export function NoteView({ slug }: { slug: string }) {
  const n = getNote(slug);
  if (!n) return <MissingView />;
  const next = getNextNote(slug);
  return (
    <article className="ne-article">
      <Head k={`${n.category} · ${n.date} · ${n.readTime}`} title={n.title} lede={n.dek} />
      {n.sections.map((s, i) => (
        <section key={i}>
          {s.heading && <h2>{s.heading}</h2>}
          {s.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
          {s.list && (
            <ul className="ne-bullets">
              {s.list.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
          {s.code && (
            <pre>
              <code>{s.code}</code>
            </pre>
          )}
          {s.quote && <blockquote>{s.quote}</blockquote>}
        </section>
      ))}
      <Link href={`/notes/${next.slug}`} className="ne-next">
        <span>Next transmission</span>
        <b>{next.title}</b>
        <small>{next.dek}</small>
      </Link>
    </article>
  );
}

export function AboutView() {
  return (
    <>
      <Head
        k={`${profile.role} · ${profile.location}`}
        title={
          <>
            {profile.name}. <em>{profile.tagline}</em>
          </>
        }
        lede={profile.description}
      />
      <dl className="ne-now">
        {currently.map((c) => (
          <div key={c.label}>
            <dt>{c.label}</dt>
            <dd>{c.value}</dd>
          </div>
        ))}
      </dl>
      <Sec k="Orbit" title="Timeline">
        <ol className="ne-time">
          {timeline.map((t) => (
            <li key={t.title}>
              <span>{t.year}</span>
              <b>{t.title}</b>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </Sec>
      <Sec k="Laws" title="Principles">
        <div className="ne-cards">
          {principles.map((p) => (
            <article key={p.num}>
              <span className="ne-num">{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </Sec>
      <section className="ne-contact">
        <span className="ne-k">{profile.availability}</span>
        <h2>Send a signal.</h2>
        <p>{profile.availabilityDetail}</p>
        <a href={`mailto:${profile.email}`} className="ne-mail">
          {profile.email}
        </a>
        <CopyEmail email={profile.email} />
      </section>
    </>
  );
}

export function MissingView() {
  return (
    <div className="ne-missing">
      <Head
        k="Signal lost"
        title={
          <>
            Nothing out here <em>but dark matter.</em>
          </>
        }
        lede="This coordinate has no star. Fly back to the origin, or pick a destination from the constellation."
      />
      <div className="ne-missing-links">
        <Link href="/" className="ne-btn">
          Back to the origin
        </Link>
        <Link href="/systems" className="ne-btn ne-btn-ghost">
          Open the star chart
        </Link>
      </div>
    </div>
  );
}
