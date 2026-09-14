"use client";
import { createContext, useContext, useMemo, useState, useRef } from "react";
import { loadWorkspace, mutateWorkspace } from "@/actions/workspace";
import type {
  BrainSummary,
  WorkspaceSnapshot,
  WorkspaceState,
  UserProfile,
} from "@/types/workspace";
import type { WorkspaceAction } from "./workspace-actions";
const WorkspaceContext = createContext<{
  state: WorkspaceState;
  profile: UserProfile;
  dispatch: (action: WorkspaceAction) => Promise<boolean>;
  refresh: () => Promise<boolean>;
  brains: BrainSummary[];
  busy: boolean;
  error: string;
  clearError: () => void;
} | null>(null);
export function WorkspaceProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: WorkspaceSnapshot;
}) {
  const [snapshot, setSnapshot] = useState(initialData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const latest = useRef(0);
  const mutationLock = useRef(false);
  async function refresh() {
    const version = ++latest.current;
    try {
      const result = await loadWorkspace();
      if (version !== latest.current) return result.ok;
      if (result.ok) {
        setSnapshot(result.data);
        return true;
      }
      setError(result.error);
    } catch {
      setError(
        "Connection interrupted. Refresh to load your latest saved changes.",
      );
    }
    return false;
  }
  async function dispatch(action: WorkspaceAction) {
    if (mutationLock.current) return false;
    mutationLock.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await mutateWorkspace(action);
      if (!result.ok) {
        setError(result.error);
        return false;
      }
      if (!(await refresh()))
        setError(
          "Your change was saved, but the latest data could not be loaded. Refresh this page.",
        );
      return true;
    } catch {
      setError(
        "The connection was interrupted. Refresh before retrying to check whether your change was saved.",
      );
      return false;
    } finally {
      mutationLock.current = false;
      setBusy(false);
    }
  }
  const { state, profile } = snapshot;
  const brains = useMemo<BrainSummary[]>(
    () =>
      state.brains.map((brain) => {
        const docs = state.documents.filter((doc) => doc.brainId === brain.id);
        const ids = new Set(docs.map((doc) => doc.id));
        return {
          ...brain,
          documents: docs.length,
          concepts: state.concepts.filter((concept) =>
            ids.has(concept.documentId),
          ).length,
          flashcards: docs.reduce((sum, doc) => sum + doc.flashcards, 0),
          updated: brain.lastStudied
            ? new Date(brain.lastStudied).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                timeZone: "UTC",
              })
            : "Not studied yet",
        };
      }),
    [state],
  );
  return (
    <WorkspaceContext.Provider
      value={{
        state,
        profile,
        dispatch,
        refresh,
        brains,
        busy,
        error,
        clearError: () => setError(""),
      }}
    >
      {error && (
        <div className="workspace-feedback" role="alert">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss message">
            Dismiss
          </button>
        </div>
      )}
      {children}
    </WorkspaceContext.Provider>
  );
}
export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("WorkspaceProvider is required");
  return context;
}
