"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
export function WorkspaceLoadError() {
  const router = useRouter();
  return (
    <main className="empty-state">
      <h1>A small interruption.</h1>
      <p>
        We couldn’t load your workspace. Check your connection and Supabase
        setup, then try again.
      </p>
      <Button onClick={() => router.refresh()}>Try again</Button>
    </main>
  );
}
