import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { canvasTexture, type Ctx } from "./kit";

export const slab = (w: number, h: number, d: number, r: number) => new RoundedBoxGeometry(w, h, d, 4, r);

// a thin card with the same artwork on both faces
export function card(ctx: Ctx, w: number, h: number, d: number, r: number, draw: (g: CanvasRenderingContext2D, cw: number, ch: number) => void, edge = 0xfffdf6) {
  const tex = ctx.track(canvasTexture(Math.round(w * 340), Math.round(h * 340), draw));
  const redraw = () => {
    const cv = tex.image as HTMLCanvasElement;
    const g = cv.getContext("2d");
    if (!g) return;
    g.clearRect(0, 0, cv.width, cv.height);
    draw(g, cv.width, cv.height);
    tex.needsUpdate = true;
  };
  const face = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.42, metalness: 0.05 });
  const rim = new THREE.MeshStandardMaterial({ color: edge, roughness: 0.5 });
  const m = new THREE.Mesh(slab(w, h, d, r), rim);
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.12, h - 0.12), face);
  front.position.z = d / 2 + 0.002;
  m.userData.redraw = redraw;
  const back = front.clone();
  back.rotation.y = Math.PI;
  back.position.z = -(d / 2 + 0.002);
  m.add(front, back);
  return m;
}


export function makeArtefacts(ctx: Ctx) {
  const pass = card(ctx, 3.5, 1.45, 0.07, 0.14, (g, w, h) => {
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#efe6d2";
    g.fillRect(w * 0.82, 0, w * 0.18, h);
    g.setLineDash([8, 8]);
    g.strokeStyle = "#cfc8b8";
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(w * 0.82, 10);
    g.lineTo(w * 0.82, h - 10);
    g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#6b6860";
    g.font = "600 22px 'Courier New', monospace";
    g.fillText("BOARDING PASS", 34, 52);
    g.fillStyle = "#12110e";
    g.font = "800 84px system-ui, sans-serif";
    g.fillText("BLR", 34, 150);
    g.fillStyle = "#d3281b";
    g.fillText("→", 238, 148);
    g.fillStyle = "#12110e";
    g.fillText("GOI", 330, 150);
    g.fillStyle = "#6b6860";
    g.font = "500 24px 'Courier New', monospace";
    g.fillText("1 adult · 17 sources", 34, 208);
    for (let i = 0; i < 18; i += 1) {
      g.fillStyle = "#12110e";
      g.fillRect(w * 0.87, 40 + i * 12.5, i % 3 ? 22 : 12, 5);
    }
  });
  const key2 = card(ctx, 2.3, 1.45, 0.06, 0.14, (g, w, h) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1d2a4a");
    grad.addColorStop(1, "#2f4b86");
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,255,255,0.65)";
    g.font = "600 24px 'Courier New', monospace";
    g.fillText("ROOM", 30, 54);
    g.fillStyle = "#fff";
    g.font = "800 100px system-ui, sans-serif";
    g.fillText("1204", 28, 170);
    const cg = g.createLinearGradient(30, 210, 100, 260);
    cg.addColorStop(0, "#e8c56d");
    cg.addColorStop(1, "#b8953c");
    g.fillStyle = cg;
    g.fillRect(30, 215, 78, 56);
  }, 0xfffdf6);
  const p99 = card(ctx, 2.9, 1.65, 0.08, 0.2, (g, w, h) => {
    g.fillStyle = "#12110e";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "rgba(255,247,238,0.6)";
    g.font = "600 22px 'Courier New', monospace";
    g.fillText("REQUESTS / DAY", 30, 54);
    g.fillStyle = "#fff7ee";
    g.font = "800 112px system-ui, sans-serif";
    g.fillText("478K+", 28, 170);
    g.strokeStyle = "#f0b27a";
    g.lineWidth = 6;
    g.lineJoin = "round";
    g.beginPath();
    [[30, 300], [120, 280], [210, 305], [300, 250], [390, 268], [480, 220], [570, 238]].forEach(([x, y], i) => (i ? g.lineTo(x, y - 30) : g.moveTo(x, y - 30)));
    g.stroke();
  }, 0xd8a948);

  // receipt with a torn edge
  const rs = new THREE.Shape();
  const rw = 1.9;
  const rh = 2.5;
  rs.moveTo(-rw / 2, rh / 2);
  rs.lineTo(rw / 2, rh / 2);
  rs.lineTo(rw / 2, -rh / 2);
  for (let i = 0; i < 8; i += 1) {
    rs.lineTo(rw / 2 - ((i + 0.5) * rw) / 8, -rh / 2 + (i % 2 ? 0 : 0.14));
    rs.lineTo(rw / 2 - ((i + 1) * rw) / 8, -rh / 2 + (i % 2 ? 0.14 : 0));
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
  const rtex = ctx.track(canvasTexture(380, 500, (g, w, h) => {
    g.fillStyle = "#fffdf6";
    g.fillRect(0, 0, w, h);
    g.fillStyle = "#6b6860";
    g.font = "600 24px 'Courier New', monospace";
    g.fillText("ORDER", 36, 60);
    g.fillStyle = "#12110e";
    g.font = "500 34px system-ui, sans-serif";
    g.fillText("Biryani", 36, 140);
    g.fillText("₹329", w - 36 - g.measureText("₹329").width, 140);
    g.fillText("Raita", 36, 200);
    g.fillText("₹49", w - 36 - g.measureText("₹49").width, 200);
    g.setLineDash([8, 7]);
    g.strokeStyle = "#b9b2a2";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(36, 250);
    g.lineTo(w - 36, 250);
    g.stroke();
    g.fillStyle = "#d3281b";
    g.font = "800 40px system-ui, sans-serif";
    g.fillText("Best", 36, 320);
    g.fillText("₹342", w - 36 - g.measureText("₹342").width, 320);
  }));
  const receipt = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: rtex, roughness: 0.9, side: THREE.DoubleSide }));
  receipt.castShadow = true;


  return { pass, key: key2, p99, receipt };
}

export function makeBrowser(ctx: Ctx, imageUrl: string, host: string) {
  const g = new THREE.Group();
  const W = 3.5;
  const H = 2.45;
  const ring = new THREE.Mesh(slab(W + 0.18, H + 0.18, 0.1, 0.2), new THREE.MeshStandardMaterial({ color: 0xd3281b, roughness: 0.5 }));
  const body = new THREE.Mesh(slab(W, H, 0.16, 0.16), new THREE.MeshStandardMaterial({ color: 0xfffdf6, roughness: 0.55 }));
  body.position.z = 0.03;
  const bar = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.2, 0.22),
    new THREE.MeshBasicMaterial({
      map: ctx.track(canvasTexture(1536, 96, (c, w, h) => {
        c.fillStyle = "#fffdf6";
        c.fillRect(0, 0, w, h);
        ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => {
          c.fillStyle = col;
          c.beginPath();
          c.arc(54 + i * 66, h / 2, 18, 0, Math.PI * 2);
          c.fill();
        });
      })),
    })
  );
  bar.position.set(0, H / 2 - 0.2, 0.115);
  const sw = W - 0.24;
  const shot = new THREE.MeshBasicMaterial({ color: 0xd9d4c6 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(sw, sw / 1.6), shot);
  screen.position.set(0, -0.14, 0.115);
  new THREE.TextureLoader().load(imageUrl, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = ctx.renderer.capabilities.getMaxAnisotropy();
    shot.map = t;
    shot.color.set(0xffffff);
    shot.needsUpdate = true;
  });
  const tape = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.36),
    new THREE.MeshBasicMaterial({
      map: ctx.track(canvasTexture(1536, 222, (c, w, h) => {
        c.fillStyle = "#f6df8a";
        c.fillRect(0, 0, w, h);
        c.fillStyle = "#4a3b10";
        c.font = "600 90px 'Courier New', monospace";
        c.fillText(host, 54, 144);
      })),
      transparent: true,
    })
  );
  tape.position.set(-0.5, H / 2 + 0.08, 0.14);
  tape.rotation.z = 0.045;
  const live = new THREE.Mesh(
    new THREE.PlaneGeometry(0.62, 0.22),
    new THREE.MeshBasicMaterial({
      map: ctx.track(canvasTexture(372, 132, (c, w, h) => {
        c.fillStyle = "rgba(10,12,20,0.78)";
        c.beginPath();
        c.roundRect(0, 0, w, h, 22);
        c.fill();
        c.fillStyle = "#4ade80";
        c.beginPath();
        c.arc(72, h / 2, 21, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = "#fff";
        c.font = "700 66px system-ui, sans-serif";
        c.fillText("LIVE", 126, 90);
      })),
      transparent: true,
    })
  );
  live.position.set(W / 2 - 0.5, -H / 2 + 0.3, 0.13);
  g.add(ring, body, bar, screen, tape, live);
  return g;
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
