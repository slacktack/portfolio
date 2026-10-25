import * as THREE from "three";
import { canvasTexture, mountScene, rand, skyDome, smooth, type Built, type Ctx, type Handle } from "./kit";

const TERRA = 0x8f3b28;
const MAROON = 0x6e1f1a;
const GOLD = 0xd8a948;

const archPath = (w: number, h: number, Ctor: typeof THREE.Path | typeof THREE.Shape = THREE.Path) => {
  const r = w / 2;
  const p = new Ctor();
  p.moveTo(-r, 0);
  p.lineTo(-r, h - r);
  p.absarc(0, h - r, r, Math.PI, 0, true);
  p.lineTo(r, 0);
  p.lineTo(-r, 0);
  return p;
};

type Hole = { x: number; y: number; w: number; h: number };

function wall(width: number, height: number, holes: Hole[], depth: number, mat: THREE.Material) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0);
  s.lineTo(width / 2, 0);
  s.lineTo(width / 2, height);
  s.lineTo(-width / 2, height);
  s.lineTo(-width / 2, 0);
  holes.forEach((hl) => {
    const p = archPath(hl.w, hl.h);
    p.curves.forEach(() => {});
    const pts = p.getPoints(14).map((v) => new THREE.Vector2(v.x + hl.x, v.y + hl.y));
    s.holes.push(new THREE.Path(pts));
  });
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return new THREE.Mesh(g, mat);
}

function frame(w: number, h: number, t: number, depth: number, mat: THREE.Material) {
  const R = w / 2 + t;
  const H = h + t;
  const s = new THREE.Shape();
  s.moveTo(-R, 0);
  s.lineTo(-R, H - R);
  s.absarc(0, H - R, R, Math.PI, 0, true);
  s.lineTo(R, 0);
  s.lineTo(-R, 0);
  const pts = archPath(w, h).getPoints(18);
  s.holes.push(new THREE.Path(pts));
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return new THREE.Mesh(g, mat);
}

function dome(r: number, mat: THREE.Material, gold: THREE.Material) {
  const g = new THREE.Group();
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.92, r * 1.02, r * 0.7, 28), mat);
  drum.position.y = r * 0.35;
  const d = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  d.position.y = r * 0.7;
  d.scale.y = 1.15;
  const fin = new THREE.Mesh(new THREE.ConeGeometry(r * 0.08, r * 0.75, 10), gold);
  fin.position.y = r * 0.7 + r * 1.15 + r * 0.3;
  const ball = new THREE.Mesh(new THREE.SphereGeometry(r * 0.1, 12, 10), gold);
  ball.position.y = r * 0.7 + r * 1.15 - 0.02;
  g.add(drum, d, fin, ball);
  return g;
}

function hotelBuild(ctx: Ctx): Built {
  const { scene, camera } = ctx;
  scene.fog = new THREE.FogExp2(0x3a0f1a, 0.0085);
  scene.background = new THREE.Color(0x1a0a18);

  const sunDir = new THREE.Vector3(0.05, 0.05, -1);
  scene.add(skyDome(0x120637, 0x6a1a2e, 0xf0703a, sunDir, 0xff9a52));

  // stars
  const sn = 420;
  const sp = new Float32Array(sn * 3);
  for (let i = 0; i < sn; i += 1) {
    const a = rand(i) * Math.PI * 2;
    const e = 0.18 + rand(i + 7) * 0.8;
    const r = 520;
    sp[i * 3] = Math.cos(a) * Math.cos(e) * r;
    sp[i * 3 + 1] = Math.sin(e) * r;
    sp[i * 3 + 2] = Math.sin(a) * Math.cos(e) * r * -1;
  }
  const sg = ctx.track(new THREE.BufferGeometry());
  sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, ctx.track(new THREE.PointsMaterial({ size: 2.2, color: 0xfff3dc, transparent: true, opacity: 0.8, fog: false, depthWrite: false })));
  scene.add(stars);

  scene.add(new THREE.HemisphereLight(0xffd9b0, 0x2a1020, 0.26));
  const key = new THREE.DirectionalLight(0xffb27a, 0.4);
  key.position.set(10, 30, 40);
  scene.add(key);

  const mat = {
    terra: ctx.track(new THREE.MeshStandardMaterial({ color: TERRA, roughness: 0.88 })),
    cream: ctx.track(new THREE.MeshStandardMaterial({ color: 0xb8a784, roughness: 0.8 })),
    dome: ctx.track(new THREE.MeshStandardMaterial({ color: 0x7a2c1f, roughness: 0.4, metalness: 0.35 })),
    gold: ctx.track(new THREE.MeshStandardMaterial({ color: GOLD, roughness: 0.28, metalness: 0.9 })),
    wood: ctx.track(new THREE.MeshStandardMaterial({ color: 0x3b1d12, roughness: 0.45, metalness: 0.1 })),
    plum: ctx.track(new THREE.MeshStandardMaterial({ color: 0x4a1830, roughness: 0.9 })),
    dark: ctx.track(new THREE.MeshStandardMaterial({ color: 0x1c0d0c, roughness: 0.8 })),
    stone: ctx.track(new THREE.MeshStandardMaterial({ color: 0x24150f, roughness: 0.42, metalness: 0.15 })),
    warm: ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(1.1, 0.7, 0.38), fog: false })),
    warmSoft: ctx.track(new THREE.MeshBasicMaterial({ color: new THREE.Color(0.8, 0.5, 0.24) })),
  };
  const glowTex = ctx.track(canvasTexture(128, 128, (g, w, h) => {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,225,170,1)");
    grad.addColorStop(0.35, "rgba(255,170,90,0.35)");
    grad.addColorStop(1, "rgba(255,140,60,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }, false));
  const glow = (x: number, y: number, z: number, s: number, o = 0.8) => {
    const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: o, fog: false }));
    sp2.position.set(x, y, z);
    sp2.scale.set(s, s, 1);
    scene.add(sp2);
    return sp2;
  };

  // ---------- exterior ----------
  const FZ = -30;
  const holes: Hole[] = [{ x: 0, y: 0, w: 11, h: 14.5 }];
  [7.5, 13.5, 19.5].forEach((y, row) => {
    for (let x = -36; x <= 36; x += 6) {
      if (Math.abs(x) < 8 && row === 0) continue;
      if (Math.abs(x) < 8 && row === 1 && false) continue;
      holes.push({ x, y, w: 2.4, h: 4.2 });
    }
  });
  const facade = wall(86, 26, holes, 3, mat.terra);
  facade.position.set(0, 0, FZ);
  scene.add(facade);

  // warm rooms behind the windows
  const glowShape = new THREE.Shape();
  glowShape.moveTo(-43, 0);
  glowShape.lineTo(43, 0);
  glowShape.lineTo(43, 26);
  glowShape.lineTo(-43, 26);
  glowShape.lineTo(-43, 0);
  glowShape.holes.push(new THREE.Path(archPath(11, 14.5).getPoints(14).map((v) => new THREE.Vector2(v.x, v.y))));
  const roomsTex = ctx.track(canvasTexture(512, 128, (g, w, h) => {
    g.fillStyle = "#ffc27a";
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i += 1) {
      g.fillStyle = `rgba(80,20,10,${0.1 + rand(i) * 0.45})`;
      g.fillRect(rand(i + 1) * w, rand(i + 2) * h, 18 + rand(i + 3) * 30, 14 + rand(i + 4) * 40);
    }
  }));
  const gg = new THREE.ShapeGeometry(glowShape);
  const gp = gg.attributes.position;
  const uv = new Float32Array(gp.count * 2);
  for (let i = 0; i < gp.count; i += 1) {
    uv[i * 2] = (gp.getX(i) + 43) / 86;
    uv[i * 2 + 1] = gp.getY(i) / 26;
  }
  gg.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  const rooms = new THREE.Mesh(gg, ctx.track(new THREE.MeshBasicMaterial({ map: roomsTex, color: new THREE.Color(0.85, 0.7, 0.6), fog: false })));
  rooms.position.set(0, 0, FZ - 1.2);
  scene.add(rooms);

  const arcFrame = frame(11, 14.5, 1.3, 3.6, mat.cream);
  arcFrame.position.set(0, 0, FZ + 0.2);
  scene.add(arcFrame);
  [7.5, 13.5, 19.5].forEach((y) => {
    for (let x = -36; x <= 36; x += 6) {
      if (Math.abs(x) < 8 && y === 7.5) continue;
      const f = frame(2.4, 4.2, 0.35, 3.3, mat.cream);
      f.position.set(x, y, FZ + 0.1);
      scene.add(f);
    }
  });
  [9.5, 16, 22].forEach((y) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(86, 0.4, 3.4), mat.cream);
    b.position.set(0, y, FZ + 0.1);
    scene.add(b);
  });
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(88, 1.4, 4.2), mat.cream);
  cornice.position.set(0, 26.4, FZ + 0.3);
  scene.add(cornice);

  // towers and domes
  [-41, 41].forEach((x) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(11, 36, 9), mat.terra);
    tower.position.set(x, 18, FZ - 1.5);
    scene.add(tower);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(12, 1.2, 10), mat.cream);
    cap.position.set(x, 36.4, FZ - 1.5);
    scene.add(cap);
    const d = dome(5.4, mat.dome, mat.gold);
    d.position.set(x, 37, FZ - 1.5);
    scene.add(d);
    [10, 20, 29].forEach((y) => {
      const w = new THREE.Mesh(new THREE.ShapeGeometry(archPath(2.4, 4.4, THREE.Shape) as THREE.Shape), mat.warm);
      w.position.set(x, y, FZ + 3.1);
      scene.add(w);
    });
  });
  const cd = dome(8, mat.dome, mat.gold);
  cd.position.set(0, 27, FZ - 2);
  scene.add(cd);
  [-20, 20].forEach((x) => {
    const d = dome(3.2, mat.dome, mat.gold);
    d.position.set(x, 27, FZ - 1);
    scene.add(d);
  });

  // street, carpet, steps, lamps
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat.stone);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, 0);
  scene.add(ground);

  const carpetTex = ctx.track(canvasTexture(128, 512, (g, w, h) => {
    g.fillStyle = "#7a1a16";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "#d8a948";
    g.lineWidth = 6;
    g.strokeRect(8, 0, w - 16, h);
    g.lineWidth = 2;
    g.strokeRect(20, 0, w - 40, h);
    g.fillStyle = "rgba(216,169,72,0.5)";
    for (let y = 20; y < h; y += 48) {
      g.beginPath();
      g.moveTo(w / 2, y);
      g.lineTo(w / 2 + 14, y + 14);
      g.lineTo(w / 2, y + 28);
      g.lineTo(w / 2 - 14, y + 14);
      g.fill();
    }
  }));
  carpetTex.wrapT = THREE.RepeatWrapping;
  carpetTex.repeat.set(1, 3);
  const carpet = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 80), new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 0.9 }));
  carpet.rotation.x = -Math.PI / 2;
  carpet.position.set(0, 0.03, -2);
  scene.add(carpet);

  [0.35, 0.7, 1.05].forEach((h, i) => {
    const st = new THREE.Mesh(new THREE.BoxGeometry(18, h, 3), mat.cream);
    st.position.set(0, h / 2, FZ + 5.2 + (2 - i) * 1.6 - 0.4);
    scene.add(st);
  });
  const stepCarpet = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 8), new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 0.9 }));
  stepCarpet.rotation.x = -Math.PI / 2;
  stepCarpet.position.set(0, 1.07, FZ + 3.5);
  scene.add(stepCarpet);

  for (let i = 0; i < 7; i += 1) {
    [-1, 1].forEach((s) => {
      const z = 28 - i * 8;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 5.5, 8), mat.dark);
      pole.position.set(s * 8, 2.75, z);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), mat.warm);
      bulb.position.set(s * 8, 5.9, z);
      scene.add(pole, bulb);
      glow(s * 8, 5.9, z, 4, 0.5);
    });
  }

  // ---------- lobby ----------
  const LZ0 = FZ;
  const LZ1 = -100;
  const LW = 36;
  const LH = 16;
  const midZ = (LZ0 + LZ1) / 2;

  const marbleTex = ctx.track(canvasTexture(512, 512, (g, w, h) => {
    const n = 8;
    for (let y = 0; y < n; y += 1) {
      for (let x = 0; x < n; x += 1) {
        g.fillStyle = (x + y) % 2 ? "#6e1f1a" : "#eadfc6";
        g.fillRect((x * w) / n, (y * h) / n, w / n, h / n);
        g.fillStyle = "rgba(255,255,255,0.12)";
        g.fillRect((x * w) / n, (y * h) / n, w / n, 2);
      }
    }
    g.strokeStyle = "rgba(216,169,72,0.7)";
    g.lineWidth = 2;
    for (let i = 0; i <= n; i += 1) {
      g.beginPath();
      g.moveTo((i * w) / n, 0);
      g.lineTo((i * w) / n, h);
      g.moveTo(0, (i * h) / n);
      g.lineTo(w, (i * h) / n);
      g.stroke();
    }
  }));
  marbleTex.wrapS = marbleTex.wrapT = THREE.RepeatWrapping;
  marbleTex.repeat.set(LW / 8, (LZ0 - LZ1) / 8);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(LW, LZ0 - LZ1), new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.16, metalness: 0.05 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0.01, midZ);
  scene.add(floor);

  const lobbyCarpet = new THREE.Mesh(new THREE.PlaneGeometry(6.5, LZ0 - LZ1), new THREE.MeshStandardMaterial({ map: carpetTex, roughness: 0.9 }));
  lobbyCarpet.rotation.x = -Math.PI / 2;
  lobbyCarpet.position.set(0, 0.04, midZ);
  scene.add(lobbyCarpet);

  // ceiling with coffers
  const cofferTex = ctx.track(canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = "#2a1410";
    g.fillRect(0, 0, w, h);
    g.strokeStyle = "rgba(216,169,72,0.85)";
    g.lineWidth = 6;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.lineWidth = 2;
    g.strokeRect(34, 34, w - 68, h - 68);
  }));
  cofferTex.wrapS = cofferTex.wrapT = THREE.RepeatWrapping;
  cofferTex.repeat.set(LW / 6, (LZ0 - LZ1) / 6);
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(LW, LZ0 - LZ1), new THREE.MeshStandardMaterial({ map: cofferTex, roughness: 0.8, emissive: 0x2a1204, emissiveMap: cofferTex, emissiveIntensity: 0.45 }));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, LH, midZ);
  scene.add(ceiling);

  // side walls with lit niches
  const sideHoles: Hole[] = [];
  const nz = 6;
  for (let i = 0; i < nz; i += 1) sideHoles.push({ x: -((LZ0 - LZ1) / 2) + 9 + i * 10.4, y: 0, w: 5, h: 9.5 });
  [-1, 1].forEach((s) => {
    const w = wall(LZ0 - LZ1, LH, sideHoles, 1.2, mat.cream);
    w.rotation.y = s * Math.PI / 2;
    w.position.set(s * (LW / 2), 0, midZ);
    scene.add(w);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(LZ0 - LZ1, 10), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.7, 0.38, 0.22) }));
    back.rotation.y = -s * Math.PI / 2;
    back.position.set(s * (LW / 2 + 1.3), 5, midZ);
    scene.add(back);
    for (let i = 0; i < nz; i += 1) {
      const z = LZ0 - 9 - i * 10.4;
      const fr = frame(5, 9.5, 0.5, 1.5, mat.gold);
      fr.rotation.y = s * Math.PI / 2;
      fr.position.set(s * (LW / 2 - 0.7), 0, z);
      scene.add(fr);
    }
  });

  // columns and beams
  for (let i = 0; i < 6; i += 1) {
    const z = LZ0 - 10 - i * 10.2;
    [-9.5, 9.5].forEach((x) => {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 14.6, 24), mat.cream);
      col.position.set(x, 7.3, z);
      const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.8, 24), mat.gold);
      base.position.set(x, 0.4, z);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.1, 1.2, 24), mat.gold);
      cap.position.set(x, 14.4, z);
      scene.add(col, base, cap);
    });
    const beam = new THREE.Mesh(new THREE.BoxGeometry(LW - 2, 0.8, 1.1), mat.wood);
    beam.position.set(0, 15.2, z);
    scene.add(beam);
  }

  // chandelier
  const chand = new THREE.Group();
  chand.position.set(0, 11.2, midZ + 4);
  [[3.4, 0], [2.3, -1.4], [1.3, -2.6]].forEach(([r, y]) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.12, 10, 56), mat.gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    chand.add(ring);
  });
  const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 6, 6), mat.gold);
  chain.position.y = 3.2;
  chand.add(chain);
  const bulbGeo = ctx.track(new THREE.SphereGeometry(0.17, 10, 8));
  const bulbs = new THREE.InstancedMesh(bulbGeo, new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.5, 0.8) }), 96);
  const dm = new THREE.Object3D();
  let bi = 0;
  [[3.4, 0, 40], [2.3, -1.4, 32], [1.3, -2.6, 24]].forEach(([r, y, n]) => {
    for (let i = 0; i < n; i += 1) {
      const a = (i / n) * Math.PI * 2;
      dm.position.set(Math.cos(a) * r, y + 0.25 + (i % 2) * 0.15, Math.sin(a) * r);
      dm.updateMatrix();
      bulbs.setMatrixAt(bi, dm.matrix);
      bi += 1;
    }
  });
  chand.add(bulbs);
  for (let i = 0; i < 18; i += 1) {
    const a = (i / 18) * Math.PI * 2;
    const pend = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.9, 6), new THREE.MeshStandardMaterial({ color: 0xfff1d0, roughness: 0.05, metalness: 0.2, emissive: 0x553311, emissiveIntensity: 0.6 }));
    pend.rotation.x = Math.PI;
    pend.position.set(Math.cos(a) * 3.4, -0.7, Math.sin(a) * 3.4);
    chand.add(pend);
  }
  scene.add(chand);
  const chandGlow = glow(0, 11, midZ + 4, 12, 0.45);
  const chandLight = new THREE.PointLight(0xffc27a, 14, 50, 2);
  chandLight.position.set(0, 10, midZ + 4);
  scene.add(chandLight);

  // sconces
  for (let i = 0; i < 8; i += 1) {
    [-1, 1].forEach((s) => {
      const z = LZ0 - 5 - i * 8.6;
      const sc = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.5), mat.warmSoft);
      sc.position.set(s * (LW / 2 - 1.6), 8, z);
      scene.add(sc);
      glow(s * (LW / 2 - 2), 8, z, 2, 0.3);
    });
  }

  // reception
  const desk = new THREE.Group();
  desk.position.set(12, 0, -84);
  const body = new THREE.Mesh(new THREE.BoxGeometry(9, 1.6, 2.4), mat.wood);
  body.position.y = 0.8;
  const top = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.16, 2.8), mat.gold);
  top.position.y = 1.68;
  const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.55, 12, 1, true), mat.warmSoft);
  lamp.position.set(-3, 2.6, 0);
  desk.add(body, top, lamp);
  scene.add(desk);
  glow(9, 2.7, -84, 3, 0.8);

  // end wall and corridor mouth
  const endWall = wall(LW, LH, [{ x: 0, y: 0, w: 7.5, h: 9 }], 1.2, mat.cream);
  endWall.position.set(0, 0, LZ1);
  scene.add(endWall);
  const endFrame = frame(7.5, 9, 0.7, 1.6, mat.gold);
  endFrame.position.set(0, 0, LZ1 + 0.4);
  scene.add(endFrame);

  // ---------- corridor ----------
  const CZ0 = LZ1;
  const CZ1 = -152;
  const CW = 7.4;
  const CH = 7.2;
  const cmid = (CZ0 + CZ1) / 2;
  const cLen = CZ0 - CZ1;
  const cCarpetTex = carpetTex.clone();
  cCarpetTex.needsUpdate = true;
  cCarpetTex.repeat.set(1, cLen / 14);
  const cFloor = new THREE.Mesh(new THREE.PlaneGeometry(CW, cLen), new THREE.MeshStandardMaterial({ map: cCarpetTex, roughness: 0.9 }));
  cFloor.rotation.x = -Math.PI / 2;
  cFloor.position.set(0, 0.02, cmid);
  scene.add(cFloor);
  const cCeil = new THREE.Mesh(new THREE.PlaneGeometry(CW, cLen), mat.dark);
  cCeil.rotation.x = Math.PI / 2;
  cCeil.position.set(0, CH, cmid);
  scene.add(cCeil);
  [-1, 1].forEach((s) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(cLen, CH), mat.plum);
    w.rotation.y = -s * Math.PI / 2;
    w.position.set(s * (CW / 2), CH / 2, cmid);
    scene.add(w);
    const wain = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.2, cLen), mat.wood);
    wain.position.set(s * (CW / 2 - 0.05), 1.1, cmid);
    scene.add(wain);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, cLen), mat.gold);
    rail.position.set(s * (CW / 2 - 0.08), 2.25, cmid);
    scene.add(rail);
    for (let i = 0; i < 6; i += 1) {
      const z = CZ0 - 6 - i * 8;
      const door = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.4, 2.2), mat.dark);
      door.position.set(s * (CW / 2 - 0.1), 2.2, z);
      const plate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.6), mat.gold);
      plate.position.set(s * (CW / 2 - 0.25), 3.6, z);
      const sc = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.34), mat.warmSoft);
      sc.position.set(s * (CW / 2 - 0.3), 5.2, z + 4);
      scene.add(door, plate, sc);
      glow(s * (CW / 2 - 0.9), 5.2, z + 4, 2.2, 0.32);
    }
  });
  const corridorLight = new THREE.PointLight(0xffc68a, 3.2, 20, 1.8);
  scene.add(corridorLight);

  // ---------- room ----------
  const RZ0 = CZ1;
  const RZ1 = -184;
  const RW = 24;
  const RH = 9.5;
  const rmid = (RZ0 + RZ1) / 2;
  const rLen = RZ0 - RZ1;
  const plankTex = ctx.track(canvasTexture(256, 256, (g, w, h) => {
    for (let i = 0; i < 8; i += 1) {
      g.fillStyle = `hsl(24, ${40 + rand(i) * 12}%, ${22 + rand(i + 2) * 8}%)`;
      g.fillRect(0, (i * h) / 8, w, h / 8 - 2);
    }
  }));
  plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping;
  plankTex.repeat.set(4, 4);
  const rFloor = new THREE.Mesh(new THREE.PlaneGeometry(RW, rLen), new THREE.MeshStandardMaterial({ map: plankTex, roughness: 0.4, metalness: 0.05 }));
  rFloor.rotation.x = -Math.PI / 2;
  rFloor.position.set(0, 0.02, rmid);
  scene.add(rFloor);
  const rCeil = new THREE.Mesh(new THREE.PlaneGeometry(RW, rLen), mat.cream);
  rCeil.rotation.x = Math.PI / 2;
  rCeil.position.set(0, RH, rmid);
  scene.add(rCeil);
  [-1, 1].forEach((s) => {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(rLen, RH), mat.plum);
    w.rotation.y = -s * Math.PI / 2;
    w.position.set(s * (RW / 2), RH / 2, rmid);
    scene.add(w);
  });
  const rBack = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), mat.plum);
  rBack.position.set(0, RH / 2, RZ1);
  scene.add(rBack);
  // corridor-side wall of the room with the door opening
  const rFront = wall(RW, RH, [{ x: 0, y: 0, w: 5, h: 6.4 }], 0.5, mat.plum);
  rFront.rotation.y = Math.PI;
  rFront.position.set(0, 0, RZ0);
  scene.add(rFront);

  // door leaves, they swing open
  const leaves = [-1, 1].map((s) => {
    const pivot = new THREE.Group();
    pivot.position.set(s * 2.5, 0, RZ0 + 0.4);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 6.2, 0.18), mat.wood);
    leaf.position.set(-s * 1.25, 3.1, 0);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat.gold);
    knob.position.set(-s * 2.1, 3, 0.16);
    pivot.add(leaf, knob);
    scene.add(pivot);
    return { pivot, s };
  });

  // window and skyline
  const skyTex = ctx.track(canvasTexture(512, 256, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "#0e0830");
    grad.addColorStop(0.6, "#6a1a3a");
    grad.addColorStop(1, "#f08a4a");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 46; i += 1) {
      const bw = 18 + rand(i) * 40;
      const bh = 40 + rand(i + 3) * 120;
      const x = rand(i + 9) * w;
      g.fillStyle = "#12061c";
      g.fillRect(x, h - bh, bw, bh);
      for (let k = 0; k < 14; k += 1) {
        if (rand(i * 31 + k) > 0.55) {
          g.fillStyle = "#ffcb7a";
          g.fillRect(x + 3 + rand(i + k) * (bw - 8), h - bh + 6 + rand(k + i * 7) * (bh - 12), 3, 4);
        }
      }
    }
  }));
  const win = new THREE.Mesh(new THREE.PlaneGeometry(14, 6.4), new THREE.MeshBasicMaterial({ map: skyTex, fog: false }));
  win.position.set(0, 5, RZ1 + 0.05);
  scene.add(win);
  const winFrame = frame(14, 6.4, 0.4, 0.4, mat.gold);
  winFrame.visible = false;
  [-1, 1].forEach((s) => {
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(2.6, 8.4, 0.5), mat.plum);
    curtain.position.set(s * 8, 4.6, RZ1 + 0.4);
    scene.add(curtain);
  });

  // bed
  const bed = new THREE.Group();
  bed.position.set(-5, 0, -172);
  const baseBox = new THREE.Mesh(new THREE.BoxGeometry(9.5, 1.1, 6.8), mat.wood);
  baseBox.position.y = 0.55;
  const mattress = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.8, 6.5), mat.cream);
  mattress.position.y = 1.5;
  const runner = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.84, 6.6), new THREE.MeshStandardMaterial({ color: MAROON, roughness: 0.9 }));
  runner.position.set(2.2, 1.52, 0);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 4.2, 7.2), mat.wood);
  head.position.set(-5, 2.1, 0);
  [-1.6, 1.6].forEach((z) => {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 2.4), new THREE.MeshStandardMaterial({ color: 0xfff5e0, roughness: 0.95 }));
    pil.position.set(-3.7, 2.1, z);
    bed.add(pil);
  });
  bed.add(baseBox, mattress, runner, head);
  scene.add(bed);
  [-1, 1].forEach((s) => {
    const nt = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), mat.wood);
    nt.position.set(-9.8, 0.9, -172 + s * 4.6);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.9, 16, 1, true), mat.warm);
    shade.position.set(-9.8, 2.5, -172 + s * 4.6);
    scene.add(nt, shade);
    glow(-9.8, 2.5, -172 + s * 4.6, 3, 0.6);
  });
  const roomLight = new THREE.PointLight(0xffc27a, 10, 28, 2);
  roomLight.position.set(-6, 5, -170);
  scene.add(roomLight);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(6, 40), new THREE.MeshStandardMaterial({ color: 0x5a1626, roughness: 1 }));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(-1, 0.05, -170);
  scene.add(rug);

  // 7 records converge on one hotel
  const logos = ["makemytrip", "booking", "agoda", "goibibo", "cleartrip", "ixigo", "easemytrip"];
  const chips = logos.map((name, i) => {
    const tex = ctx.track(canvasTexture(256, 256, (g) => {
      g.fillStyle = "#fffdf6";
      g.beginPath();
      g.roundRect(24, 24, 208, 208, 52);
      g.fill();
    }));
    const img = new Image();
    img.onload = () => {
      const g = (tex.image as HTMLCanvasElement).getContext("2d");
      if (!g) return;
      const sc = Math.min(150 / img.naturalWidth, 150 / img.naturalHeight);
      g.drawImage(img, 128 - (img.naturalWidth * sc) / 2, 128 - (img.naturalHeight * sc) / 2, img.naturalWidth * sc, img.naturalHeight * sc);
      tex.needsUpdate = true;
    };
    img.src = `/assets/logos/${name}.png`;
    const sp2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
    sp2.scale.set(2, 2, 1);
    scene.add(sp2);
    return { sp: sp2, a: (i / logos.length) * Math.PI * 2 };
  });
  const cardTex = ctx.track(canvasTexture(768, 384, (g, w, h) => {
    g.fillStyle = "#1a1311";
    g.beginPath();
    g.roundRect(6, 6, w - 12, h - 12, 36);
    g.fill();
    g.strokeStyle = "#d8a948";
    g.lineWidth = 4;
    g.stroke();
    g.fillStyle = "#d8a948";
    g.font = "600 30px system-ui, Helvetica, Arial, sans-serif";
    g.fillText("ONE HOTEL · 7 RECORDS MERGED", 44, 72);
    g.fillStyle = "#fff6e6";
    g.font = "800 92px 'Helvetica Neue', Arial, sans-serif";
    g.fillText("The Park", 44, 190);
    g.fillStyle = "rgba(255,246,230,0.7)";
    g.font = "500 30px system-ui, Helvetica, Arial, sans-serif";
    g.fillText("Bangalore · 5★ · 12 room types", 44, 244);
    g.fillStyle = "#f0b27a";
    g.font = "800 64px 'Helvetica Neue', Arial, sans-serif";
    g.fillText("₹4,760", 44, 330);
    g.fillStyle = "rgba(255,246,230,0.55)";
    g.font = "500 26px system-ui, Helvetica, Arial, sans-serif";
    g.fillText("best rate · simulated example", 250, 326);
  }));
  const card = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, opacity: 0, toneMapped: false }));
  card.position.set(12, 4.6, -84);
  scene.add(card);
  const priceCard = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.8), new THREE.MeshBasicMaterial({ map: cardTex, transparent: true, opacity: 0, toneMapped: false }));
  priceCard.position.set(3.5, 4.4, -176);
  priceCard.rotation.y = -0.12;
  scene.add(priceCard);

  // camera rails
  const keys: { p: number; z: number; y: number; x: number; up: number }[] = [
    { p: 0, z: 40, y: 5, x: 0, up: 2 },
    { p: 0.2, z: -6, y: 3.4, x: 0, up: 1.6 },
    { p: 0.3, z: -32, y: 3.4, x: 0, up: 1.2 },
    { p: 0.5, z: -66, y: 4.4, x: -1.5, up: 3.6 },
    { p: 0.64, z: -92, y: 3.8, x: 0, up: 0.6 },
    { p: 0.78, z: -134, y: 3.4, x: 0, up: 0.3 },
    { p: 0.9, z: -160, y: 3.8, x: 0.5, up: 0.4 },
    { p: 1, z: -165, y: 3.8, x: 1, up: 0.2 },
  ];
  const sample = (p: number) => {
    let i = 0;
    while (i < keys.length - 2 && p > keys[i + 1].p) i += 1;
    const a = keys[i];
    const b = keys[i + 1];
    const k = smooth(0, 1, (p - a.p) / (b.p - a.p));
    return { z: a.z + (b.z - a.z) * k, y: a.y + (b.y - a.y) * k, x: a.x + (b.x - a.x) * k, up: a.up + (b.up - a.up) * k };
  };

  const target = new THREE.Vector3();
  const chipTarget = new THREE.Vector3(12, 5, -84);
  let narrow = false;

  return {
    resize(aspect) {
      narrow = aspect < 1;
      camera.fov = narrow ? 76 : 58;
      camera.updateProjectionMatrix();
    },
    update(p, t) {
      const c = sample(p);
      camera.position.set(c.x + ctx.pointer.x * 0.5, c.y - ctx.pointer.y * 0.25 + Math.sin(t * 1.3) * 0.04, c.z);
      target.set(c.x * 0.4 + ctx.pointer.x * 2.2, c.y + c.up - ctx.pointer.y * 1.0, c.z - 14);
      // lobby: lift the eyes toward the chandelier, then settle back to the corridor
      const lookCh = smooth(0.42, 0.52, p) * (1 - smooth(0.54, 0.62, p));
      target.y += lookCh * 1.6;
      camera.lookAt(target);
      corridorLight.position.set(camera.position.x, 5.6, camera.position.z - 2);

      // fog opens up once we are inside
      (scene.fog as THREE.FogExp2).density = 0.0085 - 0.0062 * smooth(0.18, 0.34, p);
      stars.visible = p < 0.34;

      // doors swing
      const open = smooth(0.74, 0.84, p);
      leaves.forEach(({ pivot, s }) => {
        pivot.rotation.y = s * open * 1.75;
      });

      // chandelier breathes
      chandGlow.material.opacity = 0.75 + Math.sin(t * 3) * 0.1;
      chand.rotation.y = t * 0.12;

      // seven records converge, then settle as one card
      const orbit = smooth(0.36, 0.44, p);
      const merge = smooth(0.5, 0.62, p);
      chips.forEach(({ sp, a }, i) => {
        const r = 6 - i * 0.05;
        const ang = a + t * 0.6;
        const ox = Math.cos(ang) * r;
        const oz = Math.sin(ang) * r;
        const px = ox + 0;
        const py = 8.6 + Math.sin(t + i) * 0.35;
        const pz = chand.position.z + oz;
        sp.position.set(px * (1 - merge) + chipTarget.x * merge, py * (1 - merge) + chipTarget.y * merge, pz * (1 - merge) + chipTarget.z * merge);
        (sp.material as THREE.SpriteMaterial).opacity = orbit * (1 - smooth(0.58, 0.64, p));
        sp.scale.setScalar(2 * (1 - 0.4 * merge));
      });
      (card.material as THREE.MeshBasicMaterial).opacity = smooth(0.58, 0.66, p) * (1 - smooth(0.7, 0.76, p));
      card.rotation.y = -0.35 + Math.sin(t * 0.8) * 0.03;
      (priceCard.material as THREE.MeshBasicMaterial).opacity = smooth(0.9, 0.98, p);
      ctx.setBloom(0.15 * Math.sin(t * 2) + 0.2 * smooth(0.28, 0.34, p));

      // fades: open from black, close to black (card mode loops)
      const end = ctx.mode === "scroll" ? 0 : smooth(0.95, 1, p);
      const startFade = ctx.mode === "scroll" ? 1 - smooth(0, 0.03, p) : 1 - smooth(0, 0.06, p);
      ctx.setFade(Math.max(end, startFade * (ctx.mode === "scroll" ? 0 : 1)), 0x0b0205);
      void narrow;
    },
  };
}

export function mountHotelScene(opts: Pick<Parameters<typeof mountScene>[0], "host" | "mode" | "wrap" | "onProgress" | "loopSeconds">): Handle | null {
  return mountScene({ ...opts, fov: 58, exposure: 0.82, environment: opts.mode === "scroll", envIntensity: 0.16, bloom: { strength: 0.24, radius: 0.55, threshold: 0.96 }, build: hotelBuild });
}
