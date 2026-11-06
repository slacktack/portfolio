"use client";

import { CopyEmail } from "@/components/copy-email";
import { currently, internalTools, principles, profile, systems, timeline } from "@/lib/site";
import { Arrow, Crest, Head, Panel, Plate, Tabs, useSpy } from "./ui";

const sections = [
  { id: "sheet", label: "Sheet" },
  { id: "campaign", label: "Campaign" },
  { id: "perks", label: "Perks" },
  { id: "workshop", label: "Workshop" },
  { id: "raven", label: "Raven" },
];

export function Sheet() {
  const active = useSpy(sections.map((s) => s.id));
  const skills = Array.from(new Set(systems.flatMap((s) => s.proves))).slice(0, 14);

  return (
    <div className="fg-page">
      <Panel className="fg-slam fg-sheet" id="sheet" label="Character sheet">
        <div className="fg-sheet-grid">
          <Crest size={150} ribbon="SDE-1" />
          <div>
            <span className="fg-k">Character sheet</span>
            <h1 className="fg-mega">{profile.name}</h1>
            <p className="fg-promise">{profile.tagline}</p>
            <p className="fg-lede">{profile.description}</p>
          </div>
          <dl className="fg-meta">
            <div>
              <dt>Class</dt>
              <dd>{profile.role}</dd>
            </div>
            <div>
              <dt>Guild</dt>
              <dd>Buyhatke · SDE-1</dd>
            </div>
            <div>
              <dt>Base</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Seeking</dt>
              <dd>{profile.availabilityDetail}</dd>
            </div>
          </dl>
        </div>
        <div className="fg-split is-tight">
          <div>
            <span className="fg-k">Active objectives</span>
            <table className="fg-table">
              <tbody>
                {currently.map((c) => (
                  <tr key={c.label}>
                    <th scope="row">{c.label}</th>
                    <td className="fg-table-v is-text">{c.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <span className="fg-k">Skills, earned on quests</span>
            <div className="fg-chips is-big">
              {skills.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      <Tabs label="Sheet sections" sticky active={active} items={sections.map((s) => ({ ...s, href: `#${s.id}` }))} />

      <Panel className="fg-reveal" id="campaign" label="Campaign history">
        <Head k="Campaign history" title="The road so far" />
        <ol className="fg-campaign">
          {timeline.map((t, i) => (
            <li key={t.title}>
              <span className="fg-campaign-ch">Chapter {i + 1}</span>
              <span className="fg-campaign-y">{t.year}</span>
              <b>{t.title}</b>
              <p>{t.body}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel className="fg-reveal" id="perks" label="Perks">
        <Head k="Perks" title="Principles, always equipped" />
        <ol className="fg-perks">
          {principles.map((p) => (
            <li key={p.num}>
              <span className="fg-perk-badge" aria-hidden="true">
                {p.num}
              </span>
              <b>{p.title}</b>
              <p>{p.body}</p>
            </li>
          ))}
        </ol>
      </Panel>

      <Panel className="fg-reveal" id="workshop" label="Guild workshop">
        <Head k="Guild workshop" title="Internal tools, built for the team" note="Not public, so no recordings. What they are and what they do." />
        <ul className="fg-phases is-three">
          {internalTools.map((t) => (
            <li key={t.name}>
              <span className="fg-k">{t.kind}</span>
              <b>{t.name}</b>
              <p>{t.line}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel className="fg-reveal fg-raven" id="raven" label="Send a raven">
        <div>
          <span className="fg-k">Send a raven</span>
          <h2 className="fg-mega is-mid">Open to hard problems.</h2>
          <p className="fg-lede">{profile.availabilityDetail}. Email goes straight to me.</p>
        </div>
        <div className="fg-raven-mail">
          <span className="fg-raven-addr">{profile.email}</span>
          <div className="fg-actions">
            <Plate href={`mailto:${profile.email}`}>
              Send a raven <Arrow />
            </Plate>
            <CopyEmail email={profile.email} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
