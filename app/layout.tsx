import type { Metadata, Viewport } from "next";
import {
  Barlow,
  Bricolage_Grotesque,
  Caveat,
  DM_Serif_Display,
  Doto,
  Fraunces,
  Geist_Mono,
  Hanken_Grotesk,
  IBM_Plex_Mono,
  Instrument_Sans,
  Instrument_Serif,
  Inter,
  Inter_Tight,
  JetBrains_Mono,
  Manrope,
  Montserrat,
  Newsreader,
  Plus_Jakarta_Sans,
  Roboto_Serif,
  Teko,
  Archivo,
  Archivo_Black,
  Space_Grotesk,
  Space_Mono,
  Syne,
  DM_Mono,
  Unbounded,
  Sora,
  Outfit,
  Chakra_Petch,
  Rubik,
  Cormorant_Garamond,
} from "next/font/google";
import "./globals.css";
import "./magic.css";
import "./journey.css";
import "./mobile.css";
import "./pages.css";
import "./motion.css";
import "./perf.css";
import "./zine.css";
import "./skins.css";
import "./palette.css";
import { skinBootScript } from "@/lib/skins";
import { ThemeFrame } from "@/components/skin";
import { ThemeModal } from "@/components/theme-palette";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommandPalette } from "@/components/command-palette";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ScrollProgress } from "@/components/scroll-progress";
import { Cursor } from "@/components/cursor";
import { PageTransition } from "@/components/page-transition";

const sans = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
  variable: "--font-display",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-serif",
});

const hand = Caveat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hand",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-code",
});

// Skin fonts load only when a skin uses them.
const fManrope = Manrope({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-manrope" });
const fNewsreader = Newsreader({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-newsreader" });
const fPlex = IBM_Plex_Mono({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500"], variable: "--f-plex" });
const fRobotoSerif = Roboto_Serif({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-roboto-serif" });
const fInter = Inter({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-inter" });
const fInterTight = Inter_Tight({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-inter-tight" });
const fDmSerif = DM_Serif_Display({ subsets: ["latin"], display: "swap", preload: false, weight: "400", style: ["normal", "italic"], variable: "--f-dm-serif" });
const fDoto = Doto({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-doto" });
const fGeistMono = Geist_Mono({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-geist-mono" });
const fJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-jakarta" });
const fFraunces = Fraunces({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-fraunces" });
const fTeko = Teko({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-teko" });
const fBarlow = Barlow({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "600"], variable: "--f-barlow" });
const fMontserrat = Montserrat({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-montserrat" });
const fHanken = Hanken_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-hanken" });
const fArchivoX = Archivo({ subsets: ["latin"], display: "swap", preload: false, axes: ["wdth"], variable: "--f-archivo" });
const fArchivoBlackX = Archivo_Black({ subsets: ["latin"], display: "swap", preload: false, weight: "400", variable: "--f-archivo-black" });
const fSpaceGroteskX = Space_Grotesk({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-space-grotesk" });
const fSpaceMonoX = Space_Mono({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "700"], variable: "--f-space-mono" });
const fSyneX = Syne({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-syne" });
const fDmMonoX = DM_Mono({ subsets: ["latin"], display: "swap", preload: false, weight: ["300", "400", "500"], variable: "--f-dm-mono" });
const fUnboundedX = Unbounded({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-unbounded" });
const fSoraX = Sora({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-sora" });
const fOutfitX = Outfit({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-outfit" });
const fChakraX = Chakra_Petch({ subsets: ["latin"], display: "swap", preload: false, weight: ["400", "500", "600", "700"], variable: "--f-chakra" });
const fRubikX = Rubik({ subsets: ["latin"], display: "swap", preload: false, variable: "--f-rubik" });
const fCormorantX = Cormorant_Garamond({ subsets: ["latin"], display: "swap", preload: false, style: ["normal", "italic"], variable: "--f-cormorant" });
const skinFonts = [fManrope, fNewsreader, fPlex, fRobotoSerif, fInter, fInterTight, fDmSerif, fDoto, fGeistMono, fJakarta, fFraunces, fTeko, fBarlow, fMontserrat, fHanken, fArchivoX, fArchivoBlackX, fSpaceGroteskX, fSpaceMonoX, fSyneX, fDmMonoX, fUnboundedX, fSoraX, fOutfitX, fChakraX, fRubikX, fCormorantX]
  .map((f) => f.variable)
  .join(" ");

export const metadata: Metadata = {
  title: {
    default: "Tushar Gautam — Backend Engineer",
    template: "%s — Tushar Gautam",
  },
  description:
    "Backend engineer in Bangalore building comparison engines, low-latency pipelines, and systems that hold at 3.79M events a day.",
  keywords: [
    "Tushar Gautam",
    "backend engineer",
    "distributed systems",
    "Go",
    "Rust",
    "ClickHouse",
    "low latency",
    "portfolio",
  ],
  authors: [{ name: "Tushar Gautam" }],
  creator: "Tushar Gautam",
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "Tushar Gautam — Backend Engineer",
    description:
      "I build the invisible layer — comparison engines, low-latency pipelines, and systems that stay up.",
    siteName: "Tushar Gautam",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tushar Gautam — Backend Engineer",
    description:
      "I build the invisible layer — comparison engines, low-latency pipelines, and systems that stay up.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f2efe6",
};

const themeScript = skinBootScript;

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tushar Gautam",
  jobTitle: "Backend Engineer",
  worksFor: { "@type": "Organization", name: "Buyhatke Internet Private Limited" },
  address: { "@type": "PostalAddress", addressLocality: "Bangalore", addressCountry: "IN" },
  email: "mailto:tgautam380@gmail.com",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="day"
      data-skin="paper"
      className={`${sans.variable} ${display.variable} ${serif.variable} ${mono.variable} ${hand.variable} ${skinFonts}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"){t.style.visibility="hidden"}},true);` }} />
        <div className="grain" aria-hidden="true" />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SmoothScroll />
        <ThemeFrame>
          <ScrollProgress />
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
        </ThemeFrame>
        <ThemeModal />
        <CommandPalette />
        <PageTransition />
        <Cursor />
      </body>
    </html>
  );
}
