import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <div className="empty-state">
      <span className="eyebrow">A SMALL DETOUR</span>
      <h1>This page hasn’t taken shape.</h1>
      <p>Let’s head back to somewhere familiar.</p>
      <Button asChild>
        <Link href="/">Back to dashboard</Link>
      </Button>
    </div>
  );
}
