"use server";
import { getWorkspace } from "@/lib/repositories/workspace";
import {
  saveBrain,
  deleteBrain,
  updateDocument,
  updateProfile,
} from "@/lib/repositories/mutations";
import { deleteDocument } from "@/lib/services/documents";
import { failure, type Result } from "@/lib/result";
import type { WorkspaceSnapshot } from "@/types/workspace";
import type { WorkspaceAction } from "@/state/workspace-actions";
export async function loadWorkspace(): Promise<Result<WorkspaceSnapshot>> {
  try {
    return { ok: true, data: await getWorkspace() };
  } catch (error) {
    return failure(error);
  }
}
export async function mutateWorkspace(
  action: WorkspaceAction,
): Promise<Result> {
  try {
    switch (action.type) {
      case "brain/save":
        await saveBrain(action.brain);
        break;
      case "brain/delete":
        await deleteBrain(action.id);
        break;
      case "document/update":
        await updateDocument({ id: action.id, ...action.patch });
        break;
      case "document/delete":
        await deleteDocument(action.id);
        break;
      case "profile/update":
        await updateProfile({ displayName: action.displayName });
        break;
      default:
        return { ok: false, error: "This action is not available." };
    }
    return { ok: true, data: undefined };
  } catch (error) {
    return failure(error);
  }
}
