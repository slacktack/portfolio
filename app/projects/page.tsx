import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, SparkIcon } from "@/components/icons";
import { StackTag } from "@/components/brand";
import { Ledger } from "@/components/ledger";
import { ProjectStage } from "@/components/project-stage";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { projects, stage } from "@/lib/site";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Live side quests: a reverse-engineered flight map, a dream-trailer studio, live train tracking, a vision stylist, and a Kubernetes curriculum.",
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
      <section className="page-hero garage-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <span className="eyebrow">
              <span className="dot" />
              The garage · Live URLs and the workshop
            </span>
            <h1 className="display-1 garage-title">
              I reverse-engineer APIs <span className="serif">for sport.</span>
            </h1>
            <p className="lede">
              When the documentation runs out, I open the network tab, take the
              contract apart, and ship the product on top. These are the side quests:
              built after hours, deployed in public, and still running.
            </p>
          </div>

          <div className="page-hero-aside">
            <p>
              <b>{projects.length} live projects. Zero mockups.</b> Real maps, real
              models, real browser APIs. If it looks impossible from the outside, that
              is usually where I start.
            </p>
            <p>
              Production work lives in <Link href="/systems">systems</Link>. This is
              where the weird ideas go to become real.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
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

      <section className="section-tight garage-section">
        <div className="wrap">
          <div className="projects-grid">
            {projects.map((project, index) => {
              const host = new URL(project.live).host.replace(/^www\./, "");
              return (
                <Reveal
                  className={`project-card ${project.portrait ? "is-portrait" : ""}`}
                  key={project.slug}
                  delay={index > 3 ? 60 : 0}
                >
                  <article id={project.slug}>
                    <a
                      className="project-shot"
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${project.title} live`}
                    >
                      <span className="project-browser">
                        <span className="project-dots" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="project-url">{host}</span>
                        <span className="project-live">
                          <span className="dot" />
                          Live
                        </span>
                      </span>
                      <span className="project-image">
                        <Image
                          src={project.image}
                          alt={`${project.title} running live`}
                          width={project.portrait ? 430 : 1440}
                          height={project.portrait ? 900 : 1000}
                          sizes="(max-width: 680px) 100vw, (max-width: 1080px) 50vw, 40vw"
                        />
                      </span>
                      <span className="project-open">
                        Open live
                        <ArrowUpRight width={12} height={12} />
                      </span>
                    </a>

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
                          <a href={project.repo} target="_blank" rel="noreferrer">
                            GitHub
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

      <section className="section" id="ledger">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="02"
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
              Cabs, flights, food, quick commerce, grocery prices, coupon feeds, and a
              few APIs that would rather I didn&apos;t. I have taken apart undocumented
              interfaces, reconstructed their contracts, and kept the products they
              power alive when the upstream changed shape overnight.
            </p>
            <p>
              The skill is not breaking things. It is building something that survives
              the next time the other side changes the locks.
            </p>
            <div className="garage-receipt-actions">
              <Link className="btn btn-primary" href="/systems">
                See the production work
                <ArrowRight width={14} height={14} />
              </Link>
              <a
                className="text-link"
                href="https://github.com/slacktack?tab=repositories"
                target="_blank"
                rel="noreferrer"
              >
                All repositories
                <ArrowUpRight width={12} height={12} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
