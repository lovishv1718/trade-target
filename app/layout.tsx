import type { Metadata, Viewport } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import site from "@/content/site.json";
import { AskWidget } from "@/components/assistant/ask-widget";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/search/search-overlay";
import "./globals.css";

// Variable fonts: one file per family covers every weight used. The serif also carries its
// optical-size axis, so display headlines get the tighter Display cut automatically.
const serif = Source_Serif_4({ subsets: ["latin"], axes: ["opsz"], variable: "--font-source-serif", display: "swap" });
const sans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans", display: "swap" });

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
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${sans.variable}`}>
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
