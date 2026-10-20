"use client";

import { useEffect, useRef } from "react";

const vert = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uScroll;
uniform float uNight;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + vec2(7.1, 3.3); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * uAspect, uv.y);
  float y = uv.y + uScroll * 0.08;

  vec3 top = mix(vec3(0.33, 0.56, 0.86), vec3(0.04, 0.06, 0.18), uNight);
  vec3 mid = mix(vec3(0.93, 0.70, 0.62), vec3(0.22, 0.16, 0.34), uNight);
  vec3 low = mix(vec3(0.98, 0.90, 0.80), vec3(0.09, 0.09, 0.14), uNight);
  vec3 col = mix(low, mid, smoothstep(0.05, 0.5, y));
  col = mix(col, top, smoothstep(0.45, 1.0, y));

  vec2 q = p * vec2(1.3, 2.6) + vec2(uTime * 0.012, uScroll * 0.1);
  vec2 warp = vec2(fbm(q * 0.8 + uTime * 0.01), fbm(q * 0.8 + 4.0));
  float f = fbm(q + warp * 1.3);
  float f2 = fbm(q + vec2(0.05, -0.07) + warp * 1.3);

  float body = smoothstep(0.46, 0.50, f);
  float inner = smoothstep(0.50, 0.78, f);
  float rim = clamp((f - f2) * 9.0 + 0.5, 0.0, 1.0);
  float band = smoothstep(0.05, 0.95, y);

  vec3 shadow = mix(vec3(0.62, 0.68, 0.88), vec3(0.20, 0.20, 0.36), uNight);
  vec3 light = mix(vec3(1.0, 0.95, 0.90), vec3(0.55, 0.50, 0.70), uNight);
  vec3 warmEdge = mix(vec3(1.0, 0.78, 0.66), vec3(0.8, 0.5, 0.6), uNight);
  vec3 cloud = mix(shadow, light, inner);
  cloud = mix(cloud, warmEdge, rim * (1.0 - inner) * 0.7);

  col = mix(col, cloud, body * band * 0.96);

  float sun = pow(max(0.0, 1.0 - length((uv - vec2(0.16, 0.1)) * vec2(1.0 / 1.0, 1.0)) * 1.3), 3.0);
  col += mix(vec3(1.0, 0.72, 0.52), vec3(0.6, 0.35, 0.6), uNight) * sun * 0.34;

  float g = hash(gl_FragCoord.xy + uTime) - 0.5;
  col += g * 0.025;
  gl_FragColor = vec4(col, 1.0);
}
`;

export function SkyShader() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    let dispose = () => {};

    const boot = async () => {
      const THREE = await import("three");
      const host = hostRef.current;
      if (!host || stopped) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
      } catch {
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.domElement.className = "skyx-canvas";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const isNight = () => (document.documentElement.dataset.theme === "night" ? 1 : 0);
      const material = new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: host.clientWidth / Math.max(host.clientHeight, 1) },
          uScroll: { value: 0 },
          uNight: { value: isNight() },
        },
      });
      const geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));

      const resize = () => {
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        material.uniforms.uAspect.value = w / h;
        if (reduce) renderer.render(scene, camera);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      let visible = true;
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
      });
      io.observe(host);

      let scroll = 0;
      const onScroll = () => {
        scroll = Math.min(window.scrollY / Math.max(host.clientHeight, 1), 1.5);
      };
      window.addEventListener("scroll", onScroll, { passive: true });

      const theme = new MutationObserver(() => {
        material.uniforms.uNight.value = isNight();
        if (reduce) renderer.render(scene, camera);
      });
      theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

      const start = performance.now();
      const frame = () => {
        raf = requestAnimationFrame(frame);
        if (!visible || document.hidden) return;
        material.uniforms.uTime.value = (performance.now() - start) / 1000 + 20;
        material.uniforms.uScroll.value += (scroll - material.uniforms.uScroll.value) * 0.08;
        renderer.render(scene, camera);
      };
      if (reduce) {
        material.uniforms.uTime.value = 24;
        renderer.render(scene, camera);
      } else {
        frame();
      }

      dispose = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("scroll", onScroll);
        ro.disconnect();
        io.disconnect();
        theme.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    boot();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  return <div ref={hostRef} className="skyx-bg" aria-hidden="true" />;
}
