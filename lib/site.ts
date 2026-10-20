export const profile = {
  name: "Tushar Gautam",
  shortName: "tushar gautam",
  role: "Backend Engineer",
  location: "Bangalore, India",
  email: "tgautam380@gmail.com",
  availability: "Open to hard problems",
  availabilityDetail: "Backend roles · systems work",
  tagline: "I build the invisible layer.",
  description:
    "Backend engineer in Bangalore building comparison engines, low-latency pipelines, and systems that hold at 3.79M events a day.",
  resume: "/resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/tushar-xo", handle: "tushar-xo" },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/tushar-gautam-002661227/",
      handle: "tushar-gautam",
    },
    { label: "LeetCode", href: "https://leetcode.com/u/tusharstyles/", handle: "tusharstyles" },
    { label: "Instagram", href: "https://instagram.com/tushar._xo", handle: "tushar._xo" },
    { label: "Email", href: "mailto:tgautam380@gmail.com", handle: "tgautam380" },
  ],
};

export const marqueeMetrics = [
  "478K+ requests/day",
  "3.79M+ result events/day",
  "p99 20ms",
  "1.18M labeled examples",
  "99% extraction accuracy",
  "7+ travel providers",
  "232ms cold start",
  "12.5B log events",
  "201 log streams",
];

export type Metric = {
  value: string;
  label: string;
  note?: string;
};

export type ArtifactKind =
  | "flights"
  | "hotels"
  | "food"
  | "categorizer"
  | "search"
  | "cabs"
  | "observability";

export type SystemCase = {
  slug: string;
  index: string;
  title: string;
  shortTitle: string;
  promise: string;
  category: string;
  year: string;
  role: string;
  stack: string[];
  metrics: Metric[];
  artifact: ArtifactKind;
  summary: string;
  problem: string[];
  constraints: string[];
  architecture: { label: string; detail: string }[];
  rail: string[];
  hardPart: { title: string; body: string }[];
  broke?: { title: string; body: string };
  differently: string[];
  proves: string[];
  receipts: { label: string; value: string; detail: string }[];
};

export const systems: SystemCase[] = [
  {
    slug: "flights",
    index: "01",
    title: "Flight comparison",
    shortTitle: "Flights",
    promise: "478,000 requests a day. Every one accounted for.",
    category: "Real-time aggregation",
    year: "2025 — now",
    role: "SDE-1 Backend · Buyhatke",
    stack: ["Node.js", "Provider APIs", "Response caching", "OpenObserve"],
    metrics: [
      { value: "478K+", label: "Requests / day", note: "Web, extension and mobile" },
      { value: "3.79M+", label: "Result events / day" },
      { value: "234K+", label: "Provider calls / hour", note: "Skyscanner integration" },
      { value: "68K / 54K", label: "CREATE / POLL calls", note: "Per hour" },
    ],
    artifact: "flights",
    summary:
      "A flight-comparison API and the pipeline behind it. A search is a job: created, polled and normalized across providers, then cached so that refining it never costs another upstream call.",
    problem: [
      "A flight search is not a request. It is a job. You create it, poll it while results trickle in, and merge partial answers into something a person can read. Every provider has its own contract, its own cost per call and its own idea of done.",
      "At this volume the expensive part is not any single search. It is the thousands of near-identical ones: the same route and date, re-sorted, re-filtered, or asked again a minute later.",
    ],
    constraints: [
      "Provider calls cost money and have limits, so every upstream call has to earn its place.",
      "Searches are asynchronous and slow by nature. People judge the product by the first useful result.",
      "One-way, round-trip and multi-city searches have to share one contract.",
      "Web, extension and mobile clients consume the same pipeline.",
      "Every request has to be traceable after the fact.",
    ],
    architecture: [
      { label: "Client", detail: "Web, extension, mobile" },
      { label: "Request shaping", detail: "Trips, passengers, filters" },
      { label: "Search job", detail: "Create, poll, collect" },
      { label: "Cache", detail: "Keyed on what changes the answer" },
      { label: "Refine", detail: "Filters and sorts in memory" },
    ],
    rail: [
      "Cache keyed on what changes the answer",
      "Refinement without an upstream call",
      "Structured events to OpenObserve",
      "Alerts and price history from the same data",
    ],
    hardPart: [
      {
        title: "A cache key that means something",
        body: "The key holds exactly the inputs that change the answer, and nothing else. Passenger ages collapse to the counts the provider actually prices on. Stops, departure windows, airlines and sort order are not in the key at all: they are applied in memory to cached results. A traveller adjusting filters gets an instant answer and the provider never hears about it.",
      },
      {
        title: "One contract for every trip shape",
        body: "One-way, round-trip and multi-city are all modeled as a list of legs. The same validation, the same cache and the same filters work for every shape, and filters can apply to a single leg or to the whole itinerary. Fewer special cases means fewer ways to be wrong at 478K requests a day.",
      },
      {
        title: "Observable by default",
        body: "Alert changes and API activity emit structured events into the company's log platform, so volume, failures and behavior can be read per route after the fact. At this scale the question is rarely whether something happened. It is whether you can prove what happened.",
      },
    ],
    differently: [
      "Version the cache key from day one, so a change in what a result means can never be served from an older shape.",
      "Put a per-search cost figure on the dashboard next to latency. They are the same trade-off.",
    ],
    proves: [
      "High-throughput API orchestration",
      "Async job pipelines",
      "Cache design",
      "Cost control on paid upstreams",
      "Observability",
    ],
    receipts: [
      { label: "Requests / day", value: "478K+", detail: "Across web, extension and mobile" },
      { label: "Result events / day", value: "3.79M+", detail: "Served outcomes" },
      { label: "Provider calls / hour", value: "234K+", detail: "Skyscanner integration" },
      { label: "Poll volume", value: "54K/hr", detail: "Asynchronous collection" },
    ],
  },
  {
    slug: "hotels",
    index: "02",
    title: "Hotel comparison",
    shortTitle: "Hotels",
    promise: "Seven providers. One hotel. One answer.",
    category: "Entity resolution",
    year: "2025 — now",
    role: "SDE-1 Backend · Buyhatke",
    stack: ["Node.js", "WebSockets", "MySQL", "Valkey", "Cron workers"],
    metrics: [
      { value: "7+", label: "Travel providers", note: "MMT, Booking, Agoda and more" },
      { value: "16K+", label: "Compares / day" },
      { value: "1.2K", label: "Hourly peak" },
      { value: "1M+", label: "Canonical hotel IDs", note: "In the production map" },
    ],
    artifact: "hotels",
    summary:
      "A live-compare backend that resolves one real-world hotel across a dozen partner catalogs, fetches prices live through the user's own session, and learns from every comparison it serves.",
    problem: [
      "The same hotel has a different name, a different id and a different room list on every partner. A comparison is only as good as the claim that these records are the same place. A wrong merge is worse than a missing partner.",
      "And the price is live. It depends on dates, guests and market, so none of it can be precomputed. The system has to resolve identity from a catalog, then fetch prices in real time, in seconds, while the user watches.",
    ],
    constraints: [
      "Identity and price are different problems on different clocks. Identity is stored. Price never is.",
      "Partners answer at different speeds, and some do not answer at all.",
      "Demand is spiky, and most of it comes from the comparison bar on partner pages.",
      "Two front-ends with different needs must not be able to take each other down.",
      "Background jobs share a database with the live path.",
    ],
    architecture: [
      { label: "Gateway", detail: "Parse live partner pages into one room grid" },
      { label: "Resolve", detail: "Known hotel: skip search, go straight to detail" },
      { label: "Catalogs", detail: "Per-partner, built by use" },
      { label: "Canonical map", detail: "One identity per real hotel" },
      { label: "Comparison store", detail: "Every finished compare, kept" },
    ],
    rail: [
      "Two processes, two front-ends",
      "Identity stored, prices never",
      "A daily-swept comparison store",
      "Single-instance cron guards",
    ],
    hardPart: [
      {
        title: "Identity without ever storing a price",
        body: "The canonical layer holds identity and structure only. Prices are fetched live, per user, per stay. Rooms are not pre-mapped either: they are aligned at query time, because the room set changes with dates and guests anyway. The stored layer stays small, stable and trustworthy.",
      },
      {
        title: "A catalog that builds itself",
        body: "Every live comparison leaves a trace that background workers fold into the catalogs and the canonical map. A hotel mapped once skips the search step on every later compare and goes straight to detail. The system gets faster at the hotels people actually look at, with no crawl.",
      },
      {
        title: "Measure the tail, not the mean",
        body: "The comparison bar carries about four fifths of demand, and the average comparison finished in about five seconds. The worst cases ran far longer. The performance audit went after stragglers: per-partner phase timings, deadlines that settle a slow partner without discarding early results, and serial setup steps that never needed to be serial.",
      },
      {
        title: "Background work that cannot hurt the live path",
        body: "Catalog jobs run as one-pass crons that start, finish and give their memory back, not as always-on processes. A single-instance guard stops overlap. A second, stronger lock exists because the first guard exits cleanly when it blocks, which would make a stuck job look like a successful one.",
      },
    ],
    broke: {
      title: "The silent 403",
      body: "Kayak pricing requests were being rejected for a long stretch before the cause showed up: the outbound request carried an empty User-Agent. A realistic one fixed it. Currency and country handling was then threaded through the extension, the gateway and the upstream call, and verified live against a matching exchange-rate ratio.",
    },
    differently: [
      "Add per-partner phase timings before tuning anything. The average hides the tail.",
      "Give every cache key the identity of the thing it caches. A name is not an identity.",
    ],
    proves: [
      "Entity resolution",
      "Live real-time pricing",
      "Catalog and schema design",
      "Cron and lock discipline",
      "Performance auditing",
    ],
    receipts: [
      { label: "Providers", value: "7+", detail: "Hotel supply sources" },
      { label: "Compares / day", value: "16K+", detail: "Real-time comparisons" },
      { label: "Hourly peak", value: "1.2K", detail: "Busiest hour" },
      { label: "Bar share", value: "~80%", detail: "Demand from the comparison bar" },
    ],
  },
  {
    slug: "food",
    index: "03",
    title: "Food comparison",
    shortTitle: "Food",
    promise: "The license plate that identifies a restaurant.",
    category: "Canonical identity + ClickHouse",
    year: "2025 — now",
    role: "SDE-1 Backend · Buyhatke",
    stack: ["Node.js", "ClickHouse", "Swiggy", "Zomato", "Ownly"],
    metrics: [
      { value: "3", label: "Delivery platforms", note: "Swiggy, Zomato, Ownly" },
      { value: "FSSAI", label: "Identity key", note: "Food safety license" },
      { value: "ClickHouse", label: "Persistence layer" },
      { value: "Async", label: "Batched writes" },
    ],
    artifact: "food",
    summary:
      "A food-comparison backend that resolves the same restaurant across delivery apps using its food-safety license, matches menus item by item, and serves the first page from live data while persisting what it learned.",
    problem: [
      "Every delivery app describes the same restaurant differently. Names drift, chains have many outlets, and menus use different words for the same dish. Comparing prices starts with proving it is the same kitchen.",
      "The food-safety license number is the one identifier they are all legally tied to. It is also sometimes missing, sometimes wrong, and buried somewhere different in each payload.",
    ],
    constraints: [
      "A strong key that is also dirty.",
      "A wrong merge shows the wrong menu, so identity writes must never corrupt.",
      "Reads cannot wait on writes.",
      "Menus are large, and people want the first page now and the rest as they scroll.",
      "The cart has to reflect real offers and real charges.",
    ],
    architecture: [
      { label: "Parse", detail: "Live data from each platform" },
      { label: "Identify", detail: "Pin identity to the license" },
      { label: "Match", detail: "Menu items aligned across platforms" },
      { label: "Serve", detail: "First page straight from live matches" },
      { label: "Persist", detail: "Batched writes of what was learned" },
    ],
    rail: [
      "License-keyed identity",
      "Conflict states, never silent merges",
      "Async write buffer",
      "Shadow writes before reads",
    ],
    hardPart: [
      {
        title: "Strict about identity, lenient about everything else",
        body: "Identity is written only when a canonical license is present. If a platform's restaurant id already belongs to another license, it is dropped from the row rather than reassigned. Records carry a status (partial, mapped, conflict, disabled), so uncertainty is stored as uncertainty. Where there is no license, matching has to clear a confidence floor.",
      },
      {
        title: "Serve now, learn later",
        body: "The first page of a menu is served straight from live matched data, and a short-lived continuation buffer covers the next page. Only the selected restaurant and its mapped items are then written to ClickHouse, in batches, off the request path. Reads never wait on the database.",
      },
      {
        title: "A boring read path, on purpose",
        body: "The persistence design is deliberately plain: no joins on normal reads, no clever ranking column, no raw platform dumps. The tables hold identity, mapped items, and the latest observed price, availability and rating. Plain is what keeps it fast, and what lets one person reason about all of it.",
      },
      {
        title: "A migration without a cliff",
        body: "ClickHouse arrived behind two flags: shadow writes first, reads after. The existing behavior stayed live while the new store proved itself on real traffic.",
      },
    ],
    differently: [
      "Write the identity rules down before the first merge. Conflicts are cheap to prevent and expensive to unmerge.",
    ],
    proves: [
      "Canonical identity under imperfect keys",
      "High-throughput storage",
      "Read and write path separation",
      "Safe migrations",
      "Pragmatic design",
    ],
    receipts: [
      { label: "Platforms", value: "3", detail: "Swiggy, Zomato, Ownly" },
      { label: "Identity key", value: "FSSAI", detail: "License-number matching" },
      { label: "Storage", value: "ClickHouse", detail: "Identity, items, latest price" },
      { label: "Write path", value: "Async", detail: "Batched, off the request path" },
    ],
  },
  {
    slug: "categorizer",
    index: "04",
    title: "Query categorizer",
    shortTitle: "Categorizer",
    promise: "Zero LLM in the request path.",
    category: "Retrieval + calibration",
    year: "2025 — now",
    role: "SDE-1 Backend · Buyhatke",
    stack: ["Python", "Rust", "GBDT", "kNN", "mmap", "Node.js"],
    metrics: [
      { value: "1.18M+", label: "Labeled examples" },
      { value: "0.0104", label: "Expected calibration error" },
      { value: "20ms", label: "p99 latency" },
      { value: "232ms", label: "Cold start" },
    ],
    artifact: "categorizer",
    summary:
      "A high-volume query categorization engine that uses retrieval over 1.18M labeled examples and a GBDT reranker, with a calibrated confidence score and a Rust hot path. No LLM in the request path.",
    problem: [
      "Categorize queries at high volume, with a confidence score the product can trust, at low latency and low cost.",
      "An LLM could do it. But in the request path it would add latency, cost money on every call, and drift in ways that are hard to calibrate. The bet was that retrieval plus a small reranker could win on this task if the team invested in data, calibration, and parity.",
    ],
    constraints: [
      "A p99 budget measured in milliseconds, not seconds.",
      "A confidence score that is usable for routing and abstention.",
      "The same answer from Python, Rust, and Node.",
      "An index that loads fast enough for deploys and scale-to-zero.",
      "A cost per request that does not grow with traffic.",
      "An evaluation harness that catches regressions before rollout.",
    ],
    architecture: [
      { label: "Query", detail: "Normalize + tokenize" },
      { label: "Retrieve", detail: "Dense + sparse kNN" },
      { label: "Rerank", detail: "GBDT over candidates" },
      { label: "Calibrate", detail: "Trustworthy confidence" },
      { label: "Serve", detail: "Rust + mmap indexes" },
    ],
    rail: ["Python training", "Rust hot path", "Node integration", "Parity tests"],
    hardPart: [
      {
        title: "Calibration is the product",
        body: "A category without a trustworthy confidence is a guess. The system is calibrated to an expected calibration error of 0.0104, which means the score can drive routing and abstention instead of being decorative. A model you cannot calibrate is a demo; a model you can calibrate is infrastructure.",
      },
      {
        title: "Parity is a feature",
        body: "The same input has to produce the same output in Python, Rust, and Node. A cross-language disagreement rate under 0.1% is not an accident; it is enforced by a parity suite that runs the same cases through every runtime and fails the build on drift.",
      },
      {
        title: "232ms cold start",
        body: "Indexes are loaded with mmap, so the process can start serving without a long warm-up. That matters for deploys, autoscaling, and every unlucky request that arrives right after a restart.",
      },
    ],
    differently: [
      "I would write the parity harness before the second runtime existed. Retrofitting it is more expensive than designing for it.",
      "I would publish the calibration curve internally as a first-class dashboard, not a notebook artifact.",
      "I would keep the LLM in the offline labeling loop longer, where it is useful and cannot hurt the p99.",
    ],
    proves: [
      "ML systems engineering",
      "Retrieval and reranking",
      "Calibration",
      "Rust performance work",
      "Cross-language correctness",
      "Cost-aware architecture",
    ],
    receipts: [
      { label: "Labeled examples", value: "1.18M+", detail: "Retrieval corpus" },
      { label: "Calibration", value: "ECE 0.0104", detail: "Expected calibration error" },
      { label: "Latency", value: "p99 20ms", detail: "Rust hot path" },
      { label: "Cold start", value: "232ms", detail: "mmap-loaded indexes" },
    ],
  },
  {
    slug: "search",
    index: "05",
    title: "Semantic product search",
    shortTitle: "Search",
    promise: "99% extraction, zero blind trust.",
    category: "Applied LLM systems",
    year: "2025 — now",
    role: "SDE-1 Backend · Buyhatke",
    stack: ["Groq", "OpenRouter", "BGE-M3", "LanceDB", "Python", "TypeScript"],
    metrics: [
      { value: "99%", label: "Extraction accuracy" },
      { value: "BGE-M3", label: "Embedding model" },
      { value: "LanceDB", label: "Vector store" },
      { value: "Golden", label: "Benchmark harness" },
    ],
    artifact: "search",
    summary:
      "An LLM-powered semantic product search system that combines embeddings, structured extraction, and a self-improving cache, with a golden benchmark guarding every change.",
    problem: [
      "Product search across a messy catalog is a precision problem disguised as a recall problem. Keyword search misses intent. Pure LLM extraction is expensive and inconsistent.",
      "The system uses embeddings for recall, structured extraction for precision, and a cache that improves with use. The interesting part is not the model; it is the evaluation harness that tells you whether the model is actually helping.",
    ],
    constraints: [
      "Extraction must be consistent enough to compare products.",
      "Model providers change behavior and pricing.",
      "A cache can poison results if it is too broad.",
      "The catalog changes faster than any hand-written rule set.",
      "Every change needs a measurable before and after.",
    ],
    architecture: [
      { label: "Query", detail: "Intent + filters" },
      { label: "Embed", detail: "BGE-M3" },
      { label: "Retrieve", detail: "LanceDB candidates" },
      { label: "Extract", detail: "Structured LLM output" },
      { label: "Validate", detail: "Schema + golden set" },
    ],
    rail: ["Groq + OpenRouter", "Self-improving cache", "Golden benchmark", "Extraction schema"],
    hardPart: [
      {
        title: "An evaluation harness, not a vibe",
        body: "The 99% extraction accuracy number is only useful if it is reproducible. A golden benchmark runs the same representative queries on every change, compares structured outputs, and fails the build when accuracy drops. The harness is the product.",
      },
      {
        title: "A cache that earns its keep",
        body: "The cache improves latency and cost, but it has to be scoped to queries where reuse is safe. The system tracks hit rate and invalidation, and treats a stale or overly broad cache entry as a bug, not a free win.",
      },
    ],
    differently: [
      "I would version prompts, models, and schemas together as one deployable artifact.",
      "I would expose extraction confidence and provenance in the search UI, not just the backend.",
    ],
    proves: [
      "Applied LLM systems",
      "Embedding retrieval",
      "Evaluation discipline",
      "Cost engineering",
      "Schema design",
    ],
    receipts: [
      { label: "Extraction", value: "99%", detail: "Golden benchmark accuracy" },
      { label: "Embeddings", value: "BGE-M3", detail: "Dense retrieval" },
      { label: "Vector store", value: "LanceDB", detail: "Candidate search" },
      { label: "Models", value: "Groq + OpenRouter", detail: "Provider routing" },
    ],
  },
  {
    slug: "cabs",
    index: "06",
    title: "Cab comparison",
    shortTitle: "Cabs",
    promise: "A thousand rupees a month, one pickup at a time.",
    category: "Intern-era product",
    year: "2025",
    role: "SDE Backend Intern · Buyhatke",
    stack: ["Node.js", "Uber", "Ola", "Rapido", "APIs", "Scrapers"],
    metrics: [
      { value: "3", label: "Providers", note: "Uber, Ola, Rapido" },
      { value: "₹1K+", label: "Saved / month", note: "For users" },
      { value: "Smart", label: "Pickup point" },
      { value: "0 → 1", label: "Built from scratch" },
    ],
    artifact: "cabs",
    summary:
      "A cab comparison system built from scratch as an intern, aggregating Uber, Ola, and Rapido, with a smart-pickup feature that helped users save over a thousand rupees a month.",
    problem: [
      "Cab prices vary by provider and by pickup point. A short walk can change the fare. Most comparison tools stop at the provider; the useful product goes one step further and asks where you should actually be standing.",
      "The system had to aggregate three providers with different APIs, normalize their pricing, and make a pickup suggestion that a human would actually follow.",
    ],
    constraints: [
      "Provider APIs and scrapers with different contracts.",
      "Prices that depend on time, traffic, and pickup location.",
      "A pickup suggestion that has to be practical, not just mathematically closer.",
      "An intern timeline and a small team.",
    ],
    architecture: [
      { label: "Request", detail: "Origin + destination" },
      { label: "Aggregate", detail: "Uber, Ola, Rapido" },
      { label: "Normalize", detail: "Fare + ETA + availability" },
      { label: "Optimize", detail: "Smart pickup point" },
      { label: "Compare", detail: "One ranked answer" },
    ],
    rail: ["Provider adapters", "Scrapers", "Fare normalization", "Pickup heuristics"],
    hardPart: [
      {
        title: "A closer pickup is not always a better pickup",
        body: "The cheapest pickup point on a map can be across a highway or behind a gate. The feature combined distance, walking time, and fare savings, then presented the tradeoff instead of pretending there was one perfect answer.",
      },
      {
        title: "Three providers, one comparison",
        body: "Uber, Ola, and Rapido expose different price components and availability signals. The system normalized what it could, labeled what it could not, and kept the comparison honest about the difference.",
      },
    ],
    differently: [
      "I would measure whether users actually walked to the suggested point, not just whether the price was lower.",
      "I would model cancellation risk as part of the recommendation.",
    ],
    proves: [
      "End-to-end shipping as an intern",
      "Product intuition",
      "API aggregation",
      "Scrappy execution",
    ],
    receipts: [
      { label: "Providers", value: "3", detail: "Uber, Ola, Rapido" },
      { label: "User savings", value: "₹1,000+/mo", detail: "Smart pickup" },
      { label: "Scope", value: "0 → 1", detail: "Built from scratch" },
      { label: "Role", value: "Intern", detail: "Buyhatke, 2025" },
    ],
  },
  {
    slug: "observability",
    index: "07",
    title: "OpenObserver",
    shortTitle: "OpenObserver",
    promise: "12.5 billion log events. The company's black box.",
    category: "Self-hosted OpenObserve",
    year: "2025 — now",
    role: "SDE-1 Backend · Platform owner",
    stack: ["OpenObserve", "Prometheus", "Docker", "Linux", "Node.js"],
    metrics: [
      { value: "201", label: "Log streams", note: "Every service, every server" },
      { value: "12.5B", label: "Events", note: "Collected and searchable" },
      { value: "3.50 TB", label: "Ingested", note: "142.46 GB compressed" },
      { value: "108", label: "Dashboards", note: "One source of truth" },
    ],
    artifact: "observability",
    summary:
      "I stood up OpenObserve, the open-source log platform, and piped every service and every server in the company into it. 201 streams, 12.5 billion events, 3.5 terabytes ingested — and for the first time, one place to see everything.",
    problem: [
      "Every service and server was writing logs into its own corner of the company. Debugging meant ssh, grep, and somebody's scrollback buffer. Nobody could answer a simple question across the whole stack: what actually happened?",
      "I deployed OpenObserve, the open-source log ingestion platform, and made it the company's single log sink. Every service, every server, every noisy cron job. Once the data was in one place, the platform stopped being a log viewer and became an audit layer: vulnerabilities, inefficient queries, runaway services, and operational blind spots all became visible in the same query.",
    ],
    constraints: [
      "Hundreds of services and servers writing at different rates, formats, and volume.",
      "3.5 TB of raw ingest that has to stay queryable and affordable.",
      "Security and efficiency findings only matter if the logs are complete and trustworthy.",
      "Retention policies that keep the useful signal without keeping everything forever.",
      "Search that stays fast while the index keeps growing.",
      "A platform that has to be up before the systems it observes are allowed to fail.",
    ],
    architecture: [
      { label: "Collect", detail: "Every service + server" },
      { label: "Stream", detail: "201 isolated OpenObserve streams" },
      { label: "Ingest", detail: "Parse, index, compress" },
      { label: "Store", detail: "Hot queries + retention" },
      { label: "See", detail: "Search, dashboards, audits" },
    ],
    rail: ["OpenObserve OSS", "Stream isolation", "Retention tiers", "Query budgets"],
    hardPart: [
      {
        title: "Completeness is the whole product",
        body: "A log platform is only as useful as its coverage. The work was getting every service and every server into the same ingest path, with the fields that make a request traceable. Once the company was fully wired in, the platform stopped answering 'what happened?' and started answering 'what is wrong that we haven't noticed?'",
      },
      {
        title: "Visibility found the problems",
        body: "With 12.5 billion events in one query layer, entire classes of issues became obvious: endpoints with weak auth, queries scanning far more data than they returned, services logging sensitive fields, and jobs quietly failing for months. None of it required a new scanner. It required one place where the truth was actually stored.",
      },
      {
        title: "3.5 TB in, 142 GB stored",
        body: "Compression is not a footnote at this scale. A 25x reduction is the difference between a platform the company can afford to run and one it has to ration. The storage layout and retention policy are part of the product, not an afterthought.",
      },
    ],
    differently: [
      "I would set per-stream ingest budgets on day one. Shared infrastructure needs visible ownership.",
      "I would ship a recurring security query pack with the platform, not discover the use case after the fact.",
      "I would make retention a product decision with the teams writing the logs, not a global default.",
    ],
    proves: [
      "Self-hosting and operating open-source infrastructure",
      "Company-wide log ingestion at 12.5B events",
      "Security and efficiency discovery through observability",
      "Storage and retention economics",
      "Making every other engineer faster",
    ],
    receipts: [
      { label: "Log streams", value: "201", detail: "Services and servers" },
      { label: "Events", value: "12.5B", detail: "Collected" },
      { label: "Ingested", value: "3.50 TB", detail: "142.46 GB after compression" },
      { label: "Dashboards", value: "108", detail: "One query layer" },
    ],
  },
];

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  year: string;
  stack: string[];
  image: string;
  live: string;
  repo: string;
  highlight: string;
  note: string;
  portrait?: boolean;
};

export const projects: Project[] = [
  {
    slug: "flight-tracker",
    title: "Flight Tracker",
    tagline: "Every flight over India, live.",
    description:
      "A national airspace in one map. Live positions from a three-feed fallback chain, route and aircraft enrichment, airport boards, and fare comparison. I reverse-engineered the data path until the whole sky rendered in real time.",
    category: "Live data / reverse engineering",
    year: "2026",
    stack: ["Next.js", "TypeScript", "MapLibre", "TanStack Query", "Upstash"],
    image: "/assets/projects/flight-tracker.png",
    live: "https://flight-tracker-gamma-seven.vercel.app",
    repo: "https://github.com/slacktack/flight-tracker",
    highlight: "3 fallback feeds",
    note: "When a feed goes dark, the map does not. OpenSky and adsb.lol take over without a reload.",
  },
  {
    slug: "dream-journal",
    title: "Dream Journal",
    tagline: "Mumble a dream. Get a trailer.",
    description:
      "A voice note becomes a 30-second cinematic trailer: screenplay, genre-matched voiceover, painted film stills, a live WebAudio score, and a browser-rendered MP4. Four acts, no video libraries.",
    category: "Generative cinema",
    year: "2026",
    stack: ["Next.js", "TypeScript", "LLM", "Edge TTS", "Canvas", "WebAudio"],
    image: "/assets/projects/dream-journal.png",
    live: "https://dream-journal-neon-delta.vercel.app",
    repo: "https://github.com/slacktack/Dream-Journal",
    highlight: "30 sec / 4 acts",
    note: "The renderer is canvas, the score is WebAudio, and the export is MediaRecorder. No ffmpeg on a server.",
  },
  {
    slug: "train-tracker",
    title: "Train Tracker",
    tagline: "2,346 trains. One live map.",
    description:
      "Real-time tracking for Indian Railways: every running train on a nationwide map, tap for speed, next stop, delay, vacant berths, and the full station timeline. Built for one hand on a phone and no patience for a refresh button.",
    category: "Live mobility",
    year: "2026",
    stack: ["Next.js", "TypeScript", "MapLibre", "TanStack Query", "Redis"],
    image: "/assets/projects/train-tracker.png",
    live: "https://train-tracker-zeta.vercel.app",
    repo: "https://github.com/slacktack/Train-Tracker",
    highlight: "2,346 trains live",
    note: "Theme-aware basemap, speed-based markers, and a bottom sheet that survives a thumb.",
  },
  {
    slug: "wardrobe-ai",
    title: "Wardrobe AI",
    tagline: "Get the look, not the link.",
    description:
      "Drop a fit photo. Vision breaks it into pieces, detects menswear or womenswear, and hunts the closest product match across Indian stores. The hard part is not the model. It is making the match feel like a stylist, not a search engine.",
    category: "Vision + retrieval",
    year: "2026",
    stack: ["Next.js", "React", "Tailwind", "Vision API", "Product search"],
    image: "/assets/projects/wardrobe-ai.png",
    live: "https://wardrobe-ai-plum-two.vercel.app",
    repo: "https://github.com/slacktack/wardrobe-ai",
    highlight: "fit → product",
    note: "One upload, many pieces, one ranked answer per piece.",
    portrait: true,
  },
  {
    slug: "k8-wizard",
    title: "K8 Wizard",
    tagline: "Zero to Kubernetes wizard.",
    description:
      "An interactive curriculum that takes you from Docker basics to production-grade Kubernetes, with 70 lessons, a simulated terminal, and a playground that runs the whole cluster lifecycle in the browser.",
    category: "Developer education",
    year: "2026",
    stack: ["React", "Vite", "TypeScript", "Kind", "Kubernetes"],
    image: "/assets/projects/k8-wizard.png",
    live: "https://k8-wizard.vercel.app",
    repo: "https://github.com/slacktack/k8-wizard",
    highlight: "70 lessons",
    note: "The terminal is not a screenshot. Type the command, watch the cluster respond.",
  },
  {
    slug: "khelo-football",
    title: "Khelo",
    tagline: "Draft legends. Chase the 7–0.",
    description:
      "A World Cup draft game. Pick your eleven from the greatest squads between 1966 and 2022, then simulate a full tournament run, group stage to the final. A second mode drafts from the top flight instead.",
    category: "Game / simulation",
    year: "2026",
    stack: ["SvelteKit", "TypeScript", "Vercel"],
    image: "/assets/video/khelo-football.jpg",
    live: "https://khelo-football.vercel.app",
    repo: "https://github.com/slacktack/khelo-football",
    highlight: "1966 – 2022 squads",
    note: "Roll the dice, build the XI, then watch the whole tournament play out.",
  },
];

export type NoteSection = {
  heading?: string;
  body: string[];
  quote?: string;
  list?: string[];
  code?: string;
};

export type Note = {
  slug: string;
  title: string;
  dek: string;
  date: string;
  readTime: string;
  category: string;
  sections: NoteSection[];
};

export const notes: Note[] = [
  {
    slug: "zero-llm-in-the-request-path",
    title: "Zero LLM in the request path",
    dek: "Why a 1.18M-example retrieval system and a small reranker beat a language model where it mattered: latency, cost, and calibration.",
    date: "Oct 2026",
    readTime: "8 min",
    category: "Systems",
    sections: [
      {
        body: [
          "The easiest version of query categorization is a prompt. Send the query to a model, ask for a category, parse the answer. It works in a demo, it works in a notebook, and it will probably work in production for the first week.",
          "Then the traffic arrives. Every request now carries a network round trip, a provider bill, and a new failure mode. The model is non-deterministic by design. The confidence score, if there is one, is not calibrated. And the p99 is no longer something you own.",
        ],
      },
      {
        heading: "The actual constraint",
        body: [
          "The constraint was not 'can a model categorize this query?' The constraint was 'can we categorize this query at high volume, with a confidence score the product can trust, inside a p99 budget of 20 milliseconds, at a cost that does not grow with traffic?'",
          "That is a different problem. It is a retrieval problem, a calibration problem, and a runtime problem wearing the same clothes.",
        ],
        quote: "A model you cannot calibrate is a demo. A model you can calibrate is infrastructure.",
      },
      {
        heading: "Retrieval before generation",
        body: [
          "The system starts with a corpus of 1.18 million labeled examples. For an incoming query, it retrieves candidates using two channels: dense embeddings for semantic similarity and sparse lexical matching for exact terms that matter. The candidate set is small enough to be cheap.",
          "A gradient-boosted decision tree reranks those candidates. It is not a large model. It does not need to be. The retrieval stage does the expensive semantic work; the reranker makes a small, fast decision over a short list.",
        ],
        code: `query\n  → normalize\n  → dense + sparse retrieval over 1.18M examples\n  → candidate set\n  → GBDT rerank\n  → calibrated confidence\n  → category`,
      },
      {
        heading: "Calibration is the product",
        body: [
          "A category label is only half the output. The other half is a confidence score that means something. If the system says 0.92, roughly 92 out of 100 predictions at that score should be correct.",
          "The engine is calibrated to an expected calibration error of 0.0104. That number is not a vanity metric. It is what lets the product route high-confidence queries automatically, send uncertain ones to review, and abstain when the cost of being wrong is higher than the cost of asking.",
        ],
      },
      {
        heading: "The hot path",
        body: [
          "The serving path is written in Rust. Indexes are loaded with mmap, so a cold process can start answering without reading the entire corpus into memory first. Cold start is 232 milliseconds. The p99 is 20 milliseconds.",
          "Those two numbers matter together. A fast p99 with a slow cold start is a system that punishes the unluckiest requests: the first one after a deploy, the one that arrives during a scale-out, the one that lands after a restart. Designing for the cold request is part of designing for the p99.",
        ],
      },
      {
        heading: "Parity is a feature",
        body: [
          "The same query has to produce the same answer in Python, Rust, and Node. Python trains and evaluates. Rust serves the hot path. Node integrates with the product. If the feature pipeline drifts between them, the offline metrics stop describing the online system.",
          "The parity suite runs the same test vectors through every runtime and fails the build on disagreement. The current cross-language disagreement rate is under 0.1%. That number is enforced, not observed.",
        ],
      },
      {
        heading: "Where the LLM still helps",
        body: [
          "Keeping the LLM out of the request path does not mean keeping it out of the system. It is useful offline: labeling assistance, data augmentation, edge-case discovery, and evaluation. It can help you build a better training set without becoming a dependency on every user request.",
          "The rule is simple: use the model where a mistake costs a review, not where it costs a request. Put it in the loop that improves the system, not in the loop that serves the user.",
        ],
      },
      {
        heading: "What I would tell the next team",
        body: [
          "Start with the simplest system that can be trusted. Measure calibration before you measure accuracy. Write the parity tests before the second runtime. Treat the cold start as a first-class latency number.",
          "And be honest about the tradeoff. A retrieval system with a small reranker is less exciting to demo than a prompt. It is also easier to reason about, cheaper to run, and much easier to keep fast at 3 a.m. on a Saturday.",
        ],
      },
    ],
  },
  {
    slug: "232ms-cold-start",
    title: "232ms cold start",
    dek: "What it takes to serve from a cold process without making the unluckiest request pay for the warm-up.",
    date: "Oct 2026",
    readTime: "6 min",
    category: "Performance",
    sections: [
      {
        body: [
          "Cold start is the latency tax paid by the unluckiest request. It is the first request after a deploy, the first request on a new instance, the request that arrives while the process is still figuring out where its indexes live.",
          "Most teams measure p50 and p99 on a warm process, then act surprised when autoscaling feels slow. The cold path is part of the product.",
        ],
      },
      {
        heading: "What actually loads",
        body: [
          "A model-backed service usually pays for four things at startup: the framework and runtime boot, the model or feature code, the index or data structures, and the allocator and page cache behavior that follows.",
          "Framework boot is usually visible and easy to optimize. Index loading is where the interesting work happens. If a process reads a multi-gigabyte index from disk into heap on every start, the cold request waits for all of it, even if it only needs a small part.",
        ],
      },
      {
        heading: "Let the operating system do the loading",
        body: [
          "The serving path uses mmap-loaded indexes. Instead of copying the whole index into the process at boot, the process maps it and lets the operating system fault pages in as they are touched. Startup becomes a mapping operation, not a full read.",
          "The tradeoff is that the first access to a page is slower. That is a much better trade than blocking every early request on a full index load. It also makes deployments and scale-out less spiky, because a new process does not compete for memory bandwidth with every other new process at once.",
        ],
        quote: "The fastest cold start is the one where you do not load what you do not need yet.",
      },
      {
        heading: "Index layout is latency",
        body: [
          "mmap only helps if the data is laid out for the way it is read. The index needs predictable offsets, compact records, and a layout that keeps related data close together. A pointer-heavy structure with millions of small allocations gives the operating system nothing to work with.",
          "This is the part that is easy to underestimate. The runtime choice is visible; the layout is the actual performance work.",
        ],
      },
      {
        heading: "Measure the unlucky request",
        body: [
          "The numbers that matter are not just p50 and p99. Track cold-start time as its own metric, then track the latency of the first N requests after a cold start. If the warm p99 is 20 milliseconds and the cold-start time is 232 milliseconds, the first request is not paying 20 milliseconds. It is paying for the start.",
          "Put a deploy marker on the latency chart. If the p99 spike lines up with every deploy, the p99 is not the real story. The cold path is.",
        ],
      },
      {
        heading: "The checklist",
        body: [
          "Map large read-only data instead of copying it. Keep the index layout compact and predictable. Measure cold start separately from steady state. Track the first requests after a deploy, not just the average. And keep a warm pool if the product cannot tolerate the cold tail.",
        ],
        list: [
          "Make cold start a named SLO, not a side note in a runbook.",
          "Measure first-request latency after every deploy.",
          "Prefer mmap for large read-only indexes with predictable access.",
          "Keep the hot path free of lazy initialization surprises.",
          "Test scale-from-zero, not just scale-from-warm.",
        ],
      },
    ],
  },
  {
    slug: "the-quota-is-the-architecture",
    title: "The quota is the architecture",
    dek: "Provider limits are not an edge case. They are the shape of the system.",
    date: "Oct 2026",
    readTime: "7 min",
    category: "Distributed systems",
    sections: [
      {
        body: [
          "Every provider integration starts with a happy path and a rate limit. The happy path gets the design document. The rate limit gets a retry wrapper and a TODO.",
          "Then the product grows, the traffic grows, and the quota becomes the most important number in the system. Not the latency. Not the throughput. The quota.",
        ],
      },
      {
        heading: "A quota is a shared resource",
        body: [
          "At 234,000 provider calls an hour, a retry is not free. It is a withdrawal from a budget shared by every search, every user, and every background job. If one expensive search can spend the budget without a limit, every other search is competing with it.",
          "The fix is to treat provider budget as a first-class resource with its own governor: token buckets per provider, per-key limits, and a clear priority for what gets to spend.",
        ],
        quote: "A quota is not a limit on the system. It is a description of the system.",
      },
      {
        heading: "CREATE and POLL are different animals",
        body: [
          "Asynchronous provider search has two costs. Creating a search is one. Polling it is another. At 68,000 CREATE calls and 54,000 POLL calls an hour, the polling pattern is as much a part of the architecture as the provider contract.",
          "Poll too often and you burn the budget on searches that will not return anything new. Poll too slowly and the user waits. The answer is a per-search deadline, adaptive backoff, and early termination when the best available result is good enough.",
        ],
      },
      {
        heading: "Partial results are a product decision",
        body: [
          "The system does not need every provider to answer before it can be useful. It needs enough answers to rank confidently, and a UI that is honest about what is still arriving.",
          "Returning a fast, partial result and enriching it later is a better product than blocking on the slowest provider. It is also a better use of the quota, because the slow tail stops holding the fast path hostage.",
        ],
      },
      {
        heading: "Cost per search is a feature",
        body: [
          "Once the quota is visible, cost becomes designable. You can set a budget per search, measure which providers earn their calls, and decide where to degrade. A provider that is slow, expensive, and rarely the winner is a candidate for a lower priority, not a permanent dependency.",
          "This is not just an infrastructure concern. It changes what the product can promise. A comparison engine that knows its cost per search can decide when to be exhaustive and when to be fast.",
        ],
        list: [
          "Give every provider its own budget and its own failure mode.",
          "Put a deadline on the search, not just on the HTTP request.",
          "Terminate early when the marginal provider cannot change the answer.",
          "Make partial results visible instead of pretending they are complete.",
          "Track cost per search next to latency and error rate.",
        ],
      },
      {
        heading: "Design for the limit",
        body: [
          "The teams that struggle with quotas are usually the teams that designed for unlimited providers and added limits later. The teams that do well start with the limit as a design constraint, the same way they start with latency or memory.",
          "The quota is not the thing that stops the architecture. It is the thing that tells you what the architecture should be.",
        ],
      },
    ],
  },
];

export const timeline = [
  {
    year: "2018",
    title: "ICSE · 93.2%",
    body: "St. Paul's Convent School, Dasuya. First computer, first curiosity about how the internet actually works.",
  },
  {
    year: "2020",
    title: "CBSE PCM · 89%",
    body: "Kautilya Senior Secondary School. Physics, chemistry, maths, and a growing pile of code experiments.",
  },
  {
    year: "2021",
    title: "IIIT Kota · ECE",
    body: "Electronics and communication engineering. Systems, signals, and the first real engineering habits.",
  },
  {
    year: "2025",
    title: "B.Tech · GPA 8.58",
    body: "Graduated with a degree in ECE and a head start in backend engineering.",
  },
  {
    year: "2025",
    title: "Buyhatke · SDE Intern",
    body: "Built a cab comparison system from scratch. Learned what production traffic does to a clean design.",
  },
  {
    year: "2025 — now",
    title: "Buyhatke · SDE-1 Backend",
    body: "Comparison engines for flights, hotels, and food. Quotas, pipelines, calibration, and p99s.",
  },
];

export const principles = [
  {
    num: "01",
    title: "Measure it or it didn't happen.",
    body: "Latency, cost, calibration, correctness. If it matters, it gets a number and a chart. If it only gets an adjective, it is not engineering yet.",
  },
  {
    num: "02",
    title: "Keep the hot path boring.",
    body: "The request path should have the fewest moving parts that can still do the job. Excitement belongs in the demo, not in the p99.",
  },
  {
    num: "03",
    title: "Make it observable.",
    body: "A system you cannot see is a system you cannot improve. Traces, metrics, and honest dashboards are part of the product, not a post-launch chore.",
  },
];

export const currently = [
  { label: "Building", value: "Comparison systems at Buyhatke" },
  { label: "Learning", value: "Rust internals, one experiment at a time" },
  { label: "Writing", value: "Field notes on low-latency systems" },
  { label: "Open to", value: "Backend roles and hard problems" },
];

export const labItems = [
  {
    slug: "load-balancer",
    title: "Go enterprise load balancer",
    detail: "Weighted routing, circuit breakers, sticky sessions",
    year: "Oct 2025",
  },
  {
    slug: "vortex-vault",
    title: "VortexVault",
    detail: "Dual C++ / Rust vector database",
    year: "Nov 2025",
  },
];

export function getSystem(slug: string) {
  return systems.find((system) => system.slug === slug);
}

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNote(slug: string) {
  return notes.find((note) => note.slug === slug);
}

export function getNextSystem(slug: string) {
  const index = systems.findIndex((system) => system.slug === slug);
  return systems[(index + 1) % systems.length];
}

export function getNextNote(slug: string) {
  const index = notes.findIndex((note) => note.slug === slug);
  return notes[(index + 1) % notes.length];
}

export type StageItem = {
  slug: string;
  title: string;
  tagline: string;
  tag: string;
  href: string;
  video: string;
  poster: string;
};

export const stage: StageItem[] = [
  {
    slug: "bh-flights",
    title: "Buyhatke Flights",
    tagline: "The pipeline behind it: fan-out, quotas, polling.",
    tag: "At Buyhatke",
    href: "https://buyhatke.com/flights",
    video: "/assets/video/bh-flights.mp4",
    poster: "/assets/video/bh-flights.jpg",
  },
  {
    slug: "bh-hotels",
    title: "Buyhatke Hotels",
    tagline: "The live-compare gateway and provider mapping.",
    tag: "At Buyhatke",
    href: "https://buyhatke.com/hotels",
    video: "/assets/video/bh-hotels.mp4",
    poster: "/assets/video/bh-hotels.jpg",
  },
  {
    slug: "bh-food",
    title: "Buyhatke Food Compare",
    tagline: "One restaurant identity across Swiggy and Zomato.",
    tag: "At Buyhatke",
    href: "https://buyhatke.com/food-compare",
    video: "/assets/video/bh-food.mp4",
    poster: "/assets/video/bh-food.jpg",
  },
  {
    slug: "bh-grocery",
    title: "Buyhatke Grocery Compare",
    tagline: "Wired into the chat assistant that builds the basket.",
    tag: "At Buyhatke",
    href: "https://buyhatke.com/grocery-price-comparison",
    video: "/assets/video/bh-grocery.mp4",
    poster: "/assets/video/bh-grocery.jpg",
  },
  {
    slug: "bh-flight-alerts",
    title: "Buyhatke Price Alerts",
    tagline: "I work on the backend that sends the emails.",
    tag: "At Buyhatke",
    href: "https://buyhatke.com/flight-alerts",
    video: "/assets/video/bh-flight-alerts.mp4",
    poster: "/assets/video/bh-flight-alerts.jpg",
  },
  {
    slug: "flight-tracker",
    title: "Flight Tracker",
    tagline: "Every flight over India, live.",
    tag: "After hours",
    href: "https://flight-tracker-gamma-seven.vercel.app",
    video: "/assets/video/flight-tracker.mp4",
    poster: "/assets/video/flight-tracker.jpg",
  },
  {
    slug: "train-tracker",
    title: "Train Tracker",
    tagline: "2,346 trains. One live map.",
    tag: "After hours",
    href: "https://train-tracker-zeta.vercel.app",
    video: "/assets/video/train-tracker.mp4",
    poster: "/assets/video/train-tracker.jpg",
  },
  {
    slug: "dream-journal",
    title: "Dream Journal",
    tagline: "Mumble a dream. Get a trailer.",
    tag: "After hours",
    href: "https://dream-journal-neon-delta.vercel.app",
    video: "/assets/video/dream-journal.mp4",
    poster: "/assets/video/dream-journal.jpg",
  },
  {
    slug: "wardrobe-ai",
    title: "Wardrobe AI",
    tagline: "Get the look, not the link.",
    tag: "After hours",
    href: "https://wardrobe-ai-plum-two.vercel.app",
    video: "/assets/video/wardrobe-ai.mp4",
    poster: "/assets/video/wardrobe-ai.jpg",
  },
  {
    slug: "khelo-football",
    title: "Khelo",
    tagline: "Draft legends. Chase the 7–0.",
    tag: "After hours",
    href: "https://khelo-football.vercel.app",
    video: "/assets/video/khelo-football.mp4",
    poster: "/assets/video/khelo-football.jpg",
  },
  {
    slug: "k8-wizard",
    title: "K8 Wizard",
    tagline: "Zero to Kubernetes wizard.",
    tag: "After hours",
    href: "https://k8-wizard.vercel.app",
    video: "/assets/video/k8-wizard.mp4",
    poster: "/assets/video/k8-wizard.jpg",
  },
];

export type LedgerEntry = {
  name: string;
  line: string;
  proof: string;
  mine: number;
  total: number;
  span: string;
  stack: string[];
  group: "work" | "personal";
};

// Counts are authored commits vs repo total, from `git log --author`.
export const ledger: LedgerEntry[] = [
  {
    name: "Cat-LLM",
    line: "Natural-language product search with a vector cache, built alone.",
    proof:
      "A 211-row golden set across 27 categories gates every change. A cache-precision gate took regressions from 1 in 103 to 0 at zero extra LLM cost. I measured a reranker first (retrieval recall 103/103) and did not build it.",
    mine: 180,
    total: 180,
    span: "Mar – Aug 2026",
    stack: ["Node.js", "BGE-M3", "LanceDB"],
    group: "work",
  },
  {
    name: "Query categorizer",
    line: "Zero LLM in the request path.",
    proof: "1.18M labeled examples, p99 20ms, ECE 0.0104, same answer from Python, Rust and Node.",
    mine: 147,
    total: 148,
    span: "Sep – Oct 2026",
    stack: ["Rust", "Python", "GBDT"],
    group: "work",
  },
  {
    name: "Hotel live-compare gateway",
    line: "WebSocket gateway plus the mapping and consume crons behind hotel comparison.",
    proof:
      "Threaded Kayak currency and country through three repos, then traced its 403s to an empty User-Agent string.",
    mine: 169,
    total: 171,
    span: "Jul – Oct 2026",
    stack: ["Node.js", "WebSockets", "Redis"],
    group: "work",
  },
  {
    name: "Buyhatke extension",
    line: "The shipping browser extension and its node API layer. A team repo.",
    proof: "625 of 5,242 commits in the extension, 103 of 1,419 in its API layer, over sixteen months.",
    mine: 625,
    total: 5242,
    span: "Jun 2025 – Oct 2026",
    stack: ["TypeScript", "Vite", "Node.js"],
    group: "work",
  },
  {
    name: "Buyhatke Assistant app",
    line: "React Native food-compare app.",
    proof:
      "98 commits in three days: Swiggy delivery-fee parity with the extension, UI-thread price tickers, and a savings hero that counts up.",
    mine: 98,
    total: 481,
    span: "Oct 2026",
    stack: ["React Native", "TypeScript"],
    group: "work",
  },
  {
    name: "Food and grocery chat",
    line: "One chat box that routes to food or grocery, finds the cheapest match and builds the cart. It never places the order.",
    proof:
      "Found that two content scripts answered every LLM call, so a stale reply leaked into the next request.",
    mine: 0,
    total: 0,
    span: "Jun 2026",
    stack: ["SvelteKit", "LLM"],
    group: "work",
  },
  {
    name: "Best Way To Pay configs",
    line: "Per-site checkout configs served from a CDN: one JSON per site, a kill switch, merge to publish.",
    proof: "Amazon coupon savings and every bank offer, Nykaa payment pages, and more.",
    mine: 37,
    total: 37,
    span: "Sep – Oct 2026",
    stack: ["JSON", "CDN"],
    group: "work",
  },
  {
    name: "MAGIC-OCR",
    line: "ID-card OCR that reads fields by layout, with no model training.",
    proof:
      "A geometry fix passed all 104 tests, then lost 32 real images for every 9 it gained. The corpus sweep caught it and I reverted it.",
    mine: 70,
    total: 70,
    span: "Aug 2026",
    stack: ["Python", "OCR"],
    group: "personal",
  },
  {
    name: "Anime App",
    line: "A streaming browser with a six-theme engine.",
    proof: "32 commits in one day, including a neobrutalist theme and a full type system.",
    mine: 32,
    total: 32,
    span: "Jul 2026",
    stack: ["Next.js", "TypeScript"],
    group: "personal",
  },
  {
    name: "Party Watch",
    line: "Real-time YouTube watch parties with an ad-aware overlay.",
    proof: "When an ad starts, the room gets mini-games, polls and music trivia instead.",
    mine: 0,
    total: 0,
    span: "",
    stack: ["WebSockets", "YouTube API"],
    group: "personal",
  },
  {
    name: "pi-opencode-bridge",
    line: "A loopback OpenAI-compatible API with tool calling over free models.",
    proof: "Starts on demand and exits after 30 idle minutes.",
    mine: 0,
    total: 0,
    span: "",
    stack: ["Node.js"],
    group: "personal",
  },
  {
    name: "yt-pipeline",
    line: "Video pipeline with forced alignment and a silence quality gate.",
    proof: "Switched to faster-whisper and handled zero-duration ASR words.",
    mine: 16,
    total: 16,
    span: "Jul 2026",
    stack: ["Python", "faster-whisper"],
    group: "personal",
  },
  {
    name: "Memcached clone",
    line: "Memcached in C++, built to understand it.",
    proof:
      "A kqueue event loop, a thread-safe cache with TTL, a protocol parser and unit tests, all written from the protocol up.",
    mine: 0,
    total: 0,
    span: "",
    stack: ["C++", "kqueue"],
    group: "personal",
  },
  {
    name: "API dossiers",
    line: "Written, dated contracts for APIs that have no docs.",
    proof:
      "A 638-line railjournal.in dossier and a Flightradar24 feed dossier, each re-probed live and stamped with the date. A 1,145-line crawl of a streaming site's endpoints.",
    mine: 0,
    total: 0,
    span: "2026",
    stack: ["curl", "Reverse engineering"],
    group: "personal",
  },
  {
    name: "VibeScribe",
    line: "A macOS menu-bar dictation app.",
    proof: "One command builds the app, installs it to /Applications and launches it.",
    mine: 0,
    total: 0,
    span: "",
    stack: ["Electron", "Node.js"],
    group: "personal",
  },
  {
    name: "WhatsApp support stack",
    line: "Customer-support automation for WhatsApp.",
    proof:
      "Webhook ingestion, AI-drafted replies, a semantic cache over past resolutions, human escalation tracking and an operations dashboard, wired up with Docker Compose.",
    mine: 0,
    total: 0,
    span: "",
    stack: ["Node.js", "Docker", "LLM"],
    group: "personal",
  },
  {
    name: "local-llm-bridge",
    line: "A bridge that puts a local model behind a plain HTTP API.",
    proof: "OCR routes, a health monitor and a Postman collection to drive it.",
    mine: 0,
    total: 0,
    span: "",
    stack: ["TypeScript", "Node.js"],
    group: "personal",
  },
  {
    name: "8-bit chess",
    line: "Chess in React Native, with a pixel-art skin.",
    proof: "Three builds in one day while trying the same idea three ways.",
    mine: 3,
    total: 3,
    span: "Jul 2025",
    stack: ["React Native", "TypeScript"],
    group: "personal",
  },
];
