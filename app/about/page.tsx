import type { Metadata } from "next";
import { ArrowUpRight } from "@/components/icons";
import { HireCard } from "@/components/hire-card";
import { OperatorCard } from "@/components/operator-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading, SectionLabel } from "@/components/section-heading";
import { currently, principles, profile, timeline } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Tushar Gautam is a backend engineer in Bangalore working on comparison systems, low-latency pipelines, and the invisible layer underneath the product.",
};

export default function AboutPage() {
  return (
    <>
      <section className="section-tight" style={{ paddingBottom: 0 }}>
        <div className="wrap hire-wrap">
          <span className="eyebrow" style={{ marginBottom: 18 }}>
            <span className="dot" />
            About · operator manual
          </span>
          <HireCard />
        </div>
      </section>

      <section className="page-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <h1 className="display-1">
              Backend by choice. <span className="serif">Curious by default.</span>
            </h1>
            <p className="lede">
              I like the layer underneath the product: the queue, the quota, the
              pipeline that has to stay correct when half its inputs are late. This is
              the longer version of why.
            </p>
          </div>

          <div className="page-hero-aside">
            <p>
              <b>Bangalore, India.</b> Currently an SDE-1 backend engineer at Buyhatke,
              working on comparison systems for flights, hotels, and food.
            </p>
            <p>{profile.availabilityDetail}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap about-split">
          <Reveal className="about-copy">
            <SectionLabel number="01">The short version</SectionLabel>
            <h2 className="display-2">
              I found the interesting part <span className="serif">underneath.</span>
            </h2>
            <p className="lede">
              I have always liked pulling things apart to see how they hold together.
              Somewhere along the way I realized the software I cared about most was
              the part nobody sees.
            </p>
            <p className="lede">
              At Buyhatke, that became comparison engines: a flight pipeline that fans
              out to seven providers, a hotel graph that resolves the same property
              seven different ways, a food pipeline that knows one kitchen from another,
              a search layer that has to be right on the first query.
            </p>
            <p className="lede">
              The work is mostly constraints. Provider quotas, async polling, partial
              results, cold starts, calibration drift. The product promise is simple, and
              the engineering is what makes it true.
            </p>
            <p className="lede">
              Off the clock: chai, mechanical keyboards, long walks in Bangalore rain,
              and a growing list of systems I want to rebuild from scratch to understand
              properly.
            </p>

            <div className="contact-links">
              <a className="text-link" href={`mailto:${profile.email}`}>
                {profile.email}
                <ArrowUpRight width={11} height={11} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <OperatorCard />
          </Reveal>
        </div>
      </section>

      <section className="section" id="timeline">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="02"
              label="Trace"
              title={
                <>
                  A short <span className="serif">timeline.</span>
                </>
              }
              note="The paths that led to the pipeline."
            />
          </Reveal>

          <div className="about-split">
            <div className="timeline">
              {timeline.map((entry) => (
                <div className="timeline-row" key={`${entry.year}-${entry.title}`}>
                  <div className="timeline-year">{entry.year}</div>
                  <div className="timeline-body">
                    <strong>{entry.title}</strong>
                    <span>{entry.body}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="now-panel">
                <div className="now-head">
                  <span>Currently</span>
                  <span>Updated Oct 2026</span>
                </div>
                {currently.map((item) => (
                  <div className="now-row" key={item.label}>
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="03"
              label="Operating principles"
              title={
                <>
                  How I try to <span className="serif">work.</span>
                </>
              }
              note="Three rules that show up in every system I touch. They are boring on purpose."
            />
          </Reveal>

          <Reveal>
            <div className="principles">
              {principles.map((principle) => (
                <div className="principle" key={principle.num}>
                  <span className="num">{principle.num}</span>
                  <strong>{principle.title}</strong>
                  <p>{principle.body}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
