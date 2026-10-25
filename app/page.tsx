import Link from "next/link";
import type { CSSProperties } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { LogoWall } from "@/components/brand";
import { HeroCollage } from "@/components/hero-collage";
import { Journey } from "@/components/journey";
import { Split } from "@/components/hero-title";
import { Works } from "@/components/works";
import { ArrowRight, MailIcon } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { SystemsStack } from "@/components/systems-stack";
import { getSystem, profile, stage, systems } from "@/lib/site";
const homeSystems = ["flights", "hotels", "best-way-to-pay", "grocery"]
  .map((slug) => getSystem(slug))
  .filter((system): system is NonNullable<typeof system> => Boolean(system));

const homeStage = ["bh-flights", "bh-hotels", "bh-food", "bh-grocery", "train-tracker", "flight-tracker"]
  .map((slug) => stage.find((item) => item.slug === slug))
  .filter((item): item is NonNullable<typeof item> => Boolean(item));

const payFlaws = getSystem("best-way-to-pay")?.flaws ?? [];
const hotelPager = getSystem("hotels")?.pager;
const scars = [
  ...payFlaws.slice(0, 3).map((f) => ({ slug: "best-way-to-pay", anchor: "flaws", label: "Best way to pay", title: f.title, body: f.body })),
  ...(hotelPager
    ? [{ slug: "hotels", anchor: "hard-part", label: "Hotel comparison", title: "The worst compare took four and a half minutes", body: hotelPager }]
    : []),
];

export default function HomePage() {
  return (
    <>
      <HeroCollage>
        <p className="skyx-byline">
          <span>Tushar Gautam, backend engineer in Bangalore</span>
        </p>

        <h1 className="skyx-title" aria-label="The invisible layer. P99 or it didn't happen.">
          <span className="hl">
            <Split text="The invisible" />
          </span>
          <span className="hl">
            <span className="skyx-shot" aria-hidden="true">
              <span className="skyx-p99">
                p99 <b>20</b>ms
              </span>
              <svg viewBox="0 0 120 40" preserveAspectRatio="none">
                <path d="M0 30 L14 26 L28 31 L42 20 L56 24 L70 12 L84 18 L98 8 L120 5" />
              </svg>
            </span>
            <span className="serif">
              <Split text="layer." start={14} />
            </span>
          </span>
          <span className="hl hl-small">
            <Split text="p99 or it didn't happen." start={22} />
          </span>
        </h1>

        <p className="skyx-sub">
          Comparison engines and low-latency pipelines at Buyhatke.
        </p>

        <div className="skyx-actions">
          <Link className="btn btn-primary" href="/systems">
            See the systems
            <ArrowRight width={14} height={14} />
          </Link>
          <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
            <MailIcon width={14} height={14} />
            Email me
          </a>
        </div>
      </HeroCollage>
      <div className="wrap hero-logos">
        <LogoWall />
      </div>

      <Journey />

      <section className="section home-systems" id="systems">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="01"
              label="Selected systems"
              title={
                <>
                  The work that <span className="serif">disappears.</span>
                </>
              }
              note={`Four of the ${systems.length}. Open one to go deep: the architecture, the failures, and what still hurts.`}
            />
          </Reveal>

          <SystemsStack>
            {homeSystems.map((system, k) => (
              <article
                className="system-card"
                key={system.slug}
                data-system={system.slug}
                style={{ "--k": k } as CSSProperties}
              >
                <Link
                  className="system-art"
                  href={`/systems/${system.slug}`}
                  aria-label={`Open the ${system.title} case study`}
                >
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
          </SystemsStack>

          <div className="home-more">
            <Link className="text-link" href="/systems">
              All {systems.length} systems
              <ArrowRight width={13} height={13} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section works-section" id="projects">
        <div className="wrap">
          <Works items={homeStage} />
          <div className="garage-home-foot">
            <span className="mono">{stage.length} live recordings · nothing mocked up</span>
            <Link className="text-link" href="/projects">
              Enter the garage
              <ArrowRight width={13} height={13} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section scars" id="scars">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="02"
              label="What still hurts"
              title={
                <>
                  Not everything <span className="serif">works.</span>
                </>
              }
              note="The numbers above are the good news. These come straight from the dashboards and the case studies."
            />
          </Reveal>

          <div className="scar-grid">
            {scars.map((scar) => (
              <Link className="scar" href={`/systems/${scar.slug}#${scar.anchor}`} key={scar.title}>
                <span className="scar-k">{scar.label}</span>
                <strong>{scar.title}</strong>
                <p>{scar.body}</p>
                <span className="scar-more">
                  Read the rest
                  <ArrowRight width={12} height={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
