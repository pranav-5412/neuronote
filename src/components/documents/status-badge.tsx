import { Check, CircleAlert, LoaderCircle, Clock3 } from "lucide-react";
import type { DocumentStatus } from "@/types/workspace";
import { processingSteps } from "@/types/workspace";
export function StatusBadge({ status }: { status: DocumentStatus }) {
  const Icon =
    status === "Complete"
      ? Check
      : status === "Failed"
        ? CircleAlert
        : status === "Waiting"
          ? Clock3
          : LoaderCircle;
  return (
    <span
      className={`status-badge ${status === "Complete" ? "complete" : status === "Failed" ? "failed" : "processing"}`}
    >
      <Icon size={12} />
      {status}
    </span>
  );
}
export function ProcessingProgress({ status }: { status: DocumentStatus }) {
  const progress =
    status === "Failed"
      ? 55
      : (Math.max(0, processingSteps.indexOf(status)) / 9) * 100;
  return (
    <div
      className="processing-progress"
      role="progressbar"
      aria-label="Simulated document processing"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-valuetext={status}
    >
      <div style={{ width: `${progress}%` }} />
    </div>
  );
}
