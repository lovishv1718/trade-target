import Image from "next/image";
import type { ArticleImage } from "@/lib/content";

/**
 * The five crops a photograph may take, and nothing else:
 *   band 5:2 (the front page's slim story cards), panorama 2:1 (page-wide bands),
 *   wide 16:9 (leads, article heroes), standard 3:2 (tiles), compact 4:3 (reading lists).
 * A crop can change at md and lg; the class names are written out so Tailwind sees them.
 */
export type Crop = "band" | "panorama" | "wide" | "standard" | "compact";
type CropSpec = Crop | { base: Crop; md?: Crop; lg?: Crop };

const BASE: Record<Crop, string> = { band: "aspect-[5/2]", panorama: "aspect-[2/1]", wide: "aspect-[16/9]", standard: "aspect-[3/2]", compact: "aspect-[4/3]" };
const MD: Record<Crop, string> = { band: "md:aspect-[5/2]", panorama: "md:aspect-[2/1]", wide: "md:aspect-[16/9]", standard: "md:aspect-[3/2]", compact: "md:aspect-[4/3]" };
const LG: Record<Crop, string> = { band: "lg:aspect-[5/2]", panorama: "lg:aspect-[2/1]", wide: "lg:aspect-[16/9]", standard: "lg:aspect-[3/2]", compact: "lg:aspect-[4/3]" };

function cropClass(crop: CropSpec) {
  if (typeof crop === "string") return BASE[crop];
  return [BASE[crop.base], crop.md ? MD[crop.md] : "", crop.lg ? LG[crop.lg] : ""].join(" ");
}

/** "Photo: Name" for agency and Commons pictures; the paper's own graphics are credited to it. */
export function photoCredit(image: ArticleImage) {
  return image.credit && image.credit !== "TradeTarget" ? `Photo: ${image.credit}` : "Image: TradeTarget";
}

type Props = {
  image: ArticleImage | null;
  sizes: string;
  crop?: CropSpec;
  priority?: boolean;
  className?: string;
  /** "full" sets the caption and the credit underneath; "credit" sets the credit alone. */
  caption?: "full" | "credit";
  /** Replaces the stored caption text, for pages that describe the picture in their own words. */
  captionText?: string;
};

/**
 * A placed photograph: fixed crop, warm tone, hairline edge, and a wipe with a settle once it
 * has decoded (styles in globals.css). The box is reserved before the image arrives, so nothing
 * moves. With no image, or one that fails, the frame shows a printer's layout cross instead.
 * Inside a `group` link the picture scales 2% on hover. The paper's own cover graphics carry its
 * mark in the top-left corner, so those are framed from the right (data-own, premium.css).
 */
export function Photo({ image, sizes, crop = "standard", priority = false, className = "", caption, captionText }: Props) {
  const frame = (
    <div className={`photo-frame ${cropClass(crop)}`} data-empty={image ? undefined : ""} data-own={image?.credit === "TradeTarget" ? "" : undefined}>
      {image ? (
        <div className="photo-wipe">
          <div className="photo-wipe-inner">
            <div className="photo-zoom">
              <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" />
            </div>
          </div>
        </div>
      ) : null}
      <span className="photo-empty" aria-hidden>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none">
          <path d="M0 0L100 100M100 0L0 100" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        <span>No photograph</span>
      </span>
    </div>
  );
  if (!caption || !image) return <div className={className}>{frame}</div>;
  const text = caption === "full" ? (captionText ?? image.caption ?? "") : "";
  return (
    <figure className={className}>
      {frame}
      <figcaption className="photo-caption">
        {text ? <span className="min-w-0">{text}</span> : null}
        <span className="photo-credit ml-auto">{photoCredit(image)}</span>
      </figcaption>
    </figure>
  );
}
