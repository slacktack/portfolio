"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { k: "01 · Request", t: "A tap becomes a request.", d: "One search lands on the gateway. Everything after this is invisible to the person who typed it." },
  { k: "02 · Fan-out", t: "Seventeen sources, at once.", d: "Flights, hotels, food, cabs. Each provider has its own contract, its own speed and its own idea of done." },
  { k: "03 · Resolve", t: "Many answers, one identity.", d: "Names disagree, ids disagree. Identity is resolved, and a wrong merge is worse than a missing one." },
  { k: "04 · Cache", t: "Ask once, answer many.", d: "The key holds only what changes the answer. Refining a search never reaches the provider again." },
  { k: "05 · Answer", t: "One price. Under a deadline.", d: "Early results are kept, stragglers are settled, and the best answer arrives while the user is still looking." },
];

const logos = [
  "makemytrip", "booking", "agoda", "goibibo", "cleartrip", "expedia", "kayak", "skyscanner", "ixigo",
  "easemytrip", "tripcom", "klook", "swiggy", "zomato", "uber", "ola", "rapido",
];

const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function Journey() {
  const wrapRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    let dispose = () => {};

    const boot = async () => {
      const THREE = await import("three");
      const host = hostRef.current;
      const wrap = wrapRef.current;
      if (!host || !wrap || stopped) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.domElement.className = "journey-canvas";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x070810, 0.016);
      const camera = new THREE.PerspectiveCamera(58, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 160);

      const accent = new THREE.Color("#ff5a2b");
      const blue = new THREE.Color("#7c93ff");
      const disposables: { dispose: () => void }[] = [];
      const track = <T extends { dispose: () => void }>(x: T) => {
        disposables.push(x);
        return x;
      };

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
      const glow = track(new THREE.CanvasTexture(glowCanvas));

      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = maskCanvas.height = 128;
      const mctx = maskCanvas.getContext("2d");
      if (mctx) {
        mctx.fillStyle = "#000";
        mctx.fillRect(0, 0, 128, 128);
        mctx.fillStyle = "#fff";
        mctx.beginPath();
        mctx.roundRect(0, 0, 128, 128, 30);
        mctx.fill();
      }
      const mask = track(new THREE.CanvasTexture(maskCanvas));

      const Z = [0, -20, -44, -66, -92];

      const dustN = 700;
      const dp = new Float32Array(dustN * 3);
      for (let i = 0; i < dustN; i += 1) {
        dp[i * 3] = (rand(i) - 0.5) * 40;
        dp[i * 3 + 1] = (rand(i + 50) - 0.5) * 24;
        dp[i * 3 + 2] = 10 - rand(i + 9) * 130;
      }
      const dg = track(new THREE.BufferGeometry());
      dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
      scene.add(
        new THREE.Points(
          dg,
          track(new THREE.PointsMaterial({ size: 0.12, map: glow, color: 0x9fb0ff, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }))
        )
      );

      const railGeo = track(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 8), new THREE.Vector3(0, 0, -112)]));
      scene.add(new THREE.Line(railGeo, track(new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.35 }))));

      const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.7, 32, 32)), track(new THREE.MeshBasicMaterial({ color: accent })));
      core.position.z = Z[0] - 4;
      scene.add(core);
      const coreHalo = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glow, color: accent, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })));
      coreHalo.scale.setScalar(9);
      coreHalo.position.copy(core.position);
      scene.add(coreHalo);
      const ringGeo = track(new THREE.TorusGeometry(2.2, 0.03, 8, 120));
      const rings = Array.from({ length: 3 }, (_, i) => {
        const m = new THREE.Mesh(ringGeo, track(new THREE.MeshBasicMaterial({ color: i === 1 ? blue : accent, transparent: true, opacity: 0.5 })));
        m.position.copy(core.position);
        scene.add(m);
        return m;
      });

      const gate = new THREE.Mesh(track(new THREE.TorusGeometry(3.4, 0.07, 8, 4)), track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })));
      gate.position.z = Z[1];
      gate.rotation.z = Math.PI / 4;
      scene.add(gate);

      const loader = new THREE.TextureLoader();
      const tiles = logos.map((file, i) => {
        const tex = track(loader.load(`/assets/logos/${file}.png`));
        tex.colorSpace = THREE.SRGBColorSpace;
        const m = new THREE.Mesh(
          track(new THREE.PlaneGeometry(1.5, 1.5)),
          track(new THREE.MeshBasicMaterial({ map: tex, alphaMap: mask, transparent: true, toneMapped: false, depthWrite: false }))
        );
        m.userData = { a: (i / logos.length) * Math.PI * 2, r: 5.2 + rand(i) * 1.6, z: Z[2] + (rand(i + 3) - 0.5) * 6, s: 0.25 + rand(i + 7) * 0.2 };
        scene.add(m);
        return m;
      });

      const resolveNode = new THREE.Mesh(track(new THREE.IcosahedronGeometry(1.1, 1)), track(new THREE.MeshBasicMaterial({ color: blue, wireframe: true, transparent: true, opacity: 0.9 })));
      resolveNode.position.z = Z[3] + 6;
      scene.add(resolveNode);
      const streakPts: number[] = [];
      for (let i = 0; i < 24; i += 1) {
        const a = rand(i * 2) * Math.PI * 2;
        const r = 6 + rand(i) * 4;
        streakPts.push(Math.cos(a) * r, Math.sin(a) * r * 0.6, Z[3] - 8 + rand(i + 4) * 4, 0, 0, resolveNode.position.z);
      }
      const sg = track(new THREE.BufferGeometry());
      sg.setAttribute("position", new THREE.Float32BufferAttribute(streakPts, 3));
      scene.add(new THREE.LineSegments(sg, track(new THREE.LineBasicMaterial({ color: blue, transparent: true, opacity: 0.4 }))));

      const cubeEdges = track(new THREE.EdgesGeometry(track(new THREE.BoxGeometry(0.9, 0.9, 0.9))));
      const cubes: InstanceType<typeof THREE.LineSegments>[] = [];
      for (let x = -2; x <= 2; x += 1) {
        for (let y = -1; y <= 1; y += 1) {
          for (let z = 0; z < 3; z += 1) {
            const m = new THREE.LineSegments(cubeEdges, track(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })));
            m.position.set(x * 1.7, y * 1.7, Z[3] - 16 - z * 1.8);
            scene.add(m);
            cubes.push(m);
          }
        }
      }

      const card = document.createElement("canvas");
      card.width = 768;
      card.height = 384;
      const cx = card.getContext("2d");
      if (cx) {
        cx.fillStyle = "rgba(10,12,20,0.9)";
        cx.strokeStyle = "rgba(255,255,255,0.25)";
        cx.lineWidth = 3;
        cx.beginPath();
        cx.roundRect(6, 6, 756, 372, 40);
        cx.fill();
        cx.stroke();
        cx.fillStyle = "#ff5a2b";
        cx.beginPath();
        cx.arc(60, 66, 9, 0, Math.PI * 2);
        cx.fill();
        cx.fillStyle = "rgba(255,255,255,0.65)";
        cx.font = "500 26px ui-monospace, Menlo, monospace";
        cx.fillText("BEST FARE · BLR → GOI · 1 ADULT", 84, 76);
        cx.fillStyle = "#fff";
        cx.font = "800 150px 'Helvetica Neue', Arial, sans-serif";
        cx.fillText("₹4,740", 52, 232);
        cx.fillStyle = "rgba(255,255,255,0.6)";
        cx.font = "500 24px ui-monospace, Menlo, monospace";
        cx.fillText("17 sources · simulated example", 52, 310);
      }
      const cardTex = track(new THREE.CanvasTexture(card));
      cardTex.colorSpace = THREE.SRGBColorSpace;
      const cardMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(7, 3.5)), track(new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, toneMapped: false })));
      cardMesh.position.z = Z[4];
      scene.add(cardMesh);
      const cardGlow = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: glow, color: accent, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })));
      cardGlow.scale.setScalar(16);
      cardGlow.position.z = Z[4] - 0.5;
      scene.add(cardGlow);

      const pk = 90;
      const pp = new Float32Array(pk * 3);
      const pdata = Array.from({ length: pk }, (_, i) => ({ z: 8 - rand(i) * 120, s: 8 + rand(i + 3) * 14, x: (rand(i + 1) - 0.5) * 1.4, y: (rand(i + 2) - 0.5) * 1.4 }));
      const pg = track(new THREE.BufferGeometry());
      pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
      scene.add(
        new THREE.Points(
          pg,
          track(new THREE.PointsMaterial({ size: 0.28, map: glow, color: accent, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending }))
        )
      );

      let progress = 0;
      let eased = 0;
      const measure = () => {
        const r = wrap.getBoundingClientRect();
        const total = r.height - window.innerHeight;
        progress = Math.min(Math.max(-r.top / Math.max(total, 1), 0), 1);
      };
      measure();
      window.addEventListener("scroll", measure, { passive: true });

      let px = 0;
      let py = 0;
      let tx = 0;
      let ty = 0;
      const onMove = (e: PointerEvent) => {
        tx = (e.clientX / window.innerWidth - 0.5) * 2;
        ty = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.fov = w < 700 ? 74 : 58;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);
      resize();

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(wrap);

      let lastChapter = -1;
      let lastPct = -1;
      const start = performance.now();

      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        const t = (performance.now() - start) / 1000;
        eased += (progress - eased) * (reduce ? 1 : 0.07);
        px += (tx - px) * 0.05;
        py += (ty - py) * 0.05;

        const z = 8 - eased * 88;
        camera.position.set(px * 0.9 + Math.sin(eased * 9) * 0.35, -py * 0.6 + Math.cos(eased * 7) * 0.2, z);
        camera.lookAt(px * 0.6, -py * 0.4, z - 12);

        core.scale.setScalar(1 + Math.sin(t * 2) * 0.06);
        rings.forEach((r, i) => {
          r.rotation.x = t * (0.3 + i * 0.2);
          r.rotation.y = t * (0.2 - i * 0.1);
          r.scale.setScalar(1 + i * 0.55);
        });
        gate.rotation.y = t * 0.4;

        const gather = Math.min(Math.max((eased - 0.3) / 0.25, 0), 1);
        tiles.forEach((m, i) => {
          const d = m.userData as { a: number; r: number; z: number; s: number };
          const a = d.a + t * d.s * (1 - gather);
          const r = d.r * (1 - gather * 0.9);
          m.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.62, d.z - gather * 8);
          m.lookAt(camera.position);
          m.scale.setScalar(1 - gather * 0.35 + Math.sin(t + i) * 0.04);
          (m.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = Math.max(0, 1 - gather * 1.05);
          m.visible = eased < 0.62;
        });

        resolveNode.rotation.x = t * 0.5;
        resolveNode.rotation.y = t * 0.7;
        resolveNode.scale.setScalar(1 + Math.sin(t * 3) * 0.08);

        cubes.forEach((c, i) => {
          const lit = (Math.sin(t * 1.5 + i * 0.9) + 1) / 2 > 0.82;
          const m = c.material as InstanceType<typeof THREE.LineBasicMaterial>;
          m.opacity = lit ? 0.95 : 0.2;
          m.color.set(lit ? 0xff5a2b : 0xffffff);
        });

        const wide = camera.aspect > 1.1;
        cardMesh.position.set(wide ? 3.6 : 0, (wide ? 0 : -1.2) + Math.sin(t) * 0.12, Z[4]);
        cardGlow.position.set(cardMesh.position.x, cardMesh.position.y, Z[4] - 0.5);
        cubes.forEach((c) => {
          c.visible = eased < 0.82;
        });
        cardGlow.material.opacity = 0.45 + Math.sin(t * 2) * 0.1;

        pdata.forEach((p, i) => {
          p.z -= p.s * 0.016;
          if (p.z < -112) p.z = 8;
          pp[i * 3] = p.x;
          pp[i * 3 + 1] = p.y;
          pp[i * 3 + 2] = p.z;
        });
        pg.attributes.position.needsUpdate = true;

        const ch = Math.min(chapters.length - 1, Math.floor(eased * chapters.length * 0.999));
        if (ch !== lastChapter) {
          lastChapter = ch;
          setActive(ch);
        }
        const pc = Math.round(eased * 100);
        if (pc !== lastPct) {
          lastPct = pc;
          setPct(pc);
        }
        renderer.render(scene, camera);
      };

      if (reduce) {
        progress = 1;
        eased = 1;
      }
      frame();

      dispose = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", measure);
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
        io.disconnect();
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    boot();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  const c = chapters[active];

  return (
    <section className="journey" ref={wrapRef} aria-label="The life of a request">
      <div className="journey-sticky">
        <div className="journey-stage" ref={hostRef} aria-hidden="true" />
        <div className="journey-vignette" aria-hidden="true" />
        <div className="journey-ui wrap">
          <div className="journey-top">
            <span>The life of a request</span>
            <span>{String(pct).padStart(2, "0")}%</span>
          </div>
          <div className="journey-copy" key={active}>
            <span className="journey-k">{c.k}</span>
            <h2>{c.t}</h2>
            <p>{c.d}</p>
          </div>
          <div className="journey-dots" aria-hidden="true">
            {chapters.map((_, i) => (
              <i key={i} className={i === active ? "is-on" : i < active ? "is-done" : undefined} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
