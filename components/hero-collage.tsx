"use client";

import { type ReactNode } from "react";
import { Scene3D } from "@/components/scene3d";
import { SkyShader } from "@/components/sky-shader";

export function HeroCollage({ children }: { children: ReactNode }) {
  return (
    <section className="skyx">
      <SkyShader />
      <div className="skyx-grid" aria-hidden="true" />
      <Scene3D kind="hero" mode="card" className="hero-objects" />

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

      <div className="skyx-copy">{children}</div>
    </section>
  );
}
