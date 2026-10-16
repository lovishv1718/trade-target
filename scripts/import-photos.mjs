// Downloads free-licensed photos from Wikimedia Commons, writes WebP variants to
// /public/images/photos and records attribution in /content/photo-credits.json.
// It also points selected article covers at these photos where the original
// WordPress cover is a text graphic rather than a photograph.
// Run after import:wp with: npm run import:photos

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = path.join(ROOT, ".cache", "commons");
const UA = "TradeTarget-sample-site/1.0 (contact: business@tradetarget.in)";
const WIDTHS = [240, 480, 720, 960, 1440];

// id -> Wikimedia Commons file, with the subject it illustrates
const PHOTOS = [
  { id: "thermal-power-plant", file: "File:Rajpura Thermal Power Plant.jpg", subject: "Rajpura thermal power plant, Punjab" },
  { id: "bse-building", file: "File:BSE - Bombay Stock Exchange Building.jpg", subject: "BSE building, Mumbai" },
  { id: "bse-dalal-street", file: "File:BSE building at Dalal Street.JPG", subject: "BSE building on Dalal Street, Mumbai" },
  { id: "mumbai-skyline-night", file: "File:Mumbai Skyline at Night.jpg", subject: "Mumbai skyline at night" },
  { id: "mumbai-skyline-sunset", file: "File:Mumbai, India, Bombay, Mumbai skyline at sunset.jpg", subject: "Mumbai skyline at sunset" },
  { id: "gold-bars", file: "File:Gold bullion bars.jpg", subject: "Gold bullion bars" },
  { id: "molten-steel", file: "File:Metal Smelting (919).jpg", subject: "Molten metal being poured at a foundry" },
  { id: "stock-chart-screen", file: "File:Stock market charts illustration.jpg", subject: "Stock price charts on a screen" },
  { id: "nse-exchange-plaza", file: "File:IT7A2918 copy.jpg", subject: "NSE Exchange Plaza, Bandra Kurla Complex" },
  { id: "nse-building", file: "File:IT7A2275 copy (cropped).jpg", subject: "NSE headquarters, Mumbai" },
  { id: "rupee-note", file: "File:Indian 50-rupees banknote closeup (68912).jpg", subject: "Indian ₹50 banknote" },
  { id: "lab-pipette", file: "File:Monoclonal antibodies (8).jpg", subject: "Laboratory pipetting into a well plate" },
  { id: "jharia-coal-mine", file: "File:Open pit mine in Jharia.jpg", subject: "Open-pit coal mine in Jharia, Jharkhand" },
  { id: "telecom-tower", file: "File:Mobile communication tower in Western ghats near Kollur.jpg", subject: "Mobile communication tower, Karnataka" },
  { id: "hospital-building", file: "File:CMC Hospital building.jpg", subject: "Hospital building" },
  { id: "metal-machining", file: "File:Sparks fly at metal tech 150623-F-CB366-093.jpg", subject: "Metal machining" },
  { id: "industrial-gearbox", file: "File:Manufactures of industrial gearbox.jpg", subject: "Industrial gearbox" },
  { id: "thermal-camera", file: "File:Infrared Camera.JPG", subject: "Thermal imaging camera" },
  { id: "cola-can", file: "File:Coca-Cola lata.jpg", subject: "Can of cola" },
  { id: "writer-laptop", file: "File:Writing notes while using a laptop at a desk.jpg", subject: "Writing notes at a laptop" },
];

// Articles whose WordPress cover is a headline card get a photograph instead.
// The original graphic stays downloaded and is recorded as originalImage.
const ARTICLE_COVERS = {
  "ntpc-q4-2026-result": "thermal-power-plant",
  "divis-lab-q4-2026-results": "lab-pipette",
  "gold-and-silver-prices-surge": "gold-bars",
  "nse-ipo-allotment-status": "nse-exchange-plaza",
  "hero-motors-ipo-allotment-status": "bse-building",
  "nifty-could-slip-to-20500-warns-jpmorgan": "stock-chart-screen",
  "stock-market-holiday-next-week": "bse-dalal-street",
  "mutual-funds-cut-stakes-in-30-stocks": "mumbai-skyline-sunset",
  "upcoming-dividends-in-april-2026": "rupee-note",
  "diet-coke-shortage-in-india-why-is-it-disappearing": "cola-can",
  "steel-authority-of-india-fundamental-analysis": "molten-steel",
  "bharat-coking-coal-ipo-gmp": "jharia-coal-mine",
};

const strip = (s = "") => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const hash = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 16);

async function cachedFetch(url, key) {
  const file = path.join(CACHE, key);
  try {
    return await fs.readFile(file);
  } catch {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.mkdir(CACHE, { recursive: true });
    await fs.writeFile(file, buf);
    return buf;
  }
}

async function commonsInfo(file) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(file)}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=2000`;
  const json = JSON.parse((await cachedFetch(url, `${hash(file)}.json`)).toString("utf8"));
  const page = Object.values(json.query.pages)[0];
  const ii = page.imageinfo[0];
  const m = ii.extmetadata;
  return {
    download: ii.thumburl || ii.url,
    sourceUrl: ii.descriptionurl,
    author: (strip(m.Artist?.value) || "Unknown author").replace(/^(Unknown author)+$/, "Unknown author"),
    license: m.LicenseShortName?.value || "",
    licenseUrl: m.LicenseUrl?.value || null,
  };
}

// Images that already belong to TradeTarget (team photos, client logos on the About page)
const SITE_ASSETS = [
  // Team photos are published inside a drawn ring, so crop to the inner circle
  { out: "authors/hemant-bisht", url: "https://tradetarget.in/wp-content/uploads/2025/07/hemant-bisht-trade-target.webp", size: 400, inset: 0.09 },
  { out: "authors/kashish-sharma", url: "https://tradetarget.in/wp-content/uploads/2025/11/Kashish-Sharma.webp", size: 400, inset: 0.09 },
  ...["groww-logo-1", "5paisa-logo", "standard-chartered-logo", "quantinsti-logo", "personal-finance-tv-logo", "hdfc-smart-wealth-logo", "kotak-securities-logo", "hdfc-sky-logo", "kotak-mahindra-mutual-fund-logo"].map((n) => ({
    out: `clients/${n.replace(/-logo(-1)?$/, "")}`,
    url: `https://tradetarget.in/wp-content/uploads/2025/07/${n}-150x150.webp`,
    size: 150,
  })),
];

async function siteAssets() {
  for (const a of SITE_ASSETS) {
    const buf = await cachedFetch(a.url, `${hash(a.url)}.img`);
    const out = path.join(ROOT, "public", "images", `${a.out}.webp`);
    await fs.mkdir(path.dirname(out), { recursive: true });
    let img = sharp(buf);
    if (a.inset) {
      const m = await sharp(buf).metadata();
      const side = Math.min(m.width, m.height);
      const cut = Math.round(side * a.inset);
      img = sharp(await sharp(buf).extract({ left: Math.round((m.width - side) / 2) + cut, top: Math.round((m.height - side) / 2) + cut, width: side - 2 * cut, height: side - 2 * cut }).toBuffer());
    }
    await img.resize({ width: a.size, height: a.size, fit: "cover", withoutEnlargement: true }).webp({ quality: 85 }).toFile(out);
    console.log(`✓ ${a.out}`);
  }
}

async function main() {
  await siteAssets();
  const outDir = path.join(ROOT, "public", "images", "photos");
  await fs.mkdir(outDir, { recursive: true });
  const credits = [];

  for (const p of PHOTOS) {
    const info = await commonsInfo(p.file);
    const buf = await cachedFetch(info.download, `${hash(info.download)}.img`);
    const meta = await sharp(buf).metadata();
    for (const w of WIDTHS) {
      await sharp(buf).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(outDir, `${p.id}-${w}.webp`));
    }
    await sharp(buf).rotate().resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 76 }).toFile(path.join(outDir, `${p.id}.webp`));
    const width = Math.min(meta.width, 1440);
    credits.push({
      id: p.id,
      src: `/images/photos/${p.id}.webp`,
      width,
      height: Math.round((meta.height / meta.width) * width),
      subject: p.subject,
      title: p.file.replace(/^File:/, ""),
      author: info.author,
      license: info.license,
      licenseUrl: info.licenseUrl,
      source: "Wikimedia Commons",
      sourceUrl: info.sourceUrl,
      usedOn: [],
    });
    console.log(`✓ ${p.id}  ${info.license}  ${info.author}`);
  }

  const byId = new Map(credits.map((c) => [c.id, c]));
  const articleDir = path.join(ROOT, "content", "articles");
  for (const [slug, photoId] of Object.entries(ARTICLE_COVERS)) {
    const file = path.join(articleDir, `${slug}.mdx`);
    const parsed = matter(await fs.readFile(file, "utf8"));
    const photo = byId.get(photoId);
    const original = parsed.data.originalImage || parsed.data.image;
    parsed.data.originalImage = original;
    parsed.data.image = {
      src: photo.src,
      width: photo.width,
      height: photo.height,
      alt: photo.subject,
      caption: photo.subject,
      credit: `${photo.author} / ${photo.source}, ${photo.license}`,
      photoId,
    };
    photo.usedOn.push(parsed.data.path);
    await fs.writeFile(file, matter.stringify(parsed.content, parsed.data));
  }

  await fs.writeFile(path.join(ROOT, "content", "photo-credits.json"), JSON.stringify(credits, null, 2) + "\n");
  console.log(`\n${credits.length} photos, ${Object.keys(ARTICLE_COVERS).length} article covers updated`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
