"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="empty-state" role="alert">
      <h2>A small interruption.</h2>
      <p>We couldn’t load this workspace. Give it another try.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
