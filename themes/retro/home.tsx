"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { applySkin, openThemes, useSkin } from "@/components/skin";
import { currently, profile, systems } from "@/lib/site";
import { skins } from "@/lib/skins";
import { Donut, LineChart, Spark } from "./charts";
import {
  alerts,
  delivery,
  eventData,
  eventSeries,
  fmt,
  kpis,
  onWatch,
  opFor,
  ops,
  pct,
  totalVolume,
  trendData,
  watchCount,
  type RangeKey,
} from "./data";

function Panel({
  k,
  title,
  action,
  children,
  className,
  i = 0,
}: {
  k?: string;
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  i?: number;
}) {
  return (
    <section
      className={`rt-panel rt-r ${className ?? ""}`.trim()}
      style={{ "--i": i } as CSSProperties}
    >
      <header className="rt-ph">
        <div className="rt-ph-t">
          {k && <span className="rt-k">{k}</span>}
          <h2>{title}</h2>
        </div>
        {action && <div className="rt-ph-a">{action}</div>}
      </header>
      {children}
    </section>
  );
}

function LiveStrip() {
  const [i, setI] = useState(0);
  const [clock, setClock] = useState("--:--:--");
  useEffect(() => {
    const t = window.setInterval(() => setI((v) => (v + 1) % ops.length), 4200);
    const c = window.setInterval(
      () => setClock(new Date().toLocaleTimeString("en-GB", { hour12: false })),
      1000,
    );
    return () => {
      window.clearInterval(t);
      window.clearInterval(c);
    };
  }, []);
  const op = ops[i];
  return (
    <div className="rt-live rt-r">
      <span className="rt-live-badge">
        <i className="rt-live-dot" /> Live
      </span>
      <div className="rt-live-c" key={op.slug}>
        <b>{op.name}</b>
        <span>{op.code}</span>
        <span className="rt-ok">success {pct(op.success)}</span>
        <span className={op.errors > 0.5 ? "rt-warn" : ""}>err {pct(op.errors)}</span>
        <span>{fmt(op.volume)}K req/day</span>
        <span>p50 {op.delay}ms</span>
      </div>
      <div className="rt-live-prog" aria-hidden="true">
        <i key={i} />
      </div>
      <span className="rt-live-clock">{clock} IST</span>
    </div>
  );
}

function Kpi({ item, i }: { item: (typeof kpis)[number]; i: number }) {
  return (
    <article className="rt-kpi rt-r" style={{ "--i": i } as CSSProperties}>
      <header>
        <span className="rt-k">{item.k}</span>
        <span className={`rt-delta ${item.dir}`}>{item.delta}</span>
      </header>
      <div className="rt-kpi-v">{item.v}</div>
      <div className="rt-kpi-foot">
        <span>{item.note}</span>
        <Spark data={item.data} color={item.color} height={30} />
      </div>
    </article>
  );
}

function RealtimePanel() {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(true);
  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setIdx((v) => (v + 1) % ops.length), 7600);
    return () => window.clearInterval(t);
  }, [playing]);
  const op = ops[idx];
  const sys = systems[idx];
  const spark = useMemo(() => op.spark, [op]);
  return (
    <Panel
      k="Realtime"
      title={
        <span className="rt-live-title">
          {sys.shortTitle}
          <span className="rt-pulse" />
        </span>
      }
      className="rt-realtime"
      action={
        <div className="rt-ctl">
          <button type="button" onClick={() => setIdx((idx - 1 + ops.length) % ops.length)} aria-label="Previous system">
            ←
          </button>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause rotation" : "Play rotation"}>
            {playing ? "❚❚" : "▶"}
          </button>
          <button type="button" onClick={() => setIdx((idx + 1) % ops.length)} aria-label="Next system">
            →
          </button>
        </div>
      }
    >
      <div className="rt-realtime-top">
        <div>
          <span className="rt-k">{op.code} · {sys.category}</span>
          <p className="rt-realtime-p">{sys.promise}</p>
        </div>
        <span className="rt-chip ok">
          <i /> healthy
        </span>
      </div>
      <div className="rt-bars" key={op.slug}>
        <div>
          <div className="rt-bar-row">
            <span>Success rate</span>
            <b>{pct(op.success)}</b>
          </div>
          <div className="rt-bar">
            <i className="fill green" style={{ width: `${op.success}%` }} />
          </div>
        </div>
        <div>
          <div className="rt-bar-row">
            <span>Error rate</span>
            <b>{pct(op.errors)}</b>
          </div>
          <div className="rt-bar">
            <i className="fill red" style={{ width: `${Math.max(2, op.errors * 14)}%` }} />
          </div>
        </div>
        <div>
          <div className="rt-bar-row">
            <span>Volume</span>
            <b>{fmt(op.volume)}K</b>
          </div>
          <div className="rt-bar">
            <i className="fill blue" style={{ width: `${Math.min(100, op.volume / 6.2)}%` }} />
          </div>
        </div>
      </div>
      <div className="rt-realtime-grid">
        <div className="rt-mini">
          <span className="rt-k">Error rate</span>
          <b>{pct(op.errors)}</b>
        </div>
        <div className="rt-mini">
          <span className="rt-k">Response</span>
          <b>{op.delay}<small>ms</small></b>
        </div>
        <div className="rt-mini wide">
          <span className="rt-k">Traffic · last 24h</span>
          <Spark data={spark} color="var(--r-blue)" height={40} />
        </div>
      </div>
      <div className="rt-realtime-foot">
        <span>
          {String(idx + 1).padStart(2, "0")} / {String(ops.length).padStart(2, "0")}
        </span>
        <Link href={`/systems/${op.slug}`}>Inspect system →</Link>
      </div>
    </Panel>
  );
}

function Alerts() {
  return (
    <Panel
      k="Incidents"
      title="Active alerts"
      className="rt-alerts"
      i={1}
      action={<span className="rt-chip crit">{alerts.filter((a) => a.severity !== "resolved").length} open</span>}
    >
      <ul className="rt-alert-list">
        {alerts.map((a) => (
          <li key={a.id} className={`rt-alert ${a.severity}`}>
            <span className="rt-alert-ico" aria-hidden="true">
              {a.severity === "resolved" ? "✓" : a.severity === "critical" ? "!" : "▲"}
            </span>
            <div>
              <div className="rt-alert-h">
                <b>{a.title}</b>
                <span className="rt-k">{a.time}</span>
              </div>
              <p>{a.body}</p>
              <div className="rt-alert-m">
                <span>{a.id}</span>
                <span>{a.system}</span>
                <span className={`sev ${a.severity}`}>{a.severity}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="rt-alert-foot">
        <span className="rt-live-dot" /> Auto-refresh · 30s
        <Link href="/systems/observability">Alerting pipeline →</Link>
      </div>
    </Panel>
  );
}

function PosGrid() {
  return (
    <Panel
      k="Portfolio"
      title="Systems overview"
      className="rt-pos"
      i={0}
      action={
        <div className="rt-pos-meta">
          <span className="rt-chip">{ops.length} POS</span>
          <span className={`rt-chip ${watchCount ? "warn" : "ok"}`}><i /> {watchCount ? `${watchCount} on watch` : "all systems nominal"}</span>
        </div>
      }
    >
      <div className="rt-pos-grid">
        {ops.map((o, i) => (
          <Link
            href={`/systems/${o.slug}`}
            key={o.slug}
            className={`rt-pos-card ${onWatch(o) ? "degraded" : ""}`}
            style={{ "--i": i } as CSSProperties}
          >
            <div className="rt-pos-top">
              <span className="rt-k">{o.code}</span>
              <span className={`rt-chip ${onWatch(o) ? "warn" : "ok"}`}>
                <i /> {onWatch(o) ? "watch" : "healthy"}
              </span>
            </div>
            <h3>{o.name}</h3>
            <Spark data={o.spark} color={onWatch(o) ? "var(--r-orange)" : "var(--r-blue)"} height={34} />
            <div className="rt-pos-rate">
              <div className="rt-bar-row">
                <span>Success</span>
                <b>{pct(o.success)}</b>
              </div>
              <div className="rt-bar">
                <i className="fill green" style={{ width: `${o.success}%` }} />
              </div>
            </div>
            <dl>
              <div>
                <dt>Volume</dt>
                <dd>{fmt(o.volume)}K</dd>
              </div>
              <div>
                <dt>Errors</dt>
                <dd>{pct(o.errors)}</dd>
              </div>
              <div>
                <dt>Delay</dt>
                <dd>{o.delay}ms</dd>
              </div>
            </dl>
          </Link>
        ))}
        <Link href="/systems" className="rt-pos-card rt-pos-more">
          <span className="rt-k">Index</span>
          <b>All {ops.length} systems →</b>
          <span className="rt-k">{fmt(totalVolume)}K req/day combined</span>
        </Link>
      </div>
    </Panel>
  );
}

function Trends() {
  const [range, setRange] = useState<RangeKey>("7D");
  const [seed, setSeed] = useState(12);
  const [spin, setSpin] = useState(false);
  const data = useMemo(() => trendData(range, seed), [range, seed]);
  const refresh = () => {
    setSeed((s) => s + 7);
    setSpin(true);
    window.setTimeout(() => setSpin(false), 700);
  };
  return (
    <Panel
      k="Errors"
      title="Error trends & analysis"
      className="rt-trends"
      i={0}
      action={
        <div className="rt-trend-ctl">
          <div className="rt-seg" role="group" aria-label="Range">
            {(["24H", "7D", "30D"] as const).map((r) => (
              <button key={r} type="button" className={range === r ? "on" : ""} onClick={() => setRange(r)}>
                {r}
              </button>
            ))}
          </div>
          <button type="button" className={`rt-refresh ${spin ? "spin" : ""}`} onClick={refresh} aria-label="Refresh trend data">
            ↻
          </button>
        </div>
      }
    >
      <div className="rt-trend-sum">
        <div>
          <span className="rt-k">Total errors · {range}</span>
          <b className="rt-big">
            {fmt(Math.round(data.series.reduce((a, s) => a + s.data.reduce((x, y) => x + y, 0), 0)))}
          </b>
        </div>
        <span className="rt-delta down">-18.2% vs previous</span>
        <div className="rt-legend">
          {data.series.map((s) => (
            <span key={s.id}>
              <i style={{ background: s.color }} /> {s.label}
            </span>
          ))}
        </div>
      </div>
      <div className="rt-scan" key={`${range}-${seed}`}>
        <LineChart labels={data.labels} series={data.series} height={236} delay={0.05} />
      </div>
    </Panel>
  );
}

function Events() {
  const [active, setActive] = useState<string[]>(["feed", "received", "price"]);
  const [seed] = useState(31);
  const all = useMemo(() => eventData(seed), [seed]);
  const shown = all.filter((s) => active.includes(s.id));
  const toggle = (id: string) =>
    setActive((cur) => (cur.includes(id) ? (cur.length === 1 ? cur : cur.filter((x) => x !== id)) : [...cur, id]));
  return (
    <Panel k="Events" title="Event volume" className="rt-events" i={1}>
      <div className="rt-chips">
        {eventSeries.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`rt-chip ${active.includes(s.id) ? "on" : ""}`}
            onClick={() => toggle(s.id)}
            style={{ "--c": s.color } as CSSProperties}
          >
            <i /> {s.label}
          </button>
        ))}
      </div>
      <div className="rt-legend rt-legend-b">
        {shown.map((s) => (
          <span key={s.id}>
            <i style={{ background: s.color }} /> {s.label}
            <b>{Math.round(s.data[s.data.length - 1])}K</b>
          </span>
        ))}
      </div>
      <LineChart key={shown.map((s) => s.id).join()} labels={all[0].data.map((_, i) => `${String(i * 2).padStart(2, "0")}:00`)} series={shown} height={252} unit="K" />
    </Panel>
  );
}

function Delivery() {
  return (
    <Panel k="Delivery" title="Notification health" className="rt-delivery" i={0}>
      <div className="rt-delivery-top">
        <Donut segments={delivery} center="96.4%" label="delivered" />
        <ul>
          {delivery.map((d) => (
            <li key={d.label}>
              <span>
                <i style={{ background: d.color }} /> {d.label}
              </span>
              <b>{d.value}%</b>
              <div className="rt-bar">
                <i className="fill" style={{ width: `${Math.min(100, d.value)}%`, background: d.color }} />
              </div>
            </li>
          ))}
        </ul>
      </div>
      <p className="rt-delivery-note">
        <span className="rt-live-dot" /> 232ms cold start · 12.5B log events · 201 streams
      </p>
    </Panel>
  );
}

function Now() {
  return (
    <Panel k="Now" title="Currently" className="rt-now" i={1}>
      <dl>
        {currently.map((c) => (
          <div key={c.label}>
            <dt>{c.label}</dt>
            <dd>{c.value}</dd>
          </div>
        ))}
      </dl>
      <Link href="/about" className="rt-link">
        Full readout →
      </Link>
    </Panel>
  );
}

function Contact() {
  return (
    <Panel k="Signal" title="Open channel" className="rt-contact" i={2}>
      <p className="rt-contact-k">{profile.availability} · {profile.availabilityDetail}</p>
      <a href={`mailto:${profile.email}`} className="rt-contact-mail">
        {profile.email}
      </a>
      <p className="rt-contact-loc">{profile.location} · UTC+5:30</p>
      <div className="rt-contact-actions">
        <a href={`mailto:${profile.email}`} className="rt-btn primary">
          Start a conversation
        </a>
        <button type="button" className="rt-btn" onClick={openThemes}>
          Switch theme
        </button>
      </div>
    </Panel>
  );
}

function SwitchRow({ label, on, onChange }: { label: string; on: boolean; onChange: () => void }) {
  return (
    <button type="button" className={`rt-switch-row ${on ? "on" : ""}`} onClick={onChange} aria-pressed={on}>
      <span>{label}</span>
      <span className="rt-switch" aria-hidden="true"><i /></span>
    </button>
  );
}

export function Home() {
  const op = opFor("flights");
  const current = useSkin().id;
  const [showStatus, setShowStatus] = useState(true);
  const [showRealtime, setShowRealtime] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const showRail = showRealtime || showAlerts;
  return (
    <div className="rt-home">
      <section className="rt-hero rt-r">
        <div className="rt-hero-l">
          <p className="rt-kick">
            <span className="rt-live-dot" /> Live ops · {profile.location} · open to hard problems
          </p>
          <h1>
            The invisible
            <br />
            <em>layer.</em>
          </h1>
          <p className="rt-lede">{profile.description}</p>
          <div className="rt-hero-actions">
            <Link href="/systems" className="rt-btn primary">
              Explore systems <span aria-hidden="true">→</span>
            </Link>
            <a href={`mailto:${profile.email}`} className="rt-btn">
              Email me
            </a>
            <button type="button" className="rt-btn ghost" onClick={openThemes}>
              Themes
            </button>
          </div>
          <dl className="rt-hero-fields">
            <div>
              <dt>Role</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>Uptime</dt>
              <dd>99.98%</dd>
            </div>
            <div>
              <dt>Requests / day</dt>
              <dd>{(totalVolume / 1000).toFixed(2)}M</dd>
            </div>
            <div>
              <dt>p99</dt>
              <dd>20ms</dd>
            </div>
          </dl>
        </div>

        <aside className="rt-hud rt-r" style={{ "--i": 1 } as CSSProperties}>
          <div className="rt-hud-head">
            <span className="rt-k">Dashboard controls</span>
            <span className="rt-chip ok"><i /> live</span>
          </div>
          <div className="rt-switches">
            <SwitchRow label="Status bar" on={showStatus} onChange={() => setShowStatus((v) => !v)} />
            <SwitchRow label="Realtime metrics" on={showRealtime} onChange={() => setShowRealtime((v) => !v)} />
            <SwitchRow label="Alerts" on={showAlerts} onChange={() => setShowAlerts((v) => !v)} />
          </div>
          <div className="rt-hud-signal">
            <div className="rt-hud-signal-h">
              <span className="rt-k">Live signal · {op.code}</span>
              <b>{op.name}</b>
            </div>
            <div className="rt-eq" aria-hidden="true">
              {[22, 46, 34, 72, 58, 88, 44, 66, 92, 52, 74, 38, 62, 84, 48, 68].map((h, i) => (
                <i key={i} style={{ "--h": `${h}%`, "--d": `${i * 0.09}s` } as CSSProperties} />
              ))}
            </div>
            <div className="rt-hud-stats">
              <div><span>Requests / day</span><b>{fmt(op.volume)}K</b></div>
              <div><span>Success</span><b>{pct(op.success)}</b></div>
              <div><span>p99</span><b>20<small>ms</small></b></div>
            </div>
            <div className="rt-hud-foot">
              <span><i className="rt-live-dot" /> streaming</span>
              <Link href="/systems">View systems →</Link>
            </div>
          </div>
        </aside>
      </section>

      {showStatus && <LiveStrip />}

      <section className="rt-kpis" aria-label="Key metrics">
        {kpis.map((k, i) => (
          <Kpi key={k.k} item={k} i={i} />
        ))}
      </section>

      {showRail && (
        <div className={`rt-grid-2 ${showRealtime && showAlerts ? "" : "solo"}`}>
          {showRealtime && <RealtimePanel />}
          {showAlerts && <Alerts />}
        </div>
      )}

      <PosGrid />

      <div className="rt-grid-charts">
        <Trends />
        <Events />
      </div>

      <div className="rt-grid-3">
        <Delivery />
        <Now />
        <Contact />
      </div>

      <section className="rt-panel rt-variants rt-r">
        <div className="rt-ph">
          <div className="rt-ph-t">
            <span className="rt-k">Registry</span>
            <h2>This site comes in {skins.length} versions</h2>
          </div>
          <div className="rt-ph-a">
            <span className="rt-chip">{skins.length} skins</span>
            <button type="button" className="rt-btn small primary" onClick={openThemes}>
              Open the palette →
            </button>
          </div>
        </div>
        <div className="rt-variants-body">
          <p>Same work. Same data. Every layer re-skins top to bottom. Pick one.</p>
          <div className="rt-variant-tags">
            {skins.map((s) => (
              <button
                type="button"
                key={s.id}
                className={`rt-variant ${s.id === current ? "on" : ""}`}
                aria-pressed={s.id === current}
                onClick={() => applySkin(s.id)}
              >
                <i style={{ background: s.swatches[1]?.hex ?? s.swatches[0].hex }} />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
