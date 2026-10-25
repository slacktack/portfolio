import * as THREE from "three";
import { canvasTexture, mountScene, rand, skyDome, smooth, type Built, type Ctx, type Handle } from "./kit";

const CREAM = 0xf4e6c8;
const COBALT = 0x1a2bd0;
const VERMILION = 0xd3281b;

function buildPlane(): THREE.Group {
  const plane = new THREE.Group();

  // fuselage: one lathe, painted by vertex colour
  const prof: [number, number][] = [
    [0, 15.2], [0.55, 14.8], [1.05, 14], [1.55, 12.6], [1.95, 11], [2.2, 9.2], [2.36, 7], [2.4, 4], [2.4, -6],
    [2.28, -9], [1.9, -11.4], [1.35, -13.2], [0.8, -14.4], [0.42, -15.2], [0, -15.4],
  ];
  const fg = new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 48);
  fg.rotateX(Math.PI / 2);
  const pos = fg.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const cream = new THREE.Color(CREAM);
  const cobalt = new THREE.Color(COBALT);
  const verm = new THREE.Color(VERMILION);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.max(Math.hypot(x, y), 0.001);
    const ny = y / r;
    c.copy(cream).lerp(cobalt, smooth(-0.1, -0.5, ny));
    if (ny > 0.02 && ny < 0.2 && z < 11.5 && z > -12) c.copy(verm);
    if (z < -12.3) c.copy(cobalt).lerp(verm, smooth(-12.3, -15, z));
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  fg.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const body = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.34, metalness: 0.12 });
  plane.add(new THREE.Mesh(fg, body));

  // wings
  const wingShape = new THREE.Shape();
  wingShape.moveTo(1.6, -3.6);
  wingShape.lineTo(15.8, 3.4);
  wingShape.lineTo(15.8, 6.0);
  wingShape.lineTo(1.6, 4.4);
  wingShape.closePath();
  const wg = new THREE.ExtrudeGeometry(wingShape, { depth: 0.34, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.09, bevelSegments: 1 });
  wg.rotateX(-Math.PI / 2);
  wg.translate(0, -0.2, 0);
  const wp = wg.attributes.position;
  const wc = new Float32Array(wp.count * 3);
  for (let i = 0; i < wp.count; i += 1) {
    const x = wp.getX(i);
    const k = smooth(12.8, 15.4, x);
    c.copy(cream).lerp(cobalt, k);
    wc[i * 3] = c.r;
    wc[i * 3 + 1] = c.g;
    wc[i * 3 + 2] = c.b;
  }
  wg.setAttribute("color", new THREE.BufferAttribute(wc, 3));
  const wingMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.1, side: THREE.DoubleSide });
  const right = new THREE.Mesh(wg, wingMat);
  right.position.set(0, -0.9, 0);
  right.rotation.z = 0.075;
  const left = new THREE.Mesh(wg, wingMat);
  left.scale.x = -1;
  left.position.set(0, -0.9, 0);
  left.rotation.z = -0.075;
  plane.add(right, left);

  // winglets
  const wlMat = new THREE.MeshStandardMaterial({ color: VERMILION, roughness: 0.4, metalness: 0.1 });
  [-1, 1].forEach((s) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.3, 1.7), wlMat);
    w.position.set(s * 16.1, 0.55, -4.5);
    w.rotation.z = -s * 0.22;
    w.rotation.x = -0.25;
    plane.add(w);
  });

  // engines
  const engMat = new THREE.MeshStandardMaterial({ color: 0xe9e3d4, roughness: 0.28, metalness: 0.55 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x0b0c18, roughness: 0.6, metalness: 0.2 });
  const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.0, 0.55) });
  [-1, 1].forEach((s) => {
    const g = new THREE.Group();
    g.position.set(s * 6.3, -2.2, 1.2);
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.05, 4.6, 28, 1, true), engMat);
    cyl.rotation.x = Math.PI / 2;
    (cyl.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.13, 10, 36), new THREE.MeshStandardMaterial({ color: CREAM, roughness: 0.25, metalness: 0.6 }));
    ring.position.z = 2.3;
    const intake = new THREE.Mesh(new THREE.CircleGeometry(1.05, 28), darkMat);
    intake.position.z = 1.2;
    const fan = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.9, 16), engMat);
    fan.rotation.x = Math.PI / 2;
    fan.position.z = 1.7;
    const back = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24), glowMat);
    back.rotation.y = Math.PI;
    back.position.z = -2.35;
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 3.4), engMat);
    pylon.position.set(0, 1.35, -0.2);
    g.add(cyl, ring, intake, fan, back, pylon);
    plane.add(g);
  });

  // tail
  const finShape = new THREE.Shape();
  finShape.moveTo(2.2, 0);
  finShape.lineTo(-3.0, 8.4);
  finShape.lineTo(-6.0, 8.4);
  finShape.lineTo(-5.6, 0);
  finShape.closePath();
  const fin = new THREE.ExtrudeGeometry(finShape, { depth: 0.36, bevelEnabled: false });
  fin.rotateY(-Math.PI / 2);
  fin.translate(0.18, 0, 0);
  const finMesh = new THREE.Mesh(fin, new THREE.MeshStandardMaterial({ color: VERMILION, roughness: 0.38, metalness: 0.12 }));
  finMesh.position.set(0, 1.4, -9.2);
  plane.add(finMesh);
  const logoMat = new THREE.MeshBasicMaterial({ color: CREAM });
  [-1, 1].forEach((s) => {
    const l = new THREE.Mesh(new THREE.CircleGeometry(1.05, 28), logoMat);
    l.position.set(s * 0.2, 6.2, -12.4);
    l.rotation.y = s * Math.PI / 2;
    plane.add(l);
  });
  const stabs = [-1, 1].map((s) => {
    const m = new THREE.Mesh(wg, wingMat);
    m.scale.set(0.34 * s, 0.34, 0.34);
    m.position.set(0, 0.4, -12.2);
    m.rotation.z = s * 0.04;
    return m;
  });
  plane.add(...stabs);

  // windows
  const winGeo = new THREE.PlaneGeometry(0.5, 0.72);
  const winMat = new THREE.MeshBasicMaterial({ color: 0x10163a, side: THREE.DoubleSide });
  const n = 17;
  const wins = new THREE.InstancedMesh(winGeo, winMat, n * 2);
  const dummy = new THREE.Object3D();
  let k = 0;
  for (let i = 0; i < n; i += 1) {
    const z = 9.2 - i * 1.12;
    [-1, 1].forEach((s) => {
      const r = 2.415;
      const phi = 0.22;
      dummy.position.set(s * r * Math.cos(phi), r * Math.sin(phi), z);
      dummy.rotation.set(0, s * Math.PI / 2, 0);
      dummy.updateMatrix();
      wins.setMatrixAt(k, dummy.matrix);
      k += 1;
    });
  }
  plane.add(wins);
  const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.42, 0.25), new THREE.MeshStandardMaterial({ color: 0x0a0e2a, roughness: 0.12, metalness: 0.7 }));
  cockpit.position.set(0, 1.0, 12.7);
  cockpit.rotation.x = -0.55;
  plane.add(cockpit);

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
    t1.position.set(s * 6.3, -2.2, -3);
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
  return mountScene({ ...opts, fov: 52, exposure: 1, environment: true, envIntensity: 0.7, bloom: { strength: 0.14, radius: 0.5, threshold: 0.9 }, build: flightBuild });
}
