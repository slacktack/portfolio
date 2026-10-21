import { Pulse } from "@/components/pulse";
import Link from "next/link";
import { profile } from "@/lib/site";
import { ArrowUpRight } from "@/components/icons";

type FooterLink = { href: string; label: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Systems",
    links: [
      { href: "/systems", label: "All systems" },
      { href: "/systems/flights", label: "Flights" },
      { href: "/systems/hotels", label: "Hotels" },
      { href: "/systems/observability", label: "Observability" },
    ],
  },
  {
    title: "Explore",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/lab", label: "The lab" },
      { href: "/notes", label: "Field notes" },
      { href: "/about", label: "About" },
      { href: "/resume", label: "Resume" },
    ],
  },
  {
    title: "Elsewhere",
    links: profile.socials.map((social) => ({
      href: social.href,
      label: social.label,
      external: social.href.startsWith("http"),
    })),
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="hdr-brand footer-wordmark" aria-label="Tushar Gautam, home">
              <span>tushar</span>
              <span>
                gautam<i>.</i>
              </span>
            </Link>
            <p>
              Backend engineer building the invisible layer. Comparison engines, low-latency
              pipelines, and systems that stay up.
            </p>
            <a
              href={profile.resume}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Download resume
              <ArrowUpRight width={12} height={12} />
            </a>
          </div>

          {columns.map((column) => (
            <div className="footer-col" key={column.title}>
              <h3>{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noreferrer">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-pulse">
          <Pulse />
        </div>
        <div className="footer-bottom">
          <span>© 2026 Tushar Gautam · Built with intent, always evolving</span>
          <span className="perf-badge">
            <span className="dot" />
            Performance budget: &lt;120KB JS · LCP &lt;1.5s
          </span>
          <span>No cookies. No trackers. Just requests.</span>
          <a href="#main">Back to top ↑</a>
        </div>
      </div>
    <div className="footer-giant" aria-hidden="true">
        <span>Tushar Gautam</span>
      </div>
    </footer>
  );
}
