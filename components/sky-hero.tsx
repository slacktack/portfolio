"use client";

import Image from "next/image";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { HeroCanvas } from "@/components/hero-canvas";

type Sticker = {
  src: string;
  alt: string;
  pos: CSSProperties;
  w: string;
  r: string;
  d: number;
  delay: string;
};

const shots: Sticker[] = [
  {
    src: "/assets/projects/flight-tracker.png",
    alt: "Flight Tracker running live",
    pos: { left: "2.5%", top: "13%" },
    w: "clamp(110px, 16vw, 250px)",
    r: "-7deg",
    d: 18,
    delay: "0s",
  },
  {
    src: "/assets/projects/dream-journal.png",
    alt: "Dream Journal running live",
    pos: { right: "2.5%", top: "10%" },
    w: "clamp(120px, 16.5vw, 265px)",
    r: "6deg",
    d: 26,
    delay: "-1.6s",
  },
  {
    src: "/assets/projects/train-tracker.png",
    alt: "Train Tracker running live",
    pos: { left: "3%", bottom: "9%" },
    w: "clamp(100px, 15vw, 250px)",
    r: "5deg",
    d: 22,
    delay: "-3s",
  },
  {
    src: "/assets/projects/k8-wizard.png",
    alt: "K8 Wizard running live",
    pos: { right: "3.5%", bottom: "10%" },
    w: "clamp(100px, 15vw, 250px)",
    r: "-5deg",
    d: 14,
    delay: "-2.2s",
  },
];

const stk = (s: CSSProperties, w: string, r: string, d: number) =>
  ({ ...s, "--w": w, "--r": r, "--d": d }) as CSSProperties;

export function SkyHero({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  const move = (event: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--px", String(((event.clientX - box.left) / box.width - 0.5) * 2));
    el.style.setProperty("--py", String(((event.clientY - box.top) / box.height - 0.5) * 2));
  };

  const leave = () => {
    ref.current?.style.setProperty("--px", "0");
    ref.current?.style.setProperty("--py", "0");
  };

  return (
    <section className="sky" ref={ref} onPointerMove={move} onPointerLeave={leave}>
      <div className="sky-paint" aria-hidden="true" />
      <svg className="sky-clouds" aria-hidden="true" preserveAspectRatio="none">
        <filter id="sky-cloud-filter" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.0055 0.011" numOctaves="5" seed="11" />
          <feColorMatrix values="0 0 0 0 1  0 0 0 0 0.94  0 0 0 0 0.87  0 0 0 2.1 -0.62" />
        </filter>
        <rect width="100%" height="100%" filter="url(#sky-cloud-filter)" />
      </svg>
      <div className="sky-grid" aria-hidden="true" />
      <HeroCanvas />

      <svg className="sky-scribble" viewBox="0 0 1440 900" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-20 210 C 220 40, 380 380, 250 520 S 20 640, 330 760 S 800 560, 1010 700 S 1200 880, 1260 560 S 1500 330, 1470 420" />
      </svg>

      {shots.map((s) => (
        <div className="stk" key={s.src} style={stk(s.pos, s.w, s.r, s.d)}>
          <div className="stk-in" style={{ animationDelay: s.delay }}>
            <Image src={s.src} alt={s.alt} width={720} height={500} sizes="(max-width: 760px) 30vw, 20vw" />
          </div>
        </div>
      ))}

      <div
        className="stk stk-term"
        style={stk({ left: "22%", bottom: "4%" }, "clamp(190px, 21vw, 300px)", "-3deg", 30)}
      >
        <div className="stk-in" style={{ animationDelay: "-1s" }}>
          <p>
            <i>$</i> p99 --last 24h
          </p>
          <p>
            <b>19.8ms</b> · cold start 232ms
          </p>
          <p>
            <i>→</i> 200 OK <em>478,291 req</em>
          </p>
        </div>
      </div>

      <div className="stk stk-badge" style={stk({ right: "21%", bottom: "5%" }, "112px", "9deg", 34)}>
        <div className="stk-in" style={{ animationDelay: "-2.4s" }}>
          <b>3.79M</b>
          <span>events / day</span>
        </div>
      </div>

      <div className="sky-copy">{children}</div>
    </section>
  );
}
