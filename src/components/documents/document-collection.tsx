"use client";
import Link from "next/link";
import { FileText, ArrowUpRight } from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";
import type { StudyDocument } from "@/types/workspace";
import { formatDate, formatSize } from "@/lib/document-utils";
import { StatusBadge, ProcessingProgress } from "./status-badge";
import { DocumentActions } from "./document-actions";
export function DocumentCollection({
  documents,
  view = "list",
}: {
  documents: StudyDocument[];
  view?: "grid" | "list";
}) {
  const { state } = useWorkspace();
  return (
    <div className={`document-collection ${view}`}>
      <div className="document-list-heading">
        <span>DOCUMENT</span>
        <span>BRAIN & ADDED</span>
        <span>STUDY MATERIAL</span>
        <span>STATUS & ACTIONS</span>
      </div>
      {documents.map((doc) => (
        <article key={doc.id} className="document-entry">
          <div className="document-identity">
            <span className="file-icon">
              <FileText size={22} />
              <small>
                {doc.type === "Pasted text"
                  ? "TEXT"
                  : doc.type === "Markdown"
                    ? "MD"
                    : doc.type}
              </small>
            </span>
            <div>
              <Link
                href={`/documents?document=${doc.id}`}
                className="document-title"
              >
                {doc.name}
                <ArrowUpRight size={13} />
              </Link>
              <p>
                {formatSize(doc.size)}
                {doc.pages
                  ? ` · ${doc.pages} ${doc.type === "PPTX" ? "slides" : "pages"}`
                  : " · Page count unavailable"}
              </p>
            </div>
          </div>
          <div className="document-origin">
            <Link href={`/my-brain?brain=${doc.brainId}`}>
              {state.brains.find((brain) => brain.id === doc.brainId)?.name}
            </Link>
            <time dateTime={doc.uploadedAt}>{formatDate(doc.uploadedAt)}</time>
          </div>
          <div className="document-counts">
            <span>
              {
                state.concepts.filter(
                  (concept) => concept.documentId === doc.id,
                ).length
              }{" "}
              concepts
            </span>
            <span>{doc.flashcards} flashcards</span>
          </div>
          <div className="document-state">
            <StatusBadge status={doc.status} />
            {(doc.status === "Uploading" || doc.status === "Deleting") && (
              <ProcessingProgress status={doc.status} />
            )}
            <DocumentActions document={doc} />
          </div>
        </article>
      ))}
    </div>
  );
}
