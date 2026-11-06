import type { Metadata } from "next";
import Link from "next/link";
import { SystemArtifact } from "@/components/artifacts";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { ChapterHero, Handoff } from "@/components/story";
import { getSystem, systems } from "@/lib/site";

export const metadata: Metadata = {
  title: "Systems",
  description:
    "Chapter 01. Production systems: flights, hotels, food, grocery, query categorization, semantic search, cabs, payments and the company-wide OpenObserve log platform.",
};

type Scar = { slug: string; anchor: string; label: string; kind: string; title: string; body: string };

const scars: Scar[] = [
  ...systems
    .filter((s) => s.broke)
    .map((s) => ({ slug: s.slug, anchor: "broke", label: s.shortTitle, kind: "Postmortem", title: s.broke!.title, body: s.broke!.body })),
  ...(getSystem("hotels")?.pager
    ? [{ slug: "hotels", anchor: "hard-part", label: "Hotels", kind: "The tail", title: "The worst compare took four and a half minutes", body: getSystem("hotels")!.pager! }]
    : []),
  ...(getSystem("best-way-to-pay")?.flaws ?? [])
    .slice(0, 3)
    .map((f) => ({ slug: "best-way-to-pay", anchor: "flaws", label: "Best way to pay", kind: "Still hurts", title: f.title, body: f.body })),
];

export default function SystemsPage() {
  return (
    <>
      <ChapterHero
        id="systems"
        title={
          <>
            Where the request <span className="serif">goes.</span>
          </>
        }
        lede={`${systems.length} production systems at Buyhatke, each one a different answer to the same promise: many sources, one honest answer, before the person looks away.`}
        aside={
          <>
            <p>
              <b>Production, not prototypes.</b> Every case here shipped into a live pipeline. The numbers are the
              ones I can defend.
            </p>
            <p>Each case ends with what broke and what still hurts. The scars are collected at the bottom.</p>
          </>
        }
      />

      <section className="section-tight" id="index">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="01.1"
              label="The index"
              title={
                <>
                  {systems.length} surfaces. <span className="serif">One layer.</span>
                </>
              }
            />
          </Reveal>
          <div className="systems-index-grid">
            {systems.map((system) => (
              <Link className="systems-index-card" href={`/systems/${system.slug}`} key={system.slug}>
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

      <section className="section scars" id="scars">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="01.2"
              label="The scars"
              title={
                <>
                  Not everything <span className="serif">works.</span>
                </>
              }
              note="The numbers above are the good news. These come straight from the postmortems, the dashboards and the case studies."
            />
          </Reveal>

          <div className="scar-grid">
            {scars.map((scar) => (
              <Link className="scar" href={`/systems/${scar.slug}#${scar.anchor}`} key={scar.title}>
                <span className="scar-k">
                  <b>{scar.kind}</b>
                  {scar.label}
                </span>
                <strong>{scar.title}</strong>
                <p>{scar.body}</p>
                <span className="scar-more">
                  Read the case
                  <ArrowRight width={12} height={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Handoff
        from="systems"
        lead="Scars come from mechanisms I didn't fully understand yet. So I rebuild them on a bench, where they are allowed to break."
      />
    </>
  );
}
