import * as THREE from "three";

export type CosmosItem = {
  id: string;
  kind: "tile" | "metric";
  href: string;
  title: string;
  sub: string;
  poster?: string;
  value?: string;
  label?: string;
};

export type HoverInfo = { id: string; title: string; sub: string; kind: CosmosItem["kind"]; x: number; y: number } | null;

type Cb = { onHover: (h: HoverInfo) => void; onSelect: (item: CosmosItem) => void; onTravel?: (t: number) => void };

type Node = { item: CosmosItem; obj: THREE.Object3D; glow?: THREE.Mesh; d: number; x: number; y: number; hover: number; base: number };

const SPACING = 5.2;
const NEAR = 3;
const mod = (a: number, n: number) => ((a % n) + n) % n;

function glowTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  stops.forEach(([o, col]) => r.addColorStop(o, col));
  g.fillStyle = r;
  g.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function roundedAlpha(w: number, h: number, rad: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d")!;
  g.fillStyle = "#000";
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#fff";
  g.beginPath();
  g.roundRect(0, 0, w, h, rad);
  g.fill();
  return new THREE.CanvasTexture(c);
}

function frameTexture(a: string, b: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  const lg = g.createLinearGradient(0, 0, 512, 512);
  lg.addColorStop(0, a);
  lg.addColorStop(1, b);
  g.filter = "blur(18px)";
  g.fillStyle = lg;
  g.beginPath();
  g.roundRect(40, 40, 432, 432, 48);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function metricTexture(item: CosmosItem, fonts: { display: string; sans: string }) {
  const W = 1400;
  const H = 760;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const cx = W / 2;
  const glow = g.createRadialGradient(cx, 300, 0, cx, 300, 330);
  glow.addColorStop(0, "rgba(244,114,182,0.55)");
  glow.addColorStop(0.35, "rgba(139,92,246,0.32)");
  glow.addColorStop(1, "rgba(139,92,246,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = "rgba(255,240,255,0.55)";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(cx - 520, 300);
  g.lineTo(cx + 520, 300);
  g.moveTo(cx, 40);
  g.lineTo(cx, 560);
  g.stroke();
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.shadowColor = "rgba(244,114,182,0.9)";
  g.shadowBlur = 40;
  g.fillStyle = "#fff6ff";
  const value = item.value ?? "";
  let size = 210;
  g.font = `600 ${size}px ${fonts.display}`;
  while (g.measureText(value).width > W - 160 && size > 80) {
    size -= 10;
    g.font = `600 ${size}px ${fonts.display}`;
  }
  g.fillText(value, cx, 300);
  g.shadowBlur = 0;
  g.font = `500 52px ${fonts.sans}`;
  g.fillStyle = "#e9dcff";
  g.fillText(item.label ?? "", cx, 500);
  g.font = `600 38px ${fonts.sans}`;
  g.fillStyle = "#f9a8d4";
  g.fillText(item.title.toUpperCase(), cx, 590);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export class Cosmos {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private field = new THREE.Group();
  private nodes: Node[] = [];
  private L: number;
  private travel = 0;
  private target = 0;
  private camX = 0;
  private camXTarget = 0;
  private ptr = new THREE.Vector2(9, 9);
  private ptrMoved = false;
  private ray = new THREE.Raycaster();
  private hovered: Node | null = null;
  private raf = 0;
  private last = 0;
  private running = false;
  private dim = false;
  private disposers: (() => void)[] = [];
  private drag: { y: number; t: number; moved: number } | null = null;

  constructor(private canvas: HTMLCanvasElement, items: CosmosItem[], private cb: Cb) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(Math.max(window.devicePixelRatio, 1.5), 2));
    this.renderer.setClearColor(0x0b0618, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene.fog = new THREE.FogExp2(0x0b0618, 0.032);
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 140);
    this.L = Math.max(items.length * SPACING, 80);
    this.scene.add(this.field);
    this.buildField();
    this.buildNodes(items);
    this.resize();
    this.setDim(false);
    this.bind();
    this.start();
  }

  private buildField() {
    const L = this.L;
    const dot = glowTexture([[0, "rgba(255,255,255,1)"], [0.25, "rgba(255,255,255,0.8)"], [1, "rgba(255,255,255,0)"]]);
    const palette = [new THREE.Color("#ffffff"), new THREE.Color("#ddd0ff"), new THREE.Color("#f9a8d4"), new THREE.Color("#a78bfa")];
    const cloudTex = [
      glowTexture([[0, "rgba(139,92,246,0.55)"], [0.5, "rgba(109,40,217,0.18)"], [1, "rgba(76,29,149,0)"]]),
      glowTexture([[0, "rgba(244,114,182,0.5)"], [0.5, "rgba(219,39,119,0.16)"], [1, "rgba(157,23,77,0)"]]),
      glowTexture([[0, "rgba(192,132,252,0.45)"], [0.6, "rgba(126,34,206,0.12)"], [1, "rgba(88,28,135,0)"]]),
    ];
    const rand = mulberry(7);
    for (let copy = 0; copy < 2; copy++) {
      const chunk = new THREE.Group();
      chunk.position.z = -copy * L;
      const n = 2600;
      const pos = new Float32Array(n * 3);
      const col = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        const a = rand() * Math.PI * 2;
        const r = 1.5 + Math.pow(rand(), 0.6) * 26;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r * 0.75;
        pos[i * 3 + 2] = NEAR - rand() * L;
        const c = palette[Math.floor(rand() * palette.length)];
        const b = 0.5 + rand() * 0.5;
        col[i * 3] = c.r * b;
        col[i * 3 + 1] = c.g * b;
        col[i * 3 + 2] = c.b * b;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(
        geo,
        new THREE.PointsMaterial({ size: 0.16, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      chunk.add(pts);
      for (let i = 0; i < 16; i++) {
        const s = new THREE.Sprite(
          new THREE.SpriteMaterial({ map: cloudTex[i % 3], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 + rand() * 0.35 }),
        );
        const a = rand() * Math.PI * 2;
        const r = 5 + rand() * 9;
        s.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.6, NEAR - 6 - (i / 16) * L);
        const k = 12 + rand() * 14;
        s.scale.set(k * 1.6, k, 1);
        s.material.rotation = rand() * Math.PI;
        chunk.add(s);
      }
      this.field.add(chunk);
    }
  }

  private buildNodes(items: CosmosItem[]) {
    const fonts = readFonts();
    const loader = new THREE.TextureLoader();
    const glows = [frameTexture("#8b5cf6", "#f472b6"), frameTexture("#f472b6", "#a78bfa")];
    items.forEach((item, i) => {
      const ang = i * 2.39996 + 0.6;
      const r = 2.6 + (i % 3) * 0.35;
      const x = Math.cos(ang) * r * 1.35;
      const y = Math.sin(ang) * r * 0.62;
      const d = 9 + i * SPACING;
      let obj: THREE.Object3D;
      let glow: THREE.Mesh | undefined;
      if (item.kind === "tile") {
        const g = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({ color: 0xe6dcff, transparent: true, opacity: 0 });
        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
        mesh.userData.node = i;
        glow = new THREE.Mesh(
          new THREE.PlaneGeometry(1, 1),
          new THREE.MeshBasicMaterial({ map: glows[i % 2], transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 }),
        );
        glow.position.z = -0.02;
        g.add(glow, mesh);
        const w = 2.5;
        mesh.scale.set(w, w * 0.62, 1);
        glow.scale.set(w * 1.32, w * 0.62 * 1.5, 1);
        loader.load(item.poster!, (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
          const img = tex.image as HTMLImageElement;
          const asp = img.height / img.width;
          const h = Math.min(w * asp, 3.2);
          const ww = h / asp;
          mesh.scale.set(ww, h, 1);
          glow!.scale.set(ww * 1.32, h * 1.3, 1);
          mat.map = tex;
          mat.alphaMap = roundedAlpha(256, Math.round(256 * asp), 14);
          mat.needsUpdate = true;
          mat.opacity = 1;
        });
        obj = g;
      } else {
        const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: metricTexture(item, fonts), transparent: true, depthWrite: false }));
        s.scale.set(3.6, 3.6 * (760 / 1400), 1);
        s.userData.node = i;
        obj = s;
      }
      obj.position.set(x, y, -d);
      this.scene.add(obj);
      this.nodes.push({ item, obj, glow, d, x, y, hover: 0, base: 1 });
    });
  }

  private bind() {
    const c = this.canvas;
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(c);
    const wheel = (e: WheelEvent) => {
      e.preventDefault();
      this.nudge((e.deltaY + e.deltaX) * 0.012);
    };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      this.ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      this.ptrMoved = true;
      if (this.drag) {
        const dy = this.drag.y - e.clientY;
        this.drag.moved += Math.abs(dy);
        this.drag.y = e.clientY;
        this.nudge(dy * 0.03);
      }
    };
    const down = (e: PointerEvent) => {
      this.drag = { y: e.clientY, t: performance.now(), moved: 0 };
      if (e.pointerType !== "mouse") move(e);
    };
    const up = (e: PointerEvent) => {
      const d = this.drag;
      this.drag = null;
      if (!d || d.moved > 8) return;
      move(e);
      const hit = this.pick();
      if (hit) this.cb.onSelect(hit.item);
    };
    const leave = () => {
      this.ptr.set(9, 9);
      this.ptrMoved = true;
      this.drag = null;
    };
    const vis = () => (document.hidden ? this.stop() : this.start());
    c.addEventListener("wheel", wheel, { passive: false });
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointerleave", leave);
    document.addEventListener("visibilitychange", vis);
    this.disposers.push(() => {
      ro.disconnect();
      c.removeEventListener("wheel", wheel);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerdown", down);
      c.removeEventListener("pointerup", up);
      c.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", vis);
    });
  }

  nudge(v: number) {
    this.target += v;
  }

  focus(id: string) {
    const n = this.nodes.find((x) => x.item.id === id);
    if (!n) return;
    const want = n.d - (NEAR + 4.2);
    const k = Math.round((this.target - want) / this.L);
    this.target = want + k * this.L;
    this.camXTarget = n.x * 0.55;
  }

  setDim(v: boolean) {
    this.dim = v;
    if (!v) this.camXTarget = this.camera.aspect > 1.2 ? -1.6 : 0;
  }

  private resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.fov = w / h < 0.8 ? 78 : 60;
    this.camera.updateProjectionMatrix();
  }

  private pick(): Node | null {
    if (Math.abs(this.ptr.x) > 1) return null;
    this.ray.setFromCamera(this.ptr, this.camera);
    const targets: THREE.Object3D[] = [];
    this.nodes.forEach((n) => targets.push(n.obj instanceof THREE.Sprite ? n.obj : n.obj.children[1]));
    const hit = this.ray.intersectObjects(targets, false)[0];
    if (!hit) return null;
    const n = this.nodes[hit.object.userData.node as number];
    return n.obj.position.z < -60 ? null : n;
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  private tick = (now: number) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.tick);
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;
    this.target += dt * (this.dim ? 0.12 : 0.45);
    this.travel += (this.target - this.travel) * Math.min(1, dt * 3.2);
    this.camX += (this.camXTarget - this.camX) * Math.min(1, dt * 2);
    this.field.position.z = mod(this.travel, this.L);
    const t = now / 1000;
    const px = Math.abs(this.ptr.x) <= 1 ? this.ptr.x : 0;
    const py = Math.abs(this.ptr.y) <= 1 ? this.ptr.y : 0;
    this.camera.position.x = this.camX + px * 0.35;
    this.camera.position.y = py * 0.22;
    this.camera.rotation.y += (-px * 0.05 - this.camera.rotation.y) * 0.05;
    this.camera.rotation.x += (py * 0.03 - this.camera.rotation.x) * 0.05;
    const narrow = this.camera.aspect < 0.8;
    for (const n of this.nodes) {
      const z = NEAR - mod(n.d - this.travel, this.L);
      n.obj.position.set(n.x * (narrow ? 0.55 : 1), n.y * (narrow ? 1.5 : 1) + Math.sin(t * 0.6 + n.d) * 0.08, z);
      n.obj.rotation.z = n.obj instanceof THREE.Sprite ? 0 : Math.sin(t * 0.4 + n.d) * 0.02;
      if (!(n.obj instanceof THREE.Sprite)) n.obj.rotation.y = -n.x * 0.07;
      const goal = this.hovered === n ? 1 : 0;
      n.hover += (goal - n.hover) * Math.min(1, dt * 8);
      const s = 1 + n.hover * 0.08;
      if (n.obj instanceof THREE.Sprite) {
        n.obj.scale.set(3.6 * s, 3.6 * (760 / 1400) * s, 1);
      } else {
        n.obj.scale.setScalar(s);
        (n.glow!.material as THREE.MeshBasicMaterial).opacity = 0.45 + n.hover * 0.5;
      }
    }
    if (this.ptrMoved || this.hovered) {
      this.ptrMoved = false;
      const hit = this.drag && this.drag.moved > 8 ? null : this.pick();
      if (hit !== this.hovered) {
        this.hovered = hit;
        this.canvas.style.cursor = hit ? "pointer" : "";
      }
      if (hit) {
        const p = hit.obj.position.clone().project(this.camera);
        const r = this.canvas.getBoundingClientRect();
        this.cb.onHover({
          id: hit.item.id,
          title: hit.item.title,
          sub: hit.item.sub,
          kind: hit.item.kind,
          x: r.left + ((p.x + 1) / 2) * r.width,
          y: r.top + ((1 - p.y) / 2) * r.height,
        });
      } else this.cb.onHover(null);
    }
    this.cb.onTravel?.(this.travel / SPACING);
    this.renderer.render(this.scene, this.camera);
  };

  dispose() {
    this.stop();
    this.disposers.forEach((d) => d());
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material & { map?: THREE.Texture | null; alphaMap?: THREE.Texture | null };
      if (mat) {
        mat.map?.dispose();
        mat.alphaMap?.dispose();
        mat.dispose();
      }
    });
    this.renderer.dispose();
  }
}

function readFonts() {
  const cs = getComputedStyle(document.documentElement);
  return {
    display: cs.getPropertyValue("--f-sora").trim() || "sans-serif",
    sans: cs.getPropertyValue("--f-outfit").trim() || "sans-serif",
  };
}

function mulberry(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}
