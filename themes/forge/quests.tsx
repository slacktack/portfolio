"use client";

import Link from "next/link";
import { useState } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, systems, type SystemCase } from "@/lib/site";
import { Arrow, Head, Panel, Pips, Plate, StatTable, Tabs, useSpy } from "./ui";

const rules = (s: SystemCase) => Math.min(5, s.constraints.length);

export function QuestBoard() {
  const [mode, setMode] = useState("board");
  return (
    <div className="fg-page">
      <Panel className="fg-slam" label="Quest board">
        <div className="fg-board-head">
          <Head
            as="h1"
            k={`Quest board · ${systems.length} quests`}
            title="Production systems, taken on and shipped."
            note="Each quest is a real system. Difficulty counts its rules of engagement; rewards are the numbers it runs at."
          />
          <Tabs
            label="Board view"
            active={mode}
            onSelect={setMode}
            items={[
              { id: "board", label: "Board" },
              { id: "ledger", label: "Ledger" },
            ]}
          />
        </div>

        {mode === "board" ? (
          <ol className="fg-quests" role="tabpanel">
            {systems.map((s, i) => (
              <li key={s.slug} className="fg-slam" style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                <Link href={`/systems/${s.slug}`} className="fg-quest fg-spark">
                  <span className="fg-quest-top">
                    <span className="fg-quest-n">{s.index}</span>
                    <span className="fg-quest-type">{s.category}</span>
                  </span>
                  <b className="fg-quest-title">{s.title}</b>
                  <span className="fg-quest-promise">{s.promise}</span>
                  <span className="fg-quest-diff">
                    Difficulty <Pips n={rules(s)} label={`${s.constraints.length} rules of engagement`} />
                  </span>
                  <span className="fg-quest-loot">
                    {s.metrics.slice(0, 2).map((m) => (
                      <span key={m.label}>
                        <b>{m.value}</b>
                        {m.label}
                      </span>
                    ))}
                  </span>
                  <span className="fg-quest-go">
                    Accept <Arrow />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <div className="fg-scroll-x" role="tabpanel">
            <table className="fg-ledger">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Quest</th>
                  <th scope="col">Type</th>
                  <th scope="col">Top reward</th>
                  <th scope="col">Rules</th>
                  <th scope="col">Bosses</th>
                </tr>
              </thead>
              <tbody>
                {systems.map((s) => (
                  <tr key={s.slug}>
                    <td className="fg-ledger-n">{s.index}</td>
                    <td>
                      <Link href={`/systems/${s.slug}`}>{s.title}</Link>
                    </td>
                    <td className="fg-dim">{s.category}</td>
                    <td>
                      <b className="fg-amber">{s.metrics[0]?.value}</b> <span className="fg-dim">{s.metrics[0]?.label}</span>
                    </td>
                    <td>{s.constraints.length}</td>
                    <td>{s.hardPart.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

export function Mission({ system: s }: { system: SystemCase }) {
  const next = getNextSystem(s.slug);
  const sections = [
    { id: "objective", label: "Objective" },
    { id: "map", label: "Map" },
    { id: "boss", label: "Boss fight" },
    ...(s.broke ? [{ id: "defeat", label: "Defeat log" }] : []),
    ...(s.flaws?.length ? [{ id: "bugs", label: "Known bugs" }] : []),
    { id: "loot", label: "Loot" },
  ];
  const active = useSpy(sections.map((x) => x.id));

  return (
    <div className="fg-page fg-mission">
      <Panel className="fg-brief fg-slam" label="Mission briefing">
        <div className="fg-brief-grid">
          <div>
            <span className="fg-k">
              Mission briefing · Quest {s.index} · {s.category}
            </span>
            <h1 className="fg-mega">{s.title}</h1>
            <p className="fg-promise">{s.promise}</p>
            <p className="fg-lede">{s.summary}</p>
          </div>
          <dl className="fg-meta">
            <div>
              <dt>Campaign</dt>
              <dd>{s.year}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{s.role}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>
                <Pips n={rules(s)} label={`${s.constraints.length} rules of engagement`} />
              </dd>
            </div>
            <div>
              <dt>Gear</dt>
              <dd className="fg-chips">
                {s.stack.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </dd>
            </div>
          </dl>
        </div>
        <ul className="fg-reward-strip" aria-label="Rewards">
          {s.metrics.map((m) => (
            <li key={m.label}>
              <b>{m.value}</b>
              <span>{m.label}</span>
              {m.note ? <small>{m.note}</small> : null}
            </li>
          ))}
        </ul>
      </Panel>

      <Tabs label="Briefing sections" sticky active={active} items={sections.map((x) => ({ ...x, href: `#${x.id}` }))} />

      <Panel className="fg-reveal" id="objective" label="Objective">
        <div className="fg-split">
          <div>
            <Head k="01 · Objective" title="What has to be won" />
            <div className="fg-prose">
              {s.problem.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div>
            <Head k="02 · Rules of engagement" title="Constraints" />
            <ol className="fg-rules">
              {s.constraints.map((c, i) => (
                <li key={c}>
                  <span>R{i + 1}</span>
                  {c}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Panel>

      <Panel className="fg-reveal" id="map" label="The map">
        <Head k="03 · The map" title="Architecture, waypoint by waypoint" />
        <ol className="fg-route" style={{ "--fg-cols": s.architecture.length } as React.CSSProperties}>
          {s.architecture.map((a, i) => (
            <li key={a.label}>
              <span className="fg-route-n">{String(i + 1).padStart(2, "0")}</span>
              <b>{a.label}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ol>
        <div className="fg-map-grid">
          <div className="fg-artifact">
            <SystemArtifact kind={s.artifact} />
          </div>
          <div>
            <span className="fg-k">Map notes</span>
            <ul className="fg-rail">
              {s.rail.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            {s.pager ? (
              <blockquote className="fg-transmission">
                <span className="fg-k">Intercepted transmission</span>
                <p>{s.pager}</p>
              </blockquote>
            ) : null}
          </div>
        </div>
      </Panel>

      <Panel className="fg-reveal" id="boss" label="Boss fight">
        <Head k="04 · Boss fight" title="The hard part" />
        <ol className="fg-phases">
          {s.hardPart.map((h, i) => (
            <li key={h.title}>
              <span className="fg-k">Phase {i + 1}</span>
              <b>{h.title}</b>
              <p>{h.body}</p>
            </li>
          ))}
        </ol>
      </Panel>

      {s.broke ? (
        <Panel className="fg-reveal fg-defeat" id="defeat" label="Defeat log">
          <Head k="05 · Defeat log" title="What broke" />
          <div className="fg-log">
            <span className="fg-log-tag">Defeat</span>
            <div>
              <b>{s.broke.title}</b>
              <p>{s.broke.body}</p>
            </div>
          </div>
        </Panel>
      ) : null}

      {s.flaws?.length ? (
        <Panel className="fg-reveal" id="bugs" label="Known bugs">
          <Head k="06 · Known bugs" title="Flaws still in the build" />
          <ul className="fg-bugs">
            {s.flaws.map((f, i) => (
              <li key={f.title}>
                <span className="fg-bug-id">BUG-{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <b>{f.title}</b>
                  <p>{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel className="fg-reveal" id="loot" label="Loot">
        <div className="fg-split">
          <div>
            <Head k="Loot" title="Receipts" />
            <StatTable rows={s.receipts} />
          </div>
          <div className="fg-stack-col">
            {s.differently.length ? (
              <div>
                <span className="fg-k">Next run</span>
                <h3 className="fg-h3">What I would do differently</h3>
                <ul className="fg-rail">
                  {s.differently.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div>
              <span className="fg-k">Skills unlocked</span>
              <div className="fg-chips is-big">
                {s.proves.map((p) => (
                  <span key={p}>{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="fg-next fg-reveal" label="Next quest">
        <div className="fg-next-copy">
          <span className="fg-k">Next quest · {next.index}</span>
          <b className="fg-next-title">{next.title}</b>
          <span className="fg-dim">{next.promise}</span>
        </div>
        <div className="fg-actions">
          <Plate href={`/systems/${next.slug}`}>
            Next quest <Arrow />
          </Plate>
          <Plate href="/systems" tone="ghost">
            Quest board
          </Plate>
        </div>
      </Panel>
    </div>
  );
}
