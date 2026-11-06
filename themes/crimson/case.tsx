"use client";

import Link from "next/link";
import { useEffect, useState, type CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNextSystem, systems, type SystemCase } from "@/lib/site";
import { recordingFor } from "./data";
import { Frame, Kick } from "./ui";

export function Case({ s }: { s: SystemCase }) {
  const rec = recordingFor(s.slug);
  const next = getNextSystem(s.slug);
  const pos = systems.findIndex((x) => x.slug === s.slug) + 1;
  const parts = [
    ["problem", "Problem"],
    ["constraints", "Constraints"],
    ["architecture", "Architecture"],
    ["hard", "Hard part"],
    ...(s.broke ? [["broke", "What broke"]] : []),
    ...(s.flaws?.length ? [["flaws", "Flaws"]] : []),
    ["after", "Differently"],
    ["receipts", "Receipts"],
  ] as [string, string][];
  const [on, setOn] = useState(parts[0][0]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setOn(e.target.id.replace("cr-", ""));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    document.querySelectorAll(".cr-case [data-part]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [s.slug]);

  return (
    <article className="cr-page cr-case">
      <header className="cr-poster" data-inv="">
        <span className="cr-poster-n" aria-hidden="true">
          {s.index}
        </span>
        <p className="cr-poster-k" data-rv="">
          <Link href="/systems">Systems</Link> / Case {pos} of {systems.length} · {s.category}
        </p>
        <h1 className="cr-poster-t" data-rv="">
          {s.title}
        </h1>
        <p className="cr-poster-p" data-rv="">
          {s.promise}
        </p>
        <dl className="cr-poster-meta" data-rv="">
          <div>
            <dt>Role</dt>
            <dd>{s.role}</dd>
          </div>
          <div>
            <dt>Years</dt>
            <dd>{s.year}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{s.stack.join(" · ")}</dd>
          </div>
        </dl>
      </header>

      <section className="cr-nums" aria-label="Key numbers">
        {s.metrics.map((m, i) => (
          <div key={m.label} className={`cr-num cr-num-${i % 4}`} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
            <b>{m.value}</b>
            <span>{m.label}</span>
            {m.note && <small>{m.note}</small>}
          </div>
        ))}
      </section>

      <div className="cr-case-body">
        <nav className="cr-case-rail" aria-label="Sections of this case">
          {parts.map(([id, label]) => (
            <a key={id} href={`#cr-${id}`} aria-current={on === id ? "true" : undefined}>
              {label}
            </a>
          ))}
        </nav>

        <div className="cr-case-main">
          <p className="cr-summary" data-rv="">
            {s.summary}
          </p>

          <figure className="cr-case-media" data-rv="">
            {rec ? (
              <>
                <Frame video={rec.video} poster={rec.poster} alt={`Screen recording: ${rec.title}`} />
                <figcaption>
                  <b>Recording</b> {rec.tagline}{" "}
                  <a href={rec.href} target="_blank" rel="noreferrer">
                    Live ↗
                  </a>
                </figcaption>
              </>
            ) : (
              <>
                <div className="cr-artifact">
                  <SystemArtifact kind={s.artifact} />
                </div>
                <figcaption>
                  <b>Diagram</b> {s.title}, drawn as a live panel.
                </figcaption>
              </>
            )}
          </figure>

          <section id="cr-problem" data-part="" className="cr-sec">
            <Kick n="A">The problem</Kick>
            <div className="cr-problem">
              {s.problem.map((p, i) => (
                <p key={i} data-rv="">
                  {p}
                </p>
              ))}
            </div>
          </section>

          <section id="cr-constraints" data-part="" className="cr-sec">
            <Kick n="B">Constraints</Kick>
            <ol className="cr-load">
              {s.constraints.map((c, i) => (
                <li key={i} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  {c}
                </li>
              ))}
            </ol>
          </section>

          <section id="cr-architecture" data-part="" className="cr-sec">
            <Kick n="C">Architecture</Kick>
            <ol className="cr-chain">
              {s.architecture.map((a, i) => (
                <li key={a.label} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
                  <b>{a.label}</b>
                  <span>{a.detail}</span>
                </li>
              ))}
            </ol>
            <ul className="cr-rail-tags">
              {s.rail.map((r) => (
                <li key={r} data-rv="">
                  {r}
                </li>
              ))}
            </ul>
            {rec && (
              <div className="cr-artifact" data-rv="">
                <SystemArtifact kind={s.artifact} />
              </div>
            )}
            {s.pager && (
              <blockquote className="cr-pager" data-rv="">
                {s.pager}
              </blockquote>
            )}
          </section>

          <section id="cr-hard" data-part="" className="cr-sec">
            <Kick n="D">The hard part</Kick>
            <div className="cr-hard">
              {s.hardPart.map((h, i) => (
                <div key={h.title} data-rv="" style={{ "--cr-i": i } as CSSProperties}>
                  <span aria-hidden="true">{i + 1}</span>
                  <h3>{h.title}</h3>
                  <p>{h.body}</p>
                </div>
              ))}
            </div>
          </section>

          {s.broke && (
            <section id="cr-broke" data-part="" className="cr-sec cr-broke" data-inv="">
              <span className="cr-stamp" aria-hidden="true">
                Broke
              </span>
              <Kick n="E">What broke</Kick>
              <h3 data-rv="">{s.broke.title}</h3>
              <p data-rv="">{s.broke.body}</p>
            </section>
          )}

          {s.flaws && s.flaws.length > 0 && (
            <section id="cr-flaws" data-part="" className="cr-sec">
              <Kick n="F">Known flaws</Kick>
              <ul className="cr-flaws">
                {s.flaws.map((f) => (
                  <li key={f.title} data-rv="">
                    <h3>{f.title}</h3>
                    <p>{f.body}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="cr-after" data-part="" className="cr-sec cr-after">
            {s.differently.length > 0 && (
              <div data-rv="">
                <Kick>What I&apos;d do differently</Kick>
                <ul>
                  {s.differently.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            )}
            <div data-rv="">
              <Kick>What it proves</Kick>
              <ul className="cr-proves">
                {s.proves.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          </section>

          <section id="cr-receipts" data-part="" className="cr-sec">
            <Kick n="G">Receipts</Kick>
            <dl className="cr-receipts">
              {s.receipts.map((r) => (
                <div key={r.label} data-rv="">
                  <dt>{r.value}</dt>
                  <dd>
                    <b>{r.label}</b>
                    {r.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <Link href={`/systems/${next.slug}`} className="cr-next" data-inv="" data-rv="">
        <small>
          Next case · {next.index} · {next.category}
        </small>
        <b>{next.title} →</b>
        <span>{next.promise}</span>
      </Link>
    </article>
  );
}
