"use client";

import { useRef, useState } from "react";

type Q = {
  route: string;
  date: string;
  currency: string;
  adults: number;
  ages: number[];
  stops: "any" | "direct";
  airlines: string[];
  window: string | null;
  sort: "best" | "cheapest" | "fastest";
};

const base: Q = {
  route: "BLR → GOI",
  date: "12 Nov",
  currency: "INR",
  adults: 1,
  ages: [],
  stops: "any",
  airlines: [],
  window: null,
  sort: "best",
};

const flights = [
  { al: "IndiGo", code: "6E", dep: 6.5, dur: 85, stops: 0, price: 4760 },
  { al: "Air India", code: "AI", dep: 9.0, dur: 90, stops: 0, price: 5310 },
  { al: "Akasa Air", code: "QP", dep: 18.5, dur: 88, stops: 0, price: 4890 },
  { al: "IndiGo", code: "6E", dep: 13.0, dur: 190, stops: 1, price: 4120 },
  { al: "Air India", code: "AI", dep: 20.0, dur: 215, stops: 1, price: 3980 },
];

const keyOf = (q: Q) => {
  const infants = q.ages.filter((a) => a < 2).length;
  const kids = q.ages.length - infants;
  return [q.route, q.date, q.currency, `${q.adults}A`, `${kids}C`, `${infants}I`];
};

const inWindow = (dep: number, w: string | null) => !w || (w === "Morning" ? dep < 12 : dep >= 12);

export function CacheKeyLab() {
  const [q, setQ] = useState<Q>(base);
  const [log, setLog] = useState<{ text: string; hit: boolean }[]>([
    { text: "Sort: cheapest", hit: true },
    { text: "Airline 6E", hit: true },
    { text: "Date 13 Nov", hit: false },
  ]);
  const [stats, setStats] = useState({ hits: 2, misses: 1 });
  const [busy, setBusy] = useState(false);
  const seen = useRef<Set<string>>(new Set([keyOf(base).join("|")]));
  const timer = useRef<number | undefined>(undefined);

  const change = (label: string, next: Q) => {
    const key = keyOf(next).join("|");
    const hit = seen.current.has(key);
    seen.current.add(key);
    setQ(next);
    setLog((l) => [{ text: label, hit }, ...l].slice(0, 7));
    setStats((s) => ({ hits: s.hits + (hit ? 1 : 0), misses: s.misses + (hit ? 0 : 1) }));
    window.clearTimeout(timer.current);
    if (!hit) {
      setBusy(true);
      timer.current = window.setTimeout(() => setBusy(false), 1500);
    } else {
      setBusy(false);
    }
  };

  const rows = flights
    .filter((f) => (q.stops === "direct" ? f.stops === 0 : true))
    .filter((f) => !q.airlines.length || q.airlines.includes(f.code))
    .filter((f) => inWindow(f.dep, q.window))
    .sort((a, b) =>
      q.sort === "cheapest" ? a.price - b.price : q.sort === "fastest" ? a.dur - b.dur : a.price + a.dur * 12 - (b.price + b.dur * 12)
    )
    .map((f) => ({ ...f, price: q.currency === "USD" ? Math.round(f.price / 83) : f.price }));

  const key = keyOf(q);
  const total = stats.hits + stats.misses;
  const toggleAirline = (c: string) =>
    change(`Airline ${c}`, {
      ...q,
      airlines: q.airlines.includes(c) ? q.airlines.filter((x) => x !== c) : [...q.airlines, c],
    });

  return (
    <div className="lab2">
      <div className="lab2-controls">
        <div className="lab2-group">
          <span className="lab2-k">Changes the answer</span>
          <div className="lab2-chips">
            {["12 Nov", "13 Nov"].map((d) => (
              <button key={d} className={q.date === d ? "is-on" : ""} onClick={() => change(`Date ${d}`, { ...q, date: d })}>
                {d}
              </button>
            ))}
            {["INR", "USD"].map((c) => (
              <button key={c} className={q.currency === c ? "is-on" : ""} onClick={() => change(`Currency ${c}`, { ...q, currency: c })}>
                {c}
              </button>
            ))}
            <button onClick={() => change(`Adults ${(q.adults % 4) + 1}`, { ...q, adults: (q.adults % 4) + 1 })}>
              {q.adults} adult{q.adults > 1 ? "s" : ""}
            </button>
            <button onClick={() => change("Add child, age 7", { ...q, ages: [...q.ages, 7].slice(-3) })}>+ child, age 7</button>
            <button onClick={() => change("Add infant, age 1", { ...q, ages: [...q.ages, 1].slice(-3) })}>+ infant, age 1</button>
            <button onClick={() => change("Clear passengers", { ...q, ages: [] })}>clear</button>
          </div>
        </div>
        <div className="lab2-group">
          <span className="lab2-k">Refines in memory</span>
          <div className="lab2-chips">
            {(["any", "direct"] as const).map((s) => (
              <button key={s} className={q.stops === s ? "is-on" : ""} onClick={() => change(`Stops: ${s}`, { ...q, stops: s })}>
                {s === "any" ? "any stops" : "direct only"}
              </button>
            ))}
            {["6E", "AI", "QP"].map((c) => (
              <button key={c} className={q.airlines.includes(c) ? "is-on" : ""} onClick={() => toggleAirline(c)}>
                {c}
              </button>
            ))}
            {["Morning", "Evening"].map((w) => (
              <button
                key={w}
                className={q.window === w ? "is-on" : ""}
                onClick={() => change(`Window: ${w}`, { ...q, window: q.window === w ? null : w })}
              >
                {w}
              </button>
            ))}
            {(["best", "cheapest", "fastest"] as const).map((s) => (
              <button key={s} className={q.sort === s ? "is-on" : ""} onClick={() => change(`Sort: ${s}`, { ...q, sort: s })}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="lab2-grid">
        <div className="lab2-panel">
          <span className="lab2-k">Cache key</span>
          <div className="lab2-key">
            {key.map((part, i) => (
              <span key={`${part}-${i}`}>{part}</span>
            ))}
          </div>
          <div className={`lab2-verdict ${busy ? "is-busy" : log[0]?.hit ? "is-hit" : ""}`}>
            {busy
              ? "New search: create, then poll the provider…"
              : log.length
                ? log[0].hit
                  ? "Served from cache. Zero provider calls."
                  : "Fresh answer cached."
                : "Change something."}
            <i />
          </div>
          <div className="lab2-meter">
            <div>
              <b>{stats.hits}</b>
              <span>from cache</span>
            </div>
            <div>
              <b>{stats.misses}</b>
              <span>upstream searches</span>
            </div>
            <div>
              <b>{total ? Math.round((stats.hits / total) * 100) : 0}%</b>
              <span>never left the building</span>
            </div>
          </div>
          <ul className="lab2-log">
            {log.map((e, i) => (
              <li key={`${e.text}-${i}`} className={e.hit ? "hit" : "miss"}>
                <span>{e.hit ? "HIT" : "MISS"}</span>
                {e.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="lab2-panel">
          <span className="lab2-k">Results · sample data</span>
          <ul className="lab2-flights" data-busy={busy ? "" : undefined}>
            {rows.length ? (
              rows.map((f) => (
                <li key={`${f.code}-${f.dep}`}>
                  <b>{f.code}</b>
                  <span>{f.al}</span>
                  <em>
                    {String(Math.floor(f.dep)).padStart(2, "0")}:{f.dep % 1 ? "30" : "00"} · {Math.floor(f.dur / 60)}h {f.dur % 60}m ·{" "}
                    {f.stops ? "1 stop" : "direct"}
                  </em>
                  <strong>
                    {q.currency === "USD" ? "$" : "₹"}
                    {f.price.toLocaleString("en-IN")}
                  </strong>
                </li>
              ))
            ) : (
              <li className="empty">No flight matches those filters.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
