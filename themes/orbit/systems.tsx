import Link from "next/link";
import type { CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, systems, type SystemCase } from "@/lib/site";
import { beaconColors } from "./data";
import { Arrow, Glyph, Kicker, SectionHead, tint } from "./ui";

const colorOf = (slug: string) => beaconColors[Math.max(0, systems.findIndex((s) => s.slug === slug)) % beaconColors.length];

function Radar({ active }: { active?: string }) {
  return (
    <div className="ob-radar" aria-label="Outposts around the tower" role="group">
      <svg viewBox="-110 -110 220 220" aria-hidden="true">
        <defs>
          <radialGradient id="ob-rg" r="1">
            <stop offset="0" stopColor="#0ea5e9" stopOpacity="0.28" />
            <stop offset="1" stopColor="#0ea5e9" stopOpacity="0.04" />
          </radialGradient>
          <linearGradient id="ob-sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7dd3fc" stopOpacity="0" />
            <stop offset="1" stopColor="#7dd3fc" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle r="104" fill="url(#ob-rg)" />
        {[34, 68, 102].map((r) => (
          <circle key={r} r={r} className="ob-radar-ring" />
        ))}
        <path d="M-104 0H104M0-104V104" className="ob-radar-ring" />
        <g className="ob-radar-sweep">
          <path d="M0 0L104 0A104 104 0 0 0 73.5 -73.5Z" fill="url(#ob-sweep)" />
        </g>
        <circle r="9" fill="#0c1b2a" />
        <circle r="4" fill="#fb923c" />
      </svg>
      {systems.map((s, i) => {
        const a = ((i + 0.5) / systems.length) * Math.PI * 2;
        const style = { ...tint(colorOf(s.slug)), left: `${50 + Math.sin(a) * 34}%`, top: `${50 - Math.cos(a) * 34}%`, "--ob-d": `${i * 90}ms` } as CSSProperties;
        return (
          <Link key={s.slug} href={`/systems/${s.slug}`} className="ob-blip" style={style} aria-current={active === s.slug ? "page" : undefined} title={s.title}>
            <i />
            <span>{s.shortTitle}</span>
          </Link>
        );
      })}
    </div>
  );
}

export function SystemsView() {
  return (
    <div className="ob-v ob-v-systems">
      <div className="ob-tower-top">
        <div>
          <Kicker>Control tower · outpost roster</Kicker>
          <h2 className="ob-h2">
            {systems.length} systems, <em>each one an outpost</em> on this planet.
          </h2>
          <p className="ob-lede">
            Production backends from comparison engines to observability. Pick one off the board, or fly the craft to a beacon around the tower and land.
          </p>
        </div>
        <Radar />
      </div>

      <ol className="ob-board" aria-label="Systems">
        <li className="ob-board-head" aria-hidden="true">
          <span>Gate</span>
          <span>Outpost</span>
          <span>Headline</span>
          <span>Status</span>
        </li>
        {systems.map((s, i) => {
          const m = s.metrics[0];
          return (
            <li key={s.slug} style={{ ...tint(colorOf(s.slug)), "--ob-i": i } as CSSProperties}>
              <Link href={`/systems/${s.slug}`} className="ob-board-row">
                <span className="ob-gate">{s.index}</span>
                <span className="ob-board-t">
                  <b>{s.title}</b>
                  <small>{s.category}</small>
                </span>
                <span className="ob-board-m">
                  {m ? (
                    <>
                      <b>{m.value}</b>
                      <small>{m.label}</small>
                    </>
                  ) : null}
                </span>
                <span className="ob-board-go">
                  <i aria-hidden="true" />
                  Land
                  <Arrow />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function SystemView({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  const c = colorOf(s.slug);
  return (
    <article className="ob-v ob-v-system" style={tint(c)}>
      <header className="ob-dossier">
        <div className="ob-dossier-badge">
          <Glyph k="beacon" size={26} />
          <span>Outpost {s.index}</span>
        </div>
        <Kicker>
          {s.category} · {s.year}
        </Kicker>
        <h2 className="ob-h2">{s.title}</h2>
        <p className="ob-promise">{s.promise}</p>
        <p className="ob-role">{s.role}</p>
        <ul className="ob-chips" aria-label="Stack">
          {s.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </header>

      <section aria-label="Telemetry" className="ob-telemetry">
        {s.metrics.map((m, i) => (
          <div key={m.label} className="ob-gauge" style={{ "--ob-i": i } as CSSProperties}>
            <b>{m.value}</b>
            <span>{m.label}</span>
            {m.note ? <small>{m.note}</small> : null}
          </div>
        ))}
      </section>

      <figure className="ob-artifact">
        <div className="ob-artifact-box">
          <SystemArtifact kind={s.artifact} />
        </div>
        <figcaption>{s.summary}</figcaption>
      </figure>

      <section className="ob-block">
        <SectionHead k="01 · Mission" title="The problem" />
        <div className="ob-prose">
          {s.problem.map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
        </div>
      </section>

      <section className="ob-block">
        <SectionHead k="02 · Flight rules" title="Constraints" />
        <ol className="ob-rules">
          {s.constraints.map((t, i) => (
            <li key={t}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      <section className="ob-block">
        <SectionHead k="03 · Flight path" title="Architecture" note="Each waypoint is a stage the request passes through." />
        <ol className="ob-path">
          {s.architecture.map((a, i) => (
            <li key={a.label} style={{ "--ob-i": i } as CSSProperties}>
              <i aria-hidden="true">{i + 1}</i>
              <b>{a.label}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ol>
        <ul className="ob-rail">
          {s.rail.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <section className="ob-block">
        <SectionHead k="04 · Headwinds" title="The hard part" />
        <div className="ob-hard">
          {s.hardPart.map((h, i) => (
            <div key={h.title} className="ob-hard-card">
              <span>{String(i + 1).padStart(2, "0")}</span>
              <b>{h.title}</b>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </section>

      {s.broke ? (
        <section className="ob-block ob-turb">
          <SectionHead k="05 · Turbulence" title={`What broke: ${s.broke.title}`} />
          <p>{s.broke.body}</p>
        </section>
      ) : null}

      {s.flaws?.length ? (
        <section className="ob-block">
          <SectionHead k="06 · Known flaws" title="What is still wrong with it" />
          <ul className="ob-flaws">
            {s.flaws.map((f) => (
              <li key={f.title}>
                <b>{f.title}</b>
                <p>{f.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="ob-block ob-split">
        <div>
          <SectionHead k="07 · Next flight" title="What I'd do differently" />
          <ul className="ob-diff">
            {s.differently.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <SectionHead k="08 · Unlocked" title="What it proves" />
          <ul className="ob-badges">
            {s.proves.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ob-block">
        <SectionHead k="09 · Receipts" title="Proof, not adjectives" />
        <div className="ob-receipts">
          {s.receipts.map((r) => (
            <div key={r.label}>
              <span>{r.label}</span>
              <b>{r.value}</b>
              <small>{r.detail}</small>
            </div>
          ))}
        </div>
      </section>

      <nav className="ob-pager" aria-label="More outposts">
        <Link href="/systems" className="ob-btn ob-btn-ghost">
          <Arrow dir="left" /> Back to the tower
        </Link>
        <Link href={`/systems/${next.slug}`} className="ob-next" style={tint(colorOf(next.slug))}>
          <small>Fly to the next outpost</small>
          <b>
            {next.index} · {next.title} <Arrow />
          </b>
        </Link>
      </nav>
    </article>
  );
}
