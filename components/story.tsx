import Link from "next/link";
import authors from "@/content/authors.json";
import type { ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Kicker } from "./kicker";
import { Photo, photoCredit } from "./photo";

// Story furniture shared across the site. One order everywhere: kicker, headline,
// standfirst, meta. Hover is the .story device: a 2px rule draws in across the top
// and the headline takes its underline.

const authorName = (slug: string) => authors.find((a) => a.slug === slug)?.name ?? authors[0].name;

export function StoryMeta({ story, showRead = true, className = "" }: { story: ArticleCard; showRead?: boolean; className?: string }) {
  return (
    <p className={`text-xs text-muted tabular ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time>
      {showRead ? (
        <>
          <span aria-hidden className="px-1.5 text-faint">
            ·
          </span>
          <span>{story.readTime} min read</span>
        </>
      ) : null}
    </p>
  );
}

/** Byline, date and read time as one ruled block: a row on narrow columns, a stacked ledger beside the deck on wide ones. */
export function Dateline({ story, className = "" }: { story: ArticleCard; className?: string }) {
  return (
    <dl className={`dateline ${className}`}>
      <div>
        <dt>By</dt>
        <dd>{authorName(story.author)}</dd>
      </div>
      <div>
        <dt>Published</dt>
        <dd>
          <time dateTime={story.date}>{formatDate(story.date)}</time>
        </dd>
      </div>
      <div>
        <dt>Read</dt>
        <dd>{story.readTime} min</dd>
      </div>
    </dl>
  );
}

/**
 * The lead: one composition, sized by the column it sits in (container queries in globals.css).
 * Kicker running into a hairline, the display headline, the wide photograph with its caption and
 * credit, then the deck beside a stacked dateline. The photo link is a duplicate of the headline
 * link, so it is skipped by the keyboard and screen readers.
 */
export function LeadStory({ story, priority = false, sizes = "(min-width: 1024px) 760px, 100vw" }: { story: ArticleCard; priority?: boolean; sizes?: string }) {
  return (
    <article className="story story-lead group">
      <Link prefetch={false} href={story.path} className="block">
        <Kicker label={story.kicker} className="kicker-rule" />
        <h2 className="lead-title headline mt-2.5 text-balance">{story.title}</h2>
      </Link>
      <Link prefetch={false} href={story.path} tabIndex={-1} aria-hidden className="lead-photo mt-4 block">
        <Photo image={story.image} sizes={sizes} crop="wide" priority={priority} />
      </Link>
      {story.image ? (
        <p className="photo-caption">
          {story.image.caption && story.image.caption !== story.title ? <span className="min-w-0">{story.image.caption}</span> : null}
          <span className="photo-credit ml-auto">{photoCredit(story.image)}</span>
        </p>
      ) : null}
      <div className="lead-foot mt-4">
        <p className="deck text-lg leading-normal">{story.standfirst}</p>
        <Dateline story={story} />
      </div>
    </article>
  );
}

/** Image on top, compact headline. */
export function StoryTile({
  story,
  sizes = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw",
  standfirst = false,
  crop = "standard",
  headingSize = "text-lg",
}: {
  story: ArticleCard;
  sizes?: string;
  standfirst?: boolean;
  crop?: "wide" | "standard" | "compact" | "panorama";
  headingSize?: string;
}) {
  return (
    <article className="story group pt-3">
      <Link prefetch={false} href={story.path} className="block">
        <Photo image={story.image} sizes={sizes} crop={crop} />
        <Kicker label={story.kicker} className="mt-3 block" />
        <h3 className={`headline mt-1 ${headingSize}`}>{story.title}</h3>
      </Link>
      {standfirst ? <p className="mt-2 line-clamp-3 text-md text-ink-2">{story.standfirst}</p> : null}
      <StoryMeta story={story} className="mt-2" showRead={false} />
    </article>
  );
}

/** List row: text on the left where the eye scans, thumbnail on the right. */
export function StoryRow({ story, standfirst = false }: { story: ArticleCard; standfirst?: boolean }) {
  return (
    <article className="story group py-4 md:py-5">
      <Link prefetch={false} href={story.path} className="flex items-start gap-4 md:gap-6">
        <div className="min-w-0 flex-1">
          <Kicker label={story.kicker} />
          <h3 className="headline mt-1 text-lg md:text-xl">{story.title}</h3>
          {standfirst ? <p className="mt-1.5 hidden max-w-2xl text-md text-ink-2 sm:line-clamp-2">{story.standfirst}</p> : null}
          <StoryMeta story={story} className="mt-2" />
        </div>
        <Photo image={story.image} sizes="(min-width: 768px) 192px, (min-width: 640px) 144px, 96px" crop="compact" className="w-24 shrink-0 sm:w-36 md:w-48" />
      </Link>
    </article>
  );
}

/** Headline only, with an optional rank number in tabular sans. */
export function StoryLink({ story, index }: { story: ArticleCard; index?: number }) {
  return (
    <article className="story flex items-start gap-4 py-3">
      {index !== undefined ? <span className="w-5 shrink-0 text-right text-3xl font-light leading-none text-muted tabular-nums">{index}</span> : null}
      <Link prefetch={false} href={story.path} className="min-w-0">
        <Kicker label={story.kicker} />
        <h3 className="headline mt-0.5 text-base leading-snug">{story.title}</h3>
      </Link>
    </article>
  );
}
