import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
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
      <section className="page-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <span className="eyebrow">
              <span className="dot" />
              About · operator manual
            </span>
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
              I grew up in Punjab, studied electronics at IIIT Kota, and spent most of
              college pulling things apart to see how they held together. Somewhere
              between signals and systems, I realized the software I cared about most
              was the part nobody sees.
            </p>
            <p className="lede">
              At Buyhatke, that became comparison engines: a flight pipeline that fans
              out to seven providers, a hotel graph that resolves the same property
              seven different ways, a food pipeline with a license key as its identity,
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
              {profile.socials.map((social) => (
                <a
                  className="text-link"
                  href={social.href}
                  key={social.label}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={social.href.startsWith("http") ? "noreferrer" : undefined}
                >
                  {social.label}
                  <ArrowUpRight width={11} height={11} />
                </a>
              ))}
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
              note="The paths that led to the pipeline. Not a resume — the resume is one click away if you want the compressed version."
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

              <div className="lab-footer-note">
                <span>Resume · PDF</span>
                <Link className="text-link" href="/resume">
                  Open resume
                  <ArrowRight width={12} height={12} />
                </Link>
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

      <section className="section-tight">
        <div className="wrap">
          <Link className="next-case" href="/resume">
            <div>
              <span>The compressed version</span>
              <strong>Resume · experience, stack, education</strong>
            </div>
            <ArrowUpRight width={18} height={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
