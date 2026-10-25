import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Caveat, Instrument_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./magic.css";
import "./journey.css";
import "./mobile.css";
import "./pages.css";
import "./motion.css";
import "./perf.css";
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

const themeScript = `(function(){try{var t=localStorage.getItem("tg-theme");if(t!=="day"&&t!=="night"){t="day"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="day"}})();`;

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
      className={`${sans.variable} ${display.variable} ${serif.variable} ${mono.variable} ${hand.variable}`}
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
        <ScrollProgress />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CommandPalette />
        <PageTransition />
        <Cursor />
      </body>
    </html>
  );
}
