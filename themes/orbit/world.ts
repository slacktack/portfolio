import * as THREE from "three";
import { systems } from "@/lib/site";
import { beaconColors, marks, type Mark } from "./data";

const R = 10;
const ALT = 1.45;
const UP = new THREE.Vector3(0, 1, 0);

export type Mode = "overview" | "chase" | "auto" | "docked";

export type WorldOpts = {
  host: HTMLElement;
  minimap: () => HTMLCanvasElement | null;
  label: (id: string) => HTMLElement | null;
  onNearby: (id: string | null) => void;
  onArrive: (id: string) => void;
  onPick: (id: string) => void;
  onGround: () => void;
  onMode: (m: Mode) => void;
  start: string | null;
  night: boolean;
  collected: string[];
  onPower: (charge: number, burst: boolean) => void;
};

export type World = {
  flyTo: (id: string) => void;
  setNight: (on: boolean) => void;
  setPanel: (px: number) => void;
  setKey: (code: string, down: boolean) => void;
  overview: () => void;
  docked: () => string | null;
  setPaused: (p: boolean) => void;
  collect: (id: string, burst: boolean) => void;
  dispose: () => void;
};

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const v3 = () => new THREE.Vector3();

export function dirOf(lat: number, lon: number) {
  const a = THREE.MathUtils.degToRad(lat);
  const b = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b));
}

function north(d: THREE.Vector3) {
  const n = UP.clone().sub(d.clone().multiplyScalar(d.dot(UP)));
  return n.lengthSq() < 1e-6 ? new THREE.Vector3(0, 0, -1) : n.normalize();
}

function toward(v: THREE.Vector3, t: THREE.Vector3, a: number) {
  return v.clone().multiplyScalar(Math.cos(a)).add(t.clone().multiplyScalar(Math.sin(a))).normalize();
}

function tangentTo(from: THREE.Vector3, to: THREE.Vector3) {
  const t = to.clone().sub(from.clone().multiplyScalar(from.dot(to)));
  return t.lengthSq() < 1e-8 ? north(from) : t.normalize();
}

function frameQ(up: THREE.Vector3, fwd: THREE.Vector3) {
  const z = fwd.clone().sub(up.clone().multiplyScalar(up.dot(fwd))).normalize();
  const x = v3().crossVectors(up, z).normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, up, z));
}

function slerpDir(a: THREE.Vector3, b: THREE.Vector3, u: number, out: THREE.Vector3) {
  const om = Math.acos(THREE.MathUtils.clamp(a.dot(b), -1, 1));
  if (om < 1e-4) return out.copy(b);
  const s = Math.sin(om);
  return out
    .copy(a)
    .multiplyScalar(Math.sin((1 - u) * om) / s)
    .add(b.clone().multiplyScalar(Math.sin(u * om) / s))
    .normalize();
}

// Cheap value noise for the terrain.
function hash(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = THREE.MathUtils.lerp;
  const c = (a: number, b: number, d: number) => hash(xi + a, yi + b, zi + d);
  return l(
    l(l(c(0, 0, 0), c(1, 0, 0), u), l(c(0, 1, 0), c(1, 1, 0), u), v),
    l(l(c(0, 0, 1), c(1, 0, 1), u), l(c(0, 1, 1), c(1, 1, 1), u), v),
    w
  );
}
function fbm(d: THREE.Vector3) {
  let a = 0.5, f = 1.7, s = 0;
  for (let i = 0; i < 4; i++) {
    s += a * vnoise(d.x * f + 11, d.y * f + 7, d.z * f + 3);
    a *= 0.5;
    f *= 2.1;
  }
  return s;
}

const smooth = (e0: number, e1: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

type Site = { id: string; dir: THREE.Vector3; pad: THREE.Vector3; face: THREE.Vector3; flat: number; height: number; color: string; mark?: Mark };

export function createWorld(o: WorldOpts): World {
  const { host } = o;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(2, Math.max(1.5, window.devicePixelRatio || 1)));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "ob-canvas";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xcfeaff, 30, 70);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);

  const grad = new THREE.DataTexture(new Uint8Array([70, 160, 255]), 3, 1, THREE.RedFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter;
  grad.needsUpdate = true;
  const inkMat = new THREE.MeshBasicMaterial({ color: "#141a33", side: THREE.BackSide });
  const noRay = () => {};
  function ink(root: THREE.Object3D, k = 1.07) {
    const list: THREE.Mesh[] = [];
    root.traverse((ob) => {
      const me = ob as THREE.Mesh;
      const mm = me.material as THREE.Material | undefined;
      if (me.isMesh && !me.userData.ink && mm && mm.visible !== false && !mm.transparent && !(mm instanceof THREE.ShaderMaterial)) list.push(me);
    });
    return list.map((me) => {
      const hull = new THREE.Mesh(me.geometry, inkMat);
      hull.scale.setScalar(k);
      hull.userData.ink = true;
      hull.raycast = noRay;
      me.add(hull);
      return hull;
    });
  }
  type Grp = { s: Site; center: THREE.Vector3; rad: number; mats: THREE.MeshToonMaterial[]; hulls: THREE.Mesh[]; fade: number };
  const groups: Grp[] = [];

  const hemi = new THREE.HemisphereLight(0xcdeeff, 0xffc58f, 1.5);
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.4);
  const fill = new THREE.DirectionalLight(0xfda4af, 0.5);
  scene.add(hemi, sun, fill, sun.target);

  // Sites: landmarks plus one outpost per system around the tower.
  const sites: Site[] = [];
  for (const m of marks) {
    const d = dirOf(m.lat, m.lon);
    const south = north(d).negate();
    const pad = toward(d, south, m.key === "tower" ? 0.17 : 0.12);
    sites.push({ id: m.key, dir: d, pad, face: tangentTo(pad, d), flat: m.key === "tower" ? 0.3 : 0.15, height: m.height, color: m.color, mark: m });
  }
  const tower = sites[0];
  const tn = north(tower.dir);
  const te = v3().crossVectors(tn, tower.dir).normalize();
  systems.forEach((s, i) => {
    const a = ((i + 0.5) / systems.length) * Math.PI * 2;
    const t = tn.clone().multiplyScalar(Math.cos(a)).add(te.clone().multiplyScalar(Math.sin(a))).normalize();
    const d = toward(tower.dir, t, 0.22);
    const pad = toward(d, t, 0.07);
    sites.push({ id: `b:${s.slug}`, dir: d, pad, face: tangentTo(pad, d), flat: 0, height: 0.9, color: beaconColors[i % beaconColors.length] });
  });
  const byId = new Map(sites.map((s) => [s.id, s]));
  const markSites = sites.filter((s) => s.mark);

  function heightAt(d: THREE.Vector3) {
    let h = (fbm(d) - 0.42) * 2.4;
    for (const s of markSites) {
      const ang = Math.acos(THREE.MathUtils.clamp(d.dot(s.dir), -1, 1));
      const w = smooth(s.flat + 0.09, s.flat, ang);
      h = THREE.MathUtils.lerp(h, 0.16, w);
    }
    return h;
  }
  const radiusAt = (h: number) => (h > 0 ? R + h * 0.85 + Math.max(0, h - 0.55) * 1.3 : R - 0.3 + h * 0.3);

  const mats = new Map<string, THREE.MeshToonMaterial>();
  const mat = (color: string, extra: THREE.MeshToonMaterialParameters = {}) => {
    const k = color + JSON.stringify(extra);
    let m = mats.get(k);
    if (!m) {
      m = new THREE.MeshToonMaterial({ gradientMap: grad, color, ...extra });
      mats.set(k, m);
    }
    return m;
  };
  const glows: { m: THREE.MeshToonMaterial; day: number; night: number }[] = [];
  const glow = (color: string, day: number, night: number, extra: THREE.MeshToonMaterialParameters = {}) => {
    const m = new THREE.MeshToonMaterial({ gradientMap: grad, color, emissive: color, emissiveIntensity: day, ...extra });
    glows.push({ m, day, night });
    return m;
  };
  const mesh = (g: THREE.BufferGeometry, m: THREE.Material, x = 0, y = 0, z = 0) => {
    const me = new THREE.Mesh(g, m);
    me.position.set(x, y, z);
    return me;
  };

  // Planet
  const pg = new THREE.IcosahedronGeometry(R, 34);
  const pos = pg.attributes.position as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const tmp = v3();
  const hs = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    tmp.fromBufferAttribute(pos, i).normalize();
    const h = heightAt(tmp);
    hs[i] = h;
    tmp.multiplyScalar(radiusAt(h));
    pos.setXYZ(i, tmp.x, tmp.y, tmp.z);
  }
  const pal = {
    sea: new THREE.Color("#1e88e5"),
    sand: new THREE.Color("#ffd27a"),
    g1: new THREE.Color("#3ee87a"),
    g2: new THREE.Color("#1fcf5f"),
    g3: new THREE.Color("#86f5a8"),
    hill: new THREE.Color("#11a84a"),
    rock: new THREE.Color("#a3a9b8"),
    snow: new THREE.Color("#f8fafc"),
  };
  const col = new THREE.Color();
  for (let f = 0; f < pos.count; f += 3) {
    const h = (hs[f] + hs[f + 1] + hs[f + 2]) / 3;
    const r = hash(f * 0.37, f * 0.11, 3.1);
    if (h < 0) col.copy(pal.sea);
    else if (h < 0.07) col.copy(pal.sand);
    else if (h < 0.45) col.copy(r < 0.33 ? pal.g1 : r < 0.66 ? pal.g2 : pal.g3);
    else if (h < 0.7) col.copy(pal.hill);
    else if (h < 0.92) col.copy(pal.rock);
    else col.copy(pal.snow);
    col.offsetHSL(0, 0, (r - 0.5) * 0.05);
    for (let k = 0; k < 3; k++) colors.set([col.r, col.g, col.b], (f + k) * 3);
  }
  pg.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  pg.computeVertexNormals();
  const planet = new THREE.Mesh(pg, new THREE.MeshToonMaterial({ gradientMap: grad, vertexColors: true }));
  scene.add(planet);

  const waterMat = new THREE.MeshToonMaterial({ gradientMap: grad, color: "#38bdf8" });
  const water = new THREE.Mesh(new THREE.IcosahedronGeometry(R + 0.02, 14), waterMat);
  scene.add(water);
  const rim = new THREE.Mesh(new THREE.SphereGeometry(R + 0.16, 72, 36), inkMat);
  scene.add(rim);

  // Scenery: instanced trees and rocks
  const place = (obj: THREE.Object3D, d: THREE.Vector3, lift = 0, face?: THREE.Vector3) => {
    obj.position.copy(d).multiplyScalar(radiusAt(heightAt(d)) + lift);
    obj.quaternion.copy(frameQ(d, face ?? north(d)));
  };
  const nearSite = (d: THREE.Vector3, pad: number) =>
    sites.some((s) => Math.acos(THREE.MathUtils.clamp(d.dot(s.dir), -1, 1)) < (s.mark ? s.flat + pad : 0.05)) ||
    sites.some((s) => s.mark && Math.acos(THREE.MathUtils.clamp(d.dot(s.pad), -1, 1)) < 0.08);
  const treeSpots: THREE.Vector3[] = [];
  for (let i = 0; treeSpots.length < 320 && i < 6000; i++) {
    const d = new THREE.Vector3(hash(i, 1, 2) * 2 - 1, hash(i, 3, 4) * 2 - 1, hash(i, 5, 6) * 2 - 1);
    if (d.lengthSq() < 0.01) continue;
    d.normalize();
    const h = heightAt(d);
    if (h < 0.09 || h > 0.62 || nearSite(d, 0.03)) continue;
    treeSpots.push(d);
  }
  const pine = new THREE.InstancedMesh(new THREE.ConeGeometry(0.2, 0.62, 6).translate(0, 0.42, 0), mat("#ffffff"), treeSpots.length);
  const round = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.24, 0).translate(0, 0.38, 0), mat("#ffffff"), treeSpots.length);
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.04, 0.06, 0.24, 5).translate(0, 0.12, 0), mat("#a16207"), treeSpots.length);
  const greens = ["#16a34a", "#22c55e", "#15803d", "#4ade80", "#65a30d"].map((c) => new THREE.Color(c));
  const dummy = new THREE.Object3D();
  let np = 0, nr = 0;
  treeSpots.forEach((d, i) => {
    place(dummy, d, -0.02);
    const s = 0.75 + hash(i, 9, 9) * 0.6;
    dummy.scale.setScalar(s);
    dummy.updateMatrix();
    trunk.setMatrixAt(i, dummy.matrix);
    const c = greens[Math.floor(hash(i, 7, 7) * greens.length)];
    if (hash(i, 8, 8) < 0.55) {
      pine.setMatrixAt(np, dummy.matrix);
      pine.setColorAt(np++, c);
    } else {
      round.setMatrixAt(nr, dummy.matrix);
      round.setColorAt(nr++, c);
    }
  });
  pine.count = np;
  round.count = nr;
  scene.add(pine, round, trunk);

  const rockSpots: THREE.Vector3[] = [];
  for (let i = 0; rockSpots.length < 70 && i < 4000; i++) {
    const d = new THREE.Vector3(hash(i, 21, 2) * 2 - 1, hash(i, 23, 4) * 2 - 1, hash(i, 25, 6) * 2 - 1);
    if (d.lengthSq() < 0.01) continue;
    d.normalize();
    const h = heightAt(d);
    if (h < 0.02 || nearSite(d, 0.02)) continue;
    rockSpots.push(d);
  }
  const rocks = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(0.16, 0), mat("#cbd5e1"), rockSpots.length);
  rockSpots.forEach((d, i) => {
    place(dummy, d, 0);
    dummy.scale.set(1 + hash(i, 1, 1), 0.6 + hash(i, 2, 2) * 0.6, 1 + hash(i, 3, 3) * 0.5);
    dummy.rotateY(hash(i, 4, 4) * 6);
    dummy.updateMatrix();
    rocks.setMatrixAt(i, dummy.matrix);
  });
  scene.add(rocks);

  // Landmarks
  const hits: THREE.Mesh[] = [];
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  const spinners: { o: THREE.Object3D; axis: "x" | "y" | "z"; speed: number }[] = [];
  const bobbers: { o: THREE.Object3D; base: number; amp: number; speed: number; phase: number }[] = [];
  const pads: { m: THREE.MeshBasicMaterial; id: string }[] = [];
  let blink: THREE.MeshToonMaterial | null = null;
  const beaconOrbs: THREE.Mesh[] = [];
  const smokes: THREE.Mesh[] = [];
  let portalMat: THREE.ShaderMaterial | null = null;

  function landmark(s: Site) {
    const g = new THREE.Group();
    place(g, s.dir, -0.02, s.mark ? tangentTo(s.dir, s.pad) : undefined);
    const k = s.mark?.key;
    const white = mat("#f8fafc");
    if (k === "tower") {
      g.add(mesh(new THREE.CylinderGeometry(0.8, 0.95, 0.3, 8), white, 0, 0.15));
      g.add(mesh(new THREE.CylinderGeometry(0.3, 0.44, 2.2, 8), mat("#e2e8f0"), 0, 1.4));
      g.add(mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.16, 8), mat("#fb923c"), 0, 1.1));
      g.add(mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.16, 8), mat("#fb923c"), 0, 1.75));
      g.add(mesh(new THREE.CylinderGeometry(0.74, 0.5, 0.6, 8), glow("#38bdf8", 0.35, 1.4, {  }), 0, 2.78));
      g.add(mesh(new THREE.CylinderGeometry(0.22, 0.8, 0.24, 8), mat("#1e3a5f"), 0, 3.2));
      g.add(mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.7, 4), mat("#475569"), 0, 3.65));
      blink = glow("#ef4444", 1, 2.5);
      g.add(mesh(new THREE.SphereGeometry(0.07, 8, 6), blink, 0, 4.02));
      const radar = new THREE.Group();
      radar.position.set(0, 3.38, 0);
      radar.add(mesh(new THREE.BoxGeometry(0.7, 0.07, 0.12), mat("#f97316"), 0.2, 0));
      g.add(radar);
      spinners.push({ o: radar, axis: "y", speed: 1.6 });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        g.add(mesh(new THREE.BoxGeometry(0.3, 0.22, 0.3), mat(i % 2 ? "#bae6fd" : "#fed7aa"), Math.cos(a) * 1.05, 0.11, Math.sin(a) * 1.05));
      }
    } else if (k === "hangar") {
      const shell = new THREE.CylinderGeometry(1, 1, 2.1, 14, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2);
      g.add(mesh(shell, mat("#f8fafc", { side: THREE.DoubleSide })));
      g.add(mesh(new THREE.CircleGeometry(1, 14, 0, Math.PI), mat("#fdba74", { side: THREE.DoubleSide }), 0, 0, -1.05));
      for (let i = 0; i < 4; i++) g.add(mesh(new THREE.TorusGeometry(1.02, 0.05, 4, 18, Math.PI), mat("#f97316"), 0, 0, -0.95 + i * 0.63));
      g.add(mesh(new THREE.BoxGeometry(1.9, 0.04, 2.1), mat("#334155"), 0, 0.02, 0));
      g.add(mesh(new THREE.BoxGeometry(2.4, 0.05, 1.3), mat("#e2e8f0"), 0, 0.02, 1.7));
      for (let i = 0; i < 5; i++) g.add(mesh(new THREE.BoxGeometry(0.28, 0.06, 0.1), mat("#facc15"), -0.9 + i * 0.45, 0.04, 2.15));
      g.add(mesh(new THREE.BoxGeometry(1.6, 0.06, 0.06), glow("#fb923c", 0.8, 2.2), 0, 0.98, 1.05));
      const mini = buildCraft(0.75);
      mini.position.set(0, 0.35, -0.1);
      mini.rotation.y = Math.PI * 0.1;
      g.add(mini);
    } else if (k === "dome") {
      g.add(mesh(new THREE.CylinderGeometry(1.05, 1.18, 0.28, 18), mat("#e2e8f0"), 0, 0.14));
      g.add(mesh(new THREE.CylinderGeometry(1.08, 1.08, 0.08, 18), mat("#22c55e"), 0, 0.3));
      g.add(mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), glow("#a7f3d0", 0.12, 0.5, { transparent: true, opacity: 0.42, depthWrite: false }), 0, 0.3));
      const core = new THREE.Group();
      core.position.set(0, 0.85, 0);
      core.add(mesh(new THREE.IcosahedronGeometry(0.3, 0), glow("#4ade80", 0.8, 2)));
      const ring = mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 32), glow("#facc15", 0.6, 1.6));
      ring.rotation.x = 1.1;
      core.add(ring);
      g.add(core);
      spinners.push({ o: core, axis: "y", speed: 0.9 });
      bobbers.push({ o: core, base: 0.85, amp: 0.08, speed: 1.6, phase: 0 });
      const dish = new THREE.Group();
      dish.position.set(1.15, 0.3, -0.4);
      dish.add(mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.5, 6), mat("#94a3b8"), 0, 0.25));
      const bowl = mesh(new THREE.SphereGeometry(0.28, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.6), white, 0, 0.55);
      bowl.rotation.x = Math.PI * 0.75;
      dish.add(bowl);
      g.add(dish);
      spinners.push({ o: dish, axis: "y", speed: 0.4 });
    } else if (k === "library") {
      g.add(mesh(new THREE.BoxGeometry(2.1, 0.22, 1.5), mat("#e7e5e4"), 0, 0.11));
      g.add(mesh(new THREE.BoxGeometry(2.2, 0.1, 0.3), mat("#d6d3d1"), 0, 0.05, 0.85));
      g.add(mesh(new THREE.BoxGeometry(1.6, 0.95, 0.9), mat("#faf5ff"), 0, 0.7, -0.15));
      for (let i = 0; i < 5; i++) g.add(mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.95, 8), white, -0.72 + i * 0.36, 0.7, 0.5));
      g.add(mesh(new THREE.BoxGeometry(1.9, 0.12, 1.35), mat("#ede9fe"), 0, 1.22, 0.05));
      const tri = new THREE.Shape();
      tri.moveTo(-0.98, 0);
      tri.lineTo(0.98, 0);
      tri.lineTo(0, 0.5);
      tri.closePath();
      const roof = new THREE.ExtrudeGeometry(tri, { depth: 1.35, bevelEnabled: false }).translate(0, 0, -0.62);
      g.add(mesh(roof, mat("#8b5cf6"), 0, 1.28));
      for (let i = 0; i < 3; i++) g.add(mesh(new THREE.BoxGeometry(0.22, 0.4, 0.02), glow("#fde68a", 0.25, 1.8), -0.48 + i * 0.48, 0.66, 0.31));
      const book = new THREE.Group();
      book.position.set(0, 2.25, 0);
      const pageL = mesh(new THREE.BoxGeometry(0.42, 0.02, 0.56), glow("#c4b5fd", 0.5, 1.6), -0.2, 0);
      pageL.rotation.z = 0.32;
      const pageR = mesh(new THREE.BoxGeometry(0.42, 0.02, 0.56), glow("#ddd6fe", 0.5, 1.6), 0.2, 0);
      pageR.rotation.z = -0.32;
      book.add(pageL, pageR);
      g.add(book);
      spinners.push({ o: book, axis: "y", speed: 0.6 });
      bobbers.push({ o: book, base: 2.25, amp: 0.12, speed: 1.2, phase: 1 });
    } else if (k === "cottage") {
      g.add(mesh(new THREE.BoxGeometry(1.05, 0.72, 0.85), mat("#fff7ed"), 0, 0.36));
      const roof = mesh(new THREE.ConeGeometry(0.92, 0.62, 4), mat("#f43f5e"), 0, 1.02);
      roof.rotation.y = Math.PI / 4;
      roof.scale.set(1, 1, 0.82);
      g.add(roof);
      g.add(mesh(new THREE.BoxGeometry(0.16, 0.42, 0.16), mat("#9f1239"), 0.28, 1.15, -0.12));
      g.add(mesh(new THREE.BoxGeometry(0.2, 0.36, 0.03), mat("#7c2d12"), 0, 0.18, 0.43));
      for (const x of [-0.32, 0.32]) g.add(mesh(new THREE.BoxGeometry(0.2, 0.18, 0.03), glow("#fde047", 0.2, 2.2), x, 0.42, 0.43));
      g.add(mesh(new THREE.BoxGeometry(0.03, 0.18, 0.2), glow("#fde047", 0.2, 2.2), 0.53, 0.42, 0));
      g.add(mesh(new THREE.BoxGeometry(0.28, 0.02, 1.0), mat("#fcd34d"), 0, 0.01, 0.9));
      for (let i = 0; i < 7; i++) g.add(mesh(new THREE.BoxGeometry(0.05, 0.18, 0.05), mat("#fdba74"), -0.85 + (i > 2 ? 1.1 : 0) + (i % 4) * 0.2, 0.09, 0.95));
      const tr = new THREE.Group();
      tr.position.set(-0.95, 0, -0.35);
      tr.add(mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.4, 5), mat("#a16207"), 0, 0.2));
      tr.add(mesh(new THREE.IcosahedronGeometry(0.34, 0), mat("#22c55e"), 0, 0.6));
      g.add(tr);
      for (let i = 0; i < 3; i++) {
        const p = mesh(new THREE.IcosahedronGeometry(0.09, 0), new THREE.MeshToonMaterial({ gradientMap: grad, color: "#ffffff", transparent: true, opacity: 0.8 }), 0.28, 1.4);
        p.userData.phase = i / 3;
        smokes.push(p);
        g.add(p);
      }
    } else if (k === "portal") {
      g.add(mesh(new THREE.CylinderGeometry(1.05, 1.2, 0.24, 14), mat("#e7e5e4"), 0, 0.12));
      g.add(mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.06, 28), mat("#a78bfa"), 0, 0.27));
      const arch = mesh(new THREE.TorusGeometry(0.95, 0.14, 8, 32, Math.PI), mat("#fef3c7"), 0, 0.3);
      g.add(arch);
      for (const x of [-0.95, 0.95]) g.add(mesh(new THREE.BoxGeometry(0.34, 0.16, 0.34), mat("#fdba74"), x, 0.32));
      portalMat = new THREE.ShaderMaterial({
        uniforms: { t: { value: 0 } },
        side: THREE.DoubleSide,
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `varying vec2 vUv; uniform float t;
          void main(){
            vec2 p = vUv - 0.5; float r = length(p) * 2.0; float a = atan(p.y, p.x);
            float k = sin(a * 3.0 + r * 9.0 - t * 2.2) * 0.5 + 0.5;
            float j = sin(a * 2.0 - r * 6.0 + t * 1.3) * 0.5 + 0.5;
            vec3 c = mix(vec3(0.49,0.83,0.99), vec3(0.98,0.57,0.24), k);
            c = mix(c, vec3(0.85,0.27,0.94), j * 0.55);
            c = mix(c, vec3(0.29,0.87,0.5), smoothstep(0.55, 1.0, r) * 0.6);
            c += (1.0 - r) * 0.35;
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
      g.add(mesh(new THREE.CircleGeometry(0.84, 40, 0, Math.PI), portalMat, 0, 0.3));
      const sw = new THREE.Group();
      sw.position.set(0, 1.0, 0);
      ["#7dd3fc", "#fb923c", "#4ade80"].forEach((c, i) => {
        const a = (i / 3) * Math.PI * 2;
        const cube = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), glow(c, 0.6, 1.6), Math.cos(a) * 1.35, 0.25 * i, Math.sin(a) * 1.35);
        cube.rotation.set(0.6, 0.6, 0);
        sw.add(cube);
      });
      g.add(sw);
      spinners.push({ o: sw, axis: "y", speed: 0.7 });
    } else if (k === "void") {
      g.add(mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.2, 5), mat("#64748b"), 0, 0.6));
      const flag = new THREE.Shape();
      flag.moveTo(0, 0);
      flag.lineTo(0.5, -0.14);
      flag.lineTo(0, -0.3);
      flag.closePath();
      g.add(mesh(new THREE.ShapeGeometry(flag), mat("#fb923c", { side: THREE.DoubleSide }), 0.02, 1.18));
      g.add(mesh(new THREE.TorusGeometry(0.5, 0.03, 4, 24).rotateX(Math.PI / 2), mat("#94a3b8"), 0, 0.03));
    } else {
      // outpost beacon
      g.add(mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 6), mat("#e2e8f0"), 0, 0.06));
      g.add(mesh(new THREE.CylinderGeometry(0.045, 0.08, 0.6, 6), mat("#f1f5f9"), 0, 0.42));
      const orb = mesh(new THREE.IcosahedronGeometry(0.13, 1), glow(s.color, 0.7, 2.2), 0, 0.82);
      beaconOrbs.push(orb);
      g.add(orb);
    }
    const gm: THREE.MeshToonMaterial[] = [];
    if (s.mark) {
      g.traverse((ob) => {
        const me = ob as THREE.Mesh;
        if (me.isMesh && me.material instanceof THREE.MeshToonMaterial && !glows.some((x) => x.m === me.material)) {
          me.material = me.material.clone();
          gm.push(me.material as THREE.MeshToonMaterial);
        }
      });
    }
    const hulls = ink(g);
    groups.push({ s, center: s.dir.clone().multiplyScalar(R + s.height * 0.5), rad: s.mark ? s.height * 0.55 + 0.9 : 0.7, mats: gm, hulls, fade: 1 });
    scene.add(g);
    const hit = mesh(new THREE.SphereGeometry(s.mark ? Math.max(1.2, s.height * 0.6) : 0.4, 8, 6), hitMat, 0, s.mark ? s.height * 0.45 : 0.5);
    hit.userData.id = s.id;
    g.add(hit);
    hits.push(hit);
    if (k !== "void") {
      const pm = new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false });
      const pad = mesh(new THREE.RingGeometry(s.mark ? 0.32 : 0.16, s.mark ? 0.42 : 0.21, 32).rotateX(-Math.PI / 2), pm);
      place(pad, s.pad, 0.04);
      scene.add(pad);
      pads.push({ m: pm, id: s.id });
    }
  }

  function buildCraft(scale = 1) {
    const c = new THREE.Group();
    c.add(mesh(new THREE.SphereGeometry(0.3, 18, 12).scale(1, 0.62, 1.55), mat("#fb923c", {  })));
    const cock = mesh(new THREE.SphereGeometry(0.19, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat("#7dd3fc", { emissive: "#0ea5e9", emissiveIntensity: 0.35 }), 0, 0.1, 0.12);
    cock.scale.set(1, 0.9, 1.4);
    c.add(cock);
    const wing = mesh(new THREE.BoxGeometry(1.25, 0.05, 0.34), mat("#f8fafc", {  }), 0, -0.02, -0.08);
    c.add(wing);
    for (const x of [-0.64, 0.64]) c.add(mesh(new THREE.BoxGeometry(0.1, 0.12, 0.4), mat("#f97316"), x, 0.02, -0.08));
    c.add(mesh(new THREE.BoxGeometry(0.05, 0.3, 0.28), mat("#f8fafc"), 0, 0.2, -0.36));
    c.add(mesh(new THREE.CylinderGeometry(0.11, 0.14, 0.2, 10).rotateX(Math.PI / 2), mat("#334155"), 0, 0, -0.5));
    c.scale.setScalar(scale);
    return c;
  }

  sites.forEach(landmark);

  // Player craft
  const craft = new THREE.Group();
  const body = buildCraft(1.15);
  craft.add(body);
  ink(body, 1.09);
  const flameMat = new THREE.MeshBasicMaterial({ color: "#fdba74", transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false });
  const flame = mesh(new THREE.ConeGeometry(0.1, 0.45, 10).rotateX(-Math.PI / 2).translate(0, 0, -0.22), flameMat, 0, 0, -0.6);
  body.add(flame);
  const halo = mesh(new THREE.TorusGeometry(0.42, 0.018, 6, 40).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#7dd3fc", transparent: true, opacity: 0.7 }), 0, -0.22, 0);
  body.add(halo);
  scene.add(craft);

  const auraU = { k: { value: 0 }, t: { value: 0 } };
  const auraMat = new THREE.ShaderMaterial({
    uniforms: auraU,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    vertexShader: `uniform float t; uniform float k; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 p = position + normal * (sin(position.y * 9.0 - t * 14.0 + position.x * 5.0) * 0.09 * k);
        p.y += max(0.0, position.y) * 0.6 * k;
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `uniform float k; uniform float t; varying vec3 vN; varying vec3 vV;
      void main(){
        float f = pow(1.0 - abs(dot(vN, vV)), 1.5);
        float fl = 0.75 + 0.25 * sin(t * 31.0 + vN.y * 12.0);
        vec3 c = mix(vec3(1.0, 0.6, 0.08), vec3(1.0, 0.96, 0.62), f);
        gl_FragColor = vec4(c * f * fl * k * 1.5, 1.0);
      }`,
  });
  const aura = new THREE.Group();
  aura.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 3).scale(1.1, 1, 1.5), auraMat));
  aura.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.92, 3).scale(1.15, 1.1, 1.6), auraMat));
  aura.visible = false;
  craft.add(aura);
  const sparkMat = new THREE.MeshBasicMaterial({ color: "#fff7c2", transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  const sparks = Array.from({ length: 7 }, () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 0.5), sparkMat);
    m.visible = false;
    craft.add(m);
    return m;
  });
  const TN = 60;
  const trailPos = new Float32Array(TN * 3);
  const trailCol = new Float32Array(TN * 3);
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.BufferAttribute(trailPos, 3));
  tg.setAttribute("color", new THREE.BufferAttribute(trailCol, 3));
  const trail = new THREE.Points(tg, new THREE.PointsMaterial({ size: 0.34, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  trail.frustumCulled = false;
  scene.add(trail);
  let trailInit = false;

  const bursts: { m: THREE.Mesh; t: number; size: number }[] = [];
  function spawnBurst(at: THREE.Vector3, color: string, size: number) {
    const mk = (g: THREE.BufferGeometry) => {
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      m.position.copy(at);
      m.lookAt(camera.position);
      m.scale.setScalar(0.01);
      scene.add(m);
      bursts.push({ m, t: 0, size });
    };
    mk(new THREE.TorusGeometry(1, 0.07, 6, 48));
    mk(new THREE.SphereGeometry(0.6, 16, 12));
  }

  const cores = new Map<string, { g: THREE.Group; base: THREE.Vector3; s: Site }>();
  for (const s of markSites) {
    if (s.id === "void") continue;
    const g = new THREE.Group();
    const base = s.dir.clone().multiplyScalar(R + s.height + 1.05);
    g.position.copy(base);
    g.quaternion.copy(frameQ(s.dir, north(s.dir)));
    g.add(mesh(new THREE.OctahedronGeometry(0.26, 0), glow("#facc15", 0.9, 1.8)));
    g.add(mesh(new THREE.SphereGeometry(0.5, 16, 12), new THREE.MeshBasicMaterial({ color: s.color, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false })));
    ink(g, 1.14);
    g.visible = !o.collected.includes(s.id);
    scene.add(g);
    cores.set(s.id, { g, base, s });
  }
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: "#0c1b2a", transparent: true, opacity: 0.16, depthWrite: false }));
  scene.add(shadow);

  // Clouds
  const clouds = new THREE.Group();
  const cloudParts: { g: THREE.Group; m: THREE.MeshToonMaterial }[] = [];
  for (let i = 0; i < 16; i++) {
    const d = new THREE.Vector3(hash(i, 40, 1) * 2 - 1, (hash(i, 41, 1) * 2 - 1) * 0.8, hash(i, 42, 1) * 2 - 1).normalize();
    const cm = new THREE.MeshToonMaterial({ gradientMap: grad, color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 0.18, transparent: true, opacity: 0.95 });
    const g = new THREE.Group();
    const n = 3 + Math.floor(hash(i, 43, 1) * 3);
    for (let j = 0; j < n; j++) {
      const s = 0.32 + hash(i, j, 44) * 0.35;
      const b = mesh(new THREE.IcosahedronGeometry(1, 1), cm, (j - n / 2) * 0.42, hash(i, j, 45) * 0.15, (hash(i, j, 46) - 0.5) * 0.4);
      b.scale.set(s * 1.25, s * 0.8, s);
      g.add(b);
    }
    g.position.copy(d).multiplyScalar(R + 3.3 + hash(i, 47, 1) * 1.1);
    g.quaternion.copy(frameQ(d, north(d)));
    clouds.add(g);
    cloudParts.push({ g, m: cm });
  }
  scene.add(clouds);

  // Stars
  const sg = new THREE.BufferGeometry();
  const sp = new Float32Array(900 * 3);
  for (let i = 0; i < 900; i++) {
    const d = new THREE.Vector3(hash(i, 60, 1) * 2 - 1, hash(i, 61, 1) * 2 - 1, hash(i, 62, 1) * 2 - 1).normalize().multiplyScalar(140 + hash(i, 63, 1) * 60);
    sp.set([d.x, d.y, d.z], i * 3);
  }
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const starMat = new THREE.PointsMaterial({ color: "#ffffff", size: 1.8, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  scene.add(new THREE.Points(sg, starMat));

  // Flight state
  const p = v3();
  const h = v3();
  let speed = 0;
  let yaw = 0;
  let bank = 0;
  let mode: Mode = "overview";
  let dockedId: string | null = null;
  let nearby: string | null = null;
  const keys = new Set<string>();
  let auto: { p0: THREE.Vector3; p1: THREE.Vector3; h0: THREE.Vector3; h1: THREE.Vector3; t: number; dur: number; lift: number; id: string | null } | null = null;
  let thrust = 0;
  let charge = 0;
  let burstDone = false;
  let shake = 0;
  let lastPow = -1;
  let sparkT = 0;

  const startSite = o.start ? byId.get(o.start) : undefined;
  if (startSite) {
    p.copy(startSite.pad);
    h.copy(startSite.face);
    mode = "docked";
    dockedId = startSite.id;
  } else {
    const c = byId.get("cottage")!;
    p.copy(c.pad);
    h.copy(c.face);
  }

  const setMode = (m: Mode) => {
    if (mode === m) return;
    mode = m;
    o.onMode(m);
  };

  function altAt(d: THREE.Vector3) {
    let a = ALT;
    for (const s of markSites) {
      const ang = Math.acos(THREE.MathUtils.clamp(d.dot(s.dir), -1, 1));
      a += Math.max(0, s.height + 0.55 - ALT) * smooth(0.16, 0.05, ang);
    }
    return a;
  }

  function flyTo(id: string) {
    const s = byId.get(id);
    if (!s) return;
    if (dockedId === id && !auto) {
      o.onArrive(id);
      return;
    }
    if (auto?.id === id) return;
    startAuto(s.pad, s.face, id);
  }

  function startAuto(target: THREE.Vector3, face: THREE.Vector3 | null, id: string | null) {
    const ang = Math.acos(THREE.MathUtils.clamp(p.dot(target), -1, 1));
    const p0 = p.clone();
    if (ang > Math.PI - 0.02) p0.add(h.clone().multiplyScalar(0.05)).normalize();
    const h1 = face ?? h.clone();
    auto = { p0, p1: target.clone(), h0: h.clone(), h1, t: 0, dur: 0.7 + ang * 1.25, lift: Math.min(1.8, ang * 1.6), id };
    dockedId = null;
    speed = 0;
    setMode("auto");
  }

  const ease = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  // Camera
  const camPos = new THREE.Vector3(0, 12, 70);
  const camLook = v3();
  const camUp = UP.clone();
  const ovDir = new THREE.Vector3(0.12, 0.45, 1).normalize();
  if (startSite) ovDir.copy(startSite.dir);
  let panel = 0;
  let panelTarget = 0;
  let night = o.night ? 1 : 0;
  let nightTarget = night;
  let W = 1, H = 1;
  let first = true;

  function camTarget(dt: number, outPos: THREE.Vector3, outLook: THREE.Vector3, outUp: THREE.Vector3) {
    const aspect = W / H;
    const k = aspect < 0.8 ? 1.45 : aspect < 1.2 ? 1.15 : 1;
    if (mode === "overview") {
      if (!dragging) ovDir.applyAxisAngle(UP, dt * 0.05);
      const dist = aspect < 0.8 ? 58 : 40;
      outPos.copy(ovDir).multiplyScalar(dist);
      outLook.set(0, 0, 0);
      outUp.copy(UP);
      return;
    }
    const cp = craft.position;
    const docked = mode === "docked";
    const back = (docked ? 7.4 : 5.8 + Math.abs(speed) * 0.25) * k;
    const up = (docked ? 5.4 : 3.5) * k;
    outPos.copy(cp).addScaledVector(p, up).addScaledVector(h, -back);
    outLook.copy(cp).addScaledVector(h, docked ? 2.6 : 2.4).addScaledVector(p, docked ? 1.6 : 0.4);
    outUp.copy(p);
  }

  // Input
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let downAt: { x: number; y: number; t: number } | null = null;
  let dragging = false;
  let hoverId: string | null = null;

  function pick(e: PointerEvent): { id: string | null; ground: THREE.Vector3 | null } {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(hits, false)[0];
    if (hit) return { id: hit.object.userData.id as string, ground: null };
    const g = ray.ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(), R + 0.2), v3());
    return { id: null, ground: g ? g.normalize() : null };
  }

  const onDown = (e: PointerEvent) => {
    downAt = { x: e.clientX, y: e.clientY, t: performance.now() };
    dragging = false;
  };
  const onMove = (e: PointerEvent) => {
    if (downAt && e.buttons) {
      const dx = e.clientX - downAt.x, dy = e.clientY - downAt.y;
      if (Math.hypot(dx, dy) > 6) dragging = true;
      if (dragging && mode === "overview") {
        ovDir.applyAxisAngle(UP, -e.movementX * 0.006);
        const right = v3().crossVectors(UP, ovDir).normalize();
        const next = ovDir.clone().applyAxisAngle(right, -e.movementY * 0.006);
        if (Math.abs(next.y) < 0.92) ovDir.copy(next);
        return;
      }
    }
    if (e.pointerType !== "mouse") return;
    const { id } = pick(e);
    if (id !== hoverId) {
      if (hoverId) o.label(hoverId)?.removeAttribute("data-hot");
      hoverId = id;
      if (id) {
        o.label(id)?.setAttribute("data-hot", "");
        host.dataset.cursor = "Land";
      } else delete host.dataset.cursor;
    }
  };
  const onUp = (e: PointerEvent) => {
    const d = downAt;
    downAt = null;
    if (!d || dragging || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) {
      dragging = false;
      return;
    }
    const { id, ground } = pick(e);
    if (id) o.onPick(id);
    else if (ground) {
      o.onGround();
      startAuto(ground, null, null);
    }
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);

  // Labels
  const lp = v3();
  const toCam = v3();
  function updateLabels() {
    const showBeacons = mode !== "overview" && craft.position.clone().normalize().dot(tower.dir) > Math.cos(0.55);
    for (const s of sites) {
      const el = o.label(s.id);
      if (!el) continue;
      if (!s.mark && !showBeacons) {
        el.removeAttribute("data-vis");
        continue;
      }
      lp.copy(s.dir).multiplyScalar(R + s.height + (s.mark ? 1.8 : 0.45));
      toCam.copy(camera.position).sub(lp);
      const facing = toCam.normalize().dot(s.dir);
      lp.project(camera);
      const vis = facing > (s.mark ? 0.05 : 0.2) && lp.z < 1 && Math.abs(lp.x) < 1.15 && Math.abs(lp.y) < 1.15;
      if (vis) {
        const x = ((lp.x + 1) / 2) * W;
        const y = ((1 - lp.y) / 2) * H;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.setAttribute("data-vis", "");
      } else el.removeAttribute("data-vis");
    }
  }

  // Minimap: azimuthal projection centred on the craft, heading up.
  function drawMinimap() {
    const c = o.minimap();
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const s = c.width;
    const rad = s / 2 - 6 * (s / 140);
    ctx.clearRect(0, 0, s, s);
    ctx.save();
    ctx.translate(s / 2, s / 2);
    const dpr = s / 140;
    const right = v3().crossVectors(h, p);
    const proj = (d: THREE.Vector3, rim = false) => {
      const cos = THREE.MathUtils.clamp(p.dot(d), -1, 1);
      const a = Math.acos(cos);
      const t = d.clone().sub(p.clone().multiplyScalar(cos));
      if (t.lengthSq() < 1e-8) return [0, 0];
      t.normalize();
      const rr = rim ? rad : (a / Math.PI) * rad;
      return [t.dot(right) * rr, -t.dot(h) * rr];
    };
    ctx.strokeStyle = night > 0.5 ? "rgba(186,230,253,0.22)" : "rgba(12,27,42,0.14)";
    ctx.lineWidth = dpr;
    for (const f of [0.33, 0.66]) {
      ctx.beginPath();
      ctx.arc(0, 0, rad * f, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const st of markSites) {
      if (st.id === "void") continue;
      const [x, y] = proj(st.dir);
      ctx.fillStyle = st.color;
      ctx.beginPath();
      ctx.arc(x, y, (st.id === nearby || st.id === dockedId ? 6 : 4.5) * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    }
    const [nx, ny] = proj(new THREE.Vector3(0, 1, 0), true);
    ctx.fillStyle = "#fb923c";
    ctx.font = `700 ${10 * dpr}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", nx * 0.9, ny * 0.9);
    ctx.fillStyle = night > 0.5 ? "#f8fafc" : "#0c1b2a";
    ctx.beginPath();
    ctx.moveTo(0, -7 * dpr);
    ctx.lineTo(5 * dpr, 6 * dpr);
    ctx.lineTo(0, 3 * dpr);
    ctx.lineTo(-5 * dpr, 6 * dpr);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Night palette
  const dayC = { hemiS: new THREE.Color("#cdeeff"), hemiG: new THREE.Color("#ffc58f"), sun: new THREE.Color("#fff0d6"), fog: new THREE.Color("#cfeaff"), water: new THREE.Color("#38bdf8") };
  const nightC = { hemiS: new THREE.Color("#3b4f9a"), hemiG: new THREE.Color("#1e1b4b"), sun: new THREE.Color("#a5b4fc"), fog: new THREE.Color("#1b2550"), water: new THREE.Color("#1d4ed8") };
  const sunDay = new THREE.Vector3(0.6, 0.75, 0.55).normalize().multiplyScalar(60);
  const sunNight = new THREE.Vector3(-0.5, 0.6, -0.4).normalize().multiplyScalar(60);
  function applyNight() {
    const n = night;
    hemi.color.copy(dayC.hemiS).lerp(nightC.hemiS, n);
    hemi.groundColor.copy(dayC.hemiG).lerp(nightC.hemiG, n);
    hemi.intensity = THREE.MathUtils.lerp(1.5, 0.9, n);
    sun.color.copy(dayC.sun).lerp(nightC.sun, n);
    sun.intensity = THREE.MathUtils.lerp(2.4, 0.9, n);
    sun.position.copy(sunDay).lerp(sunNight, n);
    fill.intensity = THREE.MathUtils.lerp(0.5, 0.25, n);
    fill.position.set(-40, -10, 30);
    (scene.fog as THREE.Fog).color.copy(dayC.fog).lerp(nightC.fog, n);
    waterMat.color.copy(dayC.water).lerp(nightC.water, n);
    starMat.opacity = n * 0.9;
    for (const g of glows) g.m.emissiveIntensity = THREE.MathUtils.lerp(g.day, g.night, n);
    for (const c of cloudParts) c.m.emissiveIntensity = THREE.MathUtils.lerp(0.18, 0.02, n);
    renderer.toneMappingExposure = THREE.MathUtils.lerp(1.05, 1.15, n);
  }
  applyNight();

  // Loop
  let raf = 0;
  let paused = false;
  let hidden = document.hidden;
  let offscreen = false;
  let last = performance.now();
  let time = 0;
  let frame = 0;
  const tq = new THREE.Quaternion();
  const tmpP = v3();

  function step(dt: number) {
    time += dt;
    if (Math.abs(night - nightTarget) > 0.001) {
      night += (nightTarget - night) * (1 - Math.exp(-dt * 2.2));
      applyNight();
    }
    panel += (panelTarget - panel) * (1 - Math.exp(-dt * 6));

    const fwd = (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) - (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const turn = (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0) - (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0);
    const boost = keys.has("ShiftLeft") || keys.has("ShiftRight");
    let alt = altAt(p);
    charge = boost && mode !== "auto" ? Math.min(1, charge + dt / 1.1) : Math.max(0, charge - dt * 1.6);
    let burst = false;
    if (charge >= 1 && !burstDone) {
      burstDone = true;
      burst = true;
      shake = 1;
      spawnBurst(craft.position, "#facc15", 3.4);
    }
    if (!boost) burstDone = false;
    if (burst || Math.abs(charge - lastPow) > 0.02 || (charge === 0 && lastPow !== 0)) {
      lastPow = charge;
      o.onPower(charge, burst);
    }

    if (auto) {
      auto.t += dt;
      const u = Math.min(1, auto.t / auto.dur);
      const e = ease(u);
      slerpDir(auto.p0, auto.p1, e, tmpP);
      const ahead = slerpDir(auto.p0, auto.p1, Math.min(1, e + 0.02), v3());
      const travel = ahead.distanceToSquared(tmpP) > 1e-10 ? tangentTo(tmpP, ahead) : h.clone();
      p.copy(tmpP);
      const w = smooth(0.55, 1, u);
      h.copy(travel.lerp(tangentTo(p, p.clone().add(auto.h1)), w)).normalize();
      if (auto.id === null) h.copy(travel);
      alt += Math.sin(Math.PI * e) * auto.lift;
      thrust = Math.sin(Math.PI * u);
      bank += (0 - bank) * (1 - Math.exp(-dt * 4));
      if (u >= 1) {
        const id = auto.id;
        auto = null;
        if (id) {
          dockedId = id;
          setMode("docked");
          o.onArrive(id);
        } else setMode("chase");
      }
    } else if (mode !== "overview" || fwd || turn || boost) {
      if ((fwd || turn || boost) && mode !== "chase") {
        dockedId = null;
        setMode("chase");
      }
      const target = fwd * (3.8 + charge * 5.5);
      speed += (target - speed) * (1 - Math.exp(-dt * 2.6));
      yaw += (turn * 1.9 - yaw) * (1 - Math.exp(-dt * 6));
      if (Math.abs(yaw) > 1e-4) h.applyAxisAngle(p, yaw * dt);
      if (Math.abs(speed) > 1e-4) {
        const axis = v3().crossVectors(p, h).normalize();
        const a = (speed * dt) / (R + ALT);
        p.applyAxisAngle(axis, a).normalize();
        h.applyAxisAngle(axis, a);
      }
      h.sub(p.clone().multiplyScalar(p.dot(h))).normalize();
      thrust = Math.min(1, Math.abs(speed) / 4);
      bank += (-yaw * 0.32 - bank) * (1 - Math.exp(-dt * 5));
    }

    const bob = Math.sin(time * 2.1) * 0.06;
    craft.position.copy(p).multiplyScalar(R + alt + bob);
    tq.copy(frameQ(p, h));
    craft.quaternion.copy(tq);
    body.rotation.z = bank;
    body.rotation.x = -Math.min(0.2, speed * 0.03);
    flame.scale.set(1, 1, 0.5 + thrust * 1.4 + Math.sin(time * 40) * 0.08);
    flameMat.opacity = 0.5 + thrust * 0.45;
    halo.rotation.y = time * 1.5;
    aura.visible = charge > 0.01;
    auraU.k.value = charge;
    auraU.t.value = time;
    sparkT -= dt;
    if (sparkT <= 0) {
      sparkT = 0.06;
      for (const sp of sparks) {
        sp.visible = charge > 0.55 && Math.random() < 0.7;
        if (!sp.visible) continue;
        sp.position.set((Math.random() - 0.5) * 1.4, (Math.random() - 0.3) * 1.1, (Math.random() - 0.5) * 1.8);
        sp.rotation.set(Math.random() * 6, Math.random() * 6, Math.random() * 6);
      }
    }
    const tail = v3().copy(craft.position).addScaledVector(h, -0.7);
    if (!trailInit) {
      for (let i = 0; i < TN; i++) trailPos.set([tail.x, tail.y, tail.z], i * 3);
      trailInit = true;
    }
    trailPos.copyWithin(3, 0, (TN - 1) * 3);
    trailPos.set([tail.x + (Math.random() - 0.5) * 0.08 * charge, tail.y, tail.z + (Math.random() - 0.5) * 0.08 * charge], 0);
    for (let i = 0; i < TN; i++) {
      const fa = (1 - i / TN) * charge;
      trailCol.set([fa, fa * 0.72, fa * 0.18], i * 3);
    }
    tg.attributes.position.needsUpdate = true;
    tg.attributes.color.needsUpdate = true;
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.t += dt;
      const u = Math.min(1, b.t / 0.8);
      b.m.scale.setScalar(b.size * (1 - Math.pow(1 - u, 3)) + 0.01);
      (b.m.material as THREE.MeshBasicMaterial).opacity = 1 - u;
      if (u >= 1) {
        scene.remove(b.m);
        b.m.geometry.dispose();
        (b.m.material as THREE.Material).dispose();
        bursts.splice(i, 1);
      }
    }
    for (const c of cores.values()) {
      if (!c.g.visible) continue;
      c.g.children[0].rotation.y += dt * 1.8;
      c.g.position.copy(c.base).addScaledVector(c.s.dir, Math.sin(time * 2 + c.base.x) * 0.12);
    }
    const gh = radiusAt(heightAt(p));
    shadow.position.copy(p).multiplyScalar(Math.max(R + 0.03, gh + 0.03));
    shadow.quaternion.copy(tq);
    const sh = 1 / (1 + (R + alt - gh) * 0.35);
    shadow.scale.setScalar(0.6 + sh);

    // Nearby site while flying by hand
    let near: string | null = null;
    if (mode === "chase") {
      let best = Infinity;
      for (const s of sites) {
        if (s.id === "void") continue;
        const a = Math.acos(THREE.MathUtils.clamp(p.dot(s.dir), -1, 1));
        const lim = s.mark ? s.flat + 0.12 : 0.08;
        const score = s.mark ? a : a - 1;
        if (a < lim && score < best) {
          best = score;
          near = s.id;
        }
      }
    }
    if (near !== nearby) {
      nearby = near;
      o.onNearby(near);
    }

    // Ambient motion
    for (const s of spinners) s.o.rotation[s.axis] += dt * s.speed;
    for (const b of bobbers) b.o.position.y = b.base + Math.sin(time * b.speed + b.phase) * b.amp;
    beaconOrbs.forEach((orb, i) => orb.scale.setScalar(1 + Math.sin(time * 2.4 + i) * 0.12));
    if (blink) blink.emissiveIntensity = (Math.sin(time * 4) > 0.2 ? 1.5 : 0.1) + night * 1.5;
    smokes.forEach((m) => {
      const u = (time * 0.35 + (m.userData.phase as number)) % 1;
      m.position.set(0.28 + u * 0.2, 1.4 + u * 0.9, -0.12);
      m.scale.setScalar(0.6 + u * 1.4);
      (m.material as THREE.MeshToonMaterial).opacity = 0.8 * (1 - u);
    });
    if (portalMat) portalMat.uniforms.t.value = time;
    for (const pd of pads) pd.m.opacity = pd.id === nearby || pd.id === dockedId ? 0.75 + Math.sin(time * 5) * 0.2 : 0.4;
    clouds.rotation.y += dt * 0.012;
    water.rotation.y += dt * 0.004;

    // Camera
    const cp = v3(), cl = v3(), cu = v3();
    camTarget(dt, cp, cl, cu);
    if (first) {
      if (mode === "docked") camPos.copy(cp);
      camLook.copy(cl);
      camUp.copy(cu);
      first = false;
    }
    const kk = 1 - Math.exp(-dt * (mode === "overview" ? 1.8 : mode === "auto" ? 2.6 : 3.4));
    camPos.lerp(cp, kk);
    camLook.lerp(cl, kk);
    camUp.lerp(cu, kk).normalize();
    // Stay above terrain and outside landmark bounds.
    const cdir = v3().copy(camPos).normalize();
    const minR = Math.max(R + 1.6, radiusAt(heightAt(cdir)) + 1.3);
    if (camPos.length() < minR) camPos.setLength(minR);
    const push = v3();
    for (const gr of groups) {
      push.copy(camPos).sub(gr.center);
      const d = push.length();
      if (d < gr.rad) camPos.copy(gr.center).addScaledVector(push.normalize(), gr.rad);
    }
    // Fade landmarks that sit between the camera and the craft.
    const seg = v3().copy(craft.position).sub(camPos);
    const L = seg.length();
    seg.divideScalar(L);
    const rel = v3();
    for (const gr of groups) {
      if (!gr.mats.length) continue;
      rel.copy(gr.center).sub(camPos);
      const tt = rel.dot(seg);
      let target = 1;
      if (tt > 0 && tt < L - 0.4 && rel.addScaledVector(seg, -tt).length() < gr.rad * 0.85) target = 0.25;
      gr.fade += (target - gr.fade) * (1 - Math.exp(-dt * 8));
      const tr = gr.fade < 0.98;
      for (const m of gr.mats) {
        m.transparent = tr;
        m.opacity = gr.fade;
        m.depthWrite = !tr;
      }
      for (const hh of gr.hulls) hh.visible = !tr;
    }
    camera.position.copy(camPos);
    if (shake > 0.01) {
      camera.position.add(v3().set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(shake * 0.18));
      shake *= Math.exp(-dt * 6);
    }
    camera.fov = 42 + charge * 9;
    rim.visible = mode === "overview";
    camera.up.copy(camUp);
    camera.lookAt(camLook);
    const fog = scene.fog as THREE.Fog;
    const camDist = camPos.length();
    fog.near = mode === "overview" ? camDist : Math.max(4, camDist - 2);
    fog.far = camDist + R * (mode === "overview" ? 5 : 3.2);
    for (const c of cloudParts) {
      const d = c.g.getWorldPosition(tmpP).distanceTo(camPos);
      c.m.opacity = 0.95 * smooth(1.8, 4.2, d);
      c.g.visible = c.m.opacity > 0.02;
    }

    if (panel > 0.5) {
      camera.aspect = (W + panel) / H;
      camera.setViewOffset(W + panel, H, panel, 0, W, H);
    } else {
      camera.aspect = W / H;
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  }

  function loop(now: number) {
    raf = 0;
    if (paused || hidden || offscreen) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    step(dt);
    renderer.render(scene, camera);
    updateLabels();
    if (frame++ % 2 === 0) drawMinimap();
    raf = requestAnimationFrame(loop);
  }
  const wake = () => {
    if (raf || paused || hidden || offscreen) return;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const resize = () => {
    W = Math.max(1, host.clientWidth);
    H = Math.max(1, host.clientHeight);
    renderer.setSize(W, H, false);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
  };
  resize();
  const ro = new ResizeObserver(() => {
    resize();
    if (!raf) {
      step(0);
      renderer.render(scene, camera);
    }
  });
  ro.observe(host);
  const io = new IntersectionObserver(([e]) => {
    offscreen = !e.isIntersecting;
    wake();
  });
  io.observe(host);
  const vis = () => {
    hidden = document.hidden;
    if (hidden) keys.clear();
    wake();
  };
  document.addEventListener("visibilitychange", vis);
  o.onMode(mode);
  wake();
  if (startSite) queueMicrotask(() => o.onArrive(startSite.id));

  return {
    flyTo,
    setNight(on) {
      nightTarget = on ? 1 : 0;
    },
    setPanel(px) {
      panelTarget = px;
    },
    setKey(code, down) {
      if (down) {
        keys.add(code);
        if (auto && /Key[WASD]|Arrow/.test(code)) {
          auto = null;
          setMode("chase");
        }
      } else keys.delete(code);
    },
    overview() {
      auto = null;
      dockedId = null;
      speed = 0;
      ovDir.copy(craft.position).normalize().lerp(new THREE.Vector3(0, 0.35, 0), 0.2).normalize();
      setMode("overview");
    },
    docked: () => dockedId,
    collect(id, b) {
      const c = cores.get(id);
      if (!c || !c.g.visible) return;
      c.g.visible = false;
      if (b) {
        spawnBurst(c.g.position, "#facc15", 3.6);
        spawnBurst(c.g.position, c.s.color, 2.2);
        shake = 0.6;
      }
    },
    setPaused(v) {
      paused = v;
      if (v) keys.clear();
      wake();
    },
    dispose() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", vis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      scene.traverse((ob) => {
        const m = ob as THREE.Mesh;
        m.geometry?.dispose();
        const mm = m.material;
        if (Array.isArray(mm)) mm.forEach((x) => x.dispose());
        else mm?.dispose();
      });
      renderer.dispose();
      canvas.remove();
      delete host.dataset.cursor;
    },
  };
}
