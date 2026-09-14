"use client";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useWorkspace } from "@/state/workspace-provider";
import type { StudyDocument } from "@/types/workspace";
export function DocumentActions({
  document: doc,
  onDelete,
}: {
  document: StudyDocument;
  onDelete?: () => void;
}) {
  const { state, dispatch, busy } = useWorkspace();
  const [action, setAction] = useState<"edit" | "delete" | null>(null);
  const [name, setName] = useState(doc.name);
  const [brainId, setBrainId] = useState(doc.brainId);
  const [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Enter a document name.");
      return;
    }
    if (
      state.documents.some(
        (item) =>
          item.id !== doc.id &&
          item.brainId === brainId &&
          item.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError("A document with this name already exists in that brain.");
      return;
    }
    const saved = await dispatch({
      type: "document/update",
      id: doc.id,
      patch: { name: name.trim(), brainId },
    });
    if (saved) setAction(null);
    else setError("Couldn’t save this document. Please try again.");
  }
  return (
    <>
      <div className="document-actions">
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Rename or move ${doc.name}`}
          onClick={() => {
            setName(doc.name);
            setBrainId(doc.brainId);
            setError("");
            setAction("edit");
          }}
        >
          <Pencil />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${doc.name}`}
          onClick={() => setAction("delete")}
        >
          <Trash2 />
        </Button>
      </div>
      <Dialog
        open={action === "edit"}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
      >
        <DialogContent>
          <DialogTitle>A little more organized.</DialogTitle>
          <DialogDescription>
            Rename this document or move it to another brain.
          </DialogDescription>
          <form onSubmit={save} className="form-stack">
            <label>
              Document name
              <input
                value={name}
                maxLength={180}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={!!error}
              />
            </label>
            <label>
              Move to brain
              <select
                value={brainId}
                onChange={(event) => setBrainId(event.target.value)}
              >
                {state.brains.map((brain) => (
                  <option key={brain.id} value={brain.id}>
                    {brain.name}
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="form-actions">
              <Button
                variant="outline"
                type="button"
                onClick={() => setAction(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                Save changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={action === "delete"}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        title="Delete this document?"
        description={`“${doc.name}” and its private file will be permanently removed. This cannot be undone.`}
        onConfirm={async () => {
          const saved = await dispatch({ type: "document/delete", id: doc.id });
          if (saved) onDelete?.();
          return saved;
        }}
      />
    </>
  );
}
