"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import type { Specimen } from "./data";

type P = { s: Specimen; big?: boolean };

function useTimers() {
  const ids = useRef<number[]>([]);
  useEffect(() => () => ids.current.forEach((i) => window.clearTimeout(i)), []);
  return {
    after(ms: number, f: () => void) {
      ids.current.push(window.setTimeout(f, ms));
    },
    clear() {
      ids.current.forEach((i) => window.clearTimeout(i));
      ids.current = [];
    },
  };
}

function Pot({ children, status, controls, name, big, className = "" }: { children: ReactNode; status: string; controls: ReactNode; name: string; big?: boolean; className?: string }) {
  return (
    <div className={`mo-pot ${className}`} data-big={big ? "" : undefined} role="group" aria-label={`${name}, playable illustration`}>
      <div className="mo-pot-stage" aria-hidden="true">
        {children}
      </div>
      <div className="mo-pot-ctl">{controls}</div>
      <p className="mo-pot-status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

const v = (o: Record<string, string | number>) => o as CSSProperties;

function Cache({ s, big }: P) {
  const chips = s.variant === "key"
    ? ([["Re-sort", "hit"], ["Filter stops", "hit"], ["New route", "miss"]] as const)
    : ([["Sort by price", "hit"], ["Non-stop only", "hit"], ["Change date", "miss"]] as const);
  const [shot, setShot] = useState<{ r: "hit" | "miss"; n: number } | null>(null);
  const [tally, setTally] = useState({ hit: 0, miss: 0 });
  const fire = (r: "hit" | "miss") => {
    setShot((p) => ({ r, n: (p?.n ?? 0) + 1 }));
    setTally((t) => ({ ...t, [r]: t[r] + 1 }));
  };
  const status = shot
    ? shot.r === "hit"
      ? `Hit. Answered from the cache, no upstream call. ${tally.hit} hit · ${tally.miss} miss`
      : `Miss. The key changed, so it goes upstream. ${tally.hit} hit · ${tally.miss} miss`
    : "Refine the search. Only what changes the answer leaves the building.";
  return (
    <Pot
      big={big}
      name={s.common}
      status={status}
      controls={chips.map(([l, r]) => (
        <button key={l} type="button" className="mo-pb" data-r={r} onClick={() => fire(r)}>
          {l}
        </button>
      ))}
    >
      <div className="mo-cache">
        <span className="mo-node">you</span>
        <span className="mo-node mo-node-c" data-flash={shot?.r === "hit" ? shot.n % 2 : undefined}>
          cache
        </span>
        <span className="mo-node mo-node-u" data-flash={shot?.r === "miss" ? shot.n % 2 : undefined}>
          upstream
        </span>
        <i className="mo-track" />
        {shot && <b key={shot.n} className="mo-seed" data-r={shot.r} />}
      </div>
    </Pot>
  );
}

const scatter = [
  [-30, -18], [-8, -26], [20, -20], [32, 2], [18, 22], [-12, 24], [-34, 8],
];

function Merge({ s, big }: P) {
  const imp = s.variant === "impostors";
  const [on, setOn] = useState(false);
  return (
    <Pot
      big={big}
      name={s.common}
      status={on ? (imp ? "Five records merged. The two look-alikes stayed out." : "Seven partner records, one canonical hotel.") : imp ? "Same name is not the same hotel. Resolve them." : "Seven partners describe one hotel seven ways."}
      controls={
        <button type="button" className="mo-pb" aria-pressed={on} onClick={() => setOn((x) => !x)}>
          {on ? "Scatter again" : "Resolve identity"}
        </button>
      }
    >
      <div className="mo-merge" data-on={on ? "" : undefined}>
        {scatter.map(([x, y], i) => (
          <i key={i} className="mo-rec" data-imp={imp && (i === 2 || i === 5) ? "" : undefined} style={v({ "--dx": x, "--dy": y, "--d": i })} />
        ))}
        <b className="mo-canon">1</b>
      </div>
    </Pot>
  );
}

const fanBars = [62, 48, 81, 55, 70, 38, 66];

function Fanout({ s, big }: P) {
  const rides = s.variant === "rides";
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const t = useTimers();
  const go = () => {
    t.clear();
    setDone(false);
    setRun((r) => r + 1);
    t.after(1500, () => setDone(true));
  };
  const best = fanBars.indexOf(Math.min(...fanBars));
  return (
    <Pot
      big={big}
      name={s.common}
      status={!run ? (rides ? "One ride, every app. Ask them all at once." : "One kitchen, every app. Ask them all at once.") : done ? "Every answer is in. The cheapest is ranked first, fees counted." : "Fanning out…"}
      controls={
        <button type="button" className="mo-pb" onClick={go}>
          {rides ? "Ask every ride app" : "Ask every app"}
        </button>
      }
    >
      <div className="mo-fan" key={run} data-run={run ? "" : undefined} data-done={done ? "" : undefined}>
        <span className="mo-fan-hub" />
        {fanBars.map((b, i) => (
          <span key={i} className="mo-fan-arm" data-best={i === best ? "" : undefined} style={v({ "--a": (i - 3) * 17, "--d": i, "--b": b })}>
            <i />
            <b />
          </span>
        ))}
      </div>
    </Pot>
  );
}

const packs = [
  ["500 ml", 0], ["1 L", 1], ["500 ml", 0], ["200 ml × 6", 2], ["1 L", 1], ["500 ml", 0],
] as const;

function Cluster({ s, big }: P) {
  const [by, setBy] = useState<"name" | "pack">("name");
  const col = [0, 0, 0];
  return (
    <Pot
      big={big}
      name={s.common}
      status={by === "name" ? "Matched by name: six “Toned milk” rows, three different products." : "Matched by pack size: three honest clusters, comparable prices."}
      controls={
        <>
          <button type="button" className="mo-pb" aria-pressed={by === "name"} onClick={() => setBy("name")}>
            By name
          </button>
          <button type="button" className="mo-pb" aria-pressed={by === "pack"} onClick={() => setBy("pack")}>
            By pack size
          </button>
        </>
      }
    >
      <div className="mo-clu" data-by={by}>
        {packs.map(([l, g], i) => {
          const row = col[g]++;
          return (
            <span key={i} className="mo-clu-it" data-g={g} style={v({ "--i": i, "--g": g, "--r": row })}>
              <b>Toned milk</b>
              <i>{l}</i>
            </span>
          );
        })}
      </div>
    </Pot>
  );
}

function Pipeline({ s, big }: P) {
  const steps = s.system?.architecture.map((a) => a.label) ?? [];
  const [run, setRun] = useState(0);
  const nollm = s.variant === "nollm";
  return (
    <Pot
      big={big}
      name={s.common}
      status={!run ? (nollm ? "Send a query down the path. Watch what it never touches." : "Send a query. Nothing is trusted until it validates.") : nollm ? "Served from retrieval and a small reranker. No LLM on the hot path." : "Extracted, then validated against the catalogue before it ships."}
      controls={
        <button type="button" className="mo-pb" onClick={() => setRun((r) => r + 1)}>
          Send a query
        </button>
      }
    >
      <div className="mo-pipe" key={run} data-run={run ? "" : undefined} style={v({ "--k": steps.length })}>
        {steps.map((l, i) => (
          <span key={l} className="mo-pipe-st" style={v({ "--d": i })}>
            <i />
            <b>{l}</b>
          </span>
        ))}
        {nollm && (
          <span className="mo-pipe-off">
            <i />
            <b>LLM</b>
          </span>
        )}
        {s.variant === "validate" && <span className="mo-pipe-ok">✓</span>}
      </div>
    </Pot>
  );
}

const streams = ["api", "worker", "cron", "edge"];

function Pulse({ s, big }: P) {
  const [muted, setMuted] = useState<number | null>(null);
  const [alarm, setAlarm] = useState(false);
  const t = useTimers();
  const kill = (i: number) => {
    t.clear();
    setAlarm(false);
    if (muted === i) {
      setMuted(null);
      return;
    }
    setMuted(i);
    t.after(1600, () => setAlarm(true));
  };
  return (
    <Pot
      big={big}
      name={s.common}
      status={muted === null ? "Four streams, all talking. Silence one." : alarm ? `Absence alert: ${streams[muted]} went quiet. Silence is a signal.` : `${streams[muted]} is quiet… waiting for the absence window.`}
      controls={streams.map((n, i) => (
        <button key={n} type="button" className="mo-pb mo-pb-s" aria-pressed={muted === i} onClick={() => kill(i)}>
          {muted === i ? `Revive ${n}` : `Silence ${n}`}
        </button>
      ))}
    >
      <div className="mo-pulse">
        {streams.map((n, i) => (
          <span key={n} className="mo-pulse-row" data-off={muted === i ? "" : undefined} data-alarm={muted === i && alarm ? "" : undefined} style={v({ "--d": i })}>
            <b>{n}</b>
            <span className="mo-pulse-lane">
              <i />
              <i />
              <i />
            </span>
          </span>
        ))}
      </div>
    </Pot>
  );
}

function Rack({ s, big }: P) {
  const [n, setN] = useState(0);
  return (
    <Pot
      big={big}
      name={s.common}
      status={n ? `Request ${n} routed to slot ${((n - 1) % 4) + 1}. Models stay resident, swap stays at 0 MB.` : "Four models resident on one machine. Send work at it."}
      controls={
        <button type="button" className="mo-pb" onClick={() => setN((x) => x + 1)}>
          Send a request
        </button>
      }
    >
      <div className="mo-rack">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="mo-rack-slot" data-hot={n && (n - 1) % 4 === i ? n % 2 : undefined}>
            <i />
          </span>
        ))}
        <span className="mo-rack-mem">
          <i />
          <b>swap 0 MB</b>
        </span>
      </div>
    </Pot>
  );
}

const routes = [74, 58, 91, 66];

function Pick({ s, big }: P) {
  const [on, setOn] = useState(false);
  const order = [...routes].map((x, i) => [x, i] as const).sort((a, b) => a[0] - b[0]);
  return (
    <Pot
      big={big}
      name={s.common}
      status={on ? "Every offer applied. The cheapest route floats up with a savings pill." : "Same cart, four ways to pay. Which one costs least?"}
      controls={
        <button type="button" className="mo-pb" aria-pressed={on} onClick={() => setOn((x) => !x)}>
          {on ? "Reset the cart" : "Work it out"}
        </button>
      }
    >
      <div className="mo-pick" data-on={on ? "" : undefined}>
        {routes.map((x, i) => {
          const rank = order.findIndex((o) => o[1] === i);
          return (
            <span key={i} className="mo-pick-row" data-best={on && rank === 0 ? "" : undefined} style={v({ "--w": x, "--i": i, "--r": rank })}>
              <i />
              <b>Route {String.fromCharCode(65 + i)}</b>
            </span>
          );
        })}
      </div>
    </Pot>
  );
}

const pricePts = [70, 64, 72, 60, 66, 52, 58, 46, 55, 62, 50, 57];

function Watch({ s, big }: P) {
  const [target, setTarget] = useState(48);
  const hitAt = pricePts.findIndex((p) => p <= target);
  const path = pricePts.map((p, i) => `${i ? "L" : "M"}${(i / (pricePts.length - 1)) * 240} ${100 - p}`).join(" ");
  return (
    <Pot
      big={big}
      name={s.common}
      status={hitAt >= 0 ? `The bot sends one message, at the first dip under your price.` : "Watching every sweep. Nothing under your price yet, so no message."}
      controls={
        <label className="mo-range">
          <span>Your price</span>
          <input type="range" min={30} max={75} value={target} onChange={(e) => setTarget(+e.target.value)} />
        </label>
      }
    >
      <div className="mo-watch">
        <svg viewBox="0 0 240 70" preserveAspectRatio="none">
          <path d={path} />
          <line x1="0" x2="240" y1={100 - target} y2={100 - target} />
        </svg>
        <i className="mo-watch-scan" />
        {hitAt >= 0 && (
          <b className="mo-watch-msg" key={hitAt} style={v({ "--x": (hitAt / (pricePts.length - 1)) * 100 })}>
            ping
          </b>
        )}
      </div>
    </Pot>
  );
}

const lanes = [1.6, 2.2, 1.2, 2.8, 1.9, 9, 2.4, 1.4];

function Race({ s, big }: P) {
  const [run, setRun] = useState(0);
  const [dl, setDl] = useState(true);
  return (
    <Pot
      big={big}
      name={s.common}
      status={!run ? "Eight partners race; one of them hangs." : dl ? "Deadline on: the answer ships at the line, without the straggler." : "No deadline: everyone waits for the slowest partner."}
      controls={
        <>
          <button type="button" className="mo-pb" onClick={() => setRun((r) => r + 1)}>
            Race
          </button>
          <button type="button" className="mo-pb" aria-pressed={dl} onClick={() => setDl((x) => !x)}>
            Deadline {dl ? "on" : "off"}
          </button>
        </>
      }
    >
      <div className="mo-race" key={`${run}-${dl}`} data-run={run ? "" : undefined} data-dl={dl ? "" : undefined}>
        {lanes.map((t, i) => (
          <span key={i} className="mo-race-lane" data-slow={t > 5 ? "" : undefined} style={v({ "--t": t })}>
            <i />
          </span>
        ))}
        <b className="mo-race-line" />
      </div>
    </Pot>
  );
}

function Ttl({ s, big }: P) {
  const [keys, setKeys] = useState<{ id: number; dead: boolean }[]>([]);
  const t = useTimers();
  const id = useRef(0);
  const set = () => {
    const k = ++id.current;
    setKeys((ks) => [...ks.slice(-4), { id: k, dead: false }]);
    t.after(4200, () => setKeys((ks) => ks.map((x) => (x.id === k ? { ...x, dead: true } : x))));
  };
  const live = keys.filter((k) => !k.dead).length;
  return (
    <Pot
      big={big}
      name={s.common}
      status={keys.length ? `${live} live ${live === 1 ? "key" : "keys"}. Each one expires on its own clock.` : "set k 0 4 — write a key with a four-second TTL."}
      controls={
        <button type="button" className="mo-pb" onClick={set}>
          set key
        </button>
      }
    >
      <div className="mo-ttl">
        {keys.map((k) => (
          <span key={k.id} className="mo-ttl-k" data-dead={k.dead ? "" : undefined}>
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" />
            </svg>
            <b>k{k.id}</b>
          </span>
        ))}
      </div>
    </Pot>
  );
}

const weights = [3, 2, 1];

function Route({ s, big }: P) {
  const [dead, setDead] = useState(-1);
  const [sent, setSent] = useState([0, 0, 0]);
  const [n, setN] = useState(0);
  const send = () => {
    const live = weights.map((w, i) => (i === dead ? 0 : w));
    const sum = live.reduce((a, b) => a + b, 0);
    let r = (n * 7 + 3) % sum;
    let pick = 0;
    for (let i = 0; i < 3; i++) {
      if (r < live[i]) {
        pick = i;
        break;
      }
      r -= live[i];
    }
    setN((x) => x + 1);
    setSent((c) => c.map((x, i) => (i === pick ? x + 1 : x)));
  };
  return (
    <Pot
      big={big}
      name={s.common}
      status={dead >= 0 ? `Node ${"ABC"[dead]} is down. The circuit is open and traffic flows around it.` : `Weighted 3 : 2 : 1. Sent ${sent.join(" · ")}.`}
      controls={
        <>
          <button type="button" className="mo-pb" onClick={send}>
            Send request
          </button>
          <button type="button" className="mo-pb" aria-pressed={dead === 0} onClick={() => setDead((d) => (d === 0 ? -1 : 0))}>
            {dead === 0 ? "Revive A" : "Kill node A"}
          </button>
        </>
      }
    >
      <div className="mo-route">
        {weights.map((w, i) => (
          <span key={i} className="mo-route-n" data-dead={dead === i ? "" : undefined} style={v({ "--w": w })}>
            <b>{"ABC"[i]}</b>
            <i style={v({ "--c": Math.min(sent[i], 12) })} />
          </span>
        ))}
      </div>
    </Pot>
  );
}

function Flush({ s, big }: P) {
  const [mem, setMem] = useState(0);
  const [segs, setSegs] = useState(0);
  const write = () => {
    if (mem >= 3) {
      setMem(0);
      setSegs((x) => Math.min(x + 1, 6));
    } else setMem((m) => m + 1);
  };
  return (
    <Pot
      big={big}
      name={s.common}
      status={segs ? `${segs} immutable ${segs === 1 ? "segment" : "segments"} on disk, readable by both the C++ and the Rust engine.` : "Writes land in the WAL and the memtable. Fill it to flush a segment."}
      controls={
        <button type="button" className="mo-pb" onClick={write}>
          {mem >= 3 ? "Write and flush" : "Write a vector"}
        </button>
      }
    >
      <div className="mo-flush">
        <span className="mo-flush-mem">
          {[0, 1, 2, 3].map((i) => (
            <i key={i} data-on={i < mem ? "" : undefined} />
          ))}
          <b>memtable</b>
        </span>
        <span className="mo-flush-segs">
          {Array.from({ length: segs }, (_, i) => (
            <i key={i} />
          ))}
          <b>segments</b>
        </span>
      </div>
    </Pot>
  );
}

export function Plant({ s, big }: P) {
  switch (s.plant) {
    case "cache":
      return <Cache s={s} big={big} />;
    case "merge":
      return <Merge s={s} big={big} />;
    case "fanout":
      return <Fanout s={s} big={big} />;
    case "cluster":
      return <Cluster s={s} big={big} />;
    case "pulse":
      return <Pulse s={s} big={big} />;
    case "rack":
      return <Rack s={s} big={big} />;
    case "pick":
      return <Pick s={s} big={big} />;
    case "watch":
      return <Watch s={s} big={big} />;
    case "race":
      return <Race s={s} big={big} />;
    case "ttl":
      return <Ttl s={s} big={big} />;
    case "route":
      return <Route s={s} big={big} />;
    case "flush":
      return <Flush s={s} big={big} />;
    default:
      return <Pipeline s={s} big={big} />;
  }
}
