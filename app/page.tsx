import Link from "next/link";
import Image from "next/image";
import { SystemArtifact } from "@/components/artifacts";
import { ContactForm } from "@/components/contact-form";
import { CopyEmail } from "@/components/copy-email";
import { LogoWall, StackTag } from "@/components/brand";
import { SkyHero } from "@/components/sky-hero";
import { Ledger } from "@/components/ledger";
import { ProjectStage } from "@/components/project-stage";
import { ArrowRight, ArrowUpRight, FileIcon, PlusIcon } from "@/components/icons";
import { Marquee } from "@/components/marquee";
import { OperatorCard } from "@/components/operator-card";
import { Reveal } from "@/components/reveal";
import { SectionHeading, SectionLabel } from "@/components/section-heading";
import {
  labItems,
  marqueeMetrics,
  notes,
  principles,
  profile,
  stage,
  systems,
} from "@/lib/site";

const heroShots = [
  "/assets/projects/flight-tracker.png",
  "/assets/projects/train-tracker.png",
  "/assets/projects/dream-journal.png",
];

export default function HomePage() {
  return (
    <>
      <SkyHero>
        <span className="eyebrow">
          <span className="dot" />
          Bangalore · Backend engineer · {profile.availability}
        </span>

        <h1 className="sky-title">
          <span className="sky-line">
            The invisible
            <span className="sky-shot" aria-hidden="true">
              {heroShots.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 40vw, 14vw"
                  style={{ animationDelay: `${i * 3}s` }}
                />
              ))}
            </span>
            layer
          </span>
          <span className="sky-line2">P99 or it didn&apos;t happen.</span>
        </h1>

        <p className="sky-sub">
          I&apos;m Tushar. I build comparison engines and low-latency pipelines at Buyhatke, and I
          reverse-engineer APIs for sport. Last measured: <strong>478K+ requests a day</strong> and
          a <strong>p99 of 20ms</strong> on the hottest path.
        </p>

        <div className="sky-actions">
          <Link className="btn btn-primary" href="/systems">
            Explore the systems
            <ArrowRight width={14} height={14} />
          </Link>
          <a className="btn btn-ghost" href={profile.resume} target="_blank" rel="noreferrer">
            <FileIcon width={14} height={14} />
            Download résumé
          </a>
        </div>

        <a className="sky-cue mono" href="#systems">
          Meet the work ↓
        </a>
      </SkyHero>

      <Marquee items={marqueeMetrics} />

      <section className="section" id="systems">
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
              note="Seven production systems. Four surfaces here. Every one has a pager story."
            />
          </Reveal>

          <LogoWall />

          <div className="systems-list">
            {systems
              .filter((system) =>
                ["flights", "hotels", "categorizer", "observability"].includes(system.slug)
              )
              .map((system) => (
              <article className="system-card" key={system.slug}>
                <Link
                  className="system-art"
                  href={`/systems/${system.slug}`}
                  aria-label={`Open the ${system.title} case study`}
                >
                  <SystemArtifact kind={system.artifact} />
                </Link>

                <div className="system-copy">
                  <div className="system-kicker">
                    <span className="index">{system.index}</span>
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

                  <div className="system-tags">
                    {system.stack.slice(0, 4).map((tag) => (
                      <StackTag name={tag} key={tag} />
                    ))}
                  </div>

                  <Link className="text-link system-link" href={`/systems/${system.slug}`}>
                    Read the case study
                    <ArrowRight width={13} height={13} />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="lab-strip">
            {labItems.map((item) => (
              <Link className="lab-card" href="/lab" key={item.slug}>
                <div className="lab-card-copy">
                  <strong>{item.title}</strong>
                  <span>
                    {item.detail} · {item.year}
                  </span>
                </div>
                <span className="plus" aria-hidden="true">
                  <PlusIcon width={13} height={13} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section garage-home" id="projects">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="02"
              label="On stage · live recordings"
              title={
                <>
                  When the docs stop, <span className="serif">I start.</span>
                </>
              }
              note="Recordings of live pages: the Buyhatke products I work on, and the side quests I built after hours. Drag it, use the arrows, or click the front screen to open the real thing."
            />
          </Reveal>

          <Reveal>
            <ProjectStage items={stage} />
          </Reveal>

          <div className="garage-home-foot">
            <span className="mono">
              {stage.length} live recordings · nothing mocked up
            </span>
            <Link className="text-link" href="/projects">
              Enter the garage
              <ArrowRight width={13} height={13} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="ledger">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="03"
              label="The ledger"
              title={
                <>
                  Built, shipped, <span className="serif">counted.</span>
                </>
              }
              note="Authored commits against each repo's total. Where the repo belongs to a team, the entry says so."
            />
          </Reveal>
          <Ledger personalLimit={4} />
          <div className="ledger-more">
            <Link className="text-link" href="/projects#ledger">
              Every after-hours build
              <ArrowRight width={13} height={13} />
            </Link>
          </div>
        </div>
      </section>

      <section className="receipts" id="receipts">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="04"
              label="Receipts"
              title={
                <>
                  Numbers with <span className="serif">receipts.</span>
                </>
              }
              note="Not a pitch deck. The metrics I can defend, taken from production work and benchmark runs. Screenshots are redacted; the numbers are not."
            />
          </Reveal>

          <div className="receipts-grid">
            <div className="receipt">
              <div className="receipt-head">
                <span>LOG / FLIGHTS</span>
                <b>04:12:08</b>
              </div>
              <div className="receipt-body">
                <pre className="receipt-terminal">
                  <span className="m">$</span> compare --route BLR-GOI{"\n"}
                  <span className="m">→</span> fanout 7 providers{"\n"}
                  <span className="m">→</span> create 68,042/hr{"\n"}
                  <span className="m">→</span> poll 54,117/hr{"\n"}
                  <span className="g">200 OK</span> 478,291 req/day{"\n"}
                  <span className="o">p99</span> 20ms · streamed
                </pre>
              </div>
              <div className="receipt-caption">
                <b>Async fan-out, accounted for.</b>
                Every provider call has a budget, a deadline, and a trace.
              </div>
            </div>

            <div className="receipt">
              <div className="receipt-head">
                <span>PROD / FLIGHTS</span>
                <b>24H</b>
              </div>
              <div className="receipt-body">
                <div className="receipt-big">
                  <b>478K+</b>
                  <span>Requests / day · web + mobile</span>
                </div>
              </div>
              <div className="receipt-caption">
                <b>One pipeline, two clients.</b>
                The same orchestrator serves web and mobile search without forking
                the contract.
              </div>
            </div>

            <div className="receipt">
              <div className="receipt-head">
                <span>LATENCY / 24H</span>
                <b>p99</b>
              </div>
              <div className="receipt-body">
                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>Path</th>
                      <th>p50</th>
                      <th>p99</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Categorize</td>
                      <td>4ms</td>
                      <td>20ms</td>
                    </tr>
                    <tr>
                      <td>Cold start</td>
                      <td>—</td>
                      <td>232ms</td>
                    </tr>
                    <tr>
                      <td>Parity drift</td>
                      <td>—</td>
                      <td>&lt;0.1%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="receipt-caption">
                <b>Warm and cold are both real.</b>
                The p99 is only trustworthy when the cold path is measured too.
              </div>
            </div>

            <div className="receipt">
              <div className="receipt-head">
                <span>EVENTS / FLIGHTS</span>
                <b>STREAM</b>
              </div>
              <div className="receipt-body">
                <div className="receipt-big">
                  <b>3.79M+</b>
                  <span>Result events / day</span>
                </div>
              </div>
              <div className="receipt-caption">
                <b>Partial results, one shape.</b>
                Normalized, deduped, and served before every provider has finished.
              </div>
            </div>

            <div className="receipt">
              <div className="receipt-head">
                <span>IDENTITY / HOTELS</span>
                <b>7+ FEEDS</b>
              </div>
              <div className="receipt-body">
                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>Signal</th>
                      <th>Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Name similarity</td>
                      <td>0.35</td>
                    </tr>
                    <tr>
                      <td>Geo distance</td>
                      <td>0.30</td>
                    </tr>
                    <tr>
                      <td>Amenities</td>
                      <td>0.20</td>
                    </tr>
                    <tr>
                      <td>Room signature</td>
                      <td>0.15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="receipt-caption">
                <b>One hotel, not seven maybes.</b>
                16K+ comparisons a day against a canonical hotel graph.
              </div>
            </div>

            <div className="receipt">
              <div className="receipt-head">
                <span>SEARCH / QUALITY</span>
                <b>BENCH</b>
              </div>
              <div className="receipt-body">
                <div className="receipt-big">
                  <b>99%</b>
                  <span>Extraction accuracy · 1.18M examples</span>
                </div>
              </div>
              <div className="receipt-caption">
                <b>Calibrated, not vibes.</b>
                ECE 0.0104, verified against a golden benchmark on every change.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="wrap about-split">
          <Reveal className="about-copy">
            <SectionLabel number="05">The operator</SectionLabel>
            <h2 className="display-2">
              Engineer by trade. <span className="serif">Systems person</span> by
              inclination.
            </h2>
            <p className="lede">
              I studied electronics at IIIT Kota, then found the part of computing I
              actually loved: the layer underneath the product. The queue. The quota.
              The pipeline that has to stay correct when half its inputs are late.
            </p>
            <p className="lede">
              At Buyhatke I work on flights, hotels, and food comparison. I like
              problems where the interface is simple and the system behind it is not.
              I write about those systems because the details are usually more useful
              than the outcome.
            </p>

            <div className="principles">
              {principles.map((principle) => (
                <div className="principle" key={principle.num}>
                  <span className="num">{principle.num}</span>
                  <strong>{principle.title}</strong>
                  <p>{principle.body}</p>
                </div>
              ))}
            </div>

            <Link className="text-link" href="/about">
              More about the operator
              <ArrowRight width={13} height={13} />
            </Link>
          </Reveal>

          <Reveal delay={100}>
            <OperatorCard />
          </Reveal>
        </div>
      </section>

      <section className="section" id="notes">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              number="06"
              label="Field notes"
              title={
                <>
                  Notes from the <span className="serif">lower layers.</span>
                </>
              }
              note="Longer thoughts on latency, quotas, calibration, and the parts of backend work that do not fit in a bullet point."
            />
          </Reveal>

          <div className="notes-grid">
            {notes.map((note) => (
              <Link className="note-card" href={`/notes/${note.slug}`} key={note.slug}>
                <div className="note-meta">
                  <span>{note.category}</span>
                  <span>
                    {note.date} · {note.readTime}
                  </span>
                </div>
                <h3 className="note-title">{note.title}</h3>
                <p className="note-dek">{note.dek}</p>
                <div className="note-foot">
                  <span>Read note</span>
                  <ArrowUpRight width={13} height={13} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="contact section" id="contact">
        <div className="wrap contact-grid">
          <div className="contact-copy">
            <span className="eyebrow">
              <span className="dot" />
              07 — Contact
            </span>
            <h2 className="display-2">
              Have a hard problem? <span className="serif">Good.</span>
            </h2>
            <p className="lede">
              I&apos;m open to backend roles and systems work. The best conversations
              start with a constraint: a latency target, a quota, a pipeline that
              keeps falling over at the worst possible time.
            </p>

            <div className="contact-links">
              {profile.socials
                .filter((social) => social.label !== "Email")
                .map((social) => (
                  <a
                    className="contact-link"
                    href={social.href}
                    key={social.label}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.label}
                    <ArrowUpRight width={11} height={11} />
                  </a>
                ))}
            </div>

            <div className="email-row">
              <a className="email-big" href={`mailto:${profile.email}`}>
                {profile.email}
              </a>
              <CopyEmail email={profile.email} />
            </div>

            <div className="contact-note">
              <span>Based in Bangalore · IST (UTC+5:30)</span>
              <span>Usually replies within a day</span>
            </div>
          </div>

          <ContactForm email={profile.email} />
        </div>
      </section>
    </>
  );
}
