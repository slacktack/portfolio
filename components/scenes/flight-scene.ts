import * as THREE from "three";
import { canvasTexture, mountScene, rand, skyDome, smooth, type Built, type Ctx, type Handle } from "./kit";

const CREAM = 0xefece4;
const COBALT = 0x2447e0;
const VERMILION = 0xe8491d;
const GRAPHITE = 0x2a2c33;

// Boeing 777-300ER proportions: ~12:1 fuselage, 31.6° sweep, raked tips, GE90 nacelles.
const R = 1.68;
const ENG_X = 6.3;
const ENG_Y = -1.55;

function paint(geo: THREE.BufferGeometry, fn: (x: number, y: number, z: number, c: THREE.Color) => void) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    fn(pos.getX(i), pos.getY(i), pos.getZ(i), c);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
}

function wingGeo(pts: [number, number][], depth: number) {
  const sh = new THREE.Shape();
  pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: depth * 0.35, bevelSize: depth * 0.4, bevelSegments: 2 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -depth / 2, 0);
  return g;
}

function buildPlane(): THREE.Group {
  const plane = new THREE.Group();
  const cream = new THREE.Color(CREAM);
  const verm = new THREE.Color(VERMILION);
  const cobalt = new THREE.Color(COBALT);
  const graphite = new THREE.Color(GRAPHITE);

  // fuselage, profile listed tail to nose so the lathe faces point outward
  const prof: [number, number][] = [
    [0.05, -21.4], [0.32, -21], [0.7, -20], [1.05, -18.6], [1.35, -16.8], [1.58, -14.6], [R, -12.4], [R, 15.6],
    [1.62, 16.8], [1.5, 17.9], [1.3, 18.8], [1.02, 19.6], [0.66, 20.3], [0.3, 20.75], [0, 20.9],
  ];
  const fg = new THREE.LatheGeometry(prof.map(([r, z]) => new THREE.Vector2(r, z)), 128);
  fg.rotateX(Math.PI / 2);
  paint(fg, (x, y, z, c) => {
    const ny = y / Math.max(Math.hypot(x, y), 0.001);
    c.copy(cream);
    if (ny < -0.42) c.copy(cream).lerp(cobalt, smooth(-0.42, -0.7, ny));
    if (ny > -0.06 && ny < 0.04 && z > -13 && z < 17.6) c.copy(verm);
    if (z < -20.2) c.copy(graphite);
  });
  const skin = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.26, metalness: 0.28, side: THREE.DoubleSide });
  plane.add(new THREE.Mesh(fg, skin));

  // wings: swept, slight dihedral, raked tips
  const wg = wingGeo([[1.2, 4.4], [17.2, -6.6], [18.6, -8.9], [18.2, -9.3], [16.6, -8.3], [1.2, -3.8]], 0.42);
  paint(wg, (x, _y, _z, c) => c.copy(cream).lerp(new THREE.Color(0xc9ccd4), smooth(10, 18, x) * 0.6));
  const wingMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.32, metalness: 0.35, side: THREE.DoubleSide });
  [-1, 1].forEach((s) => {
    const w = new THREE.Mesh(wg, wingMat);
    w.scale.x = s;
    w.position.set(0, -0.95, 0);
    w.rotation.z = s * 0.1;
    plane.add(w);
  });

  // GE90 nacelles: closed lathe, dark intake, spinner, exhaust cone
  const navProf: [number, number][] = [
    [0.55, -3.1], [0.72, -2.9], [0.98, -2.3], [1.08, -1.2], [1.1, 0.4], [1.07, 1.4], [1.0, 1.9], [0.86, 2.15], [0.8, 2.2],
  ];
  const nav = new THREE.LatheGeometry(navProf.map(([r, z]) => new THREE.Vector2(r, z)), 64);
  nav.rotateX(Math.PI / 2);
  const navMat = new THREE.MeshStandardMaterial({ color: 0xe9e6de, roughness: 0.2, metalness: 0.55, side: THREE.DoubleSide });
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xb9bcc4, roughness: 0.15, metalness: 0.9 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0c0d14, roughness: 0.7, metalness: 0.2 });
  const spinMat = new THREE.MeshStandardMaterial({ color: 0x1b1d26, roughness: 0.3, metalness: 0.8 });
  [-1, 1].forEach((s) => {
    const g = new THREE.Group();
    g.position.set(s * ENG_X, ENG_Y, 3.2);
    const body = new THREE.Mesh(nav, navMat);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.82, 0.07, 12, 64), lipMat);
    lip.position.z = 2.18;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.8, 48), darkMat);
    face.position.z = 1.95;
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.7, 32), spinMat);
    spinner.rotation.x = Math.PI / 2;
    spinner.position.z = 2.25;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.2, 32), lipMat);
    cone.rotation.x = -Math.PI / 2;
    cone.position.z = -3.6;
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.0, 3.6), navMat);
    pylon.position.set(0, 1.0, -0.6);
    pylon.rotation.x = 0.08;
    g.add(body, lip, face, spinner, cone, pylon);
    plane.add(g);
  });

  // horizontal stabiliser
  const hs = wingGeo([[0.8, -14.4], [7.6, -19.2], [7.9, -20.4], [0.8, -18.6]], 0.24);
  [-1, 1].forEach((s) => {
    const m = new THREE.Mesh(hs, wingMat);
    m.scale.x = s;
    m.position.y = 0.35;
    m.rotation.z = s * 0.08;
    plane.add(m);
  });

  // vertical fin in cobalt, swept, with a vermilion mark
  const finShape = new THREE.Shape();
  [[-12.2, 0], [-17.4, 7.2], [-19.6, 7.2], [-20.2, 0]].forEach(([z, y], i) => (i ? finShape.lineTo(-z, y) : finShape.moveTo(-z, y)));
  finShape.closePath();
  const fin = new THREE.ExtrudeGeometry(finShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.1, bevelSegments: 2 });
  fin.rotateY(Math.PI / 2);
  fin.translate(-0.15, 1.2, 0);
  plane.add(new THREE.Mesh(fin, new THREE.MeshStandardMaterial({ color: COBALT, roughness: 0.3, metalness: 0.3 })));
  const markMat = new THREE.MeshStandardMaterial({ color: VERMILION, roughness: 0.35 });
  [-1, 1].forEach((s) => {
    const l = new THREE.Mesh(new THREE.CircleGeometry(0.85, 48), markMat);
    l.position.set(s * 0.26, 5.0, -17.6);
    l.rotation.y = (s * Math.PI) / 2;
    plane.add(l);
  });

  // the 777's blade tail cone
  const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 1.3), new THREE.MeshStandardMaterial({ color: GRAPHITE, roughness: 0.4 }));
  blade.position.set(0, 0.1, -21.2);
  plane.add(blade);

  // passenger windows, door outlines and cockpit glass
  const winMat = new THREE.MeshBasicMaterial({ color: 0x15161c });
  const winGeo = new THREE.PlaneGeometry(0.2, 0.3);
  const n = 46;
  const wins = new THREE.InstancedMesh(winGeo, winMat, n * 2);
  const dummy = new THREE.Object3D();
  let k = 0;
  for (let i = 0; i < n; i += 1) {
    const z = 15.0 - i * 0.6;
    [-1, 1].forEach((s) => {
      const phi = 0.26;
      dummy.position.set(s * (R + 0.012) * Math.cos(phi), (R + 0.012) * Math.sin(phi), z);
      dummy.rotation.set(0, (s * Math.PI) / 2, 0);
      dummy.updateMatrix();
      wins.setMatrixAt(k, dummy.matrix);
      k += 1;
    });
  }
  plane.add(wins);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x101218, roughness: 0.06, metalness: 0.85, side: THREE.DoubleSide });
  [-1, 1].forEach((s) => {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.22), glassMat);
    pane.position.set(s * 0.46, 1.12, 18.95);
    pane.rotation.set(-0.95, s * 0.5, 0);
    plane.add(pane);
  });

  return plane;
}

function cloudTex() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const puffs = [[128, 150, 70], [80, 160, 52], [176, 158, 56], [118, 112, 52], [150, 120, 44], [60, 176, 36], [200, 172, 34]];
    puffs.forEach(([x, y, r]) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(255,255,255,0.95)");
      grad.addColorStop(0.55, "rgba(255,255,255,0.55)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    });
  }, false);
}

function flightBuild(ctx: Ctx): Built {
  const { scene, camera, mobile } = ctx;
  scene.fog = new THREE.FogExp2(0xd8b898, 0.0013);

  const sunDir = new THREE.Vector3(-0.5, 0.26, -0.82);
  scene.add(skyDome(0x1a2bd0, 0x6f7fe0, 0xf6d9b0, sunDir, 0xffd2a0));

  scene.add(new THREE.HemisphereLight(0xcfd8ff, 0xf0b27a, 0.6));
  const sun = new THREE.DirectionalLight(0xffe0bd, 2.6);
  sun.position.set(30, 50, 70);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0xff9a70, 1.2);
  rim.position.set(-50, 10, -30);
  scene.add(rim);

  const plane = buildPlane();
  scene.add(plane);

  // contrails
  const trailTex = canvasTexture(8, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }, false);
  const trailMat = ctx.track(new THREE.MeshBasicMaterial({ map: trailTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55, side: THREE.DoubleSide, fog: false }));
  [-1, 1].forEach((s) => {
    const g = new THREE.PlaneGeometry(1.1, 90);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -47);
    const t1 = new THREE.Mesh(g, trailMat);
    t1.position.set(s * ENG_X, ENG_Y, -1);
    const t2 = t1.clone();
    t2.rotation.z = Math.PI / 2;
    plane.add(t1, t2);
  });

  // clouds
  const ct = ctx.track(cloudTex());
  const N = mobile ? 54 : 84;
  const clouds = Array.from({ length: N }, (_, i) => {
    const high = rand(i + 9) > 0.78;
    const mat = new THREE.SpriteMaterial({ map: ct, color: new THREE.Color().setHSL(0.08 + rand(i) * 0.03, 0.55, 0.88 - rand(i + 3) * 0.1), transparent: true, depthWrite: false, fog: false, opacity: 0 });
    const sp = new THREE.Sprite(mat);
    const base = {
      x: (rand(i + 1) - 0.5) * 340,
      y: high ? -6 + rand(i + 2) * 46 : -52 + rand(i + 2) * 40,
      z: -520 + rand(i + 4) * 560,
      s: (high ? 40 : 70) + rand(i + 5) * 80,
    };
    sp.scale.set(base.s, base.s * 0.62, 1);
    scene.add(sp);
    return { sp, mat, base };
  });

  const sunGlow = new THREE.Sprite(ctx.track(new THREE.SpriteMaterial({ map: ctx.track(canvasTexture(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,240,210,1)");
    grad.addColorStop(0.3, "rgba(255,200,150,0.4)");
    grad.addColorStop(1, "rgba(255,180,120,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }, false)), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0.6 })));
  sunGlow.position.copy(sunDir).multiplyScalar(520);
  sunGlow.scale.set(210, 210, 1);
  scene.add(sunGlow);

  const tmp = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const look = new THREE.Vector3();
  const cloudColor = new THREE.Color();
  void cloudColor;
  let narrow = false;

  return {
    resize(aspect) {
      narrow = aspect < 1;
      camera.fov = narrow ? 74 : 52;
      camera.updateProjectionMatrix();
    },
    update(p, t, dt, aspect) {
      void dt;
      void aspect;
      if (ctx.mode === "card") {
        // a close three-quarter beauty shot that banks gently while clouds stream past
        plane.position.set(0, -1.5, narrow ? -62 : -50);
        plane.rotation.set(0.12 + ctx.pointer.y * 0.05, -0.75 + Math.sin(t * 0.25) * 0.12 + ctx.pointer.x * 0.12, Math.sin(t * 0.4) * 0.1);
        camera.position.set(ctx.pointer.x * 0.8, 3 - ctx.pointer.y * 0.5, 0);
        camera.lookAt(plane.position.x, plane.position.y + 1, plane.position.z);
        const run = t * 60;
        clouds.forEach(({ sp, mat, base }, i) => {
          let z = base.z + run * (0.45 + rand(i + 11) * 0.7);
          z = ((z + 540) % 580) - 540;
          sp.position.set(base.x, base.y, z);
          mat.opacity = 0.7 * smooth(-520, -380, z) * (1 - smooth(-14, 6, z));
        });
        ctx.setFade(0, 0xf2efe6);
        return;
      }
      const dist = 460 * Math.pow(4.2 / 460, p);
      const k = (1 - p) * (1 - p);
      const lateral = narrow ? 34 : 62;
      const pos = tmp.set(lateral * k * 0.9, 22 * k + 3.2 * smooth(0.5, 1, p), -dist);
      plane.position.copy(pos);
      const p2 = Math.min(p + 0.01, 1);
      const d2 = 460 * Math.pow(4.2 / 460, p2);
      const k2 = (1 - p2) * (1 - p2);
      ahead.set(lateral * k2 * 0.9, 22 * k2 + 3.2 * smooth(0.5, 1, p2), -d2);
      plane.lookAt(ahead.clone().multiplyScalar(2).sub(pos));
      plane.rotateZ(Math.sin(p * 5.4) * 0.4 * (1 - p) + ctx.pointer.x * 0.05);
      // the camera follows the flyover with its eyes
      const f = smooth(0.52, 0.96, p);
      look.set(ctx.pointer.x * 4, ctx.pointer.y * 2 - 1, -60).lerp(plane.position, f);
      camera.position.set(ctx.pointer.x * 0.6, -ctx.pointer.y * 0.4, 0);
      camera.lookAt(look);
      camera.rotateZ(Math.sin(p * 9) * 0.01 * smooth(0.7, 1, p));

      // the world rushes toward the lens
      const travel = p * 330;
      clouds.forEach(({ sp, mat, base }, i) => {
        let z = base.z + travel * (0.45 + rand(i + 11) * 0.7);
        z = ((z + 540) % 580) - 540;
        sp.position.set(base.x * (1 + (z + 540) * 0.0004), base.y, z);
        const far = smooth(-520, -400, z);
        const near = 1 - smooth(-14, 6, z);
        mat.opacity = 0.78 * far * near;
      });

      ctx.setFade(
        ctx.mode === "scroll" ? smooth(0.93, 1, p) : Math.max(smooth(0.9, 1, p), 1 - smooth(0, 0.06, p)),
        0xf2efe6
      );
      void t;
    },
  };
}

export function mountFlightScene(opts: Pick<Parameters<typeof mountScene>[0], "host" | "mode" | "wrap" | "onProgress" | "loopSeconds">): Handle | null {
  return mountScene({ ...opts, fov: 52, exposure: 1, environment: opts.mode === "scroll", envIntensity: 0.7, bloom: { strength: 0.14, radius: 0.5, threshold: 0.9 }, build: flightBuild });
}
