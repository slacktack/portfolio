"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { applySkin, openThemes } from "@/components/skin";
import { getSkin, skins, type Skin, type SkinId } from "@/lib/skins";

function useSkinId(): SkinId | "" {
  return useSyncExternalStore(
    (cb) => {
      const o = new MutationObserver(cb);
      o.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-skin"],
      });
      return () => o.disconnect();
    },
    () => getSkin(document.documentElement.dataset.skin).id,
    () => "",
  );
}

// A tiny wireframe of where each site keeps its navigation.
export function LayoutMap({ layout }: { layout: Skin["layout"] }) {
  return (
    <span className={`lmap lmap-${layout}`} aria-hidden="true">
      <i className="lmap-nav" />
      <i className="lmap-a" />
      <i className="lmap-b" />
      <i className="lmap-c" />
    </span>
  );
}

const glyphs: Record<string, string> = {
  paper: "Aa",
  night: "Fig.",
  summit: "▲",
  aurora: "Ag",
  ember: "Aa",
  signal: "478K",
  moss: "❦",
  forge: "LVL",
  abyss: "PLAY",
  grid: "01",
  crimson: "TG",
  graphite: "▦",
  onyx: "Nº",
  solar: "12",
  nebula: "✦",
  orbit: "◉",
};

// The roulette: chips ride a ring; wheel, drag or arrow keys spin it, the top chip is picked.
export function PaletteFan({ onPick, first = false }: { onPick?: () => void; first?: boolean }) {
  const current = useSkinId();
  const n = skins.length;
  const step = 1;
  const startIdx = Math.max(0, skins.findIndex((s) => s.id === current));
  const [sel, setSel] = useState(startIdx);
  const ring = useRef<HTMLDivElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const st = useRef({ a: -startIdx * step, t: -startIdx * step, drag: false, x: 0, moved: 0, snapT: 0, lastDrag: 0 });
  const shown = skins[sel];
  const kickRef = useRef(() => {});

  const enter = (i: number) => {
    onPick?.();
    applySkin(skins[i].id);
  };

  useEffect(() => {
    const s = st.current;
    let raf = 0;
    const idxOf = (pos: number) => (((Math.round(-pos) % n) + n) % n);
    const tick = () => {
      s.a += (s.t - s.a) * 0.2;
      const w = ring.current?.clientWidth ?? 900;
      const gap = Math.min(176, w / 5.2);
      chips.current.forEach((el, i) => {
        if (!el) return;
        let d = (i + s.a) % n;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const ad = Math.abs(d);
        const vis = ad < 4.2;
        el.style.transform = `translate3d(${d * gap}px, ${d * d * 9}px, 0) rotate(${d * 5}deg) scale(${1.08 - Math.min(ad, 3) * 0.07})`;
        el.style.opacity = vis ? String(Math.min(1, 1.25 - ad * 0.24)) : "0";
        el.style.zIndex = String(100 - Math.round(ad * 10));
        el.style.pointerEvents = vis ? "auto" : "none";
        el.tabIndex = ad < 0.5 ? 0 : -1;
      });
      setSel((prev) => {
        const k = idxOf(s.a);
        return prev === k ? prev : k;
      });
      raf = Math.abs(s.t - s.a) > 0.001 || s.drag ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kickRef.current = kick;
    const snap = () => {
      s.t = Math.round(s.t / step) * step;
      kick();
    };
    const el = ring.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      s.t -= d * 0.008;
      window.clearTimeout(s.snapT);
      s.snapT = window.setTimeout(snap, 110);
      kick();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      s.drag = true;
      s.x = e.clientX;
      s.moved = 0;
      kick();
    };
    const onMove = (e: PointerEvent) => {
      if (!s.drag) return;
      const dx = e.clientX - s.x;
      s.x = e.clientX;
      s.moved += Math.abs(dx);
      s.t += dx / Math.min(176, el.clientWidth / 5.2);
      kick();
    };
    const onUp = () => {
      if (!s.drag) return;
      s.drag = false;
      if (s.moved > 6) s.lastDrag = Date.now();
      snap();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    kick();
    tick();
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [n, step]);

  const spinRef = useRef<(i: number) => void>(() => {});
  const enterRef = useRef<(i: number) => void>(() => {});
  const spinTo = (i: number) => {
    const s = st.current;
    // shortest way round the loop to chip i
    const want = -i * step;
    let diff = (want - s.t) % n;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    s.t += diff;
    kickRef.current();
    
  };

  const selRef = useRef(sel);
  useEffect(() => {
    spinRef.current = spinTo;
    enterRef.current = enter;
    selRef.current = sel;
  });
  useEffect(() => {
    const onWinKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.closest?.("input, textarea")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        spinRef.current((((Math.round(-st.current.t) + 1) % n) + n) % n);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        spinRef.current((((Math.round(-st.current.t) - 1) % n) + n) % n);
      } else if (e.key === "Enter" && !(e.target as HTMLElement | null)?.closest?.(".themes-actions")) {
        e.preventDefault();
        enterRef.current((((Math.round(-st.current.t) % n) + n) % n));
      }
    };
    window.addEventListener("keydown", onWinKey);
    return () => window.removeEventListener("keydown", onWinKey);
  }, [n]);

  return (
    <div className="pfan-wrap" data-sel={shown.id} style={{ "--sel-bg": shown.curtain, "--sel-a": shown.swatches[1]?.hex ?? "#fff" } as CSSProperties}>
      <div className="pfan-aura" aria-hidden="true" key={`a-${shown.id}`} />
      <div className="roul" ref={ring} data-lenis-prevent role="listbox" aria-label="Themes. Use arrow keys, scroll or drag to spin.">
        <div className="roul-pin" aria-hidden="true" />
        {skins.map((s, i) => (
          <button
            type="button"
            key={s.id}
            ref={(el) => {
              chips.current[i] = el;
            }}
            className="pchip"
            data-chip={s.id}
            role="option"
            aria-selected={i === sel}
            data-current={s.id === current || undefined}
            aria-label={`${s.name}: ${s.story}. Navigation: ${s.nav}`}
            onClick={() => {
              if (Date.now() - st.current.lastDrag < 250) return;
              if (i === sel) enter(i);
              else spinTo(i);
            }}
          >
            <span className="pchip-art" style={{ background: s.curtain }}>
              <span className="pchip-glyph" aria-hidden="true">
                {glyphs[s.id]}
              </span>
              <LayoutMap layout={s.layout} />
              {s.threeD ? <span className="pchip-tag">3D</span> : null}
            </span>
            <span className="pchip-foot">
              <b>{s.name}</b>
              <span>
                TG {String(i + 1).padStart(2, "0")}-{s.id.slice(0, 2).toUpperCase()}
              </span>
              <span className="pchip-hex">
                {s.swatches.map((w) => (
                  <i key={w.hex} style={{ background: w.hex }} />
                ))}
              </span>
            </span>
          </button>
        ))}
        <span className="roul-hint" aria-hidden="true">
          Scroll · drag · ← → to spin
        </span>
      </div>
      <div className="pfan-detail" aria-live="polite" key={shown.id}>
        <span className="pfan-k">
          {String(sel + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {shown.story}
        </span>
        <b>{shown.name}</b>
        <p>{shown.line}</p>
        <dl>
          <div>
            <dt>Navigation</dt>
            <dd>{shown.nav}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{shown.type}</dd>
          </div>
        </dl>
        <span className="pfan-sw">
          {shown.swatches.map((w) => (
            <span key={w.hex}>
              <i style={{ background: w.hex }} />
              {w.name} <em>{w.hex}</em>
            </span>
          ))}
        </span>
        <button type="button" className="pfan-go" onClick={() => enter(sel)}>
          {shown.id === current && !first ? `You are in ${shown.name}` : `Enter ${shown.name}`} <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

export function ThemeModal() {
  const first = useSyncExternalStore(
    (cb) => {
      const o = new MutationObserver(cb);
      o.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-first"],
      });
      return () => o.disconnect();
    },
    () => document.documentElement.dataset.first === "1",
    () => false,
  );
  const [open, setOpen] = useState(false);
  const shown = open || first;

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("tg-open-themes", onOpen);
    return () => window.removeEventListener("tg-open-themes", onOpen);
  }, []);

  const close = () => {
    setOpen(false);
    if (document.documentElement.dataset.first) {
      delete document.documentElement.dataset.first;
      try {
        localStorage.setItem(
          "tg-skin",
          document.documentElement.dataset.skin || "paper",
        );
      } catch {
        // storage blocked
      }
    }
  };

  useEffect(() => {
    if (!shown) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.classList.add("themes-open");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("themes-open");
    };
  });

  if (!shown) return null;

  return (
    <div
      className={`themes-modal${first ? " is-first" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Choose a website"
      data-lenis-prevent
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="themes-sheet" data-lenis-prevent>
        <div className="themes-head">
          <div>
            <span className="themes-k">
              {first ? "Welcome · pick your website" : "The palette"}
            </span>
            <h2>
              {skins.length} themes. <em>{skins.length} different websites.</em>
            </h2>
            <p>
              Not a colour swap. Each one has its own story, layout, navigation,
              type and motion. Same systems, same real numbers.
            </p>
          </div>
          <div className="themes-actions">
            {first ? (
              <button
                type="button"
                className="themes-surprise"
                onClick={() => {
                  setOpen(false);
                  const pool = skins.filter((k) => k.ready);
                  applySkin(pool[Math.floor(Math.random() * pool.length)].id);
                }}
              >
                Surprise me
              </button>
            ) : null}
            <button type="button" className="themes-close" onClick={close}>
              {first ? "Skip" : "Close"}
            </button>
          </div>
        </div>
        <PaletteFan first={first} onPick={() => setOpen(false)} />
      </div>
    </div>
  );
}

// Drop this on a theme's landing page to tease the other sites.
export function ThemeTeaser({ className }: { className?: string }) {
  const current = useSkinId();
  return (
    <div className="tteaser-host">
      <aside
        className={`tteaser ${className ?? ""}`.trim()}
        aria-label="Other versions of this site"
      >
        <div className="tteaser-copy">
          <span className="tteaser-k">
            This site comes in {skins.length} versions
          </span>
          <b>
            Same work. <em>{skins.length} completely different websites.</em>
          </b>
          <span className="tteaser-sub">
            A dashboard, a planet game, a design board, a film, a greenhouse. Pick
            one.
          </span>
        </div>
        <div className="tteaser-deck">
          {skins.map((s, i) => (
            <button
              type="button"
              key={s.id}
              className="tteaser-chip"
              aria-pressed={s.id === current}
              title={`${s.name}: ${s.story}`}
              style={
                {
                  "--i": i,
                  "--n": skins.length,
                  background: s.curtain,
                } as CSSProperties
              }
              onClick={() => applySkin(s.id)}
            >
              <LayoutMap layout={s.layout} />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
        <button type="button" className="tteaser-open" onClick={openThemes}>
          Open the palette <span aria-hidden="true">→</span>
        </button>
      </aside>
    </div>
  );
}
