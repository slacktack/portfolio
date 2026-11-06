"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { currently, getNextNote, getNote, getProject, notes, principles, profile, stage, timeline } from "@/lib/site";
import { labSpecimen } from "./data";
import { bench, vortexParts } from "./demos";
import { Arrow, Leaf, Unfurl } from "./kit";
import { Plant } from "./plants";

function Head({ k, title, lede }: { k: string; title: ReactNode; lede: string }) {
  return (
    <header className="mo-page-head">
      <Unfurl>
        <span className="mo-k mo-k-pill">{k}</span>
      </Unfurl>
      <Unfurl delay={80}>
        <h1 className="mo-display">{title}</h1>
      </Unfurl>
      <Unfurl delay={160}>
        <p className="mo-lede">{lede}</p>
      </Unfurl>
    </header>
  );
}

export function Projects() {
  const [cur, setCur] = useState(0);
  const r = stage[cur];
  const p = getProject(r.slug);
  const drawers = [
    { name: "Drawer A · grown at work", tag: "Buyhatke" },
    { name: "Drawer B · grown after hours", tag: "After hours" },
  ];
  return (
    <>
      <Head k={`The seed library · ${stage.length} recordings`} title={<>Every seed here <em>still sprouts.</em></>} lede="Real screen recordings of shipped products. Pick a packet to grow it in the conservatory, then open the live thing." />

      <section className="mo-cons" aria-label="Conservatory player">
        <div className="mo-cons-glass">
          <video key={r.slug} className="mo-cons-video" src={r.video} poster={r.poster} autoPlay muted loop playsInline aria-label={`${r.title} screen recording`} />
        </div>
        <div className="mo-cons-info" key={`i-${r.slug}`}>
          <span className="mo-k">
            Packet № {String(cur + 1).padStart(2, "0")} · {r.tag}
          </span>
          <h2 className="mo-h2">{r.title}</h2>
          <p className="mo-cons-tag">{r.tagline}</p>
          {p && (
            <>
              <p className="mo-cons-desc">{p.description}</p>
              <p className="mo-cons-note">{p.note}</p>
              <ul className="mo-traits">
                {p.stack.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}
          <a className="mo-btn" href={r.href} target="_blank" rel="noreferrer">
            Open it live <Arrow up />
          </a>
        </div>
      </section>

      {drawers.map((d) => (
        <section key={d.tag} className="mo-drawer" aria-label={d.name}>
          <header className="mo-drawer-label">
            <span className="mo-k">{d.name}</span>
          </header>
          <div className="mo-packets">
            {stage.map((x, i) =>
              x.tag !== d.tag ? null : (
                <Unfurl key={x.slug} className="mo-packet" delay={(i % 4) * 60}>
                  <button type="button" className="mo-packet-btn" aria-pressed={i === cur} onClick={() => { setCur(i); window.scrollTo({ top: 0, behavior: "smooth" }); }} data-cursor="Grow it">
                    <span className="mo-packet-img">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={x.poster} alt="" loading="lazy" />
                    </span>
                    <span className="mo-k">Semen № {String(i + 1).padStart(2, "0")}</span>
                    <b>{x.title}</b>
                    <span className="mo-packet-tag">{x.tagline}</span>
                  </button>
                  <a className="mo-packet-live" href={x.href} target="_blank" rel="noreferrer" aria-label={`${x.title}, live site`}>
                    Live <Arrow up />
                  </a>
                </Unfurl>
              )
            )}
          </div>
        </section>
      ))}
    </>
  );
}

export function Lab() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    const h = window.location.hash.slice(1);
    const i = bench.findIndex((b) => b.slug === h);
    if (i >= 0) setCur(i); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);
  const pick = (i: number) => {
    setCur(i);
    history.replaceState(null, "", `#${bench[i].slug}`);
  };
  const onKey = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (cur + d + bench.length) % bench.length;
    pick(n);
    document.getElementById(`mo-pot-${bench[n].slug}`)?.focus();
  };
  const b = bench[cur];
  const sp = labSpecimen(b.slug)!;
  return (
    <>
      <Head k="The propagation bench" title={<>Small systems, <em>strange constraints.</em></>} lede="The mechanisms from the field guide, rebuilt small enough to hold in one hand and break on purpose. Every experiment runs in your browser; simulations are labelled as simulations." />

      <div className="mo-tray" role="tablist" aria-label="Experiments" onKeyDown={onKey}>
        {bench.map((x, i) => {
          const s = labSpecimen(x.slug)!;
          return (
            <button key={x.slug} id={`mo-pot-${x.slug}`} type="button" role="tab" aria-selected={i === cur} aria-controls="mo-cloche" tabIndex={i === cur ? 0 : -1} className="mo-trayp" data-hue={s.hue} onClick={() => pick(i)}>
              <span className="mo-trayp-sprout" aria-hidden="true">
                <Leaf />
                <Leaf />
              </span>
              <span className="mo-trayp-pot" aria-hidden="true" />
              <em>{s.latin}</em>
              <b>{x.label.split(" · ")[1] ?? x.label}</b>
            </button>
          );
        })}
      </div>

      <section id="mo-cloche" role="tabpanel" aria-labelledby={`mo-pot-${b.slug}`} className="mo-cloche" data-hue={sp.hue} key={b.slug}>
        <div className="mo-cloche-copy">
          <span className="mo-k">
            {sp.latin} · {b.label}
          </span>
          <h2 className="mo-h2">{b.title}</h2>
          <p>{b.note}</p>
          <span className="mo-sim">Simulation · state resets on reload</span>
          {b.from && (
            <Link className="mo-btn mo-btn-ghost" href={`/systems/${b.from.slug}`}>
              Grown from: {b.from.title} <Arrow />
            </Link>
          )}
        </div>
        <div className="mo-cloche-demo" data-lenis-prevent="">
          {b.demo ?? (
            <div className="mo-vortex">
              <Plant s={sp} big />
              <ol className="mo-parts">
                {vortexParts.map(([l, d], i) => (
                  <li key={l} style={{ "--i": i } as CSSProperties}>
                    <b>{l}</b>
                    <span>{d}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function Notes() {
  return (
    <>
      <Head k={`Field journals · ${notes.length} volumes`} title={<>Notes from <em>the potting shed.</em></>} lede="Long-form field notes on low-latency systems: what was planted, what came up, and what had to be pulled." />
      <ol className="mo-journals">
        {notes.map((n, i) => (
          <Unfurl as="li" key={n.slug} delay={i * 90}>
            <Link href={`/notes/${n.slug}`} className="mo-journal" data-i={i % 3}>
              <span className="mo-journal-band" aria-hidden="true" />
              <span className="mo-k">
                Vol. {String(i + 1).padStart(2, "0")} · {n.category}
              </span>
              <b>{n.title}</b>
              <span className="mo-journal-dek">{n.dek}</span>
              <span className="mo-journal-foot">
                {n.date} · {n.readTime} <Arrow />
              </span>
              <Leaf className="mo-journal-leaf" />
            </Link>
          </Unfurl>
        ))}
      </ol>
    </>
  );
}

export function Note({ slug }: { slug: string }) {
  const n = getNote(slug);
  if (!n) return <Missing />;
  const next = getNextNote(slug);
  return (
    <article className="mo-jpage">
      <nav className="mo-crumb" aria-label="Breadcrumb">
        <Link href="/notes">Field journals</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{n.title}</span>
      </nav>
      <div className="mo-paper">
        <header className="mo-paper-head">
          <span className="mo-stamp">{n.date}</span>
          <span className="mo-k">
            {n.category} · {n.readTime}
          </span>
          <h1>{n.title}</h1>
          <p className="mo-paper-dek">{n.dek}</p>
        </header>
        {n.sections.map((s, i) => (
          <section key={i} className="mo-paper-sec">
            {s.heading && <h2>{s.heading}</h2>}
            {s.body.map((p) => (
              <p key={p.slice(0, 30)}>{p}</p>
            ))}
            {s.list && (
              <ul>
                {s.list.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            )}
            {s.code && (
              <pre className="mo-code">
                <code>{s.code}</code>
              </pre>
            )}
            {s.quote && (
              <blockquote className="mo-pressed">
                <Leaf />
                <p>{s.quote}</p>
              </blockquote>
            )}
          </section>
        ))}
      </div>
      <Link href={`/notes/${next.slug}`} className="mo-nextplate" data-cursor="Next journal">
        <span className="mo-k">Next journal</span>
        <em>{next.title}</em>
        <b>
          {next.dek.slice(0, 80)}… <Arrow />
        </b>
      </Link>
    </article>
  );
}

export function About() {
  return (
    <>
      <Head k="The botanist's notebook" title={<>{profile.name}, <em>keeper of the glasshouse.</em></>} lede={profile.description} />

      <section className="mo-book">
        <Unfurl className="mo-book-page mo-book-l">
          <span className="mo-k">Specimen of the keeper</span>
          <div className="mo-seal" aria-hidden="true">
            <span>TG</span>
          </div>
          <dl className="mo-idcard">
            <div>
              <dt>Name</dt>
              <dd>{profile.name}</dd>
            </div>
            <div>
              <dt>Trade</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>Habitat</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <i className="mo-live" /> {profile.availability} · {profile.availabilityDetail}
              </dd>
            </div>
          </dl>
        </Unfurl>
        <Unfurl className="mo-book-page mo-book-r" delay={120}>
          <span className="mo-k">Growth rings</span>
          <div className="mo-rings">
            <svg viewBox="0 0 200 200" aria-hidden="true">
              {[90, 72, 56, 42, 30, 20].map((r, i) => (
                <circle key={r} cx="100" cy="100" r={r} style={{ "--i": i } as CSSProperties} />
              ))}
            </svg>
            <ol>
              {timeline.map((t) => (
                <li key={t.title}>
                  <span className="mo-k">{t.year}</span>
                  <b>{t.title}</b>
                  <p>{t.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Unfurl>
      </section>

      <section className="mo-rules" aria-labelledby="mo-rules-h">
        <header className="mo-sec-head">
          <div>
            <span className="mo-k">House rules</span>
            <h2 id="mo-rules-h" className="mo-h2">
              How the glasshouse <em>is kept.</em>
            </h2>
          </div>
        </header>
        <div className="mo-rule-grid">
          {principles.map((p, i) => (
            <Unfurl key={p.num} className="mo-rule" delay={i * 90}>
              <span className="mo-rule-n">{p.num}</span>
              <b>{p.title}</b>
              <p>{p.body}</p>
            </Unfurl>
          ))}
        </div>
      </section>

      <section className="mo-now" aria-label="Currently">
        {currently.map((c, i) => (
          <span key={c.label} className="mo-nowtag" style={{ "--i": i } as CSSProperties}>
            <i />
            <span className="mo-k">{c.label}</span>
            <b>{c.value}</b>
          </span>
        ))}
      </section>

      <Unfurl as="section" className="mo-contact" aria-labelledby="mo-contact-h">
        <span className="mo-k">Send a cutting</span>
        <h2 id="mo-contact-h" className="mo-display">
          Got a hard problem <em>that needs growing?</em>
        </h2>
        <div className="mo-contact-row">
          <a className="mo-btn mo-btn-big" href={`mailto:${profile.email}`}>
            {profile.email} <Arrow up />
          </a>
          <CopyEmail email={profile.email} />
        </div>
      </Unfurl>
    </>
  );
}

export function Missing() {
  return (
    <section className="mo-missing">
      <svg className="mo-emptypot" viewBox="0 0 200 200" aria-hidden="true">
        <path className="mo-ep-soil" d="M52 96h96" />
        <path className="mo-ep-pot" d="M44 92h112l-14 96H58z" />
        <path className="mo-ep-rim" d="M38 82h124v14H38z" />
        <path className="mo-ep-sprout" d="M100 84c0-18 2-30 0-44" />
        <path className="mo-ep-leaf" d="M100 52c-14-2-24-10-26-22 14 0 24 8 26 22z" />
      </svg>
      <span className="mo-k mo-k-pill">404 · uncatalogued</span>
      <h1 className="mo-display">
        This specimen <em>hasn&apos;t been planted.</em>
      </h1>
      <p className="mo-lede">The label is here but the pot is empty. Try the wall, or look it up in the field guide.</p>
      <div className="mo-hero-cta">
        <Link className="mo-btn" href="/">
          Back to the specimen wall <Arrow />
        </Link>
        <Link className="mo-btn mo-btn-ghost" href="/systems">
          Open the field guide <Arrow />
        </Link>
      </div>
    </section>
  );
}
