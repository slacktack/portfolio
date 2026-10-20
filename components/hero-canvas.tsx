"use client";

import { useEffect, useRef } from "react";

export function HeroCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let stopped = false;
    let raf = 0;
    let dispose = () => {};

    const boot = async () => {
      const THREE = await import("three");
      const host = hostRef.current;
      if (!host || stopped) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(host.clientWidth, host.clientHeight, false);
      renderer.domElement.style.cssText = "width:100%;height:100%;display:block";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        52,
        Math.max(host.clientWidth, 1) / Math.max(host.clientHeight, 1),
        0.1,
        100
      );
      camera.position.set(0, 0, 7.6);

      const root = new THREE.Group();
      scene.add(root);

      const styles = getComputedStyle(document.documentElement);
      const color = (name: string, fallback: string) =>
        new THREE.Color(styles.getPropertyValue(name).trim() || fallback);
      let ink = color("--ink", "#12110e");
      let accent = color("--accent", "#e8491d");
      let data = color("--data", "#2447e0");

      const count = 132;
      const positions: InstanceType<typeof THREE.Vector3>[] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));

      for (let i = 0; i < count; i += 1) {
        const t = i / (count - 1);
        const y = 1 - t * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = golden * i;
        const radius = 3.05 + Math.sin(i * 12.9898) * 0.42;
        const x = Math.cos(theta) * radiusAtY * radius;
        const z = Math.sin(theta) * radiusAtY * radius * 0.64;
        const yy = y * radius * 0.8 + Math.sin(i * 4.1) * 0.07;
        positions.push(new THREE.Vector3(x, yy, z));
      }

      const structural: number[] = [];
      const edges: [InstanceType<typeof THREE.Vector3>, InstanceType<typeof THREE.Vector3>][] = [];
      const degrees = new Array(count).fill(0);
      const maxDistance = 1.48;

      for (let i = 0; i < count; i += 1) {
        for (let j = i + 1; j < count; j += 1) {
          if (degrees[i] >= 3 || degrees[j] >= 3) continue;
          if (positions[i].distanceTo(positions[j]) > maxDistance) continue;
          structural.push(...positions[i].toArray(), ...positions[j].toArray());
          edges.push([positions[i], positions[j]]);
          degrees[i] += 1;
          degrees[j] += 1;
        }
      }

      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(structural, 3)
      );
      const lineMaterial = new THREE.LineBasicMaterial({
        color: ink,
        transparent: true,
        opacity: 0.16,
      });
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      root.add(lines);

      const hotEdges = edges.filter((_, index) => index % 7 === 0).slice(0, 22);
      const hotVertices: number[] = [];
      hotEdges.forEach(([a, b]) => hotVertices.push(...a.toArray(), ...b.toArray()));
      const hotGeometry = new THREE.BufferGeometry();
      hotGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(hotVertices, 3)
      );
      const hotMaterial = new THREE.LineBasicMaterial({
        color: accent,
        transparent: true,
        opacity: 0.4,
      });
      root.add(new THREE.LineSegments(hotGeometry, hotMaterial));

      const glow = document.createElement("canvas");
      glow.width = 64;
      glow.height = 64;
      const context = glow.getContext("2d");
      if (context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(0.24, "rgba(255,255,255,0.92)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
      }
      const glowTexture = new THREE.CanvasTexture(glow);

      const nodePositions: number[] = [];
      const nodeColors: number[] = [];
      const paintNodes = () => {
        nodePositions.length = 0;
        nodeColors.length = 0;
        positions.forEach((point, index) => {
          nodePositions.push(...point.toArray());
          const c = index % 11 === 0 ? accent : index % 5 === 0 ? data : ink;
          nodeColors.push(c.r, c.g, c.b);
        });
      };
      paintNodes();

      const nodeGeometry = new THREE.BufferGeometry();
      nodeGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(nodePositions, 3)
      );
      nodeGeometry.setAttribute("color", new THREE.Float32BufferAttribute(nodeColors, 3));
      const nodeMaterial = new THREE.PointsMaterial({
        size: 0.095,
        map: glowTexture,
        transparent: true,
        opacity: 0.9,
        vertexColors: true,
        depthWrite: false,
        alphaTest: 0.04,
        sizeAttenuation: true,
      });
      const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
      root.add(nodes);

      const packetCount = 24;
      const packetPositions = new Float32Array(packetCount * 3);
      const packets = hotEdges.slice(0, packetCount).map((edge) => ({
        edge,
        t: Math.random(),
        speed: 0.055 + Math.random() * 0.12,
      }));
      const packetGeometry = new THREE.BufferGeometry();
      packetGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(packetPositions, 3)
      );
      const packetMaterial = new THREE.PointsMaterial({
        size: 0.14,
        map: glowTexture,
        transparent: true,
        opacity: 0.95,
        color: accent,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      });
      const packetPoints = new THREE.Points(packetGeometry, packetMaterial);
      root.add(packetPoints);

      let pointerX = 0;
      let pointerY = 0;
      let targetX = 0;
      let targetY = 0;
      let scrollProgress = 0;

      const onPointer = (event: PointerEvent) => {
        targetX = (event.clientX / window.innerWidth) * 2 - 1;
        targetY = (event.clientY / window.innerHeight) * 2 - 1;
      };
      const onScroll = () => {
        scrollProgress = Math.min(
          window.scrollY / Math.max(window.innerHeight, 1),
          1
        );
      };
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      const resize = () => {
        const width = host.clientWidth;
        const height = host.clientHeight;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        if (reduceMotion) renderer.render(scene, camera);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      const repaintTheme = () => {
        const next = getComputedStyle(document.documentElement);
        ink = new THREE.Color(next.getPropertyValue("--ink").trim() || "#12110e");
        accent = new THREE.Color(next.getPropertyValue("--accent").trim() || "#e8491d");
        data = new THREE.Color(next.getPropertyValue("--data").trim() || "#2447e0");
        lineMaterial.color.copy(ink);
        hotMaterial.color.copy(accent);
        packetMaterial.color.copy(accent);
        paintNodes();
        nodeGeometry.setAttribute(
          "color",
          new THREE.Float32BufferAttribute(nodeColors, 3)
        );
        nodeGeometry.attributes.color.needsUpdate = true;
        if (reduceMotion) renderer.render(scene, camera);
      };
      const themeObserver = new MutationObserver(repaintTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      const startedAt = performance.now();

      const tick = () => {
        raf = window.requestAnimationFrame(tick);
        if (document.hidden) return;

        const elapsed = (performance.now() - startedAt) / 1000;
        pointerX += (targetX - pointerX) * 0.045;
        pointerY += (targetY - pointerY) * 0.045;

        root.rotation.y =
          elapsed * 0.032 + pointerX * 0.2 + scrollProgress * 0.32;
        root.rotation.x = -0.06 + pointerY * 0.11 + scrollProgress * 0.16;
        root.rotation.z = Math.sin(elapsed * 0.11) * 0.03;

        camera.position.x = pointerX * 0.24;
        camera.position.y = -pointerY * 0.16;
        camera.position.z = 7.6 + scrollProgress * 0.6;
        camera.lookAt(0, 0, 0);

        packets.forEach((packet, index) => {
          packet.t += packet.speed * 0.016;
          if (packet.t > 1) packet.t -= 1;
          const [a, b] = packet.edge;
          packetPositions[index * 3] = a.x + (b.x - a.x) * packet.t;
          packetPositions[index * 3 + 1] = a.y + (b.y - a.y) * packet.t;
          packetPositions[index * 3 + 2] = a.z + (b.z - a.z) * packet.t;
        });
        packetGeometry.attributes.position.needsUpdate = true;

        nodes.rotation.y = elapsed * -0.012;
        renderer.render(scene, camera);
      };

      if (reduceMotion) {
        renderer.render(scene, camera);
      } else {
        tick();
      }

      dispose = () => {
        window.cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        themeObserver.disconnect();
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("scroll", onScroll);
        lineGeometry.dispose();
        lineMaterial.dispose();
        hotGeometry.dispose();
        hotMaterial.dispose();
        nodeGeometry.dispose();
        nodeMaterial.dispose();
        packetGeometry.dispose();
        packetMaterial.dispose();
        glowTexture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    };

    boot();

    return () => {
      stopped = true;
      window.cancelAnimationFrame(raf);
      dispose();
    };
  }, []);

  return <div ref={hostRef} className="hero-canvas" aria-hidden="true" />;
}
