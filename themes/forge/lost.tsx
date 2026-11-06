"use client";

import Link from "next/link";
import { systems } from "@/lib/site";
import { Arrow, Panel, Plate } from "./ui";

export function Lost({ path }: { path: string }) {
  return (
    <div className="fg-page fg-lost">
      <Panel className="fg-slam" label="Off the map">
        <span className="fg-k">Error 404 · Area not found</span>
        <h1 className="fg-mega is-lost">Off the map.</h1>
        <p className="fg-lede">
          There is no zone at <code>{path.split("?")[0]}</code>. The fog stays down here. Head back to the lobby or pick up a quest.
        </p>
        <div className="fg-actions">
          <Plate href="/">
            Return to lobby <Arrow />
          </Plate>
          <Plate href="/systems" tone="ghost">
            Quest board
          </Plate>
        </div>
        <ul className="fg-lost-list" aria-label="Quests">
          {systems.slice(0, 4).map((s) => (
            <li key={s.slug}>
              <Link href={`/systems/${s.slug}`}>
                <span>{s.index}</span> {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
