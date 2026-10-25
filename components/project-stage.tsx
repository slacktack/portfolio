"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StageItem } from "@/lib/site";
import { ArrowRight, ArrowUpRight } from "@/components/icons";

const wrap = (value: number, size: number) => ((value % size) + size) % size;

export function ProjectStage({ items }: { items: StageItem[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const [active, setActive] = useState(0);
  const [fallback, setFallback] = useState(false);

  const go = useCallback((delta: number) => {
    targetRef.current = Math.round(targetRef.current) + delta;
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const current = Math.round(targetRef.current);
      const diff = wrap(index - current + items.length / 2, items.length) - items.length / 2;
      targetRef.current = current + diff;
    },
    [items.length]
  );

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    let dispose = () => {};

    const boot = async () => {
      const THREE = await import("three");
      const host = hostRef.current;
      if (!host || stopped) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        setFallback(true);
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const count = items.length;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.domElement.className = "stage-canvas";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 60);
      camera.position.set(0, 0.15, 11.5);

      const styles = getComputedStyle(host);
      const css = (name: string, fallbackValue: string) =>
        new THREE.Color(styles.getPropertyValue(name).trim() || fallbackValue);
      const sticker = css("--sticker", "#fffdf6");
      const accent = css("--accent", "#e8491d");
      const ink = css("--ink", "#12110e");

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = 512;
      maskCanvas.height = 320;
      const mctx = maskCanvas.getContext("2d");
      if (mctx) {
        mctx.fillStyle = "#000";
        mctx.fillRect(0, 0, 512, 320);
        mctx.fillStyle = "#fff";
        mctx.beginPath();
        mctx.roundRect(0, 0, 512, 320, 30);
        mctx.fill();
      }
      const mask = new THREE.CanvasTexture(maskCanvas);

      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 64;
      const gctx = glowCanvas.getContext("2d");
      if (gctx) {
        const g = gctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        gctx.fillStyle = g;
        gctx.fillRect(0, 0, 64, 64);
      }
      const glow = new THREE.CanvasTexture(glowCanvas);

      const root = new THREE.Group();
      scene.add(root);

      const W = 7.8;
      const H = 4.875;
      const geometry = new THREE.PlaneGeometry(1, 1);
      const disposables: { dispose: () => void }[] = [geometry, mask, glow];

      type Card = {
        group: InstanceType<typeof THREE.Group>;
        video: HTMLVideoElement;
        materials: InstanceType<typeof THREE.MeshBasicMaterial>[];
        screen: InstanceType<typeof THREE.Mesh>;
        playing: boolean;
      };

      const cards: Card[] = items.map((item) => {
        const video = document.createElement("video");
        video.src = item.video;
        video.poster = item.poster;
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = "auto";
        video.crossOrigin = "anonymous";
        video.addEventListener("loadeddata", () => {
          if (video.paused) video.currentTime = 0.2;
        });

        const texture = new THREE.VideoTexture(video);
        texture.colorSpace = THREE.SRGBColorSpace;
        disposables.push(texture);

        const make = (color: InstanceType<typeof THREE.Color> | null, map: InstanceType<typeof THREE.Texture> | null) =>
          new THREE.MeshBasicMaterial({
            color: color ?? 0xffffff,
            map,
            alphaMap: mask,
            transparent: true,
            toneMapped: false,
          });

        const ringMat = make(accent, null);
        const stickerMat = make(sticker, null);
        const screenMat = make(null, texture);
        disposables.push(ringMat, stickerMat, screenMat);

        const group = new THREE.Group();
        const ring = new THREE.Mesh(geometry, ringMat);
        ring.scale.set(W + 0.3, H + 0.3, 1);
        ring.position.z = -0.02;
        const back = new THREE.Mesh(geometry, stickerMat);
        back.scale.set(W + 0.2, H + 0.2, 1);
        back.position.z = -0.01;
        const screen = new THREE.Mesh(geometry, screenMat);
        screen.scale.set(W, H, 1);
        group.add(ring, back, screen);
        root.add(group);

        return { group, video, materials: [ringMat, stickerMat, screenMat], screen, playing: false };
      });

      const dust = 120;
      const dustPositions = new Float32Array(dust * 3);
      for (let i = 0; i < dust; i += 1) {
        dustPositions[i * 3] = (Math.random() - 0.5) * 22;
        dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
        dustPositions[i * 3 + 2] = -3 - Math.random() * 7;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
      const dustMaterial = new THREE.PointsMaterial({
        size: 0.09,
        map: glow,
        color: ink,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dustPoints);
      disposables.push(dustGeometry, dustMaterial);

      let pos = 0;
      let px = 0;
      let py = 0;
      let tx = 0;
      let ty = 0;
      let visible = true;
      let hovering = false;
      let lastActive = 0;
      let drag: { x: number; start: number; moved: boolean } | null = null;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const pick = (event: PointerEvent) => {
        const box = renderer.domElement.getBoundingClientRect();
        pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(cards.map((card) => card.screen));
        return hits.length ? cards.findIndex((card) => card.screen === hits[0].object) : -1;
      };

      const onMove = (event: PointerEvent) => {
        const box = host.getBoundingClientRect();
        tx = ((event.clientX - box.left) / box.width - 0.5) * 2;
        ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
        if (drag) {
          const dx = event.clientX - drag.x;
          if (Math.abs(dx) > 6) drag.moved = true;
          targetRef.current = drag.start - dx / (box.width / 3.4);
          return;
        }
        renderer.domElement.style.cursor = pick(event) >= 0 ? "pointer" : "grab";
      };

      const onDown = (event: PointerEvent) => {
        drag = { x: event.clientX, start: targetRef.current, moved: false };
        renderer.domElement.setPointerCapture(event.pointerId);
        renderer.domElement.style.cursor = "grabbing";
      };

      const onUp = (event: PointerEvent) => {
        const state = drag;
        drag = null;
        renderer.domElement.style.cursor = "grab";
        if (!state) return;
        if (state.moved) {
          targetRef.current = Math.round(targetRef.current);
          return;
        }
        const index = pick(event);
        if (index < 0) return;
        const current = wrap(Math.round(targetRef.current), count);
        if (index === current) {
          window.open(items[index].href, "_blank", "noopener,noreferrer");
        } else {
          goTo(index);
        }
      };

      const onEnter = () => {
        hovering = true;
      };
      const onLeave = () => {
        hovering = false;
        tx = 0;
        ty = 0;
      };

      renderer.domElement.addEventListener("pointermove", onMove);
      renderer.domElement.addEventListener("pointerdown", onDown);
      renderer.domElement.addEventListener("pointerup", onUp);
      renderer.domElement.addEventListener("pointercancel", onUp);
      host.addEventListener("pointerenter", onEnter);
      host.addEventListener("pointerleave", onLeave);

      const resize = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.position.z = width < 760 ? Math.max(7.6, 4.4 / (0.306 * (width / height))) : 11.5;
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      const visibility = new IntersectionObserver(
        ([entry]) => {
          visible = entry.isIntersecting;
          if (!visible) cards.forEach((card) => {
            card.video.pause();
            card.playing = false;
          });
        },
        { threshold: 0.15 }
      );
      visibility.observe(host);

      const auto = window.setInterval(() => {
        if (reduceMotion || hovering || drag || !visible || document.hidden) return;
        targetRef.current = Math.round(targetRef.current) + 1;
      }, 7000);

      const clock = performance.now();

      const frame = () => {
        raf = window.requestAnimationFrame(frame);
        if (!visible) return;
        const t = (performance.now() - clock) / 1000;

        pos += (targetRef.current - pos) * (reduceMotion ? 1 : 0.085);
        px += (tx - px) * 0.06;
        py += (ty - py) * 0.06;
        root.rotation.y = px * 0.1;
        root.rotation.x = -py * 0.05;
        dustPoints.rotation.y = t * 0.01 + px * 0.05;

        cards.forEach((card, i) => {
          const d = wrap(i - pos + count / 2, count) - count / 2;
          const ad = Math.abs(d);
          card.group.visible = ad < 3.2;
          if (!card.group.visible) return;

          card.group.position.x = Math.sin(d * 0.58) * 9.2;
          card.group.position.y = Math.sin(t * 0.9 + i) * 0.04 * (1 - Math.min(ad, 1));
          card.group.position.z = -ad * 2 + Math.cos(d * 0.4) * 0.4;
          card.group.rotation.y = -d * 0.46;
          const s = 1 - Math.min(ad, 3) * 0.07;
          card.group.scale.setScalar(s);
          const fade = ad < 2 ? 1 : Math.max(0, 1 - (ad - 2) / 1.2);
          const dim = ad < 0.5 ? 1 : 0.55 + 0.3 * (1 - Math.min(ad, 2) / 2);
          card.materials.forEach((m) => {
            m.opacity = fade;
          });
          card.materials[2].color.setScalar(dim);

          const shouldPlay = ad < 0.6;
          if (shouldPlay && !card.playing) {
            card.playing = true;
            card.video.play().catch(() => {
              card.playing = false;
            });
          } else if (!shouldPlay && card.playing) {
            card.playing = false;
            card.video.pause();
          }
        });

        const current = wrap(Math.round(pos), count);
        if (current !== lastActive) {
          lastActive = current;
          setActive(current);
        }

        renderer.render(scene, camera);
      };
      frame();

      dispose = () => {
        window.cancelAnimationFrame(raf);
        window.clearInterval(auto);
        resizeObserver.disconnect();
        visibility.disconnect();
        host.removeEventListener("pointerenter", onEnter);
        host.removeEventListener("pointerleave", onLeave);
        cards.forEach((card) => {
          card.video.pause();
          card.video.removeAttribute("src");
          card.video.load();
        });
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    boot();

    return () => {
      stopped = true;
      window.cancelAnimationFrame(raf);
      dispose();
    };
  }, [items, goTo]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  const item = items[active];

  return (
    <div className="stage" role="group" aria-roledescription="carousel" aria-label="Live project recordings" onKeyDown={onKeyDown}>
      <div className="stage-view" ref={hostRef} tabIndex={0}>
        {fallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="stage-fallback" src={item.poster} alt={`${item.title} recording`} />
        ) : null}
      </div>

      <div className="stage-bar">
        <div className="stage-info" aria-live="polite">
          <span className="stage-tag">{item.tag}</span>
          <h3>{item.title}</h3>
          <p>{item.tagline}</p>
        </div>

        <div className="stage-controls">
          <div className="stage-dots" role="tablist" aria-label="Choose a project">
            {items.map((entry, index) => (
              <button
                type="button"
                role="tab"
                key={entry.slug}
                aria-selected={index === active}
                aria-label={entry.title}
                className={index === active ? "is-active" : undefined}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <div className="stage-buttons">
            <button type="button" className="icon-btn" onClick={() => go(-1)} aria-label="Previous project">
              <ArrowRight width={14} height={14} style={{ transform: "scaleX(-1)" }} />
            </button>
            <button type="button" className="icon-btn" onClick={() => go(1)} aria-label="Next project">
              <ArrowRight width={14} height={14} />
            </button>
            <a className="btn btn-primary btn-sm" href={item.href} target="_blank" rel="noreferrer">
              Open live
              <ArrowUpRight width={12} height={12} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
