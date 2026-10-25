import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StackTag } from "@/components/brand";
import { SystemArtifact } from "@/components/artifacts";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { ImmersiveHero } from "@/components/scene3d";
import { getNextSystem, getSystem, systems } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return systems.map((system) => ({ slug: system.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system) return { title: "System not found" };
  return {
    title: system.title,
    description: system.summary,
    openGraph: {
      title: `${system.title} — Tushar Gautam`,
      description: system.summary,
    },
  };
}

const immersive: Record<string, { k: string; t: string; d: string }[]> = {
  flights: [
    { k: "Departing", t: "One search, leaving now.", d: "BLR to GOI. The request is on its way to seven providers at once." },
    { k: "Closing in", t: "Seven answers, one deadline.", d: "Every provider replies on its own clock. The best fare is whichever lands under the deadline." },
    { k: "Arrived", t: "One price, before they look away.", d: "Partial results are kept, stragglers are settled, and the list is already sorted." },
  ],
  hotels: [
    { k: "At the door", t: "Seven records, one hotel.", d: "Seven catalogs, seven names for the same property, and a wrong merge is worse than a missing one." },
    { k: "The lobby", t: "Resolved to one identity.", d: "The hotel is matched to a single canonical record before any price is asked for." },
    { k: "The room", t: "Then the price, live.", d: "Prices are fetched in real time for these dates and these guests. Identity is stored. Price never is." },
  ],
};

const toc = [
  { id: "problem", label: "Problem" },
  { id: "constraints", label: "Constraints" },
  { id: "architecture", label: "Architecture" },
  { id: "hard-part", label: "The hard part" },
  { id: "broke", label: "What broke" },
  { id: "flaws", label: "What still hurts" },
  { id: "differently", label: "Differently" },
  { id: "proves", label: "What it proves" },
  { id: "receipts", label: "Receipts" },
];

export default async function SystemCasePage({ params }: PageProps) {
  const { slug } = await params;
  const system = getSystem(slug);
  if (!system) notFound();

  const next = getNextSystem(slug);

  return (
    <>
      <section className="case-hero" data-system={system.slug}>
        <div className="wrap">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/systems">Systems</Link>
            <span>/</span>
            <span>{system.shortTitle}</span>
          </div>

          <div className="case-hero-top">
            <span className="eyebrow">
              <span className="dot" />
              Case {system.index} · {system.category}
            </span>
            <span className="tag">{system.year}</span>
          </div>

          <h1 className="display-1 case-title">{system.title}</h1>
          <p className="case-promise">{system.promise}</p>

          <div className="case-meta">
            <span>
              Role
              <b>{system.role}</b>
            </span>
            <span>
              Scope
              <b>
                {system.artifact === "cabs"
                  ? "0 → 1 system"
                  : system.artifact === "observability"
                    ? "Company-wide log platform"
                    : "Production pipeline"}
              </b>
            </span>
            <span>
              Stack
              <b>{system.stack.slice(0, 3).join(" · ")}</b>
            </span>
          </div>
        </div>
      </section>

      {immersive[system.slug] ? <ImmersiveHero kind={system.slug as "flights" | "hotels"} chapters={immersive[system.slug]} /> : null}

      <div className="wrap">
        {immersive[system.slug] ? null : (
          <div className="case-artifact">
            <SystemArtifact kind={system.artifact} />
          </div>
        )}

        <div className="case-metrics">
          {system.metrics.map((metric) => (
            <div className="case-metric" key={metric.label}>
              <b>{metric.value}</b>
              <span>{metric.label}</span>
              {metric.note ? <small>{metric.note}</small> : null}
            </div>
          ))}
        </div>

        <div className="case-layout">
          <aside className="case-side">
            <div>
              <h2>On this page</h2>
              <nav className="case-toc" aria-label="Case study sections">
                {toc
                  .filter((item) => (item.id === "broke" ? Boolean(system.broke) : item.id === "flaws" ? Boolean(system.flaws?.length) : item.id === "differently" ? system.differently.length > 0 : true))
                  .map((item) => (
                  <a href={`#${item.id}`} key={item.id}>
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div>
              <h2>Stack</h2>
              <div className="case-stack">
                {system.stack.map((tag) => (
                  <StackTag name={tag} key={tag} />
                ))}
              </div>
            </div>

            <div>
              <h2>Read next</h2>
              <Link className="text-link" href={`/systems/${next.slug}`}>
                {next.shortTitle}
                <ArrowRight width={12} height={12} />
              </Link>
            </div>
          </aside>

          <div className="case-body">
            <Reveal>
              <section className="case-section" id="problem">
                <div className="case-section-label">
                  <span className="num">01</span>
                  <span className="line" />
                  <span>The problem</span>
                </div>
                <h2>{system.summary}</h2>
                <div className="case-prose">
                  {system.problem.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="case-section" id="constraints">
                <div className="case-section-label">
                  <span className="num">02</span>
                  <span className="line" />
                  <span>Constraints</span>
                </div>
                <h2>What the system had to respect.</h2>
                <ul className="case-list">
                  {system.constraints.map((constraint) => (
                    <li key={constraint}>{constraint}</li>
                  ))}
                </ul>
              </section>
            </Reveal>

            <Reveal>
              <section className="case-section" id="architecture">
                <div className="case-section-label">
                  <span className="num">03</span>
                  <span className="line" />
                  <span>Architecture</span>
                </div>
                <h2>The shape of the pipeline.</h2>
                <div className="arch">
                  <div
                    className="arch-nodes"
                    style={{ "--cols": system.architecture.length } as React.CSSProperties}
                  >
                    {system.architecture.map((node) => (
                      <div className="arch-node" key={node.label}>
                        <b>{node.label}</b>
                        <span>{node.detail}</span>
                      </div>
                    ))}
                  </div>
                  <div className="arch-rail">
                    {system.rail.map((rail) => (
                      <span className="tag" key={rail}>
                        {rail}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="case-section" id="hard-part">
                <div className="case-section-label">
                  <span className="num">04</span>
                  <span className="line" />
                  <span>The hard part</span>
                </div>
                <h2>Where the design actually lives.</h2>
                <div className="hard-grid">
                  {system.hardPart.map((item) => (
                    <div className="hard-card" key={item.title}>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>

            {system.broke ? (
            <Reveal>
              <section className="case-section" id="broke">
                <div className="case-section-label">
                  <span className="num">05</span>
                  <span className="line" />
                  <span>What broke</span>
                </div>
                <h2>The version that taught me the most.</h2>
                <div className="broke-card">
                  <span className="tag">Postmortem</span>
                  <strong>{system.broke.title}</strong>
                  <p>{system.broke.body}</p>
                </div>
              </section>
            </Reveal>
            ) : null}

            {system.flaws?.length ? (
            <Reveal>
              <section className="case-section" id="flaws">
                <div className="case-section-label">
                  <span className="num">06</span>
                  <span className="line" />
                  <span>What still hurts</span>
                </div>
                <h2>The parts I would not defend yet.</h2>
                <div className="flaw-grid">
                  {system.flaws.map((flaw) => (
                    <div className="flaw-card" key={flaw.title}>
                      <strong>{flaw.title}</strong>
                      <p>{flaw.body}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
            ) : null}

            {system.differently.length ? (
            <Reveal>
              <section className="case-section" id="differently">
                <div className="case-section-label">
                  <span className="num">07</span>
                  <span className="line" />
                  <span>Differently</span>
                </div>
                <h2>What I would change on the next pass.</h2>
                <ul className="case-list">
                  {system.differently.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            </Reveal>
            ) : null}

            <Reveal>
              <section className="case-section" id="proves">
                <div className="case-section-label">
                  <span className="num">08</span>
                  <span className="line" />
                  <span>What it proves</span>
                </div>
                <h2>The capabilities behind the outcome.</h2>
                <div className="proves-grid">
                  {system.proves.map((item) => (
                    <span className="tag tag-accent" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </section>
            </Reveal>

            <Reveal>
              <section className="case-section" id="receipts">
                <div className="case-section-label">
                  <span className="num">09</span>
                  <span className="line" />
                  <span>Receipts</span>
                </div>
                <h2>The numbers, in public.</h2>
                <div className="case-receipts">
                  {system.receipts.map((receipt) => (
                    <div className="case-receipt" key={receipt.label}>
                      <div className="receipt-head">
                        <span>{receipt.label}</span>
                        <b>PROD</b>
                      </div>
                      <b>{receipt.value}</b>
                      <span>{receipt.detail}</span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          </div>
        </div>

        <Link className="next-case" href={`/systems/${next.slug}`}>
          <div>
            <span>Next case · {next.index}</span>
            <strong>{next.title}</strong>
          </div>
          <ArrowUpRight width={18} height={18} />
        </Link>
      </div>
    </>
  );
}
