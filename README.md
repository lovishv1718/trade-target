# TradeTarget website (sample build)

A static Next.js rebuild of [tradetarget.in](https://tradetarget.in), prepared as a client pitch. It uses TradeTarget's real articles, images and team details, keeps the existing WordPress URLs, and adds an IPO dashboard, 16 calculators, a hire-our-writers page, site search and an "Ask TradeTarget" assistant preview.

- **Stack:** Next.js 16 (App Router, static export), TypeScript, Tailwind CSS 4, Recharts, MDX via `next-mdx-remote`
- **Content:** everything lives in `/content` as JSON and MDX, ready to move to Payload CMS
- **Output:** 104 static HTML pages in `/out`

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000.

To build the static site and preview the exported files:

```bash
npm run build
```

```bash
npx serve out
```

Other scripts:

| Command | What it does |
| --- | --- |
| `npm test` | Runs the calculator, formatting and IPO status unit tests (Vitest, 48 tests) |
| `npm run lint` | ESLint with the Next.js rules |
| `npm run import:wp` | Re-imports the articles from the WordPress REST API into `/content/articles` and `/public/images/articles` (responses are cached in `.cache/`) |
| `npm run import:photos` | Downloads the Wikimedia Commons photos, writes `/content/photo-credits.json`, and swaps the text-card covers on 12 news and IPO stories for photographs |

Run `import:photos` after `import:wp`, because it updates article covers.

`npm run build` also runs `scripts/flatten-rsc.mjs` (as `postbuild`). Next 16's static export writes link-prefetch files as `news/__next.news/__PAGE__.txt`, while the browser requests `news/__next.news.__PAGE__.txt`; the script writes copies at the requested names so prefetches don't 404 on a plain static host.

## Quality checks run on this build

- **Build:** `next build` completes with no errors; 104 HTML pages exported.
- **Lint:** ESLint (Next.js core web vitals and TypeScript rules) passes with no warnings.
- **Unit tests:** 48 passing. Calculator results are checked against published reference values (for example ₹10,000 a month at 12% for 10 years = ₹23,23,391; ₹50 lakh at 8.5% for 20 years = ₹43,391 EMI; ₹1.5 lakh a year in PPF at 7.1% for 15 years = ₹40,68,209), against closed-form formulas, and against Income Tax Department style examples, including 87A and surcharge marginal relief.
- **Links and images:** every internal link and image on all 103 sitemap pages (350 unique URLs) resolves.
- **Responsive:** no horizontal overflow at 375 px or 768 px on the home, news, IPO, IPO detail, section, article, calculator, hire-writers and about pages; checked visually at 375, 768 and 1280 px.
- **Lighthouse (mobile, simulated slow 4G):** measured locally against the exported site served with gzip, not on Vercel, so treat these as indicative.

| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Home | 96 | 100 | 100 | 100 |
| News | 87 | 100 | 100 | 100 |
| IPO dashboard | 90 | 100 | 100 | 100 |
| IPO detail (Bonfiglioli) | 83 | 100 | 100 | 100 |
| Article (SAIL) | 85 | 100 | 100 | 100 |
| SIP calculator | 84 | 100 | 100 | 100 |
| Hire our writers | 87 | 100 | 100 | 100 |

Performance work in this build: Recharts loads only when a chart scrolls into view, the donut charts are plain SVG, story links don't prefetch on scroll, fonts are single variable files, CSS is inlined, and images ship in 240 to 1440 px WebP sizes. To meet WCAG AA, small text and buttons use slightly darker shades of the brand orange, green, amber and teal (`*-ink` colours in `app/globals.css`); the exact brand colours are kept for rules, borders, fills and the logo.

## Deploy to Vercel

1. Push this folder to a GitHub, GitLab or Bitbucket repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel detects Next.js. `vercel.json` already sets the build command (`npm run build`) and output directory (`out`). Keep the defaults and click **Deploy**.
4. Add the `tradetarget.in` domain under **Settings → Domains** when ready.

Or from the command line:

```bash
npx vercel --prod
```

`vercel.json` also adds permanent redirects from the old WordPress category archives (`/category/...`) and the old `/ongoing/` and `/upcoming/` IPO pages to their new homes.

While this is a preview, `vercel.json` also sends an `X-Robots-Tag: noindex, nofollow` header on every page, so search engines do not list the preview copy of TradeTarget's content or its sample IPO figures. **Remove that `headers` entry before launching on tradetarget.in.**

## Project layout

```
app/                    Routes (one folder per URL section)
components/             UI: layout, article, ipo, calculators, home, listing, search, assistant
content/
  articles/*.mdx        48 imported articles (frontmatter + MDX body)
  pages/*.mdx           Disclaimer, privacy, terms, editorial policy
  authors.json          Team bios (from the current site)
  calculators.json      Calculator copy, FAQs, related links
  editorial.json        Home page picks and story labels
  hire.json             Services, clients, writers, brief form options
  ipos.json             IPO dashboard data
  markets.json          Ticker and markets board (sample values)
  photo-credits.json    Third-party photo licences
  sections.json         Sections and Personal Finance sub-categories
  site.json             Navigation, social links, trending searches
lib/calc/               Calculator maths (pure functions, unit tested)
lib/                    Content loaders, IPO status, formatting, search
scripts/                WordPress and photo import scripts
tests/                  Vitest unit tests
```

## Content and data notes

- **Articles.** 48 posts were imported from the WordPress REST API: the nine named in the brief plus recent posts from every section, so listing pages show real stories. Elementor and Gutenberg markup was converted to MDX. Original charts (Graphina widgets) were rebuilt with Recharts from the data embedded in the page; FAQ widgets became structured FAQs with schema markup; "Read this also" call-outs became inline link cards.
- **Broken tables on the live site.** 15 imported articles contain TablePress shortcodes (`[table id=… /]`) that the live WordPress site no longer renders; the raw shortcode shows on the page. The tables cannot be recovered from the public site, so they are omitted. These articles carry a `brokenTables` count in their frontmatter so an editor can re-enter them in the CMS.
- **Images.** All featured and in-article images were downloaded and converted to WebP at 240, 480, 720, 960 and 1440 px. Twelve news, IPO and share-analysis stories had headline-text graphics as covers; these now use real photographs (power plant, steel, gold, NSE and BSE buildings, trading screen and so on). The original graphics are kept and recorded as `originalImage` in each article's frontmatter.
- **Photo source.** Unsplash's site blocks automated access, so the photos come from Wikimedia Commons instead, each under a free licence (CC0, public domain, CC BY or CC BY-SA). Credits are on `/photo-credits/`.
- **IPO data.** Tonbo Imaging India, Zetwerk Manufacturing, Bonfiglioli Transmissions, Jio Platforms and Paras Healthcare use sample figures and are tagged "Sample" in the table. NSE, Hero Motors, Hexagon Nutrition, Bharat Coking Coal, Prizor Viztech and Sati Poly Plast use figures from TradeTarget's own articles; fields the articles did not report show as "–". Status (open, upcoming, allotment out, listed) is computed in the browser from the dates and today's date in IST.
- **Market data.** Ticker and markets board values are sample figures, labelled "Indicative, may be delayed". Market open or closed status is computed from IST trading hours (holidays not modelled).
- **About page figures** (4,00,000+ readers, 5,00,000+ subscribers, 200+ team, 4.5 rating) are copied from TradeTarget's current About page and should be confirmed.
- **Tax rules.** The income tax calculator uses FY 2026-27 slabs (Budget 2025 slabs, unchanged in Budget 2026), the ₹12 lakh Section 87A rebate with marginal relief, surcharge with marginal relief, and 4% cess. The HRA calculator applies the 50% limit to the eight cities named in the Income Tax Rules, 2026. The NPS calculator allows a 20% minimum annuity, per PFRDA's December 2025 exit rules.
- **To confirm with TradeTarget:** the editorial policy is a new draft; the legal pages are tidied versions of the existing text (contact email changed to business@tradetarget.in, governing-law court kept at Haldwani, Uttarakhand); Ramesh Bisht has no photo on the current site, so an initials avatar is used.
- **Forms.** The newsletter, contact and brief forms validate input and show a success state; they do not send data anywhere yet.

## Page URLs

All URLs end in a slash, as on the current WordPress site.

### Main pages

| URL | Page |
| --- | --- |
| `/` | Home |
| `/news/` | News listing with topic filter and pagination |
| `/ipo/` | IPO dashboard (Mainboard and SME tabs, `?board=sme` opens SME) |
| `/share-analysis/` | Share Analysis section |
| `/stock-market-iq/` | Stock Market IQ section |
| `/blog-junction/` | Blog Junction section |
| `/personal-finance/` | Personal Finance section |
| `/retirement/` | Personal Finance: Retirement |
| `/taxation/` | Personal Finance: Taxation |
| `/loan/` | Personal Finance: Loan |
| `/insurance/` | Personal Finance: Insurance |
| `/banking-and-fixed-deposit/` | Personal Finance: Banking and FD |
| `/government-scheme/` | Personal Finance: Government Scheme |
| `/document-guides/` | Personal Finance: Document Guides |
| `/calculators/` | Calculators hub |
| `/hire-writers/` | Hire our writers |
| `/about/` | About us |
| `/board-of-directors/` | Board of Directors |
| `/contact-us/` | Contact us |
| `/editorial-policy/` | Editorial policy |
| `/disclaimer/` | Disclaimer |
| `/privacy-policy/` | Privacy policy |
| `/terms-and-conditions/` | Terms and conditions |
| `/photo-credits/` | Photo credits |
| `/author/hemant/`, `/author/kashish/`, `/author/ramesh/` | Author pages |
| `/404.html` | Not found page (served for any unknown URL) |
| `/sitemap.xml`, `/robots.txt`, `/search-index.json` | Generated files |

### IPO detail pages

`/ipo/bonfiglioli-transmissions-ipo/`, `/ipo/jio-platforms-ipo/`, `/ipo/paras-healthcare-ipo/`, `/ipo/zetwerk-manufacturing-ipo/`, `/ipo/tonbo-imaging-india-ipo/`, `/ipo/nse-ipo/`, `/ipo/hero-motors-ipo/`, `/ipo/hexagon-nutrition-ipo/`, `/ipo/bharat-coking-coal-ipo/`, `/ipo/prizor-viztech-ipo/`, `/ipo/sati-poly-plast-ipo/`

### Calculators

| URL | Calculator |
| --- | --- |
| `/calculators/sip-calculator/` | SIP (with lumpsum comparison) |
| `/calculators/lumpsum-calculator/` | Lumpsum (with SIP comparison) |
| `/calculators/step-up-sip-calculator/` | Step-up SIP (vs flat SIP) |
| `/calculators/swp-calculator/` | SWP (with safe withdrawal limits) |
| `/calculators/ppf-calculator/` | PPF (with 5-year extension) |
| `/calculators/epf-calculator/` | EPF (with VPF) |
| `/calculators/fd-calculator/` | FD (with senior citizen rate) |
| `/calculators/rd-calculator/` | RD (vs SIP) |
| `/calculators/nps-calculator/` | NPS (20% vs 40% annuity) |
| `/calculators/retirement-calculator/` | Retirement corpus (flat vs step-up SIP) |
| `/calculators/home-loan-emi-calculator/` | Home loan EMI (prepayment effect) |
| `/calculators/car-loan-emi-calculator/` | Car loan EMI (3, 5 and 7 year comparison) |
| `/calculators/personal-loan-emi-calculator/` | Personal loan EMI (vs credit card) |
| `/calculators/income-tax-calculator/` | Income tax, old vs new regime side by side |
| `/calculators/hra-calculator/` | HRA exemption (metro vs non-metro) |
| `/calculators/cagr-calculator/` | CAGR (vs benchmark) |

### Articles (48, same URLs as the current site)

The nine articles named in the brief are marked ★.

**News**
- ★ `/news/ntpc-q4-2026-result/`
- ★ `/news/divis-lab-q4-2026-results/`
- ★ `/news/gold-and-silver-prices-surge/`
- `/news/mutual-funds-cut-stakes-in-30-stocks/`
- `/news/stock-market-holiday-next-week/`
- `/news/nifty-could-slip-to-20500-warns-jpmorgan/`
- `/news/upcoming-dividends-in-april-2026/`
- `/news/diet-coke-shortage-in-india-why-is-it-disappearing/`

**IPO**
- ★ `/ipo/nse-ipo-allotment-status/`
- ★ `/ipo/hero-motors-ipo-allotment-status/`
- `/ipo/mainboard-ipo/hexagon-nutrition-ipo-gmp/`
- `/ipo/mainboard-ipo/bharat-coking-coal-ipo-gmp/`
- `/ipo/mainboard-ipo/icici-prudential-amc-ipo-gmp/`
- `/ipo/mainboard-ipo/wakefit-innovations-ipo-gmp/`
- `/ipo/sme-ipo/prizor-viztech-ipo-gmp/`
- `/ipo/sme-ipo/sati-poly-plast-ipo-gmp/`

**Share Analysis**
- ★ `/share-analysis/steel-authority-of-india-fundamental-analysis/`
- `/share-analysis/colgate-palmolive-fundamental-analysis/`
- `/share-analysis/godrej-consumer-products-fundamental-analysis/`
- `/share-analysis/persistent-systems-fundamental-analysis/`
- `/share-analysis/polycab-india-fundamental-analysis/`
- `/share-analysis/ireda-fundamental-analysis/`

**Stock Market IQ**
- ★ `/stock-market-iq/dividend-reinvestment-plan/`
- `/stock-market-iq/what-is-ncdex-meaning-functions-and-benefits/`
- `/stock-market-iq/life-cycle-funds/`
- `/stock-market-iq/how-to-invest-in-global-stocks-through-nse-ix/`
- `/stock-market-iq/types-of-trading-in-stock-market/`
- `/stock-market-iq/what-is-an-ipo/`
- `/stock-market-iq/how-to-select-best-stocks/`

**Blog Junction**
- ★ `/blog-junction/parag-parikh-flexi-cap-fund-vs-hdfc-flexi-cap-fund/`
- `/blog-junction/new-amcs-in-india/`
- `/blog-junction/paying-minimum-due-on-credit-card/`
- `/blog-junction/how-to-invest-in-silver-gold-and-copper-in-india/`
- `/blog-junction/campa-cola-comeback/`
- `/blog-junction/quant-small-cap-fund-holdings-review/`

**Personal Finance**
- ★ `/personal-finance/retirement/employees-provident-fund-epf/`
- `/personal-finance/retirement/ppf-interest-rate/`
- `/personal-finance/retirement/50-30-20-rule/`
- `/personal-finance/taxation/section-80c/`
- `/personal-finance/taxation/best-tax-saving-options/`
- `/personal-finance/loan/what-is-personal-loan/`
- `/personal-finance/insurance/what-is-insurance/`
- `/personal-finance/banking-and-fixed-deposit/what-is-fixed-deposit/`
- `/personal-finance/banking-and-fixed-deposit/highest-fd-interest-rates/`
- `/personal-finance/government-scheme/sukanya-samriddhi-yojana-ssy-scheme/`
- `/personal-finance/government-scheme/atal-pension-yojana/`
- `/personal-finance/document-guides/how-to-link-aadhaar-with-mobile-number/`
- `/personal-finance/document-guides/how-to-apply-aadhar-card-online/`
