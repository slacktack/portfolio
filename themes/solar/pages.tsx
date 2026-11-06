"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
import { ThemesButton } from "./clock";

const hh = (n: number) => `${String(n).padStart(2, "0")}:00`;

export function Top({ hour, name }: { hour: string; name: string }) {
  return (
    <header className="sl-top">
      <Link href="/" className="sl-brand" data-cursor="Dial">
        <i aria-hidden="true" />
        {profile.name}
      </Link>
      <span className="sl-where">
        <b>{hour}</b> {name}
      </span>
      <ThemesButton small />
    </header>
  );
}

const CHAPTERS = [
  { href: "/systems", label: "Systems", h: "12:00" },
  { href: "/projects", label: "Projects", h: "03:00" },
  { href: "/lab", label: "Lab", h: "06:00" },
  { href: "/notes", label: "Notes", h: "09:00" },
  { href: "/about", label: "About", h: "10:00" },
];

export function Foot() {
  return (
    <footer className="sl-foot">
      <p className="sl-foot-k">Next hours</p>
      <nav aria-label="Chapters">
        {CHAPTERS.map((c) => (
          <Link key={c.href} href={c.href}>
            <b>{c.h}</b>
            {c.label}
          </Link>
        ))}
      </nav>
      <div className="sl-foot-b">
        <a href={`mailto:${profile.email}`}>{profile.email}</a>
        <span>
          {profile.location} · {profile.availability}
        </span>
      </div>
    </footer>
  );
}

function Head({ k, title, lede, children }: { k: string; title: ReactNode; lede?: string; children?: ReactNode }) {
  return (
    <div className="sl-head">
      <div className="sl-sun" aria-hidden="true" />
      <p className="sl-kick sl-r">{k}</p>
      <h1 className="sl-h1 sl-r">{title}</h1>
      {lede && <p className="sl-lede sl-r">{lede}</p>}
      {children}
    </div>
  );
}

export function SystemsIndex() {
  return (
    <>
      <Head k="12:00 · Departures" title={<>Systems, <em>on the hour.</em></>} lede="Production systems I built at Buyhatke. Each one leaves on its own timetable: problem first, receipts last." />
      <div className="sl-dep" role="list">
        <div className="sl-dep-h" aria-hidden="true">
          <span>Time</span>
          <span>System</span>
          <span>Line</span>
          <span>Headline</span>
        </div>
        {systems.map((s, i) => (
          <Link role="listitem" key={s.slug} href={`/systems/${s.slug}`} className="sl-dep-row sl-r" style={{ "--sl-i": i } as CSSProperties}>
            <b className="sl-dep-t">{hh(8 + i)}</b>
            <span className="sl-dep-n">
              <strong>{s.title}</strong>
              <small>{s.promise}</small>
            </span>
            <span className="sl-dep-c">{s.category}</span>
            <span className="sl-dep-m">
              <em>{s.metrics[0].value}</em>
              <small>{s.metrics[0].label}</small>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}

type Slot = { id: string; h: string; label: string; body: ReactNode };

export function Case({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  const slots: Slot[] = [
    { id: "problem", h: "09:00", label: "The problem", body: s.problem.map((p) => <p key={p}>{p}</p>) },
    {
      id: "constraints",
      h: "10:00",
      label: "Constraints",
      body: (
        <ul className="sl-ticks">
          {s.constraints.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "architecture",
      h: "11:00",
      label: "Architecture",
      body: (
        <>
          <ol className="sl-chain">
            {s.architecture.map((a, i) => (
              <li key={a.label} style={{ "--sl-i": i } as CSSProperties}>
                <b>{a.label}</b>
                <span>{a.detail}</span>
              </li>
            ))}
          </ol>
          <ul className="sl-ticks">
            {s.rail.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "hard",
      h: "12:00",
      label: "The hard part",
      body: s.hardPart.map((p) => (
        <div className="sl-card" key={p.title}>
          <h3>{p.title}</h3>
          <p>{p.body}</p>
        </div>
      )),
    },
  ];
  if (s.broke)
    slots.push({
      id: "broke",
      h: "13:00",
      label: "What broke",
      body: (
        <div className="sl-card is-ink">
          <h3>{s.broke.title}</h3>
          <p>{s.broke.body}</p>
        </div>
      ),
    });
  if (s.flaws?.length)
    slots.push({
      id: "flaws",
      h: "14:00",
      label: "Known flaws",
      body: s.flaws.map((f) => (
        <div className="sl-card" key={f.title}>
          <h3>{f.title}</h3>
          <p>{f.body}</p>
        </div>
      )),
    });
  slots.push(
    {
      id: "differently",
      h: "15:00",
      label: "What I'd do differently",
      body: (
        <ul className="sl-ticks">
          {s.differently.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "proves",
      h: "16:00",
      label: "What it proves",
      body: (
        <ul className="sl-ticks">
          {s.proves.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "receipts",
      h: "17:00",
      label: "Receipts",
      body: (
        <dl className="sl-receipts">
          {s.receipts.map((r) => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>
                <b>{r.value}</b>
                <span>{r.detail}</span>
              </dd>
            </div>
          ))}
        </dl>
      ),
    },
  );

  const [active, setActive] = useState(0);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const els = list.current?.querySelectorAll<HTMLElement>("[data-slot]");
    if (!els) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.slot))),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [s.slug]);
  const hour = Number(slots[active].h.slice(0, 2));

  return (
    <>
      <section className="sl-case-hero">
        <div className="sl-sun" aria-hidden="true" />
        <p className="sl-kick sl-r">
          System {s.index} · {s.category} · {s.year}
        </p>
        <h1 className="sl-h1 sl-r">{s.title}</h1>
        <p className="sl-promise sl-r">{s.promise}</p>
        <ul className="sl-dials">
          {s.metrics.map((m, i) => (
            <li key={m.label} className="sl-r" style={{ "--sl-i": i } as CSSProperties}>
              <b>{m.value}</b>
              <span>{m.label}</span>
              {m.note && <small>{m.note}</small>}
            </li>
          ))}
        </ul>
        <p className="sl-role sl-r">
          {s.role} · {s.stack.join(" · ")}
        </p>
      </section>

      <section className="sl-case-art">
        <p className="sl-summary sl-r">{s.summary}</p>
        <div className="sl-artifact sl-r">
          <SystemArtifact kind={s.artifact} />
        </div>
      </section>

      <div className="sl-tt">
        <aside className="sl-tt-clock" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="50" y1="8" x2="50" y2="14" transform={`rotate(${i * 30} 50 50)`} />
            ))}
            <line x1="50" y1="50" x2="50" y2="22" className="is-h" style={{ transform: `rotate(${(hour % 12) * 30}deg)` }} />
            <circle cx="50" cy="50" r="4" />
          </svg>
          <b>{slots[active].h}</b>
          <span>{slots[active].label}</span>
        </aside>
        <ol className="sl-slots" ref={list} aria-label="Case timetable">
          {slots.map((sl, i) => (
            <li key={sl.id} data-slot={i} className="sl-slot sl-r" aria-current={i === active ? "step" : undefined}>
              <div className="sl-slot-t">
                <b>{sl.h}</b>
                <h2>{sl.label}</h2>
              </div>
              <div className="sl-slot-b">{sl.body}</div>
            </li>
          ))}
        </ol>
      </div>

      <Link href={`/systems/${next.slug}`} className="sl-next sl-r">
        <small>Next departure · System {next.index}</small>
        <strong>{next.title}</strong>
        <span>{next.promise}</span>
      </Link>
    </>
  );
}

function Reel({ v, i }: { v: (typeof stage)[number]; i: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <li className="sl-frame" style={{ "--sl-i": i } as CSSProperties}>
      <span className="sl-frame-n">Reel {String(i + 1).padStart(2, "0")}</span>
      <div className="sl-frame-v">
        <video ref={ref} src={v.video} poster={v.poster} muted loop playsInline preload="none" aria-label={`${v.title} screen recording`} />
      </div>
      <p className="sl-frame-tag">{v.tag}</p>
      <h3>{v.title}</h3>
      <p>{v.tagline}</p>
      <a href={v.href} target="_blank" rel="noreferrer" className="sl-live">
        Live ↗
      </a>
    </li>
  );
}

export function Projects() {
  const reel = useRef<HTMLUListElement>(null);
  const nudge = (d: number) => reel.current?.scrollBy({ left: d * reel.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <>
      <Head k="03:00 · The timeline reel" title={<>Projects, <em>frame by frame.</em></>} lede="Real screen recordings of things that are live. Roll the reel, then open any of them.">
        <div className="sl-reel-ctl sl-r">
          <button type="button" onClick={() => nudge(-1)} aria-label="Previous frames">
            ←
          </button>
          <button type="button" onClick={() => nudge(1)} aria-label="Next frames">
            →
          </button>
        </div>
      </Head>
      <ul className="sl-reel" ref={reel} data-lenis-prevent aria-label="Screen recordings">
        {stage.map((v, i) => (
          <Reel key={v.slug} v={v} i={i} />
        ))}
      </ul>
      <section className="sl-builds">
        <h2 className="sl-h2 sl-r">After-hours builds</h2>
        <ol>
          {projects.map((p, i) => (
            <li key={p.slug} className="sl-build sl-r" style={{ "--sl-i": i } as CSSProperties}>
              <span className="sl-build-t">
                {p.year} · {p.category}
              </span>
              <div>
                <h3>{p.title}</h3>
                <p className="sl-build-tag">{p.tagline}</p>
                <p>{p.description}</p>
                <p className="sl-stack">{p.stack.join(" · ")}</p>
              </div>
              <a href={p.live} target="_blank" rel="noreferrer" className="sl-live">
                {p.highlight} ↗
              </a>
            </li>
          ))}
        </ol>
      </section>
    </>
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

export function Lab() {
  return (
    <>
      <Head k="06:00 · The workbench" title={<>The lab, <em>after dark.</em></>} lede="Mechanisms from the systems, rebuilt small enough to break on purpose. Everything runs in your browser; simulations are labelled as simulations.">
        <nav className="sl-lab-idx sl-r" aria-label="Experiments">
          {labItems.map((l, i) => (
            <a key={l.slug} href={`#${l.slug}`}>
              <b>{hh(6 + i)}</b>
              {l.title}
            </a>
          ))}
        </nav>
      </Head>
      {labItems.map((l, i) => (
        <section key={l.slug} id={l.slug} className="sl-bench">
          <div className="sl-bench-h sl-r">
            <b>{hh(6 + i)}</b>
            <h2>{l.title}</h2>
            <p>
              {l.detail} · {l.year}
            </p>
          </div>
          <div className="sl-bench-d sl-r">{DEMOS[l.slug] ? DEMOS[l.slug]() : <p className="sl-bench-none">{l.detail}. No browser demo for this one yet.</p>}</div>
        </section>
      ))}
    </>
  );
}

export function Notes() {
  return (
    <>
      <Head k="09:00 · The almanac" title={<>Notes, <em>by the sun.</em></>} lede="Field notes on low-latency systems: latency, cost, calibration and quotas." />
      <ol className="sl-almanac">
        {notes.map((n, i) => (
          <li key={n.slug} className="sl-r" style={{ "--sl-i": i } as CSSProperties}>
            <Link href={`/notes/${n.slug}`} className="sl-alm">
              <span className="sl-alm-disc">
                <b>{n.date}</b>
                <small>{n.readTime}</small>
              </span>
              <span className="sl-alm-c">
                <small>{n.category}</small>
                <strong>{n.title}</strong>
                <span>{n.dek}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}

export function NoteView({ n }: { n: Note }) {
  const next = getNextNote(n.slug);
  return (
    <article className="sl-note">
      <Head k={`${n.category} · ${n.date} · ${n.readTime}`} title={n.title} lede={n.dek} />
      <div className="sl-note-b">
        {n.sections.map((s, i) => (
          <section key={i} className="sl-r">
            {s.heading && <h2>{s.heading}</h2>}
            {s.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.quote && <blockquote>{s.quote}</blockquote>}
            {s.list && (
              <ul className="sl-ticks">
                {s.list.map((x) => (
                  <li key={x}>{x}</li>
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
      <Link href={`/notes/${next.slug}`} className="sl-next sl-r">
        <small>Next note · {next.readTime}</small>
        <strong>{next.title}</strong>
        <span>{next.dek}</span>
      </Link>
    </article>
  );
}

export function About() {
  return (
    <>
      <Head k={`10:00 · ${profile.location}`} title={<>{profile.name}. <em>{profile.tagline}</em></>} lede={profile.description} />
      <section className="sl-day">
        <h2 className="sl-h2 sl-r">The day so far</h2>
        <ol>
          {timeline.map((t, i) => (
            <li key={t.title} className="sl-r" style={{ "--sl-i": i } as CSSProperties}>
              <b>{t.year}</b>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="sl-princ">
        {principles.map((p, i) => (
          <div key={p.num} className="sl-r" style={{ "--sl-i": i } as CSSProperties}>
            <b>{p.num}</b>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </div>
        ))}
      </section>
      <section className="sl-now">
        <h2 className="sl-h2 sl-r">Right now</h2>
        <dl>
          {currently.map((c) => (
            <div key={c.label} className="sl-r">
              <dt>{c.label}</dt>
              <dd>{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="sl-contact sl-r">
        <p className="sl-kick">
          {profile.availability} · {profile.availabilityDetail}
        </p>
        <a href={`mailto:${profile.email}`} className="sl-mail">
          {profile.email}
        </a>
        <CopyEmail email={profile.email} />
      </section>
    </>
  );
}

export function Missing({ path }: { path: string }) {
  return (
    <section className="sl-missing">
      <div className="sl-13" aria-hidden="true">
        13
      </div>
      <p className="sl-kick">{path}</p>
      <h1 className="sl-h1">There is no thirteen o&apos;clock.</h1>
      <p className="sl-lede">This hour isn&apos;t on the dial. Go back to the clock and pick a real one.</p>
      <Link href="/" className="sl-open">
        Back to the clock
      </Link>
    </section>
  );
}
