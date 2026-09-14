"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Upload,
  Search,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";
import { fileTypes } from "@/data/workspace-options";

import { Button } from "@/components/ui/button";
import { EmptyPanel } from "@/components/shared/empty-panel";
import { DocumentCollection } from "./document-collection";
import { UploadDialog } from "./upload-dialog";
import { ProcessingQueue } from "./processing-queue";
import { DocumentViewer } from "./document-viewer";
export function DocumentsPage() {
  const params = useSearchParams();
  const id = params.get("document");
  return id ? (
    <DocumentViewer key={id} id={id} />
  ) : (
    <div className="section-page phase-two">
      <DocumentLibrary initialBrainId={params.get("brain") ?? undefined} />
    </div>
  );
}
export function DocumentLibrary({
  initialBrainId,
  embedded = false,
}: {
  initialBrainId?: string;
  embedded?: boolean;
}) {
  const { state } = useWorkspace();
  const [upload, setUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [brain, setBrain] = useState(initialBrainId ?? "all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("list");
  const [filters, setFilters] = useState(false);
  const scope = state.documents.filter(
    (doc) => !embedded || doc.brainId === initialBrainId,
  );
  const docs = scope
    .filter(
      (doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase()) &&
        (brain === "all" || doc.brainId === brain) &&
        (type === "all" || doc.type === type) &&
        (status === "all" || doc.status === status),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "size"
          ? b.size - a.size
          : sort === "oldest"
            ? a.uploadedAt.localeCompare(b.uploadedAt)
            : b.uploadedAt.localeCompare(a.uploadedAt),
    );
  const active =
    search !== "" ||
    type !== "all" ||
    status !== "all" ||
    (!embedded && brain !== "all");
  return (
    <>
      <div className="page-heading">
        <div>
          {!embedded && (
            <div className="eyebrow">YOUR KNOWLEDGE STARTS HERE</div>
          )}
          {embedded ? (
            <h2 className="text-xl">Source material</h2>
          ) : (
            <h1>
              Documents
              <span className="heading-count" aria-hidden="true">
                {scope.length}
              </span>
            </h1>
          )}
          <p>A home for the pages, ideas, and notes you’re learning from.</p>
        </div>
        <Button onClick={() => setUpload(true)}>
          <Upload />
          Add documents
        </Button>
      </div>
      <div className="library-toolbar">
        <label className="library-search">
          <Search size={16} />
          <input
            aria-label="Search documents"
            placeholder="Find a document…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <Button
          variant="outline"
          className="filter-toggle"
          onClick={() => setFilters((value) => !value)}
          aria-expanded={filters}
        >
          <SlidersHorizontal />
          Filters{active ? " · active" : ""}
        </Button>
        <div className="view-toggle" aria-label="Document view">
          <Button
            variant="ghost"
            size="icon"
            aria-label="List view"
            aria-pressed={view === "list"}
            onClick={() => setView("list")}
          >
            <List />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            onClick={() => setView("grid")}
          >
            <LayoutGrid />
          </Button>
        </div>
      </div>
      <div className={`library-filters ${filters ? "expanded" : ""}`}>
        <div>
          {!embedded && (
            <label>
              Brain
              <select
                aria-label="Filter by brain"
                value={brain}
                onChange={(event) => setBrain(event.target.value)}
              >
                <option value="all">All brains</option>
                {state.brains.map((brain) => (
                  <option key={brain.id} value={brain.id}>
                    {brain.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Type
            <select
              aria-label="Filter by file type"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="all">All types</option>
              {fileTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="all">Any status</option>
              {[
                "Uploaded",
                "Uploading",
                "Failed",
                "Deleting",
                "Delete failed",
              ].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Sort
          <select
            aria-label="Sort documents"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
            <option value="size">Largest first</option>
          </select>
        </label>
      </div>
      <ProcessingQueue brainId={embedded ? initialBrainId : undefined} />
      <div className="library-count">
        <span>
          {docs.length} {docs.length === 1 ? "document" : "documents"}
          {active ? " match your filters" : ""}
        </span>
        {active && (
          <button
            onClick={() => {
              setSearch("");
              setBrain(embedded ? (initialBrainId ?? "all") : "all");
              setType("all");
              setStatus("all");
            }}
          >
            Clear filters
          </button>
        )}
        <span>Private · Saved to your account</span>
      </div>
      {docs.length ? (
        <DocumentCollection documents={docs} view={view} />
      ) : (
        <EmptyPanel
          title={
            scope.length
              ? "No documents found."
              : "Your next discovery starts with a page."
          }
          description={
            scope.length
              ? "Try another search or clear your filters."
              : "Add your first document or paste your lecture notes. Files are saved privately to your account."
          }
        >
          {scope.length ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setBrain(embedded ? (initialBrainId ?? "all") : "all");
                setType("all");
                setStatus("all");
              }}
            >
              Clear filters
            </Button>
          ) : (
            <Button onClick={() => setUpload(true)}>
              <Upload />
              Add documents
            </Button>
          )}
        </EmptyPanel>
      )}
      {upload && (
        <UploadDialog
          initialBrainId={brain === "all" ? undefined : brain}
          onClose={() => setUpload(false)}
        />
      )}
    </>
  );
}
