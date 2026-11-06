import Link from "next/link";
import type { CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { HeroCollage } from "@/components/hero-collage";
import { Journey } from "@/components/journey";
import { ArrowRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { ZineStack } from "@/components/zine-stack";
import { StickerBand } from "@/components/zine-bits";
import { NameField, Who } from "@/components/visitor";
import { chapter } from "@/components/chapters";
import { currently, getSystem, labItems, marqueeMetrics, notes, principles, profile, stage, systems } from "@/lib/site";
import { ThemeTeaser } from "@/components/theme-palette";

const homeSystems = ["flights", "hotels", "best-way-to-pay", "grocery"]
  .map((slug) => getSystem(slug))
  .filter((system): system is NonNullable<typeof system> => Boolean(system));

const garage = ["train-tracker", "flight-tracker", "chauka-cricket"]
  .map((slug) => stage.find((item) => item.slug === slug))
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

const now = (label: string) => currently.find((c) => c.label === label)?.value ?? "";

const asks = [
  { q: "So what do you actually do?", a: profile.description, tone: "red" },
  { q: "What's on the desk right now?", a: `${now("Building")}. ${now("Learning")}.`, tone: "paper" },
  { q: "What won't you ship?", a: `${principles[0].title} ${principles[0].body}`, tone: "blue" },
  { q: "Where does the excitement go?", a: `${principles[1].title} ${principles[1].body}`, tone: "butter" },
  { q: "And the dashboards?", a: `${principles[2].title} ${principles[2].body}`, tone: "paper" },
  { q: "What are you open to?", a: `${now("Open to")}. ${profile.availabilityDetail}.`, tone: "pink" },
];

export default function HomePage() {
  return (
    <>
      <HeroCollage>
        <p className="zc-mast">
          <span>The invisible layer</span>
          <i />
          <span>A zine by {profile.name}</span>
          <i />
          <span>{profile.location}</span>
        </p>

        <form className="zc-hey" action="#journey" role="group" aria-label="Personalise this site">
          <span className="zc-hey-word" aria-hidden="true">
            Hey
          </span>
          <NameField className="zc-name" label="Your name" placeholder="you" hint="Optional. It only lives in this tab." />
          <span className="zc-hey-dash" aria-hidden="true">
            —
          </span>
        </form>

        <h1 className="zc-title">
          <span className="zc-l1">here is the</span>
          <span className="zc-l2">invisible</span>
          <span className="zc-l3">
            <em>layer.</em>
          </span>
        </h1>

        <p className="zc-sub">
          I&apos;m Tushar. I build comparison engines and low-latency pipelines at Buyhatke, the part of the product
          nobody sees until it&apos;s slow. <b>p99 or it didn&apos;t happen.</b>
        </p>

        <div className="zc-actions">
          <a className="zbtn zbtn-ink" href="#journey">
            Follow one request
            <ArrowRight width={14} height={14} />
          </a>
          <a className="zbtn zbtn-line" href="#hello">
            Skip to the signature
          </a>
        </div>
      </HeroCollage>

      <div className="zb-cross" aria-label="Numbers from the work" role="region">
        <StickerBand items={marqueeMetrics} tone="red" tilt={-2.2} />
        <StickerBand
          items={["Node.js", "ClickHouse", "Rust", "Python", "Go", "WebSockets", "MySQL", "Valkey", "Memcached", "Kafka", "LanceDB", "OpenObserve"]}
          tone="blue"
          tilt={1.6}
          reverse
          label="Tools on the bench"
        />
      </div>

      <Journey />

      <section className="zsys" id="systems">
        <div className="wrap">
          <Reveal>
            <header className="zhead zhead-on-blue">
              <span className="zhead-k">
                <b>Chapter 01</b> The systems
              </span>
              <h2>
                <Who fallback="So" suffix="," /> here&apos;s where <em>it goes.</em>
              </h2>
              <p>
                Four of the {systems.length} production systems that request lands in. Open one to go deep: the
                architecture, what broke, and what still hurts.
              </p>
            </header>
          </Reveal>

          <ZineStack words={homeSystems.map((s) => ({ slug: s.slug, word: s.shortTitle, line: s.category }))}>
            {homeSystems.map((system, k) => (
              <article
                className="system-card zcard"
                key={system.slug}
                data-system={system.slug}
                style={{ "--k": k } as CSSProperties}
              >
                <Link className="system-art" href={`/systems/${system.slug}`} aria-label={`Open the ${system.title} case study`}>
                  <SystemArtifact kind={system.artifact} />
                </Link>
                <div className="system-copy">
                  <div className="system-kicker">
                    <span className="index">{String(k + 1).padStart(2, "0")}</span>
                    <span>{system.category}</span>
                    <span className="line" />
                    <span>{system.year}</span>
                  </div>
                  <h3 className="system-title">{system.title}</h3>
                  <p className="system-promise">{system.promise}</p>
                  <div className="system-metrics">
                    {system.metrics.slice(0, 3).map((metric) => (
                      <div className="system-metric" key={metric.label}>
                        <b>{metric.value}</b>
                        <span>{metric.label}</span>
                      </div>
                    ))}
                  </div>
                  <Link className="text-link system-link" href={`/systems/${system.slug}`}>
                    Read the case study
                    <ArrowRight width={13} height={13} />
                  </Link>
                </div>
              </article>
            ))}
          </ZineStack>

          <div className="home-more">
            <Link className="zbtn zbtn-paper" href="/systems">
              All {systems.length} systems
              <ArrowRight width={13} height={13} />
            </Link>
            <Link className="zbtn zbtn-line-paper" href="/systems#scars">
              The scars
            </Link>
          </div>
        </div>
      </section>

      <section className="zask" aria-labelledby="zask-title">
        <div className="wrap">
          <Reveal>
            <header className="zhead">
              <span className="zhead-k">
                <b>Margin notes</b> Straight answers
              </span>
              <h2 id="zask-title">
                Before you ask, <Who fallback="friend" suffix="." />
              </h2>
            </header>
          </Reveal>
          <div className="zask-grid">
            {asks.map((item, i) => (
              <Reveal key={item.q} delay={i * 60}>
                <article className="zask-card" data-tone={item.tone} style={{ "--zr": `${[-1.4, 1, -0.6, 1.3, -1, 0.7][i]}deg` } as CSSProperties}>
                  <span className="zask-n">Q{i + 1}</span>
                  <h3>{item.q}</h3>
                  <p>{item.a}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="ztoc" id="contents" aria-labelledby="ztoc-title">
        <div className="wrap">
          <Reveal>
            <header className="zhead">
              <span className="zhead-k">
                <b>Contents</b> Chapters 02 to 05
              </span>
              <h2 id="ztoc-title">
                Four more chapters. <em>Then hello.</em>
              </h2>
              <p>The home page is the trailer. Each chapter goes deep, and each one hands you to the next.</p>
            </header>
          </Reveal>

          <div className="contents-grid ztoc-grid">
            <Link className="contents-card" href="/lab" data-chapter="bench">
              <ContentsHead id="bench" />
              <ol className="contents-list">
                {labItems.slice(0, 5).map((item, i) => (
                  <li key={item.slug}>
                    <b>02.{i + 1}</b>
                    <span>{item.title}</span>
                    <small>{item.detail}</small>
                  </li>
                ))}
              </ol>
              <ContentsFoot id="bench" />
            </Link>

            <Link className="contents-card" href="/projects" data-chapter="garage">
              <ContentsHead id="garage" />
              <div className="contents-posters">
                {garage.map((item) => (
                  <figure key={item.slug}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.poster} alt="" loading="lazy" />
                    <figcaption>{item.title}</figcaption>
                  </figure>
                ))}
              </div>
              <ContentsFoot id="garage" />
            </Link>

            <Link className="contents-card" href="/notes" data-chapter="notes">
              <ContentsHead id="notes" />
              <ol className="contents-list is-notes">
                {notes.map((note, i) => (
                  <li key={note.slug}>
                    <b>04.{i + 1}</b>
                    <span>{note.title}</span>
                    <small>{note.readTime}</small>
                  </li>
                ))}
              </ol>
              <ContentsFoot id="notes" />
            </Link>

            <Link className="contents-card" href="/about" data-chapter="person">
              <ContentsHead id="person" />
              <dl className="contents-now">
                {currently.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
              <ContentsFoot id="person" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-tight home-teaser">
        <div className="wrap">
          <ThemeTeaser />
        </div>
      </section>
    </>
  );
}

function ContentsHead({ id }: { id: "bench" | "garage" | "notes" | "person" }) {
  const c = chapter(id);
  return (
    <div className="contents-head">
      <span className="contents-n">{c.n}</span>
      <div>
        <strong>{c.name}</strong>
        <p>{c.line}</p>
      </div>
    </div>
  );
}

function ContentsFoot({ id }: { id: "bench" | "garage" | "notes" | "person" }) {
  return (
    <span className="contents-foot">
      Enter chapter {chapter(id).n}
      <ArrowRight width={13} height={13} />
    </span>
  );
}
