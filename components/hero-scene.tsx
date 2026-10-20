"use client";

import { useEffect, useRef } from "react";

const providers = [
  { file: "makemytrip", name: "MakeMyTrip" },
  { file: "booking", name: "Booking.com" },
  { file: "agoda", name: "Agoda" },
  { file: "goibibo", name: "Goibibo" },
  { file: "cleartrip", name: "Cleartrip" },
  { file: "expedia", name: "Expedia" },
  { file: "kayak", name: "Kayak" },
  { file: "skyscanner", name: "Skyscanner" },
  { file: "ixigo", name: "Ixigo" },
  { file: "easemytrip", name: "EaseMyTrip" },
  { file: "tripcom", name: "Trip.com" },
  { file: "klook", name: "Klook" },
  { file: "swiggy", name: "Swiggy" },
  { file: "zomato", name: "Zomato" },
  { file: "uber", name: "Uber" },
  { file: "ola", name: "Ola" },
  { file: "rapido", name: "Rapido" },
];

const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function HeroScene() {
  const hostRef = useRef<HTMLDivElement>(null);

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
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      } catch {
        return;
      }

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isNarrow = () => host.clientWidth < 760;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow() ? 1.5 : 2));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.domElement.className = "hero-scene-canvas";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 80);
      const CAM_Z = 15;
      camera.position.set(0, 0, CAM_Z);

      const styles = getComputedStyle(document.documentElement);
      const css = (name: string, fallback: string) =>
        new THREE.Color(styles.getPropertyValue(name).trim() || fallback);
      const accent = css("--accent", "#ff5a2b");
      const data = css("--data", "#7c93ff");

      const disposables: { dispose: () => void }[] = [];
      const track = <T extends { dispose: () => void }>(item: T) => {
        disposables.push(item);
        return item;
      };

      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 128;
      const gctx = glowCanvas.getContext("2d");
      if (gctx) {
        const g = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.25, "rgba(255,255,255,0.55)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        gctx.fillStyle = g;
        gctx.fillRect(0, 0, 128, 128);
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

      const root = new THREE.Group();
      scene.add(root);

      const hub = new THREE.Group();
      root.add(hub);

      const core = new THREE.Mesh(
        track(new THREE.SphereGeometry(0.34, 32, 32)),
        track(new THREE.MeshBasicMaterial({ color: accent }))
      );
      hub.add(core);

      const halo = new THREE.Sprite(
        track(new THREE.SpriteMaterial({ map: glow, color: accent, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending }))
      );
      halo.scale.setScalar(4.2);
      hub.add(halo);

      const shellGeo = track(new THREE.IcosahedronGeometry(0.95, 1));
      const shellEdges = track(new THREE.EdgesGeometry(shellGeo));
      const shell = new THREE.LineSegments(
        shellEdges,
        track(new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28 }))
      );
      hub.add(shell);

      const ringGeo = track(new THREE.RingGeometry(0.98, 1, 96));
      const rings = Array.from({ length: 4 }, () => {
        const mat = track(new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
        const mesh = new THREE.Mesh(ringGeo, mat);
        hub.add(mesh);
        return { mesh, mat, t: 1 };
      });
      let ringIndex = 0;
      const pulse = () => {
        const ring = rings[ringIndex % rings.length];
        ringIndex += 1;
        ring.t = 0;
      };

      const dustCount = 360;
      const dustPos = new Float32Array(dustCount * 3);
      for (let i = 0; i < dustCount; i += 1) {
        dustPos[i * 3] = (rand(i) - 0.5) * 34;
        dustPos[i * 3 + 1] = (rand(i + 99) - 0.5) * 18;
        dustPos[i * 3 + 2] = -10 + rand(i + 7) * 14;
      }
      const dustGeo = track(new THREE.BufferGeometry());
      dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
      const dust = new THREE.Points(
        dustGeo,
        track(new THREE.PointsMaterial({ size: 0.07, map: glow, color: 0xaab8ff, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }))
      );
      scene.add(dust);

      type Tile = {
        mesh: InstanceType<typeof THREE.Mesh>;
        mat: InstanceType<typeof THREE.MeshBasicMaterial>;
        curve: InstanceType<typeof THREE.CatmullRomCurve3>;
        line: InstanceType<typeof THREE.Line>;
        lineMat: InstanceType<typeof THREE.ShaderMaterial>;
        speed: number;
        u: number;
        push: InstanceType<typeof THREE.Vector3>;
        index: number;
      };

      const loader = new THREE.TextureLoader();
      const tiles: Tile[] = [];
      const hubPos = new THREE.Vector3();
      const cardPos = new THREE.Vector3();

      const trailVertex = `
        attribute float aT;
        varying float vT;
        void main() { vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `;
      const trailFragment = `
        uniform float uHead; uniform vec3 uColor; varying float vT;
        void main() {
          float tail = smoothstep(uHead - 0.42, uHead, vT) * step(vT, uHead);
          float base = 0.05 * smoothstep(0.0, 0.2, vT);
          float a = tail * 0.95 + base;
          vec3 c = mix(uColor, vec3(1.0), smoothstep(uHead - 0.1, uHead, vT));
          gl_FragColor = vec4(c, a);
        }
      `;

      const buildCurve = (i: number) => {
        const a = rand(i * 3.1) * Math.PI * 2;
        const r = 9 + rand(i * 1.7) * 6;
        const start = new THREE.Vector3(Math.cos(a) * r * 1.5, Math.sin(a) * r * 0.62, -3 + rand(i * 5.3) * 6);
        const swirl = a + 0.9 + rand(i) * 0.8;
        const mid1 = new THREE.Vector3(Math.cos(swirl) * r * 0.62, Math.sin(swirl) * r * 0.3, start.z * 0.5);
        const mid2 = new THREE.Vector3(Math.cos(swirl + 0.6) * r * 0.25, Math.sin(swirl + 0.6) * r * 0.14, start.z * 0.2);
        return { start, mid1, mid2 };
      };

      providers.forEach((provider, i) => {
        const tex = track(loader.load(`/assets/logos/${provider.file}.png`));
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 4;
        const mat = track(new THREE.MeshBasicMaterial({ map: tex, alphaMap: mask, transparent: true, toneMapped: false, depthWrite: false }));
        const mesh = new THREE.Mesh(track(new THREE.PlaneGeometry(1, 1)), mat);
        root.add(mesh);

        const lineMat = track(
          new THREE.ShaderMaterial({
            vertexShader: trailVertex,
            fragmentShader: trailFragment,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            uniforms: { uHead: { value: 0 }, uColor: { value: i % 3 === 0 ? accent.clone() : data.clone() } },
          })
        );
        const line = new THREE.Line(track(new THREE.BufferGeometry()), lineMat);
        line.frustumCulled = false;
        root.add(line);

        tiles.push({
          mesh,
          mat,
          curve: new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]),
          line,
          lineMat,
          speed: 0.05 + rand(i * 9.1) * 0.035,
          u: rand(i * 4.7),
          push: new THREE.Vector3(),
          index: i,
        });
      });

      const rebuildCurves = () => {
        tiles.forEach((tile) => {
          const { start, mid1, mid2 } = buildCurve(tile.index);
          tile.curve.points[0].copy(start);
          tile.curve.points[1].copy(mid1);
          tile.curve.points[2].copy(mid2);
          tile.curve.points[3].copy(hubPos);
          const pts = tile.curve.getPoints(80);
          const arr = new Float32Array(pts.length * 3);
          const ts = new Float32Array(pts.length);
          pts.forEach((p, k) => {
            arr[k * 3] = p.x;
            arr[k * 3 + 1] = p.y;
            arr[k * 3 + 2] = p.z;
            ts[k] = k / (pts.length - 1);
          });
          tile.line.geometry.setAttribute("position", new THREE.BufferAttribute(arr, 3));
          tile.line.geometry.setAttribute("aT", new THREE.BufferAttribute(ts, 1));
        });
      };

      const cardCanvas = document.createElement("canvas");
      cardCanvas.width = 640;
      cardCanvas.height = 300;
      const cctx = cardCanvas.getContext("2d");
      const cardTex = track(new THREE.CanvasTexture(cardCanvas));
      cardTex.colorSpace = THREE.SRGBColorSpace;
      const logoImages: Record<string, HTMLImageElement> = {};
      providers.forEach((p) => {
        const img = new Image();
        img.src = `/assets/logos/${p.file}.png`;
        logoImages[p.file] = img;
      });

      const drawCard = (provider: (typeof providers)[number], price: number, saved: number) => {
        if (!cctx) return;
        const w = 640;
        const h = 300;
        cctx.clearRect(0, 0, w, h);
        cctx.fillStyle = "rgba(12,15,22,0.82)";
        cctx.strokeStyle = "rgba(255,255,255,0.18)";
        cctx.lineWidth = 2;
        cctx.beginPath();
        cctx.roundRect(4, 4, w - 8, h - 8, 34);
        cctx.fill();
        cctx.stroke();
        cctx.fillStyle = "#ff5a2b";
        cctx.beginPath();
        cctx.arc(48, 52, 7, 0, Math.PI * 2);
        cctx.fill();
        cctx.fillStyle = "rgba(255,255,255,0.6)";
        cctx.font = "500 22px ui-monospace, Menlo, monospace";
        cctx.fillText("BEST FARE · BLR → GOI", 68, 60);
        cctx.fillStyle = "#fff";
        cctx.font = "700 112px 'Helvetica Neue', Arial, sans-serif";
        cctx.fillText(`₹${price.toLocaleString("en-IN")}`, 40, 178);
        const img = logoImages[provider.file];
        if (img && img.complete && img.naturalWidth) {
          cctx.save();
          cctx.beginPath();
          cctx.roundRect(40, 208, 56, 56, 14);
          cctx.clip();
          cctx.drawImage(img, 40, 208, 56, 56);
          cctx.restore();
        }
        cctx.fillStyle = "#fff";
        cctx.font = "600 30px 'Helvetica Neue', Arial, sans-serif";
        cctx.fillText(provider.name, 112, 245);
        cctx.fillStyle = "rgba(255,255,255,0.55)";
        cctx.font = "500 20px ui-monospace, Menlo, monospace";
        cctx.fillText(`saves ₹${saved} · simulated`, 360, 245);
        cardTex.needsUpdate = true;
      };

      const card = new THREE.Mesh(
        track(new THREE.PlaneGeometry(1, 300 / 640)),
        track(new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, toneMapped: false, depthWrite: false }))
      );
      card.scale.setScalar(3.9);
      root.add(card);
      drawCard(providers[2], 4760, 155);

      const beamMat = track(
        new THREE.ShaderMaterial({
          vertexShader: trailVertex,
          fragmentShader: trailFragment,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uHead: { value: 1 }, uColor: { value: accent.clone() } },
        })
      );
      const beam = new THREE.Line(track(new THREE.BufferGeometry()), beamMat);
      beam.frustumCulled = false;
      root.add(beam);

      const layout = () => {
        const aspect = camera.aspect;
        const halfH = Math.tan((camera.fov * Math.PI) / 360) * CAM_Z;
        const halfW = halfH * aspect;
        if (aspect < 0.85) {
          hubPos.set(0, halfH * 0.34, 0);
          cardPos.set(0, hubPos.y - 2.6, 0.2);
          card.scale.setScalar(Math.min(3.6, halfW * 1.7));
        } else {
          hubPos.set(halfW * 0.56, halfH * 0.2, 0);
          cardPos.set(hubPos.x + 0.1, hubPos.y - halfH * 0.62, 0.2);
          card.scale.setScalar(Math.min(4.0, halfW * 0.46));
        }
        hub.position.copy(hubPos);
        card.position.copy(cardPos);
        const bp = [hubPos.clone().add(new THREE.Vector3(0, -0.7, 0)), cardPos.clone().add(new THREE.Vector3(0, card.scale.x * 0.23, 0))];
        const bArr = new Float32Array(bp.length * 3);
        bp.forEach((p, k) => {
          bArr[k * 3] = p.x;
          bArr[k * 3 + 1] = p.y;
          bArr[k * 3 + 2] = p.z;
        });
        beam.geometry.setAttribute("position", new THREE.BufferAttribute(bArr, 3));
        beam.geometry.setAttribute("aT", new THREE.BufferAttribute(new Float32Array([0, 1]), 1));
        rebuildCurves();
      };

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2(9, 9);
      const pointerWorld = new THREE.Vector3(999, 999, 0);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      let pointerActive = false;

      const onMove = (event: PointerEvent) => {
        const box = host.getBoundingClientRect();
        pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        raycaster.ray.intersectPlane(plane, pointerWorld);
        pointerActive = true;
      };
      const onLeave = () => {
        pointerActive = false;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);

      let scrollP = 0;
      const onScroll = () => {
        scrollP = Math.min(Math.max(window.scrollY / Math.max(host.clientHeight, 1), 0), 1);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        layout();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      resize();

      let visible = true;
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      io.observe(host);

      let flash = 0;
      let winnerIndex = 2;
      const tmp = new THREE.Vector3();
      const dir = new THREE.Vector3();
      const startedAt = performance.now();
      let last = startedAt;

      const place = (tile: Tile, advance: number) => {
        tile.u += advance * tile.speed;
        if (tile.u >= 1) {
          tile.u -= 1;
          flash = Math.min(flash + 0.55, 1);
          pulse();
          if (tile.index === winnerIndex) {
            const price = 4600 + Math.floor(rand(performance.now() * 0.001) * 260);
            drawCard(providers[tile.index], price, 120 + Math.floor(rand(price) * 220));
            winnerIndex = Math.floor(rand(performance.now() * 0.013) * providers.length);
          }
        }
        const eased = tile.u * tile.u * (3 - 2 * tile.u) * 0.35 + tile.u * 0.65;
        tile.curve.getPoint(eased, tmp);
        tile.curve.getTangent(eased, dir);

        if (pointerActive) {
          const dx = tmp.x - pointerWorld.x;
          const dy = tmp.y - pointerWorld.y;
          const d = Math.hypot(dx, dy);
          if (d < 2.2 && d > 0.0001) {
            const f = ((2.2 - d) / 2.2) * 0.08;
            tile.push.x += (dx / d) * f;
            tile.push.y += (dy / d) * f;
          }
        }
        tile.push.multiplyScalar(0.93);
        tile.mesh.position.copy(tmp).add(tile.push);

        const scale = 1.05 - eased * 0.78;
        tile.mesh.scale.setScalar(Math.max(scale, 0.1));
        tile.mesh.rotation.z = Math.sin(tile.u * 6 + tile.index) * 0.18;
        const fadeIn = Math.min(tile.u / 0.08, 1);
        const fadeOut = 1 - Math.max((tile.u - 0.9) / 0.1, 0);
        tile.mat.opacity = fadeIn * fadeOut * (tile.index === winnerIndex ? 1 : 0.9);
        tile.lineMat.uniforms.uHead.value = Math.min(eased + 0.02, 1);
      };

      const frame = () => {
        raf = window.requestAnimationFrame(frame);
        if (!visible || document.hidden) {
          last = performance.now();
          return;
        }
        const now = performance.now();
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        const t = (now - startedAt) / 1000;

        tiles.forEach((tile) => place(tile, dt));

        flash *= 0.94;
        core.scale.setScalar(1 + flash * 0.6);
        (halo.material as InstanceType<typeof THREE.SpriteMaterial>).opacity = 0.55 + flash * 0.45;
        halo.scale.setScalar(4 + flash * 1.6);
        shell.rotation.y = t * 0.25;
        shell.rotation.x = t * 0.15;
        rings.forEach((ring) => {
          if (ring.t < 1) {
            ring.t += dt * 0.6;
            ring.mesh.scale.setScalar(1 + ring.t * 5);
            ring.mat.opacity = (1 - ring.t) * 0.45;
          } else {
            ring.mat.opacity = 0;
          }
        });
        dust.rotation.y = t * 0.012;

        camera.position.z = CAM_Z - scrollP * 4.5;
        camera.position.y = -scrollP * 0.8;
        camera.lookAt(0, -scrollP * 0.4, 0);
        renderer.domElement.style.opacity = String(1 - scrollP * 0.85);

        renderer.render(scene, camera);
      };

      if (reduce) {
        tiles.forEach((tile, i) => place(tile, 0.1 + i * 0.03));
        renderer.render(scene, camera);
      } else {
        frame();
      }

      dispose = () => {
        window.cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("pointerleave", onLeave);
        resizeObserver.disconnect();
        io.disconnect();
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
  }, []);

  return <div ref={hostRef} className="hero-scene" aria-hidden="true" />;
}
