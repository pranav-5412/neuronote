import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import type { DocumentStatus } from "@/types/workspace";
export function StatusBadge({ status }: { status: DocumentStatus }) {
  const ready = status === "Complete" || status === "Uploaded";
  const failed =
    status === "Failed" ||
    status === "Delete failed" ||
    status === "Unsupported";
  const Icon = ready ? Check : failed ? CircleAlert : LoaderCircle;
  return (
    <span
      className={`status-badge ${ready ? "complete" : failed ? "failed" : "processing"}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}
export function ProcessingProgress({ status }: { status: DocumentStatus }) {
  return (
    <div
      className="processing-progress"
      role="progressbar"
      aria-label={status}
      aria-valuetext={status}
    >
      <div className="indeterminate" />
    </div>
  );
}
