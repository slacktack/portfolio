import * as THREE from "three";
import { mountScene, type Built, type Ctx, type Handle } from "./kit";
import { makeBrowser, roundedRect } from "./objects";

type Slot = { nx: number; ny: number; s: number; rz: number; ry: number; depth: number };
type Item = {
  o: THREE.Object3D;
  w: number;
  h: number;
  r: number;
  wide: Slot;
  narrow: Slot | null;
  shadow: THREE.Mesh;
  off: THREE.Vector2;
  home: THREE.Vector3;
};

const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);

function heroBuild(ctx: Ctx): Built {
  const { scene, camera, renderer } = ctx;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xffd2b0, 1.05));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(-5, 8, 10);
  scene.add(key);

  const shadowMat = ctx.track(new THREE.MeshBasicMaterial({ color: 0x3a1a14, transparent: true, opacity: 0.16, depthWrite: false }));

  const mk = (o: THREE.Object3D, w: number, h: number, r: number, wide: Slot, narrow: Slot | null): Item => {
    scene.add(o);
    const shadow = new THREE.Mesh(ctx.track(roundedRect(w, h, r)), shadowMat);
    shadow.renderOrder = -1;
    scene.add(shadow);
    return { o, w, h, r, wide, narrow, shadow, off: new THREE.Vector2(), home: new THREE.Vector3() };
  };

  const BW = 3.68;
  const BH = 2.63;
  const items: Item[] = [
    mk(makeBrowser(ctx, "/assets/hero/flight-tracker.jpg", "flight-tracker-gamma-seven.vercel.app"), BW, BH, 0.2, { nx: -0.76, ny: 0.4, s: 0.8, rz: -0.08, ry: 0.28, depth: 0.5 }, { nx: -0.47, ny: 0.62, s: 0.46, rz: -0.1, ry: 0.2, depth: 0.4 }),
    mk(makeBrowser(ctx, "/assets/video/bh-flights.jpg", "buyhatke.com/flights"), BW, BH, 0.2, { nx: 0.76, ny: 0.42, s: 0.8, rz: 0.07, ry: -0.28, depth: 0.8 }, { nx: 0.47, ny: 0.55, s: 0.46, rz: 0.1, ry: -0.2, depth: 0.6 }),
    mk(makeBrowser(ctx, "/assets/hero/train-tracker.jpg", "train-tracker-zeta.vercel.app"), BW, BH, 0.2, { nx: -0.76, ny: -0.42, s: 0.8, rz: 0.06, ry: 0.25, depth: 0.6 }, null),
    mk(makeBrowser(ctx, "/assets/video/bh-hotels.jpg", "buyhatke.com/hotels"), BW, BH, 0.2, { nx: 0.76, ny: -0.44, s: 0.8, rz: -0.06, ry: -0.25, depth: 0.7 }, null),
  ];


  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const hit = new THREE.Vector3();
  let drag: { it: Item; grab: THREE.Vector2 } | null = null;
  let layout: "wide" | "mid" | "narrow" = "wide";
  let hx = 8;
  let hy = 4.3;

  const toNdc = (e: PointerEvent) => {
    const r = renderer.domElement.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    return r;
  };
  const down = (e: PointerEvent) => {
    if (e.pointerType === "touch" || layout === "narrow") return;
    if ((e.target as Element | null)?.closest?.("a,button,input,textarea,[role=dialog]")) return;
    const r = toNdc(e);
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    raycaster.setFromCamera(ndc, camera);
    let best: { it: Item; d: number } | null = null;
    items.forEach((it) => {
      const h = raycaster.intersectObject(it.o, true)[0];
      if (h && (!best || h.distance < best.d)) best = { it, d: h.distance };
    });
    const found = best as { it: Item; d: number } | null;
    if (!found) return;
    plane.constant = -found.it.o.position.z;
    raycaster.ray.intersectPlane(plane, hit);
    drag = { it: found.it, grab: new THREE.Vector2(hit.x - found.it.o.position.x, hit.y - found.it.o.position.y) };
    document.body.style.cursor = "grabbing";
  };
  const move = (e: PointerEvent) => {
    if (!drag) return;
    toNdc(e);
    raycaster.setFromCamera(ndc, camera);
    plane.constant = -drag.it.o.position.z;
    if (raycaster.ray.intersectPlane(plane, hit)) {
      drag.it.off.set(hit.x - drag.grab.x - drag.it.home.x, hit.y - drag.grab.y - drag.it.home.y);
    }
  };
  const up = () => {
    drag = null;
    document.body.style.cursor = "";
  };
  window.addEventListener("pointerdown", down);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);

  let started = -1;

  return {
    resize(aspect) {
      layout = aspect < 0.85 ? "narrow" : aspect < 1.4 ? "mid" : "wide";
      camera.fov = 34;
      camera.position.set(0, 0, 14);
      camera.updateProjectionMatrix();
      hy = Math.tan(THREE.MathUtils.degToRad(17)) * 14;
      hx = hy * aspect;
    },
    update(p, t, dt) {
      void p;
      if (started < 0) started = t;
      const age = t - started;
      const sy = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.3);
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;

      items.forEach((it, i) => {
        const slot = layout === "narrow" ? it.narrow : it.wide;
        const show = !!slot;
        it.o.visible = show;
        it.shadow.visible = show;
        if (!slot) return;
        const sc = slot.s * (layout === "mid" ? 0.78 : 1);
        const k = easeOutBack(Math.min(Math.max((age - i * 0.1) / 0.9, 0), 1));
        const arrive = Math.min(Math.max((age - i * 0.1) / 0.9, 0), 1);
        it.home.set(
          slot.nx * hx + (slot.nx > 0 ? 1 : -1) * sy * 1.2 * slot.depth + px * 0.3 * slot.depth,
          slot.ny * hy + sy * (1 + slot.depth) * 1.1 - py * 0.2 * slot.depth + Math.sin(t * 0.8 + i * 1.3) * 0.12,
          sy * 2 * slot.depth
        );
        if (!drag || drag.it !== it) it.off.multiplyScalar(Math.max(0, 1 - dt * 3));
        const drop = (1 - k) * 7;
        it.o.position.set(it.home.x + it.off.x, it.home.y + it.off.y + drop, it.home.z + (drag?.it === it ? 1.2 : 0));
        it.o.rotation.set(
          Math.sin(t * 0.6 + i) * 0.05 + py * 0.1 + (1 - arrive) * 0.9,
          slot.ry + px * 0.22 + Math.sin(t * 0.5 + i) * 0.08,
          slot.rz + (1 - arrive) * 1.4 + it.off.x * 0.04
        );
        it.o.scale.setScalar(sc * (0.6 + 0.4 * arrive));

        const lift = Math.abs(it.o.position.z) * 0.03 + 0.1;
        it.shadow.position.set(it.o.position.x + 0.22 * sc + lift, it.o.position.y - 0.3 * sc - lift, -1.2);
        it.shadow.rotation.z = it.o.rotation.z;
        it.shadow.scale.set(it.o.scale.x * Math.max(Math.abs(Math.cos(it.o.rotation.y)), 0.4), it.o.scale.y, 1);
        (it.shadow.material as THREE.MeshBasicMaterial).opacity = 0.16 * arrive;
      });

      ctx.setFade(0);
    },
    dispose() {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      document.body.style.cursor = "";
    },
  };
}

export function mountHeroScene(opts: Pick<Parameters<typeof mountScene>[0], "host" | "mode" | "wrap" | "onProgress" | "loopSeconds">): Handle | null {
  return mountScene({ ...opts, fov: 34, exposure: 1, transparent: true, maxDpr: 1.5, build: heroBuild });
}
