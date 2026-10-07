import { RiskBadge } from "./risk-badge";
import type { Advisory } from "@/lib/types";

/**
 * One advisory as a ruled list row (not a card): severity tag, category,
 * area, title, summary, attribution. Rows are separated by hairlines
 * like a bulletin board (R-05, R-14).
 */
export function AdvisoryRow({ advisory }: { advisory: Advisory }) {
  return (
    <article className="border-b border-border py-5 last:border-b-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <RiskBadge level={advisory.level} />
        <span className="font-mono text-[10px] font-medium tracking-[0.1em] text-muted-foreground uppercase">
          {advisory.category}
        </span>
        <span className="font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
          {advisory.area}
        </span>
      </div>
      <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">
        {advisory.title}
      </h3>
      <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {advisory.summary}
      </p>
      <p className="mt-2 font-mono text-[10px] tracking-[0.06em] text-muted-foreground uppercase">
        Source: {advisory.source} · Published: {advisory.publishedAt}
      </p>
      {advisory.url ? (
        <a
          href={advisory.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block font-mono text-[11px] font-semibold tracking-[0.06em] text-foreground uppercase underline underline-offset-4 hover:text-signal"
        >
          Read official advisory
        </a>
      ) : null}
    </article>
  );
}
