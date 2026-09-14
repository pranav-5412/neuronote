import "server-only";
import { getSessionContext } from "./session";
import { PublicError } from "@/lib/result";
import type { Tables } from "@/types/database";
import type {
  Brain,
  StudyDocument,
  WorkspaceSnapshot,
} from "@/types/workspace";
export function brainModel(row: Tables<"brains">): Brain {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    icon: row.icon as Brain["icon"],
    tone: row.tone as Brain["tone"],
    mastery: 0,
    streak: 0,
    lastStudied: null,
  };
}
export function documentModel(row: Tables<"documents">): StudyDocument {
  return {
    id: row.id,
    brainId: row.brain_id,
    name: row.display_name,
    type: row.file_type,
    size: row.file_size,
    pages: row.page_count,
    uploadedAt: row.created_at,
    status: (
      {
        uploading: "Uploading",
        uploaded: "Uploaded",
        upload_failed: "Failed",
        deleting: "Deleting",
        delete_failed: "Delete failed",
        queued: "Waiting",
        processing: "Waiting",
        complete: "Complete",
        failed: "Failed",
      } as const
    )[row.processing_status],
    flashcards: 0,
    quizzes: 0,
    extractedText: "",
    error: row.processing_error ?? undefined,
  };
}
export async function getWorkspace(): Promise<WorkspaceSnapshot> {
  const { client, user } = await getSessionContext();
  const [profile, brains, documents] = await Promise.all([
    client.from("profiles").select("*").eq("id", user.id).single(),
    client
      .from("brains")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    client
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);
  if (profile.error || brains.error || documents.error) {
    console.error("[NeuroNote] Workspace query failed", {
      profile: profile.error?.code,
      brains: brains.error?.code,
      documents: documents.error?.code,
    });
    throw new PublicError(
      "We couldn’t load your workspace. Check the connection and try again.",
      503,
    );
  }
  return {
    profile: {
      id: user.id,
      displayName: profile.data.display_name,
      avatarUrl: profile.data.avatar_url,
      email: user.email ?? "",
    },
    state: {
      brains: brains.data.map(brainModel),
      documents: documents.data.map(documentModel),
      concepts: [],
      topics: [],
    },
  };
}
