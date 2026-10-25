import type { CSSProperties, ReactNode } from "react";
import { PartnerLogo } from "@/components/partner-logo";
import { Scene3D } from "@/components/scene3d";
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
  const rows = [
    { n: "Domino's", id: "dominos", w: "brand cart, live", p: "₹412", top: true },
    { n: "Swiggy", id: "swiggy", w: "fees + coupon", p: "₹448" },
    { n: "Zomato", id: "zomato", w: "fees + coupon", p: "₹456" },
  ];
  return (
    <Panel
      title="Searched: Domino's"
      chip="Chain priced live"
      stats={[
        { v: "7", l: "apps" },
        { v: "3", l: "chains live" },
        { v: "0", l: "estimates" },
      ]}
    >
      <ul className="la-cands la-rides">
        {rows.map((r, i) => (
          <li key={r.n} className={r.top ? "is-top" : undefined} style={idx(i)}>
            <span className="la-with-logo">
              <PartnerLogo id={r.id} size={22} />
              {r.n}
            </span>
            <span className="la-k">{r.w}</span>
            <b>{r.p}</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">Example. Ranked by the final amount to pay, never by an estimate.</p>
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
        { v: "15", l: "ride apps" },
        { v: "4", l: "book in-app" },
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
      <p className="la-foot-note">Example. Price follows the pickup point; we search the corners around you.</p>
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

function Pay() {
  const options = [
    { n: "Amazon Pay ICICI card", w: "5% cashback", v: "₹7,999.95", top: true },
    { n: "Gift card", w: "included in results", v: "if it applies" },
    { n: "No-cost EMI", w: "included in results", v: "if it applies" },
  ];
  return (
    <Panel
      title={
        <>
          You can save <em>₹7,999.95</em>
        </>
      }
      chip="5% off on ₹1,59,999"
      stats={[
        { v: "700K", l: "carts / day" },
        { v: "68K", l: "users / day" },
        { v: "1,254", l: "tests" },
      ]}
    >
      <ul className="la-cands la-rides">
        {options.map((o, i) => (
          <li key={o.n} className={o.top ? "is-top" : undefined} style={idx(i)}>
            <span>{o.n}</span>
            <span className="la-k">{o.top ? "biggest saving" : o.w}</span>
            <b>{o.v}</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">Estimated cost after cashback ₹1,51,999.05. Coupon, voucher and card offers, combined.</p>
    </Panel>
  );
}

function Grocery() {
  const rows = [
    { n: "Zepto", id: "zepto", w: "500 g", p: "₹279", top: true },
    { n: "Instamart", id: "instamart", w: "500 g", p: "₹282" },
    { n: "Blinkit", id: "blinkit", w: "2 × 250 g", p: "₹291" },
  ];
  return (
    <Panel
      title="Butter, 500 g"
      chip="Matched by pack size"
      stats={[
        { v: "10", l: "parsers" },
        { v: "40", l: "clusters cap" },
        { v: "20%", l: "to re-cluster" },
      ]}
    >
      <ul className="la-cands la-rides">
        {rows.map((r, i) => (
          <li key={r.n} className={r.top ? "is-top" : undefined} style={idx(i)}>
            <span className="la-with-logo">
              <PartnerLogo id={r.id} size={22} />
              {r.n}
            </span>
            <span className="la-k">{r.w}</span>
            <b>{r.p}</b>
          </li>
        ))}
      </ul>
      <p className="la-foot-note">Example. 2 × 250 g lands in the same group as 500 g.</p>
    </Panel>
  );
}

function Bot() {
  return (
    <Panel
      title="Telegram · deal bot"
      chip="Tracking"
      stats={[
        { v: "2", l: "bots" },
        { v: "20 min", l: "sweep" },
        { v: "1", l: "msg per deal" },
      ]}
    >
      <div className="la-chat">
        <p className="me" style={idx(0)}>
          Track Sony WH-1000XM5 under ₹22,000
        </p>
        <p className="bot" style={idx(1)}>
          Done. I&apos;ll tell you when it drops.
        </p>
        <p className="bot deal" style={idx(2)}>
          <b>Price drop</b>
          <span>
            Sony WH-1000XM5 · now <strong>₹21,490</strong> <s>₹24,990</s>
          </span>
          <em>edited in place, history link included</em>
        </p>
      </div>
    </Panel>
  );
}

export function SystemArtifact({ kind }: { kind: ArtifactKind }) {
  switch (kind) {
    case "flights":
      return <Scene3D kind="flights" className="scene3d-card" label="Live 3D · BLR → GOI" fallback={<Flights />} />;
    case "hotels":
      return <Scene3D kind="hotels" className="scene3d-card" label="Live 3D · 7 records → 1 hotel" fallback={<Hotels />} />;
    case "food":
      return <Scene3D kind="food" className="scene3d-card scene3d-clear" fallback={<Food />} />;
    case "categorizer":
      return <Categorizer />;
    case "search":
      return <Search />;
    case "cabs":
      return <Scene3D kind="cabs" className="scene3d-card scene3d-clear" fallback={<Cabs />} />;
    case "observability":
      return <Observability />;
    case "llm":
      return <Llm />;
    case "pay":
      return <Scene3D kind="pay" className="scene3d-card scene3d-clear" fallback={<Pay />} />;
    case "bot":
      return <Bot />;
    case "grocery":
      return <Scene3D kind="grocery" className="scene3d-card scene3d-clear" fallback={<Grocery />} />;
    default:
      return null;
  }
}
