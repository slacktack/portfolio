"use client";

import { useState, type ReactNode } from "react";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { labItems } from "@/lib/site";
import { Arrow, Head, Panel, Plate, Tabs } from "./ui";

type Drill = { k: string; title: string; note: string; demo: () => ReactNode; quest?: string };

const lbCards = [
  ["Weighted routing", "Each healthy node gets a share proportional to its weight. Set a weight to zero to drain it."],
  ["Health + circuit breaker", "Three failed checks open the circuit. Traffic stops landing on the node before users notice."],
  ["Sticky sessions", "When enabled, one client keeps landing on the same node until it disappears from the healthy set."],
  ["Observability", "Per-node request counts, shares, health state, and combined weight stay visible while the system changes."],
];

const vvNodes = [
  ["Client", "insert / query / delete"],
  ["WAL", "durable append + replay"],
  ["Memtable", "mutable in-memory index"],
  ["Segment", "immutable on-disk index"],
  ["Compaction", "merge + tombstone cleanup"],
];

function Vortex() {
  return (
    <div className="fg-split">
      <div className="fg-prose">
        <p>
          Most vector database projects pick a language and inherit its assumptions. VortexVault implements the same engine twice — once
          in C++, once in Rust — behind a shared segment format and a shared benchmark harness.
        </p>
        <p>
          The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where
          a query has to touch both in-memory and on-disk state. Keeping those semantics identical across two runtimes is the actual
          project.
        </p>
        <p>Still in progress. The benchmark reports latency, recall, and memory footprint for both implementations against the same workload.</p>
      </div>
      <ol className="fg-route is-col" style={{ "--fg-cols": vvNodes.length } as React.CSSProperties}>
        {vvNodes.map(([a, b], i) => (
          <li key={a}>
            <span className="fg-route-n">{String(i + 1).padStart(2, "0")}</span>
            <b>{a}</b>
            <span>{b}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

const drills: Record<string, Drill> = {
  "cache-key": {
    k: "Flights · cache design",
    title: "Change one thing. Watch the cache decide.",
    note: "A flight search is expensive. Refining it should not be. Tap the controls: the ones that change the answer miss the cache, the ones that only reshape it never leave the building.",
    demo: () => <CacheKeyLab />,
    quest: "flights",
  },
  deadlines: {
    k: "Hotels · stragglers",
    title: "Average latency is a liar.",
    note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.",
    demo: () => <DeadlineLab />,
    quest: "hotels",
  },
  identity: {
    k: "Hotels · identity",
    title: "Same name is not the same hotel.",
    note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.",
    demo: () => <IdentityLab />,
    quest: "hotels",
  },
  logs: {
    k: "Observability · alerting",
    title: "Silence is a signal.",
    note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.",
    demo: () => <LogStreamLab />,
    quest: "observability",
  },
  memcached: {
    k: "Systems · from scratch",
    title: "Memcached, rebuilt.",
    note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire.",
    demo: () => <MemcachedLab />,
  },
  "load-balancer": {
    k: "Build · Go load balancer",
    title: "Weighted routing you can break.",
    note: "A small Go service with weighted routing, health checks, circuit breakers, and sticky sessions. The demo runs the routing logic in your browser so you can kill a node and watch the next request fail over.",
    demo: () => (
      <>
        <LoadBalancerDemo />
        <ul className="fg-phases is-four">
          {lbCards.map(([a, b]) => (
            <li key={a}>
              <b>{a}</b>
              <p>{b}</p>
            </li>
          ))}
        </ul>
        <p className="fg-dim fg-small">Simulation only · routing state resets on reload</p>
      </>
    ),
  },
  "vortex-vault": {
    k: "Build · VortexVault",
    title: "One vector database. Two runtimes.",
    note: "A dual C++ / Rust vector database built to compare the ergonomics and performance of both runtimes against the same storage format and the same benchmark.",
    demo: () => <Vortex />,
  },
};

export function Training() {
  const [cur, setCur] = useState(() => {
    const h = window.location.hash.slice(1);
    return labItems.some((l) => l.slug === h) ? h : labItems[0].slug;
  });
  const idx = labItems.findIndex((l) => l.slug === cur);
  const item = labItems[idx];
  const d = drills[cur];

  const select = (id: string) => {
    setCur(id);
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="fg-page">
      <Panel className="fg-slam" label="Training ground">
        <Head
          as="h1"
          k={`Training ground · ${labItems.length} drills`}
          title="Small systems, strange constraints."
          note="Experiments built to understand a mechanism, not to ship a roadmap. Pick a drill; every one of them is live and allowed to break."
        />
        <Tabs label="Drills" active={cur} onSelect={select} items={labItems.map((l) => ({ id: l.slug, label: l.title.replace("Go enterprise ", "") }))} />

        <div className="fg-drill" role="tabpanel" key={cur}>
          <div className="fg-drill-head">
            <div>
              <span className="fg-k">
                Drill {String(idx + 1).padStart(2, "0")} · {d.k}
              </span>
              <h2 className="fg-title">{d.title}</h2>
              <p className="fg-note">{d.note}</p>
            </div>
            <dl className="fg-meta">
              <div>
                <dt>Drill</dt>
                <dd>{item.title}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{item.year}</dd>
              </div>
              <div>
                <dt>Teaches</dt>
                <dd>{item.detail}</dd>
              </div>
            </dl>
          </div>
          <div className="fg-demo">{d.demo()}</div>
          <div className="fg-actions">
            {idx < labItems.length - 1 ? (
              <Plate onClick={() => select(labItems[idx + 1].slug)}>
                Next drill <Arrow />
              </Plate>
            ) : (
              <Plate href="/systems">
                Back to the quests <Arrow />
              </Plate>
            )}
            {d.quest ? (
              <Plate href={`/systems/${d.quest}`} tone="ghost">
                The quest behind it
              </Plate>
            ) : null}
          </div>
        </div>
      </Panel>
    </div>
  );
}
