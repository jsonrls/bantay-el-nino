"use client";

import { Button } from "@/components/ui/button";

/**
 * Error state (R-27): names what failed and offers the next action.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="font-mono text-[11px] font-semibold tracking-[0.1em] text-risk-extreme uppercase">
        Page failed to load
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold text-foreground">
        Something went wrong while loading this page.
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        The page could not be rendered. Try again, and check the advisories or
        learn pages if the problem continues.
        {error.digest ? ` Reference: ${error.digest}` : ""}
      </p>
      <Button
        onClick={reset}
        className="mt-6 h-11 px-6 font-mono text-xs font-semibold tracking-[0.08em] uppercase"
      >
        Try again
      </Button>
    </div>
  );
}
