"use client";

import Link from "next/link";
import Image from "next/image";
import { currently, labItems, marqueeMetrics, notes, profile, stage, systems } from "@/lib/site";
import { Arrow, Crest, Panel, Plate, Tabs, split } from "./ui";
import { ThemeTeaser } from "@/components/theme-palette";

const headline = ["478K+ requests/day", "3.79M+ result events/day", "28K+ hotel compares/day", "700K carts priced/day", "p99 20ms", "1.18M labeled examples"]
  .filter((m) => marqueeMetrics.includes(m))
  .map(split);

export function Lobby() {
  const first = systems[0];
  const poster = stage.find((s) => s.slug === "bh-flights")?.poster;
  const modes = [
    { href: "/systems", k: "Quests", n: systems.length, d: "Production systems" },
    { href: "/projects", k: "Loadout", n: stage.length, d: "Builds with recordings" },
    { href: "/lab", k: "Training", n: labItems.length, d: "Interactive demos" },
    { href: "/notes", k: "Codex", n: notes.length, d: "Field notes" },
  ];

  return (
    <div className="fg-lobby">
      <Panel className="fg-card fg-slam" label="Character card">
        <Tabs
          label="Lobby"
          active="profile"
          items={[
            { id: "profile", label: "Profile", href: "/" },
            { id: "quests", label: "Quests", href: "/systems" },
            { id: "loadout", label: "Loadout", href: "/projects" },
            { id: "sheet", label: "Sheet", href: "/about" },
          ]}
        />
        <div className="fg-card-body">
          <Crest size={132} ribbon="SDE-1" />
          <div className="fg-card-id">
            <span className="fg-k">Player one</span>
            <h1 className="fg-name">{profile.name}</h1>
            <p className="fg-tagline">{profile.tagline}</p>
          </div>
        </div>
        <dl className="fg-attrs">
          <div>
            <dt>Class</dt>
            <dd>{profile.role}</dd>
          </div>
          <div>
            <dt>Guild</dt>
            <dd>Buyhatke</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>SDE-1</dd>
          </div>
          <div>
            <dt>Base</dt>
            <dd>{profile.location}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd className="fg-live">
              <i aria-hidden="true" />
              {profile.availability}
            </dd>
          </div>
        </dl>
        <p className="fg-card-desc">{profile.description}</p>
        <div className="fg-actions">
          <Plate href={`/systems/${first.slug}`}>
            Continue <Arrow />
          </Plate>
          <Plate href="/about" tone="ghost">
            Character sheet
          </Plate>
        </div>
      </Panel>

      <div className="fg-lobby-side">
        <Panel className="fg-slam fg-d1" label="Headline stats">
          <div className="fg-panel-head">
            <span className="fg-k">Headline stats</span>
            <span className="fg-dim">From production</span>
          </div>
          <ul className="fg-statgrid">
            {headline.map((m) => (
              <li key={m.label}>
                <b>{m.value}</b>
                <span>{m.label}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="fg-continue fg-slam fg-d2" label="Continue">
          <Link href={`/systems/${first.slug}`} className="fg-continue-art fg-spark" aria-label={`Continue: quest ${first.index}, ${first.title}`}>
            {poster ? <Image src={poster} alt="" fill sizes="(max-width: 900px) 100vw, 420px" /> : null}
            <span className="fg-continue-tag">Quest {first.index}</span>
          </Link>
          <div className="fg-continue-body">
            <span className="fg-k">Continue</span>
            <h2 className="fg-continue-title">{first.title}</h2>
            <p>{first.promise}</p>
            <ul className="fg-rewards">
              {first.metrics.slice(0, 2).map((m) => (
                <li key={m.label}>
                  <b>{m.value}</b> {m.label}
                </li>
              ))}
            </ul>
            <ol className="fg-queue" aria-label="Up next">
              {systems.slice(1, 4).map((s) => (
                <li key={s.slug}>
                  <Link href={`/systems/${s.slug}`}>
                    <span>{s.index}</span>
                    {s.title}
                    <Arrow />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </Panel>
      </div>

      <nav className="fg-modes" aria-label="Game modes">
        {modes.map((m, i) => (
          <Link key={m.href} href={m.href} className={`fg-mode fg-spark fg-slam fg-d${i + 2}`}>
            <span className="fg-mode-n">{String(m.n).padStart(2, "0")}</span>
            <b>{m.k}</b>
            <small>{m.d}</small>
            <Arrow />
          </Link>
        ))}
      </nav>

      <Panel className="fg-objectives fg-slam fg-d4" label="Active objectives">
        <div className="fg-panel-head">
          <span className="fg-k">Active objectives</span>
        </div>
        <ul>
          {currently.map((c) => (
            <li key={c.label}>
              <span>{c.label}</span>
              <b>{c.value}</b>
            </li>
          ))}
        </ul>
      </Panel>
      <div className="fg-teaser fg-slam">
        <ThemeTeaser />
      </div>
    </div>
  );
}
