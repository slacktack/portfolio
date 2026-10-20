"use client";

import { useEffect, useRef, useState } from "react";

type Out = { kind: "in" | "out" | "err"; text: string };

const hint = [
  "set <key> <value> [ttl_seconds]",
  "get <key>",
  "delete <key>",
  "stats",
  "keys",
];

export function MemcachedLab() {
  const store = useRef<Map<string, { v: string; exp: number | null }>>(new Map());
  const counters = useRef({ hits: 0, misses: 0, sets: 0, evicted: 0 });
  const [lines, setLines] = useState<Out[]>([
    { kind: "out", text: "memcached-clone (browser simulation) ready" },
    { kind: "out", text: "try: set greeting hello 8" },
  ]);
  const [input, setInput] = useState("");
  const [snap, setSnap] = useState<{ k: string; v: string; left: number | null }[]>([]);
  const box = useRef<HTMLDivElement>(null);

  const snapshot = () =>
    [...store.current.entries()].map(([k, e]) => ({
      k,
      v: e.v,
      left: e.exp ? Math.max(0, Math.ceil((e.exp - Date.now()) / 1000)) : null,
    }));

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      for (const [k, e] of store.current) {
        if (e.exp && e.exp <= now) {
          store.current.delete(k);
          counters.current.evicted += 1;
        }
      }
      setSnap(snapshot());
    }, 500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [lines]);

  const run = (raw: string) => {
    const [cmd, key, ...rest] = raw.trim().split(/\s+/);
    const out: Out[] = [{ kind: "in", text: raw }];
    const c = counters.current;
    if (cmd === "set" && key && rest.length) {
      const ttl = /^\d+$/.test(rest[rest.length - 1]) && rest.length > 1 ? Number(rest.pop()) : 0;
      store.current.set(key, { v: rest.join(" "), exp: ttl ? Date.now() + ttl * 1000 : null });
      c.sets += 1;
      out.push({ kind: "out", text: "STORED" });
    } else if (cmd === "get" && key) {
      const e = store.current.get(key);
      if (e && (!e.exp || e.exp > Date.now())) {
        c.hits += 1;
        out.push({ kind: "out", text: `VALUE ${key} ${e.v.length}`, }, { kind: "out", text: e.v }, { kind: "out", text: "END" });
      } else {
        c.misses += 1;
        out.push({ kind: "out", text: "END (miss)" });
      }
    } else if (cmd === "delete" && key) {
      out.push({ kind: "out", text: store.current.delete(key) ? "DELETED" : "NOT_FOUND" });
    } else if (cmd === "keys") {
      out.push({ kind: "out", text: [...store.current.keys()].join(" ") || "(empty)" });
    } else if (cmd === "stats") {
      out.push({ kind: "out", text: `STAT items ${store.current.size}` }, { kind: "out", text: `STAT get_hits ${c.hits}` }, { kind: "out", text: `STAT get_misses ${c.misses}` }, { kind: "out", text: `STAT evictions ${c.evicted}` }, { kind: "out", text: "END" });
    } else {
      out.push({ kind: "err", text: `ERROR unknown command. Try: ${hint.join(" · ")}` });
    }
    setLines((l) => [...l, ...out].slice(-60));
    setSnap(snapshot());
  };

  return (
    <div className="lab2">
      <div className="lab2-grid">
        <div className="lab2-term-wrap">
          <div className="lab2-terminal lab2-term" ref={box}>
            {lines.map((l, i) => (
              <p key={i} data-kind={l.kind}>
                {l.kind === "in" ? "$ " : ""}
                {l.text}
              </p>
            ))}
          </div>
          <form
            className="lab2-prompt"
            onSubmit={(e) => {
              e.preventDefault();
              if (input.trim()) run(input);
              setInput("");
            }}
          >
            <span>$</span>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="set greeting hello 8" aria-label="Memcached command" autoComplete="off" spellCheck={false} />
          </form>
        </div>
        <div className="lab2-panel">
          <span className="lab2-k">Live keys · TTL</span>
          <ul className="lab2-flights">
            {snap.length ? (
              snap.map((e) => (
                <li key={e.k}>
                  <b>{e.k}</b>
                  <span>{e.v}</span>
                  <em>{e.left === null ? "no expiry" : `${e.left}s left`}</em>
                  <strong>{e.left === null ? "∞" : ""}</strong>
                </li>
              ))
            ) : (
              <li className="empty">Nothing stored. Keys expire on their own.</li>
            )}
          </ul>
          <p className="lab2-note">
            Memcached rebuilt in C++ to understand it: a kqueue event loop, a thread-safe cache with TTL, and a protocol parser. This panel is a browser simulation of that behavior.
          </p>
        </div>
      </div>
    </div>
  );
}
