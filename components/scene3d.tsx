"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export type SceneKind = "flights" | "hotels" | "finale" | "hero" | "pay" | "grocery" | "cabs" | "food";

const load = async (kind: SceneKind) => {
  if (kind === "flights") return (await import("@/components/scenes/flight-scene")).mountFlightScene;
  if (kind === "hotels") return (await import("@/components/scenes/hotel-scene")).mountHotelScene;
  if (kind === "hero") return (await import("@/components/scenes/hero-scene")).mountHeroScene;
  if (kind === "finale") return (await import("@/components/scenes/finale-scene")).mountFinaleScene;
  return (await import("@/components/scenes/diorama-scenes")).mountDiorama(kind);
};

type Handle = { dispose: () => void };

// Creating a WebGL context and compiling shaders blocks the main thread, so scenes start
// one at a time with a short breather in between instead of all at once while scrolling.
let mountChain: Promise<void> = Promise.resolve();
const queueMount = (job: () => Promise<void>) => {
  mountChain = mountChain.then(
    () =>
      new Promise<void>((resolve) => {
        window.setTimeout(() => {
          job().finally(resolve);
        }, 160);
      })
  );
};

type Props = {
  kind: SceneKind;
  mode?: "card" | "scroll";
  wrap?: React.RefObject<HTMLElement | null>;
  onProgress?: (p: number) => void;
  fallback?: ReactNode;
  className?: string;
  label?: string;
};

// Mounts a three.js scene only while it is near the viewport, so a page of them stays light.
export function Scene3D({ kind, mode = "card", wrap, onProgress, fallback, className, label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const cb = useRef(onProgress);
  useEffect(() => {
    cb.current = onProgress;
  });

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let handle: Handle | null = null;
    let busy = false;
    let near = false;

    const mount = () => {
      if (handle || busy) return;
      busy = true;
      queueMount(async () => {
        try {
          if (!near || !host.current) return;
          const mountScene = await load(kind);
          if (!near || !host.current) return;
          const h = mountScene({
            host: el,
            mode,
            wrap: wrap?.current ?? undefined,
            loopSeconds: kind === "flights" ? 9 : kind === "hotels" ? 14 : 10,
            onProgress: (p: number) => cb.current?.(p),
          });
          if (!h) setFailed(true);
          else handle = h;
        } catch {
          setFailed(true);
        } finally {
          busy = false;
        }
      });
    };
    const unmount = () => {
      handle?.dispose();
      handle = null;
    };

    const io = new IntersectionObserver(
      ([e]) => {
        near = e.isIntersecting;
        if (near) mount();
        else unmount();
      },
      { rootMargin: mode === "scroll" ? "600px 0px" : "300px 0px" }
    );
    io.observe(wrap?.current ?? el);
    return () => {
      io.disconnect();
      near = false;
      unmount();
    };
  }, [kind, mode, wrap]);

  if (failed && fallback) return <>{fallback}</>;

  return (
    <div className={`scene3d ${className ?? ""}`.trim()} ref={host} data-kind={kind} aria-hidden="true">
      {label ? <span className="scene3d-label">{label}</span> : null}
    </div>
  );
}

type Chapter = { k: string; t: string; d: string };

export function ImmersiveHero({ kind, chapters }: { kind: SceneKind; chapters: Chapter[] }) {
  const wrap = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);
  const active = Math.min(chapters.length - 1, Math.floor(p * chapters.length * 0.999));
  const c = chapters[active];

  return (
    <section className="immersive" ref={wrap} data-kind={kind} aria-label={`${kind} in 3D`}>
      <div className="immersive-sticky">
        <Scene3D kind={kind} mode="scroll" wrap={wrap} onProgress={setP} className="immersive-scene" />
        <div className="immersive-shade" aria-hidden="true" />
        <div className="immersive-ui wrap">
          <div className="immersive-top">
            <span>Scroll to fly in</span>
            <span>{String(Math.round(p * 100)).padStart(2, "0")}%</span>
          </div>
          <div className="immersive-copy" key={active}>
            <span className="immersive-k">{c.k}</span>
            <h2>{c.t}</h2>
            <p>{c.d}</p>
          </div>
        </div>
        <div className="immersive-rail" aria-hidden="true">
          <i style={{ transform: `scaleX(${p})` }} />
        </div>
      </div>
    </section>
  );
}
