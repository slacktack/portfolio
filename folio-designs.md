# FOLIO DESIGNS — Tushar Gautam

> Working design doc for a portfolio that makes backend work feel like a place you want to hang out in.
> Research + ideas + copy + build plan. Take what's useful, ignore what isn't.

---

## 0. The thesis

Most developer portfolios are a hero, a grid of project cards, and a wall of tech logos.
They describe. They don't prove.

Tushar's work is genuinely unusual: comparison engines at real traffic, a zero-LLM categorizer at p99 20ms, cross-language parity, a vector database with two backends. That is not "projects." That is **infrastructure with receipts**.

So the site should do one thing: **make the invisible layer visible.**

Not a 3D playground with a résumé stapled to it. Not a template with better fonts.
A warm, tactile, editorial-engineer portfolio where every claim has a number, every number has a story, and the person behind the terminal is actually in the room.

The formula:

**Aashish's art direction + Sarthak's narrative clarity + Ram's restraint + JS Mastery's motion craft — filtered through Tushar's actual backend work.**

The through-line: **comparison.** His job is to take seven versions of reality and resolve them into one answer. The site can be built on the same idea.

---

## 1. Research: the four references

### 1.1 Sarthak Sharma — sarthak-sharma-portfolio-six.vercel.app

**What it is:** a narrative personal brand site. Engineer / educator / builder. Almost a documentary in scroll form.

**What it does well:**

- **A clear triad.** "ENGINEER. EDUCATOR. BUILDER." Everything on the page reinforces those three identities.
- **Metrics as monuments.** 50,000+ students, 2.5x revenue growth, 50+ clients. Big type, short context, footnote honesty.
- **Editorial section numbering.** "01 / PRESENCE", "02 / SELECTED WORK", "03 / HOW I THINK." It feels like a magazine, not a dashboard.
- **Repeated marquee words.** "STRUCTURE STRUCTURE STRUCTURE", "RIPPLES RIPPLES RIPPLES." Rhythm and visual texture.
- **"Choose a perspective."** A small interactive that lets the visitor look at the same work through Build / Teach / Connect.
- **Case studies are stories.** Problem, context, decisions, impact. Not screenshot galleries.
- **The person is present.** Photos, a stage shot, a timeline from 2021 to today, values, what's next.
- **Public proof links.** The PhysicsWallah investment record is linked. That's a power move: claim, then let the visitor verify.
- **Honest footnotes.** "Audience snapshots, not personal follower counts." Credibility through precision.

**What to steal for Tushar:**

| Idea | How to adapt |
|---|---|
| Triad identity | "ENGINEER. BUILDER. SYSTEMS THINKER." or "BACKEND. INFRASTRUCTURE. REAL TRAFFIC." |
| Metric monuments | 478K requests/day, 3.79M events/day, p99 20ms, 1.18M examples, 99% extraction accuracy |
| Section numbering | 00 / BOOT, 01 / SYSTEMS, 02 / RECEIPTS, 03 / THE HUMAN, 04 / NOTES, 05 / HELLO |
| Repeated marquee | "COMPARE. RESOLVE. SERVE." or "P99. P99. P99." |
| Perspective toggle | "Lens: Systems / Impact / Human" — same case study, three emphases (v2) |
| Story-first case studies | Problem → constraints → architecture → hard part → what broke → what it proves |
| Public proof | Link public product pages, GitHub, LeetCode, benchmark repos, published notes |
| Footnoted honesty | Date every metric. Label demos as simulations. No vanity numbers without context |
| Timeline | Dasuya → IIIT Kota → Bangalore → Buyhatke intern → SDE-1 |
| Person behind the work | Portrait, desk, city, off-screen life, what's next |

**What not to steal:** the exact "educator" framing (that's his story), the long repeated-word stacks (use once or twice, not everywhere), and the 50,000+ social-proof tone if the numbers aren't yours.

---

### 1.2 The YouTube playlist — "Best Developer Portfolio Websites" (JS Mastery)

Videos in the playlist:

1. Build and Deploy an Amazing 3D Developer Portfolio in React with Three.js
2. Build and Deploy an Amazing 3D Web Developer Portfolio in React JS | Beginner Three.js Tutorial
3. Build and Deploy a Fullstack Responsive Portfolio Website | ULTIMATE Step By Step Tutorial 2023
4. Build and Deploy an Apple Website with React | Beginner Three.js & GSAP Tutorial
5. Build and Deploy THE PERFECT Portfolio Website | Create a Portfolio from Scratch
6. How I Made My Website Load in 0.364 Seconds
7. Build and Deploy an Amazing Developer Portfolio with Next JS and Framer Motion
8. Build and Deploy 3 Modern UI/UX Websites and Get Hired as a Frontend Developer

**What the playlist teaches:**

- **A 3D hero is a magnet.** A floating island, a desk scene, a particle field. It signals craft in the first second.
- **Scroll is a narrative device.** GSAP ScrollTrigger + sticky sections can turn a page into a sequence.
- **Micro-motion sells quality.** Framer Motion transitions, hover states, staggered reveals, page transitions.
- **Apple-style sections work.** Sticky product visuals, copy that changes as you scroll, one idea per viewport.
- **Performance is a feature.** The 0.364s video is the most important one in the list. A beautiful site that loads like a brick is a bad site.
- **The standard recipe:** preloader, hero, about, projects, tech stack, testimonials, contact, deploy.

**What to steal for Tushar:**

| Idea | How to adapt |
|---|---|
| One 3D moment | A "packet's journey" scene: request → load balancer → cache → provider adapters → response. Scroll scrubs the camera. One scene, not a world |
| Scroll storytelling | Architecture diagram that assembles itself as you scroll. Nodes light up in request order |
| Micro-interactions | Metric hover → sparkline; project card hover → live screenshot; email copy → toast |
| Page transitions | View Transitions API or Motion. Case study opens like a file |
| Preloader | "Cold start: 232ms" boot sequence. Under 1 second, skippable, once per session |
| Smooth scroll | Lenis. Subtle. Respect reduced motion |
| Custom cursor | Only in data-heavy sections. Crosshair + coordinates. Never hide the real cursor entirely |
| Tech stack section | Not logos. "Go for the hot path. Rust when the p99 matters. Python when the model trains. TypeScript when it ships" |
| Testimonials | Real quotes from teammates/manager, with photos and roles |
| Deploy | Vercel, custom domain, analytics, OG images |

**What not to steal:**

- The generic floating-island 3D hero. Everyone has it.
- 5–10 second preloaders. They kill conversion.
- Desktop-only effects. Most recruiters will open the link on a phone.
- Orbits of 40 tech logos. It says nothing.
- Template sections in the same order as every tutorial.

---

### 1.3 ramx.in — Ramkrishna Swarnkar

**What it is:** a craftsman's home on the internet. Minimal, fast, personal, confident.

**What it does well:**

- **Restraint.** Almost no decoration. Type, spacing, and content do the work.
- **Cmd+K command palette.** "CtrlK" sits in the nav. It signals "this person builds tools."
- **A tight home page.** One-liner, social row, experience timeline, latest writing, personal pages.
- **Personal taxonomy pages.** Gears, Setup, Terminal, Books, Movies. This is the "real life" layer, systematized.
- **Opinionated writing titles.** "How to Fuck Around and Find Out", "The AI Paralysis", "A deep dive into Cursor's Code Indexing."
- **Now playing.** A Spotify widget. Small, human, alive.
- **RSS.** Respect for the open web.
- **Footer sitemap.** Everything is one click away.
- **Experience as a timeline.** Company, role, dates, location. No fluff.
- **"Working" badge.** Current status at a glance.

**What to steal for Tushar:**

| Idea | How to adapt |
|---|---|
| Cmd+K | Navigate, copy email, download resume, toggle theme, jump to case studies, hidden `/dashboard` |
| Personal taxonomy | `/uses` (desk, keyboard, terminal), `/bookshelf`, `/now`, `/stats` |
| Now playing | Spotify "debugging soundtrack" widget. Optional, lazy-loaded |
| RSS + MDX blog | Field notes. Real engineering lessons, not tutorials |
| Tight experience timeline | Buyhatke SDE-1, Buyhatke intern, IIIT Kota |
| Minimal nav | Systems / Lab / Notes / About / Resume + ⌘K |
| Footer sitemap | Every page, every social, "last deployed" commit |
| Opinionated titles | "Zero LLM in the request path", "The quota is the architecture", "Seven hotels, one room" |

**What not to steal:** the near-total minimalism if it sandboxes the personality. Ram's site works because his writing carries it. Tushar's site can be minimal in structure but should be warmer and more visual.

---

### 1.4 Aashish Thakuri — aashishthakuri.com

**What it is:** the emotional target. A portfolio with a point of view, a pulse, and real client work presented like art direction.

**What it does well:**

- **A world, not a page.** Sky artwork, floating cutout objects (guitar, keyboard, headphones, sampler, watch), paper textures, torn edges.
- **A headline with an image inside it.** "DESIGN & [image] CODE" — type and image collide.
- **Personality in one line.** "GOOD TASTE, BAD SLEEP." You remember it.
- **Marquee of real clients.** Good Company, Side B, Panel Press, KTL, ClashChest.
- **Project cards with specific one-liners.** "Pet care with heart, from the first hello to a cosy stay." Not "A pet care website."
- **Case studies with a repeatable structure.** The problem / The strategy / The decisions. Then numbered screens: "1 / Pet care, with heart — Homepage."
- **Real client attribution.** Client name, category, rights note. It feels professional and honest.
- **A services section with visual proof.** Each service paired with actual screens from the work.
- **Direct contact.** Email and WhatsApp, no form maze.
- **The personal artifact.** A typewriter photo, a portrait on a bench, a quote about models and human opinion. The site has a soul.
- **Craft signals everywhere.** Custom type treatment, cutouts, motion, image treatment, spacing.

**What to steal for Tushar:**

| Idea | How to adapt |
|---|---|
| Art-directed world | "Engine room" instead of "sky": blueprint grid, paper, halftone, cutout hardware, terminal paper |
| Headline with inline image | "I build the [server rack cutout] layer you never see." Or a small live latency chip inside the headline |
| Personality line | "P99 OR IT DIDN'T HAPPEN." / "HIGH UPTIME, LOW PATIENCE." / "FAST PATHS, SLOW MORNINGS." Pick one, mean it |
| Real client/project marquee | MakeMyTrip, Booking.com, Agoda, Goibibo, Cleartrip, Expedia, Kayak, Swiggy, Zomato, Uber, Ola, Rapido, Skyscanner (check permission; logos may need clearance) |
| Specific project one-liners | "Seven providers. One hotel. One answer." Not "Hotel comparison platform" |
| Problem / strategy / decisions | The case study template. It forces substance |
| Numbered screens | "01 / The fan-out", "02 / The dedupe", "03 / The poll", "04 / The fallback" |
| Client attribution | Role, team, dates, stack, status. Credit the team where due |
| Services with proof | Backend architecture, comparison systems, search/RAG, performance, observability — each with a real artifact |
| Direct contact | Email + calendar link. WhatsApp optional, probably no |
| Personal artifacts | Desk, keyboard, chai cup, whiteboard sketches, city, hometown, first server |
| Tactile texture | Paper grain, stamps, tape, redaction bars, terminal screenshots as artifacts |

**What not to steal:** the sky, the specific cutout objects, the exact type pairing, the "designer" framing. Take the *principle* — a site with a world and a human in it — not the skin.

---

### 1.5 The pattern across all four

1. **A strong point of view beats a long feature list.**
2. **Specificity is credibility.** Numbers, names, dates, artifacts.
3. **The person is the differentiator.** Anyone can list a stack. Not everyone has a story.
4. **Motion is seasoning, not the meal.** The best sites use it to explain, not to decorate.
5. **Performance is part of the design.** Especially for a backend engineer.
6. **Every great portfolio has one memorable moment.** Sarthak's metric monuments, Aashish's cutout world, Ram's command palette, JS Mastery's 3D hero. Tushar needs one: **the live systems playground.**

---

## 2. Positioning

### 2.1 Who you are

A backend engineer who builds the systems behind everyday decisions: which hotel, which flight, which restaurant, which cab. You work where traffic, provider quotas, latency, identity resolution, and cost collide. You make messy external data behave like one clean answer.

You are not "a passionate developer."
You are not "a full-stack enthusiast."
You are the person who gets paged when the p99 moves.

### 2.2 The one-liner

**"I build the invisible layer — the systems that make 478,000 requests a day feel like a single tap."**

Shorter variants:

- "Backend engineer. Comparison engines, low-latency pipelines, systems that stay up."
- "I make millions of requests feel like one answer."
- "The invisible layer, made visible."
- "Engineer of the in-between."

### 2.3 The enemy

The portfolio that says "I am passionate about technology" and shows a todo app.

Also: the idea that backend work is boring. The site's job is to make queues, caches, retries, and calibration curves look as alive as a product launch.

### 2.4 The promise

- **For recruiters:** in 30 seconds, you know what he's shipped and at what scale.
- **For engineers:** in 5 minutes, you've learned something real about quota-aware polling, cross-language parity, or calibration.
- **For potential collaborators:** in 10 minutes, you know what it's like to work with him.

### 2.5 Proof hierarchy

Use this order everywhere:

1. **Numbers** (478K requests/day, p99 20ms, 1.18M examples)
2. **Artifacts** (architecture diagrams, Grafana panels, benchmark tables, code)
3. **Stories** (what broke, what changed, what it taught)
4. **Claims** (only after the first three)

Never lead with adjectives.

---

## 3. Art direction

### 3.1 Three directions

**A. The Engine Room (recommended)**
Warm paper + ink + safety orange + blueprint blue. Technical-drawing grid. Mono labels. Cutout photographs of hardware, keyboard, chai cup, whiteboard sketches. Editorial type. Feels like a beautifully printed operations manual meets a zine.
- Pros: distinctive, warm, human, flexible, works on mobile, not another dark dev portfolio.
- Cons: needs real photography and strong art direction to not look like a template.

**B. Terminal Noir**
Near-black, phosphor green/amber, monospace, scanlines, dashboards, log streams.
- Pros: instantly reads "backend," easy to execute.
- Cons: overdone, hard to read long-form, low warmth, risks looking like every other dev site.

**C. Swiss Editorial**
White, huge grotesk, red accent, strict grid, numbers as art.
- Pros: timeless, elegant, content-first.
- Cons: less personality, can feel cold, harder to make memorable.

### 3.2 Recommendation

**Direction A, with C's typographic discipline and B used only inside console widgets.**

The rule: the site should look like it was made by a person, not generated by a framework. Warm surfaces, sharp type, real artifacts, one hot accent. Dark mode exists as "Night shift" — same system, inverted, not a separate aesthetic.

### 3.3 The concept: The Invisible Layer

A portfolio built like an operations manual for a system you're about to explore.

- The hero is a **comparison race**: providers stream in, prices settle, one answer wins.
- The scroll is a **request lifecycle**: hero → fan-out → resolve → serve → prove → the human behind it.
- The proof is a **receipts wall**: real artifacts, dated, labeled, redacted where needed.
- The personality is in **marginalia**: jokes, footnotes, field notes, objects on the desk, the city, the road here.

Tagline: **"The invisible layer, made visible."**

---

## 4. Design system

### 4.1 Type

| Role | Choice | Fallback / free option |
|---|---|---|
| Display | PP Neue Montreal / Söhne | Instrument Sans, General Sans, Geist |
| Editorial accent | Instrument Serif Italic | Newsreader Italic, Lora Italic |
| Mono / labels / data | JetBrains Mono | Geist Mono, IBM Plex Mono |
| Body | Same as display at smaller sizes | Instrument Sans |

Rules:

- Display: tight tracking (-0.03em), large sizes, short lines.
- Serif italic: only for emotional or reflective lines. One per section max.
- Mono: uppercase, 11–13px, wide tracking, for labels, metrics, timestamps, buttons.
- Numbers: tabular figures. Use mono for data, display for monuments.
- Never more than three families in one viewport.

### 4.2 Color

| Token | Light | Dark ("Night shift") | Use |
|---|---|---|---|
| `--paper` | `#F4F1EA` | `#0E0E0C` | Page base |
| `--ink` | `#111110` | `#F2EFE8` | Primary text |
| `--muted` | `#6B6860` | `#9A968C` | Secondary text |
| `--line` | `#D8D3C7` | `#2A2925` | Borders, grid |
| `--surface` | `#EAE6DC` | `#171714` | Cards, panels |
| `--accent` | `#E8491D` (signal orange) | `#FF5A2B` | CTAs, highlights, live data |
| `--data` | `#2447E0` (blueprint blue) | `#7C93FF` | Charts, links, diagrams |
| `--success` | `#2F6B4F` | `#6FD3A1` | Healthy systems |
| `--warning` | `#C98A00` | `#FFC24B` | Quotas, degraded states |

Usage ratio: 80% paper/ink, 15% surface/line, 5% accent. The accent should feel expensive because it's rare.

### 4.3 Grid and layout

- 12-column desktop grid, 24px gutters, max width 1440px, content width 1200px.
- Mobile: 4 columns, 20px margins.
- Generous vertical rhythm: 120–160px between sections on desktop, 72–96px on mobile.
- Asymmetry over symmetry: text left, artifact right; numbers oversized and bleeding off-grid.
- A thin fixed side rail (desktop only) with current section and scroll progress, styled like a system status bar.
- Sticky chapter labels: "01 / SYSTEMS" stays visible while the section is in view.

### 4.4 Components

- **Metric block:** huge number, small label, one-line context, optional sparkline, footnote marker.
- **Case card:** full-bleed artifact, mono index, title, one-line promise, 2–3 metric chips, hover reveals "Open case study."
- **Receipt:** screenshot with tape/polaroid framing, caption, date, "redacted" stamp where needed.
- **Diagram frame:** blueprint grid, mono labels, animated packets, legend, download link.
- **Console panel:** dark inset panel for code, logs, traces, benchmark output.
- **Command palette:** ⌘K, grouped results, keyboard hints, fuzzy search.
- **Status pill:** green dot + "Available for backend roles" or "Currently building."
- **Tag:** mono, bordered, uppercase. Used for stack and categories, never as decoration.
- **Footnote:** superscript number, hover reveals note, click opens a small popover.
- **Marquee:** one per page max. Metrics or values, not logos.
- **HTTP form:** a contact form styled as a request/response exchange.

### 4.5 Motion

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` for entrances; `cubic-bezier(0.65, 0, 0.35, 1)` for exits.
- **Durations:** 180ms micro, 420ms standard, 800ms narrative. Nothing over 1.2s unless it's scroll-scrubbed.
- **Scroll:** Lenis smooth scroll; GSAP ScrollTrigger for the architecture sequence and sticky sections.
- **Reveals:** 12–20px translate + opacity. Stagger 60–90ms. No bouncing.
- **Hover:** 120–180ms. Cards lift 2px, artifacts scale 1.01, labels slide 4px.
- **Packets:** small dots traveling along SVG paths. Slow enough to follow, fast enough to feel alive.
- **Counters:** animate once when in view, 900ms, ease-out. Respect reduced motion.
- **Page transitions:** View Transitions API; case study cover morphs into the header.
- **Reduced motion:** disable Lenis, scrubbed sequences become static diagrams, counters snap to final values, no autoplay video.

### 4.6 Texture and imagery

- Paper grain at 3–5% opacity. Subtle. Not a filter over everything.
- Halftone dots on diagrams and large numbers.
- Blueprint grid at 1px, 8% opacity, only inside technical sections.
- Redaction bars on sensitive screenshots. Make them look intentional.
- Tape, stamps, punch holes, torn edges. Use sparingly, one or two per page.
- Cutout photography: keyboard, server rack, chai cup, headphones, notebook, Raspberry Pi. Real photos, transparent PNGs, consistent light.
- Screenshots treated like artifacts: browser chrome removed, thin border, caption, date.
- No stock photos of people typing. Ever.

### 4.7 Sound

- Off by default. A small speaker toggle in the footer.
- If on: soft mechanical key clicks on palette actions, a low server hum on the lab page, a subtle whoosh on page transitions.
- Never autoplay. Never on mobile by default. Always remember the preference.

---

## 5. Information architecture

```
/                     Home
/systems              All case studies
/systems/flights      Flight comparison
/systems/hotels       Hotel comparison
/systems/food         Food comparison
/systems/categorizer  Zero-LLM query categorizer
/systems/search       LLM semantic product search
/systems/cabs         Cab comparison (intern era)
/lab                  Interactive experiments
/lab/load-balancer    Go load balancer visualizer
/lab/vector-search    VortexVault demo
/notes                Field notes / blog index
/notes/[slug]         Essays
/about                The human, timeline, principles
/now                  What I'm doing now
/uses                 Desk, setup, terminal, gears
/bookshelf            Books, films, music (optional)
/stats                Live-ish stats (optional)
/resume               HTML resume + PDF download
/contact              Contact (or home section + /contact)
404                   Load balancer joke
```

Navigation (desktop):

`TG` mark · Systems · Lab · Notes · About · `⌘K` · Resume ↗ · Let's talk

Mobile: logo, "Menu" (full-screen overlay with large type), resume button.

Footer: sitemap, socials, email, "Last deployed: [commit] · [time]", performance badge, copyright.

---

## 6. Home page

### 6.1 Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ TG  tushar gautam          Systems  Lab  Notes  About   ⌘K       │
│                                          Resume ↗   [ Let's talk ]│
├──────────────────────────────────────────────────────────────────┤
│  BACKEND ENGINEER · BANGALORE, IN · ● AVAILABLE                  │
│                                                                  │
│  I build the                                                     │
│  invisible layer —                                               │
│  the part you never see                                          │
│  until it breaks.                                                │
│                                                                  │
│  Comparison engines, low-latency pipelines, and systems          │
│  that hold at 3.79M events a day.                                │
│                                                                  │
│  [ See the systems → ]    [ Download resume ↗ ]                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  LIVE COMPARISON · SIMULATED                               │  │
│  │  MakeMyTrip ₹4,820   Booking ₹4,795   Agoda ₹4,760  ...    │  │
│  │  ────────────────→  best: Agoda ₹4,760  ·  7 providers     │  │
│  │  16,204 compares today        p99 20ms        quota: OK     │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  ← 478K REQUESTS/DAY · 3.79M EVENTS/DAY · P99 20MS · 1.18M ... → │
├──────────────────────────────────────────────────────────────────┤
│  01 / THE SYSTEMS                                                │
│  Ideas are easy.                                                 │
│  Systems are where they meet reality.                            │
│                                                                  │
│  [ Flight comparison — 478K req/day ]                            │
│  [ Hotel comparison — 7 providers, 1 identity ]                  │
│  [ Food comparison — FSSAI joins ]                               │
│  [ Categorizer — zero LLM, p99 20ms ]                            │
│  [ Lab: load balancer ] [ Lab: VortexVault ]                     │
├──────────────────────────────────────────────────────────────────┤
│  02 / THE RECEIPTS                                               │
│  Don't take my word for it.                                      │
│  [ Grafana panel ] [ benchmark table ] [ flamegraph ] [ PR ]     │
├──────────────────────────────────────────────────────────────────┤
│  03 / THE HUMAN                                                  │
│  Dasuya → Kota → Bangalore.                                      │
│  [ portrait ] [ timeline ] [ three principles ] [ what's next ]  │
├──────────────────────────────────────────────────────────────────┤
│  04 / FIELD NOTES                                                │
│  "Zero LLM in the request path" →                                │
│  "232ms cold start" →                                            │
│  "The quota is the architecture" →                               │
├──────────────────────────────────────────────────────────────────┤
│  05 / SAY HELLO                                                  │
│  Got a hard problem? I like those.                               │
│  [ email ] [ LinkedIn ] [ GitHub ] [ X ] [ LeetCode ]            │
│  POST /contact  →  200 OK                                        │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Section-by-section

**Boot / preloader (optional)**

- Paper background. Mono line: `booting tushar.gautam — cold start 232ms`.
- A thin progress bar. Then the name assembles.
- Max 800ms. Skip on repeat visits via localStorage. Skip if reduced motion.

**Hero**

- Eyebrow: `BACKEND ENGINEER · BANGALORE, IN · ● OPEN TO HARD PROBLEMS`.
- Headline in three lines, one word set in serif italic for contrast: "I build the *invisible* layer — the part you never see until it breaks."
- Subline: one sentence with the biggest numbers.
- CTAs: primary "See the systems", secondary "Download resume".
- Right side (desktop): the live comparison widget. On mobile, it sits below the CTAs, full width.
- The widget is a **simulation**. Label it. It races provider responses, dedupes, and settles on a winner. Each cycle takes 2.5–4s. Pause when off-screen, pause on hover, respect reduced motion (static final state).
- Under the widget: three tiny status items — compares today, p99, quota status. They tick occasionally. They are decorative but honest: label "simulated."

**Metric marquee**

- One line, infinite scroll, mono uppercase.
- `478K+ REQUESTS/DAY · 3.79M+ EVENTS/DAY · P99 20MS · 1.18M EXAMPLES · 99% EXTRACTION · 7+ PROVIDERS · 232MS COLD START`
- Pauses on hover. Speed tied to scroll velocity (subtle).

**01 / The Systems**

- Section intro: "Ideas are easy. Systems are where they meet reality."
- Four flagship cards, each a horizontal band with a large artifact, an index, a title, a one-line promise, and metrics.
- Card 1: Flights — "478,000 requests a day. Every one accounted for." Metrics: 478K+ req/day, 3.79M+ events/day, 234K API calls/hr.
- Card 2: Hotels — "Seven providers. One hotel. One answer." Metrics: 7+ providers, 16K+ compares/day, 1.2K hourly peak.
- Card 3: Food — "The license number that identifies a restaurant." Metrics: Swiggy + Zomato, ClickHouse, license-based identity.
- Card 4: Categorizer — "Zero LLM in the request path." Metrics: 1.18M examples, p99 20ms, ECE 0.0104.
- Below: a two-up "Lab" strip for the Go load balancer and VortexVault, visually distinct (console panels, not editorial cards).
- Hover: artifact gains a thin accent border, title shifts 4px, "Open case study" appears. No tilt gimmicks.

**02 / The Receipts**

- A wall of evidence. This is the Aashish-real-life layer, but for engineering.
- Layout: a loose grid of polaroids/frames, slightly rotated (±1.5deg), with tape and captions.
- Items: Grafana screenshot, benchmark table, flamegraph, terminal output, PR screenshot, load test chart, architecture sketch, a photo of a whiteboard.
- Each has a caption: what it is, when, what it proves. Redacted where needed.
- One featured receipt: a big p99 chart or the parity test output, with a short annotation.
- Link: "See all receipts →" (could be a section on /about or its own page).
- This section is the credibility bomb. Do not skip it.

**03 / The Human**

- Split layout: portrait left (4:5, natural light, not a suit), text right.
- Headline: "Started in Dasuya. Learned in Kota. Shipping in Bangalore."
- Short intro in first person, 3–4 sentences. No "passionate."
- Timeline: 2018 (ICSE), 2020 (CBSE PCM), 2021–2025 (IIIT Kota, ECE, GPA 8.58), Jan 2025 (Buyhatke intern), Aug 2025 (SDE-1), now.
- Three principles: "Measure it." "Keep the hot path boring." "Make it observable."
- Link: "More about me →" and "What I'm doing now →".

**04 / Field Notes**

- Three latest essays, large titles, one-line dek, date, reading time.
- Titles that make engineers click:
  - "Zero LLM in the request path"
  - "232ms cold start: mmap, indexes, and the Rust hot path"
  - "The quota is the architecture"
- Link: "All notes →" and RSS icon.

**05 / Say Hello**

- Big line: "Got a hard problem? I like those."
- Subline: "Backend roles, systems work, or a conversation about p99s. I reply within 48 hours." (Only promise this if true.)
- Contact form styled as an HTTP exchange:
  ```
  POST /contact
  Content-Type: application/json

  {
    "name": "…",
    "email": "…",
    "message": "…"
  }

  → 200 OK  ·  message queued
  ```
- Direct email with a copy button. LinkedIn, GitHub, X, LeetCode.
- Availability pill and timezone.

**Footer**

- Sitemap columns: Systems, Lab, Notes, Personal, Elsewhere.
- "This page: 38 KB JS · LCP 0.9s · CLS 0.00 — measured on a mid-tier phone, not my MacBook." (Fill with real numbers after launch.)
- "Built with Next.js, TypeScript, and a p99 budget. No template."
- "Last deployed [commit hash] · [relative time]" pulled from GitHub.
- Copyright. "No cookies. No trackers. Just requests."

---

## 7. Case studies

### 7.1 Template

Every case study follows the same skeleton. Consistency makes the site feel authored.

1. **Cover** — title, one-line promise, year, role, team, stack, status. Full-bleed artifact.
2. **The numbers** — 3–4 metric blocks with context and dates.
3. **The problem** — why this is hard, in plain language. 2–3 paragraphs.
4. **The constraints** — quotas, latency, cost, providers, freshness, team size. A short list.
5. **The architecture** — interactive diagram + downloadable full-res version. Legend. Request path numbered.
6. **The hard part** — the one or two genuinely difficult decisions. Show the tradeoff, not just the outcome.
7. **What broke** — a real failure, bug, or surprise. What it taught. This is the most credible section on the site.
8. **What I'd do differently** — honesty. One or two bullets.
9. **Receipts** — screenshots, benchmark tables, code snippets, PR links, Grafana panels, flamegraphs.
10. **What this proves** — map the work to capabilities, briefly. No skill bars.
11. **Next case study** — a large link with the next artifact.

Writing rules:

- First person. Short sentences. Concrete nouns.
- Every claim gets a number, a date, or a link.
- No "revolutionized," "seamless," "cutting-edge," "passionate."
- Explain the tradeoff before the result.
- Credit the team. "We" for team work, "I" for personal ownership.
- Label simulations and estimates. Never present a target as a measured result.

### 7.2 Flights — the traffic monster

**One-liner:** "478,000 requests a day. Every one accounted for."

**Cover:** a departure board / flight path diagram, or a screenshot of the public comparison product. Mono label: `SYSTEM 01 · REAL-TIME AGGREGATION`.

**Numbers:**
- 478K+ requests/day
- 3.79M+ result-served events/day
- 234K+ Skyscanner API calls/hour
- 68K CREATE + 54K POLL calls

**The problem:** metasearch looks simple from the outside. Type a route, get prices. Underneath, every provider has a different contract, a different quota, a different latency profile, and a different definition of "result." The product promise is completeness and freshness. The infrastructure reality is partial data, rate limits, and asynchronous polling.

**Constraints:**
- Provider quotas and per-key limits.
- Async search: create, then poll, then collect.
- Latency budget for the first useful result.
- Cost per search.
- Graceful degradation when a provider is slow or down.
- Web and mobile clients consuming the same pipeline.

**Architecture (diagram):**
`client → API gateway → search orchestrator → provider adapters (Skyscanner, …) → queue → poll workers → result normalizer → dedupe/rank → cache → stream/response → client`
- Side rail: quota governor, circuit breakers, metrics/tracing.
- Animate a packet along the path on scroll. Number each stage.

**The hard part:**
- Quota-aware polling: how to poll aggressively enough to feel fast without burning the provider budget. Batching, backoff, priority, and early termination.
- Fan-out/fan-in with partial results: return something useful in 400ms, enrich as slower providers arrive.
- Result normalization and dedupe across providers: same itinerary, different fare rules and baggage.

**What broke:** a real story about a quota spike, a polling storm, a stale cache, or a provider change. Fill in from memory. The lesson should be specific: "We added a token bucket per provider and a per-search deadline; p95 dropped and quota errors went to zero."

**Receipts:** quota dashboard, p99 chart, a sanitized trace, the adapter interface, a benchmark table.

**What this proves:** high-throughput API orchestration, async pipelines, quota/cost control, observability, product-minded latency tradeoffs.

### 7.3 Hotels — seven providers, one identity

**One-liner:** "Seven providers. One hotel. One answer."

**Numbers:** 7+ providers, 16K+ compares/day, 1.2K hourly peak, real-time WebSocket pipeline.

**The problem:** the same hotel has seven names, seven addresses, seven star ratings, and seven room taxonomies. Users don't want seven results. They want one hotel with the best price. Identity resolution is the product.

**Constraints:** fuzzy names, geo distance, amenities, star ratings, room types, stale rates, provider-specific IDs, live price updates over WebSocket.

**Architecture:** provider adapters → normalization → candidate generation → matching/scoring → canonical hotel graph → rate store → WebSocket fan-out → client.

**The hard part:** cross-provider identity resolution. Name normalization, geo clustering, amenity and star agreement, threshold tuning, and a human-review path for ambiguous matches. The failure mode is worse than a missing result: a wrong merge shows the wrong price for the wrong hotel.

**What broke:** a bad merge, a duplicate canonical hotel, a WebSocket reconnect storm. Pick one, tell it honestly.

**Receipts:** matching precision/recall on a labeled sample, a merge example, a rate update trace, WebSocket connection count.

**What this proves:** entity resolution, real-time systems, data normalization, quality measurement.

### 7.4 Food — the license plate that identifies a restaurant

**One-liner:** "The license number that identifies a restaurant."

**Numbers:** Swiggy + Zomato, FSSAI-based canonical identity, ClickHouse storage, async disk-spilled writes, live/fallback reads.

**The problem:** a restaurant on Swiggy and the same restaurant on Zomato have different names, menus, prices, offers, and delivery fees. Comparing them requires a canonical identity. FSSAI license numbers provide a strong key — when they're present and correct.

**Constraints:** missing/duplicated license numbers, menu normalization, delivery fee and offer math, high write throughput, read freshness, fallback when ClickHouse is unavailable.

**Architecture:** ingestion → FSSAI extraction/normalization → canonical restaurant map → menu and price normalization → ClickHouse (async writes, live/fallback reads) → comparison API → client.

**The hard part:** making identity robust when the key is dirty. License normalization, conflict resolution, manual overrides, and a confidence score. Plus: ClickHouse write patterns that don't stall the request path.

**What broke:** a duplicate license, a menu mismatch, a ClickHouse write backlog. Tell it.

**Receipts:** identity coverage stat, a canonical match example, write latency chart, fallback behavior trace.

**What this proves:** data modeling, high-throughput storage, resilience, pragmatic identity design.

### 7.5 Categorizer — zero LLM in the request path

**One-liner:** "Zero LLM in the request path."

This is the signature case study. It is the most distinctive thing on the résumé and the best essay title.

**Numbers:** 1.18M+ labeled examples, ECE 0.0104, p99 20ms, 232ms cold start, <0.1% cross-language disagreement.

**The problem:** categorize queries at high volume, with calibrated confidence, at low latency and low cost. An LLM could do it, but it would sit in the hot path, add latency, cost money per request, and drift. The bet: retrieval + a small reranker can beat it on this task, if you invest in data, calibration, and parity.

**Constraints:** latency budget, cost per request, confidence must be trustworthy, multiple runtimes (Python training, Rust serving, Node integration), index size, cold start.

**Architecture:** query → normalization → dense + sparse retrieval over 1.18M examples → candidate set → GBDT reranker → calibrated confidence → category + score. Rust hot path with mmap-loaded indexes. Python for training/eval. Node for integration. Parity tests across all three.

**The hard part:**
- Calibration: ECE 0.0104 means the confidence is usable for routing and abstention. Explain why that matters.
- Cross-language parity: the same input must produce the same output in Python, Rust, and Node. <0.1% disagreement is a feature, enforced by tests.
- Cold start: 232ms with mmap-loaded indexes. Explain the layout and why it matters for deploys and scale-to-zero.
- Keeping the LLM out: where it is allowed (offline labeling, data augmentation, evaluation) and where it is not (request path).

**What broke:** a parity drift, a calibration regression, an index mismatch after a deploy. Tell it.

**Receipts:** reliability diagram, latency histogram, parity test output, index size, a code snippet of the hot path, a before/after cost table.

**What this proves:** ML systems engineering, retrieval, calibration, Rust performance work, cross-language correctness, cost-aware architecture.

### 7.6 Search — LLM semantic product search

**One-liner:** "99% extraction accuracy, without trusting the model blindly."

**Numbers:** Groq/OpenRouter, BGE-M3 embeddings, LanceDB, self-improving cache, golden-benchmark harness, 99% extraction accuracy.

**The problem:** product search across messy catalogs. Keyword search misses intent; pure LLM extraction is expensive and inconsistent. The system uses embeddings for recall, structured extraction for precision, and a cache that improves with use.

**Constraints:** cost, latency, extraction consistency, catalog drift, evaluation.

**Architecture:** query → embedding (BGE-M3) → LanceDB retrieval → extraction (LLM via Groq/OpenRouter) → validation → cache → results. Golden benchmark runs on every change.

**The hard part:** the evaluation harness and the self-improving cache. How do you know 99% is real? What happens when the model changes? How do you prevent cache poisoning?

**What broke:** a model upgrade that changed extraction behavior; a cache entry that was too broad.

**Receipts:** benchmark table, cache hit rate, extraction examples, cost per 1K queries.

**What this proves:** applied LLM systems, retrieval, evaluation discipline, cost engineering.

### 7.7 Cabs — the intern story

**One-liner:** "A thousand rupees a month, one pickup point at a time."

**Numbers:** Uber + Ola + Rapido, smart pickup feature, users saving ₹1,000+ per month.

**The problem:** cab prices vary by provider and by pickup point. A short walk can change the fare. The product aggregates providers and suggests a smarter pickup.

**The hard part:** pickup-point optimization, provider price normalization, ETA and availability, user trust.

**What this proves:** shipping end-to-end as an intern, product intuition, scrappy execution.

Keep this one shorter. It's a great origin story, not the centerpiece.

### 7.8 Lab projects

**Go Enterprise Load Balancer** — `/lab/load-balancer`

- Numbers: weighted routing, circuit breakers, Redis sticky sessions, OpenTelemetry, Prometheus, mTLS, rate limiting, Docker, Kubernetes, Consul.
- Interactive: three backend boxes, weighted sliders, a stream of request dots. Kill a backend; watch the circuit breaker open and traffic reroute. Sticky sessions keep a user on the same node. Metrics update live.
- Label: "Interactive simulation of the real system."
- Case study: why each piece exists, what it cost in complexity, what you'd simplify.

**VortexVault** — `/lab/vector-search`

- Numbers: C++ Crow + Rust Actix-Web, identical REST APIs, benchmark dashboard, Docker Compose, persistent storage, runtime backend switching.
- Interactive: type a query, see nearest neighbors in a 2D projection. Toggle C++/Rust; compare latency distributions side by side. Switch backends at runtime.
- Case study: the dual-backend bet, API parity, benchmarking methodology, what the numbers actually showed.

These two are the "bomb" demos. They turn a static portfolio into a place engineers send other engineers.

---

## 8. The real-life layer

This is the Aashish factor. Without it, the site is a résumé with better typography.

### 8.1 The Receipts wall

A curated wall of evidence, not a dump.

Categories:

- **Production:** Grafana panels, p99 charts, throughput graphs, error budgets.
- **Performance:** benchmark tables, flamegraphs, load test results, cold start traces.
- **Correctness:** parity test output, calibration curves, evaluation reports.
- **Craft:** PR screenshots, code snippets, architecture sketches, whiteboard photos.
- **Human:** desk, keyboard, chai, the office window, a late-night deploy.

Rules:

- Redact secrets, internal hostnames, customer data, provider keys, and anything Buyhatke hasn't approved.
- Caption every artifact: what it is, when, what it proves.
- Date everything. Stale proof is still proof if it's labeled.
- Use real screenshots, not mockups. If you must mock up, label it.

### 8.2 Field notes

A small blog with big opinions. Not tutorials. Lessons from production.

Launch with 3 posts:

1. **"Zero LLM in the request path"** — the categorizer story. Data, retrieval, calibration, parity, cost.
2. **"232ms cold start"** — mmap, index layout, and serving Rust without a warm-up tax.
3. **"The quota is the architecture"** — designing around provider limits instead of pretending they don't exist.

Next 4:

4. "Seven hotels, one room" — identity resolution in practice.
5. "The license plate join" — FSSAI and canonical restaurants.
6. "Parity is a feature" — Python–Rust–Node testing.
7. "The p99 is the product" — latency budgets and graceful degradation.

Format: MDX, 800–1,500 words, one diagram, one code block, one takeaway. RSS.

### 8.3 About / timeline

Not a biography. A route.

- **Dasuya, Punjab** — school. ICSE 93.2%, CBSE PCM 89%.
- **Kota, Rajasthan** — IIIT Kota, ECE, GPA 8.58/10. First real systems, first all-nighters, first "it works on my machine."
- **Bangalore, Karnataka** — Buyhatke intern (Jan–Jul 2025), then SDE-1 Backend (Aug 2025–present). Real traffic, real quotas, real p99s.
- **Now** — building comparison systems, writing field notes, looking for the next hard problem.

Add photos. Real ones. Grainy phone photos are better than stock.

Principles (pick three, mean them):

- Measure it or it didn't happen.
- Keep the hot path boring.
- Make it observable.
- The quota is part of the design.
- Parity is a feature.
- Ship the p99, not the demo.

### 8.4 Desk / setup / gears / terminal

Ram does this well. It's easy, personal, and engineers love it.

- **Desk:** photo, what's on it, why.
- **Keyboard:** model, switches, layout. If it's a custom build, tell the story.
- **Terminal:** shell, prompt, aliases, the tools you actually use.
- **Gears:** laptop, monitor, headphones, mic, chair. Keep it honest. No affiliate energy.
- **Editor:** theme, extensions, shortcuts. Maybe a screenshot.
- **This site:** stack, hosting, performance budget, why.

### 8.5 Now / currently

A `/now` page, updated monthly:

- Building: what's on the desk right now.
- Learning: one thing.
- Reading: one book.
- Listening: one album or playlist.
- Looking for: roles, collaborators, or nothing.
- Last updated: date.

The home page can surface a one-line "Currently" strip. It makes the site feel alive without a feed.

### 8.6 Books / films / music

Optional, but it adds texture.

- **Bookshelf:** 8–12 books that changed how you think. One line each. No star ratings.
- **Films/shows:** 5–8. One line each. Let the taste show.
- **Music:** a "debugging soundtrack" playlist embed or a now-playing widget. Lazy-load it. Never autoplay.

This is where "real life" lives. Keep it curated, not exhaustive.

### 8.7 Testimonials

2–3 short quotes from a manager, a teammate, or a user. With name, role, photo (with permission).

Frame them as evidence, not decoration:

> "He owned the flight pipeline end to end. When the provider changed their API on a Friday, he had it patched and tested before Monday." — [Name], [Role], Buyhatke

If you don't have quotes yet, ask. A two-line quote is worth more than a skills section.

### 8.8 Photos and cutouts

The Aashish move: real objects, cut out, placed in the layout.

Shoot on a plain background, soft light, then cut out:

- Keyboard
- Chai cup / coffee mug
- Headphones
- Notebook with a diagram
- Raspberry Pi / old laptop / server part
- A printed architecture sketch
- Your IIIT Kota ID or a ticket stub (redact personal info)

Use 3–5, not 20. They should feel like objects on a desk, not stickers.

Also gather:

- 2–3 portraits (one neutral, one candid, one playful).
- Desk/setup photos.
- Bangalore street/office photos.
- Kota and Dasuya photos.
- Whiteboard sketches.
- A photo of the first server or first setup, if it exists.

---

## 9. Signature interaction menu

Impact vs. effort. Build the top set for v1.

| # | Idea | What it is | Impact | Effort | v1? |
|---|---|---|---|---|---|
| 1 | Live comparison race | Providers stream in, prices settle, one winner | High | Medium | Yes |
| 2 | Scroll-built architecture | Diagram assembles as you scroll, packets travel | High | High | Yes |
| 3 | Receipts wall | Real artifacts in a tactile grid | High | Low | Yes |
| 4 | ⌘K palette | Navigate, copy email, resume, theme, hidden routes | High | Medium | Yes |
| 5 | Metric marquee | One scrolling line of proof | Medium | Low | Yes |
| 6 | Cutout objects | Real desk objects floating in the layout | High | Medium | Yes |
| 7 | HTTP contact form | Request/response styled form | Medium | Low | Yes |
| 8 | Day/Night shift toggle | Themed inversion, not a separate design | Medium | Low | Yes |
| 9 | Performance badge | Real measured stats in the footer | Medium | Low | Yes |
| 10 | 404 load balancer page | "No route matched" with a diagram | Medium | Low | Yes |
| 11 | Load balancer visualizer | Kill a backend, watch reroute | High | High | v1.1 |
| 12 | Vector search demo | Query, neighbors, backend toggle | High | High | v1.1 |
| 13 | Categorizer confidence demo | Query, confidence, calibration curve | High | Medium | v1.1 |
| 14 | Request inspector drawer | Devtools-like telemetry as you scroll | Medium | High | v2 |
| 15 | Perspective lens | Systems / Impact / Human view | Medium | High | v2 |
| 16 | Packet journey 3D | One R3F scene, scroll-scrubbed | High | Very high | v2 |
| 17 | Sound design | Off-by-default UI sounds | Low | Low | v2 |
| 18 | Konami traffic spike | Easter egg animation | Low | Low | v2 |
| 19 | "Compare me" tool | Pick a role, see matching proof | Medium | Medium | Maybe |
| 20 | Live stats page | GitHub/LeetCode/WakaTime | Medium | Medium | v2 |
| 21 | Now playing | Spotify widget | Low | Low | v2 |
| 22 | Page transitions | Case cover morphs into header | Medium | Medium | v1.1 |
| 23 | Print stylesheet | Resume prints cleanly | Medium | Low | Yes |
| 24 | Dynamic OG images | Per-case-study social cards | Medium | Low | Yes |
| 25 | Console message | "You opened the console. Let's talk." | Low | Low | Yes |

**The rule:** every interaction must either explain the work or reveal the person. If it only decorates, cut it.

---

## 10. Copy bank

### 10.1 Headlines

- I build the invisible layer — the part you never see until it breaks.
- 478,000 requests a day. I know where every one of them goes.
- Seven providers. One hotel. One answer.
- Zero LLM in the request path.
- The p99 is the product.
- I make slow things fast and complex things boring.
- Numbers first. Adjectives later.
- Built for the p99.
- Cold start: 232ms. Excuses: 0.
- The quota is the architecture.
- Every millisecond has a story.
- I like problems that don't fit in a demo.

### 10.2 Section labels

- 00 / BOOT
- 01 / THE SYSTEMS
- 02 / THE RECEIPTS
- 03 / THE HUMAN
- 04 / FIELD NOTES
- 05 / SAY HELLO

Alternative set:

- SYSTEMS / PROOF / PERSON / NOTES / CONTACT

### 10.3 Personality lines

Pick one. Use it as a running gag, not everywhere.

- P99 OR IT DIDN'T HAPPEN.
- HIGH UPTIME, LOW PATIENCE.
- FAST PATHS, SLOW MORNINGS.
- WORKS ON MY MACHINE. SHIPS TO YOURS.
- TRUST THE HISTOGRAM.
- MEASURE TWICE, DEPLOY ONCE.

### 10.4 Case study titles

- Flights: "478,000 requests a day. Every one accounted for."
- Hotels: "Seven providers. One hotel. One answer."
- Food: "The license plate that identifies a restaurant."
- Categorizer: "Zero LLM in the request path."
- Search: "99% extraction, zero blind trust."
- Cabs: "A thousand rupees a month, one pickup at a time."
- Load balancer: "When a backend dies, nobody should notice."
- VortexVault: "Two backends. One API. Let the numbers decide."

### 10.5 Microcopy

- Resume button: "Download resume ↗" / "One page. No fluff."
- Copy email: "Copy email" → toast: "Copied. No recruiter spam, promise."
- Availability: "● Available for backend roles" / "● Currently building" (be accurate).
- 404: "404 — No route matched. The load balancer did its job. The origin didn't."
- Footer: "Built with Next.js, caffeine, and a p99 budget."
- Footer: "No cookies. No trackers. Just requests."
- Command palette placeholder: "Where do you want to go?"
- Empty state (notes): "Nothing here yet. The p99 of writing is high."
- Form success: "200 OK — message queued. I'll get back to you."
- Form error: "503 — something failed upstream. Try email instead."

### 10.6 Voice rules

- First person. Short sentences.
- Specific nouns and real numbers.
- Dry humor, never cringe.
- Explain the tradeoff, then the result.
- No buzzwords: passionate, seamless, cutting-edge, ninja, rockstar, 10x.
- No skill percentages. No "proficient in Microsoft Word."
- Credit the team.
- Date every claim.
- If it's a simulation, say so.

### 10.7 Before / after

**Before:** "Passionate full-stack developer with experience in modern technologies."

**After:** "I build comparison engines that handle 478,000 requests a day. Here's how they work."

**Before:** "Skills: JavaScript, TypeScript, Go, Rust, Python, SQL."

**After:** "Go for the hot path. Rust when the p99 matters. Python when the model trains. TypeScript when it ships to a browser."

**Before:** "Project: Flight comparison platform."

**After:** "478,000 requests a day, 234,000 provider calls an hour, and a quota that never blinks."

---

## 11. Content inventory

Gather these before design starts. Missing assets are the #1 reason portfolios stall.

### Must have

- [ ] 2–3 portraits (neutral, candid, playful)
- [ ] Approved public screenshots of Buyhatke products (flights, hotels, food, cabs)
- [ ] Permission/confirmation on which metrics and screenshots can be published
- [ ] Redacted Grafana/benchmark/trace screenshots
- [ ] Architecture diagrams for 4 flagship systems (redraw cleanly)
- [ ] Hand-drawn/whiteboard versions for texture
- [ ] Resume PDF (final, dated)
- [ ] Email, LinkedIn, GitHub, X, LeetCode links
- [ ] 3 field notes drafted
- [ ] 2–3 testimonials (or requests sent)
- [ ] Domain chosen
- [ ] Short bio in 3 lengths: 1 line, 3 lines, 150 words

### Nice to have

- [ ] Desk/setup photos
- [ ] Cutout objects (keyboard, chai, headphones, notebook, hardware)
- [ ] Bangalore / Kota / Dasuya photos
- [ ] First server / first setup photo
- [ ] Books/films list
- [ ] Spotify playlist
- [ ] WakaTime / GitHub stats access
- [ ] A 30-second intro video (optional, for about page)
- [ ] Client/team logos with permission (or text-only names)

### Asset rules

- Everything dated.
- Everything captioned.
- Everything redacted where needed.
- Real over polished. A grainy real photo beats a stock photo every time.
- No phone number on the public site. Email only.

---

## 12. Tech stack and build plan

### 12.1 Stack

- **Framework:** Next.js (App Router) + TypeScript. Matches the references and supports MDX + dynamic OG.
- **Styling:** Tailwind CSS v4 with CSS-first tokens. A small set of custom components.
- **Motion:** Motion (Framer Motion successor) for micro-interactions; GSAP + ScrollTrigger for the architecture sequence; Lenis for smooth scroll.
- **3D (v2 only):** React Three Fiber + Drei for one packet-journey scene. Lazy-loaded. Mobile fallback = SVG diagram.
- **Content:** MDX for field notes and case studies. Local files, no CMS at launch. Optional Sanity later.
- **Data:** static JSON for metrics. A tiny serverless endpoint for the "last deployed" commit and optional stats.
- **Analytics:** Plausible or Umami. Privacy-friendly. Track resume downloads, CTA clicks, case study depth.
- **Email:** Resend or Formspree for the contact form. Honeypot + rate limit.
- **Hosting:** Vercel. Custom domain.
- **Quality:** ESLint, Prettier, TypeScript strict, Playwright smoke tests, Lighthouse CI.

### 12.2 Build phases

**Phase 0 — Content and decisions (3–5 days)**

- Confirm publishable metrics/screenshots.
- Write the one-liner, bio, and 4 case study drafts.
- Choose domain and personality line.
- Gather portraits and artifacts.

**Phase 1 — Design system + shell (3–4 days)**

- Tokens, type, grid, components.
- Nav, footer, ⌘K, theme toggle.
- Home hero + metric marquee + section scaffolding.
- Mobile pass.

**Phase 2 — Home + case study template (5–7 days)**

- Hero comparison widget (simulated).
- Systems section with 4 cards.
- Receipts wall.
- Case study template + 2 full case studies (flights, categorizer).
- Resume page + PDF.

**Phase 3 — Remaining content + lab (5–7 days)**

- Hotels, food, search, cabs case studies.
- Lab index + one interactive demo (load balancer recommended first).
- About, now, uses.
- 3 field notes.
- Contact form.

**Phase 4 — Polish and launch (4–5 days)**

- Architecture scroll sequence.
- Page transitions, OG images, 404.
- Performance pass, accessibility pass, SEO.
- Cross-browser and real-device testing.
- Launch checklists.

**Total:** roughly 3–4 focused weeks. Longer if screenshots/permissions are slow.

### 12.3 File structure (suggested)

```
app/
  (site)/
    page.tsx
    systems/page.tsx
    systems/[slug]/page.tsx
    lab/page.tsx
    lab/[slug]/page.tsx
    notes/page.tsx
    notes/[slug]/page.tsx
    about/page.tsx
    now/page.tsx
    uses/page.tsx
    resume/page.tsx
    contact/page.tsx
  api/
    contact/route.ts
    deployed/route.ts
components/
  ui/
  home/
  systems/
  lab/
  layout/
content/
  systems/*.mdx
  notes/*.mdx
  data/metrics.json
  data/site.ts
lib/
  mdx.ts
  metrics.ts
  og.ts
public/
  artifacts/
  portraits/
  cutouts/
  resume.pdf
```

---

## 13. Performance, accessibility, SEO

### 13.1 Performance budget

- LCP < 1.5s on a mid-tier Android over 4G.
- CLS < 0.05.
- INP < 200ms.
- Initial JS < 120KB gzipped on the home page.
- Hero artifact < 200KB (AVIF/WebP, responsive sizes).
- Fonts: max 2 families + 1 mono, subset, `font-display: swap`, preload the display face only.
- No 3D on mobile. No autoplay video. Lazy-load the Spotify widget and lab demos.
- Publish the real numbers in the footer. Measure, don't claim.

### 13.2 Accessibility

- Semantic headings, landmarks, and lists.
- Keyboard access for everything, including ⌘K and demos.
- Visible focus rings. Never remove them.
- Contrast AA minimum, AAA for body where possible.
- `prefers-reduced-motion`: disable Lenis, scrubbed sequences, counters, marquee; show static diagrams.
- Alt text for every artifact. Captions for video.
- No hover-only information.
- Test with VoiceOver and keyboard-only.
- Demos must have a text description and a static fallback.

### 13.3 SEO and sharing

- Title template: `[Page] — Tushar Gautam, Backend Engineer`.
- Meta description per page.
- JSON-LD `Person` + `WebSite` + `BlogPosting` for notes.
- Dynamic OG images: name, case study title, hero metric, brand mark.
- Sitemap, robots.txt, RSS for notes.
- Canonical URLs.
- Open Graph + Twitter cards.
- Case studies get their own OG images with the headline metric.

---

## 14. Anti-patterns

Do not do these.

- **The generic 3D hero.** Floating island, particles, or a low-poly room. It says "tutorial," not "Tushar."
- **A 6-second preloader.** Nobody waits. Make it under 1s and skippable.
- **Skill percentage bars.** Meaningless. Show work.
- **A wall of 40 tech logos.** Says nothing about judgment.
- **"Passionate developer" copy.** Replace with evidence.
- **Fake dashboards.** If it's a simulation, label it.
- **Publishing confidential work.** Redact, get permission, or don't publish. This is non-negotiable.
- **Desktop-only showpieces.** Test on a real phone, on a slow connection.
- **Hover-only content.** Mobile users exist.
- **Autoplay sound.** Never.
- **A blog with 2 posts and no RSS.** Either commit or skip.
- **Copying Aashish's sky and cutouts.** Take the principle, not the skin.
- **Copying Sarthak's educator framing.** It's his story.
- **Copying Ram's minimalism without the writing.** Restraint needs substance.
- **A contact form that goes nowhere.** Test it.
- **A resume link that 404s.** Test it.
- **Dark mode as an afterthought.** Design both, or ship one.
- **Metrics without dates or context.** Stale numbers erode trust.

---

## 15. Launch checklist

### Content

- [ ] Every metric verified and dated.
- [ ] Every screenshot approved and redacted.
- [ ] Every artifact captioned.
- [ ] Every case study has a "what broke" section.
- [ ] Bio, one-liner, and personality line finalized.
- [ ] Testimonials have permission.
- [ ] Resume PDF current and linked.
- [ ] Social links tested.
- [ ] Email tested.

### Design and build

- [ ] Mobile pass on iPhone + Android.
- [ ] Tablet pass.
- [ ] Light and dark mode pass.
- [ ] Reduced-motion pass.
- [ ] Keyboard-only pass.
- [ ] Screen reader pass.
- [ ] 404 page.
- [ ] Loading states.
- [ ] Error states.
- [ ] Form success/error states.
- [ ] OG images render correctly.
- [ ] Favicon and app icons.
- [ ] Print stylesheet for resume.
- [ ] Console message.
- [ ] No horizontal scroll at any breakpoint.

### Performance

- [ ] Lighthouse mobile ≥ 95 performance, 100 accessibility, 100 SEO.
- [ ] LCP, CLS, INP within budget.
- [ ] Images optimized and responsive.
- [ ] Fonts subset and preloaded.
- [ ] JS bundle within budget.
- [ ] No layout shift from fonts or images.
- [ ] Demos lazy-loaded.

### Launch

- [ ] Domain connected.
- [ ] HTTPS.
- [ ] Analytics live and tested.
- [ ] Sitemap submitted.
- [ ] RSS valid.
- [ ] Social previews tested (X, LinkedIn, WhatsApp).
- [ ] Backup of all assets.
- [ ] "Last deployed" endpoint works.
- [ ] Contact form delivers to inbox.
- [ ] Resume download works.
- [ ] 301s for any old URLs.
- [ ] Tell 5 engineers to break it before you post it.

---

## 16. Open questions

Answer these before Phase 1.

1. **Positioning:** Full-time backend roles, freelance/consulting, or both? The site's CTA changes.
2. **Publishing:** Which Buyhatke metrics and screenshots are approved? What needs redaction?
3. **Blog:** Launch with 3 notes or ship without and add later?
4. **Domain:** `tushargautam.dev`, `tushar.codes`, `tgautam.dev`, or something else?
5. **Personality line:** Which one actually sounds like you?
6. **Personal life:** What hobbies, photos, and objects do you want on the site? (Music, films, books, travel, fitness, gaming, photography?)
7. **Testimonials:** Can you ask a manager or teammate for 2 short quotes?
8. **Video:** Do you want a 30-second intro or Loom-style walkthrough?
9. **Visual vibe:** Warm editorial (recommended) or dark terminal? Or a hybrid?
10. **Timeline:** Is there a date you want this live by?
11. **Phone number:** Confirm it stays off the public site.
12. **Name styling:** "Tushar Gautam" vs "tushar gautam" vs a monogram. Pick one and commit.

---

## 17. References

- Sarthak Sharma — https://sarthak-sharma-portfolio-six.vercel.app/
- JS Mastery playlist, "Best Developer Portfolio Websites" — https://www.youtube.com/playlist?list=PL6QREj8te1P7rEwj_IzsoLzQ-FBbZ6lqP
  - 3D portfolio with Three.js — https://www.youtube.com/watch?v=FkowOdMjvYo
  - 3D portfolio beginner — https://www.youtube.com/watch?v=0fYi8SGA20k
  - Fullstack responsive portfolio — https://www.youtube.com/watch?v=3HNyXCPDQ7Q
  - Apple-style site with Three.js & GSAP — https://www.youtube.com/watch?v=kRQbRAJ4-Fs
  - The perfect portfolio — https://www.youtube.com/watch?v=OPaLnMw2i_0
  - Load in 0.364 seconds — https://www.youtube.com/watch?v=3WCIyNOrzwM
  - Next.js + Framer Motion portfolio — https://www.youtube.com/watch?v=FTH6Dn3AyIQ
  - 3 UI/UX sites — https://www.youtube.com/watch?v=RbxHZwFtRT4
- Ramkrishna Swarnkar — https://ramx.in/
- Aashish Thakuri — https://www.aashishthakuri.com/
- Tushar's resume — `Tushar_Gautam___Resume (5).pdf` (Oct 2026 working copy)

---

## 18. The one-paragraph brief

Build a warm, art-directed, editorial-engineer portfolio for a backend engineer who works at real scale. Make the invisible layer visible: comparison engines, latency budgets, quotas, calibration, parity. Prove every claim with a number, an artifact, and a story. Put the person in the room: portraits, desk objects, hometown, field notes, dry humor. Use one showstopper interaction — the live comparison race on the hero and an interactive systems lab — and keep everything else fast, quiet, and readable. Make engineers send it to other engineers, and make recruiters understand it in 30 seconds.

**The test:** if a line could appear on any other developer's portfolio, delete it.

Now build the thing.
