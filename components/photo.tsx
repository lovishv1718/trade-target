import Image from "next/image";
import type { ArticleImage } from "@/lib/content";

type Props = {
  image: ArticleImage | null;
  sizes: string;
  aspect?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Cropped photo in a fixed aspect box, so the space is reserved before the image loads.
 * Falls back to a quiet paper panel when there is no image. Inside a `group` link the
 * photo scales 2% on hover; the scale sits on a wrapper so it never fights the fade-in.
 */
export function Photo({ image, sizes, aspect = "aspect-[3/2]", priority = false, className = "" }: Props) {
  return (
    <div className={`relative overflow-hidden bg-paper-2 ${aspect} ${className}`}>
      {image ? (
        <div className="absolute inset-0 transition-transform duration-200 ease-out motion-safe:group-hover:scale-102">
          <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="img-fade object-cover" />
        </div>
      ) : null}
    </div>
  );
}
