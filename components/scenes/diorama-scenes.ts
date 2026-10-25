import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { canvasTexture, mountScene, smooth, type Built, type Ctx, type Handle } from "./kit";
import { card } from "./objects";

type Opts = Pick<Parameters<typeof mountScene>[0], "host" | "mode" | "wrap" | "onProgress" | "loopSeconds">;

const loopFade = (p: number) => Math.max(smooth(0.94, 1, p), 1 - smooth(0, 0.04, p));
const mix = (a: number, b: number, k: number) => a + (b - a) * k;

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

const rrect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
};

// ---------- Best way to pay: three offers converge on one price ----------
function payBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;
  lights(ctx);
  const icici = card(ctx, 3.4, 2.14, 0.08, 0.18, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#f58a3c");
    grad.addColorStop(1, "#c2410c");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.12)";
    g.beginPath();
    g.arc(w * 0.85, h * 0.1, h * 0.7, 0, Math.PI * 2);
    g.fill();
    const cg = g.createLinearGradient(40, 150, 130, 230);
    cg.addColorStop(0, "#f1d27c");
    cg.addColorStop(1, "#b8953c");
    g.fillStyle = cg;
    rrect(g, 44, h * 0.34, 92, 70, 12);
    g.fill();
    g.fillStyle = "rgba(255,255,255,0.92)";
    g.font = "700 32px system-ui, sans-serif";
    g.fillText("ICICI BANK", 44, 64);
    g.font = "600 26px 'Courier New', monospace";
    g.fillText("•••• •••• •••• 4821", 44, h - 78);
    g.font = "700 28px system-ui, sans-serif";
    g.fillText("AMAZON PAY", 44, h - 34);
  }, 0xfff1e0);
  const gift = card(ctx, 3, 1.9, 0.07, 0.16, (g, w, h) => {
    g.fillStyle = "#fff2dc";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#d3281b";
    g.fillRect(0, h * 0.42, w, h * 0.16);
    g.fillRect(w * 0.46, 0, w * 0.08, h);
    g.fillStyle = "#12110e";
    g.font = "800 36px system-ui, sans-serif";
    g.fillText("GIFT CARD", 36, 64);
    g.font = "800 84px system-ui, sans-serif";
    g.fillText("₹500", 36, h - 40);
  });
  const coupon = card(ctx, 3.1, 1.35, 0.06, 0.14, (g, w, h) => {
    g.fillStyle = "#12110e";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#f0b27a";
    g.font = "800 92px system-ui, sans-serif";
    g.fillText("EXTRA 5%", 34, h * 0.62);
    g.fillStyle = "rgba(255,255,255,0.7)";
    g.font = "600 24px 'Courier New', monospace";
    g.fillText("COUPON · APPLIES AT CHECKOUT", 36, h - 28);
    g.setLineDash([10, 9]);
    g.strokeStyle = "rgba(255,255,255,0.35)";
    g.lineWidth = 3;
    g.strokeRect(14, 14, w - 28, h - 28);
  }, 0xd8a948);
  [icici, gift, coupon].forEach((o) => scene.add(o));

  let phaseKey = -1;
  const tag = label(ctx, 3.3, 1.7, () => {}, 200);
  const cv = tag.tex.image as HTMLCanvasElement;
  const paintTag = (k: number) => {
    const g = cv.getContext("2d");
    if (!g) return;
    const w = cv.width;
    const h = cv.height;
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#fffdf6";
    rrect(g, 4, 4, w - 8, h - 8, 36);
    g.fill();
    g.strokeStyle = "#12110e";
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = "#6b6860";
    g.font = "600 24px 'Courier New', monospace";
    g.fillText("CART TOTAL", 36, 52);
    const total = mix(159999, 151999.05, k);
    g.fillStyle = "#12110e";
    g.font = "800 64px system-ui, sans-serif";
    g.fillText("₹" + Math.round(total).toLocaleString("en-IN"), 36, 130);
    g.fillStyle = k > 0.55 ? "#1f9d55" : "rgba(31,157,85,0.25)";
    rrect(g, 36, 160, w - 72, 56, 28);
    g.fill();
    g.fillStyle = "#fff";
    g.font = "700 28px system-ui, sans-serif";
    g.fillText("You can save ₹7,999.95", 58, 198);
    tag.tex.needsUpdate = true;
  };
  paintTag(0);
  scene.add(tag.m);
  const shadow = blob(ctx, 9, 4);
  shadow.position.y = -3.1;

  return {
    resize(aspect) {
      camera.fov = aspect < 1.25 ? 42 : 32;
      camera.position.z = aspect < 1.25 ? 15 : 12.5;
      camera.updateProjectionMatrix();
    },
    update(p, t) {
      const conv = smooth(0.12, 0.5, p) * (1 - smooth(0.88, 0.98, p));
      const k = smooth(0.4, 0.62, p) * (1 - smooth(0.88, 0.98, p));
      const bucket = Math.round(k * 24);
      if (bucket !== phaseKey) {
        phaseKey = bucket;
        paintTag(k);
      }
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      const bob = (n: number) => Math.sin(t * 0.9 + n) * 0.1;
      icici.position.set(mix(-3.4, -0.9, conv) + px * 0.2, mix(1.1, 0.9, conv) + bob(0), mix(0, 0.4, conv));
      icici.rotation.set(-py * 0.1, mix(0.45, 0.18, conv) + px * 0.2, mix(0.16, 0.06, conv));
      gift.position.set(mix(3.2, 0.7, conv) + px * 0.3, mix(1.3, 0.2, conv) + bob(1.6), mix(-0.5, -0.1, conv));
      gift.rotation.set(-py * 0.1, mix(-0.5, -0.12, conv) + px * 0.2, mix(-0.14, 0.04, conv));
      coupon.position.set(mix(-2.6, -0.2, conv) + px * 0.25, mix(-1.5, -0.9, conv) + bob(3), mix(0.3, 0.8, conv));
      coupon.rotation.set(-py * 0.1, mix(0.3, 0.08, conv) + px * 0.2, mix(0.1, -0.04, conv));
      tag.m.position.set(mix(3.4, 2.6, conv) + px * 0.15, mix(-1.7, -1.4, conv) + bob(4), mix(0.6, 1.2, conv));
      tag.m.rotation.set(0, -0.2 + px * 0.15, -0.05);
      tag.m.scale.setScalar(mix(0.8, 1, conv));
      ctx.setFade(0);
      void loopFade;
    },
  };
}

// ---------- Grocery: pack sizes line up into one group ----------
function groceryBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;
  lights(ctx, 13);
  const colors: Record<string, string> = { Zepto: "#7b2ff7", Instamart: "#fc8019", Blinkit: "#f8cb46" };
  const box = (w: number, h: number, d: number, app: string, size: string, price: string) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, 0.1), new THREE.MeshStandardMaterial({ color: colors[app], roughness: 0.5 }));
    const face = label(ctx, w - 0.14, h - 0.14, (c, cw, ch) => {
      c.fillStyle = "#fffdf6";
      rrect(c, 0, ch * 0.28, cw, ch * 0.72, 0);
      c.fill();
      c.fillStyle = "#12110e";
      c.font = `800 ${Math.round(cw * 0.2)}px system-ui, sans-serif`;
      c.fillText("BUTTER", cw * 0.1, ch * 0.5);
      c.font = `800 ${Math.round(cw * 0.24)}px system-ui, sans-serif`;
      c.fillStyle = "#d3281b";
      c.fillText(size, cw * 0.1, ch * 0.74);
      c.fillStyle = "#12110e";
      c.font = `700 ${Math.round(cw * 0.15)}px system-ui, sans-serif`;
      c.fillText(price, cw * 0.1, ch * 0.93);
      c.fillStyle = "#fff";
      c.font = `700 ${Math.round(cw * 0.14)}px system-ui, sans-serif`;
      c.fillText(app.toUpperCase(), cw * 0.08, ch * 0.18);
    }, 260);
    face.m.position.z = d / 2 + 0.005;
    g.add(body, face.m);
    return g;
  };
  const zepto = box(2.1, 2.7, 0.9, "Zepto", "500 g", "₹279");
  const insta = box(2.1, 2.7, 0.9, "Instamart", "500 g", "₹282");
  const blinkA = box(1.15, 1.9, 0.7, "Blinkit", "250 g", "₹145");
  const blinkB = box(1.15, 1.9, 0.7, "Blinkit", "250 g", "₹146");
  [zepto, insta, blinkA, blinkB].forEach((o) => scene.add(o));

  const bracket = label(ctx, 5.4, 0.9, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#12110e";
    rrect(g, 0, h * 0.2, w, h * 0.6, h * 0.3);
    g.fill();
    g.fillStyle = "#7ad39a";
    g.beginPath();
    g.arc(h * 0.42, h * 0.5, 9, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#fff";
    g.font = `700 ${Math.round(h * 0.3)}px system-ui, sans-serif`;
    g.fillText("Matched: 500 g = 2 × 250 g", h * 0.7, h * 0.6);
  }, 200);
  scene.add(bracket.m);
  const shadow = blob(ctx, 11, 4);
  shadow.position.y = -1.9;

  return {
    resize(aspect) {
      camera.fov = aspect < 1.25 ? 44 : 32;
      camera.position.z = aspect < 1.25 ? 17 : 13;
      camera.updateProjectionMatrix();
    },
    update(p, t) {
      const slide = smooth(0.05, 0.4, p);
      const dock = smooth(0.4, 0.62, p);
      const px = ctx.pointer.x;
      const py = ctx.pointer.y;
      const bob = (n: number) => Math.sin(t * 0.9 + n) * 0.08;
      zepto.position.set(mix(-8, -3.6, slide) + px * 0.2, bob(0), 0.3);
      insta.position.set(mix(-8.5, -0.9, slide) + px * 0.3, bob(1), 0);
      blinkA.position.set(mix(8, mix(3.4, 1.8, dock), slide), mix(0.5, -0.35, dock) + bob(2), mix(0, 0.1, dock));
      blinkB.position.set(mix(10, mix(5.2, 3.0, dock), slide), mix(0.5, -0.35, dock) + bob(3), mix(0, 0.1, dock));
      [zepto, insta, blinkA, blinkB].forEach((o, i) => {
        o.rotation.set(-py * 0.08, -0.32 + px * 0.2 + (i > 1 ? 0.1 : 0), Math.sin(t * 0.6 + i) * 0.02);
      });
      bracket.m.position.set(-0.2 + px * 0.1, -2.3, 0.6);
      bracket.m.scale.setScalar(smooth(0.58, 0.72, p) * (1 - smooth(0.9, 0.98, p)));
      ctx.setFade(0);
    },
  };
}

// ---------- Rides: rings of pickup points, three cars, one cheap corner ----------
function cabsBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;
  lights(ctx, 13);
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
    { c: 0x12110e, name: "Uber", price: "₹312", sub: "here", home: [-2.9, 2.2], from: [-6.5, 4.5], hot: false },
    { c: 0xf6c445, name: "Ola", price: "₹298", sub: "here", home: [-2.7, -2.3], from: [-6.5, -4.5], hot: false },
    { c: 0x23c47e, name: "Rapido", price: "₹241", sub: "120 m walk", home: [2.9, -1.6], from: [6.5, -4.5], hot: true },
  ];
  const cars = carDefs.map((d) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new RoundedBoxGeometry(1.1, 0.6, 0.36, 3, 0.1), new THREE.MeshStandardMaterial({ color: d.c, roughness: 0.4 }));
    body.position.z = 0.28;
    const cab = new THREE.Mesh(new RoundedBoxGeometry(0.55, 0.46, 0.3, 3, 0.08), new THREE.MeshStandardMaterial({ color: 0xf4f0e6, roughness: 0.3 }));
    cab.position.set(-0.08, 0, 0.56);
    g.add(body, cab);
    disc.add(g);
    const tex = ctx.track(canvasTexture(420, 150, (c, w, h) => {
      c.clearRect(0, 0, w, h);
      c.fillStyle = d.hot ? "#12110e" : "#fffdf6";
      c.beginPath();
      c.roundRect(2, 2, w - 4, h - 4, h / 2);
      c.fill();
      c.strokeStyle = "#12110e";
      c.lineWidth = d.hot ? 0 : 3;
      c.stroke();
      c.fillStyle = d.hot ? "#fff" : "#12110e";
      c.font = "800 54px system-ui, sans-serif";
      c.fillText(`${d.name} ${d.price}`, 40, 70);
      c.fillStyle = d.hot ? "#f0b27a" : "#6b6860";
      c.font = "600 30px system-ui, sans-serif";
      c.fillText(d.sub, 42, 120);
    }));
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.renderOrder = 10;
    sp.scale.set(2.5, 0.9, 1);
    scene.add(sp);
    return { g, sp, d };
  });

  const c = new THREE.Color();
  const dm = new THREE.Object3D();
  const v = new THREE.Vector3();

  return {
    resize(aspect) {
      camera.fov = aspect < 1.25 ? 44 : 32;
      camera.position.z = aspect < 1.25 ? 16 : 13;
      camera.updateProjectionMatrix();
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
        sp.scale.set(2.5 * k * (d.hot ? 1.1 : 1), 0.9 * k * (d.hot ? 1.1 : 1), 1);
      });
      pin.rotation.z = t * 0.6;
      walk.visible = p > 0.5;
      ctx.setFade(0);
    },
  };
}

// ---------- Food: one chain, three prices ----------
function foodBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;
  lights(ctx, 13);
  const boxMat = new THREE.MeshStandardMaterial({ color: 0xf4efe3, roughness: 0.7 });
  const group = new THREE.Group();
  const base = new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.5, 4.6, 3, 0.08), boxMat);
  const lid = new THREE.Group();
  const lidMesh = new THREE.Mesh(new RoundedBoxGeometry(4.6, 0.12, 4.6, 3, 0.05), boxMat);
  lidMesh.position.set(0, 0, -2.3);
  const logo = label(ctx, 2.6, 1, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#006491";
    g.font = `800 ${Math.round(h * 0.5)}px system-ui, sans-serif`;
    g.fillText("PIZZA", 10, h * 0.7);
    g.fillStyle = "#e31837";
    g.fillRect(0, h * 0.8, w * 0.5, 8);
  }, 160);
  logo.m.rotation.x = -Math.PI / 2;
  logo.m.position.set(0, 0.07, -2.3);
  lid.add(lidMesh, logo.m);
  lid.position.set(0, 0.28, 2.3);
  const pizza = new THREE.Group();
  const crust = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.18, 48), new THREE.MeshStandardMaterial({ color: 0xe8b25c, roughness: 0.8 }));
  const cheese = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.1, 48), new THREE.MeshStandardMaterial({ color: 0xf6d26e, roughness: 0.6 }));
  cheese.position.y = 0.12;
  pizza.add(crust, cheese);
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2;
    const r = i % 3 ? 1.1 : 0.45;
    const pep = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 20), new THREE.MeshStandardMaterial({ color: 0xc23a2b, roughness: 0.6 }));
    pep.position.set(Math.cos(a * 1.7) * r, 0.2, Math.sin(a * 1.7) * r);
    pizza.add(pep);
  }
  pizza.position.y = 0.4;
  group.add(base, pizza, lid);
  group.rotation.x = 0.55;
  scene.add(group);

  const rows = [
    ["Domino's app", "₹412", true],
    ["Swiggy", "₹448", false],
    ["Zomato", "₹456", false],
  ] as const;
  const tags = rows.map(([n, price, hot]) => {
    const t = label(ctx, 2.8, 0.95, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      g.fillStyle = hot ? "#12110e" : "#fffdf6";
      rrect(g, 2, 2, w - 4, h - 4, h / 2);
      g.fill();
      g.fillStyle = hot ? "#fff" : "#12110e";
      g.font = `700 ${Math.round(h * 0.3)}px system-ui, sans-serif`;
      g.fillText(n, h * 0.42, h * 0.45);
      g.fillStyle = hot ? "#f0b27a" : "#12110e";
      g.font = `800 ${Math.round(h * 0.42)}px system-ui, sans-serif`;
      g.fillText(price, h * 0.42, h * 0.84);
    }, 200);
    scene.add(t.m);
    return t.m;
  });
  const shadow = blob(ctx, 8, 6);
  shadow.position.y = -2.7;

  return {
    resize(aspect) {
      camera.fov = aspect < 1.25 ? 46 : 34;
      camera.position.z = aspect < 1.25 ? 16 : 13;
      camera.updateProjectionMatrix();
    },
    update(p, t) {
      const open = smooth(0.06, 0.28, p);
      lid.rotation.x = -open * 2.5;
      group.rotation.y = Math.sin(t * 0.4) * 0.25 + ctx.pointer.x * 0.3;
      group.position.set(-2.1, -0.6, 0);
      pizza.rotation.y = t * 0.15;
      tags.forEach((m, i) => {
        const k = smooth(0.3 + i * 0.1, 0.45 + i * 0.1, p) * (1 - smooth(0.9, 0.98, p));
        m.position.set(2.7, 1.5 - i * 1.15 + Math.sin(t + i) * 0.06, 0.8);
        m.scale.setScalar(k * (i === 0 ? 1.1 : 1));
      });
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

// play in, hold on the finished state, play back out: no hard cut at the loop point
const hold = (p: number) => Math.min(1, (p < 0.5 ? p * 2 : (1 - p) * 2) * 1.25);

export function mountDiorama(kind: string): (opts: Opts) => Handle | null {
  return (opts) =>
    mountScene({
      ...opts,
      fov: 32,
      transparent: true,
      build: (ctx) => {
        const b = (builders[kind] ?? payBuild)(ctx);
        return { ...b, update: (p, t, dt, a) => b.update(opts.mode === "card" ? hold(p) : p, t, dt, a) };
      },
    });
}
