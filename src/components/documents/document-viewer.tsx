"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Maximize,
  Minimize,
  FileText,
} from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";

import { formatSize, formatDate } from "@/lib/document-utils";
import { Button } from "@/components/ui/button";
import { EmptyPanel } from "@/components/shared/empty-panel";
import { DocumentActions } from "./document-actions";
import { StatusBadge } from "./status-badge";
export function DocumentViewer({ id }: { id: string }) {
  const { state } = useWorkspace();
  const router = useRouter();
  const doc = state.documents.find((doc) => doc.id === id);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [tab, setTab] = useState<"preview" | "text">("preview");
  const [expanded, setExpanded] = useState(false);
  const viewer = useRef<HTMLDivElement>(null);
  const closeFullscreen = useRef<HTMLButtonElement>(null);
  if (!doc)
    return (
      <div className="section-page">
        <EmptyPanel
          title="This document is no longer here."
          description="It may have been deleted or moved to another account."
        >
          <Button asChild>
            <Link href="/documents">Back to documents</Link>
          </Button>
        </EmptyPanel>
      </div>
    );
  const brain = state.brains.find((brain) => brain.id === doc.brainId);
  const concepts = state.concepts.filter(
    (concept) => concept.documentId === doc.id,
  );
  const topics = state.topics.filter((topic) => topic.documentId === doc.id);
  const pages = doc.pages ?? 1;
  const ready = ["Complete", "Uploaded"].includes(doc.status);
  function toggleExpanded() {
    setExpanded((value) => !value);
    requestAnimationFrame(() => closeFullscreen.current?.focus());
  }
  return (
    <div className="section-page phase-two">
      <Link className="text-link mb-6" href="/documents">
        <ArrowLeft size={14} />
        Document library
      </Link>
      <div className="page-heading document-detail-heading">
        <div>
          <div className="eyebrow">{doc.type} · SOURCE MATERIAL</div>
          <h1>{doc.name}</h1>
          <p>
            {brain?.name} <span> / </span> Added {formatDate(doc.uploadedAt)}
          </p>
        </div>
        <DocumentActions
          document={doc}
          onDelete={() => router.push("/documents")}
        />
      </div>
      <div className="viewer-layout">
        <div
          ref={viewer}
          className={`viewer-main ${expanded ? "viewer-expanded" : ""}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") setExpanded(false);
            if (expanded && event.key === "Tab") {
              const controls = Array.from(
                viewer.current?.querySelectorAll<HTMLElement>(
                  'button:not([disabled]), [tabindex="0"]',
                ) ?? [],
              );
              const first = controls[0],
                last = controls.at(-1);
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
          role={expanded ? "dialog" : undefined}
          aria-modal={expanded ? true : undefined}
          aria-label="Document preview"
        >
          <div className="viewer-toolbar">
            <div className="segmented-control">
              <button
                aria-pressed={tab === "preview"}
                onClick={() => setTab("preview")}
              >
                Preview
              </button>
              <button
                aria-pressed={tab === "text"}
                onClick={() => setTab("text")}
              >
                Extracted text
              </button>
            </div>
            <div className="zoom-controls">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Zoom out"
                disabled={zoom <= 50}
                onClick={() => setZoom((value) => Math.max(50, value - 25))}
              >
                <Minus />
              </Button>
              <output aria-label="Zoom level">{zoom}%</output>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Zoom in"
                disabled={zoom >= 200}
                onClick={() => setZoom((value) => Math.min(200, value + 25))}
              >
                <Plus />
              </Button>
              <Button
                ref={closeFullscreen}
                variant="ghost"
                size="icon"
                aria-label={expanded ? "Exit fullscreen" : "Fullscreen preview"}
                onClick={toggleExpanded}
              >
                {expanded ? <Minimize /> : <Maximize />}
              </Button>
            </div>
          </div>
          <div className="viewer-canvas" tabIndex={0}>
            {tab === "preview" ? (
              <div
                className="document-paper"
                style={{ width: `${zoom}%`, fontSize: `${zoom / 100}rem` }}
              >
                <div className="paper-heading">
                  NEURONOTE <span>SOURCE PREVIEW</span>
                </div>
                <FileText size={35} />
                <h2>{doc.name}</h2>
                <p className="paper-subtitle">
                  {doc.pages
                    ? `Page ${page} of ${pages}`
                    : "Page count not available"}
                </p>
                <div className="paper-rule" />
                <h3>
                  {ready
                    ? (topics[0]?.name ?? "Your study material")
                    : "Your document, ready for a new perspective."}
                </h3>
                <p>
                  This is a document preview placeholder. The original file is
                  available to download. Rendering and text extraction arrive
                  later.
                </p>
                <div className="paper-lines" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
                <div className="paper-callout">
                  {ready
                    ? "Your original file is stored privately."
                    : "This upload needs attention. See its status in the side panel."}
                </div>
                <small>
                  {doc.type} · {formatSize(doc.size)} · SOURCE FILE
                </small>
              </div>
            ) : (
              <div
                className="extracted-text"
                style={{ fontSize: `${zoom / 100}rem` }}
              >
                <span className="inline-note">
                  Text extraction is planned for a later phase.
                </span>
                <pre>
                  Your original material is available using Download original.
                </pre>
              </div>
            )}
          </div>
          <div className="viewer-bottom">
            <span>
              {tab === "text"
                ? "Text view"
                : doc.pages
                  ? "Preview navigation"
                  : "Single placeholder · Page count unknown"}
            </span>
            <div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous page"
                disabled={page <= 1 || tab === "text"}
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft />
              </Button>
              <output aria-label="Current page">
                {page} / {pages}
              </output>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next page"
                disabled={page >= pages || tab === "text"}
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          </div>
        </div>
        <aside className="viewer-sidebar">
          <section>
            <h2>Document details</h2>
            <StatusBadge status={doc.status} />
            <dl>
              <dt>Brain</dt>
              <dd>
                <Link href={`/my-brain?brain=${doc.brainId}`}>
                  {brain?.name}
                </Link>
              </dd>
              <dt>Added</dt>
              <dd>{formatDate(doc.uploadedAt)}</dd>
              <dt>Type</dt>
              <dd>{doc.type}</dd>
              <dt>Size</dt>
              <dd>{formatSize(doc.size)}</dd>
              <dt>Pages / slides</dt>
              <dd>{doc.pages ?? "Unknown · no parsing"}</dd>
            </dl>
          </section>
          <section>
            {ready ? (
              <Button asChild variant="outline">
                <a href={`/api/documents/${doc.id}/download`}>
                  Download original
                </a>
              </Button>
            ) : (
              <p className="form-error">
                {doc.error || "This file is not ready to download."}
              </p>
            )}
          </section>
          <section>
            <h2>Detected topics</h2>
            {topics.length ? (
              topics.map((topic) => (
                <span className="topic-chip" key={topic.id}>
                  {topic.name}
                </span>
              ))
            ) : (
              <p className="muted">No topics yet.</p>
            )}
          </section>
          <section>
            <h2>
              Concepts <span className="count-pill">{concepts.length}</span>
            </h2>
            {concepts.length ? (
              concepts.map((concept) => (
                <div className="viewer-concept" key={concept.id}>
                  <strong>{concept.name}</strong>
                  <p>{concept.definition}</p>
                </div>
              ))
            ) : (
              <p className="muted">
                Concept extraction will be available in a later phase.
              </p>
            )}
          </section>
          <section>
            <h2>Study material</h2>
            <div className="material-counts">
              <div>
                <strong>{doc.flashcards}</strong>
                <span>Flashcards</span>
              </div>
              <div>
                <strong>{doc.quizzes}</strong>
                <span>Quizzes</span>
              </div>
            </div>
            <p className="inline-note">
              Study generation will be available in a later phase.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
