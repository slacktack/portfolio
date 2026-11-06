"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SystemArtifact } from "@/components/artifacts";
import { getNote, getProject, getSystem, labItems, principles, profile } from "@/lib/site";
import { labSystem, stageBy, systemStage } from "./data";

export type Exhibit =
  | { type: "system"; slug: string }
  | { type: "project"; slug: string }
  | { type: "lab"; slug: string }
  | { type: "note"; slug: string }
  | { type: "curator" }
  | { type: "missing"; path: string };

export type Fig = { key: string; caption: string; node: ReactNode; wide?: boolean };

export const exhibitKey = (ex: Exhibit | null) => (!ex ? "idle" : "slug" in ex ? `${ex.type}:${ex.slug}` : ex.type);

const reduced = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

function Plate({ src, alt, fit = "contain" }: { src: string; alt: string; fit?: "contain" | "cover" }) {
  const [ready, setReady] = useState(false);
  return (
    <div className="nt-plate" data-ready={ready || undefined} data-fit={fit}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} decoding="async" onLoad={() => setReady(true)} />
      <span className="nt-develop" aria-hidden="true">Developing plate</span>
    </div>
  );
}

function Reel({ video, poster, title }: { video: string; poster: string; title: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const v = ref.current;
    if (!v || reduced()) return;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else {
      v.pause();
      setPlaying(false);
    }
  };
  return (
    <div className="nt-plate nt-reel" data-ready={ready || undefined}>
      <video ref={ref} src={video} poster={poster} muted loop playsInline preload="metadata" onLoadedData={() => setReady(true)} aria-label={`Screen recording: ${title}`} />
      <span className="nt-develop" aria-hidden="true">Threading the reel</span>
      <button type="button" className="nt-reel-btn" onClick={toggle} aria-pressed={playing} data-cursor={playing ? "Pause" : "Play"}>
        <i aria-hidden="true" data-play={playing || undefined} />
        {playing ? "Pause reel" : "Play reel"}
      </button>
    </div>
  );
}

function ArtifactBox({ kind }: { kind: Parameters<typeof SystemArtifact>[0]["kind"] }) {
  return (
    <div className="nt-art">
      <SystemArtifact kind={kind} />
    </div>
  );
}

function Flow({ nodes, rail }: { nodes: { label: string; detail: string }[]; rail?: string[] }) {
  return (
    <div className="nt-flow">
      <ol>
        {nodes.map((n, i) => (
          <li key={n.label} style={{ "--nt-i": i } as React.CSSProperties}>
            <b>{String(i + 1).padStart(2, "0")}</b>
            <strong>{n.label}</strong>
            <span>{n.detail}</span>
          </li>
        ))}
      </ol>
      {rail && (
        <ul className="nt-flow-rail">
          {rail.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Readout({ items }: { items: { value: string; label: string; note?: string }[] }) {
  return (
    <div className="nt-readout" data-count={items.length}>
      {items.map((m, i) => (
        <div key={m.label} style={{ "--nt-i": i } as React.CSSProperties}>
          <b>{m.value}</b>
          <span>{m.label}</span>
          {m.note && <small>{m.note}</small>}
        </div>
      ))}
    </div>
  );
}

function Card({ k, title, body, foot }: { k: string; title: ReactNode; body?: ReactNode; foot?: ReactNode }) {
  return (
    <div className="nt-card">
      <span className="nt-card-k">{k}</span>
      <h3 className="nt-card-t">{title}</h3>
      {body && <div className="nt-card-b">{body}</div>}
      {foot && <span className="nt-card-f">{foot}</span>}
    </div>
  );
}

const firstLine = (s: string) => {
  const m = s.match(/^(.{20,180}?[.!?])(\s|$)/);
  return m ? m[1] : s.slice(0, 160);
};

export function figuresFor(ex: Exhibit | null): Fig[] {
  if (!ex) return [];
  if (ex.type === "system") {
    const s = getSystem(ex.slug);
    if (!s) return [];
    const reel = stageBy(systemStage[s.slug]);
    const out: Fig[] = [{ key: "art", caption: `Mechanism · ${s.shortTitle}`, node: <ArtifactBox kind={s.artifact} /> }];
    if (reel) out.push({ key: "reel", caption: `Recording · ${reel.tagline}`, node: <Reel video={reel.video} poster={reel.poster} title={reel.title} /> });
    out.push({ key: "flow", caption: "Architecture · request path", node: <Flow nodes={s.architecture} rail={s.rail} /> });
    out.push({ key: "read", caption: "Readout · measured in production", node: <Readout items={s.metrics} /> });
    return out;
  }
  if (ex.type === "project") {
    const p = getProject(ex.slug);
    if (!p) return [];
    const reel = stageBy(p.slug);
    const out: Fig[] = [];
    if (reel) out.push({ key: "reel", caption: `Recording · ${p.title}, in use`, node: <Reel video={reel.video} poster={reel.poster} title={p.title} /> });
    if (!reel || reel.poster !== p.image) out.push({ key: "shot", caption: `Plate · ${p.title}`, node: <Plate src={p.image} alt={`${p.title} screenshot`} /> });
    if (p.tall) out.push({ key: "tall", caption: `Long plate · ${p.title}, full page`, node: <Plate src={p.tall} alt={`${p.title}, full page`} fit="cover" /> });
    out.push({
      key: "card",
      caption: `Label · ${p.highlight}`,
      node: <Card k={`${p.category} · ${p.year}`} title={p.tagline} body={<p>{p.note}</p>} foot={p.stack.join(" · ")} />,
    });
    return out;
  }
  if (ex.type === "lab") {
    const l = labItems.find((x) => x.slug === ex.slug);
    if (!l) return [];
    const out: Fig[] = [
      {
        key: "card",
        caption: `Instrument · ${l.title}`,
        node: <Card k={`Lab · ${l.year}`} title={l.title} body={<p>{l.detail}.</p>} foot="The live instrument is on the bench below" />,
      },
    ];
    const src = labSystem[l.slug];
    if (src) out.push({ key: "art", caption: `Source exhibit · ${src.title}`, node: <ArtifactBox kind={src.artifact} /> });
    if (l.slug === "vortex-vault")
      out.push({
        key: "flow",
        caption: "Write and read path · shared by both engines",
        node: (
          <Flow
            nodes={[
              { label: "Client", detail: "insert / query / delete" },
              { label: "WAL", detail: "durable append + replay" },
              { label: "Memtable", detail: "mutable in-memory index" },
              { label: "Segment", detail: "immutable on-disk index" },
              { label: "Compaction", detail: "merge + tombstone cleanup" },
            ]}
            rail={["C++ engine", "Rust engine", "in progress"]}
          />
        ),
      });
    return out;
  }
  if (ex.type === "note") {
    const n = getNote(ex.slug);
    if (!n) return [];
    return n.sections.map((sec, i) => ({
      key: `sec-${i}`,
      caption: sec.heading ?? "Opening",
      node: (
        <Card
          k={`${n.title} · part ${String(i + 1).padStart(2, "0")}`}
          title={sec.heading ?? n.title}
          body={<p>{sec.quote ?? firstLine(sec.body[0] ?? n.dek)}</p>}
          foot={`${n.date} · ${n.readTime}`}
        />
      ),
    }));
  }
  if (ex.type === "curator") {
    return [
      {
        key: "id",
        caption: "Curator card",
        node: (
          <div className="nt-id">
            <span className="nt-id-k">Curator on the night shift</span>
            <h3>{profile.name}</h3>
            <dl>
              <div>
                <dt>Role</dt>
                <dd>{profile.role}</dd>
              </div>
              <div>
                <dt>Based</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{profile.availability}</dd>
              </div>
              <div>
                <dt>Write</dt>
                <dd>{profile.email}</dd>
              </div>
            </dl>
            <p>{profile.tagline}</p>
          </div>
        ),
      },
      ...principles.map((p) => ({ key: `pr-${p.num}`, caption: `Principle ${p.num}`, node: <Card k={`House rule ${p.num}`} title={p.title} body={<p>{p.body}</p>} /> })),
    ];
  }
  return [
    {
      key: "void",
      caption: "Empty plinth",
      node: <Card k="Fig. 404" title="Nothing on this plinth." body={<p>The machine looked for {ex.path} and found only a dust sheet.</p>} />,
    },
  ];
}
