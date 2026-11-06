import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { canvasTexture, font, type Ctx } from "./kit";

export const slab = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 4, r);

// rounded face with 0..1 UVs, so artwork runs edge to edge with no sticker border
export function faceGeo(w: number, h: number, r: number) {
  const g = roundedRect(w, h, r);
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i += 1) {
    uv[i * 2] = (p.getX(i) + w / 2) / w;
    uv[i * 2 + 1] = (p.getY(i) + h / 2) / h;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

// a thin card with the same artwork on both faces
export function card(ctx: Ctx, w: number, h: number, d: number, r: number, draw: (g: CanvasRenderingContext2D, cw: number, ch: number) => void, edge = 0x2a2a2e) {
  const tex = ctx.track(canvasTexture(Math.round(w * 420), Math.round(h * 420), draw));
  const redraw = () => {
    const cv = tex.image as HTMLCanvasElement;
    const g = cv.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, cv.width, cv.height);
    draw(g, cv.width, cv.height);
    tex.needsUpdate = true;
  };
  document.fonts?.ready.then(redraw);
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.02 });
  const rim = new THREE.MeshStandardMaterial({ color: edge, roughness: 0.45, metalness: 0.3 });
  const m = new THREE.Mesh(slab(w, h, d, r), rim);
  const front = new THREE.Mesh(faceGeo(w - 0.01, h - 0.01, Math.max(r - 0.005, 0.001)), face);
  front.position.z = d / 2 + 0.002;
  m.userData.redraw = redraw;
  const back = front.clone();
  back.rotation.y = Math.PI;
  back.position.z = -(d / 2 + 0.002);
  m.add(front, back);
  return m;
}


export function makeArtefacts(ctx: Ctx) {
  const pass = card(ctx, 3.5, 1.45, 0.03, 0.1, (g, w, h) => {
    const u = h / 100;
    g.fillStyle = "#f6f3ea";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#ece6d6";
    g.fillRect(w * 0.8, 0, w * 0.2, h);
    g.setLineDash([u * 1.6, u * 1.6]);
    g.strokeStyle = "rgba(18,17,14,0.25)";
    g.lineWidth = u * 0.4;
    g.beginPath();
    g.moveTo(w * 0.8, u * 4);
    g.lineTo(w * 0.8, h - u * 4);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "rgba(18,17,14,0.55)";
    g.font = `500 ${u * 6.5}px ${font.mono}`;
    g.fillText("BOARDING PASS", u * 9, u * 16);
    g.fillStyle = "#12110e";
    g.font = `700 ${u * 30}px ${font.display}`;
    g.fillText("BLR", u * 8, u * 56);
    g.fillStyle = "#e8491d";
    g.fillText("→", u * 66, u * 54);
    g.fillStyle = "#12110e";
    g.fillText("GOI", u * 98, u * 56);
    g.fillStyle = "rgba(18,17,14,0.55)";
    g.font = `500 ${u * 6.5}px ${font.mono}`;
    g.fillText("1 ADULT · ECONOMY", u * 9, u * 80);
    for (let i = 0; i < 22; i += 1) {
      g.fillStyle = "#12110e";
      g.fillRect(w * 0.85, u * 12 + i * u * 3.4, i % 3 ? u * 6 : u * 3.4, u * 1.2);
    }
  }, 0xe7e1d2);
  const key2 = card(ctx, 2.3, 1.45, 0.03, 0.1, (g, w, h) => {
    const u = h / 100;
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1d1d22");
    grad.addColorStop(1, "#2c2c33");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(242,239,230,0.55)";
    g.font = `500 ${u * 7}px ${font.mono}`;
    g.fillText("ROOM", u * 9, u * 17);
    g.fillStyle = "#f2efe6";
    g.font = `600 ${u * 34}px ${font.display}`;
    g.fillText("1204", u * 8, u * 56);
    const cg = g.createLinearGradient(0, u * 66, 0, u * 86);
    cg.addColorStop(0, "#cbbf9d");
    cg.addColorStop(1, "#8f8468");
    g.fillStyle = cg;
    g.beginPath();
    g.roundRect(u * 9, u * 66, u * 20, u * 16, u * 2.5);
    g.fill();
    g.fillStyle = "#e8491d";
    g.fillRect(w - u * 30, u * 76, u * 20, u * 0.9);
  }, 0x1d1d22);
  const p99 = card(ctx, 2.9, 1.65, 0.03, 0.1, (g, w, h) => {
    const u = h / 100;
    g.fillStyle = "#121216";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(242,239,230,0.55)";
    g.font = `500 ${u * 6.2}px ${font.mono}`;
    g.fillText("REQUESTS / DAY", u * 9, u * 16);
    g.fillStyle = "#f2efe6";
    g.font = `600 ${u * 30}px ${font.display}`;
    g.fillText("478K+", u * 8, u * 50);
    g.strokeStyle = "#e8491d";
    g.lineWidth = u * 1.1;
    g.lineJoin = "round";
    g.beginPath();
    [[9, 84], [30, 79], [52, 85], [74, 70], [96, 75], [118, 62], [140, 66], [160, 58]].forEach(([x, y], i) => (i ? g.lineTo(x * u, y * u) : g.moveTo(x * u, y * u)));
    g.stroke();
    g.strokeStyle = "rgba(242,239,230,0.12)";
    g.lineWidth = u * 0.3;
    for (let y = 60; y <= 90; y += 10) {
      g.beginPath();
      g.moveTo(u * 9, y * u);
      g.lineTo(w - u * 9, y * u);
      g.stroke();
    }
  }, 0x121216);

  // receipt with a torn edge
  const rs = new THREE.Shape();
  const rw = 1.9;
  const rh = 2.5;
  rs.moveTo(-rw / 2, rh / 2);
  rs.lineTo(rw / 2, rh / 2);
  rs.lineTo(rw / 2, -rh / 2);
  for (let i = 0; i < 16; i += 1) {
    rs.lineTo(rw / 2 - ((i + 0.5) * rw) / 16, -rh / 2 + (i % 2 ? 0 : 0.06));
    rs.lineTo(rw / 2 - ((i + 1) * rw) / 16, -rh / 2 + (i % 2 ? 0.06 : 0));
  }
  rs.lineTo(-rw / 2, rh / 2);
  const rg = new THREE.ShapeGeometry(rs);
  const rp = rg.attributes.position;
  const ruv = new Float32Array(rp.count * 2);
  for (let i = 0; i < rp.count; i += 1) {
    ruv[i * 2] = (rp.getX(i) + rw / 2) / rw;
    ruv[i * 2 + 1] = (rp.getY(i) + rh / 2) / rh;
  }
  rg.setAttribute("uv", new THREE.BufferAttribute(ruv, 2));
  const paintReceipt = (g: CanvasRenderingContext2D, w: number) => {
    const u = w / 100;
    g.fillStyle = "#f8f6f0";
    g.fillRect(0, 0, w, w * 2);
    g.fillStyle = "rgba(18,17,14,0.5)";
    g.font = `500 ${u * 5.6}px ${font.mono}`;
    g.fillText("ORDER", u * 10, u * 16);
    g.fillStyle = "#12110e";
    g.font = `500 ${u * 8}px ${font.sans}`;
    const row = (a: string, b: string, y: number) => {
      g.fillText(a, u * 10, y * u);
      g.fillText(b, w - u * 10 - g.measureText(b).width, y * u);
    };
    row("Biryani", "₹329", 38);
    row("Raita", "₹49", 52);
    g.strokeStyle = "rgba(18,17,14,0.22)";
    g.lineWidth = u * 0.3;
    g.setLineDash([u * 1.4, u * 1.2]);
    g.beginPath();
    g.moveTo(u * 10, u * 64);
    g.lineTo(w - u * 10, u * 64);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#e8491d";
    g.font = `600 ${u * 10}px ${font.display}`;
    row("Best", "₹342", 82);
  };
  const rtex = ctx.track(canvasTexture(760, 1000, (g, w) => paintReceipt(g, w)));
  document.fonts?.ready.then(() => {
    const g = (rtex.image as HTMLCanvasElement).getContext("2d");
    if (!g) return;
    paintReceipt(g, (rtex.image as HTMLCanvasElement).width);
    rtex.needsUpdate = true;
  });
  const receipt = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: rtex, roughness: 0.92, side: THREE.DoubleSide }));

  return { pass, key: key2, p99, receipt };
}

export function makeBrowser(ctx: Ctx, imageUrl: string, host: string) {
  const g = new THREE.Group();
  const W = 3.5;
  const H = 2.45;
  const barH = 0.2;
  const frame = new THREE.Mesh(
    slab(W + 0.06, H + 0.06, 0.07, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x1c1d22, roughness: 0.32, metalness: 0.55 })
  );

  const bar = new THREE.Mesh(
    new THREE.PlaneGeometry(W, barH),
    new THREE.MeshBasicMaterial({
      map: ctx.track(canvasTexture(2048, Math.round((2048 * barH) / W), (c, w, h) => {
        c.fillStyle = "#26272d";
        c.fillRect(0, 0, w, h);
        ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
          c.fillStyle = col;
          c.beginPath();
          c.arc(44 + i * 38, h / 2, 11, 0, Math.PI * 2);
          c.fill();
        });
        const pw = 760;
        const px = (w - pw) / 2;
        c.fillStyle = "rgba(255,255,255,0.08)";
        c.beginPath();
        c.roundRect(px, h * 0.2, pw, h * 0.6, h * 0.3);
        c.fill();
        c.fillStyle = "rgba(255,255,255,0.78)";
        c.font = "500 34px -apple-system, 'Helvetica Neue', Arial, sans-serif";
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillText(host, w / 2, h / 2 + 1);
      }))
    })
  );
  bar.position.set(0, H / 2 - barH / 2, 0.037);

  const sh = H - barH;
  const shot = new THREE.MeshBasicMaterial({ color: 0x2a2b31 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(W, sh), shot);
  screen.position.set(0, -barH / 2, 0.037);
  new THREE.TextureLoader().load(imageUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
    // cover-fit, anchored to the top like a real page
    const img = t.image as { width: number; height: number };
    const a = img.width / img.height;
    const target = W / sh;
    if (a > target) {
      t.repeat.set(target / a, 1);
      t.offset.set((1 - target / a) / 2, 0);
    } else {
      t.repeat.set(1, a / target);
      t.offset.set(0, 1 - a / target);
    }
    shot.map = t;
    shot.color.set(0xffffff);
    shot.needsUpdate = true;
  });

  const live = new THREE.Mesh(
    new THREE.PlaneGeometry(0.46, 0.16),
    new THREE.MeshBasicMaterial({
      map: ctx.track(canvasTexture(460, 160, (c, w, h) => {
        c.fillStyle = "rgba(16,17,22,0.82)";
        c.beginPath();
        c.roundRect(0, 0, w, h, h / 2);
        c.fill();
        c.fillStyle = "#3ddc84";
        c.beginPath();
        c.arc(58, h / 2, 14, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fff";
        c.font = "600 62px -apple-system, 'Helvetica Neue', Arial, sans-serif";
        c.textBaseline = "middle";
        c.fillText("Live", 100, h / 2 + 2);
      })),
      transparent: true,
    })
  );
  live.position.set(W / 2 - 0.36, -H / 2 + 0.2, 0.04);
  g.add(frame, bar, screen, live);
  return g;
}

// soft contact shadow, pre-blurred once on a canvas
export function softShadow(ctx: Ctx, w: number, h: number) {
  const pad = 0.6;
  const tex = ctx.track(canvasTexture(512, Math.round((512 * (h + pad * 2)) / (w + pad * 2)), (c, cw) => {
    const k = cw / (w + pad * 2);
    c.filter = `blur(${Math.round(k * 0.22)}px)`;
    c.fillStyle = "rgba(30,20,14,1)";
    c.beginPath();
    c.roundRect(pad * k, pad * k, w * k, h * k, 0.15 * k);
    c.fill();
  }));
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w + pad * 2, h + pad * 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.3, depthWrite: false })
  );
}

export function roundedRect(w: number, h: number, r: number) {
  const sh = new THREE.Shape();
  sh.moveTo(-w / 2 + r, -h / 2);
  sh.lineTo(w / 2 - r, -h / 2);
  sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  sh.lineTo(w / 2, h / 2 - r);
  sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  sh.lineTo(-w / 2 + r, h / 2);
  sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  sh.lineTo(-w / 2, -h / 2 + r);
  sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return new THREE.ShapeGeometry(sh, 8);
}
