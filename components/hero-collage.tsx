"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { SkyShader } from "@/components/sky-shader";
import { HeroWire } from "@/components/hero-wire";

type Shot = { kind: "shot"; src: string; host: string; style: CSSProperties; w: string; r: number; depth: number };
type Obj = { kind: "pass" | "key" | "bill" | "p99"; style: CSSProperties; w: string; r: number; depth: number };

const items: (Shot | Obj)[] = [
  { kind: "shot", src: "/assets/projects/flight-tracker.png", host: "flight-tracker-gamma-seven.vercel.app", style: { left: "2%", top: "15%" }, w: "clamp(150px, 17vw, 270px)", r: -6, depth: 0.14 },
  { kind: "shot", src: "/assets/video/bh-flights.jpg", host: "buyhatke.com/flights", style: { right: "2.5%", top: "13%" }, w: "clamp(150px, 17vw, 270px)", r: 5, depth: 0.2 },
  { kind: "shot", src: "/assets/projects/train-tracker.png", host: "train-tracker-zeta.vercel.app", style: { left: "5%", bottom: "24%" }, w: "clamp(140px, 16vw, 250px)", r: 4, depth: 0.1 },
  { kind: "shot", src: "/assets/video/bh-hotels.jpg", host: "buyhatke.com/hotels", style: { right: "5%", bottom: "22%" }, w: "clamp(140px, 16vw, 250px)", r: -4, depth: 0.18 },
  { kind: "pass", style: { left: "22%", top: "14%" }, w: "clamp(130px, 13vw, 200px)", r: -8, depth: 0.3 },
  { kind: "key", style: { right: "22%", top: "17%" }, w: "clamp(100px, 9vw, 140px)", r: 9, depth: 0.24 },
  { kind: "bill", style: { left: "21%", bottom: "19%" }, w: "clamp(86px, 8vw, 120px)", r: 7, depth: 0.28 },
  { kind: "p99", style: { right: "20%", bottom: "19%" }, w: "clamp(120px, 11vw, 170px)", r: -6, depth: 0.22 },
];

function ObjectSticker({ kind }: { kind: Obj["kind"] }) {
  if (kind === "pass")
    return (
      <div className="obj obj-pass">
        <div className="obj-pass-main">
          <small>Boarding pass</small>
          <b>BLR<i>✈</i>GOI</b>
          <span>1 adult · 17 sources</span>
        </div>
        <div className="obj-pass-stub">
          <em />
        </div>
      </div>
    );
  if (kind === "key")
    return (
      <div className="obj obj-key">
        <small>Room</small>
        <b>1204</b>
        <span className="obj-chip" />
      </div>
    );
  if (kind === "bill")
    return (
      <div className="obj obj-bill">
        <small>Order</small>
        <p>
          <span>Biryani</span>
          <b>₹329</b>
        </p>
        <p>
          <span>Raita</span>
          <b>₹49</b>
        </p>
        <hr />
        <p>
          <span>Best</span>
          <b>₹342</b>
        </p>
      </div>
    );
  return (
    <div className="obj obj-p99">
      <small>Requests / day</small>
      <b>478K+</b>
      <svg viewBox="0 0 100 24" aria-hidden="true">
        <path d="M0 18 L14 16 L28 19 L42 12 L56 14 L70 8 L84 11 L100 4" />
      </svg>
    </div>
  );
}

export function HeroCollage({ children }: { children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--sy", String(Math.min(window.scrollY, 900)));
      });
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--px", String(((e.clientX - r.left) / r.width - 0.5) * 2));
      el.style.setProperty("--py", String(((e.clientY - r.top) / r.height - 0.5) * 2));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Stickers can be picked up and moved; the rest of the scene stays still.
  useEffect(() => {
    const el = root.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    let top = 20;
    const cleanups: (() => void)[] = [];
    el.querySelectorAll<HTMLElement>("[data-drag]").forEach((node) => {
      let sx = 0;
      let sy = 0;
      let ox = 0;
      let oy = 0;
      let tx = 0;
      let ty = 0;
      let active = false;
      const down = (e: PointerEvent) => {
        active = true;
        sx = e.clientX;
        sy = e.clientY;
        ox = tx;
        oy = ty;
        top += 1;
        node.style.zIndex = String(top);
        node.setPointerCapture(e.pointerId);
        node.dataset.held = "";
      };
      const move = (e: PointerEvent) => {
        if (!active) return;
        tx = ox + e.clientX - sx;
        ty = oy + e.clientY - sy;
        node.style.setProperty("--dx", `${tx}px`);
        node.style.setProperty("--dy", `${ty}px`);
        node.style.setProperty("--tilt", `${Math.max(-8, Math.min(8, (e.clientX - sx) * 0.03))}deg`);
      };
      const up = () => {
        active = false;
        delete node.dataset.held;
        node.style.setProperty("--tilt", "0deg");
      };
      node.addEventListener("pointerdown", down);
      node.addEventListener("pointermove", move);
      node.addEventListener("pointerup", up);
      node.addEventListener("pointercancel", up);
      cleanups.push(() => {
        node.removeEventListener("pointerdown", down);
        node.removeEventListener("pointermove", move);
        node.removeEventListener("pointerup", up);
        node.removeEventListener("pointercancel", up);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, []);

  return (
    <section className="skyx" ref={root}>
      <SkyShader />
      <div className="skyx-grid" aria-hidden="true" />
      <HeroWire />

      <div className="skyx-note skyx-note-drag" aria-hidden="true">
        <svg viewBox="0 0 90 60" fill="none">
          <path d="M6 8c18-6 44-4 62 18 6 8 10 16 12 26M80 54l-7-10m7 10l11-8" />
        </svg>
        <span>pick me up</span>
      </div>
      <div className="skyx-note skyx-note-prod" aria-hidden="true">
        <svg viewBox="0 0 90 60" fill="none">
          <path d="M84 6C62 2 34 12 22 42M22 42l2-14m-2 14l13-5" />
        </svg>
        <span>real prod number. not a mockup.</span>
      </div>

      {items.map((item, i) => (
        <div
          key={item.kind === "shot" ? item.src : item.kind}
          className="skx"
          data-kind={item.kind}
          data-n={i}
          data-drag
          data-cursor="Drag"
          style={
            {
              ...item.style,
              "--r": `${item.r}deg`,
              "--depth": item.depth,
              "--i": i,
              "--w": item.w,
            } as CSSProperties
          }
        >
          <div className="skx-in">
            {item.kind === "shot" ? (
              <div className="skx-browser">
                <span className="skx-tape">{item.host}</span>
                <span className="skx-live">
                  <b /> Live
                </span>
                <div className="skx-screen">
                  <Image src={item.src} alt="" fill sizes="(max-width: 760px) 30vw, 20vw" draggable={false} />
                </div>
              </div>
            ) : (
              <ObjectSticker kind={item.kind} />
            )}
          </div>
        </div>
      ))}

      <div className="skyx-copy">{children}</div>
    </section>
  );
}
