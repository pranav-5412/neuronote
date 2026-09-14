"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  label = "Delete",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | boolean | Promise<void | boolean>;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!pending) {
          setFailed(false);
          onOpenChange(value);
        }
      }}
    >
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="leading-relaxed">
          {description}
        </DialogDescription>
        {failed && (
          <p className="form-error" role="alert">
            The action couldn’t finish. Close this dialog to see the workspace
            message, then try again.
          </p>
        )}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              setFailed(false);
              onOpenChange(false);
            }}
            autoFocus
          >
            Cancel
          </Button>
          <Button
            variant={label === "Delete" ? "destructive" : "default"}
            disabled={pending}
            onClick={async () => {
              setPending(true);
              setFailed(false);
              try {
                const result = await onConfirm();
                if (result !== false) onOpenChange(false);
                else setFailed(true);
              } catch {
                setFailed(true);
              } finally {
                setPending(false);
              }
            }}
          >
            {pending ? "Working…" : label}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
