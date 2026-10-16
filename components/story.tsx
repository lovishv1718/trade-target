import Link from "next/link";
import type { ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Kicker } from "./kicker";
import { Photo } from "./photo";

// Story furniture shared across the site. One order everywhere: kicker, headline,
// standfirst, meta. Hover is quiet: the headline underlines and the photo scales 2%.

export function StoryMeta({ story, showRead = true, className = "" }: { story: ArticleCard; showRead?: boolean; className?: string }) {
  return (
    <p className={`text-xs text-muted ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time>
      {showRead ? (
        <>
          <span aria-hidden className="px-1.5">
            ·
          </span>
          <span>{story.readTime} min read</span>
        </>
      ) : null}
    </p>
  );
}

/** Large lead: 16:9 photo, the largest headline on the page, standfirst. */
export function LeadStory({ story, priority = false, sizes = "(min-width: 1024px) 760px, 100vw" }: { story: ArticleCard; priority?: boolean; sizes?: string }) {
  return (
    <article>
      <Link prefetch={false} href={story.path} className="group block">
        <Photo image={story.image} sizes={sizes} aspect="aspect-[16/9]" priority={priority} />
        <Kicker label={story.kicker} className="mt-4 block" />
        <h2 className="headline mt-2 text-balance break-words text-3xl md:text-4xl">{story.title}</h2>
      </Link>
      <p className="mt-3 max-w-2xl text-base leading-normal text-ink-2 md:text-lg md:leading-normal">{story.standfirst}</p>
      <StoryMeta story={story} className="mt-3" />
    </article>
  );
}

/** Image on top, compact headline. */
export function StoryTile({
  story,
  sizes = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw",
  standfirst = false,
  aspect = "aspect-[3/2]",
  headingSize = "text-lg",
}: {
  story: ArticleCard;
  sizes?: string;
  standfirst?: boolean;
  aspect?: string;
  headingSize?: string;
}) {
  return (
    <article>
      <Link prefetch={false} href={story.path} className="group block">
        <Photo image={story.image} sizes={sizes} aspect={aspect} />
        <Kicker label={story.kicker} className="mt-3 block" />
        <h3 className={`headline mt-1 break-words ${headingSize}`}>{story.title}</h3>
      </Link>
      {standfirst ? <p className="mt-2 line-clamp-3 text-md text-ink-2">{story.standfirst}</p> : null}
      <StoryMeta story={story} className="mt-2" showRead={false} />
    </article>
  );
}

/** List row: text on the left where the eye scans, thumbnail on the right. */
export function StoryRow({ story, standfirst = false }: { story: ArticleCard; standfirst?: boolean }) {
  return (
    <article className="py-4 md:py-5">
      <Link prefetch={false} href={story.path} className="group flex items-start gap-4 md:gap-6">
        <div className="min-w-0 flex-1">
          <Kicker label={story.kicker} />
          <h3 className="headline mt-1 break-words text-lg md:text-xl">{story.title}</h3>
          {standfirst ? <p className="mt-1.5 hidden max-w-2xl text-md text-ink-2 sm:line-clamp-2">{story.standfirst}</p> : null}
          <StoryMeta story={story} className="mt-2" />
        </div>
        <Photo image={story.image} sizes="(min-width: 768px) 192px, (min-width: 640px) 144px, 96px" className="w-24 shrink-0 sm:w-36 md:w-48" />
      </Link>
    </article>
  );
}

/** Headline only, with an optional rank number in tabular sans. */
export function StoryLink({ story, index }: { story: ArticleCard; index?: number }) {
  return (
    <article className="flex items-start gap-4 py-3">
      {index !== undefined ? <span className="w-5 shrink-0 text-right text-3xl font-light leading-none text-muted tabular-nums">{index}</span> : null}
      <Link prefetch={false} href={story.path} className="group min-w-0">
        <Kicker label={story.kicker} />
        <h3 className="headline mt-0.5 break-words text-base leading-snug">{story.title}</h3>
      </Link>
    </article>
  );
}
