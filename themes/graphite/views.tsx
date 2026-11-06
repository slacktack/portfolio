"use client";

import Link from "next/link";
import { useRef, type CSSProperties, type PointerEvent as RPE } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { openThemes } from "@/components/skin";
import { ThemeTeaser } from "@/components/theme-palette";
import {
  currently,
  getNextNote,
  labItems,
  marqueeMetrics,
  notes,
  principles,
  profile,
  projects,
  stage,
  systems,
  timeline,
  type Note,
  type Project,
  type SystemCase,
} from "@/lib/site";
import { Gx, Tact } from "./lens";

const gi = (i: number) => ({ "--gi": i }) as CSSProperties;
const pad = (i: number) => String(i).padStart(2, "0");

function SysXray({ s }: { s: SystemCase }) {
  return (
    <div className="gx-sys">
      <dl className="gx-metrics">
        {s.metrics.map((m) => (
          <div key={m.label}>
            <dd>{m.value}</dd>
            <dt>{m.label}</dt>
          </div>
        ))}
      </dl>
      <div className="gx-arch">
        {s.architecture.map((a, i) => (
          <span key={a.label}>
            <b>{a.label}</b>
            {i < s.architecture.length - 1 && <i>→</i>}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---- Home ----
export function Home() {
  const picks = systems.slice(0, 4);
  return (
    <div className="gr-home">
      <section className="gr-hero">
        <p className="gr-kick" data-r="">
          {profile.name} · {profile.role} · {profile.location}
        </p>
        <Gx
          label="The invisible layer"
          className="gr-hero-gx"
          xray={
            <ul className="gx-scatter">
              {marqueeMetrics.map((m, i) => (
                <li key={m} style={gi(i)}>
                  {m}
                </li>
              ))}
            </ul>
          }
        >
          <Tact as="h1" className="gr-giant gr-hero-h" text={profile.tagline} />
        </Gx>
        <div className="gr-hero-foot" data-r="">
          <p>{profile.description}</p>
          <p className="gr-hint">
            <span className="gr-hint-dot" aria-hidden="true" />
            Move the lens over grey. The numbers are underneath. Tap on touch. <kbd>[</kbd> <kbd>]</kbd> resize.
          </p>
        </div>
      </section>

      <section className="gr-stack" aria-label="Systems under the lens">
        {picks.map((s, i) => (
          <div className="gr-stack-card" key={s.slug} style={{ "--gr-k": i } as CSSProperties}>
            <Gx label={s.title} xray={<SysXray s={s} />}>
              <div className="gr-stack-in">
                <span className="gr-stack-n">{s.index}</span>
                <p className="gr-kick">
                  {s.category} · {s.year}
                </p>
                <Tact as="h2" className="gr-giant" text={s.title} />
                <p className="gr-stack-p">{s.promise}</p>
                <Link href={`/systems/${s.slug}`} className="gr-btn">
                  Magnify the case
                </Link>
              </div>
            </Gx>
          </div>
        ))}
      </section>

      <section className="gr-band" data-r="">
        <Link href="/systems" className="gr-band-l">
          <span className="gr-kick">All {systems.length} systems</span>
          <Tact className="gr-big" text="Every system, x-rayed" />
        </Link>
      </section>

      <section className="gr-strip" aria-label="Projects">
        <div className="gr-strip-head" data-r="">
          <span className="gr-kick">Contact sheet · after hours</span>
          <Link href="/projects" className="gr-btn">
            Full sheet
          </Link>
        </div>
        <div className="gr-sheet gr-sheet-4">
          {projects.slice(0, 4).map((p, i) => (
            <Frame p={p} i={i} key={p.slug} />
          ))}
        </div>
      </section>

      <section className="gr-teaser" data-r="">
        <ThemeTeaser />
      </section>
    </div>
  );
}

// ---- Systems index ----
export function SystemsIndex() {
  return (
    <div className="gr-page">
      <header className="gr-pagehead">
        <p className="gr-kick" data-r="">
          Index · {systems.length} systems on the bench
        </p>
        <Tact as="h1" className="gr-giant" text="Systems" />
        <p className="gr-lede" data-r="">
          Each row is the surface. Put the lens on it to see the readings and the pipeline underneath, then open it to magnify the whole case.
        </p>
      </header>
      <ol className="gr-rows">
        {systems.map((s, i) => (
          <li key={s.slug} data-r="" style={gi(i % 4)}>
            <Gx label={s.title} xray={<SysXray s={s} />}>
              <Link href={`/systems/${s.slug}`} className="gr-row">
                <span className="gr-row-n">{s.index}</span>
                <span className="gr-row-t">{s.title}</span>
                <span className="gr-row-m">
                  {s.category}
                  <br />
                  {s.year}
                </span>
                <span className="gr-row-p">{s.promise}</span>
              </Link>
            </Gx>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ---- Projects: contact sheet with a loupe ----
function Frame({ p, i }: { p: Project; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: RPE<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    el.style.setProperty("--bx", `${((x / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty("--by", `${((y / r.height) * 100).toFixed(1)}%`);
  };
  return (
    <figure className="gr-frame" data-r="" style={gi(i % 4)}>
      <div className="gr-frame-img" ref={ref} onPointerMove={move} style={{ "--src": `url(${p.image})` } as CSSProperties}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={`${p.title} screenshot`} loading="lazy" decoding="async" />
        <span className="gr-loupe" aria-hidden="true" />
        <span className="gr-frame-no">{pad(i + 1)}A ▸</span>
      </div>
      <figcaption>
        <b>{p.title}</b>
        <span>{p.tagline}</span>
      </figcaption>
    </figure>
  );
}

function Reel({ v, i }: { v: (typeof stage)[number]; i: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const play = () => ref.current?.play().catch(() => {});
  const stop = () => ref.current?.pause();
  return (
    <a className="gr-reel" href={v.href} target="_blank" rel="noreferrer" data-r="" style={gi(i)} onPointerEnter={play} onPointerLeave={stop} onFocus={play} onBlur={stop}>
      <video ref={ref} src={v.video} poster={v.poster} muted loop playsInline preload="none" aria-label={`${v.title} screen recording`} />
      <span className="gr-reel-cap">
        <small>
          {v.tag} · R{pad(i + 1)}
        </small>
        <b>{v.title}</b>
        <span>{v.tagline}</span>
      </span>
    </a>
  );
}

export function Projects() {
  const reels = stage.filter((v) => v.tag === "Buyhatke");
  return (
    <div className="gr-page">
      <header className="gr-pagehead">
        <p className="gr-kick" data-r="">
          Contact sheet · {projects.length} frames · loupe on hover
        </p>
        <Tact as="h1" className="gr-giant" text="Projects" />
      </header>
      <div className="gr-sheet-wrap">
        <div className="gr-sheet">
          {projects.map((p, i) => (
            <div className="gr-cell" key={p.slug}>
              <Frame p={p} i={i} />
              <div className="gr-cell-meta">
                <p className="gr-cell-hl">{p.highlight}</p>
                <p>{p.description}</p>
                <p className="gr-cell-stack">
                  {p.category} · {p.year} · {p.stack.join(" / ")}
                </p>
                <a className="gr-btn" href={p.live} target="_blank" rel="noreferrer">
                  Open live ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <section className="gr-reels">
        <p className="gr-kick" data-r="">
          Day-job reels · real screen recordings · hover to roll
        </p>
        <div className="gr-reels-grid">
          {reels.map((v, i) => (
            <Reel v={v} i={i} key={v.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---- Lab ----
const demos: Record<string, React.ReactNode> = {
  "cache-key": <CacheKeyLab />,
  deadlines: <DeadlineLab />,
  identity: <IdentityLab />,
  logs: <LogStreamLab />,
  memcached: <MemcachedLab />,
  "load-balancer": <LoadBalancerDemo />,
};

export function Lab() {
  return (
    <div className="gr-page">
      <header className="gr-pagehead">
        <p className="gr-kick" data-r="">
          The bench · {labItems.length} specimens · runs in your browser
        </p>
        <Tact as="h1" className="gr-giant" text="Lab" />
      </header>
      <div className="gr-bench">
        <ol className="gr-bench-idx" aria-label="Experiments">
          {labItems.map((l, i) => (
            <li key={l.slug}>
              <a href={`#gr-${l.slug}`}>
                <small>{pad(i + 1)}</small>
                {l.title}
              </a>
            </li>
          ))}
        </ol>
        <div className="gr-bench-list">
          {labItems.map((l, i) => (
            <section id={`gr-${l.slug}`} className="gr-spec" key={l.slug} data-r="">
              <div className="gr-spec-head">
                <span className="gr-spec-n">{pad(i + 1)}</span>
                <div>
                  <h2>{l.title}</h2>
                  <p>
                    {l.detail} · {l.year}
                  </p>
                </div>
              </div>
              {demos[l.slug] ? (
                <div className="gr-spec-stage">{demos[l.slug]}</div>
              ) : (
                <p className="gr-spec-empty">No in-browser demo for this one. {l.detail}.</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Notes ----
export function Notes() {
  return (
    <div className="gr-page">
      <header className="gr-pagehead">
        <p className="gr-kick" data-r="">
          Field notes · {notes.length} long reads
        </p>
        <Tact as="h1" className="gr-giant" text="Notes" />
      </header>
      <ol className="gr-rows">
        {notes.map((n, i) => (
          <li key={n.slug} data-r="" style={gi(i)}>
            <Gx
              label={n.title}
              xray={
                <div className="gx-note">
                  <p>{n.dek}</p>
                  <span>
                    {n.category} · {n.date} · {n.readTime}
                  </span>
                </div>
              }
            >
              <Link href={`/notes/${n.slug}`} className="gr-row gr-row-note">
                <span className="gr-row-n">{pad(i + 1)}</span>
                <span className="gr-row-t">{n.title}</span>
                <span className="gr-row-m">
                  {n.date}
                  <br />
                  {n.readTime}
                </span>
              </Link>
            </Gx>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function NoteView({ n }: { n: Note }) {
  const next = getNextNote(n.slug);
  return (
    <article className="gr-page gr-note">
      <header className="gr-pagehead">
        <p className="gr-kick" data-r="">
          <Link href="/notes">Notes</Link> / {n.category} · {n.date} · {n.readTime}
        </p>
        <Tact as="h1" className="gr-giant gr-note-h" text={n.title} />
        <p className="gr-lede" data-r="">
          {n.dek}
        </p>
      </header>
      <div className="gr-note-body">
        {n.sections.map((s, i) => (
          <section key={i} data-r="">
            {s.heading && (
              <h2>
                <small>§{pad(i + 1)}</small>
                {s.heading}
              </h2>
            )}
            {s.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
            {s.quote && <blockquote>{s.quote}</blockquote>}
            {s.list && (
              <ul className="gr-list">
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
          </section>
        ))}
      </div>
      {next && (
        <Link href={`/notes/${next.slug}`} className="gr-next">
          <span className="gr-kick">Next note</span>
          <Tact className="gr-big" text={next.title} />
        </Link>
      )}
    </article>
  );
}

// ---- About ----
export function About() {
  return (
    <div className="gr-page gr-about">
      <header className="gr-pagehead">
        <p className="gr-kick" data-r="">
          About · {profile.role} · {profile.location}
        </p>
        <Gx
          label={profile.name}
          xray={
            <dl className="gx-metrics">
              {currently.map((c) => (
                <div key={c.label}>
                  <dd>{c.value}</dd>
                  <dt>{c.label}</dt>
                </div>
              ))}
            </dl>
          }
        >
          <Tact as="h1" className="gr-giant" text={profile.name} />
          <p className="gr-lede">{profile.description}</p>
        </Gx>
      </header>

      <section className="gr-now" data-r="">
        {currently.map((c, i) => (
          <div key={c.label} style={gi(i)}>
            <small>{c.label}</small>
            <b>{c.value}</b>
          </div>
        ))}
      </section>

      <section className="gr-principles">
        {principles.map((p, i) => (
          <div key={p.num} data-r="" style={gi(i)}>
            <span>{p.num}</span>
            <h2>{p.title}</h2>
            <p>{p.body}</p>
          </div>
        ))}
      </section>

      <section className="gr-time" aria-label="Timeline">
        {timeline.map((t, i) => (
          <div key={t.title} data-r="" style={gi(i)}>
            <span>{t.year}</span>
            <h3>{t.title}</h3>
            <p>{t.body}</p>
          </div>
        ))}
      </section>

      <section className="gr-contact" data-r="">
        <p className="gr-kick">{profile.availability} · {profile.availabilityDetail}</p>
        <a href={`mailto:${profile.email}`} className="gr-big gr-mail">
          Write to me
        </a>
        <CopyEmail email={profile.email} />
      </section>
    </div>
  );
}

export function Missing({ path }: { path: string }) {
  return (
    <div className="gr-page gr-missing">
      <Gx
        label="Not found"
        xray={
          <div className="gx-note">
            <p>
              Looked for <b>{path}</b>. Nothing under the glass.
            </p>
            <span>Try the ruler on the right</span>
          </div>
        }
      >
        <p className="gr-kick">404 · out of focus</p>
        <Tact as="h1" className="gr-giant gr-404" text="Nothing here" />
      </Gx>
      <div className="gr-missing-l">
        <Link href="/" className="gr-btn">
          Back to the index
        </Link>
        <Link href="/systems" className="gr-btn">
          Systems
        </Link>
        <button type="button" className="gr-btn" onClick={openThemes}>
          Themes
        </button>
      </div>
    </div>
  );
}
