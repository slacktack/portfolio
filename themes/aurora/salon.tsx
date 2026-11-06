"use client";

import Link from "next/link";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { CacheKeyLab } from "@/components/lab-cache-key";
import { DeadlineLab } from "@/components/lab-deadline";
import { IdentityLab } from "@/components/lab-identity";
import { LogStreamLab } from "@/components/lab-logs";
import { MemcachedLab } from "@/components/lab-memcached";
import { LoadBalancerDemo } from "@/components/load-balancer-demo";
import { getProject, getSystem, labItems, stage, type StageItem } from "@/lib/site";
import { Arrow, Aurora, Label, Ribbon, pad } from "./ui";

const cases: Record<string, string> = { "bh-flights": "flights", "bh-hotels": "hotels", "bh-food": "food", "bh-grocery": "grocery" };
const span: Record<string, number> = {
  "bh-flights": 7,
  "bh-hotels": 5,
  "bh-food": 5,
  "bh-grocery": 7,
  "train-tracker": 7,
  "flight-tracker": 5,
  "chauka-cricket": 4,
  "touchline-football": 4,
  "khelo-football": 4,
  "k8-wizard": 5,
  "dream-journal": 4,
  "wardrobe-ai": 3,
};

function Frame({ item, i }: { item: StageItem; i: number }) {
  const vid = useRef<HTMLVideoElement>(null);
  const box = useRef<HTMLElement>(null);
  const project = getProject(item.slug);
  const sys = cases[item.slug] ? getSystem(cases[item.slug]) : undefined;
  const portrait = item.slug === "wardrobe-ai";

  useEffect(() => {
    const v = vid.current;
    const b = box.current;
    if (!v || !b) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const play = () => {
      if (reduce) return;
      v.preload = "auto";
      v.play().catch(() => {});
    };
    const stop = () => v.pause();
    if (fine) {
      b.addEventListener("pointerenter", play);
      b.addEventListener("pointerleave", stop);
      b.addEventListener("focusin", play);
      b.addEventListener("focusout", stop);
    }
    // touch screens: play whichever frame is mostly on screen
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting && !fine ? play() : stop())), { threshold: 0.7 });
    io.observe(b);
    return () => {
      io.disconnect();
      b.removeEventListener("pointerenter", play);
      b.removeEventListener("pointerleave", stop);
      b.removeEventListener("focusin", play);
      b.removeEventListener("focusout", stop);
    };
  }, []);

  return (
    <figure
      ref={box}
      className="au-hang"
      data-portrait={portrait ? "" : undefined}
      data-au
      style={{ "--au-span": span[item.slug] ?? 4, "--au-i": i, "--au-tilt": `${((i * 37) % 5) - 2}` } as CSSProperties}
    >
      <a href={item.href} target="_blank" rel="noreferrer" className="au-mat" data-cursor="Visit" aria-label={`${item.title}, open the live site`}>
        <span className="au-canvas">
          <video ref={vid} src={item.video} poster={item.poster} muted loop playsInline preload="none" aria-hidden="true" />
          <span className="au-duo" aria-hidden="true" />
          <span className="au-play" aria-hidden="true">
            <i />
          </span>
        </span>
      </a>
      <figcaption className="au-cap">
        <span className="au-cap-no">{pad(i + 1)}</span>
        <span className="au-cap-t">
          <b>{item.title}</b>
          {project ? <span>, {project.year}</span> : null}
        </span>
        <span className="au-cap-m">{project ? project.stack.slice(0, 3).join(", ") : item.tag}</span>
        <span className="au-cap-d">{item.tagline}</span>
        <span className="au-cap-a">
          <a href={item.href} target="_blank" rel="noreferrer">
            Live <Arrow up />
          </a>
          {sys ? (
            <Link href={`/systems/${sys.slug}`}>
              Exhibit {sys.index} <Arrow />
            </Link>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}

export function Salon() {
  const work = stage.filter((s) => s.tag === "Buyhatke");
  const after = stage.filter((s) => s.tag !== "Buyhatke");
  return (
    <>
      <section className="au-salon-head">
        <Aurora tone="lime" />
        <div className="au-salon-in">
          <Label a="Room 02" b="Salon" />
          <h1>
            Hung close, <em>played on approach.</em>
          </h1>
          <p>
            {stage.length} screen recordings of shipped work, framed and captioned. Hover a frame to play it. Every caption links to the live site.
          </p>
        </div>
      </section>
      <section className="au-wallroom" data-wall="a" aria-labelledby="au-wall-a">
        <div className="au-wallsign" data-au>
          <Label a="Wall A" b="Buyhatke, in production" />
          <h2 id="au-wall-a">The day job.</h2>
        </div>
        <div className="au-salon">
          {work.map((s, i) => (
            <Frame key={s.slug} item={s} i={i} />
          ))}
        </div>
      </section>
      <section className="au-wallroom" data-wall="b" aria-labelledby="au-wall-b">
        <div className="au-wallsign" data-au>
          <Label a="Wall B" b="After hours" />
          <h2 id="au-wall-b">Built for the love of it.</h2>
        </div>
        <div className="au-salon">
          {after.map((s, i) => (
            <Frame key={s.slug} item={s} i={i + work.length} />
          ))}
        </div>
        <Link href="/lab" className="au-onward" data-cursor="Bench">
          <Label a="Onward" b="Room 03" />
          <b>
            The bench, where the mechanisms are <em>broken on purpose.</em>
          </b>
          <Arrow />
        </Link>
      </section>
    </>
  );
}

type Piece = { slug: string; a: string; t: ReactNode; note: string; demo: ReactNode; src?: string };

const pieces: Piece[] = [
  {
    slug: "cache-key",
    a: "Flights · cache design",
    t: "Change one thing. Watch the cache decide.",
    note: "A flight search is expensive. Refining it should not be. The controls that change the answer miss the cache; the ones that only reshape it never leave the building.",
    demo: <CacheKeyLab />,
    src: "flights",
  },
  {
    slug: "deadlines",
    a: "Hotels · stragglers",
    t: (
      <>
        Average latency is a <em>liar.</em>
      </>
    ),
    note: "Eight partners race. One of them hangs. Drag the time budget and see what the user waits for, with and without a deadline.",
    demo: <DeadlineLab />,
    src: "hotels",
  },
  {
    slug: "identity",
    a: "Hotels · identity",
    t: (
      <>
        Same name is not the <em>same hotel.</em>
      </>
    ),
    note: "Seven partner records around one real hotel, two of them impostors. Move the gates and find the setting that merges the truth and nothing else.",
    demo: <IdentityLab />,
    src: "hotels",
  },
  {
    slug: "logs",
    a: "Observability · alerting",
    t: (
      <>
        Silence is a <em>signal.</em>
      </>
    ),
    note: "A live stream of service logs with threshold, rate and absence alerts. Kill a service and see how long it takes to notice.",
    demo: <LogStreamLab />,
    src: "observability",
  },
  {
    slug: "memcached",
    a: "Systems · from scratch",
    t: (
      <>
        Memcached, <em>rebuilt.</em>
      </>
    ),
    note: "Written in C++ to understand how a cache really works. Type commands into the browser simulation of it and watch keys expire.",
    demo: <MemcachedLab />,
  },
  {
    slug: "load-balancer",
    a: "Build · Go load balancer",
    t: (
      <>
        Weighted routing you can <em>break.</em>
      </>
    ),
    note: "A small Go service with weighted routing, health checks, circuit breakers and sticky sessions. The demo runs the routing logic in your browser, so you can kill a node and watch the next request fail over. Simulation only; state resets on reload.",
    demo: <LoadBalancerDemo />,
  },
  {
    slug: "vortex-vault",
    a: "Build · VortexVault",
    t: (
      <>
        One vector database. <em>Two runtimes.</em>
      </>
    ),
    note: "A dual C++ / Rust vector database built to compare both runtimes against the same storage format and the same benchmark. Still in progress.",
    demo: <Vortex />,
  },
];

function Vortex() {
  const steps = [
    ["Client", "insert / query / delete"],
    ["WAL", "durable append + replay"],
    ["Memtable", "mutable in-memory index"],
    ["Segment", "immutable on-disk index"],
    ["Compaction", "merge + tombstone cleanup"],
  ];
  return (
    <div className="au-vortex">
      <div className="au-vortex-copy">
        <p>
          Most vector database projects pick a language and inherit its assumptions. VortexVault implements the same engine twice, once in C++ and
          once in Rust, behind a shared segment format and a shared benchmark harness.
        </p>
        <p>
          The interesting part is not the ANN index. It is the seam: WAL replay, memtable flushes, segment compaction, and the point where a query
          has to touch both in-memory and on-disk state.
        </p>
      </div>
      <ol className="au-ladder au-ladder-sm">
        {steps.map(([l, d], i) => (
          <li key={l} style={{ "--au-i": i, "--au-k": i / (steps.length - 1) } as CSSProperties}>
            <span className="au-ladder-chip" />
            <Label a={`Step ${pad(i + 1)}`} b={l} />
            <p>{d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Bench() {
  return (
    <>
      <section className="au-bench-head">
        <Aurora tone="blue" />
        <Ribbon className="au-bench-ribbon" d="M-40 120 C 320 520, 640 40, 980 300 S 1320 520, 1500 260" />
        <div className="au-bench-in">
          <Label a="Room 03" b="Bench" />
          <h1>
            Small systems, <em>strange constraints.</em>
          </h1>
          <p>
            The mechanisms behind the exhibits, rebuilt small enough to hold in one hand and break on purpose. Every piece runs in your browser.
            Simulations are labelled as simulations.
          </p>
        </div>
      </section>
      <div className="au-drawer">
        <nav className="au-drawer-nav" aria-label="Bench pieces">
          <Label a="Bench" b={`${pad(labItems.length)} pieces`} />
          <ol>
            {labItems.map((l, i) => (
              <li key={l.slug}>
                <a href={`#${l.slug}`}>
                  <span>3.{i + 1}</span>
                  {l.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="au-drawer-body">
          {pieces.map((p, i) => {
            const item = labItems.find((l) => l.slug === p.slug);
            const sys = p.src ? getSystem(p.src) : undefined;
            return (
              <section key={p.slug} id={p.slug} className="au-piece" aria-labelledby={`au-p-${p.slug}`}>
                <header className="au-piece-head" data-au>
                  <span className="au-no">3.{i + 1}</span>
                  <Label a={p.a} b={item?.year ?? "Interactive"} />
                  <h2 id={`au-p-${p.slug}`}>{p.t}</h2>
                  <p>{p.note}</p>
                  {sys ? (
                    <Link href={`/systems/${sys.slug}`} className="au-piece-src">
                      From exhibit {sys.index}, {sys.title} <Arrow />
                    </Link>
                  ) : null}
                </header>
                <div className="au-mount" data-au="page">
                  {p.demo}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
