"use client";

import Link from "next/link";
import { useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { CopyEmail } from "@/components/copy-email";
import { InkPad } from "@/components/ink-pad";
import { Scene3D } from "@/components/scene3d";
import { Who } from "@/components/visitor";
import { StickerBand } from "@/components/zine-bits";
import { profile } from "@/lib/site";
import { chapters } from "@/components/chapters";

const links = chapters.filter((c) => c.id !== "hello");

export function SiteFooter() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="finale zsign" id="hello">
      <StickerBand
        items={["Bring a hard problem", "Sign the last page", "Bangalore", "Backend roles · systems work"]}
        tone="ink"
        tilt={-1.2}
        label="Hello"
      />

      <div className="zsign-stage wrap">
        <div className="zsign-copy">
          <span className="zsign-k">
            <b>Chapter 06</b> Hello · the last page
          </span>
          <h2>
            Sign here, <Who fallback="friend" suffix="." />
            <em>Have a hard problem? Good.</em>
          </h2>
          <p>
            I&apos;m open to backend roles and systems work. Tell me the latency target, the quota, or the pipeline
            that keeps falling over at the worst possible time.
          </p>

          <div className="zsign-plain">
            <span>Or the plain way</span>
            <a className="zsign-mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="finale-actions">
              <CopyEmail email={profile.email} />
              <button
                type="button"
                className="chunk"
                aria-expanded={open}
                aria-controls="finale-form"
                onClick={() => setOpen((v) => !v)}
              >
                {open ? "Close" : "Write a longer note"}
              </button>
            </div>
          </div>

          <div className="finale-form" id="finale-form" data-open={open ? "" : undefined}>
            <div>
              <ContactForm email={profile.email} />
            </div>
          </div>
        </div>

        <div className="zsign-pad">
          <div className="zsign-object" aria-hidden="true">
            <Scene3D kind="finale" mode="card" className="finale-scene" />
          </div>
          <InkPad email={profile.email} />
        </div>
      </div>

      <div className="finale-bottom wrap">
        <nav aria-label="Footer">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <sup>{l.n}</sup>
              {l.id === "request" ? "Home" : l.nav}
            </Link>
          ))}
        </nav>
        <span>Bangalore · usually replies within a day</span>
        <a href="#main">Back to top ↑</a>
      </div>

      <div className="footer-giant" aria-hidden="true">
        <span>Tushar Gautam</span>
      </div>
    </footer>
  );
}
