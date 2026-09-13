import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
    <div className="dashboard" role="status" aria-label="Loading workspace">
      <span className="sr-only">Loading your workspace…</span>
      <Skeleton className="mb-3 h-8 w-64" />
      <Skeleton className="mb-10 h-4 w-80 max-w-full" />
      <Skeleton className="mb-8 h-36 w-full" />
      <Skeleton className="mb-8 h-64 w-full" />
      <div className="brains-grid">
        {[1, 2, 3, 4].map((id) => (
          <Skeleton key={id} className="h-60" />
        ))}
      </div>
    </div>
  );
}
