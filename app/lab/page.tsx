import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { profile } from "@/lib/site";

export const metadata: Metadata = {
  title: "The lab",
  description:
    "Interactive experiments in systems engineering: cache design, tail latency, identity resolution, alerting, a Memcached clone, a Go load balancer and a dual C++ / Rust vector database.",
};

export default function LabPage() {
  return (
    <>
      <section className="lab-hero">
        <div className="wrap page-hero-grid">
          <div className="page-hero-copy">
            <span className="eyebrow">
              <span className="dot" />
              The lab · no product pressure
            </span>
            <h1 className="display-1">
              Small systems, <span className="serif">strange constraints.</span>
            </h1>
            <p className="lede">
              Experiments built to understand a mechanism, not to ship a roadmap. Some
              are interactive. All of them are allowed to break.
            </p>
          </div>

          <div className="page-hero-aside">
            <p>
              <b>Build, then break.</b> A system you have not stressed is a system you
              do not understand yet.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight" id="cache-key">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="01"
              label="Flights · cache design"
              title={<>Change one thing. Watch the cache decide.</>}
              note="A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building."
            />
          </Reveal>
          <Reveal>
            <CacheKeyLab />
          </Reveal>
        </div>
      </section>

      <section className="section-tight" id="deadlines">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="02"
              label="Hotels · stragglers"
              title={<>Average latency is a <span className="serif">liar.</span></>}
              note="Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline."
            />
          </Reveal>
          <Reveal>
            <DeadlineLab />
          </Reveal>
        </div>
      </section>

      <section className="section-tight" id="identity">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="03"
              label="Hotels · identity"
              title={<>Same name is not the <span className="serif">same hotel.</span></>}
              note="Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else."
            />
          </Reveal>
          <Reveal>
            <IdentityLab />
          </Reveal>
        </div>
      </section>

      <section className="section-tight" id="logs">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="04"
              label="Observability · alerting"
              title={<>Silence is a <span className="serif">signal.</span></>}
              note="A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice."
            />
          </Reveal>
          <Reveal>
            <LogStreamLab />
          </Reveal>
        </div>
      </section>

      <section className="section-tight" id="memcached">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="05"
              label="Systems · from scratch"
              title={<>Memcached, <span className="serif">rebuilt.</span></>}
              note="Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire."
            />
          </Reveal>
          <Reveal>
            <MemcachedLab />
          </Reveal>
        </div>
      </section>

      <section className="section-tight" id="load-balancer">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="06"
              label="Build · Go load balancer"
              title={
                <>
                  Weighted routing you can <span className="serif">break.</span>
                </>
              }
              note="A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo below runs the routing logic in your browser so you can kill a node and watch the next request fail over."
            />
          </Reveal>

          <Reveal>
            <LoadBalancerDemo />
          </Reveal>

          <div className="demo-explain">
            <div className="demo-explain-card">
              <strong>Weighted routing</strong>
              <span>Each healthy node gets a share proportional to its weight. Set a weight to zero to drain it.</span>
            </div>
            <div className="demo-explain-card">
              <strong>Health + circuit breaker</strong>
              <span>Three failed checks open the circuit. Traffic stops landing on the node before users notice.</span>
            </div>
            <div className="demo-explain-card">
              <strong>Sticky sessions</strong>
              <span>When enabled, one client keeps landing on the same node until it disappears from the healthy set.</span>
            </div>
            <div className="demo-explain-card">
              <strong>Observability</strong>
              <span>Per-node request counts, shares, health state, and combined weight stay visible while the system changes.</span>
            </div>
          </div>

          <div className="lab-footer-note">
            <span>Simulation only · routing state resets on reload</span>
            <a className="text-link" href={`mailto:${profile.email}`}>
              Talk to me about it
              <ArrowUpRight width={12} height={12} />
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="vortex-vault">
        <div className="wrap">
          <Reveal>
            <SectionHeading
              className="head-compact"
              number="07"
              label="Build · VortexVault"
              title={
                <>
                  One vector database. <span className="serif">Two runtimes.</span>
                </>
              }
              note="A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the same benchmark."
            />
          </Reveal>

          <div className="about-split">
            <Reveal className="case-prose">
              <p>
                Most vector database projects pick a language and inherit its
                assumptions. VortexVault implements the same engine twice — once in
                C++, once in Rust — behind a shared segment format and a shared
                benchmark harness.
              </p>
              <p>
                The interesting part is not the ANN index. It is the seam: WAL replay,
                memtable flushes, segment compaction, and the point where a query has to
                touch both in-memory and on-disk state. Keeping those semantics
                identical across two runtimes is the actual project.
              </p>
              <p>
                Still in progress. The benchmark reports latency, recall, and memory
                footprint for both implementations against the same workload.
              </p>

              <div className="hard-grid">
                <div className="hard-card">
                  <strong>Shared format</strong>
                  <p>Segments and manifests are written by both runtimes and read by either one.</p>
                </div>
                <div className="hard-card">
                  <strong>Parity benchmark</strong>
                  <p>The same vectors, queries, and recall target run through both engines.</p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="arch">
                <div className="arch-nodes" style={{ "--cols": 1 } as React.CSSProperties}>
                  {[
                    ["Client", "insert / query / delete"],
                    ["WAL", "durable append + replay"],
                    ["Memtable", "mutable in-memory index"],
                    ["Segment", "immutable on-disk index"],
                    ["Compaction", "merge + tombstone cleanup"],
                  ].map(([label, detail]) => (
                    <div className="arch-node" key={label}>
                      <b>{label}</b>
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
                <div className="arch-rail">
                  <span className="tag">C++ engine</span>
                  <span className="tag">Rust engine</span>
                  <span className="tag">in progress</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="next-case">
            <div>
              <span>Back to the production work</span>
              <strong>Six comparison systems</strong>
            </div>
            <Link className="text-link" href="/systems">
              Systems index
              <ArrowUpRight width={13} height={13} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
