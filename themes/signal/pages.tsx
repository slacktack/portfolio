"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CopyEmail } from "@/components/copy-email";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { currently, getNextNote, getNote, internalTools, labItems, notes, principles, profile, projects, stage, systems, timeline, type StageItem } from "@/lib/site";
import { Footer } from "./home";
import { Dots, Glitch, Icon, InView, Leader, Leds, Panel, Phos, PixelField, Ruler, pad, useIst, useReducedMotion } from "./ui";

function Head({ k, title, lede, children }: { k: string; title: string; lede?: ReactNode; children?: ReactNode }) {
  return (
    <header className="sg-head">
      <span className="sg-k">{k}</span>
      <Glitch text={title} />
      {lede ? <p className="sg-lede">{lede}</p> : null}
      {children}
    </header>
  );
}

function Monitor({ item, i }: { item: StageItem; i: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const p = projects.find((x) => x.slug === item.slug);
  useEffect(() => {
    const v = ref.current;
    if (!v || reduce) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => undefined);
        else v.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [reduce]);
  return (
    <InView className="sg-mon-wrap">
      <article className="sg-mon">
        <header className="sg-mon-h">
          <span className="sg-k">
            MON-{pad(i + 1)} · {item.tag}
          </span>
          <span className="sg-k sg-rec">
            <i /> Rec
          </span>
        </header>
        <div className="sg-screen">
          <video ref={ref} src={item.video} poster={item.poster} muted loop playsInline preload="none" controls={reduce} aria-label={`Screen recording of ${item.title}`} />
          <i className="sg-br tl" aria-hidden="true" />
          <i className="sg-br tr" aria-hidden="true" />
          <i className="sg-br bl" aria-hidden="true" />
          <i className="sg-br br" aria-hidden="true" />
          <span className="sg-scan" aria-hidden="true" />
        </div>
        <div className="sg-mon-b">
          <h2>{item.title}</h2>
          <p>{item.tagline}</p>
          {p ? (
            <div className="sg-leaders">
              <Leader k="Signal" v={p.highlight} />
              <Leader k="Stack" v={p.stack.slice(0, 3).join(" · ")} />
            </div>
          ) : null}
          <a className="sg-btn sg-btn-inv" href={item.href} target="_blank" rel="noreferrer">
            Open live <Icon name="arrow" />
          </a>
        </div>
      </article>
    </InView>
  );
}

export function Projects() {
  const work = stage.filter((s) => s.tag === "Buyhatke");
  const side = stage.filter((s) => s.tag !== "Buyhatke");
  return (
    <div className="sg-page">
      <Head
        k="Monitors / Wall"
        title="Monitor wall"
        lede="Real screen recordings of things that are running right now. Every monitor has a live link, so you can open it and judge it yourself."
      />
      <Phos />
      <div className="sg-wall-h">
        <span className="sg-chip sg-chip-inv">
          <Leds n={1} /> Bank A
        </span>
        <span className="sg-k">Production · the products the services power</span>
      </div>
      <div className="sg-wall">
        {work.map((s, i) => (
          <Monitor key={s.slug} item={s} i={i} />
        ))}
      </div>
      <div className="sg-wall-h">
        <span className="sg-chip sg-chip-inv">
          <Leds n={1} /> Bank B
        </span>
        <span className="sg-k">After hours · {projects.length} live side projects</span>
      </div>
      <div className="sg-wall">
        {side.map((s, i) => (
          <Monitor key={s.slug} item={s} i={i + work.length} />
        ))}
      </div>
      <Panel className="sg-private" label="Private network · internal tools" aside="No public URL">
        <ul>
          {internalTools.map((t) => (
            <li key={t.name}>
              <span className="sg-tag">{t.kind}</span>
              <b>{t.name}</b>
              <p>{t.line}</p>
            </li>
          ))}
        </ul>
      </Panel>
      <Footer />
    </div>
  );
}

function Vortex() {
  const nodes = [
    ["Client", "insert / query / delete"],
    ["WAL", "durable append + replay"],
    ["Memtable", "mutable in-memory index"],
    ["Segment", "immutable on-disk index"],
    ["Compaction", "merge + tombstone cleanup"],
  ];
  return (
    <div className="sg-vortex">
      <div className="sg-prose">
        <p>Most vector database projects pick a language and inherit its assumptions. VortexVault implements the same engine twice, once in C++ and once in Rust, behind a shared segment format and a shared benchmark harness.</p>
        <p>The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query has to touch both in-memory and on-disk state.</p>
        <p>Still in progress. The benchmark reports latency, recall and memory footprint for both implementations against the same workload.</p>
      </div>
      <ol className="sg-topo sg-topo-v">
        {nodes.map(([l, d], i) => (
          <li key={l}>
            <span className="sg-dim">N{pad(i + 1)}</span>
            <b>{l}</b>
            <span>{d}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const programs: Record<string, { note: string; el: () => ReactNode }> = {
  "cache-key": { note: "A flight search is expensive. Refining it should not be. The controls that change the answer miss the cache; the ones that only reshape it never leave the building.", el: () => <CacheKeyLab /> },
  deadlines: { note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.", el: () => <DeadlineLab /> },
  identity: { note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.", el: () => <IdentityLab /> },
  logs: { note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.", el: () => <LogStreamLab /> },
  memcached: { note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation and watch keys expire.", el: () => <MemcachedLab /> },
  "load-balancer": { note: "Weighted routing, health checks, circuit breakers and sticky sessions. The routing logic runs in your browser, so you can kill a node and watch the next request fail over.", el: () => <LoadBalancerDemo /> },
  "vortex-vault": { note: "A dual C++ / Rust vector database built to compare both runtimes against the same storage format and the same benchmark.", el: () => <Vortex /> },
};

export function Lab() {
  const [cur, setCur] = useState(() => {
    const h = typeof window === "undefined" ? "" : window.location.hash.slice(1);
    return h && programs[h] ? h : labItems[0].slug;
  });
  const item = labItems.find((l) => l.slug === cur) ?? labItems[0];
  const go = (slug: string) => {
    setCur(slug);
    history.replaceState(null, "", `#${slug}`);
  };
  return (
    <div className="sg-page">
      <Head k="Terminal / Lab" title="Terminal" lede="Small systems with strange constraints. Each program is a working model of a mechanism from the services. Run one, then try to break it." />
      <div className="sg-term">
        <Panel className="sg-term-list" leds label="ls ./programs" aside={`${labItems.length}`}>
          <ul role="tablist" aria-label="Programs" aria-orientation="vertical">
            {labItems.map((l, i) => (
              <li key={l.slug} role="presentation">
                <button type="button" role="tab" id={`tab-${l.slug}`} aria-selected={l.slug === cur} aria-controls="sg-term-out" onClick={() => go(l.slug)}>
                  <span className="sg-dim">{pad(i + 1)}</span>
                  <b>{l.title}</b>
                  <small>{l.detail}</small>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <section className="sg-term-out" id="sg-term-out" role="tabpanel" aria-labelledby={`tab-${cur}`}>
          <div className="sg-term-bar">
            <Leds />
            <span>tg@ops:~/lab</span>
            <span className="sg-dim">{item.year}</span>
          </div>
          <div className="sg-term-cmd" key={cur}>
            <span className="sg-acc">$</span> run {item.slug}
            <span className="sg-caret" aria-hidden="true" />
          </div>
          <h2 className="sg-term-t">{item.title}</h2>
          <p className="sg-term-note">{programs[cur]?.note}</p>
          <div className="sg-demo" key={`d-${cur}`}>
            {programs[cur]?.el()}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export function Notes() {
  return (
    <div className="sg-page">
      <Head k="Logs / Docs" title="Field logs" lede="Long-form notes on the trade-offs behind the services: latency, quotas, cold starts. Written after the fact, with the numbers attached." />
      <Panel className="sg-logs" leds label="journalctl --unit=notes" aside={`${notes.length} entries`}>
        <ol>
          {notes.map((n, i) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`}>
                <span className="sg-logs-ln sg-dim">{pad(i + 1)}</span>
                <span className="sg-logs-meta">
                  <span>{n.date}</span>
                  <span className="sg-tag">{n.category}</span>
                  <span className="sg-dim">{n.readTime}</span>
                </span>
                <span className="sg-logs-body">
                  <b>{n.title}</b>
                  <span>{n.dek}</span>
                </span>
                <span className="sg-logs-go">
                  open <Icon name="arrow" />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Panel>
      <Footer />
    </div>
  );
}

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function Note({ slug }: { slug: string }) {
  const n = getNote(slug);
  if (!n) return <Missing path={`/notes/${slug}`} />;
  const next = getNextNote(n.slug);
  let line = 0;
  return (
    <div className="sg-page sg-note">
      <header className="sg-head">
        <nav className="sg-crumbs" aria-label="Breadcrumb">
          <Link href="/notes">Logs</Link>
          <span>/</span>
          <span aria-current="page">{n.slug}.md</span>
        </nav>
        <div className="sg-case-meta">
          <span className="sg-chip">{n.date}</span>
          <span className="sg-chip">{n.category}</span>
          <span className="sg-chip">{n.readTime}</span>
        </div>
        <Glitch text={n.title} />
        <p className="sg-lede">{n.dek}</p>
      </header>
      <div className="sg-case-body">
        <aside className="sg-toc" aria-label="Contents">
          <span className="sg-k">Contents</span>
          <ol>
            {n.sections
              .filter((s) => s.heading)
              .map((s, i) => (
                <li key={s.heading}>
                  <a href={`#${slugify(s.heading ?? "")}`}>
                    <span className="sg-dim">{pad(i + 1)}</span> {s.heading}
                  </a>
                </li>
              ))}
          </ol>
        </aside>
        <article className="sg-doc">
          {n.sections.map((s, i) => (
            <section key={i} id={s.heading ? slugify(s.heading) : undefined}>
              {s.heading ? (
                <h2>
                  <span className="sg-acc">##</span> {s.heading}
                </h2>
              ) : null}
              {s.body.map((p) => (
                <p key={p} data-ln={pad(++line)}>
                  {p}
                </p>
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
          <div className="sg-doc-end">
            <span className="sg-k">EOF</span>
            <Ruler n={32} />
          </div>
          <nav className="sg-pn" aria-label="More logs">
            <Link href="/notes">
              <span className="sg-k">‹ All logs</span>
              <b>Field logs</b>
            </Link>
            <Link href={`/notes/${next.slug}`} className="sg-pn-next">
              <span className="sg-k">Next log ›</span>
              <b>{next.title}</b>
            </Link>
          </nav>
        </article>
      </div>
      <Footer />
    </div>
  );
}

export function About() {
  const { time } = useIst();
  return (
    <div className="sg-page">
      <Head k="Operator / Profile" title="Operator profile" />
      <div className="sg-op">
        <Panel className="sg-op-card" leds label="whoami" aside={`IST ${time}`}>
          <PixelField className="sg-op-field" step={18} />
          <div className="sg-op-id">
            <span className="sg-mark sg-mark-l" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            <h2 className="sg-op-name">
              <Dots text={profile.name} />
            </h2>
            <p className="sg-hero-tag">{profile.tagline}</p>
            <p>{profile.description}</p>
          </div>
          <div className="sg-leaders">
            <Leader k="Role" v={profile.role} />
            <Leader k="Base" v={profile.location} />
            <Leader k="Status" v={profile.availability} />
            <Leader k="Seeking" v={profile.availabilityDetail} />
            <Leader k="Services owned" v={String(systems.length)} />
          </div>
        </Panel>
        <Panel className="sg-op-now" label="Current state">
          <div className="sg-leaders">
            {currently.map((c) => (
              <Leader key={c.label} k={c.label} v={c.value} />
            ))}
          </div>
          <span className="sg-k sg-op-k">On call for</span>
          <ul className="sg-mini sg-op-svc">
            {systems.map((x) => (
              <li key={x.slug}>
                <Link href={`/systems/${x.slug}`}>
                  <span>
                    <i className="sg-dot" aria-hidden="true" /> {x.shortTitle}
                  </span>
                  <span className="sg-dim">{x.index}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <InView>
        <Panel className="sg-uptime" label="Uptime · career history" aside={`${timeline.length} entries`}>
          <ol>
            {timeline.map((t, i) => (
              <li key={t.title}>
                <Dots text={t.year} className="sg-uptime-y" />
                <span className="sg-uptime-bar" aria-hidden="true" data-last={i === timeline.length - 1 ? "" : undefined} />
                <div>
                  <b>{t.title}</b>
                  <p>{t.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </InView>

      <InView>
        <div className="sg-sops">
          {principles.map((p) => (
            <article key={p.num} className="sg-card">
              <span className="sg-chip sg-chip-inv">SOP-{p.num}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </InView>

      <InView>
        <Panel className="sg-contact" label="Page the operator" aside="Email only">
          <p className="sg-contact-t">Hard problem with a p99 attached? Send it over.</p>
          <div className="sg-contact-row">
            <a className="sg-btn sg-btn-inv sg-btn-lg" href={`mailto:${profile.email}`}>
              <Icon name="mail" /> {profile.email}
            </a>
            <CopyEmail email={profile.email} />
          </div>
        </Panel>
      </InView>
      <Footer />
    </div>
  );
}

export function Missing({ path }: { path: string }) {
  return (
    <div className="sg-page sg-404">
      <Panel className="sg-404-p" label="Error · route not found" aside="HTTP 404">
        <PixelField className="sg-404-field" />
        <Dots text="404" className="sg-404-n" />
        <Glitch text="No service answers here." as="h1" />
        <pre className="sg-404-log">
          <code>
            {`> GET ${path}\n> resolve ........ miss\n> cache .......... miss\n> upstream ....... none registered\n> status ......... 404`}
          </code>
        </pre>
        <div className="sg-actions">
          <Link href="/" className="sg-btn sg-btn-inv">
            <Icon name="console" /> Back to console
          </Link>
          <Link href="/systems" className="sg-btn">
            <Icon name="services" /> Service registry
          </Link>
        </div>
      </Panel>
    </div>
  );
}
