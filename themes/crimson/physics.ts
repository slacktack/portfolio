// Verlet boxes with SAT contacts. Each body is 4 corner points held rigid by 6 sticks.
export type Pt = { x: number; y: number; ox: number; oy: number };
export type Body = { id: string; p: Pt[]; w: number; h: number; im: number; sticks: [number, number, number][] };
type Grab = { b: Body; u: number; v: number; tx: number; ty: number };

const G = 0.55;
const DAMP = 0.992;
const ITER = 10;
const VMAX = 48;

export class World {
  bodies: Body[] = [];
  W = 800;
  H = 600;
  grab: Grab | null = null;
  quiet = 0;

  add(id: string, cx: number, cy: number, w: number, h: number, a = 0, vx = 0, vy = 0, im = 1) {
    const c = Math.cos(a);
    const s = Math.sin(a);
    const corner = (lx: number, ly: number): Pt => {
      const x = cx + lx * c - ly * s;
      const y = cy + lx * s + ly * c;
      return { x, y, ox: x - vx, oy: y - vy };
    };
    const p = [corner(-w / 2, -h / 2), corner(w / 2, -h / 2), corner(w / 2, h / 2), corner(-w / 2, h / 2)];
    const d = Math.hypot(w, h);
    const sticks: [number, number, number][] = [
      [0, 1, w], [1, 2, h], [2, 3, w], [3, 0, h], [0, 2, d], [1, 3, d],
    ];
    const b: Body = { id, p, w, h, im, sticks };
    this.bodies.push(b);
    this.quiet = 0;
    return b;
  }

  remove(id: string) {
    this.bodies = this.bodies.filter((b) => b.id !== id);
    if (this.grab?.b.id === id) this.grab = null;
  }

  get(id: string) {
    return this.bodies.find((b) => b.id === id);
  }

  pose(b: Body) {
    const [a, c, , d] = b.p;
    const cx = (b.p[0].x + b.p[1].x + b.p[2].x + b.p[3].x) / 4;
    const cy = (b.p[0].y + b.p[1].y + b.p[2].y + b.p[3].y) / 4;
    const ang = Math.atan2(c.y - a.y + (b.p[2].y - d.y), c.x - a.x + (b.p[2].x - d.x));
    return { cx, cy, ang };
  }

  hit(b: Body, x: number, y: number) {
    const [a, c, , d] = b.p;
    const ex = c.x - a.x;
    const ey = c.y - a.y;
    const fx = d.x - a.x;
    const fy = d.y - a.y;
    const u = ((x - a.x) * ex + (y - a.y) * ey) / (ex * ex + ey * ey);
    const v = ((x - a.x) * fx + (y - a.y) * fy) / (fx * fx + fy * fy);
    return { u: Math.min(1, Math.max(0, u)), v: Math.min(1, Math.max(0, v)) };
  }

  startGrab(b: Body, x: number, y: number) {
    const { u, v } = this.hit(b, x, y);
    this.grab = { b, u, v, tx: x, ty: y };
    this.quiet = 0;
  }

  push(b: Body, vx: number, vy: number, spin = 0) {
    const { cx, cy } = this.pose(b);
    for (const q of b.p) {
      q.ox -= vx - (q.y - cy) * spin;
      q.oy -= vy + (q.x - cx) * spin;
    }
    this.quiet = 0;
  }

  awake() {
    return this.quiet < 90 || !!this.grab;
  }

  step() {
    let energy = 0;
    for (const b of this.bodies) {
      for (const q of b.p) {
        let vx = (q.x - q.ox) * DAMP;
        let vy = (q.y - q.oy) * DAMP + G;
        const sp = Math.hypot(vx, vy);
        if (sp > VMAX) {
          vx *= VMAX / sp;
          vy *= VMAX / sp;
        }
        energy = Math.max(energy, Math.abs(q.x - q.ox) + Math.abs(q.y - q.oy));
        q.ox = q.x;
        q.oy = q.y;
        q.x += vx;
        q.y += vy;
      }
    }
    for (let i = 0; i < ITER; i++) {
      for (const b of this.bodies) this.sticks(b);
      if (this.grab) this.pull(this.grab);
      this.collide(i === 0);
      this.bounds(i === ITER - 1);
    }
    this.quiet = energy < 0.12 ? this.quiet + 1 : 0;
  }

  private sticks(b: Body) {
    for (const [i, j, len] of b.sticks) {
      const a = b.p[i];
      const c = b.p[j];
      const dx = c.x - a.x;
      const dy = c.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      const k = ((d - len) / d) * 0.5;
      a.x += dx * k;
      a.y += dy * k;
      c.x -= dx * k;
      c.y -= dy * k;
    }
  }

  private pull(g: Grab) {
    const { u, v } = g;
    const w = [(1 - u) * (1 - v), u * (1 - v), u * v, (1 - u) * v];
    let px = 0;
    let py = 0;
    let s = 0;
    g.b.p.forEach((q, i) => {
      px += q.x * w[i];
      py += q.y * w[i];
      s += w[i] * w[i];
    });
    const dx = (g.tx - px) / s;
    const dy = (g.ty - py) / s;
    g.b.p.forEach((q, i) => {
      q.x += dx * w[i];
      q.y += dy * w[i];
    });
  }

  private bounds(friction: boolean) {
    const { W, H } = this;
    for (const b of this.bodies) {
      for (const q of b.p) {
        if (q.y > H) {
          q.y = H;
          if (friction) {
            q.ox = q.x - (q.x - q.ox) * 0.55;
            q.oy = q.y + (q.y - q.oy) * 0.2;
          }
        }
        if (q.x < 0) {
          q.x = 0;
          if (friction) q.ox = q.x + (q.x - q.ox) * 0.4;
        } else if (q.x > W) {
          q.x = W;
          if (friction) q.ox = q.x + (q.x - q.ox) * 0.4;
        }
        if (q.y < -H * 1.5) q.y = -H * 1.5;
      }
    }
  }

  private collide(friction: boolean) {
    const bs = this.bodies;
    for (let i = 0; i < bs.length; i++) {
      const A = bs[i];
      const ba = box(A);
      for (let j = i + 1; j < bs.length; j++) {
        const B = bs[j];
        const bb = box(B);
        if (ba[0] > bb[2] || bb[0] > ba[2] || ba[1] > bb[3] || bb[1] > ba[3]) continue;
        this.sat(A, B, friction);
      }
    }
  }

  private sat(A: Body, B: Body, friction: boolean) {
    let depth = Infinity;
    let nx = 0;
    let ny = 0;
    let eb: Body = A;
    let e0 = 0;
    for (const body of [A, B]) {
      for (let k = 0; k < 4; k++) {
        const p = body.p[k];
        const q = body.p[(k + 1) % 4];
        let ax = p.y - q.y;
        let ay = q.x - p.x;
        const l = Math.hypot(ax, ay) || 1e-6;
        ax /= l;
        ay /= l;
        const [a0, a1] = proj(A, ax, ay);
        const [b0, b1] = proj(B, ax, ay);
        const d = a0 < b0 ? b0 - a1 : a0 - b1;
        if (d > 0) return;
        if (-d < depth) {
          depth = -d;
          nx = ax;
          ny = ay;
          eb = body;
          e0 = k;
        }
      }
    }
    const vb = eb === A ? B : A;
    const ca = centre(vb);
    const cb = centre(eb);
    if (nx * (ca.x - cb.x) + ny * (ca.y - cb.y) < 0) {
      nx = -nx;
      ny = -ny;
    }
    let V = vb.p[0];
    let md = Infinity;
    for (const q of vb.p) {
      const d = nx * (q.x - cb.x) + ny * (q.y - cb.y);
      if (d < md) {
        md = d;
        V = q;
      }
    }
    const E1 = eb.p[e0];
    const E2 = eb.p[(e0 + 1) % 4];
    const cvx = nx * depth;
    const cvy = ny * depth;
    let t =
      Math.abs(E1.x - E2.x) > Math.abs(E1.y - E2.y)
        ? (V.x - cvx - E1.x) / (E2.x - E1.x)
        : (V.y - cvy - E1.y) / (E2.y - E1.y);
    t = Math.min(1, Math.max(0, t));
    const lam = 1 / (t * t + (1 - t) * (1 - t));
    const gv = this.grab?.b === vb ? 0.15 : vb.im;
    const ge = this.grab?.b === eb ? 0.15 : eb.im;
    const fv = gv / (gv + ge);
    const fe = ge / (gv + ge);
    E1.x -= cvx * (1 - t) * fe * lam;
    E1.y -= cvy * (1 - t) * fe * lam;
    E2.x -= cvx * t * fe * lam;
    E2.y -= cvy * t * fe * lam;
    V.x += cvx * fv;
    V.y += cvy * fv;
    if (friction) {
      const tx = -ny;
      const ty = nx;
      const rvx = V.x - V.ox - ((E1.x - E1.ox) * (1 - t) + (E2.x - E2.ox) * t);
      const rvy = V.y - V.oy - ((E1.y - E1.oy) * (1 - t) + (E2.y - E2.oy) * t);
      const vt = (rvx * tx + rvy * ty) * 0.35;
      V.ox += tx * vt * fv;
      V.oy += ty * vt * fv;
      E1.ox -= tx * vt * fe * (1 - t);
      E1.oy -= ty * vt * fe * (1 - t);
      E2.ox -= tx * vt * fe * t;
      E2.oy -= ty * vt * fe * t;
    }
  }
}

function proj(b: Body, ax: number, ay: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const q of b.p) {
    const d = q.x * ax + q.y * ay;
    if (d < lo) lo = d;
    if (d > hi) hi = d;
  }
  return [lo, hi];
}

function centre(b: Body) {
  return { x: (b.p[0].x + b.p[1].x + b.p[2].x + b.p[3].x) / 4, y: (b.p[0].y + b.p[1].y + b.p[2].y + b.p[3].y) / 4 };
}

function box(b: Body) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const q of b.p) {
    if (q.x < x0) x0 = q.x;
    if (q.y < y0) y0 = q.y;
    if (q.x > x1) x1 = q.x;
    if (q.y > y1) y1 = q.y;
  }
  return [x0, y0, x1, y1];
}
