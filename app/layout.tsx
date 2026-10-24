import type { Metadata, Viewport } from "next";
import { Arimo, JetBrains_Mono, Newsreader } from "next/font/google";
import site from "@/content/site.json";
import { AskWidget } from "@/components/assistant/ask-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/search/search-overlay";
import "./globals.css";

// Three faces: Newsreader, an editorial serif with optical sizes and a true italic, for headlines
// and figures; Helvetica for reading and interface, with Arimo, a free metric match, loaded for
// systems that lack it; JetBrains Mono for labels, the tape and the nav.
// Variable files cover every weight used.
const display = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
const text = Arimo({ subsets: ["latin"], variable: "--font-arimo", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-jbmono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "TradeTarget: Stock market, IPO and personal finance news",
    template: "%s | TradeTarget",
  },
  description: site.description,
  openGraph: { siteName: "TradeTarget", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", site: "@tradetarget3" },
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/brand/trade-target-mark.webp", type: "image/webp" }] },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${text.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Flags scripting for the reveal styles, then marks every image as loaded once it decodes,
            so photographs wipe in. Registered before any image parses and independent of
            hydration, so images are never held back; without scripting they simply show. A failed image
            is marked too, so its frame can fall back to the empty-photo slot. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.setAttribute("data-js","");document.addEventListener("load",function(e){var t=e.target;if(t&&t.tagName==="IMG")t.setAttribute("data-loaded","")},true);document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG")t.setAttribute("data-failed","")},true);`,
          }}
        />
      </head>
      <body className="min-h-screen">
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <SearchOverlay trending={site.trending} />
        <AskWidget />
      </body>
    </html>
  );
}
