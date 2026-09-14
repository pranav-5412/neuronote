"use client";
import { useRef, useState } from "react";
import { Upload, Plus, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/state/workspace-provider";

import {
  fileAccept,
  fileType,
  formatSize,
  MAX_FILE_SIZE,
} from "@/lib/document-utils";
type QueuedDocument = {
  id: string;
  name: string;
  type: string;
  size: number;
  file: File;
  pasted?: boolean;
  status: string;
};
export function UploadDialog({
  onClose,
  initialBrainId,
}: {
  onClose: () => void;
  initialBrainId?: string;
}) {
  const { state, refresh } = useWorkspace();
  const [brainId, setBrainId] = useState(
    initialBrainId ?? state.brains[0]?.id ?? "",
  );
  const [queue, setQueue] = useState<QueuedDocument[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [mode, setMode] = useState<"files" | "text">("files");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [drag, setDrag] = useState(false);
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  function addFiles(files: File[]) {
    const next: QueuedDocument[] = [];
    const issues: string[] = [];
    for (const file of files) {
      const type = fileType(file.name);
      if (!type) {
        issues.push(`${file.name}: this format is not supported.`);
        continue;
      }
      if (!file.size || file.size > MAX_FILE_SIZE) {
        issues.push(`${file.name}: choose a non-empty file under 25 MB.`);
        continue;
      }
      if (
        queue.some((doc) => doc.name === file.name && doc.size === file.size) ||
        next.some((doc) => doc.name === file.name && doc.size === file.size)
      ) {
        issues.push(`${file.name}: already in the queue.`);
        continue;
      }
      if (queue.length + next.length >= 20) {
        issues.push("Queue limit: 20 documents at a time.");
        break;
      }
      next.push({
        id: crypto.randomUUID(),
        name: file.name,
        type,
        size: file.size,
        file,
        status: "Waiting",
      });
    }
    setQueue((value) => [...value, ...next]);
    setErrors(issues);
  }
  function addText() {
    if (!title.trim() || !text.trim()) {
      setErrors(["Add a title and some text first."]);
      return;
    }
    if (queue.length >= 20) {
      setErrors(["Queue limit: 20 documents at a time."]);
      return;
    }
    setQueue((value) => [
      ...value,
      {
        id: crypto.randomUUID(),
        name: title.trim(),
        type: "Pasted text",
        size: new Blob([text]).size,
        file: new File(
          [text.trim()],
          `${title.trim().replace(/[\\/]/g, "-")}.txt`,
          { type: "text/plain" },
        ),
        pasted: true,
        status: "Waiting",
      },
    ]);
    setTitle("");
    setText("");
    setErrors([]);
  }
  async function start() {
    if (pending || !brainId) return;
    setPending(true);
    setErrors([]);
    for (const doc of queue.filter((item) => item.status === "Waiting")) {
      setQueue((items) =>
        items.map((item) =>
          item.id === doc.id ? { ...item, status: "Uploading" } : item,
        ),
      );
      const body = new FormData();
      body.set("file", doc.file);
      body.set("brainId", brainId);
      body.set("pasted", String(!!doc.pasted));
      try {
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          body,
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(
            result.error ||
              "Upload failed. Check the library before uploading again.",
          );
        setQueue((items) =>
          items.map((item) =>
            item.id === doc.id
              ? {
                  ...item,
                  status:
                    result.processing?.status === "complete"
                      ? "Complete"
                      : result.processing?.status === "unsupported"
                        ? "Unsupported"
                        : "Needs attention",
                }
              : item,
          ),
        );
      } catch (error) {
        setQueue((items) =>
          items.map((item) =>
            item.id === doc.id ? { ...item, status: "Failed" } : item,
          ),
        );
        setErrors((items) => [
          ...items,
          `${doc.name}: ${error instanceof Error ? error.message : "Upload failed."}`,
        ]);
      }
    }
    await refresh();
    setPending(false);
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) onClose();
      }}
    >
      <DialogContent className="phase-dialog upload-dialog">
        <DialogTitle>Give your ideas a starting point.</DialogTitle>
        <DialogDescription>
          Store study material privately in your brain. PDF, TXT, and Markdown
          files are extracted automatically.
        </DialogDescription>
        <div className="form-stack">
          <label>
            Add to brain
            <select
              disabled={pending}
              value={brainId}
              onChange={(event) => setBrainId(event.target.value)}
            >
              <option value="" disabled>
                Choose a brain
              </option>
              {state.brains.map((brain) => (
                <option key={brain.id} value={brain.id}>
                  {brain.name}
                </option>
              ))}
            </select>
          </label>
          {!state.brains.length && (
            <p className="form-error">
              Create a brain before adding documents.
            </p>
          )}
          <div className="segmented-control">
            <button
              aria-pressed={mode === "files"}
              onClick={() => setMode("files")}
            >
              Upload files
            </button>
            <button
              aria-pressed={mode === "text"}
              onClick={() => setMode("text")}
            >
              Paste text
            </button>
          </div>
          {mode === "files" ? (
            <div
              className={`drop-zone ${drag ? "dragging" : ""}`}
              onDragOver={(event) => {
                event.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDrag(false);
                if (pending) return;
                addFiles(Array.from(event.dataTransfer.files));
              }}
            >
              <Upload size={28} />
              <strong>Drop a little knowledge here</strong>
              <p>or choose files from your device</p>
              <Button
                variant="outline"
                disabled={pending}
                onClick={() => input.current?.click()}
              >
                Browse files
              </Button>
              <input
                ref={input}
                type="file"
                className="sr-only"
                aria-label="Choose study files"
                multiple
                accept={fileAccept}
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
              <small>
                PDF, DOCX, PPTX, TXT, Markdown, PNG, JPG, WEBP, GIF
                <br />
                Up to 25 MB each · 20 files per queue
              </small>
            </div>
          ) : (
            <div className="form-stack">
              <label>
                Text title
                <input
                  value={title}
                  maxLength={180}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Notes from today’s lecture"
                />
              </label>
              <label>
                Your text
                <textarea
                  value={text}
                  maxLength={50000}
                  rows={5}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste your study material…"
                />
              </label>
              <Button variant="outline" disabled={pending} onClick={addText}>
                <Plus />
                Add text to queue
              </Button>
            </div>
          )}
          {errors.length > 0 && (
            <div role="alert" className="form-error">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
          {queue.length > 0 && (
            <div className="upload-queue">
              <h3>
                Ready to add <span>{queue.length}</span>
              </h3>
              {queue.map((doc) => (
                <div className="queue-item" key={doc.id}>
                  <FileText size={16} />
                  <div>
                    <strong>{doc.name}</strong>
                    <small>
                      {doc.type} · {formatSize(doc.size)}
                    </small>
                  </div>
                  <span className="muted">{doc.status}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={pending}
                    aria-label={`Remove ${doc.name}`}
                    onClick={() =>
                      setQueue((items) =>
                        items.filter((item) => item.id !== doc.id),
                      )
                    }
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <div className="form-actions">
            <Button variant="outline" disabled={pending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={
                pending ||
                !queue.some((item) => item.status === "Waiting") ||
                !brainId
              }
              onClick={start}
            >
              {pending ? "Uploading…" : "Upload material"}
              {queue.length > 0 ? ` · ${queue.length}` : ""}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
