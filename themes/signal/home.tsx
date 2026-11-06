"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { getSystem, labItems, ledger, notes, profile, systems, timeline } from "@/lib/site";
import { ThemeTeaser } from "@/components/theme-palette";
import { Bar, Dial, Dots, Glitch, Icon, InView, Leds, Panel, Phos, PixelField, Ruler, Spark, pad, useIst, useReducedMotion } from "./ui";

const pick = (slug: string, i: number) => {
  const s = getSystem(slug);
  const m = s?.metrics[i];
  return { slug, svc: s?.shortTitle ?? slug, value: m?.value ?? "", label: m?.label ?? "" };
};

export const kpis = [pick("flights", 0), pick("flights", 1), pick("hotels", 1), pick("best-way-to-pay", 0), pick("categorizer", 2), pick("observability", 1)];

const arch = (slug: string, i: number) => getSystem(slug)?.architecture[i];

const stages = [
  { k: "Request", src: "flights", node: arch("flights", 0) },
  { k: "Fan-out", src: "flights", node: arch("flights", 2) },
  { k: "Resolve", src: "hotels", node: arch("hotels", 3) },
  { k: "Cache", src: "flights", node: arch("flights", 3) },
  { k: "Answer", src: "grocery", node: arch("grocery", 3) },
];

export const activity = [
  ...ledger.map((l) => ({ when: l.span, kind: l.group === "work" ? "COMMIT" : "SIDE", name: l.name, meta: l.mine ? `${l.mine}/${l.total}` : "—", stack: l.stack.join(", ") })),
  ...timeline.map((t) => ({ when: t.year, kind: "ROLE", name: t.title, meta: "", stack: "" })),
];

function Hero() {
  const { date } = useIst();
  return (
    <Panel className="sg-hero" label="Console / Overview" aside={`IST ${date}`} leds>
      <Phos />
      <PixelField className="sg-hero-field" />
      <div className="sg-hero-copy">
        <span className="sg-chip">
          <i className="sg-pulse" /> Operator on shift
        </span>
        <Glitch text={profile.name} className="sg-hero-name" />
        <p className="sg-hero-tag">{profile.tagline}</p>
        <p className="sg-hero-desc">{profile.description}</p>
        <div className="sg-actions">
          <Link className="sg-btn sg-btn-inv" href="/systems">
            <Icon name="services" /> Inspect services
          </Link>
          <Link className="sg-btn" href="/lab">
            <Icon name="terminal" /> Open terminal
          </Link>
        </div>
      </div>
      <div className="sg-hero-foot">
        <span>{profile.location}</span>
        <span>{profile.availability}</span>
        <span>{profile.availabilityDetail}</span>
      </div>
    </Panel>
  );
}

function DialPanel() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setI((n) => n + 1), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);
  const k = kpis[i % kpis.length];
  return (
    <Panel className="sg-dialp" leds label="Readout" aside={`${pad((i % kpis.length) + 1)}/${pad(kpis.length)}`}>
      <Dial value={k.value} label={k.label} turn={(i * 360) / kpis.length} />
      <div className="sg-dial-ctl">
        <button type="button" onClick={() => setI((n) => n + kpis.length - 1)} aria-label="Previous readout">
          ‹
        </button>
        <Link href={`/systems/${k.slug}`} className="sg-chip sg-chip-inv" aria-live="polite">
          {k.svc}
        </Link>
        <button type="button" onClick={() => setI((n) => n + 1)} aria-label="Next readout">
          ›
        </button>
      </div>
      <div className="sg-dial-leaders">
        {kpis.map((x, j) => (
          <div key={x.label} className="sg-leader" data-on={j === i % kpis.length ? "" : undefined}>
            <span>{x.svc}</span>
            <i aria-hidden="true" />
            <b>{x.value}</b>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Kpis() {
  return (
    <div className="sg-kpis">
      {kpis.map((k, i) => (
        <Link key={k.label} href={`/systems/${k.slug}`} className="sg-kpi" style={{ animationDelay: `${i * 70}ms` }}>
          <span className="sg-k">
            <span>{pad(i + 1)}</span> {k.label}
          </span>
          <Dots text={k.value} count />
          <Spark seedN={i + 1} />
          <span className="sg-kpi-src">
            <i className="sg-led" aria-hidden="true" /> svc/{k.slug} <Icon name="arrow" />
          </span>
        </Link>
      ))}
    </div>
  );
}

function Pipeline() {
  return (
    <Panel className="sg-pipe" leds label="Request pipeline · how a compare travels" aside="Read left to right">
      <Ruler n={96} />
      <div className="sg-pipe-track">
      <ol className="sg-pipe-row">
        {stages.map((s, i) => (
          <li key={s.k} className="sg-stage" style={{ "--i": i } as CSSProperties}>
            <span className="sg-stage-n">{pad(i + 1)}</span>
            <b className={i === 1 ? "sg-chip sg-chip-inv" : "sg-chip"}>{s.k}</b>
            <span className="sg-stage-l">{s.node?.label}</span>
            <span className="sg-stage-d">{s.node?.detail}</span>
            <Link href={`/systems/${s.src}`} className="sg-stage-src">
              from svc/{s.src}
            </Link>
          </li>
        ))}
      </ol>
      <div className="sg-pipe-wire" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
      </div>
    </Panel>
  );
}

function Health() {
  return (
    <Panel className="sg-health" leds label="Service health" aside={`${systems.length} registered`}>
      <ul>
        {systems.map((s) => (
          <li key={s.slug}>
            <Link href={`/systems/${s.slug}`}>
              <span className="sg-dot" aria-hidden="true" />
              <span className="sg-dim">{s.index}</span>
              <b>{s.shortTitle}</b>
              <span className="sg-health-c">{s.category}</span>
              <span className="sg-health-m">
                <b>{s.metrics[0].value}</b> <small>{s.metrics[0].label}</small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Activity() {
  return (
    <Panel className="sg-activity" leds label="Activity log · tail -f" aside={`${activity.length} lines`}>
      <div className="sg-tail" tabIndex={0} aria-label="Activity log">
        <ol>
          {[...activity, ...activity].map((a, i) => (
            <li key={i} aria-hidden={i >= activity.length ? true : undefined}>
              <span className="sg-dim">{a.when}</span>
              <span className={a.kind === "COMMIT" ? "sg-tag on" : "sg-tag"}>{a.kind}</span>
              <span className="sg-tail-n">{a.name}</span>
              <span className="sg-tail-m">{a.meta}</span>
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}

function CommitShare() {
  const rows = ledger.filter((l) => l.group === "work" && l.mine > 0 && l.total < 1000).slice(0, 7);
  return (
    <Panel className="sg-share" label="Commit share · authored / repo total" aside="git log --author">
      <ul>
        {rows.map((l) => (
          <li key={l.name}>
            <span className="sg-share-n">{l.name}</span>
            <Bar value={l.mine} total={l.total} width={20} />
            <span className="sg-share-v">
              {l.mine}/{l.total}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Shortcuts() {
  return (
    <div className="sg-short">
      <Panel label="Latest logs" aside={`${notes.length} docs`}>
        <ul className="sg-mini">
          {notes.map((n) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`}>
                <span className="sg-dim">{n.date}</span>
                <b>{n.title}</b>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel label="Terminal" aside={`${labItems.length} programs`}>
        <ul className="sg-mini sg-cmds">
          {labItems.slice(0, 5).map((l) => (
            <li key={l.slug}>
              <Link href={`/lab#${l.slug}`}>
                <span className="sg-acc">$</span> run {l.slug}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

const bootLines = ["mount console", "attach services", "tail activity", "sync clock · IST", "operator online"];

export function Boot() {
  const [on] = useState(() => {
    try {
      if (sessionStorage.getItem("sg-boot")) return false;
      sessionStorage.setItem("sg-boot", "1");
    } catch {
      // storage blocked
    }
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });
  if (!on) return null;
  return (
    <div className="sg-boot" aria-hidden="true">
      <PixelField className="sg-boot-field" step={26} />
      <div className="sg-boot-log">
        <b className="sg-doto">TG/OPS</b>
        {bootLines.map((l, i) => (
          <span key={l} style={{ "--d": i } as CSSProperties}>
            <em>[{pad(i + 1)}]</em> {l} <i>........</i> <strong>ok</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Home() {
  return (
    <div className="sg-home">
      <div className="sg-row sg-row-hero">
        <Hero />
        <DialPanel />
      </div>
      <Kpis />
      <InView>
        <Pipeline />
      </InView>
      <InView className="sg-row sg-row-ops">
        <Health />
        <Activity />
      </InView>
      <InView>
        <section className="sg-tease" aria-label="Other versions of this site">
          <div className="sg-tease-h">
            <Leds n={4} />
            <span className="sg-k">Alt consoles · same services, different sites</span>
            <Ruler n={60} />
          </div>
          <ThemeTeaser />
        </section>
      </InView>
      <InView className="sg-row sg-row-low">
        <CommitShare />
        <Shortcuts />
      </InView>
      <Footer />
    </div>
  );
}

export function Footer() {
  return (
    <footer className="sg-foot">
      <Ruler n={64} />
      <div className="sg-foot-row">
        <span className="sg-k">End of console</span>
        <a href={`mailto:${profile.email}`} className="sg-btn sg-btn-inv">
          <Icon name="mail" /> {profile.email}
        </a>
        <span className="sg-k sg-dim">© {profile.name} · Bangalore</span>
      </div>
    </footer>
  );
}
