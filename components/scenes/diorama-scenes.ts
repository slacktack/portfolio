import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
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
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false }));
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

// ---------- Grocery: real produce, one product in two pack sizes ----------
const gltf = new GLTFLoader();
type Factory = () => THREE.Group;
const modelCache = new Map<string, Promise<Factory>>();

// load a model once, normalise its size and sit it on y = 0, then hand out clones
function model(id: string, target: number, by: "width" | "max" = "max"): Promise<Factory> {
  const key = `${id}:${target}:${by}`;
  let p = modelCache.get(key);
  if (!p) {
    p = gltf.loadAsync(`/assets/models/${id}/${id}.gltf`).then((res) => {
      const src = res.scene;
      const box = new THREE.Box3().setFromObject(src);
      const size = box.getSize(new THREE.Vector3());
      const ref = by === "width" ? Math.max(size.x, size.z) : Math.max(size.x, size.y, size.z);
      const k = target / ref;
      const inner = new THREE.Group();
      inner.add(src);
      src.position.set(-(box.min.x + size.x / 2), -box.min.y, -(box.min.z + size.z / 2));
      inner.scale.setScalar(k);
      const holder = new THREE.Group();
      holder.add(inner);
      holder.userData.h = size.y * k;
      return () => {
        const c = holder.clone(true);
        c.userData.h = holder.userData.h;
        return c;
      };
    });
    modelCache.set(key, p);
  }
  return p;
}

const fbx = new FBXLoader();
const texLoader = new THREE.TextureLoader();
const tex = (url: string, srgb = true) => {
  const t = texLoader.load(url);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

// load a photo-textured FBX, drop its own materials, sit it on y = 0 at a known size
function fbxModel(url: string, material: (mesh: THREE.Mesh, index: number) => THREE.Material, target: number, flatten = false): Promise<Factory> {
  return fbx.loadAsync(url).then((src) => {
    let n = 0;
    src.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.material = material(m, n);
        n += 1;
      }
    });
    const holder = new THREE.Group();
    const inner = new THREE.Group();
    inner.add(src);
    let box = new THREE.Box3().setFromObject(inner);
    let size = box.getSize(new THREE.Vector3());
    if (flatten) {
      // lay the thinnest axis along Y so a plate-like model lies flat
      if (size.z < size.y && size.z < size.x) inner.rotation.x = -Math.PI / 2;
      else if (size.x < size.y && size.x < size.z) inner.rotation.z = Math.PI / 2;
      inner.updateMatrixWorld(true);
      box = new THREE.Box3().setFromObject(inner);
      size = box.getSize(new THREE.Vector3());
    }
    const k = target / Math.max(size.x, size.z, flatten ? 0 : size.y);
    const center = box.getCenter(new THREE.Vector3());
    inner.position.set(-center.x * k, -box.min.y * k, -center.z * k);
    inner.scale.setScalar(k);
    holder.add(inner);
    holder.userData.h = size.y * k;
    holder.userData.meshes = n;
    return () => {
      const c = holder.clone(true);
      c.userData.h = holder.userData.h;
      return c;
    };
  });
}

function groceryBuild(ctx: Ctx): Built {
  const { scene } = ctx;
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0xc9b391, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(-5, 9, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffd9b0, 0.7);
  fill.position.set(6, 2, 5);
  scene.add(fill);
  ctx.camera.position.set(0, 0.6, 14);

  type Part = { o: THREE.Object3D; delay: number; to: THREE.Vector3; rot: number };
  const groups: { g: THREE.Group; x: number; parts: Part[] }[] = [];
  const tagMeshes: { m: THREE.Mesh; x: number }[] = [];
  const decor: Part[] = [];
  let ready = -1;

  const mkTag = (app: string, logoName: string, pack: string, price: string, x: number) => {
    const t = labelLive(ctx, 3.9, 1.5, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = "#fffdf6";
      rrect(g, 5, 5, w - 10, h - 10, h * 0.3);
      g.fill();
      g.strokeStyle = "#12110e";
      g.lineWidth = 6;
      g.stroke();
      drawChip(g, logoImg(logoName, () => t.redraw()), h * 0.14, h * 0.14, h * 0.72, h * 0.72, 0.1, 0.28);
      g.fillStyle = "#12110e";
      g.font = `800 ${Math.round(h * 0.24)}px system-ui, sans-serif`;
      g.fillText(app, h * 1.0, h * 0.4);
      g.fillStyle = "#6b6860";
      g.font = `700 ${Math.round(h * 0.18)}px system-ui, sans-serif`;
      g.fillText(pack, h * 1.0, h * 0.66);
      g.fillStyle = "#d3281b";
      g.font = `800 ${Math.round(h * 0.3)}px system-ui, sans-serif`;
      g.fillText(price, h * 1.0, h * 0.92);
    }, 300);
    scene.add(t.m);
    tagMeshes.push({ m: t.m, x });
  };
  mkTag("Zepto", "zepto", "Apples · 1 kg", "₹189", -4.6);
  mkTag("Instamart", "instamart", "Apples · 1 kg", "₹192", -0.9);
  mkTag("Blinkit", "blinkit", "Apples · 2 × 500 g", "₹195", 3.9);

  const pill = label(ctx, 8.6, 1.1, (g, w, h) => {
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
    g.fillText("Same product: 1 kg = 2 × 500 g", h * 0.85, h * 0.64);
  }, 300);
  scene.add(pill.m);
  const shadow = blob(ctx, 15, 4.5);
  shadow.position.y = -0.02;

  Promise.all([
    model("wicker_basket_01", 3.1, "width"),
    model("wicker_basket_01", 2.1, "width"),
    model("food_apple_01", 0.86),
    model("food_apple_01", 0.72),
    model("food_avocado_01", 0.95),
    model("lemon", 0.7),
    model("bananas", 1.7),
    fbxModel("/assets/models/milk/milk.fbx", () => new THREE.MeshStandardMaterial({ map: tex("/assets/models/milk/base.jpg"), roughness: 0.55 }), 2.2),
    fbxModel("/assets/models/milk/milk.fbx", () => new THREE.MeshStandardMaterial({ map: tex("/assets/models/milk/base.jpg"), roughness: 0.55 }), 1.7),
  ]).then(([bigBasket, smallBasket, apple, apple2, avocado, lemon, bananas, milk, milkSmall]) => {
    const place = (x: number, basket: Factory, apples: Factory, n: number, ringR: number, baseY: number, groupIndex: number) => {
      const g = new THREE.Group();
      g.position.set(x, 0, 0);
      const parts: Part[] = [];
      const b = basket();
      g.add(b);
      parts.push({ o: b, delay: 0, to: new THREE.Vector3(0, 0, 0), rot: 0.3 });
      const H = b.userData.h as number;
      for (let i = 0; i < n; i += 1) {
        const a = apples();
        const top = i === n - 1;
        const ang = (i / Math.max(n - 1, 1)) * Math.PI * 2 + groupIndex;
        const r = top ? 0 : ringR;
        a.rotation.set(Math.random() * 0.6, Math.random() * 6, Math.random() * 0.6);
        const to = new THREE.Vector3(Math.cos(ang) * r, H * baseY + (top ? 0.52 : 0.08 * (i % 2)), Math.sin(ang) * r * 0.8);
        g.add(a);
        parts.push({ o: a, delay: 0.25 + i * 0.07, to, rot: 0 });
      }
      scene.add(g);
      groups.push({ g, x, parts });
    };
    place(-4.6, bigBasket, apple, 7, 0.68, 0.62, 1);
    place(-0.9, bigBasket, apple, 7, 0.68, 0.62, 2);
    place(2.9, smallBasket, apple2, 4, 0.4, 0.62, 3);
    place(4.95, smallBasket, apple2, 4, 0.4, 0.62, 4);
    const add = (f: Factory, x: number, z: number, ry: number, delay: number) => {
      const o = f();
      o.position.set(x, 0, z);
      o.rotation.y = ry;
      scene.add(o);
      decor.push({ o, delay, to: new THREE.Vector3(x, 0, z), rot: ry });
    };
    add(milk, -6.3, 1.1, 0.5, 0.5);
    add(lemon, -2.75, 1.7, 0.4, 0.55);
    add(avocado, -2.1, 1.85, 1.1, 0.6);
    add(milkSmall, 0.7, 1.7, -0.4, 0.65);
    add(bananas, 1.9, 2.0, 0.5, 0.7);
    void apple;
    ready = 0;
  });

  let tReady = -1;

  return {
    resize(aspect) {
      fit(ctx, aspect, 7.4, 4.1);
    },
    update(p, t) {
      void p;
      if (ready < 0) {
        tagMeshes.forEach((tg) => tg.m.scale.setScalar(0.0001));
        pill.m.scale.setScalar(0.0001);
        return;
      }
      if (tReady < 0) tReady = t;
      const lp = clamp01((t - tReady) / 4.4);
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      groups.forEach(({ g, x, parts }, gi) => {
        g.position.x = x + px * 0.15;
        g.rotation.y = px * 0.12;
        parts.forEach((pt, i) => {
          const k = seg(lp, 0.02 + gi * 0.06 + pt.delay * 0.35, 0.3 + gi * 0.06 + pt.delay * 0.35);
          const e = easeOutBack(k);
          const drop = (1 - k) * 4;
          pt.o.position.set(pt.to.x, pt.to.y + drop, pt.to.z);
          pt.o.scale.setScalar(Math.max(e, 0.0001));
          if (i === 0) pt.o.rotation.y = pt.rot * (1 - k) + Math.sin(t * 0.5 + gi) * 0.03;
        });
      });
      decor.forEach((d, i) => {
        const k = seg(lp, 0.25 + d.delay * 0.4, 0.5 + d.delay * 0.4);
        d.o.position.set(d.to.x, d.to.y + (1 - k) * 3, d.to.z);
        d.o.scale.setScalar(Math.max(easeOutBack(k), 0.0001));
        d.o.rotation.y = d.rot + (1 - k) * 2 + Math.sin(t * 0.4 + i) * 0.02;
      });
      tagMeshes.forEach((tg, i) => {
        const k = seg(lp, 0.5 + i * 0.07, 0.65 + i * 0.07);
        tg.m.position.set(tg.x + px * 0.2, 3.1 + (1 - k) * 1.2 + Math.sin(t + i) * 0.05, 0.8);
        tg.m.scale.setScalar(Math.max(easeOutBack(k) * 0.88, 0.0001));
      });
      pill.m.position.set(0.1, -2.2, 1.6);
      pill.m.scale.setScalar(Math.max(easeOutBack(seg(lp, 0.78, 0.92)), 0.0001));
      ctx.camera.position.y = 3.1 - py * 0.3;
      ctx.camera.lookAt(0, 0.35, 0);
      ctx.setFade(0);
    },
  };
}

// ---------- Rides: a live map with pickup points and three cars on the way ----------
function cabsBuild(ctx: Ctx): Built {
  const { scene } = ctx;
  lights(ctx);
  const disc = new THREE.Group();
  disc.rotation.x = -0.95;
  scene.add(disc);

  const R = 4.8;
  const mapTex = ctx.track(canvasTexture(1024, 1024, (g, w, h) => {
    g.fillStyle = "#11141b";
    g.fillRect(0, 0, w, h);
    // blocks
    for (let i = 0; i < 70; i += 1) {
      const x = ((i * 137) % 997) / 997 * w;
      const y = ((i * 251) % 991) / 991 * h;
      g.fillStyle = `rgba(28,34,46,${0.5 + ((i * 7) % 5) / 10})`;
      g.fillRect(x, y, 40 + ((i * 53) % 90), 30 + ((i * 31) % 80));
    }
    // park and water
    g.fillStyle = "#12251c";
    g.beginPath();
    g.ellipse(700, 280, 130, 90, 0.4, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#0f2133";
    g.beginPath();
    g.ellipse(250, 760, 170, 70, -0.3, 0, Math.PI * 2);
    g.fill();
    // streets
    g.lineCap = "round";
    for (let i = -4; i <= 4; i += 1) {
      g.strokeStyle = i % 2 ? "#1f2531" : "#2b3342";
      g.lineWidth = i % 2 ? 14 : 26;
      g.beginPath();
      g.moveTo(w / 2 + i * 118, 0);
      g.lineTo(w / 2 + i * 118 + 40, h);
      g.moveTo(0, h / 2 + i * 118);
      g.lineTo(w, h / 2 + i * 118 - 30);
      g.stroke();
    }
    g.strokeStyle = "#3b4558";
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(0, 90);
    g.bezierCurveTo(300, 380, 640, 600, w, 930);
    g.stroke();
  }));
  const base = new THREE.Mesh(new THREE.CircleGeometry(R, 96), new THREE.MeshBasicMaterial({ map: mapTex, toneMapped: false }));
  disc.add(base);
  const rim = new THREE.Mesh(new THREE.RingGeometry(R, R + 0.07, 96), new THREE.MeshBasicMaterial({ color: 0x8f98e8 }));
  disc.add(rim);

  const pts: { x: number; y: number }[] = [];
  [[1.3, 10], [2.4, 18], [3.5, 26]].forEach(([r, n]) => {
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2 + r;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
    }
  });
  const target = pts.length;
  pts.push({ x: 2.3, y: 1.4 });
  const dots = new THREE.InstancedMesh(new THREE.CircleGeometry(0.12, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), pts.length);
  dots.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(pts.length * 3), 3);
  disc.add(dots);

  // rider: a steady dot with a pulsing ring
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
  dot.position.z = 0.15;
  const halo = new THREE.Mesh(new THREE.CircleGeometry(0.34, 32), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.55, toneMapped: false }));
  halo.position.z = 0.12;
  const pulse = new THREE.Mesh(new THREE.RingGeometry(0.95, 1, 64), new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.5, toneMapped: false }));
  pulse.position.z = 0.1;
  disc.add(dot, halo, pulse);

  const walk = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0.1), new THREE.Vector3(2.3, 1.4, 0.1)]),
    new THREE.LineDashedMaterial({ color: 0xf0b27a, dashSize: 0.14, gapSize: 0.1 })
  );
  walk.computeLineDistances();
  disc.add(walk);

  const carDefs = [
    { name: "Uber", logo: "uber", price: "₹312", sub: "here", ring: 0xffffff, home: [-2.9, 2.2], from: [-4.1, 2.6], bend: 1.0, hot: false },
    { name: "Ola", logo: "ola", price: "₹298", sub: "here", ring: 0xf6c445, home: [-2.7, -2.3], from: [-4.2, -2.5], bend: -1.0, hot: false },
    { name: "Rapido", logo: "rapido", price: "₹241", sub: "120 m walk", ring: 0xf6c445, home: [2.9, -1.6], from: [4.2, -2.4], bend: 0.9, hot: true },
  ];
  const cars = carDefs.map((d) => {
    const g = new THREE.Group();
    const arrow = new THREE.Shape();
    arrow.moveTo(0.34, 0);
    arrow.lineTo(-0.24, 0.22);
    arrow.lineTo(-0.1, 0);
    arrow.lineTo(-0.24, -0.22);
    arrow.closePath();
    const mark = new THREE.Mesh(new THREE.ShapeGeometry(arrow), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }));
    mark.position.z = 0.2;
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.34, 0.4, 40), new THREE.MeshBasicMaterial({ color: d.ring, toneMapped: false }));
    ringMesh.position.z = 0.18;
    const disk = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), new THREE.MeshBasicMaterial({ color: 0x0b0d12, toneMapped: false }));
    disk.position.z = 0.17;
    g.add(disk, ringMesh, mark);
    disc.add(g);
    const trail = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x8f98e8, transparent: true, opacity: 0.7 }));
    disc.add(trail);
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
    const tx = ctx.track(canvasTexture(840, 230, paintTag));
    const repaint = () => {
      const cv = tx.image as HTMLCanvasElement;
      const g2 = cv.getContext("2d");
      if (!g2) return;
      paintTag(g2, cv.width, cv.height);
      tx.needsUpdate = true;
    };
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false, toneMapped: false }));
    sp.renderOrder = 10;
    scene.add(sp);
    return { g, sp, trail, d };
  });

  const c = new THREE.Color();
  const dm = new THREE.Object3D();
  const v = new THREE.Vector3();

  return {
    resize(aspect) {
      fit(ctx, aspect, 6.4, 4.3);
    },
    update(p, t) {
      const sweep = smooth(0.08, 0.5, p) * 1.25;
      pts.forEach((q, i) => {
        const d = Math.hypot(q.x, q.y) / 4.2;
        const lit = d < sweep;
        const hot = i === target ? smooth(0.5, 0.62, p) : 0;
        if (hot > 0.02) c.set(0xf0b27a);
        else c.set(lit ? 0x8f98e8 : 0x3a4152);
        dots.setColorAt(i, c);
        dm.position.set(q.x, q.y, 0.08);
        dm.scale.setScalar(i === target ? 1 + hot * 1.2 : 1 + (lit ? 0.25 * Math.sin(t * 3 + i) : 0));
        dm.updateMatrix();
        dots.setMatrixAt(i, dm.matrix);
      });
      dots.instanceMatrix.needsUpdate = true;
      if (dots.instanceColor) dots.instanceColor.needsUpdate = true;

      const k = (t * 0.7) % 1;
      pulse.scale.setScalar(0.5 + k * 2.4);
      (pulse.material as THREE.MeshBasicMaterial).opacity = 0.5 * (1 - k);

      const arrive = easeOutBack(seg(p, 0.18, 0.55));
      disc.rotation.z = Math.sin(t * 0.3) * 0.08 + ctx.pointer.x * 0.15;
      disc.updateMatrixWorld();
      cars.forEach(({ g, sp, trail, d }) => {
        const e = Math.min(arrive, 1);
        const mx = (d.from[0] + d.home[0]) / 2 + d.bend;
        const my = (d.from[1] + d.home[1]) / 2 - d.bend * 0.6;
        const bx = (1 - e) * (1 - e) * d.from[0] + 2 * (1 - e) * e * mx + e * e * d.home[0];
        const by = (1 - e) * (1 - e) * d.from[1] + 2 * (1 - e) * e * my + e * e * d.home[1];
        g.position.set(bx, by, 0);
        const tx2 = 2 * (1 - e) * (mx - d.from[0]) + 2 * e * (d.home[0] - mx);
        const ty2 = 2 * (1 - e) * (my - d.from[1]) + 2 * e * (d.home[1] - my);
        g.rotation.z = Math.atan2(ty2, tx2);
        const pathPts: THREE.Vector3[] = [];
        for (let i = 0; i <= 24; i += 1) {
          const u = (i / 24) * e;
          pathPts.push(new THREE.Vector3((1 - u) * (1 - u) * d.from[0] + 2 * (1 - u) * u * mx + u * u * d.home[0], (1 - u) * (1 - u) * d.from[1] + 2 * (1 - u) * u * my + u * u * d.home[1], 0.06));
        }
        trail.geometry.setFromPoints(pathPts);
        v.set(bx, by, 0.6);
        disc.localToWorld(v);
        sp.position.set(v.x, v.y + 1.05, v.z);
        const kk = easeOutBack(seg(p, 0.5, 0.64));
        sp.scale.set(3.3 * Math.max(kk, 0.0001) * (d.hot ? 1.1 : 1), 0.9 * Math.max(kk, 0.0001) * (d.hot ? 1.1 : 1), 1);
      });
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
  const wood = ctx.track(new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.55 }));
  const board = new THREE.Mesh(new THREE.CylinderGeometry(3.05, 3.05, 0.16, 64), wood);
  board.position.y = -0.18;
  const handle = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.16, 2.4, 3, 0.06), wood);
  handle.position.set(0, -0.18, 3.8);
  board.userData.keep = true;
  handle.userData.keep = true;
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
  pizza.visible = false;
  let photo: THREE.Group | null = null;
  let tReady = -1;
  let settled = false;
  fbxModel(
    "/assets/models/pizza/pizza.fbx",
    () => new THREE.MeshStandardMaterial({ map: tex("/assets/models/pizza/base.jpg"), normalMap: tex("/assets/models/pizza/normal.jpg", false), roughness: 0.78, normalScale: new THREE.Vector2(1.2, 1.2) }),
    5.1,
    true
  )
    .then((make) => {
      photo = make();
      photo.position.y = 0.0;
      pizza.children.forEach((c) => {
        if (!c.userData.keep) c.visible = false;
      });
      pizza.add(photo);
      pizza.visible = true;
      settled = true;
    })
    .catch(() => {
      pizza.visible = true;
      settled = true;
    });

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
    update(pIn, t) {
      let p = pIn;
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      if (!settled) {
        tags.forEach((m) => m.scale.setScalar(0.0001));
        badge.m.scale.setScalar(0.0001);
        return;
      }
      if (tReady < 0) tReady = t;
      p = clamp01((t - tReady) / 4);
      const kz = seg(p, 0.02, 0.3);
      holder.position.set(-3.5 + px * 0.2, mix(-7, -0.2, easeOutBack(kz)) + Math.sin(t * 0.8) * 0.06, 0);
      holder.rotation.set(0.82 + py * 0.08, 0, 0);
      pizza.rotation.y = -0.5 + Math.sin(t * 0.35) * 0.35 + (1 - kz) * 3.2;
      void photo;
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
      environment: kind === "grocery" || kind === "food",
      envIntensity: 0.55,
      tone: kind === "grocery" || kind === "food",
      loopSeconds: durations[kind] ?? 4.4,
      build: (ctx) => (builders[kind] ?? payBuild)(ctx),
    });
}
