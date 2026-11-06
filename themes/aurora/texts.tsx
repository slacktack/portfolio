"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { CopyEmail } from "@/components/copy-email";
import { currently, getNextNote, notes, principles, profile, projects, systems, timeline, type Note } from "@/lib/site";
import { Arrow, Aurora, Label, Ribbon, pad } from "./ui";

export function Essays() {
  return (
    <>
      <section className="au-reading-head">
        <Aurora tone="violet" />
        <div className="au-reading-in">
          <Label a="Room 04" b="Essays" />
          <h1>
            Field notes, <em>set in serif.</em>
          </h1>
          <p>Long-form writing on low-latency systems: what was measured, what was built, and what I would tell the next team.</p>
        </div>
      </section>
      <section className="au-sheet au-shelf">
        <ol>
          {notes.map((n, i) => (
            <li key={n.slug} data-au="page" style={{ "--au-i": i } as CSSProperties}>
              <Link href={`/notes/${n.slug}`} className="au-essay" data-cursor="Read">
                <span className="au-essay-no">{pad(i + 1)}</span>
                <span className="au-essay-meta">
                  <Label a={n.category} b={`${n.date} · ${n.readTime}`} />
                </span>
                <b className="au-essay-t">{n.title}</b>
                <span className="au-essay-d">{n.dek}</span>
                <span className="au-essay-go">
                  Read the essay <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

export function Essay({ n }: { n: Note }) {
  const next = getNextNote(n.slug);
  const i = notes.findIndex((x) => x.slug === n.slug);
  return (
    <article className="au-essay-doc">
      <header className="au-essay-cover">
        <Aurora tone={i % 2 ? "blue" : "violet"} />
        <div className="au-essay-cover-in">
          <Link href="/notes" className="au-back">
            <Arrow /> All essays
          </Link>
          <Label a={`Essay ${pad(i + 1)} · ${n.category}`} b={`${n.date} · ${n.readTime} read`} />
          <h1>{n.title}</h1>
          <p>{n.dek}</p>
        </div>
      </header>
      <div className="au-sheet au-read">
        {n.sections.map((s, k) => (
          <section key={k} className="au-read-sec">
            <div className="au-read-margin">
              {s.heading ? <Label a={`§ ${pad(k + 1)}`} b={s.heading} /> : <Label a="§ 00" b="Opening" />}
            </div>
            <div className="au-read-col">
              {s.heading ? <h2>{s.heading}</h2> : null}
              {s.body.map((p, j) => (
                <p key={j} className={k === 0 && j === 0 ? "au-drop" : undefined}>
                  {p}
                </p>
              ))}
              {s.list ? (
                <ul>
                  {s.list.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              ) : null}
              {s.code ? (
                <pre className="au-code">
                  <code>{s.code}</code>
                </pre>
              ) : null}
            </div>
            {s.quote ? (
              <blockquote className="au-pull" data-au="page">
                <p>{s.quote}</p>
              </blockquote>
            ) : null}
          </section>
        ))}
      </div>
      <Link href={`/notes/${next.slug}`} className="au-next" data-cursor="Read">
        <Aurora tone="lime" />
        <Label a="Next essay" b={`${next.date} · ${next.readTime}`} />
        <b>{next.title}</b>
        <span className="au-next-p">{next.dek}</span>
        <span className="au-next-go">
          <Arrow />
        </span>
      </Link>
    </article>
  );
}

export function About() {
  return (
    <>
      <section className="au-statement">
        <Aurora tone="dusk" />
        <Ribbon className="au-statement-ribbon" d="M-40 360 C 280 520, 520 60, 860 240 S 1280 460, 1500 80" />
        <div className="au-statement-in">
          <Label a="Room 05" b="Artist's statement" />
          <h1>{profile.tagline}</h1>
          <p className="au-statement-p">{profile.description}</p>
          <div className="au-statement-sig">
            <b>{profile.name}</b>
            <span>
              {profile.role}, {profile.location}
            </span>
          </div>
        </div>
      </section>

      <section className="au-block au-practice" data-tone="violet" aria-labelledby="au-practice-t">
        <header className="au-shead" data-au>
          <div className="au-shead-k">
            <span className="au-no">5.1</span>
            <Label a="Method" b="Practice" />
          </div>
          <h2 id="au-practice-t" className="au-shead-t">
            Three rules the work is made by.
          </h2>
        </header>
        <ol className="au-principles">
          {principles.map((p, i) => (
            <li key={p.num} data-au="page" style={{ "--au-i": i } as CSSProperties}>
              <span>{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="au-sheet au-cv" aria-labelledby="au-cv-t">
        <header className="au-shead" data-au>
          <div className="au-shead-k">
            <span className="au-no">5.2</span>
            <Label a="Curriculum vitae" b="CV" />
          </div>
          <h2 id="au-cv-t" className="au-shead-t">
            {profile.name}
          </h2>
        </header>
        <div className="au-cv-grid">
          <CvBlock title="Positions">
            {[...timeline].reverse().map((t) => (
              <CvRow key={t.title} k={t.year} t={t.title} d={t.body} />
            ))}
          </CvBlock>
          <CvBlock title="Currently">
            {currently.map((c) => (
              <CvRow key={c.label} k={c.label} t={c.value} />
            ))}
          </CvBlock>
          <CvBlock title="Selected exhibits">
            {systems.map((s) => (
              <CvRow key={s.slug} k={s.index} t={s.title} d={s.category} href={`/systems/${s.slug}`} />
            ))}
          </CvBlock>
          <CvBlock title="Works">
            {projects.map((p) => (
              <CvRow key={p.slug} k={p.year} t={p.title} d={p.tagline} href={p.live} ext />
            ))}
          </CvBlock>
          <CvBlock title="Essays">
            {notes.map((n) => (
              <CvRow key={n.slug} k={n.date} t={n.title} href={`/notes/${n.slug}`} />
            ))}
          </CvBlock>
        </div>
      </section>

      <section className="au-contact" aria-labelledby="au-contact-t">
        <Aurora tone="lime" />
        <div className="au-contact-in" data-au="page">
          <Label a="5.3 · Enquiries" b={profile.availabilityDetail} />
          <h2 id="au-contact-t">
            {profile.availability}. <em>Write to me.</em>
          </h2>
          <div className="au-contact-row">
            <a href={`mailto:${profile.email}`} className="au-pill au-pill-ink" data-cursor="Write">
              {profile.email} <Arrow up />
            </a>
            <CopyEmail email={profile.email} />
          </div>
        </div>
      </section>
    </>
  );
}

function CvBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="au-cvb" data-au>
      <h3>{title}</h3>
      <dl>{children}</dl>
    </div>
  );
}

function CvRow({ k, t, d, href, ext }: { k: string; t: string; d?: string; href?: string; ext?: boolean }) {
  const body = (
    <>
      <b>{t}</b>
      {d ? <span>{d}</span> : null}
    </>
  );
  return (
    <div className="au-cvr">
      <dt>{k}</dt>
      <dd>
        {href ? (
          ext ? (
            <a href={href} target="_blank" rel="noreferrer">
              {body}
            </a>
          ) : (
            <Link href={href}>{body}</Link>
          )
        ) : (
          body
        )}
      </dd>
    </div>
  );
}

export function Missing({ path }: { path: string }) {
  return (
    <section className="au-missing">
      <Aurora tone="violet" />
      <Ribbon className="au-missing-ribbon" />
      <div className="au-missing-in">
        <Label a="Room 404" b="Not on the floor plan" />
        <h1>
          This wall is <em>bare.</em>
        </h1>
        <p>
          Nothing hangs at <code>{path}</code>. The piece may have moved rooms, or it was never part of the show.
        </p>
        <div className="au-missing-links">
          <Link href="/" className="au-pill">
            Back to the opening <Arrow />
          </Link>
          <Link href="/systems" className="au-pill au-pill-ghost">
            See the exhibits <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
