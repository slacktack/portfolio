"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { SkyShader } from "@/components/sky-shader";
import { PartnerLogo } from "@/components/partner-logo";

type Shot = {
  kind: "shot";
  src: string;
  host: string;
  style: CSSProperties;
  w: string;
  r: number;
  depth: number;
};

type Chip = { kind: "logo"; id: string; style: CSSProperties; size: number; r: number; depth: number };

const items: (Shot | Chip)[] = [
  { kind: "shot", src: "/assets/projects/flight-tracker.png", host: "flight-tracker-gamma-seven.vercel.app", style: { left: "2%", top: "15%" }, w: "clamp(150px, 17vw, 270px)", r: -6, depth: 0.14 },
  { kind: "shot", src: "/assets/projects/dream-journal.png", host: "dream-journal-neon-delta.vercel.app", style: { right: "2.5%", top: "13%" }, w: "clamp(150px, 19vw, 300px)", r: 5, depth: 0.2 },
  { kind: "shot", src: "/assets/projects/train-tracker.png", host: "train-tracker-zeta.vercel.app", style: { left: "5%", bottom: "24%" }, w: "clamp(140px, 17vw, 270px)", r: 4, depth: 0.1 },
  { kind: "shot", src: "/assets/video/khelo-football.jpg", host: "khelo-football.vercel.app", style: { right: "5%", bottom: "22%" }, w: "clamp(140px, 17vw, 270px)", r: -4, depth: 0.18 },
  { kind: "logo", id: "mmt", style: { left: "22%", top: "15%" }, size: 64, r: -8, depth: 0.3 },
  { kind: "logo", id: "booking", style: { right: "23%", top: "19%" }, size: 58, r: 9, depth: 0.24 },
  { kind: "logo", id: "swiggy", style: { left: "20%", bottom: "30%" }, size: 56, r: 7, depth: 0.28 },
  { kind: "logo", id: "agoda", style: { right: "21%", bottom: "32%" }, size: 60, r: -7, depth: 0.22 },
  { kind: "logo", id: "uber", style: { left: "30%", bottom: "20%" }, size: 52, r: -5, depth: 0.16 },
  { kind: "logo", id: "zomato", style: { right: "31%", bottom: "17%" }, size: 54, r: 6, depth: 0.12 },
];

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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
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

      {items.map((item, i) => (
        <div
          key={item.kind === "shot" ? item.src : item.id}
          className="skx"
          data-kind={item.kind}
          data-n={i}
          data-drag
          style={
            {
              ...item.style,
              "--r": `${item.r}deg`,
              "--depth": item.depth,
              "--i": i,
              "--w": item.kind === "shot" ? item.w : `${item.kind === "logo" ? item.size : 0}px`,
            } as CSSProperties
          }
        >
          <div className="skx-in">
            {item.kind === "shot" ? (
              <div className="skx-browser">
                <div className="skx-bar">
                  <i />
                  <i />
                  <i />
                  <span>{item.host}</span>
                  <em>
                    <b /> Live
                  </em>
                </div>
                <div className="skx-screen">
                  <Image src={item.src} alt="" fill sizes="(max-width: 760px) 30vw, 20vw" draggable={false} />
                </div>
              </div>
            ) : (
              <div className="skx-logo">
                <PartnerLogo id={item.id} size={item.size} />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="skyx-copy">{children}</div>
    </section>
  );
}
