import type { CSSProperties, ReactNode } from "react";
import { PartnerLogo } from "@/components/partner-logo";
import type { ArtifactKind } from "@/lib/site";

const idx = (i: number) => ({ "--i": i }) as CSSProperties;
const val = (v: number) => ({ "--v": `${v}%` }) as CSSProperties;

function Panel({
  title,
  chip,
  stats,
  children,
}: {
  title: ReactNode;
  chip: string;
  stats: { v: string; l: string }[];
  children: ReactNode;
}) {
  return (
    <div className="la">
      <div className="la-head">
        <span className="la-title">{title}</span>
        <span className="la-chip">
          <i />
          {chip}
        </span>
      </div>
      <div className="la-body">{children}</div>
      <div className="la-stats">
        {stats.map((s) => (
          <div key={s.l}>
            <b>{s.v}</b>
            <span>{s.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flights() {
  const providers = ["mmt", "goibibo", "cleartrip", "ixigo", "emt", "skyscanner", "kayak"];
  return (
    <Panel
      title={
        <>
          BLR <em>→</em> GOI
        </>
      }
      chip="Live fan-out"
      stats={[
        { v: "478K+", l: "requests / day" },
        { v: "3.79M+", l: "events / day" },
        { v: "234K+", l: "calls / hour" },
      ]}
    >
      <svg className="la-arc" viewBox="0 0 200 70" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path id="la-route" d="M8 58 C 60 -6, 140 -6, 192 58" className="la-route" />
        <circle cx="8" cy="58" r="3.2" className="la-node" />
        <circle cx="192" cy="58" r="3.2" className="la-node la-node-hot" />
        <circle r="2.6" className="la-plane">
          <animateMotion dur="5.5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#la-route" />
          </animateMotion>
        </circle>
      </svg>
      <div className="la-chips">
        {providers.map((p, i) => (
          <span key={p} className="la-pchip" style={idx(i)}>
            <PartnerLogo id={p} size={26} />
          </span>
        ))}
      </div>
      <p className="la-best">
        <span>Best fare</span>
        <b>₹4,740</b>
        <span>7 providers · 1 adult</span>
      </p>
    </Panel>
  );
}

function Hotels() {
  const records = [
    { n: "The Park", m: 97, p: "mmt" },
    { n: "Park Hotel", m: 94, p: "booking" },
    { n: "The Park Residency", m: 91, p: "agoda" },
    { n: "Park Residency", m: 88, p: "goibibo" },
  ];
  return (
    <Panel
      title="7 records → 1 hotel"
      chip="Resolving"
      stats={[
        { v: "16K+", l: "compares / day" },
        { v: "1.2K", l: "hourly peak" },
        { v: "7+", l: "providers" },
      ]}
    >
      <div className="la-merge">
        <ul className="la-records">
          {records.map((r, i) => (
            <li key={r.n} style={idx(i)}>
              <span className="la-with-logo">
                <PartnerLogo id={r.p} size={20} />
                {r.n}
              </span>
              <span className="la-bar" style={val(r.m)}>
                <i />
              </span>
              <b>0.{r.m}</b>
            </li>
          ))}
        </ul>
        <span className="la-join" aria-hidden="true" />
        <div className="la-canon">
          <span className="la-k">Canonical hotel</span>
          <strong>The Park</strong>
          <span className="la-k">Bangalore · 5★ · 12 room types</span>
          <p>
            <b>₹4,760</b>
            <span>best rate</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}

function Food() {
  return (
    <Panel
      title="One restaurant, two apps"
      chip="Matched"
      stats={[
        { v: "2", l: "platforms" },
        { v: "1", l: "identity" },
        { v: "Fast", l: "first page" },
      ]}
    >
      <div className="la-merge la-merge-food">
        <ul className="la-records la-apps">
          {[
            { name: "Swiggy", id: "swiggy" },
            { name: "Zomato", id: "zomato" },
          ].map((app, i) => (
            <li key={app.id} style={idx(i)}>
              <span className="la-k la-with-logo">
                <PartnerLogo id={app.id} size={22} />
                {app.name}
              </span>
              <strong>Biryani House</strong>
              <span className="la-lines">
                <i />
                <i />
                <i />
              </span>
            </li>
          ))}
        </ul>
        <span className="la-join" aria-hidden="true" />
        <div className="la-canon la-canon-ink">
          <span className="la-k">One restaurant</span>
          <strong>Biryani House</strong>
          <span className="la-k">matched across apps</span>
          <p>
            <b>1 restaurant</b>
            <span>menus aligned</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}

function Categorizer() {
  const cands = [
    { n: "Headphones", v: 96 },
    { n: "Audio accessories", v: 3 },
    { n: "Speakers", v: 1 },
  ];
  return (
    <Panel
      title="Zero LLM in the path"
      chip="p99 20ms"
      stats={[
        { v: "1.18M", l: "examples" },
        { v: "0.0104", l: "calibration error" },
        { v: "232ms", l: "cold start" },
      ]}
    >
      <div className="la-query">
        <span className="la-k">Query</span>
        <span className="la-type">noise cancelling headphones</span>
      </div>
      <ul className="la-cands">
        {cands.map((c, i) => (
          <li key={c.n} className={i === 0 ? "is-top" : undefined} style={idx(i)}>
            <span>{c.n}</span>
            <span className="la-bar" style={val(c.v)}>
              <i />
            </span>
            <b>{c.v}%</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">Retrieve 1.18M · rerank · calibrate · serve from Rust</p>
    </Panel>
  );
}

function Search() {
  const chips = ["wireless", "under ₹5,000", "noise cancelling", "black"];
  const results = [
    { n: "Sony WH-CH720N", v: 94 },
    { n: "boAt Nirvana 751", v: 88 },
    { n: "JBL Tune 770NC", v: 81 },
  ];
  return (
    <Panel
      title="Query → structured intent"
      chip="Golden bench"
      stats={[
        { v: "99%", l: "extraction" },
        { v: "BGE-M3", l: "embeddings" },
        { v: "LanceDB", l: "vector store" },
      ]}
    >
      <div className="la-query">
        <span className="la-k">Intent</span>
        <span className="la-tags">
          {chips.map((c, i) => (
            <span key={c} className="la-tag" style={idx(i)}>
              {c}
            </span>
          ))}
        </span>
      </div>
      <ul className="la-cands">
        {results.map((r, i) => (
          <li key={r.n} className={i === 0 ? "is-top" : undefined} style={idx(i)}>
            <span>{r.n}</span>
            <span className="la-bar" style={val(r.v)}>
              <i />
            </span>
            <b>{r.v}</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">Embeddings for recall · extraction for precision · cache that learns</p>
    </Panel>
  );
}

function Cabs() {
  const rides = [
    { n: "Uber", id: "uber", p: "₹312", w: "Here" },
    { n: "Ola", id: "ola", p: "₹298", w: "Here" },
    { n: "Rapido", id: "rapido", p: "₹241", w: "120 m walk" },
  ];
  return (
    <Panel
      title="Same ride, smarter pickup"
      chip="Smart pickup"
      stats={[
        { v: "3", l: "providers" },
        { v: "₹1,000+", l: "saved / month" },
        { v: "120 m", l: "walk saves ₹71" },
      ]}
    >
      <ul className="la-cands la-rides">
        {rides.map((r, i) => (
          <li key={r.n} className={i === 2 ? "is-top" : undefined} style={idx(i)}>
            <span className="la-with-logo">
              <PartnerLogo id={r.id} size={22} />
              {r.n}
            </span>
            <span className="la-k">{r.w}</span>
            <b>{r.p}</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">Price follows the pickup point. We find the cheapest corner.</p>
    </Panel>
  );
}

const logLines = [
  ["info", "api-gateway", "GET /flights/search 200 41ms"],
  ["info", "flights-worker", "poll batch=312 ok"],
  ["warn", "hotels-sync", "provider p5 slow 1.9s"],
  ["info", "food-ingest", "clickhouse flush 18k rows"],
  ["info", "categorizer", "p99 19ms cache=hit"],
  ["err", "cabs-api", "upstream 502 retry 1/3"],
  ["info", "api-gateway", "GET /hotels/compare 200 63ms"],
  ["info", "flights-worker", "quota bucket 87% free"],
];

function Observability() {
  const bars = [32, 38, 35, 44, 41, 52, 49, 58, 55, 64, 61, 72, 70, 84, 78, 96];
  return (
    <Panel
      title="Every service, one place"
      chip="OpenObserve · live"
      stats={[
        { v: "12.5B", l: "events" },
        { v: "3.50 TB", l: "ingested" },
        { v: "142 GB", l: "stored" },
        { v: "108", l: "dashboards" },
      ]}
    >
      <div className="la-obs">
        <div className="la-log" aria-hidden="true">
          <div className="la-log-roll">
            {[...logLines, ...logLines].map(([lvl, svc, msg], i) => (
              <p key={i} data-lvl={lvl}>
                <b>{svc}</b> {msg}
              </p>
            ))}
          </div>
        </div>
        <div className="la-spark" aria-hidden="true">
          {bars.map((h, i) => (
            <i key={i} style={{ ...idx(i), height: `${h}%` }} />
          ))}
        </div>
      </div>
      <p className="la-foot-note">201 streams · every service and server, searchable</p>
    </Panel>
  );
}

function Llm() {
  const models = [
    { n: "gpt-oss-120b", q: "MXFP4", gb: 63.4, w: 100 },
    { n: "qwen3.6-35b-a3b", q: "Q4_K_M", gb: 22.1, w: 35 },
    { n: "gemma-4-31b", q: "Q4_K_M", gb: 19.9, w: 31 },
    { n: "gpt-oss-20b", q: "MLX", gb: 12.1, w: 19 },
  ];
  return (
    <Panel
      title="Model rack · 512 GB"
      chip="All resident"
      stats={[
        { v: "4", l: "models warm" },
        { v: "117 GB", l: "in use" },
        { v: "0 MB", l: "swap" },
      ]}
    >
      <ul className="la-cands la-rack">
        {models.map((m, i) => (
          <li key={m.n} className={i === 0 ? "is-top" : undefined} style={idx(i)}>
            <span>{m.n}</span>
            <span className="la-bar" style={val(m.w)}>
              <i />
            </span>
            <b>{m.gb} GB</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">One OpenAI-compatible endpoint · pinned in memory · OCR and vision routes</p>
    </Panel>
  );
}

export function SystemArtifact({ kind }: { kind: ArtifactKind }) {
  switch (kind) {
    case "flights":
      return <Flights />;
    case "hotels":
      return <Hotels />;
    case "food":
      return <Food />;
    case "categorizer":
      return <Categorizer />;
    case "search":
      return <Search />;
    case "cabs":
      return <Cabs />;
    case "observability":
      return <Observability />;
    case "llm":
      return <Llm />;
    default:
      return null;
  }
}
