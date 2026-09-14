"use client";
import Link from "next/link";
import { useWorkspace } from "@/state/workspace-provider";
import { StatusBadge } from "./status-badge";
export function ProcessingQueue({ brainId }: { brainId?: string }) {
  const { state } = useWorkspace();
  const pending = state.documents.filter(
    (doc) =>
      !["Complete", "Uploaded"].includes(doc.status) &&
      (!brainId || doc.brainId === brainId),
  );
  if (!pending.length) return null;
  return (
    <section className="processing-panel" aria-label="Document status">
      <div className="section-title">
        <h2>
          Document activity <span className="count-pill">{pending.length}</span>
        </h2>
      </div>
      {pending.map((doc) => (
        <div className="processing-item" key={doc.id}>
          <div>
            <Link href={`/documents?document=${doc.id}`}>{doc.name}</Link>
            <p>
              {doc.error ||
                "Upload in progress. If interrupted, remove this document after two minutes and upload again."}
            </p>
          </div>
          <StatusBadge status={doc.status} />
        </div>
      ))}
    </section>
  );
}
