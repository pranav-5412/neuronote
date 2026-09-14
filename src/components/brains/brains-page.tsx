"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Brain } from "lucide-react";
import { useWorkspace } from "@/state/workspace-provider";
import type { Brain as BrainModel } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { BrainCard } from "@/components/dashboard/brain-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyPanel } from "@/components/shared/empty-panel";
import { BrainForm } from "./brain-form";
import { BrainDetail } from "./brain-detail";
export function BrainsPage() {
  const { brains, dispatch } = useWorkspace();
  const params = useSearchParams();
  const router = useRouter();
  const [editing, setEditing] = useState<BrainModel | true | null>(null);
  const [deleting, setDeleting] = useState<BrainModel | null>(null);
  const id = params.get("brain");
  const selected = brains.find((brain) => brain.id === id);
  function closeForm() {
    setEditing(null);
    if (params.has("new")) router.replace("/my-brain");
  }
  const form = editing || params.get("new") === "true";
  return (
    <div className="section-page phase-two">
      {id ? (
        selected ? (
          <BrainDetail
            key={selected.id}
            brain={selected}
            onEdit={() => setEditing(selected)}
            onDelete={() => setDeleting(selected)}
          />
        ) : (
          <EmptyPanel
            title="This brain is no longer here."
            description="It may have been deleted, or this browser session was refreshed."
          >
            <Button onClick={() => router.push("/my-brain")}>All brains</Button>
          </EmptyPanel>
        )
      ) : (
        <>
          <div className="page-heading">
            <div>
              <div className="eyebrow">A PLACE FOR EVERY INTEREST</div>
              <h1>
                My Brain
                <span className="heading-count" aria-hidden="true">
                  {brains.length}
                </span>
              </h1>
              <p>Different subjects. One wonderfully connected mind.</p>
            </div>
            <Button onClick={() => setEditing(true)}>
              <Plus />
              New brain
            </Button>
          </div>
          <div className="workspace-strip">
            <Brain size={16} />
            <span>Your personal collection</span>
            <span className="muted">Local demo · Resets on refresh</span>
          </div>
          {brains.length ? (
            <div className="brains-grid managed-brains">
              {brains.map((brain) => (
                <div key={brain.id} className="managed-brain">
                  <BrainCard brain={brain} />
                  <div className="brain-card-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Rename ${brain.name}`}
                      onClick={() => setEditing(brain)}
                    >
                      <Pencil />
                      Edit / rename
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${brain.name}`}
                      onClick={() => setDeleting(brain)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel
              title="A fresh start for a curious mind."
              description="Create your first brain to give your study material a home."
            >
              <Button onClick={() => setEditing(true)}>
                <Plus />
                Create brain
              </Button>
            </EmptyPanel>
          )}
        </>
      )}
      {form && (
        <BrainForm
          brain={editing && editing !== true ? editing : undefined}
          onClose={closeForm}
        />
      )}
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title={`Delete ${deleting?.name ?? "brain"}?`}
        description="This removes the brain, all its documents, and associated demo study material from this session. This cannot be undone."
        onConfirm={() => {
          if (deleting) {
            dispatch({ type: "brain/delete", id: deleting.id });
            if (id === deleting.id) router.push("/my-brain");
          }
        }}
      />
    </div>
  );
}
