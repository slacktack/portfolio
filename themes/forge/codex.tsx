"use client";

import Link from "next/link";
import { getNextNote, notes, type Note } from "@/lib/site";
import { Arrow, Head, Panel, Plate, Tabs, useSpy } from "./ui";

const anchor = (h: string) => h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Codex() {
  return (
    <div className="fg-page">
      <Panel className="fg-slam" label="Codex">
        <Head
          as="h1"
          k={`Codex · ${notes.length} entries`}
          title="Lore from the hot path."
          note="Field notes on low-latency systems: what was measured, what was refused, and why."
        />
        <ol className="fg-codex">
          {notes.map((n, i) => (
            <li key={n.slug} className="fg-slam" style={{ animationDelay: `${i * 70}ms` }}>
              <Link href={`/notes/${n.slug}`} className="fg-entry fg-spark">
                <span className="fg-entry-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="fg-entry-body">
                  <span className="fg-k">
                    {n.category} · {n.date} · {n.readTime}
                  </span>
                  <b>{n.title}</b>
                  <span className="fg-dim">{n.dek}</span>
                </span>
                <span className="fg-entry-go">
                  Read <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}

export function Entry({ note }: { note: Note }) {
  const next = getNextNote(note.slug);
  const idx = notes.findIndex((n) => n.slug === note.slug);
  const heads = note.sections.filter((s) => s.heading).map((s) => ({ id: anchor(s.heading as string), label: s.heading as string }));
  const active = useSpy(heads.map((h) => h.id));

  return (
    <div className="fg-page fg-entry-page">
      <Panel className="fg-slam" label="Codex entry">
        <span className="fg-k">
          Codex entry {String(idx + 1).padStart(2, "0")} · {note.category} · {note.date} · {note.readTime}
        </span>
        <h1 className="fg-mega is-note">{note.title}</h1>
        <p className="fg-promise">{note.dek}</p>
      </Panel>

      {heads.length > 1 ? <Tabs label="Chapters" sticky active={active} items={heads.map((h) => ({ ...h, href: `#${h.id}` }))} /> : null}

      <Panel className="fg-reveal" label="Entry">
        <article className="fg-article">
          {note.sections.map((s, i) => (
            <section key={i} id={s.heading ? anchor(s.heading) : undefined}>
              {s.heading ? <h2>{s.heading}</h2> : null}
              {s.body.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
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
              {s.quote ? <blockquote>{s.quote}</blockquote> : null}
            </section>
          ))}
        </article>
      </Panel>

      <Panel className="fg-next fg-reveal" label="Next entry">
        <div className="fg-next-copy">
          <span className="fg-k">Next entry</span>
          <b className="fg-next-title">{next.title}</b>
          <span className="fg-dim">{next.dek}</span>
        </div>
        <div className="fg-actions">
          <Plate href={`/notes/${next.slug}`}>
            Read next <Arrow />
          </Plate>
          <Plate href="/notes" tone="ghost">
            Codex
          </Plate>
        </div>
      </Panel>
    </div>
  );
}
