import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { profile } from "@/lib/site";

const facts = [
  { k: "Now", v: "Backend engineer, Buyhatke. Intern Jan 2025, full time since Aug 2025." },
  { k: "Owns", v: "Flight, hotel and food comparison backends; a zero-LLM categorizer; a private local-AI platform; the company's log platform." },
  { k: "Scale", v: "478K+ requests and 3.79M+ result events a day. 12.5B log events across 201 streams." },
  { k: "Works in", v: "Node.js, TypeScript, Go, Rust, Python, ClickHouse, Redis, MySQL." },
  { k: "School", v: "IIIT Kota, Electronics and Communication, GPA 8.58." },
];

export function HireCard() {
  return (
    <aside className="hire">
      <div className="hire-head">
        <span>The 30-second version</span>
        <i className="crop crop-tl" />
        <i className="crop crop-br" />
      </div>
      <dl>
        {facts.map((f) => (
          <div key={f.k}>
            <dt>{f.k}</dt>
            <dd>{f.v}</dd>
          </div>
        ))}
      </dl>
      <div className="hire-actions">
        <a className="btn btn-primary" href={`mailto:${profile.email}`}>
          Email Tushar
          <ArrowUpRight width={13} height={13} />
        </a>
        <Link className="btn btn-ghost" href="/resume">
          Résumé
        </Link>
      </div>
    </aside>
  );
}
