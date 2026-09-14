"use client";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";
import { Button } from "@/components/ui/button";
import { StatusBadge, ProcessingProgress } from "./status-badge";
export function ProcessingQueue({ brainId }: { brainId?: string }) {
  const { state, dispatch } = useWorkspace();
  const pending = state.documents.filter(
    (doc) => doc.status !== "Complete" && (!brainId || doc.brainId === brainId),
  );
  if (!pending.length) return null;
  return (
    <section className="processing-panel" aria-label="Processing queue">
      <div className="section-title">
        <h2>
          A few connections in the making{" "}
          <span className="count-pill">{pending.length}</span>
        </h2>
        <span className="subtle-label">SIMULATED PROCESSING</span>
      </div>
      {pending.map((doc) => (
        <div className="processing-item" key={doc.id}>
          <div>
            <Link href={`/documents?document=${doc.id}`}>{doc.name}</Link>
            <p>
              {doc.status === "Failed"
                ? doc.error
                : "A frontend preview. No file upload, parsing, or AI requests."}
            </p>
            <ProcessingProgress status={doc.status} />
          </div>
          <StatusBadge status={doc.status} />
          {doc.status === "Failed" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                dispatch({ type: "document/reprocess", id: doc.id })
              }
            >
              <RefreshCw />
              Retry
            </Button>
          )}
        </div>
      ))}
    </section>
  );
}
