"use client";

import Link from "next/link";
import { labItems, notes, profile, projects, stage, systems, timeline } from "@/lib/site";
import { Arrow, AutoVideo, BrandCard, Browser, Phone, host } from "./ui";
import { ThemeTeaser } from "@/components/theme-palette";

const metric = (slug: string, label: string) => systems.find((s) => s.slug === slug)?.metrics.find((m) => m.label === label)?.value ?? "";
const minutes = notes.reduce((n, x) => n + (parseInt(x.readTime, 10) || 0), 0);

export function Home() {
  const lead = stage[0];
  const phone = stage.find((s) => s.slug === "wardrobe-ai");
  const train = projects.find((p) => p.slug === "train-tracker");
  return (
    <>
      <section className="sm-hero">
        <div className="sm-hero-top" data-rise="">
          <span className="sm-eyebrow">
            <b>Launch</b>
            {profile.name} · {profile.role} · {profile.location}
          </span>
          <span className="sm-status">
            <i aria-hidden="true" />
            {profile.availability}
          </span>
        </div>
        <h1 className="sm-display" data-rise="">
          <span>I build the</span> <em>invisible</em> <span>layer.</span>
        </h1>
        <div className="sm-hero-sub" data-rise="">
          <p className="sm-lede">{profile.description}</p>
          <Link href="/systems" className="sm-btn" data-cursor="Open">
            See the product line
            <Arrow />
          </Link>
        </div>

        <div className="sm-trio">
          <BrandCard
            tone="navy"
            index={0}
            href="/systems"
            kicker="01 · Products"
            title="Products"
            specs={[
              ["SYSTEMS", String(systems.length)],
              ["REQ/DAY", metric("flights", "Requests / day")],
              ["EVENTS/DAY", metric("flights", "Result events / day")],
              ["P99", metric("categorizer", "p99 latency")],
            ]}
          />
          <BrandCard
            tone="blue"
            index={1}
            href="/projects"
            kicker="02 · Gallery"
            title="Gallery"
            specs={[
              ["LIVE SITES", String(projects.length)],
              ["RECORDINGS", String(stage.length)],
              ["TRAINS", train?.highlight.replace(" live", "") ?? ""],
              ["YEAR", train?.year ?? ""],
            ]}
          />
          <BrandCard
            tone="coral"
            index={2}
            href="/notes"
            kicker="03 · Journal"
            title="Journal"
            specs={[
              ["NOTES", String(notes.length)],
              ["READING", `${minutes} MIN`],
              ["LATEST", notes[0].date.toUpperCase()],
              ["TOPIC", notes[0].category.toUpperCase()],
            ]}
          />
        </div>
      </section>

      <section className="sm-teaser">
        <ThemeTeaser />
      </section>

      <section className="sm-reel" aria-labelledby="sm-reel-h">
        <div className="sm-reel-copy" data-rise="">
          <span className="sm-eyebrow">
            <b>Now shipping</b>
            {lead.tag}
          </span>
          <h2 id="sm-reel-h" className="sm-h2">
            {lead.title}, <em>recorded live.</em>
          </h2>
          <p className="sm-body">{lead.tagline}</p>
          <div className="sm-reel-links">
            <a className="sm-btn" href={lead.href} target="_blank" rel="noreferrer" data-cursor="Visit">
              Visit live
              <Arrow />
            </a>
            <Link className="sm-link" href="/systems/flights">
              Read the product page
              <Arrow />
            </Link>
          </div>
        </div>
        <div className="sm-reel-stage" data-rise="" data-cursor="View">
          <Link href="/projects" aria-label="Open the gallery" className="sm-reel-hit" />
          <Browser url={host(lead.href) + "/flights"} className="sm-reel-browser">
            <AutoVideo src={lead.video} poster={lead.poster} label={`${lead.title} screen recording`} />
          </Browser>
          {phone ? (
            <Phone className="sm-reel-phone">
              <AutoVideo src={phone.video} poster={phone.poster} label={`${phone.title} screen recording`} />
            </Phone>
          ) : null}
        </div>
      </section>

      <section className="sm-duo">
        <BrandCard
          tone="navy"
          className="sm-card-wide"
          href="/lab"
          kicker="04 · Lab"
          title="Lab"
          index={0}
          specs={[
            ["EXPERIMENTS", String(labItems.length)],
            ["INTERACTIVE", String(labItems.filter((l) => l.year === "Interactive").length)],
            ["RUNTIMES", "C++ · GO · RUST"],
          ]}
        >
          <p className="sm-card-p">Small systems, strange constraints. Break them in the browser.</p>
        </BrandCard>
        <BrandCard
          tone="coral"
          className="sm-card-wide"
          href="/about"
          kicker="05 · Maker"
          title="Maker"
          index={1}
          specs={[
            ["BASE", profile.location.toUpperCase()],
            ["ROLE", timeline[timeline.length - 1].title.split("·")[1]?.trim().toUpperCase() ?? ""],
            ["SINCE", timeline[0].year],
          ]}
        >
          <p className="sm-card-p">{profile.tagline}</p>
        </BrandCard>
      </section>
    </>
  );
}
