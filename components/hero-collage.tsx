"use client";

import { type ReactNode } from "react";
import { Scene3D } from "@/components/scene3d";
import { CutVideo } from "@/components/zine-bits";

// The zine cover: colour-blocked paper, real 3D browser cards and pasted-on clippings.
export function HeroCollage({ children }: { children: ReactNode }) {
  return (
    <section className="zc" aria-label="Cover">
      <div className="zc-paper" aria-hidden="true">
        <i className="zc-block zc-block-red" />
        <i className="zc-block zc-block-blue" />
        <i className="zc-dots" />
        <i className="zc-reg zc-reg-a" />
        <i className="zc-reg zc-reg-b" />
      </div>
      <Scene3D kind="hero" mode="card" className="zc-objects" />
      <div className="zc-clips" aria-hidden="true">
        <CutVideo
          className="zc-rec"
          src="/assets/video/bh-food.mp4"
          poster="/assets/video/bh-food.jpg"
          label="Screen recording of the Buyhatke food compare"
        />
        <span className="zc-tape zc-tape-a" />
        <span className="zc-sticker">
          <b>p99</b>
          <span>20ms</span>
        </span>
      </div>
      <div className="zc-copy">{children}</div>
    </section>
  );
}
