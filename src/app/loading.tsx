import { Skeleton } from "@/components/ui/skeleton";

/** Loading state for route navigation (R-27). */
export default function Loading() {
  return (
    <div
      className="mx-auto max-w-6xl space-y-4 px-4 py-10"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Loading climate data</p>
      <Skeleton className="h-4 w-44" />
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-44 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    </div>
  );
}
