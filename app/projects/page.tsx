import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, SparkIcon } from "@/components/icons";
import { StackTag } from "@/components/brand";
import { InternalTools } from "@/components/internal-tools";
import { Ledger } from "@/components/ledger";
import { LiveFrame } from "@/components/live-frame";
import { ProjectStage } from "@/components/project-stage";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ChapterHero, Handoff } from "@/components/story";
import { projects, stage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Live side quests: a reverse-engineered flight map, a dream-trailer studio, live train tracking, a vision stylist, a Kubernetes curriculum, and live cricket and football scoreboards.",
};

const rules = [
  {
    n: "01",
    title: "Open the network tab.",
    body: "When the docs stop, the API doesn't. I read the requests, map the contract, and build the thing the docs said was not possible.",
  },
  {
    n: "02",
    title: "Ship the live thing.",
    body: "No mockups, no dead demos. Every project on this page has a URL you can open, break, and judge for yourself.",
  },
  {
    n: "03",
    title: "Make it feel like something.",
    body: "A backend is not an excuse for a boring interface. The systems can be serious. The experience should have a pulse.",
  },
];

export default function ProjectsPage() {
  return (
    <>
      <ChapterHero
        id="garage"
        title={
          <>
            I reverse-engineer APIs <span className="serif">for sport.</span>
          </>
        }
        lede="When the documentation runs out, I open the network tab, take the contract apart, and ship the product on top. Built after hours, deployed in public, and still running."
        aside={
          <>
            <p>
              <b>{projects.length} live projects. Zero mockups.</b> Real maps, real models, real browser APIs.
            </p>
            <p>
              The production work is in <Link href="/systems">chapter 01</Link>. This is where the weird ideas go to
              become real.
            </p>
          </>
        }
      />

      <section className="section-tight">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="03.1"
              label="On stage"
              title={
                <>
                  Recorded live. <span className="serif">Nothing mocked up.</span>
                </>
              }
            />
          </Reveal>
          <Reveal>
            <ProjectStage items={stage} />
          </Reveal>
        </div>
      </section>

      <section className="garage-rules">
        <div className="wrap">
          <div className="garage-rules-grid">
            {rules.map((rule) => (
              <div className="garage-rule" key={rule.n}>
                <span className="num">{rule.n}</span>
                <strong>{rule.title}</strong>
                <p>{rule.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight garage-section" id="live">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="03.2"
              label="The live URLs"
              title={
                <>
                  Open it. <span className="serif">Break it.</span>
                </>
              }
              note="Every project here has a URL you can judge for yourself."
            />
          </Reveal>
          <div className="projects-grid">
            {projects.map((project, index) => {
              return (
                <Reveal
                  className={`project-card ${project.portrait ? "is-portrait" : ""}`}
                  key={project.slug}
                  delay={index > 3 ? 60 : 0}
                >
                  <article id={project.slug}>
                    <LiveFrame url={project.live} poster={project.image} title={project.title} portrait={project.portrait} embed={project.embed !== false} tall={project.tall} />

                    <div className="project-info">
                      <div className="project-kicker">
                        <span className="index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{project.category}</span>
                        <span className="line" />
                        <span>{project.year}</span>
                      </div>

                      <h2>{project.title}</h2>
                      <p className="project-tagline">{project.tagline}</p>
                      <p className="project-desc">{project.description}</p>

                      <div className="project-note">
                        <SparkIcon width={12} height={12} />
                        <span>{project.note}</span>
                      </div>

                      <div className="project-foot">
                        <div className="project-tags">
                          {project.stack.map((tag) => (
                            <StackTag name={tag} key={tag} />
                          ))}
                        </div>
                        <div className="project-links">
                          <span className="project-highlight">
                            {project.highlight}
                          </span>
                          <a href={project.live} target="_blank" rel="noreferrer">
                            Open live
                            <ArrowUpRight width={11} height={11} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section" id="tools">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="03.3"
              label="Dashboards, design system and bots"
              title={<>The tools behind the product.</>}
              note="One design system, and every internal tool runs on it."
            />
          </Reveal>
          <InternalTools />
        </div>
      </section>

      <section className="section" id="ledger">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="03.4"
              label="The workshop"
              title={
                <>
                  Built, shipped, <span className="serif">counted.</span>
                </>
              }
              note="Everything below exists in a repo or a running URL. Counts are authored commits against each repo's total."
            />
          </Reveal>
          <Ledger />
        </div>
      </section>

      <section className="garage-receipts">
        <div className="wrap garage-receipts-grid">
          <div>
            <span className="eyebrow">
              <span className="dot" />
              Reverse-engineering receipt
            </span>
            <h2 className="display-2">
              Docs are a suggestion. <span className="serif">Traffic is truth.</span>
            </h2>
          </div>
          <div className="garage-receipt-copy">
            <p>
              Cabs, flights, food, quick commerce, grocery prices, coupon feeds, and a few APIs that would rather I
              didn&apos;t. I have taken apart undocumented interfaces, reconstructed their contracts, and kept the
              products they power alive when the upstream changed shape overnight.
            </p>
            <p>
              The skill is not breaking things. It is building something that survives the next time the other side
              changes the locks.
            </p>
          </div>
        </div>
      </section>

      <Handoff
        from="garage"
        lead="Building leaves notes behind. The longer ones are the next chapter."
      />
    </>
  );
}
