import { PartnerLogo, byName, partners } from "@/components/partner-logo";
import {
  siApachekafka,
  siClickhouse,
  siCplusplus,
  siDocker,
  siElectron,
  siGo,
  siGrafana,
  siHuggingface,
  siJavascript,
  siKubernetes,
  siLinux,
  siMaplibre,
  siMysql,
  siNextdotjs,
  siNodedotjs,
  siPrometheus,
  siPython,
  siReact,
  siReactquery,
  siRedis,
  siRust,
  siSvelte,
  siTailwindcss,
  siTypescript,
  siUpstash,
  siVercel,
  siVite,
} from "simple-icons";

type Icon = { title: string; hex: string; path: string };

const tech: Record<string, Icon> = {
  typescript: siTypescript,
  javascript: siJavascript,
  "node.js": siNodedotjs,
  python: siPython,
  rust: siRust,
  go: siGo,
  "c++": siCplusplus,
  redis: siRedis,
  mysql: siMysql,
  clickhouse: siClickhouse,
  kafka: siApachekafka,
  docker: siDocker,
  kubernetes: siKubernetes,
  prometheus: siPrometheus,
  grafana: siGrafana,
  "next.js": siNextdotjs,
  react: siReact,
  "react native": siReact,
  svelte: siSvelte,
  sveltekit: siSvelte,
  vite: siVite,
  electron: siElectron,
  tailwind: siTailwindcss,
  maplibre: siMaplibre,
  "tanstack query": siReactquery,
  upstash: siUpstash,
  vercel: siVercel,
  "bge-m3": siHuggingface,
  linux: siLinux,
};

const luminance = (hex: string) => {
  const n = parseInt(hex, 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export function StackTag({ name }: { name: string }) {
  const key = name.toLowerCase();
  const partnerId = byName[key];
  const icon = tech[key];

  return (
    <span className="tag tag-brand">
      {partnerId ? (
        <PartnerLogo id={partnerId} size={16} />
      ) : icon ? (
        <svg
          className="tag-icon"
          viewBox="0 0 24 24"
          role="img"
          aria-label={icon.title}
          data-dark={luminance(icon.hex) < 0.28 ? "" : undefined}
          style={{ fill: `#${icon.hex}` }}
        >
          <path d={icon.path} />
        </svg>
      ) : null}
      {name}
    </span>
  );
}

const wall = [
  "mmt",
  "booking",
  "agoda",
  "goibibo",
  "cleartrip",
  "expedia",
  "kayak",
  "skyscanner",
  "ixigo",
  "emt",
  "tripcom",
  "klook",
  "swiggy",
  "zomato",
  "uber",
  "ola",
  "rapido",
];

export function LogoWall() {
  return (
    <div className="logo-wall" aria-label="Platforms I have integrated and compared">
      <div className="logo-wall-track" aria-hidden="true">
        <div className="logo-wall-roll">
        {[0, 1].map((copy) => (
          <div className="logo-wall-group" key={copy}>
            {wall.map((id) => (
              <span className="logo-wall-item" key={id}>
                <PartnerLogo id={id} size={24} />
                <b>{partners[id].name}</b>
              </span>
            ))}
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
