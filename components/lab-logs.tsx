"use client";

import { useEffect, useRef, useState } from "react";

const services = ["api-gateway", "flights-worker", "hotels-sync", "food-ingest", "categorizer", "alerts-cron", "cabs-api", "mapper"];
const messages = [
  "request ok",
  "cache hit",
  "poll batch complete",
  "upstream slow",
  "flush complete",
  "retry scheduled",
  "mapped hotel",
  "deadline settled",
];

type Line = { id: number; svc: string; lvl: "info" | "warn" | "err"; msg: string; t: string };

export function LogStreamLab() {
  const [lines, setLines] = useState<Line[]>([]);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState<"all" | "warn" | "err">("all");
  const [svc, setSvc] = useState<string | null>(null);
  const [dead, setDead] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [count, setCount] = useState(0);
  const last = useRef<Record<string, number>>({});
  const id = useRef(0);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      const pool = services.filter((s) => s !== dead);
      const s = pool[Math.floor(Math.random() * pool.length)];
      const r = Math.random();
      const lvl: Line["lvl"] = r > 0.93 ? "err" : r > 0.8 ? "warn" : "info";
      last.current[s] = now;
      const line: Line = {
        id: (id.current += 1),
        svc: s,
        lvl,
        msg: messages[Math.floor(Math.random() * messages.length)],
        t: new Date(now).toISOString().slice(11, 23),
      };
      setLines((l) => [line, ...l].slice(0, 40));
      setCount((c) => c + 1);
      if (dead && now - (last.current[dead] ?? now) > 4000) {
        const text = `ABSENCE · ${dead} has been silent for 4s`;
        setAlerts((a) => (a[0] === text ? a : [text, ...a].slice(0, 3)));
      }
    }, 140);
    return () => window.clearInterval(timer);
  }, [paused, dead]);

  const shown = lines.filter((l) => (level === "all" ? true : level === "warn" ? l.lvl !== "info" : l.lvl === "err")).filter((l) => !svc || l.svc === svc);
  const errRate = lines.length ? Math.round((lines.filter((l) => l.lvl === "err").length / lines.length) * 100) : 0;

  return (
    <div className="lab2">
      <div className="lab2-controls">
        <div className="lab2-chips">
          {(["all", "warn", "err"] as const).map((l) => (
            <button key={l} className={level === l ? "is-on" : ""} onClick={() => setLevel(l)}>
              {l === "all" ? "all levels" : l === "warn" ? "warn+" : "errors"}
            </button>
          ))}
          <button onClick={() => setPaused(!paused)}>{paused ? "resume stream" : "pause"}</button>
          <button
            className={dead ? "is-on" : ""}
            onClick={() => {
              setAlerts([]);
              last.current = {};
              setDead(dead ? null : "flights-worker");
            }}
          >
            {dead ? "revive flights-worker" : "kill flights-worker"}
          </button>
        </div>
        <div className="lab2-chips">
          {services.map((s) => (
            <button key={s} className={svc === s ? "is-on" : ""} onClick={() => setSvc(svc === s ? null : s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="lab2-grid">
        <div className="lab2-terminal" aria-live="off">
          {shown.slice(0, 16).map((l) => (
            <p key={l.id} data-lvl={l.lvl}>
              <time>{l.t}</time>
              <b>{l.svc}</b>
              {l.msg}
            </p>
          ))}
        </div>
        <div className="lab2-panel">
          <span className="lab2-k">Stream · live</span>
          <div className="lab2-meter">
            <div>
              <b>{count.toLocaleString("en-IN")}</b>
              <span>events seen</span>
            </div>
            <div>
              <b>{errRate}%</b>
              <span>error rate</span>
            </div>
            <div>
              <b>{services.length - (dead ? 1 : 0)}/{services.length}</b>
              <span>services talking</span>
            </div>
          </div>
          <div className="lab2-alerts">
            {alerts.length ? (
              alerts.map((a) => (
                <p key={a} className="fire">
                  {a}
                </p>
              ))
            ) : (
              <p>No alerts firing. Kill a service and wait four seconds.</p>
            )}
          </div>
          <p className="lab2-note">
            Silence is a signal too. Threshold, rate and absence rules watch the stream, so a service that goes quiet gets noticed as fast as one that gets loud. The real thing ingests 12.5B events across 201 streams.
          </p>
        </div>
      </div>
    </div>
  );
}
