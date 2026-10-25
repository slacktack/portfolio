"use client";

import Link from "next/link";
import { useState } from "react";
import { ContactForm } from "@/components/contact-form";
import { CopyEmail } from "@/components/copy-email";
import { Scene3D } from "@/components/scene3d";
import { ArrowUpRight } from "@/components/icons";
import { profile } from "@/lib/site";

const links = [
  { href: "/systems", label: "Systems" },
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Lab" },
  { href: "/notes", label: "Notes" },
  { href: "/about", label: "About" },
];

export function SiteFooter() {
  const [open, setOpen] = useState(false);


  return (
    <footer className="finale">
      <div className="finale-top wrap">
        <Link href="/" className="hdr-brand finale-brand" aria-label="Tushar Gautam, home">
          <span>tushar</span>
          <span>
            gautam<i>.</i>
          </span>
        </Link>
        <a className="finale-mail-btn" href={`mailto:${profile.email}`} aria-label="Email Tushar">
          <ArrowUpRight width={22} height={22} />
        </a>
      </div>

      <div className="finale-grid wrap">
        <div className="finale-art">
          <Scene3D kind="finale" mode="card" className="finale-scene" />
        </div>

        <div className="finale-copy">
          <span className="finale-hello">A good constraint starts with a hello.</span>
          <h2>
            Have a hard problem? <span className="serif">Good.</span>
          </h2>
          <p>
            I&apos;m open to backend roles and systems work. Tell me the latency target, the quota,
            or the pipeline that keeps falling over at the worst possible time.
          </p>

          <div className="finale-actions">
            <a className="chunk chunk-primary" href={`mailto:${profile.email}`}>
              Send mail
            </a>
            <CopyEmail email={profile.email} />
            <button
              type="button"
              className="chunk"
              aria-expanded={open}
              aria-controls="finale-form"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? "Close" : "Write here"}
            </button>
          </div>
          <a className="finale-address" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>

          <div className="finale-form" id="finale-form" data-open={open ? "" : undefined}>
            <div>
              <ContactForm email={profile.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="finale-bottom wrap">
        <nav aria-label="Footer">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
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
