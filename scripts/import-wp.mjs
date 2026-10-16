// Imports real articles from the live TradeTarget WordPress site into /content
// and /public/images. Run with: npm run import:wp
//
// - Fetches posts from the public REST API (cached in .cache/ so reruns are offline)
// - Converts Gutenberg and Elementor HTML into clean MDX
// - Pulls TablePress tables from the rendered page, Graphina chart data into <ArticleChart>
// - Downloads featured and in-article images and writes responsive WebP variants

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache");
const API = "https://tradetarget.in/wp-json/wp/v2";
const SITE = "https://tradetarget.in";
const UA = "Mozilla/5.0 (TradeTarget content import)";
export const WIDTHS = [240, 480, 720, 960, 1440];

// The nine articles named in the brief, followed by recent posts from each section
// so listing pages carry real stories.
const REQUIRED = [
  "nse-ipo-allotment-status",
  "hero-motors-ipo-allotment-status",
  "ntpc-q4-2026-result",
  "divis-lab-q4-2026-results",
  "gold-and-silver-prices-surge",
  "steel-authority-of-india-fundamental-analysis",
  "parag-parikh-flexi-cap-fund-vs-hdfc-flexi-cap-fund",
  "dividend-reinvestment-plan",
  "employees-provident-fund-epf",
];
const EXTRA = [
  // News
  "mutual-funds-cut-stakes-in-30-stocks",
  "stock-market-holiday-next-week",
  "nifty-could-slip-to-20500-warns-jpmorgan",
  "upcoming-dividends-in-april-2026",
  "diet-coke-shortage-in-india-why-is-it-disappearing",
  // IPO
  "hexagon-nutrition-ipo-gmp",
  "bharat-coking-coal-ipo-gmp",
  "icici-prudential-amc-ipo-gmp",
  "wakefit-innovations-ipo-gmp",
  "prizor-viztech-ipo-gmp",
  "sati-poly-plast-ipo-gmp",
  // Share Analysis
  "colgate-palmolive-fundamental-analysis",
  "godrej-consumer-products-fundamental-analysis",
  "persistent-systems-fundamental-analysis",
  "polycab-india-fundamental-analysis",
  "ireda-fundamental-analysis",
  // Stock Market IQ
  "what-is-ncdex-meaning-functions-and-benefits",
  "life-cycle-funds",
  "how-to-invest-in-global-stocks-through-nse-ix",
  "types-of-trading-in-stock-market",
  "what-is-an-ipo",
  "how-to-select-best-stocks",
  // Blog Junction
  "new-amcs-in-india",
  "paying-minimum-due-on-credit-card",
  "how-to-invest-in-silver-gold-and-copper-in-india",
  "campa-cola-comeback",
  "quant-small-cap-fund-holdings-review",
  // Personal Finance
  "ppf-interest-rate",
  "50-30-20-rule",
  "section-80c",
  "best-tax-saving-options",
  "what-is-personal-loan",
  "what-is-insurance",
  "what-is-fixed-deposit",
  "highest-fd-interest-rates",
  "sukanya-samriddhi-yojana-ssy-scheme",
  "atal-pension-yojana",
  "how-to-link-aadhaar-with-mobile-number",
  "how-to-apply-aadhar-card-online",
];

// WordPress category id -> section/subsection used by the new site
const CATEGORY_MAP = {
  65: { section: "news" },
  66: { section: "ipo" },
  67: { section: "ipo", sub: "mainboard" },
  74: { section: "ipo", sub: "sme" },
  68: { section: "share-analysis" },
  62: { section: "stock-market-iq" },
  72: { section: "blog-junction" },
  63: { section: "personal-finance" },
  69: { section: "personal-finance", sub: "retirement" },
  70: { section: "personal-finance", sub: "taxation" },
  71: { section: "personal-finance", sub: "loan" },
  73: { section: "personal-finance", sub: "insurance" },
  76: { section: "personal-finance", sub: "banking-and-fixed-deposit" },
  77: { section: "personal-finance", sub: "government-scheme" },
  78: { section: "personal-finance", sub: "document-guides" },
};

// ---------------------------------------------------------------------------
// Fetch helpers with an on-disk cache

async function cached(key, fetcher) {
  const file = path.join(CACHE, key);
  try {
    return await fs.readFile(file);
  } catch {
    const buf = await fetcher();
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, buf);
    return buf;
  }
}

async function get(url, attempt = 1) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    if (attempt < 3 && res.status >= 500) return get(url, attempt + 1);
    throw new Error(`${res.status} for ${url}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);

async function fetchPost(slug) {
  const buf = await cached(`wp/post-${slug}.json`, () =>
    get(`${API}/posts?slug=${encodeURIComponent(slug)}&_embed`),
  );
  const list = JSON.parse(buf.toString("utf8"));
  return list[0] || null;
}

async function fetchCategoryFallback(catId) {
  const buf = await cached(`wp/cat-${catId}.json`, () =>
    get(`${API}/posts?categories=${catId}&per_page=5&_embed`),
  );
  return JSON.parse(buf.toString("utf8"));
}

async function fetchRenderedPage(url) {
  const buf = await cached(`pages/${hash(url)}.html`, () => get(url));
  return buf.toString("utf8");
}

// ---------------------------------------------------------------------------
// Images

export async function saveImage(url, outBase, { quality = 78 } = {}) {
  const buf = await cached(`img/${hash(url)}`, () => get(url));
  const img = sharp(buf, { animated: false });
  const meta = await img.metadata();
  await fs.mkdir(path.dirname(outBase), { recursive: true });
  for (const w of WIDTHS) {
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality }).toFile(`${outBase}-${w}.webp`);
  }
  await sharp(buf).resize({ width: 1200, withoutEnlargement: true }).webp({ quality }).toFile(`${outBase}.webp`);
  const width = Math.min(meta.width || 1200, 1440);
  const height = Math.round(((meta.height || 800) / (meta.width || 1200)) * width);
  const rel = "/" + path.relative(path.join(ROOT, "public"), `${outBase}.webp`).split(path.sep).join("/");
  return { src: rel, width, height };
}

// ---------------------------------------------------------------------------
// HTML -> MDX

const BLOCK_TAGS = new Set([
  "p", "div", "section", "article", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "table",
  "figure", "blockquote", "img", "hr", "script", "style", "iframe", "form", "noscript", "header",
  "footer", "aside", "nav", "main", "center", "dl", "figcaption", "picture", "video",
]);
const SKIP_TAGS = new Set(["script", "style", "iframe", "form", "noscript", "hr", "video", "svg", "button", "input"]);

const decode = (s) => s.replace(/ /g, " ");

function escapeText(s) {
  return decode(s)
    .replace(/₹\s+(?=[\d.])/g, "₹")
    .replace(/\\/g, "\\\\")
    .replace(/([*_`[\]])/g, "\\$1")
    .replace(/[{}]/g, (c) => "\\" + c)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const squash = (s) => s.replace(/[ \t\r\n]+/g, " ");

function wrapMark(inner, mark) {
  const m = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!m[2]) return inner;
  // Avoid doubled emphasis such as ****text****
  if (m[2].startsWith(mark) && m[2].endsWith(mark)) return inner;
  return `${m[1]}${mark}${m[2]}${mark}${m[3]}`;
}

function attrJson(v) {
  return JSON.stringify(v);
}

function attrStr(v) {
  return JSON.stringify(String(v));
}

class Converter {
  constructor({ $, slug, linkMap, tablepress, imageQueue }) {
    this.$ = $;
    this.slug = slug;
    this.linkMap = linkMap;
    this.tablepress = tablepress;
    this.imageQueue = imageQueue;
    this.faqs = [];
    this.summary = null;
    this.figureCount = 0;
  }

  href(raw) {
    if (!raw) return null;
    let h = raw.trim();
    if (h.startsWith("#")) return null;
    if (h.startsWith("/")) h = SITE + h;
    try {
      const u = new URL(h);
      if (u.hostname.endsWith("tradetarget.in")) {
        const p = u.pathname.endsWith("/") ? u.pathname : u.pathname + "/";
        if (this.linkMap.has(p)) return p;
        if (p === "/") return "/";
        return SITE + p;
      }
      return u.toString();
    } catch {
      return null;
    }
  }

  inline(node, ctx = {}) {
    const $ = this.$;
    if (node.type === "text") {
      const t = squash(node.data);
      return escapeText(t);
    }
    if (node.type !== "tag") return "";
    const tag = node.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return "";
    const kids = () => node.children.map((c) => this.inline(c, ctx)).join("");
    switch (tag) {
      case "br":
        return ctx.table ? " " : " ";
      case "strong":
      case "b": {
        if (ctx.noMarks) return kids();
        const inner = node.children.map((c) => this.inline(c, { ...ctx, bold: true })).join("");
        return ctx.bold ? inner : wrapMark(inner, "**");
      }
      case "em":
      case "i": {
        const cls = $(node).attr("class") || "";
        if (/fa-|flaticon|icon/.test(cls)) return "";
        if (ctx.noMarks) return kids();
        const inner = node.children.map((c) => this.inline(c, { ...ctx, italic: true })).join("");
        return ctx.italic ? inner : wrapMark(inner, "_");
      }
      case "a": {
        const text = kids();
        const href = this.href($(node).attr("href"));
        if (!text.trim()) return "";
        if (!href || ctx.noLinks) return text;
        const safe = href.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20");
        const m = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
        return `${m[1]}[${m[2]}](${safe})${m[3]}`;
      }
      case "img":
        return "";
      case "code":
        return "`" + $(node).text().replace(/`/g, "'") + "`";
      case "sup":
        return kids();
      default:
        return kids();
    }
  }

  inlineOf(el, ctx) {
    return el.children
      .map((c) => this.inline(c, ctx))
      .join("")
      .replace(/[ ]{2,}/g, " ")
      .replace(/\*\*\s*\*\*/g, "")
      .trim();
  }

  hasBlockChild(el) {
    return (el.children || []).some((c) => c.type === "tag" && BLOCK_TAGS.has(c.tagName.toLowerCase()));
  }

  textOf(el) {
    return squash(this.$(el).text()).trim();
  }

  // Walk a container, grouping consecutive inline nodes into paragraphs.
  blocks(el) {
    const out = [];
    let buf = [];
    const flush = () => {
      if (!buf.length) return;
      const text = buf.map((n) => this.inline(n)).join("").replace(/[ ]{2,}/g, " ").trim();
      if (text) out.push(text);
      buf = [];
    };
    for (const child of el.children || []) {
      if (child.type === "text") {
        buf.push(child);
        continue;
      }
      if (child.type !== "tag") continue;
      const tag = child.tagName.toLowerCase();
      const isBlock = BLOCK_TAGS.has(tag) || this.hasBlockDescendant(child);
      if (!isBlock) {
        buf.push(child);
        continue;
      }
      flush();
      out.push(...this.block(child));
    }
    flush();
    return out.filter((b) => b && b.trim());
  }

  hasBlockDescendant(el) {
    const tag = el.tagName.toLowerCase();
    if (!["span", "strong", "b", "em", "i", "a", "font", "u", "mark"].includes(tag)) return false;
    return this.$(el).find("p,div,ul,ol,table,h1,h2,h3,h4,h5,h6,figure,img").length > 0;
  }

  heading(el, level) {
    const text = this.inlineOf(el, { noMarks: true, noLinks: true });
    if (!text) return [];
    if (/subscribe\s+for real-time financial insights/i.test(text)) return [];
    if (/whatsapp channel/i.test(text)) return [];
    const hashes = "#".repeat(Math.min(Math.max(level, 2), 4));
    return [`${hashes} ${text}`];
  }

  list(el, depth = 0) {
    const $ = this.$;
    const ordered = el.tagName.toLowerCase() === "ol";
    const items = $(el).children("li").toArray();
    const lines = [];
    items.forEach((li, i) => {
      const nested = $(li).children("ul,ol").toArray();
      const clone = { ...li, children: li.children.filter((c) => !(c.type === "tag" && ["ul", "ol"].includes(c.tagName))) };
      let text = this.blocks(clone).join(" ").replace(/\n+/g, " ").trim();
      if (!text) return;
      const marker = ordered ? `${i + 1}.` : "-";
      lines.push(`${"   ".repeat(depth)}${marker} ${text}`);
      for (const n of nested) lines.push(this.list(n, depth + 1));
    });
    return lines.join("\n");
  }

  table(tableEl, caption) {
    const $ = this.$;
    const rows = $(tableEl).find("tr").toArray().map((tr) =>
      $(tr)
        .children("th,td")
        .toArray()
        .map((cell) => {
          const inner = $(cell).find(".td-content").get(0) || cell;
          return this.blocks(inner).join(" ").replace(/\n+/g, " ").replace(/\|/g, "\\|").trim();
        }),
    ).filter((r) => r.some((c) => c));
    if (!rows.length) return [];
    const width = Math.max(...rows.map((r) => r.length));
    if (width === 1) return rows.map((r) => r[0]);
    const norm = rows.map((r) => [...r, ...Array(width - r.length).fill("")]);
    // Header cells should not keep bold markers
    const header = norm[0].map((c) => c.replace(/\*\*/g, "").trim() || " ");
    const lines = [`| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`];
    for (const r of norm.slice(1)) lines.push(`| ${r.join(" | ")} |`);
    const out = [lines.join("\n")];
    if (caption) out.push(`_${caption}_`);
    return out;
  }

  figure(imgEl, captionEl) {
    const $ = this.$;
    const src = $(imgEl).attr("data-src") || $(imgEl).attr("src");
    if (!src || src.startsWith("data:")) return [];
    // Related-post thumbnails are not article content
    if (/-\d+x\d+\.(webp|jpe?g|png)$/i.test(src) && /672x448|150x150|300x200/.test(src)) return [];
    const alt = squash($(imgEl).attr("alt") || "").trim();
    const caption = captionEl ? this.inlineOf(captionEl, { noLinks: true }) : "";
    this.figureCount += 1;
    const id = `inline-${this.figureCount}`;
    const token = `@@FIGURE:${id}@@`;
    this.imageQueue.push({ id, url: new URL(src, SITE).toString(), alt, caption, token });
    return [token];
  }

  chart(widget) {
    const $ = this.$;
    const el = $(widget).find("[data-chart_options]").get(0);
    if (!el) return [];
    let opts;
    try {
      opts = JSON.parse($(el).attr("data-chart_options"));
    } catch {
      return [];
    }
    const kind = $(el).attr("data-chart_type") || "column";
    const clean = (s) => String(s).replace(/\s+/g, " ").trim();
    if (kind === "radial" || kind === "pie" || kind === "donut" || kind === "polar") {
      const labels = (opts.labels || opts.xaxis?.categories || []).map(clean);
      const values = (opts.series || []).map(Number);
      if (!labels.length) return [];
      return [`<ArticleChart type="share" categories={${attrJson(labels)}} series={${attrJson([{ name: "Share", data: values }])}} />`];
    }
    const categories = (opts.xaxis?.categories || []).map(clean);
    const series = (opts.series || []).map((s) => ({
      name: clean(s.name || "").replace(/^Element$/, ""),
      data: (s.data || []).map((d) => (typeof d === "object" && d !== null ? Number(d.y) : Number(d))),
    }));
    if (!categories.length || !series.length) return [];
    const type = kind === "line" || kind === "area" ? "line" : "bar";
    return [`<ArticleChart type="${type}" categories={${attrJson(categories)}} series={${attrJson(series)}} />`];
  }

  faqWidget(widget) {
    const $ = this.$;
    $(widget)
      .find(".qodef-e-title-holder")
      .each((_, h) => {
        const q = this.textOf($(h).find(".qodef-e-title").get(0) || h);
        const content = $(h).next(".qodef-e-content").get(0);
        const a = content ? this.textOf(content) : "";
        if (q && a) this.faqs.push({ q: q.replace(/^Q\d+\s*[:.)-]\s*/i, ""), a });
      });
    return ["@@FAQ@@"];
  }

  readAlso(href, title) {
    const h = this.href(href);
    if (!h || !title) return [];
    return [`<ReadAlso href=${attrStr(h)} title=${attrStr(title.replace(/\s+/g, " ").trim())} />`];
  }

  widget(el, type) {
    const $ = this.$;
    const container = $(el).children(".elementor-widget-container").get(0) || el;
    switch (type) {
      case "text-editor.default":
        return this.blocks(container);
      case "heading.default": {
        const h = $(container).find("h1,h2,h3,h4,h5,h6").get(0);
        if (!h) return [];
        return this.heading(h, Number(h.tagName[1]));
      }
      case "icon-list.default": {
        const items = $(container)
          .find(".elementor-icon-list-text")
          .toArray()
          .map((t) => this.inlineOf(t))
          .filter(Boolean);
        return items.length ? [items.map((t) => `- ${t}`).join("\n")] : [];
      }
      case "eael-data-table.default": {
        const t = $(container).find("table").get(0);
        return t ? this.table(t) : [];
      }
      case "qi_addons_for_elementor_call_to_action.default": {
        const title = this.textOf($(container).find(".qodef-m-title").get(0) || container);
        const href = $(container).find("a.qodef-m-link, a").first().attr("href");
        return this.readAlso(href, title);
      }
      case "qi_addons_for_elementor_faq.default":
        return this.faqWidget(container);
      case "alert.default": {
        const title = this.textOf($(container).find(".elementor-alert-title").get(0) || container);
        const desc = $(container).find(".elementor-alert-description").get(0);
        const out = title ? [`### ${escapeText(title)}`] : [];
        if (desc) out.push(...this.blocks(desc));
        return out;
      }
      case "shortcode.default": {
        const text = $(container).text();
        const m = text.match(/\[table id=(\d+)/);
        if (m && this.tablepress.has(m[1])) return this.tablepress.get(m[1]);
        return [];
      }
      case "column_chart.default":
      case "distributed_column_chart.default":
      case "line_chart.default":
      case "area_chart.default":
      case "radial_chart.default":
      case "pie_chart.default":
      case "donut_chart.default":
        return this.chart(container);
      case "image.default": {
        const img = $(container).find("img").get(0);
        return img ? this.figure(img, $(container).find("figcaption").get(0)) : [];
      }
      case "style_one.default":
      case "divider.default":
      case "spacer.default":
      case "html.default":
      case "button.default":
      case "social-icons.default":
        return [];
      default:
        return this.blocks(container);
    }
  }

  block(el) {
    const $ = this.$;
    const tag = el.tagName.toLowerCase();
    if (SKIP_TAGS.has(tag)) return [];
    const cls = $(el).attr("class") || "";

    const widgetType = $(el).attr("data-widget_type");
    if (widgetType) return this.widget(el, widgetType);

    // Yoast / Rank Math FAQ blocks
    if (/schema-faq|rank-math-block/.test(cls)) {
      $(el)
        .find(".schema-faq-section, .rank-math-list-item")
        .each((_, s) => {
          const q = this.textOf($(s).find(".schema-faq-question, .rank-math-question").get(0) || s);
          const a = this.textOf($(s).find(".schema-faq-answer, .rank-math-answer").get(0) || s);
          if (q && a) this.faqs.push({ q, a });
        });
      return ["@@FAQ@@"];
    }

    if (/^h[1-6]$/.test(tag)) return this.heading(el, Number(tag[1]));

    if (tag === "p") {
      const text = this.textOf(el);
      if (!text && $(el).find("img").length) {
        return $(el).find("img").toArray().flatMap((img) => this.figure(img));
      }
      if (!text) return [];
      if (/subscribe\s+for real-time financial insights/i.test(text)) return [];
      const ra = text.match(/^(?:read this also|read this|also read|read also|must read)\s*[:\-–]\s*(.+)$/i);
      const a = $(el).find("a").first();
      if (ra && a.length) return this.readAlso(a.attr("href"), ra[1]);
      if (/^disclaimer\s*[:\-]/i.test(text)) return [];
      return [this.inlineOf(el)];
    }

    if (tag === "ul" || tag === "ol") return [this.list(el)];

    if (tag === "table") return this.table(el);

    if (tag === "blockquote") {
      const inner = this.blocks(el);
      if (!inner.length) return [];
      return [inner.map((b) => b.split("\n").map((l) => `> ${l}`).join("\n")).join("\n>\n")];
    }

    if (tag === "img") return this.figure(el);

    if (tag === "figure") {
      const t = $(el).find("table").get(0);
      const cap = $(el).children("figcaption").get(0);
      if (t) return this.table(t, cap ? this.inlineOf(cap) : null);
      const img = $(el).find("img").get(0);
      if (img) return this.figure(img, cap);
      return [];
    }

    if (tag === "div") {
      // "Quick Summary" boxes become frontmatter
      const firstHeading = $(el).children("h2,h3,h4").first();
      if (firstHeading.length && /^quick summary$/i.test(this.textOf(firstHeading.get(0)))) {
        const paras = $(el).children("p").toArray().map((p) => this.textOf(p)).filter(Boolean);
        if (paras.length) this.summary = paras.join(" ");
        return [];
      }
      if (/tradingview|eblog-area|sharedaddy|jp-relatedposts|wp-block-buttons/.test(cls)) return [];
    }

    return this.blocks(el);
  }
}

function cleanupBlocks(blocks) {
  const out = [];
  for (const b of blocks) {
    // Nested <strong> tags in the source produce "**a****b**"; merge the runs
    const t = b
      .trim()
      .replace(/\*\*\*\*/g, "")
      // Bold around a lone punctuation mark cannot close in Markdown: **'**word
      .replace(/\*\*([‘’“”'",.:;!?])\*\*/g, "$1")
      // "**Label:**Text" needs a space after the closing marker to render as bold
      .replace(/(\*\*[^*\n]*?[:.,;!?‘’“”)])\*\*(?=[A-Za-z0-9₹])/g, "$1** ");
    if (!t) continue;
    // In-content breadcrumbs ("Home » Title") duplicate the page breadcrumb
    if (/^\[Home\]\(\/\) »/.test(t)) continue;
    // Drop empty emphasis and stray separators
    if (/^(\*\*|_|\s)+$/.test(t)) continue;
    out.push(t);
  }
  // Remove a trailing "FAQs" heading that sat directly above an FAQ widget
  const final = [];
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1];
    if (/^#{2,4} .*(faq|frequently asked)/i.test(out[i]) && (next === "@@FAQ@@" || next === undefined)) continue;
    if (/^#{2,4} disclaimer/i.test(out[i])) continue;
    if (out[i] === "@@FAQ@@") continue;
    final.push(out[i]);
  }
  // Drop headings with no content before the next heading of the same or higher rank
  const level = (b) => (b.match(/^(#{2,4}) /) || [])[1]?.length || 0;
  const kept = final.filter((b, i) => {
    const l = level(b);
    if (!l) return true;
    const next = final[i + 1];
    if (next === undefined) return false;
    const nl = level(next);
    return !(nl && nl <= l);
  });
  // Headings must not skip levels (h2 then h4), for accessibility and the table of contents
  let prev = 1;
  return kept.map((b) => {
    const l = level(b);
    if (!l) return b;
    const fixed = Math.min(l, prev + 1);
    prev = fixed;
    return fixed === l ? b : "#".repeat(fixed) + b.slice(l);
  });
}

// ---------------------------------------------------------------------------

const stripTags = (s) => cheerio.load(`<div>${s}</div>`)("div").text();
const plain = (s) => squash(stripTags(s || "")).trim();

function categoryInfo(post) {
  const ids = post.categories || [];
  const mapped = ids.map((id) => CATEGORY_MAP[id]).filter(Boolean);
  // Prefer the category that matches the permalink's first segment
  const first = new URL(post.link).pathname.split("/").filter(Boolean)[0];
  const section = mapped.find((m) => m.section === first)?.section || mapped[0]?.section || "news";
  const sub = mapped.find((m) => m.section === section && m.sub)?.sub || null;
  return { section, sub };
}

async function main() {
  const postsBySlug = new Map();
  for (const slug of [...REQUIRED, ...EXTRA]) {
    let post = await fetchPost(slug);
    if (!post && REQUIRED.includes(slug)) {
      console.warn(`! ${slug} not found, falling back to category listing`);
      const fallback = await fetchCategoryFallback(65);
      post = fallback.find((p) => !postsBySlug.has(p.slug)) || null;
    }
    if (!post) {
      console.warn(`! skipped ${slug}`);
      continue;
    }
    postsBySlug.set(post.slug, post);
  }

  const linkMap = new Map();
  for (const p of postsBySlug.values()) linkMap.set(new URL(p.link).pathname, p.slug);

  await fs.rm(path.join(ROOT, "content", "articles"), { recursive: true, force: true });
  await fs.mkdir(path.join(ROOT, "content", "articles"), { recursive: true });

  const authors = new Map();
  for (const post of postsBySlug.values()) {
    const slug = post.slug;
    const html = post.content.rendered;

    // TablePress tables only exist in the rendered page, so convert them from there
    const tablepress = new Map();
    if (/\[table id=\d+/.test(html)) {
      const page = cheerio.load(await fetchRenderedPage(post.link));
      const pageConv = new Converter({ $: page, slug, linkMap, tablepress: new Map(), imageQueue: [] });
      page("table.tablepress").each((_, t) => {
        const id = (page(t).attr("id") || "").replace("tablepress-", "");
        if (id) tablepress.set(id, pageConv.table(t));
      });
    }

    const $ = cheerio.load(`<div id="root">${html}</div>`);
    const imageQueue = [];
    const conv = new Converter({ $, slug, linkMap, tablepress, imageQueue });

    let blocks = cleanupBlocks(conv.blocks($("#root").get(0)));

    // Images
    const imgDir = path.join(ROOT, "public", "images", "articles", slug);
    await fs.rm(imgDir, { recursive: true, force: true });
    for (const item of imageQueue) {
      try {
        const saved = await saveImage(item.url, path.join(imgDir, item.id), { quality: 82 });
        const tag = `<Figure src=${attrStr(saved.src)} width={${saved.width}} height={${saved.height}} alt=${attrStr(item.alt || item.caption || "")}${item.caption ? ` caption=${attrStr(item.caption)}` : ""} />`;
        blocks = blocks.map((b) => (b === item.token ? tag : b));
      } catch (e) {
        console.warn(`  image failed ${item.url}: ${e.message}`);
        blocks = blocks.filter((b) => b !== item.token);
      }
    }

    const fm = post._embedded?.["wp:featuredmedia"]?.[0];
    let image = null;
    if (fm?.source_url) {
      const saved = await saveImage(fm.source_url, path.join(imgDir, "cover"));
      image = {
        ...saved,
        alt: plain(fm.alt_text) || plain(post.title.rendered),
        caption: plain(fm.caption?.rendered) || null,
        credit: "TradeTarget",
      };
    }

    const author = post._embedded?.author?.[0];
    if (author) authors.set(author.slug, author);

    const terms = post._embedded?.["wp:term"] || [];
    const tags = (terms[1] || []).map((t) => plain(t.name));
    const { section, sub } = categoryInfo(post);
    const body = blocks.join("\n\n") + "\n";
    const words = body.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    const brokenTables = (html.match(/\[table id=\d+/g) || []).length - tablepress.size;
    const yoast = post.yoast_head_json || {};
    const excerpt = plain(post.excerpt?.rendered).replace(/^Subscribe\s+for real-time financial insights on Trade Target.s WhatsApp Channels\s*/i, "").replace(/^Quick Summary\s*/i, "").replace(/\s*…$|\s*\.\.\.$|&#8230;$/, "…");

    const data = {
      title: plain(post.title.rendered),
      slug,
      path: new URL(post.link).pathname,
      section,
      subsection: sub,
      date: post.date,
      modified: post.modified,
      author: author?.slug || "hemant",
      standfirst: plain(yoast.description) || conv.summary || excerpt,
      summary: conv.summary,
      tags,
      readTime: Math.max(2, Math.round(words / 220)),
      image,
      faqs: conv.faqs,
      source: post.link,
      wpId: post.id,
      brokenTables: brokenTables > 0 ? brokenTables : undefined,
    };
    const file = matter.stringify(body, JSON.parse(JSON.stringify(data)));
    await fs.writeFile(path.join(ROOT, "content", "articles", `${slug}.mdx`), file);
    console.log(`✓ ${data.path}  (${blocks.length} blocks, ${imageQueue.length} inline images, ${conv.faqs.length} faqs)`);
  }

  console.log(`\nImported ${postsBySlug.size} articles. Authors: ${[...authors.keys()].join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
