"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { projects, stage, systems } from "@/lib/site";
import { Arrow, Head, Out, Panel, Plate, Tabs } from "./ui";

const systemFor: Record<string, string> = { "bh-flights": "flights", "bh-hotels": "hotels", "bh-food": "food", "bh-grocery": "grocery" };

export function Loadout() {
  const [filter, setFilter] = useState("all");
  const items = stage.filter((s) => filter === "all" || (filter === "guild" ? s.tag === "Buyhatke" : s.tag !== "Buyhatke"));
  const [sel, setSel] = useState(stage[0].slug);
  const item = stage.find((s) => s.slug === sel) ?? stage[0];
  const project = projects.find((p) => p.slug === item.slug);
  const quest = systems.find((s) => s.slug === systemFor[item.slug]);
  const inspect = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [motionOk] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const pick = (slug: string) => {
    setSel(slug);
    if (window.innerWidth < 900) inspect.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="fg-page">
      <Panel className="fg-slam" label="Loadout">
        <div className="fg-board-head">
          <Head
            as="h1"
            k={`Loadout · ${stage.length} items`}
            title="Everything I have shipped, ready to equip."
            note="Select an item to inspect the real screen recording. Launch opens the live build."
          />
          <Tabs
            label="Filter loadout"
            active={filter}
            onSelect={setFilter}
            items={[
              { id: "all", label: "All", count: stage.length },
              { id: "guild", label: "Buyhatke", count: stage.filter((s) => s.tag === "Buyhatke").length },
              { id: "solo", label: "After hours", count: stage.filter((s) => s.tag !== "Buyhatke").length },
            ]}
          />
        </div>

        <div className="fg-loadout">
          <div className="fg-inspect" ref={inspect} aria-live="polite">
            <div className="fg-screen" key={item.slug}>
              <video
                ref={video}
                src={item.video}
                poster={item.poster}
                autoPlay={motionOk}
                muted
                loop
                playsInline
                controls={!motionOk}
                preload="metadata"
                aria-label={`Screen recording of ${item.title}`}
              />
              <span className="fg-screen-tag">{item.tag}</span>
            </div>
            <div className="fg-inspect-body">
              <span className="fg-k">{project?.category ?? (quest ? `Quest ${quest.index} · ${quest.category}` : item.tag)}</span>
              <h2 className="fg-inspect-title">{item.title}</h2>
              <p className="fg-promise">{item.tagline}</p>
              {project ? <p className="fg-lede">{project.description}</p> : quest ? <p className="fg-lede">{quest.summary}</p> : null}
              <dl className="fg-meta is-row">
                {project ? (
                  <>
                    <div>
                      <dt>Power</dt>
                      <dd className="fg-amber">{project.highlight}</dd>
                    </div>
                    <div>
                      <dt>Forged</dt>
                      <dd>{project.year}</dd>
                    </div>
                  </>
                ) : quest ? (
                  <div>
                    <dt>Power</dt>
                    <dd className="fg-amber">
                      {quest.metrics[0].value} {quest.metrics[0].label}
                    </dd>
                  </div>
                ) : null}
              </dl>
              {project ? (
                <div className="fg-chips">
                  {project.stack.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              ) : null}
              {project?.note ? <p className="fg-dim fg-small">{project.note}</p> : null}
              <div className="fg-actions">
                <Plate href={item.href} external>
                  Launch <Out />
                </Plate>
                {quest ? (
                  <Plate href={`/systems/${quest.slug}`} tone="ghost">
                    Read the quest <Arrow />
                  </Plate>
                ) : null}
              </div>
            </div>
          </div>

          <ul className="fg-inv" role="listbox" aria-label="Inventory">
            {items.map((s, i) => (
              <li key={s.slug} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={s.slug === item.slug}
                  className={`fg-slot-item fg-spark${s.slug === item.slug ? " on" : ""}`}
                  onClick={() => pick(s.slug)}
                >
                  <span className="fg-slot-img">
                    <Image src={s.poster} alt="" fill sizes="(max-width: 900px) 45vw, 200px" />
                  </span>
                  <span className="fg-slot-n">{String(i + 1).padStart(2, "0")}</span>
                  <b>{s.title}</b>
                  <small>{s.tag}</small>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    </div>
  );
}
