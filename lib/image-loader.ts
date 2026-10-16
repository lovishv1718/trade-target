// Static export has no image optimiser, so responsive WebP sizes are generated at import
// time as name-240.webp up to name-1440.webp. This loader picks the
// smallest generated width that covers the requested one.

const WIDTHS = [240, 480, 720, 960, 1440];
const VARIANT_DIRS = ["/images/articles/", "/images/photos/"];

export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!src.endsWith(".webp") || !VARIANT_DIRS.some((d) => src.startsWith(d))) return src;
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  return src.replace(/\.webp$/, `-${w}.webp`);
}
