export type ChartItem = {
  id: string;
  no: number;
  kind: "tile" | "metric";
  href: string;
  title: string;
  sub: string;
  poster?: string;
  value?: string;
};

export type ChartHover = { item: ChartItem; x: number; y: number } | null;

type Obj = { item: ChartItem; a: number; r: number; thumb?: HTMLCanvasElement; w: number; h: number; sx: number; sy: number };

const INK = "#1e1a2b";
const LAV = "201,191,227";
const PEACH = "#e8b9a6";

function mulberry(a: number) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A slow-turning star map drawn in a round window; works sit on it as catalogued objects.
export class StarChart {
  private ctx: CanvasRenderingContext2D;
  private objs: Obj[] = [];
  private stars: { a: number; r: number; m: number }[] = [];
  private rot = 0;
  private raf = 0;
  private last = 0;
  private visible = true;
  private size = 0;
  private dpr = 2;
  private hot: Obj | null = null;
  private forced: string | null = null;
  private ptr: { x: number; y: number } | null = null;
  private off: (() => void)[] = [];
  private mono = "monospace";

  constructor(private canvas: HTMLCanvasElement, items: ChartItem[], private still: boolean, private cb: { onHover: (h: ChartHover) => void; onSelect: (i: ChartItem) => void }) {
    this.ctx = canvas.getContext("2d")!;
    this.mono = getComputedStyle(document.documentElement).getPropertyValue("--f-dm-mono").trim() || "monospace";
    const rand = mulberry(11);
    for (let i = 0; i < 420; i++) this.stars.push({ a: rand() * Math.PI * 2, r: Math.sqrt(rand()) * 0.98, m: rand() });
    const tiles = items.filter((i) => i.kind === "tile");
    const metrics = items.filter((i) => i.kind === "metric");
    tiles.forEach((item, i) => this.objs.push({ item, a: (i / tiles.length) * Math.PI * 2 + 0.2, r: i % 2 ? 0.74 : 0.56, w: 0.15, h: 0.095, sx: 0, sy: 0 }));
    metrics.forEach((item, i) => this.objs.push({ item, a: (i / metrics.length) * Math.PI * 2 + 0.55, r: i % 2 ? 0.34 : 0.22, w: 0.03, h: 0.03, sx: 0, sy: 0 }));
    this.objs.forEach((o) => {
      if (!o.item.poster) return;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 320;
        c.height = Math.round((320 * img.height) / img.width);
        const g = c.getContext("2d")!;
        g.filter = "grayscale(0.85) contrast(1.05)";
        g.drawImage(img, 0, 0, c.width, c.height);
        g.filter = "none";
        g.globalCompositeOperation = "multiply";
        g.fillStyle = "#c9bfe3";
        g.fillRect(0, 0, c.width, c.height);
        o.thumb = c;
        o.h = Math.min(o.w * (c.height / c.width), 0.16);
        this.draw();
      };
      img.src = o.item.poster;
    });
    this.bind();
    this.resize();
    if (!still) this.loop(performance.now());
  }

  private bind() {
    const c = this.canvas;
    const ro = new ResizeObserver(() => this.resize());
    ro.observe(c);
    const io = new IntersectionObserver(([e]) => {
      this.visible = e.isIntersecting;
      if (this.visible && !this.still && !this.raf) this.loop(performance.now());
    });
    io.observe(c);
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      this.ptr = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
      this.pick();
    };
    const leave = () => {
      this.ptr = null;
      this.pick();
    };
    const click = (e: MouseEvent) => {
      move(e as PointerEvent);
      if (this.hot) this.cb.onSelect(this.hot.item);
    };
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerleave", leave);
    c.addEventListener("click", click);
    this.off.push(() => {
      ro.disconnect();
      io.disconnect();
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerleave", leave);
      c.removeEventListener("click", click);
    });
  }

  highlight(id: string | null) {
    this.forced = id;
    this.draw();
  }

  private pick() {
    let hit: Obj | null = null;
    if (this.ptr) {
      for (const o of this.objs) {
        const pad = o.item.kind === "metric" ? 0.035 : 0.01;
        if (Math.abs(this.ptr.x - o.sx) < o.w / 2 + pad && Math.abs(this.ptr.y - o.sy) < o.h / 2 + pad) hit = o;
      }
    }
    if (hit !== this.hot) {
      this.hot = hit;
      this.canvas.style.cursor = hit ? "pointer" : "";
      this.draw();
    }
    if (hit) {
      const r = this.canvas.getBoundingClientRect();
      this.cb.onHover({ item: hit.item, x: r.left + hit.sx * r.width, y: r.top + (hit.sy - hit.h / 2) * r.height });
    } else this.cb.onHover(null);
  }

  private resize() {
    const s = this.canvas.clientWidth;
    if (!s) return;
    this.dpr = Math.max(1.5, Math.min(window.devicePixelRatio || 1, 2.5));
    this.size = s;
    this.canvas.width = Math.round(s * this.dpr);
    this.canvas.height = Math.round(s * this.dpr);
    this.draw();
  }

  private loop = (now: number) => {
    if (!this.visible || document.hidden) {
      this.raf = 0;
      if (document.hidden) {
        const resume = () => {
          document.removeEventListener("visibilitychange", resume);
          if (!this.raf) this.loop(performance.now());
        };
        document.addEventListener("visibilitychange", resume);
      }
      return;
    }
    const dt = Math.min((now - (this.last || now)) / 1000, 0.05);
    this.last = now;
    if (!this.hot && !this.forced) this.rot += dt * 0.012;
    this.draw();
    if (this.hot) this.pick();
    this.raf = requestAnimationFrame(this.loop);
  };

  private draw() {
    const { ctx: g, size } = this;
    if (!size) return;
    const S = size * this.dpr;
    const R = S / 2;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, S, S);
    g.save();
    g.beginPath();
    g.arc(R, R, R, 0, Math.PI * 2);
    g.clip();
    g.fillStyle = INK;
    g.fillRect(0, 0, S, S);
    g.translate(R, R);
    g.strokeStyle = `rgba(${LAV},0.16)`;
    g.lineWidth = this.dpr * 0.75;
    for (let k = 1; k <= 4; k++) {
      g.beginPath();
      g.arc(0, 0, (R * k) / 4.2, 0, Math.PI * 2);
      g.stroke();
    }
    for (let k = 0; k < 12; k++) {
      const a = this.rot + (k * Math.PI) / 6;
      g.beginPath();
      g.moveTo(Math.cos(a) * R * 0.08, Math.sin(a) * R * 0.08);
      g.lineTo(Math.cos(a) * R, Math.sin(a) * R);
      g.stroke();
    }
    for (const s of this.stars) {
      const a = s.a + this.rot;
      g.fillStyle = s.m > 0.93 ? "#f4f1f8" : `rgba(${LAV},${0.35 + s.m * 0.4})`;
      const sz = (s.m > 0.93 ? 1.6 : 0.5 + s.m * 0.8) * this.dpr;
      g.beginPath();
      g.arc(Math.cos(a) * s.r * R, Math.sin(a) * s.r * R, sz, 0, Math.PI * 2);
      g.fill();
    }
    g.font = `${10 * this.dpr}px ${this.mono}`;
    g.textAlign = "center";
    for (const o of this.objs) {
      const a = o.a + this.rot;
      const x = Math.cos(a) * o.r * R;
      const y = Math.sin(a) * o.r * R;
      o.sx = 0.5 + x / S;
      o.sy = 0.5 + y / S;
      const on = this.hot === o || this.forced === o.item.id;
      if (o.item.kind === "tile") {
        const w = o.w * S;
        const h = o.h * S;
        if (o.thumb) g.drawImage(o.thumb, x - w / 2, y - h / 2, w, h);
        else {
          g.fillStyle = `rgba(${LAV},0.2)`;
          g.fillRect(x - w / 2, y - h / 2, w, h);
        }
        g.strokeStyle = on ? PEACH : `rgba(${LAV},0.7)`;
        g.lineWidth = (on ? 2 : 1) * this.dpr;
        g.strokeRect(x - w / 2, y - h / 2, w, h);
        g.fillStyle = on ? PEACH : `rgba(${LAV},0.85)`;
        g.fillText(String(o.item.no).padStart(2, "0"), x, y + h / 2 + 13 * this.dpr);
      } else {
        const k = (on ? 9 : 6) * this.dpr;
        g.strokeStyle = on ? PEACH : "#f4f1f8";
        g.lineWidth = this.dpr;
        g.beginPath();
        g.moveTo(x - k, y);
        g.lineTo(x + k, y);
        g.moveTo(x, y - k);
        g.lineTo(x, y + k);
        g.stroke();
        g.fillStyle = on ? PEACH : "#f4f1f8";
        g.beginPath();
        g.arc(x, y, 2.2 * this.dpr, 0, Math.PI * 2);
        g.fill();
        if (on) {
          g.beginPath();
          g.arc(x, y, 14 * this.dpr, 0, Math.PI * 2);
          g.stroke();
        }
        g.fillStyle = on ? PEACH : `rgba(${LAV},0.85)`;
        g.fillText(String(o.item.no).padStart(2, "0"), x, y + 20 * this.dpr);
      }
    }
    g.restore();
  }

  dispose() {
    cancelAnimationFrame(this.raf);
    this.off.forEach((f) => f());
  }
}
