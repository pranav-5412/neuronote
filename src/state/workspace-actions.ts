import type { BrainInput } from "@/types/workspace";
export type WorkspaceAction =
  | { type: "brain/save"; brain: BrainInput & { id?: string } }
  | { type: "brain/delete"; id: string }
  | {
      type: "document/update";
      id: string;
      patch: { name: string; brainId: string };
    }
  | { type: "document/delete"; id: string }
  | { type: "profile/update"; displayName: string };
