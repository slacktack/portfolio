"use client";

import Link from "next/link";
import { useState } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, systems, type SystemCase } from "@/lib/site";
import { Arrow, Art, css, Duo, posterFor, Shot, tc, Wide } from "./ui";

function Still({ s, i, big }: { s: SystemCase; i: number; big?: boolean }) {
  const poster = posterFor(s.slug);
  if (poster) return <Duo src={poster} alt={`${s.title}, screen recording still`} tone={i % 2 ? "flare" : "cyan"} />;
  if (big)
    return (
      <span className="ab-still-art">
        <Art seed={i + 3} />
        <span className="ab-artbox">
          <SystemArtifact kind={s.artifact} />
        </span>
      </span>
    );
  return <Art seed={i + 3} />;
}

export function SceneSelect() {
  const [f, setF] = useState(0);
  const s = systems[f];
  return (
    <div className="ab-menu">
      <header className="ab-menu-head" data-ab="">
        <span className="ab-kicker">
          <b>Chapter 02</b> Scene selection
        </span>
        <Wide text="Scenes" as="h1" className="ab-title ab-title-lg" />
        <nav className="ab-menu-opts" aria-label="Disc menu">
          <Link href="/">Main menu</Link>
          <Link href={`/systems/${systems[0].slug}`}>Play all</Link>
          <span aria-current="page">Scene selection</span>
          <Link href="/lab">Special features</Link>
        </nav>
      </header>

      <div className="ab-menu-body">
        <aside className="ab-preview" aria-live="polite">
          <div className="ab-preview-frame" key={s.slug} data-cursor="Play">
            <Still s={s} i={f} big />
            <span className="ab-corners" aria-hidden="true" />
            <span className="ab-preview-tc">
              <i /> Scene {s.index} · {tc((f / systems.length) * 160 + 72)}
            </span>
          </div>
          <div className="ab-preview-copy" key={`c-${s.slug}`}>
            <span className="ab-kicker">
              <b>Scene {s.index}</b> {s.category} · {s.year}
            </span>
            <Wide text={s.shortTitle} as="h2" className="ab-title ab-title-sm" />
            <p>{s.promise}</p>
            <dl className="ab-preview-m">
              {s.metrics.slice(0, 3).map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/systems/${s.slug}`} className="ab-trailer ab-trailer-sm">
              <span className="ab-trailer-disc">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M8 5l11 7-11 7z" fill="currentColor" />
                </svg>
              </span>
              <span>Play scene {s.index}</span>
            </Link>
          </div>
        </aside>

        <ol className="ab-chapters">
          {systems.map((x, i) => (
            <li key={x.slug} style={css({ "--ab-i": i })} data-ab="">
              <Link href={`/systems/${x.slug}`} className="ab-chap" aria-current={i === f ? "true" : undefined} onMouseEnter={() => setF(i)} onFocus={() => setF(i)} data-cursor="Play">
                <span className="ab-chap-thumb">
                  <Still s={x} i={i} />
                  <em>{x.index}</em>
                </span>
                <span className="ab-chap-t">{x.shortTitle}</span>
                <span className="ab-chap-m">
                  {x.metrics[0].value} <small>{x.metrics[0].label}</small>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Cue({ k, children }: { k: number; children: string }) {
  const a = 60 + k * 7;
  return (
    <span className="ab-cue">
      {tc(a)} → {tc(a + 5)}
      <b>{children}</b>
    </span>
  );
}

export function CaseStudy({ s }: { s: SystemCase }) {
  const next = getNextSystem(s.slug);
  const i = systems.findIndex((x) => x.slug === s.slug);
  const poster = posterFor(s.slug);
  const outtakes = [...(s.broke ? [{ ...s.broke, k: "The take that broke" }] : []), ...(s.flaws ?? []).map((f) => ({ ...f, k: "Left in the cut" }))];
  const credits: [string, string][] = [
    ["A system by", "Tushar Gautam"],
    ["Role", s.role],
    ["Running", s.year],
    ["Genre", s.category],
    ...s.receipts.map((r) => [r.label, `${r.value} · ${r.detail}`] as [string, string]),
    ...s.stack.map((t, k) => [k === 0 ? "Featuring" : "", t] as [string, string]),
    ...s.proves.map((p, k) => [k === 0 ? "Proves" : "", p] as [string, string]),
  ];

  return (
    <article className="ab-case">
      <section className="ab-open" data-shot="01 · Title card">
        <div className="ab-open-bg">{poster ? <Duo src={poster} alt="" tone="cyan" /> : <Art seed={i + 3} />}</div>
        <div className="ab-open-copy" data-ab="">
          <span className="ab-kicker">
            <b>Scene {s.index}</b> {s.category}
          </span>
          <Wide text={s.shortTitle} as="h1" className="ab-title" />
          <p className="ab-logline">{s.promise}</p>
          <p className="ab-sub">{s.summary}</p>
        </div>
        <dl className="ab-open-m" data-ab="">
          {s.metrics.map((m, k) => (
            <div key={m.label} style={css({ "--ab-i": k })}>
              <dd>{m.value}</dd>
              <dt>{m.label}</dt>
              {m.note ? <small>{m.note}</small> : null}
            </div>
          ))}
        </dl>
      </section>

      <Shot n="02" label="The problem">
        <div className="ab-subs" data-ab="">
          {s.problem.map((p, k) => (
            <p key={k} className="ab-subline" style={css({ "--ab-i": k })}>
              <span className="ab-subline-who">[Narrator]</span>
              <span className="ab-subtext">{p}</span>
            </p>
          ))}
        </div>
      </Shot>

      <Shot n="03" label="Constraints">
        <h2 className="ab-h">
          <Wide text="The rules of the set" />
        </h2>
        <ol className="ab-cues">
          {s.constraints.map((c, k) => (
            <li key={k} data-ab="" style={css({ "--ab-i": k })}>
              <Cue k={k}>{c}</Cue>
            </li>
          ))}
        </ol>
      </Shot>

      <Shot n="04" label="Architecture" className="ab-shot-arch">
        <h2 className="ab-h">
          <Wide text="The schematic" />
        </h2>
        <ol className="ab-schema" data-ab="" style={css({ "--ab-cols": s.architecture.length })}>
          {s.architecture.map((a, k) => (
            <li key={a.label} style={css({ "--ab-i": k })}>
              <em>{String(k + 1).padStart(2, "0")}</em>
              <b>{a.label}</b>
              <span>{a.detail}</span>
            </li>
          ))}
        </ol>
        <div className="ab-arch-split">
          <div className="ab-artbox ab-artbox-lg" data-ab="">
            <SystemArtifact kind={s.artifact} />
          </div>
          <ul className="ab-rail" data-ab="">
            {s.rail.map((r, k) => (
              <li key={r} style={css({ "--ab-i": k })}>
                {r}
              </li>
            ))}
          </ul>
        </div>
      </Shot>

      <Shot n="05" label="The climax" className="ab-shot-climax">
        <h2 className="ab-h ab-h-flare">
          <Wide text="The hard part" />
        </h2>
        {s.pager ? (
          <blockquote className="ab-pager" data-ab="">
            {s.pager}
          </blockquote>
        ) : null}
        <ol className="ab-beats">
          {s.hardPart.map((h, k) => (
            <li key={h.title} data-ab="" style={css({ "--ab-i": k })}>
              <em>Beat {k + 1}</em>
              <b>{h.title}</b>
              <p>{h.body}</p>
            </li>
          ))}
        </ol>
      </Shot>

      {outtakes.length || s.differently.length ? (
        <Shot n="06" label="Outtakes and the director's cut">
          <div className="ab-cuts2">
            {outtakes.length ? (
              <div>
                <h2 className="ab-h">
                  <Wide text="Outtakes" />
                </h2>
                <ul className="ab-outtakes">
                  {outtakes.map((o, k) => (
                    <li key={o.title} data-ab="" style={css({ "--ab-i": k })}>
                      <em>{o.k}</em>
                      <b>{o.title}</b>
                      <p>{o.body}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {s.differently.length ? (
              <div>
                <h2 className="ab-h">
                  <Wide text="Director's cut" />
                </h2>
                <ul className="ab-dcut">
                  {s.differently.map((d, k) => (
                    <li key={k} data-ab="" style={css({ "--ab-i": k })}>
                      <em>Next time</em>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Shot>
      ) : null}

      <Shot n={outtakes.length || s.differently.length ? "07" : "06"} label="End credits" className="ab-shot-credits">
        <div className="ab-roll" data-ab="">
          <div className="ab-roll-in">
            <Wide text={s.title} className="ab-roll-title" />
            <dl>
              {credits.map(([k, v], n) => (
                <div key={n}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="ab-receipts">
          {s.receipts.map((r, k) => (
            <div key={r.label} data-ab="" style={css({ "--ab-i": k })}>
              <b>{r.value}</b>
              <span>{r.label}</span>
              <small>{r.detail}</small>
            </div>
          ))}
        </div>
        <Link href={`/systems/${next.slug}`} className="ab-nextscene" data-ab="" data-cursor="Play">
          <span className="ab-kicker">
            <b>Up next · Scene {next.index}</b> {next.category}
          </span>
          <Wide text={next.shortTitle} className="ab-title ab-title-sm" />
          <span className="ab-watch">
            Play next scene <Arrow />
          </span>
        </Link>
      </Shot>
    </article>
  );
}
