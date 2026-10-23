import type { Metadata, Viewport } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import site from "@/content/site.json";
import { AskWidget } from "@/components/assistant/ask-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/search/search-overlay";
import "./globals.css";

// Two faces: Source Serif 4, a sturdy serif with optical sizes, set bold for headlines and figures;
// Inter for reading, interface and the tape, with tabular figures where numbers line up. Variable
// files cover every weight used.
const display = Source_Serif_4({ subsets: ["latin"], style: ["normal", "italic"], axes: ["opsz"], variable: "--font-sourceserif", display: "swap" });
const text = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
  themeColor: "#121212",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
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
