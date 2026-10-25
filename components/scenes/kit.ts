import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export type Ctx = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  mobile: boolean;
  mode: "card" | "scroll";
  pointer: { x: number; y: number };
  track: <T extends { dispose: () => void }>(x: T) => T;
  // 0..1 amount of full-screen colour laid over the frame
  setFade: (amount: number, color?: THREE.ColorRepresentation) => void;
  setBloom: (strength: number) => void;
};

export type Built = {
  dispose?: () => void;
  update: (p: number, t: number, dt: number, aspect: number) => void;
  resize?: (aspect: number) => void;
};

export type MountOpts = {
  host: HTMLElement;
  mode: "card" | "scroll";
  wrap?: HTMLElement;
  loopSeconds?: number;
  fov?: number;
  exposure?: number;
  bloom?: { strength: number; radius: number; threshold: number };
  transparent?: boolean;
  shadows?: boolean;
  environment?: boolean;
  envIntensity?: number;
  build: (ctx: Ctx) => Built;
  onProgress?: (p: number) => void;
};

export type Handle = { dispose: () => void };

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

export function mountScene(o: MountOpts): Handle | null {
  const { host, mode } = o;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !!o.transparent, alpha: !!o.transparent, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const mobile = coarse || host.clientWidth < 700;
  let dprCap = mode === "card" ? (mobile ? 1.5 : 2) : mobile ? 1.5 : 1.75;
  const dpr = () => Math.min(window.devicePixelRatio || 1, dprCap);

  if (o.transparent) renderer.setClearColor(0x000000, 0);
  if (o.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  renderer.toneMapping = o.transparent ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposure ?? 1;
  renderer.setPixelRatio(dpr());
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  renderer.domElement.className = "scene3d-canvas";
  host.appendChild(renderer.domElement);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov ?? 55, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 900);
  camera.add(new THREE.Object3D());
  scene.add(camera);

  if (o.environment) {
    const pm = new THREE.PMREMGenerator(renderer);
    const env = pm.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = o.envIntensity ?? 1;
    disposables.push(env, pm);
  }

  // screen-space fade quad
  const fadeMat = track(new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthTest: false, depthWrite: false, toneMapped: false }));
  const fadeMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(4, 4)), fadeMat);
  fadeMesh.position.z = -0.3;
  fadeMesh.renderOrder = 9999;
  fadeMesh.frustumCulled = false;
  camera.add(fadeMesh);

  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  if (o.bloom && !o.transparent) {
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      bloom = new UnrealBloomPass(new THREE.Vector2(host.clientWidth, host.clientHeight), o.bloom.strength, o.bloom.radius, o.bloom.threshold);
      composer.addPass(bloom);
      composer.addPass(new OutputPass());
    } catch {
      composer = null;
    }
  }

  const pointer = { x: 0, y: 0 };
  let tx = 0;
  let ty = 0;
  const onMove = (e: PointerEvent) => {
    if (coarse) return;
    const r = host.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const ctx: Ctx = {
    scene,
    camera,
    renderer,
    mobile,
    mode,
    pointer,
    track,
    setFade: (a, c) => {
      fadeMat.opacity = a;
      fadeMesh.visible = a > 0.002;
      if (c !== undefined) fadeMat.color.set(c);
    },
    setBloom: (s) => {
      if (bloom && o.bloom) bloom.strength = o.bloom.strength + s;
    },
  };

  const built = o.build(ctx);

  const resize = () => {
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    composer?.setPixelRatio(dpr());
    composer?.setSize(w, h);
    bloom?.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    built.resize?.(camera.aspect);
    if (reduce) draw(0.55, 6, 0);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  });
  io.observe(o.wrap ?? host);

  let progress = 0;
  let eased = 0;
  const measure = () => {
    if (!o.wrap) return;
    const r = o.wrap.getBoundingClientRect();
    progress = clamp01(-r.top / Math.max(r.height - window.innerHeight, 1));
  };
  if (mode === "scroll") {
    measure();
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
  }

  const draw = (p: number, t: number, dt: number) => {
    built.update(p, t, dt, camera.aspect);
    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  let raf = 0;
  let slow = 0;
  let frames = 0;
  let tier = 0;
  let last = performance.now();
  const start = last;
  let lastPct = -1;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = performance.now();
      return;
    }
    const now = performance.now();
    if (mode === "card" && mobile && now - last < 30) return;
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const t = (now - start) / 1000;
    pointer.x += (tx - pointer.x) * 0.06;
    pointer.y += (ty - pointer.y) * 0.06;

    let p: number;
    if (mode === "scroll") {
      eased += (progress - eased) * (1 - Math.pow(0.0015, dt));
      p = eased;
    } else {
      p = (t / (o.loopSeconds ?? 9)) % 1;
    }
    const pct = Math.round(p * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      o.onProgress?.(p);
    }
    draw(p, t, dt);

    frames += 1;
    if (frames > 90 && tier < 1) {
      slow = dt > 0.045 ? slow + 1 : Math.max(0, slow - 1);
      if (slow > 90) {
        slow = 0;
        tier += 1;
        if (tier === 1) {
          // never fall back to a blurry 1x: shed the glow first, then settle on a sharp floor
          composer = null;
          dprCap = Math.max(1.5, dprCap * 0.8);
          resize();
        }
      }
    }
  };

  resize();
  if (reduce) {
    const redraw = () => {
      measure();
      draw(mode === "scroll" ? progress : 0.55, 6, 0);
      o.onProgress?.(mode === "scroll" ? progress : 0.55);
    };
    redraw();
    if (mode === "scroll") window.addEventListener("scroll", redraw, { passive: true });
  } else {
    frame();
  }

  return {
    dispose: () => {
      cancelAnimationFrame(raf);
      built.dispose?.();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      ro.disconnect();
      io.disconnect();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
        else mat?.dispose?.();
      });
      disposables.forEach((d) => d.dispose());
      composer?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

// small shared helpers

export const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true) {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const c = cv.getContext("2d");
  if (c) draw(c, w, h);
  const tx = new THREE.CanvasTexture(cv);
  if (srgb) tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 8;
  return tx;
}

export const skyDome = (top: THREE.ColorRepresentation, mid: THREE.ColorRepresentation, low: THREE.ColorRepresentation, sunDir: THREE.Vector3, sunColor: THREE.ColorRepresentation) => {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color(top) },
      uMid: { value: new THREE.Color(mid) },
      uLow: { value: new THREE.Color(low) },
      uSun: { value: sunDir.clone().normalize() },
      uSunC: { value: new THREE.Color(sunColor) },
    },
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vDir; uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uLow; uniform vec3 uSun; uniform vec3 uSunC;
      void main(){
        float h = vDir.y;
        vec3 c = mix(uLow, uMid, smoothstep(-0.15, 0.18, h));
        c = mix(c, uTop, smoothstep(0.12, 0.85, h));
        float s = max(dot(normalize(vDir), uSun), 0.0);
        c += uSunC * (pow(s, 24.0) * 0.55 + pow(s, 6.0) * 0.22);
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 20), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -10;
  return mesh;
};
