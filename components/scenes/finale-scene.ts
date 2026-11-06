import * as THREE from "three";
import { canvasTexture, font, mountScene, type Built, type Ctx, type Handle } from "./kit";
import { faceGeo, makeArtefacts, slab, softShadow } from "./objects";

function finaleBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;

  scene.add(new THREE.HemisphereLight(0xfff0e0, 0x5a1a12, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-6, 8, 9);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffc9a0, 0.5);
  fill.position.set(8, -2, 6);
  scene.add(fill);

  // pre-blurred contact shadows, same look on every GPU
  const shadowOf = (w: number, h: number) => {
    const m = softShadow(ctx, w, h);
    (m.material as THREE.MeshBasicMaterial).color.set(0x5a140c);
    (m.material as THREE.MeshBasicMaterial).opacity = 0.55;
    m.renderOrder = -1;
    scene.add(m);
    return m;
  };
  const follow = (sh: THREE.Mesh, o: THREE.Object3D, k = 1) => {
    const lift = Math.abs(o.position.z) * 0.1;
    sh.position.set(o.position.x + 0.22 * k + lift, o.position.y - 0.34 * k - lift, -1.4);
    sh.rotation.z = o.rotation.z;
    sh.scale.set(o.scale.x * Math.max(Math.abs(Math.cos(o.rotation.y)), 0.35), o.scale.y, 1);
  };

  // pager
  const pager = new THREE.Group();
  const body = new THREE.Mesh(slab(2.9, 4, 0.5, 0.26), new THREE.MeshStandardMaterial({ color: 0x1a1a1e, roughness: 0.38, metalness: 0.45 }));
  const bezel = new THREE.Mesh(slab(2.4, 1.52, 0.04, 0.08), new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.2, metalness: 0.2 }));
  bezel.position.set(0, 0.85, 0.25);
  pager.add(body, bezel);

  const lcd = document.createElement("canvas");
  lcd.width = 1024;
  lcd.height = 600;
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
    const grad = lg.createLinearGradient(0, 0, 0, 600);
    grad.addColorStop(0, "#dcd6c4");
    grad.addColorStop(1, "#c9c2ad");
    lg.fillStyle = grad;
    lg.fillRect(0, 0, 1024, 600);
    lg.fillStyle = "rgba(18,17,14,0.035)";
    for (let y = 0; y < 600; y += 6) lg.fillRect(0, y, 1024, 2);
    lg.fillStyle = "#1a1a16";
    lg.font = `500 66px ${font.mono}`;
    for (let i = 0; i < 4; i += 1) {
      const text = lines[(shift + i) % lines.length];
      lg.globalAlpha = i === 0 ? 1 : 0.5;
      lg.fillText(text.toUpperCase().slice(0, 22), 48, 124 + i * 124);
    }
    lg.globalAlpha = 1;
    lg.fillStyle = "#e8491d";
    if (blink) lg.fillRect(48, 528, 40, 12);
    lcdTex.needsUpdate = true;
  };
  paintLcd(0);
  lcdTex.anisotropy = 8;
  const screen = new THREE.Mesh(faceGeo(2.2, 1.3, 0.05), new THREE.MeshBasicMaterial({ map: lcdTex }));
  screen.position.set(0, 0.85, 0.275);
  pager.add(screen);

  const btnMat = [0x2c2c31, 0xe8491d, 0x2c2c31].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.35, metalness: 0.3 }));
  btnMat.forEach((m, i) => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 40), m);
    b.rotation.x = Math.PI / 2;
    b.position.set(-0.75 + i * 0.75, -0.55, 0.26);
    pager.add(b);
  });
  const grille = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.6 });
  for (let i = 0; i < 6; i += 1) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.025, 0.02), grille);
    g.position.set(0, -1.12 - i * 0.11, 0.25);
    pager.add(g);
  }
  const brand = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.2), new THREE.MeshBasicMaterial({ map: ctx.track(canvasTexture(768, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "rgba(242,239,230,0.6)";
    g.font = `500 64px ${font.mono}`;
    g.fillText("ON-CALL", 8, 92);
  })), transparent: true }));
  brand.position.set(-0.6, 1.74, 0.255);
  pager.add(brand);
  scene.add(pager);
  const pagerShadow = shadowOf(2.9, 4);

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
  const sizes: [number, number][] = [[3.5, 1.45], [2.3, 1.45], [1.9, 2.5], [2.9, 1.65]];
  const itemShadows = sizes.map(([w, h]) => shadowOf(w, h));

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
        m.opacity = on ? Math.pow(1 - k, 1.6) * 0.35 : 0;
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
