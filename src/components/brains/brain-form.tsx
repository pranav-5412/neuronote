"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/state/workspace-provider";
import { categories, iconOptions } from "@/data/workspace-options";
import type { Brain, BrainIcon } from "@/types/workspace";
import { SubjectIcon } from "./subject-icon";
export function BrainForm({
  brain,
  onClose,
}: {
  brain?: Brain;
  onClose: () => void;
}) {
  const { state, dispatch, busy } = useWorkspace();
  const [name, setName] = useState(brain?.name ?? "");
  const [category, setCategory] = useState(brain?.category ?? "Biology");
  const [icon, setIcon] = useState<BrainIcon>(brain?.icon ?? "leaf");
  const [description, setDescription] = useState(brain?.description ?? "");
  const [error, setError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("Give your brain a name to get started.");
      return;
    }
    if (
      state.brains.some(
        (item) =>
          item.id !== brain?.id &&
          item.name.toLowerCase() === name.trim().toLowerCase(),
      )
    ) {
      setError("A brain with that name already exists.");
      return;
    }
    const saved = await dispatch({
      type: "brain/save",
      brain: {
        id: brain?.id,
        name: name.trim(),
        category,
        icon,
        description: description.trim(),
      },
    });
    if (saved) onClose();
    else
      setError(
        "Couldn’t save this brain. Check the workspace message and try again.",
      );
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="phase-dialog">
        <DialogTitle>
          {brain ? "Make it your own." : "Make room for a new interest."}
        </DialogTitle>
        <DialogDescription>
          Your ideas, organized and saved privately to your account.
        </DialogDescription>
        <form onSubmit={save} className="form-stack">
          <label>
            Brain name
            <input
              value={name}
              maxLength={50}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Mathematics"
              aria-invalid={!!error}
              aria-describedby={error ? "brain-error" : undefined}
            />
          </label>
          <label>
            Subject / category
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Choose an icon</legend>
            <div className="icon-picker">
              {iconOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-label={option.label}
                  aria-pressed={icon === option.id}
                  onClick={() => setIcon(option.id)}
                >
                  <SubjectIcon icon={option.id} />
                </button>
              ))}
            </div>
          </fieldset>
          <label>
            Description <span className="muted">(optional)</span>
            <textarea
              value={description}
              maxLength={220}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What will you explore here?"
              rows={3}
            />
          </label>
          {error && (
            <p id="brain-error" role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="form-actions">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {brain ? "Save changes" : "Create brain"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
