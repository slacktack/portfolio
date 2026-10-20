"use client";

import { useEffect, useRef, useState } from "react";
import { PartnerLogo } from "@/components/partner-logo";

const partners = ["mmt", "booking", "agoda", "goibibo", "cleartrip", "expedia", "kayak", "ixigo"];

const rollTimes = (seed: number) =>
  partners.map((_, i) => {
    const r = Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453) % 1;
    return i === seed % partners.length ? 9 + r * 8 : 1.1 + r * 3.6;
  });

export function DeadlineLab() {
  const [seed, setSeed] = useState(3);
  const [budget, setBudget] = useState(5);
  const [t, setT] = useState(0);
  const [run, setRun] = useState(0);
  const raf = useRef(0);
  const times = rollTimes(seed);
  const MAX = 18;

  useEffect(() => {
    const start = performance.now();
    const loop = () => {
      const now = ((performance.now() - start) / 1000) * 2.2;
      setT(Math.min(now, MAX));
      if (now < MAX) raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [seed, run]);

  const quoted = times.filter((x) => x <= budget);
  const first = Math.min(...times);
  const slowest = Math.max(...times);

  return (
    <div className="lab2">
      <div className="lab2-controls">
        <div className="lab2-group">
          <span className="lab2-k">Per-compare time budget · {budget.toFixed(1)}s</span>
          <input className="lab2-range" type="range" min={2} max={14} step={0.5} value={budget} onChange={(e) => { setBudget(Number(e.target.value)); setRun((r) => r + 1); }} />
        </div>
        <div className="lab2-chips">
          <button onClick={() => setSeed((s) => s + 1)}>Roll new partner latencies</button>
          <button onClick={() => setRun((r) => r + 1)}>Replay</button>
        </div>
      </div>

      <div className="lab2-race">
        {partners.map((p, i) => {
          const done = t >= times[i];
          const late = times[i] > budget;
          const w = Math.min(t, times[i]) / MAX;
          return (
            <div key={p} className={`lab2-lane ${done ? (late ? "late" : "ok") : ""}`}>
              <PartnerLogo id={p} size={28} />
              <div className="lab2-track">
                <i style={{ width: `${w * 100}%` }} />
                <u style={{ left: `${(budget / MAX) * 100}%` }} />
              </div>
              <span>{done ? (late ? `${times[i].toFixed(1)}s · settled` : `${times[i].toFixed(1)}s`) : "…"}</span>
            </div>
          );
        })}
      </div>

      <div className="lab2-meter lab2-meter-wide">
        <div><b>{first.toFixed(1)}s</b><span>first priced card</span></div>
        <div><b>{slowest.toFixed(1)}s</b><span>if we wait for everyone</span></div>
        <div><b>{Math.min(budget, slowest).toFixed(1)}s</b><span>with a budget</span></div>
        <div><b>{quoted.length}/{partners.length}</b><span>partners in the answer</span></div>
      </div>
      <p className="lab2-note">
        Average latency hides the tail. One partner that hangs drags the whole bar to its slowest response. A budget settles the straggler and keeps everything that already arrived.
      </p>
    </div>
  );
}
