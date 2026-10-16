import Link from "next/link";
import type { ArticleCard } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { Kicker } from "./kicker";
import { Photo } from "./photo";

export function StoryMeta({ story, showRead = true, className = "" }: { story: ArticleCard; showRead?: boolean; className?: string }) {
  return (
    <p className={`text-[0.8rem] text-muted ${className}`}>
      <time dateTime={story.date}>{formatDate(story.date)}</time>
      {showRead ? <span> · {story.readTime} min read</span> : null}
    </p>
  );
}

/** Large lead: photo on top, big serif headline, standfirst. */
export function LeadStory({ story, priority = false }: { story: ArticleCard; priority?: boolean }) {
  return (
    <article>
      <Link prefetch={false} href={story.path} className="group block">
        <Photo image={story.image} sizes="(min-width: 1024px) 760px, 100vw" aspect="aspect-[16/9]" priority={priority} />
        <div className="mt-4">
          <Kicker label={story.kicker} />
          <h2 className="headline mt-1.5 text-[1.75rem] leading-[1.15] md:text-[2.35rem]">{story.title}</h2>
        </div>
      </Link>
      <p className="mt-3 text-[1.05rem] leading-relaxed text-[#323c4b] md:text-lg">{story.standfirst}</p>
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
  headingSize = "text-[1.15rem]",
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
        <h3 className={`headline mt-1 leading-snug ${headingSize}`}>{story.title}</h3>
      </Link>
      {standfirst ? <p className="mt-2 line-clamp-3 text-[0.95rem] leading-relaxed text-muted">{story.standfirst}</p> : null}
      <StoryMeta story={story} className="mt-2" showRead={false} />
    </article>
  );
}

/** Thumbnail on the left, used in news lists. */
export function StoryRow({ story, standfirst = false }: { story: ArticleCard; standfirst?: boolean }) {
  return (
    <article className="py-4">
      <Link prefetch={false} href={story.path} className="group flex gap-4">
        <Photo image={story.image} sizes="(min-width: 768px) 200px, 120px" className="w-28 shrink-0 self-start sm:w-40 md:w-48" />
        <div className="min-w-0">
          <Kicker label={story.kicker} />
          <h3 className="headline mt-1 text-[1.05rem] leading-snug md:text-[1.2rem]">{story.title}</h3>
          {standfirst ? <p className="mt-1.5 hidden text-[0.95rem] leading-relaxed text-muted sm:line-clamp-2">{story.standfirst}</p> : null}
          <StoryMeta story={story} className="mt-1.5" />
        </div>
      </Link>
    </article>
  );
}

/** Headline only, with an optional number. */
export function StoryLink({ story, index }: { story: ArticleCard; index?: number }) {
  return (
    <article className="flex gap-3 py-3">
      {index !== undefined ? <span className="headline w-6 shrink-0 text-2xl leading-none text-accent/80">{index}</span> : null}
      <Link prefetch={false} href={story.path} className="group min-w-0">
        <Kicker label={story.kicker} />
        <h3 className="headline mt-0.5 text-[1.02rem] leading-snug">{story.title}</h3>
      </Link>
    </article>
  );
}
