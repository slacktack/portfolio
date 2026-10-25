import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export type JourneyHandle = { dispose: () => void };

type Opts = {
  host: HTMLElement;
  wrap: HTMLElement;
  chapters: number;
  onChapter: (i: number) => void;
  onProgress: (pct: number) => void;
};

const TINTS = ["#ff5a2b", "#3b6bff", "#a66bff", "#1fd1a5", "#ffc24b"].map((c) => new THREE.Color(c));
const LOGOS = [
  "makemytrip", "booking", "agoda", "goibibo", "cleartrip", "expedia", "kayak", "skyscanner", "ixigo",
  "easemytrip", "tripcom", "klook", "swiggy", "zomato", "uber", "ola", "rapido",
];

const rand = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }`;
const BG_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime; uniform float uAspect; uniform vec2 uCenter;
uniform vec3 uA; uniform vec3 uB; uniform float uProg;
float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y); }
void main(){
  vec2 p = (vUv - uCenter) * vec2(uAspect, 1.0);
  float n = noise(p * 2.2 + vec2(uTime * 0.05, uProg * 3.0));
  float a = exp(-dot(p - vec2(0.06, 0.04), p - vec2(0.06, 0.04)) * 2.6);
  float b = exp(-dot(p + vec2(0.36, 0.3), p + vec2(0.36, 0.3)) * 4.2);
  vec3 col = vec3(0.027, 0.031, 0.063);
  col += uA * a * (0.42 + n * 0.26);
  col += uB * b * (0.26 + n * 0.2);
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}`;

const FX_SHADER = {
  uniforms: { tDiffuse: { value: null as THREE.Texture | null }, uAmt: { value: 0 }, uTime: { value: 0 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uAmt; uniform float uTime; varying vec2 vUv;
    void main(){
      vec2 c = vUv - 0.5; float d = dot(c, c);
      vec2 o = c * (0.0015 + d * uAmt * 0.018);
      float r = texture2D(tDiffuse, vUv + o).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - o).b;
      vec3 col = vec3(r, g, b) * (1.0 - d * 0.75);
      gl_FragColor = vec4(col, 1.0);
    }`,
};

const STREAK_VERT = `
  attribute float aSide; uniform float uStretch; varying float vSide;
  void main(){ vSide = aSide; vec3 p = position; p.z -= aSide * uStretch;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`;
const STREAK_FRAG = `uniform vec3 uColor; uniform float uAlpha; varying float vSide;
  void main(){ gl_FragColor = vec4(uColor, (1.0 - vSide * 0.85) * uAlpha); }`;

const TRAIL_VERT = `attribute float aT; varying float vT; void main(){ vT = aT; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const TRAIL_FRAG = `uniform float uHead; uniform vec3 uColor; uniform float uAlpha; varying float vT;
  void main(){ float tail = smoothstep(uHead - 0.55, uHead, vT) * step(vT, uHead); float base = 0.07 * smoothstep(0.0, 0.2, vT);
    vec3 c = mix(uColor, vec3(1.0), smoothstep(uHead - 0.08, uHead, vT)); gl_FragColor = vec4(c, (tail * 0.95 + base) * uAlpha); }`;

export function createJourneyScene({ host, wrap, chapters, onChapter, onProgress }: Opts): JourneyHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  let dprCap = coarse ? 1.5 : 1.75;
  const dpr = () => Math.min(window.devicePixelRatio || 1, dprCap);

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setPixelRatio(dpr());
  renderer.setSize(host.clientWidth, host.clientHeight, false);
  renderer.domElement.className = "journey-canvas";
  host.appendChild(renderer.domElement);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, host.clientWidth / Math.max(host.clientHeight, 1), 0.1, 220);

  // chapter anchors along -z
  const A = [-4, -28, -54, -80, -106];
  const C = A.map((z) => z + 13);
  const fades: { m: THREE.Material & { opacity: number }; base: number; ch: number }[] = [];
  const fade = <M extends THREE.Material & { opacity: number }>(m: M, ch: number, base = m.opacity) => {
    m.transparent = true;
    fades.push({ m, base, ch });
    return m;
  };

  // textures
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = glowCanvas.height = 128;
  const gctx = glowCanvas.getContext("2d");
  if (gctx) {
    const g = gctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    gctx.fillStyle = g;
    gctx.fillRect(0, 0, 128, 128);
  }
  const glow = track(new THREE.CanvasTexture(glowCanvas));

  // living background (replaces the CSS aurora when WebGL is on)
  const bgMat = track(
    new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uAspect: { value: 1 },
        uCenter: { value: new THREE.Vector2(0.5, 0.5) },
        uA: { value: TINTS[0].clone() },
        uB: { value: TINTS[1].clone() },
        uProg: { value: 0 },
      },
    })
  );
  const bg = new THREE.Mesh(track(new THREE.PlaneGeometry(2, 2)), bgMat);
  bg.frustumCulled = false;
  bg.renderOrder = -100;
  scene.add(bg);

  const tint = TINTS[0].clone();
  const tintB = TINTS[1].clone();

  // tunnel of thin rings that the camera flies through
  const ringGeo = track(new THREE.TorusGeometry(5.6, 0.014, 6, 120));
  const tunnel = Array.from({ length: 44 }, (_, i) => {
    const m = track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    const r = new THREE.Mesh(ringGeo, m);
    r.position.z = 12 - i * 2.8;
    r.rotation.z = rand(i) * 6.28;
    r.scale.set(1 + (i % 3) * 0.06, 0.64 + (i % 3) * 0.04, 1);
    scene.add(r);
    return r;
  });

  // dust
  const dustN = coarse ? 900 : 1500;
  const dp = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i += 1) {
    dp[i * 3] = (rand(i) - 0.5) * 46;
    dp[i * 3 + 1] = (rand(i + 50) - 0.5) * 30;
    dp[i * 3 + 2] = 14 - rand(i + 9) * 140;
  }
  const dg = track(new THREE.BufferGeometry());
  dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
  const dustMat = track(new THREE.PointsMaterial({ size: 0.05, map: glow, color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(new THREE.Points(dg, dustMat));

  // speed streaks: stretch with scroll velocity
  const stN = coarse ? 120 : 220;
  const sp = new Float32Array(stN * 6);
  const side = new Float32Array(stN * 2);
  for (let i = 0; i < stN; i += 1) {
    const a = rand(i * 3) * Math.PI * 2;
    const r = 2.6 + rand(i * 3 + 1) * 11;
    const x = Math.cos(a) * r * 1.2;
    const y = Math.sin(a) * r * 0.7;
    const z = 12 - rand(i * 3 + 2) * 130;
    sp.set([x, y, z, x, y, z], i * 6);
    side[i * 2] = 0;
    side[i * 2 + 1] = 1;
  }
  const sg = track(new THREE.BufferGeometry());
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  sg.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  const streakMat = track(
    new THREE.ShaderMaterial({
      vertexShader: STREAK_VERT,
      fragmentShader: STREAK_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uStretch: { value: 0 }, uColor: { value: new THREE.Color("#ffd9bd") }, uAlpha: { value: 0.5 } },
    })
  );
  const streaks = new THREE.LineSegments(sg, streakMat);
  streaks.frustumCulled = false;
  scene.add(streaks);

  // 01 request: core, shock rings, label
  const core = new THREE.Mesh(track(new THREE.SphereGeometry(0.2, 32, 32)), fade(track(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.4, 1.2) })), 0, 1));
  core.position.set(0, 0, A[0]);
  scene.add(core);
  const coreHalo = new THREE.Sprite(fade(track(new THREE.SpriteMaterial({ map: glow, color: 0xff7a45, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.4 })), 0, 0.4));
  coreHalo.scale.setScalar(3.6);
  coreHalo.position.copy(core.position);
  scene.add(coreHalo);
  const shockGeo = track(new THREE.RingGeometry(0.97, 1, 160));
  const shocks = Array.from({ length: 4 }, () => {
    const m = new THREE.Mesh(shockGeo, track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })));
    m.position.copy(core.position);
    scene.add(m);
    return m;
  });
  const startLabel = (() => {
    const cv = document.createElement("canvas");
    cv.width = 640;
    cv.height = 96;
    const c2 = cv.getContext("2d");
    if (c2) {
      c2.font = "600 46px system-ui, -apple-system, Helvetica, Arial, sans-serif";
      c2.fillStyle = "rgba(255,247,238,0.95)";
      c2.textAlign = "center";
      c2.textBaseline = "middle";
      c2.fillText("BLR → GOI · search", 320, 48);
    }
    const s = new THREE.Sprite(fade(track(new THREE.SpriteMaterial({ map: track(new THREE.CanvasTexture(cv)), transparent: true, depthWrite: false, opacity: 1 })), 0, 1));
    s.scale.set(6, 0.9, 1);
    s.position.set(0, -1.7, A[0]);
    scene.add(s);
    return s;
  })();

  // 02 fan-out: logo chips streaming into one hub
  const hubPos = new THREE.Vector3(0, 0, A[2]);
  const fan = new THREE.Group();
  scene.add(fan);
  type Fan = { mat: THREE.ShaderMaterial; chip: THREE.Sprite; pts: THREE.Vector3[]; phase: number };
  let fanItems: Fan[] = [];
  let fanNarrow: boolean | null = null;
  const chipTextures = LOGOS.map((name) => {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 256;
    const c2 = cv.getContext("2d");
    const draw = (img?: HTMLImageElement) => {
      if (!c2) return;
      c2.clearRect(0, 0, 256, 256);
      c2.shadowColor = "rgba(0,0,0,0.45)";
      c2.shadowBlur = 24;
      c2.shadowOffsetY = 8;
      c2.fillStyle = "#fffdf6";
      c2.beginPath();
      c2.roundRect(24, 20, 208, 208, 52);
      c2.fill();
      c2.shadowColor = "transparent";
      if (img && img.naturalWidth) {
        const s = Math.min(150 / img.naturalWidth, 150 / img.naturalHeight);
        const w = img.naturalWidth * s;
        const h = img.naturalHeight * s;
        c2.drawImage(img, 128 - w / 2, 124 - h / 2, w, h);
      }
    };
    draw();
    const tx = track(new THREE.CanvasTexture(cv));
    tx.colorSpace = THREE.SRGBColorSpace;
    const img = new Image();
    img.onload = () => {
      draw(img);
      tx.needsUpdate = true;
    };
    img.src = `/assets/logos/${name}.png`;
    return tx;
  });

  const buildFan = (narrow: boolean) => {
    fan.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      (m.material as THREE.Material | undefined)?.dispose?.();
    });
    fan.clear();
    fanItems = [];
    const rx = narrow ? 4.4 : 8.4;
    const ry = narrow ? 5 : 4.6;
    LOGOS.forEach((_, i) => {
      const a = (i / LOGOS.length) * Math.PI * 2 + 0.35;
      const ring = i % 2 === 0 ? 1 : 0.7;
      const start = new THREE.Vector3(Math.cos(a) * rx * ring, Math.sin(a) * ry * ring, A[1] - 4 - rand(i + 4) * 9);
      const mid = new THREE.Vector3(Math.cos(a + 0.9) * rx * 0.45, Math.sin(a + 0.9) * ry * 0.4, (start.z + hubPos.z) / 2);
      const curve = new THREE.CatmullRomCurve3([start, mid, hubPos.clone()]);
      const pts = curve.getPoints(80);
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      g.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(pts.map((_, k) => k / (pts.length - 1))), 1));
      const mat = new THREE.ShaderMaterial({
        vertexShader: TRAIL_VERT,
        fragmentShader: TRAIL_FRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uHead: { value: 0 }, uColor: { value: (i % 4 === 0 ? TINTS[0] : TINTS[1]).clone().lerp(new THREE.Color("#ffffff"), 0.35) }, uAlpha: { value: 0 } },
      });
      const line = new THREE.Line(g, mat);
      line.frustumCulled = false;
      fan.add(line);
      const chip = new THREE.Sprite(new THREE.SpriteMaterial({ map: chipTextures[i], color: new THREE.Color(0.6, 0.6, 0.6), transparent: true, depthWrite: false, opacity: 0 }));
      const s = narrow ? 1.7 : 1.9;
      chip.scale.set(s, s, 1);
      chip.position.copy(start);
      fan.add(chip);
      fanItems.push({ mat, chip, pts, phase: rand(i * 5) });
    });
  };

  // packets travelling along the fan-out curves
  const pkPer = 3;
  const pkN = LOGOS.length * pkPer;
  const pkPos = new Float32Array(pkN * 3);
  const pkGeo = track(new THREE.BufferGeometry());
  pkGeo.setAttribute("position", new THREE.BufferAttribute(pkPos, 3));
  const pkMat = track(new THREE.PointsMaterial({ size: 0.26, map: glow, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const packets = new THREE.Points(pkGeo, pkMat);
  packets.frustumCulled = false;
  scene.add(packets);

  // 03 resolve: one identity
  const hub = new THREE.Group();
  hub.position.copy(hubPos);
  scene.add(hub);
  const hubWire = new THREE.Mesh(track(new THREE.IcosahedronGeometry(1.15, 1)), fade(track(new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.9 })), 2, 0.9));
  const hubCore = new THREE.Mesh(track(new THREE.IcosahedronGeometry(0.62, 2)), fade(track(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 1.0, 1.7) })), 2, 1));
  const hubHalo = new THREE.Sprite(fade(track(new THREE.SpriteMaterial({ map: glow, color: 0x9a7bff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.35 })), 2, 0.35));
  hubHalo.scale.setScalar(5);
  const orbitGeo = track(new THREE.TorusGeometry(1.9, 0.012, 6, 120));
  const orbits = [0, 1, 2].map((i) => {
    const m = new THREE.Mesh(orbitGeo, fade(track(new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })), 2, 0.55));
    m.rotation.set(i * 1.05, i * 0.7, 0);
    hub.add(m);
    return m;
  });
  hub.add(hubWire, hubCore, hubHalo);

  // 04 cache: a lattice that lights up as hits sweep through it
  const cacheGroup = new THREE.Group();
  cacheGroup.position.set(0, 0, A[3] - 2);
  scene.add(cacheGroup);
  const cx = 9;
  const cy = 3;
  const cz = 4;
  const cubeN = cx * cy * cz;
  const boxGeo = track(new THREE.BoxGeometry(0.74, 0.74, 0.74));
  const solid = new THREE.InstancedMesh(boxGeo, fade(track(new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5 })), 3, 0.5), cubeN);
  const wire = new THREE.InstancedMesh(boxGeo, fade(track(new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false })), 3, 0.32), cubeN);
  const tmpM = new THREE.Matrix4();
  const cubePos: THREE.Vector3[] = [];
  for (let i = 0; i < cubeN; i += 1) {
    const ix = i % cx;
    const iy = Math.floor(i / cx) % cy;
    const iz = Math.floor(i / (cx * cy));
    const p = new THREE.Vector3((ix - (cx - 1) / 2) * 1.35, (iy - (cy - 1) / 2) * 1.35, -iz * 2.1);
    cubePos.push(p);
    tmpM.setPosition(p);
    solid.setMatrixAt(i, tmpM);
    wire.setMatrixAt(i, tmpM);
  }
  solid.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(cubeN * 3), 3);
  cacheGroup.add(solid, wire);
  const baseCube = new THREE.Color("#173a46");
  const hitCube = new THREE.Color(0.2, 1.5, 1.1);
  const tmpC = new THREE.Color();

  // 05 answer: the price card
  const card = document.createElement("canvas");
  card.width = 1024;
  card.height = 512;
  const cctx = card.getContext("2d");
  if (cctx) {
    cctx.fillStyle = "rgba(12,13,22,0.9)";
    cctx.strokeStyle = "rgba(255,247,238,0.3)";
    cctx.lineWidth = 2;
    cctx.beginPath();
    cctx.roundRect(4, 4, 1016, 504, 30);
    cctx.fill();
    cctx.stroke();
    cctx.fillStyle = "rgba(255,247,238,0.62)";
    cctx.font = "500 30px system-ui, -apple-system, Helvetica, Arial, sans-serif";
    cctx.fillText("BEST FARE · BLR → GOI · 1 ADULT", 56, 92);
    cctx.fillStyle = "#fff7ee";
    cctx.font = "800 200px 'Helvetica Neue', Arial, sans-serif";
    cctx.fillText("₹4,740", 50, 300);
    cctx.fillStyle = "#ffc24b";
    cctx.fillRect(56, 358, 140, 5);
    cctx.fillStyle = "rgba(255,247,238,0.55)";
    cctx.font = "500 28px system-ui, -apple-system, Helvetica, Arial, sans-serif";
    cctx.fillText("simulated example", 56, 430);
  }
  const cardTex = track(new THREE.CanvasTexture(card));
  cardTex.colorSpace = THREE.SRGBColorSpace;
  const cardGroup = new THREE.Group();
  cardGroup.position.set(0, 0, A[4]);
  scene.add(cardGroup);
  const cardMesh = new THREE.Mesh(track(new THREE.PlaneGeometry(7, 3.5)), fade(track(new THREE.MeshBasicMaterial({ map: cardTex, color: new THREE.Color(0.8, 0.8, 0.8), transparent: true })), 4, 1));
  const cardGlow = new THREE.Sprite(fade(track(new THREE.SpriteMaterial({ map: glow, color: 0xffb04a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.28 })), 4, 0.28));
  cardGlow.scale.set(15, 9, 1);
  cardGlow.position.z = -0.4;
  cardGroup.add(cardGlow, cardMesh);
  const sparkN = 90;
  const sparkPos = new Float32Array(sparkN * 3);
  const sparkData = Array.from({ length: sparkN }, (_, i) => ({ a: rand(i) * Math.PI * 2, r: 2 + rand(i + 1) * 5, s: 0.2 + rand(i + 2) * 0.6, z: rand(i + 3) * 6 }));
  const sparkGeo = track(new THREE.BufferGeometry());
  sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = track(new THREE.PointsMaterial({ size: 0.16, map: glow, color: 0xffd48a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  const sparks = new THREE.Points(sparkGeo, sparkMat);
  sparks.frustumCulled = false;
  sparks.position.set(0, 0, A[4]);
  scene.add(sparks);

  // post: bloom + chromatic edge
  let composer: EffectComposer | null = null;
  let bloom: UnrealBloomPass | null = null;
  let fxPass: ShaderPass | null = null;
  try {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(host.clientWidth, host.clientHeight), 0.4, 0.55, 0.62);
    composer.addPass(bloom);
    fxPass = new ShaderPass(FX_SHADER);
    composer.addPass(fxPass);
    composer.addPass(new OutputPass());
  } catch {
    composer = null;
  }

  // layout
  let wide = true;
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
    wide = camera.aspect > 1.1;
    camera.fov = wide ? 56 : 72;
    if (wide) camera.setViewOffset(w, h, -w * 0.16, 0, w, h);
    else camera.setViewOffset(w, h, 0, h * 0.2, w, h);
    camera.updateProjectionMatrix();
    bgMat.uniforms.uAspect.value = camera.aspect;
    bgMat.uniforms.uCenter.value.set(wide ? 0.66 : 0.5, wide ? 0.5 : 0.7);
    const narrow = !wide;
    if (fanNarrow !== narrow) {
      fanNarrow = narrow;
      buildFan(narrow);
    }
    cardGroup.scale.setScalar(wide ? 1 : 0.9);
    cacheGroup.scale.setScalar(wide ? 1 : 0.62);
    coreHalo.scale.setScalar(wide ? 3.6 : 3);
    startLabel.scale.set(wide ? 6 : 5.2, wide ? 0.9 : 0.78, 1);
    startLabel.position.y = wide ? -1.7 : -1.5;
    if (reduce) renderFrame(0);
  };

  // scroll + pointer
  let progress = 0;
  let eased = 0;
  const measure = () => {
    const r = wrap.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    progress = clamp01(-r.top / Math.max(total, 1));
  };
  measure();
  window.addEventListener("scroll", measure, { passive: true });
  window.addEventListener("resize", measure);

  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;
  const onMove = (e: PointerEvent) => {
    if (coarse) return;
    tx = (e.clientX / window.innerWidth - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  });
  io.observe(wrap);

  // runtime
  const camLook = new THREE.Vector3();
  let lastChapter = -1;
  let lastPct = -1;
  let burst = 0;
  let prevEased = 0;
  let vel = 0;
  let fovKick = 0;
  let slowFrames = 0;
  let tier = 0;
  let frames = 0;
  const start = performance.now();
  let last = start;

  const renderFrame = (t: number) => {
    const u = clamp01(eased);
    const span = u * (chapters - 1);
    const seg = Math.min(Math.floor(span), chapters - 2);
    const f = span - seg;
    const k = ease(clamp01((f - 0.16) / 0.68));
    const z = C[seg] + (C[seg + 1] - C[seg]) * k;

    const sway = reduce ? 0 : 1;
    camera.position.set(
      px * 0.9 * (coarse ? 0 : 1) + Math.sin(u * 11 + t * 0.3) * 0.45 * sway,
      -py * 0.55 + Math.cos(u * 8 + t * 0.25) * 0.26 * sway,
      z
    );
    camLook.set(px * 0.6 + Math.sin(u * 5) * 0.4, -py * 0.35, z - 12);
    camera.lookAt(camLook);
    camera.rotateZ(Math.sin(u * 14) * 0.035 * sway - px * 0.02);
    const baseFov = wide ? 56 : 72;
    camera.fov = baseFov + fovKick;
    camera.updateProjectionMatrix();

    // chapter weights
    const near = (i: number) => smooth(0, 1, 1 - clamp01(Math.abs(span - i) / 0.78));
    const ch = Math.min(chapters - 1, Math.round(span));

    // tint toward the live chapter
    const cA = TINTS[Math.min(ch, TINTS.length - 1)];
    const cB = TINTS[Math.min(ch + 1, TINTS.length - 1)];
    tint.lerp(cA, 0.06);
    tintB.lerp(cB, 0.06);
    bgMat.uniforms.uA.value.copy(tint);
    bgMat.uniforms.uB.value.copy(tintB);
    bgMat.uniforms.uTime.value = t;
    bgMat.uniforms.uProg.value = u;

    fades.forEach((f2) => {
      f2.m.opacity = f2.base * near(f2.ch);
    });
    core.visible = coreHalo.visible = startLabel.visible = near(0) > 0.01;
    hub.visible = near(2) > 0.01;
    cacheGroup.visible = near(3) > 0.01;
    cardGroup.visible = near(4) > 0.01;
    fan.visible = near(1) > 0.01 || near(2) > 0.01;

    // tunnel
    const camZ = camera.position.z;
    tunnel.forEach((r, i) => {
      const d = r.position.z - camZ;
      const m = r.material as THREE.MeshBasicMaterial;
      m.color.copy(tint);
      m.opacity = (d < -2 && d > -62 ? smooth(-2, -10, d) * smooth(-62, -30, d) : 0) * 0.26;
      r.rotation.z += 0.0006 * (i % 2 ? 1 : -1);
    });
    dustMat.color.copy(tint).lerp(new THREE.Color("#ffffff"), 0.6);
    streakMat.uniforms.uColor.value.copy(tint).lerp(new THREE.Color("#ffffff"), 0.5);
    streakMat.uniforms.uStretch.value = Math.min(vel * 8, 7);

    // 01
    const c0 = near(0);
    shocks.forEach((s, i) => {
      const p = (t * 0.28 + i / shocks.length) % 1;
      s.scale.setScalar(0.4 + p * 8);
      const m = s.material as THREE.MeshBasicMaterial;
      m.color.copy(tint);
      m.opacity = (1 - p) * (1 - p) * 0.7 * c0;
    });
    core.scale.setScalar(1 + Math.sin(t * 4) * 0.08);

    // 02
    const gather = clamp01((span - 1 - 0.05) / 0.8);
    const show = smooth(0, 0.35, span - 0.15) * (1 - smooth(1.95, 2.35, span));
    fanItems.forEach((fi, i) => {
      fi.mat.uniforms.uHead.value = Math.min(1.05, 0.1 + gather * 1.0);
      fi.mat.uniforms.uAlpha.value = show;
      const m = fi.chip.material as THREE.SpriteMaterial;
      m.opacity = show * (1 - smooth(0.55, 1, gather) * 0.9);
      fi.chip.scale.setScalar((wide ? 1.9 : 1.7) * (1 + Math.sin(t * 2 + i) * 0.04));
    });
    pkMat.opacity = show * 0.95;
    pkMat.color.copy(tint).lerp(new THREE.Color("#ffffff"), 0.4);
    let pi = 0;
    for (let i = 0; i < fanItems.length; i += 1) {
      const pts = fanItems[i].pts;
      for (let q = 0; q < pkPer; q += 1) {
        const p = (t * 0.32 + fanItems[i].phase + q / pkPer) % 1;
        const head = Math.min(1, 0.1 + gather * 1.0);
        const idx = Math.floor(p * head * (pts.length - 1));
        const v = pts[idx] ?? pts[0];
        pkPos[pi * 3] = v.x;
        pkPos[pi * 3 + 1] = v.y;
        pkPos[pi * 3 + 2] = v.z;
        pi += 1;
      }
    }
    pkGeo.attributes.position.needsUpdate = true;

    // 03
    hubWire.rotation.x = t * 0.5;
    hubWire.rotation.y = t * 0.7;
    hubCore.rotation.y = -t * 0.9;
    const pulse = 1 + Math.sin(t * 3) * 0.06 + clamp01(1 - Math.abs(span - 2) * 3) * 0.12;
    hubCore.scale.setScalar(pulse);
    orbits.forEach((o, i) => {
      o.rotation.x += 0.004 * (i + 1);
      o.rotation.y += 0.003 * (3 - i);
    });

    // 04
    const lit = near(3) > 0.02;
    if (lit && solid.instanceColor) {
      const arr = solid.instanceColor.array as Float32Array;
      for (let i = 0; i < cubeN; i += 1) {
        const p = cubePos[i];
        const wv = Math.sin(t * 1.7 - p.x * 0.6 + p.z * 0.55 + rand(i) * 3);
        const on = smooth(0.78, 0.95, wv);
        tmpC.copy(baseCube).lerp(hitCube, on);
        arr[i * 3] = tmpC.r;
        arr[i * 3 + 1] = tmpC.g;
        arr[i * 3 + 2] = tmpC.b;
      }
      solid.instanceColor.needsUpdate = true;
      cacheGroup.rotation.y = Math.sin(t * 0.25) * 0.12;
    }

    // 05
    cardGroup.position.y = Math.sin(t * 0.9) * 0.1;
    cardGroup.rotation.y = Math.sin(t * 0.5) * 0.06 + px * 0.05;
    const c4 = near(4);
    sparkMat.opacity = c4 * 0.9;
    for (let i = 0; i < sparkN; i += 1) {
      const d = sparkData[i];
      const p = (t * d.s * 0.35 + d.z) % 6;
      sparkPos[i * 3] = Math.cos(d.a + t * 0.1) * d.r * (0.5 + p * 0.2);
      sparkPos[i * 3 + 1] = Math.sin(d.a + t * 0.1) * d.r * 0.55 * (0.5 + p * 0.2);
      sparkPos[i * 3 + 2] = -p * 1.4 + 3;
    }
    sparkGeo.attributes.position.needsUpdate = true;

    if (bloom) bloom.strength = 0.4 + burst * 0.45 + Math.min(vel * 0.3, 0.3);
    if (fxPass) {
      fxPass.uniforms.uAmt.value = 0.4 + Math.min(vel * 3, 3);
      fxPass.uniforms.uTime.value = t;
    }

    if (composer && tier < 2) composer.render();
    else renderer.render(scene, camera);
  };

  const frame = () => {
    raf = requestAnimationFrame(frame);
    if (!visible || document.hidden) {
      last = performance.now();
      return;
    }
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    const t = (now - start) / 1000;

    eased += (progress - eased) * (reduce ? 1 : 1 - Math.pow(0.0009, dt));
    vel += (Math.abs(eased - prevEased) / Math.max(dt, 0.001) - vel) * 0.18;
    prevEased = eased;
    fovKick += (Math.min(vel * 18, 14) - fovKick) * 0.12;
    px += (tx - px) * 0.05;
    py += (ty - py) * 0.05;
    burst *= 0.93;

    const ch = Math.min(chapters - 1, Math.round(clamp01(eased) * (chapters - 1)));
    if (ch !== lastChapter) {
      lastChapter = ch;
      burst = 1;
      onChapter(ch);
    }
    const pc = Math.round(eased * 100);
    if (pc !== lastPct) {
      lastPct = pc;
      onProgress(pc);
    }

    renderFrame(t);

    // adaptive quality: drop resolution, then post-processing, when frames run long
    frames += 1;
    if (frames > 40 && tier < 2) {
      slowFrames = dt > 0.03 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      if (slowFrames > 45) {
        slowFrames = 0;
        tier += 1;
        if (tier === 1) {
          dprCap = 1;
          resize();
        }
      }
    }
  };

  let raf = 0;
  resize();
  if (reduce) {
    eased = progress;
    renderFrame(6);
    onChapter(Math.min(chapters - 1, Math.round(progress * (chapters - 1))));
    const redraw = () => {
      eased = progress;
      renderFrame(6);
      onChapter(Math.min(chapters - 1, Math.round(progress * (chapters - 1))));
      onProgress(Math.round(progress * 100));
    };
    window.addEventListener("scroll", redraw, { passive: true });
    const prevDispose = () => window.removeEventListener("scroll", redraw);
    return makeHandle(prevDispose);
  }
  frame();
  return makeHandle(() => {});

  function makeHandle(extra: () => void): JourneyHandle {
    return {
      dispose: () => {
        cancelAnimationFrame(raf);
        extra();
        window.removeEventListener("scroll", measure);
        window.removeEventListener("resize", measure);
        window.removeEventListener("pointermove", onMove);
        ro.disconnect();
        io.disconnect();
        disposables.forEach((d) => d.dispose());
        chipTextures.forEach((c) => c.dispose());
        fan.traverse((o) => {
          const m = o as THREE.Mesh;
          m.geometry?.dispose?.();
          const mat = m.material as THREE.Material | undefined;
          mat?.dispose?.();
        });
        solid.dispose();
        wire.dispose();
        composer?.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      },
    };
  }
}
