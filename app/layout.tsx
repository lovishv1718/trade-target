import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Newsreader } from "next/font/google";
import site from "@/content/site.json";
import { AskWidget } from "@/components/assistant/ask-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/search/search-overlay";
import "./globals.css";

// Three faces: Newsreader, an editorial serif with optical sizes and a true italic, for headlines
// and figures; Geist for reading and interface; Geist Mono for the tape and tables. Variable files
// cover every weight used.
const display = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-newsreader", display: "swap" });
const text = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

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
  themeColor: "#0b3427",
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
        {/* The photograph tone: luminance mapped from deep emerald through sage to ivory (signature.css) */}
        <svg aria-hidden width="0" height="0" className="absolute">
          <filter id="tt-duotone" colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues="0.043 0.306 0.953" />
              <feFuncG type="table" tableValues="0.204 0.490 0.933" />
              <feFuncB type="table" tableValues="0.153 0.408 0.890" />
            </feComponentTransfer>
          </filter>
        </svg>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <SearchOverlay trending={site.trending} />
        <AskWidget />
      </body>
    </html>
  );
}
