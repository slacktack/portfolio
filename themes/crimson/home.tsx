"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ThemeTeaser } from "@/components/theme-palette";
import { currently, profile, systems } from "@/lib/site";
import { chips, counts } from "./data";
import { ThemesButton } from "./nav";
import { Toy, type ToyItem } from "./toy";
import { Big, Kick, Nums } from "./ui";
import { Rows } from "./work";

export function Hint({ text }: { text: string }) {
  return (
    <svg className="cr-hint" viewBox="0 0 200 200" aria-hidden="true">
      <defs>
        <path id="cr-hint-c" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" />
      </defs>
      <text>
        <textPath href="#cr-hint-c">{text}</textPath>
      </text>
      <path d="M100 78 v44 M78 100 h44" />
    </svg>
  );
}

export function Home() {
  const [peek, setPeek] = useState<ToyItem | null>(null);
  const items = useMemo<ToyItem[]>(
    () =>
      chips.map((c) => ({
        id: c.id,
        value: c.value,
        label: c.label,
        href: c.href,
        tone: c.tone,
        aria: `${c.value} ${c.label}, from ${c.title}. Opens the case study.`,
      })),
    [],
  );
  const from = peek ? chips.find((c) => c.id === peek.id) : undefined;

  return (
    <div className="cr-home">
      <section className="cr-hero" data-inv="" aria-labelledby="cr-hero-h">
        <h1 id="cr-hero-h" className="cr-sr">
          {profile.name}, {profile.role} in {profile.location}
        </h1>
        <Toy rows={["TUSHAR", "GAUTAM"]} items={items} auto={3} controls keys label="Physics wordmark. Grab, drag and throw the letters." className="cr-hero-toy" onPeek={setPeek}>
          <div className="cr-hero-top" aria-hidden="true">
            <p className="cr-hero-role">
              {profile.role}
              <br />
              {profile.location}
            </p>
            <p className="cr-hero-tag">{profile.tagline}</p>
          </div>
          <Hint text="GRAB · DRAG · THROW · STACK · GRAB · DRAG · THROW · STACK · " />
        </Toy>
        <div className="cr-peek" aria-live="polite">
          {from ? (
            <Link href={from.href} data-mag="">
              <b>{from.value}</b>
              <span>
                {from.label} · from <u>{from.title}</u> →
              </span>
            </Link>
          ) : (
            <p>
              <b>+</b>
              <span>Drop a real number. Every chip links to the system that produced it.</span>
            </p>
          )}
        </div>
      </section>

      <section className="cr-manifesto" aria-labelledby="cr-man-h">
        <Kick n="01">The short version</Kick>
        <h2 id="cr-man-h" className="cr-man-text" data-rv="">
          <Nums text={profile.description} />
        </h2>
        <div className="cr-man-side" data-rv="">
          <p className="cr-avail">
            <i aria-hidden="true" />
            {profile.availability} · {profile.availabilityDetail}
          </p>
          <dl className="cr-now">
            {currently.map((c) => (
              <div key={c.label}>
                <dt>{c.label}</dt>
                <dd>{c.value}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" className="cr-pill" data-mag="">
            More about me →
          </Link>
        </div>
      </section>

      <section className="cr-selected" aria-labelledby="cr-sel-h">
        <div className="cr-sel-head">
          <Kick n="02">Selected systems</Kick>
          <Big lines={["Five of", `${counts.systems}.`]} />
          <span id="cr-sel-h" className="cr-sr">
            Selected systems
          </span>
        </div>
        <Rows list={systems.slice(0, 5)} />
        <div className="cr-sel-more" data-rv="">
          <Link href="/systems" className="cr-pill is-red" data-mag="">
            All {counts.systems} systems →
          </Link>
          <Link href="/projects" className="cr-pill" data-mag="">
            {counts.projects} projects after hours →
          </Link>
          <Link href="/lab" className="cr-pill" data-mag="">
            {counts.lab} lab experiments →
          </Link>
        </div>
      </section>

      <section className="cr-tease" aria-labelledby="cr-tease-h" data-inv="">
        <div className="cr-tease-copy" data-rv="">
          <Kick n="03">Too loud?</Kick>
          <h2 id="cr-tease-h">
            Swap the <em>whole</em> site.
          </h2>
          <p>Same systems and the same numbers, rebuilt as a different website each time. This one is the toy.</p>
          <ThemesButton big />
        </div>
        <ThemeTeaser className="cr-teaser" />
      </section>
    </div>
  );
}
