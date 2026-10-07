interface SourceNoteProps {
  source: string;
  updated: string;
  methodology?: string;
}

/**
 * Trust is a product feature (blueprint §22): every figure carries its
 * source, timestamp, and methodology on a mono attribution line.
 */
export function SourceNote({ source, updated, methodology }: SourceNoteProps) {
  return (
    <div className="mt-4 space-y-0.5 border-t border-border pt-3 font-mono text-[10px] leading-relaxed tracking-[0.04em] text-muted-foreground uppercase">
      <p>
        <span className="font-semibold text-foreground">Source:</span> {source}
      </p>
      <p>
        <span className="font-semibold text-foreground">Updated:</span>{" "}
        {updated}
      </p>
      {methodology ? (
        <p>
          <span className="font-semibold text-foreground">Method:</span>{" "}
          {methodology}
        </p>
      ) : null}
    </div>
  );
}
