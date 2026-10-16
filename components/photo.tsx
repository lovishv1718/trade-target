import Image from "next/image";
import type { ArticleImage } from "@/lib/content";

type Props = {
  image: ArticleImage | null;
  sizes: string;
  aspect?: string;
  priority?: boolean;
  className?: string;
};

/** Cropped photo in a fixed aspect box. Falls back to a neutral panel when there is no image. */
export function Photo({ image, sizes, aspect = "aspect-[3/2]", priority = false, className = "" }: Props) {
  return (
    <div className={`relative overflow-hidden bg-paper-2 ${aspect} ${className}`}>
      {image ? <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} className="object-cover" /> : null}
    </div>
  );
}
