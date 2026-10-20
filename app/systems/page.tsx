import type { Metadata } from "next";
import Link from "next/link";
import { SystemArtifact } from "@/components/artifacts";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { systems } from "@/lib/site";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "Production systems: flights, hotels, food, query categorization, semantic search, cabs, and the company-wide OpenObserver log platform.",
};

export default function SystemsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <span className="eyebrow">
              <span className="dot" />
              Systems index · 2025—26
            </span>
            <h1 className="display-1">
              Seven surfaces. <span className="serif">One layer.</span>
            </h1>
            <p className="lede">
              Comparison is a simple promise with a complicated backend. These are the
              systems I built or own at Buyhatke, documented as engineering work rather
              than launch announcements.
            </p>
          </div>

          <div className="page-hero-aside">
            <p>
              <b>Production, not prototypes.</b> Every case study here shipped into a
              live pipeline. The numbers are the ones I can defend.
            </p>
            <p>
              Start with the constraint. That is usually where the interesting decision
              lives.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="systems-index-grid">
            {systems.map((system) => (
              <Link
                className="systems-index-card"
                href={`/systems/${system.slug}`}
                key={system.slug}
              >
                <div className="systems-index-art">
                  <SystemArtifact kind={system.artifact} />
                </div>
                <div className="systems-index-copy">
                  <div className="system-kicker">
                    <span className="index">{system.index}</span>
                    <span>{system.category}</span>
                    <span className="line" />
                    <span>{system.year}</span>
                  </div>
                  <h2>{system.title}</h2>
                  <p>{system.promise}</p>
                  <div className="systems-index-foot">
                    <span>Case study</span>
                    <ArrowUpRight width={12} height={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <Reveal>
            <div className="next-case">
              <div>
                <span>Also in the lab</span>
                <strong>Go enterprise load balancer</strong>
              </div>
              <Link className="text-link" href="/lab">
                Open the lab
                <ArrowRight width={13} height={13} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
