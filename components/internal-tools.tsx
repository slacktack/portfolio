"use client";

import { useEffect, useRef } from "react";
import { internalTools } from "@/lib/site";

export function InternalTools() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <div className="tools">
      <div className="tools-media">
        <div className="lf">
          <div className="lf-bar">
            <span className="lf-dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="lf-url">halo · design system reference</span>
          </div>
          <div className="tools-screen">
            <video ref={video} src="/assets/video/halo.mp4" poster="/assets/video/halo.jpg" muted loop playsInline preload="none" />
          </div>
        </div>
        <p className="tools-cap">Recorded from the running reference page. Sample numbers, no company data.</p>
      </div>
      <ul className="tools-list">
        {internalTools.map((t) => (
          <li key={t.name}>
            <div className="tools-head">
              <h3>{t.name}</h3>
              <span>{t.kind}</span>
            </div>
            <p>{t.line}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
