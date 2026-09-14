import { Skeleton } from "@/components/ui/skeleton";
export default function AuthLoading() {
  return (
    <div className="auth-loading" role="status">
      <span className="sr-only">Preparing secure sign-in…</span>
      <Skeleton className="h-10 w-64 mb-6" />
      <Skeleton className="h-80 w-80 max-w-full" />
    </div>
  );
}
