"use client";

import { useEffect, useRef, useState } from "react";

const chapters = [
  { k: "01 · Request", t: "A tap becomes a request.", d: "One search lands on the gateway. Everything after this is invisible to the person who typed it." },
  { k: "02 · Fan-out", t: "Seventeen sources, at once.", d: "Flights, hotels, food, cabs. Each provider has its own contract, its own speed and its own idea of done." },
  { k: "03 · Resolve", t: "Many answers, one identity.", d: "Names disagree, ids disagree. Identity is resolved, and a wrong merge is worse than a missing one." },
  { k: "04 · Cache", t: "Ask once, answer many.", d: "The key holds only what changes the answer. Refining a search never reaches the provider again." },
  { k: "05 · Answer", t: "One price. Under a deadline.", d: "Early results are kept, stragglers are settled, and the best answer arrives while the user is still looking." },
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
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.25 : 1.6));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.domElement.className = "journey-canvas";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x070810, 0.016);
      const camera = new THREE.PerspectiveCamera(58, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 160);

      const accent = new THREE.Color("#ff5a2b");
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

      const Z = [0, -20, -44, -66, -92];
      const line = (c: number | InstanceType<typeof THREE.Color>, o: number) =>
        track(new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o, depthWrite: false }));

      // fine dust
      const dustN = 520;
      const dp = new Float32Array(dustN * 3);
      for (let i = 0; i < dustN; i += 1) {
        dp[i * 3] = (rand(i) - 0.5) * 44;
        dp[i * 3 + 1] = (rand(i + 50) - 0.5) * 26;
        dp[i * 3 + 2] = 10 - rand(i + 9) * 130;
      }
      const dg = track(new THREE.BufferGeometry());
      dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
      scene.add(new THREE.Points(dg, track(new THREE.PointsMaterial({ size: 0.05, map: glow, color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending }))));

      // corridor of thin frames
      const frames: InstanceType<typeof THREE.LineLoop>[] = [];
      for (let i = 0; i < 34; i += 1) {
        const w = 4.2 + (i % 3) * 0.35;
        const g = track(new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-w, -w * 0.56, 0), new THREE.Vector3(w, -w * 0.56, 0), new THREE.Vector3(w, w * 0.56, 0), new THREE.Vector3(-w, w * 0.56, 0),
        ]));
        const f = new THREE.LineLoop(g, line(0xffffff, 0.04 + (i % 6 === 0 ? 0.06 : 0)));
        f.position.z = 6 - i * 3.4;
        scene.add(f);
        frames.push(f);
      }

      // 01 request: a single point and two flat rings
      const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.16, 24, 24)), track(new THREE.MeshBasicMaterial({ color: 0xfff1e6 })));
      core.position.z = Z[0] - 4;
      scene.add(core);
      const ringGeo = track(new THREE.RingGeometry(0.98, 1, 128));
      const rings = Array.from({ length: 4 }, () => {
        const m = new THREE.Mesh(ringGeo, track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })));
        m.position.copy(core.position);
        scene.add(m);
        return m;
      });

      const startLabel = (() => {
        const cv = document.createElement("canvas");
        cv.width = 480;
        cv.height = 72;
        const c2 = cv.getContext("2d");
        if (c2) {
          c2.font = "600 40px system-ui, -apple-system, Helvetica, Arial, sans-serif";
          c2.fillStyle = "rgba(255,247,238,0.92)";
          c2.textAlign = "center";
          c2.textBaseline = "middle";
          c2.fillText("BLR → GOI · search", 240, 36);
        }
        const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: track(new THREE.CanvasTexture(cv)), transparent: true, depthWrite: false })));
        sp.scale.set(5.2, 0.78, 1);
        sp.position.set(core.position.x, core.position.y - 1.6, core.position.z);
        scene.add(sp);
        return sp;
      })();
      // 02 fan-out: 17 light streaks converging on the axis, each with a small mono label
      const labelFor = (text: string) => {
        const cv = document.createElement("canvas");
        cv.width = 384;
        cv.height = 72;
        const c2 = cv.getContext("2d");
        if (c2) {
          c2.font = "600 38px system-ui, -apple-system, Helvetica, Arial, sans-serif";
          c2.fillStyle = "rgba(255,247,238,0.92)";
          c2.textBaseline = "middle";
          c2.fillText(text, 6, 36);
        }
        const tx = track(new THREE.CanvasTexture(cv));
        const sp = new THREE.Sprite(track(new THREE.SpriteMaterial({ map: tx, transparent: true, depthWrite: false, opacity: 0 })));
        sp.scale.set(5.4, 1.02, 1);
        return sp;
      };
      const names = ["MakeMyTrip", "Booking.com", "Agoda", "Goibibo", "Cleartrip", "Expedia", "Kayak", "Skyscanner", "Ixigo", "EaseMyTrip", "Trip.com", "Klook", "Swiggy", "Zomato", "Uber", "Ola", "Rapido"];
      const trailVertex = `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
      const trailFragment = `uniform float uHead; uniform vec3 uColor; uniform float uAlpha; varying float vT;
        void main(){ float tail = smoothstep(uHead - 0.5, uHead, vT) * step(vT, uHead); float base = 0.06 * smoothstep(0.0, 0.2, vT);
          vec3 c = mix(uColor, vec3(1.0), smoothstep(uHead - 0.08, uHead, vT)); gl_FragColor = vec4(c, (tail * 0.9 + base) * uAlpha); }`;
      type Streak = { mat: InstanceType<typeof THREE.ShaderMaterial>; label: InstanceType<typeof THREE.Sprite>; start: InstanceType<typeof THREE.Vector3>; phase: number };
      const streaks: Streak[] = names.map((name, i) => {
        const a = (i / names.length) * Math.PI * 2 + 0.4;
        const r = 7 + rand(i) * 3.5;
        const start = new THREE.Vector3(Math.cos(a) * r * 1.35, Math.sin(a) * r * 0.7, Z[2] - 6 + rand(i + 4) * 8);
        const mid = new THREE.Vector3(Math.cos(a + 0.9) * r * 0.55, Math.sin(a + 0.9) * r * 0.3, (start.z + Z[3]) / 2);
        const end = new THREE.Vector3(0, 0, Z[3] + 4);
        const curve = new THREE.CatmullRomCurve3([start, mid, end]);
        const pts = curve.getPoints(70);
        const g = track(new THREE.BufferGeometry().setFromPoints(pts));
        g.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(pts.map((_, k) => k / (pts.length - 1))), 1));
        const mat = track(new THREE.ShaderMaterial({ vertexShader: trailVertex, fragmentShader: trailFragment, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uHead: { value: 0 }, uColor: { value: (i % 5 === 0 ? accent : new THREE.Color("#ffd9bd")).clone() }, uAlpha: { value: 0 } } }));
        const l = new THREE.Line(g, mat);
        l.frustumCulled = false;
        scene.add(l);
        const label = labelFor(name);
        label.position.copy(start).add(new THREE.Vector3(1.5, 0.4, 0));
        scene.add(label);
        return { mat, label, start, phase: rand(i * 5) };
      });

      // 03 resolve: one small wireframe node
      const resolveNode = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.7, 1)), track(new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.8 })));
      resolveNode.position.z = Z[3] + 4;
      scene.add(resolveNode);

      // 04 cache: lattice of fine cubes
      const cubeEdges = track(new THREE.EdgesGeometry(track(new THREE.BoxGeometry(0.9, 0.9, 0.9))));
      const cubes: InstanceType<typeof THREE.LineSegments>[] = [];
      for (let x = -3; x <= 3; x += 1) {
        for (let y = -1; y <= 1; y += 1) {
          for (let z = 0; z < 3; z += 1) {
            const m = new THREE.LineSegments(cubeEdges, line(0xffffff, 0.12));
            m.position.set(x * 1.8, y * 1.8, Z[3] - 12 - z * 2);
            scene.add(m);
            cubes.push(m);
          }
        }
      }

      // 05 answer: flat card
      const card = document.createElement("canvas");
      card.width = 1024;
      card.height = 512;
      const cx = card.getContext("2d");
      if (cx) {
        cx.fillStyle = "rgba(12,13,22,0.88)";
        cx.strokeStyle = "rgba(255,247,238,0.28)";
        cx.lineWidth = 2;
        cx.beginPath();
        cx.roundRect(4, 4, 1016, 504, 28);
        cx.fill();
        cx.stroke();
        cx.fillStyle = "rgba(255,247,238,0.6)";
        cx.font = "500 28px system-ui, -apple-system, Helvetica, Arial, sans-serif";
        cx.fillText("BEST FARE · BLR → GOI · 1 ADULT", 56, 92);
        cx.fillStyle = "#fff7ee";
        cx.font = "800 200px 'Helvetica Neue', Arial, sans-serif";
        cx.fillText("₹4,740", 50, 300);
        cx.fillStyle = "#ff5a2b";
        cx.fillRect(56, 360, 120, 4);
        cx.fillStyle = "rgba(255,247,238,0.55)";
        cx.font = "500 26px system-ui, -apple-system, Helvetica, Arial, sans-serif";
        cx.fillText("simulated example", 56, 430);
      }
      const cardTex = track(new THREE.CanvasTexture(card));
      cardTex.colorSpace = THREE.SRGBColorSpace;
      const cardMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(7, 3.5)), track(new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, toneMapped: false })));
      cardMesh.position.z = Z[4];
      scene.add(cardMesh);

      const pk = 70;
      const pp = new Float32Array(pk * 3);
      const pdata = Array.from({ length: pk }, (_, i) => ({ z: 8 - rand(i) * 120, s: 8 + rand(i + 3) * 14, x: (rand(i + 1) - 0.5) * 2.4, y: (rand(i + 2) - 0.5) * 1.4 }));
      const pg = track(new THREE.BufferGeometry());
      pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
      scene.add(new THREE.Points(pg, track(new THREE.PointsMaterial({ size: 0.09, map: glow, color: accent, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending }))));

      const tmpV = new THREE.Vector3();
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
        if (w < 700) camera.setViewOffset(w, h, 0, h * 0.2, w, h);
        else camera.clearViewOffset();
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

        rings.forEach((r, i) => {
          const k = (t * 0.25 + i / rings.length) % 1;
          r.scale.setScalar(1 + k * 7);
          (r.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = (1 - k) * 0.55 * Math.max(0, 1 - eased * 3);
        });

        const wideView = camera.aspect > 1.1;
        startLabel.position.set(core.position.x + (wideView ? 4.6 : 0), core.position.y + (wideView ? 0.2 : -1.6), core.position.z);
        (startLabel.material as InstanceType<typeof THREE.SpriteMaterial>).opacity = Math.max(0, 1 - eased * 6);
        const gather = Math.min(Math.max((eased - 0.28) / 0.3, 0), 1);
        const show = Math.min(Math.max((eased - 0.02) / 0.14, 0), 1) * (1 - Math.min(Math.max((eased - 0.62) / 0.12, 0), 1));
        streaks.forEach((st) => {
          st.mat.uniforms.uHead.value = Math.min(1.05, 0.1 + gather * 1.1 + ((t * 0.18 + st.phase) % 1) * 0.0);
          st.mat.uniforms.uAlpha.value = show;
          tmpV.copy(st.label.position).project(camera);
          const sx = tmpV.x * 0.5 + 0.5;
          const clear = Math.min(Math.max((sx - 0.46) / 0.1, 0), 1);
          (st.label.material as InstanceType<typeof THREE.SpriteMaterial>).opacity = show * (1 - gather * 0.9) * clear * (camera.aspect < 1 ? 0 : 1);
        });

        resolveNode.rotation.x = t * 0.5;
        resolveNode.rotation.y = t * 0.7;
        resolveNode.scale.setScalar(1 + Math.sin(t * 3) * 0.05);

        cubes.forEach((c, i) => {
          const lit = (Math.sin(t * 1.4 + i * 0.9) + 1) / 2 > 0.88;
          const m = c.material as InstanceType<typeof THREE.LineBasicMaterial>;
          m.opacity = lit ? 0.9 : 0.12;
          m.color.set(lit ? 0xff5a2b : 0xffffff);
          c.visible = eased > 0.42 && eased < 0.82;
        });

        const wide = camera.aspect > 1.1;
        cardMesh.visible = eased > 0.7;
        cardMesh.position.set(wide ? 3.4 : 0, (wide ? 0 : -1.2) + Math.sin(t) * 0.08, Z[4]);

        pdata.forEach((p, i) => {
          p.z -= p.s * 0.016;
          if (p.z < -112) p.z = 8;
          pp[i * 3] = p.x;
          pp[i * 3 + 1] = p.y;
          pp[i * 3 + 2] = p.z;
        });
        pg.attributes.position.needsUpdate = true;

        const ch = Math.min(chapters.length - 1, Math.floor(Math.min(eased * 1.12, 1) * chapters.length * 0.999));
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
      <div className="journey-sticky" data-chapter={active}>
        <div className="journey-aurora" aria-hidden="true">
          {chapters.map((_, i) => (
            <i key={i} className={i === active ? "is-on" : undefined} />
          ))}
        </div>
        <div className="journey-stage" ref={hostRef} aria-hidden="true" />
        <div className="journey-vignette" aria-hidden="true" />
        <div className="journey-ui wrap">
          <div className="journey-top">
            <span>The life of a request</span>
            <span>{pct}%</span>
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
