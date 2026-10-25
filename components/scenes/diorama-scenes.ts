import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { canvasTexture, mountScene, smooth, type Built, type Ctx, type Handle } from "./kit";
import { card } from "./objects";

type Opts = Pick<Parameters<typeof mountScene>[0], "host" | "mode" | "wrap" | "onProgress" | "loopSeconds">;

const mix = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const easeOutBack = (x: number) => 1 + 2.2 * Math.pow(x - 1, 3) + 1.2 * Math.pow(x - 1, 2);
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// frame the composition so nothing is ever cropped, whatever the container's shape
function fit(ctx: Ctx, aspect: number, halfW = 6.8, halfH = 3.9) {
  const fov = aspect < 1.25 ? 44 : 32;
  const t = Math.tan(THREE.MathUtils.degToRad(fov / 2));
  ctx.camera.fov = fov;
  ctx.camera.position.z = Math.max(halfH / t, halfW / (t * aspect)) * 1.06;
  ctx.camera.updateProjectionMatrix();
}

function lights(ctx: Ctx, z = 12.5) {
  ctx.scene.add(new THREE.HemisphereLight(0xffffff, 0xfff0e0, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.3);
  key.position.set(-5, 8, 10);
  ctx.scene.add(key);
  ctx.camera.position.set(0, 0, z);
}

// a soft contact shadow on the "table" under a floating object
function blob(ctx: Ctx, w: number, d: number) {
  const tex = ctx.track(canvasTexture(128, 128, (g, cw, ch) => {
    const grad = g.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, cw / 2);
    grad.addColorStop(0, "rgba(40,24,18,0.38)");
    grad.addColorStop(1, "rgba(40,24,18,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, cw, ch);
  }, false));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  ctx.scene.add(m);
  return m;
}

function label(ctx: Ctx, w: number, h: number, draw: (g: CanvasRenderingContext2D, cw: number, ch: number) => void, px = 300) {
  const tex = ctx.track(canvasTexture(Math.round(w * px), Math.round(h * px), draw));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
  return { m, tex };
}

const logoCache = new Map<string, HTMLImageElement>();
function logoImg(name: string, onLoad?: () => void): HTMLImageElement {
  let img = logoCache.get(name);
  if (!img) {
    img = new Image();
    img.src = `/assets/logos/${name}.png`;
    logoCache.set(name, img);
  }
  if (!img.complete && onLoad) img.addEventListener("load", onLoad, { once: true });
  return img;
}

// a white chip with the brand mark inside, scaled to fit without distortion
function drawChip(g: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, pad = 0.14, round = 0.28) {
  g.save();
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.roundRect(x, y, w, h, Math.min(w, h) * round);
  g.fill();
  if (img.complete && img.naturalWidth) {
    const iw = w * (1 - pad * 2);
    const ih = h * (1 - pad * 2);
    const sc = Math.min(iw / img.naturalWidth, ih / img.naturalHeight);
    const dw = img.naturalWidth * sc;
    const dh = img.naturalHeight * sc;
    g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  g.restore();
}

function labelLive(ctx: Ctx, w: number, h: number, draw: (g: CanvasRenderingContext2D, cw: number, ch: number) => void, px = 300) {
  const l = label(ctx, w, h, draw, px);
  const cv = l.tex.image as HTMLCanvasElement;
  const redraw = () => {
    const g = cv.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, cv.width, cv.height);
    draw(g, cv.width, cv.height);
    l.tex.needsUpdate = true;
  };
  return { ...l, redraw };
}

const rrect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

// ---------- Best way to pay: three offers fly in and settle on one price ----------
function payBuild(ctx: Ctx): Built {
  const { scene } = ctx;
  lights(ctx);
  const icici = card(ctx, 3.6, 2.27, 0.08, 0.2, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#f7903f");
    grad.addColorStop(1, "#c2410c");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.13)";
    g.beginPath();
    g.arc(w * 0.88, h * 0.05, h * 0.75, 0, Math.PI * 2);
    g.fill();
    const cg = g.createLinearGradient(50, 190, 160, 290);
    cg.addColorStop(0, "#f4d98a");
    cg.addColorStop(1, "#b8953c");
    g.fillStyle = cg;
    rrect(g, 56, h * 0.36, 130, 98, 18);
    g.fill();
    drawChip(g, logoImg("icici", () => (icici.userData.redraw as () => void)()), 50, 40, 420, 100, 0.12, 0.3);
    g.fillStyle = "#fff";
    g.font = "600 38px 'Courier New', monospace";
    g.fillText("•••• •••• •••• 4821", 56, h - 128);
    drawChip(g, logoImg("amazon", () => (icici.userData.redraw as () => void)()), 56, h - 112, 260, 72, 0.16, 0.3);
    g.fillStyle = "#fff";
    g.font = "800 48px system-ui, sans-serif";
    g.fillText("Pay", 336, h - 60);
  }, 0xfff1e0);

  const voucher = card(ctx, 3.2, 2, 0.07, 0.2, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#14857a");
    grad.addColorStop(1, "#0b4f4a");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    // a small gift icon, not a flag
    const gx = w - 190;
    const gy = 44;
    g.fillStyle = "#f4d98a";
    rrect(g, gx, gy + 40, 130, 100, 12);
    g.fill();
    rrect(g, gx - 8, gy + 20, 146, 40, 10);
    g.fill();
    g.fillStyle = "#0b4f4a";
    g.fillRect(gx + 55, gy + 20, 20, 120);
    g.beginPath();
    g.ellipse(gx + 40, gy + 6, 30, 18, -0.4, 0, Math.PI * 2);
    g.ellipse(gx + 90, gy + 6, 30, 18, 0.4, 0, Math.PI * 2);
    g.fill();
    drawChip(g, logoImg("amazon", () => (voucher.userData.redraw as () => void)()), 52, h - 100, 260, 72, 0.16, 0.3);
    g.fillStyle = "#f4d98a";
    g.font = "700 38px 'Courier New', monospace";
    g.fillText("GIFT VOUCHER", 52, 90);
    g.fillStyle = "#fff";
    g.font = "800 130px system-ui, sans-serif";
    g.fillText("₹500", 48, h - 118);
  }, 0xf6e6c0);

  const coupon = card(ctx, 3.3, 1.4, 0.06, 0.16, (g, w, h) => {
    g.fillStyle = "#14110f";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#f0b27a";
    g.font = "800 128px system-ui, sans-serif";
    g.fillText("EXTRA 5%", 44, h * 0.6);
    g.fillStyle = "rgba(255,255,255,0.75)";
    g.font = "700 34px 'Courier New', monospace";
    g.fillText("COUPON · AT CHECKOUT", 48, h - 40);
    g.setLineDash([14, 12]);
    g.strokeStyle = "rgba(255,255,255,0.4)";
    g.lineWidth = 4;
    g.strokeRect(20, 20, w - 40, h - 40);
  }, 0xd8a948);
  [icici, voucher, coupon].forEach((o) => scene.add(o));

  const tag = label(ctx, 3.9, 1.95, () => {}, 300);
  const cv = tag.tex.image as HTMLCanvasElement;
  let lastK = -1;
  const paintTag = (k: number) => {
    const g = cv.getContext("2d");
    if (!g) return;
    const w = cv.width;
    const h = cv.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#fffdf6";
    rrect(g, 6, 6, w - 12, h - 12, 54);
    g.fill();
    g.strokeStyle = "#12110e";
    g.lineWidth = 6;
    g.stroke();
    g.fillStyle = "#6b6860";
    g.font = "700 38px 'Courier New', monospace";
    g.fillText("CART TOTAL", 58, 88);
    const total = mix(159999, 151999.05, k);
    g.fillStyle = "#12110e";
    g.font = "800 112px system-ui, sans-serif";
    g.fillText("₹" + Math.round(total).toLocaleString("en-IN"), 56, 220);
    g.fillStyle = k > 0.98 ? "#1f9d55" : "rgba(31,157,85,0.18)";
    rrect(g, 56, 262, w - 112, 100, 50);
    g.fill();
    g.fillStyle = k > 0.98 ? "#fff" : "rgba(31,100,60,0.5)";
    g.font = "800 50px system-ui, sans-serif";
    g.fillText("You can save ₹7,999.95", 90, 330);
    tag.tex.needsUpdate = true;
  };
  paintTag(0);
  scene.add(tag.m);
  const shadow = blob(ctx, 12, 4);
  shadow.position.y = -3.4;

  return {
    resize(aspect) {
      fit(ctx, aspect);
    },
    update(p, t) {
      const bob = (n: number) => Math.sin(t * 0.9 + n) * 0.08;
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      const fly = (o: THREE.Object3D, from: [number, number], to: [number, number], z: number, ry: number, rz: number, a: number, b: number, n: number) => {
        const k = seg(p, a, b);
        const e = easeOutBack(k);
        o.position.set(mix(from[0], to[0], e) + px * 0.25, mix(from[1], to[1], e) + bob(n), z + (1 - k) * 1.5);
        o.rotation.set(-py * 0.1 + (1 - k) * 0.6, mix(ry * 2, ry, k) + px * 0.2, mix(rz * 3, rz, k));
        o.scale.setScalar(0.6 + 0.4 * Math.min(1, k * 1.4));
      };
      fly(icici, [-8, 2.6], [-3.9, 0.7], 0.4, 0.28, 0.05, 0.02, 0.32, 0);
      fly(voucher, [-8, -3], [-1.1, -0.35], 0.1, 0.18, -0.04, 0.12, 0.42, 1.7);
      fly(coupon, [8, -3], [-2.4, -2.4], 0.7, 0.12, 0.03, 0.22, 0.52, 3.1);
      const kt = seg(p, 0.36, 0.64);
      tag.m.position.set(mix(9, 3.7, easeOutBack(kt)) + px * 0.15, 0.2 + bob(4), 1);
      tag.m.rotation.set(0, -0.22 + px * 0.15, -0.04);
      tag.m.scale.setScalar(0.7 + 0.3 * kt);
      const k = seg(p, 0.62, 0.92);
      const bucket = Math.round(k * 30);
      if (bucket !== lastK) {
        lastK = bucket;
        paintTag(bucket / 30);
      }
      ctx.setFade(0);
    },
  };
}

// ---------- Grocery: pack sizes settle into one matched group ----------
function groceryBuild(ctx: Ctx): Built {
  const { scene } = ctx;
  lights(ctx);
  const colors: Record<string, string> = { Zepto: "#7b2ff7", Instamart: "#fc8019", Blinkit: "#f8cb46" };
  const logoFor: Record<string, string> = { Zepto: "zepto", Instamart: "instamart", Blinkit: "blinkit" };
  const box = (w: number, h: number, d: number, app: string, size: string, price: string) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, 0.12), new THREE.MeshStandardMaterial({ color: colors[app], roughness: 0.5 }));
    const face = labelLive(ctx, w - 0.16, h - 0.16, (c, cw, ch) => {
      c.fillStyle = "#fffdf6";
      c.fillRect(0, ch * 0.26, cw, ch * 0.74);
      drawChip(c, logoImg(logoFor[app], () => face.redraw()), cw * 0.07, ch * 0.03, ch * 0.2, ch * 0.2, 0.1, 0.5);
      c.fillStyle = "#fff";
      c.font = `800 ${Math.round(cw * 0.14)}px system-ui, sans-serif`;
      c.fillText(app, cw * 0.07 + ch * 0.24, ch * 0.18);
      c.fillStyle = "#12110e";
      c.font = `800 ${Math.round(cw * 0.17)}px system-ui, sans-serif`;
      c.fillText("Butter", cw * 0.09, ch * 0.47);
      c.fillStyle = "#d3281b";
      c.font = `800 ${Math.round(cw * 0.23)}px system-ui, sans-serif`;
      c.fillText(size, cw * 0.09, ch * 0.7);
      c.fillStyle = "#12110e";
      c.font = `700 ${Math.round(cw * 0.15)}px system-ui, sans-serif`;
      c.fillText(price, cw * 0.09, ch * 0.9);
    }, 420);
    face.m.position.z = d / 2 + 0.006;
    g.add(body, face.m);
    return g;
  };
  const specs = [
    { app: "Zepto", size: "500 g", price: "₹279", w: 2.3, h: 2.9, home: [-4.4, 0.35], from: [-4.4, 8] },
    { app: "Instamart", size: "500 g", price: "₹282", w: 2.3, h: 2.9, home: [-1.2, 0.35], from: [-1.2, 8.5] },
    { app: "Blinkit", size: "250 g", price: "₹145", w: 1.3, h: 2.1, home: [2.1, 0.0], from: [2.1, 9] },
    { app: "Blinkit", size: "250 g", price: "₹146", w: 1.3, h: 2.1, home: [3.55, 0.0], from: [3.55, 9.5] },
  ];
  const boxes = specs.map((sp) => {
    const g = box(sp.w, sp.h, 0.9, sp.app, sp.size, sp.price);
    scene.add(g);
    return { g, sp };
  });

  const outline = (w: number, h: number) => {
    const m = new THREE.Mesh(
      new THREE.ShapeGeometry(
        (() => {
          const sh = new THREE.Shape();
          const r = 0.3;
          sh.moveTo(-w / 2 + r, -h / 2);
          sh.lineTo(w / 2 - r, -h / 2);
          sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
          sh.lineTo(w / 2, h / 2 - r);
          sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
          sh.lineTo(-w / 2 + r, h / 2);
          sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
          sh.lineTo(-w / 2, -h / 2 + r);
          sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
          const hole = new THREE.Path();
          const iw = w - 0.12;
          const ih = h - 0.12;
          hole.moveTo(-iw / 2 + r, -ih / 2);
          hole.lineTo(iw / 2 - r, -ih / 2);
          hole.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + r);
          hole.lineTo(iw / 2, ih / 2 - r);
          hole.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - r, ih / 2);
          hole.lineTo(-iw / 2 + r, ih / 2);
          hole.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - r);
          hole.lineTo(-iw / 2, -ih / 2 + r);
          hole.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + r, -ih / 2);
          sh.holes.push(hole);
          return sh;
        })(),
        8
      ),
      new THREE.MeshBasicMaterial({ color: 0x1f9d55, transparent: true })
    );
    scene.add(m);
    return m;
  };
  const frames = [outline(3.0, 3.8), outline(3.0, 3.8), outline(3.3, 3.8)];
  const framePos: [number, number][] = [[-4.4, 0.35], [-1.2, 0.35], [2.83, 0.2]];

  const pill = label(ctx, 8.4, 1.1, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#12110e";
    rrect(g, 0, 0, w, h, h / 2);
    g.fill();
    g.fillStyle = "#4ade80";
    g.beginPath();
    g.arc(h * 0.5, h / 2, h * 0.14, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff";
    g.font = `800 ${Math.round(h * 0.4)}px system-ui, sans-serif`;
    g.fillText("Same product: 500 g = 2 × 250 g", h * 0.85, h * 0.64);
  }, 300);
  scene.add(pill.m);
  const shadow = blob(ctx, 13, 4);
  shadow.position.y = -2.4;

  return {
    resize(aspect) {
      fit(ctx, aspect, 6.6, 3.9);
    },
    update(p, t) {
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      boxes.forEach(({ g, sp }, i) => {
        const k = seg(p, 0.02 + i * 0.07, 0.3 + i * 0.07);
        const e = easeOutBack(k);
        g.position.set(sp.home[0] + px * 0.2, mix(sp.from[1], sp.home[1], e) + Math.sin(t * 0.9 + i) * 0.06 * k, 0.2);
        g.rotation.set(-py * 0.08 + (1 - k) * 0.8, -0.28 + px * 0.18 + (1 - k) * 1.2, (1 - k) * 0.5);
        g.scale.setScalar(0.7 + 0.3 * k);
      });
      frames.forEach((f, i) => {
        const k = seg(p, 0.5 + i * 0.07, 0.62 + i * 0.07);
        f.position.set(framePos[i][0] + px * 0.2, framePos[i][1], -0.2);
        f.rotation.y = -0.1;
        f.scale.setScalar(Math.max(k, 0.0001));
        (f.material as THREE.MeshBasicMaterial).opacity = k;
      });
      const kp = seg(p, 0.66, 0.8);
      pill.m.position.set(-0.4, -2.75, 1);
      pill.m.scale.setScalar(Math.max(easeOutBack(kp), 0.0001));
      ctx.setFade(0);
    },
  };
}

// ---------- Rides: rings of pickup points, three cars, one cheap corner ----------
function cabsBuild(ctx: Ctx): Built {
  const { scene } = ctx;
  lights(ctx);
  const disc = new THREE.Group();
  disc.rotation.x = -0.95;
  scene.add(disc);

  const mapTex = ctx.track(canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = "#f3eee0";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ddd5c0";
    g.lineWidth = 22;
    for (let i = -2; i <= 2; i += 1) {
      g.beginPath();
      g.moveTo(w / 2 + i * 96, 0);
      g.lineTo(w / 2 + i * 96, h);
      g.moveTo(0, h / 2 + i * 96);
      g.lineTo(w, h / 2 + i * 96);
      g.stroke();
    }
    g.fillStyle = "#cfe3bd";
    g.beginPath();
    g.arc(390, 140, 70, 0, Math.PI * 2);
    g.fill();
  }));
  const base = new THREE.Mesh(new THREE.CircleGeometry(4.6, 64), new THREE.MeshBasicMaterial({ map: mapTex }));
  disc.add(base);
  const rim = new THREE.Mesh(new THREE.RingGeometry(4.6, 4.75, 64), new THREE.MeshBasicMaterial({ color: 0x12110e }));
  disc.add(rim);

  const pts: { x: number; y: number; r: number }[] = [];
  [[1.3, 10], [2.4, 18], [3.5, 26]].forEach(([r, n]) => {
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + r;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, r });
    }
  });
  const target = pts.length;
  pts.push({ x: 2.3, y: 1.4, r: 2.7 });
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff }), pts.length);
  dots.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(pts.length * 3), 3);
  disc.add(dots);

  const pin = new THREE.Group();
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), new THREE.MeshStandardMaterial({ color: 0xd3281b, roughness: 0.4 }));
  head.position.z = 1.1;
  const stem = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.9, 20), new THREE.MeshStandardMaterial({ color: 0xd3281b, roughness: 0.4 }));
  stem.rotation.x = Math.PI / 2;
  stem.position.z = 0.45;
  pin.add(head, stem);
  disc.add(pin);

  const walk = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.06), new THREE.Vector3(2.3, 1.4, 0.06)]),
    new THREE.LineDashedMaterial({ color: 0xd3281b, dashSize: 0.16, gapSize: 0.12 })
  );
  walk.computeLineDistances();
  disc.add(walk);

  const carDefs = [
    { c: 0x12110e, name: "Uber", logo: "uber", price: "₹312", sub: "here", home: [-2.9, 2.2], from: [-6.5, 4.5], hot: false },
    { c: 0xf6c445, name: "Ola", logo: "ola", price: "₹298", sub: "here", home: [-2.7, -2.3], from: [-6.5, -4.5], hot: false },
    { c: 0x23c47e, name: "Rapido", logo: "rapido", price: "₹241", sub: "120 m walk", home: [2.9, -1.6], from: [6.5, -4.5], hot: true },
  ];
  const cars = carDefs.map((d) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.6, 0.36, 3, 0.1), new THREE.MeshStandardMaterial({ color: d.c, roughness: 0.4 }));
    body.position.z = 0.28;
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.46, 0.3, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.3 }));
    cab.position.set(-0.08, 0, 0.56);
    g.add(body, cab);
    disc.add(g);
    const paintTag = (c: CanvasRenderingContext2D, w: number, h: number) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = d.hot ? "#12110e" : "#fffdf6";
      c.beginPath();
      c.roundRect(4, 4, w - 8, h - 8, h / 2);
      c.fill();
      c.strokeStyle = "#12110e";
      c.lineWidth = d.hot ? 0 : 6;
      c.stroke();
      drawChip(c, logoImg(d.logo, () => repaint()), 22, 22, h - 44, h - 44, 0.12, 0.3);
      c.fillStyle = d.hot ? "#fff" : "#12110e";
      c.font = "800 80px system-ui, sans-serif";
      c.fillText(`${d.name} ${d.price}`, h - 4, 100);
      c.fillStyle = d.hot ? "#f0b27a" : "#6b6860";
      c.font = "600 44px system-ui, sans-serif";
      c.fillText(d.sub, h - 2, 168);
    };
    const tex = ctx.track(canvasTexture(840, 230, paintTag));
    const repaint = () => {
      const cv = tex.image as HTMLCanvasElement;
      const g = cv.getContext("2d");
      if (!g) return;
      paintTag(g, cv.width, cv.height);
      tex.needsUpdate = true;
    };
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.renderOrder = 10;
    sp.scale.set(3.3, 0.9, 1);
    scene.add(sp);
    return { g, sp, d };
  });

  const c = new THREE.Color();
  const dm = new THREE.Object3D();
  const v = new THREE.Vector3();

  return {
    resize(aspect) {
      fit(ctx, aspect, 6.2, 4.4);
    },
    update(p, t) {
      const sweep = smooth(0.08, 0.5, p) * 1.25;
      pts.forEach((q, i) => {
        const d = Math.hypot(q.x, q.y) / 4.2;
        const lit = d < sweep;
        const hot = i === target ? smooth(0.5, 0.62, p) : 0;
        if (hot > 0.02) c.set(0xd3281b);
        else c.set(lit ? 0x6f7be0 : 0xc4bda8);
        dots.setColorAt(i, c);
        dm.position.set(q.x, q.y, 0.12);
        dm.scale.setScalar(i === target ? 0.9 + hot * 1.3 : 0.9 + (lit ? 0.18 * Math.sin(t * 3 + i) : 0));
        dm.updateMatrix();
        dots.setMatrixAt(i, dm.matrix);
      });
      dots.instanceMatrix.needsUpdate = true;
      if (dots.instanceColor) dots.instanceColor.needsUpdate = true;

      const arrive = smooth(0.18, 0.55, p);
      disc.rotation.z = Math.sin(t * 0.35) * 0.1 + ctx.pointer.x * 0.2;
      disc.updateMatrixWorld();
      cars.forEach(({ g, sp, d }) => {
        const x = mix(d.from[0], d.home[0], arrive);
        const y = mix(d.from[1], d.home[1], arrive);
        g.position.set(x, y, 0);
        g.rotation.z = Math.atan2(d.home[1] - y, d.home[0] - x) + Math.PI;
        v.set(x, y, 0.6);
        disc.localToWorld(v);
        sp.position.set(v.x, v.y + 1.05, v.z);
        sp.scale.setScalar(1);
        const k = smooth(0.5, 0.64, p);
        sp.scale.set(3.3 * k * (d.hot ? 1.1 : 1), 0.9 * k * (d.hot ? 1.1 : 1), 1);
      });
      pin.rotation.z = t * 0.6;
      walk.visible = p > 0.5;
      ctx.setFade(0);
    },
  };
}

// ---------- Food: one chain, three prices ----------
function buildPizza(ctx: Ctx) {
  const g = new THREE.Group();
  const noise = ctx.track(canvasTexture(128, 128, (c, w, h) => {
    const img = c.createImageData(w, h);
    for (let i = 0; i < w * h; i += 1) {
      const v = 90 + Math.random() * 120;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    c.putImageData(img, 0, 0);
  }, false));
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping;
  noise.repeat.set(3, 3);
  const dough = ctx.track(new THREE.MeshStandardMaterial({ color: 0xe0a559, roughness: 0.9, bumpMap: noise, bumpScale: 0.8 }));
  const crustMat = ctx.track(new THREE.MeshStandardMaterial({ color: 0xcf8a3a, roughness: 0.85, bumpMap: noise, bumpScale: 1.4 }));
  const burnt = ctx.track(new THREE.MeshStandardMaterial({ color: 0x9a5524, roughness: 0.9 }));
  const sauceMat = ctx.track(new THREE.MeshStandardMaterial({ color: 0xc4352a, roughness: 0.6 }));
  const cheeseMats = [0xf7d96f, 0xfbe38f, 0xeec254].map((c) => ctx.track(new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.02 })));
  const pepMat = ctx.track(new THREE.MeshStandardMaterial({ color: 0xb5281f, roughness: 0.5 }));
  const pepRim = ctx.track(new THREE.MeshStandardMaterial({ color: 0x8a1a14, roughness: 0.6 }));
  const leafMat = ctx.track(new THREE.MeshStandardMaterial({ color: 0x2f9e4f, roughness: 0.55 }));
  const oliveMat = ctx.track(new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.4 }));
  const rnd = (n: number) => {
    const x = Math.sin(n * 91.7 + 13.1) * 43758.5453;
    return x - Math.floor(x);
  };

  // wooden board with a handle
  const wood = ctx.track(new THREE.MeshStandardMaterial({ color: 0x7a5230, roughness: 0.7 }));
  const board = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.05, 0.16, 64), wood);
  board.position.y = -0.18;
  const handle = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.16, 2.4, 3, 0.06), wood);
  handle.position.set(0, -0.18, 3.8);
  g.add(board, handle);

  // base, puffy bubbled crust, sauce
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2.45, 2.5, 0.26, 64), dough);
  base.position.y = 0.0;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.3, 18, 72), crustMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.14;
  rim.scale.z = 0.85;
  g.add(base, rim);
  for (let i = 0; i < 26; i += 1) {
    const a = rnd(i) * Math.PI * 2;
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.1 + rnd(i + 3) * 0.12, 10, 8), burnt);
    b.position.set(Math.cos(a) * 2.38, 0.3 + rnd(i + 5) * 0.06, Math.sin(a) * 2.38);
    b.scale.y = 0.55;
    g.add(b);
  }
  const sauce = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.08, 64), sauceMat);
  sauce.position.y = 0.17;
  g.add(sauce);

  // lumpy melted cheese
  for (let i = 0; i < 64; i += 1) {
    const a = rnd(i * 2) * Math.PI * 2;
    const r = Math.sqrt(rnd(i * 2 + 1)) * 1.95;
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.34 + rnd(i + 9) * 0.32, 14, 10), cheeseMats[i % 3]);
    m.position.set(Math.cos(a) * r, 0.24 + rnd(i + 4) * 0.04, Math.sin(a) * r);
    m.scale.set(1.15, 0.34, 1.15);
    g.add(m);
  }
  // toppings
  for (let i = 0; i < 13; i += 1) {
    const a = rnd(i + 20) * Math.PI * 2;
    const r = 0.4 + Math.sqrt(rnd(i + 21)) * 1.55;
    const pep = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.3, 0.09, 24), pepMat);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 8, 24), pepRim);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.045;
    pep.add(disc, ring);
    pep.position.set(Math.cos(a) * r, 0.36, Math.sin(a) * r);
    pep.rotation.set((rnd(i) - 0.5) * 0.25, 0, (rnd(i + 1) - 0.5) * 0.25);
    g.add(pep);
  }
  for (let i = 0; i < 7; i += 1) {
    const a = rnd(i + 40) * Math.PI * 2;
    const r = 0.5 + rnd(i + 41) * 1.4;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), leafMat);
    leaf.scale.set(1.5, 0.28, 0.85);
    leaf.rotation.y = rnd(i + 42) * Math.PI;
    leaf.rotation.z = 0.25;
    leaf.position.set(Math.cos(a) * r, 0.42, Math.sin(a) * r);
    g.add(leaf);
  }
  for (let i = 0; i < 7; i += 1) {
    const a = rnd(i + 60) * Math.PI * 2;
    const r = 0.6 + rnd(i + 61) * 1.4;
    const ol = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.045, 8, 16), oliveMat);
    ol.rotation.x = Math.PI / 2;
    ol.position.set(Math.cos(a) * r, 0.4, Math.sin(a) * r);
    g.add(ol);
  }
  return g;
}

function foodBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;
  scene.add(new THREE.HemisphereLight(0xfff1e0, 0xb88458, 0.75));
  const key = new THREE.DirectionalLight(0xffffff, 2.7);
  key.position.set(-4, 9, 6);
  scene.add(key);
  const rimLight = new THREE.DirectionalLight(0xffb070, 1.4);
  rimLight.position.set(6, 3, -7);
  scene.add(rimLight);
  camera.position.set(0, 0, 12.5);

  const pizza = buildPizza(ctx);
  const holder = new THREE.Group();
  holder.add(pizza);
  scene.add(holder);

  const rows = [
    { n: "Domino's", sub: "app cart, live", price: "₹412", hot: true, logo: "dominos" },
    { n: "Swiggy", sub: "fees and coupon in", price: "₹448", hot: false, logo: "swiggy" },
    { n: "Zomato", sub: "fees and coupon in", price: "₹456", hot: false, logo: "zomato" },
  ];
  const tags = rows.map((r) => {
    const t = labelLive(ctx, 5.4, 1.25, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = r.hot ? "#12110e" : "#fffdf6";
      rrect(g, 4, 4, w - 8, h - 8, h / 2);
      g.fill();
      if (!r.hot) {
        g.strokeStyle = "#12110e";
        g.lineWidth = 5;
        g.stroke();
      }
      drawChip(g, logoImg(r.logo, () => t.redraw()), h * 0.16, h * 0.16, h * 0.68, h * 0.68, 0.12, 0.3);
      g.fillStyle = r.hot ? "#fff" : "#12110e";
      g.font = `800 ${Math.round(h * 0.28)}px system-ui, sans-serif`;
      g.fillText(r.n, h * 1.0, h * 0.46);
      g.fillStyle = r.hot ? "#f0b27a" : "#6b6860";
      g.font = `600 ${Math.round(h * 0.19)}px system-ui, sans-serif`;
      g.fillText(r.sub, h * 1.0, h * 0.76);
      g.fillStyle = r.hot ? "#f0b27a" : "#12110e";
      g.font = `800 ${Math.round(h * 0.46)}px system-ui, sans-serif`;
      g.fillText(r.price, w - h * 0.5 - g.measureText(r.price).width, h * 0.62);
    }, 300);
    scene.add(t.m);
    return t.m;
  });
  const badge = label(ctx, 1.9, 0.62, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#d3281b";
    rrect(g, 0, 0, w, h, h / 2);
    g.fill();
    g.fillStyle = "#fff";
    g.font = `800 ${Math.round(h * 0.5)}px system-ui, sans-serif`;
    g.fillText("Cheapest", h * 0.4, h * 0.7);
  }, 300);
  scene.add(badge.m);
  const shadow = blob(ctx, 7, 5);
  shadow.position.set(-3.4, -3.3, 0);

  return {
    resize(aspect) {
      fit(ctx, aspect);
    },
    update(p, t) {
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      const kz = seg(p, 0.02, 0.3);
      holder.position.set(-3.5 + px * 0.2, mix(-7, -0.2, easeOutBack(kz)) + Math.sin(t * 0.8) * 0.06, 0);
      holder.rotation.set(0.82 + py * 0.08, 0, 0);
      pizza.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.35 + (1 - kz) * 3.2;
      holder.scale.setScalar(0.62 + 0.38 * kz);
      tags.forEach((m, i) => {
        const k = seg(p, 0.3 + i * 0.1, 0.46 + i * 0.1);
        m.position.set(mix(11, 3.5, easeOutBack(k)) + px * 0.15, 1.75 - i * 1.55 + Math.sin(t + i) * 0.05, 0.5);
        m.scale.setScalar(Math.max(0.0001, 0.6 + 0.4 * k));
      });
      const kb = seg(p, 0.62, 0.74);
      badge.m.position.set(5.9, 2.5, 1);
      badge.m.rotation.z = -0.12;
      badge.m.scale.setScalar(Math.max(easeOutBack(kb), 0.0001));
      ctx.setFade(0);
    },
  };
}

const builders: Record<string, (ctx: Ctx) => Built> = {
  pay: payBuild,
  grocery: groceryBuild,
  cabs: cabsBuild,
  food: foodBuild,
};

// play once from the first frame when it scrolls into view, settle, replay on hover
const durations: Record<string, number> = { pay: 4.6, grocery: 4.4, food: 4, cabs: 5.2 };

export function mountDiorama(kind: string): (opts: Opts) => Handle | null {
  return (opts) =>
    mountScene({
      ...opts,
      fov: 32,
      transparent: true,
      once: opts.mode === "card",
      loopSeconds: durations[kind] ?? 4.4,
      build: (ctx) => (builders[kind] ?? payBuild)(ctx),
    });
}
