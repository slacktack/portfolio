import * as THREE from "three";
import { canvasTexture, mountScene, type Built, type Ctx, type Handle } from "./kit";
import { makeArtefacts, slab } from "./objects";

function finaleBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;

  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x8a2a1c, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(-6, 8, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.8);
  fill.position.set(8, -2, 6);
  scene.add(fill);

  // hard offset silhouettes stand in for shadows: same look on every GPU
  const rr = (w: number, h: number, r: number) => {
    const sh = new THREE.Shape();
    sh.moveTo(-w / 2 + r, -h / 2);
    sh.lineTo(w / 2 - r, -h / 2);
    sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    sh.lineTo(w / 2, h / 2 - r);
    sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    sh.lineTo(-w / 2 + r, h / 2);
    sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    sh.lineTo(-w / 2, -h / 2 + r);
    sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return new THREE.ShapeGeometry(sh, 8);
  };
  const shadowMat = ctx.track(new THREE.MeshBasicMaterial({ color: 0x3a0d0a, transparent: true, opacity: 0.5, depthWrite: false }));
  const shadowOf = (w: number, h: number, r: number) => {
    const m = new THREE.Mesh(ctx.track(rr(w, h, r)), shadowMat);
    m.renderOrder = -1;
    scene.add(m);
    return m;
  };
  const follow = (sh: THREE.Mesh, o: THREE.Object3D, k = 1) => {
    const lift = Math.abs(o.position.z) * 0.1;
    sh.position.set(o.position.x + 0.36 * k + lift, o.position.y - 0.46 * k - lift, -1.4);
    sh.rotation.z = o.rotation.z;
    sh.scale.set(o.scale.x * Math.max(Math.abs(Math.cos(o.rotation.y)), 0.35), o.scale.y, 1);
  };

  // pager
  const pager = new THREE.Group();
  const body = new THREE.Mesh(slab(2.9, 4, 1, 0.34), new THREE.MeshStandardMaterial({ color: 0x17110f, roughness: 0.32, metalness: 0.25 }));
  const bezel = new THREE.Mesh(slab(2.35, 1.5, 0.12, 0.1), new THREE.MeshStandardMaterial({ color: 0x2a201c, roughness: 0.4 }));
  bezel.position.set(0, 0.85, 0.5);
  pager.add(body, bezel);

  const lcd = document.createElement("canvas");
  lcd.width = 512;
  lcd.height = 300;
  const lg = lcd.getContext("2d");
  const lcdTex = ctx.track(new THREE.CanvasTexture(lcd));
  lcdTex.colorSpace = THREE.SRGBColorSpace;
  const lines = ["PAGE 03:12  P0", "hotel-compare p99 4.5s", "someone is awake.", "have a hard problem?", "say hello >"];
  let lcdKey = "";
  const paintLcd = (t: number) => {
    if (!lg) return;
    const shift = Math.floor(t / 1.8) % lines.length;
    const blink = Math.floor(t * 2) % 2;
    const k = `${shift}${blink}`;
    if (k === lcdKey) return;
    lcdKey = k;
    lg.fillStyle = "#cfe0bd";
    lg.fillRect(0, 0, 512, 300);
    lg.fillStyle = "rgba(20,36,16,0.08)";
    for (let y = 0; y < 300; y += 4) lg.fillRect(0, y, 512, 1);
    lg.fillStyle = "#16240f";
    lg.font = "700 38px 'Courier New', monospace";
    for (let i = 0; i < 4; i += 1) {
      const text = lines[(shift + i) % lines.length];
      lg.globalAlpha = i === 0 ? 1 : 0.55;
      lg.fillText(text.toUpperCase().slice(0, 21), 24, 62 + i * 62);
    }
    lg.globalAlpha = 1;
    if (blink) lg.fillRect(24, 262, 22, 8);
    lcdTex.needsUpdate = true;
  };
  paintLcd(0);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 1.22), new THREE.MeshBasicMaterial({ map: lcdTex }));
  screen.position.set(0, 0.85, 0.57);
  pager.add(screen);

  const btnMat = [0xf4e6c8, 0xd3281b, 0xf4e6c8].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.4 }));
  btnMat.forEach((m, i) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 24), m);
    b.rotation.x = Math.PI / 2;
    b.position.set(-0.8 + i * 0.8, -0.55, 0.52);
    pager.add(b);
  });
  for (let i = 0; i < 6; i += 1) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.05), new THREE.MeshStandardMaterial({ color: 0x050403 }));
    g.position.set(0, -1.18 - i * 0.12, 0.5);
    pager.add(g);
  }
  const brand = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.2), new THREE.MeshBasicMaterial({ map: ctx.track(canvasTexture(256, 44, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#d8a948";
    g.font = "700 30px system-ui, sans-serif";
    g.fillText("ON-CALL", 8, 32);
  })), transparent: true }));
  brand.position.set(-0.6, 1.72, 0.51);
  pager.add(brand);
  scene.add(pager);
  const pagerShadow = shadowOf(2.9, 4, 0.34);

  const rings = Array.from({ length: 3 }, () => {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 96), new THREE.MeshBasicMaterial({ color: 0xfff6e6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
    m.position.set(0, 0, -0.6);
    scene.add(m);
    return m;
  });

  const { pass, key: key2, p99, receipt } = makeArtefacts(ctx);

  const items = [
    { o: pass, x: -3.5, y: 2.5, z: -0.6, rz: -0.14, ry: 0.32, par: 1.0, ph: 0 },
    { o: key2, x: 3.6, y: 2.45, z: -0.4, rz: 0.16, ry: -0.35, par: 1.3, ph: 1.4 },
    { o: receipt, x: -3.6, y: -2.2, z: 0.4, rz: 0.1, ry: 0.28, par: 1.5, ph: 2.6 },
    { o: p99, x: 3.5, y: -2.25, z: 0.2, rz: -0.1, ry: -0.3, par: 1.1, ph: 3.7 },
  ];
  items.forEach((it) => scene.add(it.o));
  const sizes: [number, number, number][] = [[3.5, 1.45, 0.14], [2.3, 1.45, 0.14], [1.9, 2.5, 0.05], [2.9, 1.65, 0.2]];
  const itemShadows = sizes.map(([w, h, r]) => shadowOf(w, h, r));

  let narrow = false;
  return {
    resize(aspect) {
      narrow = aspect < 1.1;
      camera.fov = 34;
      camera.position.set(0, 0, narrow ? 21 : 15);
      camera.updateProjectionMatrix();
    },
    update(p, t) {
      void p;
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      paintLcd(t);

      // the pager buzzes in bursts
      const cyc = t % 3.4;
      const buzz = cyc < 0.7 ? Math.sin(t * 75) * 0.035 * (1 - cyc / 0.7) : 0;
      const alive = cyc < 1.6 ? 1 : 0;
      pager.position.set(narrow ? 0 : -0.1 + buzz, -0.1 + Math.sin(t * 0.9) * 0.12, 0.2);
      pager.rotation.set(-0.05 + py * 0.12, -0.2 + px * 0.3 + Math.sin(t * 0.5) * 0.06, 0.04 + buzz * 2.4);
      pager.scale.setScalar(narrow ? 0.75 : 1.08);
      rings.forEach((r, i) => {
        const k = ((cyc - i * 0.22) / 1.5);
        const on = alive && k > 0 && k < 1;
        const m = r.material as THREE.MeshBasicMaterial;
        m.opacity = on ? Math.pow(1 - k, 1.6) * 0.5 : 0;
        r.scale.setScalar(2.2 + (on ? k : 0) * 2.3);
      });

      follow(pagerShadow, pager, 1.4);
      items.forEach((it, i) => {
        const s = narrow ? 0.62 : 1;
        it.o.position.set(
          (it.x + px * 0.5 * it.par) * s * (narrow ? 0.95 : 1),
          (it.y + Math.sin(t * 0.8 + it.ph) * 0.18 + -py * 0.3 * it.par) * s,
          it.z
        );
        it.o.rotation.set(Math.sin(t * 0.6 + it.ph) * 0.08 - py * 0.15, it.ry + px * 0.25 + Math.sin(t * 0.5 + it.ph) * 0.12, it.rz + Math.sin(t * 0.7 + i) * 0.03);
        it.o.scale.setScalar(s);
        follow(itemShadows[i], it.o);
      });
      ctx.setFade(0);
    },
  };
}

export function mountFinaleScene(opts: Pick<Parameters<typeof mountScene>[0], "host" | "mode" | "wrap" | "onProgress" | "loopSeconds">): Handle | null {
  return mountScene({ ...opts, fov: 34, exposure: 1, transparent: true, build: finaleBuild });
}
