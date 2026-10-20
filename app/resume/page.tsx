import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, FileIcon } from "@/components/icons";
import { PrintButton } from "@/components/print-button";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume for Tushar Gautam, backend engineer at Buyhatke. Comparison systems, low-latency pipelines, and production metrics.",
};

const experience = [
  {
    company: "Buyhatke Internet Private Limited",
    title: "Software Development Engineer 1 — Backend",
    period: "Aug 2025 — Present",
    location: "Bangalore, India",
    bullets: [
      "Own backend systems for flight and hotel comparison, serving 478K+ requests and 3.79M+ result events per day across web and mobile.",
      "Operate a provider fan-out pipeline handling 234K+ Skyscanner API calls per hour, including 68K CREATE and 54K POLL calls per hour.",
      "Built quota-aware orchestration with per-provider token buckets, per-search deadlines, early termination, and graceful partial-result delivery.",
      "Resolve hotel identity across 7+ providers into a canonical graph, supporting 16K+ comparisons per day and a 1.2K hourly peak.",
      "Ship live rate updates over WebSocket and maintain observability for latency, quota, and provider health.",
    ],
  },
  {
    company: "Buyhatke Internet Private Limited",
    title: "Software Development Engineer Intern — Backend",
    period: "Jan 2025 — Jul 2025",
    location: "Bangalore, India",
    bullets: [
      "Built a cab comparison system from scratch across Uber, Ola, and Rapido with smart pickup suggestions.",
      "Reduced user cab spend by ₹1,000+ per month through fare comparison and pickup optimization.",
      "Shipped the first production version end-to-end: provider adapters, comparison logic, and API surface.",
    ],
  },
];

const projects = [
  {
    name: "Flight comparison pipeline",
    detail:
      "Async metasearch orchestration across 7 providers: fan-out, polling, normalization, dedupe, ranking, and streamed partial results. TypeScript, Node.js, Kafka, Redis, provider APIs.",
  },
  {
    name: "Hotel comparison + identity resolution",
    detail:
      "Canonical hotel graph across 7+ suppliers using name, geo, star, amenity, and room signals. Live rates over WebSocket. TypeScript, Node.js, MySQL, Redis.",
  },
  {
    name: "Food comparison",
    detail:
      "Swiggy and Zomato comparison using FSSAI license as the canonical restaurant key. ClickHouse persistence with async disk-spilled writes and live/fallback reads.",
  },
  {
    name: "Query categorizer",
    detail:
      "Retrieval + GBDT reranker over 1.18M labeled examples. ECE 0.0104, p99 20ms, 232ms cold start with mmap indexes. Rust hot path with Python and Node parity.",
  },
  {
    name: "Semantic product search",
    detail:
      "BGE-M3 embeddings in LanceDB with structured extraction and validation. 99% extraction accuracy, LLM-assisted offline, zero LLM in the request path.",
  },
  {
    name: "Go load balancer",
    detail:
      "Weighted routing, health checks, circuit breakers, and sticky sessions, built as a systems exercise. Interactive demo in the lab.",
  },
];

const skills = [
  { label: "Languages", value: "TypeScript, Go, Rust, C++, Python, SQL" },
  { label: "Backend", value: "Node.js, REST, WebSockets, Kafka, Redis, MySQL, ClickHouse" },
  { label: "Systems", value: "Distributed systems, rate limiting, circuit breakers, caching, observability, Linux" },
  { label: "ML systems", value: "Retrieval, embeddings, calibration, GBDT, evaluation" },
];

const education = [
  {
    school: "Indian Institute of Information Technology, Kota",
    detail: "B.Tech, Electronics and Communication Engineering · GPA 8.58 / 10",
    period: "2021 — 2025",
  },
  {
    school: "Kautilya Senior Secondary School",
    detail: "CBSE, PCM · 89%",
    period: "2020",
  },
  {
    school: "St. Paul's Convent School, Dasuya",
    detail: "ICSE · 93.2%",
    period: "2018",
  },
];

export default function ResumePage() {
  return (
    <div className="resume-page">
      <div className="wrap">
        <div className="breadcrumb no-print">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Resume</span>
        </div>

        <div className="email-row no-print" style={{ justifyContent: "flex-end", marginBottom: 18 }}>
          <a className="btn btn-ghost btn-sm" href={profile.resume} target="_blank" rel="noreferrer">
            <FileIcon width={13} height={13} />
            Download PDF
          </a>
          <PrintButton />
        </div>

        <article className="resume-sheet">
          <header className="resume-head">
            <div>
              <h1>{profile.name}</h1>
              <p className="mono" style={{ marginTop: 8, color: "var(--accent)" }}>
                {profile.role} · comparison systems · low latency
              </p>
            </div>
            <div className="resume-contact">
              <span>{profile.location}</span>
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <a href={profile.socials[0].href} target="_blank" rel="noreferrer">
                github.com/tushar-xo
              </a>
              <a href={profile.socials[1].href} target="_blank" rel="noreferrer">
                linkedin.com/in/tushar-gautam
              </a>
            </div>
          </header>

          <section className="resume-section">
            <h2>Summary</h2>
            <p style={{ fontSize: "0.9rem", lineHeight: 1.6, color: "var(--ink-soft)" }}>
              Backend engineer with production experience in high-throughput comparison
              systems, asynchronous provider pipelines, entity resolution, and
              latency-sensitive serving. Comfortable owning a system from provider
              contract to p99.
            </p>
          </section>

          <section className="resume-section">
            <h2>Experience</h2>
            {experience.map((job) => (
              <div key={`${job.title}-${job.period}`} style={{ marginBottom: 18 }}>
                <div className="resume-job">
                  <strong>
                    {job.title} · {job.company}
                  </strong>
                  <span>{job.period}</span>
                </div>
                <ul className="resume-list">
                  {job.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className="resume-section">
            <h2>Selected systems</h2>
            <div className="resume-list">
              {projects.map((project) => (
                <div key={project.name} style={{ paddingBottom: 8 }}>
                  <strong style={{ fontSize: "0.9rem", fontWeight: 500 }}>{project.name}</strong>
                  <p style={{ fontSize: "0.82rem", lineHeight: 1.5, color: "var(--muted)", marginTop: 2 }}>
                    {project.detail}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="resume-section">
            <h2>Skills</h2>
            <div className="resume-stack">
              {skills.map((skill) => (
                <div key={skill.label} style={{ marginBottom: 4 }}>
                  <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{skill.label}:</strong>{" "}
                  {skill.value}
                </div>
              ))}
            </div>
          </section>

          <section className="resume-section">
            <h2>Education</h2>
            {education.map((item) => (
              <div className="resume-edu" key={item.school}>
                <div>
                  <strong style={{ fontWeight: 500 }}>{item.school}</strong>
                  <div style={{ color: "var(--muted)", fontSize: "0.8rem" }}>{item.detail}</div>
                </div>
                <span>{item.period}</span>
              </div>
            ))}
          </section>

          <section className="resume-section">
            <h2>Links</h2>
            <div className="resume-stack" style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px" }}>
              {profile.socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" style={{ color: "var(--ink)" }}>
                  {social.label} <ArrowUpRight width={10} height={10} style={{ display: "inline" }} />
                </a>
              ))}
            </div>
          </section>

          <div className="print-only" style={{ marginTop: 24, fontSize: 9, color: "#555" }}>
            {profile.name} · {profile.email} · {profile.location}
          </div>
        </article>
      </div>
    </div>
  );
}
